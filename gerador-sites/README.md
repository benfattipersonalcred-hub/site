# Gerador de Sites

Plataforma estilo Wix (No-Code) com custo zero de infraestrutura.

## Stack
- **Front-end:** HTML, CSS, JS
- **Back-end:** Google Apps Script (GS)
- **Banco de dados:** Google Sheets (planilhas)
- **Hospedagem front:** GitHub Pages
- **Imagens:** ImgBB

## Funcionalidades

### Editor Visual Avançado (nível Wix/Webflow)
- Posicionamento livre absoluto, camadas (z-index), painel de camadas.
- Arrastar/redimensionar com alças e snap (biblioteca Moveable hospedada localmente).
- Responsividade por dispositivo (Desktop / Tablet / Mobile).
- Templates prontos (Restaurante, Loja, Imobiliária, Veículos, Portfólio, Salão, Landing, Clínica) + página em branco.
- Atalhos de teclado (Ctrl+Z/Y/D, Delete, setas), menu de contexto, preview, desfazer/refazer.

### Recursos Avançados (8)
1. 🧩 **Blocos compostos** — Hero, Destaques, Galeria, Depoimentos, FAQ, Rodapé, Cards.
2. 📄 **Páginas múltiplas + navegação automática** — menu gerado automaticamente.
3. 🎨 **Temas/cores globais** — paleta e fonte do site inteiro.
4. ✨ **Animações e micro-interações** — fade, slide, zoom, slideLeft + efeitos hover.
5. 🛒 **E-commerce completo** — carrinho, checkout e Pix.
6. 📱 **Editor responsivo inteligente** — reorganização automática para mobile/tablet.
7. 🔍 **SEO visual** — título, descrição e imagem de compartilhamento.
8. 🧪 **Rascunho/Publicado** — modo de teste antes de publicar.

### Renderização do site final
- `site.html?id=X` renderiza o site salvo a partir do JSON.
- Suporte a **múltiplas páginas** com menu de navegação automático.
- Aplicação do **tema global** (cores/fonte) e **animações de entrada**.
- **SEO dinâmico** — meta tags (description, og:title, og:description, og:image) injetadas no `<head>`.

### Upload de imagens (ImgBB)
- Upload direto no editor (elemento imagem e cards de produto/imóvel/veículo).
- A chave secreta do ImgBB fica **somente no backend** (Apps Script — DECISÃO 08).

### Painéis
- **Dashboard do cliente:** lista de sites, plano/status, financeiro, vendas e chave Pix.
- **Dashboard do admin:** gestão de clientes, planos (inclui Vitalício exclusivo), financeiro e vendas.

## Estrutura
```
gerador-sites/
├── index.html            → página inicial (landing da plataforma)
├── login.html            → login/cadastro
├── dashboard.html        → painel do cliente
├── dashboard-admin.html  → painel do admin
├── editor.html           → editor visual avançado
├── site.html             → renderiza o site do cliente (?id=X)
├── css/
│   ├── global.css        → estilos base
│   ├── editor.css        → estilos do editor
│   └── site.css          → estilos da renderização
├── js/
│   ├── api.js            → comunicação com Google Apps Script (fetch) + Mock Mode
│   ├── auth.js           → login, token, sessão
│   ├── editor.js         → lógica do editor avançado
│   ├── templates.js      → catálogo de elementos + templates
│   ├── renderizador.js   → desenha o site a partir do JSON
│   ├── recursos-avancados.js → 8 recursos avançados do editor
│   ├── moveable-integracao.js → une o Moveable ao editor
│   ├── utils.js          → funções auxiliares
│   └── vendor/
│       └── moveable.js   → biblioteca Moveable (hospedada localmente)
├── gs/ (Google Apps Script)
│   ├── Code.gs           → endpoints do backend (doGet/doPost)
│   ├── auth.gs           → hash de senha + tokens
│   ├── crud.gs           → leitura/gravação nas abas
│   └── config.gs         → configuração (planilha, chaves seguras)
├── assets/
│   ├── imagens/
│   └── icones/
└── README.md
```

## Desenvolvimento
O projeto é desenvolvido em **blocos funcionais** com **Mock Mode** (localStorage) até o backend real (Apps Script) estar configurado. Ver `MD/projeto2.md` para a documentação completa.