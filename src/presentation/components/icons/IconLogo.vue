<template>
  <svg viewBox="35 28 130 144" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color: #6366f1; stop-opacity: 1" />
        <stop offset="100%" style="stop-color: #8b5cf6; stop-opacity: 1" />
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.3" />
      </filter>
    </defs>

    <!-- Back card (tilted right) -->
    <g transform="rotate(15 100 100)">
      <rect x="58" y="40" width="84" height="120" rx="10" fill="url(#cardGradient)" opacity="0.3" />
    </g>

    <!-- Middle card (straight) -->
    <g transform="rotate(0 100 100)">
      <rect x="58" y="40" width="84" height="120" rx="10" fill="url(#cardGradient)" opacity="0.6" />
    </g>

    <!-- Front card (tilted left) with diamond -->
    <g transform="rotate(-15 100 100)">
      <rect
        x="58"
        y="40"
        width="84"
        height="120"
        rx="10"
        fill="url(#cardGradient)"
        filter="url(#shadow)"
      />
      <!-- Diamond shape - centered at card center (100, 100) -->
      <path d="M 100,76 L 121,100 L 100,124 L 79,100 Z" fill="white" opacity="0.95" />
    </g>
  </svg>
</template>
