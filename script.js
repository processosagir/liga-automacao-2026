// ==========================================
// CONFIGURAÇÕES DA JORNADA POKÉMON (LIGA 2026)
// ==========================================
let metaAtual = 0;
let metaEsperada = 12.5;

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

// Função para definir a meta baseada na data atual
function calcularMetaEsperada() {
    const hoje = new Date();

    // Datas limites (Ano, Mês [0-11], Dia)
    const cronograma = [
        { data: new Date(2026, 4, 4), valor: 12.5 },   // 04/05/2026
        { data: new Date(2026, 5, 1), valor: 25 },     // 01/06/2026
        { data: new Date(2026, 6, 6), valor: 37.5 },   // 06/07/2026
        { data: new Date(2026, 7, 3), valor: 50 },     // 03/08/2026
        { data: new Date(2026, 8, 7), valor: 62.5 },   // 07/09/2026
        { data: new Date(2026, 9, 5), valor: 75 },     // 05/10/2026
        { data: new Date(2026, 10, 2), valor: 87.5 },  // 02/11/2026
        { data: new Date(2026, 10, 30), valor: 100 }   // 30/11/2026
    ];

    // Busca a primeira meta cuja data ainda não passou
    for (let marco of cronograma) {
        if (hoje <= marco.data) {
            return marco.valor;
        }
    }
    return 100; // Caso passe de novembro
}

// ==========================================
// 1. BUSCA DE DADOS (POWER AUTOMATE -> JSON)
// ==========================================
async function atualizarDados() {
    try {
        const response = await fetch('dados.json?t=' + new Date().getTime());
        if (!response.ok) throw new Error('Arquivo não encontrado');

        const dados = await response.json();

        // Tratamento do percentual
        let stringPercent = dados.percentual ? dados.percentual.toString() : "0";
        metaAtual = parseFloat(stringPercent.replace('%', '').replace(',', '.').trim());

        // Atualiza a meta esperada automaticamente conforme a data
        metaEsperada = calcularMetaEsperada();

        // Atualização da descrição da MD
        const mdDesc = document.querySelector('.medida-direcao-box p') || document.getElementById('md-desc');
        if (mdDesc) {
            mdDesc.innerText = dados.direcao;
        }

        render();
    } catch (error) {
        console.warn("Sincronizando com a planilha da Agir...");
    }
}

// ==========================================
// 2. RENDERIZAÇÃO DO PAINEL
// ==========================================
function render() {
    const gymsCont = document.getElementById('gyms');
    const pokedexCont = document.getElementById('captured-list');
    const statusBadge = document.getElementById('global-status');
    const hpFill = document.getElementById('hp-fill');
    const currentPctText = document.getElementById('current-pct');

    if (!gymsCont || !pokedexCont) return;

    gymsCont.innerHTML = '';
    pokedexCont.innerHTML = '';

    jornada.forEach(p => {
        const conquistado = metaAtual >= p.range[1];

        const card = document.createElement('div');
        card.className = `gym-card ${conquistado ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
            <img src="${p.img}">
            <div>
                <strong>${p.nome}</strong><br>
                <small>${p.range[0]}% - ${p.range[1]}%</small>
            </div>
        `;
        gymsCont.appendChild(card);

        if (conquistado) {
            const id = p.img.split('/').pop().split('.')[0];
            const slot = document.createElement('div');
            slot.className = 'captured-slot';
            slot.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png">`;
            pokedexCont.appendChild(slot);
        }
    });

    // Atualização da Barra de HP
    const progressoBarra = Math.min(metaAtual, 100);
    hpFill.style.width = progressoBarra + "%";
    currentPctText.innerText = metaAtual.toFixed(2) + "%";

    // LÓGICA DE STATUS E COMEMORAÇÃO
    statusBadge.style.display = "flex"; // Garante que o flexbox esteja ativo
    statusBadge.style.alignItems = "center";
    statusBadge.style.justifyContent = "center";

    if (metaAtual >= 100) {
        statusBadge.innerText = "Pokédex completa!";
        statusBadge.style.background = "#4dad5b";
        statusBadge.style.color = "#fff";
        hpFill.style.backgroundColor = "#4dad5b";
    } else if (metaAtual >= metaEsperada) {
        statusBadge.innerText = "Pokémon capturado";
        statusBadge.style.background = "#4dad5b";
        statusBadge.style.color = "#fff";
        hpFill.style.backgroundColor = "#4dad5b";
    } else {
        statusBadge.innerText = "Quase lá!"; // Mantendo o padrão visual da imagem
        statusBadge.style.background = "#ff9900";
        statusBadge.style.color = "#fff";
        hpFill.style.backgroundColor = "#ff9900";
    }
}

// ==========================================
// 3. START & INTERVALO
// ==========================================
atualizarDados();
setInterval(atualizarDados, 60000);