import { getFirestore } from "firebase-admin/firestore";
import { ErrorHttp } from "@/lib/errores";
import { appAdmin } from "@/lib/firebaseAdmin";
import {
  esquemaContadorFavoritos,
  esquemaFavoritoDocumento,
  LIMITE_FAVORITOS,
  type Favorito,
} from "@/schemas/favoritos";
import { esquemaIdPokemon } from "@/schemas/pokemon";

function coleccionFavoritos(uid: string) {
  return getFirestore(appAdmin())
    .collection("usuarios")
    .doc(uid)
    .collection("favoritos");
}

function documentoContadorFavoritos(uid: string) {
  return getFirestore(appAdmin())
    .collection("usuarios")
    .doc(uid)
    .collection("contadores")
    .doc("favoritos");
}

async function cantidadFavoritos(
  transaccion: FirebaseFirestore.Transaction,
  contador: FirebaseFirestore.DocumentReference,
  favoritos: FirebaseFirestore.CollectionReference,
): Promise<number> {
  const snapshotContador = await transaccion.get(contador);
  if (snapshotContador.exists) {
    const resultado = esquemaContadorFavoritos.safeParse(
      snapshotContador.data(),
    );
    if (!resultado.success) {
      throw new ErrorHttp(500, "El contador de favoritos tiene datos inválidos");
    }
    return resultado.data.cantidad;
  }

  const snapshotFavoritos = await transaccion.get(favoritos);
  return snapshotFavoritos.size;
}

export async function listarFavoritos(uid: string): Promise<Favorito[]> {
  const snapshot = await coleccionFavoritos(uid).get();

  return snapshot.docs
    .map((documento) => {
      const pokemonId = esquemaIdPokemon.safeParse(documento.id);
      const favorito = esquemaFavoritoDocumento.safeParse(documento.data());

      if (!pokemonId.success || !favorito.success) {
        throw new ErrorHttp(500, "Hay un favorito almacenado con datos inválidos");
      }

      return {
        pokemonId: pokemonId.data,
        ...favorito.data,
      };
    })
    .sort((a, b) => b.agregadoEn.localeCompare(a.agregadoEn));
}

export async function agregarFavorito(
  uid: string,
  pokemonId: number,
  nombre: string,
): Promise<Favorito> {
  const db = getFirestore(appAdmin());
  const favoritos = coleccionFavoritos(uid);
  const referencia = favoritos.doc(String(pokemonId));
  const contador = documentoContadorFavoritos(uid);

  return db.runTransaction(async (transaccion) => {
    const existente = await transaccion.get(referencia);
    if (existente.exists) {
      throw new ErrorHttp(409, "Este Pokémon ya está en tus favoritos");
    }

    const cantidadActual = await cantidadFavoritos(
      transaccion,
      contador,
      favoritos,
    );
    if (cantidadActual >= LIMITE_FAVORITOS) {
      throw new ErrorHttp(409, "No puedes guardar más de 50 favoritos");
    }

    const favorito: Favorito = {
      pokemonId,
      nombre,
      agregadoEn: new Date().toISOString(),
    };
    const datosDocumento = {
      nombre: favorito.nombre,
      agregadoEn: favorito.agregadoEn,
    };
    transaccion.create(referencia, datosDocumento);
    transaccion.set(contador, { cantidad: cantidadActual + 1 });
    return favorito;
  });
}

export async function quitarFavorito(
  uid: string,
  pokemonId: number,
): Promise<void> {
  const db = getFirestore(appAdmin());
  const favoritos = coleccionFavoritos(uid);
  const referencia = favoritos.doc(String(pokemonId));
  const contador = documentoContadorFavoritos(uid);

  await db.runTransaction(async (transaccion) => {
    const existente = await transaccion.get(referencia);
    if (!existente.exists) {
      return;
    }

    const cantidadActual = await cantidadFavoritos(
      transaccion,
      contador,
      favoritos,
    );
    transaccion.delete(referencia);
    transaccion.set(contador, {
      cantidad: Math.max(cantidadActual - 1, 0),
    });
  });
}
