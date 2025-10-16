// frontend/src/router.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Search from './pages/Search';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Search />} />  {/* Use Search as the home page for now */}
      </Routes>
    </BrowserRouter>
  );
}
