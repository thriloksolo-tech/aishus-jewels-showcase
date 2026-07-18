import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function sb(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "update_product",
  title: "Update product",
  description:
    "Update fields of an existing product (price, stock, name, description, availability, etc.). Admin only.",
  inputSchema: {
    id: z.string().uuid().describe("Product ID."),
    name: z.string().min(1).optional(),
    price_inr: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative().optional(),
    description: z.string().optional(),
    category_id: z.string().uuid().nullable().optional(),
    image_url: z.string().url().nullable().optional(),
    instagram_url: z.string().url().nullable().optional(),
    tag: z.string().nullable().optional(),
    featured: z.boolean().optional(),
    active: z.boolean().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ id, ...patch }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await sb(ctx).from("products").update(patch).eq("id", id).select().maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Product not found or not permitted" }], isError: true };
    return {
      content: [{ type: "text", text: `Updated product ${data.id}` }],
      structuredContent: { product: data },
    };
  },
});