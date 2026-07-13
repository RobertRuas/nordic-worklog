/**
 * Esquema de Banco de Dados — Nordic Worklog
 * 
 * Referência simplificada para guiar a criação do backend.
 * Atualizado conforme a aplicação evolui.
 * 
 * Relacionamentos:
 *   - Projeto 1:N Técnico (um projeto tem muitos técnicos)
 *   - Projeto 1:N Registro (um projeto tem muitos registros diários)
 *   - Registro N:N Técnico (um registro tem vários técnicos; um técnico pode estar em vários registros)
 *   - Projeto 1:N Anexo (PDFs, fotos, Excel — com limite de tamanho)
 *   - Registro 1:N Foto (fotos do dia — redimensionadas automaticamente p/ 1024px)
 *   - Usuario 1:N Email
 *   - Usuario 1:1 Configuracao
 */

// ══════════════════════════════════════════════════════════
// TABELA: usuarios
// ══════════════════════════════════════════════════════════
// Representa os usuários do sistema (login/conta)
const usuarios = {
  tabela: 'usuarios',
  campos: {
    id:            'INTEGER PRIMARY KEY',
    nome:          'TEXT NOT NULL',
    email:         'TEXT UNIQUE NOT NULL',
    senha_hash:    'TEXT NOT NULL',          // hash da senha (bcrypt)
    criado_em:     'TIMESTAMP DEFAULT NOW',
  },
};

// ══════════════════════════════════════════════════════════
// TABELA: projetos
// ══════════════════════════════════════════════════════════
const projetos = {
  tabela: 'projetos',
  campos: {
    id:            'INTEGER PRIMARY KEY',
    nome:          'TEXT NOT NULL',          // ex: "Pannonia Gols"
    cliente:       'TEXT',                   // ex: "Pannonia Wind"
    escopo:        'TEXT',                   // ex: "Manutenção de Turbinas"
    descricao:     'TEXT',                   // descrição detalhada

    // ── Localização do Parque/Site (via MapPicker) ──
    localizacao:   'TEXT',                   // endereço ou nome do local (reverse geocoding)
    latitude:      'REAL',                   // ex: 51.9527
    longitude:     'REAL',                   // ex: 16.8958

    criado_em:     'TIMESTAMP DEFAULT NOW',
  },
};

// ══════════════════════════════════════════════════════════
// TABELA: tecnicos
// ══════════════════════════════════════════════════════════
// Técnicos vinculados a projetos (IRATA / Winda)
const tecnicos = {
  tabela: 'tecnicos',
  campos: {
    id:            'INTEGER PRIMARY KEY',
    projeto_id:    'INTEGER REFERENCES projetos(id)',  // vínculo com projeto
    nome:          'TEXT NOT NULL',                     // ex: "Robert Ruas"
    irata_level:   'TEXT CHECK (L1, L2, L3)',          // nível IRATA
    winda_id:      'TEXT',                              // ex: "RR001001BR"
  },
};

// ══════════════════════════════════════════════════════════
// TABELA: registros
// ══════════════════════════════════════════════════════════
// Registro diário de trabalho (worklog)
const registros = {
  tabela: 'registros',
  campos: {
    id:                  'INTEGER PRIMARY KEY',
    projeto_id:          'INTEGER REFERENCES projetos(id)',

    // ── Informações Gerais ──
    semana:              'INTEGER',            // nº da semana (1-53)
    dia:                 'DATE NOT NULL',       // ex: "2026-06-27"

    // ── Time ──
    time_no:             'TEXT',               // ex: "T-01"
    nome_tecnico:        'TEXT',               // técnico responsável (reportante)
    funcao:              'TEXT',               // ex: "L3"
    team_leader:         'TEXT',               // "Sim" / "Não"

    // ── Turbina e Localização ──
    local_turbina_no:    'TEXT',               // ex: "IK2", "GM29"
    turbina_id_no:       'TEXT',               // identificador da turbina
    max_bogl_tower_no:   'TEXT',               // ex: "G20_001234_DE"
    blade_no:            'TEXT',               // ex: "B-01"

    // ── Tempos e Produção ──
    wtg_downtime_hours:  'INTEGER DEFAULT 0',  // horas de parada da turbina
    standby_reason:      'TEXT',               // motivo stand-by (ex: "Vento forte")
    working_hours:       'INTEGER DEFAULT 0',  // horas trabalhadas (0-24)
    standby_hours:       'INTEGER DEFAULT 0',  // horas em stand-by (0-24)
    travel_hours:        'INTEGER DEFAULT 0',  // horas de deslocamento (0-24)

    // ── Progresso ──
    daily_progress:      'TEXT',               // descrição do progresso do dia

    criado_em:           'TIMESTAMP DEFAULT NOW',
  },
};

