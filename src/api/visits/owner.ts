import { supabaseAsAnon } from "../../utils/supabaseClient";
import { json } from "../../utils/response";

export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  if (req.method !== "PATCH") return new Response("Method Not Allowed", { status: 405 });
  const sb = supabaseAsAnon();
  const { id, status, owner_response } = await req.json();
  const { error } = await sb.from("visits").update({ status, owner_response }).eq("id", id);
  if (error) return json({ error: error.message }, 400);
  return json({ ok: true });
}

