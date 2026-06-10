"use client";

import { PrivyProvider, usePrivy, useWallets } from "@privy-io/react-auth";
import { createContext, useContext, useMemo, useState } from "react";
import { celo } from "viem/chains";
import { useMiniPay } from "@/hooks/useMiniPay";

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
  const { address: miniPayAddress, isMiniPay: miniPay, isLoading: connectingMiniPay, connect, disconnect } =
    useMiniPay();
  const [demoSignedIn, setDemoSignedIn] = useState(false);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready: !connectingMiniPay,
      authenticated: Boolean(miniPayAddress) || demoSignedIn,
      login: () => {
        if (miniPay) {
          void connect();
          return;
        }
        setDemoSignedIn(true);
      },
      logout: () => {
        disconnect();
        setDemoSignedIn(false);
      },
      address: miniPayAddress,
      miniPay,
      connectingMiniPay
    }),
    [miniPay, miniPayAddress, connectingMiniPay, demoSignedIn, connect, disconnect]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function PrivyBridge({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, login: privyLogin, logout: privyLogout } = usePrivy();
  const { wallets } = useWallets();
  const { address: miniPayAddress, isMiniPay: miniPay, isLoading: connectingMiniPay, connect, disconnect } =
    useMiniPay();

  const privyAddress = wallets.find((wallet) => wallet.address)?.address ?? null;
  const address = miniPayAddress ?? privyAddress;

  const value = useMemo<AuthContextValue>(
    () => ({
      ready: ready && !connectingMiniPay,
      authenticated: authenticated || Boolean(miniPayAddress),
      login: () => {
        if (miniPay) {
          void connect();
          return;
        }
        privyLogin();
      },
      logout: () => {
        disconnect();
        privyLogout();
      },
      address,
      miniPay,
      connectingMiniPay
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
      connect,
      disconnect
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
