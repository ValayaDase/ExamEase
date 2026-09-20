'use client';

import React, { useState } from 'react';
import { Question } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Edit2, RefreshCw, Trash2, CheckCircle2, Save, X } from 'lucide-react';

interface MCQPreviewCardProps {
  question: Question;
  index: number;
  onUpdate: (updatedQuestion: Question) => void;
  onDelete: (questionId: string) => void;
  showAnswers?: boolean;
}

export function MCQPreviewCard({
  question,
  index,
  onUpdate,
  onDelete,
  showAnswers = true,
}: MCQPreviewCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(question.question);
  const [editedOptions, setEditedOptions] = useState<string[]>([...question.options]);
  const [editedCorrect, setEditedCorrect] = useState(question.correctAnswer);
  const [editedExplanation, setEditedExplanation] = useState(question.explanation);

  const handleSaveEdit = () => {
    onUpdate({
      ...question,
      question: editedText,
      options: editedOptions,
      correctAnswer: editedCorrect,
      explanation: editedExplanation,
    });
    setIsEditing(false);
  };

  const handleOptionChange = (optIdx: number, val: string) => {
    const newOpts = [...editedOptions];
    const oldVal = newOpts[optIdx];
    newOpts[optIdx] = val;
    setEditedOptions(newOpts);
    if (editedCorrect === oldVal) {
      setEditedCorrect(val);
    }
  };

  return (
    <div className="bg-white border border-[#dadce0] rounded-xl p-6 mb-4 hover:border-[#1a73e8] transition shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f1f3f4] pb-3 mb-4">
        <div className="flex items-center space-x-3">
          <span className="w-7 h-7 rounded-full bg-[#1a73e8] text-white font-bold text-xs flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <div>
            <span className="text-xs font-normal text-[#5f6368] block">
              Source Concept: <strong className="text-[#202124] font-medium">{question.sourceConcept}</strong>
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={question.difficulty as any}>{question.difficulty.toUpperCase()}</Badge>
              <span className="text-[11px] text-[#5f6368] bg-[#f8f9fa] border border-[#dadce0] px-2 py-0.5 rounded-full capitalize">
                {question.type} question
              </span>
            </div>
          </div>
        </div>

        {/* Teacher Action Controls */}
        <div className="flex items-center space-x-1.5">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-2.5 py-1 rounded text-xs font-medium text-[#5f6368] hover:bg-[#f1f3f4] border border-[#dadce0] transition flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => onDelete(question.id)}
                className="px-2.5 py-1 rounded text-xs font-medium text-[#d93025] bg-[#fce8e6] hover:bg-[#fad2cf] border border-[#f5c6cb] transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 rounded text-xs font-medium text-white bg-[#1e8e3e] hover:bg-[#137333] transition flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 rounded text-xs font-medium text-[#5f6368] bg-[#f1f3f4] hover:bg-[#e8eaed] transition flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {!isEditing ? (
        <div>
          <h4 className="text-base font-medium text-[#202124] mb-4">{question.question}</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-4">
            {question.options.map((opt, oIdx) => {
              const letter = String.fromCharCode(65 + oIdx);
              const isCorrect = showAnswers && opt.trim() === question.correctAnswer.trim();

              return (
                <div
                  key={oIdx}
                  className={`p-3 rounded-lg border flex items-center space-x-3 transition text-xs ${
                    isCorrect
                      ? 'bg-[#e6f4ea] border-[#ceead6] text-[#137333] font-medium'
                      : 'bg-white border-[#dadce0] text-[#202124]'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                      isCorrect ? 'bg-[#1e8e3e] text-white' : 'bg-[#f1f3f4] text-[#5f6368]'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {isCorrect && <CheckCircle2 className="w-4 h-4 text-[#1e8e3e] shrink-0" />}
                </div>
              );
            })}
          </div>

          {showAnswers && question.explanation && (
            <div className="bg-[#f8f9fa] border border-[#dadce0] p-3 rounded-md text-xs text-[#5f6368]">
              <strong className="text-[#1a73e8] block mb-0.5">Explanation:</strong>
              {question.explanation}
            </div>
          )}
        </div>
      ) : (
        /* Edit Form */
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-[#202124] mb-1">Question Text</label>
            <textarea
              rows={2}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full p-2.5 rounded-md border border-[#dadce0] focus:ring-1 focus:ring-[#1a73e8] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-[#202124] mb-1">Options & Correct Answer</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {editedOptions.map((opt, oIdx) => {
                const letter = String.fromCharCode(65 + oIdx);
                const isSelectedCorrect = editedCorrect === opt;

                return (
                  <div key={oIdx} className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditedCorrect(opt)}
                      className={`w-7 h-7 rounded font-bold text-xs flex items-center justify-center shrink-0 transition ${
                        isSelectedCorrect
                          ? 'bg-[#1e8e3e] text-white'
                          : 'bg-[#f1f3f4] text-[#5f6368] hover:bg-[#e8eaed]'
                      }`}
                    >
                      {letter}
                    </button>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(oIdx, e.target.value)}
                      className="flex-1 p-2 rounded-md border border-[#dadce0] focus:outline-none focus:border-[#1a73e8]"
                    />
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-[#5f6368] mt-1">Click the letter badge (A, B, C, D) to select the correct answer.</p>
          </div>

          <div>
            <label className="block font-medium text-[#202124] mb-1">Explanation</label>
            <input
              type="text"
              value={editedExplanation}
              onChange={(e) => setEditedExplanation(e.target.value)}
              className="w-full p-2 rounded-md border border-[#dadce0] focus:outline-none focus:border-[#1a73e8]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
