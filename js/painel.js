document.addEventListener('DOMContentLoaded', () => {
    // 1. VERIFICAÇÃO DE SEGURANÇA IMEDIATA (LÊ A SESSÃO DO BROWSER)
    const usuarioNome = localStorage.getItem('usuario_nome');
    const usuarioEmail = localStorage.getItem('usuario_email');
    const usuarioToken = localStorage.getItem('usuario_token');

    // CONFIGURAÇÃO DE URLS DE ENDPOINTS DE APIS DO APPS SCRIPT
    const URL_API_PERFIL = 'https://script.google.com/macros/s/AKfycbw6hiKqVeu-ruqF1jKHVfEoZ8ET0G00Dk5AF4cxbg0fV3P8iCKlgx27gpgkXRrrWBNU/exec';
    const URL_API_FINANCAS = 'https://script.google.com/macros/s/AKfycbwB9a7_UA6eG8gfYK6wx_gG2Asw9RhK7PXk0xcUWnWLjLX1kRIvim0sKIyX3V4wGB1Y/exec'; // API de Finanças

    if (!usuarioNome || !usuarioEmail || !usuarioToken) {
        window.alert('Acesso negado: Você precisa realizar o login para acessar esta página.');
        window.location.href = 'login.html';
        return;
    }

    // EXIBIÇÃO INICIAL DOS DADOS NOS CARDS SUPERIORES
    document.getElementById('nomeUsuario').textContent = usuarioNome;
    document.getElementById('emailUsuario').textContent = usuarioEmail;
    document.getElementById('tokenUsuario').textContent = usuarioToken;

    // 2. CAPTURA DE ELEMENTOS DE NAVEGAÇÃO INTERNA
    const abaVisaoGeral = document.getElementById('abaVisaoGeral');
    const abaConfiguracoes = document.getElementById('abaConfiguracoes');
    const conteudoVisaoGeral = document.getElementById('conteudoVisaoGeral');
    const conteudoConfiguracoes = document.getElementById('conteudoConfiguracoes');
    const subtituloPainel = document.getElementById('subtituloPainel');
    const panelContainer = document.getElementById('panelContainer');

    // CONTROLADOR DE ALTERNÂNCIA DE TELAS Internas
    function alternarAba(abaAtivar, conteudoMostrar, conteudoEsconder, textoSubtitulo) {
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
        abaAtivar.classList.add('active');
        conteudoMostrar.style.display = 'block';
        conteudoEsconder.style.display = 'none';
        subtituloPainel.textContent = textoSubtitulo;
        panelContainer.classList.remove('mobile-menu-open');
    }

    if (abaVisaoGeral) {
        abaVisaoGeral.addEventListener('click', (e) => {
            e.preventDefault();
            alternarAba(abaVisaoGeral, conteudoVisaoGeral, conteudoConfiguracoes, 'Bem-vindo ao seu painel de controle exclusivo.');
            carregarSaldosHome(); // Recarrega os saldos se voltar para a Home
        });
    }
    // 3. ADICIONADO: BUSCA OS SALDOS NO MICROSSERVIÇO FINANCEIRO E INJETA NA ÁREA DESTACADA
    async function carregarSaldosHome() {
        const containerHome = document.getElementById('resumoSaldosHome');
        if (!containerHome) return;

        try {
            const payload = {
                acao: 'carregarDashboardFinancas',
                emailCliente: usuarioEmail,
                tokenSessao: usuarioToken
            };

            const response = await fetch(URL_API_FINANCAS, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });
            const resultado = await response.json();

            if (resultado.status === 'sucesso') {
                containerHome.innerHTML = ''; // Limpa o texto de carregando

                if (resultado.bancos.length === 0) {
                    containerHome.innerHTML = '<div style="color: var(--cor-texto-mutado); font-style: italic;">Nenhuma conta ou banco cadastrado. Vá em "Minhas Finanças" para iniciar.</div>';
                    return;
                }

                // Renderiza cada banco/carteira dinamicamente com box estilizada
                resultado.bancos.forEach(banco => {
                    const box = document.createElement('div');
                    box.className = 'banco-item-box';
                    const classeSaldo = banco.saldo >= 0 ? 'status-active' : '';

                    box.innerHTML = `
                        <span>💳 ${banco.nome}</span>
                        <strong class="${classeSaldo}">${banco.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                    `;
                    containerHome.appendChild(box);
                });
            } else {
                containerHome.innerHTML = `<div style="color: var(--cor-erro); font-size: 0.9rem;">Erro ao ler saldos: ${resultado.mensagem}</div>`;
            }
        } catch (err) {
            console.error(err);
            containerHome.innerHTML = '<div style="color: var(--cor-erro); font-size: 0.9rem;">Erro de conexão com o banco de dados.</div>';
        }
    }

    // Executa a carga dos saldos na Home assim que o painel abre
    carregarSaldosHome();

    // 4. DISPARA A REQUISIÇÃO DE PERFIL AO CLICAR EM CONFIGURAÇÕES
    if (abaConfiguracoes) {
        abaConfiguracoes.addEventListener('click', async (e) => {
            e.preventDefault();
            alternarAba(abaConfiguracoes, conteudoConfiguracoes, conteudoVisaoGeral, 'Gerencie e atualize seus dados de cadastro.');

            try {
                const payload = { acao: 'buscarCadastroCompleto', email: usuarioEmail, token: usuarioToken };
                const response = await fetch(URL_API_PERFIL, {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });
                const resultado = await response.json();

                if (resultado.status === 'sucesso') {
                    document.getElementById('editNome').value = resultado.dados.nome;
                    document.getElementById('editEmail').value = resultado.dados.email;
                    document.getElementById('editTel').value = resultado.dados.tel;
                    document.getElementById('editEndereco').value = resultado.dados.endereco;
                    document.getElementById('editNumero').value = resultado.dados.numero;
                    document.getElementById('editBairro').value = resultado.dados.bairro;
                    document.getElementById('editCidade').value = resultado.dados.cidade;
                    document.getElementById('editEstado').value = resultado.dados.estado;
                    document.getElementById('editSenha').value = '';
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    // BOTÃO CANCELAR DO FORMULÁRIO DE PERFIL
    const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');
    if (btnCancelarEdicao) {
        btnCancelarEdicao.addEventListener('click', () => {
            document.getElementById('formAlterarDados').reset();
            alternarAba(abaVisaoGeral, conteudoVisaoGeral, conteudoConfiguracoes, 'Bem-vindo ao seu painel de controle exclusivo.');
        });
    }

    // ENVIO DO FORMULÁRIO DE ATUALIZAÇÃO DO PERFIL
    const formAlterarDados = document.getElementById('formAlterarDados');
    if (formAlterarDados) {
        formAlterarDados.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnSalvar = document.getElementById('btnSalvarEdicao');
            const textoOriginal = btnSalvar.textContent;
            btnSalvar.textContent = 'Gravando...';
            btnSalvar.disabled = true;

            const payloadAtualizacao = {
                acao: 'editarCadastroCliente',
                tokenSessao: usuarioToken,
                emailOriginal: usuarioEmail,
                nome: document.getElementById('editNome').value.trim(),
                email: document.getElementById('editEmail').value.trim(),
                tel: document.getElementById('editTel').value.trim(),
                endereco: document.getElementById('editEndereco').value.trim(),
                numero: document.getElementById('editNumero').value.trim(),
                bairro: document.getElementById('editBairro').value.trim(),
                cidade: document.getElementById('editCidade').value.trim(),
                estado: document.getElementById('editEstado').value.trim().toUpperCase(),
                senha: document.getElementById('editSenha').value
            };

            try {
                const response = await fetch(URL_API_PERFIL, {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payloadAtualizacao)
                });
                const resultado = await response.json();

                if (resultado.status === 'sucesso') {
                    window.alert('Seus dados foram atualizados com sucesso!');
                    localStorage.setItem('usuario_nome', payloadAtualizacao.nome);
                    document.getElementById('nomeUsuario').textContent = payloadAtualizacao.nome;
                    alternarAba(abaVisaoGeral, conteudoVisaoGeral, conteudoConfiguracoes, 'Bem-vindo ao seu painel de controle exclusivo.');
                } else {
                    alert('Erro: ' + resultado.mensagem);
                }
            } catch (err) {
                console.error(err);
                alert('Erro na comunicação com o servidor.');
            } finally {
                btnSalvar.textContent = textoOriginal;
                btnSalvar.disabled = false;
            }
        });
    }

    // 5. EVENTOS DE TOGGLE DA SIDEBAR (DESKTOP E MOBILE)
    const btnToggleDesktop = document.getElementById('btnToggleDesktop');
    const btnToggleMobile = document.getElementById('btnToggleMobile');

    if (btnToggleDesktop && panelContainer) {
        btnToggleDesktop.addEventListener('click', (e) => {
            e.preventDefault();
            panelContainer.classList.remove('mobile-menu-open');
            panelContainer.classList.toggle('sidebar-collapsed');
        });
    }

    if (btnToggleMobile && panelContainer) {
        btnToggleMobile.addEventListener('click', (e) => {
            e.preventDefault();
            panelContainer.classList.remove('sidebar-collapsed');
            panelContainer.classList.toggle('mobile-menu-open');
        });
    }

    // 6. EVENTO DE LOGOUT (SAIR)
    const btnSair = document.getElementById('btnSair');
    if (btnSair) {
        btnSair.addEventListener('click', () => {
            localStorage.removeItem('usuario_nome');
            localStorage.removeItem('usuario_email');
            localStorage.removeItem('usuario_token');
            window.alert('Sessão encerrada com sucesso. Até logo!');
            window.location.href = 'login.html';
        });
    }
});
