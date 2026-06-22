// Attempts to create an Apple Distribution certificate via the App Store Connect
// API, using a CSR at build/dist.csr. Reads the .p8 from ASC_KEY_PATH (never
// printed). On success, writes the cert DER to build/dist.cer.
import crypto from "node:crypto";
import fs from "node:fs";

const { ASC_KEY_PATH, ASC_KEY_ID, ASC_ISSUER_ID } = process.env;
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

const csr = fs.readFileSync("build/dist.csr", "utf8");
const body = JSON.stringify({
  data: {
    type: "certificates",
    attributes: { certificateType: "DISTRIBUTION", csrContent: csr },
  },
});
const res = await fetch("https://api.appstoreconnect.apple.com/v1/certificates", {
  method: "POST",
  headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
  body,
});
console.log("HTTP", res.status);
const text = await res.text();
if (res.ok) {
  const cert = JSON.parse(text).data.attributes.certificateContent;
  fs.writeFileSync("build/dist.cer", Buffer.from(cert, "base64"));
  console.log("✓ distribution certificate created → build/dist.cer");
} else {
  console.log(text);
}
