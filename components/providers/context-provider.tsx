"use client";

import { sonic, sonicBlazeTestnet } from "@/lib/chains";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { DefaultSIWX } from "@reown/appkit-siwx";
import type { AppKitNetwork } from "@reown/appkit/networks";
import {
  createAppKit,
  type Metadata,
  type SIWXConfig,
  type SIWXSession,
} from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getSession, signIn, signOut } from "next-auth/react";
import React from "react";
import { type Config, cookieToInitialState, WagmiProvider } from "wagmi";

const networks = [sonic, sonicBlazeTestnet] as [
  AppKitNetwork,
  ...AppKitNetwork[]
];
export const projectId = "375bbb04e24df1988fe0f629fbe4096a";
//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks,
});
export const config = wagmiAdapter.wagmiConfig;

// Set up queryClient
const queryClient = new QueryClient();

const defaultSiwx = new DefaultSIWX();

export const siwx: SIWXConfig = {
  createMessage: (input) => defaultSiwx.createMessage(input),
  getRequired: () => defaultSiwx.getRequired(),
  setSessions: (sessions) => defaultSiwx.setSessions(sessions),
  addSession: async ({ signature, message }) => {
    await signIn("credentials", {
      message,
      redirect: true,
      signature,
      callbackUrl: "/protected",
      redirectTo: "/",
    });
  },
  getSessions: async () => {
    const nextAuthSession = await getSession();

    if (!nextAuthSession) {
      return [];
    }

    const session = nextAuthSession as unknown as SIWXSession;
    return [session];
  },
  revokeSession: async () => {
    try {
      await signOut({
        redirect: true,
        redirectTo: "/login",
      });
    } catch (error) {}
  },
};

// Set up metadata
const metadata: Metadata = {
  name: "TrenchesAI",
  description: "TrenchesAI",
  url: "https://AI-terminal.vercel.app", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// Create the modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: sonicBlazeTestnet,
  metadata,
  siwx,
  features: {},
});

function ContextProvider({ children }: React.PropsWithChildren) {
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
