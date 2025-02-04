import { type Address, erc20Abi, zeroAddress } from "viem";
import { useConfig, useReadContract, useAccount } from "wagmi";
import { waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { useMemo, useCallback } from "react";

export function useTokenApproval(token?: string, spender?: string) {
  const { address: userAddress = zeroAddress } = useAccount();
  const config = useConfig();

  // Memoize enabled flag to prevent unnecessary query updates
  const isEnabled = useMemo(
    () => Boolean(token && spender && userAddress),
    [token, spender, userAddress]
  );

  // Check current allowance
  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract(
    {
      address: token as Address,
      abi: erc20Abi,
      functionName: "allowance",
      args: isEnabled ? [userAddress, spender as Address] : undefined,
      query: {
        enabled: isEnabled,
        staleTime: 5_000,
      },
    }
  );

  // Function to check if approval is needed for a specific amount
  const checkNeedsApproval = useCallback(
    (amount?: bigint) => {
      if (!amount || currentAllowance === undefined) return false;
      return currentAllowance < amount;
    },
    [currentAllowance]
  );

  // Approve function that takes amount parameter
  const handleApprove = useCallback(
    async (amount: bigint) => {
      if (!token || !spender || !amount) {
        throw new Error("Missing required parameters for approval");
      }

      try {
        const hash = await writeContract(config, {
          address: token as `0x${string}`,
          abi: erc20Abi,
          functionName: "approve",
          args: [spender as `0x${string}`, amount],
        });

        await waitForTransactionReceipt(config, { hash });
        await refetchAllowance();

        return hash;
      } catch (error) {
        console.error("Approval failed:", error);
        throw error;
      }
    },
    [token, spender, refetchAllowance, config]
  );

  return useMemo(
    () => ({
      currentAllowance,
      checkNeedsApproval,
      approve: handleApprove,
    }),
    [currentAllowance, checkNeedsApproval, handleApprove]
  );
}
