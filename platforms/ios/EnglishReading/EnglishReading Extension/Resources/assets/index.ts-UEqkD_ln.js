import{B as $}from"./index-siCKrX4B.js";const ne=/[^.!?。！？]*[.!?。！？]+|\S[^.!?。！？]*$/g;function re(e){const t=e.toString().trim();if(!t)return null;const n=E(t),r=e.getRangeAt(0),o=P(r.startContainer),i=E((o==null?void 0:o.textContent)??t),a=G(i),s=a.findIndex(h=>h.includes(n));let c,l,u="",d="";if(s===-1)c=i,l="paragraph";else{const h=a[s];h.length<25||ue(n)?(c=i,l="paragraph"):(c=h,l="sentence",u=a[s-1]??"",d=a[s+1]??"")}return{selectedText:t,sourceText:c,sourceScope:l,contextBefore:u,contextAfter:d,pageUrl:location.href,pageTitle:document.title,glossLang:"zh"}}function oe(e){const t=e.getRangeAt(0),n=P(t.startContainer);if(!n)return null;const r=ae(n),o=E(e.toString());return o.length===0?null:G(r.text).filter(a=>a.includes(o)).flatMap(a=>ce(r,a)).find(a=>de(a,t))??null}function P(e){let t=e.nodeType===Node.TEXT_NODE?e.parentElement:e;const n=new Set(["P","LI","BLOCKQUOTE","DIV","TD","SECTION","ARTICLE","DD","DT","PRE"]);for(;t&&t instanceof HTMLElement;){if(n.has(t.tagName))return t;t=t.parentElement}return e.parentElement}function ie(e){let t=e.nodeType===Node.TEXT_NODE?e.parentElement:e;for(;t&&t instanceof HTMLElement;){const n=t.tagName;if(n==="INPUT"||n==="TEXTAREA"||t.isContentEditable)return!0;t=t.parentElement}return!1}function E(e){return e.replace(/\s+/g," ").trim()}function ae(e){const t=document.createTreeWalker(e,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT),n=[],r=[];let o=t.nextNode();for(;o;){if(o.nodeType===Node.TEXT_NODE){const i=o,a=le(i.parentElement);for(let s=0;s<i.data.length;s++){const c=i.data[s],l=a&&/[\r\n]/.test(c)?`
`:c;z(n,r,l,{startNode:i,startOffset:s,endNode:i,endOffset:s+1})}}else if(o instanceof HTMLBRElement){const i=o.parentNode;if(i){const a=Array.prototype.indexOf.call(i.childNodes,o);z(n,r,`
`,{startNode:i,startOffset:a,endNode:i,endOffset:a+1})}}o=t.nextNode()}for(;n.length>0&&/\s/.test(n[n.length-1]);)n.pop(),r.pop();return{text:n.join(""),positions:r}}function z(e,t,n,r){if(/\s/.test(n)){if(e.length===0)return;const o=n===`
`?`
`:" ",i=e[e.length-1];if(o===`
`&&i===" ")e.pop(),t.pop();else if(i===`
`){o===`
`&&(t[t.length-1].endNode=r.endNode,t[t.length-1].endOffset=r.endOffset);return}else if(i===" "){t[t.length-1].endNode=r.endNode,t[t.length-1].endOffset=r.endOffset;return}e.push(o),t.push(r);return}e.push(n),t.push(r)}function le(e){return e?/^(pre|pre-wrap|pre-line|break-spaces)$/.test(getComputedStyle(e).whiteSpace):!1}function se(e,t,n){const r=e[t],o=e[t+n-1];if(!r||!o)return null;const i=document.createRange();return i.setStart(r.startNode,r.startOffset),i.setEnd(o.endNode,o.endOffset),i}function ce(e,t){const n=[];let r=0;for(;r<=e.text.length-t.length;){const o=e.text.indexOf(t,r);if(o===-1)break;const i=se(e.positions,o,t.length);i&&n.push(i),r=o+1}return n}function de(e,t){return e.compareBoundaryPoints(Range.START_TO_START,t)<=0&&e.compareBoundaryPoints(Range.END_TO_END,t)>=0}function G(e){const n=e.split(/\n+/).map(o=>E(o)).filter(Boolean).flatMap(o=>(o.match(ne)??[o]).map(a=>a.trim()).filter(Boolean)),r=n.join("").length;return n.length===0||r<e.replace(/\s/g,"").length*.6?[e]:n}function ue(e){return/[.!?。！？].+[.!?。！？]/.test(e)}const I=`
:host {
  all: initial;
  --background: 40 20% 97%;
  --foreground: 220 20% 14%;
  --card: 0 0% 100%;
  --card-foreground: 220 20% 14%;
  --primary: 152 55% 38%;
  --primary-foreground: 0 0% 100%;
  --primary-soft: 150 55% 94%;
  --primary-border: 150 40% 82%;
  --secondary: 220 15% 96%;
  --muted: 220 15% 96%;
  --muted-foreground: 220 10% 46%;
  --destructive: 0 65% 52%;
  --destructive-foreground: 0 0% 100%;
  --destructive-soft: 0 70% 96%;
  --destructive-border: 0 60% 88%;
  --warning: 32 90% 46%;
  --warning-soft: 40 90% 94%;
  --warning-border: 36 70% 82%;
  --border: 220 15% 90%;
  --cw-card-bg: 0 0% 100%;
  --cw-card-border: 220 15% 88%;
  --cw-rail: 152 55% 42%;
  --cw-shadow: 0 1px 2px hsl(220 20% 14% / 0.04), 0 4px 12px hsl(220 20% 14% / 0.06);
}
[hidden] { display: none !important; }
.cw-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: hsl(var(--cw-card-bg));
  border: 1px solid hsl(var(--cw-card-border));
  border-left: 3px solid hsl(var(--cw-rail));
  border-radius: 8px;
  padding: 12px 14px;
  box-shadow: var(--cw-shadow);
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", Roboto, sans-serif;
  font-size: 13px;
  line-height: 1.55;
  color: hsl(var(--foreground));
}
.cw-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.cw-word {
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.01em;
}
.cw-word em {
  font-style: normal;
  color: hsl(var(--primary));
  font-weight: 600;
}
.cw-badge {
  font-size: 10px;
  line-height: 1;
  padding: 3px 6px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-weight: 500;
  letter-spacing: 0.02em;
}
.cw-badge--llm {
  color: hsl(var(--primary));
  background: hsl(var(--primary-soft));
  border-color: hsl(var(--primary-border));
}
.cw-badge--mock {
  color: hsl(var(--warning));
  background: hsl(var(--warning-soft));
  border-color: hsl(var(--warning-border));
}
.cw-badge--degraded {
  color: hsl(var(--destructive));
  background: hsl(var(--destructive-soft));
  border-color: hsl(var(--destructive-border));
}
.cw-translation {
  font-size: 13.5px;
  color: hsl(var(--foreground));
  margin-bottom: 10px;
}
.cw-blank {
  display: inline-block;
  min-width: 56px;
  padding: 0 6px;
  margin: 0 2px;
  border-bottom: 1.5px dashed hsl(var(--muted-foreground) / 0.55);
  color: transparent;
  user-select: none;
}
.cw-blank--filled {
  border-bottom-color: transparent;
  color: hsl(var(--primary));
  font-weight: 600;
  background: hsl(var(--primary-soft));
  border-radius: 4px;
  padding: 1px 6px;
}
.cw-blank--filled-neutral {
  color: hsl(var(--foreground));
  background: hsl(var(--muted));
  font-weight: 600;
}
.cw-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}
.cw-option {
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 7px 9px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--card));
  cursor: pointer;
  font-size: 12.5px;
  color: hsl(var(--foreground));
  overflow-wrap: anywhere;
  transition: border-color 120ms ease, background 120ms ease;
}
.cw-option:hover:not([disabled]) {
  border-color: hsl(var(--primary) / 0.55);
  background: hsl(var(--primary-soft) / 0.5);
}
.cw-option:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}
.cw-option[disabled] { cursor: default; }
.cw-option__marker {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  font-size: 10px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 0;
}
.cw-option--correct {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary-soft));
}
.cw-option--correct .cw-option__marker {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}
.cw-option--wrong {
  border-color: hsl(var(--destructive) / 0.55);
  background: hsl(var(--destructive-soft));
  color: hsl(var(--destructive));
}
.cw-option--wrong .cw-option__marker {
  background: hsl(var(--destructive));
  color: hsl(var(--destructive-foreground));
}
.cw-option--dim { opacity: 0.55; }
.cw-result {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 12.5px;
}
.cw-result--correct {
  background: hsl(var(--primary-soft));
  color: hsl(var(--primary));
  border: 1px solid hsl(var(--primary-border));
}
.cw-result--wrong {
  background: hsl(var(--destructive-soft));
  border: 1px solid hsl(var(--destructive-border));
  color: hsl(var(--foreground));
}
.cw-result--reveal {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
}
.cw-result__title {
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.02em;
}
.cw-result__row { display: flex; gap: 6px; align-items: baseline; }
.cw-result__label {
  font-size: 11.5px;
  color: hsl(var(--muted-foreground));
  flex: 0 0 auto;
}
.cw-result__value--wrong { color: hsl(var(--destructive)); font-weight: 500; }
.cw-result__value--right { color: hsl(var(--primary)); font-weight: 600; }
.cw-clue {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  padding: 6px 0 2px;
  border-top: 1px dashed hsl(var(--border));
  margin-top: 2px;
}
.cw-clue::before {
  content: "线索 · ";
  color: hsl(var(--primary));
  font-weight: 600;
}
.cw-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}
.cw-hint {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}
.cw-link {
  all: unset;
  cursor: pointer;
  font-size: 11.5px;
  color: hsl(var(--muted-foreground));
  text-decoration: underline;
  text-decoration-color: hsl(var(--border));
  text-underline-offset: 3px;
}
.cw-link:hover { color: hsl(var(--foreground)); }
.cw-link--danger { color: hsl(var(--destructive)); }
.cw-btn {
  all: unset;
  cursor: pointer;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--card));
  color: hsl(var(--foreground));
}
.cw-btn:hover { border-color: hsl(var(--primary) / 0.5); }
.cw-btn--primary {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-color: hsl(var(--primary));
}
.cw-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 12.5px;
  color: hsl(var(--destructive));
}
.cw-loading-text {
  color: hsl(var(--muted-foreground));
}
.cw-skeleton {
  height: 30px;
  background: linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--secondary)) 50%, hsl(var(--muted)) 100%);
  background-size: 200% 100%;
  animation: cw-shimmer 1.2s linear infinite;
}
@keyframes cw-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`,x="english-reading-ext-cloze",w=16,pe=8,fe=340,ge=460,he=420,A="english-reading-ext-source-sentence";let D=!1,T=null;const k=Symbol.for("english-reading-ext.dismiss-handler");function me(){document.querySelectorAll(`.${x}`).forEach(e=>e.remove()),L()}function we(e,t=e,n){ye();const r=document.createElement("div");if(r.className=x,!C(r,e,t))return null;const i=r.attachShadow({mode:"open"});n&&(r[k]=n),ve(r,t);const a=()=>C(r,e,t);let s=null;const c=()=>C(r,e,t,s);return{loading:l=>{Ne(i,l),a()},done:(l,u,d)=>{Ce(i,l,u,d,c),a(),s=_e(r.dataset.placement)},fail:(l,u)=>{Me(i,l,u),a()},remove:()=>xe(r)}}function ve(e,t){var i;L();const n=globalThis,r=(i=n.CSS)==null?void 0:i.highlights,o=n.Highlight;!r||!o||(be(),r.set(A,new o(t)),T=e)}function be(){if(document.querySelector("[data-english-reading-ext-highlight]"))return;const e=document.createElement("style");e.dataset.englishReadingExtHighlight="true",e.textContent=`
    ::highlight(${A}) {
      text-decoration-line: underline;
      text-decoration-color: #2fa66b;
      text-decoration-thickness: 2px;
      text-underline-offset: 3px;
    }
  `,(document.head??document.documentElement).appendChild(e)}function L(e){var n;if(e&&T&&T!==e)return;const t=globalThis.CSS;(n=t==null?void 0:t.highlights)==null||n.delete(A),T=null}function xe(e){delete e[k],e.remove(),L(e)}function U(e){e.dataset.dismissed="true";const t=e,n=t[k];delete t[k],n==null||n(),e.remove(),L(e)}function ye(){D||(document.addEventListener("click",Te,!0),D=!0)}function Te(e){const t=e.composedPath();document.querySelectorAll(`.${x}`).forEach(n=>{t.includes(n)||U(n)})}function C(e,t,n,r=null){if(!document.body||e.dataset.dismissed==="true")return!1;const o=X(n);if(o.length===0)return!1;const i=Le(o),a=ke(t)??o[o.length-1],s=document.documentElement.clientWidth||window.innerWidth,c=document.documentElement.clientHeight||window.innerHeight,l=pe,u=Math.max(0,s-l*2),d=Math.min(Math.max(he,a.width+96,fe),ge,u),h=B(a.left,l,s-l-d),R=e.getBoundingClientRect().height,y=R>0?R:280,Z=r?Ee(r,i,c,l):y,f=Math.min(y,Z),J=B(a.top,l,c-l-f),N=Se(i,h,J,d,f),ee=N.filter(g=>g.left>=l&&g.top>=l&&g.left+d<=s-l&&g.top+f<=c-l),M=(r?N.find(g=>g.name===r):null)??ee.sort((g,te)=>q(a,g,d,f)-q(a,te,d,f))[0]??N[0];return e.dataset.floating="true",e.dataset.placement=M.name,e.style.position="absolute",e.style.top=`${Math.round(window.scrollY+M.top)}px`,e.style.left=`${Math.round(window.scrollX+M.left)}px`,e.style.width=`${Math.round(d)}px`,e.style.maxWidth=`calc(100vw - ${l*2}px)`,e.style.maxHeight=r&&y>f?`${Math.round(f)}px`:"",e.style.overflowY=r&&y>f?"auto":"",e.style.display="block",e.style.boxSizing="border-box",e.style.zIndex="2147483647",document.body.appendChild(e),!0}function _e(e){return e==="below"||e==="above"||e==="right"||e==="left"?e:null}function Se(e,t,n,r,o){return[{name:"below",left:t,top:e.bottom+w},{name:"above",left:t,top:e.top-o-w},{name:"right",left:e.right+w,top:n},{name:"left",left:e.left-r-w,top:n}]}function Ee(e,t,n,r){return e==="above"?Math.max(0,t.top-w-r):e==="below"?Math.max(0,n-r-t.bottom-w):Math.max(0,n-r*2)}function ke(e){const t=X(e);return t[t.length-1]??null}function X(e){const t=Array.from(e.getClientRects()).filter(r=>r.width>0&&r.height>0);if(t.length>0)return t;const n=e.getBoundingClientRect();return n.width>0&&n.height>0?[n]:[]}function Le(e){return e.reduce((t,n)=>({left:Math.min(t.left,n.left),top:Math.min(t.top,n.top),right:Math.max(t.right,n.right),bottom:Math.max(t.bottom,n.bottom)}),{left:1/0,top:1/0,right:-1/0,bottom:-1/0})}function q(e,t,n,r){const o=t.left+n,i=t.top+r,a=e.right<t.left?t.left-e.right:e.left>o?e.left-o:0,s=e.bottom<t.top?t.top-e.bottom:e.top>i?e.top-i:0;return Math.hypot(a,s)}function B(e,t,n){return n<t?t:Math.min(Math.max(e,t),n)}function Ne(e,t){e.innerHTML=`<style>${I}</style>
  <div class="cw-card" data-cw-state="loading" aria-busy="true">
    <div class="cw-header">
      <div class="cw-word">猜词义 · <em>出题中…</em></div>
      <button class="cw-btn" data-cancel>取消</button>
    </div>
    <div class="cw-translation cw-loading-text">正在出题…</div>
    <div class="cw-options">
      <div class="cw-option cw-skeleton"></div>
      <div class="cw-option cw-skeleton"></div>
      <div class="cw-option cw-skeleton"></div>
    </div>
  </div>`,e.querySelector("[data-cancel]").addEventListener("click",()=>t.onCancel())}function Me(e,t,n){const r=n?'<button class="cw-btn cw-btn--primary" data-retry>重试</button>':"";e.innerHTML=`<style>${I}</style>
  <div class="cw-card" data-cw-state="error">
    <div class="cw-header">
      <div class="cw-word">猜词义</div>
    </div>
    <div class="cw-error">
      <span>出题失败：${p(t)}</span>
      <div style="display:flex;gap:6px">
        <button class="cw-btn" data-dismiss>关闭</button>
        ${r}
      </div>
    </div>
  </div>`,n&&e.querySelector("[data-retry]").addEventListener("click",()=>n());const o=e.host;e.querySelector("[data-dismiss]").addEventListener("click",()=>U(o))}function Ce(e,t,n,r,o){const[i,a]=Ae(t.translationWithBlank),s=t.options.map((u,d)=>`<button class="cw-option" type="button" data-option="${d}">
          <span class="cw-option__marker">${_(d)}</span>
          <span>${p(u)}</span>
        </button>`).join(""),c=He(n,r.degraded),l=Ie(c);e.innerHTML=`<style>${I}</style>
  <div class="cw-card" data-cw-state="initial">
    <div class="cw-header">
      <div class="cw-word">猜词义 · <em data-cw-slot="word">${p(t.selectedText)}</em></div>
      ${l}
    </div>
    <div class="cw-translation" data-cw-slot="translation">
      ${p(i)}<span class="cw-blank" data-blank>______</span>${p(a)}
    </div>
    <div class="cw-options" data-cw-slot="options">${s}</div>
    <div class="cw-result" data-cw-slot="result" hidden></div>
    <div class="cw-clue" data-cw-slot="clue" hidden>${p(t.clue)}</div>
    <div class="cw-actions">
      <span class="cw-hint" data-cw-slot="hint">选一个你觉得最合适的意思</span>
      <button class="cw-link cw-link--danger" data-cw-action="reveal">看不出 / 直接看答案</button>
    </div>
  </div>`,e.querySelectorAll("[data-option]").forEach(u=>{u.addEventListener("click",()=>{const d=Number(u.dataset.option);Number.isInteger(d)&&(r.onSelect(d),F(e,t,d),o())})}),e.querySelector('[data-cw-action="reveal"]').addEventListener("click",()=>{r.onReveal(),F(e,t,null),o()})}function F(e,t,n){var c;const r=e.querySelector(".cw-card");r.dataset.cwState=n===null?"revealed":"answered";const o=e.querySelector("[data-blank]"),i=t.options[t.answerIndex]??t.sense;o.classList.add("cw-blank--filled"),n===null&&o.classList.add("cw-blank--filled-neutral"),o.textContent=i,Oe(e,t,n);const a=e.querySelector('[data-cw-slot="result"]');if(a.hidden=!1,n===null)a.className="cw-result cw-result--reveal",a.innerHTML=['<div class="cw-result__row">','<span class="cw-result__label">答案：</span>',`<span class="cw-result__value--right">${_(t.answerIndex)}. ${p(i)}</span>`,"</div>"].join("");else if(n===t.answerIndex)a.className="cw-result cw-result--correct",a.innerHTML=`<div class="cw-result__title">✓ 对了</div><div style="font-size:12px">${p(t.sense)}</div>`;else{const l=t.options[n]??"";a.className="cw-result cw-result--wrong",a.innerHTML=['<div class="cw-result__title" style="color:hsl(var(--destructive))">× 再想想</div>','<div class="cw-result__row">','<span class="cw-result__label">你的选择：</span>',`<span class="cw-result__value--wrong">${_(n)}. ${p(l)}</span>`,"</div>",'<div class="cw-result__row">','<span class="cw-result__label">正确答案：</span>',`<span class="cw-result__value--right">${_(t.answerIndex)}. ${p(i)}</span>`,"</div>"].join("")}e.querySelector('[data-cw-slot="clue"]').hidden=!1;const s=e.querySelector('[data-cw-slot="hint"]');s&&(s.textContent="已作答 · 点选项已锁定"),(c=e.querySelector('[data-cw-action="reveal"]'))==null||c.remove()}function Oe(e,t,n){e.querySelectorAll("[data-option]").forEach(r=>{const o=Number(r.dataset.option);r.disabled=!0,r.classList.add("cw-option--dim"),o===t.answerIndex&&(r.classList.remove("cw-option--dim"),r.classList.add("cw-option--correct")),n!==null&&o===n&&n!==t.answerIndex&&(r.classList.remove("cw-option--dim"),r.classList.add("cw-option--wrong"))})}function _(e){return String.fromCharCode(65+e)}function He(e,t){return t?"DEGRADED":e?"MOCK":"LLM"}function Ie(e){return e==="LLM"?'<span class="cw-badge cw-badge--llm" data-cw-slot="badge">LLM</span>':e==="MOCK"?'<span class="cw-badge cw-badge--mock" data-cw-slot="badge">MOCK</span>':'<span class="cw-badge cw-badge--degraded" data-cw-slot="badge">降级 MOCK</span>'}function Ae(e){const t=e.indexOf($);return t===-1?[e,""]:[e.slice(0,t),e.slice(t+$.length)]}function p(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const Re=5e4,$e=700,ze=1e4;let j=0,v=null,m=0,S=null;function K(e){if(!e.composedPath().some(t=>t instanceof HTMLElement&&t.classList.contains(x))){if(e.type==="pointerup"){"pointerType"in e&&e.pointerType==="touch"&&Y();return}setTimeout(()=>V("request"),0)}}document.addEventListener("mouseup",K);document.addEventListener("pointerup",K);document.addEventListener("pointerdown",e=>{"pointerType"in e&&e.pointerType==="touch"&&(j=Date.now(),Q())});document.addEventListener("selectionchange",()=>{Date.now()-j>ze||Y()});function V(e="request"){const t=window.getSelection();if(!t||t.isCollapsed)return;const n=t.anchorNode;if(n&&(De(n)||ie(n)))return;const r=t.toString().trim();if(!r||r.length<2||r.length>400)return;const o=re(t);if(!o)return;const i=t.getRangeAt(0).cloneRange(),a=oe(t);if(a){if(e==="confirm"){t.removeAllRanges(),b(o,i,a);return}b(o,i,a)}}function Y(){Q(),v=setTimeout(()=>{v=null,V("confirm")},$e)}function Q(){v!==null&&(clearTimeout(v),v=null)}function b(e,t,n){O(),me();const r=++m,o=we(t,n,()=>{r===m&&O()});return o?(o.loading({onCancel:()=>{r===m&&(O(),o.remove())}}),S=setTimeout(()=>{r===m&&(H(),o.fail("出题超时",()=>b(e,t,n)))},Re),chrome.runtime.sendMessage({type:"GENERATE_CLOZE",payload:e},i=>{if(r!==m)return;if(H(),chrome.runtime.lastError){o.fail(chrome.runtime.lastError.message??"通信失败",()=>b(e,t,n));return}if(!(i!=null&&i.ok)||!i.result){o.fail((i==null?void 0:i.error)??"未知错误",()=>b(e,t,n));return}const a=i.result;o.done(a,i.mocked,{onSelect:s=>W(e,a,s),onReveal:()=>W(e,a,null),degraded:i.degraded,degradeReason:i.degradeReason})}),!0):!1}function O(){m++,H()}function H(){S!==null&&(clearTimeout(S),S=null)}function W(e,t,n){const r={id:crypto.randomUUID(),selectedText:e.selectedText,sourceText:e.sourceText,sourceScope:e.sourceScope,contextBefore:e.contextBefore,contextAfter:e.contextAfter,pageUrl:e.pageUrl,pageTitle:e.pageTitle,translationWithBlank:t.translationWithBlank,sense:t.sense,options:t.options,answerIndex:t.answerIndex,userAnswerIndex:n,correct:n===null?null:n===t.answerIndex,clue:t.clue,createdAt:Date.now()};chrome.runtime.sendMessage({type:"SAVE_RECORD",payload:r})}function De(e){let t=e;for(;t;){if(t instanceof HTMLElement&&t.classList.contains(x))return!0;t=t.parentNode??t.host??null}return!1}
