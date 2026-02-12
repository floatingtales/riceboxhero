import z from "zod";
import { authedProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import * as bcrypt from "bcrypt";
import * as jose from "jose";

import { Ratelimit } from "@upstash/ratelimit";
import { eq } from "drizzle-orm";
import { admin } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { COOKIE_CONST, PATH_CONST, STATUS_CONST } from "@/utils/consts";
import { env } from "@/env";

export const sessionRouter = createTRPCRouter({
  login: publicProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { username, password } = input;

      const rateLimit = new Ratelimit({
        redis: ctx.cache.redis,
        limiter: Ratelimit.slidingWindow(5, "5m"),
      });

      const { success, reset, remaining } = await rateLimit.limit(
        `login-attempt-${ctx.ip}`,
      );

      if (!success) {
        const resetTime = new Date(reset).toLocaleTimeString();
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Too many attempts, try again in ${resetTime}`,
        });
      }

      const user = await ctx.db.query.admin.findFirst({
        where: eq(admin.username, username),
        columns: { id: true, username: true, password: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Did not find user",
        });
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "wrong password",
        });
      }

      const jwt = await new jose.SignJWT({ id: user.id })
        .setProtectedHeader({ alg: "HS512" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(new TextEncoder().encode(env.JWT_SECRET));

      ctx.cookieStore.set(COOKIE_CONST.AUTHORIZED, jwt, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        maxAge: 1 * 60 * 60 * 1000, // 1 hour
      });

      await ctx.cache.setAuthorized({ id: user.id, jwt });

      return { status: STATUS_CONST.REDIRECT, href: PATH_CONST.DASHBOARD };
    }),

  logout: authedProcedure.mutation(async ({ ctx }) => {
    ctx.cookieStore.delete(COOKIE_CONST.AUTHORIZED);

    return { status: STATUS_CONST.REDIRECT, href: PATH_CONST.HOME };
  }),
});
