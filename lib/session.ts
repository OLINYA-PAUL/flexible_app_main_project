import { getServerSession } from "next-auth/next";
import { NextAuthOptions, User } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import { SessionInterface, UserProfile } from "@/common.types";
import { createUser, getUser } from "./action";

export const authOptions: NextAuthOptions = {
  // secret: process.env.NEXTAUTH_URL,
  providers: [
    GoogleProvider({
      //@ts-ignore
      clientId: process.env.GOOGLE_CLIENT_ID,
      //@ts-ignore
      clientSecret: process.env.GOOGLE_CLIENT_SECERT_KEY,
    }),
  ],
  jwt: {
      //@ts-ignore
    encode: ({ secret, token }) => {},
      //@ts-ignore
    decode: async ({ secret, token }) => {},
  },
  theme: {
    colorScheme: "light",
    logo: "/logo.png",
  },
  callbacks: {
    async session({ session }) {
      const email = session?.user?.email as string;
      try {
        const data = await getUser(email) as {user?: UserProfile}

        const userSession = {
          ...session,
          user:{
            ...session?.user,
            ...data?.user
          }
        }
        
        return session;
      } catch (error) {
        console.log(error)
        return session
      }
      return session
    },
    //@ts-ignore
    async signIn({ user }: { user: AdapterUser | User }) {
      try {
        // If user is is available login user
        const userExist = getUser(user?.email as string) as {
          user?: UserProfile;
        };

        // If there is no user create new user from the dataBase
        if (!userExist.user) {
          await createUser(
            user.name as string,
            user.email as string,
            user.image as string
          );
        }
        return true;
      } catch (error: any) {
        console.log(error.message);
      }
    },
  },
};

export async function getCurrentUser() {
  const session = (await getServerSession(authOptions)) as SessionInterface;
  return session;
}
