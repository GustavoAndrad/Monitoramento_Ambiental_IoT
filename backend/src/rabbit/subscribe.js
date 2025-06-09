const mqtt = require('mqtt');

const client = mqtt.connect('mqtts://b35611364f10443eb840648d6c93f42d.s1.eu.hivemq.cloud', {
  username: 'apsG5',
  password: 'Grupo5aps'
});

client.on('connect', () => {
  console.log('[MQTT] Conectado ao HiveMQ Cloud');
  client.subscribe('clima/leituras', err => {
    if (!err) console.log('[MQTT] Subscrito a clima/leituras');
  });
});

client.on('message', (topic, message) => {
  console.log(`[>] Mensagem recebida em ${topic}: ${message.toString()}`);
});
