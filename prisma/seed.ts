import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.SecuenciaDocumento.upsert({
    where: {
      serie: "NV01",
    },
    update: {},
    create: {
      serie: "NV01",
      siguiente: 1,
    },
  });

  console.log("Secuencia NV01 creada correctamente.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });