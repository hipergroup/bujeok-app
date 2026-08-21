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
  
</svg>`}(e);let d=(c=e.background)?t.find(e=>e.id===c):void 0;return"traditional"===e.style?function(e,t){let{bgColor:l,animal:s,title:a,hanja:c,message:d,mantra:h}=t,x=e?.trad??{bg:"#F2E7CE",ink:"#A72B21",text:"#2E2E2E"},f=x.bg||l||"#F2E7CE",u=(!e||r.has(e.id))&&t.accent||x.ink,p=x.text,g=`<path d="M0 14V0h14M5 14V5h9" fill="none" stroke="${u}" stroke-width="1.4" opacity="0.55"/>`,m=`
    <g transform="translate(30,30)">${g}</g>
    <g transform="translate(${330},30) scale(-1,1)">${g}</g>
    <g transform="translate(30,${530}) scale(1,-1)">${g}</g>
    <g transform="translate(${330},${530}) scale(-1,-1)">${g}</g>
  `,k=`
    <g transform="translate(${180}, 70)" stroke="${u}" fill="none">
      <path d="M0 -22v7" stroke-width="2" stroke-linecap="round"/>
      <rect x="-10" y="-13" width="20" height="20" rx="2" transform="rotate(45 0 -3)" stroke-width="2"/>
      <rect x="-5" y="-8" width="10" height="10" rx="1" transform="rotate(45 0 -3)" stroke-width="1.2"/>
      <path d="M-13 -3c-5 0-5 7 0 7M13 -3c5 0 5 7 0 7" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M-4 11l-2 11M4 11l2 11M0 12v11" stroke-width="1.4" stroke-linecap="round"/>
    </g>
  `,y="";s&&n[s]&&(y=`<g transform="translate(${180}, 208)" color="${u}" opacity="0.9">${n[s]}</g>`);let w=i(d,7).slice(0,3),$=y?272:248,C="";w.forEach((e,t)=>{let r=180+((w.length-1)/2-t)*38;[...e.replace(/\s+/g,"")].forEach((e,t)=>{C+=`<text x="${r}" y="${$+28*t}" text-anchor="middle" font-size="20" fill="${p}" font-family="'Gowun Batang', 'AppleMyungjo', serif">${o(e)}</text>`})});let b=`<text x="0" y="-2" text-anchor="middle" font-size="11" font-weight="bold" fill="#F2E7CE" font-family="serif">수호</text>
       <text x="0" y="12" text-anchor="middle" font-size="11" font-weight="bold" fill="#F2E7CE" font-family="serif">부</text>`,j=t.noSeal?"":`
    <g transform="translate(${180}, ${506})">
      <rect x="-19" y="-19" width="38" height="38" rx="4" fill="#A72B21"/>
      <rect x="-14.5" y="-14.5" width="29" height="29" rx="3" fill="none" stroke="#F2E7CE" stroke-width="1.2" opacity="0.9"/>
      ${b}
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
  ${m}

  <!-- 상단 매듭 -->
  ${k}

  <!-- 두전 (제목) -->
  <text x="${180}" y="134" text-anchor="middle" font-size="24" font-weight="bold" fill="${u}" font-family="'Gowun Batang', 'AppleMyungjo', serif">${o(a)}</text>
  ${c?`<text x="${180}" y="156" text-anchor="middle" font-size="12" fill="${u}" opacity="0.75" font-family="serif">${o(c)}</text>`:""}
  <line x1="${128}" y1="${c?170:152}" x2="${232}" y2="${c?170:152}" stroke="${u}" stroke-width="1" opacity="0.4"/>

  <!-- 수호 동물 -->
  ${y}

  <!-- 기원 문구 -->
  ${C}

  <!-- 각획 (주문) -->
  <line x1="90" y1="${448}" x2="${270}" y2="${448}" stroke="${u}" stroke-width="1" opacity="0.35"/>
  ${h?`<text x="${180}" y="${468}" text-anchor="middle" font-size="12" fill="${u}" opacity="0.85" font-family="serif">${o(h)}</text>`:""}

  <!-- 낙관 -->
  ${j}
