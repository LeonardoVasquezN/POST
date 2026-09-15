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
    producto.nombre.toLowerCase().includes(textoBusqueda.toLowerCase())
  );

  if (cargando) {
    return <p>Cargando productos...</p>;
  }

  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>

        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          <h2 className="text-lg font-semibold">
            {productoEditando ? "Editar producto" : "Nuevo producto"}
          </h2>
        </button>
      </div>

      {mostrarFormulario && (
        <div className="mt-6 rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Nuevo producto</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium">
                Nombre
              </label>

              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2"
                placeholder="Ej. Polo básico"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Precio base
              </label>

              <input
                type="number"
                value={precioBase}
                onChange={(e) => setPrecioBase(e.target.value)}
                className="mt-1 w-full rounded-lg border p-2"
                placeholder="Ej. 35"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMostrarFormulario(false)}
                className="rounded-lg border px-4 py-2"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  guardarProducto();
                }}
                className="rounded-lg bg-black px-4 py-2 text-white"
              >
                {productoEditando ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <input
          type="text"
          value={textoBusqueda}
          onChange={(e) => setTextoBusqueda(e.target.value)}
          className="w-full rounded-lg border p-2"
          placeholder="Buscar producto..."
        />
      </div>

      <div className="mt-6 space-y-3">
        {productosFiltrados.map((producto) => (
          <div
            key={producto.id}
            className="flex justify-between rounded-lg border p-4"
          >
            <span>{producto.nombre}</span>

            <span>S/ {producto.precioBase}</span>

            <button
              onClick={() => {
                setProductoEditando(producto);
                setNombre(producto.nombre);
                setPrecioBase(producto.precioBase);
                setMostrarFormulario(true);
              }}
              className="rounded-lg border px-3 py-1"
            >
              Editar
            </button>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={producto.activo}
                onChange={() => cambiarEstadoProducto(producto)}
              />

              <span>
                {producto.activo ? "Activo" : "Inactivo"}
              </span>
            </label>
          </div>
        ))}
      </div>
    </main>
  );
}