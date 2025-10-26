import {
  Menu,
  CircleUser,
  CalendarPlus,
  UserPlus,
  FilePlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuthStore } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';
import { useUiStore } from '@/lib/uiStore';
import { GlobalSearch } from '../GlobalSearch';
export function Header() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { toggleAppointmentModal, togglePatientModal, toggleInvoiceModal } = useUiStore();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <a href="/" className="flex items-center gap-2 font-semibold">
              <div>
                <span className="text-lg font-bold">FDC OS</span>
                <p className="text-xs text-muted-foreground">Family Dental Clinic</p>
              </div>
            </a>
          </div>
          <SidebarNav />
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => toggleAppointmentModal()}>
          <CalendarPlus className="h-5 w-5" />
          <span className="sr-only">New Appointment</span>
        </Button>
        <Button variant="outline" size="icon" onClick={() => togglePatientModal()}>
          <UserPlus className="h-5 w-5" />
          <span className="sr-only">New Patient</span>
        </Button>
        <Button variant="outline" size="icon" onClick={() => toggleInvoiceModal()}>
          <FilePlus className="h-5 w-5" />
          <span className="sr-only">New Invoice</span>
        </Button>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.full_name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            Log out
            <DropdownMenuShortcut>⇧���Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}