// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/// @title OnchainReporter
/// @notice OnFRA financial attestation registry for verified Wallet Analyst reports.
/// @dev Upgradeable (UUPS). Report IDs are opaque codes: REP- + 10 uppercase alphanumeric chars.
contract OnchainReporter is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable
{
    bytes32 public constant REPORTER_ROLE = keccak256("REPORTER_ROLE");
    uint256 private constant REPORT_ID_LENGTH = 14;

    struct FinancialAttestation {
        address wallet;
        address buyer;
        uint8 reputationScore;
        uint8 financialHealthScore;
        string loanCapacity;
        string reportHash;
        uint256 publishedAt;
    }

    struct Purchase {
        address buyer;
        uint256 timestamp;
        string reportHash;
    }

    address private _reporter;
    uint256 private _reportCount;
    mapping(string => FinancialAttestation) private _reports;
    mapping(string => Purchase) private _purchases;
    mapping(address => string[]) private _walletReportIds;
    mapping(bytes32 => string) private _reportHashToId;

    event FinancialReportPublished(
        bytes32 indexed reportIdHash,
        string reportId,
        address indexed wallet,
        address indexed buyer,
        uint8 reputationScore,
        uint8 financialHealthScore,
        string loanCapacity,
        string reportHash,
        uint256 timestamp
    );

    error InvalidWallet();
    error InvalidBuyer();
    error InvalidScore();
    error InvalidReportHash();
    error InvalidReportId();
    error ReportNotFound();
    error ReportHashAlreadyUsed();
    error ReportIdAlreadyUsed();
    error InvalidReporter();

    event ReporterUpdated(address indexed previousReporter, address indexed newReporter);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @param admin Receives DEFAULT_ADMIN_ROLE and upgrade authority.
    /// @param initialReporter Backend relayer allowed to publish attestations.
    function initialize(address admin, address initialReporter) external initializer {
        if (admin == address(0) || initialReporter == address(0)) revert InvalidBuyer();

        __AccessControl_init();
        __Pausable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REPORTER_ROLE, initialReporter);
        _reporter = initialReporter;
    }

    /// @notice Replace the backend reporter address. Callable only by the contract admin.
    function setReporter(address newReporter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newReporter == address(0)) revert InvalidReporter();

        address previousReporter = _reporter;
        if (newReporter == previousReporter) revert InvalidReporter();

        if (previousReporter != address(0)) {
            _revokeRole(REPORTER_ROLE, previousReporter);
        }

        _grantRole(REPORTER_ROLE, newReporter);
        _reporter = newReporter;

        emit ReporterUpdated(previousReporter, newReporter);
    }

    /// @notice Current address authorized to publish financial reports.
    function reporter() external view returns (address) {
        return _reporter;
    }

    /// @notice Publish a verified financial report attestation for a wallet.
    /// @param reportId Opaque verification code in the form REP-XXXXXXXXXX (10 uppercase A-Z / 0-9).
    /// @param reportHash IPFS CID or content hash of the generated PDF report.
    function publishFinancialReport(
        address wallet,
        address buyer,
        uint8 reputationScore,
        uint8 financialHealthScore,
        string calldata loanCapacity,
        string calldata reportId,
        string calldata reportHash
    ) external onlyRole(REPORTER_ROLE) whenNotPaused {
        if (wallet == address(0)) revert InvalidWallet();
        if (buyer == address(0)) revert InvalidBuyer();
        if (reputationScore > 100 || financialHealthScore > 100) revert InvalidScore();
        if (bytes(reportHash).length == 0) revert InvalidReportHash();
        _validateReportId(reportId);

        if (_reports[reportId].wallet != address(0)) revert ReportIdAlreadyUsed();

        bytes32 hashKey = keccak256(bytes(reportHash));
        if (bytes(_reportHashToId[hashKey]).length != 0) revert ReportHashAlreadyUsed();

        _reportCount++;

        _reports[reportId] = FinancialAttestation({
            wallet: wallet,
            buyer: buyer,
            reputationScore: reputationScore,
            financialHealthScore: financialHealthScore,
            loanCapacity: loanCapacity,
            reportHash: reportHash,
            publishedAt: block.timestamp
        });

        _purchases[reportId] = Purchase({
            buyer: buyer,
            timestamp: block.timestamp,
            reportHash: reportHash
        });

        _walletReportIds[wallet].push(reportId);
        _reportHashToId[hashKey] = reportId;

        emit FinancialReportPublished(
            keccak256(bytes(reportId)),
            reportId,
            wallet,
            buyer,
            reputationScore,
            financialHealthScore,
            loanCapacity,
            reportHash,
            block.timestamp
        );
    }

    /// @notice Verify a report by its opaque report ID (REP-XXXXXXXXXX).
    function verifyReport(string calldata reportId)
        external
        view
        returns (bool exists, FinancialAttestation memory attestation)
    {
        if (!_isValidReportIdFormat(reportId)) {
            return (false, attestation);
        }

        attestation = _reports[reportId];
        exists = attestation.wallet != address(0);
    }

    /// @notice Verify a report by its IPFS/content hash.
    function verifyReportByHash(string calldata reportHash)
        external
        view
        returns (bool exists, string memory reportId, FinancialAttestation memory attestation)
    {
        if (bytes(reportHash).length == 0) {
            return (false, reportId, attestation);
        }

        reportId = _reportHashToId[keccak256(bytes(reportHash))];
        if (bytes(reportId).length == 0) {
            return (false, reportId, attestation);
        }

        attestation = _reports[reportId];
        exists = attestation.wallet != address(0);
    }

    /// @notice Return the latest attestation for a wallet.
    function getProfile(address wallet) external view returns (FinancialAttestation memory latest) {
        string[] storage ids = _walletReportIds[wallet];
        if (ids.length == 0) revert ReportNotFound();
        latest = _reports[ids[ids.length - 1]];
    }

    /// @notice Return a specific report by opaque ID.
    function getReport(string calldata reportId) external view returns (FinancialAttestation memory attestation) {
        if (!_isValidReportIdFormat(reportId) || _reports[reportId].wallet == address(0)) {
            revert ReportNotFound();
        }
        attestation = _reports[reportId];
    }

    /// @notice Return purchase metadata for a report.
    function getPurchase(string calldata reportId) external view returns (Purchase memory purchase) {
        if (!_isValidReportIdFormat(reportId) || _reports[reportId].wallet == address(0)) {
            revert ReportNotFound();
        }
        purchase = _purchases[reportId];
    }

    /// @notice List all report IDs published for a wallet.
    function getWalletReportIds(address wallet) external view returns (string[] memory reportIds) {
        return _walletReportIds[wallet];
    }

    /// @notice Total number of published reports.
    function reportCount() external view returns (uint256) {
        return _reportCount;
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function _validateReportId(string calldata reportId) internal pure {
        if (!_isValidReportIdFormat(reportId)) revert InvalidReportId();
    }

    function _isValidReportIdFormat(string calldata reportId) internal pure returns (bool) {
        bytes memory id = bytes(reportId);
        if (id.length != REPORT_ID_LENGTH) return false;
        if (id[0] != "R" || id[1] != "E" || id[2] != "P" || id[3] != "-") return false;

        for (uint256 i = 4; i < REPORT_ID_LENGTH; i++) {
            bytes1 char = id[i];
            bool isDigit = char >= "0" && char <= "9";
            bool isUpper = char >= "A" && char <= "Z";
            if (!isDigit && !isUpper) return false;
        }

        return true;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    uint256[47] private __gap;
}
