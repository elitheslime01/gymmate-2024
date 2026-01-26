import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client' 
import App from './App'
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const theme = extendTheme({
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
    color:  "#071434"
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ChakraProvider theme={theme}>
        <App/>
        <SpeedInsights/>
      </ChakraProvider>
    </BrowserRouter>
  </StrictMode>
)