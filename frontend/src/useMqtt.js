import { useEffect, useState, useRef } from 'react';
import mqtt from 'mqtt';
import { climaSubject } from './climaSubject';

export function useMqtt() {
  const [ultimoDado, setUltimoDado] = useState(null);
  const leituraParcialRef = useRef({});
  const clientRef = useRef(null);
  const subscriptions = useRef({});

  useEffect(() => {
    const client = mqtt.connect('wss://b35611364f10443eb840648d6c93f42d.s1.eu.hivemq.cloud:8884/mqtt', {
      username: 'apsG5',
      password: 'Grupo5aps',
      reconnectPeriod: 5000
    });

    clientRef.current = client;

    client.on('connect', () => {
      console.log('[MQTT] Conectado');
      client.subscribe('clima/temperatura');
      client.subscribe('clima/umidade');
      client.subscribe('clima/vento');
    });


    client.on('message', (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        const { valor, timestamp, iso } = payload;

        const parcial = leituraParcialRef.current[iso] || { timestamp, iso };

        if (topic === 'clima/temperatura') parcial.temperatura = valor;
        if (topic === 'clima/umidade') parcial.umidade = valor;
        if (topic === 'clima/vento') parcial.vento = valor;

        leituraParcialRef.current[iso] = parcial;

       if ( parcial.temperatura !== undefined && parcial.umidade !== undefined && parcial.vento !== undefined) {
          setUltimoDado(parcial);
          console.log(1);
          climaSubject.notify(parcial);
          delete leituraParcialRef.current[iso];
          console.log('[MQTT] Leitura completa recebida:', parcial);
        }

        if (subscriptions.current[topic]) {
          subscriptions.current[topic].forEach(cb => cb(payload));
        }

      } catch (err) {
        console.error('[MQTT] Erro ao processar mensagem:', err);
      }
    });

    client.on('error', err => {
      console.error('[MQTT] Erro na conexão:', err);
    });

    return () => client.end();
  }, []);
/*
  function subscribe(topic, callback) {
    if (!subscriptions.current[topic]) {
      subscriptions.current[topic] = [];
      clientRef.current?.subscribe(topic, err => {
        if (err) console.error(`[MQTT] Erro ao inscrever-se em ${topic}:`, err);
      });
    }
    subscriptions.current[topic].push(callback);
  }
*/
  return { ultimoDado/*, subscribe */};
}