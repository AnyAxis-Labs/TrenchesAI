import {
  DEVNET_PROGRAM_ID,
  OPEN_BOOK_PROGRAM,
  TxVersion,
  WSOLMint,
} from "@raydium-io/raydium-sdk-v2";
import {
  type Provider,
  useAppKitConnection,
} from "@reown/appkit-adapter-solana/react";
import { useAppKitProvider } from "@reown/appkit/react";
import type { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { TOKEN_DECIMALS } from "./use-create-solana-token";
import { useRaydium } from "./use-raydium";

export interface CreateMarketParams {
  mint: PublicKey;
}

export const useCreateMarket = () => {
  const { connection } = useAppKitConnection();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { raydium } = useRaydium();

  return useMutation({
    mutationFn: async (params: CreateMarketParams) => {
      const { mint } = params;
      if (!connection || !walletProvider || !walletProvider.publicKey) {
        throw new Error("Connection or wallet provider not found");
      }

      if (!raydium) {
        throw new Error("Raydium not found");
      }

      try {
        toast.loading("Creating market...");

        const { execute, extInfo } = await raydium.marketV2.create({
          baseInfo: {
            mint,
            decimals: TOKEN_DECIMALS,
          },
          quoteInfo: {
            mint: WSOLMint,
            decimals: 9,
          },
          lotSize: 1,
          tickSize: 0.01,
          lowestFeeMarket: true,
          dexProgramId:
            raydium.cluster === "mainnet"
              ? OPEN_BOOK_PROGRAM
              : DEVNET_PROGRAM_ID.OPENBOOK_MARKET,
          txVersion: TxVersion.V0,
        });

        await execute({
          sequentially: false,
        });

        toast.dismiss();
        toast.success("Market created successfully");

        return extInfo.address.marketId;
      } catch (error) {
        toast.dismiss();
        toast.error("Error creating market");
        console.error(error);
        throw error;
      }
    },
  });
};
