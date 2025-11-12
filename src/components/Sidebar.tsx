// File Path: src/components/Sidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, BarChart3, Truck, Users, Briefcase, 
  FileText, CreditCard, Settings, LogOut 
} from 'lucide-react';

// Sidebar de har ik link da data
const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/jobs', label: 'Dispatch Jobs', icon: Briefcase },
  { href: '/dashboard/vehicles', label: 'Vehicles', icon: Truck },
  { href: '/dashboard/drivers', label: 'Drivers', icon: Users },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
];

const bottomLinks = [
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    // Aapan logout functionality baad vich add karange
    { href: '#', label: 'Logout', icon: LogOut },
]

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex flex-col fixed inset-y-0 z-50
                       border-r border-neutral-200 bg-white">
      
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-neutral-200">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-extrabold tracking-tight text-xl">
            Auto
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-500">
              Dispatch
            </span>
            AI
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-1 p-4">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] transition-colors
                ${
                  isActive
                    ? 'bg-neutral-100 text-neutral-900 font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

       {/* Bottom Links (Settings, Logout) */}
       <div className="p-4 border-t border-neutral-200">
       {bottomLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] transition-colors
                         text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
       </div>
    </aside>
  );
}