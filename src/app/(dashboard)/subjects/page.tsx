'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Subject } from '@/types';
import { Plus, BookOpen, Layers, X, Folder, MoreVertical } from 'lucide-react';

const CLASSROOM_BANNERS = [
  'bg-linear-to-r from-[#1a73e8] to-[#1557b0]',
  'bg-linear-to-r from-[#1e8e3e] to-[#137333]',
  'bg-linear-to-r from-[#007b83] to-[#004d40]',
  'bg-linear-to-r from-[#8e24aa] to-[#4a148c]',
  'bg-linear-to-r from-[#d93025] to-[#b31412]',
];

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [semester, setSemester] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/subjects');
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.subjects || []);
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Subject / Class name is required.');
      return;
    }

    setCreating(true);

    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, semester, department }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create subject.');

      setName('');
      setSemester('');
      setDepartment('');
      setIsModalOpen(false);
      fetchSubjects();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating subject.';
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#dadce0]">
          <div>
            <h1 className="text-2xl font-medium text-[#202124]">Classes & Subjects</h1>
            <p className="text-xs text-[#5f6368] mt-1">
              Manage your academic subjects and view generated practice question sets.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-md font-medium text-xs text-white bg-[#1a73e8] hover:bg-[#1557b0] transition shadow-2xs flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Class</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-white border border-[#dadce0] rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="bg-white border border-[#dadce0] rounded-xl p-12 text-center">
            <BookOpen className="w-12 h-12 text-[#bdc1c6] mx-auto mb-3" />
            <h3 className="text-base font-medium text-[#202124]">No classes added</h3>
            <p className="text-xs text-[#5f6368] mt-1 max-w-md mx-auto">
              Create a class (e.g. "Natural Language Processing") to start uploading notes and generating MCQs.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center space-x-1.5 mt-4 px-4 py-2 rounded-md font-medium text-xs text-white bg-[#1a73e8] hover:bg-[#1557b0] transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Class</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subj, idx) => {
              const bannerStyle = CLASSROOM_BANNERS[idx % CLASSROOM_BANNERS.length];

              return (
                <div key={subj.id} className="google-card flex flex-col justify-between overflow-hidden h-72">
                  <div className={`p-4 h-36 ${bannerStyle} text-white flex flex-col justify-between relative`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={`/subjects/${subj.id}`} className="hover:underline">
                          <h3 className="text-xl font-bold tracking-tight line-clamp-1">{subj.name}</h3>
                        </Link>
                        <p className="text-xs text-white/90 mt-0.5">
                          {subj.department || 'Academic Department'} {subj.semester ? `• Sem ${subj.semester}` : ''}
                        </p>
                      </div>
                      <button className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-end justify-between">
                      <span className="text-xs text-white/80">Teacher: {subj.userName}</span>
                      <div className="w-11 h-11 rounded-full bg-[#1a73e8] border-2 border-white text-white font-bold flex items-center justify-center text-xs shadow-md translate-y-6">
                        {subj.userName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-6 flex-1 flex flex-col justify-between bg-white">
                    <div className="text-xs text-[#5f6368] space-y-1">
                      <div className="flex items-center justify-between">
                        <span>MCQ Sets:</span>
                        <strong className="text-[#202124] bg-[#f8f9fa] border border-[#dadce0] px-2.5 py-0.5 rounded-full">
                          {subj.mcqSetCount || 0} Sets
                        </strong>
                      </div>
                    </div>

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

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-lg p-6 shadow-xl border border-[#dadce0]">
              <div className="flex items-center justify-between border-b border-[#dadce0] pb-3 mb-4">
                <h3 className="text-lg font-medium text-[#202124]">Create Class</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full text-[#5f6368] hover:bg-[#f1f3f4] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="p-3 mb-4 rounded-md bg-[#fce8e6] border border-[#f5c6cb] text-[#d93025] text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-[#202124] mb-1">Class Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Natural Language Processing"
                    className="w-full px-3 py-2 rounded-md border border-[#dadce0] focus:ring-1 focus:ring-[#1a73e8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#202124] mb-1">Semester (Optional)</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="e.g. 6"
                    className="w-full px-3 py-2 rounded-md border border-[#dadce0] focus:ring-1 focus:ring-[#1a73e8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#202124] mb-1">Department (Optional)</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full px-3 py-2 rounded-md border border-[#dadce0] focus:ring-1 focus:ring-[#1a73e8] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-md font-medium text-[#5f6368] hover:bg-[#f1f3f4] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 rounded-md font-medium text-white bg-[#1a73e8] hover:bg-[#1557b0] transition disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Class'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
