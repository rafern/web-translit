// SPDX-License-Identifier: AGPL-3.0-only
/*
 * Copyright (C) 2026 Rafael Fernandes <rafern@protonmail.com>
 */

import builtin from "../translit-logic/builtin.json";
import { useMemo, useState } from "react";
import { type TranslitPackage, maybeValidatePackageInto } from "~/translit-logic/package";
import { type TranslitCompiledRules, maybeCompileRulesInto } from "~/translit-logic/rule";
import { TranslitBox } from "./translit-box";

export function ConfigurableTranslitBox() {
  // TODO way to add a package from a file, and manage/inspect existing packages
  const packagesState = useMemo(() => {
    const packages: Record<string, TranslitPackage> = {};
    const errors: Array<string> = [];
    maybeValidatePackageInto(packages, errors, builtin);
    // TODO load additional packages here (from localStorage?)

    const allCompRules: Record<string, TranslitCompiledRules> = {};
    for (const packageID of Object.getOwnPropertyNames(packages)) {
      const pkg = packages[packageID];
      if (!pkg.rules) continue;

      for (const rulesID of Object.getOwnPropertyNames(pkg.rules!)) {
        maybeCompileRulesInto(allCompRules, errors, packageID, rulesID, packages);
      }
    }

    return { packages, errors, allCompRules };
  }, []);

  const [selectedRulesID, setSelectedRulesID] = useState("none");

  const options: Array<React.JSX.Element> = [
    <option key="none" value="none" className="bg-slate-50 text-slate-950">
      None
    </option>,
  ];

  for (const namespacedRulesID of Object.getOwnPropertyNames(packagesState.allCompRules)) {
    const compRules = packagesState.allCompRules[namespacedRulesID];
    options.push(
      <option
        key={namespacedRulesID}
        value={namespacedRulesID}
        className="bg-slate-50 text-slate-950"
      >
        {compRules.origRules.name}
      </option>,
    );
  }

  const compRules = useMemo(
    () => packagesState.allCompRules[selectedRulesID],
    [packagesState, selectedRulesID],
  );

  return (
    <article className="flex flex-1 flex-col gap-2 w-full overflow-y-hidden">
      <label>
        Transliteration rules:
        <select value={selectedRulesID} onChange={(e) => setSelectedRulesID(e.target.value)}>
          {options}
        </select>
      </label>
      <TranslitBox compRules={compRules} />
    </article>
  );
}
