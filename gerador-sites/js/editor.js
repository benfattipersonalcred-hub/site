// ============================================================
// ARQUIVO: js/editor.js
// DESCRIÇÃO: Lógica do Editor Visual Avançado (DECISÃO 10).
//           Arrastar, redimensionar, selecionar, camadas,
//           painel de propriedades, templates, dispositivos,
//           preview, desfazer/refazer e salvar em JSON.
//           Implementado em JS puro (funciona sem backend).
// ============================================================

// ============================================================
// ESTADO GLOBAL DO EDITOR
// ============================================================

// Objeto que guarda o estado atual do editor
const estadoEditor = {
    // Lista de páginas do site (cada página tem um array de elementos)
    paginas: [{ id: 'pag_' + gerarIdCurto(), nome: 'Home', elementos: [] }],
    // Índice da página atual no array de páginas
    paginaAtual: 0,
    // Lista de elementos da página atual (JSON) - mantido por compatibilidade
    elementos: [],
    // ID do elemento selecionado
    selecionado: null,
    // Dispositivo atual (desktop/tablet/mobile)
    dispositivo: 'desktop',
// Nome do site
    nome: 'Meu Site',
    // ID do site (para edição)
    idSite: null,
    // ID do cliente (dono)
    idCliente: null,
    // Subdomínio do site (ex.: meusite)
    subdominio: '',
    // URLs das imagens do site (ImgBB)
    imagens: [],
    // Tema de cores do site (paleta global)
    temaCores: {},
    // SEO - título do site
    seoTitulo: '',
    // SEO - descrição do site
    seoDescricao: '',
    // Histórico para desfazer/refazer
    historico: [],
    // Índice atual do histórico
    indiceHistorico: -1,
    // Zoom do canvas
    zoom: 1,
    // Flag de arrastando (para evitar bugs)
    arrastando: false
};

// ============================================================
// FUNÇÕES DE INICIALIZAÇÃO
// ============================================================

// Inicializa o editor ao carregar a página
async function iniciarEditor() {
    // Carrega o catálogo de elementos no painel esquerdo
    montarCatalogo();
    // Carrega os templates no painel esquerdo
    montarTemplates();
    // Configura o canvas para receber elementos
    configurarDrop();
    // Configura os dispositivos (desktop/tablet/mobile)
    configurarDispositivos();
    // Configura os atalhos de teclado
    configurarTeclado();
    // Configura o menu de contexto (botão direito)
    configurarMenuContexto();
    // Verifica se há um site para editar (via ?id=)
    const idSite = lerParamUrl('id');
    // Se houver, carrega o site
    if (idSite) {
        await carregarSite(idSite);
    } else {
        // Se não houver, começa com página em branco
        novoSite();
        // Salva o estado inicial no histórico
        guardarHistorico();
    }
}

// Cria um novo site em branco
function novoSite() {
    // Limpa os elementos
    estadoEditor.elementos = [];
    // Remove a seleção
    estadoEditor.selecionado = null;
    // Renderiza o canvas vazio
    renderizarCanvas();
    // Limpa o painel de propriedades
    montarPainelPropriedades(null);
    // Atualiza a lista de camadas
    atualizarCamadas();
}

// Carrega um site existente pelo id
async function carregarSite(idSite) {
    // Busca o site na API (mock ou real)
    const resposta = await apiBuscarSite(idSite);
    // Se não encontrou
    if (!resposta.sucesso) {
        // Mostra o erro
        mostrarToast('Site não encontrado: ' + resposta.mensagem, 'erro');
        // Começa em branco
        novoSite();
        return;
    }
// Obtém o site retornado (aceita mock em camelCase e backend real em MAIÚSCULAS)
    const site = resposta.dados;
    // Guarda o id do site (aceita idSite ou ID_SITE)
    estadoEditor.idSite = site.idSite || site.ID_SITE;
    // Guarda o id do cliente (aceita idCliente ou ID_CLIENTE)
    estadoEditor.idCliente = site.idCliente || site.ID_CLIENTE;
// Define o nome do site (aceita nome ou NOME_SITE)
    estadoEditor.nome = site.nome || site.NOME_SITE || 'Meu Site';
    // Atualiza o campo de nome na barra
    document.getElementById('nomeSite').value = estadoEditor.nome;

// Carrega o subdomínio (aceita subdominio ou SUBDOMINIO)
    estadoEditor.subdominio = site.subdominio || site.SUBDOMINIO || '';
    // Carrega as imagens (aceita imagens ou IMAGENS)
    // O backend real pode devolver como JSON string; converte para array
    estadoEditor.imagens = parseImagensSite(site.imagens || site.IMAGENS);
    // Carrega o tema de cores (aceita temaCores ou TEMA_CORES)
    // O backend real pode devolver como JSON string; converte para objeto
    estadoEditor.temaCores = parseTemaCoresSite(site.temaCores || site.TEMA_CORES);
    // Carrega o SEO título (aceita seoTitulo ou SEO_TITULO)
    estadoEditor.seoTitulo = site.seoTitulo || site.SEO_TITULO || '';
    // Carrega o SEO descrição (aceita seoDescricao ou SEO_DESCRICAO)
    estadoEditor.seoDescricao = site.seoDescricao || site.SEO_DESCRICAO || '';

    // Converte o JSON da estrutura (se for string)
    let elementos = site.json;
    // Se for string, converte
    if (typeof elementos === 'string') {
        try {
            // Converte para objeto
            elementos = site.json ? JSON.parse(site.json) : [];
        } catch (e) {
            // Se der erro, usa lista vazia
            elementos = [];
        }
    }
// Garante que seja um array
    if (!Array.isArray(elementos)) elementos = [];

    // ==========================================================
    // PÁGINAS MÚLTIPLAS (DECISÃO 10 - recurso 2)
    // Detecta se o JSON salvo contém o formato de MULTIPLAS paginas
    // (objeto com "paginas") ou o formato antigo (array simples).
    // ==========================================================

    // Se o JSON for um objeto com a propriedade "paginas"
    if (elementos && !Array.isArray(elementos) && elementos.paginas) {
        // Restaura as páginas múltiplas do site
        estadoEditor.paginas = elementos.paginas;
        // Restaura a página ativa (ou usa a primeira)
        estadoEditor.paginaAtual = elementos.paginaAtual || 0;
        // Garante que a página atual existe
        if (estadoEditor.paginas[estadoEditor.paginaAtual]) {
            // Carrega os elementos da página atual
            estadoEditor.elementos = estadoEditor.paginas[estadoEditor.paginaAtual].elementos || [];
        } else {
            // Se não existir, volta para a primeira página
            estadoEditor.paginaAtual = 0;
            estadoEditor.elementos = estadoEditor.paginas[0] ? estadoEditor.paginas[0].elementos || [] : [];
        }
    } else {
        // Formato antigo (array simples de elementos) = uma única página
        // Garante que exista pelo menos uma página (Home)
        estadoEditor.paginas = [{ id: 'pag_' + gerarIdCurto(), nome: 'Home', elementos: elementos }];
        // Define a página atual como a primeira
        estadoEditor.paginaAtual = 0;
        // Carrega os elementos
        estadoEditor.elementos = elementos;
    }

    // Atualiza o seletor de páginas (se a função existir - recursos avançados)
    if (typeof atualizarSeletorPaginas === 'function') atualizarSeletorPaginas();
    // Renderiza o canvas
    renderizarCanvas();
    // Atualiza as camadas
    atualizarCamadas();
    // Guarda no histórico
    guardarHistorico();
}

// ============================================================
// CATÁLOGO DE ELEMENTOS (painel esquerdo)
// ============================================================

