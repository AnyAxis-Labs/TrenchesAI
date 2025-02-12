import { createUser, findUser, getUser } from "@/lib/db/queries";
import { type SIWXSession, SIWXMessage } from "@reown/appkit";
import type { NextAuthConfig } from "next-auth";
import credentialsProvider from "next-auth/providers/credentials";

function getAddressFromMessage(message: string) {
  const address = message.split("\n")[1].trim();
  return address;
}

function getChainIdFromMessage(message: string) {
  const chainId = message.split("\n")[5].split(":")[1].trim();
  return chainId;
}
declare module "next-auth" {
  interface Session extends SIWXSession {
    address: string;
    chainId: string;
    user: {
      id: string;
      address: string;
    };
  }
}

const nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (!nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET is not set");
}

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is not set");
}

const providers = [
  credentialsProvider({
    name: "Ethereum",
    credentials: {
      message: {
        label: "Message",
        type: "text",
        placeholder: "0x0",
      },
      signature: {
        label: "Signature",
        type: "text",
        placeholder: "0x0",
      },
    },
    async authorize(credentials) {
      try {
        if (!credentials?.message || typeof credentials.message !== "string") {
          throw new Error("SiweMessage is undefined");
        }
        const { message } = credentials;

        const address = getAddressFromMessage(message);
        const chainId = getChainIdFromMessage(message);

        const users = await findUser(address);
        let user = users[0];
        if (users.length === 0) {
          await createUser(address);
          [user] = await findUser(address);
        }
        return {
          ...user,
          chainId,
        };
      } catch (e) {
        return null;
      }
    },
  }),
];

export const authConfig = {
  secret: nextAuthSecret,
  pages: {
    signIn: "/login",
    newUser: "/",
  },
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (!token.user) {
        return session;
      }

      const user: any = token.user;

      if (user.address) {
        session.address = user.address;
      }
      session.user = user;
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnChat = nextUrl.pathname.startsWith("/");
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL("/", nextUrl as unknown as URL));
      }

      if (isOnLogin) {
        return true; // Always allow access to register and login pages
      }

      if (isOnChat) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      if (isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl as unknown as URL));
      }

      return true;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
