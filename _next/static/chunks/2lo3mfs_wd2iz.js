(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,75811,e=>{e.q("/bujeok-app/_next/static/media/hanji-bg.3x3gcnstqx29_.jpg")},44714,e=>{e.q("/bujeok-app/_next/static/media/wordmark-mark.3urt7e9hv6s_u.png")},64275,e=>{"use strict";var t=e.i(43476),r=e.i(57688),o=e.i(59897),l=e.i(66414);e.s(["default",0,function({left:e,right:n,title:i,showSeal:s=!1,wordmark:a=!1}){return(0,t.jsxs)("header",{className:"flex items-center justify-between px-4 pb-3 pt-[max(0.875rem,env(safe-area-inset-top))]",children:[(0,t.jsx)("div",{className:"flex h-10 w-10 items-center justify-center text-[var(--color-meok)]",children:e}),(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[a&&(0,t.jsx)(r.default,{src:l.default,alt:"수호부",priority:!0,className:"h-16 w-auto"}),!a&&s&&(0,t.jsx)(o.SealLogo,{size:30}),!a&&i&&(0,t.jsx)("h1",{className:"font-serif-kr text-base font-bold tracking-wide text-[var(--color-meok)]",children:i})]}),(0,t.jsx)("div",{className:"flex h-10 w-10 items-center justify-center text-[var(--color-meok)]",children:n})]})}])},88653,e=>{"use strict";e.i(47167);var t=e.i(43476),r=e.i(71645),o=e.i(31178),l=e.i(47414),n=e.i(74008),i=e.i(21476),s=e.i(72846),a=r,c=e.i(37806);function d(e,t){if("function"==typeof e)return e(t);null!=e&&(e.current=t)}class u extends a.Component{getSnapshotBeforeUpdate(e){let t=this.props.childRef.current;if((0,s.isHTMLElement)(t)&&e.isPresent&&!this.props.isPresent&&!1!==this.props.pop){let e=t.offsetParent,r=(0,s.isHTMLElement)(e)&&e.offsetWidth||0,o=(0,s.isHTMLElement)(e)&&e.offsetHeight||0,l=getComputedStyle(t),n=this.props.sizeRef.current;n.height=parseFloat(l.height),n.width=parseFloat(l.width),n.top=t.offsetTop,n.left=t.offsetLeft,n.right=r-n.width-n.left,n.bottom=o-n.height-n.top,n.direction=l.direction}return null}componentDidUpdate(){}render(){return this.props.children}}function f({children:e,isPresent:o,anchorX:l,anchorY:n,root:i,pop:s}){let h=(0,a.useId)(),p=(0,a.useRef)(null),x=(0,a.useRef)({width:0,height:0,top:0,left:0,right:0,bottom:0,direction:"ltr"}),{nonce:g}=(0,a.useContext)(c.MotionConfigContext),y=function(...e){return r.useCallback(function(...e){return t=>{let r=!1,o=e.map(e=>{let o=d(e,t);return r||"function"!=typeof o||(r=!0),o});if(r)return()=>{for(let t=0;t<o.length;t++){let r=o[t];"function"==typeof r?r():d(e[t],null)}}}}(...e),e)}(p,!1!==s?e.props?.ref??e?.ref:void 0);return(0,a.useInsertionEffect)(()=>{let{width:e,height:t,top:r,left:a,right:c,bottom:d,direction:u}=x.current;if(o||!1===s||!p.current||!e||!t)return;let f="rtl"===u,y="left"===l?f?`right: ${c}`:`left: ${a}`:f?`left: ${a}`:`right: ${c}`,k="bottom"===n?`bottom: ${d}`:`top: ${r}`;p.current.dataset.motionPopId=h;let m=document.createElement("style");g&&(m.nonce=g);let w=i??document.head;return w.appendChild(m),m.sheet&&m.sheet.insertRule(`
          [data-motion-pop-id="${h}"] {
            position: absolute !important;
            width: ${e}px !important;
            height: ${t}px !important;
            ${y}px !important;
            ${k}px !important;
          }
        `),()=>{p.current?.removeAttribute("data-motion-pop-id"),w.contains(m)&&w.removeChild(m)}},[o]),(0,t.jsx)(u,{isPresent:o,childRef:p,sizeRef:x,pop:s,children:!1===s?e:a.cloneElement(e,{ref:y})})}let h=({children:e,initial:o,isPresent:s,onExitComplete:a,custom:c,presenceAffectsLayout:d,mode:u,anchorX:h,anchorY:x,root:g})=>{let y=(0,l.useConstant)(p),k=(0,r.useId)(),m=(0,r.useRef)(s),w=(0,r.useRef)(a);(0,n.useIsomorphicLayoutEffect)(()=>{m.current=s,w.current=a});let C=!0,b=(0,r.useMemo)(()=>(C=!1,{id:k,initial:o,isPresent:s,custom:c,onExitComplete:e=>{for(let t of(y.set(e,!0),y.values()))if(!t)return;a&&a()},register:e=>(y.set(e,!1),()=>{y.delete(e),m.current||y.size||w.current?.()})}),[s,y,a]);return d&&C&&(b={...b}),(0,r.useMemo)(()=>{y.forEach((e,t)=>y.set(t,!1))},[s]),r.useEffect(()=>{s||y.size||!a||a()},[s]),e=(0,t.jsx)(f,{pop:"popLayout"===u,isPresent:s,anchorX:h,anchorY:x,root:g,children:e}),(0,t.jsx)(i.PresenceContext.Provider,{value:b,children:e})};function p(){return new Map}var x=e.i(64978);let g=e=>e.key||"";function y(e){let t=[];return r.Children.forEach(e,e=>{(0,r.isValidElement)(e)&&t.push(e)}),t}e.s(["AnimatePresence",0,({children:e,custom:i,initial:s=!0,onExitComplete:a,presenceAffectsLayout:c=!0,mode:d="sync",propagate:u=!1,anchorX:f="left",anchorY:p="top",root:k})=>{let[m,w]=(0,x.usePresence)(u),C=(0,r.useMemo)(()=>y(e),[e]),b=u&&!m?[]:C.map(g),$=(0,r.useRef)(!0),v=(0,r.useRef)(C),j=(0,l.useConstant)(()=>new Map),A=(0,r.useRef)(new Set),[E,M]=(0,r.useState)(C),[L,F]=(0,r.useState)(C);(0,n.useIsomorphicLayoutEffect)(()=>{$.current=!1,v.current=C;for(let e=0;e<L.length;e++){let t=g(L[e]);b.includes(t)?(j.delete(t),A.current.delete(t)):!0!==j.get(t)&&j.set(t,!1)}},[L,b.length,b.join("-")]);let S=[];if(C!==E){let e=[...C];for(let t=0;t<L.length;t++){let r=L[t],o=g(r);b.includes(o)||(e.splice(t,0,r),S.push(r))}return"wait"===d&&S.length&&(e=S),F(y(e)),M(C),null}let{forceRender:D}=(0,r.useContext)(o.LayoutGroupContext);return(0,t.jsx)(t.Fragment,{children:L.map(e=>{let r=g(e),o=(!u||!!m)&&(C===L||b.includes(r));return(0,t.jsx)(h,{isPresent:o,initial:(!$.current||!!s)&&void 0,custom:i,presenceAffectsLayout:c,mode:d,root:k,onExitComplete:o?void 0:()=>{if(A.current.has(r)||!j.has(r))return;A.current.add(r),j.set(r,!0);let e=!0;j.forEach(t=>{t||(e=!1)}),e&&(D?.(),F(v.current),u&&w?.(),a&&a())},anchorX:f,anchorY:p,children:e},r)})})}],88653)},95057,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var o={formatUrl:function(){return s},formatWithValidation:function(){return c},urlObjectKeys:function(){return a}};for(var l in o)Object.defineProperty(r,l,{enumerable:!0,get:o[l]});let n=e.r(90809)._(e.r(98183)),i=/https?|ftp|gopher|file/;function s(e){let{auth:t,hostname:r}=e,o=e.protocol||"",l=e.pathname||"",s=e.hash||"",a=e.query||"",c=!1;t=t?encodeURIComponent(t).replace(/%3A/i,":")+"@":"",e.host?c=t+e.host:r&&(c=t+(~r.indexOf(":")?`[${r}]`:r),e.port&&(c+=":"+e.port)),a&&"object"==typeof a&&(a=String(n.urlQueryToSearchParams(a)));let d=e.search||a&&`?${a}`||"";return o&&!o.endsWith(":")&&(o+=":"),e.slashes||(!o||i.test(o))&&!1!==c?(c="//"+(c||""),l&&"/"!==l[0]&&(l="/"+l)):c||(c=""),s&&"#"!==s[0]&&(s="#"+s),d&&"?"!==d[0]&&(d="?"+d),l=l.replace(/[?#]/g,encodeURIComponent),d=d.replace("#","%23"),`${o}${c}${l}${d}${s}`}let a=["auth","hash","host","hostname","href","path","pathname","port","protocol","query","search","slashes"];function c(e){return s(e)}},73668,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"isLocalURL",{enumerable:!0,get:function(){return n}});let o=e.r(18967),l=e.r(52817);function n(e){if(!(0,o.isAbsoluteUrl)(e))return!0;try{let t=(0,o.getLocationOrigin)(),r=new URL(e,t);return r.origin===t&&(0,l.hasBasePath)(r.pathname)}catch(e){return!1}}},84508,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"errorOnce",{enumerable:!0,get:function(){return o}});let o=e=>{}},22016,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var o={default:function(){return y},useLinkStatus:function(){return m}};for(var l in o)Object.defineProperty(r,l,{enumerable:!0,get:o[l]});let n=e.r(90809),i=e.r(43476),s=n._(e.r(71645)),a=e.r(95057),c=e.r(8372),d=e.r(18581),u=e.r(18967),f=e.r(5550);e.r(33525);let h=e.r(88540),p=e.r(91949),x=e.r(73668),g=e.r(9396);function y(t){var r,o;let l,n,y,[m,w]=(0,s.useOptimistic)(p.IDLE_LINK_STATUS),C=(0,s.useRef)(null),{href:b,as:$,children:v,prefetch:j=null,passHref:A,replace:E,shallow:M,scroll:L,onClick:F,onMouseEnter:S,onTouchStart:D,legacyBehavior:N=!1,onNavigate:T,transitionTypes:I,ref:B,unstable_dynamicOnHover:P,...R}=t;l=v,N&&("string"==typeof l||"number"==typeof l)&&(l=(0,i.jsx)("a",{children:l}));let _=s.default.useContext(c.AppRouterContext),O=!1!==j,z=!1!==j?null===(o=j)||"auto"===o?g.FetchStrategy.PPR:g.FetchStrategy.Full:g.FetchStrategy.PPR,G="string"==typeof(r=$||b)?r:(0,a.formatUrl)(r);if(N){if(l?.$$typeof===Symbol.for("react.lazy"))throw Object.defineProperty(Error("`<Link legacyBehavior>` received a direct child that is either a Server Component, or JSX that was loaded with React.lazy(). This is not supported. Either remove legacyBehavior, or make the direct child a Client Component that renders the Link's `<a>` tag."),"__NEXT_ERROR_CODE",{value:"E863",enumerable:!1,configurable:!0});n=s.default.Children.only(l)}let U=N?n&&"object"==typeof n&&n.ref:B,K=s.default.useCallback(e=>(null!==_&&(C.current=(0,p.mountLinkInstance)(e,G,_,z,O,w)),()=>{C.current&&((0,p.unmountLinkForCurrentNavigation)(C.current),C.current=null),(0,p.unmountPrefetchableInstance)(e)}),[O,G,_,z,w]),H={ref:(0,d.useMergedRef)(K,U),onClick(t){N||"function"!=typeof F||F(t),N&&n.props&&"function"==typeof n.props.onClick&&n.props.onClick(t),!_||t.defaultPrevented||function(t,r,o,l,n,i,a){if("u">typeof window){let c,{nodeName:d}=t.currentTarget;if("A"===d.toUpperCase()&&((c=t.currentTarget.getAttribute("target"))&&"_self"!==c||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey||t.nativeEvent&&2===t.nativeEvent.which)||t.currentTarget.hasAttribute("download"))return;if(!(0,x.isLocalURL)(r)){l&&(t.preventDefault(),location.replace(r));return}if(t.preventDefault(),i){let e=!1;if(i({preventDefault:()=>{e=!0}}),e)return}let{dispatchNavigateAction:u}=e.r(99781);s.default.startTransition(()=>{u(r,l?"replace":"push",!1===n?h.ScrollBehavior.NoScroll:h.ScrollBehavior.Default,o.current,a)})}}(t,G,C,E,L,T,I)},onMouseEnter(e){N||"function"!=typeof S||S(e),N&&n.props&&"function"==typeof n.props.onMouseEnter&&n.props.onMouseEnter(e),_&&O&&(0,p.onNavigationIntent)(e.currentTarget,!0===P)},onTouchStart:function(e){N||"function"!=typeof D||D(e),N&&n.props&&"function"==typeof n.props.onTouchStart&&n.props.onTouchStart(e),_&&O&&(0,p.onNavigationIntent)(e.currentTarget,!0===P)}};return(0,u.isAbsoluteUrl)(G)?H.href=G:N&&!A&&("a"!==n.type||"href"in n.props)||(H.href=(0,f.addBasePath)(G)),y=N?s.default.cloneElement(n,H):(0,i.jsx)("a",{...R,...H,children:l}),(0,i.jsx)(k.Provider,{value:m,children:y})}e.r(84508);let k=(0,s.createContext)(p.IDLE_LINK_STATUS),m=()=>(0,s.useContext)(k);("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},93775,e=>{"use strict";var t=e.i(43476),r=e.i(22016),o=e.i(18566),l=e.i(59897);let n=[{href:"/",label:"홈",Icon:l.HomeTabIcon,group:["/"]},{href:"/talisman",label:"부적 짓기",Icon:l.BrushTabIcon,group:["/talisman"]},{href:"/unse",label:"운세",Icon:l.FortuneTabIcon,group:["/unse","/saju","/gunghap","/days","/glossary"]},{href:"/collection",label:"부적함",Icon:l.BoxTabIcon,group:["/collection","/encyclopedia"]},{href:"/mypage",label:"마이",Icon:l.PersonTabIcon,group:["/mypage"]}];e.s(["default",0,function(){let e=(0,o.usePathname)();return(0,t.jsx)("nav",{className:"hanji-surface fixed bottom-0 left-0 right-0 z-50",style:{borderTop:"1px solid rgba(122, 74, 52, 0.35)"},children:(0,t.jsx)("div",{className:"mx-auto flex max-w-lg items-center justify-around py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]",children:n.map(({href:o,label:l,Icon:n,group:i})=>{let s=i.some(t=>"/"===t?"/"===e:e.startsWith(t));return(0,t.jsxs)(r.default,{href:o,className:`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${s?"text-[var(--color-juhong)]":"text-[var(--color-galsaek)] opacity-60 hover:opacity-90"}`,children:[(0,t.jsx)(n,{size:24}),(0,t.jsx)("span",{className:`text-[10px] ${s?"font-bold":"font-medium"}`,children:l})]},o)})})})}])},21038,e=>{"use strict";var t=e.i(43476),r=e.i(46932);e.s(["default",0,function({children:e,onClick:o,disabled:l=!1,variant:n="primary",className:i=""}){return(0,t.jsx)(r.motion.button,{whileTap:l?void 0:{scale:.97},onClick:o,disabled:l,className:`w-full p-[17px] text-center font-serif-kr text-[16px] tracking-[.08em] transition-colors disabled:opacity-50 ${"primary"===n?"bg-[var(--color-juhong)] text-[var(--color-juhong-tint)]":"bg-transparent text-[rgba(46,46,46,0.6)]"} ${i}`,style:"primary"===n?{border:"1px solid var(--color-juhong-deep)",boxShadow:"inset 0 0 0 1px rgba(247, 233, 207, 0.35), 0 8px 22px rgba(167, 43, 33, 0.25)"}:{border:"1px solid rgba(122, 74, 52, 0.3)"},children:e})}])},41481,e=>{"use strict";let t=[{id:"hwangji",label:"한지",swatch:"#F2E7CE",trad:{bg:"#F2E7CE",ink:"#A72B21",text:"#2E2E2E"},modern:{bg1:"#F5EAD5",bg2:"#F5D5C8",ink:"#AA6B3F",accent:"#D4914F"}},{id:"hongji",label:"홍지",swatch:"#B93A32",trad:{bg:"#B93A32",ink:"#F2E7CE",text:"#FFF3D6"},modern:{bg1:"#F5D5D5",bg2:"#F5C8D5",ink:"#A03A3A",accent:"#D46F6F"}},{id:"baekji",label:"백지",swatch:"#F7F3EA",trad:{bg:"#F7F3EA",ink:"#A72B21",text:"#2E2E2E"},modern:{bg1:"#EFEFF5",bg2:"#DDE8F5",ink:"#4F5FAA",accent:"#7A8FD4"}},{id:"simya",label:"심야",swatch:"#151226",trad:{bg:"#151226",ink:"#E8C97A",text:"#D8D4F0"},modern:{bg1:"#1C1830",bg2:"#2A1F42",ink:"#C9B8F0",accent:"#8F7AD4"}},{id:"namsaekji",label:"남색",swatch:"#1F3E63",trad:{bg:"#1F3E63",ink:"#DAA017",text:"#F2E7CE"},modern:{bg1:"#2A4A73",bg2:"#1F3E63",ink:"#E8D9B0",accent:"#DAA017"}},{id:"ssukji",label:"쑥색",swatch:"#6B7D63",trad:{bg:"#6B7D63",ink:"#F2E7CE",text:"#FBF6E8"},modern:{bg1:"#7C8E74",bg2:"#6B7D63",ink:"#F2E7CE",accent:"#DCC9A5"}},{id:"geumji",label:"황금",swatch:"#DAA017",trad:{bg:"#DAA017",ink:"#7A4A34",text:"#3E2A1C"},modern:{bg1:"#E5B23A",bg2:"#DAA017",ink:"#7A4A34",accent:"#A72B21"}}],r=new Set(["hwangji","baekji"]),o=[{bg1:"#E8D5F5",bg2:"#F5D5E8",ink:"#6B3FA0",accent:"#D46FA0"},{bg1:"#D5EEF5",bg2:"#D5F5E8",ink:"#2B7A8A",accent:"#3AAA7A"},{bg1:"#F5EAD5",bg2:"#F5D5D5",ink:"#AA6B3F",accent:"#D46F4F"},{bg1:"#D5D5F5",bg2:"#E8D5F5",ink:"#4F4FAA",accent:"#7A5FD4"},{bg1:"#F5F5D5",bg2:"#E8F5D5",ink:"#6B8A2B",accent:"#8AAA3F"}];function l(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}function n(e,t){let r=[],o="";for(let l of e.split(/\s+/).filter(Boolean)){if(l.length>t){o&&(r.push(o),o="");for(let e=0;e<l.length;e+=t){let n=l.slice(e,e+t);n.length===t?r.push(n):o=n}continue}let e=o?`${o} ${l}`:l;e.length>t?(r.push(o),o=l):o=e}return o&&r.push(o),r}let i={쥐:`<g transform="translate(-20,-20) scale(0.8)">
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
  </g>`}function a(e,t,r,o){let l=[];for(let o=0;o<5;o++){let n=Math.PI/2+2*o*Math.PI/5,i=n+Math.PI/5;l.push(`${e+r*Math.cos(n)},${t-r*Math.sin(n)}`),l.push(`${e+.4*r*Math.cos(i)},${t-.4*r*Math.sin(i)}`)}return`<polygon points="${l.join(" ")}" fill="none" stroke="${o}" stroke-width="1.5" opacity="0.6"/>`}e.s(["ANIMAL_PATHS",0,i,"generateTalismanSVG",0,function(e){var c;if(e.assetUrl)return function(e){let{assetUrl:t,message:r}=e,o="#F2E7CE",i=r?n(r,12).slice(0,2):[],s=i.length?26+24*i.length:0,a=560-s-14,c=i.length?`<rect x="18" y="${a}" width="324" height="${s}" rx="6"
         fill="${o}" opacity="0.9"/>
       <rect x="18" y="${a}" width="324" height="${s}" rx="6"
         fill="none" stroke="#A72B21" stroke-width="1" opacity="0.45"/>`:"",d=i.map((e,t)=>`<text x="168" y="${a+30+24*t}" text-anchor="middle" font-size="17" fill="#2E2E2E" font-family="'Gowun Batang', 'AppleMyungjo', serif">${l(e)}</text>`).join("");return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 560" preserveAspectRatio="xMidYMid meet">
  <rect width="360" height="560" fill="${o}"/>
  <image href="${l(t??"")}" x="0" y="0" width="360" height="560" preserveAspectRatio="xMidYMid meet"/>
  ${c}
  ${d}
  
</svg>`}(e);let d=(c=e.background)?t.find(e=>e.id===c):void 0;return"traditional"===e.style?function(e,t){let{bgColor:o,animal:s,title:a,hanja:c,message:d,mantra:u}=t,f=e?.trad??{bg:"#F2E7CE",ink:"#A72B21",text:"#2E2E2E"},h=f.bg||o||"#F2E7CE",p=(!e||r.has(e.id))&&t.accent||f.ink,x=f.text,g=`<path d="M0 14V0h14M5 14V5h9" fill="none" stroke="${p}" stroke-width="1.4" opacity="0.55"/>`,y=`
    <g transform="translate(30,30)">${g}</g>
    <g transform="translate(${330},30) scale(-1,1)">${g}</g>
    <g transform="translate(30,${530}) scale(1,-1)">${g}</g>
    <g transform="translate(${330},${530}) scale(-1,-1)">${g}</g>
  `,k=`
    <g transform="translate(${180}, 70)" stroke="${p}" fill="none">
      <path d="M0 -22v7" stroke-width="2" stroke-linecap="round"/>
      <rect x="-10" y="-13" width="20" height="20" rx="2" transform="rotate(45 0 -3)" stroke-width="2"/>
      <rect x="-5" y="-8" width="10" height="10" rx="1" transform="rotate(45 0 -3)" stroke-width="1.2"/>
      <path d="M-13 -3c-5 0-5 7 0 7M13 -3c5 0 5 7 0 7" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M-4 11l-2 11M4 11l2 11M0 12v11" stroke-width="1.4" stroke-linecap="round"/>
    </g>
  `,m="";s&&i[s]&&(m=`<g transform="translate(${180}, 208)" color="${p}" opacity="0.9">${i[s]}</g>`);let w=n(d,7).slice(0,3),C=m?272:248,b="";w.forEach((e,t)=>{let r=180+((w.length-1)/2-t)*38;[...e.replace(/\s+/g,"")].forEach((e,t)=>{b+=`<text x="${r}" y="${C+28*t}" text-anchor="middle" font-size="20" fill="${x}" font-family="'Gowun Batang', 'AppleMyungjo', serif">${l(e)}</text>`})});let $=`<text x="0" y="-2" text-anchor="middle" font-size="11" font-weight="bold" fill="#F2E7CE" font-family="serif">수호</text>
       <text x="0" y="12" text-anchor="middle" font-size="11" font-weight="bold" fill="#F2E7CE" font-family="serif">부</text>`,v=t.noSeal?"":`
    <g transform="translate(${180}, ${506})">
      <rect x="-19" y="-19" width="38" height="38" rx="4" fill="#A72B21"/>
      <rect x="-14.5" y="-14.5" width="29" height="29" rx="3" fill="none" stroke="#F2E7CE" stroke-width="1.2" opacity="0.9"/>
      ${$}
    </g>
  `;return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${360} ${560}" preserveAspectRatio="xMidYMid meet">
  <defs>
    <filter id="paper-texture">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
      <feDiffuseLighting in="noise" lighting-color="${h}" surfaceScale="1.2" result="lit">
        <feDistantLight azimuth="45" elevation="58"/>
      </feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="lit" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>
    </filter>
  </defs>

  <!-- 한지 배경 -->
  <rect width="${360}" height="${560}" fill="${h}"/>
  <rect width="${360}" height="${560}" fill="${h}" opacity="0.25" filter="url(#paper-texture)"/>

  <!-- 주홍 이중 테두리 -->
  <rect x="14" y="14" width="${332}" height="${532}" fill="none" stroke="${p}" stroke-width="2.5"/>
  <rect x="21" y="21" width="${318}" height="${518}" fill="none" stroke="${p}" stroke-width="1" opacity="0.8"/>

  <!-- 모서리 뇌문 -->
  ${y}

  <!-- 상단 매듭 -->
  ${k}

  <!-- 두전 (제목) -->
  <text x="${180}" y="134" text-anchor="middle" font-size="24" font-weight="bold" fill="${p}" font-family="'Gowun Batang', 'AppleMyungjo', serif">${l(a)}</text>
  ${c?`<text x="${180}" y="156" text-anchor="middle" font-size="12" fill="${p}" opacity="0.75" font-family="serif">${l(c)}</text>`:""}
  <line x1="${128}" y1="${c?170:152}" x2="${232}" y2="${c?170:152}" stroke="${p}" stroke-width="1" opacity="0.4"/>

  <!-- 수호 동물 -->
  ${m}

  <!-- 기원 문구 -->
  ${b}

  <!-- 각획 (주문) -->
  <line x1="90" y1="${448}" x2="${270}" y2="${448}" stroke="${p}" stroke-width="1" opacity="0.35"/>
  ${u?`<text x="${180}" y="${468}" text-anchor="middle" font-size="12" fill="${p}" opacity="0.85" font-family="serif">${l(u)}</text>`:""}

  <!-- 낙관 -->
  ${v}
</svg>`}(d,e):function(e,t,r,c,d,u,f,h){var p,x,g;let y=Math.abs(c.split("").reduce((e,t)=>e+t.charCodeAt(0),0))%o.length,k=o[y],m=e?.modern.bg1||t||k.bg1,w=e?.modern.bg2||k.bg2,C=e?.modern.ink||k.ink,b=e?.modern.accent||k.accent,$="";$+=s(55,90,.7,b),$+=s(305,90,.7,b),h?.includes("별")&&($+=a(50,140,6,b),$+=a(310,140,6,b),$+=a(120,280,5,b),$+=a(240,280,5,b)),h?.includes("연꽃")&&($+=(p=180,x=400,`<g transform="translate(${p},${x}) scale(0.8)" opacity="0.7">
    <ellipse cx="0" cy="-5" rx="4" ry="10" fill="none" stroke="${b}" stroke-width="1.5"/>
    <ellipse cx="-7" cy="-3" rx="4" ry="9" fill="none" stroke="${b}" stroke-width="1.5" transform="rotate(-25,-7,-3)"/>
    <ellipse cx="7" cy="-3" rx="4" ry="9" fill="none" stroke="${b}" stroke-width="1.5" transform="rotate(25,7,-3)"/>
    <ellipse cx="-12" cy="0" rx="3" ry="7" fill="none" stroke="${b}" stroke-width="1.5" transform="rotate(-45,-12,0)"/>
    <ellipse cx="12" cy="0" rx="3" ry="7" fill="none" stroke="${b}" stroke-width="1.5" transform="rotate(45,12,0)"/>
  </g>`)),h?.includes("태극")&&($+=(g=180,`<g transform="translate(${g},140)">
    <circle cx="0" cy="0" r="14" fill="none" stroke="${C}" stroke-width="1.5"/>
    <path d="M0 -14 A14 14 0 0 1 0 14 A7 7 0 0 0 0 0 A7 7 0 0 1 0 -14" fill="${C}" opacity="0.3"/>
    <circle cx="0" cy="-7" r="2.8" fill="${C}"/>
    <circle cx="0" cy="7" r="2.8" fill="none" stroke="${C}" stroke-width="1"/>
  </g>`));let v="";r&&i[r]&&(v=`<g transform="translate(${180}, 210)" color="${C}">${i[r]}</g>`);let j=n(d,14),A="";for(let e=0;e<Math.min(j.length,4);e++)A+=`<text x="${180}" y="${300+28*e}" text-anchor="middle" font-size="16" fill="${C}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif">${l(j[e])}</text>`;return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${360} ${560}" preserveAspectRatio="xMidYMid meet">
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
  <text x="${180}" y="85" text-anchor="middle" font-size="24" font-weight="bold" fill="${C}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" filter="url(#soft-shadow)">${l(c)}</text>

  <!-- 구분 장식 -->
  <line x1="${140}" y1="98" x2="${220}" y2="98" stroke="${b}" stroke-width="2" opacity="0.5" stroke-linecap="round"/>

  <!-- 동물 심볼 -->
  ${v}

  <!-- 메시지 -->
  ${A}

  <!-- 하단 구분 -->
  <line x1="${120}" y1="${440}" x2="${240}" y2="${440}" stroke="${b}" stroke-width="1.5" opacity="0.4" stroke-linecap="round"/>

  <!-- 각획 (하단 주문) -->
  <text x="${180}" y="${470}" text-anchor="middle" font-size="13" fill="${C}" font-family="'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" opacity="0.8">${l(u)}</text>

  <!-- 하단 이모지 -->
  <text x="${180}" y="${520}" text-anchor="middle" font-size="20">🙏</text>

  <!-- 인장 -->
  
</svg>`}(d,e.bgColor,e.animal,e.title,e.message,e.mantra,e.userName,e.symbols)}])},33164,e=>{"use strict";var t=e.i(25405);let r=new Set(t.TALISMANS.map(e=>e.id)),o=new Map(t.TALISMANS.map(e=>[e.name,e.id]));function l(){try{let e=localStorage.getItem("bujeok-collection");return e?JSON.parse(e):[]}catch{return[]}}e.s(["GIFT_ID",0,"hosinbu-gift","collectedCatalogIds",0,function(){let e=new Set;for(let t of l()){let l=t.sourceId&&r.has(t.sourceId)?t.sourceId:r.has(t.id)?t.id:o.get(t.name);l&&e.add(l)}return e},"loadCollection",0,l])},3275,e=>{"use strict";var t=e.i(25405);let r=[{id:"aegun",paper:"hwangji",title:"액운 막기",subtitle:"나쁜 기운 차단",hanja:"厄除",color:"#A72B21",category:t.TalismanCategory.Protection,motif:"jangseung"},{id:"yeonae",paper:"hwangji",title:"인연의 기운",subtitle:"설레는 마음과 좋은 인연",hanja:"因緣",color:"#C25B78",category:t.TalismanCategory.Love,motif:"knot"},{id:"maeum",paper:"namsaekji",title:"마음 안정",subtitle:"불안과 걱정 내려놓기",hanja:"平安",color:"#6B7D63",category:t.TalismanCategory.Health,motif:"lotus"},{id:"jaebok",paper:"geumji",title:"재복 기원",subtitle:"재물과 복 불러오기",hanja:"財福",color:"#DAA017",category:t.TalismanCategory.Wealth,motif:"flame"},{id:"geongang",paper:"hwangji",title:"건강 기원",subtitle:"몸과 마음의 건강",hanja:"健康",color:"#1F3E63",category:t.TalismanCategory.Health,motif:"mountain"},{id:"sowon",paper:"hwangji",title:"소원 성취",subtitle:"바라는 일 이루기",hanja:"所願",color:"#DAA017",category:t.TalismanCategory.Other,motif:"flame"},{id:"gajeong",paper:"ssukji",title:"가정 수호",subtitle:"가족의 평안과 화합",hanja:"家宅平安",color:"#7A4A34",category:t.TalismanCategory.Family,motif:"knot"},{id:"hakeop",paper:"geumji",title:"학업·시험",subtitle:"집중력과 좋은 결과",hanja:"合格",color:"#2E2E2E",category:t.TalismanCategory.Study,motif:"cloud"}];e.s(["ENERGIES",0,r,"getEnergyByCategory",0,function(e){return r.find(t=>t.category===e)??r[0]},"getEnergyById",0,function(e){return r.find(t=>t.id===e)}])},20036,e=>{"use strict";var t=e.i(43476),r=e.i(71645),o=e.i(18566),l=e.i(46932),n=e.i(88653),i=e.i(93775),s=e.i(3275),a=e.i(54637),c=e.i(51940),d=e.i(50880);function u(e){return"savedAt"in e}function f({talisman:e,width:r}){if(u(e)&&e.anseo)return(0,t.jsx)("div",{style:{width:r,aspectRatio:"360 / 560"},className:"overflow-hidden rounded-lg",dangerouslySetInnerHTML:{__html:(0,d.buildAnseoSVG)(e)}});if(u(e)&&e.personal)return(0,t.jsx)(c.default,{talisman:e,width:r,className:"rounded-lg"});let o=u(e)?e.svg:void 0;return o?(0,t.jsx)("div",{style:{width:r,aspectRatio:"360 / 560"},className:"overflow-hidden rounded-lg",dangerouslySetInnerHTML:{__html:o}}):(0,t.jsx)(a.default,{id:e.id,category:e.category,size:"number"==typeof r?r:160})}var h=e.i(7917),p=e.i(61568),x=e.i(64275),g=e.i(21038),y=e.i(81196),k=e.i(59897),m=e.i(33164);let w=[{id:"all",label:"전체",category:null},...s.ENERGIES.filter((e,t,r)=>r.findIndex(t=>t.category===e.category)===t).map(e=>({id:e.id,label:e.title,category:e.category}))];e.s(["default",0,function(){let e=(0,o.useRouter)(),[s,a]=(0,r.useState)([]),[c,d]=(0,r.useState)(null),[u,C]=(0,r.useState)("all");(0,r.useEffect)(()=>{a((0,m.loadCollection)())},[]);let b=w.find(e=>e.id===u)?.category??null,$=b?s.filter(e=>e.category===b):s;return(0,t.jsxs)(p.default,{children:[(0,t.jsx)(x.default,{left:(0,t.jsx)("button",{onClick:()=>e.push("/"),"aria-label":"뒤로가기",children:(0,t.jsx)(k.BackIcon,{size:20})}),title:"내 부적함",right:(0,t.jsx)("button",{onClick:()=>alert("설정은 준비 중이에요"),"aria-label":"설정",children:(0,t.jsx)(k.GearIcon,{size:20})})}),(0,t.jsx)(y.default,{}),(0,t.jsxs)("div",{className:"mx-auto w-full max-w-md flex-1 px-5 pb-32",children:[(0,t.jsx)("p",{className:"mb-4 whitespace-pre-line text-center font-serif-kr text-xs leading-[1.9] text-[var(--color-galsaek)]",children:"당신이 품었던 마음들이\n한 장씩 이곳에 머물러 있습니다."}),(0,t.jsx)("div",{className:"energy-scroll mb-4",children:w.map(e=>{let r=u===e.id;return(0,t.jsx)("button",{onClick:()=>C(e.id),className:`rounded-md px-3 py-1.5 text-xs transition-colors ${r?"font-bold text-[var(--color-juhong)]":"text-[var(--color-galsaek)] opacity-80"}`,style:r?{border:"1.5px solid var(--color-juhong)"}:{border:"1px solid transparent"},children:e.label},e.id)})}),(0,t.jsx)(n.AnimatePresence,{mode:"wait",children:0===$.length?(0,t.jsxs)(l.motion.div,{initial:{opacity:0,y:16},animate:{opacity:1,y:0},exit:{opacity:0},className:"flex flex-col items-center justify-center pt-16 text-center",children:[(0,t.jsx)("p",{className:"font-serif-kr text-base font-bold text-[var(--color-meok)]",children:"all"===u?"아직 부적이 없어요":"이 종류의 부적이 아직 없어요"}),(0,t.jsx)("p",{className:"mt-1 text-xs text-[var(--color-galsaek)]",children:"마음을 담아 첫 부적을 지어 볼까요?"}),(0,t.jsx)("div",{className:"mt-6 w-full max-w-[220px]",children:(0,t.jsx)(g.default,{onClick:()=>e.push("/talisman"),children:"부적 지으러 가기"})})]},"empty"):(0,t.jsx)(l.motion.div,{className:"grid grid-cols-2 gap-3",initial:"hidden",animate:"visible",variants:{hidden:{},visible:{transition:{staggerChildren:.06}}},children:$.map(e=>{let r;return(0,t.jsxs)(l.motion.div,{variants:{hidden:{opacity:0,y:20,scale:.96},visible:{opacity:1,y:0,scale:1}},transition:{duration:.3,ease:"easeOut"},children:[(0,t.jsx)(l.motion.button,{whileTap:{scale:.96},onClick:()=>d(e),className:"block w-full overflow-hidden rounded-lg text-left",style:{boxShadow:"0 1px 2px rgba(122,74,52,0.15), 0 4px 12px rgba(122,74,52,0.12)"},children:(0,t.jsx)(f,{talisman:e,width:"100%"})}),(0,t.jsx)("p",{className:"mt-2 font-serif-kr text-[13px] font-bold text-[var(--color-meok)]",children:e.name}),e.personal?.wishText&&(0,t.jsxs)("p",{className:"mt-0.5 truncate font-serif-kr text-[11px] text-[var(--color-galsaek)]",children:["“",e.personal.wishText,"”"]}),(0,t.jsxs)("p",{className:"mt-0.5 text-[10px] text-[var(--color-galsaek)] opacity-70",children:[Number.isNaN((r=new Date(e.savedAt)).getTime())?"":`${r.getFullYear()}.${String(r.getMonth()+1).padStart(2,"0")}.${String(r.getDate()).padStart(2,"0")}`,e.personal?.serialNumber&&(0,t.jsx)("span",{className:"ml-1.5",children:e.personal.serialNumber})]})]},e.id)})},`grid-${u}`)})]}),c&&(0,t.jsx)(h.default,{talisman:c,onClose:()=>d(null),onDelete:()=>{if(!c)return;let e=s.filter(e=>e.id!==c.id);a(e),localStorage.setItem("bujeok-collection",JSON.stringify(e)),d(null)}}),(0,t.jsx)(i.default,{})]})}],20036)}]);