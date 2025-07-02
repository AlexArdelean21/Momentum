import { Suspense } from 'react';
import SignInForm from '@/components/signin-form';
import { Skeleton } from "@/components/ui/skeleton";

function SignInSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative">
            <div className="w-full max-w-md space-y-8">
                <div className="space-y-4 text-center">
                    <Skeleton className="h-20 w-20 mx-auto rounded-2xl" />
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-6 w-64 mx-auto" />
                </div>
                <div className="space-y-6">
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-5 w-48 mx-auto" />
                </div>
            </div>
        </div>
    );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInSkeleton />}>
      <SignInForm />
    </Suspense>
  );
} 