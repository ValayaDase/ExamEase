'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { MCQSet, Question } from '@/types';
import { ArrowLeft, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

export default function PracticeQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const mcqSetId = resolvedParams.id;
  const router = useRouter();

  const [mcqSet, setMcqSet] = useState<MCQSet | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchQuizSet() {
      try {
        const res = await fetch(`/api/mcq-sets/${mcqSetId}`);
        if (res.ok) {
          const data = await res.json();
          setMcqSet(data.mcqSet);
        }
      } catch (err) {
        console.error('Failed to load quiz:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuizSet();
  }, [mcqSetId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
        <Navbar />
        <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 border-3 border-[#1a73e8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5f6368] font-medium text-xs">Loading practice assignment...</p>
        </div>
      </div>
    );
  }

  if (!mcqSet || !mcqSet.questions || mcqSet.questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
        <Navbar />
        <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-16 text-center">
          <h2 className="text-lg font-medium text-[#202124]">Quiz Assignment Not Found</h2>
          <Link href="/subjects" className="mt-4 inline-block font-medium text-[#1a73e8] hover:underline text-xs">
            Back to Classes
          </Link>
        </div>
      </div>
    );
  }

  const questions: Question[] = mcqSet.questions;
  const currentQuestion = questions[currentIndex];
  const totalCount = questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalCount) * 100);

  const handleSelectOption = (option: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalCount - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mcqSetId,
          userAnswers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit quiz.');
      }

      router.push(`/results/${data.attemptId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting quiz.';
      setError(msg);
      setSubmitting(false);
    }
  };

  const selectedAnswer = userAnswers[currentQuestion.id] || '';

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/subjects/${mcqSet.subjectId}`}
            className="inline-flex items-center space-x-1 text-xs font-medium text-[#5f6368] hover:text-[#1a73e8] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Classwork</span>
          </Link>

          <span className="text-xs font-medium text-[#202124] bg-white border border-[#dadce0] px-3 py-1 rounded-md">
            {mcqSet.title}
          </span>
        </div>

        {/* Quiz Progress Indicator Bar */}
        <div className="bg-white p-4 rounded-xl border border-[#dadce0] shadow-2xs mb-6">
          <div className="flex items-center justify-between text-xs font-medium text-[#202124] mb-2">
            <span>Question {currentIndex + 1} of {totalCount}</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="w-full h-2 bg-[#f1f3f4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1a73e8] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 mb-6 rounded-md bg-[#fce8e6] border border-[#f5c6cb] text-[#d93025] text-xs">
            {error}
          </div>
        )}

        {/* Authentic Google Forms Quiz Card (with Google Blue Top Strip) */}
        <div className="bg-white rounded-xl border border-[#dadce0] border-t-8 border-t-[#1a73e8] shadow-sm p-6 sm:p-8 mb-6">
          <div className="mb-6">
            <span className="text-xs font-medium text-[#1a73e8] uppercase tracking-wider block mb-1">
              Concept: {currentQuestion.sourceConcept || 'Notes Context'}
            </span>
            <h2 className="text-lg sm:text-xl font-medium text-[#202124] leading-snug">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options List */}
          <div className="space-y-2.5 mb-8">
            {currentQuestion.options.map((opt, oIdx) => {
              const letter = String.fromCharCode(65 + oIdx);
              const isSelected = selectedAnswer === opt;

              return (
                <button
                  key={oIdx}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full p-3.5 rounded-md border text-left flex items-center space-x-3 transition text-sm ${
                    isSelected
                      ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8] font-medium'
                      : 'bg-white border-[#dadce0] hover:bg-[#f8f9fa] text-[#202124]'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#1a73e8] text-white' : 'bg-[#f1f3f4] text-[#5f6368]'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="flex-1">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Controls Footer */}
          <div className="flex items-center justify-between border-t border-[#f1f3f4] pt-6">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-md font-medium text-xs text-[#5f6368] hover:bg-[#f1f3f4] border border-[#dadce0] transition disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {currentIndex < totalCount - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 rounded-md font-medium text-xs text-white bg-[#1a73e8] hover:bg-[#1557b0] transition shadow-2xs flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="px-6 py-2 rounded-md font-medium text-xs text-white bg-[#1e8e3e] hover:bg-[#137333] transition shadow-2xs flex items-center gap-1 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Quiz</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
