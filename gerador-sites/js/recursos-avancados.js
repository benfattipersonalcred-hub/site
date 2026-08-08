// ============================================================
// ARQUIVO: js/recursos-avancados.js
// DESCRIÇÃO: Recursos Avançados do Editor Visual (DECISÃO 10).
//           Implementa as 8 funcionalidades aprovadas:
//           1. Componentes/Blocos compostos
//           2. Páginas múltiplas + navegação automática
//           3. Sistema de temas/cores globais
//           4. Animações e micro-interações
//           5. E-commerce completo (carrinho, checkout, Pix)
//           6. Editor responsivo inteligente
//           7. SEO visual
//           8. Rascunho/Publicado
// ============================================================

// ============================================================
// 1. COMPONENTES / BLOCOS COMPOSTOS
// ============================================================

// Lista de blocos compostos prontos (combinam vários elementos)
// Cada bloco é uma função que retorna um array de elementos
const BLOCO_COMPOSTOS = [
    {
        // Bloco de Hero (imagem de fundo + título + botão + seta)
        tipo: 'hero',
        rotulo: 'Hero completo',
        icone: '🦸',
        descricao: 'Título, subtítulo, botão e CTA'
    },
    {
        // Bloco de seção de destaques
        tipo: 'destaques',
        rotulo: 'Seção de Destaques',
        icone: '⭐',
        descricao: 'Título + 3 cards'
    },
    {
        // Bloco de galeria de imagens
        tipo: 'galeria',
        rotulo: 'Galeria',
        icone: '🖼️',
        descricao: 'Grade de imagens'
    },
    {
        // Bloco de depoimentos
        tipo: 'depoimentos',
        rotulo: 'Depoimentos',
        icone: '💬',
        descricao: 'Avaliações de clientes'
    },
    {
        // Bloco de FAQ (acordeão)
        tipo: 'faq',
        rotulo: 'FAQ',
        icone: '❓',
        descricao: 'Perguntas frequentes'
    },
    {
        // Bloco de rodapé completo
        tipo: 'rodape',
        rotulo: 'Rodapé completo',
        icone: '🦶',
        descricao: 'Links, contato e social'
    },
    {
        // Bloco de card de produto
        tipo: 'card_produto',
        rotulo: 'Card de produto',
        icone: '🛍️',
        descricao: 'Produto com preço e botão'
    },
    {
        // Bloco de card de imóvel
        tipo: 'card_imovel',
        rotulo: 'Card de imóvel',
        icone: '🏠',
        descricao: 'Imóvel com foto e preço'
    },
    {
        // Bloco de card de veículo
        tipo: 'card_veiculo',
        rotulo: 'Card de veículo',
        icone: '🚗',
        descricao: 'Veículo com foto e preço'
    }
];

