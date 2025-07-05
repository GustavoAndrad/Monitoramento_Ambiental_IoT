import BaseMqttSubscriber from './BaseMqttSubscriber';

export default class FrontSubscriber extends BaseMqttSubscriber {
  constructor(setUltimoDado) {
    super();
    this.setUltimoDado = setUltimoDado;
    this.leituraParcialRef = {};
  }

  iniciar() {
    this.conectar(['clima/temperatura', 'clima/umidade', 'clima/vento']);
  }

  processarMensagem(topic, message) {
    if (!['clima/temperatura', 'clima/umidade', 'clima/vento'].includes(topic)) return;

    try {
      const payload = JSON.parse(message.toString());
      const { valor, timestamp, iso } = payload;

      const parcial = this.leituraParcialRef[iso] || { timestamp, iso };

      if (topic === 'clima/temperatura') parcial.temperatura = valor;
      if (topic === 'clima/umidade') parcial.umidade = valor;
      if (topic === 'clima/vento') parcial.vento = valor;

      this.leituraParcialRef[iso] = parcial;

      if (
        parcial.temperatura !== undefined &&
        parcial.umidade !== undefined &&
        parcial.vento !== undefined
      ) {
        this.setUltimoDado(parcial);
        delete this.leituraParcialRef[iso];
        console.log('[MQTT] Leitura completa recebida:', parcial);
      }
    } catch (err) {
      console.error('[MQTT] Erro ao processar mensagem:', err);
    }
  }
}
