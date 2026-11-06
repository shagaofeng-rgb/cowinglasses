import type { Locale } from "@/lib/i18n";
import type { Feature } from "@/types/product";

const keys = [
  "catalogue", "guide", "service", "documents", "orderDesk", "journal",
  "allModels", "allFeatures", "model", "models", "view", "perPage", "featured",
  "notListed", "dimensions", "originalDrawing", "gallery", "previous", "next", "enlarge", "close",
  "decrease", "increase", "launch", "addModel", "removeModel", "contents", "notFound", "notFoundCopy",
  "bluetooth", "playback", "weight", "charging", "recording", "choosePlatform", "shippingEstimate", "battery", "compareIntro", "modelsSelected", "scrollComparison",
] as const;

type TextRow<T extends readonly string[]> = { [Index in keyof T]: string };
type LabelRow = TextRow<typeof keys>;

const labels: Record<Locale, LabelRow> = {
  en: ["Model index", "Field guide", "Service desk", "Documents", "Order desk", "Journal", "All models", "All features", "Model", "Models", "View model", "per page", "Featured story", "Not listed", "Frame measurements", "View supplied dimension artwork", "Gallery", "Previous image", "Next image", "Enlarge image", "Close", "Decrease quantity", "Increase quantity", "Launch price", "Add a model", "Remove third model", "On this page", "Out of frame", "This page has moved or is no longer available.", "Bluetooth", "Playback", "Frame weight", "Charge time", "Recording", "Choose your platform", "Estimated delivery", "Battery capacity", "Choose up to three frames and compare the published specifications for each model.", "models selected", "Swipe the table on narrow screens"],
  ar: ["دليل الموديلات", "دليل الاستخدام", "خدمة العملاء", "المستندات", "الطلبات", "المجلة", "كل الموديلات", "كل الميزات", "الموديل", "الموديلات", "عرض الموديل", "لكل صفحة", "القصة المميزة", "غير مذكور", "قياسات الإطار", "عرض رسم الأبعاد", "معرض الصور", "الصورة السابقة", "الصورة التالية", "تكبير الصورة", "إغلاق", "تقليل الكمية", "زيادة الكمية", "سعر الإطلاق", "إضافة موديل", "إزالة الموديل الثالث", "في هذه الصفحة", "الصفحة غير موجودة", "نُقلت هذه الصفحة أو لم تعد متاحة.", "بلوتوث", "التشغيل", "وزن الإطار", "مدة الشحن", "التسجيل", "اختر منصتك", "الشحن التقديري", "سعة البطارية", "اختر حتى ثلاثة إطارات وقارن المواصفات المنشورة لكل موديل.", "موديلات مختارة", "مرر الجدول أفقياً على الشاشات الضيقة"],
  es: ["Catálogo", "Guía de uso", "Atención al cliente", "Documentos", "Pedidos", "Revista", "Todos los modelos", "Todas las funciones", "Modelo", "Modelos", "Ver modelo", "por página", "Artículo destacado", "No indicado", "Medidas de la montura", "Ver plano de medidas", "Galería", "Imagen anterior", "Imagen siguiente", "Ampliar imagen", "Cerrar", "Reducir cantidad", "Aumentar cantidad", "Precio de lanzamiento", "Añadir un modelo", "Quitar el tercer modelo", "En esta página", "Página no encontrada", "Esta página se ha movido o ya no está disponible.", "Bluetooth", "Reproducción", "Peso de la montura", "Tiempo de carga", "Grabación", "Elige tu plataforma", "Envío estimado", "Capacidad de la batería", "Elige hasta tres monturas y compara las especificaciones publicadas de cada modelo.", "modelos seleccionados", "Desliza la tabla en pantallas estrechas"],
  pt: ["Catálogo", "Guia de uso", "Atendimento", "Documentos", "Pedidos", "Revista", "Todos os modelos", "Todos os recursos", "Modelo", "Modelos", "Ver modelo", "por página", "Artigo em destaque", "Não informado", "Medidas da armação", "Ver desenho de medidas", "Galeria", "Imagem anterior", "Próxima imagem", "Ampliar imagem", "Fechar", "Diminuir quantidade", "Aumentar quantidade", "Preço de lançamento", "Adicionar um modelo", "Remover o terceiro modelo", "Nesta página", "Página não encontrada", "Esta página mudou ou não está mais disponível.", "Bluetooth", "Reprodução", "Peso da armação", "Tempo de carga", "Gravação", "Escolha sua plataforma", "Frete estimado", "Capacidade da bateria", "Escolha até três armações e compare as especificações publicadas de cada modelo.", "modelos selecionados", "Deslize a tabela em telas estreitas"],
  ja: ["モデル一覧", "使用ガイド", "サポート", "文書", "ご注文", "ジャーナル", "すべてのモデル", "すべての機能", "モデル", "モデル", "モデルを見る", "件／ページ", "注目の記事", "記載なし", "フレーム寸法", "寸法図を見る", "ギャラリー", "前の画像", "次の画像", "画像を拡大", "閉じる", "数量を減らす", "数量を増やす", "発売価格", "モデルを追加", "3つ目のモデルを削除", "このページの内容", "ページが見つかりません", "このページは移動したか、公開を終了しました。", "Bluetooth", "再生時間", "フレーム重量", "充電時間", "録画", "プラットフォームを選択", "送料の目安", "バッテリー容量", "最大3つのフレームを選び、公開されている各モデルの仕様を比較できます。", "モデルを選択中", "小さな画面では表を横にスクロールできます"],
  ko: ["모델 목록", "사용 가이드", "고객 지원", "문서", "주문", "저널", "모든 모델", "모든 기능", "모델", "모델", "모델 보기", "개씩 보기", "추천 기사", "정보 없음", "프레임 치수", "치수 도면 보기", "갤러리", "이전 이미지", "다음 이미지", "이미지 확대", "닫기", "수량 줄이기", "수량 늘리기", "출시 가격", "모델 추가", "세 번째 모델 제거", "이 페이지의 내용", "페이지를 찾을 수 없음", "이 페이지가 이동했거나 더 이상 제공되지 않습니다.", "블루투스", "재생 시간", "프레임 무게", "충전 시간", "녹화", "플랫폼을 선택하세요", "예상 배송비", "배터리 용량", "최대 세 가지 프레임을 선택해 모델별 공개 사양을 비교하세요.", "개 모델 선택됨", "좁은 화면에서는 표를 가로로 밀어 보세요"],
};

