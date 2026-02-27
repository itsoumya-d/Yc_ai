import { ScanLine, Camera, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchScannedDocuments } from '@/lib/actions/documents';
import { getDocumentTypeLabel, formatRelativeTime } from '@/lib/utils';

const documentTypes = [
  { type: 'drivers_license', label: "Driver's License", icon: <FileText className="h-5 w-5" /> },
  { type: 'state_id', label: 'State ID', icon: <FileText className="h-5 w-5" /> },
  { type: 'ssn_card', label: 'SSN Card', icon: <FileText className="h-5 w-5" /> },
  { type: 'w2', label: 'W-2 Form', icon: <FileText className="h-5 w-5" /> },
  { type: 'tax_return', label: 'Tax Return', icon: <FileText className="h-5 w-5" /> },
  { type: 'pay_stub', label: 'Pay Stub', icon: <FileText className="h-5 w-5" /> },
  { type: 'birth_certificate', label: 'Birth Certificate', icon: <FileText className="h-5 w-5" /> },
  { type: 'utility_bill', label: 'Utility Bill', icon: <FileText className="h-5 w-5" /> },
  { type: 'bank_statement', label: 'Bank Statement', icon: <FileText className="h-5 w-5" /> },
  { type: 'lease_agreement', label: 'Lease Agreement', icon: <FileText className="h-5 w-5" /> },
  { type: 'passport', label: 'Passport', icon: <FileText className="h-5 w-5" /> },
  { type: 'immigration_doc', label: 'Immigration Document', icon: <FileText className="h-5 w-5" /> },
];

export default async function ScannerPage() {
  const result = await fetchScannedDocuments();
  const documents = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary font-heading">Document Scanner</h1>
        <p className="text-sm text-text-secondary mt-1">
          Scan your documents to auto-fill benefit applications
        </p>
      </div>

      {/* Scan Area */}
      <Card padding="lg" className="border-2 border-dashed border-trust-300 bg-trust-50/50">
        <div className="text-center py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-trust-100 mx-auto mb-4">
            <Camera className="h-8 w-8 text-trust-600" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary font-heading mb-2">Scan a Document</h2>
          <p className="text-sm text-text-secondary mb-6 max-w-sm mx-auto">
            Take a photo or upload a document. Our AI will extract key information automatically.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button className="inline-flex items-center gap-2 bg-trust-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-trust-700 transition-colors">
              <Camera className="h-4 w-4" />
              Take Photo
            </button>
            <button className="inline-flex items-center gap-2 bg-white text-text-primary border border-border px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-surface transition-colors">
              <Upload className="h-4 w-4" />
              Upload File
            </button>
          </div>
        </div>
      </Card>

      {/* Document Types */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Supported Documents</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {documentTypes.map((doc) => (
            <button
              key={doc.type}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border hover:border-trust-300 hover:bg-trust-50 transition-colors text-left"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-text-secondary">
                {doc.icon}
              </div>
              <span className="text-sm font-medium text-text-primary">{doc.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Recent Scans */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
        </CardHeader>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <ScanLine className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No documents scanned yet</p>
            <p className="text-xs text-text-muted mt-1">Scan your first document to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-text-secondary">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {getDocumentTypeLabel(doc.document_type)}
                    </p>
                    <p className="text-xs text-text-muted">{formatRelativeTime(doc.scanned_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.is_verified_by_user ? (
                    <Badge variant="green">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="amber">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Review
                    </Badge>
                  )}
                  {doc.is_in_vault && (
                    <Badge variant="blue">In Vault</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
