import React, { useState } from 'react';
import { Download, FileText, Users, Shield, BarChart3 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DocumentAnalysis } from '../types';

interface ReportGeneratorProps {
  analysis: DocumentAnalysis[];
}

type ReportType = 'executive' | 'clause_inventory' | 'risk_assessment' | 'compliance_gap';

export default function ReportGenerator({ analysis }: ReportGeneratorProps) {
  const [selectedReports, setSelectedReports] = useState<ReportType[]>(['executive']);
  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    {
      id: 'executive' as ReportType,
      title: 'Executive Summary Report',
      description: 'High-level overview for senior management',
      icon: BarChart3,
      audience: 'Executives & Senior Management'
    },
    {
      id: 'clause_inventory' as ReportType,
      title: 'Clause Inventory Report',
      description: 'Detailed clause categorization and analysis',
      icon: FileText,
      audience: 'Legal Teams'
    },
    {
      id: 'risk_assessment' as ReportType,
      title: 'Risk Assessment Report',
      description: 'Comprehensive risk analysis and prioritization',
      icon: Shield,
      audience: 'Risk Managers'
    },
    {
      id: 'compliance_gap' as ReportType,
      title: 'Compliance Gap Analysis',
      description: 'Regulatory compliance findings and gaps',
      icon: Users,
      audience: 'Compliance Officers'
    }
  ];

  const toggleReportSelection = (reportType: ReportType) => {
    setSelectedReports(prev => 
      prev.includes(reportType)
        ? prev.filter(r => r !== reportType)
        : [...prev, reportType]
    );
  };

  const generateReports = async () => {
    setGenerating(true);
    
    try {
      for (const reportType of selectedReports) {
        await generateReport(reportType);
      }
    } catch (error) {
      console.error('Failed to generate reports:', error);
    } finally {
      setGenerating(false);
    }
  };

  const generateReport = async (reportType: ReportType) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;

    // Add header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(getReportTitle(reportType), margin, 30);

    // Add generation date
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 40);

    let yPosition = 60;

    switch (reportType) {
      case 'executive':
        yPosition = await addExecutiveSummary(pdf, yPosition, margin, pageWidth);
        break;
      case 'clause_inventory':
        yPosition = await addClauseInventory(pdf, yPosition, margin, pageWidth);
        break;
      case 'risk_assessment':
        yPosition = await addRiskAssessment(pdf, yPosition, margin, pageWidth);
        break;
      case 'compliance_gap':
        yPosition = await addComplianceGapAnalysis(pdf, yPosition, margin, pageWidth);
        break;
    }

    pdf.save(`${reportType}_report_${Date.now()}.pdf`);
  };

  const getReportTitle = (reportType: ReportType): string => {
    const titles = {
      executive: 'Executive Summary Report',
      clause_inventory: 'Clause Inventory & Categorization Report',
      risk_assessment: 'Risk Assessment & Prioritization Report',
      compliance_gap: 'Compliance Gap Analysis Report'
    };
    return titles[reportType];
  };

  const addExecutiveSummary = async (pdf: jsPDF, yPos: number, margin: number, pageWidth: number): Promise<number> => {
    if (analysis.length === 0) return yPos;

    const summary = analysis[0].summary;
    let currentY = yPos;

    // Key Metrics Section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Metrics', margin, currentY);
    currentY += 15;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const metrics = [
      `Total Clauses Analyzed: ${summary.totalClauses}`,
      `Critical Risks Identified: ${summary.criticalRisks}`,
      `Compliance Gaps Found: ${summary.complianceGaps}`
    ];

    metrics.forEach(metric => {
      pdf.text(metric, margin + 10, currentY);
      currentY += 8;
    });

    currentY += 10;

    // Top Risks Section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top Risk Priorities', margin, currentY);
    currentY += 15;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    summary.topRisks.slice(0, 3).forEach((risk, index) => {
      pdf.text(`${index + 1}. ${risk.title}`, margin + 10, currentY);
      currentY += 6;
      const description = pdf.splitTextToSize(risk.description, pageWidth - margin * 2 - 20);
      pdf.text(description, margin + 15, currentY);
      currentY += description.length * 5 + 5;
    });

    return currentY;
  };

  const addClauseInventory = async (pdf: jsPDF, yPos: number, margin: number, pageWidth: number): Promise<number> => {
    if (analysis.length === 0) return yPos;

    const clauses = analysis[0].clauses;
    let currentY = yPos;

    // Clause Summary
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Clause Analysis Summary', margin, currentY);
    currentY += 15;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');

    const clauseTypes = clauses.reduce((acc, clause) => {
      acc[clause.type] = (acc[clause.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(clauseTypes).forEach(([type, count]) => {
      pdf.text(`${type.replace('_', ' ').toUpperCase()}: ${count} clauses`, margin + 10, currentY);
      currentY += 8;
    });

    currentY += 15;

    // Detailed Clause List
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detailed Clause Inventory', margin, currentY);
    currentY += 15;

    clauses.forEach((clause, index) => {
      if (currentY > 250) {
        pdf.addPage();
        currentY = margin;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${clause.category}`, margin, currentY);
      currentY += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Type: ${clause.type.replace('_', ' ')}`, margin + 10, currentY);
      currentY += 6;
      
      const content = pdf.splitTextToSize(clause.snippet, pageWidth - margin * 2 - 20);
      pdf.text(content, margin + 10, currentY);
      currentY += content.length * 4 + 10;
    });

    return currentY;
  };

  const addRiskAssessment = async (pdf: jsPDF, yPos: number, margin: number, pageWidth: number): Promise<number> => {
    if (analysis.length === 0) return yPos;

    const risks = analysis[0].risks;
    let currentY = yPos;

    // Risk Overview
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Risk Assessment Overview', margin, currentY);
    currentY += 15;

    const riskBySeverity = risks.reduce((acc, risk) => {
      acc[risk.severity] = (acc[risk.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    Object.entries(riskBySeverity).forEach(([severity, count]) => {
      pdf.text(`${severity.toUpperCase()} Risk: ${count}`, margin + 10, currentY);
      currentY += 8;
    });

    currentY += 15;

    // Detailed Risk Analysis
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Risk Details', margin, currentY);
    currentY += 15;

    risks.forEach((risk, index) => {
      if (currentY > 200) {
        pdf.addPage();
        currentY = margin;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${risk.title}`, margin, currentY);
      currentY += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const details = [
        `Severity: ${risk.severity.toUpperCase()}`,
        `Financial Exposure: $${risk.financialExposure.toLocaleString()}`,
        `Regulatory Impact: ${risk.regulatoryImpact.toUpperCase()}`,
        `Urgency: ${risk.urgency.toUpperCase()}`,
        `Status: ${risk.status.toUpperCase()}`
      ];

      details.forEach(detail => {
        pdf.text(detail, margin + 10, currentY);
        currentY += 6;
      });

      const description = pdf.splitTextToSize(risk.description, pageWidth - margin * 2 - 20);
      pdf.text(description, margin + 10, currentY);
      currentY += description.length * 4 + 15;
    });

    return currentY;
  };

  const addComplianceGapAnalysis = async (pdf: jsPDF, yPos: number, margin: number, pageWidth: number): Promise<number> => {
    if (analysis.length === 0) return yPos;

    const complianceStatus = analysis[0].complianceStatus;
    let currentY = yPos;

    // Compliance Overview
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Compliance Status Overview', margin, currentY);
    currentY += 15;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Overall Compliance Score: ${complianceStatus.score}%`, margin + 10, currentY);
    currentY += 8;
    pdf.text(`Overall Status: ${complianceStatus.overall.replace('_', ' ').toUpperCase()}`, margin + 10, currentY);
    currentY += 20;

    // Regulatory Details
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Regulatory Compliance Details', margin, currentY);
    currentY += 15;

    complianceStatus.regulations.forEach((regulation, index) => {
      if (currentY > 230) {
        pdf.addPage();
        currentY = margin;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}. ${regulation.name}`, margin, currentY);
      currentY += 10;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Status: ${regulation.status.toUpperCase()}`, margin + 10, currentY);
      currentY += 8;

      if (regulation.issues.length > 0) {
        pdf.text('Issues Identified:', margin + 10, currentY);
        currentY += 6;
        
        regulation.issues.forEach(issue => {
          const issueText = pdf.splitTextToSize(`• ${issue}`, pageWidth - margin * 2 - 30);
          pdf.text(issueText, margin + 20, currentY);
          currentY += issueText.length * 5;
        });
      }
      
      currentY += 10;
    });

    return currentY;
  };

  const getTotalAnalysisData = () => {
    if (analysis.length === 0) return { clauses: 0, risks: 0, documents: 0 };
    
    return analysis.reduce(
      (acc, doc) => ({
        clauses: acc.clauses + doc.clauses.length,
        risks: acc.risks + doc.risks.length,
        documents: acc.documents + 1
      }),
      { clauses: 0, risks: 0, documents: 0 }
    );
  };

  const totals = getTotalAnalysisData();

  return (
    <div className="bg-stone-50 rounded-lg shadow-sm border border-stone-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-stone-900">Multi-Agent Report Generation</h3>
          <div className="text-sm text-stone-600">
            {totals.documents} documents • {totals.clauses} clauses • {totals.risks} risks analyzed
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {reportTypes.map((reportType) => {
            const Icon = reportType.icon;
            const isSelected = selectedReports.includes(reportType.id);
            
            return (
              <div
                key={reportType.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
                onClick={() => toggleReportSelection(reportType.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-amber-100' : 'bg-stone-100'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      isSelected ? 'text-amber-700' : 'text-stone-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-stone-900 mb-1">{reportType.title}</h4>
                    <p className="text-sm text-stone-600 mb-2">{reportType.description}</p>
                    <p className="text-xs text-stone-500">Target: {reportType.audience}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500'
                      : 'border-stone-300'
                  }`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-stone-600">
              {selectedReports.length} report(s) selected for generation
            </div>
            <button
              onClick={generateReports}
              disabled={selectedReports.length === 0 || generating || totals.documents === 0}
              className="flex items-center space-x-2 px-6 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Generating...' : 'Generate Reports'}</span>
            </button>
          </div>
        </div>

        {totals.documents === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              No documents have been analyzed yet. Please upload and analyze documents before generating reports.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}