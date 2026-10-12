/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { lawStorage } from './services/lawStorage';
import { Law, Category, Bookmark, ReadingHistoryItem, UserProfile } from './types/law';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './views/HomeView';
import { LibraryView } from './views/LibraryView';
import { SearchView } from './views/SearchView';
import { ReaderView } from './views/ReaderView';
import { AdminView } from './views/AdminView';
import { BookmarksView } from './views/BookmarksView';
import { ProfileView } from './views/ProfileView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedLawId, setSelectedLawId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [searchInitialQuery, setSearchInitialQuery] = useState<string>('');

  // Data states
  const [laws, setLaws] = useState<Law[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [user, setUser] = useState<UserProfile>(lawStorage.getUser());
  const [isAdmin, setIsAdmin] = useState<boolean>(lawStorage.isAdminAuthenticated());

  // Load data
  const refreshData = () => {
    setLaws(lawStorage.getLaws());
    setCategories(lawStorage.getCategories());
    setBookmarks(lawStorage.getBookmarks());
    setHistory(lawStorage.getHistory());
    setUser(lawStorage.getUser());
    setIsAdmin(lawStorage.isAdminAuthenticated());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCurrentTab('search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigation handlers
  const handleNavigate = (tab: string, lawId?: string, sectionId?: string) => {
    if (tab === 'reader' && lawId) {
      setSelectedLawId(lawId);
      setSelectedSectionId(sectionId || null);
      setCurrentTab('reader');
    } else {
      if (lawId) setSelectedLawId(lawId);
      if (sectionId) setSelectedSectionId(sectionId);
      setCurrentTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (query: string) => {
    setSearchInitialQuery(query);
    setCurrentTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentLaw = selectedLawId ? laws.find((l) => l.id === selectedLawId) : null;

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#D4AF37]/30 selection:text-white">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        user={user}
        isAdmin={isAdmin}
        onOpenSearch={() => {
          setSearchInitialQuery('');
          setCurrentTab('search');
        }}
      />

      {/* Main Layout: Desktop Sidebar + Content Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar (hidden on mobile, visible on lg screens) */}
        <div className="hidden lg:block">
          <Sidebar
            currentTab={currentTab}
            onNavigate={handleNavigate}
            user={user}
            isAdmin={isAdmin}
            bookmarkCount={bookmarks.length}
          />
        </div>

        {/* Content View Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-full overflow-hidden">
          {currentTab === 'home' && (
            <HomeView
              laws={laws}
              categories={categories}
              bookmarks={bookmarks}
              history={history}
              onNavigate={handleNavigate}
              onSearchSubmit={handleSearchSubmit}
            />
          )}

          {currentTab === 'library' && (
            <LibraryView
              laws={laws}
              categories={categories}
              selectedCategory={selectedLawId || 'all'}
              onOpenReader={(lawId) => handleNavigate('reader', lawId)}
              onOpenPdf={(lawId) => handleNavigate('reader', lawId)}
              onGoToUpload={() => handleNavigate('admin')}
            />
          )}

          {currentTab === 'search' && (
            <SearchView
              categories={categories}
              initialQuery={searchInitialQuery}
              onOpenReader={(lawId, secId) => handleNavigate('reader', lawId, secId)}
            />
          )}

          {currentTab === 'reader' && currentLaw && (
            <ReaderView
              law={currentLaw}
              initialSectionId={selectedSectionId || undefined}
              onBack={() => handleNavigate('library')}
              onBookmarkChange={refreshData}
            />
          )}

          {currentTab === 'reader' && !currentLaw && (
            <div className="py-20 text-center space-y-4">
              <h2 className="text-xl font-bold font-serif-bengali text-red-400">
                আইনটি খুঁজে পাওয়া যায়নি
              </h2>
              <button
                onClick={() => handleNavigate('library')}
                className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#0B1220] font-bold text-xs"
              >
                আইন লাইব্রেরিতে ফিরুন
              </button>
            </div>
          )}

          {currentTab === 'bookmarks' && (
            <BookmarksView
              bookmarks={bookmarks}
              onOpenReader={(lawId, secId) => handleNavigate('reader', lawId, secId)}
              onRefreshBookmarks={refreshData}
            />
          )}

          {currentTab === 'admin' && (
            <AdminView
              laws={laws}
              categories={categories}
              isAdmin={isAdmin}
              onAdminAuthChange={(auth) => {
                setIsAdmin(auth);
                refreshData();
              }}
              onRefreshData={refreshData}
              onOpenReader={(lawId) => handleNavigate('reader', lawId)}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              user={user}
              history={history}
              isAdmin={isAdmin}
              onUserUpdate={(updated) => setUser(updated)}
              onAdminAuthChange={(auth) => {
                setIsAdmin(auth);
                refreshData();
              }}
              onOpenReader={(lawId, secId) => handleNavigate('reader', lawId, secId)}
              onRefreshHistory={refreshData}
            />
          )}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onNavigate={(tab) => {
          setSelectedLawId(null);
          setSelectedSectionId(null);
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
