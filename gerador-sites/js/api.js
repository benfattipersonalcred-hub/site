// ============================================================
// ARQUIVO: js/api.js
// DESCRIÇÃO: Camada única de comunicação com o backend.
//           Suporta MOCK MODE (localStorage - DECISÃO 11) e
//           MODO REAL (Google Apps Script via fetch).
//           Para trocar de modo, basta alterar MOCK_MODE.
// ============================================================

// ============================================================
// CONFIGURAÇÃO DO MODO
// ============================================================
// Se true, usa localStorage (Mock Mode). Se false, usa Apps Script.
const MOCK_MODE = false;

// URL do Web App do Google Apps Script (endpoint real do backend).
// Recebida do usuário e configurada para o modo real.
const API_URL = 'https://script.google.com/macros/s/AKfycbydqop-w-gsA7HTxIQv4TgXEv5034D5goxQGAiB4UGuq05MXt-fMPq53rXgJBRlhkUx1g/exec';

// ============================================================
// FUNÇÃO: chama o backend (real ou mock)
// Parametros: acao (string) e dados (objeto)
// Retorna: Promise com o resultado { sucesso, dados, mensagem }
// ============================================================
async function chamarAPI(acao, dados) {
    // Se estiver em Mock Mode, chama o mock
    if (MOCK_MODE) {
        // Retorna a resposta do mock da ação
        return mockExecutar(acao, dados);
    }
// Se estiver em modo real, faz o POST para o Apps Script
    try {
        // Obtém o token da sessão (se existir) para autenticação (Etapa 8)
        const tokenSessao = obterToken();
        // Monta o corpo da requisição com o token de autenticação
        const corpoRequisicao = { acao: acao, ...dados };
        // Se houver token de sessão, adiciona ao corpo
        if (tokenSessao) corpoRequisicao.token = tokenSessao;
        // Faz o POST para o Web App
        // IMPORTANTE: usa 'text/plain' em vez de 'application/json' para
        // EVITAR o preflight (OPTIONS) do CORS, que o Apps Script não processa.
        // O Apps Script lê o corpo via e.postData.contents e faz JSON.parse.
        const resposta = await fetch(API_URL, {
            // Método POST
            method: 'POST',
            // Define o corpo como JSON string
            body: JSON.stringify(corpoRequisicao),
            // Usa text/plain para evitar o preflight CORS
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        // Converte a resposta para texto e depois para JSON
        const texto = await resposta.text();
        // Tenta converter o texto em JSON
        try {
            return JSON.parse(texto);
        } catch (e) {
            // Se não for JSON, retorna erro informativo
            return { sucesso: false, mensagem: 'Resposta inválida do servidor: ' + texto };
        }
    } catch (erro) {
        // Captura erros de rede/CORS e retorna mensagem clara
        return { sucesso: false, mensagem: 'Erro de conexão com o servidor: ' + erro.message };
    }
}

// ============================================================
// FUNÇÕES DE ALTO NÍVEL (usadas pelo front)
// ============================================================

// Login: retorna token e dados do usuário
async function apiLogin(email, senha) {
    // Chama a API com ação login
    return chamarAPI('login', { email: email, senha: senha });
}

// Login do ADMIN: valida na aba Admin e retorna token com perfil admin
async function apiLoginAdmin(email, senha) {
    // Chama a API com ação login_admin
    return chamarAPI('login_admin', { email: email, senha: senha });
}

// Cadastro de cliente
async function apiCadastrarCliente(dados) {
    // Chama a API com ação cadastro
    return chamarAPI('cadastrar_cliente', dados);
}

// Lista os sites de um cliente
async function apiListarSites(idCliente) {
    // Chama a API com ação listar sites
    return chamarAPI('listar_sites', { idCliente: idCliente });
}

// Salva um site (cria/atualiza)
async function apiSalvarSite(dados) {
    // Chama a API com ação salvar site
    return chamarAPI('salvar_site', dados);
}

// Busca um site pelo id
async function apiBuscarSite(idSite) {
    // Chama a API com ação buscar site
    return chamarAPI('buscar_site', { idSite: idSite });
}

// Atualiza o plano de um cliente (upgrade)
async function apiAtualizarPlano(idCliente, plano) {
    // Chama a API com ação atualizar plano
    return chamarAPI('atualizar_plano', { idCliente: idCliente, plano: plano });
}

// ============================================================
// FUNÇÕES DE ALTO NÍVEL DO BLOCO 7 (Financeiro + Vendas + Admin)
// ============================================================

// Lista todos os clientes (painel admin)
async function apiListarClientesAdmin() {
    // Chama a API com ação listar clientes admin
    return chamarAPI('listar_clientes_admin', {});
}

// Atualiza o plano de um cliente pelo admin (inclui vitalicio)
async function apiAtualizarPlanoAdmin(idCliente, plano) {
    // Chama a API com ação atualizar plano admin
    return chamarAPI('atualizar_plano_admin', { idCliente: idCliente, plano: plano });
}

// Atualiza o status de um cliente (admin)
async function apiAtualizarStatusCliente(idCliente, status) {
    // Chama a API com ação atualizar status
    return chamarAPI('atualizar_status_cliente', { idCliente: idCliente, status: status });
}

// Lista as transações financeiras (idCliente opcional)
async function apiListarTransacoes(idCliente) {
    // Chama a API com ação listar transações
    return chamarAPI('listar_transacoes', { idCliente: idCliente || '' });
}

// Registra uma transação financeira (mensalidade)
async function apiRegistrarFinanceiro(dados) {
    // Chama a API com ação registrar financeiro
    return chamarAPI('registrar_financeiro', dados);
}

// Lista as vendas dos sites (idCliente opcional)
async function apiListarVendas(idCliente) {
    // Chama a API com ação listar vendas
    return chamarAPI('listar_vendas', { idCliente: idCliente || '' });
}

// Registra uma venda de um site do cliente
async function apiRegistrarVenda(dados) {
    // Chama a API com ação registrar venda
    return chamarAPI('registrar_venda', dados);
}

// Registra um lead captado por um formulário do site
async function apiRegistrarLead(dados) {
    // Chama a API com ação registrar lead
    return chamarAPI('registrar_lead', dados);
}

// ============================================================
// FUNÇÕES DE ALTO NÍVEL DO BLOCO 8 (Upload de imagem - ImgBB)
// ============================================================

// Faz upload de uma imagem para o ImgBB (via backend Apps Script)
// Parametros: base64 (string da imagem em base64) e nomeArquivo
// Retorna: Promise com o resultado { sucesso, dados, mensagem }
async function apiUploadImagem(base64, nomeArquivo) {
    // Chama a API com ação upload_imagem (a chave secreta fica no backend - DECISÃO 08)
    return chamarAPI('upload_imagem', { base64: base64, nomeArquivo: nomeArquivo || 'imagem.png' });
}

// ============================================================
// MOCK MODE (DECISÃO 11) - simula o banco com localStorage
// ============================================================

// Chave base usada no localStorage para mock
const MOCK_CHAVE = 'gerador_sites_mock';

// Lê todos os dados do mock
function mockLerBanco() {
    // Lê o banco do localStorage e converte de JSON
    const banco = lerLocal(MOCK_CHAVE);
    // Se não existir, devolve um banco vazio padrão
    return banco || { clientes: [], sites: [], leads: [], financeiro: [], vendas: [] };
}

// Salva o banco do mock no localStorage
function mockSalvarBanco(banco) {
    // Converte o banco para JSON e salva
    salvarLocal(MOCK_CHAVE, banco);
}

// Executa a ação no modo mock
function mockExecutar(acao, dados) {
    // Lê o banco atual do mock
    const banco = mockLerBanco();
    // Retorna uma Promise para simular assincronismo
    return new Promise((resolve) => {
        // Controla a ação por um switch
        switch (acao) {
            case 'login': {
                // Busca o cliente pelo email
                const cliente = banco.clientes.find(c => c.email === dados.email);
                // Se não achar, retorna erro
                if (!cliente) return resolve({ sucesso: false, mensagem: 'Usuário não encontrado' });
                // Se a senha não conferir, retorna erro
                if (cliente.senha !== dados.senha) return resolve({ sucesso: false, mensagem: 'Senha incorreta' });
                // Gera um token simples
                const token = gerarId('token');
                // Retorna sucesso com token e dados
                return resolve({
                    sucesso: true,
                    dados: {
                        token: token,
                        usuario: {
                            ID: cliente.id,
                            NOME_COMPLETO: cliente.nome,
                            EMAIL: cliente.email,
                            PLANO: cliente.plano,
                            STATUS: cliente.status
                        }
                    }
                });
            }
            case 'cadastrar_cliente': {
                // Verifica se o email já existe
                const existente = banco.clientes.find(c => c.email === dados.email);
                // Se existir, retorna erro
                if (existente) return resolve({ sucesso: false, mensagem: 'E-mail já cadastrado' });
// Cria o novo cliente
                const cliente = {
                    // Gera um ID único
                    id: gerarId('cliente'),
                    // Nome informado
                    nome: dados.nome,
                    // Email informado
                    email: dados.email,
                    // Telefone informado
                    tel: dados.tel || '',
                    // CPF (somente PF)
                    cpf: dados.cpf || '',
                    // Data de nascimento
                    nascimento: dados.nascimento || '',
                    // Tipo de cliente (PF ou PJ)
                    tipo: dados.tipoCliente || 'PF',
                    // CNPJ (somente PJ)
                    cnpj: dados.cnpj || '',
                    // CEP
                    cep: dados.cep || '',
                    // Endereço
                    endereco: dados.endereco || '',
                    // Número
                    numero: dados.numero || '',
                    // Bairro
                    bairro: dados.bairro || '',
                    // Cidade
                    cidade: dados.cidade || '',
                    // Estado (UF)
                    estado: dados.estado || '',
                    // Senha (em mock, texto puro; em real, hash)
                    senha: dados.senha,
                    // Plano informado
                    plano: dados.plano || 'free',
                    // Status ativo
                    status: 'ativo',
                    // Data de cadastro
                    dataCadastro: new Date().toISOString()
                };
                // Adiciona o cliente ao banco
                banco.clientes.push(cliente);
                // Salva o banco atualizado
                mockSalvarBanco(banco);
                // Retorna sucesso
                return resolve({ sucesso: true, dados: cliente, mensagem: 'Cadastro realizado' });
            }
            case 'listar_sites': {
                // Filtra os sites do cliente
                const meus = banco.sites.filter(s => s.idCliente === dados.idCliente);
                // Retorna a lista
                return resolve({ sucesso: true, dados: meus });
            }
            case 'salvar_site': {
                // Busca se o site já existe
                const idx = banco.sites.findIndex(s => s.idSite === dados.idSite);
                // Se for novo
                if (idx === -1) {
// Cria o site
                    const site = {
                        // ID do site
                        idSite: dados.idSite || gerarId('site'),
                        // ID do cliente
                        idCliente: dados.idCliente,
                        // Nome do site
                        nome: dados.nome || '',
                        // JSON da estrutura
                        json: dados.json || '',
                        // Subdomínio do site
                        subdominio: dados.subdominio || '',
                        // URLs das imagens do site (ImgBB)
                        imagens: dados.imagens || [],
                        // Tema de cores global do site
                        temaCores: dados.temaCores || {},
                        // SEO título
                        seoTitulo: dados.seoTitulo || '',
                        // SEO descrição
                        seoDescricao: dados.seoDescricao || '',
                        // Status rascunho
                        status: 'rascunho',
                        // Data de criação
                        dataCriacao: new Date().toISOString()
                    };
                    // Adiciona o site ao banco
                    banco.sites.push(site);
                    // Salva o banco
                    mockSalvarBanco(banco);
                    // Retorna sucesso
                    return resolve({ sucesso: true, dados: site });
                }
// Se já existe, atualiza
                banco.sites[idx].json = dados.json || banco.sites[idx].json;
                // Atualiza o nome (se informado)
                banco.sites[idx].nome = dados.nome || banco.sites[idx].nome;
                // Atualiza o subdomínio (se informado)
                if (dados.subdominio !== undefined) banco.sites[idx].subdominio = dados.subdominio;
                // Atualiza as imagens (se informado)
                if (dados.imagens !== undefined) banco.sites[idx].imagens = dados.imagens;
                // Atualiza o tema de cores (se informado)
                if (dados.temaCores !== undefined) banco.sites[idx].temaCores = dados.temaCores;
                // Atualiza o SEO título
                banco.sites[idx].seoTitulo = dados.seoTitulo || banco.sites[idx].seoTitulo;
                // Atualiza o SEO descrição
                banco.sites[idx].seoDescricao = dados.seoDescricao || banco.sites[idx].seoDescricao;
                // Atualiza o status (rascunho/publicado), se informado
                if (dados.status) banco.sites[idx].status = dados.status;
                // Atualiza a data de atualização
                banco.sites[idx].dataAtualizacao = new Date().toISOString();
                // Salva o banco
                mockSalvarBanco(banco);
                // Retorna sucesso
                return resolve({ sucesso: true, dados: banco.sites[idx] });
            }
case 'buscar_site': {
                // Busca o site pelo id
                const site = banco.sites.find(s => s.idSite === dados.idSite);
                // Se não achar, retorna erro
                if (!site) return resolve({ sucesso: false, mensagem: 'Site não encontrado' });
                // Retorna o site
                return resolve({ sucesso: true, dados: site });
            }
            case 'atualizar_plano': {
                // Busca o cliente pelo id
                const cliente = banco.clientes.find(c => c.id === dados.idCliente);
                // Se não achar, retorna erro
                if (!cliente) return resolve({ sucesso: false, mensagem: 'Cliente não encontrado' });
                // Lista de planos permitidos
                const planos = ['free', 'basic', 'pro'];
                // Normaliza o plano
                const novoPlano = (dados.plano || '').toLowerCase();
                // Se o plano for inválido, retorna erro
                if (planos.indexOf(novoPlano) === -1) return resolve({ sucesso: false, mensagem: 'Plano inválido' });
                // Atualiza o plano do cliente
                cliente.plano = novoPlano;
                // Reativa o cliente (caso esteja inadimplente)
                cliente.status = 'ativo';
                // Salva o banco
                mockSalvarBanco(banco);
// Retorna sucesso
                return resolve({ sucesso: true, dados: { idCliente: cliente.id, plano: novoPlano }, mensagem: 'Plano atualizado' });
            }
            case 'listar_clientes_admin': {
                // Retorna todos os clientes do mock
                return resolve({ sucesso: true, dados: banco.clientes });
            }
            case 'atualizar_plano_admin': {
                // Busca o cliente pelo id
                const clienteAdmin = banco.clientes.find(c => c.id === dados.idCliente);
                // Se não achar, retorna erro
                if (!clienteAdmin) return resolve({ sucesso: false, mensagem: 'Cliente não encontrado' });
                // Lista de todos os planos (inclui vitalicio)
                const planosAdmin = ['free', 'basic', 'pro', 'vitalicio'];
                // Normaliza o plano
                const novoPlanoAdmin = (dados.plano || '').toLowerCase();
                // Se o plano for inválido, retorna erro
                if (planosAdmin.indexOf(novoPlanoAdmin) === -1) return resolve({ sucesso: false, mensagem: 'Plano inválido' });
                // Atualiza o plano do cliente
                clienteAdmin.plano = novoPlanoAdmin;
                // Reativa o cliente
                clienteAdmin.status = 'ativo';
                // Salva o banco
                mockSalvarBanco(banco);
                // Retorna sucesso
                return resolve({ sucesso: true, dados: { idCliente: clienteAdmin.id, plano: novoPlanoAdmin }, mensagem: 'Plano atualizado' });
            }
            case 'atualizar_status_cliente': {
                // Busca o cliente pelo id
                const clienteStatus = banco.clientes.find(c => c.id === dados.idCliente);
                // Se não achar, retorna erro
                if (!clienteStatus) return resolve({ sucesso: false, mensagem: 'Cliente não encontrado' });
                // Lista de status permitidos
                const statusPermitidos = ['ativo', 'inativo', 'inadimplente'];
                // Normaliza o status
                const novoStatus = (dados.status || '').toLowerCase();
                // Se o status for inválido, retorna erro
                if (statusPermitidos.indexOf(novoStatus) === -1) return resolve({ sucesso: false, mensagem: 'Status inválido' });
                // Atualiza o status do cliente
                clienteStatus.status = novoStatus;
                // Salva o banco
                mockSalvarBanco(banco);
                // Retorna sucesso
                return resolve({ sucesso: true, dados: { idCliente: clienteStatus.id, status: novoStatus }, mensagem: 'Status atualizado' });
            }
            case 'listar_transacoes': {
                // Filtra as transações financeiras (do cliente, se informado)
                const transacoes = dados.idCliente ? banco.financeiro.filter(t => t.idCliente === dados.idCliente) : banco.financeiro;
                // Retorna a lista
                return resolve({ sucesso: true, dados: transacoes });
            }
            case 'registrar_financeiro': {
                // Cria uma transação financeira
                const transacao = {
                    // ID único
                    idTransacao: gerarId('trans'),
                    // ID do cliente
                    idCliente: dados.idCliente,
                    // Tipo (mensalidade/venda)
                    tipo: dados.tipo || 'mensalidade',
                    // Plano
                    plano: dados.plano || 'free',
                    // Valor
                    valor: dados.valor || 0,
                    // Status do pagamento
                    statusPagamento: dados.status || 'pendente',
                    // Método
                    metodo: dados.metodo || 'Pix',
                    // Data de vencimento
                    dataVencimento: dados.vencimento || '',
                    // Data de pagamento
                    dataPagamento: dados.dataPagamento || ''
                };
                // Adiciona ao banco financeiro
                banco.financeiro.push(transacao);
                // Salva o banco
                mockSalvarBanco(banco);
                // Retorna sucesso
                return resolve({ sucesso: true, dados: transacao, mensagem: 'Transação registrada' });
            }
            case 'listar_vendas': {
                // Filtra as vendas (do cliente, se informado)
                const vendas = dados.idCliente ? banco.vendas.filter(v => v.idCliente === dados.idCliente) : banco.vendas;
                // Retorna a lista
                return resolve({ sucesso: true, dados: vendas });
            }
            case 'registrar_venda': {
                // Cria uma venda
                const venda = {
                    // ID único
                    idVenda: gerarId('venda'),
                    // ID do site
                    idSite: dados.idSite,
                    // ID do cliente dono
                    idCliente: dados.idCliente,
                    // Produto/serviço
                    produtoServico: dados.produto || '',
                    // Valor
                    valor: dados.valor || 0,
                    // Cliente final
                    clienteFinal: dados.clienteFinal || '',
                    // Status do pagamento
                    statusPagamento: dados.status || 'pendente',
                    // Data
                    data: dados.data || new Date().toISOString()
                };
// Adiciona ao banco de vendas
                banco.vendas.push(venda);
                // Salva o banco
                mockSalvarBanco(banco);
                // Retorna sucesso
                return resolve({ sucesso: true, dados: venda, mensagem: 'Venda registrada' });
            }
            case 'registrar_lead': {
                // Cria um lead
                const lead = {
                    // ID único
                    id: gerarId('lead'),
                    // Nome completo
                    nome: dados.nome || '',
                    // E-mail
                    email: dados.email || '',
                    // Telefone/WhatsApp
                    tel: dados.tel || '',
                    // Produto/serviço de interesse
                    produtoServico: dados.produtoServico || '',
                    // Observações
                    descricao: dados.descricao || ''
                };
                // Adiciona ao banco de leads
                banco.leads.push(lead);
                // Salva o banco
                mockSalvarBanco(banco);
                // Retorna sucesso
                return resolve({ sucesso: true, dados: lead, mensagem: 'Lead registrado' });
            }
            default:
                // Ação desconhecida
                return resolve({ sucesso: false, mensagem: 'Ação desconhecida: ' + acao });
        }
    });
}
