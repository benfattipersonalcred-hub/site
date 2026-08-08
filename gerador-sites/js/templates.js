// ============================================================
// ARQUIVO: js/templates.js
// DESCRIÇÃO: Catálogo completo de elementos e templates prontos
//           do Editor Visual Avançado (DECISÃO 10).
//           Cada elemento é um objeto JSON (DECISÃO 07).
// ============================================================

// ============================================================
// CATÁLOGO DE ELEMENTOS DISPONÍVEIS NO PAINEL ESQUERDO
// Cada item define: categoria, tipo, rótulo, ícone e o modelo
// base do elemento (estrutura JSON inicial).
// ============================================================

// Função que retorna o modelo base de um elemento
// Parametros: tipo (string) e x,y (posição inicial)
// Retorna: objeto JSON do elemento
function criarModeloElemento(tipo, x, y) {
    // Posição padrão inicial (centro aproximado do canvas)
    const posX = x !== undefined ? x : 100;
    const posY = y !== undefined ? y : 100;

    // Retorna o objeto conforme o tipo solicitado
    switch (tipo) {
        case 'titulo':
            // Modelo de título
            return { tipo: 'titulo', id: gerarId('el'), texto: 'Título do site', pos: { desktop: { x: posX, y: posY, w: 400, h: 60 } }, estilo: { corTexto: '#0f172a', tamanhoFonte: 40, grossura: '700', fonte: 'Segoe UI', alinhamento: 'left' } };
        case 'paragrafo':
            // Modelo de parágrafo
            return { tipo: 'paragrafo', id: gerarId('el'), texto: 'Digite seu texto aqui. Clique para editar.', pos: { desktop: { x: posX, y: posY, w: 350, h: 80 } }, estilo: { corTexto: '#475569', tamanhoFonte: 16, fonte: 'Segoe UI', alinhamento: 'left' } };
        case 'botao':
            // Modelo de botão
            return { tipo: 'botao', id: gerarId('el'), texto: 'Clique aqui', pos: { desktop: { x: posX, y: posY, w: 160, h: 50 } }, estilo: { corFundo: '#38bdf8', corTexto: '#ffffff', raioBorda: 10, tamanhoFonte: 16, grossura: '600' } };
        case 'imagem':
            // Modelo de imagem (placeholder)
            return { tipo: 'imagem', id: gerarId('el'), url: 'https://placehold.co/400x300/38bdf8/ffffff?text=Imagem', texto: 'Imagem', pos: { desktop: { x: posX, y: posY, w: 400, h: 300 } }, estilo: { raioBorda: 8 } };
        case 'container':
            // Modelo de container/caixa
            return { tipo: 'container', id: gerarId('el'), texto: '', pos: { desktop: { x: posX, y: posY, w: 300, h: 200 } }, estilo: { corFundo: 'rgba(56,189,248,0.1)', borda: { espessura: 1, cor: '#38bdf8' }, raioBorda: 8 } };
        case 'divisor':
            // Modelo de divisor (linha)
            return { tipo: 'divisor', id: gerarId('el'), texto: '', pos: { desktop: { x: posX, y: posY, w: 400, h: 2 } }, estilo: { corFundo: '#cbd5e1' } };
        case 'video':
            // Modelo de vídeo (YouTube)
            return { tipo: 'video', id: gerarId('el'), url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', texto: 'Vídeo', pos: { desktop: { x: posX, y: posY, w: 400, h: 225 } }, estilo: { raioBorda: 8 } };
        case 'produto':
            // Modelo de card de produto (e-commerce)
            return {
                tipo: 'produto', id: gerarId('el'), texto: 'Produto',
                pos: { desktop: { x: posX, y: posY, w: 250, h: 320 } },
                estilo: { corFundo: '#ffffff', raioBorda: 10, sombra: { x: 0, y: 4, blur: 15, cor: 'rgba(0,0,0,0.1)' } },
                dados: { imagem: 'https://placehold.co/250x180/e2e8f0/64748b?text=Produto', preco: 'R$ 99,90', descricao: 'Nome do produto' }
            };
        case 'imovel':
            // Modelo de card de imóvel (imobiliária)
            return {
                tipo: 'imovel', id: gerarId('el'), texto: 'Imóvel',
                pos: { desktop: { x: posX, y: posY, w: 260, h: 340 } },
                estilo: { corFundo: '#ffffff', raioBorda: 10, sombra: { x: 0, y: 4, blur: 15, cor: 'rgba(0,0,0,0.1)' } },
                dados: { imagem: 'https://placehold.co/260x180/fef3c7/92400e?text=Im%C3%B3vel', preco: 'R$ 450.000', quarte: '3 quartos', area: '120 m²', local: 'Centro' }
            };
        case 'veiculo':
            // Modelo de card de veículo
            return {
                tipo: 'veiculo', id: gerarId('el'), texto: 'Veículo',
                pos: { desktop: { x: posX, y: posY, w: 260, h: 300 } },
                estilo: { corFundo: '#ffffff', raioBorda: 10, sombra: { x: 0, y: 4, blur: 15, cor: 'rgba(0,0,0,0.1)' } },
                dados: { imagem: 'https://placehold.co/260x160/dbeafe/1e40af?text=Carro', nome: 'Modelo do carro', ano: 2024, km: '0 km', preco: 'R$ 120.000' }
            };
        case 'formulario':
            // Modelo de formulário de lead
            return {
                tipo: 'formulario', id: gerarId('el'), texto: 'Formulário',
                pos: { desktop: { x: posX, y: posY, w: 300, h: 250 } },
                estilo: { corFundo: '#f8fafc', raioBorda: 10, borda: { espessura: 1, cor: '#e2e8f0' } }
            };
        case 'whatsapp':
            // Modelo de botão WhatsApp
            return { tipo: 'whatsapp', id: gerarId('el'), texto: 'WhatsApp', url: 'https://wa.me/5500000000000', pos: { desktop: { x: posX, y: posY, w: 200, h: 50 } }, estilo: { corFundo: '#25D366', corTexto: '#ffffff', raioBorda: 25, tamanhoFonte: 16, grossura: '600' } };
        case 'mapa':
            // Modelo de mapa embutido
            return { tipo: 'mapa', id: gerarId('el'), url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d0!2d-46.6!3d-23.5', texto: 'Mapa', pos: { desktop: { x: posX, y: posY, w: 400, h: 300 } }, estilo: { raioBorda: 8 } };
        default:
            // Modelo genérico (div)
            return { tipo: 'container', id: gerarId('el'), texto: '', pos: { desktop: { x: posX, y: posY, w: 300, h: 200 } }, estilo: {} };
    }
}

// ============================================================
// CATÁLOGO EXIBIDO NO PAINEL ESQUERDO DO EDITOR
// Estrutura: categorias → cada uma com seus elementos
// ============================================================

// Array com as categorias e elementos disponíveis
const CATALOGO_ELEMENTOS = [
    {
        // Categoria de elementos básicos
        categoria: 'Básicos',
        itens: [
            // Título
            { tipo: 'titulo', rotulo: 'Título', icone: '🔤' },
            // Parágrafo
            { tipo: 'paragrafo', rotulo: 'Parágrafo', icone: '📝' },
            // Botão
            { tipo: 'botao', rotulo: 'Botão', icone: '🔘' },
            // Imagem
            { tipo: 'imagem', rotulo: 'Imagem', icone: '🖼️' },
            // Container/Caixa
            { tipo: 'container', rotulo: 'Caixa', icone: '📦' },
            // Divisor
            { tipo: 'divisor', rotulo: 'Divisor', icone: '➖' }
        ]
    },
    {
        // Categoria de mídia
        categoria: 'Mídia',
        itens: [
            // Vídeo
            { tipo: 'video', rotulo: 'Vídeo', icone: '🎬' },
            // Mapa
            { tipo: 'mapa', rotulo: 'Mapa', icone: '🗺️' }
        ]
    },
    {
        // Categoria e-commerce
        categoria: 'E-commerce',
        itens: [
            // Card de produto
            { tipo: 'produto', rotulo: 'Produto', icone: '🛍️' }
        ]
    },
    {
        // Categoria imobiliária
        categoria: 'Imobiliária',
        itens: [
            // Card de imóvel
            { tipo: 'imovel', rotulo: 'Imóvel', icone: '🏠' }
        ]
    },
    {
        // Categoria veículos
        categoria: 'Veículos',
        itens: [
            // Card de veículo
            { tipo: 'veiculo', rotulo: 'Veículo', icone: '🚗' }
        ]
    },
    {
        // Categoria conversão
        categoria: 'Conversão',
        itens: [
            // Formulário
            { tipo: 'formulario', rotulo: 'Formulário', icone: '📋' },
            // Botão WhatsApp
            { tipo: 'whatsapp', rotulo: 'WhatsApp', icone: '💬' }
        ]
    }
];

// ============================================================
// TEMPLATES PRONTOS (ponto de partida)
// Cada template é um site completo com elementos pré-posicionados.
// ============================================================

// Função que retorna um template conforme o tipo
// Parametros: tipo (string) e device (dispositivo)
// Retorna: array de elementos do template
function obterTemplate(tipo, device) {
    // Usa desktop como padrão
    const d = device || 'desktop';

    // Controla os templates por tipo
    switch (tipo) {
        case 'restaurante':
            // Template de restaurante
            return [
                // Título do restaurante
                { tipo: 'titulo', id: gerarId('el'), texto: '🍽️ Restaurante Sabor & Arte', pos: { [d]: { x: 40, y: 40, w: 600, h: 60 } }, estilo: { corTexto: '#0f172a', tamanhoFonte: 42, grossura: '700' } },
                // Parágrafo de introdução
                { tipo: 'paragrafo', id: gerarId('el'), texto: 'Culinária de qualidade com ingredientes frescos. Venha nos visitar!', pos: { [d]: { x: 40, y: 115, w: 500, h: 60 } }, estilo: { corTexto: '#475569', tamanhoFonte: 18 } },
                // Botão de reserva
                { tipo: 'botao', id: gerarId('el'), texto: 'Reservar mesa', pos: { [d]: { x: 40, y: 200, w: 180, h: 50 } }, estilo: { corFundo: '#f59e0b', corTexto: '#ffffff', raioBorda: 25, tamanhoFonte: 16, grossura: '600' } },
                // Botão WhatsApp
                { tipo: 'whatsapp', id: gerarId('el'), texto: 'Pedir pelo WhatsApp', pos: { [d]: { x: 240, y: 200, w: 220, h: 50 } }, estilo: { corFundo: '#25D366', corTexto: '#ffffff', raioBorda: 25, tamanhoFonte: 16, grossura: '600' } },
                // Imagem do prato
                { tipo: 'imagem', id: gerarId('el'), url: 'https://placehold.co/600x400/fef3c7/92400e?text=Prato+do+Dia', texto: 'Prato', pos: { [d]: { x: 40, y: 290, w: 600, h: 400 } }, estilo: { raioBorda: 12 } }
            ];
        case 'loja':
            // Template de loja (e-commerce)
            return [
                // Título da loja
                { tipo: 'titulo', id: gerarId('el'), texto: '🛍️ Minha Loja Virtual', pos: { [d]: { x: 40, y: 40, w: 500, h: 60 } }, estilo: { corTexto: '#0f172a', tamanhoFonte: 40, grossura: '700' } },
                // Card de produto 1
                { tipo: 'produto', id: gerarId('el'), texto: 'Produto 1', pos: { [d]: { x: 40, y: 130, w: 250, h: 320 } }, estilo: { corFundo: '#ffffff', raioBorda: 10, sombra: { x: 0, y: 4, blur: 15, cor: 'rgba(0,0,0,0.1)' } }, dados: { imagem: 'https://placehold.co/250x180/e2e8f0/64748b?text=Produto+1', preco: 'R$ 49,90', descricao: 'Produto incrível' } },
                // Card de produto 2
                { tipo: 'produto', id: gerarId('el'), texto: 'Produto 2', pos: { [d]: { x: 310, y: 130, w: 250, h: 320 } }, estilo: { corFundo: '#ffffff', raioBorda: 10, sombra: { x: 0, y: 4, blur: 15, cor: 'rgba(0,0,0,0.1)' } }, dados: { imagem: 'https://placehold.co/250x180/e2e8f0/64748b?text=Produto+2', preco: 'R$ 89,90', descricao: 'Produto especial' } },
                // Card de produto 3
                { tipo: 'produto', id: gerarId('el'), texto: 'Produto 3', pos: { [d]: { x: 580, y: 130, w: 250, h: 320 } }, estilo: { corFundo: '#ffffff', raioBorda: 10, sombra: { x: 0, y: 4, blur: 15, cor: 'rgba(0,0,0,0.1)' } }, dados: { imagem: 'https://placehold.co/250x180/e2e8f0/64748b?text=Produto+3', preco: 'R$ 129,90', descricao: 'Produto premium' } }
            ];
        case 'imobiliaria':
            // Template de imobiliária
            return [
                // Título da imobiliária
                { tipo: 'titulo', id: gerarId('el'), texto: '🏠 Imobiliária Prime', pos: { [d]: { x: 40, y: 40, w: 500, h: 60 } }, estilo: { corTexto: '#0f172a', tamanhoFonte: 40, grossura: '700' } },
                // Card de imóvel 1
                { tipo: 'imovel', id: gerarId('el'), texto: 'Imóvel 1', pos: { [d]: { x: 40, y: 130, w: 260, h: 340 } }, estilo: { corFundo: '#ffffff', raioBorda: 10, sombra: { x: 0, y: 4, blur: 15, cor: 'rgba(0,0,0,0.1)' } }, dados: { imagem: 'https://placehold.co/260x180/fef3c7/92400e?text=Casa', preco: 'R$ 450.000', quarte: '3 quartos', area: '120 m²', local: 'Centro' } },
                // Card de imóvel 2
                { tipo: 'imovel', id: gerarId('el'), texto: 'Imóvel 2', pos: { [d]: { x: 320, y: 130, w: 260, h: 340 } }, estilo: { corFundo: '#ffffff', raioBorda: 10, sombra: { x: 0, y: 4, blur: 15, cor: 'rgba(0,0,0,0.1)' } }, dados: { imagem: 'https://placehold.co/260x180/ccfbf1/115e59?text=Apartamento', preco: 'R$ 350.000', quarte: '2 quartos', area: '80 m²', local: 'Bairro Novo' } }
            ];
        case 'veiculos':
            // Template de veículos
            return [
                // Título da loja de veículos
                { tipo: 'titulo', id: gerarId('el'), texto: '🚗 Auto Prime Veículos', pos: { [d]: { x: 40, y: 40, w: 500, h: 60 } }, estilo: { corTexto: '#0f172a', tamanhoFonte: 40, grossura: '700' } },
                // Card de veículo 1
                { tipo: 'veiculo', id: gerarId('el'), texto: 'Carro 1', pos: { [d]: { x: 40, y: 130, w: 260, h: 300 } }, estilo: { corFundo: '#ffffff', raioBorda: 10, sombra: { x: 0, y: 4, blur: 15, cor: 'rgba(0,0,0,0.1)' } }, dados: { imagem: 'https://placehold.co/260x160/dbeafe/1e40af?text=Carro', nome: 'Sedan 2024', ano: 2024, km: '0 km', preco: 'R$ 120.000' } },
                // Card de veículo 2
                { tipo: 'veiculo', id: gerarId('el'), texto: 'Carro 2', pos: { [d]: { x: 320, y: 130, w: 260, h: 300 } }, estilo: { corFundo: '#ffffff', raioBorda: 10, sombra: { x: 0, y: 4, blur: 15, cor: 'rgba(0,0,0,0.1)' } }, dados: { imagem: 'https://placehold.co/260x160/fee2e2/991b1b?text=SUV', nome: 'SUV 2023', ano: 2023, km: '15.000 km', preco: 'R$ 180.000' } }
            ];
        case 'portfolio':
            // Template de portfólio
            return [
                // Título do portfólio
                { tipo: 'titulo', id: gerarId('el'), texto: '✨ Meu Portfólio', pos: { [d]: { x: 40, y: 40, w: 500, h: 60 } }, estilo: { corTexto: '#0f172a', tamanhoFonte: 42, grossura: '700' } },
                // Parágrafo de introdução
                { tipo: 'paragrafo', id: gerarId('el'), texto: 'Designer e desenvolvedor criativo. Veja meus projetos abaixo.', pos: { [d]: { x: 40, y: 115, w: 450, h: 60 } }, estilo: { corTexto: '#475569', tamanhoFonte: 18 } },
                // Imagens dos projetos
                { tipo: 'imagem', id: gerarId('el'), url: 'https://placehold.co/300x220/8b5cf6/ffffff?text=Projeto+1', texto: 'Projeto 1', pos: { [d]: { x: 40, y: 200, w: 300, h: 220 } }, estilo: { raioBorda: 12 } },
                { tipo: 'imagem', id: gerarId('el'), url: 'https://placehold.co/300x220/6366f1/ffffff?text=Projeto+2', texto: 'Projeto 2', pos: { [d]: { x: 360, y: 200, w: 300, h: 220 } }, estilo: { raioBorda: 12 } },
                { tipo: 'imagem', id: gerarId('el'), url: 'https://placehold.co/300x220/38bdf8/ffffff?text=Projeto+3', texto: 'Projeto 3', pos: { [d]: { x: 680, y: 200, w: 300, h: 220 } }, estilo: { raioBorda: 12 } }
            ];
        case 'salao':
            // Template de salão de beleza
            return [
                // Título do salão
                { tipo: 'titulo', id: gerarId('el'), texto: '💇 Salão Beleza Pura', pos: { [d]: { x: 40, y: 40, w: 500, h: 60 } }, estilo: { corTexto: '#0f172a', tamanhoFonte: 40, grossura: '700' } },
                // Parágrafo
                { tipo: 'paragrafo', id: gerarId('el'), texto: 'Cabeleireiro, manicure e estética. Agende seu horário!', pos: { [d]: { x: 40, y: 115, w: 450, h: 60 } }, estilo: { corTexto: '#475569', tamanhoFonte: 18 } },
                // Botão de agendamento
                { tipo: 'botao', id: gerarId('el'), texto: 'Agendar horário', pos: { [d]: { x: 40, y: 200, w: 200, h: 50 } }, estilo: { corFundo: '#ec4899', corTexto: '#ffffff', raioBorda: 25, tamanhoFonte: 16, grossura: '600' } },
                // Imagem de beleza
                { tipo: 'imagem', id: gerarId('el'), url: 'https://placehold.co/500x350/fce7f3/9d174d?text=Beleza', texto: 'Beleza', pos: { [d]: { x: 40, y: 280, w: 500, h: 350 } }, estilo: { raioBorda: 12 } }
            ];
        case 'landing':
            // Template de landing page
            return [
                // Título principal (hero)
                { tipo: 'titulo', id: gerarId('el'), texto: '🚀 Sua ideia no mercado hoje', pos: { [d]: { x: 60, y: 60, w: 600, h: 70 } }, estilo: { corTexto: '#0f172a', tamanhoFonte: 46, grossura: '800' } },
                // Parágrafo
                { tipo: 'paragrafo', id: gerarId('el'), texto: 'Crie sua página profissional em minutos, sem código. Comece grátis!', pos: { [d]: { x: 60, y: 145, w: 500, h: 60 } }, estilo: { corTexto: '#475569', tamanhoFonte: 20 } },
                // Botão CTA primário
                { tipo: 'botao', id: gerarId('el'), texto: 'Começar agora', pos: { [d]: { x: 60, y: 230, w: 180, h: 55 } }, estilo: { corFundo: '#38bdf8', corTexto: '#ffffff', raioBorda: 28, tamanhoFonte: 18, grossura: '700' } },
                // Botão CTA secundário
                { tipo: 'botao', id: gerarId('el'), texto: 'Ver planos', pos: { [d]: { x: 260, y: 230, w: 150, h: 55 } }, estilo: { corFundo: 'transparent', corTexto: '#38bdf8', raioBorda: 28, tamanhoFonte: 18, grossura: '700', borda: { espessura: 2, cor: '#38bdf8' } } }
            ];
        case 'clinica':
            // Template de clínica/serviços
            return [
                // Título da clínica
                { tipo: 'titulo', id: gerarId('el'), texto: '🏥 Clínica Vida Plena', pos: { [d]: { x: 40, y: 40, w: 500, h: 60 } }, estilo: { corTexto: '#0f172a', tamanhoFonte: 40, grossura: '700' } },
                // Parágrafo
                { tipo: 'paragrafo', id: gerarId('el'), texto: 'Cuidando da sua saúde com profissionais qualificados.', pos: { [d]: { x: 40, y: 115, w: 450, h: 60 } }, estilo: { corTexto: '#475569', tamanhoFonte: 18 } },
                // Botão de consulta
                { tipo: 'botao', id: gerarId('el'), texto: 'Agendar consulta', pos: { [d]: { x: 40, y: 200, w: 200, h: 50 } }, estilo: { corFundo: '#10b981', corTexto: '#ffffff', raioBorda: 25, tamanhoFonte: 16, grossura: '600' } },
                // Formulário de contato
                { tipo: 'formulario', id: gerarId('el'), texto: 'Formulário', pos: { [d]: { x: 40, y: 280, w: 300, h: 250 } }, estilo: { corFundo: '#f8fafc', raioBorda: 10, borda: { espessura: 1, cor: '#e2e8f0' } } }
            ];
        default:
            // Template em branco (sem elementos)
            return [];
    }
}

// Lista dos templates disponíveis para o usuário escolher
const LISTA_TEMPLATES = [
    // Página em branco
    { tipo: 'branco', rotulo: 'Página em Branco', icone: '⬜', descricao: 'Comece do zero' },
    // Restaurante
    { tipo: 'restaurante', rotulo: 'Restaurante', icone: '🍽️', descricao: 'Cardápio e reservas' },
    // Loja
    { tipo: 'loja', rotulo: 'Loja Virtual', icone: '🛍️', descricao: 'E-commerce' },
    // Imobiliária
    { tipo: 'imobiliaria', rotulo: 'Imobiliária', icone: '🏠', descricao: 'Venda e aluguel' },
    // Veículos
    { tipo: 'veiculos', rotulo: 'Veículos', icone: '🚗', descricao: 'Loja de carros' },
    // Portfólio
    { tipo: 'portfolio', rotulo: 'Portfólio', icone: '✨', descricao: 'Trabalhos criativos' },
    // Salão de beleza
    { tipo: 'salao', rotulo: 'Salão de Beleza', icone: '💇', descricao: 'Beleza e estética' },
    // Landing page
    { tipo: 'landing', rotulo: 'Landing Page', icone: '🚀', descricao: 'Página de vendas' },
    // Clínica
    { tipo: 'clinica', rotulo: 'Clínica', icone: '🏥', descricao: 'Serviços de saúde' }
];
