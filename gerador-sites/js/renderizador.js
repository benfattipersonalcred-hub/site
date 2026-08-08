// ============================================================
// ARQUIVO: js/renderizador.js
// DESCRIÇÃO: Desenha o site do cliente a partir do JSON
//           (DECISÃO 06 - site.html?id=X e DECISÃO 07 - JSON).
//           Converte cada elemento do JSON em HTML/estilos.
//           Suporta TODOS os tipos do catálogo (Bloco 3).
//           AGORA SUPORTA: múltiplas páginas, menu de navegação
//           automático, tema global e animações de entrada.
// ============================================================

// ============================================================
// VARIÁVEL GLOBAL: guarda o estado da renderização (páginas)
// ============================================================

// Objeto que guarda as páginas e a página ativa do site renderizado
let estadoRenderizacao = {
    // Array de páginas (cada uma com nome e elementos)
    paginas: [],
    // Índice da página ativa
    paginaAtual: 0,
    // Nome do site (para o menu)
    nome: 'Meu Site',
    // Tema de cores global do site
    temaCores: {}
};

// ============================================================
// FUNÇÃO: cria o elemento HTML de um item do JSON
// Parametros: item (objeto do elemento) e device (dispositivo)
// Retorna: o elemento DOM criado
// ============================================================
function criarElementoDoSite(item, device) {
    // Faz fallback do dispositivo para desktop
    const d = device || 'desktop';

    // Obtém a posição específica do dispositivo (ou desktop)
    const pos = item.pos && item.pos[d] ? item.pos[d] : (item.pos && item.pos.desktop);

    // Flag que indica se o conteúdo já foi montado pelo card
    let conteudoPronto = false;

    // Cria o elemento base conforme o tipo
    let el;
    // Controle por tipo de elemento
    switch (item.tipo) {
        case 'titulo':
            // Cria um elemento de título h1
            el = document.createElement('h1');
            break;
        case 'paragrafo':
            // Cria um elemento de parágrafo p
            el = document.createElement('p');
            break;
        case 'botao':
            // Cria um elemento de botão button
            el = document.createElement('button');
            break;
        case 'imagem':
            // Cria um elemento de imagem img
            el = document.createElement('img');
            break;
        case 'divisor':
            // Cria um elemento hr para a linha divisória
            el = document.createElement('hr');
            break;
        case 'container':
            // Cria um container div
            el = document.createElement('div');
            break;
        case 'video':
            // Cria um iframe para vídeo (YouTube)
            el = document.createElement('iframe');
            // Define a fonte do vídeo (se houver)
            if (item.url) el.src = item.url;
            // Permite tela cheia
            el.setAttribute('allowfullscreen', '');
            // Remove margem e borda do iframe
            el.style.border = 'none';
            break;
        case 'mapa':
            // Cria um iframe para mapa (Google Maps)
            el = document.createElement('iframe');
            // Define a fonte do mapa (se houver)
            if (item.url) el.src = item.url;
            // Remove margem e borda do iframe
            el.style.border = 'none';
            break;
        case 'whatsapp':
            // Cria um link (âncora) para o WhatsApp
            el = document.createElement('a');
            // Define o link do WhatsApp
            el.href = item.url || 'https://wa.me/5500000000000';
            // Abre em nova aba
            el.target = '_blank';
            // Centraliza o texto
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.textDecoration = 'none';
            break;
        case 'produto':
            // Cria o card de produto (e-commerce)
            el = criarCardProdutoSite(item);
            // Marca que o conteúdo já foi montado
            conteudoPronto = true;
            break;
        case 'imovel':
            // Cria o card de imóvel (imobiliária)
            el = criarCardImovelSite(item);
            // Marca que o conteúdo já foi montado
            conteudoPronto = true;
            break;
        case 'veiculo':
            // Cria o card de veículo
            el = criarCardVeiculoSite(item);
            // Marca que o conteúdo já foi montado
            conteudoPronto = true;
            break;
        case 'formulario':
            // Cria o formulário de lead
            el = criarFormularioSite(item);
            // Marca que o conteúdo já foi montado
            conteudoPronto = true;
            break;
        default:
            // Para qualquer outro tipo, usa um div genérico
            el = document.createElement('div');
    }

    // Marca o elemento como gerado pelo sistema (para estilização)
    el.setAttribute('data-el', item.id || '');

    // Aplica o conteúdo textual (somente se o card não montou o conteúdo)
    if (!conteudoPronto && item.texto !== undefined) {
        // Define o texto interno do elemento
        el.textContent = item.texto;
    }

    // Aplica a URL da imagem, se for imagem
    if (item.tipo === 'imagem' && item.url) {
        // Define o atributo src da imagem
        el.src = item.url;
        // Define o texto alternativo
        el.alt = item.texto || 'Imagem';
    }

    // Aplica a posição (somente se existir e for posição livre)
    if (pos) {
        // Aplica posicionamento absoluto
        el.style.position = 'absolute';
        // Define a coordenada X
        el.style.left = pos.x + 'px';
        // Define a coordenada Y
        el.style.top = pos.y + 'px';
        // Define a largura
        if (pos.w) el.style.width = pos.w + 'px';
        // Define a altura
        if (pos.h) el.style.height = pos.h + 'px';
    }

    // Obtém os estilos do elemento
    const est = item.estilo || {};

    // Aplica a cor de fundo
    if (est.corFundo) el.style.backgroundColor = est.corFundo;
    // Aplica a cor do texto
    if (est.corTexto) el.style.color = est.corTexto;
    // Aplica o tamanho da fonte
    if (est.tamanhoFonte) el.style.fontSize = est.tamanhoFonte + 'px';
    // Aplica o peso da fonte
    if (est.grossura) el.style.fontWeight = est.grossura;
    // Aplica a fonte da família
    if (est.fonte) el.style.fontFamily = est.fonte;
    // Aplica o alinhamento do texto
    if (est.alinhamento) el.style.textAlign = est.alinhamento;
    // Aplica a rotação
    if (est.rotacao) el.style.transform = 'rotate(' + est.rotacao + 'deg)';
    // Aplica a opacidade
    if (est.opacidade !== undefined) el.style.opacity = est.opacidade;
    // Aplica a borda
    if (est.borda) {
        // Define a espessura da borda
        el.style.border = (est.borda.espessura || 1) + 'px solid ' + (est.borda.cor || '#000');
    }
    // Aplica o raio da borda
    if (est.raioBorda !== undefined) el.style.borderRadius = est.raioBorda + 'px';
    // Aplica a sombra
    if (est.sombra) {
        // Monta a sombra (x, y, blur, cor)
        el.style.boxShadow = (est.sombra.x || 0) + 'px ' + (est.sombra.y || 0) + 'px ' + (est.sombra.blur || 10) + 'px ' + (est.sombra.cor || 'rgba(0,0,0,0.3)');
    }

    // ==========================================================
    // ANIMAÇÕES DE ENTRADA (recurso 4 - DECISÃO 10)
    // Aplica a animação definida no estilo do elemento
    // ==========================================================
    if (est.animacao) {
        // Aplica o CSS da animação ao elemento
        el.style.cssText += cssAnimacao(est.animacao);
    }

    // ==========================================================
    // EFEITO HOVER (recurso 4 - micro-interações)
    // Aplica o hover definido no estilo do elemento
    // ==========================================================
    if (est.hover) {
        // Guarda o estilo original (fundo e cor)
        const fundoOriginal = est.corFundo || '';
        const corOriginal = est.corTexto || '';
        // Define o evento de passar o mouse
        el.addEventListener('mouseenter', () => {
            // Se houver cor de fundo no hover, aplica
            if (est.hover.corFundo) el.style.backgroundColor = est.hover.corFundo;
            // Se houver cor de texto no hover, aplica
            if (est.hover.corTexto) el.style.color = est.hover.corTexto;
            // Se houver sombra no hover, aplica
            if (est.hover.sombra) {
                // Monta a sombra do hover
                el.style.boxShadow = (est.hover.sombra.x || 0) + 'px ' + (est.hover.sombra.y || 0) + 'px ' + (est.hover.sombra.blur || 10) + 'px ' + (est.hover.sombra.cor || 'rgba(0,0,0,0.3)');
            }
        });
        // Define o evento de sair do mouse
        el.addEventListener('mouseleave', () => {
            // Restaura o fundo original
            if (fundoOriginal) el.style.backgroundColor = fundoOriginal;
            // Restaura a cor original
            if (corOriginal) el.style.color = corOriginal;
            // Restaura a sombra original
            if (est.sombra) {
                // Monta a sombra original
                el.style.boxShadow = (est.sombra.x || 0) + 'px ' + (est.sombra.y || 0) + 'px ' + (est.sombra.blur || 10) + 'px ' + (est.sombra.cor || 'rgba(0,0,0,0.3)');
            }
        });
    }

    // Retorna o elemento criado
    return el;
}

