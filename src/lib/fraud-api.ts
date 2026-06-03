import { supabase } from './supabase';

export interface FraudAnalysisRequest {
  targetType: 'email' | 'phone' | 'link' | 'crypto' | 'message';
  target: string;
  description?: string;
}

export interface FraudAnalysisResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  timestamp: string;
}

export async function analyzeFraud(request: FraudAnalysisRequest): Promise<FraudAnalysisResult> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/fraud-detection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Análise de fraude falhou');
    }

    return await response.json();
  } catch (error) {
    console.error('Fraud analysis error:', error);
    throw error;
  }
}

export async function submitReport(
  targetType: string,
  target: string,
  description: string,
  riskScore: number,
  location?: { lat: number; lon: number; country: string; city: string }
) {
  const { error } = await supabase.from('fraud_reports').insert([
    {
      target_type: targetType,
      target,
      description,
      risk_score: riskScore,
      country: location?.country || 'Unknown',
      city: location?.city || 'Unknown',
      lat: location?.lat || 0,
      lon: location?.lon || 0,
    },
  ]);

  if (error) {
    console.error('Report submission error:', error);
    throw error;
  }
}
