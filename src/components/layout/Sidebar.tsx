import { 
  Calendar, 
  ClipboardList, 
  Home, 
  User, 
  Users, 
  LogOut,
  Settings,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Encomendas",
    href: "/orders",
    icon: ClipboardList,
  },
  {
    title: "Produção",
    href: "/production",
    icon: Users,
  },
  {
    title: "Relatórios",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "Calendário",
    href: "/calendar",
    icon: Calendar,
  },
];

const bottomNavItems: NavItem[] = [
  {
    title: "Meu Perfil",
    href: "/profile",
    icon: User,
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
  },
];

const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const location = useLocation();
  
  const NavItem = ({ title, href, icon: Icon }: NavItem) => {
    const isActive = href === "/"
      ? location.pathname === href
      : location.pathname.startsWith(href);
      
    return (
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-2 my-1",
          isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-accent hover:text-accent-foreground"
        )}
        asChild
      >
        <a href={href} onClick={closeSidebar}>
          <Icon className={cn("h-5 w-5", isActive ? "text-secondary-foreground" : "text-muted-foreground")} />
          <span>{title}</span>
        </a>
      </Button>
    );
  };
  
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-14 bottom-0 left-0 z-40 w-64 bg-sidebar border-r transition-transform duration-300 md:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        
        <nav className="flex-1 px-3 py-2">
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
        </nav>

        <div className="p-3">
          <Separator className="my-2" />
          <div className="space-y-1">
            {bottomNavItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
            
            <Button variant="ghost" className="w-full justify-start gap-2 my-1 hover:bg-destructive/10 hover:text-destructive group" asChild>
              <a href="/">
                <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-destructive" />
                <span>Sair</span>
              </a>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