</svg>`}(d,e):function(e,t,r,c,d,h,x,f){var u,p,g;let m=Math.abs(c.split("").reduce((e,t)=>e+t.charCodeAt(0),0))%l.length,k=l[m],y=e?.modern.bg1||t||k.bg1,w=e?.modern.bg2||k.bg2,$=e?.modern.ink||k.ink,C=e?.modern.accent||k.accent,b="";b+=s(55,90,.7,C),b+=s(305,90,.7,C),f?.includes("별")&&(b+=a(50,140,6,C),b+=a(310,140,6,C),b+=a(120,280,5,C),b+=a(240,280,5,C)),f?.includes("연꽃")&&(b+=(u=180,p=400,`<g transform="translate(${u},${p}) scale(0.8)" opacity="0.7">
    <ellipse cx="0" cy="-5" rx="4" ry="10" fill="none" stroke="${C}" stroke-width="1.5"/>
    <ellipse cx="-7" cy="-3" rx="4" ry="9" fill="none" stroke="${C}" stroke-width="1.5" transform="rotate(-25,-7,-3)"/>
    <ellipse cx="7" cy="-3" rx="4" ry="9" fill="none" stroke="${C}" stroke-width="1.5" transform="rotate(25,7,-3)"/>
    <ellipse cx="-12" cy="0" rx="3" ry="7" fill="none" stroke="${C}" stroke-width="1.5" transform="rotate(-45,-12,0)"/>
    <ellipse cx="12" cy="0" rx="3" ry="7" fill="none" stroke="${C}" stroke-width="1.5" transform="rotate(45,12,0)"/>
  </g>`)),f?.includes("태극")&&(b+=(g=180,`<g transform="translate(${g},140)">
    <circle cx="0" cy="0" r="14" fill="none" stroke="${$}" stroke-width="1.5"/>
    <path d="M0 -14 A14 14 0 0 1 0 14 A7 7 0 0 0 0 0 A7 7 0 0 1 0 -14" fill="${$}" opacity="0.3"/>
    <circle cx="0" cy="-7" r="2.8" fill="${$}"/>
    <circle cx="0" cy="7" r="2.8" fill="none" stroke="${$}" stroke-width="1"/>
  </g>`));let j="";r&&n[r]&&(j=`<g transform="translate(${180}, 210)" color="${$}">${n[r]}</g>`);let A=i(d,14),v="";for(let e=0;e<Math.min(A.length,4);e++)v+=`<text x="${180}" y="${300+28*e}" text-anchor="middle" font-size="16" fill="${$}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif">${o(A[e])}</text>`;return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${360} ${560}" preserveAspectRatio="xMidYMid meet">
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
  
    <rect x="16" y="16" width="${328}" height="${528}" rx="20" ry="20" fill="none" stroke="${C}" stroke-width="2" stroke-dasharray="6,4" opacity="0.5"/>
  

  <!-- 장식 -->
  ${b}

  <!-- 상단 이모지 장식 -->
  <text x="${180}" y="50" text-anchor="middle" font-size="28">✨</text>

  <!-- 두전 (상단 제목) -->
  <text x="${180}" y="85" text-anchor="middle" font-size="24" font-weight="bold" fill="${$}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" filter="url(#soft-shadow)">${o(c)}</text>

  <!-- 구분 장식 -->
  <line x1="${140}" y1="98" x2="${220}" y2="98" stroke="${C}" stroke-width="2" opacity="0.5" stroke-linecap="round"/>

  <!-- 동물 심볼 -->
  ${j}

  <!-- 메시지 -->
  ${v}

  <!-- 하단 구분 -->
  <line x1="${120}" y1="${440}" x2="${240}" y2="${440}" stroke="${C}" stroke-width="1.5" opacity="0.4" stroke-linecap="round"/>

  <!-- 각획 (하단 주문) -->
  <text x="${180}" y="${470}" text-anchor="middle" font-size="13" fill="${$}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" opacity="0.8">${o(h)}</text>

  <!-- 하단 이모지 -->
  <text x="${180}" y="${520}" text-anchor="middle" font-size="20">🙏</text>

  <!-- 인장 -->
  
</svg>`}(d,e.bgColor,e.animal,e.title,e.message,e.mantra,e.userName,e.symbols)}])},75811,e=>{e.q("/bujeok-app/_next/static/media/hanji-bg.3x3gcnstqx29_.jpg")},44714,e=>{e.q("/bujeok-app/_next/static/media/wordmark-mark.3urt7e9hv6s_u.png")},64275,e=>{"use strict";var t=e.i(43476),r=e.i(57688),l=e.i(59897),o=e.i(66414);e.s(["default",0,function({left:e,right:i,title:n,showSeal:s=!1,wordmark:a=!1}){return(0,t.jsxs)("header",{className:"flex items-center justify-between px-4 pb-3 pt-[max(0.875rem,env(safe-area-inset-top))]",children:[(0,t.jsx)("div",{className:"flex h-10 w-10 items-center justify-center text-[var(--color-meok)]",children:e}),(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[a&&(0,t.jsx)(r.default,{src:o.default,alt:"수호부",priority:!0,className:"h-16 w-auto"}),!a&&s&&(0,t.jsx)(l.SealLogo,{size:30}),!a&&n&&(0,t.jsx)("h1",{className:"font-serif-kr text-base font-bold tracking-wide text-[var(--color-meok)]",children:n})]}),(0,t.jsx)("div",{className:"flex h-10 w-10 items-center justify-center text-[var(--color-meok)]",children:i})]})}])},21038,e=>{"use strict";var t=e.i(43476),r=e.i(46932);e.s(["default",0,function({children:e,onClick:l,disabled:o=!1,variant:i="primary",className:n=""}){return(0,t.jsx)(r.motion.button,{whileTap:o?void 0:{scale:.97},onClick:l,disabled:o,className:`w-full p-[17px] text-center font-serif-kr text-[16px] tracking-[.08em] transition-colors disabled:opacity-50 ${"primary"===i?"bg-[var(--color-juhong)] text-[var(--color-juhong-tint)]":"bg-transparent text-[rgba(46,46,46,0.6)]"} ${n}`,style:"primary"===i?{border:"1px solid var(--color-juhong-deep)",boxShadow:"inset 0 0 0 1px rgba(247, 233, 207, 0.35), 0 8px 22px rgba(167, 43, 33, 0.25)"}:{border:"1px solid rgba(122, 74, 52, 0.3)"},children:e})}])},3275,e=>{"use strict";var t=e.i(25405);let r=[{id:"aegun",paper:"hwangji",title:"액운 막기",subtitle:"나쁜 기운 차단",hanja:"厄除",color:"#A72B21",category:t.TalismanCategory.Protection,motif:"jangseung"},{id:"yeonae",paper:"hwangji",title:"인연의 기운",subtitle:"설레는 마음과 좋은 인연",hanja:"因緣",color:"#C25B78",category:t.TalismanCategory.Love,motif:"knot"},{id:"maeum",paper:"namsaekji",title:"마음 안정",subtitle:"불안과 걱정 내려놓기",hanja:"平安",color:"#6B7D63",category:t.TalismanCategory.Health,motif:"lotus"},{id:"jaebok",paper:"geumji",title:"재복 기원",subtitle:"재물과 복 불러오기",hanja:"財福",color:"#DAA017",category:t.TalismanCategory.Wealth,motif:"flame"},{id:"geongang",paper:"hwangji",title:"건강 기원",subtitle:"몸과 마음의 건강",hanja:"健康",color:"#1F3E63",category:t.TalismanCategory.Health,motif:"mountain"},{id:"sowon",paper:"hwangji",title:"소원 성취",subtitle:"바라는 일 이루기",hanja:"所願",color:"#DAA017",category:t.TalismanCategory.Other,motif:"flame"},{id:"gajeong",paper:"ssukji",title:"가정 수호",subtitle:"가족의 평안과 화합",hanja:"家宅平安",color:"#7A4A34",category:t.TalismanCategory.Family,motif:"knot"},{id:"hakeop",paper:"geumji",title:"학업·시험",subtitle:"집중력과 좋은 결과",hanja:"合格",color:"#2E2E2E",category:t.TalismanCategory.Study,motif:"cloud"}];e.s(["ENERGIES",0,r,"getEnergyByCategory",0,function(e){return r.find(t=>t.category===e)??r[0]},"getEnergyById",0,function(e){return r.find(t=>t.id===e)}])},27520,e=>{"use strict";var t=e.i(43476),r=e.i(71645),l=e.i(18566),o=e.i(46932),i=e.i(61568),n=e.i(64275),s=e.i(21038),a=e.i(59897),c=e.i(3275),d=e.i(25405),h=e.i(41481),x=e.i(38992);function f(e){return{f:(0,x.sanitizeText)(e.f,x.GIFT_NAME_MAX),m:(0,x.sanitizeText)(e.m,60)}}function u(e){let t,r=(t={v:1,to:(0,x.sanitizeText)(e.to,x.GIFT_NAME_MAX),ev:(0,x.sanitizeText)(e.ev,12),e:e.e,ms:e.ms.slice(0,12).map(f)},(0,x.toBase64Url)(new TextEncoder().encode(JSON.stringify(t)))),l=window.location.pathname.startsWith("/bujeok-app")?"/bujeok-app":"";return`${window.location.origin}${l}/rolling/?d=${r}`}let p="#A72B21",g="#2E2E2E",m="#7A4A34",k=["수능","생일","면접","이사","출산","개업","여행"],y={borderColor:"rgba(122,74,52,0.30)",color:g,background:"rgba(255,255,255,0.35)"},w="w-full rounded-lg border bg-transparent px-3 py-2 text-[13px] outline-none";function $(){try{let e=localStorage.getItem("bujeok-user");if(e){let t=(JSON.parse(e)?.name||"").trim();if(t)return t}let t=localStorage.getItem("user_profile");if(t)return(JSON.parse(t)?.name||"").trim()}catch{}return""}function C({children:e}){return(0,t.jsx)("label",{className:"mb-1 block text-[11px] font-bold",style:{color:`${m}CC`},children:e})}async function b(e,t){try{if(navigator.share)return await navigator.share({title:"수호부 — 롤링 부적",text:e,url:t}),"shared"}catch{return null}try{return await navigator.clipboard.writeText(t),"copied"}catch{return prompt("링크를 복사해 보내주세요",t),null}}function j(){let e=(0,l.useRouter)(),[i,n]=(0,r.useState)(""),[d,h]=(0,r.useState)(""),[f,j]=(0,r.useState)(c.ENERGIES[0].id),[A,v]=(0,r.useState)($),[E,M]=(0,r.useState)(""),[N,F]=(0,r.useState)(null),S=i.trim()&&E.trim(),L=async()=>{if(!S)return;let e=u({v:1,to:i.trim(),ev:d.trim(),e:f,ms:[{f:A.trim(),m:E.trim()}]}),t=await b(`${i.trim()}의 ${d.trim()||"앞날"}을 위한 롤링 부적 — 기원 한 줄 보태줄래? 🙏`,e);t&&F(t)};return(0,t.jsxs)("div",{className:"mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-16",children:[(0,t.jsxs)(o.motion.div,{initial:{opacity:0,y:14},animate:{opacity:1,y:0},className:"pt-4 text-center",children:[(0,t.jsxs)("p",{className:"font-serif-kr text-[20px] leading-relaxed",style:{color:g},children:["여럿의 마음을 모아",(0,t.jsx)("br",{}),"한 장의 부적으로"]}),(0,t.jsxs)("p",{className:"mt-2 text-[12px] leading-relaxed",style:{color:`${m}BB`},children:["큰일을 앞둔 사람에게, 친구들의 기원을 겹쳐 쓴",(0,t.jsx)("br",{}),"롤링 부적을 만들어 보내요. 손을 거칠수록 진해져요."]}),(0,t.jsx)("div",{className:"mt-3 flex justify-center",style:{color:`${g}55`},children:(0,t.jsx)(a.BrushStroke,{width:90})})]}),(0,t.jsxs)("div",{className:"hanji-card mt-5 rounded-2xl px-4 py-4",children:[(0,t.jsx)(C,{children:"누구를 위한 부적인가요?"}),(0,t.jsx)("input",{type:"text",value:i,maxLength:x.GIFT_NAME_MAX,onChange:e=>n(e.target.value),placeholder:"받는 사람 이름",className:w,style:y}),(0,t.jsxs)("div",{className:"mt-3",children:[(0,t.jsx)(C,{children:"앞둔 일"}),(0,t.jsx)("input",{type:"text",value:d,maxLength:12,onChange:e=>h(e.target.value),placeholder:"수능, 생일, 면접 …",className:w,style:y}),(0,t.jsx)("div",{className:"mt-1.5 flex flex-wrap gap-1.5",children:k.map(e=>(0,t.jsx)("button",{type:"button",onClick:()=>h(e),className:"rounded-full px-2.5 py-1 text-[10.5px]",style:{border:d===e?`1px solid ${p}`:"1px solid rgba(122,74,52,0.25)",color:d===e?p:m},children:e},e))})]}),(0,t.jsxs)("div",{className:"mt-3",children:[(0,t.jsx)(C,{children:"담을 기운"}),(0,t.jsx)("div",{className:"flex flex-wrap gap-1.5",children:c.ENERGIES.map(e=>{let r=f===e.id;return(0,t.jsx)("button",{type:"button",onClick:()=>j(e.id),className:"rounded-full px-2.5 py-1 text-[11px] font-bold",style:{border:r?`1.5px solid ${e.color}`:"1px solid rgba(122,74,52,0.25)",color:r?e.color:m,background:r?`${e.color}0D`:"transparent"},children:e.title},e.id)})})]})]}),(0,t.jsxs)("div",{className:"hanji-card mt-3 rounded-2xl px-4 py-4",children:[(0,t.jsx)(C,{children:"첫 기원 한 줄 — 내가 시작해요"}),(0,t.jsx)("input",{type:"text",value:E,maxLength:60,onChange:e=>M(e.target.value),placeholder:"네 앞길에 좋은 일만 가득하기를",className:w,style:y}),(0,t.jsxs)("div",{className:"mt-2",children:[(0,t.jsx)(C,{children:"내 이름 (선택)"}),(0,t.jsx)("input",{type:"text",value:A,maxLength:x.GIFT_NAME_MAX,onChange:e=>v(e.target.value),placeholder:"이름 또는 별명",className:w,style:y})]})]}),(0,t.jsxs)("div",{className:"mt-5",children:[(0,t.jsx)(s.default,{onClick:S?L:void 0,disabled:!S,className:"rounded-lg",children:"📜 롤링 부적 시작하기"}),(0,t.jsx)("p",{className:"mt-2 text-center text-[10.5px]",style:{color:`${m}88`},children:"copied"===N?"링크를 복사했어요 — 다음 사람에게 붙여넣어 넘겨주세요":"shared"===N?"넘겼어요! 링크가 돌수록 부적이 진해져요":"만든 링크를 친구들에게 차례로 넘기고, 마지막에 받는 이에게 전달해요"})]}),(0,t.jsx)("button",{onClick:()=>e.push("/"),className:"mt-6 text-center text-[11px] underline",style:{color:`${m}99`},children:"홈으로 돌아가기"})]})}function A({encoded:e}){let i=(0,l.useRouter)(),n=(0,r.useMemo)(()=>(function(e){let t;if(!e||"string"!=typeof e||e.length>4e3)return null;let r=(0,x.fromBase64Url)(e);if(!r)return null;try{t=JSON.parse(new TextDecoder().decode(r))}catch{return null}if(!t||"object"!=typeof t)return null;let l=t;if(1!==l.v)return null;let o=c.ENERGIES.find(e=>e.id===l.e);if(!o||!Array.isArray(l.ms)||0===l.ms.length)return null;let i=[];for(let e of l.ms.slice(0,12)){if(!e||"object"!=typeof e)continue;let t=f(e);t.m&&i.push(t)}return 0===i.length?null:{v:1,to:(0,x.sanitizeText)(l.to,x.GIFT_NAME_MAX),ev:(0,x.sanitizeText)(l.ev,12),e:o.id,ms:i}})(e),[e]),{svg:k,talisman:j}=(0,r.useMemo)(()=>{if(!n)return{svg:"",talisman:null};let e=c.ENERGIES.find(e=>e.id===n.e),t=(0,d.getTalismanRecommendation)(e.category,n.ev?[n.ev]:[]);return{svg:(0,h.generateTalismanSVG)({type:t.id,style:"traditional",background:e.paper,accent:e.color,title:t.name,hanja:t.hanja,message:`${n.to||"너"}의 ${n.ev||"앞날"}을 위해 ${n.ms.length}명의 마음을 모아`,mantra:t.mantra,symbols:[...t.design.patterns,...t.design.symbols]}),talisman:t}},[n]),[v,E]=(0,r.useState)($),[M,N]=(0,r.useState)(""),[F,S]=(0,r.useState)(null),[L,D]=(0,r.useState)(!1),[B,T]=(0,r.useState)(!1),G=(0,r.useMemo)(()=>`rolling-${(0,x.giftHash)(e)}`,[e]),[I,_]=(0,r.useState)(()=>{try{return JSON.parse(localStorage.getItem("bujeok-collection")||"[]").some(t=>t.id===`rolling-${(0,x.giftHash)(e)}`)}catch{return!1}});if(!n||!j)return(0,t.jsxs)("div",{className:"mx-auto flex w-full max-w-md flex-1 flex-col items-center px-5 pt-16 text-center",children:[(0,t.jsx)(a.KnotMotif,{size:56,className:"mb-4 text-[var(--color-galsaek)] opacity-50"}),(0,t.jsx)("p",{className:"font-serif-kr text-base font-bold",style:{color:g},children:"두루마리가 풀려 있어요"}),(0,t.jsx)("p",{className:"mt-2 text-xs leading-relaxed",style:{color:m},children:"링크가 잘못되었거나 오래된 롤링 부적이에요."}),(0,t.jsx)("div",{className:"mt-6 w-full max-w-[220px]",children:(0,t.jsx)(s.default,{onClick:()=>i.push("/rolling"),children:"새 롤링 부적 시작하기"})})]});let z=n.ms.length>=12,R=async()=>{if(!M.trim()||z)return;let e={...n,ms:[...n.ms,{f:v.trim(),m:M.trim()}]},t=u(e),r=await b(`${n.to}의 ${n.ev||"앞날"}을 위한 롤링 부적 — 이제 ${e.ms.length}명의 마음이 담겼어요. 기원 보태줄래? 🙏`,t);r&&S("copied"===r?"내 기원을 보탠 새 링크를 복사했어요 — 다음 사람에게 붙여넣어 주세요":"기원을 보태 넘겼어요!")},O=async()=>{let e=u(n),t=await b(`${n.to}에게 — ${n.ms.length}명의 마음이 담긴 부적이 도착했어요 📜`,e);t&&S("copied"===t?`링크를 복사했어요 — ${n.to}님에게 붙여넣어 전해주세요`:`${n.to}님에게 전달했어요`)};return(0,t.jsxs)("div",{className:"mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-16",children:[(0,t.jsxs)(o.motion.div,{initial:{opacity:0,y:14},animate:{opacity:1,y:0},className:"pt-2 text-center",children:[(0,t.jsxs)("p",{className:"font-serif-kr text-[19px] leading-relaxed",style:{color:g},children:[(0,t.jsx)("span",{className:"font-bold",children:n.to}),n.ev?`의 ${n.ev}`:"","을 위한",(0,t.jsx)("br",{}),"롤링 부적이 돌고 있어요"]}),(0,t.jsxs)("p",{className:"mt-1.5 text-[12px]",style:{color:`${m}BB`},children:["지금까지 ",(0,t.jsxs)("b",{style:{color:p},children:[n.ms.length,"명"]}),"의 마음이 담겼어요"]})]}),(0,t.jsx)("div",{className:"mt-4 flex justify-center",children:(0,t.jsx)("div",{className:"w-[180px] overflow-hidden rounded-lg",style:{aspectRatio:"360 / 560",boxShadow:"0 4px 18px rgba(122,74,52,0.28)"},dangerouslySetInnerHTML:{__html:k}})}),(0,t.jsxs)("div",{className:"hanji-card mt-4 rounded-2xl px-4 py-4",children:[(0,t.jsxs)("p",{className:"mb-2 text-[11px] font-bold",style:{color:`${m}CC`},children:["쌓인 기원 ",n.ms.length,"갈피"]}),(0,t.jsx)("div",{className:"flex flex-col gap-1.5",children:n.ms.map((e,r)=>(0,t.jsxs)("p",{className:"font-serif-kr text-[12.5px] leading-relaxed",style:{color:g},children:["“",e.m,"”",e.f&&(0,t.jsxs)("span",{className:"ml-1 text-[10.5px]",style:{color:`${m}99`},children:["— ",e.f]})]},r))})]}),!B&&(0,t.jsxs)("div",{className:"hanji-card mt-3 rounded-2xl px-4 py-4",children:[(0,t.jsx)(C,{children:z?"기원이 가득 찼어요 (12갈피)":"나도 기원 한 줄 보태기"}),!z&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("input",{type:"text",value:M,maxLength:60,onChange:e=>N(e.target.value),placeholder:`${n.to}를 위한 한 마디`,className:w,style:y}),(0,t.jsx)("input",{type:"text",value:v,maxLength:x.GIFT_NAME_MAX,onChange:e=>E(e.target.value),placeholder:"내 이름 (선택)",className:`${w} mt-2`,style:y})]})]}),(0,t.jsxs)("div",{className:"mt-4 flex flex-col gap-2.5",children:[!B&&!z&&(0,t.jsx)(s.default,{onClick:M.trim()?R:void 0,disabled:!M.trim(),className:"rounded-lg",children:"✍️ 기원 보태고 다음 사람에게 넘기기"}),!B&&(0,t.jsxs)(s.default,{variant:"ghost",onClick:O,children:["📜 이대로 ",n.to,"님에게 전달하기"]}),B?I?(0,t.jsx)("div",{className:"w-full rounded-lg py-3.5 text-center font-serif-kr text-base font-bold text-[var(--color-ssuk)]",style:{border:"1px solid rgba(107,125,99,0.5)"},children:"이미 간직한 부적이에요"}):L?(0,t.jsxs)("div",{className:"w-full rounded-lg py-3.5 text-center font-serif-kr text-base font-bold text-[var(--color-ssuk)]",style:{border:"1px solid rgba(107,125,99,0.5)"},children:["✓ ",n.ms.length,"명의 마음을 부적함에 간직했어요"]}):(0,t.jsxs)(s.default,{onClick:()=>{if(!L&&!I)try{let e={...j,id:G,sourceId:j.id,savedAt:new Date().toISOString(),note:n.ms.map(e=>e.f?`${e.m} — ${e.f}`:e.m).join(" · "),svg:k,source:"rolling",fromName:n.ms[0]?.f||void 0},t=JSON.parse(localStorage.getItem("bujeok-collection")||"[]");if(t.some(e=>e.id===G))return void _(!0);t.unshift(e),localStorage.setItem("bujeok-collection",JSON.stringify(t)),D(!0)}catch{}},className:"rounded-lg",children:["🙏 ",n.ms.length,"명의 마음, 부적함에 간직하기"]}):(0,t.jsxs)("button",{onClick:()=>T(!0),className:"mt-1 text-center text-[11px] underline",style:{color:`${m}99`},children:["내가 ",n.to,"이에요"]}),F&&(0,t.jsx)("p",{className:"text-center text-[10.5px]",style:{color:`${m}99`},children:F}),(0,t.jsx)(s.default,{variant:"ghost",onClick:()=>i.push("/rolling"),children:"나도 롤링 부적 시작하기"})]})]})}function v(){let e=(0,l.useRouter)(),r=(0,l.useSearchParams)().get("d")??"";return(0,t.jsxs)(i.default,{children:[(0,t.jsx)(n.default,{left:(0,t.jsx)("button",{onClick:()=>e.push("/"),"aria-label":"홈으로",children:(0,t.jsx)(a.BackIcon,{size:20})}),title:"롤링 부적"}),r?(0,t.jsx)(A,{encoded:r}):(0,t.jsx)(j,{})]})}e.s(["default",0,function(){return(0,t.jsx)(r.Suspense,{fallback:null,children:(0,t.jsx)(v,{})})}],27520)}]);