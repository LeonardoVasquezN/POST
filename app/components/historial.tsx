"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  guiaRemision: {
    id: number;
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

  const hoy = new Date();

  const fechaHoy = `${hoy.getFullYear()}-${String(
    hoy.getMonth() + 1
  ).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

  const [desde, setDesde] = useState(fechaHoy);
  const [hasta, setHasta] = useState(fechaHoy);
  const [tipo, setTipo] = useState("TODOS");

  const router = useRouter();

  async function cargarVentas() {
    try {
      setCargando(true);

      const params = new URLSearchParams({
        desde,
        hasta,
        tipo,
      });

      const response = await fetch(`/api/ventas?${params.toString()}`);
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

  useEffect(() => {
    cargarVentas();
  }, []);

  return (
    <main className="min-h-screen bg-black px-5 py-8 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400" />

            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600">
              Ventas
            </span>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Historial de ventas
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Consulta y revisa las ventas registradas en el sistema.
              </p>
            </div>

            <div className="flex h-9 w-fit items-center rounded-full border border-white/[0.07] bg-white/[0.035] px-4">
              <span className="text-xs font-semibold text-gray-400">
                {ventas.length}{" "}
                {ventas.length === 1 ? "venta" : "ventas"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-400/10 text-green-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 12.414V19a1 1 0 01-.553.894l-4 2A1 1 0 019 21v-8.586L3.293 6.707A1 1 0 013 6V4z"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-sm font-bold text-white">
                Filtrar ventas
              </h2>

              <p className="text-xs text-gray-600">
                Selecciona el período y tipo de comprobante.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-600">
                Desde
              </label>

              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-black px-3 py-3 text-sm text-white outline-none transition focus:border-green-400/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-600">
                Hasta
              </label>

              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-black px-3 py-3 text-sm text-white outline-none transition focus:border-green-400/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-gray-600">
                Comprobante
              </label>

              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-black px-3 py-3 text-sm text-white outline-none transition focus:border-green-400/40"
              >
                <option value="TODOS">Todos</option>
                <option value="NOTA">Notas de venta</option>
                <option value="BOLETA">Boletas</option>
                <option value="FACTURA">Facturas</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  if (!desde || !hasta) {
                    alert("Selecciona ambas fechas");
                    return;
                  }

                  if (desde > hasta) {
                    alert(
                      "La fecha desde no puede ser mayor que la fecha hasta"
                    );
                    return;
                  }

                  cargarVentas();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 text-xs font-bold text-black transition hover:bg-green-400"
              >
                Buscar

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {cargando ? (
          <div className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.035] py-16 text-center">
            <div className="mx-auto mb-4 h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-green-400" />

            <p className="text-sm text-gray-500">
              Cargando ventas...
            </p>
          </div>
        ) : ventas.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.035] py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 14l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622C17.176 19.29 21 14.591 21 9c0-1.034-.13-2.038-.382-3.016z"
                />
              </svg>
            </div>

            <p className="text-sm font-semibold text-gray-400">
              No hay ventas registradas
            </p>

            <p className="mt-1 text-xs text-gray-600">
              No se encontraron ventas para los filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.035]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-600">
                      Comprobante
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-600">
                      Fecha
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-600">
                      Cliente
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-600">
                      Total
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-gray-600">
                      Pago
                    </th>

                    <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-gray-600">
                      Acción
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {ventas.map((venta) => (
                    <tr
                      key={venta.id}
                      className="border-b border-white/[0.05] transition hover:bg-white/[0.025]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-400/10 text-green-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.7}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-white">
                              {venta.documento
                                ? `${venta.documento.serie}-${String(
                                    venta.documento.numero
                                  ).padStart(6, "0")}`
                                : "-"}
                            </p>

                            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-600">
                              {venta.documento?.tipo ?? "VENTA"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-400">
                        {new Date(venta.createdAt).toLocaleString("es-PE")}
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-[180px] truncate text-sm text-gray-300">
                          {venta.cliente?.nombre ?? "Sin cliente"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-white">
                          S/ {Number(venta.total).toFixed(2)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-lg border border-white/[0.07] bg-white/[0.035] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {venta.metodoPago}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setVentaSeleccionada(venta)}
                          className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-bold text-gray-300 transition hover:border-green-400/30 hover:bg-green-400/10 hover:text-green-400"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {ventaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-white/[0.08] bg-[#111111] p-6 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
                    Detalle
                  </span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight">
                  Detalle de venta
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setVentaSeleccionada(null);
                  setMostrarComprobante(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-gray-500 transition hover:bg-white/[0.07] hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                  Comprobante
                </p>

                <p className="mt-2 text-sm font-semibold text-white">
                  {ventaSeleccionada.documento
                    ? `${ventaSeleccionada.documento.serie}-${String(
                        ventaSeleccionada.documento.numero
                      ).padStart(6, "0")}`
                    : "-"}
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                  Cliente
                </p>

                <p className="mt-2 truncate text-sm font-semibold text-white">
                  {ventaSeleccionada.cliente?.nombre ?? "Sin cliente"}
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                  Fecha
                </p>

                <p className="mt-2 text-sm font-semibold text-white">
                  {new Date(
                    ventaSeleccionada.createdAt
                  ).toLocaleString("es-PE")}
                </p>
              </div>
            </div>

            <div className="my-6 border-t border-white/[0.07]" />

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                Productos
              </h3>

              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                {ventaSeleccionada.detalles.length}{" "}
                {ventaSeleccionada.detalles.length === 1
                  ? "producto"
                  : "productos"}
              </span>
            </div>

            <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.06]">
              {ventaSeleccionada.detalles.map((detalle, index) => (
                <div
                  key={detalle.id}
                  className={`flex items-center justify-between gap-4 bg-white/[0.02] px-4 py-4 ${
                    index !== ventaSeleccionada.detalles.length - 1
                      ? "border-b border-white/[0.06]"
                      : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {detalle.producto.nombre}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {detalle.cantidad} x S/{" "}
                      {Number(detalle.precioUnitario).toFixed(2)}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-bold text-white">
                    S/ {Number(detalle.subtotal).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="my-6 border-t border-white/[0.07]" />

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Total
                </span>

                <span className="text-2xl font-bold text-green-400">
                  S/ {Number(ventaSeleccionada.total).toFixed(2)}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
                <span className="text-sm text-gray-500">
                  Método de pago
                </span>

                <span className="text-sm font-semibold text-white">
                  {ventaSeleccionada.metodoPago}
                </span>
              </div>

              {ventaSeleccionada.metodoPago === "EFECTIVO" && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-black/40 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-600">
                      Recibido
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      S/{" "}
                      {Number(
                        ventaSeleccionada.montoRecibido
                      ).toFixed(2)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-black/40 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-600">
                      Vuelto
                    </p>

                    <p className="mt-1 text-sm font-semibold text-green-400">
                      S/{" "}
                      {Number(
                        ventaSeleccionada.vuelto
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {mostrarComprobante && (
              <ComprobantePreview venta={ventaSeleccionada} />
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setVentaSeleccionada(null);
                  setMostrarComprobante(false);
                }}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-xs font-bold text-gray-400 transition hover:bg-white/[0.07] hover:text-white"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => {
                  setMostrarComprobante(true);
                  setTimeout(() => window.print(), 100);
                }}
                className="rounded-xl bg-green-500 px-5 py-3 text-xs font-bold text-black transition hover:bg-green-400"
              >
                Reimprimir
              </button>

              {ventaSeleccionada.documento &&
                (ventaSeleccionada.documento.tipo === "BOLETA" ||
                  ventaSeleccionada.documento.tipo === "FACTURA") &&
                (ventaSeleccionada.guiaRemision ? (
                  <button
                    type="button"
                    onClick={() => {
                      router.push(
                        `/gestion/guias-remision/${ventaSeleccionada.guiaRemision!.id}`
                      );
                    }}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-xs font-bold text-gray-300 transition hover:border-blue-400/30 hover:bg-blue-400/10 hover:text-blue-400"
                  >
                    Ver guía
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      router.push(
                        `/gestion/guias-remision/nueva?ventaId=${ventaSeleccionada.id}`
                      );
                    }}
                    className="rounded-xl bg-blue-500 px-5 py-3 text-xs font-bold text-white transition hover:bg-blue-400"
                  >
                    Emitir guía
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}