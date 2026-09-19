'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Plus, Sparkles, LogOut, BookOpen, Layers, LayoutDashboard } from 'lucide-react';

interface UserSession {
  name: string;
  email: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <header className="bg-white border-b border-[#dadce0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand & App Title */}
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full text-[#5f6368] hover:bg-[#f1f3f4] transition md:hidden">
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center space-x-2.5 group">
              {/* Google Classroom Green/Yellow Icon style */}
              <div className="w-9 h-9 rounded-lg bg-[#1e8e3e] text-white flex items-center justify-center font-bold shadow-2xs group-hover:bg-[#1b7e37] transition">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-medium text-[#202124] tracking-tight group-hover:text-[#1a73e8] transition font-sans">
                  ExamEase
                </span>
                <span className="ml-2 text-xs text-[#5f6368] font-normal hidden lg:inline-block">
                  Classroom MCQ Generator
                </span>
              </div>
            </Link>
          </div>

          {/* Middle Google Classroom Navigation Tabs */}
          {!isAuthPage && user && (
            <nav className="hidden md:flex items-center space-x-1 h-full">
              <Link
                href="/dashboard"
                className={`h-full px-4 flex items-center text-sm font-medium border-b-3 transition ${
                  pathname === '/dashboard'
                    ? 'border-[#1a73e8] text-[#1a73e8]'
                    : 'border-transparent text-[#5f6368] hover:text-[#202124] hover:bg-[#f8f9fa]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                <span>Stream & Dashboard</span>
              </Link>

              <Link
                href="/subjects"
                className={`h-full px-4 flex items-center text-sm font-medium border-b-3 transition ${
                  pathname.startsWith('/subjects')
                    ? 'border-[#1a73e8] text-[#1a73e8]'
                    : 'border-transparent text-[#5f6368] hover:text-[#202124] hover:bg-[#f8f9fa]'
                }`}
              >
                <Layers className="w-4 h-4 mr-2" />
                <span>Classwork & Subjects</span>
              </Link>

              <Link
                href="/generate"
                className={`h-full px-4 flex items-center text-sm font-medium border-b-3 transition ${
                  pathname === '/generate'
                    ? 'border-[#1a73e8] text-[#1a73e8]'
                    : 'border-transparent text-[#5f6368] hover:text-[#202124] hover:bg-[#f8f9fa]'
                }`}
              >
                <Sparkles className="w-4 h-4 mr-2 text-[#1a73e8]" />
                <span>Generate MCQs</span>
              </Link>
            </nav>
          )}

          {/* Right Controls & Google User Profile Circle */}
          <div className="flex items-center space-x-3">
            {!isAuthPage && user && (
              <Link
                href="/generate"
                title="Create MCQ Set"
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#1a73e8] transition"
              >
                <Plus className="w-6 h-6" />
              </Link>
            )}

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-[#e8eaed] animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-2">
                {/* Google Avatar Circle */}
                <div
                  title={`${user.name} (${user.email})`}
                  className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-2xs"
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 rounded-full text-[#5f6368] hover:text-[#d93025] hover:bg-[#fce8e6] transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-[#1a73e8] hover:bg-[#e8f0fe] rounded-md transition"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#1a73e8] hover:bg-[#1557b0] rounded-md transition shadow-2xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
