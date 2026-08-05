import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const N8N_CHAT_URL =
  "https://yadhurajan.app.n8n.cloud/webhook/ae8c2f2f-adff-4575-98e6-b12710ea7dba/chat";

const bodySchema = z.object({
  message: z.string().trim().min(1).max(2000),
  sessionId: z.string().trim().min(1).max(100),
});

export const Route = createFileRoute("/api/public/ai-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }

        let upstream: Response;
        try {
          upstream = await fetch(N8N_CHAT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "sendMessage",
              sessionId: parsed.sessionId,
              chatInput: parsed.message,
            }),
          });
        } catch {
          return Response.json({ error: "Assistant is unavailable right now." }, { status: 502 });
        }

        const raw = await upstream.text();
        if (!upstream.ok) {
          console.error(`n8n chat failed [${upstream.status}]: ${raw}`);
          return Response.json({ error: "Assistant is unavailable right now." }, { status: 502 });
        }

        // n8n streams NDJSON chunks ({type:"item", content:"..."}) or returns plain JSON.
        let reply = "";
        for (const line of raw.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const chunk = JSON.parse(trimmed) as Record<string, unknown>;
            if (chunk.type === "item" && typeof chunk.content === "string") reply += chunk.content;
            else if (typeof chunk.output === "string") reply += chunk.output;
            else if (typeof chunk.text === "string") reply += chunk.text;
          } catch {
            reply += trimmed;
          }
        }

        return Response.json({ reply: reply.trim() || "Sorry, I didn't catch that." });
      },
    },
  },
});