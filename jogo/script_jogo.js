const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

//ajuste do tamanho do espaço do jogo (parte jogável)
canvas.width = 1920;
canvas.height = 1080;

// carregando fonte Jersey 10
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://fonts.googleapis.com/css2?family=Jersey+10&display=swap";
document.head.appendChild(link);

//carregando informações do menu
let player1 = JSON.parse(localStorage.getItem("player1"));
let player2 = JSON.parse(localStorage.getItem("player2"));

let itemMapa = JSON.parse(localStorage.getItem("mapa"));
let mapaSelecionado = itemMapa.mapaDefinido;

let congelaJogadores = true; //congela os jogadores durante o countdown

//variaveis que tem que ser resetadas antes do inicio do jogo
let jaExisteVencedor = 0
let jaAlteradoRanking = 0;
let jaCaiu = false;
// tempo de jogo (ms) - inicia quando o loop começa
let jogoRodando = true;
let jogoStartTime = null;
let tempoDeJogoMs = 0; // tempo em milissegundos
let jogoComecou = false;

class Jogador {
    constructor({ x, y, orientacao, cor, arma, imagens, jogador, numero }) { //propriedades do jogador
        this.position = {
            x: x,
            y: y
        }
        this.velocidade = {
            x: 0,
            y: 1
        }
        this.imagens = imagens; //rosto, chapeu, roupa, arma

        this.nome = jogador.nome;
        this.jogador = jogador;
        this.numeroDoJogador = numero;
        this.arma = arma;
        this.orientacao = orientacao; //direita ou esquerda

        this.width = 50
        this.height = 50

        this.velocidadeBase = 15;
        this.saltoBase = 27;
        this.gravidadeBase = 1.3;
        this.pisadaBase = 23;
        this.dashBase = 20;
        this.dashCooldown = 500; // tempo em ms
        this.ataqueBase = 35;
        this.alcanceBase = 35;
        this.alcanceVerticalBase = 5;
        this.ataqueCooldown = 400;
        this.boostDano = 0;
        this.acrescimoBoostDano = 0.1;
        this.arremessoBase = 45;

        this.podePular = false;
        this.podeDoubleJump = false;
        this.podePisar = false;
        this.podeDarDash = true;
        this.podeAtacar = true;
        this.soltaParticula = true;
        this.soltaParticulaNoChao = true;
        this.podeTomarArremesso = true;
        this.podeArremessar = true;

        this.estaDandoDash = false;
        this.estaSendoAtacado = false;
        this.estaDandoPisada = false;
        this.encostandoEmParede = false;
        this.pisandoNoChao = [false, false, false, false];
        this.tomandoDano = false;
        this.estaAtacando = false;
        this.seMoveu = false;

        this.debounce = false; //faz o jogador ter que soltar o W antes de dar um double jump
        this.cor = cor;

        this.danoRecebido = 0;

        this.hueNameTag = 0;

        this.ataqueStartTime = 0; // em ms
        this.ataqueDuracao = 200; // duração do swing em ms
        this.ataqueAnguloInicio = 0; // rad
        this.ataqueAnguloFinal = 0; // rad
        this.armaPivot = { x: 12, yFromBottom: 8 };
        this.estaEstocando = false;
        this.estocadaDistancia = 20; // px (quanto a arma avança no pico)
        this.estocadaRecua = 2; // px (quanto a arma recua antes de estocar)
    }

    iniciarAtaque() {
        if (this.estaAtacando) return;
        this.estaAtacando = true;
        this.ataqueStartTime = performance.now();

        let rightStart = -Math.PI / 2; //angulo de inicio
        let rightEnd = Math.PI / 3; //angulo final

        if (this.orientacao === 'direita') {
            this.ataqueAnguloInicio = rightStart;
            this.ataqueAnguloFinal = rightEnd;
        } else {
            // invertendo para a esquerda
            this.ataqueAnguloInicio = rightStart;
            this.ataqueAnguloFinal = rightEnd;
        }
    }

    iniciarEstocada() {
        if (this.estaEstocando) return;

        this.estaAtacando = false;
        this.estaEstocando = true;
        this.ataqueStartTime = performance.now();
    }

    escreverNameTag() {
        c.save();

        if (this.nome == 'pietro' || this.nome == '13k' || this.nome == 'rafael') { //efeito especial pra nós 3
            this.hueNameTag = (this.hueNameTag + 1) % 360;
            let corRainbow = `hsl(${this.hueNameTag}, 100%, 55%)`;
            c.fillStyle = corRainbow;

            //solta particulas
            this.cor = corRainbow;
            soltarParticulas(this.position.x + this.width / 2, this.position.y + this.height / 2, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, this);
        } else {
            // desenha a nametag normal
            c.fillStyle = 'white';
        }

        let nomeX = this.position.x + this.width / 2;
        let nomeY = this.position.y - 30; // 30px acima do topo do jogador

        // configurações básicas
        c.font = '22px "Jersey 10"';
        c.textAlign = 'center';
        c.lineWidth = 4;
        c.strokeStyle = 'rgba(0,0,0,0.9)';
        c.strokeText(this.nome || '', nomeX, nomeY);
        c.fillText(this.nome || '', nomeX, nomeY);
        c.restore();
    }

    desenhar() {
        let outroJogador = this == jogadores[0] ? jogadores[1] : jogadores[0];

        //desenha o cubo
        c.fillStyle = 'black'; //borda preta
        c.fillRect(this.position.x, this.position.y, this.width, this.height)

        c.fillStyle = 'white';  //cubinho
        c.fillRect(this.position.x + 3, this.position.y + 3, this.width - 6, this.height - 6)

        //deixa o jogador vermelho quando toma dano
        if (this.tomandoDano) {
            c.fillStyle = "rgba(255, 0, 0, " + (outroJogador.ataqueBase + outroJogador.boostDano) / 250 + ")" // quando o dano é 250, o jogador fica totalmente vermelho
            c.fillRect(this.position.x + 3, this.position.y + 3, this.width - 6, this.height - 6)

            setTimeout(() => {
                this.tomandoDano = false
            }, 170);
        }


        let imgX, imgY, posX, posY;

        //desenha os acessorios e configura a arma
        if (this.orientacao == 'esquerda') { // desenha tudo flipado
            c.save();
            c.scale(-1, 1);

            c.drawImage(this.imagens.rosto, -this.position.x - this.width, this.position.y, this.width, this.height); //desenhando rosto
            c.drawImage(this.imagens.chapeu, -this.position.x - this.imagens.chapeu.width + 4, this.position.y - this.imagens.chapeu.height + 5, this.imagens.chapeu.width, this.imagens.chapeu.height); //desenhando chapeu
            c.drawImage(this.imagens.roupa, -this.position.x - this.imagens.roupa.width + 2, this.position.y + this.height - this.imagens.roupa.height, this.imagens.roupa.width, this.imagens.roupa.height); //desenhando roupa

            //configurando a arma
            imgX = -this.position.x - 2 * this.width / 8;
            imgY = this.position.y + 7 * this.height / 8 - this.imagens.arma.height;

            posX = -this.position.x - 2 * this.width / 8
            if (this.arma == 'lanca') posX = -this.position.x - 4 * this.width / 8

            posY = this.position.y + 7 * this.height / 8 - this.imagens.arma.height;


        } else { //desenha tudo normal (pra direita)
            c.drawImage(this.imagens.rosto, this.position.x, this.position.y, this.width, this.height); //desenhando rosto
            c.drawImage(this.imagens.chapeu, this.position.x - 4, this.position.y - this.imagens.chapeu.height + 5, this.imagens.chapeu.width, this.imagens.chapeu.height); //desenhando chapeu
            c.drawImage(this.imagens.roupa, this.position.x - 2, this.position.y + this.height - this.imagens.roupa.height, this.imagens.roupa.width, this.imagens.roupa.height); //desenhando roupa

            // configurando a arma
            imgX = this.position.x + 6 * this.width / 8;
            imgY = this.position.y + 7 * this.height / 8 - this.imagens.arma.height;

            posX = this.position.x + 6 * this.width / 8;
            if (this.arma == 'lanca') posX = this.position.x + 4 * this.width / 8;

            posY = this.position.y + 7 * this.height / 8 - this.imagens.arma.height;
        }

        ///mais configurações pra arma
        let pivotImgX = Math.min(this.armaPivot.x, this.imagens.arma.width || 0);
        let pivotImgY = (this.imagens.arma.height || 0) - this.armaPivot.yFromBottom;

        let now = performance.now();
        let t = (now - this.ataqueStartTime) / this.ataqueDuracao;

        let ease, angle, displacement;

        if (this.estaAtacando) { //ataque de espada/marreta
            if (t >= 1) {
                this.estaAtacando = false;
                t = 1;
            }

            ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic
            angle = this.ataqueAnguloInicio + (this.ataqueAnguloFinal - this.ataqueAnguloInicio) * ease;

            displacement = 0;
        } else if (this.estaEstocando) { //ataque de luvas/lança
            if (this.arma == 'lanca') {
                imgX = this.position.x + 4 * this.width / 8;

                if(this.orientacao == 'esquerda') imgX = -this.position.x - 4 * this.width / 8;
            }

            if (t >= 1) {
                this.estaEstocando = false;
                t = 1;
            }
            let prePct = 0.2;
            let back = this.estocadaRecua || Math.max(8, Math.round(this.estocadaDistancia * 0.2));
            let baseDisp = 0;
            if (t < prePct) {
                let p = t / prePct;
                let easeIn = p * p * (3 - 2 * p);
                baseDisp = -back * easeIn;
            } else {
                let p = (t - prePct) / (1 - prePct);
                let easeOut = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
                baseDisp = -back + (this.estocadaDistancia + back) * easeOut;
            }

            angle = 0;
            displacement = baseDisp;
        }

        //desenhando a arma
        if (this.estaAtacando || this.estaEstocando) {
            c.save();
            c.translate(imgX + pivotImgX + displacement, imgY + pivotImgY);
            c.rotate(angle);
            c.drawImage(this.imagens.arma, -pivotImgX, -pivotImgY, this.imagens.arma.width, this.imagens.arma.height);
            c.restore();
        } else {
            c.drawImage(this.imagens.arma, posX, posY, this.imagens.arma.width, this.imagens.arma.height); //desenhando arma
        }
        c.restore();

        // desenha a nametag por cima de tudo
        this.escreverNameTag();
    }

