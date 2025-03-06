import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

interface TwitterRequest {
  tweetId: string;
}

export async function POST(req: Request) {
  const body: TwitterRequest = await req.json();
  const { tweetId } = body;
  if (!tweetId) {
    return new Response("Invalid request", { status: 400 });
  }

  const appKey = process.env.TWITTER_CONSUMER_KEY;
  const appSecret = process.env.TWITTER_CONSUMER_SECRET;

  if (!appKey || !appSecret) {
    return new Response(
      "TWITTER_CONSUMER_KEY or TWITTER_CONSUMER_SECRET is not set",
      {
        status: 500,
      }
    );
  }

  try {
    const twitterApi = new TwitterApi({
      appKey,
      appSecret,
    });

    const appClient = await twitterApi.appLogin();

    const tweet = await appClient.v2.singleTweet(tweetId);
    const result = await appClient.v2.search("@LucasVxu", {
      max_results: 10,
      next_token: undefined,
      expansions: ["author_id", "in_reply_to_user_id"],
    });
    console.log(result.data);

    return NextResponse.json({
      success: true,
      tweet: tweet.data.text,
    });
  } catch (error) {
    console.error("Error getting tweet", tweetId, error);
    return NextResponse.json(
      {
        success: false,
        error: "Error getting tweet",
      },
      { status: 500 }
    );
  }
}
