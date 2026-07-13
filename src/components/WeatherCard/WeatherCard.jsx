import { useState, useEffect, useRef, Component, lazy, Suspense } from 'react';
import { FiWind, FiDroplet, FiMapPin, FiX, FiCheck, FiAlertTriangle, FiCrosshair } from 'react-icons/fi';
import './WeatherCard.css';

// ═══ Importação lazy do MapPicker — só carrega quando o modal abrir ═══
const MapPicker = lazy(() => import('../MapPicker/MapPicker'));

/**
 * ErrorBoundary — Captura erros de componentes filhos
 * Evita que um crash no mapa derrube toda a aplicação
 */
class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erro no mapa:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '20px', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
          <FiAlertTriangle size={20} />
          <span>Não foi possível carregar o mapa</span>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: '4px', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.6rem', cursor: 'pointer' }}
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * WeatherCard — Componente de previsão do tempo
 * Exibe previsão simplificada para os próximos 5 dias com
 * temperatura, velocidade do vento e probabilidade de chuva.
 * Usa a API OpenWeather (5-day forecast).
 *
 * Inclui seletor de localização via mapa.
 * Componente totalmente independente — não depende de props externas.
 */
export default function WeatherCard() {
  // ═══ Estados locais ═══
  const [previsao, setPrevisao] = useState(null);
  const [cidade, setCidade] = useState('');
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // ═══ Estados do seletor de localização ═══
  const [modalAberto, setModalAberto] = useState(false);
  const [latSel, setLatSel] = useState(47.9);
  const [lngSel, setLngSel] = useState(16.8);
  const [nomeSel, setNomeSel] = useState('');
  const [buscandoNome, setBuscandoNome] = useState(false);

  // ═══ Ref para debounce do Nominatim ═══
  const debounceRef = useRef(null);

  // ═══ Fetch com timeout (AbortController) ═══
  const fetchComTimeout = (url, ms = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
  };

  // ═══ Processa dados da API em formato de dias ═══
  const processarDados = (dados) => {
    const dias = {};
    dados.list.forEach((item) => {
      const data = item.dt_txt.split(' ')[0];
      if (!dias[data]) dias[data] = { temps: [], ventos: [], chuvas: [], icones: [] };
      dias[data].temps.push(item.main.temp);
      dias[data].ventos.push(item.wind.speed);
      dias[data].chuvas.push(item.pop || 0);
      if (item.weather[0]?.icon) dias[data].icones.push(item.weather[0].icon);
    });

    return Object.entries(dias).slice(0, 5).map(([data, info]) => {
      const d = new Date(data + 'T00:00:00');
      return {
        data,
        diaSemana: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
        diaMes: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
        tempMax: Math.round(Math.max(...info.temps)),
        tempMin: Math.round(Math.min(...info.temps)),
        ventoMax: +Math.max(...info.ventos).toFixed(1),
        chuvaMax: Math.round(Math.max(...info.chuvas) * 100),
        iconeMeio: info.icones[Math.floor(info.icones.length / 2)],
      };
    });
  };

  // ═══ Busca previsão por nome da cidade ═══
  const buscarPorCidade = async (cidadeNome) => {
    setCarregando(true);
    setErro(null);
    try {
      const chave = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!chave || chave === 'SUA_CHAVE_AQUI') {
        setErro('Chave da API não configurada');
        setCarregando(false);
        return;
      }

      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidadeNome)}&appid=${chave}&units=metric&lang=pt`;
      const resposta = await fetchComTimeout(url);
      if (!resposta.ok) {
        setErro(`Cidade não encontrada: ${cidadeNome}`);
        setCarregando(false);
        return;
      }

      const dados = await resposta.json();
      setCidade(dados.city?.name || cidadeNome);
      setPrevisao(processarDados(dados));
      setCarregando(false);
    } catch {
      setErro('Erro ao buscar previsão do tempo');
      setCarregando(false);
    }
  };

  // ═══ Busca previsão por coordenadas ═══
  const buscarPorCoords = async (lat, lng, nome) => {
    setCarregando(true);
    setErro(null);
    try {
      const chave = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!chave || chave === 'SUA_CHAVE_AQUI') {
        setErro('Chave da API não configurada');
        setCarregando(false);
        return;
      }

      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${chave}&units=metric&lang=pt`;
      const resposta = await fetchComTimeout(url);
      if (!resposta.ok) {
        setErro('Localização não encontrada');
        setCarregando(false);
        return;
      }

      const dados = await resposta.json();
      setCidade(nome || dados.city?.name || `${lat.toFixed(2)}, ${lng.toFixed(2)}`);
      setPrevisao(processarDados(dados));
      setCarregando(false);
    } catch {
      setErro('Erro ao buscar previsão do tempo');
      setCarregando(false);
    }
  };

  // ═══ Carrega dados iniciais (por nome da cidade) ═══
  useEffect(() => {
    const cidadePadrao = import.meta.env.VITE_WEATHER_CITY || 'Pannonia Gols';
    buscarPorCidade(cidadePadrao);
  }, []);

  // ═══ Reverse geocoding via Nominatim (com debounce) ═══
  const buscarNomeLocal = (lat, lng) => {
    setBuscandoNome(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const resp = await fetchComTimeout(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=pt`,
          4000
        );
        if (resp.ok) {
          const dados = await resp.json();
          setNomeSel(dados.address?.city || dados.address?.town || dados.address?.village || `${lat.toFixed(3)}, ${lng.toFixed(3)}`);
        } else {
          setNomeSel(`${lat.toFixed(3)}, ${lng.toFixed(3)}`);
        }
      } catch {
        setNomeSel(`${lat.toFixed(3)}, ${lng.toFixed(3)}`);
      }
      setBuscandoNome(false);
    }, 500);
  };

  // ═══ Limpa debounce ao desmontar ═══
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ═══ Auto-dismiss do erro após 5 segundos (quando já tem previsão) ═══
  useEffect(() => {
    if (erro && previsao) {
      const timer = setTimeout(() => setErro(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [erro, previsao]);

  // ═══ Busca localização atual via Geolocation API ═══
  const buscarLocalizacaoAtual = () => {
    if (!navigator.geolocation) {
      setErro('Geolocalização não suportada pelo navegador');
      return;
    }
    setCarregando(true);
    setErro(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // ═══ Busca previsão direto pelas coordenadas (OpenWeather retorna o nome da cidade) ═══
        const chave = import.meta.env.VITE_OPENWEATHER_API_KEY;
        if (!chave || chave === 'SUA_CHAVE_AQUI') {
          setErro('Chave da API não configurada');
          setCarregando(false);
          return;
        }
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${chave}&units=metric&lang=pt`;
        fetchComTimeout(url)
          .then(resp => {
            if (!resp.ok) {
              setErro('Localização não encontrada');
              setCarregando(false);
              return;
            }
            return resp.json();
          })
          .then(dados => {
            if (dados) {
              const nomeCidade = dados.city?.name || `Minha localização`;
              setCidade(nomeCidade);
              setPrevisao(processarDados(dados));
              setCarregando(false);
            }
          })
          .catch(() => {
            setErro('Erro ao buscar localização atual');
            setCarregando(false);
          });
      },
      (err) => {
        setErro('Não foi possível obter sua localização. Verifique as permissões.');
        setCarregando(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  // ═══ Cor da chuva conforme probabilidade (0%=verde → 100%=vermelho) ═══
  const corChuva = (percentual) => {
    // Interpolação: verde(0%) → amarelo(33%) → laranja(66%) → vermelho(100%)
    const t = Math.min(percentual, 100) / 100;
    if (t <= 0.33) {
      // Verde → Amarelo
      const p = t / 0.33;
      return `rgb(${Math.round(34 + p * 200)}, ${Math.round(197 - p * 10)}, ${Math.round(94 - p * 86)})`;
    } else if (t <= 0.66) {
      // Amarelo → Laranja
      const p = (t - 0.33) / 0.33;
      return `rgb(${Math.round(234 + p * 15)}, ${Math.round(187 - p * 70)}, ${Math.round(8 - p * 8)})`;
    } else {
      // Laranja → Vermelho
      const p = (t - 0.66) / 0.34;
      return `rgb(${Math.round(249 - p * 10)}, ${Math.round(117 - p * 49)}, ${Math.round(0 + p * 68)})`;
    }
  };

  // ═══ Cor do vento conforme intensidade (≤5=padrão, >5=amarelo→vermelho) ═══
  const corVento = (velocidade) => {
    if (velocidade <= 5) return undefined; // Padrão
    // Escala de 5 a 12 m/s: amarelo → laranja → vermelho
    const t = Math.min((velocidade - 5) / 7, 1);
    if (t <= 0.5) {
      // Amarelo → Laranja
      const p = t / 0.5;
      return `rgb(${Math.round(234 + p * 15)}, ${Math.round(187 - p * 70)}, ${Math.round(8 - p * 8)})`;
    } else {
      // Laranja → Vermelho
      const p = (t - 0.5) / 0.5;
      return `rgb(${Math.round(249 - p * 10)}, ${Math.round(117 - p * 49)}, ${Math.round(0 + p * 68)})`;
    }
  };

  // ═══ Mapeia ícones OpenWeather para emoji visual ═══
  const iconeParaEmoji = (icone) => {
    if (!icone) return '🌤';
    if (icone.startsWith('01')) return '☀️';
    if (icone.startsWith('02')) return '⛅';
    if (icone.startsWith('03')) return '☁️';
    if (icone.startsWith('04')) return '☁️';
    if (icone.startsWith('09')) return '🌧';
    if (icone.startsWith('10')) return '🌦';
    if (icone.startsWith('11')) return '⛈';
    if (icone.startsWith('13')) return '🌨';
    if (icone.startsWith('50')) return '🌫';
    return '🌤';
  };

  // ═══ Estado de carregamento inicial (sem dados ainda) ═══
  if (carregando && !previsao) {
    return (
      <div className="weather-card">
        <div className="weather-loading">
          <div className="weather-spinner"></div>
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  // ═══ Erro crítico inicial (sem dados e com erro) ═══
  if (erro && !previsao) {
    return (
      <div className="weather-card">
        <div className="weather-error">
          <span>{erro}</span>
        </div>
      </div>
    );
  }

  // ═══ Renderização da previsão ═══
  return (
    <>
      <div className="weather-card fade-in">
        {/* Hint de erro (aparece como aviso sutil sem esconder o card) */}
        {erro && previsao && (
          <div className="weather-hint">
            <FiAlertTriangle size={10} />
            <span>{erro}</span>
            <button className="weather-hint-close" onClick={() => setErro(null)}>×</button>
          </div>
        )}

        {/* Cabeçalho com nome da cidade e botões de localização */}
        <div className="weather-header">
          <span className="weather-city">{cidade}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="weather-label">Previsão 5 dias</span>
            {/* Botão GPS — busca localização atual automaticamente */}
            <button
              className="weather-gps-btn"
              onClick={buscarLocalizacaoAtual}
              title="Usar minha localização atual"
            >
              <FiCrosshair />
            </button>
            {/* Botão mapa — abre seletor visual no mapa */}
            <button
              className="weather-map-btn"
              onClick={() => setModalAberto(true)}
              title="Escolher localização no mapa"
            >
              <FiMapPin />
              <span>Mapa</span>
            </button>
          </div>
        </div>

        {/* Lista de dias */}
        <div className="weather-days">
          {previsao && previsao.map((dia) => (
            <div key={dia.data} className="weather-day">
              {/* Dia e data */}
              <div className="weather-day-info">
                <span className="weather-day-name">{dia.diaSemana}</span>
                <span className="weather-day-date">{dia.diaMes}</span>
              </div>

              {/* Ícone + Temperatura */}
              <div className="weather-day-temp">
                <span className="weather-emoji">{iconeParaEmoji(dia.iconeMeio)}</span>
                <span className="weather-temp-max">{dia.tempMax}°</span>
                <span className="weather-temp-min">{dia.tempMin}°</span>
              </div>

              {/* Métricas: vento e chuva */}
              <div className="weather-day-metrics">
                <div className="weather-metric">
                  <FiWind className="weather-metric-icon wind" style={{ color: corVento(dia.ventoMax) }} />
                  <span style={{ color: corVento(dia.ventoMax) }}>{dia.ventoMax}<small>m/s</small></span>
                </div>
                <div className="weather-metric">
                  <FiDroplet className="weather-metric-icon rain" style={{ color: corChuva(dia.chuvaMax) }} />
                  <span style={{ color: corChuva(dia.chuvaMax) }}>{dia.chuvaMax}<small>%</small></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Modal de seleção de localização ═══ */}
      {modalAberto && (
        <div className="weather-modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="weather-modal" onClick={(e) => e.stopPropagation()}>
            {/* Cabeçalho do modal */}
            <div className="weather-modal-header">
              <span className="weather-modal-title">Selecionar localização</span>
              <button className="weather-modal-close" onClick={() => setModalAberto(false)}>
                <FiX />
              </button>
            </div>

            {/* Dica de uso */}
            <div className="weather-modal-hint">
              Mova o mapa para posicionar o pin
            </div>

            {/* Mapa interativo — pin fixo, mapa móvel (lazy loaded) */}
            <MapErrorBoundary>
              <Suspense fallback={<div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Carregando mapa...</div>}>
                <MapPicker
                  center={[latSel, lngSel]}
                  onMove={(lat, lng) => {
                    setLatSel(lat);
                    setLngSel(lng);
                    buscarNomeLocal(lat, lng);
                  }}
                  zoom={10}
                  className="weather-modal-map"
                />
              </Suspense>
            </MapErrorBoundary>

            {/* Info da localização atual */}
            <div className="weather-modal-info">
              <FiMapPin className="weather-modal-info-icon" />
              <span className="weather-modal-info-name">
                {buscandoNome ? 'Buscando...' : nomeSel}
              </span>
              <span className="weather-modal-coords">
                {latSel.toFixed(4)}°, {lngSel.toFixed(4)}°
              </span>
            </div>

            {/* Botão de confirmação */}
            <button
              className="weather-modal-confirm"
              onClick={() => {
                buscarPorCoords(latSel, lngSel, nomeSel);
                setModalAberto(false);
              }}
            >
              <FiCheck />
              <span>Confirmar localização</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
