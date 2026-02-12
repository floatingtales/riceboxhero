import { env } from "@/env";
import * as jose from "jose";

export const encodeIDtoJWT = async (id: string) => {
  const jwt = await new jose.SignJWT({ id })
    .setProtectedHeader({ alg: "HS512" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(env.JWT_SECRET));

  return jwt;
};

export const decodeJWTToID = async (jwt: string) => {
  try {
    const { payload } = await jose.jwtVerify(
      jwt,
      new TextEncoder().encode(env.JWT_SECRET),
    );

    const userId = payload.id as string;

    if (!userId) {
      throw new Error("no ID");
    }

    return userId;
  } catch (_e) {
    return null;
  }
};
