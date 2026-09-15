"use client";
import { useState } from "react";

type MetodoPago =
  | "EFECTIVO"
  | "YAPE"
  | "PLIN"
  | "TRANSFERENCIA"
  | "TARJETA"
  | "";

type ProductoVenta = {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
};

export default function NotaVenta() {
  const [cliente, setCliente] = useState("");
  const [busquedaProducto, setBusquedaProducto] = useState("");

  const [productos, setProductos] = useState<ProductoVenta[]>([]);

  const [metodoPago, setMetodoPago] = useState<MetodoPago>("");
  const [montoRecibido, setMontoRecibido] = useState("");

  const total = productos.reduce(
    (acumulado, producto) =>
      acumulado + producto.cantidad * producto.precio,
    0
  );

  const vuelto =
    metodoPago === "EFECTIVO" && montoRecibido
      ? Number(montoRecibido) - total
      : 0;

  function agregarProducto() {
    console.log("Buscar producto:", busquedaProducto);
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">Nueva nota de venta</h1>

        {/* Cliente */}
        <section className="mt-8 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">Cliente</h2>

          <div className="mt-4 flex gap-3">
            <input
              type="text"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="Buscar cliente..."
            />

            <button
              type="button"
              className="rounded-lg border px-5 py-3"
            >
              Nuevo cliente
            </button>
          </div>
        </section>

        {/* Productos */}
        <section className="mt-6 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">Productos</h2>

          <div className="mt-4 flex gap-3">
            <input
              type="text"
              value={busquedaProducto}
              onChange={(e) => setBusquedaProducto(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="Buscar producto..."
            />

            <button
              type="button"
              onClick={agregarProducto}
              className="rounded-lg bg-black px-5 py-3 text-white"
            >
              Agregar
            </button>
          </div>

          {productos.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-3">Producto</th>
                    <th className="p-3">Cantidad</th>
                    <th className="p-3">Precio</th>
                    <th className="p-3">Subtotal</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>

                <tbody>
                  {productos.map((producto) => (
                    <tr key={producto.id} className="border-b">
                      <td className="p-3">{producto.nombre}</td>

                      <td className="p-3">
                        <input
                          type="number"
                          min="1"
                          value={producto.cantidad}
                          className="w-20 rounded-lg border p-2"
                        />
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={producto.precio}
                          className="w-28 rounded-lg border p-2"
                        />
                      </td>

                      <td className="p-3">
                        S/{" "}
                        {(producto.cantidad * producto.precio).toFixed(2)}
                      </td>

                      <td className="p-3">
                        <button
                          type="button"
                          className="text-red-600"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-6 text-gray-500">
              No hay productos agregados.
            </p>
          )}
        </section>

        {/* Total */}
        <section className="mt-6 flex justify-end">
          <div className="text-right">
            <p className="text-lg text-gray-600">Total</p>
            <p className="text-4xl font-bold">
              S/ {total.toFixed(2)}
            </p>
          </div>
        </section>

        {/* Pago */}
        <section className="mt-6 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">Método de pago</h2>

          <div className="mt-4 flex flex-wrap gap-3">
            {[
              ["EFECTIVO", "Efectivo"],
              ["YAPE", "Yape"],
              ["PLIN", "Plin"],
              ["TRANSFERENCIA", "Transferencia"],
              ["TARJETA", "Tarjeta"],
            ].map(([valor, texto]) => (
              <button
                key={valor}
                type="button"
                onClick={() => setMetodoPago(valor as MetodoPago)}
                className={`rounded-lg border px-5 py-3 ${
                  metodoPago === valor
                    ? "bg-black text-white"
                    : ""
                }`}
              >
                {texto}
              </button>
            ))}
          </div>

          {metodoPago === "EFECTIVO" && (
            <div className="mt-6 max-w-sm">
              <label className="block text-sm font-medium">
                Monto recibido
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={montoRecibido}
                onChange={(e) => setMontoRecibido(e.target.value)}
                className="mt-1 w-full rounded-lg border p-3"
                placeholder="0.00"
              />

              <div className="mt-4">
                <p className="text-sm text-gray-600">Vuelto</p>
                <p className="text-2xl font-bold">
                  S/ {vuelto.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Registrar */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            className="rounded-lg bg-black px-8 py-4 text-lg font-semibold text-white"
          >
            Registrar venta
          </button>
        </div>
      </div>
    </main>
  );
}