import {createTheme} from '@mantine/core';

/**
 * Notion-раскладка (воздух, плоские поверхности, тонкие бордеры)
 * в фирменной палитре Татнефти: зелёный акцент #23A577/#019967,
 * тёплые нейтральные серые, красный — для ошибок.
 */
export const mantineTheme = createTheme({
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    primaryColor: 'tatneft',
    primaryShade: 5,
    defaultRadius: 'md',
    black: '#2b2a28',
    colors: {
        gray: [
            '#f6f6f5', '#eeeeed', '#e4e4e2', '#d2d2d0', '#bebebe',
            '#9a9a9a', '#7a7a7a', '#5f5f5f', '#454443', '#2b2a28',
        ],
        tatneft: [
            '#e7f7f0', '#c7ecdd', '#98e0c6', '#4fd4a9', '#17c98f',
            '#23a577', '#019967', '#32765f', '#174737', '#05393a',
        ],
        brandRed: [
            '#fdecec', '#fbd5d4', '#f5a9a8', '#ef807e', '#e65251',
            '#e94e4c', '#da3b39', '#b51f1d', '#871b19', '#5f1211',
        ],
    },
    components: {
        Paper: {defaultProps: {shadow: 'none'}},
    },
});

/** Notion-подобные цвета для инлайновых стилей (шапки, панели, бордеры). */
export const nc = {
    surface: '#ffffff',
    panel: '#f6f6f5',
    border: '#e9e9e7',
    text: '#2b2a28',
    dimmed: '#7a7a7a',
    green: '#23a577',
    greenDark: '#019967',
    red: '#e94e4c',
} as const;
