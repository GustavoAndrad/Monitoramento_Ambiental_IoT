import mqtt from 'mqtt';

export default class BrokerConnectionSingleton {
  static instance = null;

  constructor() {
    if (BrokerConnectionSingleton.instance) {
      return BrokerConnectionSingleton.instance;
    }

    this.client = mqtt.connect('wss://b35611364f10443eb840648d6c93f42d.s1.eu.hivemq.cloud:8884/mqtt', {
      username: 'apsG5',
      password: 'Grupo5aps',
      reconnectPeriod: 5000,
    });

    this.client.on('error', (err) => {
      console.error('[MQTT] Connection error:', err);
      this.client.end();
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
