import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";

type ServiceAccount = { client_email: string; private_key: string };
const tokenEndpoint = "https://oauth2.googleapis.com/token";
type GoogleStep = "credentials" | "oauth" | "submit";

export class GoogleSitemapError extends Error {
  constructor(readonly step: GoogleStep, readonly status?: number) {
    super(status ? `Google Sitemap ${step} failed (HTTP ${status}).` : `Google Sitemap ${step} failed.`);
  }
}

async function readServiceAccount(): Promise<ServiceAccount> {
  try {
    const inline = process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON;
    const file = process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_FILE;
    const raw = inline || (file && process.env.VERCEL_ENV !== "production" ? await readFile(file, "utf8") : "");
    const account = JSON.parse(raw) as Partial<ServiceAccount>;
    if (typeof account.client_email !== "string" || typeof account.private_key !== "string") throw new Error();
    return { client_email: account.client_email, private_key: account.private_key };
  } catch {
    throw new GoogleSitemapError("credentials");
  }
}

function createAssertion(account: ServiceAccount) {
  const now = Math.floor(Date.now() / 1_000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claim = Buffer.from(JSON.stringify({
    iss: account.client_email,
    scope: "https://www.googleapis.com/auth/webmasters",
    aud: tokenEndpoint,
    iat: now,
    exp: now + 3_600,
  })).toString("base64url");
  try {
    const signer = createSign("RSA-SHA256");
    signer.update(`${header}.${claim}`);
    signer.end();
    return `${header}.${claim}.${signer.sign(account.private_key).toString("base64url")}`;
  } catch {
    throw new GoogleSitemapError("credentials");
  }
}

async function getAccessToken(account: ServiceAccount) {
  const assertion = createAssertion(account);
  const response = await fetch(tokenEndpoint, {
    signal: AbortSignal.timeout(12_000),
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    cache: "no-store",
  }).catch(() => { throw new GoogleSitemapError("oauth"); });
  if (!response.ok) throw new GoogleSitemapError("oauth", response.status);
  const body = await response.json().catch(() => ({})) as { access_token?: string };
  if (!body.access_token) throw new GoogleSitemapError("oauth", response.status);
  return body.access_token;
}

type GoogleSitemapInfo = {
  lastSubmitted?: string;
  lastDownloaded?: string;
  isPending?: boolean;
  errors?: string;
  warnings?: string;
};

export async function submitGoogleSitemap() {
  const token = await getAccessToken(await readServiceAccount());
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || "sc-domain:cowinglasses.com";
  const sitemapUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITEMAP_URL || "https://cowinglasses.com/sitemap.xml";
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
  const headers = { Authorization: `Bearer ${token}` };
  const response = await fetch(endpoint, { method: "PUT", headers, signal: AbortSignal.timeout(12_000), cache: "no-store" })
    .catch(() => { throw new GoogleSitemapError("submit"); });
  if (!response.ok) throw new GoogleSitemapError("submit", response.status);

  const acceptedAt = new Date().toISOString();
  let readback: GoogleSitemapInfo | null = null;
  try {
    const check = await fetch(endpoint, { headers, signal: AbortSignal.timeout(8_000), cache: "no-store" });
    if (check.ok) {
      const info = await check.json() as GoogleSitemapInfo;
      readback = {
        lastSubmitted: info.lastSubmitted, lastDownloaded: info.lastDownloaded,
        isPending: info.isPending, errors: info.errors, warnings: info.warnings,
      };
    }
  } catch {
    // The PUT succeeded. Google may make the readback available separately.
  }
  return { siteUrl, sitemapUrl, acceptedAt, httpStatus: response.status, readback };
}
