/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  	extend: {
  		fontFamily: {
  			serif: [
  				'var(--font-bodoni-moda)',
  				'Bodoni Moda',
  				'Georgia',
  				'serif'
  			],
  			sans: [
  				'var(--font-lato)',
  				'Lato',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'var(--font-mono)',
  				'ui-monospace',
  				'SFMono-Regular',
  				'Menlo',
  				'monospace'
  			]
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				50: 'hsl(var(--primary-50))',
  				100: 'hsl(var(--primary-100))',
  				200: 'hsl(var(--primary-200))',
  				300: 'hsl(var(--primary-300))',
  				400: 'hsl(var(--primary-400))',
  				500: 'hsl(var(--primary-500))',
  				600: 'hsl(var(--primary-600))',
  				700: 'hsl(var(--primary-700))',
  				800: 'hsl(var(--primary-800))',
  				900: 'hsl(var(--primary-900))',
  				950: 'hsl(var(--primary-950))',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				50: 'hsl(var(--secondary-50))',
  				100: 'hsl(var(--secondary-100))',
  				200: 'hsl(var(--secondary-200))',
  				300: 'hsl(var(--secondary-300))',
  				400: 'hsl(var(--secondary-400))',
  				500: 'hsl(var(--secondary-500))',
  				600: 'hsl(var(--secondary-600))',
  				700: 'hsl(var(--secondary-700))',
  				800: 'hsl(var(--secondary-800))',
  				900: 'hsl(var(--secondary-900))',
  				950: 'hsl(var(--secondary-950))',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				50: 'hsl(var(--accent-50))',
  				100: 'hsl(var(--accent-100))',
  				200: 'hsl(var(--accent-200))',
  				300: 'hsl(var(--accent-300))',
  				400: 'hsl(var(--accent-400))',
  				500: 'hsl(var(--accent-500))',
  				600: 'hsl(var(--accent-600))',
  				700: 'hsl(var(--accent-700))',
  				800: 'hsl(var(--accent-800))',
  				900: 'hsl(var(--accent-900))',
  				950: 'hsl(var(--accent-950))',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			gray: {
  				50: 'hsl(var(--gray-50))',
  				100: 'hsl(var(--gray-100))',
  				200: 'hsl(var(--gray-200))',
  				300: 'hsl(var(--gray-300))',
  				400: 'hsl(var(--gray-400))',
  				500: 'hsl(var(--gray-500))',
  				600: 'hsl(var(--gray-600))',
  				700: 'hsl(var(--gray-700))',
  				800: 'hsl(var(--gray-800))',
  				900: 'hsl(var(--gray-900))',
  				950: 'hsl(var(--gray-950))'
  			},
  			success: {
  				50: 'hsl(var(--success-50))',
  				100: 'hsl(var(--success-100))',
  				500: 'hsl(var(--success-500))',
  				600: 'hsl(var(--success-600))',
  				700: 'hsl(var(--success-700))',
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))'
  			},
  			warning: {
  				50: 'hsl(var(--warning-50))',
  				100: 'hsl(var(--warning-100))',
  				500: 'hsl(var(--warning-500))',
  				600: 'hsl(var(--warning-600))',
  				700: 'hsl(var(--warning-700))',
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			error: {
  				50: 'hsl(var(--error-50))',
  				100: 'hsl(var(--error-100))',
  				500: 'hsl(var(--error-500))',
  				600: 'hsl(var(--error-600))',
  				700: 'hsl(var(--error-700))',
  			},
  			info: {
  				50: 'hsl(var(--info-50))',
  				100: 'hsl(var(--info-100))',
  				500: 'hsl(var(--info-500))',
  				600: 'hsl(var(--info-600))',
  				700: 'hsl(var(--info-700))',
  				DEFAULT: 'hsl(var(--info))',
  				foreground: 'hsl(var(--info-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		typography: {
  			DEFAULT: {
  				css: {
  					maxWidth: '75ch',
  					color: 'hsl(var(--foreground))',
  					a: {
  						color: 'hsl(var(--primary))',
  						'&:hover': {
  							color: 'hsl(var(--primary-600))'
  						},
  						textDecoration: 'none',
  						fontWeight: '500',
  					},
  					h1: {
  						color: 'hsl(var(--foreground))',
  						fontFamily: 'var(--font-bodoni-moda), Bodoni Moda, Georgia, serif',
  						fontWeight: '700',
  					},
  					h2: {
  						color: 'hsl(var(--foreground))',
  						fontFamily: 'var(--font-bodoni-moda), Bodoni Moda, Georgia, serif',
  						fontWeight: '600',
  					},
  					h3: {
  						color: 'hsl(var(--foreground))',
  						fontFamily: 'var(--font-bodoni-moda), Bodoni Moda, Georgia, serif',
  						fontWeight: '600',
  					},
  					h4: {
  						color: 'hsl(var(--foreground))',
  						fontFamily: 'var(--font-bodoni-moda), Bodoni Moda, Georgia, serif',
  						fontWeight: '600',
  					},
  					blockquote: {
  						borderLeftColor: 'hsl(var(--accent))',
  						color: 'hsl(var(--muted-foreground))',
  						fontStyle: 'italic',
  					},
  					strong: {
  						color: 'hsl(var(--foreground))',
  						fontWeight: '600',
  					},
  					code: {
  						color: 'hsl(var(--foreground))',
  						backgroundColor: 'hsl(var(--muted))',
  						padding: '0.125rem 0.25rem',
  						borderRadius: '0.25rem',
  						fontFamily: 'var(--font-mono), monospace',
  						fontWeight: '400',
  					},
  					pre: {
  						backgroundColor: 'hsl(var(--muted))',
  						borderRadius: 'var(--radius-md)',
  						overflow: 'auto',
  						color: 'hsl(var(--foreground))',
  						fontFamily: 'var(--font-mono), monospace',
  						padding: '1rem',
  					},
  					hr: {
  						borderColor: 'hsl(var(--border))',
  					},
  					ul: {
  						li: {
  							'&::marker': {
  								color: 'hsl(var(--primary))',
  							},
  						},
  					},
  				}
  			}
  		},
  		borderRadius: {
  			sm: 'var(--radius-sm)',
  			DEFAULT: 'var(--radius-md)',
  			md: 'var(--radius-md)',
  			lg: 'var(--radius-lg)',
  			xl: 'var(--radius-xl)',
  			'2xl': 'var(--radius-2xl)',
  			full: '9999px'
  		},
  		boxShadow: {
  			sm: 'var(--shadow-sm)',
  			DEFAULT: 'var(--shadow-md)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  		},
  		keyframes: {
  			slideDown: {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' },
  			},
  			slideUp: {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' },
  			},
  			overlayShow: {
  				from: { opacity: '0' },
  				to: { opacity: '1' },
  			},
  			contentShow: {
  				from: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.96)' },
  				to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
  			},
  		},
  		animation: {
  			slideDown: 'slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1)',
  			slideUp: 'slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1)',
  			overlayShow: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
  			contentShow: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
  		}
  	}
  },
  plugins: [
    require('@tailwindcss/typography'),
    require("tailwindcss-animate"),
    require('@tailwindcss/container-queries')
  ],
} 