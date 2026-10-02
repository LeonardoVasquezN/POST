"use client";

import { useEffect, useState } from "react";

type Producto = {
  id: number;
  nombre: string;
  precioBase: string;
  activo: boolean;
};

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombre, setNombre] = useState("");
  const [precioBase, setPrecioBase] = useState("");
  const [textoBusqueda, setTextoBusqueda] = useState("");

  const [productoEditando, setProductoEditando] =
    useState<Producto | null>(null);

  async function cargarProductos() {
    const response = await fetch("/api/productos");
    const data = await response.json();

    setProductos(data);
    setCargando(false);
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  async function guardarProducto() {
    if (productoEditando) {
      const response = await fetch("/api/productos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: productoEditando.id,
          nombre,
          precioBase: Number(precioBase),
        }),
      });

      if (!response.ok) {
        alert("No se pudo actualizar el producto");
        return;
      }
    } else {
      const response = await fetch("/api/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          precioBase: Number(precioBase),
        }),
      });

      if (!response.ok) {
        alert("No se pudo crear el producto");
        return;
      }
    }

    setNombre("");
    setPrecioBase("");
    setProductoEditando(null);
    setMostrarFormulario(false);

    await cargarProductos();
  }

  async function cambiarEstadoProducto(producto: Producto) {
    const response = await fetch("/api/productos", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: producto.id,
        activo: !producto.activo,
      }),
    });

    if (!response.ok) {
      alert("No se pudo cambiar el estado del producto");
      return;
    }

    await cargarProductos();
  }

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre
      .toLowerCase()
      .includes(textoBusqueda.toLowerCase())
  );

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-green-400" />
          <p className="text-sm text-gray-500">
            Cargando productos...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-5 py-8 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400" />

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Catálogo
              </span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white">
              Productos
            </h1>

            <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">
              Administra los productos disponibles para realizar
              tus ventas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setProductoEditando(null);
              setNombre("");
              setPrecioBase("");
              setMostrarFormulario(true);
            }}
            className="group flex items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 text-sm font-bold text-black shadow-lg shadow-green-500/10 transition hover:bg-green-400 hover:shadow-green-500/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 transition group-hover:rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 5v14M5 12h14"
              />
            </svg>

            Nuevo producto
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
              />
            </svg>

            <input
              type="text"
              value={textoBusqueda}
              onChange={(e) =>
                setTextoBusqueda(e.target.value)
              }
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3.5 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-green-500/40 focus:bg-white/[0.06]"
              placeholder="Buscar producto..."
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
            <div className="h-2 w-2 rounded-full bg-green-400" />

            <span className="text-xs text-gray-400">
              {productosFiltrados.length}{" "}
              {productosFiltrados.length === 1
                ? "producto"
                : "productos"}
            </span>
          </div>
        </div>

        {productosFiltrados.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025]">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2Z"
                />
              </svg>
            </div>

            <h2 className="text-sm font-semibold text-gray-300">
              No se encontraron productos
            </h2>

            <p className="mt-1 text-xs text-gray-600">
              Prueba con otro término de búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {productosFiltrados.map((producto) => (
              <div
                key={producto.id}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.05]"
              >
                {/* Línea superior */}
                <div
                  className={`absolute left-0 top-0 h-[2px] w-full ${
                    producto.activo
                      ? "bg-green-400/70"
                      : "bg-red-400/60"
                  }`}
                />

                <div className="flex items-start justify-between">

                  <span
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      producto.activo
                        ? "bg-green-400/10 text-green-400"
                        : "bg-red-400/10 text-red-400"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        producto.activo
                          ? "bg-green-400"
                          : "bg-red-400"
                      }`}
                    />

                    {producto.activo
                      ? "ACTIVO"
                      : "INACTIVO"}
                  </span>
                </div>

                <div className="mt-5">

                  <h2 className="mt-1 truncate text-lg font-bold text-white">
                    {producto.nombre}
                  </h2>
                </div>

                <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/30 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                    Precio base
                  </p>

                  <p className="mt-1 text-xl font-bold text-white">
                    S/{" "}
                    {Number(
                      producto.precioBase
                    ).toFixed(2)}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProductoEditando(producto);
                      setNombre(producto.nombre);
                      setPrecioBase(
                        producto.precioBase
                      );
                      setMostrarFormulario(true);
                    }}
                    className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-gray-300 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      cambiarEstadoProducto(producto)
                    }
                    className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                      producto.activo
                        ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                    }`}
                  >
                    {producto.activo
                      ? "Desactivar"
                      : "Activar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {mostrarFormulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111111] shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/[0.07] px-6 py-5">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-600">
                    Producto
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white">
                  {productoEditando
                    ? "Editar producto"
                    : "Nuevo producto"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {productoEditando
                    ? "Actualiza la información del producto."
                    : "Registra un producto para tus ventas."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  setProductoEditando(null);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/[0.06] hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div>
                <label className="text-xs font-semibold text-gray-400">
                  Nombre del producto
                </label>

                <input
                  type="text"
                  value={nombre}
                  onChange={(e) =>
                    setNombre(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-700 focus:border-green-500/40 focus:bg-white/[0.06]"
                  placeholder="Ej. Polo básico"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400">
                  Precio base
                </label>

                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600">
                    S/
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={precioBase}
                    onChange={(e) =>
                      setPrecioBase(e.target.value)
                    }
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-700 focus:border-green-500/40 focus:bg-white/[0.06]"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-white/[0.07] px-6 py-5">
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  setProductoEditando(null);
                }}
                className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-xs font-semibold text-gray-400 transition hover:bg-white/[0.07] hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => {
                  guardarProducto();
                }}
                className="flex-1 rounded-xl bg-green-500 px-4 py-3 text-xs font-bold text-black transition hover:bg-green-400"
              >
                {productoEditando
                  ? "Actualizar"
                  : "Guardar producto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}