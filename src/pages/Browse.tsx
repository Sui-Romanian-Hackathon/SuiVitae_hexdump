import { CourseCard } from "@/components/courses/CourseCard";
import { CategoryCard } from "@/components/courses/CategoryCard";
import { categories, featuredCourses } from "@/data/mockData";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Browse = () => {
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="border-2 border-border bg-card p-8 md:p-12">
        <div className="max-w-2xl">
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Advance Your Career with Expert-Led Courses
          </h1>
          <p className="mb-6 text-lg text-muted-foreground">
            Explore thousands of courses from industry leaders. Earn certificates
            and credentials that matter.
          </p>
          <Button className="gap-2 border-2 px-6 py-3 text-lg shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            Start Learning
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Browse by Category</h2>
          <Button variant="ghost" className="gap-1 text-muted-foreground hover:text-foreground">
            View all
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.name} {...category} />
          ))}
        </div>
      </section>

      {/* Featured Courses Section */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Courses</h2>
          <Button variant="ghost" className="gap-1 text-muted-foreground hover:text-foreground">
            View all
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-2 border-border bg-primary p-8 text-primary-foreground md:p-12">
        <div className="grid gap-8 text-center md:grid-cols-4">
          <div>
            <div className="mb-2 text-4xl font-bold">50K+</div>
            <div className="text-primary-foreground/80">Active Learners</div>
          </div>
          <div>
            <div className="mb-2 text-4xl font-bold">1,500+</div>
            <div className="text-primary-foreground/80">Expert Courses</div>
          </div>
          <div>
            <div className="mb-2 text-4xl font-bold">25K+</div>
            <div className="text-primary-foreground/80">Certificates Issued</div>
          </div>
          <div>
            <div className="mb-2 text-4xl font-bold">98%</div>
            <div className="text-primary-foreground/80">Satisfaction Rate</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Browse;