// ============================================================
// FUNÇÃO: cria o card de produto (e-commerce) para o site
// Parametros: item (objeto do elemento)
// Retorna: o elemento DOM do card
// ============================================================
function criarCardProdutoSite(item) {
    // Obtém os dados do produto
    const dados = item.dados || {};
    // Cria o container do card
    const card = document.createElement('div');
    // Aplica o estilo base do card
    card.style.cssText = 'background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.1);display:flex;flex-direction:column;';
    // Monta o HTML interno do card
    card.innerHTML = `
        <div style="height:50%;background:#e2e8f0;background-image:url('${dados.imagem || ''}');background-size:cover;background-position:center;"></div>
        <div style="padding:10px;display:flex;flex-direction:column;flex:1;">
            <div style="font-size:14px;font-weight:600;color:#0f172a;">${dados.descricao || 'Produto'}</div>
            <div style="font-size:18px;font-weight:700;color:#38bdf8;margin-top:4px;">${dados.preco || 'R$ 0,00'}</div>
            <button onclick="comprarProduto(this)" data-nome="${dados.descricao || 'Produto'}" data-preco="${dados.preco || ''}" style="margin-top:auto;background:#38bdf8;color:#fff;border:none;border-radius:6px;padding:8px;font-size:12px;cursor:pointer;font-weight:600;">🛒 Comprar</button>
        </div>
    `;
    // Retorna o card
    return card;
}

