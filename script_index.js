


let chapeusEl = document.querySelectorAll(".chapeu"); //Guarda todas as imagem de chapéu (player 1 e 2)
let carasEl = document.querySelectorAll(".cara");//Guarda todas as imagem de cara (player 1 e 2)
let roupasEl = document.querySelectorAll(".roupa");//Guarda todas as imagem de roupa (player 1 e 2)
let armasEl = document.querySelectorAll(".arma");//Guarda todas as imagens de arma (player 1 e 2)

let botoesChapeuEl = document.querySelectorAll(".botao-chapeu"); //Guarda todos os botões de chapéu (player 1 e 2)
let botoesRoupaEl = document.querySelectorAll(".botao-roupa"); //Guarda todos os botões de roupa (player 1 e 2)
let botoesCaraEl = document.querySelectorAll(".botao-cara"); //Guarda todos os botões de cara (player 1 e 2)
let botoesArmaEl = document.querySelectorAll(".botao-arma"); //Guarda todos os botões de arma (player 1 e 2)

let botaoFightEl = document.querySelector("#botao-fight"); //Guarda o botão de jogar
let botaoFecharEl = document.querySelector("#botao-fechar"); //Guarda o botão de fechar coisas
let botaoProntoEl = document.querySelector("#botao-pronto"); // Guarda o botão pronto
let botaoJogarEl = document.querySelector("#botao-jogar"); //Guarda o botão de jogar
let botaoControlesEl = document.querySelector("#botao-controles"); //Guarda o botão de acessar os controles
let botaoMenuPrincipalVoltarEl = document.querySelector("#botao-menu-principal-voltar");//Guarda o botão de voltar para o menu principal
let botaoControlesPlayerEl = document.querySelectorAll(".botao-controles-player");//Guarda os botões de seleção de player na troca de teclas
let botaoOpcoesControlesAtaqueEl = document.querySelector("#botao-controles-ataque"); //Guarda o botão de acessar a mudança de teclas de ataque
let botaoOpcoesControlesMovimentoEl = document.querySelector("#botao-controles-movimento"); //Guarda o botão de acessar a mudança de teclas de movimento
let botoesAlterarTeclasEl = document.querySelectorAll(".botao-alterar-controles"); //Guarda os botões de ir pra tela de alterar tecla
let botaoControlesConfirmarTeclaEl = document.querySelector("#botao-controles-confirmar"); //Guarda o botão de confirmar tecla

let totalDeChapeus = chapeusEl.length;
let totalDeCaras = carasEl.length;
let totalDeRoupas = roupasEl.length;
let totalDeArmas = armasEl.length;

let containerSelecaoArmasEl = document.querySelector("#selecao-arma"); // Guarda o container da seleção de armas
let containersTodoOPlayerEl = document.querySelectorAll(".todo-o-player"); // Guarda o container das imagens dos players
let containerBoostsEl = document.querySelector("#container-boosts"); // Guarda o container que tem o texto dos boosts
let containerMenuPrincipalEl = document.querySelector("#menu-principal"); //Guarda o container do menu principal
let containerControlesEl = document.querySelector("#controles-aba-player"); //Guarda o container das mudanças de controle
let containerControlesOpcoesEl = document.querySelector("#controles-opcoes");//Guarda o container de selecionar opções de mudança de tecla
let containerControlesAlterarTeclaAtaqueEl = document.querySelector("#controles-alterar-ataque"); //Guarda o container de alterar tecla de ataque
let containerControlesAlterarTeclaMovimentoEl = document.querySelector("#controles-alterar-movimento"); // Guarda o container de alterar tecla de movimento
let containerControlesInformarTeclaEl = document.querySelector("#controles-informar-tecla"); //Guarda o container de informar a nova tecla

let imagensAcessorios = document.querySelectorAll(".acessorio"); //Guarda todas as imagens de acessórios tanto player 1 e 2

// mapa pra pegar o objeto e nao a string

let teclasPlayer1 = { //guarda teclas do player 1
    cima: 'KeyW',
    baixo: 'KeyS',
    direita: 'KeyD',
    esquerda: 'KeyA',
    ataque: 'KeyG',
    dash: 'KeyH',
    arremesso: 'KeyJ',
};

let teclasPlayer2 = { //guarda teclas do player 2
    cima: 'ArrowUp',
    baixo: 'ArrowDown',
    direita: 'ArrowRight',
    esquerda: 'ArrowLeft',
    ataque: 'Numpad1',
    dash: 'Numpad2',
    arremesso: 'Numpad3',
};

const players = {
    teclasPlayer1: teclasPlayer1,
    teclasPlayer2: teclasPlayer2
};



//ALTERAÇÃO DO PIETRO
let inputsNomeEl = document.querySelectorAll(".inputNome");

/*
O total dos acessórios contam tanto para o player um e dois, ou seja, se temos 4 opções de 
chapéu para cada jogador, na verdade o total de chapéus que teremos no vetor será 8.
*/

let posicaoAtualDoChapeuPlayer1 = -1;
let posicaoAtualDaCaraPlayer1 = -1;
let posicaoAtualDaRoupaPlayer1 = -1;
let posicaoAtualDaArmaPlayer1 = -1;

/*
Variáveis para guardar qual acessório respectivamente o player um está vestindo. A posição -1 
representa a não equipação de acessórios pelo jogador
*/

