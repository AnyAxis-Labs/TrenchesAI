import { useMutation } from "@tanstack/react-query";
import type { SwapInfo } from "agni-sdk";
import { useSendTransaction } from "wagmi";

export const useAgniSwap = () => {
  const { sendTransaction } = useSendTransaction();

  return useMutation({
    mutationFn: async (swapInfo: SwapInfo) => {
      // TODO:
    },
  });
};
