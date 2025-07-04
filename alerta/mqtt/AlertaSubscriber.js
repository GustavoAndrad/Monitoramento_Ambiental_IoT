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
      message: null,
      timestamp,
      iso,
    }
    
    if (topic === 'clima/temperatura'){
        if(valor<15){
          leitura.message = '⚠️ Temperatura muito baixa! Atenção ao frio.';
        } else if(valor>37){
          leitura.message = '⚠️ Temperatura elevada! Risco de calor extremo.';
        }
    }
    else if (topic === 'clima/umidade'){
        if(valor < 30){
          leitura.message = '⚠️ ⚠️ Umidade do ar muito baixa! Risco à saúde respiratória.';
        }
    }
    else if (topic === 'clima/vento'){
        if(valor > 25){
          leitura.message = '⚠️ Ventos fortes! Possíveis transtornos.';
        }
    }
    
    if(leitura.message){
      this.publisher.publicarAlerta(leitura)
    }  
  }
}

module.exports = AlertaSubscriber;