const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { publicarNovaLeitura, publicarHistorico } = require('./rabbit/publisher');

const app = express();
const PORT = 5027;
const HISTORICO_PATH = path.join(__dirname, 'historico.json');

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

function lerHistorico() {
  try {
    const dados = fs.readFileSync(HISTORICO_PATH, 'utf-8');
    return JSON.parse(dados);
  } catch {
    return [];
  }
}

function salvarHistorico(historico) {
  fs.writeFileSync(HISTORICO_PATH, JSON.stringify(historico, null, 2), 'utf-8');
}

function deveGerarNovaLeitura(ultimoBloco) {
  if (!ultimoBloco) return true;
  const agora = new Date();
  const ultimaLeitura = new Date(ultimoBloco.iso);
  const diffMin = (agora - ultimaLeitura) / (1000 * 60);
  return diffMin >= 1;
}

app.get('/', async (req, res) => {
  const historico = lerHistorico();
  res.json(historico);
});

setInterval(async () => {
  const historico = lerHistorico();
  const ultimoBloco = historico[0];

  const agora = new Date();
  const timestamp = agora.toLocaleString('pt-BR');
  const iso = agora.toISOString();

  if (deveGerarNovaLeitura(ultimoBloco)) {
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

    historico.unshift(novaLeitura);
    historico.splice(100);
    salvarHistorico(historico);

    try {
      await publicarNovaLeitura(novaLeitura);
      await publicarHistorico(historico);
      console.log(`[MQTT] Publicado: ${timestamp}`);
    } catch (err) {
      console.error('Erro ao publicar no MQTT:', err);
    }
  }
}, 60 * 1000); 

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
