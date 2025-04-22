/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class', // Use 'class' instead of 'media' to handle dark mode via class toggling
	content: [
	  './src/**/*.{ts,tsx}',
	  './src/**/*.{js,jsx}',
	],
	theme: {
	  extend: {
		colors: {
		  // Light mode colors
		  diamond: {
			50: '#f8f9ff',
			100: '#e6ebfe',
			200: '#cdd8fc',
			300: '#a6bafc',
			400: '#7695f9',
			500: '#4a5ee4',
			600: '#3a4cd3',
			700: '#303cae',
			800: '#28338c',
			900: '#212973',
		  },
		  // Dark mode specific colors extensions in existing theme
		  dark: {
			background: '#121212',
			card: '#1e1e1e',
			border: '#2e2e2e',
			muted: '#2e2e2e',
			accent: '#3a4cd3',
		  },
		  // Define your other colors here
		  border: "hsl(var(--border))",
		  input: "hsl(var(--input))",
		  ring: "hsl(var(--ring))",
		  background: "hsl(var(--background))",
		  foreground: "hsl(var(--foreground))",
		  primary: {
			DEFAULT: "hsl(var(--primary))",
			foreground: "hsl(var(--primary-foreground))",
		  },
		  secondary: {
			DEFAULT: "hsl(var(--secondary))",
			foreground: "hsl(var(--secondary-foreground))",
		  },
		  destructive: {
			DEFAULT: "hsl(var(--destructive))",
			foreground: "hsl(var(--destructive-foreground))",
		  },
		  muted: {
			DEFAULT: "hsl(var(--muted))",
			foreground: "hsl(var(--muted-foreground))",
		  },
		  accent: {
			DEFAULT: "hsl(var(--accent))",
			foreground: "hsl(var(--accent-foreground))",
		  },
		  popover: {
			DEFAULT: "hsl(var(--popover))",
			foreground: "hsl(var(--popover-foreground))",
		  },
		  card: {
			DEFAULT: "hsl(var(--card))",
			foreground: "hsl(var(--card-foreground))",
		  },
		},
		borderRadius: {
		  lg: "var(--radius)",
		  md: "calc(var(--radius) - 2px)",
		  sm: "calc(var(--radius) - 4px)",
		},
		keyframes: {
		  "accordion-down": {
			from: { height: 0 },
			to: { height: "var(--radix-accordion-content-height)" },
		  },
		  "accordion-up": {
			from: { height: "var(--radix-accordion-content-height)" },
			to: { height: 0 },
		  },
		},
		animation: {
		  "accordion-down": "accordion-down 0.2s ease-out",
		  "accordion-up": "accordion-up 0.2s ease-out",
		},
	  },
	},
	plugins: [require("tailwindcss-animate")],
  }