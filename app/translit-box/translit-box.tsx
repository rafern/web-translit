import { useState, type ChangeEvent } from 'react';
import { TRANSLIT_RULES_NONSTANDARD_LATIN_RUCYRRILIC } from '~/translit-logic/builtin-rules';
import { translit } from '~/translit-logic/translit';

const ROWS = 8;

function OutBox({ text }: { text: string }) {
  if (text.length === 0) {
    return <p className="h-48 text-slate-500 select-none italic">Transliterated text will show up here</p>
  } else {
    return <p className="h-48">{text}</p>
  }
}

export function TranslitBox() {
  const [inValue, setInValue] = useState('');
  const result = translit(inValue, TRANSLIT_RULES_NONSTANDARD_LATIN_RUCYRRILIC);

  function onTextChange(e: ChangeEvent<HTMLTextAreaElement, HTMLTextAreaElement>) {
    setInValue(e.target.value);
  }

  return (
    <div className="flex flex-col text-16/2 gap-8 w-full">
      <div className="flex flex-col md:flex-row gap-8 text-slate-950">
        <textarea
          className="flex-1 bg-slate-50 p-1 placeholder:text-slate-500 placeholder:italic resize-none rounded-xs"
          autoComplete="false"
          autoCorrect="false"
          spellCheck="false"
          rows={ROWS}
          value={inValue}
          onChange={onTextChange}
          placeholder='Type original text here'
        />
        <div className="flex-1 bg-slate-50 p-1 rounded-xs overflow-y-auto overflow-x-hidden text-pretty wrap-break-word">
          <OutBox text={result.text} />
        </div>
      </div>
    </div>
  );
}
