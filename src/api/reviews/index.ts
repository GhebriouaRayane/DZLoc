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

  if (req.method === "GET") {
    const url = new URL(req.url);
    const property_id = Number(url.searchParams.get("property_id"));
    const { data, error } = await sb.from("reviews").select("*").eq("property_id", property_id).order("created_at", { ascending: false });
    if (error) return json({ error: error.message }, 400);
    return json(data);
  }

  if (req.method === "POST") {
    const auth = req.headers.get("authorization");
    if (!auth) return new Response("Unauthorized", { status: 401 });
    const token = auth.split(" ")[1];
    const me = await getUserFromToken(token);
    if (!me?.id) return new Response("Unauthorized", { status: 401 });

    const { property_id, stars, comment } = await req.json();
    const { error } = await sb.from("reviews").insert({ property_id, stars, comment, user_id: me.id });
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  return new Response("Method Not Allowed", { status: 405 });
}

