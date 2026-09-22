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
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">
          Nueva nota de venta
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
                placeholder="Buscar cliente por nombre, DNI o RUC..."
              />

              <button
                type="button"
                onClick={() => setMostrarModalCliente(true)}
                className="whitespace-nowrap rounded-lg border px-5 py-3"
              >
                Nuevo cliente
              </button>
            </div>

            {busquedaCliente &&
              clientesFiltrados.length > 0 && (
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

          {clienteSeleccionado && (
            <div className="mt-4 rounded-lg border p-4">
              <p>
                <span className="font-semibold">
                  Cliente:
                </span>{" "}
                {clienteSeleccionado.nombre}
              </p>

              {clienteSeleccionado.dni && (
                <p>
                  <span className="font-semibold">
                    DNI:
                  </span>{" "}
                  {clienteSeleccionado.dni}
                </p>
              )}

              {clienteSeleccionado.ruc && (
                <p>
                  <span className="font-semibold">
                    RUC:
                  </span>{" "}
                  {clienteSeleccionado.ruc}
                </p>
              )}

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
                onClick={() =>
                  setMostrarModalProducto(true)
                }
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
                    <th className="p-3">
                      Producto
                    </th>
                    <th className="p-3">
                      Cantidad
                    </th>
                    <th className="p-3">
                      Precio
                    </th>
                    <th className="p-3">
                      Subtotal
                    </th>
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
                            eliminarProducto(
                              producto.id
                            )
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
                  setMetodoPago(
                    valor as MetodoPago
                  )
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
            className="rounded-lg border border-white bg-black px-8 py-4 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            onClick={validarVenta}
            disabled={procesandoVenta}
          >
            {procesandoVenta
              ? "Registrando..."
              : "Emitir Comprobante"}
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
                  Tipo de documento
                </label>

                <select
                  value={nuevoClienteTipoDocumento}
                  onChange={(e) => {
                    const tipo =
                      e.target.value as
                        | "DNI"
                        | "RUC";

                    setNuevoClienteTipoDocumento(
                      tipo
                    );

                    setNuevoClienteNumeroDocumento(
                      ""
                    );
                  }}
                  className="mt-1 w-full rounded-lg border p-3 text-black"
                >
                  <option value="DNI">
                    DNI
                  </option>

                  <option value="RUC">
                    RUC
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black">
                  {nuevoClienteTipoDocumento}
                </label>

                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={
                      nuevoClienteTipoDocumento ===
                      "DNI"
                        ? 8
                        : 11
                    }
                    value={
                      nuevoClienteNumeroDocumento
                    }
                    onChange={(e) =>
                      setNuevoClienteNumeroDocumento(
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    className="w-full rounded-lg border p-3 text-black"
                    placeholder={
                      nuevoClienteTipoDocumento ===
                      "DNI"
                        ? "DNI de 8 dígitos"
                        : "RUC de 11 dígitos"
                    }
                  />

                  {/* NUEVO: BOTÓN CONSULTAR */}

                  <button
                    type="button"
                    onClick={consultarDocumento}
                    disabled={consultandoDocumento}
                    className="whitespace-nowrap rounded-lg bg-black px-4 py-3 text-sm text-white disabled:opacity-50"
                  >
                    {consultandoDocumento
                      ? "Consultando..."
                      : `Consultar ${nuevoClienteTipoDocumento}`}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black">
                  Nombre / Razón Social
                </label>

                <input
                  type="text"
                  value={nuevoClienteNombre}
                  onChange={(e) =>
                    setNuevoClienteNombre(
                      e.target.value
                    )
                  }
                  className="mt-1 w-full rounded-lg border p-3 text-black"
                  placeholder="Nombre o razón social"
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
                    setNuevoProductoNombre(
                      e.target.value
                    )
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
                    setNuevoProductoPrecio(
                      e.target.value
                    )
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

      {mostrarModalImpresion && ventaEmitida && (
        <div className="modal-impresion fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] overflow-auto rounded-lg bg-neutral-100 p-6 shadow-xl">
            <h2 className="mb-4 text-center text-xl font-bold text-black">
              Vista previa del comprobante
            </h2>

            {ventaRegistrada && (
              <p className="mb-4 text-center font-semibold text-green-700">
                ✓ Venta registrada correctamente
              </p>
            )}

            <ComprobantePreview
              venta={ventaEmitida}
            />

            <div className="botones-impresion mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={limpiarVenta}
                className="rounded-lg border border-black px-5 py-3 text-black"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg bg-black px-5 py-3 text-white"
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