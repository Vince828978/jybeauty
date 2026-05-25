import { cookies } from "next/headers";

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("jyb-admin")?.value === "1";
}

export function unauthorized() {
  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
