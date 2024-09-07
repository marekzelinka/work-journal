import { PrismaClient } from "@prisma/client";
import {
  type ActionFunctionArgs,
  type MetaFunction,
  type SerializeFrom,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { format, parseISO, startOfWeek } from "date-fns";
import { EntryForm } from "~/components/entry-form";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader() {
  const db = new PrismaClient();

  const entries = await db.entry.findMany();

  return entries.map((entry) => ({
    ...entry,
    date: entry.date.toISOString().substring(0, 10),
  }));
}

export async function action({ request }: ActionFunctionArgs) {
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

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return await db.entry.create({ data: { date: new Date(date), type, text } });
}

export default function Component() {
  const entries = useLoaderData<typeof loader>();

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
      <div className="border p-3">
        <p className="italic">Create a new entry</p>
        <div className="mt-2">
          <EntryForm />
        </div>
      </div>
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
                      <EntryListItem key={entry.id} entry={entry} />
                    ))}
                  </ul>
                </div>
              ) : null}
              {week.learnings.length ? (
                <div>
                  <p>Learning</p>
                  <ul className="ml-8 list-disc">
                    {week.learnings.map((entry) => (
                      <EntryListItem key={entry.id} entry={entry} />
                    ))}
                  </ul>
                </div>
              ) : null}
              {week.interestingThings.length ? (
                <div>
                  <p>Interesting things</p>
                  <ul className="ml-8 list-disc">
                    {week.interestingThings.map((entry) => (
                      <EntryListItem key={entry.id} entry={entry} />
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
}: {
  entry: SerializeFrom<typeof loader>[number];
}) {
  return (
    <li className="group">
      {entry.text}
      <Link
        to={`/entries/${entry.id}/edit`}
        className="ml-2 text-blue-500 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
      >
        Edit
      </Link>
    </li>
  );
}
