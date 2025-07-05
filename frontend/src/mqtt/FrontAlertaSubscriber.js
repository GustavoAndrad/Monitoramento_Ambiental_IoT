import BaseMqttSubscriber from './BaseMqttSubscriber';

export default class FrontAlertaSubscriber extends BaseMqttSubscriber {
  constructor(setAlertas) {
    super();
    this.setAlertas = setAlertas;
    this.alertasPorSensor = {};
  }

  iniciar() {
    this.conectar(['clima/alerta']);
  }

  processarMensagem(topic, message) {
    if (topic !== 'clima/alerta') return;

    try {
      const alerta = JSON.parse(message.toString());
      const { sensor, mensagem, timestamp } = alerta;
      
      if (!sensor || !mensagem) {
        console.warn('[MQTT] [ALERTA] Alerta inválido:', alerta);
        return;
      }

      this.alertasPorSensor[sensor] = { sensor, mensagem, timestamp };

      const alertasArray = Object.values(this.alertasPorSensor);
      
      this.setAlertas(alertasArray);
      console.log('[MQTT] [ALERTA] Alerta processado:', alerta);
    } catch (err) {
      console.error('[MQTT] [ALERTA] Erro ao processar alerta:', err);
    }
  }
}