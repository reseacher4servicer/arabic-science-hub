"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import SearchBar from "@/components/features/search-bar";
import CategoryFilter from "@/components/features/category-filter";
import PaperList from "@/components/features/paper-list";
import Pagination from "@/components/ui/pagination";

export default function PapersPage() {
  const [papers, setPapers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const papersPerPage = 9;

  // جلب التصنيفات
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await api.categories.getAll.query();
        setCategories(result);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // جلب الأوراق البحثية
  useEffect(() => {
    const fetchPapers = async () => {
      setLoading(true);
      try {
        const result = await api.papers.getAll.query({
          search: searchQuery,
          categoryId: selectedCategory,
          page: currentPage,
          limit: papersPerPage,
        });
        
        setPapers(result.papers);
        setTotalPages(Math.ceil(result.total / papersPerPage));
      } catch (error) {
        console.error("Error fetching papers:", error);
        setPapers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [searchQuery, selectedCategory, currentPage]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            الأوراق البحثية
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            اكتشف أحدث الأبحاث العلمية العربية في مختلف التخصصات
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Category Filter */}
          <div className="lg:w-1/4">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Results Info */}
            {!loading && (
              <div className="mb-6 text-gray-600">
                {searchQuery && (
                  <p className="mb-2">
                    نتائج البحث عن: "<span className="font-semibold">{searchQuery}</span>"
                  </p>
                )}
                <p>
                  عرض {papers.length} من أصل {totalPages * papersPerPage} ورقة بحثية
                </p>
              </div>
            )}

            {/* Papers List */}
            <PaperList papers={papers} loading={loading} />

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

