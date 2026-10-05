import { type TranslitResult } from '~/translit-logic/translit';

function OutBoxText({ result }: { result: TranslitResult }) {
  if (result.text.length === 0) {
    return <p className="text-slate-500 select-none italic">Transliterated text will show up here</p>
  } else {
    const spans: Array<React.JSX.Element> = [];
    const rangeCount = result.ranges.length;

    for (let r = 0; r < rangeCount; r++) {
      const range = result.ranges[r];
      const spanText = result.text.substring(range.start, range.end);
      const className = range.warnIdxs.length > 0 ? 'underline decoration-wavy decoration-amber-500' : '';
      spans.push(<span key={`range-${r}`} className={className}>{spanText}</span>);
    }

    return <p className="">{spans}</p>;
  }
}

export function OutBox({ result }: { result: TranslitResult }) {
  // FIXME how do you make the "select all" action (ctrl+a) select only text in
  //       this div? do i just give up and add a "copy text" button?
  return <div className="flex-1 bg-slate-50 p-1 rounded-xs overflow-y-auto overflow-x-hidden text-pretty wrap-break-word whitespace-pre-wrap">
    <OutBoxText result={result}/>
  </div>
}