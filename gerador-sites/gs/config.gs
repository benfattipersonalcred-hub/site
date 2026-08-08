// ============================================================
// ARQUIVO: gs/config.gs
// DESCRIÇÃO: Configuração central do backend (Google Apps Script).
//           Contém as CHAVES SECRETAS e os IDs de pastas.
//           ⚠️ NUNCA exponha este arquivo no front-end (DECISÃO 08).
// ============================================================

// ============================================================
// OBJETO DE CONFIGURAÇÃO GLOBAL
// ============================================================
var CONFIG_GLOBAL = {
    // Chave da API do ImgBB (armazenamento de imagens).
    // Recurso: API v1 - endpoint: POST https://api.imgbb.com/1/upload
    // (DECISÃO 08: chave secreta fica SOMENTE aqui, no backend)
    IMGBB_API_KEY: '940bd270f773d8bab2fac9e5e80f6097',

    // ID da pasta raiz do banco no Google Drive (pasta "SITE").
    // Local onde o banco será construído.
    ID_PASTA_RAIZ: '1g9chNL0WZPH2MIF_LDpkMJFYNBN-6B8z',

    // ID da subpasta do banco do gerador-sites (pasta "BD_ SITES").
    // Local onde ficará a planilha do banco central.
    ID_PASTA_BANCO: '1btGSsVSnOIIM4fSpddjDzMVUnIdciuOt',

// ID da planilha do banco central.
    // Planilha criada pelo script CRIAR_BANCO_TEMP.gs dentro da pasta "BD_ SITES".
    ID_PLANILHA: '1jDP7aI5eQ7u2_Y-7tqkh7GtiUS8Ecr_7VrTpZSUiCg4',

    // Nome das abas do banco (DECISÃO 01 - banco único com abas).
    ABAS: {
        ADMIN: 'Admin',
        CLIENTES: 'Clientes',
        LEADS: 'Leads',
        FUNCIONARIOS: 'Funcionarios',
        PARCEIROS: 'Parceiros',
        SITES: 'Sites',
        FINANCEIRO: 'Financeiro',
        VENDAS_CLIENTES: 'Vendas_Clientes'
    },

    // Validade do token de sessão em horas (DECISÃO 02).
    VALIDADE_TOKEN_HORAS: 24
};

// ============================================================
// FUNÇÃO: retorna a config global
// ============================================================
function getConfig() {
    // Retorna o objeto de configuração global
    return CONFIG_GLOBAL;
}
