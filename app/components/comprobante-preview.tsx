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

  const valorVenta = venta.detalles.reduce(
    (acumulado: number, detalle: any) => {
      return acumulado + Number(detalle.subtotal);
    },
    0
  );

  const igv = valorVenta * 0.18;
  const descuentoGeneral = 0;

  const total = Number(venta.total);

  return (
    <div
      id="comprobante"
      className="mx-auto w-[80mm] bg-white px-6 py-4 text-black"
    >
      {/* ENCABEZADO */}
      <div className="text-center">
        <h2 className="text-xl font-bold">
          CAPRICHOS SHOP
        </h2>

        {(esBoleta || esFactura) && (
          <div className="mt-2 text-sm">
            <p>RUC: 10181328849</p>
          </div>
        )}

        <p className="mt-3 font-bold">
          {esNota
            ? "NOTA DE VENTA"
            : esBoleta
            ? "BOLETA DE VENTA ELECTRÓNICA"
            : esFactura
            ? "FACTURA ELECTRÓNICA"
            : ""}
        </p>

        <p className="font-bold">
          {documento.serie}-
          {String(documento.numero).padStart(6, "0")}
        </p>

        {esBoleta && documento.fechaEmision && (
          <p className="mt-2 text-sm">
            <strong>Fecha:</strong>{" "}
            {new Date(
              documento.fechaEmision
            ).toLocaleDateString("es-PE")}
          </p>
        )}
      </div>

      <div className="my-4 border-t border-dashed" />

      <div className="text-sm">
        <p>
          <strong>Cliente:</strong>{" "}
          {cliente?.nombre}
        </p>

        {cliente?.dni && (
          <p>
            <strong>DNI:</strong>{" "}
            {cliente.dni}
          </p>
        )}

        {cliente?.ruc && (
          <p>
            <strong>RUC:</strong>{" "}
            {cliente.ruc}
          </p>
        )}

        {cliente?.direccion && (
          <p>
            <strong>Dirección:</strong>{" "}
            {cliente.direccion}
          </p>
        )}
      </div>

      <div className="my-4 border-t border-dashed" />

      <div className="text-sm">
        {venta.detalles.map((detalle: any) => (
          <div
            key={detalle.id}
            className="mb-2"
          >
            <p className="font-medium">
              {detalle.producto.nombre}
            </p>

            <div className="flex justify-between">
              <span>
                {detalle.cantidad} x S/{" "}
                {Number(
                  detalle.precioUnitario
                ).toFixed(2)}

                {esBoleta && " NIU"}
              </span>

              <span>
                S/{" "}
                {Number(
                  detalle.subtotal
                ).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="my-4 border-t border-dashed" />

      {esBoleta && (
        <div className="text-sm">
          <div className="flex justify-between">
            <span>Valor de venta</span>

            <span>
              S/ {valorVenta.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>IGV 18%</span>

            <span>
              S/ {igv.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Descuento general</span>

            <span>
              S/ {descuentoGeneral.toFixed(2)}
            </span>
          </div>

          <div className="mt-2 flex justify-between text-lg font-bold">
            <span>SUBTOTAL</span>

            <span>
              S/ {total.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {!esBoleta && (
        <div className="flex justify-between text-lg font-bold">
          <span>TOTAL</span>

          <span>
            S/ {total.toFixed(2)}
          </span>
        </div>
      )}

      <div className="mt-3 text-sm">
        <p>
          <strong>Pago:</strong>{" "}
          {venta.metodoPago}
        </p>

        {venta.metodoPago === "EFECTIVO" && (
          <>
            <p>
              <strong>Recibido:</strong>{" "}
              S/{" "}
              {Number(
                venta.montoRecibido
              ).toFixed(2)}
            </p>

            <p>
              <strong>Vuelto:</strong>{" "}
              S/{" "}
              {Number(
                venta.vuelto
              ).toFixed(2)}
            </p>
          </>
        )}
      </div>

      <div className="my-4 border-t border-dashed" />

      <p className="text-center text-sm font-medium">
        Gracias por su compra
      </p>
    </div>
  );
}