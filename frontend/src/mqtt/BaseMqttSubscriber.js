import BrokerConnectionSingleton from './BrokerConnectionSingleton';

export default class BaseMqttSubscriber {
  constructor() {
    this.client = null;
  }

  conectar(topicos) {
    this.client = BrokerConnectionSingleton.getInstance();

    if (!this.client) {
      console.error('[MQTT] Cliente MQTT não pôde ser criado.');
      return;
    }

    this.client.once('connect', () => {
      console.log('[MQTT] Conectado ao broker');

      topicos.forEach((topico) => {
        this.client.subscribe(topico);
        console.log(`[MQTT] Inscrito em: ${topico}`);
      });
    });

    this.client.on('message', (topic, message) => {
      this.processarMensagem(topic, message);
    });
  }

  processarMensagem(topic, message) {
    console.warn('[MQTT] processarMensagem não implementado!');
  }
}
