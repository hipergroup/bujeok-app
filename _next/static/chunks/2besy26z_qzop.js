(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,75811,t=>{t.q("/bujeok-app/_next/static/media/hanji-bg.3x3gcnstqx29_.jpg")},44714,t=>{t.q("/bujeok-app/_next/static/media/wordmark-mark.3urt7e9hv6s_u.png")},64275,t=>{"use strict";var e=t.i(43476),r=t.i(57688),o=t.i(59897),l=t.i(66414);t.s(["default",0,function({left:t,right:i,title:n,showSeal:s=!1,wordmark:a=!1}){return(0,e.jsxs)("header",{className:"flex items-center justify-between px-4 pb-3 pt-[max(0.875rem,env(safe-area-inset-top))]",children:[(0,e.jsx)("div",{className:"flex h-10 w-10 items-center justify-center text-[var(--color-meok)]",children:t}),(0,e.jsxs)("div",{className:"flex items-center gap-2",children:[a&&(0,e.jsx)(r.default,{src:l.default,alt:"수호부",priority:!0,className:"h-16 w-auto"}),!a&&s&&(0,e.jsx)(o.SealLogo,{size:30}),!a&&n&&(0,e.jsx)("h1",{className:"font-serif-kr text-base font-bold tracking-wide text-[var(--color-meok)]",children:n})]}),(0,e.jsx)("div",{className:"flex h-10 w-10 items-center justify-center text-[var(--color-meok)]",children:i})]})}])},41481,t=>{"use strict";let e=[{id:"hwangji",label:"한지",swatch:"#F2E7CE",trad:{bg:"#F2E7CE",ink:"#A72B21",text:"#2E2E2E"},modern:{bg1:"#F5EAD5",bg2:"#F5D5C8",ink:"#AA6B3F",accent:"#D4914F"}},{id:"hongji",label:"홍지",swatch:"#B93A32",trad:{bg:"#B93A32",ink:"#F2E7CE",text:"#FFF3D6"},modern:{bg1:"#F5D5D5",bg2:"#F5C8D5",ink:"#A03A3A",accent:"#D46F6F"}},{id:"baekji",label:"백지",swatch:"#F7F3EA",trad:{bg:"#F7F3EA",ink:"#A72B21",text:"#2E2E2E"},modern:{bg1:"#EFEFF5",bg2:"#DDE8F5",ink:"#4F5FAA",accent:"#7A8FD4"}},{id:"simya",label:"심야",swatch:"#151226",trad:{bg:"#151226",ink:"#E8C97A",text:"#D8D4F0"},modern:{bg1:"#1C1830",bg2:"#2A1F42",ink:"#C9B8F0",accent:"#8F7AD4"}},{id:"namsaekji",label:"남색",swatch:"#1F3E63",trad:{bg:"#1F3E63",ink:"#DAA017",text:"#F2E7CE"},modern:{bg1:"#2A4A73",bg2:"#1F3E63",ink:"#E8D9B0",accent:"#DAA017"}},{id:"ssukji",label:"쑥색",swatch:"#6B7D63",trad:{bg:"#6B7D63",ink:"#F2E7CE",text:"#FBF6E8"},modern:{bg1:"#7C8E74",bg2:"#6B7D63",ink:"#F2E7CE",accent:"#DCC9A5"}},{id:"geumji",label:"황금",swatch:"#DAA017",trad:{bg:"#DAA017",ink:"#7A4A34",text:"#3E2A1C"},modern:{bg1:"#E5B23A",bg2:"#DAA017",ink:"#7A4A34",accent:"#A72B21"}}],r=new Set(["hwangji","baekji"]),o=[{bg1:"#E8D5F5",bg2:"#F5D5E8",ink:"#6B3FA0",accent:"#D46FA0"},{bg1:"#D5EEF5",bg2:"#D5F5E8",ink:"#2B7A8A",accent:"#3AAA7A"},{bg1:"#F5EAD5",bg2:"#F5D5D5",ink:"#AA6B3F",accent:"#D46F4F"},{bg1:"#D5D5F5",bg2:"#E8D5F5",ink:"#4F4FAA",accent:"#7A5FD4"},{bg1:"#F5F5D5",bg2:"#E8F5D5",ink:"#6B8A2B",accent:"#8AAA3F"}];function l(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}function i(t,e){let r=[],o="";for(let l of t.split(/\s+/).filter(Boolean)){if(l.length>e){o&&(r.push(o),o="");for(let t=0;t<l.length;t+=e){let i=l.slice(t,t+e);i.length===e?r.push(i):o=i}continue}let t=o?`${o} ${l}`:l;t.length>e?(r.push(o),o=l):o=t}return o&&r.push(o),r}let n={쥐:`<g transform="translate(-20,-20) scale(0.8)">
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
  </g>`};function s(t,e,r,o){return`<g transform="translate(${t},${e}) scale(${r})" opacity="0.6">
    <circle cx="0" cy="0" r="8" fill="none" stroke="${o}" stroke-width="1.5"/>
    <circle cx="10" cy="-3" r="6" fill="none" stroke="${o}" stroke-width="1.5"/>
    <circle cx="-8" cy="2" r="5" fill="none" stroke="${o}" stroke-width="1.5"/>
    <circle cx="5" cy="4" r="7" fill="none" stroke="${o}" stroke-width="1.5"/>
  </g>`}function a(t,e,r,o){let l=[];for(let o=0;o<5;o++){let i=Math.PI/2+2*o*Math.PI/5,n=i+Math.PI/5;l.push(`${t+r*Math.cos(i)},${e-r*Math.sin(i)}`),l.push(`${t+.4*r*Math.cos(n)},${e-.4*r*Math.sin(n)}`)}return`<polygon points="${l.join(" ")}" fill="none" stroke="${o}" stroke-width="1.5" opacity="0.6"/>`}t.s(["ANIMAL_PATHS",0,n,"generateTalismanSVG",0,function(t){var c;if(t.assetUrl)return function(t){let{assetUrl:e,message:r}=t,o="#F2E7CE",n=r?i(r,12).slice(0,2):[],s=n.length?26+24*n.length:0,a=560-s-14,c=n.length?`<rect x="18" y="${a}" width="324" height="${s}" rx="6"
         fill="${o}" opacity="0.9"/>
       <rect x="18" y="${a}" width="324" height="${s}" rx="6"
         fill="none" stroke="#A72B21" stroke-width="1" opacity="0.45"/>`:"",d=n.map((t,e)=>`<text x="168" y="${a+30+24*e}" text-anchor="middle" font-size="17" fill="#2E2E2E" font-family="'Gowun Batang', 'AppleMyungjo', serif">${l(t)}</text>`).join("");return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 560" preserveAspectRatio="xMidYMid meet">
  <rect width="360" height="560" fill="${o}"/>
  <image href="${l(e??"")}" x="0" y="0" width="360" height="560" preserveAspectRatio="xMidYMid meet"/>
  ${c}
  ${d}
  
</svg>`}(t);let d=(c=t.background)?e.find(t=>t.id===c):void 0;return"traditional"===t.style?function(t,e){let{bgColor:o,animal:s,title:a,hanja:c,message:d,mantra:p}=e,h=t?.trad??{bg:"#F2E7CE",ink:"#A72B21",text:"#2E2E2E"},E=h.bg||o||"#F2E7CE",k=(!t||r.has(t.id))&&e.accent||h.ink,x=h.text,f=`<path d="M0 14V0h14M5 14V5h9" fill="none" stroke="${k}" stroke-width="1.4" opacity="0.55"/>`,u=`
    <g transform="translate(30,30)">${f}</g>
    <g transform="translate(${330},30) scale(-1,1)">${f}</g>
    <g transform="translate(30,${530}) scale(1,-1)">${f}</g>
    <g transform="translate(${330},${530}) scale(-1,-1)">${f}</g>
  `,B=`
    <g transform="translate(${180}, 70)" stroke="${k}" fill="none">
      <path d="M0 -22v7" stroke-width="2" stroke-linecap="round"/>
      <rect x="-10" y="-13" width="20" height="20" rx="2" transform="rotate(45 0 -3)" stroke-width="2"/>
      <rect x="-5" y="-8" width="10" height="10" rx="1" transform="rotate(45 0 -3)" stroke-width="1.2"/>
      <path d="M-13 -3c-5 0-5 7 0 7M13 -3c5 0 5 7 0 7" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M-4 11l-2 11M4 11l2 11M0 12v11" stroke-width="1.4" stroke-linecap="round"/>
    </g>
  `,C="";s&&n[s]&&(C=`<g transform="translate(${180}, 208)" color="${k}" opacity="0.9">${n[s]}</g>`);let g=i(d,7).slice(0,3),m=C?272:248,A="";g.forEach((t,e)=>{let r=180+((g.length-1)/2-e)*38;[...t.replace(/\s+/g,"")].forEach((t,e)=>{A+=`<text x="${r}" y="${m+28*e}" text-anchor="middle" font-size="20" fill="${x}" font-family="'Gowun Batang', 'AppleMyungjo', serif">${l(t)}</text>`})});let y=`<text x="0" y="-2" text-anchor="middle" font-size="11" font-weight="bold" fill="#F2E7CE" font-family="serif">수호</text>
       <text x="0" y="12" text-anchor="middle" font-size="11" font-weight="bold" fill="#F2E7CE" font-family="serif">부</text>`,w=e.noSeal?"":`
    <g transform="translate(${180}, ${506})">
      <rect x="-19" y="-19" width="38" height="38" rx="4" fill="#A72B21"/>
      <rect x="-14.5" y="-14.5" width="29" height="29" rx="3" fill="none" stroke="#F2E7CE" stroke-width="1.2" opacity="0.9"/>
      ${y}
    </g>
  `;return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${360} ${560}" preserveAspectRatio="xMidYMid meet">
  <defs>
    <filter id="paper-texture">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
      <feDiffuseLighting in="noise" lighting-color="${E}" surfaceScale="1.2" result="lit">
        <feDistantLight azimuth="45" elevation="58"/>
      </feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="lit" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>
    </filter>
  </defs>

  <!-- 한지 배경 -->
  <rect width="${360}" height="${560}" fill="${E}"/>
  <rect width="${360}" height="${560}" fill="${E}" opacity="0.25" filter="url(#paper-texture)"/>

  <!-- 주홍 이중 테두리 -->
  <rect x="14" y="14" width="${332}" height="${532}" fill="none" stroke="${k}" stroke-width="2.5"/>
  <rect x="21" y="21" width="${318}" height="${518}" fill="none" stroke="${k}" stroke-width="1" opacity="0.8"/>

  <!-- 모서리 뇌문 -->
  ${u}

  <!-- 상단 매듭 -->
  ${B}

  <!-- 두전 (제목) -->
  <text x="${180}" y="134" text-anchor="middle" font-size="24" font-weight="bold" fill="${k}" font-family="'Gowun Batang', 'AppleMyungjo', serif">${l(a)}</text>
  ${c?`<text x="${180}" y="156" text-anchor="middle" font-size="12" fill="${k}" opacity="0.75" font-family="serif">${l(c)}</text>`:""}
  <line x1="${128}" y1="${c?170:152}" x2="${232}" y2="${c?170:152}" stroke="${k}" stroke-width="1" opacity="0.4"/>

  <!-- 수호 동물 -->
  ${C}

  <!-- 기원 문구 -->
  ${A}

  <!-- 각획 (주문) -->
  <line x1="90" y1="${448}" x2="${270}" y2="${448}" stroke="${k}" stroke-width="1" opacity="0.35"/>
  ${p?`<text x="${180}" y="${468}" text-anchor="middle" font-size="12" fill="${k}" opacity="0.85" font-family="serif">${l(p)}</text>`:""}

  <!-- 낙관 -->
  ${w}
</svg>`}(d,t):function(t,e,r,c,d,p,h,E){var k,x,f;let u=Math.abs(c.split("").reduce((t,e)=>t+e.charCodeAt(0),0))%o.length,B=o[u],C=t?.modern.bg1||e||B.bg1,g=t?.modern.bg2||B.bg2,m=t?.modern.ink||B.ink,A=t?.modern.accent||B.accent,y="";y+=s(55,90,.7,A),y+=s(305,90,.7,A),E?.includes("별")&&(y+=a(50,140,6,A),y+=a(310,140,6,A),y+=a(120,280,5,A),y+=a(240,280,5,A)),E?.includes("연꽃")&&(y+=(k=180,x=400,`<g transform="translate(${k},${x}) scale(0.8)" opacity="0.7">
    <ellipse cx="0" cy="-5" rx="4" ry="10" fill="none" stroke="${A}" stroke-width="1.5"/>
    <ellipse cx="-7" cy="-3" rx="4" ry="9" fill="none" stroke="${A}" stroke-width="1.5" transform="rotate(-25,-7,-3)"/>
    <ellipse cx="7" cy="-3" rx="4" ry="9" fill="none" stroke="${A}" stroke-width="1.5" transform="rotate(25,7,-3)"/>
    <ellipse cx="-12" cy="0" rx="3" ry="7" fill="none" stroke="${A}" stroke-width="1.5" transform="rotate(-45,-12,0)"/>
    <ellipse cx="12" cy="0" rx="3" ry="7" fill="none" stroke="${A}" stroke-width="1.5" transform="rotate(45,12,0)"/>
  </g>`)),E?.includes("태극")&&(y+=(f=180,`<g transform="translate(${f},140)">
    <circle cx="0" cy="0" r="14" fill="none" stroke="${m}" stroke-width="1.5"/>
    <path d="M0 -14 A14 14 0 0 1 0 14 A7 7 0 0 0 0 0 A7 7 0 0 1 0 -14" fill="${m}" opacity="0.3"/>
    <circle cx="0" cy="-7" r="2.8" fill="${m}"/>
    <circle cx="0" cy="7" r="2.8" fill="none" stroke="${m}" stroke-width="1"/>
  </g>`));let w="";r&&n[r]&&(w=`<g transform="translate(${180}, 210)" color="${m}">${n[r]}</g>`);let b=i(d,14),$="";for(let t=0;t<Math.min(b.length,4);t++)$+=`<text x="${180}" y="${300+28*t}" text-anchor="middle" font-size="16" fill="${m}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif">${l(b[t])}</text>`;return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${360} ${560}" preserveAspectRatio="xMidYMid meet">
  <defs>
    <linearGradient id="modern-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${C}"/>
      <stop offset="100%" stop-color="${g}"/>
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
  
    <rect x="16" y="16" width="${328}" height="${528}" rx="20" ry="20" fill="none" stroke="${A}" stroke-width="2" stroke-dasharray="6,4" opacity="0.5"/>
  

  <!-- 장식 -->
  ${y}

  <!-- 상단 이모지 장식 -->
  <text x="${180}" y="50" text-anchor="middle" font-size="28">✨</text>

  <!-- 두전 (상단 제목) -->
  <text x="${180}" y="85" text-anchor="middle" font-size="24" font-weight="bold" fill="${m}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" filter="url(#soft-shadow)">${l(c)}</text>

  <!-- 구분 장식 -->
  <line x1="${140}" y1="98" x2="${220}" y2="98" stroke="${A}" stroke-width="2" opacity="0.5" stroke-linecap="round"/>

  <!-- 동물 심볼 -->
  ${w}

  <!-- 메시지 -->
  ${$}

  <!-- 하단 구분 -->
  <line x1="${120}" y1="${440}" x2="${240}" y2="${440}" stroke="${A}" stroke-width="1.5" opacity="0.4" stroke-linecap="round"/>

  <!-- 각획 (하단 주문) -->
  <text x="${180}" y="${470}" text-anchor="middle" font-size="13" fill="${m}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" opacity="0.8">${l(p)}</text>

  <!-- 하단 이모지 -->
  <text x="${180}" y="${520}" text-anchor="middle" font-size="20">🙏</text>

  <!-- 인장 -->
  
</svg>`}(d,t.bgColor,t.animal,t.title,t.message,t.mantra,t.userName,t.symbols)}])},49352,t=>{"use strict";let e={개업대길부:{traditional:"/bujeok-app/talismans/%EA%B0%9C%EC%97%85%EB%8C%80%EA%B8%B8%EB%B6%80-%EC%A0%84%ED%86%B5.png"},경면주사부:{traditional:"/bujeok-app/talismans/%EA%B2%BD%EB%A9%B4%EC%A3%BC%EC%82%AC%EB%B6%80-%EC%A0%84%ED%86%B5.png"},과거급제부:{traditional:"/bujeok-app/talismans/%EA%B3%BC%EA%B1%B0%EA%B8%89%EC%A0%9C%EB%B6%80-%EC%A0%84%ED%86%B5.png"},구설방지부:{traditional:"/bujeok-app/talismans/%EA%B5%AC%EC%84%A4%EB%B0%A9%EC%A7%80%EB%B6%80-%EC%A0%84%ED%86%B5.png"},기우부:{traditional:"/bujeok-app/talismans/%EA%B8%B0%EC%9A%B0%EB%B6%80-%EC%A0%84%ED%86%B5.png"},눈병부:{traditional:"/bujeok-app/talismans/%EB%88%88%EB%B3%91%EB%B6%80-%EC%A0%84%ED%86%B5.png"},도난방지부:{traditional:"/bujeok-app/talismans/%EB%8F%84%EB%82%9C%EB%B0%A9%EC%A7%80%EB%B6%80-%EC%A0%84%ED%86%B5.png"},두통부:{traditional:"/bujeok-app/talismans/%EB%91%90%ED%86%B5%EB%B6%80-%EC%A0%84%ED%86%B5.png"},마마부:{traditional:"/bujeok-app/talismans/%EB%A7%88%EB%A7%88%EB%B6%80-%EC%A0%84%ED%86%B5.png"},매매부:{traditional:"/bujeok-app/talismans/%EB%A7%A4%EB%A7%A4%EB%B6%80-%EC%A0%84%ED%86%B5.png"},문창부:{traditional:"/bujeok-app/talismans/%EB%AC%B8%EC%B0%BD%EB%B6%80-%EC%A0%84%ED%86%B5.png"},방화부:{traditional:"/bujeok-app/talismans/%EB%B0%A9%ED%99%94%EB%B6%80-%EC%A0%84%ED%86%B5.png"},벽사부:{traditional:"/bujeok-app/talismans/%EB%B2%BD%EC%82%AC%EB%B6%80-%EC%A0%84%ED%86%B5.png"},부도옹부:{traditional:"/bujeok-app/talismans/%EB%B6%80%EB%8F%84%EC%98%B9%EB%B6%80-%EC%A0%84%ED%86%B5.png"},부부화합부:{traditional:"/bujeok-app/talismans/%EB%B6%80%EB%B6%80%ED%99%94%ED%95%A9%EB%B6%80-%EC%A0%84%ED%86%B5.png"},불면부:{traditional:"/bujeok-app/talismans/%EB%B6%88%EB%A9%B4%EB%B6%80-%EC%A0%84%ED%86%B5.png"},불화방지부:{traditional:"/bujeok-app/talismans/%EB%B6%88%ED%99%94%EB%B0%A9%EC%A7%80%EB%B6%80-%EC%A0%84%ED%86%B5.png"},사업번창부:{traditional:"/bujeok-app/talismans/%EC%82%AC%EC%97%85%EB%B2%88%EC%B0%BD%EB%B6%80-%EC%A0%84%ED%86%B5.png"},삼재부:{traditional:"/bujeok-app/talismans/%EC%82%BC%EC%9E%AC%EB%B6%80-%EC%A0%84%ED%86%B5.png"},상사부:{traditional:"/bujeok-app/talismans/%EC%83%81%EC%82%AC%EB%B6%80-%EC%A0%84%ED%86%B5.png"},소아부:{traditional:"/bujeok-app/talismans/%EC%86%8C%EC%95%84%EB%B6%80-%EC%A0%84%ED%86%B5.png"},수명장수부:{traditional:"/bujeok-app/talismans/%EC%88%98%EB%AA%85%EC%9E%A5%EC%88%98%EB%B6%80-%EC%A0%84%ED%86%B5.png"},수살막이부:{traditional:"/bujeok-app/talismans/%EC%88%98%EC%82%B4%EB%A7%89%EC%9D%B4%EB%B6%80-%EC%A0%84%ED%86%B5.png"},승진부:{traditional:"/bujeok-app/talismans/%EC%8A%B9%EC%A7%84%EB%B6%80-%EC%A0%84%ED%86%B5.png"},안태부:{traditional:"/bujeok-app/talismans/%EC%95%88%ED%83%9C%EB%B6%80-%EC%A0%84%ED%86%B5.png"},애정부:{traditional:"/bujeok-app/talismans/%EC%95%A0%EC%A0%95%EB%B6%80-%EC%A0%84%ED%86%B5.png"},여행부:{traditional:"/bujeok-app/talismans/%EC%97%AC%ED%96%89%EB%B6%80-%EC%A0%84%ED%86%B5.png"},오방신장부:{traditional:"/bujeok-app/talismans/%EC%98%A4%EB%B0%A9%EC%8B%A0%EC%9E%A5%EB%B6%80-%EC%A0%84%ED%86%B5.png"},인연부:{traditional:"/bujeok-app/talismans/%EC%9D%B8%EC%97%B0%EB%B6%80-%EC%A0%84%ED%86%B5.png"},작명부:{traditional:"/bujeok-app/talismans/%EC%9E%91%EB%AA%85%EB%B6%80-%EC%A0%84%ED%86%B5.png"},잡인퇴거부:{traditional:"/bujeok-app/talismans/%EC%9E%A1%EC%9D%B8%ED%87%B4%EA%B1%B0%EB%B6%80-%EC%A0%84%ED%86%B5.png"},재물부:{traditional:"/bujeok-app/talismans/%EC%9E%AC%EB%AC%BC%EB%B6%80-%EC%A0%84%ED%86%B5.png"},정승부:{traditional:"/bujeok-app/talismans/%EC%A0%95%EC%8A%B9%EB%B6%80-%EC%A0%84%ED%86%B5.png"},진택부:{traditional:"/bujeok-app/talismans/%EC%A7%84%ED%83%9D%EB%B6%80-%EC%A0%84%ED%86%B5.png"},집중부:{traditional:"/bujeok-app/talismans/%EC%A7%91%EC%A4%91%EB%B6%80-%EC%A0%84%ED%86%B5.png"},천왕부:{traditional:"/bujeok-app/talismans/%EC%B2%9C%EC%99%95%EB%B6%80-%EC%A0%84%ED%86%B5.png"},초복부:{traditional:"/bujeok-app/talismans/%EC%B4%88%EB%B3%B5%EB%B6%80-%EC%A0%84%ED%86%B5.png"},총명부:{traditional:"/bujeok-app/talismans/%EC%B4%9D%EB%AA%85%EB%B6%80-%EC%A0%84%ED%86%B5.png"},출입문부:{traditional:"/bujeok-app/talismans/%EC%B6%9C%EC%9E%85%EB%AC%B8%EB%B6%80-%EC%A0%84%ED%86%B5.png"},치병부:{traditional:"/bujeok-app/talismans/%EC%B9%98%EB%B3%91%EB%B6%80-%EC%A0%84%ED%86%B5.png"},택일부:{traditional:"/bujeok-app/talismans/%ED%83%9D%EC%9D%BC%EB%B6%80-%EC%A0%84%ED%86%B5.png"},합격부:{traditional:"/bujeok-app/talismans/%ED%95%A9%EA%B2%A9%EB%B6%80-%EC%A0%84%ED%86%B5.png"},해몽부:{traditional:"/bujeok-app/talismans/%ED%95%B4%EB%AA%BD%EB%B6%80-%EC%A0%84%ED%86%B5.png"},호신부:{traditional:"/bujeok-app/talismans/%ED%98%B8%EC%8B%A0%EB%B6%80-%EC%A0%84%ED%86%B5.png"},화목부:{traditional:"/bujeok-app/talismans/%ED%99%94%EB%AA%A9%EB%B6%80-%EC%A0%84%ED%86%B5.png"},화합부:{traditional:"/bujeok-app/talismans/%ED%99%94%ED%95%A9%EB%B6%80-%EC%A0%84%ED%86%B5.png"},횡재부:{traditional:"/bujeok-app/talismans/%ED%9A%A1%EC%9E%AC%EB%B6%80-%EC%A0%84%ED%86%B5.png"}};t.s(["getTalismanAsset",0,function(t,r){if(t)return e[t.normalize("NFC")]?.[r]}])},93130,t=>{"use strict";var e=t.i(43476),r=t.i(71645),o=t.i(18566),l=t.i(61568),i=t.i(64275),n=t.i(59897),s=t.i(25405),a=t.i(49352),c=t.i(41481);let d="#2E2E2E",p="#7A4A34",h="#A72B21";function E({t}){let o=(0,r.useMemo)(()=>(0,c.generateTalismanSVG)({type:t.id,style:"traditional",background:"hwangji",accent:t.colors[2],title:t.name,hanja:t.hanja,message:t.description.slice(0,20),mantra:t.mantra,symbols:[...t.design.patterns,...t.design.symbols]}),[t]);return(0,e.jsx)("div",{className:"w-full overflow-hidden rounded-md",style:{aspectRatio:"360 / 560"},dangerouslySetInnerHTML:{__html:o}})}function k({t,asset:o,forceOpen:l}){let[i,n]=(0,r.useState)(!1),s=l||i;return(0,e.jsxs)("div",{className:"hanji-card rounded-xl p-3",children:[o?(0,e.jsx)("img",{src:o,alt:t.name,className:"w-full rounded-md",style:{aspectRatio:"600 / 900",objectFit:"cover"},loading:"lazy"}):(0,e.jsx)(E,{t:t}),(0,e.jsxs)("p",{className:"mt-2 font-serif-kr text-[13px] font-bold",style:{color:d},children:[t.name,(0,e.jsx)("span",{className:"ml-1 text-[10px] font-normal",style:{color:`${p}99`},children:t.hanja})]}),(0,e.jsxs)("p",{className:"text-[10px]",style:{color:`${p}88`},children:[t.category," · ",t.id]}),!o&&(0,e.jsxs)(e.Fragment,{children:[(0,e.jsx)("button",{onClick:()=>n(t=>!t),className:"mt-1.5 text-[10.5px] underline",style:{color:h},children:s?"제작 참고 접기":"제작 참고 보기"}),s&&(0,e.jsxs)("div",{className:"mt-1.5 rounded-md px-2 py-1.5 text-[10.5px] leading-relaxed",style:{background:"rgba(122,74,52,0.06)",color:p},children:[(0,e.jsxs)("p",{children:[(0,e.jsx)("b",{children:"중앙 글자"})," ",t.design.centerText]}),(0,e.jsxs)("p",{children:[(0,e.jsx)("b",{children:"문양"})," ",t.design.patterns.join(", ")||"—"]}),(0,e.jsxs)("p",{children:[(0,e.jsx)("b",{children:"상징"})," ",t.design.symbols.join(", ")||"—"]}),t.design.notes&&(0,e.jsxs)("p",{children:[(0,e.jsx)("b",{children:"지침"})," ",t.design.notes]}),t.mantra&&(0,e.jsxs)("p",{children:[(0,e.jsx)("b",{children:"주문"})," ",t.mantra,(0,e.jsxs)("span",{style:{color:`${p}99`},children:[" ","— 부적에 쓰는 글귀"]})]}),(0,e.jsxs)("p",{style:{marginTop:2,color:`${p}99`},children:["파일명: ",t.name,"-전통.png (600×900)"]})]})]})]})}t.s(["default",0,function(){let t=(0,o.useRouter)(),[c,E]=(0,r.useState)(!1),{missing:x,done:f}=(0,r.useMemo)(()=>{let t=[],e=[];for(let r of s.TALISMANS){let o=(0,a.getTalismanAsset)(r.name,"traditional");o?e.push({t:r,asset:o}):t.push(r)}return{missing:t,done:e}},[]);return(0,e.jsxs)(l.default,{children:[(0,e.jsx)(i.default,{left:(0,e.jsx)("button",{onClick:()=>t.push("/"),"aria-label":"홈으로",children:(0,e.jsx)(n.BackIcon,{size:20})}),title:"부적 화첩"}),(0,e.jsxs)("main",{className:"mx-auto w-full max-w-2xl flex-1 px-5 pb-24",children:[(0,e.jsxs)("p",{className:"mb-5 text-center text-[11px]",style:{color:`${p}99`},children:["제작 현황 — 그림 ",f.length,"종 · 미제작 ",x.length,"종 (전체"," ",s.TALISMANS.length,"종)"]}),(0,e.jsxs)("div",{className:"mb-5 rounded-xl px-4 py-3.5 text-[11.5px] leading-[1.8]",style:{border:"1px solid rgba(122,74,52,0.3)",background:"rgba(255,251,240,0.75)",color:p},children:[(0,e.jsx)("p",{className:"mb-1 font-serif-kr font-bold",style:{color:d},children:"그림 제작 공통 지침"}),(0,e.jsx)("p",{children:"· 세로형 600×900 (비율 2:3), 파일명 「부적이름-전통.png」"}),(0,e.jsx)("p",{children:"· 상단 勅令 · 하단 急急如律令 · 중앙 글자를 부적 문법대로 배치"}),(0,e.jsx)("p",{children:"· 먹은 주사(朱砂) 붉은색, 종이는 황지(黃紙) — 47종 공통"}),(0,e.jsxs)("p",{children:["· ",(0,e.jsx)("b",{style:{color:h},children:"오른쪽 아래(가로 79% · 세로 82% 언저리)는 비워둘 것"})," — 완성 때 사용자의 이름 인장이 그 자리에 찍힌다"]}),(0,e.jsx)("p",{children:"· 아래쪽 15%는 여백으로 — 기원 문구 띠가 얹힐 수 있는 자리"})]}),(0,e.jsxs)("div",{className:"mb-3 flex items-center justify-between",children:[(0,e.jsxs)("h2",{className:"font-serif-kr text-[15px] font-bold",style:{color:h},children:["🖌️ 아직 그림이 없는 부적 ",x.length,"종"]}),(0,e.jsx)("button",{onClick:()=>E(t=>!t),className:"shrink-0 rounded-full px-3 py-1 text-[11px] font-bold",style:{border:"1px solid rgba(167,43,33,0.4)",color:h,background:"rgba(246,237,217,0.7)"},children:c?"참고 모두 접기":"참고 모두 펼치기"})]}),(0,e.jsx)("h2",{className:"hidden",children:""}),(0,e.jsx)("p",{className:"-mt-2 mb-3 text-[10.5px]",style:{color:`${p}99`},children:"지금은 자동 생성본으로 나가요 — 카드의 제작 참고대로 그려서 올리면 돼요"}),(0,e.jsx)("div",{className:"grid grid-cols-2 gap-3 sm:grid-cols-3",children:x.map(t=>(0,e.jsx)(k,{t:t,forceOpen:c},t.id))}),(0,e.jsxs)("h2",{className:"mb-3 mt-8 font-serif-kr text-[15px] font-bold",style:{color:d},children:["✅ 그림이 들어간 부적 ",f.length,"종"]}),(0,e.jsx)("div",{className:"grid grid-cols-2 gap-3 sm:grid-cols-3",children:f.map(({t,asset:r})=>(0,e.jsx)(k,{t:t,asset:r},t.id))})]})]})}])}]);