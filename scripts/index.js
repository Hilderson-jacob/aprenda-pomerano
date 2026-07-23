// ==========================================
// CONFIGURAÇÕES GERAIS E ELEMENTOS DA DOM
// ==========================================
const IMAGE_PATH = "./images/resized_images/";
const elementsContent = document.querySelector("#elements-content");
const audiosContent = document.querySelector(".audios-content");
const audioModal = document.getElementById("audio-modal");
const infoModal = document.getElementById("info-modal");
const principalNav = document.getElementById("principal-nav");

// ==========================================
// ESTADO GLOBAL DA APLICAÇÃO
// ==========================================
let appData = []; // Armazena o JSON para evitar múltiplas requisições (Double Fetch)
let currentAudio = null; // Guarda a referência do áudio tocando no momento
let currentObjectURL = null; // Guarda a URL do Blob para evitar Memory Leak

// ==========================================
// INICIALIZAÇÃO
// ==========================================
async function initApp() {
    try {
        const response = await fetch("categories.json");
        appData = await response.json();
        renderCategories(appData);
    } catch (error) {
        console.error("Erro ao carregar o arquivo categories.json:", error);
    }
}

function renderCategories(data) {
    let menuHtml = "";

    data.forEach((item, index) => {
        menuHtml += `
            <a class="category-btn" data-position="${index}">
                <img alt="Imagem da categoria ${item.categoria}" src="${IMAGE_PATH + item.detalhes.imagem}" loading="lazy">
                <span><b>${item.categoria}</b></span>
            </a>
        `;
    });

    // O último <a> vazio era usado no seu CSS original para espaçamento flexbox
    elementsContent.innerHTML = menuHtml + "<a aria-hidden='true'></a>";

    // Adiciona os eventos de clique sem usar 'onclick' no HTML (Boa prática)
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => openCategory(e.currentTarget.dataset.position));
    });
}

// ==========================================
// GERENCIAMENTO DA INTERFACE E ÁUDIOS
// ==========================================
function openCategory(position) {
    const categoryData = appData[position];
    if (!categoryData) return;

    let audiosHtml = "";
    categoryData.detalhes.sub_categoria.forEach(topic => {
        audiosHtml += `<h2>${topic.nome}</h2>`;

        topic.audios.forEach(audio => {
            audiosHtml += `
        <div class="audio" id="card-${audio.NOME_AUDIO}">
            <div id="${audio.NOME_AUDIO}-display" class="audio-display"></div>
            <div class="text">
                <div class="text-pt">${audio.PORTUGUES}</div>
                <div class="pomer-text">${audio.POMERANO}</div>
            </div>
            <div data-path="${audio.NOME_AUDIO}" class="icon-play">
                <span class="material-icons-round">play_arrow</span>
            </div>
        </div>
    `;
        });

    });

    audiosContent.innerHTML = audiosHtml;
    audioModal.classList.add('active'); // O modal desliza pra tela

    // Adiciona evento de play em cada botão
    document.querySelectorAll('.icon-play').forEach(btn => {
        btn.addEventListener('click', handlePlayAudio);
    });
}

async function handlePlayAudio(e) {
    const btn = e.currentTarget;
    const path = btn.dataset.path;
    const audioUrl = `./sounds/${path}.mp3`;
    const card = document.getElementById(`card-${path}`);
    const displayBar = document.getElementById(`${path}-display`);

    if (currentAudio) {
        currentAudio.pause();
        document.querySelectorAll('.audio').forEach(el => {
            el.classList.remove('clicked');
            const bar = el.querySelector('.audio-display');
            if (bar) bar.style.animation = 'none';
        });
    }

    card.classList.add('clicked');

    try {
        // Tão simples quanto isso! Se estiver offline, o sw.js vai interceptar e devolver o MP3!
        currentAudio = new Audio(audioUrl);

        currentAudio.addEventListener('loadedmetadata', () => {
            displayBar.style.animation = 'none'; 
            void displayBar.offsetWidth; 
            displayBar.style.animation = `progressSlide ${currentAudio.duration}s linear forwards`;
        });

        currentAudio.addEventListener('ended', () => {
            card.classList.remove('clicked');
        });

        currentAudio.play();
    } catch (error) {
        console.error("Erro ao reproduzir:", error);
        card.classList.remove('clicked');
    }
}

// ==========================================
// INDEXED DB & CACHE SOB DEMANDA (LAZY LOAD)
// ==========================================
function abrirBancoDeDados() {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open("audioDB", 1);
        request.onerror = (e) => reject("Erro no IndexedDB: " + e.target.error);
        request.onsuccess = (e) => resolve(e.target.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('audios')) {
                db.createObjectStore('audios', { keyPath: 'audio_path' });
            }
        };
    });
}

async function getOrFetchAudio(audioPath) {
    const db = await abrirBancoDeDados();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['audios'], 'readonly');
        const store = transaction.objectStore('audios');
        const getRequest = store.get(audioPath);

        getRequest.onsuccess = async (event) => {
            const result = event.target.result;
            let blob;

            if (result && result.audio) {
                // Áudio já existe no banco, pega o Blob direto
                blob = new Blob([result.audio], { type: 'audio/mp3' });
            } else {
                // Áudio não existe. Baixa da rede e já salva no banco em Background (Lazy Loading)
                try {
                    const response = await fetch(audioPath);
                    if (!response.ok) throw new Error('Falha no download do MP3');

                    const arrayBuffer = await response.arrayBuffer();
                    blob = new Blob([arrayBuffer], { type: 'audio/mp3' });

                    // Salva no IndexedDB de forma assíncrona para as próximas vezes
                    const writeTx = db.transaction(['audios'], 'readwrite');
                    writeTx.objectStore('audios').put({ audio_path: audioPath, audio: arrayBuffer });
                } catch (err) {
                    return reject(err);
                }
            }

            // CORREÇÃO DO MEMORY LEAK: Limpa a URL antiga antes de criar uma nova
            if (currentObjectURL) {
                URL.revokeObjectURL(currentObjectURL);
            }

            currentObjectURL = URL.createObjectURL(blob);
            resolve(new Audio(currentObjectURL));
        };

        getRequest.onerror = () => reject('Erro ao recuperar áudio do IndexedDB');
    });
}

// ==========================================
// EVENTOS DE NAVEGAÇÃO DOS MODAIS
// ==========================================
document.getElementById("back-arrow").addEventListener("click", () => {
    if (currentAudio) currentAudio.pause();
    audioModal.classList.remove('active'); // O modal desliza pra fora
});

document.getElementById("back-arrow-info").addEventListener("click", () => {
    infoModal.classList.remove('active');
});

document.getElementById("info-app").addEventListener("click", () => {
    infoModal.classList.add('active');
});

// ==========================================
// INICIA O APLICATIVO
// ==========================================
initApp();