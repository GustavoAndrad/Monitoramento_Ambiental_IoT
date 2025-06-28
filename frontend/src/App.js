import { useEffect, useState } from 'react';
import './App.css';
import { climaSubject } from './climaSubject.js';
import { useAlertas } from './useAlertas.js';
import { useMqtt } from './useMqtt.js';

function App() {
  const alertas = useAlertas();

  const { subscribe, historico } = useMqtt(); // ✅ chamada única

  useEffect(() => {
    subscribe('clima/historico', (payload) => {
      try {
        const dados = Array.isArray(payload) ? payload : JSON.parse(payload);
        if (Array.isArray(dados)) {
          console.log('[App] Histórico atualizado via MQTT');
        }
      } catch (err) {
        console.error('Erro ao processar histórico MQTT:', err);
      }
    });

    subscribe('clima/atual', (payload) => {
      try {
        const novaLeitura = typeof payload === 'object' ? payload : JSON.parse(payload);
        climaSubject.notify(novaLeitura);
      } catch (err) {
        console.error('Erro ao processar leitura atual MQTT:', err);
      }
    });
  }, [subscribe]);

  function calcularMedia(sensor) {
    const valores = historico
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

  const weatherData = historico[0]
    ? {
        temperatura: historico[0].temperatura !== null ? `${historico[0].temperatura}°C` : '-',
        umidade: historico[0].umidade !== null ? `${historico[0].umidade}%` : '-',
        vento: historico[0].vento !== null ? `${historico[0].vento} km/h` : '-',
        timestamp: historico[0].timestamp,
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
        {/*modificar*/}
        <h3>Últimas {historico.length} medições</h3>
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
            {historico.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.timestamp}</td>
                <td>{item.temperatura ?? '-'}</td>
                <td>{item.umidade ?? '-'}</td>
                <td>{item.vento ?? '-'}</td>
              </tr>
            ))}
          </tbody>
          {historico.length > 0 && (
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
      </header>
    </div>
  );
}

export default App;
