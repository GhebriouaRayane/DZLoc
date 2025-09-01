import { supabaseAsService } from "../../utils/supabaseClient";
import { json } from "../../utils/response";

export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const { path } = await req.json(); // ex: properties/123/img1.jpg
  const sbs = supabaseAsService();
  // createSignedUploadUrl returns a temporary upload URL + token
  const { data, error } = await sbs.storage.from("images").createSignedUploadUrl(path);
  if (error) return json({ error: error.message }, 400);
  return json(data);
}