let posicaoAtualDoChapeuPlayer2 = totalDeChapeus / 2 - 1;
let posicaoAtualDaCaraPlayer2 = totalDeCaras / 2 - 1;
let posicaoAtualDaRoupaPlayer2 = totalDeRoupas / 2 - 1;
let posicaoAtualDaArmaPlayer2 = totalDeArmas / 2 - 1;

/*
Variáveis para guardar qual acessório respectivamente o player dois está vestindo. A posição 
totalDe... / 2 - 1 representa a não equipação de acessórios pelo jogador.
*/

let posicaoAtualDoBoost = 0; // Guarda posição do texto dos boosts

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

function mudarChapeu(event) { //Função para mudar o chapéu
    let botaoClicadoeElEl = event.currentTarget;

    if (botaoClicadoeElEl.id == "botao-chapeu-passar-player1") { //Verifica qual foi o botão clicado

        if (posicaoAtualDoChapeuPlayer1 > -1) {
            chapeusEl[posicaoAtualDoChapeuPlayer1].classList.remove("habilitar");
        }
        //Se tiver vestindo algum acessório e tiver clicado no botão, remove o acessório previamente vestido

        posicaoAtualDoChapeuPlayer1++;
        //soma um na posição dos chapéis do jogador

        if (posicaoAtualDoChapeuPlayer1 >= totalDeChapeus / 2) {
            posicaoAtualDoChapeuPlayer1 = -1;
        }
        //Se tiver passado da última posição, voltar para a primeira

        if (posicaoAtualDoChapeuPlayer1 === -1) {
            return;
        }
        /*
        A posição total.. / 2 - 1 representa a não equipação de acessórios pelo jogador. 
        Caso esteja nela, sair da função antes de colocar um acessório.
        */

        chapeusEl[posicaoAtualDoChapeuPlayer1].classList.add("habilitar");
        //colocar o acessório da posição atual
    }

    if (botaoClicadoeElEl.id == "botao-chapeu-voltar-player1") {//Verifica qual foi o botão clicado
        if (posicaoAtualDoChapeuPlayer1 > -1) {
            chapeusEl[posicaoAtualDoChapeuPlayer1].classList.remove("habilitar");
        }
        //Se tiver vestindo algum acessório e tiver clicado no botão, remove o acessório previamente vestido.


        posicaoAtualDoChapeuPlayer1--;
        //subtrai um na posição dos chapéis do jogador

        if (posicaoAtualDoChapeuPlayer1 === -1) {
            return;
        }
        //caso o jogador tenha voltado para a posição onde ele não veste nada, sai da função

        if (posicaoAtualDoChapeuPlayer1 < -1) {
            posicaoAtualDoChapeuPlayer1 = totalDeChapeus / 2 - 1;
        }
        /*
        caso o jogador volte uma posição enquanto está na posição -1, levar ele para a última posição,
        que é o total / 2 - 1
        */

        chapeusEl[posicaoAtualDoChapeuPlayer1].classList.add("habilitar");
        //colocar o acessório da posição atual no jogador
    }

    if (botaoClicadoeElEl.id == "botao-chapeu-passar-player2") {//Verifica qual foi o botão clicado
        if (posicaoAtualDoChapeuPlayer2 >= totalDeChapeus / 2) {
            chapeusEl[posicaoAtualDoChapeuPlayer2].classList.remove("habilitar");
        }
        //Se tiver vestindo algum acessório e tiver clicado no botão, remove o acessório previamente vestido

        posicaoAtualDoChapeuPlayer2++;
        //soma um na posição dos chapéis do jogador

        if (posicaoAtualDoChapeuPlayer2 >= totalDeChapeus) {
            posicaoAtualDoChapeuPlayer2 = totalDeChapeus / 2 - 1;
        }
        //Se tiver passado da última posição, voltar para a primeira

        if (posicaoAtualDoChapeuPlayer2 === totalDeChapeus / 2 - 1) {
            return;
        }
        /*
        A posição total.. / 2 - 1 representa a não equipação de acessórios pelo jogador. 
        Caso esteja nela, sair da função antes de colocar um acessório.
        */

        chapeusEl[posicaoAtualDoChapeuPlayer2].classList.add("habilitar");
        //colocar o acessório da posição atual
    }

    if (botaoClicadoeElEl.id == "botao-chapeu-voltar-player2") {//Verifica qual foi o botão clicado
        if (posicaoAtualDoChapeuPlayer2 >= totalDeChapeus / 2) {
            chapeusEl[posicaoAtualDoChapeuPlayer2].classList.remove("habilitar");
        }
        //Se tiver vestindo algum acessório e tiver clicado no botão, remove o acessório previamente vestido

        posicaoAtualDoChapeuPlayer2--;
        //subtrai um na posição dos chapéis do jogador

        if (posicaoAtualDoChapeuPlayer2 < totalDeChapeus / 2 - 1) {
            posicaoAtualDoChapeuPlayer2 = totalDeChapeus - 1;
        }
        /*
        Se tiver voltado até antes da primeira posição, levar ele pra última
        */

        if (posicaoAtualDoChapeuPlayer2 === totalDeChapeus / 2 - 1) {
            return;
        }
        //Se estiver na posição da não equipação de acessórios, sair da função antes de trocar o acessório

        chapeusEl[posicaoAtualDoChapeuPlayer2].classList.add("habilitar");
        //troca o acessório para a posição atual
    }
}



