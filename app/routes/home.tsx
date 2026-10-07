import type { Route } from "./+types/home";
import { ConfigurableTranslitBox } from "../components/configurable-translit-box";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Web Translit" },
    { name: "description", content: "Self-hosted transliteration tool for the web" },
  ];
}

export default function Home() {
  return <main className="flex flex-col items-center pt-8 pb-4 px-8 gap-8 h-full">
    <h1 className="text-4xl">Web Translit</h1>
    <ConfigurableTranslitBox />
  </main>;
}
