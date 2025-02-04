import { createOpenAI } from "@ai-sdk/openai";
import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";

import { customMiddleware } from "./custom-middleware";
const openai = createOpenAI({
  baseURL: process.env.OPENAI_API_BASE_URL,
});
export const customModel = (apiIdentifier: string) => {
  return wrapLanguageModel({
    model: openai(apiIdentifier, {}),
    middleware: customMiddleware,
  });
};

export const imageGenerationModel = openai.image("dall-e-3");
