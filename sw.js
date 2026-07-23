// Mude esta versão SEMPRE que alterar CSS, JS ou HTML
const APP_VERSION = 'v4'; 
const CACHE_SHELL = `aprenda-pomerano-shell-${APP_VERSION}`;
const CACHE_AUDIOS = `aprenda-pomerano-audios`; // SEM VERSÃO: Nunca será apagado automaticamente!

const APP_SHELL = [
    './',
    './index.html',
    './sobre.html',
    './categories.json',
    './manifest.json',
    './styles/root.css',
    './styles/index.css',
    './styles/audio.css',
    './styles/sobre.css',
    './scripts/index.js'
];

// Função auxiliar para enviar mensagens para a tela (UI)
async function sendMessageToUI(message) {
    // includeUncontrolled permite enviar mensagens mesmo na primeira visita
    const clients = await self.clients.matchAll({ includeUncontrolled: true });
    clients.forEach(client => client.postMessage(message));
}

// 1. INSTALAÇÃO (Onde a mágica acontece)
self.addEventListener('install', event => {
    // Força o SW novo a assumir o controle imediatamente
    self.skipWaiting(); 

    event.waitUntil(
        caches.open(CACHE_SHELL).then(cache => {
            return cache.addAll(APP_SHELL).then(async () => {
                
                // Inicia o processo de download de áudios
                try {
                    const res = await fetch('./categories.json');
                    const data = await res.json();
                    const audioCache = await caches.open(CACHE_AUDIOS);
                    
                    let audiosParaBaixar = [];

                    // Mapeia o que precisa ser baixado
                    data.forEach(categoria => {
                        categoria.detalhes.sub_categoria.forEach(sub => {
                            sub.audios.forEach(audio => {
                                audiosParaBaixar.push(`./sounds/${audio.NOME_AUDIO}.mp3`);
                            });
                        });
                    });

                    let total = audiosParaBaixar.length;
                    let baixados = 0;

                    // Baixa apenas o que não está no cache
                    for (const audioUrl of audiosParaBaixar) {
                        const cached = await audioCache.match(audioUrl);
                        if (!cached) {
                            const netRes = await fetch(audioUrl);
                            if (netRes.ok) {
                                await audioCache.put(audioUrl, netRes);
                            }
                        }
                        baixados++;
                        // Envia o progresso para a tela!
                        sendMessageToUI({ type: 'DOWNLOAD_PROGRESS', baixados, total });
                    }
                    
                    sendMessageToUI({ type: 'DOWNLOAD_COMPLETE' });

                } catch (err) {
                    console.error('Erro ao processar áudios no SW:', err);
                }
            });
        })
    );
});

// 2. ATIVAÇÃO (Limpa apenas o Layout antigo, preserva os áudios)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(name => {
                    // Apaga caches antigos do APP_SHELL, mas ignora o CACHE_AUDIOS
                    if (name.startsWith('aprenda-pomerano-shell') && name !== CACHE_SHELL) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. INTERCEPTAÇÃO (Cache-First)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;

            return fetch(event.request).then(networkResponse => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                const responseToCache = networkResponse.clone();
                const targetCache = event.request.url.includes('.mp3') ? CACHE_AUDIOS : CACHE_SHELL;
                
                caches.open(targetCache).then(cache => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            });
        })
    );
});