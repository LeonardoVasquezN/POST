"use client";

import { useEffect, useState } from "react";

type Transportista = {
  id: number;
  ruc: string;
  denominacion: string;
  numeroRegistroMTC: string;
  numeroAutorizacion: string;
  codigoEntidadAutorizadora: string;
  activo: boolean;
};

export default function Transportistas() {
  const [transportistas, setTransportistas] = useState<Transportista[]>([]);
  const [cargando, setCargando] = useState(true);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [transportistaEditando, setTransportistaEditando] =
    useState<Transportista | null>(null);

  const [ruc, setRuc] = useState("");
  const [denominacion, setDenominacion] = useState("");
  const [numeroRegistroMTC, setNumeroRegistroMTC] = useState("");
  const [numeroAutorizacion, setNumeroAutorizacion] = useState("");
  const [codigoEntidadAutorizadora, setCodigoEntidadAutorizadora] =
    useState("");

  const [registrandoTransportista, setRegistrandoTransportista] =
    useState(false);

  const cargarTransportistas = async () => {
    try {
      setCargando(true);

      const respuesta = await fetch("/api/transportistas");

      if (!respuesta.ok) {
        throw new Error("Error al obtener transportistas");
      }

      const data = await respuesta.json();

      setTransportistas(data);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar los transportistas");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTransportistas();
  }, []);

  const limpiarFormulario = () => {
    setRuc("");
    setDenominacion("");
    setNumeroRegistroMTC("");
    setNumeroAutorizacion("");
    setCodigoEntidadAutorizadora("");
    setTransportistaEditando(null);
  };

  const abrirNuevo = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const abrirEditar = (transportista: Transportista) => {
    setTransportistaEditando(transportista);

    setRuc(transportista.ruc);
    setDenominacion(transportista.denominacion);
    setNumeroRegistroMTC(transportista.numeroRegistroMTC);
    setNumeroAutorizacion(transportista.numeroAutorizacion);
    setCodigoEntidadAutorizadora(
      transportista.codigoEntidadAutorizadora
    );

    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    limpiarFormulario();
  };

  const guardarTransportista = async () => {
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
      const url = transportistaEditando
        ? `/api/transportistas/${transportistaEditando.id}`
        : "/api/transportistas";

      const metodo = transportistaEditando ? "PUT" : "POST";

      const respuesta = await fetch(url, {
        method: metodo,
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
        alert(data.error || "No se pudo guardar el transportista");
        return;
      }

      alert(
        transportistaEditando
          ? "Transportista actualizado correctamente"
          : "Transportista registrado correctamente"
      );

      cerrarFormulario();
      await cargarTransportistas();
    } catch (error) {
      console.error(error);
      alert("Error al guardar el transportista");
    } finally {
      setRegistrandoTransportista(false);
    }
  };

  const cambiarEstado = async (transportista: Transportista) => {
    const nuevoEstado = !transportista.activo;

    const confirmar = window.confirm(
      nuevoEstado
        ? `¿Deseas activar a "${transportista.denominacion}"?`
        : `¿Deseas desactivar a "${transportista.denominacion}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      const respuesta = await fetch(
        `/api/transportistas/${transportista.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            activo: nuevoEstado,
          }),
        }
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        alert(data.error || "No se pudo cambiar el estado");
        return;
      }

      await cargarTransportistas();
    } catch (error) {
      console.error(error);
      alert("Error al cambiar el estado del transportista");
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Transportistas
            </h1>

            <p className="mt-1 text-gray-600">
              Administra las agencias de transporte utilizadas
              para las guías de remisión.
            </p>
          </div>

          <button
            type="button"
            onClick={abrirNuevo}
            className="rounded-lg border border-white bg-black px-4 py-2 text-white"
          >
            + Nuevo transportista
          </button>
        </div>

        {cargando ? (
          <p>Cargando transportistas...</p>
        ) : transportistas.length === 0 ? (
          <div className="rounded-lg border p-8 text-center text-gray-500">
            No hay transportistas registrados.
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4">RUC</th>
                  <th className="p-4">Denominación</th>
                  <th className="p-4">Registro MTC</th>
                  <th className="p-4">Autorización</th>
                  <th className="p-4">Entidad autorizadora</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {transportistas.map((transportista) => (
                  <tr
                    key={transportista.id}
                    className="border-b last:border-b-0"
                  >
                    <td className="p-4">
                      {transportista.ruc}
                    </td>

                    <td className="p-4 font-medium">
                      {transportista.denominacion}
                    </td>

                    <td className="p-4">
                      {transportista.numeroRegistroMTC}
                    </td>

                    <td className="p-4">
                      {transportista.numeroAutorizacion}
                    </td>

                    <td className="p-4">
                      {transportista.codigoEntidadAutorizadora}
                    </td>

                    <td className="p-4">
                      {transportista.activo
                        ? "Activo"
                        : "Inactivo"}
                    </td>

                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            abrirEditar(transportista)
                          }
                          className="rounded-lg border px-4 py-2"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            cambiarEstado(transportista)
                          }
                          className="rounded-lg border px-4 py-2"
                        >
                          {transportista.activo
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

        {mostrarFormulario && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h2 className="text-xl font-bold text-black">
                {transportistaEditando
                  ? "Editar transportista"
                  : "Nuevo transportista"}
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
                      setCodigoEntidadAutorizadora(
                        e.target.value
                      )
                    }
                    className="mt-1 w-full rounded-lg border p-3 text-black"
                    placeholder="Código de entidad autorizadora"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cerrarFormulario}
                  className="rounded-lg border border-black px-5 py-3 text-black"
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
                    : transportistaEditando
                      ? "Guardar cambios"
                      : "Registrar transportista"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}