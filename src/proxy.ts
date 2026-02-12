import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_CONST } from "./utils/consts";
import { cache } from "./server/redis/cache";
import { db } from "./server/db";
import { eq } from "drizzle-orm";
import { admin } from "./server/db/schema";
import { decodeJWTToID, encodeIDtoJWT } from "./utils/serializer";

async function proxy(req: NextRequest) {
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
    cookieStore.delete(COOKIE_CONST.AUTHORIZED);
    return NextResponse.redirect(home);
  }

  const cacheCheck = await cache.getAuthorized({ id: userId });

  if (!cacheCheck) {
    const user = await db.query.admin.findFirst({
      where: eq(admin.id, userId),
      columns: { id: true },
    });

    if (!user) {
      return NextResponse.redirect(home);
    }
  } else if (cacheCheck !== token.value) {
    cookieStore.delete(COOKIE_CONST.AUTHORIZED);
    return NextResponse.redirect(home);
  }

  const remakeJWT = await encodeIDtoJWT(userId);

  await cache.setAuthorized({ id: userId, jwt: remakeJWT });

  cookieStore.set(COOKIE_CONST.AUTHORIZED, remakeJWT);
  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/dashboard/:path*"],
};
