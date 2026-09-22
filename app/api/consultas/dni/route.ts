import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const dni = searchParams.get("dni");

    if (!dni) {
      return NextResponse.json(
        {
          success: false,
          message: "Debes proporcionar un DNI",
        },
        { status: 400 }
      );
    }

    if (!/^\d{8}$/.test(dni)) {
      return NextResponse.json(
        {
          success: false,
          message: "El DNI debe tener 8 dígitos",
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
      `https://dev.apisunat.pe/api/v1/person/dni/${dni}`,
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
            "No se pudo consultar el DNI",
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
            "No se encontraron datos para el DNI",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.payload,
    });
  } catch (error) {
    console.error("Error consultando DNI:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error al consultar el DNI",
      },
      { status: 500 }
    );
  }
}