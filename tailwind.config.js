/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    "extend": {
      "animation": {
        'stroke-dash': 'stroke-dash 1.2s linear infinite',
        'breathe': 'breathe 1.6s ease-in-out infinite',
        'spin-slow': 'spin 1.2s linear infinite',
      },
      "keyframes": {
        'stroke-dash': { to: { strokeDashoffset: '-64' } },
        'breathe': {
          '0%,100%': { opacity: .70, transform: 'scale(1)' },
          '50%': { opacity: 0.9, transform: 'scale(1.05)' },
        },
      },
      "colors": {
        "lightmode": {
          "50": "#f8fafc",
          "100": "#f2f5f9",
          "200": "#e3e8ef",
          "300": "#ccd4e2",
          "400": "#93a0b6",
          "500": "#65748c",
          "600": "#48556a",
          "700": "#344155",
          "800": "#1e293b",
          "900": "#0d1829",
          "950": "#010716"
        },
        "darkmode": {
          "50": "#fafafa",
          "100": "#f4f4f5",
          "200": "#e4e4e6",
          "300": "#d4d4d9",
          "400": "#9f9fa8",
          "500": "#71717b",
          "600": "#52525c",
          "700": "#3f3f46",
          "800": "#27272a",
          "900": "#18181a",
          "950": "#09090b"
        },
        "highlight": {
          "50": "#f1f9ff",
          "100": "#e2f1fd",
          "200": "#c1e3ff",
          "300": "#8dcfff",
          "400": "#4db6fe",
          "500": "#2ba3ed",
          "600": "#0284c7",
          "700": "#06699f",
          "800": "#0d5985",
          "900": "#19496a",
          "950": "#0a2f47"
        },
        "neutral": {
          "50": "#f8fafd",
          "100": "#f2f5f9",
          "200": "#e2e8f0",
          "300": "#cad5e3",
          "400": "#90a1b8",
          "500": "#62748d",
          "600": "#45556b",
          "700": "#314157",
          "800": "#1b293c",
          "900": "#0b182a",
          "950": "#000717"
        },
      },
      "fontFamily": {
        "heading": [
          "Share Tech Mono",
          "monospace"
        ],
        "body": [
          "Akshar",
          "sans-serif"
        ]
      },
      "borderRadius": "0.5rem"
    }

  },
  plugins: [],
}
