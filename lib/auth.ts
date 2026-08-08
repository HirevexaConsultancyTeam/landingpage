// ============================================================================
//  DESTINATION:  lib/auth.ts   (replaces your existing file)
//  Adds rate limiting to the credentials login.
// ============================================================================
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit, resetRateLimit, getClientIp } from "@/lib/rateLimit";

/** Per email+IP. Tight, because a real person rarely fails five times in a row. */
const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_SECONDS = 15 * 60;

/** Per IP across all emails. Catches stuffing that rotates the email each time. */
const IP_LIMIT = 20;
const IP_WINDOW_SECONDS = 15 * 60;

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const ip = request ? getClientIp(request as unknown as Request) : "unknown";

        // Two limits. The email+IP one stops brute force against a known
        // account; the IP-wide one stops stuffing that rotates emails, which
        // would otherwise never trip a per-account counter.
        const [byAccount, byIp] = await Promise.all([
          checkRateLimit(`login:${email}:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_SECONDS),
          checkRateLimit(`login-ip:${ip}`, IP_LIMIT, IP_WINDOW_SECONDS),
        ]);

        if (!byAccount.allowed || !byIp.allowed) {
          // Returning null gives the same "invalid credentials" the user would
          // see anyway. Saying "you are rate limited" would confirm to an
          // attacker that they'd found a real account worth queuing against.
          console.warn(`Rate limited login attempt: ${email} from ${ip}`);
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          // Hash a dummy string so a missing account takes about as long as a
          // wrong password. Without this, response timing tells an attacker
          // which emails are registered.
          await bcrypt.compare(
            credentials.password as string,
            "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin"
          );
          return null;
        }

        const validPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!validPassword) {
          return null;
        }

        // Successful login clears the account counter so a user who mistyped
        // twice then got in isn't left near the limit.
        await resetRateLimit(`login:${email}:${ip}`);

        let name = "User";

        if (user.role === "ADMIN") {
          name = "Admin";
        } else {
          const candidate = await prisma.candidate.findUnique({
            where: { userId: user.id },
            select: { firstName: true, lastName: true },
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
        token.role = (user as { role?: string }).role;
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