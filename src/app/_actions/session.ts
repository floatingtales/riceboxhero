"use server";

import { Ratelimit } from "@upstash/ratelimit";
import * as bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { env } from "@/env";
import { db } from "@/server/db";
import { admin } from "@/server/db/schema";
import { cache } from "@/server/redis/cache";
import { COOKIE_CONST, PATH_CONST, STATUS_CONST } from "@/utils/consts";
import { encodeIDtoJWT } from "@/utils/serializer";

export const login = async ({
	ip,
	username,
	password,
}: {
	ip: string;
	username: string;
	password: string;
}) => {
	const rateLimit = new Ratelimit({
		redis: cache.redis,
		limiter: Ratelimit.slidingWindow(5, "5m"),
	});

	const { success } = await rateLimit.limit(`login-attempt-${ip}`);

	if (!success) {
		throw new Error("Too many attempts");
	}

	const user = await db.query.admin.findFirst({
		where: eq(admin.username, username),
		columns: { id: true, username: true, password: true, isActive: true },
	});

	if (!user) {
		return { status: STATUS_CONST.ALERT, message: "User not found" };
	}

	if (!user.isActive) {
		return { status: STATUS_CONST.ALERT, message: "Account is inactive" };
	}

	const isPasswordCorrect = await bcrypt.compare(password, user.password);

	if (!isPasswordCorrect) {
		return { status: STATUS_CONST.ALERT, message: "Invalid password" };
	}

	const jwt = await encodeIDtoJWT(user.id);

	const isProduction = env.NODE_ENV === "production";

	const cookieStore = await cookies();

	cookieStore.set(COOKIE_CONST.AUTHORIZED, jwt, {
		httpOnly: true,
		secure: isProduction,
		maxAge: 60 * 60, // 1 hour
	});

	await cache.setAuthorized({ id: user.id, jwt });

	return { status: STATUS_CONST.REDIRECT, href: PATH_CONST.DASHBOARD };
};

export const logout = async () => {
	const cookieStore = await cookies();
	cookieStore.delete(COOKIE_CONST.AUTHORIZED);
	return { status: STATUS_CONST.REDIRECT, href: PATH_CONST.HOME };
};

export const checkSession = async () => {
	const cookieStore = await cookies();
	const token = cookieStore.get(COOKIE_CONST.AUTHORIZED);
	return !!token;
};
