import { useMutation } from "@tanstack/react-query";

// Types
export interface CreateTokenParams {
  name: string;
  symbol: string;
  description: string;
  url: string;
}

export interface TokenCreationResult {
  coinTreasuryCap: string;
  coinMetadataCap: string;
  coinType: string;
  digest: string;
}

// Constants
const TOKEN_DECIMALS = 9;
const MINT_AMOUNT = 10_000_000_000;

// Main hook
export const useCreateTokenSc = () => {
  return useMutation({
    mutationFn: async ({
      name,
      symbol,
      description,
      url,
    }: CreateTokenParams): Promise<TokenCreationResult> => {
      return {
        coinTreasuryCap: "0x1",
        coinMetadataCap: "0x2",
        coinType: "0x3",
        digest: "0x4",
      };
    },
  });
};
