/*
  Warnings:

  - You are about to drop the column `marcaVehiculo` on the `GuiaRemision` table. All the data in the column will be lost.
*/

-- AlterTable
ALTER TABLE "GuiaRemision"
DROP COLUMN "marcaVehiculo",
ADD COLUMN "conductorApellidos" TEXT,
ADD COLUMN "conductorNombres" TEXT,
ADD COLUMN "conductorNumeroDocumento" TEXT,
ADD COLUMN "conductorTipoDocumento" TEXT,
ADD COLUMN "fechaInicioTraslado" TIMESTAMP(3),
ALTER COLUMN "fechaEntregaTransportista" DROP NOT NULL;

-- Completar la nueva fecha para las guías existentes
UPDATE "GuiaRemision"
SET "fechaInicioTraslado" = "fechaEntregaTransportista"
WHERE "fechaInicioTraslado" IS NULL;

-- La fecha de inicio será obligatoria
ALTER TABLE "GuiaRemision"
ALTER COLUMN "fechaInicioTraslado" SET NOT NULL;