// Retorna os elementos de um bloco composto
// Parametros: tipo (string) e device (dispositivo)
// Retorna: array de elementos
function obterBlocoComposto(tipo, device) {
    // Usa desktop como padrão
    const d = device || 'desktop';
    // Controla os blocos por tipo
    switch (tipo) {
        case 'hero':
            // Bloco Hero completo
            return [
                // Container de fundo (caixa)
                { tipo: 'container', id: gerarId('el'), texto: '', pos: { [d]: { x: 0, y: 0, w: 1200, h: 400 } }, estilo: { corFundo: 'rgba(56,189,248,0.1)', raioBorda: 0 } },
                // Título principal
                { tipo: 'titulo', id: gerarId('el'), texto: 'Sua marca aqui', pos: { [d]: { x: 350, y: 80, w: 500, h: 60 } }, estilo: { corTexto: '#0f172a', tamanhoFonte: 44, grossura: '800', alinhamento: 'center' } },
                // Subtítulo
                { tipo: 'paragrafo', id: gerarId('el'), texto: 'A melhor solução para o seu negócio', pos: { [d]: { x: 400, y: 160, w: 400, h: 40 } }, estilo: { corTexto: '#475569', tamanhoFonte: 18, alinhamento: 'center' } },
                // Botão principal
                { tipo: 'botao', id: gerarId('el'), texto: 'Saiba mais', pos: { [d]: { x: 520, y: 240, w: 160, h: 50 } }, estilo: { corFundo: '#38bdf8', corTexto: '#ffffff', raioBorda: 25, tamanhoFonte: 16, grossura: '600' } }
            ];
        case 'destaques':
            // Bloco de sessão de destaques
            return [
                // Título da seção
                { tipo: 'titulo', id: gerarId('el'), texto: 'Nossos Destaques', pos: { [d]: { x: 450, y: 20, w: 300, h: 50 } }, estilo: { corTexto: '#0f172a', tamanhoFonte: 32, grossura: '700', alinhamento: 'center' } },
                // Card destaque 1
                { tipo: 'container', id: gerarId('el'), texto: 'Recurso 1', pos: { [d]: { x: 100, y: 100, w: 250, h: 150 } }, estilo: { corFundo: '#f8fafc', borda: { espessura: 1, cor: '#e2e8f0' }, raioBorda: 12 } },
                // Card destaque 2
                { tipo: 'container', id: gerarId('el'), texto: 'Recurso 2', pos: { [d]: { x: 475, y: 100, w: 250, h: 150 } }, estilo: { corFundo: '#f8fafc', borda: { espessura: 1, cor: '#e2e8f0' }, raioBorda: 12 } },
                // Card destaque 3
                { tipo: 'container', id: gerarId('el'), texto: 'Recurso 3', pos: { [d]: { x: 850, y: 100, w: 250, h: 150 } }, estilo: { corFundo: '#f8fafc', borda: { espessura: 1, cor: '#e2e8f0' }, raioBorda: 12 } }
            ];
        case 'galeria':
            // Bloco de galeria de imagens
            return [
                // Imagem 1
                { tipo: 'imagem', id: gerarId('el'), url: 'https://placehold.co/300x250/8b5cf6/ffffff?text=Img+1', texto: '1', pos: { [d]: { x: 100, y: 50, w: 300, h: 250 } }, estilo: { raioBorda: 12 } },
                // Imagem 2
                { tipo: 'imagem', id: gerarId('el'), url: 'https://placehold.co/300x250/6366f1/ffffff?text=Img+2', texto: '2', pos: { [d]: { x: 450, y: 50, w: 300, h: 250 } }, estilo: { raioBorda: 12 } },
                // Imagem 3
                { tipo: 'imagem', id: gerarId('el'), url: 'https://placehold.co/300x250/38bdf8/ffffff?text=Img+3', texto: '3', pos: { [d]: { x: 800, y: 50, w: 300, h: 250 } }, estilo: { raioBorda: 12 } }
            ];
        case 'depoimentos':
            // Bloco de depoimentos
            return [
                // Título
                { tipo: 'titulo', id: gerarId('el'), texto: 'O que dizem nossos clientes', pos: { [d]: { x: 350, y: 20, w: 500, h: 50 } }, estilo: { corTexto: '#0f172a', tamanhoFonte: 30, grossura: '700', alinhamento: 'center' } },
                // Depoimento 1
                { tipo: 'paragrafo', id: gerarId('el'), texto: '"Excelente serviço, recomendo!" - Maria', pos: { [d]: { x: 100, y: 100, w: 300, h: 80 } }, estilo: { corTexto: '#475569', tamanhoFonte: 16, alinhamento: 'center' } },
                // Depoimento 2
                { tipo: 'paragrafo', id: gerarId('el'), texto: '"Transformou meu negócio!" - João', pos: { [d]: { x: 450, y: 100, w: 300, h: 80 } }, estilo: { corTexto: '#475569', tamanhoFonte: 16, alinhamento: 'center' } },
                // Depoimento 3
                { tipo: 'paragrafo', id: gerarId('el'), texto: '"Simples e poderoso." - Ana', pos: { [d]: { x: 800, y: 100, w: 300, h: 80 } }, estilo: { corTexto: '#475569', tamanhoFonte: 16, alinhamento: 'center' } }
            ];
        case 'faq':
            // Bloco de FAQ
            return [
                // Título
                { tipo: 'titulo', id: gerarId('el'), texto: 'Perguntas Frequentes', pos: { [d]: { x: 400, y: 20, w: 400, h: 50 } }, estilo: { corTexto: '#0f172a', tamanhoFonte: 30, grossura: '700', alinhamento: 'center' } },
                // Pergunta 1
                { tipo: 'container', id: gerarId('el'), texto: '❓ Como funciona?', pos: { [d]: { x: 300, y: 100, w: 600, h: 60 } }, estilo: { corFundo: '#f8fafc', borda: { espessura: 1, cor: '#e2e8f0' }, raioBorda: 10 } },
                // Pergunta 2
                { tipo: 'container', id: gerarId('el'), texto: '❓ Quanto custa?', pos: { [d]: { x: 300, y: 180, w: 600, h: 60 } }, estilo: { corFundo: '#f8fafc', borda: { espessura: 1, cor: '#e2e8f0' }, raioBorda: 10 } },
                // Pergunta 3
                { tipo: 'container', id: gerarId('el'), texto: '❓ Suporte incluído?', pos: { [d]: { x: 300, y: 260, w: 600, h: 60 } }, estilo: { corFundo: '#f8fafc', borda: { espessura: 1, cor: '#e2e8f0' }, raioBorda: 10 } }
            ];
        case 'rodape':
            // Bloco de rodapé completo
            return [
                // Container do rodapé
                { tipo: 'container', id: gerarId('el'), texto: '', pos: { [d]: { x: 0, y: 0, w: 1200, h: 150 } }, estilo: { corFundo: '#0f172a', raioBorda: 0 } },
                // Texto de copyright
                { tipo: 'paragrafo', id: gerarId('el'), texto: '© 2024 Sua Empresa. Todos os direitos reservados.', pos: { [d]: { x: 350, y: 40, w: 500, h: 30 } }, estilo: { corTexto: '#94a3b8', tamanhoFonte: 14, alinhamento: 'center' } },
                // Texto de contato
                { tipo: 'paragrafo', id: gerarId('el'), texto: 'contato@empresa.com | (00) 0000-0000', pos: { [d]: { x: 400, y: 80, w: 400, h: 30 } }, estilo: { corTexto: '#64748b', tamanhoFonte: 14, alinhamento: 'center' } }
            ];
        case 'card_produto':
            // Bloco de card de produto
            return [
                // Card de produto
                { tipo: 'produto', id: gerarId('el'), texto: 'Produto', pos: { [d]: { x: 100, y: 50, w: 250, h: 320 } }, estilo: { corFundo: '#ffffff', raioBorda: 10, sombra: { x: 0, y: 4, blur: 15, cor: 'rgba(0,0,0,0.1)' } }, dados: { imagem: 'https://placehold.co/250x180/e2e8f0/64748b?text=Produto', preco: 'R$ 99,90', descricao: 'Produto incrível' } }
            ];
        case 'card_imovel':
            // Bloco de card de imóvel
            return [
                // Card de imóvel
                { tipo: 'imovel', id: gerarId('el'), texto: 'Imóvel', pos: { [d]: { x: 100, y: 50, w: 260, h: 340 } }, estilo: { corFundo: '#ffffff', raioBorda: 10, sombra: { x: 0, y: 4, blur: 15, cor: 'rgba(0,0,0,0.1)' } }, dados: { imagem: 'https://placehold.co/260x180/fef3c7/92400e?text=Im%C3%B3vel', preco: 'R$ 450.000', quarte: '3 quartos', area: '120 m²', local: 'Centro' } }
            ];
        case 'card_veiculo':
            // Bloco de card de veículo
            return [
                // Card de veículo
                { tipo: 'veiculo', id: gerarId('el'), texto: 'Veículo', pos: { [d]: { x: 100, y: 50, w: 260, h: 300 } }, estilo: { corFundo: '#ffffff', raioBorda: 10, sombra: { x: 0, y: 4, blur: 15, cor: 'rgba(0,0,0,0.1)' } }, dados: { imagem: 'https://placehold.co/260x160/dbeafe/1e40af?text=Carro', nome: 'Modelo', ano: 2024, km: '0 km', preco: 'R$ 120.000' } }
            ];
        default:
            // Bloco vazio
            return [];
    }
}

