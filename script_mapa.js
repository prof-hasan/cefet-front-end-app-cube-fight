const mapaEl = document.querySelectorAll(".mapa-link");

function definirArena(evt) { //ARMAZENAMENTO LOCAL
    let mapaDesejado = evt.currentTarget;

    const selecaoMapa = {
        mapaDefinido: mapaDesejado.dataset.set
    };

    localStorage.setItem("mapa", JSON.stringify(selecaoMapa));

    window.location.href = "./jogo/jogo.html";
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