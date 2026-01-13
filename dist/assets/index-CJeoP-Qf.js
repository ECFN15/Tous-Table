(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(i){if(i.ep)return;i.ep=!0;const s=n(i);fetch(i.href,s)}})();function nT(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var T_={exports:{}},pu={},I_={exports:{}},ee={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Go=Symbol.for("react.element"),rT=Symbol.for("react.portal"),iT=Symbol.for("react.fragment"),sT=Symbol.for("react.strict_mode"),oT=Symbol.for("react.profiler"),aT=Symbol.for("react.provider"),lT=Symbol.for("react.context"),uT=Symbol.for("react.forward_ref"),cT=Symbol.for("react.suspense"),hT=Symbol.for("react.memo"),dT=Symbol.for("react.lazy"),Sm=Symbol.iterator;function fT(t){return t===null||typeof t!="object"?null:(t=Sm&&t[Sm]||t["@@iterator"],typeof t=="function"?t:null)}var x_={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},A_=Object.assign,S_={};function hs(t,e,n){this.props=t,this.context=e,this.refs=S_,this.updater=n||x_}hs.prototype.isReactComponent={};hs.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};hs.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function k_(){}k_.prototype=hs.prototype;function Id(t,e,n){this.props=t,this.context=e,this.refs=S_,this.updater=n||x_}var xd=Id.prototype=new k_;xd.constructor=Id;A_(xd,hs.prototype);xd.isPureReactComponent=!0;var km=Array.isArray,R_=Object.prototype.hasOwnProperty,Ad={current:null},C_={key:!0,ref:!0,__self:!0,__source:!0};function P_(t,e,n){var r,i={},s=null,o=null;if(e!=null)for(r in e.ref!==void 0&&(o=e.ref),e.key!==void 0&&(s=""+e.key),e)R_.call(e,r)&&!C_.hasOwnProperty(r)&&(i[r]=e[r]);var l=arguments.length-2;if(l===1)i.children=n;else if(1<l){for(var u=Array(l),h=0;h<l;h++)u[h]=arguments[h+2];i.children=u}if(t&&t.defaultProps)for(r in l=t.defaultProps,l)i[r]===void 0&&(i[r]=l[r]);return{$$typeof:Go,type:t,key:s,ref:o,props:i,_owner:Ad.current}}function pT(t,e){return{$$typeof:Go,type:t.type,key:e,ref:t.ref,props:t.props,_owner:t._owner}}function Sd(t){return typeof t=="object"&&t!==null&&t.$$typeof===Go}function mT(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var Rm=/\/+/g;function wc(t,e){return typeof t=="object"&&t!==null&&t.key!=null?mT(""+t.key):e.toString(36)}function el(t,e,n,r,i){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var o=!1;if(t===null)o=!0;else switch(s){case"string":case"number":o=!0;break;case"object":switch(t.$$typeof){case Go:case rT:o=!0}}if(o)return o=t,i=i(o),t=r===""?"."+wc(o,0):r,km(i)?(n="",t!=null&&(n=t.replace(Rm,"$&/")+"/"),el(i,e,n,"",function(h){return h})):i!=null&&(Sd(i)&&(i=pT(i,n+(!i.key||o&&o.key===i.key?"":(""+i.key).replace(Rm,"$&/")+"/")+t)),e.push(i)),1;if(o=0,r=r===""?".":r+":",km(t))for(var l=0;l<t.length;l++){s=t[l];var u=r+wc(s,l);o+=el(s,e,n,u,i)}else if(u=fT(t),typeof u=="function")for(t=u.call(t),l=0;!(s=t.next()).done;)s=s.value,u=r+wc(s,l++),o+=el(s,e,n,u,i);else if(s==="object")throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.");return o}function Ca(t,e,n){if(t==null)return t;var r=[],i=0;return el(t,r,"","",function(s){return e.call(n,s,i++)}),r}function gT(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var ft={current:null},tl={transition:null},yT={ReactCurrentDispatcher:ft,ReactCurrentBatchConfig:tl,ReactCurrentOwner:Ad};function N_(){throw Error("act(...) is not supported in production builds of React.")}ee.Children={map:Ca,forEach:function(t,e,n){Ca(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return Ca(t,function(){e++}),e},toArray:function(t){return Ca(t,function(e){return e})||[]},only:function(t){if(!Sd(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};ee.Component=hs;ee.Fragment=iT;ee.Profiler=oT;ee.PureComponent=Id;ee.StrictMode=sT;ee.Suspense=cT;ee.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=yT;ee.act=N_;ee.cloneElement=function(t,e,n){if(t==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+t+".");var r=A_({},t.props),i=t.key,s=t.ref,o=t._owner;if(e!=null){if(e.ref!==void 0&&(s=e.ref,o=Ad.current),e.key!==void 0&&(i=""+e.key),t.type&&t.type.defaultProps)var l=t.type.defaultProps;for(u in e)R_.call(e,u)&&!C_.hasOwnProperty(u)&&(r[u]=e[u]===void 0&&l!==void 0?l[u]:e[u])}var u=arguments.length-2;if(u===1)r.children=n;else if(1<u){l=Array(u);for(var h=0;h<u;h++)l[h]=arguments[h+2];r.children=l}return{$$typeof:Go,type:t.type,key:i,ref:s,props:r,_owner:o}};ee.createContext=function(t){return t={$$typeof:lT,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},t.Provider={$$typeof:aT,_context:t},t.Consumer=t};ee.createElement=P_;ee.createFactory=function(t){var e=P_.bind(null,t);return e.type=t,e};ee.createRef=function(){return{current:null}};ee.forwardRef=function(t){return{$$typeof:uT,render:t}};ee.isValidElement=Sd;ee.lazy=function(t){return{$$typeof:dT,_payload:{_status:-1,_result:t},_init:gT}};ee.memo=function(t,e){return{$$typeof:hT,type:t,compare:e===void 0?null:e}};ee.startTransition=function(t){var e=tl.transition;tl.transition={};try{t()}finally{tl.transition=e}};ee.unstable_act=N_;ee.useCallback=function(t,e){return ft.current.useCallback(t,e)};ee.useContext=function(t){return ft.current.useContext(t)};ee.useDebugValue=function(){};ee.useDeferredValue=function(t){return ft.current.useDeferredValue(t)};ee.useEffect=function(t,e){return ft.current.useEffect(t,e)};ee.useId=function(){return ft.current.useId()};ee.useImperativeHandle=function(t,e,n){return ft.current.useImperativeHandle(t,e,n)};ee.useInsertionEffect=function(t,e){return ft.current.useInsertionEffect(t,e)};ee.useLayoutEffect=function(t,e){return ft.current.useLayoutEffect(t,e)};ee.useMemo=function(t,e){return ft.current.useMemo(t,e)};ee.useReducer=function(t,e,n){return ft.current.useReducer(t,e,n)};ee.useRef=function(t){return ft.current.useRef(t)};ee.useState=function(t){return ft.current.useState(t)};ee.useSyncExternalStore=function(t,e,n){return ft.current.useSyncExternalStore(t,e,n)};ee.useTransition=function(){return ft.current.useTransition()};ee.version="18.3.1";I_.exports=ee;var Y=I_.exports;const _T=nT(Y);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var vT=Y,wT=Symbol.for("react.element"),ET=Symbol.for("react.fragment"),TT=Object.prototype.hasOwnProperty,IT=vT.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,xT={key:!0,ref:!0,__self:!0,__source:!0};function b_(t,e,n){var r,i={},s=null,o=null;n!==void 0&&(s=""+n),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(o=e.ref);for(r in e)TT.call(e,r)&&!xT.hasOwnProperty(r)&&(i[r]=e[r]);if(t&&t.defaultProps)for(r in e=t.defaultProps,e)i[r]===void 0&&(i[r]=e[r]);return{$$typeof:wT,type:t,key:s,ref:o,props:i,_owner:IT.current}}pu.Fragment=ET;pu.jsx=b_;pu.jsxs=b_;T_.exports=pu;var y=T_.exports,ih={},D_={exports:{}},Nt={},O_={exports:{}},V_={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(t){function e(B,X){var J=B.length;B.push(X);e:for(;0<J;){var ve=J-1>>>1,ue=B[ve];if(0<i(ue,X))B[ve]=X,B[J]=ue,J=ve;else break e}}function n(B){return B.length===0?null:B[0]}function r(B){if(B.length===0)return null;var X=B[0],J=B.pop();if(J!==X){B[0]=J;e:for(var ve=0,ue=B.length,Re=ue>>>1;ve<Re;){var pn=2*(ve+1)-1,mn=B[pn],gn=pn+1,yn=B[gn];if(0>i(mn,J))gn<ue&&0>i(yn,mn)?(B[ve]=yn,B[gn]=J,ve=gn):(B[ve]=mn,B[pn]=J,ve=pn);else if(gn<ue&&0>i(yn,J))B[ve]=yn,B[gn]=J,ve=gn;else break e}}return X}function i(B,X){var J=B.sortIndex-X.sortIndex;return J!==0?J:B.id-X.id}if(typeof performance=="object"&&typeof performance.now=="function"){var s=performance;t.unstable_now=function(){return s.now()}}else{var o=Date,l=o.now();t.unstable_now=function(){return o.now()-l}}var u=[],h=[],f=1,p=null,m=3,S=!1,R=!1,N=!1,O=typeof setTimeout=="function"?setTimeout:null,I=typeof clearTimeout=="function"?clearTimeout:null,w=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function E(B){for(var X=n(h);X!==null;){if(X.callback===null)r(h);else if(X.startTime<=B)r(h),X.sortIndex=X.expirationTime,e(u,X);else break;X=n(h)}}function b(B){if(N=!1,E(B),!R)if(n(u)!==null)R=!0,Es(M);else{var X=n(h);X!==null&&fn(b,X.startTime-B)}}function M(B,X){R=!1,N&&(N=!1,I(_),_=-1),S=!0;var J=m;try{for(E(X),p=n(u);p!==null&&(!(p.expirationTime>X)||B&&!k());){var ve=p.callback;if(typeof ve=="function"){p.callback=null,m=p.priorityLevel;var ue=ve(p.expirationTime<=X);X=t.unstable_now(),typeof ue=="function"?p.callback=ue:p===n(u)&&r(u),E(X)}else r(u);p=n(u)}if(p!==null)var Re=!0;else{var pn=n(h);pn!==null&&fn(b,pn.startTime-X),Re=!1}return Re}finally{p=null,m=J,S=!1}}var j=!1,v=null,_=-1,T=5,x=-1;function k(){return!(t.unstable_now()-x<T)}function C(){if(v!==null){var B=t.unstable_now();x=B;var X=!0;try{X=v(!0,B)}finally{X?A():(j=!1,v=null)}}else j=!1}var A;if(typeof w=="function")A=function(){w(C)};else if(typeof MessageChannel<"u"){var Dt=new MessageChannel,Fr=Dt.port2;Dt.port1.onmessage=C,A=function(){Fr.postMessage(null)}}else A=function(){O(C,0)};function Es(B){v=B,j||(j=!0,A())}function fn(B,X){_=O(function(){B(t.unstable_now())},X)}t.unstable_IdlePriority=5,t.unstable_ImmediatePriority=1,t.unstable_LowPriority=4,t.unstable_NormalPriority=3,t.unstable_Profiling=null,t.unstable_UserBlockingPriority=2,t.unstable_cancelCallback=function(B){B.callback=null},t.unstable_continueExecution=function(){R||S||(R=!0,Es(M))},t.unstable_forceFrameRate=function(B){0>B||125<B?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):T=0<B?Math.floor(1e3/B):5},t.unstable_getCurrentPriorityLevel=function(){return m},t.unstable_getFirstCallbackNode=function(){return n(u)},t.unstable_next=function(B){switch(m){case 1:case 2:case 3:var X=3;break;default:X=m}var J=m;m=X;try{return B()}finally{m=J}},t.unstable_pauseExecution=function(){},t.unstable_requestPaint=function(){},t.unstable_runWithPriority=function(B,X){switch(B){case 1:case 2:case 3:case 4:case 5:break;default:B=3}var J=m;m=B;try{return X()}finally{m=J}},t.unstable_scheduleCallback=function(B,X,J){var ve=t.unstable_now();switch(typeof J=="object"&&J!==null?(J=J.delay,J=typeof J=="number"&&0<J?ve+J:ve):J=ve,B){case 1:var ue=-1;break;case 2:ue=250;break;case 5:ue=1073741823;break;case 4:ue=1e4;break;default:ue=5e3}return ue=J+ue,B={id:f++,callback:X,priorityLevel:B,startTime:J,expirationTime:ue,sortIndex:-1},J>ve?(B.sortIndex=J,e(h,B),n(u)===null&&B===n(h)&&(N?(I(_),_=-1):N=!0,fn(b,J-ve))):(B.sortIndex=ue,e(u,B),R||S||(R=!0,Es(M))),B},t.unstable_shouldYield=k,t.unstable_wrapCallback=function(B){var X=m;return function(){var J=m;m=X;try{return B.apply(this,arguments)}finally{m=J}}}})(V_);O_.exports=V_;var AT=O_.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ST=Y,Pt=AT;function F(t){for(var e="https://reactjs.org/docs/error-decoder.html?invariant="+t,n=1;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var L_=new Set,vo={};function fi(t,e){Ji(t,e),Ji(t+"Capture",e)}function Ji(t,e){for(vo[t]=e,t=0;t<e.length;t++)L_.add(e[t])}var Dn=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),sh=Object.prototype.hasOwnProperty,kT=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,Cm={},Pm={};function RT(t){return sh.call(Pm,t)?!0:sh.call(Cm,t)?!1:kT.test(t)?Pm[t]=!0:(Cm[t]=!0,!1)}function CT(t,e,n,r){if(n!==null&&n.type===0)return!1;switch(typeof e){case"function":case"symbol":return!0;case"boolean":return r?!1:n!==null?!n.acceptsBooleans:(t=t.toLowerCase().slice(0,5),t!=="data-"&&t!=="aria-");default:return!1}}function PT(t,e,n,r){if(e===null||typeof e>"u"||CT(t,e,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!e;case 4:return e===!1;case 5:return isNaN(e);case 6:return isNaN(e)||1>e}return!1}function pt(t,e,n,r,i,s,o){this.acceptsBooleans=e===2||e===3||e===4,this.attributeName=r,this.attributeNamespace=i,this.mustUseProperty=n,this.propertyName=t,this.type=e,this.sanitizeURL=s,this.removeEmptyString=o}var Ke={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t){Ke[t]=new pt(t,0,!1,t,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(t){var e=t[0];Ke[e]=new pt(e,1,!1,t[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(t){Ke[t]=new pt(t,2,!1,t.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(t){Ke[t]=new pt(t,2,!1,t,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t){Ke[t]=new pt(t,3,!1,t.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(t){Ke[t]=new pt(t,3,!0,t,null,!1,!1)});["capture","download"].forEach(function(t){Ke[t]=new pt(t,4,!1,t,null,!1,!1)});["cols","rows","size","span"].forEach(function(t){Ke[t]=new pt(t,6,!1,t,null,!1,!1)});["rowSpan","start"].forEach(function(t){Ke[t]=new pt(t,5,!1,t.toLowerCase(),null,!1,!1)});var kd=/[\-:]([a-z])/g;function Rd(t){return t[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t){var e=t.replace(kd,Rd);Ke[e]=new pt(e,1,!1,t,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t){var e=t.replace(kd,Rd);Ke[e]=new pt(e,1,!1,t,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(t){var e=t.replace(kd,Rd);Ke[e]=new pt(e,1,!1,t,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(t){Ke[t]=new pt(t,1,!1,t.toLowerCase(),null,!1,!1)});Ke.xlinkHref=new pt("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(t){Ke[t]=new pt(t,1,!1,t.toLowerCase(),null,!0,!0)});function Cd(t,e,n,r){var i=Ke.hasOwnProperty(e)?Ke[e]:null;(i!==null?i.type!==0:r||!(2<e.length)||e[0]!=="o"&&e[0]!=="O"||e[1]!=="n"&&e[1]!=="N")&&(PT(e,n,i,r)&&(n=null),r||i===null?RT(e)&&(n===null?t.removeAttribute(e):t.setAttribute(e,""+n)):i.mustUseProperty?t[i.propertyName]=n===null?i.type===3?!1:"":n:(e=i.attributeName,r=i.attributeNamespace,n===null?t.removeAttribute(e):(i=i.type,n=i===3||i===4&&n===!0?"":""+n,r?t.setAttributeNS(r,e,n):t.setAttribute(e,n))))}var Bn=ST.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,Pa=Symbol.for("react.element"),ki=Symbol.for("react.portal"),Ri=Symbol.for("react.fragment"),Pd=Symbol.for("react.strict_mode"),oh=Symbol.for("react.profiler"),M_=Symbol.for("react.provider"),j_=Symbol.for("react.context"),Nd=Symbol.for("react.forward_ref"),ah=Symbol.for("react.suspense"),lh=Symbol.for("react.suspense_list"),bd=Symbol.for("react.memo"),Kn=Symbol.for("react.lazy"),F_=Symbol.for("react.offscreen"),Nm=Symbol.iterator;function Vs(t){return t===null||typeof t!="object"?null:(t=Nm&&t[Nm]||t["@@iterator"],typeof t=="function"?t:null)}var Te=Object.assign,Ec;function Hs(t){if(Ec===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);Ec=e&&e[1]||""}return`
`+Ec+t}var Tc=!1;function Ic(t,e){if(!t||Tc)return"";Tc=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(e)if(e=function(){throw Error()},Object.defineProperty(e.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(e,[])}catch(h){var r=h}Reflect.construct(t,[],e)}else{try{e.call()}catch(h){r=h}t.call(e.prototype)}else{try{throw Error()}catch(h){r=h}t()}}catch(h){if(h&&r&&typeof h.stack=="string"){for(var i=h.stack.split(`
`),s=r.stack.split(`
`),o=i.length-1,l=s.length-1;1<=o&&0<=l&&i[o]!==s[l];)l--;for(;1<=o&&0<=l;o--,l--)if(i[o]!==s[l]){if(o!==1||l!==1)do if(o--,l--,0>l||i[o]!==s[l]){var u=`
`+i[o].replace(" at new "," at ");return t.displayName&&u.includes("<anonymous>")&&(u=u.replace("<anonymous>",t.displayName)),u}while(1<=o&&0<=l);break}}}finally{Tc=!1,Error.prepareStackTrace=n}return(t=t?t.displayName||t.name:"")?Hs(t):""}function NT(t){switch(t.tag){case 5:return Hs(t.type);case 16:return Hs("Lazy");case 13:return Hs("Suspense");case 19:return Hs("SuspenseList");case 0:case 2:case 15:return t=Ic(t.type,!1),t;case 11:return t=Ic(t.type.render,!1),t;case 1:return t=Ic(t.type,!0),t;default:return""}}function uh(t){if(t==null)return null;if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case Ri:return"Fragment";case ki:return"Portal";case oh:return"Profiler";case Pd:return"StrictMode";case ah:return"Suspense";case lh:return"SuspenseList"}if(typeof t=="object")switch(t.$$typeof){case j_:return(t.displayName||"Context")+".Consumer";case M_:return(t._context.displayName||"Context")+".Provider";case Nd:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case bd:return e=t.displayName||null,e!==null?e:uh(t.type)||"Memo";case Kn:e=t._payload,t=t._init;try{return uh(t(e))}catch{}}return null}function bT(t){var e=t.type;switch(t.tag){case 24:return"Cache";case 9:return(e.displayName||"Context")+".Consumer";case 10:return(e._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return t=e.render,t=t.displayName||t.name||"",e.displayName||(t!==""?"ForwardRef("+t+")":"ForwardRef");case 7:return"Fragment";case 5:return e;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return uh(e);case 8:return e===Pd?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e}return null}function _r(t){switch(typeof t){case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function U_(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function DT(t){var e=U_(t)?"checked":"value",n=Object.getOwnPropertyDescriptor(t.constructor.prototype,e),r=""+t[e];if(!t.hasOwnProperty(e)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var i=n.get,s=n.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return i.call(this)},set:function(o){r=""+o,s.call(this,o)}}),Object.defineProperty(t,e,{enumerable:n.enumerable}),{getValue:function(){return r},setValue:function(o){r=""+o},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function Na(t){t._valueTracker||(t._valueTracker=DT(t))}function z_(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),r="";return t&&(r=U_(t)?t.checked?"true":"false":t.value),t=r,t!==n?(e.setValue(t),!0):!1}function Tl(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}function ch(t,e){var n=e.checked;return Te({},e,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??t._wrapperState.initialChecked})}function bm(t,e){var n=e.defaultValue==null?"":e.defaultValue,r=e.checked!=null?e.checked:e.defaultChecked;n=_r(e.value!=null?e.value:n),t._wrapperState={initialChecked:r,initialValue:n,controlled:e.type==="checkbox"||e.type==="radio"?e.checked!=null:e.value!=null}}function B_(t,e){e=e.checked,e!=null&&Cd(t,"checked",e,!1)}function hh(t,e){B_(t,e);var n=_r(e.value),r=e.type;if(n!=null)r==="number"?(n===0&&t.value===""||t.value!=n)&&(t.value=""+n):t.value!==""+n&&(t.value=""+n);else if(r==="submit"||r==="reset"){t.removeAttribute("value");return}e.hasOwnProperty("value")?dh(t,e.type,n):e.hasOwnProperty("defaultValue")&&dh(t,e.type,_r(e.defaultValue)),e.checked==null&&e.defaultChecked!=null&&(t.defaultChecked=!!e.defaultChecked)}function Dm(t,e,n){if(e.hasOwnProperty("value")||e.hasOwnProperty("defaultValue")){var r=e.type;if(!(r!=="submit"&&r!=="reset"||e.value!==void 0&&e.value!==null))return;e=""+t._wrapperState.initialValue,n||e===t.value||(t.value=e),t.defaultValue=e}n=t.name,n!==""&&(t.name=""),t.defaultChecked=!!t._wrapperState.initialChecked,n!==""&&(t.name=n)}function dh(t,e,n){(e!=="number"||Tl(t.ownerDocument)!==t)&&(n==null?t.defaultValue=""+t._wrapperState.initialValue:t.defaultValue!==""+n&&(t.defaultValue=""+n))}var qs=Array.isArray;function Ui(t,e,n,r){if(t=t.options,e){e={};for(var i=0;i<n.length;i++)e["$"+n[i]]=!0;for(n=0;n<t.length;n++)i=e.hasOwnProperty("$"+t[n].value),t[n].selected!==i&&(t[n].selected=i),i&&r&&(t[n].defaultSelected=!0)}else{for(n=""+_r(n),e=null,i=0;i<t.length;i++){if(t[i].value===n){t[i].selected=!0,r&&(t[i].defaultSelected=!0);return}e!==null||t[i].disabled||(e=t[i])}e!==null&&(e.selected=!0)}}function fh(t,e){if(e.dangerouslySetInnerHTML!=null)throw Error(F(91));return Te({},e,{value:void 0,defaultValue:void 0,children:""+t._wrapperState.initialValue})}function Om(t,e){var n=e.value;if(n==null){if(n=e.children,e=e.defaultValue,n!=null){if(e!=null)throw Error(F(92));if(qs(n)){if(1<n.length)throw Error(F(93));n=n[0]}e=n}e==null&&(e=""),n=e}t._wrapperState={initialValue:_r(n)}}function $_(t,e){var n=_r(e.value),r=_r(e.defaultValue);n!=null&&(n=""+n,n!==t.value&&(t.value=n),e.defaultValue==null&&t.defaultValue!==n&&(t.defaultValue=n)),r!=null&&(t.defaultValue=""+r)}function Vm(t){var e=t.textContent;e===t._wrapperState.initialValue&&e!==""&&e!==null&&(t.value=e)}function H_(t){switch(t){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function ph(t,e){return t==null||t==="http://www.w3.org/1999/xhtml"?H_(e):t==="http://www.w3.org/2000/svg"&&e==="foreignObject"?"http://www.w3.org/1999/xhtml":t}var ba,q_=function(t){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(e,n,r,i){MSApp.execUnsafeLocalFunction(function(){return t(e,n,r,i)})}:t}(function(t,e){if(t.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in t)t.innerHTML=e;else{for(ba=ba||document.createElement("div"),ba.innerHTML="<svg>"+e.valueOf().toString()+"</svg>",e=ba.firstChild;t.firstChild;)t.removeChild(t.firstChild);for(;e.firstChild;)t.appendChild(e.firstChild)}});function wo(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var to={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},OT=["Webkit","ms","Moz","O"];Object.keys(to).forEach(function(t){OT.forEach(function(e){e=e+t.charAt(0).toUpperCase()+t.substring(1),to[e]=to[t]})});function W_(t,e,n){return e==null||typeof e=="boolean"||e===""?"":n||typeof e!="number"||e===0||to.hasOwnProperty(t)&&to[t]?(""+e).trim():e+"px"}function G_(t,e){t=t.style;for(var n in e)if(e.hasOwnProperty(n)){var r=n.indexOf("--")===0,i=W_(n,e[n],r);n==="float"&&(n="cssFloat"),r?t.setProperty(n,i):t[n]=i}}var VT=Te({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function mh(t,e){if(e){if(VT[t]&&(e.children!=null||e.dangerouslySetInnerHTML!=null))throw Error(F(137,t));if(e.dangerouslySetInnerHTML!=null){if(e.children!=null)throw Error(F(60));if(typeof e.dangerouslySetInnerHTML!="object"||!("__html"in e.dangerouslySetInnerHTML))throw Error(F(61))}if(e.style!=null&&typeof e.style!="object")throw Error(F(62))}}function gh(t,e){if(t.indexOf("-")===-1)return typeof e.is=="string";switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var yh=null;function Dd(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var _h=null,zi=null,Bi=null;function Lm(t){if(t=Xo(t)){if(typeof _h!="function")throw Error(F(280));var e=t.stateNode;e&&(e=vu(e),_h(t.stateNode,t.type,e))}}function K_(t){zi?Bi?Bi.push(t):Bi=[t]:zi=t}function Q_(){if(zi){var t=zi,e=Bi;if(Bi=zi=null,Lm(t),e)for(t=0;t<e.length;t++)Lm(e[t])}}function X_(t,e){return t(e)}function Y_(){}var xc=!1;function J_(t,e,n){if(xc)return t(e,n);xc=!0;try{return X_(t,e,n)}finally{xc=!1,(zi!==null||Bi!==null)&&(Y_(),Q_())}}function Eo(t,e){var n=t.stateNode;if(n===null)return null;var r=vu(n);if(r===null)return null;n=r[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(t=t.type,r=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!r;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(F(231,e,typeof n));return n}var vh=!1;if(Dn)try{var Ls={};Object.defineProperty(Ls,"passive",{get:function(){vh=!0}}),window.addEventListener("test",Ls,Ls),window.removeEventListener("test",Ls,Ls)}catch{vh=!1}function LT(t,e,n,r,i,s,o,l,u){var h=Array.prototype.slice.call(arguments,3);try{e.apply(n,h)}catch(f){this.onError(f)}}var no=!1,Il=null,xl=!1,wh=null,MT={onError:function(t){no=!0,Il=t}};function jT(t,e,n,r,i,s,o,l,u){no=!1,Il=null,LT.apply(MT,arguments)}function FT(t,e,n,r,i,s,o,l,u){if(jT.apply(this,arguments),no){if(no){var h=Il;no=!1,Il=null}else throw Error(F(198));xl||(xl=!0,wh=h)}}function pi(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function Z_(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function Mm(t){if(pi(t)!==t)throw Error(F(188))}function UT(t){var e=t.alternate;if(!e){if(e=pi(t),e===null)throw Error(F(188));return e!==t?null:t}for(var n=t,r=e;;){var i=n.return;if(i===null)break;var s=i.alternate;if(s===null){if(r=i.return,r!==null){n=r;continue}break}if(i.child===s.child){for(s=i.child;s;){if(s===n)return Mm(i),t;if(s===r)return Mm(i),e;s=s.sibling}throw Error(F(188))}if(n.return!==r.return)n=i,r=s;else{for(var o=!1,l=i.child;l;){if(l===n){o=!0,n=i,r=s;break}if(l===r){o=!0,r=i,n=s;break}l=l.sibling}if(!o){for(l=s.child;l;){if(l===n){o=!0,n=s,r=i;break}if(l===r){o=!0,r=s,n=i;break}l=l.sibling}if(!o)throw Error(F(189))}}if(n.alternate!==r)throw Error(F(190))}if(n.tag!==3)throw Error(F(188));return n.stateNode.current===n?t:e}function ev(t){return t=UT(t),t!==null?tv(t):null}function tv(t){if(t.tag===5||t.tag===6)return t;for(t=t.child;t!==null;){var e=tv(t);if(e!==null)return e;t=t.sibling}return null}var nv=Pt.unstable_scheduleCallback,jm=Pt.unstable_cancelCallback,zT=Pt.unstable_shouldYield,BT=Pt.unstable_requestPaint,Pe=Pt.unstable_now,$T=Pt.unstable_getCurrentPriorityLevel,Od=Pt.unstable_ImmediatePriority,rv=Pt.unstable_UserBlockingPriority,Al=Pt.unstable_NormalPriority,HT=Pt.unstable_LowPriority,iv=Pt.unstable_IdlePriority,mu=null,rn=null;function qT(t){if(rn&&typeof rn.onCommitFiberRoot=="function")try{rn.onCommitFiberRoot(mu,t,void 0,(t.current.flags&128)===128)}catch{}}var Gt=Math.clz32?Math.clz32:KT,WT=Math.log,GT=Math.LN2;function KT(t){return t>>>=0,t===0?32:31-(WT(t)/GT|0)|0}var Da=64,Oa=4194304;function Ws(t){switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return t&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return t}}function Sl(t,e){var n=t.pendingLanes;if(n===0)return 0;var r=0,i=t.suspendedLanes,s=t.pingedLanes,o=n&268435455;if(o!==0){var l=o&~i;l!==0?r=Ws(l):(s&=o,s!==0&&(r=Ws(s)))}else o=n&~i,o!==0?r=Ws(o):s!==0&&(r=Ws(s));if(r===0)return 0;if(e!==0&&e!==r&&!(e&i)&&(i=r&-r,s=e&-e,i>=s||i===16&&(s&4194240)!==0))return e;if(r&4&&(r|=n&16),e=t.entangledLanes,e!==0)for(t=t.entanglements,e&=r;0<e;)n=31-Gt(e),i=1<<n,r|=t[n],e&=~i;return r}function QT(t,e){switch(t){case 1:case 2:case 4:return e+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function XT(t,e){for(var n=t.suspendedLanes,r=t.pingedLanes,i=t.expirationTimes,s=t.pendingLanes;0<s;){var o=31-Gt(s),l=1<<o,u=i[o];u===-1?(!(l&n)||l&r)&&(i[o]=QT(l,e)):u<=e&&(t.expiredLanes|=l),s&=~l}}function Eh(t){return t=t.pendingLanes&-1073741825,t!==0?t:t&1073741824?1073741824:0}function sv(){var t=Da;return Da<<=1,!(Da&4194240)&&(Da=64),t}function Ac(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function Ko(t,e,n){t.pendingLanes|=e,e!==536870912&&(t.suspendedLanes=0,t.pingedLanes=0),t=t.eventTimes,e=31-Gt(e),t[e]=n}function YT(t,e){var n=t.pendingLanes&~e;t.pendingLanes=e,t.suspendedLanes=0,t.pingedLanes=0,t.expiredLanes&=e,t.mutableReadLanes&=e,t.entangledLanes&=e,e=t.entanglements;var r=t.eventTimes;for(t=t.expirationTimes;0<n;){var i=31-Gt(n),s=1<<i;e[i]=0,r[i]=-1,t[i]=-1,n&=~s}}function Vd(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var r=31-Gt(n),i=1<<r;i&e|t[r]&e&&(t[r]|=e),n&=~i}}var ae=0;function ov(t){return t&=-t,1<t?4<t?t&268435455?16:536870912:4:1}var av,Ld,lv,uv,cv,Th=!1,Va=[],ir=null,sr=null,or=null,To=new Map,Io=new Map,Xn=[],JT="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Fm(t,e){switch(t){case"focusin":case"focusout":ir=null;break;case"dragenter":case"dragleave":sr=null;break;case"mouseover":case"mouseout":or=null;break;case"pointerover":case"pointerout":To.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":Io.delete(e.pointerId)}}function Ms(t,e,n,r,i,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:n,eventSystemFlags:r,nativeEvent:s,targetContainers:[i]},e!==null&&(e=Xo(e),e!==null&&Ld(e)),t):(t.eventSystemFlags|=r,e=t.targetContainers,i!==null&&e.indexOf(i)===-1&&e.push(i),t)}function ZT(t,e,n,r,i){switch(e){case"focusin":return ir=Ms(ir,t,e,n,r,i),!0;case"dragenter":return sr=Ms(sr,t,e,n,r,i),!0;case"mouseover":return or=Ms(or,t,e,n,r,i),!0;case"pointerover":var s=i.pointerId;return To.set(s,Ms(To.get(s)||null,t,e,n,r,i)),!0;case"gotpointercapture":return s=i.pointerId,Io.set(s,Ms(Io.get(s)||null,t,e,n,r,i)),!0}return!1}function hv(t){var e=Gr(t.target);if(e!==null){var n=pi(e);if(n!==null){if(e=n.tag,e===13){if(e=Z_(n),e!==null){t.blockedOn=e,cv(t.priority,function(){lv(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function nl(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=Ih(t.domEventName,t.eventSystemFlags,e[0],t.nativeEvent);if(n===null){n=t.nativeEvent;var r=new n.constructor(n.type,n);yh=r,n.target.dispatchEvent(r),yh=null}else return e=Xo(n),e!==null&&Ld(e),t.blockedOn=n,!1;e.shift()}return!0}function Um(t,e,n){nl(t)&&n.delete(e)}function eI(){Th=!1,ir!==null&&nl(ir)&&(ir=null),sr!==null&&nl(sr)&&(sr=null),or!==null&&nl(or)&&(or=null),To.forEach(Um),Io.forEach(Um)}function js(t,e){t.blockedOn===e&&(t.blockedOn=null,Th||(Th=!0,Pt.unstable_scheduleCallback(Pt.unstable_NormalPriority,eI)))}function xo(t){function e(i){return js(i,t)}if(0<Va.length){js(Va[0],t);for(var n=1;n<Va.length;n++){var r=Va[n];r.blockedOn===t&&(r.blockedOn=null)}}for(ir!==null&&js(ir,t),sr!==null&&js(sr,t),or!==null&&js(or,t),To.forEach(e),Io.forEach(e),n=0;n<Xn.length;n++)r=Xn[n],r.blockedOn===t&&(r.blockedOn=null);for(;0<Xn.length&&(n=Xn[0],n.blockedOn===null);)hv(n),n.blockedOn===null&&Xn.shift()}var $i=Bn.ReactCurrentBatchConfig,kl=!0;function tI(t,e,n,r){var i=ae,s=$i.transition;$i.transition=null;try{ae=1,Md(t,e,n,r)}finally{ae=i,$i.transition=s}}function nI(t,e,n,r){var i=ae,s=$i.transition;$i.transition=null;try{ae=4,Md(t,e,n,r)}finally{ae=i,$i.transition=s}}function Md(t,e,n,r){if(kl){var i=Ih(t,e,n,r);if(i===null)Vc(t,e,r,Rl,n),Fm(t,r);else if(ZT(i,t,e,n,r))r.stopPropagation();else if(Fm(t,r),e&4&&-1<JT.indexOf(t)){for(;i!==null;){var s=Xo(i);if(s!==null&&av(s),s=Ih(t,e,n,r),s===null&&Vc(t,e,r,Rl,n),s===i)break;i=s}i!==null&&r.stopPropagation()}else Vc(t,e,r,null,n)}}var Rl=null;function Ih(t,e,n,r){if(Rl=null,t=Dd(r),t=Gr(t),t!==null)if(e=pi(t),e===null)t=null;else if(n=e.tag,n===13){if(t=Z_(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null);return Rl=t,null}function dv(t){switch(t){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch($T()){case Od:return 1;case rv:return 4;case Al:case HT:return 16;case iv:return 536870912;default:return 16}default:return 16}}var er=null,jd=null,rl=null;function fv(){if(rl)return rl;var t,e=jd,n=e.length,r,i="value"in er?er.value:er.textContent,s=i.length;for(t=0;t<n&&e[t]===i[t];t++);var o=n-t;for(r=1;r<=o&&e[n-r]===i[s-r];r++);return rl=i.slice(t,1<r?1-r:void 0)}function il(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function La(){return!0}function zm(){return!1}function bt(t){function e(n,r,i,s,o){this._reactName=n,this._targetInst=i,this.type=r,this.nativeEvent=s,this.target=o,this.currentTarget=null;for(var l in t)t.hasOwnProperty(l)&&(n=t[l],this[l]=n?n(s):s[l]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?La:zm,this.isPropagationStopped=zm,this}return Te(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=La)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=La)},persist:function(){},isPersistent:La}),e}var ds={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Fd=bt(ds),Qo=Te({},ds,{view:0,detail:0}),rI=bt(Qo),Sc,kc,Fs,gu=Te({},Qo,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Ud,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==Fs&&(Fs&&t.type==="mousemove"?(Sc=t.screenX-Fs.screenX,kc=t.screenY-Fs.screenY):kc=Sc=0,Fs=t),Sc)},movementY:function(t){return"movementY"in t?t.movementY:kc}}),Bm=bt(gu),iI=Te({},gu,{dataTransfer:0}),sI=bt(iI),oI=Te({},Qo,{relatedTarget:0}),Rc=bt(oI),aI=Te({},ds,{animationName:0,elapsedTime:0,pseudoElement:0}),lI=bt(aI),uI=Te({},ds,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),cI=bt(uI),hI=Te({},ds,{data:0}),$m=bt(hI),dI={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},fI={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},pI={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function mI(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=pI[t])?!!e[t]:!1}function Ud(){return mI}var gI=Te({},Qo,{key:function(t){if(t.key){var e=dI[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=il(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?fI[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Ud,charCode:function(t){return t.type==="keypress"?il(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?il(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),yI=bt(gI),_I=Te({},gu,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Hm=bt(_I),vI=Te({},Qo,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Ud}),wI=bt(vI),EI=Te({},ds,{propertyName:0,elapsedTime:0,pseudoElement:0}),TI=bt(EI),II=Te({},gu,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),xI=bt(II),AI=[9,13,27,32],zd=Dn&&"CompositionEvent"in window,ro=null;Dn&&"documentMode"in document&&(ro=document.documentMode);var SI=Dn&&"TextEvent"in window&&!ro,pv=Dn&&(!zd||ro&&8<ro&&11>=ro),qm=" ",Wm=!1;function mv(t,e){switch(t){case"keyup":return AI.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function gv(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var Ci=!1;function kI(t,e){switch(t){case"compositionend":return gv(e);case"keypress":return e.which!==32?null:(Wm=!0,qm);case"textInput":return t=e.data,t===qm&&Wm?null:t;default:return null}}function RI(t,e){if(Ci)return t==="compositionend"||!zd&&mv(t,e)?(t=fv(),rl=jd=er=null,Ci=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return pv&&e.locale!=="ko"?null:e.data;default:return null}}var CI={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Gm(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!CI[t.type]:e==="textarea"}function yv(t,e,n,r){K_(r),e=Cl(e,"onChange"),0<e.length&&(n=new Fd("onChange","change",null,n,r),t.push({event:n,listeners:e}))}var io=null,Ao=null;function PI(t){Rv(t,0)}function yu(t){var e=bi(t);if(z_(e))return t}function NI(t,e){if(t==="change")return e}var _v=!1;if(Dn){var Cc;if(Dn){var Pc="oninput"in document;if(!Pc){var Km=document.createElement("div");Km.setAttribute("oninput","return;"),Pc=typeof Km.oninput=="function"}Cc=Pc}else Cc=!1;_v=Cc&&(!document.documentMode||9<document.documentMode)}function Qm(){io&&(io.detachEvent("onpropertychange",vv),Ao=io=null)}function vv(t){if(t.propertyName==="value"&&yu(Ao)){var e=[];yv(e,Ao,t,Dd(t)),J_(PI,e)}}function bI(t,e,n){t==="focusin"?(Qm(),io=e,Ao=n,io.attachEvent("onpropertychange",vv)):t==="focusout"&&Qm()}function DI(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return yu(Ao)}function OI(t,e){if(t==="click")return yu(e)}function VI(t,e){if(t==="input"||t==="change")return yu(e)}function LI(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var Xt=typeof Object.is=="function"?Object.is:LI;function So(t,e){if(Xt(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),r=Object.keys(e);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var i=n[r];if(!sh.call(e,i)||!Xt(t[i],e[i]))return!1}return!0}function Xm(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function Ym(t,e){var n=Xm(t);t=0;for(var r;n;){if(n.nodeType===3){if(r=t+n.textContent.length,t<=e&&r>=e)return{node:n,offset:e-t};t=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=Xm(n)}}function wv(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?wv(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function Ev(){for(var t=window,e=Tl();e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=Tl(t.document)}return e}function Bd(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}function MI(t){var e=Ev(),n=t.focusedElem,r=t.selectionRange;if(e!==n&&n&&n.ownerDocument&&wv(n.ownerDocument.documentElement,n)){if(r!==null&&Bd(n)){if(e=r.start,t=r.end,t===void 0&&(t=e),"selectionStart"in n)n.selectionStart=e,n.selectionEnd=Math.min(t,n.value.length);else if(t=(e=n.ownerDocument||document)&&e.defaultView||window,t.getSelection){t=t.getSelection();var i=n.textContent.length,s=Math.min(r.start,i);r=r.end===void 0?s:Math.min(r.end,i),!t.extend&&s>r&&(i=r,r=s,s=i),i=Ym(n,s);var o=Ym(n,r);i&&o&&(t.rangeCount!==1||t.anchorNode!==i.node||t.anchorOffset!==i.offset||t.focusNode!==o.node||t.focusOffset!==o.offset)&&(e=e.createRange(),e.setStart(i.node,i.offset),t.removeAllRanges(),s>r?(t.addRange(e),t.extend(o.node,o.offset)):(e.setEnd(o.node,o.offset),t.addRange(e)))}}for(e=[],t=n;t=t.parentNode;)t.nodeType===1&&e.push({element:t,left:t.scrollLeft,top:t.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<e.length;n++)t=e[n],t.element.scrollLeft=t.left,t.element.scrollTop=t.top}}var jI=Dn&&"documentMode"in document&&11>=document.documentMode,Pi=null,xh=null,so=null,Ah=!1;function Jm(t,e,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Ah||Pi==null||Pi!==Tl(r)||(r=Pi,"selectionStart"in r&&Bd(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),so&&So(so,r)||(so=r,r=Cl(xh,"onSelect"),0<r.length&&(e=new Fd("onSelect","select",null,e,n),t.push({event:e,listeners:r}),e.target=Pi)))}function Ma(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var Ni={animationend:Ma("Animation","AnimationEnd"),animationiteration:Ma("Animation","AnimationIteration"),animationstart:Ma("Animation","AnimationStart"),transitionend:Ma("Transition","TransitionEnd")},Nc={},Tv={};Dn&&(Tv=document.createElement("div").style,"AnimationEvent"in window||(delete Ni.animationend.animation,delete Ni.animationiteration.animation,delete Ni.animationstart.animation),"TransitionEvent"in window||delete Ni.transitionend.transition);function _u(t){if(Nc[t])return Nc[t];if(!Ni[t])return t;var e=Ni[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in Tv)return Nc[t]=e[n];return t}var Iv=_u("animationend"),xv=_u("animationiteration"),Av=_u("animationstart"),Sv=_u("transitionend"),kv=new Map,Zm="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Cr(t,e){kv.set(t,e),fi(e,[t])}for(var bc=0;bc<Zm.length;bc++){var Dc=Zm[bc],FI=Dc.toLowerCase(),UI=Dc[0].toUpperCase()+Dc.slice(1);Cr(FI,"on"+UI)}Cr(Iv,"onAnimationEnd");Cr(xv,"onAnimationIteration");Cr(Av,"onAnimationStart");Cr("dblclick","onDoubleClick");Cr("focusin","onFocus");Cr("focusout","onBlur");Cr(Sv,"onTransitionEnd");Ji("onMouseEnter",["mouseout","mouseover"]);Ji("onMouseLeave",["mouseout","mouseover"]);Ji("onPointerEnter",["pointerout","pointerover"]);Ji("onPointerLeave",["pointerout","pointerover"]);fi("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));fi("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));fi("onBeforeInput",["compositionend","keypress","textInput","paste"]);fi("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));fi("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));fi("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Gs="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),zI=new Set("cancel close invalid load scroll toggle".split(" ").concat(Gs));function eg(t,e,n){var r=t.type||"unknown-event";t.currentTarget=n,FT(r,e,void 0,t),t.currentTarget=null}function Rv(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var r=t[n],i=r.event;r=r.listeners;e:{var s=void 0;if(e)for(var o=r.length-1;0<=o;o--){var l=r[o],u=l.instance,h=l.currentTarget;if(l=l.listener,u!==s&&i.isPropagationStopped())break e;eg(i,l,h),s=u}else for(o=0;o<r.length;o++){if(l=r[o],u=l.instance,h=l.currentTarget,l=l.listener,u!==s&&i.isPropagationStopped())break e;eg(i,l,h),s=u}}}if(xl)throw t=wh,xl=!1,wh=null,t}function pe(t,e){var n=e[Ph];n===void 0&&(n=e[Ph]=new Set);var r=t+"__bubble";n.has(r)||(Cv(e,t,2,!1),n.add(r))}function Oc(t,e,n){var r=0;e&&(r|=4),Cv(n,t,r,e)}var ja="_reactListening"+Math.random().toString(36).slice(2);function ko(t){if(!t[ja]){t[ja]=!0,L_.forEach(function(n){n!=="selectionchange"&&(zI.has(n)||Oc(n,!1,t),Oc(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[ja]||(e[ja]=!0,Oc("selectionchange",!1,e))}}function Cv(t,e,n,r){switch(dv(e)){case 1:var i=tI;break;case 4:i=nI;break;default:i=Md}n=i.bind(null,e,n,t),i=void 0,!vh||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(i=!0),r?i!==void 0?t.addEventListener(e,n,{capture:!0,passive:i}):t.addEventListener(e,n,!0):i!==void 0?t.addEventListener(e,n,{passive:i}):t.addEventListener(e,n,!1)}function Vc(t,e,n,r,i){var s=r;if(!(e&1)&&!(e&2)&&r!==null)e:for(;;){if(r===null)return;var o=r.tag;if(o===3||o===4){var l=r.stateNode.containerInfo;if(l===i||l.nodeType===8&&l.parentNode===i)break;if(o===4)for(o=r.return;o!==null;){var u=o.tag;if((u===3||u===4)&&(u=o.stateNode.containerInfo,u===i||u.nodeType===8&&u.parentNode===i))return;o=o.return}for(;l!==null;){if(o=Gr(l),o===null)return;if(u=o.tag,u===5||u===6){r=s=o;continue e}l=l.parentNode}}r=r.return}J_(function(){var h=s,f=Dd(n),p=[];e:{var m=kv.get(t);if(m!==void 0){var S=Fd,R=t;switch(t){case"keypress":if(il(n)===0)break e;case"keydown":case"keyup":S=yI;break;case"focusin":R="focus",S=Rc;break;case"focusout":R="blur",S=Rc;break;case"beforeblur":case"afterblur":S=Rc;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":S=Bm;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":S=sI;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":S=wI;break;case Iv:case xv:case Av:S=lI;break;case Sv:S=TI;break;case"scroll":S=rI;break;case"wheel":S=xI;break;case"copy":case"cut":case"paste":S=cI;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":S=Hm}var N=(e&4)!==0,O=!N&&t==="scroll",I=N?m!==null?m+"Capture":null:m;N=[];for(var w=h,E;w!==null;){E=w;var b=E.stateNode;if(E.tag===5&&b!==null&&(E=b,I!==null&&(b=Eo(w,I),b!=null&&N.push(Ro(w,b,E)))),O)break;w=w.return}0<N.length&&(m=new S(m,R,null,n,f),p.push({event:m,listeners:N}))}}if(!(e&7)){e:{if(m=t==="mouseover"||t==="pointerover",S=t==="mouseout"||t==="pointerout",m&&n!==yh&&(R=n.relatedTarget||n.fromElement)&&(Gr(R)||R[On]))break e;if((S||m)&&(m=f.window===f?f:(m=f.ownerDocument)?m.defaultView||m.parentWindow:window,S?(R=n.relatedTarget||n.toElement,S=h,R=R?Gr(R):null,R!==null&&(O=pi(R),R!==O||R.tag!==5&&R.tag!==6)&&(R=null)):(S=null,R=h),S!==R)){if(N=Bm,b="onMouseLeave",I="onMouseEnter",w="mouse",(t==="pointerout"||t==="pointerover")&&(N=Hm,b="onPointerLeave",I="onPointerEnter",w="pointer"),O=S==null?m:bi(S),E=R==null?m:bi(R),m=new N(b,w+"leave",S,n,f),m.target=O,m.relatedTarget=E,b=null,Gr(f)===h&&(N=new N(I,w+"enter",R,n,f),N.target=E,N.relatedTarget=O,b=N),O=b,S&&R)t:{for(N=S,I=R,w=0,E=N;E;E=Ti(E))w++;for(E=0,b=I;b;b=Ti(b))E++;for(;0<w-E;)N=Ti(N),w--;for(;0<E-w;)I=Ti(I),E--;for(;w--;){if(N===I||I!==null&&N===I.alternate)break t;N=Ti(N),I=Ti(I)}N=null}else N=null;S!==null&&tg(p,m,S,N,!1),R!==null&&O!==null&&tg(p,O,R,N,!0)}}e:{if(m=h?bi(h):window,S=m.nodeName&&m.nodeName.toLowerCase(),S==="select"||S==="input"&&m.type==="file")var M=NI;else if(Gm(m))if(_v)M=VI;else{M=DI;var j=bI}else(S=m.nodeName)&&S.toLowerCase()==="input"&&(m.type==="checkbox"||m.type==="radio")&&(M=OI);if(M&&(M=M(t,h))){yv(p,M,n,f);break e}j&&j(t,m,h),t==="focusout"&&(j=m._wrapperState)&&j.controlled&&m.type==="number"&&dh(m,"number",m.value)}switch(j=h?bi(h):window,t){case"focusin":(Gm(j)||j.contentEditable==="true")&&(Pi=j,xh=h,so=null);break;case"focusout":so=xh=Pi=null;break;case"mousedown":Ah=!0;break;case"contextmenu":case"mouseup":case"dragend":Ah=!1,Jm(p,n,f);break;case"selectionchange":if(jI)break;case"keydown":case"keyup":Jm(p,n,f)}var v;if(zd)e:{switch(t){case"compositionstart":var _="onCompositionStart";break e;case"compositionend":_="onCompositionEnd";break e;case"compositionupdate":_="onCompositionUpdate";break e}_=void 0}else Ci?mv(t,n)&&(_="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(_="onCompositionStart");_&&(pv&&n.locale!=="ko"&&(Ci||_!=="onCompositionStart"?_==="onCompositionEnd"&&Ci&&(v=fv()):(er=f,jd="value"in er?er.value:er.textContent,Ci=!0)),j=Cl(h,_),0<j.length&&(_=new $m(_,t,null,n,f),p.push({event:_,listeners:j}),v?_.data=v:(v=gv(n),v!==null&&(_.data=v)))),(v=SI?kI(t,n):RI(t,n))&&(h=Cl(h,"onBeforeInput"),0<h.length&&(f=new $m("onBeforeInput","beforeinput",null,n,f),p.push({event:f,listeners:h}),f.data=v))}Rv(p,e)})}function Ro(t,e,n){return{instance:t,listener:e,currentTarget:n}}function Cl(t,e){for(var n=e+"Capture",r=[];t!==null;){var i=t,s=i.stateNode;i.tag===5&&s!==null&&(i=s,s=Eo(t,n),s!=null&&r.unshift(Ro(t,s,i)),s=Eo(t,e),s!=null&&r.push(Ro(t,s,i))),t=t.return}return r}function Ti(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5);return t||null}function tg(t,e,n,r,i){for(var s=e._reactName,o=[];n!==null&&n!==r;){var l=n,u=l.alternate,h=l.stateNode;if(u!==null&&u===r)break;l.tag===5&&h!==null&&(l=h,i?(u=Eo(n,s),u!=null&&o.unshift(Ro(n,u,l))):i||(u=Eo(n,s),u!=null&&o.push(Ro(n,u,l)))),n=n.return}o.length!==0&&t.push({event:e,listeners:o})}var BI=/\r\n?/g,$I=/\u0000|\uFFFD/g;function ng(t){return(typeof t=="string"?t:""+t).replace(BI,`
`).replace($I,"")}function Fa(t,e,n){if(e=ng(e),ng(t)!==e&&n)throw Error(F(425))}function Pl(){}var Sh=null,kh=null;function Rh(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var Ch=typeof setTimeout=="function"?setTimeout:void 0,HI=typeof clearTimeout=="function"?clearTimeout:void 0,rg=typeof Promise=="function"?Promise:void 0,qI=typeof queueMicrotask=="function"?queueMicrotask:typeof rg<"u"?function(t){return rg.resolve(null).then(t).catch(WI)}:Ch;function WI(t){setTimeout(function(){throw t})}function Lc(t,e){var n=e,r=0;do{var i=n.nextSibling;if(t.removeChild(n),i&&i.nodeType===8)if(n=i.data,n==="/$"){if(r===0){t.removeChild(i),xo(e);return}r--}else n!=="$"&&n!=="$?"&&n!=="$!"||r++;n=i}while(n);xo(e)}function ar(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?")break;if(e==="/$")return null}}return t}function ig(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"){if(e===0)return t;e--}else n==="/$"&&e++}t=t.previousSibling}return null}var fs=Math.random().toString(36).slice(2),tn="__reactFiber$"+fs,Co="__reactProps$"+fs,On="__reactContainer$"+fs,Ph="__reactEvents$"+fs,GI="__reactListeners$"+fs,KI="__reactHandles$"+fs;function Gr(t){var e=t[tn];if(e)return e;for(var n=t.parentNode;n;){if(e=n[On]||n[tn]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=ig(t);t!==null;){if(n=t[tn])return n;t=ig(t)}return e}t=n,n=t.parentNode}return null}function Xo(t){return t=t[tn]||t[On],!t||t.tag!==5&&t.tag!==6&&t.tag!==13&&t.tag!==3?null:t}function bi(t){if(t.tag===5||t.tag===6)return t.stateNode;throw Error(F(33))}function vu(t){return t[Co]||null}var Nh=[],Di=-1;function Pr(t){return{current:t}}function me(t){0>Di||(t.current=Nh[Di],Nh[Di]=null,Di--)}function de(t,e){Di++,Nh[Di]=t.current,t.current=e}var vr={},st=Pr(vr),vt=Pr(!1),ni=vr;function Zi(t,e){var n=t.type.contextTypes;if(!n)return vr;var r=t.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===e)return r.__reactInternalMemoizedMaskedChildContext;var i={},s;for(s in n)i[s]=e[s];return r&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=e,t.__reactInternalMemoizedMaskedChildContext=i),i}function wt(t){return t=t.childContextTypes,t!=null}function Nl(){me(vt),me(st)}function sg(t,e,n){if(st.current!==vr)throw Error(F(168));de(st,e),de(vt,n)}function Pv(t,e,n){var r=t.stateNode;if(e=e.childContextTypes,typeof r.getChildContext!="function")return n;r=r.getChildContext();for(var i in r)if(!(i in e))throw Error(F(108,bT(t)||"Unknown",i));return Te({},n,r)}function bl(t){return t=(t=t.stateNode)&&t.__reactInternalMemoizedMergedChildContext||vr,ni=st.current,de(st,t),de(vt,vt.current),!0}function og(t,e,n){var r=t.stateNode;if(!r)throw Error(F(169));n?(t=Pv(t,e,ni),r.__reactInternalMemoizedMergedChildContext=t,me(vt),me(st),de(st,t)):me(vt),de(vt,n)}var En=null,wu=!1,Mc=!1;function Nv(t){En===null?En=[t]:En.push(t)}function QI(t){wu=!0,Nv(t)}function Nr(){if(!Mc&&En!==null){Mc=!0;var t=0,e=ae;try{var n=En;for(ae=1;t<n.length;t++){var r=n[t];do r=r(!0);while(r!==null)}En=null,wu=!1}catch(i){throw En!==null&&(En=En.slice(t+1)),nv(Od,Nr),i}finally{ae=e,Mc=!1}}return null}var Oi=[],Vi=0,Dl=null,Ol=0,Ot=[],Vt=0,ri=null,An=1,Sn="";function Hr(t,e){Oi[Vi++]=Ol,Oi[Vi++]=Dl,Dl=t,Ol=e}function bv(t,e,n){Ot[Vt++]=An,Ot[Vt++]=Sn,Ot[Vt++]=ri,ri=t;var r=An;t=Sn;var i=32-Gt(r)-1;r&=~(1<<i),n+=1;var s=32-Gt(e)+i;if(30<s){var o=i-i%5;s=(r&(1<<o)-1).toString(32),r>>=o,i-=o,An=1<<32-Gt(e)+i|n<<i|r,Sn=s+t}else An=1<<s|n<<i|r,Sn=t}function $d(t){t.return!==null&&(Hr(t,1),bv(t,1,0))}function Hd(t){for(;t===Dl;)Dl=Oi[--Vi],Oi[Vi]=null,Ol=Oi[--Vi],Oi[Vi]=null;for(;t===ri;)ri=Ot[--Vt],Ot[Vt]=null,Sn=Ot[--Vt],Ot[Vt]=null,An=Ot[--Vt],Ot[Vt]=null}var Rt=null,At=null,ye=!1,qt=null;function Dv(t,e){var n=Lt(5,null,null,0);n.elementType="DELETED",n.stateNode=e,n.return=t,e=t.deletions,e===null?(t.deletions=[n],t.flags|=16):e.push(n)}function ag(t,e){switch(t.tag){case 5:var n=t.type;return e=e.nodeType!==1||n.toLowerCase()!==e.nodeName.toLowerCase()?null:e,e!==null?(t.stateNode=e,Rt=t,At=ar(e.firstChild),!0):!1;case 6:return e=t.pendingProps===""||e.nodeType!==3?null:e,e!==null?(t.stateNode=e,Rt=t,At=null,!0):!1;case 13:return e=e.nodeType!==8?null:e,e!==null?(n=ri!==null?{id:An,overflow:Sn}:null,t.memoizedState={dehydrated:e,treeContext:n,retryLane:1073741824},n=Lt(18,null,null,0),n.stateNode=e,n.return=t,t.child=n,Rt=t,At=null,!0):!1;default:return!1}}function bh(t){return(t.mode&1)!==0&&(t.flags&128)===0}function Dh(t){if(ye){var e=At;if(e){var n=e;if(!ag(t,e)){if(bh(t))throw Error(F(418));e=ar(n.nextSibling);var r=Rt;e&&ag(t,e)?Dv(r,n):(t.flags=t.flags&-4097|2,ye=!1,Rt=t)}}else{if(bh(t))throw Error(F(418));t.flags=t.flags&-4097|2,ye=!1,Rt=t}}}function lg(t){for(t=t.return;t!==null&&t.tag!==5&&t.tag!==3&&t.tag!==13;)t=t.return;Rt=t}function Ua(t){if(t!==Rt)return!1;if(!ye)return lg(t),ye=!0,!1;var e;if((e=t.tag!==3)&&!(e=t.tag!==5)&&(e=t.type,e=e!=="head"&&e!=="body"&&!Rh(t.type,t.memoizedProps)),e&&(e=At)){if(bh(t))throw Ov(),Error(F(418));for(;e;)Dv(t,e),e=ar(e.nextSibling)}if(lg(t),t.tag===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(F(317));e:{for(t=t.nextSibling,e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"){if(e===0){At=ar(t.nextSibling);break e}e--}else n!=="$"&&n!=="$!"&&n!=="$?"||e++}t=t.nextSibling}At=null}}else At=Rt?ar(t.stateNode.nextSibling):null;return!0}function Ov(){for(var t=At;t;)t=ar(t.nextSibling)}function es(){At=Rt=null,ye=!1}function qd(t){qt===null?qt=[t]:qt.push(t)}var XI=Bn.ReactCurrentBatchConfig;function Us(t,e,n){if(t=n.ref,t!==null&&typeof t!="function"&&typeof t!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(F(309));var r=n.stateNode}if(!r)throw Error(F(147,t));var i=r,s=""+t;return e!==null&&e.ref!==null&&typeof e.ref=="function"&&e.ref._stringRef===s?e.ref:(e=function(o){var l=i.refs;o===null?delete l[s]:l[s]=o},e._stringRef=s,e)}if(typeof t!="string")throw Error(F(284));if(!n._owner)throw Error(F(290,t))}return t}function za(t,e){throw t=Object.prototype.toString.call(e),Error(F(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t))}function ug(t){var e=t._init;return e(t._payload)}function Vv(t){function e(I,w){if(t){var E=I.deletions;E===null?(I.deletions=[w],I.flags|=16):E.push(w)}}function n(I,w){if(!t)return null;for(;w!==null;)e(I,w),w=w.sibling;return null}function r(I,w){for(I=new Map;w!==null;)w.key!==null?I.set(w.key,w):I.set(w.index,w),w=w.sibling;return I}function i(I,w){return I=hr(I,w),I.index=0,I.sibling=null,I}function s(I,w,E){return I.index=E,t?(E=I.alternate,E!==null?(E=E.index,E<w?(I.flags|=2,w):E):(I.flags|=2,w)):(I.flags|=1048576,w)}function o(I){return t&&I.alternate===null&&(I.flags|=2),I}function l(I,w,E,b){return w===null||w.tag!==6?(w=Hc(E,I.mode,b),w.return=I,w):(w=i(w,E),w.return=I,w)}function u(I,w,E,b){var M=E.type;return M===Ri?f(I,w,E.props.children,b,E.key):w!==null&&(w.elementType===M||typeof M=="object"&&M!==null&&M.$$typeof===Kn&&ug(M)===w.type)?(b=i(w,E.props),b.ref=Us(I,w,E),b.return=I,b):(b=hl(E.type,E.key,E.props,null,I.mode,b),b.ref=Us(I,w,E),b.return=I,b)}function h(I,w,E,b){return w===null||w.tag!==4||w.stateNode.containerInfo!==E.containerInfo||w.stateNode.implementation!==E.implementation?(w=qc(E,I.mode,b),w.return=I,w):(w=i(w,E.children||[]),w.return=I,w)}function f(I,w,E,b,M){return w===null||w.tag!==7?(w=ei(E,I.mode,b,M),w.return=I,w):(w=i(w,E),w.return=I,w)}function p(I,w,E){if(typeof w=="string"&&w!==""||typeof w=="number")return w=Hc(""+w,I.mode,E),w.return=I,w;if(typeof w=="object"&&w!==null){switch(w.$$typeof){case Pa:return E=hl(w.type,w.key,w.props,null,I.mode,E),E.ref=Us(I,null,w),E.return=I,E;case ki:return w=qc(w,I.mode,E),w.return=I,w;case Kn:var b=w._init;return p(I,b(w._payload),E)}if(qs(w)||Vs(w))return w=ei(w,I.mode,E,null),w.return=I,w;za(I,w)}return null}function m(I,w,E,b){var M=w!==null?w.key:null;if(typeof E=="string"&&E!==""||typeof E=="number")return M!==null?null:l(I,w,""+E,b);if(typeof E=="object"&&E!==null){switch(E.$$typeof){case Pa:return E.key===M?u(I,w,E,b):null;case ki:return E.key===M?h(I,w,E,b):null;case Kn:return M=E._init,m(I,w,M(E._payload),b)}if(qs(E)||Vs(E))return M!==null?null:f(I,w,E,b,null);za(I,E)}return null}function S(I,w,E,b,M){if(typeof b=="string"&&b!==""||typeof b=="number")return I=I.get(E)||null,l(w,I,""+b,M);if(typeof b=="object"&&b!==null){switch(b.$$typeof){case Pa:return I=I.get(b.key===null?E:b.key)||null,u(w,I,b,M);case ki:return I=I.get(b.key===null?E:b.key)||null,h(w,I,b,M);case Kn:var j=b._init;return S(I,w,E,j(b._payload),M)}if(qs(b)||Vs(b))return I=I.get(E)||null,f(w,I,b,M,null);za(w,b)}return null}function R(I,w,E,b){for(var M=null,j=null,v=w,_=w=0,T=null;v!==null&&_<E.length;_++){v.index>_?(T=v,v=null):T=v.sibling;var x=m(I,v,E[_],b);if(x===null){v===null&&(v=T);break}t&&v&&x.alternate===null&&e(I,v),w=s(x,w,_),j===null?M=x:j.sibling=x,j=x,v=T}if(_===E.length)return n(I,v),ye&&Hr(I,_),M;if(v===null){for(;_<E.length;_++)v=p(I,E[_],b),v!==null&&(w=s(v,w,_),j===null?M=v:j.sibling=v,j=v);return ye&&Hr(I,_),M}for(v=r(I,v);_<E.length;_++)T=S(v,I,_,E[_],b),T!==null&&(t&&T.alternate!==null&&v.delete(T.key===null?_:T.key),w=s(T,w,_),j===null?M=T:j.sibling=T,j=T);return t&&v.forEach(function(k){return e(I,k)}),ye&&Hr(I,_),M}function N(I,w,E,b){var M=Vs(E);if(typeof M!="function")throw Error(F(150));if(E=M.call(E),E==null)throw Error(F(151));for(var j=M=null,v=w,_=w=0,T=null,x=E.next();v!==null&&!x.done;_++,x=E.next()){v.index>_?(T=v,v=null):T=v.sibling;var k=m(I,v,x.value,b);if(k===null){v===null&&(v=T);break}t&&v&&k.alternate===null&&e(I,v),w=s(k,w,_),j===null?M=k:j.sibling=k,j=k,v=T}if(x.done)return n(I,v),ye&&Hr(I,_),M;if(v===null){for(;!x.done;_++,x=E.next())x=p(I,x.value,b),x!==null&&(w=s(x,w,_),j===null?M=x:j.sibling=x,j=x);return ye&&Hr(I,_),M}for(v=r(I,v);!x.done;_++,x=E.next())x=S(v,I,_,x.value,b),x!==null&&(t&&x.alternate!==null&&v.delete(x.key===null?_:x.key),w=s(x,w,_),j===null?M=x:j.sibling=x,j=x);return t&&v.forEach(function(C){return e(I,C)}),ye&&Hr(I,_),M}function O(I,w,E,b){if(typeof E=="object"&&E!==null&&E.type===Ri&&E.key===null&&(E=E.props.children),typeof E=="object"&&E!==null){switch(E.$$typeof){case Pa:e:{for(var M=E.key,j=w;j!==null;){if(j.key===M){if(M=E.type,M===Ri){if(j.tag===7){n(I,j.sibling),w=i(j,E.props.children),w.return=I,I=w;break e}}else if(j.elementType===M||typeof M=="object"&&M!==null&&M.$$typeof===Kn&&ug(M)===j.type){n(I,j.sibling),w=i(j,E.props),w.ref=Us(I,j,E),w.return=I,I=w;break e}n(I,j);break}else e(I,j);j=j.sibling}E.type===Ri?(w=ei(E.props.children,I.mode,b,E.key),w.return=I,I=w):(b=hl(E.type,E.key,E.props,null,I.mode,b),b.ref=Us(I,w,E),b.return=I,I=b)}return o(I);case ki:e:{for(j=E.key;w!==null;){if(w.key===j)if(w.tag===4&&w.stateNode.containerInfo===E.containerInfo&&w.stateNode.implementation===E.implementation){n(I,w.sibling),w=i(w,E.children||[]),w.return=I,I=w;break e}else{n(I,w);break}else e(I,w);w=w.sibling}w=qc(E,I.mode,b),w.return=I,I=w}return o(I);case Kn:return j=E._init,O(I,w,j(E._payload),b)}if(qs(E))return R(I,w,E,b);if(Vs(E))return N(I,w,E,b);za(I,E)}return typeof E=="string"&&E!==""||typeof E=="number"?(E=""+E,w!==null&&w.tag===6?(n(I,w.sibling),w=i(w,E),w.return=I,I=w):(n(I,w),w=Hc(E,I.mode,b),w.return=I,I=w),o(I)):n(I,w)}return O}var ts=Vv(!0),Lv=Vv(!1),Vl=Pr(null),Ll=null,Li=null,Wd=null;function Gd(){Wd=Li=Ll=null}function Kd(t){var e=Vl.current;me(Vl),t._currentValue=e}function Oh(t,e,n){for(;t!==null;){var r=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,r!==null&&(r.childLanes|=e)):r!==null&&(r.childLanes&e)!==e&&(r.childLanes|=e),t===n)break;t=t.return}}function Hi(t,e){Ll=t,Wd=Li=null,t=t.dependencies,t!==null&&t.firstContext!==null&&(t.lanes&e&&(_t=!0),t.firstContext=null)}function jt(t){var e=t._currentValue;if(Wd!==t)if(t={context:t,memoizedValue:e,next:null},Li===null){if(Ll===null)throw Error(F(308));Li=t,Ll.dependencies={lanes:0,firstContext:t}}else Li=Li.next=t;return e}var Kr=null;function Qd(t){Kr===null?Kr=[t]:Kr.push(t)}function Mv(t,e,n,r){var i=e.interleaved;return i===null?(n.next=n,Qd(e)):(n.next=i.next,i.next=n),e.interleaved=n,Vn(t,r)}function Vn(t,e){t.lanes|=e;var n=t.alternate;for(n!==null&&(n.lanes|=e),n=t,t=t.return;t!==null;)t.childLanes|=e,n=t.alternate,n!==null&&(n.childLanes|=e),n=t,t=t.return;return n.tag===3?n.stateNode:null}var Qn=!1;function Xd(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function jv(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,effects:t.effects})}function Cn(t,e){return{eventTime:t,lane:e,tag:0,payload:null,callback:null,next:null}}function lr(t,e,n){var r=t.updateQueue;if(r===null)return null;if(r=r.shared,se&2){var i=r.pending;return i===null?e.next=e:(e.next=i.next,i.next=e),r.pending=e,Vn(t,n)}return i=r.interleaved,i===null?(e.next=e,Qd(r)):(e.next=i.next,i.next=e),r.interleaved=e,Vn(t,n)}function sl(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194240)!==0)){var r=e.lanes;r&=t.pendingLanes,n|=r,e.lanes=n,Vd(t,n)}}function cg(t,e){var n=t.updateQueue,r=t.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var i=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var o={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};s===null?i=s=o:s=s.next=o,n=n.next}while(n!==null);s===null?i=s=e:s=s.next=e}else i=s=e;n={baseState:r.baseState,firstBaseUpdate:i,lastBaseUpdate:s,shared:r.shared,effects:r.effects},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}function Ml(t,e,n,r){var i=t.updateQueue;Qn=!1;var s=i.firstBaseUpdate,o=i.lastBaseUpdate,l=i.shared.pending;if(l!==null){i.shared.pending=null;var u=l,h=u.next;u.next=null,o===null?s=h:o.next=h,o=u;var f=t.alternate;f!==null&&(f=f.updateQueue,l=f.lastBaseUpdate,l!==o&&(l===null?f.firstBaseUpdate=h:l.next=h,f.lastBaseUpdate=u))}if(s!==null){var p=i.baseState;o=0,f=h=u=null,l=s;do{var m=l.lane,S=l.eventTime;if((r&m)===m){f!==null&&(f=f.next={eventTime:S,lane:0,tag:l.tag,payload:l.payload,callback:l.callback,next:null});e:{var R=t,N=l;switch(m=e,S=n,N.tag){case 1:if(R=N.payload,typeof R=="function"){p=R.call(S,p,m);break e}p=R;break e;case 3:R.flags=R.flags&-65537|128;case 0:if(R=N.payload,m=typeof R=="function"?R.call(S,p,m):R,m==null)break e;p=Te({},p,m);break e;case 2:Qn=!0}}l.callback!==null&&l.lane!==0&&(t.flags|=64,m=i.effects,m===null?i.effects=[l]:m.push(l))}else S={eventTime:S,lane:m,tag:l.tag,payload:l.payload,callback:l.callback,next:null},f===null?(h=f=S,u=p):f=f.next=S,o|=m;if(l=l.next,l===null){if(l=i.shared.pending,l===null)break;m=l,l=m.next,m.next=null,i.lastBaseUpdate=m,i.shared.pending=null}}while(!0);if(f===null&&(u=p),i.baseState=u,i.firstBaseUpdate=h,i.lastBaseUpdate=f,e=i.shared.interleaved,e!==null){i=e;do o|=i.lane,i=i.next;while(i!==e)}else s===null&&(i.shared.lanes=0);si|=o,t.lanes=o,t.memoizedState=p}}function hg(t,e,n){if(t=e.effects,e.effects=null,t!==null)for(e=0;e<t.length;e++){var r=t[e],i=r.callback;if(i!==null){if(r.callback=null,r=n,typeof i!="function")throw Error(F(191,i));i.call(r)}}}var Yo={},sn=Pr(Yo),Po=Pr(Yo),No=Pr(Yo);function Qr(t){if(t===Yo)throw Error(F(174));return t}function Yd(t,e){switch(de(No,e),de(Po,t),de(sn,Yo),t=e.nodeType,t){case 9:case 11:e=(e=e.documentElement)?e.namespaceURI:ph(null,"");break;default:t=t===8?e.parentNode:e,e=t.namespaceURI||null,t=t.tagName,e=ph(e,t)}me(sn),de(sn,e)}function ns(){me(sn),me(Po),me(No)}function Fv(t){Qr(No.current);var e=Qr(sn.current),n=ph(e,t.type);e!==n&&(de(Po,t),de(sn,n))}function Jd(t){Po.current===t&&(me(sn),me(Po))}var we=Pr(0);function jl(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return e}else if(e.tag===19&&e.memoizedProps.revealOrder!==void 0){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var jc=[];function Zd(){for(var t=0;t<jc.length;t++)jc[t]._workInProgressVersionPrimary=null;jc.length=0}var ol=Bn.ReactCurrentDispatcher,Fc=Bn.ReactCurrentBatchConfig,ii=0,Ee=null,Le=null,Ue=null,Fl=!1,oo=!1,bo=0,YI=0;function Ze(){throw Error(F(321))}function ef(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!Xt(t[n],e[n]))return!1;return!0}function tf(t,e,n,r,i,s){if(ii=s,Ee=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,ol.current=t===null||t.memoizedState===null?tx:nx,t=n(r,i),oo){s=0;do{if(oo=!1,bo=0,25<=s)throw Error(F(301));s+=1,Ue=Le=null,e.updateQueue=null,ol.current=rx,t=n(r,i)}while(oo)}if(ol.current=Ul,e=Le!==null&&Le.next!==null,ii=0,Ue=Le=Ee=null,Fl=!1,e)throw Error(F(300));return t}function nf(){var t=bo!==0;return bo=0,t}function Zt(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Ue===null?Ee.memoizedState=Ue=t:Ue=Ue.next=t,Ue}function Ft(){if(Le===null){var t=Ee.alternate;t=t!==null?t.memoizedState:null}else t=Le.next;var e=Ue===null?Ee.memoizedState:Ue.next;if(e!==null)Ue=e,Le=t;else{if(t===null)throw Error(F(310));Le=t,t={memoizedState:Le.memoizedState,baseState:Le.baseState,baseQueue:Le.baseQueue,queue:Le.queue,next:null},Ue===null?Ee.memoizedState=Ue=t:Ue=Ue.next=t}return Ue}function Do(t,e){return typeof e=="function"?e(t):e}function Uc(t){var e=Ft(),n=e.queue;if(n===null)throw Error(F(311));n.lastRenderedReducer=t;var r=Le,i=r.baseQueue,s=n.pending;if(s!==null){if(i!==null){var o=i.next;i.next=s.next,s.next=o}r.baseQueue=i=s,n.pending=null}if(i!==null){s=i.next,r=r.baseState;var l=o=null,u=null,h=s;do{var f=h.lane;if((ii&f)===f)u!==null&&(u=u.next={lane:0,action:h.action,hasEagerState:h.hasEagerState,eagerState:h.eagerState,next:null}),r=h.hasEagerState?h.eagerState:t(r,h.action);else{var p={lane:f,action:h.action,hasEagerState:h.hasEagerState,eagerState:h.eagerState,next:null};u===null?(l=u=p,o=r):u=u.next=p,Ee.lanes|=f,si|=f}h=h.next}while(h!==null&&h!==s);u===null?o=r:u.next=l,Xt(r,e.memoizedState)||(_t=!0),e.memoizedState=r,e.baseState=o,e.baseQueue=u,n.lastRenderedState=r}if(t=n.interleaved,t!==null){i=t;do s=i.lane,Ee.lanes|=s,si|=s,i=i.next;while(i!==t)}else i===null&&(n.lanes=0);return[e.memoizedState,n.dispatch]}function zc(t){var e=Ft(),n=e.queue;if(n===null)throw Error(F(311));n.lastRenderedReducer=t;var r=n.dispatch,i=n.pending,s=e.memoizedState;if(i!==null){n.pending=null;var o=i=i.next;do s=t(s,o.action),o=o.next;while(o!==i);Xt(s,e.memoizedState)||(_t=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),n.lastRenderedState=s}return[s,r]}function Uv(){}function zv(t,e){var n=Ee,r=Ft(),i=e(),s=!Xt(r.memoizedState,i);if(s&&(r.memoizedState=i,_t=!0),r=r.queue,rf(Hv.bind(null,n,r,t),[t]),r.getSnapshot!==e||s||Ue!==null&&Ue.memoizedState.tag&1){if(n.flags|=2048,Oo(9,$v.bind(null,n,r,i,e),void 0,null),Be===null)throw Error(F(349));ii&30||Bv(n,e,i)}return i}function Bv(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=Ee.updateQueue,e===null?(e={lastEffect:null,stores:null},Ee.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function $v(t,e,n,r){e.value=n,e.getSnapshot=r,qv(e)&&Wv(t)}function Hv(t,e,n){return n(function(){qv(e)&&Wv(t)})}function qv(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!Xt(t,n)}catch{return!0}}function Wv(t){var e=Vn(t,1);e!==null&&Kt(e,t,1,-1)}function dg(t){var e=Zt();return typeof t=="function"&&(t=t()),e.memoizedState=e.baseState=t,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Do,lastRenderedState:t},e.queue=t,t=t.dispatch=ex.bind(null,Ee,t),[e.memoizedState,t]}function Oo(t,e,n,r){return t={tag:t,create:e,destroy:n,deps:r,next:null},e=Ee.updateQueue,e===null?(e={lastEffect:null,stores:null},Ee.updateQueue=e,e.lastEffect=t.next=t):(n=e.lastEffect,n===null?e.lastEffect=t.next=t:(r=n.next,n.next=t,t.next=r,e.lastEffect=t)),t}function Gv(){return Ft().memoizedState}function al(t,e,n,r){var i=Zt();Ee.flags|=t,i.memoizedState=Oo(1|e,n,void 0,r===void 0?null:r)}function Eu(t,e,n,r){var i=Ft();r=r===void 0?null:r;var s=void 0;if(Le!==null){var o=Le.memoizedState;if(s=o.destroy,r!==null&&ef(r,o.deps)){i.memoizedState=Oo(e,n,s,r);return}}Ee.flags|=t,i.memoizedState=Oo(1|e,n,s,r)}function fg(t,e){return al(8390656,8,t,e)}function rf(t,e){return Eu(2048,8,t,e)}function Kv(t,e){return Eu(4,2,t,e)}function Qv(t,e){return Eu(4,4,t,e)}function Xv(t,e){if(typeof e=="function")return t=t(),e(t),function(){e(null)};if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function Yv(t,e,n){return n=n!=null?n.concat([t]):null,Eu(4,4,Xv.bind(null,e,t),n)}function sf(){}function Jv(t,e){var n=Ft();e=e===void 0?null:e;var r=n.memoizedState;return r!==null&&e!==null&&ef(e,r[1])?r[0]:(n.memoizedState=[t,e],t)}function Zv(t,e){var n=Ft();e=e===void 0?null:e;var r=n.memoizedState;return r!==null&&e!==null&&ef(e,r[1])?r[0]:(t=t(),n.memoizedState=[t,e],t)}function e0(t,e,n){return ii&21?(Xt(n,e)||(n=sv(),Ee.lanes|=n,si|=n,t.baseState=!0),e):(t.baseState&&(t.baseState=!1,_t=!0),t.memoizedState=n)}function JI(t,e){var n=ae;ae=n!==0&&4>n?n:4,t(!0);var r=Fc.transition;Fc.transition={};try{t(!1),e()}finally{ae=n,Fc.transition=r}}function t0(){return Ft().memoizedState}function ZI(t,e,n){var r=cr(t);if(n={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null},n0(t))r0(e,n);else if(n=Mv(t,e,n,r),n!==null){var i=dt();Kt(n,t,r,i),i0(n,e,r)}}function ex(t,e,n){var r=cr(t),i={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null};if(n0(t))r0(e,i);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var o=e.lastRenderedState,l=s(o,n);if(i.hasEagerState=!0,i.eagerState=l,Xt(l,o)){var u=e.interleaved;u===null?(i.next=i,Qd(e)):(i.next=u.next,u.next=i),e.interleaved=i;return}}catch{}finally{}n=Mv(t,e,i,r),n!==null&&(i=dt(),Kt(n,t,r,i),i0(n,e,r))}}function n0(t){var e=t.alternate;return t===Ee||e!==null&&e===Ee}function r0(t,e){oo=Fl=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function i0(t,e,n){if(n&4194240){var r=e.lanes;r&=t.pendingLanes,n|=r,e.lanes=n,Vd(t,n)}}var Ul={readContext:jt,useCallback:Ze,useContext:Ze,useEffect:Ze,useImperativeHandle:Ze,useInsertionEffect:Ze,useLayoutEffect:Ze,useMemo:Ze,useReducer:Ze,useRef:Ze,useState:Ze,useDebugValue:Ze,useDeferredValue:Ze,useTransition:Ze,useMutableSource:Ze,useSyncExternalStore:Ze,useId:Ze,unstable_isNewReconciler:!1},tx={readContext:jt,useCallback:function(t,e){return Zt().memoizedState=[t,e===void 0?null:e],t},useContext:jt,useEffect:fg,useImperativeHandle:function(t,e,n){return n=n!=null?n.concat([t]):null,al(4194308,4,Xv.bind(null,e,t),n)},useLayoutEffect:function(t,e){return al(4194308,4,t,e)},useInsertionEffect:function(t,e){return al(4,2,t,e)},useMemo:function(t,e){var n=Zt();return e=e===void 0?null:e,t=t(),n.memoizedState=[t,e],t},useReducer:function(t,e,n){var r=Zt();return e=n!==void 0?n(e):e,r.memoizedState=r.baseState=e,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:e},r.queue=t,t=t.dispatch=ZI.bind(null,Ee,t),[r.memoizedState,t]},useRef:function(t){var e=Zt();return t={current:t},e.memoizedState=t},useState:dg,useDebugValue:sf,useDeferredValue:function(t){return Zt().memoizedState=t},useTransition:function(){var t=dg(!1),e=t[0];return t=JI.bind(null,t[1]),Zt().memoizedState=t,[e,t]},useMutableSource:function(){},useSyncExternalStore:function(t,e,n){var r=Ee,i=Zt();if(ye){if(n===void 0)throw Error(F(407));n=n()}else{if(n=e(),Be===null)throw Error(F(349));ii&30||Bv(r,e,n)}i.memoizedState=n;var s={value:n,getSnapshot:e};return i.queue=s,fg(Hv.bind(null,r,s,t),[t]),r.flags|=2048,Oo(9,$v.bind(null,r,s,n,e),void 0,null),n},useId:function(){var t=Zt(),e=Be.identifierPrefix;if(ye){var n=Sn,r=An;n=(r&~(1<<32-Gt(r)-1)).toString(32)+n,e=":"+e+"R"+n,n=bo++,0<n&&(e+="H"+n.toString(32)),e+=":"}else n=YI++,e=":"+e+"r"+n.toString(32)+":";return t.memoizedState=e},unstable_isNewReconciler:!1},nx={readContext:jt,useCallback:Jv,useContext:jt,useEffect:rf,useImperativeHandle:Yv,useInsertionEffect:Kv,useLayoutEffect:Qv,useMemo:Zv,useReducer:Uc,useRef:Gv,useState:function(){return Uc(Do)},useDebugValue:sf,useDeferredValue:function(t){var e=Ft();return e0(e,Le.memoizedState,t)},useTransition:function(){var t=Uc(Do)[0],e=Ft().memoizedState;return[t,e]},useMutableSource:Uv,useSyncExternalStore:zv,useId:t0,unstable_isNewReconciler:!1},rx={readContext:jt,useCallback:Jv,useContext:jt,useEffect:rf,useImperativeHandle:Yv,useInsertionEffect:Kv,useLayoutEffect:Qv,useMemo:Zv,useReducer:zc,useRef:Gv,useState:function(){return zc(Do)},useDebugValue:sf,useDeferredValue:function(t){var e=Ft();return Le===null?e.memoizedState=t:e0(e,Le.memoizedState,t)},useTransition:function(){var t=zc(Do)[0],e=Ft().memoizedState;return[t,e]},useMutableSource:Uv,useSyncExternalStore:zv,useId:t0,unstable_isNewReconciler:!1};function $t(t,e){if(t&&t.defaultProps){e=Te({},e),t=t.defaultProps;for(var n in t)e[n]===void 0&&(e[n]=t[n]);return e}return e}function Vh(t,e,n,r){e=t.memoizedState,n=n(r,e),n=n==null?e:Te({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Tu={isMounted:function(t){return(t=t._reactInternals)?pi(t)===t:!1},enqueueSetState:function(t,e,n){t=t._reactInternals;var r=dt(),i=cr(t),s=Cn(r,i);s.payload=e,n!=null&&(s.callback=n),e=lr(t,s,i),e!==null&&(Kt(e,t,i,r),sl(e,t,i))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var r=dt(),i=cr(t),s=Cn(r,i);s.tag=1,s.payload=e,n!=null&&(s.callback=n),e=lr(t,s,i),e!==null&&(Kt(e,t,i,r),sl(e,t,i))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=dt(),r=cr(t),i=Cn(n,r);i.tag=2,e!=null&&(i.callback=e),e=lr(t,i,r),e!==null&&(Kt(e,t,r,n),sl(e,t,r))}};function pg(t,e,n,r,i,s,o){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(r,s,o):e.prototype&&e.prototype.isPureReactComponent?!So(n,r)||!So(i,s):!0}function s0(t,e,n){var r=!1,i=vr,s=e.contextType;return typeof s=="object"&&s!==null?s=jt(s):(i=wt(e)?ni:st.current,r=e.contextTypes,s=(r=r!=null)?Zi(t,i):vr),e=new e(n,s),t.memoizedState=e.state!==null&&e.state!==void 0?e.state:null,e.updater=Tu,t.stateNode=e,e._reactInternals=t,r&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=i,t.__reactInternalMemoizedMaskedChildContext=s),e}function mg(t,e,n,r){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,r),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,r),e.state!==t&&Tu.enqueueReplaceState(e,e.state,null)}function Lh(t,e,n,r){var i=t.stateNode;i.props=n,i.state=t.memoizedState,i.refs={},Xd(t);var s=e.contextType;typeof s=="object"&&s!==null?i.context=jt(s):(s=wt(e)?ni:st.current,i.context=Zi(t,s)),i.state=t.memoizedState,s=e.getDerivedStateFromProps,typeof s=="function"&&(Vh(t,e,s,n),i.state=t.memoizedState),typeof e.getDerivedStateFromProps=="function"||typeof i.getSnapshotBeforeUpdate=="function"||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(e=i.state,typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount(),e!==i.state&&Tu.enqueueReplaceState(i,i.state,null),Ml(t,n,i,r),i.state=t.memoizedState),typeof i.componentDidMount=="function"&&(t.flags|=4194308)}function rs(t,e){try{var n="",r=e;do n+=NT(r),r=r.return;while(r);var i=n}catch(s){i=`
Error generating stack: `+s.message+`
`+s.stack}return{value:t,source:e,stack:i,digest:null}}function Bc(t,e,n){return{value:t,source:null,stack:n??null,digest:e??null}}function Mh(t,e){try{console.error(e.value)}catch(n){setTimeout(function(){throw n})}}var ix=typeof WeakMap=="function"?WeakMap:Map;function o0(t,e,n){n=Cn(-1,n),n.tag=3,n.payload={element:null};var r=e.value;return n.callback=function(){Bl||(Bl=!0,Gh=r),Mh(t,e)},n}function a0(t,e,n){n=Cn(-1,n),n.tag=3;var r=t.type.getDerivedStateFromError;if(typeof r=="function"){var i=e.value;n.payload=function(){return r(i)},n.callback=function(){Mh(t,e)}}var s=t.stateNode;return s!==null&&typeof s.componentDidCatch=="function"&&(n.callback=function(){Mh(t,e),typeof r!="function"&&(ur===null?ur=new Set([this]):ur.add(this));var o=e.stack;this.componentDidCatch(e.value,{componentStack:o!==null?o:""})}),n}function gg(t,e,n){var r=t.pingCache;if(r===null){r=t.pingCache=new ix;var i=new Set;r.set(e,i)}else i=r.get(e),i===void 0&&(i=new Set,r.set(e,i));i.has(n)||(i.add(n),t=_x.bind(null,t,e,n),e.then(t,t))}function yg(t){do{var e;if((e=t.tag===13)&&(e=t.memoizedState,e=e!==null?e.dehydrated!==null:!0),e)return t;t=t.return}while(t!==null);return null}function _g(t,e,n,r,i){return t.mode&1?(t.flags|=65536,t.lanes=i,t):(t===e?t.flags|=65536:(t.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(e=Cn(-1,1),e.tag=2,lr(n,e,1))),n.lanes|=1),t)}var sx=Bn.ReactCurrentOwner,_t=!1;function ct(t,e,n,r){e.child=t===null?Lv(e,null,n,r):ts(e,t.child,n,r)}function vg(t,e,n,r,i){n=n.render;var s=e.ref;return Hi(e,i),r=tf(t,e,n,r,s,i),n=nf(),t!==null&&!_t?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~i,Ln(t,e,i)):(ye&&n&&$d(e),e.flags|=1,ct(t,e,r,i),e.child)}function wg(t,e,n,r,i){if(t===null){var s=n.type;return typeof s=="function"&&!ff(s)&&s.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(e.tag=15,e.type=s,l0(t,e,s,r,i)):(t=hl(n.type,null,r,e,e.mode,i),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,!(t.lanes&i)){var o=s.memoizedProps;if(n=n.compare,n=n!==null?n:So,n(o,r)&&t.ref===e.ref)return Ln(t,e,i)}return e.flags|=1,t=hr(s,r),t.ref=e.ref,t.return=e,e.child=t}function l0(t,e,n,r,i){if(t!==null){var s=t.memoizedProps;if(So(s,r)&&t.ref===e.ref)if(_t=!1,e.pendingProps=r=s,(t.lanes&i)!==0)t.flags&131072&&(_t=!0);else return e.lanes=t.lanes,Ln(t,e,i)}return jh(t,e,n,r,i)}function u0(t,e,n){var r=e.pendingProps,i=r.children,s=t!==null?t.memoizedState:null;if(r.mode==="hidden")if(!(e.mode&1))e.memoizedState={baseLanes:0,cachePool:null,transitions:null},de(ji,It),It|=n;else{if(!(n&1073741824))return t=s!==null?s.baseLanes|n:n,e.lanes=e.childLanes=1073741824,e.memoizedState={baseLanes:t,cachePool:null,transitions:null},e.updateQueue=null,de(ji,It),It|=t,null;e.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=s!==null?s.baseLanes:n,de(ji,It),It|=r}else s!==null?(r=s.baseLanes|n,e.memoizedState=null):r=n,de(ji,It),It|=r;return ct(t,e,i,n),e.child}function c0(t,e){var n=e.ref;(t===null&&n!==null||t!==null&&t.ref!==n)&&(e.flags|=512,e.flags|=2097152)}function jh(t,e,n,r,i){var s=wt(n)?ni:st.current;return s=Zi(e,s),Hi(e,i),n=tf(t,e,n,r,s,i),r=nf(),t!==null&&!_t?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~i,Ln(t,e,i)):(ye&&r&&$d(e),e.flags|=1,ct(t,e,n,i),e.child)}function Eg(t,e,n,r,i){if(wt(n)){var s=!0;bl(e)}else s=!1;if(Hi(e,i),e.stateNode===null)ll(t,e),s0(e,n,r),Lh(e,n,r,i),r=!0;else if(t===null){var o=e.stateNode,l=e.memoizedProps;o.props=l;var u=o.context,h=n.contextType;typeof h=="object"&&h!==null?h=jt(h):(h=wt(n)?ni:st.current,h=Zi(e,h));var f=n.getDerivedStateFromProps,p=typeof f=="function"||typeof o.getSnapshotBeforeUpdate=="function";p||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(l!==r||u!==h)&&mg(e,o,r,h),Qn=!1;var m=e.memoizedState;o.state=m,Ml(e,r,o,i),u=e.memoizedState,l!==r||m!==u||vt.current||Qn?(typeof f=="function"&&(Vh(e,n,f,r),u=e.memoizedState),(l=Qn||pg(e,n,l,r,m,u,h))?(p||typeof o.UNSAFE_componentWillMount!="function"&&typeof o.componentWillMount!="function"||(typeof o.componentWillMount=="function"&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount=="function"&&o.UNSAFE_componentWillMount()),typeof o.componentDidMount=="function"&&(e.flags|=4194308)):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=r,e.memoizedState=u),o.props=r,o.state=u,o.context=h,r=l):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),r=!1)}else{o=e.stateNode,jv(t,e),l=e.memoizedProps,h=e.type===e.elementType?l:$t(e.type,l),o.props=h,p=e.pendingProps,m=o.context,u=n.contextType,typeof u=="object"&&u!==null?u=jt(u):(u=wt(n)?ni:st.current,u=Zi(e,u));var S=n.getDerivedStateFromProps;(f=typeof S=="function"||typeof o.getSnapshotBeforeUpdate=="function")||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(l!==p||m!==u)&&mg(e,o,r,u),Qn=!1,m=e.memoizedState,o.state=m,Ml(e,r,o,i);var R=e.memoizedState;l!==p||m!==R||vt.current||Qn?(typeof S=="function"&&(Vh(e,n,S,r),R=e.memoizedState),(h=Qn||pg(e,n,h,r,m,R,u)||!1)?(f||typeof o.UNSAFE_componentWillUpdate!="function"&&typeof o.componentWillUpdate!="function"||(typeof o.componentWillUpdate=="function"&&o.componentWillUpdate(r,R,u),typeof o.UNSAFE_componentWillUpdate=="function"&&o.UNSAFE_componentWillUpdate(r,R,u)),typeof o.componentDidUpdate=="function"&&(e.flags|=4),typeof o.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof o.componentDidUpdate!="function"||l===t.memoizedProps&&m===t.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||l===t.memoizedProps&&m===t.memoizedState||(e.flags|=1024),e.memoizedProps=r,e.memoizedState=R),o.props=r,o.state=R,o.context=u,r=h):(typeof o.componentDidUpdate!="function"||l===t.memoizedProps&&m===t.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||l===t.memoizedProps&&m===t.memoizedState||(e.flags|=1024),r=!1)}return Fh(t,e,n,r,s,i)}function Fh(t,e,n,r,i,s){c0(t,e);var o=(e.flags&128)!==0;if(!r&&!o)return i&&og(e,n,!1),Ln(t,e,s);r=e.stateNode,sx.current=e;var l=o&&typeof n.getDerivedStateFromError!="function"?null:r.render();return e.flags|=1,t!==null&&o?(e.child=ts(e,t.child,null,s),e.child=ts(e,null,l,s)):ct(t,e,l,s),e.memoizedState=r.state,i&&og(e,n,!0),e.child}function h0(t){var e=t.stateNode;e.pendingContext?sg(t,e.pendingContext,e.pendingContext!==e.context):e.context&&sg(t,e.context,!1),Yd(t,e.containerInfo)}function Tg(t,e,n,r,i){return es(),qd(i),e.flags|=256,ct(t,e,n,r),e.child}var Uh={dehydrated:null,treeContext:null,retryLane:0};function zh(t){return{baseLanes:t,cachePool:null,transitions:null}}function d0(t,e,n){var r=e.pendingProps,i=we.current,s=!1,o=(e.flags&128)!==0,l;if((l=o)||(l=t!==null&&t.memoizedState===null?!1:(i&2)!==0),l?(s=!0,e.flags&=-129):(t===null||t.memoizedState!==null)&&(i|=1),de(we,i&1),t===null)return Dh(e),t=e.memoizedState,t!==null&&(t=t.dehydrated,t!==null)?(e.mode&1?t.data==="$!"?e.lanes=8:e.lanes=1073741824:e.lanes=1,null):(o=r.children,t=r.fallback,s?(r=e.mode,s=e.child,o={mode:"hidden",children:o},!(r&1)&&s!==null?(s.childLanes=0,s.pendingProps=o):s=Au(o,r,0,null),t=ei(t,r,n,null),s.return=e,t.return=e,s.sibling=t,e.child=s,e.child.memoizedState=zh(n),e.memoizedState=Uh,t):of(e,o));if(i=t.memoizedState,i!==null&&(l=i.dehydrated,l!==null))return ox(t,e,o,r,l,i,n);if(s){s=r.fallback,o=e.mode,i=t.child,l=i.sibling;var u={mode:"hidden",children:r.children};return!(o&1)&&e.child!==i?(r=e.child,r.childLanes=0,r.pendingProps=u,e.deletions=null):(r=hr(i,u),r.subtreeFlags=i.subtreeFlags&14680064),l!==null?s=hr(l,s):(s=ei(s,o,n,null),s.flags|=2),s.return=e,r.return=e,r.sibling=s,e.child=r,r=s,s=e.child,o=t.child.memoizedState,o=o===null?zh(n):{baseLanes:o.baseLanes|n,cachePool:null,transitions:o.transitions},s.memoizedState=o,s.childLanes=t.childLanes&~n,e.memoizedState=Uh,r}return s=t.child,t=s.sibling,r=hr(s,{mode:"visible",children:r.children}),!(e.mode&1)&&(r.lanes=n),r.return=e,r.sibling=null,t!==null&&(n=e.deletions,n===null?(e.deletions=[t],e.flags|=16):n.push(t)),e.child=r,e.memoizedState=null,r}function of(t,e){return e=Au({mode:"visible",children:e},t.mode,0,null),e.return=t,t.child=e}function Ba(t,e,n,r){return r!==null&&qd(r),ts(e,t.child,null,n),t=of(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function ox(t,e,n,r,i,s,o){if(n)return e.flags&256?(e.flags&=-257,r=Bc(Error(F(422))),Ba(t,e,o,r)):e.memoizedState!==null?(e.child=t.child,e.flags|=128,null):(s=r.fallback,i=e.mode,r=Au({mode:"visible",children:r.children},i,0,null),s=ei(s,i,o,null),s.flags|=2,r.return=e,s.return=e,r.sibling=s,e.child=r,e.mode&1&&ts(e,t.child,null,o),e.child.memoizedState=zh(o),e.memoizedState=Uh,s);if(!(e.mode&1))return Ba(t,e,o,null);if(i.data==="$!"){if(r=i.nextSibling&&i.nextSibling.dataset,r)var l=r.dgst;return r=l,s=Error(F(419)),r=Bc(s,r,void 0),Ba(t,e,o,r)}if(l=(o&t.childLanes)!==0,_t||l){if(r=Be,r!==null){switch(o&-o){case 4:i=2;break;case 16:i=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:i=32;break;case 536870912:i=268435456;break;default:i=0}i=i&(r.suspendedLanes|o)?0:i,i!==0&&i!==s.retryLane&&(s.retryLane=i,Vn(t,i),Kt(r,t,i,-1))}return df(),r=Bc(Error(F(421))),Ba(t,e,o,r)}return i.data==="$?"?(e.flags|=128,e.child=t.child,e=vx.bind(null,t),i._reactRetry=e,null):(t=s.treeContext,At=ar(i.nextSibling),Rt=e,ye=!0,qt=null,t!==null&&(Ot[Vt++]=An,Ot[Vt++]=Sn,Ot[Vt++]=ri,An=t.id,Sn=t.overflow,ri=e),e=of(e,r.children),e.flags|=4096,e)}function Ig(t,e,n){t.lanes|=e;var r=t.alternate;r!==null&&(r.lanes|=e),Oh(t.return,e,n)}function $c(t,e,n,r,i){var s=t.memoizedState;s===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:i}:(s.isBackwards=e,s.rendering=null,s.renderingStartTime=0,s.last=r,s.tail=n,s.tailMode=i)}function f0(t,e,n){var r=e.pendingProps,i=r.revealOrder,s=r.tail;if(ct(t,e,r.children,n),r=we.current,r&2)r=r&1|2,e.flags|=128;else{if(t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&Ig(t,n,e);else if(t.tag===19)Ig(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}r&=1}if(de(we,r),!(e.mode&1))e.memoizedState=null;else switch(i){case"forwards":for(n=e.child,i=null;n!==null;)t=n.alternate,t!==null&&jl(t)===null&&(i=n),n=n.sibling;n=i,n===null?(i=e.child,e.child=null):(i=n.sibling,n.sibling=null),$c(e,!1,i,n,s);break;case"backwards":for(n=null,i=e.child,e.child=null;i!==null;){if(t=i.alternate,t!==null&&jl(t)===null){e.child=i;break}t=i.sibling,i.sibling=n,n=i,i=t}$c(e,!0,n,null,s);break;case"together":$c(e,!1,null,null,void 0);break;default:e.memoizedState=null}return e.child}function ll(t,e){!(e.mode&1)&&t!==null&&(t.alternate=null,e.alternate=null,e.flags|=2)}function Ln(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),si|=e.lanes,!(n&e.childLanes))return null;if(t!==null&&e.child!==t.child)throw Error(F(153));if(e.child!==null){for(t=e.child,n=hr(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=hr(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function ax(t,e,n){switch(e.tag){case 3:h0(e),es();break;case 5:Fv(e);break;case 1:wt(e.type)&&bl(e);break;case 4:Yd(e,e.stateNode.containerInfo);break;case 10:var r=e.type._context,i=e.memoizedProps.value;de(Vl,r._currentValue),r._currentValue=i;break;case 13:if(r=e.memoizedState,r!==null)return r.dehydrated!==null?(de(we,we.current&1),e.flags|=128,null):n&e.child.childLanes?d0(t,e,n):(de(we,we.current&1),t=Ln(t,e,n),t!==null?t.sibling:null);de(we,we.current&1);break;case 19:if(r=(n&e.childLanes)!==0,t.flags&128){if(r)return f0(t,e,n);e.flags|=128}if(i=e.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),de(we,we.current),r)break;return null;case 22:case 23:return e.lanes=0,u0(t,e,n)}return Ln(t,e,n)}var p0,Bh,m0,g0;p0=function(t,e){for(var n=e.child;n!==null;){if(n.tag===5||n.tag===6)t.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};Bh=function(){};m0=function(t,e,n,r){var i=t.memoizedProps;if(i!==r){t=e.stateNode,Qr(sn.current);var s=null;switch(n){case"input":i=ch(t,i),r=ch(t,r),s=[];break;case"select":i=Te({},i,{value:void 0}),r=Te({},r,{value:void 0}),s=[];break;case"textarea":i=fh(t,i),r=fh(t,r),s=[];break;default:typeof i.onClick!="function"&&typeof r.onClick=="function"&&(t.onclick=Pl)}mh(n,r);var o;n=null;for(h in i)if(!r.hasOwnProperty(h)&&i.hasOwnProperty(h)&&i[h]!=null)if(h==="style"){var l=i[h];for(o in l)l.hasOwnProperty(o)&&(n||(n={}),n[o]="")}else h!=="dangerouslySetInnerHTML"&&h!=="children"&&h!=="suppressContentEditableWarning"&&h!=="suppressHydrationWarning"&&h!=="autoFocus"&&(vo.hasOwnProperty(h)?s||(s=[]):(s=s||[]).push(h,null));for(h in r){var u=r[h];if(l=i!=null?i[h]:void 0,r.hasOwnProperty(h)&&u!==l&&(u!=null||l!=null))if(h==="style")if(l){for(o in l)!l.hasOwnProperty(o)||u&&u.hasOwnProperty(o)||(n||(n={}),n[o]="");for(o in u)u.hasOwnProperty(o)&&l[o]!==u[o]&&(n||(n={}),n[o]=u[o])}else n||(s||(s=[]),s.push(h,n)),n=u;else h==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,l=l?l.__html:void 0,u!=null&&l!==u&&(s=s||[]).push(h,u)):h==="children"?typeof u!="string"&&typeof u!="number"||(s=s||[]).push(h,""+u):h!=="suppressContentEditableWarning"&&h!=="suppressHydrationWarning"&&(vo.hasOwnProperty(h)?(u!=null&&h==="onScroll"&&pe("scroll",t),s||l===u||(s=[])):(s=s||[]).push(h,u))}n&&(s=s||[]).push("style",n);var h=s;(e.updateQueue=h)&&(e.flags|=4)}};g0=function(t,e,n,r){n!==r&&(e.flags|=4)};function zs(t,e){if(!ye)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:r.sibling=null}}function et(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,r=0;if(e)for(var i=t.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags&14680064,r|=i.flags&14680064,i.return=t,i=i.sibling;else for(i=t.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags,r|=i.flags,i.return=t,i=i.sibling;return t.subtreeFlags|=r,t.childLanes=n,e}function lx(t,e,n){var r=e.pendingProps;switch(Hd(e),e.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return et(e),null;case 1:return wt(e.type)&&Nl(),et(e),null;case 3:return r=e.stateNode,ns(),me(vt),me(st),Zd(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(t===null||t.child===null)&&(Ua(e)?e.flags|=4:t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,qt!==null&&(Xh(qt),qt=null))),Bh(t,e),et(e),null;case 5:Jd(e);var i=Qr(No.current);if(n=e.type,t!==null&&e.stateNode!=null)m0(t,e,n,r,i),t.ref!==e.ref&&(e.flags|=512,e.flags|=2097152);else{if(!r){if(e.stateNode===null)throw Error(F(166));return et(e),null}if(t=Qr(sn.current),Ua(e)){r=e.stateNode,n=e.type;var s=e.memoizedProps;switch(r[tn]=e,r[Co]=s,t=(e.mode&1)!==0,n){case"dialog":pe("cancel",r),pe("close",r);break;case"iframe":case"object":case"embed":pe("load",r);break;case"video":case"audio":for(i=0;i<Gs.length;i++)pe(Gs[i],r);break;case"source":pe("error",r);break;case"img":case"image":case"link":pe("error",r),pe("load",r);break;case"details":pe("toggle",r);break;case"input":bm(r,s),pe("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!s.multiple},pe("invalid",r);break;case"textarea":Om(r,s),pe("invalid",r)}mh(n,s),i=null;for(var o in s)if(s.hasOwnProperty(o)){var l=s[o];o==="children"?typeof l=="string"?r.textContent!==l&&(s.suppressHydrationWarning!==!0&&Fa(r.textContent,l,t),i=["children",l]):typeof l=="number"&&r.textContent!==""+l&&(s.suppressHydrationWarning!==!0&&Fa(r.textContent,l,t),i=["children",""+l]):vo.hasOwnProperty(o)&&l!=null&&o==="onScroll"&&pe("scroll",r)}switch(n){case"input":Na(r),Dm(r,s,!0);break;case"textarea":Na(r),Vm(r);break;case"select":case"option":break;default:typeof s.onClick=="function"&&(r.onclick=Pl)}r=i,e.updateQueue=r,r!==null&&(e.flags|=4)}else{o=i.nodeType===9?i:i.ownerDocument,t==="http://www.w3.org/1999/xhtml"&&(t=H_(n)),t==="http://www.w3.org/1999/xhtml"?n==="script"?(t=o.createElement("div"),t.innerHTML="<script><\/script>",t=t.removeChild(t.firstChild)):typeof r.is=="string"?t=o.createElement(n,{is:r.is}):(t=o.createElement(n),n==="select"&&(o=t,r.multiple?o.multiple=!0:r.size&&(o.size=r.size))):t=o.createElementNS(t,n),t[tn]=e,t[Co]=r,p0(t,e,!1,!1),e.stateNode=t;e:{switch(o=gh(n,r),n){case"dialog":pe("cancel",t),pe("close",t),i=r;break;case"iframe":case"object":case"embed":pe("load",t),i=r;break;case"video":case"audio":for(i=0;i<Gs.length;i++)pe(Gs[i],t);i=r;break;case"source":pe("error",t),i=r;break;case"img":case"image":case"link":pe("error",t),pe("load",t),i=r;break;case"details":pe("toggle",t),i=r;break;case"input":bm(t,r),i=ch(t,r),pe("invalid",t);break;case"option":i=r;break;case"select":t._wrapperState={wasMultiple:!!r.multiple},i=Te({},r,{value:void 0}),pe("invalid",t);break;case"textarea":Om(t,r),i=fh(t,r),pe("invalid",t);break;default:i=r}mh(n,i),l=i;for(s in l)if(l.hasOwnProperty(s)){var u=l[s];s==="style"?G_(t,u):s==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,u!=null&&q_(t,u)):s==="children"?typeof u=="string"?(n!=="textarea"||u!=="")&&wo(t,u):typeof u=="number"&&wo(t,""+u):s!=="suppressContentEditableWarning"&&s!=="suppressHydrationWarning"&&s!=="autoFocus"&&(vo.hasOwnProperty(s)?u!=null&&s==="onScroll"&&pe("scroll",t):u!=null&&Cd(t,s,u,o))}switch(n){case"input":Na(t),Dm(t,r,!1);break;case"textarea":Na(t),Vm(t);break;case"option":r.value!=null&&t.setAttribute("value",""+_r(r.value));break;case"select":t.multiple=!!r.multiple,s=r.value,s!=null?Ui(t,!!r.multiple,s,!1):r.defaultValue!=null&&Ui(t,!!r.multiple,r.defaultValue,!0);break;default:typeof i.onClick=="function"&&(t.onclick=Pl)}switch(n){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(e.flags|=4)}e.ref!==null&&(e.flags|=512,e.flags|=2097152)}return et(e),null;case 6:if(t&&e.stateNode!=null)g0(t,e,t.memoizedProps,r);else{if(typeof r!="string"&&e.stateNode===null)throw Error(F(166));if(n=Qr(No.current),Qr(sn.current),Ua(e)){if(r=e.stateNode,n=e.memoizedProps,r[tn]=e,(s=r.nodeValue!==n)&&(t=Rt,t!==null))switch(t.tag){case 3:Fa(r.nodeValue,n,(t.mode&1)!==0);break;case 5:t.memoizedProps.suppressHydrationWarning!==!0&&Fa(r.nodeValue,n,(t.mode&1)!==0)}s&&(e.flags|=4)}else r=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),r[tn]=e,e.stateNode=r}return et(e),null;case 13:if(me(we),r=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(ye&&At!==null&&e.mode&1&&!(e.flags&128))Ov(),es(),e.flags|=98560,s=!1;else if(s=Ua(e),r!==null&&r.dehydrated!==null){if(t===null){if(!s)throw Error(F(318));if(s=e.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(F(317));s[tn]=e}else es(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;et(e),s=!1}else qt!==null&&(Xh(qt),qt=null),s=!0;if(!s)return e.flags&65536?e:null}return e.flags&128?(e.lanes=n,e):(r=r!==null,r!==(t!==null&&t.memoizedState!==null)&&r&&(e.child.flags|=8192,e.mode&1&&(t===null||we.current&1?Me===0&&(Me=3):df())),e.updateQueue!==null&&(e.flags|=4),et(e),null);case 4:return ns(),Bh(t,e),t===null&&ko(e.stateNode.containerInfo),et(e),null;case 10:return Kd(e.type._context),et(e),null;case 17:return wt(e.type)&&Nl(),et(e),null;case 19:if(me(we),s=e.memoizedState,s===null)return et(e),null;if(r=(e.flags&128)!==0,o=s.rendering,o===null)if(r)zs(s,!1);else{if(Me!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(o=jl(t),o!==null){for(e.flags|=128,zs(s,!1),r=o.updateQueue,r!==null&&(e.updateQueue=r,e.flags|=4),e.subtreeFlags=0,r=n,n=e.child;n!==null;)s=n,t=r,s.flags&=14680066,o=s.alternate,o===null?(s.childLanes=0,s.lanes=t,s.child=null,s.subtreeFlags=0,s.memoizedProps=null,s.memoizedState=null,s.updateQueue=null,s.dependencies=null,s.stateNode=null):(s.childLanes=o.childLanes,s.lanes=o.lanes,s.child=o.child,s.subtreeFlags=0,s.deletions=null,s.memoizedProps=o.memoizedProps,s.memoizedState=o.memoizedState,s.updateQueue=o.updateQueue,s.type=o.type,t=o.dependencies,s.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),n=n.sibling;return de(we,we.current&1|2),e.child}t=t.sibling}s.tail!==null&&Pe()>is&&(e.flags|=128,r=!0,zs(s,!1),e.lanes=4194304)}else{if(!r)if(t=jl(o),t!==null){if(e.flags|=128,r=!0,n=t.updateQueue,n!==null&&(e.updateQueue=n,e.flags|=4),zs(s,!0),s.tail===null&&s.tailMode==="hidden"&&!o.alternate&&!ye)return et(e),null}else 2*Pe()-s.renderingStartTime>is&&n!==1073741824&&(e.flags|=128,r=!0,zs(s,!1),e.lanes=4194304);s.isBackwards?(o.sibling=e.child,e.child=o):(n=s.last,n!==null?n.sibling=o:e.child=o,s.last=o)}return s.tail!==null?(e=s.tail,s.rendering=e,s.tail=e.sibling,s.renderingStartTime=Pe(),e.sibling=null,n=we.current,de(we,r?n&1|2:n&1),e):(et(e),null);case 22:case 23:return hf(),r=e.memoizedState!==null,t!==null&&t.memoizedState!==null!==r&&(e.flags|=8192),r&&e.mode&1?It&1073741824&&(et(e),e.subtreeFlags&6&&(e.flags|=8192)):et(e),null;case 24:return null;case 25:return null}throw Error(F(156,e.tag))}function ux(t,e){switch(Hd(e),e.tag){case 1:return wt(e.type)&&Nl(),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return ns(),me(vt),me(st),Zd(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 5:return Jd(e),null;case 13:if(me(we),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(F(340));es()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return me(we),null;case 4:return ns(),null;case 10:return Kd(e.type._context),null;case 22:case 23:return hf(),null;case 24:return null;default:return null}}var $a=!1,rt=!1,cx=typeof WeakSet=="function"?WeakSet:Set,H=null;function Mi(t,e){var n=t.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(r){Ae(t,e,r)}else n.current=null}function $h(t,e,n){try{n()}catch(r){Ae(t,e,r)}}var xg=!1;function hx(t,e){if(Sh=kl,t=Ev(),Bd(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var i=r.anchorOffset,s=r.focusNode;r=r.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var o=0,l=-1,u=-1,h=0,f=0,p=t,m=null;t:for(;;){for(var S;p!==n||i!==0&&p.nodeType!==3||(l=o+i),p!==s||r!==0&&p.nodeType!==3||(u=o+r),p.nodeType===3&&(o+=p.nodeValue.length),(S=p.firstChild)!==null;)m=p,p=S;for(;;){if(p===t)break t;if(m===n&&++h===i&&(l=o),m===s&&++f===r&&(u=o),(S=p.nextSibling)!==null)break;p=m,m=p.parentNode}p=S}n=l===-1||u===-1?null:{start:l,end:u}}else n=null}n=n||{start:0,end:0}}else n=null;for(kh={focusedElem:t,selectionRange:n},kl=!1,H=e;H!==null;)if(e=H,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,H=t;else for(;H!==null;){e=H;try{var R=e.alternate;if(e.flags&1024)switch(e.tag){case 0:case 11:case 15:break;case 1:if(R!==null){var N=R.memoizedProps,O=R.memoizedState,I=e.stateNode,w=I.getSnapshotBeforeUpdate(e.elementType===e.type?N:$t(e.type,N),O);I.__reactInternalSnapshotBeforeUpdate=w}break;case 3:var E=e.stateNode.containerInfo;E.nodeType===1?E.textContent="":E.nodeType===9&&E.documentElement&&E.removeChild(E.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(F(163))}}catch(b){Ae(e,e.return,b)}if(t=e.sibling,t!==null){t.return=e.return,H=t;break}H=e.return}return R=xg,xg=!1,R}function ao(t,e,n){var r=e.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var i=r=r.next;do{if((i.tag&t)===t){var s=i.destroy;i.destroy=void 0,s!==void 0&&$h(e,n,s)}i=i.next}while(i!==r)}}function Iu(t,e){if(e=e.updateQueue,e=e!==null?e.lastEffect:null,e!==null){var n=e=e.next;do{if((n.tag&t)===t){var r=n.create;n.destroy=r()}n=n.next}while(n!==e)}}function Hh(t){var e=t.ref;if(e!==null){var n=t.stateNode;switch(t.tag){case 5:t=n;break;default:t=n}typeof e=="function"?e(t):e.current=t}}function y0(t){var e=t.alternate;e!==null&&(t.alternate=null,y0(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&(delete e[tn],delete e[Co],delete e[Ph],delete e[GI],delete e[KI])),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}function _0(t){return t.tag===5||t.tag===3||t.tag===4}function Ag(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||_0(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function qh(t,e,n){var r=t.tag;if(r===5||r===6)t=t.stateNode,e?n.nodeType===8?n.parentNode.insertBefore(t,e):n.insertBefore(t,e):(n.nodeType===8?(e=n.parentNode,e.insertBefore(t,n)):(e=n,e.appendChild(t)),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=Pl));else if(r!==4&&(t=t.child,t!==null))for(qh(t,e,n),t=t.sibling;t!==null;)qh(t,e,n),t=t.sibling}function Wh(t,e,n){var r=t.tag;if(r===5||r===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(r!==4&&(t=t.child,t!==null))for(Wh(t,e,n),t=t.sibling;t!==null;)Wh(t,e,n),t=t.sibling}var He=null,Ht=!1;function Wn(t,e,n){for(n=n.child;n!==null;)v0(t,e,n),n=n.sibling}function v0(t,e,n){if(rn&&typeof rn.onCommitFiberUnmount=="function")try{rn.onCommitFiberUnmount(mu,n)}catch{}switch(n.tag){case 5:rt||Mi(n,e);case 6:var r=He,i=Ht;He=null,Wn(t,e,n),He=r,Ht=i,He!==null&&(Ht?(t=He,n=n.stateNode,t.nodeType===8?t.parentNode.removeChild(n):t.removeChild(n)):He.removeChild(n.stateNode));break;case 18:He!==null&&(Ht?(t=He,n=n.stateNode,t.nodeType===8?Lc(t.parentNode,n):t.nodeType===1&&Lc(t,n),xo(t)):Lc(He,n.stateNode));break;case 4:r=He,i=Ht,He=n.stateNode.containerInfo,Ht=!0,Wn(t,e,n),He=r,Ht=i;break;case 0:case 11:case 14:case 15:if(!rt&&(r=n.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){i=r=r.next;do{var s=i,o=s.destroy;s=s.tag,o!==void 0&&(s&2||s&4)&&$h(n,e,o),i=i.next}while(i!==r)}Wn(t,e,n);break;case 1:if(!rt&&(Mi(n,e),r=n.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=n.memoizedProps,r.state=n.memoizedState,r.componentWillUnmount()}catch(l){Ae(n,e,l)}Wn(t,e,n);break;case 21:Wn(t,e,n);break;case 22:n.mode&1?(rt=(r=rt)||n.memoizedState!==null,Wn(t,e,n),rt=r):Wn(t,e,n);break;default:Wn(t,e,n)}}function Sg(t){var e=t.updateQueue;if(e!==null){t.updateQueue=null;var n=t.stateNode;n===null&&(n=t.stateNode=new cx),e.forEach(function(r){var i=wx.bind(null,t,r);n.has(r)||(n.add(r),r.then(i,i))})}}function Bt(t,e){var n=e.deletions;if(n!==null)for(var r=0;r<n.length;r++){var i=n[r];try{var s=t,o=e,l=o;e:for(;l!==null;){switch(l.tag){case 5:He=l.stateNode,Ht=!1;break e;case 3:He=l.stateNode.containerInfo,Ht=!0;break e;case 4:He=l.stateNode.containerInfo,Ht=!0;break e}l=l.return}if(He===null)throw Error(F(160));v0(s,o,i),He=null,Ht=!1;var u=i.alternate;u!==null&&(u.return=null),i.return=null}catch(h){Ae(i,e,h)}}if(e.subtreeFlags&12854)for(e=e.child;e!==null;)w0(e,t),e=e.sibling}function w0(t,e){var n=t.alternate,r=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:if(Bt(e,t),Jt(t),r&4){try{ao(3,t,t.return),Iu(3,t)}catch(N){Ae(t,t.return,N)}try{ao(5,t,t.return)}catch(N){Ae(t,t.return,N)}}break;case 1:Bt(e,t),Jt(t),r&512&&n!==null&&Mi(n,n.return);break;case 5:if(Bt(e,t),Jt(t),r&512&&n!==null&&Mi(n,n.return),t.flags&32){var i=t.stateNode;try{wo(i,"")}catch(N){Ae(t,t.return,N)}}if(r&4&&(i=t.stateNode,i!=null)){var s=t.memoizedProps,o=n!==null?n.memoizedProps:s,l=t.type,u=t.updateQueue;if(t.updateQueue=null,u!==null)try{l==="input"&&s.type==="radio"&&s.name!=null&&B_(i,s),gh(l,o);var h=gh(l,s);for(o=0;o<u.length;o+=2){var f=u[o],p=u[o+1];f==="style"?G_(i,p):f==="dangerouslySetInnerHTML"?q_(i,p):f==="children"?wo(i,p):Cd(i,f,p,h)}switch(l){case"input":hh(i,s);break;case"textarea":$_(i,s);break;case"select":var m=i._wrapperState.wasMultiple;i._wrapperState.wasMultiple=!!s.multiple;var S=s.value;S!=null?Ui(i,!!s.multiple,S,!1):m!==!!s.multiple&&(s.defaultValue!=null?Ui(i,!!s.multiple,s.defaultValue,!0):Ui(i,!!s.multiple,s.multiple?[]:"",!1))}i[Co]=s}catch(N){Ae(t,t.return,N)}}break;case 6:if(Bt(e,t),Jt(t),r&4){if(t.stateNode===null)throw Error(F(162));i=t.stateNode,s=t.memoizedProps;try{i.nodeValue=s}catch(N){Ae(t,t.return,N)}}break;case 3:if(Bt(e,t),Jt(t),r&4&&n!==null&&n.memoizedState.isDehydrated)try{xo(e.containerInfo)}catch(N){Ae(t,t.return,N)}break;case 4:Bt(e,t),Jt(t);break;case 13:Bt(e,t),Jt(t),i=t.child,i.flags&8192&&(s=i.memoizedState!==null,i.stateNode.isHidden=s,!s||i.alternate!==null&&i.alternate.memoizedState!==null||(uf=Pe())),r&4&&Sg(t);break;case 22:if(f=n!==null&&n.memoizedState!==null,t.mode&1?(rt=(h=rt)||f,Bt(e,t),rt=h):Bt(e,t),Jt(t),r&8192){if(h=t.memoizedState!==null,(t.stateNode.isHidden=h)&&!f&&t.mode&1)for(H=t,f=t.child;f!==null;){for(p=H=f;H!==null;){switch(m=H,S=m.child,m.tag){case 0:case 11:case 14:case 15:ao(4,m,m.return);break;case 1:Mi(m,m.return);var R=m.stateNode;if(typeof R.componentWillUnmount=="function"){r=m,n=m.return;try{e=r,R.props=e.memoizedProps,R.state=e.memoizedState,R.componentWillUnmount()}catch(N){Ae(r,n,N)}}break;case 5:Mi(m,m.return);break;case 22:if(m.memoizedState!==null){Rg(p);continue}}S!==null?(S.return=m,H=S):Rg(p)}f=f.sibling}e:for(f=null,p=t;;){if(p.tag===5){if(f===null){f=p;try{i=p.stateNode,h?(s=i.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none"):(l=p.stateNode,u=p.memoizedProps.style,o=u!=null&&u.hasOwnProperty("display")?u.display:null,l.style.display=W_("display",o))}catch(N){Ae(t,t.return,N)}}}else if(p.tag===6){if(f===null)try{p.stateNode.nodeValue=h?"":p.memoizedProps}catch(N){Ae(t,t.return,N)}}else if((p.tag!==22&&p.tag!==23||p.memoizedState===null||p===t)&&p.child!==null){p.child.return=p,p=p.child;continue}if(p===t)break e;for(;p.sibling===null;){if(p.return===null||p.return===t)break e;f===p&&(f=null),p=p.return}f===p&&(f=null),p.sibling.return=p.return,p=p.sibling}}break;case 19:Bt(e,t),Jt(t),r&4&&Sg(t);break;case 21:break;default:Bt(e,t),Jt(t)}}function Jt(t){var e=t.flags;if(e&2){try{e:{for(var n=t.return;n!==null;){if(_0(n)){var r=n;break e}n=n.return}throw Error(F(160))}switch(r.tag){case 5:var i=r.stateNode;r.flags&32&&(wo(i,""),r.flags&=-33);var s=Ag(t);Wh(t,s,i);break;case 3:case 4:var o=r.stateNode.containerInfo,l=Ag(t);qh(t,l,o);break;default:throw Error(F(161))}}catch(u){Ae(t,t.return,u)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function dx(t,e,n){H=t,E0(t)}function E0(t,e,n){for(var r=(t.mode&1)!==0;H!==null;){var i=H,s=i.child;if(i.tag===22&&r){var o=i.memoizedState!==null||$a;if(!o){var l=i.alternate,u=l!==null&&l.memoizedState!==null||rt;l=$a;var h=rt;if($a=o,(rt=u)&&!h)for(H=i;H!==null;)o=H,u=o.child,o.tag===22&&o.memoizedState!==null?Cg(i):u!==null?(u.return=o,H=u):Cg(i);for(;s!==null;)H=s,E0(s),s=s.sibling;H=i,$a=l,rt=h}kg(t)}else i.subtreeFlags&8772&&s!==null?(s.return=i,H=s):kg(t)}}function kg(t){for(;H!==null;){var e=H;if(e.flags&8772){var n=e.alternate;try{if(e.flags&8772)switch(e.tag){case 0:case 11:case 15:rt||Iu(5,e);break;case 1:var r=e.stateNode;if(e.flags&4&&!rt)if(n===null)r.componentDidMount();else{var i=e.elementType===e.type?n.memoizedProps:$t(e.type,n.memoizedProps);r.componentDidUpdate(i,n.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var s=e.updateQueue;s!==null&&hg(e,s,r);break;case 3:var o=e.updateQueue;if(o!==null){if(n=null,e.child!==null)switch(e.child.tag){case 5:n=e.child.stateNode;break;case 1:n=e.child.stateNode}hg(e,o,n)}break;case 5:var l=e.stateNode;if(n===null&&e.flags&4){n=l;var u=e.memoizedProps;switch(e.type){case"button":case"input":case"select":case"textarea":u.autoFocus&&n.focus();break;case"img":u.src&&(n.src=u.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(e.memoizedState===null){var h=e.alternate;if(h!==null){var f=h.memoizedState;if(f!==null){var p=f.dehydrated;p!==null&&xo(p)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(F(163))}rt||e.flags&512&&Hh(e)}catch(m){Ae(e,e.return,m)}}if(e===t){H=null;break}if(n=e.sibling,n!==null){n.return=e.return,H=n;break}H=e.return}}function Rg(t){for(;H!==null;){var e=H;if(e===t){H=null;break}var n=e.sibling;if(n!==null){n.return=e.return,H=n;break}H=e.return}}function Cg(t){for(;H!==null;){var e=H;try{switch(e.tag){case 0:case 11:case 15:var n=e.return;try{Iu(4,e)}catch(u){Ae(e,n,u)}break;case 1:var r=e.stateNode;if(typeof r.componentDidMount=="function"){var i=e.return;try{r.componentDidMount()}catch(u){Ae(e,i,u)}}var s=e.return;try{Hh(e)}catch(u){Ae(e,s,u)}break;case 5:var o=e.return;try{Hh(e)}catch(u){Ae(e,o,u)}}}catch(u){Ae(e,e.return,u)}if(e===t){H=null;break}var l=e.sibling;if(l!==null){l.return=e.return,H=l;break}H=e.return}}var fx=Math.ceil,zl=Bn.ReactCurrentDispatcher,af=Bn.ReactCurrentOwner,Mt=Bn.ReactCurrentBatchConfig,se=0,Be=null,De=null,Ge=0,It=0,ji=Pr(0),Me=0,Vo=null,si=0,xu=0,lf=0,lo=null,gt=null,uf=0,is=1/0,wn=null,Bl=!1,Gh=null,ur=null,Ha=!1,tr=null,$l=0,uo=0,Kh=null,ul=-1,cl=0;function dt(){return se&6?Pe():ul!==-1?ul:ul=Pe()}function cr(t){return t.mode&1?se&2&&Ge!==0?Ge&-Ge:XI.transition!==null?(cl===0&&(cl=sv()),cl):(t=ae,t!==0||(t=window.event,t=t===void 0?16:dv(t.type)),t):1}function Kt(t,e,n,r){if(50<uo)throw uo=0,Kh=null,Error(F(185));Ko(t,n,r),(!(se&2)||t!==Be)&&(t===Be&&(!(se&2)&&(xu|=n),Me===4&&Yn(t,Ge)),Et(t,r),n===1&&se===0&&!(e.mode&1)&&(is=Pe()+500,wu&&Nr()))}function Et(t,e){var n=t.callbackNode;XT(t,e);var r=Sl(t,t===Be?Ge:0);if(r===0)n!==null&&jm(n),t.callbackNode=null,t.callbackPriority=0;else if(e=r&-r,t.callbackPriority!==e){if(n!=null&&jm(n),e===1)t.tag===0?QI(Pg.bind(null,t)):Nv(Pg.bind(null,t)),qI(function(){!(se&6)&&Nr()}),n=null;else{switch(ov(r)){case 1:n=Od;break;case 4:n=rv;break;case 16:n=Al;break;case 536870912:n=iv;break;default:n=Al}n=C0(n,T0.bind(null,t))}t.callbackPriority=e,t.callbackNode=n}}function T0(t,e){if(ul=-1,cl=0,se&6)throw Error(F(327));var n=t.callbackNode;if(qi()&&t.callbackNode!==n)return null;var r=Sl(t,t===Be?Ge:0);if(r===0)return null;if(r&30||r&t.expiredLanes||e)e=Hl(t,r);else{e=r;var i=se;se|=2;var s=x0();(Be!==t||Ge!==e)&&(wn=null,is=Pe()+500,Zr(t,e));do try{gx();break}catch(l){I0(t,l)}while(!0);Gd(),zl.current=s,se=i,De!==null?e=0:(Be=null,Ge=0,e=Me)}if(e!==0){if(e===2&&(i=Eh(t),i!==0&&(r=i,e=Qh(t,i))),e===1)throw n=Vo,Zr(t,0),Yn(t,r),Et(t,Pe()),n;if(e===6)Yn(t,r);else{if(i=t.current.alternate,!(r&30)&&!px(i)&&(e=Hl(t,r),e===2&&(s=Eh(t),s!==0&&(r=s,e=Qh(t,s))),e===1))throw n=Vo,Zr(t,0),Yn(t,r),Et(t,Pe()),n;switch(t.finishedWork=i,t.finishedLanes=r,e){case 0:case 1:throw Error(F(345));case 2:qr(t,gt,wn);break;case 3:if(Yn(t,r),(r&130023424)===r&&(e=uf+500-Pe(),10<e)){if(Sl(t,0)!==0)break;if(i=t.suspendedLanes,(i&r)!==r){dt(),t.pingedLanes|=t.suspendedLanes&i;break}t.timeoutHandle=Ch(qr.bind(null,t,gt,wn),e);break}qr(t,gt,wn);break;case 4:if(Yn(t,r),(r&4194240)===r)break;for(e=t.eventTimes,i=-1;0<r;){var o=31-Gt(r);s=1<<o,o=e[o],o>i&&(i=o),r&=~s}if(r=i,r=Pe()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*fx(r/1960))-r,10<r){t.timeoutHandle=Ch(qr.bind(null,t,gt,wn),r);break}qr(t,gt,wn);break;case 5:qr(t,gt,wn);break;default:throw Error(F(329))}}}return Et(t,Pe()),t.callbackNode===n?T0.bind(null,t):null}function Qh(t,e){var n=lo;return t.current.memoizedState.isDehydrated&&(Zr(t,e).flags|=256),t=Hl(t,e),t!==2&&(e=gt,gt=n,e!==null&&Xh(e)),t}function Xh(t){gt===null?gt=t:gt.push.apply(gt,t)}function px(t){for(var e=t;;){if(e.flags&16384){var n=e.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var r=0;r<n.length;r++){var i=n[r],s=i.getSnapshot;i=i.value;try{if(!Xt(s(),i))return!1}catch{return!1}}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function Yn(t,e){for(e&=~lf,e&=~xu,t.suspendedLanes|=e,t.pingedLanes&=~e,t=t.expirationTimes;0<e;){var n=31-Gt(e),r=1<<n;t[n]=-1,e&=~r}}function Pg(t){if(se&6)throw Error(F(327));qi();var e=Sl(t,0);if(!(e&1))return Et(t,Pe()),null;var n=Hl(t,e);if(t.tag!==0&&n===2){var r=Eh(t);r!==0&&(e=r,n=Qh(t,r))}if(n===1)throw n=Vo,Zr(t,0),Yn(t,e),Et(t,Pe()),n;if(n===6)throw Error(F(345));return t.finishedWork=t.current.alternate,t.finishedLanes=e,qr(t,gt,wn),Et(t,Pe()),null}function cf(t,e){var n=se;se|=1;try{return t(e)}finally{se=n,se===0&&(is=Pe()+500,wu&&Nr())}}function oi(t){tr!==null&&tr.tag===0&&!(se&6)&&qi();var e=se;se|=1;var n=Mt.transition,r=ae;try{if(Mt.transition=null,ae=1,t)return t()}finally{ae=r,Mt.transition=n,se=e,!(se&6)&&Nr()}}function hf(){It=ji.current,me(ji)}function Zr(t,e){t.finishedWork=null,t.finishedLanes=0;var n=t.timeoutHandle;if(n!==-1&&(t.timeoutHandle=-1,HI(n)),De!==null)for(n=De.return;n!==null;){var r=n;switch(Hd(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&Nl();break;case 3:ns(),me(vt),me(st),Zd();break;case 5:Jd(r);break;case 4:ns();break;case 13:me(we);break;case 19:me(we);break;case 10:Kd(r.type._context);break;case 22:case 23:hf()}n=n.return}if(Be=t,De=t=hr(t.current,null),Ge=It=e,Me=0,Vo=null,lf=xu=si=0,gt=lo=null,Kr!==null){for(e=0;e<Kr.length;e++)if(n=Kr[e],r=n.interleaved,r!==null){n.interleaved=null;var i=r.next,s=n.pending;if(s!==null){var o=s.next;s.next=i,r.next=o}n.pending=r}Kr=null}return t}function I0(t,e){do{var n=De;try{if(Gd(),ol.current=Ul,Fl){for(var r=Ee.memoizedState;r!==null;){var i=r.queue;i!==null&&(i.pending=null),r=r.next}Fl=!1}if(ii=0,Ue=Le=Ee=null,oo=!1,bo=0,af.current=null,n===null||n.return===null){Me=1,Vo=e,De=null;break}e:{var s=t,o=n.return,l=n,u=e;if(e=Ge,l.flags|=32768,u!==null&&typeof u=="object"&&typeof u.then=="function"){var h=u,f=l,p=f.tag;if(!(f.mode&1)&&(p===0||p===11||p===15)){var m=f.alternate;m?(f.updateQueue=m.updateQueue,f.memoizedState=m.memoizedState,f.lanes=m.lanes):(f.updateQueue=null,f.memoizedState=null)}var S=yg(o);if(S!==null){S.flags&=-257,_g(S,o,l,s,e),S.mode&1&&gg(s,h,e),e=S,u=h;var R=e.updateQueue;if(R===null){var N=new Set;N.add(u),e.updateQueue=N}else R.add(u);break e}else{if(!(e&1)){gg(s,h,e),df();break e}u=Error(F(426))}}else if(ye&&l.mode&1){var O=yg(o);if(O!==null){!(O.flags&65536)&&(O.flags|=256),_g(O,o,l,s,e),qd(rs(u,l));break e}}s=u=rs(u,l),Me!==4&&(Me=2),lo===null?lo=[s]:lo.push(s),s=o;do{switch(s.tag){case 3:s.flags|=65536,e&=-e,s.lanes|=e;var I=o0(s,u,e);cg(s,I);break e;case 1:l=u;var w=s.type,E=s.stateNode;if(!(s.flags&128)&&(typeof w.getDerivedStateFromError=="function"||E!==null&&typeof E.componentDidCatch=="function"&&(ur===null||!ur.has(E)))){s.flags|=65536,e&=-e,s.lanes|=e;var b=a0(s,l,e);cg(s,b);break e}}s=s.return}while(s!==null)}S0(n)}catch(M){e=M,De===n&&n!==null&&(De=n=n.return);continue}break}while(!0)}function x0(){var t=zl.current;return zl.current=Ul,t===null?Ul:t}function df(){(Me===0||Me===3||Me===2)&&(Me=4),Be===null||!(si&268435455)&&!(xu&268435455)||Yn(Be,Ge)}function Hl(t,e){var n=se;se|=2;var r=x0();(Be!==t||Ge!==e)&&(wn=null,Zr(t,e));do try{mx();break}catch(i){I0(t,i)}while(!0);if(Gd(),se=n,zl.current=r,De!==null)throw Error(F(261));return Be=null,Ge=0,Me}function mx(){for(;De!==null;)A0(De)}function gx(){for(;De!==null&&!zT();)A0(De)}function A0(t){var e=R0(t.alternate,t,It);t.memoizedProps=t.pendingProps,e===null?S0(t):De=e,af.current=null}function S0(t){var e=t;do{var n=e.alternate;if(t=e.return,e.flags&32768){if(n=ux(n,e),n!==null){n.flags&=32767,De=n;return}if(t!==null)t.flags|=32768,t.subtreeFlags=0,t.deletions=null;else{Me=6,De=null;return}}else if(n=lx(n,e,It),n!==null){De=n;return}if(e=e.sibling,e!==null){De=e;return}De=e=t}while(e!==null);Me===0&&(Me=5)}function qr(t,e,n){var r=ae,i=Mt.transition;try{Mt.transition=null,ae=1,yx(t,e,n,r)}finally{Mt.transition=i,ae=r}return null}function yx(t,e,n,r){do qi();while(tr!==null);if(se&6)throw Error(F(327));n=t.finishedWork;var i=t.finishedLanes;if(n===null)return null;if(t.finishedWork=null,t.finishedLanes=0,n===t.current)throw Error(F(177));t.callbackNode=null,t.callbackPriority=0;var s=n.lanes|n.childLanes;if(YT(t,s),t===Be&&(De=Be=null,Ge=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||Ha||(Ha=!0,C0(Al,function(){return qi(),null})),s=(n.flags&15990)!==0,n.subtreeFlags&15990||s){s=Mt.transition,Mt.transition=null;var o=ae;ae=1;var l=se;se|=4,af.current=null,hx(t,n),w0(n,t),MI(kh),kl=!!Sh,kh=Sh=null,t.current=n,dx(n),BT(),se=l,ae=o,Mt.transition=s}else t.current=n;if(Ha&&(Ha=!1,tr=t,$l=i),s=t.pendingLanes,s===0&&(ur=null),qT(n.stateNode),Et(t,Pe()),e!==null)for(r=t.onRecoverableError,n=0;n<e.length;n++)i=e[n],r(i.value,{componentStack:i.stack,digest:i.digest});if(Bl)throw Bl=!1,t=Gh,Gh=null,t;return $l&1&&t.tag!==0&&qi(),s=t.pendingLanes,s&1?t===Kh?uo++:(uo=0,Kh=t):uo=0,Nr(),null}function qi(){if(tr!==null){var t=ov($l),e=Mt.transition,n=ae;try{if(Mt.transition=null,ae=16>t?16:t,tr===null)var r=!1;else{if(t=tr,tr=null,$l=0,se&6)throw Error(F(331));var i=se;for(se|=4,H=t.current;H!==null;){var s=H,o=s.child;if(H.flags&16){var l=s.deletions;if(l!==null){for(var u=0;u<l.length;u++){var h=l[u];for(H=h;H!==null;){var f=H;switch(f.tag){case 0:case 11:case 15:ao(8,f,s)}var p=f.child;if(p!==null)p.return=f,H=p;else for(;H!==null;){f=H;var m=f.sibling,S=f.return;if(y0(f),f===h){H=null;break}if(m!==null){m.return=S,H=m;break}H=S}}}var R=s.alternate;if(R!==null){var N=R.child;if(N!==null){R.child=null;do{var O=N.sibling;N.sibling=null,N=O}while(N!==null)}}H=s}}if(s.subtreeFlags&2064&&o!==null)o.return=s,H=o;else e:for(;H!==null;){if(s=H,s.flags&2048)switch(s.tag){case 0:case 11:case 15:ao(9,s,s.return)}var I=s.sibling;if(I!==null){I.return=s.return,H=I;break e}H=s.return}}var w=t.current;for(H=w;H!==null;){o=H;var E=o.child;if(o.subtreeFlags&2064&&E!==null)E.return=o,H=E;else e:for(o=w;H!==null;){if(l=H,l.flags&2048)try{switch(l.tag){case 0:case 11:case 15:Iu(9,l)}}catch(M){Ae(l,l.return,M)}if(l===o){H=null;break e}var b=l.sibling;if(b!==null){b.return=l.return,H=b;break e}H=l.return}}if(se=i,Nr(),rn&&typeof rn.onPostCommitFiberRoot=="function")try{rn.onPostCommitFiberRoot(mu,t)}catch{}r=!0}return r}finally{ae=n,Mt.transition=e}}return!1}function Ng(t,e,n){e=rs(n,e),e=o0(t,e,1),t=lr(t,e,1),e=dt(),t!==null&&(Ko(t,1,e),Et(t,e))}function Ae(t,e,n){if(t.tag===3)Ng(t,t,n);else for(;e!==null;){if(e.tag===3){Ng(e,t,n);break}else if(e.tag===1){var r=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(ur===null||!ur.has(r))){t=rs(n,t),t=a0(e,t,1),e=lr(e,t,1),t=dt(),e!==null&&(Ko(e,1,t),Et(e,t));break}}e=e.return}}function _x(t,e,n){var r=t.pingCache;r!==null&&r.delete(e),e=dt(),t.pingedLanes|=t.suspendedLanes&n,Be===t&&(Ge&n)===n&&(Me===4||Me===3&&(Ge&130023424)===Ge&&500>Pe()-uf?Zr(t,0):lf|=n),Et(t,e)}function k0(t,e){e===0&&(t.mode&1?(e=Oa,Oa<<=1,!(Oa&130023424)&&(Oa=4194304)):e=1);var n=dt();t=Vn(t,e),t!==null&&(Ko(t,e,n),Et(t,n))}function vx(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),k0(t,n)}function wx(t,e){var n=0;switch(t.tag){case 13:var r=t.stateNode,i=t.memoizedState;i!==null&&(n=i.retryLane);break;case 19:r=t.stateNode;break;default:throw Error(F(314))}r!==null&&r.delete(e),k0(t,n)}var R0;R0=function(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps||vt.current)_t=!0;else{if(!(t.lanes&n)&&!(e.flags&128))return _t=!1,ax(t,e,n);_t=!!(t.flags&131072)}else _t=!1,ye&&e.flags&1048576&&bv(e,Ol,e.index);switch(e.lanes=0,e.tag){case 2:var r=e.type;ll(t,e),t=e.pendingProps;var i=Zi(e,st.current);Hi(e,n),i=tf(null,e,r,t,i,n);var s=nf();return e.flags|=1,typeof i=="object"&&i!==null&&typeof i.render=="function"&&i.$$typeof===void 0?(e.tag=1,e.memoizedState=null,e.updateQueue=null,wt(r)?(s=!0,bl(e)):s=!1,e.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,Xd(e),i.updater=Tu,e.stateNode=i,i._reactInternals=e,Lh(e,r,t,n),e=Fh(null,e,r,!0,s,n)):(e.tag=0,ye&&s&&$d(e),ct(null,e,i,n),e=e.child),e;case 16:r=e.elementType;e:{switch(ll(t,e),t=e.pendingProps,i=r._init,r=i(r._payload),e.type=r,i=e.tag=Tx(r),t=$t(r,t),i){case 0:e=jh(null,e,r,t,n);break e;case 1:e=Eg(null,e,r,t,n);break e;case 11:e=vg(null,e,r,t,n);break e;case 14:e=wg(null,e,r,$t(r.type,t),n);break e}throw Error(F(306,r,""))}return e;case 0:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:$t(r,i),jh(t,e,r,i,n);case 1:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:$t(r,i),Eg(t,e,r,i,n);case 3:e:{if(h0(e),t===null)throw Error(F(387));r=e.pendingProps,s=e.memoizedState,i=s.element,jv(t,e),Ml(e,r,null,n);var o=e.memoizedState;if(r=o.element,s.isDehydrated)if(s={element:r,isDehydrated:!1,cache:o.cache,pendingSuspenseBoundaries:o.pendingSuspenseBoundaries,transitions:o.transitions},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){i=rs(Error(F(423)),e),e=Tg(t,e,r,n,i);break e}else if(r!==i){i=rs(Error(F(424)),e),e=Tg(t,e,r,n,i);break e}else for(At=ar(e.stateNode.containerInfo.firstChild),Rt=e,ye=!0,qt=null,n=Lv(e,null,r,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(es(),r===i){e=Ln(t,e,n);break e}ct(t,e,r,n)}e=e.child}return e;case 5:return Fv(e),t===null&&Dh(e),r=e.type,i=e.pendingProps,s=t!==null?t.memoizedProps:null,o=i.children,Rh(r,i)?o=null:s!==null&&Rh(r,s)&&(e.flags|=32),c0(t,e),ct(t,e,o,n),e.child;case 6:return t===null&&Dh(e),null;case 13:return d0(t,e,n);case 4:return Yd(e,e.stateNode.containerInfo),r=e.pendingProps,t===null?e.child=ts(e,null,r,n):ct(t,e,r,n),e.child;case 11:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:$t(r,i),vg(t,e,r,i,n);case 7:return ct(t,e,e.pendingProps,n),e.child;case 8:return ct(t,e,e.pendingProps.children,n),e.child;case 12:return ct(t,e,e.pendingProps.children,n),e.child;case 10:e:{if(r=e.type._context,i=e.pendingProps,s=e.memoizedProps,o=i.value,de(Vl,r._currentValue),r._currentValue=o,s!==null)if(Xt(s.value,o)){if(s.children===i.children&&!vt.current){e=Ln(t,e,n);break e}}else for(s=e.child,s!==null&&(s.return=e);s!==null;){var l=s.dependencies;if(l!==null){o=s.child;for(var u=l.firstContext;u!==null;){if(u.context===r){if(s.tag===1){u=Cn(-1,n&-n),u.tag=2;var h=s.updateQueue;if(h!==null){h=h.shared;var f=h.pending;f===null?u.next=u:(u.next=f.next,f.next=u),h.pending=u}}s.lanes|=n,u=s.alternate,u!==null&&(u.lanes|=n),Oh(s.return,n,e),l.lanes|=n;break}u=u.next}}else if(s.tag===10)o=s.type===e.type?null:s.child;else if(s.tag===18){if(o=s.return,o===null)throw Error(F(341));o.lanes|=n,l=o.alternate,l!==null&&(l.lanes|=n),Oh(o,n,e),o=s.sibling}else o=s.child;if(o!==null)o.return=s;else for(o=s;o!==null;){if(o===e){o=null;break}if(s=o.sibling,s!==null){s.return=o.return,o=s;break}o=o.return}s=o}ct(t,e,i.children,n),e=e.child}return e;case 9:return i=e.type,r=e.pendingProps.children,Hi(e,n),i=jt(i),r=r(i),e.flags|=1,ct(t,e,r,n),e.child;case 14:return r=e.type,i=$t(r,e.pendingProps),i=$t(r.type,i),wg(t,e,r,i,n);case 15:return l0(t,e,e.type,e.pendingProps,n);case 17:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:$t(r,i),ll(t,e),e.tag=1,wt(r)?(t=!0,bl(e)):t=!1,Hi(e,n),s0(e,r,i),Lh(e,r,i,n),Fh(null,e,r,!0,t,n);case 19:return f0(t,e,n);case 22:return u0(t,e,n)}throw Error(F(156,e.tag))};function C0(t,e){return nv(t,e)}function Ex(t,e,n,r){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Lt(t,e,n,r){return new Ex(t,e,n,r)}function ff(t){return t=t.prototype,!(!t||!t.isReactComponent)}function Tx(t){if(typeof t=="function")return ff(t)?1:0;if(t!=null){if(t=t.$$typeof,t===Nd)return 11;if(t===bd)return 14}return 2}function hr(t,e){var n=t.alternate;return n===null?(n=Lt(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&14680064,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n}function hl(t,e,n,r,i,s){var o=2;if(r=t,typeof t=="function")ff(t)&&(o=1);else if(typeof t=="string")o=5;else e:switch(t){case Ri:return ei(n.children,i,s,e);case Pd:o=8,i|=8;break;case oh:return t=Lt(12,n,e,i|2),t.elementType=oh,t.lanes=s,t;case ah:return t=Lt(13,n,e,i),t.elementType=ah,t.lanes=s,t;case lh:return t=Lt(19,n,e,i),t.elementType=lh,t.lanes=s,t;case F_:return Au(n,i,s,e);default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case M_:o=10;break e;case j_:o=9;break e;case Nd:o=11;break e;case bd:o=14;break e;case Kn:o=16,r=null;break e}throw Error(F(130,t==null?t:typeof t,""))}return e=Lt(o,n,e,i),e.elementType=t,e.type=r,e.lanes=s,e}function ei(t,e,n,r){return t=Lt(7,t,r,e),t.lanes=n,t}function Au(t,e,n,r){return t=Lt(22,t,r,e),t.elementType=F_,t.lanes=n,t.stateNode={isHidden:!1},t}function Hc(t,e,n){return t=Lt(6,t,null,e),t.lanes=n,t}function qc(t,e,n){return e=Lt(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}function Ix(t,e,n,r,i){this.tag=e,this.containerInfo=t,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Ac(0),this.expirationTimes=Ac(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Ac(0),this.identifierPrefix=r,this.onRecoverableError=i,this.mutableSourceEagerHydrationData=null}function pf(t,e,n,r,i,s,o,l,u){return t=new Ix(t,e,n,l,u),e===1?(e=1,s===!0&&(e|=8)):e=0,s=Lt(3,null,null,e),t.current=s,s.stateNode=t,s.memoizedState={element:r,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},Xd(s),t}function xx(t,e,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:ki,key:r==null?null:""+r,children:t,containerInfo:e,implementation:n}}function P0(t){if(!t)return vr;t=t._reactInternals;e:{if(pi(t)!==t||t.tag!==1)throw Error(F(170));var e=t;do{switch(e.tag){case 3:e=e.stateNode.context;break e;case 1:if(wt(e.type)){e=e.stateNode.__reactInternalMemoizedMergedChildContext;break e}}e=e.return}while(e!==null);throw Error(F(171))}if(t.tag===1){var n=t.type;if(wt(n))return Pv(t,n,e)}return e}function N0(t,e,n,r,i,s,o,l,u){return t=pf(n,r,!0,t,i,s,o,l,u),t.context=P0(null),n=t.current,r=dt(),i=cr(n),s=Cn(r,i),s.callback=e??null,lr(n,s,i),t.current.lanes=i,Ko(t,i,r),Et(t,r),t}function Su(t,e,n,r){var i=e.current,s=dt(),o=cr(i);return n=P0(n),e.context===null?e.context=n:e.pendingContext=n,e=Cn(s,o),e.payload={element:t},r=r===void 0?null:r,r!==null&&(e.callback=r),t=lr(i,e,o),t!==null&&(Kt(t,i,o,s),sl(t,i,o)),o}function ql(t){if(t=t.current,!t.child)return null;switch(t.child.tag){case 5:return t.child.stateNode;default:return t.child.stateNode}}function bg(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function mf(t,e){bg(t,e),(t=t.alternate)&&bg(t,e)}function Ax(){return null}var b0=typeof reportError=="function"?reportError:function(t){console.error(t)};function gf(t){this._internalRoot=t}ku.prototype.render=gf.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(F(409));Su(t,e,null,null)};ku.prototype.unmount=gf.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;oi(function(){Su(null,t,null,null)}),e[On]=null}};function ku(t){this._internalRoot=t}ku.prototype.unstable_scheduleHydration=function(t){if(t){var e=uv();t={blockedOn:null,target:t,priority:e};for(var n=0;n<Xn.length&&e!==0&&e<Xn[n].priority;n++);Xn.splice(n,0,t),n===0&&hv(t)}};function yf(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function Ru(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11&&(t.nodeType!==8||t.nodeValue!==" react-mount-point-unstable "))}function Dg(){}function Sx(t,e,n,r,i){if(i){if(typeof r=="function"){var s=r;r=function(){var h=ql(o);s.call(h)}}var o=N0(e,r,t,0,null,!1,!1,"",Dg);return t._reactRootContainer=o,t[On]=o.current,ko(t.nodeType===8?t.parentNode:t),oi(),o}for(;i=t.lastChild;)t.removeChild(i);if(typeof r=="function"){var l=r;r=function(){var h=ql(u);l.call(h)}}var u=pf(t,0,!1,null,null,!1,!1,"",Dg);return t._reactRootContainer=u,t[On]=u.current,ko(t.nodeType===8?t.parentNode:t),oi(function(){Su(e,u,n,r)}),u}function Cu(t,e,n,r,i){var s=n._reactRootContainer;if(s){var o=s;if(typeof i=="function"){var l=i;i=function(){var u=ql(o);l.call(u)}}Su(e,o,t,i)}else o=Sx(n,e,t,i,r);return ql(o)}av=function(t){switch(t.tag){case 3:var e=t.stateNode;if(e.current.memoizedState.isDehydrated){var n=Ws(e.pendingLanes);n!==0&&(Vd(e,n|1),Et(e,Pe()),!(se&6)&&(is=Pe()+500,Nr()))}break;case 13:oi(function(){var r=Vn(t,1);if(r!==null){var i=dt();Kt(r,t,1,i)}}),mf(t,1)}};Ld=function(t){if(t.tag===13){var e=Vn(t,134217728);if(e!==null){var n=dt();Kt(e,t,134217728,n)}mf(t,134217728)}};lv=function(t){if(t.tag===13){var e=cr(t),n=Vn(t,e);if(n!==null){var r=dt();Kt(n,t,e,r)}mf(t,e)}};uv=function(){return ae};cv=function(t,e){var n=ae;try{return ae=t,e()}finally{ae=n}};_h=function(t,e,n){switch(e){case"input":if(hh(t,n),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+e)+'][type="radio"]'),e=0;e<n.length;e++){var r=n[e];if(r!==t&&r.form===t.form){var i=vu(r);if(!i)throw Error(F(90));z_(r),hh(r,i)}}}break;case"textarea":$_(t,n);break;case"select":e=n.value,e!=null&&Ui(t,!!n.multiple,e,!1)}};X_=cf;Y_=oi;var kx={usingClientEntryPoint:!1,Events:[Xo,bi,vu,K_,Q_,cf]},Bs={findFiberByHostInstance:Gr,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},Rx={bundleType:Bs.bundleType,version:Bs.version,rendererPackageName:Bs.rendererPackageName,rendererConfig:Bs.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:Bn.ReactCurrentDispatcher,findHostInstanceByFiber:function(t){return t=ev(t),t===null?null:t.stateNode},findFiberByHostInstance:Bs.findFiberByHostInstance||Ax,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var qa=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!qa.isDisabled&&qa.supportsFiber)try{mu=qa.inject(Rx),rn=qa}catch{}}Nt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=kx;Nt.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!yf(e))throw Error(F(200));return xx(t,e,null,n)};Nt.createRoot=function(t,e){if(!yf(t))throw Error(F(299));var n=!1,r="",i=b0;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(r=e.identifierPrefix),e.onRecoverableError!==void 0&&(i=e.onRecoverableError)),e=pf(t,1,!1,null,null,n,!1,r,i),t[On]=e.current,ko(t.nodeType===8?t.parentNode:t),new gf(e)};Nt.findDOMNode=function(t){if(t==null)return null;if(t.nodeType===1)return t;var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(F(188)):(t=Object.keys(t).join(","),Error(F(268,t)));return t=ev(e),t=t===null?null:t.stateNode,t};Nt.flushSync=function(t){return oi(t)};Nt.hydrate=function(t,e,n){if(!Ru(e))throw Error(F(200));return Cu(null,t,e,!0,n)};Nt.hydrateRoot=function(t,e,n){if(!yf(t))throw Error(F(405));var r=n!=null&&n.hydratedSources||null,i=!1,s="",o=b0;if(n!=null&&(n.unstable_strictMode===!0&&(i=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onRecoverableError!==void 0&&(o=n.onRecoverableError)),e=N0(e,null,t,1,n??null,i,!1,s,o),t[On]=e.current,ko(t),r)for(t=0;t<r.length;t++)n=r[t],i=n._getVersion,i=i(n._source),e.mutableSourceEagerHydrationData==null?e.mutableSourceEagerHydrationData=[n,i]:e.mutableSourceEagerHydrationData.push(n,i);return new ku(e)};Nt.render=function(t,e,n){if(!Ru(e))throw Error(F(200));return Cu(null,t,e,!1,n)};Nt.unmountComponentAtNode=function(t){if(!Ru(t))throw Error(F(40));return t._reactRootContainer?(oi(function(){Cu(null,null,t,!1,function(){t._reactRootContainer=null,t[On]=null})}),!0):!1};Nt.unstable_batchedUpdates=cf;Nt.unstable_renderSubtreeIntoContainer=function(t,e,n,r){if(!Ru(n))throw Error(F(200));if(t==null||t._reactInternals===void 0)throw Error(F(38));return Cu(t,e,n,!1,r)};Nt.version="18.3.1-next-f1338f8080-20240426";function D0(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(D0)}catch(t){console.error(t)}}D0(),D_.exports=Nt;var Cx=D_.exports,Og=Cx;ih.createRoot=Og.createRoot,ih.hydrateRoot=Og.hydrateRoot;const Px=()=>{};var Vg={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const O0=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let i=t.charCodeAt(r);i<128?e[n++]=i:i<2048?(e[n++]=i>>6|192,e[n++]=i&63|128):(i&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=i>>18|240,e[n++]=i>>12&63|128,e[n++]=i>>6&63|128,e[n++]=i&63|128):(e[n++]=i>>12|224,e[n++]=i>>6&63|128,e[n++]=i&63|128)}return e},Nx=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const i=t[n++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=t[n++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=t[n++],o=t[n++],l=t[n++],u=((i&7)<<18|(s&63)<<12|(o&63)<<6|l&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{const s=t[n++],o=t[n++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|o&63)}}return e.join("")},V0={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<t.length;i+=3){const s=t[i],o=i+1<t.length,l=o?t[i+1]:0,u=i+2<t.length,h=u?t[i+2]:0,f=s>>2,p=(s&3)<<4|l>>4;let m=(l&15)<<2|h>>6,S=h&63;u||(S=64,o||(m=64)),r.push(n[f],n[p],n[m],n[S])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(O0(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):Nx(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<t.length;){const s=n[t.charAt(i++)],l=i<t.length?n[t.charAt(i)]:0;++i;const h=i<t.length?n[t.charAt(i)]:64;++i;const p=i<t.length?n[t.charAt(i)]:64;if(++i,s==null||l==null||h==null||p==null)throw new bx;const m=s<<2|l>>4;if(r.push(m),h!==64){const S=l<<4&240|h>>2;if(r.push(S),p!==64){const R=h<<6&192|p;r.push(R)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class bx extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Dx=function(t){const e=O0(t);return V0.encodeByteArray(e,!0)},Wl=function(t){return Dx(t).replace(/\./g,"")},L0=function(t){try{return V0.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ox(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vx=()=>Ox().__FIREBASE_DEFAULTS__,Lx=()=>{if(typeof process>"u"||typeof Vg>"u")return;const t=Vg.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},Mx=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&L0(t[1]);return e&&JSON.parse(e)},Pu=()=>{try{return Px()||Vx()||Lx()||Mx()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},M0=t=>{var e,n;return(n=(e=Pu())===null||e===void 0?void 0:e.emulatorHosts)===null||n===void 0?void 0:n[t]},j0=t=>{const e=M0(t);if(!e)return;const n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),r]:[e.substring(0,n),r]},F0=()=>{var t;return(t=Pu())===null||t===void 0?void 0:t.config},U0=t=>{var e;return(e=Pu())===null||e===void 0?void 0:e[`_${t}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jx{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function br(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function _f(t){return(await fetch(t,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function z0(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n={alg:"none",type:"JWT"},r=e||"demo-project",i=t.iat||0,s=t.sub||t.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}}},t);return[Wl(JSON.stringify(n)),Wl(JSON.stringify(o)),""].join(".")}const co={};function Fx(){const t={prod:[],emulator:[]};for(const e of Object.keys(co))co[e]?t.emulator.push(e):t.prod.push(e);return t}function Ux(t){let e=document.getElementById(t),n=!1;return e||(e=document.createElement("div"),e.setAttribute("id",t),n=!0),{created:n,element:e}}let Lg=!1;function vf(t,e){if(typeof window>"u"||typeof document>"u"||!br(window.location.host)||co[t]===e||co[t]||Lg)return;co[t]=e;function n(m){return`__firebase__banner__${m}`}const r="__firebase__banner",s=Fx().prod.length>0;function o(){const m=document.getElementById(r);m&&m.remove()}function l(m){m.style.display="flex",m.style.background="#7faaf0",m.style.position="fixed",m.style.bottom="5px",m.style.left="5px",m.style.padding=".5em",m.style.borderRadius="5px",m.style.alignItems="center"}function u(m,S){m.setAttribute("width","24"),m.setAttribute("id",S),m.setAttribute("height","24"),m.setAttribute("viewBox","0 0 24 24"),m.setAttribute("fill","none"),m.style.marginLeft="-6px"}function h(){const m=document.createElement("span");return m.style.cursor="pointer",m.style.marginLeft="16px",m.style.fontSize="24px",m.innerHTML=" &times;",m.onclick=()=>{Lg=!0,o()},m}function f(m,S){m.setAttribute("id",S),m.innerText="Learn more",m.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",m.setAttribute("target","__blank"),m.style.paddingLeft="5px",m.style.textDecoration="underline"}function p(){const m=Ux(r),S=n("text"),R=document.getElementById(S)||document.createElement("span"),N=n("learnmore"),O=document.getElementById(N)||document.createElement("a"),I=n("preprendIcon"),w=document.getElementById(I)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(m.created){const E=m.element;l(E),f(O,N);const b=h();u(w,I),E.append(w,R,O,b),document.body.appendChild(E)}s?(R.innerText="Preview backend disconnected.",w.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(w.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,R.innerText="Preview backend running in this workspace."),R.setAttribute("id",S)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",p):p()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ot(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function zx(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(ot())}function Bx(){var t;const e=(t=Pu())===null||t===void 0?void 0:t.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function $x(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Hx(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function qx(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Wx(){const t=ot();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function Gx(){return!Bx()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Kx(){try{return typeof indexedDB=="object"}catch{return!1}}function Qx(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},i.onupgradeneeded=()=>{n=!1},i.onerror=()=>{var s;e(((s=i.error)===null||s===void 0?void 0:s.message)||"")}}catch(n){e(n)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xx="FirebaseError";class dn extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=Xx,Object.setPrototypeOf(this,dn.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Jo.prototype.create)}}class Jo{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},i=`${this.service}/${e}`,s=this.errors[e],o=s?Yx(s,r):"Error",l=`${this.serviceName}: ${o} (${i}).`;return new dn(i,l,r)}}function Yx(t,e){return t.replace(Jx,(n,r)=>{const i=e[r];return i!=null?String(i):`<${r}?>`})}const Jx=/\{\$([^}]+)}/g;function Zx(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function ai(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const i of n){if(!r.includes(i))return!1;const s=t[i],o=e[i];if(Mg(s)&&Mg(o)){if(!ai(s,o))return!1}else if(s!==o)return!1}for(const i of r)if(!n.includes(i))return!1;return!0}function Mg(t){return t!==null&&typeof t=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zo(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function Ks(t){const e={};return t.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[i,s]=r.split("=");e[decodeURIComponent(i)]=decodeURIComponent(s)}}),e}function Qs(t){const e=t.indexOf("?");if(!e)return"";const n=t.indexOf("#",e);return t.substring(e,n>0?n:void 0)}function eA(t,e){const n=new tA(t,e);return n.subscribe.bind(n)}class tA{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let i;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");nA(e,["next","error","complete"])?i=e:i={next:e,error:n,complete:r},i.next===void 0&&(i.next=Wc),i.error===void 0&&(i.error=Wc),i.complete===void 0&&(i.complete=Wc);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function nA(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function Wc(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ge(t){return t&&t._delegate?t._delegate:t}class wr{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wr="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rA{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new jx;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:n});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(s){if(i)return null;throw s}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(sA(e))try{this.getOrInitializeService({instanceIdentifier:Wr})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(n);try{const s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch{}}}}clearInstance(e=Wr){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Wr){return this.instances.has(e)}getOptions(e=Wr){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[s,o]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(s);r===l&&o.resolve(i)}return i}onInit(e,n){var r;const i=this.normalizeInstanceIdentifier(n),s=(r=this.onInitCallbacks.get(i))!==null&&r!==void 0?r:new Set;s.add(e),this.onInitCallbacks.set(i,s);const o=this.instances.get(i);return o&&e(o,i),()=>{s.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const i of r)try{i(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:iA(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Wr){return this.component?this.component.multipleInstances?e:Wr:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function iA(t){return t===Wr?void 0:t}function sA(t){return t.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oA{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new rA(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var te;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(te||(te={}));const aA={debug:te.DEBUG,verbose:te.VERBOSE,info:te.INFO,warn:te.WARN,error:te.ERROR,silent:te.SILENT},lA=te.INFO,uA={[te.DEBUG]:"log",[te.VERBOSE]:"log",[te.INFO]:"info",[te.WARN]:"warn",[te.ERROR]:"error"},cA=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),i=uA[e];if(i)console[i](`[${r}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class wf{constructor(e){this.name=e,this._logLevel=lA,this._logHandler=cA,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in te))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?aA[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,te.DEBUG,...e),this._logHandler(this,te.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,te.VERBOSE,...e),this._logHandler(this,te.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,te.INFO,...e),this._logHandler(this,te.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,te.WARN,...e),this._logHandler(this,te.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,te.ERROR,...e),this._logHandler(this,te.ERROR,...e)}}const hA=(t,e)=>e.some(n=>t instanceof n);let jg,Fg;function dA(){return jg||(jg=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function fA(){return Fg||(Fg=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const B0=new WeakMap,Yh=new WeakMap,$0=new WeakMap,Gc=new WeakMap,Ef=new WeakMap;function pA(t){const e=new Promise((n,r)=>{const i=()=>{t.removeEventListener("success",s),t.removeEventListener("error",o)},s=()=>{n(dr(t.result)),i()},o=()=>{r(t.error),i()};t.addEventListener("success",s),t.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&B0.set(n,t)}).catch(()=>{}),Ef.set(e,t),e}function mA(t){if(Yh.has(t))return;const e=new Promise((n,r)=>{const i=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",o),t.removeEventListener("abort",o)},s=()=>{n(),i()},o=()=>{r(t.error||new DOMException("AbortError","AbortError")),i()};t.addEventListener("complete",s),t.addEventListener("error",o),t.addEventListener("abort",o)});Yh.set(t,e)}let Jh={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return Yh.get(t);if(e==="objectStoreNames")return t.objectStoreNames||$0.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return dr(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function gA(t){Jh=t(Jh)}function yA(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(Kc(this),e,...n);return $0.set(r,e.sort?e.sort():[e]),dr(r)}:fA().includes(t)?function(...e){return t.apply(Kc(this),e),dr(B0.get(this))}:function(...e){return dr(t.apply(Kc(this),e))}}function _A(t){return typeof t=="function"?yA(t):(t instanceof IDBTransaction&&mA(t),hA(t,dA())?new Proxy(t,Jh):t)}function dr(t){if(t instanceof IDBRequest)return pA(t);if(Gc.has(t))return Gc.get(t);const e=_A(t);return e!==t&&(Gc.set(t,e),Ef.set(e,t)),e}const Kc=t=>Ef.get(t);function vA(t,e,{blocked:n,upgrade:r,blocking:i,terminated:s}={}){const o=indexedDB.open(t,e),l=dr(o);return r&&o.addEventListener("upgradeneeded",u=>{r(dr(o.result),u.oldVersion,u.newVersion,dr(o.transaction),u)}),n&&o.addEventListener("blocked",u=>n(u.oldVersion,u.newVersion,u)),l.then(u=>{s&&u.addEventListener("close",()=>s()),i&&u.addEventListener("versionchange",h=>i(h.oldVersion,h.newVersion,h))}).catch(()=>{}),l}const wA=["get","getKey","getAll","getAllKeys","count"],EA=["put","add","delete","clear"],Qc=new Map;function Ug(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(Qc.get(e))return Qc.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,i=EA.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(i||wA.includes(n)))return;const s=async function(o,...l){const u=this.transaction(o,i?"readwrite":"readonly");let h=u.store;return r&&(h=h.index(l.shift())),(await Promise.all([h[n](...l),i&&u.done]))[0]};return Qc.set(e,s),s}gA(t=>({...t,get:(e,n,r)=>Ug(e,n)||t.get(e,n,r),has:(e,n)=>!!Ug(e,n)||t.has(e,n)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class TA{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(IA(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function IA(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Zh="@firebase/app",zg="0.13.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mn=new wf("@firebase/app"),xA="@firebase/app-compat",AA="@firebase/analytics-compat",SA="@firebase/analytics",kA="@firebase/app-check-compat",RA="@firebase/app-check",CA="@firebase/auth",PA="@firebase/auth-compat",NA="@firebase/database",bA="@firebase/data-connect",DA="@firebase/database-compat",OA="@firebase/functions",VA="@firebase/functions-compat",LA="@firebase/installations",MA="@firebase/installations-compat",jA="@firebase/messaging",FA="@firebase/messaging-compat",UA="@firebase/performance",zA="@firebase/performance-compat",BA="@firebase/remote-config",$A="@firebase/remote-config-compat",HA="@firebase/storage",qA="@firebase/storage-compat",WA="@firebase/firestore",GA="@firebase/ai",KA="@firebase/firestore-compat",QA="firebase",XA="11.10.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ed="[DEFAULT]",YA={[Zh]:"fire-core",[xA]:"fire-core-compat",[SA]:"fire-analytics",[AA]:"fire-analytics-compat",[RA]:"fire-app-check",[kA]:"fire-app-check-compat",[CA]:"fire-auth",[PA]:"fire-auth-compat",[NA]:"fire-rtdb",[bA]:"fire-data-connect",[DA]:"fire-rtdb-compat",[OA]:"fire-fn",[VA]:"fire-fn-compat",[LA]:"fire-iid",[MA]:"fire-iid-compat",[jA]:"fire-fcm",[FA]:"fire-fcm-compat",[UA]:"fire-perf",[zA]:"fire-perf-compat",[BA]:"fire-rc",[$A]:"fire-rc-compat",[HA]:"fire-gcs",[qA]:"fire-gcs-compat",[WA]:"fire-fst",[KA]:"fire-fst-compat",[GA]:"fire-vertex","fire-js":"fire-js",[QA]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gl=new Map,JA=new Map,td=new Map;function Bg(t,e){try{t.container.addComponent(e)}catch(n){Mn.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function li(t){const e=t.name;if(td.has(e))return Mn.debug(`There were multiple attempts to register component ${e}.`),!1;td.set(e,t);for(const n of Gl.values())Bg(n,t);for(const n of JA.values())Bg(n,t);return!0}function Nu(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function yt(t){return t==null?!1:t.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ZA={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},fr=new Jo("app","Firebase",ZA);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eS{constructor(e,n,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new wr("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw fr.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mi=XA;function H0(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r=Object.assign({name:ed,automaticDataCollectionEnabled:!0},e),i=r.name;if(typeof i!="string"||!i)throw fr.create("bad-app-name",{appName:String(i)});if(n||(n=F0()),!n)throw fr.create("no-options");const s=Gl.get(i);if(s){if(ai(n,s.options)&&ai(r,s.config))return s;throw fr.create("duplicate-app",{appName:i})}const o=new oA(i);for(const u of td.values())o.addComponent(u);const l=new eS(n,r,o);return Gl.set(i,l),l}function Tf(t=ed){const e=Gl.get(t);if(!e&&t===ed&&F0())return H0();if(!e)throw fr.create("no-app",{appName:t});return e}function on(t,e,n){var r;let i=(r=YA[t])!==null&&r!==void 0?r:t;n&&(i+=`-${n}`);const s=i.match(/\s|\//),o=e.match(/\s|\//);if(s||o){const l=[`Unable to register library "${i}" with version "${e}":`];s&&l.push(`library name "${i}" contains illegal characters (whitespace or "/")`),s&&o&&l.push("and"),o&&l.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Mn.warn(l.join(" "));return}li(new wr(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tS="firebase-heartbeat-database",nS=1,Lo="firebase-heartbeat-store";let Xc=null;function q0(){return Xc||(Xc=vA(tS,nS,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(Lo)}catch(n){console.warn(n)}}}}).catch(t=>{throw fr.create("idb-open",{originalErrorMessage:t.message})})),Xc}async function rS(t){try{const n=(await q0()).transaction(Lo),r=await n.objectStore(Lo).get(W0(t));return await n.done,r}catch(e){if(e instanceof dn)Mn.warn(e.message);else{const n=fr.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Mn.warn(n.message)}}}async function $g(t,e){try{const r=(await q0()).transaction(Lo,"readwrite");await r.objectStore(Lo).put(e,W0(t)),await r.done}catch(n){if(n instanceof dn)Mn.warn(n.message);else{const r=fr.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});Mn.warn(r.message)}}}function W0(t){return`${t.name}!${t.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iS=1024,sS=30;class oS{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new lS(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=Hg();if(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats.length>sS){const o=uS(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){Mn.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=Hg(),{heartbeatsToSend:r,unsentEntries:i}=aS(this._heartbeatsCache.heartbeats),s=Wl(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(n){return Mn.warn(n),""}}}function Hg(){return new Date().toISOString().substring(0,10)}function aS(t,e=iS){const n=[];let r=t.slice();for(const i of t){const s=n.find(o=>o.agent===i.agent);if(s){if(s.dates.push(i.date),qg(n)>e){s.dates.pop();break}}else if(n.push({agent:i.agent,dates:[i.date]}),qg(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class lS{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Kx()?Qx().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await rS(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const i=await this.read();return $g(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const i=await this.read();return $g(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}}function qg(t){return Wl(JSON.stringify({version:2,heartbeats:t})).length}function uS(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let r=1;r<t.length;r++)t[r].date<n&&(n=t[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cS(t){li(new wr("platform-logger",e=>new TA(e),"PRIVATE")),li(new wr("heartbeat",e=>new oS(e),"PRIVATE")),on(Zh,zg,t),on(Zh,zg,"esm2017"),on("fire-js","")}cS("");var hS="firebase",dS="11.10.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */on(hS,dS,"app");var Wg=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var pr,G0;(function(){var t;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(v,_){function T(){}T.prototype=_.prototype,v.D=_.prototype,v.prototype=new T,v.prototype.constructor=v,v.C=function(x,k,C){for(var A=Array(arguments.length-2),Dt=2;Dt<arguments.length;Dt++)A[Dt-2]=arguments[Dt];return _.prototype[k].apply(x,A)}}function n(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,n),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(v,_,T){T||(T=0);var x=Array(16);if(typeof _=="string")for(var k=0;16>k;++k)x[k]=_.charCodeAt(T++)|_.charCodeAt(T++)<<8|_.charCodeAt(T++)<<16|_.charCodeAt(T++)<<24;else for(k=0;16>k;++k)x[k]=_[T++]|_[T++]<<8|_[T++]<<16|_[T++]<<24;_=v.g[0],T=v.g[1],k=v.g[2];var C=v.g[3],A=_+(C^T&(k^C))+x[0]+3614090360&4294967295;_=T+(A<<7&4294967295|A>>>25),A=C+(k^_&(T^k))+x[1]+3905402710&4294967295,C=_+(A<<12&4294967295|A>>>20),A=k+(T^C&(_^T))+x[2]+606105819&4294967295,k=C+(A<<17&4294967295|A>>>15),A=T+(_^k&(C^_))+x[3]+3250441966&4294967295,T=k+(A<<22&4294967295|A>>>10),A=_+(C^T&(k^C))+x[4]+4118548399&4294967295,_=T+(A<<7&4294967295|A>>>25),A=C+(k^_&(T^k))+x[5]+1200080426&4294967295,C=_+(A<<12&4294967295|A>>>20),A=k+(T^C&(_^T))+x[6]+2821735955&4294967295,k=C+(A<<17&4294967295|A>>>15),A=T+(_^k&(C^_))+x[7]+4249261313&4294967295,T=k+(A<<22&4294967295|A>>>10),A=_+(C^T&(k^C))+x[8]+1770035416&4294967295,_=T+(A<<7&4294967295|A>>>25),A=C+(k^_&(T^k))+x[9]+2336552879&4294967295,C=_+(A<<12&4294967295|A>>>20),A=k+(T^C&(_^T))+x[10]+4294925233&4294967295,k=C+(A<<17&4294967295|A>>>15),A=T+(_^k&(C^_))+x[11]+2304563134&4294967295,T=k+(A<<22&4294967295|A>>>10),A=_+(C^T&(k^C))+x[12]+1804603682&4294967295,_=T+(A<<7&4294967295|A>>>25),A=C+(k^_&(T^k))+x[13]+4254626195&4294967295,C=_+(A<<12&4294967295|A>>>20),A=k+(T^C&(_^T))+x[14]+2792965006&4294967295,k=C+(A<<17&4294967295|A>>>15),A=T+(_^k&(C^_))+x[15]+1236535329&4294967295,T=k+(A<<22&4294967295|A>>>10),A=_+(k^C&(T^k))+x[1]+4129170786&4294967295,_=T+(A<<5&4294967295|A>>>27),A=C+(T^k&(_^T))+x[6]+3225465664&4294967295,C=_+(A<<9&4294967295|A>>>23),A=k+(_^T&(C^_))+x[11]+643717713&4294967295,k=C+(A<<14&4294967295|A>>>18),A=T+(C^_&(k^C))+x[0]+3921069994&4294967295,T=k+(A<<20&4294967295|A>>>12),A=_+(k^C&(T^k))+x[5]+3593408605&4294967295,_=T+(A<<5&4294967295|A>>>27),A=C+(T^k&(_^T))+x[10]+38016083&4294967295,C=_+(A<<9&4294967295|A>>>23),A=k+(_^T&(C^_))+x[15]+3634488961&4294967295,k=C+(A<<14&4294967295|A>>>18),A=T+(C^_&(k^C))+x[4]+3889429448&4294967295,T=k+(A<<20&4294967295|A>>>12),A=_+(k^C&(T^k))+x[9]+568446438&4294967295,_=T+(A<<5&4294967295|A>>>27),A=C+(T^k&(_^T))+x[14]+3275163606&4294967295,C=_+(A<<9&4294967295|A>>>23),A=k+(_^T&(C^_))+x[3]+4107603335&4294967295,k=C+(A<<14&4294967295|A>>>18),A=T+(C^_&(k^C))+x[8]+1163531501&4294967295,T=k+(A<<20&4294967295|A>>>12),A=_+(k^C&(T^k))+x[13]+2850285829&4294967295,_=T+(A<<5&4294967295|A>>>27),A=C+(T^k&(_^T))+x[2]+4243563512&4294967295,C=_+(A<<9&4294967295|A>>>23),A=k+(_^T&(C^_))+x[7]+1735328473&4294967295,k=C+(A<<14&4294967295|A>>>18),A=T+(C^_&(k^C))+x[12]+2368359562&4294967295,T=k+(A<<20&4294967295|A>>>12),A=_+(T^k^C)+x[5]+4294588738&4294967295,_=T+(A<<4&4294967295|A>>>28),A=C+(_^T^k)+x[8]+2272392833&4294967295,C=_+(A<<11&4294967295|A>>>21),A=k+(C^_^T)+x[11]+1839030562&4294967295,k=C+(A<<16&4294967295|A>>>16),A=T+(k^C^_)+x[14]+4259657740&4294967295,T=k+(A<<23&4294967295|A>>>9),A=_+(T^k^C)+x[1]+2763975236&4294967295,_=T+(A<<4&4294967295|A>>>28),A=C+(_^T^k)+x[4]+1272893353&4294967295,C=_+(A<<11&4294967295|A>>>21),A=k+(C^_^T)+x[7]+4139469664&4294967295,k=C+(A<<16&4294967295|A>>>16),A=T+(k^C^_)+x[10]+3200236656&4294967295,T=k+(A<<23&4294967295|A>>>9),A=_+(T^k^C)+x[13]+681279174&4294967295,_=T+(A<<4&4294967295|A>>>28),A=C+(_^T^k)+x[0]+3936430074&4294967295,C=_+(A<<11&4294967295|A>>>21),A=k+(C^_^T)+x[3]+3572445317&4294967295,k=C+(A<<16&4294967295|A>>>16),A=T+(k^C^_)+x[6]+76029189&4294967295,T=k+(A<<23&4294967295|A>>>9),A=_+(T^k^C)+x[9]+3654602809&4294967295,_=T+(A<<4&4294967295|A>>>28),A=C+(_^T^k)+x[12]+3873151461&4294967295,C=_+(A<<11&4294967295|A>>>21),A=k+(C^_^T)+x[15]+530742520&4294967295,k=C+(A<<16&4294967295|A>>>16),A=T+(k^C^_)+x[2]+3299628645&4294967295,T=k+(A<<23&4294967295|A>>>9),A=_+(k^(T|~C))+x[0]+4096336452&4294967295,_=T+(A<<6&4294967295|A>>>26),A=C+(T^(_|~k))+x[7]+1126891415&4294967295,C=_+(A<<10&4294967295|A>>>22),A=k+(_^(C|~T))+x[14]+2878612391&4294967295,k=C+(A<<15&4294967295|A>>>17),A=T+(C^(k|~_))+x[5]+4237533241&4294967295,T=k+(A<<21&4294967295|A>>>11),A=_+(k^(T|~C))+x[12]+1700485571&4294967295,_=T+(A<<6&4294967295|A>>>26),A=C+(T^(_|~k))+x[3]+2399980690&4294967295,C=_+(A<<10&4294967295|A>>>22),A=k+(_^(C|~T))+x[10]+4293915773&4294967295,k=C+(A<<15&4294967295|A>>>17),A=T+(C^(k|~_))+x[1]+2240044497&4294967295,T=k+(A<<21&4294967295|A>>>11),A=_+(k^(T|~C))+x[8]+1873313359&4294967295,_=T+(A<<6&4294967295|A>>>26),A=C+(T^(_|~k))+x[15]+4264355552&4294967295,C=_+(A<<10&4294967295|A>>>22),A=k+(_^(C|~T))+x[6]+2734768916&4294967295,k=C+(A<<15&4294967295|A>>>17),A=T+(C^(k|~_))+x[13]+1309151649&4294967295,T=k+(A<<21&4294967295|A>>>11),A=_+(k^(T|~C))+x[4]+4149444226&4294967295,_=T+(A<<6&4294967295|A>>>26),A=C+(T^(_|~k))+x[11]+3174756917&4294967295,C=_+(A<<10&4294967295|A>>>22),A=k+(_^(C|~T))+x[2]+718787259&4294967295,k=C+(A<<15&4294967295|A>>>17),A=T+(C^(k|~_))+x[9]+3951481745&4294967295,v.g[0]=v.g[0]+_&4294967295,v.g[1]=v.g[1]+(k+(A<<21&4294967295|A>>>11))&4294967295,v.g[2]=v.g[2]+k&4294967295,v.g[3]=v.g[3]+C&4294967295}r.prototype.u=function(v,_){_===void 0&&(_=v.length);for(var T=_-this.blockSize,x=this.B,k=this.h,C=0;C<_;){if(k==0)for(;C<=T;)i(this,v,C),C+=this.blockSize;if(typeof v=="string"){for(;C<_;)if(x[k++]=v.charCodeAt(C++),k==this.blockSize){i(this,x),k=0;break}}else for(;C<_;)if(x[k++]=v[C++],k==this.blockSize){i(this,x),k=0;break}}this.h=k,this.o+=_},r.prototype.v=function(){var v=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);v[0]=128;for(var _=1;_<v.length-8;++_)v[_]=0;var T=8*this.o;for(_=v.length-8;_<v.length;++_)v[_]=T&255,T/=256;for(this.u(v),v=Array(16),_=T=0;4>_;++_)for(var x=0;32>x;x+=8)v[T++]=this.g[_]>>>x&255;return v};function s(v,_){var T=l;return Object.prototype.hasOwnProperty.call(T,v)?T[v]:T[v]=_(v)}function o(v,_){this.h=_;for(var T=[],x=!0,k=v.length-1;0<=k;k--){var C=v[k]|0;x&&C==_||(T[k]=C,x=!1)}this.g=T}var l={};function u(v){return-128<=v&&128>v?s(v,function(_){return new o([_|0],0>_?-1:0)}):new o([v|0],0>v?-1:0)}function h(v){if(isNaN(v)||!isFinite(v))return p;if(0>v)return O(h(-v));for(var _=[],T=1,x=0;v>=T;x++)_[x]=v/T|0,T*=4294967296;return new o(_,0)}function f(v,_){if(v.length==0)throw Error("number format error: empty string");if(_=_||10,2>_||36<_)throw Error("radix out of range: "+_);if(v.charAt(0)=="-")return O(f(v.substring(1),_));if(0<=v.indexOf("-"))throw Error('number format error: interior "-" character');for(var T=h(Math.pow(_,8)),x=p,k=0;k<v.length;k+=8){var C=Math.min(8,v.length-k),A=parseInt(v.substring(k,k+C),_);8>C?(C=h(Math.pow(_,C)),x=x.j(C).add(h(A))):(x=x.j(T),x=x.add(h(A)))}return x}var p=u(0),m=u(1),S=u(16777216);t=o.prototype,t.m=function(){if(N(this))return-O(this).m();for(var v=0,_=1,T=0;T<this.g.length;T++){var x=this.i(T);v+=(0<=x?x:4294967296+x)*_,_*=4294967296}return v},t.toString=function(v){if(v=v||10,2>v||36<v)throw Error("radix out of range: "+v);if(R(this))return"0";if(N(this))return"-"+O(this).toString(v);for(var _=h(Math.pow(v,6)),T=this,x="";;){var k=b(T,_).g;T=I(T,k.j(_));var C=((0<T.g.length?T.g[0]:T.h)>>>0).toString(v);if(T=k,R(T))return C+x;for(;6>C.length;)C="0"+C;x=C+x}},t.i=function(v){return 0>v?0:v<this.g.length?this.g[v]:this.h};function R(v){if(v.h!=0)return!1;for(var _=0;_<v.g.length;_++)if(v.g[_]!=0)return!1;return!0}function N(v){return v.h==-1}t.l=function(v){return v=I(this,v),N(v)?-1:R(v)?0:1};function O(v){for(var _=v.g.length,T=[],x=0;x<_;x++)T[x]=~v.g[x];return new o(T,~v.h).add(m)}t.abs=function(){return N(this)?O(this):this},t.add=function(v){for(var _=Math.max(this.g.length,v.g.length),T=[],x=0,k=0;k<=_;k++){var C=x+(this.i(k)&65535)+(v.i(k)&65535),A=(C>>>16)+(this.i(k)>>>16)+(v.i(k)>>>16);x=A>>>16,C&=65535,A&=65535,T[k]=A<<16|C}return new o(T,T[T.length-1]&-2147483648?-1:0)};function I(v,_){return v.add(O(_))}t.j=function(v){if(R(this)||R(v))return p;if(N(this))return N(v)?O(this).j(O(v)):O(O(this).j(v));if(N(v))return O(this.j(O(v)));if(0>this.l(S)&&0>v.l(S))return h(this.m()*v.m());for(var _=this.g.length+v.g.length,T=[],x=0;x<2*_;x++)T[x]=0;for(x=0;x<this.g.length;x++)for(var k=0;k<v.g.length;k++){var C=this.i(x)>>>16,A=this.i(x)&65535,Dt=v.i(k)>>>16,Fr=v.i(k)&65535;T[2*x+2*k]+=A*Fr,w(T,2*x+2*k),T[2*x+2*k+1]+=C*Fr,w(T,2*x+2*k+1),T[2*x+2*k+1]+=A*Dt,w(T,2*x+2*k+1),T[2*x+2*k+2]+=C*Dt,w(T,2*x+2*k+2)}for(x=0;x<_;x++)T[x]=T[2*x+1]<<16|T[2*x];for(x=_;x<2*_;x++)T[x]=0;return new o(T,0)};function w(v,_){for(;(v[_]&65535)!=v[_];)v[_+1]+=v[_]>>>16,v[_]&=65535,_++}function E(v,_){this.g=v,this.h=_}function b(v,_){if(R(_))throw Error("division by zero");if(R(v))return new E(p,p);if(N(v))return _=b(O(v),_),new E(O(_.g),O(_.h));if(N(_))return _=b(v,O(_)),new E(O(_.g),_.h);if(30<v.g.length){if(N(v)||N(_))throw Error("slowDivide_ only works with positive integers.");for(var T=m,x=_;0>=x.l(v);)T=M(T),x=M(x);var k=j(T,1),C=j(x,1);for(x=j(x,2),T=j(T,2);!R(x);){var A=C.add(x);0>=A.l(v)&&(k=k.add(T),C=A),x=j(x,1),T=j(T,1)}return _=I(v,k.j(_)),new E(k,_)}for(k=p;0<=v.l(_);){for(T=Math.max(1,Math.floor(v.m()/_.m())),x=Math.ceil(Math.log(T)/Math.LN2),x=48>=x?1:Math.pow(2,x-48),C=h(T),A=C.j(_);N(A)||0<A.l(v);)T-=x,C=h(T),A=C.j(_);R(C)&&(C=m),k=k.add(C),v=I(v,A)}return new E(k,v)}t.A=function(v){return b(this,v).h},t.and=function(v){for(var _=Math.max(this.g.length,v.g.length),T=[],x=0;x<_;x++)T[x]=this.i(x)&v.i(x);return new o(T,this.h&v.h)},t.or=function(v){for(var _=Math.max(this.g.length,v.g.length),T=[],x=0;x<_;x++)T[x]=this.i(x)|v.i(x);return new o(T,this.h|v.h)},t.xor=function(v){for(var _=Math.max(this.g.length,v.g.length),T=[],x=0;x<_;x++)T[x]=this.i(x)^v.i(x);return new o(T,this.h^v.h)};function M(v){for(var _=v.g.length+1,T=[],x=0;x<_;x++)T[x]=v.i(x)<<1|v.i(x-1)>>>31;return new o(T,v.h)}function j(v,_){var T=_>>5;_%=32;for(var x=v.g.length-T,k=[],C=0;C<x;C++)k[C]=0<_?v.i(C+T)>>>_|v.i(C+T+1)<<32-_:v.i(C+T);return new o(k,v.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,G0=r,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.A,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=h,o.fromString=f,pr=o}).apply(typeof Wg<"u"?Wg:typeof self<"u"?self:typeof window<"u"?window:{});var Wa=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var K0,Xs,Q0,dl,nd,X0,Y0,J0;(function(){var t,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(a,c,d){return a==Array.prototype||a==Object.prototype||(a[c]=d.value),a};function n(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof Wa=="object"&&Wa];for(var c=0;c<a.length;++c){var d=a[c];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")}var r=n(this);function i(a,c){if(c)e:{var d=r;a=a.split(".");for(var g=0;g<a.length-1;g++){var P=a[g];if(!(P in d))break e;d=d[P]}a=a[a.length-1],g=d[a],c=c(g),c!=g&&c!=null&&e(d,a,{configurable:!0,writable:!0,value:c})}}function s(a,c){a instanceof String&&(a+="");var d=0,g=!1,P={next:function(){if(!g&&d<a.length){var D=d++;return{value:c(D,a[D]),done:!1}}return g=!0,{done:!0,value:void 0}}};return P[Symbol.iterator]=function(){return P},P}i("Array.prototype.values",function(a){return a||function(){return s(this,function(c,d){return d})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var o=o||{},l=this||self;function u(a){var c=typeof a;return c=c!="object"?c:a?Array.isArray(a)?"array":c:"null",c=="array"||c=="object"&&typeof a.length=="number"}function h(a){var c=typeof a;return c=="object"&&a!=null||c=="function"}function f(a,c,d){return a.call.apply(a.bind,arguments)}function p(a,c,d){if(!a)throw Error();if(2<arguments.length){var g=Array.prototype.slice.call(arguments,2);return function(){var P=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(P,g),a.apply(c,P)}}return function(){return a.apply(c,arguments)}}function m(a,c,d){return m=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?f:p,m.apply(null,arguments)}function S(a,c){var d=Array.prototype.slice.call(arguments,1);return function(){var g=d.slice();return g.push.apply(g,arguments),a.apply(this,g)}}function R(a,c){function d(){}d.prototype=c.prototype,a.aa=c.prototype,a.prototype=new d,a.prototype.constructor=a,a.Qb=function(g,P,D){for(var U=Array(arguments.length-2),ce=2;ce<arguments.length;ce++)U[ce-2]=arguments[ce];return c.prototype[P].apply(g,U)}}function N(a){const c=a.length;if(0<c){const d=Array(c);for(let g=0;g<c;g++)d[g]=a[g];return d}return[]}function O(a,c){for(let d=1;d<arguments.length;d++){const g=arguments[d];if(u(g)){const P=a.length||0,D=g.length||0;a.length=P+D;for(let U=0;U<D;U++)a[P+U]=g[U]}else a.push(g)}}class I{constructor(c,d){this.i=c,this.j=d,this.h=0,this.g=null}get(){let c;return 0<this.h?(this.h--,c=this.g,this.g=c.next,c.next=null):c=this.i(),c}}function w(a){return/^[\s\xa0]*$/.test(a)}function E(){var a=l.navigator;return a&&(a=a.userAgent)?a:""}function b(a){return b[" "](a),a}b[" "]=function(){};var M=E().indexOf("Gecko")!=-1&&!(E().toLowerCase().indexOf("webkit")!=-1&&E().indexOf("Edge")==-1)&&!(E().indexOf("Trident")!=-1||E().indexOf("MSIE")!=-1)&&E().indexOf("Edge")==-1;function j(a,c,d){for(const g in a)c.call(d,a[g],g,a)}function v(a,c){for(const d in a)c.call(void 0,a[d],d,a)}function _(a){const c={};for(const d in a)c[d]=a[d];return c}const T="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function x(a,c){let d,g;for(let P=1;P<arguments.length;P++){g=arguments[P];for(d in g)a[d]=g[d];for(let D=0;D<T.length;D++)d=T[D],Object.prototype.hasOwnProperty.call(g,d)&&(a[d]=g[d])}}function k(a){var c=1;a=a.split(":");const d=[];for(;0<c&&a.length;)d.push(a.shift()),c--;return a.length&&d.push(a.join(":")),d}function C(a){l.setTimeout(()=>{throw a},0)}function A(){var a=X;let c=null;return a.g&&(c=a.g,a.g=a.g.next,a.g||(a.h=null),c.next=null),c}class Dt{constructor(){this.h=this.g=null}add(c,d){const g=Fr.get();g.set(c,d),this.h?this.h.next=g:this.g=g,this.h=g}}var Fr=new I(()=>new Es,a=>a.reset());class Es{constructor(){this.next=this.g=this.h=null}set(c,d){this.h=c,this.g=d,this.next=null}reset(){this.next=this.g=this.h=null}}let fn,B=!1,X=new Dt,J=()=>{const a=l.Promise.resolve(void 0);fn=()=>{a.then(ve)}};var ve=()=>{for(var a;a=A();){try{a.h.call(a.g)}catch(d){C(d)}var c=Fr;c.j(a),100>c.h&&(c.h++,a.next=c.g,c.g=a)}B=!1};function ue(){this.s=this.s,this.C=this.C}ue.prototype.s=!1,ue.prototype.ma=function(){this.s||(this.s=!0,this.N())},ue.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function Re(a,c){this.type=a,this.g=this.target=c,this.defaultPrevented=!1}Re.prototype.h=function(){this.defaultPrevented=!0};var pn=function(){if(!l.addEventListener||!Object.defineProperty)return!1;var a=!1,c=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const d=()=>{};l.addEventListener("test",d,c),l.removeEventListener("test",d,c)}catch{}return a}();function mn(a,c){if(Re.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a){var d=this.type=a.type,g=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;if(this.target=a.target||a.srcElement,this.g=c,c=a.relatedTarget){if(M){e:{try{b(c.nodeName);var P=!0;break e}catch{}P=!1}P||(c=null)}}else d=="mouseover"?c=a.fromElement:d=="mouseout"&&(c=a.toElement);this.relatedTarget=c,g?(this.clientX=g.clientX!==void 0?g.clientX:g.pageX,this.clientY=g.clientY!==void 0?g.clientY:g.pageY,this.screenX=g.screenX||0,this.screenY=g.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=typeof a.pointerType=="string"?a.pointerType:gn[a.pointerType]||"",this.state=a.state,this.i=a,a.defaultPrevented&&mn.aa.h.call(this)}}R(mn,Re);var gn={2:"touch",3:"pen",4:"mouse"};mn.prototype.h=function(){mn.aa.h.call(this);var a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var yn="closure_listenable_"+(1e6*Math.random()|0),A1=0;function S1(a,c,d,g,P){this.listener=a,this.proxy=null,this.src=c,this.type=d,this.capture=!!g,this.ha=P,this.key=++A1,this.da=this.fa=!1}function ha(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function da(a){this.src=a,this.g={},this.h=0}da.prototype.add=function(a,c,d,g,P){var D=a.toString();a=this.g[D],a||(a=this.g[D]=[],this.h++);var U=Ju(a,c,g,P);return-1<U?(c=a[U],d||(c.fa=!1)):(c=new S1(c,this.src,D,!!g,P),c.fa=d,a.push(c)),c};function Yu(a,c){var d=c.type;if(d in a.g){var g=a.g[d],P=Array.prototype.indexOf.call(g,c,void 0),D;(D=0<=P)&&Array.prototype.splice.call(g,P,1),D&&(ha(c),a.g[d].length==0&&(delete a.g[d],a.h--))}}function Ju(a,c,d,g){for(var P=0;P<a.length;++P){var D=a[P];if(!D.da&&D.listener==c&&D.capture==!!d&&D.ha==g)return P}return-1}var Zu="closure_lm_"+(1e6*Math.random()|0),ec={};function kp(a,c,d,g,P){if(Array.isArray(c)){for(var D=0;D<c.length;D++)kp(a,c[D],d,g,P);return null}return d=Pp(d),a&&a[yn]?a.K(c,d,h(g)?!!g.capture:!1,P):k1(a,c,d,!1,g,P)}function k1(a,c,d,g,P,D){if(!c)throw Error("Invalid event type");var U=h(P)?!!P.capture:!!P,ce=nc(a);if(ce||(a[Zu]=ce=new da(a)),d=ce.add(c,d,g,U,D),d.proxy)return d;if(g=R1(),d.proxy=g,g.src=a,g.listener=d,a.addEventListener)pn||(P=U),P===void 0&&(P=!1),a.addEventListener(c.toString(),g,P);else if(a.attachEvent)a.attachEvent(Cp(c.toString()),g);else if(a.addListener&&a.removeListener)a.addListener(g);else throw Error("addEventListener and attachEvent are unavailable.");return d}function R1(){function a(d){return c.call(a.src,a.listener,d)}const c=C1;return a}function Rp(a,c,d,g,P){if(Array.isArray(c))for(var D=0;D<c.length;D++)Rp(a,c[D],d,g,P);else g=h(g)?!!g.capture:!!g,d=Pp(d),a&&a[yn]?(a=a.i,c=String(c).toString(),c in a.g&&(D=a.g[c],d=Ju(D,d,g,P),-1<d&&(ha(D[d]),Array.prototype.splice.call(D,d,1),D.length==0&&(delete a.g[c],a.h--)))):a&&(a=nc(a))&&(c=a.g[c.toString()],a=-1,c&&(a=Ju(c,d,g,P)),(d=-1<a?c[a]:null)&&tc(d))}function tc(a){if(typeof a!="number"&&a&&!a.da){var c=a.src;if(c&&c[yn])Yu(c.i,a);else{var d=a.type,g=a.proxy;c.removeEventListener?c.removeEventListener(d,g,a.capture):c.detachEvent?c.detachEvent(Cp(d),g):c.addListener&&c.removeListener&&c.removeListener(g),(d=nc(c))?(Yu(d,a),d.h==0&&(d.src=null,c[Zu]=null)):ha(a)}}}function Cp(a){return a in ec?ec[a]:ec[a]="on"+a}function C1(a,c){if(a.da)a=!0;else{c=new mn(c,this);var d=a.listener,g=a.ha||a.src;a.fa&&tc(a),a=d.call(g,c)}return a}function nc(a){return a=a[Zu],a instanceof da?a:null}var rc="__closure_events_fn_"+(1e9*Math.random()>>>0);function Pp(a){return typeof a=="function"?a:(a[rc]||(a[rc]=function(c){return a.handleEvent(c)}),a[rc])}function Xe(){ue.call(this),this.i=new da(this),this.M=this,this.F=null}R(Xe,ue),Xe.prototype[yn]=!0,Xe.prototype.removeEventListener=function(a,c,d,g){Rp(this,a,c,d,g)};function at(a,c){var d,g=a.F;if(g)for(d=[];g;g=g.F)d.push(g);if(a=a.M,g=c.type||c,typeof c=="string")c=new Re(c,a);else if(c instanceof Re)c.target=c.target||a;else{var P=c;c=new Re(g,a),x(c,P)}if(P=!0,d)for(var D=d.length-1;0<=D;D--){var U=c.g=d[D];P=fa(U,g,!0,c)&&P}if(U=c.g=a,P=fa(U,g,!0,c)&&P,P=fa(U,g,!1,c)&&P,d)for(D=0;D<d.length;D++)U=c.g=d[D],P=fa(U,g,!1,c)&&P}Xe.prototype.N=function(){if(Xe.aa.N.call(this),this.i){var a=this.i,c;for(c in a.g){for(var d=a.g[c],g=0;g<d.length;g++)ha(d[g]);delete a.g[c],a.h--}}this.F=null},Xe.prototype.K=function(a,c,d,g){return this.i.add(String(a),c,!1,d,g)},Xe.prototype.L=function(a,c,d,g){return this.i.add(String(a),c,!0,d,g)};function fa(a,c,d,g){if(c=a.i.g[String(c)],!c)return!0;c=c.concat();for(var P=!0,D=0;D<c.length;++D){var U=c[D];if(U&&!U.da&&U.capture==d){var ce=U.listener,$e=U.ha||U.src;U.fa&&Yu(a.i,U),P=ce.call($e,g)!==!1&&P}}return P&&!g.defaultPrevented}function Np(a,c,d){if(typeof a=="function")d&&(a=m(a,d));else if(a&&typeof a.handleEvent=="function")a=m(a.handleEvent,a);else throw Error("Invalid listener argument");return 2147483647<Number(c)?-1:l.setTimeout(a,c||0)}function bp(a){a.g=Np(()=>{a.g=null,a.i&&(a.i=!1,bp(a))},a.l);const c=a.h;a.h=null,a.m.apply(null,c)}class P1 extends ue{constructor(c,d){super(),this.m=c,this.l=d,this.h=null,this.i=!1,this.g=null}j(c){this.h=arguments,this.g?this.i=!0:bp(this)}N(){super.N(),this.g&&(l.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Ts(a){ue.call(this),this.h=a,this.g={}}R(Ts,ue);var Dp=[];function Op(a){j(a.g,function(c,d){this.g.hasOwnProperty(d)&&tc(c)},a),a.g={}}Ts.prototype.N=function(){Ts.aa.N.call(this),Op(this)},Ts.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var ic=l.JSON.stringify,N1=l.JSON.parse,b1=class{stringify(a){return l.JSON.stringify(a,void 0)}parse(a){return l.JSON.parse(a,void 0)}};function sc(){}sc.prototype.h=null;function Vp(a){return a.h||(a.h=a.i())}function Lp(){}var Is={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function oc(){Re.call(this,"d")}R(oc,Re);function ac(){Re.call(this,"c")}R(ac,Re);var Ur={},Mp=null;function pa(){return Mp=Mp||new Xe}Ur.La="serverreachability";function jp(a){Re.call(this,Ur.La,a)}R(jp,Re);function xs(a){const c=pa();at(c,new jp(c))}Ur.STAT_EVENT="statevent";function Fp(a,c){Re.call(this,Ur.STAT_EVENT,a),this.stat=c}R(Fp,Re);function lt(a){const c=pa();at(c,new Fp(c,a))}Ur.Ma="timingevent";function Up(a,c){Re.call(this,Ur.Ma,a),this.size=c}R(Up,Re);function As(a,c){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return l.setTimeout(function(){a()},c)}function Ss(){this.g=!0}Ss.prototype.xa=function(){this.g=!1};function D1(a,c,d,g,P,D){a.info(function(){if(a.g)if(D)for(var U="",ce=D.split("&"),$e=0;$e<ce.length;$e++){var oe=ce[$e].split("=");if(1<oe.length){var Ye=oe[0];oe=oe[1];var Je=Ye.split("_");U=2<=Je.length&&Je[1]=="type"?U+(Ye+"="+oe+"&"):U+(Ye+"=redacted&")}}else U=null;else U=D;return"XMLHTTP REQ ("+g+") [attempt "+P+"]: "+c+`
`+d+`
`+U})}function O1(a,c,d,g,P,D,U){a.info(function(){return"XMLHTTP RESP ("+g+") [ attempt "+P+"]: "+c+`
`+d+`
`+D+" "+U})}function _i(a,c,d,g){a.info(function(){return"XMLHTTP TEXT ("+c+"): "+L1(a,d)+(g?" "+g:"")})}function V1(a,c){a.info(function(){return"TIMEOUT: "+c})}Ss.prototype.info=function(){};function L1(a,c){if(!a.g)return c;if(!c)return null;try{var d=JSON.parse(c);if(d){for(a=0;a<d.length;a++)if(Array.isArray(d[a])){var g=d[a];if(!(2>g.length)){var P=g[1];if(Array.isArray(P)&&!(1>P.length)){var D=P[0];if(D!="noop"&&D!="stop"&&D!="close")for(var U=1;U<P.length;U++)P[U]=""}}}}return ic(d)}catch{return c}}var ma={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},zp={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},lc;function ga(){}R(ga,sc),ga.prototype.g=function(){return new XMLHttpRequest},ga.prototype.i=function(){return{}},lc=new ga;function $n(a,c,d,g){this.j=a,this.i=c,this.l=d,this.R=g||1,this.U=new Ts(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Bp}function Bp(){this.i=null,this.g="",this.h=!1}var $p={},uc={};function cc(a,c,d){a.L=1,a.v=wa(_n(c)),a.m=d,a.P=!0,Hp(a,null)}function Hp(a,c){a.F=Date.now(),ya(a),a.A=_n(a.v);var d=a.A,g=a.R;Array.isArray(g)||(g=[String(g)]),im(d.i,"t",g),a.C=0,d=a.j.J,a.h=new Bp,a.g=Tm(a.j,d?c:null,!a.m),0<a.O&&(a.M=new P1(m(a.Y,a,a.g),a.O)),c=a.U,d=a.g,g=a.ca;var P="readystatechange";Array.isArray(P)||(P&&(Dp[0]=P.toString()),P=Dp);for(var D=0;D<P.length;D++){var U=kp(d,P[D],g||c.handleEvent,!1,c.h||c);if(!U)break;c.g[U.key]=U}c=a.H?_(a.H):{},a.m?(a.u||(a.u="POST"),c["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.A,a.u,a.m,c)):(a.u="GET",a.g.ea(a.A,a.u,null,c)),xs(),D1(a.i,a.u,a.A,a.l,a.R,a.m)}$n.prototype.ca=function(a){a=a.target;const c=this.M;c&&vn(a)==3?c.j():this.Y(a)},$n.prototype.Y=function(a){try{if(a==this.g)e:{const Je=vn(this.g);var c=this.g.Ba();const Ei=this.g.Z();if(!(3>Je)&&(Je!=3||this.g&&(this.h.h||this.g.oa()||hm(this.g)))){this.J||Je!=4||c==7||(c==8||0>=Ei?xs(3):xs(2)),hc(this);var d=this.g.Z();this.X=d;t:if(qp(this)){var g=hm(this.g);a="";var P=g.length,D=vn(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){zr(this),ks(this);var U="";break t}this.h.i=new l.TextDecoder}for(c=0;c<P;c++)this.h.h=!0,a+=this.h.i.decode(g[c],{stream:!(D&&c==P-1)});g.length=0,this.h.g+=a,this.C=0,U=this.h.g}else U=this.g.oa();if(this.o=d==200,O1(this.i,this.u,this.A,this.l,this.R,Je,d),this.o){if(this.T&&!this.K){t:{if(this.g){var ce,$e=this.g;if((ce=$e.g?$e.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!w(ce)){var oe=ce;break t}}oe=null}if(d=oe)_i(this.i,this.l,d,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,dc(this,d);else{this.o=!1,this.s=3,lt(12),zr(this),ks(this);break e}}if(this.P){d=!0;let zt;for(;!this.J&&this.C<U.length;)if(zt=M1(this,U),zt==uc){Je==4&&(this.s=4,lt(14),d=!1),_i(this.i,this.l,null,"[Incomplete Response]");break}else if(zt==$p){this.s=4,lt(15),_i(this.i,this.l,U,"[Invalid Chunk]"),d=!1;break}else _i(this.i,this.l,zt,null),dc(this,zt);if(qp(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Je!=4||U.length!=0||this.h.h||(this.s=1,lt(16),d=!1),this.o=this.o&&d,!d)_i(this.i,this.l,U,"[Invalid Chunked Response]"),zr(this),ks(this);else if(0<U.length&&!this.W){this.W=!0;var Ye=this.j;Ye.g==this&&Ye.ba&&!Ye.M&&(Ye.j.info("Great, no buffering proxy detected. Bytes received: "+U.length),_c(Ye),Ye.M=!0,lt(11))}}else _i(this.i,this.l,U,null),dc(this,U);Je==4&&zr(this),this.o&&!this.J&&(Je==4?_m(this.j,this):(this.o=!1,ya(this)))}else eT(this.g),d==400&&0<U.indexOf("Unknown SID")?(this.s=3,lt(12)):(this.s=0,lt(13)),zr(this),ks(this)}}}catch{}finally{}};function qp(a){return a.g?a.u=="GET"&&a.L!=2&&a.j.Ca:!1}function M1(a,c){var d=a.C,g=c.indexOf(`
`,d);return g==-1?uc:(d=Number(c.substring(d,g)),isNaN(d)?$p:(g+=1,g+d>c.length?uc:(c=c.slice(g,g+d),a.C=g+d,c)))}$n.prototype.cancel=function(){this.J=!0,zr(this)};function ya(a){a.S=Date.now()+a.I,Wp(a,a.I)}function Wp(a,c){if(a.B!=null)throw Error("WatchDog timer not null");a.B=As(m(a.ba,a),c)}function hc(a){a.B&&(l.clearTimeout(a.B),a.B=null)}$n.prototype.ba=function(){this.B=null;const a=Date.now();0<=a-this.S?(V1(this.i,this.A),this.L!=2&&(xs(),lt(17)),zr(this),this.s=2,ks(this)):Wp(this,this.S-a)};function ks(a){a.j.G==0||a.J||_m(a.j,a)}function zr(a){hc(a);var c=a.M;c&&typeof c.ma=="function"&&c.ma(),a.M=null,Op(a.U),a.g&&(c=a.g,a.g=null,c.abort(),c.ma())}function dc(a,c){try{var d=a.j;if(d.G!=0&&(d.g==a||fc(d.h,a))){if(!a.K&&fc(d.h,a)&&d.G==3){try{var g=d.Da.g.parse(c)}catch{g=null}if(Array.isArray(g)&&g.length==3){var P=g;if(P[0]==0){e:if(!d.u){if(d.g)if(d.g.F+3e3<a.F)Sa(d),xa(d);else break e;yc(d),lt(18)}}else d.za=P[1],0<d.za-d.T&&37500>P[2]&&d.F&&d.v==0&&!d.C&&(d.C=As(m(d.Za,d),6e3));if(1>=Qp(d.h)&&d.ca){try{d.ca()}catch{}d.ca=void 0}}else $r(d,11)}else if((a.K||d.g==a)&&Sa(d),!w(c))for(P=d.Da.g.parse(c),c=0;c<P.length;c++){let oe=P[c];if(d.T=oe[0],oe=oe[1],d.G==2)if(oe[0]=="c"){d.K=oe[1],d.ia=oe[2];const Ye=oe[3];Ye!=null&&(d.la=Ye,d.j.info("VER="+d.la));const Je=oe[4];Je!=null&&(d.Aa=Je,d.j.info("SVER="+d.Aa));const Ei=oe[5];Ei!=null&&typeof Ei=="number"&&0<Ei&&(g=1.5*Ei,d.L=g,d.j.info("backChannelRequestTimeoutMs_="+g)),g=d;const zt=a.g;if(zt){const Ra=zt.g?zt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Ra){var D=g.h;D.g||Ra.indexOf("spdy")==-1&&Ra.indexOf("quic")==-1&&Ra.indexOf("h2")==-1||(D.j=D.l,D.g=new Set,D.h&&(pc(D,D.h),D.h=null))}if(g.D){const vc=zt.g?zt.g.getResponseHeader("X-HTTP-Session-Id"):null;vc&&(g.ya=vc,fe(g.I,g.D,vc))}}d.G=3,d.l&&d.l.ua(),d.ba&&(d.R=Date.now()-a.F,d.j.info("Handshake RTT: "+d.R+"ms")),g=d;var U=a;if(g.qa=Em(g,g.J?g.ia:null,g.W),U.K){Xp(g.h,U);var ce=U,$e=g.L;$e&&(ce.I=$e),ce.B&&(hc(ce),ya(ce)),g.g=U}else gm(g);0<d.i.length&&Aa(d)}else oe[0]!="stop"&&oe[0]!="close"||$r(d,7);else d.G==3&&(oe[0]=="stop"||oe[0]=="close"?oe[0]=="stop"?$r(d,7):gc(d):oe[0]!="noop"&&d.l&&d.l.ta(oe),d.v=0)}}xs(4)}catch{}}var j1=class{constructor(a,c){this.g=a,this.map=c}};function Gp(a){this.l=a||10,l.PerformanceNavigationTiming?(a=l.performance.getEntriesByType("navigation"),a=0<a.length&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(l.chrome&&l.chrome.loadTimes&&l.chrome.loadTimes()&&l.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Kp(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function Qp(a){return a.h?1:a.g?a.g.size:0}function fc(a,c){return a.h?a.h==c:a.g?a.g.has(c):!1}function pc(a,c){a.g?a.g.add(c):a.h=c}function Xp(a,c){a.h&&a.h==c?a.h=null:a.g&&a.g.has(c)&&a.g.delete(c)}Gp.prototype.cancel=function(){if(this.i=Yp(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function Yp(a){if(a.h!=null)return a.i.concat(a.h.D);if(a.g!=null&&a.g.size!==0){let c=a.i;for(const d of a.g.values())c=c.concat(d.D);return c}return N(a.i)}function F1(a){if(a.V&&typeof a.V=="function")return a.V();if(typeof Map<"u"&&a instanceof Map||typeof Set<"u"&&a instanceof Set)return Array.from(a.values());if(typeof a=="string")return a.split("");if(u(a)){for(var c=[],d=a.length,g=0;g<d;g++)c.push(a[g]);return c}c=[],d=0;for(g in a)c[d++]=a[g];return c}function U1(a){if(a.na&&typeof a.na=="function")return a.na();if(!a.V||typeof a.V!="function"){if(typeof Map<"u"&&a instanceof Map)return Array.from(a.keys());if(!(typeof Set<"u"&&a instanceof Set)){if(u(a)||typeof a=="string"){var c=[];a=a.length;for(var d=0;d<a;d++)c.push(d);return c}c=[],d=0;for(const g in a)c[d++]=g;return c}}}function Jp(a,c){if(a.forEach&&typeof a.forEach=="function")a.forEach(c,void 0);else if(u(a)||typeof a=="string")Array.prototype.forEach.call(a,c,void 0);else for(var d=U1(a),g=F1(a),P=g.length,D=0;D<P;D++)c.call(void 0,g[D],d&&d[D],a)}var Zp=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function z1(a,c){if(a){a=a.split("&");for(var d=0;d<a.length;d++){var g=a[d].indexOf("="),P=null;if(0<=g){var D=a[d].substring(0,g);P=a[d].substring(g+1)}else D=a[d];c(D,P?decodeURIComponent(P.replace(/\+/g," ")):"")}}}function Br(a){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,a instanceof Br){this.h=a.h,_a(this,a.j),this.o=a.o,this.g=a.g,va(this,a.s),this.l=a.l;var c=a.i,d=new Ps;d.i=c.i,c.g&&(d.g=new Map(c.g),d.h=c.h),em(this,d),this.m=a.m}else a&&(c=String(a).match(Zp))?(this.h=!1,_a(this,c[1]||"",!0),this.o=Rs(c[2]||""),this.g=Rs(c[3]||"",!0),va(this,c[4]),this.l=Rs(c[5]||"",!0),em(this,c[6]||"",!0),this.m=Rs(c[7]||"")):(this.h=!1,this.i=new Ps(null,this.h))}Br.prototype.toString=function(){var a=[],c=this.j;c&&a.push(Cs(c,tm,!0),":");var d=this.g;return(d||c=="file")&&(a.push("//"),(c=this.o)&&a.push(Cs(c,tm,!0),"@"),a.push(encodeURIComponent(String(d)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.s,d!=null&&a.push(":",String(d))),(d=this.l)&&(this.g&&d.charAt(0)!="/"&&a.push("/"),a.push(Cs(d,d.charAt(0)=="/"?H1:$1,!0))),(d=this.i.toString())&&a.push("?",d),(d=this.m)&&a.push("#",Cs(d,W1)),a.join("")};function _n(a){return new Br(a)}function _a(a,c,d){a.j=d?Rs(c,!0):c,a.j&&(a.j=a.j.replace(/:$/,""))}function va(a,c){if(c){if(c=Number(c),isNaN(c)||0>c)throw Error("Bad port number "+c);a.s=c}else a.s=null}function em(a,c,d){c instanceof Ps?(a.i=c,G1(a.i,a.h)):(d||(c=Cs(c,q1)),a.i=new Ps(c,a.h))}function fe(a,c,d){a.i.set(c,d)}function wa(a){return fe(a,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),a}function Rs(a,c){return a?c?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function Cs(a,c,d){return typeof a=="string"?(a=encodeURI(a).replace(c,B1),d&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function B1(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var tm=/[#\/\?@]/g,$1=/[#\?:]/g,H1=/[#\?]/g,q1=/[#\?@]/g,W1=/#/g;function Ps(a,c){this.h=this.g=null,this.i=a||null,this.j=!!c}function Hn(a){a.g||(a.g=new Map,a.h=0,a.i&&z1(a.i,function(c,d){a.add(decodeURIComponent(c.replace(/\+/g," ")),d)}))}t=Ps.prototype,t.add=function(a,c){Hn(this),this.i=null,a=vi(this,a);var d=this.g.get(a);return d||this.g.set(a,d=[]),d.push(c),this.h+=1,this};function nm(a,c){Hn(a),c=vi(a,c),a.g.has(c)&&(a.i=null,a.h-=a.g.get(c).length,a.g.delete(c))}function rm(a,c){return Hn(a),c=vi(a,c),a.g.has(c)}t.forEach=function(a,c){Hn(this),this.g.forEach(function(d,g){d.forEach(function(P){a.call(c,P,g,this)},this)},this)},t.na=function(){Hn(this);const a=Array.from(this.g.values()),c=Array.from(this.g.keys()),d=[];for(let g=0;g<c.length;g++){const P=a[g];for(let D=0;D<P.length;D++)d.push(c[g])}return d},t.V=function(a){Hn(this);let c=[];if(typeof a=="string")rm(this,a)&&(c=c.concat(this.g.get(vi(this,a))));else{a=Array.from(this.g.values());for(let d=0;d<a.length;d++)c=c.concat(a[d])}return c},t.set=function(a,c){return Hn(this),this.i=null,a=vi(this,a),rm(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[c]),this.h+=1,this},t.get=function(a,c){return a?(a=this.V(a),0<a.length?String(a[0]):c):c};function im(a,c,d){nm(a,c),0<d.length&&(a.i=null,a.g.set(vi(a,c),N(d)),a.h+=d.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],c=Array.from(this.g.keys());for(var d=0;d<c.length;d++){var g=c[d];const D=encodeURIComponent(String(g)),U=this.V(g);for(g=0;g<U.length;g++){var P=D;U[g]!==""&&(P+="="+encodeURIComponent(String(U[g]))),a.push(P)}}return this.i=a.join("&")};function vi(a,c){return c=String(c),a.j&&(c=c.toLowerCase()),c}function G1(a,c){c&&!a.j&&(Hn(a),a.i=null,a.g.forEach(function(d,g){var P=g.toLowerCase();g!=P&&(nm(this,g),im(this,P,d))},a)),a.j=c}function K1(a,c){const d=new Ss;if(l.Image){const g=new Image;g.onload=S(qn,d,"TestLoadImage: loaded",!0,c,g),g.onerror=S(qn,d,"TestLoadImage: error",!1,c,g),g.onabort=S(qn,d,"TestLoadImage: abort",!1,c,g),g.ontimeout=S(qn,d,"TestLoadImage: timeout",!1,c,g),l.setTimeout(function(){g.ontimeout&&g.ontimeout()},1e4),g.src=a}else c(!1)}function Q1(a,c){const d=new Ss,g=new AbortController,P=setTimeout(()=>{g.abort(),qn(d,"TestPingServer: timeout",!1,c)},1e4);fetch(a,{signal:g.signal}).then(D=>{clearTimeout(P),D.ok?qn(d,"TestPingServer: ok",!0,c):qn(d,"TestPingServer: server error",!1,c)}).catch(()=>{clearTimeout(P),qn(d,"TestPingServer: error",!1,c)})}function qn(a,c,d,g,P){try{P&&(P.onload=null,P.onerror=null,P.onabort=null,P.ontimeout=null),g(d)}catch{}}function X1(){this.g=new b1}function Y1(a,c,d){const g=d||"";try{Jp(a,function(P,D){let U=P;h(P)&&(U=ic(P)),c.push(g+D+"="+encodeURIComponent(U))})}catch(P){throw c.push(g+"type="+encodeURIComponent("_badmap")),P}}function Ea(a){this.l=a.Ub||null,this.j=a.eb||!1}R(Ea,sc),Ea.prototype.g=function(){return new Ta(this.l,this.j)},Ea.prototype.i=function(a){return function(){return a}}({});function Ta(a,c){Xe.call(this),this.D=a,this.o=c,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}R(Ta,Xe),t=Ta.prototype,t.open=function(a,c){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=a,this.A=c,this.readyState=1,bs(this)},t.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const c={headers:this.u,method:this.B,credentials:this.m,cache:void 0};a&&(c.body=a),(this.D||l).fetch(new Request(this.A,c)).then(this.Sa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Ns(this)),this.readyState=0},t.Sa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,bs(this)),this.g&&(this.readyState=3,bs(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof l.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;sm(this)}else a.text().then(this.Ra.bind(this),this.ga.bind(this))};function sm(a){a.j.read().then(a.Pa.bind(a)).catch(a.ga.bind(a))}t.Pa=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var c=a.value?a.value:new Uint8Array(0);(c=this.v.decode(c,{stream:!a.done}))&&(this.response=this.responseText+=c)}a.done?Ns(this):bs(this),this.readyState==3&&sm(this)}},t.Ra=function(a){this.g&&(this.response=this.responseText=a,Ns(this))},t.Qa=function(a){this.g&&(this.response=a,Ns(this))},t.ga=function(){this.g&&Ns(this)};function Ns(a){a.readyState=4,a.l=null,a.j=null,a.v=null,bs(a)}t.setRequestHeader=function(a,c){this.u.append(a,c)},t.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],c=this.h.entries();for(var d=c.next();!d.done;)d=d.value,a.push(d[0]+": "+d[1]),d=c.next();return a.join(`\r
`)};function bs(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(Ta.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function om(a){let c="";return j(a,function(d,g){c+=g,c+=":",c+=d,c+=`\r
`}),c}function mc(a,c,d){e:{for(g in d){var g=!1;break e}g=!0}g||(d=om(d),typeof a=="string"?d!=null&&encodeURIComponent(String(d)):fe(a,c,d))}function xe(a){Xe.call(this),this.headers=new Map,this.o=a||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}R(xe,Xe);var J1=/^https?$/i,Z1=["POST","PUT"];t=xe.prototype,t.Ha=function(a){this.J=a},t.ea=function(a,c,d,g){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);c=c?c.toUpperCase():"GET",this.D=a,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():lc.g(),this.v=this.o?Vp(this.o):Vp(lc),this.g.onreadystatechange=m(this.Ea,this);try{this.B=!0,this.g.open(c,String(a),!0),this.B=!1}catch(D){am(this,D);return}if(a=d||"",d=new Map(this.headers),g)if(Object.getPrototypeOf(g)===Object.prototype)for(var P in g)d.set(P,g[P]);else if(typeof g.keys=="function"&&typeof g.get=="function")for(const D of g.keys())d.set(D,g.get(D));else throw Error("Unknown input type for opt_headers: "+String(g));g=Array.from(d.keys()).find(D=>D.toLowerCase()=="content-type"),P=l.FormData&&a instanceof l.FormData,!(0<=Array.prototype.indexOf.call(Z1,c,void 0))||g||P||d.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[D,U]of d)this.g.setRequestHeader(D,U);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{cm(this),this.u=!0,this.g.send(a),this.u=!1}catch(D){am(this,D)}};function am(a,c){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=c,a.m=5,lm(a),Ia(a)}function lm(a){a.A||(a.A=!0,at(a,"complete"),at(a,"error"))}t.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=a||7,at(this,"complete"),at(this,"abort"),Ia(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Ia(this,!0)),xe.aa.N.call(this)},t.Ea=function(){this.s||(this.B||this.u||this.j?um(this):this.bb())},t.bb=function(){um(this)};function um(a){if(a.h&&typeof o<"u"&&(!a.v[1]||vn(a)!=4||a.Z()!=2)){if(a.u&&vn(a)==4)Np(a.Ea,0,a);else if(at(a,"readystatechange"),vn(a)==4){a.h=!1;try{const U=a.Z();e:switch(U){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var c=!0;break e;default:c=!1}var d;if(!(d=c)){var g;if(g=U===0){var P=String(a.D).match(Zp)[1]||null;!P&&l.self&&l.self.location&&(P=l.self.location.protocol.slice(0,-1)),g=!J1.test(P?P.toLowerCase():"")}d=g}if(d)at(a,"complete"),at(a,"success");else{a.m=6;try{var D=2<vn(a)?a.g.statusText:""}catch{D=""}a.l=D+" ["+a.Z()+"]",lm(a)}}finally{Ia(a)}}}}function Ia(a,c){if(a.g){cm(a);const d=a.g,g=a.v[0]?()=>{}:null;a.g=null,a.v=null,c||at(a,"ready");try{d.onreadystatechange=g}catch{}}}function cm(a){a.I&&(l.clearTimeout(a.I),a.I=null)}t.isActive=function(){return!!this.g};function vn(a){return a.g?a.g.readyState:0}t.Z=function(){try{return 2<vn(this)?this.g.status:-1}catch{return-1}},t.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.Oa=function(a){if(this.g){var c=this.g.responseText;return a&&c.indexOf(a)==0&&(c=c.substring(a.length)),N1(c)}};function hm(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.H){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function eT(a){const c={};a=(a.g&&2<=vn(a)&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let g=0;g<a.length;g++){if(w(a[g]))continue;var d=k(a[g]);const P=d[0];if(d=d[1],typeof d!="string")continue;d=d.trim();const D=c[P]||[];c[P]=D,D.push(d)}v(c,function(g){return g.join(", ")})}t.Ba=function(){return this.m},t.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function Ds(a,c,d){return d&&d.internalChannelParams&&d.internalChannelParams[a]||c}function dm(a){this.Aa=0,this.i=[],this.j=new Ss,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=Ds("failFast",!1,a),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=Ds("baseRetryDelayMs",5e3,a),this.cb=Ds("retryDelaySeedMs",1e4,a),this.Wa=Ds("forwardChannelMaxRetries",2,a),this.wa=Ds("forwardChannelRequestTimeoutMs",2e4,a),this.pa=a&&a.xmlHttpFactory||void 0,this.Xa=a&&a.Tb||void 0,this.Ca=a&&a.useFetchStreams||!1,this.L=void 0,this.J=a&&a.supportsCrossDomainXhr||!1,this.K="",this.h=new Gp(a&&a.concurrentRequestLimit),this.Da=new X1,this.P=a&&a.fastHandshake||!1,this.O=a&&a.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=a&&a.Rb||!1,a&&a.xa&&this.j.xa(),a&&a.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&a&&a.detectBufferingProxy||!1,this.ja=void 0,a&&a.longPollingTimeout&&0<a.longPollingTimeout&&(this.ja=a.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}t=dm.prototype,t.la=8,t.G=1,t.connect=function(a,c,d,g){lt(0),this.W=a,this.H=c||{},d&&g!==void 0&&(this.H.OSID=d,this.H.OAID=g),this.F=this.X,this.I=Em(this,null,this.W),Aa(this)};function gc(a){if(fm(a),a.G==3){var c=a.U++,d=_n(a.I);if(fe(d,"SID",a.K),fe(d,"RID",c),fe(d,"TYPE","terminate"),Os(a,d),c=new $n(a,a.j,c),c.L=2,c.v=wa(_n(d)),d=!1,l.navigator&&l.navigator.sendBeacon)try{d=l.navigator.sendBeacon(c.v.toString(),"")}catch{}!d&&l.Image&&(new Image().src=c.v,d=!0),d||(c.g=Tm(c.j,null),c.g.ea(c.v)),c.F=Date.now(),ya(c)}wm(a)}function xa(a){a.g&&(_c(a),a.g.cancel(),a.g=null)}function fm(a){xa(a),a.u&&(l.clearTimeout(a.u),a.u=null),Sa(a),a.h.cancel(),a.s&&(typeof a.s=="number"&&l.clearTimeout(a.s),a.s=null)}function Aa(a){if(!Kp(a.h)&&!a.s){a.s=!0;var c=a.Ga;fn||J(),B||(fn(),B=!0),X.add(c,a),a.B=0}}function tT(a,c){return Qp(a.h)>=a.h.j-(a.s?1:0)?!1:a.s?(a.i=c.D.concat(a.i),!0):a.G==1||a.G==2||a.B>=(a.Va?0:a.Wa)?!1:(a.s=As(m(a.Ga,a,c),vm(a,a.B)),a.B++,!0)}t.Ga=function(a){if(this.s)if(this.s=null,this.G==1){if(!a){this.U=Math.floor(1e5*Math.random()),a=this.U++;const P=new $n(this,this.j,a);let D=this.o;if(this.S&&(D?(D=_(D),x(D,this.S)):D=this.S),this.m!==null||this.O||(P.H=D,D=null),this.P)e:{for(var c=0,d=0;d<this.i.length;d++){t:{var g=this.i[d];if("__data__"in g.map&&(g=g.map.__data__,typeof g=="string")){g=g.length;break t}g=void 0}if(g===void 0)break;if(c+=g,4096<c){c=d;break e}if(c===4096||d===this.i.length-1){c=d+1;break e}}c=1e3}else c=1e3;c=mm(this,P,c),d=_n(this.I),fe(d,"RID",a),fe(d,"CVER",22),this.D&&fe(d,"X-HTTP-Session-Id",this.D),Os(this,d),D&&(this.O?c="headers="+encodeURIComponent(String(om(D)))+"&"+c:this.m&&mc(d,this.m,D)),pc(this.h,P),this.Ua&&fe(d,"TYPE","init"),this.P?(fe(d,"$req",c),fe(d,"SID","null"),P.T=!0,cc(P,d,null)):cc(P,d,c),this.G=2}}else this.G==3&&(a?pm(this,a):this.i.length==0||Kp(this.h)||pm(this))};function pm(a,c){var d;c?d=c.l:d=a.U++;const g=_n(a.I);fe(g,"SID",a.K),fe(g,"RID",d),fe(g,"AID",a.T),Os(a,g),a.m&&a.o&&mc(g,a.m,a.o),d=new $n(a,a.j,d,a.B+1),a.m===null&&(d.H=a.o),c&&(a.i=c.D.concat(a.i)),c=mm(a,d,1e3),d.I=Math.round(.5*a.wa)+Math.round(.5*a.wa*Math.random()),pc(a.h,d),cc(d,g,c)}function Os(a,c){a.H&&j(a.H,function(d,g){fe(c,g,d)}),a.l&&Jp({},function(d,g){fe(c,g,d)})}function mm(a,c,d){d=Math.min(a.i.length,d);var g=a.l?m(a.l.Na,a.l,a):null;e:{var P=a.i;let D=-1;for(;;){const U=["count="+d];D==-1?0<d?(D=P[0].g,U.push("ofs="+D)):D=0:U.push("ofs="+D);let ce=!0;for(let $e=0;$e<d;$e++){let oe=P[$e].g;const Ye=P[$e].map;if(oe-=D,0>oe)D=Math.max(0,P[$e].g-100),ce=!1;else try{Y1(Ye,U,"req"+oe+"_")}catch{g&&g(Ye)}}if(ce){g=U.join("&");break e}}}return a=a.i.splice(0,d),c.D=a,g}function gm(a){if(!a.g&&!a.u){a.Y=1;var c=a.Fa;fn||J(),B||(fn(),B=!0),X.add(c,a),a.v=0}}function yc(a){return a.g||a.u||3<=a.v?!1:(a.Y++,a.u=As(m(a.Fa,a),vm(a,a.v)),a.v++,!0)}t.Fa=function(){if(this.u=null,ym(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var a=2*this.R;this.j.info("BP detection timer enabled: "+a),this.A=As(m(this.ab,this),a)}},t.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,lt(10),xa(this),ym(this))};function _c(a){a.A!=null&&(l.clearTimeout(a.A),a.A=null)}function ym(a){a.g=new $n(a,a.j,"rpc",a.Y),a.m===null&&(a.g.H=a.o),a.g.O=0;var c=_n(a.qa);fe(c,"RID","rpc"),fe(c,"SID",a.K),fe(c,"AID",a.T),fe(c,"CI",a.F?"0":"1"),!a.F&&a.ja&&fe(c,"TO",a.ja),fe(c,"TYPE","xmlhttp"),Os(a,c),a.m&&a.o&&mc(c,a.m,a.o),a.L&&(a.g.I=a.L);var d=a.g;a=a.ia,d.L=1,d.v=wa(_n(c)),d.m=null,d.P=!0,Hp(d,a)}t.Za=function(){this.C!=null&&(this.C=null,xa(this),yc(this),lt(19))};function Sa(a){a.C!=null&&(l.clearTimeout(a.C),a.C=null)}function _m(a,c){var d=null;if(a.g==c){Sa(a),_c(a),a.g=null;var g=2}else if(fc(a.h,c))d=c.D,Xp(a.h,c),g=1;else return;if(a.G!=0){if(c.o)if(g==1){d=c.m?c.m.length:0,c=Date.now()-c.F;var P=a.B;g=pa(),at(g,new Up(g,d)),Aa(a)}else gm(a);else if(P=c.s,P==3||P==0&&0<c.X||!(g==1&&tT(a,c)||g==2&&yc(a)))switch(d&&0<d.length&&(c=a.h,c.i=c.i.concat(d)),P){case 1:$r(a,5);break;case 4:$r(a,10);break;case 3:$r(a,6);break;default:$r(a,2)}}}function vm(a,c){let d=a.Ta+Math.floor(Math.random()*a.cb);return a.isActive()||(d*=2),d*c}function $r(a,c){if(a.j.info("Error code "+c),c==2){var d=m(a.fb,a),g=a.Xa;const P=!g;g=new Br(g||"//www.google.com/images/cleardot.gif"),l.location&&l.location.protocol=="http"||_a(g,"https"),wa(g),P?K1(g.toString(),d):Q1(g.toString(),d)}else lt(2);a.G=0,a.l&&a.l.sa(c),wm(a),fm(a)}t.fb=function(a){a?(this.j.info("Successfully pinged google.com"),lt(2)):(this.j.info("Failed to ping google.com"),lt(1))};function wm(a){if(a.G=0,a.ka=[],a.l){const c=Yp(a.h);(c.length!=0||a.i.length!=0)&&(O(a.ka,c),O(a.ka,a.i),a.h.i.length=0,N(a.i),a.i.length=0),a.l.ra()}}function Em(a,c,d){var g=d instanceof Br?_n(d):new Br(d);if(g.g!="")c&&(g.g=c+"."+g.g),va(g,g.s);else{var P=l.location;g=P.protocol,c=c?c+"."+P.hostname:P.hostname,P=+P.port;var D=new Br(null);g&&_a(D,g),c&&(D.g=c),P&&va(D,P),d&&(D.l=d),g=D}return d=a.D,c=a.ya,d&&c&&fe(g,d,c),fe(g,"VER",a.la),Os(a,g),g}function Tm(a,c,d){if(c&&!a.J)throw Error("Can't create secondary domain capable XhrIo object.");return c=a.Ca&&!a.pa?new xe(new Ea({eb:d})):new xe(a.pa),c.Ha(a.J),c}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function Im(){}t=Im.prototype,t.ua=function(){},t.ta=function(){},t.sa=function(){},t.ra=function(){},t.isActive=function(){return!0},t.Na=function(){};function ka(){}ka.prototype.g=function(a,c){return new Tt(a,c)};function Tt(a,c){Xe.call(this),this.g=new dm(c),this.l=a,this.h=c&&c.messageUrlParams||null,a=c&&c.messageHeaders||null,c&&c.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=c&&c.initMessageHeaders||null,c&&c.messageContentType&&(a?a["X-WebChannel-Content-Type"]=c.messageContentType:a={"X-WebChannel-Content-Type":c.messageContentType}),c&&c.va&&(a?a["X-WebChannel-Client-Profile"]=c.va:a={"X-WebChannel-Client-Profile":c.va}),this.g.S=a,(a=c&&c.Sb)&&!w(a)&&(this.g.m=a),this.v=c&&c.supportsCrossDomainXhr||!1,this.u=c&&c.sendRawJson||!1,(c=c&&c.httpSessionIdParam)&&!w(c)&&(this.g.D=c,a=this.h,a!==null&&c in a&&(a=this.h,c in a&&delete a[c])),this.j=new wi(this)}R(Tt,Xe),Tt.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Tt.prototype.close=function(){gc(this.g)},Tt.prototype.o=function(a){var c=this.g;if(typeof a=="string"){var d={};d.__data__=a,a=d}else this.u&&(d={},d.__data__=ic(a),a=d);c.i.push(new j1(c.Ya++,a)),c.G==3&&Aa(c)},Tt.prototype.N=function(){this.g.l=null,delete this.j,gc(this.g),delete this.g,Tt.aa.N.call(this)};function xm(a){oc.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var c=a.__sm__;if(c){e:{for(const d in c){a=d;break e}a=void 0}(this.i=a)&&(a=this.i,c=c!==null&&a in c?c[a]:void 0),this.data=c}else this.data=a}R(xm,oc);function Am(){ac.call(this),this.status=1}R(Am,ac);function wi(a){this.g=a}R(wi,Im),wi.prototype.ua=function(){at(this.g,"a")},wi.prototype.ta=function(a){at(this.g,new xm(a))},wi.prototype.sa=function(a){at(this.g,new Am)},wi.prototype.ra=function(){at(this.g,"b")},ka.prototype.createWebChannel=ka.prototype.g,Tt.prototype.send=Tt.prototype.o,Tt.prototype.open=Tt.prototype.m,Tt.prototype.close=Tt.prototype.close,J0=function(){return new ka},Y0=function(){return pa()},X0=Ur,nd={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},ma.NO_ERROR=0,ma.TIMEOUT=8,ma.HTTP_ERROR=6,dl=ma,zp.COMPLETE="complete",Q0=zp,Lp.EventType=Is,Is.OPEN="a",Is.CLOSE="b",Is.ERROR="c",Is.MESSAGE="d",Xe.prototype.listen=Xe.prototype.K,Xs=Lp,xe.prototype.listenOnce=xe.prototype.L,xe.prototype.getLastError=xe.prototype.Ka,xe.prototype.getLastErrorCode=xe.prototype.Ba,xe.prototype.getStatus=xe.prototype.Z,xe.prototype.getResponseJson=xe.prototype.Oa,xe.prototype.getResponseText=xe.prototype.oa,xe.prototype.send=xe.prototype.ea,xe.prototype.setWithCredentials=xe.prototype.Ha,K0=xe}).apply(typeof Wa<"u"?Wa:typeof self<"u"?self:typeof window<"u"?window:{});const Gg="@firebase/firestore",Kg="4.8.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let nt=class{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}};nt.UNAUTHENTICATED=new nt(null),nt.GOOGLE_CREDENTIALS=new nt("google-credentials-uid"),nt.FIRST_PARTY=new nt("first-party-uid"),nt.MOCK_USER=new nt("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ps="11.10.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ui=new wf("@firebase/firestore");function Ii(){return ui.logLevel}function $(t,...e){if(ui.logLevel<=te.DEBUG){const n=e.map(If);ui.debug(`Firestore (${ps}): ${t}`,...n)}}function jn(t,...e){if(ui.logLevel<=te.ERROR){const n=e.map(If);ui.error(`Firestore (${ps}): ${t}`,...n)}}function Er(t,...e){if(ui.logLevel<=te.WARN){const n=e.map(If);ui.warn(`Firestore (${ps}): ${t}`,...n)}}function If(t){if(typeof t=="string")return t;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(n){return JSON.stringify(n)}(t)}catch{return t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function W(t,e,n){let r="Unexpected state";typeof e=="string"?r=e:n=e,Z0(t,r,n)}function Z0(t,e,n){let r=`FIRESTORE (${ps}) INTERNAL ASSERTION FAILED: ${e} (ID: ${t.toString(16)})`;if(n!==void 0)try{r+=" CONTEXT: "+JSON.stringify(n)}catch{r+=" CONTEXT: "+n}throw jn(r),new Error(r)}function ie(t,e,n,r){let i="Unexpected state";typeof n=="string"?i=n:r=n,t||Z0(e,i,r)}function Q(t,e){return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const V={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class z extends dn{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mr{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ew{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class fS{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(nt.UNAUTHENTICATED))}shutdown(){}}class pS{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}}class mS{constructor(e){this.t=e,this.currentUser=nt.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){ie(this.o===void 0,42304);let r=this.i;const i=u=>this.i!==r?(r=this.i,n(u)):Promise.resolve();let s=new mr;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new mr,e.enqueueRetryable(()=>i(this.currentUser))};const o=()=>{const u=s;e.enqueueRetryable(async()=>{await u.promise,await i(this.currentUser)})},l=u=>{$("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit(u=>l(u)),setTimeout(()=>{if(!this.auth){const u=this.t.getImmediate({optional:!0});u?l(u):($("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new mr)}},0),o()}getToken(){const e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(r=>this.i!==e?($("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(ie(typeof r.accessToken=="string",31837,{l:r}),new ew(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return ie(e===null||typeof e=="string",2055,{h:e}),new nt(e)}}class gS{constructor(e,n,r){this.P=e,this.T=n,this.I=r,this.type="FirstParty",this.user=nt.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class yS{constructor(e,n,r){this.P=e,this.T=n,this.I=r}getToken(){return Promise.resolve(new gS(this.P,this.T,this.I))}start(e,n){e.enqueueRetryable(()=>n(nt.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Qg{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class _S{constructor(e,n){this.V=n,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,yt(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,n){ie(this.o===void 0,3512);const r=s=>{s.error!=null&&$("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);const o=s.token!==this.m;return this.m=s.token,$("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?n(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable(()=>r(s))};const i=s=>{$("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(s=>i(s)),setTimeout(()=>{if(!this.appCheck){const s=this.V.getImmediate({optional:!0});s?i(s):$("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Qg(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(ie(typeof n.token=="string",44558,{tokenResult:n}),this.m=n.token,new Qg(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vS(t){const e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let r=0;r<t;r++)n[r]=Math.floor(256*Math.random());return n}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tw(){return new TextEncoder}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xf{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const i=vS(40);for(let s=0;s<i.length;++s)r.length<20&&i[s]<n&&(r+=e.charAt(i[s]%62))}return r}}function Z(t,e){return t<e?-1:t>e?1:0}function rd(t,e){let n=0;for(;n<t.length&&n<e.length;){const r=t.codePointAt(n),i=e.codePointAt(n);if(r!==i){if(r<128&&i<128)return Z(r,i);{const s=tw(),o=wS(s.encode(Xg(t,n)),s.encode(Xg(e,n)));return o!==0?o:Z(r,i)}}n+=r>65535?2:1}return Z(t.length,e.length)}function Xg(t,e){return t.codePointAt(e)>65535?t.substring(e,e+2):t.substring(e,e+1)}function wS(t,e){for(let n=0;n<t.length&&n<e.length;++n)if(t[n]!==e[n])return Z(t[n],e[n]);return Z(t.length,e.length)}function ss(t,e,n){return t.length===e.length&&t.every((r,i)=>n(r,e[i]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yg="__name__";class en{constructor(e,n,r){n===void 0?n=0:n>e.length&&W(637,{offset:n,range:e.length}),r===void 0?r=e.length-n:r>e.length-n&&W(1746,{length:r,range:e.length-n}),this.segments=e,this.offset=n,this.len=r}get length(){return this.len}isEqual(e){return en.comparator(this,e)===0}child(e){const n=this.segments.slice(this.offset,this.limit());return e instanceof en?e.forEach(r=>{n.push(r)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,r=this.limit();n<r;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){const r=Math.min(e.length,n.length);for(let i=0;i<r;i++){const s=en.compareSegments(e.get(i),n.get(i));if(s!==0)return s}return Z(e.length,n.length)}static compareSegments(e,n){const r=en.isNumericId(e),i=en.isNumericId(n);return r&&!i?-1:!r&&i?1:r&&i?en.extractNumericId(e).compare(en.extractNumericId(n)):rd(e,n)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return pr.fromString(e.substring(4,e.length-2))}}class le extends en{construct(e,n,r){return new le(e,n,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const n=[];for(const r of e){if(r.indexOf("//")>=0)throw new z(V.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);n.push(...r.split("/").filter(i=>i.length>0))}return new le(n)}static emptyPath(){return new le([])}}const ES=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class We extends en{construct(e,n,r){return new We(e,n,r)}static isValidIdentifier(e){return ES.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),We.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Yg}static keyField(){return new We([Yg])}static fromServerFormat(e){const n=[];let r="",i=0;const s=()=>{if(r.length===0)throw new z(V.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(r),r=""};let o=!1;for(;i<e.length;){const l=e[i];if(l==="\\"){if(i+1===e.length)throw new z(V.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[i+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new z(V.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=u,i+=2}else l==="`"?(o=!o,i++):l!=="."||o?(r+=l,i++):(s(),i++)}if(s(),o)throw new z(V.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new We(n)}static emptyPath(){return new We([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class q{constructor(e){this.path=e}static fromPath(e){return new q(le.fromString(e))}static fromName(e){return new q(le.fromString(e).popFirst(5))}static empty(){return new q(le.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&le.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return le.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new q(new le(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nw(t,e,n){if(!n)throw new z(V.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function TS(t,e,n,r){if(e===!0&&r===!0)throw new z(V.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function Jg(t){if(!q.isDocumentKey(t))throw new z(V.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`)}function Zg(t){if(q.isDocumentKey(t))throw new z(V.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function rw(t){return typeof t=="object"&&t!==null&&(Object.getPrototypeOf(t)===Object.prototype||Object.getPrototypeOf(t)===null)}function bu(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":W(12329,{type:typeof t})}function Pn(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new z(V.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=bu(t);throw new z(V.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ve(t,e){const n={typeString:t};return e&&(n.value=e),n}function ea(t,e){if(!rw(t))throw new z(V.INVALID_ARGUMENT,"JSON must be an object");let n;for(const r in e)if(e[r]){const i=e[r].typeString,s="value"in e[r]?{value:e[r].value}:void 0;if(!(r in t)){n=`JSON missing required field: '${r}'`;break}const o=t[r];if(i&&typeof o!==i){n=`JSON field '${r}' must be a ${i}.`;break}if(s!==void 0&&o!==s.value){n=`Expected '${r}' field to equal '${s.value}'`;break}}if(n)throw new z(V.INVALID_ARGUMENT,n);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ey=-62135596800,ty=1e6;class he{static now(){return he.fromMillis(Date.now())}static fromDate(e){return he.fromMillis(e.getTime())}static fromMillis(e){const n=Math.floor(e/1e3),r=Math.floor((e-1e3*n)*ty);return new he(n,r)}constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new z(V.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new z(V.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<ey)throw new z(V.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new z(V.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/ty}_compareTo(e){return this.seconds===e.seconds?Z(this.nanoseconds,e.nanoseconds):Z(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:he._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(ea(e,he._jsonSchema))return new he(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-ey;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}he._jsonSchemaVersion="firestore/timestamp/1.0",he._jsonSchema={type:Ve("string",he._jsonSchemaVersion),seconds:Ve("number"),nanoseconds:Ve("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class K{static fromTimestamp(e){return new K(e)}static min(){return new K(new he(0,0))}static max(){return new K(new he(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mo=-1;function IS(t,e){const n=t.toTimestamp().seconds,r=t.toTimestamp().nanoseconds+1,i=K.fromTimestamp(r===1e9?new he(n+1,0):new he(n,r));return new Tr(i,q.empty(),e)}function xS(t){return new Tr(t.readTime,t.key,Mo)}class Tr{constructor(e,n,r){this.readTime=e,this.documentKey=n,this.largestBatchId=r}static min(){return new Tr(K.min(),q.empty(),Mo)}static max(){return new Tr(K.max(),q.empty(),Mo)}}function AS(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=q.comparator(t.documentKey,e.documentKey),n!==0?n:Z(t.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const SS="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class kS{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ms(t){if(t.code!==V.FAILED_PRECONDITION||t.message!==SS)throw t;$("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class L{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&W(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new L((r,i)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(r,i)},this.catchCallback=s=>{this.wrapFailure(n,s).next(r,i)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{const n=e();return n instanceof L?n:L.resolve(n)}catch(n){return L.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):L.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):L.reject(n)}static resolve(e){return new L((n,r)=>{n(e)})}static reject(e){return new L((n,r)=>{r(e)})}static waitFor(e){return new L((n,r)=>{let i=0,s=0,o=!1;e.forEach(l=>{++i,l.next(()=>{++s,o&&s===i&&n()},u=>r(u))}),o=!0,s===i&&n()})}static or(e){let n=L.resolve(!1);for(const r of e)n=n.next(i=>i?L.resolve(i):r());return n}static forEach(e,n){const r=[];return e.forEach((i,s)=>{r.push(n.call(this,i,s))}),this.waitFor(r)}static mapArray(e,n){return new L((r,i)=>{const s=e.length,o=new Array(s);let l=0;for(let u=0;u<s;u++){const h=u;n(e[h]).next(f=>{o[h]=f,++l,l===s&&r(o)},f=>i(f))}})}static doWhile(e,n){return new L((r,i)=>{const s=()=>{e()===!0?n().next(()=>{s()},i):r()};s()})}}function RS(t){const e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}function gs(t){return t.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Du{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=r=>this._e(r),this.ae=r=>n.writeSequenceNumber(r))}_e(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ae&&this.ae(e),e}}Du.ue=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Af=-1;function ta(t){return t==null}function Kl(t){return t===0&&1/t==-1/0}function CS(t){return typeof t=="number"&&Number.isInteger(t)&&!Kl(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iw="";function PS(t){let e="";for(let n=0;n<t.length;n++)e.length>0&&(e=ny(e)),e=NS(t.get(n),e);return ny(e)}function NS(t,e){let n=e;const r=t.length;for(let i=0;i<r;i++){const s=t.charAt(i);switch(s){case"\0":n+="";break;case iw:n+="";break;default:n+=s}}return n}function ny(t){return t+iw+""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ry(t){let e=0;for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function Dr(t,e){for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function sw(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ie{constructor(e,n){this.comparator=e,this.root=n||qe.EMPTY}insert(e,n){return new Ie(this.comparator,this.root.insert(e,n,this.comparator).copy(null,null,qe.BLACK,null,null))}remove(e){return new Ie(this.comparator,this.root.remove(e,this.comparator).copy(null,null,qe.BLACK,null,null))}get(e){let n=this.root;for(;!n.isEmpty();){const r=this.comparator(e,n.key);if(r===0)return n.value;r<0?n=n.left:r>0&&(n=n.right)}return null}indexOf(e){let n=0,r=this.root;for(;!r.isEmpty();){const i=this.comparator(e,r.key);if(i===0)return n+r.left.size;i<0?r=r.left:(n+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((n,r)=>(e(n,r),!1))}toString(){const e=[];return this.inorderTraversal((n,r)=>(e.push(`${n}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Ga(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Ga(this.root,e,this.comparator,!1)}getReverseIterator(){return new Ga(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Ga(this.root,e,this.comparator,!0)}}class Ga{constructor(e,n,r,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=n?r(e.key,n):1,n&&i&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const n={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return n}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class qe{constructor(e,n,r,i,s){this.key=e,this.value=n,this.color=r??qe.RED,this.left=i??qe.EMPTY,this.right=s??qe.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,n,r,i,s){return new qe(e??this.key,n??this.value,r??this.color,i??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,r){let i=this;const s=r(e,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(e,n,r),null):s===0?i.copy(null,n,null,null,null):i.copy(null,null,null,null,i.right.insert(e,n,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return qe.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,n){let r,i=this;if(n(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,n),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),n(e,i.key)===0){if(i.right.isEmpty())return qe.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,n))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,qe.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,qe.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw W(43730,{key:this.key,value:this.value});if(this.right.isRed())throw W(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw W(27949);return e+(this.isRed()?0:1)}}qe.EMPTY=null,qe.RED=!0,qe.BLACK=!1;qe.EMPTY=new class{constructor(){this.size=0}get key(){throw W(57766)}get value(){throw W(16141)}get color(){throw W(16727)}get left(){throw W(29726)}get right(){throw W(36894)}copy(e,n,r,i,s){return this}insert(e,n,r){return new qe(e,n)}remove(e,n){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class je{constructor(e){this.comparator=e,this.data=new Ie(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,r)=>(e(n),!1))}forEachInRange(e,n){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const i=r.getNext();if(this.comparator(i.key,e[1])>=0)return;n(i.key)}}forEachWhile(e,n){let r;for(r=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new iy(this.data.getIterator())}getIteratorFrom(e){return new iy(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(r=>{n=n.add(r)}),n}isEqual(e){if(!(e instanceof je)||this.size!==e.size)return!1;const n=this.data.getIterator(),r=e.data.getIterator();for(;n.hasNext();){const i=n.getNext().key,s=r.getNext().key;if(this.comparator(i,s)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(n=>{e.push(n)}),e}toString(){const e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){const n=new je(this.comparator);return n.data=e,n}}class iy{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class St{constructor(e){this.fields=e,e.sort(We.comparator)}static empty(){return new St([])}unionWith(e){let n=new je(We.comparator);for(const r of this.fields)n=n.add(r);for(const r of e)n=n.add(r);return new St(n.toArray())}covers(e){for(const n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return ss(this.fields,e.fields,(n,r)=>n.isEqual(r))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ow extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qe{constructor(e){this.binaryString=e}static fromBase64String(e){const n=function(i){try{return atob(i)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new ow("Invalid base64 string: "+s):s}}(e);return new Qe(n)}static fromUint8Array(e){const n=function(i){let s="";for(let o=0;o<i.length;++o)s+=String.fromCharCode(i[o]);return s}(e);return new Qe(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){const r=new Uint8Array(n.length);for(let i=0;i<n.length;i++)r[i]=n.charCodeAt(i);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Z(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Qe.EMPTY_BYTE_STRING=new Qe("");const bS=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Ir(t){if(ie(!!t,39018),typeof t=="string"){let e=0;const n=bS.exec(t);if(ie(!!n,46558,{timestamp:t}),n[1]){let i=n[1];i=(i+"000000000").substr(0,9),e=Number(i)}const r=new Date(t);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:Ce(t.seconds),nanos:Ce(t.nanos)}}function Ce(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function xr(t){return typeof t=="string"?Qe.fromBase64String(t):Qe.fromUint8Array(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const aw="server_timestamp",lw="__type__",uw="__previous_value__",cw="__local_write_time__";function Sf(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{})[lw])===null||n===void 0?void 0:n.stringValue)===aw}function Ou(t){const e=t.mapValue.fields[uw];return Sf(e)?Ou(e):e}function jo(t){const e=Ir(t.mapValue.fields[cw].timestampValue);return new he(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class DS{constructor(e,n,r,i,s,o,l,u,h,f){this.databaseId=e,this.appId=n,this.persistenceKey=r,this.host=i,this.ssl=s,this.forceLongPolling=o,this.autoDetectLongPolling=l,this.longPollingOptions=u,this.useFetchStreams=h,this.isUsingEmulator=f}}const Ql="(default)";class Fo{constructor(e,n){this.projectId=e,this.database=n||Ql}static empty(){return new Fo("","")}get isDefaultDatabase(){return this.database===Ql}isEqual(e){return e instanceof Fo&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hw="__type__",OS="__max__",Ka={mapValue:{}},dw="__vector__",Xl="value";function Ar(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?Sf(t)?4:LS(t)?9007199254740991:VS(t)?10:11:W(28295,{value:t})}function hn(t,e){if(t===e)return!0;const n=Ar(t);if(n!==Ar(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return jo(t).isEqual(jo(e));case 3:return function(i,s){if(typeof i.timestampValue=="string"&&typeof s.timestampValue=="string"&&i.timestampValue.length===s.timestampValue.length)return i.timestampValue===s.timestampValue;const o=Ir(i.timestampValue),l=Ir(s.timestampValue);return o.seconds===l.seconds&&o.nanos===l.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(i,s){return xr(i.bytesValue).isEqual(xr(s.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(i,s){return Ce(i.geoPointValue.latitude)===Ce(s.geoPointValue.latitude)&&Ce(i.geoPointValue.longitude)===Ce(s.geoPointValue.longitude)}(t,e);case 2:return function(i,s){if("integerValue"in i&&"integerValue"in s)return Ce(i.integerValue)===Ce(s.integerValue);if("doubleValue"in i&&"doubleValue"in s){const o=Ce(i.doubleValue),l=Ce(s.doubleValue);return o===l?Kl(o)===Kl(l):isNaN(o)&&isNaN(l)}return!1}(t,e);case 9:return ss(t.arrayValue.values||[],e.arrayValue.values||[],hn);case 10:case 11:return function(i,s){const o=i.mapValue.fields||{},l=s.mapValue.fields||{};if(ry(o)!==ry(l))return!1;for(const u in o)if(o.hasOwnProperty(u)&&(l[u]===void 0||!hn(o[u],l[u])))return!1;return!0}(t,e);default:return W(52216,{left:t})}}function Uo(t,e){return(t.values||[]).find(n=>hn(n,e))!==void 0}function os(t,e){if(t===e)return 0;const n=Ar(t),r=Ar(e);if(n!==r)return Z(n,r);switch(n){case 0:case 9007199254740991:return 0;case 1:return Z(t.booleanValue,e.booleanValue);case 2:return function(s,o){const l=Ce(s.integerValue||s.doubleValue),u=Ce(o.integerValue||o.doubleValue);return l<u?-1:l>u?1:l===u?0:isNaN(l)?isNaN(u)?0:-1:1}(t,e);case 3:return sy(t.timestampValue,e.timestampValue);case 4:return sy(jo(t),jo(e));case 5:return rd(t.stringValue,e.stringValue);case 6:return function(s,o){const l=xr(s),u=xr(o);return l.compareTo(u)}(t.bytesValue,e.bytesValue);case 7:return function(s,o){const l=s.split("/"),u=o.split("/");for(let h=0;h<l.length&&h<u.length;h++){const f=Z(l[h],u[h]);if(f!==0)return f}return Z(l.length,u.length)}(t.referenceValue,e.referenceValue);case 8:return function(s,o){const l=Z(Ce(s.latitude),Ce(o.latitude));return l!==0?l:Z(Ce(s.longitude),Ce(o.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return oy(t.arrayValue,e.arrayValue);case 10:return function(s,o){var l,u,h,f;const p=s.fields||{},m=o.fields||{},S=(l=p[Xl])===null||l===void 0?void 0:l.arrayValue,R=(u=m[Xl])===null||u===void 0?void 0:u.arrayValue,N=Z(((h=S==null?void 0:S.values)===null||h===void 0?void 0:h.length)||0,((f=R==null?void 0:R.values)===null||f===void 0?void 0:f.length)||0);return N!==0?N:oy(S,R)}(t.mapValue,e.mapValue);case 11:return function(s,o){if(s===Ka.mapValue&&o===Ka.mapValue)return 0;if(s===Ka.mapValue)return 1;if(o===Ka.mapValue)return-1;const l=s.fields||{},u=Object.keys(l),h=o.fields||{},f=Object.keys(h);u.sort(),f.sort();for(let p=0;p<u.length&&p<f.length;++p){const m=rd(u[p],f[p]);if(m!==0)return m;const S=os(l[u[p]],h[f[p]]);if(S!==0)return S}return Z(u.length,f.length)}(t.mapValue,e.mapValue);default:throw W(23264,{le:n})}}function sy(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return Z(t,e);const n=Ir(t),r=Ir(e),i=Z(n.seconds,r.seconds);return i!==0?i:Z(n.nanos,r.nanos)}function oy(t,e){const n=t.values||[],r=e.values||[];for(let i=0;i<n.length&&i<r.length;++i){const s=os(n[i],r[i]);if(s)return s}return Z(n.length,r.length)}function as(t){return id(t)}function id(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(n){const r=Ir(n);return`time(${r.seconds},${r.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(n){return xr(n).toBase64()}(t.bytesValue):"referenceValue"in t?function(n){return q.fromName(n).toString()}(t.referenceValue):"geoPointValue"in t?function(n){return`geo(${n.latitude},${n.longitude})`}(t.geoPointValue):"arrayValue"in t?function(n){let r="[",i=!0;for(const s of n.values||[])i?i=!1:r+=",",r+=id(s);return r+"]"}(t.arrayValue):"mapValue"in t?function(n){const r=Object.keys(n.fields||{}).sort();let i="{",s=!0;for(const o of r)s?s=!1:i+=",",i+=`${o}:${id(n.fields[o])}`;return i+"}"}(t.mapValue):W(61005,{value:t})}function fl(t){switch(Ar(t)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=Ou(t);return e?16+fl(e):16;case 5:return 2*t.stringValue.length;case 6:return xr(t.bytesValue).approximateByteSize();case 7:return t.referenceValue.length;case 9:return function(r){return(r.values||[]).reduce((i,s)=>i+fl(s),0)}(t.arrayValue);case 10:case 11:return function(r){let i=0;return Dr(r.fields,(s,o)=>{i+=s.length+fl(o)}),i}(t.mapValue);default:throw W(13486,{value:t})}}function ay(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function sd(t){return!!t&&"integerValue"in t}function kf(t){return!!t&&"arrayValue"in t}function ly(t){return!!t&&"nullValue"in t}function uy(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function pl(t){return!!t&&"mapValue"in t}function VS(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{})[hw])===null||n===void 0?void 0:n.stringValue)===dw}function ho(t){if(t.geoPointValue)return{geoPointValue:Object.assign({},t.geoPointValue)};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:Object.assign({},t.timestampValue)};if(t.mapValue){const e={mapValue:{fields:{}}};return Dr(t.mapValue.fields,(n,r)=>e.mapValue.fields[n]=ho(r)),e}if(t.arrayValue){const e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=ho(t.arrayValue.values[n]);return e}return Object.assign({},t)}function LS(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue===OS}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ht{constructor(e){this.value=e}static empty(){return new ht({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let r=0;r<e.length-1;++r)if(n=(n.mapValue.fields||{})[e.get(r)],!pl(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=ho(n)}setAll(e){let n=We.emptyPath(),r={},i=[];e.forEach((o,l)=>{if(!n.isImmediateParentOf(l)){const u=this.getFieldsMap(n);this.applyChanges(u,r,i),r={},i=[],n=l.popLast()}o?r[l.lastSegment()]=ho(o):i.push(l.lastSegment())});const s=this.getFieldsMap(n);this.applyChanges(s,r,i)}delete(e){const n=this.field(e.popLast());pl(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return hn(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let r=0;r<e.length;++r){let i=n.mapValue.fields[e.get(r)];pl(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},n.mapValue.fields[e.get(r)]=i),n=i}return n.mapValue.fields}applyChanges(e,n,r){Dr(n,(i,s)=>e[i]=s);for(const i of r)delete e[i]}clone(){return new ht(ho(this.value))}}function fw(t){const e=[];return Dr(t.fields,(n,r)=>{const i=new We([n]);if(pl(r)){const s=fw(r.mapValue).fields;if(s.length===0)e.push(i);else for(const o of s)e.push(i.child(o))}else e.push(i)}),new St(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ze{constructor(e,n,r,i,s,o,l){this.key=e,this.documentType=n,this.version=r,this.readTime=i,this.createTime=s,this.data=o,this.documentState=l}static newInvalidDocument(e){return new ze(e,0,K.min(),K.min(),K.min(),ht.empty(),0)}static newFoundDocument(e,n,r,i){return new ze(e,1,n,K.min(),r,i,0)}static newNoDocument(e,n){return new ze(e,2,n,K.min(),K.min(),ht.empty(),0)}static newUnknownDocument(e,n){return new ze(e,3,n,K.min(),K.min(),ht.empty(),2)}convertToFoundDocument(e,n){return!this.createTime.isEqual(K.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=n,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=ht.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=ht.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=K.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof ze&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new ze(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yl{constructor(e,n){this.position=e,this.inclusive=n}}function cy(t,e,n){let r=0;for(let i=0;i<t.position.length;i++){const s=e[i],o=t.position[i];if(s.field.isKeyField()?r=q.comparator(q.fromName(o.referenceValue),n.key):r=os(o,n.data.field(s.field)),s.dir==="desc"&&(r*=-1),r!==0)break}return r}function hy(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!hn(t.position[n],e.position[n]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zo{constructor(e,n="asc"){this.field=e,this.dir=n}}function MS(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pw{}class Oe extends pw{constructor(e,n,r){super(),this.field=e,this.op=n,this.value=r}static create(e,n,r){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,r):new FS(e,n,r):n==="array-contains"?new BS(e,r):n==="in"?new $S(e,r):n==="not-in"?new HS(e,r):n==="array-contains-any"?new qS(e,r):new Oe(e,n,r)}static createKeyFieldInFilter(e,n,r){return n==="in"?new US(e,r):new zS(e,r)}matches(e){const n=e.data.field(this.field);return this.op==="!="?n!==null&&n.nullValue===void 0&&this.matchesComparison(os(n,this.value)):n!==null&&Ar(this.value)===Ar(n)&&this.matchesComparison(os(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return W(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Yt extends pw{constructor(e,n){super(),this.filters=e,this.op=n,this.he=null}static create(e,n){return new Yt(e,n)}matches(e){return mw(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.he!==null||(this.he=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.he}getFilters(){return Object.assign([],this.filters)}}function mw(t){return t.op==="and"}function gw(t){return jS(t)&&mw(t)}function jS(t){for(const e of t.filters)if(e instanceof Yt)return!1;return!0}function od(t){if(t instanceof Oe)return t.field.canonicalString()+t.op.toString()+as(t.value);if(gw(t))return t.filters.map(e=>od(e)).join(",");{const e=t.filters.map(n=>od(n)).join(",");return`${t.op}(${e})`}}function yw(t,e){return t instanceof Oe?function(r,i){return i instanceof Oe&&r.op===i.op&&r.field.isEqual(i.field)&&hn(r.value,i.value)}(t,e):t instanceof Yt?function(r,i){return i instanceof Yt&&r.op===i.op&&r.filters.length===i.filters.length?r.filters.reduce((s,o,l)=>s&&yw(o,i.filters[l]),!0):!1}(t,e):void W(19439)}function _w(t){return t instanceof Oe?function(n){return`${n.field.canonicalString()} ${n.op} ${as(n.value)}`}(t):t instanceof Yt?function(n){return n.op.toString()+" {"+n.getFilters().map(_w).join(" ,")+"}"}(t):"Filter"}class FS extends Oe{constructor(e,n,r){super(e,n,r),this.key=q.fromName(r.referenceValue)}matches(e){const n=q.comparator(e.key,this.key);return this.matchesComparison(n)}}class US extends Oe{constructor(e,n){super(e,"in",n),this.keys=vw("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}}class zS extends Oe{constructor(e,n){super(e,"not-in",n),this.keys=vw("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}}function vw(t,e){var n;return(((n=e.arrayValue)===null||n===void 0?void 0:n.values)||[]).map(r=>q.fromName(r.referenceValue))}class BS extends Oe{constructor(e,n){super(e,"array-contains",n)}matches(e){const n=e.data.field(this.field);return kf(n)&&Uo(n.arrayValue,this.value)}}class $S extends Oe{constructor(e,n){super(e,"in",n)}matches(e){const n=e.data.field(this.field);return n!==null&&Uo(this.value.arrayValue,n)}}class HS extends Oe{constructor(e,n){super(e,"not-in",n)}matches(e){if(Uo(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const n=e.data.field(this.field);return n!==null&&n.nullValue===void 0&&!Uo(this.value.arrayValue,n)}}class qS extends Oe{constructor(e,n){super(e,"array-contains-any",n)}matches(e){const n=e.data.field(this.field);return!(!kf(n)||!n.arrayValue.values)&&n.arrayValue.values.some(r=>Uo(this.value.arrayValue,r))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class WS{constructor(e,n=null,r=[],i=[],s=null,o=null,l=null){this.path=e,this.collectionGroup=n,this.orderBy=r,this.filters=i,this.limit=s,this.startAt=o,this.endAt=l,this.Pe=null}}function dy(t,e=null,n=[],r=[],i=null,s=null,o=null){return new WS(t,e,n,r,i,s,o)}function Rf(t){const e=Q(t);if(e.Pe===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(r=>od(r)).join(","),n+="|ob:",n+=e.orderBy.map(r=>function(s){return s.field.canonicalString()+s.dir}(r)).join(","),ta(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(r=>as(r)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(r=>as(r)).join(",")),e.Pe=n}return e.Pe}function Cf(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!MS(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!yw(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!hy(t.startAt,e.startAt)&&hy(t.endAt,e.endAt)}function ad(t){return q.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ys{constructor(e,n=null,r=[],i=[],s=null,o="F",l=null,u=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=r,this.filters=i,this.limit=s,this.limitType=o,this.startAt=l,this.endAt=u,this.Te=null,this.Ie=null,this.de=null,this.startAt,this.endAt}}function GS(t,e,n,r,i,s,o,l){return new ys(t,e,n,r,i,s,o,l)}function Pf(t){return new ys(t)}function fy(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function ww(t){return t.collectionGroup!==null}function fo(t){const e=Q(t);if(e.Te===null){e.Te=[];const n=new Set;for(const s of e.explicitOrderBy)e.Te.push(s),n.add(s.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let l=new je(We.comparator);return o.filters.forEach(u=>{u.getFlattenedFilters().forEach(h=>{h.isInequality()&&(l=l.add(h.field))})}),l})(e).forEach(s=>{n.has(s.canonicalString())||s.isKeyField()||e.Te.push(new zo(s,r))}),n.has(We.keyField().canonicalString())||e.Te.push(new zo(We.keyField(),r))}return e.Te}function an(t){const e=Q(t);return e.Ie||(e.Ie=KS(e,fo(t))),e.Ie}function KS(t,e){if(t.limitType==="F")return dy(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(i=>{const s=i.dir==="desc"?"asc":"desc";return new zo(i.field,s)});const n=t.endAt?new Yl(t.endAt.position,t.endAt.inclusive):null,r=t.startAt?new Yl(t.startAt.position,t.startAt.inclusive):null;return dy(t.path,t.collectionGroup,e,t.filters,t.limit,n,r)}}function ld(t,e){const n=t.filters.concat([e]);return new ys(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function Jl(t,e,n){return new ys(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function Vu(t,e){return Cf(an(t),an(e))&&t.limitType===e.limitType}function Ew(t){return`${Rf(an(t))}|lt:${t.limitType}`}function xi(t){return`Query(target=${function(n){let r=n.path.canonicalString();return n.collectionGroup!==null&&(r+=" collectionGroup="+n.collectionGroup),n.filters.length>0&&(r+=`, filters: [${n.filters.map(i=>_w(i)).join(", ")}]`),ta(n.limit)||(r+=", limit: "+n.limit),n.orderBy.length>0&&(r+=`, orderBy: [${n.orderBy.map(i=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(i)).join(", ")}]`),n.startAt&&(r+=", startAt: ",r+=n.startAt.inclusive?"b:":"a:",r+=n.startAt.position.map(i=>as(i)).join(",")),n.endAt&&(r+=", endAt: ",r+=n.endAt.inclusive?"a:":"b:",r+=n.endAt.position.map(i=>as(i)).join(",")),`Target(${r})`}(an(t))}; limitType=${t.limitType})`}function Lu(t,e){return e.isFoundDocument()&&function(r,i){const s=i.key.path;return r.collectionGroup!==null?i.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(s):q.isDocumentKey(r.path)?r.path.isEqual(s):r.path.isImmediateParentOf(s)}(t,e)&&function(r,i){for(const s of fo(r))if(!s.field.isKeyField()&&i.data.field(s.field)===null)return!1;return!0}(t,e)&&function(r,i){for(const s of r.filters)if(!s.matches(i))return!1;return!0}(t,e)&&function(r,i){return!(r.startAt&&!function(o,l,u){const h=cy(o,l,u);return o.inclusive?h<=0:h<0}(r.startAt,fo(r),i)||r.endAt&&!function(o,l,u){const h=cy(o,l,u);return o.inclusive?h>=0:h>0}(r.endAt,fo(r),i))}(t,e)}function QS(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function Tw(t){return(e,n)=>{let r=!1;for(const i of fo(t)){const s=XS(i,e,n);if(s!==0)return s;r=r||i.field.isKeyField()}return 0}}function XS(t,e,n){const r=t.field.isKeyField()?q.comparator(e.key,n.key):function(s,o,l){const u=o.data.field(s),h=l.data.field(s);return u!==null&&h!==null?os(u,h):W(42886)}(t.field,e,n);switch(t.dir){case"asc":return r;case"desc":return-1*r;default:return W(19790,{direction:t.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gi{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r!==void 0){for(const[i,s]of r)if(this.equalsFn(i,e))return s}}has(e){return this.get(e)!==void 0}set(e,n){const r=this.mapKeyFn(e),i=this.inner[r];if(i===void 0)return this.inner[r]=[[e,n]],void this.innerSize++;for(let s=0;s<i.length;s++)if(this.equalsFn(i[s][0],e))return void(i[s]=[e,n]);i.push([e,n]),this.innerSize++}delete(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r===void 0)return!1;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return r.length===1?delete this.inner[n]:r.splice(i,1),this.innerSize--,!0;return!1}forEach(e){Dr(this.inner,(n,r)=>{for(const[i,s]of r)e(i,s)})}isEmpty(){return sw(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const YS=new Ie(q.comparator);function Fn(){return YS}const Iw=new Ie(q.comparator);function Ys(...t){let e=Iw;for(const n of t)e=e.insert(n.key,n);return e}function xw(t){let e=Iw;return t.forEach((n,r)=>e=e.insert(n,r.overlayedDocument)),e}function Xr(){return po()}function Aw(){return po()}function po(){return new gi(t=>t.toString(),(t,e)=>t.isEqual(e))}const JS=new Ie(q.comparator),ZS=new je(q.comparator);function ne(...t){let e=ZS;for(const n of t)e=e.add(n);return e}const ek=new je(Z);function tk(){return ek}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nf(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Kl(e)?"-0":e}}function Sw(t){return{integerValue:""+t}}function nk(t,e){return CS(e)?Sw(e):Nf(t,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mu{constructor(){this._=void 0}}function rk(t,e,n){return t instanceof Bo?function(i,s){const o={fields:{[lw]:{stringValue:aw},[cw]:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return s&&Sf(s)&&(s=Ou(s)),s&&(o.fields[uw]=s),{mapValue:o}}(n,e):t instanceof $o?Rw(t,e):t instanceof Ho?Cw(t,e):function(i,s){const o=kw(i,s),l=py(o)+py(i.Ee);return sd(o)&&sd(i.Ee)?Sw(l):Nf(i.serializer,l)}(t,e)}function ik(t,e,n){return t instanceof $o?Rw(t,e):t instanceof Ho?Cw(t,e):n}function kw(t,e){return t instanceof Zl?function(r){return sd(r)||function(s){return!!s&&"doubleValue"in s}(r)}(e)?e:{integerValue:0}:null}class Bo extends Mu{}class $o extends Mu{constructor(e){super(),this.elements=e}}function Rw(t,e){const n=Pw(e);for(const r of t.elements)n.some(i=>hn(i,r))||n.push(r);return{arrayValue:{values:n}}}class Ho extends Mu{constructor(e){super(),this.elements=e}}function Cw(t,e){let n=Pw(e);for(const r of t.elements)n=n.filter(i=>!hn(i,r));return{arrayValue:{values:n}}}class Zl extends Mu{constructor(e,n){super(),this.serializer=e,this.Ee=n}}function py(t){return Ce(t.integerValue||t.doubleValue)}function Pw(t){return kf(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sk{constructor(e,n){this.field=e,this.transform=n}}function ok(t,e){return t.field.isEqual(e.field)&&function(r,i){return r instanceof $o&&i instanceof $o||r instanceof Ho&&i instanceof Ho?ss(r.elements,i.elements,hn):r instanceof Zl&&i instanceof Zl?hn(r.Ee,i.Ee):r instanceof Bo&&i instanceof Bo}(t.transform,e.transform)}class ak{constructor(e,n){this.version=e,this.transformResults=n}}class it{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new it}static exists(e){return new it(void 0,e)}static updateTime(e){return new it(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function ml(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}class ju{}function Nw(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new Fu(t.key,it.none()):new na(t.key,t.data,it.none());{const n=t.data,r=ht.empty();let i=new je(We.comparator);for(let s of e.fields)if(!i.has(s)){let o=n.field(s);o===null&&s.length>1&&(s=s.popLast(),o=n.field(s)),o===null?r.delete(s):r.set(s,o),i=i.add(s)}return new Or(t.key,r,new St(i.toArray()),it.none())}}function lk(t,e,n){t instanceof na?function(i,s,o){const l=i.value.clone(),u=gy(i.fieldTransforms,s,o.transformResults);l.setAll(u),s.convertToFoundDocument(o.version,l).setHasCommittedMutations()}(t,e,n):t instanceof Or?function(i,s,o){if(!ml(i.precondition,s))return void s.convertToUnknownDocument(o.version);const l=gy(i.fieldTransforms,s,o.transformResults),u=s.data;u.setAll(bw(i)),u.setAll(l),s.convertToFoundDocument(o.version,u).setHasCommittedMutations()}(t,e,n):function(i,s,o){s.convertToNoDocument(o.version).setHasCommittedMutations()}(0,e,n)}function mo(t,e,n,r){return t instanceof na?function(s,o,l,u){if(!ml(s.precondition,o))return l;const h=s.value.clone(),f=yy(s.fieldTransforms,u,o);return h.setAll(f),o.convertToFoundDocument(o.version,h).setHasLocalMutations(),null}(t,e,n,r):t instanceof Or?function(s,o,l,u){if(!ml(s.precondition,o))return l;const h=yy(s.fieldTransforms,u,o),f=o.data;return f.setAll(bw(s)),f.setAll(h),o.convertToFoundDocument(o.version,f).setHasLocalMutations(),l===null?null:l.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map(p=>p.field))}(t,e,n,r):function(s,o,l){return ml(s.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):l}(t,e,n)}function uk(t,e){let n=null;for(const r of t.fieldTransforms){const i=e.data.field(r.field),s=kw(r.transform,i||null);s!=null&&(n===null&&(n=ht.empty()),n.set(r.field,s))}return n||null}function my(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(r,i){return r===void 0&&i===void 0||!(!r||!i)&&ss(r,i,(s,o)=>ok(s,o))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}class na extends ju{constructor(e,n,r,i=[]){super(),this.key=e,this.value=n,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class Or extends ju{constructor(e,n,r,i,s=[]){super(),this.key=e,this.data=n,this.fieldMask=r,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function bw(t){const e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){const r=t.data.field(n);e.set(n,r)}}),e}function gy(t,e,n){const r=new Map;ie(t.length===n.length,32656,{Ae:n.length,Re:t.length});for(let i=0;i<n.length;i++){const s=t[i],o=s.transform,l=e.data.field(s.field);r.set(s.field,ik(o,l,n[i]))}return r}function yy(t,e,n){const r=new Map;for(const i of t){const s=i.transform,o=n.data.field(i.field);r.set(i.field,rk(s,o,e))}return r}class Fu extends ju{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class Dw extends ju{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ck{constructor(e,n,r,i){this.batchId=e,this.localWriteTime=n,this.baseMutations=r,this.mutations=i}applyToRemoteDocument(e,n){const r=n.mutationResults;for(let i=0;i<this.mutations.length;i++){const s=this.mutations[i];s.key.isEqual(e.key)&&lk(s,e,r[i])}}applyToLocalView(e,n){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(n=mo(r,e,n,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(n=mo(r,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){const r=Aw();return this.mutations.forEach(i=>{const s=e.get(i.key),o=s.overlayedDocument;let l=this.applyToLocalView(o,s.mutatedFields);l=n.has(i.key)?null:l;const u=Nw(o,l);u!==null&&r.set(i.key,u),o.isValidDocument()||o.convertToNoDocument(K.min())}),r}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),ne())}isEqual(e){return this.batchId===e.batchId&&ss(this.mutations,e.mutations,(n,r)=>my(n,r))&&ss(this.baseMutations,e.baseMutations,(n,r)=>my(n,r))}}class bf{constructor(e,n,r,i){this.batch=e,this.commitVersion=n,this.mutationResults=r,this.docVersions=i}static from(e,n,r){ie(e.mutations.length===r.length,58842,{Ve:e.mutations.length,me:r.length});let i=function(){return JS}();const s=e.mutations;for(let o=0;o<s.length;o++)i=i.insert(s[o].key,r[o].version);return new bf(e,n,r,i)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hk{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dk{constructor(e,n){this.count=e,this.unchangedNames=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var be,re;function Ow(t){switch(t){case V.OK:return W(64938);case V.CANCELLED:case V.UNKNOWN:case V.DEADLINE_EXCEEDED:case V.RESOURCE_EXHAUSTED:case V.INTERNAL:case V.UNAVAILABLE:case V.UNAUTHENTICATED:return!1;case V.INVALID_ARGUMENT:case V.NOT_FOUND:case V.ALREADY_EXISTS:case V.PERMISSION_DENIED:case V.FAILED_PRECONDITION:case V.ABORTED:case V.OUT_OF_RANGE:case V.UNIMPLEMENTED:case V.DATA_LOSS:return!0;default:return W(15467,{code:t})}}function Vw(t){if(t===void 0)return jn("GRPC error has no .code"),V.UNKNOWN;switch(t){case be.OK:return V.OK;case be.CANCELLED:return V.CANCELLED;case be.UNKNOWN:return V.UNKNOWN;case be.DEADLINE_EXCEEDED:return V.DEADLINE_EXCEEDED;case be.RESOURCE_EXHAUSTED:return V.RESOURCE_EXHAUSTED;case be.INTERNAL:return V.INTERNAL;case be.UNAVAILABLE:return V.UNAVAILABLE;case be.UNAUTHENTICATED:return V.UNAUTHENTICATED;case be.INVALID_ARGUMENT:return V.INVALID_ARGUMENT;case be.NOT_FOUND:return V.NOT_FOUND;case be.ALREADY_EXISTS:return V.ALREADY_EXISTS;case be.PERMISSION_DENIED:return V.PERMISSION_DENIED;case be.FAILED_PRECONDITION:return V.FAILED_PRECONDITION;case be.ABORTED:return V.ABORTED;case be.OUT_OF_RANGE:return V.OUT_OF_RANGE;case be.UNIMPLEMENTED:return V.UNIMPLEMENTED;case be.DATA_LOSS:return V.DATA_LOSS;default:return W(39323,{code:t})}}(re=be||(be={}))[re.OK=0]="OK",re[re.CANCELLED=1]="CANCELLED",re[re.UNKNOWN=2]="UNKNOWN",re[re.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",re[re.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",re[re.NOT_FOUND=5]="NOT_FOUND",re[re.ALREADY_EXISTS=6]="ALREADY_EXISTS",re[re.PERMISSION_DENIED=7]="PERMISSION_DENIED",re[re.UNAUTHENTICATED=16]="UNAUTHENTICATED",re[re.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",re[re.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",re[re.ABORTED=10]="ABORTED",re[re.OUT_OF_RANGE=11]="OUT_OF_RANGE",re[re.UNIMPLEMENTED=12]="UNIMPLEMENTED",re[re.INTERNAL=13]="INTERNAL",re[re.UNAVAILABLE=14]="UNAVAILABLE",re[re.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fk=new pr([4294967295,4294967295],0);function _y(t){const e=tw().encode(t),n=new G0;return n.update(e),new Uint8Array(n.digest())}function vy(t){const e=new DataView(t.buffer),n=e.getUint32(0,!0),r=e.getUint32(4,!0),i=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new pr([n,r],0),new pr([i,s],0)]}class Df{constructor(e,n,r){if(this.bitmap=e,this.padding=n,this.hashCount=r,n<0||n>=8)throw new Js(`Invalid padding: ${n}`);if(r<0)throw new Js(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Js(`Invalid hash count: ${r}`);if(e.length===0&&n!==0)throw new Js(`Invalid padding when bitmap length is 0: ${n}`);this.fe=8*e.length-n,this.ge=pr.fromNumber(this.fe)}pe(e,n,r){let i=e.add(n.multiply(pr.fromNumber(r)));return i.compare(fk)===1&&(i=new pr([i.getBits(0),i.getBits(1)],0)),i.modulo(this.ge).toNumber()}ye(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.fe===0)return!1;const n=_y(e),[r,i]=vy(n);for(let s=0;s<this.hashCount;s++){const o=this.pe(r,i,s);if(!this.ye(o))return!1}return!0}static create(e,n,r){const i=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),o=new Df(s,i,n);return r.forEach(l=>o.insert(l)),o}insert(e){if(this.fe===0)return;const n=_y(e),[r,i]=vy(n);for(let s=0;s<this.hashCount;s++){const o=this.pe(r,i,s);this.we(o)}}we(e){const n=Math.floor(e/8),r=e%8;this.bitmap[n]|=1<<r}}class Js extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uu{constructor(e,n,r,i,s){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=r,this.documentUpdates=i,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,n,r){const i=new Map;return i.set(e,ra.createSynthesizedTargetChangeForCurrentChange(e,n,r)),new Uu(K.min(),i,new Ie(Z),Fn(),ne())}}class ra{constructor(e,n,r,i,s){this.resumeToken=e,this.current=n,this.addedDocuments=r,this.modifiedDocuments=i,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,n,r){return new ra(r,n,ne(),ne(),ne())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gl{constructor(e,n,r,i){this.Se=e,this.removedTargetIds=n,this.key=r,this.be=i}}class Lw{constructor(e,n){this.targetId=e,this.De=n}}class Mw{constructor(e,n,r=Qe.EMPTY_BYTE_STRING,i=null){this.state=e,this.targetIds=n,this.resumeToken=r,this.cause=i}}class wy{constructor(){this.ve=0,this.Ce=Ey(),this.Fe=Qe.EMPTY_BYTE_STRING,this.Me=!1,this.xe=!0}get current(){return this.Me}get resumeToken(){return this.Fe}get Oe(){return this.ve!==0}get Ne(){return this.xe}Be(e){e.approximateByteSize()>0&&(this.xe=!0,this.Fe=e)}Le(){let e=ne(),n=ne(),r=ne();return this.Ce.forEach((i,s)=>{switch(s){case 0:e=e.add(i);break;case 2:n=n.add(i);break;case 1:r=r.add(i);break;default:W(38017,{changeType:s})}}),new ra(this.Fe,this.Me,e,n,r)}ke(){this.xe=!1,this.Ce=Ey()}qe(e,n){this.xe=!0,this.Ce=this.Ce.insert(e,n)}Qe(e){this.xe=!0,this.Ce=this.Ce.remove(e)}$e(){this.ve+=1}Ue(){this.ve-=1,ie(this.ve>=0,3241,{ve:this.ve})}Ke(){this.xe=!0,this.Me=!0}}class pk{constructor(e){this.We=e,this.Ge=new Map,this.ze=Fn(),this.je=Qa(),this.Je=Qa(),this.He=new Ie(Z)}Ye(e){for(const n of e.Se)e.be&&e.be.isFoundDocument()?this.Ze(n,e.be):this.Xe(n,e.key,e.be);for(const n of e.removedTargetIds)this.Xe(n,e.key,e.be)}et(e){this.forEachTarget(e,n=>{const r=this.tt(n);switch(e.state){case 0:this.nt(n)&&r.Be(e.resumeToken);break;case 1:r.Ue(),r.Oe||r.ke(),r.Be(e.resumeToken);break;case 2:r.Ue(),r.Oe||this.removeTarget(n);break;case 3:this.nt(n)&&(r.Ke(),r.Be(e.resumeToken));break;case 4:this.nt(n)&&(this.rt(n),r.Be(e.resumeToken));break;default:W(56790,{state:e.state})}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.Ge.forEach((r,i)=>{this.nt(i)&&n(i)})}it(e){const n=e.targetId,r=e.De.count,i=this.st(n);if(i){const s=i.target;if(ad(s))if(r===0){const o=new q(s.path);this.Xe(n,o,ze.newNoDocument(o,K.min()))}else ie(r===1,20013,{expectedCount:r});else{const o=this.ot(n);if(o!==r){const l=this._t(e),u=l?this.ut(l,e,o):1;if(u!==0){this.rt(n);const h=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.He=this.He.insert(n,h)}}}}}_t(e){const n=e.De.unchangedNames;if(!n||!n.bits)return null;const{bits:{bitmap:r="",padding:i=0},hashCount:s=0}=n;let o,l;try{o=xr(r).toUint8Array()}catch(u){if(u instanceof ow)return Er("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{l=new Df(o,i,s)}catch(u){return Er(u instanceof Js?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return l.fe===0?null:l}ut(e,n,r){return n.De.count===r-this.ht(e,n.targetId)?0:2}ht(e,n){const r=this.We.getRemoteKeysForTarget(n);let i=0;return r.forEach(s=>{const o=this.We.lt(),l=`projects/${o.projectId}/databases/${o.database}/documents/${s.path.canonicalString()}`;e.mightContain(l)||(this.Xe(n,s,null),i++)}),i}Pt(e){const n=new Map;this.Ge.forEach((s,o)=>{const l=this.st(o);if(l){if(s.current&&ad(l.target)){const u=new q(l.target.path);this.Tt(u).has(o)||this.It(o,u)||this.Xe(o,u,ze.newNoDocument(u,e))}s.Ne&&(n.set(o,s.Le()),s.ke())}});let r=ne();this.Je.forEach((s,o)=>{let l=!0;o.forEachWhile(u=>{const h=this.st(u);return!h||h.purpose==="TargetPurposeLimboResolution"||(l=!1,!1)}),l&&(r=r.add(s))}),this.ze.forEach((s,o)=>o.setReadTime(e));const i=new Uu(e,n,this.He,this.ze,r);return this.ze=Fn(),this.je=Qa(),this.Je=Qa(),this.He=new Ie(Z),i}Ze(e,n){if(!this.nt(e))return;const r=this.It(e,n.key)?2:0;this.tt(e).qe(n.key,r),this.ze=this.ze.insert(n.key,n),this.je=this.je.insert(n.key,this.Tt(n.key).add(e)),this.Je=this.Je.insert(n.key,this.dt(n.key).add(e))}Xe(e,n,r){if(!this.nt(e))return;const i=this.tt(e);this.It(e,n)?i.qe(n,1):i.Qe(n),this.Je=this.Je.insert(n,this.dt(n).delete(e)),this.Je=this.Je.insert(n,this.dt(n).add(e)),r&&(this.ze=this.ze.insert(n,r))}removeTarget(e){this.Ge.delete(e)}ot(e){const n=this.tt(e).Le();return this.We.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}$e(e){this.tt(e).$e()}tt(e){let n=this.Ge.get(e);return n||(n=new wy,this.Ge.set(e,n)),n}dt(e){let n=this.Je.get(e);return n||(n=new je(Z),this.Je=this.Je.insert(e,n)),n}Tt(e){let n=this.je.get(e);return n||(n=new je(Z),this.je=this.je.insert(e,n)),n}nt(e){const n=this.st(e)!==null;return n||$("WatchChangeAggregator","Detected inactive target",e),n}st(e){const n=this.Ge.get(e);return n&&n.Oe?null:this.We.Et(e)}rt(e){this.Ge.set(e,new wy),this.We.getRemoteKeysForTarget(e).forEach(n=>{this.Xe(e,n,null)})}It(e,n){return this.We.getRemoteKeysForTarget(e).has(n)}}function Qa(){return new Ie(q.comparator)}function Ey(){return new Ie(q.comparator)}const mk={asc:"ASCENDING",desc:"DESCENDING"},gk={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},yk={and:"AND",or:"OR"};class _k{constructor(e,n){this.databaseId=e,this.useProto3Json=n}}function ud(t,e){return t.useProto3Json||ta(e)?e:{value:e}}function eu(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function jw(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function vk(t,e){return eu(t,e.toTimestamp())}function Ct(t){return ie(!!t,49232),K.fromTimestamp(function(n){const r=Ir(n);return new he(r.seconds,r.nanos)}(t))}function Of(t,e){return cd(t,e).canonicalString()}function cd(t,e){const n=function(i){return new le(["projects",i.projectId,"databases",i.database])}(t).child("documents");return e===void 0?n:n.child(e)}function Fw(t){const e=le.fromString(t);return ie(qw(e),10190,{key:e.toString()}),e}function tu(t,e){return Of(t.databaseId,e.path)}function go(t,e){const n=Fw(e);if(n.get(1)!==t.databaseId.projectId)throw new z(V.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new z(V.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new q(zw(n))}function Uw(t,e){return Of(t.databaseId,e)}function wk(t){const e=Fw(t);return e.length===4?le.emptyPath():zw(e)}function hd(t){return new le(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function zw(t){return ie(t.length>4&&t.get(4)==="documents",29091,{key:t.toString()}),t.popFirst(5)}function Ty(t,e,n){return{name:tu(t,e),fields:n.value.mapValue.fields}}function Ek(t,e){return"found"in e?function(r,i){ie(!!i.found,43571),i.found.name,i.found.updateTime;const s=go(r,i.found.name),o=Ct(i.found.updateTime),l=i.found.createTime?Ct(i.found.createTime):K.min(),u=new ht({mapValue:{fields:i.found.fields}});return ze.newFoundDocument(s,o,l,u)}(t,e):"missing"in e?function(r,i){ie(!!i.missing,3894),ie(!!i.readTime,22933);const s=go(r,i.missing),o=Ct(i.readTime);return ze.newNoDocument(s,o)}(t,e):W(7234,{result:e})}function Tk(t,e){let n;if("targetChange"in e){e.targetChange;const r=function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:W(39313,{state:h})}(e.targetChange.targetChangeType||"NO_CHANGE"),i=e.targetChange.targetIds||[],s=function(h,f){return h.useProto3Json?(ie(f===void 0||typeof f=="string",58123),Qe.fromBase64String(f||"")):(ie(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),Qe.fromUint8Array(f||new Uint8Array))}(t,e.targetChange.resumeToken),o=e.targetChange.cause,l=o&&function(h){const f=h.code===void 0?V.UNKNOWN:Vw(h.code);return new z(f,h.message||"")}(o);n=new Mw(r,i,s,l||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const i=go(t,r.document.name),s=Ct(r.document.updateTime),o=r.document.createTime?Ct(r.document.createTime):K.min(),l=new ht({mapValue:{fields:r.document.fields}}),u=ze.newFoundDocument(i,s,o,l),h=r.targetIds||[],f=r.removedTargetIds||[];n=new gl(h,f,u.key,u)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const i=go(t,r.document),s=r.readTime?Ct(r.readTime):K.min(),o=ze.newNoDocument(i,s),l=r.removedTargetIds||[];n=new gl([],l,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const i=go(t,r.document),s=r.removedTargetIds||[];n=new gl([],s,i,null)}else{if(!("filter"in e))return W(11601,{At:e});{e.filter;const r=e.filter;r.targetId;const{count:i=0,unchangedNames:s}=r,o=new dk(i,s),l=r.targetId;n=new Lw(l,o)}}return n}function Bw(t,e){let n;if(e instanceof na)n={update:Ty(t,e.key,e.value)};else if(e instanceof Fu)n={delete:tu(t,e.key)};else if(e instanceof Or)n={update:Ty(t,e.key,e.data),updateMask:Nk(e.fieldMask)};else{if(!(e instanceof Dw))return W(16599,{Rt:e.type});n={verify:tu(t,e.key)}}return e.fieldTransforms.length>0&&(n.updateTransforms=e.fieldTransforms.map(r=>function(s,o){const l=o.transform;if(l instanceof Bo)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(l instanceof $o)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:l.elements}};if(l instanceof Ho)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:l.elements}};if(l instanceof Zl)return{fieldPath:o.field.canonicalString(),increment:l.Ee};throw W(20930,{transform:o.transform})}(0,r))),e.precondition.isNone||(n.currentDocument=function(i,s){return s.updateTime!==void 0?{updateTime:vk(i,s.updateTime)}:s.exists!==void 0?{exists:s.exists}:W(27497)}(t,e.precondition)),n}function Ik(t,e){return t&&t.length>0?(ie(e!==void 0,14353),t.map(n=>function(i,s){let o=i.updateTime?Ct(i.updateTime):Ct(s);return o.isEqual(K.min())&&(o=Ct(s)),new ak(o,i.transformResults||[])}(n,e))):[]}function xk(t,e){return{documents:[Uw(t,e.path)]}}function Ak(t,e){const n={structuredQuery:{}},r=e.path;let i;e.collectionGroup!==null?(i=r,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(i=r.popLast(),n.structuredQuery.from=[{collectionId:r.lastSegment()}]),n.parent=Uw(t,i);const s=function(h){if(h.length!==0)return Hw(Yt.create(h,"and"))}(e.filters);s&&(n.structuredQuery.where=s);const o=function(h){if(h.length!==0)return h.map(f=>function(m){return{field:Ai(m.field),direction:Rk(m.dir)}}(f))}(e.orderBy);o&&(n.structuredQuery.orderBy=o);const l=ud(t,e.limit);return l!==null&&(n.structuredQuery.limit=l),e.startAt&&(n.structuredQuery.startAt=function(h){return{before:h.inclusive,values:h.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(h){return{before:!h.inclusive,values:h.position}}(e.endAt)),{Vt:n,parent:i}}function Sk(t){let e=wk(t.parent);const n=t.structuredQuery,r=n.from?n.from.length:0;let i=null;if(r>0){ie(r===1,65062);const f=n.from[0];f.allDescendants?i=f.collectionId:e=e.child(f.collectionId)}let s=[];n.where&&(s=function(p){const m=$w(p);return m instanceof Yt&&gw(m)?m.getFilters():[m]}(n.where));let o=[];n.orderBy&&(o=function(p){return p.map(m=>function(R){return new zo(Si(R.field),function(O){switch(O){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(R.direction))}(m))}(n.orderBy));let l=null;n.limit&&(l=function(p){let m;return m=typeof p=="object"?p.value:p,ta(m)?null:m}(n.limit));let u=null;n.startAt&&(u=function(p){const m=!!p.before,S=p.values||[];return new Yl(S,m)}(n.startAt));let h=null;return n.endAt&&(h=function(p){const m=!p.before,S=p.values||[];return new Yl(S,m)}(n.endAt)),GS(e,i,o,s,l,"F",u,h)}function kk(t,e){const n=function(i){switch(i){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return W(28987,{purpose:i})}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function $w(t){return t.unaryFilter!==void 0?function(n){switch(n.unaryFilter.op){case"IS_NAN":const r=Si(n.unaryFilter.field);return Oe.create(r,"==",{doubleValue:NaN});case"IS_NULL":const i=Si(n.unaryFilter.field);return Oe.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const s=Si(n.unaryFilter.field);return Oe.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=Si(n.unaryFilter.field);return Oe.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return W(61313);default:return W(60726)}}(t):t.fieldFilter!==void 0?function(n){return Oe.create(Si(n.fieldFilter.field),function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return W(58110);default:return W(50506)}}(n.fieldFilter.op),n.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(n){return Yt.create(n.compositeFilter.filters.map(r=>$w(r)),function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return W(1026)}}(n.compositeFilter.op))}(t):W(30097,{filter:t})}function Rk(t){return mk[t]}function Ck(t){return gk[t]}function Pk(t){return yk[t]}function Ai(t){return{fieldPath:t.canonicalString()}}function Si(t){return We.fromServerFormat(t.fieldPath)}function Hw(t){return t instanceof Oe?function(n){if(n.op==="=="){if(uy(n.value))return{unaryFilter:{field:Ai(n.field),op:"IS_NAN"}};if(ly(n.value))return{unaryFilter:{field:Ai(n.field),op:"IS_NULL"}}}else if(n.op==="!="){if(uy(n.value))return{unaryFilter:{field:Ai(n.field),op:"IS_NOT_NAN"}};if(ly(n.value))return{unaryFilter:{field:Ai(n.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Ai(n.field),op:Ck(n.op),value:n.value}}}(t):t instanceof Yt?function(n){const r=n.getFilters().map(i=>Hw(i));return r.length===1?r[0]:{compositeFilter:{op:Pk(n.op),filters:r}}}(t):W(54877,{filter:t})}function Nk(t){const e=[];return t.fields.forEach(n=>e.push(n.canonicalString())),{fieldPaths:e}}function qw(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nr{constructor(e,n,r,i,s=K.min(),o=K.min(),l=Qe.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=n,this.purpose=r,this.sequenceNumber=i,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=l,this.expectedCount=u}withSequenceNumber(e){return new nr(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,n){return new nr(this.target,this.targetId,this.purpose,this.sequenceNumber,n,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new nr(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new nr(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bk{constructor(e){this.gt=e}}function Dk(t){const e=Sk({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?Jl(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ok{constructor(){this.Dn=new Vk}addToCollectionParentIndex(e,n){return this.Dn.add(n),L.resolve()}getCollectionParents(e,n){return L.resolve(this.Dn.getEntries(n))}addFieldIndex(e,n){return L.resolve()}deleteFieldIndex(e,n){return L.resolve()}deleteAllFieldIndexes(e){return L.resolve()}createTargetIndexes(e,n){return L.resolve()}getDocumentsMatchingTarget(e,n){return L.resolve(null)}getIndexType(e,n){return L.resolve(0)}getFieldIndexes(e,n){return L.resolve([])}getNextCollectionGroupToUpdate(e){return L.resolve(null)}getMinOffset(e,n){return L.resolve(Tr.min())}getMinOffsetFromCollectionGroup(e,n){return L.resolve(Tr.min())}updateCollectionGroup(e,n,r){return L.resolve()}updateIndexEntries(e,n){return L.resolve()}}class Vk{constructor(){this.index={}}add(e){const n=e.lastSegment(),r=e.popLast(),i=this.index[n]||new je(le.comparator),s=!i.has(r);return this.index[n]=i.add(r),s}has(e){const n=e.lastSegment(),r=e.popLast(),i=this.index[n];return i&&i.has(r)}getEntries(e){return(this.index[e]||new je(le.comparator)).toArray()}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Iy={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},Ww=41943040;class mt{static withCacheSize(e){return new mt(e,mt.DEFAULT_COLLECTION_PERCENTILE,mt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,n,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=n,this.maximumSequenceNumbersToCollect=r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */mt.DEFAULT_COLLECTION_PERCENTILE=10,mt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,mt.DEFAULT=new mt(Ww,mt.DEFAULT_COLLECTION_PERCENTILE,mt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),mt.DISABLED=new mt(-1,0,0);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ls{constructor(e){this._r=e}next(){return this._r+=2,this._r}static ar(){return new ls(0)}static ur(){return new ls(-1)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xy="LruGarbageCollector",Lk=1048576;function Ay([t,e],[n,r]){const i=Z(t,n);return i===0?Z(e,r):i}class Mk{constructor(e){this.Tr=e,this.buffer=new je(Ay),this.Ir=0}dr(){return++this.Ir}Er(e){const n=[e,this.dr()];if(this.buffer.size<this.Tr)this.buffer=this.buffer.add(n);else{const r=this.buffer.last();Ay(n,r)<0&&(this.buffer=this.buffer.delete(r).add(n))}}get maxValue(){return this.buffer.last()[0]}}class jk{constructor(e,n,r){this.garbageCollector=e,this.asyncQueue=n,this.localStore=r,this.Ar=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Rr(6e4)}stop(){this.Ar&&(this.Ar.cancel(),this.Ar=null)}get started(){return this.Ar!==null}Rr(e){$(xy,`Garbage collection scheduled in ${e}ms`),this.Ar=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Ar=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(n){gs(n)?$(xy,"Ignoring IndexedDB error during garbage collection: ",n):await ms(n)}await this.Rr(3e5)})}}class Fk{constructor(e,n){this.Vr=e,this.params=n}calculateTargetCount(e,n){return this.Vr.mr(e).next(r=>Math.floor(n/100*r))}nthSequenceNumber(e,n){if(n===0)return L.resolve(Du.ue);const r=new Mk(n);return this.Vr.forEachTarget(e,i=>r.Er(i.sequenceNumber)).next(()=>this.Vr.gr(e,i=>r.Er(i))).next(()=>r.maxValue)}removeTargets(e,n,r){return this.Vr.removeTargets(e,n,r)}removeOrphanedDocuments(e,n){return this.Vr.removeOrphanedDocuments(e,n)}collect(e,n){return this.params.cacheSizeCollectionThreshold===-1?($("LruGarbageCollector","Garbage collection skipped; disabled"),L.resolve(Iy)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?($("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Iy):this.pr(e,n))}getCacheSize(e){return this.Vr.getCacheSize(e)}pr(e,n){let r,i,s,o,l,u,h;const f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(p=>(p>this.params.maximumSequenceNumbersToCollect?($("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),i=this.params.maximumSequenceNumbersToCollect):i=p,o=Date.now(),this.nthSequenceNumber(e,i))).next(p=>(r=p,l=Date.now(),this.removeTargets(e,r,n))).next(p=>(s=p,u=Date.now(),this.removeOrphanedDocuments(e,r))).next(p=>(h=Date.now(),Ii()<=te.DEBUG&&$("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-f}ms
	Determined least recently used ${i} in `+(l-o)+`ms
	Removed ${s} targets in `+(u-l)+`ms
	Removed ${p} documents in `+(h-u)+`ms
Total Duration: ${h-f}ms`),L.resolve({didRun:!0,sequenceNumbersCollected:i,targetsRemoved:s,documentsRemoved:p})))}}function Uk(t,e){return new Fk(t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zk{constructor(){this.changes=new gi(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,ze.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();const r=this.changes.get(n);return r!==void 0?L.resolve(r):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bk{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $k{constructor(e,n,r,i){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=r,this.indexManager=i}getDocument(e,n){let r=null;return this.documentOverlayCache.getOverlay(e,n).next(i=>(r=i,this.remoteDocumentCache.getEntry(e,n))).next(i=>(r!==null&&mo(r.mutation,i,St.empty(),he.now()),i))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.getLocalViewOfDocuments(e,r,ne()).next(()=>r))}getLocalViewOfDocuments(e,n,r=ne()){const i=Xr();return this.populateOverlays(e,i,n).next(()=>this.computeViews(e,n,i,r).next(s=>{let o=Ys();return s.forEach((l,u)=>{o=o.insert(l,u.overlayedDocument)}),o}))}getOverlayedDocuments(e,n){const r=Xr();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,ne()))}populateOverlays(e,n,r){const i=[];return r.forEach(s=>{n.has(s)||i.push(s)}),this.documentOverlayCache.getOverlays(e,i).next(s=>{s.forEach((o,l)=>{n.set(o,l)})})}computeViews(e,n,r,i){let s=Fn();const o=po(),l=function(){return po()}();return n.forEach((u,h)=>{const f=r.get(h.key);i.has(h.key)&&(f===void 0||f.mutation instanceof Or)?s=s.insert(h.key,h):f!==void 0?(o.set(h.key,f.mutation.getFieldMask()),mo(f.mutation,h,f.mutation.getFieldMask(),he.now())):o.set(h.key,St.empty())}),this.recalculateAndSaveOverlays(e,s).next(u=>(u.forEach((h,f)=>o.set(h,f)),n.forEach((h,f)=>{var p;return l.set(h,new Bk(f,(p=o.get(h))!==null&&p!==void 0?p:null))}),l))}recalculateAndSaveOverlays(e,n){const r=po();let i=new Ie((o,l)=>o-l),s=ne();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(o=>{for(const l of o)l.keys().forEach(u=>{const h=n.get(u);if(h===null)return;let f=r.get(u)||St.empty();f=l.applyToLocalView(h,f),r.set(u,f);const p=(i.get(l.batchId)||ne()).add(u);i=i.insert(l.batchId,p)})}).next(()=>{const o=[],l=i.getReverseIterator();for(;l.hasNext();){const u=l.getNext(),h=u.key,f=u.value,p=Aw();f.forEach(m=>{if(!s.has(m)){const S=Nw(n.get(m),r.get(m));S!==null&&p.set(m,S),s=s.add(m)}}),o.push(this.documentOverlayCache.saveOverlays(e,h,p))}return L.waitFor(o)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,n,r,i){return function(o){return q.isDocumentKey(o.path)&&o.collectionGroup===null&&o.filters.length===0}(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):ww(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,r,i):this.getDocumentsMatchingCollectionQuery(e,n,r,i)}getNextDocuments(e,n,r,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,r,i).next(s=>{const o=i-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,r.largestBatchId,i-s.size):L.resolve(Xr());let l=Mo,u=s;return o.next(h=>L.forEach(h,(f,p)=>(l<p.largestBatchId&&(l=p.largestBatchId),s.get(f)?L.resolve():this.remoteDocumentCache.getEntry(e,f).next(m=>{u=u.insert(f,m)}))).next(()=>this.populateOverlays(e,h,s)).next(()=>this.computeViews(e,u,h,ne())).next(f=>({batchId:l,changes:xw(f)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new q(n)).next(r=>{let i=Ys();return r.isFoundDocument()&&(i=i.insert(r.key,r)),i})}getDocumentsMatchingCollectionGroupQuery(e,n,r,i){const s=n.collectionGroup;let o=Ys();return this.indexManager.getCollectionParents(e,s).next(l=>L.forEach(l,u=>{const h=function(p,m){return new ys(m,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(n,u.child(s));return this.getDocumentsMatchingCollectionQuery(e,h,r,i).next(f=>{f.forEach((p,m)=>{o=o.insert(p,m)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(e,n,r,i){let s;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,r.largestBatchId).next(o=>(s=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,r,s,i))).next(o=>{s.forEach((u,h)=>{const f=h.getKey();o.get(f)===null&&(o=o.insert(f,ze.newInvalidDocument(f)))});let l=Ys();return o.forEach((u,h)=>{const f=s.get(u);f!==void 0&&mo(f.mutation,h,St.empty(),he.now()),Lu(n,h)&&(l=l.insert(u,h))}),l})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hk{constructor(e){this.serializer=e,this.Br=new Map,this.Lr=new Map}getBundleMetadata(e,n){return L.resolve(this.Br.get(n))}saveBundleMetadata(e,n){return this.Br.set(n.id,function(i){return{id:i.id,version:i.version,createTime:Ct(i.createTime)}}(n)),L.resolve()}getNamedQuery(e,n){return L.resolve(this.Lr.get(n))}saveNamedQuery(e,n){return this.Lr.set(n.name,function(i){return{name:i.name,query:Dk(i.bundledQuery),readTime:Ct(i.readTime)}}(n)),L.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qk{constructor(){this.overlays=new Ie(q.comparator),this.kr=new Map}getOverlay(e,n){return L.resolve(this.overlays.get(n))}getOverlays(e,n){const r=Xr();return L.forEach(n,i=>this.getOverlay(e,i).next(s=>{s!==null&&r.set(i,s)})).next(()=>r)}saveOverlays(e,n,r){return r.forEach((i,s)=>{this.wt(e,n,s)}),L.resolve()}removeOverlaysForBatchId(e,n,r){const i=this.kr.get(r);return i!==void 0&&(i.forEach(s=>this.overlays=this.overlays.remove(s)),this.kr.delete(r)),L.resolve()}getOverlaysForCollection(e,n,r){const i=Xr(),s=n.length+1,o=new q(n.child("")),l=this.overlays.getIteratorFrom(o);for(;l.hasNext();){const u=l.getNext().value,h=u.getKey();if(!n.isPrefixOf(h.path))break;h.path.length===s&&u.largestBatchId>r&&i.set(u.getKey(),u)}return L.resolve(i)}getOverlaysForCollectionGroup(e,n,r,i){let s=new Ie((h,f)=>h-f);const o=this.overlays.getIterator();for(;o.hasNext();){const h=o.getNext().value;if(h.getKey().getCollectionGroup()===n&&h.largestBatchId>r){let f=s.get(h.largestBatchId);f===null&&(f=Xr(),s=s.insert(h.largestBatchId,f)),f.set(h.getKey(),h)}}const l=Xr(),u=s.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach((h,f)=>l.set(h,f)),!(l.size()>=i)););return L.resolve(l)}wt(e,n,r){const i=this.overlays.get(r.key);if(i!==null){const o=this.kr.get(i.largestBatchId).delete(r.key);this.kr.set(i.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new hk(n,r));let s=this.kr.get(n);s===void 0&&(s=ne(),this.kr.set(n,s)),this.kr.set(n,s.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wk{constructor(){this.sessionToken=Qe.EMPTY_BYTE_STRING}getSessionToken(e){return L.resolve(this.sessionToken)}setSessionToken(e,n){return this.sessionToken=n,L.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vf{constructor(){this.qr=new je(Fe.Qr),this.$r=new je(Fe.Ur)}isEmpty(){return this.qr.isEmpty()}addReference(e,n){const r=new Fe(e,n);this.qr=this.qr.add(r),this.$r=this.$r.add(r)}Kr(e,n){e.forEach(r=>this.addReference(r,n))}removeReference(e,n){this.Wr(new Fe(e,n))}Gr(e,n){e.forEach(r=>this.removeReference(r,n))}zr(e){const n=new q(new le([])),r=new Fe(n,e),i=new Fe(n,e+1),s=[];return this.$r.forEachInRange([r,i],o=>{this.Wr(o),s.push(o.key)}),s}jr(){this.qr.forEach(e=>this.Wr(e))}Wr(e){this.qr=this.qr.delete(e),this.$r=this.$r.delete(e)}Jr(e){const n=new q(new le([])),r=new Fe(n,e),i=new Fe(n,e+1);let s=ne();return this.$r.forEachInRange([r,i],o=>{s=s.add(o.key)}),s}containsKey(e){const n=new Fe(e,0),r=this.qr.firstAfterOrEqual(n);return r!==null&&e.isEqual(r.key)}}class Fe{constructor(e,n){this.key=e,this.Hr=n}static Qr(e,n){return q.comparator(e.key,n.key)||Z(e.Hr,n.Hr)}static Ur(e,n){return Z(e.Hr,n.Hr)||q.comparator(e.key,n.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gk{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.er=1,this.Yr=new je(Fe.Qr)}checkEmpty(e){return L.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,r,i){const s=this.er;this.er++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new ck(s,n,r,i);this.mutationQueue.push(o);for(const l of i)this.Yr=this.Yr.add(new Fe(l.key,s)),this.indexManager.addToCollectionParentIndex(e,l.key.path.popLast());return L.resolve(o)}lookupMutationBatch(e,n){return L.resolve(this.Zr(n))}getNextMutationBatchAfterBatchId(e,n){const r=n+1,i=this.Xr(r),s=i<0?0:i;return L.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return L.resolve(this.mutationQueue.length===0?Af:this.er-1)}getAllMutationBatches(e){return L.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){const r=new Fe(n,0),i=new Fe(n,Number.POSITIVE_INFINITY),s=[];return this.Yr.forEachInRange([r,i],o=>{const l=this.Zr(o.Hr);s.push(l)}),L.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,n){let r=new je(Z);return n.forEach(i=>{const s=new Fe(i,0),o=new Fe(i,Number.POSITIVE_INFINITY);this.Yr.forEachInRange([s,o],l=>{r=r.add(l.Hr)})}),L.resolve(this.ei(r))}getAllMutationBatchesAffectingQuery(e,n){const r=n.path,i=r.length+1;let s=r;q.isDocumentKey(s)||(s=s.child(""));const o=new Fe(new q(s),0);let l=new je(Z);return this.Yr.forEachWhile(u=>{const h=u.key.path;return!!r.isPrefixOf(h)&&(h.length===i&&(l=l.add(u.Hr)),!0)},o),L.resolve(this.ei(l))}ei(e){const n=[];return e.forEach(r=>{const i=this.Zr(r);i!==null&&n.push(i)}),n}removeMutationBatch(e,n){ie(this.ti(n.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.Yr;return L.forEach(n.mutations,i=>{const s=new Fe(i.key,n.batchId);return r=r.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)}).next(()=>{this.Yr=r})}rr(e){}containsKey(e,n){const r=new Fe(n,0),i=this.Yr.firstAfterOrEqual(r);return L.resolve(n.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,L.resolve()}ti(e,n){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){const n=this.Xr(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kk{constructor(e){this.ni=e,this.docs=function(){return new Ie(q.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){const r=n.key,i=this.docs.get(r),s=i?i.size:0,o=this.ni(n);return this.docs=this.docs.insert(r,{document:n.mutableCopy(),size:o}),this.size+=o-s,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){const r=this.docs.get(n);return L.resolve(r?r.document.mutableCopy():ze.newInvalidDocument(n))}getEntries(e,n){let r=Fn();return n.forEach(i=>{const s=this.docs.get(i);r=r.insert(i,s?s.document.mutableCopy():ze.newInvalidDocument(i))}),L.resolve(r)}getDocumentsMatchingQuery(e,n,r,i){let s=Fn();const o=n.path,l=new q(o.child("__id-9223372036854775808__")),u=this.docs.getIteratorFrom(l);for(;u.hasNext();){const{key:h,value:{document:f}}=u.getNext();if(!o.isPrefixOf(h.path))break;h.path.length>o.length+1||AS(xS(f),r)<=0||(i.has(f.key)||Lu(n,f))&&(s=s.insert(f.key,f.mutableCopy()))}return L.resolve(s)}getAllFromCollectionGroup(e,n,r,i){W(9500)}ri(e,n){return L.forEach(this.docs,r=>n(r))}newChangeBuffer(e){return new Qk(this)}getSize(e){return L.resolve(this.size)}}class Qk extends zk{constructor(e){super(),this.Or=e}applyChanges(e){const n=[];return this.changes.forEach((r,i)=>{i.isValidDocument()?n.push(this.Or.addEntry(e,i)):this.Or.removeEntry(r)}),L.waitFor(n)}getFromCache(e,n){return this.Or.getEntry(e,n)}getAllFromCache(e,n){return this.Or.getEntries(e,n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xk{constructor(e){this.persistence=e,this.ii=new gi(n=>Rf(n),Cf),this.lastRemoteSnapshotVersion=K.min(),this.highestTargetId=0,this.si=0,this.oi=new Vf,this.targetCount=0,this._i=ls.ar()}forEachTarget(e,n){return this.ii.forEach((r,i)=>n(i)),L.resolve()}getLastRemoteSnapshotVersion(e){return L.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return L.resolve(this.si)}allocateTargetId(e){return this.highestTargetId=this._i.next(),L.resolve(this.highestTargetId)}setTargetsMetadata(e,n,r){return r&&(this.lastRemoteSnapshotVersion=r),n>this.si&&(this.si=n),L.resolve()}hr(e){this.ii.set(e.target,e);const n=e.targetId;n>this.highestTargetId&&(this._i=new ls(n),this.highestTargetId=n),e.sequenceNumber>this.si&&(this.si=e.sequenceNumber)}addTargetData(e,n){return this.hr(n),this.targetCount+=1,L.resolve()}updateTargetData(e,n){return this.hr(n),L.resolve()}removeTargetData(e,n){return this.ii.delete(n.target),this.oi.zr(n.targetId),this.targetCount-=1,L.resolve()}removeTargets(e,n,r){let i=0;const s=[];return this.ii.forEach((o,l)=>{l.sequenceNumber<=n&&r.get(l.targetId)===null&&(this.ii.delete(o),s.push(this.removeMatchingKeysForTargetId(e,l.targetId)),i++)}),L.waitFor(s).next(()=>i)}getTargetCount(e){return L.resolve(this.targetCount)}getTargetData(e,n){const r=this.ii.get(n)||null;return L.resolve(r)}addMatchingKeys(e,n,r){return this.oi.Kr(n,r),L.resolve()}removeMatchingKeys(e,n,r){this.oi.Gr(n,r);const i=this.persistence.referenceDelegate,s=[];return i&&n.forEach(o=>{s.push(i.markPotentiallyOrphaned(e,o))}),L.waitFor(s)}removeMatchingKeysForTargetId(e,n){return this.oi.zr(n),L.resolve()}getMatchingKeysForTargetId(e,n){const r=this.oi.Jr(n);return L.resolve(r)}containsKey(e,n){return L.resolve(this.oi.containsKey(n))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gw{constructor(e,n){this.ai={},this.overlays={},this.ui=new Du(0),this.ci=!1,this.ci=!0,this.li=new Wk,this.referenceDelegate=e(this),this.hi=new Xk(this),this.indexManager=new Ok,this.remoteDocumentCache=function(i){return new Kk(i)}(r=>this.referenceDelegate.Pi(r)),this.serializer=new bk(n),this.Ti=new Hk(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ci=!1,Promise.resolve()}get started(){return this.ci}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new qk,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let r=this.ai[e.toKey()];return r||(r=new Gk(n,this.referenceDelegate),this.ai[e.toKey()]=r),r}getGlobalsCache(){return this.li}getTargetCache(){return this.hi}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ti}runTransaction(e,n,r){$("MemoryPersistence","Starting transaction:",e);const i=new Yk(this.ui.next());return this.referenceDelegate.Ii(),r(i).next(s=>this.referenceDelegate.di(i).next(()=>s)).toPromise().then(s=>(i.raiseOnCommittedEvent(),s))}Ei(e,n){return L.or(Object.values(this.ai).map(r=>()=>r.containsKey(e,n)))}}class Yk extends kS{constructor(e){super(),this.currentSequenceNumber=e}}class Lf{constructor(e){this.persistence=e,this.Ai=new Vf,this.Ri=null}static Vi(e){return new Lf(e)}get mi(){if(this.Ri)return this.Ri;throw W(60996)}addReference(e,n,r){return this.Ai.addReference(r,n),this.mi.delete(r.toString()),L.resolve()}removeReference(e,n,r){return this.Ai.removeReference(r,n),this.mi.add(r.toString()),L.resolve()}markPotentiallyOrphaned(e,n){return this.mi.add(n.toString()),L.resolve()}removeTarget(e,n){this.Ai.zr(n.targetId).forEach(i=>this.mi.add(i.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,n.targetId).next(i=>{i.forEach(s=>this.mi.add(s.toString()))}).next(()=>r.removeTargetData(e,n))}Ii(){this.Ri=new Set}di(e){const n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return L.forEach(this.mi,r=>{const i=q.fromPath(r);return this.fi(e,i).next(s=>{s||n.removeEntry(i,K.min())})}).next(()=>(this.Ri=null,n.apply(e)))}updateLimboDocument(e,n){return this.fi(e,n).next(r=>{r?this.mi.delete(n.toString()):this.mi.add(n.toString())})}Pi(e){return 0}fi(e,n){return L.or([()=>L.resolve(this.Ai.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Ei(e,n)])}}class nu{constructor(e,n){this.persistence=e,this.gi=new gi(r=>PS(r.path),(r,i)=>r.isEqual(i)),this.garbageCollector=Uk(this,n)}static Vi(e,n){return new nu(e,n)}Ii(){}di(e){return L.resolve()}forEachTarget(e,n){return this.persistence.getTargetCache().forEachTarget(e,n)}mr(e){const n=this.yr(e);return this.persistence.getTargetCache().getTargetCount(e).next(r=>n.next(i=>r+i))}yr(e){let n=0;return this.gr(e,r=>{n++}).next(()=>n)}gr(e,n){return L.forEach(this.gi,(r,i)=>this.Sr(e,r,i).next(s=>s?L.resolve():n(i)))}removeTargets(e,n,r){return this.persistence.getTargetCache().removeTargets(e,n,r)}removeOrphanedDocuments(e,n){let r=0;const i=this.persistence.getRemoteDocumentCache(),s=i.newChangeBuffer();return i.ri(e,o=>this.Sr(e,o,n).next(l=>{l||(r++,s.removeEntry(o,K.min()))})).next(()=>s.apply(e)).next(()=>r)}markPotentiallyOrphaned(e,n){return this.gi.set(n,e.currentSequenceNumber),L.resolve()}removeTarget(e,n){const r=n.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,n,r){return this.gi.set(r,e.currentSequenceNumber),L.resolve()}removeReference(e,n,r){return this.gi.set(r,e.currentSequenceNumber),L.resolve()}updateLimboDocument(e,n){return this.gi.set(n,e.currentSequenceNumber),L.resolve()}Pi(e){let n=e.key.toString().length;return e.isFoundDocument()&&(n+=fl(e.data.value)),n}Sr(e,n,r){return L.or([()=>this.persistence.Ei(e,n),()=>this.persistence.getTargetCache().containsKey(e,n),()=>{const i=this.gi.get(n);return L.resolve(i!==void 0&&i>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mf{constructor(e,n,r,i){this.targetId=e,this.fromCache=n,this.Is=r,this.ds=i}static Es(e,n){let r=ne(),i=ne();for(const s of n.docChanges)switch(s.type){case 0:r=r.add(s.doc.key);break;case 1:i=i.add(s.doc.key)}return new Mf(e,n.fromCache,r,i)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jk{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zk{constructor(){this.As=!1,this.Rs=!1,this.Vs=100,this.fs=function(){return Gx()?8:RS(ot())>0?6:4}()}initialize(e,n){this.gs=e,this.indexManager=n,this.As=!0}getDocumentsMatchingQuery(e,n,r,i){const s={result:null};return this.ps(e,n).next(o=>{s.result=o}).next(()=>{if(!s.result)return this.ys(e,n,i,r).next(o=>{s.result=o})}).next(()=>{if(s.result)return;const o=new Jk;return this.ws(e,n,o).next(l=>{if(s.result=l,this.Rs)return this.Ss(e,n,o,l.size)})}).next(()=>s.result)}Ss(e,n,r,i){return r.documentReadCount<this.Vs?(Ii()<=te.DEBUG&&$("QueryEngine","SDK will not create cache indexes for query:",xi(n),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),L.resolve()):(Ii()<=te.DEBUG&&$("QueryEngine","Query:",xi(n),"scans",r.documentReadCount,"local documents and returns",i,"documents as results."),r.documentReadCount>this.fs*i?(Ii()<=te.DEBUG&&$("QueryEngine","The SDK decides to create cache indexes for query:",xi(n),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,an(n))):L.resolve())}ps(e,n){if(fy(n))return L.resolve(null);let r=an(n);return this.indexManager.getIndexType(e,r).next(i=>i===0?null:(n.limit!==null&&i===1&&(n=Jl(n,null,"F"),r=an(n)),this.indexManager.getDocumentsMatchingTarget(e,r).next(s=>{const o=ne(...s);return this.gs.getDocuments(e,o).next(l=>this.indexManager.getMinOffset(e,r).next(u=>{const h=this.bs(n,l);return this.Ds(n,h,o,u.readTime)?this.ps(e,Jl(n,null,"F")):this.vs(e,h,n,u)}))})))}ys(e,n,r,i){return fy(n)||i.isEqual(K.min())?L.resolve(null):this.gs.getDocuments(e,r).next(s=>{const o=this.bs(n,s);return this.Ds(n,o,r,i)?L.resolve(null):(Ii()<=te.DEBUG&&$("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),xi(n)),this.vs(e,o,n,IS(i,Mo)).next(l=>l))})}bs(e,n){let r=new je(Tw(e));return n.forEach((i,s)=>{Lu(e,s)&&(r=r.add(s))}),r}Ds(e,n,r,i){if(e.limit===null)return!1;if(r.size!==n.size)return!0;const s=e.limitType==="F"?n.last():n.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(i)>0)}ws(e,n,r){return Ii()<=te.DEBUG&&$("QueryEngine","Using full collection scan to execute query:",xi(n)),this.gs.getDocumentsMatchingQuery(e,n,Tr.min(),r)}vs(e,n,r,i){return this.gs.getDocumentsMatchingQuery(e,r,i).next(s=>(n.forEach(o=>{s=s.insert(o.key,o)}),s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jf="LocalStore",eR=3e8;class tR{constructor(e,n,r,i){this.persistence=e,this.Cs=n,this.serializer=i,this.Fs=new Ie(Z),this.Ms=new gi(s=>Rf(s),Cf),this.xs=new Map,this.Os=e.getRemoteDocumentCache(),this.hi=e.getTargetCache(),this.Ti=e.getBundleCache(),this.Ns(r)}Ns(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new $k(this.Os,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Os.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.Fs))}}function nR(t,e,n,r){return new tR(t,e,n,r)}async function Kw(t,e){const n=Q(t);return await n.persistence.runTransaction("Handle user change","readonly",r=>{let i;return n.mutationQueue.getAllMutationBatches(r).next(s=>(i=s,n.Ns(e),n.mutationQueue.getAllMutationBatches(r))).next(s=>{const o=[],l=[];let u=ne();for(const h of i){o.push(h.batchId);for(const f of h.mutations)u=u.add(f.key)}for(const h of s){l.push(h.batchId);for(const f of h.mutations)u=u.add(f.key)}return n.localDocuments.getDocuments(r,u).next(h=>({Bs:h,removedBatchIds:o,addedBatchIds:l}))})})}function rR(t,e){const n=Q(t);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const i=e.batch.keys(),s=n.Os.newChangeBuffer({trackRemovals:!0});return function(l,u,h,f){const p=h.batch,m=p.keys();let S=L.resolve();return m.forEach(R=>{S=S.next(()=>f.getEntry(u,R)).next(N=>{const O=h.docVersions.get(R);ie(O!==null,48541),N.version.compareTo(O)<0&&(p.applyToRemoteDocument(N,h),N.isValidDocument()&&(N.setReadTime(h.commitVersion),f.addEntry(N)))})}),S.next(()=>l.mutationQueue.removeMutationBatch(u,p))}(n,r,e,s).next(()=>s.apply(r)).next(()=>n.mutationQueue.performConsistencyCheck(r)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(r,i,e.batch.batchId)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(l){let u=ne();for(let h=0;h<l.mutationResults.length;++h)l.mutationResults[h].transformResults.length>0&&(u=u.add(l.batch.mutations[h].key));return u}(e))).next(()=>n.localDocuments.getDocuments(r,i))})}function Qw(t){const e=Q(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.hi.getLastRemoteSnapshotVersion(n))}function iR(t,e){const n=Q(t),r=e.snapshotVersion;let i=n.Fs;return n.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{const o=n.Os.newChangeBuffer({trackRemovals:!0});i=n.Fs;const l=[];e.targetChanges.forEach((f,p)=>{const m=i.get(p);if(!m)return;l.push(n.hi.removeMatchingKeys(s,f.removedDocuments,p).next(()=>n.hi.addMatchingKeys(s,f.addedDocuments,p)));let S=m.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(p)!==null?S=S.withResumeToken(Qe.EMPTY_BYTE_STRING,K.min()).withLastLimboFreeSnapshotVersion(K.min()):f.resumeToken.approximateByteSize()>0&&(S=S.withResumeToken(f.resumeToken,r)),i=i.insert(p,S),function(N,O,I){return N.resumeToken.approximateByteSize()===0||O.snapshotVersion.toMicroseconds()-N.snapshotVersion.toMicroseconds()>=eR?!0:I.addedDocuments.size+I.modifiedDocuments.size+I.removedDocuments.size>0}(m,S,f)&&l.push(n.hi.updateTargetData(s,S))});let u=Fn(),h=ne();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&l.push(n.persistence.referenceDelegate.updateLimboDocument(s,f))}),l.push(sR(s,o,e.documentUpdates).next(f=>{u=f.Ls,h=f.ks})),!r.isEqual(K.min())){const f=n.hi.getLastRemoteSnapshotVersion(s).next(p=>n.hi.setTargetsMetadata(s,s.currentSequenceNumber,r));l.push(f)}return L.waitFor(l).next(()=>o.apply(s)).next(()=>n.localDocuments.getLocalViewOfDocuments(s,u,h)).next(()=>u)}).then(s=>(n.Fs=i,s))}function sR(t,e,n){let r=ne(),i=ne();return n.forEach(s=>r=r.add(s)),e.getEntries(t,r).next(s=>{let o=Fn();return n.forEach((l,u)=>{const h=s.get(l);u.isFoundDocument()!==h.isFoundDocument()&&(i=i.add(l)),u.isNoDocument()&&u.version.isEqual(K.min())?(e.removeEntry(l,u.readTime),o=o.insert(l,u)):!h.isValidDocument()||u.version.compareTo(h.version)>0||u.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(u),o=o.insert(l,u)):$(jf,"Ignoring outdated watch update for ",l,". Current version:",h.version," Watch version:",u.version)}),{Ls:o,ks:i}})}function oR(t,e){const n=Q(t);return n.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=Af),n.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function aR(t,e){const n=Q(t);return n.persistence.runTransaction("Allocate target","readwrite",r=>{let i;return n.hi.getTargetData(r,e).next(s=>s?(i=s,L.resolve(i)):n.hi.allocateTargetId(r).next(o=>(i=new nr(e,o,"TargetPurposeListen",r.currentSequenceNumber),n.hi.addTargetData(r,i).next(()=>i))))}).then(r=>{const i=n.Fs.get(r.targetId);return(i===null||r.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(n.Fs=n.Fs.insert(r.targetId,r),n.Ms.set(e,r.targetId)),r})}async function dd(t,e,n){const r=Q(t),i=r.Fs.get(e),s=n?"readwrite":"readwrite-primary";try{n||await r.persistence.runTransaction("Release target",s,o=>r.persistence.referenceDelegate.removeTarget(o,i))}catch(o){if(!gs(o))throw o;$(jf,`Failed to update sequence numbers for target ${e}: ${o}`)}r.Fs=r.Fs.remove(e),r.Ms.delete(i.target)}function Sy(t,e,n){const r=Q(t);let i=K.min(),s=ne();return r.persistence.runTransaction("Execute query","readwrite",o=>function(u,h,f){const p=Q(u),m=p.Ms.get(f);return m!==void 0?L.resolve(p.Fs.get(m)):p.hi.getTargetData(h,f)}(r,o,an(e)).next(l=>{if(l)return i=l.lastLimboFreeSnapshotVersion,r.hi.getMatchingKeysForTargetId(o,l.targetId).next(u=>{s=u})}).next(()=>r.Cs.getDocumentsMatchingQuery(o,e,n?i:K.min(),n?s:ne())).next(l=>(lR(r,QS(e),l),{documents:l,qs:s})))}function lR(t,e,n){let r=t.xs.get(e)||K.min();n.forEach((i,s)=>{s.readTime.compareTo(r)>0&&(r=s.readTime)}),t.xs.set(e,r)}class ky{constructor(){this.activeTargetIds=tk()}Gs(e){this.activeTargetIds=this.activeTargetIds.add(e)}zs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class uR{constructor(){this.Fo=new ky,this.Mo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,r){}addLocalQueryTarget(e,n=!0){return n&&this.Fo.Gs(e),this.Mo[e]||"not-current"}updateQueryState(e,n,r){this.Mo[e]=n}removeLocalQueryTarget(e){this.Fo.zs(e)}isLocalQueryTarget(e){return this.Fo.activeTargetIds.has(e)}clearQueryState(e){delete this.Mo[e]}getAllActiveQueryTargets(){return this.Fo.activeTargetIds}isActiveQueryTarget(e){return this.Fo.activeTargetIds.has(e)}start(){return this.Fo=new ky,Promise.resolve()}handleUserChange(e,n,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cR{xo(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ry="ConnectivityMonitor";class Cy{constructor(){this.Oo=()=>this.No(),this.Bo=()=>this.Lo(),this.ko=[],this.qo()}xo(e){this.ko.push(e)}shutdown(){window.removeEventListener("online",this.Oo),window.removeEventListener("offline",this.Bo)}qo(){window.addEventListener("online",this.Oo),window.addEventListener("offline",this.Bo)}No(){$(Ry,"Network connectivity changed: AVAILABLE");for(const e of this.ko)e(0)}Lo(){$(Ry,"Network connectivity changed: UNAVAILABLE");for(const e of this.ko)e(1)}static C(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Xa=null;function fd(){return Xa===null?Xa=function(){return 268435456+Math.round(2147483648*Math.random())}():Xa++,"0x"+Xa.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yc="RestConnection",hR={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class dR{get Qo(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const n=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.$o=n+"://"+e.host,this.Uo=`projects/${r}/databases/${i}`,this.Ko=this.databaseId.database===Ql?`project_id=${r}`:`project_id=${r}&database_id=${i}`}Wo(e,n,r,i,s){const o=fd(),l=this.Go(e,n.toUriEncodedString());$(Yc,`Sending RPC '${e}' ${o}:`,l,r);const u={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.Ko};this.zo(u,i,s);const{host:h}=new URL(l),f=br(h);return this.jo(e,l,u,r,f).then(p=>($(Yc,`Received RPC '${e}' ${o}: `,p),p),p=>{throw Er(Yc,`RPC '${e}' ${o} failed with error: `,p,"url: ",l,"request:",r),p})}Jo(e,n,r,i,s,o){return this.Wo(e,n,r,i,s)}zo(e,n,r){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+ps}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),n&&n.headers.forEach((i,s)=>e[s]=i),r&&r.headers.forEach((i,s)=>e[s]=i)}Go(e,n){const r=hR[e];return`${this.$o}/v1/${n}:${r}`}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fR{constructor(e){this.Ho=e.Ho,this.Yo=e.Yo}Zo(e){this.Xo=e}e_(e){this.t_=e}n_(e){this.r_=e}onMessage(e){this.i_=e}close(){this.Yo()}send(e){this.Ho(e)}s_(){this.Xo()}o_(){this.t_()}__(e){this.r_(e)}a_(e){this.i_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tt="WebChannelConnection";class pR extends dR{constructor(e){super(e),this.u_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}jo(e,n,r,i,s){const o=fd();return new Promise((l,u)=>{const h=new K0;h.setWithCredentials(!0),h.listenOnce(Q0.COMPLETE,()=>{try{switch(h.getLastErrorCode()){case dl.NO_ERROR:const p=h.getResponseJson();$(tt,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(p)),l(p);break;case dl.TIMEOUT:$(tt,`RPC '${e}' ${o} timed out`),u(new z(V.DEADLINE_EXCEEDED,"Request time out"));break;case dl.HTTP_ERROR:const m=h.getStatus();if($(tt,`RPC '${e}' ${o} failed with status:`,m,"response text:",h.getResponseText()),m>0){let S=h.getResponseJson();Array.isArray(S)&&(S=S[0]);const R=S==null?void 0:S.error;if(R&&R.status&&R.message){const N=function(I){const w=I.toLowerCase().replace(/_/g,"-");return Object.values(V).indexOf(w)>=0?w:V.UNKNOWN}(R.status);u(new z(N,R.message))}else u(new z(V.UNKNOWN,"Server responded with status "+h.getStatus()))}else u(new z(V.UNAVAILABLE,"Connection failed."));break;default:W(9055,{c_:e,streamId:o,l_:h.getLastErrorCode(),h_:h.getLastError()})}}finally{$(tt,`RPC '${e}' ${o} completed.`)}});const f=JSON.stringify(i);$(tt,`RPC '${e}' ${o} sending request:`,i),h.send(n,"POST",f,r,15)})}P_(e,n,r){const i=fd(),s=[this.$o,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=J0(),l=Y0(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},h=this.longPollingOptions.timeoutSeconds;h!==void 0&&(u.longPollingTimeout=Math.round(1e3*h)),this.useFetchStreams&&(u.useFetchStreams=!0),this.zo(u.initMessageHeaders,n,r),u.encodeInitMessageHeaders=!0;const f=s.join("");$(tt,`Creating RPC '${e}' stream ${i}: ${f}`,u);const p=o.createWebChannel(f,u);this.T_(p);let m=!1,S=!1;const R=new fR({Ho:O=>{S?$(tt,`Not sending because RPC '${e}' stream ${i} is closed:`,O):(m||($(tt,`Opening RPC '${e}' stream ${i} transport.`),p.open(),m=!0),$(tt,`RPC '${e}' stream ${i} sending:`,O),p.send(O))},Yo:()=>p.close()}),N=(O,I,w)=>{O.listen(I,E=>{try{w(E)}catch(b){setTimeout(()=>{throw b},0)}})};return N(p,Xs.EventType.OPEN,()=>{S||($(tt,`RPC '${e}' stream ${i} transport opened.`),R.s_())}),N(p,Xs.EventType.CLOSE,()=>{S||(S=!0,$(tt,`RPC '${e}' stream ${i} transport closed`),R.__(),this.I_(p))}),N(p,Xs.EventType.ERROR,O=>{S||(S=!0,Er(tt,`RPC '${e}' stream ${i} transport errored. Name:`,O.name,"Message:",O.message),R.__(new z(V.UNAVAILABLE,"The operation could not be completed")))}),N(p,Xs.EventType.MESSAGE,O=>{var I;if(!S){const w=O.data[0];ie(!!w,16349);const E=w,b=(E==null?void 0:E.error)||((I=E[0])===null||I===void 0?void 0:I.error);if(b){$(tt,`RPC '${e}' stream ${i} received error:`,b);const M=b.status;let j=function(T){const x=be[T];if(x!==void 0)return Vw(x)}(M),v=b.message;j===void 0&&(j=V.INTERNAL,v="Unknown error status: "+M+" with message "+b.message),S=!0,R.__(new z(j,v)),p.close()}else $(tt,`RPC '${e}' stream ${i} received:`,w),R.a_(w)}}),N(l,X0.STAT_EVENT,O=>{O.stat===nd.PROXY?$(tt,`RPC '${e}' stream ${i} detected buffering proxy`):O.stat===nd.NOPROXY&&$(tt,`RPC '${e}' stream ${i} detected no buffering proxy`)}),setTimeout(()=>{R.o_()},0),R}terminate(){this.u_.forEach(e=>e.close()),this.u_=[]}T_(e){this.u_.push(e)}I_(e){this.u_=this.u_.filter(n=>n===e)}}function Jc(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zu(t){return new _k(t,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ff{constructor(e,n,r=1e3,i=1.5,s=6e4){this.Fi=e,this.timerId=n,this.d_=r,this.E_=i,this.A_=s,this.R_=0,this.V_=null,this.m_=Date.now(),this.reset()}reset(){this.R_=0}f_(){this.R_=this.A_}g_(e){this.cancel();const n=Math.floor(this.R_+this.p_()),r=Math.max(0,Date.now()-this.m_),i=Math.max(0,n-r);i>0&&$("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.R_} ms, delay with jitter: ${n} ms, last attempt: ${r} ms ago)`),this.V_=this.Fi.enqueueAfterDelay(this.timerId,i,()=>(this.m_=Date.now(),e())),this.R_*=this.E_,this.R_<this.d_&&(this.R_=this.d_),this.R_>this.A_&&(this.R_=this.A_)}y_(){this.V_!==null&&(this.V_.skipDelay(),this.V_=null)}cancel(){this.V_!==null&&(this.V_.cancel(),this.V_=null)}p_(){return(Math.random()-.5)*this.R_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Py="PersistentStream";class Xw{constructor(e,n,r,i,s,o,l,u){this.Fi=e,this.w_=r,this.S_=i,this.connection=s,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=l,this.listener=u,this.state=0,this.b_=0,this.D_=null,this.v_=null,this.stream=null,this.C_=0,this.F_=new Ff(e,n)}M_(){return this.state===1||this.state===5||this.x_()}x_(){return this.state===2||this.state===3}start(){this.C_=0,this.state!==4?this.auth():this.O_()}async stop(){this.M_()&&await this.close(0)}N_(){this.state=0,this.F_.reset()}B_(){this.x_()&&this.D_===null&&(this.D_=this.Fi.enqueueAfterDelay(this.w_,6e4,()=>this.L_()))}k_(e){this.q_(),this.stream.send(e)}async L_(){if(this.x_())return this.close(0)}q_(){this.D_&&(this.D_.cancel(),this.D_=null)}Q_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,n){this.q_(),this.Q_(),this.F_.cancel(),this.b_++,e!==4?this.F_.reset():n&&n.code===V.RESOURCE_EXHAUSTED?(jn(n.toString()),jn("Using maximum backoff delay to prevent overloading the backend."),this.F_.f_()):n&&n.code===V.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.U_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.n_(n)}U_(){}auth(){this.state=1;const e=this.K_(this.b_),n=this.b_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,i])=>{this.b_===n&&this.W_(r,i)},r=>{e(()=>{const i=new z(V.UNKNOWN,"Fetching auth token failed: "+r.message);return this.G_(i)})})}W_(e,n){const r=this.K_(this.b_);this.stream=this.z_(e,n),this.stream.Zo(()=>{r(()=>this.listener.Zo())}),this.stream.e_(()=>{r(()=>(this.state=2,this.v_=this.Fi.enqueueAfterDelay(this.S_,1e4,()=>(this.x_()&&(this.state=3),Promise.resolve())),this.listener.e_()))}),this.stream.n_(i=>{r(()=>this.G_(i))}),this.stream.onMessage(i=>{r(()=>++this.C_==1?this.j_(i):this.onNext(i))})}O_(){this.state=5,this.F_.g_(async()=>{this.state=0,this.start()})}G_(e){return $(Py,`close with error: ${e}`),this.stream=null,this.close(4,e)}K_(e){return n=>{this.Fi.enqueueAndForget(()=>this.b_===e?n():($(Py,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class mR extends Xw{constructor(e,n,r,i,s,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,r,i,o),this.serializer=s}z_(e,n){return this.connection.P_("Listen",e,n)}j_(e){return this.onNext(e)}onNext(e){this.F_.reset();const n=Tk(this.serializer,e),r=function(s){if(!("targetChange"in s))return K.min();const o=s.targetChange;return o.targetIds&&o.targetIds.length?K.min():o.readTime?Ct(o.readTime):K.min()}(e);return this.listener.J_(n,r)}H_(e){const n={};n.database=hd(this.serializer),n.addTarget=function(s,o){let l;const u=o.target;if(l=ad(u)?{documents:xk(s,u)}:{query:Ak(s,u).Vt},l.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){l.resumeToken=jw(s,o.resumeToken);const h=ud(s,o.expectedCount);h!==null&&(l.expectedCount=h)}else if(o.snapshotVersion.compareTo(K.min())>0){l.readTime=eu(s,o.snapshotVersion.toTimestamp());const h=ud(s,o.expectedCount);h!==null&&(l.expectedCount=h)}return l}(this.serializer,e);const r=kk(this.serializer,e);r&&(n.labels=r),this.k_(n)}Y_(e){const n={};n.database=hd(this.serializer),n.removeTarget=e,this.k_(n)}}class gR extends Xw{constructor(e,n,r,i,s,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",n,r,i,o),this.serializer=s}get Z_(){return this.C_>0}start(){this.lastStreamToken=void 0,super.start()}U_(){this.Z_&&this.X_([])}z_(e,n){return this.connection.P_("Write",e,n)}j_(e){return ie(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,ie(!e.writeResults||e.writeResults.length===0,55816),this.listener.ea()}onNext(e){ie(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.F_.reset();const n=Ik(e.writeResults,e.commitTime),r=Ct(e.commitTime);return this.listener.ta(r,n)}na(){const e={};e.database=hd(this.serializer),this.k_(e)}X_(e){const n={streamToken:this.lastStreamToken,writes:e.map(r=>Bw(this.serializer,r))};this.k_(n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yR{}class _R extends yR{constructor(e,n,r,i){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=r,this.serializer=i,this.ra=!1}ia(){if(this.ra)throw new z(V.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,n,r,i){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,o])=>this.connection.Wo(e,cd(n,r),i,s,o)).catch(s=>{throw s.name==="FirebaseError"?(s.code===V.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new z(V.UNKNOWN,s.toString())})}Jo(e,n,r,i,s){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,l])=>this.connection.Jo(e,cd(n,r),i,o,l,s)).catch(o=>{throw o.name==="FirebaseError"?(o.code===V.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new z(V.UNKNOWN,o.toString())})}terminate(){this.ra=!0,this.connection.terminate()}}class vR{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.sa=0,this.oa=null,this._a=!0}aa(){this.sa===0&&(this.ua("Unknown"),this.oa=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.oa=null,this.ca("Backend didn't respond within 10 seconds."),this.ua("Offline"),Promise.resolve())))}la(e){this.state==="Online"?this.ua("Unknown"):(this.sa++,this.sa>=1&&(this.ha(),this.ca(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ua("Offline")))}set(e){this.ha(),this.sa=0,e==="Online"&&(this._a=!1),this.ua(e)}ua(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ca(e){const n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this._a?(jn(n),this._a=!1):$("OnlineStateTracker",n)}ha(){this.oa!==null&&(this.oa.cancel(),this.oa=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ci="RemoteStore";class wR{constructor(e,n,r,i,s){this.localStore=e,this.datastore=n,this.asyncQueue=r,this.remoteSyncer={},this.Pa=[],this.Ta=new Map,this.Ia=new Set,this.da=[],this.Ea=s,this.Ea.xo(o=>{r.enqueueAndForget(async()=>{yi(this)&&($(ci,"Restarting streams for network reachability change."),await async function(u){const h=Q(u);h.Ia.add(4),await ia(h),h.Aa.set("Unknown"),h.Ia.delete(4),await Bu(h)}(this))})}),this.Aa=new vR(r,i)}}async function Bu(t){if(yi(t))for(const e of t.da)await e(!0)}async function ia(t){for(const e of t.da)await e(!1)}function Yw(t,e){const n=Q(t);n.Ta.has(e.targetId)||(n.Ta.set(e.targetId,e),$f(n)?Bf(n):_s(n).x_()&&zf(n,e))}function Uf(t,e){const n=Q(t),r=_s(n);n.Ta.delete(e),r.x_()&&Jw(n,e),n.Ta.size===0&&(r.x_()?r.B_():yi(n)&&n.Aa.set("Unknown"))}function zf(t,e){if(t.Ra.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(K.min())>0){const n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}_s(t).H_(e)}function Jw(t,e){t.Ra.$e(e),_s(t).Y_(e)}function Bf(t){t.Ra=new pk({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),Et:e=>t.Ta.get(e)||null,lt:()=>t.datastore.serializer.databaseId}),_s(t).start(),t.Aa.aa()}function $f(t){return yi(t)&&!_s(t).M_()&&t.Ta.size>0}function yi(t){return Q(t).Ia.size===0}function Zw(t){t.Ra=void 0}async function ER(t){t.Aa.set("Online")}async function TR(t){t.Ta.forEach((e,n)=>{zf(t,e)})}async function IR(t,e){Zw(t),$f(t)?(t.Aa.la(e),Bf(t)):t.Aa.set("Unknown")}async function xR(t,e,n){if(t.Aa.set("Online"),e instanceof Mw&&e.state===2&&e.cause)try{await async function(i,s){const o=s.cause;for(const l of s.targetIds)i.Ta.has(l)&&(await i.remoteSyncer.rejectListen(l,o),i.Ta.delete(l),i.Ra.removeTarget(l))}(t,e)}catch(r){$(ci,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await ru(t,r)}else if(e instanceof gl?t.Ra.Ye(e):e instanceof Lw?t.Ra.it(e):t.Ra.et(e),!n.isEqual(K.min()))try{const r=await Qw(t.localStore);n.compareTo(r)>=0&&await function(s,o){const l=s.Ra.Pt(o);return l.targetChanges.forEach((u,h)=>{if(u.resumeToken.approximateByteSize()>0){const f=s.Ta.get(h);f&&s.Ta.set(h,f.withResumeToken(u.resumeToken,o))}}),l.targetMismatches.forEach((u,h)=>{const f=s.Ta.get(u);if(!f)return;s.Ta.set(u,f.withResumeToken(Qe.EMPTY_BYTE_STRING,f.snapshotVersion)),Jw(s,u);const p=new nr(f.target,u,h,f.sequenceNumber);zf(s,p)}),s.remoteSyncer.applyRemoteEvent(l)}(t,n)}catch(r){$(ci,"Failed to raise snapshot:",r),await ru(t,r)}}async function ru(t,e,n){if(!gs(e))throw e;t.Ia.add(1),await ia(t),t.Aa.set("Offline"),n||(n=()=>Qw(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{$(ci,"Retrying IndexedDB access"),await n(),t.Ia.delete(1),await Bu(t)})}function eE(t,e){return e().catch(n=>ru(t,n,e))}async function $u(t){const e=Q(t),n=Sr(e);let r=e.Pa.length>0?e.Pa[e.Pa.length-1].batchId:Af;for(;AR(e);)try{const i=await oR(e.localStore,r);if(i===null){e.Pa.length===0&&n.B_();break}r=i.batchId,SR(e,i)}catch(i){await ru(e,i)}tE(e)&&nE(e)}function AR(t){return yi(t)&&t.Pa.length<10}function SR(t,e){t.Pa.push(e);const n=Sr(t);n.x_()&&n.Z_&&n.X_(e.mutations)}function tE(t){return yi(t)&&!Sr(t).M_()&&t.Pa.length>0}function nE(t){Sr(t).start()}async function kR(t){Sr(t).na()}async function RR(t){const e=Sr(t);for(const n of t.Pa)e.X_(n.mutations)}async function CR(t,e,n){const r=t.Pa.shift(),i=bf.from(r,e,n);await eE(t,()=>t.remoteSyncer.applySuccessfulWrite(i)),await $u(t)}async function PR(t,e){e&&Sr(t).Z_&&await async function(r,i){if(function(o){return Ow(o)&&o!==V.ABORTED}(i.code)){const s=r.Pa.shift();Sr(r).N_(),await eE(r,()=>r.remoteSyncer.rejectFailedWrite(s.batchId,i)),await $u(r)}}(t,e),tE(t)&&nE(t)}async function Ny(t,e){const n=Q(t);n.asyncQueue.verifyOperationInProgress(),$(ci,"RemoteStore received new credentials");const r=yi(n);n.Ia.add(3),await ia(n),r&&n.Aa.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.Ia.delete(3),await Bu(n)}async function NR(t,e){const n=Q(t);e?(n.Ia.delete(2),await Bu(n)):e||(n.Ia.add(2),await ia(n),n.Aa.set("Unknown"))}function _s(t){return t.Va||(t.Va=function(n,r,i){const s=Q(n);return s.ia(),new mR(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(t.datastore,t.asyncQueue,{Zo:ER.bind(null,t),e_:TR.bind(null,t),n_:IR.bind(null,t),J_:xR.bind(null,t)}),t.da.push(async e=>{e?(t.Va.N_(),$f(t)?Bf(t):t.Aa.set("Unknown")):(await t.Va.stop(),Zw(t))})),t.Va}function Sr(t){return t.ma||(t.ma=function(n,r,i){const s=Q(n);return s.ia(),new gR(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(t.datastore,t.asyncQueue,{Zo:()=>Promise.resolve(),e_:kR.bind(null,t),n_:PR.bind(null,t),ea:RR.bind(null,t),ta:CR.bind(null,t)}),t.da.push(async e=>{e?(t.ma.N_(),await $u(t)):(await t.ma.stop(),t.Pa.length>0&&($(ci,`Stopping write stream with ${t.Pa.length} pending writes`),t.Pa=[]))})),t.ma}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hf{constructor(e,n,r,i,s){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=r,this.op=i,this.removalCallback=s,this.deferred=new mr,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,r,i,s){const o=Date.now()+r,l=new Hf(e,n,o,i,s);return l.start(r),l}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new z(V.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function qf(t,e){if(jn("AsyncQueue",`${e}: ${t}`),gs(t))return new z(V.UNAVAILABLE,`${e}: ${t}`);throw t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wi{static emptySet(e){return new Wi(e.comparator)}constructor(e){this.comparator=e?(n,r)=>e(n,r)||q.comparator(n.key,r.key):(n,r)=>q.comparator(n.key,r.key),this.keyedMap=Ys(),this.sortedSet=new Ie(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,r)=>(e(n),!1))}add(e){const n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){const n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof Wi)||this.size!==e.size)return!1;const n=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;n.hasNext();){const i=n.getNext().key,s=r.getNext().key;if(!i.isEqual(s))return!1}return!0}toString(){const e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,n){const r=new Wi;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=n,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class by{constructor(){this.fa=new Ie(q.comparator)}track(e){const n=e.doc.key,r=this.fa.get(n);r?e.type!==0&&r.type===3?this.fa=this.fa.insert(n,e):e.type===3&&r.type!==1?this.fa=this.fa.insert(n,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.fa=this.fa.insert(n,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.fa=this.fa.insert(n,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.fa=this.fa.remove(n):e.type===1&&r.type===2?this.fa=this.fa.insert(n,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.fa=this.fa.insert(n,{type:2,doc:e.doc}):W(63341,{At:e,ga:r}):this.fa=this.fa.insert(n,e)}pa(){const e=[];return this.fa.inorderTraversal((n,r)=>{e.push(r)}),e}}class us{constructor(e,n,r,i,s,o,l,u,h){this.query=e,this.docs=n,this.oldDocs=r,this.docChanges=i,this.mutatedKeys=s,this.fromCache=o,this.syncStateChanged=l,this.excludesMetadataChanges=u,this.hasCachedResults=h}static fromInitialDocuments(e,n,r,i,s){const o=[];return n.forEach(l=>{o.push({type:0,doc:l})}),new us(e,n,Wi.emptySet(n),o,r,i,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Vu(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const n=this.docChanges,r=e.docChanges;if(n.length!==r.length)return!1;for(let i=0;i<n.length;i++)if(n[i].type!==r[i].type||!n[i].doc.isEqual(r[i].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bR{constructor(){this.ya=void 0,this.wa=[]}Sa(){return this.wa.some(e=>e.ba())}}class DR{constructor(){this.queries=Dy(),this.onlineState="Unknown",this.Da=new Set}terminate(){(function(n,r){const i=Q(n),s=i.queries;i.queries=Dy(),s.forEach((o,l)=>{for(const u of l.wa)u.onError(r)})})(this,new z(V.ABORTED,"Firestore shutting down"))}}function Dy(){return new gi(t=>Ew(t),Vu)}async function OR(t,e){const n=Q(t);let r=3;const i=e.query;let s=n.queries.get(i);s?!s.Sa()&&e.ba()&&(r=2):(s=new bR,r=e.ba()?0:1);try{switch(r){case 0:s.ya=await n.onListen(i,!0);break;case 1:s.ya=await n.onListen(i,!1);break;case 2:await n.onFirstRemoteStoreListen(i)}}catch(o){const l=qf(o,`Initialization of query '${xi(e.query)}' failed`);return void e.onError(l)}n.queries.set(i,s),s.wa.push(e),e.va(n.onlineState),s.ya&&e.Ca(s.ya)&&Wf(n)}async function VR(t,e){const n=Q(t),r=e.query;let i=3;const s=n.queries.get(r);if(s){const o=s.wa.indexOf(e);o>=0&&(s.wa.splice(o,1),s.wa.length===0?i=e.ba()?0:1:!s.Sa()&&e.ba()&&(i=2))}switch(i){case 0:return n.queries.delete(r),n.onUnlisten(r,!0);case 1:return n.queries.delete(r),n.onUnlisten(r,!1);case 2:return n.onLastRemoteStoreUnlisten(r);default:return}}function LR(t,e){const n=Q(t);let r=!1;for(const i of e){const s=i.query,o=n.queries.get(s);if(o){for(const l of o.wa)l.Ca(i)&&(r=!0);o.ya=i}}r&&Wf(n)}function MR(t,e,n){const r=Q(t),i=r.queries.get(e);if(i)for(const s of i.wa)s.onError(n);r.queries.delete(e)}function Wf(t){t.Da.forEach(e=>{e.next()})}var pd,Oy;(Oy=pd||(pd={})).Fa="default",Oy.Cache="cache";class jR{constructor(e,n,r){this.query=e,this.Ma=n,this.xa=!1,this.Oa=null,this.onlineState="Unknown",this.options=r||{}}Ca(e){if(!this.options.includeMetadataChanges){const r=[];for(const i of e.docChanges)i.type!==3&&r.push(i);e=new us(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.xa?this.Na(e)&&(this.Ma.next(e),n=!0):this.Ba(e,this.onlineState)&&(this.La(e),n=!0),this.Oa=e,n}onError(e){this.Ma.error(e)}va(e){this.onlineState=e;let n=!1;return this.Oa&&!this.xa&&this.Ba(this.Oa,e)&&(this.La(this.Oa),n=!0),n}Ba(e,n){if(!e.fromCache||!this.ba())return!0;const r=n!=="Offline";return(!this.options.ka||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}Na(e){if(e.docChanges.length>0)return!0;const n=this.Oa&&this.Oa.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}La(e){e=us.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.xa=!0,this.Ma.next(e)}ba(){return this.options.source!==pd.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rE{constructor(e){this.key=e}}class iE{constructor(e){this.key=e}}class FR{constructor(e,n){this.query=e,this.Ha=n,this.Ya=null,this.hasCachedResults=!1,this.current=!1,this.Za=ne(),this.mutatedKeys=ne(),this.Xa=Tw(e),this.eu=new Wi(this.Xa)}get tu(){return this.Ha}nu(e,n){const r=n?n.ru:new by,i=n?n.eu:this.eu;let s=n?n.mutatedKeys:this.mutatedKeys,o=i,l=!1;const u=this.query.limitType==="F"&&i.size===this.query.limit?i.last():null,h=this.query.limitType==="L"&&i.size===this.query.limit?i.first():null;if(e.inorderTraversal((f,p)=>{const m=i.get(f),S=Lu(this.query,p)?p:null,R=!!m&&this.mutatedKeys.has(m.key),N=!!S&&(S.hasLocalMutations||this.mutatedKeys.has(S.key)&&S.hasCommittedMutations);let O=!1;m&&S?m.data.isEqual(S.data)?R!==N&&(r.track({type:3,doc:S}),O=!0):this.iu(m,S)||(r.track({type:2,doc:S}),O=!0,(u&&this.Xa(S,u)>0||h&&this.Xa(S,h)<0)&&(l=!0)):!m&&S?(r.track({type:0,doc:S}),O=!0):m&&!S&&(r.track({type:1,doc:m}),O=!0,(u||h)&&(l=!0)),O&&(S?(o=o.add(S),s=N?s.add(f):s.delete(f)):(o=o.delete(f),s=s.delete(f)))}),this.query.limit!==null)for(;o.size>this.query.limit;){const f=this.query.limitType==="F"?o.last():o.first();o=o.delete(f.key),s=s.delete(f.key),r.track({type:1,doc:f})}return{eu:o,ru:r,Ds:l,mutatedKeys:s}}iu(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,r,i){const s=this.eu;this.eu=e.eu,this.mutatedKeys=e.mutatedKeys;const o=e.ru.pa();o.sort((f,p)=>function(S,R){const N=O=>{switch(O){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return W(20277,{At:O})}};return N(S)-N(R)}(f.type,p.type)||this.Xa(f.doc,p.doc)),this.su(r),i=i!=null&&i;const l=n&&!i?this.ou():[],u=this.Za.size===0&&this.current&&!i?1:0,h=u!==this.Ya;return this.Ya=u,o.length!==0||h?{snapshot:new us(this.query,e.eu,s,o,e.mutatedKeys,u===0,h,!1,!!r&&r.resumeToken.approximateByteSize()>0),_u:l}:{_u:l}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({eu:this.eu,ru:new by,mutatedKeys:this.mutatedKeys,Ds:!1},!1)):{_u:[]}}au(e){return!this.Ha.has(e)&&!!this.eu.has(e)&&!this.eu.get(e).hasLocalMutations}su(e){e&&(e.addedDocuments.forEach(n=>this.Ha=this.Ha.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Ha=this.Ha.delete(n)),this.current=e.current)}ou(){if(!this.current)return[];const e=this.Za;this.Za=ne(),this.eu.forEach(r=>{this.au(r.key)&&(this.Za=this.Za.add(r.key))});const n=[];return e.forEach(r=>{this.Za.has(r)||n.push(new iE(r))}),this.Za.forEach(r=>{e.has(r)||n.push(new rE(r))}),n}uu(e){this.Ha=e.qs,this.Za=ne();const n=this.nu(e.documents);return this.applyChanges(n,!0)}cu(){return us.fromInitialDocuments(this.query,this.eu,this.mutatedKeys,this.Ya===0,this.hasCachedResults)}}const Gf="SyncEngine";class UR{constructor(e,n,r){this.query=e,this.targetId=n,this.view=r}}class zR{constructor(e){this.key=e,this.lu=!1}}class BR{constructor(e,n,r,i,s,o){this.localStore=e,this.remoteStore=n,this.eventManager=r,this.sharedClientState=i,this.currentUser=s,this.maxConcurrentLimboResolutions=o,this.hu={},this.Pu=new gi(l=>Ew(l),Vu),this.Tu=new Map,this.Iu=new Set,this.du=new Ie(q.comparator),this.Eu=new Map,this.Au=new Vf,this.Ru={},this.Vu=new Map,this.mu=ls.ur(),this.onlineState="Unknown",this.fu=void 0}get isPrimaryClient(){return this.fu===!0}}async function $R(t,e,n=!0){const r=cE(t);let i;const s=r.Pu.get(e);return s?(r.sharedClientState.addLocalQueryTarget(s.targetId),i=s.view.cu()):i=await sE(r,e,n,!0),i}async function HR(t,e){const n=cE(t);await sE(n,e,!0,!1)}async function sE(t,e,n,r){const i=await aR(t.localStore,an(e)),s=i.targetId,o=t.sharedClientState.addLocalQueryTarget(s,n);let l;return r&&(l=await qR(t,e,s,o==="current",i.resumeToken)),t.isPrimaryClient&&n&&Yw(t.remoteStore,i),l}async function qR(t,e,n,r,i){t.gu=(p,m,S)=>async function(N,O,I,w){let E=O.view.nu(I);E.Ds&&(E=await Sy(N.localStore,O.query,!1).then(({documents:v})=>O.view.nu(v,E)));const b=w&&w.targetChanges.get(O.targetId),M=w&&w.targetMismatches.get(O.targetId)!=null,j=O.view.applyChanges(E,N.isPrimaryClient,b,M);return Ly(N,O.targetId,j._u),j.snapshot}(t,p,m,S);const s=await Sy(t.localStore,e,!0),o=new FR(e,s.qs),l=o.nu(s.documents),u=ra.createSynthesizedTargetChangeForCurrentChange(n,r&&t.onlineState!=="Offline",i),h=o.applyChanges(l,t.isPrimaryClient,u);Ly(t,n,h._u);const f=new UR(e,n,o);return t.Pu.set(e,f),t.Tu.has(n)?t.Tu.get(n).push(e):t.Tu.set(n,[e]),h.snapshot}async function WR(t,e,n){const r=Q(t),i=r.Pu.get(e),s=r.Tu.get(i.targetId);if(s.length>1)return r.Tu.set(i.targetId,s.filter(o=>!Vu(o,e))),void r.Pu.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(i.targetId),r.sharedClientState.isActiveQueryTarget(i.targetId)||await dd(r.localStore,i.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(i.targetId),n&&Uf(r.remoteStore,i.targetId),md(r,i.targetId)}).catch(ms)):(md(r,i.targetId),await dd(r.localStore,i.targetId,!0))}async function GR(t,e){const n=Q(t),r=n.Pu.get(e),i=n.Tu.get(r.targetId);n.isPrimaryClient&&i.length===1&&(n.sharedClientState.removeLocalQueryTarget(r.targetId),Uf(n.remoteStore,r.targetId))}async function KR(t,e,n){const r=t2(t);try{const i=await function(o,l){const u=Q(o),h=he.now(),f=l.reduce((S,R)=>S.add(R.key),ne());let p,m;return u.persistence.runTransaction("Locally write mutations","readwrite",S=>{let R=Fn(),N=ne();return u.Os.getEntries(S,f).next(O=>{R=O,R.forEach((I,w)=>{w.isValidDocument()||(N=N.add(I))})}).next(()=>u.localDocuments.getOverlayedDocuments(S,R)).next(O=>{p=O;const I=[];for(const w of l){const E=uk(w,p.get(w.key).overlayedDocument);E!=null&&I.push(new Or(w.key,E,fw(E.value.mapValue),it.exists(!0)))}return u.mutationQueue.addMutationBatch(S,h,I,l)}).next(O=>{m=O;const I=O.applyToLocalDocumentSet(p,N);return u.documentOverlayCache.saveOverlays(S,O.batchId,I)})}).then(()=>({batchId:m.batchId,changes:xw(p)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(i.batchId),function(o,l,u){let h=o.Ru[o.currentUser.toKey()];h||(h=new Ie(Z)),h=h.insert(l,u),o.Ru[o.currentUser.toKey()]=h}(r,i.batchId,n),await sa(r,i.changes),await $u(r.remoteStore)}catch(i){const s=qf(i,"Failed to persist write");n.reject(s)}}async function oE(t,e){const n=Q(t);try{const r=await iR(n.localStore,e);e.targetChanges.forEach((i,s)=>{const o=n.Eu.get(s);o&&(ie(i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size<=1,22616),i.addedDocuments.size>0?o.lu=!0:i.modifiedDocuments.size>0?ie(o.lu,14607):i.removedDocuments.size>0&&(ie(o.lu,42227),o.lu=!1))}),await sa(n,r,e)}catch(r){await ms(r)}}function Vy(t,e,n){const r=Q(t);if(r.isPrimaryClient&&n===0||!r.isPrimaryClient&&n===1){const i=[];r.Pu.forEach((s,o)=>{const l=o.view.va(e);l.snapshot&&i.push(l.snapshot)}),function(o,l){const u=Q(o);u.onlineState=l;let h=!1;u.queries.forEach((f,p)=>{for(const m of p.wa)m.va(l)&&(h=!0)}),h&&Wf(u)}(r.eventManager,e),i.length&&r.hu.J_(i),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function QR(t,e,n){const r=Q(t);r.sharedClientState.updateQueryState(e,"rejected",n);const i=r.Eu.get(e),s=i&&i.key;if(s){let o=new Ie(q.comparator);o=o.insert(s,ze.newNoDocument(s,K.min()));const l=ne().add(s),u=new Uu(K.min(),new Map,new Ie(Z),o,l);await oE(r,u),r.du=r.du.remove(s),r.Eu.delete(e),Kf(r)}else await dd(r.localStore,e,!1).then(()=>md(r,e,n)).catch(ms)}async function XR(t,e){const n=Q(t),r=e.batch.batchId;try{const i=await rR(n.localStore,e);lE(n,r,null),aE(n,r),n.sharedClientState.updateMutationState(r,"acknowledged"),await sa(n,i)}catch(i){await ms(i)}}async function YR(t,e,n){const r=Q(t);try{const i=await function(o,l){const u=Q(o);return u.persistence.runTransaction("Reject batch","readwrite-primary",h=>{let f;return u.mutationQueue.lookupMutationBatch(h,l).next(p=>(ie(p!==null,37113),f=p.keys(),u.mutationQueue.removeMutationBatch(h,p))).next(()=>u.mutationQueue.performConsistencyCheck(h)).next(()=>u.documentOverlayCache.removeOverlaysForBatchId(h,f,l)).next(()=>u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,f)).next(()=>u.localDocuments.getDocuments(h,f))})}(r.localStore,e);lE(r,e,n),aE(r,e),r.sharedClientState.updateMutationState(e,"rejected",n),await sa(r,i)}catch(i){await ms(i)}}function aE(t,e){(t.Vu.get(e)||[]).forEach(n=>{n.resolve()}),t.Vu.delete(e)}function lE(t,e,n){const r=Q(t);let i=r.Ru[r.currentUser.toKey()];if(i){const s=i.get(e);s&&(n?s.reject(n):s.resolve(),i=i.remove(e)),r.Ru[r.currentUser.toKey()]=i}}function md(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(const r of t.Tu.get(e))t.Pu.delete(r),n&&t.hu.pu(r,n);t.Tu.delete(e),t.isPrimaryClient&&t.Au.zr(e).forEach(r=>{t.Au.containsKey(r)||uE(t,r)})}function uE(t,e){t.Iu.delete(e.path.canonicalString());const n=t.du.get(e);n!==null&&(Uf(t.remoteStore,n),t.du=t.du.remove(e),t.Eu.delete(n),Kf(t))}function Ly(t,e,n){for(const r of n)r instanceof rE?(t.Au.addReference(r.key,e),JR(t,r)):r instanceof iE?($(Gf,"Document no longer in limbo: "+r.key),t.Au.removeReference(r.key,e),t.Au.containsKey(r.key)||uE(t,r.key)):W(19791,{yu:r})}function JR(t,e){const n=e.key,r=n.path.canonicalString();t.du.get(n)||t.Iu.has(r)||($(Gf,"New document in limbo: "+n),t.Iu.add(r),Kf(t))}function Kf(t){for(;t.Iu.size>0&&t.du.size<t.maxConcurrentLimboResolutions;){const e=t.Iu.values().next().value;t.Iu.delete(e);const n=new q(le.fromString(e)),r=t.mu.next();t.Eu.set(r,new zR(n)),t.du=t.du.insert(n,r),Yw(t.remoteStore,new nr(an(Pf(n.path)),r,"TargetPurposeLimboResolution",Du.ue))}}async function sa(t,e,n){const r=Q(t),i=[],s=[],o=[];r.Pu.isEmpty()||(r.Pu.forEach((l,u)=>{o.push(r.gu(u,e,n).then(h=>{var f;if((h||n)&&r.isPrimaryClient){const p=h?!h.fromCache:(f=n==null?void 0:n.targetChanges.get(u.targetId))===null||f===void 0?void 0:f.current;r.sharedClientState.updateQueryState(u.targetId,p?"current":"not-current")}if(h){i.push(h);const p=Mf.Es(u.targetId,h);s.push(p)}}))}),await Promise.all(o),r.hu.J_(i),await async function(u,h){const f=Q(u);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>L.forEach(h,m=>L.forEach(m.Is,S=>f.persistence.referenceDelegate.addReference(p,m.targetId,S)).next(()=>L.forEach(m.ds,S=>f.persistence.referenceDelegate.removeReference(p,m.targetId,S)))))}catch(p){if(!gs(p))throw p;$(jf,"Failed to update sequence numbers: "+p)}for(const p of h){const m=p.targetId;if(!p.fromCache){const S=f.Fs.get(m),R=S.snapshotVersion,N=S.withLastLimboFreeSnapshotVersion(R);f.Fs=f.Fs.insert(m,N)}}}(r.localStore,s))}async function ZR(t,e){const n=Q(t);if(!n.currentUser.isEqual(e)){$(Gf,"User change. New user:",e.toKey());const r=await Kw(n.localStore,e);n.currentUser=e,function(s,o){s.Vu.forEach(l=>{l.forEach(u=>{u.reject(new z(V.CANCELLED,o))})}),s.Vu.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await sa(n,r.Bs)}}function e2(t,e){const n=Q(t),r=n.Eu.get(e);if(r&&r.lu)return ne().add(r.key);{let i=ne();const s=n.Tu.get(e);if(!s)return i;for(const o of s){const l=n.Pu.get(o);i=i.unionWith(l.view.tu)}return i}}function cE(t){const e=Q(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=oE.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=e2.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=QR.bind(null,e),e.hu.J_=LR.bind(null,e.eventManager),e.hu.pu=MR.bind(null,e.eventManager),e}function t2(t){const e=Q(t);return e.remoteStore.remoteSyncer.applySuccessfulWrite=XR.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=YR.bind(null,e),e}class iu{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=zu(e.databaseInfo.databaseId),this.sharedClientState=this.bu(e),this.persistence=this.Du(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Cu(e,this.localStore),this.indexBackfillerScheduler=this.Fu(e,this.localStore)}Cu(e,n){return null}Fu(e,n){return null}vu(e){return nR(this.persistence,new Zk,e.initialUser,this.serializer)}Du(e){return new Gw(Lf.Vi,this.serializer)}bu(e){return new uR}async terminate(){var e,n;(e=this.gcScheduler)===null||e===void 0||e.stop(),(n=this.indexBackfillerScheduler)===null||n===void 0||n.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}iu.provider={build:()=>new iu};class n2 extends iu{constructor(e){super(),this.cacheSizeBytes=e}Cu(e,n){ie(this.persistence.referenceDelegate instanceof nu,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new jk(r,e.asyncQueue,n)}Du(e){const n=this.cacheSizeBytes!==void 0?mt.withCacheSize(this.cacheSizeBytes):mt.DEFAULT;return new Gw(r=>nu.Vi(r,n),this.serializer)}}class gd{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Vy(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=ZR.bind(null,this.syncEngine),await NR(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new DR}()}createDatastore(e){const n=zu(e.databaseInfo.databaseId),r=function(s){return new pR(s)}(e.databaseInfo);return function(s,o,l,u){return new _R(s,o,l,u)}(e.authCredentials,e.appCheckCredentials,r,n)}createRemoteStore(e){return function(r,i,s,o,l){return new wR(r,i,s,o,l)}(this.localStore,this.datastore,e.asyncQueue,n=>Vy(this.syncEngine,n,0),function(){return Cy.C()?new Cy:new cR}())}createSyncEngine(e,n){return function(i,s,o,l,u,h,f){const p=new BR(i,s,o,l,u,h);return f&&(p.fu=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}async terminate(){var e,n;await async function(i){const s=Q(i);$(ci,"RemoteStore shutting down."),s.Ia.add(5),await ia(s),s.Ea.shutdown(),s.Aa.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(n=this.eventManager)===null||n===void 0||n.terminate()}}gd.provider={build:()=>new gd};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class r2{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.xu(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.xu(this.observer.error,e):jn("Uncaught Error in snapshot listener:",e.toString()))}Ou(){this.muted=!0}xu(e,n){setTimeout(()=>{this.muted||e(n)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class i2{constructor(e){this.datastore=e,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(e){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new z(V.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const n=await async function(i,s){const o=Q(i),l={documents:s.map(p=>tu(o.serializer,p))},u=await o.Jo("BatchGetDocuments",o.serializer.databaseId,le.emptyPath(),l,s.length),h=new Map;u.forEach(p=>{const m=Ek(o.serializer,p);h.set(m.key.toString(),m)});const f=[];return s.forEach(p=>{const m=h.get(p.toString());ie(!!m,55234,{key:p}),f.push(m)}),f}(this.datastore,e);return n.forEach(r=>this.recordVersion(r)),n}set(e,n){this.write(n.toMutation(e,this.precondition(e))),this.writtenDocs.add(e.toString())}update(e,n){try{this.write(n.toMutation(e,this.preconditionForUpdate(e)))}catch(r){this.lastTransactionError=r}this.writtenDocs.add(e.toString())}delete(e){this.write(new Fu(e,this.precondition(e))),this.writtenDocs.add(e.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const e=this.readVersions;this.mutations.forEach(n=>{e.delete(n.key.toString())}),e.forEach((n,r)=>{const i=q.fromPath(r);this.mutations.push(new Dw(i,this.precondition(i)))}),await async function(r,i){const s=Q(r),o={writes:i.map(l=>Bw(s.serializer,l))};await s.Wo("Commit",s.serializer.databaseId,le.emptyPath(),o)}(this.datastore,this.mutations),this.committed=!0}recordVersion(e){let n;if(e.isFoundDocument())n=e.version;else{if(!e.isNoDocument())throw W(50498,{Wu:e.constructor.name});n=K.min()}const r=this.readVersions.get(e.key.toString());if(r){if(!n.isEqual(r))throw new z(V.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(e.key.toString(),n)}precondition(e){const n=this.readVersions.get(e.toString());return!this.writtenDocs.has(e.toString())&&n?n.isEqual(K.min())?it.exists(!1):it.updateTime(n):it.none()}preconditionForUpdate(e){const n=this.readVersions.get(e.toString());if(!this.writtenDocs.has(e.toString())&&n){if(n.isEqual(K.min()))throw new z(V.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return it.updateTime(n)}return it.exists(!0)}write(e){this.ensureCommitNotCalled(),this.mutations.push(e)}ensureCommitNotCalled(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class s2{constructor(e,n,r,i,s){this.asyncQueue=e,this.datastore=n,this.options=r,this.updateFunction=i,this.deferred=s,this.Gu=r.maxAttempts,this.F_=new Ff(this.asyncQueue,"transaction_retry")}zu(){this.Gu-=1,this.ju()}ju(){this.F_.g_(async()=>{const e=new i2(this.datastore),n=this.Ju(e);n&&n.then(r=>{this.asyncQueue.enqueueAndForget(()=>e.commit().then(()=>{this.deferred.resolve(r)}).catch(i=>{this.Hu(i)}))}).catch(r=>{this.Hu(r)})})}Ju(e){try{const n=this.updateFunction(e);return!ta(n)&&n.catch&&n.then?n:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(n){return this.deferred.reject(n),null}}Hu(e){this.Gu>0&&this.Yu(e)?(this.Gu-=1,this.asyncQueue.enqueueAndForget(()=>(this.ju(),Promise.resolve()))):this.deferred.reject(e)}Yu(e){if(e.name==="FirebaseError"){const n=e.code;return n==="aborted"||n==="failed-precondition"||n==="already-exists"||!Ow(n)}return!1}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kr="FirestoreClient";class o2{constructor(e,n,r,i,s){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=r,this.databaseInfo=i,this.user=nt.UNAUTHENTICATED,this.clientId=xf.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(r,async o=>{$(kr,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(r,o=>($(kr,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new mr;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){const r=qf(n,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function Zc(t,e){t.asyncQueue.verifyOperationInProgress(),$(kr,"Initializing OfflineComponentProvider");const n=t.configuration;await e.initialize(n);let r=n.initialUser;t.setCredentialChangeListener(async i=>{r.isEqual(i)||(await Kw(e.localStore,i),r=i)}),e.persistence.setDatabaseDeletedListener(()=>{Er("Terminating Firestore due to IndexedDb database deletion"),t.terminate().then(()=>{$("Terminating Firestore due to IndexedDb database deletion completed successfully")}).catch(i=>{Er("Terminating Firestore due to IndexedDb database deletion failed",i)})}),t._offlineComponents=e}async function My(t,e){t.asyncQueue.verifyOperationInProgress();const n=await a2(t);$(kr,"Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(r=>Ny(e.remoteStore,r)),t.setAppCheckTokenChangeListener((r,i)=>Ny(e.remoteStore,i)),t._onlineComponents=e}async function a2(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){$(kr,"Using user provided OfflineComponentProvider");try{await Zc(t,t._uninitializedComponentsProvider._offline)}catch(e){const n=e;if(!function(i){return i.name==="FirebaseError"?i.code===V.FAILED_PRECONDITION||i.code===V.UNIMPLEMENTED:!(typeof DOMException<"u"&&i instanceof DOMException)||i.code===22||i.code===20||i.code===11}(n))throw n;Er("Error using user provided cache. Falling back to memory cache: "+n),await Zc(t,new iu)}}else $(kr,"Using default OfflineComponentProvider"),await Zc(t,new n2(void 0));return t._offlineComponents}async function Qf(t){return t._onlineComponents||(t._uninitializedComponentsProvider?($(kr,"Using user provided OnlineComponentProvider"),await My(t,t._uninitializedComponentsProvider._online)):($(kr,"Using default OnlineComponentProvider"),await My(t,new gd))),t._onlineComponents}function l2(t){return Qf(t).then(e=>e.syncEngine)}function u2(t){return Qf(t).then(e=>e.datastore)}async function jy(t){const e=await Qf(t),n=e.eventManager;return n.onListen=$R.bind(null,e.syncEngine),n.onUnlisten=WR.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=HR.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=GR.bind(null,e.syncEngine),n}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hE(t){const e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fy=new Map;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dE="firestore.googleapis.com",Uy=!0;class zy{constructor(e){var n,r;if(e.host===void 0){if(e.ssl!==void 0)throw new z(V.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=dE,this.ssl=Uy}else this.host=e.host,this.ssl=(n=e.ssl)!==null&&n!==void 0?n:Uy;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=Ww;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<Lk)throw new z(V.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}TS("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=hE((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(s){if(s.timeoutSeconds!==void 0){if(isNaN(s.timeoutSeconds))throw new z(V.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (must not be NaN)`);if(s.timeoutSeconds<5)throw new z(V.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (minimum allowed value is 5)`);if(s.timeoutSeconds>30)throw new z(V.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,i){return r.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Hu{constructor(e,n,r,i){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new zy({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new z(V.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new z(V.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new zy(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new fS;switch(r.type){case"firstParty":return new yS(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new z(V.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){const r=Fy.get(n);r&&($("ComponentProvider","Removing Datastore"),Fy.delete(n),r.terminate())}(this),Promise.resolve()}}function c2(t,e,n,r={}){var i;t=Pn(t,Hu);const s=br(e),o=t._getSettings(),l=Object.assign(Object.assign({},o),{emulatorOptions:t._getEmulatorOptions()}),u=`${e}:${n}`;s&&(_f(`https://${u}`),vf("Firestore",!0)),o.host!==dE&&o.host!==u&&Er("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const h=Object.assign(Object.assign({},o),{host:u,ssl:s,emulatorOptions:r});if(!ai(h,l)&&(t._setSettings(h),r.mockUserToken)){let f,p;if(typeof r.mockUserToken=="string")f=r.mockUserToken,p=nt.MOCK_USER;else{f=z0(r.mockUserToken,(i=t._app)===null||i===void 0?void 0:i.options.projectId);const m=r.mockUserToken.sub||r.mockUserToken.user_id;if(!m)throw new z(V.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");p=new nt(m)}t._authCredentials=new pS(new ew(f,p))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vr{constructor(e,n,r){this.converter=n,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new Vr(this.firestore,e,this._query)}}class Ne{constructor(e,n,r){this.converter=n,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new gr(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Ne(this.firestore,e,this._key)}toJSON(){return{type:Ne._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,n,r){if(ea(n,Ne._jsonSchema))return new Ne(e,r||null,new q(le.fromString(n.referencePath)))}}Ne._jsonSchemaVersion="firestore/documentReference/1.0",Ne._jsonSchema={type:Ve("string",Ne._jsonSchemaVersion),referencePath:Ve("string")};class gr extends Vr{constructor(e,n,r){super(e,n,Pf(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Ne(this.firestore,null,new q(e))}withConverter(e){return new gr(this.firestore,e,this._path)}}function su(t,e,...n){if(t=ge(t),nw("collection","path",e),t instanceof Hu){const r=le.fromString(e,...n);return Zg(r),new gr(t,null,r)}{if(!(t instanceof Ne||t instanceof gr))throw new z(V.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(le.fromString(e,...n));return Zg(r),new gr(t.firestore,null,r)}}function cs(t,e,...n){if(t=ge(t),arguments.length===1&&(e=xf.newId()),nw("doc","path",e),t instanceof Hu){const r=le.fromString(e,...n);return Jg(r),new Ne(t,null,new q(r))}{if(!(t instanceof Ne||t instanceof gr))throw new z(V.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(le.fromString(e,...n));return Jg(r),new Ne(t.firestore,t instanceof gr?t.converter:null,new q(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const By="AsyncQueue";class $y{constructor(e=Promise.resolve()){this.Zu=[],this.Xu=!1,this.ec=[],this.tc=null,this.nc=!1,this.rc=!1,this.sc=[],this.F_=new Ff(this,"async_queue_retry"),this.oc=()=>{const r=Jc();r&&$(By,"Visibility state changed to "+r.visibilityState),this.F_.y_()},this._c=e;const n=Jc();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this.oc)}get isShuttingDown(){return this.Xu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.ac(),this.uc(e)}enterRestrictedMode(e){if(!this.Xu){this.Xu=!0,this.rc=e||!1;const n=Jc();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this.oc)}}enqueue(e){if(this.ac(),this.Xu)return new Promise(()=>{});const n=new mr;return this.uc(()=>this.Xu&&this.rc?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Zu.push(e),this.cc()))}async cc(){if(this.Zu.length!==0){try{await this.Zu[0](),this.Zu.shift(),this.F_.reset()}catch(e){if(!gs(e))throw e;$(By,"Operation failed with retryable error: "+e)}this.Zu.length>0&&this.F_.g_(()=>this.cc())}}uc(e){const n=this._c.then(()=>(this.nc=!0,e().catch(r=>{throw this.tc=r,this.nc=!1,jn("INTERNAL UNHANDLED ERROR: ",Hy(r)),r}).then(r=>(this.nc=!1,r))));return this._c=n,n}enqueueAfterDelay(e,n,r){this.ac(),this.sc.indexOf(e)>-1&&(n=0);const i=Hf.createAndSchedule(this,e,n,r,s=>this.lc(s));return this.ec.push(i),i}ac(){this.tc&&W(47125,{hc:Hy(this.tc)})}verifyOperationInProgress(){}async Pc(){let e;do e=this._c,await e;while(e!==this._c)}Tc(e){for(const n of this.ec)if(n.timerId===e)return!0;return!1}Ic(e){return this.Pc().then(()=>{this.ec.sort((n,r)=>n.targetTimeMs-r.targetTimeMs);for(const n of this.ec)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.Pc()})}dc(e){this.sc.push(e)}lc(e){const n=this.ec.indexOf(e);this.ec.splice(n,1)}}function Hy(t){let e=t.message||"";return t.stack&&(e=t.stack.includes(t.message)?t.stack:t.message+`
`+t.stack),e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qy(t){return function(n,r){if(typeof n!="object"||n===null)return!1;const i=n;for(const s of r)if(s in i&&typeof i[s]=="function")return!0;return!1}(t,["next","error","complete"])}class hi extends Hu{constructor(e,n,r,i){super(e,n,r,i),this.type="firestore",this._queue=new $y,this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new $y(e),this._firestoreClient=void 0,await e}}}function h2(t,e){const n=typeof t=="object"?t:Tf(),r=typeof t=="string"?t:Ql,i=Nu(n,"firestore").getImmediate({identifier:r});if(!i._initialized){const s=j0("firestore");s&&c2(i,...s)}return i}function Xf(t){if(t._terminated)throw new z(V.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||d2(t),t._firestoreClient}function d2(t){var e,n,r;const i=t._freezeSettings(),s=function(l,u,h,f){return new DS(l,u,h,f.host,f.ssl,f.experimentalForceLongPolling,f.experimentalAutoDetectLongPolling,hE(f.experimentalLongPollingOptions),f.useFetchStreams,f.isUsingEmulator)}(t._databaseId,((e=t._app)===null||e===void 0?void 0:e.options.appId)||"",t._persistenceKey,i);t._componentsProvider||!((n=i.localCache)===null||n===void 0)&&n._offlineComponentProvider&&(!((r=i.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(t._componentsProvider={_offline:i.localCache._offlineComponentProvider,_online:i.localCache._onlineComponentProvider}),t._firestoreClient=new o2(t._authCredentials,t._appCheckCredentials,t._queue,s,t._componentsProvider&&function(l){const u=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(u),_online:u}}(t._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xt{constructor(e){this._byteString=e}static fromBase64String(e){try{return new xt(Qe.fromBase64String(e))}catch(n){throw new z(V.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new xt(Qe.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:xt._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(ea(e,xt._jsonSchema))return xt.fromBase64String(e.bytes)}}xt._jsonSchemaVersion="firestore/bytes/1.0",xt._jsonSchema={type:Ve("string",xt._jsonSchemaVersion),bytes:Ve("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oa{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new z(V.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new We(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qu{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ln{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new z(V.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new z(V.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return Z(this._lat,e._lat)||Z(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:ln._jsonSchemaVersion}}static fromJSON(e){if(ea(e,ln._jsonSchema))return new ln(e.latitude,e.longitude)}}ln._jsonSchemaVersion="firestore/geoPoint/1.0",ln._jsonSchema={type:Ve("string",ln._jsonSchemaVersion),latitude:Ve("number"),longitude:Ve("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class un{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,i){if(r.length!==i.length)return!1;for(let s=0;s<r.length;++s)if(r[s]!==i[s])return!1;return!0}(this._values,e._values)}toJSON(){return{type:un._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(ea(e,un._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(n=>typeof n=="number"))return new un(e.vectorValues);throw new z(V.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}un._jsonSchemaVersion="firestore/vectorValue/1.0",un._jsonSchema={type:Ve("string",un._jsonSchemaVersion),vectorValues:Ve("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const f2=/^__.*__$/;class p2{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return this.fieldMask!==null?new Or(e,this.data,this.fieldMask,n,this.fieldTransforms):new na(e,this.data,n,this.fieldTransforms)}}class fE{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return new Or(e,this.data,this.fieldMask,n,this.fieldTransforms)}}function pE(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw W(40011,{Ec:t})}}class Yf{constructor(e,n,r,i,s,o){this.settings=e,this.databaseId=n,this.serializer=r,this.ignoreUndefinedProperties=i,s===void 0&&this.Ac(),this.fieldTransforms=s||[],this.fieldMask=o||[]}get path(){return this.settings.path}get Ec(){return this.settings.Ec}Rc(e){return new Yf(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Vc(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),i=this.Rc({path:r,mc:!1});return i.fc(e),i}gc(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),i=this.Rc({path:r,mc:!1});return i.Ac(),i}yc(e){return this.Rc({path:void 0,mc:!0})}wc(e){return ou(e,this.settings.methodName,this.settings.Sc||!1,this.path,this.settings.bc)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}Ac(){if(this.path)for(let e=0;e<this.path.length;e++)this.fc(this.path.get(e))}fc(e){if(e.length===0)throw this.wc("Document fields must not be empty");if(pE(this.Ec)&&f2.test(e))throw this.wc('Document fields cannot begin and end with "__"')}}class m2{constructor(e,n,r){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=r||zu(e)}Dc(e,n,r,i=!1){return new Yf({Ec:e,methodName:n,bc:r,path:We.emptyPath(),mc:!1,Sc:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Wu(t){const e=t._freezeSettings(),n=zu(t._databaseId);return new m2(t._databaseId,!!e.ignoreUndefinedProperties,n)}function mE(t,e,n,r,i,s={}){const o=t.Dc(s.merge||s.mergeFields?2:0,e,n,i);Zf("Data must be an object, but it was:",o,r);const l=_E(r,o);let u,h;if(s.merge)u=new St(o.fieldMask),h=o.fieldTransforms;else if(s.mergeFields){const f=[];for(const p of s.mergeFields){const m=yd(e,p,n);if(!o.contains(m))throw new z(V.INVALID_ARGUMENT,`Field '${m}' is specified in your field mask but missing from your input data.`);wE(f,m)||f.push(m)}u=new St(f),h=o.fieldTransforms.filter(p=>u.covers(p.field))}else u=null,h=o.fieldTransforms;return new p2(new ht(l),u,h)}class Gu extends qu{_toFieldTransform(e){if(e.Ec!==2)throw e.Ec===1?e.wc(`${this._methodName}() can only appear at the top level of your update data`):e.wc(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Gu}}class Jf extends qu{_toFieldTransform(e){return new sk(e.path,new Bo)}isEqual(e){return e instanceof Jf}}function gE(t,e,n,r){const i=t.Dc(1,e,n);Zf("Data must be an object, but it was:",i,r);const s=[],o=ht.empty();Dr(r,(u,h)=>{const f=ep(e,u,n);h=ge(h);const p=i.gc(f);if(h instanceof Gu)s.push(f);else{const m=aa(h,p);m!=null&&(s.push(f),o.set(f,m))}});const l=new St(s);return new fE(o,l,i.fieldTransforms)}function yE(t,e,n,r,i,s){const o=t.Dc(1,e,n),l=[yd(e,r,n)],u=[i];if(s.length%2!=0)throw new z(V.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let m=0;m<s.length;m+=2)l.push(yd(e,s[m])),u.push(s[m+1]);const h=[],f=ht.empty();for(let m=l.length-1;m>=0;--m)if(!wE(h,l[m])){const S=l[m];let R=u[m];R=ge(R);const N=o.gc(S);if(R instanceof Gu)h.push(S);else{const O=aa(R,N);O!=null&&(h.push(S),f.set(S,O))}}const p=new St(h);return new fE(f,p,o.fieldTransforms)}function g2(t,e,n,r=!1){return aa(n,t.Dc(r?4:3,e))}function aa(t,e){if(vE(t=ge(t)))return Zf("Unsupported field value:",e,t),_E(t,e);if(t instanceof qu)return function(r,i){if(!pE(i.Ec))throw i.wc(`${r._methodName}() can only be used with update() and set()`);if(!i.path)throw i.wc(`${r._methodName}() is not currently supported inside arrays`);const s=r._toFieldTransform(i);s&&i.fieldTransforms.push(s)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.mc&&e.Ec!==4)throw e.wc("Nested arrays are not supported");return function(r,i){const s=[];let o=0;for(const l of r){let u=aa(l,i.yc(o));u==null&&(u={nullValue:"NULL_VALUE"}),s.push(u),o++}return{arrayValue:{values:s}}}(t,e)}return function(r,i){if((r=ge(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return nk(i.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const s=he.fromDate(r);return{timestampValue:eu(i.serializer,s)}}if(r instanceof he){const s=new he(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:eu(i.serializer,s)}}if(r instanceof ln)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof xt)return{bytesValue:jw(i.serializer,r._byteString)};if(r instanceof Ne){const s=i.databaseId,o=r.firestore._databaseId;if(!o.isEqual(s))throw i.wc(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:Of(r.firestore._databaseId||i.databaseId,r._key.path)}}if(r instanceof un)return function(o,l){return{mapValue:{fields:{[hw]:{stringValue:dw},[Xl]:{arrayValue:{values:o.toArray().map(h=>{if(typeof h!="number")throw l.wc("VectorValues must only contain numeric values.");return Nf(l.serializer,h)})}}}}}}(r,i);throw i.wc(`Unsupported field value: ${bu(r)}`)}(t,e)}function _E(t,e){const n={};return sw(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Dr(t,(r,i)=>{const s=aa(i,e.Vc(r));s!=null&&(n[r]=s)}),{mapValue:{fields:n}}}function vE(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof he||t instanceof ln||t instanceof xt||t instanceof Ne||t instanceof qu||t instanceof un)}function Zf(t,e,n){if(!vE(n)||!rw(n)){const r=bu(n);throw r==="an object"?e.wc(t+" a custom object"):e.wc(t+" "+r)}}function yd(t,e,n){if((e=ge(e))instanceof oa)return e._internalPath;if(typeof e=="string")return ep(t,e);throw ou("Field path arguments must be of type string or ",t,!1,void 0,n)}const y2=new RegExp("[~\\*/\\[\\]]");function ep(t,e,n){if(e.search(y2)>=0)throw ou(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new oa(...e.split("."))._internalPath}catch{throw ou(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function ou(t,e,n,r,i){const s=r&&!r.isEmpty(),o=i!==void 0;let l=`Function ${e}() called with invalid data`;n&&(l+=" (via `toFirestore()`)"),l+=". ";let u="";return(s||o)&&(u+=" (found",s&&(u+=` in field ${r}`),o&&(u+=` in document ${i}`),u+=")"),new z(V.INVALID_ARGUMENT,l+t+u)}function wE(t,e){return t.some(n=>n.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class au{constructor(e,n,r,i,s){this._firestore=e,this._userDataWriter=n,this._key=r,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new Ne(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new _2(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const n=this._document.data.field(tp("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}}class _2 extends au{data(){return super.data()}}function tp(t,e){return typeof e=="string"?ep(t,e):e instanceof oa?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function v2(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new z(V.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class np{}class rp extends np{}function w2(t,e,...n){let r=[];e instanceof np&&r.push(e),r=r.concat(n),function(s){const o=s.filter(u=>u instanceof sp).length,l=s.filter(u=>u instanceof ip).length;if(o>1||o>0&&l>0)throw new z(V.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const i of r)t=i._apply(t);return t}class ip extends rp{constructor(e,n,r){super(),this._field=e,this._op=n,this._value=r,this.type="where"}static _create(e,n,r){return new ip(e,n,r)}_apply(e){const n=this._parse(e);return EE(e._query,n),new Vr(e.firestore,e.converter,ld(e._query,n))}_parse(e){const n=Wu(e.firestore);return function(s,o,l,u,h,f,p){let m;if(h.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new z(V.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){Gy(p,f);const R=[];for(const N of p)R.push(Wy(u,s,N));m={arrayValue:{values:R}}}else m=Wy(u,s,p)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||Gy(p,f),m=g2(l,o,p,f==="in"||f==="not-in");return Oe.create(h,f,m)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}}class sp extends np{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new sp(e,n)}_parse(e){const n=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return n.length===1?n[0]:Yt.create(n,this._getOperator())}_apply(e){const n=this._parse(e);return n.getFilters().length===0?e:(function(i,s){let o=i;const l=s.getFlattenedFilters();for(const u of l)EE(o,u),o=ld(o,u)}(e._query,n),new Vr(e.firestore,e.converter,ld(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class op extends rp{constructor(e,n){super(),this._field=e,this._direction=n,this.type="orderBy"}static _create(e,n){return new op(e,n)}_apply(e){const n=function(i,s,o){if(i.startAt!==null)throw new z(V.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(i.endAt!==null)throw new z(V.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new zo(s,o)}(e._query,this._field,this._direction);return new Vr(e.firestore,e.converter,function(i,s){const o=i.explicitOrderBy.concat([s]);return new ys(i.path,i.collectionGroup,o,i.filters.slice(),i.limit,i.limitType,i.startAt,i.endAt)}(e._query,n))}}function E2(t,e="asc"){const n=e,r=tp("orderBy",t);return op._create(r,n)}class ap extends rp{constructor(e,n,r){super(),this.type=e,this._limit=n,this._limitType=r}static _create(e,n,r){return new ap(e,n,r)}_apply(e){return new Vr(e.firestore,e.converter,Jl(e._query,this._limit,this._limitType))}}function T2(t){return ap._create("limit",t,"F")}function Wy(t,e,n){if(typeof(n=ge(n))=="string"){if(n==="")throw new z(V.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!ww(e)&&n.indexOf("/")!==-1)throw new z(V.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);const r=e.path.child(le.fromString(n));if(!q.isDocumentKey(r))throw new z(V.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return ay(t,new q(r))}if(n instanceof Ne)return ay(t,n._key);throw new z(V.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${bu(n)}.`)}function Gy(t,e){if(!Array.isArray(t)||t.length===0)throw new z(V.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function EE(t,e){const n=function(i,s){for(const o of i)for(const l of o.getFlattenedFilters())if(s.indexOf(l.op)>=0)return l.op;return null}(t.filters,function(i){switch(i){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new z(V.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new z(V.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}class TE{convertValue(e,n="none"){switch(Ar(e)){case 0:return null;case 1:return e.booleanValue;case 2:return Ce(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes(xr(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 11:return this.convertObject(e.mapValue,n);case 10:return this.convertVectorValue(e.mapValue);default:throw W(62114,{value:e})}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){const r={};return Dr(e,(i,s)=>{r[i]=this.convertValue(s,n)}),r}convertVectorValue(e){var n,r,i;const s=(i=(r=(n=e.fields)===null||n===void 0?void 0:n[Xl].arrayValue)===null||r===void 0?void 0:r.values)===null||i===void 0?void 0:i.map(o=>Ce(o.doubleValue));return new un(s)}convertGeoPoint(e){return new ln(Ce(e.latitude),Ce(e.longitude))}convertArray(e,n){return(e.values||[]).map(r=>this.convertValue(r,n))}convertServerTimestamp(e,n){switch(n){case"previous":const r=Ou(e);return r==null?null:this.convertValue(r,n);case"estimate":return this.convertTimestamp(jo(e));default:return null}}convertTimestamp(e){const n=Ir(e);return new he(n.seconds,n.nanos)}convertDocumentKey(e,n){const r=le.fromString(e);ie(qw(r),9688,{name:e});const i=new Fo(r.get(1),r.get(3)),s=new q(r.popFirst(5));return i.isEqual(n)||jn(`Document ${s} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function IE(t,e,n){let r;return r=t?n&&(n.merge||n.mergeFields)?t.toFirestore(e,n):t.toFirestore(e):e,r}class I2 extends TE{constructor(e){super(),this.firestore=e}convertBytes(e){return new xt(e)}convertReference(e){const n=this.convertDocumentKey(e,this.firestore._databaseId);return new Ne(this.firestore,null,n)}}class Fi{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class yr extends au{constructor(e,n,r,i,s,o){super(e,n,r,i,o),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const n=new yl(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){const r=this._document.data.field(tp("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,n.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new z(V.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,n={};return n.type=yr._jsonSchemaVersion,n.bundle="",n.bundleSource="DocumentSnapshot",n.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?n:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),n.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),n)}}yr._jsonSchemaVersion="firestore/documentSnapshot/1.0",yr._jsonSchema={type:Ve("string",yr._jsonSchemaVersion),bundleSource:Ve("string","DocumentSnapshot"),bundleName:Ve("string"),bundle:Ve("string")};class yl extends yr{data(e={}){return super.data(e)}}class Gi{constructor(e,n,r,i){this._firestore=e,this._userDataWriter=n,this._snapshot=i,this.metadata=new Fi(i.hasPendingWrites,i.fromCache),this.query=r}get docs(){const e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(r=>{e.call(n,new yl(this._firestore,this._userDataWriter,r.key,r,new Fi(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new z(V.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(i,s){if(i._snapshot.oldDocs.isEmpty()){let o=0;return i._snapshot.docChanges.map(l=>{const u=new yl(i._firestore,i._userDataWriter,l.doc.key,l.doc,new Fi(i._snapshot.mutatedKeys.has(l.doc.key),i._snapshot.fromCache),i.query.converter);return l.doc,{type:"added",doc:u,oldIndex:-1,newIndex:o++}})}{let o=i._snapshot.oldDocs;return i._snapshot.docChanges.filter(l=>s||l.type!==3).map(l=>{const u=new yl(i._firestore,i._userDataWriter,l.doc.key,l.doc,new Fi(i._snapshot.mutatedKeys.has(l.doc.key),i._snapshot.fromCache),i.query.converter);let h=-1,f=-1;return l.type!==0&&(h=o.indexOf(l.doc.key),o=o.delete(l.doc.key)),l.type!==1&&(o=o.add(l.doc),f=o.indexOf(l.doc.key)),{type:x2(l.type),doc:u,oldIndex:h,newIndex:f}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new z(V.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=Gi._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=xf.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const n=[],r=[],i=[];return this.docs.forEach(s=>{s._document!==null&&(n.push(s._document),r.push(this._userDataWriter.convertObjectMap(s._document.data.value.mapValue.fields,"previous")),i.push(s.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function x2(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return W(61501,{type:t})}}Gi._jsonSchemaVersion="firestore/querySnapshot/1.0",Gi._jsonSchema={type:Ve("string",Gi._jsonSchemaVersion),bundleSource:Ve("string","QuerySnapshot"),bundleName:Ve("string"),bundle:Ve("string")};class lp extends TE{constructor(e){super(),this.firestore=e}convertBytes(e){return new xt(e)}convertReference(e){const n=this.convertDocumentKey(e,this.firestore._databaseId);return new Ne(this.firestore,null,n)}}function xE(t,e,n,...r){t=Pn(t,Ne);const i=Pn(t.firestore,hi),s=Wu(i);let o;return o=typeof(e=ge(e))=="string"||e instanceof oa?yE(s,"updateDoc",t._key,e,n,r):gE(s,"updateDoc",t._key,e),up(i,[o.toMutation(t._key,it.exists(!0))])}function A2(t){return up(Pn(t.firestore,hi),[new Fu(t._key,it.none())])}function S2(t,e){const n=Pn(t.firestore,hi),r=cs(t),i=IE(t.converter,e);return up(n,[mE(Wu(t.firestore),"addDoc",r._key,i,t.converter!==null,{}).toMutation(r._key,it.exists(!1))]).then(()=>r)}function AE(t,...e){var n,r,i;t=ge(t);let s={includeMetadataChanges:!1,source:"default"},o=0;typeof e[o]!="object"||qy(e[o])||(s=e[o++]);const l={includeMetadataChanges:s.includeMetadataChanges,source:s.source};if(qy(e[o])){const p=e[o];e[o]=(n=p.next)===null||n===void 0?void 0:n.bind(p),e[o+1]=(r=p.error)===null||r===void 0?void 0:r.bind(p),e[o+2]=(i=p.complete)===null||i===void 0?void 0:i.bind(p)}let u,h,f;if(t instanceof Ne)h=Pn(t.firestore,hi),f=Pf(t._key.path),u={next:p=>{e[o]&&e[o](k2(h,t,p))},error:e[o+1],complete:e[o+2]};else{const p=Pn(t,Vr);h=Pn(p.firestore,hi),f=p._query;const m=new lp(h);u={next:S=>{e[o]&&e[o](new Gi(h,m,p,S))},error:e[o+1],complete:e[o+2]},v2(t._query)}return function(m,S,R,N){const O=new r2(N),I=new jR(S,O,R);return m.asyncQueue.enqueueAndForget(async()=>OR(await jy(m),I)),()=>{O.Ou(),m.asyncQueue.enqueueAndForget(async()=>VR(await jy(m),I))}}(Xf(h),f,l,u)}function up(t,e){return function(r,i){const s=new mr;return r.asyncQueue.enqueueAndForget(async()=>KR(await l2(r),i,s)),s.promise}(Xf(t),e)}function k2(t,e,n){const r=n.docs.get(e._key),i=new lp(t);return new yr(t,i,e._key,r,new Fi(n.hasPendingWrites,n.fromCache),e.converter)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const R2={maxAttempts:5};function Zs(t,e){if((t=ge(t)).firestore!==e)throw new z(V.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class C2{constructor(e,n){this._firestore=e,this._transaction=n,this._dataReader=Wu(e)}get(e){const n=Zs(e,this._firestore),r=new I2(this._firestore);return this._transaction.lookup([n._key]).then(i=>{if(!i||i.length!==1)return W(24041);const s=i[0];if(s.isFoundDocument())return new au(this._firestore,r,s.key,s,n.converter);if(s.isNoDocument())return new au(this._firestore,r,n._key,null,n.converter);throw W(18433,{doc:s})})}set(e,n,r){const i=Zs(e,this._firestore),s=IE(i.converter,n,r),o=mE(this._dataReader,"Transaction.set",i._key,s,i.converter!==null,r);return this._transaction.set(i._key,o),this}update(e,n,r,...i){const s=Zs(e,this._firestore);let o;return o=typeof(n=ge(n))=="string"||n instanceof oa?yE(this._dataReader,"Transaction.update",s._key,n,r,i):gE(this._dataReader,"Transaction.update",s._key,n),this._transaction.update(s._key,o),this}delete(e){const n=Zs(e,this._firestore);return this._transaction.delete(n._key),this}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class P2 extends C2{constructor(e,n){super(e,n),this._firestore=e}get(e){const n=Zs(e,this._firestore),r=new lp(this._firestore);return super.get(e).then(i=>new yr(this._firestore,r,n._key,i._document,new Fi(!1,!1),n.converter))}}function N2(t,e,n){t=Pn(t,hi);const r=Object.assign(Object.assign({},R2),n);return function(s){if(s.maxAttempts<1)throw new z(V.INVALID_ARGUMENT,"Max attempts must be at least 1")}(r),function(s,o,l){const u=new mr;return s.asyncQueue.enqueueAndForget(async()=>{const h=await u2(s);new s2(s.asyncQueue,h,l,o,u).zu()}),u.promise}(Xf(t),i=>e(new P2(t,i)),r)}function _d(){return new Jf("serverTimestamp")}(function(e,n=!0){(function(i){ps=i})(mi),li(new wr("firestore",(r,{instanceIdentifier:i,options:s})=>{const o=r.getProvider("app").getImmediate(),l=new hi(new mS(r.getProvider("auth-internal")),new _S(o,r.getProvider("app-check-internal")),function(h,f){if(!Object.prototype.hasOwnProperty.apply(h.options,["projectId"]))throw new z(V.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Fo(h.options.projectId,f)}(o,i),o);return s=Object.assign({useFetchStreams:n},s),l._setSettings(s),l},"PUBLIC").setMultipleInstances(!0)),on(Gg,Kg,e),on(Gg,Kg,"esm2017")})();function cp(t,e){var n={};for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.indexOf(r)<0&&(n[r]=t[r]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var i=0,r=Object.getOwnPropertySymbols(t);i<r.length;i++)e.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(t,r[i])&&(n[r[i]]=t[r[i]]);return n}function SE(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const b2=SE,kE=new Jo("auth","Firebase",SE());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lu=new wf("@firebase/auth");function D2(t,...e){lu.logLevel<=te.WARN&&lu.warn(`Auth (${mi}): ${t}`,...e)}function _l(t,...e){lu.logLevel<=te.ERROR&&lu.error(`Auth (${mi}): ${t}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ut(t,...e){throw dp(t,...e)}function Qt(t,...e){return dp(t,...e)}function hp(t,e,n){const r=Object.assign(Object.assign({},b2()),{[e]:n});return new Jo("auth","Firebase",r).create(e,{appName:t.name})}function Nn(t){return hp(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function O2(t,e,n){const r=n;if(!(e instanceof r))throw r.name!==e.constructor.name&&Ut(t,"argument-error"),hp(t,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function dp(t,...e){if(typeof t!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(n,...r)}return kE.create(t,...e)}function G(t,e,...n){if(!t)throw dp(e,...n)}function kn(t){const e="INTERNAL ASSERTION FAILED: "+t;throw _l(e),new Error(e)}function Un(t,e){t||kn(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vd(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.href)||""}function V2(){return Ky()==="http:"||Ky()==="https:"}function Ky(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function L2(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(V2()||Hx()||"connection"in navigator)?navigator.onLine:!0}function M2(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class la{constructor(e,n){this.shortDelay=e,this.longDelay=n,Un(n>e,"Short delay should be less than long delay!"),this.isMobile=zx()||qx()}get(){return L2()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fp(t,e){Un(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class RE{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;kn("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;kn("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;kn("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const j2={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const F2=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],U2=new la(3e4,6e4);function Lr(t,e){return t.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:t.tenantId}):e}async function Mr(t,e,n,r,i={}){return CE(t,i,async()=>{let s={},o={};r&&(e==="GET"?o=r:s={body:JSON.stringify(r)});const l=Zo(Object.assign({key:t.config.apiKey},o)).slice(1),u=await t._getAdditionalHeaders();u["Content-Type"]="application/json",t.languageCode&&(u["X-Firebase-Locale"]=t.languageCode);const h=Object.assign({method:e,headers:u},s);return $x()||(h.referrerPolicy="no-referrer"),t.emulatorConfig&&br(t.emulatorConfig.host)&&(h.credentials="include"),RE.fetch()(await PE(t,t.config.apiHost,n,l),h)})}async function CE(t,e,n){t._canInitEmulator=!1;const r=Object.assign(Object.assign({},j2),e);try{const i=new B2(t),s=await Promise.race([n(),i.promise]);i.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw Ya(t,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const l=s.ok?o.errorMessage:o.error.message,[u,h]=l.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw Ya(t,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw Ya(t,"email-already-in-use",o);if(u==="USER_DISABLED")throw Ya(t,"user-disabled",o);const f=r[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(h)throw hp(t,f,h);Ut(t,f)}}catch(i){if(i instanceof dn)throw i;Ut(t,"network-request-failed",{message:String(i)})}}async function ua(t,e,n,r,i={}){const s=await Mr(t,e,n,r,i);return"mfaPendingCredential"in s&&Ut(t,"multi-factor-auth-required",{_serverResponse:s}),s}async function PE(t,e,n,r){const i=`${e}${n}?${r}`,s=t,o=s.config.emulator?fp(t.config,i):`${t.config.apiScheme}://${i}`;return F2.includes(n)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(o).toString():o}function z2(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class B2{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(Qt(this.auth,"network-request-failed")),U2.get())})}}function Ya(t,e,n){const r={appName:t.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const i=Qt(t,e,r);return i.customData._tokenResponse=n,i}function Qy(t){return t!==void 0&&t.enterprise!==void 0}class $2{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return z2(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function H2(t,e){return Mr(t,"GET","/v2/recaptchaConfig",Lr(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function q2(t,e){return Mr(t,"POST","/v1/accounts:delete",e)}async function uu(t,e){return Mr(t,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yo(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function W2(t,e=!1){const n=ge(t),r=await n.getIdToken(e),i=pp(r);G(i&&i.exp&&i.auth_time&&i.iat,n.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:yo(eh(i.auth_time)),issuedAtTime:yo(eh(i.iat)),expirationTime:yo(eh(i.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function eh(t){return Number(t)*1e3}function pp(t){const[e,n,r]=t.split(".");if(e===void 0||n===void 0||r===void 0)return _l("JWT malformed, contained fewer than 3 sections"),null;try{const i=L0(n);return i?JSON.parse(i):(_l("Failed to decode base64 JWT payload"),null)}catch(i){return _l("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function Xy(t){const e=pp(t);return G(e,"internal-error"),G(typeof e.exp<"u","internal-error"),G(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function qo(t,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof dn&&G2(r)&&t.auth.currentUser===t&&await t.auth.signOut(),r}}function G2({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class K2{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var n;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const i=((n=this.user.stsTokenManager.expirationTime)!==null&&n!==void 0?n:0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wd{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=yo(this.lastLoginAt),this.creationTime=yo(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function cu(t){var e;const n=t.auth,r=await t.getIdToken(),i=await qo(t,uu(n,{idToken:r}));G(i==null?void 0:i.users.length,n,"internal-error");const s=i.users[0];t._notifyReloadListener(s);const o=!((e=s.providerUserInfo)===null||e===void 0)&&e.length?NE(s.providerUserInfo):[],l=X2(t.providerData,o),u=t.isAnonymous,h=!(t.email&&s.passwordHash)&&!(l!=null&&l.length),f=u?h:!1,p={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:l,metadata:new wd(s.createdAt,s.lastLoginAt),isAnonymous:f};Object.assign(t,p)}async function Q2(t){const e=ge(t);await cu(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function X2(t,e){return[...t.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function NE(t){return t.map(e=>{var{providerId:n}=e,r=cp(e,["providerId"]);return{providerId:n,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Y2(t,e){const n=await CE(t,{},async()=>{const r=Zo({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=t.config,o=await PE(t,i,"/v1/token",`key=${s}`),l=await t._getAdditionalHeaders();l["Content-Type"]="application/x-www-form-urlencoded";const u={method:"POST",headers:l,body:r};return t.emulatorConfig&&br(t.emulatorConfig.host)&&(u.credentials="include"),RE.fetch()(o,u)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function J2(t,e){return Mr(t,"POST","/v2/accounts:revokeToken",Lr(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ki{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){G(e.idToken,"internal-error"),G(typeof e.idToken<"u","internal-error"),G(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Xy(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){G(e.length!==0,"internal-error");const n=Xy(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(G(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:i,expiresIn:s}=await Y2(e,n);this.updateTokensAndExpiration(r,i,Number(s))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:i,expirationTime:s}=n,o=new Ki;return r&&(G(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),i&&(G(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),s&&(G(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Ki,this.toJSON())}_performRefresh(){return kn("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gn(t,e){G(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class Wt{constructor(e){var{uid:n,auth:r,stsTokenManager:i}=e,s=cp(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new K2(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=n,this.auth=r,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new wd(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const n=await qo(this,this.stsTokenManager.getToken(this.auth,e));return G(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return W2(this,e)}reload(){return Q2(this)}_assign(e){this!==e&&(G(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>Object.assign({},n)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new Wt(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return n.metadata._copy(this.metadata),n}_onReload(e){G(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await cu(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(yt(this.auth.app))return Promise.reject(Nn(this.auth));const e=await this.getIdToken();return await qo(this,q2(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){var r,i,s,o,l,u,h,f;const p=(r=n.displayName)!==null&&r!==void 0?r:void 0,m=(i=n.email)!==null&&i!==void 0?i:void 0,S=(s=n.phoneNumber)!==null&&s!==void 0?s:void 0,R=(o=n.photoURL)!==null&&o!==void 0?o:void 0,N=(l=n.tenantId)!==null&&l!==void 0?l:void 0,O=(u=n._redirectEventId)!==null&&u!==void 0?u:void 0,I=(h=n.createdAt)!==null&&h!==void 0?h:void 0,w=(f=n.lastLoginAt)!==null&&f!==void 0?f:void 0,{uid:E,emailVerified:b,isAnonymous:M,providerData:j,stsTokenManager:v}=n;G(E&&v,e,"internal-error");const _=Ki.fromJSON(this.name,v);G(typeof E=="string",e,"internal-error"),Gn(p,e.name),Gn(m,e.name),G(typeof b=="boolean",e,"internal-error"),G(typeof M=="boolean",e,"internal-error"),Gn(S,e.name),Gn(R,e.name),Gn(N,e.name),Gn(O,e.name),Gn(I,e.name),Gn(w,e.name);const T=new Wt({uid:E,auth:e,email:m,emailVerified:b,displayName:p,isAnonymous:M,photoURL:R,phoneNumber:S,tenantId:N,stsTokenManager:_,createdAt:I,lastLoginAt:w});return j&&Array.isArray(j)&&(T.providerData=j.map(x=>Object.assign({},x))),O&&(T._redirectEventId=O),T}static async _fromIdTokenResponse(e,n,r=!1){const i=new Ki;i.updateFromServerResponse(n);const s=new Wt({uid:n.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await cu(s),s}static async _fromGetAccountInfoResponse(e,n,r){const i=n.users[0];G(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?NE(i.providerUserInfo):[],o=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),l=new Ki;l.updateFromIdToken(r);const u=new Wt({uid:i.localId,auth:e,stsTokenManager:l,isAnonymous:o}),h={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new wd(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(u,h),u}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yy=new Map;function Rn(t){Un(t instanceof Function,"Expected a class definition");let e=Yy.get(t);return e?(Un(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,Yy.set(t,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bE{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}bE.type="NONE";const Jy=bE;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vl(t,e,n){return`firebase:${t}:${e}:${n}`}class Qi{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:i,name:s}=this.auth;this.fullUserKey=vl(this.userKey,i.apiKey,s),this.fullPersistenceKey=vl("persistence",i.apiKey,s),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const n=await uu(this.auth,{idToken:e}).catch(()=>{});return n?Wt._fromGetAccountInfoResponse(this.auth,n,e):null}return Wt._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new Qi(Rn(Jy),e,r);const i=(await Promise.all(n.map(async h=>{if(await h._isAvailable())return h}))).filter(h=>h);let s=i[0]||Rn(Jy);const o=vl(r,e.config.apiKey,e.name);let l=null;for(const h of n)try{const f=await h._get(o);if(f){let p;if(typeof f=="string"){const m=await uu(e,{idToken:f}).catch(()=>{});if(!m)break;p=await Wt._fromGetAccountInfoResponse(e,m,f)}else p=Wt._fromJSON(e,f);h!==s&&(l=p),s=h;break}}catch{}const u=i.filter(h=>h._shouldAllowMigration);return!s._shouldAllowMigration||!u.length?new Qi(s,e,r):(s=u[0],l&&await s._set(o,l.toJSON()),await Promise.all(n.map(async h=>{if(h!==s)try{await h._remove(o)}catch{}})),new Qi(s,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zy(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(LE(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(DE(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(jE(e))return"Blackberry";if(FE(e))return"Webos";if(OE(e))return"Safari";if((e.includes("chrome/")||VE(e))&&!e.includes("edge/"))return"Chrome";if(ME(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=t.match(n);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function DE(t=ot()){return/firefox\//i.test(t)}function OE(t=ot()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function VE(t=ot()){return/crios\//i.test(t)}function LE(t=ot()){return/iemobile/i.test(t)}function ME(t=ot()){return/android/i.test(t)}function jE(t=ot()){return/blackberry/i.test(t)}function FE(t=ot()){return/webos/i.test(t)}function mp(t=ot()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function Z2(t=ot()){var e;return mp(t)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function eC(){return Wx()&&document.documentMode===10}function UE(t=ot()){return mp(t)||ME(t)||FE(t)||jE(t)||/windows phone/i.test(t)||LE(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zE(t,e=[]){let n;switch(t){case"Browser":n=Zy(ot());break;case"Worker":n=`${Zy(ot())}-${t}`;break;default:n=t}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${mi}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tC{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=s=>new Promise((o,l)=>{try{const u=e(s);o(u)}catch(u){l(u)}});r.onAbort=n,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const i of n)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function nC(t,e={}){return Mr(t,"GET","/v2/passwordPolicy",Lr(t,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rC=6;class iC{constructor(e){var n,r,i,s;const o=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(n=o.minPasswordLength)!==null&&n!==void 0?n:rC,o.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=o.maxPasswordLength),o.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=o.containsLowercaseCharacter),o.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=o.containsUppercaseCharacter),o.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=o.containsNumericCharacter),o.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=o.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(i=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&i!==void 0?i:"",this.forceUpgradeOnSignin=(s=e.forceUpgradeOnSignin)!==null&&s!==void 0?s:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var n,r,i,s,o,l;const u={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,u),this.validatePasswordCharacterOptions(e,u),u.isValid&&(u.isValid=(n=u.meetsMinPasswordLength)!==null&&n!==void 0?n:!0),u.isValid&&(u.isValid=(r=u.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),u.isValid&&(u.isValid=(i=u.containsLowercaseLetter)!==null&&i!==void 0?i:!0),u.isValid&&(u.isValid=(s=u.containsUppercaseLetter)!==null&&s!==void 0?s:!0),u.isValid&&(u.isValid=(o=u.containsNumericCharacter)!==null&&o!==void 0?o:!0),u.isValid&&(u.isValid=(l=u.containsNonAlphanumericCharacter)!==null&&l!==void 0?l:!0),u}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),i&&(n.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sC{constructor(e,n,r,i){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new e_(this),this.idTokenSubscription=new e_(this),this.beforeStateQueue=new tC(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=kE,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=Rn(n)),this._initializationPromise=this.queue(async()=>{var r,i,s;if(!this._deleted&&(this.persistenceManager=await Qi.create(this,e),(r=this._resolvePersistenceManagerAvailable)===null||r===void 0||r.call(this),!this._deleted)){if(!((i=this._popupRedirectResolver)===null||i===void 0)&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((s=this.currentUser)===null||s===void 0?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await uu(this,{idToken:e}),r=await Wt._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var n;if(yt(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(l=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(l,l))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let i=r,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(n=this.redirectUser)===null||n===void 0?void 0:n._redirectEventId,l=i==null?void 0:i._redirectEventId,u=await this.tryRedirectSignIn(e);(!o||o===l)&&(u!=null&&u.user)&&(i=u.user,s=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(i)}catch(o){i=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return G(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await cu(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=M2()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(yt(this.app))return Promise.reject(Nn(this));const n=e?ge(e):null;return n&&G(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&G(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return yt(this.app)?Promise.reject(Nn(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return yt(this.app)?Promise.reject(Nn(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Rn(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await nC(this),n=new iC(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Jo("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await J2(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&Rn(e)||this._popupRedirectResolver;G(n,this,"argument-error"),this.redirectPersistenceManager=await Qi.create(this,[Rn(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,r;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)===null||n===void 0?void 0:n._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(n=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&n!==void 0?n:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,i){if(this._deleted)return()=>{};const s=typeof n=="function"?n:n.next.bind(n);let o=!1;const l=this._isInitialized?Promise.resolve():this._initializationPromise;if(G(l,this,"internal-error"),l.then(()=>{o||s(this.currentUser)}),typeof n=="function"){const u=e.addObserver(n,r,i);return()=>{o=!0,u()}}else{const u=e.addObserver(n);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return G(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=zE(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const n={"X-Client-Version":this.clientVersion};this.app.options.appId&&(n["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(n["X-Firebase-Client"]=r);const i=await this._getAppCheckToken();return i&&(n["X-Firebase-AppCheck"]=i),n}async _getAppCheckToken(){var e;if(yt(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const n=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return n!=null&&n.error&&D2(`Error while retrieving App Check token: ${n.error}`),n==null?void 0:n.token}}function jr(t){return ge(t)}class e_{constructor(e){this.auth=e,this.observer=null,this.addObserver=eA(n=>this.observer=n)}get next(){return G(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ku={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function oC(t){Ku=t}function BE(t){return Ku.loadJS(t)}function aC(){return Ku.recaptchaEnterpriseScript}function lC(){return Ku.gapiScript}function uC(t){return`__${t}${Math.floor(Math.random()*1e6)}`}class cC{constructor(){this.enterprise=new hC}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}class hC{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}const dC="recaptcha-enterprise",$E="NO_RECAPTCHA";class fC{constructor(e){this.type=dC,this.auth=jr(e)}async verify(e="verify",n=!1){async function r(s){if(!n){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise(async(o,l)=>{H2(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(u=>{if(u.recaptchaKey===void 0)l(new Error("recaptcha Enterprise site key undefined"));else{const h=new $2(u);return s.tenantId==null?s._agentRecaptchaConfig=h:s._tenantRecaptchaConfigs[s.tenantId]=h,o(h.siteKey)}}).catch(u=>{l(u)})})}function i(s,o,l){const u=window.grecaptcha;Qy(u)?u.enterprise.ready(()=>{u.enterprise.execute(s,{action:e}).then(h=>{o(h)}).catch(()=>{o($E)})}):l(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new cC().execute("siteKey",{action:"verify"}):new Promise((s,o)=>{r(this.auth).then(l=>{if(!n&&Qy(window.grecaptcha))i(l,s,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let u=aC();u.length!==0&&(u+=l),BE(u).then(()=>{i(l,s,o)}).catch(h=>{o(h)})}}).catch(l=>{o(l)})})}}async function t_(t,e,n,r=!1,i=!1){const s=new fC(t);let o;if(i)o=$E;else try{o=await s.verify(n)}catch{o=await s.verify(n,!0)}const l=Object.assign({},e);if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in l){const u=l.phoneEnrollmentInfo.phoneNumber,h=l.phoneEnrollmentInfo.recaptchaToken;Object.assign(l,{phoneEnrollmentInfo:{phoneNumber:u,recaptchaToken:h,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in l){const u=l.phoneSignInInfo.recaptchaToken;Object.assign(l,{phoneSignInInfo:{recaptchaToken:u,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return l}return r?Object.assign(l,{captchaResp:o}):Object.assign(l,{captchaResponse:o}),Object.assign(l,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(l,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),l}async function n_(t,e,n,r,i){var s;if(!((s=t._getRecaptchaConfig())===null||s===void 0)&&s.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const o=await t_(t,e,n,n==="getOobCode");return r(t,o)}else return r(t,e).catch(async o=>{if(o.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const l=await t_(t,e,n,n==="getOobCode");return r(t,l)}else return Promise.reject(o)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pC(t,e){const n=Nu(t,"auth");if(n.isInitialized()){const i=n.getImmediate(),s=n.getOptions();if(ai(s,e??{}))return i;Ut(i,"already-initialized")}return n.initialize({options:e})}function mC(t,e){const n=(e==null?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(Rn);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function gC(t,e,n){const r=jr(t);G(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const i=!1,s=HE(e),{host:o,port:l}=yC(e),u=l===null?"":`:${l}`,h={url:`${s}//${o}${u}/`},f=Object.freeze({host:o,port:l,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})});if(!r._canInitEmulator){G(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),G(ai(h,r.config.emulator)&&ai(f,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=h,r.emulatorConfig=f,r.settings.appVerificationDisabledForTesting=!0,br(o)?(_f(`${s}//${o}${u}`),vf("Auth",!0)):_C()}function HE(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function yC(t){const e=HE(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const r=n[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){const s=i[1];return{host:s,port:r_(r.substr(s.length+1))}}else{const[s,o]=r.split(":");return{host:s,port:r_(o)}}}function r_(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function _C(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gp{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return kn("not implemented")}_getIdTokenResponse(e){return kn("not implemented")}_linkToIdToken(e,n){return kn("not implemented")}_getReauthenticationResolver(e){return kn("not implemented")}}async function vC(t,e){return Mr(t,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function wC(t,e){return ua(t,"POST","/v1/accounts:signInWithPassword",Lr(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function EC(t,e){return ua(t,"POST","/v1/accounts:signInWithEmailLink",Lr(t,e))}async function TC(t,e){return ua(t,"POST","/v1/accounts:signInWithEmailLink",Lr(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wo extends gp{constructor(e,n,r,i=null){super("password",r),this._email=e,this._password=n,this._tenantId=i}static _fromEmailAndPassword(e,n){return new Wo(e,n,"password")}static _fromEmailAndCode(e,n,r=null){return new Wo(e,n,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e;if(n!=null&&n.email&&(n!=null&&n.password)){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return n_(e,n,"signInWithPassword",wC);case"emailLink":return EC(e,{email:this._email,oobCode:this._password});default:Ut(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":const r={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return n_(e,r,"signUpPassword",vC);case"emailLink":return TC(e,{idToken:n,email:this._email,oobCode:this._password});default:Ut(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Xi(t,e){return ua(t,"POST","/v1/accounts:signInWithIdp",Lr(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const IC="http://localhost";class zn extends gp{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new zn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):Ut("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i}=n,s=cp(n,["providerId","signInMethod"]);if(!r||!i)return null;const o=new zn(r,i);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const n=this.buildRequest();return Xi(e,n)}_linkToIdToken(e,n){const r=this.buildRequest();return r.idToken=n,Xi(e,r)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,Xi(e,n)}buildRequest(){const e={requestUri:IC,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=Zo(n)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xC(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function AC(t){const e=Ks(Qs(t)).link,n=e?Ks(Qs(e)).deep_link_id:null,r=Ks(Qs(t)).deep_link_id;return(r?Ks(Qs(r)).link:null)||r||n||e||t}class yp{constructor(e){var n,r,i,s,o,l;const u=Ks(Qs(e)),h=(n=u.apiKey)!==null&&n!==void 0?n:null,f=(r=u.oobCode)!==null&&r!==void 0?r:null,p=xC((i=u.mode)!==null&&i!==void 0?i:null);G(h&&f&&p,"argument-error"),this.apiKey=h,this.operation=p,this.code=f,this.continueUrl=(s=u.continueUrl)!==null&&s!==void 0?s:null,this.languageCode=(o=u.lang)!==null&&o!==void 0?o:null,this.tenantId=(l=u.tenantId)!==null&&l!==void 0?l:null}static parseLink(e){const n=AC(e);try{return new yp(n)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vs{constructor(){this.providerId=vs.PROVIDER_ID}static credential(e,n){return Wo._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){const r=yp.parseLink(n);return G(r,"argument-error"),Wo._fromEmailAndCode(e,r.code,r.tenantId)}}vs.PROVIDER_ID="password";vs.EMAIL_PASSWORD_SIGN_IN_METHOD="password";vs.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _p{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ws extends _p{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}class Yi extends ws{static credentialFromJSON(e){const n=typeof e=="string"?JSON.parse(e):e;return G("providerId"in n&&"signInMethod"in n,"argument-error"),zn._fromParams(n)}credential(e){return this._credential(Object.assign(Object.assign({},e),{nonce:e.rawNonce}))}_credential(e){return G(e.idToken||e.accessToken,"argument-error"),zn._fromParams(Object.assign(Object.assign({},e),{providerId:this.providerId,signInMethod:this.providerId}))}static credentialFromResult(e){return Yi.oauthCredentialFromTaggedObject(e)}static credentialFromError(e){return Yi.oauthCredentialFromTaggedObject(e.customData||{})}static oauthCredentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:r,oauthTokenSecret:i,pendingToken:s,nonce:o,providerId:l}=e;if(!r&&!i&&!n&&!s||!l)return null;try{return new Yi(l)._credential({idToken:n,accessToken:r,nonce:o,pendingToken:s})}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tn extends ws{constructor(){super("facebook.com")}static credential(e){return zn._fromParams({providerId:Tn.PROVIDER_ID,signInMethod:Tn.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Tn.credentialFromTaggedObject(e)}static credentialFromError(e){return Tn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Tn.credential(e.oauthAccessToken)}catch{return null}}}Tn.FACEBOOK_SIGN_IN_METHOD="facebook.com";Tn.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class In extends ws{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return zn._fromParams({providerId:In.PROVIDER_ID,signInMethod:In.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return In.credentialFromTaggedObject(e)}static credentialFromError(e){return In.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:r}=e;if(!n&&!r)return null;try{return In.credential(n,r)}catch{return null}}}In.GOOGLE_SIGN_IN_METHOD="google.com";In.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jn extends ws{constructor(){super("github.com")}static credential(e){return zn._fromParams({providerId:Jn.PROVIDER_ID,signInMethod:Jn.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Jn.credentialFromTaggedObject(e)}static credentialFromError(e){return Jn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Jn.credential(e.oauthAccessToken)}catch{return null}}}Jn.GITHUB_SIGN_IN_METHOD="github.com";Jn.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xn extends ws{constructor(){super("twitter.com")}static credential(e,n){return zn._fromParams({providerId:xn.PROVIDER_ID,signInMethod:xn.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return xn.credentialFromTaggedObject(e)}static credentialFromError(e){return xn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:r}=e;if(!n||!r)return null;try{return xn.credential(n,r)}catch{return null}}}xn.TWITTER_SIGN_IN_METHOD="twitter.com";xn.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function SC(t,e){return ua(t,"POST","/v1/accounts:signUp",Lr(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rr{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,i=!1){const s=await Wt._fromIdTokenResponse(e,r,i),o=i_(r);return new Rr({user:s,providerId:o,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const i=i_(r);return new Rr({user:e,providerId:i,_tokenResponse:r,operationType:n})}}function i_(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function kC(t){var e;if(yt(t.app))return Promise.reject(Nn(t));const n=jr(t);if(await n._initializationPromise,!((e=n.currentUser)===null||e===void 0)&&e.isAnonymous)return new Rr({user:n.currentUser,providerId:null,operationType:"signIn"});const r=await SC(n,{returnSecureToken:!0}),i=await Rr._fromIdTokenResponse(n,"signIn",r,!0);return await n._updateCurrentUser(i.user),i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hu extends dn{constructor(e,n,r,i){var s;super(n.code,n.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,hu.prototype),this.customData={appName:e.name,tenantId:(s=e.tenantId)!==null&&s!==void 0?s:void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,i){return new hu(e,n,r,i)}}function qE(t,e,n,r){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?hu._fromErrorAndOperation(t,s,e,r):s})}async function RC(t,e,n=!1){const r=await qo(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return Rr._forOperation(t,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function CC(t,e,n=!1){const{auth:r}=t;if(yt(r.app))return Promise.reject(Nn(r));const i="reauthenticate";try{const s=await qo(t,qE(r,i,e,t),n);G(s.idToken,r,"internal-error");const o=pp(s.idToken);G(o,r,"internal-error");const{sub:l}=o;return G(t.uid===l,r,"user-mismatch"),Rr._forOperation(t,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&Ut(r,"user-mismatch"),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function WE(t,e,n=!1){if(yt(t.app))return Promise.reject(Nn(t));const r="signIn",i=await qE(t,r,e),s=await Rr._fromIdTokenResponse(t,r,i);return n||await t._updateCurrentUser(s.user),s}async function PC(t,e){return WE(jr(t),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function NC(t){const e=jr(t);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}function bC(t,e,n){return yt(t.app)?Promise.reject(Nn(t)):PC(ge(t),vs.credential(e,n)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&NC(t),r})}function DC(t,e,n,r){return ge(t).onIdTokenChanged(e,n,r)}function OC(t,e,n){return ge(t).beforeAuthStateChanged(e,n)}function VC(t,e,n,r){return ge(t).onAuthStateChanged(e,n,r)}function LC(t){return ge(t).signOut()}const du="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class GE{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(du,"1"),this.storage.removeItem(du),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const MC=1e3,jC=10;class KE extends GE{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=UE(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const r=this.storage.getItem(n),i=this.localCache[n];r!==i&&e(n,i,r)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((o,l,u)=>{this.notifyListeners(o,u)});return}const r=e.key;n?this.detachListener():this.stopPolling();const i=()=>{const o=this.storage.getItem(r);!n&&this.localCache[r]===o||this.notifyListeners(r,o)},s=this.storage.getItem(r);eC()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,jC):i()}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:r}),!0)})},MC)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}KE.type="LOCAL";const FC=KE;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class QE extends GE{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}QE.type="SESSION";const XE=QE;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function UC(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qu{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(i=>i.isListeningto(e));if(n)return n;const r=new Qu(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:r,eventType:i,data:s}=n.data,o=this.handlersMap[i];if(!(o!=null&&o.size))return;n.ports[0].postMessage({status:"ack",eventId:r,eventType:i});const l=Array.from(o).map(async h=>h(n.origin,s)),u=await UC(l);n.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:u})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Qu.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vp(t="",e=10){let n="";for(let r=0;r<e;r++)n+=Math.floor(Math.random()*10);return t+n}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zC{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,r=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,o;return new Promise((l,u)=>{const h=vp("",20);i.port1.start();const f=setTimeout(()=>{u(new Error("unsupported_event"))},r);o={messageChannel:i,onMessage(p){const m=p;if(m.data.eventId===h)switch(m.data.status){case"ack":clearTimeout(f),s=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),l(m.data.response);break;default:clearTimeout(f),clearTimeout(s),u(new Error("invalid_response"));break}}},this.handlers.add(o),i.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:h,data:n},[i.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cn(){return window}function BC(t){cn().location.href=t}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function YE(){return typeof cn().WorkerGlobalScope<"u"&&typeof cn().importScripts=="function"}async function $C(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function HC(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)===null||t===void 0?void 0:t.controller)||null}function qC(){return YE()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const JE="firebaseLocalStorageDb",WC=1,fu="firebaseLocalStorage",ZE="fbase_key";class ca{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function Xu(t,e){return t.transaction([fu],e?"readwrite":"readonly").objectStore(fu)}function GC(){const t=indexedDB.deleteDatabase(JE);return new ca(t).toPromise()}function Ed(){const t=indexedDB.open(JE,WC);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const r=t.result;try{r.createObjectStore(fu,{keyPath:ZE})}catch(i){n(i)}}),t.addEventListener("success",async()=>{const r=t.result;r.objectStoreNames.contains(fu)?e(r):(r.close(),await GC(),e(await Ed()))})})}async function s_(t,e,n){const r=Xu(t,!0).put({[ZE]:e,value:n});return new ca(r).toPromise()}async function KC(t,e){const n=Xu(t,!1).get(e),r=await new ca(n).toPromise();return r===void 0?null:r.value}function o_(t,e){const n=Xu(t,!0).delete(e);return new ca(n).toPromise()}const QC=800,XC=3;class e1{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Ed(),this.db)}async _withRetries(e){let n=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(n++>XC)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return YE()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Qu._getInstance(qC()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var e,n;if(this.activeServiceWorker=await $C(),!this.activeServiceWorker)return;this.sender=new zC(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((n=r[0])===null||n===void 0)&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||HC()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Ed();return await s_(e,du,"1"),await o_(e,du),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(r=>s_(r,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(r=>KC(r,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>o_(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(i=>{const s=Xu(i,!1).getAll();return new ca(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],r=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),n.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),n.push(i));return n}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),QC)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}e1.type="LOCAL";const YC=e1;new la(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function t1(t,e){return e?Rn(e):(G(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wp extends gp{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Xi(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Xi(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Xi(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function JC(t){return WE(t.auth,new wp(t),t.bypassAuthState)}function ZC(t){const{auth:e,user:n}=t;return G(n,e,"internal-error"),CC(n,new wp(t),t.bypassAuthState)}async function eP(t){const{auth:e,user:n}=t;return G(n,e,"internal-error"),RC(n,new wp(t),t.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class n1{constructor(e,n,r,i,s=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:r,postBody:i,tenantId:s,error:o,type:l}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:n,sessionId:r,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(l)(u))}catch(h){this.reject(h)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return JC;case"linkViaPopup":case"linkViaRedirect":return eP;case"reauthViaPopup":case"reauthViaRedirect":return ZC;default:Ut(this.auth,"internal-error")}}resolve(e){Un(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Un(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tP=new la(2e3,1e4);async function nP(t,e,n){if(yt(t.app))return Promise.reject(Qt(t,"operation-not-supported-in-this-environment"));const r=jr(t);O2(t,e,_p);const i=t1(r,n);return new Yr(r,"signInViaPopup",e,i).executeNotNull()}class Yr extends n1{constructor(e,n,r,i,s){super(e,n,i,s),this.provider=r,this.authWindow=null,this.pollId=null,Yr.currentPopupAction&&Yr.currentPopupAction.cancel(),Yr.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return G(e,this.auth,"internal-error"),e}async onExecution(){Un(this.filter.length===1,"Popup operations only handle one event");const e=vp();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(Qt(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(Qt(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Yr.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,r;if(!((r=(n=this.authWindow)===null||n===void 0?void 0:n.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Qt(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,tP.get())};e()}}Yr.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rP="pendingRedirect",wl=new Map;class iP extends n1{constructor(e,n,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,r),this.eventId=null}async execute(){let e=wl.get(this.auth._key());if(!e){try{const r=await sP(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(n){e=()=>Promise.reject(n)}wl.set(this.auth._key(),e)}return this.bypassAuthState||wl.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function sP(t,e){const n=lP(e),r=aP(t);if(!await r._isAvailable())return!1;const i=await r._get(n)==="true";return await r._remove(n),i}function oP(t,e){wl.set(t._key(),e)}function aP(t){return Rn(t._redirectPersistence)}function lP(t){return vl(rP,t.config.apiKey,t.name)}async function uP(t,e,n=!1){if(yt(t.app))return Promise.reject(Nn(t));const r=jr(t),i=t1(r,e),o=await new iP(r,i,n).execute();return o&&!n&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cP=10*60*1e3;class hP{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(n=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!dP(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var r;if(e.error&&!r1(e)){const i=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";n.onError(Qt(this.auth,i))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const r=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=cP&&this.cachedEventUids.clear(),this.cachedEventUids.has(a_(e))}saveEventToCache(e){this.cachedEventUids.add(a_(e)),this.lastProcessedEventTime=Date.now()}}function a_(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function r1({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function dP(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return r1(t);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fP(t,e={}){return Mr(t,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pP=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,mP=/^https?/;async function gP(t){if(t.config.emulator)return;const{authorizedDomains:e}=await fP(t);for(const n of e)try{if(yP(n))return}catch{}Ut(t,"unauthorized-domain")}function yP(t){const e=vd(),{protocol:n,hostname:r}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&r===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&o.hostname===r}if(!mP.test(n))return!1;if(pP.test(t))return r===t;const i=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _P=new la(3e4,6e4);function l_(){const t=cn().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function vP(t){return new Promise((e,n)=>{var r,i,s;function o(){l_(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{l_(),n(Qt(t,"network-request-failed"))},timeout:_P.get()})}if(!((i=(r=cn().gapi)===null||r===void 0?void 0:r.iframes)===null||i===void 0)&&i.Iframe)e(gapi.iframes.getContext());else if(!((s=cn().gapi)===null||s===void 0)&&s.load)o();else{const l=uC("iframefcb");return cn()[l]=()=>{gapi.load?o():n(Qt(t,"network-request-failed"))},BE(`${lC()}?onload=${l}`).catch(u=>n(u))}}).catch(e=>{throw El=null,e})}let El=null;function wP(t){return El=El||vP(t),El}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const EP=new la(5e3,15e3),TP="__/auth/iframe",IP="emulator/auth/iframe",xP={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},AP=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function SP(t){const e=t.config;G(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?fp(e,IP):`https://${t.config.authDomain}/${TP}`,r={apiKey:e.apiKey,appName:t.name,v:mi},i=AP.get(t.config.apiHost);i&&(r.eid=i);const s=t._getFrameworks();return s.length&&(r.fw=s.join(",")),`${n}?${Zo(r).slice(1)}`}async function kP(t){const e=await wP(t),n=cn().gapi;return G(n,t,"internal-error"),e.open({where:document.body,url:SP(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:xP,dontclear:!0},r=>new Promise(async(i,s)=>{await r.restyle({setHideOnLeave:!1});const o=Qt(t,"network-request-failed"),l=cn().setTimeout(()=>{s(o)},EP.get());function u(){cn().clearTimeout(l),i(r)}r.ping(u).then(u,()=>{s(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const RP={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},CP=500,PP=600,NP="_blank",bP="http://localhost";class u_{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function DP(t,e,n,r=CP,i=PP){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let l="";const u=Object.assign(Object.assign({},RP),{width:r.toString(),height:i.toString(),top:s,left:o}),h=ot().toLowerCase();n&&(l=VE(h)?NP:n),DE(h)&&(e=e||bP,u.scrollbars="yes");const f=Object.entries(u).reduce((m,[S,R])=>`${m}${S}=${R},`,"");if(Z2(h)&&l!=="_self")return OP(e||"",l),new u_(null);const p=window.open(e||"",l,f);G(p,t,"popup-blocked");try{p.focus()}catch{}return new u_(p)}function OP(t,e){const n=document.createElement("a");n.href=t,n.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const VP="__/auth/handler",LP="emulator/auth/handler",MP=encodeURIComponent("fac");async function c_(t,e,n,r,i,s){G(t.config.authDomain,t,"auth-domain-config-required"),G(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:r,v:mi,eventId:i};if(e instanceof _p){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",Zx(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,p]of Object.entries({}))o[f]=p}if(e instanceof ws){const f=e.getScopes().filter(p=>p!=="");f.length>0&&(o.scopes=f.join(","))}t.tenantId&&(o.tid=t.tenantId);const l=o;for(const f of Object.keys(l))l[f]===void 0&&delete l[f];const u=await t._getAppCheckToken(),h=u?`#${MP}=${encodeURIComponent(u)}`:"";return`${jP(t)}?${Zo(l).slice(1)}${h}`}function jP({config:t}){return t.emulator?fp(t,LP):`https://${t.authDomain}/${VP}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const th="webStorageSupport";class FP{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=XE,this._completeRedirectFn=uP,this._overrideRedirectResult=oP}async _openPopup(e,n,r,i){var s;Un((s=this.eventManagers[e._key()])===null||s===void 0?void 0:s.manager,"_initialize() not called before _openPopup()");const o=await c_(e,n,r,vd(),i);return DP(e,o,vp())}async _openRedirect(e,n,r,i){await this._originValidation(e);const s=await c_(e,n,r,vd(),i);return BC(s),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:i,promise:s}=this.eventManagers[n];return i?Promise.resolve(i):(Un(s,"If manager is not set, promise should be"),s)}const r=this.initAndGetManager(e);return this.eventManagers[n]={promise:r},r.catch(()=>{delete this.eventManagers[n]}),r}async initAndGetManager(e){const n=await kP(e),r=new hP(e);return n.register("authEvent",i=>(G(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=n,r}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(th,{type:th},i=>{var s;const o=(s=i==null?void 0:i[0])===null||s===void 0?void 0:s[th];o!==void 0&&n(!!o),Ut(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=gP(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return UE()||OE()||mp()}}const UP=FP;var h_="@firebase/auth",d_="1.10.8";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zP{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){G(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function BP(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function $P(t){li(new wr("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:l}=r.options;G(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const u={apiKey:o,authDomain:l,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:zE(t)},h=new sC(r,i,s,u);return mC(h,n),h},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),li(new wr("auth-internal",e=>{const n=jr(e.getProvider("auth").getImmediate());return(r=>new zP(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),on(h_,d_,BP(t)),on(h_,d_,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const HP=5*60,qP=U0("authIdTokenMaxAge")||HP;let f_=null;const WP=t=>async e=>{const n=e&&await e.getIdTokenResult(),r=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(r&&r>qP)return;const i=n==null?void 0:n.token;f_!==i&&(f_=i,await fetch(t,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function GP(t=Tf()){const e=Nu(t,"auth");if(e.isInitialized())return e.getImmediate();const n=pC(t,{popupRedirectResolver:UP,persistence:[YC,FC,XE]}),r=U0("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(r,location.origin);if(location.origin===s.origin){const o=WP(s.toString());OC(n,o,()=>o(n.currentUser)),DC(n,l=>o(l))}}const i=M0("auth");return i&&gC(n,`http://${i}`),n}function KP(){var t,e;return(e=(t=document.getElementsByTagName("head"))===null||t===void 0?void 0:t[0])!==null&&e!==void 0?e:document}oC({loadJS(t){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=i=>{const s=Qt("internal-error");s.customData=i,n(s)},r.type="text/javascript",r.charset="UTF-8",KP().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});$P("Browser");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const i1="firebasestorage.googleapis.com",s1="storageBucket",QP=2*60*1e3,XP=10*60*1e3;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ke extends dn{constructor(e,n,r=0){super(nh(e),`Firebase Storage: ${n} (${nh(e)})`),this.status_=r,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,ke.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return nh(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var Se;(function(t){t.UNKNOWN="unknown",t.OBJECT_NOT_FOUND="object-not-found",t.BUCKET_NOT_FOUND="bucket-not-found",t.PROJECT_NOT_FOUND="project-not-found",t.QUOTA_EXCEEDED="quota-exceeded",t.UNAUTHENTICATED="unauthenticated",t.UNAUTHORIZED="unauthorized",t.UNAUTHORIZED_APP="unauthorized-app",t.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",t.INVALID_CHECKSUM="invalid-checksum",t.CANCELED="canceled",t.INVALID_EVENT_NAME="invalid-event-name",t.INVALID_URL="invalid-url",t.INVALID_DEFAULT_BUCKET="invalid-default-bucket",t.NO_DEFAULT_BUCKET="no-default-bucket",t.CANNOT_SLICE_BLOB="cannot-slice-blob",t.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",t.NO_DOWNLOAD_URL="no-download-url",t.INVALID_ARGUMENT="invalid-argument",t.INVALID_ARGUMENT_COUNT="invalid-argument-count",t.APP_DELETED="app-deleted",t.INVALID_ROOT_OPERATION="invalid-root-operation",t.INVALID_FORMAT="invalid-format",t.INTERNAL_ERROR="internal-error",t.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(Se||(Se={}));function nh(t){return"storage/"+t}function Ep(){const t="An unknown error occurred, please check the error payload for server response.";return new ke(Se.UNKNOWN,t)}function YP(t){return new ke(Se.OBJECT_NOT_FOUND,"Object '"+t+"' does not exist.")}function JP(t){return new ke(Se.QUOTA_EXCEEDED,"Quota for bucket '"+t+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function ZP(){const t="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new ke(Se.UNAUTHENTICATED,t)}function eN(){return new ke(Se.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function tN(t){return new ke(Se.UNAUTHORIZED,"User does not have permission to access '"+t+"'.")}function nN(){return new ke(Se.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function rN(){return new ke(Se.CANCELED,"User canceled the upload/download.")}function iN(t){return new ke(Se.INVALID_URL,"Invalid URL '"+t+"'.")}function sN(t){return new ke(Se.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+t+"'.")}function oN(){return new ke(Se.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+s1+"' property when initializing the app?")}function aN(){return new ke(Se.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function lN(){return new ke(Se.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function uN(t){return new ke(Se.UNSUPPORTED_ENVIRONMENT,`${t} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function Td(t){return new ke(Se.INVALID_ARGUMENT,t)}function o1(){return new ke(Se.APP_DELETED,"The Firebase app was deleted.")}function cN(t){return new ke(Se.INVALID_ROOT_OPERATION,"The operation '"+t+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function _o(t,e){return new ke(Se.INVALID_FORMAT,"String does not match format '"+t+"': "+e)}function $s(t){throw new ke(Se.INTERNAL_ERROR,"Internal error: "+t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kt{constructor(e,n){this.bucket=e,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,n){let r;try{r=kt.makeFromUrl(e,n)}catch{return new kt(e,"")}if(r.path==="")return r;throw sN(e)}static makeFromUrl(e,n){let r=null;const i="([A-Za-z0-9.\\-_]+)";function s(b){b.path.charAt(b.path.length-1)==="/"&&(b.path_=b.path_.slice(0,-1))}const o="(/(.*))?$",l=new RegExp("^gs://"+i+o,"i"),u={bucket:1,path:3};function h(b){b.path_=decodeURIComponent(b.path)}const f="v[A-Za-z0-9_]+",p=n.replace(/[.]/g,"\\."),m="(/([^?#]*).*)?$",S=new RegExp(`^https?://${p}/${f}/b/${i}/o${m}`,"i"),R={bucket:1,path:3},N=n===i1?"(?:storage.googleapis.com|storage.cloud.google.com)":n,O="([^?#]*)",I=new RegExp(`^https?://${N}/${i}/${O}`,"i"),E=[{regex:l,indices:u,postModify:s},{regex:S,indices:R,postModify:h},{regex:I,indices:{bucket:1,path:2},postModify:h}];for(let b=0;b<E.length;b++){const M=E[b],j=M.regex.exec(e);if(j){const v=j[M.indices.bucket];let _=j[M.indices.path];_||(_=""),r=new kt(v,_),M.postModify(r);break}}if(r==null)throw iN(e);return r}}class hN{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dN(t,e,n){let r=1,i=null,s=null,o=!1,l=0;function u(){return l===2}let h=!1;function f(...O){h||(h=!0,e.apply(null,O))}function p(O){i=setTimeout(()=>{i=null,t(S,u())},O)}function m(){s&&clearTimeout(s)}function S(O,...I){if(h){m();return}if(O){m(),f.call(null,O,...I);return}if(u()||o){m(),f.call(null,O,...I);return}r<64&&(r*=2);let E;l===1?(l=2,E=0):E=(r+Math.random())*1e3,p(E)}let R=!1;function N(O){R||(R=!0,m(),!h&&(i!==null?(O||(l=2),clearTimeout(i),p(0)):O||(l=1)))}return p(0),s=setTimeout(()=>{o=!0,N(!0)},n),N}function fN(t){t(!1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pN(t){return t!==void 0}function mN(t){return typeof t=="object"&&!Array.isArray(t)}function Tp(t){return typeof t=="string"||t instanceof String}function p_(t){return Ip()&&t instanceof Blob}function Ip(){return typeof Blob<"u"}function m_(t,e,n,r){if(r<e)throw Td(`Invalid value for '${t}'. Expected ${e} or greater.`);if(r>n)throw Td(`Invalid value for '${t}'. Expected ${n} or less.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xp(t,e,n){let r=e;return n==null&&(r=`https://${e}`),`${n}://${r}/v0${t}`}function a1(t){const e=encodeURIComponent;let n="?";for(const r in t)if(t.hasOwnProperty(r)){const i=e(r)+"="+e(t[r]);n=n+i+"&"}return n=n.slice(0,-1),n}var ti;(function(t){t[t.NO_ERROR=0]="NO_ERROR",t[t.NETWORK_ERROR=1]="NETWORK_ERROR",t[t.ABORT=2]="ABORT"})(ti||(ti={}));/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gN(t,e){const n=t>=500&&t<600,i=[408,429].indexOf(t)!==-1,s=e.indexOf(t)!==-1;return n||i||s}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yN{constructor(e,n,r,i,s,o,l,u,h,f,p,m=!0,S=!1){this.url_=e,this.method_=n,this.headers_=r,this.body_=i,this.successCodes_=s,this.additionalRetryCodes_=o,this.callback_=l,this.errorCallback_=u,this.timeout_=h,this.progressCallback_=f,this.connectionFactory_=p,this.retry=m,this.isUsingEmulator=S,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((R,N)=>{this.resolve_=R,this.reject_=N,this.start_()})}start_(){const e=(r,i)=>{if(i){r(!1,new Ja(!1,null,!0));return}const s=this.connectionFactory_();this.pendingConnection_=s;const o=l=>{const u=l.loaded,h=l.lengthComputable?l.total:-1;this.progressCallback_!==null&&this.progressCallback_(u,h)};this.progressCallback_!==null&&s.addUploadProgressListener(o),s.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&s.removeUploadProgressListener(o),this.pendingConnection_=null;const l=s.getErrorCode()===ti.NO_ERROR,u=s.getStatus();if(!l||gN(u,this.additionalRetryCodes_)&&this.retry){const f=s.getErrorCode()===ti.ABORT;r(!1,new Ja(!1,null,f));return}const h=this.successCodes_.indexOf(u)!==-1;r(!0,new Ja(h,s))})},n=(r,i)=>{const s=this.resolve_,o=this.reject_,l=i.connection;if(i.wasSuccessCode)try{const u=this.callback_(l,l.getResponse());pN(u)?s(u):s()}catch(u){o(u)}else if(l!==null){const u=Ep();u.serverResponse=l.getErrorText(),this.errorCallback_?o(this.errorCallback_(l,u)):o(u)}else if(i.canceled){const u=this.appDelete_?o1():rN();o(u)}else{const u=nN();o(u)}};this.canceled_?n(!1,new Ja(!1,null,!0)):this.backoffId_=dN(e,n,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&fN(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class Ja{constructor(e,n,r){this.wasSuccessCode=e,this.connection=n,this.canceled=!!r}}function _N(t,e){e!==null&&e.length>0&&(t.Authorization="Firebase "+e)}function vN(t,e){t["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function wN(t,e){e&&(t["X-Firebase-GMPID"]=e)}function EN(t,e){e!==null&&(t["X-Firebase-AppCheck"]=e)}function TN(t,e,n,r,i,s,o=!0,l=!1){const u=a1(t.urlParams),h=t.url+u,f=Object.assign({},t.headers);return wN(f,e),_N(f,n),vN(f,s),EN(f,r),new yN(h,t.method,f,t.body,t.successCodes,t.additionalRetryCodes,t.handler,t.errorHandler,t.timeout,t.progressCallback,i,o,l)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function IN(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function xN(...t){const e=IN();if(e!==void 0){const n=new e;for(let r=0;r<t.length;r++)n.append(t[r]);return n.getBlob()}else{if(Ip())return new Blob(t);throw new ke(Se.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function AN(t,e,n){return t.webkitSlice?t.webkitSlice(e,n):t.mozSlice?t.mozSlice(e,n):t.slice?t.slice(e,n):null}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function SN(t){if(typeof atob>"u")throw uN("base-64");return atob(t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nn={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class rh{constructor(e,n){this.data=e,this.contentType=n||null}}function kN(t,e){switch(t){case nn.RAW:return new rh(l1(e));case nn.BASE64:case nn.BASE64URL:return new rh(u1(t,e));case nn.DATA_URL:return new rh(CN(e),PN(e))}throw Ep()}function l1(t){const e=[];for(let n=0;n<t.length;n++){let r=t.charCodeAt(n);if(r<=127)e.push(r);else if(r<=2047)e.push(192|r>>6,128|r&63);else if((r&64512)===55296)if(!(n<t.length-1&&(t.charCodeAt(n+1)&64512)===56320))e.push(239,191,189);else{const s=r,o=t.charCodeAt(++n);r=65536|(s&1023)<<10|o&1023,e.push(240|r>>18,128|r>>12&63,128|r>>6&63,128|r&63)}else(r&64512)===56320?e.push(239,191,189):e.push(224|r>>12,128|r>>6&63,128|r&63)}return new Uint8Array(e)}function RN(t){let e;try{e=decodeURIComponent(t)}catch{throw _o(nn.DATA_URL,"Malformed data URL.")}return l1(e)}function u1(t,e){switch(t){case nn.BASE64:{const i=e.indexOf("-")!==-1,s=e.indexOf("_")!==-1;if(i||s)throw _o(t,"Invalid character '"+(i?"-":"_")+"' found: is it base64url encoded?");break}case nn.BASE64URL:{const i=e.indexOf("+")!==-1,s=e.indexOf("/")!==-1;if(i||s)throw _o(t,"Invalid character '"+(i?"+":"/")+"' found: is it base64 encoded?");e=e.replace(/-/g,"+").replace(/_/g,"/");break}}let n;try{n=SN(e)}catch(i){throw i.message.includes("polyfill")?i:_o(t,"Invalid character found")}const r=new Uint8Array(n.length);for(let i=0;i<n.length;i++)r[i]=n.charCodeAt(i);return r}class c1{constructor(e){this.base64=!1,this.contentType=null;const n=e.match(/^data:([^,]+)?,/);if(n===null)throw _o(nn.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const r=n[1]||null;r!=null&&(this.base64=NN(r,";base64"),this.contentType=this.base64?r.substring(0,r.length-7):r),this.rest=e.substring(e.indexOf(",")+1)}}function CN(t){const e=new c1(t);return e.base64?u1(nn.BASE64,e.rest):RN(e.rest)}function PN(t){return new c1(t).contentType}function NN(t,e){return t.length>=e.length?t.substring(t.length-e.length)===e:!1}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zn{constructor(e,n){let r=0,i="";p_(e)?(this.data_=e,r=e.size,i=e.type):e instanceof ArrayBuffer?(n?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),r=this.data_.length):e instanceof Uint8Array&&(n?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),r=e.length),this.size_=r,this.type_=i}size(){return this.size_}type(){return this.type_}slice(e,n){if(p_(this.data_)){const r=this.data_,i=AN(r,e,n);return i===null?null:new Zn(i)}else{const r=new Uint8Array(this.data_.buffer,e,n-e);return new Zn(r,!0)}}static getBlob(...e){if(Ip()){const n=e.map(r=>r instanceof Zn?r.data_:r);return new Zn(xN.apply(null,n))}else{const n=e.map(o=>Tp(o)?kN(nn.RAW,o).data:o.data_);let r=0;n.forEach(o=>{r+=o.byteLength});const i=new Uint8Array(r);let s=0;return n.forEach(o=>{for(let l=0;l<o.length;l++)i[s++]=o[l]}),new Zn(i,!0)}}uploadData(){return this.data_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function h1(t){let e;try{e=JSON.parse(t)}catch{return null}return mN(e)?e:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bN(t){if(t.length===0)return null;const e=t.lastIndexOf("/");return e===-1?"":t.slice(0,e)}function DN(t,e){const n=e.split("/").filter(r=>r.length>0).join("/");return t.length===0?n:t+"/"+n}function d1(t){const e=t.lastIndexOf("/",t.length-2);return e===-1?t:t.slice(e+1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ON(t,e){return e}class ut{constructor(e,n,r,i){this.server=e,this.local=n||e,this.writable=!!r,this.xform=i||ON}}let Za=null;function VN(t){return!Tp(t)||t.length<2?t:d1(t)}function f1(){if(Za)return Za;const t=[];t.push(new ut("bucket")),t.push(new ut("generation")),t.push(new ut("metageneration")),t.push(new ut("name","fullPath",!0));function e(s,o){return VN(o)}const n=new ut("name");n.xform=e,t.push(n);function r(s,o){return o!==void 0?Number(o):o}const i=new ut("size");return i.xform=r,t.push(i),t.push(new ut("timeCreated")),t.push(new ut("updated")),t.push(new ut("md5Hash",null,!0)),t.push(new ut("cacheControl",null,!0)),t.push(new ut("contentDisposition",null,!0)),t.push(new ut("contentEncoding",null,!0)),t.push(new ut("contentLanguage",null,!0)),t.push(new ut("contentType",null,!0)),t.push(new ut("metadata","customMetadata",!0)),Za=t,Za}function LN(t,e){function n(){const r=t.bucket,i=t.fullPath,s=new kt(r,i);return e._makeStorageReference(s)}Object.defineProperty(t,"ref",{get:n})}function MN(t,e,n){const r={};r.type="file";const i=n.length;for(let s=0;s<i;s++){const o=n[s];r[o.local]=o.xform(r,e[o.server])}return LN(r,t),r}function p1(t,e,n){const r=h1(e);return r===null?null:MN(t,r,n)}function jN(t,e,n,r){const i=h1(e);if(i===null||!Tp(i.downloadTokens))return null;const s=i.downloadTokens;if(s.length===0)return null;const o=encodeURIComponent;return s.split(",").map(h=>{const f=t.bucket,p=t.fullPath,m="/b/"+o(f)+"/o/"+o(p),S=xp(m,n,r),R=a1({alt:"media",token:h});return S+R})[0]}function FN(t,e){const n={},r=e.length;for(let i=0;i<r;i++){const s=e[i];s.writable&&(n[s.server]=t[s.local])}return JSON.stringify(n)}class m1{constructor(e,n,r,i){this.url=e,this.method=n,this.handler=r,this.timeout=i,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function g1(t){if(!t)throw Ep()}function UN(t,e){function n(r,i){const s=p1(t,i,e);return g1(s!==null),s}return n}function zN(t,e){function n(r,i){const s=p1(t,i,e);return g1(s!==null),jN(s,i,t.host,t._protocol)}return n}function y1(t){function e(n,r){let i;return n.getStatus()===401?n.getErrorText().includes("Firebase App Check token is invalid")?i=eN():i=ZP():n.getStatus()===402?i=JP(t.bucket):n.getStatus()===403?i=tN(t.path):i=r,i.status=n.getStatus(),i.serverResponse=r.serverResponse,i}return e}function BN(t){const e=y1(t);function n(r,i){let s=e(r,i);return r.getStatus()===404&&(s=YP(t.path)),s.serverResponse=i.serverResponse,s}return n}function $N(t,e,n){const r=e.fullServerUrl(),i=xp(r,t.host,t._protocol),s="GET",o=t.maxOperationRetryTime,l=new m1(i,s,zN(t,n),o);return l.errorHandler=BN(e),l}function HN(t,e){return t&&t.contentType||e&&e.type()||"application/octet-stream"}function qN(t,e,n){const r=Object.assign({},n);return r.fullPath=t.path,r.size=e.size(),r.contentType||(r.contentType=HN(null,e)),r}function WN(t,e,n,r,i){const s=e.bucketOnlyServerUrl(),o={"X-Goog-Upload-Protocol":"multipart"};function l(){let E="";for(let b=0;b<2;b++)E=E+Math.random().toString().slice(2);return E}const u=l();o["Content-Type"]="multipart/related; boundary="+u;const h=qN(e,r,i),f=FN(h,n),p="--"+u+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+f+`\r
--`+u+`\r
Content-Type: `+h.contentType+`\r
\r
`,m=`\r
--`+u+"--",S=Zn.getBlob(p,r,m);if(S===null)throw aN();const R={name:h.fullPath},N=xp(s,t.host,t._protocol),O="POST",I=t.maxUploadRetryTime,w=new m1(N,O,UN(t,n),I);return w.urlParams=R,w.headers=o,w.body=S.uploadData(),w.errorHandler=y1(e),w}class GN{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=ti.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=ti.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=ti.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,n,r,i,s){if(this.sent_)throw $s("cannot .send() more than once");if(br(e)&&r&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(n,e,!0),s!==void 0)for(const o in s)s.hasOwnProperty(o)&&this.xhr_.setRequestHeader(o,s[o].toString());return i!==void 0?this.xhr_.send(i):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw $s("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw $s("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw $s("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw $s("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",e)}}class KN extends GN{initXhr(){this.xhr_.responseType="text"}}function _1(){return new KN}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class di{constructor(e,n){this._service=e,n instanceof kt?this._location=n:this._location=kt.makeFromUrl(n,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,n){return new di(e,n)}get root(){const e=new kt(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return d1(this._location.path)}get storage(){return this._service}get parent(){const e=bN(this._location.path);if(e===null)return null;const n=new kt(this._location.bucket,e);return new di(this._service,n)}_throwIfRoot(e){if(this._location.path==="")throw cN(e)}}function QN(t,e,n){t._throwIfRoot("uploadBytes");const r=WN(t.storage,t._location,f1(),new Zn(e,!0),n);return t.storage.makeRequestWithTokens(r,_1).then(i=>({metadata:i,ref:t}))}function XN(t){t._throwIfRoot("getDownloadURL");const e=$N(t.storage,t._location,f1());return t.storage.makeRequestWithTokens(e,_1).then(n=>{if(n===null)throw lN();return n})}function YN(t,e){const n=DN(t._location.path,e),r=new kt(t._location.bucket,n);return new di(t.storage,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function JN(t){return/^[A-Za-z]+:\/\//.test(t)}function ZN(t,e){return new di(t,e)}function v1(t,e){if(t instanceof Ap){const n=t;if(n._bucket==null)throw oN();const r=new di(n,n._bucket);return e!=null?v1(r,e):r}else return e!==void 0?YN(t,e):t}function eb(t,e){if(e&&JN(e)){if(t instanceof Ap)return ZN(t,e);throw Td("To use ref(service, url), the first argument must be a Storage instance.")}else return v1(t,e)}function g_(t,e){const n=e==null?void 0:e[s1];return n==null?null:kt.makeFromBucketSpec(n,t)}function tb(t,e,n,r={}){t.host=`${e}:${n}`;const i=br(e);i&&(_f(`https://${t.host}/b`),vf("Storage",!0)),t._isUsingEmulator=!0,t._protocol=i?"https":"http";const{mockUserToken:s}=r;s&&(t._overrideAuthToken=typeof s=="string"?s:z0(s,t.app.options.projectId))}class Ap{constructor(e,n,r,i,s,o=!1){this.app=e,this._authProvider=n,this._appCheckProvider=r,this._url=i,this._firebaseVersion=s,this._isUsingEmulator=o,this._bucket=null,this._host=i1,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=QP,this._maxUploadRetryTime=XP,this._requests=new Set,i!=null?this._bucket=kt.makeFromBucketSpec(i,this._host):this._bucket=g_(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=kt.makeFromBucketSpec(this._url,e):this._bucket=g_(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){m_("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){m_("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const n=await e.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(yt(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new di(this,e)}_makeRequest(e,n,r,i,s=!0){if(this._deleted)return new hN(o1());{const o=TN(e,this._appId,r,i,n,this._firebaseVersion,s,this._isUsingEmulator);return this._requests.add(o),o.getPromise().then(()=>this._requests.delete(o),()=>this._requests.delete(o)),o}}async makeRequestWithTokens(e,n){const[r,i]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,n,r,i).getPromise()}}const y_="@firebase/storage",__="0.13.14";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const w1="storage";function nb(t,e,n){return t=ge(t),QN(t,e,n)}function rb(t){return t=ge(t),XN(t)}function ib(t,e){return t=ge(t),eb(t,e)}function sb(t=Tf(),e){t=ge(t);const r=Nu(t,w1).getImmediate({identifier:e}),i=j0("storage");return i&&ob(r,...i),r}function ob(t,e,n,r={}){tb(t,e,n,r)}function ab(t,{instanceIdentifier:e}){const n=t.getProvider("app").getImmediate(),r=t.getProvider("auth-internal"),i=t.getProvider("app-check-internal");return new Ap(n,r,i,e,mi)}function lb(){li(new wr(w1,ab,"PUBLIC").setMultipleInstances(!0)),on(y_,__,""),on(y_,__,"esm2017")}lb();/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ub=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),E1=(...t)=>t.filter((e,n,r)=>!!e&&e.trim()!==""&&r.indexOf(e)===n).join(" ").trim();/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var cb={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const hb=Y.forwardRef(({color:t="currentColor",size:e=24,strokeWidth:n=2,absoluteStrokeWidth:r,className:i="",children:s,iconNode:o,...l},u)=>Y.createElement("svg",{ref:u,...cb,width:e,height:e,stroke:t,strokeWidth:r?Number(n)*24/Number(e):n,className:E1("lucide",i),...l},[...o.map(([h,f])=>Y.createElement(h,f)),...Array.isArray(s)?s:[s]]));/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _e=(t,e)=>{const n=Y.forwardRef(({className:r,...i},s)=>Y.createElement(hb,{ref:s,iconNode:e,className:E1(`lucide-${ub(t)}`,r),...i}));return n.displayName=`${t}`,n};/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const db=_e("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fb=_e("ArrowUpRight",[["path",{d:"M7 7h10v10",key:"1tivn9"}],["path",{d:"M7 17 17 7",key:"1vkiza"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T1=_e("Award",[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pb=_e("Box",[["path",{d:"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",key:"hh9hay"}],["path",{d:"m3.3 7 8.7 5 8.7-5",key:"g66t2b"}],["path",{d:"M12 22V12",key:"d0xqtd"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mb=_e("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gb=_e("EyeOff",[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yb=_e("Eye",[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _b=_e("Hammer",[["path",{d:"m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9",key:"eefl8a"}],["path",{d:"m18 15 4-4",key:"16gjal"}],["path",{d:"m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5",key:"b7pghm"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vb=_e("History",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}],["path",{d:"M12 7v5l4 2",key:"1fdv2h"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wb=_e("Instagram",[["rect",{width:"20",height:"20",x:"2",y:"2",rx:"5",ry:"5",key:"2e1cvw"}],["path",{d:"M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z",key:"9exkf1"}],["line",{x1:"17.5",x2:"17.51",y1:"6.5",y2:"6.5",key:"r4j83e"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Eb=_e("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Tb=_e("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v_=_e("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ib=_e("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xb=_e("Pencil",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ab=_e("Quote",[["path",{d:"M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z",key:"rib7q0"}],["path",{d:"M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z",key:"1ymkrd"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Sb=_e("Ruler",[["path",{d:"M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z",key:"icamh8"}],["path",{d:"m14.5 12.5 2-2",key:"inckbg"}],["path",{d:"m11.5 9.5 2-2",key:"fmmyf7"}],["path",{d:"m8.5 6.5 2-2",key:"vc6u1g"}],["path",{d:"m17.5 15.5 2-2",key:"wo5hmg"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w_=_e("ShieldCheck",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kb=_e("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rb=_e("Timer",[["line",{x1:"10",x2:"14",y1:"2",y2:"2",key:"14vaq8"}],["line",{x1:"12",x2:"15",y1:"14",y2:"11",key:"17fdiu"}],["circle",{cx:"12",cy:"14",r:"8",key:"1e1u0o"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I1=_e("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Cb=_e("Upload",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pb=_e("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Nb=_e("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]),bb={apiKey:"AIzaSyCtuul_bp1r6W__c_6B37ank6Nl7Im0H8o",authDomain:"tatmadeinnormandie.firebaseapp.com",projectId:"tatmadeinnormandie",storageBucket:"tatmadeinnormandie.firebasestorage.app",messagingSenderId:"116427088828",appId:"1:116427088828:web:614ea24f006431d4d581b9",measurementId:"G-Z58ZWH97Z2"},Sp=H0(bb),eo=GP(Sp),rr=h2(Sp),Db=sb(Sp),Jr="tat-made-in-normandie",Ob=new In,Vb=new Tn,Lb=new xn,Mb=new Yi("apple.com"),jb=new Yi("microsoft.com"),bn=t=>t?typeof t.toMillis=="function"?t.toMillis():t.seconds*1e3||0:0,Fb=t=>{const e=bn(t);return e?new Date(e).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}):"..."},Ub=({onEnterMarketplace:t})=>{const[e,n]=Y.useState(0),r=["https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=2070&auto=format&fit=crop","https://images.unsplash.com/photo-1540638349517-3abd5afc5847?q=80&w=2070&auto=format&fit=crop","https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2069&auto=format&fit=crop"],i=Y.useRef(null),s=()=>{i.current&&clearInterval(i.current),i.current=setInterval(()=>{n(f=>(f+1)%r.length)},5e3)};Y.useEffect(()=>(s(),()=>{i.current&&clearInterval(i.current)}),[r.length]);const o=f=>{const p=f.currentTarget.getBoundingClientRect(),m=f.clientX-p.left,S=p.width;m>S/2?n(R=>(R+1)%r.length):n(R=>(R-1+r.length)%r.length),s()},l=[{type:"img",url:"https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=600",width:"w-[140px] md:w-[320px]"},{type:"img",url:"https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=600",width:"w-[100px] md:w-[240px]"},{type:"data",val:"50+",label:"Tables sauvées",color:"bg-blue-50/80"},{type:"img",url:"https://images.unsplash.com/photo-1540638349517-3abd5afc5847?q=80&w=2070&auto=format&fit=crop",width:"w-[150px] md:w-[380px]"},{type:"img",url:"https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=600",width:"w-[120px] md:w-[280px]"},{type:"data",val:"1.2k",label:"Heures de ponçage",color:"bg-rose-50/80"},{type:"img",url:"https://images.unsplash.com/photo-1505691938895-1758d7eaa511?q=80&w=600",width:"w-[130px] md:w-[310px]"}],u=[{type:"img",url:"https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=600",width:"w-[155px] md:w-[350px]"},{type:"data",val:"100%",label:"Origine Normandie",color:"bg-emerald-50/80"},{type:"img",url:"https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=600",width:"w-[110px] md:w-[260px]"},{type:"img",url:"https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=2070&auto=format&fit=crop",width:"w-[140px] md:w-[330px]"},{type:"data",val:"8.5",label:"Note moyenne",color:"bg-purple-50/80"},{type:"img",url:"https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=600",width:"w-[125px] md:w-[290px]"},{type:"img",url:"https://images.unsplash.com/photo-1455792244736-3ed96c3d7f7e?q=80&w=2070&auto=format&fit=crop",width:"w-[160px] md:w-[400px]"}],h=({item:f})=>f.type==="img"?y.jsx("div",{className:`inline-block h-[160px] md:h-[350px] ${f.width} rounded-2xl md:rounded-3xl bg-white shadow-lg md:shadow-xl overflow-hidden border-2 md:border-8 border-white flex-shrink-0 mx-1.5 md:mx-4 transition-transform duration-700 hover:scale-105 active:scale-95 cursor-pointer`,children:y.jsx("img",{src:f.url,className:"w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700",alt:""})}):y.jsxs("div",{className:`inline-flex flex-col justify-center px-6 md:px-12 h-[160px] md:h-[350px] mx-1.5 md:mx-4 rounded-2xl md:rounded-3xl border border-stone-100 min-w-[120px] md:min-w-[280px] shadow-sm ${f.color}`,children:[y.jsx("span",{className:"text-3xl md:text-7xl font-black text-stone-900 tracking-tighter leading-none",children:f.val}),y.jsx("span",{className:"text-[7px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-amber-600 mt-2 md:mt-4",children:f.label})]});return y.jsxs("div",{className:"animate-in fade-in duration-1000",children:[y.jsxs("section",{className:"min-h-[85vh] md:min-h-screen flex flex-col justify-center px-6 md:px-20 pt-32 pb-12 md:py-20 relative overflow-hidden",children:[y.jsxs("div",{className:"max-w-5xl z-10",children:[y.jsx("p",{className:"text-amber-600 font-bold tracking-[0.3em] uppercase text-[10px] mb-4 md:mb-6 animate-in slide-in-from-bottom-4 duration-700",children:"Atelier d'ébénisterie normand"}),y.jsxs("h1",{className:"text-5xl md:text-9xl font-black tracking-tighter text-stone-900 leading-[0.85] mb-8 md:mb-10 font-serif italic text-balance",children:["Rénovation ",y.jsx("br",{}),y.jsx("span",{className:"text-stone-300 not-italic",children:"d'ancienne table"})," ",y.jsx("br",{}),"de ferme."]}),y.jsxs("div",{className:"flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center",children:[y.jsxs("button",{onClick:t,className:"group flex items-center gap-4 bg-stone-900 text-white px-8 md:px-10 py-5 md:py-6 rounded-full font-black uppercase text-xs tracking-widest hover:bg-amber-600 transition-all shadow-2xl active:scale-95",children:["Explorer la collection ",y.jsx(db,{size:18,className:"group-hover:translate-x-2 transition-transform"})]}),y.jsx("p",{className:"text-stone-400 max-w-xs text-sm font-medium leading-relaxed italic",children:"Chaque pièce est une renaissance. Nous sauvons le patrimoine normand, un plateau après l'autre."})]})]}),y.jsxs("div",{onClick:o,className:"mt-12 md:mt-20 w-full aspect-video md:aspect-[21/9] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-stone-100 border border-stone-200 shadow-2xl relative group cursor-pointer touch-none",children:[y.jsx("div",{className:"absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors duration-700 z-10 pointer-events-none"}),y.jsx("div",{className:"relative w-full h-full flex transition-transform duration-1000 ease-in-out",style:{transform:`translateX(-${e*100}%)`},children:r.map((f,p)=>y.jsx("img",{src:f,className:"w-full h-full object-cover grayscale-[0.3] flex-shrink-0",alt:"Atelier"},p))}),y.jsx("div",{className:"absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20",children:r.map((f,p)=>y.jsx("div",{className:`h-1 rounded-full transition-all duration-500 overflow-hidden ${e===p?"w-10 md:w-12 bg-white":"w-4 md:w-6 bg-white/30"}`,children:e===p&&y.jsx("div",{className:"h-full bg-amber-500 animate-progress-bar origin-left"})},`${p}-${e}`))}),y.jsxs("div",{className:"absolute bottom-10 left-10 text-white z-20 hidden md:block",children:[y.jsx("p",{className:"text-[10px] font-black uppercase tracking-widest opacity-60",children:"En direct de l'atelier"}),y.jsx("p",{className:"text-2xl font-serif italic",children:"Artisanat authentique."})]})]})]}),y.jsx("section",{className:"py-12 md:py-32 px-6 md:px-20 bg-stone-900 text-white rounded-[2.5rem] md:rounded-[4rem] mx-6 md:mx-20 my-6 md:my-20",children:y.jsxs("div",{className:"grid md:grid-cols-2 gap-12 md:gap-20 items-center max-w-7xl mx-auto",children:[y.jsxs("div",{className:"space-y-6 md:space-y-8",children:[y.jsx("div",{className:"w-16 md:w-20 h-1 bg-amber-500"}),y.jsxs("h2",{className:"text-4xl md:text-7xl font-serif italic leading-tight",children:["Le geste, ",y.jsx("br",{})," la patience."]}),y.jsx("p",{className:"text-stone-400 text-base md:text-lg leading-relaxed font-light",children:`"Mon travail consiste à écouter ce que le bois a à dire. Une table de ferme n'est pas qu'un meuble, c'est le témoin de décennies de repas, de rires et de vie. Ma mission est de lui redonner sa noblesse sans effacer ses cicatrices."`}),y.jsxs("div",{className:"flex items-center gap-4 text-amber-500 font-black uppercase text-[9px] md:text-[10px] tracking-widest pt-4",children:[y.jsx(kb,{size:16})," 100% Fait main en Normandie"]})]}),y.jsx("div",{className:"aspect-[3/4] rounded-[2rem] md:rounded-[3rem] overflow-hidden border-[6px] md:border-[12px] border-stone-800 shadow-2xl",children:y.jsx("img",{src:"https://images.unsplash.com/photo-1455792244736-3ed96c3d7f7e?q=80&w=2070&auto=format&fit=crop",className:"w-full h-full object-cover",alt:"Artisan"})})]})}),y.jsxs("section",{className:"py-10 md:py-24 overflow-hidden bg-[#FAF9F6]",children:[y.jsxs("div",{className:"mb-8 md:mb-16 px-6 md:px-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6",children:[y.jsxs("div",{className:"space-y-1",children:[y.jsx("h3",{className:"text-3xl md:text-5xl font-black tracking-tighter text-stone-900",children:"L'Atelier en mouvement"}),y.jsx("p",{className:"text-stone-400 font-serif italic text-sm md:text-lg leading-none md:leading-normal",children:"Instants de vie et chiffres clés."})]}),y.jsx("p",{className:"text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-stone-300",children:"Continuous Feed"})]}),y.jsxs("div",{className:"space-y-4 md:space-y-12",children:[y.jsx("div",{className:"flex animate-marquee-left",children:[...l,...l].map((f,p)=>y.jsx(h,{item:f},p))}),y.jsx("div",{className:"flex animate-marquee-right",children:[...u,...u].map((f,p)=>y.jsx(h,{item:f},p))})]}),y.jsx("style",{children:`
                    @keyframes marquee-left {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    @keyframes marquee-right {
                        0% { transform: translateX(-50%); }
                        100% { transform: translateX(0); }
                    }
                    @keyframes progress-bar {
                        0% { transform: scaleX(0); }
                        100% { transform: scaleX(1); }
                    }
                    .animate-marquee-left {
                        animation: marquee-left 50s linear infinite;
                        width: max-content;
                    }
                    .animate-marquee-right {
                        animation: marquee-right 50s linear infinite;
                        width: max-content;
                    }
                    .animate-progress-bar {
                        animation: progress-bar 5000ms linear forwards;
                    }
                `})]}),y.jsxs("section",{className:"min-h-[40vh] md:min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-20 md:py-40",children:[y.jsxs("h2",{className:"text-4xl md:text-8xl font-black tracking-tighter mb-8 md:mb-10 leading-none text-stone-900",children:["Prêt pour votre ",y.jsx("br",{}),y.jsx("span",{className:"font-serif italic text-amber-600 text-stone-900",children:"pièce unique ?"})]}),y.jsx("button",{onClick:t,className:"bg-stone-900 text-white px-10 md:px-16 py-6 md:py-8 rounded-full font-black uppercase text-xs md:text-sm tracking-[0.3em] hover:bg-amber-600 transition-all shadow-2xl active:scale-95 text-white",children:"Entrer dans la Marketplace"})]})]})},zb=()=>{const t=Y.useMemo(()=>Array.from({length:50}),[]);return y.jsxs("div",{className:"fixed inset-0 pointer-events-none z-[110] overflow-hidden",children:[t.map((e,n)=>y.jsx("div",{className:"absolute w-2 h-2 rounded-full animate-fall",style:{left:`${Math.random()*100}%`,backgroundColor:["#10b981","#fbbf24","#3b82f6","#f43f5e","#8b5cf6"][Math.floor(Math.random()*5)],top:"-20px",animationDelay:`${Math.random()*4}s`,animationDuration:`${2.5+Math.random()*2}s`,opacity:.6+Math.random()*.4}},n)),y.jsx("style",{children:`
                @keyframes fall {
                    0% { transform: translateY(0) rotate(0deg); }
                    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
                }
                .animate-fall { animation-name: fall; animation-timing-function: cubic-bezier(0.4, 0, 1, 1); animation-iteration-count: infinite; }
            `})]})},x1=({endDate:t,onFinished:e})=>{const[n,r]=Y.useState(""),[i,s]=Y.useState(!1);return Y.useEffect(()=>{if(!t)return;const o=()=>{const u=bn(t)-Date.now();if(u<=0)return r("TERMINEE"),i||(s(!0),e&&e()),!0;{const h=Math.floor(u%864e5/36e5),f=Math.floor(u%36e5/6e4),p=Math.floor(u%6e4/1e3);return r(`${h}h ${f}m ${p}s`),!1}};o();const l=setInterval(()=>{o()&&clearInterval(l)},1e3);return()=>clearInterval(l)},[t,i]),y.jsxs("div",{className:`flex items-center gap-2 font-black text-[9px] uppercase tracking-widest ${i?"text-stone-400":"text-amber-600"}`,children:[y.jsx(Rb,{size:12,className:i?"":"animate-pulse"}),n]})},Bb=({item:t,user:e,onBack:n})=>{const[r,i]=Y.useState(0),[s,o]=Y.useState(!1),[l,u]=Y.useState(null),[h,f]=Y.useState([]),[p,m]=Y.useState(!1);if(!t)return null;const S=Y.useMemo(()=>t.images||[t.imageUrl],[t.images,t.imageUrl]),R=t.auctionActive&&bn(t.auctionEnd)<Date.now(),N=R&&e&&t.lastBidderId===e.uid;Y.useEffect(()=>{const I=w2(su(rr,"artifacts",Jr,"public","data","furniture",t.id,"bids"),E2("timestamp","desc"),T2(10));return AE(I,w=>f(w.docs.map(E=>({id:E.id,...E.data()}))))},[t.id]);const O=async I=>{if(!s){o(!0);try{await N2(rr,async w=>{const E=cs(rr,"artifacts",Jr,"public","data","furniture",t.id),b=await w.get(E);if(!b.exists())throw"Produit introuvable.";const M=b.data(),v=(M.currentPrice||M.startingPrice)+I;if(bn(M.auctionEnd)<Date.now())throw"Vente terminée.";let _=M.auctionEnd;bn(M.auctionEnd)-Date.now()<12e4&&(_=he.fromMillis(Date.now()+12e4)),w.update(E,{currentPrice:v,bidCount:(M.bidCount||0)+1,lastBidderId:e.uid,lastBidderName:e.displayName||"Anonyme",lastBidderEmail:e.email||"Non renseigné",lastBidderPhoto:e.photoURL||"",auctionEnd:_,lastBidAt:_d()});const T=cs(su(rr,"artifacts",Jr,"public","data","furniture",t.id,"bids"));w.set(T,{amount:v,increment:I,bidderName:e.displayName||"Anonyme",timestamp:_d()})}),u({type:"success",text:"Offre validée !"})}catch(w){u({type:"error",text:w.toString()})}finally{o(!1),setTimeout(()=>u(null),3e3)}}};return y.jsxs("div",{className:"max-w-6xl mx-auto animate-in fade-in duration-500 pb-20",children:[N&&y.jsx(zb,{}),y.jsxs("button",{onClick:n,className:"mb-8 flex items-center gap-2 text-stone-400 hover:text-stone-900 font-bold text-[10px] uppercase tracking-widest transition-colors",children:[y.jsx(mb,{size:14})," Retour collection"]}),y.jsxs("div",{className:"grid md:grid-cols-2 gap-12 lg:gap-16 text-stone-900",children:[y.jsxs("div",{className:"space-y-8",children:[y.jsxs("div",{className:"aspect-square rounded-[2.5rem] overflow-hidden bg-white border border-stone-200/60 shadow-2xl relative",children:[y.jsx("img",{src:S[r],className:"w-full h-full object-cover",alt:""}),t.auctionActive&&y.jsx("div",{className:"absolute bottom-6 left-6 bg-white/95 backdrop-blur px-4 py-2 rounded-2xl shadow-xl border border-stone-100 text-stone-900",children:y.jsx(x1,{endDate:t.auctionEnd,onFinished:()=>m(!0)})})]}),y.jsx("div",{className:"flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1",children:S.map((I,w)=>y.jsx("button",{onClick:()=>i(w),className:`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${r===w?"border-amber-500 shadow-md scale-105":"border-transparent opacity-60 hover:opacity-100"}`,children:y.jsx("img",{src:I,className:"w-full h-full object-cover",alt:""})},w))}),y.jsxs("div",{className:"p-8 rounded-[2.5rem] bg-stone-50/50 border border-stone-200/40 shadow-sm relative overflow-hidden group",children:[y.jsx(Ab,{size:32,className:"absolute -top-2 -right-2 text-stone-100 group-hover:text-amber-100 transition-colors"}),y.jsxs("div",{className:"relative z-10",children:[y.jsxs("p",{className:"text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4 flex items-center gap-2",children:[y.jsx("span",{className:"w-4 h-px bg-stone-300"})," L'histoire de la pièce"]}),y.jsxs("p",{className:"text-sm text-stone-700 leading-relaxed italic font-light font-serif",children:['"',t.description,'"']})]})]})]}),y.jsxs("div",{className:"space-y-8 px-1",children:[y.jsxs("div",{className:"space-y-3 text-stone-900",children:[y.jsx("div",{className:"flex gap-2",children:y.jsxs("span",{className:"bg-amber-100/50 text-amber-800 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-200/50",children:["Lot n°",t.id.substring(0,4)]})}),y.jsx("h2",{className:"text-4xl md:text-5xl font-black tracking-tighter text-stone-900 leading-tight",children:t.name})]}),y.jsxs("div",{className:`p-8 rounded-[3rem] border transition-all duration-700 ${N?"bg-emerald-50 border-emerald-200 shadow-xl scale-[1.02]":"bg-white border-stone-200 shadow-xl"}`,children:[y.jsxs("div",{className:"flex justify-between items-end mb-8 text-stone-900",children:[y.jsxs("div",{className:"space-y-0.5",children:[y.jsx("p",{className:"text-[9px] font-black text-stone-400 uppercase tracking-widest",children:t.auctionActive?"Offre actuelle":"Prix fixe"}),y.jsxs("p",{className:"text-5xl font-black tracking-tighter transition-all",children:[t.currentPrice||t.startingPrice," €"]})]}),t.auctionActive&&y.jsxs("div",{className:"text-right space-y-1",children:[y.jsx("p",{className:"text-[9px] font-black text-stone-400 uppercase tracking-widest",children:"Mises"}),y.jsx("p",{className:"text-2xl font-black",children:t.bidCount||0})]})]}),N?y.jsxs("div",{className:"text-center space-y-4 py-6 animate-in zoom-in-95 slide-in-from-top-4 duration-1000",children:[y.jsxs("div",{className:"relative inline-block",children:[y.jsx(T1,{size:56,className:"mx-auto text-emerald-500 animate-bounce"}),y.jsx("div",{className:"absolute -inset-2 bg-emerald-400/20 blur-xl rounded-full -z-10 animate-pulse"})]}),y.jsx("h4",{className:"text-2xl font-black uppercase tracking-tight text-emerald-700",children:"Vente remportée !"}),y.jsx("p",{className:"text-emerald-600/70 text-xs italic",children:"Félicitations. L'artisan vous contactera prochainement."})]}):t.auctionActive&&!R?y.jsxs("div",{className:"space-y-6",children:[y.jsx("div",{className:"flex items-center gap-3",children:y.jsx("p",{className:"text-[10px] font-black uppercase text-stone-400",children:t.lastBidderName?`Mise par ${t.lastBidderName}`:"Soyez le premier à miser"})}),y.jsx("div",{className:"grid grid-cols-3 gap-3",children:[10,50,100].map(I=>y.jsxs("button",{onClick:()=>O(I),disabled:s,className:"py-4 bg-stone-50 border border-stone-200 rounded-2xl font-black text-xs hover:border-stone-900 hover:bg-white transition-all active:scale-95 disabled:opacity-50 shadow-sm text-stone-900",children:["+",I,"€"]},I))}),l&&y.jsx("p",{className:`text-[10px] font-black text-center uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 ${l.type==="error"?"text-red-500":"text-emerald-600"}`,children:l.text})]}):t.auctionActive?y.jsx("div",{className:"text-center py-4 bg-stone-50 rounded-2xl border border-stone-200 text-stone-400",children:y.jsx("p",{className:"text-[10px] font-black uppercase tracking-widest",children:"Enchère clôturée"})}):y.jsx("button",{className:"w-full py-5 bg-stone-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 shadow-xl transition-all active:scale-95 text-white",children:"Acquérir cette pièce"})]}),t.auctionActive&&h.length>0&&y.jsxs("div",{className:"space-y-4",children:[y.jsxs("div",{className:"flex items-center gap-2 text-stone-400",children:[y.jsx(vb,{size:14}),y.jsx("h3",{className:"text-[10px] font-black uppercase tracking-[0.2em]",children:"Activité"})]}),y.jsx("div",{className:"space-y-2 max-h-48 md:max-h-60 overflow-y-auto pr-2 scrollbar-hide border-l-2 border-stone-100 pl-4",children:h.map((I,w)=>y.jsxs("div",{className:`flex items-center justify-between p-3 md:p-4 rounded-2xl border transition-all ${w===0?"bg-white border-amber-200 shadow-md scale-[1.02]":"bg-white/40 border-stone-100 opacity-60"}`,children:[y.jsxs("div",{className:"flex items-center gap-2 md:gap-3",children:[y.jsx("div",{className:`w-1.5 h-1.5 rounded-full ${w===0?"bg-amber-500 animate-pulse":"bg-stone-300"}`}),y.jsx("span",{className:"text-[10px] font-bold text-stone-700 truncate max-w-[80px] md:max-w-none",children:I.bidderName})]}),y.jsxs("div",{className:"flex items-center gap-3 md:gap-4 text-stone-900 flex-shrink-0 font-mono",children:[y.jsxs("span",{className:"text-[10px] font-black text-emerald-600",children:["+",I.increment||"??"," €"]}),y.jsx("span",{className:"text-[8px] font-bold text-stone-300",children:Fb(I.timestamp)})]})]},I.id))})]}),y.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[y.jsxs("div",{className:"p-5 rounded-2xl bg-stone-50/80 border border-stone-200/50 shadow-sm text-stone-900 group hover:bg-white transition-colors",children:[y.jsxs("p",{className:"text-[9px] font-black text-stone-400 uppercase flex items-center gap-2 group-hover:text-amber-600 transition-colors",children:[y.jsx(pb,{size:12})," Matières"]}),y.jsx("p",{className:"text-xs font-bold text-stone-700 mt-1",children:t.material||"Non spécifié"})]}),y.jsxs("div",{className:"p-5 rounded-2xl bg-stone-50/80 border border-stone-200/50 shadow-sm text-stone-900 group hover:bg-white transition-colors",children:[y.jsxs("p",{className:"text-[9px] font-black text-stone-400 uppercase flex items-center gap-2 group-hover:text-amber-600 transition-colors",children:[y.jsx(Sb,{size:12})," Dimensions"]}),y.jsx("p",{className:"text-xs font-bold text-stone-700 mt-1",children:t.width&&t.depth&&t.height?`${t.width} x ${t.depth} x ${t.height} cm`:t.dimensions||"Non spécifié"})]})]})]})]})]})};function $b(){const[t,e]=Y.useState(null),[n,r]=Y.useState(!1),[i,s]=Y.useState([]),[o,l]=Y.useState(null),[u,h]=Y.useState("home"),[f,p]=Y.useState(!0),[m,S]=Y.useState(!1),[R,N]=Y.useState(!1),[O,I]=Y.useState(null),[w,E]=Y.useState(!1);if(Y.useEffect(()=>{const v=AE(su(rr,"artifacts",Jr,"public","data","furniture"),T=>{s(T.docs.map(x=>({id:x.id,...x.data()})).sort((x,k)=>bn(k.createdAt)-bn(x.createdAt)))}),_=VC(eo,T=>{e(T);const x=T&&!T.isAnonymous&&T.providerData.some(C=>C.providerId==="password");r(x),new URLSearchParams(window.location.search).get("admin")==="true"?(S(!0),h(x?"admin":"login")):T||kC(eo),p(!1)});return()=>{v(),_()}},[]),f)return y.jsx("div",{className:"min-h-screen flex items-center justify-center bg-[#FAF9F6] text-stone-900",children:y.jsx("div",{className:"w-10 h-10 border-[3px] border-stone-200 border-t-stone-900 rounded-full animate-spin"})});const b=async v=>{const _=v.status==="published"?"draft":"published";try{await xE(cs(rr,"artifacts",Jr,"public","data","furniture",v.id),{status:_})}catch(T){console.error(T)}},M=async v=>{if(confirm("Supprimer définitivement ?"))try{await A2(cs(rr,"artifacts",Jr,"public","data","furniture",v))}catch(_){console.error(_)}},j=async v=>{try{await nP(eo,v),N(!1)}catch(_){console.error("Erreur login:",_)}};return y.jsxs("div",{className:"min-h-screen bg-[#FAF9F6] text-stone-900 font-sans selection:bg-amber-100 overflow-x-hidden",children:[y.jsxs("div",{className:`fixed inset-0 z-[110] transition-all duration-700 ${w?"visible":"invisible pointer-events-none"}`,children:[y.jsx("div",{className:`absolute inset-0 bg-stone-900/60 backdrop-blur-md transition-opacity duration-700 ${w?"opacity-100":"opacity-0"}`,onClick:()=>E(!1)}),y.jsxs("div",{className:`absolute right-0 top-0 bottom-0 w-full md:w-[450px] bg-white shadow-2xl transition-transform duration-700 ease-expo p-12 flex flex-col justify-between ${w?"translate-x-0":"translate-x-full"}`,children:[y.jsxs("div",{className:"space-y-20",children:[y.jsxs("div",{className:"flex justify-between items-center",children:[y.jsx("span",{className:"text-[10px] font-black uppercase tracking-[0.3em] text-stone-300",children:"Menu Navigation"}),y.jsx("button",{onClick:()=>E(!1),className:"w-12 h-12 rounded-full border border-stone-100 flex items-center justify-center hover:bg-stone-50 transition-colors",children:y.jsx(Nb,{size:20})})]}),y.jsxs("nav",{className:"flex flex-col gap-10",children:[y.jsx("button",{onClick:()=>{h("home"),E(!1),window.scrollTo(0,0)},className:"text-5xl font-black tracking-tighter hover:italic hover:text-amber-600 transition-all text-left",children:"Accueil."}),y.jsx("button",{onClick:()=>{h("gallery"),E(!1),window.scrollTo(0,0)},className:"text-5xl font-black tracking-tighter hover:italic hover:text-amber-600 transition-all text-left",children:"Marketplace."}),n&&y.jsx("button",{onClick:()=>{h("admin"),E(!1),window.scrollTo(0,0)},className:"text-5xl font-black tracking-tighter hover:italic hover:text-stone-300 transition-all text-left opacity-30",children:"Atelier Admin."})]})]}),y.jsxs("div",{className:"space-y-6 pt-10 border-t border-stone-100",children:[y.jsxs("div",{className:"flex gap-6",children:[y.jsx("a",{href:"#",className:"w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all",children:y.jsx(wb,{size:20})}),y.jsx("a",{href:"mailto:contact@tat.fr",className:"w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all",children:y.jsx(v_,{size:20})})]}),y.jsx("p",{className:"text-[10px] font-bold text-stone-300 uppercase tracking-widest",children:"Tous à Table © 2024 - Normandie"})]})]})]}),R&&y.jsx("div",{className:"fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4",children:y.jsxs("div",{className:"bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center space-y-8 animate-in zoom-in-95",children:[y.jsx(w_,{size:48,className:"mx-auto text-amber-500"}),y.jsx("h3",{className:"text-2xl font-black tracking-tight",children:"Vérification"}),y.jsx("p",{className:"text-stone-400 text-xs",children:"Identifiez-vous pour accéder à la vente."}),y.jsxs("div",{className:"space-y-3",children:[y.jsxs("button",{onClick:()=>j(Ob),className:"w-full flex items-center justify-center gap-4 bg-stone-900 text-white p-4 rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg text-white",children:[y.jsx("img",{src:"https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg",className:"w-5 h-5 bg-white rounded-full p-0.5",alt:""}),"Continuer avec Google"]}),y.jsxs("div",{className:"grid grid-cols-4 gap-3",children:[y.jsx("button",{onClick:()=>j(Vb),className:"p-4 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105 transition-all flex items-center justify-center shadow-sm",title:"Facebook",children:y.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"0",className:"fill-current",children:y.jsx("path",{d:"M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.971.956-2.971 3.594v.376h3.368l-.536 3.668h-2.832v7.98H9.101Z"})})}),y.jsx("button",{onClick:()=>j(Mb),className:"p-4 rounded-2xl bg-stone-100 text-stone-900 hover:bg-stone-200 hover:scale-105 transition-all flex items-center justify-center shadow-sm",title:"Apple",children:y.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[y.jsx("path",{d:"M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"}),y.jsx("path",{d:"M10 2c1 .5 2 2 2 5"})]})}),y.jsx("button",{onClick:()=>j(Lb),className:"p-4 rounded-2xl bg-sky-50 text-sky-500 hover:bg-sky-100 hover:scale-105 transition-all flex items-center justify-center shadow-sm",title:"Twitter/X",children:y.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"0",className:"fill-current",children:y.jsx("path",{d:"M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"})})}),y.jsx("button",{onClick:()=>j(jb),className:"p-4 rounded-2xl bg-orange-50 text-orange-600 hover:bg-orange-100 hover:scale-105 transition-all flex items-center justify-center shadow-sm",title:"Microsoft",children:y.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"0",className:"fill-current",children:y.jsx("path",{d:"M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"})})})]})]}),y.jsx("button",{onClick:()=>N(!1),className:"text-[10px] font-black uppercase text-stone-300 hover:text-stone-900 transition-colors",children:"Annuler"})]})}),y.jsxs("nav",{className:"fixed top-0 left-0 right-0 z-[100] px-4 md:px-12 py-6 md:py-8 flex justify-between items-center mix-blend-difference text-white transition-all duration-300",children:[y.jsxs("div",{className:"flex items-center gap-2 md:gap-3 cursor-pointer group",onClick:()=>{h("home"),window.scrollTo({top:0,behavior:"smooth"})},children:[y.jsx("div",{className:"bg-white text-stone-900 p-1 md:p-1.5 rounded-lg shadow-md transition-all group-hover:rotate-6",children:y.jsx(_b,{size:20,className:"w-4 h-4 md:w-5 md:h-5"})}),y.jsxs("div",{children:[y.jsx("h1",{className:"text-base md:text-lg font-black uppercase tracking-tighter leading-none",children:"Tous à Table"}),y.jsx("p",{className:"text-[7px] font-black tracking-[0.3em] uppercase mt-0.5 leading-none opacity-60",children:"Atelier Normand"})]})]}),y.jsxs("div",{className:"flex items-center gap-2 md:gap-4",children:[t&&!t.isAnonymous?y.jsxs("div",{className:"flex items-center gap-2 md:gap-4 mr-1 md:mr-2",children:[y.jsxs("div",{className:"text-right hidden md:block",children:[y.jsx("p",{className:"text-[10px] font-black uppercase tracking-widest leading-none",children:t.displayName||"Client"}),y.jsx("p",{className:"text-[7px] font-bold opacity-60 mt-0.5",children:"Connecté"})]}),y.jsx("div",{className:"w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md hover:bg-white hover:text-stone-900 transition-all",children:y.jsx(Pb,{size:14,className:"md:w-4 md:h-4"})}),y.jsx("button",{onClick:()=>{LC(eo),h("home")},className:"w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-stone-900 transition-all backdrop-blur-md border border-white/20",children:y.jsx(Tb,{size:14,className:"md:w-4 md:h-4"})})]}):!m&&y.jsxs("button",{onClick:()=>N(!0),className:"flex items-center gap-2 px-4 py-2 md:px-5 md:py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white hover:text-stone-900 transition-all text-[8px] md:text-[10px] font-black uppercase tracking-widest mr-1 md:mr-2 group",children:[y.jsx(w_,{size:12,className:"md:w-3.5 md:h-3.5 group-hover:scale-110 transition-transform"}),y.jsx("span",{children:"S'identifier"})]}),y.jsxs("button",{onClick:()=>E(!0),className:"w-8 h-8 md:w-auto md:h-auto md:px-6 md:py-3 rounded-full bg-white/10 flex items-center justify-center gap-0 md:gap-4 hover:bg-white hover:text-stone-900 transition-all backdrop-blur-md border border-white/20 group",children:[y.jsx("span",{className:"hidden md:block text-[10px] font-black uppercase tracking-widest group-hover:text-stone-900",children:"Explore"}),y.jsx(Ib,{size:20,className:"w-4 h-4 md:w-5 md:h-5 group-hover:rotate-90 transition-transform group-hover:text-stone-900"})]})]})]}),y.jsxs("main",{children:[u==="home"&&y.jsx(Ub,{onEnterMarketplace:()=>{h("gallery"),window.scrollTo(0,0)}}),u==="gallery"&&y.jsxs("div",{className:"max-w-6xl mx-auto px-4 md:px-8 py-32 animate-in fade-in duration-700",children:[y.jsxs("div",{className:"space-y-4 border-b border-stone-200/60 pb-10 mb-16",children:[y.jsx("h2",{className:"text-5xl md:text-7xl font-black tracking-tighter leading-none text-stone-900",children:"Marketplace."}),y.jsx("p",{className:"text-stone-400 font-serif italic text-lg",children:"Acquérez une pièce d'histoire."})]}),y.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12",children:i.filter(v=>v.status==="published"||n&&m).map(v=>{var _;return y.jsxs("div",{className:"group cursor-pointer space-y-6",onClick:()=>{v.auctionActive&&(t!=null&&t.isAnonymous)?N(!0):(l(v.id),h("detail"),window.scrollTo({top:0,behavior:"smooth"}))},children:[y.jsxs("div",{className:"aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-white shadow-xl relative border-[12px] border-white group-hover:shadow-2xl transition-all duration-700",children:[y.jsx("img",{src:((_=v.images)==null?void 0:_[0])||v.imageUrl,className:"w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000",alt:"",loading:"lazy"}),y.jsxs("div",{className:"absolute top-6 right-6 bg-white/95 px-4 py-2 rounded-xl shadow-lg border border-stone-100 flex flex-col items-center",children:[y.jsx("span",{className:"text-[7px] font-black text-stone-400 uppercase leading-none mb-0.5",children:v.auctionActive?"Offre":"Fixe"}),y.jsxs("p",{className:"text-sm font-black",children:[v.currentPrice||v.startingPrice," €"]})]}),v.auctionActive&&y.jsx("div",{className:"absolute bottom-6 left-6 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl shadow-md border border-stone-100",children:y.jsx(x1,{endDate:v.auctionEnd})}),n&&m&&v.status==="draft"&&y.jsx("div",{className:"absolute top-6 left-6 bg-amber-500 text-white px-2 py-0.5 rounded-md text-[7px] font-black uppercase shadow-md text-white",children:"Brouillon"})]}),y.jsxs("div",{className:"px-2 flex justify-between items-center text-stone-900",children:[y.jsxs("div",{className:"space-y-1 text-stone-900",children:[y.jsx("h3",{className:"text-2xl font-black tracking-tighter leading-none group-hover:text-amber-700 transition-colors text-stone-900",children:v.name}),y.jsx("p",{className:"text-[9px] font-bold text-stone-300 uppercase tracking-widest",children:v.material||"Artisanal"})]}),y.jsx("div",{className:"w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-stone-200 group-hover:text-stone-900 group-hover:border-stone-900 transition-all group-hover:rotate-45",children:y.jsx(fb,{size:20})})]})]},v.id)})})]}),u==="detail"&&o&&y.jsx("div",{className:"pt-32 px-6",children:y.jsx(Bb,{item:i.find(v=>v.id===o),user:t,onBack:()=>{h("gallery"),l(null)}})}),u==="login"&&m&&y.jsx(Hb,{onSuccess:()=>h("admin")}),u==="admin"&&n&&y.jsxs("div",{className:"max-w-6xl mx-auto px-4 md:px-8 py-32 space-y-16 animate-in fade-in text-stone-900",children:[y.jsxs("div",{className:"flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-200/60 pb-8 gap-4 text-stone-900",children:[y.jsx("h2",{className:"text-4xl font-black tracking-tighter text-stone-900",children:"Gestion Atelier"}),y.jsx("button",{onClick:()=>h("gallery"),className:"w-full md:w-auto text-[10px] font-black border-2 border-stone-900 px-6 py-2 rounded-xl hover:bg-stone-900 hover:text-white transition-all shadow-md text-stone-900",children:"Retour Marketplace"})]}),y.jsx(qb,{db:rr,storage:Db,appId:Jr,editData:O,onCancelEdit:()=>I(null)}),y.jsxs("div",{className:"grid gap-4 pt-10 text-stone-900",children:[y.jsx("h3",{className:"text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4 mb-2 text-stone-300",children:"Suivi des lots"}),y.jsx("div",{className:"space-y-4",children:i.map(v=>{var T;const _=v.auctionActive&&bn(v.auctionEnd)<Date.now();return y.jsxs("div",{className:`bg-white p-4 md:p-5 rounded-[2.5rem] border flex flex-col md:flex-row items-start md:items-center justify-between shadow-lg transition-all gap-4 ${_?"border-amber-200 bg-amber-50/10":"border-stone-100"}`,children:[y.jsxs("div",{className:"flex items-center gap-4 md:gap-8 w-full md:w-auto",children:[y.jsx("img",{src:((T=v.images)==null?void 0:T[0])||v.imageUrl,className:"w-16 h-20 rounded-2xl object-cover shadow-md flex-shrink-0",alt:""}),y.jsxs("div",{className:"space-y-1 flex-1 min-w-0",children:[y.jsxs("div",{className:"flex flex-wrap items-center gap-2 md:gap-4 text-stone-900",children:[y.jsx("span",{className:"text-lg md:text-xl font-black tracking-tighter leading-tight truncate text-stone-900",children:v.name}),y.jsx("span",{className:`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border ${v.status==="published"?"bg-emerald-50 text-emerald-600 border-emerald-100":"bg-amber-50 text-amber-600 border-amber-100"}`,children:v.status==="published"?"Public":"Brouillon"})]}),_&&v.lastBidderName?y.jsxs("div",{className:"flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-sm w-fit max-w-full",children:[y.jsx(T1,{size:14,className:"text-amber-500 flex-shrink-0"}),y.jsxs("div",{className:"text-[10px] min-w-0",children:[y.jsxs("span",{className:"font-black uppercase block leading-none truncate text-stone-900 text-amber-600",children:["Vainqueur : ",v.lastBidderName]}),y.jsxs("span",{className:"text-stone-400 flex items-center gap-1 font-bold truncate",children:[y.jsx(v_,{size:10,className:"flex-shrink-0"})," ",v.lastBidderEmail]})]})]}):y.jsxs("p",{className:"text-stone-400 text-[9px] font-bold uppercase tracking-widest",children:[v.startingPrice,"€ • ",v.bidCount||0," mises"]})]})]}),y.jsxs("div",{className:"flex gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-stone-50",children:[y.jsx("button",{onClick:()=>{I(v),window.scrollTo({top:0,behavior:"smooth"})},className:"w-11 h-11 md:w-12 md:h-12 rounded-full bg-stone-50 text-stone-900 flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all shadow-sm",children:y.jsx(xb,{size:20})}),y.jsx("button",{onClick:()=>b(v),className:`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${v.status==="published"?"bg-stone-50 text-stone-300":"bg-emerald-500 text-white shadow-md"}`,children:v.status==="published"?y.jsx(gb,{size:20}):y.jsx(yb,{size:20})}),y.jsx("button",{onClick:()=>M(v.id),className:"w-11 h-11 md:w-12 md:h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all",children:y.jsx(I1,{size:20})})]})]},v.id)})})]})]})]})]})}function Hb({onSuccess:t}){const[e,n]=Y.useState(""),[r,i]=Y.useState(""),[s,o]=Y.useState(""),l=async u=>{u.preventDefault();try{await bC(eo,e,r),t()}catch{o("Identifiants incorrects.")}};return y.jsxs("div",{className:"max-w-xs mx-auto py-40 text-center space-y-6 animate-in zoom-in-95 text-stone-900",children:[y.jsx("div",{className:"w-16 h-16 bg-stone-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl transition-transform hover:scale-105 hover:rotate-3",children:y.jsx(Eb,{size:32})}),y.jsxs("div",{className:"space-y-2 text-stone-900",children:[y.jsx("h2",{className:"text-3xl font-black tracking-tighter leading-tight text-stone-900",children:"Portail Maître"}),y.jsx("p",{className:"text-stone-400 text-xs italic font-serif",children:"Accès restreint à l'administration"})]}),y.jsxs("form",{onSubmit:l,className:"space-y-3",children:[y.jsx("input",{type:"email",placeholder:"Email artisan",className:"w-full p-5 rounded-2xl bg-white border border-stone-200 font-bold outline-none focus:ring-4 ring-amber-50 transition-all shadow-sm text-stone-900 text-stone-900",onChange:u=>n(u.target.value),required:!0}),y.jsx("input",{type:"password",placeholder:"Mot de passe",className:"w-full p-5 rounded-2xl bg-white border border-stone-200 font-bold outline-none focus:ring-4 ring-amber-50 transition-all shadow-sm text-stone-900 text-stone-900",onChange:u=>i(u.target.value),required:!0}),s&&y.jsx("p",{className:"text-[10px] text-red-600 font-bold bg-red-50 py-2 rounded-lg",children:s}),y.jsx("button",{type:"submit",className:"w-full py-5 bg-stone-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg hover:bg-stone-800 active:scale-95 transition-all text-white",children:"Entrer"})]})]})}function qb({db:t,storage:e,appId:n,editData:r,onCancelEdit:i}){const[s,o]=Y.useState({name:"",description:"",startingPrice:0,material:"",dimensions:"",width:"",depth:"",height:"",auctionActive:!1,durationMinutes:0}),[l,u]=Y.useState([]),[h,f]=Y.useState([]),[p,m]=Y.useState(!1),[S,R]=Y.useState(""),N=Y.useRef();Y.useEffect(()=>{if(r){const E=r.auctionEnd?Math.round((bn(r.auctionEnd)-Date.now())/6e4):0;o({name:r.name||"",description:r.description||"",startingPrice:r.startingPrice||0,material:r.material||"",dimensions:r.dimensions||"",width:r.width||"",depth:r.depth||"",height:r.height||"",auctionActive:r.auctionActive||!1,durationMinutes:E>0?E:0}),f(r.images||[r.imageUrl])}else O()},[r]);const O=()=>{o({name:"",description:"",startingPrice:0,material:"",dimensions:"",width:"",depth:"",height:"",auctionActive:!1,durationMinutes:0}),u([]),f([])},I=E=>{const b=Array.from(E.target.files);b.length>0&&(u(M=>[...M,...b]),f(M=>[...M,...b.map(j=>URL.createObjectURL(j))]))},w=async()=>{if(!s.name){R("⚠️ Nom requis");return}m(!0),R("⏳ Envoi...");try{let E=[...h.filter(M=>!M.startsWith("blob:"))];if(l.length>0)for(const M of l){const j=ib(e,`furniture/${Date.now()}_${M.name}`);await nb(j,M),E.push(await rb(j))}const b={...s,images:E,imageUrl:E[0],currentPrice:Number(s.startingPrice),startingPrice:Number(s.startingPrice),durationMinutes:Number(s.durationMinutes),auctionEnd:s.auctionActive?he.fromMillis(Date.now()+Number(s.durationMinutes)*6e4):null};r?(await xE(cs(t,"artifacts",n,"public","data","furniture",r.id),b),i()):await S2(su(t,"artifacts",n,"public","data","furniture"),{...b,status:"draft",bidCount:0,createdAt:_d()}),R("✅ Succès !"),O()}catch(E){R(`❌ Erreur: ${E.message}`)}finally{m(!1),setTimeout(()=>R(""),3e3)}};return y.jsxs("div",{className:"p-8 md:p-12 bg-white rounded-[3rem] border border-stone-200/60 shadow-2xl space-y-10 animate-in slide-in-from-top-4 text-stone-900",children:[y.jsxs("div",{className:"flex justify-between items-center border-b border-stone-100 pb-6 text-stone-900",children:[y.jsx("p",{className:"text-xs font-black uppercase tracking-widest text-stone-900",children:r?"Modification en cours":"Nouvelle création"}),r&&y.jsx("button",{onClick:i,className:"text-[10px] font-black text-red-500 uppercase hover:text-red-700 transition-colors",children:"Annuler"})]}),y.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-12 gap-12 text-stone-900",children:[y.jsxs("div",{className:"lg:col-span-4 space-y-4",children:[y.jsxs("div",{className:"grid grid-cols-2 gap-3 text-stone-900",children:[h.map((E,b)=>y.jsxs("div",{className:"aspect-square rounded-2xl overflow-hidden relative group shadow-md border border-stone-50 text-stone-900",children:[y.jsx("img",{src:E,className:"w-full h-full object-cover text-stone-900",alt:""}),y.jsx("button",{onClick:()=>{f(M=>M.filter((j,v)=>v!==b)),u(M=>M.filter((j,v)=>v!==b))},className:"absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 text-white text-white",children:y.jsx(I1,{size:20})})]},b)),y.jsx("button",{onClick:()=>!p&&N.current.click(),className:"aspect-square rounded-2xl bg-stone-50 border-2 border-dashed border-stone-200 flex flex-col items-center justify-center hover:bg-stone-100 hover:border-stone-300 transition-all text-stone-300",children:y.jsx(Cb,{size:20})})]}),y.jsx("input",{type:"file",id:"fileInput",ref:N,className:"hidden",accept:"image/*",multiple:!0,onChange:I})]}),y.jsxs("div",{className:"lg:col-span-8 space-y-6 text-stone-900",children:[y.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4 text-stone-900",children:[y.jsxs("div",{className:"space-y-1.5 text-stone-900",children:[y.jsx("label",{className:"text-[9px] font-black uppercase text-stone-400 ml-2",children:"Nom de l'ouvrage"}),y.jsx("input",{placeholder:"Table de monastère...",className:"w-full p-4 rounded-xl bg-stone-50 border-none font-bold outline-none focus:ring-4 ring-stone-100 transition-all shadow-inner text-stone-900 text-stone-900",value:s.name,onChange:E=>o({...s,name:E.target.value})})]}),y.jsxs("div",{className:"space-y-1.5 text-stone-900",children:[y.jsx("label",{className:"text-[9px] font-black uppercase text-stone-400 ml-2",children:"Prix de départ (€)"}),y.jsx("input",{type:"number",placeholder:"0",className:"w-full p-4 rounded-xl bg-stone-50 border-none font-bold outline-none focus:ring-4 ring-stone-100 transition-all shadow-inner text-stone-900 text-stone-900",value:s.startingPrice===0?"":s.startingPrice,onChange:E=>o({...s,startingPrice:E.target.value===""?0:Number(E.target.value)})})]})]}),y.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4 text-stone-900",children:[y.jsxs("div",{className:"space-y-1.5 text-stone-900",children:[y.jsx("label",{className:"text-[9px] font-black uppercase text-stone-400 ml-2",children:"Essence de bois"}),y.jsx("input",{placeholder:"Chêne, noyer...",className:"w-full p-4 rounded-xl bg-stone-50 border-none font-bold outline-none text-sm focus:ring-4 ring-stone-100 transition-all shadow-inner text-stone-900 text-stone-900",value:s.material,onChange:E=>o({...s,material:E.target.value})})]}),y.jsxs("div",{className:"space-y-1.5 text-stone-900",children:[y.jsx("label",{className:"text-[9px] font-black uppercase text-stone-400 ml-2",children:"Dimensions (L x P x H cm)"}),y.jsxs("div",{className:"grid grid-cols-3 gap-2 text-stone-900",children:[y.jsx("input",{type:"number",placeholder:"L",className:"w-full p-4 rounded-xl bg-stone-50 border-none font-bold outline-none text-xs text-center focus:ring-4 ring-stone-100 text-stone-900 text-stone-900",value:s.width,onChange:E=>o({...s,width:E.target.value})}),y.jsx("input",{type:"number",placeholder:"P",className:"w-full p-4 rounded-xl bg-stone-50 border-none font-bold outline-none text-xs text-center focus:ring-4 ring-stone-100 text-stone-900 text-stone-900",value:s.depth,onChange:E=>o({...s,depth:E.target.value})}),y.jsx("input",{type:"number",placeholder:"H",className:"w-full p-4 rounded-xl bg-stone-50 border-none font-bold outline-none text-xs text-center focus:ring-4 ring-stone-100 text-stone-900 text-stone-900",value:s.height,onChange:E=>o({...s,height:E.target.value})})]})]})]}),y.jsxs("div",{className:"bg-amber-50/60 p-6 rounded-3xl border border-amber-200/40 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm text-stone-900",children:[y.jsxs("div",{className:"flex items-center gap-4 cursor-pointer text-stone-900 text-stone-900 text-stone-900",onClick:()=>o({...s,auctionActive:!s.auctionActive}),children:[y.jsx("div",{className:`w-12 h-7 rounded-full p-1 transition-all ${s.auctionActive?"bg-amber-500 shadow-inner":"bg-stone-200 shadow-inner"}`,children:y.jsx("div",{className:`w-5 h-5 bg-white rounded-full transition-all shadow-md ${s.auctionActive?"translate-x-5":""}`})}),y.jsx("p",{className:"text-[10px] font-black uppercase tracking-widest text-stone-900",children:"Vendre aux enchères"})]}),s.auctionActive&&y.jsxs("div",{className:"flex flex-col gap-3 w-full sm:w-auto text-stone-900 text-stone-900",children:[y.jsxs("div",{className:"flex items-center gap-4 text-stone-900 text-stone-900 text-stone-900",children:[y.jsx("span",{className:"text-[9px] font-black uppercase text-amber-700",children:"Durée (min) :"}),y.jsx("input",{type:"number",className:"w-full sm:w-24 bg-white px-3 py-2 rounded-xl font-bold text-xs outline-none border border-amber-200/50 shadow-sm focus:ring-2 ring-amber-100 text-stone-900 text-stone-900",value:s.durationMinutes===0?"":s.durationMinutes,onChange:E=>o({...s,durationMinutes:E.target.value===""?0:Number(E.target.value)}),placeholder:"0"})]}),y.jsx("div",{className:"flex gap-2 overflow-x-auto pb-1 scrollbar-hide text-stone-900 text-stone-900",children:[1440,2880,4320].map(E=>y.jsxs("button",{type:"button",onClick:()=>o({...s,durationMinutes:E}),className:`px-3 py-1 rounded-lg text-[8px] font-black border transition-all whitespace-nowrap ${s.durationMinutes===E?"bg-stone-900 text-white border-stone-900 shadow-md":"bg-white text-stone-400 border-stone-100 hover:border-amber-200"}`,children:[E/60,"H"]},E))})]})]}),y.jsxs("div",{className:"space-y-1.5 text-stone-900",children:[y.jsx("label",{className:"text-[9px] font-black uppercase text-stone-400 ml-2",children:"L'histoire de l'objet"}),y.jsx("textarea",{placeholder:"Décrivez l'origine du bois, le temps de travail, les détails uniques...",className:"w-full p-5 rounded-2xl bg-stone-50 border-none font-bold text-sm h-32 resize-none outline-none focus:ring-4 ring-stone-100 transition-all shadow-inner text-stone-900 text-stone-900",value:s.description,onChange:E=>o({...s,description:E.target.value})})]})]})]}),y.jsxs("div",{className:"flex flex-col items-end gap-3 border-t border-stone-100 pt-6 text-stone-900",children:[S&&y.jsx("div",{className:`text-[9px] font-black uppercase px-4 py-2 rounded-full border shadow-sm ${S.includes("✅")?"bg-emerald-50 text-emerald-600 border-emerald-100":"bg-red-50 text-red-600 border-red-100"}`,children:S}),y.jsx("button",{onClick:w,disabled:p,className:"w-full md:w-auto px-16 py-5 bg-stone-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-stone-800 hover:translate-y-[-2px] active:translate-y-[1px] transition-all disabled:opacity-50 text-white",children:r?"Confirmer les modifications":"Publier l'ouvrage"})]})]})}const E_=document.getElementById("root");E_?ih.createRoot(E_).render(y.jsx(_T.StrictMode,{children:y.jsx($b,{})})):console.error("Erreur : L'élément avec l'id 'root' est introuvable dans index.html. Vérifie ton fichier HTML !");
