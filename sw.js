// Nome do Service Worker
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open('aprenda-pomerano-cache')
      .then(function (cache) {
        return cache.addAll([
          //Raiz
          './',
          './index.html',
          './privace_police.html',
          './sobre.html',
          //styles
          './styles/index.css',
          './styles/audio.css',
          './styles/root.css',
          './styles/sobre.css',
          //scripts
          './scripts/index.js',
          //images
          './images/resized_images/10_cores.jpg',
          './images/resized_images/11_ferramentas.jpg',
          './images/resized_images/12_familia.jpg',
          './images/resized_images/13_escola.jpg',
          './images/resized_images/1_comum.jpg',
          './images/resized_images/2_saudacoes.jpg',
          './images/resized_images/3_romance.jpg',
          './images/resized_images/4_comer.jpg',
          './images/resized_images/5_emergencia.jpg',
          './images/resized_images/6_compras.jpg',
          './images/resized_images/7_saude.jpg',
          './images/resized_images/8_tempo.jpg',
          './images/resized_images/9_numeros.jpg',
          "./img"
        ]).then(console.log("feito"));
      })
  );
});

// Interceptação de requisições de rede
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          // Retorna o recurso do cache se disponível
          return response;
        } else {
          return fetch(event.request)
            .then(function (response) {
              // Armazena o novo recurso no cache
              if (response.status === 200) {
                let armaz = response.clone()
                caches.open('aprenda-pomerano-cache')
                  .then(function (cache) {
                    cache.put(event.request, armaz);
                  });
                return response;
              } else {
                return response
              }
            });
        }
      })
  );
});

// Notificação quando o Service Worker for atualizado
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (cacheName !== 'aprenda-pomerano-cache') {
              // Exclui caches antigos
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
});