    update() { //atualiza as propriedades do jogador
        this.imagens.arma = carregaArma(this.arma, null);

        atualizaStatusArma(this);

        this.desenhar() //desenha o jogador
        this.position.y += this.velocidade.y
        this.position.x += this.velocidade.x

        if (!this.estaDandoDash) {
            this.velocidade.y += this.gravidadeBase; //acelera com a gravidade
        }

        let jogadorAtual = this.numeroDoJogador == 0 ? 0 : 1

        if (this.position.y >= canvas.height * 4 && !jaCaiu) { // quando o jogador cai da tela, ativa a tela de fim de jogo
            if (vidaDosPlayers[jogadorAtual] && !jaExisteVencedor) jogadorPerdeVida(jogadorAtual);
            else if (!jaExisteVencedor && !jaAlteradoRanking) jogadorPerdeVida(jogadorAtual);
        }

        if (this.position.y >= canvas.height * 15) { // quando o jogador cai da tela, ativa a tela de fim de jogo
            if (vidaDosPlayers[jogadorAtual] + 1 && !jaExisteVencedor) {
                jaCaiu = false;
                reiniciarJogo(false);
            } else if (!jaExisteVencedor && !jaAlteradoRanking) {
                jaExisteVencedor = 1; jaAlteradoRanking = 1;
                let jogadorVencedor = this.numeroDoJogador == 0 ? 1 : 0

                definirImagemVencedor(arrayDosPlayers, jogadorVencedor);
            }
        }


    }
}


class Plataforma {
    constructor({ x, y, width, height, cor, image, colisoes }) { //propriedades de uma plataforma
        this.position = {
            x: x,
            y: y
        }

        this.width = width
        this.height = height
        this.image = image;
        this.colisoes = colisoes;
        this.cor = cor
    }

    desenhar() { //desenha a plataforma na tela
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }
}

class Particula {
    constructor({ x, y, raio, cor, velocidade }) { //propriedades de uma partícula
        this.x = x;
        this.y = y;
        this.raio = raio;
        this.cor = cor;
        this.velocidade = velocidade;
        this.alpha = 1;
    }

    desenhar() {
        c.save()
        c.globalAlpha = this.alpha //fade out
        c.fillStyle = this.cor

        c.fillRect(
            this.x - this.raio,
            this.y - this.raio,
            this.raio * 2,
            this.raio * 2
        )

        c.restore()
    }

    update() {
        this.desenhar()
        this.x += this.velocidade.x
        this.y += this.velocidade.y

        this.alpha -= 0.03; //fade out das particulas
        if (this.alpha <= 0) particulas.splice(particulas.indexOf(this), 1); //é destruída quando a opacidade chega em 0
    }
}

class Item {
    constructor({ x, y, width, height, velocidade, arma, orientacao, jogadorQueArremessou }) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocidade = velocidade;
        this.arma = arma;
        this.orientacao = orientacao;
        this.jogadorQueArremessou = jogadorQueArremessou;

        this.imgArma = new Image()
        this.imgArma.src = '../imgs/arma-' + arma + '.png';

        this.gravidade = 0.3;
        this.atrito = false;
        this.bounciness = -0.2;
        if(this.arma == 'lanca') this.bounciness = -0.1;
        this.cor = 'white';

        this.daDano = true;
        this.pegavel = false;
        this.pisandoNoChao = [false, false, false]
        this.soltaParticulaNoChao = true;
        this.debounce = false; //debounce de particulas
        this.colisoes = true;

        this.deletar = false;

        // estado de rotaçao pras armas que giram
        this.rodando = false
        this.rotacao = 0;
        this.rotacaoVel = 0.4;
    }

    desenhar() {
        if (!this.rodando || this.velocidade.x == 0) { // desenha a arma normalmente
            if (this.orientacao == 'esquerda') { //flipa pra esquerda
                c.save();
                c.scale(-1, 1);
                c.drawImage(this.imgArma, -this.x - this.width, this.y, this.width, this.height);
                c.restore();
            } else { // desenha pra direita
                c.drawImage(this.imgArma, this.x, this.y, this.width, this.height);
            }
        } else { // desenha a arma girando
            this.rotacao += this.rotacaoVel;

            let cx = this.x + this.width / 2;
            let cy = this.y + this.height / 2;

            c.save();
            c.translate(cx, cy);
            if (this.orientacao == 'esquerda') c.scale(-1, 1);
            c.rotate(this.rotacao);
            c.drawImage(this.imgArma, -this.width / 2, -this.height / 2, this.width, this.height);
            c.restore();
        }
    }

    update() {
        if (this.deletar) { //quando uma arma cai do mapa, deleta e spawna outra
            if (this.arma != 'bomba') spawnarArma();
            armas.splice(armas.indexOf(this), 1);
        }

        this.x += this.velocidade.x
        this.y += this.velocidade.y

        //atrito na arma
        if (this.atrito) {
            this.velocidade.x *= 0.92;
            if (this.velocidade.x < 0.1 && this.velocidade.x > -0.1) {
                this.velocidade.x = 0;
                this.atrito = false;
            }
        }

        if (this.velocidade.x < 1 && this.velocidade.x > -1) {
            setTimeout(() => {
                this.pegavel = true;
                this.daDano = false;
            }, 50);
        }

        this.velocidade.y += this.gravidade // gravidade nas armas arremessadas

        if (this.y >= canvas.height || this.y < -100) {
            this.deletarArma();
        }

        this.desenhar() //desenha depois das alteraçoes
    }

    deletarArma() {
        setTimeout(() => {
            this.deletar = true;
        }, 1000);
    }
}


//desenha o coraçao quebrado
let controle_coracao = 50;
function coracaoQuebrado(x) {
    c.drawImage(imgBrokenHeart, x, 940, 60, 57);

    if (controle_coracao) {
        controle_coracao--;
        setTimeout(() => {
            coracaoQuebrado(x);
        }, 0.1);
    }
}

function jogadorPerdeVida(jogador) {
    vidaDosPlayers[jogador]--;
    jaCaiu = true;
    tocarSom("damage");

    //desenha o coraçao quebrado antes de sumir
    let brokenHeart = vidaDosPlayers[jogador] + 1;
    controle_coracao = 50;
    coracaoQuebrado(jogador == 0 ? 20 + 65 * brokenHeart : 1840 - brokenHeart * 65);
}

//reinicia o jogo
function reiniciarJogo(reset) {
    let armaP0 = jogadores[0].arma, armaP1 = jogadores[1].arma, dmgP0 = jogadores[0].danoRecebido, dmgP1 = jogadores[1].danoRecebido; //salvando atributos

    jogadores.splice(-2); //deleta os jogadores

    jogadores.push(new Jogador({ //cria os jogadores de novo
        x: canvas.width / 4,
        y: 100,
        orientacao: 'direita',
        cor: 'white',
        arma: armaP0,
        imagens: {
            rosto: imgRosto1,
            roupa: imgRoupa1,
            chapeu: imgChapeu1,
        },
        jogador: player1,
        numero: 0,
    }))

    jogadores.push(new Jogador({
        x: 3 * canvas.width / 4 - 50,
        y: 100,
        orientacao: 'esquerda',
        cor: 'white',
        arma: armaP1,
        imagens: {
            rosto: imgRosto2,
            roupa: imgRoupa2,
            chapeu: imgChapeu2,
        },
        jogador: player2,
        numero: 1,
    }))

    if (!reset) {
        jogadores[0].danoRecebido = dmgP0; //coloca os atributos
        jogadores[1].danoRecebido = dmgP1;
    }

    boostDeAcessorio();
    countdown();
}

//timer antes de começar o jogo
function countdown() {
    let gravidadeP0 = jogadores[0].gravidadeBase, gravidadeP1 = jogadores[1].gravidadeBase;
    congelaJogadores = true;

    jogadores[0].gravidadeBase = 0;
    jogadores[0].velocidade.y = 0.5;
    jogadores[0].velocidade.x = 0;

    jogadores[1].gravidadeBase = 0;
    jogadores[1].velocidade.y = 0.5;
    jogadores[1].velocidade.x = 0;

    arrayCountdown[0] = true;
    tocarSom('countdown');

    setTimeout(() => {
        arrayCountdown[0] = false;
        arrayCountdown[1] = true;
        tocarSom('countdown');

        setTimeout(() => {
            arrayCountdown[1] = false;
            arrayCountdown[2] = true;
            tocarSom('countdown');

            setTimeout(() => {
                tocarSom('countdown_go');
                arrayCountdown[2] = false;
                congelaJogadores = false;
                jogadores[0].gravidadeBase = gravidadeP0;
                jogadores[1].gravidadeBase = gravidadeP1;
            }, 1000);
        }, 1000);
    }, 1000);
}

//função que solta particulas
function soltarParticulas(posX, posY, velocidadeX, velocidadeY, objeto) {
    particulas.push(
        new Particula({
            x: posX,
            y: posY,
            raio: Math.random() * 2 + 1,
            cor: objeto.cor,
            velocidade: {
                x: velocidadeX * 2,
                y: velocidadeY * 2,
            }
        })
    )
}

// carrega a imagem de uma arma (com as proporçoes certas)
function carregaArma(arma, img) {
    let imgArma

    if (img == null) {
        imgArma = new Image()
        imgArma.src = '../imgs/arma-' + arma + '.png'
    } else imgArma = img

    let larguraDaArma
    switch (arma) {
        case 'lanca':
            larguraDaArma = 90;
            break;
        case 'espada':
            larguraDaArma = 60;
            break;
        case 'luva':
            larguraDaArma = 50;
            break;
        case 'marreta':
            larguraDaArma = 65;
            break;
        case 'bomba':
            larguraDaArma = 40;
        default:
            larguraDaArma = 55;
    }
    imgArma.width = larguraDaArma;
    imgArma.height = imgArma.width * (imgArma.naturalHeight / imgArma.naturalWidth);

    return imgArma
}

