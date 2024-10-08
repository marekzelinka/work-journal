import {
  Button,
  Field,
  Fieldset,
  Input,
  Label,
  Textarea,
} from "@headlessui/react";
import { LinkIcon } from "@heroicons/react/20/solid";
import { Form, useNavigation, useSubmit } from "@remix-run/react";
import { format } from "date-fns";
import { useRef } from "react";

export function EntryForm({
  entry,
}: {
  entry?: { text: string; date: string; type: string; link: string | null };
}) {
  const editMode = Boolean(entry);

  const navigation = useNavigation();
  const savingEdits = navigation.formData?.get("intent") === "editEntry";

  const submit = useSubmit();

  const textRef = useRef<HTMLTextAreaElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);

  return (
    <Form
      method="POST"
      onSubmit={(event) => {
        if (editMode) {
          return;
        }

        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const entry = validateEntry(Object.fromEntries(formData));

        submit(
          { ...entry, id: window.crypto.randomUUID(), intent: "createEntry" },
          {
            method: "POST",
            navigate: false,
            unstable_flushSync: true,
          },
        );

        if (textRef.current && linkRef.current) {
          textRef.current.value = "";
          textRef.current.focus();

          linkRef.current.value = "";
        }
      }}
    >
      {editMode ? (
        <input type="hidden" name="intent" value="editEntry" />
      ) : (
        <input type="hidden" name="intent" value="createEntry" />
      )}
      <Fieldset
        disabled={savingEdits}
        className="space-y-4 data-[disabled]:pointer-events-none data-[disabled]:opacity-70"
        aria-label="New entry"
      >
        <div className="max-lg:space-y-4 lg:flex lg:items-center lg:justify-between">
          <div className="lg:order-last">
            <Input
              type="date"
              name="date"
              id="date"
              required
              defaultValue={entry?.date ?? format(new Date(), "yyyy-MM-dd")}
              className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 data-[focus]:ring-2 data-[focus]:ring-inset data-[focus]:ring-sky-500 sm:text-sm/6"
              aria-label="Date"
            />
          </div>
          <div className="flex gap-4 lg:gap-6">
            {[
              { label: "Work", value: "work" },
              { label: "Learning", value: "learning" },
              { label: "Interesting thing", value: "interesting-thing" },
            ].map((option) => (
              <Field key={option.value} className="flex items-center gap-3">
                <Input
                  type="radio"
                  name="type"
                  required
                  defaultChecked={option.value === (entry?.type ?? "work")}
                  value={option.value}
                  className="size-4 border-white/10 bg-white/5 text-sky-600 data-[focus]:ring-sky-600 data-[focus]:ring-offset-gray-900"
                />
                <Label className="block text-sm/6 font-medium text-white lg:text-base">
                  {option.label}
                </Label>
              </Field>
            ))}
          </div>
        </div>
        <div>
          <Textarea
            ref={textRef}
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
            className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 data-[focus]:ring-2 data-[focus]:ring-inset data-[focus]:ring-sky-500 sm:text-sm/6"
            placeholder={editMode ? undefined : "What would you like to add?"}
            aria-label="Entry"
          />
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <LinkIcon className="size-5 text-gray-400" />
          </div>
          <Input
            ref={linkRef}
            type="url"
            name="link"
            id="link"
            defaultValue={entry?.link ?? undefined}
            className="block w-full rounded-md border-0 bg-white/5 py-1.5 pl-10 text-white shadow-sm ring-1 ring-inset ring-white/10 data-[focus]:ring-2 data-[focus]:ring-inset data-[focus]:ring-sky-500 sm:text-sm/6"
            placeholder="Optional link"
            aria-label="Link"
          />
        </div>
        <div className="lg:flex lg:justify-end">
          <Button
            type="submit"
            className="rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm data-[hover]:bg-sky-500 data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-sky-600"
          >
            {savingEdits ? "Saving…" : "Save"}
          </Button>
        </div>
      </Fieldset>
    </Form>
  );
}

function validateEntry(data: Record<string, FormDataEntryValue>) {
  const { date, type, text, link } = data;

  if (
    typeof date !== "string" ||
    typeof type !== "string" ||
    typeof text !== "string"
  ) {
    throw new Error("Bad data");
  }

  return { date, type, text, link: typeof link === "string" ? link : "" };
}
