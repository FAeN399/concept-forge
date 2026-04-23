import type { CSSProperties } from 'react';

type IconProps = {
  name: string;
  size?: number;
  stroke?: number;
  className?: string;
  style?: CSSProperties;
};

const paths: Record<string, JSX.Element> = {
  logo: <g><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18" /><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" /></g>,
  shield: <path d="M12 2 4 5v7c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5z" />,
  target: <g><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></g>,
  sparkles: <g><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" /></g>,
  grid: <g><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></g>,
  layers: <g><path d="M12 2 3 7l9 5 9-5z" /><path d="M3 12l9 5 9-5M3 17l9 5 9-5" /></g>,
  note: <g><path d="M5 3h10l4 4v14H5z" /><path d="M15 3v4h4M9 13h6M9 17h4" /></g>,
  formation: <g><circle cx="12" cy="6" r="2" /><circle cx="6" cy="13" r="2" /><circle cx="18" cy="13" r="2" /><circle cx="9" cy="19" r="2" /><circle cx="15" cy="19" r="2" /></g>,
  graph: <g><circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /><path d="M7.5 7.5 10.5 10.5M16.5 7.5 13.5 10.5M10.5 13.5 7.5 16.5M13.5 13.5 16.5 16.5" /></g>,
  table: <g><rect x="3" y="4" width="18" height="16" rx="1" /><path d="M3 9h18M3 14h18M10 4v16M16 4v16" /></g>,
  flow: <g><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="3" width="6" height="6" rx="1" /><rect x="9" y="15" width="6" height="6" rx="1" /><path d="M9 6h6M6 9v3h6M18 9v3h-6M12 12v3" /></g>,
  ability: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  stat: <g><path d="M4 20h16" /><rect x="6" y="10" width="3" height="8" /><rect x="11" y="6" width="3" height="12" /><rect x="16" y="13" width="3" height="5" /></g>,
  matrix: <g><rect x="3" y="3" width="18" height="18" rx="1" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></g>,
  upgrade: <g><path d="M4 18h4l2-4h4l2-4h4" /><path d="m20 6-3-3-3 3" /></g>,
  link: <g><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></g>,
  behavior: <g><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /><path d="M7 11v4h6" /><path d="M17 13V7h-4" /></g>,
  risk: <g><path d="M12 3 2 20h20z" /><path d="M12 10v5M12 18v.5" /></g>,
  unit: <g><circle cx="12" cy="8" r="3" /><path d="M5 21a7 7 0 0 1 14 0" /></g>,
  pin: <g><path d="M12 2v6l4 4v3H8v-3l4-4V2z" /><path d="M12 15v7" /></g>,
  approve: <g><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></g>,
  archive: <g><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4" /></g>,
  compare: <g><rect x="3" y="5" width="8" height="14" rx="1" /><rect x="13" y="5" width="8" height="14" rx="1" /></g>,
  duplicate: <g><rect x="7" y="7" width="12" height="12" rx="1" /><path d="M5 17H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1" /></g>,
  send: <g><path d="M4 20 21 12 4 4l3 8z" /><path d="M7 12h14" /></g>,
  plus: <g><path d="M12 5v14M5 12h14" /></g>,
  minus: <path d="M5 12h14" />,
  x: <g><path d="M6 6l12 12M18 6 6 18" /></g>,
  chevron_down: <path d="m6 9 6 6 6-6" />,
  chevron_right: <path d="m9 6 6 6-6 6" />,
  wand: <g><path d="M15 4l5 5" /><path d="M3 21l11-11 5 5L8 26" /><path d="M18 4l1 1M20 2l1 1M22 6l1 1" /></g>,
  sliders: <g><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="8" cy="6" r="2" fill="var(--surface)" /><circle cx="16" cy="12" r="2" fill="var(--surface)" /><circle cx="10" cy="18" r="2" fill="var(--surface)" /></g>,
};

export function Icon({ name, size = 16, stroke = 1.7, className, style }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={stroke}
      style={style}
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name] ?? paths.note}
    </svg>
  );
}
