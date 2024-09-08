import { PrismaClient } from "@prisma/client";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type SerializeFrom,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { format, parseISO, startOfWeek } from "date-fns";
import { EntryForm } from "~/components/entry-form";
import { getSession } from "~/session";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("cookie"));

  const db = new PrismaClient();

  const entries = await db.entry.findMany();

  return {
    session: session.data,
    entries: entries.map((entry) => ({
      ...entry,
      date: entry.date.toISOString().substring(0, 10),
    })),
  };
}

export async function action({ request }: ActionFunctionArgs) {
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
  const { date, type, text } = Object.fromEntries(fromData);

  if (
    typeof date !== "string" ||
    typeof type !== "string" ||
    typeof text !== "string"
  ) {
    throw new Error("Bad request");
  }

  return await db.entry.create({ data: { date: new Date(date), type, text } });
}

export default function Component() {
  const { session, entries } = useLoaderData<typeof loader>();

  const entriesByWeek = entries.reduce<Record<string, typeof entries>>(
    (memo, entry) => {
      const sunday = startOfWeek(parseISO(entry.date));
      const sundayString = format(sunday, "yyyy-MM-dd");

      memo[sundayString] ||= [];
      memo[sundayString].push(entry);

      return memo;
    },
    {},
  );
  const weeks = Object.keys(entriesByWeek)
    .sort((a, b) => b.localeCompare(a))
    .map((dateString) => ({
      dateString,
      work: entriesByWeek[dateString].filter((entry) => entry.type === "work"),
      learnings: entriesByWeek[dateString].filter(
        (entry) => entry.type === "learning",
      ),
      interestingThings: entriesByWeek[dateString].filter(
        (entry) => entry.type === "interesting-thing",
      ),
    }));

  return (
    <>
      {session.isAdmin ? (
        <div className="border p-3">
          <p className="italic">Create a new entry</p>
          <div className="mt-2">
            <EntryForm />
          </div>
        </div>
      ) : null}
      <div className="mt-12 space-y-12">
        {weeks.map((week) => (
          <div key={week.dateString}>
            <p className="font-bold">
              Week of {format(parseISO(week.dateString), "MMMM do")}
            </p>
            <div className="mt-3 space-y-4">
              {week.work.length ? (
                <div>
                  <p>Work</p>
                  <ul className="ml-8 list-disc">
                    {week.work.map((entry) => (
                      <EntryListItem
                        key={entry.id}
                        entry={entry}
                        canEdit={session.isAdmin}
                      />
                    ))}
                  </ul>
                </div>
              ) : null}
              {week.learnings.length ? (
                <div>
                  <p>Learning</p>
                  <ul className="ml-8 list-disc">
                    {week.learnings.map((entry) => (
                      <EntryListItem
                        key={entry.id}
                        entry={entry}
                        canEdit={session.isAdmin}
                      />
                    ))}
                  </ul>
                </div>
              ) : null}
              {week.interestingThings.length ? (
                <div>
                  <p>Interesting things</p>
                  <ul className="ml-8 list-disc">
                    {week.interestingThings.map((entry) => (
                      <EntryListItem
                        key={entry.id}
                        entry={entry}
                        canEdit={session.isAdmin}
                      />
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function EntryListItem({
  entry,
  canEdit,
}: {
  entry: SerializeFrom<typeof loader>["entries"][number];
  canEdit: boolean;
}) {
  return (
    <li className="group">
      {entry.text}
      {canEdit ? (
        <Link
          to={`/entries/${entry.id}/edit`}
          className="ml-2 text-blue-500 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
        >
          Edit
        </Link>
      ) : null}
    </li>
  );
}
