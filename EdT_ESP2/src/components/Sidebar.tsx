import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  LayoutGrid,
  Clock,
  BarChart3,
  Settings,
  GraduationCap,
  UserCircle,
  Users,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const adminModules = [
  { title: "Configuration", to: "/setup", icon: Settings },
  { title: "Base de Données", to: "/bdd", icon: BookOpen },
  { title: "Utilisateurs", to: "/utilisateurs", icon: Users, adminOnly: true },
  { title: "Emploi du Temps", to: "/", icon: Clock },
  { title: "Calendrier", to: "/calendrier", icon: Calendar },
  { title: "Plan", to: "/plan", icon: LayoutGrid },
  { title: "Bilan", to: "/bilan", icon: BarChart3 },
];

const professeurModules = [
  { title: "Mon EDT", to: "/professeur/emploi-du-temps", icon: Clock },
  { title: "Mes Séances", to: "/professeur/seances", icon: Calendar },
  { title: "Volume Horaire", to: "/professeur/volume-horaire", icon: BarChart3 },
];

const etudiantModules = [
  { title: "Mon EDT", to: "/etudiant/emploi-du-temps", icon: Clock },
  { title: "Matières", to: "/etudiant/matieres", icon: BookOpen },
  { title: "Calendrier", to: "/etudiant/calendrier", icon: Calendar },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  const role = user?.role;

  // Determine which sections to show based on role
  const isAdmin = role === "ADMIN" || role === "CHEF_DEP" || role === "CHEF_HE" || role === "CHEF_ST";
  const isProfesseur = role === "PROFESSEUR";
  const isEtudiant = role === "ETUDIANT";

  // User initials and display name
  const displayName = user ? `${user.prenom} ${user.nom}` : "Utilisateur";
  const initials = user ? `${(user.prenom?.[0] || "").toUpperCase()}${(user.nom?.[0] || "").toUpperCase()}` : "?";

  return (
    <aside className="hidden lg:fixed lg:top-1 lg:bottom-1 lg:left-6 lg:flex lg:w-64 flex-col bg-card backdrop-blur-xl border border-border rounded-2xl shadow-2xl drop-shadow-2xl z-40">
      {/* Logo */}
      <div className="p-3 border-b border-border">
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-6">
        {/* Admin Menu — visible to ADMIN and chef roles */}
        {isAdmin && (
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase mb-3 px-2">
              Menu
            </p>
            <ul className="space-y-1">
              {adminModules
                .filter((m) => !(m as { adminOnly?: boolean }).adminOnly || role === "ADMIN")
                .map(({ title, to, icon: Icon }) => {
                const active = isActive(to);
                return (
                  <li key={to}>
                    <Link
                      to={to}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-base ${
                        active
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Vue Professeur — visible to PROFESSEUR and chef roles */}
        {isProfesseur && (
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase mb-3 px-2 flex items-center gap-2">
              <UserCircle className="w-4 h-4" />
              {isAdmin ? "Vue Professeur" : "Mon Espace"}
            </p>
            <ul className="space-y-1">
              {professeurModules.map(({ title, to, icon: Icon }) => {
                const active = isActive(to);
                return (
                  <li key={to}>
                    <Link
                      to={to}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition text-base ${
                        active
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Vue Étudiant — visible to ETUDIANT only */}
        {isEtudiant && (
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase mb-3 px-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Mon Espace
            </p>
            <ul className="space-y-1">
              {etudiantModules.map(({ title, to, icon: Icon }) => {
                const active = isActive(to);
                return (
                  <li key={to}>
                    <Link
                      to={to}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition text-base ${
                        active
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* User footer with working logout */}
      <div className="p-2 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{displayName}</p>
            {role && <p className="text-xs text-muted-foreground">{role}</p>}
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors relative z-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-destructive/50"
            title="Déconnexion"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