// ============================================================
// 2. PÁGINAS MÚLTIPLAS + NAVEGAÇÃO AUTOMÁTICA
// ============================================================

// Sincroniza estadoEditor.elementos com a página atual
// (mantém compatibilidade com o editor.js)
function sincronizarPaginaAtual() {
    // Se houver páginas e a página atual existir
    if (estadoEditor.paginas && estadoEditor.paginas[estadoEditor.paginaAtual]) {
        // Copia os elementos da página atual para estadoEditor.elementos
        estadoEditor.paginas[estadoEditor.paginaAtual].elementos = estadoEditor.elementos;
    }
}

// Atualiza o seletor de páginas na barra superior
function atualizarSeletorPaginas() {
    // Seleciona o seletor
    const seletor = document.getElementById('seletorPaginas');
    // Se não existir, sai
    if (!seletor) return;
    // Limpa o seletor
    seletor.innerHTML = '';
    // Percorre as páginas
    estadoEditor.paginas.forEach((pagina, idx) => {
        // Cria a opção
        const opcao = document.createElement('option');
        // Define o valor (índice da página)
        opcao.value = idx.toString();
        // Define o texto
        opcao.textContent = pagina.nome;
        // Marca a página atual como selecionada
        if (idx === estadoEditor.paginaAtual) opcao.selected = true;
        // Adiciona a opção ao seletor
        seletor.appendChild(opcao);
    });
}

// Troca a página ativa no editor
// Parametros: idx (índice da página)
function trocarPaginaEditor(idx) {
    // Converte para número
    const indice = parseInt(idx, 10);
    // Se o índice for inválido, sai
    if (isNaN(indice) || indice < 0 || indice >= estadoEditor.paginas.length) return;
    // Salva os elementos atuais na página atual
    sincronizarPaginaAtual();
    // Atualiza o índice da página atual
    estadoEditor.paginaAtual = indice;
    // Carrega os elementos da nova página
    estadoEditor.elementos = estadoEditor.paginas[indice].elementos || [];
    // Limpa a seleção
    estadoEditor.selecionado = null;
    // Renderiza o canvas
    renderizarCanvas();
    // Atualiza as camadas
    atualizarCamadas();
    // Limpa o painel de propriedades
    montarPainelPropriedades(null);
    // Atualiza o seletor
    atualizarSeletorPaginas();
}