// Monta o catálogo de elementos no painel esquerdo
function montarCatalogo() {
    // Seleciona o container do catálogo
    const container = document.getElementById('listaElementos');
    // Limpa o container
    container.innerHTML = '';
    // Percorre cada categoria
    CATALOGO_ELEMENTOS.forEach(cat => {
        // Cria o título da categoria
        const titulo = document.createElement('div');
        // Define a classe do título
        titulo.className = 'painel-titulo-categoria';
        // Define o texto da categoria
        titulo.textContent = cat.categoria;
        // Adiciona o título ao container
        container.appendChild(titulo);

        // Percorre cada item da categoria
        cat.itens.forEach(item => {
            // Cria o botão do elemento
            const btn = document.createElement('button');
            // Define a classe do item
            btn.className = 'item-elemento';
            // Define o conteúdo (ícone + rótulo)
            btn.innerHTML = '<span class="icone">' + item.icone + '</span>' + item.rotulo;
            // Define o atributo do tipo
            btn.setAttribute('data-tipo', item.tipo);
            // Configura o clique para adicionar o elemento
            btn.addEventListener('click', () => adicionarElemento(item.tipo));
            // Adiciona o botão ao container
            container.appendChild(btn);
        });
    });
}

// Monta a lista de templates no painel esquerdo
function montarTemplates() {
    // Seleciona o container de templates
    const container = document.getElementById('listaTemplates');
    // Limpa o container
    container.innerHTML = '';
    // Percorre cada template disponível
    LISTA_TEMPLATES.forEach(tpl => {
        // Cria o botão do template
        const btn = document.createElement('button');
        // Define a classe do template
        btn.className = 'item-template';
        // Define o conteúdo (ícone + rótulo + descrição)
        btn.innerHTML = '<span class="icone">' + tpl.icone + '</span><div><div class="rotulo">' + tpl.rotulo + '</div><div class="descricao">' + tpl.descricao + '</div></div>';
        // Configura o clique para aplicar o template
        btn.addEventListener('click', () => aplicarTemplate(tpl.tipo));
        // Adiciona o botão ao container
        container.appendChild(btn);
    });
}

// ============================================================
// ADICIONAR / REMOVER ELEMENTOS
// ============================================================

// Adiciona um elemento ao canvas
function adicionarElemento(tipo) {
    // Cria o modelo base do elemento (posição central)
    const modelo = criarModeloElemento(tipo, 200, 200);
    // Adiciona o elemento à lista
    estadoEditor.elementos.push(modelo);
    // Seleciona o novo elemento
    estadoEditor.selecionado = modelo.id;
    // Renderiza o canvas
    renderizarCanvas();
    // Atualiza as camadas
    atualizarCamadas();
    // Monta o painel de propriedades
    montarPainelPropriedades(modelo);
    // Guarda no histórico
    guardarHistorico();
}

// Aplica um template ao site
function aplicarTemplate(tipo) {
    // Se for página em branco
    if (tipo === 'branco') {
        // Limpa os elementos
        novoSite();
        // Informa o usuário
        mostrarToast('Página em branco criada', 'sucesso');
        return;
    }
    // Obtém os elementos do template
    const elementos = obterTemplate(tipo, estadoEditor.dispositivo);
    // Define os elementos do site
    estadoEditor.elementos = elementos;
    // Remove a seleção
    estadoEditor.selecionado = null;
    // Renderiza o canvas
    renderizarCanvas();
    // Atualiza as camadas
    atualizarCamadas();
    // Limpa o painel de propriedades
    montarPainelPropriedades(null);
    // Guarda no histórico
    guardarHistorico();
    // Informa o usuário
    mostrarToast('Template aplicado!', 'sucesso');
}

// Remove o elemento selecionado
function removerElemento() {
    // Se não houver seleção, sai
    if (!estadoEditor.selecionado) return;
    // Filtra a lista removendo o elemento selecionado
    estadoEditor.elementos = estadoEditor.elementos.filter(el => el.id !== estadoEditor.selecionado);
    // Limpa a seleção
    estadoEditor.selecionado = null;
    // Renderiza o canvas
    renderizarCanvas();
    // Atualiza as camadas
    atualizarCamadas();
    // Limpa o painel de propriedades
    montarPainelPropriedades(null);
    // Guarda no histórico
    guardarHistorico();
}

// Duplica o elemento selecionado
function duplicarElemento() {
    // Se não houver seleção, sai
    if (!estadoEditor.selecionado) return;
    // Encontra o elemento selecionado
    const original = estadoEditor.elementos.find(el => el.id === estadoEditor.selecionado);
    // Se não achar, sai
    if (!original) return;
    // Faz uma cópia profunda do elemento
    const copia = JSON.parse(JSON.stringify(original));
    // Gera um novo id
    copia.id = gerarId('el');
    // Desloca a posição do duplicado
    const pos = copia.pos && copia.pos[estadoEditor.dispositivo];
    // Se houver posição, desloca
    if (pos) {
        pos.x += 20;
        pos.y += 20;
    }
    // Adiciona a cópia à lista
    estadoEditor.elementos.push(copia);
    // Seleciona a cópia
    estadoEditor.selecionado = copia.id;
    // Renderiza o canvas
    renderizarCanvas();
    // Atualiza as camadas
    atualizarCamadas();
    // Monta o painel de propriedades
    montarPainelPropriedades(copia);
    // Guarda no histórico
    guardarHistorico();
}

// ============================================================
// ORDENAÇÃO DE CAMADAS (z-index) - trazer à frente / enviar atrás
// ============================================================

// Área de transferência para copiar/colar (elemento copiado)
let areaTransferencia = null;

// Traz o elemento selecionado para a FRENTE (fica por cima de todos)
function trazerParaFrente() {
    // Se não houver seleção, sai
    if (!estadoEditor.selecionado) return;
    // Encontra o índice do elemento selecionado
    const idx = estadoEditor.elementos.findIndex(el => el.id === estadoEditor.selecionado);
    // Se não achar, sai
    if (idx === -1) return;
    // Remove o elemento da posição atual
    const el = estadoEditor.elementos.splice(idx, 1)[0];
    // Adiciona no final do array (fica por último = por cima de todos)
    estadoEditor.elementos.push(el);
    // Renderiza o canvas
    renderizarCanvas();
    // Atualiza as camadas
    atualizarCamadas();
    // Guarda no histórico
    guardarHistorico();
}

// Envia o elemento selecionado para TRÁS (fica por baixo de todos)
function enviarParaTras() {
    // Se não houver seleção, sai
    if (!estadoEditor.selecionado) return;
    // Encontra o índice do elemento selecionado
    const idx = estadoEditor.elementos.findIndex(el => el.id === estadoEditor.selecionado);
    // Se não achar, sai
    if (idx === -1) return;
    // Remove o elemento da posição atual
    const el = estadoEditor.elementos.splice(idx, 1)[0];
    // Adiciona no início do array (fica primeiro = por baixo de todos)
    estadoEditor.elementos.unshift(el);
    // Renderiza o canvas
    renderizarCanvas();
    // Atualiza as camadas
    atualizarCamadas();
    // Guarda no histórico
    guardarHistorico();
}

// Copia o elemento selecionado para a área de transferência
function copiarElemento() {
    // Se não houver seleção, sai
    if (!estadoEditor.selecionado) return;
    // Encontra o elemento selecionado
    const el = estadoEditor.elementos.find(e => e.id === estadoEditor.selecionado);
    // Se não achar, sai
    if (!el) return;
    // Guarda uma cópia profunda na área de transferência
    areaTransferencia = JSON.parse(JSON.stringify(el));
    // Informa o usuário
    mostrarToast('Elemento copiado', 'info');
}

// Cola o elemento da área de transferência (com novo id e deslocamento)
function colarElemento() {
    // Se não houver nada para colar, sai
    if (!areaTransferencia) return;
    // Faz uma cópia profunda do elemento copiado
    const copia = JSON.parse(JSON.stringify(areaTransferencia));
    // Gera um novo id para a cópia
    copia.id = gerarId('el');
    // Desloca a posição da cópia
    const pos = copia.pos && copia.pos[estadoEditor.dispositivo];
    // Se houver posição, desloca
    if (pos) {
        pos.x += 20;
        pos.y += 20;
    }
    // Adiciona a cópia à lista
    estadoEditor.elementos.push(copia);
    // Seleciona a cópia
    estadoEditor.selecionado = copia.id;
    // Renderiza o canvas
    renderizarCanvas();
    // Atualiza as camadas
    atualizarCamadas();
    // Monta o painel de propriedades
    montarPainelPropriedades(copia);
    // Guarda no histórico
    guardarHistorico();
}

