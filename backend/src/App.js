const express = require('express');
const cors = require('cors');
const { publicarNovaLeitura } = require('./rabbit/publisher');
const { configurarRotas } = require('./historicoConsumer');

const app = express();
const PORT = 5027;

app.use(cors());

// Factory Method
class Sensor {
  criarLeitura() {
    throw new Error('criarLeitura() deve ser implementado.');
  }
}

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

setInterval(async () => {
  const agora = new Date();
  const timestamp = agora.toLocaleString('pt-BR');
  const iso = agora.toISOString();

  const sensores = [
    new SensorTemperatura(),
    new SensorUmidade(),
    new SensorVento()
  ];

  const novaLeitura = {
    timestamp,
    iso,
    temperatura: sensores[0].criarLeitura(timestamp, iso).valor,
    umidade: sensores[1].criarLeitura(timestamp, iso).valor,
    vento: sensores[2].criarLeitura(timestamp, iso).valor
  };

  try {
    await publicarNovaLeitura(novaLeitura);
    console.log(`[MQTT] Publicado: ${timestamp}`);
  } catch (err) {
    console.error('Erro ao publicar no MQTT:', err);
  }
}, 60 * 1000); 

configurarRotas(app); //api(get) do histórico

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
