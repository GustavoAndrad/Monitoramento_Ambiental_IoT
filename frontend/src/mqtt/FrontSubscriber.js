import BrokerConnectionSingleton from './BrokerConnectionSingleton';
import { useState, useRef } from 'react';


class FrontSubscriber{
  constructor() {
    this.client = BrokerConnectionSingleton.getInstance();
    const [ultimoDado, setUltimoDado] = useState(null);
    const leituraParcialRef = useRef({});
    const clientRef = useRef(null);
    const subscriptions = useRef({});
    this.client.on('connect', () => {
      console.log('[MQTT] Conectado ao broker');

      this.client.subscribe('clima/temperatura');
      this.client.subscribe('clima/umidade');
      this.client.subscribe('clima/vento');

      this.client.subscribe('clima/alerta');
    });
  }

  escutar(){
    this.client.on('message', (topic, message) => {
      this.processarMensagem(topic, message);
      //this.processarAlerta();
    });
  }

  
  processarMensagem(topic, message) {
    try {
      const payload = JSON.parse(message.toString());
      const { valor, timestamp, iso } = payload;

      const parcial = this.leituraParcialRef.current[iso] || { timestamp, iso };

      if (topic === 'clima/temperatura') parcial.temperatura = valor;
      if (topic === 'clima/umidade') parcial.umidade = valor;
      if (topic === 'clima/vento') parcial.vento = valor;

      this.leituraParcialRef.current[iso] = parcial;

      if ( parcial.temperatura !== undefined && parcial.umidade !== undefined && parcial.vento !== undefined) {
        this.setUltimoDado(parcial);
        console.log(1);
        //climaSubject.notify(parcial);
        delete this.leituraParcialRef.current[iso];
        console.log('[MQTT] Leitura completa recebida:', parcial);
      }

      if (this.subscriptions.current[topic]) {
        this.subscriptions.current[topic].forEach(cb => cb(payload));
      }
      
    } catch (err) {
      console.error('[MQTT] Erro ao processar mensagem:', err);
    }
  }
}

module.exports = FrontSubscriber;