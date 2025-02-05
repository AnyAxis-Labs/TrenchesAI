import { generateUUID } from "@/lib/utils";
import { type DataStreamWriter, streamObject, tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { customModel } from "..";
import type { Model } from "../models";
import { codePrompt } from "../prompts";

interface GetSwapRequestProps {
  model: Model;
  session: Session;
  dataStream: DataStreamWriter;
}

export const getSwapRequest = ({
  model,
  session,
  dataStream,
}: GetSwapRequestProps) =>
  tool({
    description:
      "get the correct source and target tokens symbols and amount for a swap request",
    parameters: z.object({
      message: z.string(),
    }),
    execute: async ({ message }) => {
      const id = generateUUID();

      console.log("message", message);

      const { fullStream } = streamObject({
        model: customModel(model.apiIdentifier),
        system: codePrompt,
        prompt: message,
        schema: z.object({
          sourceSymbol: z.string(),
          targetSymbol: z.string(),
          amount: z.number(),
        }),
      });

      for await (const delta of fullStream) {
        const { type } = delta;

        if (type === "object") {
          const { object } = delta;
          const { sourceSymbol, targetSymbol, amount } = object;

          if (sourceSymbol && targetSymbol && amount) {
            console.log("sourceSymbol", sourceSymbol);
            console.log("targetSymbol", targetSymbol);
            console.log("amount", amount);

            dataStream.writeData({
              type: "swap-request",
              content: {
                sourceSymbol,
                targetSymbol,
                amount,
              },
            });
          }
        }
      }

      dataStream.writeData({ type: "finish", content: "" });

      if (session.user?.id) {
        // TODO: save the swap request to the database
        // await saveDocument({
        //   id,
        //   title,
        //   kind,
        //   content: draftText,
        //   userId: session.user.id,
        // });
      }

      return {
        id,
        content: "A swap request was created.",
      };
    },
  });
