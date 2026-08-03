const AUTH = Object.freeze({
    getSession() {
        return {
            nome: localStorage.getItem('usuario_nome'),
            email: localStorage.getItem('usuario_email'),
            token: localStorage.getItem('usuario_token')
        };
    },

    setSession(usuario) {
        localStorage.setItem('usuario_nome', usuario.nome);
        localStorage.setItem('usuario_email', usuario.email);
        localStorage.setItem('usuario_token', usuario.token);
    },

    updateSession(dados) {
        if (dados.nome !== undefined) localStorage.setItem('usuario_nome', dados.nome);
        if (dados.email !== undefined) localStorage.setItem('usuario_email', dados.email);
        if (dados.token !== undefined) localStorage.setItem('usuario_token', dados.token);
    },

    requireSession(message = 'Acesso negado: Você precisa realizar o login para acessar esta página.') {
        const session = this.getSession();

        if (session.nome && session.email && session.token) {
            return session;
        }

        window.alert(message);
        this.redirectToLogin();
        return null;
    },

    logout(message) {
        localStorage.removeItem('usuario_nome');
        localStorage.removeItem('usuario_email');
        localStorage.removeItem('usuario_token');

        window.alert(message);
        this.redirectToLogin();
    },

    redirectToLogin() {
        const redirect = document.createElement('a');
        redirect.href = 'login.html';
        document.body.appendChild(redirect);
        redirect.click();
        document.body.removeChild(redirect);
    }
});
