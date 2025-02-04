import { useQuery } from "@tanstack/react-query";
import {
  getCurrentAddressInfo,
  initAddress,
  type SwapApi,
  type TokenMangerApi,
} from "agni-sdk";
import { useAccount } from "wagmi";

export const useAgni = () => {
  const { chainId } = useAccount();

  return useQuery<{
    tokenMangerApi: TokenMangerApi;
    swapV3Api: SwapApi;
  }>({
    queryKey: ["agni", chainId],
    queryFn: async () => {
      initAddress(chainId !== 5000 ? "test" : "prod_node");
      const addressInfo = getCurrentAddressInfo();
      const api = addressInfo.getApi();

      return {
        tokenMangerApi: api.tokenMangerApi(),
        swapV3Api: api.swapV3Api(),
      };
    },
    initialData: {} as any,
  });
};
