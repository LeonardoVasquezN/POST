import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const transportistaId = Number(id);

    if (isNaN(transportistaId)) {
      return NextResponse.json(
        { error: "ID de transportista inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      ruc,
      denominacion,
      numeroRegistroMTC,
      numeroAutorizacion,
      codigoEntidadAutorizadora,
    } = body;

    if (
      !ruc ||
      !denominacion ||
      !numeroRegistroMTC ||
      !numeroAutorizacion ||
      !codigoEntidadAutorizadora
    ) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    if (!/^\d{11}$/.test(ruc)) {
      return NextResponse.json(
        { error: "El RUC debe tener exactamente 11 dígitos" },
        { status: 400 }
      );
    }

    const transportista = await prisma.transportista.findUnique({
      where: {
        id: transportistaId,
      },
    });

    if (!transportista) {
      return NextResponse.json(
        { error: "Transportista no encontrado" },
        { status: 404 }
      );
    }

    const rucExistente = await prisma.transportista.findFirst({
      where: {
        ruc,
        NOT: {
          id: transportistaId,
        },
      },
    });

    if (rucExistente) {
      return NextResponse.json(
        { error: "Ya existe otro transportista con ese RUC" },
        { status: 409 }
      );
    }

    const transportistaActualizado =
      await prisma.transportista.update({
        where: {
          id: transportistaId,
        },
        data: {
          ruc,
          denominacion,
          numeroRegistroMTC,
          numeroAutorizacion,
          codigoEntidadAutorizadora,
        },
      });

    return NextResponse.json(transportistaActualizado);
  } catch (error) {
    console.error("Error al actualizar transportista:", error);

    return NextResponse.json(
      { error: "Error al actualizar el transportista" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const transportistaId = Number(id);

    if (isNaN(transportistaId)) {
      return NextResponse.json(
        { error: "ID de transportista inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (typeof body.activo !== "boolean") {
      return NextResponse.json(
        { error: "El campo activo debe ser booleano" },
        { status: 400 }
      );
    }

    const transportista = await prisma.transportista.findUnique({
      where: {
        id: transportistaId,
      },
    });

    if (!transportista) {
      return NextResponse.json(
        { error: "Transportista no encontrado" },
        { status: 404 }
      );
    }

    const transportistaActualizado =
      await prisma.transportista.update({
        where: {
          id: transportistaId,
        },
        data: {
          activo: body.activo,
        },
      });

    return NextResponse.json(transportistaActualizado);
  } catch (error) {
    console.error("Error al cambiar estado del transportista:", error);

    return NextResponse.json(
      { error: "Error al cambiar el estado del transportista" },
      { status: 500 }
    );
  }
}