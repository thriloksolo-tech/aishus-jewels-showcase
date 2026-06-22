import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Admin Sign In — Aivora Collection's" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center mb-8 text-sm text-muted-foreground hover:text-foreground">← Back to store</Link>
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <h1 className="text-3xl mb-1">Admin Sign In</h1>
          <p className="text-sm text-muted-foreground mb-6">Manage your jewellery catalog.</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <button disabled={loading} type="submit" className="w-full rounded-full py-3 text-sm font-medium text-primary-foreground disabled:opacity-50" style={{ background: 'var(--gradient-gold)' }}>
              {loading ? "Please wait…" : "Sign in"}
            </button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Admin accounts are provisioned by the site owner. Contact them for access.
          </p>
        </div>
      </div>
    </div>
  );
}