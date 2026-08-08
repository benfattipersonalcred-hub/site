// ============================================================
// ARQUIVO: gs/crud.gs
// DESCRIÇÃO: Leitura e gravação das abas do banco (Google Sheets).
//           Funções genéricas CRUD para todas as abas (DECISÃO 01).
// ============================================================

// ============================================================
// FUNÇÃO: obtém a planilha do banco central
// Retorna: a planilha (Spreadsheet) ativa
// ============================================================
function obterPlanilha() {
    // Pega o ID da planilha da configuração
    var id = getConfig().ID_PLANILHA;
    // Se não tiver ID, lança um erro orientativo
    if (!id) throw new Error('ID_PLANILHA não configurado no config.gs');
    // Abre a planilha pelo ID
    return SpreadsheetApp.openById(id);
}

// ============================================================
// FUNÇÃO: obtém a aba especificada da planilha
// Parametros: nomeAba (string)
// Retorna: a aba (Sheet) solicitada
// ============================================================
function obterAba(nomeAba) {
    // Obtém a planilha do banco
    var planilha = obterPlanilha();
    // Obtém a aba pelo nome
    var aba = planilha.getSheetByName(nomeAba);
    // Se a aba não existir, cria com cabeçalho vazio
    if (!aba) {
        // Cria uma nova aba com o nome informado
        aba = planilha.insertSheet(nomeAba);
    }
    // Retorna a aba
    return aba;
}

// ============================================================
// FUNÇÃO: lê TODOS os registros de uma aba
// Parametros: nomeAba (string)
// Retorna: array de objetos (cada linha = um registro)
// ============================================================
function lerTodos(nomeAba) {
    // Obtém a aba solicitada
    var aba = obterAba(nomeAba);
    // Obtém todos os dados da aba
    var dados = aba.getDataRange().getValues();
    // Se não houver dados, retorna lista vazia
    if (dados.length === 0) return [];
    // Pega a primeira linha como cabeçalho
    var cabecalho = dados[0];
    // Cria o array de resultados
    var resultado = [];
    // Percorre os dados a partir da segunda linha
    for (var i = 1; i < dados.length; i++) {
        // Cria o objeto do registro
        var obj = {};
        // Percorre as colunas do cabeçalho
        for (var j = 0; j < cabecalho.length; j++) {
            // Atribui o valor da célula à chave do cabeçalho
            obj[cabecalho[j]] = dados[i][j];
        }
        // Adiciona o registro ao resultado
        resultado.push(obj);
    }
    // Retorna a lista de registros
    return resultado;
}

// ============================================================
// FUNÇÃO: busca UM registro de uma aba por uma coluna/valor
// Parametros: nomeAba, coluna (nome), valor
// Retorna: o registro encontrado ou null
// ============================================================
function buscarPor(nomeAba, coluna, valor) {
    // Lê todos os registros da aba
    var linhas = lerTodos(nomeAba);
    // Percorre os registros
    for (var i = 0; i < linhas.length; i++) {
        // Compara o valor da coluna com o valor buscado
        if (String(linhas[i][coluna]) === String(valor)) {
            // Retorna o registro encontrado
            return linhas[i];
        }
    }
    // Se não achar, retorna null
    return null;
}

// ============================================================
// FUNÇÃO: garante que o cabeçalho tenha todas as colunas do objeto
// Parametros: aba (Sheet) e objeto (com as chaves)
// Retorna: o cabeçalho atualizado (com as colunas que faltavam)
// ============================================================
function garantirCabecalho(aba, objeto) {
    // Obtém os dados atuais da aba
    var dados = aba.getDataRange().getValues();
    // Define o cabeçalho (vazio por padrão)
    var cabecalho = [];
    // Se já houver dados, usa a primeira linha como cabeçalho
    if (dados.length > 0) {
        // Usa a primeira linha como cabeçalho
        cabecalho = dados[0];
    }
    // Obtém todas as chaves do objeto (as colunas desejadas)
    var chaves = Object.keys(objeto);
    // Flag para saber se algo foi adicionado ao cabeçalho
    var adicionouColuna = false;
    // Percorre as chaves do objeto
    chaves.forEach(function (chave) {
        // Se a coluna ainda não existe no cabeçalho
        if (cabecalho.indexOf(chave) === -1) {
            // Adiciona a coluna ao cabeçalho
            cabecalho.push(chave);
            // Marca que adicionou coluna
            adicionouColuna = true;
        }
    });
    // Se houver colunas novas ou a aba estiver vazia
    if (adicionouColuna || cabecalho.length > 0) {
        // Escreve o cabeçalho atualizado na primeira linha
        aba.getRange(1, 1, 1, cabecalho.length).setValues([cabecalho]);
    }
    // Retorna o cabeçalho atualizado
    return cabecalho;
}

