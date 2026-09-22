import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const ventas = await prisma.venta.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        cliente: true,
        documento: true,
        detalles: {
          include: {
            producto: true,
          },
        },
      },
    });

    return Response.json(ventas);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Error al obtener las ventas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { clienteId, metodoPago, montoRecibido, detalles } = body;

    if (!Array.isArray(detalles) || detalles.length === 0) {
      return Response.json(
        { error: "La venta debe tener al menos un producto" },
        { status: 400 }
      );
    }

    const metodosPagoValidos = [
      "EFECTIVO",
      "YAPE",
      "PLIN",
      "TRANSFERENCIA",
      "TARJETA",
    ];

    if (!metodosPagoValidos.includes(metodoPago)) {
      return Response.json(
        { error: "El método de pago no es válido" },
        { status: 400 }
      );
    }

    if (clienteId !== undefined && clienteId !== null) {
      if (!Number.isInteger(Number(clienteId)) || Number(clienteId) <= 0) {
        return Response.json(
          { error: "El cliente no es válido" },
          { status: 400 }
        );
      }

      const cliente = await prisma.cliente.findUnique({
        where: {
          id: Number(clienteId),
        },
      });

      if (!cliente) {
        return Response.json(
          { error: "El cliente no existe" },
          { status: 400 }
        );
      }
    }

    for (const detalle of detalles) {
      const productoId = Number(detalle.productoId);
      const cantidad = Number(detalle.cantidad);
      const precioUnitario = Number(detalle.precioUnitario);

      if (!Number.isInteger(productoId) || productoId <= 0) {
        return Response.json(
          { error: "El producto no es válido" },
          { status: 400 }
        );
      }

      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        return Response.json(
          { error: "La cantidad no es válida" },
          { status: 400 }
        );
      }

      if (!Number.isFinite(precioUnitario) || precioUnitario < 0) {
        return Response.json(
          { error: "El precio no es válido" },
          { status: 400 }
        );
      }

      const producto = await prisma.producto.findUnique({
        where: {
          id: productoId,
        },
      });

      if (!producto) {
        return Response.json(
          { error: `El producto ${productoId} no existe` },
          { status: 400 }
        );
      }

      if (!producto.activo) {
        return Response.json(
          { error: `El producto "${producto.nombre}" está inactivo` },
          { status: 400 }
        );
      }
    }

    const total = detalles.reduce(
      (acumulado: number, detalle: any) => {
        return (
          acumulado +
          Number(detalle.cantidad) * Number(detalle.precioUnitario)
        );
      },
      0
    );

    if (metodoPago === "EFECTIVO") {
      const recibido = Number(montoRecibido);

      if (!Number.isFinite(recibido) || recibido < total) {
        return Response.json(
          { error: "El monto recibido no es suficiente" },
          { status: 400 }
        );
      }
    }

    const venta = await prisma.$transaction(async (tx) => {
      const secuencia = await tx.secuenciaDocumento.update({
        where: {
          serie: "NV01",
        },
        data: {
          siguiente: {
            increment: 1,
          },
        },
      });

      const numero = secuencia.siguiente - 1;

      const ventaCreada = await tx.venta.create({
        data: {
          clienteId:
            clienteId !== undefined && clienteId !== null
              ? Number(clienteId)
              : null,

          metodoPago,

          montoRecibido:
            metodoPago === "EFECTIVO"
              ? Number(montoRecibido)
              : null,

          vuelto:
            metodoPago === "EFECTIVO"
              ? Number(montoRecibido) - total
              : null,
          total,

          estado: "COMPLETADA",

          detalles: {
            create: detalles.map((detalle: any) => ({
              productoId: Number(detalle.productoId),
              cantidad: Number(detalle.cantidad),
              precioUnitario: Number(detalle.precioUnitario),
              subtotal:
                Number(detalle.cantidad) *
                Number(detalle.precioUnitario),
            })),
          },

          documento: {
            create: {
              tipo: "NOTA",
              serie: "NV01",
              numero,
              estado: "EMITIDO",
              fechaEmision: new Date(),
            },
          },
        },

        include: {
          cliente: true,
          detalles: {
            include: {
              producto: true,
            },
          },
          documento: true,
        },
      });

      return ventaCreada;
    });

    return Response.json(venta, { status: 201 });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Error al procesar la venta" },
      { status: 500 }
    );
  }
}