import { parseQueryString } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "./button";
import { ButtonWithWallet } from "./button-with-wallet";
import { Card, CardContent } from "./card";
import { Form, FormControl, FormField, FormItem } from "./form";
import { Input } from "./input";

interface StakeParams {
  amount: string;
  source: string;
  target: string;
}

interface StakeFormValues {
  amount: string;
}

const StakeWidget = ({ params }: { params: string }) => {
  const { amount, source, target } = parseQueryString<StakeParams>(params);
  const form = useForm<StakeFormValues>({
    defaultValues: { amount },
  });

  const formAmount = form.watch("amount");

  function onSubmit(values: StakeFormValues) {}

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-center">Staking Agent</h1>

      {true && (
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="space-y-4 p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <div className="text-lg font-medium">Lock</div>
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
                    <Button variant="ghost" className="flex items-center gap-2">
                      <img src={source} alt={source} className="w-6 h-6" />
                      {source}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-gray-500 flex items-center gap-2">
                    $
                    {/* {amountInUSD || (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )} */}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-4 w-full">
                  <ButtonWithWallet
                    type="submit"
                    className="w-full text-white py-6"
                    // disabled={
                    // }
                  >
                    Stake
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
      )}
    </div>
  );
};

export default StakeWidget;
