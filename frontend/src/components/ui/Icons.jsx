// Icons.jsx — tiny inline SVG icon set (stroke style, like Lucide).
// Keeps the project free of an extra icon library.

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Svg({ size = 20, children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...base}
      {...props}
    >
      {children}
    </svg>
  );
}

export function GridIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Svg>
  );
}

export function ListIcon(props) {
  return (
    <Svg {...props}>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" strokeWidth="2.4" />
    </Svg>
  );
}

export function UploadIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 16V4m0 0 4 4m-4-4L8 8" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </Svg>
  );
}

export function SearchIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  );
}

export function ChartIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" />
    </Svg>
  );
}

export function RupeeIcon(props) {
  return (
    <Svg {...props}>
      <path d="M7 3h10M7 8h10" />
      <path d="M7 13h4a5 5 0 0 0 0-10" />
      <path d="m8 13 8 8" />
    </Svg>
  );
}

export function AlertIcon(props) {
  return (
    <Svg {...props}>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </Svg>
  );
}

export function FlagIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 21V4a1 1 0 0 1 .4-.8A5 5 0 0 1 9 3l1 .8a5 5 0 0 0 4.5.5L16 4a5 5 0 0 1 4 4.9V13l-1.8.6A5 5 0 0 1 14 13l-1-.8a5 5 0 0 0-4.5-.5L6 12.5" />
    </Svg>
  );
}

export function DocIcon(props) {
  return (
    <Svg {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </Svg>
  );
}

export function TrendUpIcon(props) {
  return (
    <Svg {...props}>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </Svg>
  );
}

export function RefreshIcon(props) {
  return (
    <Svg {...props}>
      <path d="M21 12a9 9 0 1 1-2.6-6.4" />
      <path d="M21 4v5h-5" />
    </Svg>
  );
}

export function InboxIcon(props) {
  return (
    <Svg {...props}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.4 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.4-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.8 1.1Z" />
    </Svg>
  );
}

export function MenuIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Svg>
  );
}

export function CloseIcon(props) {
  return (
    <Svg {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Svg>
  );
}

export function LensLogo({ size = 22, ...props }) {
  return (
    <Svg size={size} strokeWidth={2} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <circle cx="10.5" cy="10.5" r="2.5" />
      <path d="m15.5 15.5 4.5 4.5" />
    </Svg>
  );
}
