'use client';

import React, { useState } from 'react';
import { NLPAnalysisResult } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Cpu, FileText, CheckCircle2, ChevronDown, ChevronUp, Hash, Layers } from 'lucide-react';

interface NLPConceptInspectorProps {
  nlpResult: NLPAnalysisResult;
  onProceed: () => void;
  isGenerating: boolean;
}

export function NLPConceptInspector({ nlpResult, onProceed, isGenerating }: NLPConceptInspectorProps) {
  const [activeTab, setActiveTab] = useState<'concepts' | 'definitions' | 'ngrams'>('concepts');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 to-indigo-950 p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Cpu className="w-4 h-4" />
              <span>NLP Analysis Engine &bull; Stage Completed</span>
            </div>
            <h3 className="text-xl font-bold">Extracted Study Notes Insights</h3>
            <p className="text-slate-300 text-sm mt-1">
              The classical NLP engine processed {nlpResult.tokenCount} tokens across {nlpResult.sentenceCount} sentences from your uploaded PDF.
            </p>
          </div>

          <button
            onClick={onProceed}
            disabled={isGenerating}
            className="flex items-center justify-center space-x-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating MCQs...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Generate Questions from NLP Context</span>
              </>
            )}
          </button>
        </div>

        {/* NLP Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-center">
          <div className="bg-slate-800/60 p-3 rounded-xl">
            <span className="block text-2xl font-extrabold text-indigo-400">{nlpResult.tokenCount}</span>
            <span className="text-xs text-slate-400">Total Tokens</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl">
            <span className="block text-2xl font-extrabold text-emerald-400">{nlpResult.sentenceCount}</span>
            <span className="text-xs text-slate-400">Sentences Segmented</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl">
            <span className="block text-2xl font-extrabold text-amber-400">{nlpResult.concepts.length}</span>
            <span className="text-xs text-slate-400">Key Concepts Identified</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl">
            <span className="block text-2xl font-extrabold text-teal-400">{nlpResult.definitionSentences.length}</span>
            <span className="text-xs text-slate-400">Definition Patterns</span>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 bg-slate-50 px-6">
        <button
          onClick={() => setActiveTab('concepts')}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition flex items-center gap-2 ${
            activeTab === 'concepts'
              ? 'border-indigo-600 text-indigo-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Extracted Concepts & Score ({nlpResult.concepts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('definitions')}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition flex items-center gap-2 ${
            activeTab === 'definitions'
              ? 'border-indigo-600 text-indigo-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Definition Sentences ({nlpResult.definitionSentences.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ngrams')}
          className={`py-3.5 px-4 font-semibold text-sm border-b-2 transition flex items-center gap-2 ${
            activeTab === 'ngrams'
              ? 'border-indigo-600 text-indigo-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Hash className="w-4 h-4" />
          <span>N-Gram Analysis</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'concepts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nlpResult.concepts.map((conceptItem, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="font-bold text-slate-900 text-base">{conceptItem.concept}</h4>
                  <Badge variant="info">Score: {conceptItem.importanceScore} / 10</Badge>
                </div>

                <div className="text-xs text-slate-600 space-y-1 mt-2">
                  <p className="font-medium text-slate-700">Supporting Source Context:</p>
                  {conceptItem.supportingSentences.map((s, sIdx) => (
                    <p key={sIdx} className="bg-white p-2.5 rounded-lg border border-slate-200 italic text-slate-800">
                      "{s}"
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'definitions' && (
          <div className="space-y-3">
            {nlpResult.definitionSentences.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No formal definition patterns detected in text.</p>
            ) : (
              nlpResult.definitionSentences.map((def, idx) => (
                <div key={idx} className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-sm text-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{def}</span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'ngrams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-bold text-slate-800 text-sm mb-3">Top Bigrams (2-word phrases)</h5>
              <div className="flex flex-wrap gap-2">
                {nlpResult.ngrams.bigrams.map((bg, idx) => (
                  <span key={idx} className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                    {bg.phrase} <strong className="text-indigo-600">({bg.count})</strong>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-bold text-slate-800 text-sm mb-3">Top Trigrams (3-word phrases)</h5>
              <div className="flex flex-wrap gap-2">
                {nlpResult.ngrams.trigrams.map((tg, idx) => (
                  <span key={idx} className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                    {tg.phrase} <strong className="text-teal-600">({tg.count})</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
