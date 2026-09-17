import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { clienteId, metodoPago, montoRecibido, detalles } = body;

    if (!Array.isArray(detalles) || detalles.length === 0) {
      return Response.json(
        { error: "La boleta debe tener al menos un producto" },
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
          {
            error: `El producto "${producto.nombre}" está inactivo`,
          },
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

    const resultado = await prisma.$transaction(async (tx) => {
      const secuencia = await tx.secuenciaDocumento.update({
        where: {
          serie: "B001",
        },
        data: {
          siguiente: {
            increment: 1,
          },
        },
      });

      const numero = secuencia.siguiente - 1;

      const venta = await tx.venta.create({
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
              tipo: "BOLETA",
              serie: "B001",
              numero,
              estado: "PENDIENTE",
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

      return venta;
    });

    const documento = resultado.documento;

    const items = resultado.detalles.map((detalle) => {
      const precioFinal = Number(detalle.precioUnitario);

      const valorUnitario = precioFinal / 1.18;

      return {
        unidad_de_medida: "NIU",
        descripcion: detalle.producto.nombre,
        cantidad: String(detalle.cantidad),
        valor_unitario: valorUnitario.toFixed(6),
        porcentaje_igv: "18",
        codigo_tipo_afectacion_igv: "10",
        nombre_tributo: "IGV",
      };
    });

    const payloadLuCode = {
      documento: "boleta",
      serie: documento.serie,
      numero: documento.numero,
      fecha_de_emision: new Date().toISOString().split("T")[0],
      moneda: "PEN",
      tipo_operacion: "0101",

      cliente_tipo_de_documento: "1",
      cliente_numero_de_documento: "99999999",
      cliente_denominacion: "CLIENTE VARIOS",
      cliente_direccion: "-",

      items,

      total: total.toFixed(2),
    };

    const respuestaLuCode = await fetch(
      process.env.LUCODE_API_URL!,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.LUCODE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payloadLuCode),
      }
    );

    const resultadoLuCode = await respuestaLuCode.json();

    const aceptado =
      respuestaLuCode.ok &&
      resultadoLuCode?.success === true &&
      resultadoLuCode?.payload?.estado === "ACEPTADO";

    if (aceptado) {
      await prisma.documento.update({
        where: {
          id: documento.id,
        },
        data: {
          estado: "EMITIDO",
          codigoRespuesta:
            resultadoLuCode?.payload?.hash ?? null,
          mensajeRespuesta:
            resultadoLuCode?.message ?? null,
        },
      });

      const ventaFinal = await prisma.venta.findUnique({
        where: {
          id: resultado.id,
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

      return Response.json(
        {
          success: true,
          message: "Boleta emitida correctamente",
          venta: ventaFinal,
          estado: "EMITIDO",
          respuestaLuCode: resultadoLuCode,
        },
        { status: 201 }
      );
    }

    await prisma.documento.update({
      where: {
        id: documento.id,
      },
      data: {
        estado: "RECHAZADO",
        codigoRespuesta:
          resultadoLuCode?.payload?.codigo ?? null,
        mensajeRespuesta:
          resultadoLuCode?.message ??
          "La boleta fue rechazada",
      },
    });

    return Response.json(
      {
        success: false,
        message: "La boleta fue rechazada",
        ventaId: resultado.id,
        documentoId: documento.id,
        serie: documento.serie,
        numero: documento.numero,
        estado: "RECHAZADO",
        respuestaLuCode: resultadoLuCode,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Error al procesar la boleta",
      },
      { status: 500 }
    );
  }
}