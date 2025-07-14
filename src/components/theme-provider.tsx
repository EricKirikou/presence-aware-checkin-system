import * as React from "react"
import { ThemeProvider as MuiThemeProvider } from "@mui/material"
import { createTheme } from "@mui/material/styles"

const theme = createTheme({
  // Your theme config
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
}