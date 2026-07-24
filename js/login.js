document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const linkEsqueceu = document.getElementById('linkEsqueceu') || document.querySelector('.forgot-password');
    const modalRecuperar = document.getElementById('modalRecuperar');
    const btnFecharModal = document.getElementById('btnFecharModal');
    const recuperarForm = document.getElementById('recuperarForm');

    // CONFIGURAÇÃO CENTRAL: URL exata da API do Apps Script principal

    // Preencher o campo de e-mail caso venha de um cadastro recente (melhora UX)
    try {
        const prefill = localStorage.getItem('prefill_email');
        if (prefill) {
            const emailInput = document.getElementById('email');
            if (emailInput) emailInput.value = prefill;
            localStorage.removeItem('prefill_email');
        }
    } catch (e) { /* ignore */ }

    // Se houver credenciais temporárias para auto-login (apenas para teste), preencher e submeter o formulário
    try {
        const creds = sessionStorage.getItem('autologin_cred');
        if (creds && loginForm) {
            const parsed = JSON.parse(creds);
            if (parsed.email) {
                const emailInput = document.getElementById('email');
                if (emailInput) emailInput.value = parsed.email;
            }
            if (parsed.senha) {
                const senhaInput = document.getElementById('senha');
                if (senhaInput) senhaInput.value = parsed.senha;
            }

            // Remover as credenciais sensíveis após uso
            sessionStorage.removeItem('autologin_cred');

            // Aguarda curto período para o usuário ver o preenchimento (ou ver logs) e dispara o submit automático
            setTimeout(() => {
                try {
                    if (typeof loginForm.requestSubmit === 'function') {
                        loginForm.requestSubmit();
                    } else {
                        const btn = loginForm.querySelector('button[type="submit"]');
                        if (btn) btn.click();
                        else loginForm.dispatchEvent(new Event('submit', { cancelable: true }));
                    }
                } catch (e) { console.warn('Auto-submit falhou', e); }
            }, 600);
        }
    } catch (e) { /* ignore */ }

    // 0. TOGGLE DE SENHA (MOSTRAR/OCULTAR)
    const toggleSenhaLogin = document.getElementById('toggleSenhaLogin');
    const senhaInput = document.getElementById('senha');
    if (toggleSenhaLogin && senhaInput) {
        toggleSenhaLogin.addEventListener('click', () => {
            const type = senhaInput.getAttribute('type') === 'password' ? 'text' : 'password';
            senhaInput.setAttribute('type', type);
        });
    }

    // 1. EVENTO DE AUTENTICAÇÃO (LOGIN)
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value.trim().toLowerCase();
            const senha = document.getElementById('senha').value.trim();

            if (!email || !senha) {
                alert('Por favor, preencha todos os campos.');
                return;
            }

            const btnLogin = loginForm.querySelector('.btn-login');
            const textoOriginalBotao = btnLogin ? btnLogin.textContent : 'Entrar';

            if (btnLogin) {
                btnLogin.textContent = 'Autenticando...';
                btnLogin.disabled = true;
            }

            try {
                const payload = { acao: 'login', email: email, senha: senha };
                console.log('[login] payload ->', payload);
                const response = await API_CLIENT.post(CONFIG.APIS.LOGIN, payload);
                console.log('[login] fetch response (raw) ->', response);

                const status = response.status;
                const type = response.type;

                // Logs adicionais para depuração: status, ok, type e headers relevantes
                try {
                    console.log('[login] response.ok ->', response.ok);
                    console.log('[login] response.status ->', response.status, 'statusText ->', response.statusText);
                    console.log('[login] response.type ->', response.type);
                    try {
                        console.log('[login] response.headers content-type ->', response.headers.get('content-type'));
                        console.log('[login] response.headers access-control-allow-origin ->', response.headers.get('access-control-allow-origin'));
                    } catch (hdrErr) {
                        console.warn('[login] não foi possível ler response.headers (pode ser uma resposta opaque por CORS):', hdrErr);
                    }
                } catch (logErr) {
                    console.warn('[login] erro ao logar metadados da resposta:', logErr);
                }

                // Lê como texto para permitir debug mesmo quando a resposta não for JSON (opaque)
                const bodyText = await response.text();
                console.log('[login] response body text ->', bodyText);

                let resultado = null;
                try {
                    resultado = bodyText ? JSON.parse(bodyText) : null;
                } catch (e) {
                    console.warn('[login] não foi possível parsear JSON da resposta:', e);
                }

                if (resultado && (resultado.status === 'sucesso' || resultado.success === true)) {
                    try { AUTH.setSession(resultado.usuario); } catch (e) { console.warn('Falha ao setar sessão', e); }
                    alert('Login realizado com sucesso!');
                    window.location.href = 'painel.html';
                } else {
                    const serverMsg = (resultado && (resultado.mensagem || resultado.error)) || bodyText || (`HTTP ${status} (${type})`);
                    alert('Credenciais inválidas ou erro no servidor: ' + serverMsg);
                    console.error('[login] falha de autenticação:', serverMsg, resultado);
                    if (btnLogin) {
                        btnLogin.textContent = textoOriginalBotao;
                        btnLogin.disabled = false;
                    }
                }
            } catch (error) {
                console.error('Erro na requisição de login:', error);
                alert('Erro de conexão ao tentar fazer login. Verifique os servidores da API. Verifique o Console para mais detalhes.');
                if (btnLogin) {
                    btnLogin.textContent = textoOriginalBotao;
                    btnLogin.disabled = false;
                }
            }
        });
    }
    // 2. CONTROLE DO MODAL FLUTUANTE (RECUPERAÇÃO DE SENHA)
    if (linkEsqueceu) {
        linkEsqueceu.addEventListener('click', (e) => {
            e.preventDefault();
            if (modalRecuperar) {
                modalRecuperar.style.display = 'flex'; // Alinhado com o login.html oficial
            }
        });
    }

    if (btnFecharModal) {
        btnFecharModal.addEventListener('click', () => {
            if (modalRecuperar) {
                modalRecuperar.style.display = 'none';
            }
            if (recuperarForm) {
                recuperarForm.reset();
            }
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modalRecuperar) {
            modalRecuperar.style.display = 'none';
            if (recuperarForm) {
                recuperarForm.reset();
            }
        }
    });

    // 3. ENVIO DA SOLICITAÇÃO DE RECUPERAÇÃO (CÓDIGO DE 6 DÍGITOS)
    if (recuperarForm) {
        recuperarForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailRecuperar = document.getElementById('emailRecuperar').value.trim();
            const btnEnviarRecuperar = document.getElementById('btnEnviarRecuperar');

            if (btnEnviarRecuperar) {
                btnEnviarRecuperar.textContent = 'Enviando e-mail...';
                btnEnviarRecuperar.disabled = true;
            }

            try {
                const payload = { acao: 'recuperar', email: emailRecuperar };
                const response = await API_CLIENT.post(CONFIG.APIS.LOGIN, payload);

                const resultado = await response.json();

                if (resultado.status === 'sucesso' || resultado.success === true) {
                    window.alert('Um código de verificação de 6 dígitos foi enviado para o seu e-mail cadastrado. Use-o na página de redefinição para atualizar sua senha.');

                    if (modalRecuperar) {
                        modalRecuperar.style.display = 'none';
                    }
                    recuperarForm.reset();

                    // Redirecionamento automático e fluido para a tela de inserção do código
                    const linkProximaEtapa = document.createElement('a');
                    linkProximaEtapa.href = 'nova-senha.html';
                    document.body.appendChild(linkProximaEtapa);
                    linkProximaEtapa.click();
                    document.body.removeChild(linkProximaEtapa);
                } else {
                    alert(resultado.mensagem || resultado.error || 'O e-mail informado não foi localizado no sistema.');
                }
            } catch (error) {
                console.error('Erro na requisição de recuperação:', error);
                alert('Erro técnico ou falha de rede ao processar a recuperação.');
            } finally {
                if (btnEnviarRecuperar) {
                    btnEnviarRecuperar.textContent = 'Enviar Solicitação';
                    btnEnviarRecuperar.disabled = false;
                }
            }
        });
    }
});
