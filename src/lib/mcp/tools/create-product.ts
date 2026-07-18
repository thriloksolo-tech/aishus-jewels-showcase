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
  name: "create_product",
  title: "Create product",
  description:
    "Create a new product in the Aivora Collection's catalog. Admin only — enforced by database policies.",
  inputSchema: {
    name: z.string().min(1).describe("Product name."),
    price_inr: z.number().nonnegative().describe("Price in INR."),
    stock: z.number().int().nonnegative().default(0).describe("Units in stock."),
    description: z.string().optional(),
    category_id: z.string().uuid().optional().describe("Category UUID (see list_categories)."),
    image_url: z.string().url().optional(),
    instagram_url: z.string().url().optional(),
    tag: z.string().optional().describe("Optional badge, e.g. 'New', 'Bestseller'."),
    featured: z.boolean().optional(),
    active: z.boolean().optional().describe("Whether the product is shown on the storefront."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await sb(ctx).from("products").insert(input).select().maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Created product ${data?.id}` }],
      structuredContent: { product: data },
    };
  },
});