"use client";

import { useEffect, useState } from "react";

type Cliente = {
  id: number;
  nombre: string;
  dni: string | null;
  ruc: string | null;
  direccion: string | null;
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [clienteEditando, setClienteEditando] = useState<number | null>(null);

  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [ruc, setRuc] = useState("");
  const [direccion, setDireccion] = useState("");

  async function cargarClientes() {
    const response = await fetch("/api/clientes");
    const data = await response.json();

    setClientes(data);
  }

  useEffect(() => {
    cargarClientes();
  }, []);

  async function guardarCliente() {
    if (!nombre.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    const response = await fetch("/api/clientes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre,
        dni,
        ruc,
        direccion,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error);
      return;
    }

    alert("Cliente registrado correctamente");

    setNombre("");
    setDni("");
    setRuc("");
    setDireccion("");
    setMostrarFormulario(false);

    cargarClientes();
  }

  async function editarCliente() {
    if (!nombre.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    const response = await fetch("/api/clientes", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: clienteEditando,
        nombre,
        dni,
        ruc,
        direccion,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error);
      return;
    }

    alert("Cliente actualizado correctamente");

    setNombre("");
    setDni("");
    setRuc("");
    setDireccion("");
    setClienteEditando(null);
    setMostrarFormulario(false);

    cargarClientes();
  }

  function seleccionarClienteParaEditar(cliente: Cliente) {
    setClienteEditando(cliente.id);
    setNombre(cliente.nombre);
    setDni(cliente.dni ?? "");
    setRuc(cliente.ruc ?? "");
    setDireccion(cliente.direccion ?? "");
    setMostrarFormulario(true);
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>

        <button
          type="button"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="rounded-lg border px-5 py-3"
        >
          Nuevo cliente
        </button>
      </div>

      {mostrarFormulario && (
        <div className="mb-8 rounded-lg border p-5">
          <h2 className="mb-4 text-xl font-semibold">
            Registrar cliente
          </h2>

          <div className="space-y-4">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="Nombre *"
            />

            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="DNI"
            />

            <input
              type="text"
              value={ruc}
              onChange={(e) => setRuc(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="RUC"
            />

            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full rounded-lg border p-3"
              placeholder="Dirección"
            />

            <button
              type="button"
              onClick={clienteEditando !== null ? editarCliente : guardarCliente}
              className="rounded-lg border px-5 py-3"
            >
              {clienteEditando !== null ? "Actualizar cliente" : "Guardar cliente"}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-lg border">
        {clientes.length === 0 ? (
          <p className="p-5">No hay clientes registrados.</p>
        ) : (
          clientes.map((cliente) => (
            <div
              key={cliente.id}
              className="border-b p-4"
            >
              <div className="font-semibold">
                {cliente.nombre}
              </div>

              {cliente.dni && (
                <div>DNI: {cliente.dni}</div>
              )}

              {cliente.ruc && (
                <div>RUC: {cliente.ruc}</div>
              )}

              {cliente.direccion && (
                <div>Dirección: {cliente.direccion}</div>
              )}

              <button
                type="button"
                onClick={() => seleccionarClienteParaEditar(cliente)}
                className="rounded-lg border px-4 py-2"
              >
                Editar
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  );
}