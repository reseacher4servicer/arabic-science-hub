"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { 
  Trophy, 
  FileText, 
  Star, 
  ThumbsUp, 
  MessageSquare,
  Building,
  MapPin,
  CheckCircle
} from "lucide-react";

interface ResearcherCardProps {
  researcher: {
    rank: number;
    user: {
      id: string;
      name: string;
      username: string;
      avatar?: string | null;
      institution?: string | null;
      department?: string | null;
      position?: string | null;
      verified: boolean;
    };
    totalScore: number;
    papersCount: number;
    reviewsCount: number;
    avgReviewRating: number;
    likesReceived: number;
  };
  showRank?: boolean;
}

export function ResearcherCard({ researcher, showRank = true }: ResearcherCardProps) {
  const { rank, user, totalScore, papersCount, reviewsCount, avgReviewRating, likesReceived } = researcher;

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-600 bg-yellow-50";
    if (rank === 2) return "text-gray-600 bg-gray-50";
    if (rank === 3) return "text-amber-600 bg-amber-50";
    return "text-blue-600 bg-blue-50";
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Trophy className="h-4 w-4" />;
    return <span className="font-bold">#{rank}</span>;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/researcher/${user.id}`}>
              <Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                <AvatarImage src={user.avatar || ""} alt={user.name} />
                <AvatarFallback className="text-lg font-semibold">
                  {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </Link>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link 
                  href={`/researcher/${user.id}`}
                  className="font-semibold text-lg hover:text-blue-600 transition-colors truncate"
                >
                  {user.name}
                </Link>
                {user.verified && (
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                )}
              </div>
              
              <p className="text-sm text-gray-600 truncate">@{user.username}</p>
              
              {user.position && (
                <p className="text-sm text-gray-700 font-medium truncate">
                  {user.position}
                </p>
              )}
              
              {(user.institution || user.department) && (
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <Building className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">
                    {user.department && user.institution 
                      ? `${user.department} - ${user.institution}`
                      : user.department || user.institution
                    }
                  </span>
                </div>
              )}
            </div>
          </div>

          {showRank && (
            <Badge 
              variant="secondary" 
              className={`${getRankColor(rank)} flex items-center gap-1 px-3 py-1`}
            >
              {getRankIcon(rank)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* النقاط الإجمالية */}
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totalScore.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">النقاط الإجمالية</div>
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <FileText className="h-4 w-4 text-green-600" />
            <div>
              <div className="font-semibold text-sm">{papersCount}</div>
              <div className="text-xs text-gray-600">ورقة</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <div>
              <div className="font-semibold text-sm">{reviewsCount}</div>
              <div className="text-xs text-gray-600">مراجعة</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <Star className="h-4 w-4 text-yellow-600" />
            <div>
              <div className="font-semibold text-sm">
                {avgReviewRating > 0 ? avgReviewRating.toFixed(1) : "0.0"}
              </div>
              <div className="text-xs text-gray-600">تقييم</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <ThumbsUp className="h-4 w-4 text-red-600" />
            <div>
              <div className="font-semibold text-sm">{likesReceived}</div>
              <div className="text-xs text-gray-600">إعجاب</div>
            </div>
          </div>
        </div>

        {/* رابط الملف الشخصي */}
        <div className="mt-4">
          <Link 
            href={`/researcher/${user.id}`}
            className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            عرض الملف الشخصي
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

