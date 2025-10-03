import type { Config } from 'tailwindcss';

const withAlpha = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const catppuccin = {
  rosewater: withAlpha('--cat-rosewater'),
  flamingo: withAlpha('--cat-flamingo'),
  pink: withAlpha('--cat-pink'),
  mauve: withAlpha('--cat-mauve'),
  red: withAlpha('--cat-red'),
  maroon: withAlpha('--cat-maroon'),
  peach: withAlpha('--cat-peach'),
  yellow: withAlpha('--cat-yellow'),
  green: withAlpha('--cat-green'),
  teal: withAlpha('--cat-teal'),
  sky: withAlpha('--cat-sky'),
  sapphire: withAlpha('--cat-sapphire'),
  blue: withAlpha('--cat-blue'),
  lavender: withAlpha('--cat-lavender'),
  text: withAlpha('--cat-text'),
  subtext1: withAlpha('--cat-subtext1'),
  subtext0: withAlpha('--cat-subtext0'),
  overlay2: withAlpha('--cat-overlay2'),
  overlay1: withAlpha('--cat-overlay1'),
  overlay0: withAlpha('--cat-overlay0'),
  surface2: withAlpha('--cat-surface2'),
  surface1: withAlpha('--cat-surface1'),
  surface0: withAlpha('--cat-surface0'),
  base: withAlpha('--cat-base'),
  mantle: withAlpha('--cat-mantle'),
  crust: withAlpha('--cat-crust')
};

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cat: catppuccin,
        background: withAlpha('--background'),
        foreground: withAlpha('--foreground'),
        accent: withAlpha('--accent')
      },
      borderRadius: {
        xl: '1rem'
      }
    }
  },
  plugins: []
};

export default config;
