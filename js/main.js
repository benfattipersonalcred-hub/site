// Captura o contêiner da lista do menu de navegação
let ul = document.querySelector('nav .ul');

/**
 * Abre o menu responsivo adicionando a classe configurada no style.css
 */
function openMenu() {
    if (ul) {
        ul.classList.add('ativo');
    }
}

/**
 * Fecha o menu responsivo removendo a classe configurada no style.css
 */
function closeMenu() {
    if (ul) {
        ul.classList.remove('ativo');
    }
}
