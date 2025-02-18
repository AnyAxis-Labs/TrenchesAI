import { useMutation } from "@tanstack/react-query";
import type { PublicKey } from "@solana/web3.js";

// Types
export interface AddLpRaydiumParams {
  mint: PublicKey;
  amount: number;
}

export const useAddLpRaydium = () => {
  return useMutation({
    mutationFn: async (params: AddLpRaydiumParams) => {
      const { mint, amount } = params;
    },
  });
};
