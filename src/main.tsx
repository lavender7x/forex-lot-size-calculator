import { createRoot } from 'react-dom/client'
import './index.css'
import { Calculator } from './calculator';

createRoot(document.getElementById('root')!).render(
  <Calculator />
);
