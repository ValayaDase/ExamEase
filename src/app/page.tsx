import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { BookOpen, Sparkles, FileText, Cpu, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-linear-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Academic NLP & AI Question Generator</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Turn Study Notes & PDFs into <span className="text-indigo-600 underline decoration-indigo-300">Practice MCQs</span> Instantly
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Upload your lecture notes. ExamEase runs a classical NLP pipeline (Tokenization, POS tagging, Sentence Segmentation, N-grams & Concept Scoring) before synthesizing accurate, validated MCQs.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition flex items-center justify-center space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition flex items-center justify-center"
            >
              <span>Teacher Login</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">Structured NLP Processing Pipeline</h2>
            <p className="text-slate-600 mt-3 text-base">
              ExamEase enforces explicit classical NLP analysis BEFORE generative AI question synthesis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center mb-4 text-base">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Upload Study PDF</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Upload your study notes, module handouts, or textbook slides in PDF format.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center mb-4 text-base">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Classical NLP Pipeline</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Tokenization, sentence segmentation, Porter stemming, POS tagging & concept scoring.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center mb-4 text-base">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">AI MCQ Generation</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Generates requested number of questions strictly based on extracted NLP concept context.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center mb-4 text-base">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Teacher Review & Quiz</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Review, edit, regenerate, or delete questions before publishing for practice mode.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Syllabus-Aligned NLP</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Demonstrates core syllabus NLP topics: tokenization, POS tagging, lemmatization, N-grams, and TF-IDF definition matching.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Source Grounding</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Questions are synthesized ONLY from your uploaded document content, preventing hallucinated external facts.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Dynamic Question Count</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Generate 5, 10, 15, 20 or custom counts dynamically in single requests with instant teacher review controls.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
