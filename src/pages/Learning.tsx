import { CourseCard } from "@/components/courses/CourseCard";
import { ongoingCourses, completedCourses } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, CheckCircle } from "lucide-react";

const Learning = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold">My Learning</h1>
        <p className="text-muted-foreground">
          Track your progress and continue where you left off
        </p>
      </div>

      <Tabs defaultValue="ongoing" className="w-full">
        <TabsList className="mb-6 h-auto w-full justify-start gap-2 bg-transparent p-0">
          <TabsTrigger
            value="ongoing"
            className="gap-2 border-2 border-border bg-card px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            <BookOpen className="h-4 w-4" />
            In Progress ({ongoingCourses.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="gap-2 border-2 border-border bg-card px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            <CheckCircle className="h-4 w-4" />
            Completed ({completedCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ongoing" className="mt-0">
          {ongoingCourses.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ongoingCourses.map((course) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-border bg-card p-12 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-bold">No courses in progress</h3>
              <p className="text-muted-foreground">
                Start learning today by enrolling in a course
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-0">
          {completedCourses.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {completedCourses.map((course) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-border bg-card p-12 text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-bold">No completed courses yet</h3>
              <p className="text-muted-foreground">
                Complete your first course to see it here
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="border-2 border-border bg-card p-6">
          <div className="text-3xl font-bold">{ongoingCourses.length}</div>
          <div className="text-muted-foreground">Courses in Progress</div>
        </div>
        <div className="border-2 border-border bg-card p-6">
          <div className="text-3xl font-bold">{completedCourses.length}</div>
          <div className="text-muted-foreground">Courses Completed</div>
        </div>
        <div className="border-2 border-border bg-card p-6">
          <div className="text-3xl font-bold">
            {Math.round(
              ongoingCourses.reduce((acc, c) => acc + (c.progress || 0), 0) /
                ongoingCourses.length
            )}%
          </div>
          <div className="text-muted-foreground">Average Progress</div>
        </div>
      </section>
    </div>
  );
};

export default Learning;
