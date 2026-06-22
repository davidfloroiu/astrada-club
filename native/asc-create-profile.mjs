// Creates an App Store provisioning profile for com.astradaclub.app tied to our
// distribution cert (build/dist.cer), and installs it where Xcode looks.
import crypto, { X509Certificate } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const { ASC_KEY_PATH, ASC_KEY_ID, ASC_ISSUER_ID } = process.env;
const BUNDLE_RESOURCE_ID = "NZS5QT3CTQ"; // /v1/bundleIds id for com.astradaclub.app

function makeJwt() {
  const key = fs.readFileSync(ASC_KEY_PATH, "utf8");
  const b = (s) => Buffer.from(s).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const head = b(JSON.stringify({ alg: "ES256", kid: ASC_KEY_ID, typ: "JWT" }));
  const pl = b(JSON.stringify({ iss: ASC_ISSUER_ID, iat: now, exp: now + 1200, aud: "appstoreconnect-v1" }));
  const sig = crypto.sign("SHA256", Buffer.from(`${head}.${pl}`), { key, dsaEncoding: "ieee-p1363" }).toString("base64url");
  return `${head}.${pl}.${sig}`;
}
const JWT = makeJwt();
async function api(method, p, body) {
  const res = await fetch(`https://api.appstoreconnect.apple.com${p}`, {
    method,
    headers: { Authorization: `Bearer ${JWT}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, json: text ? JSON.parse(text) : null };
}

// 1. Find our distribution cert's id by matching its serial number.
const ourSerial = new X509Certificate(fs.readFileSync("build/dist.cer")).serialNumber.toUpperCase();
const certs = await api(
  "GET",
  "/v1/certificates?filter%5BcertificateType%5D=DISTRIBUTION&fields%5Bcertificates%5D=serialNumber,displayName",
);
const match = (certs.json?.data || []).find(
  (c) => (c.attributes.serialNumber || "").toUpperCase() === ourSerial,
);
const certId = match?.id || certs.json?.data?.[0]?.id;
if (!certId) {
  console.error("No distribution certificate id found", JSON.stringify(certs.json));
  process.exit(1);
}
console.log("cert id:", certId);

// 2. Create the App Store profile.
const created = await api("POST", "/v1/profiles", {
  data: {
    type: "profiles",
    attributes: { name: "Astrada App Store", profileType: "IOS_APP_STORE" },
    relationships: {
      bundleId: { data: { type: "bundleIds", id: BUNDLE_RESOURCE_ID } },
      certificates: { data: [{ type: "certificates", id: certId }] },
    },
  },
});
if (created.status !== 201) {
  console.error("Profile creation failed", created.status, JSON.stringify(created.json));
  process.exit(1);
}
const attrs = created.json.data.attributes;
const dir = path.join(os.homedir(), "Library/MobileDevice/Provisioning Profiles");
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `${attrs.uuid}.mobileprovision`);
fs.writeFileSync(file, Buffer.from(attrs.profileContent, "base64"));
console.log("✓ profile:", attrs.name, "| uuid:", attrs.uuid);
console.log("installed →", file);
