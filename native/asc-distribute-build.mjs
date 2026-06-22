// Wait for a freshly-uploaded build to finish App Store Connect processing,
// then attach it to a TestFlight beta group so testers receive it.
//
// Env: ASC_KEY_PATH, ASC_KEY_ID, ASC_ISSUER_ID, APP_ID, BUILD_VERSION, GROUP_ID
import crypto from "node:crypto";
import fs from "node:fs";

const { ASC_KEY_PATH, ASC_KEY_ID, ASC_ISSUER_ID, APP_ID, BUILD_VERSION, GROUP_ID } = process.env;

function jwt() {
  const key = fs.readFileSync(ASC_KEY_PATH, "utf8");
  const b = (s) => Buffer.from(s).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const head = b(JSON.stringify({ alg: "ES256", kid: ASC_KEY_ID, typ: "JWT" }));
  const pl = b(JSON.stringify({ iss: ASC_ISSUER_ID, iat: now, exp: now + 1200, aud: "appstoreconnect-v1" }));
  const sig = crypto.sign("SHA256", Buffer.from(`${head}.${pl}`), { key, dsaEncoding: "ieee-p1363" }).toString("base64url");
  return `${head}.${pl}.${sig}`;
}
async function api(method, p, body) {
  const res = await fetch(`https://api.appstoreconnect.apple.com${p}`, {
    method,
    headers: { Authorization: `Bearer ${jwt()}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, json: text ? JSON.parse(text) : null };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const DEADLINE = Date.now() + 30 * 60 * 1000; // 30 min cap
let build = null;
while (Date.now() < DEADLINE) {
  const r = await api(
    "GET",
    `/v1/builds?filter%5Bapp%5D=${APP_ID}&filter%5Bversion%5D=${BUILD_VERSION}&fields%5Bbuilds%5D=version,processingState`,
  );
  const b = r.json?.data?.[0];
  if (b) {
    const state = b.attributes.processingState;
    console.log(new Date().toISOString(), "build", BUILD_VERSION, "→", state);
    if (state === "VALID") { build = b; break; }
    if (state === "FAILED" || state === "INVALID") {
      console.error("Processing failed:", state);
      process.exit(1);
    }
  } else {
    console.log(new Date().toISOString(), "build", BUILD_VERSION, "not visible yet…");
  }
  await sleep(30000);
}
if (!build) { console.error("Timed out waiting for processing."); process.exit(1); }

// Attach the build to the beta group.
const attach = await api("POST", `/v1/betaGroups/${GROUP_ID}/relationships/builds`, {
  data: [{ type: "builds", id: build.id }],
});
if (attach.status === 204) {
  console.log(`✅ Attached build ${BUILD_VERSION} (${build.id}) to beta group ${GROUP_ID}.`);
} else if (attach.status === 409 || (attach.json && JSON.stringify(attach.json).includes("already"))) {
  console.log(`ℹ️ Build ${BUILD_VERSION} already associated with the group.`);
} else {
  console.error("Attach failed:", attach.status, JSON.stringify(attach.json));
  process.exit(1);
}
