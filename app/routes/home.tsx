// SPDX-License-Identifier: AGPL-3.0-only
/*
 * Copyright (C) 2026 Rafael Fernandes <rafern@protonmail.com>
 */

import type { Route } from "./+types/home";
import { ConfigurableTranslitBox } from "../components/configurable-translit-box";
import { packagesMiddleware } from "~/middleware/packages";
import { packagesContext } from "~/context";

export function meta(_metaArgs: Route.MetaArgs) {
  return [
    { title: "Web Translit" },
    { name: "description", content: "Self-hosted transliteration tool for the web" },
  ];
}

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [
  packagesMiddleware,
];

export async function clientLoader({ context }: Route.ClientLoaderArgs) {
  return context.get(packagesContext);
}

// TODO https://reactrouter.com/start/framework/route-module#hydratefallback

export default function Home({ loaderData }: Route.ComponentProps) {
  return <ConfigurableTranslitBox packagesState={loaderData} />;
}