// Abre o modal de gestão de páginas
function abrirGestaoPaginas() {
    // Sincroniza a página atual
    sincronizarPaginaAtual();
    // Renderiza a lista de páginas no modal
    renderizarListaPaginas();
    // Abre o modal
    document.getElementById('modalPaginas').classList.add('visivel');
}

// Adiciona uma nova página
function adicionarPagina() {
    // Obtém o nome da nova página
    const nome = document.getElementById('novaPaginaNome').value.trim();
    // Se estiver vazio, usa um nome padrão
    const nomePagina = nome || ('Página ' + (estadoEditor.paginas.length + 1));
    // Adiciona a nova página
    estadoEditor.paginas.push({ id: 'pag_' + gerarIdCurto(), nome: nomePagina, elementos: [] });
    // Limpa o campo
    document.getElementById('novaPaginaNome').value = '';
    // Atualiza o seletor
    atualizarSeletorPaginas();
    // Renderiza a lista
    renderizarListaPaginas();
    // Informa o sucesso
    mostrarToast('Página "' + nomePagina + '" adicionada!', 'sucesso');
}

// Renomeia uma página
// Parametros: idx (índice) e nome (novo nome)
function renomearPagina(idx, nome) {
    // Se o nome estiver vazio, sai
    if (!nome.trim()) return;
    // Renomeia a página
    estadoEditor.paginas[idx].nome = nome.trim();
    // Atualiza o seletor
    atualizarSeletorPaginas();
    // Renderiza a lista
    renderizarListaPaginas();
}

// Duplica uma página
// Parametros: idx (índice)
function duplicarPagina(idx) {
    // Faz uma cópia profunda da página
    const copia = JSON.parse(JSON.stringify(estadoEditor.paginas[idx]));
    // Gera um novo id
    copia.id = 'pag_' + gerarIdCurto();
    // Adiciona "(cópia)" ao nome
    copia.nome = copia.nome + ' (cópia)';
    // Gera novos ids para os elementos (evita conflito)
    if (copia.elementos) {
        // Percorre os elementos
        copia.elementos.forEach(el => {
            // Gera um novo id para cada elemento
            el.id = gerarId('el');
        });
    }
    // Insere a cópia após a página original
    estadoEditor.paginas.splice(idx + 1, 0, copia);
    // Atualiza o seletor
    atualizarSeletorPaginas();
    // Renderiza a lista
    renderizarListaPaginas();
    // Informa o sucesso
    mostrarToast('Página duplicada!', 'sucesso');
}

// Define uma página como inicial (move para o início)
// Parametros: idx (índice)
function definirPaginaInicial(idx) {
    // Se já for a primeira, sai
    if (idx === 0) return;
    // Remove a página da posição atual
    const pagina = estadoEditor.paginas.splice(idx, 1)[0];
    // Adiciona no início
    estadoEditor.paginas.unshift(pagina);
    // Atualiza o índice da página atual se necessário
    if (estadoEditor.paginaAtual === idx) {
        // A página atual agora está no índice 0
        estadoEditor.paginaAtual = 0;
    } else if (estadoEditor.paginaAtual < idx) {
        // A página atual não mudou de posição relativa
    } else {
        // A página atual foi deslocada para frente
        estadoEditor.paginaAtual++;
    }
    // Atualiza o seletor
    atualizarSeletorPaginas();
    // Renderiza a lista
    renderizarListaPaginas();
    // Informa o sucesso
    mostrarToast('Página inicial definida!', 'sucesso');
}

// Exclui uma página
// Parametros: idx (índice)
function excluirPagina(idx) {
    // Se for a única página, bloqueia
    if (estadoEditor.paginas.length <= 1) {
        mostrarToast('Não é possível excluir a única página', 'erro');
        return;
    }
    // Confirma a exclusão
    if (!confirm('Excluir a página "' + estadoEditor.paginas[idx].nome + '"?')) return;
    // Remove a página
    estadoEditor.paginas.splice(idx, 1);
    // Ajusta o índice da página atual
    if (estadoEditor.paginaAtual >= estadoEditor.paginas.length) {
        // Se a página atual era a última, volta para a última restante
        estadoEditor.paginaAtual = estadoEditor.paginas.length - 1;
    } else if (estadoEditor.paginaAtual > idx) {
        // Se a página atual era depois da excluída, decrementa
        estadoEditor.paginaAtual--;
    }
    // Carrega os elementos da página atual
    estadoEditor.elementos = estadoEditor.paginas[estadoEditor.paginaAtual].elementos || [];
    // Limpa a seleção
    estadoEditor.selecionado = null;
    // Renderiza o canvas
    renderizarCanvas();
    // Atualiza o seletor
    atualizarSeletorPaginas();
    // Renderiza a lista
    renderizarListaPaginas();
    // Informa o sucesso
    mostrarToast('Página excluída!', 'sucesso');
}

