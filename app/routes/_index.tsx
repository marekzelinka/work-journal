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

type LoaderData = SerializeFrom<typeof loader>;
type Entry = LoaderData["entries"][number];

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
        <div className="mb-8 rounded-lg border border-gray-700/30 bg-gray-800/50 p-4 lg:mb-20 lg:p-6">
          <p className="text-sm font-medium text-gray-500 lg:text-base">
            Create a new entry
          </p>
          <div className="mt-4">
            <EntryForm />
          </div>
        </div>
      ) : null}
      <div className="mt-12 space-y-12 border-l-2 border-sky-500/[.15] pl-5 lg:space-y-20 lg:pl-8">
        {weeks.map((week) => (
          <div key={week.dateString} className="relative">
            <div className="absolute left-[-34px] rounded-full bg-gray-900 p-2 lg:left-[-46px]">
              <div className="size-[10px] rounded-full border border-sky-500 bg-gray-900" />
            </div>
            <p className="pt-[5px] text-xs font-semibold uppercase tracking-wider text-sky-500 lg:pt-[3px] lg:text-sm">
              Week of {format(parseISO(week.dateString), "MMMM d, yyyy")}
            </p>
            <div className="mt-6 space-y-8 lg:space-y-12">
              <EntryList entries={week.work} label="Work" />
              <EntryList entries={week.learnings} label="Learnings" />
              <EntryList
                entries={week.interestingThings}
                label="Interesting things"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function EntryList({ entries, label }: { entries: Entry[]; label: string }) {
  return !entries.length ? null : (
    <div>
      <p className="font-semibold text-white">{label}</p>
      <ul className="mt-4 space-y-6">
        {entries.map((entry) => (
          <EntryListItem key={entry.id} entry={entry} />
        ))}
      </ul>
    </div>
  );
}

function EntryListItem({ entry }: { entry: Entry }) {
  const { session } = useLoaderData<typeof loader>();

  return (
    <li className="group leading-7">
      {entry.text}
      {session.isAdmin ? (
        <Link
          to={`/entries/${entry.id}/edit`}
          className="ml-2 text-sky-500 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
        >
          Edit
        </Link>
      ) : null}
    </li>
  );
}
