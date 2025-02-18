"use client";

import { updateMessages } from "@/app/(chat)/actions";
import type { ToolName } from "@/lib/ai/tools";
import type { Vote } from "@/lib/db/schema";
import { cn, generateUUID } from "@/lib/utils";
import type { ChatRequestOptions, Message } from "ai";
import cx from "classnames";
import equal from "fast-deep-equal";
import { AnimatePresence, motion } from "framer-motion";
import { Fragment, memo, useState } from "react";
import { CreateTokenForm } from "./create-token-form";
import { PencilEditIcon, SparklesIcon } from "./icons";
import { Markdown } from "./markdown";
import { MessageActions } from "./message-actions";
import { MessageEditor } from "./message-editor";
import { PreviewAttachment } from "./preview-attachment";
import BridgeWidget from "./ui/bridge-widget";
import { Button } from "./ui/button";
import StakeWidget from "./ui/stake-widget";
import SwapWidget from "./ui/swap-widget";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
}: {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  // Parse function calls if message content matches XML format
  const parseFunctionCalls = (content: string) => {
    const functions = [];
    const functionMatches = content.matchAll(/<function[^>]*>/g);

    for (const match of functionMatches) {
      const functionStr = match[0];
      const nameMatch = functionStr.match(/name="([^"]+)"/);
      const paramsMatch = functionStr.match(/parameters="([^"]+)"/);

      if (nameMatch && paramsMatch) {
        functions.push({
          name: nameMatch[1],
          parameters: paramsMatch[1],
        });
      }
    }

    return functions.length > 0 ? functions : null;
  };

  const messageFunctions =
    typeof message.content === "string"
      ? parseFunctionCalls(message.content)
      : null;

  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            {
              "w-full": mode === "edit",
              "group-data-[role=user]/message:w-fit": mode !== "edit",
            }
          )}
        >
          {message.role === "assistant" && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 w-full">
            {message.experimental_attachments && (
              <div className="flex flex-row justify-end gap-2">
                {message.experimental_attachments.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {message.content && mode === "view" && (
              <div className="flex flex-row gap-2 items-start">
                {message.role === "user" && !isReadonly && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                        onClick={() => {
                          setMode("edit");
                        }}
                      >
                        <PencilEditIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit message</TooltipContent>
                  </Tooltip>
                )}

                <div
                  className={cn("flex flex-col gap-4", {
                    "bg-primary text-primary-foreground px-3 py-2 rounded-xl":
                      message.role === "user",
                  })}
                >
                  {messageFunctions ? (
                    <pre>
                      {messageFunctions.map((functionCall) => (
                        <Fragment key={functionCall.parameters}>
                          {functionCall.name === "swap_token" && (
                            <SwapWidget params={functionCall.parameters} />
                          )}
                          {functionCall.name === "stake_token" && (
                            <StakeWidget params={functionCall.parameters} />
                          )}
                          {functionCall.name === "bridge_token" && (
                            <BridgeWidget params={functionCall.parameters} />
                          )}
                        </Fragment>
                      ))}
                    </pre>
                  ) : (
                    <Markdown>{message.content}</Markdown>
                  )}
                </div>
              </div>
            )}

            {message.content && mode === "edit" && (
              <div className="flex flex-row gap-2 items-start">
                <div className="size-8" />

                <MessageEditor
                  key={message.id}
                  message={message}
                  setMode={setMode}
                  setMessages={setMessages}
                  reload={reload}
                />
              </div>
            )}

            {message.toolInvocations && message.toolInvocations.length > 0 && (
              <div className="flex flex-col gap-4">
                {message.toolInvocations.map((toolInvocation) => {
                  const { toolCallId, state, args } = toolInvocation;
                  const toolName = toolInvocation.toolName as ToolName;
                  if (state === "result") {
                    const { result } = toolInvocation;

                    return (
                      <div key={toolCallId}>
                        {toolName === "getTweet" ? (
                          <Markdown>{`**Tweet:**\n\n${result}`}</Markdown>
                        ) : toolName === "generateMeme" && result.meme_info ? (
                          <CreateTokenForm
                            initialValues={{
                              description: result.meme_info.token_story,
                              name: result.meme_info.token_name,
                              symbol: result.meme_info.token_symbol.replace(
                                /[^A-Za-z]/g,
                                ""
                              ),
                              url: result.meme_image,
                            }}
                            onSuccess={({ tokenAddress }) => {
                              setMessages((messages) => {
                                const newMessage: Message = {
                                  id: generateUUID(),
                                  role: "assistant",
                                  content: `🚀 CA: \`${tokenAddress}\``,
                                  toolInvocations: [
                                    {
                                      toolCallId: generateUUID(),
                                      toolName: "addLiquidity",
                                      state: "result",
                                      args: { tokenAddress },
                                    },
                                  ],
                                  createdAt: new Date(),
                                } as Message;

                                const newMessages = [...messages, newMessage];

                                updateMessages(chatId, [newMessage]);

                                return newMessages;
                              });
                            }}
                            onCancel={() => {
                              setMessages((messages) => {
                                const newMessages = messages
                                  .map((msg) => {
                                    if (msg.id === message.id) {
                                      return {
                                        ...msg,
                                        toolInvocations:
                                          msg.toolInvocations?.filter(
                                            (toolInvocation) =>
                                              toolInvocation.toolCallId !==
                                              toolCallId
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
                            }}
                          />
                        ) : (
                          <pre>{JSON.stringify(result, null, 2)}</pre>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={toolCallId}
                      className={cx({
                        skeleton: ["getWeather"].includes(toolName),
                      })}
                    >
                      {/* {toolName === "getWeather" ? (
                        <Weather />
                      ) : toolName === "createDocument" ? (
                        <DocumentPreview isReadonly={isReadonly} args={args} />
                      ) : toolName === "updateDocument" ? (
                        <DocumentToolCall
                          type="update"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === "requestSuggestions" ? (
                        <DocumentToolCall
                          type="request-suggestions"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : null} */}
                    </div>
                  );
                })}
              </div>
            )}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.content !== nextProps.message.content) return false;
    if (
      !equal(
        prevProps.message.toolInvocations,
        nextProps.message.toolInvocations
      )
    )
      return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
  }
);

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          }
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
