document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const linkEsqueceu = document.querySelector('.forgot-password');
    const modalRecuperar = document.getElementById('modalRecuperar');
    const btnFecharModal = document.getElementById('btnFecharModal');
    const recuperarForm = document.getElementById('recuperarForm');

    // CONFIGURAÇÃO CENTRAL: Cole aqui a URL gerada na Nova Implantação do seu Apps Script
    const URL_API_GOOGLE = 'https://script.google.com/macros/s/AKfycbzVZtaEXorUW7qnxCDOejv8DrIlxE1ffm_ARnVCJ0ZyPuLkTD2cn6g38hKOxDUOGkY_Ig/exec';

    // 1. EVENTO DE LOGIN
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value.trim();
            const senha = document.getElementById('senha').value;

            if (!email || !senha) {
                alert('Por favor, preencha todos os campos.');
                return;
            }

            const btnLogin = loginForm.querySelector('.btn-login');
            const textoOriginalBotao = btnLogin.textContent;
            btnLogin.textContent = 'Autenticando...';
            btnLogin.disabled = true;

            try {
                const payload = { acao: 'login', email: email, senha: senha };
                const response = await fetch(URL_API_GOOGLE, {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });

                const resultado = await response.json();

                if (resultado.status === 'sucesso') {
                    localStorage.setItem('usuario_nome', resultado.usuario.nome);
                    localStorage.setItem('usuario_email', resultado.usuario.email);
                    localStorage.setItem('usuario_token', resultado.usuario.token);
                    
                    alert('Login realizado com sucesso!');
                    window.location.href = 'painel.html';
                } else {
                    alert(resultado.mensagem);
                    btnLogin.textContent = textoOriginalBotao;
                    btnLogin.disabled = false;
                }
            } catch (error) {
                console.error(error);
                alert('Erro de conexão ao tentar fazer login.');
                btnLogin.textContent = textoOriginalBotao;
                btnLogin.disabled = false;
            }
        });
    }

    // 2. CONTROLE DO MODAL FLUTUANTE
    if (linkEsqueceu) {
        linkEsqueceu.addEventListener('click', (e) => {
            e.preventDefault();
            if (modalRecuperar) modalRecuperar.classList.add('active');
        });
    }

    if (btnFecharModal) {
        btnFecharModal.addEventListener('click', () => {
            if (modalRecuperar) modalRecuperar.classList.remove('active');
            if (recuperarForm) recuperarForm.reset();
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modalRecuperar) {
            modalRecuperar.classList.remove('active');
            if (recuperarForm) recuperarForm.reset();
        }
    });

    // 3. ENVIO DA SOLICITAÇÃO DE RECUPERAÇÃO
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
                const response = await fetch(URL_API_GOOGLE, {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });

                const resultado = await response.json();

                if (resultado.status === 'sucesso') {
                    window.alert('Um link seguro de redefinição de senha foi enviado para o seu e-mail cadastrado. Verifique sua caixa de entrada ou spam.');
                    modalRecuperar.classList.remove('active');
                    recuperarForm.reset();
                } else {
                    alert(resultado.mensagem);
                }
            } catch (error) {
                console.error(error);
                alert('Erro técnico ao processar recuperação.');
            } finally {
                if (btnEnviarRecuperar) {
                    btnEnviarRecuperar.textContent = 'Enviar Solicitação';
                    btnEnviarRecuperar.disabled = false;
                }
            }
        });
    }
});
