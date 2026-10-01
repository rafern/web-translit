import { useState, type ChangeEvent } from 'react';
import { TRANSLIT_RULES_NONSTANDARD_LATIN_RUCYRRILIC } from '~/translit-logic/builtin-rules';
import { translit, type TranslitResult } from '~/translit-logic/translit';

const ROWS = 8;

function OutBoxText({ result }: { result: TranslitResult }) {
  if (result.text.length === 0) {
    return <p className="h-48 text-slate-500 select-none italic">Transliterated text will show up here</p>
  } else {
    // FIXME: Each child in a list should have a unique "key" prop
    const spans: Array<React.JSX.Element> = [];

    for (const range of result.ranges) {
      // TODO handle spaces and newlines properly
      const spanText = result.text.substring(range.start, range.end);
      spans.push(<span className={range.warnIdxs.length > 0 ? 'underline decoration-wavy decoration-amber-500' : ''}>{spanText}</span>);
    }

    return <p className="h-48">{spans}</p>;
  }
}

function OutBox({ result }: { result: TranslitResult }) {
  // FIXME how do you make the "select all" action (ctrl+a) select only text in
  //       this div? do i just give up and add a "copy text" button?
  return <div className="flex-1 bg-slate-50 p-1 rounded-xs overflow-y-auto overflow-x-hidden text-pretty wrap-break-word">
    <OutBoxText result={result}/>
  </div>
}

function WarnBox({ result }: { result: TranslitResult }) {
  if (result.text.length === 0) return;

  if (result.warns.length === 0) {
    return <p>Transliterated with no warnings</p>;
  } else {
    return <p>Transliterated with {result.warns.length} warning{result.warns.length === 1 ? '' : 's'}:</p>;
  }

  // TODO list warnings
}

export function TranslitBox() {
  const [inValue, setInValue] = useState('');
  const result = translit(inValue, TRANSLIT_RULES_NONSTANDARD_LATIN_RUCYRRILIC);

  function onTextChange(e: ChangeEvent<HTMLTextAreaElement, HTMLTextAreaElement>) {
    setInValue(e.target.value);
  }

  return (
    <article className="flex flex-col text-16/2 gap-8 w-full">
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
        <OutBox result={result} />
      </div>
      <WarnBox result={result} />
    </article>
  );
}
