"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit, type Metadata } from "@reown/appkit/react";
import {
  mantle,
  mantleSepoliaTestnet,
  type AppKitNetwork,
} from "@reown/appkit/networks";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { getCsrfToken, signIn, signOut, getSession } from "next-auth/react";
import type {
  SIWEVerifyMessageArgs,
  SIWECreateMessageArgs,
  SIWESession,
} from "@reown/appkit-siwe";
import { createSIWEConfig, formatMessage } from "@reown/appkit-siwe";

const networks = [mantle, mantleSepoliaTestnet] as [
  AppKitNetwork,
  ...AppKitNetwork[]
];

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID ?? "";
//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;

// Set up queryClient
const queryClient = new QueryClient();

export const siweConfig = createSIWEConfig({
  getMessageParams: async () => ({
    domain: typeof window !== "undefined" ? window.location.host : "",
    uri: typeof window !== "undefined" ? window.location.origin : "",
    chains: networks.map((network) => Number(network.id)),
    statement: "Please sign with your account",
  }),
  createMessage: ({ address, ...args }: SIWECreateMessageArgs) =>
    formatMessage(args, address),
  getNonce: async () => {
    try {
      const nonce = await getCsrfToken();
      if (!nonce) {
        throw new Error("Failed to get nonce!");
      }

      return nonce;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to get nonce!");
    }
  },
  getSession: async () => {
    const nextAuthSession = await getSession();

    if (!nextAuthSession) {
      return null;
    }

    const session = nextAuthSession as unknown as SIWESession;

    // Validate address and chainId types
    if (
      typeof session.address !== "string" ||
      typeof session.chainId !== "number"
    ) {
      return null;
    }

    return {
      address: session.address,
      chainId: session.chainId,
    } satisfies SIWESession;
  },
  verifyMessage: async ({ message, signature }: SIWEVerifyMessageArgs) => {
    try {
      const success = await signIn("credentials", {
        message,
        redirect: true,
        signature,
        callbackUrl: "/protected",
        redirectTo: "/",
      });

      return Boolean(success?.ok);
    } catch (error) {
      return false;
    }
  },
  signOut: async () => {
    try {
      await signOut({
        redirect: true,
        redirectTo: "/login",
      });

      return true;
    } catch (error) {
      return false;
    }
  },
});

// Set up metadata
const metadata: Metadata = {
  name: "defai-terminal",
  description: "Defai Terminal",
  url: "https://defai-terminal.vercel.app", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// Create the modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: mantle,
  metadata,
  siweConfig,
  features: {
    analytics: false, // Optional - defaults to your Cloud configuration
  },
});

function ContextProvider({ children }: { children: ReactNode }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config);

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
      reconnectOnMount
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;
