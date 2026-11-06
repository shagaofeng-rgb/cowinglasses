export const sportModelSlug = "g200-sport-audio-glasses";

export function modelCode(slug: string) {
  return slug === sportModelSlug ? "G200" : slug.toUpperCase();
}
