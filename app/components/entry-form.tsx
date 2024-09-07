import { useFetcher } from "@remix-run/react";
import { useRef } from "react";

export function EntryForm({
  entry,
}: {
  entry: { text: string; date: string; type: string };
}) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <fetcher.Form method="POST">
      <fieldset disabled={isSubmitting} className="disabled:opacity-70">
        <div>
          <div>
            <input
              type="date"
              name="date"
              id="date"
              required
              defaultValue={entry.date}
              className="text-gray-900"
            />
          </div>
          <div className="mt-4 flex gap-4">
            <label htmlFor="work" className="flex items-center gap-1">
              <input
                type="radio"
                name="type"
                id="work"
                required
                defaultChecked={entry.type === "work"}
                value="work"
              />
              Work
            </label>
            <label htmlFor="learning" className="flex items-center gap-1">
              <input
                type="radio"
                name="type"
                id="learning"
                value="learning"
                defaultChecked={entry.type === "learning"}
              />
              Learning
            </label>
            <label
              htmlFor="interesting-thing"
              className="flex items-center gap-1"
            >
              <input
                type="radio"
                name="type"
                id="interesting-thing"
                value="interesting-thing"
                defaultChecked={entry.type === "interesting-thing"}
              />
              Interesting thing
            </label>
          </div>
        </div>
        <div className="mt-4">
          <textarea
            ref={textareaRef}
            name="text"
            id="text"
            defaultValue={entry.text}
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
            {isSubmitting ? "Saving…" : "Save"}
          </button>
        </div>
      </fieldset>
    </fetcher.Form>
  );
}