function mudarCara(event) { //Função para mudar a cara
    let botaoClicadoeElEl = event.currentTarget;

    if (botaoClicadoeElEl.id == "botao-cara-passar-player1") {//Verifica qual foi o botão clicado
        if (posicaoAtualDaCaraPlayer1 > -1) {
            carasEl[posicaoAtualDaCaraPlayer1].classList.remove("habilitar");
        }
        //Se tiver vestindo algum acessório e tiver clicado no botão, remove o acessório previamente vestido.

        posicaoAtualDaCaraPlayer1++;
        //soma um na posição das caras do jogador

        if (posicaoAtualDaCaraPlayer1 >= totalDeCaras / 2) {
            posicaoAtualDaCaraPlayer1 = -1;
            return;
        }
        /*
        caso passe da última posição dos chapéis do player 1 (representada pelo total dividido por 2
        já que o vetor das imagens possui os chapéis dos dois players), voltar para a posição inicial
        (sem equipar nada)
        */

        carasEl[posicaoAtualDaCaraPlayer1].classList.add("habilitar");
        //colocar o acessório da posição atual no jogador
    }

    if (botaoClicadoeElEl.id == "botao-cara-voltar-player1") {//Verifica qual foi o botão clicado
        if (posicaoAtualDaCaraPlayer1 > -1) {
            carasEl[posicaoAtualDaCaraPlayer1].classList.remove("habilitar");
        }
        //Se tiver vestindo algum acessório e tiver clicado no botão, remove o acessório previamente vestido.

        posicaoAtualDaCaraPlayer1--;
        //subtrai um na posição das caras do jogador

        if (posicaoAtualDaCaraPlayer1 === -1) {
            return;
        }
        //caso o jogador tenha voltado para a posição onde ele não veste nada, sai da função antes de trooar acessório

        if (posicaoAtualDaCaraPlayer1 < -1) {
            posicaoAtualDaCaraPlayer1 = totalDeCaras / 2 - 1;
        }
        /*
        caso o jogador volte uma posição enquanto está na posição -1, levar ele para a última posição,
        que é o total / 2 - 1
        */

        carasEl[posicaoAtualDaCaraPlayer1].classList.add("habilitar");
         //colocar o acessório da posição atual no jogador
    }

    if (botaoClicadoeElEl.id == "botao-cara-passar-player2") {//Verifica qual foi o botão clicado
        if (posicaoAtualDaCaraPlayer2 >= totalDeCaras / 2) {
            carasEl[posicaoAtualDaCaraPlayer2].classList.remove("habilitar");
        }
        //Se tiver vestindo algum acessório e tiver clicado no botão, remove o acessório previamente vestido

        posicaoAtualDaCaraPlayer2++;
        //soma um na posição das caras do jogador

        if (posicaoAtualDaCaraPlayer2 >= totalDeCaras) {
            posicaoAtualDaCaraPlayer2 = totalDeCaras / 2 - 1;
        }
        //Se tiver passado da última posição, voltar para a primeira

        if (posicaoAtualDaCaraPlayer2 === totalDeCaras / 2 - 1) {
            return;
        }
        /*
        A posição total.. / 2 - 1 representa a não equipação de acessórios pelo jogador. 
        Caso esteja nela, sair da função antes de colocar um acessório.
        */

        carasEl[posicaoAtualDaCaraPlayer2].classList.add("habilitar");
        //colocar o acessório da posição atual
    }

    if (botaoClicadoeElEl.id == "botao-cara-voltar-player2") {//Verifica qual foi o botão clicado
        if (posicaoAtualDaCaraPlayer2 >= totalDeCaras / 2) {
            carasEl[posicaoAtualDaCaraPlayer2].classList.remove("habilitar");
        }
        //Se tiver vestindo algum acessório e tiver clicado no botão, remove o acessório previamente vestido

        posicaoAtualDaCaraPlayer2--;
        //subtrai um na posição das caras do jogador


        if (posicaoAtualDaCaraPlayer2 < totalDeCaras / 2 - 1) {
            posicaoAtualDaCaraPlayer2 = totalDeCaras - 1;
        }
        /*
        Se tiver voltado até antes da primeira posição, levar ele pra última
        */

        if (posicaoAtualDaCaraPlayer2 === totalDeCaras / 2 - 1) {
            return;
        }
        //Se estiver na posição da não equipação de acessórios, sair da função antes de trocar o acessório

        carasEl[posicaoAtualDaCaraPlayer2].classList.add("habilitar");
        //troca o acessório para a posição atual
    }
}

