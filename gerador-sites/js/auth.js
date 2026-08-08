// ============================================================
// ARQUIVO: js/auth.js
// DESCRIÇÃO: Gestão de sessão e autenticação no front-end.
//           Salva o token e dados do usuário logado (DECISÃO 02).
// ============================================================

// Chaves usadas no localStorage para sessão
const CHAVE_TOKEN = 'gs_token';
const CHAVE_USUARIO = 'gs_usuario';

// ============================================================
// FUNÇÃO: salva a sessão do usuário logado
// Parametros: token (string) e usuario (objeto)
// ============================================================
function salvarSessao(token, usuario) {
    // Salva o token no localStorage
    salvarLocal(CHAVE_TOKEN, token);
    // Salva os dados do usuário no localStorage
    salvarLocal(CHAVE_USUARIO, usuario);
}

// ============================================================
// FUNÇÃO: retorna o token da sessão atual
// Retorna: string do token ou null
// ============================================================
function obterToken() {
    // Lê o token do localStorage
    return lerLocal(CHAVE_TOKEN);
}

// ============================================================
// FUNÇÃO: retorna os dados do usuário logado
// Retorna: objeto do usuário ou null
// ============================================================
function obterUsuario() {
    // Lê os dados do usuário do localStorage
    return lerLocal(CHAVE_USUARIO);
}

// ============================================================
// FUNÇÃO: verifica se há um usuário logado
// Retorna: true se logado, false se não
// ============================================================
function estaLogado() {
    // Retorna true se existir token de sessão
    return !!obterToken();
}

// ============================================================
// FUNÇÃO: encerra a sessão (logout)
// ============================================================
function sair() {
    // Remove o token do localStorage
    removerLocal(CHAVE_TOKEN);
    // Remove os dados do usuário do localStorage
    removerLocal(CHAVE_USUARIO);
}

// ============================================================
// FUNÇÃO: protege uma página (exige login)
// Parametros: redirecionar (string da página de login)
// ============================================================
function protegerPagina(redirecionar) {
    // Se não estiver logado
    if (!estaLogado()) {
        // Redireciona para a página de login
        irPara(redirecionar || 'login.html');
    }
}

// ============================================================
// FUNÇÃO: verifica se o usuário é admin
// Retorna: true se for admin, false se não
// ============================================================
function ehAdmin() {
    // Obtém os dados do usuário logado
    const usuario = obterUsuario();
    // Se não houver usuário, não é admin
    if (!usuario) return false;
    // Retorna true se o nível de acesso for admin
    // Aceita: nivel === 'admin' (mock), tipo === 'admin' (fallback)
    // e perfil === 'admin' (devolvido pelo backend real em login_admin)
    return usuario.nivel === 'admin' || usuario.tipo === 'admin' || usuario.perfil === 'admin';
}
