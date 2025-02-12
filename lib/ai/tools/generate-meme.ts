import axios from "axios";
import { tool } from "ai";
import { z } from "zod";

export const generateMeme = tool({
  description: "Generate a meme token",
  parameters: z.object({
    prompt: z.string(),
  }),
  execute: async ({ prompt }) => {
    const url = process.env.GENERATE_MEME_URL;
    if (!url) {
      throw new Error("GENERATE_MEME_URL is not set");
    }
    const response = await axios.post(url, {
      idea: prompt,
    });

    const memeData = response.data;
    return memeData;
  },
});
