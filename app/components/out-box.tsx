import { useEffect, useRef } from 'react';
import { type TranslitResult, type TranslitResultRange } from '~/translit-logic/translit';
import { type SelectedWarns, type WarnSelectCallback } from '~/utils/callbacks';

function OutBoxSpan({ range, text, selectedWarns, setSelectedWarns }: { range: TranslitResultRange, text: string, selectedWarns: SelectedWarns, setSelectedWarns: WarnSelectCallback }) {
  const focusRef = useRef(null);
  useEffect(() => {
    for (const warnIdx of range.warnIdxs) {
      if (selectedWarns.indexOf(warnIdx) !== -1) {
        // FIXME: how do you avoid a cast here?
        (focusRef.current! as HTMLDivElement).scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
        break;
      }
    }
  }, [range, selectedWarns]);

  let className = '';
  let onMouseEnter, onMouseLeave; // unset on purpose

  if (range.warnIdxs.length > 0) {
    className = 'underline decoration-wavy decoration-amber-500';
    for (const warnIdx of range.warnIdxs) {
      if (selectedWarns.indexOf(warnIdx) !== -1) {
        className += ' bg-amber-200';
        break;
      }
    }

    // TODO investigate: is it safe to pass this array without cloning?
    onMouseEnter = () => setSelectedWarns(range.warnIdxs);
    onMouseLeave = () => setSelectedWarns([]);
  }

  return <span ref={focusRef} className={className} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>{text}</span>;
}

function OutBoxText({ result, selectedWarns, setSelectedWarns }: { result: TranslitResult | undefined, selectedWarns: SelectedWarns, setSelectedWarns: WarnSelectCallback }) {
  if (!result || result.text.length === 0) {
    return <p className="text-slate-500 select-none italic">Transliterated text will show up here</p>
  } else {
    const spans: Array<React.JSX.Element> = [];
    const rangeCount = result.ranges.length;

    for (let r = 0; r < rangeCount; r++) {
      const range = result.ranges[r];
      spans.push(<OutBoxSpan
        key={`range-${r}`}
        range={range}
        text={result.text.substring(range.start, range.end)}
        selectedWarns={selectedWarns}
        setSelectedWarns={setSelectedWarns}
      />);
    }

    return <p className="">{spans}</p>;
  }
}

export function OutBox({ result, selectedWarns, setSelectedWarns }: { result: TranslitResult | undefined, selectedWarns: SelectedWarns, setSelectedWarns: WarnSelectCallback }) {
  // FIXME how do you make the "select all" action (ctrl+a) select only text in
  //       this div? do i just give up and add a "copy text" button?
  return <div className="flex-1 bg-slate-50 p-1 rounded-xs overflow-y-auto overflow-x-hidden text-pretty wrap-break-word whitespace-pre-wrap">
    <OutBoxText result={result} selectedWarns={selectedWarns} setSelectedWarns={setSelectedWarns} />
  </div>
}
