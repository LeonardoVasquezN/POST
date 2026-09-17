"use client";
import { useEffect, useState } from "react";
import ComprobantePreview from "../components/comprobante-preview";

type Venta = {
  id: number;
  total: string | number;
  metodoPago: string;
  createdAt: string;
  cliente: {
    nombre: string;
  } | null;
  documento: {
    tipo: string;
    serie: string;
    numero: number;
    estado: string;
  } | null;
  montoRecibido: string | number | null;
  vuelto: string | number | null;
  detalles: {
    id: number;
    cantidad: number;
    precioUnitario: string | number;
    subtotal: string | number;
    producto: {
      nombre: string;
    };
  }[];
};

export default function HistorialPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);
  const [mostrarComprobante, setMostrarComprobante] = useState(false);

  useEffect(() => {
    async function cargarVentas() {
      try {
        const response = await fetch("/api/ventas");
        const data = await response.json();

        if (!response.ok) {
          alert(data.error);
          return;
        }

        setVentas(data);
      } catch (error) {
        console.error(error);
        alert("Error al cargar el historial");
      } finally {
        setCargando(false);
      }
    }

    cargarVentas();
  }, []);

  return(
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">
          Historial de ventas
        </h1>

        {cargando ? (
          <p className="mt-8">Cargando ventas...</p>
        ) : ventas.length === 0 ? (
          <p className="mt-8 text-gray-500">
            No hay ventas registradas.
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4">Comprobante</th>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Pago</th>
                  <th className="p-4"></th>
                </tr>
              </thead>

              <tbody>
                {ventas.map((venta) => (
                  <tr key={venta.id} className="border-b">
                    <td className="p-4">
                      {venta.documento
                        ? `${venta.documento.serie}-${String(
                            venta.documento.numero
                          ).padStart(6, "0")}`
                        : "-"}
                    </td>

                    <td className="p-4">
                      {new Date(venta.createdAt).toLocaleString("es-PE")}
                    </td>

                    <td className="p-4">
                      {venta.cliente?.nombre ?? "Sin cliente"}
                    </td>

                    <td className="p-4 font-semibold">
                      S/ {Number(venta.total).toFixed(2)}
                    </td>

                    <td className="p-4">
                      {venta.metodoPago}
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => setVentaSeleccionada(venta)}
                        className="rounded-lg border px-4 py-2"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {ventaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6 text-black shadow-xl">
            <h2 className="text-2xl font-bold">
              Detalle de venta
            </h2>

            <div className="mt-4">
              <p>
                <strong>Comprobante:</strong>{" "}
                {ventaSeleccionada.documento
                  ? `${ventaSeleccionada.documento.serie}-${String(
                      ventaSeleccionada.documento.numero
                    ).padStart(6, "0")}`
                  : "-"}
              </p>

              <p>
                <strong>Cliente:</strong>{" "}
                {ventaSeleccionada.cliente?.nombre ?? "Sin cliente"}
              </p>

              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(
                  ventaSeleccionada.createdAt
                ).toLocaleString("es-PE")}
              </p>
            </div>

            <div className="my-6 border-t" />

            <h3 className="font-semibold">
              Productos
            </h3>

            <div className="mt-3">
              {ventaSeleccionada.detalles.map((detalle) => (
                <div
                  key={detalle.id}
                  className="flex justify-between border-b py-3"
                >
                  <div>
                    <p className="font-medium">
                      {detalle.producto.nombre}
                    </p>

                    <p className="text-sm text-gray-500">
                      {detalle.cantidad} x S/{" "}
                      {Number(detalle.precioUnitario).toFixed(2)}
                    </p>
                  </div>

                  <p className="font-semibold">
                    S/ {Number(detalle.subtotal).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="my-6 border-t" />

            <div className="text-right">
              <p className="text-xl font-bold">
                Total: S/{" "}
                {Number(ventaSeleccionada.total).toFixed(2)}
              </p>

              <p className="mt-2">
                <strong>Pago:</strong>{" "}
                {ventaSeleccionada.metodoPago}
              </p>

              {ventaSeleccionada.metodoPago === "EFECTIVO" && (
                <>
                  <p>
                    <strong>Recibido:</strong> S/{" "}
                    {Number(
                      ventaSeleccionada.montoRecibido
                    ).toFixed(2)}
                  </p>

                  <p>
                    <strong>Vuelto:</strong> S/{" "}
                    {Number(
                      ventaSeleccionada.vuelto
                    ).toFixed(2)}
                  </p>
                </>
              )}
            </div>

            {mostrarComprobante && (
              <ComprobantePreview venta={ventaSeleccionada} />
            )}

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => {
                  setVentaSeleccionada(null);
                  setMostrarComprobante(false);
                }}
                className="rounded-lg border px-5 py-3"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => {
                  setMostrarComprobante(true);
                  setTimeout(() => window.print(), 100);
                }}
                className="rounded-lg bg-black px-5 py-3 text-white"
              >
                Reimprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}