// ══════════════════════════════════════════════════════════
// TABELA: anexos
// ══════════════════════════════════════════════════════════
// Arquivos anexados aos projetos (PDF, fotos, Excel, etc.)
// Validação: tamanho máximo por arquivo (ex: 10MB para docs, 5MB para fotos)
// Tipos aceitos: .pdf, .png, .jpg, .jpeg, .xls, .xlsx, .doc, .docx
const anexos = {
  tabela: 'anexos',
  campos: {
    id:             'INTEGER PRIMARY KEY',
    projeto_id:     'INTEGER REFERENCES projetos(id) ON DELETE CASCADE',
    nome_arquivo:   'TEXT NOT NULL',          // nome original do arquivo
    tipo_arquivo:   'TEXT NOT NULL',          // MIME type (ex: "application/pdf")
    tamanho:        'INTEGER NOT NULL',       // tamanho em bytes
    url:            'TEXT NOT NULL',          // caminho/URL do arquivo salvo
    criado_em:      'TIMESTAMP DEFAULT NOW',
  },
  // Limites de tamanho (referência para validação no backend)
  limites: {
    max_geral:      10 * 1024 * 1024,        // 10MB para documentos (PDF, Excel, Word)
    max_foto:       5 * 1024 * 1024,          // 5MB para fotos
    tipos_permitidos: [
      'application/pdf',
      'image/png', 'image/jpeg',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
};

// ══════════════════════════════════════════════════════════
// TABELA: registro_fotos
// ══════════════════════════════════════════════════════════
// Fotos anexadas aos registros diários
// Redimensionamento automático: se a foto for muito grande,
// reduzir para resolução máxima de 1024px (largura ou altura)
// antes de salvar. Isso garante tamanho aceitável sem rejeitar a foto.
const registro_fotos = {
  tabela: 'registro_fotos',
  campos: {
    id:             'INTEGER PRIMARY KEY',
    registro_id:    'INTEGER REFERENCES registros(id) ON DELETE CASCADE',
    nome_arquivo:   'TEXT NOT NULL',          // nome original
    url:            'TEXT NOT NULL',          // caminho/URL da foto salva
    largura:        'INTEGER',                // largura em px (após redimensionamento)
    altura:         'INTEGER',                // altura em px (após redimensionamento)
    tamanho:        'INTEGER NOT NULL',       // tamanho em bytes (após compressão)
    criado_em:      'TIMESTAMP DEFAULT NOW',
  },
  // Regras de processamento de fotos (referência para o backend)
  processamento: {
    resolucao_max:  1024,                     // px — redimensionar se exceder
    qualidade_jpeg: 0.8,                      // 80% qualidade na compressão
    formato_saida:  'image/jpeg',             // converter PNG → JPEG para economizar espaço
  },
};

// ══════════════════════════════════════════════════════════
// TABELA: registro_tecnicos (N:N)
// ══════════════════════════════════════════════════════════
// Relação muitos-para-muitos: técnicos presentes em cada registro
const registro_tecnicos = {
  tabela: 'registro_tecnicos',
  campos: {
    registro_id:    'INTEGER REFERENCES registros(id) ON DELETE CASCADE',
    tecnico_id:     'INTEGER REFERENCES tecnicos(id) ON DELETE CASCADE',
  },
  primary_key: '(registro_id, tecnico_id)',
};

// ══════════════════════════════════════════════════════════
// TABELA: configuracoes
// ══════════════════════════════════════════════════════════
// Parâmetros de trabalho do usuário (valores, taxas)
const configuracoes = {
  tabela: 'configuracoes',
  campos: {
    id:             'INTEGER PRIMARY KEY',
    usuario_id:     'INTEGER UNIQUE REFERENCES usuarios(id)',
    valor_hora:     'REAL DEFAULT 36',        // €/h
    stand_percent:  'REAL DEFAULT 70',        // % da taxa stand-by
    jornada:        'REAL DEFAULT 10',         // horas padrão de jornada
    per_diem:       'REAL DEFAULT 50',         // € de diária
  },
};

// ══════════════════════════════════════════════════════════
// TABELA: email_configs
// ══════════════════════════════════════════════════════════
// Configuração do servidor de e-mail do usuário
const email_configs = {
  tabela: 'email_configs',
  campos: {
    id:               'INTEGER PRIMARY KEY',
    usuario_id:       'INTEGER UNIQUE REFERENCES usuarios(id)',
    email:            'TEXT NOT NULL',
    senha:            'TEXT NOT NULL',         // armazenar com cuidado

    // POP (entrada)
    pop_servidor:     'TEXT',                  // ex: "pop.one.com"
    pop_porta:        'INTEGER',               // ex: 995
    pop_encriptacao:  'TEXT',                  // ex: "SSL/TLS"

    // SMTP (saída)
    smtp_servidor:    'TEXT',                  // ex: "send.one.com"
    smtp_porta:       'INTEGER',               // ex: 465
    smtp_encriptacao: 'TEXT',                  // ex: "SSL/TLS"
  },
};

// ══════════════════════════════════════════════════════════
// TABELA: emails
// ══════════════════════════════════════════════════════════
// E-mails recebidos/enviados (cache local)
const emails = {
  tabela: 'emails',
  campos: {
    id:            'INTEGER PRIMARY KEY',
    usuario_id:    'INTEGER REFERENCES usuarios(id)',
    de:            'TEXT NOT NULL',            // ex: "Pannonia Wind <noreply@...>"
    para:          'TEXT NOT NULL',            // ex: "robert.ruas@one.com"
    assunto:       'TEXT',
    data:          'TIMESTAMP',                // ex: "2026-07-11T18:30:00"
    lido:          'BOOLEAN DEFAULT false',
    corpo:         'TEXT',                     // conteúdo da mensagem
    criado_em:     'TIMESTAMP DEFAULT NOW',
  },
};

// ══════════════════════════════════════════════════════════
// RESUMO DAS RELAÇÕES
// ══════════════════════════════════════════════════════════
/*
  usuarios
    ├── 1:1 configuracoes         (parâmetros de trabalho)
    ├── 1:1 email_configs         (servidores POP/SMTP)
    └── 1:N emails                (mensagens)

  projetos
    ├── 1:N tecnicos              (técnicos do projeto)
    ├── 1:N anexos                (PDFs, fotos, Excel)
    └── 1:N registros             (registros diários)

  registros
    ├── N:N tecnicos              (via registro_tecnicos)
    └── 1:N registro_fotos        (fotos do dia — auto-redimensionadas p/ 1024px)
*/

export {
  usuarios,
  projetos,
  tecnicos,
  registros,
  registro_tecnicos,
  registro_fotos,
  anexos,
  configuracoes,
  email_configs,
  emails,
};
