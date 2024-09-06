import { PrismaClient } from "@prisma/client";
import {
  redirect,
  type ActionFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Form } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

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

  await db.entry.create({ data: { date: new Date(date), type, text } });

  return redirect("/");
}

export default function Component() {
  return (
    <div className="p-10">
      <h1 className="text-5xl">Work Journal</h1>
      <p className="mt-2 text-lg text-gray-400">
        Learnings and doings. Updated weekly.
      </p>
      <div className="mt-8 border p-3">
        <p className="italic">Create a new entry</p>
        <Form method="POST" className="mt-2">
          <div>
            <div>
              <input
                type="date"
                name="date"
                id="date"
                className="text-gray-500"
              />
            </div>
            <div className="mt-4 flex gap-4">
              <label htmlFor="work" className="flex items-center gap-1">
                <input type="radio" name="type" id="work" value="work" />
                Work
              </label>
              <label htmlFor="learning" className="flex items-center gap-1">
                <input
                  type="radio"
                  name="type"
                  id="learning"
                  value="learning"
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
                />
                Interesting thing
              </label>
            </div>
          </div>
          <div className="mt-4">
            <textarea
              name="text"
              id="text"
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
              Save
            </button>
          </div>
        </Form>
      </div>
      <div className="mt-8">
        <p className="font-bold">
          Week of February 20<sup>th</sup>
        </p>
        <div className="mt-3 space-y-4">
          <div>
            <p>Work</p>
            <ul className="ml-8 list-disc">
              <li>First item</li>
              <li>Second item</li>
            </ul>
          </div>
          <div>
            <p>Learnings</p>
            <ul className="ml-8 list-disc">
              <li>First item</li>
              <li>Second item</li>
            </ul>
          </div>
          <div>
            <p>Interesting things</p>
            <ul className="ml-8 list-disc">
              <li>First item</li>
              <li>Second item</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
