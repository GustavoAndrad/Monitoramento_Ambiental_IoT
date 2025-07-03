import { useEffect, useState, useRef } from 'react';
import mqtt from 'mqtt';
import { climaSubject } from './climaSubject';

export function useMqtt() {
  const [historico, setHistorico] = useState([]);
  const clientRef = useRef(null);
  const subscriptions = useRef({});
  //buffer
  const leituraParcialRef = useRef({});

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
      client.subscribe('clima/leituras/historico');
    });

    client.on('message', (topic, message) => {
      const payload = JSON.parse(message.toString());

      if (topic === 'clima/leituras/historico') {
        setHistorico(payload);
        console.log('[MQTT] Histórico recebido:', payload);
      }

      if (['clima/temperatura', 'clima/umidade', 'clima/vento'].includes(topic)) {
        const {valor, timestamp, iso} = payload;
        const parcial = leituraParcialRef.current[iso] || { timestamp, iso};

        if(topic === 'clima/temperatura') parcial.temperatura = valor;
        if(topic === 'clima/umidade') parcial.umidade = valor;
        if(topic === 'clima/vento') parcial.vento = valor;

        leituraParcialRef.current[iso] = parcial;

        if ( parcial.temperatura !== undefined && parcial.umidade !== undefined && parcial.vento !== undefined) {
          setHistorico(prev => {
            const novo = [parcial, ...prev];
            const atualizado = novo
            .filter((item, index, self) => index === self.findIndex(i => i.iso === item.iso))
            .slice(0,10);
            climaSubject.notify(parcial);
            return atualizado;
          });
          console.log('[MQTT] Nova leitura recebida');
          delete leituraParcialRef.current[iso];
        }
        return;
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
