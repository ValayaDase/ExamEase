'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Subject } from '@/types';
import { Plus, Sparkles, Folder, Layers, BookOpen, ArrowRight, MoreVertical, FileText } from 'lucide-react';

const CLASSROOM_BANNERS = [
  'bg-linear-to-r from-[#1a73e8] to-[#1557b0]', // Google Blue
  'bg-linear-to-r from-[#1e8e3e] to-[#137333]', // Google Green
  'bg-linear-to-r from-[#007b83] to-[#004d40]', // Google Teal
  'bg-linear-to-r from-[#8e24aa] to-[#4a148c]', // Google Purple
  'bg-linear-to-r from-[#d93025] to-[#b31412]', // Google Coral
  'bg-linear-to-r from-[#5f6368] to-[#3c4043]', // Google Steel
];

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const authRes = await fetch('/api/auth/me');
        const authData = await authRes.json();
        if (authData.authenticated) {
          setUser(authData.user);
        }

        const subjRes = await fetch('/api/subjects');
        if (subjRes.ok) {
          const subjData = await subjRes.json();
          setSubjects(subjData.subjects || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalMCQSets = subjects.reduce((acc, s) => acc + (s.mcqSetCount || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Google Classroom Header Banner */}
        <div className="bg-white border border-[#dadce0] rounded-xl p-6 sm:p-8 mb-8 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#1a73e8] text-xs font-medium mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Google Classroom Academic Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-medium text-[#202124]">
                Classes & Subjects &bull; {user ? user.name : 'Teacher'}
              </h1>
              <p className="text-[#5f6368] text-sm mt-1">
                Select a class card to view generated MCQ sets or upload new PDF lecture notes.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <Link
                href="/subjects"
                className="px-4 py-2.5 rounded-md font-medium text-xs text-[#1a73e8] bg-[#e8f0fe] hover:bg-[#d2e3fc] transition flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Class</span>
              </Link>

              <Link
                href="/generate"
                className="px-5 py-2.5 rounded-md font-medium text-xs text-white bg-[#1a73e8] hover:bg-[#1557b0] transition shadow-2xs flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Generate MCQs</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#dadce0]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xl font-bold text-[#202124]">{subjects.length}</span>
                <span className="text-xs text-[#5f6368]">Enrolled Classes</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[#e6f4ea] text-[#1e8e3e] flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xl font-bold text-[#202124]">{totalMCQSets}</span>
                <span className="text-xs text-[#5f6368]">Saved MCQ Sets</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[#fef7e0] text-[#f9ab00] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xl font-bold text-[#202124]">Classical NLP</span>
                <span className="text-xs text-[#5f6368]">PDF Concept Extraction</span>
              </div>
            </div>
          </div>
        </div>

        {/* Google Classroom Class Cards Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[#202124]">Class Cards</h2>
            <Link href="/subjects" className="text-xs font-medium text-[#1a73e8] hover:underline flex items-center space-x-1">
              <span>Manage All Classes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 bg-white border border-[#dadce0] rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : subjects.length === 0 ? (
            <div className="bg-white border border-[#dadce0] rounded-xl p-12 text-center">
              <BookOpen className="w-12 h-12 text-[#bdc1c6] mx-auto mb-3" />
              <h3 className="text-base font-medium text-[#202124]">No classes added yet</h3>
              <p className="text-xs text-[#5f6368] mt-1 max-w-md mx-auto">
                Create your first class card (e.g. "Natural Language Processing") to start generating and practicing MCQs.
              </p>
              <Link
                href="/subjects"
                className="inline-flex items-center space-x-2 mt-4 px-4 py-2 rounded-md font-medium text-xs text-white bg-[#1a73e8] hover:bg-[#1557b0] transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create Class Card</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subj, idx) => {
                const bannerStyle = CLASSROOM_BANNERS[idx % CLASSROOM_BANNERS.length];

                return (
                  <div
                    key={subj.id}
                    className="google-card flex flex-col justify-between overflow-hidden h-72 group relative"
                  >
                    {/* Google Classroom Card Header Banner */}
                    <div className={`p-4 h-36 ${bannerStyle} text-white relative flex flex-col justify-between`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <Link href={`/subjects/${subj.id}`} className="hover:underline">
                            <h3 className="text-xl font-bold tracking-tight leading-snug line-clamp-1">
                              {subj.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-white/90 font-normal mt-0.5">
                            {subj.department || 'Computer Engineering'} {subj.semester ? `• Sem ${subj.semester}` : ''}
                          </p>
                        </div>
                        <button className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-end justify-between">
                        <span className="text-xs text-white/80 font-normal">Teacher: {subj.userName}</span>

                        {/* Floating Google Classroom Teacher Avatar Circle */}
                        <div
                          title={subj.userName}
                          className="w-12 h-12 rounded-full bg-[#1a73e8] border-2 border-white text-white font-bold flex items-center justify-center text-sm shadow-md translate-y-6"
                        >
                          {subj.userName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 pt-6 flex-1 flex flex-col justify-between bg-white">
                      <div className="text-xs text-[#5f6368] space-y-1">
                        <div className="flex items-center justify-between">
                          <span>MCQ Practice Sets:</span>
                          <span className="font-bold text-[#202124] bg-[#f8f9fa] border border-[#dadce0] px-2.5 py-0.5 rounded-full text-xs">
                            {subj.mcqSetCount || 0} Sets
                          </span>
                        </div>
                      </div>

                      {/* Card Actions Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#f1f3f4] text-xs">
                        <Link
                          href={`/generate?subjectId=${subj.id}`}
                          className="text-[#1a73e8] font-medium hover:bg-[#e8f0fe] px-2.5 py-1.5 rounded transition"
                        >
                          + Generate MCQs
                        </Link>

                        <Link
                          href={`/subjects/${subj.id}`}
                          className="font-medium text-[#202124] hover:bg-[#f8f9fa] px-3 py-1.5 rounded border border-[#dadce0] transition"
                        >
                          Open Class
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
