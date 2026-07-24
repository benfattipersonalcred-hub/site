document.addEventListener('DOMContentLoaded', () => {
    // 1. VALIDAÇÃO DE SEGURANÇA IMEDIATA (SESSÃO DO CONTEXTO BENFATTI)
    const session = AUTH.requireSession();
    if (!session) return;

    const { nome: usuarioNome, email: usuarioEmail, token: usuarioToken } = session;

    // Injeta o nome real capturado na sessão no cabeçalho de boas-vindas
    if (document.getElementById('nomeUsuario')) {
        document.getElementById('nomeUsuario').textContent = usuarioNome;
    }

    // Matriz global na memória do navegador para armazenar temporariamente o extrato bruto
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

    // 3. FUNÇÃO CORE: CARREGA DADOS DO DRIVE E MONTA ESTRUTURAS FINANCEIRAS
    async function carregarDashboard() {
        try {
            const payload = {
                acao: 'carregarDashboardFinancas',
                emailCliente: usuarioEmail,
                tokenSessao: usuarioToken
            };

            const response = await API_CLIENT.post(CONFIG.APIS.FINANCAS, payload);
            const resultado = await response.json();

            if (resultado.status === 'sucesso' || resultado.success === true) {
                transacoesGlobais = resultado.extrato || [];

                // Atualiza os cartões superiores de balanço financeiro
                if (document.getElementById('resumoSaldoGeral')) document.getElementById('resumoSaldoGeral').textContent = parseFloat(resultado.resumo.saldoGeral || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                if (document.getElementById('resumoReceitas')) document.getElementById('resumoReceitas').textContent = parseFloat(resultado.resumo.receitas || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                if (document.getElementById('resumoDespesas')) document.getElementById('resumoDespesas').textContent = parseFloat(resultado.resumo.despesas || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

                // Atualiza la listagem lateral de bancos e contas
                const containerBancos = document.getElementById('listaContasBancarias');
                const selectMetodo = document.getElementById('finMetodo');

                if (containerBancos) containerBancos.innerHTML = '';
                if (selectMetodo) selectMetodo.innerHTML = '';

                if (!resultado.bancos) resultado.bancos = [];
                if (resultado.bancos.length === 0 || !resultado.bancos.some(b => b.nome === 'Carteira Pessoal')) {
                    resultado.bancos.unshift({ nome: 'Carteira Pessoal', saldo: 0 });
                }

                resultado.bancos.forEach(banco => {
                    if (containerBancos) {
                        const boxBanco = document.createElement('div');
                        boxBanco.className = 'banco-item-box';
                        const valorSaldo = parseFloat(banco.saldo || 0);
                        const classeSaldo = valorSaldo >= 0 ? 'status-active' : '';
                        boxBanco.innerHTML = `<span>💳 ${banco.nome}</span><strong class="${classeSaldo}">${valorSaldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>`;
                        containerBancos.appendChild(boxBanco);
                    }

                    if (selectMetodo) {
                        const opcao = document.createElement('option');
                        opcao.value = banco.nome;
                        opcao.textContent = banco.nome;
                        selectMetodo.appendChild(opcao);
                    }
                });

                filtrarTransacoesLocais();
            }
        } catch (err) {
            console.error('Erro de sincronia com a API de finanças:', err);
        }
    }

    // 4. MOTOR DA TABELA: INJETA O BOTÃO DE EXCLUSÃO DE LIXEIRA VETORIAL COM NAMESPACE CORRETO
    function renderizarTabela(listaFiltrada) {
        const tbody = document.querySelector('#tabelaExtrato tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (listaFiltrada.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--cor-texto-mutado); padding: 2rem; font-style: italic;">Nenhum lançamento corresponde aos filtros aplicados.</td></tr>';
            return;
        }

        listaFiltrada.forEach(item => {
            const tr = document.createElement('tr');
            const sinal = item.tipo === 'Receita' ? '+' : (item.tipo === 'Despesa' ? '-' : '');
            const corValor = item.tipo === 'Receita' ? 'color: var(--cor-sucesso);' : (item.tipo === 'Despesa' ? 'color: var(--cor-erro);' : '');

            const dataLimpa = item.data && item.data.split ? item.data.split('T')[0] : item.data;
            const valorLancamento = parseFloat(item.valor || 0);

            tr.innerHTML = `
                <td style="color: var(--cor-texto-mutado);">${dataLimpa}</td>
                <td>${item.descricao}</td>
                <td style="color: var(--cor-texto-mutado);"><small>💵 ${item.metodo}</small></td>
                <td style="text-align: right; ${corValor} font-weight: 700;">${sinal} ${valorLancamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td style="text-align: center;">
                    <button class="btn-deletar-transacao" data-id="${item.id}" title="Excluir Lançamento" style="background: none; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0.4rem; border-radius: 6px; transition: background 0.2s;">
                        <svg xmlns="http://w3.org" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        vincularEventosExclusao();
    }
    // 5. INTELIGÊNCIA LOCAL: FILTRA AS TRANSAÇÕES EM TEMPO REAL SEM RECARREGAR A TELA
    function filtrarTransacoesLocais() {
        const buscaTexto = document.getElementById('filtroTexto').value.toLowerCase().trim();
        const buscaTipo = document.getElementById('filtroTipo').value;
        const dataInicio = document.getElementById('filtroDataInicio').value;
        const dataFim = document.getElementById('filtroDataFim').value;

        const listaFiltrada = transacoesGlobais.filter(item => {
            const bateTexto = item.descricao.toLowerCase().includes(buscaTexto) ||
                item.metodo.toLowerCase().includes(buscaTexto);

            const bateTipo = (buscaTipo === 'Todos') || (item.tipo === buscaTipo);

            let bateData = true;
            if (item.data) {
                const dataItem = item.data.split('T')[0];

                if (dataInicio && dataItem < dataInicio) {
                    bateData = false;
                }
                if (dataFim && dataItem > dataFim) {
                    bateData = false;
                }
            }

            return bateTexto && bateTipo && bateData;
        });

        renderizarTabela(listaFiltrada);
    }

    // OUVINTES DE EVENTOS: Disparam a filtragem na mesma hora em que o usuário interage
    if (document.getElementById('filtroTexto')) document.getElementById('filtroTexto').addEventListener('input', filtrarTransacoesLocais);
    if (document.getElementById('filtroTipo')) document.getElementById('filtroTipo').addEventListener('change', filtrarTransacoesLocais);
    if (document.getElementById('filtroDataInicio')) document.getElementById('filtroDataInicio').addEventListener('input', filtrarTransacoesLocais);
    if (document.getElementById('filtroDataFim')) document.getElementById('filtroDataFim').addEventListener('input', filtrarTransacoesLocais);

    // 6. INTEGRAÇÃO COM BACK-END: EVENTO QUE DISPARA A EXCLUSÃO FÍSICA NO GOOGLE DRIVE
    function vincularEventosExclusao() {
        document.querySelectorAll('.btn-deletar-transacao').forEach(botao => {
            const novoBotao = botao.cloneNode(true);
            if (botao.parentNode) botao.parentNode.replaceChild(novoBotao, botao);

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

                        const svgIcon = novoBotao.querySelector('svg');
                        if (svgIcon) svgIcon.style.stroke = '#8fa096';

                        const response = await API_CLIENT.post(CONFIG.APIS.FINANCAS, payloadExcluir);
                        const resultado = await response.json();

                        if (resultado.status === 'sucesso' || resultado.success === true) {
                            window.alert('Lançamento excluído com sucesso!');
                            carregarDashboard();
                        } else {
                            alert('Erro ao excluir: ' + (resultado.mensagem || resultado.error || 'Erro desconhecido.'));
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
        if (formMovimentacao) formMovimentacao.reset();
        if (finTipo) finTipo.value = tipo;
        if (modalTitulo) modalTitulo.textContent = titulo;
        if (labelDescricao) labelDescricao.textContent = textoDescricao;
        if (finDataInput) finDataInput.value = new Date().toISOString().split('T')[0];

        const selectMetodo = document.getElementById('finMetodo');
        const inputData = document.getElementById('finData');

        if (mostrarCamposExtras) {
            if (labelMetodo) labelMetodo.textContent = textoMetodo;
            if (boxFinData) boxFinData.style.display = 'flex';
            if (boxFinMetodo) boxFinMetodo.style.display = 'flex';
            if (selectMetodo) selectMetodo.required = true;
            if (inputData) inputData.required = true;
        } else {
            if (boxFinData) boxFinData.style.display = 'none';
            if (boxFinMetodo) boxFinMetodo.style.display = 'none';
            if (selectMetodo) selectMetodo.required = false;
            if (inputData) inputData.required = false;
        }
        if (modal) modal.style.display = 'flex';
    }

    if (document.getElementById('btnNovaReceita')) {
        document.getElementById('btnNovaReceita').addEventListener('click', () => {
            abrirModal('Receita', '💰 Registrar Nova Receita', 'Descrição do Recebimento', 'Conta de Destino', true);
        });
    }

    if (document.getElementById('btnNovaDespesa')) {
        document.getElementById('btnNovaDespesa').addEventListener('click', () => {
            abrirModal('Despesa', '📉 Registrar Nova Despesa', 'Descrição da Conta / Gasto', 'Conta de Origem de Pagamento', true);
        });
    }

    if (document.getElementById('btnCadastrarConta')) {
        document.getElementById('btnCadastrarConta').addEventListener('click', () => {
            abrirModal('Banco', '🏦 Cadastrar Novo Banco ou Carteira', 'Nome do Banco / Tipo de Carteira', '', false);
        });
    }

    if (document.getElementById('btnFecharModalFin')) {
        document.getElementById('btnFecharModalFin').addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
        });
    }

    // 8. ENVIO DO FORMULÁRIO DE ATALHO DE MOVIMENTAÇÃO PARA O DRIVE (CHAVES SINCRONIZADAS)
    if (formMovimentacao) {
        formMovimentacao.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnConfirmar = formMovimentacao.querySelector('button[type="submit"]');
            const textoOriginal = btnConfirmar ? btnConfirmar.textContent : 'Confirmar';

            if (btnConfirmar) {
                btnConfirmar.textContent = 'Registrando...';
                btnConfirmar.disabled = true;
            }

            const inputDataElement = document.getElementById('finData');
            const selectMetodoElement = document.getElementById('finMetodo');

            const payload = {
                acao: 'inserirMovimentacao',
                emailCliente: usuarioEmail,
                tokenSessao: usuarioToken,
                tipoMovimentacao: finTipo.value,
                descricao: document.getElementById('finDescricao').value.trim(),
                valor: parseFloat(document.getElementById('finValor').value) || 0,
                dataMovimentacao: inputDataElement && inputDataElement.value ? inputDataElement.value : new Date().toISOString().split('T')[0],
                metodoFinanceiro: finTipo.value === 'Banco' ? 'Saldo Inicial' : (selectMetodoElement ? selectMetodoElement.value : '')
            };

            try {
                const response = await API_CLIENT.post(CONFIG.APIS.FINANCAS, payload);
                const resultado = await response.json();

                if (resultado.status === 'sucesso' || resultado.success === true) {
                    window.alert('Operação financeira registrada com sucesso!');
                    if (modal) modal.style.display = 'none';
                    carregarDashboard();
                } else {
                    alert('Erro: ' + (resultado.mensagem || resultado.error || 'Não foi possível gravar os dados.'));
                }
            } catch (err) {
                console.error(err);
                alert('Erro de conexão ao salvar lançamento.');
            } finally {
                if (btnConfirmar) {
                    btnConfirmar.textContent = textoOriginal;
                    btnConfirmar.disabled = false;
                }
            }
        });
    }

    // 9. EVENTO DE LOGOUT (SAIR COM REDIRECIONAMENTO SEGURO)
    const btnSair = document.getElementById('btnSair');
    if (btnSair) {
        btnSair.addEventListener('click', () => {
            AUTH.logout('Sessão financeira encerrada com sucesso. Até logo!');
        });
    }

    // DISPARO AUTOMÁTICO INICIAL AO CARREGAR A TELA
    carregarDashboard();
});
