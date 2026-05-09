import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Clock, Shield, HelpCircle, Mail, GraduationCap, Loader2, ArrowLeft } from "lucide-react";
import { authService } from "@/services";
import type { UserRole } from "@/types";

// Logo component
function Logo({ className }: { className?: string }) {
  return (
    <img 
      src="/logo.png" 
      alt="ESP Logo" 
      className={`object-contain ${className}`}
    />
  );
}

// Stat badge component
function StatBadge({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-white/80">
      <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
        <Icon className="h-4 w-4 text-esp-gold" />
      </div>
      <div>
        <p className="text-xs text-white/60">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "ADMIN" as UserRole,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis";
    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email invalide";
    if (!formData.password.trim()) newErrors.password = "Le mot de passe est requis";
    else if (formData.password.length < 4) newErrors.password = "Min. 4 caractères";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authService.register({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: unknown) {
      console.error("Register failed:", error);
      const err = error as { response?: { data?: { message?: string } } };
      setErrors({
        general: err.response?.data?.message || "Erreur lors de l'inscription",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-esp-green-900 via-esp-green-800 to-esp-green-900" />
        <Card className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Compte créé !</h2>
          <p className="text-gray-600">Redirection vers la page de connexion...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-esp-green-900 via-esp-green-800 to-esp-green-900">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="#F9FAFB" />
                <path d="M30 0 L30 60 M0 30 L60 30" stroke="#F9FAFB" strokeWidth="0.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute top-20 left-10 w-64 h-64 bg-esp-gold/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Left Panel - Welcome (Desktop only) */}
      <div className="hidden lg:flex lg:w-2/5 relative z-10 flex-col justify-between p-12">
        <div className="flex items-center gap-4">
          <Logo className="h-24 w-24" />
          <div>
            <h1 className="text-3xl font-bold text-white">EduManager</h1>
            <p className="text-lg text-white/80">École Supérieure Polytechnique</p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -top-20 -left-10 opacity-5">
            <BookOpen className="w-64 h-64 text-white" strokeWidth={1} />
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Créez votre compte<br />
            <span className="text-esp-gold">administrateur</span>
          </h2>
          <p className="text-lg text-white/80 max-w-md leading-relaxed">
            Inscrivez-vous pour configurer votre école et gérer vos emplois du temps.
          </p>
        </div>

        <div className="flex gap-8">
          <StatBadge icon={Clock} label="Disponibilité" value="24/7" />
          <StatBadge icon={Shield} label="Sécurité" value="100%" />
          <StatBadge icon={GraduationCap} label="Digital" value="100%" />
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-3/5 relative z-10 flex items-center justify-center p-4 lg:p-16">
        <Card className="w-full max-w-xl bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
          <CardHeader className="space-y-6 pb-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="p-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex justify-center">
              <Logo className="h-24 w-24" />
            </div>
            <div className="text-center space-y-3">
              <CardTitle className="text-3xl font-bold text-gray-900">
                Créer un compte
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Inscrivez-vous pour accéder à la plateforme
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-8 pb-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {errors.general}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    placeholder="Dupont"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className={errors.nom ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.nom && <p className="text-xs text-red-500">{errors.nom}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    placeholder="Jean"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className={errors.prenom ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.prenom && <p className="text-xs text-red-500">{errors.prenom}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@esp.mr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Type de compte</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrateur Principal</SelectItem>
                    <SelectItem value="CHEF_DEP">Chef de Département</SelectItem>
                    <SelectItem value="CHEF_HE">Chef de Pôle HE</SelectItem>
                    <SelectItem value="CHEF_ST">Chef de Pôle ST</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={errors.password ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-lg font-medium bg-esp-green-800 hover:bg-esp-green-900 mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer le compte"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col items-center pt-6 pb-8 space-y-4">
            <p className="text-xs text-gray-500 text-center">
              Déjà un compte ?{" "}
              <button 
                onClick={() => navigate("/login")}
                className="text-esp-green-800 hover:underline"
              >
                Connectez-vous
              </button>
            </p>
            
            <div className="flex items-center gap-4 text-xs">
              <a 
                href="#" 
                className="flex items-center gap-1 text-gray-500 hover:text-esp-green-800 transition-colors"
                onClick={(e) => { e.preventDefault(); alert('Page d\'aide à implémenter'); }}
              >
                <HelpCircle className="h-3 w-3" />
                Aide
              </a>
              <span className="text-gray-300">|</span>
              <a 
                href="#" 
                className="flex items-center gap-1 text-gray-500 hover:text-esp-green-800 transition-colors"
                onClick={(e) => { e.preventDefault(); alert('Contact support à implémenter'); }}
              >
                <Mail className="h-3 w-3" />
                Contact Support
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