// Renderiza a lista de páginas no modal de gestão
function renderizarListaPaginas() {
    // Seleciona o container da lista
    const container = document.getElementById('listaPaginasModal');
    // Se não existir, sai
    if (!container) return;
    // Limpa o container
    container.innerHTML = '';
    // Percorre as páginas
    estadoEditor.paginas.forEach((pagina, idx) => {
        // Cria o item da página
        const item = document.createElement('div');
        // Define a classe do item
        item.className = 'item-pagina';
        // Marca a página atual
        if (idx === estadoEditor.paginaAtual) item.classList.add('ativo');
        // Monta o conteúdo do item
        item.innerHTML = `
            <input class="input input-pagina" value="${escapeHtml(pagina.nome)}" onchange="renomearPagina(${idx}, this.value)">
            <div class="acoes-pagina">
                <button class="btn btn-outline btn-mini" onclick="duplicarPagina(${idx})" title="Duplicar">⧉</button>
                <button class="btn btn-outline btn-mini" onclick="definirPaginaInicial(${idx})" title="Definir como inicial">🏠</button>
                <button class="btn btn-outline btn-mini" style="color:#f87171;" onclick="excluirPagina(${idx})" title="Excluir">🗑</button>
            </div>
        `;
        // Adiciona o item ao container
        container.appendChild(item);
    });
    // Se não houver páginas (não deve ocorrer)
    if (estadoEditor.paginas.length === 0) {
        // Mostra mensagem
        container.innerHTML = '<p style="color:#64748b;">Nenhuma página.</p>';
    }
}

// Gera o menu de navegação a partir das páginas (para renderização)
// Retorna: HTML do menu de navegação
function gerarMenuNavegacao() {
    // Se não houver páginas, retorna vazio
    if (!estadoEditor.paginas || estadoEditor.paginas.length <= 1) return '';
    // Inicia o HTML do menu
    let html = '<nav class="site-menu"><div class="site-menu-logo">' + escapeHtml(estadoEditor.nome || 'Meu Site') + '</div><div class="site-menu-links">';
    // Percorre as páginas
    estadoEditor.paginas.forEach((pagina, idx) => {
        // Cria o link da página
        html += '<a href="#" class="site-menu-link" data-pagina="' + idx + '" onclick="navegarPaginaSite(' + idx + '); return false;">' + escapeHtml(pagina.nome) + '</a>';
    });
    // Fecha o HTML do menu
    html += '</div></nav>';
    // Retorna o menu
    return html;
}

// Navega entre páginas no site renderizado (preview)
// Parametros: idx (índice da página)
function navegarPaginaSite(idx) {
    // Salva os elementos atuais
    sincronizarPaginaAtual();
    // Atualiza a página atual
    estadoEditor.paginaAtual = idx;
    // Carrega os elementos da página
    estadoEditor.elementos = estadoEditor.paginas[idx].elementos || [];
    // Atualiza o preview
    abrirPreview();
}

// ============================================================
// 3. SISTEMA DE TEMAS / CORES GLOBAIS
// ============================================================

// Abre o modal de tema global
function abrirTemaGlobal() {
    // Obtém o tema atual
    const tema = estadoEditor.temaCores || {};
    // Preenche o campo de cor primária
    document.getElementById('temaCorPrimaria').value = tema.corPrimaria || '#38bdf8';
    // Preenche o campo de cor de fundo
    document.getElementById('temaCorFundo').value = tema.corFundo || '#ffffff';
    // Preenche o campo de cor de texto
    document.getElementById('temaCorTexto').value = tema.corTexto || '#0f172a';
    // Preenche o campo de fonte
    document.getElementById('temaFonte').value = tema.fonte || 'Segoe UI';
    // Abre o modal
    document.getElementById('modalTema').classList.add('visivel');
}

// Atualiza o tema global em tempo real (preview dos inputs)
function atualizarTemaGlobal() {
    // Aplica o tema ao canvas (visualização)
    aplicarTemaGlobalVisual();
}

