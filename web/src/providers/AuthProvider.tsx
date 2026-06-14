"use client";

import {
  PrivyProvider,
  getEmbeddedConnectedWallet,
  useActiveWallet,
  useCreateWallet,
  usePrivy,
  useWallets,
  type ConnectedWallet,
  type User
} from "@privy-io/react-auth";
import { SmartWalletsProvider, useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { EIP1193Provider } from "viem";
import { celo } from "viem/chains";
import { connectInjectedWallet, isMiniPay } from "@/lib/minipay";
import { createPrivyEmbeddedProvider } from "@/lib/privy/sponsoredProvider";

type AuthContextValue = {
  ready: boolean;
  authenticated: boolean;
  login: () => void;
  logout: () => void;
  address: string | null;
  miniPay: boolean;
  connectingMiniPay: boolean;
  /** EIP-1193 provider for the already-connected app wallet (Privy / MiniPay). */
  getEthereumProvider: () => Promise<EIP1193Provider | undefined>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getInjectedProvider(): EIP1193Provider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { ethereum?: EIP1193Provider }).ethereum;
}

function resolvePrivyWalletAddress(
  user: User | null,
  wallets: ConnectedWallet[],
  smartWalletAddress?: string | null
): string | null {
  const embedded = getEmbeddedConnectedWallet(wallets);

  if (embedded?.address) {
    return smartWalletAddress ?? embedded.address;
  }

  if (user?.wallet?.address) {
    return smartWalletAddress ?? user.wallet.address;
  }

  const embeddedLinked = user?.linkedAccounts.find(
    (account) =>
      account.type === "wallet" &&
      "walletClientType" in account &&
      account.walletClientType === "privy" &&
      "address" in account &&
      account.address
  );
  if (embeddedLinked && "address" in embeddedLinked && embeddedLinked.address) {
    return smartWalletAddress ?? embeddedLinked.address;
  }

  const external = wallets.find(
    (wallet) => wallet.address && wallet.walletClientType !== "privy"
  );
  if (external?.address) return external.address;

  return null;
}

function pickPrivyWallet(
  wallets: ConnectedWallet[],
  address: string | null
): ConnectedWallet | undefined {
  const embedded = getEmbeddedConnectedWallet(wallets);
  if (embedded?.address) return embedded;

  const normalized = address?.toLowerCase();
  if (normalized) {
    const matched = wallets.find((wallet) => wallet.address?.toLowerCase() === normalized);
    if (matched) return matched;
  }

  return wallets[0];
}