// atualiza os status do jogador quando ele pega uma arma nova (ou quando perde a arma atual)
function atualizaStatusArma(jogador) {
    let arma = jogador.arma

    switch (arma) {
        case 'espada':
            jogador.ataqueCooldown = 600; //base é 400
            jogador.alcanceBase = 75;
            jogador.alcanceVerticalBase = 10;
            jogador.ataqueBase = 60; //  base é 30

            break;
        case 'lanca':
            jogador.ataqueCooldown = 450; //base é 400
            jogador.alcanceBase = 105; // base é 35
            jogador.alcanceVerticalBase = -4;
            jogador.ataqueBase = 55; //  base é 30
            jogador.arremessoBase = 70;
            
            jogador.ataqueDuracao = 200;
            jogador.estocadaDistancia = 40;
            jogador.estocadaRecua = 5;

            break;
        case 'luva':
            jogador.ataqueCooldown = 160; //diminui em 60%, base é 400
            jogador.alcanceBase = 65; //aumenta em 54%, base é 35
            jogador.alcanceVerticalBase = -4;
            jogador.ataqueBase = 50; //  base é 30

            jogador.ataqueDuracao = 100;
            jogador.estocadaDistancia = 16;

            break;
        case 'marreta':
            jogador.ataqueCooldown = 1000; //aumenta em 100%, base é 400
            jogador.alcanceBase = 70; //aumenta em 77%, base é 35
            jogador.alcanceVerticalBase = 20;
            jogador.ataqueBase = 70; //  base é 30

            break;
        default:
            jogador.ataqueCooldown = 500; //base é 400
            jogador.alcanceBase = 50;
            jogador.alcanceVerticalBase = 0;
            jogador.ataqueBase = 25; //  base é 30
            break;
    }

    // atualiza alguns atributos de outros acessórios para nao conflitar
    for (let j = 0; j < 2; j++) {
        switch (arrayDosPlayers[j].chapeu) {
            case 'rei':
                jogadores[j].ataqueBase += 10; //diminui em 30%
                break;
            case 'paleto':
                jogadores[j].ataqueCooldown *= 0.9; //aumenta em 75%
                break;
            case 'cowboy':
                jogadores[j].alcanceBase += 15; //aumenta em 25%
                break;
        }

        switch (arrayDosPlayers[j].roupa) {
            case 'cowboy':
                jogadores[j].ataqueCooldown *= 0.8; //aumenta em 25%
                break;
        }

        switch (arrayDosPlayers[j].rosto) {
            case 'bravo':
                jogadores[j].ataqueBase += 5; //diminui em 30%
                break;
        }
    }
}


//funçao que toca os sons
function tocarSom(som) {
    let audio = new Audio('../efeitos_sonoros/' + som + '.wav')
    audio.play()
}

//funçoes pra tocar o som ambiente em loop
let audioContext;
let somBuffer;
let somSource;
let somGain;

async function carregarSomAmbiente(url) {
    audioContext = new AudioContext();

    // altera o volume
    somGain = audioContext.createGain();
    somGain.gain.value = 0.8; //de 0 a 1

    const resposta = await fetch(url);
    const arrayBuffer = await resposta.arrayBuffer();
    somBuffer = await audioContext.decodeAudioData(arrayBuffer);
}

function tocarLoop() {
    if (!somBuffer || !audioContext) return;

    somSource = audioContext.createBufferSource();
    somSource.buffer = somBuffer;
    somSource.loop = true;

    somSource.connect(somGain);
    somGain.connect(audioContext.destination);

    somSource.start(0);
}

function pararLoop() {
    if (somSource) {
        somSource.stop(0);
        somSource = null;
    }
}

//dropa um item
function droparItem(outroJogador) {
    if (outroJogador.arma == 'vazio') return;

    let imgX = outroJogador.position.x + 6 * outroJogador.width / 8;
    let imgY = outroJogador.position.y;

    if (outroJogador.orientacao == 'esquerda') {
        imgX = outroJogador.position.x - 6 * outroJogador.width / 8;
    }

    armas.push(new Item({
        x: imgX,
        y: imgY,
        width: outroJogador.imagens.arma.width,
        height: outroJogador.imagens.arma.height,
        velocidade: {
            x: outroJogador.orientacao == 'direita' ? 8 : -8,
            y: -4,
        },
        arma: outroJogador.arma,
        orientacao: outroJogador.orientacao,
        jogadorQueArremessou: outroJogador,
    }))

    let armaAtual = armas.at(-1)
    armaAtual.colisoes = false;
    armaAtual.rodando = false;
    armaAtual.daDano = false;
    if (armaAtual.arma == 'bomba') armaAtual.explode = true;

    setTimeout(() => {
        armaAtual.colisoes = true;
    }, 800);
}

//pega um numero inteiro aleatorio
function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// função pra dar o dano quando um jogador é acertado por uma arma arremessada
function danoDeArremesso(outroJogador, arma) {
    if (outroJogador == arma.jogadorQueArremessou) return; //nao deixa o jogador que arremessou a arma tomar dano dela

    let jogadorAtacante = jogadores[0];
    if (outroJogador == jogadorAtacante) jogadorAtacante = jogadores[1];

    jogadorAtacante.boostDano += jogadorAtacante.ataqueBase * jogadorAtacante.acrescimoBoostDano;

    outroJogador.podeTomarArremesso = false

    tocarSom(arma.arma + "_" + randomInt(1, 3));
    outroJogador.tomandoDano = true;
    outroJogador.estaDandoDash = true;

    if (arma.velocidade.x < 30 && arma.velocidade.x > -30) arma.velocidade.x *= 1.3;
    outroJogador.velocidade.x += arma.velocidade.x * 1.3; //altera a velocidade do jogador

    let danoDaArma = arma.velocidade.x;
    if (danoDaArma < 0) danoDaArma *= -1;

    outroJogador.danoRecebido += danoDaArma * 1.3;

    arma.velocidade.x *= arma.bounciness;
    arma.velocidade.y *= -0.02;
    arma.daDano = false;
    arma.rodando = false;

    setTimeout(() => {
        arma.pegavel = true;
    }, 150);

    setTimeout(() => {
        outroJogador.estaDandoDash = false;
    }, 100);

    setTimeout(() => {
        outroJogador.podeTomarArremesso = true
    }, 300);
}

let coresArmas = ['lightblue', 'purple', 'white', 'red'];

//spawna uma arma aleatoria
function spawnarArma() {
    tocarSom("spawn")

    let rand = randomInt(0, 3)

    let arma = imagensArmas[rand]
    let imgArma = carregaArma(arma, imagensArmas[rand + 4])

    let posX = Math.random() * 1600
    if (posX > 1350) posX -= 250
    if (posX < 250) posX += 250

    // liberando particulas
    for (let i = 0; i < 10; i++) {
        soltarParticulas(posX + imgArma.width / 2, 100 + imgArma.height / 2, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, { cor: coresArmas[rand] })
    }

    // spawnando a arma
    armas.push(new Item({
        x: posX,
        y: 100,
        width: imgArma.width,
        height: imgArma.height,
        velocidade: {
            x: 0,
            y: -3,
        },
        arma: arma,
        orientacao: Math.random() > 0.5 ? 'direita' : 'esquerda',
        jogadorQueArremessou: null,
    }))

    let armaAtual = armas.at(-1)
    armaAtual.colisoes = true;
    armaAtual.rodando = false;
    armaAtual.daDano = false;
}

// funçao que gera uma explosão com partículas
function explodir(arma, raio) {
    let x = arma.x + arma.width / 2
    let y = arma.y + arma.height / 2

    jogadores.forEach(jogador => {
        if (((jogador.position.x >= x - raio && jogador.position.x < x) || (jogador.position.x <= x + raio && jogador.position.x > x)) && jogador.position.y >= y - raio && jogador.position.y <= y + raio) {
            jogador.estaDandoDash = true;
            jogador.velocidade.x = jogador.position.x < x ? -150 : 150; //arremessa o jogador dentro do raio da explosao

            setTimeout(() => {
                jogador.estaDandoDash = false;
            }, 150);
        }
    })

    tocarSom("bomba_" + randomInt(1, 3)); //som da explosao

    //particulas da explosao
    for (let i = 0; i < 50; i++) {
        soltarParticulas(x, y, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 17, { cor: 'red' });
    }
    for (let i = 0; i < 40; i++) {
        soltarParticulas(x, y, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10, { cor: 'orange' });
    }
    for (let i = 0; i < 30; i++) {
        soltarParticulas(x, y, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, { cor: 'yellow' });
    }

    armas.splice(armas.indexOf(arma), 1);
}

//boosts dos acessórios
function boostDeAcessorio() {
    for (let j = 0; j < 2; j++) {
        switch (arrayDosPlayers[j].chapeu) {
            case 'rei':
                jogadores[j].ataqueBase += 10; //diminui em 30%
                break;
            case 'mago':
                jogadores[j].gravidadeBase *= 0.8; //diminui em 25%
                break;
            case 'paleto':
                jogadores[j].ataqueCooldown *= 0.9; //aumenta em 75%
                break;
            case 'cowboy':
                jogadores[j].alcanceBase += 15; //aumenta em 25%
                break;
            default:
                break;
        }

        switch (arrayDosPlayers[j].roupa) {
            case 'rei':
                jogadores[j].acrescimoBoostDano += 0.1; //diminui em 30%
                break;
            case 'mago':
                jogadores[j].saltoBase += 3; //diminui em 25%
                break;
            case 'paleto':
                jogadores[j].velocidadeBase += 5; //aumenta em 75%
                break;
            case 'cowboy':
                jogadores[j].ataqueCooldown *= 0.8; //aumenta em 25%
                break;
            default:
                break;
        }

        switch (arrayDosPlayers[j].rosto) {
            case 'bravo':
                jogadores[j].ataqueBase += 5; //diminui em 30%
                break;
            case 'feliz':
                jogadores[j].velocidadeBase += 3; //diminui em 25%
                break;
            case 'neutro':
                jogadores[j].dashCooldown -= 120; //aumenta em 75%
                break;
            case 'surpreso':
                jogadores[j].dashBase += 5; //aumenta em 25%
                break;
            default:
                break;
        }
    }
}

