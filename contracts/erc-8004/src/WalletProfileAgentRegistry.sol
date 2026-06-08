// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title WalletProfileAgentRegistry
/// @notice ERC-8004 agent registration for the OnFRA (Onchain Financial Reputation Agent).
/// @dev Placeholder — implement IERC-8004 registration, agentURI, and reputation endpoints.
contract WalletProfileAgentRegistry {
    string public constant AGENT_URI =
        "https://wallet-profile-orpin.vercel.app/.well-known/agent.json";

    event AgentRegistered(address indexed owner, string agentURI);

/// @notice Register the Wallet Profile agent identity onchain.
    /// @dev Production registration uses ERC-8004 Identity Registry via erc8004-agent/scripts/register.mjs
    function registerAgent() external {
        emit AgentRegistered(msg.sender, AGENT_URI);
    }
}
