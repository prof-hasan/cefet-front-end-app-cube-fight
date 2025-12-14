const mapaEl = document.querySelectorAll(".mapa-link");
const imgMapaEl = document.querySelectorAll(".mapa-link img");
const somHooverMapEl = new Audio("efeitos_sonoros/somHooverMapa.wav"); somHooverMapEl.preload = "auto";
const somCliqueMapaEl = new Audio("efeitos_sonoros/somCliqueMapa.wav"); somCliqueMapaEl.preload = "auto";

let primeiroClique = 1;
let delaySomMapa;

function definirArena(evt) { //ARMAZENAMENTO LOCAL
    if(primeiroClique){
        delaySomMapa = 0;
        primeiroClique = 0;
    }
    else {
        delaySomMapa = 1200;
    }

    setTimeout(() => {
        somCliqueMapaEl.currentTime = 0;
        somCliqueMapaEl.play();    
    }, delaySomMapa);


    let mapaDesejado = evt.currentTarget;

    const selecaoMapa = {
        mapaDefinido: mapaDesejado.dataset.set
    };

    localStorage.setItem("mapa", JSON.stringify(selecaoMapa));

    setTimeout(() => {
        window.location.href = "./jogo/jogo.html";
    }, 1200);
}

function alterarEstilos(evt) { //ADICIONA ESTILOS QUANDO O MOUSE ESTÁ SOBRE ALGUM MAPA
    let mapaDestacado = evt.currentTarget;

    if (mapaDestacado.dataset.set == 'primavera') {
        mapaDestacado.classList.add('destaquePrimavera');
    }
    else if (mapaDestacado.dataset.set == 'luar') {
        mapaDestacado.classList.add('destaqueLuar');
    }
    else if (mapaDestacado.dataset.set == 'neve') {
        mapaDestacado.classList.add('destaqueNeve');
    }

    for (let mp of mapaEl) {
        if (mp != mapaDestacado) {
            mp.classList.add('destaqueSecundario');
        }
    }
}

function restaurarEstilos(evt) { //REMOVE ESTILOS QUANDO O MOUSE NÃO ESTÁ SOBRE NENHUM MAPA
    let mapaDestacado = evt.currentTarget;

    for (let mp of mapaEl) {
        if (mp != mapaDestacado) {
            mp.classList.remove('destaqueSecundario');
        }
        else {
            if (mapaDestacado.dataset.set == 'primavera') {
                mapaDestacado.classList.remove('destaquePrimavera');
            }
            else if (mapaDestacado.dataset.set == 'luar') {
                mapaDestacado.classList.remove('destaqueLuar');
            }
            else if (mapaDestacado.dataset.set == 'neve') {
                mapaDestacado.classList.remove('destaqueNeve');
            }
        }
    }
}

for (let m of mapaEl) {
    m.addEventListener('click', definirArena);
    m.addEventListener('mouseover', alterarEstilos);
    m.addEventListener('mouseout', restaurarEstilos);
}

imgMapaEl.forEach((img) => {
    img.addEventListener('mouseover', function(){
        somHooverMapEl.currentTime = 0;
        somHooverMapEl.play();
    })
})

let botaoMenuPrincipalVoltarEl = document.querySelector("#botao-menu-principal-voltar");
const somVoltarEl = new Audio("efeitos_sonoros/somVoltar.ogg"); somVoltarEl.preload = "auto";

let botaoVoltarJaClicado = 0;
let delaySomVoltar;

function voltarParaOMenuPrincipal() {
    if(!botaoVoltarJaClicado){
        delaySomVoltar = 0;
        botaoVoltarJaClicado = 1;
    }
    else 
        delaySomVoltar = 500;
    
    setTimeout(() => {
        somVoltarEl.currentTime = 0;
        somVoltarEl.play();    
    }, delaySomVoltar)

    setTimeout(() => {
        window.location.href = "index.html";
    }, 500);
}

botaoMenuPrincipalVoltarEl.addEventListener('click', voltarParaOMenuPrincipal);