//função da tela inicial de confirmação (aperte qualquer tecla)
function escreverTexto() {
    let index = controleTexto % 3;
    let pontos = index == 0 ? '.' : index == 1 ? '..' : '...'
    let posX = index == 0 ? 1310 : index == 1 ? 1314 : 1318

    c.clearRect(0, 0, canvas.width, canvas.height);
    c.restore()
    c.fillText('Pressione qualquer tecla para começar', 960, 540);
    c.fillText(pontos, posX, 540);

    controleTexto++;
    setTimeout(() => {
        if (!jogoComecou) escreverTexto();
    }, 600);
}

//inicia o jogo
function iniciarJogo() {
    if (!jogoComecou) {
        animar(0);
        countdown();
        jogoComecou = true;

        //caso os jogadores comecem o jogo sem armas, elas spawnam depois de um tempo
        if (jogadores[0].arma == 'vazio') {
            setTimeout(() => {
                spawnarArma();
            }, 6000);
        }
        if (jogadores[1].arma == 'vazio') {
            setTimeout(() => {

                spawnarArma();
            }, 11000);
        }
    }
}

function pegarItem(jogador, arma) {
    if (jogador.arma != 'vazio') droparItem(jogador)

    // pegando a arma
    tocarSom("pickup")
    jogador.arma = arma.arma;
    armas.splice(armas.indexOf(arma), 1);
}

//puxando imagens
//plataformas e fundo
let imgPlataformaCentral = new Image()
imgPlataformaCentral.src = '../imgs/plataforma-' + mapaSelecionado + '-principal.jpg'
imgPlataformaCentral.width = 800; //tamanho padronizado

let imgPlataformaDireita = new Image()
imgPlataformaDireita.src = '../imgs/plataforma-' + mapaSelecionado + '-direita.jpg'
imgPlataformaDireita.width = 375; //tamanho padronizado
imgPlataformaDireita.height = 90; //tamanho padronizado

let imgPlataformaEsquerda = new Image()
imgPlataformaEsquerda.src = '../imgs/plataforma-' + mapaSelecionado + '-esquerda.jpg'
imgPlataformaEsquerda.width = 375; //tamanho padronizado
imgPlataformaEsquerda.height = 90; //tamanho padronizado

let imgFundo = new Image()
imgFundo.src = '../imgs/fundo-' + mapaSelecionado + '.jpg'

//acessorios
//rostos
let imgRosto1 = new Image()
imgRosto1.src = '../imgs/cara-' + player1.rosto + '.png'

let imgRosto2 = new Image()
imgRosto2.src = '../imgs/cara-' + player2.rosto + '.png'

//chapeus
let imgChapeu1 = new Image()
imgChapeu1.src = '../imgs/chapeu-' + player1.chapeu + '.png'
imgChapeu1.onload = () => {
    imgChapeu1.width = 58;
    imgChapeu1.height = imgChapeu1.width * (imgChapeu1.naturalHeight / imgChapeu1.naturalWidth);
}

let imgChapeu2 = new Image()
imgChapeu2.src = '../imgs/chapeu-' + player2.chapeu + '.png'
imgChapeu2.onload = () => {
    imgChapeu2.width = 58;
    imgChapeu2.height = imgChapeu2.width * (imgChapeu2.naturalHeight / imgChapeu2.naturalWidth);
}

//roupas
let imgRoupa1 = new Image()
imgRoupa1.src = '../imgs/roupa-' + player1.roupa + '.png'
imgRoupa1.onload = () => {
    imgRoupa1.width = 54;
    imgRoupa1.height = imgRoupa1.width * (imgRoupa1.naturalHeight / imgRoupa1.naturalWidth);
}

let imgRoupa2 = new Image()
imgRoupa2.src = '../imgs/roupa-' + player2.roupa + '.png'
imgRoupa2.onload = () => {
    imgRoupa2.width = 54;
    imgRoupa2.height = imgRoupa2.width * (imgRoupa2.naturalHeight / imgRoupa2.naturalWidth);
}

//carregando imagens das armas pra spawnar
let imgArma1 = new Image()
imgArma1.src = '../imgs/arma-lanca.png'

let imgArma2 = new Image()
imgArma2.src = '../imgs/arma-marreta.png'

let imgArma3 = new Image()
imgArma3.src = '../imgs/arma-espada.png'

let imgArma4 = new Image()
imgArma4.src = '../imgs/arma-luva.png'

//carregando imagem de coraçao
let imgHeart = new Image()
imgHeart.src = '../imgs/heart.png'

let imgBrokenHeart = new Image()
imgBrokenHeart.src = '../imgs/heart_broken.png'

//carregando fundo preto do countdown
let fundoPreto = new Image()
fundoPreto.src = '../imgs/fundo_preto.png'

//carregando som ambiente
carregarSomAmbiente('../efeitos_sonoros/arena_' + mapaSelecionado + '.wav');

//criando arrays
let armas = [];
let arrayDosPlayers = [player1, player2];
let plataformas = [];
let particulas = [];
let imagensArmas = ['lanca', 'marreta', 'espada', 'luva', imgArma1, imgArma2, imgArma3, imgArma4];
let vidaDosPlayers = [2, 2]; // cada player começa com 3 vidas (0, 1 e 2)
let arrayCountdown = [false, false, false];

const teclas = [{
    direita: { //jogador 0 (WASD)
        pressionada: false
    },
    esquerda: {
        pressionada: false
    },
    cima: {
        pressionada: false
    },
    baixo: {
        pressionada: false
    },
    dash: {
        pressionada: false
    },
    ataque: {
        pressionada: false
    },
    arremesso: {
        pressionada: false
    }
}, {
    direita: { //jogador 1 (setas)
        pressionada: false
    },
    esquerda: {
        pressionada: false
    },
    cima: {
        pressionada: false
    },
    baixo: {
        pressionada: false
    },
    dash: {
        pressionada: false
    },
    ataque: {
        pressionada: false
    },
    arremesso: {
        pressionada: false
    }
}]

// array dos jogadores
let jogadores = [new Jogador({
    x: canvas.width / 4,
    y: 100,
    orientacao: 'direita',
    cor: 'white',
    arma: player1.arma,
    imagens: {
        rosto: imgRosto1,
        roupa: imgRoupa1,
        chapeu: imgChapeu1,
    },
    jogador: player1,
    numero: 0,
}), new Jogador({
    x: 3 * canvas.width / 4 - 50,
    y: 100,
    orientacao: 'esquerda',
    cor: 'white',
    arma: player2.arma,
    imagens: {
        rosto: imgRosto2,
        roupa: imgRoupa2,
        chapeu: imgChapeu2,
    },
    jogador: player2,
    numero: 1,
})];

//criação das plataformas
imgPlataformaCentral.onload = () => { //espera a plataforma central carregar, depois cria ela
    plataformas.push(new Plataforma({
        x: (canvas.width / 2 - imgPlataformaCentral.width / 2), y: 650, width: imgPlataformaCentral.width, height: imgPlataformaCentral.height + 35, cor: 'blue', image: imgPlataformaCentral, colisoes: true,
    }))
}

imgPlataformaDireita.onload = () => { //espera a plataforma da direita carregar, depois cria ela
    plataformas.push(new Plataforma({
        x: (3 * canvas.width / 4 - imgPlataformaDireita.width / 2), y: 450, width: imgPlataformaDireita.width, height: imgPlataformaDireita.height, cor: 'blue', image: imgPlataformaDireita, colisoes: false
    }))
}

imgPlataformaEsquerda.onload = () => { //espera a plataforma da esquerda carregar, depois cria ela
    plataformas.push(new Plataforma({
        x: (canvas.width / 4 - imgPlataformaEsquerda.width / 2), y: 450, width: imgPlataformaEsquerda.width, height: imgPlataformaEsquerda.height, cor: 'blue', image: imgPlataformaEsquerda, colisoes: false
    }))
}

//fixando o fps em 60
let fps = 60;
let intervaloFrame = 1000 / fps; // ~16.67ms
let ultimoFrame = 0;

