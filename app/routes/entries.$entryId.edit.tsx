import { PrismaClient } from "@prisma/client";
import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { EntryForm } from "~/components/entry-form";
import { getSession } from "~/session";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("cookie"));
  if (!session.data.isAdmin) {
    throw new Response("Not authenticated", {
      status: 401,
      statusText: "Not authenticated",
    });
  }

  const db = new PrismaClient();

  if (typeof params.entryId !== "string") {
    throw new Response("Not Found", { status: 404, statusText: "Not Found" });
  }

  const entry = await db.entry.findUnique({ where: { id: params.entryId } });

  if (!entry) {
    throw new Response("Not Found", { status: 404, statusText: "Not Found" });
  }

  return { ...entry, date: entry.date.toISOString().substring(0, 10) };
}

export async function action({ request, params }: ActionFunctionArgs) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const session = await getSession(request.headers.get("cookie"));
  if (!session.data.isAdmin) {
    throw new Response("Not authenticated", {
      status: 401,
      statusText: "Not authenticated",
    });
  }

  const db = new PrismaClient();

  const fromData = await request.formData();
  const { _action, date, type, text } = Object.fromEntries(fromData);

  if (_action === "delete") {
    await db.entry.delete({ where: { id: params.entryId } });
  } else {
    if (
      typeof date !== "string" ||
      typeof type !== "string" ||
      typeof text !== "string"
    ) {
      throw new Error("Bad request");
    }

    if (typeof params.entryId !== "string") {
      throw new Response("Not Found", { status: 404, statusText: "Not Found" });
    }

    await db.entry.update({
      where: { id: params.entryId },
      data: { date: new Date(date), type, text },
    });
  }

  return redirect("/");
}

export default function Component() {
  const entry = useLoaderData<typeof loader>();

  return (
    <div>
      <p>Editing entry {entry.id}</p>
      <div className="mt-8">
        <EntryForm entry={entry} />
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
            className="text-gray-500 underline"
          >
            Delete this entry…
          </button>
        </Form>
      </div>
    </div>
  );
}
