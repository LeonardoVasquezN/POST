// import { QRCodeSVG } from "qrcode.react";

// type TicketGuiaProps = {
//   guia: {
//     pdfUrl: string | null;

//     serie: string;
//     numero: number;

//     fechaEmision: string;
//     horaEmision: string;
//     fechaEntregaTransportista: string | null;

//     motivoTraslado: string;
//     modalidadTransporte: string;

//     destinatarioTipoDocumento: string;
//     destinatarioNumeroDocumento: string;
//     destinatarioDenominacion: string;
//     destinatarioDireccion: string | null;

//     puntoPartidaDireccion: string;
//     puntoLlegadaDireccion: string;

//     pesoBrutoTotal: string | number;
//     pesoBrutoUnidadMedida: string;
//     numeroBultos: number;

//     observaciones: string | null;

//     venta: {
//       documento: {
//         tipo: string;
//         serie: string;
//         numero: number;
//       } | null;
//     };

//     transportista: {
//       ruc: string;
//       denominacion: string;
//       numeroRegistroMTC: string;
//       numeroAutorizacion: string;
//     } | null;

//     detalles: {
//       codigoInterno: string;
//       descripcion: string;
//       unidadMedida: string;
//       cantidad: number;
//     }[];
//   };
// };

// export default function TicketGuia({
//   guia,
// }: TicketGuiaProps) {
//   const numeroGuia = `${guia.serie}-${String(
//     guia.numero
//   ).padStart(6, "0")}`;

//   const fechaEmision = new Date(
//     guia.fechaEmision
//   ).toLocaleDateString("es-PE");

//   const fechaEntrega = guia.fechaEntregaTransportista
//   ? new Date(
//       guia.fechaEntregaTransportista
//     ).toLocaleDateString("es-PE")
//   : null;

//   const motivoTraslado =
//     guia.motivoTraslado === "01"
//       ? "Venta"
//       : guia.motivoTraslado;

//   const modalidadTransporte =
//     guia.modalidadTransporte === "01"
//       ? "Transporte público"
//       : guia.modalidadTransporte;

//   return (
//     <div
//       id="ticket-guia"
//       className="mx-auto w-[80mm] bg-white px-3 py-4 text-black"
//       style={{
//         fontFamily: "Arial, Helvetica, sans-serif",
//         fontSize: "11px",
//         lineHeight: "1.35",
//       }}
//     >
//       <div className="text-center">
//         <p className="text-[10px] font-bold tracking-widest">
//           DOCUMENTO ELECTRÓNICO
//         </p>

//         <h1 className="mt-1 text-[17px] font-bold">
//           GUÍA DE REMISIÓN
//         </h1>

//         <p className="mt-1 text-[14px] font-bold">
//           {numeroGuia}
//         </p>
//       </div>

//       <div className="my-3 border-t-2 border-black" />

//       <section>
//         <p className="mb-2 text-[11px] font-bold uppercase tracking-wide">
//           Datos de la guía
//         </p>

//         <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
//           <span className="font-bold">Fecha:</span>
//           <span>{fechaEmision}</span>

//           <span className="font-bold">Hora:</span>
//           <span>{guia.horaEmision}</span>

//           <span className="font-bold">Entrega:</span>
//           <span>{fechaEntrega || "No aplica"}</span>

//           <span className="font-bold">Motivo:</span>
//           <span>{motivoTraslado}</span>

//           <span className="font-bold">Transporte:</span>
//           <span>{modalidadTransporte}</span>
//         </div>
//       </section>

//       <div className="my-3 border-t border-black" />

//       <section>
//         <p className="mb-2 text-[11px] font-bold uppercase tracking-wide">
//           Comprobante relacionado
//         </p>

//         {guia.venta.documento ? (
//           <p className="font-bold">
//             {guia.venta.documento.tipo}:{" "}
//             {guia.venta.documento.serie}-
//             {String(
//               guia.venta.documento.numero
//             ).padStart(6, "0")}
//           </p>
//         ) : (
//           <p>Sin comprobante relacionado</p>
//         )}
//       </section>

