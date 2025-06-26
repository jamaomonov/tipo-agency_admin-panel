import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/components/LoginPage';
import { Dashboard } from '@/pages/Dashboard';
import { Categories } from '@/pages/Categories';
import { Products } from '@/pages/Products';
import { Variants } from '@/pages/Variants';
import { Images } from '@/pages/Images';
import { ProductDetails } from '@/pages/ProductDetails';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

// Обертка для получения productId из параметров URL
function ProductDetailsWrapper() {
  const { productId } = useParams<{ productId: string }>();
  return <ProductDetails productId={parseInt(productId || '0')} />;
}

function AppContent() {
  const { isAuthenticated, isLoading, login, logout } = useAuth();

  // Показываем загрузку пока проверяем статус аутентификации
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если не аутентифицирован, показываем страницу входа
  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  // Если аутентифицирован, показываем основное приложение
  return (
    <Layout onLogout={logout}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:productId" element={<ProductDetailsWrapper />} />
        <Route path="/variants" element={<Variants />} />
        <Route path="/images" element={<Images />} />
        <Route path="/settings" element={
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Настройки</h1>
              <p className="text-gray-600">Управление настройками административной панели</p>
            </div>
            
            <div className="grid gap-6">
              {/* Основные настройки */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Основные настройки</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Название панели</h3>
                      <p className="text-sm text-gray-500">Admin Panel</p>
                    </div>
                    <Button variant="outline" size="sm">Изменить</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Версия</h3>
                      <p className="text-sm text-gray-500">1.0.0</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Настройки безопасности */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Безопасность</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Смена пароля</h3>
                      <p className="text-sm text-gray-500">Изменить пароль администратора</p>
                    </div>
                    <Button variant="outline" size="sm">Изменить</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Сессии</h3>
                      <p className="text-sm text-gray-500">Управление активными сессиями</p>
                    </div>
                    <Button variant="outline" size="sm">Просмотр</Button>
                  </div>
                </div>
              </div>

              {/* Информация о системе */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Система</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">API статус</h3>
                      <p className="text-sm text-green-600">Подключено</p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Последнее обновление</h3>
                      <p className="text-sm text-gray-500">{new Date().toLocaleString('ru-RU')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
