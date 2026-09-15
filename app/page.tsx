import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold text-gray-600">Mi tienda</h1>

      <p className="mt-2 text-white-600 ">
        ¿Qué deseas hacer?
      </p>

      <div className="mt-8 flex w-full max-w-md flex-col gap-4">
        <Link
          href="/ventas"
          className="rounded-lg border px-6 py-4 text-center text-lg font-semibold"
        >
          Nueva venta
        </Link>

        <Link
          href="/productos"
          className="rounded-lg border px-6 py-4 text-center text-lg font-semibold"
        >
          Productos
        </Link>

        <Link
          href="/historial"
          className="rounded-lg border px-6 py-4 text-center text-lg font-semibold"
        >
          Historial
        </Link>
      </div>
    </main>
  );
}