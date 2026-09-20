'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Subject, NLPAnalysisResult, Question } from '@/types';
import { NLPConceptInspector } from '@/components/mcq/NLPConceptInspector';
import { MCQPreviewCard } from '@/components/mcq/MCQPreviewCard';
import { Upload, Sparkles, FileText, CheckCircle2, AlertCircle, Save, ArrowLeft, RefreshCw, Link2, Check, Copy } from 'lucide-react';

function GenerateMCQContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSubjectId = searchParams.get('subjectId');

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Form Fields
  const [selectedSubjectId, setSelectedSubjectId] = useState(preselectedSubjectId || '');
  const [mcqTitle, setMcqTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('medium');

  // Step Control: 1: Form & Upload, 2: Review Preview & View Toggle
  const [step, setStep] = useState<1 | 2>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Results State
  const [nlpResult, setNlpResult] = useState<NLPAnalysisResult | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await fetch('/api/subjects');
        if (res.ok) {
          const data = await res.json();
          setSubjects(data.subjects || []);
          if (!selectedSubjectId && data.subjects?.length > 0) {
            setSelectedSubjectId(data.subjects[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setLoadingSubjects(false);
      }
    }
    loadSubjects();
  }, []);

  // Combined Direct Step: Upload PDF + Run NLP + Generate MCQs in one smooth flow
  const handleDirectGenerateMCQs = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedSubjectId) {
      setError('Please select or create a subject first.');
      return;
    }
    if (!mcqTitle.trim()) {
      setError('Please enter a title for the MCQ set (e.g. "NLP Module 3 - POS Tagging").');
      return;
    }
    if (!file) {
      setError('Please upload a study notes PDF file.');
      return;
    }

    setIsGenerating(true);

    try {
      // Step A: Upload PDF and extract text + NLP concepts
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'Failed to process uploaded PDF.');
      }

      const extractedNlp = uploadData.nlpResult;
      setNlpResult(extractedNlp);

      // Step B: Directly Generate MCQs from NLP Context
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nlpResult: extractedNlp,
          questionCount,
          difficulty,
          mcqTitle,
        }),
      });

      const genData = await genRes.json();

      if (!genRes.ok) {
        throw new Error(genData.error || 'Failed to generate questions.');
      }

      setGeneratedQuestions(genData.questions || []);
      setStep(2); // Direct transition to generated MCQs review view!
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating MCQs.';
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Single Question Regeneration
  const handleRegenerateQuestion = async (q: Question) => {
    if (!nlpResult) return;
    setRegeneratingId(q.id);

    try {
      const res = await fetch('/api/generate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nlpResult,
          currentQuestion: q,
          difficulty,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Regeneration failed.');

      setGeneratedQuestions((prev) =>
        prev.map((item) => (item.id === q.id ? { ...data.question, id: q.id } : item))
      );
    } catch (err) {
      console.error('Single question regeneration error:', err);
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    setGeneratedQuestions((prev) =>
      prev.map((item) => (item.id === updatedQuestion.id ? updatedQuestion : item))
    );
  };

  const handleDeleteQuestion = (questionId: string) => {
    setGeneratedQuestions((prev) => prev.filter((item) => item.id !== questionId));
  };

  const [savedShareUrl, setSavedShareUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Step 3: Save Approved MCQ Set to Database
  const handleSaveMCQSet = async () => {
    if (generatedQuestions.length === 0) {
      setError('Cannot save an empty MCQ set.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const res = await fetch('/api/mcq-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          title: mcqTitle.trim(),
          fileName: file?.name || 'Study Notes.pdf',
          questionCount: generatedQuestions.length,
          difficulty,
          questions: generatedQuestions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save MCQ set.');
      }

      const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || '');
      const shareUrl = `${origin}/quiz/${data.mcqSetId}`;
      setSavedShareUrl(shareUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving MCQ set.';
      setError(msg);
      setIsSaving(false);
    }
  };

  // View Mode: true = With Correct Answers, false = Without Correct Answers (Student Paper view)
  const [showAnswers, setShowAnswers] = useState(true);

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="p-4 mb-6 rounded-xl bg-[#fce8e6] border border-[#f5c6cb] text-[#d93025] text-xs flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Upload PDF Notes & Configure Generation */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-[#dadce0] shadow-2xs p-6 sm:p-8 max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-medium text-[#202124]">Generate Practice MCQs</h2>
            <p className="text-[#5f6368] text-xs mt-1">
              Upload your lecture notes (PDF). Our classical NLP engine extracts key concepts and generates grounded MCQs.
            </p>
          </div>

          <form onSubmit={handleDirectGenerateMCQs} className="space-y-6">
            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-medium text-[#202124] mb-1">Select Subject / Class *</label>
              {loadingSubjects ? (
                <div className="h-10 bg-[#f1f3f4] rounded-md animate-pulse"></div>
              ) : subjects.length === 0 ? (
                <div className="p-3 bg-[#fef7e0] border border-[#fce8e6] rounded-md text-xs text-[#b06000]">
                  No classes found. Please create a subject first under "Classwork & Subjects".
                </div>
              ) : (
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#dadce0] text-xs focus:ring-1 focus:ring-[#1a73e8] focus:outline-none bg-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.department || 'Class'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* MCQ Title */}
            <div>
              <label className="block text-xs font-medium text-[#202124] mb-1">MCQ Set Title *</label>
              <input
                type="text"
                required
                value={mcqTitle}
                onChange={(e) => setMcqTitle(e.target.value)}
                placeholder='e.g. "NLP Module 3 - POS Tagging Practice"'
                className="w-full px-3.5 py-2.5 rounded-md border border-[#dadce0] text-xs focus:ring-1 focus:ring-[#1a73e8] focus:outline-none"
              />
              <p className="text-[11px] text-[#5f6368] mt-1">This title will be stored and displayed on the saved MCQ card.</p>
            </div>

            {/* Upload PDF Box */}
            <div>
              <label className="block text-xs font-medium text-[#202124] mb-1">Upload Notes PDF *</label>
              <div className="border-2 border-dashed border-[#dadce0] hover:border-[#1a73e8] rounded-xl p-6 text-center transition bg-[#f8f9fa]">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
                  <FileText className="w-10 h-10 text-[#1a73e8] mb-2" />
                  <span className="text-sm font-medium text-[#202124]">
                    {file ? file.name : 'Click to select or drag PDF notes file'}
                  </span>
                  <span className="text-xs text-[#5f6368] mt-1">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'PDF files with readable study text'}
                  </span>
                </label>
              </div>
            </div>

            {/* Dynamic Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1">Number of Questions</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#dadce0] text-xs focus:ring-1 focus:ring-[#1a73e8] focus:outline-none bg-white"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                  <option value={25}>25 Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#202124] mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-[#dadce0] text-xs focus:ring-1 focus:ring-[#1a73e8] focus:outline-none bg-white"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3.5 rounded-md font-medium text-white bg-[#1a73e8] hover:bg-[#1557b0] shadow-2xs transition flex items-center justify-center space-x-2 disabled:opacity-50 text-sm"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing PDF & Generating MCQs...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-white" />
                  <span>Generate Practice MCQs</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: Direct Generated MCQs Review & View Mode Toggle Page */}
      {step === 2 && (
        <div className="max-w-4xl mx-auto">
          {/* Header Action Bar */}
          <div className="bg-white p-6 rounded-xl border border-[#dadce0] shadow-2xs mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#f1f3f4]">
              <div>
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center space-x-1 text-xs font-medium text-[#5f6368] hover:text-[#1a73e8] transition mb-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Upload</span>
                </button>
                <h2 className="text-2xl font-bold text-[#202124] mt-1">{mcqTitle}</h2>
                <p className="text-[#5f6368] text-xs mt-0.5">
                  {generatedQuestions.length} Questions generated from PDF notes.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleSaveMCQSet}
                  disabled={isSaving || generatedQuestions.length === 0}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-md font-medium text-xs text-white bg-[#1e8e3e] hover:bg-[#137333] shadow-2xs transition disabled:opacity-50"
                >
                  {isSaving ? (
                    <span>Saving MCQ Set...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save MCQ Set ({generatedQuestions.length} Questions)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* TOP VIEW MODE TOGGLE (2 Options: With Answers / Without Answers) */}
            <div className="flex items-center justify-between bg-[#f8f9fa] p-1.5 rounded-lg border border-[#dadce0]">
              <span className="text-xs font-medium text-[#5f6368] px-2 hidden sm:inline">
                View Mode Options:
              </span>

              <div className="flex items-center space-x-1 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowAnswers(true)}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-md text-xs font-medium transition flex items-center justify-center space-x-1.5 ${
                    showAnswers
                      ? 'bg-white text-[#1e8e3e] shadow-xs border border-[#dadce0] font-bold'
                      : 'text-[#5f6368] hover:bg-[#e8eaed]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-[#1e8e3e]" />
                  <span>1. With Correct Answers & Explanations</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAnswers(false)}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-md text-xs font-medium transition flex items-center justify-center space-x-1.5 ${
                    !showAnswers
                      ? 'bg-white text-[#1a73e8] shadow-xs border border-[#dadce0] font-bold'
                      : 'text-[#5f6368] hover:bg-[#e8eaed]'
                  }`}
                >
                  <FileText className="w-4 h-4 text-[#1a73e8]" />
                  <span>2. Without Correct Answers (Question Paper View)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Questions Cards List */}
          {generatedQuestions.map((q, idx) => (
            <MCQPreviewCard
              key={q.id || idx}
              question={q}
              index={idx}
              onUpdate={handleUpdateQuestion}
              onDelete={handleDeleteQuestion}
              showAnswers={showAnswers}
            />
          ))}
        </div>
      )}

      {/* MCQ Set Saved Success & Share Link Modal */}
      {savedShareUrl && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-xl border border-[#dadce0]">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#e6f4ea] text-[#1e8e3e] flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#202124]">MCQ Set Saved Successfully! 🎉</h3>
              <p className="text-xs text-[#5f6368] mt-1">
                Your question set is stored in your class. You can share this link directly with students to solve the quiz!
              </p>
            </div>

            <div className="bg-[#f8f9fa] border border-[#dadce0] p-3 rounded-lg mb-6">
              <label className="block text-[11px] font-medium text-[#5f6368] mb-1 uppercase tracking-wider">
                Shareable Student Quiz Link:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={savedShareUrl}
                  className="flex-1 bg-white border border-[#dadce0] px-3 py-2 rounded-md text-xs font-mono text-[#202124] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(savedShareUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2500);
                  }}
                  className="px-4 py-2 rounded-md text-xs font-medium text-white bg-[#1a73e8] hover:bg-[#1557b0] transition flex items-center space-x-1 shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-white" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => router.push(`/subjects/${selectedSubjectId}`)}
                className="w-full py-2.5 rounded-md text-xs font-medium text-white bg-[#1a73e8] hover:bg-[#1557b0] transition"
              >
                Go to Subject Classwork Page
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function GenerateMCQPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading generator...</div>}>
        <GenerateMCQContent />
      </Suspense>
      <Footer />
    </div>
  );
}