function mudarRoupa(event) { //Função para mudar a roupa
    let botaoClicadoeElEl = event.currentTarget;

    if (botaoClicadoeElEl.id == "botao-roupa-passar-player1") {//Verifica qual foi o botão clicado
        if (posicaoAtualDaRoupaPlayer1 > -1) {
            roupasEl[posicaoAtualDaRoupaPlayer1].classList.remove("habilitar");
        }
        //Se tiver vestindo algum acessório e tiver clicado no botão, remove o acessório previamente vestido.

        posicaoAtualDaRoupaPlayer1++;
        //soma um na posição das roupas do jogador

        if (posicaoAtualDaRoupaPlayer1 >= totalDeRoupas / 2) {
            posicaoAtualDaRoupaPlayer1 = -1;
            return;
        }
        /*
        caso passe da última posição dos chapéis do player 1 (representada pelo total dividido por 2
        já que o vetor das imagens possui os chapéis dos dois players), voltar para a posição inicial
        (sem equipar nada)
        */

        roupasEl[posicaoAtualDaRoupaPlayer1].classList.add("habilitar");
        //colocar o acessório da posição atual no jogador
    }

    if (botaoClicadoeElEl.id == "botao-roupa-voltar-player1") {//Verifica qual foi o botão clicado
        if (posicaoAtualDaRoupaPlayer1 > -1) {
            roupasEl[posicaoAtualDaRoupaPlayer1].classList.remove("habilitar");
        }
        //Se tiver vestindo algum acessório e tiver clicado no botão, remove o acessório previamente vestido.

        posicaoAtualDaRoupaPlayer1--;
        //subtrai um na posição das roupas do jogador

        if (posicaoAtualDaRoupaPlayer1 === -1) {
            return;
        }
        //caso o jogador tenha voltado para a posição onde ele não veste nada, sai da função antes de trooar acessório

        if (posicaoAtualDaRoupaPlayer1 < -1) {
            posicaoAtualDaRoupaPlayer1 = totalDeRoupas / 2 - 1;
        }
        /*
        caso o jogador volte uma posição enquanto está na posição -1, levar ele para a última posição,
        que é o total / 2 - 1
        */

        roupasEl[posicaoAtualDaRoupaPlayer1].classList.add("habilitar");
        //colocar o acessório da posição atual no jogador
    }

    if (botaoClicadoeElEl.id == "botao-roupa-passar-player2") {//Verifica qual foi o botão clicado
        if (posicaoAtualDaRoupaPlayer2 >= totalDeRoupas / 2) {
            roupasEl[posicaoAtualDaRoupaPlayer2].classList.remove("habilitar");
        }
        //Se tiver vestindo algum acessório e tiver clicado no botão, remove o acessório previamente vestido

        posicaoAtualDaRoupaPlayer2++;
        //soma um na posição das roupas do jogador

        if (posicaoAtualDaRoupaPlayer2 >= totalDeRoupas) {
            posicaoAtualDaRoupaPlayer2 = totalDeRoupas / 2 - 1;
        }
        //Se tiver passado da última posição, voltar para a primeira


        if (posicaoAtualDaRoupaPlayer2 === totalDeRoupas / 2 - 1) {
            return;
        }
        /*
        A posição total.. / 2 - 1 representa a não equipação de acessórios pelo jogador. 
        Caso esteja nela, sair da função antes de colocar um acessório.
        */

        roupasEl[posicaoAtualDaRoupaPlayer2].classList.add("habilitar");
        //colocar o acessório da posição atual
    }

    if (botaoClicadoeElEl.id == "botao-roupa-voltar-player2") {//Verifica qual foi o botão clicado
        if (posicaoAtualDaRoupaPlayer2 >= totalDeRoupas / 2) {
            roupasEl[posicaoAtualDaRoupaPlayer2].classList.remove("habilitar");
        }
        //Se tiver vestindo algum acessório e tiver clicado no botão, remove o acessório previamente vestido

        posicaoAtualDaRoupaPlayer2--;
        //subtrai um na posição das roupas do jogador

        if (posicaoAtualDaRoupaPlayer2 < totalDeRoupas / 2 - 1) {
            posicaoAtualDaRoupaPlayer2 = totalDeRoupas - 1;
        }
        /*
        Se tiver voltado até antes da primeira posição, levar ele pra última
        */

        if (posicaoAtualDaRoupaPlayer2 === totalDeRoupas / 2 - 1) {
            return;
        }
        //Se estiver na posição da não equipação de acessórios, sair da função antes de trocar o acessório

        roupasEl[posicaoAtualDaRoupaPlayer2].classList.add("habilitar");
        //troca o acessório para a posição atual
    }
}

