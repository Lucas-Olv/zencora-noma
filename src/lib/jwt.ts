import * as jose from "jose";

const publicKeyPromise = jose.importSPKI(
  import.meta.env.VITE_AUTH_API_PUBLIC_KEY!.replace(/\\n/g, "\n"),
  import.meta.env.VITE_AUTH_JWT_ALGORITHM!,
);

export async function verifyToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, await publicKeyPromise, {
      audience: import.meta.env.VITE_AUTH_AUDIENCE, // ex: 'zencora-app'
      issuer: import.meta.env.VITE_AUTH_ISSUER, // ex: 'https://zencora.com'
    });

    return payload;
  } catch (err) {
    console.error("JWT inválido:", err);
    throw err;
  }
}
