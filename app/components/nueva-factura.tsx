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

  const [consultandoRuc, setConsultandoRuc] = useState(false);

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

  async function consultarRuc() {
    if (consultandoRuc) return;

    const ruc = nuevoClienteRuc.trim();

    if (!/^\d{11}$/.test(ruc)) {
      alert("El RUC debe tener 11 dígitos");
      return;
    }

    setConsultandoRuc(true);

    try {
      const response = await fetch(`/api/consultas/ruc?ruc=${ruc}`);
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "No se pudo consultar el RUC");
        return;
      }

      setNuevoClienteRazonSocial(data.data.razon_social || "");
      setNuevoClienteDireccion(data.data.direccion_fiscal || "");
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al consultar el RUC");
    } finally {
      setConsultandoRuc(false);
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
    <main className="min-h-screen bg-black px-5 py-8 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600">
              Ventas
            </span>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Nueva factura electrónica
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                Registra una venta con RUC y emite el comprobante electrónico.
              </p>
            </div>

            <div className="hidden rounded-xl border border-white/[0.07] bg-white/[0.035] px-4 py-3 md:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-600">
                Total
              </p>

              <p className="mt-1 text-xl font-bold text-white">
                S/ {total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
                    Paso 01
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-white">
                    Cliente
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setMostrarModalCliente(true)}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-gray-200 transition hover:border-white/[0.15] hover:bg-white/[0.07]"
                >
                  + Nuevo cliente
                </button>
              </div>

              <div className="relative">
                <div className="relative">
                  <svg
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
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
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-red-400/40 focus:bg-white/[0.055]"
                    placeholder="Buscar cliente por RUC o razón social..."
                  />
                </div>

                {busquedaCliente && clientesFiltrados.length > 0 && (
                  <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111111] shadow-2xl">
                    {clientesFiltrados.map((cliente) => (
                      <button
                        key={cliente.id}
                        type="button"
                        onClick={() => {
                          setClienteSeleccionado(cliente);
                          setBusquedaCliente("");
                        }}
                        className="block w-full border-b border-white/[0.06] p-4 text-left transition last:border-b-0 hover:bg-white/[0.05]"
                      >
                        <div className="text-sm font-semibold text-white">
                          {cliente.nombre}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          RUC: {cliente.ruc}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {clienteSeleccionado && (
                <div className="mt-4 rounded-xl border border-red-400/10 bg-red-400/[0.04] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-400">
                        Cliente seleccionado
                      </p>

                      <div className="mt-3 space-y-2">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.12em] text-gray-600">
                            RUC
                          </p>

                          <p className="mt-0.5 text-sm font-semibold text-white">
                            {clienteSeleccionado.ruc}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-[0.12em] text-gray-600">
                            Razón social
                          </p>

                          <p className="mt-0.5 text-sm font-semibold text-white">
                            {clienteSeleccionado.nombre}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-[0.12em] text-gray-600">
                            Dirección
                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">
                            {clienteSeleccionado.direccion || "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setClienteSeleccionado(null)}
                      className="text-xs font-medium text-gray-600 transition hover:text-white"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
                    Paso 02
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-white">
                    Productos
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setMostrarModalProducto(true)}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-gray-200 transition hover:border-white/[0.15] hover:bg-white/[0.07]"
                >
                  + Nuevo producto
                </button>
              </div>

              <div className="relative">
                <div className="relative">
                  <svg
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>

                  <input
                    type="text"
                    value={busquedaProducto}
                    onChange={(e) =>
                      setBusquedaProducto(e.target.value)
                    }
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-400/40 focus:bg-white/[0.055]"
                    placeholder="Buscar producto..."
                  />
                </div>

                {busquedaProducto &&
                  productosFiltrados.length > 0 && (
                    <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111111] shadow-2xl">
                      {productosFiltrados.map((producto) => (
                        <button
                          key={producto.id}
                          type="button"
                          onClick={() =>
                            agregarProducto(producto)
                          }
                          className="flex w-full items-center justify-between border-b border-white/[0.06] p-4 text-left transition last:border-b-0 hover:bg-white/[0.05]"
                        >
                          <span className="text-sm font-medium text-white">
                            {producto.nombre}
                          </span>

                          <span className="text-xs text-gray-500">
                            S/{" "}
                            {Number(producto.precioBase).toFixed(2)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
              </div>

              {productos.length > 0 ? (
                <div className="mt-6 overflow-hidden rounded-xl border border-white/[0.06]">
                  <div className="hidden grid-cols-[1fr_100px_130px_120px_70px] border-b border-white/[0.06] bg-white/[0.025] text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 md:grid">
                    <div className="p-4">Producto</div>
                    <div className="p-4">Cantidad</div>
                    <div className="p-4">Precio</div>
                    <div className="p-4">Subtotal</div>
                    <div className="p-4"></div>
                  </div>

                  <div>
                    {productos.map((producto) => (
                      <div
                        key={producto.id}
                        className="border-b border-white/[0.06] p-4 last:border-b-0 md:grid md:grid-cols-[1fr_100px_130px_120px_70px] md:items-center md:p-0"
                      >
                        <div className="mb-4 md:mb-0 md:p-4">
                          <p className="text-sm font-semibold text-white">
                            {producto.nombre}
                          </p>

                          <p className="mt-1 text-xs text-gray-600">
                            Producto #{producto.id}
                          </p>
                        </div>

                        <div className="mb-4 flex items-center justify-between md:mb-0 md:block md:p-4">
                          <span className="text-xs text-gray-600 md:hidden">
                            Cantidad
                          </span>

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
                            className="w-20 rounded-lg border border-white/[0.08] bg-white/[0.04] p-2.5 text-sm text-white outline-none focus:border-blue-400/40"
                          />
                        </div>

                        <div className="mb-4 flex items-center justify-between md:mb-0 md:block md:p-4">
                          <span className="text-xs text-gray-600 md:hidden">
                            Precio
                          </span>

                          <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                              S/
                            </span>

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
                              className="w-28 rounded-lg border border-white/[0.08] bg-white/[0.04] py-2.5 pl-8 pr-2 text-sm text-white outline-none focus:border-blue-400/40"
                            />
                          </div>
                        </div>

                        <div className="mb-4 flex items-center justify-between md:mb-0 md:block md:p-4">
                          <span className="text-xs text-gray-600 md:hidden">
                            Subtotal
                          </span>

                          <span className="text-sm font-semibold text-white">
                            S/{" "}
                            {(
                              Number(producto.cantidad) *
                              Number(producto.precio)
                            ).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex justify-end md:block md:p-4">
                          <button
                            type="button"
                            onClick={() =>
                              eliminarProducto(producto.id)
                            }
                            className="text-xs font-medium text-red-400/70 transition hover:text-red-400"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-dashed border-white/[0.08] px-6 py-12 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04]">
                    <svg
                      className="h-5 w-5 text-gray-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M6 7h12l1 13H5L6 7Z" />
                      <path d="M9 7a3 3 0 0 1 6 0" />
                    </svg>
                  </div>

                  <p className="mt-3 text-sm font-medium text-gray-500">
                    No hay productos agregados
                  </p>

                  <p className="mt-1 text-xs text-gray-700">
                    Busca un producto arriba para comenzar.
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5 md:p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400">
                  Paso 03
                </p>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Método de pago
                </h2>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                    className={`rounded-xl border px-4 py-3.5 text-sm font-semibold transition ${
                      metodoPago === valor
                        ? "border-green-400/30 bg-green-400/10 text-green-300"
                        : "border-white/[0.07] bg-white/[0.025] text-gray-400 hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    {texto}
                  </button>
                ))}
              </div>

              {metodoPago === "EFECTIVO" && (
                <div className="mt-5 grid gap-5 rounded-xl border border-white/[0.06] bg-white/[0.025] p-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-gray-600">
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
                        className="w-full rounded-xl border border-white/[0.08] bg-black/30 py-3.5 pl-11 pr-4 text-sm text-white outline-none focus:border-green-400/40"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-center sm:border-l sm:border-white/[0.06] sm:pl-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-600">
                      Vuelto
                    </p>

                    <p
                      className={`mt-1 text-2xl font-bold ${
                        vuelto >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      S/ {vuelto.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.045]">
              <div className="h-1 bg-red-400" />

              <div className="p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
                  Resumen de factura
                </p>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-gray-500">Cliente</span>

                    <span className="max-w-[180px] truncate text-right text-gray-300">
                      {clienteSeleccionado
                        ? clienteSeleccionado.nombre
                        : "No seleccionado"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">RUC</span>

                    <span className="text-gray-300">
                      {clienteSeleccionado?.ruc || "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Productos</span>

                    <span className="text-gray-300">
                      {productos.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Pago</span>

                    <span className="text-gray-300">
                      {metodoPago || "No seleccionado"}
                    </span>
                  </div>
                </div>

                <div className="my-6 border-t border-white/[0.07]" />

                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-600">
                  Total a pagar
                </p>

                <p className="mt-1 text-4xl font-bold tracking-tight text-white">
                  S/ {total.toFixed(2)}
                </p>

                <button
                  type="button"
                  onClick={validarFactura}
                  disabled={procesandoFactura}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-400 px-5 py-3.5 text-sm font-bold text-black transition hover:bg-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {procesandoFactura
                    ? "Procesando..."
                    : "Emitir Factura"}

                  {!procesandoFactura && (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  )}
                </button>

                <p className="mt-3 text-center text-[11px] leading-5 text-gray-700">
                  Verifica los datos antes de emitir el comprobante.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {mostrarModalCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111111] shadow-2xl">
            <div className="h-1 bg-red-400" />

            <div className="p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
                  Clientes
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  Nuevo cliente
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  Registra los datos fiscales del cliente.
                </p>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-gray-600">
                    RUC *
                  </label>

                  <div className="mt-2 flex gap-2">
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
                      className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3.5 text-sm text-white outline-none placeholder:text-gray-700 focus:border-red-400/40"
                      placeholder="RUC de 11 dígitos"
                    />

                    <button
                      type="button"
                      onClick={consultarRuc}
                      disabled={consultandoRuc}
                      className="rounded-xl bg-white/[0.08] px-4 py-3 text-xs font-bold text-white transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {consultandoRuc
                        ? "Consultando..."
                        : "Consultar"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-gray-600">
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
                    className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] p-3.5 text-sm text-white outline-none placeholder:text-gray-700 focus:border-red-400/40"
                    placeholder="Razón social"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-gray-600">
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
                    className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] p-3.5 text-sm text-white outline-none placeholder:text-gray-700 focus:border-red-400/40"
                    placeholder="Dirección (opcional)"
                  />
                </div>
              </div>

              <div className="mt-7 flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setMostrarModalCliente(false)
                  }
                  className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-sm font-semibold text-gray-400 transition hover:bg-white/[0.06] hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={registrarCliente}
                  disabled={registrandoCliente}
                  className="flex-1 rounded-xl bg-red-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {registrandoCliente
                    ? "Registrando..."
                    : "Registrar cliente"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarModalProducto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111111] shadow-2xl">
            <div className="h-1 bg-blue-400" />

            <div className="p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
                  Catálogo
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  Nuevo producto
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  Registra el producto y agrégalo directamente a la venta.
                </p>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-gray-600">
                    Nombre
                  </label>

                  <input
                    type="text"
                    value={nuevoProductoNombre}
                    onChange={(e) =>
                      setNuevoProductoNombre(e.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] p-3.5 text-sm text-white outline-none placeholder:text-gray-700 focus:border-blue-400/40"
                    placeholder="Nombre del producto"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-gray-600">
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
                        setNuevoProductoPrecio(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-700 focus:border-blue-400/40"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-7 flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setMostrarModalProducto(false)
                  }
                  className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-sm font-semibold text-gray-400 transition hover:bg-white/[0.06] hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={registrarProducto}
                  disabled={registrandoProducto}
                  className="flex-1 rounded-xl bg-blue-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {registrandoProducto
                    ? "Registrando..."
                    : "Registrar producto"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarModalImpresion && ventaRegistrada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] max-w-xl overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#111111] p-5 shadow-2xl md:p-6">
            <div className="mb-5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
                Comprobante emitido
              </p>

              <h2 className="mt-1 text-xl font-bold text-white">
                Vista previa de la factura
              </h2>

              <p className="mt-2 text-sm font-semibold text-green-400">
                ✓ Factura registrada correctamente
              </p>
            </div>

            <div className="rounded-xl bg-neutral-100 p-4">
              <ComprobantePreview venta={ventaRegistrada} />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setMostrarModalImpresion(false)}
                className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-3 text-sm font-semibold text-gray-400 transition hover:bg-white/[0.07] hover:text-white"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 rounded-xl bg-red-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-red-300"
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