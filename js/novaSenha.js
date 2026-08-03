document.addEventListener('DOMContentLoaded', () => {
    // Busca o formulário alinhado com o ID definido no arquivo nova-senha.html
    const formNovaSenha = document.getElementById('novaSenhaForm') || document.getElementById('formNovaSenha');
    
    // CONFIGURAÇÃO CENTRAL: URL estável de deploy do seu Google Apps Script

    if (formNovaSenha) {
        formNovaSenha.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // IDs de inputs ajustados e sincronizados fielmente com o arquivo nova-senha.html oficial
            const email = document.getElementById('emailReset').value.trim();
            const codigo = document.getElementById('codigoReset').value.trim();
            const novaSenha = document.getElementById('novaSenha').value;
            const confirmaSenha = document.getElementById('confirmaNovaSenha') ? document.getElementById('confirmaNovaSenha').value : '';
            const btnReset = document.getElementById('btnSalvarSenha');

            // Validação física de confirmação local antes do disparo de rede
            if (confirmaSenha && novaSenha !== confirmaSenha) {
                alert('Atenção: A nova senha e a confirmação digitadas não coincidem!');
                return;
            }

            if (!email || !codigo || !novaSenha) {
                alert('Preencha os campos obrigatórios para redefinir sua senha.');
                return;
            }

            const textoOriginal = btnReset ? btnReset.textContent : 'Atualizar Senha';
            if (btnReset) {
                btnReset.textContent = 'Salvando Nova Senha...';
                btnReset.disabled = true;
            }

            // Payload contendo redundância de chaves (token/codigo) para total compatibilidade com o .gs
            const payload = { 
                acao: 'definirNovaSenha', 
                email: email, 
                token: codigo,
                codigo: codigo, 
                novaSenha: novaSenha 
            };

            try {
                const response = await API_CLIENT.post(CONFIG.APIS.LOGIN, payload);
                
                const resultado = await response.json();

                // Validação de resposta flexível mapeando o retorno estruturado do back-end
                if (resultado.success === true || resultado.status === 'sucesso') {
                    window.alert('Sua senha foi redefinida com sucesso! Você já pode acessar a sua conta com as novas credenciais.');
                    
                    // Roteamento inteligente e seguro compatível com o GitHub Pages
                    const linkRetorno = document.createElement('a');
                    linkRetorno.href = 'login.html';
                    document.body.appendChild(linkRetorno);
                    linkRetorno.click();
                    document.body.removeChild(linkRetorno);
                } else {
                    alert(resultado.mensagem || resultado.error || 'Código ou e-mail inválido. Verifique os dados inseridos.');
                    if (btnReset) {
                        btnReset.textContent = textoOriginal;
                        btnReset.disabled = false;
                    }
                }
            } catch (err) {
                console.error('Erro na requisição de redefinição:', err);
                alert('Falha crítica de comunicação com o servidor. Verifique sua conexão.');
                if (btnReset) {
                    btnReset.textContent = textoOriginal;
                    btnReset.disabled = false;
                }
            }
        });
    }
});
