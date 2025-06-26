import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Package,
  Tags,
  Palette,
  Images,
  BarChart3,
  Settings,
  Home,
  ChevronDown,
  ChevronRight,
  Globe,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface LayoutProps {
  children: ReactNode;
  onLogout?: () => void;
}

const navigation = [
  {
    name: 'Главная',
    href: '/',
    icon: Home,
  },
  {
    name: 'Категории',
    href: '/categories',
    icon: Tags,
  },
  {
    name: 'Товары',
    href: '/products',
    icon: Package,
  },
];

const globalManagementItems = [
  {
    name: 'Варианты',
    href: '/variants',
    icon: Palette,
  },
  {
    name: 'Изображения',
    href: '/images',
    icon: Images,
  },
];

export function Layout({ children, onLogout }: LayoutProps) {
  const location = useLocation();
  
  // Загружаем состояние сайдбара из localStorage
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 1024; // По умолчанию открыт на десктопе
  });
  
  // Проверяем, активен ли какой-либо элемент глобального управления
  const isGlobalManagementActive = globalManagementItems.some(
    item => location.pathname === item.href
  );
  
  // Автоматически открываем выпадающий список, если активен один из его элементов
  const [isGlobalManagementOpen, setIsGlobalManagementOpen] = useState(isGlobalManagementActive);

  // Обновляем состояние при изменении маршрута
  useEffect(() => {
    if (isGlobalManagementActive) {
      setIsGlobalManagementOpen(true);
    }
  }, [location.pathname, isGlobalManagementActive]);

  // Обработчик клавиши Escape для скрытия сайдбара
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSidebarOpen]);

  // Сохраняем состояние сайдбара в localStorage
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  // Обработчик изменения размера окна
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false); // Автоматически скрываем на мобильных
      } else {
        // На десктопе восстанавливаем сохраненное состояние
        const saved = localStorage.getItem('sidebarOpen');
        if (saved !== null) {
          setIsSidebarOpen(JSON.parse(saved));
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Вызываем сразу при загрузке

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Overlay для мобильных устройств */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 ease-in-out",
          "lg:relative lg:z-auto lg:shadow-none", // На десктопе относительное позиционирование
          isSidebarOpen 
            ? "w-64 translate-x-0" 
            : "w-0 -translate-x-full lg:w-16 lg:translate-x-0" // Убираем hover-эффект
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-4 lg:px-6 border-b">
            <div className="flex items-center space-x-2 min-w-0">
              <BarChart3 className="h-8 w-8 text-blue-600 flex-shrink-0" />
              <span className={cn(
                "text-xl font-bold text-gray-900 transition-all duration-300 truncate",
                isSidebarOpen ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
              )}>
                Admin Panel
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className={cn(
            "flex-1 space-y-1 px-2 lg:px-4 py-6 transition-opacity duration-300",
            isSidebarOpen ? "opacity-100" : "opacity-0 lg:opacity-100"
          )}>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.name} to={item.href} onClick={closeSidebar}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start group relative",
                      isActive
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
                      !isSidebarOpen && "justify-center lg:justify-center" // Центрируем иконку в мини-версии
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isSidebarOpen ? "mr-3" : "mr-0" // Убираем отступ в мини-версии
                    )} />
                    <span className={cn(
                      "transition-all duration-300 truncate",
                      isSidebarOpen ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
                    )}>
                      {item.name}
                    </span>
                    {/* Tooltip для мини-версии */}
                    {!isSidebarOpen && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.name}
                      </div>
                    )}
                  </Button>
                </Link>
              );
            })}

            {/* Глобальное управление */}
            <Collapsible
              open={isGlobalManagementOpen}
              onOpenChange={setIsGlobalManagementOpen}
              className="space-y-1"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant={isGlobalManagementActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-between group relative",
                    isGlobalManagementActive
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
                    !isSidebarOpen && "justify-center lg:justify-center" // Центрируем иконку в мини-версии
                  )}
                >
                  <div className="flex items-center min-w-0">
                    <Globe className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isSidebarOpen ? "mr-3" : "mr-0" // Убираем отступ в мини-версии
                    )} />
                    <span className={cn(
                      "transition-all duration-300 truncate",
                      isSidebarOpen ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
                    )}>
                      Глобальное управление
                    </span>
                  </div>
                  <div className={cn(
                    "transition-all duration-300 flex-shrink-0",
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  )}>
                    {isGlobalManagementOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                  {/* Tooltip для мини-версии */}
                  {!isSidebarOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      Глобальное управление
                    </div>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className={cn(
                "space-y-1 pl-4 transition-all duration-300 overflow-hidden",
                isSidebarOpen 
                  ? "opacity-100 max-h-96" 
                  : "opacity-0 max-h-0"
              )}>
                {globalManagementItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link key={item.name} to={item.href} onClick={closeSidebar}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                          "w-full justify-start text-sm group relative",
                          isActive
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        )}
                      >
                        <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                        <span className={cn(
                          "transition-all duration-300 truncate",
                          isSidebarOpen ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
                        )}>
                          {item.name}
                        </span>
                        {/* Tooltip для мини-версии */}
                        {!isSidebarOpen && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            {item.name}
                          </div>
                        )}
                      </Button>
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </nav>

          {/* Разделитель перед настройками */}
          <div className={cn(
            "px-2 lg:px-4 transition-opacity duration-300",
            isSidebarOpen ? "opacity-100" : "opacity-0 lg:opacity-100"
          )}>
            <Separator className="my-2" />
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">
              {isSidebarOpen ? "Управление" : ""}
            </div>
          </div>

          {/* Settings and Logout */}
          <div className={cn(
            "space-y-1 p-2 lg:p-4 transition-opacity duration-300",
            isSidebarOpen ? "opacity-100" : "opacity-0 lg:opacity-100"
          )}>
            {/* Settings */}
            <Link to="/settings" onClick={closeSidebar}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100 group relative",
                  !isSidebarOpen && "justify-center lg:justify-center" // Центрируем иконку в мини-версии
                )}
              >
                <Settings className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isSidebarOpen ? "mr-3" : "mr-0" // Убираем отступ в мини-версии
                )} />
                <span className={cn(
                  "transition-all duration-300 truncate",
                  isSidebarOpen ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
                )}>
                  Настройки
                </span>
                {/* Tooltip для мини-версии */}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Настройки
                  </div>
                )}
              </Button>
            </Link>

            {/* Logout */}
            {onLogout && (
              <Button
                variant="ghost"
                onClick={onLogout}
                className={cn(
                  "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 group relative",
                  !isSidebarOpen && "justify-center lg:justify-center" // Центрируем иконку в мини-версии
                )}
              >
                <LogOut className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isSidebarOpen ? "mr-3" : "mr-0" // Убираем отступ в мини-версии
                )} />
                <span className={cn(
                  "transition-all duration-300 truncate",
                  isSidebarOpen ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
                )}>
                  Выйти
                </span>
                {/* Tooltip для мини-версии */}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Выйти
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Toggle Button для мобильных */}
      <Button
        onClick={toggleSidebar}
        variant="outline"
        size="sm"
        className={cn(
          "fixed top-4 z-50 transition-all duration-300 shadow-md hover:shadow-lg",
          "lg:hidden", // Скрываем на десктопе, показываем только на мобильных
          isSidebarOpen ? "left-4" : "left-4"
        )}
      >
        {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Toggle Button для десктопа */}
      <Button
        onClick={toggleSidebar}
        variant="outline"
        size="sm"
        className={cn(
          "fixed top-4 z-50 transition-all duration-300 shadow-md hover:shadow-lg",
          "hidden lg:flex", // Показываем только на десктопе
          isSidebarOpen ? "left-4" : "left-4"
        )}
      >
        {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Main content */}
      <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        "lg:ml-0", // Убираем отступ на десктопе, так как используем flexbox
        isSidebarOpen 
          ? "lg:ml-0" // На десктопе отступ не нужен
          : "lg:ml-0" // На десктопе отступ не нужен
      )}>
        <main className="min-h-screen w-full p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
