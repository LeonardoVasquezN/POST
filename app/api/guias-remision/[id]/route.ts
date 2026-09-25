import { NextResponse } from "next/server";
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

    const guiaId = Number(id);

    if (!Number.isInteger(guiaId) || guiaId <= 0) {
      return NextResponse.json(
        {
          error: "El ID de la guía no es válido.",
        },
        { status: 400 }
      );
    }

    const guiaRemision = await prisma.guiaRemision.findUnique({
      where: {
        id: guiaId,
      },
      include: {
        venta: {
          include: {
            documento: true,
          },
        },

        transportista: true,

        destinatario: true,

        detalles: {
          include: {
            producto: true,
          },
        },
      },
    });

    if (!guiaRemision) {
      return NextResponse.json(
        {
          error: "Guía de remisión no encontrada.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(guiaRemision);
  } catch (error) {
    console.error(
      "Error al obtener la guía de remisión:",
      error
    );

    return NextResponse.json(
      {
        error: "Error interno al obtener la guía de remisión.",
      },
      { status: 500 }
    );
  }
}