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

export default function NotaVenta() {
  const [busquedaProducto, setBusquedaProducto] = useState("");

  const [productos, setProductos] = useState<ProductoVenta[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>(
    []
  );

  const [metodoPago, setMetodoPago] = useState<MetodoPago>("");
  const [montoRecibido, setMontoRecibido] = useState("");

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Cliente | null>(null);

  const [ventaEmitida, setVentaEmitida] = useState<any>(null);
  const [mostrarModalImpresion, setMostrarModalImpresion] = useState(false);

  const [procesandoVenta, setProcesandoVenta] = useState(false);
  const [ventaRegistrada, setVentaRegistrada] = useState(false);

  const [mostrarModalCliente, setMostrarModalCliente] = useState(false);

  const [nuevoClienteNombre, setNuevoClienteNombre] = useState("");
  const [nuevoClienteTipoDocumento, setNuevoClienteTipoDocumento] =
    useState<"DNI" | "RUC">("DNI");
  const [nuevoClienteNumeroDocumento, setNuevoClienteNumeroDocumento] =
    useState("");
  const [nuevoClienteDireccion, setNuevoClienteDireccion] = useState("");

  const [registrandoCliente, setRegistrandoCliente] = useState(false);

  const [consultandoDocumento, setConsultandoDocumento] = useState(false);

  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);

  const [nuevoProductoNombre, setNuevoProductoNombre] = useState("");
  const [nuevoProductoPrecio, setNuevoProductoPrecio] = useState("");

  const [registrandoProducto, setRegistrandoProducto] = useState(false);

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

        setClientes(dataClientes);
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

  async function consultarDocumento() {
    if (consultandoDocumento) return;

    const documento = nuevoClienteNumeroDocumento.trim();

    if (nuevoClienteTipoDocumento === "DNI") {
      if (!/^\d{8}$/.test(documento)) {
        alert("El DNI debe tener 8 dígitos");
        return;
      }
    }

    if (nuevoClienteTipoDocumento === "RUC") {
      if (!/^\d{11}$/.test(documento)) {
        alert("El RUC debe tener 11 dígitos");
        return;
      }
    }

    setConsultandoDocumento(true);

    try {
      const endpoint =
        nuevoClienteTipoDocumento === "DNI"
          ? `/api/consultas/dni?dni=${documento}`
          : `/api/consultas/ruc?ruc=${documento}`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(
          data.error ||
            data.message ||
            `No se pudo consultar el ${nuevoClienteTipoDocumento}`
        );
        return;
      }

      if (nuevoClienteTipoDocumento === "DNI") {
        const persona = data.data;

        const nombreCompleto = [
          persona.nombres,
          persona.apellido_paterno,
          persona.apellido_materno,
        ]
          .filter(Boolean)
          .join(" ");

        setNuevoClienteNombre(nombreCompleto);
        setNuevoClienteDireccion("");
      }

      if (nuevoClienteTipoDocumento === "RUC") {
        const empresa = data.data;

        setNuevoClienteNombre(
          empresa.razon_social || ""
        );

        setNuevoClienteDireccion(
          empresa.direccion_fiscal || ""
        );
      }
    } catch (error) {
      console.error(error);
      alert(
        `Ocurrió un error al consultar el ${nuevoClienteTipoDocumento}`
      );
    } finally {
      setConsultandoDocumento(false);
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

  async function registrarCliente() {
    if (registrandoCliente) return;

    const nombre = nuevoClienteNombre.trim();
    const documento = nuevoClienteNumeroDocumento.trim();

    if (!nombre) {
      alert("Debes ingresar el nombre o razón social");
      return;
    }

    if (!documento) {
      alert(`Debes ingresar el ${nuevoClienteTipoDocumento}`);
      return;
    }

    if (
      nuevoClienteTipoDocumento === "DNI" &&
      !/^\d{8}$/.test(documento)
    ) {
      alert("El DNI debe tener 8 dígitos");
      return;
    }

    if (
      nuevoClienteTipoDocumento === "RUC" &&
      !/^\d{11}$/.test(documento)
    ) {
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
          nombre,

          dni:
            nuevoClienteTipoDocumento === "DNI"
              ? documento
              : null,

          ruc:
            nuevoClienteTipoDocumento === "RUC"
              ? documento
              : null,

          direccion:
            nuevoClienteDireccion.trim() || null,
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

      setNuevoClienteNombre("");
      setNuevoClienteTipoDocumento("DNI");
      setNuevoClienteNumeroDocumento("");
      setNuevoClienteDireccion("");

      setMostrarModalCliente(false);
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al registrar el cliente");
    } finally {
      setRegistrandoCliente(false);
    }
  }

  async function validarVenta() {
    if (procesandoVenta) return;

    if (!clienteSeleccionado) {
      alert("Debes seleccionar un cliente");
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

    setProcesandoVenta(true);

    try {
      const venta = {
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
      };

      const response = await fetch("/api/ventas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(venta),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }

      setVentaEmitida(data);
      setVentaRegistrada(true);
      setMostrarModalImpresion(true);

      console.log("RESPUESTA:", data);
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al registrar la venta");
    } finally {
      setProcesandoVenta(false);
    }
  }

  function limpiarVenta() {
    setProductos([]);
    setBusquedaProducto("");
    setClienteSeleccionado(null);
    setBusquedaCliente("");
    setMetodoPago("");
    setMontoRecibido("");
    setVentaEmitida(null);
    setMostrarModalImpresion(false);
    setVentaRegistrada(false);
  }

  const productosFiltrados = productosDisponibles.filter(
    (producto) =>
      producto.nombre
        .toLowerCase()
        .includes(busquedaProducto.toLowerCase())
  );

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      `${cliente.nombre} ${cliente.dni ?? ""} ${cliente.ruc ?? ""}`
        .toLowerCase()
        .includes(busquedaCliente.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-black px-5 py-8 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400" />

            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600">
              Ventas
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Nueva nota de venta
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Registra una nueva venta seleccionando el cliente,
            productos y método de pago.
          </p>
        </div>

        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5 md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10 text-blue-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.6}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19a6 6 0 00-12 0m6-8a4 4 0 100-8 4 4 0 000 8zm5-4h4m-2-2v4"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-base font-bold text-white">
                Cliente
              </h2>

              <p className="text-xs text-gray-600">
                Selecciona el cliente de la venta.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.7}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>

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
                  className="w-full rounded-xl border border-white/[0.08] bg-black py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-700 focus:border-blue-400/40"
                  placeholder="Buscar cliente por nombre, DNI o RUC..."
                />
              </div>

              <button
                type="button"
                onClick={() => setMostrarModalCliente(true)}
                className="rounded-xl border border-blue-400/20 bg-blue-400/10 px-5 py-3 text-xs font-bold text-blue-400 transition hover:bg-blue-400/15"
              >
                + Nuevo cliente
              </button>
            </div>

            {busquedaCliente &&
              clientesFiltrados.length > 0 && (
                <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111111] shadow-2xl">
                  {clientesFiltrados.map((cliente) => (
                    <button
                      key={cliente.id}
                      type="button"
                      onClick={() => {
                        setClienteSeleccionado(cliente);
                        setBusquedaCliente("");
                      }}
                      className="block w-full border-b border-white/[0.06] p-4 text-left transition last:border-0 hover:bg-white/[0.04]"
                    >
                      <div className="text-sm font-semibold text-white">
                        {cliente.nombre}
                      </div>

                      <div className="mt-1 flex gap-4 text-xs text-gray-500">
                        {cliente.dni && (
                          <span>DNI: {cliente.dni}</span>
                        )}

                        {cliente.ruc && (
                          <span>RUC: {cliente.ruc}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
          </div>

          {clienteSeleccionado && (
            <div className="mt-4 rounded-xl border border-blue-400/15 bg-blue-400/[0.04] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    Cliente seleccionado
                  </p>

                  <p className="mt-1 text-sm font-bold text-white">
                    {clienteSeleccionado.nombre}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setClienteSeleccionado(null);
                    setBusquedaCliente("");
                  }}
                  className="text-xs font-semibold text-gray-600 transition hover:text-white"
                >
                  Cambiar
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                {clienteSeleccionado.dni && (
                  <div>
                    <p className="text-gray-600">DNI</p>
                    <p className="mt-1 font-semibold text-gray-300">
                      {clienteSeleccionado.dni}
                    </p>
                  </div>
                )}

                {clienteSeleccionado.ruc && (
                  <div>
                    <p className="text-gray-600">RUC</p>
                    <p className="mt-1 font-semibold text-gray-300">
                      {clienteSeleccionado.ruc}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-gray-600">Dirección</p>
                  <p className="mt-1 truncate font-semibold text-gray-300">
                    {clienteSeleccionado.direccion || "-"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5 md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-400/10 text-green-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.6}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 7.5L12 3 4 7.5m16 0L12 12 4 7.5m16 0V16.5L12 21l-8-4.5V7.5M12 12v9"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-base font-bold text-white">
                Productos
              </h2>

              <p className="text-xs text-gray-600">
                Agrega los productos que forman parte de la venta.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.7}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>

                <input
                  type="text"
                  value={busquedaProducto}
                  onChange={(e) =>
                    setBusquedaProducto(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-black py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-700 focus:border-green-400/40"
                  placeholder="Buscar producto..."
                />
              </div>

              <button
                type="button"
                onClick={() => setMostrarModalProducto(true)}
                className="rounded-xl border border-green-400/20 bg-green-400/10 px-5 py-3 text-xs font-bold text-green-400 transition hover:bg-green-400/15"
              >
                + Nuevo producto
              </button>
            </div>

            {busquedaProducto &&
              productosFiltrados.length > 0 && (
                <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111111] shadow-2xl">
                  {productosFiltrados.map((producto) => (
                    <button
                      key={producto.id}
                      type="button"
                      onClick={() => agregarProducto(producto)}
                      className="block w-full border-b border-white/[0.06] p-4 text-left text-sm font-medium text-gray-300 transition last:border-0 hover:bg-white/[0.04] hover:text-white"
                    >
                      {producto.nombre}
                    </button>
                  ))}
                </div>
              )}
          </div>

          {productos.length > 0 ? (
            <div className="mt-6 overflow-hidden rounded-xl border border-white/[0.06]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02] text-left">
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                        Producto
                      </th>

                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                        Cantidad
                      </th>

                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                        Precio
                      </th>

                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                        Subtotal
                      </th>

                      <th className="px-4 py-3" />
                    </tr>
                  </thead>

                  <tbody>
                    {productos.map((producto) => (
                      <tr
                        key={producto.id}
                        className="border-b border-white/[0.05] transition last:border-0 hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-white">
                            {producto.nombre}
                          </p>
                        </td>

                        <td className="px-4 py-4">
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
                                        cantidad,
                                      }
                                    : item
                                )
                              );
                            }}
                            className="w-20 rounded-lg border border-white/[0.08] bg-black px-3 py-2 text-sm text-white outline-none focus:border-green-400/40"
                          />
                        </td>

                        <td className="px-4 py-4">
                          <div className="relative w-28">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                              S/
                            </span>

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
                                          precio: valor,
                                        }
                                      : item
                                  )
                                );
                              }}
                              className="w-full rounded-lg border border-white/[0.08] bg-black py-2 pl-9 pr-2 text-sm text-white outline-none focus:border-green-400/40"
                            />
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-white">
                            S/{" "}
                            {(
                              Number(producto.cantidad) *
                              Number(producto.precio)
                            ).toFixed(2)}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              eliminarProducto(producto.id)
                            }
                            className="rounded-lg px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-400/10"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-white/[0.08] bg-black/30 py-12 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>

              <p className="text-sm font-semibold text-gray-500">
                No hay productos agregados
              </p>

              <p className="mt-1 text-xs text-gray-700">
                Busca un producto arriba para agregarlo a la venta.
              </p>
            </div>
          )}
        </section>

        <section className="mt-5 flex justify-end">
          <div className="w-full rounded-2xl border border-green-400/10 bg-green-400/[0.035] p-6 sm:w-auto sm:min-w-[300px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
              Total de venta
            </p>

            <p className="mt-2 text-right text-4xl font-bold tracking-tight text-white">
              S/ {total.toFixed(2)}
            </p>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5 md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-400/10 text-purple-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.6}
              >
                <rect
                  width="18"
                  height="14"
                  x="3"
                  y="5"
                  rx="2"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h18"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-base font-bold text-white">
                Método de pago
              </h2>

              <p className="text-xs text-gray-600">
                Selecciona cómo realizará el pago el cliente.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
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
                className={`rounded-xl border px-4 py-3 text-xs font-bold transition ${
                  metodoPago === valor
                    ? "border-purple-400/30 bg-purple-400/10 text-purple-400"
                    : "border-white/[0.08] bg-white/[0.025] text-gray-500 hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-gray-300"
                }`}
              >
                {texto}
              </button>
            ))}
          </div>

          {metodoPago === "EFECTIVO" && (
            <div className="mt-6 max-w-sm rounded-xl border border-white/[0.06] bg-black/30 p-4">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                Monto recibido
              </label>

              <div className="relative mt-2">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-600">
                  S/
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={montoRecibido}
                  onChange={(e) =>
                    setMontoRecibido(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-black py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-400/40"
                  placeholder="0.00"
                />
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
                <span className="text-sm text-gray-500">
                  Vuelto
                </span>

                <span
                  className={`text-xl font-bold ${
                    vuelto >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  S/ {vuelto.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </section>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={validarVenta}
            disabled={procesandoVenta}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-8 py-4 text-sm font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {procesandoVenta ? "Registrando..." : "Emitir comprobante"}

            {!procesandoVenta && (
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
                  d="M5 12h14m-5-5 5 5-5 5"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mostrarModalCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-auto rounded-2xl border border-white/[0.08] bg-[#111111] p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-400" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
                    Clientes
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white">
                  Nuevo cliente
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setMostrarModalCliente(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-gray-500 transition hover:bg-white/[0.07] hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                  Tipo de documento
                </label>

                <select
                  value={nuevoClienteTipoDocumento}
                  onChange={(e) => {
                    const tipo =
                      e.target.value as "DNI" | "RUC";

                    setNuevoClienteTipoDocumento(tipo);
                    setNuevoClienteNumeroDocumento("");
                  }}
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-black p-3 text-sm text-white outline-none focus:border-blue-400/40"
                >
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                  {nuevoClienteTipoDocumento}
                </label>

                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={
                      nuevoClienteTipoDocumento === "DNI"
                        ? 8
                        : 11
                    }
                    value={nuevoClienteNumeroDocumento}
                    onChange={(e) =>
                      setNuevoClienteNumeroDocumento(
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-black p-3 text-sm text-white outline-none focus:border-blue-400/40"
                    placeholder={
                      nuevoClienteTipoDocumento === "DNI"
                        ? "DNI de 8 dígitos"
                        : "RUC de 11 dígitos"
                    }
                  />

                  <button
                    type="button"
                    onClick={consultarDocumento}
                    disabled={consultandoDocumento}
                    className="whitespace-nowrap rounded-xl bg-blue-500 px-4 py-3 text-xs font-bold text-white transition hover:bg-blue-400 disabled:opacity-50"
                  >
                    {consultandoDocumento
                      ? "Consultando..."
                      : `Consultar ${nuevoClienteTipoDocumento}`}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                  Nombre / Razón Social
                </label>

                <input
                  type="text"
                  value={nuevoClienteNombre}
                  onChange={(e) =>
                    setNuevoClienteNombre(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-black p-3 text-sm text-white outline-none focus:border-blue-400/40"
                  placeholder="Nombre o razón social"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                  Dirección
                </label>

                <input
                  type="text"
                  value={nuevoClienteDireccion}
                  onChange={(e) =>
                    setNuevoClienteDireccion(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-black p-3 text-sm text-white outline-none focus:border-blue-400/40"
                  placeholder="Dirección (opcional)"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setMostrarModalCliente(false)}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-xs font-bold text-gray-400 transition hover:bg-white/[0.07] hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={registrarCliente}
                disabled={registrandoCliente}
                className="rounded-xl bg-blue-500 px-5 py-3 text-xs font-bold text-white transition hover:bg-blue-400 disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#111111] p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
                    Productos
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white">
                  Nuevo producto
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setMostrarModalProducto(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-gray-500 transition hover:bg-white/[0.07] hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                  Nombre
                </label>

                <input
                  type="text"
                  value={nuevoProductoNombre}
                  onChange={(e) =>
                    setNuevoProductoNombre(e.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-black p-3 text-sm text-white outline-none focus:border-green-400/40"
                  placeholder="Nombre del producto"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                  Precio base
                </label>

                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-600">
                    S/
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={nuevoProductoPrecio}
                    onChange={(e) =>
                      setNuevoProductoPrecio(e.target.value)
                    }
                    className="w-full rounded-xl border border-white/[0.08] bg-black py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-green-400/40"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setMostrarModalProducto(false)}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-xs font-bold text-gray-400 transition hover:bg-white/[0.07] hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={registrarProducto}
                disabled={registrandoProducto}
                className="rounded-xl bg-green-500 px-5 py-3 text-xs font-bold text-black transition hover:bg-green-400 disabled:opacity-50"
              >
                {registrandoProducto
                  ? "Registrando..."
                  : "Registrar producto"}
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalImpresion && ventaEmitida && (
        <div className="modal-impresion fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] overflow-auto rounded-2xl border border-white/[0.08] bg-neutral-100 p-6 shadow-2xl">
            <div className="mb-5 text-center">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-700">
                ✓
              </div>

              <h2 className="text-xl font-bold text-black">
                Vista previa del comprobante
              </h2>

              {ventaRegistrada && (
                <p className="mt-2 text-sm font-semibold text-green-700">
                  Venta registrada correctamente
                </p>
              )}
            </div>

            <ComprobantePreview
              venta={ventaEmitida}
            />

            <div className="botones-impresion mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={limpiarVenta}
                className="rounded-xl border border-black/10 bg-white px-5 py-3 text-xs font-bold text-black transition hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl bg-black px-5 py-3 text-xs font-bold text-white transition hover:bg-neutral-800"
              >
                Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}