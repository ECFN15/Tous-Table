/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable manual toggling via 'dark' class
    theme: {
        extend: {
            keyframes: {
                shimmer: {
                    '100%': { transform: 'translateX(100%)' }
                }
            },
            animation: {
                shimmer: 'shimmer 1.5s infinite',
            },
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'sans-serif'],
                serif: ['Cormorant Garamond', 'serif'],
            },
            colors: {
                stone: {
                    50: '#fafaf9',
                    100: '#f5f5f4',
                    200: '#e7e5e4',
                    300: '#d6d3d1',
                    400: '#a8a29e',
                    500: '#78716c',
                    600: '#57534e',
                    700: '#44403c',
                    800: '#292524',
                    900: '#1c1917',
                    950: '#0c0a09',
                },
            },
        },
    },
    plugins: [],
}
