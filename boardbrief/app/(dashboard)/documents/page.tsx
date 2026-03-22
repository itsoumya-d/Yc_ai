'use client';

import { useState } from 'react';
import {
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  Folder,
  FolderOpen,
  File,
  FileSpreadsheet,
  ChevronRight,
} from 'lucide-react';

type DocType = 'all' | 'board_pack' | 'minutes' | 'resolution' | 'policy' | 'financial';
type FolderName = 'Meetings' | 'Resolutions' | 'Policies' | 'Financials';

interface Document {
  id: string;
  name: string;
  type: DocType;
  folder: FolderName;
  date: string;
  size: string;
  meeting?: string;
}

const TYPE_LABELS: Record<Exclude<DocType, 'all'>, string> = {
  board_pack: 'Board Pack',
  minutes: 'Minutes',
  resolution: 'Resolution',
  policy: 'Policy',
  financial: 'Financial',
};

const TYPE_COLORS: Record<Exclude<DocType, 'all'>, string> = {
  board_pack: 'bg-blue-100 text-blue-800',
  minutes: 'bg-purple-100 text-purple-800',
  resolution: 'bg-gold-100 text-yellow-800',
  policy: 'bg-green-100 text-green-800',
  financial: 'bg-red-100 text-red-800',
};

const SAMPLE_DOCUMENTS: Document[] = [
  { id: '1', name: 'Q1 2026 Board Pack.pdf', type: 'board_pack', folder: 'Meetings', date: '2026-03-01', size: '4.2 MB', meeting: 'Q1 Board Meeting' },
  { id: '2', name: 'Q1 2026 Meeting Minutes.pdf', type: 'minutes', folder: 'Meetings', date: '2026-03-15', size: '1.1 MB', meeting: 'Q1 Board Meeting' },
  { id: '3', name: 'Resolution 2026-01 — Capital Expenditure.pdf', type: 'resolution', folder: 'Resolutions', date: '2026-03-15', size: '0.3 MB' },
  { id: '4', name: 'Governance Policy v3.2.pdf', type: 'policy', folder: 'Policies', date: '2026-02-10', size: '2.8 MB' },
  { id: '5', name: 'Q4 2025 Financial Statements.xlsx', type: 'financial', folder: 'Financials', date: '2026-01-31', size: '3.5 MB', meeting: 'Q4 Board Meeting' },
  { id: '6', name: 'Q4 2025 Board Pack.pdf', type: 'board_pack', folder: 'Meetings', date: '2025-12-01', size: '5.7 MB', meeting: 'Q4 Board Meeting' },
  { id: '7', name: 'Q4 2025 Meeting Minutes.pdf', type: 'minutes', folder: 'Meetings', date: '2025-12-15', size: '1.3 MB', meeting: 'Q4 Board Meeting' },
  { id: '8', name: 'Conflict of Interest Policy.pdf', type: 'policy', folder: 'Policies', date: '2025-11-20', size: '1.0 MB' },
  { id: '9', name: 'Resolution 2025-08 — Director Appointment.pdf', type: 'resolution', folder: 'Resolutions', date: '2025-09-10', size: '0.2 MB' },
  { id: '10', name: 'Annual Budget 2026.xlsx', type: 'financial', folder: 'Financials', date: '2026-01-15', size: '6.1 MB' },
];

const FOLDERS: FolderName[] = ['Meetings', 'Resolutions', 'Policies', 'Financials'];

function getFileIcon(name: string) {
  if (name.endsWith('.xlsx') || name.endsWith('.csv')) return FileSpreadsheet;
  return FileText;
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocType>('all');
  const [activeFolder, setActiveFolder] = useState<FolderName | null>(null);
  const [uploading, setUploading] = useState(false);

  const filtered = SAMPLE_DOCUMENTS.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesFolder = !activeFolder || doc.folder === activeFolder;
    return matchesSearch && matchesType && matchesFolder;
  });

  const folderCounts = FOLDERS.reduce<Record<FolderName, number>>((acc, folder) => {
    acc[folder] = SAMPLE_DOCUMENTS.filter((d) => d.folder === folder).length;
    return acc;
  }, {} as Record<FolderName, number>);

  function handleUploadClick() {
    setUploading(true);
    setTimeout(() => setUploading(false), 1500);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">Document Library</h1>
          <p className="text-sm text-navy-500 mt-0.5">
            {SAMPLE_DOCUMENTS.length} documents across {FOLDERS.length} folders
          </p>
        </div>
        <button
          onClick={handleUploadClick}
          disabled={uploading}
          className="flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-semibold text-navy-900 hover:bg-gold-400 transition-colors disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar Folders */}
        <div className="col-span-3">
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="border-b border-gray-100 px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-navy-500">Folders</span>
            </div>
            <nav className="p-2">
              <button
                onClick={() => setActiveFolder(null)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  !activeFolder ? 'bg-navy-50 text-navy-900' : 'text-navy-600 hover:bg-gray-50'
                }`}
              >
                <FolderOpen className="h-4 w-4 text-navy-400" />
                All Documents
                <span className="ml-auto text-xs text-navy-400">{SAMPLE_DOCUMENTS.length}</span>
              </button>
              {FOLDERS.map((folder) => (
                <button
                  key={folder}
                  onClick={() => setActiveFolder(folder === activeFolder ? null : folder)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    activeFolder === folder ? 'bg-navy-50 text-navy-900' : 'text-navy-600 hover:bg-gray-50'
                  }`}
                >
                  {activeFolder === folder ? (
                    <FolderOpen className="h-4 w-4 text-gold-500" />
                  ) : (
                    <Folder className="h-4 w-4 text-navy-400" />
                  )}
                  {folder}
                  <span className="ml-auto text-xs text-navy-400">{folderCounts[folder]}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Document List */}
        <div className="col-span-9 space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-navy-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as DocType)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-navy-700 focus:border-navy-500 focus:outline-none"
              >
                <option value="all">All Types</option>
                {(Object.keys(TYPE_LABELS) as Exclude<DocType, 'all'>[]).map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Breadcrumb */}
          {activeFolder && (
            <div className="flex items-center gap-1 text-sm text-navy-500">
              <button onClick={() => setActiveFolder(null)} className="hover:text-navy-900">
                All Documents
              </button>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-medium text-navy-900">{activeFolder}</span>
            </div>
          )}

          {/* Documents Table */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <File className="h-10 w-10 text-navy-200 mb-3" />
                <p className="text-sm text-navy-500">No documents found</p>
                <p className="text-xs text-navy-400 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-navy-500">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-navy-500">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-navy-500">Meeting</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-navy-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-navy-500">Size</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-navy-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((doc) => {
                    const IconComponent = getFileIcon(doc.name);
                    const typeKey = doc.type as Exclude<DocType, 'all'>;
                    return (
                      <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <IconComponent className="h-5 w-5 shrink-0 text-navy-400" />
                            <span className="font-medium text-navy-900 truncate max-w-[220px]" title={doc.name}>
                              {doc.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[typeKey]}`}>
                            {TYPE_LABELS[typeKey]}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-navy-500 text-xs">
                          {doc.meeting ?? '—'}
                        </td>
                        <td className="px-4 py-3.5 text-navy-500 text-xs">
                          {new Date(doc.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3.5 text-navy-500 text-xs">{doc.size}</td>
                        <td className="px-4 py-3.5 text-right">
                          <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-navy-600 hover:bg-navy-50 transition-colors">
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
