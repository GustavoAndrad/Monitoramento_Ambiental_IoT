import { useEffect, useState } from 'react';
import './App.css';
import { useAlertas } from './useAlertas.js';
import { useMqtt } from './useMqtt.js';

function App() {
  const alertas = useAlertas();
  const { ultimoDado } = useMqtt();

  //Busca o histórico no servidor (Sem MQTT)
  const [historico, setHistorico] = useState([]);
  useEffect(() => {
    fetch('http://localhost:5027/historico')
      .then(res => res.json())
      .then(data => setHistorico(data))
      .catch(err => console.error('Erro ao buscar histórico:', err));
  }, [historico]);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [filtroAtivo, setFiltroAtivo] = useState('todos'); 
  const itensPorPagina = 10;

function parseDataLocal(timestamp) {
  if (!timestamp || typeof timestamp !== 'string') return new Date('Invalid');
  const [data, hora] = timestamp.split(', ');
  if (!data || !hora) return new Date('Invalid');

  const [dia, mes, ano] = data.split('/');
  if (!dia || !mes || !ano) return new Date('Invalid');

  return new Date(`${ano}-${mes}-${dia}T${hora}`);
}

// filtra o histórico 
const filtrarHistorico = () => {
  const agora = new Date();
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const seteDiasAtras = new Date(agora);
  seteDiasAtras.setDate(agora.getDate() - 7);
  const trintaDiasAtras = new Date(agora);
  trintaDiasAtras.setDate(agora.getDate() - 30);

  return historico.filter(item => {
    if (!item.timestamp) return false;

    try {
      const dataItem = parseDataLocal(item.timestamp);
      if (isNaN(dataItem.getTime())) return false;

      switch (filtroAtivo) {
        case 'hoje':
          return dataItem >= hoje;
        case '7dias':
          return dataItem >= seteDiasAtras;
        case '30dias':
          return dataItem >= trintaDiasAtras;
        default:
          return true;
      }
    } catch (e) {
      console.error('Erro ao processar data:', item.timestamp, e);
      return false;
    }
  });
};

  const historicoFiltrado = filtrarHistorico();

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const itensPagina = historicoFiltrado.slice(inicio, fim);
  const totalPaginas = Math.ceil(historicoFiltrado.length / itensPorPagina);

  const irParaPagina = (pagina) => {
    setPaginaAtual(pagina);
  };

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroAtivo]);

  function calcularMedia(sensor) {
    const valores = historicoFiltrado
      .map(item => item[sensor])
      .filter(v => v !== null && v !== undefined);
    if (valores.length === 0) return '-';
    const soma = valores.reduce((acc, val) => acc + val, 0);
    return (soma / valores.length).toFixed(1);
  }

  const media = {
    temperatura: calcularMedia('temperatura'),
    umidade: calcularMedia('umidade'),
    vento: calcularMedia('vento'),
  };

  const weatherData = ultimoDado
    ? {
        temperatura: ultimoDado.temperatura !== null ? `${ultimoDado.temperatura}°C` : '-',
        umidade: ultimoDado.umidade !== null ? `${ultimoDado.umidade}%` : '-',
        vento: ultimoDado.vento !== null ? `${ultimoDado.vento} km/h` : '-',
        timestamp: ultimoDado.timestamp,
      }
    : { temperatura: '-', umidade: '-', vento: '-', timestamp: '-' };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Painel do Clima</h1>
        <h2>Rio de Janeiro</h2>

        {alertas.length > 0 && (
          <div className="alertas">
            {alertas.map((msg, idx) => (
              <p key={idx}>{msg}</p>
            ))}
          </div>
        )}

        <div className="mosaic-header">
          <div className="mosaic-title">{weatherData.timestamp}</div>
        </div>

        <div className="mosaic-panel">
          <div className="card">
            <h2>Temperatura</h2>
            <p>{weatherData.temperatura}</p>
          </div>
          <div className="card">
            <h2>Umidade</h2>
            <p>{weatherData.umidade}</p>
          </div>
          <div className="card">
            <h2>Vento</h2>
            <p>{weatherData.vento}</p>
          </div>
        </div>

        <div className="filtros-container">
          <button 
            className={`filtro-btn ${filtroAtivo === 'todos' ? 'active' : ''}`}
            onClick={() => setFiltroAtivo('todos')}
          >
            Todos
          </button>
          <button 
            className={`filtro-btn ${filtroAtivo === 'hoje' ? 'active' : ''}`}
            onClick={() => setFiltroAtivo('hoje')}
          >
            Hoje
          </button>
          <button 
            className={`filtro-btn ${filtroAtivo === '7dias' ? 'active' : ''}`}
            onClick={() => setFiltroAtivo('7dias')}
          >
            Últimos 7 dias
          </button>
          <button 
            className={`filtro-btn ${filtroAtivo === '30dias' ? 'active' : ''}`}
            onClick={() => setFiltroAtivo('30dias')}
          >
            Últimos 30 dias
          </button>
        </div>

        <h3>Últimas {historicoFiltrado.length} medições (Página {paginaAtual} de {totalPaginas})</h3>
        
        <table className="weather-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Data e Hora</th>
              <th>Temperatura (°C)</th>
              <th>Umidade (%)</th>
              <th>Vento (km/h)</th>
            </tr>
          </thead>
          <tbody>
            {itensPagina.map((item, index) => (
              <tr key={inicio + index}>
                <td>{inicio + index + 1}</td>
                <td>{item.timestamp}</td>
                <td>{item.temperatura ?? '-'}</td>
                <td>{item.umidade ?? '-'}</td>
                <td>{item.vento ?? '-'}</td>
              </tr>
            ))}
          </tbody>
          {historicoFiltrado.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan="2"><strong>Média</strong></td>
                <td>{media.temperatura}</td>
                <td>{media.umidade}</td>
                <td>{media.vento}</td>
              </tr>
            </tfoot>
          )}
        </table>

        <div className="paginacao-container">
          <button 
            onClick={() => irParaPagina(paginaAtual - 1)} 
            disabled={paginaAtual === 1}
            className="paginacao-btn"
          >
            Anterior
          </button>
          
          <span className="paginacao-info">Página {paginaAtual} de {totalPaginas}</span>
          
          <button 
            onClick={() => irParaPagina(paginaAtual + 1)} 
            disabled={paginaAtual === totalPaginas || totalPaginas === 0}
            className="paginacao-btn"
          >
            Próxima
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;