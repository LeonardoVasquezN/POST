import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { clienteId, metodoPago, montoRecibido, detalles } = body;

    // 1. Debe existir al menos un producto
    if (!Array.isArray(detalles) || detalles.length === 0) {
      return Response.json(
        { error: "La venta debe tener al menos un producto" },
        { status: 400 }
      );
    }

    // 2. Validar método de pago
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

    // 3. Validar cliente si se recibió
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

    // 4. Validar cada detalle
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

    // 5. Calcular total en el servidor
    const total = detalles.reduce(
      (acumulado: number, detalle: any) => {
        return (
          acumulado +
          Number(detalle.cantidad) * Number(detalle.precioUnitario)
        );
      },
      0
    );

    // 6. Validar efectivo
    if (metodoPago === "EFECTIVO") {
      const recibido = Number(montoRecibido);

      if (!Number.isFinite(recibido) || recibido < total) {
        return Response.json(
          { error: "El monto recibido no es suficiente" },
          { status: 400 }
        );
      }
    }

    // Por ahora todavía NO guardamos.
    return Response.json({
      mensaje: "Venta válida",
      total,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Error al procesar la venta" },
      { status: 500 }
    );
  }
}