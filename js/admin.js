/* ============================================================
   admin.js — Painel Administrativo Benfatti
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ==================== VERIFICAÇÃO DE SESSÃO ADMIN ====================
    const session = AUTH.requireSession();
    if (!session) return;

    const adminEmail = (session.email || '').toLowerCase();
    const adminToken = session.token;

    // Lista de e-mails autorizados como administradores
    const ADMIN_EMAILS = ['admin@benfatti.com.br', 'tacio@benfatti.com.br'];

    if (!ADMIN_EMAILS.includes(adminEmail)) {
        window.alert('Acesso restrito. Você não tem permissão para acessar esta área.');
        window.location.href = 'painel.html';
        return;
    }

    // ==================== ELEMENTOS PRINCIPAIS ====================
    const container = document.getElementById('adminContainer');
    const subtitulo = document.getElementById('subtituloAdmin');
    const menuItems = document.querySelectorAll('.menu-item[data-aba]');
    const abas = {
        dashboard: document.getElementById('abaDashboard'),
        conteudo: document.getElementById('abaConteudo'),
        servicos: document.getElementById('abaServicos'),
        depoimentos: document.getElementById('abaDepoimentos'),
        clientes: document.getElementById('abaClientes'),
        leads: document.getElementById('abaLeads'),
        midias: document.getElementById('abaMidias')
    };

    // ==================== TOAST SYSTEM ====================
    const toastContainer = document.getElementById('toastContainer');

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // ==================== NAVEGAÇÃO ENTRE ABAS ====================
    function alternarAba(abaNome, textoSubtitulo) {
        menuItems.forEach(item => item.classList.remove('active'));
        const btnAtivo = document.querySelector(`.menu-item[data-aba="${abaNome}"]`);
        if (btnAtivo) btnAtivo.classList.add('active');

        Object.keys(abas).forEach(key => {
            abas[key].style.display = key === abaNome ? 'block' : 'none';
        });

        if (subtitulo) subtitulo.textContent = textoSubtitulo || '';
        if (container) container.classList.remove('mobile-menu-open');
    }

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const aba = item.getAttribute('data-aba');
            const textos = {
                dashboard: 'Visão geral do sistema administrativo.',
                conteudo: 'Edite os textos da página inicial.',
                servicos: 'Gerencie os serviços oferecidos.',
                depoimentos: 'Gerencie os depoimentos de clientes.',
                clientes: 'Visualize todos os clientes cadastrados.',
                leads: 'Visualize os contatos recebidos pelo site.',
                midias: 'Faça upload e gerencie imagens.'
            };
            alternarAba(aba, textos[aba] || '');

            // Carregar dados ao trocar de aba
            if (aba === 'conteudo') carregarConteudoHome();
            if (aba === 'clientes') carregarClientes();
            if (aba === 'leads') carregarLeads();
            if (aba === 'servicos') carregarServicos();
            if (aba === 'depoimentos') carregarDepoimentos();
            if (aba === 'midias') carregarGaleria();
            if (aba === 'dashboard') carregarDashboard();
        });
    });

    // ==================== TOGGLE SIDEBAR ====================
    const btnToggleDesktop = document.getElementById('btnToggleDesktop');
    const btnToggleMobile = document.getElementById('btnToggleMobile');

    if (btnToggleDesktop) {
        btnToggleDesktop.addEventListener('click', (e) => {
            e.preventDefault();
            container.classList.remove('mobile-menu-open');
            container.classList.toggle('sidebar-collapsed');
        });
    }

    if (btnToggleMobile) {
        btnToggleMobile.addEventListener('click', (e) => {
            e.preventDefault();
            container.classList.remove('sidebar-collapsed');
            container.classList.toggle('mobile-menu-open');
        });
    }

    // ==================== BOTÃO SAIR ====================
    document.getElementById('btnSair')?.addEventListener('click', () => {
        AUTH.logout('Sessão administrativa encerrada.');
    });

    // ==================== API HELPER ====================
    async function apiRequest(payload) {
        try {
            const response = await API_CLIENT.post(CONFIG.APIS.ADMIN, payload);
            return await response.json();
        } catch (error) {
            console.error('[admin] Erro na requisição:', error);
            return { success: false, status: 'erro', mensagem: 'Erro de conexão com o servidor.' };
        }
    }

    // ==================== DASHBOARD ====================
    async function carregarDashboard() {
        const resultado = await apiRequest({
            acao: 'adminDashboard',
            emailAdmin: adminEmail,
            tokenAdmin: adminToken
        });

        if (resultado.success || resultado.status === 'sucesso') {
            document.getElementById('totalClientes').textContent = resultado.totalClientes ?? '—';
            document.getElementById('totalLeads').textContent = resultado.totalLeads ?? '—';
            document.getElementById('totalServicos').textContent = resultado.totalServicos ?? '—';
            document.getElementById('totalDepoimentos').textContent = resultado.totalDepoimentos ?? '—';
        }
    }

    // ==================== CONTEÚDO DO SITE ====================
    const formConteudo = document.getElementById('formConteudoHome');
    if (formConteudo) {
        // Carregar conteúdo atual
        async function carregarConteudoHome() {
            const resultado = await apiRequest({
                acao: 'carregarConteudoHome',
                emailAdmin: adminEmail,
                tokenAdmin: adminToken
            });
            if (resultado.success || resultado.status === 'sucesso') {
                if (resultado.conteudo) {
                    document.getElementById('editBannerTitulo').value = resultado.conteudo.bannerTitulo || '';
                    document.getElementById('editBannerSubtitulo').value = resultado.conteudo.bannerSubtitulo || '';
                    document.getElementById('editSecaoTitulo').value = resultado.conteudo.secaoTitulo || '';
                    document.getElementById('editSecaoTexto').value = resultado.conteudo.secaoTexto || '';
                }
            }
        }

        formConteudo.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                acao: 'salvarConteudoHome',
                emailAdmin: adminEmail,
                tokenAdmin: adminToken,
                bannerTitulo: document.getElementById('editBannerTitulo').value.trim(),
                bannerSubtitulo: document.getElementById('editBannerSubtitulo').value.trim(),
                secaoTitulo: document.getElementById('editSecaoTitulo').value.trim(),
                secaoTexto: document.getElementById('editSecaoTexto').value.trim()
            };
            const resultado = await apiRequest(payload);
            if (resultado.success || resultado.status === 'sucesso') {
                showToast('Conteúdo salvo com sucesso!');
            } else {
                showToast(resultado.mensagem || 'Erro ao salvar conteúdo.', 'error');
            }
        });

        carregarConteudoHome();
    }

    // ==================== CRUD: SERVIÇOS ====================
    const modal = document.getElementById('modalCrud');
    const modalTitulo = document.getElementById('modalCrudTitulo');
    const formCrud = document.getElementById('formCrud');
    const crudId = document.getElementById('crudId');
    const crudTipo = document.getElementById('crudTipo');
    const crudCamposServico = document.getElementById('crudCamposServico');
    const crudCamposDepoimento = document.getElementById('crudCamposDepoimento');

    function abrirModal(tipo, dados = null) {
        crudTipo.value = tipo;
        formCrud.reset();
        crudId.value = '';

        if (tipo === 'servico') {
            modalTitulo.textContent = dados ? 'Editar Serviço' : 'Novo Serviço';
            crudCamposServico.style.display = 'block';
            crudCamposDepoimento.style.display = 'none';
            if (dados) {
                crudId.value = dados.id || '';
                document.getElementById('crudServicoNome').value = dados.nome || '';
                document.getElementById('crudServicoDescricao').value = dados.descricao || '';
                document.getElementById('crudServicoIcone').value = dados.icone || '';
                document.getElementById('crudServicoOrdem').value = dados.ordem || 0;
            }
        } else if (tipo === 'depoimento') {
            modalTitulo.textContent = dados ? 'Editar Depoimento' : 'Novo Depoimento';
            crudCamposServico.style.display = 'none';
            crudCamposDepoimento.style.display = 'block';
            if (dados) {
                crudId.value = dados.id || '';
                document.getElementById('crudDepoNome').value = dados.nome || '';
                document.getElementById('crudDepoTexto').value = dados.texto || '';
                document.getElementById('crudDepoFoto').value = dados.foto || '';
                document.getElementById('crudDepoEstrelas').value = dados.estrelas || 5;
            }
        }

        modal.classList.add('active');
    }

    function fecharModal() {
        modal.classList.remove('active');
    }

    document.getElementById('btnFecharModal')?.addEventListener('click', fecharModal);
    document.getElementById('btnCancelarCrud')?.addEventListener('click', fecharModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) fecharModal();
    });

    // Serviços
    async function carregarServicos() {
        const resultado = await apiRequest({
            acao: 'listarServicos',
            emailAdmin: adminEmail,
            tokenAdmin: adminToken
        });

        const tbody = document.getElementById('tbodyServicos');
        if (resultado.success || resultado.status === 'sucesso') {
            const servicos = resultado.servicos || [];
            if (servicos.length === 0) {
                tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Nenhum serviço cadastrado.</td></tr>';
                return;
            }
            tbody.innerHTML = servicos.map(s => `
                <tr>
                    <td>${s.icone ? `<img src="${s.icone}" style="width: 40px; height: 40px; object-fit: contain;">` : '—'}</td>
                    <td><strong>${s.nome || '—'}</strong></td>
                    <td>${s.descricao || '—'}</td>
                    <td>${s.ordem || 0}</td>
                    <td>
                        <button class="btn-edit btn-sm" onclick="editarServico('${s.id}')">Editar</button>
                        <button class="btn-danger btn-sm" onclick="excluirServico('${s.id}')">Excluir</button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Erro ao carregar serviços.</td></tr>';
        }
    }

    document.getElementById('btnNovoServico')?.addEventListener('click', () => abrirModal('servico'));

    window.editarServico = async function(id) {
        const resultado = await apiRequest({
            acao: 'listarServicos',
            emailAdmin: adminEmail,
            tokenAdmin: adminToken
        });
        if (resultado.servicos) {
            const servico = resultado.servicos.find(s => s.id === id);
            if (servico) abrirModal('servico', servico);
        }
    };

    window.excluirServico = async function(id) {
        if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
        const resultado = await apiRequest({
            acao: 'excluirServico',
            emailAdmin: adminEmail,
            tokenAdmin: adminToken,
            id: id
        });
        if (resultado.success || resultado.status === 'sucesso') {
            showToast('Serviço excluído com sucesso!');
            carregarServicos();
            carregarDashboard();
        } else {
            showToast(resultado.mensagem || 'Erro ao excluir.', 'error');
        }
    };

    // Depoimentos
    async function carregarDepoimentos() {
        const resultado = await apiRequest({
            acao: 'listarDepoimentos',
            emailAdmin: adminEmail,
            tokenAdmin: adminToken
        });

        const tbody = document.getElementById('tbodyDepoimentos');
        if (resultado.success || resultado.status === 'sucesso') {
            const depoimentos = resultado.depoimentos || [];
            if (depoimentos.length === 0) {
                tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Nenhum depoimento cadastrado.</td></tr>';
                return;
            }
            tbody.innerHTML = depoimentos.map(d => `
                <tr>
                    <td>${d.foto ? `<img src="${d.foto}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">` : '—'}</td>
                    <td><strong>${d.nome || '—'}</strong></td>
                    <td>${d.texto || '—'}</td>
                    <td>${'★'.repeat(parseInt(d.estrelas) || 0)}${'☆'.repeat(5 - (parseInt(d.estrelas) || 0))}</td>
                    <td>
                        <button class="btn-edit btn-sm" onclick="editarDepoimento('${d.id}')">Editar</button>
                        <button class="btn-danger btn-sm" onclick="excluirDepoimento('${d.id}')">Excluir</button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Erro ao carregar depoimentos.</td></tr>';
        }
    }

    document.getElementById('btnNovoDepoimento')?.addEventListener('click', () => abrirModal('depoimento'));

    window.editarDepoimento = async function(id) {
        const resultado = await apiRequest({
            acao: 'listarDepoimentos',
            emailAdmin: adminEmail,
            tokenAdmin: adminToken
        });
        if (resultado.depoimentos) {
            const depo = resultado.depoimentos.find(d => d.id === id);
            if (depo) abrirModal('depoimento', depo);
        }
    };

    window.excluirDepoimento = async function(id) {
        if (!confirm('Tem certeza que deseja excluir este depoimento?')) return;
        const resultado = await apiRequest({
            acao: 'excluirDepoimento',
            emailAdmin: adminEmail,
            tokenAdmin: adminToken,
            id: id
        });
        if (resultado.success || resultado.status === 'sucesso') {
            showToast('Depoimento excluído com sucesso!');
            carregarDepoimentos();
            carregarDashboard();
        } else {
            showToast(resultado.mensagem || 'Erro ao excluir.', 'error');
        }
    };

    // Submit do formulário CRUD
    formCrud?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tipo = crudTipo.value;
        const id = crudId.value;
        const isEdicao = !!id;

        let payload;

        if (tipo === 'servico') {
            payload = {
                acao: isEdicao ? 'editarServico' : 'criarServico',
                emailAdmin: adminEmail,
                tokenAdmin: adminToken,
                id: id || undefined,
                nome: document.getElementById('crudServicoNome').value.trim(),
                descricao: document.getElementById('crudServicoDescricao').value.trim(),
                icone: document.getElementById('crudServicoIcone').value.trim(),
                ordem: parseInt(document.getElementById('crudServicoOrdem').value) || 0
            };
        } else if (tipo === 'depoimento') {
            payload = {
                acao: isEdicao ? 'editarDepoimento' : 'criarDepoimento',
                emailAdmin: adminEmail,
                tokenAdmin: adminToken,
                id: id || undefined,
                nome: document.getElementById('crudDepoNome').value.trim(),
                texto: document.getElementById('crudDepoTexto').value.trim(),
                foto: document.getElementById('crudDepoFoto').value.trim(),
                estrelas: parseInt(document.getElementById('crudDepoEstrelas').value) || 5
            };
        } else {
            return;
        }

        const resultado = await apiRequest(payload);
        if (resultado.success || resultado.status === 'sucesso') {
            showToast(isEdicao ? 'Registro atualizado com sucesso!' : 'Registro criado com sucesso!');
            fecharModal();
            if (tipo === 'servico') carregarServicos();
            if (tipo === 'depoimento') carregarDepoimentos();
            carregarDashboard();
        } else {
            showToast(resultado.mensagem || 'Erro ao salvar.', 'error');
        }
    });

    // ==================== CLIENTES ====================
    async function carregarClientes() {
        const resultado = await apiRequest({
            acao: 'listarClientes',
            emailAdmin: adminEmail,
            tokenAdmin: adminToken
        });

        const tbody = document.getElementById('tbodyClientes');
        if (resultado.success || resultado.status === 'sucesso') {
            const clientes = resultado.clientes || [];
            if (clientes.length === 0) {
                tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Nenhum cliente cadastrado.</td></tr>';
                return;
            }
            tbody.innerHTML = clientes.map(c => `
                <tr>
                    <td>${c.id || '—'}</td>
                    <td><strong>${c.nome || '—'}</strong></td>
                    <td>${c.email || '—'}</td>
                    <td>${c.tel || '—'}</td>
                    <td>${c.cidade || '—'}</td>
                    <td><span class="badge badge-success">Ativo</span></td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Erro ao carregar clientes.</td></tr>';
        }
    }

    // ==================== LEADS ====================
    async function carregarLeads() {
        const resultado = await apiRequest({
            acao: 'listarLeads',
            emailAdmin: adminEmail,
            tokenAdmin: adminToken
        });

        const tbody = document.getElementById('tbodyLeads');
        if (resultado.success || resultado.status === 'sucesso') {
            const leads = resultado.leads || [];
            if (leads.length === 0) {
                tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Nenhum lead recebido.</td></tr>';
                return;
            }
            tbody.innerHTML = leads.map(l => `
                <tr>
                    <td>${l.id || '—'}</td>
                    <td><strong>${l.nome || '—'}</strong></td>
                    <td>${l.email || '—'}</td>
                    <td>${l.assunto || '—'}</td>
                    <td>${l.mensagem || '—'}</td>
                    <td>${l.data || '—'}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Erro ao carregar leads.</td></tr>';
        }
    }

    // ==================== UPLOAD DE MÍDIAS ====================
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadPreview = document.getElementById('uploadPreview');
    const uploadActions = document.getElementById('uploadActions');
    const btnEnviarUpload = document.getElementById('btnEnviarUpload');
    const btnCancelarUpload = document.getElementById('btnCancelarUpload');

    let arquivosSelecionados = [];

    uploadArea?.addEventListener('click', () => fileInput?.click());

    uploadArea?.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea?.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea?.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            adicionarArquivos(e.dataTransfer.files);
        }
    });

    fileInput?.addEventListener('change', () => {
        if (fileInput.files.length) {
            adicionarArquivos(fileInput.files);
        }
    });

    function adicionarArquivos(files) {
        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                showToast(`Arquivo "${file.name}" excede 5MB.`, 'error');
                continue;
            }
            if (!file.type.match(/^image\/(png|jpg|jpeg|webp)$/)) {
                showToast(`Formato não suportado: "${file.name}".`, 'error');
                continue;
            }
            arquivosSelecionados.push(file);
        }
        atualizarPreview();
    }

    function atualizarPreview() {
        uploadPreview.innerHTML = '';
        if (arquivosSelecionados.length === 0) {
            uploadActions.style.display = 'none';
            return;
        }
        uploadActions.style.display = 'flex';
        arquivosSelecionados.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const item = document.createElement('div');
                item.className = 'preview-item';
                item.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <button class="remove-img" data-index="${index}">&times;</button>
                `;
                item.querySelector('.remove-img').addEventListener('click', () => {
                    arquivosSelecionados.splice(index, 1);
                    atualizarPreview();
                });
                uploadPreview.appendChild(item);
            };
            reader.readAsDataURL(file);
        });
    }

    btnCancelarUpload?.addEventListener('click', () => {
        arquivosSelecionados = [];
        atualizarPreview();
        if (fileInput) fileInput.value = '';
    });

    btnEnviarUpload?.addEventListener('click', async () => {
        if (arquivosSelecionados.length === 0) return;

        btnEnviarUpload.disabled = true;
        btnEnviarUpload.textContent = 'Enviando...';

        let sucesso = 0;
        let erros = 0;

        for (const file of arquivosSelecionados) {
            const base64 = await fileParaBase64(file);
            const resultado = await apiRequest({
                acao: 'uploadImagem',
                emailAdmin: adminEmail,
                tokenAdmin: adminToken,
                nomeArquivo: file.name,
                tipoArquivo: file.type,
                conteudoBase64: base64
            });
            if (resultado.success || resultado.status === 'sucesso') {
                sucesso++;
            } else {
                erros++;
            }
        }

        btnEnviarUpload.disabled = false;
        btnEnviarUpload.textContent = 'Enviar Imagens';

        if (erros === 0) {
            showToast(`${sucesso} imagem(ns) enviada(s) com sucesso!`);
        } else {
            showToast(`${sucesso} enviada(s), ${erros} falha(s).`, 'error');
        }

        arquivosSelecionados = [];
        atualizarPreview();
        if (fileInput) fileInput.value = '';
        carregarGaleria();
    });

    function fileParaBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // ==================== GALERIA DE MÍDIAS ====================
    async function carregarGaleria() {
        const resultado = await apiRequest({
            acao: 'listarImagens',
            emailAdmin: adminEmail,
            tokenAdmin: adminToken
        });

        const galeria = document.getElementById('galeriaMidias');
        if (resultado.success || resultado.status === 'sucesso') {
            const imagens = resultado.imagens || [];
            if (imagens.length === 0) {
                galeria.innerHTML = '<div style="color: var(--cor-texto-mutado); grid-column: 1/-1; text-align: center; padding: 2rem;">Nenhuma imagem enviada ainda.</div>';
                return;
            }
            galeria.innerHTML = imagens.map(img => `
                <div class="gallery-item">
                    <img src="${img.url}" alt="${img.nome || 'Imagem'}">
                    <div class="gallery-actions">
                        <button class="btn-danger btn-sm" onclick="excluirImagem('${img.id}')">Excluir</button>
                    </div>
                </div>
            `).join('');
        } else {
            galeria.innerHTML = '<div style="color: var(--cor-texto-mutado); grid-column: 1/-1; text-align: center; padding: 2rem;">Erro ao carregar galeria.</div>';
        }
    }

    window.excluirImagem = async function(id) {
        if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;
        const resultado = await apiRequest({
            acao: 'excluirImagem',
            emailAdmin: adminEmail,
            tokenAdmin: adminToken,
            id: id
        });
        if (resultado.success || resultado.status === 'sucesso') {
            showToast('Imagem excluída com sucesso!');
            carregarGaleria();
        } else {
            showToast(resultado.mensagem || 'Erro ao excluir.', 'error');
        }
    };

    // ==================== BOTÃO INICIALIZAR DADOS ====================
    const btnInicializar = document.getElementById('btnInicializarDados');
    const statusInicializacao = document.getElementById('statusInicializacao');

    if (btnInicializar) {
        btnInicializar.addEventListener('click', async () => {
            if (!confirm('Isso irá importar os dados atuais do site (serviços, depoimentos, textos) para a planilha. Continuar?')) return;
            
            btnInicializar.disabled = true;
            btnInicializar.textContent = '⏳ Importando...';
            statusInicializacao.textContent = 'Importando dados existentes do site...';
            statusInicializacao.style.color = 'var(--cor-texto-mutado)';

            const resultado = await apiRequest({
                acao: 'inicializarDadosAdmin',
                emailAdmin: adminEmail,
                tokenAdmin: adminToken
            });

            if (resultado.success || resultado.status === 'sucesso') {
                statusInicializacao.innerHTML = `✅ ${resultado.mensagem} (${resultado.servicos} serviços, ${resultado.depoimentos} depoimentos, ${resultado.conteudo} itens de conteúdo)`;
                statusInicializacao.style.color = 'var(--cor-sucesso)';
                showToast('Dados importados com sucesso!');
                carregarDashboard();
            } else {
                statusInicializacao.textContent = `❌ Erro: ${resultado.mensagem || 'Falha ao importar dados'}`;
                statusInicializacao.style.color = 'var(--cor-erro)';
                showToast('Erro ao importar dados.', 'error');
            }

            btnInicializar.disabled = false;
            btnInicializar.textContent = '📥 Importar Dados do Site';
        });
    }

    // ==================== INICIALIZAÇÃO ====================
    carregarDashboard();
});