//função principal que atualiza a tela
function animar(tempoAtual) {
    requestAnimationFrame(animar); // loop infinito

    // inicializa o tempo de início no primeiro frame
    if (jogoStartTime === null) jogoStartTime = tempoAtual;
    // atualiza o tempo decorrido enquanto o jogo estiver rodando
    if (jogoRodando) tempoDeJogoMs = tempoAtual - jogoStartTime;

    const delta = tempoAtual - ultimoFrame;
    if (delta < intervaloFrame) return; // ainda não passou tempo suficiente

    ultimoFrame = tempoAtual;

    c.drawImage(imgFundo, 0, 0, canvas.width, canvas.height)

    // desenha plataformas primeiro
    plataformas.forEach(plataforma => {
        plataforma.desenhar() //atualiza as plataformas
    })

    // depois desenha particulas
    particulas.forEach(particula => {
        particula.update()
    })

    //desenha os jogadores
    jogadores.forEach(jogador => {
        jogador.update(); //atualiza o jogador
    })

    //desenha as armas
    armas.forEach(arma => {
        arma.update();
    })

    //desenha os coraçoes na tela
    for (let i = 0, j = 20; i < vidaDosPlayers[0] + 1; i++, j += 65) {
        c.drawImage(imgHeart, j, 940, 60, 57);
    }

    for (let i = 0, j = 1840; i < vidaDosPlayers[1] + 1; i++, j -= 65) {
        c.drawImage(imgHeart, j, 940, 60, 57);
    }

    //escreve o countdown
    c.font = '350px "Jersey 10"';
    c.textAlign = 'center';
    if (arrayCountdown[0] || arrayCountdown[1] || arrayCountdown[2]) c.drawImage(fundoPreto, 0, 0, canvas.width, canvas.height)
    if (arrayCountdown[0]) c.fillText('3', canvas.width / 2, 600);
    if (arrayCountdown[1]) c.fillText('2', canvas.width / 2, 600);
    if (arrayCountdown[2]) c.fillText('1', canvas.width / 2, 600);


    //movimento dos jogadores
    if (!congelaJogadores) {
        for (let i = 0; i < 2; i++) { //i assume 0 e 1 (só podem ter 2 jogadores)
            let outroJogador = i == 0 ? jogadores[1] : jogadores[0];

            //movimento pra direita
            if (teclas[i].direita.pressionada && !teclas[i].esquerda.pressionada) {
                if (((jogadores[i].estaDandoDash && jogadores[i].orientacao == 'esquerda') || !jogadores[i].estaDandoDash) && !jogadores[i].estaSendoAtacado) { // verificação se o jogador está dando dash ou se está sendo atacado (para nao poder andar)
                    jogadores[i].velocidade.x = jogadores[i].velocidadeBase; //velocidade para a direita

                    jogadores[i].seMoveu = true;
                    jogadores[i].orientacao = 'direita';
                }
                //movimento pra esquerda
            } else if (teclas[i].esquerda.pressionada && !teclas[i].direita.pressionada) {
                if (((jogadores[i].estaDandoDash && jogadores[i].orientacao == 'direita') || !jogadores[i].estaDandoDash) && !jogadores[i].estaSendoAtacado) { // verificação se o jogador está dando dash
                    jogadores[i].velocidade.x = -jogadores[i].velocidadeBase; //velocidade para a esquerda

                    jogadores[i].seMoveu = true;
                    jogadores[i].orientacao = 'esquerda';
                }
            } else if ((!jogadores[i].estaDandoDash && !jogadores[i].estaSendoAtacado) || (teclas[i].direita.pressionada && teclas[i].esquerda.pressionada && !jogadores[i].estaDandoDash && !jogadores[i].estaSendoAtacado)) {
                jogadores[i].velocidade.x = 0; //jogador parado se nao estiver apertando nenhuma tecla ou se estiver apertando as duas ao mesmo tempo
            }

            //salto
            if (teclas[i].cima.pressionada && jogadores[i].podePular) { // salto (somente se o jogador estiver pisando em uma plataforma ou em outro jogador)
                tocarSom("jump_" + randomInt(1, 3))

                jogadores[i].velocidade.y -= jogadores[i].saltoBase;

                jogadores[i].podePisar = true; //carrega a pisada
                jogadores[i].podeDoubleJump = true;
                jogadores[i].debounce = true; //impede que o double jump ative imediatamente
            }

            //double jump
            if (teclas[i].cima.pressionada && jogadores[i].podeDoubleJump && !jogadores[i].debounce) {
                tocarSom("jump_" + randomInt(1, 3))

                jogadores[i].velocidade.y = -jogadores[i].saltoBase;
                jogadores[i].podeDoubleJump = false;
                jogadores[i].podePisar = true; //carrega a pisada

                if (jogadores[i].estaDandoPisada) jogadores[i].estaDandoPisada = false;

                //solta partículas
                for (let j = 0; j < 8; j++) {// j é o numero de particulas
                    let posX = jogadores[i].position.x + jogadores[i].width / 2 + ((Math.random() - 0.5) * 30);
                    let posY = jogadores[i].position.y + jogadores[i].height;

                    let velocidadeX = (Math.random() - 0.5) * 4;
                    let velocidadeY = Math.random();

                    if (posX > jogadores[i].position.x + jogadores[i].width / 2) {
                        if (velocidadeX < 0) velocidadeX *= -1;
                    } else if (velocidadeX > 0) velocidadeX *= -1;

                    soltarParticulas(posX, posY, velocidadeX, velocidadeY, jogadores[i]);
                }
            }

            //pisada
            if (teclas[i].baixo.pressionada && jogadores[i].podePisar && !teclas[i].cima.pressionada) {
                tocarSom('dash_' + randomInt(1, 4));

                if (jogadores[i].velocidade.y <= 0) jogadores[i].velocidade.y = jogadores[i].pisadaBase * 1.4;
                else jogadores[i].velocidade.y += jogadores[i].pisadaBase;

                jogadores[i].podePisar = false; //gasta a pisada
                jogadores[i].estaDandoPisada = true;
            }

            //solta partículas enquanto o jogador estiver dando uma pisada
            if (jogadores[i].estaDandoPisada && jogadores[i].soltaParticula) {
                // jogadores[i].soltaParticula = false;

                let posX = jogadores[i].position.x + jogadores[i].width / 2 + ((Math.random() - 0.5) * 30);
                let posY = jogadores[i].position.y + jogadores[i].height;

                let velocidadeX = (Math.random() - 0.5);
                let velocidadeY = (Math.random() * -1);

                if (velocidadeX > 0 && jogadores[i].velocidade.x > 0) {
                    velocidadeX *= -1;
                } else if (velocidadeX < 0 && jogadores[i].velocidade.x < 0) velocidadeX *= -1;

                soltarParticulas(posX, posY, velocidadeX, velocidadeY, jogadores[i])

                // setTimeout(() => {
                //     jogadores[i].soltaParticula = true;
                // }, 10);
            }

            //dash
            if (teclas[i].dash.pressionada && jogadores[i].podeDarDash) {
                tocarSom('dash_' + randomInt(1, 4));

                if (jogadores[i].orientacao == 'direita') {
                    if (jogadores[i].velocidade.x == 0) jogadores[i].velocidade.x = jogadores[i].dashBase * 2;
                    else jogadores[i].velocidade.x += jogadores[i].dashBase;
                }
                else {
                    if (jogadores[i].velocidade.x == 0) jogadores[i].velocidade.x = jogadores[i].dashBase * -2;
                    else jogadores[i].velocidade.x -= jogadores[i].dashBase;
                }

                jogadores[i].velocidade.y = 0;

                jogadores[i].estaDandoDash = true;
                jogadores[i].podeDarDash = false;
                jogadores[i].soltaParticula = true;
                jogadores[i].estaDandoPisada = false;
                teclas[i].dash.pressionada = false;

                // duração da animação do dash
                setTimeout(() => {
                    jogadores[i].estaDandoDash = false;
                }, 120); //tempo da animaçao 120ms

                //cooldown do dash
                setTimeout(() => {
                    jogadores[i].podeDarDash = true;
                }, jogadores[i].dashCooldown);
            }

            //solta partícula enquanto o jogador estiver dando dash
            if (jogadores[i].estaDandoDash) {
                let posX = jogadores[i].position.x + jogadores[i].width / 2;
                let velocidadeX = (Math.random() - 0.5) * 2;

                if (velocidadeX > 0 && jogadores[i].velocidade.x > 0) {
                    velocidadeX *= -1;
                } else if (velocidadeX < 0 && jogadores[i].velocidade.x < 0) velocidadeX *= -1;

                soltarParticulas(posX, jogadores[i].position.y + jogadores[i].height + ((Math.random() - 0.5) * 30), velocidadeX, (Math.random() - 0.5) * 0.5, jogadores[i])
                soltarParticulas(posX + jogadores[i].velocidade.x / 2, jogadores[i].position.y + jogadores[i].height + ((Math.random() - 0.5) * 30), velocidadeX * Math.random(), (Math.random() - 0.5) * 0.5, jogadores[i])
            }

            //fazendo cálculos para caso o jogador arremesse ou rebata uma arma
            let dx = Math.abs((outroJogador.position.x) - (jogadores[i].position.x));
            let dy = Math.abs(outroJogador.position.y - jogadores[i].position.y);

            let tg = dy / dx;

            let vx = jogadores[i].arremessoBase + Math.abs(jogadores[i].velocidade.x) + jogadores[i].boostDano / 2; //velocidade horizontal é fixa

            if (dx < 210) vx = 25; //ajustes pra caso os jogadores estejam muito perto um do outro (pra nao ficar absurdo de rapido)
            if (dx < 150) vx = 15;

            let vy = vx * tg; // determina a velocidade vertical a partir da velocidade horizontal
            if (vy > 90) vy = 90; // o máximo para a velocidade vertical é 90

            //ataque
            if (teclas[i].ataque.pressionada && jogadores[i].podeAtacar) { //dispara a animação de ataque sempre que apertar (com cooldown)
                let random = randomInt(1, 3)
                tocarSom("miss_" + random);

                teclas[i].ataque.pressionada = false;
                jogadores[i].podeAtacar = false;

                if (jogadores[i].arma == 'espada' || jogadores[i].arma == 'marreta') jogadores[i].iniciarAtaque();
                else jogadores[i].iniciarEstocada();

                // cooldown do ataque
                setTimeout(() => {
                    jogadores[i].podeAtacar = true;
                }, jogadores[i].ataqueCooldown);


                let orientacaoAtaque = jogadores[i].orientacao == 'direita' ? 1 : -1; //definindo a orientação do ataque
                let ataqueValido = false;

                //determinando se o ataque acertou outro jogador
                if (outroJogador.position.y + outroJogador.height >= jogadores[i].position.y - jogadores[i].alcanceVerticalBase && outroJogador.position.y <= jogadores[i].position.y + jogadores[i].height + jogadores[i].alcanceVerticalBase) {//condição de proximidade para o ataque (jogadores alinhados verticalmente)
                    //verificando se o ataque para a DIREITA é válido
                    if (jogadores[i].orientacao == 'direita' && outroJogador.position.x <= jogadores[i].position.x + jogadores[i].width + jogadores[i].alcanceBase && outroJogador.position.x >= jogadores[i].position.x) { //condição de proximidade horizontal (alcance pode ser ajustado)
                        ataqueValido = true;
                    }
                    //verificando se o ataque para a ESQUERDA é válido
                    if (jogadores[i].orientacao == 'esquerda' && outroJogador.position.x + outroJogador.width >= jogadores[i].position.x - jogadores[i].alcanceBase && outroJogador.position.x + outroJogador.width <= jogadores[i].position.x + jogadores[i].width) { //condição de proximidade horizontal (alcance pode ser ajustado)
                        ataqueValido = true;
                    }

                    if (ataqueValido) { //se o ataque acertar, roda os efeitos
                        if (jogadores[i].arma == 'bomba' || outroJogador.arma == 'bomba') { //explode caso alguém seja atacado ou ataque com uma bomba na mão
                            let x = jogadores[i].position.x;
                            jogadores[i].position.x += orientacaoAtaque * -100;

                            explodir({
                                x: x,
                                y: jogadores[i].position.y,
                                width: jogadores[i].width,
                                height: jogadores[i].height,
                            }, 200)

                            if (jogadores[i].arma == 'bomba') jogadores[i].arma = 'vazio';
                            if (outroJogador.arma == 'bomba') outroJogador.arma = 'vazio';

                        } else { //ataque de armas normais (que nao explodem)
                            //som de ataque
                            tocarSom(jogadores[i].arma + "_" + randomInt(1, 3));

                            outroJogador.tomandoDano = true;
                            outroJogador.estaSendoAtacado = true;
                            outroJogador.velocidade.x = orientacaoAtaque * (jogadores[i].ataqueBase + jogadores[i].boostDano); //o quanto o oponente é arremessado (e em qual direção)

                            outroJogador.danoRecebido += (jogadores[i].ataqueBase + jogadores[i].boostDano) //registra o dano causado do jogador

                            jogadores[i].boostDano += jogadores[i].ataqueBase * jogadores[i].acrescimoBoostDano; //aumenta o knockback a cada hit

                            //duração da animação de ser atacado
                            setTimeout(() => {
                                outroJogador.estaSendoAtacado = false;
                            }, 170);
                        }
                    }
                }

                //rebater armas no ar
                armas.forEach(arma => {
                    if ((arma.velocidade.x >= 1 || arma.velocidade.x <= -1) && arma.y + arma.height >= jogadores[i].position.y - jogadores[i].alcanceVerticalBase && arma.y <= jogadores[i].position.y + jogadores[i].height + jogadores[i].alcanceVerticalBase) { //alinhamento vertical
                        if ((jogadores[i].orientacao == 'direita' && arma.x <= jogadores[i].position.x + jogadores[i].width + jogadores[i].alcanceBase + 30 && arma.x >= jogadores[i].position.x) || (jogadores[i].orientacao == 'esquerda' && arma.x + arma.width >= jogadores[i].position.x - jogadores[i].alcanceBase - 30 && arma.x + arma.width <= jogadores[i].position.x + jogadores[i].width)) { //alinhamento horizontal
                            tocarSom(jogadores[i].arma + "_" + randomInt(1, 3));

                            arma.velocidade.x = jogadores[i].orientacao == 'direita' ? vx : -vx;
                            arma.velocidade.y = outroJogador.position.y > jogadores[i].position.y ? vy : -vy - 3;
                            arma.orientacao = jogadores[i].orientacao;

                            arma.jogadorQueArremessou = jogadores[i];
                            arma.daDano = true;
                        }
                    }
                })
            }

            //arremesso de armas
            if (teclas[i].arremesso.pressionada && jogadores[i].arma != "vazio" && jogadores[i].podeArremessar) {
                tocarSom("throw_" + randomInt(1, 4))

                let imgX = jogadores[i].position.x + 6 * jogadores[i].width / 8;
                let imgY = jogadores[i].position.y + 7 * jogadores[i].height / 8 - jogadores[i].imagens.arma.height;

                if (jogadores[i].orientacao == 'esquerda') {
                    imgX = jogadores[i].position.x - 6 * jogadores[i].width / 8;
                }

                // caso o jogador arremesse pro lado contrario de onde está o outro jogador, o arremesso é horizontal com velocidade fixa
                if ((jogadores[i].orientacao == 'direita' && outroJogador.position.x < jogadores[i].position.x) || (jogadores[i].orientacao == 'esquerda' && outroJogador.position.x > jogadores[i].position.x)) {
                    vx = 40;
                    vy = 0;
                }

                // cria a arma com as velocidades encontradas
                armas.push(new Item({
                    x: imgX,
                    y: imgY,
                    width: jogadores[i].imagens.arma.width,
                    height: jogadores[i].imagens.arma.height,
                    velocidade: {
                        x: jogadores[i].orientacao == 'direita' ? vx : -vx,
                        y: outroJogador.position.y > jogadores[i].position.y ? vy : -vy - 3, //-3 é um offset pra compensar o fato de que a posição da qual a arma é arremessada não é igual ao centro da arma
                    },
                    arma: jogadores[i].arma,
                    orientacao: jogadores[i].orientacao,
                    jogadorQueArremessou: jogadores[i],
                }))

                let armaAtual = armas.at(-1)
                armaAtual.rodando = armaAtual.arma == 'espada' || armaAtual.arma == 'marreta' ? true : false;
                armaAtual.daDano = true;

                if (armaAtual.arma == 'bomba') {
                    setTimeout(() => {
                        armaAtual.explode = true;
                    }, 0); // sem esse timeout de 0ms nao funciona por algum motivo
                }

                jogadores[i].arma = 'vazio';
                jogadores[i].podeArremessar = false

                setTimeout(() => {
                    jogadores[i].podeArremessar = true;
                }, 500);
            }
        }
    }

    ///COLISÕES///

    //colisões de arma no chão
    plataformas.forEach(plataforma => {
        armas.forEach(arma => {
            //verifica se o item tá no chao pra soltar particulas e emitir som
            arma.soltaParticulaNoChao = true;
            arma.pisandoNoChao.forEach(el => {
                if (el) arma.soltaParticulaNoChao = false;
            })

            if (arma.y + arma.height <= plataforma.position.y && arma.y + arma.height + arma.velocidade.y >= plataforma.position.y && arma.x + arma.width > plataforma.position.x && arma.x < plataforma.position.x + plataforma.width) {
                if (arma.explode) explodir(arma, 200);

                if (arma.soltaParticulaNoChao && !arma.debounce) { //solta particulas quando bate no chao
                    arma.debounce = true;
                    setTimeout(() => {
                        arma.debounce = false;
                    }, 100);

                    tocarSom('landing_1');
                    for (let j = 0; j < 6; j++) {
                        let velX = (Math.random() - 0.5) * 3;
                        if (velX < 1 && velX >= 0) velX += 1;
                        if (velX > -1 && velX <= 0) velX -= 1;

                        soltarParticulas(arma.x + arma.width / 2, arma.y + arma.height, velX, Math.random() * -1, arma)
                    }
                }
                arma.soltaParticulaNoChao = false;

                arma.pisandoNoChao[plataformas.indexOf(plataforma)] = true;

                arma.velocidade.y = 0;
                arma.atrito = true;

                setTimeout(() => {
                    arma.rodando = false;
                }, 600); //dá 2 voltas e para

            } else {
                arma.pisandoNoChao[plataformas.indexOf(plataforma)] = false;
            }
        })
    })

    jogadores.forEach(jogador => {
        let outroJogador = jogador == jogadores[0] ? jogadores[1] : jogadores[0];

        //verifica se o jogador tá pisando no chao pra soltar particulas e emitir som
        jogador.soltaParticulaNoChao = true;
        jogador.pisandoNoChao.forEach(el => {
            if (el) jogador.soltaParticulaNoChao = false;
        })

        jogador.podePular = false; //impede que o jogador pule no ar

        //colisões de arma com jogadores
        armas.forEach(arma => {
            if (arma.colisoes) {
                //colisao pela esquerda
                if (arma.y + arma.height >= outroJogador.position.y && arma.y <= outroJogador.position.y + outroJogador.height && ((arma.x + arma.width <= outroJogador.position.x && arma.x + arma.width + arma.velocidade.x >= outroJogador.position.x + outroJogador.velocidade.x))) {
                    if (arma.arma == 'bomba' && arma.explode) explodir(arma, 200)
                    else if (arma.pegavel) pegarItem(outroJogador, arma)
                    else if (outroJogador.podeTomarArremesso && arma.daDano) danoDeArremesso(outroJogador, arma)

                    //colisao pela direita
                } else if ((arma.y + arma.height >= outroJogador.position.y && arma.y <= outroJogador.position.y + outroJogador.height && arma.x >= outroJogador.position.x + outroJogador.width && arma.x + arma.velocidade.x <= outroJogador.position.x + outroJogador.width + outroJogador.velocidade.x)) {
                    if (arma.arma == 'bomba' && arma.explode) explodir(arma, 200);
                    else if (arma.pegavel) pegarItem(outroJogador, arma)
                    else if (outroJogador.podeTomarArremesso && arma.daDano) danoDeArremesso(outroJogador, arma)
                }

                //colisao vertical (por cima e por baixo) 
                if (((arma.x + arma.width >= outroJogador.position.x && arma.x <= outroJogador.position.x + outroJogador.width && arma.y + arma.height >= outroJogador.position.y && arma.y <= outroJogador.position.y + outroJogador.height) || ((arma.y + arma.height <= outroJogador.position.y + outroJogador.velocidade.y && arma.y + arma.height + arma.velocidade.y >= outroJogador.position.y + outroJogador.velocidade.y && arma.x < outroJogador.position.x + outroJogador.width && arma.x > outroJogador.position.x)))) {
                    if (arma.arma == 'bomba' && arma.explode) explodir(arma, 200);
                    else if (arma.daDano) danoDeArremesso(outroJogador, arma)
                    else if (arma.pegavel) pegarItem(outroJogador, arma)
                }
            }
        })

        //colisões jogador-plataforma
        plataformas.forEach(plataforma => {
            // colisão com plataformas por cima
            if (jogador.position.y + jogador.height <= plataforma.position.y && jogador.position.y + jogador.height + jogador.velocidade.y >= plataforma.position.y && jogador.position.x + jogador.width > plataforma.position.x && jogador.position.x < plataforma.position.x + plataforma.width) {
                jogador.velocidade.y = 0;

                jogador.position.y = plataforma.position.y - jogador.height;

                if (jogador.soltaParticulaNoChao) { //solta particulas quando bate no chao
                    tocarSom('landing_3');
                    for (let j = 0; j < 10; j++) {

                        let velX = (Math.random() - 0.5) * 3;
                        if (velX < 1 && velX >= 0) velX += 1;
                        if (velX > -1 && velX <= 0) velX -= 1;

                        soltarParticulas(jogador.position.x + jogador.width / 2, jogador.position.y + jogador.height, velX, Math.random() * -1, jogador)

                    }
                }
                jogador.soltaParticulaNoChao = false;

                jogador.pisandoNoChao[plataformas.indexOf(plataforma)] = true;

                jogador.podePular = true; // permite que o jogador pule (pois está em cima de uma plataforma)
                jogador.podeDoubleJump = true;
                jogador.podePisar = false; // impede que o jogador dê uma pisada
                jogador.estaDandoPisada = false;
            } else {
                jogador.pisandoNoChao[plataformas.indexOf(plataforma)] = false;
            }

            if (plataforma.colisoes) {
                // colisão com plataformas por baixo (também cuida de casos em que o jogador entra dentro da plataforma)
                if (((jogador.position.y >= plataforma.position.y + plataforma.height && jogador.position.y + jogador.velocidade.y <= plataforma.position.y + plataforma.height)) && jogador.position.x + jogador.width > plataforma.position.x && jogador.position.x < plataforma.position.x + plataforma.width) {
                    jogador.position.y = plataforma.position.y + plataforma.height + 10;
                    jogador.velocidade.y = 0.1;
                    jogador.podePular = false; // impede que o jogador pule (pois há uma plataforma acima)
                }

                // colisão com plataformas horizontalmente
                if ((jogador.position.y + jogador.height >= plataforma.position.y && jogador.position.y <= plataforma.position.y + plataforma.height) && ((jogador.position.x + jogador.width <= plataforma.position.x && jogador.position.x + jogador.width + jogador.velocidade.x >= plataforma.position.x) || (jogador.position.x >= plataforma.position.x + plataforma.width && jogador.position.x + jogador.velocidade.x <= plataforma.position.x + plataforma.width))) {
                    if (jogador.position.x + jogador.width < plataforma.position.x) {
                        jogador.position.x = plataforma.position.x - jogador.width;
                    }
                    if (jogador.position.x > plataforma.position.x + plataforma.width) {
                        jogador.position.x = plataforma.position.x + plataforma.width;
                    }

                    jogador.encostandoEmParede = true
                    jogador.seMoveu = false;
                    jogador.velocidade.x = 0;
                }

                //fix pra caso o jogador entre dentro da plataforma
                if (((jogador.position.y <= plataforma.position.y + plataforma.height && jogador.position.y + jogador.height > plataforma.position.y)) && jogador.position.x + jogador.width > plataforma.position.x && jogador.position.x < plataforma.position.x + plataforma.width) {
                    if (jogador.position.y < 850) { //consertando um bug que faz o jogador teleportar pra cima da plataforma principal quando ele tá em baixo dela e pula na quina
                        jogador.position.y = plataforma.position.y - jogador.height;
                        jogador.velocidade.y = -0.1;
                    }
                    else {
                        jogador.position.y = plataforma.position.y + plataforma.height;
                        jogador.velocidade.y = 0.1;
                    }

                }

                if (jogador.encostandoEmParede && jogador.seMoveu) { //fix pra bug em que um jogador entra dentro do outro quando estao encostados em uma parede e andando
                    jogador.encostandoEmParede = false;
                }
            }
        })

        //colisões jogador-jogador
        // players por cima
        if (jogador.position.y + jogador.height <= outroJogador.position.y + outroJogador.velocidade.y && jogador.position.y + jogador.height + jogador.velocidade.y >= outroJogador.position.y + outroJogador.velocidade.y && jogador.position.x + jogador.width > outroJogador.position.x && jogador.position.x < outroJogador.position.x + outroJogador.width) {
            jogador.velocidade.y = -0.1;
            jogador.position.y = outroJogador.position.y - jogador.height;

            if (jogador.soltaParticulaNoChao) { //solta particulas quando bate no chao
                tocarSom('landing_3');
                for (let j = 0; j < 10; j++) {

                    let velX = (Math.random() - 0.5) * 3;

                    if (velX < 1 && velX >= 0) velX += 1;
                    if (velX > -1 && velX <= 0) velX -= 1;

                    soltarParticulas(jogador.position.x + jogador.width / 2, jogador.position.y + jogador.height, velX, Math.random() * -1, jogador)

                }
            }
            jogador.soltaParticulaNoChao = false;

            jogador.pisandoNoChao[3] = true;

            jogador.podePular = true; // permite que o jogador pule (pois está em cima do outro jogador)
            jogador.podeDoubleJump = false;
            jogador.podePisar = false; // impede que o jogador dê uma pisada
            jogador.estaDandoPisada = false;
        } else {
            if (((jogador.position.y + jogador.height < outroJogador.position.y - 1) || (jogador.position.y + jogador.height > outroJogador.position.y + 2))) {
                jogador.pisandoNoChao[3] = false;
            }
        }

        // detectando se há um jogador acima do outro
        if (outroJogador.position.y + outroJogador.height >= jogador.position.y - 0.3 && outroJogador.position.y + outroJogador.height < jogador.position.y + 0.3 && jogador.position.x + jogador.width >= outroJogador.position.x && jogador.position.x <= outroJogador.position.x + outroJogador.width) { //0.3 é uma margem de segurança
            jogador.podePular = false; // impede que o jogador pule (pois há outro jogador em cima)
        }

        //colisao horizontal
        if ((jogador.position.y + jogador.height >= outroJogador.position.y && jogador.position.y <= outroJogador.position.y + outroJogador.height) && ((jogador.position.x + jogador.width <= outroJogador.position.x && jogador.position.x + jogador.width + jogador.velocidade.x >= outroJogador.position.x + outroJogador.velocidade.x) || (jogador.position.x >= outroJogador.position.x + outroJogador.width && jogador.position.x + jogador.velocidade.x <= outroJogador.position.x + outroJogador.width + outroJogador.velocidade.x))) {
            //colisão
            let orientacaoColisao = jogador.position.x + jogador.width <= outroJogador.position.x ? 'esquerda' : 'direita';

            if (orientacaoColisao == 'esquerda' && jogador.velocidade.x != 0) {
                jogador.position.x = outroJogador.position.x - jogador.width;
            }
            if (orientacaoColisao == 'direita' && jogador.velocidade.x != 0) {
                jogador.position.x = outroJogador.position.x + outroJogador.width;
            }

            jogador.velocidade.x = 0;

            if (!outroJogador.encostandoEmParede) outroJogador.velocidade.x += orientacaoColisao == 'esquerda' ? 1 : -1;

            if (jogador.estaDandoDash) { //impacto no dash joga o outro jogador pra frente
                outroJogador.estaDandoDash = true;

                outroJogador.velocidade.x += orientacaoColisao == 'esquerda' ? jogador.dashBase / 2 : jogador.dashBase / -2; //outro jogador ganha metade da velocidade do jogador que bateu nele

                setTimeout(() => {
                    outroJogador.estaDandoDash = false;
                }, 100); //tempo da animação 100ms

                //jogador que bateu é arremessado pra trás
                jogador.estaDandoDash = true;
                jogador.velocidade.x = orientacaoColisao == 'esquerda' ? -3 : 3;

                setTimeout(() => {
                    jogador.estaDandoDash = false;
                }, 30); //tempo da animação 100ms
            }
        }
    })
}

