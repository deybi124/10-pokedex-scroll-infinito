export type DetalleValidacion = {
  campo: string;
  mensaje: string;
};

export class ErrorHttp extends Error {
  readonly estado: number;
  readonly mensaje: string;
  readonly detalles?: DetalleValidacion[];

  constructor(
    estado: number,
    mensaje: string,
    detalles?: DetalleValidacion[],
  ) {
    super(mensaje);
    this.name = "ErrorHttp";
    this.estado = estado;
    this.mensaje = mensaje;
    this.detalles = detalles;
  }
}
