import { useQuery } from "@tanstack/react-query";
import { useAgni } from "./use-agni";

export const useTokenFromSymbol = (symbol?: string) => {
  const {
    data: { tokenMangerApi },
  } = useAgni();

  return useQuery({
    queryKey: ["token", symbol],
    queryFn: async () => {
      const tokenList = await tokenMangerApi.getTokenByTokenList();
      const tokens = tokenList.concat(tokenMangerApi.systemTokens());

      return (
        tokens.find(
          (token) => token.symbol?.toLowerCase() === symbol?.toLowerCase()
        ) || null
      );
    },
    enabled: !!symbol,
  });
};
