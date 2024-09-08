import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import type { ReactNode } from "react";
import { destroySession, getSession } from "./session";
import "./tailwind.css";

export const meta: MetaFunction<typeof loader> = ({ error }) => {
  return [{ title: error ? "Oh no!" : "New Remix App" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("cookie"));

  return { session: session.data };
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("cookie"));

  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <p className="text-3xl">Whoops!</p>
      {isRouteErrorResponse(error) ? (
        <p>
          {error.status} - {error.statusText}
        </p>
      ) : error instanceof Error ? (
        <p>{error.message}</p>
      ) : (
        <p>Something bad happend.</p>
      )}
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-gray-900 text-gray-200 antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Component() {
  const { session } = useLoaderData<typeof loader>();

  return (
    <div className="p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl">Work Journal</h1>
          <p className="mt-2 text-lg text-gray-400">
            Learnings and doings. Updated weekly.
          </p>
        </div>
        {session.isAdmin ? (
          <Form method="POST">
            <button type="submit">Sign out</button>
          </Form>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
