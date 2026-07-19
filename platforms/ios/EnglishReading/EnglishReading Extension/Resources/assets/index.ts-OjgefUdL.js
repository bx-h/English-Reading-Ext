import{B as $}from"./index-siCKrX4B.js";const te=/[^.!?。！？]*[.!?。！？]+|\S[^.!?。！？]*$/g;function ne(e){const t=e.toString().trim();if(!t)return null;const n=H(t),r=e.getRangeAt(0),o=W(r.startContainer),i=H((o==null?void 0:o.textContent)??t),a=P(i),l=a.findIndex(h=>h.includes(n));let d,s,u="",c="";if(l===-1)d=i,s="paragraph";else{const h=a[l];h.length<25||ce(n)?(d=i,s="paragraph"):(d=h,s="sentence",u=a[l-1]??"",c=a[l+1]??"")}return{selectedText:t,sourceText:d,sourceScope:s,contextBefore:u,contextAfter:c,pageUrl:location.href,pageTitle:document.title,glossLang:"zh"}}function re(e){const t=e.getRangeAt(0),n=W(t.startContainer);if(!n)return null;const r=ie(n),o=H(e.toString());return o.length===0?null:P(r.text).filter(a=>a.includes(o)).flatMap(a=>se(r,a)).find(a=>le(a,t))??null}function W(e){let t=e.nodeType===Node.TEXT_NODE?e.parentElement:e;const n=new Set(["P","LI","BLOCKQUOTE","DIV","TD","SECTION","ARTICLE","DD","DT","PRE"]);for(;t&&t instanceof HTMLElement;){if(n.has(t.tagName))return t;t=t.parentElement}return e.parentElement}function oe(e){let t=e.nodeType===Node.TEXT_NODE?e.parentElement:e;for(;t&&t instanceof HTMLElement;){const n=t.tagName;if(n==="INPUT"||n==="TEXTAREA"||t.isContentEditable)return!0;t=t.parentElement}return!1}function H(e){return e.replace(/\s+/g," ").trim()}function ie(e){const t=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),n=[],r=[];let o=t.nextNode();for(;o;){for(let i=0;i<o.data.length;i++){const a=o.data[i];if(/\s/.test(a)){if(n.length===0)continue;if(n[n.length-1]===" "){r[r.length-1].endNode=o,r[r.length-1].endOffset=i+1;continue}n.push(" ")}else n.push(a);r.push({startNode:o,startOffset:i,endNode:o,endOffset:i+1})}o=t.nextNode()}return n[n.length-1]===" "&&(n.pop(),r.pop()),{text:n.join(""),positions:r}}function ae(e,t,n){const r=e[t],o=e[t+n-1];if(!r||!o)return null;const i=document.createRange();return i.setStart(r.startNode,r.startOffset),i.setEnd(o.endNode,o.endOffset),i}function se(e,t){const n=[];let r=0;for(;r<=e.text.length-t.length;){const o=e.text.indexOf(t,r);if(o===-1)break;const i=ae(e.positions,o,t.length);i&&n.push(i),r=o+1}return n}function le(e,t){return e.compareBoundaryPoints(Range.START_TO_START,t)<=0&&e.compareBoundaryPoints(Range.END_TO_END,t)>=0}function P(e){const t=e.match(te);if(!t)return[e];const n=t.map(o=>o.trim()).filter(Boolean),r=n.join("").length;return n.length===0||r<e.replace(/\s/g,"").length*.6?[e]:n}function ce(e){return/[.!?。！？].+[.!?。！？]/.test(e)}const I=`
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
`,x="english-reading-ext-cloze",w=16,de=8,ue=340,pe=460,fe=420,A="english-reading-ext-source-sentence";let z=!1,T=null;const k=Symbol.for("english-reading-ext.dismiss-handler");function ge(){document.querySelectorAll(`.${x}`).forEach(e=>e.remove()),E()}function he(e,t=e,n){be();const r=document.createElement("div");if(r.className=x,!C(r,e,t))return null;const i=r.attachShadow({mode:"open"});n&&(r[k]=n),me(r,t);const a=()=>C(r,e,t);let l=null;const d=()=>C(r,e,t,l);return{loading:s=>{Ee(i,s),a()},done:(s,u,c)=>{Me(i,s,u,c,d),a(),l=ye(r.dataset.placement)},fail:(s,u)=>{Le(i,s,u),a()},remove:()=>ve(r)}}function me(e,t){var i;E();const n=globalThis,r=(i=n.CSS)==null?void 0:i.highlights,o=n.Highlight;!r||!o||(we(),r.set(A,new o(t)),T=e)}function we(){if(document.querySelector("[data-english-reading-ext-highlight]"))return;const e=document.createElement("style");e.dataset.englishReadingExtHighlight="true",e.textContent=`
    ::highlight(${A}) {
      text-decoration-line: underline;
      text-decoration-color: #2fa66b;
      text-decoration-thickness: 2px;
      text-underline-offset: 3px;
    }
  `,(document.head??document.documentElement).appendChild(e)}function E(e){var n;if(e&&T&&T!==e)return;const t=globalThis.CSS;(n=t==null?void 0:t.highlights)==null||n.delete(A),T=null}function ve(e){delete e[k],e.remove(),E(e)}function G(e){e.dataset.dismissed="true";const t=e,n=t[k];delete t[k],n==null||n(),e.remove(),E(e)}function be(){z||(document.addEventListener("click",xe,!0),z=!0)}function xe(e){const t=e.composedPath();document.querySelectorAll(`.${x}`).forEach(n=>{t.includes(n)||G(n)})}function C(e,t,n,r=null){if(!document.body||e.dataset.dismissed==="true")return!1;const o=U(n);if(o.length===0)return!1;const i=ke(o),a=Se(t)??o[o.length-1],l=document.documentElement.clientWidth||window.innerWidth,d=document.documentElement.clientHeight||window.innerHeight,s=de,u=Math.max(0,l-s*2),c=Math.min(Math.max(fe,a.width+96,ue),pe,u),h=q(a.left,s,l-s-c),R=e.getBoundingClientRect().height,y=R>0?R:280,Q=r?_e(r,i,d,s):y,f=Math.min(y,Q),Z=q(a.top,s,d-s-f),L=Te(i,h,Z,c,f),J=L.filter(g=>g.left>=s&&g.top>=s&&g.left+c<=l-s&&g.top+f<=d-s),M=(r?L.find(g=>g.name===r):null)??J.sort((g,ee)=>D(a,g,c,f)-D(a,ee,c,f))[0]??L[0];return e.dataset.floating="true",e.dataset.placement=M.name,e.style.position="absolute",e.style.top=`${Math.round(window.scrollY+M.top)}px`,e.style.left=`${Math.round(window.scrollX+M.left)}px`,e.style.width=`${Math.round(c)}px`,e.style.maxWidth=`calc(100vw - ${s*2}px)`,e.style.maxHeight=r&&y>f?`${Math.round(f)}px`:"",e.style.overflowY=r&&y>f?"auto":"",e.style.display="block",e.style.boxSizing="border-box",e.style.zIndex="2147483647",document.body.appendChild(e),!0}function ye(e){return e==="below"||e==="above"||e==="right"||e==="left"?e:null}function Te(e,t,n,r,o){return[{name:"below",left:t,top:e.bottom+w},{name:"above",left:t,top:e.top-o-w},{name:"right",left:e.right+w,top:n},{name:"left",left:e.left-r-w,top:n}]}function _e(e,t,n,r){return e==="above"?Math.max(0,t.top-w-r):e==="below"?Math.max(0,n-r-t.bottom-w):Math.max(0,n-r*2)}function Se(e){const t=U(e);return t[t.length-1]??null}function U(e){const t=Array.from(e.getClientRects()).filter(r=>r.width>0&&r.height>0);if(t.length>0)return t;const n=e.getBoundingClientRect();return n.width>0&&n.height>0?[n]:[]}function ke(e){return e.reduce((t,n)=>({left:Math.min(t.left,n.left),top:Math.min(t.top,n.top),right:Math.max(t.right,n.right),bottom:Math.max(t.bottom,n.bottom)}),{left:1/0,top:1/0,right:-1/0,bottom:-1/0})}function D(e,t,n,r){const o=t.left+n,i=t.top+r,a=e.right<t.left?t.left-e.right:e.left>o?e.left-o:0,l=e.bottom<t.top?t.top-e.bottom:e.top>i?e.top-i:0;return Math.hypot(a,l)}function q(e,t,n){return n<t?t:Math.min(Math.max(e,t),n)}function Ee(e,t){e.innerHTML=`<style>${I}</style>
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
  </div>`,e.querySelector("[data-cancel]").addEventListener("click",()=>t.onCancel())}function Le(e,t,n){const r=n?'<button class="cw-btn cw-btn--primary" data-retry>重试</button>':"";e.innerHTML=`<style>${I}</style>
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
  </div>`,n&&e.querySelector("[data-retry]").addEventListener("click",()=>n());const o=e.host;e.querySelector("[data-dismiss]").addEventListener("click",()=>G(o))}function Me(e,t,n,r,o){const[i,a]=Oe(t.translationWithBlank),l=t.options.map((u,c)=>`<button class="cw-option" type="button" data-option="${c}">
          <span class="cw-option__marker">${_(c)}</span>
          <span>${p(u)}</span>
        </button>`).join(""),d=Ne(n,r.degraded),s=He(d);e.innerHTML=`<style>${I}</style>
  <div class="cw-card" data-cw-state="initial">
    <div class="cw-header">
      <div class="cw-word">猜词义 · <em data-cw-slot="word">${p(t.selectedText)}</em></div>
      ${s}
    </div>
    <div class="cw-translation" data-cw-slot="translation">
      ${p(i)}<span class="cw-blank" data-blank>______</span>${p(a)}
    </div>
    <div class="cw-options" data-cw-slot="options">${l}</div>
    <div class="cw-result" data-cw-slot="result" hidden></div>
    <div class="cw-clue" data-cw-slot="clue" hidden>${p(t.clue)}</div>
    <div class="cw-actions">
      <span class="cw-hint" data-cw-slot="hint">选一个你觉得最合适的意思</span>
      <button class="cw-link cw-link--danger" data-cw-action="reveal">看不出 / 直接看答案</button>
    </div>
  </div>`,e.querySelectorAll("[data-option]").forEach(u=>{u.addEventListener("click",()=>{const c=Number(u.dataset.option);Number.isInteger(c)&&(r.onSelect(c),F(e,t,c),o())})}),e.querySelector('[data-cw-action="reveal"]').addEventListener("click",()=>{r.onReveal(),F(e,t,null),o()})}function F(e,t,n){var d;const r=e.querySelector(".cw-card");r.dataset.cwState=n===null?"revealed":"answered";const o=e.querySelector("[data-blank]"),i=t.options[t.answerIndex]??t.sense;o.classList.add("cw-blank--filled"),n===null&&o.classList.add("cw-blank--filled-neutral"),o.textContent=i,Ce(e,t,n);const a=e.querySelector('[data-cw-slot="result"]');if(a.hidden=!1,n===null)a.className="cw-result cw-result--reveal",a.innerHTML=['<div class="cw-result__row">','<span class="cw-result__label">答案：</span>',`<span class="cw-result__value--right">${_(t.answerIndex)}. ${p(i)}</span>`,"</div>"].join("");else if(n===t.answerIndex)a.className="cw-result cw-result--correct",a.innerHTML=`<div class="cw-result__title">✓ 对了</div><div style="font-size:12px">${p(t.sense)}</div>`;else{const s=t.options[n]??"";a.className="cw-result cw-result--wrong",a.innerHTML=['<div class="cw-result__title" style="color:hsl(var(--destructive))">× 再想想</div>','<div class="cw-result__row">','<span class="cw-result__label">你的选择：</span>',`<span class="cw-result__value--wrong">${_(n)}. ${p(s)}</span>`,"</div>",'<div class="cw-result__row">','<span class="cw-result__label">正确答案：</span>',`<span class="cw-result__value--right">${_(t.answerIndex)}. ${p(i)}</span>`,"</div>"].join("")}e.querySelector('[data-cw-slot="clue"]').hidden=!1;const l=e.querySelector('[data-cw-slot="hint"]');l&&(l.textContent="已作答 · 点选项已锁定"),(d=e.querySelector('[data-cw-action="reveal"]'))==null||d.remove()}function Ce(e,t,n){e.querySelectorAll("[data-option]").forEach(r=>{const o=Number(r.dataset.option);r.disabled=!0,r.classList.add("cw-option--dim"),o===t.answerIndex&&(r.classList.remove("cw-option--dim"),r.classList.add("cw-option--correct")),n!==null&&o===n&&n!==t.answerIndex&&(r.classList.remove("cw-option--dim"),r.classList.add("cw-option--wrong"))})}function _(e){return String.fromCharCode(65+e)}function Ne(e,t){return t?"DEGRADED":e?"MOCK":"LLM"}function He(e){return e==="LLM"?'<span class="cw-badge cw-badge--llm" data-cw-slot="badge">LLM</span>':e==="MOCK"?'<span class="cw-badge cw-badge--mock" data-cw-slot="badge">MOCK</span>':'<span class="cw-badge cw-badge--degraded" data-cw-slot="badge">降级 MOCK</span>'}function Oe(e){const t=e.indexOf($);return t===-1?[e,""]:[e.slice(0,t),e.slice(t+$.length)]}function p(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const Ie=5e4,Ae=700,Re=1e4;let X=0,v=null,m=0,S=null;function j(e){if(!e.composedPath().some(t=>t instanceof HTMLElement&&t.classList.contains(x))){if(e.type==="pointerup"){"pointerType"in e&&e.pointerType==="touch"&&V();return}setTimeout(()=>K("request"),0)}}document.addEventListener("mouseup",j);document.addEventListener("pointerup",j);document.addEventListener("pointerdown",e=>{"pointerType"in e&&e.pointerType==="touch"&&(X=Date.now(),Y())});document.addEventListener("selectionchange",()=>{Date.now()-X>Re||V()});function K(e="request"){const t=window.getSelection();if(!t||t.isCollapsed)return;const n=t.anchorNode;if(n&&($e(n)||oe(n)))return;const r=t.toString().trim();if(!r||r.length<2||r.length>400)return;const o=ne(t);if(!o)return;const i=t.getRangeAt(0).cloneRange(),a=re(t);if(a){if(e==="confirm"){t.removeAllRanges(),b(o,i,a);return}b(o,i,a)}}function V(){Y(),v=setTimeout(()=>{v=null,K("confirm")},Ae)}function Y(){v!==null&&(clearTimeout(v),v=null)}function b(e,t,n){N(),ge();const r=++m,o=he(t,n,()=>{r===m&&N()});return o?(o.loading({onCancel:()=>{r===m&&(N(),o.remove())}}),S=setTimeout(()=>{r===m&&(O(),o.fail("出题超时",()=>b(e,t,n)))},Ie),chrome.runtime.sendMessage({type:"GENERATE_CLOZE",payload:e},i=>{if(r!==m)return;if(O(),chrome.runtime.lastError){o.fail(chrome.runtime.lastError.message??"通信失败",()=>b(e,t,n));return}if(!(i!=null&&i.ok)||!i.result){o.fail((i==null?void 0:i.error)??"未知错误",()=>b(e,t,n));return}const a=i.result;o.done(a,i.mocked,{onSelect:l=>B(e,a,l),onReveal:()=>B(e,a,null),degraded:i.degraded,degradeReason:i.degradeReason})}),!0):!1}function N(){m++,O()}function O(){S!==null&&(clearTimeout(S),S=null)}function B(e,t,n){const r={id:crypto.randomUUID(),selectedText:e.selectedText,sourceText:e.sourceText,sourceScope:e.sourceScope,contextBefore:e.contextBefore,contextAfter:e.contextAfter,pageUrl:e.pageUrl,pageTitle:e.pageTitle,translationWithBlank:t.translationWithBlank,sense:t.sense,options:t.options,answerIndex:t.answerIndex,userAnswerIndex:n,correct:n===null?null:n===t.answerIndex,clue:t.clue,createdAt:Date.now()};chrome.runtime.sendMessage({type:"SAVE_RECORD",payload:r})}function $e(e){let t=e;for(;t;){if(t instanceof HTMLElement&&t.classList.contains(x))return!0;t=t.parentNode??t.host??null}return!1}
