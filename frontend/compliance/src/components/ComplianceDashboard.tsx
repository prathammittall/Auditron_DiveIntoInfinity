import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, AlertTriangle, CheckCircle, XCircle, TrendingUp, FileText } from 'lucide-react';
import { ComplianceStatus, ExecutiveSummary } from '../types';

interface ComplianceDashboardProps {
  complianceStatus: ComplianceStatus;
  executiveSummary: ExecutiveSummary;
}

export default function ComplianceDashboard({ complianceStatus, executiveSummary }: ComplianceDashboardProps) {
  const pieData = [
    { name: 'Aligned', value: complianceStatus.regulations.filter(r => r.status === 'aligned').length, color: '#65A30D' },
    { name: 'Partial', value: complianceStatus.regulations.filter(r => r.status === 'partial').length, color: '#F59E0B' },
    { name: 'Gap', value: complianceStatus.regulations.filter(r => r.status === 'gap').length, color: '#EF4444' }
  ];

  const riskData = executiveSummary.topRisks.map(risk => ({
    name: risk.title.substring(0, 20) + '...',
    exposure: risk.financialExposure / 1000000,
    severity: risk.severity
  }));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aligned':
        return <CheckCircle className="h-5 w-5 text-lime-500" />;
      case 'partial':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'gap':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-stone-500" />;
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-lime-600';
      case 'partial':
        return 'text-yellow-600';
      case 'non_compliant':
        return 'text-red-600';
      default:
        return 'text-stone-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-stone-50 p-6 rounded-lg shadow-sm border border-stone-200">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FileText className="h-6 w-6 text-amber-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-stone-600">Total Clauses</p>
              <p className="text-2xl font-bold text-stone-900">{executiveSummary.totalClauses}</p>
            </div>
          </div>
        </div>

        <div className="bg-stone-50 p-6 rounded-lg shadow-sm border border-stone-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-stone-600">Critical Risks</p>
              <p className="text-2xl font-bold text-stone-900">{executiveSummary.criticalRisks}</p>
            </div>
          </div>
        </div>

        <div className="bg-stone-50 p-6 rounded-lg shadow-sm border border-stone-200">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg">
              <XCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-stone-600">Compliance Gaps</p>
              <p className="text-2xl font-bold text-stone-900">{executiveSummary.complianceGaps}</p>
            </div>
          </div>
        </div>

        <div className="bg-stone-50 p-6 rounded-lg shadow-sm border border-stone-200">
          <div className="flex items-center">
            <div className="p-2 bg-lime-100 rounded-lg">
              <Shield className="h-6 w-6 text-lime-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-stone-600">Compliance Score</p>
              <p className={`text-2xl font-bold ${getOverallStatusColor(complianceStatus.overall)}`}>
                {complianceStatus.score}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Status Chart */}
        <div className="bg-stone-50 p-6 rounded-lg shadow-sm border border-stone-200">
          <h3 className="text-lg font-semibold text-stone-900 mb-4">Compliance Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className={`text-lg font-semibold ${getOverallStatusColor(complianceStatus.overall)}`}>
              Overall Status: {complianceStatus.overall.replace('_', ' ').toUpperCase()}
            </p>
          </div>
        </div>

        {/* Top Risks Chart */}
        <div className="bg-stone-50 p-6 rounded-lg shadow-sm border border-stone-200">
          <h3 className="text-lg font-semibold text-stone-900 mb-4">Top Financial Risks</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  label={{ value: 'Exposure ($M)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(1)}M`, 'Financial Exposure']}
                />
                <Bar dataKey="exposure" fill="#B45309" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Compliance Status */}
      <div className="bg-stone-50 rounded-lg shadow-sm border border-stone-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-stone-900 mb-4">Regulatory Compliance Details</h3>
          <div className="space-y-4">
            {complianceStatus.regulations.map((regulation, index) => (
              <div key={index} className="border border-stone-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(regulation.status)}
                    <h4 className="font-medium text-stone-900">{regulation.name}</h4>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    regulation.status === 'aligned' ? 'bg-lime-100 text-lime-800' :
                    regulation.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {regulation.status.toUpperCase()}
                  </span>
                </div>
                {regulation.issues.length > 0 && (
                  <div className="ml-7">
                    <p className="text-sm font-medium text-stone-700 mb-1">Issues:</p>
                    <ul className="text-sm text-stone-600 list-disc list-inside space-y-1">
                      {regulation.issues.map((issue, issueIndex) => (
                        <li key={issueIndex}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-stone-50 rounded-lg shadow-sm border border-stone-200 p-6">
          <h3 className="text-lg font-semibold text-stone-900 mb-4">Coverage Gaps Identified</h3>
          <ul className="space-y-2">
            {executiveSummary.coverageGaps.map((gap, index) => (
              <li key={index} className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-stone-700">{gap}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-stone-50 rounded-lg shadow-sm border border-stone-200 p-6">
          <h3 className="text-lg font-semibold text-stone-900 mb-4">Recommended Next Steps</h3>
          <ul className="space-y-2">
            {executiveSummary.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                  {index + 1}
                </div>
                <span className="text-sm text-stone-700">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}