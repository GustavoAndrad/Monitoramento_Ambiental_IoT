const mqtt = require('mqtt');

const client = mqtt.connect('mqtts://b35611364f10443eb840648d6c93f42d.s1.eu.hivemq.cloud', {
  username: 'apsG5',
  password: 'Grupo5aps'
});

function publicarSensor(top, dados) {
  return new Promise((resolve, reject) => {
    payload = JSON.stringify(dados);
    if (!client.connected) {
      client.once('connect', () => {
        client.publish(top, payload, {}, (err) => {
          if (err) return reject(err);
          console.log(`[MQTT] Mensagem publicada em ${top}:`, dados);
          resolve();
        });
      });
    } else {
      client.publish(top, payload, {}, (err) => {
        if (err) return reject(err);
        console.log(`[MQTT] Mensagem publicada em ${top}:`, dados);
        resolve();
      });
    }
  });
}

function publicarNovaLeitura(leitura) {
  const promessas = [];

  if(leitura.temperatura !== undefined) {
    promessas.push(publicarSensor('clima/temperatura', {
      valor: leitura.temperatura,
      timestamp: leitura.timestamp,
      iso: leitura.iso
    }));
  }
  if(leitura.umidade !== undefined){
    promessas.push(publicarSensor('clima/umidade',{
      valor: leitura.umidade,
      timestamp: leitura.timestamp,
      iso: leitura.iso
    }))
  }
  if(leitura.vento !== undefined){
    promessas.push(publicarSensor('clima/vento',{
      valor: leitura.vento,
      timestamp: leitura.timestamp,
      iso: leitura.iso
    }))
  }
  return Promise.all(promessas);
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
