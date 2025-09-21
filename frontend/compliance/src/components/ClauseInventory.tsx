import React, { useState } from 'react';
import { Search, Filter, FileText, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { Clause } from '../types';

interface ClauseInventoryProps {
  clauses: Clause[];
}

export default function ClauseInventory({ clauses }: ClauseInventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);

  const filteredClauses = clauses.filter(clause => {
    const matchesSearch = clause.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clause.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || clause.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    const colors = {
      coverage_terms: 'bg-amber-100 text-amber-800',
      exclusions: 'bg-red-100 text-red-800',
      claims_obligations: 'bg-yellow-100 text-yellow-800',
      premium_adjustments: 'bg-lime-100 text-lime-800',
      regulatory: 'bg-violet-100 text-violet-800',
      other: 'bg-stone-100 text-stone-800'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      coverage_terms: 'Coverage Terms',
      exclusions: 'Exclusions',
      claims_obligations: 'Claims Obligations',
      premium_adjustments: 'Premium Adjustments',
      regulatory: 'Regulatory',
      other: 'Other'
    };
    return labels[type as keyof typeof labels] || 'Other';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.9) return <CheckCircle className="h-4 w-4 text-lime-500" />;
    if (confidence >= 0.7) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="bg-stone-50 rounded-lg shadow-sm border border-stone-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-stone-900">
            Clause Inventory & Categorization
          </h3>
          <span className="bg-amber-100 text-amber-800 text-sm font-medium px-2.5 py-0.5 rounded">
            {filteredClauses.length} clauses
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search clauses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
            />
          </div>
          <div className="relative">
            <Filter className="h-4 w-4 text-stone-400 absolute left-3 top-3" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Types</option>
              <option value="coverage_terms">Coverage Terms</option>
              <option value="exclusions">Exclusions</option>
              <option value="claims_obligations">Claims Obligations</option>
              <option value="premium_adjustments">Premium Adjustments</option>
              <option value="regulatory">Regulatory</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {filteredClauses.map((clause) => (
              <div
                key={clause.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedClause?.id === clause.id
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
                onClick={() => setSelectedClause(clause)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(clause.type)}`}>
                      {getTypeLabel(clause.type)}
                    </span>
                    {getConfidenceIcon(clause.metadata.confidence)}
                  </div>
                  <span className="text-xs text-stone-500">
                    {Math.round(clause.metadata.confidence * 100)}% confidence
                  </span>
                </div>
                <h4 className="font-medium text-stone-900 mb-2">{clause.category}</h4>
                <p className="text-sm text-stone-600 line-clamp-3">{clause.snippet}...</p>
                <div className="flex items-center justify-between mt-2 text-xs text-stone-500">
                  <span>{clause.metadata.section}</span>
                  {clause.metadata.page && <span>Page {clause.metadata.page}</span>}
                </div>
              </div>
            ))}
          </div>

          {selectedClause && (
            <div className="bg-stone-100 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-amber-700" />
                <h4 className="font-semibold text-stone-900">Clause Details</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Category
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(selectedClause.type)}`}>
                      {getTypeLabel(selectedClause.type)}
                    </span>
                    <span className="text-sm text-stone-600">{selectedClause.category}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Full Content
                  </label>
                  <p className="text-sm text-stone-600 bg-white p-3 rounded border">
                    {selectedClause.content}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Legal Rationale
                  </label>
                  <p className="text-sm text-stone-600 bg-white p-3 rounded border">
                    {selectedClause.metadata.legalRationale}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Confidence Score
                    </label>
                    <div className="flex items-center space-x-2">
                      {getConfidenceIcon(selectedClause.metadata.confidence)}
                      <span className="text-sm font-medium">
                        {Math.round(selectedClause.metadata.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Location
                    </label>
                    <p className="text-sm text-stone-600">
                      {selectedClause.metadata.section}
                      {selectedClause.metadata.page && `, Page ${selectedClause.metadata.page}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}