//       <div className="my-3 border-t border-black" />

//       <section>
//         <p className="mb-2 text-[11px] font-bold uppercase tracking-wide">
//           Destinatario
//         </p>

//         <p className="font-bold">
//           {guia.destinatarioDenominacion}
//         </p>

//         <p className="mt-1">
//           {guia.destinatarioTipoDocumento === "6"
//             ? "RUC"
//             : "DNI"}
//           : {guia.destinatarioNumeroDocumento}
//         </p>

//         <p className="mt-1">
//           <span className="font-bold">Dirección:</span>{" "}
//           {guia.destinatarioDireccion ||
//             "Sin dirección"}
//         </p>
//       </section>

//       <div className="my-3 border-t border-black" />

//       {guia.modalidadTransporte === "01" &&
//         guia.transportista && (
//           <> 
//             <section>
//               <p className="mb-2 text-[11px] font-bold uppercase tracking-wide">
//                 Transportista
//               </p>

//               <p className="font-bold">
//                 {guia.transportista.denominacion}
//               </p>

//               <div className="mt-1">
//                 <p>
//                   <span className="font-bold">RUC:</span>{" "}
//                   {guia.transportista.ruc}
//                 </p>

//                 <p>
//                   <span className="font-bold">
//                     Registro MTC:
//                   </span>{" "}
//                   {guia.transportista.numeroRegistroMTC}
//                 </p>

//                 <p>
//                   <span className="font-bold">
//                     Autorización:
//                   </span>{" "}
//                   {guia.transportista.numeroAutorizacion}
//                 </p>
//               </div>
//             </section>

//             <div className="my-3 border-t border-black" />
//           </>
//         )}

//       <div className="my-3 border-t border-black" />

//       <section>
//         <p className="mb-2 text-[11px] font-bold uppercase tracking-wide">
//           Traslado
//         </p>

//         <div>
//           <p className="font-bold">
//             PARTIDA
//           </p>

//           <p className="mt-1">
//             {guia.puntoPartidaDireccion}
//           </p>
//         </div>

//         <div className="mt-3">
//           <p className="font-bold">
//             LLEGADA
//           </p>

//           <p className="mt-1">
//             {guia.puntoLlegadaDireccion}
//           </p>
//         </div>
//       </section>

//       <div className="my-3 border-t border-black" />

//       <section>
//         <p className="mb-2 text-[11px] font-bold uppercase tracking-wide">
//           Productos
//         </p>

//         {guia.detalles.map((detalle) => (
//           <div
//             key={detalle.codigoInterno}
//             className="mb-3"
//           >
//             <p className="font-bold">
//               {detalle.descripcion}
//             </p>

//             <div className="mt-1 flex justify-between gap-2">
//               <span>
//                 Código: {detalle.codigoInterno}
//               </span>

//               <span className="font-bold">
//                 {detalle.cantidad}{" "}
//                 {detalle.unidadMedida}
//               </span>
//             </div>
//           </div>
//         ))}
//       </section>

//       <div className="my-3 border-t border-black" />

//       <section>
//         <div className="flex justify-between">
//           <span className="font-bold">
//             Peso bruto:
//           </span>

//           <span>
//             {guia.pesoBrutoTotal}{" "}
//             {guia.pesoBrutoUnidadMedida}
//           </span>
//         </div>

//         <div className="mt-1 flex justify-between">
//           <span className="font-bold">
//             Bultos:
//           </span>

//           <span>{guia.numeroBultos}</span>
//         </div>
//       </section>

//       <section className="mt-3">
//         <p className="font-bold">
//           Observaciones:
//         </p>

//         <p className="mt-1">
//           {guia.observaciones ||
//             "Sin observaciones"}
//         </p>
//       </section>

//       <div className="my-4 border-t-2 border-black" />

