"use client";

import { useEffect, useState } from "react";
import ComprobantePreview from "./comprobante-preview";

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

export default function FacturaVenta() {
  const [busquedaProducto, setBusquedaProducto] = useState("");

  const [productos, setProductos] = useState<ProductoVenta[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);

  const [metodoPago, setMetodoPago] = useState<MetodoPago>("");
  const [montoRecibido, setMontoRecibido] = useState("");

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  const [mostrarModalCliente, setMostrarModalCliente] = useState(false);

  const [nuevoClienteRazonSocial, setNuevoClienteRazonSocial] = useState("");
  const [nuevoClienteRuc, setNuevoClienteRuc] = useState("");
  const [nuevoClienteDireccion, setNuevoClienteDireccion] = useState("");

  const [registrandoCliente, setRegistrandoCliente] = useState(false);

  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [nuevoProductoNombre, setNuevoProductoNombre] = useState("");
  const [nuevoProductoPrecio, setNuevoProductoPrecio] = useState("");
  const [registrandoProducto, setRegistrandoProducto] = useState(false);

  const [procesandoFactura, setProcesandoFactura] = useState(false);

  const [ventaRegistrada, setVentaRegistrada] = useState<any>(null);
  const [mostrarModalImpresion, setMostrarModalImpresion] = useState(false);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const responseProductos = await fetch("/api/productos");
        const dataProductos = await responseProductos.json();

        setProductosDisponibles(
          dataProductos.filter(
            (producto: Producto) => producto.activo
          )
        );

        const responseClientes = await fetch("/api/clientes");
        const dataClientes = await responseClientes.json();
        setClientes(
          dataClientes.filter(
            (cliente: Cliente) => cliente.ruc
          )
        );
      } catch (error) {
        console.error(error);
        alert("No se pudieron cargar los datos");
      }
    }

    cargarDatos();
  }, []);

  const total = productos.reduce(
    (acumulado, producto) =>
      acumulado +
      Number(producto.cantidad) * Number(producto.precio),
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

  async function validarFactura() {

    if (procesandoFactura) return;

    if (!clienteSeleccionado) {
      alert("Debes seleccionar un cliente con RUC");
      return;
    }

    if (!clienteSeleccionado.ruc) {
      alert("La factura requiere un cliente con RUC");
      return;
    }

    if (!clienteSeleccionado.nombre.trim()) {
      alert("La razón social del cliente es obligatoria");
      return;
    }

    if (productos.length === 0) {
      alert("Debes agregar al menos un producto");
      return;
    }

    if (!metodoPago) {
      alert("Debes seleccionar un método de pago");
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

    if (metodoPago === "EFECTIVO") {
      const recibido = Number(montoRecibido);

      if (
        montoRecibido === "" ||
        !Number.isFinite(recibido) ||
        recibido < total
      ) {
        alert("El monto recibido no es suficiente");
        return;
      }
    }

    setProcesandoFactura(true);

    try {
      const response = await fetch("/api/documentos/factura", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clienteId: clienteSeleccionado.id,

          metodoPago,

          montoRecibido:
            metodoPago === "EFECTIVO"
              ? Number(montoRecibido)
              : null,

          detalles: productos.map((producto) => ({
            productoId: producto.id,
            cantidad: Number(producto.cantidad),
            precioUnitario: Number(producto.precio),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || data.message || "No se pudo emitir la factura");
        return;
      }

      if (response.status === 201) {
        setVentaRegistrada(data.venta);
        setMostrarModalImpresion(true);

        console.log("FACTURA EMITIDA:", data);

        return;
      }

      if (response.status === 202) {
        alert(
          `La factura fue enviada y está pendiente de aceptación por SUNAT.\n\n` +
          `Comprobante: ${data.serie}-${String(data.numero).padStart(6, "0")}`
        );

        console.log("FACTURA PENDIENTE:", data);

        return;
      }

      alert(data.message || "Factura procesada");
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al conectar con la API de factura");
    } finally {
      setProcesandoFactura(false);
    }
  }

  async function registrarCliente() {
    if (registrandoCliente) return;

    const razonSocial = nuevoClienteRazonSocial.trim();
    const ruc = nuevoClienteRuc.trim();
    const direccion = nuevoClienteDireccion.trim();

    if (!razonSocial) {
      alert("Debes ingresar la razón social");
      return;
    }

    if (!ruc) {
      alert("Debes ingresar el RUC");
      return;
    }

    if (!/^\d{11}$/.test(ruc)) {
      alert("El RUC debe tener 11 dígitos");
      return;
    }

    setRegistrandoCliente(true);

    try {
      const response = await fetch("/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: razonSocial,
          dni: null,
          ruc,
          direccion: direccion || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "No se pudo registrar el cliente");
        return;
      }

      setClientes((clientesActuales) => [
        ...clientesActuales,
        data,
      ]);

      setClienteSeleccionado(data);
      setBusquedaCliente("");

      setNuevoClienteRazonSocial("");
      setNuevoClienteRuc("");
      setNuevoClienteDireccion("");

      setMostrarModalCliente(false);
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al registrar el cliente");
    } finally {
      setRegistrandoCliente(false);
    }
  }

  async function registrarProducto() {
    if (registrandoProducto) return;

    const nombre = nuevoProductoNombre.trim();
    const precio = Number(nuevoProductoPrecio);

    if (!nombre) {
      alert("Debes ingresar el nombre del producto");
      return;
    }

    if (
      nuevoProductoPrecio === "" ||
      !Number.isFinite(precio) ||
      precio < 0
    ) {
      alert("Debes ingresar un precio válido");
      return;
    }

    setRegistrandoProducto(true);

    try {
      const response = await fetch("/api/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          precioBase: precio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "No se pudo registrar el producto");
        return;
      }

      const productoNuevo: Producto = {
        id: data.id,
        nombre: data.nombre,
        precioBase: String(data.precioBase),
        activo: data.activo,
      };

      setProductosDisponibles((productosActuales) => [
        ...productosActuales,
        productoNuevo,
      ]);

      agregarProducto(productoNuevo);

      setNuevoProductoNombre("");
      setNuevoProductoPrecio("");
      setMostrarModalProducto(false);
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al registrar el producto");
    } finally {
      setRegistrandoProducto(false);
    }
  }

  const productosFiltrados = productosDisponibles.filter((producto) =>
    producto.nombre
      .toLowerCase()
      .includes(busquedaProducto.toLowerCase())
  );

  const clientesFiltrados = clientes.filter((cliente) =>
    `${cliente.nombre} ${cliente.ruc ?? ""}`
      .toLowerCase()
      .includes(busquedaCliente.toLowerCase())
  );

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">
          Nueva factura electrónica
        </h1>

        <section className="mt-8 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">
            Cliente
          </h2>

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
                placeholder="Buscar cliente por RUC o razón social..."
              />

              <button
                type="button"
                onClick={() => setMostrarModalCliente(true)}
                className="whitespace-nowrap rounded-lg border px-5 py-3"
              >
                Nuevo cliente
              </button>
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

                    <div className="text-sm text-gray-400">
                      RUC: {cliente.ruc}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {clienteSeleccionado && (
            <div className="mt-4 rounded-lg border p-4">
              <p>
                <span className="font-semibold">
                  RUC:
                </span>{" "}
                {clienteSeleccionado.ruc}
              </p>

              <p>
                <span className="font-semibold">
                  Razón social:
                </span>{" "}
                {clienteSeleccionado.nombre}
              </p>

              <p>
                <span className="font-semibold">
                  Dirección:
                </span>{" "}
                {clienteSeleccionado.direccion || "-"}
              </p>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">
            Productos
          </h2>

          <div className="relative mt-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={busquedaProducto}
                onChange={(e) =>
                  setBusquedaProducto(e.target.value)
                }
                className="w-full rounded-lg border p-3"
                placeholder="Buscar producto..."
              />

              <button
                type="button"
                onClick={() => setMostrarModalProducto(true)}
                className="whitespace-nowrap rounded-lg border px-5 py-3"
              >
                Nuevo producto
              </button>
            </div>

            {busquedaProducto &&
              productosFiltrados.length > 0 && (
                <div className="absolute left-0 right-0 z-10 mt-1 rounded-lg border bg-black shadow">
                  {productosFiltrados.map((producto) => (
                    <button
                      key={producto.id}
                      type="button"
                      onClick={() =>
                        agregarProducto(producto)
                      }
                      className="block w-full border-b p-3 text-left hover:bg-neutral-800"
                    >
                      {producto.nombre}
                    </button>
                  ))}
                </div>
              )}
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
                    <tr
                      key={producto.id}
                      className="border-b"
                    >
                      <td className="p-3">
                        {producto.nombre}
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          min="1"
                          value={producto.cantidad}
                          onChange={(e) => {
                            const cantidad =
                              e.target.value;

                            setProductos(
                              productos.map((item) =>
                                item.id === producto.id
                                  ? {
                                      ...item,
                                      cantidad,
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
                            const valor =
                              e.target.value;

                            setProductos(
                              productos.map((item) =>
                                item.id === producto.id
                                  ? {
                                      ...item,
                                      precio: valor,
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
                        {(
                          Number(producto.cantidad) *
                          Number(producto.precio)
                        ).toFixed(2)}
                      </td>

                      <td className="p-3">
                        <button
                          type="button"
                          className="text-red-600"
                          onClick={() =>
                            eliminarProducto(producto.id)
                          }
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

        <section className="mt-6 flex justify-end">
          <div className="text-right">
            <p className="text-lg text-gray-600">
              Total
            </p>

            <p className="text-4xl font-bold">
              S/ {total.toFixed(2)}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">
            Método de pago
          </h2>

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
                onClick={() =>
                  setMetodoPago(valor as MetodoPago)
                }
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
                onChange={(e) =>
                  setMontoRecibido(e.target.value)
                }
                className="mt-1 w-full rounded-lg border p-3"
                placeholder="0.00"
              />

              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Vuelto
                </p>

                <p className="text-2xl font-bold">
                  S/ {vuelto.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </section>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={validarFactura}
            disabled={procesandoFactura}
            className="rounded-lg border border-white bg-black px-8 py-4 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {procesandoFactura
              ? "Procesando..."
              : "Emitir Factura"}
          </button>
        </div>
      </div>

      {mostrarModalCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-black">
              Nuevo cliente
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-black">
                  Razón social *
                </label>

                <input
                  type="text"
                  value={nuevoClienteRazonSocial}
                  onChange={(e) =>
                    setNuevoClienteRazonSocial(
                      e.target.value
                    )
                  }
                  className="mt-1 w-full rounded-lg border p-3 text-black"
                  placeholder="Razón social"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black">
                  RUC *
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  value={nuevoClienteRuc}
                  onChange={(e) =>
                    setNuevoClienteRuc(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  className="mt-1 w-full rounded-lg border p-3 text-black"
                  placeholder="RUC de 11 dígitos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black">
                  Dirección
                </label>

                <input
                  type="text"
                  value={nuevoClienteDireccion}
                  onChange={(e) =>
                    setNuevoClienteDireccion(
                      e.target.value
                    )
                  }
                  className="mt-1 w-full rounded-lg border p-3 text-black"
                  placeholder="Dirección (opcional)"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setMostrarModalCliente(false)
                }
                className="rounded-lg border border-black px-5 py-3 text-black"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={registrarCliente}
                disabled={registrandoCliente}
                className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
              >
                {registrandoCliente
                  ? "Registrando..."
                  : "Registrar cliente"}
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalProducto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-black">
              Nuevo producto
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-black">
                  Nombre
                </label>

                <input
                  type="text"
                  value={nuevoProductoNombre}
                  onChange={(e) =>
                    setNuevoProductoNombre(e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border p-3 text-black"
                  placeholder="Nombre del producto"
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
                  value={nuevoProductoPrecio}
                  onChange={(e) =>
                    setNuevoProductoPrecio(e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border p-3 text-black"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setMostrarModalProducto(false)
                }
                className="rounded-lg border border-black px-5 py-3 text-black"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={registrarProducto}
                disabled={registrandoProducto}
                className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
              >
                {registrandoProducto
                  ? "Registrando..."
                  : "Registrar producto"}
              </button>
            </div>
          </div>        
        </div>
      )}
      {mostrarModalImpresion && ventaRegistrada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] overflow-y-auto rounded-lg bg-white p-4">
            <ComprobantePreview venta={ventaRegistrada} />

            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg bg-black px-6 py-3 font-semibold text-white"
              >
                Imprimir
              </button>

              <button
                type="button"
                onClick={() => setMostrarModalImpresion(false)}
                className="rounded-lg border border-gray-300 px-6 py-3 font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}