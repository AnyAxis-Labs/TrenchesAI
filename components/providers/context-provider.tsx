"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import {
  mainnet,
  arbitrum,
  mantle,
  mantleSepoliaTestnet,
} from "@reown/appkit/networks";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

export const networks = [mainnet, arbitrum];

const projectId = "375bbb04e24df1988fe0f629fbe4096a";
//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;

// Set up queryClient
const queryClient = new QueryClient();

// if (!projectId) {
//   throw new Error("Project ID is not defined");
// }

// Set up metadata
const metadata = {
  name: "appkit-example",
  description: "AppKit Example",
  url: "https://appkitexampleapp.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// Create the modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mantle, mantleSepoliaTestnet],
  defaultNetwork: mantle,
  metadata,
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
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;