// ============================================================
// RENDERIZAÇÃO DO CANVAS
// ============================================================

// Renderiza os elementos no canvas
function renderizarCanvas() {
    // Seleciona o canvas
    const tela = document.getElementById('telaCanvas');
    // Limpa o canvas
    tela.innerHTML = '';
    // Percorre cada elemento
    estadoEditor.elementos.forEach(el => {
        // Cria o elemento DOM
        const nodo = criarElementoEditor(el, estadoEditor.dispositivo);
        // Se o elemento for o selecionado, adiciona a classe
        if (el.id === estadoEditor.selecionado) {
            nodo.classList.add('selecionado');
        }
        // Adiciona o elemento ao canvas
        tela.appendChild(nodo);
    });
}

// Cria o elemento DOM de edição (baseado no JSON)
function criarElementoEditor(el, device) {
    // Usa desktop como fallback de dispositivo
    const d = device || 'desktop';
    // Obtém a posição do dispositivo
    const pos = el.pos && el.pos[d] ? el.pos[d] : (el.pos && el.pos.desktop);

    // Cria o elemento base
    let nodo;
    // Controla pelo tipo
    switch (el.tipo) {
        case 'titulo':
            // Elemento de título
            nodo = document.createElement('div');
            // Define o conteúdo
            nodo.textContent = el.texto;
            // Aplica o estilo de título
            nodo.style.fontSize = '32px';
            nodo.style.fontWeight = '700';
            break;
        case 'paragrafo':
            // Elemento de parágrafo
            nodo = document.createElement('div');
            // Define o conteúdo
            nodo.textContent = el.texto;
            break;
        case 'botao':
        case 'whatsapp':
            // Elemento de botão
            nodo = document.createElement('button');
            // Define o conteúdo
            nodo.textContent = el.texto;
            break;
case 'imagem':
            // Elemento de imagem
            nodo = document.createElement('img');
            // Define a fonte
            nodo.src = el.url;
            // Impede arrastar a imagem nativa
            nodo.draggable = false;
            // Ajusta o objeto para caber no espaço definido
            nodo.style.objectFit = 'cover';
            break;
        case 'video':
            // Elemento de vídeo
            nodo = document.createElement('iframe');
            // Define a fonte
            nodo.src = el.url;
            // Impede borda
            nodo.frameBorder = '0';
            // Permite tela cheia
            nodo.setAttribute('allowfullscreen', '');
            break;
        case 'mapa':
            // Elemento de mapa
            nodo = document.createElement('iframe');
            // Define a fonte
            nodo.src = el.url;
            // Impede borda
            nodo.frameBorder = '0';
            break;
        case 'produto':
            // Elemento de card de produto
            nodo = criarCardProduto(el);
            break;
        case 'imovel':
            // Elemento de card de imóvel
            nodo = criarCardImovel(el);
            break;
        case 'veiculo':
            // Elemento de card de veículo
            nodo = criarCardVeiculo(el);
            break;
        case 'formulario':
            // Elemento de formulário de lead
            nodo = criarFormulario(el);
            break;
        case 'divisor':
            // Elemento de divisor (linha)
            nodo = document.createElement('div');
            break;
        default:
            // Elemento genérico (container)
            nodo = document.createElement('div');
            // Se tiver texto, mostra
            if (el.texto) nodo.textContent = el.texto;
    }

    // Marca o elemento com o id do dado
    nodo.setAttribute('data-id', el.id);
    // Adiciona a classe do elemento do canvas
    nodo.classList.add('el-canvas');

// Aplica a posição
    if (pos) {
        // Aplica largura e altura (para todos os tipos, incl. imagem/vídeo/mapa)
        if (pos.w) nodo.style.width = pos.w + 'px';
        if (pos.h) nodo.style.height = pos.h + 'px';
        // Aplica posição absoluta
        nodo.style.left = pos.x + 'px';
        nodo.style.top = pos.y + 'px';
    }

    // Aplica os estilos do elemento
    const est = el.estilo || {};
    // Cor de fundo
    if (est.corFundo) nodo.style.backgroundColor = est.corFundo;
    // Cor do texto
    if (est.corTexto) nodo.style.color = est.corTexto;
    // Tamanho da fonte
    if (est.tamanhoFonte) nodo.style.fontSize = est.tamanhoFonte + 'px';
    // Peso da fonte
    if (est.grossura) nodo.style.fontWeight = est.grossura;
    // Fonte
    if (est.fonte) nodo.style.fontFamily = est.fonte;
    // Rotação
    if (est.rotacao) nodo.style.transform = 'rotate(' + est.rotacao + 'deg)';
    // Opacidade
    if (est.opacidade) nodo.style.opacity = est.opacidade;
    // Raio da borda
    if (est.raioBorda !== undefined) nodo.style.borderRadius = est.raioBorda + 'px';
    // Borda
    if (est.borda) {
        nodo.style.border = (est.borda.espessura || 1) + 'px solid ' + (est.borda.cor || '#000');
    }
    // Sombra
    if (est.sombra) {
        nodo.style.boxShadow = (est.sombra.x || 0) + 'px ' + (est.sombra.y || 0) + 'px ' + (est.sombra.blur || 10) + 'px ' + (est.sombra.cor || 'rgba(0,0,0,0.3)');
    }

    // ==========================================================
    // ANIMAÇÕES DE ENTRADA (Etapa 3 - recurso 4)
    // Aplica a animação definida no estilo do elemento ao canvas
    // ==========================================================
    if (est.animacao) {
        // Aplica o CSS da animação ao elemento do canvas
        nodo.style.cssText += cssAnimacao(est.animacao);
    }

    // ==========================================================
    // EFEITO HOVER (Etapa 3 - micro-interações)
    // Aplica o hover definido no estilo do elemento ao canvas
    // ==========================================================
    if (est.hover) {
        // Guarda o estilo original (fundo e cor)
        const fundoOriginal = est.corFundo || '';
        const corOriginal = est.corTexto || '';
        // Define o evento de passar o mouse
        nodo.addEventListener('mouseenter', () => {
            // Se houver cor de fundo no hover, aplica
            if (est.hover.corFundo) nodo.style.backgroundColor = est.hover.corFundo;
            // Se houver cor de texto no hover, aplica
            if (est.hover.corTexto) nodo.style.color = est.hover.corTexto;
            // Se houver sombra no hover, aplica
            if (est.hover.sombra) {
                // Monta a sombra do hover
                nodo.style.boxShadow = (est.hover.sombra.x || 0) + 'px ' + (est.hover.sombra.y || 0) + 'px ' + (est.hover.sombra.blur || 10) + 'px ' + (est.hover.sombra.cor || 'rgba(0,0,0,0.3)');
            }
        });
        // Define o evento de sair do mouse
        nodo.addEventListener('mouseleave', () => {
            // Restaura o fundo original
            if (fundoOriginal) nodo.style.backgroundColor = fundoOriginal;
            // Restaura a cor original
            if (corOriginal) nodo.style.color = corOriginal;
            // Restaura a sombra original
            if (est.sombra) {
                // Monta a sombra original
                nodo.style.boxShadow = (est.sombra.x || 0) + 'px ' + (est.sombra.y || 0) + 'px ' + (est.sombra.blur || 10) + 'px ' + (est.sombra.cor || 'rgba(0,0,0,0.3)');
            }
        });
    }

    // Configura o clique para selecionar
    nodo.addEventListener('click', (e) => {
        // Impede propagação
        e.stopPropagation();
        // Seleciona o elemento
        selecionarElemento(el.id);
    });

    // Configura o arrastar (mover)
    configurarArrastar(nodo, el);

    // Retorna o elemento criado
    return nodo;
}

