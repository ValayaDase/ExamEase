import React from 'react';
import { Cpu, FileText, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#dadce0] py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5f6368]">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-[#202124]">ExamEase for Education</span>
            <span>&bull;</span>
            <span>NLP Practice MCQ Engine</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#1a73e8]" /> Text Tokenization
            </span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-[#1e8e3e]" /> POS Concept Extraction
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#f9ab00]" /> Grounded AI Generation
            </span>
          </div>

          <div>
            <span>&copy; {new Date().getFullYear()} ExamEase Academic Project</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
