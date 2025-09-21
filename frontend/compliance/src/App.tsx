import React, { useState, useEffect } from 'react';
import { Shield, Brain, FileText, BarChart3, Download, Sparkles, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import DocumentUpload from './components/DocumentUpload';
import ClauseInventory from './components/ClauseInventory';
import RiskAnalysis from './components/RiskAnalysis';
import ComplianceDashboard from './components/ComplianceDashboard';
import ReportGenerator from './components/ReportGenerator';
import { Document as ImportedDocument, DocumentAnalysis } from './types';
import { aiService } from './services/aiService';

type Tab = 'upload' | 'dashboard' | 'clauses' | 'risks' | 'reports';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [documents, setDocuments] = useState<LocalDocument[]>([]);
  const [analysis, setAnalysis] = useState<DocumentAnalysis[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<Record<string, string>>({});

  const tabs = [
    { id: 'upload' as Tab, name: 'Document Upload', icon: FileText },
    { id: 'dashboard' as Tab, name: 'Compliance Dashboard', icon: BarChart3 },
    { id: 'clauses' as Tab, name: 'Clause Inventory', icon: Shield },
    { id: 'risks' as Tab, name: 'Risk Analysis', icon: Brain },
    { id: 'reports' as Tab, name: 'Generate Reports', icon: Download }
  ];

  const analyzeDocuments = async () => {
    const completedDocs = documents.filter(doc => 
      doc.status === 'completed' && !doc.analysis && !doc.validationError
    );
    
    if (completedDocs.length === 0) {
      return;
    }

    setAnalyzing(true);
    const newAnalysis: DocumentAnalysis[] = [];
    const progress: Record<string, string> = {};

    try {
      for (const doc of completedDocs) {
        // Update document status to processing
        progress[doc.id] = 'Extracting text...';
        setAnalysisProgress({...progress});
        
        setDocuments(prev => prev.map(d => 
          d.id === doc.id ? { ...d, status: 'processing' } : d
        ));

        progress[doc.id] = 'Analyzing clauses...';
        setAnalysisProgress({...progress});

        try {
          // Create a mock file for analysis (in real implementation, store original file)
          const mockFile = new File(['sample content'], doc.name, { 
            type: doc.type === 'PDF' ? 'application/pdf' : 'text/plain' 
          });
          
          progress[doc.id] = 'Identifying risks...';
          setAnalysisProgress({...progress});
          
          const docAnalysis = await aiService.analyzeDocument(mockFile);
          
          progress[doc.id] = 'Checking compliance...';
          setAnalysisProgress({...progress});
          
          newAnalysis.push(docAnalysis);
          
          progress[doc.id] = 'Analysis complete';
          setAnalysisProgress({...progress});
          
          // Update document with analysis
          setDocuments(prev => prev.map(d => 
            d.id === doc.id ? { ...d, analysis: docAnalysis, status: 'completed' } : d
          ));
          
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`Analysis failed for document ${doc.name}:`, error);
          
          // Update document with error status
          setDocuments(prev => prev.map(d => 
            d.id === doc.id ? { 
              ...d, 
              status: 'error',
              validationError: error instanceof Error ? error.message : 'Analysis failed'
            } : d
          ));
          
          progress[doc.id] = 'Analysis failed';
          setAnalysisProgress({...progress});
        }
      }

      setAnalysis(prev => [...prev, ...newAnalysis]);
      
    } catch (error) {
      console.error('Batch analysis failed:', error);
    } finally {
      setAnalyzing(false);
      // Clear progress after a delay
      setTimeout(() => {
        setAnalysisProgress({});
      }, 2000);
    }
  };

  const getAnalysisStats = () => {
    if (analysis.length === 0) return { 
      totalClauses: 0, 
      totalRisks: 0, 
      avgScore: 0, 
      criticalRisks: 0,
      complianceGaps: 0
    };
    
    const totalClauses = analysis.reduce((sum, a) => sum + a.clauses.length, 0);
    const totalRisks = analysis.reduce((sum, a) => sum + a.risks.length, 0);
    const criticalRisks = analysis.reduce((sum, a) => 
      sum + a.risks.filter(r => r.severity === 'critical' || r.severity === 'high').length, 0
    );
    const complianceGaps = analysis.reduce((sum, a) => 
      sum + a.complianceStatus.regulations.filter(r => r.status === 'gap').length, 0
    );
    const avgScore = analysis.reduce((sum, a) => sum + a.complianceStatus.score, 0) / analysis.length;
    
    return { 
      totalClauses, 
      totalRisks, 
      avgScore: Math.round(avgScore),
      criticalRisks,
      complianceGaps
    };
  };

  const getAllClauses = () => analysis.flatMap(a => a.clauses);
  const getAllRisks = () => analysis.flatMap(a => a.risks);
  
  const getOverallCompliance = () => {
    if (analysis.length === 0) return null;
    
    // Combine all compliance data
    const allRegulations = analysis.flatMap(a => a.complianceStatus.regulations);
    const avgScore = analysis.reduce((sum, a) => sum + a.complianceStatus.score, 0) / analysis.length;
    
    // Determine overall status based on average score
    let overallStatus: 'compliant' | 'partial' | 'non_compliant' = 'compliant';
    if (avgScore < 60) overallStatus = 'non_compliant';
    else if (avgScore < 80) overallStatus = 'partial';
    
    return {
      overall: overallStatus,
      regulations: allRegulations,
      score: Math.round(avgScore)
    };
  };

  const getOverallSummary = () => {
    if (analysis.length === 0) return null;
    
    const stats = getAnalysisStats();
    const allRisks = getAllRisks();
    const topRisks = allRisks
      .sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity as keyof typeof severityOrder] - 
               severityOrder[a.severity as keyof typeof severityOrder];
      })
      .slice(0, 5);
    
    // Generate dynamic coverage gaps based on analysis
    const coverageGaps = [];
    if (stats.criticalRisks > 0) {
      coverageGaps.push(`${stats.criticalRisks} critical risks require immediate attention`);
    }
    if (stats.complianceGaps > 0) {
      coverageGaps.push(`${stats.complianceGaps} regulatory compliance gaps identified`);
    }
    
    // Add document-specific gaps
    analysis.forEach((docAnalysis, index) => {
      const docRisks = docAnalysis.risks.filter(r => r.severity === 'high' || r.severity === 'critical');
      if (docRisks.length > 2) {
        coverageGaps.push(`Document ${index + 1}: Multiple high-severity risks detected`);
      }
    });
    
    if (coverageGaps.length === 0) {
      coverageGaps.push('No significant coverage gaps identified');
    }
    
    // Generate dynamic next steps
    const nextSteps = [];
    if (stats.criticalRisks > 0) {
      nextSteps.push(`Address ${stats.criticalRisks} critical/high-severity risks immediately`);
    }
    if (stats.complianceGaps > 0) {
      nextSteps.push('Review and resolve regulatory compliance issues');
    }
    nextSteps.push('Conduct quarterly risk assessment review');
    nextSteps.push('Update policy documentation as needed');
    
    return {
      totalClauses: stats.totalClauses,
      criticalRisks: stats.criticalRisks,
      complianceGaps: stats.complianceGaps,
      topRisks,
      coverageGaps,
      nextSteps
    };
  };

  const completedDocs = documents.filter(doc => doc.status === 'completed' && !doc.validationError);
  const errorDocs = documents.filter(doc => doc.status === 'error' || doc.validationError);
  const stats = getAnalysisStats();

  // Auto-switch to dashboard after first successful analysis
  useEffect(() => {
    if (analysis.length > 0 && activeTab === 'upload') {
      setActiveTab('dashboard');
    }
  }, [analysis.length, activeTab]);

  // New handler for document uploads
  const handleDocumentsUploaded = (newDocs: LocalDocument[]) => {
  setDocuments(newDocs);
};


  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <div className="bg-primary shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-primary rounded-lg">
                <Shield className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-secondary">AI Compliance Agent</h1>
                <p className="text-xs text-white">Dynamic Contract Compliance & Risk Assessment System</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-secondary rounded-lg">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">PDF Validation Enabled</span>
              </div>
              {completedDocs.length > 0 && (
                <button
                  onClick={analyzeDocuments}
                  disabled={analyzing}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary text-secondary rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
                >
                  {analyzing ? (
                    <>
                      <Clock className="h-3.5 w-3.5 animate-spin" />
                      <span className="text-xs">Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="h-3.5 w-3.5" />
                      <span className="text-xs">Analyze Documents ({completedDocs.length})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Progress Bar */}
      {analyzing && Object.keys(analysisProgress).length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2">
            <div className="flex items-center space-x-3">
              <Clock className="h-3.5 w-3.5 text-amber-600 animate-spin" />
              <div className="flex-1">
                <div className="text-xs font-medium text-amber-900 mb-1">Analysis in Progress</div>
                <div className="space-y-1">
                  {Object.entries(analysisProgress).map(([docId, status]) => {
                    const doc = documents.find(d => d.id === docId);
                    return doc ? (
                      <div key={docId} className="text-xs text-amber-700">
                        {doc.name}: {status}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      {(stats.totalClauses > 0 || errorDocs.length > 0) && (
        <div className="bg-secondary border-b border-primary/20">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    {documents.length} Documents ({completedDocs.length} valid)
                  </span>
                </div>
                {stats.totalClauses > 0 && (
                  <>
                    <div className="flex items-center space-x-1.5">
                      <Shield className="h-3.5 w-3.5 text-yellow-700" />
                      <span className="text-xs font-medium text-stone-900">{stats.totalClauses} Clauses</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Brain className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-xs font-medium text-stone-900">{stats.totalRisks} Risks</span>
                    </div>
                    {stats.criticalRisks > 0 && (
                      <div className="flex items-center space-x-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                        <span className="text-xs font-medium text-red-700">{stats.criticalRisks} Critical</span>
                      </div>
                    )}
                  </>
                )}
                {errorDocs.length > 0 && (
                  <div className="flex items-center space-x-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                    <span className="text-xs font-medium text-red-700">{errorDocs.length} Failed</span>
                  </div>
                )}
              </div>
              {stats.totalClauses > 0 && (
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-xs font-medium text-stone-900">Compliance Score: {stats.avgScore}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
        <nav className="flex space-x-1 mb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const hasData = tab.id === 'upload' || analysis.length > 0;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={!hasData && tab.id !== 'upload'}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-secondary'
                    : hasData 
                      ? 'text-primary hover:bg-primary/10'
                      : 'text-primary/40 cursor-not-allowed'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.name}</span>
                {tab.id === 'upload' && errorDocs.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {errorDocs.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div>
          {activeTab === 'upload' && (
            <DocumentUpload documents={documents} onDocumentsUploaded={handleDocumentsUploaded} />
          )}

          {activeTab === 'dashboard' && getOverallCompliance() && getOverallSummary() && (
            <ComplianceDashboard 
              complianceStatus={getOverallCompliance()!}
              executiveSummary={getOverallSummary()!}
            />
          )}

          {activeTab === 'clauses' && (
            <ClauseInventory clauses={getAllClauses()} />
          )}

          {activeTab === 'risks' && (
            <RiskAnalysis risks={getAllRisks()} />
          )}

          {activeTab === 'reports' && (
            <ReportGenerator analysis={analysis} />
          )}

          {/* Empty State */}
          {activeTab !== 'upload' && analysis.length === 0 && (
            <div className="bg-secondary rounded-lg shadow-sm border border-primary/20 p-8 text-center">
              <div className="p-3 bg-primary/10 rounded-full w-12 h-12 mx-auto mb-3">
                <FileText className="h-6 w-6 text-primary mx-auto mt-1.5" />
              </div>
              <h3 className="text-base font-semibold text-primary mb-2">No Analysis Data Available</h3>
              <p className="text-primary/80 mb-3 text-sm">
                Upload and analyze insurance documents to view compliance insights, clause inventory, and risk assessments.
              </p>
              {completedDocs.length > 0 ? (
                <div className="space-y-2">
                  <button
                    onClick={analyzeDocuments}
                    disabled={analyzing}
                    className="px-3 py-1.5 bg-primary text-secondary rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors text-sm"
                  >
                    {analyzing ? 'Analyzing...' : `Analyze ${completedDocs.length} Document(s)`}
                  </button>
                  <p className="text-xs text-primary/60">
                    {completedDocs.length} valid document(s) ready for analysis
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-3 py-1.5 bg-primary text-secondary rounded-lg hover:opacity-90 transition-colors text-sm"
                >
                  Upload Documents
                </button>
              )}
            </div>
          )}

          {/* Processing State */}
          {analyzing && activeTab !== 'upload' && (
            <div className="bg-secondary rounded-lg shadow-sm border border-primary/20 p-8 text-center">
              <div className="p-3 bg-primary/10 rounded-full w-12 h-12 mx-auto mb-3">
                <Brain className="h-6 w-6 text-primary mx-auto mt-1.5 animate-pulse" />
              </div>
              <h3 className="text-base font-semibold text-primary mb-2">Analysis in Progress</h3>
              <p className="text-primary/80 mb-3 text-sm">
                AI agents are processing your documents. This may take a few moments.
              </p>
              <div className="text-xs text-primary/60">
                Processing {Object.keys(analysisProgress).length} document(s)...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

export type LocalDocument = {
  id: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'EMAIL';
  size: number;
  uploadedAt: Date;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  analysis?: DocumentAnalysis;
  validationError?: string;
};