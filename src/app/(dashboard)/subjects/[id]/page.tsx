'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Subject, MCQSet } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Sparkles, Plus, Calendar, Play, FileText, CheckCircle2, Link2, Check } from 'lucide-react';

export default function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const subjectId = resolvedParams.id;

  const [copiedSetId, setCopiedSetId] = useState<string | null>(null);

  const handleCopyLink = (setId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || '');
    const shareUrl = `${origin}/quiz/${setId}`;

    navigator.clipboard.writeText(shareUrl);
    setCopiedSetId(setId);
    setTimeout(() => setCopiedSetId(null), 2500);
  };

  const [subject, setSubject] = useState<Subject | null>(null);
  const [mcqSets, setMcqSets] = useState<MCQSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubjectDetails() {
      try {
        const res = await fetch(`/api/subjects/${subjectId}`);
        if (res.ok) {
          const data = await res.json();
          setSubject(data.subject);
          setMcqSets(data.mcqSets || []);
        }
      } catch (err) {
        console.error('Error loading subject details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSubjectDetails();
  }, [subjectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
        <Navbar />
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
          <div className="h-44 bg-white border border-[#dadce0] rounded-xl animate-pulse mb-8"></div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-white border border-[#dadce0] rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
        <Navbar />
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-medium text-[#202124]">Class Not Found</h2>
          <Link href="/subjects" className="mt-4 inline-block font-medium text-[#1a73e8] hover:underline text-sm">
            Back to Classes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Breadcrumb */}
        <Link
          href="/subjects"
          className="inline-flex items-center space-x-1 text-xs font-medium text-[#5f6368] hover:text-[#1a73e8] transition mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Classes</span>
        </Link>

        {/* Authentic Google Classroom Header Banner */}
        <div className="bg-linear-to-r from-[#1a73e8] to-[#1557b0] rounded-xl p-6 sm:p-8 text-white shadow-xs mb-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs text-white/80 uppercase font-medium tracking-wider block mb-1">
                {subject.department || 'Computer Engineering'} {subject.semester ? `• Semester ${subject.semester}` : ''}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{subject.name}</h1>
              <p className="text-xs text-white/90 mt-1">Teacher: {subject.userName}</p>
            </div>

            <Link
              href={`/generate?subjectId=${subject.id}`}
              className="px-4 py-2.5 rounded-md font-medium text-xs text-[#1a73e8] bg-white hover:bg-[#f8f9fa] shadow-2xs transition flex items-center justify-center space-x-1.5 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-[#1a73e8]" />
              <span>Generate MCQs for Class</span>
            </Link>
          </div>
        </div>

        {/* Google Classroom Classwork Header */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#dadce0]">
          <div>
            <h2 className="text-lg font-medium text-[#202124]">Classwork & Practice MCQ Sets ({mcqSets.length})</h2>
            <p className="text-xs text-[#5f6368]">
              MCQ practice assignments synthesized from uploaded study notes PDF.
            </p>
          </div>

          <Link
            href={`/generate?subjectId=${subject.id}`}
            className="px-4 py-2 rounded-md font-medium text-xs text-white bg-[#1a73e8] hover:bg-[#1557b0] transition flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Create MCQ Assignment</span>
          </Link>
        </div>

        {/* Classwork List Items */}
        {mcqSets.length === 0 ? (
          <div className="bg-white border border-[#dadce0] rounded-xl p-12 text-center">
            <FileText className="w-12 h-12 text-[#bdc1c6] mx-auto mb-3" />
            <h3 className="text-base font-medium text-[#202124]">No MCQ sets posted yet</h3>
            <p className="text-xs text-[#5f6368] mt-1 max-w-md mx-auto">
              Upload a study notes PDF (e.g. "NLP Module 3 - POS Tagging") to create the first practice set for this class.
            </p>
            <Link
              href={`/generate?subjectId=${subject.id}`}
              className="inline-flex items-center space-x-1.5 mt-4 px-4 py-2 rounded-md font-medium text-xs text-white bg-[#1a73e8] hover:bg-[#1557b0] transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create MCQ Set</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {mcqSets.map((set) => (
              <div
                key={set.id}
                className="google-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4">
                  {/* Assignment Icon */}
                  <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#202124] leading-snug">{set.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#5f6368]">
                      <span className="font-medium text-[#1a73e8] bg-[#e8f0fe] px-2.5 py-0.5 rounded-full border border-[#d2e3fc]">
                        {set.questionCount} Questions
                      </span>
                      <Badge variant={set.difficulty as any}>{set.difficulty.toUpperCase()}</Badge>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#5f6368]" />
                        Posted {new Date(set.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(set.id || set._id || '')}
                    className="px-3.5 py-2.5 rounded-md font-medium text-xs text-[#1a73e8] bg-[#e8f0fe] hover:bg-[#d2e3fc] transition border border-[#d2e3fc] flex items-center space-x-1.5"
                  >
                    {copiedSetId === (set.id || set._id) ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#1e8e3e]" />
                        <span className="text-[#1e8e3e] font-bold">Copied Link!</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Copy Student Link</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/quiz/${set.id}`}
                    className="px-4 py-2.5 rounded-md font-medium text-xs text-white bg-[#1a73e8] hover:bg-[#1557b0] transition shadow-2xs flex items-center space-x-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Practice</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
