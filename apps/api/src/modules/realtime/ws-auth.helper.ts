export function readHandshakeToken(handshake: {
  readonly auth?: { readonly token?: unknown };
  readonly headers: { readonly authorization?: string | string[] | undefined };
}): string | null {
  const authToken = handshake.auth?.token;
  if (typeof authToken === "string" && authToken.trim().length > 0) {
    return authToken.trim();
  }
  const header = handshake.headers.authorization;
  const value = Array.isArray(header) ? header[0] : header;
  if (value === undefined || !value.startsWith("Bearer ")) {
    return null;
  }
  const token = value.slice("Bearer ".length).trim();
  return token.length === 0 ? null : token;
}
