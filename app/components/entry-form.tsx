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
        <div>
          <div>
            <input
              type="date"
              name="date"
              id="date"
              required
              defaultValue={entry?.date ?? format(new Date(), "yyyy-MM-dd")}
              className="text-gray-900"
            />
          </div>
          <div className="mt-4 flex gap-4">
            {[
              { label: "Work", value: "work" },
              { label: "Learning", value: "learning" },
              { label: "Interesting thing", value: "interesting-thing" },
            ].map((option) => (
              <label
                key={option.value}
                htmlFor={option.value}
                className="flex items-center gap-1"
              >
                <input
                  type="radio"
                  name="type"
                  id={option.value}
                  required
                  defaultChecked={option.value === (entry?.type ?? "work")}
                  value={option.value}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <textarea
            ref={textareaRef}
            name="text"
            id="text"
            defaultValue={entry?.text}
            className="w-full text-gray-700"
            placeholder="Type your entry..."
            aria-label="Entry"
          />
        </div>
        <div className="mt-2 text-right">
          <button
            type="submit"
            className="bg-blue-500 px-4 py-1 font-semibold text-white"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </fieldset>
    </fetcher.Form>
  );
}
