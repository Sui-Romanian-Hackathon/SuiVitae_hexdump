import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  name: string;
  icon: LucideIcon;
  count: number;
  color: string;
}

export function CategoryCard({ name, icon: Icon, count, color }: CategoryCardProps) {
  return (
    <div className="group cursor-pointer border-2 border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-md">
      <div
        className="mb-4 inline-flex h-14 w-14 items-center justify-center border-2 border-border transition-transform group-hover:shadow-xs"
        style={{ backgroundColor: color }}
      >
        <Icon className="h-7 w-7 text-primary-foreground" />
      </div>
      <h3 className="mb-1 text-lg font-bold">{name}</h3>
      <p className="text-sm text-muted-foreground">{count} courses</p>
    </div>
  );
}
