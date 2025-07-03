const mqtt = require('mqtt');

const client = mqtt.connect('mqtts://b35611364f10443eb840648d6c93f42d.s1.eu.hivemq.cloud', {
  username: 'apsG5',
  password: 'Grupo5aps'
});

client.on('connect', () => {
  console.log('[MQTT] Conectado ao HiveMQ Cloud');
  const topicos = ['clima/temperatura','clima/umidade', 'clima/vento'];
  client.subscribe(topicos, err => {
    if (err) {
      console.error('[MQTT] Erro ao subscrever: ', err);
    } else {
      console.log('[MQTT] Subscrito a tópicos por sensor:', topicos.join(', '));
    }
  });
});

client.on('message', (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    switch (topic) {
      case 'clima/temperatura':
        processarTemperatura(payload);
        break;
      case 'clima/umidade':
        processarUmidade(payload);
        break;
      case 'clima/vento':
        processarVento(payload);
        break;
      default:
        console.log('[MQTT] Tópico não tratado: ', topic)
    }
  } catch(err){
    console.log(`[MQTT] Erro ao processar mensagem em ${topic}: `, err);
  }
});

function processarTemperatura(payload) {
  const {valor, timestamp} = payload;
  console.log(`Temperatura - ${valor}°C às ${timestamp}`);
}

function processarUmidade(payload) {
  const {valor, timestamp} = payload;
  console.log(`Umidade - ${valor}% às ${timestamp}`);
}

function processarTemperatura(payload) {
  const {valor, timestamp} = payload;
  console.log(`Vento - ${valor}Km/h às ${timestamp}`);
}