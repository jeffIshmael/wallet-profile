"use client";

import {
  PrivyProvider,
  getEmbeddedConnectedWallet,
  useActiveWallet,
  usePrivy,
  useWallets,
  type ConnectedWallet,
  type User
} from "@privy-io/react-auth";
import { SmartWalletsProvider, useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { EIP1193Provider } from "viem";
import { celo } from "@/lib/chains/celo";
import { connectInjectedWallet, isMiniPay } from "@/lib/minipay";
import { createPrivyEmbeddedProvider } from "@/lib/privy/sponsoredProvider";

type AuthContextValue = {
  ready: boolean;
  authenticated: boolean;
  login: () => void;
  loginWithGoogle: () => void;
  loginWithEmail: () => void;
  loginWithWallet: () => void;
  logout: () => void;
  address: string | null;
  miniPay: boolean;
  connectingMiniPay: boolean;
  privyEnabled: boolean;
  /** EIP-1193 provider for the already-connected app wallet (Privy / MiniPay). */
  getEthereumProvider: () => Promise<EIP1193Provider | undefined>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getInjectedProvider(): EIP1193Provider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { ethereum?: EIP1193Provider }).ethereum;
}

function getExternalWallet(wallets: ConnectedWallet[]) {
  return wallets.find((wallet) => wallet.address && wallet.walletClientType !== "privy");
}

function isExternalWalletLogin(user: User | null): boolean {
  const wallet = user?.wallet;
  if (!wallet || !("walletClientType" in wallet)) return false;
  return wallet.walletClientType !== "privy";
}

function resolvePrivyWalletAddress(
  user: User | null,
  wallets: ConnectedWallet[],
  smartWalletAddress?: string | null
): string | null {
  const embedded = getEmbeddedConnectedWallet(wallets);
  const external = getExternalWallet(wallets);

  // MetaMask / external wallet login — use the connected external address.
  if (isExternalWalletLogin(user) && external?.address) {
    return external.address;
  }

  if (embedded?.address) {
    return smartWalletAddress ?? embedded.address;
  }

  if (user?.wallet?.address) {
    return user.wallet.address;
  }

  if (external?.address) return external.address;

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

  return null;
}

function pickPrivyWallet(
  wallets: ConnectedWallet[],
  address: string | null,
  user: User | null
): ConnectedWallet | undefined {
  const normalized = address?.toLowerCase();
  if (normalized) {
    const matched = wallets.find((wallet) => wallet.address?.toLowerCase() === normalized);
    if (matched) return matched;
  }

  const external = getExternalWallet(wallets);
  if (isExternalWalletLogin(user) && external) return external;

  const embedded = getEmbeddedConnectedWallet(wallets);
  if (embedded?.address) return embedded;

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
      loginWithGoogle: () => {
        if (isMiniPay()) {
          setConnectingMiniPay(true);
          connectInjectedWallet()
            .then((address) => setMiniPayAddress(address))
            .finally(() => setConnectingMiniPay(false));
          return;
        }
        setDemoSignedIn(true);
      },
      loginWithEmail: () => {
        if (isMiniPay()) {
          setConnectingMiniPay(true);
          connectInjectedWallet()
            .then((address) => setMiniPayAddress(address))
            .finally(() => setConnectingMiniPay(false));
          return;
        }
        setDemoSignedIn(true);
      },
      loginWithWallet: () => {
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
      privyEnabled: false,
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
  const { client: smartWalletClient } = useSmartWallets();
  const [miniPay, setMiniPay] = useState(false);
  const [miniPayAddress, setMiniPayAddress] = useState<string | null>(null);
  const [connectingMiniPay, setConnectingMiniPay] = useState(false);
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

    const external = getExternalWallet(wallets);
    const embedded = getEmbeddedConnectedWallet(wallets);

    if (isExternalWalletLogin(user) && external) {
      setActiveWallet(external);
      return;
    }

    if (embedded) {
      setActiveWallet(embedded);
    }
  }, [ready, walletsReady, authenticated, miniPay, wallets, user, setActiveWallet]);

  useEffect(() => {
    if (!ready || !pendingLogin.current) return;
    pendingLogin.current = false;
    privyLogin();
  }, [ready, privyLogin]);

  const getEthereumProvider = useCallback(async () => {
    if (miniPayAddress) {
      return getInjectedProvider();
    }

    const wallet = pickPrivyWallet(wallets, address, user);
    if (!wallet?.address) {
      if (authenticated) return undefined;
      return getInjectedProvider();
    }

    const provider = (await wallet.getEthereumProvider()) as EIP1193Provider;
    if (wallet.walletClientType !== "privy") return provider;

    return createPrivyEmbeddedProvider(provider, smartWalletClient);
  }, [miniPayAddress, address, wallets, user, smartWalletClient, authenticated]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready: miniPay ? !connectingMiniPay : ready,
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
      loginWithGoogle: () => {
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
        privyLogin({ loginMethods: ["google"] });
      },
      loginWithEmail: () => {
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
        privyLogin({ loginMethods: ["email"] });
      },
      loginWithWallet: () => {
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
        privyLogin({ loginMethods: ["wallet"] });
      },
      logout: () => {
        setMiniPayAddress(null);
        privyLogout();
      },
      address,
      miniPay,
      connectingMiniPay,
      privyEnabled: true,
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
          theme: "dark",
          accentColor: "#B8B0C8",
          showWalletLoginFirst: false
        },
        loginMethods: ["email", "wallet", "google"],
        embeddedWallets: {
          ethereum: {
            // Only auto-create embedded wallets for email/social users — not MetaMask logins.
            createOnLogin: "users-without-wallets"
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
