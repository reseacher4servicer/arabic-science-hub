"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Calendar, User, Tag } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { api } from "~/lib/api";

interface SearchAdvancedProps {
  initialQuery?: string;
  onSearch?: (params: SearchParams) => void;
}

interface SearchParams {
  query?: string;
  category?: string;
  author?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
}

export function SearchAdvanced({ initialQuery = "", onSearch }: SearchAdvancedProps) {
  const router = useRouter();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: initialQuery,
    sortBy: "relevance",
  });

  const { data: categories } = api.categories.getAll.useQuery();

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && value.trim()) {
        params.set(key, value);
      }
    });

    if (onSearch) {
      onSearch(searchParams);
    } else {
      router.push(`/papers/search?${params.toString()}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const updateParam = (key: keyof SearchParams, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* البحث الأساسي */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="ابحث في الأوراق العلمية..."
            value={searchParams.query || ""}
            onChange={(e) => updateParam("query", e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-10 text-right"
          />
        </div>
        <Button onClick={handleSearch} className="px-6">
          بحث
        </Button>
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </div>

      {/* البحث المتقدم */}
      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <CollapsibleContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              البحث المتقدم
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* التصنيف */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  التصنيف
                </Label>
                <Select
                  value={searchParams.category || ""}
                  onValueChange={(value) => updateParam("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع التصنيفات</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* المؤلف */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  المؤلف
                </Label>
                <Input
                  placeholder="اسم المؤلف"
                  value={searchParams.author || ""}
                  onChange={(e) => updateParam("author", e.target.value)}
                  className="text-right"
                />
              </div>

              {/* ترتيب النتائج */}
              <div className="space-y-2">
                <Label>ترتيب النتائج</Label>
                <Select
                  value={searchParams.sortBy || "relevance"}
                  onValueChange={(value) => updateParam("sortBy", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">الأكثر صلة</SelectItem>
                    <SelectItem value="date">الأحدث</SelectItem>
                    <SelectItem value="likes">الأكثر إعجاباً</SelectItem>
                    <SelectItem value="reviews">الأكثر مراجعة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* تاريخ البداية */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  من تاريخ
                </Label>
                <Input
                  type="date"
                  value={searchParams.dateFrom || ""}
                  onChange={(e) => updateParam("dateFrom", e.target.value)}
                />
              </div>

              {/* تاريخ النهاية */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  إلى تاريخ
                </Label>
                <Input
                  type="date"
                  value={searchParams.dateTo || ""}
                  onChange={(e) => updateParam("dateTo", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchParams({ query: searchParams.query, sortBy: "relevance" });
                }}
              >
                مسح الفلاتر
              </Button>
              <Button onClick={handleSearch}>
                تطبيق البحث
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

