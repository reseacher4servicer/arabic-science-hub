"use client";

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: CategoryFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">التصنيفات</h3>
      
      <div className="space-y-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={`w-full text-right px-3 py-2 rounded-md transition-colors ${
            selectedCategory === null
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          جميع التصنيفات
        </button>
        
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`w-full text-right px-3 py-2 rounded-md transition-colors ${
              selectedCategory === category.id
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}

