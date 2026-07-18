import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Beta namespace on @supabase/supabase-js — narrow shim so TS doesn't fight us.
type OAuthClient = { name?: string; client_uri?: string };
type AuthorizationDetails = {
  client?: OAuthClient;
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};
const oauthApi = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const id = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(id);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-screen flex items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl mb-2">Authorization error</h1>
        <p className="text-sm text-muted-foreground">{String((error as Error)?.message ?? error)}</p>
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauthApi().approveAuthorization(authorization_id)
      : await oauthApi().denyAuthorization(authorization_id);
    if (error) { setBusy(false); setError(error.message); return; }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); setError("No redirect returned by the authorization server."); return; }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "an external app";
  const scopes = (details?.scope ?? "").split(/\s+/).filter(Boolean);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Connect {clientName} to Aivora Collection's
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {clientName} will be able to call this app's enabled tools while you are signed in.
        </p>
        {scopes.length > 0 && (
          <div className="mb-6">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Requested access</div>
            <ul className="text-sm space-y-1">
              {scopes.map((s: string) => <li key={s} className="font-mono text-xs">{s}</li>)}
            </ul>
          </div>
        )}
        <p className="text-xs text-muted-foreground mb-6">
          This does not bypass this app's permissions or backend policies.
        </p>
        {error && <p role="alert" className="text-sm text-destructive mb-4">{error}</p>}
        <div className="flex gap-2">
          <button
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 rounded-full py-2.5 text-sm text-primary-foreground disabled:opacity-50"
            style={{ background: 'var(--gradient-gold)' }}
          >
            {busy ? "Please wait…" : "Approve"}
          </button>
          <button
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 rounded-full py-2.5 text-sm border border-foreground/20 hover:bg-foreground hover:text-background transition disabled:opacity-50"
          >
            Deny
          </button>
        </div>
      </div>
    </main>
  );
}