// começa o som ambiente só quando o jogador interage com a pagina;
document.addEventListener("keydown", () => {
    if (audioContext.state == "suspended") {
        audioContext.resume();
    }
    tocarLoop();
}, { once: true });

boostDeAcessorio();

// tela de confirmação antes de iniciar o jogo (aperte qualquer tecla)
let controleTexto = 0;
document.fonts.load('50px "Jersey 10"').then(() => {
    c.font = '50px "Jersey 10"';
    c.textAlign = 'center';
    c.lineWidth = 4;
    c.fillStyle = 'white';
    escreverTexto();
});


//inicia o jogo quando aperta uma tecla
document.addEventListener("keydown", iniciarJogo)
document.addEventListener("mousedown", iniciarJogo)

//easter egg da bomba
cheet('↑ ↑ ↓ ↓ ← → ← →', () => {
    droparItem(jogadores[1]);
    jogadores[1].arma = 'bomba';

});
cheet('w w s s a d a d', () => {
    droparItem(jogadores[0]);
    jogadores[0].arma = 'bomba';
});

//detecção das teclas
let teclasPlayer1 = JSON.parse(localStorage.getItem("teclasPlayer1"));
let teclasPlayer2 = JSON.parse(localStorage.getItem("teclasPlayer2"));

window.addEventListener('keydown', ({ code }) => {
    if (!congelaJogadores) {
        switch (code) {
            // teclas do jogador 0
            case teclasPlayer1.cima: // apertou W
                teclas[0].cima.pressionada = true;
                jogadores[0].soltaParticulaNoChao = true;
                break;
            case teclasPlayer1.esquerda: // apertou A
                teclas[0].esquerda.pressionada = true;
                break;
            case teclasPlayer1.baixo: // apertou S
                teclas[0].baixo.pressionada = true;
                break;
            case teclasPlayer1.direita: // apertou D
                teclas[0].direita.pressionada = true;
                break;
            case teclasPlayer1.dash: // apertou SHIFT esquerdo
                teclas[0].dash.pressionada = true;
                break;
            case teclasPlayer1.ataque: // apertou G (ataque)
                teclas[0].ataque.pressionada = true;
                break;
            case teclasPlayer1.arremesso: // apertou J (arremessar)
                teclas[0].arremesso.pressionada = true;
                break;

            // teclas do jogador 1
            case teclasPlayer2.cima: // apertou CIMA
                teclas[1].cima.pressionada = true;
                jogadores[1].soltaParticulaNoChao = true;
                break;
            case teclasPlayer2.esquerda: // apertou ESQUERDA
                teclas[1].esquerda.pressionada = true;
                break;
            case teclasPlayer2.baixo: // apertou BAIXO
                teclas[1].baixo.pressionada = true;
                break;
            case teclasPlayer2.direita: // apertou DIREITA
                teclas[1].direita.pressionada = true;
                break;
            case teclasPlayer2.ataque: // apertou 1 direito
                teclas[1].ataque.pressionada = true;
                break;
            case teclasPlayer2.dash: // apertou 2
                teclas[1].dash.pressionada = true;
                break;
            case teclasPlayer2.arremesso: // apertou 3 (arremessar)
                teclas[1].arremesso.pressionada = true;
                break;
        }
    }
});


