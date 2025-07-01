import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { transporter } from "@/lib/email/nodemailer";
import { getClientInfo } from "@/lib/getClientInfo";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {};
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user?.verified || !user.password) return null;
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          // Collect info from headers
          const clientInfo = await getClientInfo();

          // Save failed attempt
          await prisma.failedLoginAttempt.create({
            data: {
              email,
              ipAddress: clientInfo.ip,
              userAgent: clientInfo.userAgent,
              success: false,
            },
          });

          //send alert message
          if (user.email) {
            await transporter.sendMail({
              from: `"GRGATE" <${process.env.EMAIL_USER}>`,
              to: user.email,
              subject: "⚠️ Failed Login Attempt Detected",
              html: `
                  <h2>Hi ${user.name || "User"},</h2>
                  <p>We detected a failed login attempt on your account:</p>
                  <ul>
                    <li><strong>IP:</strong> ${clientInfo.ip}</li>
                    <li><strong>User Agent:</strong> ${
                      clientInfo.userAgent
                    }</li>
                  </ul>
                  <p>If this wasn't you, please secure your account immediately.</p>
                `,
            });

            await prisma.failedLoginAttempt.deleteMany({
              where: { email },
            });
          }
          return null;
        }
        return user;
      },
    }),
  ],
  secret: process.env.JWT_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },
  callbacks: {
    async signIn({ user, account }) {
      if (
        account &&
        (account.provider === "google" || account.provider === "github")
      ) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        // Block if user exists but used a different provider
        if (
          existingUser &&
          existingUser.provider &&
          existingUser.provider !== account.provider
        ) {
          throw new Error(
            "Email already exists with a different login method."
          );
        }

        // Automatically verify OAuth users
        await prisma.user.update({
          where: { email: user.email! },
          data: {
            verified: true,
            emailVerified: new Date(),
          },
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id && token?.role) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
