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

export function PanelIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9.5 4v16" />
      <path d="m14.5 10-2 2 2 2" />
    </Svg>
  );
}

export function HomeIcon(props) {
  return (
    <Svg {...props}>
      <path d="m3 10.5 9-7.5 9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M10 20v-5h4v5" />
    </Svg>
  );
}

export function EyeIcon(props) {
  return (
    <Svg {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

export function EyeOffIcon(props) {
  return (
    <Svg {...props}>
      <path d="M10.7 6c.4-.1.9-.2 1.3-.2 6 0 9.5 6.2 9.5 6.2a17 17 0 0 1-2.4 3.1M6.6 6.8A16.6 16.6 0 0 0 2.5 12S6 18.5 12 18.5c1.5 0 2.9-.4 4.1-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="m4 4 16 16" />
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

export function ChevronDownIcon(props) {
  return (
    <Svg {...props}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

export function FilterIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3 5h18l-7 8.5V19l-4 2v-7.5L3 5Z" />
    </Svg>
  );
}

export function ShieldIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 3 5 5.8v5.4c0 4.3 2.9 7.4 7 8.8 4.1-1.4 7-4.5 7-8.8V5.8L12 3Z" />
      <path d="m9.2 11.6 2 2 3.6-3.9" />
    </Svg>
  );
}

export function KeyIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="8" cy="15" r="4.2" />
      <path d="m11 12 8.5-8.5" />
      <path d="M15.5 7.5 18 10" />
      <path d="M18.5 4.5 21 7" />
    </Svg>
  );
}

export function CopyIcon(props) {
  return (
    <Svg {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Svg>
  );
}

export function CheckIcon(props) {
  return (
    <Svg {...props}>
      <path d="m4.5 12.5 5 5 10-11" />
    </Svg>
  );
}

export function MailIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 7.4 5.2a2 2 0 0 0 2.2 0L20.5 7" />
    </Svg>
  );
}

export function BuildingIcon(props) {
  return (
    <Svg {...props}>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01" />
      <path d="M10 21v-3h4v3" />
    </Svg>
  );
}

export function CalendarIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </Svg>
  );
}

export function UserIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20.4c.8-3.4 3.6-5.4 7-5.4s6.2 2 7 5.4" />
    </Svg>
  );
}

export function BadgeCheckIcon(props) {
  return (
    <Svg {...props}>
      <path d="m12 2.6 2.3 1.9 3-.3 1 2.8 2.6 1.5-.7 2.9.7 2.9-2.6 1.5-1 2.8-3-.3-2.3 1.9-2.3-1.9-3 .3-1-2.8L3.1 14l.7-2.9-.7-2.9 2.6-1.5 1-2.8 3 .3L12 2.6Z" />
      <path d="m9.2 11.8 2 2 3.6-3.9" />
    </Svg>
  );
}

export function ActivityIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3 12h4l2.5-7 5 14 2.5-7h4" />
    </Svg>
  );
}

export function LensLogo({ size = 22, ...props }) {
  return (
    <Svg size={size} strokeWidth={2} {...props}>
      {/* Magnifier lens */}
      <circle cx="10.5" cy="10.5" r="6.5" />
      {/* Dollar symbol under inspection */}
      <path d="M10.5 6.9v7.2" />
      <path d="M12.3 8.2h-2.3a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3H8.7" />
      {/* Handle */}
      <path d="m15.5 15.5 4.5 4.5" />
    </Svg>
  );
}
