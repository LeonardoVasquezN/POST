-- CreateTable
CREATE TABLE "SecuenciaDocumento" (
    "id" SERIAL NOT NULL,
    "serie" TEXT NOT NULL,
    "siguiente" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecuenciaDocumento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SecuenciaDocumento_serie_key" ON "SecuenciaDocumento"("serie");
