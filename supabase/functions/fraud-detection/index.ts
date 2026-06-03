import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisRequest {
  targetType: string;
  target: string;
  description?: string;
}

interface AnalysisResult {
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  flags: string[];
  timestamp: string;
}

function analyzeEmail(email: string, description?: string): AnalysisResult {
  const flags: string[] = [];
  let score = 10;

  if (!email.includes("@")) {
    flags.push("Email inválido");
    score += 30;
  }

  if (email.includes("+")) {
    flags.push("Email com alias detectado");
    score += 15;
  }

  if (description?.toLowerCase().includes("phishing")) {
    flags.push("Possível phishing");
    score += 40;
  }

  if (description?.toLowerCase().includes("scam")) {
    flags.push("Possível scam");
    score += 50;
  }

  const suspiciousDomains = ["temp-mail", "guerrillamail", "mailinator"];
  if (suspiciousDomains.some((d) => email.toLowerCase().includes(d))) {
    flags.push("Domínio temporário detectado");
    score += 35;
  }

  return {
    riskScore: Math.min(score, 99),
    riskLevel: score < 30 ? "low" : score < 60 ? "medium" : score < 80 ? "high" : "critical",
    flags,
    timestamp: new Date().toISOString(),
  };
}

function analyzePhone(phone: string, description?: string): AnalysisResult {
  const flags: string[] = [];
  let score = 10;

  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length < 9 || cleanPhone.length > 15) {
    flags.push("Número de telefone com comprimento inválido");
    score += 25;
  }

  if (description?.toLowerCase().includes("spam")) {
    flags.push("Possível spam");
    score += 30;
  }

  if (description?.toLowerCase().includes("extorsão")) {
    flags.push("Possível extorsão");
    score += 50;
  }

  if (description?.toLowerCase().includes("vishing")) {
    flags.push("Possível vishing");
    score += 45;
  }

  return {
    riskScore: Math.min(score, 99),
    riskLevel: score < 30 ? "low" : score < 60 ? "medium" : score < 80 ? "high" : "critical",
    flags,
    timestamp: new Date().toISOString(),
  };
}

function analyzeLink(link: string, description?: string): AnalysisResult {
  const flags: string[] = [];
  let score = 15;

  if (
    !link.startsWith("http://") &&
    !link.startsWith("https://") &&
    !link.startsWith("ftp://")
  ) {
    flags.push("Protocolo não reconhecido");
    score += 30;
  }

  if (link.includes("@")) {
    flags.push("Possível URL disfarçada");
    score += 40;
  }

  if (link.includes("bit.ly") || link.includes("tinyurl") || link.includes("short.link")) {
    flags.push("URL encurtada detectada");
    score += 20;
  }

  if (description?.toLowerCase().includes("malware")) {
    flags.push("Possível malware");
    score += 50;
  }

  if (description?.toLowerCase().includes("phishing")) {
    flags.push("Possível phishing");
    score += 45;
  }

  const suspiciousKeywords = ["verify", "confirm", "urgent", "click-here", "update-now"];
  if (suspiciousKeywords.some((k) => link.toLowerCase().includes(k))) {
    flags.push("Palavras-chave suspeitas na URL");
    score += 25;
  }

  return {
    riskScore: Math.min(score, 99),
    riskLevel: score < 30 ? "low" : score < 60 ? "medium" : score < 80 ? "high" : "critical",
    flags,
    timestamp: new Date().toISOString(),
  };
}

function analyzeCrypto(address: string, description?: string): AnalysisResult {
  const flags: string[] = [];
  let score = 20;

  // Bitcoin address validation
  if (address.startsWith("1") || address.startsWith("3") || address.startsWith("bc1")) {
    // Valid Bitcoin format
  } else if (address.startsWith("0x") && address.length === 42) {
    // Valid Ethereum format
  } else {
    flags.push("Endereço de criptomoeda inválido");
    score += 40;
  }

  if (description?.toLowerCase().includes("rug pull")) {
    flags.push("Possível rug pull");
    score += 60;
  }

  if (description?.toLowerCase().includes("ponzi")) {
    flags.push("Possível esquema Ponzi");
    score += 55;
  }

  if (description?.toLowerCase().includes("pump and dump")) {
    flags.push("Possível pump and dump");
    score += 50;
  }

  if (description?.toLowerCase().includes("fake")) {
    flags.push("Endereço falso suspeito");
    score += 45;
  }

  return {
    riskScore: Math.min(score, 99),
    riskLevel: score < 30 ? "low" : score < 60 ? "medium" : score < 80 ? "high" : "critical",
    flags,
    timestamp: new Date().toISOString(),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: AnalysisRequest = await req.json();
    const { targetType, target, description } = body;

    let result: AnalysisResult;

    switch (targetType) {
      case "email":
        result = analyzeEmail(target, description);
        break;
      case "phone":
        result = analyzePhone(target, description);
        break;
      case "link":
        result = analyzeLink(target, description);
        break;
      case "crypto":
        result = analyzeCrypto(target, description);
        break;
      default:
        throw new Error("Tipo de alvo não suportado");
    }

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
