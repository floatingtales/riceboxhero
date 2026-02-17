import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { cache } from "./server/redis/cache";
import { COOKIE_CONST } from "./utils/consts";
import { decodeJWTToID, encodeIDtoJWT } from "./utils/serializer";

async function middleware(req: NextRequest) {
	const cookieStore = await cookies();
	const home = req.nextUrl.clone();
	home.pathname = "/";

	const token = cookieStore.get(COOKIE_CONST.AUTHORIZED);
	if (!token) {
		return NextResponse.redirect(home);
	}
	if (!token.value) {
		return NextResponse.redirect(home);
	}

	const userId = await decodeJWTToID(token.value);

	if (!userId) {
		const response = NextResponse.redirect(home);
		cookieStore.delete(COOKIE_CONST.AUTHORIZED);
		return response;
	}

	const cacheCheck = await cache.getAuthorized({ id: userId });

	if (cacheCheck && cacheCheck !== token.value) {
		const response = NextResponse.redirect(home);
		cookieStore.delete(COOKIE_CONST.AUTHORIZED);
		await cache.deleteAuthorized({ id: userId });
		return response;
	}

	const remakeJWT = await encodeIDtoJWT(userId);

	await cache.setAuthorized({ id: userId, jwt: remakeJWT });

	const response = NextResponse.next();
	cookieStore.set(COOKIE_CONST.AUTHORIZED, remakeJWT);
	return response;
}

export default middleware;

export const config = {
	matcher: ["/dashboard/:path*"],
};
