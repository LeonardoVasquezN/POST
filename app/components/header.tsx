"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative w-full border-b border-zinc-800 bg-black px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Lado izquierdo: Logo y Hamburguesa */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Image
              src="/imagenes/logoPOSQUEDA.png"
              alt="POS Queda Logo"
              width={120}
              height={40}
              priority
              className="h-8 w-auto object-contain"
            />
          </Link>

          {/* Botón Hamburguesa */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            aria-label="Abrir menú"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                // Icono X (Cerrar)
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                // Icono Hamburguesa
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menú Desplegable */}
      {isOpen && (
        <nav className="absolute left-0 top-full w-full bg-black border-b border-zinc-800 shadow-xl z-50">
          <div className="flex flex-col p-4 max-w-7xl mx-auto space-y-2">
            <Link
              href="/ventas"
              onClick={() => setIsOpen(false)}
              className="rounded-lg border border-white/20 px-4 py-3 text-white text-center font-semibold hover:bg-zinc-800 transition-colors"
            >
              Nueva venta
            </Link>

            <Link
              href="/productos"
              onClick={() => setIsOpen(false)}
              className="rounded-lg border border-white/20 px-4 py-3 text-white text-center font-semibold hover:bg-zinc-800 transition-colors"
            >
              Productos
            </Link>

            <Link
              href="/historial"
              onClick={() => setIsOpen(false)}
              className="rounded-lg border border-white/20 px-4 py-3 text-white text-center font-semibold hover:bg-zinc-800 transition-colors"
            >
              Historial
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}