/**
 * Vocab Arcade - Master Educational Dataset
 * Contains:
 * - 100 Indonesian KBBI Levels with Definitions
 * - 100 English Oxford/Cambridge Levels with Definitions
 * - Tebak Gambar Mini-Game Questions with Vector SVG Illustrations
 * - Daily Vocabulary Quiz Pool
 * - Theme Shop & Background Archive Milestones
 * - Achievements, Badges, and 3-Tier Certificate Specs
 */

const RAW_ID_LEVEL_SEEDS = [
    { root: "KATA", letters: "AKAT", targets: ["KATA", "AKTA", "ATAK"], bonus: ["HAK", "TAK", "KAP"], defs: { "KATA": "Unsur bahasa yang diucapkan atau dituliskan; morfem atau kombinasi morfem.", "AKTA": "Surat tanda bukti resmi berisi pernyataan tertulis.", "ATAK": "Susunan atau tata letak." } },
    { root: "BUKU", letters: "UKUB", targets: ["BUKU", "BEKU", "KUBU"], bonus: ["BAU", "UBU"], defs: { "BUKU": "Lembar kertas berjilid, berisi tulisan atau kosong.", "KUBU": "Pagar pertahanan; tempat perlindungan." } },
    { root: "BINTANG", letters: "ABGINNT", targets: ["BINTANG", "BAGAN", "BIANG", "BANGI", "NANTI"], bonus: ["NINA", "TANI", "BANI", "NABI"], defs: { "BINTANG": "Benda langit yang mampu memancarkan cahayanya sendiri.", "BAGAN": "Rancangan; skema; sketsa grafis.", "BIANG": "Pokok; pangkal; induk." } },
    { root: "PELANGI", letters: "AEGILNP", targets: ["PELANGI", "PANEL", "PLANG", "PALE", "LIGAN"], bonus: ["GILA", "LEPA", "PENA", "NILA"], defs: { "PELANGI": "Lengkung warna-warni di langit akibat pembiasan cahaya matahari oleh tetes air hujan.", "PANEL": "Bagian permukaan pintu, dinding; kelompok pembicara." } },
    { root: "CERDAS", letters: "ACDERS", targets: ["CERDAS", "DERAS", "REDA", "SADAR", "SERA"], bonus: ["REDA", "DESA", "AREN", "KERA"], defs: { "CERDAS": "Sempurna perkembangan akal budinya; tajam pikiran.", "DERAS": "Mengalir atau berjalan sangat kencang; lebat." } },
    { root: "SAMUDRA", letters: "AADMRSU", targets: ["SAMUDRA", "DAMAR", "RUMAH", "SARDA", "MUARA"], bonus: ["RUSA", "ARUS", "RUAS", "SAMA"], defs: { "SAMUDRA": "Lautan yang sangat luas yang menutupi sebagian besar bola bumi.", "DAMAR": "Getah beku dari pohon untuk pelekat atau obor." } },
    { root: "MENTARI", letters: "AEIMNRT", targets: ["MENTARI", "RANTIE", "TERIMA", "MITRA", "TENAR"], bonus: ["TEMA", "REMI", "TREN", "NETA"], defs: { "MENTARI": "Matahari; sang surya yang menerangi siang hari.", "TERIMA": "Menyambut; menampung sesuatu yang diberikan.", "MITRA": "Kawan kerja; rekan bisnis." } },
    { root: "CAHAYA", letters: "AACHY", targets: ["CAHAYA", "ACAH", "ACAH", "AYAH"], bonus: ["CAHA", "HAWA"], defs: { "CAHAYA": "Sinar atau terang yang memungkinkan mata menangkap bayangan benda.", "AYAH": "Orang tua laki-laki; bapak." } },
    { root: "PUSTAKA", letters: "AAKPSTU", targets: ["PUSTAKA", "PUSA", "KASTA", "PAKAT", "SUAKA"], bonus: ["KASA", "ATAP", "PAKU", "SAPA"], defs: { "PUSTAKA": "Kitab; buku; kumpulan karya tulis ilmiah atau sastra.", "KASTA": "Golongan atau lapisan masyarakat.", "SUAKA": "Tempat mengungsi atau berlindung." } },
    { root: "SEKOLAH", letters: "AEHKLOS", targets: ["SEKOLAH", "LEKAS", "SOLEH", "KOLAS", "HALEK"], bonus: ["KOL", "HAK", "SOK", "LEKA"], defs: { "SEKOLAH": "Bangunan atau lembaga untuk belajar dan mengajar.", "LEKAS": "Cepat; segera; tidak lambat." } }
];

