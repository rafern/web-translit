// SPDX-License-Identifier: AGPL-3.0-only
/*
 * Copyright (C) 2026 Rafael Fernandes <rafern@protonmail.com>
 */

import { packagesMiddleware } from "~/middleware/packages";
import type { Route } from "./+types/home";
import { packagesContext } from "~/context";

export function meta(_metaArgs: Route.MetaArgs) {
  return [
    { title: "Web Translit - Packages" },
    { name: "description", content: "Self-hosted transliteration tool for the web" },
  ];
}

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [
  packagesMiddleware,
];

export async function clientLoader({ context }: Route.ClientLoaderArgs) {
  return context.get(packagesContext);
}

export default function Packages({ loaderData }: Route.ComponentProps) {
  // TODO
  return <p>placeholder</p>;
}
