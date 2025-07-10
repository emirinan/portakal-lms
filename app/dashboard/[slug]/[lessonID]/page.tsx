import { getLessonContent } from "@/app/data/course/get-lesson-content";
import { CourseContent } from "./_components/CourseContent";
import { Suspense } from "react";
import { LessonSkeleton } from "./_components/LessonSkeleton";

type Params = Promise<{ lessonID: string }>;

export default async function LessonContentPage({
  params,
}: {
  params: Params;
}) {
  const { lessonID } = await params;

  return (
    <Suspense fallback={<LessonSkeleton />}>
      <LessonContentLoader lessonID={lessonID} />
    </Suspense>
  );
}

async function LessonContentLoader({ lessonID }: { lessonID: string }) {
  const data = await getLessonContent(lessonID);

  return <CourseContent data={data} />;
}
