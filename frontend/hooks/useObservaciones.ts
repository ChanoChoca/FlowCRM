import { useMemo, useState } from "react";

const INITIAL_OBS = {
  fechaNacimiento: "",
  coordenadas: "",
  instalacionTurno: "",
  miga: "",
  centralNombre: "",
  calle: "",
  desde: "",
  hasta: "",
  localidad: "",
};

export type ObsData = typeof INITIAL_OBS;

export function useObservaciones() {
  const [obsData, setObsData] = useState<ObsData>(INITIAL_OBS);

  function updateObs(key: keyof ObsData, value: string) {
    setObsData((prev) => ({ ...prev, [key]: value }));
  }

  function resetObs() {
    setObsData(INITIAL_OBS);
  }

  const computedObservaciones = useMemo(() => {
    const { fechaNacimiento, coordenadas, miga } = obsData;
    return [fechaNacimiento, coordenadas, miga].join("\n");
  }, [obsData]);

  return { obsData, updateObs, resetObs, computedObservaciones };
}