// ============================================================
// FUNÇÃO: registra uma compra (venda) de um produto do site
// Parametros: botao (elemento clicado)
// Retorna: nenhum (faz POST para a aba Vendas_Clientes)
// ============================================================
async function comprarProduto(botao) {
    // Pede o nome do comprador (cliente final)
    const clienteFinal = prompt('Digite seu nome para finalizar a compra:');
    // Se cancelou ou vazio, sai
    if (!clienteFinal) return;
    // Obtém o id do site da URL
    const idSite = lerParamUrl('id') || 'demo';
    // Busca o site para descobrir o dono (idCliente)
    const resposta = await apiBuscarSite(idSite);
    // Define o id do cliente dono (aceita mock e backend real)
    const idCliente = resposta.sucesso ? (resposta.dados.idCliente || resposta.dados.ID_CLIENTE || '') : '';
    // Monta os dados da venda
    const dadosVenda = {
        // ID do site onde ocorreu a venda
        idSite: idSite,
        // ID do cliente dono do site (recebe o valor - DECISÃO 09)
        idCliente: idCliente,
        // Nome do produto/serviço
        produto: botao.getAttribute('data-nome') || 'Produto',
        // Valor da venda (remove "R$" e converte)
        valor: parseFloat((botao.getAttribute('data-preco') || '0').replace(/[^\d,]/g, '').replace(',', '.')) || 0,
        // Quem comprou (cliente final)
        clienteFinal: clienteFinal,
        // Status do pagamento (pago - simulação de Pix)
        status: 'pago',
        // Data da venda
        data: new Date().toISOString()
    };
    // Chama a API para registrar a venda
    const resultado = await apiRegistrarVenda(dadosVenda);
    // Se registrou com sucesso
    if (resultado.sucesso) {
        // Informa o sucesso
        alert('Compra registrada! O valor será enviado ao dono do site via Pix.');
    } else {
        // Mostra o erro
        alert('Erro ao registrar a compra: ' + resultado.mensagem);
    }
}

