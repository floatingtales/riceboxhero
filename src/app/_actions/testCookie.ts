"use server";

import { cookies } from "next/headers";
import { env } from "@/env";
import { COOKIE_CONST } from "@/utils/consts";

export const setCookie = async (value: string) => {
	const isProduction = env.NODE_ENV === "production";
	const cookieStore = await cookies();
	cookieStore.set(COOKIE_CONST.AUTHORIZED, value, {
		httpOnly: true,
		secure: isProduction,
		maxAge: 60 * 60, // 1 hour
	});
};

export const deleteCookie = async (name: string) => {
	const cookieStore = await cookies();
	cookieStore.delete(name);
};

export const getCookie = async () => {
	const cookieStore = await cookies();
	return cookieStore.get(COOKIE_CONST.AUTHORIZED);
};
