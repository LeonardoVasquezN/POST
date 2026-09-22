import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      clienteId,
      metodoPago,
      montoRecibido,
      detalles,
    } = body;

    if (!Array.isArray(detalles) || detalles.length === 0) {
      return Response.json(
        { error: "La factura debe tener al menos un producto" },
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

    if (
      clienteId === undefined ||
      clienteId === null ||
      !Number.isInteger(Number(clienteId)) ||
      Number(clienteId) <= 0
    ) {
      return Response.json(
        {
          error: "Para emitir una factura debes seleccionar un cliente",
        },
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

    if (!cliente.ruc) {
      return Response.json(
        {
          error:
            "El cliente seleccionado debe tener un RUC para emitir una factura",
        },
        { status: 400 }
      );
    }

    if (!/^\d{11}$/.test(cliente.ruc)) {
      return Response.json(
        {
          error: "El RUC del cliente debe tener exactamente 11 dígitos",
        },
        { status: 400 }
      );
    }

    if (
      !cliente.nombre ||
      cliente.nombre.trim().length === 0
    ) {
      return Response.json(
        {
          error: "La razón social del cliente es obligatoria",
        },
        { status: 400 }
      );
    }

    if (cliente.nombre === "CLIENTE_VARIOS") {
      return Response.json(
        {
          error:
            "No se puede emitir una factura a CLIENTE_VARIOS",
        },
        { status: 400 }
      );
    }

    for (const detalle of detalles) {
      const productoId = Number(detalle.productoId);
      const cantidad = Number(detalle.cantidad);
      const precioUnitario = Number(detalle.precioUnitario);

      if (
        !Number.isInteger(productoId) ||
        productoId <= 0
      ) {
        return Response.json(
          { error: "El producto no es válido" },
          { status: 400 }
        );
      }

      if (
        !Number.isInteger(cantidad) ||
        cantidad <= 0
      ) {
        return Response.json(
          { error: "La cantidad no es válida" },
          { status: 400 }
        );
      }

      if (
        !Number.isFinite(precioUnitario) ||
        precioUnitario < 0
      ) {
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
          {
            error: `El producto ${productoId} no existe`,
          },
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
          Number(detalle.cantidad) *
            Number(detalle.precioUnitario)
        );
      },
      0
    );

    if (metodoPago === "EFECTIVO") {
      const recibido = Number(montoRecibido);

      if (
        !Number.isFinite(recibido) ||
        recibido < total
      ) {
        return Response.json(
          {
            error:
              "El monto recibido no es suficiente",
          },
          { status: 400 }
        );
      }
    }

    const resultado = await prisma.$transaction(
      async (tx) => {
        const secuencia =
          await tx.secuenciaDocumento.update({
            where: {
              serie: "F001",
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
            clienteId: Number(clienteId),

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
              create: detalles.map(
                (detalle: any) => ({
                  productoId: Number(
                    detalle.productoId
                  ),
                  cantidad: Number(
                    detalle.cantidad
                  ),

                  precioUnitario:
                    Number(
                      detalle.precioUnitario
                    ),

                  subtotal:
                    Number(
                      detalle.cantidad
                    ) *
                    Number(
                      detalle.precioUnitario
                    ),
                })
              ),
            },

            documento: {
              create: {
                tipo: "FACTURA",
                serie: "F001",
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
      }
    );

    const documento = resultado.documento;

    const items = resultado.detalles.map(
      (detalle) => {
        const precioFinal = Number(
          detalle.precioUnitario
        );

        const valorUnitario =
          precioFinal / 1.18;

        return {
          unidad_de_medida: "NIU",

          descripcion:
            detalle.producto.nombre,

          cantidad: String(
            detalle.cantidad
          ),

          valor_unitario:
            valorUnitario.toFixed(6),

          porcentaje_igv: "18",

          codigo_tipo_afectacion_igv:
            "10",

          nombre_tributo: "IGV",
        };
      }
    );

    const fechaHoy =
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Lima",
      }).format(new Date());

    const payloadLuCode = {
      documento: "factura",
      serie: documento.serie,
      numero: documento.numero,
      fecha_de_emision: fechaHoy,
      moneda: "PEN",
      tipo_operacion: "0101",
      cliente_tipo_de_documento: "6",
      cliente_numero_de_documento: cliente.ruc,
      cliente_denominacion: cliente.nombre,
      cliente_direccion: cliente.direccion ?? "-",

      items,

      total: total.toFixed(2),
    };

    console.log(
      "PAYLOAD FACTURA LUCODE:",
      payloadLuCode
    );

    const respuestaLuCode = await fetch(
      process.env.LUCODE_API_URL!,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${process.env.LUCODE_TOKEN}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify(
          payloadLuCode
        ),
      }
    );

    const resultadoLuCode =
      await respuestaLuCode.json();

    console.log(
      "RESPUESTA FACTURA LUCODE:",
      resultadoLuCode
    );

    const estadoLuCode =
      resultadoLuCode?.payload?.estado;

    if (
      respuestaLuCode.ok &&
      resultadoLuCode?.success === true &&
      estadoLuCode === "ACEPTADO"
    ) {
      await prisma.documento.update({
        where: {
          id: documento.id,
        },

        data: {
          estado: "EMITIDO",

          codigoRespuesta:
            resultadoLuCode?.payload?.hash ??
            null,

          mensajeRespuesta:
            resultadoLuCode?.message ??
            null,
        },
      });

      const ventaFinal =
        await prisma.venta.findUnique({
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

          message:
            "Factura emitida correctamente",

          venta: ventaFinal,

          estado: "EMITIDO",

          respuestaLuCode:
            resultadoLuCode,
        },
        { status: 201 }
      );
    }

    if (
      respuestaLuCode.ok &&
      resultadoLuCode?.success === true &&
      estadoLuCode === "PENDIENTE"
    ) {
      await prisma.documento.update({
        where: {
          id: documento.id,
        },

        data: {
          estado: "PENDIENTE",

          codigoRespuesta:
            resultadoLuCode?.payload?.hash ??
            null,

          mensajeRespuesta:
            resultadoLuCode?.message ??
            null,
        },
      });

      return Response.json(
        {
          success: true,

          message:
            "La factura fue enviada y está pendiente de aceptación por SUNAT",

          ventaId: resultado.id,
          documentoId: documento.id,
          serie: documento.serie,
          numero: documento.numero,
          estado: "PENDIENTE",
          respuestaLuCode:
            resultadoLuCode,
        },
        { status: 202 }
      );
    }

    await prisma.documento.update({
      where: {
        id: documento.id,
      },

      data: {
        estado: "RECHAZADO",

        codigoRespuesta:
          resultadoLuCode?.payload
            ?.codigo ?? null,

        mensajeRespuesta:
          resultadoLuCode?.message ??
          "La factura fue rechazada",
      },
    });

    return Response.json(
      {
        success: false,

        message:
          "La factura fue rechazada",

        ventaId: resultado.id,
        documentoId: documento.id,
        serie: documento.serie,
        numero: documento.numero,
        estado: "RECHAZADO",
        respuestaLuCode:
          resultadoLuCode,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error:
          "Error al procesar la factura",
      },
      { status: 500 }
    );
  }
}