// Aplica o tema global ao canvas (visualização)
function aplicarTemaGlobalVisual() {
    // Obtém os valores dos inputs
    const corPrimaria = document.getElementById('temaCorPrimaria').value;
    const corFundo = document.getElementById('temaCorFundo').value;
    const corTexto = document.getElementById('temaCorTexto').value;
    const fonte = document.getElementById('temaFonte').value;
    // Seleciona o canvas
    const tela = document.getElementById('telaCanvas');
    // Aplica o fundo do canvas
    tela.style.backgroundColor = corFundo;
    // Aplica a fonte padrão
    tela.style.fontFamily = fonte;
    // Aplica a cor do texto padrão
    tela.style.color = corTexto;
    // Aplica as variáveis de tema
    tela.style.setProperty('--tema-primaria', corPrimaria);
    tela.style.setProperty('--tema-fundo', corFundo);
    tela.style.setProperty('--tema-texto', corTexto);
    tela.style.setProperty('--tema-fonte', fonte);
}

// Aplica o tema global aos elementos do site
function aplicarTemaGlobal() {
    // Obtém os valores dos inputs
    const corPrimaria = document.getElementById('temaCorPrimaria').value;
    const corFundo = document.getElementById('temaCorFundo').value;
    const corTexto = document.getElementById('temaCorTexto').value;
    const fonte = document.getElementById('temaFonte').value;
    // Guarda o tema no estado
    estadoEditor.temaCores = {
        corPrimaria: corPrimaria,
        corFundo: corFundo,
        corTexto: corTexto,
        fonte: fonte
    };
    // Aplica o tema aos elementos (se não tiverem sobrescrita)
    estadoEditor.elementos.forEach(el => {
        // Garante o objeto estilo
        if (!el.estilo) el.estilo = {};
        // Se o elemento não tiver cor de texto definida, aplica a global
        if (!el.estilo.corTexto) el.estilo.corTexto = corTexto;
        // Se o elemento não tiver cor de fundo definida, aplica a global
        if (!el.estilo.corFundo && el.tipo === 'container') el.estilo.corFundo = 'rgba(0,0,0,0.02)';
        // Se o elemento não tiver fonte definida, aplica a global
        if (!el.estilo.fonte) el.estilo.fonte = fonte;
    });
    // Renderiza o canvas
    renderizarCanvas();
    // Aplica o tema visual
    aplicarTemaGlobalVisual();
    // Fecha o modal
    fecharModal('modalTema');
    // Informa o sucesso
    mostrarToast('Tema global aplicado!', 'sucesso');
}

// ============================================================
// 4. ANIMAÇÕES E MICRO-INTERAÇÕES
// ============================================================

// Aplica animação de entrada a um elemento no canvas
// Parametros: id (id do elemento)
function aplicarAnimacaoElemento(id, tipoAnimacao) {
    // Encontra o elemento
    const el = estadoEditor.elementos.find(e => e.id === id);
    // Se não achar, sai
    if (!el) return;
    // Garante o objeto estilo
    if (!el.estilo) el.estilo = {};
    // Define a animação
    el.estilo.animacao = tipoAnimacao;
    // Renderiza o canvas
    renderizarCanvas();
}

// Aplica efeito hover a um elemento
// Parametros: id (id do elemento) e cor (cor do hover)
function aplicarHoverElemento(id, cor) {
    // Encontra o elemento
    const el = estadoEditor.elementos.find(e => e.id === id);
    // Se não achar, sai
    if (!el) return;
    // Garante o objeto estilo
    if (!el.estilo) el.estilo = {};
    // Garante o objeto hover
    if (!el.estilo.hover) el.estilo.hover = {};
    // Define a cor do hover (fundo)
    el.estilo.hover.corFundo = cor;
    // Renderiza o canvas
    renderizarCanvas();
}

