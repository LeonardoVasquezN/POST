-- DropForeignKey
ALTER TABLE "GuiaRemision" DROP CONSTRAINT "GuiaRemision_transportistaId_fkey";

-- AlterTable
ALTER TABLE "GuiaRemision" ADD COLUMN     "licenciaConducir" TEXT,
ADD COLUMN     "marcaVehiculo" TEXT,
ADD COLUMN     "placaVehiculo" TEXT,
ALTER COLUMN "transportistaId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "GuiaRemision" ADD CONSTRAINT "GuiaRemision_transportistaId_fkey" FOREIGN KEY ("transportistaId") REFERENCES "Transportista"("id") ON DELETE SET NULL ON UPDATE CASCADE;
