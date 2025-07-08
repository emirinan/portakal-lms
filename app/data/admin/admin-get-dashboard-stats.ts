import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export async function adminGetDashboardStats() {
  await requireAdmin();

  const [totalSignups, totalCustomers, totalCourses, totalLessons] =
    await Promise.all([
      // Total Sign-ups
      prisma.user.count(),
      // Total Customers
      prisma.user.count({
        where: {
          enrollment: {
            some: {},
          },
        },
      }),
      // Total Courses
      prisma.user.count(),
      // Total Lessons
      prisma.lesson.count(),
    ]);

  return {
    totalSignups,
    totalCustomers,
    totalCourses,
    totalLessons,
  };
}
