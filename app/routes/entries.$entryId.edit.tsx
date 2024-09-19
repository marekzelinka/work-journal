import { invariant, invariantResponse } from "@epic-web/invariant";
import { Button } from "@headlessui/react";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { EntryForm } from "~/components/entry-form";
import { db } from "~/lib/db.server";
import { requiredSignedAdmin } from "~/lib/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requiredSignedAdmin(request);

  invariant(params.entryId, "entryId is missing");
  const entry = await db.entry.findUnique({
    select: { id: true, date: true, type: true, text: true, link: true },
    where: { id: params.entryId },
  });
  invariantResponse(entry, "No entry found");

  return { ...entry, date: entry.date.toISOString().substring(0, 10) };
}

export async function action({ request, params }: ActionFunctionArgs) {
  await requiredSignedAdmin(request);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "editEntry") {
    const entry = validateEntry(Object.fromEntries(formData));

    invariant(params.entryId, "entryId is missing");
    await db.entry.update({
      select: { id: true },
      data: entry,
      where: { id: params.entryId },
    });

    return redirect("/");
  }

  if (intent === "deleteEntry") {
    await db.entry.delete({
      select: { id: true },
      where: { id: params.entryId },
    });

    return redirect("/");
  }

  invariantResponse(
    false,
    `Invalid intent: ${formData.get("intent") ?? "Missing"}`,
  );
}

export default function Component() {
  const entry = useLoaderData<typeof loader>();

  return (
    <>
      <div className="relative -mt-7">
        <Link
          to=".."
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200"
        >
          <ArrowLeftIcon className="size-4 text-gray-500" />
          Back
        </Link>
      </div>
      <div className="mt-2">
        <div className="rounded-lg border border-gray-700/30 bg-gray-800/50 p-4 lg:p-6">
          <div>
            <p className="text-sm font-medium text-gray-400 lg:text-base">
              Edit entry
            </p>
          </div>
          <div className="mt-4 lg:mt-2">
            <EntryForm entry={entry} />
          </div>
        </div>
      </div>
      <div className="mt-6">
        <Form
          method="POST"
          onSubmit={(event) => {
            const shouldDelete = window.confirm("Are you sure?");

            if (!shouldDelete) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="intent" value="deleteEntry" />
          <Button
            type="submit"
            className="text-sm/6 font-medium text-red-400 data-[hover]:text-red-200"
          >
            Delete this entry…
          </Button>
        </Form>
      </div>
    </>
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

  return {
    date: new Date(date),
    type,
    text,
    link: typeof link === "string" ? link : "",
  };
}
