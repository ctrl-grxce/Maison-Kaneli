import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps): IconProps {
  return {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...props,
  };
}

export const ArrowRightIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 12h16m0 0-6-6m6 6-6 6" />
  </svg>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m14 6-6 6 6 6" />
  </svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m10 6 6 6-6 6" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const MenuIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 8h16M4 16h16" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const CalendarIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="5.5" width="16" height="15" rx="1" />
    <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
  </svg>
);

export const ClockIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2.5" />
  </svg>
);

export const SparkleIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.5c.7 4.2 2.3 5.8 6.5 6.5-4.2.7-5.8 2.3-6.5 6.5-.7-4.2-2.3-5.8-6.5-6.5 4.2-.7 5.8-2.3 6.5-6.5Z" />
    <path d="M18.5 15c.35 2.1 1.15 2.9 3 3.25-1.85.35-2.65 1.15-3 3.25-.35-2.1-1.15-2.9-3-3.25 1.85-.35 2.65-1.15 3-3.25Z" />
  </svg>
);

export const PetalIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 20.5c4.5-2.6 7-6 7-9.5a7 7 0 0 0-14 0c0 3.5 2.5 6.9 7 9.5Z" />
    <path d="M12 20.5V11m0 0c1.8-1.2 2.8-2.7 3-4.5M12 11c-1.8-1.2-2.8-2.7-3-4.5" />
  </svg>
);

export const HandsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 11.5V6.75a1.25 1.25 0 0 1 2.5 0V10m0-3.25v-1.5a1.25 1.25 0 0 1 2.5 0V10m0-4.25a1.25 1.25 0 0 1 2.5 0V10m0-2.25a1.25 1.25 0 0 1 2.5 0v6.75c0 3.6-2.9 6.5-6.5 6.5a6.5 6.5 0 0 1-6.5-6.5v-2a1.5 1.5 0 0 1 3 0" />
  </svg>
);

export const EyeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 13c2.5-3.8 5.5-5.7 9-5.7s6.5 1.9 9 5.7" />
    <path d="M12 16.5a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z" />
    <path d="M5.5 9.5 4.2 8M12 7v-2m6.5 4.5L19.8 8" />
  </svg>
);

export const BrushIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m14.5 5 4.5 4.5L9.5 19c-1.2 1.2-3.3 1.2-4.5 0s-1.2-3.3 0-4.5L14.5 5Z" />
    <path d="M14.5 5c1-1 2.5-2 4-1.5S20.5 6 19 7l-1.5 1.5" />
  </svg>
);

export const DiplomaIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="9" r="5.5" />
    <path d="M9.5 13.5 8 20.5l4-2 4 2-1.5-7M12 6.8l.8 1.6 1.7.3-1.2 1.2.3 1.8-1.6-.9-1.6.9.3-1.8-1.2-1.2 1.7-.3.8-1.6Z" />
  </svg>
);

export const PhoneIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7.5 4h3l1 4-2 1.5a11 11 0 0 0 5 5L16 12.5l4 1v3A1.5 1.5 0 0 1 18.5 18C11 17.5 6.5 13 6 5.5A1.5 1.5 0 0 1 7.5 4Z" />
  </svg>
);

export const MailIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="1" />
    <path d="m4.5 7 7.5 6 7.5-6" />
  </svg>
);

export const MapPinIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 21c4-4.2 6-7.5 6-10.2A6 6 0 0 0 6 10.8C6 13.5 8 16.8 12 21Z" />
    <circle cx="12" cy="10.5" r="2.25" />
  </svg>
);

export const InstagramIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="4" width="16" height="16" rx="4.5" />
    <circle cx="12" cy="12" r="3.5" />
    <circle cx="16.8" cy="7.2" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);
