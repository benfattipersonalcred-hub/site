// ============================================================
// ARQUIVO: js/utils.js
// DESCRIÇÃO: Funções auxiliares reutilizáveis em todo o projeto
// (geração de IDs, formatação de dados, localStorage, etc.)
// ============================================================

// ============================================================
// FUNÇÕES DE ID
// ============================================================

// Gera um ID único (simples) para elementos, sites, etc.
// Retorna: uma string com um id aleatório baseado no tempo
function gerarId(prefixo) {
    // Se não informou prefixo, usa "id" como padrão
    const pre = prefixo || 'id';
    // Retorna o prefixo + timestamp + número aleatório
    return pre + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
}

// Gera um ID curto (para sites/site.html?id=X)
// Retorna: uma string curta alfanumérica
function gerarIdCurto() {
    // Retorna um id aleatório de 8 caracteres
    return Math.random().toString(36).substr(2, 8);
}

// ============================================================
// FUNÇÕES DE LOCALSTORAGE (Mock Mode - DECISÃO 11)
// ============================================================

// Salva um dado no localStorage (Mock Mode)
// Parametros: chave (string) e valor (objeto/qualquer)
function salvarLocal(chave, valor) {
    // Converte o valor para JSON e salva no localStorage
    localStorage.setItem(chave, JSON.stringify(valor));
}

// Lê um dado do localStorage (Mock Mode)
// Parametros: chave (string)
// Retorna: o valor convertido de JSON, ou null se não existir
function lerLocal(chave) {
    // Busca o valor cru do localStorage
    const cru = localStorage.getItem(chave);
    // Se não existir, retorna null
    if (!cru) return null;
    // Tenta converter de JSON
    try {
        // Retorna o valor convertido
        return JSON.parse(cru);
    } catch (e) {
        // Se der erro, retorna null
        return null;
    }
}

// Remove um dado do localStorage (Mock Mode)
// Parametros: chave (string)
function removerLocal(chave) {
    // Remove a chave do localStorage
    localStorage.removeItem(chave);
}

// ============================================================
// FUNÇÕES DE FORMATAÇÃO
// ============================================================

// Formata um número para moeda brasileira (R$)
// Parametros: valor (número)
// Retorna: string formatada (ex: "R$ 1.234,56")
function formatarMoeda(valor) {
    // Usa o Intl para formatar o valor em reais
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Formata uma data para o padrão brasileiro
// Parametros: data (Date ou string)
// Retorna: string no formato dd/mm/aaaa
function formatarData(data) {
    // Converte para objeto Date se for string
    const d = new Date(data);
    // Retorna a data formatada no padrão brasileiro
    return d.toLocaleDateString('pt-BR');
}

// ============================================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================================

// Valida se um e-mail é válido
// Parametros: email (string)
// Retorna: true se válido, false se inválido
function validarEmail(email) {
    // Expressão regular para validar e-mail
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Testa o e-mail contra a expressão
    return regex.test(email);
}

// Valida se um CPF é válido (apenas dígitos)
// Parametros: cpf (string)
// Retorna: true se válido, false se inválido
function validarCPF(cpf) {
    // Remove caracteres não numéricos
    const numeros = cpf.replace(/\D/g, '');
    // Verifica se tem 11 dígitos
    return numeros.length === 11;
}

// Valida se um telefone é válido (apenas dígitos)
// Parametros: tel (string)
// Retorna: true se válido, false se inválido
function validarTelefone(tel) {
    // Remove caracteres não numéricos
    const numeros = tel.replace(/\D/g, '');
    // Verifica se tem entre 10 e 11 dígitos
    return numeros.length >= 10 && numeros.length <= 11;
}

// ============================================================
// FUNÇÕES DE MANIPULAÇÃO DE URL
// ============================================================

// Lê um parâmetro da URL (query string)
// Parametros: nome (string do parâmetro)
// Retorna: o valor do parâmetro ou null
function lerParamUrl(nome) {
    // Cria um objeto URLSearchParams a partir da query string
    const params = new URLSearchParams(window.location.search);
    // Retorna o valor do parâmetro
    return params.get(nome);
}

// Redireciona para outra página
// Parametros: pagina (string do caminho)
function irPara(pagina) {
    // Redireciona o navegador para a página indicada
    window.location.href = pagina;
}

// ============================================================
// FUNÇÕES DE ELEMENTOS DOM
// ============================================================

// Cria um elemento HTML com atributos e conteúdo
// Parametros: tag, atributos (objeto), conteudo (opcional)
// Retorna: o elemento criado
function criarEl(tag, atributos, conteudo) {
    // Cria o elemento HTML
    const el = document.createElement(tag);
    // Se houver atributos, adiciona cada um
    if (atributos) {
        // Percorre as chaves dos atributos
        Object.keys(atributos).forEach(chave => {
            // Adiciona o atributo ao elemento
            el.setAttribute(chave, atributos[chave]);
        });
    }
    // Se houver conteúdo, adiciona como texto
    if (conteudo !== undefined) {
        // Define o texto interno do elemento
        el.textContent = conteudo;
    }
    // Retorna o elemento criado
    return el;
}

// Converte as imagens de um site em array (aceita array ou JSON string)
// Parametros: valor (array ou string JSON)
// Retorna: array de imagens
function parseImagensSite(valor) {
    // Se for um array, retorna direto
    if (Array.isArray(valor)) return valor;
    // Se for string, tenta converter de JSON
    if (typeof valor === 'string' && valor) {
        try {
            // Converte a string JSON em objeto
            const parseado = JSON.parse(valor);
            // Se for array, retorna
            if (Array.isArray(parseado)) return parseado;
        } catch (e) {
            // Se der erro, retorna vazio
            return [];
        }
    }
    // Caso contrário, retorna vazio
    return [];
}

// Converte o tema de cores de um site em objeto (aceita objeto ou JSON string)
// Parametros: valor (objeto ou string JSON)
// Retorna: objeto do tema de cores
function parseTemaCoresSite(valor) {
    // Se for objeto, retorna direto
    if (valor && typeof valor === 'object' && !Array.isArray(valor)) return valor;
    // Se for string, tenta converter de JSON
    if (typeof valor === 'string' && valor) {
        try {
            // Converte a string JSON em objeto
            return JSON.parse(valor) || {};
        } catch (e) {
            // Se der erro, retorna vazio
            return {};
        }
    }
    // Caso contrário, retorna vazio
    return {};
}

// Exibe um alerta de mensagem (pode ser substituído por um modal depois)
// Parametros: mensagem (string), tipo ('sucesso'|'erro'|'info')
function mostrarToast(mensagem, tipo) {
    // Define a cor do toast conforme o tipo
    const cor = tipo === 'sucesso' ? '#10b981' : tipo === 'erro' ? '#ef4444' : '#38bdf8';
    // Cria o elemento do toast
    const toast = criarEl('div', { class: 'toast' }, mensagem);
    // Aplica o estilo do toast
    toast.style.cssText = 'position:fixed;bottom:20px;right:20px;padding:14px 22px;border-radius:10px;color:white;font-size:0.9em;z-index:9999;box-shadow:0 6px 20px rgba(0,0,0,0.3);background:' + cor + ';transition:opacity 0.3s;';
    // Adiciona o toast ao corpo da página
    document.body.appendChild(toast);
    // Remove o toast após 3 segundos
    setTimeout(() => {
        // Aplica transparência para sumir suavemente
        toast.style.opacity = '0';
        // Remove o elemento do DOM após a transição
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
