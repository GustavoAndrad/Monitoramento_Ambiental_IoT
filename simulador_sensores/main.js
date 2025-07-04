const PublisherMQTT = require('./mqtt/Publisher');

// Classe base do Sensor
class Sensor {
  criarLeitura() {
    throw new Error('criarLeitura() deve ser implementado.');
  }
}

// Sensores concretos
class SensorTemperatura extends Sensor {
  criarLeitura(timestamp, iso) {
    return {
      tipo: 'temperatura',
      valor: Math.floor(Math.random() * 30) + 10,
      timestamp,
      iso
    };
  }
}

class SensorUmidade extends Sensor {
  criarLeitura(timestamp, iso) {
    return {
      tipo: 'umidade',
      valor: Math.floor(Math.random() * 70) + 10,
      timestamp,
      iso
    };
  }
}

class SensorVento extends Sensor {
  criarLeitura(timestamp, iso) {
    return {
      tipo: 'vento',
      valor: Math.floor(Math.random() * 40),
      timestamp,
      iso
    };
  }
}

// Fábrica base (Factory Method)
class SensorFactory {
  criarSensor() {
    throw new Error('criarSensor() deve ser implementado.');
  }
}

// Fábricas concretas
class SensorTemperaturaFactory extends SensorFactory {
  criarSensor() {
    return new SensorTemperatura();
  }
}

class SensorUmidadeFactory extends SensorFactory {
  criarSensor() {
    return new SensorUmidade();
  }
}

class SensorVentoFactory extends SensorFactory {
  criarSensor() {
    return new SensorVento();
  }
}

// Simulador que usa as fábricas
class Simulador {
  constructor() {
    this.publisher = new PublisherMQTT();

    this.factories = [
      new SensorTemperaturaFactory(),
      new SensorUmidadeFactory(),
      new SensorVentoFactory()
    ];
  }

  async publicarLeitura() {
    const agora = new Date();
    const timestamp = agora.toLocaleString('pt-BR');
    const iso = agora.toISOString();

    // Cria cada um dos sensores
    const sensores = this.factories.map(factory => factory.criarSensor());

    const novaLeitura = {
      timestamp,
      iso,
      temperatura: sensores[0].criarLeitura(timestamp, iso).valor,
      umidade: sensores[1].criarLeitura(timestamp, iso).valor,
      vento: sensores[2].criarLeitura(timestamp, iso).valor
    };

    try {
      console.log('> Publicando leitura...');
      await this.publisher.publicarNovaLeitura(novaLeitura);
      console.log(`[MQTT] Publicado: ${timestamp}`);
    } catch (err) {
      console.error('Erro ao publicar no MQTT:', err);
    }
  }

  static iniciar() {
    const sim = new Simulador();
    sim.publicarLeitura();
    setInterval(() => sim.publicarLeitura(), 60 * 1000);
  }
}

Simulador.iniciar();
