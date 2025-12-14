import { Clock, Users, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CourseCardProps {
  title: string;
  instructor: string;
  category: string;
  duration: string;
  students: number;
  rating: number;
  image: string;
  progress?: number;
  completed?: boolean;
}

export function CourseCard({
  title,
  instructor,
  category,
  duration,
  students,
  rating,
  image,
  progress,
  completed,
}: CourseCardProps) {
  return (
    <div className="group cursor-pointer border-2 border-border bg-card transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="relative aspect-video overflow-hidden border-b-2 border-border">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <Badge className="absolute left-3 top-3 border-2 border-border bg-background text-foreground shadow-xs">
          {category}
        </Badge>
        {completed && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/90">
            <span className="text-lg font-bold text-primary-foreground">COMPLETED</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-lg font-bold leading-tight line-clamp-2">{title}</h3>
        <p className="mb-3 text-sm text-muted-foreground">{instructor}</p>
        
        {progress !== undefined && !completed && (
          <div className="mb-3">
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium">{progress}% complete</span>
            </div>
            <Progress value={progress} className="h-2 border border-border" />
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{students.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-current text-chart-4" />
            <span className="font-medium text-foreground">{rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
