import {
  AMM_V4,
  DEVNET_PROGRAM_ID,
  FEE_DESTINATION_ID,
  OPEN_BOOK_PROGRAM,
  TxVersion,
  WSOLMint,
} from "@raydium-io/raydium-sdk-v2";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import type { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import { TOKEN_DECIMALS } from "./use-create-solana-token";
import { useRaydium } from "./use-raydium";
import BN from "bn.js";

export interface CreateAmmPoolParams {
  mint: PublicKey;
  marketId: PublicKey;
  baseAmount: BN;
  quoteAmount: BN;
}

export const useCreateAmmPool = () => {
  const { connection } = useAppKitConnection();
  const { raydium } = useRaydium();
  return useMutation({
    mutationFn: async (params: CreateAmmPoolParams) => {
      const { mint, marketId, baseAmount, quoteAmount } = params;

      if (!connection) {
        throw new Error("Connection not found");
      }

      if (!raydium) {
        throw new Error("Raydium not found");
      }

      try {
        const isMainnet = raydium.cluster === "mainnet";
        const { execute, extInfo } = await raydium.liquidity.createPoolV4({
          programId: isMainnet ? AMM_V4 : DEVNET_PROGRAM_ID.AmmV4,
          marketInfo: {
            marketId,
            programId: isMainnet
              ? OPEN_BOOK_PROGRAM
              : DEVNET_PROGRAM_ID.OPENBOOK_MARKET,
          },
          baseMintInfo: {
            mint,
            decimals: TOKEN_DECIMALS,
          },
          quoteMintInfo: {
            mint: WSOLMint,
            decimals: 9, //
          },
          baseAmount,
          quoteAmount,
          startTime: new BN(0), // unit in seconds
          ownerInfo: {
            useSOLBalance: true,
          },
          associatedOnly: false,
          txVersion: TxVersion.V0,
          feeDestinationId: isMainnet
            ? FEE_DESTINATION_ID
            : DEVNET_PROGRAM_ID.FEE_DESTINATION_ID,
          // optional: set up priority fee here
          computeBudgetConfig: {
            units: 6000000,
          },
        });

        const { txId } = await execute({ sendAndConfirm: true });

        return {
          txId,
          extInfo,
        };
      } catch (error) {
        console.error("Error creating amm pool", error);
        throw error;
      }
    },
  });
};
