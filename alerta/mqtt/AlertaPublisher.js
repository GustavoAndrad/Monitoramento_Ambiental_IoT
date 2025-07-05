const BrokerConnectionSingleton = require('./BrokerConnectionSingleton');

class AlertaPublisher {
  constructor() {
    this.client = BrokerConnectionSingleton.getInstance();
  }

  publicarSensor(topico, dados) {
    const payload = JSON.stringify(dados);

    return new Promise((resolve, reject) => {
      if (!this.client.connected) {
        this.client.once('connect', () => {
          this.client.publish(topico, payload, {}, (err) => {
            if (err) return reject(err);
            console.log(`[MQTT] Mensagem publicada em ${topico}:`, dados);
            resolve();
          });
        });
      } else {
        this.client.publish(topico, payload, {}, (err) => {
          if (err) return reject(err);
          console.log(`[MQTT] Mensagem publicada em ${topico}:`, dados);
          resolve();
        });
      }
    });
  }

  async publicarAlerta(alerta) {

    return await this.publicarSensor('clima/alerta', alerta);
    
  }
}

module.exports = AlertaPublisher;
