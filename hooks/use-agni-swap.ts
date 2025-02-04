import { SwapRouterAbi } from "@/lib/abi";
import { AGNI_ROUTER_ADDRESS, WRAPPED_NATIVE } from "@/lib/constants";
import { useMutation } from "@tanstack/react-query";
import type { SwapInfo } from "agni-sdk";
import { useAccount, useConfig, useWriteContract } from "wagmi";
import { useTokenApproval } from "./use-token-approval";
import { waitForTransactionReceipt } from "@wagmi/core";
import { parseUnits } from "viem";
import { toast } from "sonner";

export const useAgniSwap = (swapInfo: SwapInfo | undefined) => {
  const { writeContractAsync } = useWriteContract();

  const { address, chainId } = useAccount();
  const config = useConfig();

  const tokenAddress = swapInfo?.token0.isNative
    ? WRAPPED_NATIVE[chainId ?? 5000]
    : swapInfo?.token0.address;
  const spender = swapInfo?.token0Balance.spender;

  const { checkNeedsApproval, approve } = useTokenApproval(
    tokenAddress,
    spender
  );

  return useMutation({
    mutationFn: async () => {
      if (!swapInfo || !address || !chainId) {
        return;
      }

      const inputAmount = swapInfo.updateInputResult.inputAmount
        ? parseUnits(
            swapInfo.updateInputResult.inputAmount,
            swapInfo.token0Balance.token.decimals
          )
        : undefined;

      if (!inputAmount) {
        return;
      }

      console.log("approve", checkNeedsApproval(inputAmount));

      if (checkNeedsApproval(inputAmount)) {
        await approve(inputAmount);
      }

      const tokenOutAddress = swapInfo.token1Balance.token.address;
      const minAmountOut = swapInfo.updateInputResult.minimumReceived
        ? parseUnits(
            swapInfo.updateInputResult.minimumReceived,
            swapInfo.token1Balance.token.decimals
          )
        : undefined;
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 5);
      const hash = await writeContractAsync({
        address: AGNI_ROUTER_ADDRESS[chainId],
        abi: SwapRouterAbi,
        functionName: "exactInputSingle",
        args: [
          {
            tokenIn: tokenAddress as `0x${string}`,
            tokenOut: tokenOutAddress as `0x${string}`,
            fee: 500,
            recipient: address,
            deadline,
            amountIn: BigInt(inputAmount),
            amountOutMinimum: BigInt(0),
            sqrtPriceLimitX96: BigInt(0),
          },
        ],
        value:
          tokenAddress === WRAPPED_NATIVE[chainId ?? 5000]
            ? BigInt(inputAmount)
            : undefined,
      });

      toast.loading("Transaction sent");

      const receipt = await waitForTransactionReceipt(config, { hash });
      toast.dismiss();

      if (receipt.status === "success") {
        toast.success("Swap successful");
        return receipt;
      } else {
        toast.error("Swap reverted");
      }
    },
  });
};
