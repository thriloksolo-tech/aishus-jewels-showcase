import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listCategories from "./tools/list-categories";
import listProducts from "./tools/list-products";
import getProduct from "./tools/get-product";
import createProduct from "./tools/create-product";
import updateProduct from "./tools/update-product";
import deleteProduct from "./tools/delete-product";

// The OAuth issuer must be the direct Supabase host — the .lovable.cloud proxy
// URL fails RFC 8414 issuer matching. VITE_SUPABASE_PROJECT_ID is inlined by
// Vite at build time; the fallback keeps the string well-formed during the
// manifest-extract eval, and no real token verifies against it.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "aivora-collections-mcp",
  title: "Aivora Collection's",
  version: "0.1.0",
  instructions:
    "Tools for the Aivora Collection's jewellery catalog. Use list_categories and list_products to browse; use create_product, update_product, and delete_product to manage inventory (admin only — enforced server-side).",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listCategories, listProducts, getProduct, createProduct, updateProduct, deleteProduct],
});