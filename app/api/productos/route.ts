import { prisma } from "@/lib/prisma";

export async function GET() {
  const productos = await prisma.producto.findMany({
    where: {
      activo: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });

  return Response.json(productos);
}

export async function POST(request: Request) {
  const body = await request.json();

  const producto = await prisma.producto.create({
    data: {
      nombre: body.nombre,
      precioBase: body.precioBase,
    },
  });

  return Response.json(producto, { status: 201 });
}