// Retorna o CSS de animação correspondente
// Parametros: tipoAnimacao (string)
// Retorna: string com a animação CSS
function cssAnimacao(tipoAnimacao) {
    // Mapa de animações
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
// 5. E-COMMERCE COMPLETO (carrinho, checkout, Pix)
// ============================================================

// Carrinho de compras (armazenado em memória)
let carrinhoCompras = [];

// Adiciona um produto ao carrinho
// Parametros: dados (objeto do produto) e quantidade
function adicionarAoCarrinho(dados, quantidade) {
    // Define a quantidade padrão
    const qtd = quantidade || 1;
    // Busca se o produto já está no carrinho
    const existente = carrinhoCompras.find(p => p.nome === dados.descricao);
    // Se já existir, aumenta a quantidade
    if (existente) {
        // Incrementa a quantidade
        existente.quantidade += qtd;
    } else {
        // Adiciona o produto ao carrinho
        carrinhoCompras.push({
            // Nome do produto
            nome: dados.descricao || 'Produto',
            // Preço do produto
            preco: dados.preco || 'R$ 0',
            // Quantidade
            quantidade: qtd,
            // Imagem do produto
            imagem: dados.imagem || ''
        });
    }
    // Abre o carrinho
    abrirCarrinho();
    // Informa o sucesso
    mostrarToast('Produto adicionado ao carrinho!', 'sucesso');
}

// Abre o modal do carrinho
function abrirCarrinho() {
    // Renderiza o carrinho
    renderizarCarrinho();
    // Abre o modal
    document.getElementById('modalCarrinho').classList.add('visivel');
}

// Fecha o carrinho
function fecharCarrinho() {
    // Fecha o modal
    fecharModal('modalCarrinho');
}

// Renderiza o conteúdo do carrinho
function renderizarCarrinho() {
    // Seleciona o container do carrinho
    const conteudo = document.getElementById('conteudoCarrinho');
    // Se o carrinho estiver vazio
    if (carrinhoCompras.length === 0) {
        // Mostra mensagem de vazio
        conteudo.innerHTML = '<p style="color:var(--cor-texto-cinza);text-align:center;padding:20px;">Seu carrinho está vazio.</p>';
        return;
    }
    // Inicia o HTML do carrinho
    let html = '';
    // Variável para o total
    let total = 0;
    // Percorre os itens do carrinho
    carrinhoCompras.forEach((item, idx) => {
        // Converte o preço para número
        const precoNum = parseFloat((item.preco || '0').replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        // Calcula o subtotal do item
        const subtotal = precoNum * item.quantidade;
        // Soma ao total
        total += subtotal;
        // Monta o item do carrinho
        html += `
            <div class="item-carrinho">
                <div style="flex:1;">
                    <strong>${escapeHtml(item.nome)}</strong><br>
                    <small>${escapeHtml(item.preco)} × ${item.quantidade}</small>
                </div>
                <button class="btn btn-outline btn-mini" onclick="removerDoCarrinho(${idx})">✕</button>
            </div>
        `;
    });
    // Monta o total
    html += `<div class="carrinho-total"><strong>Total: ${formatarMoeda(total)}</strong></div>`;
    // Insere o HTML
    conteudo.innerHTML = html;
}

// Remove um item do carrinho
// Parametros: idx (índice)
function removerDoCarrinho(idx) {
    // Remove o item do carrinho
    carrinhoCompras.splice(idx, 1);
    // Renderiza o carrinho
    renderizarCarrinho();
}

// Finaliza a compra (simulação de Pix)
async function finalizarCompra() {
    // Se o carrinho estiver vazio, avisa
    if (carrinhoCompras.length === 0) {
        mostrarToast('Seu carrinho está vazio', 'erro');
        return;
    }
    // Pede o nome do cliente final
    const clienteFinal = prompt('Digite seu nome para finalizar a compra:');
    // Se cancelou, sai
    if (!clienteFinal) return;
    // Obtém o id do site da URL
    const idSite = lerParamUrl('id') || 'demo';
    // Busca o site para descobrir o dono
    const resposta = await apiBuscarSite(idSite);
    // Define o id do cliente dono
    const idCliente = resposta.sucesso ? (resposta.dados.idCliente || resposta.dados.ID_CLIENTE || '') : '';
    // Calcula o valor total
    let total = 0;
    // Percorre os itens
    carrinhoCompras.forEach(item => {
        // Converte o preço para número
        const precoNum = parseFloat((item.preco || '0').replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        // Soma ao total
        total += precoNum * item.quantidade;
    });
    // Registra a venda (uma por item)
    for (const item of carrinhoCompras) {
        // Monta os dados da venda
        const dadosVenda = {
            // ID do site
            idSite: idSite,
            // ID do cliente dono
            idCliente: idCliente,
            // Produto vendido
            produto: item.nome,
            // Valor (total do item)
            valor: (parseFloat((item.preco || '0').replace(/[^\d,]/g, '').replace(',', '.')) || 0) * item.quantidade,
            // Cliente final
            clienteFinal: clienteFinal,
            // Status (pago - simulação Pix)
            status: 'pago',
            // Data da venda
            data: new Date().toISOString()
        };
        // Chama a API para registrar a venda
        await apiRegistrarVenda(dadosVenda);
    }
    // Limpa o carrinho
    carrinhoCompras = [];
    // Fecha o carrinho
    fecharCarrinho();
    // Informa o sucesso
    alert('Compra finalizada! O valor será enviado ao dono do site via Pix.');
}

// ============================================================
// 6. EDITOR RESPONSIVO INTELIGENTE
// ============================================================

// Reorganiza automaticamente os elementos para o dispositivo
// (empilha elementos para mobile/tablet)
function reorganizarResponsivo(dispositivo) {
    // Se for desktop, não faz nada (posição livre)
    if (dispositivo === 'desktop') return;
    // Percorre os elementos
    estadoEditor.elementos.forEach((el, idx) => {
        // Garante que exista a posição do dispositivo
        if (!el.pos) el.pos = {};
        // Se o dispositivo não tiver posição, cria uma automática
        if (!el.pos[dispositivo]) {
            // Posição automática (empilhada)
            const linha = Math.floor(idx / 2);
            const coluna = idx % 2;
            // Largura do canvas do dispositivo
            const larguraCanvas = dispositivo === 'tablet' ? 768 : 375;
            // Calcula a posição empilhada
            el.pos[dispositivo] = {
                // X alterna entre 2 colunas
                x: coluna === 0 ? 20 : (larguraCanvas / 2 + 20),
                // Y calculado pela linha
                y: 40 + (linha * 220),
                // Largura do elemento (metade do canvas)
                w: (larguraCanvas / 2) - 40,
                // Altura mantida
                h: (el.pos.desktop && el.pos.desktop.h) || 200
            };
        }
    });
    // Renderiza o canvas
    renderizarCanvas();
}

// ============================================================
// 7. SEO VISUAL
// ============================================================

// Abre o modal de SEO visual
function abrirSeoVisual() {
    // Preenche o título
    document.getElementById('seoTituloInput').value = estadoEditor.seoTitulo || '';
    // Preenche a descrição
    document.getElementById('seoDescricaoInput').value = estadoEditor.seoDescricao || '';
    // Preenche a imagem (se existir)
    document.getElementById('seoImagemInput').value = estadoEditor.seoImagem || '';
    // Abre o modal
    document.getElementById('modalSeo').classList.add('visivel');
}

// Salva o SEO visual
function salvarSeoVisual() {
    // Obtém o título
    estadoEditor.seoTitulo = document.getElementById('seoTituloInput').value.trim();
    // Obtém a descrição
    estadoEditor.seoDescricao = document.getElementById('seoDescricaoInput').value.trim();
    // Obtém a imagem
    estadoEditor.seoImagem = document.getElementById('seoImagemInput').value.trim();
    // Fecha o modal
    fecharModal('modalSeo');
    // Informa o sucesso
    mostrarToast('SEO salvo!', 'sucesso');
}

// ============================================================
// CONTROLE DE MODAIS (utilitário)
// ============================================================

// Abre um modal
// Parametros: id (id do modal)
function abrirModal(id) {
    // Adiciona a classe visivel
    document.getElementById(id).classList.add('visivel');
}

// Fecha um modal
// Parametros: id (id do modal)
function fecharModal(id) {
    // Remove a classe visivel
    document.getElementById(id).classList.remove('visivel');
}

// Fecha os modais ao clicar fora deles
document.addEventListener('click', (e) => {
    // Se o clique foi em um modal (fundo)
    if (e.target && e.target.classList && e.target.classList.contains('modal-pequeno')) {
        // Fecha o modal
        e.target.classList.remove('visivel');
    }
});

// ============================================================
// INICIALIZAÇÃO DOS RECURSOS AVANÇADOS
// ============================================================

// Adiciona os blocos compostos ao catálogo do editor
// (sobrescreve montarCatalogo para incluir a aba de blocos)
function adicionarBlocosCompostos() {
    // Seleciona o container do catálogo
    const containerBlocos = document.getElementById('listaBlocos');
    // Se não existir o container, sai (blocos opcionais)
    if (!containerBlocos) return;
    // Percorre os blocos compostos
    BLOCO_COMPOSTOS.forEach(bloco => {
        // Cria o botão do bloco
        const btn = document.createElement('button');
        // Define a classe do bloco
        btn.className = 'item-template';
        // Define o conteúdo
        btn.innerHTML = '<span class="icone">' + bloco.icone + '</span><div><div class="rotulo">' + bloco.rotulo + '</div><div class="descricao">' + bloco.descricao + '</div></div>';
        // Configura o clique para inserir o bloco
        btn.addEventListener('click', () => inserirBlocoComposto(bloco.tipo));
        // Adiciona o botão ao container
        containerBlocos.appendChild(btn);
    });
}

// Insere um bloco composto no canvas
// Parametros: tipo (string)
function inserirBlocoComposto(tipo) {
    // Obtém os elementos do bloco
    const elementos = obterBlocoComposto(tipo, estadoEditor.dispositivo);
    // Adiciona os elementos à página atual
    estadoEditor.elementos.push(...elementos);
    // Renderiza o canvas
    renderizarCanvas();
    // Atualiza as camadas
    atualizarCamadas();
    // Guarda no histórico
    guardarHistorico();
    // Informa o sucesso
    mostrarToast('Bloco adicionado!', 'sucesso');
}

// Configura os recursos avançados ao carregar o editor
function configurarRecursosAvancados() {
    // Adiciona os blocos compostos
    adicionarBlocosCompostos();
    // Atualiza o seletor de páginas
    atualizarSeletorPaginas();
}

// Executa a configuração quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Aguarda o editor inicializar (setTimeout)
    setTimeout(configurarRecursosAvancados, 100);
});
