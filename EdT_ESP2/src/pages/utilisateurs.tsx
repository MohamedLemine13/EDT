import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Trash2, Loader2, Users, ShieldCheck, AlertTriangle } from "lucide-react";
import userService from "@/services/userService";
import departementService from "@/services/departementService";
import professeurService from "@/services/professeurService";
import type { CreateUserRequest } from "@/services/userService";
import type { UserDto, UserRole } from "@/types";

interface Departement {
  id: number;
  code: string;
  nom: string;
}

interface Professeur {
  id: number;
  nom: string;
  prenom: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  ETUDIANT: "Étudiant",
  PROFESSEUR: "Professeur",
  CHEF_DEP: "Chef de Département",
  CHEF_HE: "Chef Pôle HE",
  CHEF_ST: "Chef Pôle ST",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-800",
  ETUDIANT: "bg-blue-100 text-blue-800",
  PROFESSEUR: "bg-green-100 text-green-800",
  CHEF_DEP: "bg-orange-100 text-orange-800",
  CHEF_HE: "bg-yellow-100 text-yellow-800",
  CHEF_ST: "bg-teal-100 text-teal-800",
};

export default function UtilisateursPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<CreateUserRequest>({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    role: "ETUDIANT",
  });

  const needsDepartement = form.role === "ETUDIANT" || form.role === "CHEF_DEP";
  const needsProfesseur = form.role === "PROFESSEUR" || form.role === "CHEF_DEP" || form.role === "CHEF_HE" || form.role === "CHEF_ST";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [u, d, p] = await Promise.all([
        userService.list(),
        departementService.getAll().catch(() => []),
        professeurService.getAll().catch(() => []),
      ]);
      setUsers(Array.isArray(u) ? u : []);
      setDepartements(Array.isArray(d) ? d : []);
      setProfesseurs(Array.isArray(p) ? p : []);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Erreur lors du chargement des données.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    setError(null);
    if (!form.nom || !form.prenom || !form.email || !form.password) {
      setError("Tous les champs sont requis.");
      return;
    }
    if (needsDepartement && !form.departementId) {
      setError("Le département est requis pour ce rôle.");
      return;
    }

    setCreating(true);
    try {
      await userService.create(form);
      setSuccess(`Compte créé pour ${form.prenom} ${form.nom}`);
      setForm({ nom: "", prenom: "", email: "", password: "", role: "ETUDIANT" });
      setShowCreate(false);
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Erreur lors de la création.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    setDeleting(id);
    try {
      await userService.delete(id);
      setSuccess("Utilisateur supprimé.");
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || "Erreur lors de la suppression.");
    } finally {
      setDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-esp-green-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {users?.length || 0} utilisateur{(users?.length || 0) !== 1 ? "s" : ""} enregistré{(users?.length || 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-esp-green-800 hover:bg-esp-green-900"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Créer un utilisateur
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <Card className="border-esp-green-200 dark:border-esp-green-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Nouveau compte utilisateur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  placeholder="Dupont"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input
                  placeholder="Jean"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="jean.dupont@esp.mr"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Mot de passe temporaire</Label>
                <Input
                  type="text"
                  placeholder="temp1234"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Rôle</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm({ ...form, role: v as UserRole, departementId: undefined, professeurId: undefined })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {needsDepartement && (
                <div className="space-y-2">
                  <Label>Département</Label>
                  <Select
                    value={form.departementId?.toString() || ""}
                    onValueChange={(v) => setForm({ ...form, departementId: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      {departements.map((d) => (
                        <SelectItem key={d.id} value={d.id.toString()}>
                          {d.code} — {d.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {needsProfesseur && (
                <div className="space-y-2">
                  <Label>Profil professeur</Label>
                  <Select
                    value={form.professeurId?.toString() || ""}
                    onValueChange={(v) => setForm({ ...form, professeurId: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Optionnel..." />
                    </SelectTrigger>
                    <SelectContent>
                      {professeurs.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.prenom} {p.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
              ⚠️ L'utilisateur devra changer son mot de passe lors de sa première connexion.
            </p>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleCreate} disabled={creating} className="bg-esp-green-800 hover:bg-esp-green-900">
                {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                Créer le compte
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-800">
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Nom</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Rôle</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.filter(Boolean).map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {u.prenom} {u.nom}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${ROLE_COLORS[u.role] || "bg-gray-100 text-gray-800"} border-0`}>
                        {ROLE_LABELS[u.role] || u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {u.mustChangePassword ? (
                        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                          🔑 Mot de passe temporaire
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                          ✓ Actif
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(u.id)}
                        disabled={deleting === u.id}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        {deleting === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
                {(!users || users.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
