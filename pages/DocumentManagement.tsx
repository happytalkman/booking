import React from 'react';
import DocumentManagementSystem from '../components/DocumentManagementSystem';

interface DocumentManagementProps {
  lang: 'ko' | 'en';
}

const DocumentManagement: React.FC<DocumentManagementProps> = ({ lang }) => {
  return (
    <div className="space-y-6">
      <DocumentManagementSystem lang={lang} />
    </div>
  );
};

export default DocumentManagement;