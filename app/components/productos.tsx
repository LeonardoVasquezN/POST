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

  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);

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
      <main className="min-h-screen p-8">
        <div className="mx-auto max-w-6xl">
          <p className="mt-8">Cargando productos...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            Productos
          </h1>

          <button
            type="button"
            onClick={() => {
              setProductoEditando(null);
              setNombre("");
              setPrecioBase("");
              setMostrarFormulario(true);
            }}
           className="rounded-lg border border-white bg-black px-4 py-2 text-white"
          >
            Nuevo producto
          </button>
        </div>

        <div className="mt-6">
          <input
            type="text"
            value={textoBusqueda}
            onChange={(e) => setTextoBusqueda(e.target.value)}
            className="w-full rounded-lg border p-2"
            placeholder="Buscar producto..."
          />
        </div>

        {productosFiltrados.length === 0 ? (
          <p className="mt-8 text-gray-500">
            No hay productos que coincidan con la búsqueda.
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4">Producto</th>
                  <th className="p-4">Precio base</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {productosFiltrados.map((producto) => (
                  <tr
                    key={producto.id}
                    className="border-b last:border-b-0"
                  >
                    <td className="p-4 font-medium">
                      {producto.nombre}
                    </td>

                    <td className="p-4">
                      S/ {Number(producto.precioBase).toFixed(2)}
                    </td>

                    <td className="p-4">
                      {producto.activo ? "Activo" : "Inactivo"}
                    </td>

                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setProductoEditando(producto);
                            setNombre(producto.nombre);
                            setPrecioBase(producto.precioBase);
                            setMostrarFormulario(true);
                          }}
                          className="rounded-lg border px-4 py-2"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            cambiarEstadoProducto(producto)
                          }
                          className="rounded-lg border px-4 py-2"
                        >
                          {producto.activo
                            ? "Desactivar"
                            : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {mostrarFormulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-black">
              {productoEditando
                ? "Editar producto"
                : "Nuevo producto"}
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-black">
                  Nombre
                </label>

                <input
                  type="text"
                  value={nombre}
                  onChange={(e) =>
                    setNombre(e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border p-3 text-black"
                  placeholder="Ej. Polo básico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black">
                  Precio base
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={precioBase}
                  onChange={(e) =>
                    setPrecioBase(e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border p-3 text-black"
                  placeholder="Ej. 35"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  setProductoEditando(null);
                }}
                className="rounded-lg border border-black px-5 py-3 text-black"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => {
                  guardarProducto();
                }}
                className="rounded-lg bg-black px-5 py-3 text-white"
              >
                {productoEditando
                  ? "Actualizar"
                  : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}