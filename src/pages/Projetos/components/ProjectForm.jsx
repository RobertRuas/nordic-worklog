import React, { useState, useRef, useEffect, lazy, Suspense, Component } from 'react';
import { FiArrowLeft, FiEdit2, FiTrash2, FiSave, FiX, FiMapPin, FiUser, FiFileText, FiGlobe, FiPlus, FiCheck, FiUsers, FiPaperclip, FiUpload, FiAlertTriangle } from 'react-icons/fi';
import useImageResize from '../../../hooks/useImageResize';

// ═══ Importação lazy do MapPicker — só carrega quando o modal abrir ═══
const MapPicker = lazy(() => import('../../../components/MapPicker/MapPicker'));

/**
 * ErrorBoundary — Captura erros do componente de mapa
 * Evita que um crash no mapa derrube toda a aplicação.
 */
class MapErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '20px', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
          <FiAlertTriangle size={20} />
          <span>Não foi possível carregar o mapa</span>
          <button onClick={() => this.setState({ hasError: false })} style={{ marginTop: '4px', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.6rem', cursor: 'pointer' }}>Tentar novamente</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ═══ Constantes de validação de anexos ═══
const MAX_TAMANHO_DOC = 10 * 1024 * 1024;   // 10MB para documentos
const MAX_TAMANHO_FOTO = 5 * 1024 * 1024;    // 5MB para fotos
const TIPOS_PERMITIDOS = [
  'application/pdf',
  'image/png', 'image/jpeg',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * Componente ProjectForm didático
 * Exibe o formulário com todas as informações do projeto.
 * Permite visualizar, editar, excluir e criar novos projetos.
 * Inclui seletor de localização via mapa e anexos de arquivos.
 * 
 * @param {Object} projeto - Os dados completos do projeto (vazio se for novo).
 * @param {function} onVoltar - Função para voltar à lista de projetos.
 * @param {function} onSalvar - Função para salvar as alterações ou novo projeto.
 * @param {function} onExcluir - Função para excluir o projeto (null se for novo).
 * @param {boolean} modoNovo - Indica se o formulário está em modo de criação.
 */
export default function ProjectForm({ projeto, onVoltar, onSalvar, onExcluir, modoNovo = false }) {
  // Estado local para controlar o modo de edição e os dados do formulário
  // Se for um novo projeto, já inicia em modo de edição
  const [editando, setEditando] = useState(modoNovo);
  const [form, setForm] = useState({ tecnicos: [], anexos: [], ...projeto });

  // ═══ Estado para mensagens de erro de validação ═══
  const [erros, setErros] = useState({});

  // Estado para o formulário de novo técnico (inline)
  const [novoTecnico, setNovoTecnico] = useState({ nome: '', irataLevel: '', windaId: '' });
  const [mostrarFormTecnico, setMostrarFormTecnico] = useState(false);
  const [editandoTecnicoId, setEditandoTecnicoId] = useState(null);

  // ═══ Estados do seletor de localização (mapa) ═══
  const [modalMapaAberto, setModalMapaAberto] = useState(false);
  const [latSel, setLatSel] = useState(form.latitude || 47.9);
  const [lngSel, setLngSel] = useState(form.longitude || 16.8);
  const [nomeSel, setNomeSel] = useState(form.localizacao || '');
  const [buscandoNome, setBuscandoNome] = useState(false);
  const debounceRef = useRef(null);

  // ═══ Estados de anexos ═══
  const [erroAnexo, setErroAnexo] = useState('');
  const { redimensionar } = useImageResize();
  const inputAnexoRef = useRef(null);

  // ═══ Estado para preview de imagem em modal ═══
  const [anexoPreview, setAnexoPreview] = useState(null);

  // Função para atualizar um campo específico do formulário
  const atualizarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    // Limpa o erro do campo ao editar
    if (erros[campo]) setErros((prev) => ({ ...prev, [campo]: '' }));
  };

  // ═══ Validação dos campos obrigatórios antes de salvar ═══
  const validar = () => {
    const novosErros = {};

    if (!form.nome || !form.nome.trim()) novosErros.nome = 'Nome é obrigatório';
    if (!form.cliente || !form.cliente.trim()) novosErros.cliente = 'Cliente é obrigatório';
    if (!form.escopo || !form.escopo.trim()) novosErros.escopo = 'Escopo é obrigatório';
    if (!form.descricao || !form.descricao.trim()) novosErros.descricao = 'Descrição é obrigatória';
    if (!form.localizacao || !form.localizacao.trim()) novosErros.localizacao = 'Localização é obrigatória';

    // Pelo menos 1 técnico cadastrado
    if (!form.tecnicos || form.tecnicos.length === 0) {
      novosErros.tecnicos = 'Pelo menos 1 técnico é obrigatório';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Função para salvar as alterações feitas no projeto
  const handleSalvar = () => {
    // Valida antes de salvar
    if (!validar()) return;
    onSalvar(form);
    setEditando(false);
    setErros({});
    // Se for um novo projeto, após salvar volta para a lista
    if (modoNovo) onVoltar();
  };

  // Função para cancelar a edição e restaurar os dados originais
  const handleCancelar = () => {
    setForm({ ...projeto });
    setEditando(false);
  };

  // Função para confirmar a exclusão do projeto
  const handleExcluir = () => {
    if (window.confirm(`Deseja realmente excluir o projeto "${projeto.nome}"?`)) {
      onExcluir(projeto.id);
    }
  };

  // ═══ Funções CRUD para Técnicos ═══

  // Adiciona um novo técnico à lista do projeto
  const adicionarTecnico = () => {
    if (!novoTecnico.nome || !novoTecnico.irataLevel || !novoTecnico.windaId) return;
    const tecnico = { ...novoTecnico, id: Date.now() };
    setForm((prev) => ({ ...prev, tecnicos: [...(prev.tecnicos || []), tecnico] }));
    setNovoTecnico({ nome: '', irataLevel: '', windaId: '' });
    setMostrarFormTecnico(false);
  };

  // Remove um técnico da lista do projeto
  const removerTecnico = (id) => {
    setForm((prev) => ({ ...prev, tecnicos: (prev.tecnicos || []).filter((t) => t.id !== id) }));
  };

  // Inicia a edição de um técnico existente
  const iniciarEdicaoTecnico = (tecnico) => {
    setEditandoTecnicoId(tecnico.id);
    setNovoTecnico({ nome: tecnico.nome, irataLevel: tecnico.irataLevel, windaId: tecnico.windaId });
    setMostrarFormTecnico(true);
  };

  // Salva as alterações de um técnico existente
  const salvarEdicaoTecnico = () => {
    setForm((prev) => ({
      ...prev,
      tecnicos: (prev.tecnicos || []).map((t) =>
        t.id === editandoTecnicoId ? { ...t, ...novoTecnico } : t
      ),
    }));
    setNovoTecnico({ nome: '', irataLevel: '', windaId: '' });
    setMostrarFormTecnico(false);
    setEditandoTecnicoId(null);
  };

  // Cancela a edição/adicionação de técnico
  const cancelarFormTecnico = () => {
    setNovoTecnico({ nome: '', irataLevel: '', windaId: '' });
    setMostrarFormTecnico(false);
    setEditandoTecnicoId(null);
  };

  // ═══ Funções do Seletor de Localização (Mapa) ═══

  // Fetch com timeout (AbortController) — reutiliza padrão do WeatherCard
  const fetchComTimeout = (url, ms = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
  };

  // Reverse geocoding via Nominatim (com debounce)
  const buscarNomeLocal = (lat, lng) => {
    setBuscandoNome(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const resp = await fetchComTimeout(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=pt`
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

  // Confirma a localização selecionada no mapa
  const confirmarLocalizacao = () => {
    setForm((prev) => ({
      ...prev,
      localizacao: nomeSel,
      latitude: latSel,
      longitude: lngSel,
    }));
    setModalMapaAberto(false);
  };

  // Limpa debounce ao desmontar
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  // ═══ Funções de Anexo ═══

  // Formata tamanho em bytes para exibição legível
  const formatarTamanho = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Retorna ícone apropriada para o tipo de arquivo
  const iconeAnexo = (tipo) => {
    if (tipo.includes('pdf')) return 'PDF';
    if (tipo.includes('image')) return 'IMG';
    if (tipo.includes('excel') || tipo.includes('sheet')) return 'XLS';
    if (tipo.includes('word') || tipo.includes('document')) return 'DOC';
    return 'FILE';
  };

  // Processa arquivos selecionados — valida tipo/tamanho e redimensiona fotos
  const handleAnexos = async (e) => {
    setErroAnexo('');
    const arquivos = Array.from(e.target.files);
    if (!arquivos.length) return;

    const novosAnexos = [];
    for (const arquivo of arquivos) {
      // Validação de tipo
      if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
        setErroAnexo(`Tipo não permitido: ${arquivo.name}`);
        continue;
      }
      // Validação de tamanho
      const maxTipo = arquivo.type.startsWith('image/') ? MAX_TAMANHO_FOTO : MAX_TAMANHO_DOC;
      if (arquivo.size > maxTipo) {
        setErroAnexo(`${arquivo.name} excede o limite de ${formatarTamanho(maxTipo)}`);
        continue;
      }
      // ═══ Redimensionamento automático para fotos grandes ═══
      let arquivoFinal = arquivo;
      if (arquivo.type.startsWith('image/')) {
        arquivoFinal = await redimensionar(arquivo);
      }
      // Cria preview para imagens
      const preview = arquivoFinal.type.startsWith('image/')
        ? URL.createObjectURL(arquivoFinal)
        : null;
      novosAnexos.push({
        id: Date.now() + Math.random(),
        nome: arquivoFinal.name,
        tipo: arquivoFinal.type,
        tamanho: arquivoFinal.size,
        preview,
        arquivo: arquivoFinal,
      });
    }
    if (novosAnexos.length) {
      setForm((prev) => ({ ...prev, anexos: [...(prev.anexos || []), ...novosAnexos] }));
    }
    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    if (inputAnexoRef.current) inputAnexoRef.current.value = '';
  };

  // Remove um anexo da lista
  const removerAnexo = (id) => {
    setForm((prev) => {
      const anexo = (prev.anexos || []).find((a) => a.id === id);
      if (anexo?.preview) URL.revokeObjectURL(anexo.preview);
      return { ...prev, anexos: (prev.anexos || []).filter((a) => a.id !== id) };
    });
  };

  // Estilo reutilizável para os rótulos dos campos (rótulo sutil e discreto)
  const estiloLabel = {
    fontSize: '0.65rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '2px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    opacity: 0.7,
  };

  // Estilo reutilizável para os valores em modo visualização (destaque claro)
  const estiloValor = {
    fontSize: '0.9rem',
    fontWeight: 400,
    color: 'var(--text-primary)',
    lineHeight: '1.5',
    paddingTop: '2px',
    paddingBottom: '10px',
    borderBottom: '1px solid var(--border-color)',
  };

  // Estilo reutilizável para os inputs e textareas
  const estiloInput = {
    width: '100%',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '5px 10px',
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-main)',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    marginBottom: '6px',
  };

  return (
    <div className="fade-in">
      {/* Barra superior com botão de voltar e ações */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        {/* Botão Voltar */}
        <button
          onClick={onVoltar}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}
        >
          <FiArrowLeft />
          Voltar
        </button>

        {/* Botões de Ação (Editar/Salvar/Cancelar/Excluir) */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {editando ? (
            <>
              {/* Botão Salvar */}
              <button
                onClick={handleSalvar}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#22c55e', padding: '4px 8px', borderRadius: '4px', border: '1px solid #22c55e' }}
              >
                <FiSave /> Salvar
              </button>
              {/* Botão Cancelar */}
              <button
                onClick={handleCancelar}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
              >
                <FiX /> Cancelar
              </button>
            </>
          ) : (
            <>
              {/* Botão Editar */}
              <button
                onClick={() => setEditando(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-primary)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
              >
                <FiEdit2 /> Editar
              </button>
              {/* Botão Excluir (não exibido para novos projetos) */}
              {!modoNovo && (
                <button
                  onClick={handleExcluir}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ef4444' }}
                >
                  <FiTrash2 /> Excluir
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Formulário com as informações do projeto */}
      <div className="card">
        {/* Hint de validação — aparece quando há erros de campos obrigatórios */}
        {Object.keys(erros).length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 10px', marginBottom: '10px', borderRadius: '6px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            fontSize: '0.7rem', color: '#ef4444',
          }}>
            <FiAlertTriangle size={12} style={{ flexShrink: 0 }} />
            <span>Verifique os campos obrigatórios destacados abaixo.</span>
          </div>
        )}

        <h2 className="card-title">{modoNovo ? 'Novo Projeto' : 'Detalhes do Projeto'}</h2>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Campo: Nome do Projeto/Site */}
          <div>
            <label style={estiloLabel}>
              <FiGlobe /> Projeto {erros.nome && <span style={{ color: '#ef4444', fontSize: '0.6rem' }}>({erros.nome})</span>}
            </label>
            {editando ? (
              <input
                type="text"
                value={form.nome}
                onChange={(e) => atualizarCampo('nome', e.target.value)}
                style={{ ...estiloInput, borderColor: erros.nome ? '#ef4444' : 'var(--border-color)' }}
                placeholder="Nome do projeto ou site"
              />
            ) : (
              <p style={estiloValor}>{form.nome}</p>
            )}
          </div>

          {/* ═══ Campo: Localização do Parque/Site (via MapPicker) ═══ */}
          <div style={{ marginTop: '10px' }}>
            <label style={estiloLabel}>
              <FiMapPin /> Localização do Parque/Site {erros.localizacao && <span style={{ color: '#ef4444', fontSize: '0.6rem' }}>({erros.localizacao})</span>}
            </label>
            {editando ? (
              <div>
                {/* Botão para abrir o seletor de mapa */}
                <button
                  type="button"
                  onClick={() => {
                    // Sincroniza coords atuais do form ao abrir
                    if (form.latitude) setLatSel(form.latitude);
                    if (form.longitude) setLngSel(form.longitude);
                    if (form.localizacao) setNomeSel(form.localizacao);
                    setModalMapaAberto(true);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', width: '100%',
                    padding: '8px 10px', borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)', cursor: 'pointer',
                    fontSize: '0.85rem', color: 'var(--text-primary)',
                    fontFamily: 'var(--font-main)',
                  }}
                >
                  <FiMapPin style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                  <span style={{ flex: 1, textAlign: 'left', opacity: form.localizacao ? 1 : 0.5 }}>
                    {form.localizacao || 'Selecionar no mapa...'}
                  </span>
                  {form.latitude && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.6, whiteSpace: 'nowrap' }}>
                      {form.latitude.toFixed(3)}, {form.longitude.toFixed(3)}
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <div>
                <p style={estiloValor}>
                  {form.localizacao || '—'}
                  {form.latitude && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.6, marginLeft: '8px' }}>
                      ({form.latitude.toFixed(4)}, {form.longitude.toFixed(4)})
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Campo: Cliente */}
          <div style={{ marginTop: '10px' }}>
            <label style={estiloLabel}>
              <FiUser /> Cliente {erros.cliente && <span style={{ color: '#ef4444', fontSize: '0.6rem' }}>({erros.cliente})</span>}
            </label>
            {editando ? (
              <input
                type="text"
                value={form.cliente}
                onChange={(e) => atualizarCampo('cliente', e.target.value)}
                style={{ ...estiloInput, borderColor: erros.cliente ? '#ef4444' : 'var(--border-color)' }}
                placeholder="Nome do cliente"
              />
            ) : (
              <p style={estiloValor}>{form.cliente}</p>
            )}
          </div>

          {/* Campo: Escopo */}
          <div style={{ marginTop: '10px' }}>
            <label style={estiloLabel}>
              <FiFileText /> Escopo {erros.escopo && <span style={{ color: '#ef4444', fontSize: '0.6rem' }}>({erros.escopo})</span>}
            </label>
            {editando ? (
              <input
                type="text"
                value={form.escopo}
                onChange={(e) => atualizarCampo('escopo', e.target.value)}
                style={{ ...estiloInput, borderColor: erros.escopo ? '#ef4444' : 'var(--border-color)' }}
                placeholder="Ex: Desenvolvimento Web, Design, Consultoria..."
              />
            ) : (
              <p style={estiloValor}>{form.escopo}</p>
            )}
          </div>

          {/* Campo: Descrição */}
          <div style={{ marginTop: '10px' }}>
            <label style={estiloLabel}>
              <FiFileText /> Descrição {erros.descricao && <span style={{ color: '#ef4444', fontSize: '0.6rem' }}>({erros.descricao})</span>}
            </label>
            {editando ? (
              <textarea
                value={form.descricao}
                onChange={(e) => atualizarCampo('descricao', e.target.value)}
                rows={4}
                style={{ ...estiloInput, resize: 'vertical', borderColor: erros.descricao ? '#ef4444' : 'var(--border-color)' }}
                placeholder="Descreva os detalhes do projeto..."
              />
            ) : (
              <p style={{ ...estiloValor, whiteSpace: 'pre-wrap' }}>{form.descricao}</p>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Seção: Técnicos do Projeto ═══ */}
      <div className="card" style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title" style={{ margin: 0 }}>
            Técnicos {erros.tecnicos && <span style={{ color: '#ef4444', fontSize: '0.65rem', fontWeight: 400 }}>({erros.tecnicos})</span>}
          </h2>
          {/* Botão para adicionar técnico (apenas em modo de edição) */}
          {editando && !mostrarFormTecnico && (
            <button
              onClick={() => setMostrarFormTecnico(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '0.7rem', color: 'var(--text-primary)',
                padding: '4px 8px', borderRadius: '4px',
                border: '1px solid var(--border-color)', cursor: 'pointer',
              }}
            >
              <FiPlus /> Adicionar
            </button>
          )}
        </div>

        {/* Lista de técnicos cadastrados no projeto */}
        <div style={{ marginTop: '12px' }}>
          {(form.tecnicos || []).length === 0 && !mostrarFormTecnico ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
              Nenhum técnico cadastrado.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(form.tecnicos || []).map((tec, index) => (
                <div
                  key={tec.id}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                  }}
                >
                  {/* Informações do técnico em uma só linha */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                    {/* Número de ordem */}
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)',
                      minWidth: '18px', opacity: 0.6,
                    }}>
                      {index + 1}.
                    </span>
                    {/* Nome em destaque */}
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {tec.nome}
                    </span>
                    {/* IRATA Level e WindaID na mesma linha */}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.8 }}>
                      {tec.irataLevel} · {tec.windaId}
                    </span>
                  </div>
                  {/* Ações do técnico (apenas em modo de edição) */}
                  {editando && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => iniciarEdicaoTecnico(tec)}
                        style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        title="Editar técnico"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => removerTecnico(tec.id)}
                        style={{ fontSize: '0.7rem', color: '#ef4444', cursor: 'pointer' }}
                        title="Remover técnico"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulário inline para adicionar/editar técnico */}
        {mostrarFormTecnico && editando && (
          <div style={{
            marginTop: '12px', padding: '10px', borderRadius: '6px',
            border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
          }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {editandoTecnicoId ? 'Editar Técnico' : 'Novo Técnico'}
            </p>

            {/* Campo: Nome do Técnico */}
            <div>
              <label style={estiloLabel}>Nome</label>
              <input
                type="text"
                value={novoTecnico.nome}
                onChange={(e) => setNovoTecnico((prev) => ({ ...prev, nome: e.target.value }))}
                style={estiloInput}
                placeholder="Nome completo do técnico"
              />
            </div>

            {/* IRATA Level e WindaID lado a lado */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
              <div>
                <label style={estiloLabel}>IRATA Level</label>
                <select
                  value={novoTecnico.irataLevel}
                  onChange={(e) => setNovoTecnico((prev) => ({ ...prev, irataLevel: e.target.value }))}
                  style={{ ...estiloInput, cursor: 'pointer' }}
                >
                  <option value="">Selecionar...</option>
                  <option value="L1">L1</option>
                  <option value="L2">L2</option>
                  <option value="L3">L3</option>
                </select>
              </div>
              <div>
                <label style={estiloLabel}>Winda ID</label>
                <input
                  type="text"
                  value={novoTecnico.windaId}
                  onChange={(e) => setNovoTecnico((prev) => ({ ...prev, windaId: e.target.value }))}
                  style={estiloInput}
                  placeholder="Ex: RR055273BR"
                />
              </div>
            </div>

            {/* Botões de ação do técnico */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                onClick={editandoTecnicoId ? salvarEdicaoTecnico : adicionarTecnico}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '0.7rem', color: '#22c55e',
                  padding: '4px 10px', borderRadius: '4px',
                  border: '1px solid #22c55e', cursor: 'pointer',
                }}
              >
                <FiCheck /> {editandoTecnicoId ? 'Salvar' : 'Adicionar'}
              </button>
              <button
                onClick={cancelarFormTecnico}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '0.7rem', color: 'var(--text-secondary)',
                  padding: '4px 10px', borderRadius: '4px',
                  border: '1px solid var(--border-color)', cursor: 'pointer',
                }}
              >
                <FiX /> Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Seção: Anexos do Projeto ═══ */}
      <div className="card" style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title" style={{ margin: 0 }}>Anexos</h2>
          {/* Botão para adicionar anexo (apenas em modo de edição) */}
          {editando && (
            <button
              onClick={() => inputAnexoRef.current?.click()}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '0.7rem', color: 'var(--text-primary)',
                padding: '4px 8px', borderRadius: '4px',
                border: '1px solid var(--border-color)', cursor: 'pointer',
              }}
            >
              <FiUpload /> Enviar
            </button>
          )}
        </div>

        {/* Input oculto para seleção de arquivos */}
        <input
          ref={inputAnexoRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.xls,.xlsx,.doc,.docx"
          style={{ display: 'none' }}
          onChange={handleAnexos}
        />

        {/* Mensagem de erro de validação */}
        {erroAnexo && (
          <p style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FiAlertTriangle size={10} /> {erroAnexo}
          </p>
        )}

        {/* Dica de formatos aceitos */}
        <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.6, marginTop: '6px' }}>
          PDF, Excel, Word, Fotos — máx. 10MB (docs) / 5MB (fotos)
        </p>

        {/* Lista de anexos */}
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {(form.anexos || []).length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
              Nenhum anexo adicionado.
            </p>
          ) : (
            (form.anexos || []).map((anexo) => {
              // Verifica se o anexo é uma imagem para permitir preview
              const ehImagem = anexo.tipo?.startsWith('image/') || anexo.preview;
              return (
              <div
                key={anexo.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 10px', borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  cursor: ehImagem ? 'pointer' : 'default',
                }}
                onClick={() => ehImagem && setAnexoPreview(anexo)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                  {/* Badge com tipo do arquivo */}
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 600, color: 'var(--bg-primary)',
                    background: 'var(--text-secondary)', borderRadius: '3px',
                    padding: '2px 5px', flexShrink: 0, letterSpacing: '0.03em',
                  }}>
                    {iconeAnexo(anexo.tipo)}
                  </span>
                  {/* Nome e tamanho */}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {anexo.nome}
                    </p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', margin: 0, opacity: 0.7 }}>
                      {formatarTamanho(anexo.tamanho)}
                    </p>
                  </div>
                </div>
                {/* Botão remover (apenas em modo de edição) */}
                {editando && (
                  <button
                    onClick={() => removerAnexo(anexo.id)}
                    style={{ fontSize: '0.7rem', color: '#ef4444', cursor: 'pointer', flexShrink: 0, marginLeft: '8px' }}
                    title="Remover anexo"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
              );
            })
          )}
        </div>
      </div>

      {/* ═══ Modal de Preview de Imagem ═══ */}
      {anexoPreview && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.8)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '16px',
          }}
          onClick={() => setAnexoPreview(null)}
        >
          <div
            style={{
              position: 'relative', maxWidth: '90vw', maxHeight: '90vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão fechar */}
            <button
              onClick={() => setAnexoPreview(null)}
              style={{
                position: 'absolute', top: '-12px', right: '-12px',
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1,
              }}
            >
              <FiX size={14} />
            </button>
            {/* Imagem em tamanho máximo */}
            <img
              src={anexoPreview.preview}
              alt={anexoPreview.nome}
              style={{
                maxWidth: '90vw', maxHeight: '85vh',
                borderRadius: '8px', objectFit: 'contain',
                border: '1px solid var(--border-color)',
              }}
            />
            {/* Nome do arquivo */}
            <p style={{
              textAlign: 'center', fontSize: '0.7rem', color: '#fff',
              marginTop: '8px', opacity: 0.8,
            }}>
              {anexoPreview.nome}
            </p>
          </div>
        </div>
      )}

      {/* ═══ Modal de Seleção de Localização (Mapa) ═══ */}
      {modalMapaAberto && editando && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '16px',
          }}
          onClick={() => setModalMapaAberto(false)}
        >
          <div
            style={{
              background: 'var(--bg-secondary)', borderRadius: '12px',
              width: '100%', maxWidth: '400px', overflow: 'hidden',
              border: '1px solid var(--border-color)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do modal */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', borderBottom: '1px solid var(--border-color)',
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Localização do Parque
              </span>
              <button
                onClick={() => setModalMapaAberto(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
              >
                <FiX />
              </button>
            </div>

            {/* Dica */}
            <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', padding: '8px 16px 0', margin: 0, opacity: 0.7 }}>
              Mova o mapa para posicionar o pin
            </p>

            {/* Mapa (lazy loaded com ErrorBoundary) */}
            <div style={{ padding: '8px 16px' }}>
              <MapErrorBoundary>
                <Suspense fallback={<div style={{ minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Carregando mapa...</div>}>
                  <MapPicker
                    center={[latSel, lngSel]}
                    onMove={(lat, lng) => {
                      setLatSel(lat);
                      setLngSel(lng);
                      buscarNomeLocal(lat, lng);
                    }}
                    zoom={10}
                  />
                </Suspense>
              </MapErrorBoundary>
            </div>

            {/* Info da localização */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', fontSize: '0.8rem',
            }}>
              <FiMapPin style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
              <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: 500 }}>
                {buscandoNome ? 'Buscando...' : nomeSel}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
                {latSel.toFixed(4)}, {lngSel.toFixed(4)}
              </span>
            </div>

            {/* Botão confirmar */}
            <div style={{ padding: '8px 16px 16px' }}>
              <button
                onClick={confirmarLocalizacao}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  width: '100%', padding: '10px 0', borderRadius: '6px',
                  background: 'var(--accent-color)', color: 'var(--bg-primary)',
                  border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                <FiCheck /> Confirmar localização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
