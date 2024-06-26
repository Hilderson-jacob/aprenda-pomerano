IMAGE_PATH = "./images/resized_images/"
const elements_content = document.querySelector("#elements-content")

function estruture_data(jsondata) {
    menu_html = ""
    p = 0
    for (let i of jsondata) {
        menu_html += `  <a data-category="${i.categoria}" data-position="${p}" onclick="estruture_audio(this)">
                            <img alt="" src="${IMAGE_PATH + i.detalhes.imagem}">
                            <span><b>${i.categoria}</b></span>
                        </a>`
        p += 1
    }
    menu_html += "<a></a>"
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
                    console.log(path);
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

    document.getElementById("principal-nav").style.display = 'none'
}

document.getElementById("back-arrow").addEventListener("click", e => {
    modal.style.display = 'none'
    document.getElementById("principal-nav").style.display = 'flex'
})
document.getElementById("back-arrow-info").addEventListener("click", e => {
    document.getElementById("info-modal").style.display = 'none'
    document.getElementById("principal-nav").style.display = 'flex'
})
document.getElementById("info-app").addEventListener("click", e => {
    document.getElementById("info-modal").style.display = 'block'
    document.getElementById("principal-nav").style.display = 'none'
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
    '01_ja.mp3', '01_kanst_duu_mij_aine_restaurant_foirsteele.mp3', '02_aine_disch_for_twai_taum_gefale.mp3', '02_nei.mp3', '02_wonair_make_dai_up.mp3', '03_dankeschoin.mp3', '03_ik_har_geirn_aine_disch_dich_bijne_luuk.mp3', '03_sin_hijr.mp3', '04_ik_wul_koipe.mp3', '04_taum_gefale.mp3', '04_woo_is_dij_name.mp3', '05_ik_bun_ni_interessijrt.mp3', '05_mij_name_is.mp3', '05_wat_rekomendijrst_duu.mp3', '06_ik_eet_wat_duu_forlange_daist.mp3', '06_mak_taum_gefale.mp3', '06_woo_gait.mp3', '07_forgeew_mij.mp3', '07_lat_mij.mp3', '07_wat_is_dit.mp3', '08_duu_bust_seir_hubsch.mp3', '08_kan_ik_soone_teeler_forlange.mp3', '08_woo_is_dai_pruiwkamer.mp3', '09_ik_wul.mp3', '09_un_duu.mp3', '10 DAT PASST NI.mp3', '10_duu_bust_special.mp3', '10_GRÅRHAK.mp3', '10_ik_haw_kotst.mp3', '10_ik_wait_ni.mp3', '10_kan_ik_air_glas_water_drinke.mp3', '10_marts.mp3', '10_MÅLHEFT.mp3', '10_neegen.mp3', '10_ousterblag.mp3', '10_raup_dai_poliss.mp3', '10_Swester.mp3', '10_WOO_ULD_BÜST_DUU.mp3', '11_april.mp3', '11_DUU_BÜST_SËR_ATRAKTIV.mp3', '11_DËSTEL.mp3', '11_forstaist_duu_mij.mp3', '11_gaure_apetit.mp3', '11_Groottante.mp3', '11_ik_bun_forkult.mp3', '11_IK_BÜN..._JÅRE_ULD.mp3', '11_IK_BÜN_FORBIJSTERT.mp3', '11_IK_WIL_DIT_KÖÖPE.mp3', '11_KUUGELSRIJWER.mp3', '11_lilablag.mp3', '11_teigen.mp3', '12_Braurer.mp3', '12_dai_reeken_taum_gefale.mp3', '12_duu_hast_feele_charm.mp3', '12_elwen.mp3', '12_FARWSTIFT.mp3', '12_fon_woo_bust_duu.mp3', '12_helroud.mp3', '12_ik_forsta.mp3', '12_ik_haw_mijn_tasch_forlare.mp3', '12_IK_HÄW_SWÅRHËT_TAUM_LUFT_HÅLEN.mp3', '12_mai.mp3', '12_MAISTEL.mp3', '12_wat_kost_dat.mp3', '13_duusterblag.mp3', '13_Grootunkel.mp3', '13_ik_befijn_mij_duusch.mp3', '13_ik_bun_fon.mp3', '13_IK_FORNEEM_IRGENDWAT_OIWER_DIJ.mp3', '13_ik_forsta_ni.mp3', '13_IK_HÄW_MIJNE_PASSPORT_FORLÅRE.mp3', '13_juni.mp3', '13_kanst_duu_der_prais_srijwe.mp3', '13_kan_ik_mit_chek_betale.mp3', '13_SCHAULEDISCH.mp3', '13_twolw.mp3', '13_WINKEL.mp3', '14_CD.mp3', '14_dat_is_seir_duur.mp3', '14_draitseen.mp3', '14_DÅRFOR_NI.mp3', '14_FOOS.mp3', '14_helblag.mp3', '14_ik_bun.mp3', '14_IK_BÜN_BESTÅLE_WOORE.mp3', '14_ik_lijb_dij.mp3', '14_juli.mp3', '14_kan_ik_mit_kreditkarton_betale.mp3', '14_Staifmuter.mp3', '14_woo_woonst_duu.mp3', '15_august.mp3', '15_DREKEMER.mp3', '15_firtseen.mp3', '15_hartskrank.mp3', '15_helgruin.mp3', '15_ik_woon_in.mp3', '15_kanst_duu_mij_aine_diskont_geewe.mp3', '15_kanst_duu_mij_helpe.mp3', '15_kan_ik_dij_aine_puss_geewe.mp3', '15_Muter.mp3', '15_neeme_jij_blous_bargild_an.mp3', '15_S╙KEL.mp3', '15_wat.mp3', '16 KANST DUU MIJ AINE PLASTIKSAK GEEWE,TAUM GEFALE.mp3', '16_astmatisch.mp3', '16_fuwtseen.mp3', '16_geelroud.mp3', '16_hast_duu_aine_bruudman.mp3', '16_hast_duu_feel_foir.mp3', '16_HELP_MIJ!.mp3', '16_PAPIJRKLAMER.mp3', '16_september.mp3', '16_Staifswester_halwswester.mp3', '16_STÄMIJSER.mp3', '16_wat_fon.mp3', '16_wenig_eeten.mp3', '17_fruustuk.mp3', '17_hast_duu_ain_bruud.mp3', '17_hast_duu_andrer_optione.mp3', '17_IK_BRUUK_HÜLP.mp3', '17_LIJM.mp3', '17_oktober.mp3', '17_roudbruun.mp3', '17_Staifbraurer_halwbraurer.mp3', '17_SWUNGBÅRER.mp3', '17_woo.mp3', '17_woo_gaist_duu_hen.mp3', '18_bet_naher.mp3', '18_BUNTELIJM.mp3', '18_hast_duu_e_mail.mp3', '18_ik_haw_alergi_fon.mp3', '18_kanst_duu_mij_dat_inwikle.mp3', '18_mirdageeten.mp3', '18_RASPELFIJL.mp3', '18_Swigerdochter.mp3', '18_violeit.mp3', '18_WOO_BLIWT_DAI_HOSPITAL.mp3', '18_woo_feel.mp3', '19_achtseen.mp3', '19_antibiotikums.mp3', '19_awendbroud.mp3', '19_bet_morgen.mp3', '19_DËCEMBER.mp3', '19_FIJL.mp3', '19_GLITERLIJM.mp3', '19_helgeel.mp3', '19_kanst_duu_dat_taum_geschenk_inwikle.mp3', '19_kanst_duu_mij_dijn_telefonnumer_geewe.mp3', '19_Staiffåter.mp3', '19_woan.mp3', '19_WOO_BLIWT_DAI_DELEGACI.mp3', '1_Grootmuter.mp3', '1_HOP!.mp3', '1_hulp.mp3', '1_KAN_IK_MIJ_HIJR_HENSETE.mp3', '1_nuul.mp3', '1_roud.mp3', '1_SPAIK.mp3', '1_SÜNDAG.mp3', '1_WANDTÅFELLÖSCHER.mp3', '1_WOO_BLIJWE_DAI_GESCHÄFTHÜÜSER.mp3', '1_woo_bliwt_dat_krankehuus.mp3', '20 AIN KWITUNG, TAUM GEFALE.mp3', '20_ASCHIG.mp3', '20_BEHOOGÄX.mp3', '20_blaumetijd.mp3', '20_bust_duu_forfrijgt.mp3', '20_CIRKEL.mp3', '20_Fåter.mp3', '20_gaur_gluk.mp3', '20_insulin.mp3', '20_IS_DIJ_WAT.mp3', '20_nuintseen.mp3', '20_salad.mp3', '20_wonair.mp3', '21_aspirin.mp3', '21_GRIJS.mp3', '21_ik_bun.mp3', '21_kan_ik_dai_fiskalnot_bekoome.mp3', '21_KOMPUTATOR.mp3', '21_nuudel.mp3', '21_pass_up.mp3', '21_Prim.mp3', '21_SOMERTIJD-SOMER.mp3', '21_wofon.mp3', '21_ÄX.mp3', '22 IK WIL DAT TRÖÖGBETÅLT HÄWE.mp3', '22_Bruirerskind.mp3', '22_FRUCHTTIJD_HÄRWST.mp3', '22_glukwunsch.mp3', '22_KORREKTIV.mp3', '22_penicilin.mp3', '22_PURPUR.mp3', '22_rijs.mp3', '22_STAINHÅMER.mp3', '22_UNFORFRIJGT.mp3', '22_WOFOR.mp3', '23 IK WIL AIS SAIE.mp3', '23_BLÖÖGPULVER.mp3', '23_DÜÜSTERGRUIN.mp3', '23_eiger.mp3', '23_gun_morgen.mp3', '23_HÅMER.mp3', '23_kultijd.mp3', '23_ni_alain.mp3', '23_Swigermuter.mp3', '23_wohen.mp3', '23_WÖÖRBAUK.mp3', '24_dag.mp3', '24_forfrijcht.mp3', '24_gun_dag.mp3', '24_hamburger.mp3', '24_koipe.mp3', '24_LÖÖRHÅMER.mp3', '24_roigewaidag.mp3', '24_STILET.mp3', '24_Swigerfåter.mp3', '24_woheer.mp3', '25 _FORKÖÖPE.mp3', '25_BAKBAND.mp3', '25_gruinweesend.mp3', '25_gun_awend.mp3', '25_hals_entsundung.mp3', '25_MOTOORSÅG.mp3', '25_nacht.mp3', '25_Ururenkelskind.mp3', '25_UUTAINANER.mp3', '25_worum.mp3', '26_flasch.mp3', '26_FÜMWUNTWANSIG.mp3', '26_gun_nacht.mp3', '26_magewaidag.mp3', '26_prais.mp3', '26_SATS.mp3', '26_SCHÜP.mp3', '26_Ururgrootmuter.mp3', '26_week.mp3', '26_witkeirl.mp3', '26_wotau.mp3', '27_buukwaidag.mp3', '27_diskont.mp3', '27_froilig_geburtsdag.mp3', '27_KRIJT.mp3', '27_kum.mp3', '27_manat.mp3', '27_SPITSHAK.mp3', '27_SÖXUNTWANSIG.mp3', '27_Ururgrootfåter.mp3', '27_witfruug.mp3', '27_woup.mp3', '28_diamant.mp3', '28_froilig_nij_jar.mp3', '28_glas.mp3', '28_IJSERHUUBEL.mp3', '28_JÅR.mp3', '28_KAN_IK_DIJ_BESUIKE.mp3', '28_taanewaidag.mp3', '28_Ururgrootülrer.mp3', '28_WASKRIJT.mp3', '28_woin.mp3', '29_froilig_ousterfest.mp3', '29_GLOBUS.mp3', '29_handdauk.mp3', '29_jarseend.mp3', '29_LOOD.mp3', '29_oureentsundung.mp3', '29_Tante.mp3', '29_teler.mp3', '29_WILST_DUU_MIT_MIJ_FRIJGE.mp3', '29_woweegen.mp3', '2_ain.mp3', '2_blag.mp3', '2_BLIJGSTIFTSPIPTSER_SPITSER.mp3', '2_DAT_IS_GAUD_DIJ_KENELËRE.mp3', '2_FÜÜR.mp3', '2_Grootfåter.mp3', '2_ik_bruuk_aine_dokter.mp3', '2_KAN_IK_DIJ_GEDRÄNK_ANBAIRE.mp3', '2_mandag.mp3', '2_POTTANG.mp3', '30_froilig_wijnachte.mp3', '30_gabel.mp3', '30_HARK.mp3', '30_IK_BÜN_DIJ_SËR_DANKBÅR.mp3', '30_IK_KAN_DIJ_SËR_LIJRE.mp3', '30_jarhuunerd.mp3', '30_KLEM.mp3', '30_lipefarw.mp3', '30_ouresteeken.mp3', '30_Unkel.mp3', '31_CIRKULARSÅG.mp3', '31_draisig.mp3', '31_har.mp3', '31_jarduusend.mp3', '31_KLEMMASCCHIJN.mp3', '31_metser.mp3', '31_reistasch.mp3', '32_BLIJGSTIFT.mp3', '32_BREDSÅG.mp3', '32_firtsig.mp3', '32_kop.mp3', '32_leepel.mp3', '32_sahaltjar.mp3', '32_tasch.mp3', '33_buleflaisch.mp3', '33_BUNTEBLIJGSTIFT_FARWBLIJGSTIFT.mp3', '33_fuwtsig.mp3', '33_gesicht.mp3', '33_portmonai.mp3', '33_STIGSÅG.mp3', '33_stuun.mp3', '34_afneemsmaschijn.mp3', '34_bijf.mp3', '34_GESCHICHTEBAUK.mp3', '34_IJSERSÅG.mp3', '34_minut.mp3', '34_oug.mp3', '35_BAUK.mp3', '35_FOIRSWANS.mp3', '35_huinerflaisch.mp3', '35_KOMPUTATOR.mp3', '35_our.mp3', '35_sekund.mp3', '36_achtsig.mp3', '36_ARBELFLAISCH.mp3', '36_BIMESTER.mp3', '36_celular.mp3', '36_LEESBAUK.mp3', '36_muul.mp3', '36_SÜÜGEL.mp3', '37_armuur.mp3', '37_EENDEFLAISCH.mp3', '37_nuintsig.mp3', '37_SRUUWSTOK.mp3', '37_taane.mp3', '37_TEXTMARKER.mp3', '37_TRIMESTER.mp3', '38_DUTS.mp3', '38_GEBRÅRTARBEL.mp3', '38_huunerd.mp3', '38_klok.mp3', '38_KNIPTANG.mp3', '38_naas.mp3', '38_ORDNER.mp3', '39_DRUMSÅG.mp3', '39_duusend.mp3', '39_genik.mp3', '39_geschenk.mp3', '39_HALW DUTS.mp3', '39_PAPIJR.mp3', '39_SCHINKEFLAISCH.mp3', '3_AMBUS.mp3', '3_DAT_IS_UK_GAUD_DIJ_KENELËRE.mp3', '3_dinsdag.mp3', '3_geel.mp3', '3_ik_bun_krank.mp3', '3_IK_DÄIR_GËRN_HENGÅE.mp3', '3_SPIND.mp3', '3_spitsbuub.mp3', '3_twai.mp3', '3_Urgrootmuter.mp3', '40_hals.mp3', '40_HANDBÅRER.mp3', '40_LOCHER.mp3', '40_raime.mp3', '40_ROOBA.mp3', '40_schapflaisch.mp3', '40_teigenduusend.mp3', '41_bikini.mp3', '41_harts.mp3', '41_HEKTAR.mp3', '41_huunerdduusend.mp3', '41_swijnflaisch.mp3', '41_TÅFELSTIFT.mp3', '42_ain miljon.mp3', '42_hand.mp3', '42_KILO.mp3', '42_SAUCISS.mp3', '42_SRIJWPLANK.mp3', '42_stawel.mp3', '43_airst.mp3', '43_arm.mp3', '43_flaisch.mp3', '43_GRAM.mp3', '43_PRÖÖV.mp3', '43_titeluwker.mp3', '44_armring.mp3', '44_finger.mp3', '44_HALW_KILO.mp3', '44_krap.mp3', '44_twait.mp3', '44_WITWANDTÅFEL.mp3', '45_drur.mp3', '45_fingernagel.mp3', '45_fisch.mp3', '45_LITER.mp3', '45_WANDTÅFEL.mp3', '45_winterjak.mp3', '46_borst.mp3', '46_DAIOORBUMELS.mp3', '46_firt.mp3', '46_KWART.mp3', '46_langust.mp3', '46_LINJÅL.mp3', '47_ALKËR.mp3', '47_brile.mp3', '47_flusskrap.mp3', '47_fumwt.mp3', '47_huft.mp3', '47_WANDKLOK.mp3', '48_ALKËRSKASTE.mp3', '48_fruugesschau.mp3', '48_mag.mp3', '48_salmon.mp3', '48_SÖXT.mp3', '48_TEXT.mp3', '49_kafe.mp3', '49_kuul.mp3', '49_leererjak.mp3', '49_MËTER.mp3', '49_SCHËR.mp3', '49_SIJBENT.mp3', '4_ANSRIJWSBLOK.mp3', '4_BUTELFOOS.mp3', '4_dait_mij_hijr_wai.mp3', '4_drai.mp3', '4_KAN_IK_DE_MENU_SAI_TAUM_GEFALE.mp3', '4_mirweek.mp3', '4_NË_DANKE_SCHÖÖN.mp3', '4_stop.mp3', '4_swart.mp3', '4_Urgrootfåter.mp3', '50_acht.mp3', '50_bair.mp3', '50_FARW_TINTE.mp3', '50_jeans.mp3', '50_KILOMËTER.mp3', '50_melk.mp3', '51_faut.mp3', '51_kuuchen.mp3', '51_nuind.mp3', '51_schau.mp3', '51_TON.mp3', '51_WINKELMEETER.mp3', '52_DIKTAD.mp3', '52_muskel.mp3', '52_naeeten.mp3', '52_seend.mp3', '52_stripeschau.mp3', '53_biskuit.mp3', '53_elwt.mp3', '53_fel.mp3', '53_SCHAULLËRER.mp3', '53_slape.mp3', '54_korper.mp3', '54_leererschau.mp3', '54_SCHAULLËRESCH.mp3', '54_sup.mp3', '54_TWÖLWT.mp3', '55_draitseend.mp3', '55_hoinig.mp3', '55_korterok.mp3', '55_ougenbran.mp3', '55_SCHAULEKIND.mp3', '56_firtseend.mp3', '56_keer.mp3', '56_KLASS.mp3', '56_ougendekel.mp3', '56_refrigerant.mp3', '57_fuwtseend.mp3', '57_house.mp3', '57_ougendekelshar.mp3', '57_PAUS.mp3', '57_saft.mp3', '58_fingerring.mp3', '58_knai.mp3', '58_seechtseend.mp3', '58_WÅTERFLASCH.mp3', '59_hemd.mp3', '59_SCHAULETASCH.mp3', '59_schuller.mp3', '59_sijbtseend.mp3', '5_DAT_IS_KAIR_PROBLEM.mp3', '5_dunerdag.mp3', '5_fair.mp3', '5_ga_weg.mp3', '5_ik_haw_hauste.mp3', '5_KAN_IK_DAT_SAIE.mp3', '5_SCHAULETASCH.mp3', '5_STEEKFOOS.mp3', '5_Urgrootülrer.mp3', '5_wit.mp3', '6 WAT FOR FARWE HÄST DUU.mp3', '60_achtseend.mp3', '60_buuk.mp3', '60_schau.mp3', '60_SCHAULEHOF.mp3', '61_nuintseend.mp3', '61_roige.mp3', '61_rok.mp3', '62_strump.mp3', '62_twansigst.mp3', '63 SÜNEBRILE.mp3', '63_draisigst.mp3', '64_firtsigst.mp3', '64_krawat.mp3', '65_fuwtsigst.mp3', '65_uunertuug.mp3', '66_seechtsigst.mp3', '66_tuug.mp3', '67_haud.mp3', '67_sijbtsigst.mp3', '68_achtsigst.mp3', '68_muts.mp3', '69_barhanddauk.mp3', '69_nuinsigst.mp3', '6_BLIJGSTIFTETASCH.mp3', '6_fijw.mp3', '6_frijdag.mp3', '6_gruin.mp3', '6_IK_HÄW_DOIRFAL.mp3', '6_IK_HÄW_GROOT_LUST.mp3', '6_pass_up.mp3', '6_SRUUWETREKER.mp3', '6_Urenkelkind.mp3', '70_huunerdst.mp3', '70_slapkleid.mp3', '71_duusendst.mp3', '71_korthous.mp3', '72_kleid.mp3', '73_unerhous.mp3', '74_uunerhemd.mp3', '75_uunerrok.mp3', '76_leerermantel.mp3', '77 LANGMOOGIGHEMD.mp3', '78 KORTMOOGIGHEMD.mp3', '79_BETÅLE.mp3', '7_bruun.mp3', '7_ik_haw_feiwer.mp3', '7_IS_DAT_ALES_GAUD_MIT_DIJ.mp3', '7_KAN_IK_ANPASSE.mp3', '7_LÖSCHER.mp3', '7_MIJ_GÄIT_DAT_GAUD.mp3', '7_SRUUWSLOIDEL.mp3', '7_SUNÅWEND.mp3', '7_Swäägersch.mp3', '7_SÖSS.mp3', '80_BORGE.mp3', '8_DÖRW_IK_RINERKÅME.mp3', '8_guldig.mp3', '8_ik_haw_kopwaidag.mp3', '8_januar.mp3', '8_MIJ_GÄIT_DAT_NI_GAUD.mp3', '8_MUURKEL.mp3', '8_raup_ain_ambulans.mp3', '8_STAUL.mp3', '8_Swåger.mp3', '9 DAT PASST GAUD.mp3', '9_acht.mp3', '9_DAT_IS_KAIR_PROBLËM.mp3', '9_DUU_BÜST_SËR_FAIN.mp3', '9_februar.mp3', '9_HAK.mp3', '9_HEFT.mp3', '9_ik_haw_magewaidag.mp3', '9_raup_aine_dokter.mp3', '9_Swigersoon.mp3'

]

const version = 1.5
async function atualizar_audios() {
    if (!localStorage.getItem("version") || parseFloat(localStorage.getItem("version")) < version) {

        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            console.log('Todos os caches foram limpos.');
        });
    
        console.log("Aguarde o dowload do conteudo");
        for (const iterator of object) {
            await addAudioToDB("./sounds/"+iterator)
        }
        console.log("Download concluido");
        localStorage.setItem("version", version)
    }
}
atualizar_audios()

