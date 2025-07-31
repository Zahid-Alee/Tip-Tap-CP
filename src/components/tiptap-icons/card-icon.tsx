import * as React from "react";

export const CardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="4" width="18" height="16" rx="3" ry="3" />
    <line x1="7" y1="8" x2="17" y2="8" />
    <line x1="7" y1="12" x2="15" y2="12" />
    <line x1="7" y1="16" x2="13" y2="16" />
  </svg>
);

export default CardIcon;
