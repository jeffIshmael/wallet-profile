// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title WalletProfileAttestation
/// @notice Stores hashed financial report attestations and verification codes on Celo.
/// @dev Placeholder — extend with payment gating (x402), report hash storage, and issuer roles.
contract WalletProfileAttestation {
    struct Attestation {
        address wallet;
        bytes32 reportHash;
        uint256 financialHealthScore;
        uint256 reputationScore;
        uint256 timestamp;
    }

    mapping(bytes32 => Attestation) public attestations;

    event AttestationStored(bytes32 indexed verificationCode, address indexed wallet, bytes32 reportHash);

    function storeAttestation(
        bytes32 verificationCode,
        address wallet,
        bytes32 reportHash,
        uint256 financialHealthScore,
        uint256 reputationScore
    ) external {
        attestations[verificationCode] = Attestation({
            wallet: wallet,
            reportHash: reportHash,
            financialHealthScore: financialHealthScore,
            reputationScore: reputationScore,
            timestamp: block.timestamp
        });

        emit AttestationStored(verificationCode, wallet, reportHash);
    }

    function getAttestation(bytes32 verificationCode) external view returns (Attestation memory) {
        return attestations[verificationCode];
    }
}
