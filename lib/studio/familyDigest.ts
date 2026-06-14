// The family digest — a warm one-page report a parent opens on their phone, in
// THEIR home language. The AI only translates/summarizes (returns FamilyDigest
// JSON); this file assembles the final self-contained HTML from a safe template
// so the design is consistent and the read-aloud always works. The HTML is
// stored as a shared artifact and rendered inside a sandboxed iframe.

import type { HomeLang } from "@/lib/studio/homeLang";

export interface FamilyDigest {
  heading: string; // "Today your child studied math"
  intro: string; // one warm line
  problemLine: string; // what the problem was about
  thinkingHeading: string; // "How your child thought"
  thinking: string[]; // 2–4 lines: how the child reasoned
  didWellHeading: string; // "What your child did well"
  didWell: string[]; // 2–3 concrete praises
  talkHeading: string; // "Talk together"
  talkPrompts: string[]; // 2 questions the parent can ask
  listenLabel: string; // button label meaning "Listen"
  closing: string; // warm closing line
  playLabel?: string; // "See what your child made"
}

export function sanitizeDigest(p: unknown): FamilyDigest | null {
  if (!p || typeof p !== "object") return null;
  const o = p as Record<string, unknown>;
  const str = (v: unknown, fb = ""): string =>
    typeof v === "string" && v.trim() ? v.trim() : fb;
  const arr = (v: unknown): string[] =>
    Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean).slice(0, 4) : [];

  const thinking = arr(o.thinking);
  const didWell = arr(o.didWell);
  const talkPrompts = arr(o.talkPrompts);
  if (!str(o.heading) || thinking.length === 0 || didWell.length === 0) return null;

  return {
    heading: str(o.heading),
    intro: str(o.intro),
    problemLine: str(o.problemLine),
    thinkingHeading: str(o.thinkingHeading),
    thinking,
    didWellHeading: str(o.didWellHeading),
    didWell,
    talkHeading: str(o.talkHeading, "Talk together"),
    talkPrompts: talkPrompts.length ? talkPrompts : [],
    listenLabel: str(o.listenLabel, "▶︎"),
    closing: str(o.closing),
    playLabel: str(o.playLabel) || undefined,
  };
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Build the full, self-contained digest page. Mobile-first, Gemini-clean, with
// a read-aloud button that speaks the whole digest in the home language.
export function buildFamilyDigestHtml(
  d: FamilyDigest,
  lang: HomeLang,
  opts: { topic?: string; level?: string; playUrl?: string } = {},
): string {
  const rtl = false; // none of our first-class languages are RTL
  const meta = [opts.topic, opts.level].filter(Boolean).join(" · ");

  // The text the read-aloud speaks, in order.
  const speech = [
    d.heading,
    d.intro,
    d.problemLine,
    d.thinkingHeading,
    ...d.thinking,
    d.didWellHeading,
    ...d.didWell,
    d.talkHeading,
    ...d.talkPrompts,
    d.closing,
  ]
    .filter(Boolean)
    .join(". ");

  const li = (items: string[]) =>
    items.map((t) => `<li>${esc(t)}</li>`).join("");

  const playBtn = opts.playUrl
    ? `<a class="play" href="${esc(opts.playUrl)}" target="_blank" rel="noopener">${esc(
        d.playLabel || "▶︎",
      )}</a>`
    : "";

  const talk = d.talkPrompts.length
    ? `<section class="card talk">
         <h2>${esc(d.talkHeading)}</h2>
         <ul class="q">${li(d.talkPrompts)}</ul>
       </section>`
    : "";

  return `<!DOCTYPE html>
<html lang="${esc(lang.bcp47)}"${rtl ? ' dir="rtl"' : ""}>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(d.heading)}</title>
<style>
  :root{
    --paper:#ffffff; --ink:#1f1f1f; --muted:#5f6368; --line:#e6e8ec;
    --accent:#0b57d0; --soft:#eef3fd;
    --grad:linear-gradient(120deg,#0b57d0 0%,#8a5cf6 52%,#ff7a59 100%);
  }
  *{box-sizing:border-box}
  html,body{margin:0}
  body{
    background:#f4f6fa; color:var(--ink);
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans",
      "Noto Sans KR","Noto Sans SC","Noto Sans JP","Noto Sans Khmer",sans-serif;
    -webkit-font-smoothing:antialiased; line-height:1.55;
    padding:18px 14px 40px;
  }
  .wrap{max-width:480px;margin:0 auto}
  .hero{
    background:var(--grad); color:#fff; border-radius:22px;
    padding:22px 20px 20px; box-shadow:0 12px 30px -14px rgba(11,87,208,.5);
  }
  .kicker{font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.8;margin:0}
  .hero h1{font-size:23px;line-height:1.25;margin:7px 0 0;font-weight:700}
  .hero p{margin:9px 0 0;font-size:14px;opacity:.94}
  .meta{margin-top:12px;font-size:11.5px;opacity:.8}
  .listen{
    margin-top:15px;display:inline-flex;align-items:center;gap:8px;
    background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.4);
    color:#fff;border-radius:999px;padding:9px 16px;font-size:13.5px;font-weight:600;
    cursor:pointer;backdrop-filter:blur(4px);transition:background .15s;
  }
  .listen:hover{background:rgba(255,255,255,.26)}
  .listen .ic{font-size:14px;line-height:1}
  .card{
    background:var(--paper);border:1px solid var(--line);border-radius:18px;
    padding:17px 18px;margin-top:13px;box-shadow:0 4px 16px -12px rgba(0,0,0,.18);
  }
  .card h2{margin:0 0 9px;font-size:13px;font-weight:700;color:var(--accent);
    letter-spacing:.01em}
  .card h2.ok{color:#16a34a}
  .problem{font-size:15.5px;font-weight:600;line-height:1.5;margin:0}
  ul{margin:0;padding:0;list-style:none}
  ul li{position:relative;padding-left:20px;margin:7px 0;font-size:14.5px;color:#33363b}
  ul li::before{content:"";position:absolute;left:3px;top:9px;width:7px;height:7px;
    border-radius:50%;background:var(--accent);opacity:.55}
  .did li::before{background:#16a34a;opacity:.7}
  .talk{background:var(--soft);border-color:#dbe6fb}
  .talk h2{color:#1b4fa6}
  .q li{font-weight:600;color:#23303f}
  .q li::before{content:"";width:14px;height:14px;border-radius:50%;
    background:transparent;border:2px solid var(--accent);left:0;top:5px;opacity:.6}
  .play{display:block;text-align:center;text-decoration:none;margin-top:13px;
    background:var(--ink);color:#fff;border-radius:14px;padding:13px;font-size:14.5px;
    font-weight:600}
  .play:active{background:var(--accent)}
  .closing{text-align:center;font-size:14.5px;color:var(--muted);margin:18px 6px 0;
    line-height:1.5}
  .foot{text-align:center;margin-top:22px}
  .foot a{font-size:12px;color:#9aa0a6;text-decoration:none}
  .foot b{color:var(--ink)}
  .foot .g{background:var(--grad);-webkit-background-clip:text;background-clip:text;
    -webkit-text-fill-color:transparent;font-weight:700}
</style>
</head>
<body>
  <div class="wrap">
    <header class="hero">
      <p class="kicker">Thebes</p>
      <h1>${esc(d.heading)}</h1>
      ${d.intro ? `<p>${esc(d.intro)}</p>` : ""}
      ${meta ? `<div class="meta">${esc(meta)}</div>` : ""}
      <button class="listen" id="listen" type="button">
        <span class="ic" id="lic">▶︎</span><span id="ltx">${esc(d.listenLabel)}</span>
      </button>
    </header>

    ${d.problemLine ? `<section class="card"><p class="problem">${esc(d.problemLine)}</p></section>` : ""}

    <section class="card">
      ${d.thinkingHeading ? `<h2>${esc(d.thinkingHeading)}</h2>` : ""}
      <ul>${li(d.thinking)}</ul>
    </section>

    <section class="card">
      <h2 class="ok">${d.didWellHeading ? `✓ ${esc(d.didWellHeading)}` : "✓"}</h2>
      <ul class="did">${li(d.didWell)}</ul>
    </section>

    ${talk}
    ${playBtn}
    ${d.closing ? `<p class="closing">${esc(d.closing)}</p>` : ""}

    <div class="foot">
      <a href="https://thebes" onclick="return false"><span class="g">Thebes</span> · made by your child</a>
    </div>
  </div>

<script>
(function(){
  var btn=document.getElementById('listen'),
      ic=document.getElementById('lic'),
      tx=document.getElementById('ltx'),
      LANG=${JSON.stringify(lang.bcp47)},
      TEXT=${JSON.stringify(speech)},
      idleLabel=${JSON.stringify(d.listenLabel)},
      speaking=false;
  if(!('speechSynthesis' in window)){ btn.style.display='none'; return; }

  function pickVoice(){
    var vs=window.speechSynthesis.getVoices()||[];
    var base=LANG.split('-')[0];
    return vs.find(function(v){return v.lang===LANG;})
        || vs.find(function(v){return v.lang&&v.lang.indexOf(base)===0;})
        || null;
  }
  function stop(){ window.speechSynthesis.cancel(); speaking=false; ic.textContent='▶︎'; tx.textContent=idleLabel; }
  function speak(){
    var u=new SpeechSynthesisUtterance(TEXT);
    u.lang=LANG; var v=pickVoice(); if(v) u.voice=v;
    u.rate=.96; u.pitch=1;
    u.onend=function(){ speaking=false; ic.textContent='▶︎'; tx.textContent=idleLabel; };
    u.onerror=function(){ speaking=false; ic.textContent='▶︎'; tx.textContent=idleLabel; };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    speaking=true; ic.textContent='⏸';
  }
  btn.addEventListener('click',function(){ speaking?stop():speak(); });
  // Voices can load late.
  if(typeof speechSynthesis!=='undefined'){ speechSynthesis.onvoiceschanged=function(){}; }
})();
</script>
</body>
</html>`;
}
