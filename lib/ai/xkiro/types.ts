export type XkiroRole = "system" | "user" | "assistant";

export type XkiroMessage = {
  role: XkiroRole;
  content: string;
};

export type XkiroChatRequest = {
  messages: XkiroMessage[];
  model?: string;
  maxOutputTokens?: number;
};

export type XkiroChatResult = {
  id: string | null;
  model: string | null;
  text: string;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
  };
};

export class XkiroError extends Error {
  constructor(
    message: string,
    readonly code: "configuration" | "timeout" | "provider" | "provider_auth" | "invalid_response",
    readonly status?: number,
  ) {
    super(message);
    this.name = "XkiroError";
  }
}
