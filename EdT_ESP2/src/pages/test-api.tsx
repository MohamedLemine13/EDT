import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService, ecoleService } from "@/services";
import { API_BASE_URL } from "@/services/api";

export default function TestApiPage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Test 1: Connexion backend (ping)
  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/actuator/health`);
      const data = await response.json();
      addResult(`✅ Backend OK: ${JSON.stringify(data)}`);
    } catch (error) {
      addResult(`❌ Backend inaccessible: ${error}`);
      addResult(`💡 Vérifie que Spring Boot tourne sur ${API_BASE_URL}`);
    }
    setLoading(false);
  };

  const [counter, setCounter] = useState(0);
  const [lastRegisteredEmail, setLastRegisteredEmail] = useState("test0@esp.mr");
  const [loginData, setLoginData] = useState({ email: "test0@esp.mr", password: "password123" });

  // Test 2: Register (endpoint public)
  const testRegister = async () => {
    setLoading(true);
    try {
      const randomEmail = `test${counter}@esp.mr`;
      setCounter(c => c + 1);
      const user = await authService.register({
        email: randomEmail,
        password: "password123",
        role: "ADMIN",
        nom: "Test",
        prenom: "User",
      });
      setLastRegisteredEmail(user.email);
      setLoginData({ ...loginData, email: user.email });
      addResult(`✅ Register OK: ${user.email} (ID: ${user.id})`);
      addResult(`💡 Utilise cet email pour le login`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      addResult(`❌ Register échoué: ${err.response?.data?.message || err.message || 'Erreur inconnue'}`);
    }
    setLoading(false);
  };

  // Test 3: Login (endpoint public)
  const testLogin = async () => {
    setLoading(true);
    try {
      const auth = await authService.login(loginData);
      addResult(`✅ Login OK: Token reçu (${auth.token.substring(0, 20)}...)`);
      addResult(`💡 Token stocké dans localStorage`);
      addResult(`💡 Essaye maintenant les endpoints protégés`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      addResult(`❌ Login échoué: ${err.response?.data?.message || err.message || 'Erreur inconnue'}`);
      addResult(`💡 Crée d'abord un utilisateur avec testRegister, ou vérifie email/password`);
    }
    setLoading(false);
  };

  // Test 4: Liste écoles (nécessite auth - va échouer sans token)
  const testEcolesProtected = async () => {
    setLoading(true);
    try {
      const ecoles = await ecoleService.getAll();
      addResult(`✅ Ecoles récupérées: ${ecoles.length} écoles`);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
      addResult(`❌ Ecoles échoué: ${err.response?.status === 401 ? "401 - Non authentifié (normal)" : err.response?.data?.message || err.message || 'Erreur inconnue'}`);
    }
    setLoading(false);
  };

  // Test 5: Créer école (nécessite auth)
  const [ecoleData, setEcoleData] = useState({ id: "E01", nom: "ESI", domaine: "Informatique", slug: "esi" });
  
  const testCreateEcole = async () => {
    setLoading(true);
    try {
      const ecole = await ecoleService.create(ecoleData);
      addResult(`✅ Ecole créée: ${ecole.nom} (${ecole.id})`);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
      addResult(`❌ Création école: ${err.response?.status === 401 ? "401 - Non authentifié" : err.response?.data?.message || err.message || 'Erreur inconnue'}`);
    }
    setLoading(false);
  };

  const addResult = (msg: string) => {
    setResults((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const clearResults = () => setResults([]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Test Connexion API Spring Boot</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Ping Backend</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testConnection} disabled={loading} className="w-full">
              Tester connexion
            </Button>
            <p className="text-xs text-gray-500 mt-2">Vérifie que Spring Boot répond</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Register (Public)</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testRegister} disabled={loading} className="w-full">
              Créer utilisateur test
            </Button>
            <p className="text-xs text-gray-500 mt-2">POST /api/auth/register</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Login (Public)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input 
              placeholder="Email" 
              value={loginData.email} 
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
            />
            <Input 
              type="password"
              placeholder="Password" 
              value={loginData.password} 
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
            />
            <Button onClick={testLogin} disabled={loading} className="w-full">
              Se connecter
            </Button>
            <p className="text-xs text-gray-500">Dernier email créé: {lastRegisteredEmail}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Ecoles (Protégé)</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testEcolesProtected} disabled={loading} variant="outline" className="w-full">
              Tester GET /api/ecoles
            </Button>
            <p className="text-xs text-gray-500 mt-2">Doit échouer sans token (401)</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>5. Créer École (Protégé)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              <div>
                <Label>ID</Label>
                <Input value={ecoleData.id} onChange={(e) => setEcoleData({...ecoleData, id: e.target.value})} />
              </div>
              <div>
                <Label>Nom</Label>
                <Input value={ecoleData.nom} onChange={(e) => setEcoleData({...ecoleData, nom: e.target.value})} />
              </div>
              <div>
                <Label>Domaine</Label>
                <Input value={ecoleData.domaine} onChange={(e) => setEcoleData({...ecoleData, domaine: e.target.value})} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={ecoleData.slug} onChange={(e) => setEcoleData({...ecoleData, slug: e.target.value})} />
              </div>
            </div>
            <Button onClick={testCreateEcole} disabled={loading} className="w-full">
              POST /api/ecoles
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold">📋 Résultats:</h2>
        <Button variant="ghost" size="sm" onClick={clearResults}>Effacer</Button>
      </div>
      
      <div className="bg-gray-900 text-green-400 font-mono p-4 rounded-lg min-h-[200px] max-h-[400px] overflow-y-auto">
        {results.length === 0 ? (
          <p className="text-gray-500">Clique sur un bouton pour lancer un test...</p>
        ) : (
          results.map((r, i) => (
            <div key={i} className="mb-1 text-sm">{r}</div>
          ))
        )}
      </div>
    </div>
  );
}
