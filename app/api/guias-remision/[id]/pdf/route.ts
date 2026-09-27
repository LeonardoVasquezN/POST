import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const guiaId = Number(id);

    if (!Number.isInteger(guiaId) || guiaId <= 0) {
      return NextResponse.json(
        {
          error: "El ID de la guía no es válido.",
        },
        { status: 400 }
      );
    }

    const guia = await prisma.guiaRemision.findUnique({
      where: {
        id: guiaId,
      },
      select: {
        serie: true,
        numero: true,
        estado: true,
        pdfUrl: true,
      },
    });

    if (!guia) {
      return NextResponse.json(
        {
          error: "Guía de remisión no encontrada.",
        },
        { status: 404 }
      );
    }

    if (!guia.pdfUrl) {
      return NextResponse.json(
        {
          error: "Esta guía no tiene un PDF disponible.",
        },
        { status: 404 }
      );
    }

    const respuestaPdf = await fetch(guia.pdfUrl);

    if (!respuestaPdf.ok) {
      return NextResponse.json(
        {
          error: "No se pudo obtener el PDF de la guía.",
        },
        { status: 502 }
      );
    }

    const pdf = await respuestaPdf.arrayBuffer();

    const nombreArchivo = `${guia.serie}-${String(
      guia.numero
    ).padStart(6, "0")}.pdf`;

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
      },
    });
  } catch (error) {
    console.error(
      "Error al descargar PDF de la guía:",
      error
    );

    return NextResponse.json(
      {
        error: "Error interno al descargar el PDF.",
      },
      { status: 500 }
    );
  }
}