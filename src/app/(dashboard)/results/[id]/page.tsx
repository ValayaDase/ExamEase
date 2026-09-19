'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { QuizAttempt } from '@/types';
import { Award, CheckCircle2, XCircle, RotateCcw, ArrowLeft, Layers, BookOpen } from 'lucide-react';

export default function QuizResultPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const attemptId = resolvedParams.id;

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch(`/api/quiz/results/${attemptId}`);
        if (res.ok) {
          const data = await res.json();
          setAttempt(data.attempt);
        }
      } catch (err) {
        console.error('Failed to load results:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-semibold text-sm">Calculating quiz result score...</p>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-bold text-slate-800">Result Record Not Found</h2>
          <Link href="/dashboard" className="mt-4 inline-block font-bold text-indigo-600 hover:underline text-sm">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const wrongCount = attempt.totalQuestions - attempt.score;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Navigation */}
        <Link
          href={attempt.subjectId ? `/subjects/${attempt.subjectId}` : '/dashboard'}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Subject MCQ Sets</span>
        </Link>

        {/* Score Report Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
            Quiz Result Performance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            {attempt.mcqSetTitle}
          </h1>

          {/* Big Score Counter */}
          <div className="my-6">
            <span className="text-5xl font-black text-indigo-600 tracking-tight">
              {attempt.score} <span className="text-2xl text-slate-400 font-bold">/ {attempt.totalQuestions}</span>
            </span>
            <div className="text-lg font-bold text-slate-700 mt-1">
              Percentage: <strong className="text-emerald-600">{attempt.percentage}%</strong>
            </div>
          </div>

          {/* Correct / Wrong breakdown grid */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto my-6 pt-6 border-t border-slate-100">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-900">Correct: {attempt.score}</span>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center justify-center space-x-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span className="text-sm font-bold text-rose-900">Wrong: {wrongCount}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 pt-6 border-t border-slate-100">
            <button
              onClick={() => setShowReview(!showReview)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
            >
              {showReview ? 'Hide Answer Breakdown' : 'Review Answers'}
            </button>

            <Link
              href={`/quiz/${attempt.mcqSetId}`}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition flex items-center justify-center space-x-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </Link>

            <Link
              href={attempt.subjectId ? `/subjects/${attempt.subjectId}` : '/dashboard'}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center space-x-1.5"
            >
              <Layers className="w-4 h-4" />
              <span>Back to MCQ Sets</span>
            </Link>
          </div>
        </div>

        {/* Detailed Question Review Breakdown */}
        {showReview && attempt.answers && (
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-extrabold text-slate-900 mb-4">Detailed Question Review</h3>

            {attempt.answers.map((ans, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-2xl border p-6 shadow-2xs transition ${
                  ans.isCorrect ? 'border-emerald-200' : 'border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">{ans.questionText}</h4>
                  </div>

                  {ans.isCorrect ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Correct</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Incorrect</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
                  <div className={`p-3 rounded-xl border ${ans.isCorrect ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'}`}>
                    <span className="block font-bold text-slate-500 mb-0.5">Your Selected Answer:</span>
                    <strong className={ans.isCorrect ? 'text-emerald-950 font-bold' : 'text-rose-950 font-bold'}>
                      {ans.selectedOption || '(No answer selected)'}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="block font-bold text-slate-500 mb-0.5">Correct Answer:</span>
                    <strong className="text-emerald-700 font-bold">{ans.correctAnswer}</strong>
                  </div>
                </div>

                {ans.explanation && (
                  <div className="mt-3 bg-slate-50 p-3 rounded-xl text-xs text-slate-600 border border-slate-100">
                    <strong className="text-indigo-600">Explanation:</strong> {ans.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
