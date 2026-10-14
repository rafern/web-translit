// SPDX-License-Identifier: AGPL-3.0-only
/*
 * Copyright (C) 2026 Rafael Fernandes <rafern@protonmail.com>
 */

import { packagesMiddleware } from "~/middleware/packages";
import type { Route } from "./+types/home";
import { packagesContext } from "~/context";
import { useState } from "react";

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
  // FIXME can't stop options from overflowing. maybe it would be better to use
  //       a component library instead of using native select/option elements?
  const [selPkgId, setSelPkgId] = useState('');
  const options: React.JSX.Element[] = [
    <option key="none" value="" className="bg-slate-50 text-slate-950">None</option>
  ];

  const pkgs = loaderData.packages;
  for (const id of Object.getOwnPropertyNames(pkgs)) {
    const pkg = pkgs[id];
    options.push(<option key={`id-${id}`} value={id} className="bg-slate-50 text-slate-950">{pkg.name}</option>);
  }

  let tabContent: React.JSX.Element;
  if (selPkgId === '') {
    tabContent = <div className="h-full flex flex-col items-center justify-center select-none">
      <b className="text-2xl">No package selected</b>
      <span>Select a loaded package or import by loading a local file</span>
    </div>
  } else {
    tabContent = <span>placeholder for package ID {selPkgId}</span>
  }

  // TODO import button functionality
  return (
    <article className="flex flex-col flex-1">
      <div className="flex flex-row gap-2 max-w-full overflow-x-hidden select-none">
        <button className="px-2 bg-slate-700 hover:bg-slate-600 cursor-pointer text-white rounded-t-sm border-x-1 border-t-1 border-slate-500">Import</button>
        <div className="flex-1 overflow-x-hidden">
          <select className="select-none bg-slate-700 hover:bg-slate-600 text-white cursor-pointer px-2 max-w-full overflow-x-hidden text-ellipsis rounded-t-sm border-x-1 border-t-1 border-slate-500" value={selPkgId} onChange={(e) => setSelPkgId(e.target.value)}>
            {options}
          </select>
        </div>
      </div>
      <section className="flex-1 overflow-y-auto bg-slate-50 text-black p-4 shadow-md border-1 border-slate-500 rounded-b-sm">
        {tabContent}
      </section>
    </article>
  );
}
