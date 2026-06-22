// Minimal App Store Connect API client. Signs an ES256 JWT with the .p8 key
// (read from disk via ASC_KEY_PATH — never printed) and makes one request.
//
// Usage:
//   ASC_KEY_PATH=… ASC_KEY_ID=… ASC_ISSUER_ID=… \
//     node native/asc-api.mjs <METHOD> <path> [jsonBody]
// Example:
//   node native/asc-api.mjs GET "/v1/apps?filter[bundleId]=com.astradaclub.app"
import crypto from "node:crypto";
import fs from "node:fs";

const [, , method = "GET", apiPath = "/v1/apps", bodyArg] = process.argv;
const { ASC_KEY_PATH, ASC_KEY_ID, ASC_ISSUER_ID } = process.env;
if (!ASC_KEY_PATH || !ASC_KEY_ID || !ASC_ISSUER_ID) {
  console.error("Missing ASC_KEY_PATH / ASC_KEY_ID / ASC_ISSUER_ID");
  process.exit(1);
}

const key = fs.readFileSync(ASC_KEY_PATH, "utf8");
const b64url = (s) => Buffer.from(s).toString("base64url");
const now = Math.floor(Date.now() / 1000);
const header = b64url(JSON.stringify({ alg: "ES256", kid: ASC_KEY_ID, typ: "JWT" }));
const payload = b64url(
  JSON.stringify({ iss: ASC_ISSUER_ID, iat: now, exp: now + 1200, aud: "appstoreconnect-v1" }),
);
const input = `${header}.${payload}`;
const sig = crypto
  .sign("SHA256", Buffer.from(input), { key, dsaEncoding: "ieee-p1363" })
  .toString("base64url");
const jwt = `${input}.${sig}`;

const res = await fetch(`https://api.appstoreconnect.apple.com${apiPath}`, {
  method,
  headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
  body: bodyArg || undefined,
});
console.log(`HTTP ${res.status}`);
console.log(await res.text());
