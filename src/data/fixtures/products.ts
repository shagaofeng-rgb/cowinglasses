import type { Product } from "@/types/product";

const image = "/images/demo/product-pro-v2.png";
const lifestyle = "/images/demo/product-lite-v2.png";

export const products: Product[] = [
  {
    id: "cw-flow", slug: "cw-flow-demo", demo: true, usdPrice: 129, heroImage: image,
    name: { en: "CoWin Flow", ar: "CoWin فلو", es: "CoWin Flow", pt: "CoWin Flow", ja: "CoWin Flow", ko: "CoWin Flow" },
    tagline: { en: "A lighter soundtrack for your daily pace.", ar: "موسيقى أخف لإيقاع يومك.", es: "Una banda sonora ligera para tu ritmo diario.", pt: "Uma trilha mais leve para o seu ritmo diário.", ja: "日々のペースに、軽やかなサウンドを。", ko: "일상의 리듬을 위한 가벼운 사운드." },
    description: { en: "Demo sport frame with open-ear audio and Bluetooth music for commuting, walking and easy miles.", ar: "إطار رياضي تجريبي بصوت مفتوح وبلوتوث للتنقل والمشي.", es: "Montura deportiva demo con audio abierto y música Bluetooth para desplazamientos y caminatas.", pt: "Armação esportiva demo com áudio aberto e música Bluetooth.", ja: "オープンイヤーオーディオとBluetooth音楽を備えたデモスポーツフレーム。", ko: "오픈 이어 오디오와 Bluetooth 음악을 갖춘 데모 스포츠 프레임입니다." },
    collections: ["explore", "music-movement", "everyday"], features: ["open-ear-audio", "bluetooth-music", "blue-light"], frameStyle: "sport", lensType: "blue-light",
    colors: [{ id: "flow-charcoal", name: { en: "Charcoal", ar: "فحمي", es: "Carbón", pt: "Carvão", ja: "チャコール", ko: "차콜" }, hex: "#26292c", images: [image], available: true }, { id: "flow-lime", name: { en: "Signal Lime", ar: "أخضر ليموني", es: "Lima señal", pt: "Lima sinal", ja: "シグナルライム", ko: "시그널 라임" }, hex: "#a7c516", images: [image], available: true }],
    specifications: [{ label: { en: "Audio", ar: "الصوت", es: "Audio", pt: "Áudio", ja: "オーディオ", ko: "오디오" }, value: { en: "Open-ear audio", ar: "صوت مفتوح", es: "Audio abierto", pt: "Áudio aberto", ja: "オープンイヤー", ko: "오픈 이어 오디오" } }, { label: { en: "Connectivity", ar: "الاتصال", es: "Conectividad", pt: "Conectividade", ja: "接続", ko: "연결" }, value: { en: "Bluetooth to phone", ar: "بلوتوث للهاتف", es: "Bluetooth al teléfono", pt: "Bluetooth para telefone", ja: "スマートフォンへBluetooth", ko: "휴대폰 Bluetooth" } }, { label: { en: "Status", ar: "الحالة", es: "Estado", pt: "Status", ja: "ステータス", ko: "상태" }, value: { en: "Demo specifications pending confirmation", ar: "المواصفات التجريبية بانتظار التأكيد", es: "Especificaciones demo pendientes", pt: "Especificações demo pendentes", ja: "デモ仕様は確認待ち", ko: "데모 사양 확인 대기 중" } }],
    inTheBox: [{ en: "CoWin Flow demo frame", ar: "إطار CoWin Flow تجريبي", es: "Montura demo CoWin Flow", pt: "Armação demo CoWin Flow", ja: "CoWin Flowデモフレーム", ko: "CoWin Flow 데모 프레임" }, { en: "Charging cable", ar: "كابل شحن", es: "Cable de carga", pt: "Cabo de carregamento", ja: "充電ケーブル", ko: "충전 케이블" }],
    compatibility: { en: "iOS and Android app support is planned. Pair through Bluetooth.", ar: "يدعم تطبيقات iOS وAndroid عبر البلوتوث.", es: "Soporte previsto para iOS y Android mediante Bluetooth.", pt: "Suporte previsto para iOS e Android via Bluetooth.", ja: "iOSとAndroidアプリに対応予定。Bluetoothでペアリングします。", ko: "iOS 및 Android 앱 지원이 예정되어 있습니다. Bluetooth로 연결합니다." },
    faq: [{ question: { en: "Does Flow include translation?", ar: "هل تتضمن Flow الترجمة؟", es: "¿Flow incluye traducción?", pt: "Flow inclui tradução?", ja: "Flowに翻訳は含まれますか？", ko: "Flow에 번역 기능이 포함되나요?" }, answer: { en: "No translation capability is represented for this demo model until product data is confirmed.", ar: "لا يتم تمثيل الترجمة لهذا النموذج التجريبي حتى تأكيد بيانات المنتج.", es: "Este modelo demo no representa traducción hasta confirmar los datos.", pt: "Este modelo demo não inclui tradução até confirmação dos dados.", ja: "製品データの確認まで、このデモモデルに翻訳機能はありません。", ko: "제품 데이터가 확인될 때까지 이 데모 모델은 번역 기능을 제공하지 않습니다." } }],
    seo: { title: { en: "CoWin Flow Demo Smart Glasses", ar: "نظارات CoWin Flow التجريبية", es: "Gafas demo CoWin Flow", pt: "Óculos demo CoWin Flow", ja: "CoWin Flowデモスマートグラス", ko: "CoWin Flow 데모 스마트 글라스" }, description: { en: "Demo open-ear audio smart glasses for music and movement.", ar: "نظارات تجريبية للصوت والحركة.", es: "Gafas demo con audio abierto.", pt: "Óculos demo com áudio aberto.", ja: "音楽と動きのためのデモスマートグラス。", ko: "음악과 움직임을 위한 데모 스마트 글라스." } },
  },
  {
    id: "cw-vision", slug: "cw-vision-demo", demo: true, usdPrice: 149, heroImage: lifestyle,
    name: { en: "CoWin Vision", ar: "CoWin فيجن", es: "CoWin Vision", pt: "CoWin Vision", ja: "CoWin Vision", ko: "CoWin Vision" },
    tagline: { en: "Capture the route. Keep translation close.", ar: "التقط الطريق واجعل الترجمة قريبة.", es: "Captura la ruta. Mantén cerca la traducción.", pt: "Capture o caminho. Mantenha a tradução por perto.", ja: "ルートを記録し、翻訳をそばに。", ko: "경로를 담고 번역을 가까이." },
    description: { en: "Demo camera and translation frame for travel notes, quick moments and connected conversations.", ar: "إطار تجريبي بالكاميرا والترجمة للسفر والمحادثات المتصلة.", es: "Montura demo con cámara y traducción para viajes y conversaciones conectadas.", pt: "Armação demo com câmera e tradução para viagens.", ja: "旅行の記録やつながる会話のための、カメラと翻訳デモフレーム。", ko: "여행 기록과 연결된 대화를 위한 카메라 및 번역 데모 프레임입니다." },
    collections: ["create", "explore", "everyday"], features: ["translation", "camera-photography", "video-recording", "bluetooth-music"], frameStyle: "wayfarer", lensType: "clear",
    colors: [{ id: "vision-graphite", name: { en: "Graphite", ar: "جرافيت", es: "Grafito", pt: "Grafite", ja: "グラファイト", ko: "그래파이트" }, hex: "#33383d", images: [lifestyle], available: true }, { id: "vision-fog", name: { en: "Fog", ar: "ضبابي", es: "Niebla", pt: "Névoa", ja: "フォグ", ko: "포그" }, hex: "#c8cbca", images: [lifestyle], available: true }],
    camera: { photo: "To be confirmed", video: "To be confirmed", storage: "To be confirmed", battery: "To be confirmed" },
    translationNote: { en: "AI translation works through the CoWin app, Bluetooth and phone internet. Glasses do not connect directly to the internet.", ar: "تعمل الترجمة عبر تطبيق CoWin والبلوتوث وإنترنت الهاتف. لا تتصل النظارات بالإنترنت مباشرة.", es: "La traducción funciona mediante la app CoWin, Bluetooth e internet del teléfono.", pt: "A tradução funciona pelo app CoWin, Bluetooth e internet do telefone.", ja: "AI翻訳はCoWinアプリ、Bluetooth、スマートフォンのインターネット接続を利用します。", ko: "AI 번역은 CoWin 앱, Bluetooth 및 휴대폰 인터넷 연결을 통해 작동합니다." },
    specifications: [{ label: { en: "Camera", ar: "الكاميرا", es: "Cámara", pt: "Câmera", ja: "カメラ", ko: "카메라" }, value: { en: "Demo field - to be confirmed", ar: "حقل تجريبي - بانتظار التأكيد", es: "Campo demo - por confirmar", pt: "Campo demo - a confirmar", ja: "デモ項目 - 確認待ち", ko: "데모 항목 - 확인 대기" } }, { label: { en: "Translation", ar: "الترجمة", es: "Traducción", pt: "Tradução", ja: "翻訳", ko: "번역" }, value: { en: "App + Bluetooth + phone internet", ar: "تطبيق + بلوتوث + إنترنت الهاتف", es: "App + Bluetooth + internet del teléfono", pt: "App + Bluetooth + internet do telefone", ja: "アプリ + Bluetooth + スマホ通信", ko: "앱 + Bluetooth + 휴대폰 인터넷" } }],
    inTheBox: [{ en: "CoWin Vision demo frame", ar: "إطار CoWin Vision تجريبي", es: "Montura demo CoWin Vision", pt: "Armação demo CoWin Vision", ja: "CoWin Visionデモフレーム", ko: "CoWin Vision 데모 프레임" }, { en: "Charging cable", ar: "كابل شحن", es: "Cable de carga", pt: "Cabo de carregamento", ja: "充電ケーブル", ko: "충전 케이블" }], compatibility: { en: "iOS and Android app support is planned. Pair through Bluetooth.", ar: "يدعم iOS وAndroid عبر البلوتوث.", es: "Soporte previsto para iOS y Android mediante Bluetooth.", pt: "Suporte previsto para iOS e Android via Bluetooth.", ja: "iOSとAndroidアプリに対応予定。", ko: "iOS 및 Android 앱 지원이 예정되어 있습니다." }, faq: [], seo: { title: { en: "CoWin Vision Demo Smart Glasses", ar: "نظارات CoWin Vision التجريبية", es: "Gafas demo CoWin Vision", pt: "Óculos demo CoWin Vision", ja: "CoWin Visionデモスマートグラス", ko: "CoWin Vision 데모 스마트 글라스" }, description: { en: "Demo camera and connected translation smart glasses.", ar: "نظارات تجريبية بالكاميرا والترجمة.", es: "Gafas demo con cámara y traducción.", pt: "Óculos demo com câmera e tradução.", ja: "カメラと接続型翻訳のデモスマートグラス。", ko: "카메라와 연결형 번역 데모 스마트 글라스." } },
  },
  {
    id: "cw-arc", slug: "cw-arc-demo", demo: true, usdPrice: 249, heroImage: image,
    name: { en: "CoWin Arc", ar: "CoWin آرك", es: "CoWin Arc", pt: "CoWin Arc", ja: "CoWin Arc", ko: "CoWin Arc" }, tagline: { en: "The full expression, held in a precise frame.", ar: "تعبير كامل في إطار دقيق.", es: "La expresión completa en una montura precisa.", pt: "Expressão completa em uma armação precisa.", ja: "精緻なフレームに、フルな表現を。", ko: "정교한 프레임에 담은 완성된 표현." }, description: { en: "Demo flagship entry with configured camera, audio, translation and prescription-ready support fields.", ar: "مدخل رائد تجريبي بالكاميرا والصوت والترجمة ودعم العدسات الطبية.", es: "Entrada flagship demo con cámara, audio, traducción y graduación.", pt: "Modelo principal demo com câmera, áudio, tradução e lentes de grau.", ja: "カメラ、オーディオ、翻訳、度付き対応を備えたデモフラッグシップ。", ko: "카메라, 오디오, 번역, 도수 렌즈 지원 필드를 갖춘 데모 플래그십입니다." }, collections: ["create", "prescription-ready", "photochromic-sun"], features: ["translation", "open-ear-audio", "bluetooth-music", "calls", "voice-assistant", "camera-photography", "video-recording", "photochromic", "prescription-ready", "lens-insert"], frameStyle: "navigator", lensType: "photochromic", colors: [{ id: "arc-onyx", name: { en: "Onyx", ar: "أونيكس", es: "Ónix", pt: "Ônix", ja: "オニキス", ko: "오닉스" }, hex: "#202226", images: [image], available: true }], camera: { photo: "To be confirmed", video: "To be confirmed", storage: "To be confirmed", battery: "To be confirmed" }, translationNote: { en: "Translation needs the app, Bluetooth and phone internet.", ar: "تحتاج الترجمة إلى التطبيق والبلوتوث وإنترنت الهاتف.", es: "La traducción necesita app, Bluetooth e internet del teléfono.", pt: "A tradução precisa do app, Bluetooth e internet do telefone.", ja: "翻訳にはアプリ、Bluetooth、スマートフォンのインターネット接続が必要です。", ko: "번역에는 앱, Bluetooth 및 휴대폰 인터넷이 필요합니다." }, prescriptionNote: { en: "A standard prescription lens insert is included. Take the insert to your optician for your own prescription lenses.", ar: "تتضمن حشوة عدسات طبية قياسية. خذها إلى أخصائي البصريات لتركيب عدساتك.", es: "Incluye un inserto estándar. Llévalo a tu óptica para colocar tus lentes graduadas.", pt: "Inclui um encaixe padrão. Leve-o ao seu óptico para suas lentes de grau.", ja: "標準度付きレンズインサートが付属します。眼鏡店でご自身の度数レンズを作成してください。", ko: "표준 도수 렌즈 인서트가 포함됩니다. 안경원에서 본인의 도수 렌즈를 맞추세요." }, specifications: [{ label: { en: "Lens", ar: "العدسة", es: "Lente", pt: "Lente", ja: "レンズ", ko: "렌즈" }, value: { en: "Photochromic demo configuration", ar: "إعداد تجريبي متغير اللون", es: "Configuración fotocromática demo", pt: "Configuração fotocromática demo", ja: "調光デモ構成", ko: "변색 데모 구성" } }, { label: { en: "Prescription", ar: "طبي", es: "Graduación", pt: "Grau", ja: "度付き", ko: "도수" }, value: { en: "Standard insert included", ar: "حشوة قياسية مرفقة", es: "Inserto estándar incluido", pt: "Encaixe padrão incluído", ja: "標準インサート付属", ko: "표준 인서트 포함" } }], inTheBox: [{ en: "CoWin Arc demo frame", ar: "إطار CoWin Arc تجريبي", es: "Montura demo CoWin Arc", pt: "Armação demo CoWin Arc", ja: "CoWin Arcデモフレーム", ko: "CoWin Arc 데모 프레임" }, { en: "Standard lens insert", ar: "حشوة عدسات قياسية", es: "Inserto de lentes estándar", pt: "Encaixe de lentes padrão", ja: "標準レンズインサート", ko: "표준 렌즈 인서트" }], compatibility: { en: "iOS and Android app support is planned. Pair through Bluetooth.", ar: "يدعم iOS وAndroid عبر البلوتوث.", es: "Soporte previsto para iOS y Android.", pt: "Suporte previsto para iOS e Android.", ja: "iOSとAndroidアプリに対応予定。", ko: "iOS 및 Android 앱 지원이 예정되어 있습니다." }, faq: [], seo: { title: { en: "CoWin Arc Demo Flagship", ar: "CoWin Arc التجريبي الرائد", es: "CoWin Arc flagship demo", pt: "CoWin Arc principal demo", ja: "CoWin Arcデモフラッグシップ", ko: "CoWin Arc 데모 플래그십" }, description: { en: "Demo flagship smart eyewear configuration.", ar: "إعداد نظارات ذكية رائد تجريبي.", es: "Configuración demo de gafas flagship.", pt: "Configuração demo de óculos principais.", ja: "デモフラッグシップスマートアイウェア構成。", ko: "데모 플래그십 스마트 아이웨어 구성입니다." } },
  },
];

