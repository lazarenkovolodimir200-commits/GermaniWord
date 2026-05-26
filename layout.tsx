@import 'tailwindcss';
@import 'tw-animate-css';

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(0.13 0.02 260);
  --foreground: oklch(0.95 0 0);
  --card: oklch(0.18 0.02 260 / 0.6);
  --card-foreground: oklch(0.95 0 0);
  --popover: oklch(0.15 0.02 260 / 0.95);
  --popover-foreground: oklch(0.95 0 0);
  --primary: oklch(0.65 0.2 145);
  --primary-foreground: oklch(0.13 0.02 260);
  --secondary: oklch(0.25 0.02 260);
  --secondary-foreground: oklch(0.95 0 0);
  --muted: oklch(0.22 0.02 260);
  --muted-foreground: oklch(0.65 0 0);
  --accent: oklch(0.55 0.25 280);
  --accent-foreground: oklch(0.95 0 0);
  --destructive: oklch(0.55 0.22 25);
  --destructive-foreground: oklch(0.95 0 0);
  --success: oklch(0.65 0.2 145);
  --success-foreground: oklch(0.13 0.02 260);
  --warning: oklch(0.75 0.15 85);
  --warning-foreground: oklch(0.13 0.02 260);
  --border: oklch(0.3 0.02 260);
  --input: oklch(0.2 0.02 260);
  --ring: oklch(0.65 0.2 145);
  --chart-1: oklch(0.65 0.2 145);
  --chart-2: oklch(0.55 0.25 280);
  --chart-3: oklch(0.75 0.15 85);
  --chart-4: oklch(0.55 0.22 25);
  --chart-5: oklch(0.6 0.2 200);
  --radius: 1rem;
  --glass-bg: oklch(0.18 0.02 260 / 0.4);
  --glass-border: oklch(0.4 0.02 260 / 0.3);
}

@theme inline {
  --font-sans: 'Geist', 'Geist Fallback', system-ui, sans-serif;
  --font-mono: 'Geist Mono', 'Geist Mono Fallback', monospace;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-glass-bg: var(--glass-bg);
  --color-glass-border: var(--glass-border);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}

@layer utilities {
  .glass {
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
  }
  
  .glass-strong {
    background: oklch(0.18 0.02 260 / 0.7);
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    border: 1px solid oklch(0.5 0.02 260 / 0.3);
  }
  
  .text-gradient {
    background: linear-gradient(135deg, oklch(0.65 0.2 145), oklch(0.55 0.25 280));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .bg-gradient-game {
    background: linear-gradient(135deg, oklch(0.13 0.02 260) 0%, oklch(0.15 0.04 280) 50%, oklch(0.12 0.02 260) 100%);
  }
  
  .animate-pulse-slow {
    animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  .animate-bounce-soft {
    animation: bounce-soft 2s infinite;
  }
  
  @keyframes bounce-soft {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }
  
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-10px); }
    40% { transform: translateX(10px); }
    60% { transform: translateX(-10px); }
    80% { transform: translateX(10px); }
  }
  
  .animate-correct {
    animation: correct 0.5s ease-out;
  }
  
  @keyframes correct {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
}
