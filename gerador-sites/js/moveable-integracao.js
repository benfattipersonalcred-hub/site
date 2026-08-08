// @ts-nocheck
// ============================================================
// ARQUIVO: js/moveable-integracao.js
// DESCRIÇÃO: Integra a biblioteca Moveable (daybrush) ao editor
//           avançado (DECISÃO 12). Permite ARRASTAR, MOVER e
//           REDIMENSIONAR elementos com as alças, de forma fluida
//           (60fps), com guias de alinhamento (snap).
//           A biblioteca está hospedada localmente em
//           js/vendor/moveable.js (caminho relativo).
// ============================================================

// ============================================================
// ESTADO DA INTEGRAÇÃO
// ============================================================

// Instância atual do Moveable (criada ao selecionar um elemento)
let moveableEditor = null;

// ============================================================
// FUNÇÃO: cria/atualiza o Moveable sobre o elemento selecionado
// ============================================================
function configurarMoveable(target) {
    // Se não houver biblioteca Moveable, não faz nada
    if (typeof Moveable === 'undefined') {
        // Mostra aviso no console (não trava o editor)
        console.warn('Moveable não carregada. Use a versão com arrastar em JS puro.');
        return;
    }

    // Se já existe uma instância, destrói antes de recriar
    if (moveableEditor) {
        moveableEditor.destroy();
        moveableEditor = null;
    }

    // Se não houver elemento alvo, sai (nenhuma seleção)
    if (!target) return;

    // Obtém o id do elemento selecionado (do atributo data-id)
    const idSelecionado = target.getAttribute('data-id');
    // Se não tiver id, sai
    if (!idSelecionado) return;

    // Cria a nova instância do Moveable sobre o elemento
    moveableEditor = new Moveable(document.body, {
        // O elemento alvo (o nó do canvas)
        target: target,
        // Permite ARRASTAR (mover) o elemento
        draggable: true,
        // Permite REDIMENSIONAR com as alças
        resizable: true,
        // Mantém a proporção ao segurar Shift
        keepRatio: false,
        // Mostra as alças de redimensionamento nos 4 cantos e lados
        renderDirections: ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'],
        // Ativa guias de alinhamento (snap) com outros elementos
        snappable: true,
        // Cantos arredondados das alças
        throttleDrag: 0,
        throttleResize: 0,
        // Cor das alças e linhas
        origin: false,
        // Efeito visual das alças
        edge: false,
        // Cursor de mover
        dragTargetSelf: true
    });

    // ======================================================
    // EVENTO: ao começar a arrastar
    // ======================================================
    moveableEditor.on('dragStart', () => {
        // Marca que está arrastando (para não conflitar com o histórico)
        estadoEditor.arrastando = true;
    });

    // ======================================================
    // EVENTO: durante o arrastar (mover)
    // ======================================================
    moveableEditor.on('drag', (e) => {
        // Atualiza a posição do elemento no canvas (visual)
        e.target.style.left = e.left + 'px';
        e.target.style.top = e.top + 'px';
        // Guarda os valores atuais para o estado
        moveableEditor._posX = e.left;
        moveableEditor._posY = e.top;
    });

    // ======================================================
    // EVENTO: ao soltar o arrastar
    // ======================================================
    moveableEditor.on('dragEnd', () => {
        // Se tinha posição guardada, atualiza o JSON do elemento
        if (moveableEditor && moveableEditor._posX !== undefined) {
            // Atualiza a posição no estado (base JSON)
            atualizarPosicao(idSelecionado, moveableEditor._posX, moveableEditor._posY);
            // Guarda no histórico (desfazer/refazer)
            guardarHistorico();
        }
        // Marca que não está mais arrastando
        estadoEditor.arrastando = false;
    });

    // ======================================================
    // EVENTO: durante o redimensionar (alças)
    // ======================================================
    moveableEditor.on('resize', (e) => {
        // Aplica o novo tamanho no elemento (visual)
        e.target.style.width = e.width + 'px';
        e.target.style.height = e.height + 'px';
        // Atualiza a posição (o canto pode mover)
        e.target.style.left = e.drag.left + 'px';
        e.target.style.top = e.drag.top + 'px';
        // Guarda os valores atuais
        moveableEditor._posX = e.drag.left;
        moveableEditor._posY = e.drag.top;
        moveableEditor._width = e.width;
        moveableEditor._height = e.height;
    });

    // ======================================================
    // EVENTO: ao soltar o redimensionar
    // ======================================================
    moveableEditor.on('resizeEnd', () => {
        // Se tinha valores guardados, atualiza o JSON do elemento
        if (moveableEditor && moveableEditor._width !== undefined) {
            // Atualiza a posição no estado
            atualizarPosicao(idSelecionado, moveableEditor._posX, moveableEditor._posY);
            // Atualiza o TAMANHO (largura/altura) no estado
            atualizarTamanho(idSelecionado, moveableEditor._width, moveableEditor._height);
            // Guarda no histórico
            guardarHistorico();
        }
        // Marca que não está mais arrastando
        estadoEditor.arrastando = false;
    });
}

