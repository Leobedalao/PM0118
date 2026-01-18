import { Link, useLocation } from 'react-router';
import { Home, ListTodo, CheckSquare, LayoutDashboard, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: '仪表盘', href: '/', icon: LayoutDashboard },
  { name: '任务管理', href: '/tasks', icon: ListTodo },
  { name: '打卡记录', href: '/check-ins', icon: CheckSquare },
];

function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Home className="h-6 w-6 text-sidebar-foreground" />
        <span className="ml-2 text-lg font-semibold text-sidebar-foreground">
          学习计划管理
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-sidebar-foreground/70">
          © 2026 学习计划管理系统
        </p>
      </div>
    </div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      {/* 桌面端侧边栏 */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <Sidebar />
      </aside>

      {/* 主内容区域 */}
      <div className="flex flex-1 flex-col">
        {/* 移动端顶部导航栏 */}
        <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-4 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <span className="ml-4 text-lg font-semibold">学习计划管理</span>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 p-4 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
