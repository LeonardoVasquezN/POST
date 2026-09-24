-- CreateEnum
CREATE TYPE "EstadoGuia" AS ENUM ('PENDIENTE', 'EMITIDA', 'RECHAZADA');

-- CreateTable
CREATE TABLE "Transportista" (
    "id" SERIAL NOT NULL,
    "ruc" TEXT NOT NULL,
    "denominacion" TEXT NOT NULL,
    "numeroRegistroMTC" TEXT NOT NULL,
    "numeroAutorizacion" TEXT NOT NULL,
    "codigoEntidadAutorizadora" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transportista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuiaRemision" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "transportistaId" INTEGER NOT NULL,
    "serie" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL,
    "horaEmision" TEXT NOT NULL,
    "fechaEntregaTransportista" TIMESTAMP(3) NOT NULL,
    "motivoTraslado" TEXT NOT NULL,
    "modalidadTransporte" TEXT NOT NULL DEFAULT '01',
    "destinatarioId" INTEGER NOT NULL,
    "destinatarioTipoDocumento" TEXT NOT NULL,
    "destinatarioNumeroDocumento" TEXT NOT NULL,
    "destinatarioDenominacion" TEXT NOT NULL,
    "destinatarioDireccion" TEXT,
    "puntoPartidaUbigeo" TEXT NOT NULL,
    "puntoPartidaDireccion" TEXT NOT NULL,
    "puntoLlegadaUbigeo" TEXT NOT NULL,
    "puntoLlegadaDireccion" TEXT NOT NULL,
    "pesoBrutoTotal" DECIMAL(65,30) NOT NULL,
    "pesoBrutoUnidadMedida" TEXT NOT NULL DEFAULT 'KGM',
    "numeroBultos" INTEGER NOT NULL,
    "observaciones" TEXT,
    "estado" "EstadoGuia" NOT NULL DEFAULT 'PENDIENTE',
    "hash" TEXT,
    "xml" TEXT,
    "cdr" TEXT,
    "codigoRespuesta" TEXT,
    "mensajeRespuesta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuiaRemision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetalleGuiaRemision" (
    "id" SERIAL NOT NULL,
    "guiaRemisionId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "codigoInterno" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "unidadMedida" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DetalleGuiaRemision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecuenciaGuiaRemision" (
    "id" SERIAL NOT NULL,
    "serie" TEXT NOT NULL,
    "siguiente" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecuenciaGuiaRemision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transportista_ruc_key" ON "Transportista"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "GuiaRemision_ventaId_key" ON "GuiaRemision"("ventaId");

-- CreateIndex
CREATE UNIQUE INDEX "GuiaRemision_serie_numero_key" ON "GuiaRemision"("serie", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "SecuenciaGuiaRemision_serie_key" ON "SecuenciaGuiaRemision"("serie");

-- AddForeignKey
ALTER TABLE "GuiaRemision" ADD CONSTRAINT "GuiaRemision_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaRemision" ADD CONSTRAINT "GuiaRemision_transportistaId_fkey" FOREIGN KEY ("transportistaId") REFERENCES "Transportista"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuiaRemision" ADD CONSTRAINT "GuiaRemision_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleGuiaRemision" ADD CONSTRAINT "DetalleGuiaRemision_guiaRemisionId_fkey" FOREIGN KEY ("guiaRemisionId") REFERENCES "GuiaRemision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleGuiaRemision" ADD CONSTRAINT "DetalleGuiaRemision_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
