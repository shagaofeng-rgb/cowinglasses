export function serializeJsonLd(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