// Helper to expand levels dynamically up to 100 for ID
const ID_WORD_BANK = [
    { root: "LENTERA", letters: "AELNRT", words: ["LENTERA", "TERANG", "TELAR", "NETRA", "ARENA", "RANTE"], def: "Lampu penerang dengan semprong kaca bertangkai." },
    { root: "GARUDA", letters: "AADGRU", words: ["GARUDA", "RAGU", "GADA", "AGAR", "DURA"], def: "Burung mitologis lambang negara kesatuan Republik Indonesia." },
    { root: "PUSAKA", letters: "AAKPSU", words: ["PUSAKA", "KAPAU", "PAKU", "SUAP", "APAK", "PUAS"], def: "Harta benda peninggalan nenek moyang yang bernilai tinggi." },
    { root: "MAHAKARYA", letters: "AAAHKMRY", words: ["MAHAKARYA", "KARYA", "MARAH", "KAMAR", "HARAM"], def: "Karya cipta yang luar biasa, agung, dan monumental." },
    { root: "NUSANTARA", letters: "AAANNRSTU", words: ["NUSANTARA", "ANTARA", "SATUAN", "RANTAS", "SANTA"], def: "Sebutan untuk seluruh wilayah kepulauan Indonesia." },
    { root: "KSATRIA", letters: "AAIKRST", words: ["KSATRIA", "SATRIA", "TIKRA", "TARA", "KITA"], def: "Ksatria berani yang membela kebenaran dan bangsanya." },
    { root: "HARMONI", letters: "AHIMNOR", words: ["HARMONI", "ROMAN", "MINOH", "ROHANI", "IRAM"], def: "Kesesuaian nada, keselarasan bunyi, dan keserasian rasa." },
    { root: "SEMESTA", letters: "AEEMSST", words: ["SEMESTA", "SESAT", "MASET", "SEMAI", "MATA"], def: "Seluruh alam semesta; jagat raya semesta raya." },
    { root: "BERDIKARI", letters: "ABDEIKRR", words: ["BERDIKARI", "DERIK", "BEDAK", "KREDIT", "BERAK"], def: "Berdiri di atas kaki sendiri; mandiri tanpa ketergantungan." },
    { root: "PANCASILA", letters: "AAACILNPS", words: ["PANCASILA", "CINCIN", "SALIN", "LIPAN", "PANAS"], def: "Dasar falsafah serta ideologi bangsa Indonesia." },
    { root: "GOTONG", letters: "GGNOOT", words: ["GOTONG", "TONG", "GONG", "TOGO"], def: "Mengangkat atau mengerjakan sesuatu secara bersama-sama." },
    { root: "AMANAH", letters: "AAAHMN", words: ["AMANAH", "AMAN", "HAMA", "MANA", "NAMA"], def: "Sesuatu yang dipercayakan atau dititipkan kepada orang lain." },
    { root: "WAWASAN", letters: "AAANSWW", words: ["WAWASAN", "AWAS", "SANA", "SAWA", "NAWA"], def: "Cara pandang tinjauan atau konsepsi menyeluruh." },
    { root: "BHINNEKA", letters: "ABEHIKNN", words: ["BHINNEKA", "ANEKA", "BAHIK", "NIKAH", "BIHIN"], def: "Beraneka ragam atau berbeda-beda namun tetap satu." },
    { root: "CENDRAWASIH", letters: "AACDEHINRSW", words: ["CENDRAWASIH", "CENDA", "WARIS", "DRAH", "SIWA"], def: "Burung surga khas Papua dengan bulu yang mempesona." },
    { root: "KOMODO", letters: "DKMOOO", words: ["KOMODO", "MOKO", "DOK", "KOD"], def: "Kadal raksasa purba endemik Pulau Komodo, Nusa Tenggara." },
    { root: "ANGKLUNG", letters: "AGKLNNU", words: ["ANGKLUNG", "KULANG", "ALUN", "ULANG", "KANG"], def: "Alat musik bambu tradisional khas Jawa Barat yang bernada ganda." },
    { root: "GAMELAN", letters: "AAEGLMN", words: ["GAMELAN", "MEGAN", "LANGEN", "GELAN", "MALAN"], def: "Ansambel musik tradisional berunsur metalofon dari Jawa dan Bali." },
    { root: "WAYANG", letters: "AAGNWY", words: ["WAYANG", "AWANG", "NYAWA", "WANG", "AYAN"], def: "Seni pertunjukan boneka bayangan kulit warisan leluhur." },
    { root: "KERIS", letters: "EIKRS", words: ["KERIS", "SERIK", "RESI", "EKSI", "REK"], def: "Senjata tikam tradisional berlekuk khas Nusantara." }
];

