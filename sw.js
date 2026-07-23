const CACHE_VERSION = 'v3';
const CACHE_SHELL = `aprenda-pomerano-shell-${CACHE_VERSION}`;
const CACHE_AUDIOS = `aprenda-pomerano-audios-${CACHE_VERSION}`;

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
    // Não precisamos listar as imagens manualmente, elas serão cacheadas no momento do uso (on-demand), 
    // ou você pode adicioná-las aqui se quiser garantir logo no primeiro segundo.
];

// 1. INSTALAÇÃO (Cria o Cache Base)
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_SHELL).then(cache => {
            return cache.addAll(APP_SHELL).then(() => {
                
                // MÁGICA: Baixa todos os áudios em segundo plano automaticamente!
                // Ele lê o JSON sozinho e faz os downloads sem travar a tela do usuário.
                fetch('./categories.json')
                    .then(res => res.json())
                    .then(data => {
                        caches.open(CACHE_AUDIOS).then(audioCache => {
                            data.forEach(categoria => {
                                // Aproveita e faz cache da imagem da categoria
                                cache.add(`./images/resized_images/${categoria.detalhes.imagem}`).catch(() => {});
                                
                                // Faz cache de todos os audios
                                categoria.detalhes.sub_categoria.forEach(sub => {
                                    sub.audios.forEach(audio => {
                                        const audioUrl = `./sounds/${audio.NOME_AUDIO}.mp3`;
                                        audioCache.match(audioUrl).then(res => {
                                            if (!res) {
                                                // Se não está no cache, baixa silenciosamente
                                                fetch(audioUrl).then(netRes => {
                                                    if (netRes.ok) audioCache.put(audioUrl, netRes);
                                                }).catch(() => console.log('Aguardando internet para baixar áudios restantes.'));
                                            }
                                        });
                                    });
                                });
                            });
                        });
                    }).catch(err => console.log('Erro ao ler JSON no SW:', err));
            });
        })
    );
    self.skipWaiting();
});

// 2. ATIVAÇÃO (Limpa caches antigos quando você atualizar o CACHE_VERSION)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(name => {
                    if (name !== CACHE_SHELL && name !== CACHE_AUDIOS) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. INTERCEPTAÇÃO (Estratégia Cache-First: Sempre tenta usar offline primeiro)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // Se achou no cache (mesmo sem internet), retorna imediatamente!
            if (cachedResponse) {
                return cachedResponse;
            }

            // Se não estava no cache, tenta buscar na internet e já salva para a próxima
            return fetch(event.request).then(networkResponse => {
                // Checa se a resposta é válida
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                // Clona a resposta e salva no cache correto
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