// src/contexts/ColorModeContext.tsx
import React, { createContext, useMemo, useState, useContext } from 'react';
import { createTheme, ThemeProvider, PaletteMode, CssBaseline } from '@mui/material';

interface ColorModeContextType {
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextType>({
  toggleColorMode: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);

export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>('light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
