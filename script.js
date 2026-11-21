/**
 * ==============================================================
 * VOCAB ARCADE: DUAL LANGUAGE WORD CONNECT & LEARNING HUB
 * Master Production Script (script.js)
 * 
 * Major Features & Clean Restoration:
 * 1. Default Cool Dark Blue & Deep Black Palette (#0a0e17 / #151e33).
 * 2. Animated Gems Count-up: Smoothly animates numbers with a pulse scale effect.
 * 3. Music/Song toggle completely removed from header.
 * 4. Zero Native Browser Alerts: Uses CustomUI.alert, confirm, and toast.
 * 5. Advanced Tebak Gambar:
 *    - 4 Difficulty Tiers: Easy, Normal, Hard, Extreme.
 *    - Visual Rebus Puzzle Mechanics: Multiple images with strikethrough letters.
 *    - Direct 'Enter' key submission support.
 * 6. Separated Background Archives: Independent progress & unlocks for
 *    Bahasa Indonesia and English modes.
 * 7. Dual Input & Seamless Line Connecting (Tap-to-Connect + Smooth Drag).
 * 8. Web Audio API Synthesizer & SpeechSynthesis TTS (id-ID & en-US).
 * 9. Truly Randomized Daily Quiz (A, B, C, D interchangeable).
 * 10. 3-Tier Prestigious Certificates & Fireworks Celebration.
 * ==============================================================
 */

