import { requerirUsuario } from "@/lib/auth";
import { manejar } from "@/lib/http";

export const GET = manejar(async (request: Request) => {
  const usuario = await requerirUsuario(request);

  return Response.json(
    { usuario },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
});
