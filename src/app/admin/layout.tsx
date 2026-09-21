"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  LogOut,
  Menu,
  X,
  Bike,
  LayoutTemplate,
  FileText,
  HelpCircle,
  MapPin,
  Shield,
  Layers,
  Upload,
  ChevronDown
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // If on login page, don't show sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  type NavItem = 
    | { name: string; href: string; icon: React.ElementType; children?: undefined }
    | { name: string; href: string; icon: React.ElementType; children: { name: string; href: string; icon: React.ElementType }[] };

  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
      children: [
        { name: "All Products", href: "/admin/products", icon: Package },
        { name: "Create Product", href: "/admin/products/new", icon: Package },
        { name: "Bulk Import", href: "/admin/products/bulk-import", icon: Upload },
      ],
    },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Inventory", href: "/admin/inventory", icon: Layers },
    { name: "Homepage CMS", href: "/admin/content/homepage", icon: LayoutTemplate },
    { name: "Legal CMS", href: "/admin/content/legal", icon: FileText },
    { name: "FAQ CMS", href: "/admin/content/faq", icon: HelpCircle },
    { name: "Stores CMS", href: "/admin/content/stores", icon: MapPin },
    { name: "Accounts", href: "/admin/accounts", icon: Shield },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-bg">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } flex flex-col transition-all duration-300 bg-surface-raised border-r border-border shrink-0 z-20`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {isSidebarOpen ? (
            <span className="font-display font-bold text-accent tracking-wider">UDAYA ADMIN</span>
          ) : (
            <Bike className="w-8 h-8 text-accent mx-auto" />
          )}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const hasChildren = item.children && item.children.length > 0;
              const isProductsExpanded = hasChildren && isActive;

              return (
                <li key={item.name}>
                  {hasChildren ? (
                    <>
                      <Link
                        href={item.href}
                        className={`flex items-center p-3 rounded-md transition-colors ${
                          isActive
                            ? "bg-accent/10 text-accent"
                            : "text-text-secondary hover:bg-surface hover:text-text-primary"
                        } ${!isSidebarOpen && "justify-center"}`}
                        title={!isSidebarOpen ? item.name : undefined}
                      >
                        <item.icon className={`w-5 h-5 ${isSidebarOpen && "mr-3"} shrink-0`} />
                        {isSidebarOpen && (
                          <>
                            <span className="flex-1">{item.name}</span>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${
                                isProductsExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </>
                        )}
                      </Link>
                      {isSidebarOpen && isProductsExpanded && (
                        <ul className="mt-1 ml-4 border-l border-border pl-3 space-y-1">
                          {item.children!.map((child) => {
                            const childActive = pathname === child.href;
                            return (
                              <li key={child.name}>
                                <Link
                                  href={child.href}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                                    childActive
                                      ? "text-accent bg-accent/5"
                                      : "text-text-secondary hover:text-text-primary hover:bg-surface"
                                  }`}
                                >
                                  <child.icon className="w-4 h-4" />
                                  {child.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center p-3 rounded-md transition-colors ${
                        isActive
                          ? "bg-accent/10 text-accent"
                          : "text-text-secondary hover:bg-surface hover:text-text-primary"
                      } ${!isSidebarOpen && "justify-center"}`}
                      title={!isSidebarOpen ? item.name : undefined}
                    >
                      <item.icon className={`w-5 h-5 ${isSidebarOpen && "mr-3"}`} />
                      {isSidebarOpen && <span>{item.name}</span>}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <button
            className={`flex items-center p-3 w-full rounded-md text-error hover:bg-error/10 transition-colors ${
              !isSidebarOpen && "justify-center"
            }`}
            onClick={async () => {
              await fetch("/api/admin/auth/logout", { method: "POST" });
              router.push("/admin/login");
            }}
            title={!isSidebarOpen ? "Log Out" : undefined}
          >
            <LogOut className={`w-5 h-5 ${isSidebarOpen && "mr-3"}`} />
            {isSidebarOpen && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-surface-raised border-b border-border flex items-center justify-between px-6 shrink-0 z-10">
          <button 
            onClick={toggleSidebar}
            className="text-text-secondary hover:text-text-primary transition-colors p-2 -ml-2"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-text-secondary">
              Admin Session
            </span>
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
