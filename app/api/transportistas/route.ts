import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const transportistas = await prisma.transportista.findMany({
      orderBy: {
        denominacion: "asc",
      },
    });

    return NextResponse.json(transportistas);
  } catch (error) {
    console.error("Error al obtener transportistas:", error);

    return NextResponse.json(
      { error: "Error al obtener los transportistas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    const transportistaExistente =
      await prisma.transportista.findUnique({
        where: {
          ruc,
        },
      });

    if (transportistaExistente) {
      return NextResponse.json(
        { error: "Ya existe un transportista con ese RUC" },
        { status: 409 }
      );
    }

    const transportista = await prisma.transportista.create({
      data: {
        ruc,
        denominacion,
        numeroRegistroMTC,
        numeroAutorizacion,
        codigoEntidadAutorizadora,
      },
    });

    return NextResponse.json(transportista, { status: 201 });
  } catch (error) {
    console.error("Error al crear transportista:", error);

    return NextResponse.json(
      { error: "Error al registrar el transportista" },
      { status: 500 }
    );
  }
}