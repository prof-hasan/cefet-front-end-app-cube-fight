const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

//ajuste do tamanho do espaço do jogo (parte jogável)
canvas.width = 1920; //1600 //
canvas.height = 1080; //900

//carregando informações do menu
let player1 = JSON.parse(localStorage.getItem("player1"));
let player2 = JSON.parse(localStorage.getItem("player2"));

let itemMapa = JSON.parse(localStorage.getItem("mapa"));
let mapaSelecionado = itemMapa.mapaDefinido;

// tempo de jogo (ms) - inicia quando o loop começa
let jogoRodando = true;
let jogoStartTime = null; // será preenchido com o timestamp do primeiro frame
let tempoDeJogoMs = 0; // tempo decorrido em milissegundos

let jaExisteVencedor = 0 //variável que define apenas um vencedor por partida
let jaAlteradoRanking = 0;

//provisorio enquanto nao deploya
// let player1 = {    jogadores[j].ataqueBase += pesos[arrayDosPlayers[j].chapeu]
//     chapeu: 'rei',
//     rosto: 'bravo',
//     roupa: 'mago',
//     arma: 'marreta',
//     nome: 'robertson'
// }
// let player2 = {
//     chapeu: 'cowboy',
//     rosto: 'feliz',
//     roupa: 'paleto',
//     arma: 'lanca',
//     nome: '13k'
// }


