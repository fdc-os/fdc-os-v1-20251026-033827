import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Briefcase,
  FileText,
  Boxes,
  BarChart3,
  Settings,
  User,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth';
import { cn } from '@/lib/utils';
const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', module: 'Dashboard' },
  { to: '/appointments', icon: Calendar, label: 'Appointments', module: 'Appointments' },
  { to: '/patients', icon: Users, label: 'Patients', module: 'Patients' },
  { to: '/staff', icon: Briefcase, label: 'Staff', module: 'Staff' },
  { to: '/services', icon: FileText, label: 'Services', module: 'Services' },
  { to: '/invoices', icon: FileText, label: 'Invoices', module: 'Invoices' },
  { to: '/inventory', icon: Boxes, label: 'Inventory', module: 'Inventory' },
  { to: '/reports', icon: BarChart3, label: 'Reports', module: 'Reports' },
];
const bottomNavItems = [
    { to: '/settings', icon: Settings, label: 'Settings', module: 'Settings' },
    { to: '/portal', icon: User, label: 'Patient Portal', module: 'Portal' },
];
export function SidebarNav() {
  const permissions = useAuthStore((state) => state.permissions);
  const renderLink = ({ to, icon: Icon, label }: typeof navItems[0]) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
          isActive && 'bg-muted text-primary'
        )
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );
  return (
    <div className="flex-1">
      <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1 py-4">
        {navItems
          .filter((item) => permissions.includes(item.module))
          .map(renderLink)}
      </nav>
      <div className="absolute bottom-0 w-full">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1 py-4 border-t">
            {bottomNavItems
                .filter((item) => permissions.includes(item.module))
                .map(renderLink)}
        </nav>
      </div>
    </div>
  );
}