// Cria o card de produto (e-commerce)
function criarCardProduto(el) {
    // Cria o container
    const card = document.createElement('div');
    // Aplica o estilo do card
    card.style.cssText = 'background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.1);display:flex;flex-direction:column;';
    // Obtém os dados do produto
    const dados = el.dados || {};
    // Monta o HTML do card
    card.innerHTML = `
        <div style="height:55%;background:#e2e8f0;background-image:url('${dados.imagem}');background-size:cover;background-position:center;"></div>
        <div style="padding:10px;">
            <div style="font-size:14px;font-weight:600;color:#0f172a;">${dados.descricao || 'Produto'}</div>
            <div style="font-size:18px;font-weight:700;color:#38bdf8;margin-top:4px;">${dados.preco || 'R$ 0,00'}</div>
        </div>
    `;
    // Retorna o card
    return card;
}

// Cria o card de imóvel
function criarCardImovel(el) {
    // Cria o container
    const card = document.createElement('div');
    // Aplica o estilo do card
    card.style.cssText = 'background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.1);display:flex;flex-direction:column;';
    // Obtém os dados do imóvel
    const dados = el.dados || {};
    // Monta o HTML do card
    card.innerHTML = `
        <div style="height:50%;background:#fef3c7;background-image:url('${dados.imagem}');background-size:cover;background-position:center;"></div>
        <div style="padding:10px;">
            <div style="font-size:16px;font-weight:700;color:#0f172a;">${dados.preco || 'R$ 0'}</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px;">${dados.quarte || ''} · ${dados.area || ''}</div>
            <div style="font-size:12px;color:#94a3b8;">📍 ${dados.local || ''}</div>
        </div>
    `;
    // Retorna o card
    return card;
}

// Cria o card de veículo
function criarCardVeiculo(el) {
    // Cria o container
    const card = document.createElement('div');
    // Aplica o estilo do card
    card.style.cssText = 'background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.1);display:flex;flex-direction:column;';
    // Obtém os dados do veículo
    const dados = el.dados || {};
    // Monta o HTML do card
    card.innerHTML = `
        <div style="height:50%;background:#dbeafe;background-image:url('${dados.imagem}');background-size:cover;background-position:center;"></div>
        <div style="padding:10px;">
            <div style="font-size:14px;font-weight:600;color:#0f172a;">${dados.nome || 'Veículo'}</div>
            <div style="font-size:12px;color:#64748b;margin-top:2px;">${dados.ano || ''} · ${dados.km || ''}</div>
            <div style="font-size:16px;font-weight:700;color:#38bdf8;margin-top:4px;">${dados.preco || 'R$ 0'}</div>
        </div>
    `;
    // Retorna o card
    return card;
}

// Cria o formulário de lead
function criarFormulario(el) {
    // Cria o container
    const form = document.createElement('div');
    // Aplica o estilo do formulário
    form.style.cssText = 'background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:6px;';
    // Monta o HTML do formulário
    form.innerHTML = `
        <div style="font-size:12px;font-weight:600;color:#0f172a;">📋 Formulário de contato</div>
        <input placeholder="Nome" style="border:1px solid #e2e8f0;border-radius:6px;padding:6px;font-size:11px;width:100%;">
        <input placeholder="E-mail" style="border:1px solid #e2e8f0;border-radius:6px;padding:6px;font-size:11px;width:100%;">
        <button style="background:#38bdf8;color:#fff;border:none;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;">Enviar</button>
    `;
    // Retorna o formulário
    return form;
}

// ============================================================
// SELEÇÃO DE ELEMENTOS
// ============================================================

// Seleciona um elemento
function selecionarElemento(id) {
    // Define o elemento selecionado
    estadoEditor.selecionado = id;
    // Renderiza o canvas (para destacar)
    renderizarCanvas();
    // Encontra o elemento selecionado
    const el = estadoEditor.elementos.find(e => e.id === id);
    // Monta o painel de propriedades
    montarPainelPropriedades(el);
    // Atualiza as camadas
    atualizarCamadas();
}

// Clicar no canvas (área vazia) deseleciona
function configurarDrop() {
    // Seleciona o canvas
    const tela = document.getElementById('telaCanvas');
    // Clique no fundo do canvas
    tela.addEventListener('click', (e) => {
        // Se clicou no próprio canvas
        if (e.target === tela) {
            // Deseleciona
            estadoEditor.selecionado = null;
            // Renderiza
            renderizarCanvas();
            // Limpa o painel
            montarPainelPropriedades(null);
            // Atualiza camadas
            atualizarCamadas();
        }
    });
}

// ============================================================
// ARRASTAR (MOVER) ELEMENTOS
// ============================================================

// Configura o arrastar de um elemento
function configurarArrastar(nodo, el) {
    // Variáveis de controle do arrasto
    let inicioX = 0, inicioY = 0, elX = 0, elY = 0;

    // Evento de início do arrasto
    nodo.addEventListener('mousedown', (e) => {
        // Se clicou em um campo de texto interno, não arrasta
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') return;
        // Impede a seleção de texto
        e.preventDefault();
        // Marca que está arrastando
        estadoEditor.arrastando = true;
        // Guarda a posição inicial do mouse
        inicioX = e.clientX;
        inicioY = e.clientY;
        // Obtém a posição atual do elemento
        const pos = (el.pos && el.pos[estadoEditor.dispositivo]) || { x: 0, y: 0 };
        // Guarda a posição inicial do elemento
        elX = pos.x;
        elY = pos.y;
        // Seleciona o elemento
        selecionarElemento(el.id);

        // Função de movimento
        function mover(e2) {
            // Calcula o delta
            const dx = e2.clientX - inicioX;
            const dy = e2.clientY - inicioY;
            // Atualiza a posição no estado
            atualizarPosicao(el.id, elX + dx, elY + dy);
            // Atualiza a posição no DOM
            nodo.style.left = (elX + dx) + 'px';
            nodo.style.top = (elY + dy) + 'px';
        }

        // Função de soltar
        function soltar() {
            // Remove os eventos
            document.removeEventListener('mousemove', mover);
            document.removeEventListener('mouseup', soltar);
            // Marca que não está mais arrastando
            estadoEditor.arrastando = false;
            // Guarda no histórico
            guardarHistorico();
        }

        // Registra os eventos de movimento e soltura
        document.addEventListener('mousemove', mover);
        document.addEventListener('mouseup', soltar);
    });
}

// Atualiza a posição de um elemento no estado
function atualizarPosicao(id, x, y) {
    // Encontra o elemento
    const el = estadoEditor.elementos.find(e => e.id === id);
    // Se achar
    if (el) {
        // Garante que exista a posição do dispositivo
        if (!el.pos) el.pos = {};
        if (!el.pos[estadoEditor.dispositivo]) el.pos[estadoEditor.dispositivo] = { x: 0, y: 0 };
        // Atualiza X e Y
        el.pos[estadoEditor.dispositivo].x = Math.round(x);
        el.pos[estadoEditor.dispositivo].y = Math.round(y);
    }
}

// ============================================================
// PAINEL DE PROPRIEDADES (direito)
// ============================================================

