import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Punto de entrada de la aplicación React:
// monta el componente App dentro del nodo <div id="root"> del index.html.
createRoot(document.getElementById('root')).render(<App />)