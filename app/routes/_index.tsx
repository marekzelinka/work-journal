import { CloudIcon } from "@heroicons/react/20/solid";
import { PrismaClient } from "@prisma/client";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Link, useFetchers, useLoaderData } from "@remix-run/react";
import { compareDesc, format, parseISO, startOfWeek } from "date-fns";
import { EntryForm } from "~/components/entry-form";
import { getSession } from "~/session";

const DELAY = 500;

type Entry = Awaited<ReturnType<typeof loader>>["entries"][number];

export async function loader({ request }: LoaderFunctionArgs) {
  await new Promise((resolve) => setTimeout(resolve, DELAY));

  const session = await getSession(request.headers.get("cookie"));

  const db = new PrismaClient();

  const entries = await db.entry.findMany({
    select: { id: true, date: true, type: true, text: true },
    orderBy: { date: "desc" },
  });

  return {
    session: session.data,
    entries: entries.map((entry) => ({
      ...entry,
      date: entry.date.toISOString().substring(0, 10),
    })),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  await new Promise((resolve) => setTimeout(resolve, DELAY));

  const session = await getSession(request.headers.get("cookie"));

  if (!session.data.isAdmin) {
    throw new Response("Not authenticated", {
      status: 401,
      statusText: "Not authenticated",
    });
  }

  const db = new PrismaClient();

  const fromData = await request.formData();
  const { id, date, type, text } = validate(Object.fromEntries(fromData));

  return await db.entry.create({
    data: { id, date: new Date(date), type, text },
  });
}

export default function Component() {
  const { session, entries } = useLoaderData<typeof loader>();

  const entriesById = new Map(entries.map((entry) => [entry.id, entry]));

  // Merge optimistic and existing entries
  const optimisticEntries = useOptimisticEntries();
  for (const optimisticEntry of optimisticEntries) {
    const entry = entriesById.get(optimisticEntry.id);
    const merged = entry ? { ...entry, ...optimisticEntry } : optimisticEntry;
    entriesById.set(optimisticEntry.id, merged);
  }

  const entriesToShow = [...entriesById.values()].sort((a, b) =>
    compareDesc(a.date, b.date),
  );

  // Group entries by week
  const entriesByWeek: Record<string, Array<(typeof entries)[number]>> = {};
  for (const entry of entriesToShow) {
    const sunday = startOfWeek(entry.date);
    const sundayString = format(sunday, "yyyy-MM-dd");

    entriesByWeek[sundayString] ||= [];
    entriesByWeek[sundayString].push(entry);
  }

  const weeks = Object.keys(entriesByWeek).map((dateString) => ({
    dateString,
    entriesByType: {
      Work: entriesByWeek[dateString].filter((entry) => entry.type === "work"),
      Learnings: entriesByWeek[dateString].filter(
        (entry) => entry.type === "learning",
      ),
      "Interesting Things": entriesByWeek[dateString].filter(
        (entry) => entry.type === "interesting-thing",
      ),
    },
  }));

  return (
    <>
      {session.isAdmin ? (
        <div className="rounded-lg border border-gray-700/30 bg-gray-800/50 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 lg:text-base">
              Create a new entry
            </p>
            {optimisticEntries.length > 0 && (
              <CloudIcon className="size-4 text-gray-500" />
            )}
          </div>
          <div className="mt-4 lg:mt-2">
            <EntryForm />
          </div>
        </div>
      ) : null}
      <div className="mt-12 lg:mt-20">
        <ol className="space-y-12 border-l-2 border-sky-500/[.15] pl-5 lg:space-y-20 lg:pl-8">
          {weeks.map((week) => (
            <li key={week.dateString} className="relative">
              <div className="absolute left-[-34px] rounded-full bg-gray-900 p-2 lg:left-[-46px]">
                <div className="size-[10px] rounded-full border border-sky-500 bg-gray-900" />
              </div>
              <p className="pt-[5px] text-xs font-semibold uppercase tracking-wider text-sky-500 lg:pt-[3px] lg:text-sm">
                Week of {format(parseISO(week.dateString), "MMMM d, yyyy")}
              </p>
              <div className="mt-6 space-y-8 lg:space-y-12">
                {Object.entries(week.entriesByType).map(([type, entries]) =>
                  !entries.length ? null : (
                    <div key={type}>
                      <p className="font-semibold text-white">{type}</p>
                      <ul className="mt-4 space-y-6">
                        {entries.map((entry) => (
                          <EntryListItem key={entry.id} entry={entry} />
                        ))}
                      </ul>
                    </div>
                  ),
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

function useOptimisticEntries() {
  type OptimisticEntryFetcher = ReturnType<typeof useFetchers>[number] & {
    formData: FormData;
  };

  return useFetchers()
    .filter(
      (fetcher): fetcher is OptimisticEntryFetcher =>
        fetcher.formData !== undefined,
    )
    .map((fetcher): Entry => {
      const { id, date, type, text } = validate(
        Object.fromEntries(fetcher.formData),
      );

      return { id, date, type, text };
    });
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

function validate(data: Record<string, FormDataEntryValue>) {
  const { id, date, type, text } = data;

  if (
    typeof id !== "string" ||
    typeof date !== "string" ||
    typeof type !== "string" ||
    typeof text !== "string"
  ) {
    throw new Error("Bad data");
  }

  return { id, date, type, text };
}
