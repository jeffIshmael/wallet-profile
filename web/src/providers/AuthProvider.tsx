"use client";

import {
  PrivyProvider,
  useCreateWallet,
  usePrivy,
  useSendTransaction,
  useWallets,
  type User
} from "@privy-io/react-auth";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { EIP1193Provider } from "viem";
import { celo } from "viem/chains";
import { connectInjectedWallet, isMiniPay } from "@/lib/minipay";
import { createSponsoredProvider } from "@/lib/privy/sponsoredProvider";

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

function resolvePrivyWalletAddress(user: User | null, wallets: { address?: string }[]): string | null {
  const connected = wallets.find((wallet) => wallet.address)?.address ?? null;
  if (connected) return connected;
  if (user?.wallet?.address) return user.wallet.address;

  const linkedWallet = user?.linkedAccounts.find((account) => account.type === "wallet");
  if (linkedWallet && "address" in linkedWallet && linkedWallet.address) {
    return linkedWallet.address;
  }

  return null;
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
  const { wallets } = useWallets();
  const { createWallet } = useCreateWallet();
  const { sendTransaction } = useSendTransaction();
  const [miniPay, setMiniPay] = useState(false);
  const [miniPayAddress, setMiniPayAddress] = useState<string | null>(null);
  const [connectingMiniPay, setConnectingMiniPay] = useState(false);
  const [creatingWallet, setCreatingWallet] = useState(false);
  const walletCreationAttempted = useRef(false);

  useEffect(() => {
    if (!isMiniPay()) return;

    setMiniPay(true);
    setConnectingMiniPay(true);
    connectInjectedWallet()
      .then((address) => setMiniPayAddress(address))
      .catch(() => setMiniPayAddress(null))
      .finally(() => setConnectingMiniPay(false));
  }, []);

  const privyAddress = resolvePrivyWalletAddress(user, wallets);
  const address = miniPayAddress ?? privyAddress;

  useEffect(() => {
    if (!ready || !authenticated || address || miniPay) {
      if (!authenticated) walletCreationAttempted.current = false;
      return;
    }
    if (walletCreationAttempted.current || creatingWallet) return;

    walletCreationAttempted.current = true;
    setCreatingWallet(true);
    void createWallet()
      .catch(() => {
        walletCreationAttempted.current = false;
      })
      .finally(() => {
        setCreatingWallet(false);
      });
  }, [ready, authenticated, address, miniPay, createWallet, creatingWallet]);

  const getEthereumProvider = useCallback(async () => {
    if (miniPayAddress) {
      return getInjectedProvider();
    }

    const normalized = address?.toLowerCase();
    const wallet =
      wallets.find((item) => item.address?.toLowerCase() === normalized) ?? wallets[0];
    if (!wallet?.address) {
      return getInjectedProvider();
    }

    const provider = (await wallet.getEthereumProvider()) as EIP1193Provider;
    if (wallet.walletClientType !== "privy") return provider;

    return createSponsoredProvider(provider, sendTransaction, wallet.address);
  }, [miniPayAddress, address, wallets, sendTransaction]);

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
        if (!ready) return;
        privyLogin();
      },
      logout: () => {
        setMiniPayAddress(null);
        privyLogout();
      },
      address,
      miniPay,
      connectingMiniPay: connectingMiniPay || creatingWallet,
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
      creatingWallet,
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
          accentColor: "#1A56FF"
        },
        loginMethods: ["wallet", "email"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets"
          }
        },
        supportedChains: [celo],
        defaultChain: celo
      }}
    >
      <PrivyBridge>{children}</PrivyBridge>
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
