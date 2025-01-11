import React from "react"
import ReactDOM from "react-dom/client"
import MyComponent from "./PeraWallet"
import "./style.css"

const rootElement = document.getElementById("root") as HTMLElement
const root = ReactDOM.createRoot(rootElement)

root.render(
  <React.StrictMode>
    <MyComponent />
  </React.StrictMode>
)
