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
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const sb = supabaseAsAnon();
  const auth = req.headers.get("authorization");
  if (!auth) return new Response("Unauthorized", { status: 401 });
  const token = auth.split(" ")[1];
  const me = await getUserFromToken(token);
  if (!me?.id) return new Response("Unauthorized", { status: 401 });

  const { property_id, date, time, message } = await req.json();
  const { error } = await sb.from("visits").insert({ property_id, user_id: me.id, date, time, message });
  if (error) return json({ error: error.message }, 400);
  return json({ ok: true });
}