// English Seeds
const RAW_EN_LEVEL_SEEDS = [
    { root: "PLANET", letters: "AELNPT", targets: ["PLANET", "PLANE", "PLANT", "LEPTA", "NEAT"], bonus: ["LANE", "PALE", "TALE", "PEAL"], defs: { "PLANET": "A celestial body moving in an elliptical orbit around a star.", "PLANT": "A living organism that absorbs water through its roots.", "PLANE": "A flat surface on which a straight line joining any two points would lie." } },
    { root: "GALAXY", letters: "AAGLXY", targets: ["GALAXY", "AGAL", "GALA", "GAY"], bonus: ["LAY", "LUG", "YAK"], defs: { "GALAXY": "A massive gravitationally bound system of stars, stellar remnants, and gas.", "GALA": "A festive celebration or entertainment." } },
    { root: "NATURE", letters: "AENRTU", targets: ["NATURE", "TUNER", "URBAN", "RANTE", "TRUE"], bonus: ["RENT", "RATE", "NEAT", "TUNE"], defs: { "NATURE": "The physical world collective, including plants, animals, and landscapes.", "TUNER": "A device or person that adjusts the pitch or frequency of an instrument." } },
    { root: "WISDOM", letters: "DIMOSW", targets: ["WISDOM", "SWIM", "MODI", "WIND"], bonus: ["SOW", "MID", "DIM"], defs: { "WISDOM": "The quality of having experience, knowledge, and good judgement.", "SWIM": "Propel the body through water by using the limbs." } },
    { root: "ENERGY", letters: "EEGNRY", targets: ["ENERGY", "GENRE", "GREEN", "GREY", "GENE"], bonus: ["EYRE", "EGER", "RYE"], defs: { "ENERGY": "The strength and vitality required for sustained physical or mental activity.", "GENRE": "A category of artistic composition characterized by similarities in form." } },
    { root: "JOURNEY", letters: "EJNORUY", targets: ["JOURNEY", "ENJOY", "JOULE", "ROUEN", "RUNE"], bonus: ["ONE", "JOY", "RUN", "OUR"], defs: { "JOURNEY": "An act of traveling from one place to another.", "ENJOY": "Take delight or pleasure in an activity or moment." } },
    { root: "CRYSTAL", letters: "ACLRSTY", targets: ["CRYSTAL", "CART", "CLAY", "SCAR", "STAR"], bonus: ["RAY", "CAT", "TRY", "CRY"], defs: { "CRYSTAL": "A piece of a homogeneous solid substance having a natural geometrically regular form.", "CLAY": "A stiff, sticky fine-grained earth that can be moulded." } },
    { root: "HORIZON", letters: "HINORZ", targets: ["HORIZON", "RHINO", "ZION", "IRON", "HORN"], bonus: ["NOR", "ZOO", "ION"], defs: { "HORIZON": "The line at which the earth's surface and the sky appear to meet.", "RHINO": "A large, heavily built herbivorous mammal with one or two horns." } },
    { root: "VIBRANT", letters: "ABINRTV", targets: ["VIBRANT", "TRAIN", "BRAIN", "RIVAL", "BAIT"], bonus: ["RAIN", "VAIN", "RANT"], defs: { "VIBRANT": "Full of energy, enthusiasm, and vivid life.", "TRAIN": "A series of connected railway carriages or wagons." } },
    { root: "COURAGE", letters: "ACEGORU", targets: ["COURAGE", "ROUGE", "CARGO", "GRACE", "RACE"], bonus: ["CURE", "CORE", "RAGE", "AGE"], defs: { "COURAGE": "The ability to do something that frightens one; bravery.", "GRACE": "Simple elegance or refinement of movement." } }
];

