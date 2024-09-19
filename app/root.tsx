import {
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
import { getSignedAdmin, logout } from "./lib/session.server";
import "./tailwind.css";

export const meta: MetaFunction<typeof loader> = ({ error }) => {
  return [{ title: error ? "Oh no!" : "Work Journal" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const isAdmin = await getSignedAdmin(request);

  return { isAdmin };
}

export async function action({ request }: ActionFunctionArgs) {
  return await logout(request);
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <p className="text-3xl">Whoops!</p>
      {isRouteErrorResponse(error) ? (
        <p>
          {error.status} - {error.statusText || error.data}
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
  const { isAdmin } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-full flex-col">
      <nav className="bg-gray-900">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="border-b border-gray-700">
            <div className="flex h-16 items-center justify-between max-sm:px-4">
              <div className="flex flex-none items-center">
                <Link
                  to="https://www.linkedin.com/in/marekzelinka/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm uppercase lg:text-lg"
                >
                  <span className="text-gray-500">Marek</span>
                  <span className="font-semibold text-gray-200">Zelinka</span>
                </Link>
              </div>
              <div className="ml-4 flex items-center md:ml-6">
                {isAdmin ? (
                  <Form method="POST">
                    <button
                      type="submit"
                      className="rounded bg-white/10 px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
                    >
                      Sign out
                    </button>
                  </Form>
                ) : (
                  <Link
                    to="/login"
                    className="rounded bg-white/10 px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <header className="py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
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
      <main className="flex-1 pb-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      <footer>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="border-t border-gray-700 py-5 max-sm:px-4 max-sm:text-center">
            <p className="text-sm text-gray-500">
              <span className="block sm:inline">&copy; 2024 Marek Zelinka</span>{" "}
              <span className="block sm:inline">All rights reserved.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
