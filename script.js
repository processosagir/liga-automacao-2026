let metaAtual = 0;
let metaEsperada = 25;

const jornada = [
    { nome: "Início (Abril)", range: [0, 12.5], img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png" },
    { nome: "Ginásio Pedra (Maio)", range: [12.5, 25], img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/74.png" },
    { nome: "Ginásio Água (Junho)", range: [25, 37.5], img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/120.png" },
    { nome: "Ginásio Trovão (Julho)", range: [37.5, 50], img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/125.png" },
    { nome: "Ginásio Planta (Agosto)", range: [50, 62.5], img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/114.png" },
    { nome: "Ginásio Psíquico (Setembro)", range: [62.5, 75], img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/64.png" },
    { nome: "Ginásio Fogo (Outubro)", range: [75, 87.5], img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/126.png" },
    { nome: "LIGA POKÉMON (Novembro)", range: [87.5, 100], img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png" }
];

function calcularMetaEsperada() {
    const hoje = new Date();
    const cronograma = [
        { data: new Date(2026, 4, 4), valor: 13 },
        { data: new Date(2026, 5, 1), valor: 25 },
        { data: new Date(2026, 6, 6), valor: 38 },
        { data: new Date(2026, 7, 3), valor: 50 },
        { data: new Date(2026, 8, 7), valor: 63 },
        { data: new Date(2026, 9, 5), valor: 75 },
        { data: new Date(2026, 10, 2), valor: 88 },
        { data: new Date(2026, 10, 30), valor: 100 }
    ];
    for (let marco of cronograma) {
        if (hoje <= marco.data) return marco.valor;
    }
    return 100;
}

async function atualizarDados() {
    try {
        const response = await fetch('dados.json?t=' + new Date().getTime());
        if (!response.ok) throw new Error('Arquivo não encontrado');
        const dados = await response.json();

        let stringPercent = dados.percentual ? dados.percentual.toString() : "0";
        metaAtual = parseFloat(stringPercent.replace('%', '').replace(',', '.').trim());
        metaEsperada = calcularMetaEsperada();

        const mdDesc = document.getElementById('md-desc');
        if (mdDesc) mdDesc.innerText = dados.direcao;

        render();
    } catch (error) {
        console.warn("Sincronizando dados...");
    }
}

function render() {
    const gymsCont = document.getElementById('gyms');
    const pokedexCont = document.getElementById('captured-list');
    const statusBadge = document.getElementById('global-status');
    const hpFill = document.getElementById('hp-fill');
    const currentPctText = document.getElementById('current-pct');
    const targetLine = document.getElementById('target-line');
    const metaTxt = document.getElementById('meta-txt');

    if (!gymsCont || !pokedexCont) return;

    gymsCont.innerHTML = '';
    pokedexCont.innerHTML = '';

    jornada.forEach(p => {
        const conquistado = metaAtual >= p.range[1];
        const card = document.createElement('div');
        card.className = `gym-card ${conquistado ? 'unlocked' : 'locked'}`;
        card.innerHTML = `<img src="${p.img}"><div><strong>${p.nome}</strong><br><small>${p.range[0]}% - ${p.range[1]}%</small></div>`;
        gymsCont.appendChild(card);

        if (conquistado) {
            const id = p.img.split('/').pop().split('.')[0];
            const slot = document.createElement('div');
            slot.className = 'captured-slot';
            slot.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png">`;
            pokedexCont.appendChild(slot);
        }
    });

    hpFill.style.width = Math.min(metaAtual, 100) + "%";
    currentPctText.innerText = metaAtual.toFixed(2) + "%";
    
    // Move a linha e o texto da meta dinamicamente
    if(targetLine) targetLine.style.left = metaEsperada + "%";
    if(metaTxt) metaTxt.innerText = metaEsperada + "%";

    if (metaAtual >= 100) {
        statusBadge.innerText = "Pokédex completa!";
        statusBadge.style.background = "#4dad5b";
        hpFill.style.backgroundColor = "#4dad5b";
    } else if (metaAtual >= metaEsperada) {
        statusBadge.innerText = "Pokémon capturado";
        statusBadge.style.background = "#4dad5b";
        hpFill.style.backgroundColor = "#4dad5b";
    } else {
        statusBadge.innerText = "Quase lá!";
        statusBadge.style.background = "#ff9900";
        hpFill.style.backgroundColor = "#ff9900";
    }
}

atualizarDados();
setInterval(atualizarDados, 60000);
