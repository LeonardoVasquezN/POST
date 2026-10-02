"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative z-50 w-full border-b border-white/[0.07] bg-black px-5 py-4 md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="shrink-0">
            <Image
              src="/imagenes/logoPOSQUEDA.png"
              alt="POS Queda Logo"
              width={120}
              height={40}
              priority
              className="h-8 w-auto object-contain"
            />
          </Link>

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 ${
                isOpen
                  ? "border-white/[0.12] bg-white/[0.08] text-white"
                  : "border-white/[0.06] bg-white/[0.03] text-zinc-400 hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-white"
              }`}
              aria-label="Abrir menú"
              aria-expanded={isOpen}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M6 6l12 12M18 6L6 18"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M4 7h16M4 12h16M4 17h16"
                  />
                )}
              </svg>
            </button>

            {isOpen && (
              <>
                <button
                  onClick={() => setIsOpen(false)}
                  className="fixed inset-0 z-40 cursor-default bg-black/40 backdrop-blur-[2px]"
                  aria-label="Cerrar menú"
                />

                <nav className="absolute left-0 top-[calc(100%+10px)] z-50 w-80 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0b0b0b] shadow-2xl shadow-black/50">
                  <div className="border-b border-white/[0.06] px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                        Navegación
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">
                      Accesos rápidos del sistema
                    </p>
                  </div>

                  <div className="p-2">
                    <Link
                      href="/ventas"
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.05]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-400 transition-colors group-hover:bg-emerald-400/[0.12]">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M3 7h18M5 7v12h14V7M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M9 11h6"
                          />
                        </svg>
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          Nueva venta
                        </p>
                        <p className="text-xs text-zinc-500">
                          Crear un comprobante
                        </p>
                      </div>

                      <svg
                        className="h-4 w-4 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>

                    <Link
                      href="/productos"
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.05]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/[0.07] text-blue-400 transition-colors group-hover:bg-blue-400/[0.12]">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M4 7.5L12 3l8 4.5M4 7.5V16.5L12 21l8-4.5V7.5M12 21V12M4.5 7.75L12 12l7.5-4.25"
                          />
                        </svg>
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          Productos
                        </p>
                        <p className="text-xs text-zinc-500">
                          Gestionar catálogo
                        </p>
                      </div>

                      <svg
                        className="h-4 w-4 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>

                    <Link
                      href="/historial"
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.05]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-400/[0.07] text-purple-400 transition-colors group-hover:bg-purple-400/[0.12]">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M4 6h16M4 12h10M4 18h7M17 15v6M14 18h6"
                          />
                        </svg>
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          Historial
                        </p>
                        <p className="text-xs text-zinc-500">
                          Consultar ventas
                        </p>
                      </div>

                      <svg
                        className="h-4 w-4 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </nav>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}