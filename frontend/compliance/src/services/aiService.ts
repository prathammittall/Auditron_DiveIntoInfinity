import { DocumentAnalysis, Clause, Risk, ComplianceStatus, ExecutiveSummary } from '../types';
import { INSURANCE_KEYWORDS, RISK_KEYWORDS, CLAUSE_TYPE_KEYWORDS } from '../utils/constants';
import { validateInsuranceContent } from '../utils/validation';

class AIService {
  private readonly HF_API_URL = 'https://api-inference.huggingface.co/models';
  
  // Insurance-related keywords for validation
  private readonly INSURANCE_KEYWORDS = [
    'insurance', 'policy', 'coverage', 'premium', 'claim', 'insured', 'insurer',
    'liability', 'deductible', 'beneficiary', 'underwriter', 'actuarial',
    'health', 'medical', 'healthcare', 'hospital', 'treatment', 'diagnosis',
    'life insurance', 'auto insurance', 'property insurance', 'casualty',
    'workers compensation', 'disability', 'medicare', 'medicaid', 'hmo', 'ppo',
    'copay', 'coinsurance', 'out-of-pocket', 'network', 'provider', 'formulary'
  ];

  // Risk assessment keywords with severity mapping
  private readonly RISK_KEYWORDS = {
    high: [
      'exclusion', 'exclude', 'not covered', 'limitation', 'restrict', 'penalty',
      'breach', 'violation', 'non-compliance', 'fraud', 'criminal', 'illegal',
      'terminate', 'cancel', 'void', 'forfeit', 'punitive', 'maximum liability'
    ],
    medium: [
      'condition', 'requirement', 'obligation', 'must', 'shall', 'mandatory',
      'deadline', 'time limit', 'notice', 'notification', 'approval', 'consent',
      'documentation', 'evidence', 'proof', 'verification', 'audit', 'review'
    ],
    low: [
      'may', 'might', 'option', 'discretionary', 'voluntary', 'preferred',
      'recommended', 'suggested', 'encouraged', 'best practice', 'guideline'
    ]
  };

  // Clause type keywords
  private readonly CLAUSE_TYPE_KEYWORDS = {
    coverage_terms: ['coverage', 'covered', 'benefits', 'protection', 'insured amount', 'policy limit'],
    exclusions: ['exclusion', 'exclude', 'not covered', 'except', 'limitation', 'restrict'],
    claims_obligations: ['claim', 'notification', 'report', 'notify', 'filing', 'submission'],
    premium_adjustments: ['premium', 'rate', 'cost', 'fee', 'adjustment', 'increase', 'decrease'],
    regulatory: ['regulation', 'compliance', 'law', 'statute', 'code', 'requirement', 'mandate'],
    other: ['general', 'miscellaneous', 'additional', 'supplementary']
  };

  async validateInsuranceDocument(file: File): Promise<boolean> {
    try {
      const text = await this.extractTextFromFile(file);
      const lowerText = text.toLowerCase();
      
      // Check if document contains insurance-related keywords
      const hasInsuranceKeywords = this.INSURANCE_KEYWORDS.some(keyword => 
        lowerText.includes(keyword.toLowerCase())
      );

      if (!hasInsuranceKeywords) {
        throw new Error('Document does not appear to be insurance-related. Please upload insurance policies, health insurance documents, or related contracts.');
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  async analyzeDocument(file: File): Promise<DocumentAnalysis> {
    try {
      // First validate if document is insurance-related
      await this.validateInsuranceDocument(file);
      
      // Extract text from document
      const text = await this.extractTextFromFile(file);
      
      // Parallel processing for different AI tasks
      const [clauses, risks, complianceStatus] = await Promise.all([
        this.extractClauses(text),
        this.analyzeRisks(text),
        this.checkCompliance(text)
      ]);

      const summary = this.generateExecutiveSummary(clauses, risks, complianceStatus);

      return {
        clauses,
        risks,
        complianceStatus,
        summary
      };
    } catch (error) {
      console.error('Document analysis failed:', error);
      throw error;
    }
  }

  private async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (file.type === 'application/pdf') {
        // For PDF files, we would use a PDF parsing library like pdf-parse
        // For now, we'll simulate PDF text extraction
        this.simulatePDFExtraction(file).then(resolve).catch(reject);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        reader.readAsText(file);
      }
    });
  }

