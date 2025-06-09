const mqtt = require('mqtt');

const client = mqtt.connect('mqtts://b35611364f10443eb840648d6c93f42d.s1.eu.hivemq.cloud', {
  username: 'apsG5',
  password: 'Grupo5aps'
});

function publicarNovaLeitura(dados) {
  return new Promise((resolve, reject) => {
    if (!client.connected) {
      client.once('connect', () => {
        client.publish('clima/leituras', JSON.stringify(dados), {}, (err) => {
          if (err) return reject(err);
          console.log('[MQTT] Mensagem publicada:', dados);
          resolve();
        });
      });
    } else {
      client.publish('clima/leituras', JSON.stringify(dados), {}, (err) => {
        if (err) return reject(err);
        console.log('[MQTT] Mensagem publicada:', dados);
        resolve();
      });
    }
  });
}

function publicarHistorico(historico) {
  return new Promise((resolve, reject) => {
    if (!client.connected) {
      client.once('connect', () => {
        client.publish('clima/leituras/historico', JSON.stringify(historico), { retain: true }, (err) => {
          if (err) return reject(err);
          console.log('[MQTT] Histórico publicado (retain)');
          resolve();
        });
      });
    } else {
      client.publish('clima/leituras/historico', JSON.stringify(historico), { retain: true }, (err) => {
        if (err) return reject(err);
        console.log('[MQTT] Histórico publicado (retain)');
        resolve();
      });
    }
  });
}

module.exports = { publicarNovaLeitura, publicarHistorico };
