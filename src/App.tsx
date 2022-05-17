import React from "react"
import "./App.css"
import Menu from "./Menu"
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material/styles';

let theme = createTheme();
theme = responsiveFontSizes(theme, {factor: 4});

function App() {
  return (
    <div className="App">
      <body>
          <ThemeProvider theme={theme}>
              <Menu />
	  </ThemeProvider>
      </body>
    </div>
  )
}

export default App
