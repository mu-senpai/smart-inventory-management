'use client';

import { ConfigProvider, theme as antdTheme } from 'antd';
import { ThemeProvider, useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';

// This inner provider consumes the next-themes state and applies the appropriate Ant Design algorithm.
function AntdThemeProvider({ children }: { children: React.ReactNode }) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Wait until mounted to prevent hydration mismatches
    useEffect(() => {
        setMounted(true);
    }, []);

    const isDarkMode = mounted && resolvedTheme === 'dark';

    return (
        <ConfigProvider
            theme={{
                algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
                token: {
                    colorPrimary: '#272877', // Maintain the brand color across themes
                    fontFamily: 'var(--font-inter)', // Keep using our custom font
                }
            }}
        >
            {children}
        </ConfigProvider>
    );
}

// The root layout will use this component to wrap the app
export default function ThemeClientProvider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AntdThemeProvider>
                {children}
            </AntdThemeProvider>
        </ThemeProvider>
    );
}