export const getProduct = (slug: string) => products.find((product) => product.slug === slug);

// Extra demo series deliberately reuse placeholder photography until real assets arrive.
products.push(
  {
    ...products[0], id: "cw-daylight", slug: "cw-daylight-demo", usdPrice: 119, heroImage: lifestyle,
    name: { en: "CoWin Daylight", ar: "CoWin داي لايت", es: "CoWin Daylight", pt: "CoWin Daylight", ja: "CoWin Daylight", ko: "CoWin Daylight" },
    tagline: { en: "Sun-ready comfort for the everyday outside.", ar: "راحة جاهزة للشمس لكل يوم في الخارج.", es: "Comodidad preparada para el sol diario.", pt: "Conforto pronto para o sol de todos os dias.", ja: "日常の外出に、太陽の下の快適さ。", ko: "매일의 야외를 위한 선레디 편안함." },
    description: { en: "Demo sun frame for outdoor everyday use. Final lens and audio specifications must be confirmed.", ar: "إطار شمسي تجريبي للاستخدام اليومي الخارجي. يجب تأكيد المواصفات النهائية.", es: "Montura solar demo para exterior. Las especificaciones finales deben confirmarse.", pt: "Armação solar demo para uso externo. As especificações finais precisam de confirmação.", ja: "屋外の日常使い向けデモサンフレーム。最終仕様は確認が必要です。", ko: "야외 일상용 데모 선 프레임입니다. 최종 사양은 확인이 필요합니다." },
    collections: ["everyday", "photochromic-sun"], features: ["sunglasses"], frameStyle: "round", lensType: "sun",
    colors: [{ id: "daylight-tortoise", name: { en: "Smoke Tortoise", ar: "سلحفاتي دخاني", es: "Carey humo", pt: "Tartaruga fumê", ja: "スモークトータス", ko: "스모크 토터스" }, hex: "#504640", images: [lifestyle], available: true }],
  },
  {
    ...products[2], id: "cw-studio", slug: "cw-studio-demo", usdPrice: 199,
    name: { en: "CoWin Studio", ar: "CoWin ستوديو", es: "CoWin Studio", pt: "CoWin Studio", ja: "CoWin Studio", ko: "CoWin Studio" },
    tagline: { en: "A demo creator frame, prepared for prescription inserts.", ar: "إطار مبدعين تجريبي جاهز للعدسات الطبية.", es: "Una montura demo para creadores, preparada para insertos graduados.", pt: "Uma armação demo para criadores, pronta para encaixes de grau.", ja: "度付きインサート対応のデモクリエイターフレーム。", ko: "도수 인서트를 지원하는 데모 크리에이터 프레임." },
    description: { en: "Demo creator configuration with selected camera and prescription-ready fields awaiting confirmed product documentation.", ar: "إعداد مبدعين تجريبي بانتظار توثيق المنتج المؤكد.", es: "Configuración demo para creadores pendiente de documentación confirmada.", pt: "Configuração demo para criadores aguardando documentação confirmada.", ja: "確定した製品資料を待つ、デモクリエイター構成。", ko: "확정된 제품 문서를 기다리는 데모 크리에이터 구성입니다." },
    collections: ["create", "prescription-ready"], features: ["camera-photography", "video-recording", "prescription-ready", "lens-insert"], frameStyle: "wayfarer", lensType: "clear",
    colors: [{ id: "studio-ink", name: { en: "Ink", ar: "حبر", es: "Tinta", pt: "Tinta", ja: "インク", ko: "잉크" }, hex: "#1f2529", images: [image], available: true }],
  },
);


