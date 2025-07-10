"use client";

import { useMemo } from "react";

interface CourseData {
  chapter: Array<{
    lessons: Array<{
      id: string;
      lessonProgress: Array<{
        lessonID: string;
        completed: boolean;
      }>;
    }>;
  }>;
}

interface iAppProps {
  courseData: CourseData;
}

interface CourseProgressResult {
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
}

export function useCourseProgress({
  courseData,
}: iAppProps): CourseProgressResult {
  return useMemo(() => {
    let totalLessons = 0;
    let completedLessons = 0;

    courseData.chapter.forEach((chapter) => {
      chapter.lessons.forEach((lesson) => {
        totalLessons++;
        // Check if this lesson is completed

        const isCompleted = lesson.lessonProgress.some(
          (progress) => progress.lessonID === lesson.id && progress.completed
        );

        if (isCompleted) {
          completedLessons++;
        }
      });
    });
    const progressPercentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return {
      totalLessons,
      completedLessons,
      progressPercentage,
    };
  }, [courseData]);
}
