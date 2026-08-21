(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,38992,e=>{"use strict";var t=e.i(25405);function r(e){let t="";for(let r=0;r<e.length;r++)t+=String.fromCharCode(e[r]);return btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function l(e){try{let t=e.replace(/-/g,"+").replace(/_/g,"/")+"=".repeat((4-e.length%4)%4),r=atob(t),l=new Uint8Array(r.length);for(let e=0;e<r.length;e++)l[e]=r.charCodeAt(e);return l}catch{return null}}function o(e,t){return"string"!=typeof e?"":e.replace(/<[^>]*>/g,"").replace(/[<>]/g,"").replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g,"").trim().slice(0,t)}e.s(["GIFT_MESSAGE_MAX",0,80,"GIFT_NAME_MAX",0,12,"buildGiftUrl",0,function(e){let t,l=(t={v:1,t:e.t,m:o(e.m,80),f:o(e.f,12),c:e.c},r(new TextEncoder().encode(JSON.stringify(t)))),i=window.location.pathname.startsWith("/bujeok-app")?"/bujeok-app":"";return`${window.location.origin}${i}/gift/?d=${l}`},"decodeGift",0,function(e){let r;if(!e||"string"!=typeof e||e.length>2e3)return null;let i=l(e);if(!i)return null;try{r=JSON.parse(new TextDecoder().decode(i))}catch{return null}if(!r||"object"!=typeof r)return null;let n=r;if(1!==n.v||"string"!=typeof n.t)return null;let s=t.TALISMANS.find(e=>e.id===n.t);if(!s)return null;let a="string"!=typeof n.c||Number.isNaN(new Date(n.c).getTime())?"":n.c.slice(0,40);return{v:1,t:s.id,m:o(n.m,80),f:o(n.f,12),c:a}},"fromBase64Url",0,l,"giftHash",0,function(e){let t=5381;for(let r=0;r<e.length;r++)t=(t<<5)+t+e.charCodeAt(r)>>>0;return t.toString(36)},"sanitizeText",0,o,"toBase64Url",0,r])},41481,e=>{"use strict";let t=[{id:"hwangji",label:"한지",swatch:"#F2E7CE",trad:{bg:"#F2E7CE",ink:"#A72B21",text:"#2E2E2E"},modern:{bg1:"#F5EAD5",bg2:"#F5D5C8",ink:"#AA6B3F",accent:"#D4914F"}},{id:"hongji",label:"홍지",swatch:"#B93A32",trad:{bg:"#B93A32",ink:"#F2E7CE",text:"#FFF3D6"},modern:{bg1:"#F5D5D5",bg2:"#F5C8D5",ink:"#A03A3A",accent:"#D46F6F"}},{id:"baekji",label:"백지",swatch:"#F7F3EA",trad:{bg:"#F7F3EA",ink:"#A72B21",text:"#2E2E2E"},modern:{bg1:"#EFEFF5",bg2:"#DDE8F5",ink:"#4F5FAA",accent:"#7A8FD4"}},{id:"simya",label:"심야",swatch:"#151226",trad:{bg:"#151226",ink:"#E8C97A",text:"#D8D4F0"},modern:{bg1:"#1C1830",bg2:"#2A1F42",ink:"#C9B8F0",accent:"#8F7AD4"}},{id:"namsaekji",label:"남색",swatch:"#1F3E63",trad:{bg:"#1F3E63",ink:"#DAA017",text:"#F2E7CE"},modern:{bg1:"#2A4A73",bg2:"#1F3E63",ink:"#E8D9B0",accent:"#DAA017"}},{id:"ssukji",label:"쑥색",swatch:"#6B7D63",trad:{bg:"#6B7D63",ink:"#F2E7CE",text:"#FBF6E8"},modern:{bg1:"#7C8E74",bg2:"#6B7D63",ink:"#F2E7CE",accent:"#DCC9A5"}},{id:"geumji",label:"황금",swatch:"#DAA017",trad:{bg:"#DAA017",ink:"#7A4A34",text:"#3E2A1C"},modern:{bg1:"#E5B23A",bg2:"#DAA017",ink:"#7A4A34",accent:"#A72B21"}}],r=new Set(["hwangji","baekji"]),l=[{bg1:"#E8D5F5",bg2:"#F5D5E8",ink:"#6B3FA0",accent:"#D46FA0"},{bg1:"#D5EEF5",bg2:"#D5F5E8",ink:"#2B7A8A",accent:"#3AAA7A"},{bg1:"#F5EAD5",bg2:"#F5D5D5",ink:"#AA6B3F",accent:"#D46F4F"},{bg1:"#D5D5F5",bg2:"#E8D5F5",ink:"#4F4FAA",accent:"#7A5FD4"},{bg1:"#F5F5D5",bg2:"#E8F5D5",ink:"#6B8A2B",accent:"#8AAA3F"}];function o(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}function i(e,t){let r=[],l="";for(let o of e.split(/\s+/).filter(Boolean)){if(o.length>t){l&&(r.push(l),l="");for(let e=0;e<o.length;e+=t){let i=o.slice(e,e+t);i.length===t?r.push(i):l=i}continue}let e=l?`${l} ${o}`:o;e.length>t?(r.push(l),l=o):l=e}return l&&r.push(l),r}let n={쥐:`<g transform="translate(-20,-20) scale(0.8)">
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
  </g>`};function s(e,t,r,l){return`<g transform="translate(${e},${t}) scale(${r})" opacity="0.6">
    <circle cx="0" cy="0" r="8" fill="none" stroke="${l}" stroke-width="1.5"/>
    <circle cx="10" cy="-3" r="6" fill="none" stroke="${l}" stroke-width="1.5"/>
    <circle cx="-8" cy="2" r="5" fill="none" stroke="${l}" stroke-width="1.5"/>
    <circle cx="5" cy="4" r="7" fill="none" stroke="${l}" stroke-width="1.5"/>
  </g>`}function a(e,t,r,l){let o=[];for(let l=0;l<5;l++){let i=Math.PI/2+2*l*Math.PI/5,n=i+Math.PI/5;o.push(`${e+r*Math.cos(i)},${t-r*Math.sin(i)}`),o.push(`${e+.4*r*Math.cos(n)},${t-.4*r*Math.sin(n)}`)}return`<polygon points="${o.join(" ")}" fill="none" stroke="${l}" stroke-width="1.5" opacity="0.6"/>`}e.s(["ANIMAL_PATHS",0,n,"generateTalismanSVG",0,function(e){var c;if(e.assetUrl)return function(e){let{assetUrl:t,message:r}=e,l="#F2E7CE",n=r?i(r,12).slice(0,2):[],s=n.length?26+24*n.length:0,a=560-s-14,c=n.length?`<rect x="18" y="${a}" width="324" height="${s}" rx="6"
         fill="${l}" opacity="0.9"/>
       <rect x="18" y="${a}" width="324" height="${s}" rx="6"
         fill="none" stroke="#A72B21" stroke-width="1" opacity="0.45"/>`:"",d=n.map((e,t)=>`<text x="168" y="${a+30+24*t}" text-anchor="middle" font-size="17" fill="#2E2E2E" font-family="'Gowun Batang', 'AppleMyungjo', serif">${o(e)}</text>`).join("");return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 560" preserveAspectRatio="xMidYMid meet">
  <rect width="360" height="560" fill="${l}"/>
  <image href="${o(t??"")}" x="0" y="0" width="360" height="560" preserveAspectRatio="xMidYMid meet"/>
  ${c}
  ${d}
  
</svg>`}(e);let d=(c=e.background)?t.find(e=>e.id===c):void 0;return"traditional"===e.style?function(e,t){let{bgColor:l,animal:s,title:a,hanja:c,message:d,mantra:x}=t,h=e?.trad??{bg:"#F2E7CE",ink:"#A72B21",text:"#2E2E2E"},f=h.bg||l||"#F2E7CE",u=(!e||r.has(e.id))&&t.accent||h.ink,p=h.text,g=`<path d="M0 14V0h14M5 14V5h9" fill="none" stroke="${u}" stroke-width="1.4" opacity="0.55"/>`,k=`
    <g transform="translate(30,30)">${g}</g>
    <g transform="translate(${330},30) scale(-1,1)">${g}</g>
    <g transform="translate(30,${530}) scale(1,-1)">${g}</g>
    <g transform="translate(${330},${530}) scale(-1,-1)">${g}</g>
  `,y=`
    <g transform="translate(${180}, 70)" stroke="${u}" fill="none">
      <path d="M0 -22v7" stroke-width="2" stroke-linecap="round"/>
      <rect x="-10" y="-13" width="20" height="20" rx="2" transform="rotate(45 0 -3)" stroke-width="2"/>
      <rect x="-5" y="-8" width="10" height="10" rx="1" transform="rotate(45 0 -3)" stroke-width="1.2"/>
      <path d="M-13 -3c-5 0-5 7 0 7M13 -3c5 0 5 7 0 7" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M-4 11l-2 11M4 11l2 11M0 12v11" stroke-width="1.4" stroke-linecap="round"/>
    </g>
  `,m="";s&&n[s]&&(m=`<g transform="translate(${180}, 208)" color="${u}" opacity="0.9">${n[s]}</g>`);let w=i(d,7).slice(0,3),C=m?272:248,b="";w.forEach((e,t)=>{let r=180+((w.length-1)/2-t)*38;[...e.replace(/\s+/g,"")].forEach((e,t)=>{b+=`<text x="${r}" y="${C+28*t}" text-anchor="middle" font-size="20" fill="${p}" font-family="'Gowun Batang', 'AppleMyungjo', serif">${o(e)}</text>`})});let $=`<text x="0" y="-2" text-anchor="middle" font-size="11" font-weight="bold" fill="#F2E7CE" font-family="serif">수호</text>
       <text x="0" y="12" text-anchor="middle" font-size="11" font-weight="bold" fill="#F2E7CE" font-family="serif">부</text>`,j=t.noSeal?"":`
    <g transform="translate(${180}, ${506})">
      <rect x="-19" y="-19" width="38" height="38" rx="4" fill="#A72B21"/>
      <rect x="-14.5" y="-14.5" width="29" height="29" rx="3" fill="none" stroke="#F2E7CE" stroke-width="1.2" opacity="0.9"/>
      ${$}
    </g>
  `;return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${360} ${560}" preserveAspectRatio="xMidYMid meet">
  <defs>
    <filter id="paper-texture">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
      <feDiffuseLighting in="noise" lighting-color="${f}" surfaceScale="1.2" result="lit">
        <feDistantLight azimuth="45" elevation="58"/>
      </feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="lit" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>
    </filter>
  </defs>

  <!-- 한지 배경 -->
  <rect width="${360}" height="${560}" fill="${f}"/>
  <rect width="${360}" height="${560}" fill="${f}" opacity="0.25" filter="url(#paper-texture)"/>

  <!-- 주홍 이중 테두리 -->
  <rect x="14" y="14" width="${332}" height="${532}" fill="none" stroke="${u}" stroke-width="2.5"/>
  <rect x="21" y="21" width="${318}" height="${518}" fill="none" stroke="${u}" stroke-width="1" opacity="0.8"/>

  <!-- 모서리 뇌문 -->
  ${k}

  <!-- 상단 매듭 -->
  ${y}

  <!-- 두전 (제목) -->
  <text x="${180}" y="134" text-anchor="middle" font-size="24" font-weight="bold" fill="${u}" font-family="'Gowun Batang', 'AppleMyungjo', serif">${o(a)}</text>
  ${c?`<text x="${180}" y="156" text-anchor="middle" font-size="12" fill="${u}" opacity="0.75" font-family="serif">${o(c)}</text>`:""}
  <line x1="${128}" y1="${c?170:152}" x2="${232}" y2="${c?170:152}" stroke="${u}" stroke-width="1" opacity="0.4"/>

  <!-- 수호 동물 -->
  ${m}

  <!-- 기원 문구 -->
  ${b}

  <!-- 각획 (주문) -->
  <line x1="90" y1="${448}" x2="${270}" y2="${448}" stroke="${u}" stroke-width="1" opacity="0.35"/>
  ${x?`<text x="${180}" y="${468}" text-anchor="middle" font-size="12" fill="${u}" opacity="0.85" font-family="serif">${o(x)}</text>`:""}

  <!-- 낙관 -->
  ${j}
</svg>`}(d,e):function(e,t,r,c,d,x,h,f){var u,p,g;let k=Math.abs(c.split("").reduce((e,t)=>e+t.charCodeAt(0),0))%l.length,y=l[k],m=e?.modern.bg1||t||y.bg1,w=e?.modern.bg2||y.bg2,C=e?.modern.ink||y.ink,b=e?.modern.accent||y.accent,$="";$+=s(55,90,.7,b),$+=s(305,90,.7,b),f?.includes("별")&&($+=a(50,140,6,b),$+=a(310,140,6,b),$+=a(120,280,5,b),$+=a(240,280,5,b)),f?.includes("연꽃")&&($+=(u=180,p=400,`<g transform="translate(${u},${p}) scale(0.8)" opacity="0.7">
    <ellipse cx="0" cy="-5" rx="4" ry="10" fill="none" stroke="${b}" stroke-width="1.5"/>
    <ellipse cx="-7" cy="-3" rx="4" ry="9" fill="none" stroke="${b}" stroke-width="1.5" transform="rotate(-25,-7,-3)"/>
    <ellipse cx="7" cy="-3" rx="4" ry="9" fill="none" stroke="${b}" stroke-width="1.5" transform="rotate(25,7,-3)"/>
    <ellipse cx="-12" cy="0" rx="3" ry="7" fill="none" stroke="${b}" stroke-width="1.5" transform="rotate(-45,-12,0)"/>
    <ellipse cx="12" cy="0" rx="3" ry="7" fill="none" stroke="${b}" stroke-width="1.5" transform="rotate(45,12,0)"/>
  </g>`)),f?.includes("태극")&&($+=(g=180,`<g transform="translate(${g},140)">
    <circle cx="0" cy="0" r="14" fill="none" stroke="${C}" stroke-width="1.5"/>
    <path d="M0 -14 A14 14 0 0 1 0 14 A7 7 0 0 0 0 0 A7 7 0 0 1 0 -14" fill="${C}" opacity="0.3"/>
    <circle cx="0" cy="-7" r="2.8" fill="${C}"/>
    <circle cx="0" cy="7" r="2.8" fill="none" stroke="${C}" stroke-width="1"/>
  </g>`));let j="";r&&n[r]&&(j=`<g transform="translate(${180}, 210)" color="${C}">${n[r]}</g>`);let A=i(d,14),E="";for(let e=0;e<Math.min(A.length,4);e++)E+=`<text x="${180}" y="${300+28*e}" text-anchor="middle" font-size="16" fill="${C}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif">${o(A[e])}</text>`;return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${360} ${560}" preserveAspectRatio="xMidYMid meet">
  <defs>
    <linearGradient id="modern-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${m}"/>
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
  
    <rect x="16" y="16" width="${328}" height="${528}" rx="20" ry="20" fill="none" stroke="${b}" stroke-width="2" stroke-dasharray="6,4" opacity="0.5"/>
  

  <!-- 장식 -->
  ${$}

  <!-- 상단 이모지 장식 -->
  <text x="${180}" y="50" text-anchor="middle" font-size="28">✨</text>

  <!-- 두전 (상단 제목) -->
  <text x="${180}" y="85" text-anchor="middle" font-size="24" font-weight="bold" fill="${C}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" filter="url(#soft-shadow)">${o(c)}</text>

  <!-- 구분 장식 -->
  <line x1="${140}" y1="98" x2="${220}" y2="98" stroke="${b}" stroke-width="2" opacity="0.5" stroke-linecap="round"/>

  <!-- 동물 심볼 -->
  ${j}

  <!-- 메시지 -->
  ${E}

  <!-- 하단 구분 -->
  <line x1="${120}" y1="${440}" x2="${240}" y2="${440}" stroke="${b}" stroke-width="1.5" opacity="0.4" stroke-linecap="round"/>

  <!-- 각획 (하단 주문) -->
  <text x="${180}" y="${470}" text-anchor="middle" font-size="13" fill="${C}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" opacity="0.8">${o(x)}</text>

  <!-- 하단 이모지 -->
  <text x="${180}" y="${520}" text-anchor="middle" font-size="20">🙏</text>

  <!-- 인장 -->
  
</svg>`}(d,e.bgColor,e.animal,e.title,e.message,e.mantra,e.userName,e.symbols)}])},75811,e=>{e.q("/bujeok-app/_next/static/media/hanji-bg.3x3gcnstqx29_.jpg")},44714,e=>{e.q("/bujeok-app/_next/static/media/wordmark-mark.3urt7e9hv6s_u.png")},64275,e=>{"use strict";var t=e.i(43476),r=e.i(57688),l=e.i(59897),o=e.i(66414);e.s(["default",0,function({left:e,right:i,title:n,showSeal:s=!1,wordmark:a=!1}){return(0,t.jsxs)("header",{className:"flex items-center justify-between px-4 pb-3 pt-[max(0.875rem,env(safe-area-inset-top))]",children:[(0,t.jsx)("div",{className:"flex h-10 w-10 items-center justify-center text-[var(--color-meok)]",children:e}),(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[a&&(0,t.jsx)(r.default,{src:o.default,alt:"수호부",priority:!0,className:"h-16 w-auto"}),!a&&s&&(0,t.jsx)(l.SealLogo,{size:30}),!a&&n&&(0,t.jsx)("h1",{className:"font-serif-kr text-base font-bold tracking-wide text-[var(--color-meok)]",children:n})]}),(0,t.jsx)("div",{className:"flex h-10 w-10 items-center justify-center text-[var(--color-meok)]",children:i})]})}])},21038,e=>{"use strict";var t=e.i(43476),r=e.i(46932);e.s(["default",0,function({children:e,onClick:l,disabled:o=!1,variant:i="primary",className:n=""}){return(0,t.jsx)(r.motion.button,{whileTap:o?void 0:{scale:.97},onClick:l,disabled:o,className:`w-full p-[17px] text-center font-serif-kr text-[16px] tracking-[.08em] transition-colors disabled:opacity-50 ${"primary"===i?"bg-[var(--color-juhong)] text-[var(--color-juhong-tint)]":"bg-transparent text-[rgba(46,46,46,0.6)]"} ${n}`,style:"primary"===i?{border:"1px solid var(--color-juhong-deep)",boxShadow:"inset 0 0 0 1px rgba(247, 233, 207, 0.35), 0 8px 22px rgba(167, 43, 33, 0.25)"}:{border:"1px solid rgba(122, 74, 52, 0.3)"},children:e})}])},3275,e=>{"use strict";var t=e.i(25405);let r=[{id:"aegun",paper:"hwangji",title:"액운 막기",subtitle:"나쁜 기운 차단",hanja:"厄除",color:"#A72B21",category:t.TalismanCategory.Protection,motif:"jangseung"},{id:"yeonae",paper:"hwangji",title:"인연의 기운",subtitle:"설레는 마음과 좋은 인연",hanja:"因緣",color:"#C25B78",category:t.TalismanCategory.Love,motif:"knot"},{id:"maeum",paper:"namsaekji",title:"마음 안정",subtitle:"불안과 걱정 내려놓기",hanja:"平安",color:"#6B7D63",category:t.TalismanCategory.Health,motif:"lotus"},{id:"jaebok",paper:"geumji",title:"재복 기원",subtitle:"재물과 복 불러오기",hanja:"財福",color:"#DAA017",category:t.TalismanCategory.Wealth,motif:"flame"},{id:"geongang",paper:"hwangji",title:"건강 기원",subtitle:"몸과 마음의 건강",hanja:"健康",color:"#1F3E63",category:t.TalismanCategory.Health,motif:"mountain"},{id:"sowon",paper:"hwangji",title:"소원 성취",subtitle:"바라는 일 이루기",hanja:"所願",color:"#DAA017",category:t.TalismanCategory.Other,motif:"flame"},{id:"gajeong",paper:"ssukji",title:"가정 수호",subtitle:"가족의 평안과 화합",hanja:"家宅平安",color:"#7A4A34",category:t.TalismanCategory.Family,motif:"knot"},{id:"hakeop",paper:"geumji",title:"학업·시험",subtitle:"집중력과 좋은 결과",hanja:"合格",color:"#2E2E2E",category:t.TalismanCategory.Study,motif:"cloud"}];e.s(["ENERGIES",0,r,"getEnergyByCategory",0,function(e){return r.find(t=>t.category===e)??r[0]},"getEnergyById",0,function(e){return r.find(t=>t.id===e)}])},88692,e=>{"use strict";var t=e.i(43476),r=e.i(71645),l=e.i(18566),o=e.i(46932),i=e.i(61568),n=e.i(64275),s=e.i(21038),a=e.i(59897),c=e.i(3275),d=e.i(25405),x=e.i(41481),h=e.i(38992);let f="#2E2E2E",u="#7A4A34",p=["네 하루하루가 평안하기를","바라는 일, 꼭 이루어지기를","나쁜 기운은 비켜 가기를","늘 건강하게, 오래 보자","네 곁에 좋은 일만 머물기를"];function g(){try{let e=localStorage.getItem("bujeok-user");if(e){let t=(JSON.parse(e)?.name||"").trim();if(t)return t}let t=localStorage.getItem("user_profile");if(t)return(JSON.parse(t)?.name||"").trim()}catch{}return""}function k(){let e=(0,l.useRouter)(),[i,n]=(0,r.useState)(g),[d,x]=(0,r.useState)(null),[p,k]=(0,r.useState)(null),y=async()=>{var e;let t,r,l;if(!d)return;let o=(e={v:1,f:i.trim(),e:d},t={v:1,f:(0,h.sanitizeText)(e.f,h.GIFT_NAME_MAX),e:e.e},r=(0,h.toBase64Url)(new TextEncoder().encode(JSON.stringify(t))),l=window.location.pathname.startsWith("/bujeok-app")?"/bujeok-app":"",`${window.location.origin}${l}/cheong/?d=${r}`),n=c.ENERGIES.find(e=>e.id===d),s=`${i.trim()||"친구"}의 부탁 — 나를 위해 ${n?.title??""} 부적 한 장 써줄래? 🙏`;try{if(navigator.share){await navigator.share({title:"수호부 — 부적 청하기",text:s,url:o}),k("shared");return}}catch{return}try{await navigator.clipboard.writeText(o),k("copied")}catch{prompt("링크를 복사해 친구에게 보내주세요",o)}};return(0,t.jsxs)("div",{className:"mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-16",children:[(0,t.jsxs)(o.motion.div,{initial:{opacity:0,y:14},animate:{opacity:1,y:0},className:"pt-4 text-center",children:[(0,t.jsxs)("p",{className:"font-serif-kr text-[20px] leading-relaxed",style:{color:f},children:["부적은 남이 써줄 때",(0,t.jsx)("br",{}),"가장 영험하다고 해요"]}),(0,t.jsxs)("p",{className:"mt-2 text-[12px] leading-relaxed",style:{color:`${u}BB`},children:["예로부터 부적은 나를 아끼는 사람이 써주던 것.",(0,t.jsx)("br",{}),"어떤 마음의 부적을 청할지 고르고, 링크를 보내보세요."]}),(0,t.jsx)("div",{className:"mt-3 flex justify-center",style:{color:`${f}55`},children:(0,t.jsx)(a.BrushStroke,{width:90})})]}),(0,t.jsxs)("div",{className:"hanji-card mt-5 rounded-2xl px-4 py-4",children:[(0,t.jsx)("label",{className:"mb-1 block text-[11px] font-bold",style:{color:`${u}CC`},children:"내 이름 — 청하는 사람"}),(0,t.jsx)("input",{type:"text",value:i,maxLength:h.GIFT_NAME_MAX,onChange:e=>n(e.target.value),placeholder:"이름 또는 별명",className:"w-full rounded-lg border bg-transparent px-3 py-2 text-[13px] outline-none",style:{borderColor:"rgba(122,74,52,0.30)",color:f,background:"rgba(255,255,255,0.35)"}})]}),(0,t.jsxs)("div",{className:"hanji-card mt-3 rounded-2xl px-4 py-4",children:[(0,t.jsx)("p",{className:"mb-2.5 text-[11px] font-bold",style:{color:`${u}CC`},children:"어떤 마음의 부적을 청할까요?"}),(0,t.jsx)("div",{className:"grid grid-cols-2 gap-2",children:c.ENERGIES.map(e=>{let r=d===e.id;return(0,t.jsxs)("button",{type:"button",onClick:()=>x(e.id),className:"rounded-xl px-3 py-2.5 text-left",style:{border:r?`1.5px solid ${e.color}`:"1px solid rgba(122,74,52,0.22)",background:r?`${e.color}0D`:"rgba(255,255,255,0.3)"},children:[(0,t.jsxs)("span",{className:"font-serif-kr text-[13px] font-bold",style:{color:r?e.color:f},children:[e.title,(0,t.jsx)("span",{className:"ml-1 text-[10px] font-normal opacity-60",children:e.hanja})]}),(0,t.jsx)("span",{className:"mt-0.5 block text-[10.5px]",style:{color:`${u}99`},children:e.subtitle})]},e.id)})})]}),(0,t.jsxs)("div",{className:"mt-5",children:[(0,t.jsx)(s.default,{onClick:d?y:void 0,disabled:!d,className:"rounded-lg",children:"🙏 부적 써달라고 청하기"}),(0,t.jsx)("p",{className:"mt-2 text-center text-[10.5px]",style:{color:`${u}88`},children:"copied"===p?"링크를 복사했어요 — 친구에게 붙여넣어 보내주세요":"shared"===p?"청을 보냈어요. 친구가 써준 부적이 곧 도착할 거예요":"친구가 기원 문구를 써서 부적을 지어 보내줘요"})]}),(0,t.jsx)("button",{onClick:()=>e.push("/"),className:"mt-6 text-center text-[11px] underline",style:{color:`${u}99`},children:"홈으로 돌아가기"})]})}function y({encoded:e}){let i=(0,l.useRouter)(),n=(0,r.useMemo)(()=>(function(e){let t;if(!e||"string"!=typeof e||e.length>500)return null;let r=(0,h.fromBase64Url)(e);if(!r)return null;try{t=JSON.parse(new TextDecoder().decode(r))}catch{return null}if(!t||"object"!=typeof t)return null;let l=t;if(1!==l.v)return null;let o=c.ENERGIES.find(e=>e.id===l.e);return o?{v:1,f:(0,h.sanitizeText)(l.f,h.GIFT_NAME_MAX),e:o.id}:null})(e),[e]),k=(0,r.useMemo)(()=>n?c.ENERGIES.find(e=>e.id===n.e)??null:null,[n]),[m,w]=(0,r.useState)(g),[C,b]=(0,r.useState)(""),[$,j]=(0,r.useState)(!1),A=(0,r.useMemo)(()=>k?(0,d.getTalismanRecommendation)(k.category,[]):null,[k]),E=(0,r.useMemo)(()=>A&&k?(0,x.generateTalismanSVG)({type:A.id,style:"traditional",background:k.paper,accent:k.color,title:A.name,hanja:A.hanja,message:C.trim()||p[0],mantra:A.mantra,symbols:[...A.design.patterns,...A.design.symbols]}):"",[A,k,C]);if(!n||!k||!A)return(0,t.jsxs)("div",{className:"mx-auto flex w-full max-w-md flex-1 flex-col items-center px-5 pt-16 text-center",children:[(0,t.jsx)(a.KnotMotif,{size:56,className:"mb-4 text-[var(--color-galsaek)] opacity-50"}),(0,t.jsx)("p",{className:"font-serif-kr text-base font-bold",style:{color:f},children:"청하는 편지가 닿지 않았어요"}),(0,t.jsx)("p",{className:"mt-2 text-xs leading-relaxed",style:{color:u},children:"링크가 잘못되었거나 오래된 청이에요."}),(0,t.jsx)("div",{className:"mt-6 w-full max-w-[220px]",children:(0,t.jsx)(s.default,{onClick:()=>i.push("/cheong"),children:"나도 부적 청해보기"})})]});let M=n.f||"친구",v=async()=>{let e=(0,h.buildGiftUrl)({v:1,t:A.id,m:(C.trim()||p[0]).slice(0,h.GIFT_MESSAGE_MAX),f:m.trim().slice(0,h.GIFT_NAME_MAX),c:new Date().toISOString()}),t=`${M}님이 청한 부적을 써서 보냅니다 — 「${A.name}」 🙏`;try{if(navigator.share){await navigator.share({title:"수호부 — 부적 선물",text:t,url:e}),j(!0);return}}catch{return}try{await navigator.clipboard.writeText(e),j(!0),alert("부적 링크를 복사했어요. 청한 친구에게 붙여넣어 보내주세요!")}catch{prompt("링크를 복사해 친구에게 보내주세요",e)}};return(0,t.jsxs)("div",{className:"mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-16",children:[(0,t.jsxs)(o.motion.div,{initial:{opacity:0,y:14},animate:{opacity:1,y:0},className:"pt-2 text-center",children:[(0,t.jsxs)("p",{className:"font-serif-kr text-[19px] leading-relaxed",style:{color:f},children:[(0,t.jsx)("span",{className:"font-bold",children:M}),"님이 당신에게",(0,t.jsx)("br",{}),"부적 한 장을 청했어요"]}),(0,t.jsxs)("p",{className:"mt-2 text-[12px]",style:{color:`${u}BB`},children:["바라는 마음 — ",(0,t.jsx)("b",{style:{color:k.color},children:k.title})," ",(0,t.jsx)("span",{className:"opacity-60",children:k.hanja})]}),(0,t.jsxs)("p",{className:"mt-1 text-[11px] leading-relaxed",style:{color:`${u}88`},children:["부적은 아끼는 사람이 써줄 때 가장 영험하대요.",(0,t.jsx)("br",{}),"한 줄의 기원이 부적이 됩니다."]})]}),(0,t.jsx)("div",{className:"mt-5 flex justify-center",children:(0,t.jsx)("div",{className:"w-[190px] overflow-hidden rounded-lg",style:{aspectRatio:"360 / 560",boxShadow:"0 4px 18px rgba(122,74,52,0.28)"},dangerouslySetInnerHTML:{__html:E}})}),(0,t.jsxs)("div",{className:"hanji-card mt-5 rounded-2xl px-4 py-4",children:[(0,t.jsxs)("label",{className:"mb-1 block text-[11px] font-bold",style:{color:`${u}CC`},children:[M,"님을 위한 기원 한 줄"]}),(0,t.jsx)("input",{type:"text",value:C,maxLength:h.GIFT_MESSAGE_MAX,onChange:e=>b(e.target.value),placeholder:p[0],className:"w-full rounded-lg border bg-transparent px-3 py-2 text-[13px] outline-none",style:{borderColor:"rgba(122,74,52,0.30)",color:f,background:"rgba(255,255,255,0.35)"}}),(0,t.jsx)("div",{className:"mt-2 flex flex-wrap gap-1.5",children:p.map(e=>(0,t.jsx)("button",{type:"button",onClick:()=>b(e),className:"rounded-full px-2.5 py-1 text-[10.5px]",style:{border:"1px solid rgba(122,74,52,0.25)",color:u},children:e},e))}),(0,t.jsx)("label",{className:"mb-1 mt-3 block text-[11px] font-bold",style:{color:`${u}CC`},children:"내 이름 — 낙관으로 찍혀요 (선택)"}),(0,t.jsx)("input",{type:"text",value:m,maxLength:h.GIFT_NAME_MAX,onChange:e=>w(e.target.value),placeholder:"이름 또는 별명",className:"w-full rounded-lg border bg-transparent px-3 py-2 text-[13px] outline-none",style:{borderColor:"rgba(122,74,52,0.30)",color:f,background:"rgba(255,255,255,0.35)"}})]}),(0,t.jsxs)("div",{className:"mt-5 flex flex-col gap-3",children:[$?(0,t.jsx)("div",{className:"w-full rounded-lg py-3.5 text-center font-serif-kr text-base font-bold text-[var(--color-ssuk)]",style:{border:"1px solid rgba(107,125,99,0.5)"},children:"✓ 부적을 보냈어요"}):(0,t.jsx)(s.default,{onClick:v,className:"rounded-lg",children:"✍️ 이 부적 써서 보내기"}),(0,t.jsx)(s.default,{variant:"ghost",onClick:()=>i.push("/cheong"),children:"나도 부적 청해보기"})]}),(0,t.jsxs)("p",{className:"mt-4 text-center text-[10.5px] leading-relaxed",style:{color:`${u}77`},children:["보내기를 누르면 부적이 담긴 링크가 만들어져요.",(0,t.jsx)("br",{}),M,"님에게 그 링크를 보내면 부적함에 간직할 수 있어요."]})]})}function m(){let e=(0,l.useRouter)(),r=(0,l.useSearchParams)().get("d")??"";return(0,t.jsxs)(i.default,{children:[(0,t.jsx)(n.default,{left:(0,t.jsx)("button",{onClick:()=>e.push("/"),"aria-label":"홈으로",children:(0,t.jsx)(a.BackIcon,{size:20})}),title:"부적 청하기"}),r?(0,t.jsx)(y,{encoded:r}):(0,t.jsx)(k,{})]})}e.s(["default",0,function(){return(0,t.jsx)(r.Suspense,{fallback:null,children:(0,t.jsx)(m,{})})}],88692)}]);