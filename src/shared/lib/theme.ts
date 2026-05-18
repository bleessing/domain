import type { ThemeConfig } from 'antd';

/**
 * Палитра фирменного стиля Татнефть: красный + зелёный + белый.
 * Согласно ребрендингу 2006 (DDVB/Direct Design): красный — принадлежность
 * к ТЭК, зелёный — экологичность, белый — чистота намерений и прозрачность.
 * HEX-значения — приближение к официальному брендбуку; уточнить при доступе.
 */
export const colors = {
    primary: '#009A44',      // фирменный зелёный Татнефти
    primaryHover: '#00B050',
    primaryDark: '#007A36',
    accent: '#E30613',       // фирменный красный
    accentHover: '#C00510',
    background: '#F5F7F6',   // мягкий тёплый светло-серый, без синевы
    surface: '#FFFFFF',
    border: '#E1E6E2',
    text: '#1F2937',
    textMuted: '#6B7280',
    headerBg: '#FFFFFF',     // шапка белая с цветным акцентом (в духе сайта)
    headerBorder: '#E30613',
} as const;

export const antdTheme: ThemeConfig = {
    token: {
        colorPrimary: colors.primary,
        colorInfo: colors.primary,
        colorError: colors.accent,
        colorLink: colors.primary,
        colorBgLayout: colors.background,
        colorBgContainer: colors.surface,
        colorBorder: colors.border,
        colorText: colors.text,
        colorTextSecondary: colors.textMuted,
        borderRadius: 4,
        fontFamily:
            "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: 14,
    },
    components: {
        Button: {
            primaryShadow: '0 1px 2px rgba(0, 154, 68, 0.18)',
            fontWeight: 500,
        },
        Card: {
            headerBg: colors.surface,
            boxShadowTertiary: '0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)',
        },
        Steps: {
            colorPrimary: colors.primary,
        },
        Layout: {
            headerBg: colors.headerBg,
            headerColor: colors.text,
            bodyBg: colors.background,
        },
    },
};
