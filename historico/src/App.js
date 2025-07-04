const express = require('express');
const cors = require('cors');
const { lerHistorico, salvarHistorico } = require('./historicoUtils');
const HistSubscriber = require('./mqtt/HistSubscriber');

const app = express();
const PORT = 5027;

app.use(cors());

new HistSubscriber();

app.get('/historico', (req, res) => {
    try {
      const historico = lerHistorico();
      res.json(historico);
    } catch (err) {
      console.error('[HTTP] Erro ao obter histórico:', err);
      res.status(500).json({ erro: 'Erro ao ler histórico' });
    }
  });

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
