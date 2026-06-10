// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/// @title OnchainReporter
/// @notice OnFRA financial attestation registry for verified Wallet Profile reports.
/// @dev Upgradeable (UUPS). Only authorized reporters can publish after backend payment verification.
contract OnchainReporter is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable
{
    bytes32 public constant REPORTER_ROLE = keccak256("REPORTER_ROLE");

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
    mapping(uint256 => FinancialAttestation) private _reports;
    mapping(uint256 => Purchase) private _purchases;
    mapping(address => uint256[]) private _walletReportIds;
    mapping(bytes32 => uint256) private _reportHashToId;

    event FinancialReportPublished(
        uint256 indexed reportId,
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
    error ReportNotFound();
    error ReportHashAlreadyUsed();
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
    /// @param newReporter New address granted REPORTER_ROLE; the previous reporter is revoked.
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
    /// @param wallet Subject wallet analyzed by OnFRA.
    /// @param buyer Wallet that purchased the official report.
    /// @param reputationScore Onchain reputation score (0-100).
    /// @param financialHealthScore Financial health score (0-100).
    /// @param loanCapacity Human-readable loan capacity label (e.g. "450 $").
    /// @param reportHash IPFS CID or content hash of the generated PDF report.
    function publishFinancialReport(
        address wallet,
        address buyer,
        uint8 reputationScore,
        uint8 financialHealthScore,
        string calldata loanCapacity,
        string calldata reportHash
    ) external onlyRole(REPORTER_ROLE) whenNotPaused returns (uint256 reportId) {
        if (wallet == address(0)) revert InvalidWallet();
        if (buyer == address(0)) revert InvalidBuyer();
        if (reputationScore > 100 || financialHealthScore > 100) revert InvalidScore();
        if (bytes(reportHash).length == 0) revert InvalidReportHash();

        bytes32 hashKey = keccak256(bytes(reportHash));
        if (_reportHashToId[hashKey] != 0) revert ReportHashAlreadyUsed();

        reportId = ++_reportCount;

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

    /// @notice Verify a report by onchain report id.
    function verifyReport(uint256 reportId)
        external
        view
        returns (bool exists, FinancialAttestation memory attestation)
    {
        if (reportId == 0 || reportId > _reportCount) {
            return (false, attestation);
        }

        attestation = _reports[reportId];
        exists = attestation.wallet != address(0);
    }

    /// @notice Verify a report by its IPFS/content hash.
    function verifyReportByHash(string calldata reportHash)
        external
        view
        returns (bool exists, uint256 reportId, FinancialAttestation memory attestation)
    {
        if (bytes(reportHash).length == 0) {
            return (false, 0, attestation);
        }

        reportId = _reportHashToId[keccak256(bytes(reportHash))];
        if (reportId == 0) {
            return (false, 0, attestation);
        }

        attestation = _reports[reportId];
        exists = attestation.wallet != address(0);
    }

    /// @notice Return the latest attestation for a wallet.
    function getProfile(address wallet) external view returns (FinancialAttestation memory latest) {
        uint256[] storage ids = _walletReportIds[wallet];
        if (ids.length == 0) revert ReportNotFound();
        latest = _reports[ids[ids.length - 1]];
    }

    /// @notice Return a specific report by id.
    function getReport(uint256 reportId) external view returns (FinancialAttestation memory attestation) {
        if (reportId == 0 || reportId > _reportCount) revert ReportNotFound();
        attestation = _reports[reportId];
    }

    /// @notice Return purchase metadata for a report.
    function getPurchase(uint256 reportId) external view returns (Purchase memory purchase) {
        if (reportId == 0 || reportId > _reportCount) revert ReportNotFound();
        purchase = _purchases[reportId];
    }

    /// @notice List all report ids published for a wallet.
    function getWalletReportIds(address wallet) external view returns (uint256[] memory reportIds) {
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

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    uint256[47] private __gap;
}