function mudarArma(event) { //Função para mudar a arma
    let botaoClicadoeElEl = event.currentTarget;

    if (botaoClicadoeElEl.id == "botao-arma-passar-player1") {//Verifica qual foi o botão clicado
        if (posicaoAtualDaArmaPlayer1 > -1) {
            armasEl[posicaoAtualDaArmaPlayer1].classList.remove("habilitar");
        }
        //Se tiver vestindo algum acessório e tiver clicado no botão, remove o acessório previamente vestido.

        posicaoAtualDaArmaPlayer1++;
        //soma um na posição das armas do jogador

        if (posicaoAtualDaArmaPlayer1 >= totalDeArmas / 2) {
            posicaoAtualDaArmaPlayer1 = -1;
            return;
        }
        /*
        caso passe da última posição dos chapéis do player 1 (representada pelo total dividido por 2
        já que o vetor das imagens possui os chapéis dos dois players), voltar para a posição inicial
        (sem equipar nada)
        */

        armasEl[posicaoAtualDaArmaPlayer1].classList.add("habilitar");
        //colocar o acessório da posição atual no jogador
    }

    if (botaoClicadoeElEl.id == "botao-arma-voltar-player1") {//Verifica qual foi o botão clicado
        if (posicaoAtualDaArmaPlayer1 > -1) {
            armasEl[posicaoAtualDaArmaPlayer1].classList.remove("habilitar");
        }
        //Se tiver vestindo algum acessório e tiver clicado no botão, remove o acessório previamente vestido.

        posicaoAtualDaArmaPlayer1--;
        //subtrai um na posição das roupas do jogador

        if (posicaoAtualDaArmaPlayer1 === -1) {
            return;
        }
        //caso o jogador tenha voltado para a posição onde ele não veste nada, sai da função antes de trcoar acessório

        if (posicaoAtualDaArmaPlayer1 < -1) {
            posicaoAtualDaArmaPlayer1 = totalDeArmas / 2 - 1;
        }
        /*
        caso o jogador volte uma posição enquanto está na posição -1, levar ele para a última posição,
        que é o total / 2 - 1
        */

        armasEl[posicaoAtualDaArmaPlayer1].classList.add("habilitar");
        //colocar o acessório da posição atual no jogador
    }

    if (botaoClicadoeElEl.id == "botao-arma-passar-player2") {//Verifica qual foi o botão clicado
        if (posicaoAtualDaArmaPlayer2 >= totalDeArmas / 2) {
            armasEl[posicaoAtualDaArmaPlayer2].classList.remove("habilitar");
        }
        //Se tiver vestindo algum acessório e tiver clicado no botão, remove o acessório previamente vestido

        posicaoAtualDaArmaPlayer2++;
        //soma um na posição das armas do jogador

        if (posicaoAtualDaArmaPlayer2 >= totalDeArmas) {
            posicaoAtualDaArmaPlayer2 = totalDeArmas / 2 - 1;
        }
        //Se tiver passado da última posição, voltar para a primeira


        if (posicaoAtualDaArmaPlayer2 === totalDeArmas / 2 - 1) {
            return;
        }
        /*
        A posição total.. / 2 - 1 representa a não equipação de acessórios pelo jogador. 
        Caso esteja nela, sair da função antes de colocar um acessório.
        */

        armasEl[posicaoAtualDaArmaPlayer2].classList.add("habilitar");
        //colocar o acessório da posição atual
    }

    if (botaoClicadoeElEl.id == "botao-arma-voltar-player2") {//Verifica qual foi o botão clicado
        if (posicaoAtualDaArmaPlayer2 >= totalDeArmas / 2) {
            armasEl[posicaoAtualDaArmaPlayer2].classList.remove("habilitar");
        }
        //Se tiver vestindo algum acessório e tiver clicado no botão, remove o acessório previamente vestido

        posicaoAtualDaArmaPlayer2--;
        //subtrai um na posição das armas do jogador

        if (posicaoAtualDaArmaPlayer2 < totalDeArmas / 2 - 1) {
            posicaoAtualDaArmaPlayer2 = totalDeArmas - 1;
        }
        /*
        Se tiver voltado até antes da primeira posição, levar ele pra última
        */

        if (posicaoAtualDaArmaPlayer2 === totalDeArmas / 2 - 1) {
            return;
        }
        //Se estiver na posição da não equipação de acessórios, sair da função antes de trocar o acessório

        armasEl[posicaoAtualDaArmaPlayer2].classList.add("habilitar");
        //troca o acessório para a posição atual
    }
}

function apareceSelecaoDeArma() { //Função para fazer aparecer o container da seleção de arma inicial
    containerSelecaoArmasEl.classList.remove("desabilitado"); //habilita o conatiner de selecionar arma
    botaoFecharEl.classList.remove("desabilitado"); //habilita o botão de fechar

    //reposiciona as imgs do jogador na tela
    containersTodoOPlayerEl.forEach((elementoAtual) => elementoAtual.classList.remove("todo-o-player"));
    containersTodoOPlayerEl.forEach((elementoAtual, indice) => elementoAtual.classList.add(`reposicionar-player${indice + 1}-selecao-arma`));

}

function apareceSelecaoDeAcessorios() {
    containerMenuPrincipalEl.style.display = "none"; //não usei a classe desabilitado por causa da prioridade
}

function voltarParaOMenuPrincipal() {
    containerMenuPrincipalEl.style.display = "grid"; //Habilita o menu principal
}

function FecharAba() { //Função de fechar abas
    let abasAbertasPossiveis = document.querySelectorAll(".aba");

    let abaAberta;
    abasAbertasPossiveis.forEach((elementoAtual) => {
        if (!(elementoAtual.classList.contains("desabilitado"))) {
            abaAberta = elementoAtual;
        }
    });

    abaAberta.classList.add("desabilitado"); //desabilita a aba

    if (abaAberta.id == "controles-opcoes" || abaAberta.id == "controles-alterar-ataque" || abaAberta.id == "controles-alterar-movimento" || abaAberta.id == "controles-informar-tecla") { //Se for alguma dessas o botão de fechar continua
        return;
    }

    botaoFecharEl.classList.add("desabilitado"); //desabilita o botão de fechar

    if (abaAberta == containerSelecaoArmasEl) {
        abaAberta.classList.add("desabilitado"); //desabilita o container
        botaoFecharEl.classList.add("desabilitado"); //desabilita o botão de fechar

        //reposiciona as imgs do jogador na tela
        containersTodoOPlayerEl.forEach((elementoAtual, indice) => elementoAtual.classList.remove(`reposicionar-player${indice + 1}-selecao-arma`));
        containersTodoOPlayerEl.forEach((elementoAtual) => elementoAtual.classList.add("todo-o-player"));

        armasEl.forEach((elementoAtual) => elementoAtual.classList.remove("habilitar"));
        posicaoAtualDaArmaPlayer1 = -1;
        posicaoAtualDaArmaPlayer2 = totalDeArmas / 2 - 1;

        return;
    }
}

