const fs = require('fs');
const path = require('path');

const HISTORICO_PATH = path.join(__dirname, 'historico.json');

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

module.exports = {lerHistorico, salvarHistorico}