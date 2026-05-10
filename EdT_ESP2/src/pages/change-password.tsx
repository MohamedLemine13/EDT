import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services";
import { useNavigate } from "react-router-dom";

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

const ROLE_LANDING: Record<string, string> = {
  ADMIN: "/setup",
  CHEF_DEP: "/setup",
  CHEF_HE: "/setup",
  CHEF_ST: "/setup",
  ETUDIANT: "/etudiant/emploi-du-temps",
  PROFESSEUR: "/professeur/emploi-du-temps",
};

export default function ChangePasswordPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.currentPassword.trim()) newErrors.currentPassword = "Le mot de passe actuel est requis";
    if (!formData.newPassword.trim()) newErrors.newPassword = "Le nouveau mot de passe est requis";
    else if (formData.newPassword.length < 4) newErrors.newPassword = "Min. 4 caractères";
    if (formData.newPassword !== formData.confirmPassword) {
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
      await authService.changePassword(formData.currentPassword, formData.newPassword);
      setSuccess(true);
      await refreshUser();
      // Redirect to landing page after short delay
      setTimeout(() => {
        const landing = ROLE_LANDING[user?.role || ""] || "/";
        navigate(landing, { replace: true });
      }, 1500);
    } catch (error: unknown) {
      console.error("Change password failed:", error);
      const err = error as { response?: { data?: { message?: string } } };
      setErrors({
        general: err.response?.data?.message || "Erreur lors du changement de mot de passe",
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
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mot de passe mis à jour !</h2>
          <p className="text-gray-600">Redirection en cours...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background */}
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

      {/* Form Card */}
      <Card className="relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
        <CardHeader className="space-y-6 pb-2">
          <div className="flex justify-center">
            <Logo className="h-20 w-20" />
          </div>

          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
              <KeyRound className="w-7 h-7 text-amber-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Changement de mot de passe
            </CardTitle>
            <CardDescription className="text-gray-600">
              Pour votre sécurité, veuillez changer votre mot de passe temporaire avant de continuer.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-8 px-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.general}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel (temporaire)</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className={errors.currentPassword ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.currentPassword && <p className="text-xs text-red-500">{errors.currentPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className={errors.newPassword ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
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
              className="w-full h-12 text-lg font-medium bg-esp-green-800 hover:bg-esp-green-900 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Mettre à jour le mot de passe"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
