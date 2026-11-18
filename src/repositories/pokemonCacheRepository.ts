import { getFirestore } from "firebase-admin/firestore";
import { ErrorHttp } from "@/lib/errores";
import { appAdmin } from "@/lib/firebaseAdmin";
import { esquemaDocumentoCacheListaPokemon } from "@/schemas/cachePokemon";
import type {
  ConsultaPokemon,
  RespuestaListaPokemon,
} from "@/schemas/pokemon";

function idCacheListaPokemon(consulta: ConsultaPokemon): string {
  const busqueda = consulta.q ? `q-${consulta.q}` : "sin-busqueda";
  return `lista-${consulta.offset}-${consulta.limite}-${busqueda}`;
}

function documentoCacheListaPokemon(consulta: ConsultaPokemon) {
  return getFirestore(appAdmin())
    .collection("cachePokemon")
    .doc(idCacheListaPokemon(consulta));
}

export async function obtenerCacheListaPokemon(
  consulta: ConsultaPokemon,
): Promise<RespuestaListaPokemon | null> {
  const snapshot = await documentoCacheListaPokemon(consulta).get();
  if (!snapshot.exists) {
    return null;
  }

  const resultado = esquemaDocumentoCacheListaPokemon.safeParse(snapshot.data());
  if (!resultado.success) {
    throw new ErrorHttp(500, "La caché de Pokémon contiene datos inválidos");
  }

  return resultado.data.datos;
}

export async function guardarCacheListaPokemon(
  consulta: ConsultaPokemon,
  datos: RespuestaListaPokemon,
): Promise<void> {
  const documento = esquemaDocumentoCacheListaPokemon.parse({
    datos,
    obtenidoEn: new Date().toISOString(),
  });

  await documentoCacheListaPokemon(consulta).set(documento);
}
