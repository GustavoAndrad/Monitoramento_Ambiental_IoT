const BrokerConnectionSingleton = require('./BrokerConnectionSingleton');

class PublisherMQTT {
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

  publicarNovaLeitura(leitura) {
    const promessas = [];

    if (leitura.temperatura !== undefined) {
      promessas.push(this.publicarSensor('clima/temperatura', {
        valor: leitura.temperatura,
        timestamp: leitura.timestamp,
        iso: leitura.iso
      }));
    }

    if (leitura.umidade !== undefined) {
      promessas.push(this.publicarSensor('clima/umidade', {
        valor: leitura.umidade,
        timestamp: leitura.timestamp,
        iso: leitura.iso
      }));
    }

    if (leitura.vento !== undefined) {
      promessas.push(this.publicarSensor('clima/vento', {
        valor: leitura.vento,
        timestamp: leitura.timestamp,
        iso: leitura.iso
      }));
    }

    return Promise.all(promessas);
  }
}

module.exports = PublisherMQTT;
