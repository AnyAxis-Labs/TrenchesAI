import { parseQueryString } from "@/lib/utils";
import { ChainId, LiFiWidget, type WidgetConfig } from "@lifi/widget";
import { useTheme } from "next-themes";
import { useAccount } from "wagmi";
import { Card, CardContent } from "./card";
import { useTokenFromSymbol } from "@/hooks/use-token-from-symbol";

interface BridgeParams {
  amount: string;
  source_token: string;
  target_network: string;
}

const BridgeWidget = ({ params }: { params: string }) => {
  const { amount, source_token, target_network } =
    parseQueryString<BridgeParams>(params);
  const { chain } = useAccount();
  const { theme } = useTheme();

  const { data: token } = useTokenFromSymbol(source_token);
  const toChain = ChainId[target_network as keyof typeof ChainId];
  console.log(params, token);

  const widgetConfig: WidgetConfig = {
    integrator: "Defai",
    variant: "compact",
    subvariant: "refuel",
    fromChain: chain?.id,
    appearance: theme === "dark" ? "dark" : "light",
    fromAmount: amount,
    fromToken: token?.address ?? "0x0000000000000000000000000000000000000000",
    toChain,
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-center">Bridge Agent</h1>
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="space-y-4 p-6">
          <LiFiWidget integrator="Defai" config={widgetConfig} />
        </CardContent>
      </Card>
    </div>
  );
};

export default BridgeWidget;
