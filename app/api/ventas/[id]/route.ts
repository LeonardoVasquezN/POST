import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const ventaId = Number(id);

    if (!Number.isInteger(ventaId) || ventaId <= 0) {
      return Response.json(
        { error: "El ID de la venta no es válido" },
        { status: 400 }
      );
    }

    const venta = await prisma.venta.findUnique({
      where: {
        id: ventaId,
      },
      include: {
        cliente: true,
        documento: true,
        detalles: {
          include: {
            producto: true,
          },
        },
        guiaRemision: true,
      },
    });

    if (!venta) {
      return Response.json(
        { error: "La venta no existe" },
        { status: 404 }
      );
    }

    return Response.json(venta);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Error al obtener la venta" },
      { status: 500 }
    );
  }
}