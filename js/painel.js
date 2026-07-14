document.addEventListener('DOMContentLoaded', () => {
    // 1. VERIFICAÇÃO DE SEGURANÇA IMEDIATA
    // Recupera as informações de autenticação salvas no navegador durante o login
    const usuarioNome = localStorage.getItem('usuario_nome');
    const usuarioEmail = localStorage.getItem('usuario_email');
    const usuarioToken = localStorage.getItem('usuario_token');

    // Se qualquer um dos dados cruciais estiver faltando, barra o acesso imediatamente
    if (!usuarioNome || !usuarioEmail || !usuarioToken) {
        window.alert('Acesso negado: Você precisa realizar o login para acessar esta página.');
        
        // Estratégia de link seguro dinâmico para garantir o redirecionamento local (file://)
        const linkRetorno = document.createElement('a');
        linkRetorno.href = 'login.html';
        document.body.appendChild(linkRetorno);
        linkRetorno.click();
        return; // Interrompe qualquer processamento restante do script
    }

    // 2. EXIBIÇÃO DINÂMICA DOS DADOS NO PAINEL
    // Caso o usuário passe no teste de segurança, insere os dados dele na tela
    document.getElementById('nomeUsuario').textContent = usuarioNome;
    document.getElementById('emailUsuario').textContent = usuarioEmail;
    document.getElementById('tokenUsuario').textContent = usuarioToken;

    // Remove qualquer classe visual de erro do campo do token e deixa estilizado
    const campoToken = document.getElementById('tokenUsuario');
    campoToken.classList.remove('status-active'); // Limpa estilos residuais se houver

    // 3. GERENCIAMENTO DE LOGOUT (SAIR DO SISTEMA)
    const btnSair = document.getElementById('btnSair');
    
    btnSair.addEventListener('click', () => {
        // Limpa totalmente a memória do navegador relacionada a este login
        localStorage.removeItem('usuario_nome');
        localStorage.removeItem('usuario_email');
        localStorage.removeItem('usuario_token');

        window.alert('Sessão encerrada com sucesso. Até logo!');

        // Cria o link dinâmico para garantir a ejeção segura para a página de login
        const linkLogout = document.createElement('a');
        linkLogout.href = 'login.html';
        document.body.appendChild(linkLogout);
        linkLogout.click();
    });
});