export function storefrontLabels(locale: Locale) {
  return Object.fromEntries(keys.map((key, index) => [key, labels[locale][index]])) as Record<(typeof keys)[number], string>;
}

const featureNames = {
  translation: ["AI real-time translation", "ترجمة فورية بالذكاء الاصطناعي", "Traducción instantánea con IA", "Tradução em tempo real com IA", "AIリアルタイム翻訳", "AI 실시간 번역"],
  "open-ear-audio": ["Open-ear audio", "صوت مفتوح الأذن", "Audio de oído abierto", "Áudio de ouvido aberto", "オープンイヤーオーディオ", "오픈 이어 오디오"],
  "bluetooth-music": ["Bluetooth music", "موسيقى عبر البلوتوث", "Música por Bluetooth", "Música via Bluetooth", "Bluetooth音楽再生", "블루투스 음악"],
  calls: ["Calls", "المكالمات", "Llamadas", "Chamadas", "通話", "통화"],
  "voice-assistant": ["Voice assistant", "المساعد الصوتي", "Asistente de voz", "Assistente de voz", "音声アシスタント", "음성 비서"],
  "camera-photography": ["Camera photography", "التصوير بالكاميرا", "Captura de fotos", "Captura de fotos", "写真撮影", "사진 촬영"],
  "video-recording": ["Video recording", "تسجيل الفيديو", "Grabación de vídeo", "Gravação de vídeo", "動画撮影", "동영상 녹화"],
  "blue-light": ["Blue-light lenses", "عدسات للضوء الأزرق", "Lentes para luz azul", "Lentes para luz azul", "ブルーライト対策レンズ", "블루라이트 렌즈"],
  sunglasses: ["Sunglasses", "نظارات شمسية", "Gafas de sol", "Óculos de sol", "サングラス", "선글라스"],
  photochromic: ["Photochromic lenses", "عدسات متغيرة اللون", "Lentes fotocromáticas", "Lentes fotocromáticas", "調光レンズ", "변색 렌즈"],
  "prescription-ready": ["Prescription-lens ready", "متوافقة مع العدسات الطبية", "Compatibles con lentes graduadas", "Compatíveis com lentes de grau", "度付きレンズ対応", "도수 렌즈 호환"],
  "lens-insert": ["Prescription insert included", "ملحق العدسات الطبية مرفق", "Inserto graduable incluido", "Encaixe para lentes de grau incluído", "度付きレンズ用インサート付属", "도수 렌즈 인서트 포함"],
} satisfies Record<Feature, [string, string, string, string, string, string]>;

const featureLocaleIndex = { en: 0, ar: 1, es: 2, pt: 3, ja: 4, ko: 5 } as const;

export function storefrontFeatureName(locale: Locale, feature: Feature) {
  return featureNames[feature][featureLocaleIndex[locale]];
}
