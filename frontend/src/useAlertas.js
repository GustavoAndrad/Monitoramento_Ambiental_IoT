import { useEffect, useState } from 'react';
import { climaSubject } from './climaSubject';

export function useAlertas() {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    const observer = (dados) => {
      const novoAlerta = [];

      if (dados?.temperatura > 37) {
        novoAlerta.push('⚠️ Temperatura elevada! Risco de calor extremo.');
      } else if (dados?.temperatura < 15) {
        novoAlerta.push('⚠️ Temperatura muito baixa! Atenção ao frio.');
      }

      if (dados?.vento > 25) {
        novoAlerta.push('⚠️ Ventos fortes! Possíveis transtornos.');
      }

      if (dados?.umidade < 30) {
        novoAlerta.push('⚠️ Umidade do ar muito baixa! Risco à saúde respiratória.');
      }

      setAlertas(novoAlerta);
    };

    climaSubject.subscribe(observer);

    return () => climaSubject.unsubscribe(observer);
  }, []);

  return alertas;
}
