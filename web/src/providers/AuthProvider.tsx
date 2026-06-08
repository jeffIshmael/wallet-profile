"use client";

import { PrivyProvider, usePrivy, useWallets } from "@privy-io/react-auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { celo } from "viem/chains";
import { connectInjectedWallet, isMiniPay } from "@/lib/minipay";

type AuthContextValue = {
  ready: boolean;
  authenticated: boolean;
  login: () => void;
  logout: () => void;
  address: string | null;
  miniPay: boolean;
  connectingMiniPay: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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
      connectingMiniPay
    }),
    [miniPay, miniPayAddress, connectingMiniPay, demoSignedIn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function PrivyBridge({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [miniPay, setMiniPay] = useState(false);
  const [miniPayAddress, setMiniPayAddress] = useState<string | null>(null);
  const [connectingMiniPay, setConnectingMiniPay] = useState(false);

  useEffect(() => {
    if (!isMiniPay()) return;

    setMiniPay(true);
    setConnectingMiniPay(true);
    connectInjectedWallet()
      .then((address) => setMiniPayAddress(address))
      .catch(() => setMiniPayAddress(null))
      .finally(() => setConnectingMiniPay(false));
  }, []);

  const privyAddress = wallets.find((wallet) => wallet.address)?.address ?? null;
  const address = miniPayAddress ?? privyAddress;

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      authenticated: authenticated || Boolean(miniPayAddress),
      login,
      logout,
      address,
      miniPay,
      connectingMiniPay
    }),
    [ready, authenticated, login, logout, address, miniPay, miniPayAddress, connectingMiniPay]
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
            createOnLogin: "off"
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