// ============================================================
// FUNÇÃO: cria o card de imóvel (imobiliária) para o site
// Parametros: item (objeto do elemento)
// Retorna: o elemento DOM do card
// ============================================================
function criarCardImovelSite(item) {
    // Obtém os dados do imóvel
    const dados = item.dados || {};
    // Cria o container do card
    const card = document.createElement('div');
    // Aplica o estilo base do card
    card.style.cssText = 'background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.1);display:flex;flex-direction:column;';
    // Monta o HTML interno do card
    card.innerHTML = `
        <div style="height:50%;background:#fef3c7;background-image:url('${dados.imagem || ''}');background-size:cover;background-position:center;"></div>
        <div style="padding:10px;">
            <div style="font-size:16px;font-weight:700;color:#0f172a;">${dados.preco || 'R$ 0'}</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px;">${dados.quarte || ''} · ${dados.area || ''}</div>
            <div style="font-size:12px;color:#94a3b8;">📍 ${dados.local || ''}</div>
        </div>
    `;
    // Retorna o card
    return card;
}

// ============================================================
// FUNÇÃO: cria o card de veículo para o site
// Parametros: item (objeto do elemento)
// Retorna: o elemento DOM do card
// ============================================================
function criarCardVeiculoSite(item) {
    // Obtém os dados do veículo
    const dados = item.dados || {};
    // Cria o container do card
    const card = document.createElement('div');
    // Aplica o estilo base do card
    card.style.cssText = 'background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.1);display:flex;flex-direction:column;';
    // Monta o HTML interno do card
    card.innerHTML = `
        <div style="height:50%;background:#dbeafe;background-image:url('${dados.imagem || ''}');background-size:cover;background-position:center;"></div>
        <div style="padding:10px;">
            <div style="font-size:14px;font-weight:600;color:#0f172a;">${dados.nome || 'Veículo'}</div>
            <div style="font-size:12px;color:#64748b;margin-top:2px;">${dados.ano || ''} · ${dados.km || ''}</div>
            <div style="font-size:16px;font-weight:700;color:#38bdf8;margin-top:4px;">${dados.preco || 'R$ 0'}</div>
        </div>
    `;
    // Retorna o card
    return card;
}

// ============================================================
// FUNÇÃO: cria o formulário de lead para o site
// Parametros: item (objeto do elemento)
// Retorna: o elemento DOM do formulário
// ============================================================
function criarFormularioSite(item) {
    // Cria o container do formulário
    const form = document.createElement('div');
    // Aplica o estilo base do formulário
    form.style.cssText = 'background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:6px;';
    // Monta o HTML interno do formulário (com dados-identificadores)
    form.innerHTML = `
        <div style="font-size:12px;font-weight:600;color:#0f172a;">📋 Formulário de contato</div>
        <input id="frmNome" placeholder="Nome" style="border:1px solid #e2e8f0;border-radius:6px;padding:6px;font-size:11px;width:100%;">
        <input id="frmEmail" placeholder="E-mail" style="border:1px solid #e2e8f0;border-radius:6px;padding:6px;font-size:11px;width:100%;">
        <input id="frmTel" placeholder="Telefone/WhatsApp" style="border:1px solid #e2e8f0;border-radius:6px;padding:6px;font-size:11px;width:100%;">
        <button onclick="enviarLead(this)" style="background:#38bdf8;color:#fff;border:none;border-radius:6px;padding:6px;font-size:11px;cursor:pointer;">Enviar</button>
    `;
    // Retorna o formulário
    return form;
}

