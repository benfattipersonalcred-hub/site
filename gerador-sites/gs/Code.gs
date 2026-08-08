// ============================================================
// ARQUIVO: gs/Code.gs
// DESCRIÇÃO: Endpoints do backend (Google Apps Script).
//           Pontos de entrada do front (doGet/doPost).
// ============================================================

// ============================================================
// FUNÇÃO: endpoint doGet (consultas GET do front)
// Parametros: e (objeto de evento com parâmetros da URL)
// Retorna: JSON com o resultado
// ============================================================
function doGet(e) {
    // Obtém o parâmetro 'acao' enviado pela URL
    var acao = e.parameter.acao;
    // Processa a ação solicitada
    var resultado = processarAcao(acao, e.parameter, 'GET');
    // Converte o resultado em JSON e retorna
    return ContentService.createTextOutput(JSON.stringify(resultado))
        // Define o cabeçalho como JSON
        .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// FUNÇÃO: endpoint doPost (POST do front)
// Parametros: e (objeto de evento com corpo da requisição)
// Retorna: JSON com o resultado
// ============================================================
function doPost(e) {
    // Converte o corpo da requisição (JSON string) para objeto
    var corpo = JSON.parse(e.postData.contents);
    // Obtém a ação escrita no corpo
    var acao = corpo.acao;
    // Processa a ação solicitada enviando o corpo
    var resultado = processarAcao(acao, corpo, 'POST');
    // Converte o resultado em JSON e retorna
    return ContentService.createTextOutput(JSON.stringify(resultado))
        // Define o cabeçalho como JSON
        .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// FUNÇÃO: gera um ID único no servidor (Apps Script)
// Parametros: prefixo (string opcional)
// Retorna: uma string de ID única baseada no tempo
// ============================================================
function gerarIdServer(prefixo) {
    // Usa o prefixo informado ou "id" como padrão
    var pre = prefixo || 'id';
    // Combina tempo atual + aleatório + UUID para garantir unicidade
    var base = Date.now().toString() + Math.random().toString(36) + Utilities.getUuid();
    // Retorna prefixo + parte aleatória do id
    return pre + '_' + base.substring(0, 12);
}

// ============================================================
// FUNÇÃO: valida o token de autenticação de um cliente (Etapa 8)
// Parametros: token (string) e idCliente (string opcional)
// Retorna: true se o token é válido e não expirou, false caso contrário
// ============================================================
function validarTokenCliente(token, idCliente) {
    // Se não houver token, retorna false
    if (!token) return false;
    // Busca o cliente pelo token informado
    var cliente = buscarPor(getConfig().ABAS.CLIENTES, 'TOKEN', token);
    // Se não encontrou o cliente pelo token, retorna false
    if (!cliente) return false;
    // Se foi informado um idCliente, verifica se o token pertence a ele
    if (idCliente && String(cliente.ID) !== String(idCliente)) return false;
    // Verifica se o token expirou
    var validade = cliente.TOKEN_VALIDADE;
    // Se houver validade e for uma data
    if (validade) {
        // Converte a validade para Date (se for string)
        var dataValidade = new Date(validade);
        // Se a data for inválida, retorna false
        if (isNaN(dataValidade.getTime())) return false;
        // Se a validade já passou, retorna false
        if (dataValidade.getTime() < Date.now()) return false;
    }
    // Token válido
    return true;
}

// ============================================================
// FUNÇÃO: valida o token de autenticação de um admin (Etapa 8)
// Parametros: token (string)
// Retorna: true se o token é válido e não expirou, false caso contrário
// ============================================================
function validarTokenAdmin(token) {
    // Se não houver token, retorna false
    if (!token) return false;
    // Busca o admin pelo token informado
    var admin = buscarPor(getConfig().ABAS.ADMIN, 'TOKEN', token);
    // Se não encontrou o admin pelo token, retorna false
    if (!admin) return false;
    // Verifica se o token expirou
    var validade = admin.TOKEN_VALIDADE;
    // Se houver validade e for uma data
    if (validade) {
        // Converte a validade para Date (se for string)
        var dataValidade = new Date(validade);
        // Se a data for inválida, retorna false
        if (isNaN(dataValidade.getTime())) return false;
        // Se a validade já passou, retorna false
        if (dataValidade.getTime() < Date.now()) return false;
    }
    // Token válido
    return true;
}

// ============================================================
// FUNÇÃO: processa a ação recebida (roteador)
// Parametros: acao (string), params (objeto), metodo
// Retorna: objeto de resultado
// ============================================================
function processarAcao(acao, params, metodo) {
    // Cria a estrutura padrão de resposta
    var resposta = { sucesso: false, dados: null, mensagem: '' };
    // Controla a ação por um switch
switch (acao) {
        case 'login':
            // Chama a função de login com os parâmetros
            return executarLogin(params);
        case 'login_admin':
            // Chama a função de login do ADMIN (valida na aba Admin)
            return executarLoginAdmin(params);
        case 'cadastrar_cliente':
            // Chama a função de cadastro de cliente
            return executarCadastroCliente(params);
        case 'listar_sites':
            // Chama a função de listar sites (do cliente)
            return executarListarSites(params);
        case 'salvar_site':
            // Chama a função de salvar site
            return executarSalvarSite(params);
case 'buscar_site':
            // Chama a função de buscar um site pelo id
            return executarBuscarSite(params);
        case 'atualizar_plano':
            // Chama a função de atualizar o plano do cliente
            return executarAtualizarPlano(params);
        case 'listar_clientes_admin':
            // Chama a função de listar todos os clientes (admin)
            return executarListarClientesAdmin(params);
        case 'atualizar_plano_admin':
            // Chama a função de atualizar plano pelo admin (inclui vitalicio)
            return executarAtualizarPlanoAdmin(params);
        case 'atualizar_status_cliente':
            // Chama a função de atualizar o status de um cliente
            return executarAtualizarStatusCliente(params);
        case 'listar_transacoes':
            // Chama a função de listar transações financeiras
            return executarListarTransacoes(params);
        case 'registrar_financeiro':
            // Chama a função de registrar uma transação financeira
            return executarRegistrarFinanceiro(params);
        case 'listar_vendas':
            // Chama a função de listar as vendas dos sites
            return executarListarVendas(params);
case 'registrar_venda':
            // Chama a função de registrar uma venda
            return executarRegistrarVenda(params);
        case 'registrar_lead':
            // Chama a função de registrar um lead (formulário do site)
            return executarRegistrarLead(params);
        case 'upload_imagem':
            // Chama a função de upload de imagem (ImgBB - DECISÃO 08)
            return executarUploadImagem(params);
        default:
            // Para ação desconhecida, retorna erro
            resposta.mensagem = 'Ação desconhecida: ' + acao;
            // Retorna a resposta de erro
            return resposta;
    }
}

// ============================================================
// FUNÇÃO: executa o login (valida senha + gera token)
// Parametros: params (email, senha)
// Retorna: objeto com sucesso, token e dados do usuário
// ============================================================
function executarLogin(params) {
    // Busca o cliente correspondente ao email informado
    var usuario = buscarPor(getConfig().ABAS.CLIENTES, 'EMAIL', params.email);
    // Se não encontrou, retorna erro
    if (!usuario) return { sucesso: false, mensagem: 'Usuário não encontrado' };
    // Busca o salt e o hash da senha salva
    var salt = usuario.SALT_SENHA || '';
    var hash = usuario.SENHA || '';
    // Valida se a senha informada confere
    var ok = validarSenha(params.senha, hash, salt);
    // Se a senha estiver errada, retorna erro
    if (!ok) return { sucesso: false, mensagem: 'Senha incorreta' };
    // Gera um token de sessão para o usuário
    var token = gerarToken(usuario.EMAIL);
    // Define a validade do token
    var validade = dataValidadeToken();
    // Atualiza o token e validade no registro do usuário
    atualizar(getConfig().ABAS.CLIENTES, 'ID', usuario.ID, {
        // Salva o token gerado
        TOKEN: token,
        // Salva a validade do token
        TOKEN_VALIDADE: validade,
        // Registra o último login
        ULTIMO_LOGIN: new Date()
    });
    // Retorna sucesso com token e dados do usuário
    return {
        sucesso: true,
        dados: {
            token: token,
            usuario: {
                ID: usuario.ID,
                NOME_COMPLETO: usuario.NOME_COMPLETO,
                EMAIL: usuario.EMAIL,
                PLANO: usuario.PLANO,
                STATUS: usuario.STATUS
            }
        }
    };
}

// ============================================================
// FUNÇÃO: executa o login do ADMIN (valida na aba ADMIN)
// Parametros: params (email, senha)
// Retorna: objeto com sucesso, token e dados do admin
// ============================================================
function executarLoginAdmin(params) {
    // Busca o admin correspondente ao email informado na aba Admin
    var admin = buscarPor(getConfig().ABAS.ADMIN, 'EMAIL', params.email);
    // Se não encontrou, tenta achar pelo campo de login (EMAIL) na aba Admin
    if (!admin) return { sucesso: false, mensagem: 'Administrador não encontrado' };
    // Verifica se o admin está ativo (status Ativo)
    var statusAdmin = (admin.STATUS || 'ativo').toLowerCase();
    // Se o admin estiver inativo, bloqueia o acesso
    if (statusAdmin === 'inativo') return { sucesso: false, mensagem: 'Administrador inativo' };
    // Obtém o salt e o hash da senha do admin
    var salt = admin.SALT_SENHA || '';
    var hash = admin.SENHA || '';
    // Valida a senha informada contra o hash salvo
    var ok = validarSenha(params.senha, hash, salt);
    // Se a senha estiver errada, retorna erro
    if (!ok) return { sucesso: false, mensagem: 'Senha incorreta' };
    // Gera um token de sessão para o admin
    var token = gerarToken(admin.EMAIL + '_admin');
    // Define a validade do token
    var validade = dataValidadeToken();
    // Atualiza o token e validade no registro do admin
    atualizar(getConfig().ABAS.ADMIN, 'ID', admin.ID, {
        // Salva o token gerado
        TOKEN: token,
        // Salva a validade do token
        TOKEN_VALIDADE: validade,
        // Registra o último login
        ULTIMO_LOGIN: new Date()
    });
    // Retorna sucesso com token e dados do admin
    return {
        sucesso: true,
        dados: {
            token: token,
            usuario: {
                // ID do admin
                ID: admin.ID,
                // Nome completo do admin
                NOME_COMPLETO: admin.NOME_COMPLETO,
                // Email do admin
                EMAIL: admin.EMAIL,
                // Nível de acesso (Super Admin/Admin/Gestor)
                NIVEL_ACESSO: admin.NIVEL_ACESSO || 'Admin',
                // Marca como admin para o front (controle de acesso)
                perfil: 'admin',
                // Status do admin
                STATUS: admin.STATUS || 'ativo'
            }
        }
    };
}

// ============================================================
// FUNÇÃO: cadastra um novo cliente (com hash de senha)
// Parametros: params (dados do cadastro)
// Retorna: objeto com sucesso e mensagem
// ============================================================
function executarCadastroCliente(params) {
    // Verifica se o email já está cadastrado
    var existente = buscarPor(getConfig().ABAS.CLIENTES, 'EMAIL', params.email);
    // Se já existir, retorna erro
    if (existente) return { sucesso: false, mensagem: 'E-mail já cadastrado' };
    // Gera um salt para a senha
    var salt = gerarSalt();
    // Gera o hash da senha com o salt (server-side)
    var hash = gerarHashSenha(params.senha, salt);
// Cria o objeto do novo cliente
    var novoCliente = {
        // Gera um ID único
        ID: gerarIdServer('cliente'),
        // Nome completo informado
        NOME_COMPLETO: params.nome,
        // Email informado (em minúsculas)
        EMAIL: params.email,
        // Telefone/WhatsApp
        TEL_WHATS: params.tel || '',
        // CPF (somente PF)
        CPF: params.cpf || '',
        // Data de nascimento
        DATA_NASCIMENTO: params.nascimento || '',
        // Tipo de cliente (PF ou PJ)
        TIPO_CLIENTE: params.tipoCliente || 'PF',
        // CNPJ (somente PJ)
        CNPJ: params.cnpj || '',
        // CEP
        CEP: params.cep || '',
        // Endereço (logradouro)
        ENDERECO: params.endereco || '',
        // Número do endereço
        NUMERO: params.numero || '',
        // Bairro
        BAIRRO: params.bairro || '',
        // Cidade
        CIDADE: params.cidade || '',
        // Estado (UF)
        ESTADO: params.estado || '',
        // Senha com o hash gerado
        SENHA: hash,
        // Salt usado no hash
        SALT_SENHA: salt,
        // Plano inicial
        PLANO: params.plano || 'free',
        // Status inicial (ativo)
        STATUS: 'ativo',
        // Data de cadastro
        DATA_CADASTRO: new Date()
    };
    // Adiciona o cliente na aba
    adicionar(getConfig().ABAS.CLIENTES, novoCliente);
    // Retorna sucesso
    return { sucesso: true, dados: novoCliente, mensagem: 'Cadastro realizado' };
}

// ============================================================
// FUNÇÃO: lista os sites de um cliente
// Parametros: params (token para identificar o cliente)
// Retorna: lista de sites do cliente
// ============================================================
function executarListarSites(params) {
    // Lê todos os sites
    var sites = lerTodos(getConfig().ABAS.SITES);
    // Filtra os sites por ID_CLIENTE informado
    var meus = sites.filter(function (s) { return s.ID_CLIENTE === params.idCliente; });
    // Retorna a lista filtrada
    return { sucesso: true, dados: meus };
}

// ============================================================
// FUNÇÃO: salva (cria/atualiza) um site
// Parametros: params (dados do site)
// Retorna: objeto de sucesso
// ============================================================
function executarSalvarSite(params) {
    // ==========================================================
    // VALIDAÇÃO DE SEGURANÇA (Etapa 8)
    // Verifica se o token do cliente é válido antes de salvar
    // ==========================================================
    // Se o token não for válido, retorna erro de autenticação
    if (!validarTokenCliente(params.token, params.idCliente)) {
        // Retorna erro de acesso não autorizado
        return { sucesso: false, mensagem: 'Acesso não autorizado: token inválido ou expirado' };
    }
    // Busca se o site já existe
    var existente = buscarPor(getConfig().ABAS.SITES, 'ID_SITE', params.idSite);
    // Se o site for novo
    if (!existente) {
// Cria o objeto do site
        var novoSite = {
// ID único do site
            ID_SITE: params.idSite || gerarIdServer('site'),
            // ID do cliente dono
            ID_CLIENTE: params.idCliente,
            // Nome do site
            NOME_SITE: params.nome || '',
            // JSON da estrutura (serializado)
            JSON_ESTRUTURA: params.json || '',
// Subdomínio do site
            SUBDOMINIO: params.subdominio || '',
            // URLs das imagens do site (ImgBB) serializadas em JSON string
            IMAGENS: params.imagens ? JSON.stringify(params.imagens) : '',
            // Tema de cores global do site serializado em JSON string
            TEMA_CORES: params.temaCores ? JSON.stringify(params.temaCores) : '',
            // SEO título
            SEO_TITULO: params.seoTitulo || '',
// SEO descrição
            SEO_DESCRICAO: params.seoDescricao || '',
            // Status rascunho por padrão (ou publicado, se informado)
            // Se o usuário clicou em Publicar, o status já vem como 'publicado'
            STATUS: params.status || 'rascunho',
            // Data de criação
            DATA_CRIACAO: new Date(),
            // Data de atualização
            DATA_ATUALIZACAO: new Date()
        };
        // Adiciona o site na aba
        adicionar(getConfig().ABAS.SITES, novoSite);
        // Retorna sucesso com o site
        return { sucesso: true, dados: novoSite };
    }
// Monta o objeto de atualização (sempre com data de atualização)
    var atualizacao = {
        // Atualiza o JSON da estrutura
        JSON_ESTRUTURA: params.json || existente.JSON_ESTRUTURA,
        // Atualiza o nome do site (se informado)
        NOME_SITE: params.nome || existente.NOME_SITE,
        // Atualiza o subdomínio (se informado)
        // Aceita undefined para não sobrescrever com vazio
        SUBDOMINIO: params.subdominio !== undefined ? params.subdominio : existente.SUBDOMINIO,
// Atualiza as imagens (se informado) serializadas em JSON string
        IMAGENS: params.imagens !== undefined ? JSON.stringify(params.imagens) : existente.IMAGENS,
        // Atualiza o tema de cores (se informado) serializado em JSON string
        TEMA_CORES: params.temaCores !== undefined ? JSON.stringify(params.temaCores) : existente.TEMA_CORES,
        // Atualiza o SEO título
        SEO_TITULO: params.seoTitulo || existente.SEO_TITULO,
        // Atualiza o SEO descrição
        SEO_DESCRICAO: params.seoDescricao || existente.SEO_DESCRICAO,
        // Atualiza a data de atualização
        DATA_ATUALIZACAO: new Date()
    };
    // Se o status foi informado (rascunho/publicado), atualiza também
    if (params.status) atualizacao.STATUS = params.status;
    // Aplica a atualização no site existente
    atualizar(getConfig().ABAS.SITES, 'ID_SITE', existente.ID_SITE, atualizacao);
    // Retorna sucesso com o site atualizado
    return { sucesso: true, dados: Object.assign({}, existente, atualizacao) };
}

// ============================================================
// FUNÇÃO: busca um site pelo ID (para renderização)
// Parametros: params (idSite)
// Retorna: o site encontrado
// ============================================================
function executarBuscarSite(params) {
    // Busca o site pelo ID
    var site = buscarPor(getConfig().ABAS.SITES, 'ID_SITE', params.idSite);
    // Se não encontrou, retorna erro
    if (!site) return { sucesso: false, mensagem: 'Site não encontrado' };
    // Retorna o site encontrado
    return { sucesso: true, dados: site };
}

// ============================================================
// FUNÇÃO: atualiza o plano de um cliente (upgrade)
// Parametros: params (idCliente, plano, token)
// Retorna: objeto com sucesso e mensagem
// ============================================================
function executarAtualizarPlano(params) {
    // ==========================================================
    // VALIDAÇÃO DE SEGURANÇA (Etapa 8)
    // Verifica se o token do cliente é válido antes de atualizar o plano
    // ==========================================================
    // Se o token não for válido, retorna erro de autenticação
    if (!validarTokenCliente(params.token, params.idCliente)) {
        // Retorna erro de acesso não autorizado
        return { sucesso: false, mensagem: 'Acesso não autorizado: token inválido ou expirado' };
    }
    // Busca o cliente pelo ID informado
    var cliente = buscarPor(getConfig().ABAS.CLIENTES, 'ID', params.idCliente);
    // Se não encontrou, retorna erro
    if (!cliente) return { sucesso: false, mensagem: 'Cliente não encontrado' };

    // Lista de planos permitidos ao cliente (Free/Basic/Pro)
    var planosPermitidos = ['free', 'basic', 'pro'];
    // Converte o plano para minúsculas
    var novoPlano = (params.plano || '').toString().toLowerCase();
    // Se o plano não for permitido, retorna erro
    if (planosPermitidos.indexOf(novoPlano) === -1) {
        return { sucesso: false, mensagem: 'Plano inválido' };
    }

    // Aplica a atualização do plano no cliente
    atualizar(getConfig().ABAS.CLIENTES, 'ID', cliente.ID, {
        // Define o novo plano
        PLANO: novoPlano,
        // Reativa o cliente (se estava inadimplente)
        STATUS: 'ativo'
    });

// Retorna sucesso com o novo plano
    return { sucesso: true, dados: { idCliente: cliente.ID, plano: novoPlano }, mensagem: 'Plano atualizado' };
}

// ============================================================
// FUNÇÃO: lista todos os clientes (painel admin)
// Parametros: params (idAdmin opcional para validação)
// Retorna: lista de todos os clientes
// ============================================================
function executarListarClientesAdmin(params) {
    // ==========================================================
    // VALIDAÇÃO DE SEGURANÇA (Etapa 8)
    // Verifica se o token do admin é válido antes de listar clientes
    // ==========================================================
    // Se o token do admin não for válido, retorna erro de autenticação
    if (!validarTokenAdmin(params.token)) {
        // Retorna erro de acesso não autorizado
        return { sucesso: false, mensagem: 'Acesso não autorizado: token de admin inválido ou expirado' };
    }
    // Lê todos os clientes da aba
    var clientes = lerTodos(getConfig().ABAS.CLIENTES);
    // Retorna a lista de clientes
    return { sucesso: true, dados: clientes };
}

// ============================================================
// FUNÇÃO: atualiza o plano de um cliente pelo ADMIN
//           (permite TODOS os planos, inclusive VITALICIO)
// Parametros: params (idCliente, plano)
// Retorna: objeto com sucesso e mensagem
// ============================================================
function executarAtualizarPlanoAdmin(params) {
    // ==========================================================
    // VALIDAÇÃO DE SEGURANÇA (Etapa 8)
    // Verifica se o token do admin é válido antes de atualizar o plano
    // ==========================================================
    // Se o token do admin não for válido, retorna erro de autenticação
    if (!validarTokenAdmin(params.token)) {
        // Retorna erro de acesso não autorizado
        return { sucesso: false, mensagem: 'Acesso não autorizado: token de admin inválido ou expirado' };
    }
    // Busca o cliente pelo ID informado
    var cliente = buscarPor(getConfig().ABAS.CLIENTES, 'ID', params.idCliente);
    // Se não encontrou, retorna erro
    if (!cliente) return { sucesso: false, mensagem: 'Cliente não encontrado' };

    // Lista de TODOS os planos (inclui vitalicio - exclusivo do admin)
    var planosPermitidos = ['free', 'basic', 'pro', 'vitalicio'];
    // Converte o plano para minúsculas
    var novoPlano = (params.plano || '').toString().toLowerCase();
    // Se o plano não for permitido, retorna erro
    if (planosPermitidos.indexOf(novoPlano) === -1) {
        return { sucesso: false, mensagem: 'Plano inválido' };
    }

    // Aplica a atualização do plano no cliente
    atualizar(getConfig().ABAS.CLIENTES, 'ID', cliente.ID, {
        // Define o novo plano
        PLANO: novoPlano,
        // Vitalicio sempre ativo; demais planos reativam o cliente
        STATUS: novoPlano === 'vitalicio' ? 'ativo' : 'ativo'
    });

    // Retorna sucesso com o novo plano
    return { sucesso: true, dados: { idCliente: cliente.ID, plano: novoPlano }, mensagem: 'Plano atualizado' };
}

// ============================================================
// FUNÇÃO: atualiza o status de um cliente (admin)
// Parametros: params (idCliente, status)
// Retorna: objeto com sucesso e mensagem
// ============================================================
function executarAtualizarStatusCliente(params) {
    // ==========================================================
    // VALIDAÇÃO DE SEGURANÇA (Etapa 8)
    // Verifica se o token do admin é válido antes de atualizar o status
    // ==========================================================
    // Se o token do admin não for válido, retorna erro de autenticação
    if (!validarTokenAdmin(params.token)) {
        // Retorna erro de acesso não autorizado
        return { sucesso: false, mensagem: 'Acesso não autorizado: token de admin inválido ou expirado' };
    }
    // Busca o cliente pelo ID informado
    var cliente = buscarPor(getConfig().ABAS.CLIENTES, 'ID', params.idCliente);
    // Se não encontrou, retorna erro
    if (!cliente) return { sucesso: false, mensagem: 'Cliente não encontrado' };

    // Lista de status permitidos
    var statusPermitidos = ['ativo', 'inativo', 'inadimplente'];
    // Converte o status para minúsculas
    var novoStatus = (params.status || '').toString().toLowerCase();
    // Se o status não for permitido, retorna erro
    if (statusPermitidos.indexOf(novoStatus) === -1) {
        return { sucesso: false, mensagem: 'Status inválido' };
    }

    // Aplica a atualização do status no cliente
    atualizar(getConfig().ABAS.CLIENTES, 'ID', cliente.ID, {
        // Define o novo status
        STATUS: novoStatus
    });

    // Retorna sucesso
    return { sucesso: true, dados: { idCliente: cliente.ID, status: novoStatus }, mensagem: 'Status atualizado' };
}

// ============================================================
// FUNÇÃO: lista as transações financeiras
// Parametros: params (idCliente opcional - se vazio, lista todos)
// Retorna: lista de transações (Financeiro)
// ============================================================
function executarListarTransacoes(params) {
    // ==========================================================
    // VALIDAÇÃO DE SEGURANÇA (Etapa 8)
    // Verifica se o token é válido antes de listar transações
    // ==========================================================
    // Se houver idCliente, valida o token do cliente; senão, valida o token do admin
    var tokenValido = params.idCliente ? validarTokenCliente(params.token, params.idCliente) : validarTokenAdmin(params.token);
    // Se o token não for válido, retorna erro de autenticação
    if (!tokenValido) {
        // Retorna erro de acesso não autorizado
        return { sucesso: false, mensagem: 'Acesso não autorizado: token inválido ou expirado' };
    }
    // Lê todas as transações da aba Financeiro
    var transacoes = lerTodos(getConfig().ABAS.FINANCEIRO);
    // Se foi informado um cliente, filtra por ele
    if (params.idCliente) {
        // Filtra as transações do cliente
        transacoes = transacoes.filter(function (t) { return t.ID_CLIENTE === params.idCliente; });
    }
    // Retorna a lista de transações
    return { sucesso: true, dados: transacoes };
}

// ============================================================
// FUNÇÃO: registra uma transação financeira (mensalidade)
// Parametros: params (idCliente, plano, valor, status, metodo, vencimento)
// Retorna: objeto com sucesso e dados da transação
// ============================================================
function executarRegistrarFinanceiro(params) {
    // Cria o objeto da transação
    var transacao = {
        // ID único da transação
        ID_TRANSACAO: gerarIdServer('trans'),
        // ID do cliente
        ID_CLIENTE: params.idCliente,
        // Tipo (mensalidade ou venda)
        TIPO: params.tipo || 'mensalidade',
        // Plano associado
        PLANO: params.plano || 'free',
        // Valor da transação
        VALOR: params.valor || 0,
        // Status do pagamento (pago/pendente/inadimplente)
        STATUS_PAGAMENTO: params.status || 'pendente',
        // Método (Pix/cartão)
        METODO: params.metodo || 'Pix',
        // Data de vencimento
        DATA_VENCIMENTO: params.vencimento || '',
        // Data de pagamento
        DATA_PAGAMENTO: params.dataPagamento || ''
    };
    // Adiciona a transação na aba Financeiro
    adicionar(getConfig().ABAS.FINANCEIRO, transacao);
    // Retorna sucesso com a transação criada
    return { sucesso: true, dados: transacao, mensagem: 'Transação registrada' };
}

// ============================================================
// FUNÇÃO: lista as vendas dos clientes
// Parametros: params (idCliente opcional - se vazio, lista todos)
// Retorna: lista de vendas (Vendas_Clientes)
// ============================================================
function executarListarVendas(params) {
    // ==========================================================
    // VALIDAÇÃO DE SEGURANÇA (Etapa 8)
    // Verifica se o token é válido antes de listar vendas
    // ==========================================================
    // Se houver idCliente, valida o token do cliente; senão, valida o token do admin
    var tokenValido = params.idCliente ? validarTokenCliente(params.token, params.idCliente) : validarTokenAdmin(params.token);
    // Se o token não for válido, retorna erro de autenticação
    if (!tokenValido) {
        // Retorna erro de acesso não autorizado
        return { sucesso: false, mensagem: 'Acesso não autorizado: token inválido ou expirado' };
    }
    // Lê todas as vendas da aba Vendas_Clientes
    var vendas = lerTodos(getConfig().ABAS.VENDAS_CLIENTES);
    // Se foi informado um cliente, filtra por ele (dono do site)
    if (params.idCliente) {
        // Filtra as vendas do cliente dono
        vendas = vendas.filter(function (v) { return v.ID_CLIENTE === params.idCliente; });
    }
    // Retorna a lista de vendas
    return { sucesso: true, dados: vendas };
}

// ============================================================
// FUNÇÃO: registra uma venda de um site do cliente
// Parametros: params (idSite, idCliente, produto, valor, clienteFinal)
// Retorna: objeto com sucesso e dados da venda
// ============================================================
function executarRegistrarVenda(params) {
    // Cria o objeto da venda
    var venda = {
        // ID único da venda
        ID_VENDA: gerarIdServer('venda'),
        // ID do site onde ocorreu a venda
        ID_SITE: params.idSite,
        // ID do cliente dono do site (recebe o valor - DECISÃO 09)
        ID_CLIENTE: params.idCliente,
        // Produto ou serviço vendido
        PRODUTO_SERVICO: params.produto || '',
        // Valor da venda
        VALOR: params.valor || 0,
        // Quem comprou (cliente final)
        CLIENTE_FINAL: params.clienteFinal || '',
        // Status do pagamento (pago/pendente)
        STATUS_PAGAMENTO: params.status || 'pendente',
        // Data da venda
        DATA: params.data || new Date()
    };
    // Adiciona a venda na aba Vendas_Clientes
    adicionar(getConfig().ABAS.VENDAS_CLIENTES, venda);
    // Retorna sucesso com a venda criada
    return { sucesso: true, dados: venda, mensagem: 'Venda registrada' };
}

// ============================================================
// FUNÇÃO: registra um lead captado por um formulário do site
// Parametros: params (nome, email, tel, produtoServico, descricao)
// Retorna: objeto com sucesso e dados do lead
// ============================================================
function executarRegistrarLead(params) {
    // Cria o objeto do lead (estrutura simplificada - DECISÃO 03)
    var lead = {
        // ID único do lead
        ID: gerarIdServer('lead'),
        // Nome completo do lead
        NOME_COMPLETO: params.nome || '',
        // E-mail do lead
        EMAIL: params.email || '',
        // Telefone/WhatsApp do lead
        TEL_WHATS: params.tel || '',
        // Produto ou serviço de interesse
        PRODUTO_SERVICO: params.produtoServico || '',
        // Observações / descrição
        DESCRICAO: params.descricao || ''
    };
    // Adiciona o lead na aba Leads
    adicionar(getConfig().ABAS.LEADS, lead);
    // Retorna sucesso com o lead criado
    return { sucesso: true, dados: lead, mensagem: 'Lead registrado' };
}

// ============================================================
// FUNÇÃO: faz upload de uma imagem para o ImgBB (DECISÃO 08)
// Parametros: params (base64, nomeArquivo)
// Retorna: objeto com sucesso e URL da imagem
// ============================================================
function executarUploadImagem(params) {
    // ==========================================================
    // VALIDAÇÃO DE SEGURANÇA (Etapa 8)
    // Verifica se o token do cliente é válido antes de fazer upload
    // ==========================================================
    // Se o token não for válido, retorna erro de autenticação
    if (!validarTokenCliente(params.token, params.idCliente)) {
        // Retorna erro de acesso não autorizado
        return { sucesso: false, mensagem: 'Acesso não autorizado: token inválido ou expirado' };
    }
    // Obtém a chave secreta do ImgBB da configuração (NUNCA no front)
    var chave = getConfig().IMGBB_API_KEY;
    // Se não houver chave, retorna erro
    if (!chave) return { sucesso: false, mensagem: 'Chave ImgBB não configurada' };
    // Obtém o base64 da imagem (sem o prefixo "data:image/...;base64,")
    var base64 = params.base64 || '';
    // Remove o prefixo do data URI, se existir
    if (base64.indexOf('base64,') !== -1) {
        // Extrai apenas a parte base64 (após a vírgula)
        base64 = base64.substring(base64.indexOf('base64,') + 7);
    }
    // Se não houver base64, retorna erro
    if (!base64) return { sucesso: false, mensagem: 'Imagem não fornecida' };
    // Define o nome do arquivo (ou padrão)
    var nomeArquivo = params.nomeArquivo || 'imagem.png';
    // Monta o corpo da requisição para a API do ImgBB
    var corpo = {
        // Chave da API
        key: chave,
        // Imagem em base64
        image: base64,
        // Nome do arquivo
        name: nomeArquivo
    };
    // Converte o corpo para formato de formulário (URL encoded)
    var opcoes = {
        // Método POST
        method: 'post',
        // Conteúdo do corpo (URL encoded)
        payload: corpo,
        // Não segue redirecionamentos automaticamente (para capturar a resposta)
        followRedirects: false
    };
    // Faz a requisição para a API do ImgBB
    var resposta = UrlFetchApp.fetch('https://api.imgbb.com/1/upload', opcoes);
    // Obtém o código de status da resposta
    var codigo = resposta.getResponseCode();
    // Converte o corpo da resposta para JSON
    var dados = JSON.parse(resposta.getContentText());
    // Se a resposta não for bem-sucedida
    if (codigo !== 200 || !dados.success) {
        // Retorna erro com a mensagem da API
        return { sucesso: false, mensagem: 'Erro no upload: ' + (dados.error ? dados.error.message : 'Desconhecido') };
    }
    // Extrai a URL da imagem do resultado
    var urlImagem = dados.data.url || dados.data.display_url || '';
    // Retorna sucesso com a URL da imagem
    return { sucesso: true, dados: { url: urlImagem }, mensagem: 'Imagem enviada com sucesso' };
}
