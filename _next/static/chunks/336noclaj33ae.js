(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,75811,e=>{e.q("/bujeok-app/_next/static/media/hanji-bg.3x3gcnstqx29_.jpg")},44714,e=>{e.q("/bujeok-app/_next/static/media/wordmark-mark.3urt7e9hv6s_u.png")},64275,e=>{"use strict";var t=e.i(43476),r=e.i(57688),o=e.i(59897),l=e.i(66414);e.s(["default",0,function({left:e,right:i,title:n,showSeal:s=!1,wordmark:c=!1}){return(0,t.jsxs)("header",{className:"flex items-center justify-between px-4 pb-3 pt-[max(0.875rem,env(safe-area-inset-top))]",children:[(0,t.jsx)("div",{className:"flex h-10 w-10 items-center justify-center text-[var(--color-meok)]",children:e}),(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[c&&(0,t.jsx)(r.default,{src:l.default,alt:"수호부",priority:!0,className:"h-16 w-auto"}),!c&&s&&(0,t.jsx)(o.SealLogo,{size:30}),!c&&n&&(0,t.jsx)("h1",{className:"font-serif-kr text-base font-bold tracking-wide text-[var(--color-meok)]",children:n})]}),(0,t.jsx)("div",{className:"flex h-10 w-10 items-center justify-center text-[var(--color-meok)]",children:i})]})}])},88653,e=>{"use strict";e.i(47167);var t=e.i(43476),r=e.i(71645),o=e.i(31178),l=e.i(47414),i=e.i(74008),n=e.i(21476),s=e.i(72846),c=r,a=e.i(37806);function d(e,t){if("function"==typeof e)return e(t);null!=e&&(e.current=t)}class f extends c.Component{getSnapshotBeforeUpdate(e){let t=this.props.childRef.current;if((0,s.isHTMLElement)(t)&&e.isPresent&&!this.props.isPresent&&!1!==this.props.pop){let e=t.offsetParent,r=(0,s.isHTMLElement)(e)&&e.offsetWidth||0,o=(0,s.isHTMLElement)(e)&&e.offsetHeight||0,l=getComputedStyle(t),i=this.props.sizeRef.current;i.height=parseFloat(l.height),i.width=parseFloat(l.width),i.top=t.offsetTop,i.left=t.offsetLeft,i.right=r-i.width-i.left,i.bottom=o-i.height-i.top,i.direction=l.direction}return null}componentDidUpdate(){}render(){return this.props.children}}function h({children:e,isPresent:o,anchorX:l,anchorY:i,root:n,pop:s}){let u=(0,c.useId)(),x=(0,c.useRef)(null),p=(0,c.useRef)({width:0,height:0,top:0,left:0,right:0,bottom:0,direction:"ltr"}),{nonce:k}=(0,c.useContext)(a.MotionConfigContext),m=function(...e){return r.useCallback(function(...e){return t=>{let r=!1,o=e.map(e=>{let o=d(e,t);return r||"function"!=typeof o||(r=!0),o});if(r)return()=>{for(let t=0;t<o.length;t++){let r=o[t];"function"==typeof r?r():d(e[t],null)}}}}(...e),e)}(x,!1!==s?e.props?.ref??e?.ref:void 0);return(0,c.useInsertionEffect)(()=>{let{width:e,height:t,top:r,left:c,right:a,bottom:d,direction:f}=p.current;if(o||!1===s||!x.current||!e||!t)return;let h="rtl"===f,m="left"===l?h?`right: ${a}`:`left: ${c}`:h?`left: ${c}`:`right: ${a}`,g="bottom"===i?`bottom: ${d}`:`top: ${r}`;x.current.dataset.motionPopId=u;let y=document.createElement("style");k&&(y.nonce=k);let w=n??document.head;return w.appendChild(y),y.sheet&&y.sheet.insertRule(`
          [data-motion-pop-id="${u}"] {
            position: absolute !important;
            width: ${e}px !important;
            height: ${t}px !important;
            ${m}px !important;
            ${g}px !important;
          }
        `),()=>{x.current?.removeAttribute("data-motion-pop-id"),w.contains(y)&&w.removeChild(y)}},[o]),(0,t.jsx)(f,{isPresent:o,childRef:x,sizeRef:p,pop:s,children:!1===s?e:c.cloneElement(e,{ref:m})})}let u=({children:e,initial:o,isPresent:s,onExitComplete:c,custom:a,presenceAffectsLayout:d,mode:f,anchorX:u,anchorY:p,root:k})=>{let m=(0,l.useConstant)(x),g=(0,r.useId)(),y=(0,r.useRef)(s),w=(0,r.useRef)(c);(0,i.useIsomorphicLayoutEffect)(()=>{y.current=s,w.current=c});let C=!0,$=(0,r.useMemo)(()=>(C=!1,{id:g,initial:o,isPresent:s,custom:a,onExitComplete:e=>{for(let t of(m.set(e,!0),m.values()))if(!t)return;c&&c()},register:e=>(m.set(e,!1),()=>{m.delete(e),y.current||m.size||w.current?.()})}),[s,m,c]);return d&&C&&($={...$}),(0,r.useMemo)(()=>{m.forEach((e,t)=>m.set(t,!1))},[s]),r.useEffect(()=>{s||m.size||!c||c()},[s]),e=(0,t.jsx)(h,{pop:"popLayout"===f,isPresent:s,anchorX:u,anchorY:p,root:k,children:e}),(0,t.jsx)(n.PresenceContext.Provider,{value:$,children:e})};function x(){return new Map}var p=e.i(64978);let k=e=>e.key||"";function m(e){let t=[];return r.Children.forEach(e,e=>{(0,r.isValidElement)(e)&&t.push(e)}),t}e.s(["AnimatePresence",0,({children:e,custom:n,initial:s=!0,onExitComplete:c,presenceAffectsLayout:a=!0,mode:d="sync",propagate:f=!1,anchorX:h="left",anchorY:x="top",root:g})=>{let[y,w]=(0,p.usePresence)(f),C=(0,r.useMemo)(()=>m(e),[e]),$=f&&!y?[]:C.map(k),b=(0,r.useRef)(!0),M=(0,r.useRef)(C),j=(0,l.useConstant)(()=>new Map),A=(0,r.useRef)(new Set),[E,v]=(0,r.useState)(C),[F,L]=(0,r.useState)(C);(0,i.useIsomorphicLayoutEffect)(()=>{b.current=!1,M.current=C;for(let e=0;e<F.length;e++){let t=k(F[e]);$.includes(t)?(j.delete(t),A.current.delete(t)):!0!==j.get(t)&&j.set(t,!1)}},[F,$.length,$.join("-")]);let N=[];if(C!==E){let e=[...C];for(let t=0;t<F.length;t++){let r=F[t],o=k(r);$.includes(o)||(e.splice(t,0,r),N.push(r))}return"wait"===d&&N.length&&(e=N),L(m(e)),v(C),null}let{forceRender:D}=(0,r.useContext)(o.LayoutGroupContext);return(0,t.jsx)(t.Fragment,{children:F.map(e=>{let r=k(e),o=(!f||!!y)&&(C===F||$.includes(r));return(0,t.jsx)(u,{isPresent:o,initial:(!b.current||!!s)&&void 0,custom:n,presenceAffectsLayout:a,mode:d,root:g,onExitComplete:o?void 0:()=>{if(A.current.has(r)||!j.has(r))return;A.current.add(r),j.set(r,!0);let e=!0;j.forEach(t=>{t||(e=!1)}),e&&(D?.(),L(M.current),f&&w?.(),c&&c())},anchorX:h,anchorY:x,children:e},r)})})}],88653)},21038,e=>{"use strict";var t=e.i(43476),r=e.i(46932);e.s(["default",0,function({children:e,onClick:o,disabled:l=!1,variant:i="primary",className:n=""}){return(0,t.jsx)(r.motion.button,{whileTap:l?void 0:{scale:.97},onClick:o,disabled:l,className:`w-full p-[17px] text-center font-serif-kr text-[16px] tracking-[.08em] transition-colors disabled:opacity-50 ${"primary"===i?"bg-[var(--color-juhong)] text-[var(--color-juhong-tint)]":"bg-transparent text-[rgba(46,46,46,0.6)]"} ${n}`,style:"primary"===i?{border:"1px solid var(--color-juhong-deep)",boxShadow:"inset 0 0 0 1px rgba(247, 233, 207, 0.35), 0 8px 22px rgba(167, 43, 33, 0.25)"}:{border:"1px solid rgba(122, 74, 52, 0.3)"},children:e})}])},41481,e=>{"use strict";let t=[{id:"hwangji",label:"한지",swatch:"#F2E7CE",trad:{bg:"#F2E7CE",ink:"#A72B21",text:"#2E2E2E"},modern:{bg1:"#F5EAD5",bg2:"#F5D5C8",ink:"#AA6B3F",accent:"#D4914F"}},{id:"hongji",label:"홍지",swatch:"#B93A32",trad:{bg:"#B93A32",ink:"#F2E7CE",text:"#FFF3D6"},modern:{bg1:"#F5D5D5",bg2:"#F5C8D5",ink:"#A03A3A",accent:"#D46F6F"}},{id:"baekji",label:"백지",swatch:"#F7F3EA",trad:{bg:"#F7F3EA",ink:"#A72B21",text:"#2E2E2E"},modern:{bg1:"#EFEFF5",bg2:"#DDE8F5",ink:"#4F5FAA",accent:"#7A8FD4"}},{id:"simya",label:"심야",swatch:"#151226",trad:{bg:"#151226",ink:"#E8C97A",text:"#D8D4F0"},modern:{bg1:"#1C1830",bg2:"#2A1F42",ink:"#C9B8F0",accent:"#8F7AD4"}},{id:"namsaekji",label:"남색",swatch:"#1F3E63",trad:{bg:"#1F3E63",ink:"#DAA017",text:"#F2E7CE"},modern:{bg1:"#2A4A73",bg2:"#1F3E63",ink:"#E8D9B0",accent:"#DAA017"}},{id:"ssukji",label:"쑥색",swatch:"#6B7D63",trad:{bg:"#6B7D63",ink:"#F2E7CE",text:"#FBF6E8"},modern:{bg1:"#7C8E74",bg2:"#6B7D63",ink:"#F2E7CE",accent:"#DCC9A5"}},{id:"geumji",label:"황금",swatch:"#DAA017",trad:{bg:"#DAA017",ink:"#7A4A34",text:"#3E2A1C"},modern:{bg1:"#E5B23A",bg2:"#DAA017",ink:"#7A4A34",accent:"#A72B21"}}],r=new Set(["hwangji","baekji"]),o=[{bg1:"#E8D5F5",bg2:"#F5D5E8",ink:"#6B3FA0",accent:"#D46FA0"},{bg1:"#D5EEF5",bg2:"#D5F5E8",ink:"#2B7A8A",accent:"#3AAA7A"},{bg1:"#F5EAD5",bg2:"#F5D5D5",ink:"#AA6B3F",accent:"#D46F4F"},{bg1:"#D5D5F5",bg2:"#E8D5F5",ink:"#4F4FAA",accent:"#7A5FD4"},{bg1:"#F5F5D5",bg2:"#E8F5D5",ink:"#6B8A2B",accent:"#8AAA3F"}];function l(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}function i(e,t){let r=[],o="";for(let l of e.split(/\s+/).filter(Boolean)){if(l.length>t){o&&(r.push(o),o="");for(let e=0;e<l.length;e+=t){let i=l.slice(e,e+t);i.length===t?r.push(i):o=i}continue}let e=o?`${o} ${l}`:l;e.length>t?(r.push(o),o=l):o=e}return o&&r.push(o),r}let n={쥐:`<g transform="translate(-20,-20) scale(0.8)">
    <circle cx="25" cy="15" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="25" cy="35" r="15" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="15" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="35" cy="8" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="25" y1="50" x2="30" y2="65" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="22" cy="13" r="1.5" fill="currentColor"/>
    <circle cx="28" cy="13" r="1.5" fill="currentColor"/>
  </g>`,소:`<g transform="translate(-20,-20) scale(0.8)">
    <ellipse cx="25" cy="35" rx="18" ry="15" fill="none" stroke="currentColor" stroke-width="2"/>
    <ellipse cx="25" cy="18" rx="12" ry="10" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M13 12 L8 4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M37 12 L42 4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="20" cy="16" r="2" fill="currentColor"/>
    <circle cx="30" cy="16" r="2" fill="currentColor"/>
    <ellipse cx="25" cy="23" rx="5" ry="3" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </g>`,호랑이:`<g transform="translate(-20,-20) scale(0.8)">
    <ellipse cx="25" cy="25" rx="18" ry="20" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M10 8 L14 18" stroke="currentColor" stroke-width="2"/>
    <path d="M40 8 L36 18" stroke="currentColor" stroke-width="2"/>
    <circle cx="18" cy="22" r="2.5" fill="currentColor"/>
    <circle cx="32" cy="22" r="2.5" fill="currentColor"/>
    <path d="M22 30 L25 33 L28 30" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M15 28 L8 30" stroke="currentColor" stroke-width="1.5"/>
    <path d="M35 28 L42 30" stroke="currentColor" stroke-width="1.5"/>
    <path d="M15 32 L8 34" stroke="currentColor" stroke-width="1.5"/>
    <path d="M35 32 L42 34" stroke="currentColor" stroke-width="1.5"/>
    <path d="M20 15 L17 12 L23 14" stroke="currentColor" stroke-width="1" fill="none"/>
    <path d="M30 15 L33 12 L27 14" stroke="currentColor" stroke-width="1" fill="none"/>
  </g>`,토끼:`<g transform="translate(-20,-20) scale(0.8)">
    <ellipse cx="25" cy="35" rx="14" ry="12" fill="none" stroke="currentColor" stroke-width="2"/>
    <ellipse cx="25" cy="20" rx="10" ry="8" fill="none" stroke="currentColor" stroke-width="2"/>
    <ellipse cx="18" cy="6" rx="4" ry="12" fill="none" stroke="currentColor" stroke-width="2"/>
    <ellipse cx="32" cy="6" rx="4" ry="12" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="21" cy="18" r="2" fill="currentColor"/>
    <circle cx="29" cy="18" r="2" fill="currentColor"/>
    <path d="M23 23 L25 25 L27 23" stroke="currentColor" stroke-width="1.5" fill="none"/>
  </g>`,용:`<g transform="translate(-20,-25) scale(0.8)">
    <path d="M25 10 C35 8 40 15 38 25 C36 35 28 40 20 38 C12 36 8 28 12 20" fill="none" stroke="currentColor" stroke-width="2.5"/>
    <path d="M12 20 C8 15 12 8 20 10" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="22" cy="15" r="2" fill="currentColor"/>
    <circle cx="30" cy="14" r="2" fill="currentColor"/>
    <path d="M38 25 L44 22 L42 28 L48 26" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M18 12 L15 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M28 10 L30 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M22 20 L20 23 L24 22 L26 25" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M15 32 C12 36 14 42 20 38" stroke="currentColor" stroke-width="1" fill="none" stroke-dasharray="2,2"/>
  </g>`,뱀:`<g transform="translate(-20,-20) scale(0.8)">
    <path d="M10 40 C10 30 20 20 25 15 C30 10 35 15 30 22 C25 29 15 25 20 35 C25 45 40 40 40 30" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="25" cy="13" r="5" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="23" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="27" cy="12" r="1.5" fill="currentColor"/>
    <path d="M24 16 L25 18 L26 16" stroke="currentColor" stroke-width="1" fill="none"/>
  </g>`,말:`<g transform="translate(-20,-22) scale(0.8)">
    <ellipse cx="25" cy="32" rx="15" ry="12" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M15 25 L12 10 C12 6 18 6 18 12 L20 22" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="15" cy="11" r="2" fill="currentColor"/>
    <path d="M10 8 L6 3" stroke="currentColor" stroke-width="1.5"/>
    <path d="M16 7 L14 2" stroke="currentColor" stroke-width="1.5"/>
    <path d="M14 15 Q12 18 15 18" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <line x1="15" y1="44" x2="13" y2="55" stroke="currentColor" stroke-width="2"/>
    <line x1="35" y1="44" x2="37" y2="55" stroke="currentColor" stroke-width="2"/>
  </g>`,양:`<g transform="translate(-20,-20) scale(0.8)">
    <circle cx="25" cy="28" r="16" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="25" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M17 8 C14 2 10 4 12 8" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M33 8 C36 2 40 4 38 8" stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="22" cy="11" r="1.5" fill="currentColor"/>
    <circle cx="28" cy="11" r="1.5" fill="currentColor"/>
    <path d="M12 30 Q8 28 10 32 Q12 36 8 34" stroke="currentColor" stroke-width="1" fill="none"/>
    <path d="M38 30 Q42 28 40 32 Q38 36 42 34" stroke="currentColor" stroke-width="1" fill="none"/>
    <line x1="18" y1="44" x2="16" y2="52" stroke="currentColor" stroke-width="2"/>
    <line x1="32" y1="44" x2="34" y2="52" stroke="currentColor" stroke-width="2"/>
  </g>`,원숭이:`<g transform="translate(-20,-20) scale(0.8)">
    <circle cx="25" cy="22" r="14" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="25" cy="24" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="12" cy="18" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="38" cy="18" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="21" cy="20" r="2" fill="currentColor"/>
    <circle cx="29" cy="20" r="2" fill="currentColor"/>
    <ellipse cx="25" cy="28" rx="3" ry="2" fill="none" stroke="currentColor" stroke-width="1"/>
    <path d="M25 36 C28 42 35 45 40 42" stroke="currentColor" stroke-width="2" fill="none"/>
  </g>`,닭:`<g transform="translate(-20,-20) scale(0.8)">
    <ellipse cx="25" cy="32" rx="13" ry="15" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="25" cy="14" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M25 6 L23 2 L25 4 L27 2 Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <circle cx="22" cy="13" r="1.5" fill="currentColor"/>
    <circle cx="28" cy="13" r="1.5" fill="currentColor"/>
    <path d="M25 18 L28 20 L25 19" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M38 30 L44 28 L42 32 L48 30" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <line x1="20" y1="47" x2="17" y2="54" stroke="currentColor" stroke-width="2"/>
    <line x1="30" y1="47" x2="33" y2="54" stroke="currentColor" stroke-width="2"/>
  </g>`,개:`<g transform="translate(-20,-20) scale(0.8)">
    <ellipse cx="25" cy="32" rx="14" ry="13" fill="none" stroke="currentColor" stroke-width="2"/>
    <ellipse cx="25" cy="16" rx="10" ry="9" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M15 12 L8 5 L12 15" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M35 12 L42 5 L38 15" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="21" cy="15" r="2" fill="currentColor"/>
    <circle cx="29" cy="15" r="2" fill="currentColor"/>
    <ellipse cx="25" cy="20" rx="4" ry="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <path d="M38 38 C42 36 44 40 40 42" stroke="currentColor" stroke-width="2" fill="none"/>
  </g>`,돼지:`<g transform="translate(-20,-20) scale(0.8)">
    <ellipse cx="25" cy="28" rx="18" ry="16" fill="none" stroke="currentColor" stroke-width="2"/>
    <ellipse cx="25" cy="30" rx="8" ry="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="22" cy="28" r="1.5" fill="currentColor"/>
    <circle cx="28" cy="28" r="1.5" fill="currentColor"/>
    <circle cx="18" cy="20" r="2.5" fill="currentColor"/>
    <circle cx="32" cy="20" r="2.5" fill="currentColor"/>
    <path d="M14 14 L10 8" stroke="currentColor" stroke-width="2"/>
    <path d="M36 14 L40 8" stroke="currentColor" stroke-width="2"/>
    <path d="M38 38 Q42 40 40 44 Q38 42 36 44" stroke="currentColor" stroke-width="2" fill="none"/>
  </g>`};function s(e,t,r,o){return`<g transform="translate(${e},${t}) scale(${r})" opacity="0.6">
    <circle cx="0" cy="0" r="8" fill="none" stroke="${o}" stroke-width="1.5"/>
    <circle cx="10" cy="-3" r="6" fill="none" stroke="${o}" stroke-width="1.5"/>
    <circle cx="-8" cy="2" r="5" fill="none" stroke="${o}" stroke-width="1.5"/>
    <circle cx="5" cy="4" r="7" fill="none" stroke="${o}" stroke-width="1.5"/>
  </g>`}function c(e,t,r,o){let l=[];for(let o=0;o<5;o++){let i=Math.PI/2+2*o*Math.PI/5,n=i+Math.PI/5;l.push(`${e+r*Math.cos(i)},${t-r*Math.sin(i)}`),l.push(`${e+.4*r*Math.cos(n)},${t-.4*r*Math.sin(n)}`)}return`<polygon points="${l.join(" ")}" fill="none" stroke="${o}" stroke-width="1.5" opacity="0.6"/>`}e.s(["ANIMAL_PATHS",0,n,"generateTalismanSVG",0,function(e){var a;if(e.assetUrl)return function(e){let{assetUrl:t,message:r}=e,o="#F2E7CE",n=r?i(r,12).slice(0,2):[],s=n.length?26+24*n.length:0,c=560-s-14,a=n.length?`<rect x="18" y="${c}" width="324" height="${s}" rx="6"
         fill="${o}" opacity="0.9"/>
       <rect x="18" y="${c}" width="324" height="${s}" rx="6"
         fill="none" stroke="#A72B21" stroke-width="1" opacity="0.45"/>`:"",d=n.map((e,t)=>`<text x="168" y="${c+30+24*t}" text-anchor="middle" font-size="17" fill="#2E2E2E" font-family="'Gowun Batang', 'AppleMyungjo', serif">${l(e)}</text>`).join("");return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 560" preserveAspectRatio="xMidYMid meet">
  <rect width="360" height="560" fill="${o}"/>
  <image href="${l(t??"")}" x="0" y="0" width="360" height="560" preserveAspectRatio="xMidYMid meet"/>
  ${a}
  ${d}
  
</svg>`}(e);let d=(a=e.background)?t.find(e=>e.id===a):void 0;return"traditional"===e.style?function(e,t){let{bgColor:o,animal:s,title:c,hanja:a,message:d,mantra:f}=t,h=e?.trad??{bg:"#F2E7CE",ink:"#A72B21",text:"#2E2E2E"},u=h.bg||o||"#F2E7CE",x=(!e||r.has(e.id))&&t.accent||h.ink,p=h.text,k=`<path d="M0 14V0h14M5 14V5h9" fill="none" stroke="${x}" stroke-width="1.4" opacity="0.55"/>`,m=`
    <g transform="translate(30,30)">${k}</g>
    <g transform="translate(${330},30) scale(-1,1)">${k}</g>
    <g transform="translate(30,${530}) scale(1,-1)">${k}</g>
    <g transform="translate(${330},${530}) scale(-1,-1)">${k}</g>
  `,g=`
    <g transform="translate(${180}, 70)" stroke="${x}" fill="none">
      <path d="M0 -22v7" stroke-width="2" stroke-linecap="round"/>
      <rect x="-10" y="-13" width="20" height="20" rx="2" transform="rotate(45 0 -3)" stroke-width="2"/>
      <rect x="-5" y="-8" width="10" height="10" rx="1" transform="rotate(45 0 -3)" stroke-width="1.2"/>
      <path d="M-13 -3c-5 0-5 7 0 7M13 -3c5 0 5 7 0 7" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M-4 11l-2 11M4 11l2 11M0 12v11" stroke-width="1.4" stroke-linecap="round"/>
    </g>
  `,y="";s&&n[s]&&(y=`<g transform="translate(${180}, 208)" color="${x}" opacity="0.9">${n[s]}</g>`);let w=i(d,7).slice(0,3),C=y?272:248,$="";w.forEach((e,t)=>{let r=180+((w.length-1)/2-t)*38;[...e.replace(/\s+/g,"")].forEach((e,t)=>{$+=`<text x="${r}" y="${C+28*t}" text-anchor="middle" font-size="20" fill="${p}" font-family="'Gowun Batang', 'AppleMyungjo', serif">${l(e)}</text>`})});let b=`<text x="0" y="-2" text-anchor="middle" font-size="11" font-weight="bold" fill="#F2E7CE" font-family="serif">수호</text>
       <text x="0" y="12" text-anchor="middle" font-size="11" font-weight="bold" fill="#F2E7CE" font-family="serif">부</text>`,M=t.noSeal?"":`
    <g transform="translate(${180}, ${506})">
      <rect x="-19" y="-19" width="38" height="38" rx="4" fill="#A72B21"/>
      <rect x="-14.5" y="-14.5" width="29" height="29" rx="3" fill="none" stroke="#F2E7CE" stroke-width="1.2" opacity="0.9"/>
      ${b}
    </g>
  `;return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${360} ${560}" preserveAspectRatio="xMidYMid meet">
  <defs>
    <filter id="paper-texture">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
      <feDiffuseLighting in="noise" lighting-color="${u}" surfaceScale="1.2" result="lit">
        <feDistantLight azimuth="45" elevation="58"/>
      </feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="lit" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>
    </filter>
  </defs>

  <!-- 한지 배경 -->
  <rect width="${360}" height="${560}" fill="${u}"/>
  <rect width="${360}" height="${560}" fill="${u}" opacity="0.25" filter="url(#paper-texture)"/>

  <!-- 주홍 이중 테두리 -->
  <rect x="14" y="14" width="${332}" height="${532}" fill="none" stroke="${x}" stroke-width="2.5"/>
  <rect x="21" y="21" width="${318}" height="${518}" fill="none" stroke="${x}" stroke-width="1" opacity="0.8"/>

  <!-- 모서리 뇌문 -->
  ${m}

  <!-- 상단 매듭 -->
  ${g}

  <!-- 두전 (제목) -->
  <text x="${180}" y="134" text-anchor="middle" font-size="24" font-weight="bold" fill="${x}" font-family="'Gowun Batang', 'AppleMyungjo', serif">${l(c)}</text>
  ${a?`<text x="${180}" y="156" text-anchor="middle" font-size="12" fill="${x}" opacity="0.75" font-family="serif">${l(a)}</text>`:""}
  <line x1="${128}" y1="${a?170:152}" x2="${232}" y2="${a?170:152}" stroke="${x}" stroke-width="1" opacity="0.4"/>

  <!-- 수호 동물 -->
  ${y}

  <!-- 기원 문구 -->
  ${$}

  <!-- 각획 (주문) -->
  <line x1="90" y1="${448}" x2="${270}" y2="${448}" stroke="${x}" stroke-width="1" opacity="0.35"/>
  ${f?`<text x="${180}" y="${468}" text-anchor="middle" font-size="12" fill="${x}" opacity="0.85" font-family="serif">${l(f)}</text>`:""}

  <!-- 낙관 -->
  ${M}
</svg>`}(d,e):function(e,t,r,a,d,f,h,u){var x,p,k;let m=Math.abs(a.split("").reduce((e,t)=>e+t.charCodeAt(0),0))%o.length,g=o[m],y=e?.modern.bg1||t||g.bg1,w=e?.modern.bg2||g.bg2,C=e?.modern.ink||g.ink,$=e?.modern.accent||g.accent,b="";b+=s(55,90,.7,$),b+=s(305,90,.7,$),u?.includes("별")&&(b+=c(50,140,6,$),b+=c(310,140,6,$),b+=c(120,280,5,$),b+=c(240,280,5,$)),u?.includes("연꽃")&&(b+=(x=180,p=400,`<g transform="translate(${x},${p}) scale(0.8)" opacity="0.7">
    <ellipse cx="0" cy="-5" rx="4" ry="10" fill="none" stroke="${$}" stroke-width="1.5"/>
    <ellipse cx="-7" cy="-3" rx="4" ry="9" fill="none" stroke="${$}" stroke-width="1.5" transform="rotate(-25,-7,-3)"/>
    <ellipse cx="7" cy="-3" rx="4" ry="9" fill="none" stroke="${$}" stroke-width="1.5" transform="rotate(25,7,-3)"/>
    <ellipse cx="-12" cy="0" rx="3" ry="7" fill="none" stroke="${$}" stroke-width="1.5" transform="rotate(-45,-12,0)"/>
    <ellipse cx="12" cy="0" rx="3" ry="7" fill="none" stroke="${$}" stroke-width="1.5" transform="rotate(45,12,0)"/>
  </g>`)),u?.includes("태극")&&(b+=(k=180,`<g transform="translate(${k},140)">
    <circle cx="0" cy="0" r="14" fill="none" stroke="${C}" stroke-width="1.5"/>
    <path d="M0 -14 A14 14 0 0 1 0 14 A7 7 0 0 0 0 0 A7 7 0 0 1 0 -14" fill="${C}" opacity="0.3"/>
    <circle cx="0" cy="-7" r="2.8" fill="${C}"/>
    <circle cx="0" cy="7" r="2.8" fill="none" stroke="${C}" stroke-width="1"/>
  </g>`));let M="";r&&n[r]&&(M=`<g transform="translate(${180}, 210)" color="${C}">${n[r]}</g>`);let j=i(d,14),A="";for(let e=0;e<Math.min(j.length,4);e++)A+=`<text x="${180}" y="${300+28*e}" text-anchor="middle" font-size="16" fill="${C}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif">${l(j[e])}</text>`;return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${360} ${560}" preserveAspectRatio="xMidYMid meet">
  <defs>
    <linearGradient id="modern-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${y}"/>
      <stop offset="100%" stop-color="${w}"/>
    </linearGradient>
    <filter id="soft-shadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
      <feOffset dx="0" dy="2"/>
      <feComposite in2="SourceAlpha" operator="arithmetic" k1="0" k2="0.1" k3="0.1" k4="0"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- 배경 (그라데이션) -->
  <rect width="${360}" height="${560}" rx="24" ry="24" fill="url(#modern-bg)"/>

  <!-- 테두리 -->
  
    <rect x="16" y="16" width="${328}" height="${528}" rx="20" ry="20" fill="none" stroke="${$}" stroke-width="2" stroke-dasharray="6,4" opacity="0.5"/>
  

  <!-- 장식 -->
  ${b}

  <!-- 상단 이모지 장식 -->
  <text x="${180}" y="50" text-anchor="middle" font-size="28">✨</text>

  <!-- 두전 (상단 제목) -->
  <text x="${180}" y="85" text-anchor="middle" font-size="24" font-weight="bold" fill="${C}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" filter="url(#soft-shadow)">${l(a)}</text>

  <!-- 구분 장식 -->
  <line x1="${140}" y1="98" x2="${220}" y2="98" stroke="${$}" stroke-width="2" opacity="0.5" stroke-linecap="round"/>

  <!-- 동물 심볼 -->
  ${M}

  <!-- 메시지 -->
  ${A}

  <!-- 하단 구분 -->
  <line x1="${120}" y1="${440}" x2="${240}" y2="${440}" stroke="${$}" stroke-width="1.5" opacity="0.4" stroke-linecap="round"/>

  <!-- 각획 (하단 주문) -->
  <text x="${180}" y="${470}" text-anchor="middle" font-size="13" fill="${C}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" opacity="0.8">${l(f)}</text>

  <!-- 하단 이모지 -->
  <text x="${180}" y="${520}" text-anchor="middle" font-size="20">🙏</text>

  <!-- 인장 -->
  
</svg>`}(d,e.bgColor,e.animal,e.title,e.message,e.mantra,e.userName,e.symbols)}])},38992,e=>{"use strict";var t=e.i(25405);function r(e){let t="";for(let r=0;r<e.length;r++)t+=String.fromCharCode(e[r]);return btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function o(e){try{let t=e.replace(/-/g,"+").replace(/_/g,"/")+"=".repeat((4-e.length%4)%4),r=atob(t),o=new Uint8Array(r.length);for(let e=0;e<r.length;e++)o[e]=r.charCodeAt(e);return o}catch{return null}}function l(e,t){return"string"!=typeof e?"":e.replace(/<[^>]*>/g,"").replace(/[<>]/g,"").replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g,"").trim().slice(0,t)}e.s(["GIFT_MESSAGE_MAX",0,80,"GIFT_NAME_MAX",0,12,"buildGiftUrl",0,function(e){let t,o=(t={v:1,t:e.t,m:l(e.m,80),f:l(e.f,12),c:e.c},r(new TextEncoder().encode(JSON.stringify(t)))),i=window.location.pathname.startsWith("/bujeok-app")?"/bujeok-app":"";return`${window.location.origin}${i}/gift/?d=${o}`},"decodeGift",0,function(e){let r;if(!e||"string"!=typeof e||e.length>2e3)return null;let i=o(e);if(!i)return null;try{r=JSON.parse(new TextDecoder().decode(i))}catch{return null}if(!r||"object"!=typeof r)return null;let n=r;if(1!==n.v||"string"!=typeof n.t)return null;let s=t.TALISMANS.find(e=>e.id===n.t);if(!s)return null;let c="string"!=typeof n.c||Number.isNaN(new Date(n.c).getTime())?"":n.c.slice(0,40);return{v:1,t:s.id,m:l(n.m,80),f:l(n.f,12),c}},"fromBase64Url",0,o,"giftHash",0,function(e){let t=5381;for(let r=0;r<e.length;r++)t=(t<<5)+t+e.charCodeAt(r)>>>0;return t.toString(36)},"sanitizeText",0,l,"toBase64Url",0,r])},88223,e=>{"use strict";var t=e.i(43476),r=e.i(71645),o=e.i(18566),l=e.i(46932),i=e.i(88653),n=e.i(25405),s=e.i(38992),c=e.i(41481),a=e.i(61568),d=e.i(64275),f=e.i(21038),h=e.i(59897);function u(){let e=(0,o.useRouter)(),u=(0,o.useSearchParams)().get("d")??"",x=(0,r.useMemo)(()=>(0,s.decodeGift)(u),[u]),p=(0,r.useMemo)(()=>x?n.TALISMANS.find(e=>e.id===x.t)??null:null,[x]),k=(0,r.useMemo)(()=>u?`gift-${(0,s.giftHash)(u)}`:"",[u]),[m,g]=(0,r.useState)("wrapped"),[y,w]=(0,r.useState)(!1),[C,$]=(0,r.useState)(!1),b=(0,r.useMemo)(()=>x&&p?(0,c.generateTalismanSVG)({type:p.id,style:"traditional",background:"hwangji",accent:p.colors[2],title:p.name,hanja:p.hanja,message:x.m,mantra:p.mantra,symbols:[...p.design.patterns,...p.design.symbols]}):"",[x,p]);return(0,r.useEffect)(()=>{if(k)try{JSON.parse(localStorage.getItem("bujeok-collection")||"[]").some(e=>e.id===k)&&$(!0)}catch{}},[k]),(0,t.jsxs)(a.default,{children:[(0,t.jsx)(d.default,{left:(0,t.jsx)("button",{onClick:()=>e.push("/"),"aria-label":"홈으로",children:(0,t.jsx)(h.BackIcon,{size:20})}),title:"부적 선물"}),(0,t.jsx)("div",{className:"mx-auto flex w-full max-w-md flex-1 flex-col items-center px-5 pb-16",children:x&&p?(0,t.jsx)(i.AnimatePresence,{mode:"wait",children:"wrapped"===m?(0,t.jsxs)(l.motion.div,{initial:{opacity:0,y:24},animate:{opacity:1,y:0},exit:{opacity:0,scale:1.06,rotate:1.5},transition:{duration:.45},className:"flex w-full flex-col items-center pt-8",children:[(0,t.jsx)("p",{className:"mb-6 text-center font-serif-kr text-sm leading-relaxed text-[var(--color-galsaek)]",children:x.f?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("span",{className:"font-bold text-[var(--color-meok)]",children:x.f}),"님이 당신을 위해",(0,t.jsx)("br",{}),"부적을 보냈어요"]}):(0,t.jsxs)(t.Fragment,{children:["누군가가 당신을 위해",(0,t.jsx)("br",{}),"부적을 보냈어요"]})}),(0,t.jsxs)(l.motion.button,{onClick:()=>g("opened"),whileTap:{scale:.96},animate:{y:[0,-6,0]},transition:{repeat:1/0,duration:2.4,ease:"easeInOut"},className:"relative flex h-[300px] w-[230px] flex-col items-center justify-center rounded-xl",style:{background:"linear-gradient(160deg, #B93A32 0%, #A72B21 55%, #8E241C 100%)",boxShadow:"0 6px 24px rgba(122,74,52,0.35), inset 0 0 0 1px rgba(242,230,204,0.35)"},"aria-label":"선물 열어보기",children:[(0,t.jsx)("span",{className:"pointer-events-none absolute inset-3 rounded-lg",style:{border:"1px dashed rgba(242,230,204,0.5)"}}),(0,t.jsx)(h.CornerMotif,{className:"absolute left-4 top-4 text-[#F2E7CE] opacity-60",size:22}),(0,t.jsx)(h.CornerMotif,{className:"absolute right-4 top-4 rotate-90 text-[#F2E7CE] opacity-60",size:22}),(0,t.jsx)(h.CornerMotif,{className:"absolute bottom-4 left-4 -rotate-90 text-[#F2E7CE] opacity-60",size:22}),(0,t.jsx)(h.CornerMotif,{className:"absolute bottom-4 right-4 rotate-180 text-[#F2E7CE] opacity-60",size:22}),(0,t.jsx)(h.KnotMotif,{size:64,className:"text-[#F2E7CE]"}),(0,t.jsx)("span",{className:"mt-4 font-serif-kr text-lg font-bold tracking-widest text-[#F6EDD9]",children:"福"})]}),(0,t.jsx)(l.motion.p,{animate:{opacity:[.5,1,.5]},transition:{repeat:1/0,duration:2},className:"mt-6 text-xs text-[var(--color-galsaek)]",children:"살짝 눌러 보자기를 풀어보세요"})]},"wrapped"):(0,t.jsxs)(l.motion.div,{initial:{opacity:0},animate:{opacity:1},transition:{duration:.4},className:"flex w-full flex-col items-center pt-2",children:[(0,t.jsx)(l.motion.div,{initial:{opacity:0,scale:.8,y:20},animate:{opacity:1,scale:1,y:0},transition:{delay:.15,duration:.7,type:"spring",damping:16},className:"mb-5 w-[220px] overflow-hidden rounded-lg",style:{aspectRatio:"360 / 560",boxShadow:"0 0 40px rgba(232,195,106,0.5), 0 4px 16px rgba(122,74,52,0.25)"},dangerouslySetInnerHTML:{__html:b}}),(0,t.jsxs)(l.motion.div,{initial:{opacity:0,y:12},animate:{opacity:1,y:0},transition:{delay:.6},className:"mb-5 w-full text-center",children:[(0,t.jsxs)("h2",{className:"font-serif-kr text-xl font-bold text-[var(--color-meok)]",children:["「",p.name,"」",(0,t.jsx)("span",{className:"ml-1.5 text-sm font-normal text-[var(--color-galsaek)]",children:p.hanja})]}),(0,t.jsx)("p",{className:"mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[var(--color-galsaek)]",children:p.description}),(x.m||x.f)&&(0,t.jsxs)("div",{className:"mx-auto mt-4 max-w-xs rounded-lg px-4 py-3",style:{border:"1px solid rgba(122,74,52,0.35)",backgroundColor:"rgba(246,237,217,0.8)"},children:[x.m&&(0,t.jsxs)("p",{className:"font-serif-kr text-sm leading-relaxed text-[var(--color-meok)]",children:["“",x.m,"”"]}),x.f&&(0,t.jsxs)("p",{className:"mt-1.5 text-[11px] text-[var(--color-galsaek)] opacity-80",children:["보낸 이: ",x.f]})]}),(0,t.jsx)("div",{className:"mt-4 flex justify-center text-[var(--color-meok)] opacity-50",children:(0,t.jsx)(h.BrushStroke,{width:90})})]}),(0,t.jsxs)(l.motion.div,{initial:{opacity:0,y:12},animate:{opacity:1,y:0},transition:{delay:.9},className:"flex w-full max-w-xs flex-col gap-3",children:[C?(0,t.jsx)("div",{className:"w-full rounded-lg py-3.5 text-center font-serif-kr text-base font-bold text-[var(--color-ssuk)]",style:{border:"1px solid rgba(107,125,99,0.5)"},children:"이미 간직한 부적이에요"}):y?(0,t.jsx)("div",{className:"w-full rounded-lg py-3.5 text-center font-serif-kr text-base font-bold text-[var(--color-ssuk)]",style:{border:"1px solid rgba(107,125,99,0.5)"},children:"✓ 부적함에 간직했어요"}):(0,t.jsx)(f.default,{onClick:()=>{if(!x||!p||C||y)return;let e={...p,id:k,sourceId:p.id,savedAt:new Date().toISOString(),note:x.m||void 0,svg:b,source:"gift",fromName:x.f||void 0};try{let t=JSON.parse(localStorage.getItem("bujeok-collection")||"[]");if(t.some(e=>e.id===k))return void $(!0);t.unshift(e),localStorage.setItem("bujeok-collection",JSON.stringify(t)),w(!0)}catch{}},children:"내 부적함에 간직하기"}),(0,t.jsx)(f.default,{variant:"ghost",onClick:()=>e.push("/talisman"),children:"나도 부적 보내기"})]})]},"opened")}):(0,t.jsxs)(l.motion.div,{initial:{opacity:0,y:16},animate:{opacity:1,y:0},className:"flex flex-col items-center pt-16 text-center",children:[(0,t.jsx)(h.KnotMotif,{size:56,className:"mb-4 text-[var(--color-galsaek)] opacity-50"}),(0,t.jsx)("p",{className:"font-serif-kr text-base font-bold text-[var(--color-meok)]",children:"선물 보자기가 풀려 있어요"}),(0,t.jsxs)("p",{className:"mt-2 max-w-[240px] text-xs leading-relaxed text-[var(--color-galsaek)]",children:["링크가 잘못되었거나 오래된 선물이에요.",(0,t.jsx)("br",{}),"대신, 소중한 사람에게 보낼 부적을",(0,t.jsx)("br",{}),"직접 만들어 보는 건 어떨까요?"]}),(0,t.jsx)("div",{className:"mt-6 w-full max-w-[220px]",children:(0,t.jsx)(f.default,{onClick:()=>e.push("/talisman"),children:"나만의 부적 짓기"})})]})})]})}e.s(["default",0,function(){return(0,t.jsx)(r.Suspense,{fallback:null,children:(0,t.jsx)(u,{})})}])}]);