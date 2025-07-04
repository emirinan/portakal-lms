import { adminGetLesson } from "@/app/data/admin/admin-get-lesson";
import { LessonForm } from "./_components/LessonForm";

type Params = Promise<{
  courseID: string;
  chapterID: string;
  lessonID: string;
}>;

export default async function LessonsPage({ params }: { params: Params }) {
  const { chapterID, courseID, lessonID } = await params;
  const lesson = await adminGetLesson(lessonID);

  return <LessonForm data={lesson} chapterID={chapterID} courseID={courseID} />;
}
