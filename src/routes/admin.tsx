import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAdminAccess } from "@/lib/admin.functions";
import { toast } from "sonner";
import { LogOut, Plus, Trash2, Pencil, Save, X, Package, Tag } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Aivora Collection's" }] }),
  component: AdminPage,
});

type Product = {
  id: string; name: string; description: string | null; price_inr: number;
  stock: number; image_url: string | null; instagram_url: string | null;
  category_id: string | null; tag: string | null; featured: boolean; active: boolean;
  sort_order: number;
};
type Category = { id: string; name: string; slug: string; sort_order: number };

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const checkAdminAccess = useServerFn(getAdminAccess);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<"products" | "categories">("products");

  useEffect(() => {
    (async () => {
      try {
        const access = await checkAdminAccess();
        setUserId(access.userId);
        setIsAdmin(access.isAdmin);
        setReady(true);
      } catch (error) {
        navigate({ to: "/auth" });
      }
    })();
  }, [checkAdminAccess, navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("sort_order").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
    enabled: ready && isAdmin,
  });
  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
    enabled: ready && isAdmin,
  });

  if (!ready) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div className="max-w-md">
          <h1 className="text-3xl mb-3">Access pending</h1>
          <p className="text-muted-foreground mb-2">Your account is signed in but doesn't have admin access yet.</p>
          <p className="text-xs text-muted-foreground mb-6 font-mono break-all">User ID: {userId}</p>
          <p className="text-sm text-muted-foreground mb-6">
            Ask the database owner to grant the admin role to your account, then refresh this page.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={signOut} className="rounded-full px-5 py-2 text-sm border border-foreground/20 hover:bg-foreground hover:text-background transition">Sign out</button>
            <Link to="/" className="rounded-full px-5 py-2 text-sm text-primary-foreground" style={{ background: 'var(--gradient-gold)' }}>Back to store</Link>
          </div>
        </div>
      </div>
    );
  }

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
    qc.invalidateQueries({ queryKey: ["public-products"] });
    qc.invalidateQueries({ queryKey: ["public-categories"] });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>Catalog Admin</h1>
            <p className="text-xs text-muted-foreground">Aivora Collection's</p>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="text-sm rounded-full px-4 py-2 border border-foreground/20 hover:bg-foreground hover:text-background transition">View store</Link>
            <button onClick={signOut} className="text-sm rounded-full px-4 py-2 border border-foreground/20 hover:bg-foreground hover:text-background transition inline-flex items-center gap-1.5"><LogOut className="w-4 h-4" /> Sign out</button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 flex gap-1">
          {(["products", "categories"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm border-b-2 transition inline-flex items-center gap-2 ${tab === t ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t === "products" ? <Package className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
              {t === "products" ? "Products" : "Categories"}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {tab === "products" ? (
          <ProductsTab products={products ?? []} categories={categories ?? []} onChange={refresh} />
        ) : (
          <CategoriesTab categories={categories ?? []} onChange={refresh} />
        )}
      </main>
    </div>
  );
}

function ProductsTab({ products, categories, onChange }: { products: Product[]; categories: Category[]; onChange: () => void }) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);

  const blank: Product = {
    id: "", name: "", description: "", price_inr: 0, stock: 0,
    image_url: "", instagram_url: "", category_id: categories[0]?.id ?? null,
    tag: "", featured: false, active: true, sort_order: 0,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl">Products</h2>
          <p className="text-sm text-muted-foreground">{products.length} item{products.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { setAdding(true); setEditing(blank); }} className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm text-primary-foreground" style={{ background: 'var(--gradient-gold)' }}>
          <Plus className="w-4 h-4" /> Add product
        </button>
      </div>

      {editing && (
        <ProductForm
          product={editing}
          categories={categories}
          isNew={adding}
          onClose={() => { setEditing(null); setAdding(false); }}
          onSaved={() => { setEditing(null); setAdding(false); onChange(); }}
        />
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Category</th>
              <th className="text-right px-4 py-3">Price</th>
              <th className="text-right px-4 py-3">Stock</th>
              <th className="text-center px-4 py-3 hidden sm:table-cell">Active</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No products yet. Add your first piece.</td></tr>
            )}
            {products.map((p) => {
              const cat = categories.find((c) => c.id === p.category_id);
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image_url ? <img src={p.image_url} alt="" className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 rounded bg-muted" />}
                      <div>
                        <div className="font-medium">{p.name}</div>
                        {p.tag && <div className="text-xs text-accent">{p.tag}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{cat?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-right">₹{Number(p.price_inr).toLocaleString("en-IN")}</td>
                  <td className={`px-4 py-3 text-right ${p.stock === 0 ? "text-destructive" : ""}`}>{p.stock}</td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className={`inline-block w-2 h-2 rounded-full ${p.active ? "bg-green-500" : "bg-muted-foreground"}`} />
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditing(p)} className="p-2 hover:text-accent" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                    <button onClick={async () => {
                      if (!confirm(`Delete "${p.name}"?`)) return;
                      const { error } = await supabase.from("products").delete().eq("id", p.id);
                      if (error) toast.error(error.message); else { toast.success("Deleted"); onChange(); }
                    }} className="p-2 hover:text-destructive" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductForm({ product, categories, isNew, onClose, onSaved }: { product: Product; categories: Category[]; isNew: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(product);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const payload = {
      name: form.name, description: form.description, price_inr: form.price_inr,
      stock: form.stock, image_url: form.image_url || null, instagram_url: form.instagram_url || null,
      category_id: form.category_id, tag: form.tag || null, featured: form.featured, active: form.active,
      sort_order: form.sort_order,
    };
    const { error } = isNew
      ? await supabase.from("products").insert(payload)
      : await supabase.from("products").update(payload).eq("id", form.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(isNew ? "Product added" : "Product updated");
    onSaved();
  };

  const upd = <K extends keyof Product>(k: K, v: Product[K]) => setForm({ ...form, [k]: v });

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-2xl border border-border max-w-2xl w-full shadow-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-xl">{isNew ? "Add product" : "Edit product"}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <Field label="Name"><input className="input" value={form.name} onChange={(e) => upd("name", e.target.value)} /></Field>
          <Field label="Description"><textarea className="input min-h-[80px]" value={form.description ?? ""} onChange={(e) => upd("description", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (₹)"><input type="number" min={0} step="0.01" className="input" value={form.price_inr} onChange={(e) => upd("price_inr", Number(e.target.value))} /></Field>
            <Field label="Stock"><input type="number" min={0} className="input" value={form.stock} onChange={(e) => upd("stock", Number(e.target.value))} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select className="input" value={form.category_id ?? ""} onChange={(e) => upd("category_id", e.target.value || null)}>
                <option value="">— None —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Tag (optional)"><input className="input" placeholder="New, Bestseller…" value={form.tag ?? ""} onChange={(e) => upd("tag", e.target.value)} /></Field>
          </div>
          <Field label="Image URL"><input className="input" placeholder="https://…" value={form.image_url ?? ""} onChange={(e) => upd("image_url", e.target.value)} /></Field>
          {form.image_url && <img src={form.image_url} alt="" className="h-32 rounded-lg object-cover border border-border" />}
          <Field label="Instagram post URL (optional)"><input className="input" placeholder="https://instagram.com/p/…" value={form.instagram_url ?? ""} onChange={(e) => upd("instagram_url", e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Display order"><input type="number" className="input" value={form.sort_order} onChange={(e) => upd("sort_order", Number(e.target.value))} /></Field>
            <div className="space-y-2 pt-6">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => upd("active", e.target.checked)} /> Active (shown on site)</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => upd("featured", e.target.checked)} /> Featured</label>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full px-5 py-2 text-sm border border-foreground/20">Cancel</button>
          <button onClick={save} disabled={saving || !form.name} className="rounded-full px-5 py-2 text-sm text-primary-foreground inline-flex items-center gap-2 disabled:opacity-50" style={{ background: 'var(--gradient-gold)' }}>
            <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoriesTab({ categories, onChange }: { categories: Category[]; onChange: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const add = async () => {
    if (!name || !slug) return;
    const { error } = await supabase.from("categories").insert({ name, slug, sort_order: categories.length });
    if (error) toast.error(error.message);
    else { toast.success("Category added"); setName(""); setSlug(""); onChange(); }
  };

  return (
    <div>
      <h2 className="text-2xl mb-1">Categories</h2>
      <p className="text-sm text-muted-foreground mb-6">{categories.length} categories</p>

      <div className="bg-card border border-border rounded-xl p-5 mb-6 grid sm:grid-cols-[1fr_1fr_auto] gap-3">
        <input className="input" placeholder="Name (e.g. Necklaces)" value={name} onChange={(e) => { setName(e.target.value); if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); }} />
        <input className="input" placeholder="slug-like-this" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <button onClick={add} disabled={!name || !slug} className="rounded-full px-5 py-2 text-sm text-primary-foreground disabled:opacity-50 inline-flex items-center gap-2" style={{ background: 'var(--gradient-gold)' }}><Plus className="w-4 h-4" /> Add</button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Slug</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{c.slug}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={async () => {
                    if (!confirm(`Delete category "${c.name}"? Products will be uncategorized.`)) return;
                    const { error } = await supabase.from("categories").delete().eq("id", c.id);
                    if (error) toast.error(error.message); else { toast.success("Deleted"); onChange(); }
                  }} className="p-2 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}