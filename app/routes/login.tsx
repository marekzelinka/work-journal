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
    <>
      {data.isAdmin ? (
        <p>You&apos;re signed in!</p>
      ) : (
        <Form method="POST">
          <input
            type="email"
            name="email"
            id="email"
            className="text-gray-900"
            placeholder="Email"
            aria-label="Email"
          />
          <input
            type="password"
            name="password"
            id="password"
            className="text-gray-900"
            placeholder="Password"
            aria-label="Password"
          />
          <button
            type="submit"
            className="inline-flex bg-blue-500 px-3 py-2 font-medium text-white"
          >
            Login
          </button>
          {actionData?.error ? (
            <p className="mt-4 font-medium text-red-500">{actionData.error}</p>
          ) : null}
        </Form>
      )}
    </>
  );
}
