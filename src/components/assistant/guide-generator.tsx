"use client";

import { useFormState, useFormStatus } from "react-dom";
import { getAIGuide } from "@/lib/actions";
import { CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { List, Sparkles, Terminal } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

const initialState = {
  steps: undefined,
  error: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto bg-primary hover:bg-primary/90">
      {pending ? (
        "Generating..."
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Guide
        </>
      )}
    </Button>
  );
}

export function GuideGenerator() {
  const [state, formAction] = useFormState(getAIGuide, initialState);
  const { pending } = useFormStatus();

  return (
    <CardContent>
      <form action={formAction} className="space-y-4">
        <Textarea
          name="task"
          placeholder="e.g., How do I build a simple house? or How to craft a Nether portal?"
          className="min-h-[100px]"
          required
        />
        <div className="flex justify-end">
            <SubmitButton />
        </div>
      </form>

      <div className="mt-6">
        {pending && (
           <div className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
           </div>
        )}

        {state.error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {state.steps && (
          <div className="prose prose-sm max-w-none rounded-lg border p-4">
            <h3 className="flex items-center gap-2 font-semibold">
                <List className="h-5 w-5 text-primary" />
                Your Step-by-Step Guide
            </h3>
            <ol className="list-decimal pl-5 space-y-2">
              {state.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </CardContent>
  );
}