console.log("Jogador 1 escolheu:", player1.chapeu, player1.rosto, player1.roupa, player1.arma);
console.log("Jogador 2 escolheu:", player2.chapeu, player2.rosto, player2.roupa, player2.arma);

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

        this.width = 50
        this.height = 50

        this.velocidadeBase = 15;
        this.saltoBase = 27;
        this.gravidadeBase = 1.3;
        this.pisadaBase = 23;
        this.dashBase = 20;
        this.dashCooldown = 500; // tempo em ms
        this.ataqueBase = 30; //35
        this.alcanceBase = 35;
        this.alcanceVerticalBase = 5;
        this.ataqueCooldown = 400;
        this.boostDano = 0;
        this.acrescimoBoostDano = 0.1;

        this.podePular = false;
        this.podeDoubleJump = false;
        this.podePisar = false;
        this.podeDarDash = true;
        this.podeAtacar = true;
        this.soltaParticula = true;
        this.soltaParticulaNoChao = true;
        this.podeTomarArremesso = true;
        this.podeArremessar = true;

        this.orientacao = orientacao; //direita ou esquerda
        this.estaDandoDash = false;
        this.estaSendoAtacado = false;
        this.estaDandoPisada = false;

        this.encostandoEmParede = false;
        this.pisandoNoChao = [false, false, false, false];
        this.seMoveu = false;

        this.debounce = false; //faz o jogador ter que soltar o W antes de dar um double jump
        this.cor = cor;

        this.danoRecebido = 0;

        this.hueNameTag = 0;

        // ataque (animação de espada)
        this.arma = arma;

        this.tomandoDano = false;
        this.estaAtacando = false;
        this.ataqueStartTime = 0; // em ms (performance.now)
        this.ataqueDuracao = 200; // duração do swing em ms
        this.ataqueAnguloInicio = 0; // rad
        this.ataqueAnguloFinal = 0; // rad
        // pivot dentro da imagem da arma (px) - aproximado
        this.armaPivot = { x: 12, yFromBottom: 8 };

        // estocada (lança / luva) - translacao pra frente e volta
        this.estaEstocando = false;
        this.estocadaStartTime = 0;
        this.estocadaDuracao = 150; // ms
        this.estocadaDistancia = 20; // px (quanto a arma avança no pico)
        this.estocadaRecua = 2; // px (quanto a arma recua antes de estocar)
    }

    iniciarAtaque() {
        if (this.estaAtacando) return;
        this.estaAtacando = true;
        this.ataqueStartTime = performance.now();
        // definir ângulos dependendo da orientação (em radianos)
        // para direita: começa alto à esquerda e vai para baixo à direita
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
        // cancelar ataque rotacional caso esteja acontecendo
        this.estaAtacando = false;
        this.estaEstocando = true;
        this.estocadaStartTime = performance.now();
        // manter estocadaDuracao e estocadaDistancia já configurados no construtor
    }

    escreverNameTag() {
        if (this.nome == 'pietro' || this.nome == '13k' || this.nome == 'rafael') {
            c.save();

            // avança o arco-íris
            this.hueNameTag = (this.hueNameTag + 1) % 360;

            // configurações básicas
            c.font = '16px sans-serif';
            c.textAlign = 'center';
            c.lineWidth = 4;

            // nome centralizado
            const nomeX = this.position.x + this.width / 2;
            const nomeY = this.position.y - 30;

            // efeito rainbow
            const corRainbow = `hsl(${this.hueNameTag}, 100%, 50%)`;

            // contorno preto
            c.strokeStyle = 'rgba(0,0,0,0.9)';

            // texto com rainbow
            c.fillStyle = corRainbow;

            // desenha
            c.strokeText(this.nome || '', nomeX, nomeY);
            c.fillText(this.nome || '', nomeX, nomeY);

            c.restore();

            this.cor = corRainbow;
            soltarParticulas(this.position.x + this.width / 2, this.position.y + this.height / 2, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, this);
        } else {
            // desenha a nametag com o nome do jogador acima da cabeça
            c.save();
            c.font = '16px sans-serif';
            c.textAlign = 'center';
            c.lineWidth = 4;
            c.strokeStyle = 'rgba(0,0,0,0.9)';
            c.fillStyle = 'white';
            const nomeX = this.position.x + this.width / 2;
            const nomeY = this.position.y - 30; // 8px acima do topo do jogador
            c.strokeText(this.nome || '', nomeX, nomeY);
            c.fillText(this.nome || '', nomeX, nomeY);
            c.restore();
        }

    }

    desenhar() {
        let outroJogador = jogadores[0];
        if(this == outroJogador) outroJogador = jogadores[1];

        if (this.orientacao == 'esquerda') {
            // flipado
            c.save();
            c.scale(-1, 1);

            c.fillStyle = 'black';
            c.fillRect(-this.position.x, this.position.y, -this.width, this.height)

            c.fillStyle = 'white';
            c.fillRect(-this.position.x - 3, this.position.y + 3, -this.width + 6, this.height - 6)

            //deixa o jogador vermelho quando toma dano
            if (this.tomandoDano) {
                c.fillStyle = "rgba(255, 0, 0, " + (outroJogador.ataqueBase + outroJogador.boostDano)/250 + ")" // quando o dano é 250, o jogador fica totalmente vermelho
                c.fillRect(-this.position.x - 3, this.position.y + 3, -this.width + 6, this.height - 6)

                setTimeout(() => {
                    this.tomandoDano = false
                }, 170);
            }

            c.drawImage(this.imagens.rosto, -this.position.x - this.width, this.position.y, this.width, this.height); //desenhando rosto
            c.drawImage(this.imagens.chapeu, -this.position.x - this.imagens.chapeu.width + 4, this.position.y - this.imagens.chapeu.height + 5, this.imagens.chapeu.width, this.imagens.chapeu.height); //desenhando chapeu
            c.drawImage(this.imagens.roupa, -this.position.x - this.imagens.roupa.width + 2, this.position.y + this.height - this.imagens.roupa.height, this.imagens.roupa.width, this.imagens.roupa.height); //desenhando roupa

            // desenhando arma (rotacionada se atacando, estocada translacional)
            if (this.estaAtacando) {
                // coords usados originalmente para drawImage na versão flipada
                const imgX = -this.position.x - 2 * this.width / 8;
                const imgY = this.position.y + 7 * this.height / 8 - this.imagens.arma.height;

                const pivotImgX = Math.min(this.armaPivot.x, this.imagens.arma.width || 0);
                const pivotImgY = (this.imagens.arma.height || 0) - this.armaPivot.yFromBottom;

                // calcular progresso da animação e ângulo atual
                const now = performance.now();
                let t = (now - this.ataqueStartTime) / this.ataqueDuracao;
                if (t >= 1) {
                    this.estaAtacando = false;
                    t = 1;
                }
                const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic
                const angle = this.ataqueAnguloInicio + (this.ataqueAnguloFinal - this.ataqueAnguloInicio) * ease;

                // traduzir para o pivot, rotacionar e desenhar
                c.save();
                c.translate(imgX + pivotImgX, imgY + pivotImgY);
                c.rotate(angle);
                c.drawImage(this.imagens.arma, -pivotImgX, -pivotImgY, this.imagens.arma.width, this.imagens.arma.height);
                c.restore();
            } else if (this.estaEstocando) {
                let imgX = -this.position.x - 2 * this.width / 8;
                let imgY = this.position.y + 7 * this.height / 8 - this.imagens.arma.height;

                if (this.arma == 'lanca') {
                    imgX = -this.position.x - 4 * this.width / 8;
                }

                const pivotImgX = Math.min(this.armaPivot.x, this.imagens.arma.width || 0);
                const pivotImgY = (this.imagens.arma.height || 0) - this.armaPivot.yFromBottom;

                const now = performance.now();
                let t = (now - this.estocadaStartTime) / this.estocadaDuracao;
                if (t >= 1) {
                    this.estaEstocando = false;
                    t = 1;
                }
                // timeline: recuo curto (prePct) -> empurrão até o pico
                const prePct = 0.2;
                const back = this.estocadaRecua || Math.max(8, Math.round(this.estocadaDistancia * 0.2));
                let baseDisp = 0;
                if (t < prePct) {
                    const p = t / prePct;
                    const easeIn = p * p * (3 - 2 * p); // smoothstep
                    baseDisp = -back * easeIn;
                } else {
                    const p = (t - prePct) / (1 - prePct);
                    const easeOut = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // easeInOutCubic
                    baseDisp = -back + (this.estocadaDistancia + back) * easeOut;
                }

                // flipado: usar o mesmo baseDisp (já pensado como recuo->avanço);
                // inverter o sinal aqui fazia o movimento ficar na direção errada
                const displacement = baseDisp;

                c.save();
                c.translate(imgX + pivotImgX + displacement, imgY + pivotImgY);
                c.drawImage(this.imagens.arma, -pivotImgX, -pivotImgY, this.imagens.arma.width, this.imagens.arma.height);
                c.restore();
            } else {
                let posX = -this.position.x - 2 * this.width / 8
                if (this.arma == 'lanca') posX = -this.position.x - 4 * this.width / 8

                c.drawImage(this.imagens.arma, posX, this.position.y + 7 * this.height / 8 - this.imagens.arma.height, this.imagens.arma.width, this.imagens.arma.height); //desenhando arma
            }
            c.restore();

            this.escreverNameTag(); //escreve o nome do jogador
        } else {
            // normal
            c.fillStyle = 'black'; //borda preta
            c.fillRect(this.position.x, this.position.y, this.width, this.height)

            c.fillStyle = 'white';  //cubinho
            c.fillRect(this.position.x + 3, this.position.y + 3, this.width - 6, this.height - 6)

            //deixa o jogador vermelho quando toma dano
            if (this.tomandoDano) {
                c.fillStyle = "rgba(255, 0, 0, " + (outroJogador.ataqueBase + outroJogador.boostDano)/250 + ")" // quando o dano é 250, o jogador fica totalmente vermelho
                c.fillRect(this.position.x + 3, this.position.y + 3, this.width - 6, this.height - 6)

                setTimeout(() => {
                    this.tomandoDano = false
                }, 170);
            }


            c.drawImage(this.imagens.rosto, this.position.x, this.position.y, this.width, this.height); //desenhando rosto
            c.drawImage(this.imagens.chapeu, this.position.x - 4, this.position.y - this.imagens.chapeu.height + 5, this.imagens.chapeu.width, this.imagens.chapeu.height); //desenhando chapeu
            c.drawImage(this.imagens.roupa, this.position.x - 2, this.position.y + this.height - this.imagens.roupa.height, this.imagens.roupa.width, this.imagens.roupa.height); //desenhando roupa



            // desenhando arma (rotacionada se atacando, estocada translacional)
            if (this.estaAtacando) {
                const imgX = this.position.x + 6 * this.width / 8;
                const imgY = this.position.y + 7 * this.height / 8 - this.imagens.arma.height;

                const pivotImgX = Math.min(this.armaPivot.x, this.imagens.arma.width || 0);
                const pivotImgY = (this.imagens.arma.height || 0) - this.armaPivot.yFromBottom;

                const now = performance.now();
                let t = (now - this.ataqueStartTime) / this.ataqueDuracao;
                if (t >= 1) {
                    this.estaAtacando = false;
                    t = 1;
                }
                const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic
                const angle = this.ataqueAnguloInicio + (this.ataqueAnguloFinal - this.ataqueAnguloInicio) * ease;

                c.save();
                c.translate(imgX + pivotImgX, imgY + pivotImgY);
                c.rotate(angle);
                c.drawImage(this.imagens.arma, -pivotImgX, -pivotImgY, this.imagens.arma.width, this.imagens.arma.height);
                c.restore();
            } else if (this.estaEstocando) {
                let imgX = this.position.x + 6 * this.width / 8;
                let imgY = this.position.y + 7 * this.height / 8 - this.imagens.arma.height;

                if (this.arma == 'lanca') {
                    imgX = this.position.x + 4 * this.width / 8;
                }

                const pivotImgX = Math.min(this.armaPivot.x, this.imagens.arma.width || 0);
                const pivotImgY = (this.imagens.arma.height || 0) - this.armaPivot.yFromBottom;

                const now = performance.now();
                let t = (now - this.estocadaStartTime) / this.estocadaDuracao;
                if (t >= 1) {
                    this.estaEstocando = false;
                    t = 1;
                }
                const prePct = 0.2;
                const back = this.estocadaRecua || Math.max(8, Math.round(this.estocadaDistancia * 0.2));
                let baseDisp = 0;
                if (t < prePct) {
                    const p = t / prePct;
                    const easeIn = p * p * (3 - 2 * p); // smoothstep
                    baseDisp = -back * easeIn;
                } else {
                    const p = (t - prePct) / (1 - prePct);
                    const easeOut = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // easeInOutCubic
                    baseDisp = -back + (this.estocadaDistancia + back) * easeOut;
                }

                const displacement = baseDisp;

                c.save();
                c.translate(imgX + pivotImgX + displacement, imgY + pivotImgY);
                c.drawImage(this.imagens.arma, -pivotImgX, -pivotImgY, this.imagens.arma.width, this.imagens.arma.height);
                c.restore();
            } else {
                let posX = this.position.x + 6 * this.width / 8;
                if (this.arma == 'lanca') posX = this.position.x + 4 * this.width / 8;

                c.drawImage(this.imagens.arma, posX, this.position.y + 7 * this.height / 8 - this.imagens.arma.height, this.imagens.arma.width, this.imagens.arma.height); //desenhando arma
            }

            //mostra a hitbox da arma
            // c.fillRect(this.position.x + this.width, this.position.y - this.alcanceVerticalBase, this.alcanceBase, this.height + 2 * this.alcanceVerticalBase);
            // c.fillRect(this.position.x + this.width, this.position.y - this.alcanceVerticalBase, 650, this.height + 2 * this.alcanceVerticalBase)

            // desenha a nametag com o nome do jogador acima da cabeça
            this.escreverNameTag();
        }
    }

    update() { //atualiza as propriedades do jogador
        this.imagens.arma = carregaArma(this.arma, null);

        atualizaStatusArma(this);

        this.desenhar()
        this.position.y += this.velocidade.y
        this.position.x += this.velocidade.x

        if (!this.estaDandoDash) {
            this.velocidade.y += this.gravidadeBase; //acelera com a gravidade
        }

        if (this.position.y >= canvas.height + 100) {
            if (!jaExisteVencedor && !jaAlteradoRanking) {

                jaExisteVencedor = 1; jaAlteradoRanking = 1;
                let jogadorVencedor = this.numeroDoJogador == 0 ? 1 : 0

                //ACESSÓRIOS DO VENCEDOR
                // console.log("nome: " + arrayDosPlayers[jogadorVencedor].nome)
                // console.log("roupa: " + arrayDosPlayers[jogadorVencedor].roupa)
                // console.log("rosto: " + arrayDosPlayers[jogadorVencedor].rosto)
                // console.log("chapeu: " + arrayDosPlayers[jogadorVencedor].chapeu)
                // console.log("arma: " + jogadores[jogadorVencedor].arma)


                definirImagemVencedor(arrayDosPlayers, jogadorVencedor);
            }
        }

    }
}

