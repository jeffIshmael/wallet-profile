// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {OnchainReporter} from "./OnchainReporter.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract OnchainReporterTest is Test {
    OnchainReporter internal implementation;
    OnchainReporter internal reporter;

    address internal admin = address(0xA11CE);
    address internal relayer = address(0xBEEF);
    address internal wallet = address(0x1234);
    address internal buyer = address(0x5678);

    string internal constant REPORT_ID = "REP-ABC12XY9Z0";

    function setUp() public {
        implementation = new OnchainReporter();
        bytes memory initData = abi.encodeCall(OnchainReporter.initialize, (admin, relayer));
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        reporter = OnchainReporter(address(proxy));
    }

    function test_publishFinancialReport() public {
        vm.prank(relayer);
        reporter.publishFinancialReport(
            wallet,
            buyer,
            86,
            82,
            "KES 45,000",
            REPORT_ID,
            "QmExampleReportHash"
        );

        assertEq(reporter.reportCount(), 1);

        (bool exists, OnchainReporter.FinancialAttestation memory attestation) = reporter.verifyReport(REPORT_ID);
        assertTrue(exists);
        assertEq(attestation.wallet, wallet);
        assertEq(attestation.buyer, buyer);
        assertEq(attestation.reputationScore, 86);
        assertEq(attestation.financialHealthScore, 82);
        assertEq(attestation.loanCapacity, "KES 45,000");
        assertEq(attestation.reportHash, "QmExampleReportHash");
    }

    function test_getProfileReturnsLatestReport() public {
        vm.startPrank(relayer);
        reporter.publishFinancialReport(wallet, buyer, 70, 68, "USD 1,000", "REP-FIRST00001", "QmFirst");
        reporter.publishFinancialReport(wallet, buyer, 86, 82, "KES 45,000", "REP-SECOND0002", "QmSecond");
        vm.stopPrank();

        OnchainReporter.FinancialAttestation memory latest = reporter.getProfile(wallet);
        assertEq(latest.reportHash, "QmSecond");
        assertEq(latest.reputationScore, 86);
    }

    function test_verifyReportByHash() public {
        vm.prank(relayer);
        reporter.publishFinancialReport(wallet, buyer, 75, 71, "USD 2,500", REPORT_ID, "QmVerifyMe");

        (bool exists, string memory reportId, OnchainReporter.FinancialAttestation memory attestation) =
            reporter.verifyReportByHash("QmVerifyMe");

        assertTrue(exists);
        assertEq(reportId, REPORT_ID);
        assertEq(attestation.wallet, wallet);
    }

    function test_revertsWhenNonReporterPublishes() public {
        vm.prank(buyer);
        vm.expectRevert();
        reporter.publishFinancialReport(wallet, buyer, 80, 80, "USD 500", REPORT_ID, "QmUnauthorized");
    }

    function test_revertsOnInvalidReportId() public {
        vm.prank(relayer);
        vm.expectRevert(OnchainReporter.InvalidReportId.selector);
        reporter.publishFinancialReport(wallet, buyer, 80, 80, "USD 500", "REP-1", "QmBadId");
    }

    function test_revertsOnDuplicateReportId() public {
        vm.startPrank(relayer);
        reporter.publishFinancialReport(wallet, buyer, 80, 80, "USD 500", REPORT_ID, "QmFirst");
        vm.expectRevert(OnchainReporter.ReportIdAlreadyUsed.selector);
        reporter.publishFinancialReport(wallet, buyer, 81, 81, "USD 600", REPORT_ID, "QmSecond");
        vm.stopPrank();
    }

    function test_adminCanChangeReporter() public {
        address newRelayer = address(0xCAFE);

        vm.prank(admin);
        reporter.setReporter(newRelayer);

        assertEq(reporter.reporter(), newRelayer);
        assertFalse(reporter.hasRole(reporter.REPORTER_ROLE(), relayer));
        assertTrue(reporter.hasRole(reporter.REPORTER_ROLE(), newRelayer));

        vm.prank(relayer);
        vm.expectRevert();
        reporter.publishFinancialReport(wallet, buyer, 80, 80, "USD 500", REPORT_ID, "QmOldReporter");

        vm.prank(newRelayer);
        reporter.publishFinancialReport(
            wallet,
            buyer,
            90,
            88,
            "USD 3,000",
            "REP-NEWRELAY01",
            "QmNewReporter"
        );
        assertEq(reporter.reportCount(), 1);
    }

    function test_revertsWhenNonAdminChangesReporter() public {
        vm.prank(relayer);
        vm.expectRevert();
        reporter.setReporter(address(0xCAFE));
    }
}