// G200 is the first confirmed, published English product. Other entries remain demo catalogue data.
products.unshift({
  id: "g200-sport-audio-glasses",
  slug: "g200-sport-audio-glasses",
  demo: false,
  usdPrice: 39.99,
  compareAtUsdPrice: 113,
  heroImage: "/images/products/g200-sport-audio-glasses.webp",
  name: { en: "G200 Sport Audio Glasses" },
  tagline: { en: "Open-ear Bluetooth audio in a lightweight wraparound sport frame." },
  description: { en: "G200 combines open-ear Bluetooth audio, a wraparound PC lens and magnetic charging for outdoor training, riding and everyday movement." },
  collections: ["explore", "music-movement", "everyday"],
  features: ["open-ear-audio", "bluetooth-music", "calls", "sunglasses"],
  frameStyle: "sport",
  lensType: "sun",
  colors: [{
    id: "g200-blue",
    name: { en: "Blue mirror lens" },
    hex: "#21ace5",
    images: ["/images/products/g200-sport-audio-glasses.webp"],
    available: true,
  }],
  specifications: [
    { label: { en: "Bluetooth chip" }, value: { en: "JL7006" } },
    { label: { en: "Bluetooth version" }, value: { en: "5.3" } },
    { label: { en: "Bluetooth profiles" }, value: { en: "HFP, A2DP, HID, AVRCP, AVCTP, AVDTP" } },
    { label: { en: "Audio decoding" }, value: { en: "SBC / AAC" } },
    { label: { en: "Bluetooth distance" }, value: { en: "More than 10 meters" } },
    { label: { en: "Frequency range" }, value: { en: "20–20 kHz" } },
    { label: { en: "Battery capacity" }, value: { en: "100 mAh / 400838" } },
    { label: { en: "Music playing time" }, value: { en: "5–6 hours" } },
    { label: { en: "Charging time" }, value: { en: "1.5 hours" } },
    { label: { en: "Weight" }, value: { en: "43 g" } },
    { label: { en: "Sound pressure level" }, value: { en: "125 ± 3 dB" } },
    { label: { en: "Charging port" }, value: { en: "Magnetic charging port" } },
    { label: { en: "Frame size" }, value: { en: "140 × 155 × 10 mm" } },
  ],
  inTheBox: [
    { en: "G200 Sport Audio Glasses" },
    { en: "Magnetic charging cable" },
    { en: "Product documentation" },
  ],
  compatibility: { en: "Pair with compatible iOS or Android phones over Bluetooth 5.3. Contact sales to confirm current availability, shipping destination and order details." },
  faq: [
    { question: { en: "How long does the battery last?" }, answer: { en: "The rated music playing time is 5–6 hours. Actual results vary with volume, connection and use conditions." } },
    { question: { en: "How do I order G200?" }, answer: { en: "Select Request order / Contact sales. The sales team will confirm availability, destination, shipping and final order details before payment." } },
  ],
  seo: {
    title: { en: "G200 Sport Audio Glasses | CoWin" },
    description: { en: "G200 open-ear Bluetooth sport audio glasses. Launch price USD 39.99, originally USD 113. Request an order from CoWin sales." },
  },
});


