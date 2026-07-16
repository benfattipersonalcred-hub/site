document.addEventListener('DOMContentLoaded', () => {
    const usuarioNome = localStorage.getItem('usuario_nome');
    const usuarioEmail = localStorage.getItem('usuario_email');
    const usuarioToken = localStorage.getItem('usuario_token');

    // URL DA API DO SEU MICROSSERVIÇO (Alterar_Dados_Perfil)
    const URL_API_PERFIL = 'https://script.google.com/macros/s/AKfycbw6hiKqVeu-ruqF1jKHVfEoZ8ET0G00Dk5AF4cxbg0fV3P8iCKlgx27gpgkXRrrWBNU/exec';

    if (!usuarioNome || !usuarioEmail || !usuarioToken) {
        window.alert('Acesso negado: Você precisa realizar o login para acessar esta página.');
        const linkRetorno = document.createElement('a');
        linkRetorno.href = 'login.html';
        document.body.appendChild(linkRetorno);
        linkRetorno.click();
        return;
    }

    document.getElementById('nomeUsuario').textContent = usuarioNome;
    document.getElementById('emailUsuario').textContent = usuarioEmail;
    document.getElementById('tokenUsuario').textContent = usuarioToken;

    const abaVisaoGeral = document.getElementById('abaVisaoGeral');
    const abaConfiguracoes = document.getElementById('abaConfiguracoes');
    const conteudoVisaoGeral = document.getElementById('conteudoVisaoGeral');
    const conteudoConfiguracoes = document.getElementById('conteudoConfiguracoes');
    const subtituloPainel = document.getElementById('subtituloPainel');
    const panelContainer = document.getElementById('panelContainer');

    function alternarAba(abaAtivar, conteudoMostrar, conteudoEsconder, textoSubtitulo) {
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
        abaAtivar.classList.add('active');
        conteudoMostrar.style.display = 'block';
        conteudoEsconder.style.display = 'none';
        subtituloPainel.textContent = textoSubtitulo;
        panelContainer.classList.remove('mobile-menu-open');
    }

    if (abaVisaoGeral) {
        abaVisaoGeral.addEventListener('click', (e) => {
            e.preventDefault();
            alternarAba(abaVisaoGeral, conteudoVisaoGeral, conteudoConfiguracoes, 'Bem-vindo ao seu painel de controle exclusivo.');
        });
    }

    if (abaConfiguracoes) {
        abaConfiguracoes.addEventListener('click', async (e) => {
            e.preventDefault();
            alternarAba(abaConfiguracoes, conteudoConfiguracoes, conteudoVisaoGeral, 'Gerencie e atualize seus dados de cadastro.');

            try {
                const payload = { acao: 'buscarCadastroCompleto', email: localStorage.getItem('usuario_email'), token: localStorage.getItem('usuario_token') };

                const response = await fetch(URL_API_PERFIL, {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });
                const resultado = await response.json();

                if (resultado.status === 'sucesso') {
                    let dados = resultado.dados;

                    // 🛠️ TRATAMENTO DE CHOQUE (CORREÇÃO DA IMAGEM):
                    // Se o servidor mandar a linha inteira colada dentro de 'nome' ou se vier como um objeto com vírgulas
                    if (dados.nome && dados.nome.includes(',')) {
                        const colunas = dados.nome.split(',');
                        // Quebra a linha e mapeia coluna por coluna na ordem exata da planilha mãe (A=ID, B=Nome, C=Email...)
                        dados = {
                            nome: colunas[1] ? colunas[1].trim() : "",
                            email: colunas[2] ? colunas[2].trim() : "",
                            tel: colunas[3] ? colunas[3].trim() : "",
                            endereco: colunas[4] ? colunas[4].trim() : "",
                            numero: colunas[5] ? colunas[5].trim() : "",
                            bairro: colunas[6] ? colunas[6].trim() : "",
                            cidade: colunas[7] ? colunas[7].trim() : "",
                            estado: colunas[8] ? colunas[8].trim() : ""
                        };
                    }
                    // Se o erro vier no formato de string bruta diretamente no objeto principal de dados
                    else if (typeof dados === 'string' && dados.includes(',')) {
                        const colunas = dados.split(',');
                        dados = {
                            nome: colunas[1] ? colunas[1].trim() : "",
                            email: colunas[2] ? colunas[2].trim() : "",
                            tel: colunas[3] ? colunas[3].trim() : "",
                            endereco: colunas[4] ? colunas[4].trim() : "",
                            numero: colunas[5] ? colunas[5].trim() : "",
                            bairro: colunas[6] ? colunas[6].trim() : "",
                            cidade: colunas[7] ? colunas[7].trim() : "",
                            estado: colunas[8] ? colunas[8].trim() : ""
                        };
                    }

                    // Distribui as informações limpas e separadas dentro de cada input na tela
                    document.getElementById('editNome').value = dados.nome || '';
                    document.getElementById('editEmail').value = dados.email || '';
                    document.getElementById('editTel').value = dados.tel || '';
                    document.getElementById('editEndereco').value = dados.endereco || '';
                    document.getElementById('editNumero').value = dados.numero || '';
                    document.getElementById('editBairro').value = dados.bairro || '';
                    document.getElementById('editCidade').value = dados.cidade || '';
                    document.getElementById('editEstado').value = dados.estado || '';
                    document.getElementById('editSenha').value = '';
                } else {
                    alert('Erro ao carregar perfil: ' + resultado.mensagem);
                }
            } catch (err) {
                console.error(err);
                alert('Erro técnico ao conectar com o script de perfil.');
            }
        });
    }

    const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');
    if (btnCancelarEdicao) {
        btnCancelarEdicao.addEventListener('click', () => {
            document.getElementById('formAlterarDados').reset();
            alternarAba(abaVisaoGeral, conteudoVisaoGeral, conteudoConfiguracoes, 'Bem-vindo ao seu painel de controle exclusivo.');
        });
    }

    const formAlterarDados = document.getElementById('formAlterarDados');
    if (formAlterarDados) {
        formAlterarDados.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btnSalvar = document.getElementById('btnSalvarEdicao');
            const textoOriginal = btnSalvar.textContent;
            btnSalvar.textContent = 'Gravando Alterações...';
            btnSalvar.disabled = true;

            const payloadAtualizacao = {
                acao: 'editarCadastroCliente',
                tokenSessao: localStorage.getItem('usuario_token'),
                emailOriginal: localStorage.getItem('usuario_email'),
                nome: document.getElementById('editNome').value.trim(),
                email: document.getElementById('editEmail').value.trim(),
                tel: document.getElementById('editTel').value.trim(),
                endereco: document.getElementById('editEndereco').value.trim(),
                numero: document.getElementById('editNumero').value.trim(),
                bairro: document.getElementById('editBairro').value.trim(),
                cidade: document.getElementById('editCidade').value.trim(),
                estado: document.getElementById('editEstado').value.trim().toUpperCase(),
                senha: document.getElementById('editSenha').value
            };

            try {
                const response = await fetch(URL_API_PERFIL, {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payloadAtualizacao)
                });
                const resultado = await response.json();

                if (resultado.status === 'sucesso') {
                    window.alert('Seus dados foram atualizados com sucesso no sistema!');
                    localStorage.setItem('usuario_nome', payloadAtualizacao.nome);
                    document.getElementById('nomeUsuario').textContent = payloadAtualizacao.nome;
                    alternarAba(abaVisaoGeral, conteudoVisaoGeral, conteudoConfiguracoes, 'Bem-vindo ao seu painel de controle exclusivo.');
                } else {
                    alert('Erro: ' + resultado.mensagem);
                }
            } catch (err) {
                console.error(err);
                alert('Erro na comunicação assíncrona.');
            } finally {
                btnSalvar.textContent = textoOriginal;
                btnSalvar.disabled = false;
            }
        });
    }

    const btnToggleDesktop = document.getElementById('btnToggleDesktop');
    const btnToggleMobile = document.getElementById('btnToggleMobile');

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