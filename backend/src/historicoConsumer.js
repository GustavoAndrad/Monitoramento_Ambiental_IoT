const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');

const HISTORICO_PATH = path.join(__dirname, 'historico.json');
const leituraParcial = {};

function lerHistorico() {
  try {
    const dados = fs.readFileSync(HISTORICO_PATH, 'utf-8');
    return JSON.parse(dados);
  } catch {
    return [];
  }
}

function salvarHistorico(historico) {
  fs.writeFileSync(HISTORICO_PATH, JSON.stringify(historico, null, 2), 'utf-8');
}

function configurarRotas(app) {
  app.get('/historico', (req, res) => {
    try {
      const historico = lerHistorico();
      res.json(historico);
    } catch (err) {
      console.error('[HTTP] Erro ao obter histórico:', err);
      res.status(500).json({ erro: 'Erro ao ler histórico' });
    }
  });
}   
module.exports = { configurarRotas };

const client = mqtt.connect('mqtts://b35611364f10443eb840648d6c93f42d.s1.eu.hivemq.cloud', {
  username: 'apsG5',
  password: 'Grupo5aps'
});

client.on('connect', () => {
  console.log('[MQTT] Conectado ao broker');

  client.subscribe('clima/temperatura');
  client.subscribe('clima/umidade');
  client.subscribe('clima/vento');
});

client.on('message', (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    const { valor, iso, timestamp } = payload;

    const leitura = leituraParcial[iso] || { iso, timestamp };
    if (topic === 'clima/temperatura') leitura.temperatura = valor;
    if (topic === 'clima/umidade') leitura.umidade = valor;
    if (topic === 'clima/vento') leitura.vento = valor;

    leituraParcial[iso] = leitura;

    if (
      leitura.temperatura !== undefined &&
      leitura.umidade !== undefined &&
      leitura.vento !== undefined
    ) {
      const historico = lerHistorico();
      historico.unshift(leitura);
      historico.splice(100);
      salvarHistorico(historico);

      console.log('[MQTT] Nova leitura registrada:', leitura);

      delete leituraParcial[iso];
    }
  } catch (err) {
    console.error('[MQTT] Erro ao processar mensagem:', err.message);
  }
});