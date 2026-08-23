import type { LocalizedText } from "./localization";

export type Feature =
  | "translation" | "open-ear-audio" | "bluetooth-music" | "calls" | "voice-assistant"
  | "camera-photography" | "video-recording" | "blue-light" | "sunglasses"
  | "photochromic" | "prescription-ready" | "lens-insert";

export type CollectionSlug = "create" | "explore" | "everyday" | "music-movement" | "photochromic-sun" | "prescription-ready";
export type FrameStyle = "sport" | "wayfarer" | "round" | "navigator";
export type LensType = "clear" | "sun" | "photochromic" | "blue-light";

export interface ColorSku {
  id: string;
  /** Server-side SKU identifier. Public URLs and browser carts keep the stable colour id. */
  skuId?: string;
  name: LocalizedText;
  hex: string;
  images: string[];
  video?: string;
  available: boolean;
}

export interface CameraSpecs {
  photo: string;
  video: string;
  storage: string;
  battery: string;
}

export interface Product {
  id: string;
  slug: string;
  /** True only for placeholder catalogue entries. */
  demo: boolean;
  name: LocalizedText;
  tagline: LocalizedText;
  description: LocalizedText;
  /** Authoritative displayed USD price. */
  usdPrice: number;
  /** Optional original USD price, shown as a strike-through comparison price. */
  compareAtUsdPrice?: number;
  collections: CollectionSlug[];
  features: Feature[];
  frameStyle: FrameStyle;
  lensType: LensType;
  colors: ColorSku[];
  heroImage: string;
  /** Supplied English product-detail artwork, preserved in its source sequence. */
  detailImages?: string[];
  /** Isolated product dimensions artwork shown beside the transcribed specification table. */
  technicalDiagram?: string;
  camera?: CameraSpecs;
  translationNote?: LocalizedText;
  prescriptionNote?: LocalizedText;
  specifications: Array<{ label: LocalizedText; value: LocalizedText }>;
  inTheBox: LocalizedText[];
  compatibility: LocalizedText;
  faq: Array<{ question: LocalizedText; answer: LocalizedText }>;
  seo: { title: LocalizedText; description: LocalizedText };
}