window.addEventListener('keyup', ({ code }) => { //quando soltar a tecla
    switch (code) {
        //teclas do jogador 0
        case teclasPlayer1.cima: //soltou W
            teclas[0].cima.pressionada = false;
            jogadores[0].debounce = false; //permite que dê double jump
            break;
        case teclasPlayer1.esquerda: //soltou A
            teclas[0].esquerda.pressionada = false;
            break;
        case teclasPlayer1.baixo: //soltou S
            teclas[0].baixo.pressionada = false;
            break;
        case teclasPlayer1.direita: //soltou D
            teclas[0].direita.pressionada = false;
            break;
        case teclasPlayer1.dash: //soltou SHIFT
            teclas[0].dash.pressionada = false;
            break;
        case teclasPlayer1.ataque: //soltou G (ataque)
            teclas[0].ataque.pressionada = false;
            // jogadores[0].podeAtacar = true;
            break;
        case teclasPlayer1.arremesso: // soltou J (arremessar)
            teclas[0].arremesso.pressionada = false;
            break;

        //teclas do jogador 1
        case teclasPlayer2.cima: //soltou CIMA
            teclas[1].cima.pressionada = false;
            jogadores[1].debounce = false; //permite que dê double jump
            break;
        case teclasPlayer2.esquerda: //soltou ESQUERDA
            teclas[1].esquerda.pressionada = false;
            break;
        case teclasPlayer2.baixo: //soltou BAIXO
            teclas[1].baixo.pressionada = false;
            break;
        case teclasPlayer2.direita: //soltou DIREITA
            teclas[1].direita.pressionada = false;
            break;
        case teclasPlayer2.ataque: // soltou 1
            teclas[1].ataque.pressionada = false;
            break;
        case teclasPlayer2.dash: // soltou 2            
            teclas[1].dash.pressionada = false;
            // jogadores[1].podeAtacar = true;
            break;
        case teclasPlayer2.arremesso: // soltou 3 (arremessar)
            teclas[1].arremesso.pressionada = false;
            break;
    }
})