// ANTES DE LIMITAR O FPS (FUNCIONA BEM EM 180HZ)
// class Jogador {
//     constructor({ x, y, orientacao, cor }) { //propriedades do jogador
//         this.position = {
//             x: x,
//             y: y
//         }
//         this.velocidade = {
//             x: 0,
//             y: 1
//         }

//         this.width = 50
//         this.height = 50

//         this.velocidadeBase = 4.5;
//         this.saltoBase = 6.5;
//         this.gravidadeBase = 0.08;
//         this.pisadaBase = 8;
//         this.dashBase = 7;
//         this.dashCooldown = 500; // tempo em ms
//         this.ataqueBase = 12;
//         this.alcanceBase = 45;

//         this.podePular = false;
//         this.podeDoubleJump = false;
//         this.podePisar = false;
//         this.podeDarDash = true;
//         this.podeAtacar = true;
//         this.soltaParticula = true;

//         this.orientacao = orientacao; //direita ou esquerda
//         this.estaDandoDash = false;
//         this.estaSendoAtacado = false;
//         this.estaDandoPisada = false;

//         this.debounce = false; //faz o jogador ter que soltar o W antes de dar um double jump
//         this.cor = cor;
//     }

//     desenhar() { //desenha o jogador na tela
//         c.fillStyle = this.cor
//         c.fillRect(this.position.x, this.position.y, this.width, this.height)
//     }

//     update() { //atualiza as propriedades do jogador
//         this.desenhar()
//         this.position.y += this.velocidade.y
//         this.position.x += this.velocidade.x

//         if (!this.estaDandoDash) {
//             this.velocidade.y += this.gravidadeBase; //acelera com a gravidade
//         }

//     }
// }

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
        // c.fillStyle = this.cor
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)
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

        // quadrado centralizado no ponto (x, y)
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
        if (this.alpha <= 0) this.alpha = 0;

    }


}

class Item {
    constructor({ x, y, width, height, velocidade, arma, orientacao, jogadorQueArremessou }) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocidade = velocidade;
        this.gravidade = 0.3;
        this.atrito = false;
        this.pegavel = false;
        this.arma = arma;
        this.orientacao = orientacao;
        this.bounciness = -0.2;
        this.cor = 'white';

        this.jogadorQueArremessou = jogadorQueArremessou;

        this.daDano = true;

        this.pisandoNoChao = [false, false, false]
        this.soltaParticulaNoChao = true;
        this.debounce = false;

        this.colisoes = true;
        this.deletar = false;

        this.imgArma = new Image()
        this.imgArma.src = '../imgs/arma-' + arma + '.png';

        // estado de rotação para armas que giram
        this.rodando = true
        this.rotacao = 0;

        // velocidade de rotação (radianos por frame) dependendo do tipo de arma
        if (arma == 'espada') this.rotacaoVel = 0.4;
        else if (arma == 'marreta') this.rotacaoVel = 0.3;
        else this.rotacaoVel = 0.4;
    }

    desenhar() {
        if ((this.arma != 'espada' && this.arma != 'marreta') || this.rodando == false || this.velocidade.x == 0) {
            if (this.orientacao == 'esquerda') {
                c.save();
                c.scale(-1, 1);
                c.drawImage(this.imgArma, -this.x - this.width, this.y, this.width, this.height);
                c.restore();
            } else {
                c.drawImage(this.imgArma, this.x, this.y, this.width, this.height);
            }
        } else if ((this.arma == 'espada' || this.arma == 'marreta') && this.rodando) {
            // girar a arma no sentido horário para a direita e anti-horário para a esquerda
            this.rotacao += this.rotacaoVel;

            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;

            c.save();
            // transladar para o centro da arma
            c.translate(cx, cy);
            // se estiver virado para a esquerda, espelha horizontalmente
            if (this.orientacao == 'esquerda') c.scale(-1, 1);
            // aplica rotação
            c.rotate(this.rotacao);
            // desenha a imagem centrada
            c.drawImage(this.imgArma, -this.width / 2, -this.height / 2, this.width, this.height);
            c.restore();
        }
    }

    update() {
        if (this.deletar) {
            spawnarArma();
            armas.splice(armas.indexOf(this), 1);
            
        }

        this.desenhar()
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

        this.velocidade.y += this.gravidade

        if(this.y >= canvas.height) {
            this.deletarArma();
        }
    }

    deletarArma() {
        setTimeout(() => {
            this.deletar = true;
        }, 1000);
    }
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

function carregaArma(arma, img) {
    let imgArma

    if (img == null) {
        imgArma = new Image()
        imgArma.src = '../imgs/arma-' + arma + '.png'
    } else imgArma = img

    // imgArma.onload = () => {
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
    }
    imgArma.width = larguraDaArma;
    imgArma.height = imgArma.width * (imgArma.naturalHeight / imgArma.naturalWidth);
    // }

    return imgArma
}

function atualizaStatusArma(jogador) {
    let arma = jogador.arma
    //console.log(arma);

    switch (arma) {
        case 'espada':
            jogador.ataqueCooldown = 600; //base é 400
            jogador.alcanceBase = 75;
            jogador.alcanceVerticalBase = 10;
            jogador.ataqueBase = 60; //  base é 30

            //mais lenta, maior alcance horizontal, maior alcance vertical, maior ataque
            break;
        case 'lanca':
            jogador.ataqueCooldown = 450; //base é 400
            jogador.alcanceBase = 105; // base é 35
            jogador.alcanceVerticalBase = -11;
            jogador.ataqueBase = 50; //  base é 30

            jogador.estocadaDuracao = 200;
            jogador.estocadaDistancia = 40;
            jogador.estocadaRecua = 5;

            //mais lenta, muito maior alcance horizontal, muito menor alcance vertical, menor ataque
            break;
        case 'luva':
            jogador.ataqueCooldown = 160; //diminui em 60%, base é 400
            jogador.alcanceBase = 65; //aumenta em 54%, base é 35
            jogador.alcanceVerticalBase = -4;
            jogador.ataqueBase = 50; //  base é 30

            jogador.estocadaDuracao = 100;
            jogador.estocadaDistancia = 16;

            //muito mais rápida, maior alcance horizontal, menor alcance vertical, muito menor ataque
            break;
        case 'marreta':
            jogador.ataqueCooldown = 1000; //aumenta em 100%, base é 400
            jogador.alcanceBase = 70; //aumenta em 77%, base é 35
            jogador.alcanceVerticalBase = 20;
            jogador.ataqueBase = 70; //  base é 30

            //muito mais lenta, maior alcance horizontal, maior alcance vertical, muito maior ataque
            break;
        default:
            jogador.ataqueCooldown = 500; //base é 400
            jogador.alcanceBase = 50;
            jogador.alcanceVerticalBase = 0;
            jogador.ataqueBase = 25; //  base é 30
            break;
    }


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
            default:
                break;
        }

        switch (arrayDosPlayers[j].roupa) {
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
            default:
                break;
        }
    }
}



//funçao que toca os sons
function tocarSom(som) {
    console.log(som)
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

    somSource.connect(somGain);            // passa pelo volume
    somGain.connect(audioContext.destination); // sai nas caixas

    somSource.start(0);
}


function pararLoop() {
    if (somSource) {
        somSource.stop(0);
        somSource = null;
    }
}

