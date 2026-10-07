import { useState, type ChangeEvent, useMemo } from "react";
import { type TranslitCompiledRules } from "~/translit-logic/rule";
import { translit } from "~/translit-logic/translit";
import { OutBox } from "./out-box";
import { WarnBox } from "./warn-box";
import { type SelectedWarns } from "~/utils/callbacks";

export function TranslitBox({ compRules }: { compRules: TranslitCompiledRules | undefined }) {
  const [inValue, setInValue] = useState("");
  const [selectedWarns, setSelectedWarns] = useState<SelectedWarns>([]);
  const result = useMemo(() => {
    if (compRules) {
      return translit(inValue, compRules);
    } else {
      return undefined;
    }
  }, [inValue, compRules]);

  function onTextChange(e: ChangeEvent<HTMLTextAreaElement, HTMLTextAreaElement>) {
    setSelectedWarns([]);
    setInValue(e.target.value);
  }

  return (
    <article className="flex flex-1 flex-col gap-8 w-full overflow-y-hidden">
      <div className="flex flex-2 flex-col md:flex-row gap-8 text-slate-950 overflow-y-hidden">
        <textarea
          className="flex-1 bg-slate-50 p-1 placeholder:text-slate-500 placeholder:italic resize-none rounded-xs"
          autoComplete="false"
          autoCorrect="false"
          spellCheck="false"
          value={inValue}
          onChange={onTextChange}
          disabled={result === undefined}
          placeholder="Type original text here"
        />
        <OutBox
          result={result}
          selectedWarns={selectedWarns}
          setSelectedWarns={(warns) => setSelectedWarns(warns)}
        />
      </div>
      <WarnBox
        result={result}
        selectedWarns={selectedWarns}
        setSelectedWarns={(warns) => setSelectedWarns(warns)}
      />
    </article>
  );
}