function comecarJogo() { //função pra começar o jogo
    //guarda e informa a seleção do jogador pro jogo
    
    const selecaoJogador1 = { //Cria objeto do jogador
        chapeu: chapeusEl[posicaoAtualDoChapeuPlayer1]?.dataset?.set,
        rosto: carasEl[posicaoAtualDaCaraPlayer1]?.dataset?.set,
        roupa: roupasEl[posicaoAtualDaRoupaPlayer1]?.dataset?.set,
        arma: armasEl[posicaoAtualDaArmaPlayer1]?.dataset?.set,
        nome: inputsNomeEl[0].value
    };

    if (posicaoAtualDoChapeuPlayer1 <= -1) { //Verifica se n selecionou nada
        selecaoJogador1.chapeu = "vazio";
    }

    if (posicaoAtualDaCaraPlayer1 <= -1) {//Verifica se n selecionou nada
        selecaoJogador1.rosto = "vazio";
    }

    if (posicaoAtualDaRoupaPlayer1 <= -1) {//Verifica se n selecionou nada
        selecaoJogador1.roupa = "vazio";
    }

    if (posicaoAtualDaArmaPlayer1 <= -1) {//Verifica se n selecionou nada
        selecaoJogador1.arma = "vazio";
    }

    localStorage.setItem("player1", JSON.stringify(selecaoJogador1)); // Manda as informações pro jogo

    localStorage.setItem("teclasPlayer1", JSON.stringify(teclasPlayer1)); // Manda as informações pro jogo

    const selecaoJogador2 = {//Cria objeto do jogador
        chapeu: chapeusEl[posicaoAtualDoChapeuPlayer2]?.dataset?.set,
        rosto: carasEl[posicaoAtualDaCaraPlayer2]?.dataset?.set,
        roupa: roupasEl[posicaoAtualDaRoupaPlayer2]?.dataset?.set,
        arma: armasEl[posicaoAtualDaArmaPlayer2]?.dataset?.set,
        nome: inputsNomeEl[1].value
    };

    if (posicaoAtualDoChapeuPlayer2 <= totalDeChapeus / 2 - 1) {//Verifica se n selecionou nada
        selecaoJogador2.chapeu = "vazio";
    }

    if (posicaoAtualDaCaraPlayer2 <= totalDeCaras / 2 - 1) {//Verifica se n selecionou nada
        selecaoJogador2.rosto = "vazio";
    }

    if (posicaoAtualDaRoupaPlayer2 <= totalDeRoupas / 2 - 1) {//Verifica se n selecionou nada
        selecaoJogador2.roupa = "vazio";
    }

    if (posicaoAtualDaArmaPlayer2 <= totalDeArmas / 2 - 1) {//Verifica se n selecionou nada
        selecaoJogador2.arma = "vazio";
    }

    localStorage.setItem("player2", JSON.stringify(selecaoJogador2)); //Manda as informações pro jogo

    localStorage.setItem("teclasPlayer2", JSON.stringify(teclasPlayer2)); // Manda as informações pro jogo

    window.location.href = "./menu_mapa.html";

}

let pVantagensArmaEl = document.querySelector("#boosts-vantagens-arma");
let pVantagensAcessorioEl = document.querySelector("#boosts-vantagens-acessorio");
let h2NomeDoAcessorioEl = document.querySelector("#boosts-nome-acessorio");

