"use client";

import Link from "next/link";

export default function VentasPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-8 md:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center">
        <div className="mb-10 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400" />

            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600">
              Ventas
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Crear nuevo comprobante
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
            Selecciona el tipo de comprobante que deseas
            emitir para registrar una nueva venta.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.035] p-6 transition duration-200 hover:-translate-y-1 hover:border-green-400/30 hover:bg-white/[0.05]">
            <div className="absolute left-0 top-0 h-[2px] w-full bg-green-400/70" />

            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-400/10 text-green-400">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-700">
                Venta
              </span>
            </div>

            <div className="mt-7">
              <h2 className="text-lg font-bold text-white">
                Nota de Venta
              </h2>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                Registra una venta de forma rápida y sencilla.
              </p>
            </div>

            <Link
              href="/ventas/nota"
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-xs font-bold text-black transition hover:bg-green-400"
            >
              Comenzar

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14m-5-5 5 5-5 5"
                />
              </svg>
            </Link>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.035] p-6 transition duration-200 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.05]">
            <div className="absolute left-0 top-0 h-[2px] w-full bg-blue-400/70" />

            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-400/10 text-blue-400">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-700">
                SUNAT
              </span>
            </div>

            <div className="mt-7">
              <h2 className="text-lg font-bold text-white">
                Boleta Electrónica
              </h2>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                Emite una boleta electrónica para tu cliente.
              </p>
            </div>

            <Link
              href="/ventas/boleta"
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-xs font-bold text-white transition hover:bg-blue-400"
            >
              Comenzar

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14m-5-5 5 5-5 5"
                />
              </svg>
            </Link>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.035] p-6 transition duration-200 hover:-translate-y-1 hover:border-red-400/30 hover:bg-white/[0.05]">
            <div className="absolute left-0 top-0 h-[2px] w-full bg-red-400/70" />

            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-400/10 text-red-400">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-700">
                SUNAT
              </span>
            </div>

            <div className="mt-7">
              <h2 className="text-lg font-bold text-white">
                Factura Electrónica
              </h2>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                Emite una factura electrónica para tu cliente.
              </p>
            </div>

            <Link
              href="/ventas/factura"
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-xs font-bold text-white transition hover:bg-red-400"
            >
              Comenzar

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14m-5-5 5 5-5 5"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}