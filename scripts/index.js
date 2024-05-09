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
                play.addEventListener("click", async (e) => {
                    path = e.target.dataset.path
                    const audio_play = await playAudioFromDB(`./sounds/${path}.mp3`)
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


// Abrir ou criar o banco de dados
function abrirBancoDeDados() {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open("audioDB", 1);

        request.onerror = function (event) {
            reject("Erro ao abrir o banco de dados: " + event.target.error);
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = function (event) {
            db = event.target.result;
            var objectStore = db.createObjectStore('audios', { keyPath: 'audio_path', autoIncrement: false, unique: true });
        };
    });
}
async function addAudioToDB(audio_path) {
    const db = await abrirBancoDeDados();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', audio_path, true);
    xhr.responseType = 'arraybuffer';
    let audio = await playAudioFromDB(audio_path)
    //console.log(audio);
    if (!audio) {
        xhr.onload = async function () {
            if (xhr.status === 200) {
                var audioData = xhr.response;
                var transaction = db.transaction(['audios'], 'readwrite');
                var objectStore = transaction.objectStore('audios');

                //console.log(audio);

                var request = objectStore.add({ audio_path: audio_path, audio: audioData });
                request.onsuccess = function (event) {
                    console.log('Áudio adicionado ao IndexedDB com sucesso');
                };

                request.onerror = function (event) {
                    console.error('Erro ao adicionar áudio ao IndexedDB');
                };

            }


        }
    };

    xhr.send();
}

// Recuperar o áudio do IndexedDB e reproduzi-lo
async function playAudioFromDB(path) {
    return new Promise((resolve, reject) => {
        abrirBancoDeDados().then(db => {
            var transaction = db.transaction(['audios'], 'readonly');
            var objectStore = transaction.objectStore('audios');
            var getRequest = objectStore.get(path);

            getRequest.onsuccess = function (event) {
                var audios = event.target.result;
                if (audios) {
                    var audioData = audios.audio;
                    var blob = new Blob([audioData], { type: 'audio/mp3' });
                    var url = URL.createObjectURL(blob);

                    var audio = new Audio(url);
                    resolve(audio)
                    //audio.muted = true;
                    //audio.play();
                } else {
                    //console.log('Nenhum áudio encontrado no IndexedDB');
                    resolve(null)
                }
            };

            getRequest.onerror = function (event) {
                console.error('Erro ao recuperar áudio do IndexedDB');
            };
        })
    })
}

//addAudioToDB('./sounds/01_ja.mp3');

// COmo usar os audios:
async function to_play() {
    let audio = await playAudioFromDB('./sounds/01_ja.mp3')
    console.log(audio);
    audio.play()
}




object = [
    './sounds/01_ja.mp3', './sounds/01_kanst_duu_mij_aine_restaurant_foirsteele.mp3', './sounds/01_kan_ik_mij_hijr_hensete.mp3', './sounds/01_ops.mp3', './sounds/01_woo_blijwe_dai_geschafhuuser.mp3', './sounds/02_aine_disch_for_twai_taum_gefale.mp3', './sounds/02_gaud_dij_keneleire.mp3', './sounds/02_kan_ik_dij_air_gedrank_anbaire.mp3', './sounds/02_nei.mp3', './sounds/02_wonair_make_dai_up.mp3', './sounds/03_dankeschoin.mp3', './sounds/03_ik_har_geirn_aine_disch_dich_bijne_luuk.mp3', './sounds/03_is_uk_gaud_dij_keneleire.mp3', './sounds/03_sin_hijr.mp3', './sounds/03_wair_geirn_hengae.mp3', './sounds/04_ik_wul_koipe.mp3', './sounds/04_kan_ik_der_menu_saie.mp3', './sounds/04_kan_ik_der_menu_saie_taum_gefale.mp3', './sounds/04_nei_dankeschoin.mp3', './sounds/04_taum_gefale.mp3', './sounds/04_woo_is_dij_name.mp3', './sounds/05_ik_bun_ni_interessijrt.mp3', './sounds/05_is_kair_problem.mp3', './sounds/05_kan_ik_saie.mp3', './sounds/05_mij_name_is.mp3', './sounds/05_wat_rekomendijrst_duu.mp3', './sounds/06_haw_grout_lust.mp3', './sounds/06_ik_eet_wat_duu_forlange_daist.mp3', './sounds/06_mak_taum_gefale.mp3', './sounds/06_watfon_farwe_hast_duu.mp3', './sounds/06_woo_gait.mp3', './sounds/07_forgeew_mij.mp3', './sounds/07_kan_ik_pruiwe.mp3', './sounds/07_lat_mij.mp3', './sounds/07_mij_gait_gaud.mp3', './sounds/07_wat_is_dit.mp3', './sounds/08_duu_bust_seir_hubsch.mp3', './sounds/08_kan_ik_riner_koome.mp3', './sounds/08_kan_ik_soone_teeler_forlange.mp3', './sounds/08_mij_gait_ni_gaud.mp3', './sounds/08_woo_is_dai_pruiwkamer.mp3', './sounds/09_duu_bust_seir_fain.mp3', './sounds/09_ik_wul.mp3', './sounds/09_kair_problem.mp3', './sounds/09_past_gaud.mp3', './sounds/09_un_duu.mp3', './sounds/10 DAT PASST NI.mp3', './sounds/10_duu_bust_special.mp3', './sounds/10_GRÅRHAK.mp3', './sounds/10_ik_haw_kotst.mp3', './sounds/10_ik_wait_ni.mp3', './sounds/10_kan_ik_air_glas_water_drinke.mp3', './sounds/10_marts.mp3', './sounds/10_MÅLHEFT.mp3', './sounds/10_neegen.mp3', './sounds/10_ousterblag.mp3', './sounds/10_past_ni.mp3', './sounds/10_raup_dai_poliss.mp3', './sounds/10_Swester.mp3', './sounds/10_woo_feel_jare_bust_duu_uld.mp3', './sounds/10_WOO_ULD_BÜST_DUU.mp3', './sounds/11_april.mp3', './sounds/11_duu_bust_seir_atraktiv.mp3', './sounds/11_DUU_BÜST_SËR_ATRAKTIV.mp3', './sounds/11_DËSTEL.mp3', './sounds/11_forstaist_duu_mij.mp3', './sounds/11_gaure_apetit.mp3', './sounds/11_Groottante.mp3', './sounds/11_ik_bun_forkult.mp3', './sounds/11_ik_bun_forlare.mp3', './sounds/11_ik_bun_jare.mp3', './sounds/11_IK_BÜN..._JÅRE_ULD.mp3', './sounds/11_IK_BÜN_FORBIJSTERT.mp3', './sounds/11_ik_wil_ditkoipe.mp3', './sounds/11_IK_WIL_DIT_KÖÖPE.mp3', './sounds/11_KUUGELSRIJWER.mp3', './sounds/11_lilablag.mp3', './sounds/11_teigen.mp3', './sounds/12_Braurer.mp3', './sounds/12_dai_reeken_taum_gefale.mp3', './sounds/12_duu_hast_feele_charm.mp3', './sounds/12_elwen.mp3', './sounds/12_FARWSTIFT.mp3', './sounds/12_fon_woo_bust_duu.mp3', './sounds/12_helroud.mp3', './sounds/12_ik_forsta.mp3', './sounds/12_ik_haw_difikulteit_taum_luft_halen.mp3', './sounds/12_ik_haw_mijn_tasch_forlare.mp3', './sounds/12_IK_HÄW_SWÅRHËT_TAUM_LUFT_HÅLEN.mp3', './sounds/12_mai.mp3', './sounds/12_MAISTEL.mp3', './sounds/12_wat_kost_dat.mp3', './sounds/13_duusterblag.mp3', './sounds/13_Grootunkel.mp3', './sounds/13_ik_befijn_mij_duusch.mp3', './sounds/13_ik_bun_fon.mp3', './sounds/13_IK_FORNEEM_IRGENDWAT_OIWER_DIJ.mp3', './sounds/13_ik_fornem_irgend_wat_oiwer_dij.mp3', './sounds/13_ik_forsta_ni.mp3', './sounds/13_ik_haw_mijne_passport_forlare.mp3', './sounds/13_IK_HÄW_MIJNE_PASSPORT_FORLÅRE.mp3', './sounds/13_IK_HÄW_MIJNE_RËSSCHIJN_FORLÅRE.mp3', './sounds/13_juni.mp3', './sounds/13_kanst_duu_der_prais_srijwe.mp3', './sounds/13_kan_ik_mit_chek_betale.mp3', './sounds/13_SCHAULEDISCH.mp3', './sounds/13_twolw.mp3', './sounds/13_WINKEL.mp3', './sounds/14_CD.mp3', './sounds/14_darfoir_ni.mp3', './sounds/14_DARFOR_NI.mp3', './sounds/14_dat_is_seir_duur.mp3', './sounds/14_draitseen.mp3', './sounds/14_DÅRFOR_NI.mp3', './sounds/14_FOOS.mp3', './sounds/14_helblag.mp3', './sounds/14_ik_bun.mp3', './sounds/14_ik_bun_bijstoole_woure.mp3', './sounds/14_IK_BÜN_BESTÅLE_WOORE.mp3', './sounds/14_ik_lijb_dij.mp3', './sounds/14_juli.mp3', './sounds/14_kan_ik_mit_kreditkarton_betale.mp3', './sounds/14_Staifmuter.mp3', './sounds/14_woo_woonst_duu.mp3', './sounds/15_august.mp3', './sounds/15_darfoir_ni.mp3', './sounds/15_DREKEMER.mp3', './sounds/15_firtseen.mp3', './sounds/15_hartskrank.mp3', './sounds/15_helgruin.mp3', './sounds/15_ik_woon_in.mp3', './sounds/15_kanst_duu_mij_aine_diskont_geewe.mp3', './sounds/15_kanst_duu_mij_helpe.mp3', './sounds/15_kan_ik_dij_aine_puss_geewe.mp3', './sounds/15_Muter.mp3', './sounds/15_neeme_jij_blous_bargild_an.mp3', './sounds/15_SËKEL.mp3', './sounds/15_S╙KEL.mp3', './sounds/15_wat.mp3', './sounds/16 KANST DUU MIJ AINE PLASTIKSAK GEEWE,TAUM GEFALE.mp3', './sounds/16_astmatisch.mp3', './sounds/16_fuwtseen.mp3', './sounds/16_geelroud.mp3', './sounds/16_hast_duu_aine_bruudman.mp3', './sounds/16_hast_duu_feel_foir.mp3', './sounds/16_HELP_MIJ!.mp3', './sounds/16_kanst_duu_mij_aine_sak_geewe.mp3', './sounds/16_kanst_duu_mij_aine_sak_geewe_taum_gefale.mp3', './sounds/16_KANST_DUU_MIJ_AINE_SAK_GEEW_TAUM_GEFALE.mp3', './sounds/16_PAPIJRKLAMER.mp3', './sounds/16_september.mp3', './sounds/16_Staifswester_halwswester.mp3', './sounds/16_STÄMIJSER.mp3', './sounds/16_wat_fon.mp3', './sounds/16_wenig_eeten.mp3', './sounds/17_fruustuk.mp3', './sounds/17_hast_duu_ain_bruud.mp3', './sounds/17_hast_duu_andrer_optione.mp3', './sounds/17_IK_BRUUK_HÜLP.mp3', './sounds/17_LIJM.mp3', './sounds/17_oktober.mp3', './sounds/17_roudbruun.mp3', './sounds/17_seechtseen.mp3', './sounds/17_Staifbraurer_halwbraurer.mp3', './sounds/17_sukerkrank.mp3', './sounds/17_SWUNGBÅRER.mp3', './sounds/17_woo.mp3', './sounds/17_woo_gaist_duu_hen.mp3', './sounds/18_bet_naher.mp3', './sounds/18_BUNTELIJM.mp3', './sounds/18_hast_duu_e_mail.mp3', './sounds/18_ik_haw_alergi.mp3', './sounds/18_ik_haw_alergi_fon.mp3', './sounds/18_kanst_duu_mij_dat_inwikle.mp3', './sounds/18_mirdageeten.mp3', './sounds/18_november.mp3', './sounds/18_RASPELFIJL.mp3', './sounds/18_sijbtseen.mp3', './sounds/18_Swigerdochter.mp3', './sounds/18_Swigertochter.mp3', './sounds/18_violeit.mp3', './sounds/18_WOO_BLIWT_DAI_HOSPITAL.mp3', './sounds/18_woo_feel.mp3', './sounds/19_achtseen.mp3', './sounds/19_antibiotikums.mp3', './sounds/19_awendbroud.mp3', './sounds/19_bet_morgen.mp3', './sounds/19_december.mp3', './sounds/19_DËCEMBER.mp3', './sounds/19_FIJL.mp3', './sounds/19_GLITERLIJM.mp3', './sounds/19_helgeel.mp3', './sounds/19_kanst_duu_dat_taum_geschenk_inwikle.mp3', './sounds/19_kanst_duu_mij_dijn_telefonnumer_geewe.mp3', './sounds/19_Staiffåter.mp3', './sounds/19_woan.mp3', './sounds/19_WOO_BLIWT_DAI_DELEGACI.mp3', './sounds/1_Grootmuter.mp3', './sounds/1_HOP!.mp3', './sounds/1_hulp.mp3', './sounds/1_KAN_IK_MIJ_HIJR_HENSETE.mp3', './sounds/1_nuul.mp3', './sounds/1_roud.mp3', './sounds/1_SPAIK.mp3', './sounds/1_sundag.mp3', './sounds/1_SÜNDAG.mp3', './sounds/1_WANDTÅFELLÖSCHER.mp3', './sounds/1_WOO_BLIJWE_DAI_GESCHÄFTHÜÜSER.mp3', './sounds/1_woo_bliwt_dat_krankehuus.mp3', './sounds/20 AIN KWITUNG, TAUM GEFALE.mp3', './sounds/20_ain_beschijnung.mp3', './sounds/20_ain_beschijnung_taum_gefale.mp3', './sounds/20_AIN_UPWIJSUNG_TAUM_GEFALE.mp3', './sounds/20_ASCHIG.mp3', './sounds/20_BEHOOGÄX.mp3', './sounds/20_blaumetijd.mp3', './sounds/20_bust_duu_forfrijgt.mp3', './sounds/20_CIRKEL.mp3', './sounds/20_Fåter.mp3', './sounds/20_gaur_gluk.mp3', './sounds/20_insulin.mp3', './sounds/20_IS_DIJ_WAT.mp3', './sounds/20_nuintseen.mp3', './sounds/20_salad.mp3', './sounds/20_wonair.mp3', './sounds/21_aspirin.mp3', './sounds/21_GRIJS.mp3', './sounds/21_ik_bun.mp3', './sounds/21_kan_ik_dai_fiskalnot_bekoome.mp3', './sounds/21_KOMPUTATOR.mp3', './sounds/21_nuudel.mp3', './sounds/21_pass_up.mp3', './sounds/21_Prim.mp3', './sounds/21_SOMERTIJD-SOMER.mp3', './sounds/21_somertijd.mp3', './sounds/21_twansig.mp3', './sounds/21_wofon.mp3', './sounds/21_ÄX.mp3', './sounds/22 IK WIL DAT TRÖÖGBETÅLT HÄWE.mp3', './sounds/22_ainuntwansig.mp3', './sounds/22_Bruirerskind.mp3', './sounds/22_fruchtijd.mp3', './sounds/22_FRUCHTTIJD_HÄRWST.mp3', './sounds/22_glukwunsch.mp3', './sounds/22_ik_wil_troigbetalt_hawe.mp3', './sounds/22_KORREKTIV.mp3', './sounds/22_lerg_un_lous_ledig.mp3', './sounds/22_penicilin.mp3', './sounds/22_PURPUR.mp3', './sounds/22_rijs.mp3', './sounds/22_STAINHÅMER.mp3', './sounds/22_UNFORFRIJGT.mp3', './sounds/22_wofoir.mp3', './sounds/22_WOFOR.mp3', './sounds/23 IK WIL AIS SAIE.mp3', './sounds/23_blaumestof.mp3', './sounds/23_BLÖÖGPULVER.mp3', './sounds/23_DÜÜSTERGRUIN.mp3', './sounds/23_eiger.mp3', './sounds/23_gun_morgen.mp3', './sounds/23_HÅMER.mp3', './sounds/23_ik_wil_as_saie.mp3', './sounds/23_kultijd.mp3', './sounds/23_KULTIJD_WINTER.mp3', './sounds/23_ni_alain.mp3', './sounds/23_Swigermuter.mp3', './sounds/23_twaiuntwansig.mp3', './sounds/23_wohen.mp3', './sounds/23_WÖÖRBAUK.mp3', './sounds/24_dag.mp3', './sounds/24_draiuntwansig.mp3', './sounds/24_forfrijcht.mp3', './sounds/24_gun_dag.mp3', './sounds/24_hamburger.mp3', './sounds/24_koipe.mp3', './sounds/24_LÖÖRHÅMER.mp3', './sounds/24_roigewaidag.mp3', './sounds/24_STILET.mp3', './sounds/24_Swigerfåter.mp3', './sounds/24_woheer.mp3', './sounds/25 _FORKÖÖPE.mp3', './sounds/25_BAKBAND.mp3', './sounds/25_firuntwansig.mp3', './sounds/25_forkoipe.mp3', './sounds/25_gruinweesend.mp3', './sounds/25_gun_awend.mp3', './sounds/25_hals_entsundung.mp3', './sounds/25_MOTOORSÅG.mp3', './sounds/25_nacht.mp3', './sounds/25_Ururenkelkind.mp3', './sounds/25_Ururenkelskind.mp3', './sounds/25_UUTAINANER.mp3', './sounds/25_uutananer.mp3', './sounds/25_worum.mp3', './sounds/26_flasch.mp3', './sounds/26_fumwuntwansig.mp3', './sounds/26_FÜMWUNTWANSIG.mp3', './sounds/26_gun_nacht.mp3', './sounds/26_magewaidag.mp3', './sounds/26_prais.mp3', './sounds/26_SATS.mp3', './sounds/26_SCHÜP.mp3', './sounds/26_Ururgrootmuter.mp3', './sounds/26_week.mp3', './sounds/26_witkeirl.mp3', './sounds/26_wotau.mp3', './sounds/27_buukwaidag.mp3', './sounds/27_diskont.mp3', './sounds/27_froilig_geburtsdag.mp3', './sounds/27_KRIJT.mp3', './sounds/27_kum.mp3', './sounds/27_manat.mp3', './sounds/27_soxuntwansig.mp3', './sounds/27_SPITSHAK.mp3', './sounds/27_SÖXUNTWANSIG.mp3', './sounds/27_Ururgrootfåter.mp3', './sounds/27_witfruug.mp3', './sounds/27_woup.mp3', './sounds/28_diamant.mp3', './sounds/28_froilig_nij_jar.mp3', './sounds/28_glas.mp3', './sounds/28_IJSERHUUBEL.mp3', './sounds/28_jar.mp3', './sounds/28_JÅR.mp3', './sounds/28_KAN_IK_DIJ_BESUIKE.mp3', './sounds/28_sijbuntwansig.mp3', './sounds/28_taanewaidag.mp3', './sounds/28_Ururgrootülrer.mp3', './sounds/28_WASKRIJT.mp3', './sounds/28_woin.mp3', './sounds/29_achtuntwansig.mp3', './sounds/29_froilig_ousterfest.mp3', './sounds/29_GLOBUS.mp3', './sounds/29_handdauk.mp3', './sounds/29_jarseend.mp3', './sounds/29_LOOD.mp3', './sounds/29_oureentsundung.mp3', './sounds/29_Tante.mp3', './sounds/29_teler.mp3', './sounds/29_WILST_DUU_MIT_MIJ_FRIJGE.mp3', './sounds/29_woweegen.mp3', './sounds/2_ Ururenkelkind.mp3', './sounds/2_ain.mp3', './sounds/2_blag.mp3', './sounds/2_BLIJGSTIFTSPIPTSER_SPITSER.mp3', './sounds/2_DAT_IS_GAUD_DIJ_KENELËRE.mp3', './sounds/2_fuur.mp3', './sounds/2_FÜÜR.mp3', './sounds/2_Grootfåter.mp3', './sounds/2_ik_bruuk_aine_dokter.mp3', './sounds/2_KAN_IK_DIJ_GEDRÄNK_ANBAIRE.mp3', './sounds/2_mandag.mp3', './sounds/2_POTTANG.mp3', './sounds/30_froilig_wijnachte.mp3', './sounds/30_gabel.mp3', './sounds/30_HARK.mp3', './sounds/30_IK_BÜN_DIJ_SËR_DANKBÅR.mp3', './sounds/30_IK_KAN_DIJ_SËR_LIJRE.mp3', './sounds/30_jarhuunerd.mp3', './sounds/30_KLEM.mp3', './sounds/30_lipefarw.mp3', './sounds/30_nuinuntwansig.mp3', './sounds/30_ouresteeken.mp3', './sounds/30_Unkel.mp3', './sounds/31_CIRKULARSÅG.mp3', './sounds/31_draisig.mp3', './sounds/31_har.mp3', './sounds/31_jarduusend.mp3', './sounds/31_KLEMMASCCHIJN.mp3', './sounds/31_metser.mp3', './sounds/31_reistasch.mp3', './sounds/32_BLIJGSTIFT.mp3', './sounds/32_BREDSÅG.mp3', './sounds/32_firtsig.mp3', './sounds/32_kop.mp3', './sounds/32_leepel.mp3', './sounds/32_sahaltjar.mp3', './sounds/32_tasch.mp3', './sounds/33_buleflaisch.mp3', './sounds/33_BUNTEBLIJGSTIFT_FARWBLIJGSTIFT.mp3', './sounds/33_fuwtsig.mp3', './sounds/33_gesicht.mp3', './sounds/33_portmonai.mp3', './sounds/33_STIGSÅG.mp3', './sounds/33_stuun.mp3', './sounds/34_afneemsmaschijn.mp3', './sounds/34_bijf.mp3', './sounds/34_GESCHICHTEBAUK.mp3', './sounds/34_IJSERSÅG.mp3', './sounds/34_minut.mp3', './sounds/34_oug.mp3', './sounds/34_seechtsig.mp3', './sounds/35_BAUK.mp3', './sounds/35_computator.mp3', './sounds/35_FOIRSWANS.mp3', './sounds/35_huinerflaisch.mp3', './sounds/35_KOMPUTATOR.mp3', './sounds/35_our.mp3', './sounds/35_sekund.mp3', './sounds/35_sijbtsig.mp3', './sounds/36_aabel.mp3', './sounds/36_achtsig.mp3', './sounds/36_ARBELFLAISCH.mp3', './sounds/36_BIMESTER.mp3', './sounds/36_celular.mp3', './sounds/36_LEESBAUK.mp3', './sounds/36_muul.mp3', './sounds/36_SÜÜGEL.mp3', './sounds/37_armuur.mp3', './sounds/37_eend.mp3', './sounds/37_EENDEFLAISCH.mp3', './sounds/37_MARKIJRSTITF.mp3', './sounds/37_nuintsig.mp3', './sounds/37_SRUUWSTOK.mp3', './sounds/37_taane.mp3', './sounds/37_TEXTMARKER.mp3', './sounds/37_TRIMESTER.mp3', './sounds/38_DUTS.mp3', './sounds/38_gebrart_aabel.mp3', './sounds/38_GEBRÅRTARBEL.mp3', './sounds/38_huunerd.mp3', './sounds/38_klok.mp3', './sounds/38_KNIPTANG.mp3', './sounds/38_naas.mp3', './sounds/38_ORDNER.mp3', './sounds/39_DRUMSÅG.mp3', './sounds/39_duusend.mp3', './sounds/39_genik.mp3', './sounds/39_geschenk.mp3', './sounds/39_HALW DUTS.mp3', './sounds/39_PAPIJR.mp3', './sounds/39_presunt.mp3', './sounds/39_SCHINKEFLAISCH.mp3', './sounds/3_AMBUS.mp3', './sounds/3_DAT_IS_UK_GAUD_DIJ_KENELËRE.mp3', './sounds/3_dinsdag.mp3', './sounds/3_geel.mp3', './sounds/3_ik_bun_krank.mp3', './sounds/3_IK_DÄIR_GËRN_HENGÅE.mp3', './sounds/3_SPIND.mp3', './sounds/3_spitsbuub.mp3', './sounds/3_twai.mp3', './sounds/3_Urgrootmuter.mp3', './sounds/40_hals.mp3', './sounds/40_HANDBÅRER.mp3', './sounds/40_LOCHER.mp3', './sounds/40_raime.mp3', './sounds/40_ROOBA.mp3', './sounds/40_schapflaisch.mp3', './sounds/40_teigenduusend.mp3', './sounds/41_bikini.mp3', './sounds/41_harts.mp3', './sounds/41_HEKTAR.mp3', './sounds/41_huunerdduusend.mp3', './sounds/41_swijnflaisch.mp3', './sounds/41_TÅFELSTIFT.mp3', './sounds/42_ain miljon.mp3', './sounds/42_hand.mp3', './sounds/42_KILO.mp3', './sounds/42_salsijche.mp3', './sounds/42_SAUCISS.mp3', './sounds/42_SRIJWPLANK.mp3', './sounds/42_stawel.mp3', './sounds/43_airst.mp3', './sounds/43_arm.mp3', './sounds/43_flaisch.mp3', './sounds/43_GRAM.mp3', './sounds/43_PRÖÖV.mp3', './sounds/43_titeluwker.mp3', './sounds/44_armring.mp3', './sounds/44_finger.mp3', './sounds/44_HALW KILO.mp3', './sounds/44_HALW_KILO.mp3', './sounds/44_krap.mp3', './sounds/44_twait.mp3', './sounds/44_WITWANDTÅFEL.mp3', './sounds/45_drur.mp3', './sounds/45_fingernagel.mp3', './sounds/45_fisch.mp3', './sounds/45_LITER.mp3', './sounds/45_WANDTÅFEL.mp3', './sounds/45_winterjak.mp3', './sounds/46_borst.mp3', './sounds/46_DAIOORBUMELS.mp3', './sounds/46_dai_ourbumel.mp3', './sounds/46_firt.mp3', './sounds/46_KWART.mp3', './sounds/46_langust.mp3', './sounds/46_LINJÅL.mp3', './sounds/46_ourbumel.mp3', './sounds/47_ALKËR.mp3', './sounds/47_brile.mp3', './sounds/47_flusskrap.mp3', './sounds/47_fumwt.mp3', './sounds/47_huft.mp3', './sounds/47_WANDKLOK.mp3', './sounds/48_ALKËRSKASTE.mp3', './sounds/48_fruugesschau.mp3', './sounds/48_mag.mp3', './sounds/48_salmon.mp3', './sounds/48_soxt.mp3', './sounds/48_SÖXT.mp3', './sounds/48_TEXT.mp3', './sounds/49_kafe.mp3', './sounds/49_kuul.mp3', './sounds/49_leererjak.mp3', './sounds/49_MËTER.mp3', './sounds/49_SCHËR.mp3', './sounds/49_sijbend.mp3', './sounds/49_SIJBENT.mp3', './sounds/4_ANSRIJWSBLOK.mp3', './sounds/4_BUTELFOOS.mp3', './sounds/4_dait_mij_hijr_wai.mp3', './sounds/4_drai.mp3', './sounds/4_KAN_IK_DE_MENU_SAI_TAUM_GEFALE.mp3', './sounds/4_mirweek.mp3', './sounds/4_NË_DANKE_SCHÖÖN.mp3', './sounds/4_stop.mp3', './sounds/4_swart.mp3', './sounds/4_Urgrootfåter.mp3', './sounds/50_acht.mp3', './sounds/50_bair.mp3', './sounds/50_FARW_TINTE.mp3', './sounds/50_jeans.mp3', './sounds/50_KILOMËTER.mp3', './sounds/50_melk.mp3', './sounds/51_faut.mp3', './sounds/51_kuuchen.mp3', './sounds/51_nuind.mp3', './sounds/51_schau.mp3', './sounds/51_TON.mp3', './sounds/51_WINKELMEETER.mp3', './sounds/52_DIKTAD.mp3', './sounds/52_muskel.mp3', './sounds/52_naeeten.mp3', './sounds/52_seend.mp3', './sounds/52_stripeschau.mp3', './sounds/53_biskuit.mp3', './sounds/53_elwt.mp3', './sounds/53_fel.mp3', './sounds/53_SCHAULLËRER.mp3', './sounds/53_slape.mp3', './sounds/54_korper.mp3', './sounds/54_leererschau.mp3', './sounds/54_SCHAULLËRESCH.mp3', './sounds/54_sup.mp3', './sounds/54_twolwt.mp3', './sounds/54_TWÖLWT.mp3', './sounds/55_draitseend.mp3', './sounds/55_hoinig.mp3', './sounds/55_korterok.mp3', './sounds/55_ougenbran.mp3', './sounds/55_SCHAULEKIND.mp3', './sounds/56_firtseend.mp3', './sounds/56_keer.mp3', './sounds/56_KLASS.mp3', './sounds/56_ougendekel.mp3', './sounds/56_refrigerant.mp3', './sounds/57_fuwtseend.mp3', './sounds/57_house.mp3', './sounds/57_ougendekelshar.mp3', './sounds/57_PAUS.mp3', './sounds/57_saft.mp3', './sounds/58_fingerring.mp3', './sounds/58_knai.mp3', './sounds/58_seechtseend.mp3', './sounds/58_WÅTERFLASCH.mp3', './sounds/59_hemd.mp3', './sounds/59_SCHAULETASCH.mp3', './sounds/59_schuller.mp3', './sounds/59_sijbtseend.mp3', './sounds/5_DAT_IS_KAIR_PROBLEM.mp3', './sounds/5_dunerdag.mp3', './sounds/5_fair.mp3', './sounds/5_ga_weg.mp3', './sounds/5_ik_haw_hauste.mp3', './sounds/5_KAN_IK_DAT_SAIE.mp3', './sounds/5_SCHAULETASCH.mp3', './sounds/5_STEEKFOOS.mp3', './sounds/5_Urgrootülrer.mp3', './sounds/5_wit.mp3', './sounds/6 WAT FOR FARWE HÄST DUU.mp3', './sounds/60_achtseend.mp3', './sounds/60_buuk.mp3', './sounds/60_schau.mp3', './sounds/60_SCHAULEHOF.mp3', './sounds/61_nuintseend.mp3', './sounds/61_roige.mp3', './sounds/61_rok.mp3', './sounds/62_strump.mp3', './sounds/62_twansigst.mp3', './sounds/63 SÜNEBRILE.mp3', './sounds/63_draisigst.mp3', './sounds/63_sunbrile.mp3', './sounds/64_firtsigst.mp3', './sounds/64_krawat.mp3', './sounds/65_fuwtsigst.mp3', './sounds/65_uunertuug.mp3', './sounds/66_seechtsigst.mp3', './sounds/66_tuug.mp3', './sounds/67_haud.mp3', './sounds/67_sijbtsigst.mp3', './sounds/68_achtsigst.mp3', './sounds/68_muts.mp3', './sounds/69_barhanddauk.mp3', './sounds/69_nuinsigst.mp3', './sounds/6_BLIJGSTIFTETASCH.mp3', './sounds/6_fijw.mp3', './sounds/6_frijdag.mp3', './sounds/6_gruin.mp3', './sounds/6_ik_haw_doirfal.mp3', './sounds/6_IK_HÄW_DOIRFAL.mp3', './sounds/6_IK_HÄW_GROOT_LUST.mp3', './sounds/6_pass_up.mp3', './sounds/6_SRUUWETREKER.mp3', './sounds/6_Urenkelkind.mp3', './sounds/70_huunerdst.mp3', './sounds/70_slapkleid.mp3', './sounds/71_duusendst.mp3', './sounds/71_korthous.mp3', './sounds/72_kleid.mp3', './sounds/73_unerhous.mp3', './sounds/74_uunerhemd.mp3', './sounds/75_uunerrok.mp3', './sounds/76_leerermantel.mp3', './sounds/77 LANGMOOGIGHEMD.mp3', './sounds/77_LANGMOOCHIGHEMD.mp3', './sounds/78 KORTMOOGIGHEMD.mp3', './sounds/78_KORTMOOCHIGHEMD.mp3', './sounds/79_BETÅLE.mp3', './sounds/7_ales_gaud_mit_dij.mp3', './sounds/7_bruun.mp3', './sounds/7_ik_haw_feiwer.mp3', './sounds/7_IS_DAT_ALES_GAUD_MIT_DIJ.mp3', './sounds/7_KAN_IK_ANPASSE.mp3', './sounds/7_LÖSCHER.mp3', './sounds/7_MIJ_GÄIT_DAT_GAUD.mp3', './sounds/7_soss.mp3', './sounds/7_SRUUWSLOIDEL.mp3', './sounds/7_sunawend.mp3', './sounds/7_SUNÅWEND.mp3', './sounds/7_Swäägersch.mp3', './sounds/7_SÖSS.mp3', './sounds/80_BORGE.mp3', './sounds/8_DÖRW_IK_RINERKÅME.mp3', './sounds/8_guldig.mp3', './sounds/8_ik_haw_kopwaidag.mp3', './sounds/8_januar.mp3', './sounds/8_KAN_IK_RINER_KAME.mp3', './sounds/8_MIJ_GÄIT_DAT_NI_GAUD.mp3', './sounds/8_MUURKEL.mp3', './sounds/8_raup_ain_ambulans.mp3', './sounds/8_soiwen.mp3', './sounds/8_STAUL.mp3', './sounds/8_Swåger.mp3', './sounds/9 DAT PASST GAUD.mp3', './sounds/9_acht.mp3', './sounds/9_DAT_IS_KAIR_PROBLËM.mp3', './sounds/9_DUU_BÜST_SËR_FAIN.mp3', './sounds/9_februar.mp3', './sounds/9_HAK.mp3', './sounds/9_HEFT.mp3', './sounds/9_ik_haw_magewaidag.mp3', './sounds/9_KAIR_PROBLEM.mp3', './sounds/9_raup_aine_dokter.mp3', './sounds/9_silwern.mp3', './sounds/9_Swigersoin.mp3',
    './sounds/9_Swigersoon.mp3'
]

const version = 1.0
if (!localStorage.getItem("version") || parseFloat(localStorage.getItem("version")) < version) {
    for (const iterator of object) {
        addAudioToDB(iterator)
    }
    localStorage.setItem("version", version)
}

