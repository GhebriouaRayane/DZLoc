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
  const auth = req.headers.get("authorization");
  if (!auth) return new Response("Unauthorized", { status: 401 });
  const token = auth.split(" ")[1];
  const me = await getUserFromToken(token);
  if (!me?.id) return new Response("Unauthorized", { status: 401 });

  const sb = supabaseAsAnon();
  if (req.method === "GET") {
    const { data, error } = await sb.from("profiles").select("*").eq("id", me.id).single();
    if (error) return json({ error: error.message }, 400);
    return json(data);
  }

  if (req.method === "PATCH") {
    const patch = await req.json();
    const { data, error } = await sb.from("profiles").update(patch).eq("id", me.id).select("*").single();
    if (error) return json({ error: error.message }, 400);
    return json(data);
  }

  return new Response("Method Not Allowed", { status: 405 });
}