// Bulk launch records are limited to model folders with both approved source imagery and a supplied USD price.
const publishedProduct = (
  id: string,
  name: string,
  usdPrice: number,
  compareAtUsdPrice: number,
): Product => ({
  id,
  slug: id,
  demo: false,
  usdPrice,
  compareAtUsdPrice,
  heroImage: `/images/products/${id}.webp`,
  name: { en: name },
  tagline: { en: "Product configuration confirmed by sales before payment." },
  description: { en: "Browse the supplied product imagery, then request an order. Sales confirms the final configuration, availability, shipping and payment instructions for your destination." },
  collections: ["everyday"],
  features: [],
  frameStyle: "wayfarer",
  lensType: "clear",
  colors: [{ id: `${id}-standard`, name: { en: "Selected product finish" }, hex: "#303438", images: [`/images/products/${id}.webp`], available: true }],
  specifications: [{ label: { en: "Product information" }, value: { en: "Configuration and availability confirmed by sales before payment." } }],
  inTheBox: [{ en: "Final contents are confirmed by sales with your order request." }],
  compatibility: { en: "Contact sales to confirm the selected model configuration, phone compatibility where applicable, shipping destination and final order details." },
  faq: [{ question: { en: "How do I order this model?" }, answer: { en: "Select Request order / Contact sales. Sales will confirm the product configuration, availability, shipping and payment instructions before any charge." } }],
  seo: { title: { en: `${name} | CoWin` }, description: { en: `${name}. Launch price in USD. Request an order from CoWin sales.` } },
});

