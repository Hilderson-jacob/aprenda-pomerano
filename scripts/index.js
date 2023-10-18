//document.documentElement.requestFullscreen()

/* if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/aprenda-pomerano/' })
        .then(function (reg) {
            // registration worked
            console.log('Registration succeeded. Scope is ' + reg.scope);
        }).catch(function (error) {
            // registration failed
            console.log('Registration failed with ' + error);
        });
} */

IMAGE_PATH = "./images/resized_images/"
const elements_content = document.querySelector("#elements-content")

function estruture_data(jsondata) {
    menu_html = ""
    p = 0
    for (let i of jsondata) {
        menu_html += `  <a data-category="${i.categoria}" data-position="${p}" onclick="estruture_audio(this)">
                            <img src="${IMAGE_PATH + i.detalhes.imagem}">
                            <span><b>${i.categoria}</b></span>
                        </a>`
        p += 1
    }
    elements_content.innerHTML = menu_html
}


fetch("categories.json")
    .then(response => {
        return response.json();
    })
    .then(jsondata => estruture_data(jsondata))

function estruture_audio(element) {

    fetch("./categories.json")
        .then(response => {
            return response.json();
        })
        .then(jsondata => {
            p = element.dataset.position
            c = element.dataset.category
            modal = document.getElementById('audio-modal')
            modal.style.display = 'block'
            audios_html = ""
            for (topic of jsondata[p].detalhes.sub_categoria) {
                audios_html += `<h2>${topic.nome}</h2>`
                for (audio of topic.audios) {

                    audios_html += `<div class="audio">
                                    <div id="${audio.NOME_AUDIO}-display" class="audio-display"></div>
                                    <div class="text">
                                        <div>${audio.PORTUGUES}</div>
                                        <audio id="${audio.NOME_AUDIO}"><source src="./sounds/${audio.NOME_AUDIO}.mp3" type="audio/mpeg"></audio>
                                        <div class="pomer-text">${audio.POMERANO}</div>
                                    </div>
                                    <div data-path="${audio.NOME_AUDIO}" class="icon-play">
                                        <span data-path="${audio.NOME_AUDIO}" class="material-icons-sharp">play_arrow</span>
                                    </div>
                                </div>`
                };
            };

            document.querySelector(".audios-content").innerHTML = audios_html
            const plays = document.getElementsByClassName("icon-play");

            for (const play of plays) {
                play.addEventListener("click", (e) => {
                    path = e.target.dataset.path
                    const audio_play = document.getElementById(path)
                    document.getElementById(`${path}-display`).style.animationDuration = `${audio_play.duration}s`

                    const clicked = document.querySelector(".clicked");
                    if (clicked)
                        clicked.classList.toggle('clicked');

                    play.parentNode.classList.toggle('clicked');
                    audio_play.play()
                    //play.parentNode.classList.toggle('clicked');
                });
            };
        });
}

document.getElementById("back-arrow").addEventListener("click", e => {
    modal.style.display = 'none'
})
document.getElementById("back-arrow-info").addEventListener("click", e => {
    document.getElementById("info-modal").style.display = 'none'
})
document.getElementById("info-app").addEventListener("click", e => {
    document.getElementById("info-modal").style.display = 'block'
})



