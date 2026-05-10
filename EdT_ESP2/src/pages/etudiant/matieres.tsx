import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, BookOpen, GraduationCap, Clock, Hash, Award, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { matiereService } from "@/services";
import type { MatiereDto } from "@/types";

export default function EtudiantMatieres() {
  const { user } = useAuth();
  const [matieres, setMatieres] = useState<MatiereDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMatiere, setSelectedMatiere] = useState<MatiereDto | null>(null);

  // Fetch matieres from API (for student's department)
  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetcher = user?.departementId
      ? matiereService.getByDepartement(user.departementId)
      : matiereService.getAll();

    fetcher
      .then((data) => setMatieres(data))
      .catch((err) => {
        console.error("Matieres fetch error:", err);
        setError("Impossible de charger les matières");
      })
      .finally(() => setLoading(false));
  }, [user?.departementId]);

  // Filter
  const filteredMatieres = useMemo(() => {
    return matieres.filter((matiere) => {
      const matchesSearch =
        searchQuery === "" ||
        matiere.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        matiere.intitule.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [matieres, searchQuery]);

  // Totals
  const totalCredits = useMemo(() => matieres.reduce((acc, m) => acc + (m.credits || 0), 0), [matieres]);
  const totalHours = useMemo(() => matieres.reduce((acc, m) => acc + (m.hCm || 0) + (m.hTd || 0) + (m.hTp || 0), 0), [matieres]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Référentiel matières</h1>
          <p className="text-muted-foreground mt-1">
            {user?.prenom} {user?.nom} • {matieres.length} matières
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{matieres.length}</p>
              <p className="text-xs text-muted-foreground">Matières</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Hash className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCredits}</p>
              <p className="text-xs text-muted-foreground">Crédits totaux</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalHours}h</p>
              <p className="text-xs text-muted-foreground">Volume total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par code ou intitulé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Chargement...</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Liste des matières ({filteredMatieres.length})
            </CardTitle>
            <CardDescription>
              Cliquez sur une matière pour voir les détails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Intitulé</TableHead>
                  <TableHead>Crédits</TableHead>
                  <TableHead>Volume horaire</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMatieres.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Aucune matière ne correspond aux critères
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMatieres.map((matiere) => (
                    <TableRow
                      key={matiere.code}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedMatiere(matiere)}
                    >
                      <TableCell className="font-mono font-medium">{matiere.code}</TableCell>
                      <TableCell className="font-medium">{matiere.intitule}</TableCell>
                      <TableCell>{matiere.credits || "-"}</TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          CM: {matiere.hCm}h • TD: {matiere.hTd}h • TP: {matiere.hTp}h
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog détail matière */}
      <Dialog open={!!selectedMatiere} onOpenChange={() => setSelectedMatiere(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {selectedMatiere?.code}
            </DialogTitle>
            <DialogDescription>{selectedMatiere?.intitule}</DialogDescription>
          </DialogHeader>

          {selectedMatiere && (
            <div className="space-y-6 py-4">
              {/* Crédits */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-muted p-3 rounded-lg text-center">
                  <Award className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-bold">{selectedMatiere.credits || "-"}</p>
                  <p className="text-xs text-muted-foreground">Crédits</p>
                </div>
              </div>

              {/* Volume horaire */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Volume horaire
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded text-center">
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{selectedMatiere.hCm}h</p>
                    <p className="text-xs text-muted-foreground">CM</p>
                  </div>
                  <div className="bg-teal-50 dark:bg-teal-900/20 p-2 rounded text-center">
                    <p className="text-lg font-bold text-teal-600 dark:text-teal-400">{selectedMatiere.hTd}h</p>
                    <p className="text-xs text-muted-foreground">TD</p>
                  </div>
                  <div className="bg-cyan-50 dark:bg-cyan-900/20 p-2 rounded text-center">
                    <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{selectedMatiere.hTp}h</p>
                    <p className="text-xs text-muted-foreground">TP</p>
                  </div>
                </div>
                <div className="bg-muted p-2 rounded text-center">
                  <p className="font-medium">
                    Total: {(selectedMatiere.hCm || 0) + (selectedMatiere.hTd || 0) + (selectedMatiere.hTp || 0)}h
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button variant="outline" onClick={() => setSelectedMatiere(null)} className="w-full">
            <X className="w-4 h-4 mr-2" />
            Fermer
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
