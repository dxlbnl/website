import { browser } from "$app/environment";

let initial = "phosphor";

if (browser) {
  try {
    const saved = localStorage.getItem("dxlb-palette");
    if (saved) {
      initial = saved;
    } else if (matchMedia("(prefers-color-scheme: dark)").matches) {
      initial = "phosphor";
    } else {
      initial = "paper";
    }
  } catch {
    // empty block
  }
}

let palette = $state(initial);

export function getPalette() {
  return palette;
}

export function setPalette(value: string) {
  palette = value;
  if (browser) {
    localStorage.setItem("dxlb-palette", value);
  }
}

export function togglePalette() {
  setPalette(palette === "paper" ? "phosphor" : "paper");
}
