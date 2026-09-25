import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      ventaId,
      transportistaId,
      fechaEntregaTransportista,
      motivoTraslado,
      puntoPartidaUbigeo,
      puntoPartidaDireccion,
      puntoLlegadaUbigeo,
      puntoLlegadaDireccion,
      pesoBrutoTotal,
      numeroBultos,
      observaciones,
    } = body;

    if (!ventaId || !transportistaId) {
      return NextResponse.json(
        {
          error: "La venta y el transportista son obligatorios",
        },
        { status: 400 }
      );
    }

    if (
      !fechaEntregaTransportista ||
      !motivoTraslado ||
      !puntoPartidaUbigeo ||
      !puntoPartidaDireccion ||
      !puntoLlegadaUbigeo ||
      !puntoLlegadaDireccion ||
      !pesoBrutoTotal ||
      !numeroBultos
    ) {
      return NextResponse.json(
        {
          error: "Completa todos los campos obligatorios",
        },
        { status: 400 }
      );
    }

    const ventaIdNumero = Number(ventaId);
    const transportistaIdNumero = Number(transportistaId);

    if (isNaN(ventaIdNumero) || isNaN(transportistaIdNumero)) {
      return NextResponse.json(
        {
          error: "La venta o el transportista no son válidos",
        },
        { status: 400 }
      );
    }

    const peso = Number(pesoBrutoTotal);
    const bultos = Number(numeroBultos);

    if (!Number.isFinite(peso) || peso <= 0) {
      return NextResponse.json(
        {
          error: "El peso bruto total debe ser mayor que 0.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(bultos) || bultos <= 0) {
      return NextResponse.json(
        {
          error:
            "El número de bultos debe ser un número entero mayor que 0.",
        },
        { status: 400 }
      );
    }

    const partidaUbigeo = String(puntoPartidaUbigeo).trim();
    const llegadaUbigeo = String(puntoLlegadaUbigeo).trim();

    if (!/^\d{6}$/.test(partidaUbigeo)) {
      return NextResponse.json(
        {
          error:
            "El ubigeo del punto de partida debe tener exactamente 6 dígitos.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(llegadaUbigeo)) {
      return NextResponse.json(
        {
          error:
            "El ubigeo del punto de llegada debe tener exactamente 6 dígitos.",
        },
        { status: 400 }
      );
    }

    const partidaDireccion = String(
      puntoPartidaDireccion
    ).trim();

    const llegadaDireccion = String(
      puntoLlegadaDireccion
    ).trim();

    if (partidaDireccion.length < 5) {
      return NextResponse.json(
        {
          error:
            "La dirección del punto de partida es demasiado corta.",
        },
        { status: 400 }
      );
    }

    if (llegadaDireccion.length < 5) {
      return NextResponse.json(
        {
          error:
            "La dirección del punto de llegada es demasiado corta.",
        },
        { status: 400 }
      );
    }

    const venta = await prisma.venta.findUnique({
      where: {
        id: ventaIdNumero,
      },
      include: {
        cliente: true,
        detalles: {
          include: {
            producto: true,
          },
        },
        documento: true,
        guiaRemision: true,
      },
    });

    if (!venta) {
      return NextResponse.json(
        {
          error: "Venta no encontrada",
        },
        { status: 404 }
      );
    }

    if (venta.detalles.length === 0) {
      return NextResponse.json(
        {
          error:
            "La venta no tiene productos. No se puede generar la guía de remisión.",
        },
        { status: 400 }
      );
    }

    if (
      !venta.documento ||
      (venta.documento.tipo !== "BOLETA" &&
        venta.documento.tipo !== "FACTURA")
    ) {
      return NextResponse.json(
        {
          error:
            "Solo se puede generar una guía de remisión para una boleta o factura.",
        },
        { status: 400 }
      );
    }

    const hoy = new Date();

    const fechaHoy = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate()
    );

    const [año, mes, dia] =
      String(fechaEntregaTransportista)
        .split("-")
        .map(Number);

    const fechaEntrega = new Date(
      año,
      mes - 1,
      dia
    );

    if (
      Number.isNaN(fechaEntrega.getTime()) ||
      fechaEntrega < fechaHoy
    ) {
      return NextResponse.json(
        {
          error:
            "La fecha de entrega al transportista no puede ser anterior a hoy.",
        },
        { status: 400 }
      );
    }

    if (!venta.cliente) {
      return NextResponse.json(
        {
          error:
            "La venta no tiene un cliente asociado. No se puede generar la guía de remisión.",
        },
        { status: 400 }
      );
    }

    if (!venta.cliente.ruc && !venta.cliente.dni) {
      return NextResponse.json(
        {
          error:
            "El cliente debe tener DNI o RUC para generar la guía de remisión.",
        },
        { status: 400 }
      );
    }

    if (venta.guiaRemision) {
      return NextResponse.json(
        {
          error: "Esta venta ya tiene una guía de remisión.",
        },
        { status: 409 }
      );
    }

    const transportista = await prisma.transportista.findUnique({
      where: {
        id: transportistaIdNumero,
      },
    });

    if (!transportista) {
      return NextResponse.json(
        {
          error: "Transportista no encontrado",
        },
        { status: 404 }
      );
    }

    if (!transportista.activo) {
      return NextResponse.json(
        {
          error: "El transportista seleccionado está inactivo.",
        },
        { status: 400 }
      );
    }

    const configuracion = await prisma.configuracion.findFirst();

    if (!configuracion) {
      return NextResponse.json(
        {
          error:
            "No existe una configuración del negocio registrada.",
        },
        { status: 400 }
      );
    }

    const serie = "T001";

    const secuencia = await prisma.secuenciaGuiaRemision.findUnique({
      where: {
        serie,
      },
    });

    let numero: number;

    if (!secuencia) {
      numero = 1;

      await prisma.secuenciaGuiaRemision.create({
        data: {
          serie,
          siguiente: 2,
        },
      });
    } else {
      numero = secuencia.siguiente;

      await prisma.secuenciaGuiaRemision.update({
        where: {
          serie,
        },
        data: {
          siguiente: {
            increment: 1,
          },
        },
      });
    }

    const destinatarioTipoDocumento = venta.cliente.ruc
      ? "6"
      : "1";

    const destinatarioNumeroDocumento = venta.cliente.ruc
      ? venta.cliente.ruc
      : venta.cliente.dni!;

    const items = venta.detalles.map((detalle) => ({
      codigo_interno: detalle.producto.id.toString(),
      descripcion: detalle.producto.nombre,
      unidad_de_medida: "NIU",
      cantidad: detalle.cantidad,
    }));

    const documentosRelacionados = venta.documento
      ? [
          {
            documento:
              venta.documento.tipo === "FACTURA"
                ? "factura"
                : "boleta",
            serie: venta.documento.serie,
            numero: venta.documento.numero,
            ruc_emisor: configuracion.ruc,
          },
        ]
      : [];

    const ahora = new Date();

    const fechaEmision = ahora.toISOString().split("T")[0];

    const horaEmision = ahora
      .toTimeString()
      .split(" ")[0];

    const payload = {
      documento: "guia_remision_remitente",
      serie,
      numero: numero.toString(),
      fecha_de_emision: fechaEmision,
      hora_de_emision: horaEmision,
      motivo_de_traslado: motivoTraslado,
      modalidad_de_transporte: "01",
      fecha_entrega_a_transportista: fechaEntregaTransportista,
      destinatario_tipo_de_documento: destinatarioTipoDocumento,
      destinatario_numero_de_documento: destinatarioNumeroDocumento,
      destinatario_denominacion: venta.cliente.nombre,
      destinatario_direccion: venta.cliente.direccion || "",
      punto_de_partida_ubigeo: partidaUbigeo,
      punto_de_partida_direccion: partidaDireccion,
      punto_de_llegada_ubigeo: llegadaUbigeo,
      punto_de_llegada_direccion: llegadaDireccion,
      peso_bruto_total: peso.toString(),
      peso_bruto_unidad_de_medida: "KGM",
      numero_de_bultos: bultos,
      observaciones: observaciones || "",

      transportista: {
        ruc: transportista.ruc,
        denominacion:transportista.denominacion,
        numero_registro_MTC:transportista.numeroRegistroMTC,
        numero_autorizacion:transportista.numeroAutorizacion,
        codigo_entidad_autorizadora:transportista.codigoEntidadAutorizadora,
      },

      documentos_relacionados: documentosRelacionados,
      items,
    };

    const token = process.env.LUCODE_TOKEN;
    if (!token) {
      return NextResponse.json(
        {
          error:
            "No está configurado LUCODE_TOKEN en las variables de entorno.",
        },
        { status: 500 }
      );
    }

    console.log("PAYLOAD GUIA:", JSON.stringify(payload, null, 2));

    const respuestaApi = await fetch(
      "https://sandbox.apisunat.pe/api/v3/dispatches",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(payload),
      }
    );

    const dataApi = await respuestaApi.json();

    if (!respuestaApi.ok || !dataApi.success) {
      console.error(
        "Error APISUNAT:",
        dataApi
      );

      return NextResponse.json(
        {
          error:
            dataApi.message ||
            "APISUNAT rechazó la guía de remisión.",
          detalle: dataApi,
        },
        {
          status: respuestaApi.status || 400,
        }
      );
    }

    const guiaRemision = await prisma.guiaRemision.create({
      data: {
        ventaId: venta.id,
        transportistaId:transportista.id,
        serie,
        numero,
        fechaEmision: new Date(),
        horaEmision,
        fechaEntregaTransportista: fechaEntrega,
        motivoTraslado,
        modalidadTransporte: "01",
        destinatarioId: venta.cliente.id,
        destinatarioTipoDocumento,
        destinatarioNumeroDocumento,
        destinatarioDenominacion: venta.cliente.nombre,
        destinatarioDireccion: venta.cliente.direccion || null,
        puntoPartidaUbigeo: partidaUbigeo,
        puntoPartidaDireccion: partidaDireccion,
        puntoLlegadaUbigeo: llegadaUbigeo,
        puntoLlegadaDireccion: llegadaDireccion,
        pesoBrutoTotal: peso,
        numeroBultos: bultos,
        observaciones: observaciones || null,
        estado: "EMITIDA",
        hash: dataApi.payload?.hash || null,
        xml: dataApi.payload?.xml || null,
        cdr: dataApi.payload?.cdr || null,
        codigoRespuesta: null,
        mensajeRespuesta: dataApi.message || null,

        detalles: {
          create: venta.detalles.map(
            (detalle) => ({
              productoId: detalle.producto.id,
              codigoInterno: detalle.producto.id.toString(),
              descripcion: detalle.producto.nombre,
              unidadMedida: "NIU",
              cantidad: detalle.cantidad,
            })
          ),
        },
      },

      include: {
        detalles: true,
        transportista: true,
      },
    });

    return NextResponse.json(
      {
        success: true,

        message:
          dataApi.message ||
          "Guía de remisión generada correctamente.",

        guiaRemision,

        api: dataApi,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Error al generar guía de remisión:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Error interno al generar la guía de remisión.",
      },
      {
        status: 500,
      }
    );
  }
}