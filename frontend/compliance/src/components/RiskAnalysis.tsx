import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, DollarSign, Scale, Clock, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Risk } from '../types';

interface RiskAnalysisProps {
  risks: Risk[];
}

export default function RiskAnalysis({ risks }: RiskAnalysisProps) {
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [sortBy, setSortBy] = useState<'severity' | 'financial' | 'urgency'>('severity');
  const [filterStatus, setFilterStatus] = useState<'all' | 'aligned' | 'partial' | 'gap'>('all');

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[severity as keyof typeof colors] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      aligned: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      gap: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.gap;
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'high':
        return <TrendingUp className="h-5 w-5 text-amber-600" />;
      case 'medium':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'low':
        return <Scale className="h-5 w-5 text-lime-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-stone-600" />;
    }
  };

  const sortedRisks = [...risks]
    .filter(risk => filterStatus === 'all' || risk.status === filterStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case 'financial':
          return b.financialExposure - a.financialExposure;
        case 'urgency':
          const urgencyOrder = { high: 3, medium: 2, low: 1 };
          return urgencyOrder[b.urgency as keyof typeof urgencyOrder] - urgencyOrder[a.urgency as keyof typeof urgencyOrder];
        case 'severity':
        default:
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return severityOrder[b.severity as keyof typeof severityOrder] - severityOrder[a.severity as keyof typeof severityOrder];
      }
    });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-stone-50 rounded-lg shadow-sm border border-stone-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-stone-900">
            Risk & Compliance Analysis
          </h3>
          <div className="flex space-x-2">
            <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
              {risks.filter(r => r.severity === 'critical' || r.severity === 'high').length} Critical/High
            </span>
            <span className="bg-amber-100 text-amber-800 text-sm font-medium px-2.5 py-0.5 rounded">
              {risks.filter(r => r.status === 'gap').length} Gaps
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative">
            <Filter className="h-4 w-4 text-stone-400 absolute left-3 top-3" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="severity">Sort by Severity</option>
              <option value="financial">Sort by Financial Exposure</option>
              <option value="urgency">Sort by Urgency</option>
            </select>
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="aligned">Aligned</option>
              <option value="partial">Partial</option>
              <option value="gap">Gap</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {sortedRisks.map((risk) => (
              <div
                key={risk.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedRisk?.id === risk.id
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
                onClick={() => setSelectedRisk(selectedRisk?.id === risk.id ? null : risk)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getSeverityIcon(risk.severity)}
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityColor(risk.severity)}`}>
                      {risk.severity.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(risk.status)}`}>
                      {risk.status.toUpperCase()}
                    </span>
                  </div>
                  {selectedRisk?.id === risk.id ? <ChevronUp className="h-4 w-4 text-stone-400" /> : <ChevronDown className="h-4 w-4 text-stone-400" />}
                </div>

                <h4 className="font-semibold text-stone-900 mb-2">{risk.title}</h4>
                <p className="text-sm text-stone-600 mb-3 line-clamp-2">{risk.description}</p>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3 text-red-500" />
                    <span className="text-stone-600">Exposure:</span>
                    <span className="font-medium">{formatCurrency(risk.financialExposure)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-amber-500" />
                    <span className="text-stone-600">Urgency:</span>
                    <span className="font-medium capitalize">{risk.urgency}</span>
                  </div>
                </div>

                {selectedRisk?.id === risk.id && (
                  <div className="mt-4 pt-4 border-t border-stone-200 space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-stone-700 mb-1">Regulatory Impact</h5>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        risk.regulatoryImpact === 'high' ? 'bg-red-100 text-red-800' :
                        risk.regulatoryImpact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-lime-100 text-lime-800'
                      }`}>
                        {risk.regulatoryImpact.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-stone-700 mb-1">Related Regulations</h5>
                      <div className="flex flex-wrap gap-1">
                        {risk.regulations.map((reg, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-violet-100 text-violet-800 rounded">
                            {reg}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-stone-700 mb-1">Related Clauses</h5>
                      <p className="text-xs text-stone-600">
                        {risk.relatedClauses.length} clause(s) identified
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-stone-100 rounded-lg p-6">
            <h4 className="font-semibold text-stone-900 mb-4">Risk Overview</h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {risks.filter(r => r.severity === 'critical').length}
                  </div>
                  <div className="text-xs text-stone-600">Critical Risks</div>
                </div>
                <div className="bg-white p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {risks.filter(r => r.severity === 'high').length}
                  </div>
                  <div className="text-xs text-stone-600">High Risks</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-medium text-stone-900 mb-2">Total Financial Exposure</h5>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(risks.reduce((sum, risk) => sum + risk.financialExposure, 0))}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-medium text-stone-900 mb-2">Compliance Status Distribution</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-stone-600">Aligned</span>
                    <span className="text-sm font-medium text-lime-600">
                      {risks.filter(r => r.status === 'aligned').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-stone-600">Partial</span>
                    <span className="text-sm font-medium text-yellow-600">
                      {risks.filter(r => r.status === 'partial').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-stone-600">Gap</span>
                    <span className="text-sm font-medium text-red-600">
                      {risks.filter(r => r.status === 'gap').length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h5 className="font-medium text-stone-900 mb-2">Priority Actions</h5>
                <div className="space-y-2">
                  {risks
                    .filter(r => r.urgency === 'high' && r.severity !== 'low')
                    .slice(0, 3)
                    .map((risk, index) => (
                      <div key={risk.id} className="text-sm">
                        <span className="font-medium text-stone-700">{index + 1}.</span>
                        <span className="text-stone-600 ml-1">{risk.title}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}