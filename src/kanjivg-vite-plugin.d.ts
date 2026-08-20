// The kanjivg-js package does not ship type declarations for its vite plugin entry
// ("kanjivg-js/vite-plugin"). Declare it loosely so it slots into Vite's plugins
// array. The plugin only copies KanjiVG stroke SVGs into public/kanji/ at build.
declare module 'kanjivg-js/vite-plugin' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const kvgJs: (options?: Record<string, unknown>) => any
}