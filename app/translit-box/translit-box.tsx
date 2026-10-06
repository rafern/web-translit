import { useState, type ChangeEvent, useMemo } from 'react';
import { compileRules } from '~/translit-logic/rule';
import { translit } from '~/translit-logic/translit';
import { OutBox } from './out-box';
import { WarnBox } from './warn-box';
import { type SelectedWarns } from '~/utils/callbacks';
import { type TranslitPackage } from '~/translit-logic/package';

export function TranslitBox({ packages }: { packages: Record<string, TranslitPackage> }) {
  const [inValue, setInValue] = useState('');
  const [selectedWarns, setSelectedWarns] = useState<SelectedWarns>([]);
  // TODO settable rules
  const [rules, _setRules] = useState(packages['builtin'].rules!['nonstd-latin-rucyrillic']);
  // TODO change on `packages` too?
  const compRules = useMemo(() => compileRules(rules, packages), [rules]);
  const result = useMemo(() => translit(inValue, compRules), [inValue, compRules]);

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
          placeholder='Type original text here'
        />
        <OutBox result={result} selectedWarns={selectedWarns} setSelectedWarns={(warns) => setSelectedWarns(warns)} />
      </div>
      <WarnBox result={result} selectedWarns={selectedWarns} setSelectedWarns={(warns) => setSelectedWarns(warns)} />
    </article>
  );
}