(function () {
    'use strict';

    // ==========================================
    // 1. CUSTOM MODAL & TOAST NOTIFICATION SYSTEM
    // (Zero Native Browser Alerts or Confirms)
    // ==========================================
    const CustomUI = {
        toast(message, type = 'info') {
            const container = document.getElementById('toast-container');
            if (!container) return;
            const toast = document.createElement('div');
            toast.className = `toast-message ${type}`;
            toast.textContent = message;
            container.appendChild(toast);
            setTimeout(() => {
                toast.remove();
            }, 3000);
        },

        alert(message, title = 'Pemberitahuan', icon = '💡') {
            return new Promise((resolve) => {
                const overlay = document.getElementById('custom-modal-overlay');
                const titleEl = document.getElementById('custom-modal-title');
                const msgEl = document.getElementById('custom-modal-msg');
                const iconEl = document.getElementById('custom-modal-icon');
                const actionsEl = document.getElementById('custom-modal-actions');

                titleEl.textContent = title;
                msgEl.textContent = message;
                iconEl.textContent = icon;

                actionsEl.innerHTML = '';
                const okBtn = document.createElement('button');
                okBtn.className = 'btn-primary';
                okBtn.textContent = 'OK';
                okBtn.onclick = () => {
                    overlay.classList.remove('show');
                    resolve(true);
                };
                actionsEl.appendChild(okBtn);

                overlay.classList.add('show');
                okBtn.focus();
            });
        },

    confirm(message, title = 'Konfirmasi', icon = '❓') {
            return new Promise((resolve) => {
                const overlay = document.getElementById('custom-modal-overlay');
                const titleEl = document.getElementById('custom-modal-title');
                const msgEl = document.getElementById('custom-modal-msg');
                const iconEl = document.getElementById('custom-modal-icon');
                const actionsEl = document.getElementById('custom-modal-actions');

                titleEl.textContent = title;
                msgEl.textContent = message;
                iconEl.textContent = icon;

                actionsEl.innerHTML = '';

                const cancelBtn = document.createElement('button');
                cancelBtn.className = 'btn-secondary';
                cancelBtn.textContent = 'Batal';
                cancelBtn.onclick = () => {
                    overlay.classList.remove('show');
                    resolve(false);
                };

                const okBtn = document.createElement('button');
                okBtn.className = 'btn-primary';
                okBtn.textContent = 'Ya, Lanjutkan';
                okBtn.onclick = () => {
                    overlay.classList.remove('show');
                    resolve(true);
                };

                actionsEl.appendChild(cancelBtn);
                actionsEl.appendChild(okBtn);

                overlay.classList.add('show');
                okBtn.focus();
            });
        }
    };

    // ==========================================
    // 2. AUDIO & TEXT-TO-SPEECH (TTS) ENGINE
    // ==========================================
    class SoundEngine {
        constructor() {
            this.ctx = null;
            this.muted = false;
            this.synth = window.speechSynthesis;
            this.voiceId = null;
            this.voiceEn = null;

            if (this.synth) {
                this.loadVoices();
                if (speechSynthesis.onvoiceschanged !== undefined) {
                    speechSynthesis.onvoiceschanged = () => this.loadVoices();
                }
            }
        }

        initContext() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioCtx();
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }

        loadVoices() {
            if (!this.synth) return;
            const voices = this.synth.getVoices();
            this.voiceId = voices.find(v => v.lang.startsWith('id') || v.lang.includes('ID')) || null;
            this.voiceEn = voices.find(v => (v.lang.startsWith('en') || v.lang.includes('US') || v.lang.includes('GB')) && !v.name.includes('Google')) 
                         || voices.find(v => v.lang.startsWith('en')) || null;
        }

        toggleMute() {
            this.muted = !this.muted;
            return this.muted;
        }

        playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
            if (this.muted) return;
            try {
                this.initContext();
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            } catch (e) {}
        }

        playSelect() {
            this.playTone(523.25, 'triangle', 0.08, 0.1);
        }

        playLetterConnect(index = 0) {
            const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
            const freq = scale[Math.min(index, scale.length - 1)];
            this.playTone(freq, 'sine', 0.11, 0.14);
        }

        playWordSuccess() {
            if (this.muted) return;
            try {
                this.initContext();
                const now = this.ctx.currentTime;
                const chords = [523.25, 659.25, 783.99, 1046.50];
                chords.forEach((freq, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.06);
                    gain.gain.setValueAtTime(0.18, now + idx * 0.06);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + idx * 0.06);
                    osc.stop(now + idx * 0.06 + 0.25);
                });
            } catch (e) {}
        }

        playBonusWord() {
            if (this.muted) return;
            try {
                this.initContext();
                const now = this.ctx.currentTime;
                [440, 554.37, 659.25, 880].forEach((freq, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.05);
                    gain.gain.setValueAtTime(0.08, now + idx * 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.18);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + idx * 0.05);
                    osc.stop(now + idx * 0.05 + 0.18);
                });
            } catch (e) {}
        }

        playGemCollect() {
            if (this.muted) return;
            try {
                this.initContext();
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(987.77, now);
                osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.2);
            } catch (e) {}
        }

        playError() {
            if (this.muted) return;
            try {
                this.initContext();
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(160, now);
                osc.frequency.setValueAtTime(130, now + 0.08);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.2);
            } catch (e) {}
        }

        playShuffle() {
            if (this.muted) return;
            try {
                this.initContext();
                const now = this.ctx.currentTime;
                [440, 554.37, 659.25, 880, 1046.5].forEach((freq, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.04);
                    gain.gain.setValueAtTime(0.12, now + idx * 0.04);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.12);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + idx * 0.04);
                    osc.stop(now + idx * 0.04 + 0.12);
                });
            } catch (e) {}
        }

        playLevelClear() {
            if (this.muted) return;
            try {
                this.initContext();
                const notes = [392.00, 523.25, 659.25, 783.99, 1046.50];
                const now = this.ctx.currentTime;
                notes.forEach((freq, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.1);
                    gain.gain.setValueAtTime(0.2, now + idx * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.4);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + idx * 0.1);
                    osc.stop(now + idx * 0.1 + 0.4);
                });
            } catch (e) {}
        }

        playGrandFanfare() {
            if (this.muted) return;
            try {
                this.initContext();
                const notes = [
                    { f: 523.25, t: 0, d: 0.15 },
                    { f: 523.25, t: 0.15, d: 0.15 },
                    { f: 523.25, t: 0.30, d: 0.15 },
                    { f: 659.25, t: 0.45, d: 0.35 },
                    { f: 783.99, t: 0.80, d: 0.25 },
                    { f: 1046.50, t: 1.05, d: 0.7 }
                ];
                const now = this.ctx.currentTime;
                notes.forEach(n => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(n.f, now + n.t);
                    gain.gain.setValueAtTime(0.18, now + n.t);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + n.t + n.d);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + n.t);
                    osc.stop(now + n.t + n.d);
                });
            } catch (e) {}
        }

        speak(text, lang = 'id') {
            if (this.muted || !this.synth) return;
            try {
                this.initContext();
                this.synth.cancel();

                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 0.95;
                utterance.pitch = 1.02;

                if (lang === 'id' || lang === 'id-ID') {
                    utterance.lang = 'id-ID';
                    if (this.voiceId) utterance.voice = this.voiceId;
                } else {
                    utterance.lang = 'en-US';
                    if (this.voiceEn) utterance.voice = this.voiceEn;
                }

                this.synth.speak(utterance);
            } catch (err) {
                console.warn('TTS speak error:', err);
            }
        }
    }

    const Sound = new SoundEngine();

    // ==========================================
    // 3. MASTER DATASET (100 ID + 100 EN)
    // ==========================================
    const ID_MASTER_LEVELS = [
        { r: "PELANGI", w: ["PELANGI", "PANEL", "PLANG", "PALE"], d: "Lengkung warna-warni di langit akibat pembiasan sinar matahari." },
        { r: "MENTARI", w: ["MENTARI", "TERIMA", "MITRA", "TENAR"], d: "Matahari pembawa terang dan kehangatan di siang hari." },
        { r: "BINTANG", w: ["BINTANG", "BAGAN", "BIANG", "BANGI"], d: "Benda langit pemancar cahaya alami di angkasa raya." },
        { r: "SAMUDRA", w: ["SAMUDRA", "DAMAR", "SARDA", "MUARA"], d: "Lautan luas membentang menyatukan benua dan kepulauan." },
        { r: "PUSTAKA", w: ["PUSTAKA", "KASTA", "PAKAT", "SUAKA"], d: "Koleksi buku sumber kearifan dan khazanah pengetahuan." },
        { r: "SEKOLAH", w: ["SEKOLAH", "LEKAS", "SOLEH", "KOLAS"], d: "Wahana mulia menempa akhlak budi dan ilmu pengetahuan." },
        { r: "LENTERA", w: ["LENTERA", "TERANG", "TELAR", "NETRA"], d: "Pelita pembimbing arah dalam kegelapan malam." },
        { r: "MAHAKARYA", w: ["MAHAKARYA", "KARYA", "MARAH", "KAMAR"], d: "Karya seni agung monumental buah cipta anak bangsa." },
        { r: "NUSANTARA", w: ["NUSANTARA", "ANTARA", "SATUAN", "RANTAS"], d: "Sebutan kepulauan tanah air tercinta dari Sabang sampai Merauke." },
        { r: "KSATRIA", w: ["KSATRIA", "SATRIA", "TIKRA", "TARA"], d: "Jiwa ksatria gagah berani pelindung kebenaran dan keadilan." },
        { r: "HARMONI", w: ["HARMONI", "ROMAN", "ROHANI", "IRAMA"], d: "Keselarasan nada, rasa, dan keindahan dalam kehidupan." },
        { r: "SEMESTA", w: ["SEMESTA", "SESAT", "MASET", "SEMAI"], d: "Seluruh jagat raya ciptaan Tuhan Yang Maha Esa." },
        { r: "BERDIKARI", w: ["BERDIKARI", "DERIK", "BEDAK", "KREDIT"], d: "Berdiri di atas kaki sendiri dengan penuh kedaulatan." },
        { r: "PANCASILA", w: ["PANCASILA", "SALIN", "LIPAN", "PANAS"], d: "Dasar falsafah luhur landasan pemersatu bangsa Indonesia." },
        { r: "CERDAS", w: ["CERDAS", "DERAS", "REDA", "SADAR"], d: "Ketajaman budi pekerti dan keluasan wawasan berpikir." },
        { r: "CAHAYA", w: ["CAHAYA", "ACAH", "AYAH", "HAWA"], d: "Penerang gulita penunjuk jalan kebenaran." },
        { r: "GOTONG", w: ["GOTONG", "TONG", "GONG", "TOGO"], d: "Semangat kebersamaan bahu-membahu dalam gotong royong." },
        { r: "AMANAH", w: ["AMANAH", "AMAN", "HAMA", "NAMA"], d: "Tanggung jawab mulia yang diemban dengan ketulusan." },
        { r: "WAWASAN", w: ["WAWASAN", "AWAS", "SAWA", "NAWA"], d: "Cakrawala cara pandang luas menyeluruh mengenai nusantara." },
        { r: "BHINNEKA", w: ["BHINNEKA", "ANEKA", "NIKAH", "BIHIN"], d: "Keberagaman suku dan budaya dalam persatuan yang utuh." },
        { r: "CENDRAWASIH", w: ["CENDRA", "WARIS", "DRAH", "SIWA"], d: "Burung surga elok nan langka lambang keelokan Papua." },
        { r: "KOMODO", w: ["KOMODO", "MOKO", "MODO", "DOKO"], d: "Fauna purba perkasa kebanggaan Nusa Tenggara Timur." },
        { r: "ANGKLUNG", w: ["ANGKLUNG", "KULANG", "ALUN", "ULANG"], d: "Alat musik bambu harmonis warisan budaya Sunda." },
        { r: "GAMELAN", w: ["GAMELAN", "MEGAN", "LANGEN", "MALAN"], d: "Alunan orkestra tradisional penuh filosofi dan kedamaian." },
        { r: "WAYANG", w: ["WAYANG", "AWANG", "NYAWA", "WANG"], d: "Seni tradisi adiluhung sarat wejangan kearifan hidup." },
        { r: "KERIS", w: ["KERIS", "SERIK", "RESI", "EKSI"], d: "Tosan aji senjata pusaka warisan peradaban leluhur." },
        { r: "BATIK", w: ["BATIK", "BAKTI", "KITA", "IKAT"], d: "Kain motif luhur maha karya warisan budaya kemanusiaan." },
        { r: "MERDEKA", w: ["MERDEKA", "KADER", "MEKAR", "REKAM"], d: "Kedaulatan sejati bebas dari segala belenggu penjajahan." },
        { r: "JUARA", w: ["JUARA", "RAJA", "AJAR", "UJAR"], d: "Pemenang sejati yang gigih pantang menyerah." },
        { r: "KELUARGA", w: ["KELUARGA", "KELUAR", "LAGU", "RAGU"], d: "Tempat bernaung penuh kasih sayang dan kehangatan." },
        { r: "SAHABAT", w: ["SAHABAT", "BASAH", "TABAH", "SABAT"], d: "Kawan setia yang mendampingi di kala suka dan duka." },
        { r: "GEMBIRA", w: ["GEMBIRA", "BAGER", "RAGI", "MEGA"], d: "Rasa bahagia penuh suka cita memancar dari hati." },
        { r: "WAKTU", w: ["WAKTU", "KAWAT", "KUAT", "KUTU"], d: "Detik berharga yang terus bergulir menemani perjuangan." },
        { r: "PANDAI", w: ["PANDAI", "DINAP", "NADI", "DINA"], d: "Kecakapan tinggi dalam menguasai ragam kepandaian." },
        { r: "PESONA", w: ["PESONA", "PANEN", "SOPAN", "PENA"], d: "Daya tarik memikat elok dipandang mata." },
        { r: "KENCANA", w: ["KENCANA", "CANA", "KANAN", "ANCA"], d: "Kilau keemasan melambangkan kejayaan dan kemakmuran." },
        { r: "SELAMAT", w: ["SELAMAT", "SELAT", "LAMAT", "ASAL"], d: "Kesejahteraan dan kedamaian hidup sentosa." },
        { r: "KEMBARA", w: ["KEMBARA", "KEMBAR", "RAMBA", "BARA"], d: "Pengembaraan mencari ilmu dan pengalaman berharga." },
        { r: "SEMANGAT", w: ["SEMANGAT", "MANGAT", "GATAS", "TANG"], d: "Daya dorong membara menggapai cita-cita mulia." },
        { r: "PERTIWI", w: ["PERTIWI", "TIWI", "PETIR", "TRIT"], d: "Bumi pertiwi tanah tumpah darah tempat berpijak." },
        { r: "PRASETYA", w: ["PRASETYA", "PESTA", "SERAT", "PASAT"], d: "Janji teguh setia mengabdi pada bangsa dan negara." },
        { r: "MAHKOTA", w: ["MAHKOTA", "KOTAH", "HAKAM", "TAMAK"], d: "Lambang kemuliaan dan kehormatan para pemimpin." },
        { r: "GELORA", w: ["GELORA", "LOGAR", "LEGA", "ORAK"], d: "Gelombang antusiasme tinggi membakar sanubari." },
        { r: "CEMERLANG", w: ["CEMERLANG", "ELANG", "MERAN", "RELANG"], d: "Prestasi bersinar cemerlang membanggakan keluarga." },
        { r: "JELAJAH", w: ["JELAJAH", "JALAH", "LEJAH", "JAHA"], d: "Penjelajahan membuka tabir wawasan baru di pelosok negeri." },
        { r: "SENJA", w: ["SENJA", "JENA", "ASEN", "JANE"], d: "Keanggunan lembayung fajar sore menjelang malam." },
        { r: "FAJAR", w: ["FAJAR", "JARA", "RAFA", "ARFA"], d: "Terbit fajar menyingsing harapan baru di pagi hari." },
        { r: "RANCAK", w: ["RANCAK", "CARAK", "RAKNA", "CANK"], d: "Irama dinamis lincah penuh keceriaan budaya." },
        { r: "PINTAR", w: ["PINTAR", "RATIN", "TAPIR", "RITAN"], d: "Kepiawaian akal budi menyelesaikan ragam persoalan." },
        { r: "SEJATI", w: ["SEJATI", "JATI", "TASI", "SITA"], d: "Ketulusan hakiki murni tanpa pamrih." },
        { r: "KASIH", w: ["KASIH", "KISAH", "SAKHI", "HIKAS"], d: "Cinta kasih tanpa batas mengikat rasa persaudaraan." },
        { r: "BATU", w: ["BATU", "BUAT", "BAUT", "BUTA"], d: "Keteguhan tekad kokoh laksana batu karang." },
        { r: "MAKAN", w: ["MAKAN", "MAKNA", "KAMA", "MANA"], d: "Menikmati santapan rezeki berkah dan bersyukur." },
        { r: "PASAR", w: ["PASAR", "PARAS", "SAPAR", "RASA"], d: "Pusat niaga perputaran ekonomi rakyat berkeadilan." },
        { r: "PINTU", w: ["PINTU", "PUTIN", "TIPU", "PUNIT"], d: "Gerbang pembuka kesempatan menggapai impian masa depan." },
        { r: "TANAH", w: ["TANAH", "TAHAN", "NAHAT", "ANTA"], d: "Bumi subur makmur tempat berpijak dan berkarya." },
        { r: "RUMAH", w: ["RUMAH", "HARUM", "MURAH", "MARU"], d: "Tempat pulang melepas lelah penuh kedamaian." },
        { r: "SURGA", w: ["SURGA", "SUGAR", "RAGUS", "AGUS"], d: "Keindahan paripurna kebahagiaan sejati nan abadi." },
        { r: "KAPAL", w: ["KAPAL", "PALAK", "PAKAL", "LAKAP"], d: "Bahtera penjelajah mengarungi samudra nusantara." },
        { r: "POHON", w: ["POHON", "HONOP", "PONO", "NOPO"], d: "Rindang pepohonan paru-paru bumi sumber oksigen." },
        { r: "BUNGA", w: ["BUNGA", "GUBAN", "UBAN", "GUNA"], d: "Mekarnya kelopak wangi semerbak menghias taman." },
        { r: "HUJAN", w: ["HUJAN", "JAHUN", "JANU", "JUHA"], d: "Rahmat tetesan air penyejuk bumi yang tandus." },
        { r: "ANGIN", w: ["ANGIN", "NAGIN", "GIAN", "NINA"], d: "Semilir sejuk hembusan angin membawa kesegaran." },
        { r: "KOTA", w: ["KOTA", "OTAK", "TOKA", "KATO"], d: "Pusat kemajuan peradaban modern dan teknologi." },
        { r: "DESA", w: ["DESA", "SEDA", "ADES", "DASE"], d: "Kedamaian alam pedesaan guyub rukun penuh keasrian." },
        { r: "GUNUNG", w: ["GUNUNG", "NUGUNG", "UNGU", "GUGU"], d: "Puncak megah menjulang tinggi menembus awan." },
        { r: "LAUT", w: ["LAUT", "ULAT", "ALUT", "TULA"], d: "Hamparan biru luas penyimpan kekayaan hayati maritim." },
        { r: "SUNGAI", w: ["SUNGAI", "USANG", "SIANG", "SAING"], d: "Aliran air jernih pembawa kehidupan ke lembah." },
        { r: "PULAU", w: ["PULAU", "LUAP", "ALUP", "PULA"], d: "Gugusan daratan permata khatulistiwa zamrud nusantara." },
        { r: "LEMBAH", w: ["LEMBAH", "BELAH", "LEBAH", "HAMLE"], d: "Hamparan hijau subur di antara lereng perbukitan." },
        { r: "DANAU", w: ["DANAU", "ANDAU", "DANA", "ADUN"], d: "Ketenangan telaga jernih mencerminkan birunya langit." },
        { r: "HUTAN", w: ["HUTAN", "TAHUN", "TUHAN", "UTAN"], d: "Kawasan rimba hijau penjaga keseimbangan ekosistem bumi." },
        { r: "SAWAH", w: ["SAWAH", "HAWAS", "SAHA", "WASA"], d: "Hamparan padi menguning keemasan siap panen." },
        { r: "PASIR", w: ["PASIR", "PARIS", "ARSIP", "PISAR"], d: "Halusnya butiran pasir di tepian pesisir pantai." },
        { r: "OMBAK", w: ["OMBAK", "BOKAM", "KOBA", "MOKB"], d: "Deburan riak gelombang laut menghantam karang." },
        { r: "KARANG", w: ["KARANG", "RANGKA", "ANGKA", "ARANG"], d: "Terumbu karang rumah aneka ragam biota laut." },
        { r: "PADANG", w: ["PADANG", "DAPANG", "GANDA", "PADA"], d: "Sabana padang rumput luas tempat satwa berkeliaran." },
        { r: "TEBING", w: ["TEBING", "BINGTE", "BENTI", "BETI"], d: "Dinding batu curam menjulang perkasa menantang ombak." },
        { r: "MATAHARI", w: ["MATAHARI", "HARI", "MARI", "TIRMA"], d: "Sang surya sumber energi utama seluruh kehidupan di bumi." },
        { r: "REMBULAN", w: ["REMBULAN", "BULAN", "LEBUR", "AMBUR"], d: "Cahaya lembut bulan menyinari malam yang hening." },
        { r: "AWAN", w: ["AWAN", "WAAN", "WANA", "ANWA"], d: "Gumpalan putih lembut berarak di langit biru." },
        { r: "KABUT", w: ["KABUT", "BATUK", "BUKAT", "TUBAK"], d: "Kabut tipis sejuk menyelimuti hawa dingin pegunungan." },
        { r: "PELITA", w: ["PELITA", "TALIP", "PILAT", "TALEP"], d: "Cahaya penerang kecil pembawa rasa aman dan damai." },
        { r: "OBOR", w: ["OBOR", "ROBO", "BROO", "BOOR"], d: "Api obor lambang perjuangan yang tak kunjung padam." },
        { r: "API", w: ["API", "PIPA", "APIA", "PIAP"], d: "Kobaran api pemantik semangat juang yang membara." },
        { r: "EMAS", w: ["EMAS", "SEMA", "SAME", "MESA"], d: "Logam mulia berharga lambang nilai kehormatan tinggi." },
        { r: "PERAK", w: ["PERAK", "KAREP", "PAREK", "KERA"], d: "Kemilau perak anggun perhiasan bernilai seni." },
        { r: "TEMBAGA", w: ["TEMBAGA", "BAGATE", "GAMBA", "TAMEB"], d: "Mineral penting penunjang peradaban industri teknologi." },
        { r: "BESI", w: ["BESI", "SIBE", "EBIS", "BIES"], d: "Kekuatan baja dan besi fondasi pembangunan bangsa." },
        { r: "BAJA", w: ["BAJA", "JABA", "AJAB", "BAAJ"], d: "Ketahanan kuat tahan banting menghadapi segala ujian." },
        { r: "KAYU", w: ["KAYU", "KUYA", "YUKA", "AKUY"], d: "Bahan alami kokoh warisan pepohonan rimba raya." },
        { r: "BATUAN", w: ["BATUAN", "BANAT", "TABAN", "BATA"], d: "Lapisan batuan penyusun kerak bumi yang kaya mineral." },
        { r: "TANAMAN", w: ["TANAMAN", "MANAN", "TAMAN", "AMAT"], d: "Flora beraneka ragam penyegar pandangan mata." },
        { r: "HEWAN", w: ["HEWAN", "WAHEN", "HAWE", "EWAN"], d: "Fauna beraneka ragam sahabat manusia di bumi." },
        { r: "SATWA", w: ["SATWA", "TAWAS", "WASAT", "SAWT"], d: "Satwa liar penghuni habitat rimba nusantara." },
        { r: "BURUNG", w: ["BURUNG", "GURUB", "URUNG", "RUBG"], d: "Kicauan burung merdu menyambut hangatnya fajar pagi." },
        { r: "IKAN", w: ["IKAN", "NAKI", "KANI", "IKNA"], d: "Perenang lincah di perairan jernih kaya nutrisi." },
        { r: "RIMBA", w: ["RIMBA", "BARIM", "AMBIR", "BIRA"], d: "Rimbunnya hutan belantara paru-paru dunia." },
        { r: "ALAM", w: ["ALAM", "LAMA", "MALA", "ALMA"], d: "Kelestarian alam anugerah terindah Sang Pencipta." },
        { r: "LESTARI", w: ["LESTARI", "SERILA", "ATELIR", "RELASI"], d: "Menjaga kelestarian lingkungan demi anak cucu bangsa." }
    ];

    const EN_MASTER_LEVELS = [
        { r: "PLANET", w: ["PLANET", "PLANE", "PLANT", "LEPTA"], d: "A celestial body moving in an elliptical orbit around a star." },
        { r: "GALAXY", w: ["GALAXY", "AGAL", "GALA", "ALGA"], d: "A massive gravitationally bound system of stars and cosmic dust." },
        { r: "NATURE", w: ["NATURE", "TUNER", "URBAN", "TRUE"], d: "The physical world collective, including plants, animals, and landscapes." },
        { r: "WISDOM", w: ["WISDOM", "SWIM", "MODI", "WIND"], d: "The quality of having experience, knowledge, and good judgement." },
        { r: "ENERGY", w: ["ENERGY", "GENRE", "GREEN", "GENE"], d: "The strength and vitality required for sustained mental or physical activity." },
        { r: "JOURNEY", w: ["JOURNEY", "ENJOY", "JOULE", "RUNE"], d: "An act of traveling from one place to another over a long distance." },
        { r: "CRYSTAL", w: ["CRYSTAL", "CART", "CLAY", "SCAR"], d: "A piece of a homogeneous solid substance having a natural regular form." },
        { r: "HORIZON", w: ["HORIZON", "RHINO", "ZION", "IRON"], d: "The distant line where the sky and the earth appear to meet." },
        { r: "VIBRANT", w: ["VIBRANT", "TRAIN", "BRAIN", "RIVAL"], d: "Full of energy, enthusiasm, and vivid life." },
        { r: "COURAGE", w: ["COURAGE", "ROUGE", "CARGO", "GRACE"], d: "The ability to confront fear, pain, or danger with bravery." },
        { r: "QUANTUM", w: ["QUANTUM", "MUTAN", "AUNT", "TUNA"], d: "A discrete quantity of energy proportional in magnitude to radiation frequency." },
        { r: "EXPLORE", w: ["EXPLORE", "RELOX", "PEEL", "ROPE"], d: "To travel through an unfamiliar area in order to learn about it." },
        { r: "PHOENIX", w: ["PHOENIX", "PHONE", "PINE", "HOPE"], d: "A mythical bird that burns itself and is reborn from its own ashes." },
        { r: "ECLIPSE", w: ["ECLIPSE", "PIECE", "SLICE", "SLEEP"], d: "An obscuring of the light from one celestial body by the passage of another." },
        { r: "VALIANT", w: ["VALIANT", "AVAIL", "LAVA", "VAIN"], d: "Possessing or showing extraordinary courage and determination." },
        { r: "AURORA", w: ["AURORA", "ROAR", "AURA", "RARE"], d: "A natural electrical synthesis of colored light dancing in polar skies." },
        { r: "INFINITY", w: ["INFINITY", "TINTO", "INTO", "NITI"], d: "The state or quality of being boundless, endless, or limitless." },
        { r: "BLOSSOM", w: ["BLOSSOM", "BLOOM", "SOLO", "LOOM"], d: "A flower or a mass of flowers blooming brightly on a tree or bush." },
        { r: "ODYSSEY", w: ["ODYSSEY", "DOSE", "YOYO", "EDDY"], d: "A long and eventful or adventurous journey filled with discovery." },
        { r: "HARMONY", w: ["HARMONY", "MAYOR", "HORN", "ARMY"], d: "The combination of simultaneously sounded musical notes to produce chords." },
        { r: "PIONEER", w: ["PIONEER", "PEON", "RIPE", "PORE"], d: "A person who is among the first to explore or settle a new territory." },
        { r: "SYMPHONY", w: ["SYMPHONY", "HYMN", "SHOP", "PONY"], d: "An elaborate musical composition for a full orchestral ensemble." },
        { r: "DESTINY", w: ["DESTINY", "DENSITY", "TIDY", "NEST"], d: "The events that will necessarily happen to a person or thing in the future." },
        { r: "RADIANT", w: ["RADIANT", "DRAIN", "RAID", "RANT"], d: "Sending out light; shining or glowing brightly with warmth." },
        { r: "SPECTRUM", w: ["SPECTRUM", "SUPER", "CRUST", "MUSE"], d: "A band of colors, as seen in a rainbow, produced by dispersion of light." },
        { r: "LUMINOUS", w: ["LUMINOUS", "LIONS", "SOUL", "MOON"], d: "Giving off light; bright or glowing intensely in the dark." },
        { r: "LEGENDARY", w: ["LEGENDARY", "LEAD", "YARD", "GLAD"], d: "Remarkable enough to be famous; revered across generations." },
        { r: "TRIUMPH", w: ["TRIUMPH", "THUMP", "RUMP", "TRIP"], d: "A great victory, achievement, or overwhelming success." },
        { r: "CHAMPION", w: ["CHAMPION", "CHAIN", "PIANO", "CHIP"], d: "A person who has defeated all rivals in a competition or struggle." },
        { r: "SOLITUDE", w: ["SOLITUDE", "SOLID", "TOILE", "LUTE"], d: "The state or situation of being alone in peaceful contemplation." },
        { r: "ETERNAL", w: ["ETERNAL", "LATER", "ALERT", "ALTER"], d: "Lasting or existing forever without end in time." },
        { r: "MAJESTIC", w: ["MAJESTIC", "STEAM", "TAMIS", "JEST"], d: "Having or showing impressive beauty, grandeur, and dignity." },
        { r: "VICTORY", w: ["VICTORY", "VOTARY", "ROVIT", "CITY"], d: "An act of defeating an enemy, competitor, or great obstacle." },
        { r: "FREEDOM", w: ["FREEDOM", "FORCE", "MODER", "FEED"], d: "The power or right to act, speak, or think as one wants." },
        { r: "BRILLIANT", w: ["BRILLIANT", "BRAIL", "BLIRT", "LIAR"], d: "Exceptionally clever, radiant, talented, or impressive." },
        { r: "TREASURE", w: ["TREASURE", "RATES", "STARE", "TEARS"], d: "A quantity of precious metals, gems, or other valuable objects." },
        { r: "PARADISE", w: ["PARADISE", "PRAISE", "SPIRE", "SIDE"], d: "An ideal or idyllic place or state of absolute delight." },
        { r: "SPLENDOR", w: ["SPLENDOR", "LENDER", "SLOPE", "POLE"], d: "Magnificent and splendid appearance, grandness, and brilliance." },
        { r: "SERENITY", w: ["SERENITY", "ENTRY", "SIREN", "TINY"], d: "The state of being calm, peaceful, and untroubled." },
        { r: "UNIVERSE", w: ["UNIVERSE", "NURSE", "SEVER", "VEIN"], d: "All existing matter, spacetime, and reality considered as a whole." },
        { r: "GARDEN", w: ["GARDEN", "DANGER", "RANGED", "GRAND"], d: "A piece of ground adjoining a house, used for growing flowers and plants." },
        { r: "CASTLE", w: ["CASTLE", "CLEAT", "SCALE", "LACE"], d: "A large medieval fortified building or noble residence." },
        { r: "FOREST", w: ["FOREST", "FORTE", "FROST", "SOFT"], d: "A large area covered chiefly with trees and undergrowth." },
        { r: "ISLAND", w: ["ISLAND", "SNAIL", "SLID", "LAND"], d: "A piece of land entirely surrounded by a body of water." },
        { r: "DESERT", w: ["DESERT", "RESET", "STEED", "REST"], d: "A barren area of landscape where little precipitation occurs." },
        { r: "OCEAN", w: ["OCEAN", "CANOE", "ACNE", "CONE"], d: "A very large expanse of sea, in particular each of the main areas." },
        { r: "RIVER", w: ["RIVER", "DRIVE", "RIVED", "DIVER"], d: "A large natural stream of water flowing in a channel to the sea." },
        { r: "VALLEY", w: ["VALLEY", "ALLEY", "LAVE", "LEVA"], d: "A low area of land between hills or mountains, typically with a river." },
        { r: "SUMMIT", w: ["SUMMIT", "SMUT", "MIST", "SUIT"], d: "The highest point of a hill or mountain; the pinnacle of attainment." },
        { r: "CANYON", w: ["CANYON", "CANON", "CYAN", "ANON"], d: "A deep gorge, typically one with a river flowing through it." },
        { r: "MEADOW", w: ["MEADOW", "DOWEL", "WOMAN", "MEAD"], d: "A piece of grassland, especially one used for hay or pasture." },
        { r: "SPRING", w: ["SPRING", "GRISP", "PRING", "PIGS"], d: "The season after winter and before summer, in which vegetation begins to grow." },
        { r: "SUMMER", w: ["SUMMER", "MUSER", "SERUM", "MUSEUM"], d: "The warmest season of the year, between spring and autumn." },
        { r: "AUTUMN", w: ["AUTUMN", "TUMAN", "MUTON", "AUNTY"], d: "The season after summer and before winter, characterized by falling leaves." },
        { r: "WINTER", w: ["WINTER", "TWINE", "INTER", "WRITE"], d: "The coldest season of the year, in polar and temperate zones." },
        { r: "SHADOW", w: ["SHADOW", "SHOWD", "DOWS", "DASH"], d: "A dark area or shape produced by a body coming between rays of light." },
        { r: "SILVER", w: ["SILVER", "LIVER", "SLIVER", "VEILS"], d: "A precious shiny grayish-white metal valued for jewelry and coinage." },
        { r: "GOLDEN", w: ["GOLDEN", "LODGE", "OGLED", "DONG"], d: "Colored or shining like gold; marked by prosperity and happiness." },
        { r: "BRONZE", w: ["BRONZE", "BONER", "BORNE", "ZONE"], d: "A yellowish-brown alloy of copper with up to one-third tin." },
        { r: "COPPER", w: ["COPPER", "CORP", "ROPEY", "CROP"], d: "A red-brown metal, the chemical element of atomic number 29." },
        { r: "MARBLE", w: ["MARBLE", "BLARE", "AMBLE", "BALM"], d: "A hard crystalline metamorphic form of limestone, prized in architecture." },
        { r: "TIMBER", w: ["TIMBER", "MERIT", "TRIBE", "BITE"], d: "Wood prepared for use in building and carpentry." },
        { r: "FLOWER", w: ["FLOWER", "LOWER", "FOWLER", "FLOW"], d: "The seed-bearing part of a plant, consisting of reproductive organs." },
        { r: "STREAM", w: ["STREAM", "MASTER", "TAMERS", "TEAM"], d: "A small, narrow river of clear fresh flowing water." },
        { r: "BREEZE", w: ["BREEZE", "BEZEL", "BREED", "ZEBRA"], d: "A gentle, pleasant, and refreshing cool wind." },
        { r: "TEMPEST", w: ["TEMPEST", "PETS", "STEP", "STEM"], d: "A violent, windy storm with intense rain or thunder." },
        { r: "THUNDER", w: ["THUNDER", "UNDER", "HUNTER", "TREND"], d: "A loud rumbling or crashing noise heard after a lightning flash." },
        { r: "LIGHTNING", w: ["LIGHTNING", "NIGHT", "THING", "LIGHT"], d: "A flash of electric discharge produced between clouds or cloud and ground." },
        { r: "COSMOS", w: ["COSMOS", "SCOOP", "MOCO", "SOOT"], d: "The universe seen as a well-ordered and harmonious whole." },
        { r: "METEOR", w: ["METEOR", "REMOTE", "METER", "MEET"], d: "A small body of matter from outer space that glows upon entering the atmosphere." },
        { r: "COMET", w: ["COMET", "COME", "MOTE", "TOME"], d: "A celestial object consisting of a nucleus of ice and a tail of gas." },
        { r: "NEBULA", w: ["NEBULA", "UNABLE", "BALE", "LUBE"], d: "A giant cloud of gas and dust in outer space where stars are born." },
        { r: "STELLAR", w: ["STELLAR", "STALE", "TALES", "TEAL"], d: "Relating to a star or stars; exceptionally prominent or outstanding." },
        { r: "SOLAR", w: ["SOLAR", "POLAR", "SOLARIS", "SOAP"], d: "Relating to, determined by, or proceeding from the sun." },
        { r: "LUNAR", w: ["LUNAR", "ANNUL", "ULNA", "LUNA"], d: "Relating to, determined by, or resembling the moon." },
        { r: "ZENITH", w: ["ZENITH", "THINE", "HINT", "ZEST"], d: "The time or point at which something is at its most powerful or successful." },
        { r: "NADIR", w: ["NADIR", "DRAINAGE", "RAIND", "DARN"], d: "The lowest or most unsuccessful point in a situation." },
        { r: "APEX", w: ["APEX", "PEAX", "PACE", "AXLE"], d: "The top or highest part of something, especially one forming a point." },
        { r: "SUMMERY", w: ["SUMMERY", "YEAR", "RAYON", "RAMP"], d: "Characteristic of or suitable for summer weather and joy." },
        { r: "CLIMATE", w: ["CLIMATE", "MAIL", "MALT", "LIME"], d: "The weather conditions prevailing in an area in general or over a long period." },
        { r: "WEATHER", w: ["WEATHER", "WHEAT", "WATER", "HATER"], d: "The state of the atmosphere at a place and time regarding heat and dryness." },
        { r: "CLOUD", w: ["CLOUD", "LOUD", "COLD", "CLOD"], d: "A visible mass of condensed watery vapour floating in the atmosphere." },
        { r: "STORM", w: ["STORM", "MORT", "SORT", "ROST"], d: "A violent disturbance of the atmosphere with strong winds and rain." },
        { r: "GLACIER", w: ["GLACIER", "GRACEFUL", "CIGAR", "RAGI"], d: "A slowly moving mass or river of ice formed by snow accumulation." },
        { r: "ICEBERG", w: ["ICEBERG", "BEIGE", "BINGE", "GIBE"], d: "A large floating mass of ice detached from a glacier or ice sheet." },
        { r: "TUNDRA", w: ["TUNDRA", "DAUNT", "TURAN", "DURN"], d: "A vast, flat, treeless Arctic region in which subsoil is permanently frozen." },
        { r: "JUNGLE", w: ["JUNGLE", "LUNGE", "GLUE", "JUG"], d: "An area of land overgrown with dense forest and tangled vegetation." },
        { r: "SAVANNA", w: ["SAVANNA", "ANANAS", "SAVANT", "VANS"], d: "A grassy plain in tropical and subtropical regions, with few trees." },
        { r: "PRAIRIE", w: ["PRAIRIE", "REPAIR", "RAPIER", "PAIR"], d: "A large open area of grassland, especially in North America." },
        { r: "REEF", w: ["REEF", "FREE", "FEEDER", "FLED"], d: "A ridge of jagged rock, coral, or sand just above or below the surface of the sea." },
        { r: "LAGOON", w: ["LAGOON", "GOAL", "LOAN", "GOWN"], d: "A stretch of salt water separated from the sea by a low sandbank or reef." },
        { r: "VOLCANO", w: ["VOLCANO", "VOCAL", "VALOR", "CLAN"], d: "A mountain or hill having a crater through which lava and rock fragments erupt." },
        { r: "GEYSER", w: ["GEYSER", "GREYS", "EYRES", "SEER"], d: "A hot spring in which water intermittently boils, sending up a tall column." },
        { r: "CAVERN", w: ["CAVERN", "CARVE", "CRAVE", "RAVE"], d: "A large cave or chamber in a cave, especially an underground one." },
        { r: "GROTTO", w: ["GROTTO", "ROOT", "TROOP", "TOOT"], d: "A small picturesque cave, especially an artificial one in a park or garden." },
        { r: "HARBOR", w: ["HARBOR", "BARON", "BOAR", "BARK"], d: "A place on the coast where ships may moor in shelter." },
        { r: "ANCHOR", w: ["ANCHOR", "ROACH", "ACORN", "CHAR"], d: "A heavy metal device cast overboard to keep a vessel in place." },
        { r: "BEACON", w: ["BEACON", "BACON", "BONE", "BEAK"], d: "A fire or light set up in a prominent position as a signal or guide." },
        { r: "COMPASS", w: ["COMPASS", "SPASM", "CAMPO", "PASS"], d: "An instrument containing a magnetized pointer showing the direction of magnetic north." },
        { r: "VOYAGE", w: ["VOYAGE", "GAVEY", "AGEV", "YOGA"], d: "A long journey involving travel by sea or in space." }
    ];

    function generate100Levels(lang) {
        const list = [];
        const rawList = lang === 'id' ? ID_MASTER_LEVELS : EN_MASTER_LEVELS;

        for (let i = 0; i < 100; i++) {
            const item = rawList[i];
            const counts = {};
            item.w.forEach(word => {
                const wC = {};
                for (let c of word) wC[c] = (wC[c] || 0) + 1;
                for (let c in wC) counts[c] = Math.max(counts[c] || 0, wC[c]);
            });
            const letters = [];
            for (let c in counts) {
                for (let k = 0; k < counts[c]; k++) letters.push(c);
            }
            for (let j = letters.length - 1; j > 0; j--) {
                const r = Math.floor(Math.random() * (j + 1));
                [letters[j], letters[r]] = [letters[r], letters[j]];
            }

            const defs = {};
            defs[item.w[0]] = item.d;
            for (let k = 1; k < item.w.length; k++) {
                defs[item.w[k]] = lang === 'id' 
                    ? `Kosa kata Bahasa Indonesia: "${item.w[k]}".` 
                    : `English vocabulary term: "${item.w[k]}".`;
            }

            list.push({
                level: i + 1,
                language: lang,
                root: item.r,
                letters: letters,
                targets: item.w,
                bonus: ["ARCADE", "GEM", "STAR", "WIN"],
                definitions: defs
            });
        }
        return list;
    }

    const GAME_LEVELS = {
        id: generate100Levels('id'),
        en: generate100Levels('en')
    };

    // ==========================================
    // 4. SEPARATED SCENIC ARCHIVES (INDO & EN)
    // ==========================================
    const SCENIC_ARCHIVE_ID = [
        {
            level: 1,
            title: "Biru Samudra (Bawaan)",
            themeClass: "bg-id-savana",
            previewGradient: "linear-gradient(135deg, #09111e, #11223b, #060c17)",
            desc: "Gradasi warna biru laut gelap yang tenang dan elegan sebagai tema awal permainan."
        },
        {
            level: 10,
            title: "Hijau Zamrud",
            themeClass: "bg-id-rainforest",
            previewGradient: "linear-gradient(135deg, #04191c, #082d2f, #031214)",
            desc: "Kilau sejuk warna hijau zamrud nan asri yang menyegarkan mata."
        },
        {
            level: 25,
            title: "Merah Bara",
            themeClass: "bg-id-bromo",
            previewGradient: "linear-gradient(135deg, #180d1e, #291533, #0d0712)",
            desc: "Semburat warna merah bara membara penuh ketegasan dan energi."
        },
        {
            level: 50,
            title: "Biru Toska Neon",
            themeClass: "bg-id-rajaampat",
            previewGradient: "linear-gradient(135deg, #031c2e, #063554, #010f1a)",
            desc: "Cahaya warna biru toska neon berpadu biru laut memancarkan aura futuristik."
        },
        {
            level: 75,
            title: "Kuning Keemasan",
            themeClass: "bg-id-borobudur",
            previewGradient: "linear-gradient(135deg, #101528, #1c2647, #090c17)",
            desc: "Pancaran kehangatan warna emas temaram nan mewah melambangkan kejayaan."
        }
    ];

    const SCENIC_ARCHIVE_EN = [
        {
            level: 1,
            title: "Emerald Teal (Default)",
            themeClass: "bg-en-highlands",
            previewGradient: "linear-gradient(135deg, #081a24, #112c3b, #051017)",
            desc: "Deep mystic teal and emerald glow offering a tranquil atmosphere."
        },
        {
            level: 10,
            title: "Cobalt Ice Blue",
            themeClass: "bg-en-rockies",
            previewGradient: "linear-gradient(135deg, #0f172a, #1e293b, #080d1a)",
            desc: "Crisp icy blue hues radiating clarity, sharpness, and calm focus."
        },
        {
            level: 25,
            title: "Crimson Amber",
            themeClass: "bg-en-canyon",
            previewGradient: "linear-gradient(135deg, #1f1013, #36171f, #10080a)",
            desc: "Vibrant warm crimson and amber gradients radiating intense energy."
        },
        {
            level: 50,
            title: "Neon Violet Purple",
            themeClass: "bg-en-aurora",
            previewGradient: "linear-gradient(135deg, #081024, #121c3b, #040814)",
            desc: "Luminescent ultraviolet and magenta streams glowing with cyberpunk elegance."
        },
        {
            level: 75,
            title: "Electric Ocean Cyan",
            themeClass: "bg-en-pacific",
            previewGradient: "linear-gradient(135deg, #02172b, #072a4d, #010d19)",
            desc: "Vivid electric cyan waves descending into deep cosmic midnight."
        }
    ];

    // ==========================================
    // 5. ADVANCED TEBAK GAMBAR REBUS PUZZLE TIERS
    // ==========================================
    const TEBAK_GAMBAR_TIERS = {
        easy: [
            {
                id: "e1",
                clue: "Benda langit bersinar perak di malam hari:",
                answer: "BULAN",
                hint: "B _ L _ N",
                rebus: [
                    { icon: "🌙", sub: "Bulan" }
                ]
            },
            {
                id: "e2",
                clue: "Alat transportasi roda dua yang dikayuh santai:",
                answer: "SEPEDA",
                hint: "S _ P _ D _",
                rebus: [
                    { icon: "🚲", sub: "Sepeda" }
                ]
            },
            {
                id: "e3",
                clue: "Minuman seduhan hangat beraroma khas penahan kantuk:",
                answer: "KOPI",
                hint: "K _ P _",
                rebus: [
                    { icon: "☕", sub: "Kopi" }
                ]
            },
            {
                id: "e4",
                clue: "Jendela ilmu bertuliskan rangkaian kata dan informasi:",
                answer: "BUKU",
                hint: "B _ K _",
                rebus: [
                    { icon: "📖", sub: "Buku" }
                ]
            },
            {
                id: "e5",
                clue: "Hiasan kepala lambang kemuliaan raja dan ratu kerajaan:",
                answer: "MAHKOTA",
                hint: "M _ H K _ T _",
                rebus: [
                    { icon: "👑", sub: "Mahkota" }
                ]
            },
            {
                id: "e6",
                clue: "Bagian tanaman elok yang bermekaran di musim semi:",
                answer: "BUNGA",
                hint: "B _ N G _",
                rebus: [
                    { icon: "🌸", sub: "Bunga" }
                ]
            },
            {
                id: "e7",
                clue: "Bintang tata surya pembawa terang di siang hari:",
                answer: "MATAHARI",
                hint: "M _ T _ H _ R _",
                rebus: [
                    { icon: "☀️", sub: "Matahari" }
                ]
            },
            {
                id: "e8",
                clue: "Lensa pembantu penglihatan atau pelindung mata dari silau:",
                answer: "KACAMATA",
                hint: "K _ C _ M _ T _",
                rebus: [
                    { icon: "👓", sub: "Kacamata" }
                ]
            },
            {
                id: "e9",
                clue: "Alat penunjuk waktu berjarum detik, menit, dan jam:",
                answer: "JAM",
                hint: "J _ M",
                rebus: [
                    { icon: "⏰", sub: "Jam" }
                ]
            },
            {
                id: "e10",
                clue: "Burung besi penjelajah langit antarkota dan benua:",
                answer: "PESAWAT",
                hint: "P _ S _ W _ T",
                rebus: [
                    { icon: "✈️", sub: "Pesawat" }
                ]
            },
            {
                id: "e11",
                clue: "Pelindung andalan saat hujan deras maupun terik matahari:",
                answer: "PAYUNG",
                hint: "P _ Y _ N G",
                rebus: [
                    { icon: "☂️", sub: "Payung" }
                ]
            },
            {
                id: "e12",
                clue: "Alas kaki pelindung kaki saat berolahraga dan berjalan:",
                answer: "SEPATU",
                hint: "S _ P _ T _",
                rebus: [
                    { icon: "👟", sub: "Sepatu" }
                ]
            },
            {
                id: "e13",
                clue: "Alat pengabadi momen indah dalam bentuk jepretan foto:",
                answer: "KAMERA",
                hint: "K _ M _ R _",
                rebus: [
                    { icon: "📷", sub: "Kamera" }
                ]
            },
            {
                id: "e14",
                clue: "Alat musik berdawai yang dimainkan dengan cara dipetik:",
                answer: "GITAR",
                hint: "G _ T _ R",
                rebus: [
                    { icon: "🎸", sub: "Gitar" }
                ]
            },
            {
                id: "e15",
                clue: "Buah berkulit kuning manis bernutrisi tinggi:",
                answer: "PISANG",
                hint: "P _ S _ N G",
                rebus: [
                    { icon: "🍌", sub: "Pisang" }
                ]
            },
            {
                id: "e16",
                clue: "Serangga bersayap elok hasil metamorfosis kepompong:",
                answer: "KUPU KUPU",
                hint: "K _ P _   K _ P _",
                rebus: [
                    { icon: "🦋", sub: "Kupu Kupu" }
                ]
            },
            {
                id: "e17",
                clue: "Hewan peliharaan lucu berbulu halus yang suka mengeong:",
                answer: "KUCING",
                hint: "K _ C _ N G",
                rebus: [
                    { icon: "🐱", sub: "Kucing" }
                ]
            },
            {
                id: "e18",
                clue: "Perhiasan melingkar di jari perlambang ikatan janji:",
                answer: "CINCIN",
                hint: "C _ N C _ N",
                rebus: [
                    { icon: "💍", sub: "Cincin" }
                ]
            },
            {
                id: "e19",
                clue: "Alat pemotong berkeping dua untuk kertas atau kain:",
                answer: "GUNTING",
                hint: "G _ N T _ N G",
                rebus: [
                    { icon: "✂️", sub: "Gunting" }
                ]
            },
            {
                id: "e20",
                clue: "Batang penerang bersumbu yang dinyalakan saat gelap gulita:",
                answer: "LILIN",
                hint: "L _ L _ N",
                rebus: [
                    { icon: "🕯️", sub: "Lilin" }
                ]
            },
            {
                id: "e21",
                clue: "Transportasi massal beroda besi meluncur di atas rel baja:",
                answer: "KERETA",
                hint: "K _ R _ T _",
                rebus: [
                    { icon: "🚆", sub: "Kereta" }
                ]
            },
            {
                id: "e22",
                clue: "Buah segar manis renyah berwarna merah menyehatkan:",
                answer: "APEL",
                hint: "A P _ L",
                rebus: [
                    { icon: "🍎", sub: "Apel" }
                ]
            },
            {
                id: "e23",
                clue: "Wadah bertali pundak untuk membawa buku ke sekolah:",
                answer: "TAS",
                hint: "T _ S",
                rebus: [
                    { icon: "🎒", sub: "Tas" }
                ]
            },
            {
                id: "e24",
                clue: "Tempat bernaung dan pulang berkumpul bersama keluarga:",
                answer: "RUMAH",
                hint: "R _ M _ H",
                rebus: [
                    { icon: "🏠", sub: "Rumah" }
                ]
            },
            {
                id: "e25",
                clue: "Camilan manis dingin penyegar dahaga saat cuaca terik:",
                answer: "ES KRIM",
                hint: "E S   K R _ M",
                rebus: [
                    { icon: "🍦", sub: "Es Krim" }
                ]
            }
        ],
        normal: [
            {
                id: "n1",
                clue: "Gabungan 2 Clue: Bunga berduri anggun + Warna berani:",
                answer: "MAWAR MERAH",
                aliases: ["MAWARMERAH"],
                hint: "M _ W _ R   M _ R _ H",
                rebus: [
                    { icon: "🌹", sub: "Mawar" },
                    { symbol: "+" },
                    { icon: "🔴", sub: "Merah" }
                ]
            },
            {
                id: "n2",
                clue: "Gabungan 2 Clue: Tempat tinggal megah bernilai tinggi:",
                answer: "RUMAH MEWAH",
                aliases: ["RUMAHMEWAH"],
                hint: "R _ M _ H   M _ W _ H",
                rebus: [
                    { icon: "🏠", sub: "Rumah" },
                    { symbol: "+" },
                    { icon: "💎", sub: "Mewah" }
                ]
            },
            {
                id: "n3",
                clue: "Gabungan 2 Clue: Kuliner olahan telur digulung nikmat:",
                answer: "TELUR GULUNG",
                aliases: ["TELURGULUNG"],
                hint: "T _ L _ R   G _ L _ N G",
                rebus: [
                    { icon: "🥚", sub: "Telur" },
                    { symbol: "+" },
                    { icon: "📜", sub: "Gulung" }
                ]
            },
            {
                id: "n4",
                clue: "Gabungan 2 Clue: Mineral pemantik api atau pemicu perselisihan:",
                answer: "BATU API",
                aliases: ["BATUAPI"],
                hint: "B _ T _   A P _",
                rebus: [
                    { icon: "🪨", sub: "Batu" },
                    { symbol: "+" },
                    { icon: "🔥", sub: "Api" }
                ]
            },
            {
                id: "n5",
                clue: "Gabungan 2 Clue: Pedagang emperan trotoar jalan:",
                answer: "KAKI LIMA",
                aliases: ["KAKILIMA", "KAKI 5", "KAKI-LIMA"],
                hint: "K _ K _   L _ M _",
                rebus: [
                    { icon: "🦵", sub: "Kaki" },
                    { symbol: "+" },
                    { icon: "🖐️", sub: "Lima" }
                ]
            },
            {
                id: "n6",
                clue: "Gabungan 2 Clue: Minuman lezat kental manis bergizi:",
                answer: "SUSU COKELAT",
                aliases: ["SUSU COKLAT", "SUSUCOKELAT", "SUSUCOKLAT"],
                hint: "S _ S _   C _ K _ L _ T",
                rebus: [
                    { icon: "🥛", sub: "Susu" },
                    { symbol: "+" },
                    { icon: "🍫", sub: "Cokelat" }
                ]
            },
            {
                id: "n7",
                clue: "Gabungan 2 Clue: Minuman seduhan pekat bercampur susu:",
                answer: "KOPI SUSU",
                aliases: ["KOPISUSU"],
                hint: "K _ P _   S _ S _",
                rebus: [
                    { icon: "☕", sub: "Kopi" },
                    { symbol: "+" },
                    { icon: "🥛", sub: "Susu" }
                ]
            },
            {
                id: "n8",
                clue: "Gabungan 2 Clue: Pelindung mata saat cuaca terik matahari:",
                answer: "KACAMATA HITAM",
                aliases: ["KACAMATAHITAM"],
                hint: "K _ C _ M _ T _   H _ T _ M",
                rebus: [
                    { icon: "👓", sub: "Kacamata" },
                    { symbol: "+" },
                    { icon: "🕶️", sub: "Hitam" }
                ]
            },
            {
                id: "n9",
                clue: "Gabungan 2 Clue: Penunjuk waktu yang dipasang di tembok:",
                answer: "JAM DINDING",
                aliases: ["JAMDINDING"],
                hint: "J _ M   D _ N D _ N G",
                rebus: [
                    { icon: "⏰", sub: "Jam" },
                    { symbol: "+" },
                    { icon: "🧱", sub: "Dinding" }
                ]
            },
            {
                id: "n10",
                clue: "Gabungan 2 Clue: Kuliner khas nusantara lezat yang dimasak di wajan:",
                answer: "NASI GORENG",
                aliases: ["NASIGORENG", "NASI-GORENG"],
                hint: "N _ S _   G _ R _ N G",
                rebus: [
                    { icon: "🍚", sub: "Nasi" },
                    { symbol: "+" },
                    { icon: "🍳", sub: "Goreng" }
                ]
            },
            {
                id: "n11",
                clue: "Gabungan 2 Clue: Oleh-oleh sepulang bepergian dari luar kota:",
                answer: "BUAH TANGAN",
                aliases: ["BUAHTANGAN"],
                hint: "B _ _ H   T _ N G _ N",
                rebus: [
                    { icon: "🍎", sub: "Buah" },
                    { symbol: "+" },
                    { icon: "✋", sub: "Tangan" }
                ]
            },
            {
                id: "n12",
                clue: "Gabungan 2 Clue: Angkutan rel bermesin bertenaga lokomotif:",
                answer: "KERETA API",
                aliases: ["KERETAAPI"],
                hint: "K _ R _ T _   A P _",
                rebus: [
                    { icon: "🚆", sub: "Kereta" },
                    { symbol: "+" },
                    { icon: "🔥", sub: "Api" }
                ]
            },
            {
                id: "n13",
                clue: "Gabungan 2 Clue: Tetesan bening saat menangis sedih atau terharu:",
                answer: "AIR MATA",
                aliases: ["AIRMATA"],
                hint: "A _ R   M _ T _",
                rebus: [
                    { icon: "💧", sub: "Air" },
                    { symbol: "+" },
                    { icon: "👁️", sub: "Mata" }
                ]
            },
            {
                id: "n14",
                clue: "Gabungan 2 Clue: Pihak yang dijadikan sasaran tuduhan bersalah:",
                answer: "KAMBING HITAM",
                aliases: ["KAMBINGHITAM"],
                hint: "K _ M B _ N G   H _ T _ M",
                rebus: [
                    { icon: "🐐", sub: "Kambing" },
                    { symbol: "+" },
                    { icon: "⚫", sub: "Hitam" }
                ]
            },
            {
                id: "n15",
                clue: "Gabungan 2 Clue: Ruang peradilan hukum:",
                answer: "MEJA HIJAU",
                aliases: ["MEJAHIJAU"],
                hint: "M _ J _   H _ J _ _",
                rebus: [
                    { icon: "🪵", sub: "Meja" },
                    { symbol: "+" },
                    { icon: "🟢", sub: "Hijau" }
                ]
            },
            {
                id: "n16",
                clue: "Gabungan 2 Clue: Hewan laut unik berduri berbentuk bintang:",
                answer: "BINTANG LAUT",
                aliases: ["BINTANGLAUT"],
                hint: "B _ N T _ N G   L _ _ T",
                rebus: [
                    { icon: "⭐", sub: "Bintang" },
                    { symbol: "+" },
                    { icon: "🌊", sub: "Laut" }
                ]
            },
            {
                id: "n17",
                clue: "Gabungan 2 Clue: Sikap tenang, sabar, dan tidak gegabah:",
                answer: "KEPALA DINGIN",
                aliases: ["KEPALADINGIN"],
                hint: "K _ P _ L _   D _ N G _ N",
                rebus: [
                    { icon: "🗣️", sub: "Kepala" },
                    { symbol: "+" },
                    { icon: "❄️", sub: "Dingin" }
                ]
            },
            {
                id: "n18",
                clue: "Gabungan 2 Clue: Ungkapan tidak mau ikut bertanggung jawab:",
                answer: "CUCI TANGAN",
                aliases: ["CUCITANGAN"],
                hint: "C _ C _   T _ N G _ N",
                rebus: [
                    { icon: "🧼", sub: "Cuci" },
                    { symbol: "+" },
                    { icon: "✋", sub: "Tangan" }
                ]
            },
            {
                id: "n19",
                clue: "Gabungan 2 Clue: Istilah gelar keturunan ningrat atau bangsawan:",
                answer: "DARAH BIRU",
                aliases: ["DARAHBIRU"],
                hint: "D _ R _ H   B _ R _",
                rebus: [
                    { icon: "🩸", sub: "Darah" },
                    { symbol: "+" },
                    { icon: "🔵", sub: "Biru" }
                ]
            },
            {
                id: "n20",
                clue: "Gabungan 2 Clue: Rasa ikhlas dan sabar menerima keadaan:",
                answer: "LAPANG DADA",
                aliases: ["LAPANGDADA"],
                hint: "L _ P _ N G   D _ D _",
                rebus: [
                    { icon: "⚽", sub: "Lapang" },
                    { symbol: "+" },
                    { icon: "🫁", sub: "Dada" }
                ]
            }
        ],
        hard: [
            {
                id: "h1",
                clue: "Teka-teki 3 Clue: Rangkaikan kata dari 3 visual dan modifikasi hurufnya!",
                answer: "BAJU HARUM TAPAL",
                aliases: ["BAJUHARUMTAPAL"],
                hint: "B _ J _   H _ R _ M   T _ P _ L",
                rebus: [
                    { icon: "🪨", sub: "BATU", strike: "T", replace: "J" },
                    { symbol: "+" },
                    { icon: "🪡", sub: "JARUM", strike: "J", replace: "H" },
                    { symbol: "+" },
                    { icon: "🚢", sub: "KAPAL", strike: "K", replace: "T" }
                ]
            },
            {
                id: "h2",
                clue: "Teka-teki 3 Clue: Ubah dan sesuaikan huruf pada tiap gambar!",
                answer: "GAS SATU OBIL",
                aliases: ["GASSATUOBIL"],
                hint: "G _ S   S _ T _   O B _ L",
                rebus: [
                    { icon: "🐘", sub: "GAJAH", strike: "J", replace: "S" },
                    { symbol: "+" },
                    { icon: "🪨", sub: "BATU", strike: "B", replace: "S" },
                    { symbol: "+" },
                    { icon: "🚗", sub: "MOBIL", strike: "M" }
                ]
            },
            {
                id: "h3",
                clue: "Teka-teki 3 Clue: Gabungkan gambar dengan eliminasi dan substitusi huruf!",
                answer: "UDA TATU KAN",
                aliases: ["UDATATUKAN"],
                hint: "U D _   T _ T _   K _ N",
                rebus: [
                    { icon: "🦐", sub: "UDANG", strike: "NG" },
                    { symbol: "+" },
                    { icon: "🎲", sub: "DADU", strike: "D", replace: "T" },
                    { symbol: "+" },
                    { icon: "🐟", sub: "IKAN", strike: "I" }
                ]
            },
            {
                id: "h4",
                clue: "Teka-teki 3 Clue: Perhatikan tanda minus dan plus pada tiap visual!",
                answer: "UDA RATA KOI",
                aliases: ["UDARATAKOI"],
                hint: "U D _   R _ T _   K _ I",
                rebus: [
                    { icon: "🐎", sub: "KUDA", strike: "K" },
                    { symbol: "+" },
                    { icon: "👑", sub: "RAJA", strike: "J", replace: "T" },
                    { symbol: "+" },
                    { icon: "☕", sub: "KOPI", strike: "P" }
                ]
            },
            {
                id: "h5",
                clue: "Teka-teki 3 Clue: Analisis ketiga visual dan rangkailah kosa katanya!",
                answer: "SUKU UNGA OBIL",
                aliases: ["SUKUUNGAOBIL"],
                hint: "S _ K _   U N G _   O B _ L",
                rebus: [
                    { icon: "📖", sub: "BUKU", strike: "B", replace: "S" },
                    { symbol: "+" },
                    { icon: "🌸", sub: "BUNGA", strike: "B" },
                    { symbol: "+" },
                    { icon: "🚗", sub: "MOBIL", strike: "M" }
                ]
            },
            {
                id: "h6",
                clue: "Teka-teki 3 Clue: Kurangi suku kata dan modifikasi hurufnya!",
                answer: "KUTU SUKU KATA",
                aliases: ["KUTUSUKUKATA"],
                hint: "K _ T _   S _ K _   K _ T _",
                rebus: [
                    { icon: "🪲", sub: "KUTU" },
                    { symbol: "+" },
                    { icon: "📖", sub: "BUKU", strike: "B", replace: "S" },
                    { symbol: "+" },
                    { icon: "🗣️", sub: "KATA" }
                ]
            },
            {
                id: "h7",
                clue: "Teka-teki 3 Clue: Gabungkan 3 visual idiom dengan teliti!",
                answer: "JAM TANGAN EMAS",
                aliases: ["JAMTANGANEMAS"],
                hint: "J _ M   T _ N G _ N   E M _ S",
                rebus: [
                    { icon: "⏰", sub: "Jam" },
                    { symbol: "+" },
                    { icon: "✋", sub: "Tangan" },
                    { symbol: "+" },
                    { icon: "👑", sub: "Emas" }
                ]
            },
            {
                id: "h8",
                clue: "Teka-teki 3 Clue: Rangkaikan kata dari tiga petunjuk rasa lezat!",
                answer: "RUMAH MAKAN SEDAP",
                aliases: ["RUMAHMAKANSEDAP"],
                hint: "R _ M _ H   M _ K _ N   S _ D _ P",
                rebus: [
                    { icon: "🏠", sub: "Rumah" },
                    { symbol: "+" },
                    { icon: "🍽️", sub: "Makan" },
                    { symbol: "+" },
                    { icon: "😋", sub: "Sedap" }
                ]
            },
            {
                id: "h9",
                clue: "Teka-teki 3 Clue: Kurangi huruf depan dan satukan kosa katanya!",
                answer: "MAKAR TUMAH RASA",
                aliases: ["MAKARTUMAHRASA"],
                hint: "M _ K _ R   T _ M _ H   R _ S _",
                rebus: [
                    { icon: "🌹", sub: "MAWAR", strike: "W", replace: "K" },
                    { symbol: "+" },
                    { icon: "🏠", sub: "RUMAH", strike: "R", replace: "T" },
                    { symbol: "+" },
                    { icon: "👑", sub: "RAJA", strike: "J", replace: "S" }
                ]
            },
            {
                id: "h10",
                clue: "Teka-teki 3 Clue: Eliminasi huruf pada ketiga visual!",
                answer: "MISANG KOTI EPEDA",
                aliases: ["MISANGKOTIEPEDA"],
                hint: "M _ S _ N G   K _ T _   E P _ D _",
                rebus: [
                    { icon: "🍌", sub: "PISANG", strike: "P", replace: "M" },
                    { symbol: "+" },
                    { icon: "☕", sub: "KOPI", strike: "P", replace: "T" },
                    { symbol: "+" },
                    { icon: "🚲", sub: "SEPEDA", strike: "S" }
                ]
            },
            {
                id: "h11",
                clue: "Teka-teki 3 Clue: Bintang jatuh menghiasi malam!",
                answer: "BINTANG JATUH MALAM",
                aliases: ["BINTANGJATUHMALAM"],
                hint: "B _ N T _ N G   J _ T _ H   M _ L _ M",
                rebus: [
                    { icon: "⭐", sub: "Bintang" },
                    { symbol: "+" },
                    { icon: "🌠", sub: "Jatuh" },
                    { symbol: "+" },
                    { icon: "🌙", sub: "Malam" }
                ]
            },
            {
                id: "h12",
                clue: "Teka-teki 3 Clue: Pelari pagi berkejaran di fajar hari!",
                answer: "MATA LARI PAGI",
                aliases: ["MATALARIPAGI"],
                hint: "M _ T _   L _ R _   P _ G _",
                rebus: [
                    { icon: "👁️", sub: "Mata" },
                    { symbol: "+" },
                    { icon: "☀️", sub: "HARI", strike: "H", replace: "L" },
                    { symbol: "+" },
                    { icon: "🌅", sub: "Pagi" }
                ]
            },
            {
                id: "h13",
                clue: "Teka-teki 3 Clue: Bunga melati semerbak mewangi!",
                answer: "BUNGA MELATI WANGI",
                aliases: ["BUNGAMELATIWANGI"],
                hint: "B _ N G _   M _ L _ T _   W _ N G _",
                rebus: [
                    { icon: "🌸", sub: "Bunga" },
                    { symbol: "+" },
                    { icon: "🤍", sub: "Melati" },
                    { symbol: "+" },
                    { icon: "👃", sub: "Wangi" }
                ]
            },
            {
                id: "h14",
                clue: "Teka-teki 3 Clue: Burung besi melesat kencang!",
                answer: "KAPAL TERBANG CEPAT",
                aliases: ["KAPALTERBANGCEPAT"],
                hint: "K _ P _ L   T _ R B _ N G   C _ P _ T",
                rebus: [
                    { icon: "🚢", sub: "Kapal" },
                    { symbol: "+" },
                    { icon: "✈️", sub: "Terbang" },
                    { symbol: "+" },
                    { icon: "⚡", sub: "Cepat" }
                ]
            },
            {
                id: "h15",
                clue: "Teka-teki 3 Clue: Kucing anggora tidur di ranjang empuk!",
                answer: "KUCING TIDUR NYENYAK",
                aliases: ["KUCINGTIDURNYENYAK"],
                hint: "K _ C _ N G   T _ D _ R   N Y _ N Y _ K",
                rebus: [
                    { icon: "🐱", sub: "Kucing" },
                    { symbol: "+" },
                    { icon: "🛌", sub: "Tidur" },
                    { symbol: "+" },
                    { icon: "😴", sub: "Nyenyak" }
                ]
            }
        ],
        extreme: [
            {
                id: "x1",
                clue: "Formula Rebus Ekstrim: Selesaikan operasi huruf dari 4 visual berikut!",
                answer: "UKU AI TENA RAA",
                aliases: ["UKUAITENARAA"],
                hint: "U K _   A _   T _ N _   R _ _",
                rebus: [
                    { icon: "📖", sub: "BUKU", strike: "B" },
                    { symbol: "+" },
                    { icon: "🔥", sub: "API", strike: "P" },
                    { symbol: "+" },
                    { icon: "🖊️", sub: "PENA", strike: "P", replace: "T" },
                    { symbol: "+" },
                    { icon: "👑", sub: "RAJA", strike: "J" }
                ]
            },
            {
                id: "x2",
                clue: "Formula Rebus Ekstrim: 4 Visual bertingkat dengan pengurangan dan penukaran huruf!",
                answer: "AJAH MOTL KISANG",
                aliases: ["AJAHMOTLKISANG"],
                hint: "A J _ H   M _ T L   K _ S _ N G",
                rebus: [
                    { icon: "🐘", sub: "GAJAH", strike: "G" },
                    { symbol: "+" },
                    { icon: "🚗", sub: "MOBIL", strike: "B", replace: "T" },
                    { symbol: "-" },
                    { symbol: "I" },
                    { symbol: "+" },
                    { icon: "🍌", sub: "PISANG", strike: "P", replace: "K" }
                ]
            },
            {
                id: "x3",
                clue: "Formula Rebus Ekstrim: 5 Visual berturut-turut dengan operator logika matematika!",
                answer: "UDA SATU RAMA EPEDA",
                aliases: ["UDASATURAMAEPEDA"],
                hint: "U D _   S _ T _   R _ M _   E P _ D _",
                rebus: [
                    { icon: "🐎", sub: "KUDA", strike: "K" },
                    { symbol: "+" },
                    { icon: "🪨", sub: "BATU", strike: "B", replace: "S" },
                    { symbol: "+" },
                    { icon: "👑", sub: "RAJA", strike: "J", replace: "M" },
                    { symbol: "-" },
                    { symbol: "N" },
                    { symbol: "+" },
                    { icon: "🚲", sub: "SEPEDA", strike: "S" }
                ]
            },
            {
                id: "x4",
                clue: "Formula Rebus Ekstrim: Selesaikan teka-teki 5 visual dengan eliminasi suku kata!",
                answer: "TUMAH ERLI MAAR ULAN",
                aliases: ["TUMAHERLIMAARULAN"],
                hint: "T _ M _ H   E R L _   M _ _ R   U L _ N",
                rebus: [
                    { icon: "🏠", sub: "RUMAH", strike: "R", replace: "T" },
                    { symbol: "+" },
                    { icon: "💎", sub: "BERLIAN", strike: "B" },
                    { symbol: "-" },
                    { symbol: "AN" },
                    { symbol: "+" },
                    { icon: "🌹", sub: "MAWAR", strike: "W" },
                    { symbol: "+" },
                    { icon: "🌙", sub: "BULAN", strike: "B" }
                ]
            },
            {
                id: "x5",
                clue: "Formula Rebus Ekstrim: Selesaikan operasi eliminasi 3 visual!",
                answer: "UMAH ILAT PEL",
                aliases: ["UMAHILATPEL"],
                hint: "U M _ H   I L _ T   P _ L",
                rebus: [
                    { icon: "🏠", sub: "RUMAH", strike: "R" },
                    { symbol: "+" },
                    { icon: "⚡", sub: "KILAT", strike: "K" },
                    { symbol: "+" },
                    { icon: "🍎", sub: "APEL", strike: "A" }
                ]
            },
            {
                id: "x6",
                clue: "Formula Rebus Ekstrim: Kurangi huruf depan tiap visual!",
                answer: "AHKOTA MBAK KOI",
                aliases: ["AHKOTAMBAKKOI"],
                hint: "A H K _ T _   M B _ K   K _ I",
                rebus: [
                    { icon: "👑", sub: "MAHKOTA", strike: "M" },
                    { symbol: "+" },
                    { icon: "🌊", sub: "OMBAK", strike: "O" },
                    { symbol: "+" },
                    { icon: "☕", sub: "KOPI", strike: "P" }
                ]
            },
            {
                id: "x7",
                clue: "Formula Rebus Ekstrim: Ganti huruf awal dan eliminasi huruf akhir!",
                answer: "KEPEDA MOBI ULAN",
                aliases: ["KEPEDAMOBIULAN"],
                hint: "K _ P _ D _   M _ B _   U L _ N",
                rebus: [
                    { icon: "🚲", sub: "SEPEDA", strike: "S", replace: "K" },
                    { symbol: "+" },
                    { icon: "🚗", sub: "MOBIL", strike: "L" },
                    { symbol: "+" },
                    { icon: "🌙", sub: "BULAN", strike: "B" }
                ]
            },
            {
                id: "x8",
                clue: "Formula Rebus Ekstrim: 4 Visual bertingkat dengan pemotongan huruf!",
                answer: "ATU UDA KAN UNGA",
                aliases: ["ATUUDAKANUNGA"],
                hint: "A T _   U D _   K _ N   U N G _",
                rebus: [
                    { icon: "🪨", sub: "BATU", strike: "B" },
                    { symbol: "+" },
                    { icon: "🦐", sub: "UDANG", strike: "NG" },
                    { symbol: "+" },
                    { icon: "🐟", sub: "IKAN", strike: "I" },
                    { symbol: "+" },
                    { icon: "🌸", sub: "BUNGA", strike: "B" }
                ]
            },
            {
                id: "x9",
                clue: "Formula Rebus Ekstrim: 3 Visual ningrat dengan eliminasi awalan!",
                answer: "AJAH AJA ERLIAN",
                aliases: ["AJAHAJAERLIAN"],
                hint: "A J _ H   A J _   E R L _ _ N",
                rebus: [
                    { icon: "🐘", sub: "GAJAH", strike: "G" },
                    { symbol: "+" },
                    { icon: "👑", sub: "RAJA", strike: "R" },
                    { symbol: "+" },
                    { icon: "💎", sub: "BERLIAN", strike: "B" }
                ]
            },
            {
                id: "x10",
                clue: "Formula Rebus Ekstrim: 4 Visual matematika dengan eliminasi huruf tengah!",
                answer: "MAAR UKU AI AM",
                aliases: ["MAARUKUAIAM"],
                hint: "M _ _ R   U K _   A _   _ M",
                rebus: [
                    { icon: "🌹", sub: "MAWAR", strike: "W" },
                    { symbol: "+" },
                    { icon: "📖", sub: "BUKU", strike: "B" },
                    { symbol: "+" },
                    { icon: "🔥", sub: "API", strike: "P" },
                    { symbol: "+" },
                    { icon: "⏰", sub: "JAM", strike: "J" }
                ]
            }
        ]
    };

    // Randomized Daily Quiz Pool (21 Soal Kaya Pilihan untuk 7 Soal per Sesi)
    const DAILY_QUIZ_RAW = [
        {
            question: "Apa makna dari kata 'Cendekia' dalam Bahasa Indonesia?",
            correctAnswer: "Tajam pikiran, cerdas & lekas mengerti",
            distractors: ["Kaya raya dan berharta melimpah", "Keturunan bangsawan kerajaan", "Ahli bela diri silat tradisional"],
            explanation: "'Cendekia' berarti cerdas, lekas mengerti, terpelajar, dan tajam pikirannya."
        },
        {
            question: "What is the primary English synonym of 'LUMINOUS'?",
            correctAnswer: "Shining or glowing brightly",
            distractors: ["Extremely cold and frozen", "Dark and gloomy", "Heavy and unbreakable"],
            explanation: "'Luminous' describes something that gives off light or glows with intense radiance."
        },
        {
            question: "Lengkapilah peribahasa: 'Air beriak tanda ...'",
            correctAnswer: "Tak dalam",
            distractors: ["Ada buaya", "Banjir besar", "Arus deras"],
            explanation: "'Air beriak tanda tak dalam' bermakna orang yang banyak bicara biasanya kurang ilmunya."
        },
        {
            question: "Choose the correct antonym for the English word 'VALIANT':",
            correctAnswer: "Cowardly",
            distractors: ["Heroic", "Confident", "Determined"],
            explanation: "'Valiant' means brave or courageous; its direct opposite is 'cowardly'."
        },
        {
            question: "Manakah penulisan kata baku yang tepat dalam Bahasa Indonesia?",
            correctAnswer: "Praktik",
            distractors: ["Praktek", "Praktekan", "Peraktek"],
            explanation: "Bentuk baku yang tepat menurut KBBI adalah 'Praktik' (diserap dari bahasa Belanda 'praktijk')."
        },
        {
            question: "Kata 'Arunika' dalam Bahasa Indonesia memiliki arti:",
            correctAnswer: "Cahaya matahari yang terbit di pagi hari",
            distractors: ["Bunga melati yang layu di musim kemarau", "Tetesan embun di dedaunan malam", "Angin kencang sebelum turun hujan"],
            explanation: "'Arunika' adalah kosa kata puitis Indonesia yang berarti cahaya matahari pagi saat fajar menyingsing."
        },
        {
            question: "What is the meaning of the English word 'METICULOUS'?",
            correctAnswer: "Showing great attention to detail and very careful",
            distractors: ["Moving very fast and carelessly", "Being friendly to everyone", "Lacking energy and motivation"],
            explanation: "'Meticulous' means taking extreme care about minute details."
        },
        {
            question: "Lengkapilah peribahasa: 'Tong kosong nyaring ...'",
            correctAnswer: "Bunyinya",
            distractors: ["Bentuknya", "Warnanya", "Isinya"],
            explanation: "'Tong kosong nyaring bunyinya' bermakna orang yang sombong dan banyak cakap biasanya tidak berilmu."
        },
        {
            question: "Manakah kata di bawah ini yang merupakan antonim dari 'ALTRUISME'?",
            correctAnswer: "Egoisme",
            distractors: ["Optimisme", "Idealisme", "Heroisme"],
            explanation: "'Altruisme' adalah sifat mementingkan orang lain, antonimnya adalah 'Egoisme'."
        },
        {
            question: "Choose the English synonym for the word 'RESILIENT':",
            correctAnswer: "Able to recover quickly from difficulties",
            distractors: ["Easily broken or destroyed", "Slow and clumsy", "Unwilling to change"],
            explanation: "'Resilient' means strong, healthy, or able to bounce back after misfortune."
        },
        {
            question: "Kata 'Renjana' dalam Bahasa Indonesia berarti:",
            correctAnswer: "Rasa rindu atau cinta kasih yang mendalam",
            distractors: ["Rasa dendam yang belum terbalas", "Rasa lapar di tengah perjalanan", "Rasa kantuk yang tak tertahankan"],
            explanation: "'Renjana' bermakna rasa hati yang kuat (seperti rindu, cinta kasih, atau hasrat yang mendalam)."
        },
        {
            question: "Manakah penulisan kata serapan yang baku menurut KBBI?",
            correctAnswer: "Apotek",
            distractors: ["Apotik", "Apotik-an", "Apoteke"],
            explanation: "Bentuk baku yang sesuai dengan KBBI adalah 'Apotek', bukan 'Apotik'."
        },
        {
            question: "What does the English idiom 'A piece of cake' mean?",
            correctAnswer: "Something very easy to do",
            distractors: ["A delicious dessert to eat", "A very difficult task", "A dangerous situation"],
            explanation: "'A piece of cake' is an idiom meaning something that is remarkably simple or easy."
        },
        {
            question: "Lengkapilah peribahasa: 'Berat sama dipikul, ringan sama ...'",
            correctAnswer: "Dijinjing",
            distractors: ["Dibawa", "Dibuang", "Dihitung"],
            explanation: "'Berat sama dipikul, ringan sama dijinjing' bermakna seia sekata, bersama-sama dalam suka dan duka."
        },
        {
            question: "Arti kata 'Sandyakala' dalam khazanah bahasa Indonesia adalah:",
            correctAnswer: "Cahaya merah di langit saat senja menjelang malam",
            distractors: ["Kabut tebal di puncak gunung", "Bintang kejora di fajar hari", "Hujan rintik di tengah terik mentari"],
            explanation: "'Sandyakala' berarti lembayung senja atau cahaya kemerahan di ufuk barat saat matahari terbenam."
        },
        {
            question: "Choose the antonym of the English word 'TRANSIENT':",
            correctAnswer: "Permanent",
            distractors: ["Temporary", "Brief", "Passing"],
            explanation: "'Transient' means lasting only for a short time. Its opposite is 'Permanent'."
        },
        {
            question: "Manakah kata dasar baku yang tepat menurut pedoman EBI?",
            correctAnswer: "Antre",
            distractors: ["Antri", "Antrian", "Ngantri"],
            explanation: "Bentuk kata dasar baku menurut KBBI adalah 'Antre' (bukan antri)."
        },
        {
            question: "Dalam Bahasa Inggris, kata 'PERSEVERANCE' bermakna:",
            correctAnswer: "Kegigihan untuk terus berusaha walau menghadapi kesulitan",
            distractors: ["Kemampuan menghafal sesuatu dengan cepat", "Sikap ragu-ragu dalam mengambil keputusan", "Perilaku boros menggunakan sumber daya"],
            explanation: "'Perseverance' adalah kegigihan, ketabahan, dan ketekunan untuk terus maju meski ada rintangan."
        },
        {
            question: "Lengkapilah peribahasa: 'Sekali merengkuh dayung, dua tiga pulau ...'",
            correctAnswer: "Terlampaui",
            distractors: ["Tenggelam", "Terlewati", "Terbangun"],
            explanation: "'Sekali merengkuh dayung, dua tiga pulau terlampaui' bermakna sekali melakukan pekerjaan, beberapa maksud tercapai."
        },
        {
            question: "Arti kata 'Pancawarna' adalah:",
            correctAnswer: "Terdiri atas lima aneka ragam warna",
            distractors: ["Hanya memiliki satu corak warna", "Warna yang memudar terkena cahaya", "Warna hitam kelam tanpa gradasi"],
            explanation: "'Panca' berarti lima, sehingga 'Pancawarna' bermakna lima warna atau beraneka ragam warna."
        },
        {
            question: "What is the synonym of 'CANDID' in English?",
            correctAnswer: "Frank, honest, and straightforward",
            distractors: ["Secretive and deceptive", "Extremely rude and hostile", "Complicated and puzzling"],
            explanation: "'Candid' means truthful and straightforward, expressing feelings openly."
        }
    ];

    const AVATAR_LIST = [
        { id: "avatar-cyber", icon: "🧑‍💻", label: "Cyber" },
        { id: "avatar-explorer", icon: "👩‍🚀", label: "Explorer" },
        { id: "avatar-wizard", icon: "🧙‍♂️", label: "Wizard" },
        { id: "avatar-detective", icon: "🕵️", label: "Detective" },
        { id: "avatar-robot", icon: "🤖", label: "Robot" },
        { id: "avatar-ninja", icon: "🥷", label: "Ninja" },
        { id: "avatar-scholar", icon: "🎓", label: "Scholar" },
        { id: "avatar-phoenix", icon: "🦅", label: "Phoenix" }
    ];

    // ==========================================
    // 6. LOCALSTORAGE PERSISTENT STATE
    // ==========================================
    const STORAGE_KEY = 'VOCAB_ARCADE_PROD_CLEAN_V5';

    const defaultState = {
        playerName: 'Cendekia',
        avatar: '🧑‍💻',
        title: 'Penjelajah Kata',
        hasVisited: false,
        gems: 100,
        wordsFoundTotal: 0,
        bonusWordsFound: [],
        idCompletedLevels: [],
        enCompletedLevels: [],
        unlockedBackgroundsId: [1],
        unlockedBackgroundsEn: [1],
        activeScenicTheme: "", // empty defaults to sleek dark blue & black
        tebakDiffIndices: { easy: 0, normal: 0, hard: 0, extreme: 0 },
        lastOnlineClaim: Date.now() - 600000,
        lastDailyQuizCompleted: 0,
        discoveredWordsId: [],
        discoveredWordsEn: []
    };

    let state = Object.assign({}, defaultState);

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                state = Object.assign({}, defaultState, JSON.parse(raw));
            }
        } catch (e) {
            console.error('Error loading state:', e);
        }

        // Automatic first-time visitor check for existing versus new players
        if (state.hasVisited === undefined) {
            state.hasVisited = Boolean(state.wordsFoundTotal > 0 || (state.idCompletedLevels && state.idCompletedLevels.length > 0) || (state.enCompletedLevels && state.enCompletedLevels.length > 0));
        }

        // Sanitize corrupted avatar or text from previous session
        if (!state.avatar || state.avatar.includes('â') || state.avatar.includes('ð') || state.avatar.includes('Ã') || state.avatar.length > 8) {
            state.avatar = '🧑‍💻';
        }
        if (!state.playerName || state.playerName.includes('â') || state.playerName.includes('ð') || state.playerName.includes('Ã')) {
            state.playerName = 'Cendekia';
        }
        if (!state.title || state.title.includes('â') || state.title.includes('ð') || state.title.includes('Ã')) {
            state.title = 'Penjelajah Kata';
        }
    }

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            updateHeaderUI();
        } catch (e) {
            console.error('Error saving state:', e);
        }
    }

    // ==========================================
    // 7. SMOOTH ANIMATED GEMS COUNT-UP HELPER (gems-bump & gems-pulse)
    // ==========================================
    let currentDisplayedGems = 100;

    function addGems(amount) {
        if (amount <= 0) return;
        const target = state.gems + amount;
        state.gems = target;
        Sound.playGemCollect();

        // Animate count-up smoothly and trigger bump & pulse animation
        const containers = [
            document.getElementById('gems-badge-container'),
            document.getElementById('game-gems-badge-container')
        ];

        containers.forEach(container => {
            if (container) {
                container.classList.remove('gems-bump', 'gems-pulse');
                void container.offsetWidth; // trigger reflow
                container.classList.add('gems-bump', 'gems-pulse');
                setTimeout(() => {
                    container.classList.remove('gems-bump', 'gems-pulse');
                }, 700);
            }
        });

        const headerCounter = document.getElementById('header-gems-count');
        const gameCounter = document.getElementById('game-gems-count');

        const duration = 700; // ms
        const startVal = currentDisplayedGems;
        const startTime = performance.now();

        function step(timestamp) {
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            currentDisplayedGems = Math.floor(startVal + (target - startVal) * easeOut);
            if (headerCounter) headerCounter.textContent = currentDisplayedGems;
            if (gameCounter) gameCounter.textContent = currentDisplayedGems;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                currentDisplayedGems = target;
                if (headerCounter) headerCounter.textContent = target;
                if (gameCounter) gameCounter.textContent = target;
            }
        }
        requestAnimationFrame(step);
        saveState();
    }

    function spendGems(amount) {
        if (state.gems < amount) return false;
        state.gems -= amount;
        currentDisplayedGems = state.gems;
        const headerCounter = document.getElementById('header-gems-count');
        const gameCounter = document.getElementById('game-gems-count');
        if (headerCounter) headerCounter.textContent = state.gems;
        if (gameCounter) gameCounter.textContent = state.gems;
        saveState();
        return true;
    }

    // ==========================================
    // 8. RUNTIME ACTIVE VARIABLES
    // ==========================================
    let currentLanguage = 'id';
    let currentLevelNumber = 1;
    let activeLevelData = null;
    let revealedWords = new Set();
    let selectedLetters = [];
    let isConnecting = false;
    let isDragging = false;
    let dragStartPos = null;
    let letterNodes = [];
    let activePopupTimeout = null;
    let speedrunTimerInterval = null;
    let speedrunTimeLeft = 60;
    let speedrunScore = 0;
    let speedrunGems = 0;
    let activeArchiveTab = 'id';
    let currentTebakDiff = 'easy';

    const views = {
        lobby: document.getElementById('view-lobby'),
        selector: document.getElementById('view-selector'),
        game: document.getElementById('view-game'),
        speedrun: document.getElementById('view-speedrun'),
        tebakGambar: document.getElementById('view-tebak-gambar'),
        dailyQuiz: document.getElementById('view-daily-quiz'),
        archive: document.getElementById('view-archive'),
        certificates: document.getElementById('view-certificates'),
        gudangKata: document.getElementById('view-gudang-kata')
    };

    function switchView(key) {
        Sound.playSelect();
        if (typeof deactivateHammer === 'function') deactivateHammer();
        Object.keys(views).forEach(k => {
            if (views[k]) views[k].classList.remove('active');
        });
        if (views[key]) views[key].classList.add('active');
        updateHeaderUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateHeaderUI() {
        currentDisplayedGems = state.gems;
        const gemsEl = document.getElementById('header-gems-count');
        const gameGemsEl = document.getElementById('game-gems-count');
        if (gemsEl) gemsEl.textContent = state.gems;
        if (gameGemsEl) gameGemsEl.textContent = state.gems;

        document.getElementById('header-avatar-icon').textContent = state.avatar;
        document.getElementById('header-profile-name').textContent = state.playerName;
        document.getElementById('header-profile-title').textContent = state.title;

        const statWords = document.getElementById('lobby-stat-words');
        const statIdLvl = document.getElementById('lobby-stat-id-lvl');
        const statEnLvl = document.getElementById('lobby-stat-en-lvl');
        const statTotal = document.getElementById('lobby-stat-total-solved');

        if (statWords) statWords.textContent = state.wordsFoundTotal;
        if (statIdLvl) statIdLvl.textContent = `${state.idCompletedLevels.length} / 100`;
        if (statEnLvl) statEnLvl.textContent = `${state.enCompletedLevels.length} / 100`;
        if (statTotal) {
            const pct = Math.round(((state.idCompletedLevels.length + state.enCompletedLevels.length) / 200) * 100);
            statTotal.textContent = `${pct}%`;
        }

        document.body.className = state.activeScenicTheme || '';
        if (typeof updateDailyQuizCardLobbyTimer === 'function') {
            updateDailyQuizCardLobbyTimer();
        }
    }

    // ==========================================
    // 9. AMBIENT PARTICLES & CELEBRATION FIREWORKS
    // ==========================================
    function initAmbientParticles() {
        const canvas = document.getElementById('bg-particles-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const particles = [];
        const count = 35;

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                radius: Math.random() * 2 + 1,
                color: i % 2 === 0 ? 'rgba(0, 242, 254, ' : 'rgba(56, 189, 248, '
            });
        }

        function render() {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color + '0.5)';
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(0, 242, 254, ${0.12 * (1 - dist / 100)})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(render);
        }
        render();
    }

    let fireworksAnim = null;
    function triggerFireworks() {
        const canvas = document.getElementById('fireworks-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width = window.innerWidth;
        const height = canvas.height = window.innerHeight;
        Sound.playGrandFanfare();

        const fireworkParticles = [];
        const colors = ['#00f2fe', '#ff007f', '#ffd700', '#10b981', '#38bdf8', '#ffffff'];

        for (let i = 0; i < 180; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 2;
            fireworkParticles.push({
                x: width / 2 + (Math.random() - 0.5) * 200,
                y: height / 2.5 + (Math.random() - 0.5) * 150,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                decay: Math.random() * 0.015 + 0.008,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 4 + 2
            });
        }

        cancelAnimationFrame(fireworksAnim);
        function loop() {
            ctx.clearRect(0, 0, width, height);
            let alive = false;
            for (let i = 0; i < fireworkParticles.length; i++) {
                const p = fireworkParticles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.08;
                p.alpha -= p.decay;

                if (p.alpha > 0) {
                    alive = true;
                    ctx.save();
                    ctx.globalAlpha = p.alpha;
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
            if (alive) {
                fireworksAnim = requestAnimationFrame(loop);
            } else {
                ctx.clearRect(0, 0, width, height);
            }
        }
        loop();
    }

    // ==========================================
    // 10. ONLINE TIME REWARD CHEST
    // ==========================================
    function initOnlineRewardTimer() {
        const timerDisplay = document.getElementById('chest-timer-display');
        const claimBtn = document.getElementById('btn-claim-chest');
        const claimInterval = 300;

        function checkChest() {
            const elapsed = Math.floor((Date.now() - state.lastOnlineClaim) / 1000);
            const remaining = Math.max(0, claimInterval - elapsed);

            if (remaining === 0) {
                timerDisplay.textContent = 'SIAP KLAIM!';
                timerDisplay.style.color = 'var(--neon-emerald)';
                claimBtn.disabled = false;
                claimBtn.textContent = 'Klaim +30 💎';
            } else {
                const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
                const secs = String(remaining % 60).padStart(2, '0');
                timerDisplay.textContent = `${mins}:${secs}`;
                timerDisplay.style.color = 'var(--neon-gold)';
                claimBtn.disabled = true;
                claimBtn.textContent = 'Menunggu...';
            }
            if (typeof updateDailyQuizCardLobbyTimer === 'function') {
                updateDailyQuizCardLobbyTimer();
            }
        }

        claimBtn.addEventListener('click', () => {
            state.lastOnlineClaim = Date.now();
            addGems(30);
            checkChest();
            CustomUI.alert('Selamat! Kamu mendapatkan +30 Gems dari Peti Hadiah!', 'Peti Hadiah Waktu', '🎁✨');
        });

        setInterval(checkChest, 1000);
        checkChest();
    }

    // ==========================================
    // 11. LEVEL SELECTOR ENGINE (CLEAN LABELS)
    // ==========================================
    function renderLevelSelector() {
        const container = document.getElementById('level-grid-container');
        container.innerHTML = '';
        const completedList = currentLanguage === 'id' ? state.idCompletedLevels : state.enCompletedLevels;

        for (let i = 1; i <= 100; i++) {
            const tile = document.createElement('div');
            tile.className = 'level-tile';
            tile.textContent = i;

            const isDone = completedList.includes(i);
            const isUnlocked = i === 1 || completedList.includes(i - 1) || isDone;

            if (isDone) {
                tile.classList.add('completed');
            } else if (!isUnlocked) {
                tile.classList.add('locked');
            } else {
                tile.classList.add('current');
            }

            tile.addEventListener('click', () => {
                if (!isUnlocked) {
                    Sound.playError();
                    CustomUI.toast(`Level ${i} masih terkunci! Selesaikan level sebelumnya.`, 'error');
                    return;
                }
                loadLevel(currentLanguage, i);
            });

            container.appendChild(tile);
        }
    }

    // ==========================================
    // 12. WORD CONNECT GAMEPLAY CORE
    // ==========================================
    function loadLevel(lang, lvl) {
        currentLanguage = lang;
        currentLevelNumber = lvl;
        activeLevelData = GAME_LEVELS[lang][lvl - 1];
        revealedWords.clear();

        document.getElementById('game-active-level-label').textContent = `LEVEL ${lvl}`;
        document.getElementById('game-active-lang-label').textContent = lang === 'id' ? 'Bahasa Indonesia' : 'English';
        document.getElementById('game-gems-count').textContent = state.gems;
        document.getElementById('bonus-jar-count').textContent = `${state.bonusWordsFound.length} Kata`;

        renderCrosswordBoard();
        renderLetterWheel('wheel-wrapper', 'wheel-svg', 'current-word-preview');
        switchView('game');
    }

    let isHammerActive = false;

    function deactivateHammer() {
        isHammerActive = false;
        const hammerBtn = document.getElementById('btn-booster-hammer');
        const board = document.getElementById('crossword-board');
        if (hammerBtn) hammerBtn.classList.remove('hammer-active');
        if (board) board.classList.remove('hammer-mode-board');
    }

    function checkRowCompletion(row) {
        if (!row) return;
        const word = row.dataset.word;
        if (!word) return;
        const tiles = Array.from(row.querySelectorAll('.word-tile'));
        const allRevealed = tiles.length > 0 && tiles.every(t => t.classList.contains('revealed'));
        if (allRevealed && !revealedWords.has(word)) {
            revealedWords.add(word);
            state.wordsFoundTotal++;
            var _discArr = currentLanguage === 'id' ? state.discoveredWordsId : state.discoveredWordsEn;
            if (!_discArr.includes(word)) _discArr.push(word);
            saveState();

            if (revealedWords.size === activeLevelData.targets.length) {
                setTimeout(() => {
                    handleLevelClear();
                }, 400);
            }
        }
    }

    function renderCrosswordBoard() {
        deactivateHammer();
        const board = document.getElementById('crossword-board');
        board.innerHTML = '';

        activeLevelData.targets.forEach((word) => {
            const row = document.createElement('div');
            row.className = 'word-row';
            row.dataset.word = word;

            for (let i = 0; i < word.length; i++) {
                const tile = document.createElement('div');
                tile.className = 'word-tile';
                tile.dataset.char = word[i];

                if (revealedWords.has(word)) {
                    tile.textContent = word[i];
                    tile.classList.add('revealed');
                } else {
                    tile.textContent = '';
                }

                // Re-play practice on click or Hammer reveal
                tile.addEventListener('click', () => {
                    if (isHammerActive) {
                        if (tile.classList.contains('revealed')) {
                            CustomUI.toast('Petak ini sudah terbuka! Ketuk petak kosong yang ingin dibuka.');
                            return;
                        }
                        if (state.gems < 50) {
                            Sound.playError();
                            CustomUI.toast('Gems tidak cukup! Butuh 50 💎 untuk Palu.', 'error');
                            deactivateHammer();
                            return;
                        }
                        spendGems(50);
                        Sound.playGemCollect();
                        tile.textContent = tile.dataset.char;
                        tile.classList.add('revealed', 'hammer-hit');
                        deactivateHammer();
                        CustomUI.toast('🔨 Petak berhasil dibuka dengan Palu! (-50 💎)', 'success');
                        checkRowCompletion(row);
                        return;
                    }

                    if (tile.classList.contains('revealed')) {
                        Sound.speak(word, currentLanguage);
                        showCenteredPopup(word, activeLevelData.definitions[word] || 'Kosa kata tersimpan.');
                    }
                });

                row.appendChild(tile);
            }
            board.appendChild(row);
        });
    }

    function renderLetterWheel(wrapperId, svgId, previewId) {
        const wrapper = document.getElementById(wrapperId);
        const svg = document.getElementById(svgId);
        const preview = document.getElementById(previewId);
        const letters = activeLevelData ? activeLevelData.letters : [];

        wrapper.querySelectorAll('.wheel-letter-btn').forEach(b => b.remove());
        if (svg) svg.innerHTML = '';
        selectedLetters = [];
        letterNodes = [];

        const radius = 90;
        const centerX = 130;
        const centerY = 130;
        const total = letters.length;

        letters.forEach((letter, index) => {
            const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            const btn = document.createElement('div');
            btn.className = 'wheel-letter-btn';
            btn.textContent = letter;
            btn.style.left = `${x - 24}px`;
            btn.style.top = `${y - 24}px`;
            btn.dataset.index = index;
            btn.dataset.letter = letter;

            const nodeObj = { index, letter, x, y, element: btn };
            letterNodes.push(nodeObj);
            wrapper.appendChild(btn);

            // Interactive Tap-to-Connect Letter Trigger
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleNodeTap(nodeObj, svg, preview);
            });
        });

        setupDragConnecting(wrapper, svg, preview);

        // Render virtual keyboard
        const kbContainerId = wrapperId === 'speedrun-wheel-wrapper' ? 'speedrun-virtual-keyboard' : 'wheel-virtual-keyboard';
        renderVirtualKeyboard(kbContainerId, letters, svgId, previewId);
    }

    // ==========================================
    // VIRTUAL KEYBOARD RENDERING & SYNC
    // ==========================================
    function renderVirtualKeyboard(containerId, letters, svgId, previewId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        if (!letters || letters.length === 0) return;

        const svg = document.getElementById(svgId);
        const preview = document.getElementById(previewId);

        letterNodes.forEach((node) => {
            const keyBtn = document.createElement('button');
            keyBtn.type = 'button';
            keyBtn.className = 'wheel-kb-key';
            keyBtn.textContent = node.letter;
            keyBtn.dataset.index = node.index;
            keyBtn.dataset.letter = node.letter;

            keyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleNodeTap(node, svg, preview);
            });
            container.appendChild(keyBtn);
        });

        // Quick action keys inside virtual keyboard
        const resetBtn = document.createElement('button');
        resetBtn.type = 'button';
        resetBtn.className = 'wheel-kb-key action-key';
        resetBtn.textContent = '↺';
        resetBtn.title = 'Reset (Esc)';
        resetBtn.style.color = 'var(--neon-gold)';
        resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            clearWheelSelection(svg, preview);
        });
        container.appendChild(resetBtn);

        const backBtn = document.createElement('button');
        backBtn.type = 'button';
        backBtn.className = 'wheel-kb-key action-key';
        backBtn.textContent = '⌫';
        backBtn.title = 'Hapus (Backspace)';
        backBtn.style.color = '#ef4444';
        backBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            clearLastSelectedLetter(svg, preview);
        });
        container.appendChild(backBtn);

        const submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.className = 'wheel-kb-key action-key';
        submitBtn.textContent = '✓';
        submitBtn.title = 'Kirim (Enter)';
        submitBtn.style.color = 'var(--neon-emerald)';
        submitBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            submitCurrentFormedWord(svg, preview);
        });
        container.appendChild(submitBtn);

        syncVirtualKeyboardActiveStates();
    }

    function syncVirtualKeyboardActiveStates() {
        const activeNodes = new Set(selectedLetters);
        document.querySelectorAll('.wheel-virtual-keyboard .wheel-kb-key:not(.action-key)').forEach(btn => {
            const idx = parseInt(btn.dataset.index, 10);
            const node = letterNodes[idx];
            if (node && activeNodes.has(node)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // ==========================================
    // INTERACTIVE TAP-TO-CONNECT HANDLERS
    // ==========================================
    function handleNodeTap(node, svg, preview) {
        // If clicking the last selected letter, treat as undo
        if (selectedLetters.length > 0 && selectedLetters[selectedLetters.length - 1] === node) {
            clearLastSelectedLetter(svg, preview);
            return;
        }

        // If clicking an already selected node earlier in the sequence, prevent duplicate
        if (selectedLetters.includes(node)) return;

        // Append to connection sequence
        selectedLetters.push(node);
        node.element.classList.add('active');
        Sound.playLetterConnect(selectedLetters.length - 1);

        // Draw clean connecting lines between all tapped letters sequentially
        redrawCleanConnectingLines(svg, null);
        const formed = selectedLetters.map(n => n.letter).join('');
        if (preview) preview.textContent = formed;

        syncVirtualKeyboardActiveStates();

        // Auto-match check: If formed word matches an unsolved grid target word, validate automatically!
        if (activeLevelData && activeLevelData.targets && activeLevelData.targets.includes(formed) && !revealedWords.has(formed)) {
            setTimeout(() => {
                validateFormedWord(formed);
                clearWheelSelection(svg, preview);
            }, 180);
        }
    }

    function clearWheelSelection(svg, preview) {
        selectedLetters = [];
        letterNodes.forEach(n => n.element.classList.remove('active'));
        if (svg) svg.innerHTML = '';
        if (preview) preview.textContent = '- - -';
        syncVirtualKeyboardActiveStates();
    }

    function clearLastSelectedLetter(svg, preview) {
        if (selectedLetters.length === 0) return;
        const popped = selectedLetters.pop();
        if (popped) popped.element.classList.remove('active');
        Sound.playSelect();
        redrawCleanConnectingLines(svg, null);
        const formed = selectedLetters.map(n => n.letter).join('');
        if (preview) preview.textContent = formed || '- - -';
        syncVirtualKeyboardActiveStates();
    }

    function submitCurrentFormedWord(svg, preview) {
        const formed = selectedLetters.map(n => n.letter).join('');
        if (formed.length >= 2) {
            validateFormedWord(formed);
        } else if (formed.length === 1) {
            CustomUI.toast('Pilih minimal 2 huruf untuk membentuk kata!', 'info');
        }
        clearWheelSelection(svg, preview);
    }

    // Smooth Scramble & Rotation Animation on Shuffle
    function triggerWheelShuffle(wrapperId, svgId, previewId, letterArray) {
        if (!letterArray || letterArray.length === 0) return;
        const wrapper = document.getElementById(wrapperId);
        if (!wrapper) return;
        const centerBtn = wrapper.querySelector('.wheel-center-btn');
        const letterBtns = wrapper.querySelectorAll('.wheel-letter-btn');
        const svg = document.getElementById(svgId);
        const preview = document.getElementById(previewId);

        clearWheelSelection(svg, preview);
        Sound.playShuffle();

        if (centerBtn) {
            centerBtn.classList.remove('spinning');
            void centerBtn.offsetWidth;
            centerBtn.classList.add('spinning');
        }

        letterBtns.forEach((btn, idx) => {
            btn.classList.remove('shuffling', 'active');
            btn.style.animationDelay = `${idx * 40}ms`;
            void btn.offsetWidth;
            btn.classList.add('shuffling');
        });

        setTimeout(() => {
            // Fisher-Yates Scramble
            for (let i = letterArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [letterArray[i], letterArray[j]] = [letterArray[j], letterArray[i]];
            }
            renderLetterWheel(wrapperId, svgId, previewId);
            if (centerBtn) centerBtn.classList.remove('spinning');
        }, 280);
    }

    function setupDragConnecting(wrapper, svg, preview) {
        let isPointerDown = false;
        let isDraggingGesture = false;
        let startCoord = null;

        function getCoords(e) {
            const rect = wrapper.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        function getNodeAt(pos) {
            return letterNodes.find(node => {
                const dx = pos.x - node.x;
                const dy = pos.y - node.y;
                return Math.sqrt(dx * dx + dy * dy) < 28;
            });
        }

        const startPointer = (e) => {
            isPointerDown = true;
            isDraggingGesture = false;
            startCoord = getCoords(e);
        };

        const movePointer = (e) => {
            if (!isPointerDown) return;
            const pos = getCoords(e);
            const dist = Math.hypot(pos.x - startCoord.x, pos.y - startCoord.y);

            // Once movement exceeds 9px, switch to drag connecting mode
            if (dist > 9 && !isDraggingGesture) {
                isDraggingGesture = true;
                const startHit = getNodeAt(startCoord);
                if (startHit && !selectedLetters.includes(startHit)) {
                    clearWheelSelection(svg, preview);
                    selectedLetters.push(startHit);
                    startHit.element.classList.add('active');
                    Sound.playLetterConnect(0);
                }
            }

            if (isDraggingGesture) {
                const hit = getNodeAt(pos);
                if (hit && !selectedLetters.includes(hit)) {
                    selectedLetters.push(hit);
                    hit.element.classList.add('active');
                    Sound.playLetterConnect(selectedLetters.length - 1);
                    syncVirtualKeyboardActiveStates();
                }
                redrawCleanConnectingLines(svg, pos);
                if (preview) preview.textContent = selectedLetters.map(n => n.letter).join('') || '- - -';
            }
        };

        const endPointer = () => {
            if (!isPointerDown) return;
            isPointerDown = false;

            if (isDraggingGesture) {
                isDraggingGesture = false;
                const formed = selectedLetters.map(n => n.letter).join('');
                clearWheelSelection(svg, preview);
                if (formed.length >= 2) {
                    validateFormedWord(formed);
                }
            }
            // If it was just a tap without drag, do NOT clear selection!
            // This preserves Tap-to-Connect letter-by-letter mechanics.
        };

        wrapper.onpointerdown = startPointer;
        window.onpointermove = movePointer;
        window.onpointerup = endPointer;
    }

    function redrawCleanConnectingLines(svg, pointerPos) {
        if (!svg) return;
        svg.innerHTML = '';
        if (selectedLetters.length === 0) return;

        // Draw clean sequential lines between connected letters
        for (let i = 0; i < selectedLetters.length - 1; i++) {
            const n1 = selectedLetters[i];
            const n2 = selectedLetters[i + 1];
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', n1.x);
            line.setAttribute('y1', n1.y);
            line.setAttribute('x2', n2.x);
            line.setAttribute('y2', n2.y);
            line.setAttribute('stroke', '#00f2fe');
            line.setAttribute('stroke-width', '5');
            line.setAttribute('stroke-linecap', 'round');
            line.setAttribute('filter', 'drop-shadow(0 0 6px #00f2fe)');
            svg.appendChild(line);
        }

        // Live trailing line to pointer during drag mode
        if (pointerPos && selectedLetters.length > 0) {
            const last = selectedLetters[selectedLetters.length - 1];
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', last.x);
            line.setAttribute('y1', last.y);
            line.setAttribute('x2', pointerPos.x);
            line.setAttribute('y2', pointerPos.y);
            line.setAttribute('stroke', 'rgba(255, 0, 127, 0.7)');
            line.setAttribute('stroke-width', '4');
            line.setAttribute('stroke-linecap', 'round');
            svg.appendChild(line);
        }
    }

    function validateFormedWord(word) {
        if (!activeLevelData) return;

        // 1. Crossword Grid Target Word Match
        if (activeLevelData.targets.includes(word)) {
            if (revealedWords.has(word)) {
                Sound.playSelect();
                showCenteredPopup(word, 'Kata ini sudah kamu temukan!');
                return;
            }

            revealedWords.add(word);
            state.wordsFoundTotal++;
            Sound.playWordSuccess();
            addGems(10); // Smooth count-up

            // Track for Gudang Kata
            var _discArr = currentLanguage === 'id' ? state.discoveredWordsId : state.discoveredWordsEn;
            if (!_discArr.includes(word)) _discArr.push(word);

            const row = document.querySelector(`.word-row[data-word="${word}"]`);
            if (row) {
                row.querySelectorAll('.word-tile').forEach((tile, idx) => {
                    tile.textContent = word[idx];
                    tile.classList.add('revealed');
                });
            }

            const def = activeLevelData.definitions[word] || 'Kosa kata resmi terverifikasi.';
            Sound.speak(word, currentLanguage);
            showCenteredPopup(word, def);
            saveState();

            if (revealedWords.size === activeLevelData.targets.length) {
                handleLevelClear();
            }
            return;
        }

        // 2. Bonus Word Match
        if (activeLevelData.bonus && activeLevelData.bonus.includes(word)) {
            if (state.bonusWordsFound.includes(word)) {
                Sound.playSelect();
                showCenteredPopup(word, 'Kata bonus ini sudah masuk toples.');
                return;
            }

            state.bonusWordsFound.push(word);
            state.wordsFoundTotal++;
            Sound.playBonusWord();
            addGems(5); // Smooth count-up
            document.getElementById('bonus-jar-count').textContent = `${state.bonusWordsFound.length} Kata`;
            showCenteredPopup(word, `🌟 KATA BONUS! +5 💎 ditambahkan ke toples!`);
            saveState();
            return;
        }

        // 3. Invalid Word
        Sound.playError();
        const preview = document.getElementById('current-word-preview');
            preview.textContent = '❌ ' + word;
        setTimeout(() => {
            if (preview.textContent.startsWith('❌')) preview.textContent = '- - -';
        }, 800);
    }

    async function handleLevelClear() {
        Sound.playLevelClear();
        addGems(25); // Level completion reward count-up

        const completedList = currentLanguage === 'id' ? state.idCompletedLevels : state.enCompletedLevels;
        if (!completedList.includes(currentLevelNumber)) {
            completedList.push(currentLevelNumber);
        }

        // Milestone Background Unlocks
        const milestoneList = currentLanguage === 'id' ? SCENIC_ARCHIVE_ID : SCENIC_ARCHIVE_EN;
        const unlockedStorage = currentLanguage === 'id' ? state.unlockedBackgroundsId : state.unlockedBackgroundsEn;
        const milestone = milestoneList.find(m => m.level === currentLevelNumber);

        if (milestone && !unlockedStorage.includes(milestone.level)) {
            unlockedStorage.push(milestone.level);
            CustomUI.alert(`Warna tema latar "${milestone.title}" kini telah terbuka di Background Archive!`, 'Tema Baru Terbuka!', '🎨');
        }

        checkCertificateThresholds();
        saveState();

        setTimeout(async () => {
            if (currentLevelNumber < 100) {
        const proceed = await CustomUI.confirm(`Selamat! Kamu mendapatkan +25 💎!\nLanjut ke Level ${currentLevelNumber + 1}?`, `Level ${currentLevelNumber} Selesai!`, '🏆');
                if (proceed) {
                    loadLevel(currentLanguage, currentLevelNumber + 1);
                } else {
                    switchView('selector');
                    renderLevelSelector();
                }
            } else {
                triggerFireworks();
                await CustomUI.alert(`Kamu telah menamatkan seluruh 100 Level ${currentLanguage === 'id' ? 'Bahasa Indonesia' : 'English'}! Buka menu Sertifikat untuk melihat prestasimu!`, 'Luar Biasa!', '👑');
                switchView('certificates');
                renderCertificate(currentLanguage === 'id' ? 'id' : 'en');
            }
        }, 1200);
    }

    // ==========================================
    // 13. CENTERED DYNAMIC TTS POPUP
    // ==========================================
    function showCenteredPopup(word, definition) {
        const popup = document.getElementById('centered-tts-popup');
        const wordEl = document.getElementById('popup-word-text');
        const defEl = document.getElementById('popup-def-text');
        const progressEl = document.getElementById('popup-progress');

        wordEl.textContent = word;
        defEl.textContent = definition;

        popup.classList.add('show');

        progressEl.style.transition = 'none';
        progressEl.style.transform = 'scaleX(1)';
        setTimeout(() => {
            progressEl.style.transition = 'transform 2.5s linear';
            progressEl.style.transform = 'scaleX(0)';
        }, 20);

        clearTimeout(activePopupTimeout);
        activePopupTimeout = setTimeout(() => {
            popup.classList.remove('show');
        }, 2600);

        document.getElementById('btn-popup-audio').onclick = () => {
            Sound.speak(word, currentLanguage);
        };

        document.getElementById('btn-popup-close').onclick = () => {
            clearTimeout(activePopupTimeout);
            popup.classList.remove('show');
        };
    }

    // ==========================================
    // 14. POWER-UPS & BOOSTERS
    // ==========================================
    function initBoosters() {
        const wandBtn = document.getElementById('btn-booster-wand');
        if (wandBtn) {
            wandBtn.addEventListener('click', () => {
                deactivateHammer();
                if (state.gems < 40) {
                    Sound.playError();
                    CustomUI.toast('Gems tidak cukup! Butuh 40 💎.', 'error');
                    return;
                }
                const unrevealedTiles = Array.from(document.querySelectorAll('.word-tile:not(.revealed)'));
                if (unrevealedTiles.length === 0) {
                    CustomUI.toast('Semua huruf sudah terbuka!');
                    return;
                }
                spendGems(40);
                Sound.playGemCollect();
                const targetTile = unrevealedTiles[Math.floor(Math.random() * unrevealedTiles.length)];
                targetTile.textContent = targetTile.dataset.char;
                targetTile.classList.add('revealed');
                checkRowCompletion(targetTile.closest('.word-row'));
            });
        }

        const bombBtn = document.getElementById('btn-booster-bomb');
        if (bombBtn) {
            bombBtn.addEventListener('click', () => {
                deactivateHammer();
                if (state.gems < 75) {
                    Sound.playError();
                    CustomUI.toast('Gems tidak cukup! Butuh 75 💎.', 'error');
                    return;
                }
                // Target rows that are uncompleted to blast in one concentrated cluster area
                const uncompletedRows = Array.from(document.querySelectorAll('.word-row')).filter(r => {
                    return r.querySelector('.word-tile:not(.revealed)');
                });
                if (uncompletedRows.length === 0) {
                    CustomUI.toast('Semua huruf sudah terbuka!');
                    return;
                }

                // Pick the row with the most unrevealed tiles
                uncompletedRows.sort((a, b) => {
                    const unrevA = a.querySelectorAll('.word-tile:not(.revealed)').length;
                    const unrevB = b.querySelectorAll('.word-tile:not(.revealed)').length;
                    return unrevB - unrevA;
                });

                const targetRow = uncompletedRows[0];
                const unrevealedInRow = Array.from(targetRow.querySelectorAll('.word-tile:not(.revealed)'));
                const countToReveal = Math.min(3, unrevealedInRow.length);

                spendGems(75);
                Sound.playGemCollect();

                for (let i = 0; i < countToReveal; i++) {
                    const tile = unrevealedInRow[i];
                    tile.textContent = tile.dataset.char;
                    tile.classList.add('revealed', 'bomb-revealed');
                }

                CustomUI.toast('💥 BOOM!', 'success');
                checkRowCompletion(targetRow);
            });
        }

        const hammerBtn = document.getElementById('btn-booster-hammer');
        if (hammerBtn) {
            hammerBtn.addEventListener('click', () => {
                const unrevealedTiles = Array.from(document.querySelectorAll('.word-tile:not(.revealed)'));
                if (unrevealedTiles.length === 0) {
                    CustomUI.toast('Semua huruf di papan sudah terbuka!');
                    return;
                }
                if (state.gems < 50) {
                    Sound.playError();
                    CustomUI.toast('Gems tidak cukup! Butuh 50 💎 untuk Palu.', 'error');
                    return;
                }
                // Toggle mode
                if (isHammerActive) {
                    deactivateHammer();
                    CustomUI.toast('Mode Palu dibatalkan.');
                } else {
                    isHammerActive = true;
                    hammerBtn.classList.add('hammer-active');
                    const board = document.getElementById('crossword-board');
                    if (board) board.classList.add('hammer-mode-board');
                    CustomUI.toast('🔨 Mode Palu Aktif! Ketuk petak kosong yang ingin dibuka (50 💎).', 'info');
                }
            });
        }

        document.getElementById('btn-shuffle-wheel').addEventListener('click', () => {
            if (!activeLevelData) return;
            triggerWheelShuffle('wheel-wrapper', 'wheel-svg', 'current-word-preview', activeLevelData.letters);
        });

        // Tap-to-Connect Interactive Controls (Clear, Reset, Submit, Preview click)
        const btnClearWord = document.getElementById('btn-clear-word');
        const btnResetWord = document.getElementById('btn-reset-word');
        const btnSubmitWord = document.getElementById('btn-submit-word');
        const wordPreview = document.getElementById('current-word-preview');

        if (btnClearWord) {
            btnClearWord.addEventListener('click', () => {
                clearLastSelectedLetter(document.getElementById('wheel-svg'), document.getElementById('current-word-preview'));
            });
        }
        if (btnResetWord) {
            btnResetWord.addEventListener('click', () => {
                clearWheelSelection(document.getElementById('wheel-svg'), document.getElementById('current-word-preview'));
            });
        }
        if (btnSubmitWord) {
            btnSubmitWord.addEventListener('click', () => {
                submitCurrentFormedWord(document.getElementById('wheel-svg'), document.getElementById('current-word-preview'));
            });
        }
        if (wordPreview) {
            wordPreview.addEventListener('click', () => {
                submitCurrentFormedWord(document.getElementById('wheel-svg'), document.getElementById('current-word-preview'));
            });
        }

        // Virtual Keyboard Toggle Handler
        const btnToggleWheelKb = document.getElementById('btn-toggle-wheel-kb');
        const wheelKbContainer = document.getElementById('wheel-virtual-keyboard');
        if (btnToggleWheelKb && wheelKbContainer) {
            btnToggleWheelKb.addEventListener('click', () => {
                const isHidden = wheelKbContainer.style.display === 'none' || !wheelKbContainer.style.display;
                if (isHidden) {
                    wheelKbContainer.style.display = 'flex';
                    btnToggleWheelKb.textContent = '⌨️ Sembunyikan Keyboard';
                } else {
                    wheelKbContainer.style.display = 'none';
                    btnToggleWheelKb.textContent = '⌨️ Tampilkan Keyboard';
                }
            });
        }
    }

    // ==========================================
    // 15. SPEED RUN MODE (60s)
    // ==========================================
    function startSpeedRunMode() {
        speedrunTimeLeft = 60;
        speedrunScore = 0;
        speedrunGems = 0;
        switchView('speedrun');

        const timerFill = document.getElementById('speedrun-timer-fill');
        const timerDisplay = document.getElementById('speedrun-time-display');
        const scoreDisplay = document.getElementById('speedrun-score-display');
        const gemsDisplay = document.getElementById('speedrun-gems-earned');

        timerFill.style.width = '100%';
        timerDisplay.textContent = '60s';
        scoreDisplay.textContent = '0';
        gemsDisplay.textContent = '+0 💎';

        loadSpeedRunLevel();

        clearInterval(speedrunTimerInterval);
        speedrunTimerInterval = setInterval(() => {
            speedrunTimeLeft--;
            timerDisplay.textContent = `${speedrunTimeLeft}s`;
            timerFill.style.width = `${(speedrunTimeLeft / 60) * 100}%`;

            if (speedrunTimeLeft <= 0) {
                clearInterval(speedrunTimerInterval);
                endSpeedRun();
            }
        }, 1000);
    }

    function loadSpeedRunLevel() {
        const seed = ID_SEEDS[Math.floor(Math.random() * ID_SEEDS.length)];
        activeLevelData = {
            targets: seed.targets,
            letters: seed.letters.split(''),
            definitions: seed.defs || {}
        };
        revealedWords.clear();

        const board = document.getElementById('speedrun-board');
        board.innerHTML = '';
        activeLevelData.targets.forEach((word) => {
            const row = document.createElement('div');
            row.className = 'word-row';
            row.dataset.word = word;
            for (let i = 0; i < word.length; i++) {
                const tile = document.createElement('div');
                tile.className = 'word-tile';
                tile.dataset.char = word[i];
                row.appendChild(tile);
            }
            board.appendChild(row);
        });

        renderLetterWheel('speedrun-wheel-wrapper', 'speedrun-wheel-svg', 'speedrun-word-preview');
        
        const speedrunShuffleBtn = document.getElementById('btn-speedrun-shuffle');
        if (speedrunShuffleBtn) {
            speedrunShuffleBtn.onclick = () => {
                triggerWheelShuffle('speedrun-wheel-wrapper', 'speedrun-wheel-svg', 'speedrun-word-preview', activeLevelData.letters);
            };
        }

        const btnSrClear = document.getElementById('btn-speedrun-clear');
        const btnSrReset = document.getElementById('btn-speedrun-reset');
        const btnSrSubmit = document.getElementById('btn-speedrun-submit');
        const srWordPreview = document.getElementById('speedrun-word-preview');

        if (btnSrClear) {
            btnSrClear.onclick = () => {
                clearLastSelectedLetter(document.getElementById('speedrun-wheel-svg'), document.getElementById('speedrun-word-preview'));
            };
        }
        if (btnSrReset) {
            btnSrReset.onclick = () => {
                clearWheelSelection(document.getElementById('speedrun-wheel-svg'), document.getElementById('speedrun-word-preview'));
            };
        }
        if (btnSrSubmit) {
            btnSrSubmit.onclick = () => {
                submitCurrentFormedWord(document.getElementById('speedrun-wheel-svg'), document.getElementById('speedrun-word-preview'));
            };
        }
        if (srWordPreview) {
            srWordPreview.onclick = () => {
                submitCurrentFormedWord(document.getElementById('speedrun-wheel-svg'), document.getElementById('speedrun-word-preview'));
            };
        }

        const btnToggleSrKb = document.getElementById('btn-speedrun-toggle-kb');
        const srKbContainer = document.getElementById('speedrun-virtual-keyboard');
        if (btnToggleSrKb && srKbContainer) {
            btnToggleSrKb.onclick = () => {
                const isHidden = srKbContainer.style.display === 'none' || !srKbContainer.style.display;
                if (isHidden) {
                    srKbContainer.style.display = 'flex';
                    btnToggleSrKb.textContent = '⌨️ Sembunyikan Keyboard';
                } else {
                    srKbContainer.style.display = 'none';
                    btnToggleSrKb.textContent = '⌨️ Tampilkan Keyboard';
                }
            };
        }
    }

    async function endSpeedRun() {
        Sound.playLevelClear();
        addGems(speedrunGems);
        await CustomUI.alert(`Skor Akhir: ${speedrunScore}\nBonus Gems Didapat: +${speedrunGems} 💎`, 'Speed Run Berakhir!', '⏱️');
        switchView('lobby');
    }

    // ==========================================
    // 16. ADVANCED TEBAK GAMBAR WITH REBUS PUZZLE CLUES
    // ==========================================
    let tebakRevealedIndices = new Set();

    function renderTebakProgressiveHint(answer) {
        const chars = [];
        for (let i = 0; i < answer.length; i++) {
            const c = answer[i];
            if (c === ' ') {
                chars.push('   ');
            } else if (tebakRevealedIndices.has(i)) {
                chars.push(c);
            } else {
                chars.push('_');
            }
        }
        const hintEl = document.getElementById('tebak-hint-letters');
        if (hintEl) hintEl.textContent = chars.join(' ');
    }

    function loadTebakGambar() {
        const pool = TEBAK_GAMBAR_TIERS[currentTebakDiff];
        const idx = state.tebakDiffIndices[currentTebakDiff] % pool.length;
        const currentData = pool[idx];

        document.getElementById('tebak-level-indicator').textContent = 
            `TINGKAT: ${currentTebakDiff.toUpperCase()}`;

        const rebusBoard = document.getElementById('tebak-rebus-board');
        rebusBoard.innerHTML = '';

        // Render Rebus Visuals WITHOUT Leaking Answer Text (Point 8)
        currentData.rebus.forEach(item => {
            if (item.symbol) {
                const sym = document.createElement('div');
                sym.className = 'rebus-math-symbol';
                sym.textContent = item.symbol;
                rebusBoard.appendChild(sym);
            } else {
                const rItem = document.createElement('div');
                rItem.className = 'rebus-item';

                // Only show modification tags (strikethrough / replace) without base word text
                let subtextHTML = '';
                if (item.strike) {
                    subtextHTML = `<span class="strikethrough-tag">-${item.strike}</span>${item.replace ? `<span class="replace-tag">+${item.replace}</span>` : ''}`;
                }

                rItem.innerHTML = `
                    <div class="rebus-art-box">${item.icon}</div>
                    ${subtextHTML ? `<div class="rebus-subtext">${subtextHTML}</div>` : ''}
                `;
                rebusBoard.appendChild(rItem);
            }
        });

        document.getElementById('tebak-clue-text').textContent = currentData.clue;

        // Initialize Progressive Hint: 1st letter starter, rest masked (Point 9)
        tebakRevealedIndices.clear();
        if (currentData.answer.length > 0 && currentData.answer[0] !== ' ') {
            tebakRevealedIndices.add(0);
        }
        renderTebakProgressiveHint(currentData.answer);

        const input = document.getElementById('tebak-user-input');
        input.value = '';
        input.focus();
        switchView('tebakGambar');
    }

    async function submitTebakGambarAnswer() {
        const pool = TEBAK_GAMBAR_TIERS[currentTebakDiff];
        const idx = state.tebakDiffIndices[currentTebakDiff] % pool.length;
        const currentData = pool[idx];

        const input = document.getElementById('tebak-user-input');
        const rawVal = input.value.trim();
        if (!rawVal) return;

        // Normalisasi teks universal: hilangkan seluruh spasi, tanda minus/tanda baca
        const normalizeStr = (s) => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        const userNorm = normalizeStr(rawVal);
        const ansNorm = normalizeStr(currentData.answer);

        // Cek kecocokan apakah diketik dengan spasi, tanpa spasi, atau tanda hubung
        let isCorrect = (userNorm === ansNorm);

        // Cek daftar variasi alias jawaban jika tersedia
        if (!isCorrect && currentData.aliases && Array.isArray(currentData.aliases)) {
            isCorrect = currentData.aliases.some(alias => normalizeStr(alias) === userNorm);
        }

        // Cek kecocokan kalimat satu spasi standar
        if (!isCorrect) {
            const cleanUser = rawVal.toUpperCase().replace(/\s+/g, ' ');
            const cleanAns = currentData.answer.trim().toUpperCase().replace(/\s+/g, ' ');
            if (cleanUser === cleanAns) isCorrect = true;
        }

        if (isCorrect) {
            Sound.playWordSuccess();
            addGems(20);
            state.tebakDiffIndices[currentTebakDiff]++;
            Sound.speak(currentData.answer, 'id');
            saveState();

            await CustomUI.alert(`Jawabannya adalah "${currentData.answer}".\nKamu mendapatkan +20 💎!`, 'Benar Sekali!', '🎉');
            loadTebakGambar();
        } else {
            Sound.playError();
            CustomUI.toast('Jawaban belum tepat, silakan coba lagi!', 'error');
            input.select();
        }
    }

    function initTebakGambar() {
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentTebakDiff = btn.dataset.diff;
                loadTebakGambar();
            });
        });

        // Dedicated Kirim Button & Physical Enter key (Point 11)
        document.getElementById('btn-submit-tebak').addEventListener('click', submitTebakGambarAnswer);

        document.getElementById('tebak-user-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitTebakGambarAnswer();
            }
        });

        // Custom Web-Built On-Screen Arcade Keyboard (Point 11)
        const vKeyboard = document.getElementById('tebak-virtual-keyboard');
        if (vKeyboard) {
            vKeyboard.querySelectorAll('.tebak-kb-key').forEach(keyBtn => {
                keyBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const input = document.getElementById('tebak-user-input');
                    const charKey = keyBtn.dataset.key;
                    const action = keyBtn.dataset.action;

                    if (charKey !== undefined) {
                        input.value += charKey;
                        Sound.playSelect();
                    } else if (action === 'clear') {
                        input.value = input.value.slice(0, -1);
                        Sound.playSelect();
                    } else if (action === 'submit') {
                        submitTebakGambarAnswer();
                    }
                });
            });
        }

        // Progressive 1-Letter Hint System (Point 9)
        document.getElementById('btn-tebak-hint').addEventListener('click', () => {
            const pool = TEBAK_GAMBAR_TIERS[currentTebakDiff];
            const idx = state.tebakDiffIndices[currentTebakDiff] % pool.length;
            const currentData = pool[idx];

            const hiddenIndices = [];
            for (let i = 0; i < currentData.answer.length; i++) {
                if (currentData.answer[i] !== ' ' && !tebakRevealedIndices.has(i)) {
                    hiddenIndices.push(i);
                }
            }

            if (hiddenIndices.length === 0) {
                CustomUI.toast('Semua huruf petunjuk sudah terbuka!', 'info');
                return;
            }

            if (state.gems < 15) {
                CustomUI.toast('Gems tidak cukup untuk membuka petunjuk! (Butuh 15 💎)', 'error');
                return;
            }

            spendGems(15);
            Sound.playGemCollect();

            // Reveal strictly 1 random hidden letter
            const pickedIdx = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
            tebakRevealedIndices.add(pickedIdx);
            renderTebakProgressiveHint(currentData.answer);
            CustomUI.toast(`+1 Huruf '${currentData.answer[pickedIdx]}' terbuka!`, 'success');
        });

        document.getElementById('btn-tebak-skip').addEventListener('click', () => {
            state.tebakDiffIndices[currentTebakDiff]++;
            saveState();
            loadTebakGambar();
        });
    }

    // ==========================================
    // 17. TRULY RANDOMIZED DAILY QUIZ (A, B, C, D) & 24H COOLDOWN (7 SOAL)
    // ==========================================
    const DAILY_QUIZ_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 jam cooldown
    const DAILY_QUIZ_SESSION_SIZE = 7;

    let dailyQuizSessionIndex = 0;
    let dailyQuizSessionPool = [];

    function formatDailyQuizCountdown(remainingMs) {
        if (remainingMs <= 0) return '00:00:00';
        const totalSecs = Math.ceil(remainingMs / 1000);
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function formatDailyQuizRemainingFriendly(remainingMs) {
        if (remainingMs <= 0) return '0 detik';
        const totalSecs = Math.ceil(remainingMs / 1000);
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        const parts = [];
        if (h > 0) parts.push(`${h} jam`);
        if (m > 0 || h > 0) parts.push(`${m} menit`);
        parts.push(`${s} detik`);
        return parts.join(' ');
    }

    function updateDailyQuizCardLobbyTimer() {
        const cardDesc = document.getElementById('daily-quiz-card-desc');
        if (!cardDesc) return;
        const elapsed = Date.now() - (state.lastDailyQuizCompleted || 0);
        const remaining = DAILY_QUIZ_COOLDOWN_MS - elapsed;
        if (!state.lastDailyQuizCompleted || remaining <= 0) {
            cardDesc.textContent = 'Tantangan 7 kuis kosa kata harian dengan 4 pilihan acak (A, B, C, D) berhadiah Gems.';
        } else {
            cardDesc.textContent = `Daily Quiz selesai! Reset dalam ${formatDailyQuizCountdown(remaining)}.`;
        }
    }

    function getShuffledDailyPool() {
        const pool = [...DAILY_QUIZ_RAW];
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        return pool.slice(0, DAILY_QUIZ_SESSION_SIZE);
    }

    function openDailyQuiz() {
        const elapsed = Date.now() - (state.lastDailyQuizCompleted || 0);
        const remaining = DAILY_QUIZ_COOLDOWN_MS - elapsed;
        if (state.lastDailyQuizCompleted && remaining > 0) {
            const timeRemainingText = formatDailyQuizRemainingFriendly(remaining);
            CustomUI.alert(
                `Daily Quiz sudah di kerjakan! Tunggu ${timeRemainingText} lagi dan kau akan bisa mengerjakan Daily Quiz Kembali!`,
                'Daily Quiz Selesai',
                '📅'
            );
            return;
        }

        dailyQuizSessionIndex = 0;
        dailyQuizSessionPool = getShuffledDailyPool();
        loadDailyQuizQuestion();
        switchView('dailyQuiz');
    }

    function loadDailyQuizQuestion() {
        if (!dailyQuizSessionPool || dailyQuizSessionPool.length === 0) {
            dailyQuizSessionPool = getShuffledDailyPool();
        }

        const raw = dailyQuizSessionPool[dailyQuizSessionIndex] || DAILY_QUIZ_RAW[0];

        const progressBadge = document.getElementById('daily-quiz-progress-badge');
        if (progressBadge) {
            progressBadge.textContent = `SOAL ${dailyQuizSessionIndex + 1} DARI ${DAILY_QUIZ_SESSION_SIZE}`;
        }

        document.getElementById('daily-quiz-question').textContent = raw.question;
        const optionsBox = document.getElementById('daily-quiz-options');
        const feedback = document.getElementById('daily-quiz-feedback');
        const nextBtn = document.getElementById('btn-next-quiz');

        optionsBox.innerHTML = '';
        feedback.style.display = 'none';
        nextBtn.style.display = 'none';

        const allOptions = [
            { text: raw.correctAnswer, isCorrect: true },
            ...raw.distractors.map(d => ({ text: d, isCorrect: false }))
        ];

        // Fisher-Yates Shuffle for true randomness across all 4 positions
        for (let i = allOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
        }

        const letters = ['A', 'B', 'C', 'D'];

        allOptions.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option-btn';
            btn.innerHTML = `
                <span class="opt-badge">${letters[idx]}</span>
                <span>${opt.text}</span>
            `;

            btn.addEventListener('click', () => {
                optionsBox.querySelectorAll('button').forEach(b => b.disabled = true);

                if (opt.isCorrect) {
                    Sound.playWordSuccess();
                    addGems(15);
                    btn.classList.add('correct');
                    feedback.style.display = 'block';
                    feedback.style.background = 'rgba(16, 185, 129, 0.2)';
                    feedback.style.border = '1px solid var(--neon-emerald)';
                    feedback.innerHTML = `✅ <b>BENAR! (+15 💎)</b><br>${raw.explanation}`;
                } else {
                    Sound.playError();
                    btn.classList.add('wrong');
                    optionsBox.querySelectorAll('.quiz-option-btn').forEach((b, i) => {
                        if (allOptions[i].isCorrect) b.classList.add('correct');
                    });
                    feedback.style.display = 'block';
                    feedback.style.background = 'rgba(239, 68, 68, 0.2)';
                    feedback.style.border = '1px solid #ef4444';
                    feedback.innerHTML = `❌ <b>BELUM TEPAT</b><br>${raw.explanation}`;
                }

                nextBtn.style.display = 'block';
                const isLast = (dailyQuizSessionIndex === DAILY_QUIZ_SESSION_SIZE - 1);
                nextBtn.textContent = isLast ? 'Selesai ✓' : 'Soal Berikutnya →';
            });

            optionsBox.appendChild(btn);
        });

        nextBtn.onclick = async () => {
            dailyQuizSessionIndex++;
            if (dailyQuizSessionIndex >= DAILY_QUIZ_SESSION_SIZE) {
                state.lastDailyQuizCompleted = Date.now();
                saveState();
                updateDailyQuizCardLobbyTimer();
                await CustomUI.alert(
                    'Terima kasih sudah mengerjakan Daily Quiz!\n\nSeluruh 7 tantangan kata hari ini telah kamu selesaikan dengan gemilang. Countdown 24 jam telah dimulai, silakan kembali lagi besok!',
                    'Terima Kasih!',
                    '🎉'
                );
                switchView('lobby');
            } else {
                loadDailyQuizQuestion();
            }
        };
    }

    function loadDailyQuiz() {
        openDailyQuiz();
    }

    // ==========================================
    // 18. SEPARATED BACKGROUND ARCHIVE (INDO VS EN)
    // ==========================================
    function renderBackgroundArchive() {
        const container = document.getElementById('archive-grid-container');
        container.innerHTML = '';

        const milestoneList = activeArchiveTab === 'id' ? SCENIC_ARCHIVE_ID : SCENIC_ARCHIVE_EN;
        const unlockedStorage = activeArchiveTab === 'id' ? state.unlockedBackgroundsId : state.unlockedBackgroundsEn;

        document.getElementById('archive-id-count').textContent = state.unlockedBackgroundsId.length;
        document.getElementById('archive-en-count').textContent = state.unlockedBackgroundsEn.length;

        milestoneList.forEach(bg => {
            const card = document.createElement('div');
            card.className = 'archive-card glass-panel';
            const isUnlocked = unlockedStorage.includes(bg.level);
            const isActive = (state.activeScenicTheme || '') === (bg.themeClass || '');

            card.innerHTML = `
                <div class="archive-scenic-preview ${isActive ? 'active-theme' : ''}" style="background: ${bg.previewGradient}">
                    <span style="font-size: 2.2rem;">${isUnlocked ? '🏞️' : '🔒'}</span>
                    <span style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-top: 4px;">Level ${bg.level}</span>
                </div>
                <div>
                    <h4 style="font-size: 1.05rem; color: var(--neon-cyan); margin-bottom: 4px;">${bg.title}</h4>
                    <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">${bg.desc}</p>
                </div>
                <button class="btn-secondary" style="margin-top: 6px;" ${!isUnlocked ? 'disabled' : ''}>
                    ${isActive ? '✓ Sedang Dipakai' : isUnlocked ? 'Terapkan Pemandangan' : `Terkunci (Level ${bg.level})`}
                </button>
            `;

            if (isUnlocked) {
                card.querySelector('button').addEventListener('click', () => {
                    state.activeScenicTheme = bg.themeClass;
                    Sound.playSelect();
                    saveState();
                    renderBackgroundArchive();
                    CustomUI.toast(`Pemandangan alam "${bg.title}" berhasil diterapkan!`, 'success');
                });
            }

            container.appendChild(card);
        });
    }

    // ==========================================
    // 19. 3-TIER PRESTIGIOUS CERTIFICATES & REWARDS
    // ==========================================
    function checkCertificateThresholds() {
        const idDone = state.idCompletedLevels.length >= 100;
        const enDone = state.enCompletedLevels.length >= 100;

        if (idDone && enDone) {
            state.title = 'Master Dwibhasa';
        } else if (idDone) {
            state.title = 'Penjelajah Kata Nusantara';
        } else if (enDone) {
            state.title = 'Word Explorer';
        }
        saveState();
    }

    function renderCertificate(tier = 'id') {
        const card = document.getElementById('certificate-display-card');
        const idDone = state.idCompletedLevels.length >= 100;
        const enDone = state.enCompletedLevels.length >= 100;

        if (tier === 'id') {
            card.innerHTML = `
                <div class="cert-ornament">🇮🇩 🇮🇩 🇮🇩</div>
                <h3 class="cert-title">SERTIFIKAT BAHASA INDONESIA</h3>
                <div style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 8px;">Diberikan secara terhormat kepada:</div>
                <div class="cert-recipient">${state.playerName}</div>
                <p class="cert-text">
                    Atas ketekunan luar biasa menyelesaikan seluruh 100 Tingkatan Teka-Teki Kosa Kata Bahasa Indonesia, 
                    membuktikan kecintaan mendalam pada bahasa persatuan serta berhak menyandang gelar kehormatan:
                </p>
                <div style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--neon-cyan); margin-bottom: 16px;">
                    "PENJELAJAH KATA NUSANTARA"
                </div>
                <div class="cert-seal">${idDone ? '🏅' : '🔒'}</div>
                <div style="font-weight: 700; color: ${idDone ? 'var(--neon-emerald)' : '#888'};">
                    ${idDone ? 'STATUS: RESMI TERVERIFIKASI' : `PROGRES: ${state.idCompletedLevels.length} / 100 LEVEL`}
                </div>
            `;
        } else if (tier === 'en') {
            card.innerHTML = `
                <div class="cert-ornament">🇬🇧 🌍 🇬🇧</div>
                <h3 class="cert-title">CERTIFICATE OF ENGLISH PROFICIENCY</h3>
                <div style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 8px;">This certificate is proudly conferred upon:</div>
                <div class="cert-recipient">${state.playerName}</div>
                <p class="cert-text">
                    For extraordinary mastery in discovering, pronouncing, and completing all 100 Levels of English vocabulary puzzles,
                    duly recognized and decorated with the international distinction:
                </p>
                <div style="font-family: var(--font-heading); font-size: 1.5rem; color: var(--neon-pink); margin-bottom: 16px;">
                    "HONORARY WORD EXPLORER"
                </div>
                <div class="cert-seal">${enDone ? '🎖️' : '🔒'}</div>
                <div style="font-weight: 700; color: ${enDone ? 'var(--neon-emerald)' : '#888'};">
                    ${enDone ? 'STATUS: OFFICIAL PROFICIENCY CONFIRMED' : `PROGRESS: ${state.enCompletedLevels.length} / 100 LEVELS`}
                </div>
            `;
        } else {
            const allDone = idDone && enDone;
            card.innerHTML = `
                <div class="cert-ornament">👑 ⚡ 👑</div>
                <h3 class="cert-title" style="color: var(--neon-gold);">GRAND FINALE TROPHY & MASTER DWIBHASA</h3>
                <div style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 8px;">Penganugerahan Tertinggi Puncak Jagat Aksara:</div>
                <div class="cert-recipient">${state.playerName}</div>
                <p class="cert-text">
                    Pencapaian legendaris menaklukkan total 200 Tingkatan Kosa Kata Lintas Dwibahasa. 
                    Membuka gerbang kearifan tanpa batas sebagai Penyelamat & Penguasa Tertinggi:
                </p>
                <div style="font-family: var(--font-heading); font-size: 1.7rem; color: var(--neon-gold); margin-bottom: 16px; text-shadow: 0 0 20px rgba(255, 215, 0, 0.6);">
                    "MASTER DWIBHASA / PENYELAMAT VOCAB ARCADE"
                </div>
                <div class="cert-seal">${allDone ? '🏆' : '🔒'}</div>
                <div style="font-weight: 700; color: ${allDone ? 'var(--neon-gold)' : '#888'};">
                    ${allDone ? 'STATUS: MAHA KARYA JUARA SEJATI' : `TOTAL PROGRES: ${state.idCompletedLevels.length + state.enCompletedLevels.length} / 200 LEVEL`}
                </div>
            `;
            if (allDone) triggerFireworks();
        }
    }

    // ==========================================
    // 20. PROFILE & AVATAR MODAL
    // ==========================================
    function initProfileModal() {
        const modal = document.getElementById('modal-profile');
        const openBtn = document.getElementById('btn-open-profile');
        const closeBtn = document.getElementById('btn-close-profile-modal');
        const nameInput = document.getElementById('profile-name-input');
        const avatarGrid = document.getElementById('avatar-selection-grid');
        const saveBtn = document.getElementById('btn-save-profile');
        let chosenAvatar = state.avatar;

        function populateProfileStats() {
            const totalIdLevels = state.idCompletedLevels ? state.idCompletedLevels.length : 0;
            const totalEnLevels = state.enCompletedLevels ? state.enCompletedLevels.length : 0;
            const totalPct = Math.round((totalIdLevels + totalEnLevels) / 200 * 100);
            const vaultCount = ((state.discoveredWordsId || []).length) + ((state.discoveredWordsEn || []).length);
            const activeLvl = currentLevelNumber || 1;

            const el = (id) => document.getElementById(id);
            if (el('pstat-words-total')) el('pstat-words-total').textContent = state.wordsFoundTotal || 0;
            if (el('pstat-id-level'))   el('pstat-id-level').textContent   = totalIdLevels + ' / 100';
            if (el('pstat-en-level'))   el('pstat-en-level').textContent   = totalEnLevels + ' / 100';
            if (el('pstat-total-pct'))  el('pstat-total-pct').textContent  = totalPct + '%';
            if (el('pstat-gems'))       el('pstat-gems').textContent       = state.gems || 0;
            if (el('pstat-vault'))      el('pstat-vault').textContent      = vaultCount;
            if (el('pstat-active-lvl')) el('pstat-active-lvl').textContent = 'Lv.' + activeLvl;
            if (el('pstat-title'))      el('pstat-title').textContent      = state.title || 'Penjelajah Kata';
        }

        openBtn.addEventListener('click', () => {
            nameInput.value = state.playerName;
            chosenAvatar = state.avatar;
            avatarGrid.innerHTML = '';

            AVATAR_LIST.forEach(av => {
                const item = document.createElement('div');
                item.className = `avatar-choice ${chosenAvatar === av.icon ? 'selected' : ''}`;
                item.innerHTML = `<span class="avatar-icon">${av.icon}</span><span class="avatar-label">${av.label}</span>`;
                item.addEventListener('click', () => {
                    avatarGrid.querySelectorAll('.avatar-choice').forEach(c => c.classList.remove('selected'));
                    item.classList.add('selected');
                    chosenAvatar = av.icon;
                });
                avatarGrid.appendChild(item);
            });

            populateProfileStats();
            modal.classList.add('show');
        });

        closeBtn.addEventListener('click', () => modal.classList.remove('show'));

        saveBtn.addEventListener('click', () => {
            const rawVal = nameInput.value;
            const newName = rawVal ? rawVal.trim() : '';
            if (!newName) {
                CustomUI.toast('Silakan masukkan nama kamu terlebih dahulu!', 'error');
                nameInput.focus();
                return;
            }
            state.playerName = newName; // Strictly preserve exact casing as typed by the player
            state.avatar = chosenAvatar || state.avatar;
            state.hasVisited = true;
            saveState();
            updateHeaderUI();
            modal.classList.remove('show');
            CustomUI.toast(`Profil berhasil disimpan! Halo, ${state.playerName}!`, 'success');
        });

        document.getElementById('btn-reset-data').addEventListener('click', async () => {
            const ok = await CustomUI.confirm('Apakah kamu yakin ingin mereset seluruh progres permainan? Semua pencapaian dan Gems akan kembali ke awal.', 'Peringatan Reset Progres', '⚠️');
            if (ok) {
                localStorage.removeItem(STORAGE_KEY);
                location.reload();
            }
        });
    }

    // ==========================================
    // 21. TUTORIAL & CARA BERMAIN MODAL
    // ==========================================
    function initTutorialModal() {
        const modal = document.getElementById('modal-tutorial');
        const openBtn = document.getElementById('nav-btn-tutorial');
        const closeBtn = document.getElementById('btn-close-tutorial-modal');
        const okBtn = document.getElementById('btn-close-tutorial-ok');

        if (!modal) return;
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                Sound.playSelect();
                modal.classList.add('show');
            });
        }
        if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('show'));
        if (okBtn) okBtn.addEventListener('click', () => modal.classList.remove('show'));
    }

    // ==========================================
    // 21. FULLSCREEN TOGGLE & KEYBOARD ENGINE
    // ==========================================
    function initFullscreen() {
        const btn = document.getElementById('btn-toggle-fullscreen');
        if (!btn) return;

        btn.addEventListener('click', toggleFullscreen);

        const updateFSState = () => {
            const isFS = !!document.fullscreenElement;
            const icon = btn.querySelector('.fs-icon');
            const text = btn.querySelector('.fs-text');
            if (icon) icon.textContent = isFS ? '🗗' : '⛶';
            if (text) text.textContent = isFS ? 'Exit Full' : 'Fullscreen';
            btn.setAttribute('title', isFS ? 'Keluar Layar Penuh (Exit Fullscreen)' : 'Layar Penuh (Fullscreen)');
        };

        document.addEventListener('fullscreenchange', updateFSState);
        document.addEventListener('webkitfullscreenchange', updateFSState);
    }

    function toggleFullscreen() {
        Sound.playSelect();
        if (!document.fullscreenElement) {
            const el = document.documentElement;
            if (el.requestFullscreen) {
                el.requestFullscreen().catch(() => {
                    CustomUI.toast('Izin fullscreen tidak diizinkan oleh browser.', 'info');
                });
            } else if (el.webkitRequestFullscreen) {
                el.webkitRequestFullscreen();
            } else if (el.msRequestFullscreen) {
                el.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    function initKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            const modalOverlay = document.getElementById('custom-modal-overlay');
            const profileModal = document.getElementById('modal-profile');
            if (modalOverlay && modalOverlay.classList.contains('show')) return;
            if (profileModal && profileModal.classList.contains('show')) return;

            // In Word Connect View
            if (views.game && views.game.classList.contains('active')) {
                const svg = document.getElementById('wheel-svg');
                const preview = document.getElementById('current-word-preview');
                if (e.key === 'Backspace') {
                    e.preventDefault();
                    clearLastSelectedLetter(svg, preview);
                } else if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    submitCurrentFormedWord(svg, preview);
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    clearWheelSelection(svg, preview);
                } else if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
                    const pressed = e.key.toUpperCase();
                    const availableNode = letterNodes.find(n => n.letter === pressed && !selectedLetters.includes(n));
                    if (availableNode) {
                        e.preventDefault();
                        handleNodeTap(availableNode, svg, preview);
                    }
                }
            } else if (views.speedrun && views.speedrun.classList.contains('active')) {
                const svg = document.getElementById('speedrun-wheel-svg');
                const preview = document.getElementById('speedrun-word-preview');
                if (e.key === 'Backspace') {
                    e.preventDefault();
                    clearLastSelectedLetter(svg, preview);
                } else if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    submitCurrentFormedWord(svg, preview);
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    clearWheelSelection(svg, preview);
                } else if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
                    const pressed = e.key.toUpperCase();
                    const availableNode = letterNodes.find(n => n.letter === pressed && !selectedLetters.includes(n));
                    if (availableNode) {
                        e.preventDefault();
                        handleNodeTap(availableNode, svg, preview);
                    }
                }
            } else if (views.tebakGambar && views.tebakGambar.classList.contains('active')) {
                const input = document.getElementById('tebak-user-input');
                if (e.key === 'Enter') {
                    e.preventDefault();
                    submitTebakGambarAnswer();
                } else if (document.activeElement !== input) {
                    if (e.key.length === 1 && /[a-zA-Z0-9 ]/.test(e.key)) {
                        input.value += e.key.toUpperCase();
                        Sound.playSelect();
                    } else if (e.key === 'Backspace') {
                        e.preventDefault();
                        input.value = input.value.slice(0, -1);
                        Sound.playSelect();
                    }
                }
            }
        });
    }

    // ==========================================
    // 22. AUTOMATIC LANDSCAPE ENFORCEMENT (Point 10)
    // ==========================================
    function initOrientationEnforcer() {
        const overlay = document.getElementById('landscape-warning-overlay');
        if (!overlay) return;

        function checkOrientation() {
            const isPortrait = window.innerHeight > window.innerWidth;
            if (isPortrait) {
                overlay.classList.add('active');
            } else {
                overlay.classList.remove('active');
            }
        }

        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);
        checkOrientation();
    }

    // ==========================================
    // 23. INITIALIZATION & EVENT WIRING
    // ==========================================
    function init() {
        loadState();
        initFullscreen();
        initOrientationEnforcer();
        initKeyboardControls();
        initAmbientParticles();
        initOnlineRewardTimer();
        initBoosters();
        initProfileModal();
        initTutorialModal();
        initTebakGambar();

        // Navigation
        document.getElementById('btn-home-logo').addEventListener('click', () => switchView('lobby'));
        document.getElementById('nav-btn-play').addEventListener('click', () => {
            renderLevelSelector();
            switchView('selector');
        });
        document.getElementById('nav-btn-speedrun').addEventListener('click', startSpeedRunMode);
        document.getElementById('nav-btn-tebak-gambar').addEventListener('click', loadTebakGambar);
        document.getElementById('nav-btn-daily-quiz').addEventListener('click', loadDailyQuiz);
        document.getElementById('nav-btn-archive').addEventListener('click', () => {
            renderBackgroundArchive();
            switchView('archive');
        });
        document.getElementById('nav-btn-certificates').addEventListener('click', () => {
            renderCertificate('id');
            switchView('certificates');
        });

        // Back Buttons with Custom Confirm (Zero native browser dialogs)
        document.getElementById('btn-back-from-selector').addEventListener('click', () => switchView('lobby'));
        document.getElementById('btn-back-from-game').addEventListener('click', async () => {
        const ok = await CustomUI.confirm('Kembali ke Menu Utama? Progres level tersimpan.', 'Kembali ke Menu', '🏠');
            if (ok) switchView('lobby');
        });
        document.getElementById('btn-back-from-speedrun').addEventListener('click', () => {
            clearInterval(speedrunTimerInterval);
            switchView('lobby');
        });
        document.getElementById('btn-back-from-tebak').addEventListener('click', () => switchView('lobby'));
        document.getElementById('btn-back-from-quiz').addEventListener('click', () => switchView('lobby'));
        document.getElementById('btn-back-from-archive').addEventListener('click', () => switchView('lobby'));
        document.getElementById('btn-back-from-cert').addEventListener('click', () => switchView('lobby'));

        // Language Tabs in Selector
        document.getElementById('tab-lang-id').addEventListener('click', () => {
            document.getElementById('tab-lang-id').classList.add('active');
            document.getElementById('tab-lang-en').classList.remove('active');
            currentLanguage = 'id';
            renderLevelSelector();
        });
        document.getElementById('tab-lang-en').addEventListener('click', () => {
            document.getElementById('tab-lang-en').classList.add('active');
            document.getElementById('tab-lang-id').classList.remove('active');
            currentLanguage = 'en';
            renderLevelSelector();
        });

        // Separated Archive Language Tabs
        document.getElementById('tab-archive-id').addEventListener('click', () => {
            document.getElementById('tab-archive-id').classList.add('active');
            document.getElementById('tab-archive-en').classList.remove('active');
            activeArchiveTab = 'id';
            renderBackgroundArchive();
        });
        document.getElementById('tab-archive-en').addEventListener('click', () => {
            document.getElementById('tab-archive-en').classList.add('active');
            document.getElementById('tab-archive-id').classList.remove('active');
            activeArchiveTab = 'en';
            renderBackgroundArchive();
        });

        // Certificate Tabs
        document.getElementById('btn-show-cert-id').addEventListener('click', (e) => {
            document.querySelectorAll('#view-certificates .lang-tab').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            renderCertificate('id');
        });
        document.getElementById('btn-show-cert-en').addEventListener('click', (e) => {
            document.querySelectorAll('#view-certificates .lang-tab').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            renderCertificate('en');
        });
        document.getElementById('btn-show-cert-grand').addEventListener('click', (e) => {
            document.querySelectorAll('#view-certificates .lang-tab').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            renderCertificate('grand');
        });


        // Gudang Kata navigation wiring
        var btnGudangKataMenu = document.getElementById('nav-btn-gudang-kata');
        if (btnGudangKataMenu) {
            btnGudangKataMenu.addEventListener('click', function() {
                activeGudangTab = 'id';
                var ti = document.getElementById('tab-gudang-id');
                var te = document.getElementById('tab-gudang-en');
                if (ti) ti.classList.add('active');
                if (te) te.classList.remove('active');
                renderGudangKata();
                switchView('gudangKata');
            });
        }
        var btnProfStats = document.getElementById('nav-btn-profile-stats');
        if (btnProfStats) {
            btnProfStats.addEventListener('click', function() {
                var pb = document.getElementById('btn-open-profile');
                if (pb) pb.click();
            });
        }
        var btnBackGudang = document.getElementById('btn-back-from-gudang');
        if (btnBackGudang) btnBackGudang.addEventListener('click', function() { switchView('lobby'); });
        var tabGudId = document.getElementById('tab-gudang-id');
        if (tabGudId) {
            tabGudId.addEventListener('click', function() {
                tabGudId.classList.add('active');
                var te2 = document.getElementById('tab-gudang-en');
                if (te2) te2.classList.remove('active');
                activeGudangTab = 'id';
                renderGudangKata();
            });
        }
        var tabGudEn = document.getElementById('tab-gudang-en');
        if (tabGudEn) {
            tabGudEn.addEventListener('click', function() {
                tabGudEn.classList.add('active');
                var ti2 = document.getElementById('tab-gudang-id');
                if (ti2) ti2.classList.remove('active');
                activeGudangTab = 'en';
                renderGudangKata();
            });
        }
        var gudSearchInp = document.getElementById('gudang-search-input');
        if (gudSearchInp) gudSearchInp.addEventListener('input', renderGudangKata);
        var gudSearchClr = document.getElementById('btn-gudang-search-clear');
        if (gudSearchClr) {
            gudSearchClr.addEventListener('click', function() {
                var inp = document.getElementById('gudang-search-input');
                if (inp) { inp.value = ''; renderGudangKata(); }
            });
        }

        updateHeaderUI();
        checkFirstTimeVisitor();
    }

    function checkFirstTimeVisitor() {
        if (!state.hasVisited) {
            const modal = document.getElementById('modal-profile');
            if (!modal) return;
            const nameInput = document.getElementById('profile-name-input');
            const avatarGrid = document.getElementById('avatar-selection-grid');
            if (nameInput) {
                nameInput.value = '';
                nameInput.placeholder = 'Ketik namamu di sini...';
            }
            if (avatarGrid) {
                avatarGrid.innerHTML = '';
                AVATAR_LIST.forEach(av => {
                    const item = document.createElement('div');
                    item.className = `avatar-choice ${state.avatar === av.icon ? 'selected' : ''}`;
                    item.innerHTML = `<span class="avatar-icon">${av.icon}</span><span class="avatar-label">${av.label}</span>`;
                    item.addEventListener('click', () => {
                        avatarGrid.querySelectorAll('.avatar-choice').forEach(c => c.classList.remove('selected'));
                        item.classList.add('selected');
                        state.avatar = av.icon;
                    });
                    avatarGrid.appendChild(item);
                });
            }
            setTimeout(() => {
                CustomUI.alert(
                    'Halo Penjelajah Kata! 👋\n\nSelamat datang di Vocab Arcade! Karena kamu baru pertama kali membuka web ini, silakan masukkan namamu dan pilih avatar karakter untuk memulai!',
                    'Pemain Baru Terdeteksi',
                    '🎮'
                ).then(() => {
                    modal.classList.add('show');
                    if (nameInput) nameInput.focus();
                });
            }, 350);
        }
    }


    // ==========================================
    // GUDANG KATA BILINGUAL - WORD VAULT SYSTEM
    // ==========================================
    var activeGudangTab = 'id';

    function getAllWordsForLang(lang) {
        var levels = GAME_LEVELS[lang];
        var wordMap = {};
        levels.forEach(function(lvl) {
            lvl.targets.forEach(function(w) {
                if (!wordMap[w]) {
                    wordMap[w] = (lvl.definitions && lvl.definitions[w])
                        ? lvl.definitions[w]
                        : (lang === 'id' ? 'Kosa kata Bahasa Indonesia.' : 'English vocabulary word.');
                }
            });
        });
        return wordMap;
    }

    function renderGudangKata() {
        var tab = activeGudangTab;
        var allWords = getAllWordsForLang(tab);
        var allWordsId = getAllWordsForLang('id');
        var allWordsEn = getAllWordsForLang('en');
        var discovered = tab === 'id' ? state.discoveredWordsId : state.discoveredWordsEn;
        var searchEl = document.getElementById('gudang-search-input');
        var searchVal = searchEl ? searchEl.value.toUpperCase().trim() : '';

        var totalTargetPerLang = 400;
        var discCount = discovered ? discovered.length : 0;
        var isMastered = discCount >= totalTargetPerLang;

        var elDisc = document.getElementById('gudang-stat-discovered');
        var elTotal = document.getElementById('gudang-stat-total');
        var elBar = document.getElementById('gudang-progress-bar');
        var elPct = document.getElementById('gudang-stat-percent');
        var elCountId = document.getElementById('gudang-tab-count-id');
        var elCountEn = document.getElementById('gudang-tab-count-en');
        var headerPanel = document.querySelector('.gudang-header-panel');

        if (elDisc) elDisc.textContent = discCount;
        if (elTotal) elTotal.textContent = isMastered ? '400' : '???';

        if (isMastered) {
            if (elPct) elPct.textContent = '400/400 (100% Master)';
            if (elBar) elBar.style.width = '100%';
            if (headerPanel) headerPanel.classList.add('gudang-gold-mastery');
        } else {
            var pct = Math.min(99, Math.round((discCount / totalTargetPerLang) * 100));
            if (elPct) elPct.textContent = pct + '% Terbuka';
            if (elBar) elBar.style.width = pct + '%';
            if (headerPanel) headerPanel.classList.remove('gudang-gold-mastery');
        }

        var idCount = (state.discoveredWordsId || []).length;
        var enCount = (state.discoveredWordsEn || []).length;
        if (elCountId) elCountId.textContent = idCount >= 400 ? '400/400' : (idCount + '/???');
        if (elCountEn) elCountEn.textContent = enCount >= 400 ? '400/400' : (enCount + '/???');

        var grid = document.getElementById('gudang-words-grid');
        if (!grid) return;
        grid.innerHTML = '';

        var entries = Object.entries(allWords);
        var rendered = 0;

        entries.forEach(function(entry) {
            var word = entry[0];
            var def = entry[1];
            var isDiscovered = discovered.includes(word);

            if (searchVal) {
                if (isDiscovered) {
                    var matches = word.toUpperCase().includes(searchVal) || def.toUpperCase().includes(searchVal);
                    if (!matches) return;
                } else {
                    return;
                }
            }

            rendered++;
            var card = document.createElement('div');
            card.className = 'gudang-word-card' + (isDiscovered ? '' : ' locked');

            if (isDiscovered) {
                card.innerHTML =
                    '<div class="gudang-card-top">' +
                        '<span class="gudang-card-word">' + word + '</span>' +
                        '<button class="gudang-audio-btn" title="Dengarkan Pelafalan">&#x1F50A;</button>' +
                    '</div>' +
                    '<p class="gudang-card-def">' + def + '</p>' +
                    '<span class="gudang-card-badge">&#x2713; Ditemukan</span>';
                (function(w, d, t) {
                    card.addEventListener('click', function() {
                        Sound.speak(w, t);
                        showCenteredPopup(w, d);
                    });
                    card.querySelector('.gudang-audio-btn').addEventListener('click', function(e) {
                        e.stopPropagation();
                        Sound.speak(w, t);
                    });
                })(word, def, tab);
            } else {
                card.innerHTML =
                    '<div class="gudang-card-top">' +
                        '<span class="gudang-card-word" style="letter-spacing:6px;opacity:0.4;">? ? ?</span>' +
                        '<span style="font-size:1.2rem;opacity:0.5;">&#x1F512;</span>' +
                    '</div>' +
                    '<p class="gudang-card-def" style="color:var(--text-secondary);font-style:italic;">Temukan kata ini dalam permainan untuk membuka definisinya!</p>' +
                    '<span class="gudang-card-badge locked-badge">Terkunci</span>';
            }
            grid.appendChild(card);
        });

        if (rendered === 0) {
            grid.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:40px;grid-column:1/-1;">' +
                (searchVal ? 'Tidak ada hasil yang cocok dengan pencarian.' : 'Belum ada kata yang ditemukan untuk bahasa ini. Mainkan level terlebih dahulu!') +
                '</p>';
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