//       <div className="text-center">
//         <p className="font-bold">
//           GUÍA DE REMISIÓN ELECTRÓNICA
//         </p>

//         <p className="mt-1">
//           Representación impresa
//         </p>

//         {guia.pdfUrl && (
//           <div className="mt-3 flex justify-center">
//             <QRCodeSVG
//               value={guia.pdfUrl}
//               size={120}
//               level="M"
//             />
//           </div>
//         )}

//         <p className="mt-2 text-[13px] font-bold">
//           {numeroGuia}
//         </p>

//         <p className="mt-2 text-[9px]">
//           Documento generado electrónicamente
//         </p>
//       </div>
//     </div>
//   );
// }

import { QRCodeSVG } from "qrcode.react";

type TicketGuiaProps = {
  // Opcional: datos del emisor (cabecera). Si no los envías, no se muestra la cabecera.
  emisor?: {
    razonSocial: string;
    ruc: string;
    direccion: string;
  };
  // Opcional: URL de consulta y resolución SUNAT del pie
  urlConsulta?: string;
  resolucionSunat?: string;

  guia: {
    pdfUrl: string | null;

    serie: string;
    numero: number;

    fechaEmision: string;
    horaEmision: string;
    fechaEntregaTransportista: string | null;

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
    } | null;

    detalles: {
      codigoInterno: string;
      descripcion: string;
      unidadMedida: string;
      cantidad: number;
    }[];
  };
};

const formatearFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const MOTIVOS: Record<string, string> = {
  "01": "VENTA",
  "02": "COMPRA",
  "04": "TRASLADO ENTRE ESTABLECIMIENTOS",
  "13": "OTROS",
};

const MODALIDADES: Record<string, string> = {
  "01": "TRANSPORTE PÚBLICO",
  "02": "TRANSPORTE PRIVADO",
};

function Titulo({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 text-center text-[11px] font-bold uppercase">
      {children}
    </p>
  );
}

