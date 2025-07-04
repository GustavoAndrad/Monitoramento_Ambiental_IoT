const BrokerConnectionSingleton = require('./BrokerConnectionSingleton');
const { lerHistorico, salvarHistorico } = require('../historicoUtils');

class HistSubscriber{
  constructor() {
    this.client = BrokerConnectionSingleton.getInstance();
    this.leituraParcial = {};

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
    try {
      const payload = JSON.parse(message.toString());
      const { valor, iso, timestamp } = payload;

      const leitura = this.leituraParcial[iso] || { iso, timestamp };
      if (topic === 'clima/temperatura') leitura.temperatura = valor;
      if (topic === 'clima/umidade') leitura.umidade = valor;
      if (topic === 'clima/vento') leitura.vento = valor;

      this.leituraParcial[iso] = leitura;

      if (
        leitura.temperatura !== undefined &&
        leitura.umidade !== undefined &&
        leitura.vento !== undefined
      ) {
        const historico = lerHistorico();
        historico.unshift(leitura);
        historico.splice(1000); // Mantém até 1000 registros
        salvarHistorico(historico);

        console.log('[MQTT] Nova leitura registrada:', leitura);

        delete this.leituraParcial[iso];
      }
    } catch (err) {
      console.error('[MQTT] Erro ao processar mensagem:', err.message);
    }
  }
}

module.exports = HistSubscriber;