const BrokerConnectionSingleton = require('./BrokerConnectionSingleton');
const AlertaPublisher = require("./AlertaPublisher.js")

class AlertaSubscriber{
  constructor() {
    this.client = BrokerConnectionSingleton.getInstance();
    this.publisher = new AlertaPublisher()

    this.client.on('connect', () => {
      console.log('[MQTT] Conectado ao broker');

      this.client.subscribe('clima/temperatura');
      this.client.subscribe('clima/umidade');
      this.client.subscribe('clima/vento');
    });
  }
  
  escutar(){
    this.client.on('message', (topic, message) => {
      this.processarMensagem(topic, message);
    });
  }

  processarMensagem(topic, message) {
    const payload = JSON.parse(message.toString());
    const { valor, iso, timestamp } = payload;
    const leitura = {
      mensagem: null,
      sensor: null,
      isAlerta: null,
      timestamp,
      iso,
    }

    if (topic === 'clima/temperatura') {
      leitura.sensor = 'temperatura';
      if (valor < 15) {
        leitura.mensagem = '⚠️ Temperatura muito baixa! Atenção ao frio.';
        leitura.isAlerta = true;
      } else if (valor > 37) {
        leitura.mensagem = '⚠️ Temperatura elevada! Risco de calor extremo.';
        leitura.isAlerta = true;
      } else {
        leitura.mensagem = '✅ Temperatura normal.';
        leitura.isAlerta = false;
      }
    }

    else if (topic === 'clima/umidade') {
      leitura.sensor = 'umidade';
      if (valor < 30) {
        leitura.mensagem = '⚠️ Umidade do ar muito baixa! Risco à saúde respiratória.';
        leitura.isAlerta = true;
      } else {
        leitura.mensagem = '✅ Umidade em níveis saudáveis.';
        leitura.isAlerta = false;
      }
    }

    else if (topic === 'clima/vento') {
      leitura.sensor = 'vento';
      if (valor > 25) {
        leitura.mensagem = '⚠️ Ventos fortes! Possíveis transtornos.';
        leitura.isAlerta = true;
      } else {
        leitura.mensagem = '✅ Velocidade do vento dentro do normal.';
        leitura.isAlerta = false;
      }
    }

    if (leitura.sensor && leitura.mensagem) {
      this.publisher.publicarAlerta(leitura);
    }
  }
}

module.exports = AlertaSubscriber;