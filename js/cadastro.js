document.addEventListener('DOMContentLoaded', () => {
    const cadastroForm = document.getElementById('cadastroForm');

    // CONFIGURAÇÃO: Insira aqui a sua URL do Google Apps Script
    const URL_API_CADASTRO = 'https://script.google.com/macros/s/AKfycbwt1gFXmLpnYgix_Jb4iuqj7-4Zx3nuPSUNybCWZDHU37TdEasso0w5PNxmzduavZHi/exec';

    cadastroForm.addEventListener('submit', async (event) => {
        // Bloqueia IMEDIATAMENTE qualquer tentativa do navegador de recarregar a página
        event.preventDefault();
        event.stopPropagation();

        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const tel = document.getElementById('tel').value.trim();
        const endereco = document.getElementById('endereco').value.trim();
        const numero = document.getElementById('numero').value.trim();
        const bairro = document.getElementById('bairro').value.trim();
        const cidade = document.getElementById('cidade').value.trim();
        const estado = document.getElementById('estado').value.trim().toUpperCase();
        const senha = document.getElementById('senha').value;
        const confirmaSenha = document.getElementById('confirmaSenha').value;

        if (senha !== confirmaSenha) {
            alert('Atenção: As senhas digitadas não são iguais.');
            return false;
        }

        const btnCadastro = cadastroForm.querySelector('.btn-cadastro');
        const textoOriginalBotao = btnCadastro.textContent;
        btnCadastro.textContent = 'Processando Cadastro...';
        btnCadastro.disabled = true;

        try {
            const payload = {
                nome: nome,
                email: email,
                tel: tel,
                endereco: endereco,
                numero: numero,
                bairro: bairro,
                cidade: cidade,
                estado: estado,
                senha: senha
            };

            const response = await fetch(URL_API_CADASTRO, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Falha no servidor.');
            }

            const resultado = await response.json();

            if (resultado.status === 'sucesso') {
                window.alert('Cadastro realizado com sucesso! Sua planilha individual foi criada.');

                cadastroForm.reset();

                // Cria um link invisível em tempo de execução para burlar o bloqueio local do navegador
                const linkSeguro = document.createElement('a');
                linkSeguro.href = 'login.html';

                // Adiciona o link no documento, clica nele programaticamente e o remove
                document.body.appendChild(linkSeguro);
                linkSeguro.click();
                document.body.removeChild(linkSeguro);
            }


        } catch (error) {
            console.error('Erro:', error);
            alert('Ocorreu um erro ao conectar com o servidor. Tente novamente.');
            btnCadastro.textContent = textoOriginalBotao;
            btnCadastro.disabled = false;
        }

        return false; // Garantia extra contra o envio do formulário
    });
});
