(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,66057,19693,t=>{"use strict";let e="rgba(232, 195, 106, 0.55)";async function r(t){let e=[...t.matchAll(/href="((?:\/|https?:)[^"]+)"/g)].map(t=>t[1]);if(0===e.length)return t;let r=t;for(let t of new Set(e))try{let e=await fetch(t);if(!e.ok)continue;let o=await new Promise((t,r)=>{let o=new FileReader;o.onload=()=>t(o.result),o.onerror=()=>r(Error("이미지 인라인 실패")),e.blob().then(t=>o.readAsDataURL(t),r)});r=r.split(`href="${t}"`).join(`href="${o}"`)}catch{}return r}function o(t,e,r){return new Promise((o,i)=>{let a=new Blob([t.replace(/<svg([^>]*?)>/,`<svg$1 width="${e}" height="${r}">`)],{type:"image/svg+xml;charset=utf-8"}),l=URL.createObjectURL(a),n=new Image;n.onload=()=>{URL.revokeObjectURL(l),o(n)},n.onerror=()=>{URL.revokeObjectURL(l),i(Error("부적 이미지 로딩에 실패했습니다."))},n.src=l})}function i(t){return new Promise((e,r)=>{t.toBlob(t=>{t?e(t):r(Error("이미지 변환에 실패했습니다."))},"image/png")})}async function a(t,a,l){var n,s;let c=await r(t);if("original"===a){let t=await o(c,1080,1680),e=document.createElement("canvas");e.width=1080,e.height=1680;let r=e.getContext("2d");if(!r)throw Error("Canvas 2D context를 생성할 수 없습니다.");return r.drawImage(t,0,0),i(e)}let d="story"===a?1920:1080,h="story"===a?1150:760,p=Math.round(360*h/560),g=await o(c,2*p,2*h),f=document.createElement("canvas");f.width=1080,f.height=d;let u=f.getContext("2d");if(!u)throw Error("Canvas 2D context를 생성할 수 없습니다.");!function(t,e){let r=t.createLinearGradient(0,0,0,e);r.addColorStop(0,"#100D1C"),r.addColorStop(.5,"#171226"),r.addColorStop(1,"#0D0B12"),t.fillStyle=r,t.fillRect(0,0,1080,e);let o=t.createRadialGradient(540,e/2,0,540,e/2,e/2);o.addColorStop(0,"rgba(232, 195, 106, 0.10)"),o.addColorStop(1,"rgba(232, 195, 106, 0)"),t.fillStyle=o,t.fillRect(0,0,1080,e);let i=42,a=()=>(i=(9301*i+49297)%233280)/233280;for(let r=0;r<40;r++){let r=1080*a(),o=a()*e,i=2.2*a()+.6;t.fillStyle=`rgba(232, 195, 106, ${.12+.25*a()})`,t.beginPath(),t.arc(r,o,i,0,2*Math.PI),t.fill()}}(u,d),n=(1080-p)/2,s="story"===a?(d-h)/2+20:(d-h)/2-30,u.save(),u.shadowColor="rgba(232, 195, 106, 0.45)",u.shadowBlur=60,u.beginPath(),u.moveTo(n+28,s),u.arcTo(n+p,s,n+p,s+h,28),u.arcTo(n+p,s+h,n,s+h,28),u.arcTo(n,s+h,n,s,28),u.arcTo(n,s,n+p,s,28),u.closePath(),u.fillStyle="#111",u.fill(),u.shadowBlur=0,u.clip(),u.drawImage(g,n,s,p,h),u.restore(),u.strokeStyle=e,u.lineWidth=3,u.beginPath(),u.roundRect(n,s,p,h,28),u.stroke(),u.textAlign="center",u.fillStyle=e,u.font=`500 ${"story"===a?40:34}px 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif`,u.fillText("✦ 수호부적 ✦",540,"story"===a?150:90);let E="story"===a?d-220:d-110;return u.fillStyle="#E8C36A",u.font=`700 ${"story"===a?58:48}px 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif`,u.fillText(l.name,540,E),l.hanja&&(u.fillStyle=e,u.font=`400 ${"story"===a?36:30}px serif`,u.fillText(l.hanja,540,E+("story"===a?56:46))),i(f)}async function l(t,e,r){let o=new File([t],`${e}.png`,{type:"image/png"});if("function"==typeof navigator.share&&"function"==typeof navigator.canShare&&navigator.canShare({files:[o]}))try{return await navigator.share({files:[o],text:r}),"shared"}catch(t){if(t instanceof Error&&"AbortError"===t.name)return"cancelled"}let i=URL.createObjectURL(t),a=document.createElement("a");return a.href=i,a.download=`${e}.png`,a.click(),setTimeout(()=>URL.revokeObjectURL(i),100),"downloaded"}t.s(["composeShareImage",0,a,"shareOrDownload",0,l],19693);let n="bujeok-widget-state";function s(t){try{window.webkit?.messageHandlers?.widgetBridge?.postMessage({debug:t})}catch{}}async function c(t,e){let r=await createImageBitmap(t);if(r.height<=e)return t;let o=Math.round(r.width*e/r.height),i=document.createElement("canvas");return i.width=o,i.height=e,i.getContext("2d").drawImage(r,0,0,o,e),new Promise((t,e)=>{i.toBlob(r=>r?t(r):e(Error("위젯 이미지 축소 실패")),"image/png")})}async function d(t,e){let r=window.webkit?.messageHandlers?.widgetBridge;if(r)try{var o;let i=await a(t,"original",{name:e.name,hanja:e.hanja}),l=await (o=await c(i,1120),new Promise((t,e)=>{let r=new FileReader;r.onload=()=>{let e=r.result;t(e.slice(e.indexOf(",")+1))},r.onerror=()=>e(Error("base64 변환 실패")),r.readAsDataURL(o)}));r.postMessage({...e,png:l}),s(`push-ok: ${e.name} (${l.length} chars)`)}catch(t){s(`push-fail: ${t instanceof Error?t.message:String(t)}`)}}t.s(["debugToNative",0,s,"hasWidgetBridge",0,function(){return!!window.webkit?.messageHandlers?.widgetBridge},"isWidgetInstalled",0,function(){return window.__bujeokWidgetInstalled},"onWidgetStateChange",0,function(t){return window.addEventListener(n,t),()=>window.removeEventListener(n,t)},"pushTalismanToWidget",0,d],66057)},41481,t=>{"use strict";let e=[{id:"hwangji",label:"한지",swatch:"#F2E7CE",trad:{bg:"#F2E7CE",ink:"#A72B21",text:"#2E2E2E"},modern:{bg1:"#F5EAD5",bg2:"#F5D5C8",ink:"#AA6B3F",accent:"#D4914F"}},{id:"hongji",label:"홍지",swatch:"#B93A32",trad:{bg:"#B93A32",ink:"#F2E7CE",text:"#FFF3D6"},modern:{bg1:"#F5D5D5",bg2:"#F5C8D5",ink:"#A03A3A",accent:"#D46F6F"}},{id:"baekji",label:"백지",swatch:"#F7F3EA",trad:{bg:"#F7F3EA",ink:"#A72B21",text:"#2E2E2E"},modern:{bg1:"#EFEFF5",bg2:"#DDE8F5",ink:"#4F5FAA",accent:"#7A8FD4"}},{id:"simya",label:"심야",swatch:"#151226",trad:{bg:"#151226",ink:"#E8C97A",text:"#D8D4F0"},modern:{bg1:"#1C1830",bg2:"#2A1F42",ink:"#C9B8F0",accent:"#8F7AD4"}},{id:"namsaekji",label:"남색",swatch:"#1F3E63",trad:{bg:"#1F3E63",ink:"#DAA017",text:"#F2E7CE"},modern:{bg1:"#2A4A73",bg2:"#1F3E63",ink:"#E8D9B0",accent:"#DAA017"}},{id:"ssukji",label:"쑥색",swatch:"#6B7D63",trad:{bg:"#6B7D63",ink:"#F2E7CE",text:"#FBF6E8"},modern:{bg1:"#7C8E74",bg2:"#6B7D63",ink:"#F2E7CE",accent:"#DCC9A5"}},{id:"geumji",label:"황금",swatch:"#DAA017",trad:{bg:"#DAA017",ink:"#7A4A34",text:"#3E2A1C"},modern:{bg1:"#E5B23A",bg2:"#DAA017",ink:"#7A4A34",accent:"#A72B21"}}],r=new Set(["hwangji","baekji"]),o=[{bg1:"#E8D5F5",bg2:"#F5D5E8",ink:"#6B3FA0",accent:"#D46FA0"},{bg1:"#D5EEF5",bg2:"#D5F5E8",ink:"#2B7A8A",accent:"#3AAA7A"},{bg1:"#F5EAD5",bg2:"#F5D5D5",ink:"#AA6B3F",accent:"#D46F4F"},{bg1:"#D5D5F5",bg2:"#E8D5F5",ink:"#4F4FAA",accent:"#7A5FD4"},{bg1:"#F5F5D5",bg2:"#E8F5D5",ink:"#6B8A2B",accent:"#8AAA3F"}];function i(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}function a(t,e){let r=[],o="";for(let i of t.split(/\s+/).filter(Boolean)){if(i.length>e){o&&(r.push(o),o="");for(let t=0;t<i.length;t+=e){let a=i.slice(t,t+e);a.length===e?r.push(a):o=a}continue}let t=o?`${o} ${i}`:i;t.length>e?(r.push(o),o=i):o=t}return o&&r.push(o),r}let l={쥐:`<g transform="translate(-20,-20) scale(0.8)">
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
  </g>`};function n(t,e,r,o){return`<g transform="translate(${t},${e}) scale(${r})" opacity="0.6">
    <circle cx="0" cy="0" r="8" fill="none" stroke="${o}" stroke-width="1.5"/>
    <circle cx="10" cy="-3" r="6" fill="none" stroke="${o}" stroke-width="1.5"/>
    <circle cx="-8" cy="2" r="5" fill="none" stroke="${o}" stroke-width="1.5"/>
    <circle cx="5" cy="4" r="7" fill="none" stroke="${o}" stroke-width="1.5"/>
  </g>`}function s(t,e,r,o){let i=[];for(let o=0;o<5;o++){let a=Math.PI/2+2*o*Math.PI/5,l=a+Math.PI/5;i.push(`${t+r*Math.cos(a)},${e-r*Math.sin(a)}`),i.push(`${t+.4*r*Math.cos(l)},${e-.4*r*Math.sin(l)}`)}return`<polygon points="${i.join(" ")}" fill="none" stroke="${o}" stroke-width="1.5" opacity="0.6"/>`}t.s(["ANIMAL_PATHS",0,l,"generateTalismanSVG",0,function(t){var c;if(t.assetUrl)return function(t){let{assetUrl:e,message:r}=t,o="#F2E7CE",l=r?a(r,12).slice(0,2):[],n=l.length?26+24*l.length:0,s=560-n-14,c=l.length?`<rect x="18" y="${s}" width="324" height="${n}" rx="6"
         fill="${o}" opacity="0.9"/>
       <rect x="18" y="${s}" width="324" height="${n}" rx="6"
         fill="none" stroke="#A72B21" stroke-width="1" opacity="0.45"/>`:"",d=l.map((t,e)=>`<text x="168" y="${s+30+24*e}" text-anchor="middle" font-size="17" fill="#2E2E2E" font-family="'Gowun Batang', 'AppleMyungjo', serif">${i(t)}</text>`).join("");return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 560" preserveAspectRatio="xMidYMid meet">
  <rect width="360" height="560" fill="${o}"/>
  <image href="${i(e??"")}" x="0" y="0" width="360" height="560" preserveAspectRatio="xMidYMid meet"/>
  ${c}
  ${d}
  
</svg>`}(t);let d=(c=t.background)?e.find(t=>t.id===c):void 0;return"traditional"===t.style?function(t,e){let{bgColor:o,animal:n,title:s,hanja:c,message:d,mantra:h}=e,p=t?.trad??{bg:"#F2E7CE",ink:"#A72B21",text:"#2E2E2E"},g=p.bg||o||"#F2E7CE",f=(!t||r.has(t.id))&&e.accent||p.ink,u=p.text,E=`<path d="M0 14V0h14M5 14V5h9" fill="none" stroke="${f}" stroke-width="1.4" opacity="0.55"/>`,y=`
    <g transform="translate(30,30)">${E}</g>
    <g transform="translate(${330},30) scale(-1,1)">${E}</g>
    <g transform="translate(30,${530}) scale(1,-1)">${E}</g>
    <g transform="translate(${330},${530}) scale(-1,-1)">${E}</g>
  `,k=`
    <g transform="translate(${180}, 70)" stroke="${f}" fill="none">
      <path d="M0 -22v7" stroke-width="2" stroke-linecap="round"/>
      <rect x="-10" y="-13" width="20" height="20" rx="2" transform="rotate(45 0 -3)" stroke-width="2"/>
      <rect x="-5" y="-8" width="10" height="10" rx="1" transform="rotate(45 0 -3)" stroke-width="1.2"/>
      <path d="M-13 -3c-5 0-5 7 0 7M13 -3c5 0 5 7 0 7" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M-4 11l-2 11M4 11l2 11M0 12v11" stroke-width="1.4" stroke-linecap="round"/>
    </g>
  `,x="";n&&l[n]&&(x=`<g transform="translate(${180}, 208)" color="${f}" opacity="0.9">${l[n]}</g>`);let C=a(d,7).slice(0,3),m=x?272:248,B="";C.forEach((t,e)=>{let r=180+((C.length-1)/2-e)*38;[...t.replace(/\s+/g,"")].forEach((t,e)=>{B+=`<text x="${r}" y="${m+28*e}" text-anchor="middle" font-size="20" fill="${u}" font-family="'Gowun Batang', 'AppleMyungjo', serif">${i(t)}</text>`})});let w=`<text x="0" y="-2" text-anchor="middle" font-size="11" font-weight="bold" fill="#F2E7CE" font-family="serif">수호</text>
       <text x="0" y="12" text-anchor="middle" font-size="11" font-weight="bold" fill="#F2E7CE" font-family="serif">부</text>`,A=e.noSeal?"":`
    <g transform="translate(${180}, ${506})">
      <rect x="-19" y="-19" width="38" height="38" rx="4" fill="#A72B21"/>
      <rect x="-14.5" y="-14.5" width="29" height="29" rx="3" fill="none" stroke="#F2E7CE" stroke-width="1.2" opacity="0.9"/>
      ${w}
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
  <rect x="14" y="14" width="${332}" height="${532}" fill="none" stroke="${f}" stroke-width="2.5"/>
  <rect x="21" y="21" width="${318}" height="${518}" fill="none" stroke="${f}" stroke-width="1" opacity="0.8"/>

  <!-- 모서리 뇌문 -->
  ${y}

  <!-- 상단 매듭 -->
  ${k}

  <!-- 두전 (제목) -->
  <text x="${180}" y="134" text-anchor="middle" font-size="24" font-weight="bold" fill="${f}" font-family="'Gowun Batang', 'AppleMyungjo', serif">${i(s)}</text>
  ${c?`<text x="${180}" y="156" text-anchor="middle" font-size="12" fill="${f}" opacity="0.75" font-family="serif">${i(c)}</text>`:""}
  <line x1="${128}" y1="${c?170:152}" x2="${232}" y2="${c?170:152}" stroke="${f}" stroke-width="1" opacity="0.4"/>

  <!-- 수호 동물 -->
  ${x}

  <!-- 기원 문구 -->
  ${B}

  <!-- 각획 (주문) -->
  <line x1="90" y1="${448}" x2="${270}" y2="${448}" stroke="${f}" stroke-width="1" opacity="0.35"/>
  ${h?`<text x="${180}" y="${468}" text-anchor="middle" font-size="12" fill="${f}" opacity="0.85" font-family="serif">${i(h)}</text>`:""}

  <!-- 낙관 -->
  ${A}
</svg>`}(d,t):function(t,e,r,c,d,h,p,g){var f,u,E;let y=Math.abs(c.split("").reduce((t,e)=>t+e.charCodeAt(0),0))%o.length,k=o[y],x=t?.modern.bg1||e||k.bg1,C=t?.modern.bg2||k.bg2,m=t?.modern.ink||k.ink,B=t?.modern.accent||k.accent,w="";w+=n(55,90,.7,B),w+=n(305,90,.7,B),g?.includes("별")&&(w+=s(50,140,6,B),w+=s(310,140,6,B),w+=s(120,280,5,B),w+=s(240,280,5,B)),g?.includes("연꽃")&&(w+=(f=180,u=400,`<g transform="translate(${f},${u}) scale(0.8)" opacity="0.7">
    <ellipse cx="0" cy="-5" rx="4" ry="10" fill="none" stroke="${B}" stroke-width="1.5"/>
    <ellipse cx="-7" cy="-3" rx="4" ry="9" fill="none" stroke="${B}" stroke-width="1.5" transform="rotate(-25,-7,-3)"/>
    <ellipse cx="7" cy="-3" rx="4" ry="9" fill="none" stroke="${B}" stroke-width="1.5" transform="rotate(25,7,-3)"/>
    <ellipse cx="-12" cy="0" rx="3" ry="7" fill="none" stroke="${B}" stroke-width="1.5" transform="rotate(-45,-12,0)"/>
    <ellipse cx="12" cy="0" rx="3" ry="7" fill="none" stroke="${B}" stroke-width="1.5" transform="rotate(45,12,0)"/>
  </g>`)),g?.includes("태극")&&(w+=(E=180,`<g transform="translate(${E},140)">
    <circle cx="0" cy="0" r="14" fill="none" stroke="${m}" stroke-width="1.5"/>
    <path d="M0 -14 A14 14 0 0 1 0 14 A7 7 0 0 0 0 0 A7 7 0 0 1 0 -14" fill="${m}" opacity="0.3"/>
    <circle cx="0" cy="-7" r="2.8" fill="${m}"/>
    <circle cx="0" cy="7" r="2.8" fill="none" stroke="${m}" stroke-width="1"/>
  </g>`));let A="";r&&l[r]&&(A=`<g transform="translate(${180}, 210)" color="${m}">${l[r]}</g>`);let $=a(d,14),b="";for(let t=0;t<Math.min($.length,4);t++)b+=`<text x="${180}" y="${300+28*t}" text-anchor="middle" font-size="16" fill="${m}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif">${i($[t])}</text>`;return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${360} ${560}" preserveAspectRatio="xMidYMid meet">
  <defs>
    <linearGradient id="modern-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${x}"/>
      <stop offset="100%" stop-color="${C}"/>
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
  
    <rect x="16" y="16" width="${328}" height="${528}" rx="20" ry="20" fill="none" stroke="${B}" stroke-width="2" stroke-dasharray="6,4" opacity="0.5"/>
  

  <!-- 장식 -->
  ${w}

  <!-- 상단 이모지 장식 -->
  <text x="${180}" y="50" text-anchor="middle" font-size="28">✨</text>

  <!-- 두전 (상단 제목) -->
  <text x="${180}" y="85" text-anchor="middle" font-size="24" font-weight="bold" fill="${m}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" filter="url(#soft-shadow)">${i(c)}</text>

  <!-- 구분 장식 -->
  <line x1="${140}" y1="98" x2="${220}" y2="98" stroke="${B}" stroke-width="2" opacity="0.5" stroke-linecap="round"/>

  <!-- 동물 심볼 -->
  ${A}

  <!-- 메시지 -->
  ${b}

  <!-- 하단 구분 -->
  <line x1="${120}" y1="${440}" x2="${240}" y2="${440}" stroke="${B}" stroke-width="1.5" opacity="0.4" stroke-linecap="round"/>

  <!-- 각획 (하단 주문) -->
  <text x="${180}" y="${470}" text-anchor="middle" font-size="13" fill="${m}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" opacity="0.8">${i(h)}</text>

  <!-- 하단 이모지 -->
  <text x="${180}" y="${520}" text-anchor="middle" font-size="20">🙏</text>

  <!-- 인장 -->
  
</svg>`}(d,t.bgColor,t.animal,t.title,t.message,t.mantra,t.userName,t.symbols)}])},49352,t=>{"use strict";let e={개업대길부:{traditional:"/bujeok-app/talismans/%EA%B0%9C%EC%97%85%EB%8C%80%EA%B8%B8%EB%B6%80-%EC%A0%84%ED%86%B5.png"},경면주사부:{traditional:"/bujeok-app/talismans/%EA%B2%BD%EB%A9%B4%EC%A3%BC%EC%82%AC%EB%B6%80-%EC%A0%84%ED%86%B5.png"},과거급제부:{traditional:"/bujeok-app/talismans/%EA%B3%BC%EA%B1%B0%EA%B8%89%EC%A0%9C%EB%B6%80-%EC%A0%84%ED%86%B5.png"},구설방지부:{traditional:"/bujeok-app/talismans/%EA%B5%AC%EC%84%A4%EB%B0%A9%EC%A7%80%EB%B6%80-%EC%A0%84%ED%86%B5.png"},기우부:{traditional:"/bujeok-app/talismans/%EA%B8%B0%EC%9A%B0%EB%B6%80-%EC%A0%84%ED%86%B5.png"},눈병부:{traditional:"/bujeok-app/talismans/%EB%88%88%EB%B3%91%EB%B6%80-%EC%A0%84%ED%86%B5.png"},도난방지부:{traditional:"/bujeok-app/talismans/%EB%8F%84%EB%82%9C%EB%B0%A9%EC%A7%80%EB%B6%80-%EC%A0%84%ED%86%B5.png"},두통부:{traditional:"/bujeok-app/talismans/%EB%91%90%ED%86%B5%EB%B6%80-%EC%A0%84%ED%86%B5.png"},마마부:{traditional:"/bujeok-app/talismans/%EB%A7%88%EB%A7%88%EB%B6%80-%EC%A0%84%ED%86%B5.png"},매매부:{traditional:"/bujeok-app/talismans/%EB%A7%A4%EB%A7%A4%EB%B6%80-%EC%A0%84%ED%86%B5.png"},문창부:{traditional:"/bujeok-app/talismans/%EB%AC%B8%EC%B0%BD%EB%B6%80-%EC%A0%84%ED%86%B5.png"},방화부:{traditional:"/bujeok-app/talismans/%EB%B0%A9%ED%99%94%EB%B6%80-%EC%A0%84%ED%86%B5.png"},벽사부:{traditional:"/bujeok-app/talismans/%EB%B2%BD%EC%82%AC%EB%B6%80-%EC%A0%84%ED%86%B5.png"},부도옹부:{traditional:"/bujeok-app/talismans/%EB%B6%80%EB%8F%84%EC%98%B9%EB%B6%80-%EC%A0%84%ED%86%B5.png"},부부화합부:{traditional:"/bujeok-app/talismans/%EB%B6%80%EB%B6%80%ED%99%94%ED%95%A9%EB%B6%80-%EC%A0%84%ED%86%B5.png"},불면부:{traditional:"/bujeok-app/talismans/%EB%B6%88%EB%A9%B4%EB%B6%80-%EC%A0%84%ED%86%B5.png"},불화방지부:{traditional:"/bujeok-app/talismans/%EB%B6%88%ED%99%94%EB%B0%A9%EC%A7%80%EB%B6%80-%EC%A0%84%ED%86%B5.png"},사업번창부:{traditional:"/bujeok-app/talismans/%EC%82%AC%EC%97%85%EB%B2%88%EC%B0%BD%EB%B6%80-%EC%A0%84%ED%86%B5.png"},삼재부:{traditional:"/bujeok-app/talismans/%EC%82%BC%EC%9E%AC%EB%B6%80-%EC%A0%84%ED%86%B5.png"},상사부:{traditional:"/bujeok-app/talismans/%EC%83%81%EC%82%AC%EB%B6%80-%EC%A0%84%ED%86%B5.png"},소아부:{traditional:"/bujeok-app/talismans/%EC%86%8C%EC%95%84%EB%B6%80-%EC%A0%84%ED%86%B5.png"},수명장수부:{traditional:"/bujeok-app/talismans/%EC%88%98%EB%AA%85%EC%9E%A5%EC%88%98%EB%B6%80-%EC%A0%84%ED%86%B5.png"},수살막이부:{traditional:"/bujeok-app/talismans/%EC%88%98%EC%82%B4%EB%A7%89%EC%9D%B4%EB%B6%80-%EC%A0%84%ED%86%B5.png"},승진부:{traditional:"/bujeok-app/talismans/%EC%8A%B9%EC%A7%84%EB%B6%80-%EC%A0%84%ED%86%B5.png"},안태부:{traditional:"/bujeok-app/talismans/%EC%95%88%ED%83%9C%EB%B6%80-%EC%A0%84%ED%86%B5.png"},애정부:{traditional:"/bujeok-app/talismans/%EC%95%A0%EC%A0%95%EB%B6%80-%EC%A0%84%ED%86%B5.png"},여행부:{traditional:"/bujeok-app/talismans/%EC%97%AC%ED%96%89%EB%B6%80-%EC%A0%84%ED%86%B5.png"},오방신장부:{traditional:"/bujeok-app/talismans/%EC%98%A4%EB%B0%A9%EC%8B%A0%EC%9E%A5%EB%B6%80-%EC%A0%84%ED%86%B5.png"},인연부:{traditional:"/bujeok-app/talismans/%EC%9D%B8%EC%97%B0%EB%B6%80-%EC%A0%84%ED%86%B5.png"},작명부:{traditional:"/bujeok-app/talismans/%EC%9E%91%EB%AA%85%EB%B6%80-%EC%A0%84%ED%86%B5.png"},잡인퇴거부:{traditional:"/bujeok-app/talismans/%EC%9E%A1%EC%9D%B8%ED%87%B4%EA%B1%B0%EB%B6%80-%EC%A0%84%ED%86%B5.png"},재물부:{traditional:"/bujeok-app/talismans/%EC%9E%AC%EB%AC%BC%EB%B6%80-%EC%A0%84%ED%86%B5.png"},정승부:{traditional:"/bujeok-app/talismans/%EC%A0%95%EC%8A%B9%EB%B6%80-%EC%A0%84%ED%86%B5.png"},진택부:{traditional:"/bujeok-app/talismans/%EC%A7%84%ED%83%9D%EB%B6%80-%EC%A0%84%ED%86%B5.png"},집중부:{traditional:"/bujeok-app/talismans/%EC%A7%91%EC%A4%91%EB%B6%80-%EC%A0%84%ED%86%B5.png"},천왕부:{traditional:"/bujeok-app/talismans/%EC%B2%9C%EC%99%95%EB%B6%80-%EC%A0%84%ED%86%B5.png"},초복부:{traditional:"/bujeok-app/talismans/%EC%B4%88%EB%B3%B5%EB%B6%80-%EC%A0%84%ED%86%B5.png"},총명부:{traditional:"/bujeok-app/talismans/%EC%B4%9D%EB%AA%85%EB%B6%80-%EC%A0%84%ED%86%B5.png"},출입문부:{traditional:"/bujeok-app/talismans/%EC%B6%9C%EC%9E%85%EB%AC%B8%EB%B6%80-%EC%A0%84%ED%86%B5.png"},치병부:{traditional:"/bujeok-app/talismans/%EC%B9%98%EB%B3%91%EB%B6%80-%EC%A0%84%ED%86%B5.png"},택일부:{traditional:"/bujeok-app/talismans/%ED%83%9D%EC%9D%BC%EB%B6%80-%EC%A0%84%ED%86%B5.png"},합격부:{traditional:"/bujeok-app/talismans/%ED%95%A9%EA%B2%A9%EB%B6%80-%EC%A0%84%ED%86%B5.png"},해몽부:{traditional:"/bujeok-app/talismans/%ED%95%B4%EB%AA%BD%EB%B6%80-%EC%A0%84%ED%86%B5.png"},호신부:{traditional:"/bujeok-app/talismans/%ED%98%B8%EC%8B%A0%EB%B6%80-%EC%A0%84%ED%86%B5.png"},화목부:{traditional:"/bujeok-app/talismans/%ED%99%94%EB%AA%A9%EB%B6%80-%EC%A0%84%ED%86%B5.png"},화합부:{traditional:"/bujeok-app/talismans/%ED%99%94%ED%95%A9%EB%B6%80-%EC%A0%84%ED%86%B5.png"},횡재부:{traditional:"/bujeok-app/talismans/%ED%9A%A1%EC%9E%AC%EB%B6%80-%EC%A0%84%ED%86%B5.png"}};t.s(["getTalismanAsset",0,function(t,r){if(t)return e[t.normalize("NFC")]?.[r]}])},51940,74497,6213,t=>{"use strict";var e=t.i(43476),r=t.i(71645),o=t.i(25405),i=t.i(49352);let a={x:.79,y:.82,size:.13},l={x:.78,y:.68,size:.13},n={"family-01":{x:.78,y:.809,size:.13},"family-02":{x:.72,y:.847,size:.13},"family-03":{x:.78,y:.809,size:.13},"family-04":{x:.72,y:.847,size:.13},"family-05":{x:.72,y:.847,size:.13},"family-06":{x:.78,y:.809,size:.13},"family-07":{x:.78,y:.809,size:.13},"health-01":{x:.19,y:.847,size:.13},"health-02":{x:.15,y:.847,size:.13},"health-03":{x:.74,y:.712,size:.13},"health-04":{x:.72,y:.809,size:.13},"health-05":{x:.74,y:.597,size:.13},"health-06":{x:.72,y:.847,size:.13},"health-07":{x:.78,y:.828,size:.13},"health-08":{x:.78,y:.847,size:.13},"love-01":{x:.27,y:.809,size:.13},"love-02":{x:.76,y:.809,size:.13},"love-03":{x:.74,y:.847,size:.13},"love-04":{x:.72,y:.809,size:.13},"other-01":{x:.78,y:.847,size:.13},"other-02":{x:.72,y:.77,size:.13},"other-03":{x:.78,y:.809,size:.13},"other-04":{x:.78,y:.847,size:.13},"other-05":{x:.78,y:.847,size:.13},"other-06":{x:.78,y:.809,size:.13},"other-07":{x:.72,y:.847,size:.13},"other-08":{x:.72,y:.828,size:.13},"protect-01":{x:.72,y:.847,size:.13},"protect-02":{x:.84,y:.616,size:.13},"protect-03":{x:.78,y:.847,size:.13},"protect-04":{x:.741,y:.78,size:.13},"protect-05":{x:.78,y:.809,size:.13},"protect-06":{x:.72,y:.809,size:.13},"protect-07":{x:.15,y:.731,size:.13},"protect-08":{x:.82,y:.577,size:.13},"study-01":{x:.72,y:.847,size:.13},"study-02":{x:.78,y:.809,size:.13},"study-03":{x:.72,y:.809,size:.13},"study-04":{x:.74,y:.828,size:.13},"study-05":{x:.84,y:.847,size:.13},"wealth-01":{x:.78,y:.809,size:.13},"wealth-02":{x:.8,y:.828,size:.13},"wealth-03":{x:.78,y:.847,size:.13},"wealth-04":{x:.84,y:.828,size:.13},"wealth-05":{x:.72,y:.751,size:.13},"wealth-06":{x:.78,y:.828,size:.13},"wealth-07":{x:.19,y:.712,size:.13}},s={[o.TalismanCategory.Protection]:"護",[o.TalismanCategory.Wealth]:"財",[o.TalismanCategory.Health]:"健",[o.TalismanCategory.Family]:"家",[o.TalismanCategory.Study]:"學",[o.TalismanCategory.Love]:"緣",[o.TalismanCategory.Other]:"願"};function c(t){var e;let r=(0,o.getTalismanById)(t);if(!r)return;let c=(0,i.getTalismanAsset)(r.name,"traditional");return{talisman:r,imagePath:c,stampAnchor:(e=!!c,n[t]??(e?a:l)),serialCode:s[r.category]??"願"}}let d={[o.TalismanCategory.Wealth]:["올해는 경제적으로 안정되기를 바라요.","하는 일마다 좋은 결실이 따르기를 바라요.","불필요한 지출이 줄고 재물이 모이기를 바라요."],[o.TalismanCategory.Love]:["좋은 인연과 자연스럽게 마음이 이어지기를 바라요.","그 사람과 다시 따뜻한 연락이 닿기를 바라요.","서로의 진심을 알아볼 수 있기를 바라요."],[o.TalismanCategory.Health]:["몸과 마음이 편안하게 회복되기를 바라요.","우리 가족이 아프지 않고 평안하기를 바라요.","매일 건강한 기운으로 생활할 수 있기를 바라요."],[o.TalismanCategory.Protection]:["나쁜 기운이 비켜 가고 평안이 깃들기를 바라요.","오가는 길마다 무탈하고 안전하기를 바라요.","걱정하던 일이 조용히 지나가기를 바라요."],[o.TalismanCategory.Family]:["우리 가족이 서로에게 다정하기를 바라요.","집안에 웃음과 평안이 머물기를 바라요.","소중한 사람들과 오래 함께하기를 바라요."],[o.TalismanCategory.Study]:["노력한 만큼의 결과가 따르기를 바라요.","흔들리지 않는 집중력이 함께하기를 바라요.","준비한 시험에서 실력을 다 보여주기를 바라요."],[o.TalismanCategory.Other]:["마음에 품은 일이 잘 풀리기를 바라요.","좋은 기회가 제때에 닿기를 바라요.","올해는 웃는 날이 더 많기를 바라요."]};t.s(["ORIGIN_CONCEPT_LINES",0,{main:"아무에게나 같은 부적을 건네지 않습니다.\n미리 정성껏 만든 원형 부적에\n당신의 사주와 이름, 지금의 염원을 담아\n한 사람을 위한 한 장으로 완성합니다.",sub:"소원은 같아도, 염원은 모두 다르니까.\n수호부는 당신의 사주와 지금의 마음을 살펴\n한 사람을 위한 부적을 정성껏 지어드립니다.",notice:"수호부는 전통 부적의 상징과 구성을 바탕으로 만든 디지털 기원 콘텐츠입니다. 개인의 마음을 다독이고 염원을 기억하기 위한 용도로 이용해주세요."},"SERIAL_CODE",0,s,"WISH_SUGGESTIONS",0,d,"getOriginTalisman",0,c],74497);var h=t.i(41481);let p="bujeok-collection",g="bujeok-serial-seq";function f(t){let e,r=(e=t>>>0,()=>{let t=e=e+0x6d2b79f5>>>0;return t=Math.imul(t^t>>>15,1|t),(((t^=t+Math.imul(t^t>>>7,61|t))^t>>>14)>>>0)/0x100000000});return{rotation:4*r()-2,opacity:.88+.1*r(),anchorDx:(2*r()-1)*.008,anchorDy:(2*r()-1)*.008,inkShift:.04*r(),grainX:r(),grainY:r()}}let u="#F6EDD9";t.s(["buildPersonalSVG",0,function(t){let e=t.personal,r=c(t.sourceId??t.id),o=r?.talisman??t,i=(0,h.generateTalismanSVG)({type:o.id,style:"traditional",background:"hwangji",title:o.name,hanja:o.hanja,message:"",mantra:o.mantra??"",symbols:[...o.design?.patterns??[],...o.design?.symbols??[]],assetUrl:r?.imagePath,noSeal:!0});if(!e)return i;let a=f(e.visualSeed),l=`<radialGradient id="p-grain" cx="${(100*a.grainX).toFixed(1)}%" cy="${(100*a.grainY).toFixed(1)}%" r="85%">
      <stop offset="0%" stop-color="#7A4A34" stop-opacity="${(.015+.5*a.inkShift).toFixed(3)}"/>
      <stop offset="100%" stop-color="#7A4A34" stop-opacity="0"/>
    </radialGradient>`,n=`<defs>${l}</defs>
  <rect width="360" height="560" fill="url(#p-grain)"/>`,s=i.lastIndexOf("</svg>");return -1===s?i:i.slice(0,s)+n+i.slice(s)},"createPersonalTalisman",0,function(t){var e;let r,o,i=new Date,a="u">typeof crypto&&"randomUUID"in crypto?`personal-${crypto.randomUUID()}`:`personal-${Date.now()}-${Math.floor(1e6*Math.random())}`,l=c(t.talisman.id),n=function(t){let e=0;for(let r=0;r<t.length;r++)e=(e<<5)-e+t.charCodeAt(r)|0;return Math.abs(e)||1}(a),d=f(n),h={ownerName:t.ownerName.trim(),wishText:t.wishText.trim().slice(0,50),recommendationReason:t.recommendationReason,serialNumber:(e=l?.serialCode??s[t.talisman.category]??"願",r=`${i.getFullYear()}${String(i.getMonth()+1).padStart(2,"0")}${String(i.getDate()).padStart(2,"0")}`,`${e}-${r}-${String(function(){try{let t=parseInt(localStorage.getItem(g)||"0",10)+1;return localStorage.setItem(g,String(t)),t}catch{return Math.floor(900*Math.random())+100}}()).padStart(3,"0")}`),stampText:(o=t.ownerName.trim().replace(/\s+/g,""))?[...o].slice(0,4).join(""):"수호부",stampRotation:Math.round(100*d.rotation)/100,stampOpacity:Math.round(1e3*d.opacity)/1e3,visualSeed:n};return{...t.talisman,id:a,sourceId:t.talisman.id,savedAt:i.toISOString(),note:h.wishText||void 0,personal:h}},"getPlacedTalisman",0,function(){try{return JSON.parse(localStorage.getItem(p)||"[]").find(t=>t.personal?.isPlacedOnHome)??null}catch{return null}},"markPlacedOnHome",0,function(t){try{let e=JSON.parse(localStorage.getItem(p)||"[]");for(let r of e)r.personal&&(r.personal.isPlacedOnHome=r.id===t);localStorage.setItem(p,JSON.stringify(e))}catch{}},"saveToCollection",0,function(t){try{let e=JSON.parse(localStorage.getItem(p)||"[]");if(e.some(e=>e.id===t.id))return!0;return e.unshift(t),localStorage.setItem(p,JSON.stringify(e)),!0}catch{return!1}},"seedVariation",0,f,"stampSvgFragment",0,function(t,e,r,o){let i=[...t],a=i.length,l=t=>t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),n=`font-family="'Gowun Batang', 'AppleMyungjo', serif" font-weight="bold" fill="${u}"`,s="";if(a<=1){let t=.52*e;s=`<text x="0" y="${.36*t}" text-anchor="middle" font-size="${t}" ${n}>${l(i[0]??"福")}</text>`}else if(a<=3){let t=2===a?.36*e:.27*e,r=2===a?.4*e:.29*e,o=-((a-1)/2)*r;s=i.map((e,i)=>`<text x="0" y="${o+i*r+.36*t}" text-anchor="middle" font-size="${t}" ${n}>${l(e)}</text>`).join("")}else{let t=.3*e,r=.21*e,o=[{x:r,y:-r},{x:r,y:r},{x:-r,y:-r},{x:-r,y:r}];s=i.slice(0,4).map((e,r)=>`<text x="${o[r].x}" y="${o[r].y+.36*t}" text-anchor="middle" font-size="${t}" ${n}>${l(e)}</text>`).join("")}let c=e/2,d=c-.09*e;return`<g transform="rotate(${r})" opacity="${o}">
    <rect x="${-c}" y="${-c}" width="${e}" height="${e}" rx="${.1*e}" fill="#A72B21"/>
    <rect x="${-d}" y="${-d}" width="${2*d}" height="${2*d}" rx="${.07*e}" fill="none" stroke="${u}" stroke-width="${Math.max(1,.03*e)}" opacity="0.9"/>
    ${s}
  </g>`}],6213),t.s(["NameStamp",0,function({text:t,side:r,rotation:o=0,opacity:i=.94}){let a,l=[...t].slice(0,4),n=l.length,s=n<=1?.5*r:2===n?.34*r:3===n?.26*r:.28*r;if(n<=3)a=(0,e.jsx)("div",{className:"flex flex-col items-center justify-center",style:{height:"100%",gap:2===n?.05*r:.02*r},children:l.map((t,r)=>(0,e.jsx)("span",{style:{fontSize:s,lineHeight:1},children:t},r))});else{let t=[l[2],l[0],l[3],l[1]];a=(0,e.jsx)("div",{className:"grid h-full grid-cols-2 place-items-center",style:{padding:.08*r},children:t.map((t,r)=>(0,e.jsx)("span",{style:{fontSize:s,lineHeight:1},children:t},r))})}return(0,e.jsx)("div",{"aria-hidden":!0,style:{width:r,height:r,transform:`rotate(${o}deg)`,opacity:i,background:"#A72B21",borderRadius:.1*r,boxShadow:`inset 0 0 0 ${Math.max(1,.028*r)}px rgba(246,237,217,0.9), inset 0 0 ${.18*r}px rgba(90,15,10,0.35)`,color:"#F6EDD9",fontFamily:"var(--font-serif-kr), 'AppleMyungjo', serif",fontWeight:700,padding:.09*r,boxSizing:"border-box"},children:a})},"default",0,function({talisman:t,width:o,className:i=""}){let a=t.sourceId??t.id,l=c(a),n=t.personal,s=!!n,d=(0,r.useMemo)(()=>{if(l?.imagePath)return null;let e=l?.talisman??t;return(0,h.generateTalismanSVG)({type:e.id,style:"traditional",background:"hwangji",title:e.name,hanja:e.hanja,message:"",mantra:e.mantra??"",symbols:[...e.design?.patterns??[],...e.design?.symbols??[]],noSeal:s})},[a,s]),p=n?f(n.visualSeed):null;return(0,e.jsxs)("div",{className:`relative overflow-hidden ${i}`,style:{width:o,aspectRatio:"360 / 560"},children:[l?.imagePath?(0,e.jsx)("img",{src:l.imagePath,alt:t.name,className:"absolute inset-0 h-full w-full object-contain",style:{background:"#F2E7CE"},draggable:!1}):d?(0,e.jsx)("div",{className:"absolute inset-0",dangerouslySetInnerHTML:{__html:d}}):null,n&&p&&(0,e.jsx)("div",{"aria-hidden":!0,className:"pointer-events-none absolute inset-0",style:{background:`radial-gradient(85% 85% at ${(100*p.grainX).toFixed(1)}% ${(100*p.grainY).toFixed(1)}%, rgba(122,74,52,${(.015+.5*p.inkShift).toFixed(3)}), transparent 100%)`}})]})}],51940)}]);