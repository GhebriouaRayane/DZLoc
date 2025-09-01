import { supabaseAsAnon } from "../../utils/supabaseClient";
import { json } from "../../utils/response";

export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  try {
    const { email, password } = await req.json();
    const sb = supabaseAsAnon();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });

    if (error || !data.session) return json({ error: "Invalid credentials" }, 401);

    // renvoie le access_token que tu stockeras côté client (localStorage)
    return json({ access_token: data.session.access_token, user: data.user });
  } catch (e: any) {
    return json({ error: e?.message ?? "bad request" }, 400);
  }
}

