import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: {
        nombre: "asc",
      },
    });

    return Response.json(clientes);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Error al obtener clientes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { nombre, dni, ruc, direccion } = body;

    if (!nombre?.trim()) {
      return Response.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    const cliente = await prisma.cliente.create({
      data: {
        nombre: nombre.trim(),
        dni: dni?.trim() || null,
        ruc: ruc?.trim() || null,
        direccion: direccion?.trim() || null,
      },
    });

    return Response.json(cliente, { status: 201 });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Error al crear cliente" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const id = Number(body.id);
    const nombre = body.nombre?.trim();
    const dni = body.dni?.trim() || null;
    const ruc = body.ruc?.trim() || null;
    const direccion = body.direccion?.trim() || null;

    if (!Number.isInteger(id) || id <= 0) {
      return Response.json(
        { error: "El ID del cliente no es válido" },
        { status: 400 }
      );
    }

    if (!nombre) {
      return Response.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    if (dni && !/^\d{8}$/.test(dni)) {
      return Response.json(
        { error: "El DNI debe tener exactamente 8 dígitos" },
        { status: 400 }
      );
    }

    if (ruc && !/^\d{11}$/.test(ruc)) {
      return Response.json(
        { error: "El RUC debe tener exactamente 11 dígitos" },
        { status: 400 }
      );
    }

    const cliente = await prisma.cliente.update({
      where: {
        id: id,
      },
      data: {
        nombre,
        dni,
        ruc,
        direccion,
      },
    });

    return Response.json(cliente);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Error al actualizar cliente" },
      { status: 500 }
    );
  }
}