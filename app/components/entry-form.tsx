import { useFetcher } from "@remix-run/react";
import { format } from "date-fns";
import { useEffect, useRef } from "react";

export function EntryForm({
  entry,
}: {
  entry?: { text: string; date: string; type: string };
}) {
  const fetcher = useFetcher();

  const isSaving = fetcher.state === "submitting";
  const isSaved = fetcher.state === "idle" && fetcher.data != null;

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isSaved && textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.focus();
    }
  }, [isSaved]);

  return (
    <fetcher.Form method="POST">
      <fieldset disabled={isSaving} className="disabled:opacity-70">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="lg:order-2">
            <input
              type="date"
              name="date"
              id="date"
              required
              defaultValue={entry?.date ?? format(new Date(), "yyyy-MM-dd")}
              className="w-full rounded-md border border-gray-700 bg-gray-800 text-white focus:border-sky-600 focus:ring-sky-600"
            />
          </div>
          <div className="mt-6 flex gap-4 lg:mt-0 lg:gap-6">
            {[
              { label: "Work", value: "work" },
              { label: "Learning", value: "learning" },
              { label: "Interesting thing", value: "interesting-thing" },
            ].map((option) => (
              <label
                key={option.value}
                htmlFor={option.value}
                className="flex items-center gap-2 text-sm text-white lg:text-base"
              >
                <input
                  type="radio"
                  name="type"
                  id={option.value}
                  required
                  defaultChecked={option.value === (entry?.type ?? "work")}
                  value={option.value}
                  className="border-gray-700 bg-gray-800 text-sky-600 focus:border-sky-600 focus:ring-sky-600 focus:ring-offset-gray-900"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <textarea
            ref={textareaRef}
            name="text"
            id="text"
            defaultValue={entry?.text}
            rows={3}
            className="w-full rounded-md border-gray-700 bg-gray-800 text-white focus:border-sky-600 focus:ring-sky-600"
            placeholder="Type your entry..."
            aria-label="Entry"
          />
        </div>
        <div className="mt-6">
          <button
            type="submit"
            className="w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 focus:ring-offset-gray-900 lg:py-1.5"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </fieldset>
    </fetcher.Form>
  );
}