function apareceBoostAcessorios(event) { //FUNÇÃO PARA APARECER AS VANTAGENS DOS ACESSORIOS QUANDO PASSA O MOUSE POR CIMA
    containerBoostsEl.classList.remove("desabilitado");
    containerBoostsEl.style.height = "30%";

    let imagemAtualEl = event.currentTarget;
    let acessorioSelecionado = imagemAtualEl.dataset.set;

    if (imagemAtualEl.classList.contains("chapeu")) {
        pVantagensAcessorioEl.classList.remove("desabilitado");

        switch(acessorioSelecionado) {
            case 'rei': {
                h2NomeDoAcessorioEl.textContent = "Coroa";
                pVantagensAcessorioEl.textContent = "Empurrão: +10";
                break;
            }

            case 'mago': {
                h2NomeDoAcessorioEl.textContent = "Chapéu-mago";
                pVantagensAcessorioEl.textContent = "Gravidade: -20%";
                break;
            }

            case 'paleto': {
                h2NomeDoAcessorioEl.textContent = "Cartola";
                pVantagensAcessorioEl.textContent = "Cooldown de ataque: -10%";
                break;
            }

            case 'cowboy': {
                h2NomeDoAcessorioEl.textContent = "Cattleman";
                pVantagensAcessorioEl.textContent = "Alcance do golpe: +15";
                break;
            }
        }
    }

    if (imagemAtualEl.classList.contains("roupa")) {
        pVantagensAcessorioEl.classList.remove("desabilitado");

        switch(acessorioSelecionado) {
            case 'rei': {
                h2NomeDoAcessorioEl.textContent = "Manto real";
                pVantagensAcessorioEl.textContent = "Dano: +10%";
                break;
            }

            case 'mago': {
                h2NomeDoAcessorioEl.textContent = "Roupa mágica";
                pVantagensAcessorioEl.textContent = "Salto: +3";
                break;
            }

            case 'paleto': {
                h2NomeDoAcessorioEl.textContent = "Paletó";
                pVantagensAcessorioEl.textContent = "Velocidade: +5";
                break;
            }

            case 'cowboy': {
                h2NomeDoAcessorioEl.textContent = "Cowboy";
                pVantagensAcessorioEl.textContent = "Cooldown de ataque: -20%";
                break;
            }
        }
        
    }

    if (imagemAtualEl.classList.contains("arma")) {
        pVantagensArmaEl.classList.remove("desabilitado");

        let spanEmpurraoDaArmaEl = document.querySelector("#empurrao-da-arma");
        let spanCooldownDeAtaqueEl = document.querySelector("#cooldown-de-ataque");
        let spanDanoDaArmaEl = document.querySelector("#dano-da-arma");
        let spanAlcanceDaArmaEl = document.querySelector("#alcance-da-arma");

        containerBoostsEl.style.height = "50%";
        
        switch(acessorioSelecionado) {
            case 'espada': {
                h2NomeDoAcessorioEl.textContent = "Espada";
                spanAlcanceDaArmaEl.textContent = "75";
                spanDanoDaArmaEl.textContent = "6";
                spanEmpurraoDaArmaEl.textContent = "60";
                spanCooldownDeAtaqueEl.textContent = "0.6s";
                break;
            }

            case 'lanca': {
                h2NomeDoAcessorioEl.textContent = "Lança";
                spanAlcanceDaArmaEl.textContent = "105";
                spanDanoDaArmaEl.textContent = "5";
                spanEmpurraoDaArmaEl.textContent = "50";
                spanCooldownDeAtaqueEl.textContent = "0.45s";
                break;
            }

            case 'luva': {
                h2NomeDoAcessorioEl.textContent = "Luva";
                spanAlcanceDaArmaEl.textContent = "65";
                spanDanoDaArmaEl.textContent = "5";
                spanEmpurraoDaArmaEl.textContent = "50";
                spanCooldownDeAtaqueEl.textContent = "0.16s";
                break;
            }

            case 'marreta': {
                h2NomeDoAcessorioEl.textContent = "Marreta";
                spanAlcanceDaArmaEl.textContent = "70";
                spanDanoDaArmaEl.textContent = "7";
                spanEmpurraoDaArmaEl.textContent = "70";
                spanCooldownDeAtaqueEl.textContent = "1s";
                break;
            }
        }
        
    }

    if (imagemAtualEl.classList.contains("cara")) {
        pVantagensAcessorioEl.classList.remove("desabilitado");

        switch(acessorioSelecionado) {
            case 'bravo': {
                h2NomeDoAcessorioEl.textContent = "Cara Bravo";
                pVantagensAcessorioEl.textContent = "Empurrão: +5";
                break;
            }

            case 'feliz': {
                h2NomeDoAcessorioEl.textContent = "Cara Feliz";
                pVantagensAcessorioEl.textContent = "Velocidade: +3";
                break;
            }

            case 'neutro': {
                h2NomeDoAcessorioEl.textContent = "Cara Neutro";
                pVantagensAcessorioEl.textContent = "Cooldown do dash: -0.12s";
                break;
            }

            case 'surpreso': {
                h2NomeDoAcessorioEl.textContent = "Surpreso";
                pVantagensAcessorioEl.textContent = "Alcance do dash: +5";
                break;
            }
        }
    }


}

function desapareceBoostAcessorios() {
    if (!(pVantagensArmaEl.classList.contains("desabilitado"))) {
        pVantagensArmaEl.classList.add("desabilitado");
    }

    if (!(pVantagensAcessorioEl.classList.contains("desabilitado"))) {
        pVantagensAcessorioEl.classList.add("desabilitado");
    }

    containerBoostsEl.classList.add("desabilitado"); //DESABILITA O CONTAINER DOS BOOSTS DOS ACESSORIOS
}

function moveBoostProMouse(event) {
    //PEGA POSIÇÕES DO MOUSE
    let imagemAtualEl = event.currentTarget;
    let posicaoXDoMouse = event.clientX;
    let posicaoYDoMouse = event.clientY;

    console.log(posicaoXDoMouse, posicaoYDoMouse);

    //REPOSICIONA O CONTAINER
    containerBoostsEl.style.left = posicaoXDoMouse / innerWidth * 100 + 1 + "%";
    containerBoostsEl.style.top = posicaoYDoMouse / innerHeight * 100 - 30 + "%";

    if (window.innerHeight < 900) { //PARA TELAS COM ALTURA MENOR QUE 900PX
        containerBoostsEl.style.left = posicaoXDoMouse / innerWidth * 100 + 2 + "%";
        if (imagemAtualEl.dataset.player == 2) {
            containerBoostsEl.style.left = posicaoXDoMouse / innerWidth * 100 + 7 + "%";
        }
    }

    if (window.innerHeight > 940) { //PARA TELAS COM ALTURA MAIOR QUE 940PX
        if (imagemAtualEl.dataset.player == 2) {
            containerBoostsEl.style.left = posicaoXDoMouse / innerWidth * 100 + 6 + "%";
        }
    }

}

function apareceSelecaoDosControles() { //FUNÇÃO DE FAZER A SELEÇÃO DOS CONTROLES APARECER
    containerControlesEl.classList.remove("desabilitado");
    botaoFecharEl.classList.remove("desabilitado");
}


let playerAtual; //Guardar info do player
function apareceControlesOpcoes(event) { //FUNÇÃO DE FAZER AS OPÇÕES DE CONTROLES APARECER
    containerControlesOpcoesEl.classList.remove("desabilitado");
    let botaoClicadoEl = event.currentTarget;
    playerAtual = players[botaoClicadoEl.dataset.teclaplayer];
}

