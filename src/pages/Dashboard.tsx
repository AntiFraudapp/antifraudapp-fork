import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { analyzeFraud, submitReport } from '../lib/fraud-api';
import { CircleAlert as AlertCircle, CircleCheck as CheckCircle, Shield, LogOut } from 'lucide-react';

export default function Dashboard() {
  const [targetType, setTargetType] = useState<'email' | 'phone' | 'link' | 'crypto'>('email');
  const [target, setTarget] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const analysisResult = await analyzeFraud({
        targetType,
        target,
        description,
      });
      setResult(analysisResult);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    if (!result) return;
    setLoading(true);

    try {
      await submitReport(targetType, target, description, result.riskScore);
      setError('');
      alert('Denúncia enviada com sucesso');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const getRiskColor = (level: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-50 border-green-200 text-green-700',
      medium: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      high: 'bg-orange-50 border-orange-200 text-orange-700',
      critical: 'bg-red-50 border-red-200 text-red-700',
    };
    return colors[level] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">AntiFraudApp</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Análise de Fraude</h2>
              <form onSubmit={handleAnalyze} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Telefone</option>
                    <option value="link">Link</option>
                    <option value="crypto">Criptomoeda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alvo</label>
                  <input
                    type="text"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder={`Insira o ${targetType}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva a situação..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Analisando...' : 'Analisar'}
                </button>
              </form>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Resultado da Análise</h2>

                <div className={`p-6 border-2 rounded-lg mb-6 ${getRiskColor(result.riskLevel)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold mb-2">Nível de Risco</p>
                      <p className="text-3xl font-bold">{result.riskLevel.toUpperCase()}</p>
                      <p className="text-sm mt-2">Pontuação: {result.riskScore}/100</p>
                    </div>
                    {result.riskLevel === 'low' && <CheckCircle className="w-12 h-12 opacity-50" />}
                    {result.riskLevel !== 'low' && <AlertCircle className="w-12 h-12 opacity-50" />}
                  </div>
                </div>

                {result.flags && result.flags.length > 0 && (
                  <div className="mb-6">
                    <p className="font-semibold mb-2">Alertas Detectados</p>
                    <ul className="space-y-2">
                      {result.flags.map((flag: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-700">
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.riskLevel !== 'low' && (
                  <button
                    onClick={handleReport}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Enviando...' : 'Denunciar Fraude'}
                  </button>
                )}
              </div>
            )}

            {!result && !error && (
              <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                <Shield className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Insira informações para análise</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
