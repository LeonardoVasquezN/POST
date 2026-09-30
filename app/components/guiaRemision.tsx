"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Venta = {
  id: number;
  total: string | number;
  createdAt: string;

  cliente: {
    id: number;
    nombre: string;
    dni: string | null;
    ruc: string | null;
    direccion: string | null;
  } | null;

  documento: {
    tipo: string;
    serie: string;
    numero: number;
    estado: string;
  } | null;

  detalles: {
    id: number;
    cantidad: number;
    producto: {
      id: number;
      nombre: string;
    };
  }[];
};

type Transportista = {
  id: number;
  ruc: string;
  denominacion: string;
  numeroRegistroMTC: string;
  numeroAutorizacion: string;
  codigoEntidadAutorizadora: string;
};

function NuevaGuiaRemisionContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const ventaId = searchParams.get("ventaId");

  const [venta, setVenta] = useState<Venta | null>(null);
  const [transportistas, setTransportistas] = useState<Transportista[]>([]);

  const [modalidadTransporte, setModalidadTransporte] = useState("01");

  const [transportistaId, setTransportistaId] = useState("");
  const [fechaEntregaTransportista, setFechaEntregaTransportista] = useState("");

  const [fechaInicioTraslado, setFechaInicioTraslado] = useState("");
  const [placaVehiculo, setPlacaVehiculo] = useState("");
  const [conductorTipoDocumento, setConductorTipoDocumento] = useState("1");
  const [conductorNumeroDocumento, setConductorNumeroDocumento] = useState("");
  const [conductorNombres, setConductorNombres] = useState("");
  const [conductorApellidos, setConductorApellidos] = useState("");
  const [licenciaConducir, setLicenciaConducir] = useState("");

  const [motivoTraslado, setMotivoTraslado] = useState("01");

  const puntoPartidaUbigeo = "130101";
  const puntoPartidaDireccion = "TRUJILLO | DEPARTAMENTO LA LIBERTAD - CALLE SINCHI ROCA NR.803 INT A URB. CHICAGO TRUJILLO";

  const [puntoLlegadaUbigeo, setPuntoLlegadaUbigeo] = useState("");
  const [puntoLlegadaDireccion, setPuntoLlegadaDireccion] = useState("");

  const [pesoBrutoTotal, setPesoBrutoTotal] = useState("");
  const [numeroBultos, setNumeroBultos] = useState("");

  const [observaciones, setObservaciones] = useState("");

  const [cargando, setCargando] = useState(true);
  const [emitiendo, setEmitiendo] = useState(false);

  const [mostrarFormularioTransportista, setMostrarFormularioTransportista] = useState(false);
  const [ruc, setRuc] = useState("");
  const [denominacion, setDenominacion] = useState("");
  const [numeroRegistroMTC, setNumeroRegistroMTC] = useState("");
  const [numeroAutorizacion, setNumeroAutorizacion] = useState("");
  const [codigoEntidadAutorizadora, setCodigoEntidadAutorizadora] = useState("");
  const [registrandoTransportista, setRegistrandoTransportista] = useState(false);

  useEffect(() => {
    async function cargarDatos() {
      if (!ventaId) {
        alert("No se indicó una venta");
        setCargando(false);
        return;
      }

      try {
        const [ventaResponse, transportistasResponse] =
          await Promise.all([
            fetch(`/api/ventas/${ventaId}`),
            fetch("/api/transportistas"),
          ]);

        const ventaData = await ventaResponse.json();
        const transportistasData = await transportistasResponse.json();

        if (!ventaResponse.ok) {
          alert(ventaData.error);
          return;
        }

        if (!transportistasResponse.ok) {
          alert(transportistasData.error);
          return;
        }

        setVenta(ventaData);
        setTransportistas(transportistasData);
      } catch (error) {
        console.error(error);
        alert("Error al cargar los datos");
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, [ventaId]);

  function validarUbigeo(ubigeo: string, nombre: string) {
  if (!/^\d{6}$/.test(ubigeo)) {
    alert(
      `El ubigeo de ${nombre} debe tener exactamente 6 dígitos.`
    );
    return false;
  }

  return true;
}

function validarDireccion(direccion: string, nombre: string) {
    if (!direccion.trim()) {
      alert(`Ingresa la dirección de ${nombre}.`);
      return false;
    }

    if (direccion.trim().length < 5) {
      alert(`La dirección de ${nombre} es demasiado corta.`);
      return false;
    }

    return true;
  }

  function abrirFormularioTransportista() {
  setRuc("");
  setDenominacion("");
  setNumeroRegistroMTC("");
  setNumeroAutorizacion("");
  setCodigoEntidadAutorizadora("");

  setMostrarFormularioTransportista(true);
}

function cerrarFormularioTransportista() {
  if (registrandoTransportista) return;

  setMostrarFormularioTransportista(false);

  setRuc("");
  setDenominacion("");
  setNumeroRegistroMTC("");
  setNumeroAutorizacion("");
  setCodigoEntidadAutorizadora("");
}

  async function guardarTransportista() {
    if (registrandoTransportista) return;

    if (
      !ruc.trim() ||
      !denominacion.trim() ||
      !numeroRegistroMTC.trim() ||
      !numeroAutorizacion.trim() ||
      !codigoEntidadAutorizadora.trim()
    ) {
      alert("Completa todos los campos");
      return;
    }

    if (!/^\d{11}$/.test(ruc)) {
      alert("El RUC debe tener exactamente 11 dígitos");
      return;
    }

    setRegistrandoTransportista(true);

    try {
      const respuesta = await fetch("/api/transportistas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ruc: ruc.trim(),
          denominacion: denominacion.trim(),
          numeroRegistroMTC: numeroRegistroMTC.trim(),
          numeroAutorizacion: numeroAutorizacion.trim(),
          codigoEntidadAutorizadora:
            codigoEntidadAutorizadora.trim(),
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        alert(data.error || "No se pudo registrar el transportista");
        return;
      }

      const nuevoTransportista = data;

      setTransportistas((actuales) => [
        ...actuales,
        nuevoTransportista,
      ]);

      setTransportistaId(String(nuevoTransportista.id));

      cerrarFormularioTransportista();

      alert("Transportista registrado correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al registrar el transportista");
    } finally {
      setRegistrandoTransportista(false);
    }
  }

  async function emitirGuia() {
    if (!venta) {
      return;
    }

    const hoy = new Date();

    const fechaHoy = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate()
    );

    if (modalidadTransporte === "01") {
      if (!transportistaId) {
        alert("Selecciona un transportista");
        return;
      }

      if (!fechaEntregaTransportista) {
        alert("Selecciona la fecha de entrega al transportista");
        return;
      }

      const [año, mes, dia] = fechaEntregaTransportista.split("-").map(Number);

      const fechaEntrega = new Date(
        año,
        mes - 1,
        dia
      );

      if (fechaEntrega < fechaHoy) {
        alert(
          "La fecha de entrega al transportista no puede ser anterior a hoy."
        );
        return;
      }
    }

    if (modalidadTransporte === "02") {
      if (!fechaInicioTraslado) {
        alert("Selecciona la fecha de inicio del traslado");
        return;
      }

      const [año, mes, dia] = fechaInicioTraslado.split("-").map(Number);

      const fechaInicio = new Date(
        año,
        mes - 1,
        dia
      );

      if (fechaInicio < fechaHoy) {
        alert(
          "La fecha de inicio del traslado no puede ser anterior a hoy."
        );
        return;
      }

      if (!placaVehiculo.trim()) {
        alert("Ingresa la placa del vehículo.");
        return;
      }

      if (!conductorTipoDocumento.trim()) {
        alert("Selecciona el tipo de documento del conductor.");
        return;
      }

      if (!conductorNumeroDocumento.trim()) {
        alert("Ingresa el número de documento del conductor.");
        return;
      }

      if (!conductorNombres.trim()) {
        alert("Ingresa los nombres del conductor.");
        return;
      }

      if (!conductorApellidos.trim()) {
        alert("Ingresa los apellidos del conductor.");
        return;
      }

      if (!licenciaConducir.trim()) {
        alert("Ingresa la licencia de conducir.");
        return;
      }
    }

    if (!motivoTraslado) {
      alert("Selecciona el motivo del traslado.");
      return;
    }

    if (!venta.detalles || venta.detalles.length === 0) {
      alert(
        "La venta no tiene productos. No se puede emitir la guía."
      );
      return;
    }

    const partidaUbigeo = puntoPartidaUbigeo.trim();

    if (!partidaUbigeo) {
      alert("Ingresa el ubigeo del punto de partida.");
      return;
    }

    if (!validarUbigeo(partidaUbigeo, "punto de partida")) {
      return;
    }

    if (
      !validarDireccion(
        puntoPartidaDireccion,
        "punto de partida"
      )
    ) {
      return;
    }

    const llegadaUbigeo = puntoLlegadaUbigeo.trim();

    if (!llegadaUbigeo) {
      alert("Ingresa el ubigeo del punto de llegada.");
      return;
    }

    if (!validarUbigeo(llegadaUbigeo, "punto de llegada")) {
      return;
    }

    if (
      !validarDireccion(
        puntoLlegadaDireccion,
        "punto de llegada"
      )
    ) {
      return;
    }

    const peso = Number(pesoBrutoTotal);

    if (!pesoBrutoTotal.trim()) {
      alert("Ingresa el peso bruto total.");
      return;
    }

    if (!Number.isFinite(peso) || peso <= 0) {
      alert("El peso bruto total debe ser mayor que 0.");
      return;
    }

    const bultos = Number(numeroBultos);

    if (!numeroBultos.trim()) {
      alert("Ingresa el número de bultos.");
      return;
    }

    if (!Number.isInteger(bultos) || bultos <= 0) {
      alert(
        "El número de bultos debe ser un número entero mayor que 0."
      );
      return;
    }

    try {
      setEmitiendo(true);

      const response = await fetch("/api/guias-remision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ventaId: venta.id,

          modalidadTransporte,

          transportistaId:
            modalidadTransporte === "01"
              ? Number(transportistaId)
              : null,

          fechaEntregaTransportista:
            modalidadTransporte === "01"
              ? fechaEntregaTransportista
              : null,

          fechaInicioTraslado:
            modalidadTransporte === "02"
              ? fechaInicioTraslado
              : null,

          placaVehiculo:
            modalidadTransporte === "02"
              ? placaVehiculo.trim()
              : null,

          conductorTipoDocumento:
            modalidadTransporte === "02"
              ? conductorTipoDocumento
              : null,

          conductorNumeroDocumento:
            modalidadTransporte === "02"
              ? conductorNumeroDocumento.trim()
              : null,

          conductorNombres:
            modalidadTransporte === "02"
              ? conductorNombres.trim()
              : null,

          conductorApellidos:
            modalidadTransporte === "02"
              ? conductorApellidos.trim()
              : null,

          licenciaConducir:
            modalidadTransporte === "02"
              ? licenciaConducir.trim()
              : null,

          motivoTraslado,

          puntoPartidaUbigeo: partidaUbigeo,
          puntoPartidaDireccion: puntoPartidaDireccion.trim(),

          puntoLlegadaUbigeo: llegadaUbigeo,
          puntoLlegadaDireccion: puntoLlegadaDireccion.trim(),

          pesoBrutoTotal: peso,
          numeroBultos: bultos,
          observaciones: observaciones.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "No se pudo emitir la guía"
        );
        return;
      }

      alert(
        "Guía de remisión emitida correctamente"
      );

      router.push(
        `/gestion/guias-remision/${data.guiaRemision.id}`
      );
    } catch (error) {
      console.error(error);
      alert(
        "Error al emitir la guía de remisión"
      );
    } finally {
      setEmitiendo(false);
    }
  }

  if (cargando) {
    return (
      <main className="min-h-screen p-8">
        <p>Cargando datos...</p>
      </main>
    );
  }

  if (!venta) {
    return (
      <main className="min-h-screen p-8">
        <p>No se pudo cargar la venta.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">
          Emitir guía de remisión
        </h1>

        <div className="mt-8 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">
            Venta
          </h2>

          <div className="mt-4 space-y-2">
            <p>
              <strong>Comprobante:</strong>{" "}
              {venta.documento
                ? `${venta.documento.serie}-${String(
                    venta.documento.numero
                  ).padStart(6, "0")}`
                : "-"}
            </p>

            <p>
              <strong>Cliente:</strong>{" "}
              {venta.cliente?.nombre ?? "Sin cliente"}
            </p>

            <p>
              <strong>Documento:</strong>{" "}
              {venta.cliente?.ruc
                ? `RUC ${venta.cliente.ruc}`
                : venta.cliente?.dni
                ? `DNI ${venta.cliente.dni}`
                : "Sin documento"}
            </p>

            <p>
              <strong>Dirección:</strong>{" "}
              {venta.cliente?.direccion ?? "Sin dirección"}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">
            Productos
          </h2>

          <div className="mt-4 space-y-3">
            {venta.detalles.map((detalle) => (
              <div
                key={detalle.id}
                className="flex items-center justify-between border-b pb-3"
              >
                <div>
                  <p className="font-medium">
                    {detalle.producto.nombre}
                  </p>

                  <p className="text-sm text-gray-500">
                    Código: {detalle.producto.id}
                  </p>
                </div>

                <p className="font-semibold">
                  Cantidad: {detalle.cantidad}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">
            Modalidad de transporte
          </h2>

          <div className="mt-4">
            <label className="block text-sm font-medium">
              Modalidad
            </label>

            <select
              value={modalidadTransporte}
              onChange={(e) =>
                setModalidadTransporte(e.target.value)
              }
              className="mt-1 w-full rounded-lg border bg-black px-3 py-2 text-white"
            >
              <option value="01">
                Público
              </option>

              <option value="02">
                Privado
              </option>
            </select>
          </div>

          {modalidadTransporte === "01" && (
            <>
              <div className="mt-6">
                <div className="flex items-center justify-between gap-4">
                  <label className="block text-sm font-medium">
                    Transportista
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={abrirFormularioTransportista}
                      className="rounded-lg border border-white px-3 py-2 text-sm"
                    >
                      + Añadir transportista
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/gestion/transportistas?ventaId=${ventaId}`
                        )
                      }
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      Ver transportistas
                    </button>
                  </div>
                </div>

                <select
                  value={transportistaId}
                  onChange={(e) =>
                    setTransportistaId(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border bg-black px-3 py-2 text-white"
                >
                  <option value="">
                    Selecciona un transportista
                  </option>

                  {transportistas.map((transportista) => (
                    <option
                      key={transportista.id}
                      value={transportista.id}
                    >
                      {transportista.denominacion} - RUC{" "}
                      {transportista.ruc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium">
                  Fecha de entrega al transportista
                </label>

                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={fechaEntregaTransportista}
                  onChange={(e) =>
                    setFechaEntregaTransportista(
                      e.target.value
                    )
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>
            </>
          )}

          {modalidadTransporte === "02" && (
            <>
              <div className="mt-6">
                <label className="block text-sm font-medium">
                  Fecha de inicio del traslado
                </label>

                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={fechaInicioTraslado}
                  onChange={(e) =>
                    setFechaInicioTraslado(e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div className="mt-6">
                <h3 className="font-semibold">
                  Vehículo
                </h3>

                <div className="mt-3">
                  <label className="block text-sm font-medium">
                    Placa
                  </label>

                  <input
                    type="text"
                    value={placaVehiculo}
                    onChange={(e) =>
                      setPlacaVehiculo(
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="Ej. ABC-123"
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                  />
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold">
                  Conductor
                </h3>

                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium">
                      Tipo de documento
                    </label>

                    <select
                      value={conductorTipoDocumento}
                      onChange={(e) =>
                        setConductorTipoDocumento(
                          e.target.value
                        )
                      }
                      className="mt-1 w-full rounded-lg border bg-black px-3 py-2 text-white"
                    >
                      <option value="1">
                        DNI
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">
                      Número de documento
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={conductorNumeroDocumento}
                      onChange={(e) =>
                        setConductorNumeroDocumento(
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                      placeholder="DNI del conductor"
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">
                      Nombres
                    </label>

                    <input
                      type="text"
                      value={conductorNombres}
                      onChange={(e) =>
                        setConductorNombres(e.target.value)
                      }
                      placeholder="Nombres del conductor"
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">
                      Apellidos
                    </label>

                    <input
                      type="text"
                      value={conductorApellidos}
                      onChange={(e) =>
                        setConductorApellidos(e.target.value)
                      }
                      placeholder="Apellidos del conductor"
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium">
                    Licencia de conducir
                  </label>

                  <input
                    type="text"
                    value={licenciaConducir}
                    onChange={(e) =>
                      setLicenciaConducir(
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="Número de licencia"
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">
            Datos del traslado
          </h2>

          <div className="mt-4">
            <label className="block text-sm font-medium">
              Motivo del traslado
            </label>

            <select
              value={motivoTraslado}
              onChange={(e) =>
                setMotivoTraslado(e.target.value)
              }
              className="mt-1 w-full rounded-lg border px-3 py-2 bg-black text-white"
            >
              <option value="01">
                Venta
              </option>
              {/* <option value="02">
                Compra
              </option>
              <option value="03">
                Venta con entrega a terceros
              </option>
              <option value="04">
                Traslado entre establecimientos
              </option>
              <option value="05">
                Consignación
              </option>
              <option value="13">
                Otros
              </option> */}
            </select>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold">
              Punto de partida
            </h3>

            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">
                  Ubigeo
                </label>

                <div className="mt-1 w-full rounded-lg border bg-black px-3 py-2 text-white">
                  {puntoPartidaUbigeo}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Dirección
                </label>

                <div className="mt-1 w-full rounded-lg border bg-black px-3 py-2 text-white">
                  {puntoPartidaDireccion}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold">
              Punto de llegada
            </h3>

            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">
                  Ubigeo
                </label>

                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  value={puntoLlegadaUbigeo}
                  onChange={(e) =>
                    setPuntoLlegadaUbigeo(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="Ej. 140101"
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Dirección
                </label>

                <input
                  type="text"
                  value={puntoLlegadaDireccion}
                  onChange={(e) =>
                    setPuntoLlegadaDireccion(e.target.value)
                  }
                  placeholder="Dirección de llegada"
                  className="mt-1 w-full rounded-lg border bg-black px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">
            Datos de la carga
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">
                Peso bruto total (kg)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={pesoBrutoTotal}
                onChange={(e) =>
                  setPesoBrutoTotal(e.target.value)
                }
                placeholder="Ej. 2.5"
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Número de bultos
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={numeroBultos}
                onChange={(e) =>
                  setNumeroBultos(e.target.value)
                }
                placeholder="Ej. 1"
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium">
              Observaciones
            </label>

            <textarea
              value={observaciones}
              onChange={(e) =>
                setObservaciones(e.target.value)
              }
              rows={3}
              placeholder="Observaciones opcionales"
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={emitirGuia}
            disabled={emitiendo}
            className="rounded-lg border border-white bg-black px-6 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {emitiendo
              ? "Emitiendo..."
              : "Emitir guía de remisión"}
          </button>
        </div>
      </div>

      {mostrarFormularioTransportista && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-black">
              Nuevo transportista
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-black">
                  RUC
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  value={ruc}
                  onChange={(e) =>
                    setRuc(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  className="mt-1 w-full rounded-lg border p-3 text-black"
                  placeholder="RUC de 11 dígitos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black">
                  Denominación
                </label>

                <input
                  type="text"
                  value={denominacion}
                  onChange={(e) =>
                    setDenominacion(e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border p-3 text-black"
                  placeholder="Nombre de la agencia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black">
                  Número de registro MTC
                </label>

                <input
                  type="text"
                  value={numeroRegistroMTC}
                  onChange={(e) =>
                    setNumeroRegistroMTC(e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border p-3 text-black"
                  placeholder="Número de registro MTC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black">
                  Número de autorización
                </label>

                <input
                  type="text"
                  value={numeroAutorizacion}
                  onChange={(e) =>
                    setNumeroAutorizacion(e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border p-3 text-black"
                  placeholder="Número de autorización"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black">
                  Código de entidad autorizadora
                </label>

                <input
                  type="text"
                  value={codigoEntidadAutorizadora}
                  onChange={(e) =>
                    setCodigoEntidadAutorizadora(e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border p-3 text-black"
                  placeholder="Código de entidad autorizadora"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={cerrarFormularioTransportista}
                disabled={registrandoTransportista}
                className="rounded-lg border border-black px-5 py-3 text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={guardarTransportista}
                disabled={registrandoTransportista}
                className="rounded-lg bg-black px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {registrandoTransportista
                  ? "Registrando..."
                  : "Registrar transportista"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function NuevaGuiaRemision() {
  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <NuevaGuiaRemisionContenido />
    </Suspense>
  );
}