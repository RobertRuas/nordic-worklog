/**
 * Esquema de Dados — Firestore — Nordic Worklog
 * 
 * Referência da estrutura de dados no Cloud Firestore.
 * Todos os dados são isolados por usuário (userId = uid do Firebase Auth).
 * Sincronização em tempo real via onSnapshot.
 * 
 * Relacionamentos:
 *   - Usuário 1:N Projeto (cada usuário tem seus projetos)
 *   - Projeto 1:N Técnico (um projeto tem muitos técnicos)
 *   - Projeto 1:N Registro (um projeto tem muitos registros diários)
 *   - Registro N:N Técnico (um registro tem vários técnicos)
 *   - Projeto 1:N Anexo (PDFs, fotos, Excel — no Firebase Storage)
 *   - Registro 1:N Foto (fotos do dia — no Firebase Storage)
 *   - Usuário 1:1 Configuracao (parâmetros de trabalho)
 *   - Usuário 1:1 EmailConfig (servidor IMAP/SMTP)
 *   - Usuário 1:N Email (mensagens em cache)
 */

// ══════════════════════════════════════════════════════════
// COLLECTION: users/{userId}
// ══════════════════════════════════════════════════════════
// Perfil do usuário (criado automaticamente no login/cadastro)
const perfil = {
  collection: 'users/{userId}',
  campos: {
    nome:      'string',           // nome de exibição
    email:     'string',           // e-mail da conta
    criadoEm:  'Timestamp',        // data de criação
  },
};

// ══════════════════════════════════════════════════════════
// SUBCOLLECTION: users/{userId}/projetos/{projetoId}
// ══════════════════════════════════════════════════════════
const projetos = {
  collection: 'users/{userId}/projetos',
  campos: {
    nome:        'string',         // ex: "Pannonia Gols"
    cliente:     'string',         // ex: "Pannonia Wind"
    escopo:      'string',         // ex: "Manutenção de Turbinas"
    descricao:   'string',         // descrição detalhada
    localizacao: 'string',         // endereço (reverse geocoding)
    latitude:    'number',         // ex: 51.9527
    longitude:   'number',         // ex: 16.8958
    tecnicos:    'array<Tecnico>', // técnicos vinculados
    anexos:      'array<Anexo>',   // metadados de anexos
    atualizadoEm: 'Timestamp',
  },
};

// ══════════════════════════════════════════════════════════
// SUBCOLLECTION: users/{userId}/registros/{registroId}
// ══════════════════════════════════════════════════════════
const registros = {
  collection: 'users/{userId}/registros',
  campos: {
    semana:             'number',   // nº da semana ISO (1-53)
    dia:                'string',   // ex: "2026-06-27"
    projeto:            'string',   // nome do projeto
    timeNo:             'string',   // ex: "T-01"
    nomeTecnico:        'string',   // técnico responsável
    funcao:             'string',   // ex: "L3"
    teamLeader:         'string',   // "Sim" / "Não"
    localTurbinaNo:     'string',   // ex: "IK2"
    turbinaIdNo:        'string',
    maxBoglTowerNo:     'string',
    bladeNo:            'string',
    wtgDowntimeHours:   'number',
    standbyReason:      'string',
    workingHours:       'number',
    standbyHours:       'number',
    travelHours:        'number',
    dailyProgress:      'string',   // descrição do progresso
    time:               'array<Tecnico>', // técnicos no time
    fotos:              'array<Foto>',    // metadados de fotos
    atualizadoEm:       'Timestamp',
  },
};

// ══════════════════════════════════════════════════════════
// SUBCOLLECTION: users/{userId}/emails/{emailId}
// ══════════════════════════════════════════════════════════
const emails = {
  collection: 'users/{userId}/emails',
  campos: {
    de:       'string',      // ex: "Pannonia Wind <noreply@...>"
    para:     'string',      // ex: "robert@one.com"
    assunto:  'string',
    data:     'string',      // ISO timestamp
    lido:     'boolean',
    corpo:    'string',
    atualizadoEm: 'Timestamp',
  },
};

// ══════════════════════════════════════════════════════════
// DOCUMENTO: users/{userId}/config/config
// ══════════════════════════════════════════════════════════
const configuracoes = {
  document: 'users/{userId}/config/config',
  campos: {
    valorHora:    'number',   // €/h (padrão: 36)
    standPercent: 'number',   // % stand-by (padrão: 70)
    jornada:      'number',   // horas padrão (padrão: 10)
    perDiem:      'number',   // € diária (padrão: 50)
    atualizadoEm: 'Timestamp',
  },
};

// ══════════════════════════════════════════════════════════
// DOCUMENTO: users/{userId}/emailConfig/config
// ══════════════════════════════════════════════════════════
const emailConfig = {
  document: 'users/{userId}/emailConfig/config',
  campos: {
    email:           'string',
    senha:           'string',
    imap: {
      servidor:      'string',       // ex: "imap.one.com"
      porta:         'number',       // ex: 993
      encriptacao:   'string',       // ex: "SSL/TLS"
    },
    smtp: {
      servidor:      'string',       // ex: "send.one.com"
      porta:         'number',       // ex: 465
      encriptacao:   'string',       // ex: "SSL/TLS"
    },
    atualizadoEm: 'Timestamp',
  },
};

// ══════════════════════════════════════════════════════════
// STORAGE: Firebase Storage
// ══════════════════════════════════════════════════════════
// Caminhos dos arquivos no Storage:
//   uploads/{userId}/projetos/{projetoId}/{filename}
//   uploads/{userId}/registros/{registroId}/{filename}
//
// Limites de tamanho:
//   Fotos (jpg/png): 5 MB
//   Documentos (pdf/xls/doc): 10 MB
//   Tipos aceitos: .pdf, .png, .jpg, .jpeg, .xls, .xlsx, .doc, .docx

// ══════════════════════════════════════════════════════════
// RESUMO DA ESTRUTURA
// ══════════════════════════════════════════════════════════
/*
  users/{userId}                    → perfil do usuário
    ├── config/config               → parâmetros de trabalho
    ├── emailConfig/config          → configuração IMAP/SMTP
    ├── projetos/{projetoId}        → projetos do usuário
    │   └── (tecnicos e anexos embutidos no documento)
    ├── registros/{registroId}      → registros diários
    │   └── (time e fotos embutidos no documento)
    └── emails/{emailId}            → cache de e-mails
*/

export {
  perfil,
  projetos,
  registros,
  emails,
  configuracoes,
  emailConfig,
};
