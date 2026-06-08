// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {WalletProfileAgentRegistry} from "../src/WalletProfileAgentRegistry.sol";

contract WalletProfileAgentRegistryTest is Test {
    WalletProfileAgentRegistry registry;

    function setUp() public {
        registry = new WalletProfileAgentRegistry();
    }

    function test_AgentURI() public view {
        assertEq(registry.AGENT_URI(), "https://wallet-profile-orpin.vercel.app/.well-known/agent.json");
    }

    function test_RegisterAgent() public {
        vm.expectEmit(true, false, false, true);
        emit WalletProfileAgentRegistry.AgentRegistered(address(this), registry.AGENT_URI());
        registry.registerAgent();
    }
}
