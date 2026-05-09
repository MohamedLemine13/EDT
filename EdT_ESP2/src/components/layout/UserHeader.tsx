import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { authService } from "@/services";
import type { UserDto } from "@/types";

export default function UserHeader() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.me();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        // Ne pas rediriger, juste ne pas afficher l'utilisateur
        // Le bouton "Se connecter" s'affichera automatiquement
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        <div className="w-24 h-4 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 px-4 py-2">
        <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
          Se connecter
        </Button>
      </div>
    );
  }

  const initials = `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase();

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-medium text-gray-900">
          {user.prenom} {user.nom}
        </p>
        <p className="text-xs text-gray-500 uppercase">{user.role}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
            <div className="h-10 w-10 rounded-full bg-esp-green-800 flex items-center justify-center text-white font-semibold">
              {initials}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center gap-2 p-2 sm:hidden">
            <div>
              <p className="text-sm font-medium">{user.prenom} {user.nom}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="hidden sm:block p-2 border-b">
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