// ============================================================
// FUNÇÃO: envia os dados do formulário como lead (aba LEADS)
// Parametros: botao (elemento do botão clicado)
// Retorna: nenhum (faz POST para a aba Leads)
// ============================================================
async function enviarLead(botao) {
    // Obtém o formulário (div pai) e os campos pelo id
    const form = botao.parentElement;
    // Pega o nome digitado
    const nome = form.querySelector('#frmNome').value.trim();
    // Pega o e-mail digitado
    const email = form.querySelector('#frmEmail').value.trim();
    // Pega o telefone digitado
    const tel = form.querySelector('#frmTel').value.trim();
    // Se nome ou e-mail estiverem vazios
    if (!nome || !email) {
        // Informa o erro
        alert('Preencha pelo menos nome e e-mail.');
        return;
    }
    // Monta os dados do lead
    const dadosLead = {
        // Nome completo do lead
        nome: nome,
        // E-mail do lead
        email: email,
        // Telefone/WhatsApp do lead
        tel: tel,
        // Produto/serviço de interesse (opcional)
        produtoServico: '',
        // Observações
        descricao: ''
    };
    // Chama a API para registrar o lead
    const resultado = await apiRegistrarLead(dadosLead);
    // Se registrou com sucesso
    if (resultado.sucesso) {
        // Informa o sucesso
        alert('Obrigado! Seu contato foi enviado com sucesso.');
        // Limpa os campos
        form.querySelector('#frmNome').value = '';
        form.querySelector('#frmEmail').value = '';
        form.querySelector('#frmTel').value = '';
    } else {
        // Mostra o erro
        alert('Erro ao enviar: ' + resultado.mensagem);
    }
}

// ============================================================
// FUNÇÃO: retorna o CSS de animação correspondente
// Parametros: tipoAnimacao (string)
// Retorna: string com a animação CSS
// ============================================================
function cssAnimacao(tipoAnimacao) {
    // Mapa de animações (mesmo do recursos-avancados.js)
    const mapa = {
        'fade': 'animation:animFade 0.8s ease both;',
        'slide': 'animation:animSlide 0.8s ease both;',
        'zoom': 'animation:animZoom 0.8s ease both;',
        'slideLeft': 'animation:animSlideLeft 0.8s ease both;'
    };
    // Retorna a animação ou vazio
    return mapa[tipoAnimacao] || '';
}

// ============================================================
// FUNÇÃO: gera o menu de navegação a partir das páginas
// Parametros: nenhum (usa estadoRenderizacao)
// Retorna: HTML do menu de navegação
// ============================================================
function gerarMenuNavegacaoRender() {
    // Obtém as páginas do estado de renderização
    const paginas = estadoRenderizacao.paginas || [];
    // Se não houver páginas ou houver apenas uma, não mostra menu
    if (paginas.length <= 1) return '';
    // Inicia o HTML do menu
    let html = '<nav class="site-menu"><div class="site-menu-logo">' + escapeHtml(estadoRenderizacao.nome || 'Meu Site') + '</div><div class="site-menu-links">';
    // Percorre as páginas
    paginas.forEach((pagina, idx) => {
        // Define a classe do link (ativo se for a página atual)
        const classeAtiva = idx === estadoRenderizacao.paginaAtual ? ' site-menu-link-ativo' : '';
        // Cria o link da página
        html += '<a href="#" class="site-menu-link' + classeAtiva + '" data-pagina="' + idx + '" onclick="navegarPaginaSiteRender(' + idx + '); return false;">' + escapeHtml(pagina.nome) + '</a>';
    });
    // Fecha o HTML do menu
    html += '</div></nav>';
    // Retorna o menu
    return html;
}

// ============================================================
// FUNÇÃO: navega entre páginas no site publicado/preview
// Parametros: idx (índice da página)
// Retorna: nenhum (re-renderiza o container)
// ============================================================
function navegarPaginaSiteRender(idx) {
    // Obtém as páginas do estado
    const paginas = estadoRenderizacao.paginas || [];
    // Se o índice for inválido, sai
    if (idx < 0 || idx >= paginas.length) return;
    // Atualiza a página ativa
    estadoRenderizacao.paginaAtual = idx;
    // Obtém o container do site
    const container = document.getElementById('container-site');
    // Se não houver container, sai
    if (!container) return;
    // Re-renderiza o site com a nova página
    renderizarSiteCompleto(container, estadoRenderizacao, 'desktop');
}

