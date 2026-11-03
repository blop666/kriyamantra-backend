const version = process.env.META_GRAPH_API_VERSION || "v25.0";
const required = [
  "INSTAGRAM_ACCOUNT_ID",
  "INSTAGRAM_ACCESS_TOKEN",
  "WHATSAPP_BUSINESS_ACCOUNT_ID",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_ACCESS_TOKEN",
];

const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

async function graphGet(path, token) {
  const response = await fetch(`https://graph.facebook.com/${version}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok || body.error) {
    const message = body.error?.message || `HTTP ${response.status}`;
    throw new Error(`${path}: ${message}`);
  }

  return body;
}

async function check(label, path, token, fields) {
  try {
    const result = await graphGet(`${path}?fields=${fields}`, token);
    console.log(`PASS ${label}: ${JSON.stringify(result)}`);
    return true;
  } catch (error) {
    console.error(`FAIL ${label}: ${error.message}`);
    return false;
  }
}

const results = await Promise.all([
  check(
    "Instagram account/token",
    "me",
    process.env.INSTAGRAM_ACCESS_TOKEN,
    "id",
  ),
  check(
    "WhatsApp phone/token",
    process.env.WHATSAPP_PHONE_NUMBER_ID,
    process.env.WHATSAPP_ACCESS_TOKEN,
    "id,display_phone_number,verified_name,quality_rating,code_verification_status",
  ),
  check(
    "WhatsApp business account/token",
    process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    process.env.WHATSAPP_ACCESS_TOKEN,
    "id,name",
  ),
]);

if (results.includes(false)) process.exit(1);
console.log("All Meta credentials validated. Secrets were not printed.");
