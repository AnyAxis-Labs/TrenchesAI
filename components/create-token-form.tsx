import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateAmmPool } from "@/hooks/use-create-amm-pool";
import { useCreateMarket } from "@/hooks/use-create-market";
import {
  type CreateTokenParams,
  MINT_AMOUNT,
  TOKEN_DECIMALS,
  useCreateTokenSc,
} from "@/hooks/use-create-solana-token";
import { PublicKey } from "@solana/web3.js";
import { useMutation } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import BN from "bn.js";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface CreateTokenFormProps {
  initialValues?: Partial<CreateTokenParams>;
  onCancel: () => void;
  onSuccess: ({ tokenAddress }: { tokenAddress: string }) => void;
}

interface ExtendedCreateTokenParams extends CreateTokenParams {
  adminUsername: string;
  message?: string;
}

export const CreateTokenForm = ({
  initialValues,
  onSuccess,
  onCancel,
}: CreateTokenFormProps) => {
  const { mutateAsync: createToken, isPending: isCreatingToken } =
    useCreateTokenSc();
  const { mutateAsync: createMarket, isPending: isCreatingMarket } =
    useCreateMarket();
  const { mutateAsync: createAmmPool, isPending: isCreatingAmmPool } =
    useCreateAmmPool();

  const form = useForm<ExtendedCreateTokenParams>({
    defaultValues: {
      name: initialValues?.name ?? "",
      symbol: initialValues?.symbol ?? "",
      description: initialValues?.description ?? "",
      url: initialValues?.url ?? "",
      adminUsername: "",
    },
  });

  const {
    mutateAsync: createTelegramGroup,
    isPending: isCreatingTelegramGroup,
  } = useMutation({
    mutationFn: async (data: ExtendedCreateTokenParams) => {
      toast.loading("Creating Telegram group...");
      const response = await fetch("/api/social/telegram", {
        method: "POST",
        body: JSON.stringify({
          groupName: data.name,
          groupDescription: data.description,
          adminUsername: data.adminUsername,
          imageUrl: data.url,
          message: data.message,
        }),
      });

      toast.success("Telegram group created successfully");
      return response.json();
    },
  });

  const onSubmit = async (data: ExtendedCreateTokenParams) => {
    try {
      const token = await createToken(data);
      await createTelegramGroup({ ...data, message: `🚀 CA: ${token.mint}` });
      const marketId = await createMarket({ mint: new PublicKey(token.mint) });

      console.log("marketId", marketId.toBase58());

      const ammPool = await createAmmPool({
        mint: new PublicKey(token.mint),
        marketId,
        baseAmount: new BN(
          new BigNumber(MINT_AMOUNT)
            .multipliedBy(0.1)
            .multipliedBy(new BigNumber(10).pow(TOKEN_DECIMALS))
            .toFixed()
        ),
        quoteAmount: new BN(
          new BigNumber(4)
            .multipliedBy(new BigNumber(10).pow(TOKEN_DECIMALS))
            .toFixed()
        ),
      });

      console.log(ammPool.extInfo.address.ammId.toBase58());

      form.reset();
      onSuccess({ tokenAddress: token.mint });
    } catch (error) {
      console.error("Error creating token:", error);
    }
  };

  return (
    <Card className="w-full p-6">
      <CardHeader>
        <CardTitle>Create Token</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter token name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Symbol</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter token symbol"
                      {...field}
                      maxLength={5}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^A-Za-z]/g, "");
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter token description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input placeholder="Enter token Image URL" {...field} />
                      {field.value && (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                          <img
                            src={field.value}
                            alt="Token preview"
                            className="object-contain w-full h-full"
                            onError={(e) => {
                              e.currentTarget.src = "";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adminUsername"
              rules={{
                required: "Telegram admin username is required",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telegram Admin Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Telegram username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isCreatingToken || isCreatingTelegramGroup}
              >
                {isCreatingToken && "Creating Token"}
                {isCreatingTelegramGroup && "Creating Telegram Group"}
                {!isCreatingToken && !isCreatingTelegramGroup && "Create Token"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