export default function TicketGuia({
  guia,
  emisor,
  urlConsulta,
  resolucionSunat = "034-005-0005315",
}: TicketGuiaProps) {
  const numeroGuia = `${guia.serie}-${String(guia.numero).padStart(6, "0")}`;

  const fechaEmision = formatearFecha(guia.fechaEmision);

  const fechaInicioTraslado = guia.fechaEntregaTransportista
    ? formatearFecha(guia.fechaEntregaTransportista)
    : fechaEmision;

  const motivoTraslado = (
    MOTIVOS[guia.motivoTraslado] ?? guia.motivoTraslado
  ).toUpperCase();

  const modalidadTransporte = (
    MODALIDADES[guia.modalidadTransporte] ?? guia.modalidadTransporte
  ).toUpperCase();

  const tipoDocDestinatario =
    guia.destinatarioTipoDocumento === "6" ? "RUC" : "DNI";

  const qrValue = guia.pdfUrl || urlConsulta || "";

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
      {/* CABECERA */}
      <div className="text-center">
        {emisor && (
          <>
            <p className="text-[12px] font-bold uppercase">
              {emisor.razonSocial}
            </p>
            <p className="mt-1 uppercase">{emisor.direccion}</p>
            <p className="mt-1 font-bold">RUC {emisor.ruc}</p>
          </>
        )}

        <h1 className="mt-2 text-[13px] font-bold uppercase">
          GUÍA DE REMISIÓN REMITENTE ELECTRÓNICA
        </h1>

        <p className="mt-1 text-[16px] font-bold">{numeroGuia}</p>
      </div>

      {/* DESTINATARIO */}
      <section className="mt-3 text-center">
        <Titulo>Destinatario</Titulo>
        <p className="uppercase">
          {tipoDocDestinatario}: {guia.destinatarioNumeroDocumento}
        </p>
        <p className="uppercase">{guia.destinatarioDenominacion}</p>
      </section>

      {/* DATOS DEL TRASLADO */}
      <section className="mt-3 text-center">
        <Titulo>Datos del traslado</Titulo>
        <p className="uppercase">
          <span className="font-bold">Fecha emisión:</span> {fechaEmision}
        </p>
        <p className="uppercase">
          <span className="font-bold">Fecha inicio de traslado:</span>{" "}
          {fechaInicioTraslado}
        </p>
        <p className="uppercase">
          <span className="font-bold">Motivo de traslado:</span>{" "}
          {motivoTraslado}
        </p>
        <p className="uppercase">
          <span className="font-bold">Modalidad de transporte:</span>{" "}
          {modalidadTransporte}
        </p>
        <p className="uppercase">
          <span className="font-bold">
            Peso bruto total ({guia.pesoBrutoUnidadMedida}):
          </span>{" "}
          {guia.pesoBrutoTotal}
        </p>
        <p className="uppercase">
          <span className="font-bold">Número de bultos:</span>{" "}
          {guia.numeroBultos}
        </p>
      </section>

      {/* DATOS DEL TRANSPORTE */}
      {guia.modalidadTransporte === "01" && guia.transportista && (
        <section className="mt-3 text-center">
          <Titulo>Datos del transporte</Titulo>
          <p className="uppercase">
            <span className="font-bold">Transportista:</span> RUC{" "}
            {guia.transportista.ruc} - {guia.transportista.denominacion}
          </p>
        </section>
      )}

      {/* PUNTO DE PARTIDA */}
      <section className="mt-3 text-center">
        <Titulo>Punto de partida</Titulo>
        <p className="uppercase">{guia.puntoPartidaDireccion}</p>
      </section>

      {/* PUNTO DE LLEGADA */}
      <section className="mt-3 text-center">
        <Titulo>Punto de llegada</Titulo>
        <p className="uppercase">{guia.puntoLlegadaDireccion}</p>
      </section>

      {/* TABLA DE PRODUCTOS */}
      <section className="mt-3">
        <div className="grid grid-cols-[18px_1fr_32px] gap-x-1 border-y border-black py-1 text-[10px] font-bold uppercase">
          <span>#</span>
          <span>Detalle</span>
          <span className="text-right">Cant</span>
        </div>

        {guia.detalles.map((detalle, index) => (
          <div
            key={`${detalle.codigoInterno}-${index}`}
            className="grid grid-cols-[18px_1fr_32px] gap-x-1 border-b border-dashed border-black py-1"
          >
            <span>{index + 1}</span>
            <span className="uppercase">
              [{detalle.codigoInterno}] {detalle.descripcion} (
              {detalle.unidadMedida})
            </span>
            <span className="text-right">{detalle.cantidad}</span>
          </div>
        ))}
      </section>

      {/* OBSERVACIONES */}
      <section className="mt-3 text-center">
        <Titulo>Observaciones</Titulo>
        <p className="uppercase">{guia.observaciones || "-"}</p>
      </section>

      {/* DOCUMENTOS RELACIONADOS */}
      <section className="mt-3 text-center">
        <p className="uppercase">
          <span className="font-bold">Documentos relacionados:</span>{" "}
          {guia.venta.documento
            ? `${guia.venta.documento.tipo} - ${guia.venta.documento.serie}-${guia.venta.documento.numero}`
            : "-"}
        </p>
      </section>

      <div className="my-3 border-t border-black" />

      {/* PIE */}
      <div className="text-center text-[10px]">
        <p>
          Representación impresa de la GUÍA DE REMISIÓN REMITENTE ELECTRÓNICA
          {urlConsulta && (
            <>
              , para ver el documento visita{" "}
              <span className="break-all">{urlConsulta}</span>
            </>
          )}
        </p>

        <p className="mt-2">
          Puede consultar en: www.apisunat.pe
          Autorizado con Resolución N°034-005
          0012997/SUNAT
        </p>

        {qrValue && (
          <div className="mt-3 flex justify-center">
            <QRCodeSVG value={qrValue} size={180} level="M" />
          </div>
        )}
      </div>
    </div>
  );
}