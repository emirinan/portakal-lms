"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function DeleteCourse(courseID: string): Promise<ApiResponse> {
  await requireAdmin();

  try {
    await prisma.course.delete({
      where: {
        id: courseID,
      },
    });

    revalidatePath("/admin/courses");

    return {
      status: "success",
      message: "Course deletede successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to delete course",
    };
  }
}
