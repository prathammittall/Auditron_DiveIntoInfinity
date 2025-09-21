export interface Document {
  id: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'EMAIL';
  size: number;
  uploadedAt: Date;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  analysis?: DocumentAnalysis;
  validationError?: string; // New field for validation errors
}

export interface DocumentAnalysis {
  clauses: Clause[];
  risks: Risk[];
  complianceStatus: ComplianceStatus;
  summary: ExecutiveSummary;
  documentType?: InsuranceDocumentType; // New field to identify document type
}

export interface Clause {
  id: string;
  type: 'coverage_terms' | 'exclusions' | 'claims_obligations' | 'premium_adjustments' | 'regulatory' | 'other';
  content: string;
  snippet: string;
  category: string;
  metadata: {
    page?: number;
    section?: string;
    legalRationale: string;
    confidence: number;
    riskLevel?: 'low' | 'medium' | 'high'; // New field for clause-level risk
    keywordMatches?: string[]; // New field to track matched keywords
  };
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  financialExposure: number;
  regulatoryImpact: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  relatedClauses: string[];
  regulations: string[];
  status: 'aligned' | 'partial' | 'gap';
  detectedKeywords?: string[]; // New field to show which keywords triggered this risk
  sourceText?: string; // New field to store the original text that generated this risk
}

export interface ComplianceStatus {
  overall: 'compliant' | 'partial' | 'non_compliant';
  regulations: {
    name: string;
    status: 'aligned' | 'partial' | 'gap';
    issues: string[];
    applicabilityScore?: number; // New field - how applicable this regulation is to the document
  }[];
  score: number;
  documentSpecificChecks?: { // New field for document-type specific compliance
    [key: string]: boolean;
  };
}

export interface ExecutiveSummary {
  totalClauses: number;
  criticalRisks: number;
  complianceGaps: number;
  topRisks: Risk[];
  coverageGaps: string[];
  nextSteps: string[];
  documentInsights?: DocumentInsights; // New field for document-specific insights
}

export interface AIModelConfig {
  endpoint: string;
  model: string;
  apiKey?: string;
}

// New interfaces for enhanced functionality

export interface InsuranceDocumentType {
  category: 'health' | 'auto' | 'life' | 'property' | 'liability' | 'general';
  confidence: number;
  detectedFeatures: string[];
}

export interface DocumentInsights {
  documentType: InsuranceDocumentType;
  keyFindings: string[];
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  complianceHighlights: string[];
  recommendedActions: string[];
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  confidence: number;
  detectedKeywords: string[];
  documentType?: InsuranceDocumentType;
}

export interface RiskKeywordMapping {
  keyword: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  weight: number;
}

export interface ClauseTypeMapping {
  keywords: string[];
  type: Clause['type'];
  category: string;
  weight: number;
}

// Configuration interfaces for dynamic analysis
export interface AnalysisConfig {
  riskThreshold: number; // Minimum confidence to include a risk
  clauseThreshold: number; // Minimum confidence to include a clause
  maxRisks: number; // Maximum number of risks to return
  maxClauses: number; // Maximum number of clauses to return
  enableContextAnalysis: boolean; // Whether to perform deep context analysis
  customKeywords?: {
    insurance: string[];
    risk: string[];
    compliance: string[];
  };
}

// Export default analysis configuration
export const DEFAULT_ANALYSIS_CONFIG: AnalysisConfig = {
  riskThreshold: 0.3,
  clauseThreshold: 0.3,
  maxRisks: 20,
  maxClauses: 50,
  enableContextAnalysis: true
};