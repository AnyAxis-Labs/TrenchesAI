import { PoolType, type SwapConfig, type Token } from "agni-sdk";
import { useAgni } from "./use-agni";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

const swapConfig = {
  gasPriceWei: "100000000000",
  allowedSlippage: "0.0001",
  allowMultiHops: true,
  allowSplitRouting: true,
  allowedPoolTypes: [PoolType.V3],
} as SwapConfig;

export const useAgniSwapInfo = (
  sourceToken?: Token,
  targetToken?: Token,
  amount?: string
) => {
  const { address } = useAccount();
  const {
    data: { swapV3Api },
  } = useAgni();

  return useQuery({
    queryKey: ["swap-info", sourceToken, targetToken, address, amount],
    queryFn: async () => {
      if (!address || !sourceToken || !targetToken) {
        return null;
      }

      console.log("sourceToken", sourceToken);
      console.log("targetToken", targetToken);

      const swapInfo = await swapV3Api.swapInfo(
        sourceToken,
        targetToken,
        address
      );

      await swapInfo.getTokenPrice("day");

      if (amount) {
        await swapInfo.updateInput(sourceToken, amount, swapConfig);
      }

      return swapInfo;
    },
    enabled: !!address && !!sourceToken && !!targetToken,
    staleTime: 1000 * 30,
  });
};
