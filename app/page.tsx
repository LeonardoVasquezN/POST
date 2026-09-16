export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center justify-center tracking-tight">
        {/* Título Principal */}
        <h1 className="flex flex-col text-6xl sm:text-7xl md:text-8xl font-semibold text-zinc-400 leading-none space-y-2">
          <span>Facturación</span>
          <span>Electrónica</span>
        </h1>

        {/* Subtítulo Azul */}
        <p className="mt-8 text-xl sm:text-2xl font-normal text-sky-500 tracking-widest uppercase">
          Empieza hoy mismo
        </p>
      </div>
    </main>
  );
}
