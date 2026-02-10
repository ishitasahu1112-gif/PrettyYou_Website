import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Stylist from './pages/Stylist';
import About from './pages/About';
import Checkout from './pages/Checkout';
import { CartProvider } from './context/CartContext';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="stylist" element={<Stylist />} />
            <Route path="about" element={<About />} />
            <Route path="checkout" element={<Checkout />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
