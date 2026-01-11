<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor">
    <!-- Playing card background -->
    <rect x="4" y="2" width="24" height="28" rx="3" fill="currentColor" opacity="0.08" />
    <rect
      x="4"
      y="2"
      width="24"
      height="28"
      rx="3"
      stroke="currentColor"
      stroke-width="1.25"
      fill="none"
    />
    <!-- Street - perspective view going into distance -->
    <!-- Road surface -->
    <path d="M8 26 L14 6 L18 6 L24 26 Z" fill="currentColor" opacity="0.3" />
    <!-- Road edges -->
    <line x1="8" y1="26" x2="14" y2="6" stroke="currentColor" stroke-width="1.5" />
    <line x1="24" y1="26" x2="18" y2="6" stroke="currentColor" stroke-width="1.5" />
    <!-- Center dashed line -->
    <line x1="16" y1="8" x2="16" y2="12" stroke="currentColor" stroke-width="1.5" />
    <line x1="16" y1="15" x2="16" y2="19" stroke="currentColor" stroke-width="1.5" />
    <line x1="16" y1="22" x2="16" y2="26" stroke="currentColor" stroke-width="1.5" />
  </svg>
</template>
