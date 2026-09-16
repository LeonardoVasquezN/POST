type ComprobantePreviewProps = {
  venta: any;
};

export default function ComprobantePreview({
  venta,
}: ComprobantePreviewProps) {
  const documento = venta.documento;
  const cliente = venta.cliente;

  return (
    <div
      id="comprobante"
      className="mx-auto w-[80mm] bg-white p-4 text-black"
    >
      <div className="text-center">
        <h2 className="text-xl font-bold">
          CAPRICHOS SHOP
        </h2>

        <p className="mt-2 font-bold">
          NOTA DE VENTA
        </p>

        <p className="font-bold">
          {documento.serie}-
          {String(documento.numero).padStart(6, "0")}
        </p>
      </div>

      <div className="my-4 border-t border-dashed" />

      <div className="text-sm">
        <p>
          <strong>Cliente:</strong> {cliente?.nombre}
        </p>

        {cliente?.dni && (
          <p>
            <strong>DNI:</strong> {cliente.dni}
          </p>
        )}

        {cliente?.ruc && (
          <p>
            <strong>RUC:</strong> {cliente.ruc}
          </p>
        )}

        {cliente?.direccion && (
          <p>
            <strong>Dirección:</strong> {cliente.direccion}
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
                {Number(detalle.precioUnitario).toFixed(2)}
              </span>

              <span>
                S/ {Number(detalle.subtotal).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="my-4 border-t border-dashed" />

      <div className="text-sm">
        <div className="flex justify-between text-lg font-bold">
          <span>TOTAL</span>
          <span>
            S/ {Number(venta.total).toFixed(2)}
          </span>
        </div>

        <div className="mt-3">
          <p>
            <strong>Pago:</strong>{" "}
            {venta.metodoPago}
          </p>

          {venta.metodoPago === "EFECTIVO" && (
            <>
              <p>
                <strong>Recibido:</strong> S/{" "}
                {Number(venta.montoRecibido).toFixed(2)}
              </p>

              <p>
                <strong>Vuelto:</strong> S/{" "}
                {Number(venta.vuelto).toFixed(2)}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="my-4 border-t border-dashed" />

      <p className="text-center text-sm font-medium">
        Gracias por su compra
      </p>
    </div>
  );
}