import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { commitSession, getSession } from "~/session";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("cookie"));

  return session.data;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { email, password } = Object.fromEntries(formData);

  if (email === "sam@buildui.com" && password === "password") {
    const session = await getSession();
    session.set("isAdmin", true);

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } else {
    let error: string;

    if (!email) {
      error = "Email is required.";
    } else if (!password) {
      error = "Password is required.";
    } else {
      error = "Invalid login";
    }

    return json({ error }, { status: 401 });
  }
}

export default function Component() {
  const data = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();

  return (
    <div className="mx-auto mt-8 max-w-xs lg:max-w-sm">
      {data.isAdmin ? (
        <p>You&apos;re signed in!</p>
      ) : (
        <Form method="POST">
          <div className="space-y-2">
            <input
              type="email"
              name="email"
              id="email"
              className="w-full rounded-md border-gray-700 bg-gray-800 text-white focus:border-sky-600 focus:ring-sky-600"
              placeholder="Email"
              aria-label="Email"
            />
            <input
              type="password"
              name="password"
              id="password"
              className="w-full rounded-md border-gray-700 bg-gray-800 text-white focus:border-sky-600 focus:ring-sky-600"
              placeholder="Password"
              aria-label="Password"
            />
          </div>
          <div className="mt-8">
            <button
              type="submit"
              className="w-full rounded-md bg-sky-600 px-3 py-2 font-medium text-white focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Login
            </button>
          </div>
          {actionData?.error ? (
            <p className="mt-4 font-medium text-red-500">{actionData.error}</p>
          ) : null}
        </Form>
      )}
    </div>
  );
}
