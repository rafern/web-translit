import { useState, type ChangeEvent, useMemo } from 'react';
import { TRANSLIT_RULES_NONSTANDARD_LATIN_RUCYRILLIC } from '~/translit-logic/builtin-rules';
import { compileRules } from '~/translit-logic/rule';
import { translit } from '~/translit-logic/translit';
import { OutBox } from './out-box';
import { WarnBox } from './warn-box';

export function TranslitBox() {
  const [inValue, setInValue] = useState('');
  // TODO settable rules
  const [rules, _setRules] = useState(TRANSLIT_RULES_NONSTANDARD_LATIN_RUCYRILLIC);
  const compRules = useMemo(() => compileRules(rules), [rules]);
  const result = useMemo(() => translit(inValue, compRules), [inValue, compRules]);

  function onTextChange(e: ChangeEvent<HTMLTextAreaElement, HTMLTextAreaElement>) {
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
        <OutBox result={result} />
      </div>
      <WarnBox result={result} />
    </article>
  );
}