function MiniPayBridge({ children }: { children: React.ReactNode }) {
  const [miniPay, setMiniPay] = useState(false);
  const [miniPayAddress, setMiniPayAddress] = useState<string | null>(null);
  const [connectingMiniPay, setConnectingMiniPay] = useState(false);
  const [demoSignedIn, setDemoSignedIn] = useState(false);

  useEffect(() => {
    if (!isMiniPay()) return;

    setMiniPay(true);
    setConnectingMiniPay(true);
    connectInjectedWallet()
      .then((address) => setMiniPayAddress(address))
      .catch(() => setMiniPayAddress(null))
      .finally(() => setConnectingMiniPay(false));
  }, []);

  const getEthereumProvider = useCallback(async () => getInjectedProvider(), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready: true,
      authenticated: Boolean(miniPayAddress) || demoSignedIn,
      login: () => {
        if (isMiniPay()) {
          setConnectingMiniPay(true);
          connectInjectedWallet()
            .then((address) => setMiniPayAddress(address))
            .finally(() => setConnectingMiniPay(false));
          return;
        }
        setDemoSignedIn(true);
      },
      logout: () => {
        setMiniPayAddress(null);
        setDemoSignedIn(false);
      },
      address: miniPayAddress,
      miniPay,
      connectingMiniPay,
      getEthereumProvider
    }),
    [miniPay, miniPayAddress, connectingMiniPay, demoSignedIn, getEthereumProvider]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function PrivyBridge({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, login: privyLogin, logout: privyLogout, user } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { setActiveWallet } = useActiveWallet();
  const { createWallet } = useCreateWallet();
  const { client: smartWalletClient } = useSmartWallets();
  const [miniPay, setMiniPay] = useState(false);
  const [miniPayAddress, setMiniPayAddress] = useState<string | null>(null);
  const [connectingMiniPay, setConnectingMiniPay] = useState(false);
  const walletCreationAttempted = useRef(false);
  const pendingLogin = useRef(false);

  useEffect(() => {
    if (!isMiniPay()) return;

    setMiniPay(true);
    setConnectingMiniPay(true);
    connectInjectedWallet()
      .then((address) => setMiniPayAddress(address))
      .catch(() => setMiniPayAddress(null))
      .finally(() => setConnectingMiniPay(false));
  }, []);

  const smartWalletAddress = smartWalletClient?.account?.address ?? null;
  const privyAddress = resolvePrivyWalletAddress(user, wallets, smartWalletAddress);
  const address = miniPayAddress ?? privyAddress;

  useEffect(() => {
    if (!ready || !walletsReady || !authenticated || miniPay) return;

    const embedded = getEmbeddedConnectedWallet(wallets);
    if (embedded) {
      setActiveWallet(embedded);
    }
  }, [ready, walletsReady, authenticated, miniPay, wallets, setActiveWallet]);

  useEffect(() => {
    if (!ready || !authenticated || miniPay || walletCreationAttempted.current) {
      if (!authenticated) walletCreationAttempted.current = false;
      return;
    }

    const embedded = getEmbeddedConnectedWallet(wallets);
    if (embedded?.address) return;

    walletCreationAttempted.current = true;
    void createWallet().catch(() => {
      // Keep the attempt marked so we don't spin in a retry loop on failure.
    });
  }, [ready, authenticated, miniPay, wallets, createWallet]);

  useEffect(() => {
    if (!ready || !pendingLogin.current) return;
    pendingLogin.current = false;
    privyLogin();
  }, [ready, privyLogin]);

  const getEthereumProvider = useCallback(async () => {
    if (miniPayAddress) {
      return getInjectedProvider();
    }

    const wallet = pickPrivyWallet(wallets, address);
    if (!wallet?.address) {
      if (authenticated) return undefined;
      return getInjectedProvider();
    }

    const provider = (await wallet.getEthereumProvider()) as EIP1193Provider;
    if (wallet.walletClientType !== "privy") return provider;

    return createPrivyEmbeddedProvider(provider, smartWalletClient);
  }, [miniPayAddress, address, wallets, smartWalletClient, authenticated]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      authenticated: authenticated || Boolean(miniPayAddress),
      login: () => {
        if (miniPay) {
          setConnectingMiniPay(true);
          connectInjectedWallet()
            .then((nextAddress) => setMiniPayAddress(nextAddress))
            .finally(() => setConnectingMiniPay(false));
          return;
        }
        if (!ready) {
          pendingLogin.current = true;
          return;
        }
        privyLogin();
      },
      logout: () => {
        setMiniPayAddress(null);
        privyLogout();
      },
      address,
      miniPay,
      connectingMiniPay,
      getEthereumProvider
    }),
    [
      ready,
      authenticated,
      privyLogin,
      privyLogout,
      address,
      miniPay,
      miniPayAddress,
      connectingMiniPay,
      getEthereumProvider
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    return <MiniPayBridge>{children}</MiniPayBridge>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#1A56FF",
          showWalletLoginFirst: false
        },
        loginMethods: ["email", "wallet"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "all-users"
          }
        },
        supportedChains: [celo],
        defaultChain: celo
      }}
    >
      <SmartWalletsProvider
        config={{
          paymasterContext: {
            mode: "SPONSORED",
            calculateGasLimits: true
          }
        }}
      >
        <PrivyBridge>{children}</PrivyBridge>
      </SmartWalletsProvider>
    </PrivyProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AppAuthProvider");
  }
  return context;
}