function apareceContainerDeAlterarTeclaAtaque() {
    containerControlesAlterarTeclaAtaqueEl.classList.remove("desabilitado");
}

function apareceContainerDeAlterarTeclaMovimento() {
    containerControlesAlterarTeclaMovimentoEl.classList.remove("desabilitado");
}

let botaoPressionadoEl; //Uso pra passar informação do botão selecionado
function apareceMudancaDeTecla(event) {
    containerControlesInformarTeclaEl.classList.remove("desabilitado");
    botaoPressionadoEl = event.currentTarget;
    window.addEventListener('keydown', guardarInformacaoDaTecla);
}

let codigoDaTeclaPressionada; // Guardar informaçção da tecla pressionada
function guardarInformacaoDaTecla(event) {
    let teclaPressionadaEl = document.querySelector("#tecla-pressionada");
    codigoDaTeclaPressionada = event.code;

    teclaPressionadaEl.textContent = codigoDaTeclaPressionada;
}

function confirmarMudancaDeTecla() { 
    playerAtual[botaoPressionadoEl.dataset.tecla] = codigoDaTeclaPressionada;

    containerControlesInformarTeclaEl.classList.add("desabilitado");
    window.removeEventListener('keydown', guardarInformacaoDaTecla);
}

//Adicionar os eventos de clique aos botões

botoesChapeuEl.forEach((elementoAtual) => elementoAtual.addEventListener('click', mudarChapeu)); 
botoesCaraEl.forEach((elementoAtual) => elementoAtual.addEventListener('click', mudarCara));
botoesRoupaEl.forEach((elementoAtual) => elementoAtual.addEventListener('click', mudarRoupa));
botoesArmaEl.forEach((elementoAtual) => elementoAtual.addEventListener('click', mudarArma));

botaoJogarEl.addEventListener('click', apareceSelecaoDeAcessorios);
botaoControlesEl.addEventListener('click', apareceSelecaoDosControles);
botaoFightEl.addEventListener('click', apareceSelecaoDeArma);
botaoFecharEl.addEventListener('click', FecharAba);
botaoProntoEl.addEventListener('click', comecarJogo);
botaoMenuPrincipalVoltarEl.addEventListener('click', voltarParaOMenuPrincipal);
botaoControlesPlayerEl.forEach((elementoAtual) => elementoAtual.addEventListener('click', apareceControlesOpcoes));
botoesAlterarTeclasEl.forEach((elementoAtual) => elementoAtual.addEventListener('click', apareceMudancaDeTecla));
botaoOpcoesControlesAtaqueEl.addEventListener('click', apareceContainerDeAlterarTeclaAtaque);
botaoOpcoesControlesMovimentoEl.addEventListener('click', apareceContainerDeAlterarTeclaMovimento);
botaoControlesConfirmarTeclaEl.addEventListener('click', confirmarMudancaDeTecla);

imagensAcessorios.forEach((elementoAtual) => elementoAtual.addEventListener('mouseover', apareceBoostAcessorios));
imagensAcessorios.forEach((elementoAtual) => elementoAtual.addEventListener('mouseout', desapareceBoostAcessorios));
imagensAcessorios.forEach((elementoAtual) => elementoAtual.addEventListener('mousemove', moveBoostProMouse));




// ajusta a escala da página
function ajustarEscala() {
    const baseW = 1440;
    const baseH = 900;
    const proporcao = baseW / baseH;

    let largura = window.innerWidth;
    let altura = window.innerHeight;

    if (largura / altura > proporcao) {
        largura = altura * proporcao;
    } else {
        altura = largura / proporcao;
    }

    const escala = largura / baseW;

    document.documentElement.style.setProperty('--scale', escala);
}

ajustarEscala();
window.addEventListener('resize', ajustarEscala);


// impede zoom
window.addEventListener('wheel', e => {
    if (e.ctrlKey) e.preventDefault();
}, { passive: false });

window.addEventListener('keydown', e => {
    if (e.ctrlKey && ['+', '-', '='].includes(e.key)) e.preventDefault();
});



///SELECIONAR TECLAS

window.addEventListener('keydown', ({ code }) => {
    console.log(code); //esse code é o q voce vai enviar pelo localStorage dentro de um objeto
})

//BUSCA DADOS NA PLANILHA
const RANKING_WEBAPP = "https://script.google.com/macros/s/AKfycbxJcnrjSplBeifZfaCYcvtJy88zLRXmIuAOVZu8FuhBa5nWQpmekWcNMJJcNrH_YJYS/exec";

async function buscarRanking() {
    try {
        const response = await fetch(RANKING_WEBAPP);
        return await response.json();
    } catch (e) {
        console.error("Erro ao buscar ranking:", e);
        return [];
    }
}

// ATUALIZA A TABELA DO MENU
async function atualizarRankingTabela() {

    const tabela = document.querySelector("#tabela-ranking tbody");
    if (!tabela) return;

    const lista = await buscarRanking();

    tabela.innerHTML = "";

    lista.forEach(jogador => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${jogador.nome}</td>
            <td>${jogador.vitorias}</td>
            <td>${jogador.danoTotal}</td>
        `;
        tabela.appendChild(tr);
    });
}

//EXECUTA AUTOMATICAMENTE NO MENU
document.addEventListener("DOMContentLoaded", atualizarRankingTabela);