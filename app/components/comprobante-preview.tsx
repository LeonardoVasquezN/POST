"use client";

import { QRCodeSVG } from "qrcode.react";

type ComprobantePreviewProps = {
  venta: any;
};

export default function ComprobantePreview({
  venta,
}: ComprobantePreviewProps) {
  const documento = venta.documento;
  const cliente = venta.cliente;

  const esNota = documento.tipo === "NOTA";
  const esBoleta = documento.tipo === "BOLETA";
  const esFactura = documento.tipo === "FACTURA";

  const total = Number(venta.total);
  const valorVenta = total / 1.18;
  const igv = total - valorVenta;

  const numeroDocumento = String(documento.numero).padStart(
    6,
    "0"
  );

  const fechaEmision = documento.fechaEmision
    ? new Date(documento.fechaEmision).toLocaleDateString(
        "es-PE"
      )
    : "";

  const razonSocial =
    "CAPRICHOS SHOP";

  const rucEmisor = "10181328849";
  const hash = documento.codigoRespuesta ?? "";

  const tipoDocumentoSunat = esBoleta
    ? "03"
    : esFactura
    ? "01"
    : "";

  let tipoDocumentoCliente = "";
  let numeroDocumentoCliente = "";

  if (cliente?.ruc) {
    tipoDocumentoCliente = "6";
    numeroDocumentoCliente = cliente.ruc;
  } else if (cliente?.dni) {
    tipoDocumentoCliente = "1";
    numeroDocumentoCliente = cliente.dni;
  }

  const qrData =
    esBoleta || esFactura
      ? [
          rucEmisor,
          tipoDocumentoSunat,
          documento.serie,
          numeroDocumento,
          igv.toFixed(2),
          total.toFixed(2),
          documento.fechaEmision
            ? new Date(documento.fechaEmision)
                .toISOString()
                .slice(0, 10)
            : "",
          tipoDocumentoCliente,
          numeroDocumentoCliente,
          hash,
        ].join("|")
      : "";

  return (
   <div
    id="comprobante"
    className="mx-auto box-border w-[72mm] bg-white px-[2mm] py-[4mm] text-black"
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >

      <div className="text-center">
        <p className="text-[13px] font-bold leading-tight">
          {razonSocial}
        </p>

        <p className="mt-1 text-[10px]">
          RUC: {rucEmisor}
        </p>

        <p className="mt-4 text-[13px] font-bold">
          {esNota
            ? "NOTA DE VENTA"
            : esBoleta
            ? "BOLETA DE VENTA"
            : esFactura
            ? "FACTURA ELECTRÓNICA"
            : ""}
        </p>

        <p className="text-[13px] font-bold">
          {documento.serie}-{numeroDocumento}
        </p>
      </div>

      <div className="my-3 border-t border-gray-500" />

      <div className="text-[10px] leading-[1.35]">
        <p>
          <span className="font-bold">Cliente:</span>{" "}
          {cliente?.nombre ?? ""}
        </p>

        {cliente?.dni && (
          <p>
            <span className="font-bold">DNI:</span>{" "}
            {cliente.dni}
          </p>
        )}

        {cliente?.ruc && (
          <p>
            <span className="font-bold">RUC:</span>{" "}
            {cliente.ruc}
          </p>
        )}

        {documento.fechaEmision && (
          <p>
            <span className="font-bold">Fecha:</span>{" "}
            {fechaEmision}
          </p>
        )}
      </div>

      <div className="text-[9px]">
        <span className="block mt-4 font-bold text-black">Detalle</span>
        <div className="my-3 border-t border-dashed border-gray-500" />
        <div className="grid grid-cols-[1fr_28px_42px_48px] gap-1 border-b border-dotted border-gray-500 pb-1">
          <span className="font-bold text-black">Cant</span>

          <span className="text-center font-bold text-black">
            U.M
          </span>

          <span className="text-center font-bold text-black">
            Precio
          </span>

          <span className="text-right font-bold text-black">
            Total
          </span>
        </div>

        {venta.detalles.map((detalle: any) => {
          const cantidad = Number(
            detalle.cantidad
          );

          const precioUnitario = Number(
            detalle.precioUnitario
          );

          const subtotal = Number(
            detalle.subtotal
          );

          return (
            <div
              key={detalle.id}
              className="border-b border-dotted border-gray-400 py-[4px]"
            >
              <div className="mb-[2px]">
                {detalle.producto.nombre}
              </div>

              <div className="grid grid-cols-[1fr_28px_42px_48px] gap-1">
                <span>
                  {cantidad} 
                </span>

                <span className="text-center">
                  NIU
                </span>

                <span className="text-right">
                  {precioUnitario.toFixed(2)}
                </span>

                <span className="text-right">
                  {subtotal.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {(esBoleta || esFactura) && (
        <div className="mt-4 block text-[10px]">
          <div className="flex justify-between">
            <span>
              Total Gravado (S/):
            </span>

            <span>
              {valorVenta.toFixed(2)}
            </span>
          </div>

          <div className="mt-1 flex justify-between">
            <span>
              IGV 18.00% (S/):
            </span>

            <span>
              {igv.toFixed(2)}
            </span>
          </div>

          <div className="mt-1 flex justify-between font-bold">
            <span>
              Total (S/):
            </span>

            <span>
              {total.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {esNota && (
        <div className="mt-4 flex justify-between text-[11px] font-bold">
          <span>
            TOTAL (S/):
          </span>

          <span>
            {total.toFixed(2)}
          </span>
        </div>
      )}

      {(esBoleta || esFactura) && (
        <p className="mt-3 text-[9px] font-medium uppercase leading-tight">
          SON: {numeroALetras(total)}
        </p>
      )}

      <div className="mt-3 text-[9px]">
        <p>
          <span className="font-bold">
            Cond. Venta:
          </span>{" "}
          Contado
        </p>
      </div>

      {(esBoleta || esFactura) && hash && (
        <>
          <div className="mt-4 flex justify-center">
            <QRCodeSVG
              value={qrData}
              size={105}
              level="Q"
              includeMargin={false}
            />
          </div>

          <div className="mt-2 text-center text-[8px] leading-tight">
            <p>
              <span className="font-bold">Hash:</span>
            </p>

            <p className="break-all">
              {hash}
            </p>
          </div>

          <div className="mt-2 text-center text-[8px] leading-tight">
            <p>
              Representación Impresa de la
            </p>

            <p>
              BOLETA DE VENTA ELECTRÓNICA
            </p>

            <p className="mt-1">
              Puede consultar en: www.apisunat.pe
            </p>

            <p>
              Autorizado con Resolución N°034-005
            </p>

            <p>
              0012997/SUNAT
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function numeroALetras(numero: number): string {
  const entero = Math.floor(numero);

  const centimos = Math.round(
    (numero - entero) * 100
  );

  return `${convertirNumero(
    entero
  )} CON ${String(centimos).padStart(
    2,
    "0"
  )}/100 SOLES`;
}

function convertirNumero(
  numero: number
): string {
  if (numero === 0) return "CERO";

  const unidades = [
    "",
    "UNO",
    "DOS",
    "TRES",
    "CUATRO",
    "CINCO",
    "SEIS",
    "SIETE",
    "OCHO",
    "NUEVE",
  ];

  const especiales = [
    "DIEZ",
    "ONCE",
    "DOCE",
    "TRECE",
    "CATORCE",
    "QUINCE",
    "DIECISÉIS",
    "DIECISIETE",
    "DIECIOCHO",
    "DIECINUEVE",
  ];

  const decenas = [
    "",
    "",
    "VEINTE",
    "TREINTA",
    "CUARENTA",
    "CINCUENTA",
    "SESENTA",
    "SETENTA",
    "OCHENTA",
    "NOVENTA",
  ];

  if (numero < 10) {
    return unidades[numero];
  }

  if (numero < 20) {
    return especiales[numero - 10];
  }

  if (numero < 100) {
    const d = Math.floor(numero / 10);
    const u = numero % 10;

    if (d === 2 && u > 0) {
      return `VEINTI${unidades[u]}`;
    }

    return (
      decenas[d] +
      (u > 0
        ? ` Y ${unidades[u]}`
        : "")
    );
  }

  if (numero < 1000) {
    const centenas = [
      "",
      "CIENTO",
      "DOSCIENTOS",
      "TRESCIENTOS",
      "CUATROCIENTOS",
      "QUINIENTOS",
      "SEISCIENTOS",
      "SETECIENTOS",
      "OCHOCIENTOS",
      "NOVECIENTOS",
    ];

    if (numero === 100) {
      return "CIEN";
    }

    const c = Math.floor(numero / 100);
    const resto = numero % 100;

    return (
      centenas[c] +
      (resto > 0
        ? ` ${convertirNumero(resto)}`
        : "")
    );
  }

  if (numero < 1000000) {
    const miles = Math.floor(
      numero / 1000
    );

    const resto = numero % 1000;

    const textoMiles =
      miles === 1
        ? "MIL"
        : `${convertirNumero(
            miles
          )} MIL`;

    return (
      textoMiles +
      (resto > 0
        ? ` ${convertirNumero(resto)}`
        : "")
    );
  }

  return String(numero);
}