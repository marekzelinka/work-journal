import { invariant } from "@epic-web/invariant";
import { Button, Input } from "@headlessui/react";
import { KeyIcon } from "@heroicons/react/20/solid";
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
        <div className="space-y-6">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <KeyIcon className="size-5 text-gray-400" />
            </div>
            <Input
              type="password"
              name="password"
              id="password"
              className="block w-full rounded-md border-0 bg-white/5 py-1.5 pl-10 text-white shadow-sm ring-1 ring-inset ring-white/10 data-[focus]:ring-2 data-[focus]:ring-inset data-[focus]:ring-sky-500 sm:text-sm/6"
              placeholder="Password"
              aria-label="Password"
            />
          </div>
          <Button
            type="submit"
            className="w-full rounded-md bg-sky-500 px-3 py-2 text-sm font-semibold text-white shadow-sm data-[hover]:bg-sky-400 data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-sky-500"
          >
            Login
          </Button>
        </div>
        {actionData?.error ? (
          <p className="mt-4 font-medium text-red-500">{actionData.error}</p>
        ) : null}
      </Form>
    </div>
  );
}
