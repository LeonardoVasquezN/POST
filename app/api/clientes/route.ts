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
  const body = await request.json();
  const id   = Number(body.id);

  const cliente = await prisma.cliente.update({
    where: {
      id: id
    },
    data: {
      nombre: body.nombre,
      dni: body.dni,
      ruc: body.ruc,
      direccion: body.direccion,
    },
  });

  return Response.json(cliente); 
}