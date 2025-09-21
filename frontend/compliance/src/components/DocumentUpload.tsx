import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File as FileIcon, AlertCircle, CheckCircle, Clock, X, AlertTriangle } from 'lucide-react';
import { Document } from '../types';
import { aiService } from '../services/aiService';

interface DocumentUploadProps {
  onDocumentsUploaded: (documents: Document[]) => void;
  documents: Document[];
}

function DocumentUpload({ onDocumentsUploaded, documents }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setValidationErrors({});
    
    const newDocuments: Document[] = [];
    const errors: Record<string, string> = {};

    for (const file of acceptedFiles) {
      const docId = Math.random().toString(36).substr(2, 9);
      
      try {
        // Validate if document is insurance-related
        await aiService.validateInsuranceDocument(file);
        
        // If validation passes, add document
        newDocuments.push({
          id: docId,
          name: file.name,
          type: file.name.toLowerCase().includes('.pdf') ? 'PDF' : 
                file.name.toLowerCase().includes('.docx') ? 'DOCX' : 'EMAIL',
          size: file.size,
          uploadedAt: new Date(),
          status: 'uploading'
        });
      } catch (error) {
        // Store validation error
        errors[docId] = error instanceof Error ? error.message : 'Validation failed';
        
        // Still add document but with error status for user feedback
        newDocuments.push({
          id: docId,
          name: file.name,
          type: file.name.toLowerCase().includes('.pdf') ? 'PDF' : 
                file.name.toLowerCase().includes('.docx') ? 'DOCX' : 'EMAIL',
          size: file.size,
          uploadedAt: new Date(),
          status: 'error'
        });
      }
    }

    // Update validation errors
    setValidationErrors(errors);

    // Add new documents to the list
    onDocumentsUploaded([...documents, ...newDocuments]);

    // Simulate upload process for valid documents
    const validDocs = newDocuments.filter(doc => doc.status === 'uploading');
    for (let i = 0; i < validDocs.length; i++) {
      setTimeout(() => {
        const updatedDocs = [...documents, ...newDocuments];
        const docIndex = updatedDocs.findIndex(d => d.id === validDocs[i].id);
        if (docIndex !== -1) {
          updatedDocs[docIndex].status = 'completed';
          onDocumentsUploaded(updatedDocs);
        }
      }, (i + 1) * 1000);
    }

    setUploading(false);
  }, [documents, onDocumentsUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'message/rfc822': ['.eml'],
      'text/plain': ['.txt']
    },
    multiple: true
  });

  const removeDocument = (id: string) => {
    onDocumentsUploaded(documents.filter(doc => doc.id !== id));
    const newErrors = { ...validationErrors };
    delete newErrors[id];
    setValidationErrors(newErrors);
  };

  const retryValidation = async (doc: Document) => {
    if (doc.status !== 'error') return;

    try {
      setUploading(true);
      
      // Create a mock file for retry (in real implementation, you'd store the original file)
      const mockFile = new window.File([''], doc.name, { type: 'application/pdf' });
      await aiService.validateInsuranceDocument(mockFile);
      
      const updatedDocs = documents.map(d => 
        d.id === doc.id ? { ...d, status: 'uploading' as const } : d
      );
      onDocumentsUploaded(updatedDocs);
      
      const newErrors = { ...validationErrors };
      delete newErrors[doc.id];
      setValidationErrors(newErrors);
      
      setTimeout(() => {
        const finalDocs = documents.map(d => 
          d.id === doc.id ? { ...d, status: 'completed' as const } : d
        );
        onDocumentsUploaded(finalDocs);
      }, 1000);
      
    } catch (error) {
      console.error('Retry validation failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: Document['status'], docId: string) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return (
          <div className="flex items-center space-x-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            {validationErrors[docId] && (
              <button
                onClick={() => retryValidation(documents.find(d => d.id === docId)!)}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
                disabled={uploading}
              >
                Retry
              </button>
            )}
          </div>
        );
    }
  };

  const getStatusText = (status: Document['status'], docId: string) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Ready for Analysis';
      case 'error':
        return validationErrors[docId] || 'Upload Failed';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validDocuments = documents.filter(doc => doc.status !== 'error');
  const errorDocuments = documents.filter(doc => doc.status === 'error');

  return (
    <div className="bg-primary/95 rounded-lg shadow-sm">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary">Document Upload</h3>
          {documents.length > 0 && (
            <div className="text-sm text-secondary/80">
              {validDocuments.length} valid • {errorDocuments.length} failed
            </div>
          )}
        </div>
        
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragActive
              ? 'border-secondary bg-secondary/10'
              : 'border-secondary/30 hover:border-secondary/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-secondary/60 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-secondary font-medium">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-secondary font-medium mb-2">
                Drag & drop insurance documents here, or click to select files
              </p>
              <p className="text-sm text-secondary/80">
                Supports PDF, DOCX, and Email files (up to 10MB each)
              </p>
              <p className="text-xs text-secondary/60 mt-2">
                Documents must contain insurance-related content to be processed
              </p>
            </div>
          )}
        </div>

        {/* Validation Error Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">Document Validation Issues</h4>
                <p className="text-sm text-red-700 mb-2">
                  Some documents failed validation. Only insurance-related documents can be processed.
                </p>
                <div className="text-xs text-red-600">
                  <p>Required keywords: insurance, policy, coverage, health, medical, liability, premium, claims, etc.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Uploaded Documents */}
        {documents.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-secondary mb-3">
              Uploaded Documents ({documents.length})
            </h4>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    doc.status === 'error' 
                      ? 'bg-red-900/20 border border-red-700/30' 
                      : 'bg-secondary/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <FileIcon className={`h-8 w-8 ${
                      doc.status === 'error' ? 'text-red-500' : 'text-amber-700'
                    }`} />
                    <div>
                      <p className={`text-sm font-medium ${
                        doc.status === 'error' ? 'text-red-300' : 'text-secondary'
                      }`}>
                        {doc.name}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-secondary/70">
                        <span>{doc.type}</span>
                        <span>•</span>
                        <span>{formatFileSize(doc.size)}</span>
                        <span>•</span>
                        <span className={doc.status === 'error' ? 'text-red-300' : ''}>
                          {getStatusText(doc.status, doc.id)}
                        </span>
                      </div>
                      {validationErrors[doc.id] && (
                        <p className="text-xs text-red-300 mt-1">
                          {validationErrors[doc.id]}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(doc.status, doc.id)}
                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Tips */}
        {documents.length === 0 && (
          <div className="mt-6 p-4 bg-secondary text-black border border-secondary rounded-lg">
            <h4 className="text-sm font-medium  mb-2">Tips for successful uploads:</h4>
            <ul className="text-sm  space-y-1">
              <li>• Upload insurance policies, health insurance documents, or related contracts</li>
              <li>• Ensure documents contain insurance terminology (coverage, premium, policy, etc.)</li>
              <li>• Supported formats: PDF, DOCX, EML, TXT</li>
              <li>• Maximum file size: 10MB per document</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentUpload;
