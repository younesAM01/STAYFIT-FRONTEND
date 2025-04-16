const tailwindConfig = {
	darkMode: ["class"],
	content: [
	  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
	  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
	  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
	  extend: {
		fontFamily: {
		  inter: "var(--font-inter), serif",
		},
		keyframes: {
		  "fade-in": {
			"0%": { opacity: "0", transform: "translate(-50%, -20px)" },
			"100%": { opacity: "1", transform: "translate(-50%, 0)" },
		  },
		  "slide-up": {
			"0%": { opacity: "0", transform: "translateY(10px)" },
			"100%": { opacity: "1", transform: "translateY(0)" },
		  },
		  "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
		  shimmer: {
			from: {
			  backgroundPosition: "0 0",
			},
			to: {
			  backgroundPosition: "-200% 0",
			},
		  },
		},
		animation: {
		  "fade-in": "fade-in 0.6s ease-out forwards",
		  "slide-up": "slide-up 0.4s ease-out forwards",
		  "accordion-down": "accordion-down 0.2s ease-out",
		  "accordion-up": "accordion-up 0.2s ease-out",
		  shimmer: "shimmer 2s linear infinite",
		},
		colors: {
		  background: "hsl(var(--background))",
		  foreground: "hsl(var(--foreground))",
		  card: {
			DEFAULT: "hsl(var(--card))",
			foreground: "hsl(var(--card-foreground))",
		  },
		  popover: {
			DEFAULT: "hsl(var(--popover))",
			foreground: "hsl(var(--popover-foreground))",
		  },
		  card: {
			DEFAULT: "hsl(var(--card))",
			foreground: "hsl(var(--card-foreground))",
		  },
		  sidebar: {
			DEFAULT: "#0d111a",
			foreground: "#ffffff",
			primary: "#B4E90E",
			"primary-foreground": "#0d111a",
			accent: "#1a2233",
			"accent-foreground": "#B4E90E",
			border: "#1a2233",
			ring: "#B4E90E",
		  },
		  primary: {
			DEFAULT: "hsl(var(--primary))",
			foreground: "hsl(var(--primary-foreground))",
		  },
		  secondary: {
			DEFAULT: "hsl(var(--secondary))",
			foreground: "hsl(var(--secondary-foreground))",
		  },
		  muted: {
			DEFAULT: "hsl(var(--muted))",
			foreground: "hsl(var(--muted-foreground))",
		  },
		  accent: {
			DEFAULT: "hsl(var(--accent))",
			foreground: "hsl(var(--accent-foreground))",
		  },
		  destructive: {
			DEFAULT: "hsl(var(--destructive))",
			foreground: "hsl(var(--destructive-foreground))",
		  },
		  border: "hsl(var(--border))",
		  input: "hsl(var(--input))",
		  ring: "hsl(var(--ring))",
		  chart: {
			1: "hsl(var(--chart-1))",
			2: "hsl(var(--chart-2))",
			3: "hsl(var(--chart-3))",
			4: "hsl(var(--chart-4))",
			5: "hsl(var(--chart-5))",
		  },
		  // Add the custom color
		  custom: "#c2fe02",
		},
		borderRadius: {
		  lg: "var(--radius)",
		  md: "calc(var(--radius) - 2px)",
		  sm: "calc(var(--radius) - 4px)",
		},
	  },
	},
	plugins: [require("tailwindcss-animate")],
  };
  
  export default tailwindConfig;
  