"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type GuiaRemision = {
  id: number;
  ventaId: number;
  transportistaId: number;

  serie: string;
  numero: number;

  fechaEmision: string;
  horaEmision: string;
  fechaEntregaTransportista: string;

  motivoTraslado: string;
  modalidadTransporte: string;

  destinatarioId: number;
  destinatarioTipoDocumento: string;
  destinatarioNumeroDocumento: string;
  destinatarioDenominacion: string;
  destinatarioDireccion: string | null;

  puntoPartidaUbigeo: string;
  puntoPartidaDireccion: string;

  puntoLlegadaUbigeo: string;
  puntoLlegadaDireccion: string;

  pesoBrutoTotal: string | number;
  pesoBrutoUnidadMedida: string;
  numeroBultos: number;

  observaciones: string | null;

  estado: string;

  mensajeRespuesta: string | null;

  venta: {
    id: number;
    total: string | number;

    documento: {
      tipo: string;
      serie: string;
      numero: number;
      estado: string;
    } | null;
  };

  transportista: {
    id: number;
    ruc: string;
    denominacion: string;
    numeroRegistroMTC: string;
    numeroAutorizacion: string;
    codigoEntidadAutorizadora: string;
  };

  destinatario: {
    id: number;
    nombre: string;
    dni: string | null;
    ruc: string | null;
    direccion: string | null;
  };

  detalles: {
    id: number;
    productoId: number;
    codigoInterno: string;
    descripcion: string;
    unidadMedida: string;
    cantidad: number;
  }[];
};

export default function VerGuiaRemision() {
  const params = useParams();

  const id = params.id;

  const [guia, setGuia] = useState<GuiaRemision | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarGuia() {
      try {
        const response = await fetch(
          `/api/guias-remision/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.error);
          return;
        }

        setGuia(data);
      } catch (error) {
        console.error(error);
        alert("Error al cargar la guía de remisión.");
      } finally {
        setCargando(false);
      }
    }

    if (id) {
      cargarGuia();
    }
  }, [id]);

  if (cargando) {
    return (
      <main className="min-h-screen p-8">
        <p>Cargando guía...</p>
      </main>
    );
  }

  if (!guia) {
    return (
      <main className="min-h-screen p-8">
        <p>No se pudo cargar la guía de remisión.</p>
      </main>
    );
  }

  const numeroGuia = `${guia.serie}-${String(
    guia.numero
  ).padStart(6, "0")}`;

  const fechaEmision = new Date(
    guia.fechaEmision
  ).toLocaleDateString("es-PE");

  const fechaEntrega = new Date(
    guia.fechaEntregaTransportista
  ).toLocaleDateString("es-PE");

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Guía de remisión
            </h1>

            <p className="mt-1 text-gray-500">
              {numeroGuia}
            </p>
          </div>

          <div className="rounded-lg border px-4 py-2 font-semibold">
            {guia.estado}
          </div>
        </div>

        <section className="mt-8 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">
            Información de la guía
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Serie y número
              </p>

              <p className="font-medium">
                {numeroGuia}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Fecha de emisión
              </p>

              <p className="font-medium">
                {fechaEmision}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Hora de emisión
              </p>

              <p className="font-medium">
                {guia.horaEmision}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Fecha entrega al transportista
              </p>

              <p className="font-medium">
                {fechaEntrega}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Motivo de traslado
              </p>

              <p className="font-medium">
                {guia.motivoTraslado}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Modalidad de transporte
              </p>

              <p className="font-medium">
                {guia.modalidadTransporte}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">
            Comprobante relacionado
          </h2>

          <div className="mt-4">
            {guia.venta.documento ? (
              <p>
                <strong>
                  {guia.venta.documento.tipo}:
                </strong>{" "}
                {guia.venta.documento.serie}-
                {String(
                  guia.venta.documento.numero
                ).padStart(6, "0")}
              </p>
            ) : (
              <p>
                No hay comprobante relacionado.
              </p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">
            Destinatario
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Nombre / razón social
              </p>

              <p className="font-medium">
                {guia.destinatarioDenominacion}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Documento
              </p>

              <p className="font-medium">
                {guia.destinatarioTipoDocumento === "6"
                  ? `RUC ${guia.destinatarioNumeroDocumento}`
                  : `DNI ${guia.destinatarioNumeroDocumento}`}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Dirección
              </p>

              <p className="font-medium">
                {guia.destinatarioDireccion ||
                  "Sin dirección"}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">
            Transportista
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Denominación
              </p>

              <p className="font-medium">
                {guia.transportista.denominacion}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                RUC
              </p>

              <p className="font-medium">
                {guia.transportista.ruc}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Registro MTC
              </p>

              <p className="font-medium">
                {guia.transportista.numeroRegistroMTC}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Número de autorización
              </p>

              <p className="font-medium">
                {guia.transportista.numeroAutorizacion}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">
            Traslado
          </h2>

          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold">
                Punto de partida
              </h3>

              <p className="mt-2">
                <strong>Ubigeo:</strong>{" "}
                {guia.puntoPartidaUbigeo}
              </p>

              <p>
                <strong>Dirección:</strong>{" "}
                {guia.puntoPartidaDireccion}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">
                Punto de llegada
              </h3>

              <p className="mt-2">
                <strong>Ubigeo:</strong>{" "}
                {guia.puntoLlegadaUbigeo}
              </p>

              <p>
                <strong>Dirección:</strong>{" "}
                {guia.puntoLlegadaDireccion}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">
            Productos
          </h2>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3">
                    Código
                  </th>

                  <th className="p-3">
                    Descripción
                  </th>

                  <th className="p-3">
                    Unidad
                  </th>

                  <th className="p-3">
                    Cantidad
                  </th>
                </tr>
              </thead>

              <tbody>
                {guia.detalles.map((detalle) => (
                  <tr
                    key={detalle.id}
                    className="border-b"
                  >
                    <td className="p-3">
                      {detalle.codigoInterno}
                    </td>

                    <td className="p-3">
                      {detalle.descripcion}
                    </td>

                    <td className="p-3">
                      {detalle.unidadMedida}
                    </td>

                    <td className="p-3 font-semibold">
                      {detalle.cantidad}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">
            Datos adicionales
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Peso bruto total
              </p>

              <p className="font-medium">
                {guia.pesoBrutoTotal}{" "}
                {guia.pesoBrutoUnidadMedida}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Número de bultos
              </p>

              <p className="font-medium">
                {guia.numeroBultos}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">
                Observaciones
              </p>

              <p className="font-medium">
                {guia.observaciones ||
                  "Sin observaciones"}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">
            Estado de emisión
          </h2>

          <p className="mt-4">
            {guia.mensajeRespuesta ||
              "Sin mensaje de respuesta"}
          </p>
        </section>

      </div>
    </main>
  );
}