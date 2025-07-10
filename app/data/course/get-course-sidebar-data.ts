import "server-only";
import { requireUser } from "../user/require-user";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export async function getCourseSidebarData(slug: string) {
  const session = await requireUser();
  const course = await prisma.course.findUnique({
    where: {
      slug: slug,
    },
    select: {
      id: true,
      title: true,
      fileKey: true,
      duration: true,
      level: true,
      category: true,
      slug: true,
      chapter: {
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
          title: true,
          position: true,
          lessons: {
            orderBy: {
              position: "asc",
            },
            select: {
              id: true,
              title: true,
              position: true,
              description: true,
              lessonProgress: {
                where: {
                  userID: session.id,
                },
                select: {
                  completed: true,
                  lessonID: true,
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    return notFound();
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userID_courseID: {
        userID: session.id,
        courseID: course.id,
      },
    },
  });

  if (!enrollment || enrollment.status !== "Active") {
    return notFound();
  }

  return {
    course,
  };
}

export type CourseSidebarDataType = Awaited<
  ReturnType<typeof getCourseSidebarData>
>;
