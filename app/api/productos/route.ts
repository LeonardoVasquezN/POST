import { prisma } from "@/lib/prisma";

export async function GET() {
  const productos = await prisma.producto.findMany({
    orderBy: {
      nombre: "asc",
    },
  });

  return Response.json(productos);
}

export async function POST(request: Request) {
  const body = await request.json();

  if(!body.nombre?.trim()) {
    return Response.json(
      {error: "El nombre es obligatorio"},
      {status: 400}
    )
  }

  const precioBase = Number(body.precioBase);

  if(!Number.isFinite(precioBase) || precioBase <= 0) {
    return Response.json(
      {error: "El precio debe ser válido"},
      {status: 400}
    )
  }

  const producto = await prisma.producto.create({
    data: {
      nombre: body.nombre,
      precioBase: precioBase,
    },
  });

  return Response.json(producto, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const id   = Number(body.id);

  if(!Number.isInteger(id) || id <= 0) {
    return Response.json(
      {error: "El id del producto no es válido"},
      {status: 400}
    )
  }

  if (typeof body.activo === "boolean") {
    const producto = await prisma.producto.update({
      where: {
        id: id,
      },
      data: {
        activo: body.activo,
      },
    });

    return Response.json(producto);
  }

  if(!body.nombre?.trim()) {
    return Response.json(
      {error: "El nombre es obligatorio"},
      {status: 400}
    )
  }

  const precioBase = Number(body.precioBase);

  if (!Number.isFinite(precioBase) || precioBase < 0) {
    return Response.json(
      { error: "El precio debe ser válido" },
      { status: 400 }
    );
  }

  const producto = await prisma.producto.update({
    where: {
      id: id,
    },
    data: {
      nombre: body.nombre.trim(),
      precioBase: precioBase,
      activo: body.activo
    },
  });

  return Response.json(producto, { status: 200 });
}