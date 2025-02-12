import { ThirdwebStorage } from "@thirdweb-dev/storage";
import { NextResponse, type NextRequest } from "next/server";

const storage = new ThirdwebStorage({
  secretKey: process.env.THIRDWEB_SECRET_KEY,
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  const uri = await storage.upload(body);
  const url = await storage.resolveScheme(uri);

  return NextResponse.json({ uri, url });
}