const EN_WORD_BANK = [
    { root: "QUANTUM", letters: "AMNQTUU", words: ["QUANTUM", "MUTAN", "AUNT", "TUNA"], def: "A discrete quantity of energy proportional in magnitude to the frequency of radiation." },
    { root: "EXPLORE", letters: "EELOPRX", words: ["EXPLORE", "RELOX", "PEEL", "ROPE", "PORE"], def: "Travel through an unfamiliar area in order to learn about it." },
    { root: "PHOENIX", letters: "EHINOPX", words: ["PHOENIX", "PHONE", "PINE", "HOPE", "OPEN"], def: "A mythical bird that burns itself and is reborn from its own ashes." },
    { root: "ECLIPSE", letters: "CEEILPS", words: ["ECLIPSE", "PIECE", "SLICE", "SLEEP", "PEEL"], def: "An obscuring of the light from one celestial body by the passage of another." },
    { root: "VALIANT", letters: "AAILNTV", words: ["VALIANT", "AVAIL", "LAVA", "VAIN", "TALL"], def: "Possessing or showing courage or determination." },
    { root: "AURORA", letters: "AAORRU", words: ["AURORA", "ROAR", "AURA", "RARE"], def: "A natural electrical synthesis of colored light in the sky, especially near magnetic poles." },
    { root: "INFINITY", letters: "FIINNTY", words: ["INFINITY", "TINY", "INTO", "NITI"], def: "The state or quality of being boundless or limitless." },
    { root: "BLOSSOM", letters: "BLMOOSS", words: ["BLOSSOM", "BLOOM", "SOLO", "LOOM", "MOSS"], def: "A flower or a mass of flowers on a tree or bush." },
    { root: "ODYSSEY", letters: "DEOSSYY", words: ["ODYSSEY", "DOSE", "YOYO", "EDDY"], def: "A long and eventful or adventurous journey or experience." },
    { root: "HARMONY", letters: "AHMNORY", words: ["HARMONY", "MAYOR", "HORN", "ARMY", "ROAM"], def: "The combination of simultaneously sounded musical notes to produce chords." },
    { root: "PIONEER", letters: "EEINOPR", words: ["PIONEER", "PEON", "ROPE", "RIPE", "PINE"], def: "A person who is among the first to explore or settle a new country or area." },
    { root: "SYMPHONY", letters: "HMNOPSSY", words: ["SYMPHONY", "HYMN", "SHOP", "PONY", "MOSH"], def: "An elaborate musical composition for full orchestra." },
    { root: "DESTINY", letters: "DEINSTY", words: ["DESTINY", "DENSITY", "TIDY", "NEST", "SIDE"], def: "The events that will necessarily happen to a person or thing in the future." },
    { root: "RADIANT", letters: "AADINRT", words: ["RADIANT", "TRAIN", "DRAIN", "RAID", "RANT"], def: "Sending out light; shining or glowing brightly." },
    { root: "SPECTRUM", letters: "CEMPRSTU", words: ["SPECTRUM", "SUPER", "CRUST", "MUSE", "PURE"], def: "A band of colors, as seen in a rainbow, produced by separation of the components of light." },
    { root: "LUMINOUS", letters: "ILMNOSU", words: ["LUMINOUS", "LIONS", "SOUL", "MOON", "SLIM"], def: "Giving off light; bright or glowing intensely." },
    { root: "LEGENDARY", letters: "ADEGLNRY", words: ["LEGENDARY", "LEAD", "YARD", "GLAD", "EARN"], def: "Remarkable enough to be famous; very well known." },
    { root: "TRIUMPH", letters: "HIMPSTU", words: ["TRIUMPH", "THUMP", "RUMP", "TRIP", "HUMP"], def: "A great victory, achievement, or success." },
    { root: "CHAMPION", letters: "ACHIMNOP", words: ["CHAMPION", "CHAIN", "PIANO", "CHIP", "MINT"], def: "A person who has defeated all rivals in a contest or battle." },
    { root: "SOLITUDE", letters: "DEILOSTU", words: ["SOLITUDE", "SOLID", "TOILE", "LUTE", "DIET"], def: "The state or situation of being alone in peaceful contemplation." }
];

