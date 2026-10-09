// SPDX-License-Identifier: AGPL-3.0-only
/*
 * Copyright (C) 2026 Rafael Fernandes <rafern@protonmail.com>
 */

import type { Route } from "./+types/home";
import { ConfigurableTranslitBox } from "../components/configurable-translit-box";

export function meta(_metaArgs: Route.MetaArgs) {
  return [
    { title: "Web Translit" },
    { name: "description", content: "Self-hosted transliteration tool for the web" },
  ];
}

export default function Home() {
  return <ConfigurableTranslitBox />;
}