// Monta o painel de propriedades de um elemento
function montarPainelPropriedades(el) {
    // Seleciona o container do painel
    const painel = document.getElementById('painelProps');
    // Se não houver elemento selecionado
    if (!el) {
        // Mostra mensagem vazia
        painel.innerHTML = '<div class="prop-vazio">Selecione um elemento para editar suas propriedades.</div>';
        return;
    }

    // Garante que exista o objeto estilo
    if (!el.estilo) el.estilo = {};
    // Garante que exista a posição do dispositivo
    if (!el.pos) el.pos = {};
    if (!el.pos[estadoEditor.dispositivo]) el.pos[estadoEditor.dispositivo] = { x: 0, y: 0 };
    // Pega a posição atual
    const pos = el.pos[estadoEditor.dispositivo];
    // Pega o estilo
    const est = el.estilo;

    // Monta o HTML do painel de propriedades
    painel.innerHTML = `
        <div class="painel-props-titulo">✏️ Propriedades — ${el.tipo}</div>

        <!-- Seção de texto -->
        <div class="prop-secao">
            <h4>Texto</h4>
            <div class="prop-grupo">
                <label>Conteúdo</label>
                <input class="prop-input" id="propTexto" value="${escapeHtml(el.texto || '')}" oninput="propAlterar('texto', this.value)">
            </div>
            <div class="prop-linha">
                <div class="prop-grupo">
                    <label>Cor</label>
                    <input class="prop-cor" type="color" id="propCorTexto" value="${est.corTexto || '#0f172a'}" onchange="propAlterar('corTexto', this.value)">
                </div>
                <div class="prop-grupo">
                    <label>Tamanho</label>
                    <input class="prop-input" type="number" id="propTamanho" value="${est.tamanhoFonte || 16}" onchange="propAlterar('tamanhoFonte', parseInt(this.value))">
                </div>
            </div>
            <div class="prop-linha">
                <div class="prop-grupo">
                    <label>Peso</label>
                    <select class="prop-input" id="propGrossura" onchange="propAlterar('grossura', this.value)">
                        <option value="400" ${est.grossura == '400' ? 'selected' : ''}>Normal</option>
                        <option value="600" ${est.grossura == '600' ? 'selected' : ''}>Semi-negrito</option>
                        <option value="700" ${est.grossura == '700' ? 'selected' : ''}>Negrito</option>
                    </select>
                </div>
                <div class="prop-grupo">
                    <label>Alinhamento</label>
                    <select class="prop-input" id="propAlinhamento" onchange="propAlterar('alinhamento', this.value)">
                        <option value="left" ${est.alinhamento == 'left' ? 'selected' : ''}>Esquerda</option>
                        <option value="center" ${est.alinhamento == 'center' ? 'selected' : ''}>Centro</option>
                        <option value="right" ${est.alinhamento == 'right' ? 'selected' : ''}>Direita</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Seção de posição -->
        <div class="prop-secao">
            <h4>Posição</h4>
            <div class="prop-linha">
                <div class="prop-grupo">
                    <label>X</label>
                    <input class="prop-input" type="number" id="propX" value="${pos.x || 0}" onchange="propAlterarPos('x', parseInt(this.value))">
                </div>
                <div class="prop-grupo">
                    <label>Y</label>
                    <input class="prop-input" type="number" id="propY" value="${pos.y || 0}" onchange="propAlterarPos('y', parseInt(this.value))">
                </div>
            </div>
            <div class="prop-linha">
                <div class="prop-grupo">
                    <label>Largura</label>
                    <input class="prop-input" type="number" id="propW" value="${pos.w || ''}" onchange="propAlterarPos('w', parseInt(this.value))">
                </div>
                <div class="prop-grupo">
                    <label>Altura</label>
                    <input class="prop-input" type="number" id="propH" value="${pos.h || ''}" onchange="propAlterarPos('h', parseInt(this.value))">
                </div>
            </div>
        </div>

        <!-- Seção de fundo e borda -->
        <div class="prop-secao">
            <h4>Fundo & Borda</h4>
            <div class="prop-linha">
                <div class="prop-grupo">
                    <label>Fundo</label>
                    <input class="prop-cor" type="color" id="propFundo" value="${est.corFundo || '#ffffff'}" onchange="propAlterar('corFundo', this.value)">
                </div>
                <div class="prop-grupo">
                    <label>Borda raio</label>
                    <input class="prop-input" type="number" id="propRaio" value="${est.raioBorda || 0}" onchange="propAlterar('raioBorda', parseInt(this.value))">
                </div>
            </div>
            <div class="prop-linha">
                <div class="prop-grupo">
                    <label>Opacidade</label>
                    <input class="prop-input" type="number" min="0" max="1" step="0.1" id="propOpacidade" value="${est.opacidade || 1}" onchange="propAlterar('opacidade', parseFloat(this.value))">
                </div>
                <div class="prop-grupo">
                    <label>Rotação</label>
                    <input class="prop-input" type="number" id="propRotacao" value="${est.rotacao || 0}" onchange="propAlterar('rotacao', parseInt(this.value))">
                </div>
            </div>
        </div>

        <!-- Seção de URL (vídeo, mapa, imagem, whatsapp) -->
        ${el.tipo === 'video' || el.tipo === 'mapa' || el.tipo === 'imagem' || el.tipo === 'whatsapp' ? `
        <div class="prop-secao">
            <h4>URL</h4>
            <div class="prop-grupo">
                <label>Link/URL</label>
                <input class="prop-input" id="propUrl" value="${escapeHtml(el.url || '')}" onchange="propAlterarUrl(this.value)">
            </div>
            ${el.tipo === 'imagem' ? `
            <div class="prop-grupo">
                <label>Upload de imagem (ImgBB)</label>
                <input class="prop-input" type="file" id="propUploadImagem" accept="image/*" onchange="fazerUploadImagem(this)">
                <small style="color:#64748b;font-size:0.7em;">A imagem será enviada ao ImgBB e a URL inserida automaticamente.</small>
            </div>
            ` : ''}
        </div>
        ` : ''}

        <!-- Seção de dados do card (produto, imóvel, veículo) -->
        ${el.tipo === 'produto' ? `
        <div class="prop-secao">
            <h4>Dados do Produto</h4>
            <div class="prop-grupo">
                <label>Imagem (URL)</label>
                <input class="prop-input" id="prodImagem" value="${escapeHtml((el.dados && el.dados.imagem) || '')}" onchange="propAlterarDados('imagem', this.value)">
            </div>
            <div class="prop-grupo">
                <label>Upload de imagem</label>
                <input class="prop-input" type="file" accept="image/*" onchange="fazerUploadImagemCard(this, 'imagem')">
            </div>
            <div class="prop-grupo">
                <label>Preço</label>
                <input class="prop-input" id="prodPreco" value="${escapeHtml((el.dados && el.dados.preco) || '')}" onchange="propAlterarDados('preco', this.value)">
            </div>
            <div class="prop-grupo">
                <label>Descrição</label>
                <input class="prop-input" id="prodDescricao" value="${escapeHtml((el.dados && el.dados.descricao) || '')}" onchange="propAlterarDados('descricao', this.value)">
            </div>
        </div>
        ` : ''}
        ${el.tipo === 'imovel' ? `
        <div class="prop-secao">
            <h4>Dados do Imóvel</h4>
            <div class="prop-grupo">
                <label>Imagem (URL)</label>
                <input class="prop-input" id="imovImagem" value="${escapeHtml((el.dados && el.dados.imagem) || '')}" onchange="propAlterarDados('imagem', this.value)">
            </div>
            <div class="prop-grupo">
                <label>Upload de imagem</label>
                <input class="prop-input" type="file" accept="image/*" onchange="fazerUploadImagemCard(this, 'imagem')">
            </div>
            <div class="prop-grupo">
                <label>Preço</label>
                <input class="prop-input" id="imovPreco" value="${escapeHtml((el.dados && el.dados.preco) || '')}" onchange="propAlterarDados('preco', this.value)">
            </div>
            <div class="prop-linha">
                <div class="prop-grupo">
                    <label>Quartos</label>
                    <input class="prop-input" id="imovQuarte" value="${escapeHtml((el.dados && el.dados.quarte) || '')}" onchange="propAlterarDados('quarte', this.value)">
                </div>
                <div class="prop-grupo">
                    <label>Área</label>
                    <input class="prop-input" id="imovArea" value="${escapeHtml((el.dados && el.dados.area) || '')}" onchange="propAlterarDados('area', this.value)">
                </div>
            </div>
            <div class="prop-grupo">
                <label>Local</label>
                <input class="prop-input" id="imovLocal" value="${escapeHtml((el.dados && el.dados.local) || '')}" onchange="propAlterarDados('local', this.value)">
            </div>
        </div>
        ` : ''}
        ${el.tipo === 'veiculo' ? `
        <div class="prop-secao">
            <h4>Dados do Veículo</h4>
            <div class="prop-grupo">
                <label>Imagem (URL)</label>
                <input class="prop-input" id="veiImagem" value="${escapeHtml((el.dados && el.dados.imagem) || '')}" onchange="propAlterarDados('imagem', this.value)">
            </div>
            <div class="prop-grupo">
                <label>Upload de imagem</label>
                <input class="prop-input" type="file" accept="image/*" onchange="fazerUploadImagemCard(this, 'imagem')">
            </div>
            <div class="prop-grupo">
                <label>Nome</label>
                <input class="prop-input" id="veiNome" value="${escapeHtml((el.dados && el.dados.nome) || '')}" onchange="propAlterarDados('nome', this.value)">
            </div>
            <div class="prop-linha">
                <div class="prop-grupo">
                    <label>Ano</label>
                    <input class="prop-input" id="veiAno" value="${escapeHtml((el.dados && el.dados.ano) || '')}" onchange="propAlterarDados('ano', this.value)">
                </div>
                <div class="prop-grupo">
                    <label>KM</label>
                    <input class="prop-input" id="veiKm" value="${escapeHtml((el.dados && el.dados.km) || '')}" onchange="propAlterarDados('km', this.value)">
                </div>
            </div>
            <div class="prop-grupo">
                <label>Preço</label>
                <input class="prop-input" id="veiPreco" value="${escapeHtml((el.dados && el.dados.preco) || '')}" onchange="propAlterarDados('preco', this.value)">
            </div>
        </div>
        ` : ''}

        <!-- Seção de animações (recurso 4) -->
        <div class="prop-secao">
            <h4>Animação de entrada</h4>
            <div class="prop-grupo">
                <label>Tipo</label>
                <select class="prop-input" id="propAnimacao" onchange="propAlterar('animacao', this.value)">
                    <option value="" ${!est.animacao ? 'selected' : ''}>Nenhuma</option>
                    <option value="fade" ${est.animacao == 'fade' ? 'selected' : ''}>Fade (aparecer)</option>
                    <option value="slide" ${est.animacao == 'slide' ? 'selected' : ''}>Slide (subir)</option>
                    <option value="zoom" ${est.animacao == 'zoom' ? 'selected' : ''}>Zoom (crescer)</option>
                    <option value="slideLeft" ${est.animacao == 'slideLeft' ? 'selected' : ''}>Slide (esquerda)</option>
                </select>
            </div>
        </div>

        <!-- Seção de hover (micro-interações) -->
        <div class="prop-secao">
            <h4>Efeito Hover</h4>
            <div class="prop-linha">
                <div class="prop-grupo">
                    <label>Fundo hover</label>
                    <input class="prop-cor" type="color" id="propHoverFundo" value="${(est.hover && est.hover.corFundo) || '#38bdf8'}" onchange="propAlterarHover('corFundo', this.value)">
                </div>
                <div class="prop-grupo">
                    <label>Texto hover</label>
                    <input class="prop-cor" type="color" id="propHoverTexto" value="${(est.hover && est.hover.corTexto) || '#ffffff'}" onchange="propAlterarHover('corTexto', this.value)">
                </div>
            </div>
        </div>

        <!-- Ações -->
        <div class="prop-secao">
            <h4>Ações</h4>
            <div style="display:flex;gap:6px;">
                <button class="btn-icone" style="flex:1;" onclick="duplicarElemento()">⧉ Duplicar</button>
                <button class="btn-icone" style="flex:1;color:#f87171;" onclick="removerElemento()">🗑 Excluir</button>
            </div>
        </div>
    `;
}

