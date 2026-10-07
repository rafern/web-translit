import { useEffect, useRef } from 'react';
import { TranslitResultWarnCtxType, type TranslitResult } from '~/translit-logic/translit';
import { type SelectedWarns, type WarnSelectCallback } from '~/utils/callbacks';
import { extractNewlines, fancyCharIdxRange, fancyJoin } from '~/utils/text';

function WarnBoxEntry({ warnIdx, content, selectedWarns, setSelectedWarns }: { warnIdx: number, content: string, selectedWarns: SelectedWarns, setSelectedWarns: WarnSelectCallback }) {
  const focusRef = useRef(null);
  useEffect(() => {
    if (selectedWarns.indexOf(warnIdx) !== -1) {
      // FIXME: how do you avoid a cast here?
      (focusRef.current! as HTMLDivElement).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [warnIdx, selectedWarns]);

  let className = 'text-amber-600 border-amber-600 border-1 rounded-md px-1 py-1 text-base/4';
  if (selectedWarns.indexOf(warnIdx) !== -1) {
    className += ' bg-amber-200';
  } else {
    className += ' bg-amber-100';
  }

  return <div className={className} ref={focusRef} onMouseEnter={() => setSelectedWarns([warnIdx])} onMouseLeave={() => setSelectedWarns([])}>
    {content}
  </div>
}

export function WarnBox({ result, selectedWarns, setSelectedWarns }: { result: TranslitResult | undefined, selectedWarns: SelectedWarns, setSelectedWarns: WarnSelectCallback }) {
  const children: Array<React.JSX.Element> = [];

  // TODO display package system errors
  if (!result) {
    children.push(<p key='header' className='text-slate-500'>No rules selected, so no transliteration will be done</p>);
  } else if (result.warns.length === 0) {
    const noWarnText = result.text.length === 0
      ? 'No text typed yet. Warnings will be displayed here'
      : 'Transliterated with no warnings';
    children.push(<p key='header' className='text-slate-500'>{noWarnText}</p>);
  } else {
    const warnCount = result.warns.length;
    const newlines = extractNewlines(result.text);
    for (let w = 0; w < warnCount; w++) {
      const warn = result.warns[w];
      const ctx = warn.context;
      let msg: string;
      switch (ctx.type) {
        case TranslitResultWarnCtxType.AmbiguousMapping:
          msg = `Ambiguous mapping for input. Could alternatively map to ${fancyJoin(ctx.candidates, (s) => `"${s}"`)}`;
          break;
        case TranslitResultWarnCtxType.AmbiguousCapitalisation:
          msg = 'Ambiguous capitalisation. Make sure the input sequence that maps to this output is either all lowercase, all uppercase or sentence case';
          break;
        case TranslitResultWarnCtxType.NoMatch:
          msg = 'No match for this input sequence, but the mapping expects this script. Is this a typo?';
          break;
        default:
          msg = 'Unknown warning';
      }

      children.push(<WarnBoxEntry
        key={'warn-' + w}
        warnIdx={w}
        content={`${fancyCharIdxRange(warn.outStart, warn.outEnd, newlines)}: ${msg}`}
        selectedWarns={selectedWarns}
        setSelectedWarns={setSelectedWarns}
      />);
    }
  }

  return <div className="flex-1 overflow-y-auto flex flex-col gap-1">{children}</div>;
}