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
  name: "list_products",
  title: "List products",
  description:
    "List products in the Aivora Collection's catalog. Optionally filter by category slug, featured flag, in-stock only, or search text in the name.",
  inputSchema: {
    category_slug: z.string().optional().describe("Filter by category slug (e.g. 'necklaces')."),
    featured_only: z.boolean().optional().describe("Only return featured products."),
    in_stock_only: z.boolean().optional().describe("Only return products with stock > 0."),
    search: z.string().optional().describe("Case-insensitive substring search on product name."),
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category_slug, featured_only, in_stock_only, search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const client = sb(ctx);
    let categoryId: string | undefined;
    if (category_slug) {
      const { data: cat, error: catErr } = await client
        .from("categories").select("id").eq("slug", category_slug).maybeSingle();
      if (catErr) return { content: [{ type: "text", text: catErr.message }], isError: true };
      if (!cat) return { content: [{ type: "text", text: `Unknown category: ${category_slug}` }], isError: true };
      categoryId = cat.id;
    }
    let q = client.from("products").select("*").order("sort_order").limit(limit ?? 50);
    if (categoryId) q = q.eq("category_id", categoryId);
    if (featured_only) q = q.eq("featured", true);
    if (in_stock_only) q = q.gt("stock", 0);
    if (search) q = q.ilike("name", `%${search}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { products: data, count: data?.length ?? 0 },
    };
  },
});