// ============================================================
// FUNÇÃO: aplica o tema global ao container do site
// Parametros: container (elemento DOM) e temaCores (objeto)
// Retorna: nenhum (aplica estilos no container)
// ============================================================
function aplicarTemaGlobalRender(container, temaCores) {
    // Se não houver tema, usa padrão
    const tema = temaCores || {};
    // Aplica a cor de fundo do tema (se definida)
    if (tema.corFundo) container.style.backgroundColor = tema.corFundo;
    // Aplica a cor do texto do tema (se definida)
    if (tema.corTexto) container.style.color = tema.corTexto;
    // Aplica a fonte do tema (se definida)
    if (tema.fonte) container.style.fontFamily = tema.fonte;
    // Aplica as variáveis CSS do tema
    if (tema.corPrimaria) container.style.setProperty('--tema-primaria', tema.corPrimaria);
    if (tema.corFundo) container.style.setProperty('--tema-fundo', tema.corFundo);
    if (tema.corTexto) container.style.setProperty('--tema-texto', tema.corTexto);
    if (tema.fonte) container.style.setProperty('--tema-fonte', tema.fonte);
}

// ============================================================
// FUNÇÃO: renderiza o site completo (com páginas, menu e tema)
// Parametros: container (elemento DOM), estrutura (objeto) e device
// Retorna: nenhum (preenche o container)
// ============================================================
function renderizarSiteCompleto(container, estrutura, device) {
    // Define o dispositivo padrão
    const d = device || 'desktop';
    // Guarda a estrutura no estado de renderização
    estadoRenderizacao = {
        // Páginas do site
        paginas: estrutura.paginas || [],
        // Página ativa
        paginaAtual: estrutura.paginaAtual || 0,
        // Nome do site
        nome: estrutura.nome || 'Meu Site',
        // Tema de cores
        temaCores: estrutura.temaCores || {}
    };
    // Limpa o conteúdo do container
    container.innerHTML = '';
    // Aplica o tema global ao container
    aplicarTemaGlobalRender(container, estadoRenderizacao.temaCores);
    // Gera o menu de navegação (se houver mais de uma página)
    const menu = gerarMenuNavegacaoRender();
    // Se houver menu, adiciona ao container
    if (menu) {
        // Cria um elemento temporário para o menu
        const divMenu = document.createElement('div');
        // Define o HTML do menu
        divMenu.innerHTML = menu;
        // Adiciona o menu ao container
        container.appendChild(divMenu.firstElementChild);
    }
    // Obtém os elementos da página ativa
    const paginas = estadoRenderizacao.paginas;
    // Define os elementos da página atual (ou lista vazia)
    const elementos = (paginas[estadoRenderizacao.paginaAtual] && paginas[estadoRenderizacao.paginaAtual].elementos) || [];
    // Percorre cada elemento da página
    elementos.forEach(item => {
        // Cria o elemento HTML correspondente
        const el = criarElementoDoSite(item, d);
        // Adiciona o elemento ao container
        container.appendChild(el);
    });
}

// ============================================================
// FUNÇÃO: renderiza a lista de elementos do site no container
// (mantida para compatibilidade - aceita array simples ou objeto)
// Parametros: container (elemento DOM) e elementos (array/objeto JSON)
// Retorna: nenhum (preenche o container)
// ============================================================
function renderizarSite(container, elementos, device) {
    // Se for um objeto com "paginas" (formato múltiplas páginas)
    if (elementos && !Array.isArray(elementos) && elementos.paginas) {
        // Renderiza o site completo com páginas
        renderizarSiteCompleto(container, elementos, device);
        return;
    }
    // Se for um array simples (formato antigo), monta uma estrutura de 1 página
    const estrutura = {
        // Uma única página com os elementos
        paginas: [{ id: 'pag_1', nome: 'Home', elementos: elementos || [] }],
        // Página ativa
        paginaAtual: 0,
        // Nome padrão
        nome: 'Meu Site',
        // Sem tema
        temaCores: {}
    };
    // Renderiza o site completo
    renderizarSiteCompleto(container, estrutura, device);
}

// ============================================================
// FUNÇÃO: escapa caracteres HTML (para o menu de navegação)
// Parametros: texto (string)
// Retorna: texto escapado
// ============================================================
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