function droparItem(outroJogador) {
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
    if(armaAtual.arma == 'bomba') armaAtual.explode = true;

    //armaAtual.deletarArma();

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

function danoDeArremesso(outroJogador, arma) {
    if(outroJogador == arma.jogadorQueArremessou) { //nao deixa o jogador que arremessou a arma tomar dano dela
        // if (outroJogador.arma != 'vazio') {
        //     droparItem(outroJogador)
        // }

        // // pegando a arma
        // tocarSom("pickup")
        // outroJogador.arma = arma.arma;
        // armas.splice(armas.indexOf(arma), 1);

        return;
    }

    let jogadorAtacante = jogadores[0];
    if(outroJogador == jogadorAtacante) jogadorAtacante = jogadores[1];

    jogadorAtacante.boostDano += jogadorAtacante.ataqueBase * jogadorAtacante.acrescimoBoostDano;

    outroJogador.podeTomarArremesso = false

    tocarSom(arma.arma + "_" + randomInt(1, 3));
    //audios[0].pause();
    outroJogador.tomandoDano = true;
    outroJogador.estaDandoDash = true;
    if(arma.velocidade.x < 30 && arma.velocidade.x > -30) arma.velocidade.x *= 1.3;
    outroJogador.velocidade.x += arma.velocidade.x * 1.3; //altera a velocidade do jogador
    

    let danoDaArma = arma.velocidade.x;
    if(danoDaArma < 0) danoDaArma *= -1;

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

function spawnarArma() {
    tocarSom("spawn")

    let rand = randomInt(0, 3)
    console.log(rand);

    let arma = imagensArmas[rand]
    let imgArma = carregaArma(arma, imagensArmas[rand + 4])


    let posX = Math.random() * 1600
    if (posX > 1350) posX -= 250
    if (posX < 250) posX += 250

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
    //armaAtual.deletarArma();
    armaAtual.daDano = false;

    // setTimeout(() => {
    //     spawnarArma();
    // }, 20000); //nova arma a cada 20seg
}

function explodir(arma, raio) {
    let x = arma.x + arma.width/2
    let y = arma.y + arma.height/2

    jogadores.forEach(jogador => {
        console.log("ENTROU NA EXPLOSAO")
        if(jogador.position.x >= x - raio && jogador.position.x < x && jogador.position.y >= y - raio && jogador.position.y <= y + raio) {
            console.log("EXPLODIU")
            jogador.estaDandoDash = true;
            jogador.velocidade.x = -150;

            setTimeout(() => {
                jogador.estaDandoDash = false;
            }, 150);
            
        }
        if(jogador.position.x <= x + raio && jogador.position.x > x && jogador.position.y >= y - raio && jogador.position.y <= y + raio) {
            console.log("EXPLODIU")
            jogador.estaDandoDash = true;
            jogador.velocidade.x = 150;

            setTimeout(() => {
                jogador.estaDandoDash = false;
            }, 150);
            
        }
    })


    //som da explosao
    tocarSom("bomba_" + randomInt(1, 3));

    //particulas da explosao
    for(let i = 0; i < 50; i++) {
        particulas.push(
            new Particula({
                x: x,
                y: y,
                raio: Math.random() * 2 + 3,
                cor: 'red',
                velocidade: {
                    x: (Math.random() - 0.5) * 25,
                    y: (Math.random() - 0.5) * 20,
                }
            })
        )
    }
    for(let i = 0; i < 40; i++) {
        particulas.push(
            new Particula({
                x: x,
                y: y,
                raio: Math.random() * 2 + 2,
                cor: 'orange',
                velocidade: {
                    x: (Math.random() - 0.5) * 15,
                    y: (Math.random() - 0.5) * 10,
                }
            })
        )
    }
    for(let i = 0; i < 30; i++) {
        particulas.push(
            new Particula({
                x: x,
                y: y,
                raio: Math.random() * 2 + 1,
                cor: 'yellow',
                velocidade: {
                    x: (Math.random() - 0.5) * 5,
                    y: (Math.random() - 0.5) * 5,
                }
            })
        )
    }

    armas.splice(armas.indexOf(arma), 1);
}

//puxando imagens
//plataformas e fundo
const imgPlataformaCentral = new Image()
imgPlataformaCentral.src = '../imgs/plataforma-' + mapaSelecionado + '-principal.jpg'
imgPlataformaCentral.width = 800; //tamanho padronizado

const imgPlataformaDireita = new Image()
imgPlataformaDireita.src = '../imgs/plataforma-' + mapaSelecionado + '-direita.jpg'

imgPlataformaDireita.width = 375; //tamanho padronizado
imgPlataformaDireita.height = 90; //tamanho padronizado

const imgPlataformaEsquerda = new Image()
imgPlataformaEsquerda.src = '../imgs/plataforma-' + mapaSelecionado + '-esquerda.jpg'
imgPlataformaEsquerda.width = 375; //tamanho padronizado
imgPlataformaEsquerda.height = 90; //tamanho padronizado

const imgFundo = new Image()
imgFundo.src = '../imgs/fundo-' + mapaSelecionado + '.jpg'


//acessorios
//rostos
const imgRosto1 = new Image()
imgRosto1.src = '../imgs/cara-' + player1.rosto + '.png'

const imgRosto2 = new Image()
imgRosto2.src = '../imgs/cara-' + player2.rosto + '.png'

//chapeus
const imgChapeu1 = new Image()
imgChapeu1.src = '../imgs/chapeu-' + player1.chapeu + '.png'
imgChapeu1.onload = () => {
    imgChapeu1.width = 58;
    imgChapeu1.height = imgChapeu1.width * (imgChapeu1.naturalHeight / imgChapeu1.naturalWidth);
}

const imgChapeu2 = new Image()
imgChapeu2.src = '../imgs/chapeu-' + player2.chapeu + '.png'
imgChapeu2.onload = () => {
    imgChapeu2.width = 58;
    imgChapeu2.height = imgChapeu2.width * (imgChapeu2.naturalHeight / imgChapeu2.naturalWidth);
}

//roupas
const imgRoupa1 = new Image()
imgRoupa1.src = '../imgs/roupa-' + player1.roupa + '.png'
imgRoupa1.onload = () => {
    imgRoupa1.width = 54;
    imgRoupa1.height = imgRoupa1.width * (imgRoupa1.naturalHeight / imgRoupa1.naturalWidth);
}

const imgRoupa2 = new Image()
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

//carregando som ambiente
carregarSomAmbiente('../efeitos_sonoros/arena_' + mapaSelecionado + '.wav');


//criando arrays
let audios = [];
let armas = [];
let arrayDosPlayers = [player1, player2];
let plataformas = [];
let particulas = [];
let imagensArmas = ['lanca', 'marreta', 'espada', 'luva', imgArma1, imgArma2, imgArma3, imgArma4];

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

const jogadores = [new Jogador({
    x: canvas.width / 4,
    y: 100,
    orientacao: 'direita',
    cor: 'white',
    arma: player1.arma,
    imagens: {
        rosto: imgRosto1,
        roupa: imgRoupa1,
        chapeu: imgChapeu1,
        //arma: carregaArma(player1.arma)
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
        //arma: carregaArma(player2.arma)
    },
    jogador: player2,
    numero: 1,
})];


//criação das plataformas
imgPlataformaCentral.onload = () => { //espera a plataforma central carregar, depois cria ela
    plataformas.push(new Plataforma({
        x: (canvas.width / 2 - imgPlataformaCentral.width / 2) /*plataforma no centro*/, y: 650, width: imgPlataformaCentral.width, height: imgPlataformaCentral.height+35, cor: 'blue', image: imgPlataformaCentral, colisoes: true,
    }))
}

imgPlataformaDireita.onload = () => { //espera a plataforma da direita carregar, depois cria ela
    plataformas.push(new Plataforma({
        x: (3 * canvas.width / 4 - imgPlataformaDireita.width / 2) /*plataforma no centro*/, y: 450, width: imgPlataformaDireita.width, height: imgPlataformaDireita.height, cor: 'blue', image: imgPlataformaDireita, colisoes: false
    }))
}

imgPlataformaEsquerda.onload = () => { //espera a plataforma da esquerda carregar, depois cria ela
    plataformas.push(new Plataforma({
        x: (canvas.width / 4 - imgPlataformaEsquerda.width / 2) /*plataforma no centro*/, y: 450, width: imgPlataformaEsquerda.width, height: imgPlataformaEsquerda.height, cor: 'blue', image: imgPlataformaEsquerda, colisoes: false
    }))
}



//fixando o fps em 60
let fps = 60;
let intervaloFrame = 1000 / fps; // ~16.67ms
let ultimoFrame = 0;


//boosts de acessórios
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

    // c.fillStyle = 'black';
    c.drawImage(imgFundo, 0, 0, canvas.width, canvas.height)
    // c.fillRect(0, 0, canvas.width, canvas.height);

    // desenha plataformas primeiro (fundo do nível)
    plataformas.forEach(plataforma => {
        plataforma.desenhar() //atualiza as plataformas
    })

    // depois desenha particulas (assim elas ficam atrás dos jogadores)
    particulas.forEach(particula => {
        particula.update()
    })

    // limpar partículas mortas para não acumular
    for (let i = particulas.length - 1; i >= 0; i--) {
        if (particulas[i].alpha <= 0) particulas.splice(i, 1);
    }

    // por fim desenha/atualiza jogadores (ficam acima das partículas)
    jogadores.forEach(jogador => {
        jogador.update(); //atualiza o jogador
    })


    armas.forEach(arma => {
        arma.update();
    })

    //movimento dos jogadores
    for (let i = 0; i < 2; i++) { //i assume 0 e 1 (só podem ter 2 jogadores)
        let outroJogador = jogadores[1]; //definindo o outro jogador
        if (outroJogador == jogadores[i]) outroJogador = jogadores[0];

        //movimentos horizontais
        //movimento pra direita
        if (teclas[i].direita.pressionada && !teclas[i].esquerda.pressionada) {
            if ((jogadores[i].estaDandoDash && jogadores[i].orientacao == 'esquerda') || !jogadores[i].estaDandoDash) { // verificação se o jogador está dando dash
                if (!jogadores[i].estaSendoAtacado) { // verificação se o jogador está sendo atacado
                    jogadores[i].velocidade.x = jogadores[i].velocidadeBase; //velocidade para a direita
                }

                jogadores[i].seMoveu = true;
                jogadores[i].orientacao = 'direita';
            }
            //movimento pra esquerda
        } else if (teclas[i].esquerda.pressionada && !teclas[i].direita.pressionada) {
            if ((jogadores[i].estaDandoDash && jogadores[i].orientacao == 'direita') || !jogadores[i].estaDandoDash) { // verificação se o jogador está dando dash
                if (!jogadores[i].estaSendoAtacado) { // verificação se o jogador está sendo atacado
                    jogadores[i].velocidade.x = -jogadores[i].velocidadeBase; //velocidade para a esquerda
                }

                jogadores[i].seMoveu = true;
                jogadores[i].orientacao = 'esquerda';
            }

        } else if (!jogadores[i].estaDandoDash && !jogadores[i].estaSendoAtacado) {
            jogadores[i].velocidade.x = 0;
        }

        if (teclas[i].direita.pressionada && teclas[i].esquerda.pressionada) { //caso o jogador aperte esquerda e direita ao mesmo tempo
            if (!jogadores[i].estaDandoDash && !jogadores[i].estaSendoAtacado) {
                jogadores[i].velocidade.x = 0;
            }
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

            console.log(jogadores[i].position.x)


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

            jogadores[i].podeDoubleJump = false;

            jogadores[i].podePisar = false; //gasta a pisada
            jogadores[i].estaDandoPisada = true;
        }

        //solta partícula enquanto o jogador estiver dando uma pisada
        if (jogadores[i].estaDandoPisada && jogadores[i].soltaParticula) {
            jogadores[i].soltaParticula = false;

            let posX = jogadores[i].position.x + jogadores[i].width / 2 + ((Math.random() - 0.5) * 30);
            let posY = jogadores[i].position.y + jogadores[i].height;

            let velocidadeX = (Math.random() - 0.5);
            let velocidadeY = (Math.random() * -1);

            if (velocidadeX > 0 && jogadores[i].velocidade.x > 0) {
                velocidadeX *= -1;
            } else if (velocidadeX < 0 && jogadores[i].velocidade.x < 0) velocidadeX *= -1;

            soltarParticulas(posX, posY, velocidadeX, velocidadeY, jogadores[i])

            setTimeout(() => {
                jogadores[i].soltaParticula = true;
            }, 10);

        }

        //dash
        if (teclas[i].dash.pressionada && jogadores[i].podeDarDash) {
            console.log("teste teste")

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
            teclas[i].dash.pressionada = false;
            jogadores[i].soltaParticula = true;
            jogadores[i].estaDandoPisada = false;

            // duração da animação do dash
            setTimeout(() => {
                jogadores[i].estaDandoDash = false;
            }, 120); //tempo da animaçao 120ms

            //cooldown do dash
            setTimeout(() => {
                jogadores[i].podeDarDash = true;
            }, jogadores[i].dashCooldown);

            // particulas do dash
            for (let j = 0; j < 1; j++) {
                let posX = jogadores[i].position.x + jogadores[i].width / 2;
                let posY = jogadores[i].position.y + jogadores[i].height + ((Math.random() - 0.5) * 30);

                let velocidadeX = (Math.random() - 0.5) * 6;
                let velocidadeY = (Math.random() - 0.5);

                if (velocidadeX > 0 && jogadores[i].velocidade.x > 0) {
                    velocidadeX *= -1;
                } else if (velocidadeX < 0 && jogadores[i].velocidade.x < 0) velocidadeX *= -1;

                particulas.push(
                    new Particula({
                        x: posX,
                        y: posY,
                        raio: Math.random() * 2 + 1,
                        cor: jogadores[i].cor,
                        velocidade: {
                            x: velocidadeX,
                            y: velocidadeY,
                        }
                    })
                )
            }
        }

        //solta partícula enquanto o jogador estiver dando dash
        if (jogadores[i].estaDandoDash) { //&& jogadores[i].soltaParticula) {
            // jogadores[i].soltaParticula = false;

            let posX = jogadores[i].position.x + jogadores[i].width / 2;
            let posY = jogadores[i].position.y + jogadores[i].height + ((Math.random() - 0.5) * 30);

            let velocidadeX = (Math.random() - 0.5);
            let velocidadeY = (Math.random() - 0.5);

            if (velocidadeX > 0 && jogadores[i].velocidade.x > 0) {
                velocidadeX *= -1;
            } else if (velocidadeX < 0 && jogadores[i].velocidade.x < 0) velocidadeX *= -1;

            soltarParticulas(posX, posY, velocidadeX, velocidadeY, jogadores[i])

            // setTimeout(() => {
            //     jogadores[i].soltaParticula = true;
            // }, 1);

        }

        //ataque
        if (teclas[i].ataque.pressionada && jogadores[i].podeAtacar) { //dispara a animação de ataque sempre que apertar (com cooldown)
            console.log("tentou atacar")

            //som de swing
            let random = randomInt(1, 3)
            console.log(random)
            tocarSom("miss_" + random);

            teclas[i].ataque.pressionada = false;
            jogadores[i].podeAtacar = false;

            if (jogadores[i].arma == 'espada' || jogadores[i].arma == 'marreta') jogadores[i].iniciarAtaque();
            else jogadores[i].iniciarEstocada();

            // cooldown do ataque (impede spam)
            setTimeout(() => {
                jogadores[i].podeAtacar = true;
            }, jogadores[i].ataqueCooldown);

            // verifica se acertou outro jogador (mesma lógica anterior)
            let orientacaoAtaque = jogadores[i].orientacao == 'direita' ? 1 : -1; //definindo a orientação do ataque

            let ataqueValido = false;

            if (outroJogador.position.y + outroJogador.height >= jogadores[i].position.y - jogadores[i].alcanceVerticalBase && outroJogador.position.y <= jogadores[i].position.y + jogadores[i].height + jogadores[i].alcanceVerticalBase) {//condição de proximidade para o ataque (jogadores alinhados verticalmente)
                //verificando se o ataque para a DIREITA é válido
                if (jogadores[i].orientacao == 'direita' && outroJogador.position.x <= jogadores[i].position.x + jogadores[i].width + jogadores[i].alcanceBase && outroJogador.position.x >= jogadores[i].position.x) { //condição de proximidade horizontal (alcance pode ser ajustado)
                    ataqueValido = true;
                }
                //verificando se o ataque para a ESQUERDA é válido
                if (jogadores[i].orientacao == 'esquerda' && outroJogador.position.x + outroJogador.width >= jogadores[i].position.x - jogadores[i].alcanceBase && outroJogador.position.x + outroJogador.width <= jogadores[i].position.x + jogadores[i].width) { //condição de proximidade horizontal (alcance pode ser ajustado)
                    ataqueValido = true;
                }


                if (ataqueValido) { //efeitos do ataque
                    if(jogadores[i].arma == 'bomba' || outroJogador.arma == 'bomba') {
                        let x = jogadores[i].position.x;
                        jogadores[i].position.x += orientacaoAtaque * -100; 

                        explodir({
                            x: x,
                            y: jogadores[i].position.y,
                            width: jogadores[i].width,
                            height: jogadores[i].height,
                        }, 200)

                        if(jogadores[i].arma == 'bomba') jogadores[i].arma = 'vazio';
                        if(outroJogador.arma == 'bomba') outroJogador.arma = 'vazio';
                        
                    } else {
                        //som de ataque
                        tocarSom(jogadores[i].arma + "_" + randomInt(1, 3));

                        outroJogador.tomandoDano = true;
                        outroJogador.estaSendoAtacado = true;
                        outroJogador.velocidade.x = orientacaoAtaque * (jogadores[i].ataqueBase + jogadores[i].boostDano); //o quanto o oponente é arremessado (e em qual direção)

                        outroJogador.danoRecebido += (jogadores[i].ataqueBase + jogadores[i].boostDano) //registra o dano causado do jogador

                        jogadores[i].boostDano += jogadores[i].ataqueBase * jogadores[i].acrescimoBoostDano; //aumenta o knockback a cada hit em 10%

                        //duração da animação de ser atacado
                        setTimeout(() => {
                            outroJogador.estaSendoAtacado = false;
                        }, 170);
                    }

                    
                }
            }

            //rebater armas no ar
            armas.forEach(arma => {
                if ((arma.velocidade.x >= 1 || arma.velocidade.x <= -1) && arma.y + arma.height >= jogadores[i].position.y - jogadores[i].alcanceVerticalBase && arma.y <= jogadores[i].position.y + jogadores[i].height + jogadores[i].alcanceVerticalBase) {
                    if (jogadores[i].orientacao == 'direita' && arma.x <= jogadores[i].position.x + jogadores[i].width + jogadores[i].alcanceBase && arma.x >= jogadores[i].position.x) {
                        //ataque pra direita
                        arma.velocidade.x *= -1;
                        arma.velocidade.y = -4;
                    }
                    if (jogadores[i].orientacao == 'esquerda' && arma.x + arma.width >= jogadores[i].position.x - jogadores[i].alcanceBase && arma.x + arma.width <= jogadores[i].position.x + jogadores[i].width) {
                        //ataque pra esquerda
                        arma.velocidade.x *= -1;
                        arma.velocidade.y = -4;
                    }
                }
            })
        }

        //arremesso
        if (teclas[i].arremesso.pressionada && jogadores[i].arma != "vazio" && jogadores[i].podeArremessar) {


            // tocarSom("arremesso_da_espada")
            tocarSom("throw_" + randomInt(1, 4))

            let imgX = jogadores[i].position.x + 6 * jogadores[i].width / 8;
            let imgY = jogadores[i].position.y + 7 * jogadores[i].height / 8 - jogadores[i].imagens.arma.height;

            if (jogadores[i].orientacao == 'esquerda') {
                // use the mirror spawn X that matches how the player draws the flipped weapon
                imgX = jogadores[i].position.x - 6 * jogadores[i].width / 8;

            }

            let velocidadeDoArremesso = 26;

            // a lança é mais rápida no arremesso
            if (jogadores[i].arma == 'lanca') {
                velocidadeDoArremesso = 40;
            }

            //equaçoes de mov. variado
            let dx = Math.abs((outroJogador.position.x) - (jogadores[i].position.x));
            let dy = Math.abs(outroJogador.position.y - jogadores[i].position.y);
            let dh = Math.sqrt(dx**2 + dy**2);

            let sin = dy/dh;
            let cos = dx/dh;

            // let v = Math.sqrt((dx * 1.3)/(sin*cos));
            // let v = (dx * 1.3)/(sin*50);

            let vx = 45 + Math.abs(jogadores[i].velocidade.x) + jogadores[i].boostDano/2; //velocidade base
            if(dx < 210) vx = 25; //ajustes pra caso os jogadores estejam muito perto
            if(dx < 150) vx = 15;
            // if(dx < 90) vx = 1;
        
            let v = vx/cos;
            if(dx < 90) v *= 4;

            let vy = v * sin;
            
            if(vy > 90) vy = 90;

            if((jogadores[i].orientacao == 'direita' && outroJogador.position.x < jogadores[i].position.x) || (jogadores[i].orientacao == 'esquerda' && outroJogador.position.x > jogadores[i].position.x)) {
                vx = 40;
                vy = 0;
            }


            armas.push(new Item({
                x: imgX,
                y: imgY,
                width: jogadores[i].imagens.arma.width,
                height: jogadores[i].imagens.arma.height,
                velocidade: {
                    x: jogadores[i].orientacao == 'direita' ? vx : -vx,
                    y: outroJogador.position.y > jogadores[i].position.y ? vy : -vy-3, //-3 é um offset pra compensar o fato de que a posição da qual a arma é arremessada não é igual ao centro da arma
                },
                arma: jogadores[i].arma,
                orientacao: jogadores[i].orientacao,
                jogadorQueArremessou: jogadores[i],
            }))

            let armaAtual = armas.at(-1)
            armaAtual.daDano = false;

            setTimeout(() => {
                armaAtual.daDano = true;
            }, 50);


            if(armaAtual.arma == 'bomba') {
                setTimeout(() => {
                    armaAtual.explode = true;
                }, 0);
            }
            //armaAtual.deletarArma();

            //a lança "quica" menos
            if (armaAtual.arma == 'lanca') {
                armaAtual.bounciness = -0.205;
            }

            jogadores[i].arma = 'vazio';
            jogadores[i].podeArremessar = false

            setTimeout(() => {
                jogadores[i].podeArremessar = true;
            }, 500);
        }
    }

    //colisões de arma no chão
    plataformas.forEach(plataforma => {
        armas.forEach(arma => {
            //verifica se o item tá no chao pra soltar particulas e emitir som
            arma.soltaParticulaNoChao = true;
            arma.pisandoNoChao.forEach(el => {
                if (el) arma.soltaParticulaNoChao = false;
            })

            if (arma.y + arma.height <= plataforma.position.y && arma.y + arma.height + arma.velocidade.y >= plataforma.position.y && arma.x + arma.width > plataforma.position.x && arma.x < plataforma.position.x + plataforma.width) {

                if(arma.arma == 'bomba' && arma.explode) {
                    explodir(arma, 200);    
                }

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
            } else {
                arma.pisandoNoChao[plataformas.indexOf(plataforma)] = false;
            }
        })
    })




    //colisões (jogador-jogador e jogador-plataforma)
    jogadores.forEach(jogador => {
        let outroJogador = jogadores[1];
        if (outroJogador == jogador) outroJogador = jogadores[0];

        //verifica se o jogador tá pisando no chao pra soltar particulas e emitir som
        jogador.soltaParticulaNoChao = true;
        jogador.pisandoNoChao.forEach(el => {
            if (el) jogador.soltaParticulaNoChao = false;
        })

        jogador.podePular = false; //impede que o jogador pule no ar

        //colisões de arma com jogadores
        armas.forEach(arma => {
            if (arma.colisoes) {

                //horizontal
                if (arma.y + arma.height >= outroJogador.position.y && arma.y <= outroJogador.position.y + outroJogador.height && ((arma.x + arma.width <= outroJogador.position.x && arma.x + arma.width + arma.velocidade.x >= outroJogador.position.x + outroJogador.velocidade.x))) {
                    if(arma.arma == 'bomba' && arma.explode) {
                        explodir(arma, 200);    
                    }
                    else {
                    
                        //console.log('cu1')
                        if (arma.pegavel) {
                            console.log("pegou")

                            //arremessando a arma antiga
                            if (outroJogador.arma != 'vazio') {
                                droparItem(outroJogador)
                            }

                            // pegando a arma
                            tocarSom("pickup")
                            outroJogador.arma = arma.arma;
                            armas.splice(armas.indexOf(arma), 1);

                        } else if (outroJogador.podeTomarArremesso && arma.daDano) {
                            danoDeArremesso(outroJogador, arma)
                        }
                    }

                } else if ((arma.y + arma.height >= outroJogador.position.y && arma.y <= outroJogador.position.y + outroJogador.height && arma.x >= outroJogador.position.x + outroJogador.width && arma.x + arma.velocidade.x <= outroJogador.position.x + outroJogador.width + outroJogador.velocidade.x)) {

                    if(arma.arma == 'bomba' && arma.explode) {
                        explodir(arma, 200);    
                    }
                    else {

                        //console.log('cu1')
                        if (arma.pegavel) {
                            //arremessando a arma antiga
                            if (outroJogador.arma != 'vazio') {
                                droparItem(outroJogador)
                            }

                            tocarSom("pickup")
                            outroJogador.arma = arma.arma;
                            armas.splice(armas.indexOf(arma), 1);
                        } else if (outroJogador.podeTomarArremesso && arma.daDano) {
                            danoDeArremesso(outroJogador, arma)
                        }
                    }

                } else if (arma.x >= outroJogador.position.x && arma.x < outroJogador.position.x + outroJogador.width / 2 && arma.y + arma.height >= outroJogador.position.y && arma.y <= outroJogador.position.y + outroJogador.height) {
                    if(arma.arma == 'bomba' && arma.explode) {
                        explodir(arma, 200);    
                    }
                    else {
                        console.log("PEGAGFOAGPO")
                        if (arma.pegavel) {
                            //arremessando a arma antiga
                            if (outroJogador.arma != 'vazio') {
                                droparItem(outroJogador)
                            }

                            //pegando arma
                            tocarSom("pickup")
                            outroJogador.arma = arma.arma;
                            armas.splice(armas.indexOf(arma), 1);
                        }

                        if (arma.daDano) {
                            arma.x = outroJogador.position.x - arma.width;

                            danoDeArremesso(outroJogador, arma)
                        }
                    }
                }


                //vertical (cima pra baixo)
                if (arma.x + arma.width >= outroJogador.position.x && arma.x <= outroJogador.position.x + outroJogador.width && arma.y + arma.height >= outroJogador.position.y && arma.y <= outroJogador.position.y + outroJogador.height) {
                    if(arma.arma == 'bomba' && arma.explode) {
                        explodir(arma, 200);    
                    }
                    else {
                        if (arma.daDano) {
                            arma.x = outroJogador.position.x - arma.width;

                            danoDeArremesso(outroJogador, arma)
                        }

                        if (arma.pegavel) {
                            if(arma.arma == 'bomba') {
                                explodir(arma, 200);    
                            }
                            //arremessando a arma antiga
                            if (outroJogador.arma != 'vazio') {
                                droparItem(outroJogador)
                            }

                            //pegando arma
                            tocarSom("pickup")
                            outroJogador.arma = arma.arma;
                            armas.splice(armas.indexOf(arma), 1);
                        }

                    }
                }


                if (arma.y + arma.height <= outroJogador.position.y + outroJogador.velocidade.y && arma.y + arma.height + arma.velocidade.y >= outroJogador.position.y + outroJogador.velocidade.y && arma.x + arma.width > outroJogador.position.x && arma.x < outroJogador.position.x + outroJogador.width) {
                    
                    if(arma.arma == 'bomba' && arma.explode) {
                        explodir(arma, 200);    
                    }
                    else {

                        console.log("teste porra")
                        if (arma.daDano) {
                            arma.x = outroJogador.position.x - arma.width;

                            danoDeArremesso(outroJogador, arma)
                        }

                        if (arma.pegavel) {
                            if(arma.arma == 'bomba') {
                                explodir(arma, 200);    
                            }

                            //arremessando a arma antiga
                            if (outroJogador.arma != 'vazio') {
                                droparItem(outroJogador)
                            }

                            tocarSom("pickup")
                            outroJogador.arma = arma.arma;
                            armas.splice(armas.indexOf(arma), 1);
                        }
                    }
                } else if (arma.y + arma.height <= outroJogador.position.y + outroJogador.velocidade.y && arma.y + arma.height + arma.velocidade.y >= outroJogador.position.y + outroJogador.velocidade.y && arma.x < outroJogador.position.x + outroJogador.width && arma.x > outroJogador.position.x) {
                    
                    if(arma.arma == 'bomba' && arma.explode) {
                        explodir(arma, 200);    
                    }
                    else {
                        if (arma.daDano) {
                            arma.x = outroJogador.position.x - arma.width;

                            danoDeArremesso(outroJogador, arma)
                        }
                        
                        if (arma.pegavel) {
                            if(arma.arma == 'bomba') {
                                explodir(arma, 200);    
                            }

                            //arremessando a arma antiga
                            if (outroJogador.arma != 'vazio') {
                                droparItem(outroJogador)
                            }

                            tocarSom("pickup")
                            outroJogador.arma = arma.arma;
                            armas.splice(armas.indexOf(arma), 1);
                        }
                    }
                }
            }
        })

        //colisões jogador-plataforma
        plataformas.forEach(plataforma => {
            // colisão com plataformas na vertical para baixo
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

            // fix caso entre dentro da plataforma com outro jogador em cima
            if (jogador.position.y + jogador.height > plataforma.position.y && jogador.position.y < plataforma.position.y + plataforma.height && jogador.position.x + jogador.width > plataforma.position.x && jogador.position.x < plataforma.position.x + plataforma.width && outroJogador.position.x + outroJogador.width >= jogador.position.x && outroJogador.position.x <= jogador.position.x + jogador.width && outroJogador.position.y + outroJogador.height >= jogador.position.y - 4 && jogador.position.y > outroJogador.position.y + outroJogador.height) {
                outroJogador.position.y = plataforma.position.y - jogador.height - outroJogador.height;
                jogador.position.y = plataforma.position.y - jogador.height;

                outroJogador.velocidade.y = 0;
                jogador.velocidade.y = 0;

                // jogador.position.y = plataforma.position.y - jogador.height;
                // jogador.velocidade.y = 0;

                // if (outroJogador.position.y + outroJogador.height > jogador.position.y && outroJogador.position.y < jogador.position.y + jogador.height) {
                //     jogador.position.x = outroJogador.position.x + outroJogador.width;
                //     outroJogador.velocidade.y -= 1;
                // }
            }

            if (plataforma.colisoes) {
                // colisão com plataformas na vertical para cima (também cuida de casos em que o jogador entra dentro da plataforma)
                if (((jogador.position.y >= plataforma.position.y + plataforma.height && jogador.position.y + jogador.velocidade.y <= plataforma.position.y + plataforma.height) || (jogador.position.y <= plataforma.position.y + plataforma.height && jogador.position.y > plataforma.position.y)) && jogador.position.x + jogador.width > plataforma.position.x && jogador.position.x < plataforma.position.x + plataforma.width) {
                    jogador.position.y = plataforma.position.y + plataforma.height;
                    jogador.velocidade.y = 0.1;

                    jogador.podePular = false; // impede que o jogador pule (pois há uma plataforma acima)
                }

                if (jogador.encostandoEmParede && jogador.seMoveu) { //fix pra bug em que um jogador entra dentro do outro quando estao encostados em uma parede e andando
                    jogador.encostandoEmParede = false;
                }

                // colisão com plataformas na horizontal esquerda para direita
                if (jogador.position.y + jogador.height >= plataforma.position.y && jogador.position.y <= plataforma.position.y + plataforma.height && jogador.position.x + jogador.width <= plataforma.position.x && jogador.position.x + jogador.width + jogador.velocidade.x >= plataforma.position.x) {
                    if (jogador.position.x + jogador.width < plataforma.position.x) {
                        jogador.position.x = plataforma.position.x - jogador.width;
                    }

                    jogador.encostandoEmParede = true; //fix pra bug em que um jogador entra dentro do outro quando estao encostados em uma parede e andando
                    jogador.seMoveu = false; //fix pra bug em que um jogador entra dentro do outro quando estao encostados em uma parede e andando
                    jogador.velocidade.x = 0;
                }

                // colisão com plataformas na horizontal direita para esquerda
                if (jogador.position.y + jogador.height >= plataforma.position.y && jogador.position.y <= plataforma.position.y + plataforma.height && jogador.position.x >= plataforma.position.x + plataforma.width && jogador.position.x + jogador.velocidade.x <= plataforma.position.x + plataforma.width) {
                    if (jogador.position.x > plataforma.position.x + plataforma.width) {
                        jogador.position.x = plataforma.position.x + plataforma.width;
                    }

                    console.log("COLISAO")

                    jogador.encostandoEmParede = true;
                    jogador.seMoveu = false;
                    jogador.velocidade.x = 0;
                }
            }
        })


        //colisões jogador-jogador

        // players na vertical pra baixo
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
                //console.log("entrou aqui")
            }
        }

        // players na vertical para cima (também cuida de casos em que o jogador entra dentro do outro)
        // if (((jogador.position.y >= outroJogador.position.y + outroJogador.height && jogador.position.y + jogador.velocidade.y <= outroJogador.position.y + outroJogador.height) || (jogador.position.y <= outroJogador.position.y + outroJogador.height && jogador.position.y > outroJogador.position.y)) && jogador.position.x + jogador.width > outroJogador.position.x && jogador.position.x < outroJogador.position.x + outroJogador.width) {
        //     jogador.position.y = outroJogador.position.y + outroJogador.height;
        //     jogador.velocidade.y = 0;

        //      console.log("TESTE")   
        // }

        // detectando se há um jogador acima do outro
        if (outroJogador.position.y + outroJogador.height >= jogador.position.y - 0.3 && outroJogador.position.y + outroJogador.height < jogador.position.y + 0.3 && jogador.position.x + jogador.width >= outroJogador.position.x && jogador.position.x <= outroJogador.position.x + outroJogador.width) { //0.3 é uma margem de segurança
            jogador.podePular = false; // impede que o jogador pule (pois há outro jogador em cima)
        }

        // players na horizontal esquerda para direita
        if (jogador.position.y + jogador.height >= outroJogador.position.y && jogador.position.y <= outroJogador.position.y + outroJogador.height && jogador.position.x + jogador.width <= outroJogador.position.x && jogador.position.x + jogador.width + jogador.velocidade.x >= outroJogador.position.x + outroJogador.velocidade.x) {
            //colisão
            if (jogador.position.x + jogador.width < outroJogador.position.x && jogador.velocidade.x != 0) {
                jogador.position.x = outroJogador.position.x - jogador.width;
            }

            jogador.velocidade.x = 0;

            if (!outroJogador.encostandoEmParede) outroJogador.velocidade.x += 1;

            if (jogador.estaDandoDash) { //impacto no dash joga o outro jogador pra frente
                outroJogador.estaDandoDash = true;

                outroJogador.velocidade.x += jogador.dashBase / 2; //outro jogador ganha metade da velocidade do jogador que bateu nele

                setTimeout(() => {
                    outroJogador.estaDandoDash = false;
                }, 100); //tempo da animação 100ms

                //jogador que bateu é arremessado pra trás
                jogador.estaDandoDash = true;
                jogador.velocidade.x = -3;

                setTimeout(() => {
                    jogador.estaDandoDash = false;
                }, 30); //tempo da animação 100ms
            }
        }

        // if(jogador.position.y + jogador.height >= outroJogador.position.y && jogador.position.y <= outroJogador.position.y + outroJogador.height  &&  jogador.position.x + jogador.width <= outroJogador.position.x  &&  jogador.position.x + jogador.width + jogador.velocidade.x >= outroJogador.position.x + outroJogador.velocidade.x) {
        //   console.log('DESGRAÇA');
        //   outroJogador.velocidade.x = 0;
        //   outroJogador.position.x = jogador.position.x + jogador.width;
        // }

        // if(jogador.position.y + jogador.height >= outroJogador.position.y && jogador.position.y <= outroJogador.position.y + outroJogador.height  &&  jogador.position.x >= outroJogador.position.x + outroJogador.width  &&  jogador.position.x + jogador.velocidade.x <= outroJogador.position.x + outroJogador.width + outroJogador.velocidade.x) {
        //   console.log('DESGRAÇA 2');
        //   outroJogador.velocidade.x = 0;
        //   outroJogador.position.x = jogador.position.x - jogador.width;
        // }

        // players na horizontal direita para esquerda
        if (jogador.position.y + jogador.height >= outroJogador.position.y && jogador.position.y <= outroJogador.position.y + outroJogador.height && jogador.position.x >= outroJogador.position.x + outroJogador.width && jogador.position.x + jogador.velocidade.x <= outroJogador.position.x + outroJogador.width + outroJogador.velocidade.x) {


            //colisão
            if (jogador.position.x > outroJogador.position.x + outroJogador.width && jogador.velocidade.x != 0) {
                jogador.position.x = outroJogador.position.x + outroJogador.width;
            }

            jogador.velocidade.x = 0;
            if (!outroJogador.encostandoEmParede) outroJogador.velocidade.x -= 1;

            if (jogador.estaDandoDash) { //impacto no dash joga o outro jogador pra frente
                outroJogador.estaDandoDash = true;

                outroJogador.velocidade.x -= jogador.dashBase / 2; //outro jogador ganha metade da velocidade do jogador que bateu nele

                setTimeout(() => {
                    outroJogador.estaDandoDash = false;
                }, 100); //tempo da animação 100ms

                //jogador que bateu é arremessado pra trás
                jogador.estaDandoDash = true;
                jogador.velocidade.x = 3;

                setTimeout(() => {
                    jogador.estaDandoDash = false;
                }, 30); //tempo da animação 100ms
            }
        }
    })
}

