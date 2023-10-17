const PATH = "/app-pomerano"

function getDirs() {
  const fs = require('fs');
  const dir = './sounds';

  fs.readdir(dir, (err, arquivos) => {
    ds = []
    arquivos.forEach(arquivo => {
      ds.push(`sounds/${arquivo}`)

    });
    console.log(ds);
  });
}

this.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open("v1").then(function (cache) {
      //getDirs()
      return cache.addAll([
        `${PATH}/`,
        `${PATH}/index.html`,
        `${PATH}/sobre.html`,
        `${PATH}/categories.json`,
        //`${PATH}/styles/`,
        //`${PATH}/scripts/`,
        `${PATH}/scripts/index.js`,
        //`${PATH}/sounds/`,
        //`${PATH}/images/resized_images/`
      ]);
    })
  );
});

this.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (resp) {
      return resp || fetch(event.request).then(function (response) {
        caches.open("v1").then(function (cache) {
          cache.put(event.request, response.clone());
        });
        return response;
      });
    }).catch(function () {
      console.log("error cache");
      return caches.match("/");
    })
  );
});