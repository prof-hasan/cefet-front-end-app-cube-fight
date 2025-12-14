window.mostrar = ScrollReveal({reset:true});

mostrar.reveal(".efeito-titulo-section", {
    duration: 1500,
    distance: "90px",
})

mostrar.reveal(".efeito-img-colaboradores", {
    duration: 1500,
    delay: 300,
    distance: "90px",
    origin: "left"
})

mostrar.reveal(".efeito-nome-colaboradores", {
    duration: 1500,
    delay: 300,
    distance: "90px",
    origin: "right"
})

mostrar.reveal(".efeito-opcional-1", {
    duration: 800,
    distance: "90px",
})

mostrar.reveal(".efeito-opcional-2", {
    duration: 800,
    delay: 250,
    distance: "90px",
})

mostrar.reveal(".efeito-opcional-3", {
    duration: 800,
    delay: 500,
    distance: "90px",
})

mostrar.reveal(".efeito-opcional-4", {
    duration: 1000,
    delay: 750,
    distance: "90px",
})

let botaoMenuPrincipalVoltarEl = document.querySelector("#botao-menu-principal-voltar");
const somVoltarEl = new Audio("efeitos_sonoros/somVoltar.ogg"); somVoltarEl.preload = "auto";

let botaoJaClicado = 0;
let delaySom;

function voltarParaOMenuPrincipal() {
    if(!botaoJaClicado){
        delay = 0;
        botaoJaClicado = 1;
    }
    else 
        delaySom = 500;
    
    setTimeout(() => {
        somVoltarEl.currentTime = 0;
        somVoltarEl.play();    
    }, delaySom)

    setTimeout(() => {
        window.location.href = "index.html";
    }, 500);
}

botaoMenuPrincipalVoltarEl.addEventListener('click', voltarParaOMenuPrincipal);
