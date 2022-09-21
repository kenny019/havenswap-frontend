import { extendTheme } from '@chakra-ui/react';
import { theme as chakraTheme } from '@chakra-ui/react';
import { createBreakpoints } from '@chakra-ui/theme-tools'

const fonts = {
	...chakraTheme.fonts,
	body: 'Montserrat',
	heading: 'Source Sans Pro',
};

const breakpoints = createBreakpoints({
	sm: '40em',
	md: '52em',
	lg: '64em',
});

const overrides = {
	...chakraTheme,
	fonts,
	breakpoints,
	fontWeights: {
		normal: 300,
		medium: 600,
		bold: 700,
	},
	fontSize: {
		xs: '12px',
		sm: '14px',
		md: '16px',
		lg: '18px',
		xl: '20px',
		'2xl': '24px',
		'3xl': '28px',
		'4xl': '36px',
		'5xl': '48px',
		'6xl': '64px',
	},
	colors: {
		discord: {
			50: '#e5e8ff',
			100: '#b7befd',
			200: '#8892f7',
			300: '#5966f2',
			400: '#2c3bed',
			500: '#8892f7',
			600: '#5966f2',
			700: '#5966f2',
			800: '#5966f2',
			900: '#5966f2',
		},
		gray: {
			50: '#f2f2f2',
			100: '#d9d9d9',
			200: '#bfbfbf',
			300: '#a6a6a6',
			400: '#8c8c8c',
			500: '#737373',
			600: '#595959',
			700: '#404040',
			800: '#262626',
			900: '#0d0d0d',
		}
	}
};

const customTheme = extendTheme(overrides)

export default customTheme