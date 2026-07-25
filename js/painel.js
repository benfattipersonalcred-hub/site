document.addEventListener('DOMContentLoaded', () => {
    const session = AUTH.requireSession();
    if (!session) return;

    const adminEmails = ['admin@benfatti.com.br', 'tacio@benfatti.com.br'];
    const { nome: usuarioNome, email: usuarioEmail, token: usuarioToken } = session;

    // Mostrar link Admin apenas para administradores
    const abaAdmin = document.getElementById('abaAdmin');
    if (abaAdmin && adminEmails.includes((usuarioEmail || '').toLowerCase())) {
        abaAdmin.style.display = 'flex';
    }
    const nomeUsuario = document.getElementById('nomeUsuario');
    const emailUsuario = document.getElementById('emailUsuario');
    const tokenUsuario = document.getElementById('tokenUsuario');

    if (nomeUsuario) nomeUsuario.textContent = usuarioNome || 'Cliente';
    if (emailUsuario) emailUsuario.textContent = usuarioEmail || '';
    if (tokenUsuario) tokenUsuario.textContent = usuarioToken || '❌ Não Autenticado';

    const abaVisaoGeral = document.getElementById('abaVisaoGeral');
    const abaConfiguracoes = document.getElementById('abaConfiguracoes');
    const conteudoVisaoGeral = document.getElementById('conteudoVisaoGeral');
    const conteudoConfiguracoes = document.getElementById('conteudoConfiguracoes');
    const subtituloPainel = document.getElementById('subtituloPainel');
    const panelContainer = document.getElementById('panelContainer');

    function alternarAba(abaAtivar, conteudoMostrar, conteudoEsconder, textoSubtitulo) {
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
        if (abaAtivar) abaAtivar.classList.add('active');
        if (conteudoMostrar) conteudoMostrar.style.display = 'block';
        if (conteudoEsconder) conteudoEsconder.style.display = 'none';
        if (subtituloPainel) subtituloPainel.textContent = textoSubtitulo;
        if (panelContainer) panelContainer.classList.remove('mobile-menu-open');
    }

    function formatDateForInput(value) {
        if (!value) return '';
        if (value instanceof Date) {
            const y = value.getFullYear();
            const m = String(value.getMonth() + 1).padStart(2, '0');
            const d = String(value.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        const raw = String(value).trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
            const parts = raw.split('/');
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        const parsed = new Date(raw);
        if (!isNaN(parsed)) {
            const y = parsed.getFullYear();
            const m = String(parsed.getMonth() + 1).padStart(2, '0');
            const d = String(parsed.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        return '';
    }

    function normalizeProfilePayload(resultado) {
        if (!resultado || typeof resultado !== 'object') return {};
        let dados = resultado.dados || resultado.data || resultado.usuario || resultado;
        if (Array.isArray(dados)) {
            const first = Array.isArray(dados[0]) ? dados[0] : dados;
            if (Array.isArray(first)) {
                return {
                    nome: first[1] || '',
                    email: first[2] || '',
                    tel: first[3] || '',
                    dataNasc: first[4] || '',
                    cep: first[5] || '',
                    endereco: first[6] || '',
                    numero: first[7] || '',
                    bairro: first[8] || '',
                    cidade: first[9] || '',
                    estado: first[10] || ''
                };
            }
            if (typeof first === 'object' && first !== null) {
                dados = first;
            }
        }
        if (typeof dados !== 'object' || dados === null) return {};

        return {
            nome: dados.nome || dados.Nome || dados.name || '',
            email: dados.email || dados.Email || '',
            tel: dados.tel || dados.Telefone || dados.whatsapp || dados.whatsapp1 || '',
            dataNasc: dados.dataNasc || dados.dataNascimento || dados.data_nasc || dados.nascimento || '',
            cep: dados.cep || dados.CEP || '',
            endereco: dados.endereco || dados.Endereco || dados.rua || dados.ruaAv || '',
            numero: dados.numero || dados.Numero || dados.numeroCasa || '',
            bairro: dados.bairro || dados.Bairro || '',
            cidade: dados.cidade || dados.Cidade || '',
            estado: dados.estado || dados.Estado || ''
        };
    }

    function adjustShiftedProfile(profile) {
        if (!profile || typeof profile !== 'object') return profile;

        const looksLikeText = value => typeof value === 'string' && /[A-Za-zÀ-ú]/.test(value);
        const isEmail = value => typeof value === 'string' && /\S+@\S+\.\S+/.test(value);
        const isPhone = value => typeof value === 'string' && /^[+]?[0-9]{8,}$/.test(value.replace(/[^0-9]/g, ''));
        const looksLikeDateString = value => typeof value === 'string' && /GMT|Horário|UTC|\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2}/.test(value);
        const looksLikeCep = value => typeof value === 'string' && /\d{5}[- ]?\d{3}/.test(value);

        if (profile.nome && profile.email && profile.tel && profile.dataNasc && profile.cep && profile.endereco && profile.numero && profile.bairro && profile.cidade && profile.estado) {
            const nomeIsId = /^[0-9]+$/.test(String(profile.nome).trim());
            const emailIsName = looksLikeText(profile.email) && !isEmail(profile.email);
            const telIsEmail = isEmail(profile.tel);
            const dataNascIsPhone = isPhone(profile.dataNasc);
            const cepIsDate = looksLikeDateString(profile.cep);
            const enderecoIsCep = looksLikeCep(profile.endereco);
            const numeroIsAddress = looksLikeText(profile.numero);
            const bairroIsNumber = /^[0-9]+$/.test(String(profile.bairro).trim());

            if (nomeIsId && emailIsName && telIsEmail && dataNascIsPhone && cepIsDate && enderecoIsCep && numeroIsAddress && bairroIsNumber) {
                return {
                    nome: profile.email,
                    email: profile.tel,
                    tel: profile.dataNasc,
                    dataNasc: profile.cep,
                    cep: profile.endereco,
                    endereco: profile.numero,
                    numero: profile.bairro,
                    bairro: profile.cidade,
                    cidade: profile.estado,
                    estado: profile.estado
                };
            }
        }
        return profile;
    }

    function preencherDadosPerfil(dados) {
        const profile = adjustShiftedProfile(normalizeProfilePayload(dados));

        if (document.getElementById('editNome')) document.getElementById('editNome').value = profile.nome || '';
        if (document.getElementById('editEmail')) document.getElementById('editEmail').value = profile.email || usuarioEmail || '';
        if (document.getElementById('editTel')) document.getElementById('editTel').value = profile.tel || '';
        if (document.getElementById('editCep')) document.getElementById('editCep').value = profile.cep || '';
        if (document.getElementById('editDataNascimento')) document.getElementById('editDataNascimento').value = formatDateForInput(profile.dataNasc || '');
        if (document.getElementById('editEndereco')) document.getElementById('editEndereco').value = profile.endereco || '';
        if (document.getElementById('editNumero')) document.getElementById('editNumero').value = profile.numero || '';
        if (document.getElementById('editBairro')) document.getElementById('editBairro').value = profile.bairro || '';
        if (document.getElementById('editCidade')) document.getElementById('editCidade').value = profile.cidade || '';
        if (document.getElementById('editEstado')) document.getElementById('editEstado').value = (profile.estado || '').toString().substring(0, 2);
        if (document.getElementById('editSenha')) document.getElementById('editSenha').value = '';

        try { console.log('[painel] perfil final mapeado ->', profile); } catch (e) {}
    }

    async function carregarSaldosHome() {
        const containerHome = document.getElementById('resumoSaldosHome');
        if (!containerHome) return;

        try {
            const payload = {
                acao: 'carregarDashboardFinancas',
                emailCliente: usuarioEmail,
                tokenSessao: usuarioToken
            };
            const response = await API_CLIENT.post(CONFIG.APIS.FINANCAS, payload);
            const resultado = await response.json();
            if (resultado.status === 'sucesso' || resultado.success === true) {
                containerHome.innerHTML = '';
                if (!resultado.bancos || resultado.bancos.length === 0) {
                    containerHome.innerHTML = '<div style="color: var(--cor-texto-mutado); font-style: italic; grid-column: 1/-1;">Nenhuma conta ou banco cadastrado. Vá em "Minhas Finanças" para iniciar.</div>';
                    return;
                }
                resultado.bancos.forEach(banco => {
                    const box = document.createElement('div');
                    box.className = 'banco-item-box';
                    const valorSaldo = parseFloat(banco.saldo || 0);
                    const classeSaldo = valorSaldo >= 0 ? 'status-active' : '';
                    box.innerHTML = `
                        <span>💳 ${banco.nome}</span>
                        <strong class="${classeSaldo}">${valorSaldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                    `;
                    containerHome.appendChild(box);
                });
            } else {
                containerHome.innerHTML = `<div style="color: var(--cor-erro); font-size: 0.9rem; grid-column: 1/-1;">Erro ao ler saldos: ${resultado.mensagem || resultado.error || 'Resposta inválida.'}</div>`;
            }
        } catch (error) {
            console.error(error);
            containerHome.innerHTML = '<div style="color: var(--cor-erro); font-size: 0.9rem; grid-column: 1/-1;">Erro de conexão com o banco de dados.</div>';
        }
    }

    async function carregarPerfilConfiguracoes() {
        try {
            const payload = {
                acao: 'buscarCadastroCompleto',
                email: usuarioEmail,
                token: usuarioToken
            };
            const response = await API_CLIENT.post(CONFIG.APIS.PERFIL, payload);
            const resultado = await response.json();
            console.log('[painel] raw perfil resultado ->', resultado);
            if (resultado.status === 'sucesso' || resultado.success === true) {
                preencherDadosPerfil(resultado);
            } else {
                console.error('[painel] erro ao buscar perfil ->', resultado.mensagem || resultado.error);
            }
        } catch (error) {
            console.error('Falha ao obter perfil:', error);
        }
    }

    if (abaVisaoGeral) {
        abaVisaoGeral.addEventListener('click', (event) => {
            event.preventDefault();
            alternarAba(abaVisaoGeral, conteudoVisaoGeral, conteudoConfiguracoes, 'Bem-vindo ao seu painel de controle exclusivo.');
            carregarSaldosHome();
        });
    }

    if (abaConfiguracoes) {
        abaConfiguracoes.addEventListener('click', (event) => {
            event.preventDefault();
            alternarAba(abaConfiguracoes, conteudoConfiguracoes, conteudoVisaoGeral, 'Gerencie e atualize seus dados de cadastro.');
            carregarPerfilConfiguracoes();
        });
    }

    carregarSaldosHome();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('aba') === 'configuracoes' && abaConfiguracoes) {
        setTimeout(() => abaConfiguracoes.click(), 100);
    }

    const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');
    if (btnCancelarEdicao) {
        btnCancelarEdicao.addEventListener('click', () => {
            const form = document.getElementById('formAlterarDados');
            if (form) form.reset();
            alternarAba(abaVisaoGeral, conteudoVisaoGeral, conteudoConfiguracoes, 'Bem-vindo ao seu painel de controle exclusivo.');
        });
    }

    const formAlterarDados = document.getElementById('formAlterarDados');
    if (formAlterarDados) {
        formAlterarDados.addEventListener('submit', async (event) => {
            event.preventDefault();
            const btnSalvar = document.getElementById('btnSalvarEdicao');
            const textoOriginal = btnSalvar ? btnSalvar.textContent : 'Salvar Alterações';
            if (btnSalvar) {
                btnSalvar.textContent = 'Gravando...';
                btnSalvar.disabled = true;
            }

            const payloadAtualizacao = {
                acao: 'editarCadastroCliente',
                tokenSessao: usuarioToken,
                emailOriginal: usuarioEmail,
                nome: document.getElementById('editNome').value.trim(),
                email: document.getElementById('editEmail').value.trim(),
                tel: document.getElementById('editTel').value.trim(),
                cep: document.getElementById('editCep') ? document.getElementById('editCep').value.trim() : '',
                dataNasc: document.getElementById('editDataNascimento') ? document.getElementById('editDataNascimento').value : '',
                endereco: document.getElementById('editEndereco').value.trim(),
                numero: document.getElementById('editNumero').value.trim(),
                bairro: document.getElementById('editBairro').value.trim(),
                cidade: document.getElementById('editCidade').value.trim(),
                estado: document.getElementById('editEstado').value.trim().toUpperCase(),
                senha: document.getElementById('editSenha').value
            };

            try {
                const response = await API_CLIENT.post(CONFIG.APIS.PERFIL, payloadAtualizacao);
                const resultado = await response.json();
                console.log('[painel] resultado salvar perfil ->', resultado);
                if (resultado.status === 'sucesso' || resultado.success === true) {
                    window.alert('Seus dados foram atualizados com sucesso!');
                    AUTH.updateSession({ nome: payloadAtualizacao.nome });
                    if (document.getElementById('nomeUsuario')) document.getElementById('nomeUsuario').textContent = payloadAtualizacao.nome;
                    alternarAba(abaVisaoGeral, conteudoVisaoGeral, conteudoConfiguracoes, 'Bem-vindo ao seu painel de controle exclusivo.');
                } else {
                    window.alert('Erro: ' + (resultado.mensagem || resultado.error || 'Não foi possível atualizar os dados.'));
                }
            } catch (error) {
                console.error('Erro na requisição de perfil:', error);
                window.alert('Erro na comunicação com o servidor. Verifique sua conexão.');
            } finally {
                if (btnSalvar) {
                    btnSalvar.textContent = textoOriginal;
                    btnSalvar.disabled = false;
                }
            }
        });
    }

    const btnToggleDesktop = document.getElementById('btnToggleDesktop');
    const btnToggleMobile = document.getElementById('btnToggleMobile');
    if (btnToggleDesktop && panelContainer) {
        btnToggleDesktop.addEventListener('click', (event) => {
            event.preventDefault();
            panelContainer.classList.remove('mobile-menu-open');
            panelContainer.classList.toggle('sidebar-collapsed');
        });
    }
    if (btnToggleMobile && panelContainer) {
        btnToggleMobile.addEventListener('click', (event) => {
            event.preventDefault();
            panelContainer.classList.remove('sidebar-collapsed');
            panelContainer.classList.toggle('mobile-menu-open');
        });
    }

    const btnSair = document.getElementById('btnSair');
    if (btnSair) {
        btnSair.addEventListener('click', () => {
            AUTH.logout('Sessão encerrada com sucesso. Até logo!');
        });
    }
});