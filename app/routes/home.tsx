import type { Route } from "./+types/home";
import { TranslitBox } from "../translit-box/translit-box";
import builtin from '../translit-logic/builtin.json';
import { useMemo } from "react";
import { validatePackage } from "~/translit-logic/package";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Web Translit" },
    { name: "description", content: "Self-hosted transliteration tool for the web" },
  ];
}

export default function Home() {
  const packages = useMemo(() => {
    return {
      builtin: validatePackage(builtin),
    };
  }, []);

  return <main className="flex flex-col items-center pt-8 pb-4 px-8 gap-8 h-full">
    <h1 className="text-4xl">Web Translit</h1>
    <TranslitBox packages={packages} />
  </main>;
}
