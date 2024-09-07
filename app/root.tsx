import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { ReactNode } from "react";
import "./tailwind.css";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-900 text-gray-200 antialiased">
        <div className="p-10">
          <h1 className="text-5xl">Work Journal</h1>
          <p className="mt-2 text-lg text-gray-400">
            Learnings and doings. Updated weekly.
          </p>
          <div className="mt-8">{children}</div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Component() {
  return <Outlet />;
}
