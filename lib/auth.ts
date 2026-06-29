import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

       const user = await prisma.user.findUnique({
  where: {
    email: (credentials.email as string).toLowerCase().trim(),
  },
});

        if (!user) {
          return null;
        }

        const validPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!validPassword) {
          return null;
        }

        let name = "User";

        if (user.role === "ADMIN") {
          name = "Admin";
        } else {
          const candidate = await prisma.candidate.findUnique({
            where: {
              userId: user.id,
            },
            select: {
              firstName: true,
              lastName: true,
            },
          });

          if (candidate) {
            name = `${candidate.firstName} ${candidate.lastName ?? ""}`.trim();
          }
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
       token.id = user.id ?? "";
        token.role = (user as any).role;
        token.name = user.name;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },
});