//parte do rafael
const conteinerVitoriaEl = document.querySelector("#conteiner-vitoria");
const nomeVencedorEl = document.querySelector("#nome-vencedor");
const chapeuVencedorEl = document.querySelector("#chapeu-vencedor");
const rostoVencedorEl = document.querySelector("#rosto-vencedor");
const roupaVencedorEl = document.querySelector("#roupa-vencedor");
const vetorStatus = document.querySelectorAll(".status-vencedor");

const somVitoriaEl = new Audio("../efeitos_sonoros/vitoria-som.mp3"); somVitoriaEl.preload = "auto";

//DEFINIR VENCEDOR

function definirImagemVencedor(array, vencedor) {
    somVitoriaEl.currentTime = 0;
    somVitoriaEl.play();

    // pausa o jogo
    jogoRodando = false;

    const totalMs = Math.round(tempoDeJogoMs);
    const minutos = Math.floor(totalMs / 60000);
    const segundos = Math.floor((totalMs % 60000) / 1000);
    const milissegundos = totalMs % 1000;

    // pega o outro jogador
    const outroJogador = jogadores[vencedor === 0 ? 1 : 0];

    // atualiza dano total do perdedor
    outroJogador.danoTotal += jogadores[vencedor].danoRecebido;

    //ATUALIZA RANKING AO FINAL DA PARTIDA
    atualizarPlanilha(jogadores[vencedor], outroJogador);

    // atualiza status na tela
    for (let statusAtual of vetorStatus) {
        if (statusAtual.id === "tempo-status")
            statusAtual.value = `${minutos}min:${segundos}s:${milissegundos}ms`;
        else if (statusAtual.id === "dano-causado-status")
            statusAtual.value = outroJogador.danoRecebido.toFixed(1);
        else if (statusAtual.id === "dano-recebido-status")
            statusAtual.value = jogadores[vencedor].danoRecebido.toFixed(1);
    }

    // atualiza elementos visuais do vencedor
    nomeVencedorEl.innerHTML = array[vencedor].nome;
    chapeuVencedorEl.src = `../imgs/chapeu-${array[vencedor].chapeu}.png`;
    rostoVencedorEl.src = `../imgs/cara-${array[vencedor].rosto}.png`;
    roupaVencedorEl.src = `../imgs/roupa-${array[vencedor].roupa}.png`;

    chapeuVencedorEl.classList.add(`chapeu-${array[vencedor].chapeu}`);
    rostoVencedorEl.classList.add("cara");
    roupaVencedorEl.classList.add(`roupa-${array[vencedor].roupa}`);

    conteinerVitoriaEl.style.display = "block";
}

//FUNÇÕES DE RANKING

const RANKING_WEBAPP = "https://script.google.com/macros/s/AKfycbxJcnrjSplBeifZfaCYcvtJy88zLRXmIuAOVZu8FuhBa5nWQpmekWcNMJJcNrH_YJYS/exec";

function registrarIncrementos(jogadorVencedor, jogadorPerdedor) {
    // CRIA OS ELEMENTOS DA RODADA
    const rankingIncrementos = [
        {
            nome: jogadorVencedor.nome,
            vitorias: 1,
            danoTotal: jogadorPerdedor.danoRecebido
        },
        {
            nome: jogadorPerdedor.nome,
            vitorias: 0,
            danoTotal: jogadorVencedor.danoRecebido
        }
    ];

    return rankingIncrementos;
}

async function enviarRankingSessao(rankingIncrementos) {
    for (const jogador of rankingIncrementos) {
        try {
            await fetch(RANKING_WEBAPP, {
                method: "POST",
                body: JSON.stringify(jogador)
            });
        } catch (err) {
            console.error("Erro ao enviar jogador:", jogador.nome, err);
        }
    }
}

//ATUALIZA A PLANILHA A PARTIR DO REGISTRO DE INCREMENTOS E O ENVIO DELES PARA A PLANILHA

async function atualizarPlanilha(jogadorVencedor, jogadorPerdedor) {
    const incrementos = registrarIncrementos(jogadorVencedor, jogadorPerdedor);
    await enviarRankingSessao(incrementos);
}

//BOTÕES OPÇÕES

const vetorOpcoes = document.querySelectorAll(".opcao");
const legendaRejogarEl = document.querySelector("#legenda-rejogar");
const legendaVoltarMenuEl = document.querySelector("#legenda-voltar-menu");

const somHooverOpcaoEl = new Audio("../efeitos_sonoros/hoover-opcao.wav"); somHooverOpcaoEl.preload = "auto";
const somCliqueOpcaoEl = new Audio("../efeitos_sonoros/selecao-som.mp3"); somCliqueOpcaoEl.preload = "auto";

let botaoJaClicado = 0;
let delaySom;

for (let op of vetorOpcoes) {
    op.addEventListener("mouseover", function () {
        somHooverOpcaoEl.currentTime = 0;
        somHooverOpcaoEl.play();

        if (op.id == "btn-rejogar") {
            legendaRejogarEl.style.display = "inline";
            legendaRejogarEl.style.left = "11%";

        }
        else if (op.id == "btn-voltar-menu") {
            legendaVoltarMenuEl.style.right = "11%";
            legendaVoltarMenuEl.style.display = "inline";
        }
    })

    op.addEventListener("click", function () {
        if (!botaoJaClicado) {
            delaySom = 0;
            botaoJaClicado = 1;
        }
        else {
            delaySom = 2000;
        }

        setTimeout(() => {
            somCliqueOpcaoEl.currentTime = 0;
            somCliqueOpcaoEl.play();
        }, delaySom)

        if (op.id == "btn-rejogar") {
            setTimeout(() => {
                jaExisteVencedor = 0
                jaAlteradoRanking = 0;
                jaCaiu = false;
                jogoRodando = true;
                jogoStartTime = null;
                tempoDeJogoMs = 0; // tempo em milissegundos
                vidaDosPlayers = [2, 2];

                while(armas.length > 0) armas.pop();

                jogadores[0].arma = player1.arma;
                jogadores[1].arma = player2.arma;

                //caso os jogadores comecem o jogo sem armas, elas spawnam depois de um tempo
                if (jogadores[0].arma == 'vazio') {
                    setTimeout(() => {
                        spawnarArma();
                    }, 6000);
                }
                if (jogadores[1].arma == 'vazio') {
                    setTimeout(() => {

                        spawnarArma();
                    }, 11000);
                }

                conteinerVitoriaEl.style.display = "none";
                reiniciarJogo(true);
                // window.location.reload();
            }, 600);
        }
        else if (op.id == "btn-voltar-menu") {
            setTimeout(() => {
                window.location.href = "../index.html"
            }, 700);
        }
    })

    op.addEventListener("mouseout", function () {

        if (op.id == "btn-rejogar") {
            legendaRejogarEl.style.display = "none";
            legendaRejogarEl.style.left = "0%";

        }
        else if (op.id == "btn-voltar-menu") {
            legendaVoltarMenuEl.style.right = "0%";
            legendaVoltarMenuEl.style.display = "none";
        }
    })
}