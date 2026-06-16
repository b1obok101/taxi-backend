import { useId } from "react";
import type { CarBody } from "../tariffs";

interface CarIllustrationProps {
  body: CarBody;
  color: string;
}

// Аккуратные векторные авто (side-view) с бликом, колёсами и плафоном такси.
export default function CarIllustration({ body, color }: CarIllustrationProps) {
  const rawId = useId().replace(/:/g, "");
  const gradId = `car-grad-${rawId}`;
  const glassId = `car-glass-${rawId}`;

  const defs = (
    <defs>
      <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
        <stop offset="22%" stopColor={color} />
        <stop offset="100%" stopColor={color} />
      </linearGradient>
      <linearGradient id={glassId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#dbeafe" />
        <stop offset="100%" stopColor="#93c5fd" />
      </linearGradient>
    </defs>
  );

  const wheels = (frontX: number, rearX: number, y: number, r: number) => (
    <>
      <circle cx={frontX} cy={y} r={r} fill="#111827" />
      <circle cx={frontX} cy={y} r={r * 0.45} fill="#e5e7eb" />
      <circle cx={frontX} cy={y} r={r * 0.16} fill="#9ca3af" />
      <circle cx={rearX} cy={y} r={r} fill="#111827" />
      <circle cx={rearX} cy={y} r={r * 0.45} fill="#e5e7eb" />
      <circle cx={rearX} cy={y} r={r * 0.16} fill="#9ca3af" />
    </>
  );

  if (body === "van") {
    return (
      <svg viewBox="0 0 200 110" className="car-svg" aria-hidden="true">
        {defs}
        <ellipse cx="100" cy="96" rx="84" ry="7" fill="#0f172a" opacity="0.18" />
        <rect x="86" y="14" width="22" height="9" rx="2" fill="#facc15" stroke="#0f172a" strokeOpacity="0.25" />
        <path
          d="M18 78 L20 36 C20 28 26 23 36 23 L120 23 C132 23 140 28 148 40 L172 56 C180 60 184 66 184 74 L184 78 C184 82 181 84 177 84 L25 84 C21 84 18 82 18 78 Z"
          fill={`url(#${gradId})`}
          stroke="#0f172a"
          strokeOpacity="0.18"
        />
        <path
          d="M34 30 L72 30 L72 50 L30 50 Z M80 30 L116 30 C124 30 130 34 136 42 L142 50 L80 50 Z"
          fill={`url(#${glassId})`}
        />
        {wheels(56, 142, 84, 16)}
        <rect x="178" y="60" width="8" height="9" rx="2" fill="#fde68a" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 200 110" className="car-svg" aria-hidden="true">
      {defs}
      <ellipse cx="100" cy="96" rx="86" ry="7" fill="#0f172a" opacity="0.18" />
      <rect x="88" y="17" width="20" height="8" rx="2" fill="#facc15" stroke="#0f172a" strokeOpacity="0.25" />
      <path
        d="M16 80
           L34 80
           A18 18 0 0 1 70 80
           L130 80
           A18 18 0 0 1 166 80
           L184 80
           L184 66
           C184 60 180 57 174 56
           L150 52
           L130 33
           C126 29 120 27 113 27
           L78 27
           C69 27 62 30 57 37
           L45 53
           L24 58
           C19 59 16 62 16 67
           Z"
        fill={`url(#${gradId})`}
        stroke="#0f172a"
        strokeOpacity="0.18"
      />
      <path
        d="M79 33 L112 33 C118 33 123 35 127 39 L138 51 L79 51 Z"
        fill={`url(#${glassId})`}
      />
      <path
        d="M74 33 L74 51 L50 51 L62 37 C66 34 70 33 74 33 Z"
        fill={`url(#${glassId})`}
      />
      <rect x="176" y="60" width="9" height="8" rx="2" fill="#fde68a" />
      {wheels(52, 148, 80, 16)}
    </svg>
  );
}