// tocarLoop();
if (audioContext.state == "suspended") {
    audioContext.resume();
}
tocarLoop();



/////////
animar(0); //inicia o jogo
/////////


if(jogadores[0].arma == 'vazio') {
    setTimeout(() => {
        spawnarArma();
    }, 3000);
}


if(jogadores[1].arma == 'vazio') {
    setTimeout(() => {

        spawnarArma();
    }, 8000);
}


//easter egg da bomba
cheet('↑ ↑ ↓ ↓ ← → ← →', () => {
    jogadores[1].arma = 'bomba';
});
cheet('w w s s a d a d', () => {
    jogadores[0].arma = 'bomba';
});



//spawna a primeira arma
// setTimeout(() => {
//     spawnarArma();
// }, 20000);


//detecção das teclas

let teclasPlayer1 = JSON.parse(localStorage.getItem("teclasPlayer1"));
let teclasPlayer2 = JSON.parse(localStorage.getItem("teclasPlayer2"));

// const teclasPlayer1 = {
//     //no lugar das strings, vai ter o code da tecla
//     cima: 'KeyW',
//     baixo: 'KeyS',
//     direita: 'KeyD',
//     esquerda: 'KeyA',
//     ataque: 'KeyG',
//     dash: 'KeyH',
//     arremesso: 'KeyJ',
// };

