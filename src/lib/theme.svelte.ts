let palette = $state('phosphor');

export function getPalette() {
	return palette;
}

export function setPalette(value: string) {
	palette = value;
	localStorage.setItem('dxlb-palette', value);
}

export function togglePalette() {
	setPalette(palette === 'paper' ? 'phosphor' : 'paper');
}
