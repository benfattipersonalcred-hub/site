
document.addEventListener('DOMContentLoaded', () => {
    // 1. VALIDAÇÃO DE SEGURANÇA IMEDIATA (SESSÃO DO CONTEXTO BENFATTI)
    const usuarioNome = localStorage.getItem('usuario_nome');
    const usuarioEmail = localStorage.getItem('usuario_email');
    const usuarioToken = localStorage.getItem('usuario_token');

    // URL DA API DO SEU GOOGLE APPS SCRIPT DE FINANÇAS ATUALIZADO
    // 👉 Lembre-se de colar aqui a nova URL Web gerada após publicar o script Gerenciar_Financas com a função de deletar
    const URL_API_FINANCAS = 'https://script.google.com/macros/s/AKfycbwB9a7_UA6eG8gfYK6wx_gG2Asw9RhK7PXk0xcUWnWLjLX1kRIvim0sKIyX3V4wGB1Y/exec';

    if (!usuarioNome || !usuarioEmail || !usuarioToken) {
        window.alert('Acesso negado: Você precisa realizar o login para acessar esta página.');
        window.location.href = 'login.html';
        return;
    }

    // Injeta o nome real capturado na sessão no cabeçalho de boas-vindas
    document.getElementById('nomeUsuario').textContent = usuarioNome;

    // Matriz global na memória do navegador para armazenar temporariamente o extrato bruto recebido da API
    let transacoesGlobais = [];

    // 2. SISTEMA DE TOGGLE DA SIDEBAR (DESKTOP E MOBILE)
    const btnToggleDesktop = document.getElementById('btnToggleDesktop');
    const btnToggleMobile = document.getElementById('btnToggleMobile');
    const panelContainer = document.getElementById('panelContainer');

    if (btnToggleDesktop && panelContainer) {
        btnToggleDesktop.addEventListener('click', (e) => {
            e.preventDefault();
            panelContainer.classList.remove('mobile-menu-open');
            panelContainer.classList.toggle('sidebar-collapsed');
        });
    }

    if (btnToggleMobile && panelContainer) {
        btnToggleMobile.addEventListener('click', (e) => {
            e.preventDefault();
            panelContainer.classList.remove('sidebar-collapsed');
            panelContainer.classList.toggle('mobile-menu-open');
        });
    }
    // 3. FUNÇÃO CORE: CARREGA DADOS DO DRIVE E INJETA OS BOTÕES DE EXCLUSÃO (CORREÇÃO DA IMAGEM)
    async function carregarDashboard() {
        try {
            const payload = {
                acao: 'carregarDashboardFinancas',
                emailCliente: usuarioEmail,
                tokenSessao: usuarioToken
            };

            const response = await fetch(URL_API_FINANCAS, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });
            const resultado = await response.json();

            if (resultado.status === 'sucesso') {
                // Guarda os dados originais na memória global para uso imediato dos filtros locais
                transacoesGlobais = resultado.extrato || [];

                // Atualiza os cartões superiores de balanço financeiro
                document.getElementById('resumoSaldoGeral').textContent = resultado.resumo.saldoGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                document.getElementById('resumoReceitas').textContent = resultado.resumo.receitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                document.getElementById('resumoDespesas').textContent = resultado.resumo.despesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

                // Atualiza a listagem lateral de bancos e contas
                const containerBancos = document.getElementById('listaContasBancarias');
                const selectMetodo = document.getElementById('finMetodo');
                containerBancos.innerHTML = '';
                selectMetodo.innerHTML = '';

                if (resultado.bancos.length === 0 || !resultado.bancos.some(b => b.nome === 'Carteira Pessoal')) {
                    resultado.bancos.unshift({ nome: 'Carteira Pessoal', saldo: 0 });
                }

                resultado.bancos.forEach(banco => {
                    const boxBanco = document.createElement('div');
                    boxBanco.className = 'banco-item-box';
                    const classeSaldo = banco.saldo >= 0 ? 'status-active' : '';
                    boxBanco.innerHTML = `<span>💳 ${banco.nome}</span><strong class="${classeSaldo}">${banco.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>`;
                    containerBancos.appendChild(boxBanco);

                    const opcao = document.createElement('option');
                    opcao.value = banco.nome;
                    opcao.textContent = banco.nome;
                    selectMetodo.appendChild(opcao);
                });

                // Dispara a exibição inicial aplicando as regras da tabela
                filtrarTransacoesLocais();
            }
        } catch (err) {
            console.error('Erro de sincronia com a API de finanças:', err);
        }
    }

    // 4. MOTOR DA TABELA: INJETA O BOTÃO DE EXCLUSÃO SOLICITADO NA IMAGEM
    function renderizarTabela(listaFiltrada) {
        const tbody = document.querySelector('#tabelaExtrato tbody');
        tbody.innerHTML = '';

        if (listaFiltrada.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--cor-texto-mutado); padding: 2rem; font-style: italic;">Nenhum lançamento corresponde aos filtros aplicados.</td></tr>';
            return;
        }

        listaFiltrada.forEach(item => {
            const tr = document.createElement('tr');
            const sinal = item.tipo === 'Receita' ? '+' : (item.tipo === 'Despesa' ? '-' : '');
            const corValor = item.tipo === 'Receita' ? 'color: var(--cor-sucesso);' : (item.tipo === 'Despesa' ? 'color: var(--cor-erro);' : '');
            
            // Formata e exibe apenas a data limpa (AAAA-MM-DD)
            const dataLimpa = item.data && item.data[0] ? item.data[0] : item.data;

            tr.innerHTML = `
                <td style="color: var(--cor-texto-mutado);">${dataLimpa}</td>
                <td>${item.descricao}</td>
                <td style="color: var(--cor-texto-mutado);"><small>💵 ${item.metodo}</small></td>
                <td style="text-align: right; ${corValor} font-weight: 700;">${sinal} ${item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td style="text-align: center;">
                    <!-- INJEÇÃO DO BOTÃO DE LIXEIRA CORRIGIDO -->
                    <button class="btn-deletar-transacao" data-id="${item.id}" title="Excluir Lançamento" style="background: none; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0.4rem; border-radius: 6px; transition: background 0.2s;">
                        <svg xmlns="http://w3.org" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Vincula o evento de clique em cada lixeira injetada
        vincularEventosExclusao();
    }
    // 5. INTELIGÊNCIA LOCAL: FILTRA AS TRANSAÇÕES EM TEMPO REAL SEM RECARREGAR A TELA
    function filtrarTransacoesLocais() {
        const buscaTexto = document.getElementById('filtroTexto').value.toLowerCase().trim();
        const buscaTipo = document.getElementById('filtroTipo').value;
        const dataInicio = document.getElementById('filtroDataInicio').value; // Formato AAAA-MM-DD
        const dataFim = document.getElementById('filtroDataFim').value;       // Formato AAAA-MM-DD

        // Executa a varredura aplicando os quatro filtros de forma simultânea
        const listaFiltrada = transacoesGlobais.filter(item => {
            // Filtro 1: Busca por Texto (Olha descrição e método/banco)
            const bateTexto = item.descricao.toLowerCase().includes(buscaTexto) || 
                             item.metodo.toLowerCase().includes(buscaTexto);

            // Filtro 2: Tipo (Todos, Receita ou Despesa)
            const bateTipo = (buscaTipo === 'Todos') || (item.tipo === buscaTipo);

            // Tratamento e limpeza da data do item para comparação matemática pura
            let bateData = true;
            if (item.data) {
                const dataItem = item.data.split('T')[0]; // Isola o formato AAAA-MM-DD

                // Filtro 3: Data Inicial
                if (dataInicio && dataItem < dataInicio) {
                    bateData = false;
                }
                // Filtro 4: Data Final
                if (dataFim && dataItem > dataFim) {
                    bateData = false;
                }
            }

            return bateTexto && bateTipo && bateData;
        });

        // Envia o array filtrado para ser desenhado fisicamente na tabela
        renderizarTabela(listaFiltrada);
    }

    // OUVINTES DE EVENTOS: Disparam a filtragem na mesma hora em que o usuário interage
    document.getElementById('filtroTexto').addEventListener('input', filtrarTransacoesLocais);
    document.getElementById('filtroTipo').addEventListener('change', filtrarTransacoesLocais);
    document.getElementById('filtroDataInicio').addEventListener('input', filtrarTransacoesLocais);
    document.getElementById('filtroDataFim').addEventListener('input', filtrarTransacoesLocais);
    // 6. INTEGRAÇÃO COM BACK-END: EVENTO QUE DISPARA A EXCLUSÃO FÍSICA NO GOOGLE DRIVE
    function vincularEventosExclusao() {
        document.querySelectorAll('.btn-deletar-transacao').forEach(botao => {
            // Remove ouvintes antigos para evitar disparos duplicados na memória
            const novoBotao = botao.cloneNode(true);
            botao.parentNode.replaceChild(novoBotao, botao);

            novoBotao.addEventListener('click', async (e) => {
                e.preventDefault();
                const idTransacao = novoBotao.getAttribute('data-id');

                if (window.confirm('Tem certeza absoluta que deseja excluir este lançamento permanentemente da sua planilha?')) {
                    try {
                        const payloadExcluir = {
                            acao: 'excluirMovimentacao',
                            emailCliente: usuarioEmail,
                            tokenSessao: usuarioToken,
                            idTransacao: idTransacao
                        };

                        // Altera a cor do ícone temporariamente para sinalizar processamento
                        novoBotao.querySelector('svg').style.stroke = '#8fa096';

                        const response = await fetch(URL_API_FINANCAS, {
                            method: 'POST',
                            mode: 'cors',
                            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                            body: JSON.stringify(payloadExcluir)
                        });
                        const resultado = await response.json();

                        if (resultado.status === 'sucesso') {
                            window.alert('Lançamento excluído com sucesso!');
                            carregarDashboard(); // Recarrega os saldos atualizados e o extrato limpo
                        } else {
                            alert('Erro ao excluir: ' + resultado.mensagem);
                            carregarDashboard();
                        }
                    } catch (err) {
                        console.error(err);
                        alert('Erro de conexão ao tentar remover o lançamento.');
                    }
                }
            });
        });
    }

    // 7. GERENCIAMENTO VISUAL DO MODAL FLUTUANTE DE INSERÇÃO
    const modal = document.getElementById('modalFinanceiro');
    const formMovimentacao = document.getElementById('formMovimentacao');
    const finTipo = document.getElementById('finTipo');
    const modalTitulo = document.getElementById('modalTitulo');
    const labelDescricao = document.getElementById('labelDescricao');
    const labelMetodo = document.getElementById('labelMetodo');
    const boxFinData = document.getElementById('boxFinData');
    const boxFinMetodo = document.getElementById('boxFinMetodo');
    const finDataInput = document.getElementById('finData');

    function abrirModal(tipo, titulo, textoDescricao, textoMetodo, mostrarCamposExtras) {
        formMovimentacao.reset();
        finTipo.value = tipo;
        modalTitulo.textContent = titulo;
        labelDescricao.textContent = textoDescricao;
        finDataInput.value = new Date().toISOString().split('T')[0];

        if (mostrarCamposExtras) {
            labelMetodo.textContent = textoMetodo;
            boxFinData.style.display = 'flex';
            boxFinMetodo.style.display = 'flex';
            document.getElementById('finMetodo').required = true;
            document.getElementById('finData').required = true;
        } else {
            boxFinData.style.display = 'none';
            boxFinMetodo.style.display = 'none';
            document.getElementById('finMetodo').required = false;
            document.getElementById('finData').required = false;
        }
        modal.style.display = 'flex';
    }

    document.getElementById('btnNovaReceita').addEventListener('click', () => {
        abrirModal('Receita', '💰 Registrar Nova Receita', 'Descrição do Recebimento', 'Conta de Destino', true);
    });

    document.getElementById('btnNovaDespesa').addEventListener('click', () => {
        abrirModal('Despesa', '📉 Registrar Nova Despesa', 'Descrição da Conta / Gasto', 'Conta de Origem de Pagamento', true);
    });

    document.getElementById('btnCadastrarConta').addEventListener('click', () => {
        abrirModal('Banco', '🏦 Cadastrar Novo Banco ou Carteira', 'Nome do Banco / Tipo de Carteira', '', false);
    });

    document.getElementById('btnFecharModalFin').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // 8. ENVIO DO FORMULÁRIO DE ATALHO DE MOVIMENTAÇÃO PARA O DRIVE
    formMovimentacao.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnConfirmar = formMovimentacao.querySelector('button[type="submit"]');
        const textoOriginal = btnConfirmar.textContent;
        btnConfirmar.textContent = 'Registrando...';
        btnConfirmar.disabled = true;

        const payload = {
            acao: 'inserirMovimentacao',
            emailCliente: usuarioEmail,
            tokenSessao: usuarioToken,
            tipoMovimentacao: finTipo.value,
            descricao: document.getElementById('finDescricao').value.trim(),
            valor: parseFloat(document.getElementById('finValor').value) || 0,
            dataMovimentacao: document.getElementById('finData').value || new Date().toISOString().split('T')[0],
            metodoFinanceiro: finTipo.value === 'Banco' ? 'Saldo Inicial' : document.getElementById('finMetodo').value
        };

        try {
            const response = await fetch(URL_API_FINANCAS, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });
            const resultado = await response.json();

            if (resultado.status === 'sucesso') {
                window.alert('Operação financeira registrada com sucesso!');
                modal.style.display = 'none';
                carregarDashboard();
            } else {
                alert('Erro: ' + resultado.mensagem);
            }
        } catch (err) {
            console.error(err);
            alert('Erro de conexão ao salvar lançamento.');
        } finally {
            btnConfirmar.textContent = textoOriginal;
            btnConfirmar.disabled = false;
        }
    });

    // 9. EVENTO DE LOGOUT (SAIR)
    const btnSair = document.getElementById('btnSair');
    if (btnSair) {
        btnSair.addEventListener('click', () => {
            localStorage.removeItem('usuario_nome');
            localStorage.removeItem('usuario_email');
            localStorage.removeItem('usuario_token');
            window.alert('Sessão financeira encerrada com sucesso. Até logo!');
            window.location.href = 'login.html';
        });
    }

    // DISPARO AUTOMÁTICO INICIAL AO CARREGAR A TELA
    carregarDashboard();
});