// ============================================================
// FUNÇÃO: adiciona um novo registro a uma aba
// Parametros: nomeAba (string) e objeto com os dados
// Retorna: o objeto inserido (com ID se gerado)
// ============================================================
function adicionar(nomeAba, objeto) {
    // Obtém a aba solicitada
    var aba = obterAba(nomeAba);
    // Garante que o cabeçalho tenha todas as colunas do objeto
    var cabecalho = garantirCabecalho(aba, objeto);
    // Cria a linha a ser adicionada
    var novaLinha = [];
    // Percorre cada coluna do cabeçalho
    cabecalho.forEach(function (nomeColuna) {
        // Pega o valor do objeto ou vazio
        novaLinha.push(objeto[nomeColuna] !== undefined ? objeto[nomeColuna] : '');
    });
    // Adiciona a nova linha à planilha
    aba.appendRow(novaLinha);
    // Retorna o objeto inserido
    return objeto;
}

// ============================================================
// FUNÇÃO: atualiza um registro de uma aba
// Parametros: nomeAba, idLinha (coluna ID), idValor, novosDados
// Retorna: true se atualizou, false se não encontrou
// ============================================================
function atualizar(nomeAba, idLinha, idValor, novosDados) {
    // Obtém a aba solicitada
    var aba = obterAba(nomeAba);
    // Garante que o cabeçalho tenha todas as colunas do novosDados
    var cabecalho = garantirCabecalho(aba, novosDados);
    // Obtém todos os dados da aba
    var dados = aba.getDataRange().getValues();
    // Se não houver dados, retorna false
    if (dados.length === 0) return false;
    // Localiza o índice da coluna ID
    var idxId = cabecalho.indexOf(idLinha);
    // Se a coluna não existir, retorna false
    if (idxId === -1) return false;
    // Percorre as linhas procurando o registro
    for (var i = 1; i < dados.length; i++) {
        // Se achar o registro com o ID informado
        if (String(dados[i][idxId]) === String(idValor)) {
            // Percorre as chaves dos novos dados
            Object.keys(novosDados).forEach(function (chave) {
                // Pega o índice da coluna da chave
                var idxCol = cabecalho.indexOf(chave);
                // Se a coluna existir, atualiza a célula
                if (idxCol !== -1) {
                    // Atualiza a célula da linha atual
                    aba.getRange(i + 1, idxCol + 1).setValue(novosDados[chave]);
                }
            });
            // Retorna true indicando sucesso
            return true;
        }
    }
    // Se não achou, retorna false
    return false;
}

// ============================================================
// FUNÇÃO: exclui um registro de uma aba
// Parametros: nomeAba, idLinha (coluna ID), idValor
// Retorna: true se excluiu, false se não encontrou
// ============================================================
function excluir(nomeAba, idLinha, idValor) {
    // Obtém a aba solicitada
    var aba = obterAba(nomeAba);
    // Obtém todos os dados da aba
    var dados = aba.getDataRange().getValues();
    // Se não houver dados, retorna false
    if (dados.length === 0) return false;
    // Pega o cabeçalho
    var cabecalho = dados[0];
    // Localiza o índice da coluna ID
    var idxId = cabecalho.indexOf(idLinha);
    // Se a coluna não existir, retorna false
    if (idxId === -1) return false;
    // Percorre as linhas procurando o registro
    for (var i = 1; i < dados.length; i++) {
        // Se achar o registro com o ID informado
        if (String(dados[i][idxId]) === String(idValor)) {
            // Exclui a linha (i+1 na planilha)
            aba.deleteRow(i + 1);
            // Retorna true indicando sucesso
            return true;
        }
    }
    // Se não achou, retorna false
    return false;
}
