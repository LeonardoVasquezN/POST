"use client";

import Link from "next/link";

export default function VentasPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold">
        ¿Qué documento necesitas?
      </h1>

      <div className="mt-8 flex w-full max-w-md flex-col gap-4">
        <Link
          href="/ventas/nota"
          className="flex items-center justify-center rounded-lg border px-6 py-4 text-lg font-semibold"
        >
          Nota de venta
        </Link>

        <Link
          href="/ventas/boleta"
          className="flex items-center justify-center rounded-lg border px-6 py-4 text-lg font-semibold"
        >
          Boleta Electrónica
        </Link>

        <button
          className="rounded-lg border px-6 py-4 text-lg font-semibold"
        >
          Factura electrónica
        </button>
      </div>
    </main>
  );
}