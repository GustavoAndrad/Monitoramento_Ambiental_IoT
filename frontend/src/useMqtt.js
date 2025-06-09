import { useEffect, useState, useRef } from 'react';
import mqtt from 'mqtt';
import { climaSubject } from './climaSubject';

export function useMqtt() {
  const [historico, setHistorico] = useState([]);
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
      client.subscribe('clima/leituras');
      client.subscribe('clima/leituras/historico');
    });

    client.on('message', (topic, message) => {
      const payload = JSON.parse(message.toString());

      if (topic === 'clima/leituras/historico') {
        setHistorico(payload);
        console.log('[MQTT] Histórico recebido:', payload);
      }

      if (topic === 'clima/leituras') {
        setHistorico(prev => {
          const novo = [payload, ...prev];
          const atualizado = novo
            .filter((item, index, self) =>
              index === self.findIndex(i => i.iso === item.iso)
            )
            .slice(0, 10);

          climaSubject.notify(payload);

          return atualizado;
        });
        console.log('[MQTT] Nova leitura recebida:', payload);
      }

      if (subscriptions.current[topic]) {
        subscriptions.current[topic].forEach(cb => cb(payload));
      }
    });

    client.on('error', err => {
      console.error('[MQTT] Erro:', err);
    });

    return () => client.end();
  }, []);

  function subscribe(topic, callback) {
    if (!subscriptions.current[topic]) {
      subscriptions.current[topic] = [];
      clientRef.current?.subscribe(topic, err => {
        if (err) console.error(`[MQTT] Erro ao inscrever-se em ${topic}:`, err);
      });
    }
    subscriptions.current[topic].push(callback);
  }

  return { historico, subscribe };
}
