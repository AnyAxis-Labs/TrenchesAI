import { tool } from "ai";
import { TwitterApi } from "twitter-api-v2";
import { z } from "zod";

export const getTweet = tool({
  description: "Get a tweet from it's url and return the text",
  parameters: z.object({
    url: z.string(),
  }),

  execute: async ({ url }) => {
    // extract the tweet id from the url
    const tweetId = url.split("/").pop();

    const appKey = process.env.TWITTER_CONSUMER_KEY;
    const appSecret = process.env.TWITTER_CONSUMER_SECRET;

    if (!tweetId) {
      return "Tweet ID is not found in the url";
    }

    if (!appKey || !appSecret) {
      throw new Error(
        "TWITTER_CONSUMER_KEY or TWITTER_CONSUMER_SECRET is not set"
      );
    }
    try {
      const twitterApi = new TwitterApi({
        appKey,
        appSecret,
      });

      const appClient = await twitterApi.appLogin();

      const tweet = await appClient.v2.singleTweet(tweetId);

      return tweet.data.text;
    } catch (error) {
      console.error("Error getting tweet", tweetId, error);
      return "Error getting tweet";
    }
  },
});
