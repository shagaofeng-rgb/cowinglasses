import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";

type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

async function readServiceAccount(): Promise<ServiceAccount> {
  const inline = process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON;
  const file = process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_FILE;
  const raw = inline || (file ? await readFile(file, "utf8") : "");

  if (!raw) {
    throw new Error("Missing GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON (or a local GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_FILE).");
  }

  const account = JSON.parse(raw) as Partial<ServiceAccount>;
  if (!account.client_email || !account.private_key) {
    throw new Error("The Google service-account credentials are incomplete.");
  }

  return account as ServiceAccount;
}

function createAssertion(account: ServiceAccount) {
  const now = Math.floor(Date.now() / 1_000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(JSON.stringify({
    iss: account.client_email,
    scope: "https://www.googleapis.com/auth/webmasters",
    aud: account.token_uri || "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3_600,
  }));
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  signer.end();
  return `${header}.${claim}.${signer.sign(account.private_key).toString("base64url")}`;
}

async function getAccessToken(account: ServiceAccount) {
  const response = await fetch(account.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: createAssertion(account),
    }),
  });
  const body = await response.json() as { access_token?: string; error_description?: string };
  if (!response.ok || !body.access_token) {
    throw new Error(`Google OAuth token request failed: ${body.error_description || response.statusText}`);
  }
  return body.access_token;
}

async function main() {
  const account = await readServiceAccount();
  const token = await getAccessToken(account);
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || "sc-domain:cowinglasses.com";
  const sitemapUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITEMAP_URL || "https://cowinglasses.com/sitemap.xml";
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
  const response = await fetch(endpoint, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });

  if (!response.ok) {
    const detail = (await response.text()).replace(/\s+/g, " ").slice(0, 320);
    throw new Error(`Search Console sitemap submission failed (${response.status}): ${detail}`);
  }

  console.log(`Search Console accepted sitemap submission for ${siteUrl}: ${sitemapUrl}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Search Console sitemap submission failed.");
  process.exitCode = 1;
});
