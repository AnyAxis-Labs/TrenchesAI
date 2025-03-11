import { TOKEN_FACTORY_ADDRESS } from "@/lib/constants";
import { generateTokenId, sleep } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { parseEther } from "viem";
import { useAccount, useConfig, useWriteContract } from "wagmi";
import { tokenFactoryAbi } from "./smart-contracts/abis/tokenFactory";

interface CreateTokenParams {
  tokenName: string;
  tokenSymbol: string;
}

const ensureHttps = (url: string | undefined) => {
  if (!url) return;

  return url.startsWith("https://") || url.startsWith("http://")
    ? url
    : `https://${url}`;
};

export function useCreateTokenOnchain() {
  const config = useConfig();
  const { writeContractAsync } = useWriteContract();
  const { chainId } = useAccount();

  return useMutation({
    mutationFn: async (params: CreateTokenParams) => {
      if (!params.tokenName || !params.tokenSymbol || !chainId) {
        throw new Error("Token name and symbol are required");
      }

      try {
        const tokenId = BigInt(generateTokenId());

        const calculatedTokenAddress = await readContract(config, {
          address: TOKEN_FACTORY_ADDRESS[chainId],
          abi: tokenFactoryAbi,
          functionName: "getMemeAddress",
          args: [tokenId],
        });

        const hash = await writeContractAsync({
          address: TOKEN_FACTORY_ADDRESS[chainId],
          abi: tokenFactoryAbi,
          functionName: "createMeme",
          args: [
            {
              name: params.tokenName,
              symbol: params.tokenSymbol,
              tokenId,
            },
          ],
          value: parseEther("0.0001"),
        });

        const receipt = await waitForTransactionReceipt(config, { hash });

        if (receipt.status === "success") {
          // wait for backend indexer to index the token
          await sleep(5000);

          return {
            receipt,
            transactionHash: hash,
            tokenAddress: calculatedTokenAddress,
          };
        }
      } catch (error) {
        console.error("useCreateToken error", error);
        throw new Error("Failed to deploy token: Unknown error");
      }
    },
  });
}
