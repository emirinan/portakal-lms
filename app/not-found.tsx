import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="bg-yellow-100 rounded-full p-4 w-fit mx-auto">
            <AlertTriangle className="size-16 text-yellow-500" />
          </div>
          <CardTitle className="text-3xl mt-4">404</CardTitle>
          <CardDescription className="max-w-xs mx-auto mt-2">
            <span className="block font-semibold mt-4 mb-1">
              Page Not Found
            </span>
            <span className="block text-sm text-muted-foreground">
              The page you are looking for does not exist or has been moved.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/"
            className={buttonVariants({ className: "w-full mt-4" })}
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
