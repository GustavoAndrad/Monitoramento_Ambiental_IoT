import { useEffect, useState } from 'react';
import FrontSubscriber from './mqtt/FrontSubscriber';
import FrontAlertaSubscriber from './mqtt/FrontAlertaSubscriber';

export function useMqtt() {
  const [ultimoDado, setUltimoDado] = useState(null);
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    const leituraSubscriber = new FrontSubscriber(setUltimoDado);
    const alertaSubscriber = new FrontAlertaSubscriber(setAlertas);
    leituraSubscriber.iniciar();
    alertaSubscriber.iniciar();
  }, []);

  return { ultimoDado, alertas };
}