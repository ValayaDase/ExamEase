'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Subject, NLPAnalysisResult, Question } from '@/types';
import { NLPConceptInspector } from '@/components/mcq/NLPConceptInspector';
import { MCQPreviewCard } from '@/components/mcq/MCQPreviewCard';
import { Upload, Sparkles, FileText, CheckCircle2, AlertCircle, Save, ArrowLeft, RefreshCw } from 'lucide-react';

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

  // Step Control: 1: Form & Upload, 2: NLP Analysis, 3: Review Preview
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isExtractingNLP, setIsExtractingNLP] = useState(false);
  const [isGeneratingMCQs, setIsGeneratingMCQs] = useState(false);
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

  // Step 1: Upload PDF & run Classical NLP Pipeline
  const handleExtractNLP = async (e: React.FormEvent) => {
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

    setIsExtractingNLP(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process uploaded PDF.');
      }

      setNlpResult(data.nlpResult);
      setStep(2); // Advance to NLP Concept Inspector
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error extracting text from PDF.';
      setError(msg);
    } finally {
      setIsExtractingNLP(false);
    }
  };

  // Step 2: Trigger AI MCQ Generation from NLP Context
  const handleGenerateMCQs = async () => {
    if (!nlpResult) return;
    setError('');
    setIsGeneratingMCQs(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nlpResult,
          questionCount,
          difficulty,
          mcqTitle,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate questions.');
      }

      setGeneratedQuestions(data.questions || []);
      setStep(3); // Advance to Teacher Review Preview
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating MCQs.';
      setError(msg);
    } finally {
      setIsGeneratingMCQs(false);
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

      // Redirect back to subject details page showing saved cards
      router.push(`/subjects/${selectedSubjectId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving MCQ set.';
      setError(msg);
      setIsSaving(false);
    }
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress Stepper */}
      <div className="flex items-center justify-between max-w-2xl mx-auto mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
          <span className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>1</span>
          <span className="text-xs hidden sm:inline">Upload Notes & Config</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-200"></div>
        <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
          <span className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>2</span>
          <span className="text-xs hidden sm:inline">NLP Insights</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-200"></div>
        <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
          <span className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>3</span>
          <span className="text-xs hidden sm:inline">Teacher Review & Save</span>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Upload PDF Notes & Configure Generation */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900">Generate Practice MCQs</h2>
            <p className="text-slate-500 text-xs mt-1">
              Upload your lecture notes (PDF). Our classical NLP engine extracts key concepts and generates grounded MCQs.
            </p>
          </div>

          <form onSubmit={handleExtractNLP} className="space-y-6">
            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Subject *</label>
              {loadingSubjects ? (
                <div className="h-10 bg-slate-200 rounded-xl animate-pulse"></div>
              ) : subjects.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  No subjects found. Please create a subject first under "My Subjects".
                </div>
              ) : (
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.department || 'Subject'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* MCQ Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">MCQ Set Title *</label>
              <input
                type="text"
                required
                value={mcqTitle}
                onChange={(e) => setMcqTitle(e.target.value)}
                placeholder='e.g. "NLP Module 3 - POS Tagging Practice"'
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">This title will be stored and displayed on the saved MCQ card.</p>
            </div>

            {/* Upload PDF Box */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Upload Notes PDF *</label>
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center transition bg-slate-50/50">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
                  <FileText className="w-10 h-10 text-indigo-600 mb-2" />
                  <span className="text-sm font-bold text-slate-800">
                    {file ? file.name : 'Click to select or drag PDF notes file'}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'PDF files with readable study text'}
                  </span>
                </label>
              </div>
            </div>

            {/* Dynamic Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Number of Questions</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                  <option value={25}>25 Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
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
              disabled={isExtractingNLP}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isExtractingNLP ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Extracting PDF & Running NLP Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Run NLP Pipeline & Extract Concepts</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: NLP Analysis Concept Inspector */}
      {step === 2 && nlpResult && (
        <div>
          <button
            onClick={() => setStep(1)}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Upload Form</span>
          </button>

          <NLPConceptInspector
            nlpResult={nlpResult}
            onProceed={handleGenerateMCQs}
            isGenerating={isGeneratingMCQs}
          />
        </div>
      )}

      {/* STEP 3: Teacher Review & Edit Preview Page */}
      {step === 3 && (
        <div className="max-w-4xl mx-auto">
          {/* Header Action bar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                Teacher Review Mode
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-2">{mcqTitle}</h2>
              <p className="text-slate-500 text-xs mt-1">
                Review generated questions below. You can edit text/options, regenerate individual items, or delete questions.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs transition"
              >
                Inspect NLP
              </button>

              <button
                onClick={handleSaveMCQSet}
                disabled={isSaving || generatedQuestions.length === 0}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition text-xs disabled:opacity-50"
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

          {/* Questions Cards List */}
          {generatedQuestions.map((q, idx) => (
            <MCQPreviewCard
              key={q.id || idx}
              question={q}
              index={idx}
              onUpdate={handleUpdateQuestion}
              onDelete={handleDeleteQuestion}
              onRegenerate={handleRegenerateQuestion}
              isRegenerating={regeneratingId === q.id}
            />
          ))}
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