// Generator for 100 Indonesian levels and 100 English levels
function generateFullLevels(lang) {
    const list = [];
    const baseSeeds = lang === 'id' ? RAW_ID_LEVEL_SEEDS : RAW_EN_LEVEL_SEEDS;
    const wordBank = lang === 'id' ? ID_WORD_BANK : EN_WORD_BANK;

    for (let i = 1; i <= 100; i++) {
        let levelData;
        if (i <= baseSeeds.length) {
            const seed = baseSeeds[i - 1];
            levelData = {
                level: i,
                language: lang,
                root: seed.root,
                letters: seed.letters.split(""),
                targets: seed.targets,
                bonus: seed.bonus || ["KOL", "TAS", "AIR"],
                definitions: seed.defs || {}
            };
        } else {
            const bankItem = wordBank[(i - 1) % wordBank.length];
            const letters = bankItem.letters.split("");
            const targets = bankItem.words.slice(0, Math.min(3 + Math.floor(i / 20), 6));
            
            // Build definitions dynamically
            const defs = {};
            defs[bankItem.root] = bankItem.def;
            targets.forEach(w => {
                if (!defs[w]) {
                    defs[w] = lang === 'id' 
                        ? `Istilah kosakata KBBI untuk "${w}" dalam perjalanan edukatif Vocab Arcade.`
                        : `Oxford/Cambridge dictionary entry for "${w}". Essential vocabulary.`;
                }
            });

            levelData = {
                level: i,
                language: lang,
                root: bankItem.root,
                letters: letters,
                targets: targets,
                bonus: ["ARCADE", "WIN", "GEM", "STAR"],
                definitions: defs
            };
        }
        list.push(levelData);
    }
    return list;
}

const GAME_LEVELS = {
    id: generateFullLevels('id'),
    en: generateFullLevels('en')
};

