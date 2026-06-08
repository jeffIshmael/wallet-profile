// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {WalletProfileAttestation} from "../src/WalletProfileAttestation.sol";

contract WalletProfileAttestationTest is Test {
    WalletProfileAttestation attestation;
    bytes32 constant CODE = keccak256("WP-TEST");
    bytes32 constant HASH = keccak256("report-hash");

    function setUp() public {
        attestation = new WalletProfileAttestation();
    }

    function test_StoreAndReadAttestation() public {
        attestation.storeAttestation(CODE, address(0xBEEF), HASH, 89, 92);

        WalletProfileAttestation.Attestation memory stored = attestation.getAttestation(CODE);
        assertEq(stored.wallet, address(0xBEEF));
        assertEq(stored.reportHash, HASH);
        assertEq(stored.financialHealthScore, 89);
        assertEq(stored.reputationScore, 92);
    }
}
