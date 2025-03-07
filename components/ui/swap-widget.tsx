import { useAgniSwap } from "@/hooks/use-agni-swap";
import { useAgniSwapInfo } from "@/hooks/use-agni-swap-info";
import { useTokenFromSymbol } from "@/hooks/use-token-from-symbol";
import { parseQueryString } from "@/lib/utils";
import { BigNumber, type Token } from "agni-sdk";
import { ChevronDown, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "./button";
import { ButtonWithWallet } from "./button-with-wallet";
import { Card, CardContent } from "./card";
import { Form, FormControl, FormField, FormItem } from "./form";
import { Input } from "./input";
import SelectSwapToken from "./select-swap-token";

interface SwapParams {
  amount: string;
  source: string;
  target: string;
}

const SwapWidget = ({ params }: { params: string }) => {
  const { amount, source, target } = parseQueryString<SwapParams>(params);
  const { data: sourceToken, isPending: sourceTokenLoading } =
    useTokenFromSymbol(source);
  const { data: targetToken, isPending: targetTokenLoading } =
    useTokenFromSymbol(target);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-center">Trading Agent</h1>
      <div className="space-y-2">
        {/* Token loading states and results */}
        {sourceTokenLoading && (
          <div className="text-center text-muted-foreground">
            Loading token {source}...
          </div>
        )}
        {!sourceTokenLoading && !sourceToken && (
          <div className="text-center text-destructive">
            Cannot load token {source}
          </div>
        )}
        {!sourceTokenLoading && sourceToken && (
          <div className="text-center text-muted-foreground">
            Loaded token {source}
          </div>
        )}

        {targetTokenLoading && (
          <div className="text-center text-muted-foreground">
            Loading token {target}...
          </div>
        )}
        {!targetTokenLoading && !targetToken && (
          <div className="text-center text-destructive">
            Cannot load token {target}
          </div>
        )}
        {!targetTokenLoading && targetToken && (
          <div className="text-center text-muted-foreground">
            Loaded token {target}
          </div>
        )}
      </div>
      {sourceToken && targetToken && (
        <SwapForm initialValues={{ amount, sourceToken, targetToken }} />
      )}
    </div>
  );
};

interface SwapFormValues {
  amount: string;
  sourceToken: Token;
  targetToken: Token;
}

const SwapForm = ({ initialValues }: { initialValues: SwapFormValues }) => {
  const form = useForm<SwapFormValues>({
    defaultValues: initialValues,
  });

  const { amount, sourceToken, targetToken } = form.watch();

  const {
    data: swapInfo,
    isLoading: swapInfoLoading,
    isPending: swapInfoPending,
  } = useAgniSwapInfo(
    sourceToken ?? undefined,
    targetToken ?? undefined,
    amount
  );

  const { mutateAsync: swap } = useAgniSwap(swapInfo ?? undefined);

  const amountInUSD = amount
    ? new BigNumber(amount)
        .times(swapInfo?.token0Price.priceUSD ?? 0)
        .toFixed(2, BigNumber.ROUND_DOWN)
    : 0;

  const buyAmount = swapInfo?.updateInputResult.token1Amount;
  const buyAmountInUSD = buyAmount
    ? new BigNumber(buyAmount)
        .times(swapInfo?.token1Price.priceUSD ?? 0)
        .toFixed(2, BigNumber.ROUND_DOWN)
    : 0;

  async function onSubmit() {
    await swap();
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="space-y-2">
        {/* Swap info loading states and results */}
        {swapInfoLoading && (
          <div className="text-center text-muted-foreground">
            Loading swap quote...
          </div>
        )}
        {!swapInfoLoading && !swapInfoPending && !swapInfo && (
          <div className="text-center text-destructive">
            Cannot load swap quote
          </div>
        )}
        {!swapInfoLoading && swapInfo && (
          <div className="text-center text-muted-foreground">
            Loaded swap quote
          </div>
        )}
      </div>
      <CardContent className="space-y-4 p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (error) => {
              console.log(error);
            })}
          >
            {/* Sell Section */}
            <div className="space-y-2">
              <div className="text-lg font-medium">Sell</div>
              <div className="flex items-center justify-between gap-2 bg-white/10 p-4 rounded-lg">
                <FormField
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="border-none outline-none ring-0 bg-transparent text-xl"
                          {...field}
                          // use onchange to ensure the value is a number
                          onChange={(e) => {
                            // Regex to allow only numbers and decimal points
                            const regex = /^\d*(\.\d*)?$/;
                            if (regex.test(e.target.value)) {
                              field.onChange(e.target.value);
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="sourceToken"
                  render={({ field }) => (
                    <SelectSwapToken
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="text-gray-500 flex items-center gap-2">
                ${amountInUSD || <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
            </div>

            {/* Swap Arrow */}
            <div className="flex justify-center">
              <ChevronDown className="h-6 w-6" />
            </div>

            {/* Buy Section */}
            <div className="space-y-2">
              <div className="text-lg font-medium">Buy</div>
              <div className="flex items-center justify-between gap-2 bg-white/10 p-4 rounded-lg">
                <FormField
                  name="buyAmount"
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="border-none bg-transparent text-xl"
                          readOnly
                          value={buyAmount}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name="targetToken"
                  render={({ field }) => (
                    <SelectSwapToken
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="text-gray-500 flex items-center gap-2">
                $
                {buyAmountInUSD || <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-4 w-full">
              <ButtonWithWallet
                type="submit"
                className="w-full text-white py-6"
                disabled={
                  !swapInfo?.updateInputResult.canSwap || swapInfoPending
                }
              >
                Swap
              </ButtonWithWallet>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-gray-500"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SwapWidget;