// ============================================================
// FUNÇÃO: faz upload de uma imagem para o ImgBB (elemento imagem)
// Parametros: input (elemento file input)
// Retorna: nenhum (atualiza a URL do elemento)
// ============================================================
async function fazerUploadImagem(input) {
    // Obtém o arquivo selecionado
    const arquivo = input.files && input.files[0];
    // Se não houver arquivo, sai
    if (!arquivo) return;
    // Lê o arquivo como base64
    const leitor = new FileReader();
    // Define o que fazer ao ler o arquivo
    leitor.onload = async (e) => {
        // Obtém o base64 da imagem
        const base64 = e.target.result;
        // Informa que está enviando
        mostrarToast('Enviando imagem...', 'info');
        // Chama a API para fazer o upload
        const resposta = await apiUploadImagem(base64, arquivo.name);
        // Se o upload foi bem-sucedido
        if (resposta.sucesso) {
            // Obtém a URL retornada
            const url = resposta.dados.url;
            // Encontra o elemento selecionado
            const el = estadoEditor.elementos.find(e => e.id === estadoEditor.selecionado);
            // Se achar, atualiza a URL
            if (el) {
                // Atualiza a URL do elemento
                el.url = url;
                // Adiciona a URL à lista de imagens do site
                if (estadoEditor.imagens.indexOf(url) === -1) estadoEditor.imagens.push(url);
                // Renderiza o canvas
                renderizarCanvas();
                // Re-monta o painel (para atualizar o campo URL)
                montarPainelPropriedades(el);
                // Informa o sucesso
                mostrarToast('Imagem enviada com sucesso!', 'sucesso');
            }
        } else {
            // Mostra o erro
            mostrarToast('Erro no upload: ' + resposta.mensagem, 'erro');
        }
    };
    // Lê o arquivo como data URL (base64)
    leitor.readAsDataURL(arquivo);
}

// ============================================================
// FUNÇÃO: faz upload de uma imagem para o ImgBB (card produto/imóvel/veículo)
// Parametros: input (elemento file input) e chave (campo do card)
// Retorna: nenhum (atualiza o campo dados do card)
// ============================================================
async function fazerUploadImagemCard(input, chave) {
    // Obtém o arquivo selecionado
    const arquivo = input.files && input.files[0];
    // Se não houver arquivo, sai
    if (!arquivo) return;
    // Lê o arquivo como base64
    const leitor = new FileReader();
    // Define o que fazer ao ler o arquivo
    leitor.onload = async (e) => {
        // Obtém o base64 da imagem
        const base64 = e.target.result;
        // Informa que está enviando
        mostrarToast('Enviando imagem...', 'info');
        // Chama a API para fazer o upload
        const resposta = await apiUploadImagem(base64, arquivo.name);
        // Se o upload foi bem-sucedido
        if (resposta.sucesso) {
            // Obtém a URL retornada
            const url = resposta.dados.url;
            // Encontra o elemento selecionado
            const el = estadoEditor.elementos.find(e => e.id === estadoEditor.selecionado);
            // Se achar, atualiza o campo do card
            if (el) {
                // Garante o objeto dados
                if (!el.dados) el.dados = {};
                // Atualiza o campo da imagem do card
                el.dados[chave] = url;
                // Adiciona a URL à lista de imagens do site
                if (estadoEditor.imagens.indexOf(url) === -1) estadoEditor.imagens.push(url);
                // Renderiza o canvas
                renderizarCanvas();
                // Re-monta o painel (para atualizar o campo URL)
                montarPainelPropriedades(el);
                // Informa o sucesso
                mostrarToast('Imagem enviada com sucesso!', 'sucesso');
            }
        } else {
            // Mostra o erro
            mostrarToast('Erro no upload: ' + resposta.mensagem, 'erro');
        }
    };
    // Lê o arquivo como data URL (base64)
    leitor.readAsDataURL(arquivo);
}

// ============================================================
// FUNÇÃO: altera a URL de um elemento (vídeo, mapa, imagem, whatsapp)
// ============================================================
function propAlterarUrl(valor) {
    // Encontra o elemento selecionado
    const el = estadoEditor.elementos.find(e => e.id === estadoEditor.selecionado);
    // Se não achar, sai
    if (!el) return;
    // Atualiza a URL do elemento
    el.url = valor;
    // Renderiza o canvas
    renderizarCanvas();
}

// ============================================================
// FUNÇÃO: altera os dados de um card (produto, imóvel, veículo)
// ============================================================
function propAlterarDados(chave, valor) {
    // Encontra o elemento selecionado
    const el = estadoEditor.elementos.find(e => e.id === estadoEditor.selecionado);
    // Se não achar, sai
    if (!el) return;
    // Garante o objeto dados
    if (!el.dados) el.dados = {};
    // Atualiza o dado do card
    el.dados[chave] = valor;
    // Renderiza o canvas
    renderizarCanvas();
}

