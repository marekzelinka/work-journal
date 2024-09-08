import { invariant } from "@epic-web/invariant";
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { createAdminSession, getSignedAdmin } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const isAdmin = await getSignedAdmin(request);
  if (isAdmin) {
    return redirect("/");
  }

  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const password = formData.get("password");

  if (!password) {
    return json({ error: "Password is required." }, { status: 400 });
  }

  invariant(process.env.PASSWORD, "PASSWORD must be set");
  if (password !== process.env.PASSWORD) {
    return json({ error: "Password is incorrect." }, { status: 400 });
  }

  return createAdminSession({ request, redirectTo: "/" });
}

export default function Component() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="mx-auto max-w-xs lg:max-w-sm">
      <Form method="POST">
        <div className="space-y-2">
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
    </div>
  );
}
