import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Gogglify from './pages/Gogglify';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function App() {
  return (
    <BrowserRouter>
      <div className="wrapper">
        <div className="page">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gogglify" element={<Gogglify />} />
          </Routes>
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}
