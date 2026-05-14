import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Story } from './pages/Story';
import { CartProvider } from './context/CartContext';
import { ProductsProvider } from './context/ProductsContext';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './context/AuthContext';

const AppGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-ivory flex items-center justify-center">
        <p className="font-display text-4xl italic animate-pulse">Dhanak</p>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {!user && (
          <AuthModal
            required
            onClose={() => { }} // no-op — cannot be dismissed
          />
        )}
      </AnimatePresence>
      {children}
    </>
  );
};

export default function App() {
  return (
    <ProductsProvider>
      <CartProvider>
        <AppGate>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="product/:id" element={<ProductDetail />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="story" element={<Story />} />
              </Route>
            </Routes>
          </Router>
        </AppGate>
      </CartProvider>
    </ProductsProvider>
  );
}