"use client";

import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { DefaultSIWX } from "@reown/appkit-siwx";
import {
  type AppKitNetwork,
  solana,
  solanaDevnet,
  solanaTestnet,
} from "@reown/appkit/networks";
import {
  createAppKit,
  type Metadata,
  type SIWXConfig,
  type SIWXSession,
} from "@reown/appkit/react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getSession, signIn, signOut } from "next-auth/react";
import React from "react";

const networks = [solana, solanaTestnet, solanaDevnet] as [
  AppKitNetwork,
  ...AppKitNetwork[]
];
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID ?? "";

//Set up the Wagmi Adapter (Config)
// export const wagmiAdapter = new WagmiAdapter({
//   ssr: true,
//   projectId,
//   networks,
// });
// export const config = wagmiAdapter.wagmiConfig;

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
});

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
    console.log("nextAuthSession", nextAuthSession);

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
  name: "AI-terminal",
  description: "AI Terminal",
  url: "https://AI-terminal.vercel.app", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// Create the modal
export const modal = createAppKit({
  adapters: [solanaWeb3JsAdapter],
  projectId,
  networks,
  metadata,
  siwx,
  features: {
    analytics: false, // Optional - defaults to your Cloud configuration
  },
});

function ContextProvider({ children }: React.PropsWithChildren) {
  // const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config);

  // return (
  //   <WagmiProvider
  //     config={wagmiAdapter.wagmiConfig as Config}
  //     initialState={initialState}
  //     reconnectOnMount
  //   >
  //     <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  //   </WagmiProvider>
  // );
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default ContextProvider;
