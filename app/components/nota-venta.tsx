"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

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
  precio: number | string;
  cantidad: number | string;
};

type Producto = {
  id: number;
  nombre: string;
  precioBase: string;
  activo: boolean;
};

type Cliente = {
  id: number;
  nombre: string;
  dni: string | null;
  ruc: string | null;
  direccion: string | null;
};

export default function NotaVenta() {
  const [cliente, setCliente] = useState("");
  const [busquedaProducto, setBusquedaProducto] = useState("");

  const [productos, setProductos] = useState<ProductoVenta[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);

  const [metodoPago, setMetodoPago] = useState<MetodoPago>("");
  const [montoRecibido, setMontoRecibido] = useState("");

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  useEffect(() => {
    async function cargarDatos() {
      const responseProductos = await fetch("/api/productos");
      const dataProductos = await responseProductos.json();

      setProductosDisponibles(
        dataProductos.filter((producto: Producto) => producto.activo)
      );

      const responseClientes = await fetch("/api/clientes");
      const dataClientes = await responseClientes.json();

      setClientes(dataClientes);
    }

    cargarDatos();
  }, []);

  const total = productos.reduce(
    (acumulado, producto) =>
      acumulado + Number(producto.cantidad) * Number(producto.precio),
    0
  );

  const vuelto =
    metodoPago === "EFECTIVO" && montoRecibido
      ? Number(montoRecibido) - total
      : 0;

  function agregarProducto(productoEncontrado: Producto) {
    const productoYaAgregado = productos.find(
      (producto) => producto.id === productoEncontrado.id
    );

    if (productoYaAgregado) {
      setProductos(
        productos.map((producto) =>
          producto.id === productoEncontrado.id
            ? {
                ...producto,
                cantidad: Number(producto.cantidad) + 1,
              }
            : producto
        )
      );
    } else {
      setProductos([
        ...productos,
        {
          id: productoEncontrado.id,
          nombre: productoEncontrado.nombre,
          precio: Number(productoEncontrado.precioBase),
          cantidad: 1,
        },
      ]);
    }

    setBusquedaProducto("");
  }

  function eliminarProducto(id: number) {
    setProductos(
      productos.filter((producto) => producto.id !== id)
    );
  }

  function validarVenta() {
    if(productos.length === 0) {
      alert("Debes agregar al menos un producto");
      return;
    }

    for (const producto of productos) {
      const cantidad = Number(producto.cantidad);
      const precio = Number(producto.precio);

      if (
        producto.cantidad === "" ||
        !Number.isInteger(cantidad) ||
        cantidad <= 0
      ) {
        alert(`La cantidad de "${producto.nombre}" no es válida`);
        return;
      }

      if (
        producto.precio === "" ||
        !Number.isFinite(precio) ||
        precio < 0
      ) {
        alert(`El precio de "${producto.nombre}" no es válido`);
        return;
      }
    }

    alert("Venta válida");
  }

  const productosFiltrados = productosDisponibles.filter((producto) =>
    producto.nombre
      .toLowerCase()
      .includes(busquedaProducto.toLowerCase())
  );

  const clientesFiltrados = clientes.filter((cliente) =>
    `${cliente.nombre} ${cliente.dni ?? ""} ${cliente.ruc ?? ""}`
      .toLowerCase()
      .includes(busquedaCliente.toLowerCase())
  );

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">Nueva nota de venta</h1>

        {/* Cliente */}
        <section className="mt-8 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">Cliente</h2>

          <div className="relative mt-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={
                  clienteSeleccionado
                    ? clienteSeleccionado.nombre
                    : busquedaCliente
                }
                onChange={(e) => {
                  setClienteSeleccionado(null);
                  setBusquedaCliente(e.target.value);
                }}
                className="w-full rounded-lg border p-3"
                placeholder="Buscar cliente por nombre, DNI o RUC..."
              />

              <Link
                href="/clientes"
                className="rounded-lg border px-5 py-3 whitespace-nowrap"
              >
                Nuevo cliente
              </Link>
            </div>

            {busquedaCliente && clientesFiltrados.length > 0 && (
              <div className="absolute left-0 right-0 z-10 mt-1 rounded-lg border bg-black shadow">
                {clientesFiltrados.map((cliente) => (
                  <button
                    key={cliente.id}
                    type="button"
                    onClick={() => {
                      setClienteSeleccionado(cliente);
                      setBusquedaCliente("");
                    }}
                    className="block w-full border-b p-3 text-left hover:bg-neutral-800"
                  >
                    <div>{cliente.nombre}</div>

                    {cliente.dni && (
                      <div className="text-sm text-gray-400">
                        DNI: {cliente.dni}
                      </div>
                    )}

                    {cliente.ruc && (
                      <div className="text-sm text-gray-400">
                        RUC: {cliente.ruc}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Productos */}
        <section className="mt-6 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">Productos</h2>

          <div className="relative mt-4">
            <div className="relative mt-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  className="w-full rounded-lg border p-3"
                  placeholder="Buscar producto..."
                />

                <Link
                  href="/productos"
                  className="rounded-lg border px-5 py-3 whitespace-nowrap"
                >
                  Nuevo producto
                </Link>
              </div>

              {busquedaProducto && productosFiltrados.length > 0 && (
                <div className="absolute left-0 right-0 z-10 mt-1 rounded-lg border bg-black shadow">
                  {productosFiltrados.map((producto) => (
                    <button
                      key={producto.id}
                      type="button"
                      onClick={() => agregarProducto(producto)}
                      className="block w-full border-b p-3 text-left hover:bg-neutral-800"
                    >
                      {producto.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
                          onChange={(e) => {
                            const cantidad = e.target.value;

                            setProductos(
                              productos.map((item) =>
                                item.id === producto.id
                                  ? {
                                      ...item,
                                      cantidad: cantidad,
                                    }
                                  : item
                              )
                            );
                          }}
                          className="w-20 rounded-lg border p-2"
                        />
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={producto.precio}
                          onChange={(e) => {
                            const valor = e.target.value;

                            setProductos(
                              productos.map((item) =>
                                item.id === producto.id
                                  ? {
                                      ...item,
                                      precio: valor
                                    }
                                  : item
                              )
                            );
                          }}
                          className="w-28 rounded-lg border p-2"
                        />
                      </td>

                      <td className="p-3">
                        S/{" "}
                        {(Number(producto.cantidad) * Number(producto.precio)).toFixed(2)}
                      </td>

                      <td className="p-3">
                        <button
                          type="button"
                          className="text-red-600"
                          onClick={() => eliminarProducto(producto.id)}
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
            onClick={validarVenta}
          >
            Registrar venta
          </button>
        </div>
      </div>
    </main>
  );
}