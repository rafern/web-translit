import { TranslitResultWarnCtxType, type TranslitResult } from '~/translit-logic/translit';
import { extractNewlines, fancyCharIdxRange, fancyJoin } from '~/utils/text';

export function WarnBox({ result }: { result: TranslitResult }) {
  const children: Array<React.JSX.Element> = [];

  if (result.warns.length === 0) {
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

      children.push(<div className='text-amber-600 bg-amber-100 border-amber-600 border-1 rounded-md px-1 py-1 text-base/4' key={'warn-' + w}>{`${fancyCharIdxRange(warn.start, warn.end, newlines)}: ${msg}`}</div>);
    }
  }

  return <div className="flex-1 overflow-y-auto flex flex-col gap-1">{children}</div>;
}