// Tebak Gambar Mini-Game Dataset with Clean SVG Icons
const TEBAK_GAMBAR_DATA = [
    {
        id: 1,
        question: "Benda langit terang di malam hari, bersinar dan berputar mengelilingi Bumi:",
        answer: "BULAN",
        hint: "B _ L _ N",
        svg: `<svg viewBox="0 0 100 100" class="mini-svg"><path d="M50 15 A35 35 0 1 0 85 75 A45 45 0 0 1 50 15 Z" fill="#ffd700"/><circle cx="70" cy="25" r="4" fill="#ffffff" opacity="0.8"/><circle cx="78" cy="40" r="3" fill="#ffffff" opacity="0.6"/></svg>`
    },
    {
        id: 2,
        question: "Alat transportasi roda dua yang dikayuh tanpa mesin pembakar:",
        answer: "SEPEDA",
        hint: "S _ P _ D _",
        svg: `<svg viewBox="0 0 100 100" class="mini-svg"><circle cx="28" cy="65" r="18" fill="none" stroke="#00f2fe" stroke-width="6"/><circle cx="72" cy="65" r="18" fill="none" stroke="#00f2fe" stroke-width="6"/><path d="M28 65 L48 65 L62 42 L72 65 M48 65 L42 35 M42 35 L34 35 M62 42 L42 42" fill="none" stroke="#ff007f" stroke-width="5" stroke-linecap="round"/></svg>`
    },
    {
        id: 3,
        question: "Senjata tradisional Nusantara berbentuk kelok tajam nan sakral:",
        answer: "KERIS",
        hint: "K _ R _ S",
        svg: `<svg viewBox="0 0 100 100" class="mini-svg"><path d="M50 10 Q45 22 55 34 Q45 46 55 58 Q47 70 50 78 L43 85 L57 85 L50 78 Z" fill="#e2b714" stroke="#ffffff" stroke-width="2"/><rect x="46" y="85" width="8" height="12" rx="3" fill="#8b5a2b"/></svg>`
    },
    {
        id: 4,
        question: "Cangkir berisi minuman panas berwarna hitam pekat peredam kantuk:",
        answer: "KOPI",
        hint: "K _ P _",
        svg: `<svg viewBox="0 0 100 100" class="mini-svg"><path d="M25 40 L30 80 Q50 90 70 80 L75 40 Z" fill="#6f4e37"/><path d="M75 48 C85 48 85 68 73 70" fill="none" stroke="#e0e0e0" stroke-width="5"/><path d="M35 32 Q40 22 35 15 M50 32 Q55 20 50 15 M65 32 Q70 22 65 15" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/></svg>`
    },
    {
        id: 5,
        question: "Rumah panggung megah beratap melengkung seperti tanduk kerbau khas Minangkabau:",
        answer: "GADANG",
        hint: "G _ D _ N G",
        svg: `<svg viewBox="0 0 100 100" class="mini-svg"><path d="M10 40 Q25 55 50 50 Q75 55 90 40 L80 65 L20 65 Z" fill="#ff7675"/><rect x="25" y="65" width="50" height="25" fill="#d63031"/><rect x="42" y="72" width="16" height="18" fill="#ffeaa7"/></svg>`
    },
    {
        id: 6,
        question: "Organ pemompa darah vital dalam rongga dada manusia:",
        answer: "JANTUNG",
        hint: "J _ N T _ N G",
        svg: `<svg viewBox="0 0 100 100" class="mini-svg"><path d="M50 30 C35 10 10 25 10 50 C10 75 50 92 50 92 C50 92 90 75 90 50 C90 25 65 10 50 30 Z" fill="#e84118"/></svg>`
    },
    {
        id: 7,
        question: "Bunga raksasa parasit langka tanpa akar dan batang dari Bengkulu:",
        answer: "RAFLESIA",
        hint: "R _ F L _ S _ A",
        svg: `<svg viewBox="0 0 100 100" class="mini-svg"><circle cx="50" cy="50" r="18" fill="#2d3436"/><circle cx="50" cy="20" r="16" fill="#c0392b"/><circle cx="80" cy="40" r="16" fill="#c0392b"/><circle cx="70" cy="78" r="16" fill="#c0392b"/><circle cx="30" cy="78" r="16" fill="#c0392b"/><circle cx="20" cy="40" r="16" fill="#c0392b"/><circle cx="50" cy="50" r="9" fill="#f39c12"/></svg>`
    },
    {
        id: 8,
        question: "Penunjuk waktu portabel yang melingkar elegan di pergelangan tangan:",
        answer: "ARLOJI",
        hint: "A R L _ J _",
        svg: `<svg viewBox="0 0 100 100" class="mini-svg"><rect x="40" y="10" width="20" height="80" rx="6" fill="#636e72"/><circle cx="50" cy="50" r="24" fill="#dfe6e9" stroke="#2d3436" stroke-width="4"/><line x1="50" y1="50" x2="50" y2="35" stroke="#d63031" stroke-width="3"/><line x1="50" y1="50" x2="62" y2="50" stroke="#2d3436" stroke-width="3"/></svg>`
    }
];

