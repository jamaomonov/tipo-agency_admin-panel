import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Categories } from '@/pages/Categories';
import { Products } from '@/pages/Products';
import { Variants } from '@/pages/Variants';
import { Images } from '@/pages/Images';
import { ProductDetails } from '@/pages/ProductDetails';
import { useParams } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:productId" element={<ProductDetailsWrapper />} />
          <Route path="/variants" element={<Variants />} />
          <Route path="/images" element={<Images />} />
          <Route path="/settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Настройки</h1><p className="text-gray-600">Скоро будет готово...</p></div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

// Обертка для получения productId из параметров URL
function ProductDetailsWrapper() {
  const { productId } = useParams<{ productId: string }>();
  return <ProductDetails productId={parseInt(productId || '0')} />;
}

export default App;
