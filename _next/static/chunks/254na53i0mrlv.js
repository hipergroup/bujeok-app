(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,3332,t=>{t.q("/bujeok-app/_next/static/media/쥐.0b2b4wo8l3y1n.png")},32891,t=>{t.q("/bujeok-app/_next/static/media/소.2bgc6qc0dy2vy.png")},24159,t=>{t.q("/bujeok-app/_next/static/media/호랑이.1z9rin3j2eqz0.png")},85333,t=>{t.q("/bujeok-app/_next/static/media/토끼.0vx6um9dfph3e.png")},73349,t=>{t.q("/bujeok-app/_next/static/media/용.1n1h6-97_h6-j.png")},6258,t=>{t.q("/bujeok-app/_next/static/media/뱀.2iq2lryww8w5u.png")},27307,t=>{t.q("/bujeok-app/_next/static/media/말.3a0ahmm1y54mo.png")},5054,t=>{t.q("/bujeok-app/_next/static/media/양.0n9btt0vn2m67.png")},7065,t=>{t.q("/bujeok-app/_next/static/media/원숭이.3v-z3x879c47t.png")},61732,t=>{t.q("/bujeok-app/_next/static/media/닭.0te_j_r9ajnvv.png")},20394,t=>{t.q("/bujeok-app/_next/static/media/개.0j_i5vs1gnbpu.png")},91102,t=>{t.q("/bujeok-app/_next/static/media/돼지.03auexaabrlzf.png")},11301,t=>{t.q("/bujeok-app/_next/static/media/hosinbu-gift.30fsi7rz8zyie.png")},96252,t=>{t.q("/bujeok-app/_next/static/media/wordmark.3v6thinacegyf.png")},88653,t=>{"use strict";t.i(47167);var e=t.i(43476),r=t.i(71645),o=t.i(31178),i=t.i(47414),l=t.i(74008),n=t.i(21476),a=t.i(72846),s=r,c=t.i(37806);function h(t,e){if("function"==typeof t)return t(e);null!=t&&(t.current=e)}class d extends s.Component{getSnapshotBeforeUpdate(t){let e=this.props.childRef.current;if((0,a.isHTMLElement)(e)&&t.isPresent&&!this.props.isPresent&&!1!==this.props.pop){let t=e.offsetParent,r=(0,a.isHTMLElement)(t)&&t.offsetWidth||0,o=(0,a.isHTMLElement)(t)&&t.offsetHeight||0,i=getComputedStyle(e),l=this.props.sizeRef.current;l.height=parseFloat(i.height),l.width=parseFloat(i.width),l.top=e.offsetTop,l.left=e.offsetLeft,l.right=r-l.width-l.left,l.bottom=o-l.height-l.top,l.direction=i.direction}return null}componentDidUpdate(){}render(){return this.props.children}}function f({children:t,isPresent:o,anchorX:i,anchorY:l,root:n,pop:a}){let u=(0,s.useId)(),g=(0,s.useRef)(null),A=(0,s.useRef)({width:0,height:0,top:0,left:0,right:0,bottom:0,direction:"ltr"}),{nonce:p}=(0,s.useContext)(c.MotionConfigContext),k=function(...t){return r.useCallback(function(...t){return e=>{let r=!1,o=t.map(t=>{let o=h(t,e);return r||"function"!=typeof o||(r=!0),o});if(r)return()=>{for(let e=0;e<o.length;e++){let r=o[e];"function"==typeof r?r():h(t[e],null)}}}}(...t),t)}(g,!1!==a?t.props?.ref??t?.ref:void 0);return(0,s.useInsertionEffect)(()=>{let{width:t,height:e,top:r,left:s,right:c,bottom:h,direction:d}=A.current;if(o||!1===a||!g.current||!t||!e)return;let f="rtl"===d,k="left"===i?f?`right: ${c}`:`left: ${s}`:f?`left: ${s}`:`right: ${c}`,x="bottom"===l?`bottom: ${h}`:`top: ${r}`;g.current.dataset.motionPopId=u;let w=document.createElement("style");p&&(w.nonce=p);let y=n??document.head;return y.appendChild(w),w.sheet&&w.sheet.insertRule(`
          [data-motion-pop-id="${u}"] {
            position: absolute !important;
            width: ${t}px !important;
            height: ${e}px !important;
            ${k}px !important;
            ${x}px !important;
          }
        `),()=>{g.current?.removeAttribute("data-motion-pop-id"),y.contains(w)&&y.removeChild(w)}},[o]),(0,e.jsx)(d,{isPresent:o,childRef:g,sizeRef:A,pop:a,children:!1===a?t:s.cloneElement(t,{ref:k})})}let u=({children:t,initial:o,isPresent:a,onExitComplete:s,custom:c,presenceAffectsLayout:h,mode:d,anchorX:u,anchorY:A,root:p})=>{let k=(0,i.useConstant)(g),x=(0,r.useId)(),w=(0,r.useRef)(a),y=(0,r.useRef)(s);(0,l.useIsomorphicLayoutEffect)(()=>{w.current=a,y.current=s});let m=!0,C=(0,r.useMemo)(()=>(m=!1,{id:x,initial:o,isPresent:a,custom:c,onExitComplete:t=>{for(let e of(k.set(t,!0),k.values()))if(!e)return;s&&s()},register:t=>(k.set(t,!1),()=>{k.delete(t),w.current||k.size||y.current?.()})}),[a,k,s]);return h&&m&&(C={...C}),(0,r.useMemo)(()=>{k.forEach((t,e)=>k.set(e,!1))},[a]),r.useEffect(()=>{a||k.size||!s||s()},[a]),t=(0,e.jsx)(f,{pop:"popLayout"===d,isPresent:a,anchorX:u,anchorY:A,root:p,children:t}),(0,e.jsx)(n.PresenceContext.Provider,{value:C,children:t})};function g(){return new Map}var A=t.i(64978);let p=t=>t.key||"";function k(t){let e=[];return r.Children.forEach(t,t=>{(0,r.isValidElement)(t)&&e.push(t)}),e}t.s(["AnimatePresence",0,({children:t,custom:n,initial:a=!0,onExitComplete:s,presenceAffectsLayout:c=!0,mode:h="sync",propagate:d=!1,anchorX:f="left",anchorY:g="top",root:x})=>{let[w,y]=(0,A.usePresence)(d),m=(0,r.useMemo)(()=>k(t),[t]),C=d&&!w?[]:m.map(p),b=(0,r.useRef)(!0),$=(0,r.useRef)(m),E=(0,i.useConstant)(()=>new Map),L=(0,r.useRef)(new Set),[M,R]=(0,r.useState)(m),[B,F]=(0,r.useState)(m);(0,l.useIsomorphicLayoutEffect)(()=>{b.current=!1,$.current=m;for(let t=0;t<B.length;t++){let e=p(B[t]);C.includes(e)?(E.delete(e),L.current.delete(e)):!0!==E.get(e)&&E.set(e,!1)}},[B,C.length,C.join("-")]);let D=[];if(m!==M){let t=[...m];for(let e=0;e<B.length;e++){let r=B[e],o=p(r);C.includes(o)||(t.splice(e,0,r),D.push(r))}return"wait"===h&&D.length&&(t=D),F(k(t)),R(m),null}let{forceRender:S}=(0,r.useContext)(o.LayoutGroupContext);return(0,e.jsx)(e.Fragment,{children:B.map(t=>{let r=p(t),o=(!d||!!w)&&(m===B||C.includes(r));return(0,e.jsx)(u,{isPresent:o,initial:(!b.current||!!a)&&void 0,custom:n,presenceAffectsLayout:c,mode:h,root:x,onExitComplete:o?void 0:()=>{if(L.current.has(r)||!E.has(r))return;L.current.add(r),E.set(r,!0);let t=!0;E.forEach(e=>{e||(t=!1)}),t&&(S?.(),F($.current),d&&y?.(),s&&s())},anchorX:f,anchorY:g,children:t},r)})})}],88653)},21038,t=>{"use strict";var e=t.i(43476),r=t.i(46932);t.s(["default",0,function({children:t,onClick:o,disabled:i=!1,variant:l="primary",className:n=""}){return(0,e.jsxs)(r.motion.button,{whileTap:i?void 0:{scale:.97},onClick:o,disabled:i,className:`relative w-full rounded-lg px-6 py-3.5 font-serif-kr text-base font-bold tracking-wider transition-colors disabled:opacity-50 ${"primary"===l?"bg-[var(--color-juhong)] text-[#F6EDD9] shadow-[0_2px_8px_rgba(167,43,33,0.35)]":"bg-transparent text-[var(--color-galsaek)]"} ${n}`,style:{border:"1px solid rgba(220, 201, 165, 0.9)"},children:[(0,e.jsx)("span",{className:"pointer-events-none absolute inset-[3px] rounded-md",style:{border:"primary"===l?"1px solid rgba(242, 230, 204, 0.45)":"1px solid rgba(122, 74, 52, 0.3)"}}),t]})}])},66057,19693,t=>{"use strict";let e="rgba(232, 195, 106, 0.55)";async function r(t){let e=[...t.matchAll(/href="((?:\/|https?:)[^"]+)"/g)].map(t=>t[1]);if(0===e.length)return t;let r=t;for(let t of new Set(e))try{let e=await fetch(t);if(!e.ok)continue;let o=await new Promise((t,r)=>{let o=new FileReader;o.onload=()=>t(o.result),o.onerror=()=>r(Error("이미지 인라인 실패")),e.blob().then(t=>o.readAsDataURL(t),r)});r=r.split(`href="${t}"`).join(`href="${o}"`)}catch{}return r}function o(t,e,r){return new Promise((o,i)=>{let l=new Blob([t.replace(/<svg([^>]*?)>/,`<svg$1 width="${e}" height="${r}">`)],{type:"image/svg+xml;charset=utf-8"}),n=URL.createObjectURL(l),a=new Image;a.onload=()=>{URL.revokeObjectURL(n),o(a)},a.onerror=()=>{URL.revokeObjectURL(n),i(Error("부적 이미지 로딩에 실패했습니다."))},a.src=n})}function i(t){return new Promise((e,r)=>{t.toBlob(t=>{t?e(t):r(Error("이미지 변환에 실패했습니다."))},"image/png")})}async function l(t,l,n){var a,s;let c=await r(t);if("original"===l){let t=await o(c,1080,1680),e=document.createElement("canvas");e.width=1080,e.height=1680;let r=e.getContext("2d");if(!r)throw Error("Canvas 2D context를 생성할 수 없습니다.");return r.drawImage(t,0,0),i(e)}let h="story"===l?1920:1080,d="story"===l?1150:760,f=Math.round(360*d/560),u=await o(c,2*f,2*d),g=document.createElement("canvas");g.width=1080,g.height=h;let A=g.getContext("2d");if(!A)throw Error("Canvas 2D context를 생성할 수 없습니다.");!function(t,e){let r=t.createLinearGradient(0,0,0,e);r.addColorStop(0,"#100D1C"),r.addColorStop(.5,"#171226"),r.addColorStop(1,"#0D0B12"),t.fillStyle=r,t.fillRect(0,0,1080,e);let o=t.createRadialGradient(540,e/2,0,540,e/2,e/2);o.addColorStop(0,"rgba(232, 195, 106, 0.10)"),o.addColorStop(1,"rgba(232, 195, 106, 0)"),t.fillStyle=o,t.fillRect(0,0,1080,e);let i=42,l=()=>(i=(9301*i+49297)%233280)/233280;for(let r=0;r<40;r++){let r=1080*l(),o=l()*e,i=2.2*l()+.6;t.fillStyle=`rgba(232, 195, 106, ${.12+.25*l()})`,t.beginPath(),t.arc(r,o,i,0,2*Math.PI),t.fill()}}(A,h),a=(1080-f)/2,s="story"===l?(h-d)/2+20:(h-d)/2-30,A.save(),A.shadowColor="rgba(232, 195, 106, 0.45)",A.shadowBlur=60,A.beginPath(),A.moveTo(a+28,s),A.arcTo(a+f,s,a+f,s+d,28),A.arcTo(a+f,s+d,a,s+d,28),A.arcTo(a,s+d,a,s,28),A.arcTo(a,s,a+f,s,28),A.closePath(),A.fillStyle="#111",A.fill(),A.shadowBlur=0,A.clip(),A.drawImage(u,a,s,f,d),A.restore(),A.strokeStyle=e,A.lineWidth=3,A.beginPath(),A.roundRect(a,s,f,d,28),A.stroke(),A.textAlign="center",A.fillStyle=e,A.font=`500 ${"story"===l?40:34}px 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif`,A.fillText("✦ 수호부적 ✦",540,"story"===l?150:90);let p="story"===l?h-220:h-110;return A.fillStyle="#E8C36A",A.font=`700 ${"story"===l?58:48}px 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif`,A.fillText(n.name,540,p),n.hanja&&(A.fillStyle=e,A.font=`400 ${"story"===l?36:30}px serif`,A.fillText(n.hanja,540,p+("story"===l?56:46))),i(g)}async function n(t,e,r){let o=new File([t],`${e}.png`,{type:"image/png"});if("function"==typeof navigator.share&&"function"==typeof navigator.canShare&&navigator.canShare({files:[o]}))try{return await navigator.share({files:[o],text:r}),"shared"}catch(t){if(t instanceof Error&&"AbortError"===t.name)return"cancelled"}let i=URL.createObjectURL(t),l=document.createElement("a");return l.href=i,l.download=`${e}.png`,l.click(),setTimeout(()=>URL.revokeObjectURL(i),100),"downloaded"}t.s(["composeShareImage",0,l,"shareOrDownload",0,n],19693);let a="bujeok-widget-state";function s(t){try{window.webkit?.messageHandlers?.widgetBridge?.postMessage({debug:t})}catch{}}async function c(t,e){let r=await createImageBitmap(t);if(r.height<=e)return t;let o=Math.round(r.width*e/r.height),i=document.createElement("canvas");return i.width=o,i.height=e,i.getContext("2d").drawImage(r,0,0,o,e),new Promise((t,e)=>{i.toBlob(r=>r?t(r):e(Error("위젯 이미지 축소 실패")),"image/png")})}async function h(t,e){let r=window.webkit?.messageHandlers?.widgetBridge;if(r)try{var o;let i=await l(t,"original",{name:e.name,hanja:e.hanja}),n=await (o=await c(i,1120),new Promise((t,e)=>{let r=new FileReader;r.onload=()=>{let e=r.result;t(e.slice(e.indexOf(",")+1))},r.onerror=()=>e(Error("base64 변환 실패")),r.readAsDataURL(o)}));r.postMessage({...e,png:n}),s(`push-ok: ${e.name} (${n.length} chars)`)}catch(t){s(`push-fail: ${t instanceof Error?t.message:String(t)}`)}}t.s(["debugToNative",0,s,"hasWidgetBridge",0,function(){return!!window.webkit?.messageHandlers?.widgetBridge},"isWidgetInstalled",0,function(){return window.__bujeokWidgetInstalled},"onWidgetStateChange",0,function(t){return window.addEventListener(a,t),()=>window.removeEventListener(a,t)},"pushTalismanToWidget",0,h],66057)},41481,t=>{"use strict";let e=[{id:"hwangji",label:"한지",swatch:"#F2E6CC",trad:{bg:"#F2E6CC",ink:"#A72B21",text:"#2E2E2E"},modern:{bg1:"#F5EAD5",bg2:"#F5D5C8",ink:"#AA6B3F",accent:"#D4914F"}},{id:"hongji",label:"홍지",swatch:"#B93A32",trad:{bg:"#B93A32",ink:"#F2E6CC",text:"#FFF3D6"},modern:{bg1:"#F5D5D5",bg2:"#F5C8D5",ink:"#A03A3A",accent:"#D46F6F"}},{id:"baekji",label:"백지",swatch:"#F7F3EA",trad:{bg:"#F7F3EA",ink:"#A72B21",text:"#2E2E2E"},modern:{bg1:"#EFEFF5",bg2:"#DDE8F5",ink:"#4F5FAA",accent:"#7A8FD4"}},{id:"simya",label:"심야",swatch:"#151226",trad:{bg:"#151226",ink:"#E8C97A",text:"#D8D4F0"},modern:{bg1:"#1C1830",bg2:"#2A1F42",ink:"#C9B8F0",accent:"#8F7AD4"}},{id:"namsaekji",label:"남색",swatch:"#1F3E63",trad:{bg:"#1F3E63",ink:"#DAA017",text:"#F2E6CC"},modern:{bg1:"#2A4A73",bg2:"#1F3E63",ink:"#E8D9B0",accent:"#DAA017"}},{id:"ssukji",label:"쑥색",swatch:"#6B7D63",trad:{bg:"#6B7D63",ink:"#F2E6CC",text:"#FBF6E8"},modern:{bg1:"#7C8E74",bg2:"#6B7D63",ink:"#F2E6CC",accent:"#DCC9A5"}},{id:"geumji",label:"황금",swatch:"#DAA017",trad:{bg:"#DAA017",ink:"#7A4A34",text:"#3E2A1C"},modern:{bg1:"#E5B23A",bg2:"#DAA017",ink:"#7A4A34",accent:"#A72B21"}}],r=new Set(["hwangji","baekji"]),o=[{bg1:"#E8D5F5",bg2:"#F5D5E8",ink:"#6B3FA0",accent:"#D46FA0"},{bg1:"#D5EEF5",bg2:"#D5F5E8",ink:"#2B7A8A",accent:"#3AAA7A"},{bg1:"#F5EAD5",bg2:"#F5D5D5",ink:"#AA6B3F",accent:"#D46F4F"},{bg1:"#D5D5F5",bg2:"#E8D5F5",ink:"#4F4FAA",accent:"#7A5FD4"},{bg1:"#F5F5D5",bg2:"#E8F5D5",ink:"#6B8A2B",accent:"#8AAA3F"}];function i(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}function l(t,e){let r=[],o="";for(let i of t.split(/\s+/).filter(Boolean)){if(i.length>e){o&&(r.push(o),o="");for(let t=0;t<i.length;t+=e){let l=i.slice(t,t+e);l.length===e?r.push(l):o=l}continue}let t=o?`${o} ${i}`:i;t.length>e?(r.push(o),o=i):o=t}return o&&r.push(o),r}let n={쥐:`<g transform="translate(-20,-20) scale(0.8)">
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
  </g>`};function a(t,e,r,o){return`<g transform="translate(${t},${e}) scale(${r})" opacity="0.6">
    <circle cx="0" cy="0" r="8" fill="none" stroke="${o}" stroke-width="1.5"/>
    <circle cx="10" cy="-3" r="6" fill="none" stroke="${o}" stroke-width="1.5"/>
    <circle cx="-8" cy="2" r="5" fill="none" stroke="${o}" stroke-width="1.5"/>
    <circle cx="5" cy="4" r="7" fill="none" stroke="${o}" stroke-width="1.5"/>
  </g>`}function s(t,e,r,o){let i=[];for(let o=0;o<5;o++){let l=Math.PI/2+2*o*Math.PI/5,n=l+Math.PI/5;i.push(`${t+r*Math.cos(l)},${e-r*Math.sin(l)}`),i.push(`${t+.4*r*Math.cos(n)},${e-.4*r*Math.sin(n)}`)}return`<polygon points="${i.join(" ")}" fill="none" stroke="${o}" stroke-width="1.5" opacity="0.6"/>`}t.s(["ANIMAL_PATHS",0,n,"generateTalismanSVG",0,function(t){var c;if(t.assetUrl)return function(t){let{assetUrl:e,message:r,userName:o}=t,n="#A72B21",a="#F2E6CC",s=r?l(r,12).slice(0,2):[],c=s.length?26+24*s.length:0,h=560-c-14,d=s.length?`<rect x="18" y="${h}" width="324" height="${c}" rx="6"
         fill="${a}" opacity="0.9"/>
       <rect x="18" y="${h}" width="324" height="${c}" rx="6"
         fill="none" stroke="${n}" stroke-width="1" opacity="0.45"/>`:"",f=s.map((t,e)=>`<text x="168" y="${h+30+24*e}" text-anchor="middle" font-size="17" fill="#2E2E2E" font-family="'Gowun Batang', 'AppleMyungjo', serif">${i(t)}</text>`).join(""),u=o&&o.trim().length>=2&&o.trim().length<=3?o.trim():null,g=u?`<text x="0" y="4" text-anchor="middle" font-size="11" font-weight="bold" fill="${a}" font-family="serif">${i(u)}</text>`:`<text x="0" y="-2" text-anchor="middle" font-size="9.5" font-weight="bold" fill="${a}" font-family="serif">수호</text>
       <text x="0" y="10" text-anchor="middle" font-size="9.5" font-weight="bold" fill="${a}" font-family="serif">부</text>`,A=s.length?`<g transform="translate(314, ${h+c/2})">
         <rect x="-15" y="-15" width="30" height="30" rx="4" fill="${n}"/>
         <rect x="-11.5" y="-11.5" width="23" height="23" rx="3" fill="none" stroke="${a}" stroke-width="1" opacity="0.9"/>
         ${g}
       </g>`:"";return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 560" preserveAspectRatio="xMidYMid meet">
  <rect width="360" height="560" fill="${a}"/>
  <image href="${i(e??"")}" x="0" y="0" width="360" height="560" preserveAspectRatio="xMidYMid meet"/>
  ${d}
  ${f}
  ${A}
</svg>`}(t);let h=(c=t.background)?e.find(t=>t.id===c):void 0;return"traditional"===t.style?function(t,e){let{bgColor:o,animal:a,title:s,hanja:c,message:h,mantra:d,userName:f}=e,u=t?.trad??{bg:"#F2E6CC",ink:"#A72B21",text:"#2E2E2E"},g=u.bg||o||"#F2E6CC",A=(!t||r.has(t.id))&&e.accent||u.ink,p=u.text,k=`<path d="M0 14V0h14M5 14V5h9" fill="none" stroke="${A}" stroke-width="1.4" opacity="0.55"/>`,x=`
    <g transform="translate(30,30)">${k}</g>
    <g transform="translate(${330},30) scale(-1,1)">${k}</g>
    <g transform="translate(30,${530}) scale(1,-1)">${k}</g>
    <g transform="translate(${330},${530}) scale(-1,-1)">${k}</g>
  `,w=`
    <g transform="translate(${180}, 70)" stroke="${A}" fill="none">
      <path d="M0 -22v7" stroke-width="2" stroke-linecap="round"/>
      <rect x="-10" y="-13" width="20" height="20" rx="2" transform="rotate(45 0 -3)" stroke-width="2"/>
      <rect x="-5" y="-8" width="10" height="10" rx="1" transform="rotate(45 0 -3)" stroke-width="1.2"/>
      <path d="M-13 -3c-5 0-5 7 0 7M13 -3c5 0 5 7 0 7" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M-4 11l-2 11M4 11l2 11M0 12v11" stroke-width="1.4" stroke-linecap="round"/>
    </g>
  `,y="";a&&n[a]&&(y=`<g transform="translate(${180}, 208)" color="${A}" opacity="0.9">${n[a]}</g>`);let m=l(h,7).slice(0,3),C=y?272:248,b="";m.forEach((t,e)=>{let r=180+((m.length-1)/2-e)*38;[...t.replace(/\s+/g,"")].forEach((t,e)=>{b+=`<text x="${r}" y="${C+28*e}" text-anchor="middle" font-size="20" fill="${p}" font-family="'Gowun Batang', 'AppleMyungjo', serif">${i(t)}</text>`})});let $=f&&f.trim().length>=2&&f.trim().length<=3?f.trim():null,E=$?`<text x="0" y="5" text-anchor="middle" font-size="12" font-weight="bold" fill="#F2E6CC" font-family="serif">${i($)}</text>`:`<text x="0" y="-2" text-anchor="middle" font-size="11" font-weight="bold" fill="#F2E6CC" font-family="serif">수호</text>
       <text x="0" y="12" text-anchor="middle" font-size="11" font-weight="bold" fill="#F2E6CC" font-family="serif">부</text>`,L=`
    <g transform="translate(${180}, ${506})">
      <rect x="-19" y="-19" width="38" height="38" rx="4" fill="#A72B21"/>
      <rect x="-14.5" y="-14.5" width="29" height="29" rx="3" fill="none" stroke="#F2E6CC" stroke-width="1.2" opacity="0.9"/>
      ${E}
    </g>
  `;return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${360} ${560}" preserveAspectRatio="xMidYMid meet">
  <defs>
    <filter id="paper-texture">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
      <feDiffuseLighting in="noise" lighting-color="${g}" surfaceScale="1.2" result="lit">
        <feDistantLight azimuth="45" elevation="58"/>
      </feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="lit" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>
    </filter>
  </defs>

  <!-- 한지 배경 -->
  <rect width="${360}" height="${560}" fill="${g}"/>
  <rect width="${360}" height="${560}" fill="${g}" opacity="0.25" filter="url(#paper-texture)"/>

  <!-- 주홍 이중 테두리 -->
  <rect x="14" y="14" width="${332}" height="${532}" fill="none" stroke="${A}" stroke-width="2.5"/>
  <rect x="21" y="21" width="${318}" height="${518}" fill="none" stroke="${A}" stroke-width="1" opacity="0.8"/>

  <!-- 모서리 뇌문 -->
  ${x}

  <!-- 상단 매듭 -->
  ${w}

  <!-- 두전 (제목) -->
  <text x="${180}" y="134" text-anchor="middle" font-size="24" font-weight="bold" fill="${A}" font-family="'Gowun Batang', 'AppleMyungjo', serif">${i(s)}</text>
  ${c?`<text x="${180}" y="156" text-anchor="middle" font-size="12" fill="${A}" opacity="0.75" font-family="serif">${i(c)}</text>`:""}
  <line x1="${128}" y1="${c?170:152}" x2="${232}" y2="${c?170:152}" stroke="${A}" stroke-width="1" opacity="0.4"/>

  <!-- 수호 동물 -->
  ${y}

  <!-- 기원 문구 -->
  ${b}

  <!-- 각획 (주문) -->
  <line x1="90" y1="${448}" x2="${270}" y2="${448}" stroke="${A}" stroke-width="1" opacity="0.35"/>
  ${d?`<text x="${180}" y="${468}" text-anchor="middle" font-size="12" fill="${A}" opacity="0.85" font-family="serif">${i(d)}</text>`:""}

  <!-- 낙관 -->
  ${L}
</svg>`}(h,t):function(t,e,r,c,h,d,f,u){var g,A,p,k,x;let w,y=Math.abs(c.split("").reduce((t,e)=>t+e.charCodeAt(0),0))%o.length,m=o[y],C=t?.modern.bg1||e||m.bg1,b=t?.modern.bg2||m.bg2,$=t?.modern.ink||m.ink,E=t?.modern.accent||m.accent,L="";L+=a(55,90,.7,E),L+=a(305,90,.7,E),u?.includes("별")&&(L+=s(50,140,6,E),L+=s(310,140,6,E),L+=s(120,280,5,E),L+=s(240,280,5,E)),u?.includes("연꽃")&&(L+=(g=180,A=400,`<g transform="translate(${g},${A}) scale(0.8)" opacity="0.7">
    <ellipse cx="0" cy="-5" rx="4" ry="10" fill="none" stroke="${E}" stroke-width="1.5"/>
    <ellipse cx="-7" cy="-3" rx="4" ry="9" fill="none" stroke="${E}" stroke-width="1.5" transform="rotate(-25,-7,-3)"/>
    <ellipse cx="7" cy="-3" rx="4" ry="9" fill="none" stroke="${E}" stroke-width="1.5" transform="rotate(25,7,-3)"/>
    <ellipse cx="-12" cy="0" rx="3" ry="7" fill="none" stroke="${E}" stroke-width="1.5" transform="rotate(-45,-12,0)"/>
    <ellipse cx="12" cy="0" rx="3" ry="7" fill="none" stroke="${E}" stroke-width="1.5" transform="rotate(45,12,0)"/>
  </g>`)),u?.includes("태극")&&(L+=(p=180,`<g transform="translate(${p},140)">
    <circle cx="0" cy="0" r="14" fill="none" stroke="${$}" stroke-width="1.5"/>
    <path d="M0 -14 A14 14 0 0 1 0 14 A7 7 0 0 0 0 0 A7 7 0 0 1 0 -14" fill="${$}" opacity="0.3"/>
    <circle cx="0" cy="-7" r="2.8" fill="${$}"/>
    <circle cx="0" cy="7" r="2.8" fill="none" stroke="${$}" stroke-width="1"/>
  </g>`));let M="";r&&n[r]&&(M=`<g transform="translate(${180}, 210)" color="${$}">${n[r]}</g>`);let R=l(h,14),B="";for(let t=0;t<Math.min(R.length,4);t++)B+=`<text x="${180}" y="${300+28*t}" text-anchor="middle" font-size="16" fill="${$}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif">${i(R[t])}</text>`;let F=f?(k=305,x=500,w=f.length>3?f.slice(0,3):f,`
    <g transform="translate(${k},${x})" opacity="0.85">
      <rect x="-14" y="-14" width="28" height="28" rx="3" fill="none" stroke="${E}" stroke-width="2"/>
      <text x="0" y="3" text-anchor="middle" font-size="12" font-weight="bold" fill="${E}" font-family="serif">${i(w)}</text>
    </g>
  `):"";return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${360} ${560}" preserveAspectRatio="xMidYMid meet">
  <defs>
    <linearGradient id="modern-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${C}"/>
      <stop offset="100%" stop-color="${b}"/>
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
  
    <rect x="16" y="16" width="${328}" height="${528}" rx="20" ry="20" fill="none" stroke="${E}" stroke-width="2" stroke-dasharray="6,4" opacity="0.5"/>
  

  <!-- 장식 -->
  ${L}

  <!-- 상단 이모지 장식 -->
  <text x="${180}" y="50" text-anchor="middle" font-size="28">✨</text>

  <!-- 두전 (상단 제목) -->
  <text x="${180}" y="85" text-anchor="middle" font-size="24" font-weight="bold" fill="${$}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" filter="url(#soft-shadow)">${i(c)}</text>

  <!-- 구분 장식 -->
  <line x1="${140}" y1="98" x2="${220}" y2="98" stroke="${E}" stroke-width="2" opacity="0.5" stroke-linecap="round"/>

  <!-- 동물 심볼 -->
  ${M}

  <!-- 메시지 -->
  ${B}

  <!-- 하단 구분 -->
  <line x1="${120}" y1="${440}" x2="${240}" y2="${440}" stroke="${E}" stroke-width="1.5" opacity="0.4" stroke-linecap="round"/>

  <!-- 각획 (하단 주문) -->
  <text x="${180}" y="${470}" text-anchor="middle" font-size="13" fill="${$}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" opacity="0.8">${i(d)}</text>

  <!-- 하단 이모지 -->
  <text x="${180}" y="${520}" text-anchor="middle" font-size="20">🙏</text>

  <!-- 인장 -->
  ${F}
</svg>`}(h,t.bgColor,t.animal,t.title,t.message,t.mantra,t.userName,t.symbols)}])},76112,t=>{"use strict";var e=t.i(43476),r=t.i(57688),o=t.i(41481),i=t.i(59897);let l={쥐:{src:t.i(3332).default,width:360,height:360,blurWidth:8,blurHeight:8,blurDataURL:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAoklEQVR42i2O4QqCQBCEff/HCfojBKKZpndmmZqip2mZ4nUqib+by2A5bvbb2VllaaOljVGf+iwyZ2Rkbq6QytLJ7sAITyy8Y0FFdpzuJwkw2yeHqfKf/q6LjLH0ulCXQOQuhGCkCbQ21DE+FEQCntrvzFnxUHr4w706nFegQVdUFczlNxN5EsyPS03Vwt7m5uaXQf8ZKOzt4z2sPLX6yMA5X0wTpeXZXEd0AAAAAElFTkSuQmCC"},소:{src:t.i(32891).default,width:360,height:360,blurWidth:8,blurHeight:8,blurDataURL:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAArklEQVR42iWOuw6CQBRE9/+/xcJYWRiD8hBEoshTWHwRYIFdIIhbO8TiFncyZ2aIrGNZR1Ph95nd0eMndyWLoBDcmLttpPf30/B0RGoND0eykHyroAm19mYIasExlYFIzfF9ITjm7zNjRdUlC9Qus+FALAGIkMpTyqsCAurLXovEnAmemP+/cLdUW9LdgscGQU8b6zw5lJ7CUwtocd4Axap4KjysAo6CJlTnVXX0A8o4pIiUgrjRAAAAAElFTkSuQmCC"},호랑이:{src:t.i(24159).default,width:360,height:360,blurWidth:8,blurHeight:8,blurDataURL:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAs0lEQVR42i2O2wqCQBCG9/1fI+i2041QIZlumomibm6eDfOQZ8rttpGCuRjmZ77vR5+SsuLax1rrK0Oiw85Kh5UUvTO7vuGK4i68tMG5dk9jRiBDjStXVPKOi9TYvx5WG6iNr7DCQXAtiGBxM19cDneji7SaYgD+A19aQZDbh1TfVY405gSVRHhSKcDrAG8SlascEWZCgTAz+VjlyHYe4g3I+0ib5ICDVvAHwNzkW0/+Nf4CI1qiz2kP8A0AAAAASUVORK5CYII="},토끼:{src:t.i(85333).default,width:360,height:360,blurWidth:8,blurHeight:8,blurDataURL:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAApUlEQVR42i2OyQ6CQBBE+f+/8aoxrjA4BkSQ1SGoIIvAgLJdLZSkL9XV/aqEPrU/D40zWgdKF18g+2wcofTkwiWFRyr/WHqkCc99av2Mq1wy6ouz+qY2kZ7b4mRAJ8YmMdZdYr7vJ9y1kT4ZuUu4T7GN9RXIIy1zhPHdlTgCGOXsUDgSNgMMiFCZh+oCtCpQkI9iA1AoE2vLl7XPzG1u79qn8W/8BU37pnpbokDoAAAAAElFTkSuQmCC"},용:{src:t.i(73349).default,width:360,height:360,blurWidth:8,blurHeight:8,blurDataURL:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAu0lEQVR42hWOWwuCUAyA/f/P/YQggqKooCySTFHxYBjpOd4txcsxb1201+bL2PZt+8b0Oekp+abG05YS/UjN8+uudRlmoNtnuHJkigVfXte+2oZaG6ABvCO9wILNz9TpKL1yn+RWWtIAGl+lRHT4ucmOPXGZGTxsM32OS0d+oK0vrezTDGJu8OADQOBoQcRIY2Hc4qahsoGS+VELfqhcJb7sXWGBD5NYY2tPBYcFmi4zmwDFaBehLSRdjv867qDljNDEVgAAAABJRU5ErkJggg=="},뱀:{src:t.i(6258).default,width:360,height:360,blurWidth:8,blurHeight:8,blurDataURL:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAtklEQVR42h2OyQ6CMBRF+/9/YYxbNcZoXBgVCJRBJJQpLaMJUAQqRGBtYfEWL+dOYKqCifrf2KDoXtq3FsOhcKbKB/y62Giw0hC1f1t99mKhOpYuGHJUBzJ1xUg+ZPqZy7m7S56gS00WajVWQmlfoHsbatzNiDqDlqgxPDqXDWeVJ/KXEQh+OaLOAwtbdF7bpxURdw2GPG0pT+ZyFuk1hh9farEylt4MRur1qVm5QmldecgyN/gD95ujDbup7LAAAAAASUVORK5CYII="},말:{src:t.i(27307).default,width:360,height:360,blurWidth:8,blurHeight:8,blurDataURL:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAq0lEQVR42i1OSwuCQBj0//+ToEunpAxNVk0tttbNTVPwscouvkjFc58UzGGYBzPKItlUPhqGBNG7yAa+CAZQJk5EYKTWro0vwPvEnasA0kofO5KhzNvHxnau6SfHQ+qtjSZEYECcY20siQxRFzmLCJUKa5mviqfZvt3cVyU1/oakZpd4gOKqstOG4yPMrBtjcR8St0/9JrJrokt6hgur8bvbvix+O4AKOVAAXx4Vo/DT4D1+AAAAAElFTkSuQmCC"},양:{src:t.i(5054).default,width:360,height:360,blurWidth:8,blurHeight:8,blurDataURL:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAArElEQVR42jWOtxKCQBCGef+XsXEsLATBEVCQIR4jSBC4IAhHEFsXR5st9vuTMJZOHR6JvXsESp9fZhrMDM0UCczbJ+oau9JQ2Dw1BmAAGBKoL8fKCtviWLkT9tpYfxEwhUJ9VYkrNZHGc4t4chvpU+W+AbTJGUxdaoKCOmJ3O02lswCemZm+Kcwt3P5ufaP8paNGB/g2kY4d8RlpffYvh0TIpTDXl3li/OYy9AGNAqVa8boriwAAAABJRU5ErkJggg=="},원숭이:{src:t.i(7065).default,width:360,height:360,blurWidth:8,blurHeight:8,blurDataURL:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAApklEQVR42i2Oyw6CMBRE/f+Pca2JRqM85I2W8FYLUqRCgQrp2ttIMpubMzN3VoLGII69NlKGhz1ilyXa9LquBI1mEgy5+YnVwtoM2JkIYqkuAccuLzwaKaW97dIL5LpEk6DPDV769e1A/D27W290bBP9D0yopuG58naQAPtSNVUIDrBnpzWw8el0sSqBaMJv6feZwTIDHoB9WSUaqZkguQK7cx2A9Qe+PqXgQ527IgAAAABJRU5ErkJggg=="},닭:{src:t.i(61732).default,width:360,height:360,blurWidth:8,blurHeight:8,blurDataURL:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAtUlEQVR42hVOuQ6CMADt/3+Fk4mTOkiMxoGiwYIoSAuRUw5pa4SKHLMledO7wcj9rnQ5htzT2tyuH/o3tUbmg4F5TYgYhinaNLFZXPccq13hgF9uN5FBMaSumiIF7+YUqyI2gAyK5MIIrFw1hEtnM4tP6zo8gzaz6xCJ1HoixT8sMnP7JlDEJhioVwfTYHRcycK+ItI3bcgD/cuVGieapD6BLhJzejUyT2KgpM1uMteV92Fi/D9oM6M5xUSN1gAAAABJRU5ErkJggg=="},개:{src:t.i(20394).default,width:360,height:360,blurWidth:8,blurHeight:8,blurDataURL:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAArklEQVR42i2OyxKCMAxF+f8PcqELlUHeoLyxgCB1oBRoCwysDY6LzOTe5OZEWpuQIW1E+ox9lhk8N9Y23rpE4oXZRXIbXJdPwEsH5FQ5+2B4qiRWWGENSK+MA01vI9I2Ekss08X7zl42rNNUxe6J+Oe1jSQaK1P9AN0El9o5kvBKI3kjCSQMOALumJs90vtUFaW9MyAFQJabonJ5YfHc/H8FBagZe6J0FuxB/3OSL47hpdgwRpMDAAAAAElFTkSuQmCC"},돼지:{src:t.i(91102).default,width:360,height:360,blurWidth:8,blurHeight:8,blurDataURL:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAqElEQVR42jWOWQ+CMBCE+/9/EQ8qSDyQQ6TlCsilLdQmlIbr2RZjMg+b3Z2ZDwyFzZLz+A5E5fXZdSZo/SRSoM+tmYRLFy00ngganreVykMKsL9roU4jkxcOL93tT5kAfuxFfZ8wkmktNDqoTxgqx1C6L1frwmPjaCw5scjcHCmQhSQ4sPTSIoMXNs//HaJyeW7JNDVkCkRuVcdK4xlDUXtj40u2H6vUFxP4puJSnz5GAAAAAElFTkSuQmCC"}};t.s(["default",0,function({animal:t,size:n=32,className:a="",line:s=!1}){let c=t?l[t]:void 0;if(c&&!s)return(0,e.jsx)(r.default,{src:c,alt:`${t}띠`,width:n,height:n,className:a,style:{width:n,height:n,objectFit:"contain"}});let h=t?o.ANIMAL_PATHS[t]:void 0;if(!h)return(0,e.jsx)(i.SealLogo,{size:n,className:a});let d=`<svg xmlns="http://www.w3.org/2000/svg" width="${n}" height="${n}" viewBox="0 0 48 52"><g transform="translate(24,27)">${h}</g></svg>`;return(0,e.jsx)("span",{className:a,style:{display:"inline-flex",lineHeight:0},dangerouslySetInnerHTML:{__html:d},"aria-hidden":!0})}],76112)}]);