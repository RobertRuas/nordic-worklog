---
trigger: always_on
---

# Nordic Worklog — Regras do Projeto

## Identidade

- **Nome**: Nordic Worklog
- **Tipo**: Aplicação web frontend (estilo app nativo mobile)
- **Design**: Nórdico minimalista — cores neutras, textos levemente pequenos, mínimo de efeitos
- **Idioma do código e comentários**: Português (didático)

---

## Stack Obrigatória

- **React 19** + **Vite 8** (sem frameworks CSS externos, sem router externo)
- **Ícones**: `react-icons/fi` (Feather Icons) — usar sempre que fizer sentido
- **Fonte**: Outfit (Google Fonts), pesos 300–600
- **Docker**: `node:20-alpine`, container_name `nordic_worklog_container`, porta host 3002 → container 3000, `restart: always`, `version: '3.8'`

---

## Estrutura de Pastas

```
src/
├── assets/                  # Imagens e recursos estáticos
├── components/              # Componentes globais/reutilizáveis
│   └── NomeComponente/      # Cada um com seu .jsx e .css
├── context/                 # Contextos React (tema, etc.)
├── pages/                   # Cada página em sua própria pasta
│   └── NomePagina/
│       ├── components/      # Subcomponentes exclusivos desta página
│       └── NomePagina.jsx
├── App.jsx                  # Raiz — gerencia navegação via useState
├── main.jsx                 # Entry point com ThemeProvider
└── index.css                # Design system global (variáveis CSS + temas)
```

### Regras de Organização

1. Cada página tem sua pasta em `src/pages/`
2. Subcomponentes de página ficam em `src/pages/NomePagina/components/`
3. Componentes reutilizáveis ficam em `src/components/`
4. Cada arquivo deve ter **responsabilidade única** e mínimo de código
5. Contextos globais ficam em `src/context/`

---

## Design System (index.css)

### Variáveis CSS — NUNCA hardcode cores

| Variável           | Light     | Dark      | Uso                     |
|--------------------|-----------|-----------|-------------------------|
| `--bg-primary`     | `#f4f4f5` | `#09090b` | Fundo principal         |
| `--bg-secondary`   | `#ffffff` | `#18181b` | Cartões e elementos     |
| `--text-primary`   | `#18181b` | `#f4f4f5` | Texto principal         |
| `--text-secondary` | `#71717a` | `#a1a1aa` | Texto mutado            |
| `--accent-color`   | `#09090b` | `#ffffff` | Destaque                |
| `--border-color`   | `#e4e4e7` | `#27272a` | Bordas e divisores      |

### Tamanhos de Fonte

- Base: `0.875rem`
- Labels: `0.8rem`
- Captions: `0.75rem`
- Badges: `0.7rem`

### Princípios Visuais

- Sem gradientes, sem sombras pesadas, sem blur
- Bordas suaves: `4px` a `12px` (badges)
- Transições: `0.2s`–`0.3s` ease
- Animação de entrada: classe `.fade-in`
- Layout mobile-first: header fixo + bottom nav + conteúdo scrollável
- Cartões: classe `.card` para agrupar conteúdo

---

## Navegação

State-based via `useState` no `App.jsx` (sem react-router):

| ID              | Rótulo   | Página             |
|-----------------|----------|--------------------|
| `home`          | Início   | `Home.jsx`         |
| `entradas`      | Entradas | `Entradas.jsx`     |
| `projetos`      | Projetos | `Projetos.jsx`     |
| `configuracoes` | Ajustes  | `Configuracoes.jsx`|

Ao adicionar nova página: atualizar `BottomNav`, `App.jsx` (switch), e `Layout.jsx` (getHeaderTitle).

---

## Tema Light/Dark

- Gerenciado por `ThemeContext.jsx` com hook `useTheme()`
- Salvo no `localStorage` (chave `'theme'`)
- Classe CSS `dark` aplicada no `<html>`
- Todo novo componente deve funcionar em ambos os temas usando `var(--*)`

---

## Convenções de Código

### Comentários

- **Todos** os arquivos devem ter comentários em **português**
- Cada componente deve ter JSDoc descrevendo propósito e `@param` das props
- Seções do JSX devem ter comentários inline: `{/* Nome da Seção */}`

### Estilo

- Functional components com `export default function`
- Props desestruturadas nos parâmetros
- `useState` para estado local; Context API para estado global
- Variáveis CSS para estilos temáticos; inline styles para specifics
- Sem CSS Modules

### Nomenclatura

- Pastas de páginas: **PascalCase** (`Projetos`)
- Arquivos: **PascalCase** (`ProjectItem.jsx`)
- Variáveis/funções: **camelCase** (`valorHora`)
- Classes CSS: **kebab-case** (`bottom-nav`)
- IDs de navegação: string simples (`home`)

---

## O que FAZER

- Usar variáveis CSS para cores — nunca hardcoded
- Comentar em português de forma didática
- Usar `react-icons/fi` para ícones
- Separar em subcomponentes para manter arquivos mínimos
- Testar em light e dark theme
- Usar padrão `.card` para agrupar conteúdo

## O que NÃO FAZER

- Não adicionar dependências desnecessárias
- Não usar CSS frameworks (Tailwind, Bootstrap, etc.)
- Não usar router externo
- Não hardcode cores
- Não criar arquivos grandes — dividir em componentes
- Não usar efeitos visuais pesados
- Não misturar idiomas nos comentários

---

## Backend (Futuro)

Por enquanto apenas visual. Dados fictícios (mock) populam listas. A estrutura deve estar preparada para integrações futuras.
