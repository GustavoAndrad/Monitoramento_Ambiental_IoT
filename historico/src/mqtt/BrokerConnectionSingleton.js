const mqtt = require('mqtt');

class BrokerConnectionSingleton {
  static instance = null;

  constructor() {
    if (BrokerConnectionSingleton.instance) {
      return BrokerConnectionSingleton.instance;
    }

    this.client = mqtt.connect('mqtts://b35611364f10443eb840648d6c93f42d.s1.eu.hivemq.cloud', {
      username: 'apsG5',
      password: 'Grupo5aps',
    });

    BrokerConnectionSingleton.instance = this;
  }

  static getInstance() {
    if (!BrokerConnectionSingleton.instance) {
      new BrokerConnectionSingleton();
    }
    return BrokerConnectionSingleton.instance.client;
  }
}

module.exports = BrokerConnectionSingleton;
