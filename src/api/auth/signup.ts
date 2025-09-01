import { supabaseAsAnon, supabaseAsService } from "../../utils/supabaseClient";
import { parseBody, signupSchema } from "../../utils/validate";
import { json } from "../../utils/response";

export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  try {
    const body = await req.json();
    const data = parseBody(signupSchema, body);

    const sbAnon = supabaseAsAnon();
    const { data: sign, error } = await sbAnon.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error || !sign?.user) return json({ error: error?.message ?? "signup failed" }, 400);

    // Créer profil étendu en DB avec la service role key
    const sbs = supabaseAsService();
    const { error: err2 } = await sbs.from("profiles").insert({
      id: sign.user.id,
      full_name: data.full_name,
      phone: data.phone,
      user_type: data.user_type,
    });

    if (err2) return json({ error: err2.message }, 400);

    return json({ ok: true }, 201);
  } catch (e: any) {
    return json({ error: e?.message ?? "bad request" }, 400);
  }
}

