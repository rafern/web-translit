// SPDX-License-Identifier: AGPL-3.0-only
/*
 * Copyright (C) 2026 Rafael Fernandes <rafern@protonmail.com>
 */

import { type RouteConfig, index, route } from "@react-router/dev/routes";

export interface NamedRoute {
  path: string,
  name: string,
}

export const namedRoutes = [
  { path: '/', name: 'Tool' },
  { path: '/packages', name: 'Packages' },
] as const satisfies ReadonlyArray<NamedRoute>;

export default [
  index("routes/home.tsx"),
  route("/packages", "routes/packages.tsx"),
] satisfies RouteConfig;
