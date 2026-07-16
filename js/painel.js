document.addEventListener('DOMContentLoaded', () => {
    // 1. VERIFICAÇÃO DE SEGURANÇA IMEDIATA
    const usuarioNome = localStorage.getItem('usuario_nome');
    const usuarioEmail = localStorage.getItem('usuario_email');
    const usuarioToken = localStorage.getItem('usuario_token');

    if (!usuarioNome || !usuarioEmail || !usuarioToken) {
        window.alert('Acesso negado: Você precisa realizar o login para acessar esta página.');
        
        const linkRetorno = document.createElement('a');
        linkRetorno.href = 'login.html';
        document.body.appendChild(linkRetorno);
        linkRetorno.click();
        return;
    }

    // 2. EXIBIÇÃO DINÂMICA DOS DADOS NO PAINEL
    document.getElementById('nomeUsuario').textContent = usuarioNome;
    document.getElementById('emailUsuario').textContent = usuarioEmail;
    document.getElementById('tokenUsuario').textContent = usuarioToken;

    // 3. CAPTURA DOS BOTÕES EM SVG NATIVOS (MUDANÇA DE ESTRUTURA)
    const btnToggleDesktop = document.getElementById('btnToggleDesktop');
    const btnToggleMobile = document.getElementById('btnToggleMobile');
    const panelContainer = document.getElementById('panelContainer');

    // Clique no modo Computador (Desktop)
    if (btnToggleDesktop && panelContainer) {
        btnToggleDesktop.addEventListener('click', (e) => {
            e.preventDefault();
            panelContainer.classList.remove('mobile-menu-open');
            panelContainer.classList.toggle('sidebar-collapsed');
        });
    }

    // Clique no modo Celular (Abre a gaveta flutuante por cima sem esmagar o texto)
    if (btnToggleMobile && panelContainer) {
        btnToggleMobile.addEventListener('click', (e) => {
            e.preventDefault();
            panelContainer.classList.remove('sidebar-collapsed');
            panelContainer.classList.toggle('mobile-menu-open');
        });
    }

    // 4. GERENCIAMENTO DE LOGOUT
    const btnSair = document.getElementById('btnSair');
    
    if (btnSair) {
        btnSair.addEventListener('click', () => {
            localStorage.removeItem('usuario_nome');
            localStorage.removeItem('usuario_email');
            localStorage.removeItem('usuario_token');

            window.alert('Sessão encerrada com sucesso. Até logo!');

            const linkLogout = document.createElement('a');
            linkLogout.href = 'login.html';
            document.body.appendChild(linkLogout);
            linkLogout.click();
        });
    }
});
