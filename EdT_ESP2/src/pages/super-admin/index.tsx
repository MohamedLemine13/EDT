import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Users, GraduationCap, Plus, Loader2, AlertCircle } from "lucide-react";
import { superAdminService } from "@/services/superAdminService";
import type { SchoolWithAdminDto } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function SuperAdminDashboard() {
  const [schools, setSchools] = useState<SchoolWithAdminDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form State
  const [ecoleId, setEcoleId] = useState("");
  const [ecoleNom, setEcoleNom] = useState("");
  const [ecoleDomaine, setEcoleDomaine] = useState("");
  const [ecoleSlug, setEcoleSlug] = useState("");
  const [adminNom, setAdminNom] = useState("");
  const [adminPrenom, setAdminPrenom] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const fetchSchools = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await superAdminService.listSchools();
      setSchools(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement des écoles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await superAdminService.createSchool({
        ecole: {
          id: ecoleId,
          nom: ecoleNom,
          domaine: ecoleDomaine,
          slug: ecoleSlug,
        },
        admin: {
          nom: adminNom,
          prenom: adminPrenom,
          email: adminEmail,
          password: adminPassword,
        },
      });
      setIsCreateOpen(false);
      
      // Reset form
      setEcoleId(""); setEcoleNom(""); setEcoleDomaine(""); setEcoleSlug("");
      setAdminNom(""); setAdminPrenom(""); setAdminEmail(""); setAdminPassword("");
      
      fetchSchools();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la création de l'école");
    } finally {
      setCreating(false);
    }
  };

  const totalAdmins = schools.filter((s) => s.admin).length;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
          <p className="text-muted-foreground">
            Bienvenue dans l'espace d'administration globale. Gérez les écoles et leurs administrateurs.
          </p>
        </div>
        <div className="flex items-end justify-end">
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Créer une école
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-xl">
              <Building className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Écoles Actives</p>
              <h3 className="text-3xl font-bold text-foreground">{schools.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-blue-500/10 rounded-xl">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Administrateurs</p>
              <h3 className="text-3xl font-bold text-foreground">{totalAdmins}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && !isCreateOpen && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Schools List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Écoles Gérées</h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : schools.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Building className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Aucune école</h3>
              <p className="text-muted-foreground max-w-sm mb-4">
                Vous n'avez pas encore créé d'école. Commencez par créer la première école et son administrateur.
              </p>
              <Button onClick={() => setIsCreateOpen(true)} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Créer la première école
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {schools.map((school) => (
              <Card key={school.ecole.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="bg-muted/30 border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-primary" />
                        {school.ecole.nom}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        ID: <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{school.ecole.id}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4 text-sm">
                  <div className="space-y-2">
                    <p className="text-muted-foreground flex items-center justify-between">
                      <span>Domaine</span>
                      <span className="font-medium text-foreground">{school.ecole.domaine || "—"}</span>
                    </p>
                    <p className="text-muted-foreground flex items-center justify-between">
                      <span>Slug</span>
                      <span className="font-medium text-foreground">{school.ecole.slug}</span>
                    </p>
                    <p className="text-muted-foreground flex items-center justify-between">
                      <span>Départements</span>
                      <span className="font-medium text-foreground">{school.departementCount}</span>
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">Administrateur</h4>
                    {school.admin ? (
                      <div>
                        <p className="font-medium text-foreground">{school.admin.prenom} {school.admin.nom}</p>
                        <p className="text-muted-foreground truncate">{school.admin.email}</p>
                        {school.admin.mustChangePassword && (
                          <span className="inline-block mt-2 text-[10px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            Mot de passe temporaire
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-red-500 italic">Aucun administrateur</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle école</DialogTitle>
            <DialogDescription>
              Cette action créera une nouvelle école ainsi que son compte administrateur initial.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateSubmit} className="space-y-6 mt-4">
            {error && isCreateOpen && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              {/* Ecole Fields */}
              <div className="space-y-4">
                <h3 className="font-semibold border-b pb-2">Informations de l'École</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ID (Code unique)</label>
                  <input type="text" required value={ecoleId} onChange={(e) => setEcoleId(e.target.value)} placeholder="Ex: ESP" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom de l'école</label>
                  <input type="text" required value={ecoleNom} onChange={(e) => setEcoleNom(e.target.value)} placeholder="Ex: École Supérieure Polytechnique" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Domaine web</label>
                  <input type="text" value={ecoleDomaine} onChange={(e) => setEcoleDomaine(e.target.value)} placeholder="Ex: esp.mr" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug (URL)</label>
                  <input type="text" required value={ecoleSlug} onChange={(e) => setEcoleSlug(e.target.value)} placeholder="Ex: esp" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
              </div>

              {/* Admin Fields */}
              <div className="space-y-4">
                <h3 className="font-semibold border-b pb-2">Compte Administrateur</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prénom</label>
                  <input type="text" required value={adminPrenom} onChange={(e) => setAdminPrenom(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom</label>
                  <input type="text" required value={adminNom} onChange={(e) => setAdminNom(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input type="email" required value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mot de passe temporaire</label>
                  <input type="text" required value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Ex: AdminESP2024!" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <p className="text-xs text-muted-foreground">L'administrateur devra changer ce mot de passe à sa première connexion.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer l'école et l'administrateur
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
