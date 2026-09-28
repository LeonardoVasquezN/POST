import { Suspense } from "react";
import Transportistas from "../../components/Transportistas";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8">Cargando...</div>}>
      <Transportistas />
    </Suspense>
  );
}