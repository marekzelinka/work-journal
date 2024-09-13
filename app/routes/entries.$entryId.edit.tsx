import { invariant, invariantResponse } from "@epic-web/invariant";
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
  invariantResponse(entry, "Not Found");

  return { ...entry, date: entry.date.toISOString().substring(0, 10) };
}

export async function action({ request, params }: ActionFunctionArgs) {
  await requiredSignedAdmin(request);

  const fromData = await request.formData();
  const { _action, date, type, text } = Object.fromEntries(fromData);

  if (_action === "delete") {
    await db.entry.delete({
      select: { id: true },
      where: { id: params.entryId },
    });
  } else {
    if (
      typeof date !== "string" ||
      typeof type !== "string" ||
      typeof text !== "string"
    ) {
      throw new Error("Bad request");
    }

    invariant(params.entryId, "entryId is missing");
    await db.entry.update({
      select: { id: true },
      where: { id: params.entryId },
      data: { date: new Date(date), type, text },
    });
  }

  return redirect("/");
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
          <ArrowLeftIcon className="size-4 text-gray-400" />
          Go back
        </Link>
      </div>
      <div className="mt-2 rounded-lg border border-gray-700/30 bg-gray-800/50 p-4 lg:p-6">
        <p className="text-sm font-medium text-gray-500 lg:text-base">
          Edit entry
        </p>
        <div className="mt-4 lg:mt-2">
          <EntryForm entry={entry} />
        </div>
      </div>
      <div className="mt-8">
        <Form
          method="POST"
          onSubmit={(event) => {
            const shouldDelete = window.confirm("Are you sure?");

            if (!shouldDelete) {
              event.preventDefault();
            }
          }}
        >
          <button
            type="submit"
            name="_action"
            value="delete"
            className="text-sm text-red-400 hover:text-red-200"
          >
            Delete this entry…
          </button>
        </Form>
      </div>
    </>
  );
}
