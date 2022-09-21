import { ChakraProvider, ColorModeProvider, useColorMode } from '@chakra-ui/react';
import customTheme from '../styles/theme';
import { Global, css } from '@emotion/react';

const GlobalStyle = ({ children }) => {
	const { colorMode } = useColorMode();

	return ( // 0a0c11
		<>
			<Global
			styles={css`
			::selection {
				background-color: #b794f4;
				color: #fefefe;
			}
			::-moz-selection {
				background: #ffb7b7;
				color: #fefefe;
			}
			#__next {
				display: flex;
				scroll-behavior: smooth;
				flex-direction: column;
				min-height: 100vh;
				background: ${colorMode === 'light' ? 'white' : '#101010'};
			}
			body {
				min-height: 100%;
				scroll-behavior: smooth;
				background: ${colorMode === 'light' ? 'white' : '#101010'};
			}
			@font-face {
				font-family: 'smallest-pixel';
				font-style: normal;
				font-weight: 700;
				font-display: swap;
				src: url('/fonts/smallest_pixel-7.ttf');
			}
			@font-face {
				font-family: 'Alagard';
				font-style: normal;
				font-weight: 700;
				font-display: swap;
				src: url('/fonts/alagard.ttf');
			}
			`}
			/>
			{children}
		</>
	)
};

const MyApp = ({ Component, pageProps }) => {
  return (
	  <ChakraProvider resetCSS theme={customTheme}>
			<ColorModeProvider
			options={{
				initialColorMode: 'dark',
			}}>
				<GlobalStyle>
					<Component {...pageProps}/>
				</GlobalStyle>
			</ColorModeProvider>
		</ChakraProvider>
  )
}

export default MyApp
