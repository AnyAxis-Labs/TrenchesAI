import { Raydium } from "@raydium-io/raydium-sdk-v2";
import {
  type Provider,
  useAppKitConnection,
} from "@reown/appkit-adapter-solana/react";
import { useAppKitNetwork, useAppKitProvider } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";

export const useRaydium = () => {
  const { connection } = useAppKitConnection();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { caipNetwork } = useAppKitNetwork();

  const { data: raydium, ...rest } = useQuery({
    queryKey: ["raydium"],
    enabled: !!connection && !!walletProvider && !!walletProvider.publicKey,
    queryFn: async () => {
      if (!connection || !walletProvider || !walletProvider.publicKey) {
        throw new Error("Connection or wallet provider not found");
      }

      const raydium = await Raydium.load({
        connection,
        owner: walletProvider.publicKey,
        signAllTransactions: (txs) => walletProvider.signAllTransactions(txs),
        cluster: caipNetwork?.testnet ? "devnet" : "mainnet",
      });

      return raydium;
    },
  });

  return { raydium, ...rest };
};
