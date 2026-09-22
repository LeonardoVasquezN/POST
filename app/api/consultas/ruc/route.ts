import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const ruc = searchParams.get("ruc");

    if (!ruc) {
      return NextResponse.json(
        {
          success: false,
          message: "Debes proporcionar un RUC",
        },
        { status: 400 }
      );
    }

    if (!/^\d{11}$/.test(ruc)) {
      return NextResponse.json(
        {
          success: false,
          message: "El RUC debe tener 11 dígitos",
        },
        { status: 400 }
      );
    }

    const token = process.env.LUCODE_TOKEN;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "No está configurado LUCODE_TOKEN",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://dev.apisunat.pe/api/v1/business/ruc/${ruc}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            data.message ||
            "No se pudo consultar el RUC",
        },
        { status: response.status }
      );
    }

    if (!data.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            data.message ||
            "No se encontraron datos para el RUC",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.payload,
    });
  } catch (error) {
    console.error("Error consultando RUC:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error al consultar el RUC",
      },
      { status: 500 }
    );
  }
}