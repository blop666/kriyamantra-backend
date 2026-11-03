import "dotenv/config";
import { config } from "dotenv";

config({ path: ".env.local" });

const baseUrl = (process.env.AI_BASE_URL || "https://api.xkiro.com/v1").replace(/\/$/, "");
const apiKey = process.env.XKIRO_API_KEY;
const model = process.env.AI_MODEL || "openai/gpt-oss-120b";
const timeoutMs = Number(process.env.AI_REQUEST_TIMEOUT_MS || 30_000);

if (!apiKey) {
  console.error("XKIRO_API_KEY is not configured");
  process.exitCode = 1;
} else {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Reply with exactly: XKIRO_OK" }],
        max_tokens: 20,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      let detail = body;
      try {
        const parsed = JSON.parse(body);
        detail = parsed?.error?.message || parsed?.message || body;
      } catch {
        // Keep the provider's plain-text error when it is not JSON.
      }
      console.error(`Xkiro probe failed with HTTP ${response.status}: ${detail.slice(0, 300)}`);
      process.exitCode = 1;
    } else {
      const payload = await response.json();
      const text = payload?.choices?.[0]?.message?.content;
      if (typeof text !== "string") {
        console.error("Xkiro probe returned an unexpected response");
        process.exitCode = 1;
      } else {
        console.log(JSON.stringify({ ok: true, model: payload.model ?? model, response: text.trim() }));
      }
    }
  } catch (error) {
    console.error(error?.name === "AbortError" ? "Xkiro probe timed out" : "Xkiro probe failed");
    process.exitCode = 1;
  } finally {
    clearTimeout(timeout);
  }
}