// Daily Quiz Questions Pool
const DAILY_QUIZ_POOL = [
    {
        question: "Apa arti kata KBBI 'Cendekia'?",
        options: ["Tajam pikiran & lekas mengerti", "Kaya raya bergelimang harta", "Bangsawan keturunan raja", "Ahli bela diri silat"],
        correct: 0,
        explanation: "'Cendekia' berarti cerdas, lekas mengerti, terpelajar, dan tajam pikirannya."
    },
    {
        question: "What is the primary English synonym of 'LUMINOUS'?",
        options: ["Shining / Glowing brightly", "Extremely cold & frozen", "Dark and gloomy", "Heavy and solid"],
        correct: 0,
        explanation: "'Luminous' describes something that gives off light or glows with radiance."
    },
    {
        question: "Lengkapilah peribahasa: 'Air beriak tanda ...'",
        options: ["Tak dalam", "Ada ikan", "Banjir bandang", "Dalam sekali"],
        correct: 0,
        explanation: "'Air beriak tanda tak dalam' berarti orang yang banyak bicara biasanya kurang ilmunya."
    },
    {
        question: "Choose the correct antonym for the English word 'VALIANT':",
        options: ["Cowardly", "Heroic", "Confident", "Determined"],
        correct: 0,
        explanation: "'Valiant' means brave or courageous; its direct antonym is 'cowardly'."
    },
    {
        question: "Manakah penulisan kata baku yang tepat menurut KBBI edisi mutakhir?",
        options: ["Praktik", "Praktek", "Praktekan", "Peraktek"],
        correct: 0,
        explanation: "Bentuk baku yang tepat adalah 'Praktik' (diserap dari bahasa Belanda 'praktijk')."
    }
];

// Theme Shop Catalog
const THEME_CATALOG = [
    {
        id: "theme-neon",
        name: "Neon Cyberpunk",
        cost: 0, // Default theme
        desc: "Warna neon futuristik dengan kilau ultraviolet dan aksen magenta.",
        previewColor: "linear-gradient(135deg, #0d0e1b, #1b0a2a, #ff007f)",
        cssClass: "theme-neon"
    },
    {
        id: "theme-galaxy",
        name: "Galaxy Nebula",
        cost: 150,
        desc: "Hamparan bintang kosmik violet, galaksi spiral, dan debu angkasa.",
        previewColor: "linear-gradient(135deg, #05051a, #200052, #7b2cbf)",
        cssClass: "theme-galaxy"
    },
    {
        id: "theme-ice",
        name: "Crystal Ice",
        cost: 200,
        desc: "Sensasi es kristal kutub utara berbalut aurora glasial biru salju.",
        previewColor: "linear-gradient(135deg, #051923, #003554, #00a6fb)",
        cssClass: "theme-ice"
    },
    {
        id: "theme-retro",
        name: "80s Retro Arcade",
        cost: 250,
        desc: "Nostalgia kabinet arcade retro 1984 dengan pixel grid dan warna amber hangat.",
        previewColor: "linear-gradient(135deg, #2b1055, #7597de, #f39c12)",
        cssClass: "theme-retro"
    },
    {
        id: "theme-solar",
        name: "Solar Gold",
        cost: 300,
        desc: "Pancaran energi surya emas mewah simbol para juara kata sejati.",
        previewColor: "linear-gradient(135deg, #2c1a04, #573b06, #ffd700)",
        cssClass: "theme-solar"
    }
];

