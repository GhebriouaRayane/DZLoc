import { supabaseAsAnon } from "../../utils/supabaseClient";
import { json } from "../../utils/response";

export const config = { runtime: "edge" };

async function getUserFromToken(token: string) {
  const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: process.env.SUPABASE_ANON_KEY! }
  });
  return r.json();
}

export default async function handler(req: Request) {
  const sb = supabaseAsAnon();
  const auth = req.headers.get("authorization");
  if (!auth) return new Response("Unauthorized", { status: 401 });
  const token = auth.split(" ")[1];
  const me = await getUserFromToken(token);
  if (!me?.id) return new Response("Unauthorized", { status: 401 });

  if (req.method === "POST") {
    const { property_id } = await req.json();
    const { error } = await sb.from("favorites").insert({ user_id: me.id, property_id });
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  if (req.method === "DELETE") {
    const { property_id } = await req.json();
    const { error } = await sb.from("favorites").delete().match({ user_id: me.id, property_id });
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  return new Response("Method Not Allowed", { status: 405 });
}