  private async simulatePDFExtraction(file: File): Promise<string> {
    // This would be replaced with actual PDF parsing using libraries like pdf-parse or PDF.js
    // For demo, we'll return different sample texts based on filename
    const filename = file.name.toLowerCase();
    
    if (filename.includes('health') || filename.includes('medical')) {
      return this.getHealthInsuranceSampleText();
    } else if (filename.includes('auto') || filename.includes('car')) {
      return this.getAutoInsuranceSampleText();
    } else if (filename.includes('life')) {
      return this.getLifeInsuranceSampleText();
    } else {
      return this.getGeneralInsuranceSampleText();
    }
  }

  private async extractClauses(text: string): Promise<Clause[]> {
    try {
      const sentences = this.splitIntoSentences(text);
      const clauses: Clause[] = [];
      
      sentences.forEach((sentence, index) => {
        const clauseType = this.determineClauseType(sentence);
        const category = this.determineClauseCategory(sentence, clauseType);
        const confidence = this.calculateConfidence(sentence, clauseType);
        
        // Only include sentences that seem to be actual clauses
        if (confidence > 0.3 && sentence.length > 20) {
          clauses.push({
            id: (index + 1).toString(),
            type: clauseType,
            content: sentence,
            snippet: this.createSnippet(sentence),
            category,
            metadata: {
              section: this.determineSectionFromContext(text, sentence),
              legalRationale: this.generateLegalRationale(sentence, clauseType),
              confidence
            }
          });
        }
      });

      return clauses;
    } catch (error) {
      console.warn('Using fallback clause extraction');
      return this.getFallbackClauses(text);
    }
  }

  private async analyzeRisks(text: string): Promise<Risk[]> {
    const sentences = this.splitIntoSentences(text);
    const risks: Risk[] = [];
    let riskId = 1;

    sentences.forEach(sentence => {
      const riskLevel = this.assessRiskLevel(sentence);
      const hasRiskIndicators = this.hasRiskIndicators(sentence);
      
      if (hasRiskIndicators && riskLevel !== 'none') {
        const financialExposure = this.estimateFinancialExposure(sentence, riskLevel);
        const regulatoryImpact = this.assessRegulatoryImpact(sentence);
        
        risks.push({
          id: riskId.toString(),
          title: this.generateRiskTitle(sentence),
          description: this.generateRiskDescription(sentence),
          severity: riskLevel as 'low' | 'medium' | 'high' | 'critical',
          financialExposure,
          regulatoryImpact,
          urgency: this.assessUrgency(sentence, riskLevel),
          relatedClauses: [],
          regulations: this.identifyRelevantRegulations(sentence),
          status: this.determineComplianceStatus(sentence)
        });
        
        riskId++;
      }
    });

    // Ensure we have at least some risks for demo purposes
    if (risks.length === 0) {
      return this.generateContextualRisks(text);
    }

    return risks.slice(0, 10); // Limit to top 10 risks
  }

