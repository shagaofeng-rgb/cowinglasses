import type { CollectionSlug, Feature, FrameStyle, LensType, Product } from "@/types/product";

const en = (value: string) => ({ en: value });

type Seed = {
  id: string; slug: string; name: string; tagline: string; description: string; image: string;
  collections: CollectionSlug[]; features: Feature[]; frameStyle: FrameStyle; lensType: LensType;
  color: string; hex: string; bluetooth: string; chip: string; battery: string; weight: string;
  playback: string; charging: string; dimensions: string;
};

const makeProduct = (seed: Seed): Product => ({
  id: seed.id,
  slug: seed.slug,
  usdPrice: 0,
  name: en(seed.name),
  tagline: en(seed.tagline),
  description: en(seed.description),
  collections: seed.collections,
  features: seed.features,
  frameStyle: seed.frameStyle,
  lensType: seed.lensType,
  heroImage: seed.image,
  colors: [{ id: `${seed.id}-shown`, name: en(seed.color), hex: seed.hex, images: [seed.image], available: true }],
  specifications: [
    { label: en("Bluetooth"), value: en(seed.bluetooth) },
    { label: en("Audio chip"), value: en(seed.chip) },
    { label: en("Battery"), value: en(seed.battery) },
    { label: en("Weight"), value: en(seed.weight) },
    { label: en("Music playback"), value: en(seed.playback) },
    { label: en("Charging"), value: en(seed.charging) },
    { label: en("Frame dimensions"), value: en(seed.dimensions) },
  ],
  inTheBox: [en("Smart glasses"), en("Charging cable")],
  compatibility: en("Pairs over Bluetooth with compatible mobile devices. Confirm device, app and market requirements with your sales contact before purchase."),
  faq: [
    { question: en("Is pricing shown online?"), answer: en("No. Pricing, order quantities, delivery and regional availability are confirmed individually." ) },
    { question: en("Can I request compliance documents?"), answer: en("Selected source folders include compliance documents. Request model-specific documentation before import or distribution." ) },
  ],
  seo: { title: en(`${seed.name} | CoWin Glasses`), description: en(seed.tagline) },
});

export const products: Product[] = [
  makeProduct({
    id: "g200", slug: "g200-sport-audio-glasses", name: "G200 Sport Audio Glasses", tagline: "Bluetooth audio in a sport-inspired frame.",
    description: "G200 is a sport-style Bluetooth audio glasses model. Its supplied specification sheet lists a JL7006 chip, Bluetooth 5.3, a 100 mAh battery, 43 g weight, 5–6 hours of music playback and magnetic charging.", image: "/images/products/g200-sport.webp",
    collections: ["explore", "music-movement"], features: ["bluetooth-music", "sunglasses"], frameStyle: "sport", lensType: "sun", color: "Blue mirror (shown)", hex: "#245c8f", bluetooth: "5.3", chip: "JL7006", battery: "100 mAh", weight: "43 g", playback: "5–6 hours", charging: "Magnetic charging", dimensions: "140 × 155 × 10 mm",
  }),
  makeProduct({
    id: "g300", slug: "g300-sport-audio-glasses", name: "G300 Sport Audio Glasses", tagline: "A color-forward sport frame with Bluetooth audio.",
    description: "G300 is a sport-style Bluetooth audio glasses model. Its supplied specification sheet lists a JL7006 chip, Bluetooth 5.3, a 100 mAh battery, 43 g weight, 5–6 hours of music playback and magnetic charging.", image: "/images/products/g300-sport.webp",
    collections: ["explore", "music-movement"], features: ["bluetooth-music", "sunglasses"], frameStyle: "sport", lensType: "sun", color: "Red / blue (shown)", hex: "#8e2634", bluetooth: "5.3", chip: "JL7006", battery: "100 mAh", weight: "43 g", playback: "5–6 hours", charging: "Magnetic charging", dimensions: "140 × 155 × 10 mm",
  }),
  makeProduct({
    id: "gl7", slug: "gl7-audio-glasses", name: "GL7 Audio Glasses", tagline: "A navigator-style Bluetooth audio frame.",
    description: "GL7 is a Bluetooth audio glasses model. Its supplied specification sheet lists a JL7006 TWS chip, Bluetooth 5.4, dual 100 mAh batteries, 27 g net weight, 5–6 hours of music playback and dual magnetic charging.", image: "/images/products/gl7.webp",
    collections: ["everyday", "explore"], features: ["bluetooth-music"], frameStyle: "navigator", lensType: "clear", color: "Black (shown)", hex: "#222222", bluetooth: "5.4", chip: "JL7006 TWS", battery: "100 mAh × 2", weight: "27 g net", playback: "5–6 hours", charging: "Dual magnetic charging", dimensions: "143 × 145 × 62 × 16 mm",
  }),
  makeProduct({
    id: "gl8", slug: "gl8-audio-glasses", name: "GL8 Audio Glasses", tagline: "A refined navigator-style Bluetooth audio frame.",
    description: "GL8 is a Bluetooth audio glasses model. Its supplied specification sheet lists a JL7006 TWS chip, Bluetooth 5.4, dual 100 mAh batteries, 27 g net weight, 5–6 hours of music playback and dual magnetic charging.", image: "/images/products/gl8.webp",
    collections: ["everyday", "explore"], features: ["bluetooth-music"], frameStyle: "navigator", lensType: "clear", color: "Gold (shown)", hex: "#ae8749", bluetooth: "5.4", chip: "JL7006 TWS", battery: "100 mAh × 2", weight: "27 g net", playback: "5–6 hours", charging: "Dual magnetic charging", dimensions: "140 × 145 × 62 × 16 mm",
  }),
  makeProduct({
    id: "gl12-5", slug: "gl12-5-audio-glasses", name: "GL12-5 Audio Glasses", tagline: "A lightweight Bluetooth audio frame for everyday wear.",
    description: "GL12-5 is a Bluetooth audio glasses model. Its supplied specification sheet lists a JL7006 TWS chip, Bluetooth 5.4, dual 100 mAh batteries, 27 g net weight, 4–5 hours of music playback and magnetic charging.", image: "/images/products/gl12-5.webp",
    collections: ["everyday", "music-movement"], features: ["bluetooth-music"], frameStyle: "wayfarer", lensType: "clear", color: "Rose lens (shown)", hex: "#d38f9a", bluetooth: "5.4", chip: "JL7006 TWS", battery: "100 mAh × 2", weight: "27 g net", playback: "4–5 hours", charging: "Magnetic charging", dimensions: "136 × 135 × 62 × 15 mm",
  }),
  makeProduct({
    id: "gl15", slug: "gl15-audio-glasses", name: "GL15 Audio Glasses", tagline: "An everyday Bluetooth audio frame with magnetic charging.",
    description: "GL15 is a Bluetooth audio glasses model. Its supplied specification sheet lists an AB5632F chip, Bluetooth 5.4, dual 100 mAh batteries, 27 g weight, 4–5 hours of music playback and magnetic charging.", image: "/images/products/gl15.webp",
    collections: ["everyday", "music-movement"], features: ["bluetooth-music"], frameStyle: "wayfarer", lensType: "clear", color: "Blue lens (shown)", hex: "#5791ae", bluetooth: "5.4", chip: "AB5632F", battery: "100 mAh × 2", weight: "27 g", playback: "4–5 hours", charging: "Magnetic charging", dimensions: "140 × 140 × 62 × 10 mm",
  }),
];

export const getProduct = (slug: string) => products.find((product) => product.slug === slug);
