# WebTranslit

A transliteration tool for the web, intended to be self-hosted.

# Why?

> TLDR: This is for people who want to translate text that is written in a
> script they can read, but can't copy-paste (embedded in image/video) and can't
> write directly with their keyboard, while wanting to avoid Google services

Sometimes I want to translate text into English, but I can't copy-paste it due
to it being embedded in an image or video. If that text uses Latin script (e.g.
most romance languages), then there's no problem; I can just type the text
manually into a translation tool. However, if it's written in another script,
then I can't do that with my puny US keyboard.

Instead, if they're Chinese characters, I can draw them using the amazing
[Qhanzi](https://www.qhanzi.com/index.html) webapp. If it's written in a script
that I can read but not directly write with my keyboard, such as Russian
Cyrillic, then I tend to use Google Translate's transliteration input method. If
it's written in a script that I can't read nor write, then I would have to use
Google Lens and scan the image, or do some convoluted setup where I use
multilingual OCR and then translate it. I tend to just give up if I need to go
that far.

Recently I switched to a self-hosted
[LibreTranslate](https://libretranslate.com/) instance to avoid Google services,
but it doesn't do transliteration, so it doesn't fully replace Google Translate.
There are already transliteration tools in the wild, but most are closed-source
(therefore can't be self-hosted) or very situational (usually do one-way
conversion to Latin script only, for slug generation). The most promising
project was [Aksharamukha](https://www.aksharamukha.com/converter), since it was
open-source, supported converting to scripts other than Latin, and supported a
very large number of scripts. However, it didn't fit my needs because:

- it has a focus on Indic scripts, which I haven't needed so far
- I couldn't get it working properly for Russian Cyrillic (for example neither
  `privet` nor `privyet` transliterate to `привет`, instead transliterating to
  `привэт` or `привйэт`)
- it doesn't do transliteration on the client-side (privacy would not be a
  concern since I would be self-hosting, but I would like to minimise the load
  on my server, and this architecture seems excessive)

# Future plans

I plan on:

- adding transliteration overrides, for resolving ambiguous rules
- adding JSON package importing, for using custom rules (client-sided)
  - will also have a data viewer page (hence react-router), which lets you
    manage all packages, see loaded rules, create new rules on the browser,
    export custom rules, etc...
- adding an input method mode, which shows a popup similar to Google Translate's
- improving styling
- potentially adding dictionary-based disambiguation (e.g. `kak ty` should
  transliterate to `как ты`, not `как тй`, since `ты` would be in the Russian
  dictionary, while `тй` wouldn't)

Although Qhanzi is closed-source, it does a very good job which I doubt I can do
better, and it's not Google, so I have no intention to replace it.

# License

This project is licensed under the GNU Affero General Public License v3.0 only.
You can find a copy of the license in the LICENSE file.