// ============================================================
// FUNÇÃO: altera o efeito hover de um elemento
// ============================================================
function propAlterarHover(chave, valor) {
    // Encontra o elemento selecionado
    const el = estadoEditor.elementos.find(e => e.id === estadoEditor.selecionado);
    // Se não achar, sai
    if (!el) return;
    // Garante o objeto estilo
    if (!el.estilo) el.estilo = {};
    // Garante o objeto hover
    if (!el.estilo.hover) el.estilo.hover = {};
    // Atualiza a propriedade do hover
    el.estilo.hover[chave] = valor;
    // Renderiza o canvas
    renderizarCanvas();
}

// Altera uma propriedade de texto/estilo do elemento selecionado
function propAlterar(chave, valor) {
    // Encontra o elemento selecionado
    const el = estadoEditor.elementos.find(e => e.id === estadoEditor.selecionado);
    // Se não achar, sai
    if (!el) return;
    // Garante o objeto estilo
    if (!el.estilo) el.estilo = {};
    // Atualiza a propriedade
    el.estilo[chave] = valor;
    // Renderiza o canvas (para refletir a alteração)
    renderizarCanvas();
}

// Altera uma propriedade de posição
function propAlterarPos(chave, valor) {
    // Encontra o elemento selecionado
    const el = estadoEditor.elementos.find(e => e.id === estadoEditor.selecionado);
    // Se não achar, sai
    if (!el) return;
    // Garante o objeto pos
    if (!el.pos) el.pos = {};
    if (!el.pos[estadoEditor.dispositivo]) el.pos[estadoEditor.dispositivo] = { x: 0, y: 0 };
    // Atualiza a propriedade da posição
    el.pos[estadoEditor.dispositivo][chave] = valor;
    // Renderiza o canvas
    renderizarCanvas();
}

// ============================================================
// CAMADAS (painel esquerdo)
// ============================================================

// Atualiza a lista de camadas
function atualizarCamadas() {
    // Seleciona o container de camadas
    const container = document.getElementById('listaCamadas');
    // Limpa o container
    container.innerHTML = '';
    // Percorre os elementos de trás para frente (z-index visual)
    for (let i = estadoEditor.elementos.length - 1; i >= 0; i--) {
        // Obtém o elemento
        const el = estadoEditor.elementos[i];
        // Cria o item da camada
        const item = document.createElement('div');
        // Define a classe do item
        item.className = 'item-camada' + (el.id === estadoEditor.selecionado ? ' ativo' : '');
        // Define o conteúdo (ícone + rótulo)
        item.innerHTML = '<span>' + obterIconeTipo(el.tipo) + '</span>' + obterRotuloTipo(el.tipo);
        // Configura o clique para selecionar
        item.addEventListener('click', () => selecionarElemento(el.id));
        // Adiciona o item ao container
        container.appendChild(item);
    }
    // Se não houver elementos
    if (estadoEditor.elementos.length === 0) {
        // Mostra mensagem
        container.innerHTML = '<div style="color:#64748b;font-size:0.8em;padding:10px;">Nenhum elemento ainda.</div>';
    }
}

// Retorna o ícone de um tipo de elemento
function obterIconeTipo(tipo) {
    // Percorre o catálogo
    for (const cat of CATALOGO_ELEMENTOS) {
        // Encontra o item
        const item = cat.itens.find(i => i.tipo === tipo);
        // Se achar, retorna o ícone
        if (item) return item.icone;
    }
    // Ícone padrão
    return '🔹';
}

// Retorna o rótulo de um tipo de elemento
function obterRotuloTipo(tipo) {
    // Mapa de rótulos por tipo
    const rotulos = {
        titulo: 'Título', paragrafo: 'Parágrafo', botao: 'Botão', imagem: 'Imagem',
        container: 'Caixa', divisor: 'Divisor', video: 'Vídeo', produto: 'Produto',
        imovel: 'Imóvel', veiculo: 'Veículo', formulario: 'Formulário',
        whatsapp: 'WhatsApp', mapa: 'Mapa'
    };
    // Retorna o rótulo ou o próprio tipo
    return rotulos[tipo] || tipo;
}

// ============================================================
// DISPOSITIVOS (responsividade)
// ============================================================

// Configura os botões de dispositivo
function configurarDispositivos() {
    // Seleciona todos os botões de dispositivo
    const botoes = document.querySelectorAll('[data-dispositivo]');
    // Percorre os botões
    botoes.forEach(btn => {
        // Configura o clique
        btn.addEventListener('click', () => {
            // Define o dispositivo
            estadoEditor.dispositivo = btn.getAttribute('data-dispositivo');
            // Atualiza a classe do canvas
            const tela = document.getElementById('telaCanvas');
            // Remove todas as classes de dispositivo
            tela.classList.remove('desktop', 'tablet', 'mobile');
            // Adiciona a classe do dispositivo atual
            tela.classList.add(estadoEditor.dispositivo);
            // Atualiza os botões ativos
            botoes.forEach(b => b.classList.toggle('ativo', b === btn));
            // Renderiza o canvas
            renderizarCanvas();
            // Se houver seleção, monta o painel
            if (estadoEditor.selecionado) {
                const el = estadoEditor.elementos.find(e => e.id === estadoEditor.selecionado);
                montarPainelPropriedades(el);
            }
        });
    });
}

// ============================================================
// HISTÓRICO (desfazer/refazer)
// ============================================================

// Guarda o estado atual no histórico
function guardarHistorico() {
    // Faz uma cópia profunda dos elementos
    const copia = JSON.parse(JSON.stringify(estadoEditor.elementos));
    // Remove estados futuros (quando desfez e altera)
    estadoEditor.historico = estadoEditor.historico.slice(0, estadoEditor.indiceHistorico + 1);
    // Adiciona o estado atual
    estadoEditor.historico.push(copia);
    // Atualiza o índice
    estadoEditor.indiceHistorico = estadoEditor.historico.length - 1;
    // Limita o histórico a 50 entradas
    if (estadoEditor.historico.length > 50) {
        // Remove a mais antiga
        estadoEditor.historico.shift();
        // Ajusta o índice
        estadoEditor.indiceHistorico--;
    }
}

// Desfaz a última ação
function desfazer() {
    // Se estiver no início, sai
    if (estadoEditor.indiceHistorico <= 0) return;
    // Decrementa o índice
    estadoEditor.indiceHistorico--;
    // Restaura os elementos do histórico
    estadoEditor.elementos = JSON.parse(JSON.stringify(estadoEditor.historico[estadoEditor.indiceHistorico]));
    // Limpa a seleção
    estadoEditor.selecionado = null;
    // Renderiza o canvas
    renderizarCanvas();
    // Atualiza as camadas
    atualizarCamadas();
    // Limpa o painel
    montarPainelPropriedades(null);
}

// Refaz a próxima ação
function refazer() {
    // Se estiver no fim, sai
    if (estadoEditor.indiceHistorico >= estadoEditor.historico.length - 1) return;
    // Incrementa o índice
    estadoEditor.indiceHistorico++;
    // Restaura os elementos do histórico
    estadoEditor.elementos = JSON.parse(JSON.stringify(estadoEditor.historico[estadoEditor.indiceHistorico]));
    // Limpa a seleção
    estadoEditor.selecionado = null;
    // Renderiza o canvas
    renderizarCanvas();
    // Atualiza as camadas
    atualizarCamadas();
    // Limpa o painel
    montarPainelPropriedades(null);
}

// ============================================================
// ATALHOS DE TECLADO
// ============================================================

