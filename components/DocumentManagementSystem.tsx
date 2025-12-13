import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, FileText, Search, Download, Eye, 
  Edit3, Trash2, Share2, Lock, Camera,
  FileImage, FileSpreadsheet, FilePdf,
  CheckCircle, Shield, Scan
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'bill_of_lading' | 'invoice' | 'contract' | 'certificate' | 'other';
  category: string;
  size: number;
  uploadDate: Date;
  version: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  tags: string[];
  uploadedBy: string;
  isDigitallySigned: boolean;
  ocrText?: string;
  confidence?: number;
  downloadUrl: string;
}

interface DocumentManagementSystemProps {
  lang: 'ko' | 'en';
}

const DocumentManagementSystem: React.FC<DocumentManagementSystemProps> = ({ lang }) => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'doc-001',
      name: 'KMTC_BL_20241213_001.pdf',
      type: 'bill_of_lading',
      category: '선하증권',
      size: 2048576,
      uploadDate: new Date('2024-12-13T09:00:00'),
      version: 2,
      status: 'approved',
      tags: ['부산항', 'KMTC', '컨테이너'],
      uploadedBy: '김해운',
      isDigitallySigned: true,
      ocrText: 'BILL OF LADING\nShipper: Samsung Electronics\nConsignee: Apple Inc.\nPort of Loading: Busan\nPort of Discharge: Long Beach',
      confidence: 0.96,
      downloadUrl: '/api/documents/doc-001/download'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const text = {
    ko: {
      title: '문서 관리 시스템',
      subtitle: '선하증권, 송장, 계약서를 안전하게 관리하세요',
      upload: '문서 업로드',
      camera: '카메라 스캔',
      search: '문서 검색...',
      all: '전체',
      billOfLading: '선하증권',
      invoice: '송장',
      contract: '계약서',
      certificate: '증명서',
      other: '기타',
      approved: '승인됨',
      pending: '대기중',
      draft: '초안',
      rejected: '거부됨',
      view: '보기',
      download: '다운로드',
      delete: '삭제',
      ocrResults: 'OCR 결과',
      confidence: '신뢰도'
    },
    en: {
      title: 'Document Management System',
      subtitle: 'Securely manage Bills of Lading, Invoices, and Contracts',
      upload: 'Upload Document',
      camera: 'Camera Scan',
      search: 'Search documents...',
      all: 'All',
      billOfLading: 'Bill of Lading',
      invoice: 'Invoice',
      contract: 'Contract',
      certificate: 'Certificate',
      other: 'Other',
      approved: 'Approved',
      pending: 'Pending',
      draft: 'Draft',
      rejected: 'Rejected',
      view: 'View',
      download: 'Download',
      delete: 'Delete',
      ocrResults: 'OCR Results',
      confidence: 'Confidence'
    }
  };

  const t = text[lang];

  // 파일 업로드 처리
  const handleFileUpload = useCallback(async (files: FileList) => {
    setIsUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      const newDoc: Document = {
        id: `doc-${Date.now()}-${i}`,
        name: file.name,
        type: detectDocumentType(file.name),
        category: getCategoryName(detectDocumentType(file.name)),
        size: file.size,
        uploadDate: new Date(),
        version: 1,
        status: 'draft',
        tags: extractTags(file.name),
        uploadedBy: '현재사용자',
        isDigitallySigned: false,
        ocrText: 'OCR 처리 완료된 텍스트...',
        confidence: 0.85 + Math.random() * 0.15,
        downloadUrl: URL.createObjectURL(file)
      };
      
      setDocuments(prev => [newDoc, ...prev]);
    }
    
    setIsUploading(false);
  }, []);

  // 문서 유형 감지
  const detectDocumentType = (filename: string): Document['type'] => {
    const lower = filename.toLowerCase();
    if (lower.includes('bl') || lower.includes('bill')) return 'bill_of_lading';
    if (lower.includes('inv') || lower.includes('invoice')) return 'invoice';
    if (lower.includes('contract')) return 'contract';
    if (lower.includes('cert')) return 'certificate';
    return 'other';
  };

  // 카테고리 이름 가져오기
  const getCategoryName = (type: Document['type']): string => {
    const categories = {
      bill_of_lading: lang === 'ko' ? '선하증권' : 'Bill of Lading',
      invoice: lang === 'ko' ? '송장' : 'Invoice',
      contract: lang === 'ko' ? '계약서' : 'Contract',
      certificate: lang === 'ko' ? '증명서' : 'Certificate',
      other: lang === 'ko' ? '기타' : 'Other'
    };
    return categories[type];
  };

  // 태그 추출
  const extractTags = (filename: string): string[] => {
    const tags = [];
    if (filename.includes('KMTC')) tags.push('KMTC');
    if (filename.includes('Samsung')) tags.push('삼성전자');
    return tags;
  };

  // 파일 크기 포맷
  const formatFileSize = (bytes: number): string => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 상태 색상
  const getStatusColor = (status: Document['status']) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  // 파일 아이콘
  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <FilePdf className="w-5 h-5 text-red-500" />;
      case 'xlsx': case 'xls': return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
      case 'jpg': case 'jpeg': case 'png': return <FileImage className="w-5 h-5 text-blue-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  // 필터링된 문서
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              {t.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{t.subtitle}</p>
          </div>
          
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Camera className="w-5 h-5" />
              {t.camera}
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              {t.upload}
            </button>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          >
            <option value="all">{t.all}</option>
            <option value="bill_of_lading">{t.billOfLading}</option>
            <option value="invoice">{t.invoice}</option>
            <option value="contract">{t.contract}</option>
            <option value="certificate">{t.certificate}</option>
            <option value="other">{t.other}</option>
          </select>
        </div>
      </div>

      {/* 문서 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              {getFileIcon(doc.name)}
              <div className="flex items-center gap-1">
                {doc.isDigitallySigned && (
                  <Shield className="w-4 h-4 text-green-500" />
                )}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                  {t[doc.status]}
                </span>
              </div>
            </div>
            
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2 truncate" title={doc.name}>
              {doc.name}
            </h3>
            
            <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>유형:</span>
                <span>{doc.category}</span>
              </div>
              <div className="flex justify-between">
                <span>크기:</span>
                <span>{formatFileSize(doc.size)}</span>
              </div>
              <div className="flex justify-between">
                <span>업로드:</span>
                <span>{doc.uploadDate.toLocaleDateString()}</span>
              </div>
              {doc.confidence && (
                <div className="flex justify-between">
                  <span>OCR 신뢰도:</span>
                  <span>{Math.round(doc.confidence * 100)}%</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setSelectedDoc(doc);
                  setShowOCRModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Eye className="w-4 h-4" />
                {t.view}
              </button>
              <button
                onClick={() => window.open(doc.downloadUrl)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Download className="w-4 h-4" />
                {t.download}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* OCR 결과 모달 */}
      {showOCRModal && selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {t.ocrResults}
              </h3>
              <button
                onClick={() => setShowOCRModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t.confidence}: {Math.round((selectedDoc.confidence || 0) * 100)}%
                </label>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(selectedDoc.confidence || 0) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  추출된 텍스트:
                </label>
                <textarea
                  value={selectedDoc.ocrText || ''}
                  readOnly
                  className="w-full h-64 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagementSystem;