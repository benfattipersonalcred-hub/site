document.addEventListener('DOMContentLoaded', () => {
    console.log('[cadastro] script loaded v20260722');
    const cadastroForm = document.getElementById('cadastroForm');

    // CONFIGURAÇÃO: URL exata da API do seu Google Apps Script (Módulo Cadastro)

    if (cadastroForm) {
        const btnCadastro = cadastroForm.querySelector('.btn-cadastro');
        
        async function processCadastro(event) {
            if (event && typeof event.preventDefault === 'function') {
                event.preventDefault();
                event.stopPropagation();
            }
            console.log('[cadastro] processCadastro started');

            const nome = document.getElementById('nome').value.trim();
            const email = document.getElementById('email').value.trim().toLowerCase();            const tel = document.getElementById('tel').value.trim();
            const dataNascimento = document.getElementById('dataNascimento').value.trim();
            const cep = document.getElementById('cep').value.trim();
            const endereco = document.getElementById('endereco').value.trim();
            const numero = document.getElementById('numero').value.trim();
            const bairro = document.getElementById('bairro').value.trim();
            const cidade = document.getElementById('cidade').value.trim();
            const estado = document.getElementById('estado').value.trim().toUpperCase();
            const senha = document.getElementById('senha').value.trim();
            const confirmaSenha = document.getElementById('confirmaSenha').value.trim();

            // Validação física de igualdade antes de gastar requisição de rede
            if (senha !== confirmaSenha) {
                alert('Atenção: As senhas digitadas não são iguais.');
                return false;
            }

            const textoOriginalBotao = btnCadastro ? btnCadastro.textContent : 'Finalizar Cadastro';

            if (btnCadastro) {
                btnCadastro.textContent = 'Processando Cadastro...';
                btnCadastro.disabled = true;
            }
            try {
                // Payload estruturado com o parâmetro de ação exigido pela API do Sheets
                const payload = {
                    acao: 'cadastro',
                    nome: nome,
                    email: email,
                    tel: tel,
                    dataNascimento: dataNascimento,
                    cep: cep,
                    endereco: endereco,
                    numero: numero,
                    bairro: bairro,
                    cidade: cidade,
                    estado: estado,
                    senha: senha
                };

                console.log('[cadastro] payload ->', payload);
                const response = await API_CLIENT.post(CONFIG.APIS.CADASTRO, payload);
                const responseText = await response.text();
                let resultado = null;
                try {
                    resultado = responseText ? JSON.parse(responseText) : null;
                } catch (e) {
                    console.warn('[cadastro] falha ao parsear JSON da resposta:', e, responseText);
                }
                console.log('[cadastro] resposta raw do cadastro ->', responseText);
                console.log('[cadastro] objeto resultado do cadastro ->', resultado);
                console.log('[cadastro] response.ok ->', response.ok, 'status ->', response.status, 'statusText ->', response.statusText);

                const normalizedStatus = resultado && resultado.status ? String(resultado.status).toLowerCase() : '';
                const successFlag = (normalizedStatus === 'sucesso' || normalizedStatus === 'success') || (resultado && (resultado.success === true || resultado.success === 'true'));

                console.log('[cadastro] successFlag ->', successFlag);
                const loginUrl = new URL('login.html', window.location.href).href;
                const redirectToLogin = () => {
                    console.log('[cadastro] redirectToLogin ->', loginUrl);
                    // multiple strategies to ensure navigation works across browsers
                    try { window.location.assign(loginUrl); } catch (e) { console.warn('[cadastro] assign failed', e); }
                    try { window.location.href = loginUrl; } catch (e) { console.warn('[cadastro] href failed', e); }
                    setTimeout(() => {
                        try { window.location.replace(loginUrl); } catch (e) { console.warn('[cadastro] replace failed', e); }
                    }, 200);
                };

                if (successFlag) {
                    console.log('[cadastro] branch sucesso acionada');
                    // Prefer showing an inline message instead of relying solely on alert (some browsers block alerts)
                    try {
                        const banner = document.createElement('div');
                        banner.textContent = 'Cadastro realizado com sucesso! Redirecionando para login...';
                        banner.style.position = 'fixed';
                        banner.style.top = '10px';
                        banner.style.left = '50%';
                        banner.style.transform = 'translateX(-50%)';
                        banner.style.background = '#0b8457';
                        banner.style.color = '#fff';
                        banner.style.padding = '10px 20px';
                        banner.style.borderRadius = '6px';
                        banner.style.zIndex = 9999;
                        document.body.appendChild(banner);
                    } catch (e) { console.warn('[cadastro] não foi possível mostrar banner', e); }

                    try { cadastroForm.reset(); } catch(e){}
                    try { localStorage.setItem('prefill_email', email); } catch (e) { console.warn('[cadastro] falha ao gravar prefill_email', e); }

                    console.log('[cadastro] iniciando redirecionamento para login');
                    redirectToLogin();
                    return;
                }
                // Trata o erro retornado pela lógica interna do Apps Script (ex: E-mail duplicado)
                alert(resultado.mensagem || resultado.error || 'Não foi possível concluir o cadastro. Verifique os dados fornecidos.');
                if (btnCadastro) {
                    btnCadastro.textContent = textoOriginalBotao;
                    btnCadastro.disabled = false;
                }

            } catch (error) {
                console.error('Erro no processamento do cadastro:', error);
                alert('Ocorreu um erro ao conectar com o servidor. Verifique sua conexão e tente novamente.');
                if (btnCadastro) {
                    btnCadastro.textContent = textoOriginalBotao;
                    btnCadastro.disabled = false;
                }
            }

            return false; // Bloqueio definitivo em navegadores legados
        }

        // Bind both submit and explicit click to make navigation robust
        cadastroForm.addEventListener('submit', processCadastro);
        if (btnCadastro) btnCadastro.addEventListener('click', processCadastro);
    }
});