products.unshift(
  publishedProduct("g06-l", "G06-L Smart Glasses", 39.99, 119),
  publishedProduct("g06-t", "G06-T Smart Glasses", 39.99, 119),
  publishedProduct("g300", "G300 Smart Glasses", 39.99, 115),
  publishedProduct("gl1", "GL1 Smart Glasses", 39.99, 98),
  publishedProduct("gl6", "GL6 Smart Glasses", 39.99, 115),
  publishedProduct("gl7", "GL7 Smart Glasses", 39.99, 133),
  publishedProduct("gl8", "GL8 Smart Glasses", 39.99, 133),
  publishedProduct("gl12-8", "GL12-8 Smart Glasses", 39.99, 123),
  publishedProduct("gl12-9", "GL12-9 Smart Glasses", 39.99, 133),
  publishedProduct("gl15-1", "GL15-1 Smart Glasses", 39.99, 103),
  publishedProduct("gl15-2", "GL15-2 Smart Glasses", 39.99, 128),
  publishedProduct("gl16-3", "GL16-3 Smart Glasses", 79.99, 198),
  publishedProduct("v03-pro", "V03 Pro Smart Glasses", 79.99, 245),
  publishedProduct("v03-t5", "V03-T5 Smart Glasses", 79.99, 265),
  publishedProduct("v03-t6", "V03-T6 Smart Glasses", 79.99, 265),
  publishedProduct("v03-t8", "V03-T8 Smart Glasses", 79.99, 265),
);
