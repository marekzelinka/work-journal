import {
  Button,
  Field,
  Fieldset,
  Input,
  Label,
  Textarea,
} from "@headlessui/react";
import { Form, useSubmit } from "@remix-run/react";
import { format } from "date-fns";
import { useRef } from "react";

export function EntryForm({
  entry,
}: {
  entry?: { text: string; date: string; type: string };
}) {
  const submit = useSubmit();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <Form
      method="POST"
      onSubmit={(event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const data = validate(Object.fromEntries(formData));

        submit(
          { ...data, id: window.crypto.randomUUID() },
          {
            method: "POST",
            navigate: false,
            unstable_flushSync: true,
          },
        );

        if (textareaRef.current) {
          textareaRef.current.value = "";
          textareaRef.current.focus();
        }
      }}
    >
      <Fieldset className="space-y-6" aria-label="New entry">
        <div className="max-lg:space-y-6 lg:flex lg:items-center lg:justify-between">
          <div className="lg:order-last">
            <Input
              type="date"
              name="date"
              id="date"
              required
              defaultValue={entry?.date ?? format(new Date(), "yyyy-MM-dd")}
              className="block w-full rounded-md border border-gray-700 bg-gray-800 text-white data-[focus]:border-sky-600 data-[focus]:ring-sky-600"
            />
          </div>
          <div className="flex gap-4 lg:gap-6">
            {[
              { label: "Work", value: "work" },
              { label: "Learning", value: "learning" },
              { label: "Interesting thing", value: "interesting-thing" },
            ].map((option) => (
              <Field key={option.value} className="flex items-center gap-2">
                <Input
                  type="radio"
                  name="type"
                  required
                  defaultChecked={option.value === (entry?.type ?? "work")}
                  value={option.value}
                  className="border-gray-700 bg-gray-800 text-sky-600 data-[focus]:border-sky-600 data-[focus]:ring-sky-600 data-[focus]:ring-offset-gray-900"
                />
                <Label className="text-sm text-white lg:text-base">
                  {option.label}
                </Label>
              </Field>
            ))}
          </div>
        </div>
        <div>
          <Textarea
            ref={textareaRef}
            name="text"
            id="text"
            required
            defaultValue={entry?.text}
            rows={3}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                const isValid = event.currentTarget.reportValidity();

                if (!isValid) {
                  return;
                }

                event.currentTarget.form?.dispatchEvent(
                  new Event("submit", { bubbles: true, cancelable: true }),
                );
              }
            }}
            className="block w-full rounded-md border-gray-700 bg-gray-800 text-white data-[focus]:border-sky-600 data-[focus]:ring-sky-600"
            placeholder="Type your entry..."
            aria-label="Entry"
          />
        </div>
        <div className="lg:flex lg:justify-end">
          <Button
            type="submit"
            className="w-full rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white focus:outline-none data-[hover]:bg-sky-500 data-[focus]:ring-2 data-[focus]:ring-sky-600 data-[focus]:ring-offset-2 data-[focus]:ring-offset-gray-900 lg:w-auto lg:py-1.5"
          >
            Save
          </Button>
        </div>
      </Fieldset>
    </Form>
  );
}

function validate(data: Record<string, FormDataEntryValue>) {
  const { date, type, text } = data;

  if (
    typeof date !== "string" ||
    typeof type !== "string" ||
    typeof text !== "string"
  ) {
    throw new Error("Bad data");
  }

  return { date, type, text };
}
