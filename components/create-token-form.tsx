import { updateMessages } from "@/app/(chat)/actions";
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
import { useCreateTelegramGroup } from "@/hooks/use-create-telegram-group";
import { generateUUID } from "@/lib/utils";
import { PublicKey } from "@solana/web3.js";
import type { Message } from "ai";
import BigNumber from "bignumber.js";
import BN from "bn.js";
import { useForm } from "react-hook-form";

interface CreateTokenFormProps {
  initialValues?: Partial<CreateTokenParams>;
  chatId: string;
  message: Message;
  toolCallId: string;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void;
}

interface ExtendedCreateTokenParams extends CreateTokenParams {
  adminUsername: string;
  message?: string;
}

export const CreateTokenForm = ({
  initialValues,
  chatId,
  message,
  setMessages,
  toolCallId,
}: CreateTokenFormProps) => {
  const { mutateAsync: createToken, isPending: isCreatingToken } =
    useCreateTokenSc();
  const { mutateAsync: createMarket, isPending: isCreatingMarket } =
    useCreateMarket();
  const { mutateAsync: createAmmPool, isPending: isCreatingAmmPool } =
    useCreateAmmPool();

  const form = useForm<ExtendedCreateTokenParams>({
    defaultValues: {
      ...initialValues,
      adminUsername: "",
    },
  });

  const {
    mutateAsync: createTelegramGroup,
    isPending: isCreatingTelegramGroup,
  } = useCreateTelegramGroup();

  // Helper function to add messages to the chat
  const addMessage = (content: string) => {
    setMessages((messages) => {
      const newMessage: Message = {
        id: generateUUID(),
        role: "assistant",
        content,
        createdAt: new Date(),
      };
      const newMessages = [...messages, newMessage];
      updateMessages(chatId, [newMessage]);
      return newMessages;
    });
  };

  const onCancel = () => {
    setMessages((messages) => {
      const newMessages = messages
        .map((msg) => {
          if (msg.id === message.id) {
            return {
              ...msg,
              toolInvocations: msg.toolInvocations?.filter(
                (toolInvocation) => toolInvocation.toolCallId !== toolCallId
              ),
            };
          }
          return msg;
        })
        .concat([
          {
            id: generateUUID(),
            role: "assistant",
            content: `Action cancelled`,
            createdAt: new Date(),
          },
        ]);

      updateMessages(chatId, newMessages);
      return newMessages;
    });
  };

  const createAmmPoolWithParams = async (mint: string, marketId: PublicKey) => {
    return createAmmPool({
      mint: new PublicKey(mint),
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
  };

  const onSubmit = async (data: ExtendedCreateTokenParams) => {
    try {
      // Create token
      const token = await createToken(data);
      addMessage(`🚀 Token created: \`${token.mint}\``);

      try {
        // Create Telegram group
        const { inviteLink, groupId, groupName } = await createTelegramGroup({
          ...data,
          message: `🚀 CA: ${token.mint}`,
        });
        addMessage(
          `💬 Telegram group created: [Join Group](${inviteLink}) [Group ID: ${groupId}] [Group Name: ${groupName}]`
        );
      } catch (error) {
        console.error("Error creating Telegram group:", error);
        addMessage(
          `❌ Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }

      // Create market
      const marketId = await createMarket({ mint: new PublicKey(token.mint) });
      addMessage(`📊 Market created: \`${marketId.toBase58()}\``);

      // Create AMM pool
      const ammPool = await createAmmPoolWithParams(token.mint, marketId);
      addMessage(
        `💧 Liquidity pool created: \`${ammPool.extInfo.address.ammId.toBase58()}\``
      );

      form.reset();
    } catch (error) {
      console.error("Error creating token:", error);
      addMessage(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
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