// const teclasPlayer2 = {
//     cima: 'ArrowUp',
//     baixo: 'ArrowDown',
//     direita: 'ArrowRight',
//     esquerda: 'ArrowLeft',
//     ataque: 'Numpad1',
//     dash: 'Numpad2',
//     arremesso: 'Numpad3',
// };

window.addEventListener('keydown', ({ code }) => {
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
});


window.addEventListener('keyup', ({ code }) => { //quando soltar a tecla
    // console.log(code);

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

//DEFINIR VENCEDOR

function definirImagemVencedor(array, vencedor) {
    // pausa o jogo
    jogoRodando = false;

    const totalMs = Math.round(tempoDeJogoMs);
    const minutos = Math.floor(totalMs / 60000);
    const segundos = Math.floor((totalMs % 60000) / 1000);
    const milissegundos = totalMs % 1000;

    console.log(
        `tempo de jogo: ${String(minutos).padStart(2, '0')}m ` +
        `${String(segundos).padStart(2, '0')}s ` +
        `${String(milissegundos).padStart(3, '0')}ms`
    );

    // pega o outro jogador
    const outroJogador = jogadores[vencedor === 0 ? 1 : 0];

    console.log("dano causado: " + outroJogador.danoRecebido);
    console.log("dano recebido: " + jogadores[vencedor].danoRecebido);

    // atualiza dano total do perdedor
    outroJogador.danoTotal += jogadores[vencedor].danoRecebido;

    // FINALIZA PARTIDA E ATUALIZA RANKING
    finalizarPartida(jogadores[vencedor], outroJogador);

    // atualiza status na tela
    for (let statusAtual of vetorStatus) {
        if (statusAtual.id === "tempo-status")
            statusAtual.value = `${minutos}min:${segundos}s:${milissegundos}ms`;
        else if (statusAtual.id === "dano-causado-status")
            statusAtual.value = outroJogador.danoRecebido;
        else if (statusAtual.id === "dano-recebido-status")
            statusAtual.value = jogadores[vencedor].danoRecebido;
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

//"FINALIZA" PARTIDA E ENVIAR OS INCREMENTOS A PLANILHA

async function finalizarPartida(jogadorVencedor, jogadorPerdedor) {
    const incrementos = registrarIncrementos(jogadorVencedor, jogadorPerdedor);
    await enviarRankingSessao(incrementos);
}

//BOTÕES OPÇÕES

const vetorOpcoes = document.querySelectorAll(".opcao");
const legendaRejogarEl = document.querySelector("#legenda-rejogar");
const legendaVoltarMenuEl = document.querySelector("#legenda-voltar-menu");

for (let op of vetorOpcoes) {
    op.addEventListener("mouseover", function () {
        op.classList.add("botaoDestacado");

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
        if (op.id == "btn-rejogar")
            window.location.reload();
    })

    op.addEventListener("mouseout", function () {
        op.classList.remove("botaoDestacado");

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