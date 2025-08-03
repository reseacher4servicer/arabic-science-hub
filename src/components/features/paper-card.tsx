import Link from "next/link";

interface PaperCardProps {
  paper: {
    id: string;
    title: string;
    abstract: string;
    authorName: string;
    categoryName: string;
    createdAt: Date;
    viewCount: number;
  };
}

export default function PaperCard({ paper }: PaperCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {paper.categoryName}
        </span>
        <span className="text-gray-500 text-sm">
          {paper.viewCount} مشاهدة
        </span>
      </div>
      
      <Link href={`/papers/${paper.id}`}>
        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
          {paper.title}
        </h3>
      </Link>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {paper.abstract}
      </p>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>بواسطة: {paper.authorName}</span>
        <span>{new Date(paper.createdAt).toLocaleDateString('ar-SA')}</span>
      </div>
      
      <div className="mt-4 flex space-x-2">
        <Link 
          href={`/papers/${paper.id}`}
          className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded"
        >
          قراءة المزيد
        </Link>
        <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium py-2 px-4 rounded">
          حفظ
        </button>
      </div>
    </div>
  );
}

