import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Clock, Shield, HelpCircle, Mail, GraduationCap, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Logo component using the actual logo image
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

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    if (!formData.password.trim()) newErrors.password = "Le mot de passe est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      // useAuth.login handles token storage + role-based redirect
      await login(formData.email, formData.password);
    } catch (error: unknown) {
      console.error("Login failed:", error);
      const err = error as { response?: { data?: { message?: string } } };
      setErrors({
        general: err.response?.data?.message || "Identifiants incorrects",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-esp-green-900 via-esp-green-800 to-esp-green-900">
        {/* Geometric pattern overlay */}
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
        {/* Blurred circles for depth */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-esp-gold/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Left Panel - Welcome (Desktop only) */}
      <div className="hidden lg:flex lg:w-2/5 relative z-10 flex-col justify-between p-12">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Logo className="h-24 w-24" />
          <div>
            <h1 className="text-3xl font-bold text-white">EduManager</h1>
            <p className="text-lg text-white/80">École Supérieure Polytechnique</p>
          </div>
        </div>

        {/* Welcome Content */}
        <div className="relative">
          {/* Giant decorative icon */}
          <div className="absolute -top-20 -left-10 opacity-5">
            <BookOpen className="w-64 h-64 text-white" strokeWidth={1} />
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Gestion académique<br />
            <span className="text-esp-gold">simplifiée</span>
          </h2>
          <p className="text-lg text-white/80 max-w-md leading-relaxed">
            Accédez à votre emploi du temps, suivez votre progression et gérez votre planning académique en temps réel.
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-8">
          <StatBadge icon={Clock} label="Disponibilité" value="24/7" />
          <StatBadge icon={Shield} label="Sécurité" value="100%" />
          <StatBadge icon={GraduationCap} label="Digital" value="100%" />
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-3/5 relative z-10 flex items-center justify-center p-4 lg:p-16">
        {/* Glassmorphism Card */}
        <Card className="w-full max-w-xl bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
          <CardHeader className="space-y-6 pb-2">
            {/* Logo */}
            <div className="flex justify-center">
              <Logo className="h-24 w-24" />
            </div>

            {/* Title and subtitle */}
            <div className="text-center space-y-3">
              <CardTitle className="text-3xl font-bold text-gray-900">
                Bienvenue sur EduManager
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Connectez-vous avec votre compte institutionnel
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
              
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-semibold text-gray-900">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@esp.mr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`h-12 text-base text-gray-900 placeholder:text-gray-500 ${errors.email ? "border-red-500" : ""}`}
                  disabled={isLoading}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-semibold text-gray-900">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`h-12 text-base text-gray-900 placeholder:text-gray-500 ${errors.password ? "border-red-500" : ""}`}
                  disabled={isLoading}
                />
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-lg font-medium bg-esp-green-800 hover:bg-esp-green-900"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
            </CardContent>

          <CardFooter className="flex flex-col items-center pt-6 pb-8 space-y-4">
            <p className="text-xs text-gray-500 text-center">
              Connectez-vous pour accéder à la configuration de l'école
            </p>
            
            {/* Help links */}
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
