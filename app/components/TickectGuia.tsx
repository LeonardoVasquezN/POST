import { QRCodeSVG } from "qrcode.react";

type TicketGuiaProps = {
  guia: {
    pdfUrl: string | null;

    serie: string;
    numero: number;

    fechaEmision: string;
    horaEmision: string;
    fechaEntregaTransportista: string;

    motivoTraslado: string;
    modalidadTransporte: string;

    destinatarioTipoDocumento: string;
    destinatarioNumeroDocumento: string;
    destinatarioDenominacion: string;
    destinatarioDireccion: string | null;

    puntoPartidaDireccion: string;
    puntoLlegadaDireccion: string;

    pesoBrutoTotal: string | number;
    pesoBrutoUnidadMedida: string;
    numeroBultos: number;

    observaciones: string | null;

    venta: {
      documento: {
        tipo: string;
        serie: string;
        numero: number;
      } | null;
    };

    transportista: {
      ruc: string;
      denominacion: string;
      numeroRegistroMTC: string;
      numeroAutorizacion: string;
    };

    detalles: {
      codigoInterno: string;
      descripcion: string;
      unidadMedida: string;
      cantidad: number;
    }[];
  };
};

export default function TicketGuia({
  guia,
}: TicketGuiaProps) {
  const numeroGuia = `${guia.serie}-${String(
    guia.numero
  ).padStart(6, "0")}`;

  const fechaEmision = new Date(
    guia.fechaEmision
  ).toLocaleDateString("es-PE");

  const fechaEntrega = new Date(
    guia.fechaEntregaTransportista
  ).toLocaleDateString("es-PE");

  const motivoTraslado =
    guia.motivoTraslado === "01"
      ? "Venta"
      : guia.motivoTraslado;

  const modalidadTransporte =
    guia.modalidadTransporte === "01"
      ? "Transporte público"
      : guia.modalidadTransporte;

  return (
    <div
      id="ticket-guia"
      className="mx-auto w-[80mm] bg-white px-3 py-4 text-black"
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "11px",
        lineHeight: "1.35",
      }}
    >
      <div className="text-center">
        <p className="text-[10px] font-bold tracking-widest">
          DOCUMENTO ELECTRÓNICO
        </p>

        <h1 className="mt-1 text-[17px] font-bold">
          GUÍA DE REMISIÓN
        </h1>

        <p className="mt-1 text-[14px] font-bold">
          {numeroGuia}
        </p>
      </div>

      <div className="my-3 border-t-2 border-black" />

      <section>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide">
          Datos de la guía
        </p>

        <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
          <span className="font-bold">Fecha:</span>
          <span>{fechaEmision}</span>

          <span className="font-bold">Hora:</span>
          <span>{guia.horaEmision}</span>

          <span className="font-bold">Entrega:</span>
          <span>{fechaEntrega}</span>

          <span className="font-bold">Motivo:</span>
          <span>{motivoTraslado}</span>

          <span className="font-bold">Transporte:</span>
          <span>{modalidadTransporte}</span>
        </div>
      </section>

      <div className="my-3 border-t border-black" />

      <section>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide">
          Comprobante relacionado
        </p>

        {guia.venta.documento ? (
          <p className="font-bold">
            {guia.venta.documento.tipo}:{" "}
            {guia.venta.documento.serie}-
            {String(
              guia.venta.documento.numero
            ).padStart(6, "0")}
          </p>
        ) : (
          <p>Sin comprobante relacionado</p>
        )}
      </section>

      <div className="my-3 border-t border-black" />

      <section>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide">
          Destinatario
        </p>

        <p className="font-bold">
          {guia.destinatarioDenominacion}
        </p>

        <p className="mt-1">
          {guia.destinatarioTipoDocumento === "6"
            ? "RUC"
            : "DNI"}
          : {guia.destinatarioNumeroDocumento}
        </p>

        <p className="mt-1">
          <span className="font-bold">Dirección:</span>{" "}
          {guia.destinatarioDireccion ||
            "Sin dirección"}
        </p>
      </section>

      <div className="my-3 border-t border-black" />

      <section>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide">
          Transportista
        </p>

        <p className="font-bold">
          {guia.transportista.denominacion}
        </p>

        <div className="mt-1">
          <p>
            <span className="font-bold">RUC:</span>{" "}
            {guia.transportista.ruc}
          </p>

          <p>
            <span className="font-bold">
              Registro MTC:
            </span>{" "}
            {guia.transportista.numeroRegistroMTC}
          </p>

          <p>
            <span className="font-bold">
              Autorización:
            </span>{" "}
            {guia.transportista.numeroAutorizacion}
          </p>
        </div>
      </section>

      <div className="my-3 border-t border-black" />

      <section>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide">
          Traslado
        </p>

        <div>
          <p className="font-bold">
            PARTIDA
          </p>

          <p className="mt-1">
            {guia.puntoPartidaDireccion}
          </p>
        </div>

        <div className="mt-3">
          <p className="font-bold">
            LLEGADA
          </p>

          <p className="mt-1">
            {guia.puntoLlegadaDireccion}
          </p>
        </div>
      </section>

      <div className="my-3 border-t border-black" />

      <section>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide">
          Productos
        </p>

        {guia.detalles.map((detalle) => (
          <div
            key={detalle.codigoInterno}
            className="mb-3"
          >
            <p className="font-bold">
              {detalle.descripcion}
            </p>

            <div className="mt-1 flex justify-between gap-2">
              <span>
                Código: {detalle.codigoInterno}
              </span>

              <span className="font-bold">
                {detalle.cantidad}{" "}
                {detalle.unidadMedida}
              </span>
            </div>
          </div>
        ))}
      </section>

      <div className="my-3 border-t border-black" />

      <section>
        <div className="flex justify-between">
          <span className="font-bold">
            Peso bruto:
          </span>

          <span>
            {guia.pesoBrutoTotal}{" "}
            {guia.pesoBrutoUnidadMedida}
          </span>
        </div>

        <div className="mt-1 flex justify-between">
          <span className="font-bold">
            Bultos:
          </span>

          <span>{guia.numeroBultos}</span>
        </div>
      </section>

      <section className="mt-3">
        <p className="font-bold">
          Observaciones:
        </p>

        <p className="mt-1">
          {guia.observaciones ||
            "Sin observaciones"}
        </p>
      </section>

      <div className="my-4 border-t-2 border-black" />

      <div className="text-center">
        <p className="font-bold">
          GUÍA DE REMISIÓN ELECTRÓNICA
        </p>

        <p className="mt-1">
          Representación impresa
        </p>

        {guia.pdfUrl && (
          <div className="mt-3 flex justify-center">
            <QRCodeSVG
              value={guia.pdfUrl}
              size={120}
              level="M"
            />
          </div>
        )}

        <p className="mt-2 text-[13px] font-bold">
          {numeroGuia}
        </p>

        <p className="mt-2 text-[9px]">
          Documento generado electrónicamente
        </p>
      </div>
    </div>
  );
}