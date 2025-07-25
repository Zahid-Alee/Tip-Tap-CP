import * as React from "react";

export const TextSettingIcon = React.memo(
  ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className={className}
        {...props}
      >
        <path d="m16 16-2 2 2 2" />
        <path d="M3 12h15a3 3 0 1 1 0 6h-4" />
        <path d="M3 18h7" />
        <path d="M3 6h18" />
      </svg>
    );
  }
);

TextSettingIcon.displayName = "TextSettingIcon";
