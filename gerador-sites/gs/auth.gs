// ============================================================
// ARQUIVO: gs/auth.gs
// DESCRIÇÃO: Autenticação segura - hash de senha com salt e
//           geração/validação de tokens de sessão (DECISÃO 02).
//           === O hash é SEMPRE feito no servidor (server-side) ===
// ============================================================

// ============================================================
// FUNÇÃO: gera o hash de uma senha usando SHA-256 + salt
// Parametros: senha (string) e salt (string)
// Retorna: o hash hexadecimal da senha (server-side)
// ============================================================
function gerarHashSenha(senha, salt) {
    // Concatena a senha com o salt para dificultar ataques
    var textoComSalt = senha + salt;
    // Calcula o digest SHA-256 do texto (byte array)
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, textoComSalt);
    // Converte o byte array para hexadecimal
    var hashHex = digest.map(function (byte) {
        // Pega o byte e converte para valor sem sinal
        var val = (byte < 0) ? byte + 256 : byte;
        // Converte para hexadecimal com 2 dígitos
        return (val.toString(16)).padStart(2, '0');
    }).join('');
    // Retorna o hash hexadecimal pronto
    return hashHex;
}

// ============================================================
// FUNÇÃO: gera um salt aleatório para a senha
// Parametros: nenhum
// Retorna: uma string aleatória (salt)
// ============================================================
function gerarSalt() {
    // Gera uma string aleatória com base no tempo e em números
    var base = Date.now().toString() + Math.random().toString();
    // Calcula o hash da base e retorna como salt
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, base);
    // Converte o digest para string hexadecimal
    return digest.map(function (byte) {
        // Ajusta o byte para valor sem sinal
        var val = (byte < 0) ? byte + 256 : byte;
        // Converte para hexadecimal
        return (val.toString(16)).padStart(2, '0');
    }).join('').substring(0, 16);
}

// ============================================================
// FUNÇÃO: valida se a senha informada confere com o hash salvo
// Parametros: senhaInformada, hashSalvo, saltSalvo
// Retorna: true se a senha estiver correta
// ============================================================
function validarSenha(senhaInformada, hashSalvo, saltSalvo) {
    // Gera o hash da senha informada usando o salt salvo
    var hashCalc = gerarHashSenha(senhaInformada, saltSalvo);
    // Compara o hash calculado com o hash salvo
    return hashCalc === hashSalvo;
}

// ============================================================
// FUNÇÃO: gera um token de sessão único
// Parametros: email (string do usuário)
// Retorna: uma string de token
// ============================================================
function gerarToken(email) {
    // Concatena email + tempo + aleatório para gerar token único
    var base = email + Date.now() + Math.random().toString() + 'tok';
    // Calcula o digest do token
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, base);
    // Converte o digest para hexadecimal
    return digest.map(function (byte) {
        // Ajusta o byte para valor sem sinal
        var val = (byte < 0) ? byte + 256 : byte;
        // Converte para hexadecimal
        return (val.toString(16)).padStart(2, '0');
    }).join('');
}

// ============================================================
// FUNÇÃO: calcula a data/hora de validade do token
// Parametros: nenhum
// Retorna: Date futuro (now + validade configurada)
// ============================================================
function dataValidadeToken() {
    // Pega a validação de validade em horas da configuração
    var horas = getConfig().VALIDADE_TOKEN_HORAS;
    // Cria uma data agora
    var agora = new Date();
    // Soma as horas de validade
    agora.setHours(agora.getHours() + horas);
    // Retorna a data de validade
    return agora;
}