// ============================================================
// FUNÇÃO: atualiza a LARGURA/ALTURA de um elemento no estado
// ============================================================
function atualizarTamanho(id, largura, altura) {
    // Encontra o elemento no estado
    const el = estadoEditor.elementos.find(e => e.id === id);
    // Se achar
    if (el) {
        // Garante que exista a posição do dispositivo
        if (!el.pos) el.pos = {};
        if (!el.pos[estadoEditor.dispositivo]) el.pos[estadoEditor.dispositivo] = { x: 0, y: 0 };
        // Atualiza largura e altura
        el.pos[estadoEditor.dispositivo].w = Math.round(largura);
        el.pos[estadoEditor.dispositivo].h = Math.round(altura);
    }
}

// ============================================================
// FUNÇÃO: remove a instância do Moveable
// ============================================================
function destruirMoveable() {
    // Se existir instância, destrói e zera
    if (moveableEditor) {
        moveableEditor.destroy();
        moveableEditor = null;
    }
}

// ============================================================
// INTERCEPTA A SELEÇÃO PARA ATIVAR O MOVEABLE
// ============================================================

// Guarda a função original de seleção
const selecionarElementoOriginal = window.selecionarElemento;

// Sobrescreve a seleção para também configurar o Moveable
window.selecionarElemento = function (id) {
    // Chama a função original (seleciona e renderiza)
    if (selecionarElementoOriginal) selecionarElementoOriginal(id);

    // Após o render, encontra o nó DOM do elemento selecionado
    setTimeout(() => {
        // Seleciona o canvas
        const tela = document.getElementById('telaCanvas');
        // Se não houver canvas, sai
        if (!tela) return;
        // Encontra o nó do elemento pelo data-id
        const nodo = tela.querySelector('[data-id="' + id + '"]');
        // Configura o Moveable sobre o nó encontrado
        configurarMoveable(nodo);
    }, 0);
};

// ============================================================
// DESATIVA O ARRASTAR EM JS PURO QUANDO O MOVEABLE ESTÁ ATIVO
// ============================================================
// O editor.js anexa um "configurarArrastar" nativo (mousedown) a
// cada elemento. Isso CONFLITA com o Moveable (disputam o mousedown),
// causando o comportamento de "editor não funciona direito".
// Ao usar o Moveable, desativamos esse arrastar nativo.
if (typeof Moveable !== 'undefined') {
    // Guarda a referência original
    var configurarArrastarOriginal = window.configurarArrastar;
    // Substitui por uma função vazia (não faz nada)
    window.configurarArrastar = function (nodo, el) {
        // Não configura o arrastar em JS puro (Moveable assume)
        // Mantém a função original disponível para fallback
        if (configurarArrastarOriginal && typeof Moveable === 'undefined') {
            configurarArrastarOriginal(nodo, el);
        }
    };
}

// ============================================================
// INTERCEPTA A DESELEÇÃO (clique no fundo) PARA REMOVER O MOVEABLE
// ============================================================

// Intercepta também para limpar o Moveable ao deselecionar
// (a função de deseleção é chamada dentro de configurarDrop no editor.js)
// Aqui nós apenas garantimos que, ao clicar no canvas vazio, o Moveable some.
document.addEventListener('click', (e) => {
    // Se clicou no canvas (área vazia) e não em um elemento
    if (e.target && e.target.id === 'telaCanvas') {
        // Remove a instância do Moveable
        destruirMoveable();
    }
});

// ============================================================
// INTERCEPTA A TROCA DE DISPOSITIVO PARA ATUALIZAR O MOVEABLE
// ============================================================

// Guarda a função original de renderização do canvas
var renderizarCanvasOriginal = window.renderizarCanvas;

// Sobrescreve o render para reconfigurar o Moveable após mudanças
window.renderizarCanvas = function () {
    // Chama a função original (renderiza o canvas)
    if (renderizarCanvasOriginal) renderizarCanvasOriginal();

    // Após renderizar, se houver seleção, reconfigura o Moveable
    setTimeout(function () {
        // Se não houver seleção, remove o Moveable
        if (!estadoEditor.selecionado) {
            destruirMoveable();
            return;
        }
        // Encontra o nó do elemento selecionado
        var tela = document.getElementById('telaCanvas');
        if (!tela) return;
        var nodo = tela.querySelector('[data-id="' + estadoEditor.selecionado + '"]');
        // Reconfigura o Moveable
        configurarMoveable(nodo);
    }, 0);
};
</content>