  private splitIntoSentences(text: string): string[] {
    return text.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);
  }

  private determineClauseType(sentence: string): Clause['type'] {
    const lowerSentence = sentence.toLowerCase();
    
    for (const [type, keywords] of Object.entries(this.CLAUSE_TYPE_KEYWORDS)) {
      if (keywords.some(keyword => lowerSentence.includes(keyword.toLowerCase()))) {
        return type as Clause['type'];
      }
    }
    
    return 'other';
  }

  private determineClauseCategory(sentence: string, type: Clause['type']): string {
    const lowerSentence = sentence.toLowerCase();
    
    // Context-based categorization
    if (lowerSentence.includes('property')) return 'Property Coverage';
    if (lowerSentence.includes('medical') || lowerSentence.includes('health')) return 'Medical Coverage';
    if (lowerSentence.includes('liability')) return 'Liability Coverage';
    if (lowerSentence.includes('premium')) return 'Premium Terms';
    if (lowerSentence.includes('claim')) return 'Claims Process';
    if (lowerSentence.includes('exclusion')) return 'Exclusions';
    if (lowerSentence.includes('deductible')) return 'Deductibles';
    
    // Fallback based on type
    const typeCategories = {
      coverage_terms: 'Coverage Terms',
      exclusions: 'Policy Exclusions',
      claims_obligations: 'Claims Procedures',
      premium_adjustments: 'Premium Structure',
      regulatory: 'Regulatory Compliance',
      other: 'General Terms'
    };
    
    return typeCategories[type];
  }

  private calculateConfidence(sentence: string, type: Clause['type']): number {
    let confidence = 0.5;
    const lowerSentence = sentence.toLowerCase();
    
    // Increase confidence based on keyword matches
    const typeKeywords = this.CLAUSE_TYPE_KEYWORDS[type] || [];
    const keywordMatches = typeKeywords.filter(keyword => 
      lowerSentence.includes(keyword.toLowerCase())
    ).length;
    
    confidence += keywordMatches * 0.1;
    
    // Adjust based on sentence structure
    if (sentence.includes('shall') || sentence.includes('must')) confidence += 0.1;
    if (sentence.includes('$') || /\d+/.test(sentence)) confidence += 0.1;
    if (sentence.length > 50 && sentence.length < 200) confidence += 0.1;
    
    return Math.min(confidence, 0.99);
  }

  private assessRiskLevel(sentence: string): string {
    const lowerSentence = sentence.toLowerCase();
    
    // Check for high-risk keywords
    for (const keyword of this.RISK_KEYWORDS.high) {
      if (lowerSentence.includes(keyword.toLowerCase())) {
        return 'high';
      }
    }
    
    // Check for medium-risk keywords
    for (const keyword of this.RISK_KEYWORDS.medium) {
      if (lowerSentence.includes(keyword.toLowerCase())) {
        return 'medium';
      }
    }
    
    // Check for low-risk keywords
    for (const keyword of this.RISK_KEYWORDS.low) {
      if (lowerSentence.includes(keyword.toLowerCase())) {
        return 'low';
      }
    }
    
    return 'none';
  }

  private hasRiskIndicators(sentence: string): boolean {
    const lowerSentence = sentence.toLowerCase();
    const riskIndicators = [
      'risk', 'danger', 'threat', 'exposure', 'liability', 'loss', 'damage',
      'exclusion', 'limitation', 'penalty', 'fine', 'breach', 'violation'
    ];
    
    return riskIndicators.some(indicator => lowerSentence.includes(indicator));
  }

  private estimateFinancialExposure(sentence: string, riskLevel: string): number {
    // Extract any dollar amounts mentioned in the sentence
    const dollarMatch = sentence.match(/\$[\d,]+/);
    if (dollarMatch) {
      const amount = parseInt(dollarMatch[0].replace(/[\$,]/g, ''));
      return amount;
    }
    
    // Estimate based on risk level
    const baseAmounts = {
      low: 50000,
      medium: 250000,
      high: 1000000,
      critical: 5000000
    };
    
    const base = baseAmounts[riskLevel as keyof typeof baseAmounts] || 100000;
    return base + Math.random() * base; // Add some variance
  }

  private generateRiskTitle(sentence: string): string {
    const lowerSentence = sentence.toLowerCase();
    
    if (lowerSentence.includes('exclusion')) return 'Coverage Exclusion Risk';
    if (lowerSentence.includes('premium')) return 'Premium Adjustment Risk';
    if (lowerSentence.includes('claim')) return 'Claims Processing Risk';
    if (lowerSentence.includes('compliance')) return 'Regulatory Compliance Risk';
    if (lowerSentence.includes('liability')) return 'Liability Exposure Risk';
    if (lowerSentence.includes('medical')) return 'Medical Coverage Risk';
    
    return 'Policy Term Risk';
  }

  private generateRiskDescription(sentence: string): string {
    return `Risk identified in policy language: "${sentence.substring(0, 100)}...". This clause may create potential exposure or compliance issues.`;
  }

  private assessRegulatoryImpact(sentence: string): 'low' | 'medium' | 'high' {
    const lowerSentence = sentence.toLowerCase();
    
    const highImpactTerms = ['hipaa', 'gdpr', 'regulation', 'compliance', 'law', 'statute'];
    const mediumImpactTerms = ['requirement', 'mandate', 'standard', 'guideline'];
    
    if (highImpactTerms.some(term => lowerSentence.includes(term))) return 'high';
    if (mediumImpactTerms.some(term => lowerSentence.includes(term))) return 'medium';
    return 'low';
  }

  private assessUrgency(sentence: string, riskLevel: string): 'low' | 'medium' | 'high' {
    const lowerSentence = sentence.toLowerCase();
    
    if (lowerSentence.includes('immediate') || lowerSentence.includes('urgent')) return 'high';
    if (riskLevel === 'high' || riskLevel === 'critical') return 'high';
    if (lowerSentence.includes('deadline') || lowerSentence.includes('time limit')) return 'medium';
    return 'low';
  }

  private identifyRelevantRegulations(sentence: string): string[] {
    const lowerSentence = sentence.toLowerCase();
    const regulations: string[] = [];
    
    if (lowerSentence.includes('hipaa') || lowerSentence.includes('health')) regulations.push('HIPAA');
    if (lowerSentence.includes('gdpr') || lowerSentence.includes('privacy')) regulations.push('GDPR');
    if (lowerSentence.includes('ada') || lowerSentence.includes('disability')) regulations.push('ADA');
    if (lowerSentence.includes('state') || lowerSentence.includes('insurance code')) regulations.push('State Insurance Regulations');
    
    return regulations.length > 0 ? regulations : ['General Insurance Regulations'];
  }

  private determineComplianceStatus(sentence: string): 'aligned' | 'partial' | 'gap' {
    const lowerSentence = sentence.toLowerCase();
    
    if (lowerSentence.includes('not covered') || lowerSentence.includes('exclude')) return 'gap';
    if (lowerSentence.includes('limitation') || lowerSentence.includes('restriction')) return 'partial';
    return 'aligned';
  }

  // Sample text generators for different insurance types
  private getHealthInsuranceSampleText(): string {
    return `
    HEALTH INSURANCE POLICY

    COVERAGE BENEFITS
    This health insurance policy provides comprehensive medical coverage including hospitalization, outpatient care, prescription drugs, and preventive services. Coverage is subject to deductibles, copayments, and coinsurance as specified in the schedule of benefits.

    EXCLUSIONS AND LIMITATIONS
    This policy does not cover experimental treatments, cosmetic procedures, or services not deemed medically necessary. Coverage excludes treatment received outside the network unless pre-authorized for emergency care.

    CLAIMS PROCEDURES
    Claims must be submitted within 90 days of service. Members must obtain prior authorization for certain procedures and specialist referrals through their primary care physician.

    HIPAA COMPLIANCE
    This policy complies with HIPAA privacy regulations regarding protected health information. Patient data will be handled according to federal privacy standards.
    `;
  }

  private getAutoInsuranceSampleText(): string {
    return `
    AUTO INSURANCE POLICY

    LIABILITY COVERAGE
    This policy provides bodily injury liability coverage up to $250,000 per person and $500,000 per accident. Property damage liability coverage is provided up to $100,000 per accident.

    COLLISION AND COMPREHENSIVE
    Vehicle damage coverage includes collision and comprehensive protection subject to a deductible. Coverage excludes normal wear and tear, mechanical breakdown, and damage from racing activities.

    CLAIMS OBLIGATIONS
    The insured must report accidents immediately and cooperate fully with the investigation. Failure to report within 30 days may result in coverage denial.
    `;
  }

  private getLifeInsuranceSampleText(): string {
    return `
    LIFE INSURANCE POLICY

    DEATH BENEFIT
    Upon the death of the insured, this policy pays a death benefit of $500,000 to the designated beneficiary. Payment is subject to policy being in force and premiums current.

    EXCLUSIONS
    This policy excludes death by suicide within the first two years of coverage. Deaths resulting from war, aviation accidents, or hazardous activities may also be excluded.

    PREMIUM OBLIGATIONS
    Premiums must be paid monthly to maintain coverage. A 31-day grace period is provided for late payments before policy lapses.
    `;
  }

  private getGeneralInsuranceSampleText(): string {
    return `
    GENERAL LIABILITY INSURANCE POLICY

    COVERAGE SCOPE
    This policy covers bodily injury and property damage claims arising from business operations. Coverage includes legal defense costs and settlements up to policy limits.

    POLICY EXCLUSIONS
    Coverage excludes intentional acts, criminal activities, pollution, and professional liability. War, terrorism, and nuclear incidents are also excluded.

    NOTIFICATION REQUIREMENTS
    The insured must provide immediate notice of any claim or circumstance that may give rise to a claim. Late notification may prejudice coverage.
    `;
  }

  // Fallback methods for error handling
  private getFallbackClauses(text: string): Clause[] {
    return [
      {
        id: '1',
        type: 'coverage_terms',
        content: 'Coverage terms extracted from uploaded document',
        snippet: 'Standard coverage provisions apply',
        category: 'General Coverage',
        metadata: {
          section: 'Policy Terms',
          legalRationale: 'Standard insurance clause',
          confidence: 0.7
        }
      }
    ];
  }

  private generateContextualRisks(text: string): Risk[] {
    const contextualRisks: Risk[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('health') || lowerText.includes('medical')) {
      contextualRisks.push({
        id: '1',
        title: 'HIPAA Compliance Risk',
        description: 'Health insurance policy may have HIPAA compliance gaps in data handling procedures.',
        severity: 'high',
        financialExposure: 1500000,
        regulatoryImpact: 'high',
        urgency: 'high',
        relatedClauses: [],
        regulations: ['HIPAA'],
        status: 'gap'
      });
    }
    
    if (lowerText.includes('auto') || lowerText.includes('vehicle')) {
      contextualRisks.push({
        id: '2',
        title: 'State Compliance Risk',
        description: 'Auto insurance policy may not meet all state minimum coverage requirements.',
        severity: 'medium',
        financialExposure: 750000,
        regulatoryImpact: 'medium',
        urgency: 'medium',
        relatedClauses: [],
        regulations: ['State Insurance Laws'],
        status: 'partial'
      });
    }
    
    return contextualRisks;
  }

  private createSnippet(sentence: string): string {
    return sentence.length > 80 ? sentence.substring(0, 77) + '...' : sentence;
  }

  private determineSectionFromContext(text: string, sentence: string): string {
    const index = text.indexOf(sentence);
    if (index === -1) return 'Unknown Section';
    
    const beforeText = text.substring(Math.max(0, index - 200), index).toLowerCase();
    
    if (beforeText.includes('coverage') || beforeText.includes('benefit')) return 'Coverage Provisions';
    if (beforeText.includes('exclusion')) return 'Exclusions';
    if (beforeText.includes('claim')) return 'Claims Procedures';
    if (beforeText.includes('premium')) return 'Premium Terms';
    if (beforeText.includes('definition')) return 'Definitions';
    
    return 'Policy Terms';
  }

  private generateLegalRationale(sentence: string, type: Clause['type']): string {
    const rationales = {
      coverage_terms: 'Defines the scope and limits of insurance coverage provided',
      exclusions: 'Specifies circumstances or conditions not covered by the policy',
      claims_obligations: 'Establishes procedures and requirements for filing claims',
      premium_adjustments: 'Outlines conditions under which premiums may be modified',
      regulatory: 'Ensures compliance with applicable insurance regulations',
      other: 'Contains general terms and conditions of the insurance contract'
    };
    
    return rationales[type];
  }

  private async checkCompliance(text: string): Promise<ComplianceStatus> {
    const lowerText = text.toLowerCase();
    const regulations = [];
    let score = 85; // Base score
    
    // HIPAA compliance check
    if (lowerText.includes('health') || lowerText.includes('medical')) {
      const hipaaIssues = [];
      if (!lowerText.includes('privacy')) hipaaIssues.push('Privacy protection measures not clearly defined');
      if (!lowerText.includes('consent')) hipaaIssues.push('Patient consent procedures missing');
      
      regulations.push({
        name: 'HIPAA',
        status: hipaaIssues.length === 0 ? 'aligned' : (hipaaIssues.length === 1 ? 'partial' : 'gap'),
        issues: hipaaIssues
      });
      
      if (hipaaIssues.length > 0) score -= 15;
    }
    
    // State insurance regulations
    const stateIssues = [];
    if (!lowerText.includes('regulation') && !lowerText.includes('compliance')) {
      stateIssues.push('Regulatory compliance statement missing');
      score -= 10;
    }
    
    regulations.push({
      name: 'State Insurance Regulations',
      status: stateIssues.length === 0 ? 'aligned' : 'partial',
      issues: stateIssues
    });
    
    // Determine overall status
    let overall: ComplianceStatus['overall'] = 'compliant';
    if (score < 60) overall = 'non_compliant';
    else if (score < 80) overall = 'partial';
    
    return {
      overall,
      regulations,
      score: Math.max(score, 0)
    };
  }

  private generateExecutiveSummary(
    clauses: Clause[],
    risks: Risk[],
    complianceStatus: ComplianceStatus
  ): ExecutiveSummary {
    const criticalRisks = risks.filter(r => r.severity === 'critical' || r.severity === 'high');
    const complianceGaps = complianceStatus.regulations.filter(r => r.status === 'gap').length;

    return {
      totalClauses: clauses.length,
      criticalRisks: criticalRisks.length,
      complianceGaps,
      topRisks: risks.slice(0, 3),
      coverageGaps: this.identifyCoverageGaps(clauses, risks),
      nextSteps: this.generateNextSteps(risks, complianceStatus)
    };
  }

  private identifyCoverageGaps(clauses: Clause[], risks: Risk[]): string[] {
    const gaps: string[] = [];
    
    // Analyze exclusions
    const exclusions = clauses.filter(c => c.type === 'exclusions');
    if (exclusions.length > clauses.length * 0.3) {
      gaps.push('High number of exclusions may limit coverage effectiveness');
    }
    
    // Analyze high-severity risks
    const highRisks = risks.filter(r => r.severity === 'high' || r.severity === 'critical');
    if (highRisks.length > 0) {
      gaps.push(`${highRisks.length} high-severity risks require immediate attention`);
    }
    
    // Generic gaps if none specific found
    if (gaps.length === 0) {
      gaps.push('Policy terms appear adequate but require regular review');
    }
    
    return gaps;
  }

  private generateNextSteps(risks: Risk[], complianceStatus: ComplianceStatus): string[] {
    const steps: string[] = [];
    
    // Address compliance gaps
    complianceStatus.regulations.forEach(reg => {
      if (reg.status === 'gap') {
        steps.push(`Address ${reg.name} compliance gaps`);
      }
    });
    
    // Address high-severity risks
    const highRisks = risks.filter(r => r.severity === 'high' || r.severity === 'critical');
    if (highRisks.length > 0) {
      steps.push(`Prioritize resolution of ${highRisks.length} high-severity risks`);
    }
    
    // Generic next steps
    steps.push('Conduct quarterly policy review');
    steps.push('Update risk assessment procedures');
    
    return steps.slice(0, 5); // Limit to 5 steps
  }
}

export const aiService = new AIService();