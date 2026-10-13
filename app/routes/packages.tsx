// SPDX-License-Identifier: AGPL-3.0-only
/*
 * Copyright (C) 2026 Rafael Fernandes <rafern@protonmail.com>
 */

import type { Route } from "./+types/home";

export function meta(_metaArgs: Route.MetaArgs) {
  return [
    { title: "Web Translit - Packages" },
    { name: "description", content: "Self-hosted transliteration tool for the web" },
  ];
}

export default function Home() {
  return <p>placeholder</p>;
}
