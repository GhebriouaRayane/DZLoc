import { supabaseAsAnon } from "../../utils/supabaseClient";
import { parseBody, propertySchema } from "../../utils/validate";
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
    const city = url.searchParams.get("city");
    const type = url.searchParams.get("type");
    const min = Number(url.searchParams.get("min")) || 0;
    const max = Number(url.searchParams.get("max")) || 10_000_000;
    let q = sb.from("properties").select("*").gte("price", min).lte("price", max).eq("status", "available");
    if (city) q = q.ilike("city", `%${city}%`);
    if (type) q = q.eq("type", type);
    const { data, error } = await q.order("created_at", { ascending: false });
    if (error) return json({ error: error.message }, 400);
    return json(data);
  }

  if (req.method === "POST") {
    const auth = req.headers.get("authorization");
    if (!auth) return new Response("Unauthorized", { status: 401 });
    const token = auth.split(" ")[1];
    const me = await getUserFromToken(token);
    if (!me?.id) return new Response("Unauthorized", { status: 401 });

    const payload = parseBody(propertySchema, await req.json());
    const { data, error } = await sb.from("properties").insert({ ...payload, owner_id: me.id }).select("*").single();
    if (error) return json({ error: error.message }, 400);
    return json(data, 201);
  }

  return new Response("Method Not Allowed", { status: 405 });
}