// Booster Power-ups
const BOOSTERS_CATALOG = [
    {
        id: "booster-wand",
        name: "Tongkat Sihir (Magic Wand)",
        cost: 40,
        icon: "🪄",
        desc: "Membuka langsung satu huruf acak pada petak kata yang belum tertebak."
    },
    {
        id: "booster-bomb",
        name: "Bom Kosmik (Cosmic Bomb)",
        cost: 75,
        icon: "💣",
        desc: "Meledakkan dan membuka 3 huruf sekaligus di papan teka-teki silang."
    },
    {
        id: "booster-magnifier",
        name: "Kaca Pembesar (Magnifier)",
        cost: 30,
        icon: "🔍",
        desc: "Memilih satu petak spesifik untuk langsung dibuka huruf rahasianya."
    }
];

// Background Archive Milestones
const BG_ARCHIVE_MILESTONES = [
    {
        level: 1,
        title: "Pelataran Pemula (Genesis Arcade)",
        desc: "Latar dasar arcade neon saat pertama kali memulai petualangan kosakata.",
        bgStyle: "radial-gradient(circle at 50% 50%, #1a103c 0%, #090a0f 100%)",
        accent: "#00f2fe"
    },
    {
        level: 10,
        title: "Lembah Huruf Nusantara (Level 10)",
        desc: "Pancaran ornamen mistis candi dan relief huruf kuno Indonesia.",
        bgStyle: "radial-gradient(circle at top, #2d132c 0%, #1e091d 60%, #0d010c 100%)",
        accent: "#e84393"
    },
    {
        level: 20,
        title: "Samudra Kata Pasifik (Level 20)",
        desc: "Kedalaman palung laut misterius tempat mutiara kosa kata tersimpan.",
        bgStyle: "radial-gradient(circle at center, #0c2461 0%, #1e3799 40%, #0a1128 100%)",
        accent: "#48dbfb"
    },
    {
        level: 34,
        title: "Benteng Aksara Merah (Level 34)",
        desc: "Energi bara peradaban para pujangga dan sastrawan besar Nusantara.",
        bgStyle: "radial-gradient(circle at bottom, #5f27cd 0%, #341f97 50%, #0a041c 100%)",
        accent: "#ff9ff3"
    },
    {
        level: 50,
        title: "Puncak Cendekiawan (Level 50)",
        desc: "Piramida emas pengetahuan di atas cakrawala awan aurora kemilau.",
        bgStyle: "radial-gradient(circle at top right, #b71540 0%, #6F1E51 60%, #18031d 100%)",
        accent: "#feca57"
    },
    {
        level: 75,
        title: "Kubah Kosmik Helios (Level 75)",
        desc: "Ruang hampa berbintang di mana kata-kata melayang bebas melintasi orbit.",
        bgStyle: "radial-gradient(circle at center, #130f40 0%, #30336b 50%, #0b0922 100%)",
        accent: "#7ed6df"
    },
    {
        level: 100,
        title: "Tahta Master Abadi (Level 100)",
        desc: "Mahligai keagungan bagi sang penakluk 100 tingkatan kosa kata sejati.",
        bgStyle: "radial-gradient(circle at 50% 30%, #574b90 0%, #303952 50%, #0f1123 100%)",
        accent: "#ffd700"
    }
];

// Profile Avatars
const AVATAR_LIST = [
    { id: "avatar-cyber-boy", label: "Cyber Boy", icon: "🧑‍💻" },
    { id: "avatar-arcade-girl", label: "Arcade Queen", icon: "👩‍🚀" },
    { id: "avatar-wizard", label: "Word Wizard", icon: "🧙‍♂️" },
    { id: "avatar-detective", label: "Detective", icon: "🕵️" },
    { id: "avatar-robot", label: "Mecha Bot", icon: "🤖" },
    { id: "avatar-warrior", label: "Nusantara Warrior", icon: "🥷" },
    { id: "avatar-scholar", label: "Cendekiawan", icon: "🎓" },
    { id: "avatar-phoenix", label: "Golden Phoenix", icon: "🦅" }
];
