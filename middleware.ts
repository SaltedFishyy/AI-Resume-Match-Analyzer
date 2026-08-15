import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { canUseLocalPreviewAuth, isClerkConfigured } from "@/lib/auth-config";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/analyze(.*)",
  "/history(.*)",
  "/profile(.*)",
  "/resume(.*)",
  "/api/analyze(.*)",
  "/api/profile(.*)",
  "/api/master-resume(.*)",
]);

const protectedMiddleware = clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) await auth.protect();
});

export default isClerkConfigured
  ? protectedMiddleware
  : (request: NextRequest) => {
      if (canUseLocalPreviewAuth || !isProtectedRoute(request)) {
        return NextResponse.next();
      }

      return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
    };

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