// Configura os atalhos de teclado
function configurarTeclado() {
    // Evento de tecla pressionada
    document.addEventListener('keydown', (e) => {
        // Se estiver digitando em um campo, não interfere
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

        // Ctrl+Z desfaz
        if (e.ctrlKey && e.key === 'z') { e.preventDefault(); desfazer(); return; }
        // Ctrl+Y refaz
        if (e.ctrlKey && e.key === 'y') { e.preventDefault(); refazer(); return; }
        // Ctrl+D duplica
        if (e.ctrlKey && e.key === 'd') { e.preventDefault(); duplicarElemento(); return; }
        // Delete remove
        if (e.key === 'Delete') { removerElemento(); return; }

        // Setas movem o elemento selecionado
        const el = estadoEditor.elementos.find(e => e.id === estadoEditor.selecionado);
        // Se não houver seleção, sai
        if (!el) return;
        // Define o passo (1px normal, 10px com shift)
        const passo = e.shiftKey ? 10 : 1;
        // Obtém a posição atual
        const pos = (el.pos && el.pos[estadoEditor.dispositivo]) || { x: 0, y: 0 };
        // Controla a tecla pressionada
        switch (e.key) {
            case 'ArrowLeft': atualizarPosicao(el.id, (pos.x || 0) - passo, pos.y || 0); break;
            case 'ArrowRight': atualizarPosicao(el.id, (pos.x || 0) + passo, pos.y || 0); break;
            case 'ArrowUp': atualizarPosicao(el.id, pos.x || 0, (pos.y || 0) - passo); break;
            case 'ArrowDown': atualizarPosicao(el.id, pos.x || 0, (pos.y || 0) + passo); break;
            default: return;
        }
        // Se usou seta, renderiza
        e.preventDefault();
        renderizarCanvas();
    });
}

// ============================================================
// MENU DE CONTEXTO (botão direito)
// ============================================================

// Configura o menu de contexto
function configurarMenuContexto() {
    // Evento de clique direito no canvas
    document.getElementById('telaCanvas').addEventListener('contextmenu', (e) => {
        // Impede o menu padrão
        e.preventDefault();
        // Encontra o elemento clicado
        const alvo = e.target.closest('.el-canvas');
        // Se clicou em um elemento
        if (alvo) {
            // Seleciona o elemento
            selecionarElemento(alvo.getAttribute('data-id'));
            // Cria um menu de contexto simples
            const opcao = confirm('Ações:\n\nOK = Duplicar\nCancelar = Excluir');
            // Se escolheu OK, duplica
            if (opcao) {
                duplicarElemento();
            } else {
                removerElemento();
            }
        }
    });
}

// ============================================================
// PREVIEW (renderização limpa)
// ============================================================

// Abre o modo preview
function abrirPreview() {
    // Seleciona o modal
    const modal = document.getElementById('modalPreview');
    // Seleciona a janela do preview
    const janela = document.getElementById('previewConteudo');
    // Limpa a janela
    janela.innerHTML = '';
    // ==========================================================
    // PREVIEW COMPLETO (Etapa 7 - melhoria)
    // Monta a estrutura completa com múltiplas páginas, nome e tema
    // para que o preview mostre menu de navegação, tema global e animações
    // ==========================================================
    // Sincroniza os elementos da página atual no array de páginas
    if (estadoEditor.paginas && estadoEditor.paginas[estadoEditor.paginaAtual]) {
        // Atualiza os elementos da página ativa
        estadoEditor.paginas[estadoEditor.paginaAtual].elementos = estadoEditor.elementos;
    }
    // Monta a estrutura completa do site para o preview
    const estruturaPreview = {
        // Array de páginas (cada uma com nome e elementos)
        paginas: estadoEditor.paginas || [{ id: 'pag_1', nome: 'Home', elementos: estadoEditor.elementos || [] }],
        // Índice da página ativa
        paginaAtual: estadoEditor.paginaAtual || 0,
        // Nome do site (para o menu)
        nome: estadoEditor.nome || 'Meu Site',
        // Tema de cores global do site
        temaCores: estadoEditor.temaCores || {}
    };
    // Renderiza o site completo (com páginas, menu, tema e animações)
    renderizarSiteCompleto(janela, estruturaPreview, estadoEditor.dispositivo);
    // Mostra a modal
    modal.classList.add('visivel');
}

// Fecha o modo preview
function fecharPreview() {
    // Esconde a modal
    document.getElementById('modalPreview').classList.remove('visivel');
}

// ============================================================
// SALVAR O SITE
// ============================================================

// Salva o site (mock ou real)
async function salvarSite(publicar) {
    // Obtém o nome do site
    const nome = document.getElementById('nomeSite').value.trim() || 'Meu Site';
    // Atualiza o nome no estado
    estadoEditor.nome = nome;

    // Obtém o id do cliente logado
    const usuario = obterUsuario();
    // Se não estiver logado
    if (!usuario) {
        // Informa que precisa logar
        mostrarToast('Faça login para salvar o site', 'erro');
        return;
    }
// Define o id do cliente
    estadoEditor.idCliente = usuario.ID || usuario.id;

    // ==========================================================
    // MÚLTIPLAS PÁGINAS (DECISÃO 10 - recurso 2)
    // Sincroniza os elementos da página atual de volta ao array
    // de páginas antes de salvar, garantindo que nenhuma edição
    // da página ativa seja perdida.
    // ==========================================================
    // Garante que o array de páginas exista
    if (!estadoEditor.paginas || estadoEditor.paginas.length === 0) {
        // Cria a página Home padrão
        estadoEditor.paginas = [{ id: 'pag_' + gerarIdCurto(), nome: 'Home', elementos: [] }];
        estadoEditor.paginaAtual = 0;
    }
    // Sincroniza os elementos da página atual no array de páginas
    if (estadoEditor.paginas[estadoEditor.paginaAtual]) {
        // Atualiza os elementos da página ativa
        estadoEditor.paginas[estadoEditor.paginaAtual].elementos = estadoEditor.elementos;
    }

    // Monta o JSON completo da estrutura (com as múltiplas páginas)
    // Formato: { paginas: [...], paginaAtual: N }
    const estruturaCompleta = {
        // Array de páginas (cada uma com nome e elementos)
        paginas: estadoEditor.paginas,
        // Índice da página ativa (para reabrir no editor)
        paginaAtual: estadoEditor.paginaAtual
    };

// Monta o objeto do site
    const dadosSite = {
        // ID do site (novo ou existente)
        idSite: estadoEditor.idSite,
        // ID do cliente
        idCliente: estadoEditor.idCliente,
        // Nome do site
        nome: nome,
        // JSON da estrutura (agora com múltiplas páginas)
        json: JSON.stringify(estruturaCompleta),
        // Subdomínio do site
        subdominio: estadoEditor.subdominio,
        // URLs das imagens do site (ImgBB)
        imagens: estadoEditor.imagens,
        // Tema de cores global do site
        temaCores: estadoEditor.temaCores,
        // Imagem de compartilhamento do SEO
        seoImagem: estadoEditor.seoImagem || '',
        // SEO - título do site
        seoTitulo: estadoEditor.seoTitulo,
        // SEO - descrição do site
        seoDescricao: estadoEditor.seoDescricao,
        // Status: publicado ou rascunho
        status: publicar ? 'publicado' : 'rascunho'
    };

// Chama a API para salvar
    const resposta = await apiSalvarSite(dadosSite);
    // Se salvou com sucesso
    if (resposta.sucesso) {
        // Guarda o id do site retornado (aceita idSite do mock ou ID_SITE do backend real)
        estadoEditor.idSite = resposta.dados.idSite || resposta.dados.ID_SITE;
        // Informa o sucesso
        mostrarToast(publicar ? 'Site publicado!' : 'Site salvo como rascunho!', 'sucesso');
    } else {
        // Mostra o erro
        mostrarToast('Erro ao salvar: ' + resposta.mensagem, 'erro');
    }
}

// ============================================================
// UTILITÁRIO: escape de HTML
// ============================================================

// Escapa caracteres HTML para evitar quebra do painel
function escapeHtml(texto) {
    // Se não for string, retorna vazio
    if (typeof texto !== 'string') return '';
    // Define as entidades HTML usando String.fromCharCode para evitar
    // que o formatador converta as entidades de volta para caracteres
    var amp = String.fromCharCode(38) + 'amp;'; // &
    var lt = String.fromCharCode(38) + 'lt;';   // <
    var gt = String.fromCharCode(38) + 'gt;';   // >
    var quot = String.fromCharCode(38) + 'quot;'; // "
    var apos = String.fromCharCode(38) + '#039;'; // &#039;
    // Substitui os caracteres especiais pelas entidades
    return texto
        .replace(/&/g, amp)
        .replace(/</g, lt)
        .replace(/>/g, gt)
        .replace(/"/g, quot)
        .replace(/'/g, apos);
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

// Inicializa o editor quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', iniciarEditor);
