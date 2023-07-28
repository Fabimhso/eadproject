export function percentage(p: number, t: number): number {
  return (100 * p) / t;
}

export function convertSlug(text: string): string {
  return text.toLowerCase().replace(/[^\w ]+/g,"").replace(/ +/g, "-");
}