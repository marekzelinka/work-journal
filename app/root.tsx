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
  return [{ title: error ? "Oh no!" : "Work Journal" }];
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
      <body className="h-full bg-gray-900 text-gray-400 antialiased [color-scheme:dark] [font-synthesis:none]">
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
    <>
      <nav className="px-4 lg:px-6">
        <div className="mx-auto max-w-xl pt-4 lg:max-w-7xl lg:border-b lg:border-gray-800 lg:pb-5 lg:pt-5">
          <div className="flex items-center justify-between">
            <Link
              to="https://www.linkedin.com/in/marekzelinka/"
              className="text-sm uppercase lg:text-lg"
            >
              <span className="text-gray-500">Marek</span>
              <span className="font-semibold text-gray-200">Zelinka</span>
            </Link>
            {session.isAdmin ? (
              <Form method="POST">
                <button
                  type="submit"
                  className="text-sm font-medium text-gray-500 hover:text-gray-200"
                >
                  Sign out
                </button>
              </Form>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-gray-500 hover:text-gray-200"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
      <header className="my-20 lg:my-28">
        <div className="mx-auto max-w-xl px-4 lg:max-w-7xl lg:px-6">
          <div className="text-center">
            <h1 className="text-5xl font-semibold tracking-tighter text-white lg:text-7xl">
              <Link to="/">Work Journal</Link>
            </h1>
            <p className="mt-2 tracking-tight text-gray-500 lg:mt-4 lg:text-2xl">
              Doings and learnings. Updated weekly.
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-8 lg:px-6">
        <Outlet />
      </main>
    </>
  );
}
