"use client";

import { useEffect, useState } from "react";
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

export default function NuevaGuiaRemision() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const ventaId = searchParams.get("ventaId");

  const [venta, setVenta] = useState<Venta | null>(null);
  const [transportistas, setTransportistas] = useState<Transportista[]>([]);

  const [transportistaId, setTransportistaId] = useState("");
  const [fechaEntregaTransportista, setFechaEntregaTransportista] = useState("");
  const [motivoTraslado, setMotivoTraslado] = useState("01");

  const [puntoPartidaUbigeo, setPuntoPartidaUbigeo] = useState("");
  const [puntoPartidaDireccion, setPuntoPartidaDireccion] = useState("");

  const [puntoLlegadaUbigeo, setPuntoLlegadaUbigeo] = useState("");
  const [puntoLlegadaDireccion, setPuntoLlegadaDireccion] = useState("");

  const [pesoBrutoTotal, setPesoBrutoTotal] = useState("");
  const [numeroBultos, setNumeroBultos] = useState("");

  const [observaciones, setObservaciones] = useState("");

  const [cargando, setCargando] = useState(true);
  const [emitiendo, setEmitiendo] = useState(false);

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

  async function emitirGuia() {
    if (!venta) {
      return;
    }

    if (!transportistaId) {
      alert("Selecciona un transportista");
      return;
    }

    if (!fechaEntregaTransportista) {
      alert("Selecciona la fecha de entrega al transportista");
      return;
    }

    const hoy = new Date();

    const fechaHoy = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate()
    );

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
          transportistaId: Number(transportistaId),
          fechaEntregaTransportista,
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
        alert(data.error || "No se pudo emitir la guía");
        return;
      }

      alert("Guía de remisión emitida correctamente");

      router.push(
        `/gestion/guias-remision/${data.guiaRemision.id}`
      );
    } catch (error) {
      console.error(error);
      alert("Error al emitir la guía de remisión");
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
            Transportista
          </h2>

          <div className="mt-4">
            <label className="block text-sm font-medium">
              Transportista
            </label>

            <select
              value={transportistaId}
              onChange={(e) =>
                setTransportistaId(e.target.value)
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
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
                setFechaEntregaTransportista(e.target.value)
              }
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
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
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value="01">
                Venta
              </option>
              <option value="02">
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
              </option>
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

                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  value={puntoPartidaUbigeo}
                  onChange={(e) =>
                    setPuntoPartidaUbigeo(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="Ej. 130101"
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Dirección
                </label>

                <input
                  type="text"
                  value={puntoPartidaDireccion}
                  onChange={(e) =>
                    setPuntoPartidaDireccion(e.target.value)
                  }
                  placeholder="Dirección de partida"
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
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
                  className="mt-1 w-full rounded-lg border px-3 py-2"
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
            className="rounded-lg bg-black px-6 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {emitiendo
              ? "Emitiendo..."
              : "Emitir guía de remisión"}
          </button>
        </div>
      </div>
    </main>
  );
}