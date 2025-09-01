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
  const { pathname } = new URL(req.url);
  const id = Number(pathname.split("/").pop());

  if (req.method === "GET") {
    const { data, error } = await sb.from("properties").select("*").eq("id", id).single();
    if (error) return json({ error: error.message }, 404);
    return json(data);
  }

  const auth = req.headers.get("authorization");
  if (!auth) return new Response("Unauthorized", { status: 401 });
  const token = auth.split(" ")[1];
  const me = await getUserFromToken(token);
  if (!me?.id) return new Response("Unauthorized", { status: 401 });

  if (req.method === "PATCH") {
    const patch = await req.json();
    const { data, error } = await sb.from("properties").update(patch).eq("id", id).select("*").single();
    if (error) return json({ error: error.message }, 400);
    return json(data);
  }

  if (req.method === "DELETE") {
    const { error } = await sb.from("properties").delete().eq("id", id);
    if (error) return json({ error: error.message }, 400);
    return new Response(null, { status: 204 });
  }

  return new Response("Method Not Allowed", { status: 405 });
}

