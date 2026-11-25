var Sy=Object.defineProperty;var Ny=(r,e,t)=>e in r?Sy(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var j=(r,e,t)=>Ny(r,typeof e!="symbol"?e+"":e,t);const Oy="modulepreload",Fy=function(r,e){return new URL(r,e).href},Ff={},ky=function(e,t,n){let s=Promise.resolve();if(t&&t.length>0){let o=function(B){return Promise.all(B.map(d=>Promise.resolve(d).then(C=>({status:"fulfilled",value:C}),C=>({status:"rejected",reason:C}))))};const a=document.getElementsByTagName("link"),c=document.querySelector("meta[property=csp-nonce]"),l=(c==null?void 0:c.nonce)||(c==null?void 0:c.getAttribute("nonce"));s=o(t.map(B=>{if(B=Fy(B,n),B in Ff)return;Ff[B]=!0;const d=B.endsWith(".css"),C=d?'[rel="stylesheet"]':"";if(!!n)for(let P=a.length-1;P>=0;P--){const F=a[P];if(F.href===B&&(!d||F.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${B}"]${C}`))return;const I=document.createElement("link");if(I.rel=d?"stylesheet":Oy,d||(I.as="script"),I.crossOrigin="",I.href=B,l&&I.setAttribute("nonce",l),document.head.appendChild(I),d)return new Promise((P,F)=>{I.addEventListener("load",P),I.addEventListener("error",()=>F(new Error(`Unable to preload CSS for ${B}`)))})}))}function i(o){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=o,window.dispatchEvent(a),!a.defaultPrevented)throw o}return s.then(o=>{for(const a of o||[])a.status==="rejected"&&i(a.reason);return e().catch(i)})},Ly=()=>{};var kf={};/**
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
 */const gg=function(r){const e=[];let t=0;for(let n=0;n<r.length;n++){let s=r.charCodeAt(n);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&n+1<r.length&&(r.charCodeAt(n+1)&64512)===56320?(s=65536+((s&1023)<<10)+(r.charCodeAt(++n)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},xy=function(r){const e=[];let t=0,n=0;for(;t<r.length;){const s=r[t++];if(s<128)e[n++]=String.fromCharCode(s);else if(s>191&&s<224){const i=r[t++];e[n++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=r[t++],o=r[t++],a=r[t++],c=((s&7)<<18|(i&63)<<12|(o&63)<<6|a&63)-65536;e[n++]=String.fromCharCode(55296+(c>>10)),e[n++]=String.fromCharCode(56320+(c&1023))}else{const i=r[t++],o=r[t++];e[n++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},VB={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(r,e){if(!Array.isArray(r))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let s=0;s<r.length;s+=3){const i=r[s],o=s+1<r.length,a=o?r[s+1]:0,c=s+2<r.length,l=c?r[s+2]:0,B=i>>2,d=(i&3)<<4|a>>4;let C=(a&15)<<2|l>>6,g=l&63;c||(g=64,o||(C=64)),n.push(t[B],t[d],t[C],t[g])}return n.join("")},encodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(r):this.encodeByteArray(gg(r),e)},decodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(r):xy(this.decodeStringToByteArray(r,e))},decodeStringToByteArray(r,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let s=0;s<r.length;){const i=t[r.charAt(s++)],a=s<r.length?t[r.charAt(s)]:0;++s;const l=s<r.length?t[r.charAt(s)]:64;++s;const d=s<r.length?t[r.charAt(s)]:64;if(++s,i==null||a==null||l==null||d==null)throw new Vy;const C=i<<2|a>>4;if(n.push(C),l!==64){const g=a<<4&240|l>>2;if(n.push(g),d!==64){const I=l<<6&192|d;n.push(I)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let r=0;r<this.ENCODED_VALS.length;r++)this.byteToCharMap_[r]=this.ENCODED_VALS.charAt(r),this.charToByteMap_[this.byteToCharMap_[r]]=r,this.byteToCharMapWebSafe_[r]=this.ENCODED_VALS_WEBSAFE.charAt(r),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[r]]=r,r>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(r)]=r,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(r)]=r)}}};class Vy extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const My=function(r){const e=gg(r);return VB.encodeByteArray(e,!0)},Oc=function(r){return My(r).replace(/\./g,"")},mg=function(r){try{return VB.decodeString(r,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function MB(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const Gy=()=>MB().__FIREBASE_DEFAULTS__,Uy=()=>{if(typeof process>"u"||typeof kf>"u")return;const r=kf.__FIREBASE_DEFAULTS__;if(r)return JSON.parse(r)},Hy=()=>{if(typeof document>"u")return;let r;try{r=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=r&&mg(r[1]);return e&&JSON.parse(e)},ou=()=>{try{return Ly()||Gy()||Uy()||Hy()}catch(r){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${r}`);return}},_g=r=>{var e,t;return(t=(e=ou())==null?void 0:e.emulatorHosts)==null?void 0:t[r]},qy=r=>{const e=_g(r);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const n=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),n]:[e.substring(0,t),n]},Eg=()=>{var r;return(r=ou())==null?void 0:r.config},Ig=r=>{var e;return(e=ou())==null?void 0:e[`_${r}`]};/**
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
 */class ai{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,n)=>{t?this.reject(t):this.resolve(n),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,n))}}}/**
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
 */function jy(r,e){if(r.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},n=e||"demo-project",s=r.iat||0,i=r.sub||r.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${n}`,aud:n,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}},...r};return[Oc(JSON.stringify(t)),Oc(JSON.stringify(o)),""].join(".")}/**
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
 */function rt(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Jy(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(rt())}function yg(){var e;const r=(e=ou())==null?void 0:e.forceEnvironment;if(r==="node")return!0;if(r==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Ky(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function zy(){const r=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof r=="object"&&r.id!==void 0}function Wy(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Qy(){const r=rt();return r.indexOf("MSIE ")>=0||r.indexOf("Trident/")>=0}function wg(){return!yg()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Dg(){return!yg()&&!!navigator.userAgent&&(navigator.userAgent.includes("Safari")||navigator.userAgent.includes("WebKit"))&&!navigator.userAgent.includes("Chrome")}function au(){try{return typeof indexedDB=="object"}catch{return!1}}function $y(){return new Promise((r,e)=>{try{let t=!0;const n="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(n);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(n),r(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)==null?void 0:i.message)||"")}}catch(t){e(t)}})}/**
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
 */const Yy="FirebaseError";class Qn extends Error{constructor(e,t,n){super(t),this.code=e,this.customData=n,this.name=Yy,Object.setPrototypeOf(this,Qn.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Oi.prototype.create)}}class Oi{constructor(e,t,n){this.service=e,this.serviceName=t,this.errors=n}create(e,...t){const n=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?Xy(i,n):"Error",a=`${this.serviceName}: ${o} (${s}).`;return new Qn(s,a,n)}}function Xy(r,e){try{let t=0,n="";for(;t<r.length;){const s=r.indexOf("{$",t);if(s===-1){n+=r.substring(t);break}const i=r.indexOf("}",s+2);if(i===-1){n+=r.substring(t);break}const o=r.substring(s+2,i),a=e[o];n+=r.substring(t,s)+(a!=null?String(a):`<${o}?>`),t=i+1}return n}catch{return r}}function Zy(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}function cn(r,e){if(r===e)return!0;const t=Object.keys(r),n=Object.keys(e);for(const s of t){if(!n.includes(s))return!1;const i=r[s],o=e[s];if(Lf(i)&&Lf(o)){if(!cn(i,o))return!1}else if(i!==o)return!1}for(const s of n)if(!t.includes(s))return!1;return!0}function Lf(r){return r!==null&&typeof r=="object"}/**
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
 */function Fi(r){const e=[];for(const[t,n]of Object.entries(r))Array.isArray(n)?n.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(n));return e.length?"&"+e.join("&"):""}function To(r){const e={};return r.replace(/^\?/,"").split("&").forEach(n=>{if(n){const[s,i]=n.split("=");e[decodeURIComponent(s)]=decodeURIComponent(i)}}),e}function Ao(r){const e=r.indexOf("?");if(!e)return"";const t=r.indexOf("#",e);return r.substring(e,t>0?t:void 0)}function ew(r,e){const t=new tw(r,e);return t.subscribe.bind(t)}class tw{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(n=>{this.error(n)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,n){let s;if(e===void 0&&t===void 0&&n===void 0)throw new Error("Missing Observer.");nw(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:n},s.next===void 0&&(s.next=yl),s.error===void 0&&(s.error=yl),s.complete===void 0&&(s.complete=yl);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(n){typeof console<"u"&&console.error&&console.error(n)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function nw(r,e){if(typeof r!="object"||r===null)return!1;for(const t of e)if(t in r&&typeof r[t]=="function")return!0;return!1}function yl(){}/**
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
 */const rw=1e3,sw=2,iw=14400*1e3,ow=.5;function aw(r,e=rw,t=sw){const n=e*Math.pow(t,r),s=Math.round(ow*n*(Math.random()-.5)*2);return Math.min(iw,n+s)}/**
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
 */function oe(r){return r&&r._delegate?r._delegate:r}/**
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
 */function ki(r){try{return(r.startsWith("http://")||r.startsWith("https://")?new URL(r).hostname:r).endsWith(".cloudworkstations.dev")}catch{return!1}}async function GB(r){return(await fetch(r,{credentials:"include"})).ok}class Un{constructor(e,t,n){this.name=e,this.instanceFactory=t,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const Yr="[DEFAULT]";/**
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
 */class cw{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const n=new ai;if(this.instancesDeferred.set(t,n),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&n.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),n=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(s){if(n)return null;throw s}else{if(n)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(lw(e))try{this.getOrInitializeService({instanceIdentifier:Yr})}catch{}for(const[t,n]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});n.resolve(i)}catch{}}}}clearInstance(e=Yr){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Yr){return this.instances.has(e)}getOptions(e=Yr){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:n,options:t});for(const[i,o]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(i);n===a&&o.resolve(s)}return s}onInit(e,t){const n=this.normalizeInstanceIdentifier(t),s=this.onInitCallbacks.get(n)??new Set;s.add(e),this.onInitCallbacks.set(n,s);const i=this.instances.get(n);return i&&e(i,n),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const n=this.onInitCallbacks.get(t);if(n)for(const s of n)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:uw(e),options:t}),this.instances.set(e,n),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch{}return n||null}normalizeInstanceIdentifier(e=Yr){return this.component?this.component.multipleInstances?e:Yr:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function uw(r){return r===Yr?void 0:r}function lw(r){return r.instantiationMode==="EAGER"}/**
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
 */class Bw{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new cw(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var Ce;(function(r){r[r.DEBUG=0]="DEBUG",r[r.VERBOSE=1]="VERBOSE",r[r.INFO=2]="INFO",r[r.WARN=3]="WARN",r[r.ERROR=4]="ERROR",r[r.SILENT=5]="SILENT"})(Ce||(Ce={}));const hw={debug:Ce.DEBUG,verbose:Ce.VERBOSE,info:Ce.INFO,warn:Ce.WARN,error:Ce.ERROR,silent:Ce.SILENT},dw=Ce.INFO,fw={[Ce.DEBUG]:"log",[Ce.VERBOSE]:"log",[Ce.INFO]:"info",[Ce.WARN]:"warn",[Ce.ERROR]:"error"},Cw=(r,e,...t)=>{if(e<r.logLevel)return;const n=new Date().toISOString(),s=fw[e];if(s)console[s](`[${n}]  ${r.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class cu{constructor(e){this.name=e,this._logLevel=dw,this._logHandler=Cw,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Ce))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?hw[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Ce.DEBUG,...e),this._logHandler(this,Ce.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Ce.VERBOSE,...e),this._logHandler(this,Ce.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Ce.INFO,...e),this._logHandler(this,Ce.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Ce.WARN,...e),this._logHandler(this,Ce.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Ce.ERROR,...e),this._logHandler(this,Ce.ERROR,...e)}}const pw=(r,e)=>e.some(t=>r instanceof t);let xf,Vf;function gw(){return xf||(xf=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function mw(){return Vf||(Vf=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Tg=new WeakMap,Wl=new WeakMap,Ag=new WeakMap,wl=new WeakMap,UB=new WeakMap;function _w(r){const e=new Promise((t,n)=>{const s=()=>{r.removeEventListener("success",i),r.removeEventListener("error",o)},i=()=>{t(yr(r.result)),s()},o=()=>{n(r.error),s()};r.addEventListener("success",i),r.addEventListener("error",o)});return e.then(t=>{t instanceof IDBCursor&&Tg.set(t,r)}).catch(()=>{}),UB.set(e,r),e}function Ew(r){if(Wl.has(r))return;const e=new Promise((t,n)=>{const s=()=>{r.removeEventListener("complete",i),r.removeEventListener("error",o),r.removeEventListener("abort",o)},i=()=>{t(),s()},o=()=>{n(r.error||new DOMException("AbortError","AbortError")),s()};r.addEventListener("complete",i),r.addEventListener("error",o),r.addEventListener("abort",o)});Wl.set(r,e)}let Ql={get(r,e,t){if(r instanceof IDBTransaction){if(e==="done")return Wl.get(r);if(e==="objectStoreNames")return r.objectStoreNames||Ag.get(r);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return yr(r[e])},set(r,e,t){return r[e]=t,!0},has(r,e){return r instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in r}};function Iw(r){Ql=r(Ql)}function yw(r){return r===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const n=r.call(Dl(this),e,...t);return Ag.set(n,e.sort?e.sort():[e]),yr(n)}:mw().includes(r)?function(...e){return r.apply(Dl(this),e),yr(Tg.get(this))}:function(...e){return yr(r.apply(Dl(this),e))}}function ww(r){return typeof r=="function"?yw(r):(r instanceof IDBTransaction&&Ew(r),pw(r,gw())?new Proxy(r,Ql):r)}function yr(r){if(r instanceof IDBRequest)return _w(r);if(wl.has(r))return wl.get(r);const e=ww(r);return e!==r&&(wl.set(r,e),UB.set(e,r)),e}const Dl=r=>UB.get(r);function Dw(r,e,{blocked:t,upgrade:n,blocking:s,terminated:i}={}){const o=indexedDB.open(r,e),a=yr(o);return n&&o.addEventListener("upgradeneeded",c=>{n(yr(o.result),c.oldVersion,c.newVersion,yr(o.transaction),c)}),t&&o.addEventListener("blocked",c=>t(c.oldVersion,c.newVersion,c)),a.then(c=>{i&&c.addEventListener("close",()=>i()),s&&c.addEventListener("versionchange",l=>s(l.oldVersion,l.newVersion,l))}).catch(()=>{}),a}const Tw=["get","getKey","getAll","getAllKeys","count"],Aw=["put","add","delete","clear"],Tl=new Map;function Mf(r,e){if(!(r instanceof IDBDatabase&&!(e in r)&&typeof e=="string"))return;if(Tl.get(e))return Tl.get(e);const t=e.replace(/FromIndex$/,""),n=e!==t,s=Aw.includes(t);if(!(t in(n?IDBIndex:IDBObjectStore).prototype)||!(s||Tw.includes(t)))return;const i=async function(o,...a){const c=this.transaction(o,s?"readwrite":"readonly");let l=c.store;return n&&(l=l.index(a.shift())),(await Promise.all([l[t](...a),s&&c.done]))[0]};return Tl.set(e,i),i}Iw(r=>({...r,get:(e,t,n)=>Mf(e,t)||r.get(e,t,n),has:(e,t)=>!!Mf(e,t)||r.has(e,t)}));/**
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
 */class Rw{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(vw(t)){const n=t.getImmediate();return`${n.library}/${n.version}`}else return null}).filter(t=>t).join(" ")}}function vw(r){const e=r.getComponent();return(e==null?void 0:e.type)==="VERSION"}const $l="@firebase/app",Gf="0.16.1";/**
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
 */const Hn=new cu("@firebase/app"),Pw="@firebase/app-compat",bw="@firebase/analytics-compat",Sw="@firebase/analytics",Nw="@firebase/app-check-compat",Ow="@firebase/app-check",Fw="@firebase/auth",kw="@firebase/auth-compat",Lw="@firebase/database",xw="@firebase/data-connect",Vw="@firebase/database-compat",Mw="@firebase/functions",Gw="@firebase/functions-compat",Uw="@firebase/installations",Hw="@firebase/installations-compat",qw="@firebase/messaging",jw="@firebase/messaging-compat",Jw="@firebase/performance",Kw="@firebase/performance-compat",zw="@firebase/remote-config",Ww="@firebase/remote-config-compat",Qw="@firebase/storage",$w="@firebase/storage-compat",Yw="@firebase/firestore",Xw="@firebase/ai",Zw="@firebase/firestore-compat",eD="firebase",tD="12.18.0";/**
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
 */const Fc="[DEFAULT]",nD={[$l]:"fire-core",[Pw]:"fire-core-compat",[Sw]:"fire-analytics",[bw]:"fire-analytics-compat",[Ow]:"fire-app-check",[Nw]:"fire-app-check-compat",[Fw]:"fire-auth",[kw]:"fire-auth-compat",[Lw]:"fire-rtdb",[xw]:"fire-data-connect",[Vw]:"fire-rtdb-compat",[Mw]:"fire-fn",[Gw]:"fire-fn-compat",[Uw]:"fire-iid",[Hw]:"fire-iid-compat",[qw]:"fire-fcm",[jw]:"fire-fcm-compat",[Jw]:"fire-perf",[Kw]:"fire-perf-compat",[zw]:"fire-rc",[Ww]:"fire-rc-compat",[Qw]:"fire-gcs",[$w]:"fire-gcs-compat",[Yw]:"fire-fst",[Zw]:"fire-fst-compat",[Xw]:"fire-vertex","fire-js":"fire-js",[eD]:"fire-js-all"};/**
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
 */const $o=new Map,rD=new Map,Yl=new Map;function Uf(r,e){try{r.container.addComponent(e)}catch(t){Hn.debug(`Component ${e.name} failed to register with FirebaseApp ${r.name}`,t)}}function vr(r){const e=r.name;if(Yl.has(e))return Hn.debug(`There were multiple attempts to register component ${e}.`),!1;Yl.set(e,r);for(const t of $o.values())Uf(t,r);for(const t of rD.values())Uf(t,r);return!0}function Ds(r,e){const t=r.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),r.container.getProvider(e)}function sD(r,e,t=Fc){Ds(r,e).clearInstance(t)}function Qe(r){return r==null?!1:r.settings!==void 0}/**
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
 */const iD={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},On=new Oi("app","Firebase",iD);/**
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
 */class oD{constructor(e,t,n){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new Un("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw On.create("app-deleted",{appName:this._name})}}/**
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
 */const Li=tD;function aD(r,e={}){let t=r;typeof e!="object"&&(e={name:e});const n={name:Fc,automaticDataCollectionEnabled:!0,...e},s=n.name;if(typeof s!="string"||!s)throw On.create("bad-app-name",{appName:String(s)});if(t||(t=Eg()),!t)throw On.create("no-options");const i=$o.get(s);if(i)if(cn(t,i.options)){if(cn(n,i.config))return i;throw On.create("duplicate-app",{appName:s,mismatchedParam:"config",oldValue:JSON.stringify(i.config),newValue:JSON.stringify(n)})}else throw On.create("duplicate-app",{appName:s,mismatchedParam:"options",oldValue:JSON.stringify(i.options),newValue:JSON.stringify(t)});const o=new Bw(s);for(const c of Yl.values())o.addComponent(c);const a=new oD(t,n,o);return $o.set(s,a),a}function HB(r=Fc){const e=$o.get(r);if(!e&&r===Fc&&Eg())return aD();if(!e)throw On.create("no-app",{appName:r});return e}function TF(){return Array.from($o.values())}function Vn(r,e,t){let n=nD[r]??r;t&&(n+=`-${t}`);const s=n.match(/\s|\//),i=e.match(/\s|\//);if(s||i){const o=[`Unable to register library "${n}" with version "${e}":`];s&&o.push(`library name "${n}" contains illegal characters (whitespace or "/")`),s&&i&&o.push("and"),i&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Hn.warn(o.join(" "));return}vr(new Un(`${n}-version`,()=>({library:n,version:e}),"VERSION"))}/**
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
 */const cD="firebase-heartbeat-database",uD=1,Yo="firebase-heartbeat-store";let Al=null;function Rg(){return Al||(Al=Dw(cD,uD,{upgrade:(r,e)=>{switch(e){case 0:try{r.createObjectStore(Yo)}catch(t){console.warn(t)}}}}).catch(r=>{throw On.create("idb-open",{originalErrorMessage:r.message})})),Al}async function lD(r){try{const t=(await Rg()).transaction(Yo),n=await t.objectStore(Yo).get(vg(r));return await t.done,n}catch(e){if(e instanceof Qn)Hn.warn(e.message);else{const t=On.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Hn.warn(t.message)}}}async function Hf(r,e){try{const n=(await Rg()).transaction(Yo,"readwrite");await n.objectStore(Yo).put(e,vg(r)),await n.done}catch(t){if(t instanceof Qn)Hn.warn(t.message);else{const n=On.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Hn.warn(n.message)}}}function vg(r){return`${r.name}!${r.options.appId}`}/**
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
 */const BD=1024,hD=30;class dD{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new CD(t),this._heartbeatsCachePromise=this._storage.read().then(n=>(this._heartbeatsCache=n,n))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=qf();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats.length>hD){const o=pD(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(n){Hn.warn(n)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=qf(),{heartbeatsToSend:n,unsentEntries:s}=fD(this._heartbeatsCache.heartbeats),i=Oc(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return Hn.warn(t),""}}}function qf(){return new Date().toISOString().substring(0,10)}function fD(r,e=BD){const t=[];let n=r.slice();for(const s of r){const i=t.find(o=>o.agent===s.agent);if(i){if(i.dates.push(s.date),jf(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),jf(t)>e){t.pop();break}n=n.slice(1)}return{heartbeatsToSend:t,unsentEntries:n}}class CD{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return au()?$y().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await lD(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return Hf(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return Hf(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:[...n.heartbeats,...e.heartbeats]})}else return}}function jf(r){return Oc(JSON.stringify({version:2,heartbeats:r})).length}function pD(r){if(r.length===0)return-1;let e=0,t=r[0].date;for(let n=1;n<r.length;n++)r[n].date<t&&(t=r[n].date,e=n);return e}/**
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
 */function gD(r){vr(new Un("platform-logger",e=>new Rw(e),"PRIVATE")),vr(new Un("heartbeat",e=>new dD(e),"PRIVATE")),Vn($l,Gf,r),Vn($l,Gf,"esm2020"),Vn("fire-js","")}/**
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
 */gD("");var mD="firebase",_D="12.18.0";/**
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
 */Vn(mD,_D,"app");/**
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
 */const Xl=new Map,Pg={activated:!1,tokenObservers:[]},ED={initialized:!1,enabled:!1};function nt(r){return Xl.get(r)||{...Pg}}function ID(r,e){return Xl.set(r,e),Xl.get(r)}function uu(){return ED}/**
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
 */const bg="https://content-firebaseappcheck.googleapis.com/v1",yD="exchangeRecaptchaV3Token",wD="exchangeDebugToken",Jf={RETRIAL_MIN_WAIT:30*1e3,RETRIAL_MAX_WAIT:960*1e3},DD=1440*60*1e3;/**
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
 */class TD{constructor(e,t,n,s,i){if(this.operation=e,this.retryPolicy=t,this.getWaitDuration=n,this.lowerBound=s,this.upperBound=i,this.pending=null,this.nextErrorWaitInterval=s,s>i)throw new Error("Proactive refresh lower bound greater than upper bound!")}start(){this.nextErrorWaitInterval=this.lowerBound,this.process(!0).catch(()=>{})}stop(){this.pending&&(this.pending.reject("cancelled"),this.pending=null)}isRunning(){return!!this.pending}async process(e){this.stop();try{this.pending=new ai,this.pending.promise.catch(t=>{}),await AD(this.getNextRun(e)),this.pending.resolve(),await this.pending.promise,this.pending=new ai,this.pending.promise.catch(t=>{}),await this.operation(),this.pending.resolve(),await this.pending.promise,this.process(!0).catch(()=>{})}catch(t){this.retryPolicy(t)?this.process(!1).catch(()=>{}):this.stop()}}getNextRun(e){if(e)return this.nextErrorWaitInterval=this.lowerBound,this.getWaitDuration();{const t=this.nextErrorWaitInterval;return this.nextErrorWaitInterval*=2,this.nextErrorWaitInterval>this.upperBound&&(this.nextErrorWaitInterval=this.upperBound),t}}}function AD(r){return new Promise(e=>{setTimeout(e,r)})}/**
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
 */const RD={"already-initialized":"You have already called initializeAppCheck() for FirebaseApp {$appName} with different options. To avoid this error, call initializeAppCheck() with the same options as when it was originally called. This will return the already initialized instance.","use-before-activation":"App Check is being used before initializeAppCheck() is called for FirebaseApp {$appName}. Call initializeAppCheck() before instantiating other Firebase services.","fetch-network-error":"Fetch failed to connect to a network. Check Internet connection. Original error: {$originalErrorMessage}.","fetch-parse-error":"Fetch client could not parse response. Original error: {$originalErrorMessage}.","fetch-status-error":"Fetch server returned an HTTP error status. HTTP status: {$httpStatus}.","storage-open":"Error thrown when opening storage. Original error: {$originalErrorMessage}.","storage-get":"Error thrown when reading from storage. Original error: {$originalErrorMessage}.","storage-set":"Error thrown when writing to storage. Original error: {$originalErrorMessage}.","recaptcha-error":"ReCAPTCHA error.","initial-throttle":"{$httpStatus} error. Attempts allowed again after {$time}",throttled:"Requests throttled due to previous {$httpStatus} error. Attempts allowed again after {$time}"},Ft=new Oi("appCheck","AppCheck",RD);/**
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
 */function Kf(r=!1){var e;return r?(e=self.grecaptcha)==null?void 0:e.enterprise:self.grecaptcha}function qB(r){if(!nt(r).activated)throw Ft.create("use-before-activation",{appName:r.name})}function Sg(r){const e=Math.round(r/1e3),t=Math.floor(e/(3600*24)),n=Math.floor((e-t*3600*24)/3600),s=Math.floor((e-t*3600*24-n*3600)/60),i=e-t*3600*24-n*3600-s*60;let o="";return t&&(o+=ec(t)+"d:"),n&&(o+=ec(n)+"h:"),o+=ec(s)+"m:"+ec(i)+"s",o}function ec(r){return r===0?"00":r>=10?r.toString():"0"+r}/**
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
 */async function jB({url:r,body:e},t){const n={"Content-Type":"application/json"},s=t.getImmediate({optional:!0});if(s){const d=await s.getHeartbeatsHeader();d&&(n["X-Firebase-Client"]=d)}const i={method:"POST",body:JSON.stringify(e),headers:n};let o;try{o=await fetch(r,i)}catch(d){throw Ft.create("fetch-network-error",{originalErrorMessage:d==null?void 0:d.message})}if(o.status!==200)throw Ft.create("fetch-status-error",{httpStatus:o.status});let a;try{a=await o.json()}catch(d){throw Ft.create("fetch-parse-error",{originalErrorMessage:d==null?void 0:d.message})}const c=a.ttl.match(/^([\d.]+)(s)$/);if(!c||!c[2]||isNaN(Number(c[1])))throw Ft.create("fetch-parse-error",{originalErrorMessage:`ttl field (timeToLive) is not in standard Protobuf Duration format: ${a.ttl}`});const l=Number(c[1])*1e3,B=Date.now();return{token:a.token,expireTimeMillis:B+l,issuedAtTimeMillis:B}}function vD(r,e){const{projectId:t,appId:n,apiKey:s}=r.options;return{url:`${bg}/projects/${t}/apps/${n}:${yD}?key=${s}`,body:{recaptcha_v3_token:e}}}function Ng(r,e){const{projectId:t,appId:n,apiKey:s}=r.options;return{url:`${bg}/projects/${t}/apps/${n}:${wD}?key=${s}`,body:{debug_token:e}}}/**
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
 */const PD="firebase-app-check-database",bD=1,Xo="firebase-app-check-store",Og="debug-token";let tc=null;function Fg(){return tc||(tc=new Promise((r,e)=>{try{const t=indexedDB.open(PD,bD);t.onsuccess=n=>{r(n.target.result)},t.onerror=n=>{var s;e(Ft.create("storage-open",{originalErrorMessage:(s=n.target.error)==null?void 0:s.message}))},t.onupgradeneeded=n=>{const s=n.target.result;switch(n.oldVersion){case 0:s.createObjectStore(Xo,{keyPath:"compositeKey"})}}}catch(t){e(Ft.create("storage-open",{originalErrorMessage:t==null?void 0:t.message}))}}),tc)}function SD(r){return Lg(xg(r))}function ND(r,e){return kg(xg(r),e)}function OD(r){return kg(Og,r)}function FD(){return Lg(Og)}async function kg(r,e){const n=(await Fg()).transaction(Xo,"readwrite"),i=n.objectStore(Xo).put({compositeKey:r,value:e});return new Promise((o,a)=>{i.onsuccess=c=>{o()},n.onerror=c=>{var l;a(Ft.create("storage-set",{originalErrorMessage:(l=c.target.error)==null?void 0:l.message}))}})}async function Lg(r){const t=(await Fg()).transaction(Xo,"readonly"),s=t.objectStore(Xo).get(r);return new Promise((i,o)=>{s.onsuccess=a=>{const c=a.target.result;i(c?c.value:void 0)},t.onerror=a=>{var c;o(Ft.create("storage-get",{originalErrorMessage:(c=a.target.error)==null?void 0:c.message}))}})}function xg(r){return`${r.options.appId}-${r.name}`}/**
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
 */const mr=new cu("@firebase/app-check");/**
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
 */async function kD(r){if(au()){let e;try{e=await SD(r)}catch(t){mr.warn(`Failed to read token from IndexedDB. Error: ${t}`)}return e}}function Rl(r,e){return au()?ND(r,e).catch(t=>{mr.warn(`Failed to write token to IndexedDB. Error: ${t}`)}):Promise.resolve()}async function LD(r){let e;try{e=await FD()}catch{}if(e)return e;{const t=crypto.randomUUID();let n=`To use this token for app debugging, register it with your project.

Firebase App Check debug token: ${t}

`;const s=r==null?void 0:r.options.appId,i=r==null?void 0:r.options.projectId;return i&&s?n+=`You can do so in the Firebase Console:
https://console.firebase.google.com/project/${i}/appcheck/apps?selectedAppId=${s}

Or using the Firebase CLI:
firebase appcheck:debugtokens:create ${t} --project ${i} --app ${s}

`:n+=`You will need to add it to your app's App Check settings in the Firebase Console for it to work.

`,n+=`Note: To keep your project secure, please revoke and delete this token using the
Firebase Console or the CLI (\`firebase appcheck:debugtokens:delete\`) when you finish debugging.

Warning: This debug token is a secret and should not be shared or uploaded to source code.

Debug Token Guide: https://firebase.google.com/docs/app-check/web/debug-provider
Firebase CLI install instructions: https://firebase.google.com/docs/cli
`,console.log(n),OD(t).catch(o=>mr.warn(`Failed to persist debug token to IndexedDB. Error: ${o}`)),t}}/**
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
 */function JB(){return uu().enabled}async function KB(){const r=uu();if(r.enabled&&r.token)return r.token.promise;throw Error(`
            Can't get debug token in production mode.
        `)}function xD(r){const e=MB(),t=uu();if(t.initialized=!0,typeof e.FIREBASE_APPCHECK_DEBUG_TOKEN!="string"&&e.FIREBASE_APPCHECK_DEBUG_TOKEN!==!0)return;t.enabled=!0;const n=new ai;t.token=n,typeof e.FIREBASE_APPCHECK_DEBUG_TOKEN=="string"?n.resolve(e.FIREBASE_APPCHECK_DEBUG_TOKEN):n.resolve(LD(r))}/**
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
 */const VD={error:"UNKNOWN_ERROR"};function MD(r){return VB.encodeString(JSON.stringify(r),!1)}async function Zl(r,e=!1,t=!1){const n=r.app;qB(n);const s=nt(n);let i=s.token,o;if(i&&!Xs(i)&&(s.token=void 0,i=void 0),!i){const l=await s.cachedTokenPromise;l&&(Xs(l)?i=l:await Rl(n,void 0))}if(!e&&i&&Xs(i))return{token:i.token};let a=!1;if(JB())try{const l=await KB();s.exchangeTokenPromise||(s.exchangeTokenPromise=jB(Ng(n,l),r.heartbeatServiceProvider).finally(()=>{s.exchangeTokenPromise=void 0}),a=!0);const B=await s.exchangeTokenPromise;return await Rl(n,B),s.token=B,{token:B.token}}catch(l){return l.code==="appCheck/throttled"||l.code==="appCheck/initial-throttle"?mr.warn(l.message):t&&mr.error(l),vl(l)}try{s.exchangeTokenPromise||(s.exchangeTokenPromise=s.provider.getToken().finally(()=>{s.exchangeTokenPromise=void 0}),a=!0),i=await nt(n).exchangeTokenPromise}catch(l){l.code==="appCheck/throttled"||l.code==="appCheck/initial-throttle"?mr.warn(l.message):t&&mr.error(l),o=l}let c;return i?o?Xs(i)?c={token:i.token,internalError:o}:c=vl(o):(c={token:i.token},s.token=i,await Rl(n,i)):c=vl(o),a&&Gg(n,c),c}async function GD(r){const e=r.app;qB(e);const{provider:t}=nt(e);if(JB()){const n=await KB(),s=Ng(e,n);s.body.limited_use=!0;const{token:i}=await jB(s,r.heartbeatServiceProvider);return{token:i}}else{const{token:n}=await t.getToken(!0);return{token:n}}}function Vg(r,e,t,n){const{app:s}=r,i=nt(s),o={next:t,error:n,type:e};if(i.tokenObservers=[...i.tokenObservers,o],i.token&&Xs(i.token)){const a=i.token;Promise.resolve().then(()=>{t({token:a.token}),zf(r)}).catch(()=>{})}i.cachedTokenPromise.then(()=>zf(r))}function Mg(r,e){const t=nt(r),n=t.tokenObservers.filter(s=>s.next!==e);n.length===0&&t.tokenRefresher&&t.tokenRefresher.isRunning()&&t.tokenRefresher.stop(),t.tokenObservers=n}function zf(r){const{app:e}=r,t=nt(e);let n=t.tokenRefresher;n||(n=UD(r),t.tokenRefresher=n),!n.isRunning()&&t.isTokenAutoRefreshEnabled&&n.start()}function UD(r){const{app:e}=r;return new TD(async()=>{const t=nt(e);let n;if(t.token?n=await Zl(r,!0):n=await Zl(r),n.error)throw n.error;if(n.internalError)throw n.internalError},()=>!0,()=>{const t=nt(e);if(t.token){let n=t.token.issuedAtTimeMillis+(t.token.expireTimeMillis-t.token.issuedAtTimeMillis)*.5+3e5;const s=t.token.expireTimeMillis-300*1e3;return n=Math.min(n,s),Math.max(0,n-Date.now())}else return 0},Jf.RETRIAL_MIN_WAIT,Jf.RETRIAL_MAX_WAIT)}function Gg(r,e){const t=nt(r).tokenObservers;for(const n of t)try{n.type==="EXTERNAL"&&e.error!=null?n.error(e.error):n.next(e)}catch{}}function Xs(r){return r.expireTimeMillis-Date.now()>0}function vl(r){return{token:MD(VD),error:r}}/**
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
 */class HD{constructor(e,t){this.app=e,this.heartbeatServiceProvider=t}_delete(){const{tokenObservers:e}=nt(this.app);for(const t of e)Mg(this.app,t.next);return Promise.resolve()}}function qD(r,e){return new HD(r,e)}function jD(r){return{getToken:e=>Zl(r,e),getLimitedUseToken:()=>GD(r),addTokenListener:e=>Vg(r,"INTERNAL",e),removeTokenListener:e=>Mg(r.app,e)}}const JD="@firebase/app-check",KD="0.13.1";/**
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
 */const zD="https://www.google.com/recaptcha/api.js";function WD(r,e){const t=new ai,n=nt(r);n.reCAPTCHAState={initialized:t};const s=QD(r),i=Kf(!1);return i?Wf(r,e,i,s,t):XD(()=>{const o=Kf(!1);if(!o)throw new Error("no recaptcha");Wf(r,e,o,s,t)}),t.promise}function Wf(r,e,t,n,s){t.ready(()=>{YD(r,e,t,n),s.resolve(t)})}function QD(r){const e=`fire_app_check_${r.name}`,t=document.createElement("div");return t.id=e,t.style.display="none",document.body.appendChild(t),e}async function $D(r){qB(r);const t=await nt(r).reCAPTCHAState.initialized.promise;return new Promise((n,s)=>{const i=nt(r).reCAPTCHAState;t.ready(()=>{n(t.execute(i.widgetId,{action:"fire_app_check"}))})})}function YD(r,e,t,n){const s=t.render(n,{sitekey:e,size:"invisible",callback:()=>{nt(r).reCAPTCHAState.succeeded=!0},"error-callback":()=>{nt(r).reCAPTCHAState.succeeded=!1}}),i=nt(r);i.reCAPTCHAState={...i.reCAPTCHAState,widgetId:s}}function XD(r){const e=document.createElement("script");e.src=zD,e.onload=r,document.head.appendChild(e)}/**
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
 */class Ug{constructor(e){this._siteKey=e,this._throttleData=null}async getToken(e=!1){var s,i,o;eT(this._throttleData);const t=await $D(this._app).catch(a=>{throw Ft.create("recaptcha-error")});if(!((s=nt(this._app).reCAPTCHAState)!=null&&s.succeeded))throw Ft.create("recaptcha-error");let n;try{const a=vD(this._app,t);e&&(a.body.limited_use=!0),n=await jB(a,this._heartbeatServiceProvider)}catch(a){throw(i=a.code)!=null&&i.includes("fetch-status-error")?(this._throttleData=ZD(Number((o=a.customData)==null?void 0:o.httpStatus),this._throttleData),Ft.create("initial-throttle",{time:Sg(this._throttleData.allowRequestsAfter-Date.now()),httpStatus:this._throttleData.httpStatus})):a}return this._throttleData=null,n}initialize(e){this._app=e,this._heartbeatServiceProvider=Ds(e,"heartbeat"),WD(e,this._siteKey).catch(()=>{})}isEqual(e){return e instanceof Ug?this._siteKey===e._siteKey:!1}}function ZD(r,e){if(r===404||r===403)return{backoffCount:1,allowRequestsAfter:Date.now()+DD,httpStatus:r};{const t=e?e.backoffCount:0,n=aw(t,1e3,2);return{backoffCount:t+1,allowRequestsAfter:Date.now()+n,httpStatus:r}}}function eT(r){if(r&&Date.now()-r.allowRequestsAfter<=0)throw Ft.create("throttled",{time:Sg(r.allowRequestsAfter-Date.now()),httpStatus:r.httpStatus})}/**
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
 */function AF(r=HB(),e){var s;r=oe(r);const t=Ds(r,"app-check");if(uu().initialized||xD(r),JB()&&KB().then(i=>{console.log(`Firebase App Check debug token: ${i}`)}),t.isInitialized()){const i=t.getImmediate(),o=t.getOptions();if(o&&!!o.isTokenAutoRefreshEnabled==!!e.isTokenAutoRefreshEnabled&&((s=o.provider)!=null&&s.isEqual(e.provider)))return i;throw Ft.create("already-initialized",{appName:r.name})}const n=t.initialize({options:e});return tT(r,e.provider,e.isTokenAutoRefreshEnabled),nt(r).isTokenAutoRefreshEnabled&&Vg(n,"INTERNAL",()=>{}),n}function tT(r,e,t=!1){const n=ID(r,{...Pg});n.activated=!0,n.provider=e,n.cachedTokenPromise=kD(r).then(s=>(s&&Xs(s)&&(n.token=s,Gg(r,{token:s.token})),s)),n.isTokenAutoRefreshEnabled=t&&r.automaticDataCollectionEnabled,!r.automaticDataCollectionEnabled&&t&&mr.warn("`isTokenAutoRefreshEnabled` is true but `automaticDataCollectionEnabled` was set to false during `initializeApp()`. This blocks automatic token refresh."),n.provider.initialize(r)}/**
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
 */const nT="app-check",Qf="app-check-internal";function rT(){vr(new Un(nT,r=>{const e=r.getProvider("app").getImmediate(),t=r.getProvider("heartbeat");return qD(e,t)},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((r,e,t)=>{r.getProvider(Qf).initialize()})),vr(new Un(Qf,r=>{const e=r.getProvider("app-check").getImmediate();return jD(e)},"PUBLIC").setInstantiationMode("EXPLICIT")),Vn(JD,KD)}rT();function Hg(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const sT=Hg,qg=new Oi("auth","Firebase",Hg());/**
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
 */const kc=new cu("@firebase/auth");function jg(r,...e){kc.logLevel<=Ce.WARN&&kc.warn(`Auth (${Li}): ${r}`,...e)}function _c(r,...e){kc.logLevel<=Ce.ERROR&&kc.error(`Auth (${Li}): ${r}`,...e)}/**
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
 */function tn(r,...e){throw WB(r,...e)}function vt(r,...e){return WB(r,...e)}function zB(r,e,t){const n={...sT(),[e]:t};return new Oi("auth","Firebase",n).create(e,{appName:r.name})}function Pt(r){return zB(r,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function ga(r,e,t){const n=t;if(!(e instanceof n))throw n.name!==e.constructor.name&&tn(r,"argument-error"),zB(r,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function WB(r,...e){if(typeof r!="string"){const t=e[0],n=[...e.slice(1)];return n[0]&&(n[0].appName=r.name),r._errorFactory.create(t,...n)}return qg.create(r,...e)}function $(r,e,...t){if(!r)throw WB(e,...t)}function Fn(r){const e="INTERNAL ASSERTION FAILED: "+r;throw _c(e),new Error(e)}function qn(r,e){r||Fn(e)}/**
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
 */function Zo(){var r;return typeof self<"u"&&((r=self.location)==null?void 0:r.href)||""}function QB(){return $f()==="http:"||$f()==="https:"}function $f(){var r;return typeof self<"u"&&((r=self.location)==null?void 0:r.protocol)||null}/**
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
 */function iT(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(QB()||zy()||"connection"in navigator)?navigator.onLine:!0}function oT(){if(typeof navigator>"u")return null;const r=navigator;return r.languages&&r.languages[0]||r.language||null}/**
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
 */class ma{constructor(e,t){this.shortDelay=e,this.longDelay=t,qn(t>e,"Short delay should be less than long delay!"),this.isMobile=Jy()||Wy()}get(){return iT()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function $B(r,e){qn(r.emulator,"Emulator should always be set here");const{url:t}=r.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
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
 */class Jg{static initialize(e,t,n){this.fetchImpl=e,t&&(this.headersImpl=t),n&&(this.responseImpl=n)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Fn("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Fn("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Fn("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const aT={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const cT=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],uT=new ma(3e4,6e4);function ot(r,e){return r.tenantId&&!e.tenantId?{...e,tenantId:r.tenantId}:e}async function at(r,e,t,n,s={}){return Kg(r,s,async()=>{let i={},o={};n&&(e==="GET"?o=n:i={body:JSON.stringify(n)});const a=Fi({...o,key:r.config.apiKey}).slice(1),c=await r._getAdditionalHeaders();c["Content-Type"]="application/json",r.languageCode&&(c["X-Firebase-Locale"]=r.languageCode);const l={method:e,headers:c,...i};return Ky()||(l.referrerPolicy="strict-origin-when-cross-origin"),r.emulatorConfig&&ki(r.emulatorConfig.host)&&(l.credentials="include"),Jg.fetch()(await zg(r,r.config.apiHost,t,a),l)})}async function Kg(r,e,t){r._canInitEmulator=!1;const n={...aT,...e};try{const s=new BT(r),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw Ro(r,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const a=i.ok?o.errorMessage:o.error.message,[c,l]=a.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw Ro(r,"credential-already-in-use",o);if(c==="EMAIL_EXISTS")throw Ro(r,"email-already-in-use",o);if(c==="USER_DISABLED")throw Ro(r,"user-disabled",o);const B=n[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(l)throw zB(r,B,l);tn(r,B)}}catch(s){if(s instanceof Qn)throw s;tn(r,"network-request-failed",{message:String(s)})}}async function $n(r,e,t,n,s={}){const i=await at(r,e,t,n,s);return"mfaPendingCredential"in i&&tn(r,"multi-factor-auth-required",{_serverResponse:i}),i}async function zg(r,e,t,n){const s=`${e}${t}?${n}`,i=r,o=i.config.emulator?$B(r.config,s):`${r.config.apiScheme}://${s}`;return cT.includes(t)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(o).toString():o}function lT(r){switch(r){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class BT{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,n)=>{this.timer=setTimeout(()=>n(vt(this.auth,"network-request-failed")),uT.get())})}}function Ro(r,e,t){const n={appName:r.name};t.email&&(n.email=t.email),t.phoneNumber&&(n.phoneNumber=t.phoneNumber);const s=vt(r,e,n);return s.customData._tokenResponse=t,s}/**
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
 */function Yf(r){return r!==void 0&&r.getResponse!==void 0}function Xf(r){return r!==void 0&&r.enterprise!==void 0}class Wg{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return lT(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}/**
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
 */async function hT(r){return(await at(r,"GET","/v1/recaptchaParams")).recaptchaSiteKey||""}async function Qg(r,e){return at(r,"GET","/v2/recaptchaConfig",ot(r,e))}/**
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
 */async function dT(r,e){return at(r,"POST","/v1/accounts:delete",e)}async function fT(r,e){return at(r,"POST","/v1/accounts:update",e)}async function Lc(r,e){return at(r,"POST","/v1/accounts:lookup",e)}/**
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
 */function No(r){if(r)try{const e=new Date(Number(r));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function CT(r,e=!1){const t=oe(r),n=await t.getIdToken(e),s=lu(n);$(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:s,token:n,authTime:No(Pl(s.auth_time)),issuedAtTime:No(Pl(s.iat)),expirationTime:No(Pl(s.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function Pl(r){return Number(r)*1e3}function lu(r){const[e,t,n]=r.split(".");if(e===void 0||t===void 0||n===void 0)return _c("JWT malformed, contained fewer than 3 sections"),null;try{const s=mg(t);return s?JSON.parse(s):(_c("Failed to decode base64 JWT payload"),null)}catch(s){return _c("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function Zf(r){const e=lu(r);return $(e,"internal-error"),$(typeof e.exp<"u","internal-error"),$(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function ds(r,e,t=!1){if(t)return e;try{return await e}catch(n){throw n instanceof Qn&&pT(n)&&r.auth.currentUser===r&&await r.auth.signOut(),n}}function pT({code:r}){return r==="auth/user-disabled"||r==="auth/user-token-expired"}/**
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
 */class gT{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const n=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,n)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class eB{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=No(this.lastLoginAt),this.creationTime=No(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function ea(r){var d;const e=r.auth,t=await r.getIdToken(),n=await ds(r,Lc(e,{idToken:t}));$(n==null?void 0:n.users.length,e,"internal-error");const s=n.users[0];r._notifyReloadListener(s);const i=(d=s.providerUserInfo)!=null&&d.length?Yg(s.providerUserInfo):[],o=mT(r.providerData,i),a=r.isAnonymous,c=!(r.email&&s.passwordHash)&&!(o!=null&&o.length),l=a?c:!1,B={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:o,metadata:new eB(s.createdAt,s.lastLoginAt),isAnonymous:l};Object.assign(r,B)}async function $g(r){const e=oe(r);await ea(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function mT(r,e){return[...r.filter(n=>!e.some(s=>s.providerId===n.providerId)),...e]}function Yg(r){return r.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
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
 */async function _T(r,e){const t=await Kg(r,{},async()=>{const n=Fi({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=r.config,o=await zg(r,s,"/v1/token",`key=${i}`),a=await r._getAdditionalHeaders();a["Content-Type"]="application/x-www-form-urlencoded";const c={method:"POST",headers:a,body:n};return r.emulatorConfig&&ki(r.emulatorConfig.host)&&(c.credentials="include"),Jg.fetch()(o,c)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function ET(r,e){return at(r,"POST","/v2/accounts:revokeToken",ot(r,e))}/**
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
 */class ei{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){$(e.idToken,"internal-error"),$(typeof e.idToken<"u","internal-error"),$(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Zf(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){$(e.length!==0,"internal-error");const t=Zf(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:($(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:n,refreshToken:s,expiresIn:i}=await _T(e,t);this.updateTokensAndExpiration(n,s,Number(i))}updateTokensAndExpiration(e,t,n){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+n*1e3}static fromJSON(e,t){const{refreshToken:n,accessToken:s,expirationTime:i}=t,o=new ei;return n&&($(typeof n=="string","internal-error",{appName:e}),o.refreshToken=n),s&&($(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),i&&($(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new ei,this.toJSON())}_performRefresh(){return Fn("not implemented")}}/**
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
 */function ar(r,e){$(typeof r=="string"||typeof r>"u","internal-error",{appName:e})}class sn{constructor({uid:e,auth:t,stsTokenManager:n,...s}){this.providerId="firebase",this.proactiveRefresh=new gT(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=n,this.accessToken=n.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new eB(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await ds(this,this.stsTokenManager.getToken(this.auth,e));return $(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return CT(this,e)}reload(){return $g(this)}_assign(e){this!==e&&($(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new sn({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){$(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let n=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),n=!0),t&&await ea(this),await this.auth._persistUserIfCurrent(this),n&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Qe(this.auth.app))return Promise.reject(Pt(this.auth));const e=await this.getIdToken();return await ds(this,dT(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const n=t.displayName??void 0,s=t.email??void 0,i=t.phoneNumber??void 0,o=t.photoURL??void 0,a=t.tenantId??void 0,c=t._redirectEventId??void 0,l=t.createdAt??void 0,B=t.lastLoginAt??void 0,{uid:d,emailVerified:C,isAnonymous:g,providerData:I,stsTokenManager:P}=t;$(d&&P,e,"internal-error");const F=ei.fromJSON(this.name,P);$(typeof d=="string",e,"internal-error"),ar(n,e.name),ar(s,e.name),$(typeof C=="boolean",e,"internal-error"),$(typeof g=="boolean",e,"internal-error"),ar(i,e.name),ar(o,e.name),ar(a,e.name),ar(c,e.name),ar(l,e.name),ar(B,e.name);const H=new sn({uid:d,auth:e,email:s,emailVerified:C,displayName:n,isAnonymous:g,photoURL:o,phoneNumber:i,tenantId:a,stsTokenManager:F,createdAt:l,lastLoginAt:B});return I&&Array.isArray(I)&&(H.providerData=I.map(Z=>({...Z}))),c&&(H._redirectEventId=c),H}static async _fromIdTokenResponse(e,t,n=!1){const s=new ei;s.updateFromServerResponse(t);const i=new sn({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:n});return await ea(i),i}static async _fromGetAccountInfoResponse(e,t,n){const s=t.users[0];$(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?Yg(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),a=new ei;a.updateFromIdToken(n);const c=new sn({uid:s.localId,auth:e,stsTokenManager:a,isAnonymous:o}),l={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new eB(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(c,l),c}}/**
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
 */const eC=new Map;function kn(r){qn(r instanceof Function,"Expected a class definition");let e=eC.get(r);return e?(qn(e instanceof r,"Instance stored in cache mismatched with class"),e):(e=new r,eC.set(r,e),e)}/**
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
 */class Xg{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Xg.type="NONE";const tB=Xg;/**
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
 */function Ec(r,e,t){return`firebase:${r}:${e}:${t}`}class ti{constructor(e,t,n){this.persistence=e,this.auth=t,this.userKey=n;const{config:s,name:i}=this.auth;this.fullUserKey=Ec(this.userKey,s.apiKey,i),this.fullPersistenceKey=Ec("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await Lc(this.auth,{idToken:e}).catch(()=>{});return t?sn._fromGetAccountInfoResponse(this.auth,t,e):null}return sn._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,n="authUser"){if(!t.length)return new ti(kn(tB),e,n);const s=(await Promise.all(t.map(async l=>{if(await l._isAvailable())return l}))).filter(l=>l);let i=s[0]||kn(tB);const o=Ec(n,e.config.apiKey,e.name);let a=null;for(const l of t)try{const B=await l._get(o);if(B){let d;if(typeof B=="string"){const C=await Lc(e,{idToken:B}).catch(()=>{});if(!C)break;d=await sn._fromGetAccountInfoResponse(e,C,B)}else d=sn._fromJSON(e,B);l!==i&&(a=d),i=l;break}}catch{}const c=s.filter(l=>l._shouldAllowMigration);return!i._shouldAllowMigration||!c.length?new ti(i,e,n):(i=c[0],a&&await i._set(o,a.toJSON()),await Promise.all(t.map(async l=>{if(l!==i)try{await l._remove(o)}catch{}})),new ti(i,e,n))}}/**
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
 */function tC(r){const e=r.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(nm(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Zg(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(sm(e))return"Blackberry";if(im(e))return"Webos";if(em(e))return"Safari";if((e.includes("chrome/")||tm(e))&&!e.includes("edge/"))return"Chrome";if(rm(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,n=r.match(t);if((n==null?void 0:n.length)===2)return n[1]}return"Other"}function Zg(r=rt()){return/firefox\//i.test(r)}function em(r=rt()){const e=r.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function tm(r=rt()){return/crios\//i.test(r)}function nm(r=rt()){return/iemobile/i.test(r)}function rm(r=rt()){return/android/i.test(r)}function sm(r=rt()){return/blackberry/i.test(r)}function im(r=rt()){return/webos/i.test(r)}function YB(r=rt()){return/iphone|ipad|ipod/i.test(r)||/macintosh/i.test(r)&&/mobile/i.test(r)}function IT(r=rt()){var e;return YB(r)&&!!((e=window.navigator)!=null&&e.standalone)}function yT(){return Qy()&&document.documentMode===10}function om(r=rt()){return YB(r)||rm(r)||im(r)||sm(r)||/windows phone/i.test(r)||nm(r)}/**
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
 */function am(r,e=[]){let t;switch(r){case"Browser":t=tC(rt());break;case"Worker":t=`${tC(rt())}-${r}`;break;default:t=r}const n=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${Li}/${n}`}/**
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
 */class wT{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const n=i=>new Promise((o,a)=>{try{const c=e(i);o(c)}catch(c){a(c)}});n.onAbort=t,this.queue.push(n);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const n of this.queue)await n(e),n.onAbort&&t.push(n.onAbort)}catch(n){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:n==null?void 0:n.message})}}}/**
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
 */async function DT(r,e={}){return at(r,"GET","/v2/passwordPolicy",ot(r,e))}/**
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
 */const TT=6;class AT{constructor(e){var n;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??TT,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((n=e.allowedNonAlphanumericCharacters)==null?void 0:n.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const n=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;n&&(t.meetsMinPasswordLength=e.length>=n),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let n;for(let s=0;s<e.length;s++)n=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,n>="a"&&n<="z",n>="A"&&n<="Z",n>="0"&&n<="9",this.allowedNonAlphanumericCharacters.includes(n))}updatePasswordCharacterOptionsStatuses(e,t,n,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=n)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
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
 */class RT{constructor(e,t,n,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=n,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new nC(this),this.idTokenSubscription=new nC(this),this.beforeStateQueue=new wT(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=qg,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=kn(t)),this._initializationPromise=this.queue(async()=>{var n,s,i;if(!this._deleted&&(this.persistenceManager=await ti.create(this,e),(n=this._resolvePersistenceManagerAvailable)==null||n.call(this),!this._deleted)){if((s=this._popupRedirectResolver)!=null&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((i=this.currentUser)==null?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Lc(this,{idToken:e}),n=await sn._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(n)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var i;if(Qe(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(a=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(a,a))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let n=t,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(i=this.redirectUser)==null?void 0:i._redirectEventId,a=n==null?void 0:n._redirectEventId,c=await this.tryRedirectSignIn(e);(!o||o===a)&&(c!=null&&c.user)&&(n=c.user,s=!0)}if(!n)return this.directlySetCurrentUser(null);if(!n._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(n)}catch(o){n=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return n?this.reloadAndSetCurrentUserOrClear(n):this.directlySetCurrentUser(null)}return $(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===n._redirectEventId?this.directlySetCurrentUser(n):this.reloadAndSetCurrentUserOrClear(n)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await ea(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=oT()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Qe(this.app))return Promise.reject(Pt(this));const t=e?oe(e):null;return t&&$(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&$(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Qe(this.app)?Promise.reject(Pt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Qe(this.app)?Promise.reject(Pt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(kn(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await DT(this),t=new AT(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Oi("auth","Firebase",e())}onAuthStateChanged(e,t,n){return this.registerStateListener(this.authStateSubscription,e,t,n)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,n){return this.registerStateListener(this.idTokenSubscription,e,t,n)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const n=this.onAuthStateChanged(()=>{n(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),n={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(n.tenantId=this.tenantId),await ET(this,n)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const n=await this.getOrInitRedirectPersistenceManager(t);return e===null?n.removeCurrentUser():n.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&kn(e)||this._popupRedirectResolver;$(t,this,"argument-error"),this.redirectPersistenceManager=await ti.create(this,[kn(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,n;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((n=this.redirectUser)==null?void 0:n._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,n,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let o=!1;const a=this._isInitialized?Promise.resolve():this._initializationPromise;if($(a,this,"internal-error"),a.then(()=>{o||i(this.currentUser)}),typeof t=="function"){const c=e.addObserver(t,n,s);return()=>{o=!0,c()}}else{const c=e.addObserver(t);return()=>{o=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return $(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=am(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var s;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((s=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:s.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const n=await this._getAppCheckToken();return n&&(e["X-Firebase-AppCheck"]=n),e}async _getAppCheckToken(){var t;if(Qe(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&jg(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function ft(r){return oe(r)}class nC{constructor(e){this.auth=e,this.observer=null,this.addObserver=ew(t=>this.observer=t)}get next(){return $(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let _a={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function vT(r){_a=r}function XB(r){return _a.loadJS(r)}function PT(){return _a.recaptchaV2Script}function bT(){return _a.recaptchaEnterpriseScript}function ST(){return _a.gapiScript}function cm(r){return`__${r}${Math.floor(Math.random()*1e6)}`}/**
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
 */const NT=500,OT=6e4,nc=1e12;class FT{constructor(e){this.auth=e,this.counter=nc,this._widgets=new Map}render(e,t){const n=this.counter;return this._widgets.set(n,new xT(e,this.auth.name,t||{})),this.counter++,n}reset(e){var n;const t=e||nc;(n=this._widgets.get(t))==null||n.delete(),this._widgets.delete(t)}getResponse(e){var n;const t=e||nc;return((n=this._widgets.get(t))==null?void 0:n.getResponse())||""}async execute(e){var n;const t=e||nc;return(n=this._widgets.get(t))==null||n.execute(),""}}class kT{constructor(){this.enterprise=new LT}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class LT{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class xT{constructor(e,t,n){this.params=n,this.timerId=null,this.deleted=!1,this.responseToken=null,this.clickHandler=()=>{this.execute()};const s=typeof e=="string"?document.getElementById(e):e;$(s,"argument-error",{appName:t}),this.container=s,this.isVisible=this.params.size!=="invisible",this.isVisible?this.execute():this.container.addEventListener("click",this.clickHandler)}getResponse(){return this.checkIfDeleted(),this.responseToken}delete(){this.checkIfDeleted(),this.deleted=!0,this.timerId&&(clearTimeout(this.timerId),this.timerId=null),this.container.removeEventListener("click",this.clickHandler)}execute(){this.checkIfDeleted(),!this.timerId&&(this.timerId=window.setTimeout(()=>{this.responseToken=VT(50);const{callback:e,"expired-callback":t}=this.params;if(e)try{e(this.responseToken)}catch{}this.timerId=window.setTimeout(()=>{if(this.timerId=null,this.responseToken=null,t)try{t()}catch{}this.isVisible&&this.execute()},OT)},NT))}checkIfDeleted(){if(this.deleted)throw new Error("reCAPTCHA mock was already deleted!")}}function VT(r){const e=[],t="1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";for(let n=0;n<r;n++)e.push(t.charAt(Math.floor(Math.random()*t.length)));return e.join("")}/**
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
 */const MT="recaptcha-enterprise",Oo="NO_RECAPTCHA",rC="onFirebaseAuthREInstanceReady";class bn{constructor(e){this.type=MT,this.auth=ft(e)}async verify(e="verify",t=!1){async function n(i){if(!t){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(o,a)=>{Qg(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(c=>{if(c.recaptchaKey===void 0)a(new Error("recaptcha Enterprise site key undefined"));else{const l=new Wg(c);return i.tenantId==null?i._agentRecaptchaConfig=l:i._tenantRecaptchaConfigs[i.tenantId]=l,o(l.siteKey)}}).catch(c=>{a(c)})})}function s(i,o,a){const c=window.grecaptcha;Xf(c)?c.enterprise.ready(()=>{c.enterprise.execute(i,{action:e}).then(l=>{o(l)}).catch(()=>{o(Oo)})}):a(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new kT().execute("siteKey",{action:"verify"}):new Promise((i,o)=>{n(this.auth).then(async a=>{if(!t&&Xf(window.grecaptcha)&&bn.scriptInjectionDeferred)await bn.scriptInjectionDeferred.promise,s(a,i,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let c=bT();c.length!==0&&(c+=a+`&onload=${rC}`),bn.scriptInjectionDeferred=new ai,window[rC]=()=>{var l;(l=bn.scriptInjectionDeferred)==null||l.resolve()},XB(c).then(()=>{var l;return(l=bn.scriptInjectionDeferred)==null?void 0:l.promise}).then(()=>{s(a,i,o)}).catch(l=>{o(l)})}}).catch(a=>{o(a)})})}}bn.scriptInjectionDeferred=null;async function mo(r,e,t,n=!1,s=!1){const i=new bn(r);let o;if(s)o=Oo;else try{o=await i.verify(t)}catch{o=await i.verify(t,!0)}const a={...e};if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in a){const c=a.phoneEnrollmentInfo.phoneNumber,l=a.phoneEnrollmentInfo.recaptchaToken;Object.assign(a,{phoneEnrollmentInfo:{phoneNumber:c,recaptchaToken:l,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in a){const c=a.phoneSignInInfo.recaptchaToken;Object.assign(a,{phoneSignInInfo:{recaptchaToken:c,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return a}return n?Object.assign(a,{captchaResp:o}):Object.assign(a,{captchaResponse:o}),Object.assign(a,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(a,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),a}async function wr(r,e,t,n,s){var i,o;if(s==="EMAIL_PASSWORD_PROVIDER")if((i=r._getRecaptchaConfig())!=null&&i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const a=await mo(r,e,t,t==="getOobCode");return n(r,a)}else return n(r,e).catch(async a=>{if(a.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const c=await mo(r,e,t,t==="getOobCode");return n(r,c)}else return Promise.reject(a)});else if(s==="PHONE_PROVIDER")if((o=r._getRecaptchaConfig())!=null&&o.isProviderEnabled("PHONE_PROVIDER")){const a=await mo(r,e,t);return n(r,a).catch(async c=>{var l;if(((l=r._getRecaptchaConfig())==null?void 0:l.getProviderEnforcementState("PHONE_PROVIDER"))==="AUDIT"&&(c.code==="auth/missing-recaptcha-token"||c.code==="auth/invalid-app-credential")){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${t} flow.`);const B=await mo(r,e,t,!1,!0);return n(r,B)}return Promise.reject(c)})}else{const a=await mo(r,e,t,!1,!0);return n(r,a)}else return Promise.reject(s+" provider is not supported.")}async function GT(r){const e=ft(r),t=await Qg(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),n=new Wg(t);e.tenantId==null?e._agentRecaptchaConfig=n:e._tenantRecaptchaConfigs[e.tenantId]=n,n.isAnyProviderEnabled()&&new bn(e).verify()}/**
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
 */function UT(r,e){const t=Ds(r,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(cn(i,e??{}))return s;tn(s,"already-initialized")}return t.initialize({options:e})}function HT(r,e){const t=(e==null?void 0:e.persistence)||[],n=(Array.isArray(t)?t:[t]).map(kn);e!=null&&e.errorMap&&r._updateErrorMap(e.errorMap),r._initializeWithPersistence(n,e==null?void 0:e.popupRedirectResolver)}function nB(r,e,t){const n=ft(r);$(/^https?:\/\//.test(e),n,"invalid-emulator-scheme");const s=!1,i=um(e),{host:o,port:a}=qT(e),c=a===null?"":`:${a}`,l={url:`${i}//${o}${c}/`},B=Object.freeze({host:o,port:a,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!n._canInitEmulator){$(n.config.emulator&&n.emulatorConfig,n,"emulator-config-failed"),$(cn(l,n.config.emulator)&&cn(B,n.emulatorConfig),n,"emulator-config-failed");return}n.config.emulator=l,n.emulatorConfig=B,n.settings.appVerificationDisabledForTesting=!0,ki(o)?GB(`${i}//${o}${c}`):jT()}function um(r){const e=r.indexOf(":");return e<0?"":r.substr(0,e+1)}function qT(r){const e=um(r),t=/(\/\/)?([^?#/]+)/.exec(r.substr(e.length));if(!t)return{host:"",port:null};const n=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(n);if(s){const i=s[1];return{host:i,port:sC(n.substr(i.length+1))}}else{const[i,o]=n.split(":");return{host:i,port:sC(o)}}}function sC(r){if(!r)return null;const e=Number(r);return isNaN(e)?null:e}function jT(){function r(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",r):r())}/**
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
 */class Bu{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Fn("not implemented")}_getIdTokenResponse(e){return Fn("not implemented")}_linkToIdToken(e,t){return Fn("not implemented")}_getReauthenticationResolver(e){return Fn("not implemented")}}/**
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
 */async function JT(r,e){return at(r,"POST","/v1/accounts:resetPassword",ot(r,e))}async function KT(r,e){return at(r,"POST","/v1/accounts:update",e)}async function zT(r,e){return at(r,"POST","/v1/accounts:signUp",e)}async function WT(r,e){return at(r,"POST","/v1/accounts:update",ot(r,e))}/**
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
 */async function QT(r,e){return $n(r,"POST","/v1/accounts:signInWithPassword",ot(r,e))}async function hu(r,e){return at(r,"POST","/v1/accounts:sendOobCode",ot(r,e))}async function $T(r,e){return hu(r,e)}async function YT(r,e){return hu(r,e)}async function XT(r,e){return hu(r,e)}async function ZT(r,e){return hu(r,e)}/**
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
 */async function eA(r,e){return $n(r,"POST","/v1/accounts:signInWithEmailLink",ot(r,e))}async function tA(r,e){return $n(r,"POST","/v1/accounts:signInWithEmailLink",ot(r,e))}/**
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
 */class ta extends Bu{constructor(e,t,n,s=null){super("password",n),this._email=e,this._password=t,this._tenantId=s}static _fromEmailAndPassword(e,t){return new ta(e,t,"password")}static _fromEmailAndCode(e,t,n=null){return new ta(e,t,"emailLink",n)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return wr(e,t,"signInWithPassword",QT,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return eA(e,{email:this._email,oobCode:this._password});default:tn(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const n={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return wr(e,n,"signUpPassword",zT,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return tA(e,{idToken:t,email:this._email,oobCode:this._password});default:tn(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
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
 */async function ni(r,e){return $n(r,"POST","/v1/accounts:signInWithIdp",ot(r,e))}/**
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
 */const nA="http://localhost";class wn extends Bu{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new wn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):tn("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:n,signInMethod:s,...i}=t;if(!n||!s)return null;const o=new wn(n,s);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return ni(e,t)}_linkToIdToken(e,t){const n=this.buildRequest();return n.idToken=t,ni(e,n)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,ni(e,t)}buildRequest(){const e={requestUri:nA,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=Fi(t)}return e}}/**
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
 */async function iC(r,e){return at(r,"POST","/v1/accounts:sendVerificationCode",ot(r,e))}async function rA(r,e){return $n(r,"POST","/v1/accounts:signInWithPhoneNumber",ot(r,e))}async function sA(r,e){const t=await $n(r,"POST","/v1/accounts:signInWithPhoneNumber",ot(r,e));if(t.temporaryProof)throw Ro(r,"account-exists-with-different-credential",t);return t}const iA={USER_NOT_FOUND:"user-not-found"};async function oA(r,e){const t={...e,operation:"REAUTH"};return $n(r,"POST","/v1/accounts:signInWithPhoneNumber",ot(r,t),iA)}/**
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
 */class Fo extends Bu{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,t){return new Fo({verificationId:e,verificationCode:t})}static _fromTokenResponse(e,t){return new Fo({phoneNumber:e,temporaryProof:t})}_getIdTokenResponse(e){return rA(e,this._makeVerificationRequest())}_linkToIdToken(e,t){return sA(e,{idToken:t,...this._makeVerificationRequest()})}_getReauthenticationResolver(e){return oA(e,this._makeVerificationRequest())}_makeVerificationRequest(){const{temporaryProof:e,phoneNumber:t,verificationId:n,verificationCode:s}=this.params;return e&&t?{temporaryProof:e,phoneNumber:t}:{sessionInfo:n,code:s}}toJSON(){const e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));const{verificationId:t,verificationCode:n,phoneNumber:s,temporaryProof:i}=e;return!n&&!t&&!s&&!i?null:new Fo({verificationId:t,verificationCode:n,phoneNumber:s,temporaryProof:i})}}/**
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
 */function aA(r){switch(r){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function cA(r){const e=To(Ao(r)).link,t=e?To(Ao(e)).deep_link_id:null,n=To(Ao(r)).deep_link_id;return(n?To(Ao(n)).link:null)||n||t||e||r}class du{constructor(e){const t=To(Ao(e)),n=t.apiKey??null,s=t.oobCode??null,i=aA(t.mode??null);$(n&&s&&i,"argument-error"),this.apiKey=n,this.operation=i,this.code=s,this.continueUrl=t.continueUrl??null,this.languageCode=t.lang??null,this.tenantId=t.tenantId??null}static parseLink(e){const t=cA(e);try{return new du(t)}catch{return null}}}/**
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
 */class jn{constructor(){this.providerId=jn.PROVIDER_ID}static credential(e,t){return ta._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const n=du.parseLink(t);return $(n,"argument-error"),ta._fromEmailAndCode(e,n.code,n.tenantId)}}jn.PROVIDER_ID="password";jn.EMAIL_PASSWORD_SIGN_IN_METHOD="password";jn.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
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
 */class Ts{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class xi extends Ts{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}class He extends xi{static credentialFromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;return $("providerId"in t&&"signInMethod"in t,"argument-error"),wn._fromParams(t)}credential(e){return this._credential({...e,nonce:e.rawNonce})}_credential(e){return $(e.idToken||e.accessToken,"argument-error"),wn._fromParams({...e,providerId:this.providerId,signInMethod:this.providerId})}static credentialFromResult(e){return He.oauthCredentialFromTaggedObject(e)}static credentialFromError(e){return He.oauthCredentialFromTaggedObject(e.customData||{})}static oauthCredentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:n,oauthTokenSecret:s,pendingToken:i,nonce:o,providerId:a}=e;if(!n&&!s&&!t&&!i||!a)return null;try{return new He(a)._credential({idToken:t,accessToken:n,nonce:o,pendingToken:i})}catch{return null}}}/**
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
 */class $t extends xi{constructor(){super("facebook.com")}static credential(e){return wn._fromParams({providerId:$t.PROVIDER_ID,signInMethod:$t.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return $t.credentialFromTaggedObject(e)}static credentialFromError(e){return $t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return $t.credential(e.oauthAccessToken)}catch{return null}}}$t.FACEBOOK_SIGN_IN_METHOD="facebook.com";$t.PROVIDER_ID="facebook.com";/**
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
 */class Yt extends xi{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return wn._fromParams({providerId:Yt.PROVIDER_ID,signInMethod:Yt.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return Yt.credentialFromTaggedObject(e)}static credentialFromError(e){return Yt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:n}=e;if(!t&&!n)return null;try{return Yt.credential(t,n)}catch{return null}}}Yt.GOOGLE_SIGN_IN_METHOD="google.com";Yt.PROVIDER_ID="google.com";/**
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
 */class Xt extends xi{constructor(){super("github.com")}static credential(e){return wn._fromParams({providerId:Xt.PROVIDER_ID,signInMethod:Xt.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Xt.credentialFromTaggedObject(e)}static credentialFromError(e){return Xt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Xt.credential(e.oauthAccessToken)}catch{return null}}}Xt.GITHUB_SIGN_IN_METHOD="github.com";Xt.PROVIDER_ID="github.com";/**
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
 */class Zt extends xi{constructor(){super("twitter.com")}static credential(e,t){return wn._fromParams({providerId:Zt.PROVIDER_ID,signInMethod:Zt.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return Zt.credentialFromTaggedObject(e)}static credentialFromError(e){return Zt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:n}=e;if(!t||!n)return null;try{return Zt.credential(t,n)}catch{return null}}}Zt.TWITTER_SIGN_IN_METHOD="twitter.com";Zt.PROVIDER_ID="twitter.com";/**
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
 */async function lm(r,e){return $n(r,"POST","/v1/accounts:signUp",ot(r,e))}/**
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
 */class Dn{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,n,s=!1){const i=await sn._fromIdTokenResponse(e,n,s),o=oC(n);return new Dn({user:i,providerId:o,_tokenResponse:n,operationType:t})}static async _forOperation(e,t,n){await e._updateTokensIfNecessary(n,!0);const s=oC(n);return new Dn({user:e,providerId:s,_tokenResponse:n,operationType:t})}}function oC(r){return r.providerId?r.providerId:"phoneNumber"in r?"phone":null}/**
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
 */async function uA(r){var s;if(Qe(r.app))return Promise.reject(Pt(r));const e=ft(r);if(await e._initializationPromise,(s=e.currentUser)!=null&&s.isAnonymous)return new Dn({user:e.currentUser,providerId:null,operationType:"signIn"});const t=await lm(e,{returnSecureToken:!0}),n=await Dn._fromIdTokenResponse(e,"signIn",t,!0);return await e._updateCurrentUser(n.user),n}/**
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
 */class xc extends Qn{constructor(e,t,n,s){super(t.code,t.message),this.operationType=n,this.user=s,Object.setPrototypeOf(this,xc.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:n}}static _fromErrorAndOperation(e,t,n,s){return new xc(e,t,n,s)}}function Bm(r,e,t,n){return(e==="reauthenticate"?t._getReauthenticationResolver(r):t._getIdTokenResponse(r)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?xc._fromErrorAndOperation(r,i,e,n):i})}/**
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
 */function hm(r){return new Set(r.map(({providerId:e})=>e).filter(e=>!!e))}/**
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
 */async function lA(r,e){const t=oe(r);await fu(!0,t,e);const{providerUserInfo:n}=await fT(t.auth,{idToken:await t.getIdToken(),deleteProvider:[e]}),s=hm(n||[]);return t.providerData=t.providerData.filter(i=>s.has(i.providerId)),s.has("phone")||(t.phoneNumber=null),await t.auth._persistUserIfCurrent(t),t}async function dm(r,e,t=!1){const n=await ds(r,e._linkToIdToken(r.auth,await r.getIdToken()),t);return Dn._forOperation(r,"link",n)}async function fu(r,e,t){await ea(e);const n=hm(e.providerData),s=r===!1?"provider-already-linked":"no-such-provider";$(n.has(t)===r,e.auth,s)}/**
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
 */async function BA(r,e,t=!1){const{auth:n}=r;if(Qe(n.app))return Promise.reject(Pt(n));const s="reauthenticate";try{const i=await ds(r,Bm(n,s,e,r),t);$(i.idToken,n,"internal-error");const o=lu(i.idToken);$(o,n,"internal-error");const{sub:a}=o;return $(r.uid===a,n,"user-mismatch"),Dn._forOperation(r,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&tn(n,"user-mismatch"),i}}/**
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
 */async function fm(r,e,t=!1){if(Qe(r.app))return Promise.reject(Pt(r));const n="signIn",s=await Bm(r,n,e),i=await Dn._fromIdTokenResponse(r,n,s);return t||await r._updateCurrentUser(i.user),i}async function ZB(r,e){return fm(ft(r),e)}async function Cm(r,e){const t=oe(r);return await fu(!1,t,e.providerId),dm(t,e)}/**
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
 */async function hA(r,e){return $n(r,"POST","/v1/accounts:signInWithCustomToken",ot(r,e))}/**
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
 */async function dA(r,e){if(Qe(r.app))return Promise.reject(Pt(r));const t=ft(r),n=await hA(t,{token:e,returnSecureToken:!0}),s=await Dn._fromIdTokenResponse(t,"signIn",n);return await t._updateCurrentUser(s.user),s}/**
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
 */function Cu(r,e,t){var n;$(((n=t.url)==null?void 0:n.length)>0,r,"invalid-continue-uri"),$(typeof t.dynamicLinkDomain>"u"||t.dynamicLinkDomain.length>0,r,"invalid-dynamic-link-domain"),$(typeof t.linkDomain>"u"||t.linkDomain.length>0,r,"invalid-hosting-link-domain"),e.continueUrl=t.url,e.dynamicLinkDomain=t.dynamicLinkDomain,e.linkDomain=t.linkDomain,e.canHandleCodeInApp=t.handleCodeInApp,t.iOS&&($(t.iOS.bundleId.length>0,r,"missing-ios-bundle-id"),e.iOSBundleId=t.iOS.bundleId),t.android&&($(t.android.packageName.length>0,r,"missing-android-pkg-name"),e.androidInstallApp=t.android.installApp,e.androidMinimumVersionCode=t.android.minimumVersion,e.androidPackageName=t.android.packageName)}/**
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
 */async function eh(r){const e=ft(r);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function fA(r,e,t){const n=ft(r),s={requestType:"PASSWORD_RESET",email:e,clientType:"CLIENT_TYPE_WEB"};t&&Cu(n,s,t),await wr(n,s,"getOobCode",YT,"EMAIL_PASSWORD_PROVIDER")}async function CA(r,e,t){await JT(oe(r),{oobCode:e,newPassword:t}).catch(async n=>{throw n.code==="auth/password-does-not-meet-requirements"&&eh(r),n})}async function pA(r,e){await WT(oe(r),{oobCode:e})}async function gA(r,e,t){if(Qe(r.app))return Promise.reject(Pt(r));const n=ft(r),o=await wr(n,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",lm,"EMAIL_PASSWORD_PROVIDER").catch(c=>{throw c.code==="auth/password-does-not-meet-requirements"&&eh(r),c}),a=await Dn._fromIdTokenResponse(n,"signIn",o);return await n._updateCurrentUser(a.user),a}function mA(r,e,t){return Qe(r.app)?Promise.reject(Pt(r)):ZB(oe(r),jn.credential(e,t)).catch(async n=>{throw n.code==="auth/password-does-not-meet-requirements"&&eh(r),n})}/**
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
 */async function _A(r,e,t){const n=ft(r),s={requestType:"EMAIL_SIGNIN",email:e,clientType:"CLIENT_TYPE_WEB"};function i(o,a){$(a.handleCodeInApp,n,"argument-error"),a&&Cu(n,o,a)}i(s,t),await wr(n,s,"getOobCode",XT,"EMAIL_PASSWORD_PROVIDER")}function EA(r,e){const t=du.parseLink(e);return(t==null?void 0:t.operation)==="EMAIL_SIGNIN"}async function IA(r,e,t){if(Qe(r.app))return Promise.reject(Pt(r));const n=oe(r),s=jn.credentialWithLink(e,t||Zo());return $(s._tenantId===(n.tenantId||null),n,"tenant-id-mismatch"),ZB(n,s)}/**
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
 */async function yA(r,e){return at(r,"POST","/v1/accounts:createAuthUri",ot(r,e))}/**
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
 */async function wA(r,e){const t=QB()?Zo():"http://localhost",n={identifier:e,continueUri:t},{signinMethods:s}=await yA(oe(r),n);return s||[]}async function DA(r,e){const t=oe(r),s={requestType:"VERIFY_EMAIL",idToken:await r.getIdToken()};e&&Cu(t.auth,s,e);const{email:i}=await $T(t.auth,s);i!==r.email&&await r.reload()}async function TA(r,e,t){const n=oe(r),i={requestType:"VERIFY_AND_CHANGE_EMAIL",idToken:await r.getIdToken(),newEmail:e};t&&Cu(n.auth,i,t);const{email:o}=await ZT(n.auth,i);o!==r.email&&await r.reload()}/**
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
 */async function AA(r,e){return at(r,"POST","/v1/accounts:update",e)}/**
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
 */async function RA(r,{displayName:e,photoURL:t}){if(e===void 0&&t===void 0)return;const n=oe(r),i={idToken:await n.getIdToken(),displayName:e,photoUrl:t,returnSecureToken:!0},o=await ds(n,AA(n.auth,i));n.displayName=o.displayName||null,n.photoURL=o.photoUrl||null;const a=n.providerData.find(({providerId:c})=>c==="password");a&&(a.displayName=n.displayName,a.photoURL=n.photoURL),await n._updateTokensIfNecessary(o)}function vA(r,e){const t=oe(r);return Qe(t.auth.app)?Promise.reject(Pt(t.auth)):pm(t,e,null)}function PA(r,e){return pm(oe(r),null,e)}async function pm(r,e,t){const{auth:n}=r,i={idToken:await r.getIdToken(),returnSecureToken:!0};e&&(i.email=e),t&&(i.password=t);const o=await ds(r,KT(n,i));await r._updateTokensIfNecessary(o,!0)}/**
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
 */function bA(r){var s,i;if(!r)return null;const{providerId:e}=r,t=r.rawUserInfo?JSON.parse(r.rawUserInfo):{},n=r.isNewUser||r.kind==="identitytoolkit#SignupNewUserResponse";if(!e&&(r!=null&&r.idToken)){const o=(i=(s=lu(r.idToken))==null?void 0:s.firebase)==null?void 0:i.sign_in_provider;if(o){const a=o!=="anonymous"&&o!=="custom"?o:null;return new ri(n,a)}}if(!e)return null;switch(e){case"facebook.com":return new SA(n,t);case"github.com":return new NA(n,t);case"google.com":return new OA(n,t);case"twitter.com":return new FA(n,t,r.screenName||null);case"custom":case"anonymous":return new ri(n,null);default:return new ri(n,e,t)}}class ri{constructor(e,t,n={}){this.isNewUser=e,this.providerId=t,this.profile=n}}class gm extends ri{constructor(e,t,n,s){super(e,t,n),this.username=s}}class SA extends ri{constructor(e,t){super(e,"facebook.com",t)}}class NA extends gm{constructor(e,t){super(e,"github.com",t,typeof(t==null?void 0:t.login)=="string"?t==null?void 0:t.login:null)}}class OA extends ri{constructor(e,t){super(e,"google.com",t)}}class FA extends gm{constructor(e,t,n){super(e,"twitter.com",t,n)}}function kA(r){const{user:e,_tokenResponse:t}=r;return e.isAnonymous&&!t?{providerId:null,isNewUser:!1,profile:null}:bA(t)}/**
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
 */function rc(r,e){return oe(r).setPersistence(e)}function LA(r,e,t,n){return oe(r).onIdTokenChanged(e,t,n)}function xA(r,e,t){return oe(r).beforeAuthStateChanged(e,t)}function RF(r,e,t,n){return oe(r).onAuthStateChanged(e,t,n)}function vF(r){return oe(r).signOut()}function VA(r,e){return ft(r).revokeAccessToken(e)}async function MA(r){return oe(r).delete()}/**
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
 */function aC(r,e){return at(r,"POST","/v2/accounts/mfaEnrollment:start",ot(r,e))}const Vc="__sak";/**
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
 */class mm{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Vc,"1"),this.storage.removeItem(Vc),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const GA=1e3,UA=10;class _m extends mm{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=om(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const n=this.storage.getItem(t),s=this.localCache[t];n!==s&&e(t,s,n)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,a,c)=>{this.notifyListeners(o,c)});return}const n=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const o=this.storage.getItem(n);!t&&this.localCache[n]===o||this.notifyListeners(n,o)},i=this.storage.getItem(n);yT()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,UA):s()}notifyListeners(e,t){this.localCache[e]=t;const n=this.listeners[e];if(n)for(const s of Array.from(n))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,n)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:n}),!0)})},GA)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}_m.type="LOCAL";const Em=_m;/**
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
 */class Im extends mm{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Im.type="SESSION";const th=Im;/**
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
 */function HA(r){return Promise.all(r.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
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
 */class pu{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const n=new pu(e);return this.receivers.push(n),n}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:n,eventType:s,data:i}=t.data,o=this.handlersMap[s];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:n,eventType:s});const a=Array.from(o).map(async l=>l(t.origin,i)),c=await HA(a);t.ports[0].postMessage({status:"done",eventId:n,eventType:s,response:c})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}pu.receivers=[];/**
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
 */function gu(r="",e=10){let t="";for(let n=0;n<e;n++)t+=Math.floor(Math.random()*10);return r+t}/**
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
 */class qA{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,n=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,o;return new Promise((a,c)=>{const l=gu("",20);s.port1.start();const B=setTimeout(()=>{c(new Error("unsupported_event"))},n);o={messageChannel:s,onMessage(d){const C=d;if(C.data.eventId===l)switch(C.data.status){case"ack":clearTimeout(B),i=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),a(C.data.response);break;default:clearTimeout(B),clearTimeout(i),c(new Error("invalid_response"));break}}},this.handlers.add(o),s.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:l,data:t},[s.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
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
 */function ze(){return window}function jA(r){ze().location.href=r}/**
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
 */function nh(){return typeof ze().WorkerGlobalScope<"u"&&typeof ze().importScripts=="function"}async function JA(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function KA(){var r;return((r=navigator==null?void 0:navigator.serviceWorker)==null?void 0:r.controller)||null}function zA(){return nh()?self:null}/**
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
 */const ym="firebaseLocalStorageDb",WA=1,Mc="firebaseLocalStorage",wm="fbase_key";class Ea{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function mu(r,e){return r.transaction([Mc],e?"readwrite":"readonly").objectStore(Mc)}function QA(){const r=indexedDB.deleteDatabase(ym);return new Ea(r).toPromise()}function Dm(){const r=indexedDB.open(ym,WA);return new Promise((e,t)=>{r.addEventListener("error",()=>{t(r.error)}),r.addEventListener("upgradeneeded",()=>{const n=r.result;try{n.createObjectStore(Mc,{keyPath:wm})}catch(s){t(s)}}),r.addEventListener("success",async()=>{const n=r.result;n.objectStoreNames.contains(Mc)?e(n):(n.close(),await QA(),e(await Dm()))})})}async function cC(r,e,t){const n=mu(r,!0).put({[wm]:e,value:t});return new Ea(n).toPromise()}async function $A(r,e){const t=mu(r,!1).get(e),n=await new Ea(t).toPromise();return n===void 0?null:n.value}function uC(r,e){const t=mu(r,!0).delete(e);return new Ea(t).toPromise()}const YA=800,XA=3;class Tm{registerLifecycleListeners(){typeof window<"u"&&typeof window.addEventListener=="function"&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow))}unregisterLifecycleListeners(){typeof window<"u"&&typeof window.removeEventListener=="function"&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow))}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isClosing=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isClosing=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isClosing&&(this.isClosing=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){if(this.isClosing)throw new Error("Database is closing");return this.dbPromise?this.dbPromise:(this.dbPromise=Dm(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let t=0;for(;;)try{const n=await this._openDb();return await e(n)}catch(n){if(this.isClosing||t++>XA)throw n;this.dbPromise&&((await this.dbPromise).close(),this.dbPromise=null)}}async initializeServiceWorkerMessaging(){return nh()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=pu._getInstance(zA()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,n;if(this.activeServiceWorker=await JA(),!this.activeServiceWorker)return;this.sender=new qA(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(n=e[0])!=null&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||KA()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await cC(e,Vc,"1"),await uC(e,Vc)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(n=>cC(n,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(n=>$A(n,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>uC(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){if(this.isClosing)return[];try{const e=await this._withRetries(s=>{const i=mu(s,!1).getAll();return new Ea(i).toPromise()});if(this.isClosing)return[];if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],n=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)n.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!n.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}catch(e){return this.isClosing||jg(`Firebase Auth cross-tab polling failed with error: ${e}`),[]}}notifyListeners(e,t){this.localCache[e]=t;const n=this.listeners[e];if(n)for(const s of Array.from(n))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),YA)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.stopPolling(),this.unregisterLifecycleListeners())}}Tm.type="LOCAL";const Am=Tm;/**
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
 */function lC(r,e){return at(r,"POST","/v2/accounts/mfaSignIn:start",ot(r,e))}/**
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
 */const bl=cm("rcb"),ZA=new ma(3e4,6e4);class eR{constructor(){var e;this.hostLanguage="",this.counter=0,this.librarySeparatelyLoaded=!!((e=ze().grecaptcha)!=null&&e.render)}load(e,t=""){return $(tR(t),e,"argument-error"),this.shouldResolveImmediately(t)&&Yf(ze().grecaptcha)?Promise.resolve(ze().grecaptcha):new Promise((n,s)=>{const i=ze().setTimeout(()=>{s(vt(e,"network-request-failed"))},ZA.get());ze()[bl]=()=>{ze().clearTimeout(i),delete ze()[bl];const a=ze().grecaptcha;if(!a||!Yf(a)){s(vt(e,"internal-error"));return}const c=a.render;a.render=(l,B)=>{const d=c(l,B);return this.counter++,d},this.hostLanguage=t,n(a)};const o=`${PT()}?${Fi({onload:bl,render:"explicit",hl:t})}`;XB(o).catch(()=>{clearTimeout(i),s(vt(e,"internal-error"))})})}clearedOneInstance(){this.counter--}shouldResolveImmediately(e){var t;return!!((t=ze().grecaptcha)!=null&&t.render)&&(e===this.hostLanguage||this.counter>0||this.librarySeparatelyLoaded)}}function tR(r){return r.length<=6&&/^\s*[a-zA-Z0-9\-]*\s*$/.test(r)}class nR{async load(e){return new FT(e)}clearedOneInstance(){}}/**
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
 */const ko="recaptcha",rR={theme:"light",type:"image"};class BC{constructor(e,t,n={...rR}){this.parameters=n,this.type=ko,this.destroyed=!1,this.widgetId=null,this.tokenChangeListeners=new Set,this.renderPromise=null,this.recaptcha=null,this.auth=ft(e),this.isInvisible=this.parameters.size==="invisible",$(typeof document<"u",this.auth,"operation-not-supported-in-this-environment");const s=typeof t=="string"?document.getElementById(t):t;$(s,this.auth,"argument-error"),this.container=s,this.parameters.callback=this.makeTokenCallback(this.parameters.callback),this._recaptchaLoader=this.auth.settings.appVerificationDisabledForTesting?new nR:new eR,this.validateStartingState()}async verify(){this.assertNotDestroyed();const e=await this.render(),t=this.getAssertedRecaptcha(),n=t.getResponse(e);return n||new Promise(s=>{const i=o=>{o&&(this.tokenChangeListeners.delete(i),s(o))};this.tokenChangeListeners.add(i),this.isInvisible&&t.execute(e)})}render(){try{this.assertNotDestroyed()}catch(e){return Promise.reject(e)}return this.renderPromise?this.renderPromise:(this.renderPromise=this.makeRenderPromise().catch(e=>{throw this.renderPromise=null,e}),this.renderPromise)}_reset(){this.assertNotDestroyed(),this.widgetId!==null&&this.getAssertedRecaptcha().reset(this.widgetId)}clear(){this.assertNotDestroyed(),this.destroyed=!0,this._recaptchaLoader.clearedOneInstance(),this.isInvisible||this.container.childNodes.forEach(e=>{this.container.removeChild(e)})}validateStartingState(){$(!this.parameters.sitekey,this.auth,"argument-error"),$(this.isInvisible||!this.container.hasChildNodes(),this.auth,"argument-error"),$(typeof document<"u",this.auth,"operation-not-supported-in-this-environment")}makeTokenCallback(e){return t=>{if(this.tokenChangeListeners.forEach(n=>n(t)),typeof e=="function")e(t);else if(typeof e=="string"){const n=ze()[e];typeof n=="function"&&n(t)}}}assertNotDestroyed(){$(!this.destroyed,this.auth,"internal-error")}async makeRenderPromise(){if(await this.init(),!this.widgetId){let e=this.container;if(!this.isInvisible){const t=document.createElement("div");e.appendChild(t),e=t}this.widgetId=this.getAssertedRecaptcha().render(e,this.parameters)}return this.widgetId}async init(){$(QB()&&!nh(),this.auth,"internal-error"),await sR(),this.recaptcha=await this._recaptchaLoader.load(this.auth,this.auth.languageCode||void 0);const e=await hT(this.auth);$(e,this.auth,"internal-error"),this.parameters.sitekey=e}getAssertedRecaptcha(){return $(this.recaptcha,this.auth,"internal-error"),this.recaptcha}}function sR(){let r=null;return new Promise(e=>{if(document.readyState==="complete"){e();return}r=()=>e(),window.addEventListener("load",r)}).catch(e=>{throw r&&window.removeEventListener("load",r),e})}/**
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
 */class Rm{constructor(e,t){this.verificationId=e,this.onConfirmation=t}confirm(e){const t=Fo._fromVerification(this.verificationId,e);return this.onConfirmation(t)}}async function iR(r,e,t){if(Qe(r.app))return Promise.reject(Pt(r));const n=ft(r),s=await vm(n,e,oe(t));return new Rm(s,i=>ZB(n,i))}async function oR(r,e,t){const n=oe(r);await fu(!1,n,"phone");const s=await vm(n.auth,e,oe(t));return new Rm(s,i=>Cm(n,i))}async function vm(r,e,t){var n;if(!r._getRecaptchaConfig())try{await GT(r)}catch{console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.")}try{let s;if(typeof e=="string"?s={phoneNumber:e}:s=e,"session"in s){const i=s.session;if("phoneNumber"in s){$(i.type==="enroll",r,"internal-error");const o={idToken:i.credential,phoneEnrollmentInfo:{phoneNumber:s.phoneNumber,clientType:"CLIENT_TYPE_WEB"}};return(await wr(r,o,"mfaSmsEnrollment",async(B,d)=>{if(d.phoneEnrollmentInfo.captchaResponse===Oo){$((t==null?void 0:t.type)===ko,B,"argument-error");const C=await Sl(B,d,t);return aC(B,C)}return aC(B,d)},"PHONE_PROVIDER").catch(B=>Promise.reject(B))).phoneSessionInfo.sessionInfo}else{$(i.type==="signin",r,"internal-error");const o=((n=s.multiFactorHint)==null?void 0:n.uid)||s.multiFactorUid;$(o,r,"missing-multi-factor-info");const a={mfaPendingCredential:i.credential,mfaEnrollmentId:o,phoneSignInInfo:{clientType:"CLIENT_TYPE_WEB"}};return(await wr(r,a,"mfaSmsSignIn",async(d,C)=>{if(C.phoneSignInInfo.captchaResponse===Oo){$((t==null?void 0:t.type)===ko,d,"argument-error");const g=await Sl(d,C,t);return lC(d,g)}return lC(d,C)},"PHONE_PROVIDER").catch(d=>Promise.reject(d))).phoneResponseInfo.sessionInfo}}else{const i={phoneNumber:s.phoneNumber,clientType:"CLIENT_TYPE_WEB"};return(await wr(r,i,"sendVerificationCode",async(l,B)=>{if(B.captchaResponse===Oo){$((t==null?void 0:t.type)===ko,l,"argument-error");const d=await Sl(l,B,t);return iC(l,d)}return iC(l,B)},"PHONE_PROVIDER").catch(l=>Promise.reject(l))).sessionInfo}}finally{t==null||t._reset()}}async function Sl(r,e,t){$(t.type===ko,r,"argument-error");const n=await t.verify();$(typeof n=="string",r,"argument-error");const s={...e};if("phoneEnrollmentInfo"in s){const i=s.phoneEnrollmentInfo.phoneNumber,o=s.phoneEnrollmentInfo.captchaResponse,a=s.phoneEnrollmentInfo.clientType,c=s.phoneEnrollmentInfo.recaptchaVersion;return Object.assign(s,{phoneEnrollmentInfo:{phoneNumber:i,recaptchaToken:n,captchaResponse:o,clientType:a,recaptchaVersion:c}}),s}else if("phoneSignInInfo"in s){const i=s.phoneSignInInfo.captchaResponse,o=s.phoneSignInInfo.clientType,a=s.phoneSignInInfo.recaptchaVersion;return Object.assign(s,{phoneSignInInfo:{recaptchaToken:n,captchaResponse:i,clientType:o,recaptchaVersion:a}}),s}else return Object.assign(s,{recaptchaToken:n}),s}/**
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
 */function Vi(r,e){return e?kn(e):($(r._popupRedirectResolver,r,"argument-error"),r._popupRedirectResolver)}/**
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
 */class rh extends Bu{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return ni(e,this._buildIdpRequest())}_linkToIdToken(e,t){return ni(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return ni(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function aR(r){return fm(r.auth,new rh(r),r.bypassAuthState)}function cR(r){const{auth:e,user:t}=r;return $(t,e,"internal-error"),BA(t,new rh(r),r.bypassAuthState)}async function uR(r){const{auth:e,user:t}=r;return $(t,e,"internal-error"),dm(t,new rh(r),r.bypassAuthState)}/**
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
 */class Pm{constructor(e,t,n,s,i=!1){this.auth=e,this.resolver=n,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(n){this.reject(n)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:n,postBody:s,tenantId:i,error:o,type:a}=e;if(o){this.reject(o);return}const c={auth:this.auth,requestUri:t,sessionId:n,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(a)(c))}catch(l){this.reject(l)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return aR;case"linkViaPopup":case"linkViaRedirect":return uR;case"reauthViaPopup":case"reauthViaRedirect":return cR;default:tn(this.auth,"internal-error")}}resolve(e){qn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){qn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const lR=new ma(2e3,1e4);async function BR(r,e,t){if(Qe(r.app))return Promise.reject(vt(r,"operation-not-supported-in-this-environment"));const n=ft(r);ga(r,e,Ts);const s=Vi(n,t);return new Ln(n,"signInViaPopup",e,s).executeNotNull()}async function PF(r,e,t){const n=oe(r);if(Qe(n.auth.app))return Promise.reject(vt(n.auth,"operation-not-supported-in-this-environment"));ga(n.auth,e,Ts);const s=Vi(n.auth,t);return new Ln(n.auth,"reauthViaPopup",e,s,n).executeNotNull()}async function hR(r,e,t){const n=oe(r);ga(n.auth,e,Ts);const s=Vi(n.auth,t);return new Ln(n.auth,"linkViaPopup",e,s,n).executeNotNull()}class Ln extends Pm{constructor(e,t,n,s,i){super(e,t,s,i),this.provider=n,this.authWindow=null,this.pollId=null,Ln.currentPopupAction&&Ln.currentPopupAction.cancel(),Ln.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return $(e,this.auth,"internal-error"),e}async onExecution(){qn(this.filter.length===1,"Popup operations only handle one event");const e=gu();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(vt(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(vt(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Ln.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,n;if((n=(t=this.authWindow)==null?void 0:t.window)!=null&&n.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(vt(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,lR.get())};e()}}Ln.currentPopupAction=null;/**
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
 */const dR="pendingRedirect",Ic=new Map;class fR extends Pm{constructor(e,t,n=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,n),this.eventId=null}async execute(){let e=Ic.get(this.auth._key());if(!e){try{const n=await CR(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(n)}catch(t){e=()=>Promise.reject(t)}Ic.set(this.auth._key(),e)}return this.bypassAuthState||Ic.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function CR(r,e){const t=Nm(e),n=Sm(r);if(!await n._isAvailable())return!1;const s=await n._get(t)==="true";return await n._remove(t),s}async function bm(r,e){return Sm(r)._set(Nm(e),"true")}function pR(r,e){Ic.set(r._key(),e)}function Sm(r){return kn(r._redirectPersistence)}function Nm(r){return Ec(dR,r.config.apiKey,r.name)}/**
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
 */function gR(r,e,t){return mR(r,e,t)}async function mR(r,e,t){if(Qe(r.app))return Promise.reject(Pt(r));const n=ft(r);ga(r,e,Ts),await n._initializationPromise;const s=Vi(n,t);return await bm(s,n),s._openRedirect(n,e,"signInViaRedirect")}function _R(r,e,t){return ER(r,e,t)}async function ER(r,e,t){const n=oe(r);ga(n.auth,e,Ts),await n.auth._initializationPromise;const s=Vi(n.auth,t);await fu(!1,n,e.providerId),await bm(s,n.auth);const i=await yR(n);return s._openRedirect(n.auth,e,"linkViaRedirect",i)}async function IR(r,e){return await ft(r)._initializationPromise,Om(r,e,!1)}async function Om(r,e,t=!1){if(Qe(r.app))return Promise.reject(Pt(r));const n=ft(r),s=Vi(n,e),o=await new fR(n,s,t).execute();return o&&!t&&(delete o.user._redirectEventId,await n._persistUserIfCurrent(o.user),await n._setRedirectUser(null,e)),o}async function yR(r){const e=gu(`${r.uid}:::`);return r._redirectEventId=e,await r.auth._setRedirectUser(r),await r.auth._persistUserIfCurrent(r),e}/**
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
 */const wR=600*1e3;class DR{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(n=>{this.isEventForConsumer(e,n)&&(t=!0,this.sendToConsumer(e,n),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!TR(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var n;if(e.error&&!Fm(e)){const s=((n=e.error.code)==null?void 0:n.split("auth/")[1])||"internal-error";t.onError(vt(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const n=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&n}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=wR&&this.cachedEventUids.clear(),this.cachedEventUids.has(hC(e))}saveEventToCache(e){this.cachedEventUids.add(hC(e)),this.lastProcessedEventTime=Date.now()}}function hC(r){return[r.type,r.eventId,r.sessionId,r.tenantId].filter(e=>e).join("-")}function Fm({type:r,error:e}){return r==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function TR(r){switch(r.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Fm(r);default:return!1}}/**
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
 */async function AR(r,e={}){return at(r,"GET","/v1/projects",e)}/**
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
 */const RR=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,vR=/^https?/;async function PR(r){if(r.config.emulator)return;const{authorizedDomains:e}=await AR(r);for(const t of e)try{if(bR(t))return}catch{}tn(r,"unauthorized-domain")}function bR(r){const e=Zo(),{protocol:t,hostname:n}=new URL(e);if(r.startsWith("chrome-extension://")){const o=new URL(r);return o.hostname===""&&n===""?t==="chrome-extension:"&&r.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===n}if(!vR.test(t))return!1;if(RR.test(r))return n===r;const s=r.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(n)}/**
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
 */const SR=new ma(3e4,6e4);function dC(){const r=ze().___jsl;if(r!=null&&r.H){for(const e of Object.keys(r.H))if(r.H[e].r=r.H[e].r||[],r.H[e].L=r.H[e].L||[],r.H[e].r=[...r.H[e].L],r.CP)for(let t=0;t<r.CP.length;t++)r.CP[t]=null}}function NR(r){return new Promise((e,t)=>{var s,i,o;function n(){dC(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{dC(),t(vt(r,"network-request-failed"))},timeout:SR.get()})}if((i=(s=ze().gapi)==null?void 0:s.iframes)!=null&&i.Iframe)e(gapi.iframes.getContext());else if((o=ze().gapi)!=null&&o.load)n();else{const a=cm("iframefcb");return ze()[a]=()=>{gapi.load?n():t(vt(r,"network-request-failed"))},XB(`${ST()}?onload=${a}`).catch(c=>t(c))}}).catch(e=>{throw yc=null,e})}let yc=null;function OR(r){return yc=yc||NR(r),yc}/**
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
 */const FR=new ma(5e3,15e3),kR="__/auth/iframe",LR="emulator/auth/iframe",xR={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},VR=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function MR(r){const e=r.config;$(e.authDomain,r,"auth-domain-config-required");const t=e.emulator?$B(e,LR):`https://${r.config.authDomain}/${kR}`,n={apiKey:e.apiKey,appName:r.name,v:Li},s=VR.get(r.config.apiHost);s&&(n.eid=s);const i=r._getFrameworks();return i.length&&(n.fw=i.join(",")),`${t}?${Fi(n).slice(1)}`}async function GR(r){const e=await OR(r),t=ze().gapi;return $(t,r,"internal-error"),e.open({where:document.body,url:MR(r),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:xR,dontclear:!0},n=>new Promise(async(s,i)=>{await n.restyle({setHideOnLeave:!1});const o=vt(r,"network-request-failed"),a=ze().setTimeout(()=>{i(o)},FR.get());function c(){ze().clearTimeout(a),s(n)}n.ping(c).then(c,()=>{i(o)})}))}/**
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
 */const UR={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},HR=500,qR=600,jR="_blank",JR="http://localhost";class fC{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function KR(r,e,t,n=HR,s=qR){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-n)/2,0).toString();let a="";const c={...UR,width:n.toString(),height:s.toString(),top:i,left:o},l=rt().toLowerCase();t&&(a=tm(l)?jR:t),Zg(l)&&(e=e||JR,c.scrollbars="yes");const B=Object.entries(c).reduce((C,[g,I])=>`${C}${g}=${I},`,"");if(IT(l)&&a!=="_self")return zR(e||"",a),new fC(null);const d=window.open(e||"",a,B);$(d,r,"popup-blocked");try{d.focus()}catch{}return new fC(d)}function zR(r,e){const t=document.createElement("a");t.href=r,t.target=e;const n=document.createEvent("MouseEvent");n.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(n)}/**
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
 */const WR="__/auth/handler",QR="emulator/auth/handler",$R=encodeURIComponent("fac");async function CC(r,e,t,n,s,i){$(r.config.authDomain,r,"auth-domain-config-required"),$(r.config.apiKey,r,"invalid-api-key");const o={apiKey:r.config.apiKey,appName:r.name,authType:t,redirectUrl:n,v:Li,eventId:s};if(e instanceof Ts){e.setDefaultLanguage(r.languageCode),o.providerId=e.providerId||"",Zy(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[B,d]of Object.entries({}))o[B]=d}if(e instanceof xi){const B=e.getScopes().filter(d=>d!=="");B.length>0&&(o.scopes=B.join(","))}r.tenantId&&(o.tid=r.tenantId);const a=o;for(const B of Object.keys(a))a[B]===void 0&&delete a[B];const c=await r._getAppCheckToken(),l=c?`#${$R}=${encodeURIComponent(c)}`:"";return`${YR(r)}?${Fi(a).slice(1)}${l}`}function YR({config:r}){return r.emulator?$B(r,QR):`https://${r.authDomain}/${WR}`}/**
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
 */const Nl="webStorageSupport";class XR{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=th,this._completeRedirectFn=Om,this._overrideRedirectResult=pR}async _openPopup(e,t,n,s){var o;qn((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const i=await CC(e,t,n,Zo(),s);return KR(e,i,gu())}async _openRedirect(e,t,n,s){await this._originValidation(e);const i=await CC(e,t,n,Zo(),s);return jA(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(qn(i,"If manager is not set, promise should be"),i)}const n=this.initAndGetManager(e);return this.eventManagers[t]={promise:n},n.catch(()=>{delete this.eventManagers[t]}),n}async initAndGetManager(e){const t=await GR(e),n=new DR(e);return t.register("authEvent",s=>($(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:n.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:n},this.iframes[e._key()]=t,n}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Nl,{type:Nl},s=>{var o;const i=(o=s==null?void 0:s[0])==null?void 0:o[Nl];i!==void 0&&t(!!i),tn(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=PR(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return om()||em()||YB()}}const ZR=XR;var pC="@firebase/auth",gC="1.13.5";/**
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
 */class ev{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(n=>{e((n==null?void 0:n.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){$(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function tv(r){switch(r){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function nv(r){vr(new Un("auth",(e,{options:t})=>{const n=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:a}=n.options;$(o&&!o.includes(":"),"invalid-api-key",{appName:n.name});const c={apiKey:o,authDomain:a,clientPlatform:r,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:am(r)},l=new RT(n,s,i,c);return HT(l,t),l},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,n)=>{e.getProvider("auth-internal").initialize()})),vr(new Un("auth-internal",e=>{const t=ft(e.getProvider("auth").getImmediate());return(n=>new ev(n))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Vn(pC,gC,tv(r)),Vn(pC,gC,"esm2020")}/**
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
 */const rv=300,sv=Ig("authIdTokenMaxAge")||rv;let mC=null;const iv=r=>async e=>{const t=e&&await e.getIdTokenResult(),n=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(n&&n>sv)return;const s=t==null?void 0:t.token;mC!==s&&(mC=s,await fetch(r,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function fe(r=HB()){const e=Ds(r,"auth");if(e.isInitialized())return e.getImmediate();const t=UT(r,{popupRedirectResolver:ZR,persistence:[Am,Em,th]}),n=Ig("authTokenSyncURL");if(n&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(n,location.origin);if(location.origin===i.origin){const o=iv(i.toString());xA(t,o,()=>o(t.currentUser)),LA(t,a=>o(a))}}const s=_g("auth");return s&&nB(t,`http://${s}`),t}function ov(){var r;return((r=document.getElementsByTagName("head"))==null?void 0:r[0])??document}vT({loadJS(r){return new Promise((e,t)=>{const n=document.createElement("script");n.setAttribute("src",r),n.onload=e,n.onerror=s=>{const i=vt("internal-error");i.customData=s,t(i)},n.type="text/javascript",n.charset="UTF-8",ov().appendChild(n)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});nv("Browser");var _C=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Dr,km;(function(){var r;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(D,m){function w(){}w.prototype=m.prototype,D.F=m.prototype,D.prototype=new w,D.prototype.constructor=D,D.D=function(v,T,S){for(var y=Array(arguments.length-2),Ze=2;Ze<arguments.length;Ze++)y[Ze-2]=arguments[Ze];return m.prototype[T].apply(v,y)}}function t(){this.blockSize=-1}function n(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(n,t),n.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(D,m,w){w||(w=0);const v=Array(16);if(typeof m=="string")for(var T=0;T<16;++T)v[T]=m.charCodeAt(w++)|m.charCodeAt(w++)<<8|m.charCodeAt(w++)<<16|m.charCodeAt(w++)<<24;else for(T=0;T<16;++T)v[T]=m[w++]|m[w++]<<8|m[w++]<<16|m[w++]<<24;m=D.g[0],w=D.g[1],T=D.g[2];let S=D.g[3],y;y=m+(S^w&(T^S))+v[0]+3614090360&4294967295,m=w+(y<<7&4294967295|y>>>25),y=S+(T^m&(w^T))+v[1]+3905402710&4294967295,S=m+(y<<12&4294967295|y>>>20),y=T+(w^S&(m^w))+v[2]+606105819&4294967295,T=S+(y<<17&4294967295|y>>>15),y=w+(m^T&(S^m))+v[3]+3250441966&4294967295,w=T+(y<<22&4294967295|y>>>10),y=m+(S^w&(T^S))+v[4]+4118548399&4294967295,m=w+(y<<7&4294967295|y>>>25),y=S+(T^m&(w^T))+v[5]+1200080426&4294967295,S=m+(y<<12&4294967295|y>>>20),y=T+(w^S&(m^w))+v[6]+2821735955&4294967295,T=S+(y<<17&4294967295|y>>>15),y=w+(m^T&(S^m))+v[7]+4249261313&4294967295,w=T+(y<<22&4294967295|y>>>10),y=m+(S^w&(T^S))+v[8]+1770035416&4294967295,m=w+(y<<7&4294967295|y>>>25),y=S+(T^m&(w^T))+v[9]+2336552879&4294967295,S=m+(y<<12&4294967295|y>>>20),y=T+(w^S&(m^w))+v[10]+4294925233&4294967295,T=S+(y<<17&4294967295|y>>>15),y=w+(m^T&(S^m))+v[11]+2304563134&4294967295,w=T+(y<<22&4294967295|y>>>10),y=m+(S^w&(T^S))+v[12]+1804603682&4294967295,m=w+(y<<7&4294967295|y>>>25),y=S+(T^m&(w^T))+v[13]+4254626195&4294967295,S=m+(y<<12&4294967295|y>>>20),y=T+(w^S&(m^w))+v[14]+2792965006&4294967295,T=S+(y<<17&4294967295|y>>>15),y=w+(m^T&(S^m))+v[15]+1236535329&4294967295,w=T+(y<<22&4294967295|y>>>10),y=m+(T^S&(w^T))+v[1]+4129170786&4294967295,m=w+(y<<5&4294967295|y>>>27),y=S+(w^T&(m^w))+v[6]+3225465664&4294967295,S=m+(y<<9&4294967295|y>>>23),y=T+(m^w&(S^m))+v[11]+643717713&4294967295,T=S+(y<<14&4294967295|y>>>18),y=w+(S^m&(T^S))+v[0]+3921069994&4294967295,w=T+(y<<20&4294967295|y>>>12),y=m+(T^S&(w^T))+v[5]+3593408605&4294967295,m=w+(y<<5&4294967295|y>>>27),y=S+(w^T&(m^w))+v[10]+38016083&4294967295,S=m+(y<<9&4294967295|y>>>23),y=T+(m^w&(S^m))+v[15]+3634488961&4294967295,T=S+(y<<14&4294967295|y>>>18),y=w+(S^m&(T^S))+v[4]+3889429448&4294967295,w=T+(y<<20&4294967295|y>>>12),y=m+(T^S&(w^T))+v[9]+568446438&4294967295,m=w+(y<<5&4294967295|y>>>27),y=S+(w^T&(m^w))+v[14]+3275163606&4294967295,S=m+(y<<9&4294967295|y>>>23),y=T+(m^w&(S^m))+v[3]+4107603335&4294967295,T=S+(y<<14&4294967295|y>>>18),y=w+(S^m&(T^S))+v[8]+1163531501&4294967295,w=T+(y<<20&4294967295|y>>>12),y=m+(T^S&(w^T))+v[13]+2850285829&4294967295,m=w+(y<<5&4294967295|y>>>27),y=S+(w^T&(m^w))+v[2]+4243563512&4294967295,S=m+(y<<9&4294967295|y>>>23),y=T+(m^w&(S^m))+v[7]+1735328473&4294967295,T=S+(y<<14&4294967295|y>>>18),y=w+(S^m&(T^S))+v[12]+2368359562&4294967295,w=T+(y<<20&4294967295|y>>>12),y=m+(w^T^S)+v[5]+4294588738&4294967295,m=w+(y<<4&4294967295|y>>>28),y=S+(m^w^T)+v[8]+2272392833&4294967295,S=m+(y<<11&4294967295|y>>>21),y=T+(S^m^w)+v[11]+1839030562&4294967295,T=S+(y<<16&4294967295|y>>>16),y=w+(T^S^m)+v[14]+4259657740&4294967295,w=T+(y<<23&4294967295|y>>>9),y=m+(w^T^S)+v[1]+2763975236&4294967295,m=w+(y<<4&4294967295|y>>>28),y=S+(m^w^T)+v[4]+1272893353&4294967295,S=m+(y<<11&4294967295|y>>>21),y=T+(S^m^w)+v[7]+4139469664&4294967295,T=S+(y<<16&4294967295|y>>>16),y=w+(T^S^m)+v[10]+3200236656&4294967295,w=T+(y<<23&4294967295|y>>>9),y=m+(w^T^S)+v[13]+681279174&4294967295,m=w+(y<<4&4294967295|y>>>28),y=S+(m^w^T)+v[0]+3936430074&4294967295,S=m+(y<<11&4294967295|y>>>21),y=T+(S^m^w)+v[3]+3572445317&4294967295,T=S+(y<<16&4294967295|y>>>16),y=w+(T^S^m)+v[6]+76029189&4294967295,w=T+(y<<23&4294967295|y>>>9),y=m+(w^T^S)+v[9]+3654602809&4294967295,m=w+(y<<4&4294967295|y>>>28),y=S+(m^w^T)+v[12]+3873151461&4294967295,S=m+(y<<11&4294967295|y>>>21),y=T+(S^m^w)+v[15]+530742520&4294967295,T=S+(y<<16&4294967295|y>>>16),y=w+(T^S^m)+v[2]+3299628645&4294967295,w=T+(y<<23&4294967295|y>>>9),y=m+(T^(w|~S))+v[0]+4096336452&4294967295,m=w+(y<<6&4294967295|y>>>26),y=S+(w^(m|~T))+v[7]+1126891415&4294967295,S=m+(y<<10&4294967295|y>>>22),y=T+(m^(S|~w))+v[14]+2878612391&4294967295,T=S+(y<<15&4294967295|y>>>17),y=w+(S^(T|~m))+v[5]+4237533241&4294967295,w=T+(y<<21&4294967295|y>>>11),y=m+(T^(w|~S))+v[12]+1700485571&4294967295,m=w+(y<<6&4294967295|y>>>26),y=S+(w^(m|~T))+v[3]+2399980690&4294967295,S=m+(y<<10&4294967295|y>>>22),y=T+(m^(S|~w))+v[10]+4293915773&4294967295,T=S+(y<<15&4294967295|y>>>17),y=w+(S^(T|~m))+v[1]+2240044497&4294967295,w=T+(y<<21&4294967295|y>>>11),y=m+(T^(w|~S))+v[8]+1873313359&4294967295,m=w+(y<<6&4294967295|y>>>26),y=S+(w^(m|~T))+v[15]+4264355552&4294967295,S=m+(y<<10&4294967295|y>>>22),y=T+(m^(S|~w))+v[6]+2734768916&4294967295,T=S+(y<<15&4294967295|y>>>17),y=w+(S^(T|~m))+v[13]+1309151649&4294967295,w=T+(y<<21&4294967295|y>>>11),y=m+(T^(w|~S))+v[4]+4149444226&4294967295,m=w+(y<<6&4294967295|y>>>26),y=S+(w^(m|~T))+v[11]+3174756917&4294967295,S=m+(y<<10&4294967295|y>>>22),y=T+(m^(S|~w))+v[2]+718787259&4294967295,T=S+(y<<15&4294967295|y>>>17),y=w+(S^(T|~m))+v[9]+3951481745&4294967295,D.g[0]=D.g[0]+m&4294967295,D.g[1]=D.g[1]+(T+(y<<21&4294967295|y>>>11))&4294967295,D.g[2]=D.g[2]+T&4294967295,D.g[3]=D.g[3]+S&4294967295}n.prototype.v=function(D,m){m===void 0&&(m=D.length);const w=m-this.blockSize,v=this.C;let T=this.h,S=0;for(;S<m;){if(T==0)for(;S<=w;)s(this,D,S),S+=this.blockSize;if(typeof D=="string"){for(;S<m;)if(v[T++]=D.charCodeAt(S++),T==this.blockSize){s(this,v),T=0;break}}else for(;S<m;)if(v[T++]=D[S++],T==this.blockSize){s(this,v),T=0;break}}this.h=T,this.o+=m},n.prototype.A=function(){var D=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);D[0]=128;for(var m=1;m<D.length-8;++m)D[m]=0;m=this.o*8;for(var w=D.length-8;w<D.length;++w)D[w]=m&255,m/=256;for(this.v(D),D=Array(16),m=0,w=0;w<4;++w)for(let v=0;v<32;v+=8)D[m++]=this.g[w]>>>v&255;return D};function i(D,m){var w=a;return Object.prototype.hasOwnProperty.call(w,D)?w[D]:w[D]=m(D)}function o(D,m){this.h=m;const w=[];let v=!0;for(let T=D.length-1;T>=0;T--){const S=D[T]|0;v&&S==m||(w[T]=S,v=!1)}this.g=w}var a={};function c(D){return-128<=D&&D<128?i(D,function(m){return new o([m|0],m<0?-1:0)}):new o([D|0],D<0?-1:0)}function l(D){if(isNaN(D)||!isFinite(D))return d;if(D<0)return F(l(-D));const m=[];let w=1;for(let v=0;D>=w;v++)m[v]=D/w|0,w*=4294967296;return new o(m,0)}function B(D,m){if(D.length==0)throw Error("number format error: empty string");if(m=m||10,m<2||36<m)throw Error("radix out of range: "+m);if(D.charAt(0)=="-")return F(B(D.substring(1),m));if(D.indexOf("-")>=0)throw Error('number format error: interior "-" character');const w=l(Math.pow(m,8));let v=d;for(let S=0;S<D.length;S+=8){var T=Math.min(8,D.length-S);const y=parseInt(D.substring(S,S+T),m);T<8?(T=l(Math.pow(m,T)),v=v.j(T).add(l(y))):(v=v.j(w),v=v.add(l(y)))}return v}var d=c(0),C=c(1),g=c(16777216);r=o.prototype,r.m=function(){if(P(this))return-F(this).m();let D=0,m=1;for(let w=0;w<this.g.length;w++){const v=this.i(w);D+=(v>=0?v:4294967296+v)*m,m*=4294967296}return D},r.toString=function(D){if(D=D||10,D<2||36<D)throw Error("radix out of range: "+D);if(I(this))return"0";if(P(this))return"-"+F(this).toString(D);const m=l(Math.pow(D,6));var w=this;let v="";for(;;){const T=Be(w,m).g;w=H(w,T.j(m));let S=((w.g.length>0?w.g[0]:w.h)>>>0).toString(D);if(w=T,I(w))return S+v;for(;S.length<6;)S="0"+S;v=S+v}},r.i=function(D){return D<0?0:D<this.g.length?this.g[D]:this.h};function I(D){if(D.h!=0)return!1;for(let m=0;m<D.g.length;m++)if(D.g[m]!=0)return!1;return!0}function P(D){return D.h==-1}r.l=function(D){return D=H(this,D),P(D)?-1:I(D)?0:1};function F(D){const m=D.g.length,w=[];for(let v=0;v<m;v++)w[v]=~D.g[v];return new o(w,~D.h).add(C)}r.abs=function(){return P(this)?F(this):this},r.add=function(D){const m=Math.max(this.g.length,D.g.length),w=[];let v=0;for(let T=0;T<=m;T++){let S=v+(this.i(T)&65535)+(D.i(T)&65535),y=(S>>>16)+(this.i(T)>>>16)+(D.i(T)>>>16);v=y>>>16,S&=65535,y&=65535,w[T]=y<<16|S}return new o(w,w[w.length-1]&-2147483648?-1:0)};function H(D,m){return D.add(F(m))}r.j=function(D){if(I(this)||I(D))return d;if(P(this))return P(D)?F(this).j(F(D)):F(F(this).j(D));if(P(D))return F(this.j(F(D)));if(this.l(g)<0&&D.l(g)<0)return l(this.m()*D.m());const m=this.g.length+D.g.length,w=[];for(var v=0;v<2*m;v++)w[v]=0;for(v=0;v<this.g.length;v++)for(let T=0;T<D.g.length;T++){const S=this.i(v)>>>16,y=this.i(v)&65535,Ze=D.i(T)>>>16,Wt=D.i(T)&65535;w[2*v+2*T]+=y*Wt,Z(w,2*v+2*T),w[2*v+2*T+1]+=S*Wt,Z(w,2*v+2*T+1),w[2*v+2*T+1]+=y*Ze,Z(w,2*v+2*T+1),w[2*v+2*T+2]+=S*Ze,Z(w,2*v+2*T+2)}for(D=0;D<m;D++)w[D]=w[2*D+1]<<16|w[2*D];for(D=m;D<2*m;D++)w[D]=0;return new o(w,0)};function Z(D,m){for(;(D[m]&65535)!=D[m];)D[m+1]+=D[m]>>>16,D[m]&=65535,m++}function ee(D,m){this.g=D,this.h=m}function Be(D,m){if(I(m))throw Error("division by zero");if(I(D))return new ee(d,d);if(P(D))return m=Be(F(D),m),new ee(F(m.g),F(m.h));if(P(m))return m=Be(D,F(m)),new ee(F(m.g),m.h);if(D.g.length>30){if(P(D)||P(m))throw Error("slowDivide_ only works with positive integers.");for(var w=C,v=m;v.l(D)<=0;)w=he(w),v=he(v);var T=ue(w,1),S=ue(v,1);for(v=ue(v,2),w=ue(w,2);!I(v);){var y=S.add(v);y.l(D)<=0&&(T=T.add(w),S=y),v=ue(v,1),w=ue(w,1)}return m=H(D,T.j(m)),new ee(T,m)}for(T=d;D.l(m)>=0;){for(w=Math.max(1,Math.floor(D.m()/m.m())),v=Math.ceil(Math.log(w)/Math.LN2),v=v<=48?1:Math.pow(2,v-48),S=l(w),y=S.j(m);P(y)||y.l(D)>0;)w-=v,S=l(w),y=S.j(m);I(S)&&(S=C),T=T.add(S),D=H(D,y)}return new ee(T,D)}r.B=function(D){return Be(this,D).h},r.and=function(D){const m=Math.max(this.g.length,D.g.length),w=[];for(let v=0;v<m;v++)w[v]=this.i(v)&D.i(v);return new o(w,this.h&D.h)},r.or=function(D){const m=Math.max(this.g.length,D.g.length),w=[];for(let v=0;v<m;v++)w[v]=this.i(v)|D.i(v);return new o(w,this.h|D.h)},r.xor=function(D){const m=Math.max(this.g.length,D.g.length),w=[];for(let v=0;v<m;v++)w[v]=this.i(v)^D.i(v);return new o(w,this.h^D.h)};function he(D){const m=D.g.length+1,w=[];for(let v=0;v<m;v++)w[v]=D.i(v)<<1|D.i(v-1)>>>31;return new o(w,D.h)}function ue(D,m){const w=m>>5;m%=32;const v=D.g.length-w,T=[];for(let S=0;S<v;S++)T[S]=m>0?D.i(S+w)>>>m|D.i(S+w+1)<<32-m:D.i(S+w);return new o(T,D.h)}n.prototype.digest=n.prototype.A,n.prototype.reset=n.prototype.u,n.prototype.update=n.prototype.v,km=n,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.B,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=l,o.fromString=B,Dr=o}).apply(typeof _C<"u"?_C:typeof self<"u"?self:typeof window<"u"?window:{});var sc=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Lm,vo,xm,wc,rB,Vm,Mm,Gm;(function(){var r,e=Object.defineProperty;function t(u){u=[typeof globalThis=="object"&&globalThis,u,typeof window=="object"&&window,typeof self=="object"&&self,typeof sc=="object"&&sc];for(var h=0;h<u.length;++h){var f=u[h];if(f&&f.Math==Math)return f}throw Error("Cannot find global object")}var n=t(this);function s(u,h){if(h)e:{var f=n;u=u.split(".");for(var p=0;p<u.length-1;p++){var N=u[p];if(!(N in f))break e;f=f[N]}u=u[u.length-1],p=f[u],h=h(p),h!=p&&h!=null&&e(f,u,{configurable:!0,writable:!0,value:h})}}s("Symbol.dispose",function(u){return u||Symbol("Symbol.dispose")}),s("Array.prototype.values",function(u){return u||function(){return this[Symbol.iterator]()}}),s("Object.entries",function(u){return u||function(h){var f=[],p;for(p in h)Object.prototype.hasOwnProperty.call(h,p)&&f.push([p,h[p]]);return f}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var i=i||{},o=this||self;function a(u){var h=typeof u;return h=="object"&&u!=null||h=="function"}function c(u,h,f){return u.call.apply(u.bind,arguments)}function l(u,h,f){return l=c,l.apply(null,arguments)}function B(u,h){var f=Array.prototype.slice.call(arguments,1);return function(){var p=f.slice();return p.push.apply(p,arguments),u.apply(this,p)}}function d(u,h){function f(){}f.prototype=h.prototype,u.Z=h.prototype,u.prototype=new f,u.prototype.constructor=u,u.Ob=function(p,N,k){for(var Q=Array(arguments.length-2),le=2;le<arguments.length;le++)Q[le-2]=arguments[le];return h.prototype[N].apply(p,Q)}}var C=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?u=>u&&AsyncContext.Snapshot.wrap(u):u=>u;function g(u){const h=u.length;if(h>0){const f=Array(h);for(let p=0;p<h;p++)f[p]=u[p];return f}return[]}function I(u,h){for(let p=1;p<arguments.length;p++){const N=arguments[p];var f=typeof N;if(f=f!="object"?f:N?Array.isArray(N)?"array":f:"null",f=="array"||f=="object"&&typeof N.length=="number"){f=u.length||0;const k=N.length||0;u.length=f+k;for(let Q=0;Q<k;Q++)u[f+Q]=N[Q]}else u.push(N)}}class P{constructor(h,f){this.i=h,this.j=f,this.h=0,this.g=null}get(){let h;return this.h>0?(this.h--,h=this.g,this.g=h.next,h.next=null):h=this.i(),h}}function F(u){o.setTimeout(()=>{throw u},0)}function H(){var u=D;let h=null;return u.g&&(h=u.g,u.g=u.g.next,u.g||(u.h=null),h.next=null),h}class Z{constructor(){this.h=this.g=null}add(h,f){const p=ee.get();p.set(h,f),this.h?this.h.next=p:this.g=p,this.h=p}}var ee=new P(()=>new Be,u=>u.reset());class Be{constructor(){this.next=this.g=this.h=null}set(h,f){this.h=h,this.g=f,this.next=null}reset(){this.next=this.g=this.h=null}}let he,ue=!1,D=new Z,m=()=>{const u=Promise.resolve(void 0);he=()=>{u.then(w)}};function w(){for(var u;u=H();){try{u.h.call(u.g)}catch(f){F(f)}var h=ee;h.j(u),h.h<100&&(h.h++,u.next=h.g,h.g=u)}ue=!1}function v(){this.u=this.u,this.C=this.C}v.prototype.u=!1,v.prototype.dispose=function(){this.u||(this.u=!0,this.N())},v.prototype[Symbol.dispose]=function(){this.dispose()},v.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function T(u,h){this.type=u,this.g=this.target=h,this.defaultPrevented=!1}T.prototype.h=function(){this.defaultPrevented=!0};var S=(function(){if(!o.addEventListener||!Object.defineProperty)return!1;var u=!1,h=Object.defineProperty({},"passive",{get:function(){u=!0}});try{const f=()=>{};o.addEventListener("test",f,h),o.removeEventListener("test",f,h)}catch{}return u})();function y(u){return/^[\s\xa0]*$/.test(u)}function Ze(u,h){T.call(this,u?u.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,u&&this.init(u,h)}d(Ze,T),Ze.prototype.init=function(u,h){const f=this.type=u.type,p=u.changedTouches&&u.changedTouches.length?u.changedTouches[0]:null;this.target=u.target||u.srcElement,this.g=h,h=u.relatedTarget,h||(f=="mouseover"?h=u.fromElement:f=="mouseout"&&(h=u.toElement)),this.relatedTarget=h,p?(this.clientX=p.clientX!==void 0?p.clientX:p.pageX,this.clientY=p.clientY!==void 0?p.clientY:p.pageY,this.screenX=p.screenX||0,this.screenY=p.screenY||0):(this.clientX=u.clientX!==void 0?u.clientX:u.pageX,this.clientY=u.clientY!==void 0?u.clientY:u.pageY,this.screenX=u.screenX||0,this.screenY=u.screenY||0),this.button=u.button,this.key=u.key||"",this.ctrlKey=u.ctrlKey,this.altKey=u.altKey,this.shiftKey=u.shiftKey,this.metaKey=u.metaKey,this.pointerId=u.pointerId||0,this.pointerType=u.pointerType,this.state=u.state,this.i=u,u.defaultPrevented&&Ze.Z.h.call(this)},Ze.prototype.h=function(){Ze.Z.h.call(this);const u=this.i;u.preventDefault?u.preventDefault():u.returnValue=!1};var Wt="closure_listenable_"+(Math.random()*1e6|0),ZI=0;function ey(u,h,f,p,N){this.listener=u,this.proxy=null,this.src=h,this.type=f,this.capture=!!p,this.ha=N,this.key=++ZI,this.da=this.fa=!1}function Ma(u){u.da=!0,u.listener=null,u.proxy=null,u.src=null,u.ha=null}function Ga(u,h,f){for(const p in u)h.call(f,u[p],p,u)}function ty(u,h){for(const f in u)h.call(void 0,u[f],f,u)}function Nd(u){const h={};for(const f in u)h[f]=u[f];return h}const Od="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Fd(u,h){let f,p;for(let N=1;N<arguments.length;N++){p=arguments[N];for(f in p)u[f]=p[f];for(let k=0;k<Od.length;k++)f=Od[k],Object.prototype.hasOwnProperty.call(p,f)&&(u[f]=p[f])}}function Ua(u){this.src=u,this.g={},this.h=0}Ua.prototype.add=function(u,h,f,p,N){const k=u.toString();u=this.g[k],u||(u=this.g[k]=[],this.h++);const Q=Zu(u,h,p,N);return Q>-1?(h=u[Q],f||(h.fa=!1)):(h=new ey(h,this.src,k,!!p,N),h.fa=f,u.push(h)),h};function Xu(u,h){const f=h.type;if(f in u.g){var p=u.g[f],N=Array.prototype.indexOf.call(p,h,void 0),k;(k=N>=0)&&Array.prototype.splice.call(p,N,1),k&&(Ma(h),u.g[f].length==0&&(delete u.g[f],u.h--))}}function Zu(u,h,f,p){for(let N=0;N<u.length;++N){const k=u[N];if(!k.da&&k.listener==h&&k.capture==!!f&&k.ha==p)return N}return-1}var el="closure_lm_"+(Math.random()*1e6|0),tl={};function kd(u,h,f,p,N){if(Array.isArray(h)){for(let k=0;k<h.length;k++)kd(u,h[k],f,p,N);return null}return f=Vd(f),u&&u[Wt]?u.J(h,f,a(p)?!!p.capture:!1,N):ny(u,h,f,!1,p,N)}function ny(u,h,f,p,N,k){if(!h)throw Error("Invalid event type");const Q=a(N)?!!N.capture:!!N;let le=rl(u);if(le||(u[el]=le=new Ua(u)),f=le.add(h,f,p,Q,k),f.proxy)return f;if(p=ry(),f.proxy=p,p.src=u,p.listener=f,u.addEventListener)S||(N=Q),N===void 0&&(N=!1),u.addEventListener(h.toString(),p,N);else if(u.attachEvent)u.attachEvent(xd(h.toString()),p);else if(u.addListener&&u.removeListener)u.addListener(p);else throw Error("addEventListener and attachEvent are unavailable.");return f}function ry(){function u(f){return h.call(u.src,u.listener,f)}const h=sy;return u}function Ld(u,h,f,p,N){if(Array.isArray(h))for(var k=0;k<h.length;k++)Ld(u,h[k],f,p,N);else p=a(p)?!!p.capture:!!p,f=Vd(f),u&&u[Wt]?(u=u.i,k=String(h).toString(),k in u.g&&(h=u.g[k],f=Zu(h,f,p,N),f>-1&&(Ma(h[f]),Array.prototype.splice.call(h,f,1),h.length==0&&(delete u.g[k],u.h--)))):u&&(u=rl(u))&&(h=u.g[h.toString()],u=-1,h&&(u=Zu(h,f,p,N)),(f=u>-1?h[u]:null)&&nl(f))}function nl(u){if(typeof u!="number"&&u&&!u.da){var h=u.src;if(h&&h[Wt])Xu(h.i,u);else{var f=u.type,p=u.proxy;h.removeEventListener?h.removeEventListener(f,p,u.capture):h.detachEvent?h.detachEvent(xd(f),p):h.addListener&&h.removeListener&&h.removeListener(p),(f=rl(h))?(Xu(f,u),f.h==0&&(f.src=null,h[el]=null)):Ma(u)}}}function xd(u){return u in tl?tl[u]:tl[u]="on"+u}function sy(u,h){if(u.da)u=!0;else{h=new Ze(h,this);const f=u.listener,p=u.ha||u.src;u.fa&&nl(u),u=f.call(p,h)}return u}function rl(u){return u=u[el],u instanceof Ua?u:null}var sl="__closure_events_fn_"+(Math.random()*1e9>>>0);function Vd(u){return typeof u=="function"?u:(u[sl]||(u[sl]=function(h){return u.handleEvent(h)}),u[sl])}function gt(){v.call(this),this.i=new Ua(this),this.M=this,this.G=null}d(gt,v),gt.prototype[Wt]=!0,gt.prototype.removeEventListener=function(u,h,f,p){Ld(this,u,h,f,p)};function Tt(u,h){var f,p=u.G;if(p)for(f=[];p;p=p.G)f.push(p);if(u=u.M,p=h.type||h,typeof h=="string")h=new T(h,u);else if(h instanceof T)h.target=h.target||u;else{var N=h;h=new T(p,u),Fd(h,N)}N=!0;let k,Q;if(f)for(Q=f.length-1;Q>=0;Q--)k=h.g=f[Q],N=Ha(k,p,!0,h)&&N;if(k=h.g=u,N=Ha(k,p,!0,h)&&N,N=Ha(k,p,!1,h)&&N,f)for(Q=0;Q<f.length;Q++)k=h.g=f[Q],N=Ha(k,p,!1,h)&&N}gt.prototype.N=function(){if(gt.Z.N.call(this),this.i){var u=this.i;for(const h in u.g){const f=u.g[h];for(let p=0;p<f.length;p++)Ma(f[p]);delete u.g[h],u.h--}}this.G=null},gt.prototype.J=function(u,h,f,p){return this.i.add(String(u),h,!1,f,p)},gt.prototype.K=function(u,h,f,p){return this.i.add(String(u),h,!0,f,p)};function Ha(u,h,f,p){if(h=u.i.g[String(h)],!h)return!0;h=h.concat();let N=!0;for(let k=0;k<h.length;++k){const Q=h[k];if(Q&&!Q.da&&Q.capture==f){const le=Q.listener,et=Q.ha||Q.src;Q.fa&&Xu(u.i,Q),N=le.call(et,p)!==!1&&N}}return N&&!p.defaultPrevented}function iy(u,h){if(typeof u!="function")if(u&&typeof u.handleEvent=="function")u=l(u.handleEvent,u);else throw Error("Invalid listener argument");return Number(h)>2147483647?-1:o.setTimeout(u,h||0)}function Md(u){u.g=iy(()=>{u.g=null,u.i&&(u.i=!1,Md(u))},u.l);const h=u.h;u.h=null,u.m.apply(null,h)}class oy extends v{constructor(h,f){super(),this.m=h,this.l=f,this.h=null,this.i=!1,this.g=null}j(h){this.h=arguments,this.g?this.i=!0:Md(this)}N(){super.N(),this.g&&(o.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function to(u){v.call(this),this.h=u,this.g={}}d(to,v);var Gd=[];function Ud(u){Ga(u.g,function(h,f){this.g.hasOwnProperty(f)&&nl(h)},u),u.g={}}to.prototype.N=function(){to.Z.N.call(this),Ud(this)},to.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var il=o.JSON.stringify,ay=o.JSON.parse,cy=class{stringify(u){return o.JSON.stringify(u,void 0)}parse(u){return o.JSON.parse(u,void 0)}};function Hd(){}function qd(){}var no={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function ol(){T.call(this,"d")}d(ol,T);function al(){T.call(this,"c")}d(al,T);var Kr={},jd=null;function qa(){return jd=jd||new gt}Kr.Ia="serverreachability";function Jd(u){T.call(this,Kr.Ia,u)}d(Jd,T);function ro(u){const h=qa();Tt(h,new Jd(h))}Kr.STAT_EVENT="statevent";function Kd(u,h){T.call(this,Kr.STAT_EVENT,u),this.stat=h}d(Kd,T);function At(u){const h=qa();Tt(h,new Kd(h,u))}Kr.Ja="timingevent";function zd(u,h){T.call(this,Kr.Ja,u),this.size=h}d(zd,T);function so(u,h){if(typeof u!="function")throw Error("Fn must not be null and must be a function");return o.setTimeout(function(){u()},h)}function io(){this.g=!0}io.prototype.ua=function(){this.g=!1};function uy(u,h,f,p,N,k){u.info(function(){if(u.g)if(k){var Q="",le=k.split("&");for(let Re=0;Re<le.length;Re++){var et=le[Re].split("=");if(et.length>1){const ut=et[0];et=et[1];const Bn=ut.split("_");Q=Bn.length>=2&&Bn[1]=="type"?Q+(ut+"="+et+"&"):Q+(ut+"=redacted&")}}}else Q=null;else Q=k;return"XMLHTTP REQ ("+p+") [attempt "+N+"]: "+h+`
`+f+`
`+Q})}function ly(u,h,f,p,N,k,Q){u.info(function(){return"XMLHTTP RESP ("+p+") [ attempt "+N+"]: "+h+`
`+f+`
`+k+" "+Q})}function ks(u,h,f,p){u.info(function(){return"XMLHTTP TEXT ("+h+"): "+hy(u,f)+(p?" "+p:"")})}function By(u,h){u.info(function(){return"TIMEOUT: "+h})}io.prototype.info=function(){};function hy(u,h){if(!u.g)return h;if(!h)return null;try{const k=JSON.parse(h);if(k){for(u=0;u<k.length;u++)if(Array.isArray(k[u])){var f=k[u];if(!(f.length<2)){var p=f[1];if(Array.isArray(p)&&!(p.length<1)){var N=p[0];if(N!="noop"&&N!="stop"&&N!="close")for(let Q=1;Q<p.length;Q++)p[Q]=""}}}}return il(k)}catch{return h}}var ja={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},Wd={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},Qd;function cl(){}d(cl,Hd),cl.prototype.g=function(){return new XMLHttpRequest},Qd=new cl;function oo(u){return encodeURIComponent(String(u))}function dy(u){var h=1;u=u.split(":");const f=[];for(;h>0&&u.length;)f.push(u.shift()),h--;return u.length&&f.push(u.join(":")),f}function tr(u,h,f,p){this.j=u,this.i=h,this.l=f,this.S=p||1,this.V=new to(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new $d}function $d(){this.i=null,this.g="",this.h=!1}var Yd={},ul={};function ll(u,h,f){u.M=1,u.A=Ka(ln(h)),u.u=f,u.R=!0,Xd(u,null)}function Xd(u,h){u.F=Date.now(),Ja(u),u.B=ln(u.A);var f=u.B,p=u.S;Array.isArray(p)||(p=[String(p)]),hf(f.i,"t",p),u.C=0,f=u.j.L,u.h=new $d,u.g=bf(u.j,f?h:null,!u.u),u.P>0&&(u.O=new oy(l(u.Y,u,u.g),u.P)),h=u.V,f=u.g,p=u.ba;var N="readystatechange";Array.isArray(N)||(N&&(Gd[0]=N.toString()),N=Gd);for(let k=0;k<N.length;k++){const Q=kd(f,N[k],p||h.handleEvent,!1,h.h||h);if(!Q)break;h.g[Q.key]=Q}h=u.J?Nd(u.J):{},u.u?(u.v||(u.v="POST"),h["Content-Type"]="application/x-www-form-urlencoded",u.g.ea(u.B,u.v,u.u,h)):(u.v="GET",u.g.ea(u.B,u.v,null,h)),ro(),uy(u.i,u.v,u.B,u.l,u.S,u.u)}tr.prototype.ba=function(u){u=u.target;const h=this.O;h&&sr(u)==3?h.j():this.Y(u)},tr.prototype.Y=function(u){try{if(u==this.g)e:{const le=sr(this.g),et=this.g.ya(),Re=this.g.ca();if(!(le<3)&&(le!=3||this.g&&(this.h.h||this.g.la()||_f(this.g)))){this.K||le!=4||et==7||(et==8||Re<=0?ro(3):ro(2)),Bl(this);var h=this.g.ca();this.X=h;var f=fy(this);if(this.o=h==200,ly(this.i,this.v,this.B,this.l,this.S,le,h),this.o){if(this.U&&!this.L){t:{if(this.g){var p,N=this.g;if((p=N.g?N.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!y(p)){var k=p;break t}}k=null}if(u=k)ks(this.i,this.l,u,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,hl(this,u);else{this.o=!1,this.m=3,At(12),zr(this),ao(this);break e}}if(this.R){u=!0;let ut;for(;!this.K&&this.C<f.length;)if(ut=Cy(this,f),ut==ul){le==4&&(this.m=4,At(14),u=!1),ks(this.i,this.l,null,"[Incomplete Response]");break}else if(ut==Yd){this.m=4,At(15),ks(this.i,this.l,f,"[Invalid Chunk]"),u=!1;break}else ks(this.i,this.l,ut,null),hl(this,ut);if(Zd(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),le!=4||f.length!=0||this.h.h||(this.m=1,At(16),u=!1),this.o=this.o&&u,!u)ks(this.i,this.l,f,"[Invalid Chunked Response]"),zr(this),ao(this);else if(f.length>0&&!this.W){this.W=!0;var Q=this.j;Q.g==this&&Q.aa&&!Q.P&&(Q.j.info("Great, no buffering proxy detected. Bytes received: "+f.length),El(Q),Q.P=!0,At(11))}}else ks(this.i,this.l,f,null),hl(this,f);le==4&&zr(this),this.o&&!this.K&&(le==4?Af(this.j,this):(this.o=!1,Ja(this)))}else Py(this.g),h==400&&f.indexOf("Unknown SID")>0?(this.m=3,At(12)):(this.m=0,At(13)),zr(this),ao(this)}}}catch{}finally{}};function fy(u){if(!Zd(u))return u.g.la();const h=_f(u.g);if(h==="")return"";let f="";const p=h.length,N=sr(u.g)==4;if(!u.h.i){if(typeof TextDecoder>"u")return zr(u),ao(u),"";u.h.i=new o.TextDecoder}for(let k=0;k<p;k++)u.h.h=!0,f+=u.h.i.decode(h[k],{stream:!(N&&k==p-1)});return h.length=0,u.h.g+=f,u.C=0,u.h.g}function Zd(u){return u.g?u.v=="GET"&&u.M!=2&&u.j.Aa:!1}function Cy(u,h){var f=u.C,p=h.indexOf(`
`,f);return p==-1?ul:(f=Number(h.substring(f,p)),isNaN(f)?Yd:(p+=1,p+f>h.length?ul:(h=h.slice(p,p+f),u.C=p+f,h)))}tr.prototype.cancel=function(){this.K=!0,zr(this)};function Ja(u){u.T=Date.now()+u.H,ef(u,u.H)}function ef(u,h){if(u.D!=null)throw Error("WatchDog timer not null");u.D=so(l(u.aa,u),h)}function Bl(u){u.D&&(o.clearTimeout(u.D),u.D=null)}tr.prototype.aa=function(){this.D=null;const u=Date.now();u-this.T>=0?(By(this.i,this.B),this.M!=2&&(ro(),At(17)),zr(this),this.m=2,ao(this)):ef(this,this.T-u)};function ao(u){u.j.I==0||u.K||Af(u.j,u)}function zr(u){Bl(u);var h=u.O;h&&typeof h.dispose=="function"&&h.dispose(),u.O=null,Ud(u.V),u.g&&(h=u.g,u.g=null,h.abort(),h.dispose())}function hl(u,h){try{var f=u.j;if(f.I!=0&&(f.g==u||dl(f.h,u))){if(!u.L&&dl(f.h,u)&&f.I==3){try{var p=f.Ba.g.parse(h)}catch{p=null}if(Array.isArray(p)&&p.length==3){var N=p;if(N[0]==0){e:if(!f.v){if(f.g)if(f.g.F+3e3<u.F)Ya(f),Qa(f);else break e;_l(f),At(18)}}else f.xa=N[1],0<f.xa-f.K&&N[2]<37500&&f.F&&f.A==0&&!f.C&&(f.C=so(l(f.Va,f),6e3));rf(f.h)<=1&&f.ta&&(f.ta=void 0)}else Qr(f,11)}else if((u.L||f.g==u)&&Ya(f),!y(h))for(N=f.Ba.g.parse(h),h=0;h<N.length;h++){let Re=N[h];const ut=Re[0];if(!(ut<=f.K))if(f.K=ut,Re=Re[1],f.I==2)if(Re[0]=="c"){f.M=Re[1],f.ba=Re[2];const Bn=Re[3];Bn!=null&&(f.ka=Bn,f.j.info("VER="+f.ka));const $r=Re[4];$r!=null&&(f.za=$r,f.j.info("SVER="+f.za));const ir=Re[5];ir!=null&&typeof ir=="number"&&ir>0&&(p=1.5*ir,f.O=p,f.j.info("backChannelRequestTimeoutMs_="+p)),p=f;const or=u.g;if(or){const Za=or.g?or.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Za){var k=p.h;k.g||Za.indexOf("spdy")==-1&&Za.indexOf("quic")==-1&&Za.indexOf("h2")==-1||(k.j=k.l,k.g=new Set,k.h&&(fl(k,k.h),k.h=null))}if(p.G){const Il=or.g?or.g.getResponseHeader("X-HTTP-Session-Id"):null;Il&&(p.wa=Il,Fe(p.J,p.G,Il))}}f.I=3,f.l&&f.l.ra(),f.aa&&(f.T=Date.now()-u.F,f.j.info("Handshake RTT: "+f.T+"ms")),p=f;var Q=u;if(p.na=Pf(p,p.L?p.ba:null,p.W),Q.L){sf(p.h,Q);var le=Q,et=p.O;et&&(le.H=et),le.D&&(Bl(le),Ja(le)),p.g=Q}else Df(p);f.i.length>0&&$a(f)}else Re[0]!="stop"&&Re[0]!="close"||Qr(f,7);else f.I==3&&(Re[0]=="stop"||Re[0]=="close"?Re[0]=="stop"?Qr(f,7):ml(f):Re[0]!="noop"&&f.l&&f.l.qa(Re),f.A=0)}}ro(4)}catch{}}var py=class{constructor(u,h){this.g=u,this.map=h}};function tf(u){this.l=u||10,o.PerformanceNavigationTiming?(u=o.performance.getEntriesByType("navigation"),u=u.length>0&&(u[0].nextHopProtocol=="hq"||u[0].nextHopProtocol=="h2")):u=!!(o.chrome&&o.chrome.loadTimes&&o.chrome.loadTimes()&&o.chrome.loadTimes().wasFetchedViaSpdy),this.j=u?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function nf(u){return u.h?!0:u.g?u.g.size>=u.j:!1}function rf(u){return u.h?1:u.g?u.g.size:0}function dl(u,h){return u.h?u.h==h:u.g?u.g.has(h):!1}function fl(u,h){u.g?u.g.add(h):u.h=h}function sf(u,h){u.h&&u.h==h?u.h=null:u.g&&u.g.has(h)&&u.g.delete(h)}tf.prototype.cancel=function(){if(this.i=of(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const u of this.g.values())u.cancel();this.g.clear()}};function of(u){if(u.h!=null)return u.i.concat(u.h.G);if(u.g!=null&&u.g.size!==0){let h=u.i;for(const f of u.g.values())h=h.concat(f.G);return h}return g(u.i)}var af=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function gy(u,h){if(u){u=u.split("&");for(let f=0;f<u.length;f++){const p=u[f].indexOf("=");let N,k=null;p>=0?(N=u[f].substring(0,p),k=u[f].substring(p+1)):N=u[f],h(N,k?decodeURIComponent(k.replace(/\+/g," ")):"")}}}function nr(u){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let h;u instanceof nr?(this.l=u.l,co(this,u.j),this.o=u.o,this.g=u.g,uo(this,u.u),this.h=u.h,Cl(this,df(u.i)),this.m=u.m):u&&(h=String(u).match(af))?(this.l=!1,co(this,h[1]||"",!0),this.o=lo(h[2]||""),this.g=lo(h[3]||"",!0),uo(this,h[4]),this.h=lo(h[5]||"",!0),Cl(this,h[6]||"",!0),this.m=lo(h[7]||"")):(this.l=!1,this.i=new ho(null,this.l))}nr.prototype.toString=function(){const u=[];var h=this.j;h&&u.push(Bo(h,cf,!0),":");var f=this.g;return(f||h=="file")&&(u.push("//"),(h=this.o)&&u.push(Bo(h,cf,!0),"@"),u.push(oo(f).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),f=this.u,f!=null&&u.push(":",String(f))),(f=this.h)&&(this.g&&f.charAt(0)!="/"&&u.push("/"),u.push(Bo(f,f.charAt(0)=="/"?Ey:_y,!0))),(f=this.i.toString())&&u.push("?",f),(f=this.m)&&u.push("#",Bo(f,yy)),u.join("")},nr.prototype.resolve=function(u){const h=ln(this);let f=!!u.j;f?co(h,u.j):f=!!u.o,f?h.o=u.o:f=!!u.g,f?h.g=u.g:f=u.u!=null;var p=u.h;if(f)uo(h,u.u);else if(f=!!u.h){if(p.charAt(0)!="/")if(this.g&&!this.h)p="/"+p;else{var N=h.h.lastIndexOf("/");N!=-1&&(p=h.h.slice(0,N+1)+p)}if(N=p,N==".."||N==".")p="";else if(N.indexOf("./")!=-1||N.indexOf("/.")!=-1){p=N.lastIndexOf("/",0)==0,N=N.split("/");const k=[];for(let Q=0;Q<N.length;){const le=N[Q++];le=="."?p&&Q==N.length&&k.push(""):le==".."?((k.length>1||k.length==1&&k[0]!="")&&k.pop(),p&&Q==N.length&&k.push("")):(k.push(le),p=!0)}p=k.join("/")}else p=N}return f?h.h=p:f=u.i.toString()!=="",f?Cl(h,df(u.i)):f=!!u.m,f&&(h.m=u.m),h};function ln(u){return new nr(u)}function co(u,h,f){u.j=f?lo(h,!0):h,u.j&&(u.j=u.j.replace(/:$/,""))}function uo(u,h){if(h){if(h=Number(h),isNaN(h)||h<0)throw Error("Bad port number "+h);u.u=h}else u.u=null}function Cl(u,h,f){h instanceof ho?(u.i=h,wy(u.i,u.l)):(f||(h=Bo(h,Iy)),u.i=new ho(h,u.l))}function Fe(u,h,f){u.i.set(h,f)}function Ka(u){return Fe(u,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),u}function lo(u,h){return u?h?decodeURI(u.replace(/%25/g,"%2525")):decodeURIComponent(u):""}function Bo(u,h,f){return typeof u=="string"?(u=encodeURI(u).replace(h,my),f&&(u=u.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),u):null}function my(u){return u=u.charCodeAt(0),"%"+(u>>4&15).toString(16)+(u&15).toString(16)}var cf=/[#\/\?@]/g,_y=/[#\?:]/g,Ey=/[#\?]/g,Iy=/[#\?@]/g,yy=/#/g;function ho(u,h){this.h=this.g=null,this.i=u||null,this.j=!!h}function Wr(u){u.g||(u.g=new Map,u.h=0,u.i&&gy(u.i,function(h,f){u.add(decodeURIComponent(h.replace(/\+/g," ")),f)}))}r=ho.prototype,r.add=function(u,h){Wr(this),this.i=null,u=Ls(this,u);let f=this.g.get(u);return f||this.g.set(u,f=[]),f.push(h),this.h+=1,this};function uf(u,h){Wr(u),h=Ls(u,h),u.g.has(h)&&(u.i=null,u.h-=u.g.get(h).length,u.g.delete(h))}function lf(u,h){return Wr(u),h=Ls(u,h),u.g.has(h)}r.forEach=function(u,h){Wr(this),this.g.forEach(function(f,p){f.forEach(function(N){u.call(h,N,p,this)},this)},this)};function Bf(u,h){Wr(u);let f=[];if(typeof h=="string")lf(u,h)&&(f=f.concat(u.g.get(Ls(u,h))));else for(u=Array.from(u.g.values()),h=0;h<u.length;h++)f=f.concat(u[h]);return f}r.set=function(u,h){return Wr(this),this.i=null,u=Ls(this,u),lf(this,u)&&(this.h-=this.g.get(u).length),this.g.set(u,[h]),this.h+=1,this},r.get=function(u,h){return u?(u=Bf(this,u),u.length>0?String(u[0]):h):h};function hf(u,h,f){uf(u,h),f.length>0&&(u.i=null,u.g.set(Ls(u,h),g(f)),u.h+=f.length)}r.toString=function(){if(this.i)return this.i;if(!this.g)return"";const u=[],h=Array.from(this.g.keys());for(let p=0;p<h.length;p++){var f=h[p];const N=oo(f);f=Bf(this,f);for(let k=0;k<f.length;k++){let Q=N;f[k]!==""&&(Q+="="+oo(f[k])),u.push(Q)}}return this.i=u.join("&")};function df(u){const h=new ho;return h.i=u.i,u.g&&(h.g=new Map(u.g),h.h=u.h),h}function Ls(u,h){return h=String(h),u.j&&(h=h.toLowerCase()),h}function wy(u,h){h&&!u.j&&(Wr(u),u.i=null,u.g.forEach(function(f,p){const N=p.toLowerCase();p!=N&&(uf(this,p),hf(this,N,f))},u)),u.j=h}function Dy(u,h){const f=new io;if(o.Image){const p=new Image;p.onload=B(rr,f,"TestLoadImage: loaded",!0,h,p),p.onerror=B(rr,f,"TestLoadImage: error",!1,h,p),p.onabort=B(rr,f,"TestLoadImage: abort",!1,h,p),p.ontimeout=B(rr,f,"TestLoadImage: timeout",!1,h,p),o.setTimeout(function(){p.ontimeout&&p.ontimeout()},1e4),p.src=u}else h(!1)}function Ty(u,h){const f=new io,p=new AbortController,N=setTimeout(()=>{p.abort(),rr(f,"TestPingServer: timeout",!1,h)},1e4);fetch(u,{signal:p.signal}).then(k=>{clearTimeout(N),k.ok?rr(f,"TestPingServer: ok",!0,h):rr(f,"TestPingServer: server error",!1,h)}).catch(()=>{clearTimeout(N),rr(f,"TestPingServer: error",!1,h)})}function rr(u,h,f,p,N){try{N&&(N.onload=null,N.onerror=null,N.onabort=null,N.ontimeout=null),p(f)}catch{}}function Ay(){this.g=new cy}function pl(u){this.i=u.Sb||null,this.h=u.ab||!1}d(pl,Hd),pl.prototype.g=function(){return new za(this.i,this.h)};function za(u,h){gt.call(this),this.H=u,this.o=h,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}d(za,gt),r=za.prototype,r.open=function(u,h){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=u,this.D=h,this.readyState=1,Co(this)},r.send=function(u){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const h={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};u&&(h.body=u),(this.H||o).fetch(new Request(this.D,h)).then(this.Pa.bind(this),this.ga.bind(this))},r.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,fo(this)),this.readyState=0},r.Pa=function(u){if(this.g&&(this.l=u,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=u.headers,this.readyState=2,Co(this)),this.g&&(this.readyState=3,Co(this),this.g)))if(this.responseType==="arraybuffer")u.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof o.ReadableStream<"u"&&"body"in u){if(this.j=u.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;ff(this)}else u.text().then(this.Oa.bind(this),this.ga.bind(this))};function ff(u){u.j.read().then(u.Ma.bind(u)).catch(u.ga.bind(u))}r.Ma=function(u){if(this.g){if(this.o&&u.value)this.response.push(u.value);else if(!this.o){var h=u.value?u.value:new Uint8Array(0);(h=this.B.decode(h,{stream:!u.done}))&&(this.response=this.responseText+=h)}u.done?fo(this):Co(this),this.readyState==3&&ff(this)}},r.Oa=function(u){this.g&&(this.response=this.responseText=u,fo(this))},r.Na=function(u){this.g&&(this.response=u,fo(this))},r.ga=function(){this.g&&fo(this)};function fo(u){u.readyState=4,u.l=null,u.j=null,u.B=null,Co(u)}r.setRequestHeader=function(u,h){this.A.append(u,h)},r.getResponseHeader=function(u){return this.h&&this.h.get(u.toLowerCase())||""},r.getAllResponseHeaders=function(){if(!this.h)return"";const u=[],h=this.h.entries();for(var f=h.next();!f.done;)f=f.value,u.push(f[0]+": "+f[1]),f=h.next();return u.join(`\r
`)};function Co(u){u.onreadystatechange&&u.onreadystatechange.call(u)}Object.defineProperty(za.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(u){this.m=u?"include":"same-origin"}});function Cf(u){let h="";return Ga(u,function(f,p){h+=p,h+=":",h+=f,h+=`\r
`}),h}function gl(u,h,f){e:{for(p in f){var p=!1;break e}p=!0}p||(f=Cf(f),typeof u=="string"?f!=null&&oo(f):Fe(u,h,f))}function Ue(u){gt.call(this),this.headers=new Map,this.L=u||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}d(Ue,gt);var Ry=/^https?$/i,vy=["POST","PUT"];r=Ue.prototype,r.Fa=function(u){this.H=u},r.ea=function(u,h,f,p){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+u);h=h?h.toUpperCase():"GET",this.D=u,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():Qd.g(),this.g.onreadystatechange=C(l(this.Ca,this));try{this.B=!0,this.g.open(h,String(u),!0),this.B=!1}catch(k){pf(this,k);return}if(u=f||"",f=new Map(this.headers),p)if(Object.getPrototypeOf(p)===Object.prototype)for(var N in p)f.set(N,p[N]);else if(typeof p.keys=="function"&&typeof p.get=="function")for(const k of p.keys())f.set(k,p.get(k));else throw Error("Unknown input type for opt_headers: "+String(p));p=Array.from(f.keys()).find(k=>k.toLowerCase()=="content-type"),N=o.FormData&&u instanceof o.FormData,!(Array.prototype.indexOf.call(vy,h,void 0)>=0)||p||N||f.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[k,Q]of f)this.g.setRequestHeader(k,Q);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(u),this.v=!1}catch(k){pf(this,k)}};function pf(u,h){u.h=!1,u.g&&(u.j=!0,u.g.abort(),u.j=!1),u.l=h,u.o=5,gf(u),Wa(u)}function gf(u){u.A||(u.A=!0,Tt(u,"complete"),Tt(u,"error"))}r.abort=function(u){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=u||7,Tt(this,"complete"),Tt(this,"abort"),Wa(this))},r.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Wa(this,!0)),Ue.Z.N.call(this)},r.Ca=function(){this.u||(this.B||this.v||this.j?mf(this):this.Xa())},r.Xa=function(){mf(this)};function mf(u){if(u.h&&typeof i<"u"){if(u.v&&sr(u)==4)setTimeout(u.Ca.bind(u),0);else if(Tt(u,"readystatechange"),sr(u)==4){u.h=!1;try{const k=u.ca();e:switch(k){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var h=!0;break e;default:h=!1}var f;if(!(f=h)){var p;if(p=k===0){let Q=String(u.D).match(af)[1]||null;!Q&&o.self&&o.self.location&&(Q=o.self.location.protocol.slice(0,-1)),p=!Ry.test(Q?Q.toLowerCase():"")}f=p}if(f)Tt(u,"complete"),Tt(u,"success");else{u.o=6;try{var N=sr(u)>2?u.g.statusText:""}catch{N=""}u.l=N+" ["+u.ca()+"]",gf(u)}}finally{Wa(u)}}}}function Wa(u,h){if(u.g){u.m&&(clearTimeout(u.m),u.m=null);const f=u.g;u.g=null,h||Tt(u,"ready");try{f.onreadystatechange=null}catch{}}}r.isActive=function(){return!!this.g};function sr(u){return u.g?u.g.readyState:0}r.ca=function(){try{return sr(this)>2?this.g.status:-1}catch{return-1}},r.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},r.La=function(u){if(this.g){var h=this.g.responseText;return u&&h.indexOf(u)==0&&(h=h.substring(u.length)),ay(h)}};function _f(u){try{if(!u.g)return null;if("response"in u.g)return u.g.response;switch(u.F){case"":case"text":return u.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in u.g)return u.g.mozResponseArrayBuffer}return null}catch{return null}}function Py(u){const h={};u=(u.g&&sr(u)>=2&&u.g.getAllResponseHeaders()||"").split(`\r
`);for(let p=0;p<u.length;p++){if(y(u[p]))continue;var f=dy(u[p]);const N=f[0];if(f=f[1],typeof f!="string")continue;f=f.trim();const k=h[N]||[];h[N]=k,k.push(f)}ty(h,function(p){return p.join(", ")})}r.ya=function(){return this.o},r.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function po(u,h,f){return f&&f.internalChannelParams&&f.internalChannelParams[u]||h}function Ef(u){this.za=0,this.i=[],this.j=new io,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=po("failFast",!1,u),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=po("baseRetryDelayMs",5e3,u),this.Za=po("retryDelaySeedMs",1e4,u),this.Ta=po("forwardChannelMaxRetries",2,u),this.va=po("forwardChannelRequestTimeoutMs",2e4,u),this.ma=u&&u.xmlHttpFactory||void 0,this.Ua=u&&u.Rb||void 0,this.Aa=u&&u.useFetchStreams||!1,this.O=void 0,this.L=u&&u.supportsCrossDomainXhr||!1,this.M="",this.h=new tf(u&&u.concurrentRequestLimit),this.Ba=new Ay,this.S=u&&u.fastHandshake||!1,this.R=u&&u.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=u&&u.Pb||!1,u&&u.ua&&this.j.ua(),u&&u.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&u&&u.detectBufferingProxy||!1,this.ia=void 0,u&&u.longPollingTimeout&&u.longPollingTimeout>0&&(this.ia=u.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}r=Ef.prototype,r.ka=8,r.I=1,r.connect=function(u,h,f,p){At(0),this.W=u,this.H=h||{},f&&p!==void 0&&(this.H.OSID=f,this.H.OAID=p),this.F=this.X,this.J=Pf(this,null,this.W),$a(this)};function ml(u){if(If(u),u.I==3){var h=u.V++,f=ln(u.J);if(Fe(f,"SID",u.M),Fe(f,"RID",h),Fe(f,"TYPE","terminate"),go(u,f),h=new tr(u,u.j,h),h.M=2,h.A=Ka(ln(f)),f=!1,o.navigator&&o.navigator.sendBeacon)try{f=o.navigator.sendBeacon(h.A.toString(),"")}catch{}!f&&o.Image&&(new Image().src=h.A,f=!0),f||(h.g=bf(h.j,null),h.g.ea(h.A)),h.F=Date.now(),Ja(h)}vf(u)}function Qa(u){u.g&&(El(u),u.g.cancel(),u.g=null)}function If(u){Qa(u),u.v&&(o.clearTimeout(u.v),u.v=null),Ya(u),u.h.cancel(),u.m&&(typeof u.m=="number"&&o.clearTimeout(u.m),u.m=null)}function $a(u){if(!nf(u.h)&&!u.m){u.m=!0;var h=u.Ea;he||m(),ue||(he(),ue=!0),D.add(h,u),u.D=0}}function by(u,h){return rf(u.h)>=u.h.j-(u.m?1:0)?!1:u.m?(u.i=h.G.concat(u.i),!0):u.I==1||u.I==2||u.D>=(u.Sa?0:u.Ta)?!1:(u.m=so(l(u.Ea,u,h),Rf(u,u.D)),u.D++,!0)}r.Ea=function(u){if(this.m)if(this.m=null,this.I==1){if(!u){this.V=Math.floor(Math.random()*1e5),u=this.V++;const N=new tr(this,this.j,u);let k=this.o;if(this.U&&(k?(k=Nd(k),Fd(k,this.U)):k=this.U),this.u!==null||this.R||(N.J=k,k=null),this.S)e:{for(var h=0,f=0;f<this.i.length;f++){t:{var p=this.i[f];if("__data__"in p.map&&(p=p.map.__data__,typeof p=="string")){p=p.length;break t}p=void 0}if(p===void 0)break;if(h+=p,h>4096){h=f;break e}if(h===4096||f===this.i.length-1){h=f+1;break e}}h=1e3}else h=1e3;h=wf(this,N,h),f=ln(this.J),Fe(f,"RID",u),Fe(f,"CVER",22),this.G&&Fe(f,"X-HTTP-Session-Id",this.G),go(this,f),k&&(this.R?h="headers="+oo(Cf(k))+"&"+h:this.u&&gl(f,this.u,k)),fl(this.h,N),this.Ra&&Fe(f,"TYPE","init"),this.S?(Fe(f,"$req",h),Fe(f,"SID","null"),N.U=!0,ll(N,f,null)):ll(N,f,h),this.I=2}}else this.I==3&&(u?yf(this,u):this.i.length==0||nf(this.h)||yf(this))};function yf(u,h){var f;h?f=h.l:f=u.V++;const p=ln(u.J);Fe(p,"SID",u.M),Fe(p,"RID",f),Fe(p,"AID",u.K),go(u,p),u.u&&u.o&&gl(p,u.u,u.o),f=new tr(u,u.j,f,u.D+1),u.u===null&&(f.J=u.o),h&&(u.i=h.G.concat(u.i)),h=wf(u,f,1e3),f.H=Math.round(u.va*.5)+Math.round(u.va*.5*Math.random()),fl(u.h,f),ll(f,p,h)}function go(u,h){u.H&&Ga(u.H,function(f,p){Fe(h,p,f)}),u.l&&Ga({},function(f,p){Fe(h,p,f)})}function wf(u,h,f){f=Math.min(u.i.length,f);const p=u.l?l(u.l.Ka,u.l,u):null;e:{var N=u.i;let le=-1;for(;;){const et=["count="+f];le==-1?f>0?(le=N[0].g,et.push("ofs="+le)):le=0:et.push("ofs="+le);let Re=!0;for(let ut=0;ut<f;ut++){var k=N[ut].g;const Bn=N[ut].map;if(k-=le,k<0)le=Math.max(0,N[ut].g-100),Re=!1;else try{k="req"+k+"_"||"";try{var Q=Bn instanceof Map?Bn:Object.entries(Bn);for(const[$r,ir]of Q){let or=ir;a(ir)&&(or=il(ir)),et.push(k+$r+"="+encodeURIComponent(or))}}catch($r){throw et.push(k+"type="+encodeURIComponent("_badmap")),$r}}catch{p&&p(Bn)}}if(Re){Q=et.join("&");break e}}Q=void 0}return u=u.i.splice(0,f),h.G=u,Q}function Df(u){if(!u.g&&!u.v){u.Y=1;var h=u.Da;he||m(),ue||(he(),ue=!0),D.add(h,u),u.A=0}}function _l(u){return u.g||u.v||u.A>=3?!1:(u.Y++,u.v=so(l(u.Da,u),Rf(u,u.A)),u.A++,!0)}r.Da=function(){if(this.v=null,Tf(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var u=4*this.T;this.j.info("BP detection timer enabled: "+u),this.B=so(l(this.Wa,this),u)}},r.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,At(10),Qa(this),Tf(this))};function El(u){u.B!=null&&(o.clearTimeout(u.B),u.B=null)}function Tf(u){u.g=new tr(u,u.j,"rpc",u.Y),u.u===null&&(u.g.J=u.o),u.g.P=0;var h=ln(u.na);Fe(h,"RID","rpc"),Fe(h,"SID",u.M),Fe(h,"AID",u.K),Fe(h,"CI",u.F?"0":"1"),!u.F&&u.ia&&Fe(h,"TO",u.ia),Fe(h,"TYPE","xmlhttp"),go(u,h),u.u&&u.o&&gl(h,u.u,u.o),u.O&&(u.g.H=u.O);var f=u.g;u=u.ba,f.M=1,f.A=Ka(ln(h)),f.u=null,f.R=!0,Xd(f,u)}r.Va=function(){this.C!=null&&(this.C=null,Qa(this),_l(this),At(19))};function Ya(u){u.C!=null&&(o.clearTimeout(u.C),u.C=null)}function Af(u,h){var f=null;if(u.g==h){Ya(u),El(u),u.g=null;var p=2}else if(dl(u.h,h))f=h.G,sf(u.h,h),p=1;else return;if(u.I!=0){if(h.o)if(p==1){f=h.u?h.u.length:0,h=Date.now()-h.F;var N=u.D;p=qa(),Tt(p,new zd(p,f)),$a(u)}else Df(u);else if(N=h.m,N==3||N==0&&h.X>0||!(p==1&&by(u,h)||p==2&&_l(u)))switch(f&&f.length>0&&(h=u.h,h.i=h.i.concat(f)),N){case 1:Qr(u,5);break;case 4:Qr(u,10);break;case 3:Qr(u,6);break;default:Qr(u,2)}}}function Rf(u,h){let f=u.Qa+Math.floor(Math.random()*u.Za);return u.isActive()||(f*=2),f*h}function Qr(u,h){if(u.j.info("Error code "+h),h==2){var f=l(u.bb,u),p=u.Ua;const N=!p;p=new nr(p||"//www.google.com/images/cleardot.gif"),o.location&&o.location.protocol=="http"||co(p,"https"),Ka(p),N?Dy(p.toString(),f):Ty(p.toString(),f)}else At(2);u.I=0,u.l&&u.l.pa(h),vf(u),If(u)}r.bb=function(u){u?(this.j.info("Successfully pinged google.com"),At(2)):(this.j.info("Failed to ping google.com"),At(1))};function vf(u){if(u.I=0,u.ja=[],u.l){const h=of(u.h);(h.length!=0||u.i.length!=0)&&(I(u.ja,h),I(u.ja,u.i),u.h.i.length=0,g(u.i),u.i.length=0),u.l.oa()}}function Pf(u,h,f){var p=f instanceof nr?ln(f):new nr(f);if(p.g!="")h&&(p.g=h+"."+p.g),uo(p,p.u);else{var N=o.location;p=N.protocol,h=h?h+"."+N.hostname:N.hostname,N=+N.port;const k=new nr(null);p&&co(k,p),h&&(k.g=h),N&&uo(k,N),f&&(k.h=f),p=k}return f=u.G,h=u.wa,f&&h&&Fe(p,f,h),Fe(p,"VER",u.ka),go(u,p),p}function bf(u,h,f){if(h&&!u.L)throw Error("Can't create secondary domain capable XhrIo object.");return h=u.Aa&&!u.ma?new Ue(new pl({ab:f})):new Ue(u.ma),h.Fa(u.L),h}r.isActive=function(){return!!this.l&&this.l.isActive(this)};function Sf(){}r=Sf.prototype,r.ra=function(){},r.qa=function(){},r.pa=function(){},r.oa=function(){},r.isActive=function(){return!0},r.Ka=function(){};function Xa(){}Xa.prototype.g=function(u,h){return new Ut(u,h)};function Ut(u,h){gt.call(this),this.g=new Ef(h),this.l=u,this.h=h&&h.messageUrlParams||null,u=h&&h.messageHeaders||null,h&&h.clientProtocolHeaderRequired&&(u?u["X-Client-Protocol"]="webchannel":u={"X-Client-Protocol":"webchannel"}),this.g.o=u,u=h&&h.initMessageHeaders||null,h&&h.messageContentType&&(u?u["X-WebChannel-Content-Type"]=h.messageContentType:u={"X-WebChannel-Content-Type":h.messageContentType}),h&&h.sa&&(u?u["X-WebChannel-Client-Profile"]=h.sa:u={"X-WebChannel-Client-Profile":h.sa}),this.g.U=u,(u=h&&h.Qb)&&!y(u)&&(this.g.u=u),this.A=h&&h.supportsCrossDomainXhr||!1,this.v=h&&h.sendRawJson||!1,(h=h&&h.httpSessionIdParam)&&!y(h)&&(this.g.G=h,u=this.h,u!==null&&h in u&&(u=this.h,h in u&&delete u[h])),this.j=new xs(this)}d(Ut,gt),Ut.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},Ut.prototype.close=function(){ml(this.g)},Ut.prototype.o=function(u){var h=this.g;if(typeof u=="string"){var f={};f.__data__=u,u=f}else this.v&&(f={},f.__data__=il(u),u=f);h.i.push(new py(h.Ya++,u)),h.I==3&&$a(h)},Ut.prototype.N=function(){this.g.l=null,delete this.j,ml(this.g),delete this.g,Ut.Z.N.call(this)};function Nf(u){ol.call(this),u.__headers__&&(this.headers=u.__headers__,this.statusCode=u.__status__,delete u.__headers__,delete u.__status__);var h=u.__sm__;if(h){e:{for(const f in h){u=f;break e}u=void 0}(this.i=u)&&(u=this.i,h=h!==null&&u in h?h[u]:void 0),this.data=h}else this.data=u}d(Nf,ol);function Of(){al.call(this),this.status=1}d(Of,al);function xs(u){this.g=u}d(xs,Sf),xs.prototype.ra=function(){Tt(this.g,"a")},xs.prototype.qa=function(u){Tt(this.g,new Nf(u))},xs.prototype.pa=function(u){Tt(this.g,new Of)},xs.prototype.oa=function(){Tt(this.g,"b")},Xa.prototype.createWebChannel=Xa.prototype.g,Ut.prototype.send=Ut.prototype.o,Ut.prototype.open=Ut.prototype.m,Ut.prototype.close=Ut.prototype.close,Gm=function(){return new Xa},Mm=function(){return qa()},Vm=Kr,rB={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},ja.NO_ERROR=0,ja.TIMEOUT=8,ja.HTTP_ERROR=6,wc=ja,Wd.COMPLETE="complete",xm=Wd,qd.EventType=no,no.OPEN="a",no.CLOSE="b",no.ERROR="c",no.MESSAGE="d",gt.prototype.listen=gt.prototype.J,vo=qd,Ue.prototype.listenOnce=Ue.prototype.K,Ue.prototype.getLastError=Ue.prototype.Ha,Ue.prototype.getLastErrorCode=Ue.prototype.ya,Ue.prototype.getStatus=Ue.prototype.ca,Ue.prototype.getResponseJson=Ue.prototype.La,Ue.prototype.getResponseText=Ue.prototype.la,Ue.prototype.send=Ue.prototype.ea,Ue.prototype.setWithCredentials=Ue.prototype.Fa,Lm=Ue}).apply(typeof sc<"u"?sc:typeof self<"u"?self:typeof window<"u"?window:{});/*!
* re2js
* RE2JS is the JavaScript port of RE2, a regular expression engine that provides linear time matching
*
* @version v2.8.6
* @author Oleksii Vasyliev
* @homepage https://github.com/le0pard/re2js#readme
* @repository github:le0pard/re2js
* @license MIT
*/var ve,G=(ve=class{},j(ve,"FOLD_CASE",1),j(ve,"LITERAL",2),j(ve,"CLASS_NL",4),j(ve,"DOT_NL",8),j(ve,"ONE_LINE",16),j(ve,"NON_GREEDY",32),j(ve,"PERL_X",64),j(ve,"UNICODE_GROUPS",128),j(ve,"WAS_DOLLAR",256),j(ve,"LOOKBEHIND",512),j(ve,"MATCH_NL",ve.CLASS_NL|ve.DOT_NL),j(ve,"PERL",ve.CLASS_NL|ve.ONE_LINE|ve.PERL_X|ve.UNICODE_GROUPS),j(ve,"POSIX",0),j(ve,"UNANCHORED",0),j(ve,"ANCHOR_START",1),j(ve,"ANCHOR_BOTH",2),ve);const Vs={CASE_INSENSITIVE:1,DOTALL:2,MULTILINE:4,DISABLE_UNICODE_GROUPS:8,LONGEST_MATCH:16,LOOKBEHINDS:512},na=128,sB=new Int32Array(na),iB=new Int32Array(na),ic=65535;for(let r=0;r<na;r++)r>=97&&r<=122?sB[r]=r-32:sB[r]=r,r>=65&&r<=90?iB[r]=r+32:iB[r]=r;var zl,L=(zl=class{static toUpperCase(r){if(r<na)return sB[r];const e=String.fromCodePoint(r).toUpperCase(),t=e.codePointAt(0)>ic?2:1;if(e.length>t)return r;const n=String.fromCodePoint(e.codePointAt(0)).toLowerCase(),s=n.codePointAt(0)>ic?2:1;return n.length>s||n.codePointAt(0)!==r?r:e.codePointAt(0)}static toLowerCase(r){if(r<na)return iB[r];const e=String.fromCodePoint(r).toLowerCase(),t=e.codePointAt(0)>ic?2:1;if(e.length>t)return r;const n=String.fromCodePoint(e.codePointAt(0)).toUpperCase(),s=n.codePointAt(0)>ic?2:1;return n.length>s||n.codePointAt(0)!==r?r:e.codePointAt(0)}},j(zl,"CODES",new Map([["\x07",7],["\b",8],["	",9],[`
`,10],["\v",11],["\f",12],["\r",13],[" ",32],['"',34],["$",36],["&",38],["'",39],["(",40],[")",41],["*",42],["+",43],["-",45],[".",46],["0",48],["1",49],["2",50],["3",51],["4",52],["5",53],["6",54],["7",55],["8",56],["9",57],[":",58],["<",60],[">",62],["?",63],["A",65],["B",66],["C",67],["F",70],["P",80],["Q",81],["U",85],["Z",90],["[",91],["\\",92],["]",93],["^",94],["_",95],["`",96],["a",97],["b",98],["f",102],["i",105],["m",109],["n",110],["r",114],["s",115],["t",116],["v",118],["x",120],["z",122],["{",123],["|",124],["}",125]])),zl),_=class{constructor(r,e=!1){this.data=r,this.isStride1=e,this.SIZE=e?2:3}getLo(r){return this.data[r*this.SIZE]}getHi(r){return this.data[r*this.SIZE+1]}getStride(r){return this.isStride1?1:this.data[r*this.SIZE+2]}get length(){return this.data.length/this.SIZE}};const Um=new Uint8Array(256);for(let r=0,e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-";r<64;r++)Um[e.charCodeAt(r)]=r;const Hm=r=>{const e=[];let t=0,n=0;for(let s=0;s<r.length;s++){let i=Um[r.charCodeAt(s)];t|=(i&31)<<n,(i&32)===0?(e.push(t),t=0,n=0):n+=5}return e},E=(r,e)=>{const t=Hm(r),n=e?t.length/2:t.length/3,s=new Uint32Array(n*3);let i=0,o=0;for(let a=0;a<n;a++)i+=t[o++],s[a*3]=i,i+=t[o++],s[a*3+1]=i,s[a*3+2]=e?1:t[o++];return s},av=r=>{const e=Hm(r),t=new Map;let n=0;for(let s=0;s<e.length;s+=2){n+=e[s];const i=e[s+1],o=i>>>1^-(i&1);t.set(n,n+o)}return t};var oc=class{constructor(r){this.initializer=r,this.cache=new Map}has(r){return r in this.initializer}get(r){if(this.cache.has(r))return this.cache.get(r);const e=this.initializer[r],t=e?e():null;return this.cache.set(r,t),t}},dr,Nt=(dr=class{static get CASE_ORBIT(){return this._CASE_ORBIT||(this._CASE_ORBIT=av("rCgCIgCY+rQI4QiCuuBLgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCCgCBgCBgCBgCBgCBgCBgCB+7OB-BB-BB-BB-BB-BBskQB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BC-BB-BB-BB-BB-BB-BB-BByHBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBDCBBBCBBBCBBCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBxHBCBBBCBBBCBBB3SBmMBkNBCBBBCBBB8MBCBBB6MB6MBCBBC+EB0MB2MBCBBB6MB+MBiGBmNBiNBCBBBmKBikzCBmNBqNBkIBsNBCBBBCBBBCBBB0NBCBBB0NDCBBB0NBCBBByNByNBCBBBCBBB2NBCBBDCBBCwDFCBCBDBCBCBDBCBCBDBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBB9EBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCCBCBDBCBBBhGBvDBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBjICCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBH2iVBCBBBlKBwiVB+jVB+jVBCBBBlMBqEBuEBCBBBCBBBCBBBCBBBCBBB+hVB4hVB8hVBjNB7MC5MB5MCzMC1MB+0yCE5MB20yCC9MBu2yCBwyyCBo0yCChNBlNBo0yCBu-UBi0yCDlNC6-UBpNDrNIu+UDzNCm0yCBzNE0yyCBzNBpEBxNBxNBtEG1NLqxyCBkxyCnFoFrBCBBBCBBDCBBEkIBkIBkICoHHsCCqCBqCBqCCgEC+DB+DBmkOBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCC+BBgCBgCBgCBgCBgCBgCBgCBgCBrCBpCBpCBpCBmjOB-BB8BB-BB-BBgEB-BB-BByBBqgOBsDB-BBtwBB-BB-BB-BBsBBgDBCB-BB-BB-BBeB-BB-BB61OB-BB-BB-DB9DB9DBQB7DBmCE9CBrDBPBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBrFB-EBOBnHB3FB-FCCBBBNBCBBCjIBjIBjIBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB8kMB-BB6kMB-BB-BB-BB-BB-BB-BB-BB-BB-BBokMB-BB-BBkkMBkkMB-BB-BB-BB-BB-BB-BB-BB4jMB-BB-BB-BB-BB-BB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EBCBBBCBoiMBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBJCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBeBCBBBCBBBCBBBCBBBCBBBCBBBCBBBdBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDL-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-C64CgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOCgmOGgmODg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FDg8FBg8FBg8FhVg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBQBQBQBQBQBQDPBPBPBPBPBPjkC7mMB5mMBnmMBjmMBCBlmMB3lMBpiMBk8kCBCBBG-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FD-7FB-7FB-7F6FoglCEsuHRwjlCyDCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCB0DBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBG1DD97OCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQDPBPBPBPBPBPDQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQDPBPBPBPBPBPEQCQCQCQCPCPCPCPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPB0EB0EBsFBsFBsFBsFBoGBoGBgIBgIBgHBgHB8HB8HDQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQCSFPBPBzEBzEBRCxnOFSFrFBrFBrFBrFBREQBQClkOFPBPBnGBnGFQBQCljOCODPBPB-GB-GBNHSF-HB-HB7HB7HBRqJ53OE9tQBrmQH4Bc3BSgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBfBfBfBfBfBfBfBfBfBfBfBfBfBfBfBfECBByZ0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzB34BgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CBCBBBt-UBruHBt+UB1iVBviVBCBBBCBBBCBBB3hVB5-UB9hVB7hVCCBBCCBBI9jVB9jVBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBICBBBCBBECBBN-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOC-lOG-lOzoeCBBBCBBBCBBBCBBBCBBBCBl8kCBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBTCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBnECBBBCBBBCBBBCBBBCBBBCBBBCBBDCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBKCBBBCBBBnglCBCBBBCBBBCBBBCBBBCBBECBBBvyyCDCBBBCBBBgDCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBn0yCB90yCB10yCBh0yCBn0yCCjxyCBzyyCBpxyCBg6BBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBB-CBl0yCBvjlCBCBBBCBBBt2yCBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBhkzCZCBB9a-5Bd-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCm6TCBB7gBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCH-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BmlBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvChDwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCFvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvC1DuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCCuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCCuCBuCBuCBuCBuCBuCBuCCuCBuCCtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCCtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCCtCBtCBtCBtCBtCBtCBtCCtCBtCk2BgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEO-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-D+CgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCL-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-B74CgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BhrVgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BhB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BD1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BtxekCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjC")),this._CASE_ORBIT}static get Print(){return this._Print||(this._Print=new _(E("hB9CBjBLBCpWBDFBFGBCCCBSBCsMBClBBDxBBDCBC2BBJaBFFBSVBC-FBCvBBD6BBDkDBP6BBDwBBDOBCbBDCCBJBGfBIqCBCgFBCHBDBBDVBCGBCEEBCBDIBDBBDDBJFFBCCBDBDYBDCBCFBFBBDVBCGBCBBCBBCBBDCCBDBFBBDCBEIIBCBCIIBPBLCBCIBCCBCVBCGBCBBCEBDJBCCBCCBDQQBCBDLBIGBCCBCHBDBBDVBCGBCBBCEBDIBDBBDCBICBFBBCEBDRBLBBCFBECBCDBEBBCCCBEEBEEBBBELBFEBECBCDBDHHPUBGMBCCBCWBCPBDIBCCBCDBIBBCCBCBBDDBDJBIVBCCBCWBCJBCEBDIBCCBCDBIBBGCBCDBDJBCCBNMBCCBCyBBCCBCFBFPBDZBCCBCRBEXBCIBCDDBFBEFFBEBCCCBGBHJBDCBN5BBFcBmBBBCCCBDBCXBCCCBVBDEBCCCBFBCJBDDBhBnCBCjBBFmBBCjBBCOBCMBmBlGBCGGD4LBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBDfBEZBH1CBDFBD-TBCbBE4CBIVBKXBKTBNMBCCBCBBN9CBDJBHJBHNBCKBH4CBIqBBGlCBLeBCLBFLBFEEBoBBDEBMrBBFZBHKBE9BBDgCBCcBDKBHJBHNBDtBBDLBVsCBClFBJ7BBEOBE9BBGqBBDKBJqBBG1QBDFBDlBBDFBDHBCGCBdBD0BBCOBCNBDFBCSBDCBCIBSXBJuBBSBBDaBCMBEhBBPgBBQrEBF5UBXKBWz4BBD9LBGsBBCGGD3BBIBBPXBKGBCGBCGBCGBCGBCGBCGBCGBC9DBjBZBC4CBN1GBbPBC+BBC1CBDmDBGqBBC9CBC1CBKvBBCszcBE2BBK7KBV3FBJ8GBV7BBEJBH3BBJlCBJLBHzDBMdBEtCBCKBFgBBC2BBKNBDJBDmDBZbBLFBDFBDFBKGBCGBC7BBF9DBDJBHj9KBNWBFwBBloItLBDpDBnBGBNEBGZBCEBCCCBCCBCCBoUBhBpBBHyBBCSBCDBFEBCmEBF9FBEFBDFBDFBDCBEGBCGBOBBDLBCZBCSBCBBCOBDNBjB6DBGCBFsBBE3CBCMBEwBwBBsBBjEcBEwBBQbBFjBBKdBGqBBGdBCkBBFNBrB9EBDJBHjBBFjBBFnBBJzBBMLBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBCnCBJIBxBSBCBBGgBBEaBGaBnB3BBFTBDxBBCBBGHBCCBCcBDCBFJBIIBI-BBhBmBBFLBK1BBEcBDaBGZBIDBNGBxCoCB4ByBBOyBBItBBJJBHlBBEcBJBBxGeBCpBBCCBDBBRFBJIBiBtBBJpBBXZBnBbBVWBKtCBFjBBK9BBCEBOYBIJBH0BBCRBJmBBK-CBCTBMRBCuBB-BGBCCCBCBCOBCKBH6BBGJBHDBCHBDBBDVBCGBCBBCEBCJBDBBDCBDHHGGBDGBEEBMJBCDDClBBCJBCDDCDBCJBCBBJBBe7CBCEBfnCBJJBnF1BBDlBBjBkCBMJBHMBU5BBHJBHTBdaBDOBFWB6F7BBlDyCBNHBDDDBGBCBBCdBCBBDLBKJBnCHBDtBBDKBcnCBJyCBOoCBIJB3CHB5ChBBPJBHIBCsBBCNBLcBEfBDVBCNBqCGBCBBCrBBECCBCCBHBJJBHFBCBBCkBBCBBCFBIJBHrBBFJB3HYBIQBCoBBEcB2CQQBwBBO6cBnDuDBCEBMjGBtyCiDBOvhBBRVBL68DBGmSB61G5BBn2B4RBIeBCJBFwCBCJBHdBDFBLlCBLJBCGBCUBGSBxN5BBnG6CBGYBDYBtBqCBF4BBIQBhCEBMGBK1mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBDDBh7D8HBEzNBHWBQQBQtBBDWBKzDB9B1HBLmBBDpCBJvDBWlCB7DTBNTBN2CBKYBoE0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBD9VBQEBCOBxiBeBHFB2GGBCQBDGBCBBCEBG9BBiBxDxDBrBBENBDJBFBBhKeBS5BBGxOxOBoBB3GqBBFhGhGBdBCVBJBBhHGBCDBCBBCOBCkGBDPBqBrCBFJBFBByYjCBtC8BBjGDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBBvIrBBFjDBNOBDOBCOBCkBBLtFB5BcBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBCmDBmgB-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIBnkzVvHB",!1))),this._Print}static get Upper(){return this.CATEGORIES.get("Lu")}},j(dr,"_CASE_ORBIT",null),j(dr,"_Print",null),j(dr,"CATEGORIES",new oc({C:()=>new _(E("AfBgDgBBOrWrWBHHBCBICCVuMuMnBBBzBBBE4B4BBGBcDBHQBXhGhGxBBB8BBBmDNB8BBByBBBQddBCCMEBhBGBsCiFiFJBBDBBXIICCBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBPMMBEB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKMMBDBbEByBPBDBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBjoIBvLBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCB-FCBHBBHBBHBBECBIIIBLBDBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIB-BGGBLBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMBxhBPBXJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBF-6DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBrCHBxDUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIlkzVBxHvw-FB",!1)),Cc:()=>new _(E("AfgDgB",!0)),Cf:()=>new _(E("tFzqBzqBBEBXhGhGyBhMhMBxCxCs5D9-B9-BBDBbEByBEBCJBw03B6H6HBBBimEQQj7IPBhjiBDBwmFHBn0rYffB+CB",!1)),Cn:()=>new _(E("4bBBHDBICCVuMuMnBBBzBBBE4B4BBGBcDBHKBvI9B9BBmDmDBMB8BBByBBBQddBCCMEBjBEBuHJJBDDBXXICCBBBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBbFB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKmDmDNBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBDBvzIBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCC-FCBHBBHBBHBBECBIIIBIBGBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIBlCJBCBBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMB3iBJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBJ76DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBjGUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIm8yVBCdBhD-DBxHvw-BB---BBB---BBB",!1)),Co:()=>new _(E("gg4B-nGh4hc9--BD9--B",!0)),Cs:()=>new _(E("gg2B--B",!0)),L:()=>new _(E("hCZBHZBwBLLFGGBVBCeBCpOBFLBPEBICCiEEBCBBDDBCHHCCBCCCBSBCyCBCqEBJlFBClBBDHHBnBBoCaBFDBuBqBBkBBBCiDBCQQBIIBLLBBBDRRCdBe4CBMZZBfBKBBFGGBUBFKKEYYBXBIKBGXBCGBRpBB7B1BBETTIJBQPBFHBDBBDVBCGBCEEBCBERROBBCCBPBBLJJBEBFBBDVBCGBCBBCBBCBBgBDBCUUBBBRIBCCBCVBCGBCBBCEBETTQBBYMMBGBDBBDVBCGBCBBCEBEffBCCBBBQSSCFBECBCDBEBBCCCBEEBEEBBBELBX1B1BBGBCCBCWBCPBEbbBBBCBBDBBfFFBGBCCBCWBCJBCEBEffBBBCBBQBBSIBCCBCoBBDRRGCBJCBZFBGRBEXBCIBCDDBFB7BvBBCBBNGB7BBBCCCBDBCXBCCCBIBCBBKDDBDBCWWBCBhBgCgCBGBCjBBcEB0DqBBVRRBEBFDBEEEBIIBBBFMBNSSBkBBCGGDqBBCsKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPBR1CBDFBErTBDQBCZBGqCBHHBIRBOSBPRBPMBCCBQzBBkBFFkC4CBIEBDhBBCGGBkCBLeByBdBDEBMrBBFZB3BWBK0BBzC+C+CBtBBSHB3BdBOBBLrBBbjBBqBCBLjBBDKBGqBBDCBqBDBCFBCBBEGGB+FBhC1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGB1DOORMBmDFFDJBCEEBDBHGCBCBCKBDDBGEBF1B1BB8zC8zCBjHBHDBEBBNlBBCGGD3BBIRRBVBKGBCGBCGBCGBCGBCGBCGBCGBxC2O2OBrBrBBDBGBBF1CBHCBC5CBCDBGqBBC9CBSfBxBPBhQ-tGBhCs0VBkCtBBDsIBEPBLBBVuBBReBDlCByBIBDmDBDxCBVQBCCBCDBCWBezBBPxBB-BFBECCBMMBaBLWBacBIuBBdRRBDBCJBLEBCoBBYCBCHBVWBEEEBwBBCEEBDDBDBDCCZCBDKBICBNFBDFBDFBKGBCGBCqBBCNBHyDBej9KBNWBFwBBloItLBDpDBnBGBNEBGCCBIBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBlBZBHZBM4CBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmMcBEwBBwBfBOTBCHBHlBBLdBDjBBFHBxB9EBTjBBFjBBFnBBJzBBNKBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCQQBCBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4ByBBOyBBOjBBnBbBKWB7HpBBHBBRFB5BcBLJJBUBrBRBvBUBcWBN0BB6BBBDOOBrBBhBYBbjBBeDDJiBBENNBuBBPDBWCCkBRBCYBUBBgCGBCCCBCBCOBCJBIuBBnBHBDBBDVBCGBCBBCEBETTNEBfJBCDDClBBCaaCtBtBBzBBTDBVCBfvBBVBBC5F5FBtBBqBDBlBvBBV8B8BBpBBOoCoCBZBmBGB6FrBB1D-BBgBHBDDDBGBCBBCXBQCC-CHBDmBBRCCdLLBmBBIWWMtBBUTTBnCBoGgBBgBIBCkBBSyByBBcBxDGBCBBClBBWaaBEBCBBCfBPYYBqBBlISBQCCBLBChBB9DwCwCB4cBnHjGBtyCgDBQvhBBSFBa68DBGmSB61GdBj3B4RBIeBSuCBSdBTvBBRDBgBUBGSBxNsBB0G-BBhBYBDYBtBqCBGjCjCBLBhCBBCPPBNNB0mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBn7F0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BeBHFBmI9BBzEsBBLGBRiKiKBcBTrBBlPbBlHdBDwGwGBdBCCBCBBCGBDEBKBBhHGBCDBCBBCOBCkGB8BjCBI1lB1lBBCBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQBlqE-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),LC:()=>new _(E("hCZBHZB7BLLBVBCeBCiGBCDBFvGBDZBhGDBDBBECBCHHCCBCCCBSBCyCBCqEBJlFBClBBKoBB44ClBBCGGDqBBDCBhV1CBDFBjkCKBGqBBDCBhCrBBgCMBChBBmD1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGBmIFFDJBCEEBDBHGCBCBCFBFDDBCBGEBF1B1BB8zC8zCB6DBDmDBHDBEBBNlBBCGGzoetBBTbBnEtCBCWBEDBCsCBZBBE2Z2ZBpBBGIBIvCBh6TGBNEBqgBZBHZBmlBvCBhDjBBFjBB1DKBCOBCGBCBBCKBCOBCGBCBBk2ByBBOyBB+CVBLVB74C-BBhrV-BBhBYBDYBtpZ0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BJBCTBHFB2uCjCB",!1)),Ll:()=>new _(E("hDZB7BqBqBBWBCHBC2BCBQCBuBCDECBBBDCCDEEBFFDEEBBBDDDCCCDCCBCCDEECDDBDDBBBHGDCOCBSCBDDCEEC4BCBFBDDDBCCFICBjCBDZBiGCCEEEBBBTccBhBBCBBECBCWCBDBCGDB0B0BBuBBCgBCK0BCDMCBgDCxBoBBo6CqBBDCB5XFBjkCIBC2D2DBqBBgCMBChBBnD0ECBHBCgDCBHBJFBLHBJHBJFBLHBJHBJNBDHBJHBJHBJEBCBBHEEBBBCBBJDBDBBJHBLCBCBBzIEEBEEcKFDBBJDBF2B2Bs1CvBBCEEBGCFCCBCCBEBGiDCBIICFFNlBBCGG0oesBCUaCoEMCBBBC+BCBGBCCCDICFCCDCCBBBCSCGGGCMCFCCDOCbEE2ZqBBGIBIvCBh6TGBNEBqhBZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBnqZZBbGBCRBbZBbDBCCCBFBCKBbZBbZBbZBbZBbZBbZBbZBbZBbbBdYBCFBbYBCFBbYBCFBbYBCFBbYBCFBC15B15BBIBCTBHFB4vChBB",!1)),Lm:()=>new _(E("wVRBFLBPEBICCmEGG-OnHnHlFBBuIBBFgBgBKEEhFoFoF1mBgEgE2R72B72BsDkTkTxOFBvF+BBOjBjBBjBByVOORMBg-CBByHgGgG2OsBsBBDBGiDiDB+C+CBBB34bjnBjnBBEBvIzDzDdBB6DIBxCYYpDDBEBB2OXXqEtDtDWBBoDDBKngVngVuBBBh-BFBCpBBCIB0sBhBhB2K04D04DnrTDB9PCBpBBBnRMBhCBBCPPB9-P9-PBCBCGBCBByhM9BBqGGBud0Q0QsSAB",!1)),Lo:()=>new _(E("qFQQhIFFBCBxGBB7ZaBFDBuBfBCJBkBBBCiDBCZZBLLBBBDRRCdBe4CBMZZBfBWVBrBYBIKBGXBCGBRoBB8B1BBETTIJBROBFHBDBBDVBCGBCEEBCBERROBBCCBPBBLJJBEBFBBDVBCGBCBBCBBCBBgBDBCUUBBBRIBCCBCVBCGBCBBCEBETTQBBYMMBGBDBBDVBCGBCBBCEBEffBCCBBBQSSCFBECBCDBEBBCCCBEEBEEBBBELBX1B1BBGBCCBCWBCPBEbbBBBCBBDBBfFFBGBCCBCWBCJBCEBEffBBBCBBQBBSIBCCBCoBBDRRGCBJCBZFBGRBEXBCIBCDDBFB7BvBBCBBNFB8BBBCCCBDBCXBCCCBIBCBBKDDBDBYDBhBgCgCBGBCjBBcEB0DqBBVRRBEBFDBEEEBIIBBBFMBNyDyDBnKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPByDrTBDQBCZBGqCBHHBIRBOSBPRBPMBCCBQzBBpBkCkCBhBBC0BBIEBDhBBCGGBkCBLeByBdBDEBMrBBFZB3BWBK0BBxFuBBSHB3BdBOBBLrBBbjBBqBCBLdByDDBCFBCBBE7hB7hBBCB4-C3BBZWBKGBCGBCGBCGBCGBCGBCGBCGBoR2B2BF1CBJCCB4CBFGGBpBBC9CBSfBxBPBhQ-tGBhC0wUBC2jBBkCnBBJrIBFPBLBBjCyByBBkCBqFoDoDEGBCCBCDBCWBezBBPxBB-BFBECCBMMBaBLWBacBIuBBuBEBDIBLEBCoBBYCBCHBVPBCFBEEEBwBBCEEBDDBDBDCCZBBEKBIPPBEBDFBDFBKGBCGByEiBBej9KBNWBFwBBloItLBDpDBkCCCBIBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBqDJBCsBBDeBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmMcBEwBBwBfBOTBCHBHlBBLdBDjBBFHBhEtCBjDnBBJzBB9CzBBN2JBKVBLHB5EFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCQQBCBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4FjBBnBDBCxJxJBoBBHBBRCBCBB5BcBLJJBUBrBRBvBUBcWBN0BB6BBBDOOBrBBhBYBbjBBeDDJiBBENNBuBBPDBWCCkBRBCYBUBBgCGBCCCBCBCOBCJBIuBBnBHBDBBDVBCGBCBBCEBETTNEBfJBCDDClBBCaaCtBtBBzBBTDBVCBfvBBVBBC5F5FBtBBqBDBlBvBBV8B8BBpBBOoCoCBZBmBGB6FrBB0GHBDDDBGBCBBCXBQCC-CHBDmBBRCCdLLBmBBIWWMtBBUTTBnCBoGgBBgBIBCkBBSyByBBcBxDGBCBBClBBWaaBEBCBBCfBPYYBnBBCBBlISBQCCBLBChBB9DwCwCB4cBnHjGBtyCgDBQvhBBSFBa68DBGmSB61GdBj3B4RBIeBSuCBSdBTvBB0BUBGSB0NnBB2MqCBGwFwFB0mHBqBfBiDyDBuwIiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBxzI2P2PBrBBiBiKiKBcBTrBBlPaBmHdBDwGwGBdBCCBCBBCGBDEBKiHiHBFBCDBCBBCOBCkGB8pBDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQBlqE-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),Lt:()=>new _(E("lOGDnB2sH2sHBGBJHBJHBNQQwBAB",!1)),Lu:()=>new _(E("hCZBmDWBCGBiB2BCDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIJDCMCDQCDDDCCBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBDDBBBEWCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBpCDBNDBNDBNEBMDBnIFFECBDCBDEEBDBHGCBCBDDBLBBG+B+B9zCvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoqZZBbZBbZBbCCBGDBDDBCBCHBbZBbBBCDBDHBCGBcBBCDBCEBCEEBFBcZBbZBbZBbZBbZBbZBfYBiBYBiBYBiBYBiBYBiB2pE2pEBgBB",!1)),M:()=>new _(E("gYvDB0IGBoIsBBCCCBCCBCCpCKBxBUBRmDmDBFBDFBDBBCDBkBffBZB8CKB7BIBKZZBCBCIBCCBCEBsBCB8BIBrBXBCgBB3BCBCRBCGBLBBeCB5BCCBFBDBBDCBKLLBbbDCB5BCCBDBFBBDCBEffBEEMCB5BCCBGBCCBCCBVBBXFBCCB5BCCBFBDBBDCBICBLBBf8B8BBDBECBCDBKpBpBBDB4BCCBFBCCBCDBIBBMBBeCB5BCCBFBCCBCDBIBBMBBQNNBCB4BBBCGBCCBCDBKLLBeeBBBnCFFBEBCCCBGBTBB+BDDBFBNHBjDDDBHBMGBqCBBcECFBByBTBCBBGKBCjBBKlDlDBSBYDBFCBCCBDGBEDBOLBCLLBCBgWCBzdDBdCBeBBfBBhCfBKuBuBBBBC2D2DBjBjB3DLBFLB8GEB6BJBCcBDxBxBBsBBDLBVEBwBQBnBIBNCBfMB5BNBxBTB5ECBCUBFHHDCBnG-BBxWgBB--CCBuEhDhDBeBrRFBqDBB1udDBCJBhBBBxCBBxIEEFYYBDBF0C0CBzBzBBQBbRBOnBnBBGBaMBtBDBwBNBlBkCkCBMBNJJBuBuBBBBzBCCBBBDBBGBBCqBqBBDBGBBtHHBCBBx5TiXiXBOBRPBuejHjH2EEBn0BCBCBBGDBpBCBFmFmFB+R+RBCBiCEB+JBBuCFBnCKByBDB7DCB2BOBqBDDBLLBCBuBKBI+B+BBBBlBNBRBBtBNNBBBxBNBJDBCBB9CLBHDD+ELBWDB4BBBCGBDBBDCBKLLBDDBFBEEBkCIBCDDCDBCEBCPPBzCzCBQBYyCyCBSBsHGBDIBcBBzCQBrDMBmDOBhIOB2HFBCBBDDBCCCBuEuEBFBDGBEddBIBpBGBCDBJKKBJBvBPBnGHBoGHBCHBzCVBCNB7DFBECCBCCBFBCjCjCBDBCBBCEB8KDBKBBCxBxBBFBEEBYmnFmnFHOBpmLRBhuCEB8BGB5gBCCB1BBIDByCMMBslTslTBizEizEBsBBDWB-QEBEFBJHBDGBfDB1ECB89B2BBFxBBJPPXEBCOBxqBGBCQBDGBCBBCEBlDhFhFBFB4L+B+BBCB9PDB-HBB0HDDIBBG7O7OBFBuDGB29lYvHB",!1)),Mc:()=>new _(E("joC4B4BDCBJDBCBBzBBB7BCBHBBDBBLsBsB7BCBjC7B7BBBBJCCB2B2BB7B7BCHHBDDBLLnDBBCBBECBCCBLqBqBBBB+BDB+BBB7BCCBDBDBBCBBKBBdPPB7B7BBBBGCBCCBLrBrBBsCsCBBBHHBTBBrKBBgCsFsFBFFHDDBaaBLLBBBDGBWBBDFBDLLBBB5zBffiEIIBGBCBB7KDBDCBFBBCFBhHBB7BCCKCCBJJBEByExBxBGCCBDBCBB+BffFBBD9B9BDCBCEEBxBxBBGBJBBsFWW35EBB0-dBBD5C5CBzBzBBOBvEBBwBxBxBBFFBDDBBBvDBBDBBZuBuBCuDuDDBBGuHuHBCCBCCBCC0gZCCgEuBuBBBBFBB0DZZB8B8BxBCBKBBO+C+CBBBEBBCrFrFBBBgBBB7BBBCDBDBBDCBKLLB1C1CBBBIDDCDBCBBCmDmDBBBJBBErDrDBBBHCCBCBDuHuHBBBHDBDyDyDBBBJBBCuDuDCBBHoDoDCBBFmImIBBBK4H4HBEBCBBFDDCvEvEBBBJDBF1C1CeBB-BqGqGECCoGPPrDIID2G2GBDBFBBC-K-KBNNxBBBJBBCpvQpvQBBBlxD2BBpDBB0rYBBHFB",!1)),Me:()=>new _(E("okBBB1xF-wB-wBBCBCCBsshBCB",!1)),Mn:()=>new _(E("gYvDB0IEBqIsBBCCCBCCBCCpCKBxBUBRmDmDBFBDFBDBBCDBkBffBZB8CKB7BIBKZZBCBCIBCCBCEBsBCB8BIBrBXBCfB4BCCFHBFEEBFBLBBe7B7BFDBJVVBbbDBB6BFFBFFBDDBBBEffBEEMBB6BFFBDBCBBFVVBXXBEBC7B7BDCCBCBJIIBMMBff+BNNzBEE4BCCBBBGCBCDBIBBMBBe7B7BDHHGBBVBBdBB6BBBFDBJVVBeepCIIBBBC7C7CDGBNHBjDDDBHBMGBqCBBcEC4BNBCEBCBBGKBCjBBKnDnDBCBCFBCBBDBBaBBFCBRDBODDBHHQgWgWBBBzdCBeBBfBBfBBhCBBCGBJDDBJBKuBuBBBBC2D2DBjBjB3DCBFBBKHHBBB8GBBD7B7BCGBCCCDHBHJBDxBxBBMBCeBDLBVDBxBCCBDBCGGpBIBNBBhBDBDBBCCB5BCCBEECCB7BHBDBB5ECBCMBCGBFHHEBBnG-BBxWMBFEEBKB--CCBuEhDhDBeBrRDBsDBB1udFFBIBhBBBxCBBxIEEFaaBGG4EBBbRBOnBnBBGBaKBvBCBxBDDBCBDBBoBkCkCBEBDBBDBBNJJwB0B0BCCBDBBGBBCrBrBBJJvHDDFx5Tx5TiXPBRPBuejHjH2EEBn0BCBCBBGDBpBCBFmFmFB+R+RBCBiCEB+JBBuCFBnCKByBDB8D3B3BBNBqBDDBLLBBByBDBDBBI+B+BBBBlBEBCHB-BNNB1B1BBHBLDBDgDgDBBBDCCBHHD+E+EEHBWBB6BBBEmBmBBFBEEBnCFBOECPBB2CHBDCBCYY1CFBCFFBCCBvHvHBCBHBBCBBcBB2CHBDCCBrDrDCDDBEBCmDmDCDDBCBCEBkIIBCBBhIBBCFFxEDBDBBFhBhBBIBpBFBDDBJKKBEBDCBvBMBCBBnGCCBBBCqGqGBFBCFBCzCzCBUBDGBCBBCBB7DFBECCBCCBFBCpCpCBEEC8K8KBMMB1B1BBDBGCCYmnFmnFHOBpmLLBECBhuCEB8BGB5gBgCgCBCByC5lT5lTBizEizEBsBBDWBhRCBSHBDGBfDB1ECB89B2BBFxBBJPPXEBCOBxqBGBCQBDGBCBBCEBlDhFhFBFB4L+B+BBCB9PDB-HBB0HDDIBBG7O7OBFBuDGB29lYvHB",!1)),N:()=>new _(E("wBJB5DBBGDDBBBitBJBnEJBnGJB9MJB3DJBFFBtDJB3DJB3DJBDFBvDMB0DJBJGBoDJBpDGBISBuDJBhDJB3DJBnCTBtIJBnCJBwWTBybCBwHJBHJBXJBtJJBhEKBmFJBHJB3FJB3CJBnEJBHJB3gBEEBEBHJBnGyBBDEB3W7BBvCVB3TdBqrBqYqYaIBPCB4KDBrEJBfHBCOBhBJBoBOBh7cJB9FJBhKFB7EJBnBJBnGJBXJB3CJB3MJB34UJBuPsBBN4BBSBB2KaBlBDBeJJnEEBrGJBvdHBaGBoBIBsCEBXFBhFBBDPBDtBBhCIB1BBBfCBsCEBpDHBZHBqBGBrKFBxBJBHJB3IeB-EJBrBDBxDGBnEdBhEJB9BJBxEJBITB8HJB3KJB3DJB3LJBnDJBHTBtCLBlNSB+CJB3UJB3CcBkHJBnCJB3BJBnLJBnDUBshBuDBimPJBnpCJB3CJBnEJBCGBvQJBnIWB+KCB6nXJBnuBTBNTBtDYB2iBxBBhqCJBnNJB3PJB4HJBtWIBhEJB4Y6BBCCBCDBtCsBBCOBjeMBk3CJB",!1)),Nd:()=>new _(E("wBJnxBJnEJnGJ9MJ3DJ3DJ3DJ3DJ3DJ3DJ3DJ3DJ3DJhDJ3DJnCJ3IJnCJn6BJnBJtJJhEJnFJHJ3FJ3CJnEJHJnuiBJnVJnBJnGJXJ3CJ3MJ34UJnsBJnkCJHJ9YJhEJ9BJxEJ3IJ3KJ3DJ3LJnDJHTtCJnNJnDJ3UJ3CJ3HJnCJ3BJnLJ3uQJnpCJ3CJnEJ3QJ37XJ12CxBhqCJnNJ3PJ4HJ2aJ30EJ",!0)),Nl:()=>new _(E("u3FCBwzCiBBDDB-zDaaBHBPCBs1dJBxyW0BBtOJJnEEBrhIuDBm8SCB",!1)),No:()=>new _(E("yFBBGDDBBB2pCFB5LFB5DCBmEGB6GGBSIByNJB2hBTB0jBJBhP20B20BEFBHJBnGPBqB3W3WB6BBvCVB3TdBqrB1kB1kBBCBrEJBfHBCOBhBJBoBOBxrdFBymWsBBiCDBSBB2KaBlBDB1pBHBaGBoBIBsCEBXFBhFBBDPBDtBBhCIB1BBBfCBsCEBpDHBZHBqBGBrKFBhLeB-EJBrBDBxDGBnETB8LTBmqBBBvNIBobSB0aUBn8SGB-YWBqhZTBNTBtDYBvqFIBid6BBCCBCDBtCsBBCOBjeMB",!1)),P:()=>new _(E("hBCBCFBCDBLBBEBBbCBCccCkBkBGEELBBEEE-VJJzOFBqBBB0BCCDDDtBBBVBBCBBOCCBBBrCDBnDsBsBBMBqHCB3BOBgBmImIBLLtE5D5D6DnMnMNwLwL7CLLBpFpFBNBCmBmBBCBoCrCrCBDBFBBwDFBsFlTlTBHB4EuTuTtBBBvCCBoCBB+ECBCCBmBKB6JBB5GBBhEGBCFBhFBBLGBdCB9DDB8BEB-BBBhCHBM9Z9ZBWBJTBCMBCLBfBBPBB6TDBeBB+hBNBwCBBgBJB0MVBgCDBhBBB8XDBCBBxDwEwEBtBBCfBDLBkNCBFJBDLBRNNjD7C7CjgdBBuICBkDLL0DFB9LDB3CBBpBCBCyByBBwBwBiDMBRBB9DDB-DBBRBB6HzqUzqUBxGxGBIBXiBBCNBCFFCBB2ECBCFBCDBLBBEBBbCBCccCCCBFB7MCB9UxBxB-MoXoXoGgBgBxIIBnBxDxDBFBjCGB6CDByO-J-JjBlElEBDBtBDB+FGBuDBBCDB-DDBxBBBwCDBFOOCCB5CFBsDrJrJBCCBzDzDBDBLBBCpDpD7HWBqDCBdMBtCjEjEBBB9HpIpIBBB8E9C9CBGB0CCBCEB+CJB4GgDgDBDBrBBBmUBBrCMBwFxjBxjBBDB97CBB8zOBBmEiCiCBDBJpRpRBBBoJDBoK9lT9lTovHEB07C-a-aBAB",!1)),Pc:()=>new _(E("-Cg-Hg-HBUU-u3BBBZCBwHAB",!1)),Pd:()=>new _(E("tB9qB9qB0BiyDiyDmgBqgCqgCBEBiwDDDgBBBFdd-NUUwDxszBxszBBmBmBLqFqFhzD-J-J",!1)),Pe:()=>new _(E("pB0B0BgB+1D+1DC-6B-6BqtC4B4BQ7T7TCff-hBMCxChBhBCGC1MUChCCCiBmhBmhBCECtBGCtNICEGCDBB-ozB6G6GeOCESSCCCrF0B0BgBGD",!1)),Pf:()=>new _(E("7F+6H+6HEddpuDCCFDDQEE",!1)),Pi:()=>new _(E("rFt7Ht7HDBBDaapuDCCFDDQEE",!1)),Po:()=>new _(E("hBCBCCBDECBLLBEEBcclCGGPBBI-V-VJzOzOBEBqB3B3BDDDtBBBVBBCBBOCCBBBrCDBnDsBsBBMBqHCB3BOBgBmImIBLLtE5D5D6DnMnMNwLwL7CLLBpFpFBNBCxDxDrCEBFBBwDFBsFlTlTBHBmY9D9DBBBoCBB+ECBCCBmBFBCDB6JBB5GBBhEGBCFBhFBBLGBdCB9DDB8BEB-BBBhCHBMjajaBJJBGBJIBDDBDCBEKBCCCBIB7kDDBCBBxDwEwEBFFBBBDDDBHBCBBCDDBLLBDBCJBDDBCCCBLBDCBtNCB6B+F+FjgdBBuICBkDLL0DFB9LDB3CBBpBCBCyByBBwBwBiDMBRBB9DDB-DBBRBB6HlxUlxUBFBDXXVBBDDBECBCDBICBHCCB2E2EBBBCCBDECBLLBEEBcclBDDB7M7MBBB9UxBxB-MoXoXoGgBgBxIIBnBxDxDBFBjCGB6CDB0ZlElEBDBtBDB+FGBuDBBCDB-DDBxBBBwCDBFOOCCB5CFBsDrJrJBCCBzDzDBDBLBBCpDpD7HWBqDCBdMBtCjEjEBBB9HpIpIBBB8E9C9CBGB0CCBCEB+CJB4GgDgDBDBrBBBmUBBrCMBwFxjBxjBBDB97CBB8zOBBmEiCiCBDBJpRpRBBBoJDBoK9lT9lTovHEB07C-a-aBAB",!1)),Ps:()=>new _(E("oBzBzBgB-1D-1DC-6B-6B-rCEEnB4B4BQ7T7TCff-hBMCxChBhBCGC1MUChCCCiBmhBmhBCECaTTCECtNICEGCDipzBipzB4GeeCMCESSCCCrFzBzBgBEEDAB",!1)),S:()=>new _(E("kBHHRCBgBCCcCCkBEBCBBDCCBCBDEEfgBgBrODBNNBGGBCCCBPB2DPPBxDxDsErIrIBBB3DCBDDDBvGvGLUUB4H4HIBBpEqLqLBHHB2H2H-DjEjEBGBlEwGwGqBmGmGiGCBQCCBBBDFBVECmEHBCFBCBBGDBmGBBxXJB0WuLuLlL+E+EBgBBiLJBKIBhiBCCBBBMCBOCBOCBOBBmCOOoBCBOCBUhBB-BBBCDBCBBLCCBBBGFBCECFMMBFFBDBGDBC7B7BBFFB2LBFcBD+HBXKByCtCBXnTBtBwBBDeBLyMBX+BBFfBD1LBDpEBmHFBmLBBvBZBC4CBN1GBbPBFOOBNNWBBHBB8CBB0HBBFJBhBlBBKRRBdBMdBJQQBeBLmBBQ-JBhuG-BBx0V2BB6RWBKBBoDBB+EDBLDB+RCBiHPPB+9T+9TpEgBBuLPBhCBB3BHBtBDBjDCCBBBD7E7EHRRBBBgBCCcCCiEGBCGBOBB6JIB6BQBDCBCMBEwBwBBrBB7zBBBwSmWmWBiKiKBGBnjC2kC2kCBbBr6SDBG3qU3qUk7DvHBLCBEzNBHWBQQBgDzDB9B1HBLmBBD7BBGCBXBBIdBF8BBWhCBE7F7FB1CBrbaagBaagBaagBaagBaa9B-PB4BDBzBHBCNBCBBp2BwNwNttCEE+DiOiOBvIvIBqBBFjDBNOBDOBCOBCkBBYgFB5BcBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBC7CBLAB",!1)),Sc:()=>new _(E("kB+D+DBCBqnB8D8DzPBBzPBBI2H2HoImSmS8sClmClmCBgBB37hBkuVkuVtD7E7E8GBBEBB3-HDB-4wBxtCxtC",!1)),Sk:()=>new _(E("+CCCoCHHFEEqQDBNNBGGBCCCBPB2DPPBjoBjoB15FCCBBBMCBOCBOCBOBB9kEBBkzdWBKBBoDBBxePPBniUniUBPB8bCCjF4g9B4g9BBDB",!1)),Sm:()=>new _(E("rBRRBBB+BCCuBFFmBgBgB-XwQwQBBB8xGOOoBCBOCBsEoBoBBDBHlClCBDBGBBFGDIgBgBBDDCgBgBBqIBhBBB7CffBXBpBFB2OKK3BHBwDxKxKBDBDeBLPBhIiEBX+BBFfBDhIBxBUBDFB9+zB5Z5ZCCBlFRRBBB+BCCkEHHBCBitDBBhrwBx+Bx+BagBgBagBgBagBgBagBgBat5Ft5FB-uC-uCBHB",!1)),So:()=>new _(E("mFDDFCCyerIrIBgEgEBvGvGLUUB4H4HkQ2L2LjEFBClElEwGqBqBoMCBQCCBBBDFBVECmEHBCFBCBBGDBmGBBxXJB0WzWzW+EhBBiLJBKIBksBBBCDBCBBLCCBHHBEBCECFMMBPPCBBC7B7BBKKBDBDDBCBBCBBCGBCeBDBBCCCBdBtIHBFTBDGBDwCBCdBanBBHnCBXKByCtCBX2FBCIBC1BBJuDBC3HBtBrBBhC-HBhQvBBWBBHmBBDpEBmHFBmLBBvBZBC4CBN1GBbPBFOOBNNWBBHBBxKBBFJBhBlBBKRRBdBMdBJQQBeBLmBBQ-JBhuG-BBx0V2BBibDBLBBC+R+RBBBqqUPBuLPBhCBB3BHBuBCBlPEEFBBOBB6JIB6BQBDCBCMBEwBwBBrBB7zBBBwSpgBpgBBGBnjC2kC2kCBGBFQBr6SDBG3qU3qUk7DvHBLCBEzNBHWBQPBhDzDB9B1HBLmBBD7BBGCBXBBIdBF8BBWhCBE7F7FB1CBqlB-PB4BDBzBHBCNBCBBp2B96C96CiEyWyWBqBBFjDBNOBDOBCOBCkBBYgFB5BcBOrBBFIBIBBPFB7E6HBG4WBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBB-B3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBC7CBLAB",!1)),Z:()=>new _(E("gBgEgEgvFgsCgsCBJBeBBGwBwBh9DAB",!1)),Zl:()=>new _(E("ohIA",!0)),Zp:()=>new _(E("phIA",!0)),Zs:()=>new _(E("gBgEgEgvFgsCgsCBJBlBwBwBh9DAB",!1)),ASCII_Hex_Digit:()=>new _(E("wBJIFbF",!0)),Alphabetic:()=>new _(E("hCZBHZBwBLLFGGBVBCeBCpOBFLBPEBICC3CeeBQBCBBDDBCHHCCBCCCBSBCyCBCqEBJlFBClBBDHHBnBBoBNBCCCBCCBCCJaBFDBeKBG3BBCGBPlDBCHBFHBFCBLCBDRRBuBBOkDBZgBBKBBFGGBWBDSBUYBIKBGXBCGBIJJBoBBLLBEGBHrCBCPBCCBFOBOSBCHBDBBDVBCGBCEEBCBEHBDBBDBBCJJFBBCEBNBBLFFBBBCFBFBBDVBCGBCBBCBBCBBFEBFBBDBBFIIBCBCSSBEBMCBCIBCCBCVBCGBCBBCEBEIBCCBCBBEQQBCBWDBFCBCHBDBBDVBCGBCBBCEBEHBDBBDBBKBBFBBCEBORRBCCBEBECBCDBEBBCCCBEEBEEBBBELBFEBECBCCBEHHpBMBCCBCWBCPBEHBCCBCCBJBBCCBCBBDDBdDBCHBCCBCWBCJBCEBEHBCCBCCBJBBGCBCDBOCBNMBCCBCoBBDHBCCBCCBCGGBCBIEBXFBCCBCRBEXBCIBCDDBFBJFBCCCBGBTBBO5BBGGBH0B0BBECBDBCXBCCCBRBCCBDEBCHHPDBhBgCgCBGBCjBBFSBFPBCjBBkC2BBCDDBDBR-BBLDBDlBBCGGDqBBCsKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPBR1CBDFBErTBDQBCZBGqCBEKBITBMUBNTBNMBCCBCBBNzBBDSBPFFkC4CBIqBBGlCBLeBCLBFIBYdBDEBMrBBFZB3BbBF+BBDTBzBYYBMMBBByBzBBCOBCHB0BpBBDDBLrBBCKBP2BBXCBLjBBDKBGqBBDCBqBDBCFBCBBEGGB+FBUhBBM1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGB1DOORMBmDFFDJBCEEBDBHGCBCBCKBDDBGEBFSSBnBBuZzBB34BkHBHDBEBBNlBBCGGD3BBIRRBVBKGBCGBCGBCGBCGBCGBCGBCGBCfBwB2O2OBBBaIBIEBDEBF1CBHCBC5CBCDBGqBBC9CBSfBxBPBhQ-tGBhCs0VBkCtBBDsIBEPBLBBVuBBGHBEwDBoBIBDmDBDxCBVUBCgBBZzBBNjCBCtBtBBEBECCBBBLgBBGiBBOcBEyBBCLBQRRBOBLEBC2BBKNBTWBEkCBCCCZCBDPBDDBMFBDFBDFBKGBCGBCqBBCNBH6DBWj9KBNWBFwBBloItLBDpDBnBGBNEBGLBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBlBZBHZBM4CBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmC0BBsIcBEwBBwBfBOdBGqBBGdBDjBBFHBCEBrB9EBTjBBFjBBFnBBJzBBNKBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCDBCBBGHBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4ByBBOyBBOnBBjBbBEGGBVB7HpBBCBBEBBRFBzBCBEcBLJJBUBrBRBvBUBcWBKlCBsBEBL4BBKOOBXBYyBBSDBJiBBEKKB+BBCDBKBBLCCkBRBChBBDHHBCB-BGBCCCBCBCOBCJBI4BBYDBCHBDBBDVBCGBCBBCEBEHBDBBDBBEHHGGBdJBCDDClBBCJBCDDCDBCBBECCtBhCBCCBCDBVCBfhCBDBBC5F5FB0BBDGBaFBjB+BBCEE8B1BBDoCoCBZBDNBWGB6F4BBoD-BBgBHBDDDBGBCBBCdBCBBDBBDDB+CHBDtBBDFBCCCBccBxBBDJBSnCBGTTBnCBoDHB5CgBBgBIBCsBBCGBCyByBBcBDVBCNBqCGBCBBCrBBECCBCCBBBCDDBZZBEBCBBCkBBCBBCDBCYYBqBBlIWBKQBCoBBECBwDwCwCB4cBnDuDBSjGBtyCgDBQvhBBSFBa68DBGmSB61GuBBy2B4RBIeBSuCBSdBTvBBRDBgBUBGSBxNsBB0G-BBhBYBDYBtBqCBF4BBIQBhCBBCNNBFBK1mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBFi7Fi7FBzCBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BeBHFB2GGBCQBDGBCBBCEBG9BBiBxDxDBrBBLGBRiKiKBcBTrBBlPbBlHdBDwGwGBdBCVBJBBhHGBCDBCBBCOBCkGB8BjCBEEE1lBDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1TZBHZBHZB3zD-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),Dash:()=>new _(E("tB9qB9qB0BiyDiyDmgBqgCqgCBEB+BoBoBQnMnMlgDDDgBBBFdd-NUUwDxszBxszBBmBmBLqFqFhzD-J-J",!1)),Emoji:()=>new _(E("jBHHGJBwDFFu8HNN5GXX7CFBQBBwLBBNnFnFaKBFCBoGoHoHBLLK7B7BBCBCEBKGDBDDFDDCBBDIEBJJBBBGCCGLBMBBDCCBCCTDDBTTBEBCCCBEEBGGDBBFBBMBBGBBDGGBECBVVBGGBEBCDBDFFDDDBEBCDDCCCHEEHLLBQQDFFCFFBBBCMMBxBxBBBBKeP1LBBwOCBUBB0BFF7mBNN6SCCrrvDrGrGhFBBNBBPDDBIBsCZBCBBYVVDIBWBBvFhBBDvDBDBBCCBDyCBDCBCmIBC+BBMFBCXBIBBDHBNDDBCBDFFBOOBDDJBBKGGBBBNCBJCBDCCFHHEHHB0CBxBlCBGHBDDBEJBECCBEEDJBkHLBF8I8IBtBBCJBC4FBxDMBEKBE4BBCFFBOBDLBFJB",!1)),Emoji_Component:()=>new _(E("jBHHGJB0+H2G2Gsp3B3+8B3+8BBYB8PEBxtBDBtzhY-CB",!1)),Emoji_Modifier:()=>new _(E("7-8DE",!0)),Emoji_Modifier_Base:()=>new _(E("9wJ8G8GRDB4jzD9B9BBBBDDDBBB2DBBDKBWSBEFFBBBCCBICCZqGqGBFFWFFBvFvFBBBEEB0CRRBBBKMMgSDDJHBHKKBIBDCB5B+B+BBCCBCCSCBCMBmHCBrBIB",!1)),Emoji_Presentation:()=>new _(E("64IBBuGDBEDDqQBBWBBzBLBsBUUOJJBSSBGGBJJGWWIBBCFFDIIFBBdkBkBCFFBBBC+B+BBBBZPP8aBB0BFFvlxDrGrG-FDDBIBsCZBCZZVDDBDBCCBWBBvFgBBNIBClCBCVBNqBBFEBNQBEEEBlCBCCCB5FBD+BBODBCXBTbbBOO3C0CBxBlCBHEEBBBDDBEDBMBBIIBkHLBF8I8IBtBBCJBC4FBxDMBEKBE4BBCFFBOBDLBFJB",!1)),Extended_Pictographic:()=>new _(E("pFFFu8HNN5GXX7CFBQBBwLBBNnFnFaKBFCBoGoHoHBLLK7B7BBCBCEBKGDBDDFDDCBBDIEBJJBBBGCCGLBMBBDCCBCCTDDBTTBEBCCCBEEBGGDBBFBBMBBGBBDGGBECBVVBGGBEBCDBDFFDDDBEBCDDCCCHEEHLLBQQDFFCFFBBBCMMBxBxBBBBKeP1LBBwOCBUBB0BFF7mBNN6SCCrrvDoBoBBCBlDLBQBBQPPBmBmBBIBxDBBNBBPDDBIBU3BBcOBLVVDIBCDBKWBH7FBDvDBDBBCCBDyCBDCBCDBG9HBC+BBMFBCXBIBBDHBNDDBCBDFFBOOBDDJBBKGGBBBNCBJCBDCCFHHEHHB0CBxBlCBGHBDQBECCBEBDMB7GlBBNDB5BHBLFBpBHBfBBNDBDNBKmBBNuBBCJBC4FB5CHBPxEBhI9fB",!1)),Hex_Digit:()=>new _(E("wBJIFbFq1-BJIFbF",!0)),Lowercase:()=>new _(E("hDZBwBLLFlBlBBWBCHBC2BCBQCBuBCDECBBBDCCDEEBFFDEEBBBDDDCCCDCCBCCDEECDDBDDBBBHGDCOCBSCBDDCEEC4BCBFBDDDBCCFICBjCBDiBBIBBfEBhDsBsBCEEDDBTccBhBBCBBECBCWCBDBCGDB0B0BBuBBCgBCK0BCDMCBgDCxBoBBo6CqBBCDB5XFBjkCIBC2D2DB+FBiC0ECBHBCgDCBHBJFBLHBJHBJFBLHBJHBJNBDHBJHBJHBJEBCBBHEEBBBCBBJDBDBBJHBLCBCBB6DOORMBuDEEBEEcKFDBBJDBFiBiBBOBFsasaBYBn6BvBBCEEBGCFCCBCCBGBEiDCBIICFFNlBBCGG0oesBCUaCBBBmEMCBBBC8BCBIBCCCDICFCCDCCBBBCSCGGGCMCFCCDOCWDBCCCBBB2ZqBBCNBHvCBh6TGBNEBqhBZBumBnBBpEjBB8EKBCOBCGBCBBkODDBBBCpBBCIBmoByBB+DVB75CfBhsVfB8BYBnqZZBbGBCRBbZBbDBCCCBFBCKBbZBbZBbZBbZBbZBbZBbZBbZBbbBdYBCFBbYBCFBbYBCFBbYBCFBbYBCFBC15B15BBIBCTBHFBmI9BB1lChBB",!1)),Math:()=>new _(E("rBRRBBBgBeeCuBuBFmBmBgB5W5WBBBDbbBDDBBBwQCBuwGccBBBMEEOPPBCBWEBMEBiCMBFEEBFFBDBTFFDJBCDDBEBHEEBDDBCCBBBCFBENBClClCBWBCFBCBBFBBFfBCHHBPPBqIBJDBVBB7CffBZBCZZMGB+NBBNJBFFBFBBDBBEEBPCCDFBMHBGBB6BCCeDBKCBxK-BBhI-PBxBUBDFB9+zB4Z4ZBEBCjFjFRCBeCCeCCkEHHBCBitDBBhrwBwoBwoBBzCBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBDxBBhwFDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBB-uCIB",!1)),Quotation_Mark:()=>new _(E("iBFFkEQQ96HHBaBBowDqOqOBCBOCBixzBDB+FFF7CBB",!1)),Terminal_Punctuation:()=>new _(E("hBLLCMMBEE-ZJJiQ6B6BpCPPCCB1FsBsBBJBCsHsHB3B3BBEBCHBgBmImIB1nB1nBBtFtFFFB4JBB2YHBmY9D9DBBBoCBB+ECBEoBoBBCBDBB7JBBjLDBjFBBLBBCCBeCB8FEB-BBBldYYBKKBBBwlDCBzJOOFLLCBBEBBtNBB8ndBBuICBkHEB-LBB3CBBgD4E4EBBB0ECBgERRB6H6HnxUDDB6B6BBBBCDBqFLLCMMBEEiCDD7hBxBxBnkBoGoG3JBB5EFBlCFB6CDB5dEBtBDB+FGBxDDBgECBiEBBHRRB5C5CBDBtDrJrJB2D2DBBBNBBnLDBEOBqDBB6HCBmQCC8HBB4CBBFBB-MCBuBmUmUBrCrCBspBspBBDB6vRBBmEiCiCBBBLqRqRBoJoJBnwTnwTovHDB",!1)),Uppercase:()=>new _(E("hCZBmDWBCGBiB2BCDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIJDCMCDQCDDDCCBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBDDBBBEWCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBpCDBNDBNDBNEBMDBnIFFECBDCBDEEBDBHGCBCBDDBLBBGbbBOBUzZzZBYBx5BvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoqZZBbZBbZBbCCBGDBDDBCBCHBbZBbBBCDBDHBCGBcBBCDBCEBCEEBFBcZBbZBbZBbZBbZBbZBfYBiBYBiBYBiBYBiBYBiB2pE2pEBgBBvgCZBHZBHZB",!1)),White_Space:()=>new _(E("JEBTlDlDbgvFgvFgsCKBeBBGwBwBh9DAB",!1))})),j(dr,"SCRIPTS",new oc({Adlam:()=>new _(E("go6DrCFJFB",!0)),Ahom:()=>new _(E("g4lCaDOFW",!0)),Anatolian_Hieroglyphs:()=>new _(E("ggxCmS",!0)),Arabic:()=>new _(E("gwBEBCFBCNBCCBCfBCJBMZBCrDBChBBxCvBBxHhBBGqCBCcBxy8BtPBDvEBhBPBxDEBCmEBk7DeBkCFBJIBiBFBh43BDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBB",!1)),Armenian:()=>new _(E("xpBlBDxBDCks9BE",!0)),Avestan:()=>new _(E("g4iC1BEG",!0)),Balinese:()=>new _(E("g4GsCCxB",!0)),Bamum:()=>new _(E("g1pB3CpowB4R",!0)),Bassa_Vah:()=>new _(E("w26CdDF",!0)),Batak:()=>new _(E("g+GzBJD",!0)),Bengali:()=>new _(E("gsCDBCHBDBBDVBCGBCEEBCBDIBDBBDDBJFFBCCBDBDYB",!1)),Beria_Erfe:()=>new _(E("g17CYDY",!0)),Bhaiksuki:()=>new _(E("ggnCICsBCNLc",!0)),Bopomofo:()=>new _(E("qXB6wLqBxDf",!0)),Brahmi:()=>new _(E("ggkCtCFjBKA",!0)),Braille:()=>new _(E("ggK-H",!0)),Buginese:()=>new _(E("gwGbDB",!0)),Buhid:()=>new _(E("g6FT",!0)),Canadian_Aboriginal:()=>new _(E("ggF-TxRlC7tgCP",!0)),Carian:()=>new _(E("g1gCwB",!0)),Caucasian_Albanian:()=>new _(E("wphCzBMA",!0)),Chakma:()=>new _(E("gokC0BCR",!0)),Cham:()=>new _(E("gwqB2BKNDJDD",!0)),Cherokee:()=>new _(E("g9E1CDFz7lBvC",!0)),Chorasmian:()=>new _(E("w9jCb",!0)),Common:()=>new _(E("AgCBbFBbuBBCOBCEBYgBgBiOmBBGEBDTB1DKKHCC+THHPEEhB9E9ElQiEiEB6mB6mB2MDBjJwvBwvBBBBoCBBsGBBCumBumBOIIBCBCFBCCBDmYmYBKBD2CBCKBEKBCOBShBB-BlBBCCBDFBCaBCQBqBCBF5UBXKBW-cBhIzTBDpEBhQ9CBzMUBCCCBXBQHBFDB8CBBE7C7CB0E0EBOBhBlBBKxBxBB+BBgBwCBwB5C5CBmFBhuG-BBhoWhBBnDCBmFJB1HhFhFsMPPBzuUzuUBxGxGBIBXiBBCSBCDB0ECCBeBbFBbKBLuBuBBhChCBFBCGBLEBjICBFsBBEIBxCMB0BsBBlHaBltuBDB96D8HBEzNBHWBQQBgDzDB9B1HBLmBBD9BBEQBJBBIdBF8BB2GTBNTBN2CBKYBoE0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBDxBByjFjCBtC8BBjWrBBFjDBNOBDOBCOBCkBBLtFB5BZBCBBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBCmDBnghYffB+CB",!1)),Coptic:()=>new _(E("ifNxkKzDGG",!0)),Cuneiform:()=>new _(E("ggoC5cnDuDCEMjG",!0)),Cypriot:()=>new _(E("ggiCFBDCCBqBBCBBEDD",!1)),Cypro_Minoan:()=>new _(E("w8rCiD",!0)),Cyrillic:()=>new _(E("ggBkEBDoFBx6FKBhFtCtCojEfBhie-CBv8VBBhw4B9BBiBAB",!1)),Deseret:()=>new _(E("gghCvC",!0)),Devanagari:()=>new _(E("goCwCFODZh7nBfhwcJ",!0)),Dives_Akuru:()=>new _(E("gomCGBDDDBGBCBBCdBCBBDLBKJB",!1)),Dogra:()=>new _(E("ggmC7B",!0)),Duployan:()=>new _(E("ggvDqDGMEIIJDD",!0)),Egyptian_Hieroglyphs:()=>new _(E("ggsC1iBL68D",!0)),Elbasan:()=>new _(E("gohCnB",!0)),Elymaic:()=>new _(E("g-jCW",!0)),Ethiopic:()=>new _(E("gwEoCBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBDfBEZBnvGWBKGBCGBCGBCGBCGBCGBCGBCGBjpfFBDFBDFBKGBCGBylvCGBCDBCBBCOB",!1)),Garay:()=>new _(E("gqjClBEcJB",!0)),Georgian:()=>new _(E("glElBBCGGDqBBCDBx8CqBBDCBhiElBBCGG",!1)),Glagolitic:()=>new _(E("ggL-Ch9sDGCQDGCBCE",!0)),Gothic:()=>new _(E("w5gCa",!0)),Grantha:()=>new _(E("g4kCDBCHBDBBDVBCGBCBBCEBDIBDBBDCBDHHGGBDGBEEB",!1)),Greek:()=>new _(E("wbDBCCBDDBCFFCCCBBBCCCBSBC+BBPPBnpGEBzBEBFEB1ChKhKBUBDFBDlBBDFBDHBCGCBdBD0BBCOBCNBDFBCSBDCBCIBoJ-xiB-xiB7uVuCBSgj0Bgj0BBkCB",!1)),Gujarati:()=>new _(E("h0CCBCIBCCBCVBCGBCBBCEBDJBCCBCCBDQQBCBDLBIGB",!1)),Gunjala_Gondi:()=>new _(E("grnCFCBCkBCBCFIJ",!0)),Gurmukhi:()=>new _(E("hwCCBCFBFBBDVBCGBCBBCBBCBBDCCBDBFBBDCBEIIBCBCIIBPB",!1)),Gurung_Khema:()=>new _(E("go4C5B",!0)),Han:()=>new _(E("g0LZBC4CBN1GBwBCCaIBPDBle-tGBhC-vUBhoWtLBDpDBpodBBNGBqgkB-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),Hangul:()=>new _(E("goE-HvxHBiI9CyDeiCei3dckUj9KNWFwBl9JeEFDFDFDC",!0)),Hanifi_Rohingya:()=>new _(E("gojCnBJJ",!0)),Hanunoo:()=>new _(E("g5FU",!0)),Hatran:()=>new _(E("gniCSCBGE",!0)),Hebrew:()=>new _(E("xsB2BBJaBFFBpp9BZBCEBCCCBCCBCCBIB",!1)),Hiragana:()=>new _(E("hiM1CBHCBi7-C+IBTeeBBBulQAB",!1)),Imperial_Aramaic:()=>new _(E("giiCVCI",!0)),Inherited:()=>new _(E("gYvDB2IBBlOKBbhXhXBCB8qEtBBDLBlPCBCMBCGBFHHEBBnG-BBtQBBjGgBB65DDBsDBBmrzBPBRNBwejHjH7iEl+uBl+uBBsBBDWBhRCBSHBDGBfDBz6rYvHB",!1)),Inscriptional_Pahlavi:()=>new _(E("g7iCSGH",!0)),Inscriptional_Parthian:()=>new _(E("g6iCVDH",!0)),Javanese:()=>new _(E("gsqBtCDJFB",!0)),Kaithi:()=>new _(E("gkkCiCLA",!0)),Kannada:()=>new _(E("gkDMCCCWCJCEDICCCDIBGCCDDJCC",!0)),Katakana:()=>new _(E("hlM5CBDCBxHPBxGuBBC3CBvgzBJBCsBBzisBDBCGBCBBCgJgJBBBzBPPBCB",!1)),Kawi:()=>new _(E("g4nCQCoBEc",!0)),Kayah_Li:()=>new _(E("goqBtBCA",!0)),Kharoshthi:()=>new _(E("gwiCDCBGHCCCcDCFJII",!0)),Khitan_Small_Script:()=>new _(E("k-7C84G84GB0OBqBAB",!1)),Khmer:()=>new _(E("g8F9CDJHJnPf",!0)),Khojki:()=>new _(E("gwkCRCuB",!0)),Khudawadi:()=>new _(E("w1kC6BGJ",!0)),Kirat_Rai:()=>new _(E("gq7C5B",!0)),Lao:()=>new _(E("h0DBBCCCBDBCXBCCCBVBDEBCCCBFBCJBDDB",!1)),Latin:()=>new _(E("hCZBHZBwBQQGWBCeBCgOBoBEB8wGlBBHwBBGDBGMBClCBiC-HByLOORMBuEBBHccSoBB42CfBj1elDBExCBVOBxZqBBCIBCDB38TGB7gBZBHZBmhCFBCpBBCIBm61BeBHFB",!1)),Lepcha:()=>new _(E("ggH3BEOEC",!0)),Limbu:()=>new _(E("goGeBCLBFLBFEEBKB",!1)),Linear_A:()=>new _(E("gwhC2JKVLH",!0)),Linear_B:()=>new _(E("gggCLCZCSCBCODNjB6D",!0)),Lisu:()=>new _(E("wmpBvBx1eA",!0)),Lycian:()=>new _(E("g0gCc",!0)),Lydian:()=>new _(E("gpiCZGA",!0)),Mahajani:()=>new _(E("wqkCmB",!0)),Makasar:()=>new _(E("g3nCY",!0)),Malayalam:()=>new _(E("goDMCCCyBCCCFFPDZ",!0)),Mandaic:()=>new _(E("giCbDA",!0)),Manichaean:()=>new _(E("g2iCmBFL",!0)),Marchen:()=>new _(E("wjnCfDVCN",!0)),Masaram_Gondi:()=>new _(E("gonCGBCBBCrBBECCBCCBHBJJB",!1)),Medefaidrin:()=>new _(E("gy7C6C",!0)),Meetei_Mayek:()=>new _(E("g3qBWqGtBDJ",!0)),Mende_Kikakui:()=>new _(E("gg6DkGDP",!0)),Meroitic_Cursive:()=>new _(E("gtiCXFTDtB",!0)),Meroitic_Hieroglyphs:()=>new _(E("gsiCf",!0)),Miao:()=>new _(E("g47CqCF4BIQ",!0)),Modi:()=>new _(E("gwlCkCMJ",!0)),Mongolian:()=>new _(E("ggGBBDCCBSBH4CBIqBB2t-BMB",!1)),Mro:()=>new _(E("gy6CeCJFB",!0)),Multani:()=>new _(E("g0kCGBCCCBCBCOBCKB",!1)),Myanmar:()=>new _(E("ggE-EhqmBeiDfxibT",!0)),Nabataean:()=>new _(E("gkiCeJI",!0)),Nag_Mundari:()=>new _(E("wm5DpB",!0)),Nandinagari:()=>new _(E("gtmCHDtBDK",!0)),New_Tai_Lue:()=>new _(E("gsGrBFZHKEB",!0)),Newa:()=>new _(E("gglC7CCE",!0)),Nko:()=>new _(E("g+B6BDC",!0)),Nushu:()=>new _(E("h-7CvsQvsQBqMB",!1)),Nyiakeng_Puachue_Hmong:()=>new _(E("go4DsBENDJFB",!0)),Ogham:()=>new _(E("g0Fc",!0)),Ol_Chiki:()=>new _(E("wiHvB",!0)),Ol_Onal:()=>new _(E("wu5DqBFA",!0)),Old_Hungarian:()=>new _(E("gkjCyBOyBIF",!0)),Old_Italic:()=>new _(E("g4gCjBKC",!0)),Old_North_Arabian:()=>new _(E("g0iCf",!0)),Old_Permic:()=>new _(E("w6gCqB",!0)),Old_Persian:()=>new _(E("g9gCjBFN",!0)),Old_Sogdian:()=>new _(E("g4jCnB",!0)),Old_South_Arabian:()=>new _(E("gziCf",!0)),Old_Turkic:()=>new _(E("ggjCoC",!0)),Old_Uyghur:()=>new _(E("w7jCZ",!0)),Oriya:()=>new _(E("h4CCCHDBDVCGCBCEDIDBDCICFBCEDR",!0)),Osage:()=>new _(E("wlhCjBFjB",!0)),Osmanya:()=>new _(E("gkhCdDJ",!0)),Pahawh_Hmong:()=>new _(E("g46ClCLJCGCUGS",!0)),Palmyrene:()=>new _(E("gjiCf",!0)),Pau_Cin_Hau:()=>new _(E("g2mC4B",!0)),Phags_Pa:()=>new _(E("giqB3B",!0)),Phoenician:()=>new _(E("goiCbEA",!0)),Psalter_Pahlavi:()=>new _(E("g8iCRIDNG",!0)),Rejang:()=>new _(E("wpqBjBMA",!0)),Runic:()=>new _(E("g1FqCEK",!0)),Samaritan:()=>new _(E("ggCtBDO",!0)),Saurashtra:()=>new _(E("gkqBlCJL",!0)),Sharada:()=>new _(E("gskC-ChsCH",!0)),Shavian:()=>new _(E("wihCvB",!0)),Siddham:()=>new _(E("gslC1BDlB",!0)),Sidetic:()=>new _(E("gqiCZ",!0)),SignWriting:()=>new _(E("gg2DrUQECO",!0)),Sinhala:()=>new _(E("hsDCBCRBEXBCIBCDDBFBEFFBEBCCCBGBHJBDCBt-gCTB",!1)),Sogdian:()=>new _(E("w5jCpB",!0)),Sora_Sompeng:()=>new _(E("wmkCYIJ",!0)),Soyombo:()=>new _(E("wymCyC",!0)),Sundanese:()=>new _(E("g8G-BhIH",!0)),Sunuwar:()=>new _(E("g+mChBPJ",!0)),Syloti_Nagri:()=>new _(E("ggqBsB",!0)),Syriac:()=>new _(E("g4BNC7BDCxIK",!0)),Tagalog:()=>new _(E("g4FVKA",!0)),Tagbanwa:()=>new _(E("g7FMCCCB",!0)),Tai_Le:()=>new _(E("wqGdDE",!0)),Tai_Tham:()=>new _(E("gxG+BCcDKHJHN",!0)),Tai_Viet:()=>new _(E("g0qBiCZE",!0)),Tai_Yo:()=>new _(E("g25DeCVJB",!0)),Takri:()=>new _(E("g0lC5BHJ",!0)),Tamil:()=>new _(E("i8CBBCFBECBCDBEBBCCCBEEBEEBBBELBFEBECBCDBDHHPUBm+kCxBBOAB",!1)),Tangsa:()=>new _(E("wz6CuCCJ",!0)),Tangut:()=>new _(E("g-7CgBgBB+3GBhQeBiDyDB",!1)),Telugu:()=>new _(E("ggDMCCCWCPDICCCDIBCCCBDDDJII",!0)),Thaana:()=>new _(E("g8BxB",!0)),Thai:()=>new _(E("hwD5BGb",!0)),Tibetan:()=>new _(E("g4DnCCjBFmBCjBCOCGFB",!0)),Tifinagh:()=>new _(E("wpL3BIBPA",!0)),Tirhuta:()=>new _(E("gklCnCJJ",!0)),Todhri:()=>new _(E("guhCzB",!0)),Tolong_Siki:()=>new _(E("wtnCrBFJ",!0)),Toto:()=>new _(E("w04De",!0)),Tulu_Tigalari:()=>new _(E("g8kCJBCDDClBBCJBCDDCDBCJBCBBJBB",!1)),Ugaritic:()=>new _(E("g8gCdCA",!0)),Unknown:()=>new _(E("4bBBHDBICCVuMuMnBBBzBBBE4B4BBGBcDBHKBvI9B9BBmDmDBMB8BBByBBBQddBCCMEBjBEBuHJJBDDBXXICCBBBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBbFB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKmDmDNBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBjoIBvLBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCC-FCBHBBHBBHBBECBIIIBIBGBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIBlCJBCBBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMB3iBJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBJ76DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBjGUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIm8yVBCdBhD-DBxHvw-FB",!1)),Vai:()=>new _(E("gopBrJ",!0)),Vithkuqi:()=>new _(E("wrhCKCOCGCBCKCOCGCB",!0)),Wancho:()=>new _(E("g24D5BGA",!0)),Warang_Citi:()=>new _(E("glmCyCNA",!0)),Yezidi:()=>new _(E("g0jCpBCCDB",!0)),Yi:()=>new _(E("ggoBskBE2B",!0)),Zanabazar_Square:()=>new _(E("gwmCnC",!0))})),j(dr,"FOLD_CATEGORIES",new oc({L:()=>new _(E("laA",!0)),LC:()=>new _(E("laA",!0)),Ll:()=>new _(E("hCZBmDWBCGBiBuBCEECDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIBBCBBCBBCOCDQCDBBCCCBBBC4BCIBBCBBDCCBCBCGC3HrBrBCEEJHHCCBCCCBCCBPBCIBkBJJCUCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBZHBJHBJHBJEBMEBMDBNEBMEBqJEEBHHxC9zC9zCBuBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoyehBB",!1)),Lt:()=>new _(E("kOCCBCCBCClBCCtsHHBJHBJHBMQQwBAB",!1)),Lu:()=>new _(E("hDZB7BqBqBBWBCHBCuBCEECDOCDsBCDECBBBDCCDEEGDDECBDDDCCCDFFDEECDDECCGBBCBBCBBCOCBSCDBBCEECkBCEQCJDDBCCFICBEBCBBCCCBEEBCCBCBCEBDCCBDDIDDCBBEFBGLLBnFnFsBCCEEEBBBvBDBCdBCBBECBCWCBDBCGD1BvBBCgBCK0BCDMCBgDCyBlBBq6CqBBDCB5XFBjkCIBCvHvHERRzD0ECGGGC8CCBHBJFBLHBJHBJFBMGCJHBJNBzBBBNSSBPPBEEpL2B2Bs1CvBBCEEBGCHDDLiDCJCCFNNBkBBCGG0oesBCUaCoEMCE8BCLCCDICFFFCBBDSCMOCFCCDOCb9a9advCBi8UZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBvyehBB",!1)),M:()=>new _(E("5cgBgBlgHAB",!1)),Mn:()=>new _(E("5cgBgBlgHAB",!1)),Emoji:()=>new _(E("8mJA",!0)),Extended_Pictographic:()=>new _(E("8mJA",!0)),Lowercase:()=>new _(E("hCZBmDWBCGBiBuBCEECDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIBBCBBCBBCOCDQCDBBCCCBBBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBJJCUCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBZHBJHBJHBJEBMEBMDBNEBMEBqJEEBHHuBPBUzZzZBYBx5BvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoyehBB",!1)),Math:()=>new _(E("ycGDCHHFMMDDDCHHFAB",!1)),Uppercase:()=>new _(E("hDZB7BqBqBBWBCHBCuBCEECDOCDsBCDECBBBDCCDEEGDDECBDDDCCCDFFDEECDDECCGBBCBBCBBCOCBSCDBBCEECkBCEQCJDDBCCFICBEBCBBCCCBEEBCCBCBCEBDCCBDDIDDCBBEFBGLLBnFnFsBCCEEEBBBvBDBCdBCBBECBCWCBDBCGD1BvBBCgBCK0BCDMCBgDCyBlBBq6CqBBDCB5XFBjkCIBCvHvHERRzD0ECGGGC8CCBHBJFBLHBJHBJFBMGCJHBJNBzBBBNSSBPPBEEpLiBiBBOBFsasaBYBn6BvBBCEEBGCHDDLiDCJCCFNNBkBBCGG0oesBCUaCoEMCE8BCLCCDICFFFCBBDSCMOCFCCDOCb9a9advCBi8UZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBvyehBB",!1))})),j(dr,"FOLD_SCRIPT",new oc({Common:()=>new _(E("8cgBgB",!1)),Greek:()=>new _(E("1FwUwU",!1)),Inherited:()=>new _(E("5cgBgBlgHAB",!1))})),dr),Pe,X=(Pe=class{static is32(e,t){let n=0,s=e.length;for(;n<s;){const i=n+Math.floor((s-n)/2),o=e.getLo(i),a=e.getHi(i);if(o<=t&&t<=a){const c=e.getStride(i);return(t-o)%c===0}t<o?s=i:n=i+1}return!1}static is(e,t){if(t<=Pe.MAX_LATIN1){for(let n=0;n<e.length;n++){if(t>e.getHi(n))continue;const s=e.getLo(n);if(t<s)return!1;const i=e.getStride(n);return(t-s)%i===0}return!1}return e.length>0&&t>=e.getLo(0)&&Pe.is32(e,t)}static isUpper(e){if(e<=Pe.MAX_LATIN1){const t=String.fromCodePoint(e);return t.toUpperCase()===t&&t.toLowerCase()!==t}return Pe.is(Nt.Upper,e)}static isPrint(e){return e<=Pe.MAX_LATIN1?e>=32&&e<Pe.MAX_ASCII||e>=161&&e!==173:Pe.is(Nt.Print,e)}static simpleFold(e){if(Nt.CASE_ORBIT.has(e))return Nt.CASE_ORBIT.get(e);const t=L.toLowerCase(e);return t!==e?t:L.toUpperCase(e)}static equalsIgnoreCase(e,t){if(e===t)return!0;if(e<0||t<0)return!1;if(e<=Pe.MAX_ASCII&&t<=Pe.MAX_ASCII)return 65<=e&&e<=90&&(e|=32),65<=t&&t<=90&&(t|=32),e===t;for(let n=Pe.simpleFold(e);n!==e;n=Pe.simpleFold(n))if(n===t)return!0;return!1}},j(Pe,"MAX_RUNE",1114111),j(Pe,"MAX_ASCII",127),j(Pe,"MAX_LATIN1",255),j(Pe,"MAX_BMP",65535),j(Pe,"MIN_FOLD",65),j(Pe,"MAX_FOLD",125251),j(Pe,"MIN_HIGH_SURROGATE",55296),j(Pe,"MAX_HIGH_SURROGATE",56319),j(Pe,"MIN_LOW_SURROGATE",56320),j(Pe,"MAX_LOW_SURROGATE",57343),j(Pe,"MIN_SUPPLEMENTARY_CODE_POINT",65536),Pe);const sh=256,qm=new Uint8Array(sh);for(let r=0;r<sh;r++)qm[r]=97<=r&&r<=122||65<=r&&r<=90||48<=r&&r<=57||r===95?1:0;let Ol=null,Fl=null;var Le,ne=(Le=class{static emptyInts(){return[]}static isByteArray(e){return Array.isArray(e)||e instanceof Uint8Array}static isalnum(e){return L.CODES.get("0")<=e&&e<=L.CODES.get("9")||L.CODES.get("a")<=e&&e<=L.CODES.get("z")||L.CODES.get("A")<=e&&e<=L.CODES.get("Z")}static unhex(e){return L.CODES.get("0")<=e&&e<=L.CODES.get("9")?e-L.CODES.get("0"):L.CODES.get("a")<=e&&e<=L.CODES.get("f")?e-L.CODES.get("a")+10:L.CODES.get("A")<=e&&e<=L.CODES.get("F")?e-L.CODES.get("A")+10:-1}static escapeRune(e){let t="";if(X.isPrint(e))Le.METACHARACTERS.indexOf(String.fromCodePoint(e))>=0&&(t+="\\"),t+=String.fromCodePoint(e);else switch(e){case L.CODES.get('"'):t+='\\"';break;case L.CODES.get("\\"):t+="\\\\";break;case L.CODES.get("	"):t+="\\t";break;case L.CODES.get(`
`):t+="\\n";break;case L.CODES.get("\r"):t+="\\r";break;case L.CODES.get("\b"):t+="\\b";break;case L.CODES.get("\f"):t+="\\f";break;default:{let n=e.toString(16);e<256?(t+="\\x",n.length===1&&(t+="0"),t+=n):t+=`\\x{${n}}`;break}}return t}static stringToRunes(e){const t=String(e),n=[];let s=0;for(;s<t.length;){const i=t.codePointAt(s);n.push(i),s+=i>X.MAX_BMP?2:1}return n}static runeToString(e){return String.fromCodePoint(e)}static isWordRune(e){return e<sh?qm[e]===1:!1}static emptyOpContext(e,t){let n=0;return e<0&&(n|=Le.EMPTY_BEGIN_TEXT|Le.EMPTY_BEGIN_LINE),e===10&&(n|=Le.EMPTY_BEGIN_LINE),t<0&&(n|=Le.EMPTY_END_TEXT|Le.EMPTY_END_LINE),t===10&&(n|=Le.EMPTY_END_LINE),Le.isWordRune(e)!==Le.isWordRune(t)?n|=Le.EMPTY_WORD_BOUNDARY:n|=Le.EMPTY_NO_WORD_BOUNDARY,n}static quoteMeta(e){return e.split("").map(t=>Le.METACHARACTERS.indexOf(t)>=0?`\\${t}`:t).join("")}static charCount(e){return e>X.MAX_BMP?2:1}static toArray(e){const t=e.length,n=new Array(t);for(let s=0;s<t;s++)n[s]=e[s];return n}static stringToUtf8ByteArray(e){if(globalThis.TextEncoder)return Ol||(Ol=new TextEncoder),Ol.encode(e);{let t=[],n=0;for(let s=0;s<e.length;s++){let i=e.charCodeAt(s);i<128?t[n++]=i:i<2048?(t[n++]=i>>6|192,t[n++]=i&63|128):(i&64512)===X.MIN_HIGH_SURROGATE&&s+1<e.length&&(e.charCodeAt(s+1)&64512)===X.MIN_LOW_SURROGATE?(i=X.MIN_SUPPLEMENTARY_CODE_POINT+((i&1023)<<10)+(e.charCodeAt(++s)&1023),t[n++]=i>>18|240,t[n++]=i>>12&63|128,t[n++]=i>>6&63|128,t[n++]=i&63|128):(t[n++]=i>>12|224,t[n++]=i>>6&63|128,t[n++]=i&63|128)}return t}}static utf8ByteArrayToString(e){if(globalThis.TextDecoder){Fl||(Fl=new TextDecoder("utf-8"));const t=e instanceof Uint8Array?e:new Uint8Array(e);return Fl.decode(t)}else{let t=[],n=0,s=0;for(;n<e.length;){let i=e[n++];if(i<128)t[s++]=String.fromCharCode(i);else if(i>191&&i<224){let o=e[n++];t[s++]=String.fromCharCode((i&31)<<6|o&63)}else if(i>239&&i<365){let o=e[n++],a=e[n++],c=e[n++],l=((i&7)<<18|(o&63)<<12|(a&63)<<6|c&63)-X.MIN_SUPPLEMENTARY_CODE_POINT;t[s++]=String.fromCharCode(X.MIN_HIGH_SURROGATE+(l>>10)),t[s++]=String.fromCharCode(X.MIN_LOW_SURROGATE+(l&1023))}else{let o=e[n++],a=e[n++];t[s++]=String.fromCharCode((i&15)<<12|(o&63)<<6|a&63)}}return t.join("")}}},j(Le,"METACHARACTERS","\\.+*?()|[]{}^$"),j(Le,"EMPTY_BEGIN_LINE",1),j(Le,"EMPTY_END_LINE",2),j(Le,"EMPTY_BEGIN_TEXT",4),j(Le,"EMPTY_END_TEXT",8),j(Le,"EMPTY_WORD_BOUNDARY",16),j(Le,"EMPTY_NO_WORD_BOUNDARY",32),j(Le,"EMPTY_ALL",-1),Le);const jm=(r=[],e=0)=>{const t=Object.create(null);for(let n=0;n<r.length;n++){const s=r[n],i=e+n;t[s]=i,t[i]=s}return Object.freeze(t)};var Ir,fs=(Ir=class{getEncoding(){throw Error("not implemented")}asCharSequence(){throw Error("not implemented")}asBytes(){throw Error("not implemented")}length(){throw Error("not implemented")}isUTF8Encoding(){return this.getEncoding()===Ir.Encoding.UTF_8}isUTF16Encoding(){return this.getEncoding()===Ir.Encoding.UTF_16}},j(Ir,"Encoding",jm(["UTF_16","UTF_8"])),Ir),EC=class extends fs{constructor(r=null){super(),this.bytes=r}getEncoding(){return fs.Encoding.UTF_8}asCharSequence(){return ne.utf8ByteArrayToString(this.bytes)}asBytes(){return this.bytes}length(){return this.bytes.length}},cv=class extends fs{constructor(r=null){super(),this.charSequence=r}getEncoding(){return fs.Encoding.UTF_16}asCharSequence(){return this.charSequence}asBytes(){return ne.stringToUtf8ByteArray(this.charSequence.toString())}length(){return this.charSequence.length}},os=class{static utf16(r){return new cv(r)}static utf8(r){return ne.isByteArray(r)?new EC(r):new EC(ne.stringToUtf8ByteArray(r))}},Rt=class{static EOF(){return-8}constructor(){this.end=0}canCheckPrefix(){return!0}endPos(){return this.end}hasString(){return!1}hasAnyString(){return!1}prefixLength(){return 0}},uv=class extends Rt{constructor(r,e=0,t=r.length){super(),this.bytes=r,this.start=e,this.end=t}hasString(r,e){const t=r.bytes;if(t.length===0)return!0;const n=this.indexOf(this.bytes,t,this.start+e);return n!==-1&&n<=this.end-t.length}hasAnyString(r,e){return r.ac8?r.ac8.searchUTF8(this.bytes,this.start+e,this.end):!1}step(r){if(r+=this.start,r>=this.end)return Rt.EOF();const e=this.bytes[r]&255;if(e<128)return e<<3|1;if(e>=194&&e<=223&&r+1<this.end){const t=this.bytes[r+1]&255;return(t&192)!==128?e<<3|1:((e&31)<<6|t&63)<<3|2}else if(e>=224&&e<=239&&r+2<this.end){const t=this.bytes[r+1]&255;if((t&192)!==128)return e<<3|1;const n=this.bytes[r+2]&255;return(n&192)!==128?e<<3|1:((e&15)<<12|(t&63)<<6|n&63)<<3|3}else if(e>=240&&e<=244&&r+3<this.end){const t=this.bytes[r+1]&255;if((t&192)!==128)return e<<3|1;const n=this.bytes[r+2]&255;if((n&192)!==128)return e<<3|1;const s=this.bytes[r+3]&255;return(s&192)!==128?e<<3|1:((e&7)<<18|(t&63)<<12|(n&63)<<6|s&63)<<3|4}else return e<<3|1}index(r,e){e+=this.start;const t=this.indexOf(this.bytes,r.prefixUTF8,e);return t<0?t:t-e}context(r){r+=this.start;let e=-1;if(r>this.start&&r<=this.end){let n=r-1;if(e=this.bytes[n--],e>=128){let s=r-4;for(s<this.start&&(s=this.start);n>=s&&(this.bytes[n]&192)===128;)n--;n<this.start&&(n=this.start),e=this.step(n-this.start)>>3}}const t=r<this.end?this.step(r-this.start)>>3:-1;return ne.emptyOpContext(e,t)}indexOf(r,e,t=0){let n=e.length;if(n===0)return t<=this.end?t:-1;const s=e[0];let i=this.end-n;const o=typeof r.indexOf=="function";let a=t;for(;a<=i;){if(o){if(a=r.indexOf(s,a),a===-1||a>i)return-1}else{for(;a<=i&&r[a]!==s;)a++;if(a>i)return-1}let c=!0;for(let l=1;l<n;l++)if(r[a+l]!==e[l]){c=!1;break}if(c)return a;a++}return-1}prefixLength(r){return r.prefixUTF8.length}},lv=class extends Rt{constructor(r,e=0,t=r.length){super(),this.charSequence=r,this.start=e,this.end=t}hasString(r,e){const t=this.charSequence.indexOf(r.str,this.start+e);return t!==-1&&t<=this.end-r.str.length}hasAnyString(r,e){return r.ac16?r.ac16.searchUTF16(this.charSequence,this.start+e,this.end):!1}step(r){if(r+=this.start,r>=this.end)return Rt.EOF();const e=this.charSequence.charCodeAt(r);if(e<X.MIN_HIGH_SURROGATE||e>X.MAX_HIGH_SURROGATE||r+1>=this.end)return e<<3|1;const t=this.charSequence.charCodeAt(r+1);return t>=X.MIN_LOW_SURROGATE&&t<=X.MAX_LOW_SURROGATE?(e-X.MIN_HIGH_SURROGATE)*1024+(t-X.MIN_LOW_SURROGATE)+X.MIN_SUPPLEMENTARY_CODE_POINT<<3|2:e<<3|1}index(r,e){e+=this.start;const t=this.charSequence.indexOf(r.prefix,e);return t<0||t>this.end-r.prefix.length?-1:t-e}context(r){r+=this.start;const e=r>this.start&&r<=this.end?this.charSequence.charCodeAt(r-1):-1,t=r<this.end?this.charSequence.charCodeAt(r):-1;return ne.emptyOpContext(e,t)}prefixLength(r){return r.prefix.length}},ke=class{static fromUTF8(r,e=0,t=r.length){return new uv(r,e,t)}static fromUTF16(r,e=0,t=r.length){return new lv(r,e,t)}},Ia=class extends Error{constructor(r){super(r),this.name="RE2JSException"}},Se=class extends Ia{constructor(r,e=null){let t=`error parsing regexp: ${r}`;e&&(t+=`: \`${e}\``),super(t),this.name="RE2JSSyntaxException",this.message=t,this.error=r,this.input=e}getDescription(){return this.error}getPattern(){return this.input}},Bv=class extends Ia{constructor(r){super(r),this.name="RE2JSCompileException"}},St=class extends Ia{constructor(r){super(r),this.name="RE2JSGroupException"}},hv=class extends Ia{constructor(r){super(r),this.name="RE2JSFlagsException"}},Lo=class extends Ia{constructor(r){super(r),this.name="RE2JSInternalException"}},us,IC=(us=class{static quoteReplacement(e,t=!1){return t?e.indexOf("\\")<0&&e.indexOf("$")<0?e:e.split("").map(n=>{const s=n.codePointAt(0);return s===L.CODES.get("\\")||s===L.CODES.get("$")?`\\${n}`:n}).join(""):e.indexOf("$")<0?e:e.split("").map(n=>n.codePointAt(0)===L.CODES.get("$")?"$$":n).join("")}constructor(e,t){if(e===null)throw new Error("pattern is null");this.patternInput=e;const n=this.patternInput.re2();this.patternGroupCount=n.numberOfCapturingGroups(),this.groups=[],this.namedGroups=n.namedGroups,this.numberOfInstructions=n.numberOfInstructions(),t instanceof fs?this.resetMatcherInput(t):ne.isByteArray(t)?this.resetMatcherInput(os.utf8(t)):this.resetMatcherInput(os.utf16(t))}pattern(){return this.patternInput}reset(){return this.matcherInputLength=this.matcherInput.length(),this.appendPos=0,this.hasMatch=!1,this.hasGroups=!1,this.anchorFlag=0,this}resetMatcherInput(e){if(e===null)throw new Error("input is null");return e instanceof fs||(ne.isByteArray(e)?e=os.utf8(e):e=os.utf16(e)),this.matcherInput=e,this.reset(),this}start(e=0){if(typeof e=="string"){const t=this.namedGroups[e];if(!Number.isFinite(t))throw new St(`group '${e}' not found`);e=t}return this.loadGroup(e),this.groups[2*e]}end(e=0){if(typeof e=="string"){const t=this.namedGroups[e];if(!Number.isFinite(t))throw new St(`group '${e}' not found`);e=t}return this.loadGroup(e),this.groups[2*e+1]}programSize(){return this.numberOfInstructions}group(e=0){if(typeof e=="string"){const s=this.namedGroups[e];if(!Number.isFinite(s))throw new St(`group '${e}' not found`);e=s}const t=this.start(e),n=this.end(e);return t<0&&n<0?null:this.substring(t,n)}getNamedGroups(){if(!this.hasMatch)throw new St("perhaps no match attempted");const e=Object.create(null);for(const t of Object.keys(this.namedGroups))e[t]=this.group(t);return e}groupCount(){return this.patternGroupCount}loadGroup(e){if(e<0||e>this.patternGroupCount)throw new St(`Group index out of bounds: ${e}`);if(!this.hasMatch)throw new St("perhaps no match attempted");if(e===0||this.hasGroups)return;const t=this.matcherInputLength,n=this.patternInput.re2().matchMachineInput(this.matcherInput,this.groups[0],t,this.anchorFlag,1+this.patternGroupCount);if(!n[0])throw new St("inconsistency in matching group data");this.groups=n[1],this.hasGroups=!0}matches(){return this.genMatch(0,G.ANCHOR_BOTH)}lookingAt(){return this.genMatch(0,G.ANCHOR_START)}find(e=null){if(e!==null){if(e<0||e>this.matcherInputLength)throw new St(`start index out of bounds: ${e}`);return this.reset(),this.genMatch(e,0)}if(e=0,this.hasMatch&&(e=this.groups[1],this.groups[0]===this.groups[1])){const t=(this.matcherInput.isUTF16Encoding()?ke.fromUTF16(this.matcherInput.asCharSequence(),0,this.matcherInputLength):ke.fromUTF8(this.matcherInput.asBytes(),0,this.matcherInputLength)).step(e);t<0?e++:e+=t&7}return this.genMatch(e,G.UNANCHORED)}genMatch(e,t){const n=this.patternInput.re2().matchMachineInput(this.matcherInput,e,this.matcherInputLength,t,1);return n[0]?(this.groups=n[1],this.hasMatch=!0,this.hasGroups=this.patternGroupCount===0,this.anchorFlag=t,!0):(this.hasMatch=!1,!1)}substring(e,t){return this.matcherInput.isUTF8Encoding()?ne.utf8ByteArrayToString(this.matcherInput.asBytes().slice(e,t)):this.matcherInput.asCharSequence().substring(e,t).toString()}inputLength(){return this.matcherInputLength}appendReplacement(e,t=!1){let n="";const s=this.start(),i=this.end();return this.appendPos<s&&(n+=this.substring(this.appendPos,s)),this.appendPos=i,n+=t?this.appendReplacementInternalJava(e):this.appendReplacementInternalJs(e),n}appendReplacementInternalJava(e){let t="",n=0;const s=e.length;let i=0;for(;i<s;){const o=e.codePointAt(i);if(o===L.CODES.get("\\")){if(n<i&&(t+=e.substring(n,i)),i++,i>=s)throw new St("character to be escaped is missing");n=i,i++;continue}if(o===L.CODES.get("$")){if(n<i&&(t+=e.substring(n,i)),i+1>=s)throw new St("Illegal group reference: group index is missing");const a=e.codePointAt(i+1);if(L.CODES.get("0")<=a&&a<=L.CODES.get("9")){let c=a-L.CODES.get("0"),l=i+2;for(;l<s;l++){const d=e.codePointAt(l);if(d<L.CODES.get("0")||d>L.CODES.get("9")||c*10+d-L.CODES.get("0")>this.patternGroupCount)break;c=c*10+d-L.CODES.get("0")}if(c>this.patternGroupCount)throw new St(`n > number of groups: ${c}`);const B=this.group(c);B!==null&&(t+=B),i=l,n=i}else if(a===L.CODES.get("{")){let c=i+2;for(;c<s&&e.codePointAt(c)!==L.CODES.get("}");)c++;if(c>=s)throw new St("named capture group is missing trailing '}'");const l=e.substring(i+2,c),B=this.group(l);B!==null&&(t+=B),i=c+1,n=i}else throw new St("Illegal group reference");continue}i++}return n<s&&(t+=e.substring(n,s)),t}appendReplacementInternalJs(e){let t="",n=0;const s=e.length;for(let i=0;i<s-1;i++)if(e.codePointAt(i)===L.CODES.get("$")){let o=e.codePointAt(i+1);if(L.CODES.get("$")===o){n<i&&(t+=e.substring(n,i)),t+="$",i++,n=i+1;continue}else if(L.CODES.get("&")===o){n<i&&(t+=e.substring(n,i));const a=this.group(0);a!==null?t+=a:t+="$&",i++,n=i+1;continue}else if(L.CODES.get("`")===o){n<i&&(t+=e.substring(n,i)),t+=this.substring(0,this.start(0)),i++,n=i+1;continue}else if(L.CODES.get("'")===o){n<i&&(t+=e.substring(n,i)),t+=this.substring(this.end(0),this.matcherInputLength),i++,n=i+1;continue}else if(L.CODES.get("1")<=o&&o<=L.CODES.get("9")){let a=o-L.CODES.get("0");for(n<i&&(t+=e.substring(n,i)),i+=2;i<s&&(o=e.codePointAt(i),!(o<L.CODES.get("0")||o>L.CODES.get("9")||a*10+o-L.CODES.get("0")>this.patternGroupCount));i++)a=a*10+o-L.CODES.get("0");if(a>this.patternGroupCount){t+=`$${a}`,n=i,i--;continue}const c=this.group(a);c!==null&&(t+=c),n=i,i--;continue}else if(o===L.CODES.get("<")){n<i&&(t+=e.substring(n,i)),i++;let a=i+1;for(;a<e.length&&e.codePointAt(a)!==L.CODES.get(">")&&e.codePointAt(a)!==L.CODES.get(" ");)a++;if(a===e.length||e.codePointAt(a)!==L.CODES.get(">")){t+=e.substring(i-1,a+1),n=a+1,i=a;continue}const c=e.substring(i+1,a);if(Object.prototype.hasOwnProperty.call(this.namedGroups,c)){const l=this.group(c);l!==null&&(t+=l)}else t+=`$<${c}>`;n=a+1,i=a;continue}}return n<s&&(t+=e.substring(n,s)),t}appendTail(){return this.substring(this.appendPos,this.matcherInputLength)}replaceAll(e,t=!1){return this.replace(e,!0,t)}replaceFirst(e,t=!1){return this.replace(e,!1,t)}replace(e,t=!0,n=!1){let s="";this.reset();const i=typeof e=="function",o=Object.keys(this.namedGroups).length>0;let a=null;if(i){if(this.groupCount()>=us.MAX_REPLACER_ARGS)throw new St("Too many capture groups to safely invoke replacer function");a=this.matcherInput.isUTF8Encoding()?this.matcherInput.asBytes():this.matcherInput.asCharSequence()}for(;this.find()&&(s+=i?this.appendReplacementFunc(e,o,a):this.appendReplacement(e,n),!!t););return s+=this.appendTail(),s}appendReplacementFunc(e,t,n){let s="";const i=this.start(),o=this.end();this.appendPos<i&&(s+=this.substring(this.appendPos,i)),this.appendPos=o;const a=this.buildReplacerArgs(i,t,n);return s+=String(e(...a)),s}buildReplacerArgs(e,t,n){const s=[this.group(0)],i=this.groupCount();for(let o=1;o<=i;o++){const a=this.start(o);a<0?s.push(void 0):s.push(this.substring(a,this.end(o)))}if(s.push(e),s.push(n),t){const o=this.getNamedGroups();for(const a in o)o[a]===null&&(o[a]=void 0);s.push(o)}return s}},j(us,"MAX_REPLACER_ARGS",65535),us),ge,x=(ge=class{static isRuneOp(e){return ge.RUNE<=e&&e<=ge.RUNE_ANY_NOT_NL}static escapeRunes(e){let t='"';for(let n of e)t+=ne.escapeRune(n);return t+='"',t}constructor(e){this.op=e,this.out=0,this.arg=0,this.runes=[],this.next=null}matchRune(e){if(this.runes.length===1){const o=this.runes[0];return(this.arg&G.FOLD_CASE)!==0?X.equalsIgnoreCase(o,e):e===o}const t=this.runes.length;if(t===0)return!1;if(t===2||t===4||t===6||t===8){for(let o=0;o<t;o+=2){if(e<this.runes[o])return!1;if(e<=this.runes[o+1])return!0}return!1}let n=0,s=t>>1;for(;s>1;){const o=s>>1;n+=this.runes[n+o<<1]<=e?o:0,s-=o}n+=this.runes[n<<1]<=e?1:0;const i=n-1;return i>=0&&e<=this.runes[i<<1|1]}matchRunePos(e){if(this.runes.length===1){const o=this.runes[0];return(this.arg&G.FOLD_CASE)!==0?X.equalsIgnoreCase(o,e)?0:-1:e===o?0:-1}const t=this.runes.length;if(t===0)return-1;if(t===2||t===4||t===6||t===8){for(let o=0;o<t;o+=2){if(e<this.runes[o])return-1;if(e<=this.runes[o+1])return Math.floor(o/2)}return-1}let n=0,s=t>>1;for(;s>1;){const o=s>>1;n+=this.runes[n+o<<1]<=e?o:0,s-=o}n+=this.runes[n<<1]<=e?1:0;const i=n-1;return i>=0&&e<=this.runes[i<<1|1]?i:-1}toString(){switch(this.op){case ge.ALT:return`alt -> ${this.out}, ${this.arg}`;case ge.ALT_MATCH:return`altmatch -> ${this.out}, ${this.arg}`;case ge.CAPTURE:return`cap ${this.arg} -> ${this.out}`;case ge.EMPTY_WIDTH:return`empty ${this.arg} -> ${this.out}`;case ge.MATCH:return`match${this.arg!==0?` ${this.arg}`:""}`;case ge.FAIL:return"fail";case ge.NOP:return`nop -> ${this.out}`;case ge.LB_WRITE:return`lbwrite ${this.arg} -> ${this.out}`;case ge.LB_CHECK:return`lbcheck ${this.arg} -> ${this.out}`;case ge.RUNE:return this.runes===null?"rune <null>":["rune ",ge.escapeRunes(this.runes),(this.arg&G.FOLD_CASE)!==0?"/i":""," -> ",this.out].join("");case ge.RUNE1:return`rune1 ${ge.escapeRunes(this.runes)} -> ${this.out}`;case ge.RUNE_ANY:return`any -> ${this.out}`;case ge.RUNE_ANY_NOT_NL:return`anynotnl -> ${this.out}`;default:throw new Error("unhandled case in Inst.toString")}}},j(ge,"ALT",1),j(ge,"ALT_MATCH",2),j(ge,"CAPTURE",3),j(ge,"EMPTY_WIDTH",4),j(ge,"FAIL",5),j(ge,"MATCH",6),j(ge,"NOP",7),j(ge,"RUNE",8),j(ge,"RUNE1",9),j(ge,"RUNE_ANY",10),j(ge,"RUNE_ANY_NOT_NL",11),j(ge,"LB_WRITE",12),j(ge,"LB_CHECK",13),ge),yC=class{constructor(r){this.sparse=new Int32Array(r),this.densePcs=new Int32Array(r),this.denseCaps=null,this.size=0,this.ncap=0}init(r){this.ncap=r;const e=this.densePcs.length*r;(!this.denseCaps||this.denseCaps.length<e)&&(this.denseCaps=new Int32Array(e))}contains(r){const e=this.sparse[r];return e<this.size&&this.densePcs[e]===r}isEmpty(){return this.size===0}add(r){const e=this.size++;return this.sparse[r]=e,this.densePcs[e]=r,e}clear(){this.size=0}toString(){let r="{";for(let e=0;e<this.size;e++)e!==0&&(r+=", "),r+=this.densePcs[e];return r+="}",r}},dv=class oB{static fromRE2(e){const t=new oB;return t.prog=e.prog,t.re2=e,t.q0=new yC(t.prog.numInst()),t.q1=new yC(t.prog.numInst()),t.matched=!1,t.matchcap=new Int32Array(t.prog.numCap<2?2:t.prog.numCap),t.ncap=0,t}static fromMachine(e){return oB.fromRE2(e.re2)}constructor(){this.prog=null,this.re2=null,this.q0=null,this.q1=null,this.matched=!1,this.matchcap=null,this.ncap=0,this.lbTable=null}init(e){this.ncap=e,e>this.matchcap.length?this.matchcap=new Int32Array(e).fill(-1):this.matchcap.fill(-1),this.q0.init(e),this.q1.init(e),this.prog.numLb>0&&((!this.lbTable||this.lbTable.length<this.prog.numLb+1)&&(this.lbTable=new Int32Array(this.prog.numLb+1)),this.lbTable.fill(-1))}submatches(){return this.ncap===0?ne.emptyInts():ne.toArray(this.matchcap.subarray(0,this.ncap))}match(e,t,n){const s=this.re2.cond;if(s===ne.EMPTY_ALL||(n===G.ANCHOR_START||n===G.ANCHOR_BOTH)&&t!==0)return!1;this.matched=!1,this.matchcap.fill(-1);let i=this.prog.numLb>0?0:t,o=t,a=this.q0,c=this.q1,l=e.step(i),B=l>>3,d=l&7,C=-1,g=0;l!==Rt.EOF()&&(l=e.step(i+d),C=l>>3,g=l&7);let I;for(i===0?I=ne.emptyOpContext(-1,B):I=e.context(i);;){if(a.isEmpty()){if((s&ne.EMPTY_BEGIN_TEXT)!==0&&i!==0||(n===G.ANCHOR_START||n===G.ANCHOR_BOTH)&&i!==0||this.matched)break;if(this.prog.numLb===0&&this.re2.prefix.length!==0&&C!==this.re2.prefixRune&&e.canCheckPrefix()){const H=e.index(this.re2,i);if(H<0)break;i+=H,l=e.step(i),B=l>>3,d=l&7,l=e.step(i+d),C=l>>3,g=l&7,I=e.context(i)}}if(i===0&&this.prog.numLb>0)for(let H=0;H<this.prog.lbStarts.length;H++)this.add(a,this.prog.lbStarts[H],i,this.matchcap,0,I);!this.matched&&(i===0||n===G.UNANCHORED)&&i>=o&&(this.ncap>0&&(this.matchcap[0]=i),this.add(a,this.prog.start,i,this.matchcap,0,I));const P=i+d;if(I=e.context(P),this.step(a,c,i,P,B,I,n,i===e.endPos()),d===0||this.ncap===0&&this.matched)break;i+=d,B=C,d=g,B!==-1&&(l=e.step(i+d),C=l>>3,g=l&7);const F=a;a=c,c=F}return c.clear(),this.matched}matchSet(e,t,n){const s=this.re2.cond;if(s===ne.EMPTY_ALL)return[];if((n===G.ANCHOR_START||n===G.ANCHOR_BOTH)&&t!==0)return[];let i=this.prog.numLb>0?0:t,o=t,a=this.q0,c=this.q1,l=e.step(i),B=l>>3,d=l&7,C=-1,g=0;l!==Rt.EOF()&&(l=e.step(i+d),C=l>>3,g=l&7);let I=i===0?ne.emptyOpContext(-1,B):e.context(i);const P=new Set;for(;!(a.isEmpty()&&((s&ne.EMPTY_BEGIN_TEXT)!==0&&i!==0||(n===G.ANCHOR_START||n===G.ANCHOR_BOTH)&&i!==0));){if(i===0&&this.prog.numLb>0)for(let Z=0;Z<this.prog.lbStarts.length;Z++)this.add(a,this.prog.lbStarts[Z],i,this.matchcap,0,I);(i===0||n===G.UNANCHORED)&&i>=o&&this.add(a,this.prog.start,i,this.matchcap,0,I);const F=i+d;I=e.context(F);for(let Z=0;Z<a.size;Z++){const ee=a.densePcs[Z],Be=this.prog.inst[ee],he=Z*this.ncap;let ue=!1;switch(Be.op){case x.MATCH:if(n===G.ANCHOR_BOTH&&i!==e.endPos())break;P.add(Be.arg);break;case x.RUNE:ue=Be.matchRune(B);break;case x.RUNE1:ue=B===Be.runes[0];break;case x.RUNE_ANY:ue=!0;break;case x.RUNE_ANY_NOT_NL:ue=B!==10;break;default:continue}ue&&this.add(c,Be.out,F,a.denseCaps,he,I)}if(a.clear(),d===0)break;i+=d,B=C,d=g,B!==-1&&(l=e.step(i+d),C=l>>3,g=l&7);const H=a;a=c,c=H}return c.clear(),Array.from(P).sort((F,H)=>F-H)}step(e,t,n,s,i,o,a,c){const l=this.re2.longest;for(let B=0;B<e.size;B++){const d=e.densePcs[B],C=B*this.ncap;if(l&&this.matched&&this.ncap>0&&this.matchcap[0]<e.denseCaps[C])continue;const g=this.prog.inst[d];let I=!1;switch(g.op){case x.MATCH:if(a===G.ANCHOR_BOTH&&!c)break;if(this.ncap>0&&(!l||!this.matched||this.matchcap[1]<n)){e.denseCaps[C+1]=n;for(let P=0;P<this.ncap;P++)this.matchcap[P]=e.denseCaps[C+P]}l||(e.size=0),this.matched=!0;break;case x.RUNE:I=g.matchRune(i);break;case x.RUNE1:I=i===g.runes[0];break;case x.RUNE_ANY:I=!0;break;case x.RUNE_ANY_NOT_NL:I=i!==10;break;default:continue}I&&this.add(t,g.out,s,e.denseCaps,C,o)}e.clear()}add(e,t,n,s,i,o){for(;;){if(t===0||e.contains(t))return;const a=e.add(t),c=this.prog.inst[t];switch(c.op){case x.FAIL:return;case x.ALT:case x.ALT_MATCH:this.add(e,c.out,n,s,i,o),t=c.arg;continue;case x.EMPTY_WIDTH:if((c.arg&~o)===0){t=c.out;continue}return;case x.NOP:t=c.out;continue;case x.CAPTURE:if(c.arg<this.ncap){const l=s[i+c.arg];s[i+c.arg]=n,this.add(e,c.out,n,s,i,o),s[i+c.arg]=l;return}else{t=c.out;continue}case x.LB_WRITE:this.lbTable[Math.abs(c.arg)]=n,t=c.out;continue;case x.LB_CHECK:if(c.arg>0){if(this.lbTable[c.arg]===n){t=c.out;continue}}else if(this.lbTable[-c.arg]!==n){t=c.out;continue}return;case x.MATCH:case x.RUNE:case x.RUNE1:case x.RUNE_ANY:case x.RUNE_ANY_NOT_NL:if(this.ncap>0){const l=a*this.ncap;for(let B=0;B<this.ncap;B++)e.denseCaps[l+B]=s[i+B]}return;default:throw new Lo("unhandled")}}}};const wC=r=>{let e=-2128831035;for(let t=0;t<r.length;t++)e^=r[t],e=Math.imul(e,16777619);return e},fv=(r,e)=>{if(r.length!==e.length)return!1;for(let t=0;t<r.length;t++)if(r[t]!==e[t])return!1;return!0};var Cv=class{constructor(r,e,t=[]){this.nfaStates=r,this.isMatch=e,this.matchIDs=t,this.nextLatin1=new Array(X.MAX_LATIN1+1).fill(null),this.nextLatin1Anchored=new Array(X.MAX_LATIN1+1).fill(null),this.transKeys=[],this.transVals=[],this.lastSeen=0}},Nn,pv=(Nn=class{constructor(e,t=8388608){this.prog=e,this.stateCache=new Map,this.stateCount=0,this.startState=null,this.stateLimit=Math.max(1,Math.floor(t/Nn.STATE_MEMORY_ESTIMATE)),this.cacheClears=0,this.failed=!1,this.clock=0}computeClosure(e){const t=new Set,n=[...e];let s=!1;const i=[];for(;n.length>0;){const a=n.pop();if(t.has(a))continue;t.add(a);const c=this.prog.getInst(a);switch(c.op){case x.MATCH:s=!0,i.includes(c.arg)||i.push(c.arg);break;case x.ALT:case x.ALT_MATCH:n.push(c.out),n.push(c.arg);break;case x.NOP:case x.CAPTURE:n.push(c.out);break;case x.EMPTY_WIDTH:case x.LB_WRITE:case x.LB_CHECK:return null}}const o=Int32Array.from(t).sort();return i.sort((a,c)=>a-c),{pcs:o,isMatch:s,matchIDs:i}}getState(e){const t=this.computeClosure(e);if(!t)return null;const n=t.pcs,s=wC(n);let i=this.stateCache.get(s);if(i)for(let a=0;a<i.length;a++){const c=i[a];if(fv(c.nfaStates,n))return c.lastSeen=++this.clock,c}else i=[],this.stateCache.set(s,i);if(this.failed)return null;if(this.stateCount>=this.stateLimit){if(this.cacheClears++,this.cacheClears>=Nn.MAX_CACHE_CLEARS)return this.failed=!0,this.stateCache.clear(),this.stateCount=0,this.startState=null,null;this.evictCache(),i=this.stateCache.get(s),i||(i=[],this.stateCache.set(s,i))}const o=new Cv(n,t.isMatch,t.matchIDs);return o.lastSeen=++this.clock,i.push(o),this.stateCount++,o}evictCache(){const e=[];for(const o of this.stateCache.values())for(let a=0;a<o.length;a++)e.push(o[a]);e.sort((o,a)=>o.lastSeen-a.lastSeen);const t=Math.max(1,Math.floor(this.stateLimit/2)),n=e.length-t,s=e.slice(n),i=new Set(s);this.stateCache.clear(),this.stateCount=0;for(let o=0;o<s.length;o++){const a=s[o];a.nextLatin1.fill(null),a.nextLatin1Anchored.fill(null),a.transKeys.length=0,a.transVals.length=0;const c=wC(a.nfaStates);let l=this.stateCache.get(c);l||(l=[],this.stateCache.set(c,l)),l.push(a),this.stateCount++}this.startState&&!i.has(this.startState)&&(this.startState=null)}step(e,t,n){if(t<=X.MAX_LATIN1)if(n===G.UNANCHORED){const o=e.nextLatin1[t];if(o!==null)return o}else{const o=e.nextLatin1Anchored[t];if(o!==null)return o}else{const o=t+(n===G.UNANCHORED?0:X.MAX_RUNE+1),a=e.transKeys,c=a.length;for(let l=0;l<c;l++)if(a[l]===o)return e.transVals[l]}const s=[];for(let o=0;o<e.nfaStates.length;o++){const a=e.nfaStates[o],c=this.prog.getInst(a);x.isRuneOp(c.op)&&c.matchRune(t)&&s.push(c.out)}n===G.UNANCHORED&&s.push(this.prog.start);const i=this.getState(s);if(t<=X.MAX_LATIN1)n===G.UNANCHORED?e.nextLatin1[t]=i:e.nextLatin1Anchored[t]=i;else{const o=t+(n===G.UNANCHORED?0:X.MAX_RUNE+1);e.transKeys.push(o),e.transVals.push(i)}return i}match(e,t,n){if((n===G.ANCHOR_START||n===G.ANCHOR_BOTH)&&t!==0)return!1;if(!this.startState&&(this.startState=this.getState([this.prog.start]),!this.startState))return null;let s=e.endPos(),i=this.startState;if(i.isMatch)if(n===G.ANCHOR_BOTH){if(t===s)return!0}else return!0;let o=t;for(;o<s;){const a=e.step(o),c=a>>3,l=a&7;if(l===0)break;if(i=n===G.UNANCHORED&&c<=X.MAX_LATIN1&&i.nextLatin1[c]||this.step(i,c,n),i===null)return null;if(i.lastSeen=++this.clock,i.isMatch)if(n===G.ANCHOR_BOTH){if(o+l===s)return!0}else return!0;if(i.nfaStates.length===0&&n!==G.UNANCHORED)return!1;o+=l}return!1}matchSet(e,t,n){if((n===G.ANCHOR_START||n===G.ANCHOR_BOTH)&&t!==0)return[];if(!this.startState&&(this.startState=this.getState([this.prog.start]),!this.startState))return null;let s=e.endPos(),i=this.startState;const o=new Set,a=(l,B)=>{l.isMatch&&(n===G.ANCHOR_BOTH?B===s&&l.matchIDs.forEach(d=>o.add(d)):l.matchIDs.forEach(d=>o.add(d)))};a(i,t);let c=t;for(;c<s;){const l=e.step(c),B=l>>3,d=l&7;if(d===0)break;if(i=n===G.UNANCHORED&&B<=X.MAX_LATIN1&&i.nextLatin1[B]||this.step(i,B,n),i===null)return null;if(i.lastSeen=++this.clock,c+=d,a(i,c),i.nfaStates.length===0&&n!==G.UNANCHORED)break}return Array.from(o).sort((l,B)=>l-B)}},j(Nn,"MAX_CACHE_CLEARS",5),j(Nn,"STATE_MEMORY_ESTIMATE",838),Nn);const gv=32,mv=500,kl=256,_v=256*1024;var Ev=class{constructor(){this.end=0,this.cap=new Int32Array(0),this.matchcap=new Int32Array(0),this.ncap=0,this.jobPc=new Int32Array(kl),this.jobArg=new Uint8Array(kl),this.jobPos=new Int32Array(kl),this.jobLen=0,this.visited=new Uint32Array(0)}reset(r,e,t){this.end=e,this.jobLen=0,this.ncap=t;const n=r.numInst()*(e+1)+gv-1>>>5;this.visited.length<n?this.visited=new Uint32Array(n):this.visited.fill(0,0,n),this.cap.length<t?this.cap=new Int32Array(t).fill(-1):this.cap.fill(-1,0,t),this.matchcap.length<t?this.matchcap=new Int32Array(t).fill(-1):this.matchcap.fill(-1,0,t)}shouldVisit(r,e){const t=r*(this.end+1)+e,n=t>>>5,s=1<<(t&31);return(this.visited[n]&s)!==0?!1:(this.visited[n]|=s,!0)}push(r,e,t,n){if(r.prog.getInst(e).op!==x.FAIL&&(n||this.shouldVisit(e,t))){if(this.jobLen>=this.jobPc.length){const s=this.jobPc.length*2,i=new Int32Array(s);i.set(this.jobPc),this.jobPc=i;const o=new Uint8Array(s);o.set(this.jobArg),this.jobArg=o;const a=new Int32Array(s);a.set(this.jobPos),this.jobPos=a}this.jobPc[this.jobLen]=e,this.jobArg[this.jobLen]=n?1:0,this.jobPos[this.jobLen]=t,this.jobLen++}}tryBacktrack(r,e,t,n,s){const i=r.longest;for(this.push(r,t,n,!1);this.jobLen>0;){this.jobLen--;let o=this.jobPc[this.jobLen],a=this.jobArg[this.jobLen]===1,c=this.jobPos[this.jobLen],l=!0;for(;!(!l&&!this.shouldVisit(o,c));){l=!1;const B=r.prog.getInst(o);switch(B.op){case x.FAIL:throw new Lo("unexpected InstFail");case x.ALT:if(a){a=!1,o=B.arg;continue}else{this.push(r,o,c,!0),o=B.out;continue}case x.ALT_MATCH:{const d=r.prog.getInst(B.out);if(x.isRuneOp(d.op)){this.push(r,B.arg,c,!1),o=B.arg,c=this.end;continue}this.push(r,B.out,this.end,!1),o=B.out;continue}case x.RUNE:{const d=e.step(c);if(d===Rt.EOF()||!B.matchRune(d>>3))break;c+=d&7,o=B.out;continue}case x.RUNE1:{const d=e.step(c);if(d===Rt.EOF()||d>>3!==B.runes[0])break;c+=d&7,o=B.out;continue}case x.RUNE_ANY_NOT_NL:{const d=e.step(c);if(d===Rt.EOF()||d>>3===10)break;c+=d&7,o=B.out;continue}case x.RUNE_ANY:{const d=e.step(c);if(d===Rt.EOF())break;c+=d&7,o=B.out;continue}case x.CAPTURE:if(a){this.cap[B.arg]=c;break}else{B.arg<this.ncap&&(this.push(r,o,this.cap[B.arg],!0),this.cap[B.arg]=c),o=B.out;continue}case x.EMPTY_WIDTH:{const d=e.context(c);if((B.arg&~d)!==0)break;o=B.out;continue}case x.NOP:o=B.out;continue;case x.MATCH:{if(s===G.ANCHOR_BOTH&&c!==this.end)break;if(this.ncap===0)return!0;this.ncap>1&&(this.cap[1]=c);const d=this.matchcap[1];if((d===-1||i&&c>0&&c>d)&&this.matchcap.set(this.cap),!i||c===this.end)return!0;break}case x.LB_WRITE:case x.LB_CHECK:throw new Lo("Backtracker cannot evaluate Lookbehind instructions");default:throw new Lo("bad inst")}break}}return i&&this.matchcap.length>1&&this.matchcap[1]>=0}};const ac=[];var cc=class Jm{static shouldBacktrack(e){return e.numInst()<=mv}static maxBitStateLen(e){return Jm.shouldBacktrack(e)?Math.floor(_v/e.numInst()):0}static execute(e,t,n,s,i){const o=e.cond;if(o===ne.EMPTY_ALL||(s===G.ANCHOR_START||s===G.ANCHOR_BOTH)&&n!==0||(o&ne.EMPTY_BEGIN_TEXT)!==0&&n!==0)return null;const a=ac.length>0?ac.pop():new Ev,c=t.endPos();a.reset(e.prog,c,i);let l=!1;if((o&ne.EMPTY_BEGIN_TEXT)!==0||s===G.ANCHOR_START||s===G.ANCHOR_BOTH)a.ncap>0&&(a.cap[0]=n),a.tryBacktrack(e,t,e.prog.start,n,s)&&(l=!0);else{let d=-1;for(;n<=c&&d!==0;n+=d){if(e.prefix.length>0){const g=t.index(e,n);if(g<0)break;n+=g}if(a.ncap>0&&(a.cap[0]=n),a.tryBacktrack(e,t,e.prog.start,n,s)){l=!0;break}const C=t.step(n);d=C===Rt.EOF()?0:C&7}}if(!l)return ac.push(a),null;const B=i===0?[]:ne.toArray(a.matchcap.subarray(0,i));return ac.push(a),B}},DC=class{constructor(r){this.sparse=new Uint32Array(r),this.dense=new Uint32Array(r),this.size=0,this.nextIndex=0}empty(){return this.nextIndex>=this.size}next(){return this.dense[this.nextIndex++]}clear(){this.size=0,this.nextIndex=0}contains(r){return r<this.sparse.length&&this.sparse[r]<this.size&&this.dense[this.sparse[r]]===r}insert(r){this.contains(r)||this.insertNew(r)}insertNew(r){r>=this.sparse.length||(this.sparse[r]=this.size,this.dense[this.size]=r,this.size++)}};const Iv=(r,e,t,n)=>{const s=r.length,i=e.length;let o=0,a=0;const c=[],l=[];let B=!0,d=-1;const C=g=>{const I=g?r:e,P=g?o:a,F=g?t:n;return d>0&&I[P]<=c[d]?!1:(c.push(I[P],I[P+1]),g?o+=2:a+=2,d+=2,l.push(F),!0)};for(;o<s||a<i;)if(a>=i?B=C(!0):o>=s||e[a]<r[o]?B=C(!1):B=C(!0),!B)return null;return{merged:c,next:l}};var yv=class{constructor(r){this.start=r.start,this.numCap=r.numCap,this.inst=new Array(r.inst.length);for(let e=0;e<r.inst.length;e++){const t=r.inst[e],n=new x(t.op);n.out=t.out,n.arg=t.arg,n.runes=t.runes?t.runes.slice():[],n.next=null,this.inst[e]=n}}};const wv=r=>{const e=new yv(r);for(let t=0;t<e.inst.length;t++){const n=e.inst[t];if(n.op!==x.ALT&&n.op!==x.ALT_MATCH)continue;let s="out",i="arg",o=e.inst[n[i]];if(o.op!==x.ALT&&o.op!==x.ALT_MATCH&&(s="arg",i="out",o=e.inst[n[i]],o.op!==x.ALT&&o.op!==x.ALT_MATCH))continue;const a=e.inst[n[s]];if(a.op===x.ALT||a.op===x.ALT_MATCH)continue;let c="out",l="arg",B=!1;o.out===t?B=!0:o.arg===t&&(B=!0,c="arg",l="out"),B&&(o[c]=n[s]),n[s]===o[c]&&(n[i]=o[l])}return e},Dv=r=>{if(r.inst.length>=1e3)return null;const e=new DC(r.inst.length),t=new DC(r.inst.length),n=new Array(r.inst.length),s=new Array(r.inst.length).fill(!1),i=o=>{let a=!0;const c=r.inst[o];if(t.contains(o))return!0;switch(t.insert(o),c.op){case x.ALT:case x.ALT_MATCH:{a=i(c.out)&&i(c.arg);let l=s[c.out],B=s[c.arg];if(l&&B)return!1;if(B){const I=c.out;c.out=c.arg,c.arg=I;const P=l;l=B,B=P}l&&(s[o]=!0,c.op=x.ALT_MATCH);const d=n[c.out]||[],C=n[c.arg]||[],g=Iv(d,C,c.out,c.arg);if(!g)return!1;n[o]=g.merged,c.next=new Uint32Array(g.next);break}case x.CAPTURE:case x.EMPTY_WIDTH:case x.NOP:a=i(c.out),s[o]=s[c.out],n[o]=n[c.out]?n[c.out].slice():[],c.next=new Uint32Array(Math.floor(n[o].length/2)+1).fill(c.out);break;case x.MATCH:case x.FAIL:s[o]=c.op===x.MATCH;break;case x.RUNE:{if(s[o]=!1,c.next&&c.next.length>0)break;if(e.insert(c.out),!c.runes||c.runes.length===0){n[o]=[],c.next=new Uint32Array([c.out]);break}let l=[];if(c.runes.length===1&&(c.arg&G.FOLD_CASE)!==0){const B=c.runes[0];l.push(B,B);for(let d=X.simpleFold(B);d!==B;d=X.simpleFold(d))l.push(d,d);l.sort((d,C)=>d-C)}else for(let B=0;B<c.runes.length;B++)l.push(c.runes[B]);n[o]=l,c.next=new Uint32Array(Math.floor(l.length/2)+1).fill(c.out),c.op=x.RUNE;break}case x.RUNE1:{if(s[o]=!1,c.next&&c.next.length>0)break;e.insert(c.out);let l=[];if((c.arg&G.FOLD_CASE)!==0){const B=c.runes[0];l.push(B,B);for(let d=X.simpleFold(B);d!==B;d=X.simpleFold(d))l.push(d,d);l.sort((d,C)=>d-C)}else l.push(c.runes[0],c.runes[0]);n[o]=l,c.next=new Uint32Array(Math.floor(l.length/2)+1).fill(c.out),c.op=x.RUNE;break}case x.RUNE_ANY:if(s[o]=!1,c.next&&c.next.length>0)break;e.insert(c.out),n[o]=[0,X.MAX_RUNE],c.next=new Uint32Array([c.out]);break;case x.RUNE_ANY_NOT_NL:if(s[o]=!1,c.next&&c.next.length>0)break;e.insert(c.out),n[o]=[0,9,11,X.MAX_RUNE],c.next=new Uint32Array(Math.floor(n[o].length/2)+1).fill(c.out);break}return a};for(e.clear(),e.insert(r.start);!e.empty();)if(t.clear(),!i(e.next()))return null;for(let o=0;o<r.inst.length;o++)n[o]&&(r.inst[o].runes=n[o]);return r},Tv=(r,e)=>{for(let t=0;t<e.inst.length;t++){const n=e.inst[t];switch(n.op){case x.ALT:case x.ALT_MATCH:case x.RUNE:break;case x.CAPTURE:case x.EMPTY_WIDTH:case x.NOP:case x.MATCH:case x.FAIL:r.inst[t].next=null;break;case x.RUNE1:case x.RUNE_ANY:case x.RUNE_ANY_NOT_NL:r.inst[t].next=null,r.inst[t].op=n.op,r.inst[t].runes=n.runes?n.runes.slice():[];break}}};var TC=class Km{static compile(e){if(e.start===0||e.numLb>0)return null;const t=e.inst[e.start];if(t.op!==x.EMPTY_WIDTH||(t.arg&ne.EMPTY_BEGIN_TEXT)===0)return null;let n=!1;for(let i=0;i<e.inst.length;i++)if(e.inst[i].op===x.ALT||e.inst[i].op===x.ALT_MATCH){n=!0;break}for(let i=0;i<e.inst.length;i++){const o=e.inst[i],a=e.inst[o.out].op;switch(o.op){case x.ALT:case x.ALT_MATCH:if(a===x.MATCH||e.inst[o.arg].op===x.MATCH)return null;break;case x.EMPTY_WIDTH:if(a===x.MATCH){if((o.arg&ne.EMPTY_END_TEXT)===ne.EMPTY_END_TEXT)continue;return null}break;default:if(a===x.MATCH&&n)return null;break}}let s=wv(e);return s=Dv(s),s!==null&&Tv(s,e),s}static next(e,t){const n=e.matchRunePos(t);return n>=0?e.next[n]:e.op===x.ALT_MATCH?e.out:0}static execute(e,t,n,s,i){const o=e.onepass;if(!o)return null;const a=new Int32Array(i).fill(-1);let c=!1,l=t.step(n),B=l>>3,d=l&7,C=Rt.EOF(),g=-1,I=0;l!==Rt.EOF()&&(C=t.step(n+d),C!==Rt.EOF()&&(g=C>>3,I=C&7));let P=n===0?ne.emptyOpContext(-1,B):t.context(n),F=o.start,H;for(;;){switch(H=o.inst[F],F=H.out,H.op){case x.MATCH:return s===G.ANCHOR_BOTH&&n!==t.endPos()?null:(c=!0,a.length>0&&(a[0]=0,a[1]=n),i===0?[]:ne.toArray(a));case x.RUNE:if(!H.matchRune(B))return null;break;case x.RUNE1:if(B!==H.runes[0])return null;break;case x.RUNE_ANY:break;case x.RUNE_ANY_NOT_NL:if(B===10)return null;break;case x.ALT:case x.ALT_MATCH:F=Km.next(H,B);continue;case x.FAIL:return null;case x.NOP:continue;case x.EMPTY_WIDTH:if((H.arg&~P)!==0)return null;continue;case x.CAPTURE:H.arg<a.length&&(a[H.arg]=n);continue;default:throw new Lo("bad inst")}if(d===0)break;P=ne.emptyOpContext(B,g),n+=d,B=g,d=I,B!==-1&&(C=t.step(n+d),C!==Rt.EOF()?(g=C>>3,I=C&7):(g=-1,I=0))}return c?i===0?[]:ne.toArray(a):null}},re,R=(re=class{static isPseudoOp(e){return e>=re.Op.LEFT_PAREN}static emptySubs(){return[]}static quoteIfHyphen(e){return e===L.CODES.get("-")?"\\":""}static fromRegexp(e){const t=new re(e.op);return t.flags=e.flags,t.subs=e.subs,t.runes=e.runes,t.cap=e.cap,t.min=e.min,t.max=e.max,t.name=e.name,t.namedGroups=e.namedGroups,t.lb=e.lb,t}constructor(e){this.op=e,this.flags=0,this.subs=re.emptySubs(),this.runes=[],this.min=0,this.max=0,this.cap=0,this.name=null,this.namedGroups=Object.create(null),this.lb=0}reinit(){this.flags=0,this.subs=re.emptySubs(),this.runes=[],this.cap=0,this.min=0,this.max=0,this.name=null,this.namedGroups=Object.create(null),this.lb=0}toString(){return this.appendTo()}appendTo(){let e="";switch(this.op){case re.Op.NO_MATCH:e+="[^\\x00-\\x{10FFFF}]";break;case re.Op.EMPTY_MATCH:e+="(?:)";break;case re.Op.STAR:case re.Op.PLUS:case re.Op.QUEST:case re.Op.REPEAT:{const t=this.subs[0];switch(t.op>re.Op.CAPTURE||t.op===re.Op.LITERAL&&t.runes.length>1?e+=`(?:${t.appendTo()})`:e+=t.appendTo(),this.op){case re.Op.STAR:e+="*";break;case re.Op.PLUS:e+="+";break;case re.Op.QUEST:e+="?";break;case re.Op.REPEAT:e+=`{${this.min}`,this.min!==this.max&&(e+=",",this.max>=0&&(e+=this.max)),e+="}";break}(this.flags&G.NON_GREEDY)!==0&&(e+="?");break}case re.Op.CONCAT:for(let t of this.subs)t.op===re.Op.ALTERNATE?e+=`(?:${t.appendTo()})`:e+=t.appendTo();break;case re.Op.ALTERNATE:{let t="";for(let n of this.subs)e+=t,t="|",e+=n.appendTo();break}case re.Op.LITERAL:(this.flags&G.FOLD_CASE)!==0&&(e+="(?i:");for(let t of this.runes)e+=ne.escapeRune(t);(this.flags&G.FOLD_CASE)!==0&&(e+=")");break;case re.Op.ANY_CHAR_NOT_NL:e+="(?-s:.)";break;case re.Op.ANY_CHAR:e+="(?s:.)";break;case re.Op.PLB:e+=`(?<=${this.subs[0].appendTo()})`;break;case re.Op.NLB:e+=`(?<!${this.subs[0].appendTo()})`;break;case re.Op.CAPTURE:this.name===null||this.name.length===0?e+="(":e+=`(?P<${this.name}>`,this.subs[0].op!==re.Op.EMPTY_MATCH&&(e+=this.subs[0].appendTo()),e+=")";break;case re.Op.BEGIN_TEXT:e+="\\A";break;case re.Op.END_TEXT:(this.flags&G.WAS_DOLLAR)!==0?e+="(?-m:$)":e+="\\z";break;case re.Op.BEGIN_LINE:e+="^";break;case re.Op.END_LINE:e+="$";break;case re.Op.WORD_BOUNDARY:e+="\\b";break;case re.Op.NO_WORD_BOUNDARY:e+="\\B";break;case re.Op.CHAR_CLASS:if(this.runes.length%2!==0){e+="[invalid char class]";break}if(e+="[",this.runes.length===0)e+="^\\x00-\\x{10FFFF}";else if(this.runes[0]===0&&this.runes[this.runes.length-1]===X.MAX_RUNE){e+="^";for(let t=1;t<this.runes.length-1;t+=2){const n=this.runes[t]+1,s=this.runes[t+1]-1;e+=re.quoteIfHyphen(n),e+=ne.escapeRune(n),n!==s&&(e+="-",e+=re.quoteIfHyphen(s),e+=ne.escapeRune(s))}}else for(let t=0;t<this.runes.length;t+=2){const n=this.runes[t],s=this.runes[t+1];e+=re.quoteIfHyphen(n),e+=ne.escapeRune(n),n!==s&&(e+="-",e+=re.quoteIfHyphen(s),e+=ne.escapeRune(s))}e+="]";break;default:e+=this.op;break}return e}maxCap(){let e=0;if(this.op===re.Op.CAPTURE&&(e=this.cap),this.subs!==null)for(let t of this.subs){const n=t.maxCap();e<n&&(e=n)}return e}equals(e){if(!(e!==null&&e instanceof re)||this.op!==e.op)return!1;switch(this.op){case re.Op.END_TEXT:if((this.flags&G.WAS_DOLLAR)!==(e.flags&G.WAS_DOLLAR))return!1;break;case re.Op.LITERAL:case re.Op.CHAR_CLASS:if(this.runes===null&&e.runes===null)break;if(this.runes===null||e.runes===null||this.runes.length!==e.runes.length)return!1;for(let t=0;t<this.runes.length;t++)if(this.runes[t]!==e.runes[t])return!1;break;case re.Op.ALTERNATE:case re.Op.CONCAT:if(this.subs.length!==e.subs.length)return!1;for(let t=0;t<this.subs.length;++t)if(!this.subs[t].equals(e.subs[t]))return!1;break;case re.Op.STAR:case re.Op.PLUS:case re.Op.QUEST:if((this.flags&G.NON_GREEDY)!==(e.flags&G.NON_GREEDY)||!this.subs[0].equals(e.subs[0]))return!1;break;case re.Op.REPEAT:if((this.flags&G.NON_GREEDY)!==(e.flags&G.NON_GREEDY)||this.min!==e.min||this.max!==e.max||!this.subs[0].equals(e.subs[0]))return!1;break;case re.Op.CAPTURE:if(this.cap!==e.cap||(this.name===null?e.name!==null:this.name!==e.name)||!this.subs[0].equals(e.subs[0]))return!1;break;case re.Op.PLB:case re.Op.NLB:if(this.lb!==e.lb||!this.subs[0].equals(e.subs[0]))return!1;break}return!0}},j(re,"Op",jm(["NO_MATCH","EMPTY_MATCH","LITERAL","CHAR_CLASS","ANY_CHAR_NOT_NL","ANY_CHAR","BEGIN_LINE","END_LINE","BEGIN_TEXT","END_TEXT","WORD_BOUNDARY","NO_WORD_BOUNDARY","CAPTURE","STAR","PLUS","QUEST","REPEAT","CONCAT","ALTERNATE","PLB","NLB","LEFT_PAREN","VERTICAL_BAR"])),re),AC=class{constructor(r){this.next=[Object.create(null)],this.fail=[0],this.match=[!1];for(const t of r){let n=0;for(let s=0;s<t.length;s++){const i=t[s];i in this.next[n]||(this.next.push(Object.create(null)),this.fail.push(0),this.match.push(!1),this.next[n][i]=this.next.length-1),n=this.next[n][i]}this.match[n]=!0}const e=[];for(const t in this.next[0])if(Object.prototype.hasOwnProperty.call(this.next[0],t)){const n=this.next[0][t];this.fail[n]=0,e.push(n)}for(;e.length>0;){const t=e.shift();for(const n in this.next[t])if(Object.prototype.hasOwnProperty.call(this.next[t],n)){const s=this.next[t][n];let i=this.fail[t];for(;i!==0&&!(n in this.next[i]);)i=this.fail[i];n in this.next[i]?this.fail[s]=this.next[i][n]:this.fail[s]=0,this.match[s]=this.match[s]||this.match[this.fail[s]],e.push(s)}}}searchUTF16(r,e,t){let n=0;for(let s=e;s<t;s++){const i=r.charCodeAt(s);for(;n!==0&&!(i in this.next[n]);)n=this.fail[n];if(i in this.next[n]&&(n=this.next[n][i]),this.match[n])return!0}return!1}searchUTF8(r,e,t){let n=0;for(let s=e;s<t;s++){const i=r[s];for(;n!==0&&!(i in this.next[n]);)n=this.fail[n];if(i in this.next[n]&&(n=this.next[n][i]),this.match[n])return!0}return!1}},_n,Ie=(_n=class{constructor(e){this.type=e,this.subs=[],this.str="",this.bytes=null,this.ac16=null,this.ac8=null}eval(e,t){switch(this.type){case _n.Type.NONE:return!0;case _n.Type.EXACT:return e.hasString(this,t);case _n.Type.AND:for(let n=0;n<this.subs.length;n++)if(!this.subs[n].eval(e,t))return!1;return!0;case _n.Type.OR:if(this.ac16&&this.ac8)return e.hasAnyString(this,t);for(let n=0;n<this.subs.length;n++)if(this.subs[n].eval(e,t))return!0;return!1;default:return!0}}},j(_n,"Type",{NONE:0,EXACT:1,AND:2,OR:3}),_n),Av=class Pn{static build(e){const t=Pn.fromRegexp(e);return Pn.simplify(t)}static fromRegexp(e){if(!e)return new Ie(Ie.Type.NONE);switch(e.op){case R.Op.PLB:case R.Op.NLB:case R.Op.NO_MATCH:case R.Op.EMPTY_MATCH:case R.Op.BEGIN_LINE:case R.Op.END_LINE:case R.Op.BEGIN_TEXT:case R.Op.END_TEXT:case R.Op.WORD_BOUNDARY:case R.Op.NO_WORD_BOUNDARY:case R.Op.CHAR_CLASS:case R.Op.ANY_CHAR_NOT_NL:case R.Op.ANY_CHAR:return new Ie(Ie.Type.NONE);case R.Op.LITERAL:{if(e.runes.length===0||(e.flags&G.FOLD_CASE)!==0)return new Ie(Ie.Type.NONE);const t=new Ie(Ie.Type.EXACT);let n="";for(let s=0;s<e.runes.length;s++)n+=String.fromCodePoint(e.runes[s]);return t.str=n,t.bytes=ne.stringToUtf8ByteArray(t.str),t}case R.Op.CAPTURE:case R.Op.PLUS:return Pn.fromRegexp(e.subs[0]);case R.Op.REPEAT:return e.min>=1?Pn.fromRegexp(e.subs[0]):new Ie(Ie.Type.NONE);case R.Op.CONCAT:{const t=new Ie(Ie.Type.AND);for(const n of e.subs)t.subs.push(Pn.fromRegexp(n));return t}case R.Op.ALTERNATE:{const t=new Ie(Ie.Type.OR);for(const n of e.subs)t.subs.push(Pn.fromRegexp(n));return t}default:return new Ie(Ie.Type.NONE)}}static simplify(e){if(e.type===Ie.Type.EXACT||e.type===Ie.Type.NONE)return e;if(e.type===Ie.Type.AND){const t=[];for(const n of e.subs){const s=Pn.simplify(n);if(s.type!==Ie.Type.NONE)if(s.type===Ie.Type.AND)for(let i=0;i<s.subs.length;i++)t.push(s.subs[i]);else t.push(s)}return t.length===0?new Ie(Ie.Type.NONE):t.length===1?t[0]:(e.subs=t,e)}if(e.type===Ie.Type.OR){const t=[];for(const o of e.subs){const a=Pn.simplify(o);if(a.type===Ie.Type.NONE)return new Ie(Ie.Type.NONE);if(a.type===Ie.Type.OR)for(let c=0;c<a.subs.length;c++)t.push(a.subs[c]);else t.push(a)}if(t.length===0)return new Ie(Ie.Type.NONE);if(t.length===1)return t[0];const n=new Set,s=[];for(const o of t)o.type===Ie.Type.EXACT?n.has(o.str)||(n.add(o.str),s.push(o)):s.push(o);e.subs=s;let i=!0;for(const o of s)if(o.type!==Ie.Type.EXACT){i=!1;break}return i&&s.length>1&&(e.ac16=new AC(s.map(o=>{const a=[];for(let c=0;c<o.str.length;c++)a.push(o.str.charCodeAt(c));return a})),e.ac8=new AC(s.map(o=>o.bytes))),e}return e}},Qt=class{constructor(r=0,e=0){this.head=r,this.tail=e}},Rv=class{constructor(){this.inst=[],this.start=0,this.numCap=2,this.lbStarts=[],this.numLb=0}getInst(r){return this.inst[r]}numInst(){return this.inst.length}addInst(r){this.inst.push(new x(r))}skipNop(r){let e=this.inst[r];for(;e.op===x.NOP||e.op===x.CAPTURE;)e=this.inst[r],r=e.out;return e}prefix(){let r="",e=this.skipNop(this.start);if(!x.isRuneOp(e.op)||e.runes.length!==1)return[e.op===x.MATCH,r];for(;x.isRuneOp(e.op)&&e.runes.length===1&&(e.arg&G.FOLD_CASE)===0;)r+=String.fromCodePoint(e.runes[0]),e=this.skipNop(e.out);return[e.op===x.MATCH,r]}startCond(){let r=0,e=this.start;e:for(;;){const t=this.inst[e];switch(t.op){case x.EMPTY_WIDTH:r|=t.arg;break;case x.FAIL:return-1;case x.CAPTURE:case x.NOP:break;default:break e}e=t.out}return r}patch(r,e){let t=r.head;for(;t!==0;){const n=this.inst[t>>1];(t&1)===0?(t=n.out,n.out=e):(t=n.arg,n.arg=e)}}append(r,e){if(r.head===0)return e;if(e.head===0)return r;const t=this.inst[r.tail>>1];return(r.tail&1)===0?t.out=e.head:t.arg=e.head,new Qt(r.head,e.tail)}toString(){let r="";for(let e=0;e<this.inst.length;e++){const t=r.length;r+=e,e===this.start&&(r+="*"),r+="        ".substring(r.length-t),r+=this.inst[e],r+=`
`}return r}},uc=class{constructor(r=0,e=new Qt,t=!1){this.i=r,this.out=e,this.nullable=t}},vv=class Ks{static ANY_RUNE_NOT_NL(){return[0,L.CODES.get(`
`)-1,L.CODES.get(`
`)+1,X.MAX_RUNE]}static ANY_RUNE(){return[0,X.MAX_RUNE]}static compileRegexp(e){const t=new Ks,n=t.compile(e);return t.prog.patch(n.out,t.newInst(x.MATCH).i),t.prog.start=n.i,t.prog}static compileSet(e){const t=new Ks;if(e.length===0)return t.prog.start=t.newInst(x.FAIL).i,t.prog;let n=[];for(let i=0;i<e.length;i++){const o=t.compile(e[i]),a=t.newInst(x.MATCH);t.prog.getInst(a.i).arg=i,t.prog.patch(o.out,a.i),n.push(o.i)}let s=n[0];for(let i=1;i<n.length;i++){const o=t.newInst(x.ALT),a=t.prog.getInst(o.i);a.out=s,a.arg=n[i],s=o.i}return t.prog.start=s,t.prog}constructor(){this.prog=new Rv,this.newInst(x.FAIL)}newInst(e){return this.prog.addInst(e),new uc(this.prog.numInst()-1,new Qt,!0)}nop(){const e=this.newInst(x.NOP);return e.out=new Qt(e.i<<1,e.i<<1),e}fail(){return new uc}cap(e){const t=this.newInst(x.CAPTURE);return t.out=new Qt(t.i<<1,t.i<<1),this.prog.getInst(t.i).arg=e,this.prog.numCap<e+1&&(this.prog.numCap=e+1),t}cat(e,t){return e.i===0||t.i===0?this.fail():(this.prog.patch(e.out,t.i),new uc(e.i,t.out,e.nullable&&t.nullable))}alt(e,t){if(e.i===0)return t;if(t.i===0)return e;const n=this.newInst(x.ALT),s=this.prog.getInst(n.i);return s.out=e.i,s.arg=t.i,n.out=this.prog.append(e.out,t.out),n.nullable=e.nullable||t.nullable,n}loop(e,t){const n=this.newInst(x.ALT),s=this.prog.getInst(n.i);return t?(s.arg=e.i,n.out=new Qt(n.i<<1,n.i<<1)):(s.out=e.i,n.out=new Qt(n.i<<1|1,n.i<<1|1)),this.prog.patch(e.out,n.i),n}quest(e,t){const n=this.newInst(x.ALT),s=this.prog.getInst(n.i);return t?(s.arg=e.i,n.out=new Qt(n.i<<1,n.i<<1)):(s.out=e.i,n.out=new Qt(n.i<<1|1,n.i<<1|1)),n.out=this.prog.append(n.out,e.out),n}star(e,t){return e.nullable?this.quest(this.plus(e,t),t):this.loop(e,t)}plus(e,t){return new uc(e.i,this.loop(e,t).out,e.nullable)}empty(e){const t=this.newInst(x.EMPTY_WIDTH);return this.prog.getInst(t.i).arg=e,t.out=new Qt(t.i<<1,t.i<<1),t}rune(e,t){const n=this.newInst(x.RUNE);n.nullable=!1;const s=this.prog.getInst(n.i);return s.runes=e,t&=G.FOLD_CASE,(e.length!==1||X.simpleFold(e[0])===e[0])&&(t&=-2),s.arg=t,n.out=new Qt(n.i<<1,n.i<<1),(t&G.FOLD_CASE)===0&&e.length===1||e.length===2&&e[0]===e[1]?s.op=x.RUNE1:e.length===2&&e[0]===0&&e[1]===X.MAX_RUNE?s.op=x.RUNE_ANY:e.length===4&&e[0]===0&&e[1]===L.CODES.get(`
`)-1&&e[2]===L.CODES.get(`
`)+1&&e[3]===X.MAX_RUNE&&(s.op=x.RUNE_ANY_NOT_NL),n}lookBehind(e,t){const n=this.newInst(x.LB_WRITE);this.prog.getInst(n.i).arg=t;const s=this.rune(Ks.ANY_RUNE(),0),i=this.star(s,!0),o=this.cat(i,e);this.prog.patch(o.out,n.i);const a=this.newInst(x.LB_CHECK);return this.prog.getInst(a.i).arg=t,this.prog.lbStarts.push(o.i),Math.abs(t)>this.prog.numLb&&(this.prog.numLb=Math.abs(t)),a.out=new Qt(a.i<<1,a.i<<1),a}compile(e){switch(e.op){case R.Op.NO_MATCH:return this.fail();case R.Op.EMPTY_MATCH:return this.nop();case R.Op.LITERAL:if(e.runes.length===0)return this.nop();{let t=null;for(let n of e.runes){const s=this.rune([n],e.flags);t=t===null?s:this.cat(t,s)}return t}case R.Op.CHAR_CLASS:return this.rune(e.runes,e.flags);case R.Op.ANY_CHAR_NOT_NL:return this.rune(Ks.ANY_RUNE_NOT_NL(),0);case R.Op.ANY_CHAR:return this.rune(Ks.ANY_RUNE(),0);case R.Op.BEGIN_LINE:return this.empty(ne.EMPTY_BEGIN_LINE);case R.Op.END_LINE:return this.empty(ne.EMPTY_END_LINE);case R.Op.BEGIN_TEXT:return this.empty(ne.EMPTY_BEGIN_TEXT);case R.Op.END_TEXT:return this.empty(ne.EMPTY_END_TEXT);case R.Op.WORD_BOUNDARY:return this.empty(ne.EMPTY_WORD_BOUNDARY);case R.Op.NO_WORD_BOUNDARY:return this.empty(ne.EMPTY_NO_WORD_BOUNDARY);case R.Op.PLB:case R.Op.NLB:return this.lookBehind(this.compile(e.subs[0]),e.lb);case R.Op.CAPTURE:{const t=this.cap(e.cap<<1),n=this.compile(e.subs[0]),s=this.cap(e.cap<<1|1);return this.cat(this.cat(t,n),s)}case R.Op.STAR:return this.star(this.compile(e.subs[0]),(e.flags&G.NON_GREEDY)!==0);case R.Op.PLUS:return this.plus(this.compile(e.subs[0]),(e.flags&G.NON_GREEDY)!==0);case R.Op.QUEST:return this.quest(this.compile(e.subs[0]),(e.flags&G.NON_GREEDY)!==0);case R.Op.CONCAT:if(e.subs.length===0)return this.nop();{let t=null;for(let n of e.subs){const s=this.compile(n);t=t===null?s:this.cat(t,s)}return t}case R.Op.ALTERNATE:if(e.subs.length===0)return this.nop();{let t=null;for(let n of e.subs){const s=this.compile(n);t=t===null?s:this.alt(t,s)}return t}default:throw new Bv("regexp: unhandled case in compile")}}},Pv=class Ht{static simplify(e){if(e===null)return null;switch(e.op){case R.Op.PLB:case R.Op.NLB:case R.Op.CAPTURE:{const t=Ht.simplify(e.subs[0]);if(t!==e.subs[0]){const n=R.fromRegexp(e);return n.runes=[],n.subs=[t],n}return e}case R.Op.CONCAT:case R.Op.ALTERNATE:{const t=[];let n=!1;for(let s=0;s<e.subs.length;s++){const i=e.subs[s],o=Ht.simplify(i);if(o!==i&&(n=!0),e.op===R.Op.CONCAT){if(o.op===R.Op.NO_MATCH)return new R(R.Op.NO_MATCH);if(o.op===R.Op.EMPTY_MATCH){n=!0;continue}if(o.op===R.Op.CONCAT){n=!0;for(let a=0;a<o.subs.length;a++)t.push(o.subs[a]);continue}}else if(e.op===R.Op.ALTERNATE){if(o.op===R.Op.NO_MATCH){n=!0;continue}if(o.op===R.Op.ALTERNATE){n=!0;for(let a=0;a<o.subs.length;a++)t.push(o.subs[a]);continue}}t.push(o)}if(n){if(t.length===0)return new R(e.op===R.Op.CONCAT?R.Op.EMPTY_MATCH:R.Op.NO_MATCH);if(t.length===1)return t[0];const s=R.fromRegexp(e);return s.runes=[],s.subs=t,s}return e}case R.Op.CHAR_CLASS:return e.runes===null?e:e.runes.length===0?new R(R.Op.NO_MATCH):e.runes.length===2&&e.runes[0]===0&&e.runes[1]===X.MAX_RUNE?new R(R.Op.ANY_CHAR):e.runes.length===4&&e.runes[0]===0&&e.runes[1]===L.CODES.get(`
`)-1&&e.runes[2]===L.CODES.get(`
`)+1&&e.runes[3]===X.MAX_RUNE?new R(R.Op.ANY_CHAR_NOT_NL):e;case R.Op.STAR:case R.Op.PLUS:case R.Op.QUEST:{const t=Ht.simplify(e.subs[0]);return Ht.simplify1(e.op,e.flags,t,e)}case R.Op.REPEAT:{if(e.min===0&&e.max===0)return new R(R.Op.EMPTY_MATCH);const t=Ht.simplify(e.subs[0]);if(e.max===-1){if(e.min===0)return Ht.simplify1(R.Op.STAR,e.flags,t,null);if(e.min===1)return Ht.simplify1(R.Op.PLUS,e.flags,t,null);const s=new R(R.Op.CONCAT),i=[];for(let o=0;o<e.min-1;o++)i.push(t);return i.push(Ht.simplify1(R.Op.PLUS,e.flags,t,null)),s.subs=i.slice(0),Ht.simplify(s)}if(e.min===1&&e.max===1)return t;let n=null;if(e.min>0){n=[];for(let s=0;s<e.min;s++)n.push(t)}if(e.max>e.min){let s=Ht.simplify1(R.Op.QUEST,e.flags,t,null);for(let i=e.min+1;i<e.max;i++){const o=new R(R.Op.CONCAT);o.subs=[t,s],s=Ht.simplify1(R.Op.QUEST,e.flags,o,null)}if(n===null)return s;n.push(s)}if(n!==null){const s=new R(R.Op.CONCAT);return s.subs=n.slice(0),Ht.simplify(s)}return new R(R.Op.NO_MATCH)}}return e}static simplify1(e,t,n,s){if(n.op===R.Op.EMPTY_MATCH)return n;if(n.op===R.Op.NO_MATCH)return e===R.Op.PLUS?n:new R(R.Op.EMPTY_MATCH);if(e===n.op&&(t&G.NON_GREEDY)===(n.flags&G.NON_GREEDY))return n;if(s!==null&&s.op===e&&(s.flags&G.NON_GREEDY)===(t&G.NON_GREEDY)&&n===s.subs[0])return s;const i=new R(e);return i.flags=t,i.subs=[n],i}},_e=class{constructor(r,e){this.sign=r,this.cls=e}};const RC=[48,57],vC=[9,10,12,13,32,32],PC=[48,57,65,90,95,95,97,122],bC=new Map([["\\d",new _e(1,RC)],["\\D",new _e(-1,RC)],["\\s",new _e(1,vC)],["\\S",new _e(-1,vC)],["\\w",new _e(1,PC)],["\\W",new _e(-1,PC)]]),SC=[48,57,65,90,97,122],NC=[65,90,97,122],OC=[0,127],FC=[9,9,32,32],kC=[0,31,127,127],LC=[48,57],xC=[33,126],VC=[97,122],MC=[32,126],GC=[33,47,58,64,91,96,123,126],UC=[9,13,32,32],HC=[65,90],qC=[48,57,65,90,95,95,97,122],jC=[48,57,65,70,97,102],JC=new Map([["[:alnum:]",new _e(1,SC)],["[:^alnum:]",new _e(-1,SC)],["[:alpha:]",new _e(1,NC)],["[:^alpha:]",new _e(-1,NC)],["[:ascii:]",new _e(1,OC)],["[:^ascii:]",new _e(-1,OC)],["[:blank:]",new _e(1,FC)],["[:^blank:]",new _e(-1,FC)],["[:cntrl:]",new _e(1,kC)],["[:^cntrl:]",new _e(-1,kC)],["[:digit:]",new _e(1,LC)],["[:^digit:]",new _e(-1,LC)],["[:graph:]",new _e(1,xC)],["[:^graph:]",new _e(-1,xC)],["[:lower:]",new _e(1,VC)],["[:^lower:]",new _e(-1,VC)],["[:print:]",new _e(1,MC)],["[:^print:]",new _e(-1,MC)],["[:punct:]",new _e(1,GC)],["[:^punct:]",new _e(-1,GC)],["[:space:]",new _e(1,UC)],["[:^space:]",new _e(-1,UC)],["[:upper:]",new _e(1,HC)],["[:^upper:]",new _e(-1,HC)],["[:word:]",new _e(1,qC)],["[:^word:]",new _e(-1,qC)],["[:xdigit:]",new _e(1,jC)],["[:^xdigit:]",new _e(-1,jC)]]);var cr=class fr{static charClassToString(e,t){let n="[";for(let s=0;s<t;s+=2){s>0&&(n+=" ");const i=e[s],o=e[s+1];i===o?n+=`0x${i.toString(16)}`:n+=`0x${i.toString(16)}-0x${o.toString(16)}`}return n+="]",n}static cmp(e,t,n,s){const i=e[t]-n;return i!==0?i:s-e[t+1]}static qsortIntPair(e,t,n){const s=((t+n)/2|0)&-2,i=e[s],o=e[s+1];let a=t,c=n;for(;a<=c;){for(;a<n&&fr.cmp(e,a,i,o)<0;)a+=2;for(;c>t&&fr.cmp(e,c,i,o)>0;)c-=2;if(a<=c){if(a!==c){let l=e[a];e[a]=e[c],e[c]=l,l=e[a+1],e[a+1]=e[c+1],e[c+1]=l}a+=2,c-=2}}t<c&&fr.qsortIntPair(e,t,c),a<n&&fr.qsortIntPair(e,a,n)}constructor(e=ne.emptyInts()){this.r=e,this.len=e.length}toArray(){return this.len===this.r.length?this.r:this.r.slice(0,this.len)}cleanClass(){if(this.len<4)return this;fr.qsortIntPair(this.r,0,this.len-2);let e=2;for(let t=2;t<this.len;t+=2){const n=this.r[t],s=this.r[t+1];if(n<=this.r[e-1]+1){s>this.r[e-1]&&(this.r[e-1]=s);continue}this.r[e]=n,this.r[e+1]=s,e+=2}return this.len=e,this}appendLiteral(e,t){return(t&G.FOLD_CASE)!==0?this.appendFoldedRange(e,e):this.appendRange(e,e)}appendRange(e,t){if(this.len>0){for(let n=2;n<=4;n+=2)if(this.len>=n){const s=this.r[this.len-n],i=this.r[this.len-n+1];if(e<=i+1&&s<=t+1)return e<s&&(this.r[this.len-n]=e),t>i&&(this.r[this.len-n+1]=t),this}}return this.r[this.len++]=e,this.r[this.len++]=t,this}appendFoldedRange(e,t){if(e<=X.MIN_FOLD&&t>=X.MAX_FOLD)return this.appendRange(e,t);if(t<X.MIN_FOLD||e>X.MAX_FOLD)return this.appendRange(e,t);e<X.MIN_FOLD&&(this.appendRange(e,X.MIN_FOLD-1),e=X.MIN_FOLD),t>X.MAX_FOLD&&(this.appendRange(X.MAX_FOLD+1,t),t=X.MAX_FOLD);for(let n=e;n<=t;n++){this.appendRange(n,n);for(let s=X.simpleFold(n);s!==n;s=X.simpleFold(s))this.appendRange(s,s)}return this}appendClass(e){for(let t=0;t<e.length;t+=2)this.appendRange(e[t],e[t+1]);return this}appendFoldedClass(e){for(let t=0;t<e.length;t+=2)this.appendFoldedRange(e[t],e[t+1]);return this}appendNegatedClass(e){let t=0;for(let n=0;n<e.length;n+=2){const s=e[n],i=e[n+1];t<=s-1&&this.appendRange(t,s-1),t=i+1}return t<=X.MAX_RUNE&&this.appendRange(t,X.MAX_RUNE),this}appendTable(e){for(let t=0;t<e.length;++t){const n=e.getLo(t),s=e.getHi(t),i=e.getStride(t);if(i===1){this.appendRange(n,s);continue}for(let o=n;o<=s;o+=i)this.appendRange(o,o)}return this}appendNegatedTable(e){let t=0;for(let n=0;n<e.length;++n){const s=e.getLo(n),i=e.getHi(n),o=e.getStride(n);if(o===1){t<=s-1&&this.appendRange(t,s-1),t=i+1;continue}for(let a=s;a<=i;a+=o)t<=a-1&&this.appendRange(t,a-1),t=a+1}return t<=X.MAX_RUNE&&this.appendRange(t,X.MAX_RUNE),this}appendTableWithSign(e,t){return t<0?this.appendNegatedTable(e):this.appendTable(e)}negateClass(){let e=0,t=0;for(let n=0;n<this.len;n+=2){const s=this.r[n],i=this.r[n+1];e<=s-1&&(this.r[t]=e,this.r[t+1]=s-1,t+=2),e=i+1}return this.len=t,e<=X.MAX_RUNE&&(this.r[this.len++]=e,this.r[this.len++]=X.MAX_RUNE),this}appendClassWithSign(e,t){return t<0?this.appendNegatedClass(e):this.appendClass(e)}appendGroup(e,t){let n=e.cls;return t&&(n=new fr().appendFoldedClass(n).cleanClass().toArray()),this.appendClassWithSign(n,e.sign)}toString(){return fr.charClassToString(this.r,this.len)}},bv=class{constructor(r){this.str=r,this.position=0}pos(){return this.position}rewindTo(r){this.position=r}more(){return this.position<this.str.length}peek(){return this.str.codePointAt(this.position)}skip(r){this.position+=r}skipString(r){this.position+=r.length}pop(){const r=this.str.codePointAt(this.position);return this.position+=ne.charCount(r),r}lookingAt(r){return this.str.startsWith(r,this.position)}rest(){return this.str.substring(this.position)}from(r){return this.str.substring(r,this.position)}toString(){return this.rest()}},K,Sv=(K=class{static unicodeTable(e){return e==="Any"?{tab:K.ANY_TABLE,fold:K.ANY_TABLE,sign:1}:e==="Ascii"?{tab:K.ASCII_TABLE,fold:K.ASCII_FOLD_TABLE,sign:1}:e==="Assigned"?{tab:Nt.CATEGORIES.get("Cn"),fold:Nt.CATEGORIES.get("Cn"),sign:-1}:e==="Lc"?{tab:Nt.CATEGORIES.get("LC"),fold:Nt.FOLD_CATEGORIES.get("LC"),sign:1}:Nt.CATEGORIES.has(e)?{tab:Nt.CATEGORIES.get(e),fold:Nt.FOLD_CATEGORIES.get(e),sign:1}:Nt.SCRIPTS.has(e)?{tab:Nt.SCRIPTS.get(e),fold:Nt.FOLD_SCRIPT.get(e),sign:1}:null}static minFoldRune(e){if(e<X.MIN_FOLD||e>X.MAX_FOLD)return e;let t=e;const n=e;for(e=X.simpleFold(e);e!==n;e=X.simpleFold(e))t>e&&(t=e);return t}static leadingRegexp(e){if(e.op===R.Op.EMPTY_MATCH)return null;if(e.op===R.Op.CONCAT&&e.subs.length>0){const t=e.subs[0];return t.op===R.Op.EMPTY_MATCH?null:t}return e}static literalRegexp(e,t){const n=new R(R.Op.LITERAL);return n.flags=t,n.runes=ne.stringToRunes(e),n}static parse(e,t){return new K(e,t).parseInternal()}static parseRepeat(e){const t=e.pos();if(!e.more()||!e.lookingAt("{"))return-1;e.skip(1);const n=K.parseInt(e);if(n===-1||!e.more())return-1;let s;if(!e.lookingAt(","))s=n;else{if(e.skip(1),!e.more())return-1;if(e.lookingAt("}"))s=-1;else if((s=K.parseInt(e))===-1)return-1}if(!e.more()||!e.lookingAt("}"))return-1;if(e.skip(1),n<0||n>1e3||s===-2||s>1e3||s>=0&&n>s)throw new Se(K.ERR_INVALID_REPEAT_SIZE,e.from(t));return n<<16|s&X.MAX_BMP}static isValidCaptureName(e){if(e.length===0)return!1;for(let t=0;t<e.length;t++){const n=e.codePointAt(t);if(n!==L.CODES.get("_")&&!ne.isalnum(n))return!1}return!0}static parseInt(e){const t=e.pos();for(;e.more()&&e.peek()>=L.CODES.get("0")&&e.peek()<=L.CODES.get("9");)e.skip(1);const n=e.from(t);return n.length===0||n.length>1&&n.codePointAt(0)===L.CODES.get("0")?-1:n.length>8?-2:parseInt(n,10)}static isCharClass(e){return e.op===R.Op.LITERAL&&e.runes.length===1||e.op===R.Op.CHAR_CLASS||e.op===R.Op.ANY_CHAR_NOT_NL||e.op===R.Op.ANY_CHAR}static matchRune(e,t){switch(e.op){case R.Op.LITERAL:return e.runes.length===1&&e.runes[0]===t;case R.Op.CHAR_CLASS:for(let n=0;n<e.runes.length;n+=2)if(e.runes[n]<=t&&t<=e.runes[n+1])return!0;return!1;case R.Op.ANY_CHAR_NOT_NL:return t!==L.CODES.get(`
`);case R.Op.ANY_CHAR:return!0}return!1}static mergeCharClass(e,t){switch(e.op){case R.Op.ANY_CHAR:break;case R.Op.ANY_CHAR_NOT_NL:K.matchRune(t,L.CODES.get(`
`))&&(e.op=R.Op.ANY_CHAR);break;case R.Op.CHAR_CLASS:t.op===R.Op.LITERAL?e.runes=new cr(e.runes).appendLiteral(t.runes[0],t.flags).toArray():e.runes=new cr(e.runes).appendClass(t.runes).toArray();break;case R.Op.LITERAL:if(t.runes[0]===e.runes[0]&&t.flags===e.flags)break;e.op=R.Op.CHAR_CLASS,e.runes=new cr().appendLiteral(e.runes[0],e.flags).appendLiteral(t.runes[0],t.flags).toArray();break}}static parseEscape(e){const t=e.pos();if(e.skip(1),!e.more())throw new Se(K.ERR_TRAILING_BACKSLASH);let n=e.pop();e:switch(n){case L.CODES.get("1"):case L.CODES.get("2"):case L.CODES.get("3"):case L.CODES.get("4"):case L.CODES.get("5"):case L.CODES.get("6"):case L.CODES.get("7"):if(!e.more()||e.peek()<L.CODES.get("0")||e.peek()>L.CODES.get("7"))break;case L.CODES.get("0"):{let s=n-L.CODES.get("0");for(let i=1;i<3&&!(!e.more()||e.peek()<L.CODES.get("0")||e.peek()>L.CODES.get("7"));i++)s=s*8+e.peek()-L.CODES.get("0"),e.skip(1);return s}case L.CODES.get("x"):{if(!e.more())break;if(n=e.pop(),n===L.CODES.get("{")){let o=0,a=0;for(;;){if(!e.more())break e;if(n=e.pop(),n===L.CODES.get("}"))break;const c=ne.unhex(n);if(c<0||(a=a*16+c,a>X.MAX_RUNE))break e;o++}if(o===0)break e;return a}const s=ne.unhex(n);if(!e.more())break;n=e.pop();const i=ne.unhex(n);if(s<0||i<0)break;return s*16+i}case L.CODES.get("a"):return L.CODES.get("\x07");case L.CODES.get("f"):return L.CODES.get("\f");case L.CODES.get("n"):return L.CODES.get(`
`);case L.CODES.get("r"):return L.CODES.get("\r");case L.CODES.get("t"):return L.CODES.get("	");case L.CODES.get("v"):return L.CODES.get("\v");default:if(n<=X.MAX_ASCII&&!ne.isalnum(n))return n;break}throw new Se(K.ERR_INVALID_ESCAPE,e.from(t))}static parseClassChar(e,t){if(!e.more())throw new Se(K.ERR_MISSING_BRACKET,e.from(t));return e.lookingAt("\\")?K.parseEscape(e):e.pop()}static concatRunes(e,t){for(let n=0;n<t.length;n++)e.push(t[n]);return e}static hasCapture(e){if(e===null)return!1;if(e.op===R.Op.CAPTURE)return!0;if(e.subs){for(let t of e.subs)if(K.hasCapture(t))return!0}return!1}constructor(e,t=0){this.wholeRegexp=e,this.flags=t,this.numCap=0,this.namedGroups=Object.create(null),this.stack=[],this.free=null,this.numRegexp=0,this.numRunes=0,this.repeats=0,this.height=null,this.size=null,this.nlb=0}newRegexp(e){let t=this.free;return t!==null&&t.subs!==null&&t.subs.length>0?(this.free=t.subs[0],t.reinit(),t.op=e):(t=new R(e),this.numRegexp+=1),t}reuse(e){this.height!==null&&this.height.has(e)&&this.height.delete(e),e.subs!==null&&e.subs.length>0&&(e.subs[0]=this.free),this.free=e}checkLimits(e){if(this.numRunes>K.MAX_RUNES)throw new Se(K.ERR_LARGE);this.checkSize(e),this.checkHeight(e)}checkSize(e){if(this.size===null){if(this.repeats===0&&(this.repeats=1),e.op===R.Op.REPEAT){let t=e.max;t===-1&&(t=e.min),t<=0&&(t=1),t>Math.floor(K.MAX_SIZE/this.repeats)?this.repeats=K.MAX_SIZE:this.repeats*=t}if(this.numRegexp<Math.floor(K.MAX_SIZE/this.repeats))return;this.size=new Map;for(let t of this.stack)this.checkSize(t)}if(this.calcSize(e,!0)>K.MAX_SIZE)throw new Se(K.ERR_LARGE)}calcSize(e,t=!1){if(!t&&this.size!==null&&this.size.has(e))return this.size.get(e);let n=0;switch(e.op){case R.Op.LITERAL:n=e.runes.length;break;case R.Op.PLB:case R.Op.NLB:case R.Op.CAPTURE:case R.Op.STAR:n=2+this.calcSize(e.subs[0]);break;case R.Op.PLUS:case R.Op.QUEST:n=1+this.calcSize(e.subs[0]);break;case R.Op.CONCAT:for(let s of e.subs)n=n+this.calcSize(s);break;case R.Op.ALTERNATE:for(let s of e.subs)n=n+this.calcSize(s);e.subs.length>1&&(n=n+e.subs.length-1);break;case R.Op.REPEAT:{let s=this.calcSize(e.subs[0]);if(e.max===-1){e.min===0?n=2+s:n=1+e.min*s;break}n=e.max*s+(e.max-e.min);break}}return n=Math.max(1,n),this.size===null&&(this.size=new Map),this.size.set(e,n),n}checkHeight(e){if(!(this.numRegexp<K.MAX_HEIGHT)){if(this.height===null){this.height=new Map;for(let t of this.stack)this.checkHeight(t)}if(this.calcHeight(e,!0)>K.MAX_HEIGHT)throw new Se(K.ERR_NESTING_DEPTH)}}calcHeight(e,t=!1){if(!t&&this.height!==null&&this.height.has(e))return this.height.get(e);let n=1;for(let s of e.subs){const i=this.calcHeight(s);n<1+i&&(n=1+i)}return this.height===null&&(this.height=new Map),this.height.set(e,n),n}pop(){return this.stack.pop()}popToPseudo(){const e=this.stack.length;let t=e;for(;t>0&&!R.isPseudoOp(this.stack[t-1].op);)t--;const n=this.stack.slice(t,e);return this.stack=this.stack.slice(0,t),n}push(e){if(this.numRunes+=e.runes.length,e.op===R.Op.CHAR_CLASS&&e.runes.length===2&&e.runes[0]===e.runes[1]){if(this.maybeConcat(e.runes[0],this.flags&-2))return null;e.op=R.Op.LITERAL,e.runes=[e.runes[0]],e.flags=this.flags&-2}else if(e.op===R.Op.CHAR_CLASS&&e.runes.length===4&&e.runes[0]===e.runes[1]&&e.runes[2]===e.runes[3]&&X.simpleFold(e.runes[0])===e.runes[2]&&X.simpleFold(e.runes[2])===e.runes[0]||e.op===R.Op.CHAR_CLASS&&e.runes.length===2&&e.runes[0]+1===e.runes[1]&&X.simpleFold(e.runes[0])===e.runes[1]&&X.simpleFold(e.runes[1])===e.runes[0]){if(this.maybeConcat(e.runes[0],this.flags|G.FOLD_CASE))return null;e.op=R.Op.LITERAL,e.runes=[e.runes[0]],e.flags=this.flags|G.FOLD_CASE}else this.maybeConcat(-1,0);return this.stack.push(e),this.checkLimits(e),e}maybeConcat(e,t){const n=this.stack.length;if(n<2)return!1;const s=this.stack[n-1],i=this.stack[n-2];return s.op!==R.Op.LITERAL||i.op!==R.Op.LITERAL||(s.flags&G.FOLD_CASE)!==(i.flags&G.FOLD_CASE)?!1:(i.runes=K.concatRunes(i.runes,s.runes),e>=0?(s.runes=[e],s.flags=t,!0):(this.pop(),this.reuse(s),!1))}newLiteral(e,t){const n=this.newRegexp(R.Op.LITERAL);return n.flags=t,(t&G.FOLD_CASE)!==0&&(e=K.minFoldRune(e)),n.runes=[e],n}literal(e){this.push(this.newLiteral(e,this.flags))}op(e){const t=this.newRegexp(e);return t.flags=this.flags,this.push(t)}repeat(e,t,n,s,i,o){let a=this.flags;if((a&G.PERL_X)!==0&&(i.more()&&i.lookingAt("?")&&(i.skip(1),a^=G.NON_GREEDY),o!==-1))throw new Se(K.ERR_INVALID_REPEAT_OP,i.from(o));const c=this.stack.length;if(c===0)throw new Se(K.ERR_MISSING_REPEAT_ARGUMENT,i.from(s));const l=this.stack[c-1];if(R.isPseudoOp(l.op))throw new Se(K.ERR_MISSING_REPEAT_ARGUMENT,i.from(s));const B=this.newRegexp(e);if(B.min=t,B.max=n,B.flags=a,B.subs=[l],this.stack[c-1]=B,this.checkLimits(B),e===R.Op.REPEAT&&(t>=2||n>=2)&&!this.repeatIsValid(B,1e3))throw new Se(K.ERR_INVALID_REPEAT_SIZE,i.from(s))}repeatIsValid(e,t){if(e.op===R.Op.REPEAT){let n=e.max;if(n===0)return!0;if(n<0&&(n=e.min),n>t)return!1;n>0&&(t=Math.trunc(t/n))}for(let n of e.subs)if(!this.repeatIsValid(n,t))return!1;return!0}concat(){this.maybeConcat(-1,0);const e=this.popToPseudo();return e.length===0?this.push(this.newRegexp(R.Op.EMPTY_MATCH)):this.push(this.collapse(e,R.Op.CONCAT))}alternate(){const e=this.popToPseudo();return e.length>0&&this.cleanAlt(e[e.length-1]),e.length===0?this.push(this.newRegexp(R.Op.NO_MATCH)):this.push(this.collapse(e,R.Op.ALTERNATE))}cleanAlt(e){e.op===R.Op.CHAR_CLASS&&(e.runes=new cr(e.runes).cleanClass().toArray(),e.runes.length===2&&e.runes[0]===0&&e.runes[1]===X.MAX_RUNE?(e.runes=[],e.op=R.Op.ANY_CHAR):e.runes.length===4&&e.runes[0]===0&&e.runes[1]===L.CODES.get(`
`)-1&&e.runes[2]===L.CODES.get(`
`)+1&&e.runes[3]===X.MAX_RUNE&&(e.runes=[],e.op=R.Op.ANY_CHAR_NOT_NL))}collapse(e,t){if(e.length===1)return e[0];let n=0;for(let a of e)n+=a.op===t?a.subs.length:1;let s=new Array(n).fill(null),i=0;for(let a of e)if(a.op===t){for(let c=0;c<a.subs.length;c++)s[i++]=a.subs[c];this.reuse(a)}else s[i++]=a;let o=this.newRegexp(t);if(o.subs=s,t===R.Op.ALTERNATE&&(o.subs=this.factor(o.subs),o.subs.length===1)){const a=o;o=o.subs[0],this.reuse(a)}return o}factor(e){if(e.length<2)return e;let t=0,n=e.length,s=0,i=null,o=0,a=0,c=0;for(let B=0;B<=n;B++){let d=null,C=0,g=0;if(B<n){let I=e[t+B];if(I.op===R.Op.CONCAT&&I.subs.length>0&&(I=I.subs[0]),I.op===R.Op.LITERAL&&(d=I.runes,C=I.runes.length,g=I.flags&G.FOLD_CASE),g===a){let P=0;for(;P<o&&P<C&&i[P]===d[P];)P++;if(P>0){o=P;continue}}}if(B!==c)if(B===c+1)e[s++]=e[t+c];else{const I=this.newRegexp(R.Op.LITERAL);I.flags=a,I.runes=i.slice(0,o);for(let H=c;H<B;H++)e[t+H]=this.removeLeadingString(e[t+H],o),this.checkLimits(e[t+H]);const P=this.collapse(e.slice(t+c,t+B),R.Op.ALTERNATE),F=this.newRegexp(R.Op.CONCAT);F.subs=[I,P],e[s++]=F}c=B,i=d,o=C,a=g}n=s,t=0,c=0,s=0;let l=null;for(let B=0;B<=n;B++){let d=null;if(!(B<n&&(d=K.leadingRegexp(e[t+B]),l!==null&&l.equals(d)&&(K.isCharClass(l)||l.op===R.Op.REPEAT&&l.min===l.max&&K.isCharClass(l.subs[0]))))){if(B!==c)if(B===c+1)e[s++]=e[t+c];else{const C=l;for(let P=c;P<B;P++){const F=P!==c;e[t+P]=this.removeLeadingRegexp(e[t+P],F),this.checkLimits(e[t+P])}const g=this.collapse(e.slice(t+c,t+B),R.Op.ALTERNATE),I=this.newRegexp(R.Op.CONCAT);I.subs=[C,g],e[s++]=I}c=B,l=d}}n=s,t=0,c=0,s=0;for(let B=0;B<=n;B++)if(!(B<n&&K.isCharClass(e[t+B]))){if(B!==c)if(B===c+1)e[s++]=e[t+c];else{let d=c;for(let g=c+1;g<B;g++){const I=e[t+d],P=e[t+g];(I.op<P.op||I.op===P.op&&(I.runes!==null?I.runes.length:0)<(P.runes!==null?P.runes.length:0))&&(d=g)}const C=e[t+c];e[t+c]=e[t+d],e[t+d]=C;for(let g=c+1;g<B;g++)K.mergeCharClass(e[t+c],e[t+g]),this.reuse(e[t+g]);this.cleanAlt(e[t+c]),e[s++]=e[t+c]}B<n&&(e[s++]=e[t+B]),c=B+1}n=s,t=0,c=0,s=0;for(let B=0;B<n;++B)B+1<n&&e[t+B].op===R.Op.EMPTY_MATCH&&e[t+B+1].op===R.Op.EMPTY_MATCH||(e[s++]=e[t+B]);return n=s,t=0,e.slice(t,n)}removeLeadingString(e,t){if(e.op===R.Op.CONCAT&&e.subs.length>0){const n=this.removeLeadingString(e.subs[0],t);if(e.subs[0]=n,n.op===R.Op.EMPTY_MATCH)switch(this.reuse(n),e.subs.length){case 0:case 1:e.op=R.Op.EMPTY_MATCH,e.subs=R.emptySubs();break;case 2:{const s=e;e=e.subs[1],this.reuse(s);break}default:e.subs=e.subs.slice(1,e.subs.length);break}return e}return e.op===R.Op.LITERAL&&(e.runes=e.runes.slice(t,e.runes.length),e.runes.length===0&&(e.op=R.Op.EMPTY_MATCH)),e}removeLeadingRegexp(e,t){if(e.op===R.Op.CONCAT&&e.subs.length>0){switch(t&&this.reuse(e.subs[0]),e.subs=e.subs.slice(1,e.subs.length),e.subs.length){case 0:e.op=R.Op.EMPTY_MATCH,e.subs=R.emptySubs();break;case 1:{const n=e;e=e.subs[0],this.reuse(n);break}}return e}return t&&this.reuse(e),this.newRegexp(R.Op.EMPTY_MATCH)}parseInternal(){if((this.flags&G.LITERAL)!==0)return K.literalRegexp(this.wholeRegexp,this.flags);let e=-1,t=-1,n=-1;const s=new bv(this.wholeRegexp);for(;s.more();){let i=-1;e:switch(s.peek()){case L.CODES.get("("):if((this.flags&G.LOOKBEHIND)!==0){if(s.lookingAt("(?<=")){this.parsePosLookBehind(),s.skip(4);break}if(s.lookingAt("(?<!")){this.parseNegLookBehind(),s.skip(4);break}}if((this.flags&G.PERL_X)!==0&&s.lookingAt("(?")){this.parsePerlFlags(s);break}this.op(R.Op.LEFT_PAREN).cap=++this.numCap,s.skip(1);break;case L.CODES.get("|"):this.parseVerticalBar(),s.skip(1);break;case L.CODES.get(")"):this.parseRightParen(),s.skip(1);break;case L.CODES.get("^"):(this.flags&G.ONE_LINE)!==0?this.op(R.Op.BEGIN_TEXT):this.op(R.Op.BEGIN_LINE),s.skip(1);break;case L.CODES.get("$"):(this.flags&G.ONE_LINE)!==0?this.op(R.Op.END_TEXT).flags|=G.WAS_DOLLAR:this.op(R.Op.END_LINE),s.skip(1);break;case L.CODES.get("."):(this.flags&G.DOT_NL)!==0?this.op(R.Op.ANY_CHAR):this.op(R.Op.ANY_CHAR_NOT_NL),s.skip(1);break;case L.CODES.get("["):this.parseClass(s);break;case L.CODES.get("*"):case L.CODES.get("+"):case L.CODES.get("?"):{i=s.pos();let o=null;switch(s.pop()){case L.CODES.get("*"):o=R.Op.STAR;break;case L.CODES.get("+"):o=R.Op.PLUS;break;case L.CODES.get("?"):o=R.Op.QUEST;break}this.repeat(o,t,n,i,s,e);break}case L.CODES.get("{"):{i=s.pos();const o=K.parseRepeat(s);if(o<0){s.rewindTo(i),this.literal(s.pop());break}t=o>>16,n=(o&X.MAX_BMP)<<16>>16,this.repeat(R.Op.REPEAT,t,n,i,s,e);break}case L.CODES.get("\\"):{const o=s.pos();if(s.skip(1),(this.flags&G.PERL_X)!==0&&s.more())switch(s.pop()){case L.CODES.get("A"):this.op(R.Op.BEGIN_TEXT);break e;case L.CODES.get("b"):this.op(R.Op.WORD_BOUNDARY);break e;case L.CODES.get("B"):this.op(R.Op.NO_WORD_BOUNDARY);break e;case L.CODES.get("C"):throw new Se(K.ERR_INVALID_ESCAPE,"\\C");case L.CODES.get("Q"):{let l=s.rest();const B=l.indexOf("\\E");B>=0?(l=l.substring(0,B),s.skipString(l),s.skipString("\\E")):s.skipString(l);let d=0;for(;d<l.length;){const C=l.codePointAt(d);this.literal(C),d+=ne.charCount(C)}break e}case L.CODES.get("z"):this.op(R.Op.END_TEXT);break e;default:s.rewindTo(o);break}else s.rewindTo(o);const a=this.newRegexp(R.Op.CHAR_CLASS);if(a.flags=this.flags,s.lookingAt("\\p")||s.lookingAt("\\P")){const l=new cr;if(this.parseUnicodeClass(s,l)){a.runes=l.toArray(),this.push(a);break e}}const c=new cr;if(this.parsePerlClassEscape(s,c)){a.runes=c.toArray(),this.push(a);break e}s.rewindTo(o),this.reuse(a),this.literal(K.parseEscape(s));break}default:this.literal(s.pop());break}e=i}if(this.concat(),this.swapVerticalBar()&&this.pop(),this.alternate(),this.stack.length!==1)throw new Se(K.ERR_MISSING_PAREN,this.wholeRegexp);return this.stack[0].namedGroups=this.namedGroups,this.stack[0]}parsePerlFlags(e){const t=e.pos(),n=e.rest();if(n.startsWith("(?P<")||n.startsWith("(?<")){const a=n.charAt(2)==="P"?4:3,c=n.indexOf(">");if(c<0)throw new Se(K.ERR_INVALID_NAMED_CAPTURE,n);const l=n.substring(a,c);if(e.skipString(l),e.skip(a+1),!K.isValidCaptureName(l))throw new Se(K.ERR_INVALID_NAMED_CAPTURE,n.substring(0,c+1));const B=this.op(R.Op.LEFT_PAREN);if(B.cap=++this.numCap,this.namedGroups[l])throw new Se(K.ERR_DUPLICATE_NAMED_CAPTURE,l);this.namedGroups[l]=this.numCap,B.name=l;return}e.skip(2);let s=this.flags,i=1,o=!1;e:for(;e.more();){const a=e.pop();switch(a){case L.CODES.get("i"):s|=G.FOLD_CASE,o=!0;break;case L.CODES.get("m"):s&=-17,o=!0;break;case L.CODES.get("s"):s|=G.DOT_NL,o=!0;break;case L.CODES.get("U"):s|=G.NON_GREEDY,o=!0;break;case L.CODES.get("-"):if(i<0)break e;i=-1,s=~s,o=!1;break;case L.CODES.get(":"):case L.CODES.get(")"):if(i<0){if(!o)break e;s=~s}a===L.CODES.get(":")&&this.op(R.Op.LEFT_PAREN),this.flags=s;return;default:break e}}throw new Se(K.ERR_INVALID_PERL_OP,e.from(t))}parsePosLookBehind(){const e=this.newRegexp(R.Op.LEFT_PAREN);return e.flags=this.flags,e.lb=++this.nlb,this.push(e)}parseNegLookBehind(){const e=this.newRegexp(R.Op.LEFT_PAREN);return e.flags=this.flags,e.lb=-++this.nlb,this.push(e)}parseVerticalBar(){this.concat(),this.swapVerticalBar()||this.op(R.Op.VERTICAL_BAR)}swapVerticalBar(){const e=this.stack.length;if(e>=3&&this.stack[e-2].op===R.Op.VERTICAL_BAR&&K.isCharClass(this.stack[e-1])&&K.isCharClass(this.stack[e-3])){let t=this.stack[e-1],n=this.stack[e-3];if(t.op>n.op){const s=n;n=t,t=s,this.stack[e-3]=n}return K.mergeCharClass(n,t),this.reuse(t),this.pop(),!0}if(e>=2){const t=this.stack[e-1],n=this.stack[e-2];if(n.op===R.Op.VERTICAL_BAR)return e>=3&&this.cleanAlt(this.stack[e-3]),this.stack[e-2]=t,this.stack[e-1]=n,!0}return!1}parseRightParen(){if(this.concat(),this.swapVerticalBar()&&this.pop(),this.alternate(),this.stack.length<2)throw new Se(K.ERR_UNEXPECTED_PAREN,this.wholeRegexp);const e=this.pop(),t=this.pop();if(t.op!==R.Op.LEFT_PAREN)throw new Se(K.ERR_UNEXPECTED_PAREN,this.wholeRegexp);if(this.flags=t.flags,t.lb!==0){if(K.hasCapture(e))throw new Se(K.ERR_INVALID_CAPTURE_IN_LOOKBEHIND,this.wholeRegexp);t.lb>0?t.op=R.Op.PLB:t.op=R.Op.NLB,t.subs=[e],this.push(t);return}t.cap===0?this.push(e):(t.op=R.Op.CAPTURE,t.subs=[e],this.push(t))}parsePerlClassEscape(e,t){const n=e.pos();if((this.flags&G.PERL_X)===0||!e.more()||e.pop()!==L.CODES.get("\\")||!e.more())return!1;e.pop();const s=e.from(n),i=bC.has(s)?bC.get(s):null;return i===null?!1:(t.appendGroup(i,(this.flags&G.FOLD_CASE)!==0),!0)}parseNamedClass(e,t){const n=e.rest(),s=n.indexOf(":]");if(s<0)return!1;const i=n.substring(0,s+2);e.skipString(i);const o=JC.has(i)?JC.get(i):null;if(o===null)throw new Se(K.ERR_INVALID_CHAR_RANGE,i);return t.appendGroup(o,(this.flags&G.FOLD_CASE)!==0),!0}parseUnicodeClass(e,t){const n=e.pos();if((this.flags&G.UNICODE_GROUPS)===0||!e.lookingAt("\\p")&&!e.lookingAt("\\P"))return!1;e.skip(1);let s=1,i=e.pop();if(i===L.CODES.get("P")&&(s=-1),!e.more())throw e.rewindTo(n),new Se(K.ERR_INVALID_CHAR_RANGE,e.rest());i=e.pop();let o;if(i!==L.CODES.get("{"))o=ne.runeToString(i);else{const B=e.rest(),d=B.indexOf("}");if(d<0)throw e.rewindTo(n),new Se(K.ERR_INVALID_CHAR_RANGE,e.rest());o=B.substring(0,d),e.skipString(o),e.skip(1)}o.length!==0&&o.codePointAt(0)===L.CODES.get("^")&&(s=0-s,o=o.substring(1));const a=K.unicodeTable(o);if(a===null)throw new Se(K.ERR_INVALID_CHAR_RANGE,e.from(n));a.sign<0&&(s=0-s);const c=a.tab,l=a.fold;if((this.flags&G.FOLD_CASE)===0||l===null)t.appendTableWithSign(c,s);else{const B=new cr().appendTable(c).appendTable(l).cleanClass().toArray();t.appendClassWithSign(B,s)}return!0}parseClass(e){const t=e.pos();e.skip(1);const n=this.newRegexp(R.Op.CHAR_CLASS);n.flags=this.flags;const s=new cr;let i=1;e.more()&&e.lookingAt("^")&&(i=-1,e.skip(1),(this.flags&G.CLASS_NL)===0&&s.appendRange(L.CODES.get(`
`),L.CODES.get(`
`)));let o=!0;for(;!e.more()||e.peek()!==L.CODES.get("]")||o;){if(e.more()&&e.lookingAt("-")&&(this.flags&G.PERL_X)===0&&!o){const B=e.rest();if(B==="-"||!B.startsWith("-]"))throw e.rewindTo(t),new Se(K.ERR_INVALID_CHAR_RANGE,e.rest())}o=!1;const a=e.pos();if(e.lookingAt("[:")){if(this.parseNamedClass(e,s))continue;e.rewindTo(a)}if(this.parseUnicodeClass(e,s)||this.parsePerlClassEscape(e,s))continue;e.rewindTo(a);const c=K.parseClassChar(e,t);let l=c;if(e.more()&&e.lookingAt("-")){if(e.skip(1),e.more()&&e.lookingAt("]"))e.skip(-1);else if(l=K.parseClassChar(e,t),l<c)throw new Se(K.ERR_INVALID_CHAR_RANGE,e.from(a))}(this.flags&G.FOLD_CASE)===0?s.appendRange(c,l):s.appendFoldedRange(c,l)}e.skip(1),s.cleanClass(),i<0&&s.negateClass(),n.runes=s.toArray(),this.push(n)}},j(K,"ERR_INTERNAL_ERROR","regexp/syntax: internal error"),j(K,"ERR_INVALID_CHAR_RANGE","invalid character class range"),j(K,"ERR_INVALID_ESCAPE","invalid escape sequence"),j(K,"ERR_INVALID_NAMED_CAPTURE","invalid named capture"),j(K,"ERR_INVALID_PERL_OP","invalid or unsupported Perl syntax"),j(K,"ERR_INVALID_REPEAT_OP","invalid nested repetition operator"),j(K,"ERR_INVALID_REPEAT_SIZE","invalid repeat count"),j(K,"ERR_MISSING_BRACKET","missing closing ]"),j(K,"ERR_MISSING_PAREN","missing closing )"),j(K,"ERR_MISSING_REPEAT_ARGUMENT","missing argument to repetition operator"),j(K,"ERR_TRAILING_BACKSLASH","trailing backslash at end of expression"),j(K,"ERR_DUPLICATE_NAMED_CAPTURE","duplicate capture group name"),j(K,"ERR_UNEXPECTED_PAREN","unexpected )"),j(K,"ERR_NESTING_DEPTH","expression nests too deeply"),j(K,"ERR_LARGE","expression too large"),j(K,"ERR_INVALID_CAPTURE_IN_LOOKBEHIND","invalid capture in lookbehind"),j(K,"MAX_HEIGHT",1e3),j(K,"MAX_SIZE",3355443),j(K,"MAX_RUNES",33554432),j(K,"ANY_TABLE",new _(new Uint32Array([0,X.MAX_RUNE,1]))),j(K,"ASCII_TABLE",new _(new Uint32Array([0,127,1]))),j(K,"ASCII_FOLD_TABLE",new _(new Uint32Array([0,127,1,383,383,1,8490,8490,1]))),K),Nv=class Xr{static initTest(e){const t=Xr.compile(e),n=new Xr(t.expr,t.prog,t.numSubexp,t.longest);return n.cond=t.cond,n.prefix=t.prefix,n.prefixUTF8=t.prefixUTF8,n.prefixComplete=t.prefixComplete,n.prefixRune=t.prefixRune,n.prefilter=t.prefilter,n}static compile(e){return Xr.compileImpl(e,G.PERL,!1)}static compilePOSIX(e){return Xr.compileImpl(e,G.POSIX,!0)}static compileImpl(e,t,n){let s=Sv.parse(e,t);const i=s.maxCap();s=Pv.simplify(s);const o=Av.build(s),a=vv.compileRegexp(s),c=new Xr(e,a,i,n);c.prefilter=o.type===Ie.Type.NONE?null:o;const[l,B]=a.prefix();return c.prefixComplete=l,c.prefix=B,c.prefixUTF8=ne.stringToUtf8ByteArray(c.prefix),c.prefix.length>0&&(c.prefixRune=c.prefix.codePointAt(0)),c.namedGroups=s.namedGroups,c}static match(e,t){return Xr.compile(e).match(t)}constructor(e,t,n=0,s=0){this.expr=e,this.prog=t,this.numSubexp=n,this.longest=s,this.cond=t.startCond(),this.prefix=null,this.prefixUTF8=null,this.prefixComplete=!1,this.prefixRune=0,this.machinePool=[],this.dfa=new pv(this.prog),this.onepass=TC.compile(this.prog),this.prefilter=null}matchPrefixComplete(e,t,n,s){if((n===G.ANCHOR_START||n===G.ANCHOR_BOTH)&&t!==0)return null;let i=-1,o=-1;const a=e.prefixLength(this);if(n===G.UNANCHORED){const c=e.index(this,t);if(c<0)return null;i=t+c,o=i+a}else if(n===G.ANCHOR_BOTH){if(e.endPos()!==a||e.index(this,0)!==0)return null;i=0,o=a}else if(n===G.ANCHOR_START){if(e.index(this,0)!==0)return null;i=0,o=a}if(i<0)return null;if(s>0){const c=new Int32Array(s).fill(-1);return c[0]=i,c[1]=o,Array.from(c)}return[]}executeEngine(e,t,n,s){if(this.prefixComplete&&(s===0||this.numSubexp===0))return this.matchPrefixComplete(e,t,n,s);if(this.prefilter!==null&&n===G.UNANCHORED&&!this.prefilter.eval(e,t))return null;if(this.onepass!==null)return TC.execute(this,e,t,n,s);if(s>0)return this.prog.numLb===0&&e.endPos()<=cc.maxBitStateLen(this.prog)?cc.execute(this,e,t,n,s):this.doExecuteNFA(e,t,n,s);if(this.prog.numLb===0){const i=this.dfa.match(e,t,n);if(i!==null)return i?[]:null;if(e.endPos()<=cc.maxBitStateLen(this.prog))return cc.execute(this,e,t,n,s)}return this.doExecuteNFA(e,t,n,s)}numberOfCapturingGroups(){return this.numSubexp}numberOfInstructions(){return this.prog.numInst()}get(){return this.machinePool.length>0?this.machinePool.pop():null}reset(){this.machinePool.length=0}put(e){this.machinePool.push(e)}toString(){return this.expr}doExecuteNFA(e,t,n,s){let i=this.get();i||(i=dv.fromRE2(this)),i.init(s);const o=i.match(e,t,n)?i.submatches():null;return this.put(i),o}match(e){return this.executeEngine(ke.fromUTF16(e),0,G.UNANCHORED,0)!==null}matchWithGroup(e,t,n,s,i){return e instanceof fs||(ne.isByteArray(e)?e=os.utf8(e):e=os.utf16(e)),this.matchMachineInput(e,t,n,s,i)}matchMachineInput(e,t,n,s,i){if(t>n)return[!1,null];const o=e.isUTF16Encoding()?ke.fromUTF16(e.asCharSequence(),0,n):ke.fromUTF8(e.asBytes(),0,n),a=this.executeEngine(o,t,s,2*i);return a===null?[!1,null]:[!0,a]}matchUTF8(e){return this.executeEngine(ke.fromUTF8(e),0,G.UNANCHORED,0)!==null}replaceAll(e,t){return this.replaceAllFunc(e,()=>t,2*e.length+1)}replaceFirst(e,t){return this.replaceAllFunc(e,()=>t,1)}replaceAllFunc(e,t,n){let s=0,i=0,o="";const a=ke.fromUTF16(e);let c=0;for(;i<=e.length;){const l=this.executeEngine(a,i,G.UNANCHORED,2);if(l===null||l.length===0)break;o+=e.substring(s,l[0]),(l[1]>s||l[0]===0)&&(o+=t(e.substring(l[0],l[1])),c++),s=l[1];const B=a.step(i)&7;if(i+B>l[1]?i+=B:i+1>l[1]?i++:i=l[1],c>=n)break}return o+=e.substring(s),o}pad(e){if(e===null)return null;let t=(1+this.numSubexp)*2;if(e.length<t){let n=new Array(t).fill(-1);for(let s=0;s<e.length;s++)n[s]=e[s];e=n}return e}allMatches(e,t,n=s=>s){let s=[];const i=e.endPos();t<0&&(t=i+1);let o=0,a=0,c=-1;for(;a<t&&o<=i;){const l=this.executeEngine(e,o,G.UNANCHORED,this.prog.numCap);if(l===null||l.length===0)break;let B=!0;if(l[1]===o){l[0]===c&&(B=!1);const d=e.step(o);d<0?o=i+1:o+=d&7}else o=l[1];c=l[1],B&&(s.push(n(this.pad(l))),a++)}return s}findUTF8(e){const t=this.executeEngine(ke.fromUTF8(e),0,G.UNANCHORED,2);return t===null?null:e.slice(t[0],t[1])}findUTF8Index(e){const t=this.executeEngine(ke.fromUTF8(e),0,G.UNANCHORED,2);return t===null?null:t.slice(0,2)}find(e){const t=this.executeEngine(ke.fromUTF16(e),0,G.UNANCHORED,2);return t===null?"":e.substring(t[0],t[1])}findIndex(e){return this.executeEngine(ke.fromUTF16(e),0,G.UNANCHORED,2)}findUTF8Submatch(e){const t=this.executeEngine(ke.fromUTF8(e),0,G.UNANCHORED,this.prog.numCap);if(t===null)return null;const n=new Array(1+this.numSubexp).fill(null);for(let s=0;s<n.length;s++)2*s<t.length&&t[2*s]>=0&&(n[s]=e.slice(t[2*s],t[2*s+1]));return n}findUTF8SubmatchIndex(e){return this.pad(this.executeEngine(ke.fromUTF8(e),0,G.UNANCHORED,this.prog.numCap))}findSubmatch(e){const t=this.executeEngine(ke.fromUTF16(e),0,G.UNANCHORED,this.prog.numCap);if(t===null)return null;const n=new Array(1+this.numSubexp).fill(null);for(let s=0;s<n.length;s++)2*s<t.length&&t[2*s]>=0&&(n[s]=e.substring(t[2*s],t[2*s+1]));return n}findSubmatchIndex(e){return this.pad(this.executeEngine(ke.fromUTF16(e),0,G.UNANCHORED,this.prog.numCap))}findAllUTF8(e,t){const n=this.allMatches(ke.fromUTF8(e),t,s=>e.slice(s[0],s[1]));return n.length===0?null:n}findAllUTF8Index(e,t){const n=this.allMatches(ke.fromUTF8(e),t,s=>s.slice(0,2));return n.length===0?null:n}findAll(e,t){const n=this.allMatches(ke.fromUTF16(e),t,s=>e.substring(s[0],s[1]));return n.length===0?null:n}findAllIndex(e,t){const n=this.allMatches(ke.fromUTF16(e),t,s=>s.slice(0,2));return n.length===0?null:n}findAllUTF8Submatch(e,t){const n=this.allMatches(ke.fromUTF8(e),t,s=>{let i=new Array(s.length/2|0).fill(null);for(let o=0;o<i.length;o++)s[2*o]>=0&&(i[o]=e.slice(s[2*o],s[2*o+1]));return i});return n.length===0?null:n}findAllUTF8SubmatchIndex(e,t){const n=this.allMatches(ke.fromUTF8(e),t);return n.length===0?null:n}findAllSubmatch(e,t){const n=this.allMatches(ke.fromUTF16(e),t,s=>{let i=new Array(s.length/2|0).fill(null);for(let o=0;o<i.length;o++)s[2*o]>=0&&(i[o]=e.substring(s[2*o],s[2*o+1]));return i});return n.length===0?null:n}findAllSubmatchIndex(e,t){const n=this.allMatches(ke.fromUTF16(e),t);return n.length===0?null:n}},Ov=class zs{static isHexadecimal(e){return"0"<=e&&e<="9"||"A"<=e&&e<="F"||"a"<=e&&e<="f"}static translate(e){let t="";if(e instanceof RegExp&&(e.ignoreCase&&(t+="i"),e.multiline&&(t+="m"),e.dotAll&&(t+="s"),e=e.source),typeof e!="string")return e;let n="",s=!1,i=e.length;i===0&&(n="(?:)",s=!0);let o=!1,a=0;for(;a<i;){let l=e[a];if(l==="\\"){if(a+1<i)switch(l=e[a+1],l){case"\\":n+="\\\\",a+=2;continue;case"c":if(a+2<i){let C=e[a+2].charCodeAt(0);if(C>=65&&C<=90||C>=97&&C<=122){let g=C%32;n+="\\x",n+=(g>>4).toString(16).toUpperCase(),n+=(g&15).toString(16).toUpperCase(),a+=3,s=!0;continue}}n+="c",a+=2,s=!0;continue;case"u":if(a+2<i){if(e[a+2]==="{"){let C=a+3,g=!1,I=!1;for(;C<i;){const P=e[C];if(P==="}"){I=!0;break}if(!zs.isHexadecimal(P))break;g=!0,C++}if(I&&g){n+="\\x",a+=2,s=!0;continue}}else if(a+5<i){let C=!0;for(let g=0;g<4;g++)if(!zs.isHexadecimal(e[a+2+g])){C=!1;break}if(C){n+="\\x{"+e.substring(a+2,a+6)+"}",a+=6,s=!0;continue}}}n+="u",a+=2,s=!0;continue;case"x":{let C=!1;if(a+2<i&&e[a+2]==="{"){let g=a+3,I=!1,P=!1;for(;g<i;){const F=e[g];if(F==="}"){P=!0;break}if(!zs.isHexadecimal(F))break;I=!0,g++}P&&I&&(C=!0)}else a+3<i&&zs.isHexadecimal(e[a+2])&&zs.isHexadecimal(e[a+3])&&(C=!0);C?(n+="\\x",a+=2):(n+="x",a+=2,s=!0);continue}case"n":case"r":case"t":case"a":case"f":case"v":case"d":case"D":case"s":case"S":case"w":case"W":case"b":case"B":case"p":case"P":case"A":case"z":case"Q":case"E":case"0":case"1":case"2":case"3":case"4":case"5":case"6":case"7":n+="\\"+l,a+=2;continue;default:{let C=e.codePointAt(a+1);if(C>=48&&C<=57||C>=65&&C<=90||C>=97&&C<=122){let g=ne.charCount(C);n+=e.substring(a+1,a+1+g),a+=g+1,s=!0}else{n+="\\";let g=ne.charCount(C);n+=e.substring(a+1,a+1+g),a+=g+1}continue}}}else if(l==="/"){n+="\\/",a+=1,s=!0;continue}else if(l==="[")o=!0;else if(l==="]")o=!1;else if(!o&&l==="("&&a+2<i&&e[a+1]==="?"&&e[a+2]==="<"&&a+3<i&&!"=!>)".includes(e[a+3])){n+="(?P<",a+=3,s=!0;continue}let B=e.codePointAt(a),d=ne.charCount(B);n+=e.substring(a,a+d),a+=d}const c=s?n:e;return t.length>0?`(?${t})${c}`:c}},We,ih=(We=class{static quote(e){return ne.quoteMeta(e)}static quoteReplacement(e,t=!1){return IC.quoteReplacement(e,t)}static translateRegExp(e){return Ov.translate(e)}static compile(e,t=0){let n=e;if((t&We.CASE_INSENSITIVE)!==0&&(n=`(?i)${n}`),(t&We.DOTALL)!==0&&(n=`(?s)${n}`),(t&We.MULTILINE)!==0&&(n=`(?m)${n}`),(t&-544)!==0)throw new hv("Flags should only be a combination of MULTILINE, DOTALL, CASE_INSENSITIVE, DISABLE_UNICODE_GROUPS, LONGEST_MATCH, LOOKBEHINDS");let s=G.PERL;(t&We.DISABLE_UNICODE_GROUPS)!==0&&(s&=-129),(t&We.LOOKBEHINDS)!==0&&(s|=G.LOOKBEHIND);const i=new We(e,t);return i.re2Input=Nv.compileImpl(n,s,(t&We.LONGEST_MATCH)!==0),i}static matches(e,t){return We.compile(e).testExact(t)}static initTest(e,t,n){if(e==null)throw new Error("pattern is null");if(n==null)throw new Error("re2 is null");const s=new We(e,t);return s.re2Input=n,s}constructor(e,t){this.patternInput=e,this.flagsInput=t,this.re2Input=null}reset(){this.re2Input.reset()}flags(){return this.flagsInput}pattern(){return this.patternInput}re2(){return this.re2Input}matches(e){return this.testExact(e)}matcher(e){return ne.isByteArray(e)&&(e=os.utf8(e)),new IC(this,e)}test(e){return ne.isByteArray(e)?this.re2Input.matchUTF8(e):this.re2Input.match(e)}testExact(e){const t=ne.isByteArray(e)?ke.fromUTF8(e):ke.fromUTF16(e);return this.re2Input.executeEngine(t,0,G.ANCHOR_BOTH,0)!==null}exec(e){const t=this.matcher(e);if(!t.find())return null;const n=[t.group(0)];for(let i=1;i<=t.groupCount();i++){const o=t.group(i);n.push(o===null?void 0:o)}n.index=t.start(0),n.input=e;const s=this.namedGroups();if(Object.keys(s).length>0){const i=t.getNamedGroups();for(const o in i)i[o]===null&&(i[o]=void 0);n.groups=i}else n.groups=void 0;return n}split(e,t=0){const n=this.matcher(e),s=[];let i=0,o=0;for(;n.find();){if(o===0&&n.end()===0){o=n.end();continue}if(t>0&&s.length===t-1)break;if(o===n.start()){if(t===0){i+=1,o=n.end();continue}}else for(;i>0;)s.push(""),i-=1;s.push(n.substring(o,n.start())),o=n.end()}if(t===0&&o!==n.inputLength()){for(;i>0;)s.push(""),i-=1;s.push(n.substring(o,n.inputLength()))}return(t!==0||s.length===0&&!(o===n.inputLength()&&o>0))&&s.push(n.substring(o,n.inputLength())),s}*matchAll(e){const t=this.matcher(e);for(;t.find();){const n=[t.group(0)];for(let i=1;i<=t.groupCount();i++){const o=t.group(i);n.push(o===null?void 0:o)}n.index=t.start(0),n.input=e;const s=this.namedGroups();if(Object.keys(s).length>0){const i=t.getNamedGroups();for(const o in i)i[o]===null&&(i[o]=void 0);n.groups=i}else n.groups=void 0;yield n}}toString(){return this.patternInput}programSize(){return this.re2Input.numberOfInstructions()}groupCount(){return this.re2Input.numberOfCapturingGroups()}namedGroups(){return this.re2Input.namedGroups}equals(e){return this===e?!0:e===null||this.constructor!==e.constructor?!1:this.flagsInput===e.flagsInput&&this.patternInput===e.patternInput}},j(We,"CASE_INSENSITIVE",Vs.CASE_INSENSITIVE),j(We,"DOTALL",Vs.DOTALL),j(We,"MULTILINE",Vs.MULTILINE),j(We,"DISABLE_UNICODE_GROUPS",Vs.DISABLE_UNICODE_GROUPS),j(We,"LONGEST_MATCH",Vs.LONGEST_MATCH),j(We,"LOOKBEHINDS",Vs.LOOKBEHINDS),We);/**
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
 */class zm{constructor(e,t,n){this.alias=e,this.aggregateType=t,this.fieldPath=n}}/**
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
 */let Mi="12.18.0";function Fv(r){Mi=r}/**
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
 */const Pr=new cu("@firebase/firestore");function Ws(){return Pr.logLevel}function kv(r){Pr.setLogLevel(r)}function U(r,...e){if(Pr.logLevel<=Ce.DEBUG){const t=e.map(oh);Pr.debug(`Firestore (${Mi}): ${r}`,...t)}}function qe(r,...e){if(Pr.logLevel<=Ce.ERROR){const t=e.map(oh);Pr.error(`Firestore (${Mi}): ${r}`,...t)}}function st(r,...e){if(Pr.logLevel<=Ce.WARN){const t=e.map(oh);Pr.warn(`Firestore (${Mi}): ${r}`,...t)}}function oh(r){if(typeof r=="string")return r;try{return(function(t){return JSON.stringify(t)})(r)}catch{return r}}/**
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
 */function Y(r,e,t){let n="Unexpected state";typeof e=="string"?n=e:t=e,Wm(r,n,t)}function Wm(r,e,t){let n=`FIRESTORE (${Mi}) INTERNAL ASSERTION FAILED: ${e} (ID: ${r.toString(16)})`;if(t!==void 0)try{n+=" CONTEXT: "+JSON.stringify(t)}catch{n+=" CONTEXT: "+t}throw qe(n),new Error(n)}function q(r,e,t,n){let s="Unexpected state";typeof t=="string"?s=t:n=t,r||Wm(e,s,n)}function Lv(r,e){r||Y(57014,e)}function W(r,e){return r}/**
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
 */function xv(r){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(r);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let n=0;n<r;n++)t[n]=Math.floor(256*Math.random());return t}/**
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
 */class _u{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let n="";for(;n.length<20;){const s=xv(40);for(let i=0;i<s.length;++i)n.length<20&&s[i]<t&&(n+=e.charAt(s[i]%62))}return n}}function ie(r,e){return r<e?-1:r>e?1:0}function aB(r,e){const t=Math.min(r.length,e.length);for(let n=0;n<t;n++){const s=r.charAt(n),i=e.charAt(n);if(s!==i)return Ll(s)===Ll(i)?ie(s,i):Ll(s)?1:-1}return ie(r.length,e.length)}const Vv=55296,Mv=57343;function Ll(r){const e=r.charCodeAt(0);return e>=Vv&&e<=Mv}function ci(r,e,t){return r.length===e.length&&r.every(((n,s)=>t(n,e[s])))}function Qm(r){return r+"\0"}/**
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
 */class be{constructor(e,t){this.comparator=e,this.root=t||Ct.EMPTY}insert(e,t){return new be(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Ct.BLACK,null,null))}remove(e){return new be(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Ct.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const n=this.comparator(e,t.key);if(n===0)return t.value;n<0?t=t.left:n>0&&(t=t.right)}return null}indexOf(e){let t=0,n=this.root;for(;!n.isEmpty();){const s=this.comparator(e,n.key);if(s===0)return t+n.left.size;s<0?n=n.left:(t+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal(((t,n)=>(e(t,n),!1)))}toString(){const e=[];return this.inorderTraversal(((t,n)=>(e.push(`${t}:${n}`),!1))),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new lc(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new lc(this.root,e,this.comparator,!1)}getReverseIterator(){return new lc(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new lc(this.root,e,this.comparator,!0)}}class lc{constructor(e,t,n,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?n(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Ct{constructor(e,t,n,s,i){this.key=e,this.value=t,this.color=n??Ct.RED,this.left=s??Ct.EMPTY,this.right=i??Ct.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,n,s,i){return new Ct(e??this.key,t??this.value,n??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,n){let s=this;const i=n(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,n),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,n)),s.fixUp()}removeMin(){if(this.left.isEmpty())return Ct.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let n,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return Ct.EMPTY;n=s.right.min(),s=s.copy(n.key,n.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Ct.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Ct.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw Y(43730,{key:this.key,value:this.value});if(this.right.isRed())throw Y(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw Y(27949);return e+(this.isRed()?0:1)}}Ct.EMPTY=null,Ct.RED=!0,Ct.BLACK=!1;Ct.EMPTY=new class{constructor(){this.size=0}get key(){throw Y(57766)}get value(){throw Y(16141)}get color(){throw Y(16727)}get left(){throw Y(29726)}get right(){throw Y(36894)}copy(e,t,n,s,i){return this}insert(e,t,n){return new Ct(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class De{constructor(e){this.comparator=e,this.data=new be(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal(((t,n)=>(e(t),!1)))}forEachInRange(e,t){const n=this.data.getIteratorFrom(e[0]);for(;n.hasNext();){const s=n.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let n;for(n=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();n.hasNext();)if(!e(n.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new KC(this.data.getIterator())}getIteratorFrom(e){return new KC(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach((n=>{t=t.add(n)})),t}isEqual(e){if(!(e instanceof De)||this.size!==e.size)return!1;const t=this.data.getIterator(),n=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=n.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach((t=>{e.push(t)})),e}toString(){const e=[];return this.forEach((t=>e.push(t))),"SortedSet("+e.toString()+")"}copy(e){const t=new De(this.comparator);return t.data=e,t}}class KC{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function Ms(r){return r.hasNext()?r.getNext():void 0}/**
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
 */const O={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class M extends Qn{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */const fn="__name__";class hn{constructor(e,t,n){t===void 0?t=0:t>e.length&&Y(637,{offset:t,range:e.length}),n===void 0?n=e.length-t:n>e.length-t&&Y(1746,{length:n,range:e.length-t}),this.segments=e,this.offset=t,this.len=n}get length(){return this.len}isEqual(e){return hn.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof hn?e.forEach((n=>{t.push(n)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,n=this.limit();t<n;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const n=Math.min(e.length,t.length);for(let s=0;s<n;s++){const i=hn.compareSegments(e.get(s),t.get(s));if(i!==0)return i}return ie(e.length,t.length)}static compareSegments(e,t){const n=hn.isNumericId(e),s=hn.isNumericId(t);return n&&!s?-1:!n&&s?1:n&&s?hn.extractNumericId(e).compare(hn.extractNumericId(t)):aB(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Dr.fromString(e.substring(4,e.length-2))}}class ce extends hn{construct(e,t,n){return new ce(e,t,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const n of e){if(n.indexOf("//")>=0)throw new M(O.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);t.push(...n.split("/").filter((s=>s.length>0)))}return new ce(t)}static emptyPath(){return new ce([])}}const Gv=/^[_a-zA-Z][_a-zA-Z0-9]*$/;let je=class Qs extends hn{construct(e,t,n){return new Qs(e,t,n)}static isValidIdentifier(e){return Gv.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Qs.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===fn}static keyField(){return new Qs([fn])}static fromServerFormat(e){const t=[];let n="",s=0;const i=()=>{if(n.length===0)throw new M(O.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(n),n=""};let o=!1;for(;s<e.length;){const a=e[s];if(a==="\\"){if(s+1===e.length)throw new M(O.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const c=e[s+1];if(c!=="\\"&&c!=="."&&c!=="`")throw new M(O.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);n+=c,s+=2}else a==="`"?(o=!o,s++):a!=="."||o?(n+=a,s++):(i(),s++)}if(i(),o)throw new M(O.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Qs(t)}static emptyPath(){return new Qs([])}};/**
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
 */class kt{constructor(e){this.fields=e,e.sort(je.comparator)}static empty(){return new kt([])}unionWith(e){let t=new De(je.comparator);for(const n of this.fields)t=t.add(n);for(const n of e)t=t.add(n);return new kt(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return ci(this.fields,e.fields,((t,n)=>t.isEqual(n)))}}/**
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
 */function Gc(r){let e=0;for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e++;return e}function Gr(r,e){for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e(t,r[t])}function ah(r,e){const t=[];for(const n in r)Object.prototype.hasOwnProperty.call(r,n)&&t.push(e(r[n],n,r));return t}function $m(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}/**
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
 */class J{constructor(e){this.path=e}static fromPath(e){return new J(ce.fromString(e))}static fromName(e){return new J(ce.fromString(e).popFirst(5))}static empty(){return new J(ce.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&ce.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return ce.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new J(new ce(e.slice()))}}/**
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
 */function ch(r,e,t){if(!t)throw new M(O.INVALID_ARGUMENT,`Function ${r}() cannot be called with an empty ${e}.`)}function Ym(r,e,t,n){if(e===!0&&n===!0)throw new M(O.INVALID_ARGUMENT,`${r} and ${t} cannot be used together.`)}function zC(r){if(!J.isDocumentKey(r))throw new M(O.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${r} has ${r.length}.`)}function WC(r){if(J.isDocumentKey(r))throw new M(O.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${r} has ${r.length}.`)}function ya(r){return typeof r=="object"&&r!==null&&(Object.getPrototypeOf(r)===Object.prototype||Object.getPrototypeOf(r)===null)}function Eu(r){if(r===void 0)return"undefined";if(r===null)return"null";if(typeof r=="string")return r.length>20&&(r=`${r.substring(0,20)}...`),JSON.stringify(r);if(typeof r=="number"||typeof r=="boolean")return""+r;if(typeof r=="object"){if(r instanceof Array)return"an array";{const e=(function(n){return n.constructor?n.constructor.name:null})(r);return e?`a custom ${e} object`:"an object"}}return typeof r=="function"?"a function":Y(12329,{type:typeof r})}function de(r,e){if("_delegate"in r&&(r=r._delegate),!(r instanceof e)){if(e.name===r.constructor.name)throw new M(O.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Eu(r);throw new M(O.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return r}function Xm(r,e){if(e<=0)throw new M(O.INVALID_ARGUMENT,`Function ${r}() requires a positive number, but it was: ${e}.`)}/**
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
 */function Ye(r,e){const t={typeString:r};return e&&(t.value=e),t}function As(r,e){if(!ya(r))throw new M(O.INVALID_ARGUMENT,"JSON must be an object");let t;for(const n in e)if(e[n]){const s=e[n].typeString,i="value"in e[n]?{value:e[n].value}:void 0;if(!(n in r)){t=`JSON missing required field: '${n}'`;break}const o=r[n];if(s&&typeof o!==s){t=`JSON field '${n}' must be a ${s}.`;break}if(i!==void 0&&o!==i.value){t=`Expected '${n}' field to equal '${i.value}'`;break}}if(t)throw new M(O.INVALID_ARGUMENT,t);return!0}/**
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
 */const QC=-62135596800,$C=1e6;class ye{static now(){return ye.fromMillis(Date.now())}static fromDate(e){return ye.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),n=Math.floor((e-1e3*t)*$C);return new ye(t,n)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new M(O.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new M(O.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<QC)throw new M(O.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new M(O.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/$C}_compareTo(e){return this.seconds===e.seconds?ie(this.nanoseconds,e.nanoseconds):ie(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:ye._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(As(e,ye._jsonSchema))return new ye(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-QC;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}ye._jsonSchemaVersion="firestore/timestamp/1.0",ye._jsonSchema={type:Ye("string",ye._jsonSchemaVersion),seconds:Ye("number"),nanoseconds:Ye("number")};/**
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
 */class Zm extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */function Uv(){return typeof atob<"u"}/**
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
 */class Oe{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new Zm("Invalid base64 string: "+i):i}})(e);return new Oe(t)}static fromUint8Array(e){const t=(function(s){let i="";for(let o=0;o<s.length;++o)i+=String.fromCharCode(s[o]);return i})(e);return new Oe(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const n=new Uint8Array(t.length);for(let s=0;s<t.length;s++)n[s]=t.charCodeAt(s);return n})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return ie(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Oe.EMPTY_BYTE_STRING=new Oe("");const Hv=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Jn(r){if(q(!!r,39018),typeof r=="string"){let e=0;const t=Hv.exec(r);if(q(!!t,46558,{timestamp:r}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const n=new Date(r);return{seconds:Math.floor(n.getTime()/1e3),nanos:e}}return{seconds:Ne(r.seconds),nanos:Ne(r.nanos)}}function Ne(r){return typeof r=="number"?r:typeof r=="string"?Number(r):0}function Kn(r){return typeof r=="string"?Oe.fromBase64String(r):Oe.fromUint8Array(r)}/**
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
 */const e_="server_timestamp",t_="__type__",n_="__previous_value__",r_="__local_write_time__";function wa(r){var t,n;return((n=(((t=r==null?void 0:r.mapValue)==null?void 0:t.fields)||{})[t_])==null?void 0:n.stringValue)===e_}function Da(r){const e=r.mapValue.fields[n_];return wa(e)?Da(e):e}function ui(r){const e=Jn(r.mapValue.fields[r_].timestampValue);return new ye(e.seconds,e.nanos)}/**
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
 */class qv{constructor(e,t,n,s,i,o,a,c,l,B,d,C,g){this.databaseId=e,this.appId=t,this.persistenceKey=n,this.host=s,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=a,this.longPollingOptions=c,this.useFetchStreams=l,this.isUsingEmulator=B,this.apiKey=d,this._customHeaders=C,this.grpcFlowControlWindow=g}}const ra="(default)";class br{constructor(e,t){this.projectId=e,this.database=t||ra}static empty(){return new br("","")}get isDefaultDatabase(){return this.database===ra}isEqual(e){return e instanceof br&&e.projectId===this.projectId&&e.database===this.database}}function jv(r,e){if(!Object.prototype.hasOwnProperty.apply(r.options,["projectId"]))throw new M(O.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new br(r.options.projectId,e)}/**
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
 */const Tr=-1;function Ta(r){return r==null}function li(r){return r===0&&1/r==-1/0}function s_(r){return typeof r=="number"&&Number.isInteger(r)&&!li(r)&&r<=Number.MAX_SAFE_INTEGER&&r>=Number.MIN_SAFE_INTEGER}function Jv(r){return typeof r=="string"}/**
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
 */const uh="__type__",i_="__max__",_r={mapValue:{fields:{__type__:{stringValue:i_}}}},lh="__vector__",Cs="value",En={nullValue:"NULL_VALUE"},Mt={booleanValue:!0},ht={booleanValue:!1};function Xe(r){return"nullValue"in r?0:"booleanValue"in r?1:"integerValue"in r||"doubleValue"in r?2:"timestampValue"in r?3:"stringValue"in r?5:"bytesValue"in r?6:"referenceValue"in r?7:"geoPointValue"in r?8:"arrayValue"in r?9:"mapValue"in r?wa(r)?4:o_(r)?9007199254740991:gs(r)?10:11:Y(28295,{value:r})}function nn(r,e,t){if(r===e)return!0;const n=Xe(r);if(n!==Xe(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return r.booleanValue===e.booleanValue;case 4:return ui(r).isEqual(ui(e));case 3:return(function(i,o){if(typeof i.timestampValue=="string"&&typeof o.timestampValue=="string"&&i.timestampValue.length===o.timestampValue.length)return i.timestampValue===o.timestampValue;const a=Jn(i.timestampValue),c=Jn(o.timestampValue);return a.seconds===c.seconds&&a.nanos===c.nanos})(r,e);case 5:return r.stringValue===e.stringValue;case 6:return(function(i,o){return Kn(i.bytesValue).isEqual(Kn(o.bytesValue))})(r,e);case 7:return r.referenceValue===e.referenceValue;case 8:return(function(i,o){return Ne(i.geoPointValue.latitude)===Ne(o.geoPointValue.latitude)&&Ne(i.geoPointValue.longitude)===Ne(o.geoPointValue.longitude)})(r,e);case 2:return(function(i,o,a){if("integerValue"in i&&"integerValue"in o)return Ne(i.integerValue)===Ne(o.integerValue);let c,l;if("doubleValue"in i&&"doubleValue"in o)c=Ne(i.doubleValue),l=Ne(o.doubleValue);else{if(!(a!=null&&a.t))return!1;c=Ne(i.integerValue??i.doubleValue),l=Ne(o.integerValue??o.doubleValue)}return c===l?!!(a!=null&&a.i)||li(c)===li(l):!!(a===void 0||a.o)&&isNaN(c)&&isNaN(l)})(r,e,t);case 9:return ci(r.arrayValue.values||[],e.arrayValue.values||[],((s,i)=>nn(s,i,t)));case 10:case 11:return(function(i,o,a){const c=i.mapValue.fields||{},l=o.mapValue.fields||{};if(Gc(c)!==Gc(l))return!1;for(const B in c)if(c.hasOwnProperty(B)&&(l[B]===void 0||!nn(c[B],l[B],a)))return!1;return!0})(r,e,t);default:return Y(52216,{left:r})}}function sa(r,e){return(r.values||[]).find((t=>nn(t,e)))!==void 0}function wt(r,e){if(r===e)return 0;const t=Xe(r),n=Xe(e);if(t!==n)return ie(t,n);switch(t){case 0:case 9007199254740991:return 0;case 1:return ie(r.booleanValue,e.booleanValue);case 2:return(function(i,o){const a=Ne(i.integerValue||i.doubleValue),c=Ne(o.integerValue||o.doubleValue);return a<c?-1:a>c?1:a===c?0:isNaN(a)?isNaN(c)?0:-1:1})(r,e);case 3:return YC(r.timestampValue,e.timestampValue);case 4:return YC(ui(r),ui(e));case 5:return aB(r.stringValue,e.stringValue);case 6:return(function(i,o){const a=Kn(i),c=Kn(o);return a.compareTo(c)})(r.bytesValue,e.bytesValue);case 7:return(function(i,o){const a=i.split("/"),c=o.split("/");for(let l=0;l<a.length&&l<c.length;l++){const B=ie(a[l],c[l]);if(B!==0)return B}return ie(a.length,c.length)})(r.referenceValue,e.referenceValue);case 8:return(function(i,o){const a=ie(Ne(i.latitude),Ne(o.latitude));return a!==0?a:ie(Ne(i.longitude),Ne(o.longitude))})(r.geoPointValue,e.geoPointValue);case 9:return XC(r.arrayValue,e.arrayValue);case 10:return(function(i,o){var C,g,I,P;const a=i.fields||{},c=o.fields||{},l=(C=a[Cs])==null?void 0:C.arrayValue,B=(g=c[Cs])==null?void 0:g.arrayValue,d=ie(((I=l==null?void 0:l.values)==null?void 0:I.length)||0,((P=B==null?void 0:B.values)==null?void 0:P.length)||0);return d!==0?d:XC(l,B)})(r.mapValue,e.mapValue);case 11:return(function(i,o){if(i===_r.mapValue&&o===_r.mapValue)return 0;if(i===_r.mapValue)return 1;if(o===_r.mapValue)return-1;const a=i.fields||{},c=Object.keys(a),l=o.fields||{},B=Object.keys(l);c.sort(),B.sort();for(let d=0;d<c.length&&d<B.length;++d){const C=aB(c[d],B[d]);if(C!==0)return C;const g=wt(a[c[d]],l[B[d]]);if(g!==0)return g}return ie(c.length,B.length)})(r.mapValue,e.mapValue);default:throw Y(23264,{u:t})}}function YC(r,e){if(typeof r=="string"&&typeof e=="string"&&r.length===e.length)return ie(r,e);const t=Jn(r),n=Jn(e),s=ie(t.seconds,n.seconds);return s!==0?s:ie(t.nanos,n.nanos)}function XC(r,e){const t=r.values||[],n=e.values||[];for(let s=0;s<t.length&&s<n.length;++s){const i=wt(t[s],n[s]);if(i!==void 0&&i!==0)return i}return ie(t.length,n.length)}function Bi(r){return cB(r)}function cB(r){return"nullValue"in r?"null":"booleanValue"in r?""+r.booleanValue:"integerValue"in r?""+r.integerValue:"doubleValue"in r?""+r.doubleValue:"timestampValue"in r?(function(t){const n=Jn(t);return`time(${n.seconds},${n.nanos})`})(r.timestampValue):"stringValue"in r?r.stringValue:"bytesValue"in r?(function(t){return Kn(t).toBase64()})(r.bytesValue):"referenceValue"in r?(function(t){return J.fromName(t).toString()})(r.referenceValue):"geoPointValue"in r?(function(t){return`geo(${t.latitude},${t.longitude})`})(r.geoPointValue):"arrayValue"in r?(function(t){let n="[",s=!0;for(const i of t.values||[])s?s=!1:n+=",",n+=cB(i);return n+"]"})(r.arrayValue):"mapValue"in r?(function(t){const n=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const o of n)i?i=!1:s+=",",s+=`${o}:${cB(t.fields[o])}`;return s+"}"})(r.mapValue):Y(61005,{value:r})}function Dc(r){switch(Xe(r)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=Da(r);return e?16+Dc(e):16;case 5:return 2*r.stringValue.length;case 6:return Kn(r.bytesValue).approximateByteSize();case 7:return r.referenceValue.length;case 9:return(function(n){return(n.values||[]).reduce(((s,i)=>s+Dc(i)),0)})(r.arrayValue);case 10:case 11:return(function(n){let s=0;return Gr(n.fields,((i,o)=>{s+=i.length+Dc(o)})),s})(r.mapValue);default:throw Y(13486,{value:r})}}function ps(r,e){return{referenceValue:`projects/${r.projectId}/databases/${r.database}/documents/${e.path.canonicalString()}`}}function Cn(r){return!!r&&"integerValue"in r}function as(r){return!!r&&"doubleValue"in r}function Sr(r){return Cn(r)||as(r)}function Nr(r){return!!r&&"arrayValue"in r}function Jt(r){return!!r&&"nullValue"in r}function Gt(r){return!!r&&"doubleValue"in r&&isNaN(Number(r.doubleValue))}function ls(r){return!!r&&"mapValue"in r}function gs(r){var t,n;return((n=(((t=r==null?void 0:r.mapValue)==null?void 0:t.fields)||{})[uh])==null?void 0:n.stringValue)===lh}function uB(r){var e,t;return(t=(((e=r==null?void 0:r.mapValue)==null?void 0:e.fields)||{})[Cs])==null?void 0:t.arrayValue}function xo(r){if(r.geoPointValue)return{geoPointValue:{...r.geoPointValue}};if(r.timestampValue&&typeof r.timestampValue=="object")return{timestampValue:{...r.timestampValue}};if(r.mapValue){const e={mapValue:{fields:{}}};return Gr(r.mapValue.fields,((t,n)=>e.mapValue.fields[t]=xo(n))),e}if(r.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(r.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=xo(r.arrayValue.values[t]);return e}return{...r}}function o_(r){return(((r.mapValue||{}).fields||{}).__type__||{}).stringValue===i_}const a_={mapValue:{fields:{[uh]:{stringValue:lh},[Cs]:{arrayValue:{}}}}};function Kv(r){return"nullValue"in r?En:"booleanValue"in r?{booleanValue:!1}:"integerValue"in r||"doubleValue"in r?{doubleValue:NaN}:"timestampValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in r?{stringValue:""}:"bytesValue"in r?{bytesValue:""}:"referenceValue"in r?ps(br.empty(),J.empty()):"geoPointValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in r?{arrayValue:{}}:"mapValue"in r?gs(r)?a_:{mapValue:{}}:Y(35942,{value:r})}function zv(r){return"nullValue"in r?{booleanValue:!1}:"booleanValue"in r?{doubleValue:NaN}:"integerValue"in r||"doubleValue"in r?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in r?{stringValue:""}:"stringValue"in r?{bytesValue:""}:"bytesValue"in r?ps(br.empty(),J.empty()):"referenceValue"in r?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in r?{arrayValue:{}}:"arrayValue"in r?a_:"mapValue"in r?gs(r)?{mapValue:{}}:_r:Y(61959,{value:r})}function ZC(r,e){const t=wt(r.value,e.value);return t!==0?t:r.inclusive&&!e.inclusive?-1:!r.inclusive&&e.inclusive?1:0}function ep(r,e){const t=wt(r.value,e.value);return t!==0?t:r.inclusive&&!e.inclusive?1:!r.inclusive&&e.inclusive?-1:0}/**
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
 */class tt{constructor(e){this.value=e}static empty(){return new tt({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let n=0;n<e.length-1;++n)if(t=(t.mapValue.fields||{})[e.get(n)],!ls(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=xo(t)}setAll(e){let t=je.emptyPath(),n={},s=[];e.forEach(((o,a)=>{if(!t.isImmediateParentOf(a)){const c=this.getFieldsMap(t);this.applyChanges(c,n,s),n={},s=[],t=a.popLast()}o?n[a.lastSegment()]=xo(o):s.push(a.lastSegment())}));const i=this.getFieldsMap(t);this.applyChanges(i,n,s)}delete(e){const t=this.field(e.popLast());ls(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return nn(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let n=0;n<e.length;++n){let s=t.mapValue.fields[e.get(n)];ls(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(n)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,n){Gr(t,((s,i)=>e[s]=i));for(const s of n)delete e[s]}clone(){return new tt(xo(this.value))}}function c_(r){const e=[];return Gr(r.fields,((t,n)=>{const s=new je([t]);if(ls(n)){const i=c_(n.mapValue).fields;if(i.length===0)e.push(s);else for(const o of i)e.push(s.child(o))}else e.push(s)})),new kt(e)}/**
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
 */function Iu(r,e){if(r.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:li(e)?"-0":e}}function Bh(r){return{integerValue:""+r}}function Gi(r,e,t){return s_(e)?Bh(e):Iu(r,e)}/**
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
 */class yu{constructor(){this._=void 0}}function Wv(r,e,t){return r instanceof hi?(function(s,i){const o={fields:{[t_]:{stringValue:e_},[r_]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&wa(i)&&(i=Da(i)),i&&(o.fields[n_]=i),{mapValue:o}})(t,e):r instanceof ms?l_(r,e):r instanceof _s?B_(r,e):r instanceof Es?(function(s,i){const o=u_(s,i),a=Uc(o)+Uc(s.l);return Cn(o)&&Cn(s.l)?Bh(a):Iu(s.serializer,a)})(r,e):r instanceof di?(function(s,i){return tp(s,i,Math.min)})(r,e):r instanceof fi?(function(s,i){return tp(s,i,Math.max)})(r,e):void 0}function Qv(r,e,t){return r instanceof ms?l_(r,e):r instanceof _s?B_(r,e):t}function u_(r,e){return r instanceof Es?Sr(e)?e:{integerValue:0}:null}class hi extends yu{}class ms extends yu{constructor(e){super(),this.elements=e}}function l_(r,e){const t=h_(e);for(const n of r.elements)t.some((s=>nn(s,n)))||t.push(n);return{arrayValue:{values:t}}}class _s extends yu{constructor(e){super(),this.elements=e}}function B_(r,e){let t=h_(e);for(const n of r.elements)t=t.filter((s=>!nn(s,n)));return{arrayValue:{values:t}}}class hh extends yu{constructor(e,t){super(),this.serializer=e,this.l=t}}class Es extends hh{}class di extends hh{}class fi extends hh{}function tp(r,e,t){if(!Sr(e))return r.l;const n=t(Uc(e),Uc(r.l));return Cn(e)&&Cn(r.l)?Bh(n):Iu(r.serializer,n)}function Uc(r){return Ne(r.integerValue||r.doubleValue)}function h_(r){return Nr(r)&&r.arrayValue.values?r.arrayValue.values.slice():[]}/**
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
 */class Rs{constructor(e,t){this.field=e,this.transform=t}}function $v(r,e){return r.field.isEqual(e.field)&&(function(n,s){return n instanceof ms&&s instanceof ms||n instanceof _s&&s instanceof _s?ci(n.elements,s.elements,nn):n instanceof Es&&s instanceof Es||n instanceof di&&s instanceof di||n instanceof fi&&s instanceof fi?nn(n.l,s.l):n instanceof hi&&s instanceof hi})(r.transform,e.transform)}class Yv{constructor(e,t){this.version=e,this.transformResults=t}}class Ve{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Ve}static exists(e){return new Ve(void 0,e)}static updateTime(e){return new Ve(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Tc(r,e){return r.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(r.updateTime):r.exists===void 0||r.exists===e.isFoundDocument()}class wu{}function d_(r,e){if(!r.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return r.isNoDocument()?new Hi(r.key,Ve.none()):new Ui(r.key,r.data,Ve.none());{const t=r.data,n=tt.empty();let s=new De(je.comparator);for(let i of e.fields)if(!s.has(i)){let o=t.field(i);o===null&&i.length>1&&(i=i.popLast(),o=t.field(i)),o===null?n.delete(i):n.set(i,o),s=s.add(i)}return new Yn(r.key,n,new kt(s.toArray()),Ve.none())}}function Xv(r,e,t){r instanceof Ui?(function(s,i,o){const a=s.value.clone(),c=rp(s.fieldTransforms,i,o.transformResults);a.setAll(c),i.convertToFoundDocument(o.version,a).setHasCommittedMutations()})(r,e,t):r instanceof Yn?(function(s,i,o){if(!Tc(s.precondition,i))return void i.convertToUnknownDocument(o.version);const a=rp(s.fieldTransforms,i,o.transformResults),c=i.data;c.setAll(f_(s)),c.setAll(a),i.convertToFoundDocument(o.version,c).setHasCommittedMutations()})(r,e,t):(function(s,i,o){i.convertToNoDocument(o.version).setHasCommittedMutations()})(0,e,t)}function Vo(r,e,t,n){return r instanceof Ui?(function(i,o,a,c){if(!Tc(i.precondition,o))return a;const l=i.value.clone(),B=sp(i.fieldTransforms,c,o);return l.setAll(B),o.convertToFoundDocument(o.version,l).setHasLocalMutations(),null})(r,e,t,n):r instanceof Yn?(function(i,o,a,c){if(!Tc(i.precondition,o))return a;const l=sp(i.fieldTransforms,c,o),B=o.data;return B.setAll(f_(i)),B.setAll(l),o.convertToFoundDocument(o.version,B).setHasLocalMutations(),a===null?null:a.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map((d=>d.field)))})(r,e,t,n):(function(i,o,a){return Tc(i.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):a})(r,e,t)}function Zv(r,e){let t=null;for(const n of r.fieldTransforms){const s=e.data.field(n.field),i=u_(n.transform,s||null);i!=null&&(t===null&&(t=tt.empty()),t.set(n.field,i))}return t||null}function np(r,e){return r.type===e.type&&!!r.key.isEqual(e.key)&&!!r.precondition.isEqual(e.precondition)&&!!(function(n,s){return n===void 0&&s===void 0||!(!n||!s)&&ci(n,s,((i,o)=>$v(i,o)))})(r.fieldTransforms,e.fieldTransforms)&&(r.type===0?r.value.isEqual(e.value):r.type!==1||r.data.isEqual(e.data)&&r.fieldMask.isEqual(e.fieldMask))}class Ui extends wu{constructor(e,t,n,s=[]){super(),this.key=e,this.value=t,this.precondition=n,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class Yn extends wu{constructor(e,t,n,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=n,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function f_(r){const e=new Map;return r.fieldMask.fields.forEach((t=>{if(!t.isEmpty()){const n=r.data.field(t);e.set(t,n)}})),e}function rp(r,e,t){const n=new Map;q(r.length===t.length,32656,{h:t.length,T:r.length});for(let s=0;s<t.length;s++){const i=r[s],o=i.transform,a=e.data.field(i.field);n.set(i.field,Qv(o,a,t[s]))}return n}function sp(r,e,t){const n=new Map;for(const s of r){const i=s.transform,o=t.data.field(s.field);n.set(s.field,Wv(i,o,e))}return n}class Hi extends wu{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class dh extends wu{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */class Or{constructor(e,t){this.position=e,this.inclusive=t}}function ip(r,e,t){let n=0;for(let s=0;s<r.position.length;s++){const i=e[s],o=r.position[s];if(i.field.isKeyField()?n=J.comparator(J.fromName(o.referenceValue),t.key):n=wt(o,t.data.field(i.field)),i.dir==="desc"&&(n*=-1),n!==0)break}return n}function op(r,e){if(r===null)return e===null;if(e===null||r.inclusive!==e.inclusive||r.position.length!==e.position.length)return!1;for(let t=0;t<r.position.length;t++)if(!nn(r.position[t],e.position[t]))return!1;return!0}/**
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
 */class C_{}class pe extends C_{constructor(e,t,n){super(),this.field=e,this.op=t,this.value=n}static create(e,t,n){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,n):new eP(e,t,n):t==="array-contains"?new rP(e,n):t==="in"?new I_(e,n):t==="not-in"?new sP(e,n):t==="array-contains-any"?new iP(e,n):new pe(e,t,n)}static createKeyFieldInFilter(e,t,n){return t==="in"?new tP(e,n):new nP(e,n)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(wt(t,this.value)):t!==null&&Xe(this.value)===Xe(t)&&this.matchesComparison(wt(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return Y(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Te extends C_{constructor(e,t){super(),this.filters=e,this.op=t,this.P=null}static create(e,t){return new Te(e,t)}matches(e){return Ci(this)?this.filters.find((t=>!t.matches(e)))===void 0:this.filters.find((t=>t.matches(e)))!==void 0}getFlattenedFilters(){return this.P!==null||(this.P=this.filters.reduce(((e,t)=>e.concat(t.getFlattenedFilters())),[])),this.P}getFilters(){return Object.assign([],this.filters)}}function Ci(r){return r.op==="and"}function lB(r){return r.op==="or"}function fh(r){return p_(r)&&Ci(r)}function p_(r){for(const e of r.filters)if(e instanceof Te)return!1;return!0}function BB(r){if(r instanceof pe)return r.field.canonicalString()+r.op.toString()+Bi(r.value);if(fh(r))return r.filters.map((e=>BB(e))).join(",");{const e=r.filters.map((t=>BB(t))).join(",");return`${r.op}(${e})`}}function g_(r,e){return r instanceof pe?(function(n,s){return s instanceof pe&&n.op===s.op&&n.field.isEqual(s.field)&&nn(n.value,s.value)})(r,e):r instanceof Te?(function(n,s){return s instanceof Te&&n.op===s.op&&n.filters.length===s.filters.length?n.filters.reduce(((i,o,a)=>i&&g_(o,s.filters[a])),!0):!1})(r,e):void Y(19439)}function m_(r,e){const t=r.filters.concat(e);return Te.create(t,r.op)}function __(r){return r instanceof pe?(function(t){return`${t.field.canonicalString()} ${t.op} ${Bi(t.value)}`})(r):r instanceof Te?(function(t){return t.op.toString()+" {"+t.getFilters().map(__).join(" ,")+"}"})(r):"Filter"}class eP extends pe{constructor(e,t,n){super(e,t,n),this.key=J.fromName(n.referenceValue)}matches(e){const t=J.comparator(e.key,this.key);return this.matchesComparison(t)}}class tP extends pe{constructor(e,t){super(e,"in",t),this.keys=E_("in",t)}matches(e){return this.keys.some((t=>t.isEqual(e.key)))}}class nP extends pe{constructor(e,t){super(e,"not-in",t),this.keys=E_("not-in",t)}matches(e){return!this.keys.some((t=>t.isEqual(e.key)))}}function E_(r,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map((n=>J.fromName(n.referenceValue)))}class rP extends pe{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Nr(t)&&sa(t.arrayValue,this.value)}}class I_ extends pe{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&sa(this.value.arrayValue,t)}}class sP extends pe{constructor(e,t){super(e,"not-in",t)}matches(e){if(sa(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!sa(this.value.arrayValue,t)}}class iP extends pe{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Nr(t)||!t.arrayValue.values)&&t.arrayValue.values.some((n=>sa(this.value.arrayValue,n)))}}/**
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
 */class ia{constructor(e,t="asc"){this.field=e,this.dir=t}}function oP(r,e){return r.dir===e.dir&&r.field.isEqual(e.field)}/**
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
 */class te{static fromTimestamp(e){return new te(e)}static min(){return new te(new ye(0,0))}static max(){return new te(new ye(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
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
 */class xe{constructor(e,t,n,s,i,o,a){this.key=e,this.documentType=t,this.version=n,this.readTime=s,this.createTime=i,this.data=o,this.documentState=a}static newInvalidDocument(e){return new xe(e,0,te.min(),te.min(),te.min(),tt.empty(),0)}static newFoundDocument(e,t,n,s){return new xe(e,1,t,te.min(),n,s,0)}static newNoDocument(e,t){return new xe(e,2,t,te.min(),te.min(),tt.empty(),0)}static newUnknownDocument(e,t){return new xe(e,3,t,te.min(),te.min(),tt.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(te.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=tt.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=tt.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=te.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof xe&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new xe(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */const pi=-1;class gi{constructor(e,t,n,s){this.indexId=e,this.collectionGroup=t,this.fields=n,this.indexState=s}}function hB(r){return r.fields.find((e=>e.kind===2))}function Zr(r){return r.fields.filter((e=>e.kind!==2))}function aP(r,e){let t=ie(r.collectionGroup,e.collectionGroup);if(t!==0)return t;for(let n=0;n<Math.min(r.fields.length,e.fields.length);++n)if(t=cP(r.fields[n],e.fields[n]),t!==0)return t;return ie(r.fields.length,e.fields.length)}gi.UNKNOWN_ID=-1;class Bs{constructor(e,t){this.fieldPath=e,this.kind=t}}function cP(r,e){const t=je.comparator(r.fieldPath,e.fieldPath);return t!==0?t:ie(r.kind,e.kind)}class mi{constructor(e,t){this.sequenceNumber=e,this.offset=t}static empty(){return new mi(0,Kt.min())}}function y_(r,e){const t=r.toTimestamp().seconds,n=r.toTimestamp().nanoseconds+1,s=te.fromTimestamp(n===1e9?new ye(t+1,0):new ye(t,n));return new Kt(s,J.empty(),e)}function w_(r){return new Kt(r.readTime,r.key,pi)}class Kt{constructor(e,t,n){this.readTime=e,this.documentKey=t,this.largestBatchId=n}static min(){return new Kt(te.min(),J.empty(),pi)}static max(){return new Kt(te.max(),J.empty(),pi)}}function Ch(r,e){let t=r.readTime.compareTo(e.readTime);return t!==0?t:(t=J.comparator(r.documentKey,e.documentKey),t!==0?t:ie(r.largestBatchId,e.largestBatchId))}/**
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
 */class uP{constructor(e,t=null,n=[],s=[],i=null,o=null,a=null){this.path=e,this.collectionGroup=t,this.orderBy=n,this.filters=s,this.limit=i,this.startAt=o,this.endAt=a,this.R=null}}function dB(r,e=null,t=[],n=[],s=null,i=null,o=null){return new uP(r,e,t,n,s,i,o)}function Hc(r){const e=W(r);if(e.R===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map((n=>BB(n))).join(","),t+="|ob:",t+=e.orderBy.map((n=>(function(i){return i.field.canonicalString()+i.dir})(n))).join(","),Ta(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map((n=>Bi(n))).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map((n=>Bi(n))).join(",")),e.R=t}return e.R}function ph(r,e){if(r.limit!==e.limit||r.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<r.orderBy.length;t++)if(!oP(r.orderBy[t],e.orderBy[t]))return!1;if(r.filters.length!==e.filters.length)return!1;for(let t=0;t<r.filters.length;t++)if(!g_(r.filters[t],e.filters[t]))return!1;return r.collectionGroup===e.collectionGroup&&!!r.path.isEqual(e.path)&&!!op(r.startAt,e.startAt)&&op(r.endAt,e.endAt)}function Sn(r){return!!r.isCorePipeline}function gh(r){return!!r.path&&J.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}function qc(r,e){return r.filters.filter((t=>t instanceof pe&&t.field.isEqual(e)))}function ap(r,e,t){let n=En,s=!0;for(const i of qc(r,e)){let o=En,a=!0;switch(i.op){case"<":case"<=":o=Kv(i.value);break;case"==":case"in":case">=":o=i.value;break;case">":o=i.value,a=!1;break;case"!=":case"not-in":o=En}ZC({value:n,inclusive:s},{value:o,inclusive:a})<0&&(n=o,s=a)}if(t!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(e)){const o=t.position[i];ZC({value:n,inclusive:s},{value:o,inclusive:t.inclusive})<0&&(n=o,s=t.inclusive);break}}return{value:n,inclusive:s}}function cp(r,e,t){let n=_r,s=!0;for(const i of qc(r,e)){let o=_r,a=!0;switch(i.op){case">=":case">":o=zv(i.value),a=!1;break;case"==":case"in":case"<=":o=i.value;break;case"<":o=i.value,a=!1;break;case"!=":case"not-in":o=_r}ep({value:n,inclusive:s},{value:o,inclusive:a})>0&&(n=o,s=a)}if(t!==null){for(let i=0;i<r.orderBy.length;++i)if(r.orderBy[i].field.isEqual(e)){const o=t.position[i];ep({value:n,inclusive:s},{value:o,inclusive:t.inclusive})>0&&(n=o,s=t.inclusive);break}}return{value:n,inclusive:s}}/**
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
 */class Xn{constructor(e,t=null,n=[],s=[],i=null,o="F",a=null,c=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=n,this.filters=s,this.limit=i,this.limitType=o,this.startAt=a,this.endAt=c,this.I=null,this.A=null,this.V=null,this.startAt,this.endAt}}function D_(r,e,t,n,s,i,o,a){return new Xn(r,e,t,n,s,i,o,a)}function qi(r){return new Xn(r)}function up(r){return r.filters.length===0&&r.limit===null&&r.startAt==null&&r.endAt==null&&(r.explicitOrderBy.length===0||r.explicitOrderBy.length===1&&r.explicitOrderBy[0].field.isKeyField())}function lP(r){return J.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}function mh(r){return r.collectionGroup!==null}function si(r){const e=W(r);if(e.I===null){e.I=[];const t=new Set;for(const i of e.explicitOrderBy)e.I.push(i),t.add(i.field.canonicalString());const n=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let a=new De(je.comparator);return o.filters.forEach((c=>{c.getFlattenedFilters().forEach((l=>{l.isInequality()&&(a=a.add(l.field))}))})),a})(e).forEach((i=>{t.has(i.canonicalString())||i.isKeyField()||e.I.push(new ia(i,n))})),t.has(je.keyField().canonicalString())||e.I.push(new ia(je.keyField(),n))}return e.I}function It(r){const e=W(r);return e.A||(e.A=A_(e,si(r))),e.A}function T_(r){const e=W(r);return e.V||(e.V=A_(e,r.explicitOrderBy)),e.V}function A_(r,e){if(r.limitType==="F")return dB(r.path,r.collectionGroup,e,r.filters,r.limit,r.startAt,r.endAt);{e=e.map((s=>{const i=s.dir==="desc"?"asc":"desc";return new ia(s.field,i)}));const t=r.endAt?new Or(r.endAt.position,r.endAt.inclusive):null,n=r.startAt?new Or(r.startAt.position,r.startAt.inclusive):null;return dB(r.path,r.collectionGroup,e,r.filters,r.limit,t,n)}}function fB(r,e){const t=r.filters.concat([e]);return new Xn(r.path,r.collectionGroup,r.explicitOrderBy.slice(),t,r.limit,r.limitType,r.startAt,r.endAt)}function BP(r,e){const t=r.explicitOrderBy.concat([e]);return new Xn(r.path,r.collectionGroup,t,r.filters.slice(),r.limit,r.limitType,r.startAt,r.endAt)}function jc(r,e,t){return new Xn(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),e,t,r.startAt,r.endAt)}function hP(r,e){return new Xn(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),r.limit,r.limitType,e,r.endAt)}function dP(r,e){return new Xn(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),r.limit,r.limitType,r.startAt,e)}function R_(r,e){return ph(It(r),It(e))&&r.limitType===e.limitType}function Mo(r){return`Query(target=${(function(t){let n=t.path.canonicalString();return t.collectionGroup!==null&&(n+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(n+=`, filters: [${t.filters.map((s=>__(s))).join(", ")}]`),Ta(t.limit)||(n+=", limit: "+t.limit),t.orderBy.length>0&&(n+=`, orderBy: [${t.orderBy.map((s=>(function(o){return`${o.field.canonicalString()} (${o.dir})`})(s))).join(", ")}]`),t.startAt&&(n+=", startAt: ",n+=t.startAt.inclusive?"b:":"a:",n+=t.startAt.position.map((s=>Bi(s))).join(",")),t.endAt&&(n+=", endAt: ",n+=t.endAt.inclusive?"a:":"b:",n+=t.endAt.position.map((s=>Bi(s))).join(",")),`Target(${n})`})(It(r))}; limitType=${r.limitType})`}function Du(r,e){return e.isFoundDocument()&&(function(n,s){const i=s.key.path;return n.collectionGroup!==null?s.key.hasCollectionId(n.collectionGroup)&&n.path.isPrefixOf(i):J.isDocumentKey(n.path)?n.path.isEqual(i):n.path.isImmediateParentOf(i)})(r,e)&&(function(n,s){for(const i of si(n))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0})(r,e)&&(function(n,s){for(const i of n.filters)if(!i.matches(s))return!1;return!0})(r,e)&&(function(n,s){return!(n.startAt&&!(function(o,a,c){const l=ip(o,a,c);return o.inclusive?l<=0:l<0})(n.startAt,si(n),s)||n.endAt&&!(function(o,a,c){const l=ip(o,a,c);return o.inclusive?l>=0:l>0})(n.endAt,si(n),s))})(r,e)}function Tu(r){return(e,t)=>{let n=!1;for(const s of si(r)){const i=fP(s,e,t);if(i!==0)return i;n=n||s.field.isKeyField()}return 0}}function fP(r,e,t){const n=r.field.isKeyField()?J.comparator(e.key,t.key):(function(i,o,a){const c=o.data.field(i),l=a.data.field(i);return c!==null&&l!==null?wt(c,l):Y(42886)})(r.field,e,t);switch(r.dir){case"asc":return n;case"desc":return-1*n;default:return Y(19790,{direction:r.dir})}}/**
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
 */class CP{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
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
 */var Ke,me;function v_(r){switch(r){case O.OK:return Y(64938);case O.CANCELLED:case O.UNKNOWN:case O.DEADLINE_EXCEEDED:case O.RESOURCE_EXHAUSTED:case O.INTERNAL:case O.UNAVAILABLE:case O.UNAUTHENTICATED:return!1;case O.INVALID_ARGUMENT:case O.NOT_FOUND:case O.ALREADY_EXISTS:case O.PERMISSION_DENIED:case O.FAILED_PRECONDITION:case O.ABORTED:case O.OUT_OF_RANGE:case O.UNIMPLEMENTED:case O.DATA_LOSS:return!0;default:return Y(15467,{code:r})}}function P_(r){if(r===void 0)return qe("GRPC error has no .code"),O.UNKNOWN;switch(r){case Ke.OK:return O.OK;case Ke.CANCELLED:return O.CANCELLED;case Ke.UNKNOWN:return O.UNKNOWN;case Ke.DEADLINE_EXCEEDED:return O.DEADLINE_EXCEEDED;case Ke.RESOURCE_EXHAUSTED:return O.RESOURCE_EXHAUSTED;case Ke.INTERNAL:return O.INTERNAL;case Ke.UNAVAILABLE:return O.UNAVAILABLE;case Ke.UNAUTHENTICATED:return O.UNAUTHENTICATED;case Ke.INVALID_ARGUMENT:return O.INVALID_ARGUMENT;case Ke.NOT_FOUND:return O.NOT_FOUND;case Ke.ALREADY_EXISTS:return O.ALREADY_EXISTS;case Ke.PERMISSION_DENIED:return O.PERMISSION_DENIED;case Ke.FAILED_PRECONDITION:return O.FAILED_PRECONDITION;case Ke.ABORTED:return O.ABORTED;case Ke.OUT_OF_RANGE:return O.OUT_OF_RANGE;case Ke.UNIMPLEMENTED:return O.UNIMPLEMENTED;case Ke.DATA_LOSS:return O.DATA_LOSS;default:return Y(39323,{code:r})}}(me=Ke||(Ke={}))[me.OK=0]="OK",me[me.CANCELLED=1]="CANCELLED",me[me.UNKNOWN=2]="UNKNOWN",me[me.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",me[me.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",me[me.NOT_FOUND=5]="NOT_FOUND",me[me.ALREADY_EXISTS=6]="ALREADY_EXISTS",me[me.PERMISSION_DENIED=7]="PERMISSION_DENIED",me[me.UNAUTHENTICATED=16]="UNAUTHENTICATED",me[me.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",me[me.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",me[me.ABORTED=10]="ABORTED",me[me.OUT_OF_RANGE=11]="OUT_OF_RANGE",me[me.UNIMPLEMENTED=12]="UNIMPLEMENTED",me[me.INTERNAL=13]="INTERNAL",me[me.UNAVAILABLE=14]="UNAVAILABLE",me[me.DATA_LOSS=15]="DATA_LOSS";/**
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
 */class Zn{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n!==void 0){for(const[s,i]of n)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const n=this.mapKeyFn(e),s=this.inner[n];if(s===void 0)return this.inner[n]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n===void 0)return!1;for(let s=0;s<n.length;s++)if(this.equalsFn(n[s][0],e))return n.length===1?delete this.inner[t]:n.splice(s,1),this.innerSize--,!0;return!1}forEach(e){Gr(this.inner,((t,n)=>{for(const[s,i]of n)e(s,i)}))}isEmpty(){return $m(this.inner)}size(){return this.innerSize}}/**
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
 */const pP=new be(J.comparator);function $e(){return pP}const b_=new be(J.comparator);function ts(...r){let e=b_;for(const t of r)e=e.insert(t.key,t);return e}function S_(r){let e=b_;return r.forEach(((t,n)=>e=e.insert(t,n.overlayedDocument))),e}function en(){return Go()}function N_(){return Go()}function Go(){return new Zn((r=>r.toString()),((r,e)=>r.isEqual(e)))}const gP=new be(J.comparator),mP=new De(J.comparator);function ae(...r){let e=mP;for(const t of r)e=e.add(t);return e}const _P=new De(ie);function _h(){return _P}/**
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
 */let Uo=null;function EP(r){if(Uo)throw new Error("a TestingHooksSpi instance is already set");Uo=r}/**
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
 */function O_(){return new TextEncoder}/**
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
 */const IP=new Dr([4294967295,4294967295],0);function lp(r){const e=O_().encode(r),t=new km;return t.update(e),new Uint8Array(t.digest())}function Bp(r){const e=new DataView(r.buffer),t=e.getUint32(0,!0),n=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new Dr([t,n],0),new Dr([s,i],0)]}class Eh{constructor(e,t,n){if(this.bitmap=e,this.padding=t,this.hashCount=n,t<0||t>=8)throw new Po(`Invalid padding: ${t}`);if(n<0)throw new Po(`Invalid hash count: ${n}`);if(e.length>0&&this.hashCount===0)throw new Po(`Invalid hash count: ${n}`);if(e.length===0&&t!==0)throw new Po(`Invalid padding when bitmap length is 0: ${t}`);this.m=8*e.length-t,this.p=Dr.fromNumber(this.m)}S(e,t,n){let s=e.add(t.multiply(Dr.fromNumber(n)));return s.compare(IP)===1&&(s=new Dr([s.getBits(0),s.getBits(1)],0)),s.modulo(this.p).toNumber()}v(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.m===0)return!1;const t=lp(e),[n,s]=Bp(t);for(let i=0;i<this.hashCount;i++){const o=this.S(n,s,i);if(!this.v(o))return!1}return!0}static create(e,t,n){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),o=new Eh(i,s,t);return n.forEach((a=>o.insert(a))),o}insert(e){if(this.m===0)return;const t=lp(e),[n,s]=Bp(t);for(let i=0;i<this.hashCount;i++){const o=this.S(n,s,i);this.D(o)}}D(e){const t=Math.floor(e/8),n=e%8;this.bitmap[t]|=1<<n}}class Po extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
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
 */class ji{constructor(e,t,n,s,i,o){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=n,this.documentUpdates=s,this.augmentedDocumentUpdates=i,this.resolvedLimboDocuments=o}static createSynthesizedRemoteEventForCurrentChange(e,t,n){const s=new Map;return s.set(e,Aa.createSynthesizedTargetChangeForCurrentChange(e,t,n)),new ji(te.min(),s,new be(ie),$e(),$e(),ae())}}class Aa{constructor(e,t,n,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=n,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,n){return new Aa(n,t,ae(),ae(),ae())}}/**
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
 */class Ac{constructor(e,t,n,s){this.C=e,this.removedTargetIds=t,this.key=n,this.F=s}}class F_{constructor(e,t){this.targetId=e,this.O=t}}class k_{constructor(e,t,n=Oe.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=n,this.cause=s}}class hp{constructor(e){this.targetId=e,this.M=0,this.N=dp(),this.L=Oe.EMPTY_BYTE_STRING,this.B=!1,this.U=!0}get current(){return this.B}get resumeToken(){return this.L}get k(){return this.M!==0}get q(){return this.U}$(e){e.approximateByteSize()>0&&(this.U=!0,this.L=e)}K(){let e=ae(),t=ae(),n=ae();return this.N.forEach(((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:n=n.add(s);break;default:Y(38017,{changeType:i})}})),new Aa(this.L,this.B,e,t,n)}W(){this.U=!1,this.N=dp()}G(e,t){this.U=!0,this.N=this.N.insert(e,t)}j(e){this.U=!0,this.N=this.N.remove(e)}H(){this.M+=1}J(){this.M-=1,q(this.M>=0,3241,{M:this.M,targetId:this.targetId})}Y(){this.U=!0,this.B=!0}}const _o="WatchChangeAggregator";class yP{constructor(e){this.Z=e,this.X=new Map,this.ee=$e(),this.te=Bc(),this.ne=$e(),this.re=Bc(),this.ie=new be(ie)}se(e){for(const t of e.C)e.F&&e.F.isFoundDocument()?this._e(t,e.F):this.oe(t,e.key,e.F);for(const t of e.removedTargetIds)this.oe(t,e.key,e.F)}ae(e){this.forEachTarget(e,(t=>{const n=this.X.get(t);if(n)switch(e.state){case 0:this.ue(t)&&n.$(e.resumeToken);break;case 1:n.J(),n.k||n.W(),n.$(e.resumeToken);break;case 2:n.J(),n.k||this.removeTarget(t);break;case 3:this.ue(t)&&(n.Y(),n.$(e.resumeToken));break;case 4:this.ue(t)&&(this.ce(t),n.$(e.resumeToken));break;default:Y(56790,{state:e.state})}else U(_o,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)}))}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.X.forEach(((n,s)=>{this.ue(s)&&t(s)}))}le(e){var t;return Sn(e)?e.getPipelineSourceType()==="documents"&&((t=e.getPipelineDocuments())==null?void 0:t.length)===1:gh(e)}Ee(e){const t=e.targetId,n=e.O.count,s=this.he(t);if(s){const i=s.target;if(this.le(i))if(n===0){const o=new J(Sn(i)?ce.fromString(i.getPipelineDocuments()[0]):i.path);this.oe(t,o,xe.newNoDocument(o,te.min()))}else q(n===1,20013,"Single document existence filter with count: "+n);else{const o=this.Te(t);if(o!==n){const a=this.Pe(e),c=a?this.Re(a,e,o):1;if(c!==0){this.ce(t);const l=c===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.ie=this.ie.insert(t,l)}Uo==null||Uo.Ie((function(B,d,C,g,I){var H,Z,ee;const P={localCacheCount:B,existenceFilterCount:d.count,databaseId:C.database,projectId:C.projectId},F=d.unchangedNames;return F&&(P.bloomFilter={applied:I===0,hashCount:(F==null?void 0:F.hashCount)??0,bitmapLength:((Z=(H=F==null?void 0:F.bits)==null?void 0:H.bitmap)==null?void 0:Z.length)??0,padding:((ee=F==null?void 0:F.bits)==null?void 0:ee.padding)??0,mightContain:Be=>(g==null?void 0:g.mightContain(Be))??!1}),P})(o,e.O,this.Z.Ae(),a,c))}}}}Pe(e){const t=e.O.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:n="",padding:s=0},hashCount:i=0}=t;let o,a;try{o=Kn(n).toUint8Array()}catch(c){if(c instanceof Zm)return st("Decoding the base64 bloom filter in existence filter failed ("+c.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw c}try{a=new Eh(o,s,i)}catch(c){return st(c instanceof Po?"BloomFilter error: ":"Applying bloom filter failed: ",c),null}return a.m===0?null:a}Re(e,t,n){return t.O.count===n-this.Ve(e,t.targetId)?0:2}Ve(e,t){const n=this.Z.getRemoteKeysForTarget(t);let s=0;return n.forEach((i=>{const o=this.Z.Ae(),a=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;e.mightContain(a)||(this.oe(t,i,null),s++)})),s}de(e){const t=new Map;this.X.forEach(((i,o)=>{const a=this.he(o);if(a){if(i.current&&this.le(a.target)){const c=Sn(a.target)?ce.fromString(a.target.getPipelineDocuments()[0]):a.target.path,l=new J(c);this.fe(l).has(o)||this.me(o,l)||this.oe(o,l,xe.newNoDocument(l,e))}i.q&&(t.set(o,i.K()),i.W())}}));let n=ae();this.re.forEach(((i,o)=>{let a=!0;o.forEachWhile((c=>{const l=this.he(c);return!l||l.purpose==="TargetPurposeLimboResolution"||(a=!1,!1)})),a&&(n=n.add(i))})),this.ee.forEach(((i,o)=>o.setReadTime(e))),this.ne.forEach(((i,o)=>o.setReadTime(e)));const s=new ji(e,t,this.ie,this.ee,this.ne,n);return this.ee=$e(),this.te=Bc(),this.ne=$e(),this.re=Bc(),this.ie=new be(ie),s}_e(e,t){const n=this.X.get(e);if(!n||!this.ue(e))return void U(_o,`addDocumentToTarget received document for unknown inactive target (${e})`);const s=this.me(e,t.key)?2:0;n.G(t.key,s),Sn(this.he(e).target)&&this.he(e).target.getPipelineFlavor()!=="exact"?this.ne=this.ne.insert(t.key,t):this.ee=this.ee.insert(t.key,t),this.te=this.te.insert(t.key,this.fe(t.key).add(e)),this.re=this.re.insert(t.key,this.pe(t.key).add(e))}oe(e,t,n){const s=this.X.get(e);s&&this.ue(e)?(this.me(e,t)?s.G(t,1):s.j(t),this.re=this.re.insert(t,this.pe(t).delete(e)),this.re=this.re.insert(t,this.pe(t).add(e)),n&&(Sn(this.he(e).target)&&this.he(e).target.getPipelineFlavor()!=="exact"?this.ne=this.ne.insert(t,n):this.ee=this.ee.insert(t,n))):U(_o,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.X.delete(e)}Te(e){const t=this.X.get(e);if(!t)return 0;const n=t.K();return this.Z.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}H(e){let t=this.X.get(e);t||(U(_o,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new hp(e),this.X.set(e,t)),t.H()}pe(e){let t=this.re.get(e);return t||(t=new De(ie),this.re=this.re.insert(e,t)),t}fe(e){let t=this.te.get(e);return t||(t=new De(ie),this.te=this.te.insert(e,t)),t}ue(e){const t=this.he(e)!==null;return t||U(_o,"Detected inactive target",e),t}he(e){const t=this.X.get(e);return t===void 0||t.k?null:this.Z.ge(e)}ce(e){this.X.set(e,new hp(e)),this.Z.getRemoteKeysForTarget(e).forEach((t=>{this.oe(e,t,null)}))}me(e,t){return this.Z.getRemoteKeysForTarget(e).has(t)}}function Bc(){return new be(J.comparator)}function dp(){return new be(J.comparator)}const wP={asc:"ASCENDING",desc:"DESCENDING"},DP={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},TP={and:"AND",or:"OR"};class AP{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function CB(r,e){return r.useProto3Json||Ta(e)?e:{value:e}}function _i(r,e){return r.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Ih(r){const e=Jn(r);return new ye(e.seconds,e.nanos)}function L_(r,e){return r.useProto3Json?e.toBase64():e.toUint8Array()}function Rc(r,e){return _i(r,e.toTimestamp())}function Je(r){return q(!!r,49232),te.fromTimestamp(Ih(r))}function yh(r,e){return pB(r,e).canonicalString()}function pB(r,e){const t=(function(s){return new ce(["projects",s.projectId,"databases",s.database])})(r).child("documents");return e===void 0?t:t.child(e)}function x_(r){const e=ce.fromString(r);return q(z_(e),10190,{key:e.toString()}),e}function Ei(r,e){return yh(r.databaseId,e.path)}function In(r,e){const t=x_(e);if(t.get(1)!==r.databaseId.projectId)throw new M(O.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+r.databaseId.projectId);if(t.get(3)!==r.databaseId.database)throw new M(O.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+r.databaseId.database);return new J(G_(t))}function V_(r,e){return yh(r.databaseId,e)}function M_(r){const e=x_(r);return e.length===4?ce.emptyPath():G_(e)}function gB(r){return new ce(["projects",r.databaseId.projectId,"databases",r.databaseId.database]).canonicalString()}function G_(r){return q(r.length>4&&r.get(4)==="documents",29091,{key:r.toString()}),r.popFirst(5)}function fp(r,e,t){return{name:Ei(r,e),fields:t.value.mapValue.fields}}function Au(r,e,t){const n=In(r,e.name),s=Je(e.updateTime),i=e.createTime?Je(e.createTime):te.min(),o=new tt({mapValue:{fields:e.fields}}),a=xe.newFoundDocument(n,s,i,o);return t&&a.setHasCommittedMutations(),t?a.setHasCommittedMutations():a}function RP(r,e){return"found"in e?(function(n,s){q(!!s.found,43571),s.found.name,s.found.updateTime;const i=In(n,s.found.name),o=Je(s.found.updateTime),a=s.found.createTime?Je(s.found.createTime):te.min(),c=new tt({mapValue:{fields:s.found.fields}});return xe.newFoundDocument(i,o,a,c)})(r,e):"missing"in e?(function(n,s){q(!!s.missing,3894),q(!!s.readTime,22933);const i=In(n,s.missing),o=Je(s.readTime);return xe.newNoDocument(i,o)})(r,e):Y(7234,{result:e})}function vP(r,e){let t;if("targetChange"in e){e.targetChange;const n=(function(l){return l==="NO_CHANGE"?0:l==="ADD"?1:l==="REMOVE"?2:l==="CURRENT"?3:l==="RESET"?4:Y(39313,{state:l})})(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=(function(l,B){return l.useProto3Json?(q(B===void 0||typeof B=="string",58123),Oe.fromBase64String(B||"")):(q(B===void 0||B instanceof Buffer||B instanceof Uint8Array,16193),Oe.fromUint8Array(B||new Uint8Array))})(r,e.targetChange.resumeToken),o=e.targetChange.cause,a=o&&(function(l){const B=l.code===void 0?O.UNKNOWN:P_(l.code);return new M(B,l.message||"")})(o);t=new k_(n,s,i,a||null)}else if("documentChange"in e){e.documentChange;const n=e.documentChange;n.document,n.document.name,n.document.updateTime;const s=In(r,n.document.name),i=Je(n.document.updateTime),o=n.document.createTime?Je(n.document.createTime):te.min(),a=new tt({mapValue:{fields:n.document.fields}}),c=xe.newFoundDocument(s,i,o,a),l=n.targetIds||[],B=n.removedTargetIds||[];t=new Ac(l,B,c.key,c)}else if("documentDelete"in e){e.documentDelete;const n=e.documentDelete;n.document;const s=In(r,n.document),i=n.readTime?Je(n.readTime):te.min(),o=xe.newNoDocument(s,i),a=n.removedTargetIds||[];t=new Ac([],a,o.key,o)}else if("documentRemove"in e){e.documentRemove;const n=e.documentRemove;n.document;const s=In(r,n.document),i=n.removedTargetIds||[];t=new Ac([],i,s,null)}else{if(!("filter"in e))return Y(11601,{ye:e});{e.filter;const n=e.filter;n.targetId;const{count:s=0,unchangedNames:i}=n,o=new CP(s,i),a=n.targetId;t=new F_(a,o)}}return t}function oa(r,e){let t;if(e instanceof Ui)t={update:fp(r,e.key,e.value)};else if(e instanceof Hi)t={delete:Ei(r,e.key)};else if(e instanceof Yn)t={update:fp(r,e.key,e.data),updateMask:FP(e.fieldMask)};else{if(!(e instanceof dh))return Y(16599,{we:e.type});t={verify:Ei(r,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map((n=>(function(i,o){const a=o.transform;if(a instanceof hi)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(a instanceof ms)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:a.elements}};if(a instanceof _s)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:a.elements}};if(a instanceof Es)return{fieldPath:o.field.canonicalString(),increment:a.l};if(a instanceof di)return{fieldPath:o.field.canonicalString(),minimum:a.l};if(a instanceof fi)return{fieldPath:o.field.canonicalString(),maximum:a.l};throw Y(20930,{transform:o.transform})})(0,n)))),e.precondition.isNone||(t.currentDocument=(function(s,i){return i.updateTime!==void 0?{updateTime:Rc(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:Y(27497)})(r,e.precondition)),t}function mB(r,e){const t=e.currentDocument?(function(i){return i.updateTime!==void 0?Ve.updateTime(Je(i.updateTime)):i.exists!==void 0?Ve.exists(i.exists):Ve.none()})(e.currentDocument):Ve.none(),n=e.updateTransforms?e.updateTransforms.map((s=>(function(o,a){let c=null;if("setToServerValue"in a)q(a.setToServerValue==="REQUEST_TIME",16630,{proto:a}),c=new hi;else if("appendMissingElements"in a){const B=a.appendMissingElements.values||[];c=new ms(B)}else if("removeAllFromArray"in a){const B=a.removeAllFromArray.values||[];c=new _s(B)}else"increment"in a?c=new Es(o,a.increment):"minimum"in a?c=new di(o,a.minimum):"maximum"in a?c=new fi(o,a.maximum):Y(16584,{proto:a});const l=je.fromServerFormat(a.fieldPath);return new Rs(l,c)})(r,s))):[];if(e.update){e.update.name;const s=In(r,e.update.name),i=new tt({mapValue:{fields:e.update.fields}});if(e.updateMask){const o=(function(c){const l=c.fieldPaths||[];return new kt(l.map((B=>je.fromServerFormat(B))))})(e.updateMask);return new Yn(s,i,o,t,n)}return new Ui(s,i,t,n)}if(e.delete){const s=In(r,e.delete);return new Hi(s,t)}if(e.verify){const s=In(r,e.verify);return new dh(s,t)}return Y(1463,{proto:e})}function PP(r,e){return r&&r.length>0?(q(e!==void 0,14353),r.map((t=>(function(s,i){let o=s.updateTime?Je(s.updateTime):Je(i);return o.isEqual(te.min())&&(o=Je(i)),new Yv(o,s.transformResults||[])})(t,e)))):[]}function U_(r,e){return{documents:[V_(r,e.path)]}}function Ru(r,e){const t={structuredQuery:{}},n=e.path;let s;e.collectionGroup!==null?(s=n,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=n.popLast(),t.structuredQuery.from=[{collectionId:n.lastSegment()}]),t.parent=V_(r,s);const i=(function(l){if(l.length!==0)return K_(Te.create(l,"and"))})(e.filters);i&&(t.structuredQuery.where=i);const o=(function(l){if(l.length!==0)return l.map((B=>(function(C){return{field:pr(C.field),direction:SP(C.dir)}})(B)))})(e.orderBy);o&&(t.structuredQuery.orderBy=o);const a=CB(r,e.limit);return a!==null&&(t.structuredQuery.limit=a),e.startAt&&(t.structuredQuery.startAt=(function(l){return{before:l.inclusive,values:l.position}})(e.startAt)),e.endAt&&(t.structuredQuery.endAt=(function(l){return{before:!l.inclusive,values:l.position}})(e.endAt)),{be:t,parent:s}}function H_(r,e,t,n){const{be:s,parent:i}=Ru(r,e),o={},a=[];let c=0;return t.forEach((l=>{const B=n?l.alias:"aggregate_"+c++;o[B]=l.alias,l.aggregateType==="count"?a.push({alias:B,count:{}}):l.aggregateType==="avg"?a.push({alias:B,avg:{field:pr(l.fieldPath)}}):l.aggregateType==="sum"&&a.push({alias:B,sum:{field:pr(l.fieldPath)}})})),{request:{structuredAggregationQuery:{aggregations:a,structuredQuery:s.structuredQuery},parent:s.parent},Se:o,parent:i}}function q_(r){let e=M_(r.parent);const t=r.structuredQuery,n=t.from?t.from.length:0;let s=null;if(n>0){q(n===1,65062);const B=t.from[0];B.allDescendants?s=B.collectionId:e=e.child(B.collectionId)}let i=[];t.where&&(i=(function(d){const C=J_(d);return C instanceof Te&&fh(C)?C.getFilters():[C]})(t.where));let o=[];t.orderBy&&(o=(function(d){return d.map((C=>(function(I){return new ia($s(I.field),(function(F){switch(F){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(I.direction))})(C)))})(t.orderBy));let a=null;t.limit&&(a=(function(d){let C;return C=typeof d=="object"?d.value:d,Ta(C)?null:C})(t.limit));let c=null;t.startAt&&(c=(function(d){const C=!!d.before,g=d.values||[];return new Or(g,C)})(t.startAt));let l=null;return t.endAt&&(l=(function(d){const C=!d.before,g=d.values||[];return new Or(g,C)})(t.endAt)),D_(e,s,o,i,a,"F",c,l)}function bP(r,e){const t=(function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return Y(28987,{purpose:s})}})(e.purpose);return t==null?null:{"goog-listen-tags":t}}function j_(r,e){return{structuredPipeline:{pipeline:{stages:e.stages.map((t=>t._toProto(r)))}}}}function J_(r){return r.unaryFilter!==void 0?(function(t){switch(t.unaryFilter.op){case"IS_NAN":const n=$s(t.unaryFilter.field);return pe.create(n,"==",{doubleValue:NaN});case"IS_NULL":const s=$s(t.unaryFilter.field);return pe.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=$s(t.unaryFilter.field);return pe.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=$s(t.unaryFilter.field);return pe.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return Y(61313);default:return Y(60726)}})(r):r.fieldFilter!==void 0?(function(t){return pe.create($s(t.fieldFilter.field),(function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return Y(58110);default:return Y(50506)}})(t.fieldFilter.op),t.fieldFilter.value)})(r):r.compositeFilter!==void 0?(function(t){return Te.create(t.compositeFilter.filters.map((n=>J_(n))),(function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return Y(1026)}})(t.compositeFilter.op))})(r):Y(30097,{filter:r})}function SP(r){return wP[r]}function NP(r){return DP[r]}function OP(r){return TP[r]}function pr(r){return{fieldPath:r.canonicalString()}}function $s(r){return je.fromServerFormat(r.fieldPath)}function K_(r){return r instanceof pe?(function(t){if(t.op==="=="){if(Gt(t.value))return{unaryFilter:{field:pr(t.field),op:"IS_NAN"}};if(Jt(t.value))return{unaryFilter:{field:pr(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(Gt(t.value))return{unaryFilter:{field:pr(t.field),op:"IS_NOT_NAN"}};if(Jt(t.value))return{unaryFilter:{field:pr(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:pr(t.field),op:NP(t.op),value:t.value}}})(r):r instanceof Te?(function(t){const n=t.getFilters().map((s=>K_(s)));return n.length===1?n[0]:{compositeFilter:{op:OP(t.op),filters:n}}})(r):Y(54877,{filter:r})}function FP(r){const e=[];return r.fields.forEach((t=>e.push(t.canonicalString()))),{fieldPaths:e}}function z_(r){return r.length>=4&&r.get(0)==="projects"&&r.get(2)==="databases"}function W_(r){return!!r&&typeof r._toProto=="function"&&r._protoValueType==="ProtoValue"}function aa(r,e){const t={fields:{}};return e.forEach(((n,s)=>{if(typeof s!="string")throw new Error(`Cannot encode map with non-string key: ${s}`);t.fields[s]=n._toProto(r)})),{mapValue:t}}function Q_(r){return{stringValue:r}}/**
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
 */function vs(r){return new AP(r,!0)}/**
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
 */class Ot{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Ot(Oe.fromBase64String(e))}catch(t){throw new M(O.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Ot(Oe.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:Ot._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(As(e,Ot._jsonSchema))return Ot.fromBase64String(e.bytes)}}Ot._jsonSchemaVersion="firestore/bytes/1.0",Ot._jsonSchema={type:Ye("string",Ot._jsonSchemaVersion),bytes:Ye("string")};/**
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
 */class Ps{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new M(O.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new je(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}function $_(){return new Ps(fn)}/**
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
 */class vn{constructor(e){this._methodName=e}}/**
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
 */class on{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new M(O.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new M(O.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return ie(this._lat,e._lat)||ie(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:on._jsonSchemaVersion}}static fromJSON(e){if(As(e,on._jsonSchema))return new on(e.latitude,e.longitude)}}on._jsonSchemaVersion="firestore/geoPoint/1.0",on._jsonSchema={type:Ye("string",on._jsonSchemaVersion),latitude:Ye("number"),longitude:Ye("number")};/**
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
 */class Bt{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Bt.UNAUTHENTICATED=new Bt(null),Bt.GOOGLE_CREDENTIALS=new Bt("google-credentials-uid"),Bt.FIRST_PARTY=new Bt("first-party-uid"),Bt.MOCK_USER=new Bt("mock-user");/**
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
 */class dt{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
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
 */class Y_{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class X_{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(Bt.UNAUTHENTICATED)))}shutdown(){}}class kP{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class LP{constructor(e){this.ve=e,this.currentUser=Bt.UNAUTHENTICATED,this.De=0,this.forceRefresh=!1,this.auth=null}start(e,t){q(this.xe===void 0,42304);let n=this.De;const s=c=>this.De!==n?(n=this.De,t(c)):Promise.resolve();let i=new dt;this.xe=()=>{this.De++,this.currentUser=this.Ce(),i.resolve(),i=new dt,e.enqueueRetryable((()=>s(this.currentUser)))};const o=()=>{const c=i;e.enqueueRetryable((async()=>{await c.promise,await s(this.currentUser)}))},a=c=>{U("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=c,this.xe&&(this.auth.addAuthTokenListener(this.xe),o())};this.ve.onInit((c=>a(c))),setTimeout((()=>{if(!this.auth){const c=this.ve.getImmediate({optional:!0});c?a(c):(U("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new dt)}}),0),o()}getToken(){const e=this.De,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((n=>this.De!==e?(U("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):n?(q(typeof n.accessToken=="string",31837,{Fe:n}),new Y_(n.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.xe&&this.auth.removeAuthTokenListener(this.xe),this.xe=void 0}Ce(){const e=this.auth&&this.auth.getUid();return q(e===null||typeof e=="string",2055,{Oe:e}),new Bt(e)}}class xP{constructor(e,t,n){this.Me=e,this.Ne=t,this.Le=n,this.type="FirstParty",this.user=Bt.FIRST_PARTY,this.Be=new Map}Ue(){return this.Le?this.Le():null}get headers(){this.Be.set("X-Goog-AuthUser",this.Me);const e=this.Ue();return e&&this.Be.set("Authorization",e),this.Ne&&this.Be.set("X-Goog-Iam-Authorization-Token",this.Ne),this.Be}}class VP{constructor(e,t,n){this.Me=e,this.Ne=t,this.Le=n}getToken(){return Promise.resolve(new xP(this.Me,this.Ne,this.Le))}start(e,t){e.enqueueRetryable((()=>t(Bt.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class _B{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class MP{constructor(e,t){this.ke=t,this.forceRefresh=!1,this.appCheck=null,this.qe=null,this.$e=null,Qe(e)&&e.settings.appCheckToken&&(this.$e=e.settings.appCheckToken)}start(e,t){q(this.xe===void 0,3512);const n=i=>{i.error!=null&&U("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.qe;return this.qe=i.token,U("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(i.token):Promise.resolve()};this.xe=i=>{e.enqueueRetryable((()=>n(i)))};const s=i=>{U("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.xe&&this.appCheck.addTokenListener(this.xe)};this.ke.onInit((i=>s(i))),setTimeout((()=>{if(!this.appCheck){const i=this.ke.getImmediate({optional:!0});i?s(i):U("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.$e)return Promise.resolve(new _B(this.$e));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(q(typeof t.token=="string",44558,{tokenResult:t}),this.qe=t.token,new _B(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.xe&&this.appCheck.removeTokenListener(this.xe),this.xe=void 0}}class GP{getToken(){return Promise.resolve(new _B(""))}invalidateToken(){}start(e,t){}shutdown(){}}function Z_(r){const e={};return r.timeoutSeconds!==void 0&&(e.timeoutSeconds=r.timeoutSeconds),e}/**
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
 */class UP{Ke(e){}shutdown(){}}/**
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
 */const Cp="ConnectivityMonitor";class pp{constructor(){this.Qe=()=>this.We(),this.Ge=()=>this.ze(),this.je=[],this.He()}Ke(e){this.je.push(e)}shutdown(){window.removeEventListener("online",this.Qe),window.removeEventListener("offline",this.Ge)}He(){window.addEventListener("online",this.Qe),window.addEventListener("offline",this.Ge)}We(){U(Cp,"Network connectivity changed: AVAILABLE");for(const e of this.je)e(0)}ze(){U(Cp,"Network connectivity changed: UNAVAILABLE");for(const e of this.je)e(1)}static Je(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let hc=null;function EB(){return hc===null?hc=(function(){return 268435456+Math.round(2147483648*Math.random())})():hc++,"0x"+hc.toString(16)}/**
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
 */const xl="RestConnection",HP={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class qP{get Ye(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",n=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Ze=t+"://"+e.host,this.Xe=`projects/${n}/databases/${s}`,this.et=this.databaseId.database===ra?`project_id=${n}`:`project_id=${n}&database_id=${s}`}tt(e,t,n,s,i){const o=EB(),a=this.nt(e,t.toUriEncodedString());U(xl,`Sending RPC '${e}' ${o}:`,a,n);const c={"google-cloud-resource-prefix":this.Xe,"x-goog-request-params":this.et};this.rt(c,s,i);const{host:l}=new URL(a),B=ki(l);return this.it(e,a,c,n,B).then((d=>(U(xl,`Received RPC '${e}' ${o}: `,d),d)),(d=>{throw st(xl,`RPC '${e}' ${o} failed with error: `,d,"url: ",a,"request:",n),d}))}st(e,t,n,s,i,o){return this.tt(e,t,n,s,i)}rt(e,t,n){if(e["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+Mi})(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach(((s,i)=>e[i]=s)),n&&n.headers.forEach(((s,i)=>e[i]=s)),this.databaseInfo._customHeaders)for(const s of Object.keys(this.databaseInfo._customHeaders))e[s]=this.databaseInfo._customHeaders[s]}nt(e,t){const n=HP[e];let s=`${this.Ze}/v1/${t}:${n}`;return this.databaseInfo.apiKey&&(s=`${s}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),s}terminate(){}}/**
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
 */class jP{constructor(e){this._t=e._t,this.ot=e.ot}ut(e){this.ct=e}lt(e){this.Et=e}ht(e){this.Tt=e}onMessage(e){this.Pt=e}close(){this.ot()}send(e){this._t(e)}Rt(){this.ct()}It(){this.Et()}At(e){this.Tt(e)}Vt(e){this.Pt(e)}}/**
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
 */const mt="WebChannelConnection",Eo=(r,e,t)=>{r.listen(e,(n=>{try{t(n)}catch(s){setTimeout((()=>{throw s}),0)}}))};class ii extends qP{constructor(e){super(e),this.dt=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static ft(){if(!ii.gt){const e=Mm();Eo(e,Vm.STAT_EVENT,(t=>{t.stat===rB.PROXY?U(mt,"STAT_EVENT: detected buffering proxy"):t.stat===rB.NOPROXY&&U(mt,"STAT_EVENT: detected no buffering proxy")})),ii.gt=!0}}it(e,t,n,s,i){const o=EB();return new Promise(((a,c)=>{const l=new Lm;l.setWithCredentials(!0),l.listenOnce(xm.COMPLETE,(()=>{try{switch(l.getLastErrorCode()){case wc.NO_ERROR:const d=l.getResponseJson();U(mt,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(d)),a(d);break;case wc.TIMEOUT:U(mt,`RPC '${e}' ${o} timed out`),c(new M(O.DEADLINE_EXCEEDED,"Request time out"));break;case wc.HTTP_ERROR:const C=l.getStatus();if(U(mt,`RPC '${e}' ${o} failed with status:`,C,"response text:",l.getResponseText()),C>0){let g=l.getResponseJson();Array.isArray(g)&&(g=g[0]);const I=g==null?void 0:g.error;if(I&&I.status&&I.message){const P=(function(H){const Z=H.toLowerCase().replace(/_/g,"-");return Object.values(O).indexOf(Z)>=0?Z:O.UNKNOWN})(I.status);c(new M(P,I.message))}else c(new M(O.UNKNOWN,"Server responded with status "+l.getStatus()))}else c(new M(O.UNAVAILABLE,"Connection failed."));break;default:Y(9055,{yt:e,streamId:o,wt:l.getLastErrorCode(),bt:l.getLastError()})}}finally{U(mt,`RPC '${e}' ${o} completed.`)}}));const B=JSON.stringify(s);U(mt,`RPC '${e}' ${o} sending request:`,s),l.send(t,"POST",B,n,15)}))}St(e,t,n){const s=EB(),i=[this.Ze,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=this.createWebChannelTransport(),a={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},c=this.longPollingOptions.timeoutSeconds;c!==void 0&&(a.longPollingTimeout=Math.round(1e3*c)),this.useFetchStreams&&(a.useFetchStreams=!0),this.rt(a.initMessageHeaders,t,n),a.encodeInitMessageHeaders=!0;const l=i.join("");U(mt,`Creating RPC '${e}' stream ${s}: ${l}`,a);const B=o.createWebChannel(l,a);this.vt(B);let d=!1,C=!1;const g=new jP({_t:I=>{C?U(mt,`Not sending because RPC '${e}' stream ${s} is closed:`,I):(d||(U(mt,`Opening RPC '${e}' stream ${s} transport.`),B.open(),d=!0),U(mt,`RPC '${e}' stream ${s} sending:`,I),B.send(I))},ot:()=>B.close()});return Eo(B,vo.EventType.OPEN,(()=>{C||(U(mt,`RPC '${e}' stream ${s} transport opened.`),g.Rt())})),Eo(B,vo.EventType.CLOSE,(()=>{C||(C=!0,U(mt,`RPC '${e}' stream ${s} transport closed`),g.At(),this.Dt(B))})),Eo(B,vo.EventType.ERROR,(I=>{C||(C=!0,st(mt,`RPC '${e}' stream ${s} transport errored. Name:`,I.name,"Message:",I.message),g.At(new M(O.UNAVAILABLE,"The operation could not be completed")))})),Eo(B,vo.EventType.MESSAGE,(I=>{var P;if(!C){const F=I.data[0];q(!!F,16349);const H=F,Z=(H==null?void 0:H.error)||((P=H[0])==null?void 0:P.error);if(Z){U(mt,`RPC '${e}' stream ${s} received error:`,Z);const ee=Z.status;let Be=(function(D){const m=Ke[D];if(m!==void 0)return P_(m)})(ee),he=Z.message;ee==="NOT_FOUND"&&he.includes("database")&&he.includes("does not exist")&&he.includes(this.databaseId.database)&&st(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),Be===void 0&&(Be=O.INTERNAL,he="Unknown error status: "+ee+" with message "+Z.message),C=!0,g.At(new M(Be,he)),B.close()}else U(mt,`RPC '${e}' stream ${s} received:`,F),g.Vt(F)}})),ii.ft(),setTimeout((()=>{g.It()}),0),g}terminate(){this.dt.forEach((e=>e.close())),this.dt=[]}vt(e){this.dt.push(e)}Dt(e){this.dt=this.dt.filter((t=>t===e))}rt(e,t,n){super.rt(e,t,n),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return Gm()}}/**
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
 */function JP(r){return new ii(r)}ii.gt=!1;class wh{constructor(e,t,n=1e3,s=1.5,i=6e4){this.xt=e,this.timerId=t,this.Ct=n,this.Ft=s,this.Ot=i,this.Mt=0,this.Nt=null,this.Lt=Date.now(),this.reset()}reset(){this.Mt=0}Bt(){this.Mt=this.Ot}Ut(e){this.cancel();const t=Math.floor(this.Mt+this.kt()),n=Math.max(0,Date.now()-this.Lt),s=Math.max(0,t-n);s>0&&U("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Mt} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`),this.Nt=this.xt.enqueueAfterDelay(this.timerId,s,(()=>(this.Lt=Date.now(),e()))),this.Mt*=this.Ft,this.Mt<this.Ct&&(this.Mt=this.Ct),this.Mt>this.Ot&&(this.Mt=this.Ot)}qt(){this.Nt!==null&&(this.Nt.skipDelay(),this.Nt=null)}cancel(){this.Nt!==null&&(this.Nt.cancel(),this.Nt=null)}kt(){return(Math.random()-.5)*this.Mt}}/**
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
 */const gp="PersistentStream";class eE{constructor(e,t,n,s,i,o,a,c){this.xt=e,this.$t=n,this.Kt=s,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=a,this.listener=c,this.state=0,this.Qt=0,this.Wt=null,this.Gt=null,this.stream=null,this.zt=0,this.jt=new wh(e,t)}Ht(){return this.state===1||this.state===5||this.Jt()}Jt(){return this.state===2||this.state===3}start(){this.zt=0,this.state!==4?this.auth():this.Yt()}async stop(){this.Ht()&&await this.close(0)}Zt(){this.state=0,this.jt.reset()}Xt(){this.Jt()&&this.Wt===null&&(this.Wt=this.xt.enqueueAfterDelay(this.$t,6e4,(()=>this.en())))}tn(e){this.nn(),this.stream.send(e)}async en(){if(this.Jt())return this.close(0)}nn(){this.Wt&&(this.Wt.cancel(),this.Wt=null)}rn(){this.Gt&&(this.Gt.cancel(),this.Gt=null)}async close(e,t){this.nn(),this.rn(),this.jt.cancel(),this.Qt++,e!==4?this.jt.reset():t&&t.code===O.RESOURCE_EXHAUSTED?(qe(t.toString()),qe("Using maximum backoff delay to prevent overloading the backend."),this.jt.Bt()):t&&t.code===O.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.sn(),this.stream.close(),this.stream=null),this.state=e,await this.listener.ht(t)}sn(){}auth(){this.state=1;const e=this._n(this.Qt),t=this.Qt;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([n,s])=>{this.Qt===t&&this.an(n,s)}),(n=>{e((()=>{const s=new M(O.UNKNOWN,"Fetching auth token failed: "+n.message);return this.un(s)}))}))}an(e,t){const n=this._n(this.Qt);this.stream=this.cn(e,t),this.stream.ut((()=>{n((()=>this.listener.ut()))})),this.stream.lt((()=>{n((()=>(this.state=2,this.Gt=this.xt.enqueueAfterDelay(this.Kt,1e4,(()=>(this.Jt()&&(this.state=3),Promise.resolve()))),this.listener.lt())))})),this.stream.ht((s=>{n((()=>this.un(s)))})),this.stream.onMessage((s=>{n((()=>++this.zt==1?this.En(s):this.onNext(s)))}))}Yt(){this.state=5,this.jt.Ut((async()=>{this.state=0,this.start()}))}un(e){return U(gp,`close with error: ${e}`),this.stream=null,this.close(4,e)}_n(e){return t=>{this.xt.enqueueAndForget((()=>this.Qt===e?t():(U(gp,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class KP extends eE{constructor(e,t,n,s,i,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,n,s,o),this.serializer=i}cn(e,t){return this.connection.St("Listen",e,t)}En(e){return this.onNext(e)}onNext(e){this.jt.reset();const t=vP(this.serializer,e),n=(function(i){if(!("targetChange"in i))return te.min();const o=i.targetChange;return o.targetIds&&o.targetIds.length?te.min():o.readTime?Je(o.readTime):te.min()})(e);return this.listener.hn(t,n)}Tn(e){const t={};t.database=gB(this.serializer),t.addTarget=(function(i,o){let a;const c=o.target;if(a=Sn(c)?{pipelineQuery:j_(i,c)}:gh(c)?{documents:U_(i,c)}:{query:Ru(i,c).be},a.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){a.resumeToken=L_(i,o.resumeToken);const l=CB(i,o.expectedCount);l!==null&&(a.expectedCount=l)}else if(o.snapshotVersion.compareTo(te.min())>0){a.readTime=_i(i,o.snapshotVersion.toTimestamp());const l=CB(i,o.expectedCount);l!==null&&(a.expectedCount=l)}return a})(this.serializer,e);const n=bP(this.serializer,e);n&&(t.labels=n),this.tn(t)}Pn(e){const t={};t.database=gB(this.serializer),t.removeTarget=e,this.tn(t)}}class zP extends eE{constructor(e,t,n,s,i,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,n,s,o),this.serializer=i}get Rn(){return this.zt>0}start(){this.lastStreamToken=void 0,super.start()}sn(){this.Rn&&this.In([])}cn(e,t){return this.connection.St("Write",e,t)}En(e){return q(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,q(!e.writeResults||e.writeResults.length===0,55816),this.listener.An()}onNext(e){q(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.jt.reset();const t=PP(e.writeResults,e.commitTime),n=Je(e.commitTime);return this.listener.Vn(n,t)}dn(){const e={};e.database=gB(this.serializer),this.tn(e)}In(e){const t={streamToken:this.lastStreamToken,writes:e.map((n=>oa(this.serializer,n)))};this.tn(t)}}/**
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
 */class WP{}class QP extends WP{constructor(e,t,n,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=n,this.serializer=s,this.fn=!1}mn(){if(this.fn)throw new M(O.FAILED_PRECONDITION,"The client has already been terminated.")}tt(e,t,n,s){return this.mn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([i,o])=>this.connection.tt(e,pB(t,n),s,i,o))).catch((i=>{throw i.name==="FirebaseError"?(i.code===O.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new M(O.UNKNOWN,i.toString())}))}st(e,t,n,s,i){return this.mn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([o,a])=>this.connection.st(e,pB(t,n),s,o,a,i))).catch((o=>{throw o.name==="FirebaseError"?(o.code===O.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new M(O.UNKNOWN,o.toString())}))}terminate(){this.fn=!0,this.connection.terminate()}}function $P(r,e,t,n){return new QP(r,e,t,n)}/**
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
 */const YP="ComponentProvider",mp=new Map;function XP(r,e,t,n,s){return new qv(r,e,t,s.host,s.ssl,s.experimentalForceLongPolling,s.experimentalAutoDetectLongPolling,Z_(s.experimentalLongPollingOptions),s.useFetchStreams,s.isUsingEmulator,n,s._customHeaders,s.grpcFlowControlWindow)}/**
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
 */const _p={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},tE=41943040;class _t{static withCacheSize(e){return new _t(e,_t.DEFAULT_COLLECTION_PERCENTILE,_t.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,n){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=n}}_t.DEFAULT_COLLECTION_PERCENTILE=10,_t.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,_t.DEFAULT=new _t(tE,_t.DEFAULT_COLLECTION_PERCENTILE,_t.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),_t.DISABLED=new _t(-1,0,0);/**
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
 */class Lt{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=n=>this.pn(n),this.gn=n=>t.writeSequenceNumber(n))}pn(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.gn&&this.gn(e),e}}Lt.yn=-1;/**
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
 */const nE="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class rE{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((e=>e()))}}/**
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
 */async function Ur(r){if(r.code!==O.FAILED_PRECONDITION||r.message!==nE)throw r;U("LocalStore","Unexpectedly lost primary lease")}/**
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
 */class b{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e((t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)}),(t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)}))}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&Y(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new b(((n,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(n,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(n,s)}}))}toPromise(){return new Promise(((e,t)=>{this.next(e,t)}))}wrapUserFunction(e){try{const t=e();return t instanceof b?t:b.resolve(t)}catch(t){return b.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction((()=>e(t))):b.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction((()=>e(t))):b.reject(t)}static resolve(e){return new b(((t,n)=>{t(e)}))}static reject(e){return new b(((t,n)=>{n(e)}))}static waitFor(e){return new b(((t,n)=>{let s=0,i=0,o=!1;e.forEach((a=>{++s,a.next((()=>{++i,o&&i===s&&t()}),(c=>n(c)))})),o=!0,i===s&&t()}))}static or(e){let t=b.resolve(!1);for(const n of e)t=t.next((s=>s?b.resolve(s):n()));return t}static forEach(e,t){const n=[];return e.forEach(((s,i)=>{n.push(t.call(this,s,i))})),this.waitFor(n)}static mapArray(e,t){return new b(((n,s)=>{const i=e.length,o=new Array(i);let a=0;for(let c=0;c<i;c++){const l=c;t(e[l]).next((B=>{o[l]=B,++a,a===i&&n(o)}),(B=>s(B)))}}))}static doWhile(e,t){return new b(((n,s)=>{const i=()=>{e()===!0?t().next((()=>{i()}),s):n()};i()}))}}/**
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
 */const jt="SimpleDb";class vu{static open(e,t,n,s){try{return new vu(t,e.transaction(s,n))}catch(i){throw new Ho(t,i)}}constructor(e,t){this.action=e,this.transaction=t,this.aborted=!1,this.wn=new dt,this.transaction.oncomplete=()=>{this.wn.resolve()},this.transaction.onabort=()=>{t.error?this.wn.reject(new Ho(e,t.error)):this.wn.resolve()},this.transaction.onerror=n=>{const s=Dh(n.target.error);this.wn.reject(new Ho(e,s))}}get bn(){return this.wn.promise}abort(e){e&&this.wn.reject(e),this.aborted||(U(jt,"Aborting transaction:",e?e.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}Sn(){const e=this.transaction;this.aborted||typeof e.commit!="function"||e.commit()}store(e){const t=this.transaction.objectStore(e);return new eb(t)}}class yn{static delete(e){return U(jt,"Removing database:",e),ns(MB().indexedDB.deleteDatabase(e)).toPromise()}static Je(){if(!au())return!1;if(yn.vn())return!0;const e=rt(),t=yn.Dn(e),n=0<t&&t<10,s=sE(e),i=0<s&&s<4.5;return!(e.indexOf("MSIE ")>0||e.indexOf("Trident/")>0||e.indexOf("Edge/")>0||n||i)}static vn(){var e;return typeof process<"u"&&((e=process.__PRIVATE_env)==null?void 0:e.__PRIVATE_USE_MOCK_PERSISTENCE)==="YES"}static xn(e,t){return e.store(t)}static Dn(e){const t=e.match(/i(?:phone|pad|pod) os ([\d_]+)/i),n=t?t[1].split("_").slice(0,2).join("."):"-1";return Number(n)}constructor(e,t,n){this.name=e,this.version=t,this.Cn=n,this.Fn=null,yn.Dn(rt())===12.2&&qe("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}async On(e){return this.db||(U(jt,"Opening database:",this.name),this.db=await new Promise(((t,n)=>{const s=indexedDB.open(this.name,this.version);s.onsuccess=i=>{const o=i.target.result;t(o)},s.onblocked=()=>{n(new Ho(e,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},s.onerror=i=>{const o=i.target.error;o.name==="VersionError"?n(new M(O.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):o.name==="InvalidStateError"?n(new M(O.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+o)):n(new Ho(e,o))},s.onupgradeneeded=i=>{U(jt,'Database "'+this.name+'" requires upgrade from version:',i.oldVersion);const o=i.target.result;this.Cn.Mn(o,s.transaction,i.oldVersion,this.version).next((()=>{U(jt,"Database upgrade to version "+this.version+" complete")}))}}))),this.Nn&&(this.db.onversionchange=t=>this.Nn(t)),this.db}Ln(e){this.Nn=e,this.db&&(this.db.onversionchange=t=>e(t))}async runTransaction(e,t,n,s){const i=t==="readonly";let o=0;for(;;){++o;try{this.db=await this.On(e);const a=vu.open(this.db,e,i?"readonly":"readwrite",n),c=s(a).next((l=>(a.Sn(),l))).catch((l=>(a.abort(l),b.reject(l)))).toPromise();return c.catch((()=>{})),await a.bn,c}catch(a){const c=a,l=c.name!=="FirebaseError"&&o<3;if(U(jt,"Transaction failed with error:",c.message,"Retrying:",l),this.close(),!l)return Promise.reject(c)}}}close(){this.db&&this.db.close(),this.db=void 0}}function sE(r){const e=r.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}class ZP{constructor(e){this.Bn=e,this.Un=!1,this.kn=null}get isDone(){return this.Un}get qn(){return this.kn}set cursor(e){this.Bn=e}done(){this.Un=!0}$n(e){this.kn=e}delete(){return ns(this.Bn.delete())}}class Ho extends M{constructor(e,t){super(O.UNAVAILABLE,`IndexedDB transaction '${e}' failed: ${t}`),this.name="IndexedDbTransactionError"}}function Hr(r){return r.name==="IndexedDbTransactionError"}class eb{constructor(e){this.store=e}put(e,t){let n;return t!==void 0?(U(jt,"PUT",this.store.name,e,t),n=this.store.put(t,e)):(U(jt,"PUT",this.store.name,"<auto-key>",e),n=this.store.put(e)),ns(n)}add(e){return U(jt,"ADD",this.store.name,e,e),ns(this.store.add(e))}get(e){return ns(this.store.get(e)).next((t=>(t===void 0&&(t=null),U(jt,"GET",this.store.name,e,t),t)))}delete(e){return U(jt,"DELETE",this.store.name,e),ns(this.store.delete(e))}count(){return U(jt,"COUNT",this.store.name),ns(this.store.count())}Kn(e,t){const n=this.options(e,t),s=n.index?this.store.index(n.index):this.store;if(typeof s.getAll=="function"){const i=s.getAll(n.range);return new b(((o,a)=>{i.onerror=c=>{a(c.target.error)},i.onsuccess=c=>{o(c.target.result)}}))}{const i=this.cursor(n),o=[];return this.Qn(i,((a,c)=>{o.push(c)})).next((()=>o))}}Wn(e,t){const n=this.store.getAll(e,t===null?void 0:t);return new b(((s,i)=>{n.onerror=o=>{i(o.target.error)},n.onsuccess=o=>{s(o.target.result)}}))}Gn(e,t){U(jt,"DELETE ALL",this.store.name);const n=this.options(e,t);n.zn=!1;const s=this.cursor(n);return this.Qn(s,((i,o,a)=>a.delete()))}jn(e,t){let n;t?n=e:(n={},t=e);const s=this.cursor(n);return this.Qn(s,t)}Hn(e){const t=this.cursor({});return new b(((n,s)=>{t.onerror=i=>{const o=Dh(i.target.error);s(o)},t.onsuccess=i=>{const o=i.target.result;o?e(o.primaryKey,o.value).next((a=>{a?o.continue():n()})):n()}}))}Qn(e,t){const n=[];return new b(((s,i)=>{e.onerror=o=>{i(o.target.error)},e.onsuccess=o=>{const a=o.target.result;if(!a)return void s();const c=new ZP(a),l=t(a.primaryKey,a.value,c);if(l instanceof b){const B=l.catch((d=>(c.done(),b.reject(d))));n.push(B)}c.isDone?s():c.qn===null?a.continue():a.continue(c.qn)}})).next((()=>b.waitFor(n)))}options(e,t){let n;return e!==void 0&&(typeof e=="string"?n=e:t=e),{index:n,range:t}}cursor(e){let t="next";if(e.reverse&&(t="prev"),e.index){const n=this.store.index(e.index);return e.zn?n.openKeyCursor(e.range,t):n.openCursor(e.range,t)}return this.store.openCursor(e.range,t)}}function ns(r){return new b(((e,t)=>{r.onsuccess=n=>{const s=n.target.result;e(s)},r.onerror=n=>{const s=Dh(n.target.error);t(s)}}))}let Ep=!1;function Dh(r){const e=yn.Dn(rt());if(e>=12.2&&e<13){const t="An internal error was encountered in the Indexed Database server";if(r.message.indexOf(t)>=0){const n=new M("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${t}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return Ep||(Ep=!0,setTimeout((()=>{throw n}),0)),n}}return r}/**
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
 */const Ip="LruGarbageCollector",iE=1048576;function yp([r,e],[t,n]){const s=ie(r,t);return s===0?ie(e,n):s}class tb{constructor(e){this.Jn=e,this.buffer=new De(yp),this.Yn=0}Zn(){return++this.Yn}Xn(e){const t=[e,this.Zn()];if(this.buffer.size<this.Jn)this.buffer=this.buffer.add(t);else{const n=this.buffer.last();yp(t,n)<0&&(this.buffer=this.buffer.delete(n).add(t))}}get maxValue(){return this.buffer.last()[0]}}class oE{constructor(e,t,n){this.garbageCollector=e,this.asyncQueue=t,this.localStore=n,this.er=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.tr(6e4)}stop(){this.er&&(this.er.cancel(),this.er=null)}get started(){return this.er!==null}tr(e){U(Ip,`Garbage collection scheduled in ${e}ms`),this.er=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,(async()=>{this.er=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){Hr(t)?U(Ip,"Ignoring IndexedDB error during garbage collection: ",t):await Ur(t)}await this.tr(3e5)}))}}class nb{constructor(e,t){this.nr=e,this.params=t}calculateTargetCount(e,t){return this.nr.rr(e).next((n=>Math.floor(t/100*n)))}nthSequenceNumber(e,t){if(t===0)return b.resolve(Lt.yn);const n=new tb(t);return this.nr.forEachTarget(e,(s=>n.Xn(s.sequenceNumber))).next((()=>this.nr.ir(e,(s=>n.Xn(s))))).next((()=>n.maxValue))}removeTargets(e,t,n){return this.nr.removeTargets(e,t,n)}removeOrphanedDocuments(e,t){return this.nr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(U("LruGarbageCollector","Garbage collection skipped; disabled"),b.resolve(_p)):this.getCacheSize(e).next((n=>n<this.params.cacheSizeCollectionThreshold?(U("LruGarbageCollector",`Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),_p):this.sr(e,t)))}getCacheSize(e){return this.nr.getCacheSize(e)}sr(e,t){let n,s,i,o,a,c,l;const B=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next((d=>(d>this.params.maximumSequenceNumbersToCollect?(U("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${d}`),s=this.params.maximumSequenceNumbersToCollect):s=d,o=Date.now(),this.nthSequenceNumber(e,s)))).next((d=>(n=d,a=Date.now(),this.removeTargets(e,n,t)))).next((d=>(i=d,c=Date.now(),this.removeOrphanedDocuments(e,n)))).next((d=>(l=Date.now(),Ws()<=Ce.DEBUG&&U("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-B}ms
	Determined least recently used ${s} in `+(a-o)+`ms
	Removed ${i} targets in `+(c-a)+`ms
	Removed ${d} documents in `+(l-c)+`ms
Total Duration: ${l-B}ms`),b.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:d}))))}}function aE(r,e){return new nb(r,e)}/**
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
 */const cE="firestore.googleapis.com",wp=!0;class Dp{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new M(O.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=cE,this.ssl=wp}else this.host=e.host,this.ssl=e.ssl??wp;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e._customHeaders&&(this._customHeaders={...e._customHeaders}),e.cacheSizeBytes===void 0)this.cacheSizeBytes=tE;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<iE)throw new M(O.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}if(Ym("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Z_(e.experimentalLongPollingOptions??{}),(function(n){if(n.timeoutSeconds!==void 0){if(isNaN(n.timeoutSeconds))throw new M(O.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (must not be NaN)`);if(n.timeoutSeconds<5)throw new M(O.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (minimum allowed value is 5)`);if(n.timeoutSeconds>30)throw new M(O.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams,e.grpcFlowControlWindow!==void 0){if(typeof e.grpcFlowControlWindow!="number"||e.grpcFlowControlWindow<=0||e.grpcFlowControlWindow>2147483647||!Number.isInteger(e.grpcFlowControlWindow))throw new M(O.INVALID_ARGUMENT,"grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");this.grpcFlowControlWindow=e.grpcFlowControlWindow}}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(n,s){return n.timeoutSeconds===s.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams&&this.grpcFlowControlWindow===e.grpcFlowControlWindow&&(function(n,s){if(n===s)return!0;if(!n||!s)return!1;const i=Object.keys(n),o=Object.keys(s);if(i.length!==o.length)return!1;for(const a of i)if(n[a]!==s[a])return!1;return!0})(this._customHeaders,e._customHeaders)}}let Ra=class{constructor(e,t,n,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=n,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Dp({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new M(O.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new M(O.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Dp(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(n){if(!n)return new X_;switch(n.type){case"firstParty":return new VP(n.sessionIndex||"0",n.iamToken||null,n.authTokenFactory||null);case"provider":return n.client;default:throw new M(O.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const n=mp.get(t);n&&(U(YP,"Removing Datastore"),mp.delete(t),n.terminate())})(this),Promise.resolve()}};function uE(r,e,t,n={}){var l;r=de(r,Ra);const s=ki(e),i=r._getSettings(),o={...i,emulatorOptions:r._getEmulatorOptions()},a=`${e}:${t}`;s&&GB(`https://${a}`),i.host!==cE&&i.host!==a&&st("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const c={...i,host:a,ssl:s,emulatorOptions:n};if(!cn(c,o)&&(r._setSettings(c),n.mockUserToken)){let B,d;if(typeof n.mockUserToken=="string")B=n.mockUserToken,d=Bt.MOCK_USER;else{B=jy(n.mockUserToken,(l=r._app)==null?void 0:l.options.projectId);const C=n.mockUserToken.sub||n.mockUserToken.user_id;if(!C)throw new M(O.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");d=new Bt(C)}r._authCredentials=new kP(new Y_(B,d))}}/**
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
 */class it{constructor(e,t,n){this.converter=t,this._query=n,this.type="query",this.firestore=e}withConverter(e){return new it(this.firestore,e,this._query)}}class we{constructor(e,t,n){this.converter=t,this._key=n,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new an(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new we(this.firestore,e,this._key)}toJSON(){return{type:we._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,n){if(As(t,we._jsonSchema))return new we(e,n||null,new J(ce.fromString(t.referencePath)))}}we._jsonSchemaVersion="firestore/documentReference/1.0",we._jsonSchema={type:Ye("string",we._jsonSchemaVersion),referencePath:Ye("string")};class an extends it{constructor(e,t,n){super(e,t,qi(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new we(this.firestore,null,new J(e))}withConverter(e){return new an(this.firestore,e,this._path)}}function rb(r,e,...t){if(r=oe(r),ch("collection","path",e),r instanceof Ra){const n=ce.fromString(e,...t);return WC(n),new an(r,null,n)}{if(!(r instanceof we||r instanceof an))throw new M(O.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(ce.fromString(e,...t));return WC(n),new an(r.firestore,null,n)}}function sb(r,e){if(r=de(r,Ra),ch("collectionGroup","collection id",e),e.indexOf("/")>=0)throw new M(O.INVALID_ARGUMENT,`Invalid collection ID '${e}' passed to function collectionGroup(). Collection IDs must not contain '/'.`);return new it(r,null,(function(n){return new Xn(ce.emptyPath(),n)})(e))}function lE(r,e,...t){if(r=oe(r),arguments.length===1&&(e=_u.newId()),ch("doc","path",e),r instanceof Ra){const n=ce.fromString(e,...t);return zC(n),new we(r,null,new J(n))}{if(!(r instanceof we||r instanceof an))throw new M(O.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(ce.fromString(e,...t));return zC(n),new we(r.firestore,r instanceof an?r.converter:null,new J(n))}}function ib(r,e){return r=oe(r),e=oe(e),(r instanceof we||r instanceof an)&&(e instanceof we||e instanceof an)&&r.firestore===e.firestore&&r.path===e.path&&r.converter===e.converter}function Th(r,e){return r=oe(r),e=oe(e),r instanceof it&&e instanceof it&&r.firestore===e.firestore&&R_(r._query,e._query)&&r.converter===e.converter}/**
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
 */class bt{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(n,s){if(n.length!==s.length)return!1;for(let i=0;i<n.length;++i)if(n[i]!==s[i])return!1;return!0})(this._values,e._values)}toJSON(){return{type:bt._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(As(e,bt._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((t=>typeof t=="number")))return new bt(e.vectorValues);throw new M(O.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}bt._jsonSchemaVersion="firestore/vectorValue/1.0",bt._jsonSchema={type:Ye("string",bt._jsonSchemaVersion),vectorValues:Ye("object")};/**
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
 */const ob=/^__.*__$/;class ab{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return this.fieldMask!==null?new Yn(e,this.data,this.fieldMask,t,this.fieldTransforms):new Ui(e,this.data,t,this.fieldTransforms)}}class BE{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return new Yn(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function hE(r){switch(r){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw Y(40011,{dataSource:r})}}class Pu{constructor(e,t,n,s,i,o){this.settings=e,this.databaseId=t,this.serializer=n,this.ignoreUndefinedProperties=s,i===void 0&&this.validatePath(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new Pu({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){var s;const t=(s=this.path)==null?void 0:s.child(e),n=this.contextWith({path:t,arrayElement:!1});return n.validatePathSegment(e),n}childContextForFieldPath(e){var s;const t=(s=this.path)==null?void 0:s.child(e),n=this.contextWith({path:t,arrayElement:!1});return n.validatePath(),n}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return Jc(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find((t=>e.isPrefixOf(t)))!==void 0||this.fieldTransforms.find((t=>e.isPrefixOf(t.field)))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(hE(this.dataSource)&&ob.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class cb{constructor(e,t,n){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=n||vs(e)}createContext(e,t,n,s=!1){return new Pu({dataSource:e,methodName:t,targetDoc:n,path:je.emptyPath(),arrayElement:!1,hasConverter:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function bs(r){const e=r._freezeSettings(),t=vs(r._databaseId);return new cb(r._databaseId,!!e.ignoreUndefinedProperties,t)}function bu(r,e,t,n,s,i={}){const o=r.createContext(i.merge||i.mergeFields?2:0,e,t,s);Fh("Data must be an object, but it was:",o,n);const a=CE(n,o);let c,l;if(i.merge)c=new kt(o.fieldMask),l=o.fieldTransforms;else if(i.mergeFields){const B=[];for(const d of i.mergeFields){const C=un(e,d,t);if(!o.contains(C))throw new M(O.INVALID_ARGUMENT,`Field '${C}' is specified in your field mask but missing from your input data.`);gE(B,C)||B.push(C)}c=new kt(B),l=o.fieldTransforms.filter((d=>c.covers(d.field)))}else c=null,l=o.fieldTransforms;return new ab(new tt(a),c,l)}class va extends vn{_toFieldTransform(e){if(e.dataSource!==2)throw e.dataSource===1?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof va}}function dE(r,e,t){return new Pu({dataSource:3,targetDoc:e.settings.targetDoc,methodName:r._methodName,arrayElement:t},e.databaseId,e.serializer,e.ignoreUndefinedProperties)}class Ah extends vn{_toFieldTransform(e){return new Rs(e.path,new hi)}isEqual(e){return e instanceof Ah}}class Rh extends vn{constructor(e,t){super(e),this._r=t}_toFieldTransform(e){const t=dE(this,e,!0),n=this._r.map((i=>Tn(i,t))),s=new ms(n);return new Rs(e.path,s)}isEqual(e){return e instanceof Rh&&cn(this._r,e._r)}}class vh extends vn{constructor(e,t){super(e),this._r=t}_toFieldTransform(e){const t=dE(this,e,!0),n=this._r.map((i=>Tn(i,t))),s=new _s(n);return new Rs(e.path,s)}isEqual(e){return e instanceof vh&&cn(this._r,e._r)}}class Ph extends vn{constructor(e,t){super(e),this.ar=t}_toFieldTransform(e){const t=new Es(e.serializer,Gi(e.serializer,this.ar));return new Rs(e.path,t)}isEqual(e){return e instanceof Ph&&(this.ar===e.ar||Number.isNaN(this.ar)&&Number.isNaN(e.ar))}}class bh extends vn{constructor(e,t){super(e),this.ar=t}_toFieldTransform(e){const t=new di(e.serializer,Gi(e.serializer,this.ar));return new Rs(e.path,t)}isEqual(e){return e instanceof bh&&(this.ar===e.ar||Number.isNaN(this.ar)&&Number.isNaN(e.ar))}}class Sh extends vn{constructor(e,t){super(e),this.ar=t}_toFieldTransform(e){const t=new fi(e.serializer,Gi(e.serializer,this.ar));return new Rs(e.path,t)}isEqual(e){return e instanceof Sh&&(this.ar===e.ar||Number.isNaN(this.ar)&&Number.isNaN(e.ar))}}function Nh(r,e,t,n){const s=r.createContext(1,e,t);Fh("Data must be an object, but it was:",s,n);const i=[],o=tt.empty();Gr(n,((c,l)=>{const B=kh(e,c,t);l=oe(l);const d=s.childContextForFieldPath(B);if(l instanceof va)i.push(B);else{const C=Tn(l,d);C!=null&&(i.push(B),o.set(B,C))}}));const a=new kt(i);return new BE(o,a,s.fieldTransforms)}function Oh(r,e,t,n,s,i){const o=r.createContext(1,e,t),a=[un(e,n,t)],c=[s];if(i.length%2!=0)throw new M(O.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let C=0;C<i.length;C+=2)a.push(un(e,i[C])),c.push(i[C+1]);const l=[],B=tt.empty();for(let C=a.length-1;C>=0;--C)if(!gE(l,a[C])){const g=a[C];let I=c[C];I=oe(I);const P=o.childContextForFieldPath(g);if(I instanceof va)l.push(g);else{const F=Tn(I,P);F!=null&&(l.push(g),B.set(g,F))}}const d=new kt(l);return new BE(B,d,o.fieldTransforms)}function fE(r,e,t,n=!1){return Tn(t,r.createContext(n?4:3,e))}function Tn(r,e,t){if(pE(r=oe(r)))return Fh("Unsupported field value:",e,r),CE(r,e);if(r instanceof vn)return(function(s,i){if(!hE(i.dataSource))throw i.createError(`${s._methodName}() can only be used with update() and set()`);if(!i.path)throw i.createError(`${s._methodName}() is not currently supported inside arrays`);const o=s._toFieldTransform(i);o&&i.fieldTransforms.push(o)})(r,e),null;if(r===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),r instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return(function(s,i){const o=[];let a=0;for(const c of s){let l=Tn(c,i.childContextForArray(a));l==null&&(l={nullValue:"NULL_VALUE"}),o.push(l),a++}return{arrayValue:{values:o}}})(r,e)}return(function(s,i,o){if((s=oe(s))===null)return{nullValue:"NULL_VALUE"};if(typeof s=="number")return Gi(i.serializer,s);if(typeof s=="boolean")return{booleanValue:s};if(typeof s=="string")return{stringValue:s};if(s instanceof Date){const a=ye.fromDate(s);return{timestampValue:_i(i.serializer,a)}}if(s instanceof ye){const a=new ye(s.seconds,1e3*Math.floor(s.nanoseconds/1e3));return{timestampValue:_i(i.serializer,a)}}if(s instanceof on)return{geoPointValue:{latitude:s.latitude,longitude:s.longitude}};if(s instanceof Ot)return{bytesValue:L_(i.serializer,s._byteString)};if(s instanceof we){const a=i.databaseId,c=s.firestore._databaseId;if(!c.isEqual(a))throw i.createError(`Document reference is for database ${c.projectId}/${c.database} but should be for database ${a.projectId}/${a.database}`);return{referenceValue:yh(s.firestore._databaseId||i.databaseId,s._key.path)}}if(s instanceof bt)return(function(c,l){const B=c instanceof bt?c.toArray():c;return{mapValue:{fields:{[uh]:{stringValue:lh},[Cs]:{arrayValue:{values:B.map((C=>{if(typeof C!="number")throw l.createError("VectorValues must only contain numeric values.");return Iu(l.serializer,C)}))}}}}}})(s,i);if(W_(s))return s._toProto(i.serializer);throw i.createError(`Unsupported field value: ${Eu(s)}`)})(r,e)}function CE(r,e){const t={};return $m(r)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Gr(r,((n,s)=>{const i=Tn(s,e.childContextForField(n));i!=null&&(t[n]=i)})),{mapValue:{fields:t}}}function pE(r){return!(typeof r!="object"||r===null||r instanceof Array||r instanceof Date||r instanceof ye||r instanceof on||r instanceof Ot||r instanceof we||r instanceof vn||r instanceof bt||W_(r))}function Fh(r,e,t){if(!pE(t)||!ya(t)){const n=Eu(t);throw n==="an object"?e.createError(r+" a custom object"):e.createError(r+" "+n)}}function un(r,e,t){if((e=oe(e))instanceof Ps)return e._internalPath;if(typeof e=="string")return kh(r,e);throw Jc("Field path arguments must be of type string or ",r,!1,void 0,t)}const ub=new RegExp("[~\\*/\\[\\]]");function kh(r,e,t){if(e.search(ub)>=0)throw Jc(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,r,!1,void 0,t);try{return new Ps(...e.split("."))._internalPath}catch{throw Jc(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,r,!1,void 0,t)}}function Jc(r,e,t,n,s){const i=n&&!n.isEmpty(),o=s!==void 0;let a=`Function ${e}() called with invalid data`;t&&(a+=" (via `toFirestore()`)"),a+=". ";let c="";return(i||o)&&(c+=" (found",i&&(c+=` in field ${n}`),o&&(c+=` in document ${s}`),c+=")"),new M(O.INVALID_ARGUMENT,a+r+c)}function gE(r,e){return r.some((t=>t.isEqual(e)))}function mE(r){return typeof r._readUserData=="function"}/**
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
 */class Dt{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){const n=tt.empty();for(const s in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(s)){const i=this.optionDefinitions[s];if(s in e){const o=e[s];let a;i.nestedOptions&&ya(o)?a={mapValue:{fields:new Dt(i.nestedOptions).getOptionsProto(t,o)}}:o&&(a=Tn(o,t)??void 0),a&&n.set(je.fromServerFormat(i.serverName),a)}}return n}getOptionsProto(e,t,n){const s=this._getKnownOptions(t,e);if(n){const i=new Map(ah(n,((o,a)=>[je.fromServerFormat(a),o!==void 0?Tn(o,e):null])));s.setAll(i)}return s.value.mapValue.fields??{}}}/**
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
 */function lb(r){return typeof r=="object"&&r!==null&&!!("nullValue"in r&&(r.nullValue===null||r.nullValue==="NULL_VALUE")||"booleanValue"in r&&(r.booleanValue===null||typeof r.booleanValue=="boolean")||"integerValue"in r&&(r.integerValue===null||typeof r.integerValue=="number"||typeof r.integerValue=="string")||"doubleValue"in r&&(r.doubleValue===null||typeof r.doubleValue=="number")||"timestampValue"in r&&(r.timestampValue===null||(function(t){return typeof t=="object"&&t!==null&&"seconds"in t&&(t.seconds===null||typeof t.seconds=="number"||typeof t.seconds=="string")&&"nanos"in t&&(t.nanos===null||typeof t.nanos=="number")})(r.timestampValue))||"stringValue"in r&&(r.stringValue===null||typeof r.stringValue=="string")||"bytesValue"in r&&(r.bytesValue===null||r.bytesValue instanceof Uint8Array)||"referenceValue"in r&&(r.referenceValue===null||typeof r.referenceValue=="string")||"geoPointValue"in r&&(r.geoPointValue===null||(function(t){return typeof t=="object"&&t!==null&&"latitude"in t&&(t.latitude===null||typeof t.latitude=="number")&&"longitude"in t&&(t.longitude===null||typeof t.longitude=="number")})(r.geoPointValue))||"arrayValue"in r&&(r.arrayValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("values"in t)||t.values!==null&&!Array.isArray(t.values))})(r.arrayValue))||"mapValue"in r&&(r.mapValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("fields"in t)||t.fields!==null&&!ya(t.fields))})(r.mapValue))||"fieldReferenceValue"in r&&(r.fieldReferenceValue===null||typeof r.fieldReferenceValue=="string")||"functionValue"in r&&(r.functionValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("name"in t)||t.name!==null&&typeof t.name!="string"||!("args"in t)||t.args!==null&&!Array.isArray(t.args))})(r.functionValue))||"pipelineValue"in r&&(r.pipelineValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("stages"in t)||t.stages!==null&&!Array.isArray(t.stages))})(r.pipelineValue)))}/**
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
 */function Bb(){return new va("deleteField")}function hb(){return new Ah("serverTimestamp")}function db(...r){return new Rh("arrayUnion",r)}function fb(...r){return new vh("arrayRemove",r)}function Cb(r){return new Ph("increment",r)}function pb(r){return new bh("minimum",r)}function gb(r){return new Sh("maximum",r)}function _E(r){return new bt(r)}/**
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
 */function z(r){let e;return r instanceof Ss?r:(e=ya(r)?yb(r):r instanceof Array?wb(r):EE(r,void 0),e)}function Vl(r){if(r instanceof Ss)return r;if(r instanceof bt)return ca(r);if(Array.isArray(r))return ca(_E(r));throw new Error("Unsupported value: "+typeof r)}function Lh(r){return Jv(r)?vc(r):z(r)}class Ss{constructor(){this._protoValueType="ProtoValue"}add(e){return new V("add",[this,z(e)],"add")}asBoolean(){if(this instanceof Fr)return this;if(this instanceof Os)return new yE(this);if(this instanceof Ns)return new Ib(this);if(this instanceof V)return new IE(this);throw new M("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new V("subtract",[this,z(e)],"subtract")}multiply(e){return new V("multiply",[this,z(e)],"multiply")}divide(e){return new V("divide",[this,z(e)],"divide")}mod(e){return new V("mod",[this,z(e)],"mod")}equal(e){return new V("equal",[this,z(e)],"equal").asBoolean()}notEqual(e){return new V("not_equal",[this,z(e)],"notEqual").asBoolean()}lessThan(e){return new V("less_than",[this,z(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new V("less_than_or_equal",[this,z(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new V("greater_than",[this,z(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new V("greater_than_or_equal",[this,z(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){const n=[e,...t].map((s=>z(s)));return new V("array_concat",[this,...n],"arrayConcat")}arrayContains(e){return new V("array_contains",[this,z(e)],"arrayContains").asBoolean()}arrayContainsAll(e){const t=Array.isArray(e)?new bo(e.map(z),"arrayContainsAll"):e;return new V("array_contains_all",[this,t],"arrayContainsAll").asBoolean()}arrayContainsAny(e){const t=Array.isArray(e)?new bo(e.map(z),"arrayContainsAny"):e;return new V("array_contains_any",[this,t],"arrayContainsAny").asBoolean()}arrayReverse(){return new V("array_reverse",[this])}arrayLength(){return new V("array_length",[this],"arrayLength")}equalAny(e){const t=Array.isArray(e)?new bo(e.map(z),"equalAny"):e;return new V("equal_any",[this,t],"equalAny").asBoolean()}notEqualAny(e){const t=Array.isArray(e)?new bo(e.map(z),"notEqualAny"):e;return new V("not_equal_any",[this,t],"notEqualAny").asBoolean()}exists(){return new V("exists",[this],"exists").asBoolean()}charLength(){return new V("char_length",[this],"charLength")}like(e){return new V("like",[this,z(e)],"like").asBoolean()}regexContains(e){return new V("regex_contains",[this,z(e)],"regexContains").asBoolean()}regexFind(e){return new V("regex_find",[this,z(e)],"regexFind")}regexFindAll(e){return new V("regex_find_all",[this,z(e)],"regexFindAll")}regexMatch(e){return new V("regex_match",[this,z(e)],"regexMatch").asBoolean()}stringContains(e){return new V("string_contains",[this,z(e)],"stringContains").asBoolean()}startsWith(e){return new V("starts_with",[this,z(e)],"startsWith").asBoolean()}endsWith(e){return new V("ends_with",[this,z(e)],"endsWith").asBoolean()}toLower(){return new V("to_lower",[this],"toLower")}toUpper(){return new V("to_upper",[this],"toUpper")}trim(e){const t=[this];return e&&t.push(z(e)),new V("trim",t,"trim")}ltrim(e){const t=[this];return e&&t.push(z(e)),new V("ltrim",t,"ltrim")}rtrim(e){const t=[this];return e&&t.push(z(e)),new V("rtrim",t,"rtrim")}type(){return new V("type",[this])}isType(e){return new V("is_type",[this,ca(e)],"isType").asBoolean()}stringConcat(e,...t){const n=[e,...t].map(z);return new V("string_concat",[this,...n],"stringConcat")}stringIndexOf(e){return new V("string_index_of",[this,z(e)],"stringIndexOf")}stringRepeat(e){return new V("string_repeat",[this,z(e)],"stringRepeat")}stringReplaceAll(e,t){return new V("string_replace_all",[this,z(e),z(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new V("string_replace_one",[this,z(e),z(t)],"stringReplaceOne")}concat(e,...t){const n=[e,...t].map(z);return new V("concat",[this,...n],"concat")}reverse(){return new V("reverse",[this],"reverse")}arrayFilter(e,t){return new V("array_filter",[this,z(e),t],"arrayFilter")}arrayTransform(e,t){return new V("array_transform",[this,z(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,n){return new V("array_transform",[this,z(e),z(t),n],"arrayTransformWithIndex")}arraySlice(e,t){const n=[this,z(e)];return t!==void 0&&n.push(z(t)),new V("array_slice",n,"arraySlice")}arrayFirst(){return new V("array_first",[this],"arrayFirst")}arrayFirstN(e){return new V("array_first_n",[this,z(e)],"arrayFirstN")}arrayLast(){return new V("array_last",[this],"arrayLast")}arrayLastN(e){return new V("array_last_n",[this,z(e)],"arrayLastN")}arrayMaximum(){return new V("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new V("maximum_n",[this,z(e)],"arrayMaximumN")}arrayMinimum(){return new V("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new V("minimum_n",[this,z(e)],"arrayMinimumN")}arrayIndexOf(e){return new V("array_index_of",[this,z(e),z("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new V("array_index_of",[this,z(e),z("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new V("array_index_of_all",[this,z(e)],"arrayIndexOfAll")}byteLength(){return new V("byte_length",[this],"byteLength")}ceil(){return new V("ceil",[this])}floor(){return new V("floor",[this])}abs(){return new V("abs",[this])}exp(){return new V("exp",[this])}mapGet(e){return new V("map_get",[this,ca(e)],"mapGet")}mapSet(e,t,...n){const s=[this,z(e),z(t),...n.map(z)];return new V("map_set",s,"mapSet")}mapKeys(){return new V("map_keys",[this],"mapKeys")}mapValues(){return new V("map_values",[this],"mapValues")}mapEntries(){return new V("map_entries",[this],"mapEntries")}getField(e){return new V("get_field",[this,z(e)],"get_field")}count(){return qt._create("count",[this],"count")}sum(){return qt._create("sum",[this],"sum")}average(){return qt._create("average",[this],"average")}minimum(){return qt._create("minimum",[this],"minimum")}maximum(){return qt._create("maximum",[this],"maximum")}first(){return qt._create("first",[this],"first")}last(){return qt._create("last",[this],"last")}arrayAgg(){return qt._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return qt._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return qt._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){const n=[e,...t];return new V("maximum",[this,...n.map(z)],"logicalMaximum")}logicalMinimum(e,...t){const n=[e,...t];return new V("minimum",[this,...n.map(z)],"minimum")}vectorLength(){return new V("vector_length",[this],"vectorLength")}cosineDistance(e){return new V("cosine_distance",[this,Vl(e)],"cosineDistance")}dotProduct(e){return new V("dot_product",[this,Vl(e)],"dotProduct")}euclideanDistance(e){return new V("euclidean_distance",[this,Vl(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new V("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new V("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new V("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new V("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new V("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new V("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new V("timestamp_add",[this,z(e),z(t)],"timestampAdd")}timestampSubtract(e,t){return new V("timestamp_subtract",[this,z(e),z(t)],"timestampSubtract")}timestampDiff(e,t){return new V("timestamp_diff",[this,Lh(e),z(t)],"timestampDiff")}timestampExtract(e,t){const n=[this,z(e)];return t&&n.push(z(t)),new V("timestamp_extract",n,"timestampExtract")}documentId(){return new V("document_id",[this],"documentId")}parent(){return new V("parent",[this],"parent")}substring(e,t){const n=z(e);return new V("substring",t===void 0?[this,n]:[this,n,z(t)],"substring")}arrayGet(e){return new V("array_get",[this,z(e)],"arrayGet")}isError(){return new V("is_error",[this],"isError").asBoolean()}ifError(e){const t=new V("if_error",[this,z(e)],"ifError");return e instanceof Fr?t.asBoolean():t}isAbsent(){return new V("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new V("map_remove",[this,z(e)],"mapRemove")}mapMerge(e,...t){const n=z(e),s=t.map(z);return new V("map_merge",[this,n,...s],"mapMerge")}pow(e){return new V("pow",[this,z(e)])}trunc(e){return e===void 0?new V("trunc",[this]):new V("trunc",[this,z(e)],"trunc")}round(e){return e===void 0?new V("round",[this]):new V("round",[this,z(e)],"round")}collectionId(){return new V("collection_id",[this])}length(){return new V("length",[this])}ln(){return new V("ln",[this])}sqrt(){return new V("sqrt",[this])}stringReverse(){return new V("string_reverse",[this])}ifAbsent(e){return new V("if_absent",[this,z(e)],"ifAbsent")}ifNull(e){return new V("if_null",[this,z(e)],"ifNull")}coalesce(e,...t){return new V("coalesce",[this,z(e),...t.map(z)],"coalesce")}join(e){return new V("join",[this,z(e)],"join")}log10(){return new V("log10",[this])}arraySum(){return new V("sum",[this])}split(e){return new V("split",[this,z(e)])}timestampTruncate(e,t){const n=[this,z(e)];return t&&n.push(z(t)),new V("timestamp_trunc",n)}ascending(){return Db(this)}descending(){return Tb(this)}as(e){return new _b(this,e,"as")}}class qt{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,n){const s=new qt(e,t);return s._methodName=n,s}as(e){return new mb(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map((t=>t._toProto(e)))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e)))}}class mb{constructor(e,t,n){this.aggregate=e,this.alias=t,this._methodName=n}_readUserData(e){this.aggregate._readUserData(e)}}class _b{constructor(e,t,n){this.expr=e,this.alias=t,this._methodName=n,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class bo extends Ss{constructor(e,t){super(),this.ur=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.ur.map((t=>t._toProto(e)))}}}_readUserData(e){this.ur.forEach((t=>t._readUserData(e)))}}class Ns extends Ss{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new V("geo_distance",[this,z(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}function vc(r){return Eb(r,"field")}function Eb(r,e){return new Ns(typeof r=="string"?fn===r?$_()._internalPath:un("field",r):r._internalPath,e)}class Os extends Ss{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){const t=new Os(e,void 0);return t._protoValue=e,t}_toProto(e){return q(this._protoValue!==void 0,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,lb(this._protoValue)||(this._protoValue=Tn(this.value,e))}}function ca(r,e){return EE(r,"constant")}function EE(r,e){const t=new Os(r,e);return typeof r=="boolean"?new yE(t):t}class V extends Ss{constructor(e,t,n,s){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,n!==void 0&&(this._methodName=n),s!==void 0&&(this._options=s)}get _optionsUtil(){return new Dt({})}_toProto(e){const t={functionValue:{name:this.name,args:this.params.map((n=>n._toProto(e)))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e))),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class Fr extends Ss{get _methodName(){return this._expr._methodName}countIf(){return qt._create("count_if",[this],"countIf")}not(){return new V("not",[this],"not").asBoolean()}conditional(e,t){return new V("conditional",[this,e,t],"conditional")}ifError(e){const t=z(e),n=new V("if_error",[this,t],"ifError");return t instanceof Fr?n.asBoolean():n}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class IE extends Fr{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class yE extends Fr{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class Ib extends Fr{constructor(e){super(),this._expr=e,this.expressionType="Field"}}function yb(r,e){const t=[];for(const n in r)if(Object.prototype.hasOwnProperty.call(r,n)){const s=r[n];t.push(ca(n)),t.push(z(s))}return new V("map",t,"map")}function wb(r){return(function(t,n){return new V("array",t.map((s=>z(s))),n)})(r,"array")}function Db(r){return new xh(Lh(r),"ascending","ascending")}function Tb(r){return new xh(Lh(r),"descending","descending")}class xh{constructor(e,t,n){this.expr=e,this.direction=t,this._methodName=n,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:Q_(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}/**
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
 */class zt{constructor(e){this.optionsProto=void 0,{rawOptions:this.rawOptions,...this.knownOptions}=e}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class wE extends zt{get _name(){return"add_fields"}get _optionsUtil(){return new Dt({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return{...super._toProto(e),args:[aa(e,this.fields)]}}_readUserData(e){super._readUserData(e),Lr(this.fields,e)}}class DE extends zt{get _name(){return"aggregate"}get _optionsUtil(){return new Dt({})}constructor(e,t,n){super(n),this.groups=e,this.accumulators=t}_toProto(e){return{...super._toProto(e),args:[aa(e,this.accumulators),aa(e,this.groups)]}}_readUserData(e){super._readUserData(e),Lr(this.groups,e),Lr(this.accumulators,e)}}class TE extends zt{get _name(){return"distinct"}get _optionsUtil(){return new Dt({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return{...super._toProto(e),args:[aa(e,this.groups)]}}_readUserData(e){super._readUserData(e),Lr(this.groups,e)}}class Pa extends zt{get _name(){return"collection"}get _optionsUtil(){return new Dt({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.Er=e.startsWith("/")?e:"/"+e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:this.Er}]}}_readUserData(e){super._readUserData(e)}}class ba extends zt{get _name(){return"collection_group"}get _optionsUtil(){return new Dt({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:""},{stringValue:this.collectionId}]}}_readUserData(e){super._readUserData(e)}}class Su extends zt{get _name(){return"database"}get _optionsUtil(){return new Dt({})}_toProto(e){return{...super._toProto(e)}}_readUserData(e){super._readUserData(e)}}class Nu extends zt{get _name(){return"documents"}get _optionsUtil(){return new Dt({})}constructor(e,t){if(super(t),!e||e.length===0)throw new M(O.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");const n=e.map((i=>i.startsWith("/")?i:"/"+i)),s=new Set(n);if(s.size!==n.length)throw new M(O.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.hr=n,this.Tr=s}_toProto(e){return{...super._toProto(e),args:this.hr.map((t=>({referenceValue:t})))}}_readUserData(e){super._readUserData(e)}}class Sa extends zt{get _name(){return"where"}get _optionsUtil(){return new Dt({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return{...super._toProto(e),args:[this.condition._toProto(e)]}}_readUserData(e){super._readUserData(e),Lr(this.condition,e)}}class kr extends zt{get _name(){return"limit"}get _optionsUtil(){return new Dt({})}constructor(e,t){q(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return{...super._toProto(e),args:[Gi(e,this.limit)]}}}class Tp extends zt{get _name(){return"offset"}get _optionsUtil(){return new Dt({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return{...super._toProto(e),args:[Gi(e,this.offset)]}}}class Ab extends zt{get _name(){return"select"}get _optionsUtil(){return new Dt({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return{...super._toProto(e),args:[aa(e,this.selections)]}}_readUserData(e){super._readUserData(e),Lr(this.selections,e)}}class pn extends zt{get _name(){return"sort"}get _optionsUtil(){return new Dt({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return{...super._toProto(e),args:this.orderings.map((t=>t._toProto(e)))}}_readUserData(e){super._readUserData(e),Lr(this.orderings,e)}}class Vh extends zt{get _name(){return"replace_with"}get _optionsUtil(){return new Dt({})}constructor(e,t){super(t),this.map=e}_toProto(e){return{...super._toProto(e),args:[this.map._toProto(e),Q_(Vh.Pr)]}}_readUserData(e){super._readUserData(e),Lr(this.map,e)}}Vh.Pr="full_replace";function Lr(r,e){return mE(r)?r._readUserData(e):Array.isArray(r)?r.forEach((t=>t._readUserData(e))):r instanceof Map?r.forEach((t=>t._readUserData(e))):Object.values(r).forEach((t=>t._readUserData(e))),r}/**
 * @license
 * Copyright 2026 Google LLC
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
 */class qo{constructor(e,t,n,s){this._db=e,this.userDataReader=t,this._userDataWriter=n,this.stages=s}Ar(e,t){const n=this.userDataReader.createContext(3,e);return mE(t)?t._readUserData(n):Array.isArray(t)?t.forEach((s=>s._readUserData(n))):t.forEach((s=>s._readUserData(n))),t}where(e){const t=this.stages.map((n=>n));return this.Ar("where",e),t.push(new Sa(e,{})),new qo(this._db,this.userDataReader,this._userDataWriter,t)}limit(e){const t=this.stages.map((n=>n));return t.push(new kr(e,{})),new qo(this._db,this.userDataReader,this._userDataWriter,t)}sort(e,...t){const n=this.stages.map((s=>s));return"orderings"in e?n.push(new pn(this.Ar("sort",e.orderings),{})):n.push(new pn(this.Ar("sort",[e,...t]),{})),new qo(this._db,this.userDataReader,this._userDataWriter,n)}Vr(e){return{pipeline:{stages:this.stages.map((t=>t._toProto(e)))}}}}// Copyright 2024 Google LLC* @license
class Et{constructor(e,t,n){this.serializer=e,this.stages=t,this.listenOptions=n,this.isCorePipeline=!0}getPipelineCollection(){return Na(this)}getPipelineCollectionGroup(){return Mh(this)}getPipelineCollectionId(){return AE(this)}getPipelineDocuments(){return Kc(this)}getPipelineFlavor(){return(function(t){let n="exact";return t.stages.forEach(((s,i)=>{s._name!==TE.name&&s._name!==DE.name||(n="keyless"),s._name===Ab.name&&n==="exact"&&(n="augmented"),s._name===wE.name&&i<t.stages.length-1&&n==="exact"&&(n="augmented")})),n})(this)}getPipelineSourceType(){return Mn(this)}}function Mn(r){const e=r.stages[0];return e instanceof Pa||e instanceof ba||e instanceof Su||e instanceof Nu?e._name:"unknown"}function Na(r){if(Mn(r)==="collection")return r.stages[0].Er}function Mh(r){if(Mn(r)==="collection_group")return r.stages[0].collectionId}function AE(r){switch(Mn(r)){case"collection":return ce.fromString(Na(r)).lastSegment();case"collection_group":return Mh(r);default:return}}function Kc(r){if(Mn(r)==="documents")return r.stages[0].hr}class A{constructor(e,t){this.type=e,this.value=t}static dr(){return new A("ERROR",void 0)}static mr(){return new A("UNSET",void 0)}static pr(){return new A("NULL",En)}static newValue(e){return Jt(e)?new A("NULL",En):(function(n){return!!n&&"booleanValue"in n})(e)?new A("BOOLEAN",e):Cn(e)?new A("INT",e):as(e)?new A("DOUBLE",e):(function(n){return!!n&&"timestampValue"in n&&!!n.timestampValue})(e)?new A("TIMESTAMP",e):(function(n){return!!n&&"stringValue"in n})(e)?new A("STRING",e):(function(n){return!!n&&"bytesValue"in n})(e)?new A("BYTES",e):e.referenceValue?new A("REFERENCE",e):e.geoPointValue?new A("GEO_POINT",e):Nr(e)?new A("ARRAY",e):gs(e)?new A("VECTOR",e):ls(e)?new A("MAP",e):new A("ERROR",void 0)}gr(){return this.type==="ERROR"||this.type==="UNSET"}yr(){return this.type==="NULL"}}function jo(r){if(!r.gr())return r.value}function RE(r){return r instanceof Fr?r._expr:r}function se(r){if((r=RE(r))instanceof Ns)return new Rb(r);if(r instanceof Os)return new vb(r);if(r instanceof bo)return new Pb(r);if(r instanceof V){if(r.name==="add")return new Nb(r);if(r.name==="subtract")return new Ob(r);if(r.name==="multiply")return new Fb(r);if(r.name==="divide")return new kb(r);if(r.name==="mod")return new Lb(r);if(r.name==="and")return new xb(r);if(r.name==="equal")return new Qb(r);if(r.name==="not_equal")return new $b(r);if(r.name==="less_than")return new Yb(r);if(r.name==="less_than_or_equal")return new Xb(r);if(r.name==="greater_than")return new Zb(r);if(r.name==="greater_than_or_equal")return new eS(r);if(r.name==="array_concat")return new tS(r);if(r.name==="array_reverse")return new nS(r);if(r.name==="array_contains")return new rS(r);if(r.name==="array_contains_all")return new sS(r);if(r.name==="array_contains_any")return new iS(r);if(r.name==="array_length")return new oS(r);if(r.name==="array_element")return new aS(r);if(r.name==="equal_any")return new vE(r);if(r.name==="not_equal_any")return new Mb(r);if(r.name==="is_nan")return new Gb(r);if(r.name==="is_not_nan")return new Ub(r);if(r.name==="is_null")return new Hb(r);if(r.name==="is_not_null")return new qb(r);if(r.name==="is_error")return new jb(r);if(r.name==="exists")return new Jb(r);if(r.name==="not")return new Ou(r);if(r.name==="or")return new Vb(r);if(r.name==="xor")return new Gh(r);if(r.name==="conditional")return new Kb(r);if(r.name==="maximum")return new zb(r);if(r.name==="minimum")return new Wb(r);if(r.name==="reverse")return new cS(r);if(r.name==="replace_first")return new uS(r);if(r.name==="replace_all")return new lS(r);if(r.name==="char_length")return new BS(r);if(r.name==="byte_length")return new hS(r);if(r.name==="like")return new dS(r);if(r.name==="regex_contains")return new fS(r);if(r.name==="regex_match")return new CS(r);if(r.name==="string_contains")return new pS(r);if(r.name==="starts_with")return new gS(r);if(r.name==="ends_with")return new mS(r);if(r.name==="to_lower")return new _S(r);if(r.name==="to_upper")return new ES(r);if(r.name==="trim")return new IS(r);if(r.name==="string_concat")return new yS(r);if(r.name==="map_get")return new wS(r);if(r.name==="cosine_distance")return new DS(r);if(r.name==="dot_product")return new TS(r);if(r.name==="euclidean_distance")return new AS(r);if(r.name==="vector_length")return new RS(r);if(r.name==="unix_micros_to_timestamp")return new NS(r);if(r.name==="timestamp_to_unix_micros")return new kS(r);if(r.name==="unix_millis_to_timestamp")return new OS(r);if(r.name==="timestamp_to_unix_millis")return new LS(r);if(r.name==="unix_seconds_to_timestamp")return new FS(r);if(r.name==="timestamp_to_unix_seconds")return new xS(r);if(r.name==="timestamp_add")return new VS(r);if(r.name==="timestamp_subtract")return new MS(r)}throw new Error(`Unknown Expr : ${r}`)}class Rb{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===fn)return A.newValue({referenceValue:Ei(e.serializer,t.key)});if(this.expr.fieldName==="__update_time__")return A.newValue({timestampValue:Rc(e.serializer,t.version)});if(this.expr.fieldName==="__create_time__")return A.newValue({timestampValue:Rc(e.serializer,t.createTime)});const n=t.data.field(this.expr._fieldPath);return n?wa(n)?A.newValue((function(i,o){if(i.serverTimestampBehavior==="estimate")return{timestampValue:Rc(i.serializer,te.fromTimestamp(ui(o)))};if(i.serverTimestampBehavior==="previous"){const a=Da(o);if(a)return a}return{nullValue:"NULL_VALUE"}})(e,n)):A.newValue(n):A.mr()}}class vb{constructor(e){this.expr=e}evaluate(e,t){return A.newValue(this.expr._getValue())}}class Pb{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.ur.map((s=>se(s).evaluate(e,t)));return n.some((s=>s.gr()))?A.dr():A.newValue({arrayValue:{values:n.map((s=>s.value))}})}}function pt(r){return as(r)?Number(r.doubleValue):Number(r.integerValue)}function An(r){return BigInt(r.integerValue)}const bb=BigInt("0x7fffffffffffffff"),Sb=-BigInt("0x8000000000000000");class Oa{constructor(e){this.expr=e}evaluate(e,t){q(this.expr.params.length>=2,24778);const n=se(this.expr.params[0]).evaluate(e,t),s=se(this.expr.params[1]).evaluate(e,t);let i=this.wr(n,s);for(const o of this.expr.params.slice(2)){const a=se(o).evaluate(e,t);i=this.wr(i,a)}return i}wr(e,t){if(e.gr()||t.gr())return A.dr();if(e.yr()||t.yr())return A.pr();const n=e.value,s=t.value;if(!as(n)&&!Cn(n)||!as(s)&&!Cn(s))return A.dr();if(as(n)||as(s)){const i=this.br(n,s);return i?A.newValue(i):A.dr()}if(Cn(n)&&Cn(s)){const i=this.Sr(n,s);return i===void 0?A.dr():typeof i=="number"?A.newValue({doubleValue:i}):i<Sb||i>bb?A.dr():A.newValue({integerValue:`${i}`})}return A.dr()}}function zn(r,e){return Xe(r)!==Xe(e)?"TYPE_MISMATCH":Gt(r)||Gt(e)?"NOT_EQ":Jt(r)&&Jt(e)?"EQ":Jt(r)||Jt(e)?"NULL":Nr(r)&&Nr(e)?(function(n,s){var o,a,c;if(((o=n.values)==null?void 0:o.length)!==((a=s.values)==null?void 0:a.length))return"NOT_EQ";let i=!1;for(let l=0;l<(((c=n.values)==null?void 0:c.length)??0);l++){const B=n.values[l],d=s.values[l];switch(zn(B,d)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":i=!0;break;default:Y(44609,{vr:B,Dr:d})}}return i?"NULL":"EQ"})(r.arrayValue,e.arrayValue):gs(r)&&gs(e)||ls(r)&&ls(e)?(function(n,s){const i=n.fields||{},o=s.fields||{};if(Gc(i)!==Gc(o))return"NOT_EQ";let a=!1;for(const c in i)if(i.hasOwnProperty(c)){if(o[c]===void 0)return"NOT_EQ";switch(zn(i[c],o[c])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":a=!0}}return a?"NULL":"EQ"})(r.mapValue,e.mapValue):(function(n,s){return nn(n,s,{o:!1,t:!0,i:!0})})(r,e)?"EQ":"NOT_EQ"}class Nb extends Oa{Sr(e,t){return An(e)+An(t)}br(e,t){return{doubleValue:pt(e)+pt(t)}}}class Ob extends Oa{constructor(e){super(e),this.expr=e}Sr(e,t){return An(e)-An(t)}br(e,t){return{doubleValue:pt(e)-pt(t)}}}class Fb extends Oa{constructor(e){super(e),this.expr=e}Sr(e,t){return An(e)*An(t)}br(e,t){return{doubleValue:pt(e)*pt(t)}}}class kb extends Oa{constructor(e){super(e),this.expr=e}Sr(e,t){const n=An(t);if(n!==BigInt(0))return An(e)/n}br(e,t){const n=pt(t);return n===0?{doubleValue:li(n)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:pt(e)/n}}}class Lb extends Oa{constructor(e){super(e),this.expr=e}Sr(e,t){const n=An(t);if(n!==BigInt(0))return An(e)%n}br(e,t){const n=pt(t);if(n!==0)return{doubleValue:pt(e)%n}}}class xb{constructor(e){this.expr=e}evaluate(e,t){var i;let n=!1,s=!1;for(const o of this.expr.params){const a=se(o).evaluate(e,t);switch(a.type){case"BOOLEAN":if(!((i=a.value)!=null&&i.booleanValue))return A.newValue(ht);break;case"NULL":s=!0;break;default:n=!0}}return n?A.dr():s?A.pr():A.newValue(Mt)}}class Ou{constructor(e){this.expr=e}evaluate(e,t){var s;q(this.expr.params.length===1,9634);const n=se(this.expr.params[0]).evaluate(e,t);switch(n.type){case"BOOLEAN":return A.newValue({booleanValue:!((s=n.value)!=null&&s.booleanValue)});case"NULL":return A.pr();default:return A.dr()}}}class Vb{constructor(e){this.expr=e}evaluate(e,t){var i;let n=!1,s=!1;for(const o of this.expr.params){const a=se(o).evaluate(e,t);switch(a.type){case"BOOLEAN":if((i=a.value)!=null&&i.booleanValue)return A.newValue(Mt);break;case"NULL":s=!0;break;default:n=!0}}return n?A.dr():s?A.pr():A.newValue(ht)}}class Gh{constructor(e){this.expr=e}evaluate(e,t){var i;let n=!1,s=!1;for(const o of this.expr.params){const a=se(o).evaluate(e,t);switch(a.type){case"BOOLEAN":n=Gh.xor(n,!!((i=a.value)!=null&&i.booleanValue));break;case"NULL":s=!0;break;default:return A.dr()}}return s?A.pr():A.newValue({booleanValue:n})}static xor(e,t){return(e||t)&&!(e&&t)}}class vE{constructor(e){this.expr=e}evaluate(e,t){var o,a;q(this.expr.params.length===2,55094);let n=!1;const s=se(this.expr.params[0]).evaluate(e,t);switch(s.type){case"NULL":n=!0;break;case"ERROR":case"UNSET":return A.dr()}const i=se(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":n=!0;break;default:return A.dr()}if(n)return A.pr();for(const c of((a=(o=i.value)==null?void 0:o.arrayValue)==null?void 0:a.values)??[])switch(Jt(s.value)&&Jt(c)?"EQ":zn(s.value,c)){case"EQ":return A.newValue(Mt);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":n=!0;break;default:Y(44608,{value:s.value,candidate:c})}return n?A.pr():A.newValue(ht)}}class Mb{constructor(e){this.expr=e}evaluate(e,t){return new Ou(new V("not",[new V("equal_any",this.expr.params)])).evaluate(e,t)}}class Gb{constructor(e){this.expr=e}evaluate(e,t){q(this.expr.params.length===1,23322);const n=se(this.expr.params[0]).evaluate(e,t);switch(n.type){case"INT":return A.newValue(ht);case"DOUBLE":return A.newValue({booleanValue:isNaN(pt(n.value))});case"NULL":return A.pr();default:return A.dr()}}}class Ub{constructor(e){this.expr=e}evaluate(e,t){return q(this.expr.params.length===1,50406),new Ou(new V("not",[new V("is_nan",this.expr.params)])).evaluate(e,t)}}class Hb{constructor(e){this.expr=e}evaluate(e,t){switch(q(this.expr.params.length===1,23123),se(this.expr.params[0]).evaluate(e,t).type){case"NULL":return A.newValue(Mt);case"UNSET":case"ERROR":return A.dr();default:return A.newValue(ht)}}}class qb{constructor(e){this.expr=e}evaluate(e,t){return q(this.expr.params.length===1,23167),new Ou(new V("not",[new V("is_null",this.expr.params)])).evaluate(e,t)}}class jb{constructor(e){this.expr=e}evaluate(e,t){return q(this.expr.params.length===1,5228),se(this.expr.params[0]).evaluate(e,t).type==="ERROR"?A.newValue(Mt):A.newValue(ht)}}class Jb{constructor(e){this.expr=e}evaluate(e,t){switch(q(this.expr.params.length===1,6877),se(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return A.dr();case"UNSET":return A.newValue(ht);default:return A.newValue(Mt)}}}class Kb{constructor(e){this.expr=e}evaluate(e,t){var s;q(this.expr.params.length===3,11706);const n=se(this.expr.params[0]).evaluate(e,t);switch(n.type){case"BOOLEAN":return(s=n.value)!=null&&s.booleanValue?se(this.expr.params[1]).evaluate(e,t):se(this.expr.params[2]).evaluate(e,t);case"NULL":return se(this.expr.params[2]).evaluate(e,t);default:return A.dr()}}}class zb{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map((i=>se(i).evaluate(e,t)));let s;for(const i of n)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||wt(i.value,s.value)>0?i:s}return s===void 0?A.pr():s}}class Wb{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map((i=>se(i).evaluate(e,t)));let s;for(const i of n)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||wt(i.value,s.value)<0?i:s}return s===void 0?A.pr():s}}class Ji{constructor(e){this.expr=e}evaluate(e,t){q(this.expr.params.length===2,31033,`${this.expr.name}() function should have exactly 2 params`);const n=se(this.expr.params[0]).evaluate(e,t);switch(n.type){case"ERROR":case"UNSET":return A.dr()}const s=se(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ERROR":case"UNSET":return A.dr()}return this.Cr(n,s)}}class Qb extends Ji{constructor(e){super(e),this.expr=e}Cr(e,t){if(e.yr()&&t.yr())return A.newValue(Mt);if(e.yr()||t.yr()||Gt(e.value)||Gt(t.value)||Xe(e.value)!==Xe(t.value))return A.newValue(ht);switch(zn(e.value,t.value)){case"EQ":return A.newValue(Mt);case"NOT_EQ":return A.newValue(ht);case"NULL":return A.pr();default:Y(44615,{left:e,right:t})}}}class $b extends Ji{constructor(e){super(e),this.expr=e}Cr(e,t){switch(zn(e.value,t.value)){case"EQ":return A.newValue(ht);case"NOT_EQ":case"TYPE_MISMATCH":return A.newValue(Mt);case"NULL":return A.pr();default:Y(44614,{left:e,right:t})}}}class Yb extends Ji{constructor(e){super(e),this.expr=e}Cr(e,t){return Xe(e.value)!==Xe(t.value)||Gt(e.value)||Gt(t.value)?A.newValue(ht):A.newValue({booleanValue:wt(e.value,t.value)<0})}}class Xb extends Ji{constructor(e){super(e),this.expr=e}Cr(e,t){return Xe(e.value)!==Xe(t.value)||Gt(e.value)||Gt(t.value)?A.newValue(ht):zn(e.value,t.value)==="EQ"?A.newValue(Mt):A.newValue({booleanValue:wt(e.value,t.value)<0})}}class Zb extends Ji{constructor(e){super(e),this.expr=e}Cr(e,t){return Xe(e.value)!==Xe(t.value)||Gt(e.value)||Gt(t.value)?A.newValue(ht):A.newValue({booleanValue:wt(e.value,t.value)>0})}}class eS extends Ji{constructor(e){super(e),this.expr=e}Cr(e,t){return Xe(e.value)!==Xe(t.value)||Gt(e.value)||Gt(t.value)?A.newValue(ht):zn(e.value,t.value)==="EQ"?A.newValue(Mt):A.newValue({booleanValue:wt(e.value,t.value)>0})}}class tS{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class nS{constructor(e){this.expr=e}evaluate(e,t){var s;q(this.expr.params.length===1,216);const n=se(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return A.pr();case"ARRAY":{const i=((s=n.value.arrayValue)==null?void 0:s.values)??[];return A.newValue({arrayValue:{values:[...i].reverse()}})}default:return A.dr()}}}class rS{constructor(e){this.expr=e}evaluate(e,t){return q(this.expr.params.length===2,52884),new vE(new V("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class sS{constructor(e){this.expr=e}evaluate(e,t){var c,l,B,d;q(this.expr.params.length===2,1392);let n=!1;const s=se(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":n=!0;break;default:return A.dr()}const i=se(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":n=!0;break;default:return A.dr()}if(n)return A.pr();const o=((l=(c=i.value)==null?void 0:c.arrayValue)==null?void 0:l.values)??[],a=((d=(B=s.value)==null?void 0:B.arrayValue)==null?void 0:d.values)??[];for(const C of o){let g=!1;n=!1;for(const I of a){switch(Jt(C)&&Jt(I)?"EQ":zn(C,I)){case"EQ":g=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":n=!0;break;default:Y(44613,{value:I,search:C})}if(g)break}if(!g)return A.newValue(ht)}return A.newValue(Mt)}}class iS{constructor(e){this.expr=e}evaluate(e,t){var c,l,B,d;q(this.expr.params.length===2,2680);let n=!1;const s=se(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":n=!0;break;default:return A.dr()}const i=se(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":n=!0;break;default:return A.dr()}if(n)return A.pr();const o=((l=(c=i.value)==null?void 0:c.arrayValue)==null?void 0:l.values)??[],a=((d=(B=s.value)==null?void 0:B.arrayValue)==null?void 0:d.values)??[];for(const C of a)for(const g of o)switch(Jt(C)&&Jt(g)?"EQ":zn(C,g)){case"EQ":return A.newValue(Mt);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":n=!0;break;default:Y(60403,{value:C,search:g})}return n?A.pr():A.newValue(ht)}}class oS{constructor(e){this.expr=e}evaluate(e,t){var s,i,o;q(this.expr.params.length===1,38605);const n=se(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return A.pr();case"ARRAY":return A.newValue({integerValue:`${((o=(i=(s=n.value)==null?void 0:s.arrayValue)==null?void 0:i.values)==null?void 0:o.length)??0}`});default:return A.dr()}}}class aS{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class cS{constructor(e){this.expr=e}evaluate(e,t){var s,i;q(this.expr.params.length===1,1508);const n=se(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return A.pr();case"BYTES":{const o=(s=n.value)==null?void 0:s.bytesValue;if(typeof o=="string"){const a=Oe.fromBase64String(o).toUint8Array();return a.reverse(),A.newValue({bytesValue:Oe.fromUint8Array(a).toBase64()})}return A.newValue({bytesValue:new Uint8Array(o).reverse()})}case"STRING":{const o=(i=n.value)==null?void 0:i.stringValue,a=new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(o),c=Array.from(a,(l=>l.segment)).reverse();return A.newValue({stringValue:c.join("")})}default:return A.dr()}}}class uS{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class lS{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class BS{constructor(e){this.expr=e}evaluate(e,t){q(this.expr.params.length===1,19400);const n=se(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return A.pr();case"STRING":{const s=(function(o){let a=0;for(let c=0;c<o.length;c++){const l=o.codePointAt(c);if(l===void 0)return;if(l<=65535)if(l>=55296&&l<=57343)if(l<=56319){const B=o.codePointAt(c+1);B!==void 0&&B>=56320&&B<=57343?(a+=1,c++):a+=1}else a+=1;else a+=1;else{if(!(l<=1114111))return;a+=1,c++}}return a})(n.value.stringValue);return s===void 0?A.dr():A.newValue({integerValue:s})}default:return A.dr()}}}class hS{constructor(e){this.expr=e}evaluate(e,t){var s,i;q(this.expr.params.length===1,8486);const n=se(this.expr.params[0]).evaluate(e,t);switch(n.type){case"BYTES":{const o=(s=n.value)==null?void 0:s.bytesValue;return typeof o=="string"?A.newValue({integerValue:Oe.fromBase64String(o).toUint8Array().length}):A.newValue({integerValue:new Uint8Array(o).length})}case"STRING":{const o=(function(c){let l=0;for(let B=0;B<c.length;B++){const d=c.codePointAt(B);if(d===void 0)return;if(d>=55296&&d<=57343){if(!(d<=56319))return;{const C=c.codePointAt(B+1);if(C===void 0||!(C>=56320&&C<=57343))return;l+=4,B++}}else if(d<=127)l+=1;else if(d<=2047)l+=2;else if(d<=65535)l+=3;else{if(!(d<=1114111))return;l+=4,B++}}return l})((i=n.value)==null?void 0:i.stringValue);return o===void 0?A.dr():A.newValue({integerValue:o})}case"NULL":return A.pr();default:return A.dr()}}}class Ki{constructor(e){this.expr=e}evaluate(e,t){var o,a;q(this.expr.params.length===2,39773,`${this.expr.name}() function should have exactly two parameters`);let n=!1;const s=se(this.expr.params[0]).evaluate(e,t);switch(s.type){case"STRING":break;case"NULL":n=!0;break;default:return A.dr()}const i=se(this.expr.params[1]).evaluate(e,t);switch(i.type){case"STRING":break;case"NULL":n=!0;break;default:return A.dr()}return n?A.pr():this.Fr((o=s.value)==null?void 0:o.stringValue,(a=i.value)==null?void 0:a.stringValue)}}class dS extends Ki{Fr(e,t){try{const n=(function(o){let a="";for(let c=0;c<o.length;c++){const l=o.charAt(c);switch(l){case"_":a+=".";break;case"%":a+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":a+="\\"+l;break;default:a+=l}}return"^"+a+"$"})(t),s=ih.compile(n);return A.newValue({booleanValue:s.matches(e)})}catch(n){return st(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${n}`),A.dr()}}}class fS extends Ki{Fr(e,t){try{const n=ih.compile(t);return A.newValue({booleanValue:n.test(e)})}catch{return st(`Invalid regex pattern found in regex_contains: ${t}, returning error`),A.dr()}}}class CS extends Ki{Fr(e,t){try{return A.newValue({booleanValue:ih.compile(t).matches(e)})}catch{return st(`Invalid regex pattern found in regex_match: ${t}, returning error`),A.dr()}}}class pS extends Ki{Fr(e,t){return A.newValue({booleanValue:e.includes(t)})}}class gS extends Ki{Fr(e,t){return A.newValue({booleanValue:e.startsWith(t)})}}class mS extends Ki{Fr(e,t){return A.newValue({booleanValue:e.endsWith(t)})}}class _S{constructor(e){this.expr=e}evaluate(e,t){var s,i;q(this.expr.params.length===1,29079);const n=se(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":return A.newValue({stringValue:(i=(s=n.value)==null?void 0:s.stringValue)==null?void 0:i.toLowerCase()});case"NULL":return A.pr();default:return A.dr()}}}class ES{constructor(e){this.expr=e}evaluate(e,t){var s,i;q(this.expr.params.length===1,60487);const n=se(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":return A.newValue({stringValue:(i=(s=n.value)==null?void 0:s.stringValue)==null?void 0:i.toUpperCase()});case"NULL":return A.pr();default:return A.dr()}}}class IS{constructor(e){this.expr=e}evaluate(e,t){var s,i;q(this.expr.params.length===1,28544);const n=se(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":return A.newValue({stringValue:(i=(s=n.value)==null?void 0:s.stringValue)==null?void 0:i.trim()});case"NULL":return A.pr();default:return A.dr()}}}class yS{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map((o=>se(o).evaluate(e,t)));let s="",i=!1;for(const o of n)switch(o.type){case"STRING":s+=o.value.stringValue;break;case"NULL":i=!0;break;default:return A.dr()}return i?A.pr():A.newValue({stringValue:s})}}class wS{constructor(e){this.expr=e}evaluate(e,t){var o,a,c,l;q(this.expr.params.length===2,4483);const n=se(this.expr.params[0]).evaluate(e,t);switch(n.type){case"UNSET":return A.mr();case"MAP":break;default:return A.dr()}const s=se(this.expr.params[1]).evaluate(e,t);if(s.type!=="STRING")return A.dr();const i=(l=(a=(o=n.value)==null?void 0:o.mapValue)==null?void 0:a.fields)==null?void 0:l[(c=s.value)==null?void 0:c.stringValue];return i===void 0?A.mr():A.newValue(i)}}class Uh{constructor(e){this.expr=e}evaluate(e,t){var l,B;q(this.expr.params.length===2,25231,`${this.expr.name}() function should have exactly 2 params`);let n=!1;const s=se(this.expr.params[0]).evaluate(e,t);switch(s.type){case"VECTOR":break;case"NULL":n=!0;break;default:return A.dr()}const i=se(this.expr.params[1]).evaluate(e,t);switch(i.type){case"VECTOR":break;case"NULL":n=!0;break;default:return A.dr()}if(n)return A.pr();const o=uB(s.value),a=uB(i.value);if(o===void 0||a===void 0||((l=o.values)==null?void 0:l.length)!==((B=a.values)==null?void 0:B.length))return A.dr();const c=this.Or(o,a);return c===void 0||isNaN(c)?A.dr():A.newValue({doubleValue:c})}}class DS extends Uh{Or(e,t){const n=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(n.length===0)return;let i=0,o=0,a=0;for(let l=0;l<n.length;l++){if(!Sr(n[l])||!Sr(s[l]))return;const B=pt(n[l]),d=pt(s[l]);i+=B*d,o+=B*B,a+=d*d}const c=Math.sqrt(o)*Math.sqrt(a);if(c!==0)return 1-Math.max(-1,Math.min(1,i/c))}}class TS extends Uh{Or(e,t){const n=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(n.length===0)return 0;let i=0;for(let o=0;o<n.length;o++){if(!Sr(n[o])||!Sr(s[o]))return;i+=pt(n[o])*pt(s[o])}return i}}class AS extends Uh{Or(e,t){const n=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(n.length===0)return 0;let i=0;for(let o=0;o<n.length;o++){if(!Sr(n[o])||!Sr(s[o]))return;const a=pt(n[o]),c=pt(s[o]);i+=Math.pow(a-c,2)}return Math.sqrt(i)}}class RS{constructor(e){this.expr=e}evaluate(e,t){var s;q(this.expr.params.length===1,39044);const n=se(this.expr.params[0]).evaluate(e,t);switch(n.type){case"VECTOR":{const i=uB(n.value);return A.newValue({integerValue:((s=i==null?void 0:i.values)==null?void 0:s.length)??0})}case"NULL":return A.pr();default:return A.dr()}}}const ua=BigInt(-62135596800),la=BigInt(253402300799),zc=BigInt(1e3),Ar=BigInt(1e6),vS=ua*zc,PS=la*zc+BigInt(999),bS=ua*Ar,SS=la*Ar+BigInt(999999);function Hh(r){return r>=bS&&r<=SS}function PE(r){return r>=ua&&r<=la}function Ba(r,e){const t=BigInt(r);return!(t<ua||t>la)&&!(e<0||e>=1e9)&&(t!==ua||e===0)&&!(t===la&&e>999999999)}function bE(r,e){return e<0?{seconds:r-1,nanos:e+1e9}:{seconds:r,nanos:e}}function qh(r){return BigInt(r.seconds)*Ar+BigInt(Math.trunc(r.nanoseconds/1e3))}class jh{constructor(e){this.expr=e}evaluate(e,t){q(this.expr.params.length===1,49262,`${this.expr.name}() function should have exactly one parameter`);const n=se(this.expr.params[0]).evaluate(e,t);switch(n.type){case"INT":return this.toTimestamp(BigInt(n.value.integerValue));case"NULL":return A.pr();default:return A.dr()}}}class NS extends jh{toTimestamp(e){if(!Hh(e))return A.dr();let t=Number(e/Ar),n=Number(e%Ar*BigInt(1e3));const s=bE(t,n);return t=s.seconds,n=s.nanos,Ba(t,n)?A.newValue({timestampValue:{seconds:t,nanos:n}}):A.dr()}}class OS extends jh{toTimestamp(e){if(!(function(o){return o>=vS&&o<=PS})(e))return A.dr();let t=Number(e/zc),n=Number(e%zc*BigInt(1e6));const s=bE(t,n);return t=s.seconds,n=s.nanos,Ba(t,n)?A.newValue({timestampValue:{seconds:t,nanos:n}}):A.dr()}}class FS extends jh{toTimestamp(e){if(!PE(e))return A.dr();const t=Number(e);return A.newValue({timestampValue:{seconds:t,nanos:0}})}}class Jh{constructor(e){this.expr=e}evaluate(e,t){q(this.expr.params.length===1,1265,`${this.expr.name}() function should have exactly one parameter`);const n=se(this.expr.params[0]).evaluate(e,t);switch(n.type){case"TIMESTAMP":break;case"NULL":return A.pr();default:return A.dr()}const s=Ih(n.value.timestampValue);return Ba(s.seconds,s.nanoseconds)?this.Mr(s):A.dr()}}class kS extends Jh{Mr(e){const t=qh(e);return Hh(t)?A.newValue({integerValue:`${t.toString()}`}):A.dr()}}class LS extends Jh{Mr(e){const t=qh(e),n=t/BigInt(1e3),s=t%BigInt(1e3);return n>BigInt(0)||s===BigInt(0)?A.newValue({integerValue:n.toString()}):A.newValue({integerValue:(n-BigInt(1)).toString()})}}class xS extends Jh{Mr(e){const t=BigInt(e.seconds);return PE(t)?A.newValue({integerValue:t.toString()}):A.dr()}}class SE{constructor(e){this.expr=e}evaluate(e,t){q(this.expr.params.length===3,2775,`${this.expr.name}() function should have exactly 3 parameters`);let n=!1;const s=se(this.expr.params[0]).evaluate(e,t);switch(s.type){case"TIMESTAMP":break;case"NULL":n=!0;break;default:return A.dr()}const i=se(this.expr.params[1]).evaluate(e,t);let o;switch(i.type){case"STRING":if(o=(function(Z){switch(Z){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}})(i.value.stringValue),o===void 0)return A.dr();break;case"NULL":n=!0;break;default:return A.dr()}const a=se(this.expr.params[2]).evaluate(e,t);switch(a.type){case"INT":break;case"NULL":n=!0;break;default:return A.dr()}if(n)return A.pr();const c=BigInt(a.value.integerValue);let l;try{switch(o){case"microsecond":l=c;break;case"millisecond":l=c*BigInt(1e3);break;case"second":l=c*BigInt(1e6);break;case"minute":l=c*BigInt(6e7);break;case"hour":l=c*BigInt(36e8);break;case"day":l=c*BigInt(864e8);break;default:return A.dr()}if(o!=="microsecond"&&c!==BigInt(0)&&l/c!==BigInt(this.Nr(o)))return A.dr()}catch(H){return st(`Error during timestamp arithmetic: ${H}`),A.dr()}const B=Ih(s.value.timestampValue);if(!Ba(B.seconds,B.nanoseconds))return A.dr();const d=qh(B),C=this.Lr(d,l);if(!Hh(C))return A.dr();const g=Number(C/Ar),I=C%Ar,P=Number((I<0?I+Ar:I)*BigInt(1e3)),F=I<0?g-1:g;return Ba(F,P)?A.newValue({timestampValue:{seconds:F,nanos:P}}):A.dr()}Nr(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class VS extends SE{Lr(e,t){return e+t}}class MS extends SE{Lr(e,t){return e-t}}function ha(r){if((r=RE(r))instanceof Ns)return`fld(${r.fieldName})`;if(r instanceof Os)return`cst(${(function(t){return t===null?"null":typeof t=="number"?t.toString():typeof t=="string"?`"${t}"`:t instanceof we?`ref(${t.path})`:t instanceof bt?`vec(${JSON.stringify(t)})`:JSON.stringify(t)})(r.value)})`;if(r instanceof V)return`fn(${r.name},[${r.params.map(ha).join(",")}])`;if(r.expressionType==="ListOfExpressions")return`list([${r.ur.map(ha).join(",")}])`;throw new Error(`Unrecognized expr ${JSON.stringify(r,null,2)}`)}function GS(r){if(r instanceof wE)return`${r._name}(${dc(r.fields)})`;if(r instanceof DE){let e=`${r._name}(${dc(r.accumulators)})`;return r.groups.size>0&&(e+=`grouping(${dc(r.groups)})`),e}if(r instanceof TE)return`${r._name}(${dc(r.groups)})`;if(r instanceof Pa)return`${r._name}(${r.Er})`;if(r instanceof ba)return`${r._name}(${r.collectionId})`;if(r instanceof Su)return`${r._name}()`;if(r instanceof Nu)return`${r._name}(${r.hr.sort()})`;if(r instanceof Sa)return`${r._name}(${ha(r.condition)})`;if(r instanceof kr)return`${r._name}(${r.limit})`;if(r instanceof pn)return`${r._name}(${(function(t){return t.map((n=>`${ha(n.expr)}${n.direction}`)).join(",")})(r.orderings)})`;throw new Error(`Unrecognized stage ${r._name}`)}function dc(r){return`${Array.from(r.entries()).sort().map((([e,t])=>`${e}=${ha(t)}`)).join(",")}`}function Gn(r){return r.stages.map((e=>GS(e))).join("|")}function NE(r,e){return Gn(r)===Gn(e)}function Ge(r){return r instanceof Et}function Ap(r){return Ge(r)?Gn(r):Mo(r)}function OE(r){return Ge(r)?Gn(r):(function(t){return`${Hc(It(t))}|lt:${t.limitType}`})(r)}function Fu(r,e){return r instanceof Et&&e instanceof Et?NE(r,e):!(r instanceof Et&&!(e instanceof Et)||!(r instanceof Et)&&e instanceof Et)&&R_(r,e)}function ku(r){return Sn(r)?Gn(r):Hc(r)}function Kh(r,e){return r instanceof Et&&e instanceof Et?NE(r,e):!(r instanceof Et&&!(e instanceof Et)||!(r instanceof Et)&&e instanceof Et)&&ph(r,e)}function US(r,e){const t=(function(s){let i=!1;const o=[];for(const a of s)if(a instanceof pn)if(i=!0,a.orderings.some((c=>c.expr instanceof Ns&&c.expr.fieldName===fn)))o.push(a);else{const c=a.orderings.map((l=>l));c.push(vc(fn).ascending()),o.push(new pn(c,{}))}else a instanceof kr&&(i||(o.push(new pn([vc(fn).ascending()],{})),i=!0)),o.push(a);return i||o.push(new pn([vc(fn).ascending()],{})),o})(r.stages);if(r.userDataReader){const n=r.userDataReader.createContext(3,"toCorePipeline");t.forEach((s=>s._readUserData(n)))}return new Et(r.userDataReader.serializer,t,e)}/**
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
 */class zh{constructor(e,t,n,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=n,this.mutations=s}applyToRemoteDocument(e,t){const n=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&Xv(i,e,n[s])}}applyToLocalView(e,t){for(const n of this.baseMutations)n.key.isEqual(e.key)&&(t=Vo(n,e,t,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(e.key)&&(t=Vo(n,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const n=N_();return this.mutations.forEach((s=>{const i=e.get(s.key),o=i.overlayedDocument;let a=this.applyToLocalView(o,i.mutatedFields);a=t.has(s.key)?null:a;const c=d_(o,a);c!==null&&n.set(s.key,c),o.isValidDocument()||o.convertToNoDocument(te.min())})),n}keys(){return this.mutations.reduce(((e,t)=>e.add(t.key)),ae())}isEqual(e){return this.batchId===e.batchId&&ci(this.mutations,e.mutations,((t,n)=>np(t,n)))&&ci(this.baseMutations,e.baseMutations,((t,n)=>np(t,n)))}}class Wh{constructor(e,t,n,s){this.batch=e,this.commitVersion=t,this.mutationResults=n,this.docVersions=s}static from(e,t,n){q(e.mutations.length===n.length,58842,{Br:e.mutations.length,Ur:n.length});let s=(function(){return gP})();const i=e.mutations;for(let o=0;o<i.length;o++)s=s.insert(i[o].key,n[o].version);return new Wh(e,t,n,s)}}/**
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
 */const Wc="";function yt(r){let e="";for(let t=0;t<r.length;t++)e.length>0&&(e=Rp(e)),e=HS(r.get(t),e);return Rp(e)}function HS(r,e){let t=e;const n=r.length;for(let s=0;s<n;s++){const i=r.charAt(s);switch(i){case"\0":t+="";break;case Wc:t+="";break;default:t+=i}}return t}function Rp(r){return r+Wc+""}function gn(r){const e=r.length;if(q(e>=2,64408,{path:r}),e===2)return q(r.charAt(0)===Wc&&r.charAt(1)==="",56145,{path:r}),ce.emptyPath();const t=e-2,n=[];let s="";for(let i=0;i<e;){const o=r.indexOf(Wc,i);switch((o<0||o>t)&&Y(50515,{path:r}),r.charAt(o+1)){case"":const a=r.substring(i,o);let c;s.length===0?c=a:(s+=a,c=s,s=""),n.push(c);break;case"":s+=r.substring(i,o),s+="\0";break;case"":s+=r.substring(i,o+1);break;default:Y(61167,{path:r})}i=o+2}return new ce(n)}/**
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
 */const es="remoteDocuments",Fa="owner",Gs="owner",da="mutationQueues",qS="userId",rn="mutations",vp="batchId",cs="userMutationsIndex",Pp=["userId","batchId"];/**
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
 */function Pc(r,e){return[r,yt(e)]}function FE(r,e,t){return[r,yt(e),t]}const jS={},Ii="documentMutations",Qc="remoteDocumentsV14",JS=["prefixPath","collectionGroup","readTime","documentId"],bc="documentKeyIndex",KS=["prefixPath","collectionGroup","documentId"],kE="collectionGroupIndex",zS=["collectionGroup","readTime","prefixPath","documentId"],fa="remoteDocumentGlobal",IB="remoteDocumentGlobalKey",yi="targets",LE="queryTargetsIndex",WS=["canonicalId","targetId"],wi="targetDocuments",QS=["targetId","path"],Qh="documentTargetsIndex",$S=["path","targetId"],$c="targetGlobalKey",hs="targetGlobal",Ca="collectionParents",YS=["collectionId","parent"],Di="clientMetadata",XS="clientId",Lu="bundles",ZS="bundleId",xu="namedQueries",eN="name",$h="indexConfiguration",tN="indexId",yB="collectionGroupIndex",nN="collectionGroup",Jo="indexState",rN=["indexId","uid"],xE="sequenceNumberIndex",sN=["uid","sequenceNumber"],Ko="indexEntries",iN=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],VE="documentKeyIndex",oN=["indexId","uid","orderedDocumentKey"],Vu="documentOverlays",aN=["userId","collectionPath","documentId"],wB="collectionPathOverlayIndex",cN=["userId","collectionPath","largestBatchId"],ME="collectionGroupOverlayIndex",uN=["userId","collectionGroup","largestBatchId"],Yh="globals",lN="name",GE=[da,rn,Ii,es,yi,Fa,hs,wi,Di,fa,Ca,Lu,xu],BN=[...GE,Vu],UE=[da,rn,Ii,Qc,yi,Fa,hs,wi,Di,fa,Ca,Lu,xu,Vu],HE=UE,Xh=[...HE,$h,Jo,Ko],hN=Xh,qE=[...Xh,Yh],dN=qE;/**
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
 */function jE(r,e,t){const n=r.store(rn),s=r.store(Ii),i=[],o=IDBKeyRange.only(t.batchId);let a=0;const c=n.jn({range:o},((B,d,C)=>(a++,C.delete())));i.push(c.next((()=>{q(a===1,47070,{batchId:t.batchId})})));const l=[];for(const B of t.mutations){const d=FE(e,B.key.path,t.batchId);i.push(s.delete(d)),l.push(B.key)}return b.waitFor(i).next((()=>l))}function Yc(r){if(!r)return 0;let e;if(r.document)e=r.document;else if(r.unknownDocument)e=r.unknownDocument;else{if(!r.noDocument)throw Y(14731);e=r.noDocument}return JSON.stringify(e).length}/**
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
 */class DB extends rE{constructor(e,t){super(),this.kr=e,this.currentSequenceNumber=t}}function ct(r,e){const t=W(r);return yn.xn(t.kr,e)}/**
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
 */class Zh{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
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
 */class mn{constructor(e,t,n,s,i=te.min(),o=te.min(),a=Oe.EMPTY_BYTE_STRING,c=null){this.target=e,this.targetId=t,this.purpose=n,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=a,this.expectedCount=c}withSequenceNumber(e){return new mn(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new mn(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new mn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new mn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
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
 */class JE{constructor(e){this.qr=e}}function fN(r,e){let t;if(e.document)t=Au(r.qr,e.document,!!e.hasCommittedMutations);else if(e.noDocument){const n=J.fromSegments(e.noDocument.path),s=ys(e.noDocument.readTime);t=xe.newNoDocument(n,s),e.hasCommittedMutations&&t.setHasCommittedMutations()}else{if(!e.unknownDocument)return Y(56709);{const n=J.fromSegments(e.unknownDocument.path),s=ys(e.unknownDocument.version);t=xe.newUnknownDocument(n,s)}}return e.readTime&&t.setReadTime((function(s){const i=new ye(s[0],s[1]);return te.fromTimestamp(i)})(e.readTime)),t}function bp(r,e){const t=e.key,n={prefixPath:t.getCollectionPath().popLast().toArray(),collectionGroup:t.collectionGroup,documentId:t.path.lastSegment(),readTime:Xc(e.readTime),hasCommittedMutations:e.hasCommittedMutations};if(e.isFoundDocument())n.document=(function(i,o){return{name:Ei(i,o.key),fields:o.data.value.mapValue.fields,updateTime:_i(i,o.version.toTimestamp()),createTime:_i(i,o.createTime.toTimestamp())}})(r.qr,e);else if(e.isNoDocument())n.noDocument={path:t.path.toArray(),readTime:Is(e.version)};else{if(!e.isUnknownDocument())return Y(57904,{document:e});n.unknownDocument={path:t.path.toArray(),version:Is(e.version)}}return n}function Xc(r){const e=r.toTimestamp();return[e.seconds,e.nanoseconds]}function Is(r){const e=r.toTimestamp();return{seconds:e.seconds,nanoseconds:e.nanoseconds}}function ys(r){const e=new ye(r.seconds,r.nanoseconds);return te.fromTimestamp(e)}function rs(r,e){const t=(e.baseMutations||[]).map((i=>mB(r.qr,i)));for(let i=0;i<e.mutations.length-1;++i){const o=e.mutations[i];if(i+1<e.mutations.length&&e.mutations[i+1].transform!==void 0){const a=e.mutations[i+1];o.updateTransforms=a.transform.fieldTransforms,e.mutations.splice(i+1,1),++i}}const n=e.mutations.map((i=>mB(r.qr,i))),s=ye.fromMillis(e.localWriteTimeMs);return new zh(e.batchId,s,t,n)}function So(r,e){const t=ys(e.readTime),n=e.lastLimboFreeSnapshotVersion!==void 0?ys(e.lastLimboFreeSnapshotVersion):te.min();let s;return s=(function(o){return o.structuredPipeline!==void 0})(e.query)?(function(o,a){var B,d;const c=o.structuredPipeline;q((((B=c==null?void 0:c.pipeline)==null?void 0:B.stages)??[]).length>0,1845);const l=(d=c==null?void 0:c.pipeline)==null?void 0:d.stages.map(CN);return new Et(a,l)})(e.query,r.qr):(function(o){return o.documents!==void 0})(e.query)?(function(o){const a=o.documents.length;return q(a===1,1966,{count:a}),It(qi(M_(o.documents[0])))})(e.query):(function(o){return It(q_(o))})(e.query),new mn(s,e.targetId,"TargetPurposeListen",e.lastListenSequenceNumber,t,n,Oe.fromBase64String(e.resumeToken))}function KE(r,e){const t=Is(e.snapshotVersion),n=Is(e.lastLimboFreeSnapshotVersion);let s;s=Sn(e.target)?j_(r.qr,e.target):gh(e.target)?U_(r.qr,e.target):Ru(r.qr,e.target).be;const i=e.resumeToken.toBase64();return{targetId:e.targetId,canonicalId:ku(e.target),readTime:t,resumeToken:i,lastListenSequenceNumber:e.sequenceNumber,lastLimboFreeSnapshotVersion:n,query:s}}function Mu(r){const e=q_({parent:r.parent,structuredQuery:r.structuredQuery});return r.limitType==="LAST"?jc(e,e.limit,"L"):e}function fc(r,e){return new Zh(e.largestBatchId,mB(r.qr,e.overlayMutation))}function Sp(r,e){const t=e.path.lastSegment();return[r,yt(e.path.popLast()),t]}function Np(r,e,t,n){return{indexId:r,uid:e,sequenceNumber:t,readTime:Is(n.readTime),documentKey:yt(n.documentKey.path),largestBatchId:n.largestBatchId}}function CN(r){switch(r.name){case"collection":return new Pa(r.args[0].referenceValue,{});case"collection_group":return new ba(r.args[1].stringValue,{});case"database":return new Su({});case"documents":return new Nu(r.args.map((e=>e.referenceValue)),{});case"where":return new Sa(TB(r.args[0]),{});case"limit":{const e=r.args[0].integerValue??r.args[0].doubleValue;return new kr(typeof e=="number"?e:Number(e),{})}case"sort":return new pn(r.args.map((e=>(function(n){var i,o;const s=(i=n.mapValue)==null?void 0:i.fields;return new xh(TB(s.expression),(o=s.direction)==null?void 0:o.stringValue,"orderingFromProto")})(e))),{});default:throw new Error(`Stage type: ${r.name} not supported.`)}}function TB(r){return r.fieldReferenceValue?new Ns(un("_exprFromProto",r.fieldReferenceValue),"_exprFromProto"):r.functionValue?(function(t){var n;return new V(t.functionValue.name,((n=t.functionValue.args)==null?void 0:n.map(TB))||[])})(r):Os._fromProto(r)}class Gu{constructor(e,t,n,s){this.userId=e,this.serializer=t,this.indexManager=n,this.referenceDelegate=s,this.$r={}}static Kr(e,t,n,s){q(e.uid!=="",64387);const i=e.isAuthenticated()?e.uid:"";return new Gu(i,t,n,s)}checkEmpty(e){let t=!0;const n=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return ur(e).jn({index:cs,range:n},((s,i,o)=>{t=!1,o.done()})).next((()=>t))}addMutationBatch(e,t,n,s){const i=Ys(e),o=ur(e);return o.add({}).next((a=>{q(typeof a=="number",49019);const c=new zh(a,t,n,s),l=(function(g,I,P){const F=P.baseMutations.map((Z=>oa(g.qr,Z))),H=P.mutations.map((Z=>oa(g.qr,Z)));return{userId:I,batchId:P.batchId,localWriteTimeMs:P.localWriteTime.toMillis(),baseMutations:F,mutations:H}})(this.serializer,this.userId,c),B=[];let d=new De(((C,g)=>ie(C.canonicalString(),g.canonicalString())));for(const C of s){const g=FE(this.userId,C.key.path,a);d=d.add(C.key.path.popLast()),B.push(o.put(l)),B.push(i.put(g,jS))}return d.forEach((C=>{B.push(this.indexManager.addToCollectionParentIndex(e,C))})),e.addOnCommittedListener((()=>{this.$r[a]=c.keys()})),b.waitFor(B).next((()=>c))}))}lookupMutationBatch(e,t){return ur(e).get(t).next((n=>n?(q(n.userId===this.userId,48,"Unexpected user for mutation batch",{userId:n.userId,batchId:t}),rs(this.serializer,n)):null))}Qr(e,t){return this.$r[t]?b.resolve(this.$r[t]):this.lookupMutationBatch(e,t).next((n=>{if(n){const s=n.keys();return this.$r[t]=s,s}return null}))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,s=IDBKeyRange.lowerBound([this.userId,n]);let i=null;return ur(e).jn({index:cs,range:s},((o,a,c)=>{a.userId===this.userId&&(q(a.batchId>=n,47524,{Wr:n}),i=rs(this.serializer,a)),c.done()})).next((()=>i))}getHighestUnacknowledgedBatchId(e){const t=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let n=Tr;return ur(e).jn({index:cs,range:t,reverse:!0},((s,i,o)=>{n=i.batchId,o.done()})).next((()=>n))}getAllMutationBatches(e){const t=IDBKeyRange.bound([this.userId,Tr],[this.userId,Number.POSITIVE_INFINITY]);return ur(e).Kn(cs,t).next((n=>n.map((s=>rs(this.serializer,s)))))}getAllMutationBatchesAffectingDocumentKey(e,t){const n=Pc(this.userId,t.path),s=IDBKeyRange.lowerBound(n),i=[];return Ys(e).jn({range:s},((o,a,c)=>{const[l,B,d]=o,C=gn(B);if(l===this.userId&&t.path.isEqual(C))return ur(e).get(d).next((g=>{if(!g)throw Y(61480,{Gr:o,batchId:d});q(g.userId===this.userId,10503,"Unexpected user for mutation batch",{userId:g.userId,batchId:d}),i.push(rs(this.serializer,g))}));c.done()})).next((()=>i))}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new De(ie);const s=[];return t.forEach((i=>{const o=Pc(this.userId,i.path),a=IDBKeyRange.lowerBound(o),c=Ys(e).jn({range:a},((l,B,d)=>{const[C,g,I]=l,P=gn(g);C===this.userId&&i.path.isEqual(P)?n=n.add(I):d.done()}));s.push(c)})),b.waitFor(s).next((()=>this.zr(e,n)))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,s=n.length+1,i=Pc(this.userId,n),o=IDBKeyRange.lowerBound(i);let a=new De(ie);return Ys(e).jn({range:o},((c,l,B)=>{const[d,C,g]=c,I=gn(C);d===this.userId&&n.isPrefixOf(I)?I.length===s&&(a=a.add(g)):B.done()})).next((()=>this.zr(e,a)))}zr(e,t){const n=[],s=[];return t.forEach((i=>{s.push(ur(e).get(i).next((o=>{if(o===null)throw Y(35274,{batchId:i});q(o.userId===this.userId,9748,"Unexpected user for mutation batch",{userId:o.userId,batchId:i}),n.push(rs(this.serializer,o))})))})),b.waitFor(s).next((()=>n))}removeMutationBatch(e,t){return jE(e.kr,this.userId,t).next((n=>(e.addOnCommittedListener((()=>{this.jr(t.batchId)})),b.forEach(n,(s=>this.referenceDelegate.markPotentiallyOrphaned(e,s))))))}jr(e){delete this.$r[e]}performConsistencyCheck(e){return this.checkEmpty(e).next((t=>{if(!t)return b.resolve();const n=IDBKeyRange.lowerBound((function(o){return[o]})(this.userId)),s=[];return Ys(e).jn({range:n},((i,o,a)=>{if(i[0]===this.userId){const c=gn(i[1]);s.push(c)}else a.done()})).next((()=>{q(s.length===0,56720,{Hr:s.map((i=>i.canonicalString()))})}))}))}containsKey(e,t){return zE(e,this.userId,t)}Jr(e){return WE(e).get(this.userId).next((t=>t||{userId:this.userId,lastAcknowledgedBatchId:Tr,lastStreamToken:""}))}}function zE(r,e,t){const n=Pc(e,t.path),s=n[1],i=IDBKeyRange.lowerBound(n);let o=!1;return Ys(r).jn({range:i,zn:!0},((a,c,l)=>{const[B,d,C]=a;B===e&&d===s&&(o=!0),l.done()})).next((()=>o))}function ur(r){return ct(r,rn)}function Ys(r){return ct(r,Ii)}function WE(r){return ct(r,da)}/**
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
 */class pN{getBundleMetadata(e,t){return Op(e).get(t).next((n=>{if(n)return(function(i){return{id:i.bundleId,createTime:ys(i.createTime),version:i.version}})(n)}))}saveBundleMetadata(e,t){return Op(e).put((function(s){return{bundleId:s.id,createTime:Is(Je(s.createTime)),version:s.version}})(t))}getNamedQuery(e,t){return Fp(e).get(t).next((n=>{if(n)return(function(i){return{name:i.name,query:Mu(i.bundledQuery),readTime:ys(i.readTime)}})(n)}))}saveNamedQuery(e,t){return Fp(e).put((function(s){return{name:s.name,readTime:Is(Je(s.readTime)),bundledQuery:s.bundledQuery}})(t))}}function Op(r){return ct(r,Lu)}function Fp(r){return ct(r,xu)}/**
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
 */class Uu{constructor(e,t){this.serializer=e,this.userId=t}static Kr(e,t){const n=t.uid||"";return new Uu(e,n)}getOverlay(e,t){return Us(e).get(Sp(this.userId,t)).next((n=>n?fc(this.serializer,n):null))}getOverlays(e,t){const n=en();return b.forEach(t,(s=>this.getOverlay(e,s).next((i=>{i!==null&&n.set(s,i)})))).next((()=>n))}getAllOverlays(e,t){const n=en();return Us(e).jn(((s,i)=>{const o=fc(this.serializer,i);o.largestBatchId>t&&n.set(o.getKey(),o)})).next((()=>n))}saveOverlays(e,t,n){const s=[];return n.forEach(((i,o)=>{const a=new Zh(t,o);s.push(this.Yr(e,a))})),b.waitFor(s)}removeOverlaysForBatchId(e,t,n){const s=new Set;t.forEach((o=>s.add(yt(o.getCollectionPath()))));const i=[];return s.forEach((o=>{const a=IDBKeyRange.bound([this.userId,o,n],[this.userId,o,n+1],!1,!0);i.push(Us(e).Gn(wB,a))})),b.waitFor(i)}getOverlaysForCollection(e,t,n){const s=en(),i=yt(t),o=IDBKeyRange.bound([this.userId,i,n],[this.userId,i,Number.POSITIVE_INFINITY],!0);return Us(e).Kn(wB,o).next((a=>{for(const c of a){const l=fc(this.serializer,c);s.set(l.getKey(),l)}return s}))}getOverlaysForCollectionGroup(e,t,n,s){const i=en();let o;const a=IDBKeyRange.bound([this.userId,t,n],[this.userId,t,Number.POSITIVE_INFINITY],!0);return Us(e).jn({index:ME,range:a},((c,l,B)=>{const d=fc(this.serializer,l);i.size()<s||d.largestBatchId===o?(i.set(d.getKey(),d),o=d.largestBatchId):B.done()})).next((()=>i))}Yr(e,t){return Us(e).put((function(s,i,o){const[a,c,l]=Sp(i,o.mutation.key);return{userId:i,collectionPath:c,documentId:l,collectionGroup:o.mutation.key.getCollectionGroup(),largestBatchId:o.largestBatchId,overlayMutation:oa(s.qr,o.mutation)}})(this.serializer,this.userId,t))}}function Us(r){return ct(r,Vu)}/**
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
 */class gN{Zr(e){return ct(e,Yh)}getSessionToken(e){return this.Zr(e).get("sessionToken").next((t=>{const n=t==null?void 0:t.value;return n?Oe.fromUint8Array(n):Oe.EMPTY_BYTE_STRING}))}setSessionToken(e,t){return this.Zr(e).put({name:"sessionToken",value:t.toUint8Array()})}}/**
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
 */class ss{constructor(){}Xr(e,t){this.ei(e,t),t.ti()}ei(e,t){if("nullValue"in e)this.ni(t,5);else if("booleanValue"in e)this.ni(t,10),t.ri(e.booleanValue?1:0);else if("integerValue"in e)this.ni(t,15),t.ri(Ne(e.integerValue));else if("doubleValue"in e){const n=Ne(e.doubleValue);isNaN(n)?this.ni(t,13):(this.ni(t,15),li(n)?t.ri(0):t.ri(n))}else if("timestampValue"in e){let n=e.timestampValue;this.ni(t,20),typeof n=="string"&&(n=Jn(n)),t.ii(`${n.seconds||""}`),t.ri(n.nanos||0)}else if("stringValue"in e)this.si(e.stringValue,t),this._i(t);else if("bytesValue"in e)this.ni(t,30),t.oi(Kn(e.bytesValue)),this._i(t);else if("referenceValue"in e)this.ai(e.referenceValue,t);else if("geoPointValue"in e){const n=e.geoPointValue;this.ni(t,45),t.ri(n.latitude||0),t.ri(n.longitude||0)}else"mapValue"in e?o_(e)?this.ni(t,Number.MAX_SAFE_INTEGER):gs(e)?this.ui(e.mapValue,t):(this.ci(e.mapValue,t),this._i(t)):"arrayValue"in e?(this.li(e.arrayValue,t),this._i(t)):Y(19022,{Ei:e})}si(e,t){this.ni(t,25),this.hi(e,t)}hi(e,t){t.ii(e)}ci(e,t){const n=e.fields||{};this.ni(t,55);for(const s of Object.keys(n))this.si(s,t),this.ei(n[s],t)}ui(e,t){var o,a;const n=e.fields||{};this.ni(t,53);const s=Cs,i=((a=(o=n[s].arrayValue)==null?void 0:o.values)==null?void 0:a.length)||0;this.ni(t,15),t.ri(Ne(i)),this.si(s,t),this.ei(n[s],t)}li(e,t){const n=e.values||[];this.ni(t,50);for(const s of n)this.ei(s,t)}ai(e,t){this.ni(t,37),J.fromName(e).path.forEach((n=>{this.ni(t,60),this.hi(n,t)}))}ni(e,t){e.ri(t)}_i(e){e.ri(2)}}ss.Ti=new ss;/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law | agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES | CONDITIONS OF ANY KIND, either express | implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hs=255;function mN(r){if(r===0)return 8;let e=0;return r>>4||(e+=4,r<<=4),r>>6||(e+=2,r<<=2),r>>7||(e+=1),e}function kp(r){const e=64-(function(n){let s=0;for(let i=0;i<8;++i){const o=mN(255&n[i]);if(s+=o,o!==8)break}return s})(r);return Math.ceil(e/8)}class _N{constructor(){this.buffer=new Uint8Array(1024),this.position=0}Pi(e){const t=e[Symbol.iterator]();let n=t.next();for(;!n.done;)this.Ri(n.value),n=t.next();this.Ii()}Ai(e){const t=e[Symbol.iterator]();let n=t.next();for(;!n.done;)this.Vi(n.value),n=t.next();this.di()}fi(e){for(const t of e){const n=t.charCodeAt(0);if(n<128)this.Ri(n);else if(n<2048)this.Ri(960|n>>>6),this.Ri(128|63&n);else if(t<"\uD800"||"\uDBFF"<t)this.Ri(480|n>>>12),this.Ri(128|63&n>>>6),this.Ri(128|63&n);else{const s=t.codePointAt(0);this.Ri(240|s>>>18),this.Ri(128|63&s>>>12),this.Ri(128|63&s>>>6),this.Ri(128|63&s)}}this.Ii()}mi(e){for(const t of e){const n=t.charCodeAt(0);if(n<128)this.Vi(n);else if(n<2048)this.Vi(960|n>>>6),this.Vi(128|63&n);else if(t<"\uD800"||"\uDBFF"<t)this.Vi(480|n>>>12),this.Vi(128|63&n>>>6),this.Vi(128|63&n);else{const s=t.codePointAt(0);this.Vi(240|s>>>18),this.Vi(128|63&s>>>12),this.Vi(128|63&s>>>6),this.Vi(128|63&s)}}this.di()}pi(e){const t=this.gi(e),n=kp(t);this.yi(1+n),this.buffer[this.position++]=255&n;for(let s=t.length-n;s<t.length;++s)this.buffer[this.position++]=255&t[s]}wi(e){const t=this.gi(e),n=kp(t);this.yi(1+n),this.buffer[this.position++]=~(255&n);for(let s=t.length-n;s<t.length;++s)this.buffer[this.position++]=~(255&t[s])}bi(){this.Si(Hs),this.Si(255)}Di(){this.xi(Hs),this.xi(255)}reset(){this.position=0}seed(e){this.yi(e.length),this.buffer.set(e,this.position),this.position+=e.length}Ci(){return this.buffer.slice(0,this.position)}gi(e){const t=(function(i){const o=new DataView(new ArrayBuffer(8));return o.setFloat64(0,i,!1),new Uint8Array(o.buffer)})(e),n=!!(128&t[0]);t[0]^=n?255:128;for(let s=1;s<t.length;++s)t[s]^=n?255:0;return t}Ri(e){const t=255&e;t===0?(this.Si(0),this.Si(255)):t===Hs?(this.Si(Hs),this.Si(0)):this.Si(t)}Vi(e){const t=255&e;t===0?(this.xi(0),this.xi(255)):t===Hs?(this.xi(Hs),this.xi(0)):this.xi(e)}Ii(){this.Si(0),this.Si(1)}di(){this.xi(0),this.xi(1)}Si(e){this.yi(1),this.buffer[this.position++]=e}xi(e){this.yi(1),this.buffer[this.position++]=~e}yi(e){const t=e+this.position;if(t<=this.buffer.length)return;let n=2*this.buffer.length;n<t&&(n=t);const s=new Uint8Array(n);s.set(this.buffer),this.buffer=s}}class EN{constructor(e){this.Fi=e}oi(e){this.Fi.Pi(e)}ii(e){this.Fi.fi(e)}ri(e){this.Fi.pi(e)}ti(){this.Fi.bi()}}class IN{constructor(e){this.Fi=e}oi(e){this.Fi.Ai(e)}ii(e){this.Fi.mi(e)}ri(e){this.Fi.wi(e)}ti(){this.Fi.Di()}}class Io{constructor(){this.Fi=new _N,this.ascending=new EN(this.Fi),this.descending=new IN(this.Fi)}seed(e){this.Fi.seed(e)}Oi(e){return e===0?this.ascending:this.descending}Ci(){return this.Fi.Ci()}reset(){this.Fi.reset()}}/**
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
 */class is{constructor(e,t,n,s){this.Mi=e,this.Ni=t,this.Li=n,this.Bi=s}Ui(){const e=this.Bi.length,t=e===0||this.Bi[e-1]===255?e+1:e,n=new Uint8Array(t);return n.set(this.Bi,0),t!==e?n.set([0],this.Bi.length):++n[n.length-1],new is(this.Mi,this.Ni,this.Li,n)}ki(e,t,n){return{indexId:this.Mi,uid:e,arrayValue:Sc(this.Li),directionalValue:Sc(this.Bi),orderedDocumentKey:Sc(t),documentKey:n.path.toArray()}}qi(e,t,n){const s=this.ki(e,t,n);return[s.indexId,s.uid,s.arrayValue,s.directionalValue,s.orderedDocumentKey,s.documentKey]}}function lr(r,e){let t=r.Mi-e.Mi;return t!==0?t:(t=Lp(r.Li,e.Li),t!==0?t:(t=Lp(r.Bi,e.Bi),t!==0?t:J.comparator(r.Ni,e.Ni)))}function Lp(r,e){for(let t=0;t<r.length&&t<e.length;++t){const n=r[t]-e[t];if(n!==0)return n}return r.length-e.length}function Sc(r){return Dg()?(function(t){let n="";for(let s=0;s<t.length;s++)n+=String.fromCharCode(t[s]);return n})(r):r}function xp(r){return typeof r!="string"?r:(function(t){const n=new Uint8Array(t.length);for(let s=0;s<t.length;s++)n[s]=t.charCodeAt(s);return n})(r)}class Vp{constructor(e){this.$i=new De(((t,n)=>je.comparator(t.field,n.field))),this.collectionId=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment(),this.Ki=e.orderBy,this.Qi=[];for(const t of e.filters){const n=t;n.isInequality()?this.$i=this.$i.add(n):this.Qi.push(n)}}get Wi(){return this.$i.size>1}Gi(e){if(q(e.collectionGroup===this.collectionId,49279),this.Wi)return!1;const t=hB(e);if(t!==void 0&&!this.zi(t))return!1;const n=Zr(e);let s=new Set,i=0,o=0;for(;i<n.length&&this.zi(n[i]);++i)s=s.add(n[i].fieldPath.canonicalString());if(i===n.length)return!0;if(this.$i.size>0){const a=this.$i.getIterator().getNext();if(!s.has(a.field.canonicalString())){const c=n[i];if(!this.ji(a,c)||!this.Hi(this.Ki[o++],c))return!1}++i}for(;i<n.length;++i){const a=n[i];if(o>=this.Ki.length||!this.Hi(this.Ki[o++],a))return!1}return!0}Ji(){if(this.Wi)return null;let e=new De(je.comparator);const t=[];for(const n of this.Qi)if(!n.field.isKeyField())if(n.op==="array-contains"||n.op==="array-contains-any")t.push(new Bs(n.field,2));else{if(e.has(n.field))continue;e=e.add(n.field),t.push(new Bs(n.field,0))}for(const n of this.Ki)n.field.isKeyField()||e.has(n.field)||(e=e.add(n.field),t.push(new Bs(n.field,n.dir==="asc"?0:1)));return new gi(gi.UNKNOWN_ID,this.collectionId,t,mi.empty())}zi(e){for(const t of this.Qi)if(this.ji(t,e))return!0;return!1}ji(e,t){if(e===void 0||!e.field.isEqual(t.fieldPath))return!1;const n=e.op==="array-contains"||e.op==="array-contains-any";return t.kind===2===n}Hi(e,t){return!!e.field.isEqual(t.fieldPath)&&(t.kind===0&&e.dir==="asc"||t.kind===1&&e.dir==="desc")}}/**
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
 */function QE(r){var t,n;if(q(r instanceof pe||r instanceof Te,20012),r instanceof pe){if(r instanceof I_){const s=((n=(t=r.value.arrayValue)==null?void 0:t.values)==null?void 0:n.map((i=>pe.create(r.field,"==",i))))||[];return Te.create(s,"or")}return r}const e=r.filters.map((s=>QE(s)));return Te.create(e,r.op)}function yN(r){if(r.getFilters().length===0)return[];const e=vB(QE(r));return q($E(e),7391),AB(e)||RB(e)?[e]:e.getFilters()}function AB(r){return r instanceof pe}function RB(r){return r instanceof Te&&fh(r)}function $E(r){return AB(r)||RB(r)||(function(t){if(t instanceof Te&&lB(t)){for(const n of t.getFilters())if(!AB(n)&&!RB(n))return!1;return!0}return!1})(r)}function vB(r){if(q(r instanceof pe||r instanceof Te,34018),r instanceof pe)return r;if(r.filters.length===1)return vB(r.filters[0]);const e=r.filters.map((n=>vB(n)));let t=Te.create(e,r.op);return t=Zc(t),$E(t)?t:(q(t instanceof Te,64498),q(Ci(t),40251),q(t.filters.length>1,57927),t.filters.reduce(((n,s)=>ed(n,s))))}function ed(r,e){let t;return q(r instanceof pe||r instanceof Te,38388),q(e instanceof pe||e instanceof Te,25473),t=r instanceof pe?e instanceof pe?(function(s,i){return Te.create([s,i],"and")})(r,e):Mp(r,e):e instanceof pe?Mp(e,r):(function(s,i){if(q(s.filters.length>0&&i.filters.length>0,48005),Ci(s)&&Ci(i))return m_(s,i.getFilters());const o=lB(s)?s:i,a=lB(s)?i:s,c=o.filters.map((l=>ed(l,a)));return Te.create(c,"or")})(r,e),Zc(t)}function Mp(r,e){if(Ci(e))return m_(e,r.getFilters());{const t=e.filters.map((n=>ed(r,n)));return Te.create(t,"or")}}function Zc(r){if(q(r instanceof pe||r instanceof Te,11850),r instanceof pe)return r;const e=r.getFilters();if(e.length===1)return Zc(e[0]);if(p_(r))return r;const t=e.map((s=>Zc(s))),n=[];return t.forEach((s=>{s instanceof pe?n.push(s):s instanceof Te&&(s.op===r.op?n.push(...s.filters):n.push(s))})),n.length===1?n[0]:Te.create(n,r.op)}/**
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
 */class wN{constructor(){this.Yi=new td}addToCollectionParentIndex(e,t){return this.Yi.add(t),b.resolve()}getCollectionParents(e,t){return b.resolve(this.Yi.getEntries(t))}addFieldIndex(e,t){return b.resolve()}deleteFieldIndex(e,t){return b.resolve()}deleteAllFieldIndexes(e){return b.resolve()}createTargetIndexes(e,t){return b.resolve()}getDocumentsMatchingTarget(e,t){return b.resolve(null)}getIndexType(e,t){return b.resolve(0)}getFieldIndexes(e,t){return b.resolve([])}getNextCollectionGroupToUpdate(e){return b.resolve(null)}getMinOffset(e,t){return b.resolve(Kt.min())}getMinOffsetFromCollectionGroup(e,t){return b.resolve(Kt.min())}updateCollectionGroup(e,t,n){return b.resolve()}updateIndexEntries(e,t){return b.resolve()}}class td{constructor(){this.index={}}add(e){const t=e.lastSegment(),n=e.popLast(),s=this.index[t]||new De(ce.comparator),i=!s.has(n);return this.index[t]=s.add(n),i}has(e){const t=e.lastSegment(),n=e.popLast(),s=this.index[t];return s&&s.has(n)}getEntries(e){return(this.index[e]||new De(ce.comparator)).toArray()}}/**
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
 */const Gp="IndexedDbIndexManager",Cc=new Uint8Array(0);class DN{constructor(e,t){this.databaseId=t,this.Zi=new td,this.Xi=new Zn((n=>Hc(n)),((n,s)=>ph(n,s))),this.uid=e.uid||""}addToCollectionParentIndex(e,t){if(!this.Zi.has(t)){const n=t.lastSegment(),s=t.popLast();e.addOnCommittedListener((()=>{this.Zi.add(t)}));const i={collectionId:n,parent:yt(s)};return Up(e).put(i)}return b.resolve()}getCollectionParents(e,t){const n=[],s=IDBKeyRange.bound([t,""],[Qm(t),""],!1,!0);return Up(e).Kn(s).next((i=>{for(const o of i){if(o.collectionId!==t)break;n.push(gn(o.parent))}return n}))}addFieldIndex(e,t){const n=yo(e),s=(function(a){return{indexId:a.indexId,collectionGroup:a.collectionGroup,fields:a.fields.map((c=>[c.fieldPath.canonicalString(),c.kind]))}})(t);delete s.indexId;const i=n.add(s);if(t.indexState){const o=js(e);return i.next((a=>{o.put(Np(a,this.uid,t.indexState.sequenceNumber,t.indexState.offset))}))}return i.next()}deleteFieldIndex(e,t){const n=yo(e),s=js(e),i=qs(e);return n.delete(t.indexId).next((()=>s.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0)))).next((()=>i.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0))))}deleteAllFieldIndexes(e){const t=yo(e),n=qs(e),s=js(e);return t.Gn().next((()=>n.Gn())).next((()=>s.Gn()))}createTargetIndexes(e,t){return b.forEach(this.es(t),(n=>this.getIndexType(e,n).next((s=>{if(s===0||s===1){const i=new Vp(n).Ji();if(i!=null)return this.addFieldIndex(e,i)}}))))}getDocumentsMatchingTarget(e,t){const n=qs(e);let s=!0;const i=new Map;return b.forEach(this.es(t),(o=>this.ts(e,o).next((a=>{s&&(s=!!a),i.set(o,a)})))).next((()=>{if(s){let o=ae();const a=[];return b.forEach(i,((c,l)=>{U(Gp,`Using index ${(function(ee){return`id=${ee.indexId}|cg=${ee.collectionGroup}|f=${ee.fields.map((Be=>`${Be.fieldPath}:${Be.kind}`)).join(",")}`})(c)} to execute ${Hc(t)}`);const B=(function(ee,Be){const he=hB(Be);if(he===void 0)return null;for(const ue of qc(ee,he.fieldPath))switch(ue.op){case"array-contains-any":return ue.value.arrayValue.values||[];case"array-contains":return[ue.value]}return null})(l,c),d=(function(ee,Be){const he=new Map;for(const ue of Zr(Be))for(const D of qc(ee,ue.fieldPath))switch(D.op){case"==":case"in":he.set(ue.fieldPath.canonicalString(),D.value);break;case"not-in":case"!=":return he.set(ue.fieldPath.canonicalString(),D.value),Array.from(he.values())}return null})(l,c),C=(function(ee,Be){const he=[];let ue=!0;for(const D of Zr(Be)){const m=D.kind===0?ap(ee,D.fieldPath,ee.startAt):cp(ee,D.fieldPath,ee.startAt);he.push(m.value),ue&&(ue=m.inclusive)}return new Or(he,ue)})(l,c),g=(function(ee,Be){const he=[];let ue=!0;for(const D of Zr(Be)){const m=D.kind===0?cp(ee,D.fieldPath,ee.endAt):ap(ee,D.fieldPath,ee.endAt);he.push(m.value),ue&&(ue=m.inclusive)}return new Or(he,ue)})(l,c),I=this.ns(c,l,C),P=this.ns(c,l,g),F=this.rs(c,l,d),H=this.ss(c.indexId,B,I,C.inclusive,P,g.inclusive,F);return b.forEach(H,(Z=>n.Wn(Z,t.limit).next((ee=>{ee.forEach((Be=>{const he=J.fromSegments(Be.documentKey);o.has(he)||(o=o.add(he),a.push(he))}))}))))})).next((()=>a))}return b.resolve(null)}))}es(e){let t=this.Xi.get(e);return t||(e.filters.length===0?t=[e]:t=yN(Te.create(e.filters,"and")).map((n=>dB(e.path,e.collectionGroup,e.orderBy,n.getFilters(),e.limit,e.startAt,e.endAt))),this.Xi.set(e,t),t)}ss(e,t,n,s,i,o,a){const c=(t!=null?t.length:1)*Math.max(n.length,i.length),l=c/(t!=null?t.length:1),B=[];for(let d=0;d<c;++d){const C=t?this._s(t[d/l]):Cc,g=this.us(e,C,n[d%l],s),I=this.cs(e,C,i[d%l],o),P=a.map((F=>this.us(e,C,F,!0)));B.push(...this.createRange(g,I,P))}return B}us(e,t,n,s){const i=new is(e,J.empty(),t,n);return s?i:i.Ui()}cs(e,t,n,s){const i=new is(e,J.empty(),t,n);return s?i.Ui():i}ts(e,t){const n=new Vp(t),s=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment();return this.getFieldIndexes(e,s).next((i=>{let o=null;for(const a of i)n.Gi(a)&&(!o||a.fields.length>o.fields.length)&&(o=a);return o}))}getIndexType(e,t){let n=2;const s=this.es(t);return b.forEach(s,(i=>this.ts(e,i).next((o=>{o?n!==0&&o.fields.length<(function(c){let l=new De(je.comparator),B=!1;for(const d of c.filters)for(const C of d.getFlattenedFilters())C.field.isKeyField()||(C.op==="array-contains"||C.op==="array-contains-any"?B=!0:l=l.add(C.field));for(const d of c.orderBy)d.field.isKeyField()||(l=l.add(d.field));return l.size+(B?1:0)})(i)&&(n=1):n=0})))).next((()=>(function(o){return o.limit!==null})(t)&&s.length>1&&n===2?1:n))}ls(e,t){const n=new Io;for(const s of Zr(e)){const i=t.data.field(s.fieldPath);if(i==null)return null;const o=n.Oi(s.kind);ss.Ti.Xr(i,o)}return n.Ci()}_s(e){const t=new Io;return ss.Ti.Xr(e,t.Oi(0)),t.Ci()}Es(e,t){const n=new Io;return ss.Ti.Xr(ps(this.databaseId,t),n.Oi((function(i){const o=Zr(i);return o.length===0?0:o[o.length-1].kind})(e))),n.Ci()}rs(e,t,n){if(n===null)return[];let s=[];s.push(new Io);let i=0;for(const o of Zr(e)){const a=n[i++];for(const c of s)if(this.hs(t,o.fieldPath)&&Nr(a))s=this.Ts(s,o,a);else{const l=c.Oi(o.kind);ss.Ti.Xr(a,l)}}return this.Ps(s)}ns(e,t,n){return this.rs(e,t,n.position)}Ps(e){const t=[];for(let n=0;n<e.length;++n)t[n]=e[n].Ci();return t}Ts(e,t,n){const s=[...e],i=[];for(const o of n.arrayValue.values||[])for(const a of s){const c=new Io;c.seed(a.Ci()),ss.Ti.Xr(o,c.Oi(t.kind)),i.push(c)}return i}hs(e,t){return!!e.filters.find((n=>n instanceof pe&&n.field.isEqual(t)&&(n.op==="in"||n.op==="not-in")))}getFieldIndexes(e,t){const n=yo(e),s=js(e);return(t?n.Kn(yB,IDBKeyRange.bound(t,t)):n.Kn()).next((i=>{const o=[];return b.forEach(i,(a=>s.get([a.indexId,this.uid]).next((c=>{o.push((function(B,d){const C=d?new mi(d.sequenceNumber,new Kt(ys(d.readTime),new J(gn(d.documentKey)),d.largestBatchId)):mi.empty(),g=B.fields.map((([I,P])=>new Bs(je.fromServerFormat(I),P)));return new gi(B.indexId,B.collectionGroup,g,C)})(a,c))})))).next((()=>o))}))}getNextCollectionGroupToUpdate(e){return this.getFieldIndexes(e).next((t=>t.length===0?null:(t.sort(((n,s)=>{const i=n.indexState.sequenceNumber-s.indexState.sequenceNumber;return i!==0?i:ie(n.collectionGroup,s.collectionGroup)})),t[0].collectionGroup)))}updateCollectionGroup(e,t,n){const s=yo(e),i=js(e);return this.Rs(e).next((o=>s.Kn(yB,IDBKeyRange.bound(t,t)).next((a=>b.forEach(a,(c=>i.put(Np(c.indexId,this.uid,o,n))))))))}updateIndexEntries(e,t){const n=new Map;return b.forEach(t,((s,i)=>{const o=n.get(s.collectionGroup);return(o?b.resolve(o):this.getFieldIndexes(e,s.collectionGroup)).next((a=>(n.set(s.collectionGroup,a),b.forEach(a,(c=>this.Is(e,s,c).next((l=>{const B=this.As(i,c);return l.isEqual(B)?b.resolve():this.Vs(e,i,c,l,B)})))))))}))}ds(e,t,n,s){return qs(e).put(s.ki(this.uid,this.Es(n,t.key),t.key))}fs(e,t,n,s){return qs(e).delete(s.qi(this.uid,this.Es(n,t.key),t.key))}Is(e,t,n){const s=qs(e);let i=new De(lr);return s.jn({index:VE,range:IDBKeyRange.only([n.indexId,this.uid,Sc(this.Es(n,t))])},((o,a)=>{i=i.add(new is(n.indexId,t,xp(a.arrayValue),xp(a.directionalValue)))})).next((()=>i))}As(e,t){let n=new De(lr);const s=this.ls(t,e);if(s==null)return n;const i=hB(t);if(i!=null){const o=e.data.field(i.fieldPath);if(Nr(o))for(const a of o.arrayValue.values||[])n=n.add(new is(t.indexId,e.key,this._s(a),s))}else n=n.add(new is(t.indexId,e.key,Cc,s));return n}Vs(e,t,n,s,i){U(Gp,"Updating index entries for document '%s'",t.key);const o=[];return(function(c,l,B,d,C){const g=c.getIterator(),I=l.getIterator();let P=Ms(g),F=Ms(I);for(;P||F;){let H=!1,Z=!1;if(P&&F){const ee=B(P,F);ee<0?Z=!0:ee>0&&(H=!0)}else P!=null?Z=!0:H=!0;H?(d(F),F=Ms(I)):Z?(C(P),P=Ms(g)):(P=Ms(g),F=Ms(I))}})(s,i,lr,(a=>{o.push(this.ds(e,t,n,a))}),(a=>{o.push(this.fs(e,t,n,a))})),b.waitFor(o)}Rs(e){let t=1;return js(e).jn({index:xE,reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},((n,s,i)=>{i.done(),t=s.sequenceNumber+1})).next((()=>t))}createRange(e,t,n){n=n.sort(((o,a)=>lr(o,a))).filter(((o,a,c)=>!a||lr(o,c[a-1])!==0));const s=[];s.push(e);for(const o of n){const a=lr(o,e),c=lr(o,t);if(a===0)s[0]=e.Ui();else if(a>0&&c<0)s.push(o),s.push(o.Ui());else if(c>0)break}s.push(t);const i=[];for(let o=0;o<s.length;o+=2){if(this.ps(s[o],s[o+1]))return[];const a=s[o].qi(this.uid,Cc,J.empty()),c=s[o+1].qi(this.uid,Cc,J.empty());i.push(IDBKeyRange.bound(a,c))}return i}ps(e,t){return lr(e,t)>0}getMinOffsetFromCollectionGroup(e,t){return this.getFieldIndexes(e,t).next(Hp)}getMinOffset(e,t){return b.mapArray(this.es(t),(n=>this.ts(e,n).next((s=>s||Y(44426))))).next(Hp)}}function Up(r){return ct(r,Ca)}function qs(r){return ct(r,Ko)}function yo(r){return ct(r,$h)}function js(r){return ct(r,Jo)}function Hp(r){q(r.length!==0,28825);let e=r[0].indexState.offset,t=e.largestBatchId;for(let n=1;n<r.length;n++){const s=r[n].indexState.offset;Ch(s,e)<0&&(e=s),t<s.largestBatchId&&(t=s.largestBatchId)}return new Kt(e.readTime,e.documentKey,t)}/**
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
 */class Wn{constructor(e){this.gs=e}next(){return this.gs+=2,this.gs}static ys(){return new Wn(0)}static ws(){return new Wn(-1)}}/**
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
 */class TN{constructor(e,t){this.referenceDelegate=e,this.serializer=t}allocateTargetId(e){return this.bs(e).next((t=>{const n=new Wn(t.highestTargetId);return t.highestTargetId=n.next(),this.Ss(e,t).next((()=>t.highestTargetId))}))}getLastRemoteSnapshotVersion(e){return this.bs(e).next((t=>te.fromTimestamp(new ye(t.lastRemoteSnapshotVersion.seconds,t.lastRemoteSnapshotVersion.nanoseconds))))}getHighestSequenceNumber(e){return this.bs(e).next((t=>t.highestListenSequenceNumber))}setTargetsMetadata(e,t,n){return this.bs(e).next((s=>(s.highestListenSequenceNumber=t,n&&(s.lastRemoteSnapshotVersion=n.toTimestamp()),t>s.highestListenSequenceNumber&&(s.highestListenSequenceNumber=t),this.Ss(e,s))))}addTargetData(e,t){return this.vs(e,t).next((()=>this.bs(e).next((n=>(n.targetCount+=1,this.Ds(t,n),this.Ss(e,n))))))}updateTargetData(e,t){return this.vs(e,t)}removeTargetData(e,t){return this.removeMatchingKeysForTargetId(e,t.targetId).next((()=>Js(e).delete(t.targetId))).next((()=>this.bs(e))).next((n=>(q(n.targetCount>0,8065),n.targetCount-=1,this.Ss(e,n))))}removeTargets(e,t,n){let s=0;const i=[];return Js(e).jn(((o,a)=>{const c=So(this.serializer,a);c.sequenceNumber<=t&&n.get(c.targetId)===null&&(s++,i.push(this.removeTargetData(e,c)))})).next((()=>b.waitFor(i))).next((()=>s))}forEachTarget(e,t){return Js(e).jn(((n,s)=>{const i=So(this.serializer,s);t(i)}))}bs(e){return qp(e).get($c).next((t=>(q(t!==null,2888),t)))}Ss(e,t){return qp(e).put($c,t)}vs(e,t){return Js(e).put(KE(this.serializer,t))}Ds(e,t){let n=!1;return e.targetId>t.highestTargetId&&(t.highestTargetId=e.targetId,n=!0),e.sequenceNumber>t.highestListenSequenceNumber&&(t.highestListenSequenceNumber=e.sequenceNumber,n=!0),n}getTargetCount(e){return this.bs(e).next((t=>t.targetCount))}getTargetData(e,t){const n=ku(t),s=IDBKeyRange.bound([n,Number.NEGATIVE_INFINITY],[n,Number.POSITIVE_INFINITY]);let i=null;return Js(e).jn({range:s,index:LE},((o,a,c)=>{const l=So(this.serializer,a);Kh(t,l.target)&&(i=l,c.done())})).next((()=>i))}addMatchingKeys(e,t,n){const s=[],i=gr(e);return t.forEach((o=>{const a=yt(o.path);s.push(i.put({targetId:n,path:a})),s.push(this.referenceDelegate.addReference(e,n,o))})),b.waitFor(s)}removeMatchingKeys(e,t,n){const s=gr(e);return b.forEach(t,(i=>{const o=yt(i.path);return b.waitFor([s.delete([n,o]),this.referenceDelegate.removeReference(e,n,i)])}))}removeMatchingKeysForTargetId(e,t){const n=gr(e),s=IDBKeyRange.bound([t],[t+1],!1,!0);return n.delete(s)}getMatchingKeysForTargetId(e,t){const n=IDBKeyRange.bound([t],[t+1],!1,!0),s=gr(e);let i=ae();return s.jn({range:n,zn:!0},((o,a,c)=>{const l=gn(o[1]),B=new J(l);i=i.add(B)})).next((()=>i))}containsKey(e,t){const n=yt(t.path),s=IDBKeyRange.bound([n],[Qm(n)],!1,!0);let i=0;return gr(e).jn({index:Qh,zn:!0,range:s},(([o,a],c,l)=>{o!==0&&(i++,l.done())})).next((()=>i>0))}ge(e,t){return Js(e).get(t).next((n=>n?So(this.serializer,n):null))}}function Js(r){return ct(r,yi)}function qp(r){return ct(r,hs)}function gr(r){return ct(r,wi)}/**
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
 */class AN{constructor(e,t){this.db=e,this.garbageCollector=aE(this,t)}rr(e){const t=this.xs(e);return this.db.getTargetCache().getTargetCount(e).next((n=>t.next((s=>n+s))))}xs(e){let t=0;return this.ir(e,(n=>{t++})).next((()=>t))}forEachTarget(e,t){return this.db.getTargetCache().forEachTarget(e,t)}ir(e,t){return this.Cs(e,((n,s)=>t(s)))}addReference(e,t,n){return pc(e,n)}removeReference(e,t,n){return pc(e,n)}removeTargets(e,t,n){return this.db.getTargetCache().removeTargets(e,t,n)}markPotentiallyOrphaned(e,t){return pc(e,t)}Fs(e,t){return(function(s,i){let o=!1;return WE(s).Hn((a=>zE(s,a,i).next((c=>(c&&(o=!0),b.resolve(!c)))))).next((()=>o))})(e,t)}removeOrphanedDocuments(e,t){const n=this.db.getRemoteDocumentCache().newChangeBuffer(),s=[];let i=0;return this.Cs(e,((o,a)=>{if(a<=t){const c=this.Fs(e,o).next((l=>{if(!l)return i++,n.getEntry(e,o).next((()=>(n.removeEntry(o,te.min()),gr(e).delete((function(d){return[0,yt(d.path)]})(o)))))}));s.push(c)}})).next((()=>b.waitFor(s))).next((()=>n.apply(e))).next((()=>i))}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(e,n)}updateLimboDocument(e,t){return pc(e,t)}Cs(e,t){const n=gr(e);let s,i=Lt.yn;return n.jn({index:Qh},(([o,a],{path:c,sequenceNumber:l})=>{o===0?(i!==Lt.yn&&t(new J(gn(s)),i),i=l,s=c):i=Lt.yn})).next((()=>{i!==Lt.yn&&t(new J(gn(s)),i)}))}getCacheSize(e){return this.db.getRemoteDocumentCache().getSize(e)}}function pc(r,e){return gr(r).put((function(n,s){return{targetId:0,path:yt(n.path),sequenceNumber:s}})(e,r.currentSequenceNumber))}// Copyright 2024 Google LLC* @license
function YE(r,e){var n;let t=e;for(const s of r.stages)t=RN({serializer:r.serializer,serverTimestampBehavior:(n=r.listenOptions)==null?void 0:n.serverTimestampBehavior},s,t);return t}function Hu(r,e){return YE(r,[e]).length>0}function XE(r,e){return Ge(r)?Hu(r,e):Du(r,e)}function RN(r,e,t){if(e instanceof Pa)return(function(s,i,o){return o.filter((a=>a.isFoundDocument()&&`/${a.key.getCollectionPath().canonicalString()}`===i.Er))})(0,e,t);if(e instanceof Sa)return(function(s,i,o){return o.filter((a=>{const c=jo(se(i.condition).evaluate(s,a));return c!==void 0&&nn(c,Mt)}))})(r,e,t);if(e instanceof ba)return(function(s,i,o){return o.filter((a=>a.isFoundDocument()&&a.key.getCollectionPath().lastSegment()===i.collectionId))})(0,e,t);if(e instanceof Su)return(function(s,i,o){return o.filter((a=>a.isFoundDocument()))})(0,0,t);if(e instanceof Nu)return(function(s,i,o){return o.filter((a=>a.isFoundDocument()&&i.Tr.has(a.key.path.toStringWithLeadingSlash())))})(0,e,t);if(e instanceof kr)return(function(s,i,o){return o.slice(0,i.limit)})(0,e,t);if(e instanceof pn)return(function(s,i,o){const a=i.orderings.map((c=>({Os:se(c.expr),direction:c.direction})));return[...o].sort(((c,l)=>{for(const{Os:B,direction:d}of a){const C=jo(B.evaluate(s,c)),g=jo(B.evaluate(s,l)),I=wt(C??En,g??En);if(I!==0)return d==="ascending"?I:-I}return 0}))})(r,e,t);throw new Error(`Unknown stage: ${e._name}`)}function eu(r){const e=(function(n){for(let s=n.stages.length-1;s>=0;s--){const i=n.stages[s];if(i instanceof pn)return i.orderings}throw new Error("Pipeline must contain at least one Sort stage")})(r);return(t,n)=>{for(const s of e){const i=jo(se(s.expr).evaluate({serializer:r.serializer},t)),o=jo(se(s.expr).evaluate({serializer:r.serializer},n)),a=wt(i||En,o||En);if(a!==0)return s.direction==="ascending"?a:-a}return 0}}function Ml(r){for(let e=r.stages.length-1;e>=0;e--){const t=r.stages[e];if(t instanceof kr)return{limit:t.limit}}}/**
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
 */class ZE{constructor(){this.changes=new Zn((e=>e.toString()),((e,t)=>e.isEqual(t))),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,xe.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const n=this.changes.get(t);return n!==void 0?b.resolve(n):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
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
 */class vN{constructor(e){this.serializer=e}setIndexManager(e){this.indexManager=e}addEntry(e,t,n){return Br(e).put(n)}removeEntry(e,t,n){return Br(e).delete((function(i,o){const a=i.path.toArray();return[a.slice(0,a.length-2),a[a.length-2],Xc(o),a[a.length-1]]})(t,n))}updateMetadata(e,t){return this.getMetadata(e).next((n=>(n.byteSize+=t,this.Ms(e,n))))}getEntry(e,t){let n=xe.newInvalidDocument(t);return Br(e).jn({index:bc,range:IDBKeyRange.only(wo(t))},((s,i)=>{n=this.Ns(t,i)})).next((()=>n))}Ls(e,t){let n={size:0,document:xe.newInvalidDocument(t)};return Br(e).jn({index:bc,range:IDBKeyRange.only(wo(t))},((s,i)=>{n={document:this.Ns(t,i),size:Yc(i)}})).next((()=>n))}getEntries(e,t){let n=$e();return this.Bs(e,t,((s,i)=>{const o=this.Ns(s,i);n=n.insert(s,o)})).next((()=>n))}getAllEntries(e){let t=$e();return Br(e).jn(((n,s)=>{const i=this.Ns(J.fromSegments(s.prefixPath.concat(s.collectionGroup,s.documentId)),s);t=t.insert(i.key,i)})).next((()=>t))}Us(e,t){let n=$e(),s=new be(J.comparator);return this.Bs(e,t,((i,o)=>{const a=this.Ns(i,o);n=n.insert(i,a),s=s.insert(i,Yc(o))})).next((()=>({documents:n,ks:s})))}Bs(e,t,n){if(t.isEmpty())return b.resolve();let s=new De(Kp);t.forEach((c=>s=s.add(c)));const i=IDBKeyRange.bound(wo(s.first()),wo(s.last())),o=s.getIterator();let a=o.getNext();return Br(e).jn({index:bc,range:i},((c,l,B)=>{const d=J.fromSegments([...l.prefixPath,l.collectionGroup,l.documentId]);for(;a&&Kp(a,d)<0;)n(a,null),a=o.getNext();a&&a.isEqual(d)&&(n(a,l),a=o.hasNext()?o.getNext():null),a?B.$n(wo(a)):B.done()})).next((()=>{for(;a;)n(a,null),a=o.hasNext()?o.getNext():null}))}getDocumentsMatchingQuery(e,t,n,s,i){const o=Ge(t)?ce.fromString(Na(t)):t.path,a=[o.popLast().toArray(),o.lastSegment(),Xc(n.readTime),n.documentKey.path.isEmpty()?"":n.documentKey.path.lastSegment()],c=[o.popLast().toArray(),o.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return Br(e).Kn(IDBKeyRange.bound(a,c,!0)).next((l=>{i==null||i.incrementDocumentReadCount(l.length);let B=$e();for(const d of l){const C=this.Ns(J.fromSegments(d.prefixPath.concat(d.collectionGroup,d.documentId)),d);C.isFoundDocument()&&(XE(t,C)||s.has(C.key))&&(B=B.insert(C.key,C))}return B}))}getAllFromCollectionGroup(e,t,n,s){let i=$e();const o=Jp(t,n),a=Jp(t,Kt.max());return Br(e).jn({index:kE,range:IDBKeyRange.bound(o,a,!0)},((c,l,B)=>{const d=this.Ns(J.fromSegments(l.prefixPath.concat(l.collectionGroup,l.documentId)),l);i=i.insert(d.key,d),i.size===s&&B.done()})).next((()=>i))}newChangeBuffer(e){return new PN(this,!!e&&e.trackRemovals)}getSize(e){return this.getMetadata(e).next((t=>t.byteSize))}getMetadata(e){return jp(e).get(IB).next((t=>(q(!!t,20021),t)))}Ms(e,t){return jp(e).put(IB,t)}Ns(e,t){if(t){const n=fN(this.serializer,t);if(!(n.isNoDocument()&&n.version.isEqual(te.min())))return n}return xe.newInvalidDocument(e)}}function eI(r){return new vN(r)}class PN extends ZE{constructor(e,t){super(),this.qs=e,this.trackRemovals=t,this.$s=new Zn((n=>n.toString()),((n,s)=>n.isEqual(s)))}applyChanges(e){const t=[];let n=0,s=new De(((i,o)=>ie(i.canonicalString(),o.canonicalString())));return this.changes.forEach(((i,o)=>{const a=this.$s.get(i);if(t.push(this.qs.removeEntry(e,i,a.readTime)),o.isValidDocument()){const c=bp(this.qs.serializer,o);s=s.add(i.path.popLast());const l=Yc(c);n+=l-a.size,t.push(this.qs.addEntry(e,i,c))}else if(n-=a.size,this.trackRemovals){const c=bp(this.qs.serializer,o.convertToNoDocument(te.min()));t.push(this.qs.addEntry(e,i,c))}})),s.forEach((i=>{t.push(this.qs.indexManager.addToCollectionParentIndex(e,i))})),t.push(this.qs.updateMetadata(e,n)),b.waitFor(t)}getFromCache(e,t){return this.qs.Ls(e,t).next((n=>(this.$s.set(t,{size:n.size,readTime:n.document.readTime}),n.document)))}getAllFromCache(e,t){return this.qs.Us(e,t).next((({documents:n,ks:s})=>(s.forEach(((i,o)=>{this.$s.set(i,{size:o,readTime:n.get(i).readTime})})),n)))}}function jp(r){return ct(r,fa)}function Br(r){return ct(r,Qc)}function wo(r){const e=r.path.toArray();return[e.slice(0,e.length-2),e[e.length-2],e[e.length-1]]}function Jp(r,e){const t=e.documentKey.path.toArray();return[r,Xc(e.readTime),t.slice(0,t.length-2),t.length>0?t[t.length-1]:""]}function Kp(r,e){const t=r.path.toArray(),n=e.path.toArray();let s=0;for(let i=0;i<t.length-2&&i<n.length-2;++i)if(s=ie(t[i],n[i]),s)return s;return s=ie(t.length,n.length),s||(s=ie(t[t.length-2],n[n.length-2]),s||ie(t[t.length-1],n[n.length-1]))}/**
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
 */class bN{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
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
 */class tI{constructor(e,t,n,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=n,this.indexManager=s}getDocument(e,t){let n=null;return this.documentOverlayCache.getOverlay(e,t).next((s=>(n=s,this.remoteDocumentCache.getEntry(e,t)))).next((s=>(n!==null&&Vo(n.mutation,s,kt.empty(),ye.now()),s)))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next((n=>this.getLocalViewOfDocuments(e,n,ae()).next((()=>n))))}getLocalViewOfDocuments(e,t,n=ae()){const s=en();return this.populateOverlays(e,s,t).next((()=>this.computeViews(e,t,s,n).next((i=>{let o=ts();return i.forEach(((a,c)=>{o=o.insert(a,c.overlayedDocument)})),o}))))}getOverlayedDocuments(e,t){const n=en();return this.populateOverlays(e,n,t).next((()=>this.computeViews(e,t,n,ae())))}populateOverlays(e,t,n){const s=[];return n.forEach((i=>{t.has(i)||s.push(i)})),this.documentOverlayCache.getOverlays(e,s).next((i=>{i.forEach(((o,a)=>{t.set(o,a)}))}))}computeViews(e,t,n,s){let i=$e();const o=Go(),a=(function(){return Go()})();return t.forEach(((c,l)=>{const B=n.get(l.key);s.has(l.key)&&(B===void 0||B.mutation instanceof Yn)?i=i.insert(l.key,l):B!==void 0?(o.set(l.key,B.mutation.getFieldMask()),Vo(B.mutation,l,B.mutation.getFieldMask(),ye.now())):o.set(l.key,kt.empty())})),this.recalculateAndSaveOverlays(e,i).next((c=>(c.forEach(((l,B)=>o.set(l,B))),t.forEach(((l,B)=>a.set(l,new bN(B,o.get(l)??null)))),a)))}recalculateAndSaveOverlays(e,t){const n=Go();let s=new be(((o,a)=>o-a)),i=ae();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next((o=>{for(const a of o)a.keys().forEach((c=>{const l=t.get(c);if(l===null)return;let B=n.get(c)||kt.empty();B=a.applyToLocalView(l,B),n.set(c,B);const d=(s.get(a.batchId)||ae()).add(c);s=s.insert(a.batchId,d)}))})).next((()=>{const o=[],a=s.getReverseIterator();for(;a.hasNext();){const c=a.getNext(),l=c.key,B=c.value,d=N_();B.forEach((C=>{if(!i.has(C)){const g=d_(t.get(C),n.get(C));g!==null&&d.set(C,g),i=i.add(C)}})),o.push(this.documentOverlayCache.saveOverlays(e,l,d))}return b.waitFor(o)})).next((()=>n))}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next((n=>this.recalculateAndSaveOverlays(e,n)))}getDocumentsMatchingQuery(e,t,n,s){return Ge(t)?this.getDocumentsMatchingPipeline(e,t,n,s):lP(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):mh(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,n,s):this.getDocumentsMatchingCollectionQuery(e,t,n,s)}getNextDocuments(e,t,n,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,n,s).next((i=>{const o=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,n.largestBatchId,s-i.size):b.resolve(en());let a=pi,c=i;return o.next((l=>b.forEach(l,((B,d)=>(a<d.largestBatchId&&(a=d.largestBatchId),i.get(B)?b.resolve():this.remoteDocumentCache.getEntry(e,B).next((C=>{c=c.insert(B,C)}))))).next((()=>this.populateOverlays(e,l,i))).next((()=>this.computeViews(e,c,l,ae()))).next((B=>({batchId:a,changes:S_(B)})))))}))}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new J(t)).next((n=>{let s=ts();return n.isFoundDocument()&&(s=s.insert(n.key,n)),s}))}getDocumentsMatchingCollectionGroupQuery(e,t,n,s){const i=t.collectionGroup;let o=ts();return this.indexManager.getCollectionParents(e,i).next((a=>b.forEach(a,(c=>{const l=(function(d,C){return new Xn(C,null,d.explicitOrderBy.slice(),d.filters.slice(),d.limit,d.limitType,d.startAt,d.endAt)})(t,c.child(i));return this.getDocumentsMatchingCollectionQuery(e,l,n,s).next((B=>{B.forEach(((d,C)=>{o=o.insert(d,C)}))}))})).next((()=>o))))}getDocumentsMatchingCollectionQuery(e,t,n,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,n.largestBatchId).next((o=>(i=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,i,s)))).next((o=>this.retrieveMatchingLocalDocuments(i,o,(a=>Du(t,a)))))}getDocumentsMatchingPipeline(e,t,n,s){if(Mn(t)==="collection_group"){const i=Mh(t);let o=ts();return this.indexManager.getCollectionParents(e,i).next((a=>b.forEach(a,(c=>{const l=(function(d,C){const g=d.stages.map((I=>I instanceof ba?new Pa(C.canonicalString(),{}):I));return new Et(d.serializer,g)})(t,c.child(i));return this.getDocumentsMatchingPipeline(e,l,n,s).next((B=>{B.forEach(((d,C)=>{o=o.insert(d,C)}))}))})).next((()=>o))))}{let i;return this.getOverlaysForPipeline(e,t,n.largestBatchId).next((o=>{switch(i=o,Mn(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,i,s);case"documents":let a=ae();for(const c of Kc(t))a=a.add(J.fromPath(c));return this.remoteDocumentCache.getEntries(e,a);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new M("invalid-argument",`Invalid pipeline source to execute offline: ${Gn(t)}`)}})).next((o=>this.retrieveMatchingLocalDocuments(i,o,(a=>Hu(t,a)))))}}retrieveMatchingLocalDocuments(e,t,n){e.forEach(((i,o)=>{const a=o.getKey();t.get(a)===null&&(t=t.insert(a,xe.newInvalidDocument(a)))}));let s=ts();return t.forEach(((i,o)=>{const a=e.get(i);a!==void 0&&Vo(a.mutation,o,kt.empty(),ye.now()),n(o)&&(s=s.insert(i,o))})),s}getOverlaysForPipeline(e,t,n){switch(Mn(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,ce.fromString(Na(t)),n);case"collection_group":throw new M("invalid-argument",`Unexpected collection group pipeline: ${Gn(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,Kc(t).map((s=>J.fromPath(s))));case"database":return this.documentOverlayCache.getAllOverlays(e,n);default:throw new M("invalid-argument",`Failed to get overlays for pipeline: ${Gn(t)}`)}}}/**
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
 */class SN{constructor(e){this.serializer=e,this.Ks=new Map,this.Qs=new Map}getBundleMetadata(e,t){return b.resolve(this.Ks.get(t))}saveBundleMetadata(e,t){return this.Ks.set(t.id,(function(s){return{id:s.id,version:s.version,createTime:Je(s.createTime)}})(t)),b.resolve()}getNamedQuery(e,t){return b.resolve(this.Qs.get(t))}saveNamedQuery(e,t){return this.Qs.set(t.name,(function(s){return{name:s.name,query:Mu(s.bundledQuery),readTime:Je(s.readTime)}})(t)),b.resolve()}}/**
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
 */class NN{constructor(){this.overlays=new be(J.comparator),this.Ws=new Map}getOverlay(e,t){return b.resolve(this.overlays.get(t))}getOverlays(e,t){const n=en();return b.forEach(t,(s=>this.getOverlay(e,s).next((i=>{i!==null&&n.set(s,i)})))).next((()=>n))}getAllOverlays(e,t){const n=en();return this.overlays.forEach(((s,i)=>{i.largestBatchId>t&&n.set(s,i)})),b.resolve(n)}saveOverlays(e,t,n){return n.forEach(((s,i)=>{this.Yr(e,t,i)})),b.resolve()}removeOverlaysForBatchId(e,t,n){const s=this.Ws.get(n);return s!==void 0&&(s.forEach((i=>this.overlays=this.overlays.remove(i))),this.Ws.delete(n)),b.resolve()}getOverlaysForCollection(e,t,n){const s=en(),i=t.length+1,o=new J(t.child("")),a=this.overlays.getIteratorFrom(o);for(;a.hasNext();){const c=a.getNext().value,l=c.getKey();if(!t.isPrefixOf(l.path))break;l.path.length===i&&c.largestBatchId>n&&s.set(c.getKey(),c)}return b.resolve(s)}getOverlaysForCollectionGroup(e,t,n,s){let i=new be(((l,B)=>l-B));const o=this.overlays.getIterator();for(;o.hasNext();){const l=o.getNext().value;if(l.getKey().getCollectionGroup()===t&&l.largestBatchId>n){let B=i.get(l.largestBatchId);B===null&&(B=en(),i=i.insert(l.largestBatchId,B)),B.set(l.getKey(),l)}}const a=en(),c=i.getIterator();for(;c.hasNext()&&(c.getNext().value.forEach(((l,B)=>a.set(l,B))),!(a.size()>=s)););return b.resolve(a)}Yr(e,t,n){const s=this.overlays.get(n.key);if(s!==null){const o=this.Ws.get(s.largestBatchId).delete(n.key);this.Ws.set(s.largestBatchId,o)}this.overlays=this.overlays.insert(n.key,new Zh(t,n));let i=this.Ws.get(t);i===void 0&&(i=ae(),this.Ws.set(t,i)),this.Ws.set(t,i.add(n.key))}}/**
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
 */class ON{constructor(){this.sessionToken=Oe.EMPTY_BYTE_STRING}getSessionToken(e){return b.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,b.resolve()}}/**
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
 */class nd{constructor(){this.Gs=new De(lt.zs),this.js=new De(lt.Hs)}isEmpty(){return this.Gs.isEmpty()}addReference(e,t){const n=new lt(e,t);this.Gs=this.Gs.add(n),this.js=this.js.add(n)}Js(e,t){e.forEach((n=>this.addReference(n,t)))}removeReference(e,t){this.Ys(new lt(e,t))}Zs(e,t){e.forEach((n=>this.removeReference(n,t)))}Xs(e){const t=new J(new ce([])),n=new lt(t,e),s=new lt(t,e+1),i=[];return this.js.forEachInRange([n,s],(o=>{this.Ys(o),i.push(o.key)})),i}e_(){this.Gs.forEach((e=>this.Ys(e)))}Ys(e){this.Gs=this.Gs.delete(e),this.js=this.js.delete(e)}t_(e){const t=new J(new ce([])),n=new lt(t,e),s=new lt(t,e+1);let i=ae();return this.js.forEachInRange([n,s],(o=>{i=i.add(o.key)})),i}containsKey(e){const t=new lt(e,0),n=this.Gs.firstAfterOrEqual(t);return n!==null&&e.isEqual(n.key)}}class lt{constructor(e,t){this.key=e,this.n_=t}static zs(e,t){return J.comparator(e.key,t.key)||ie(e.n_,t.n_)}static Hs(e,t){return ie(e.n_,t.n_)||J.comparator(e.key,t.key)}}/**
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
 */class FN{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Wr=1,this.r_=new De(lt.zs)}checkEmpty(e){return b.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,n,s){const i=this.Wr;this.Wr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new zh(i,t,n,s);this.mutationQueue.push(o);for(const a of s)this.r_=this.r_.add(new lt(a.key,i)),this.indexManager.addToCollectionParentIndex(e,a.key.path.popLast());return b.resolve(o)}lookupMutationBatch(e,t){return b.resolve(this.i_(t))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,s=this.s_(n),i=s<0?0:s;return b.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return b.resolve(this.mutationQueue.length===0?Tr:this.Wr-1)}getAllMutationBatches(e){return b.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const n=new lt(t,0),s=new lt(t,Number.POSITIVE_INFINITY),i=[];return this.r_.forEachInRange([n,s],(o=>{const a=this.i_(o.n_);i.push(a)})),b.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new De(ie);return t.forEach((s=>{const i=new lt(s,0),o=new lt(s,Number.POSITIVE_INFINITY);this.r_.forEachInRange([i,o],(a=>{n=n.add(a.n_)}))})),b.resolve(this.__(n))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,s=n.length+1;let i=n;J.isDocumentKey(i)||(i=i.child(""));const o=new lt(new J(i),0);let a=new De(ie);return this.r_.forEachWhile((c=>{const l=c.key.path;return!!n.isPrefixOf(l)&&(l.length===s&&(a=a.add(c.n_)),!0)}),o),b.resolve(this.__(a))}__(e){const t=[];return e.forEach((n=>{const s=this.i_(n);s!==null&&t.push(s)})),t}removeMutationBatch(e,t){q(this.o_(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let n=this.r_;return b.forEach(t.mutations,(s=>{const i=new lt(s.key,t.batchId);return n=n.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)})).next((()=>{this.r_=n}))}jr(e){}containsKey(e,t){const n=new lt(t,0),s=this.r_.firstAfterOrEqual(n);return b.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,b.resolve()}o_(e,t){return this.s_(e)}s_(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}i_(e){const t=this.s_(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
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
 */class kN{constructor(e){this.a_=e,this.docs=(function(){return new be(J.comparator)})(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const n=t.key,s=this.docs.get(n),i=s?s.size:0,o=this.a_(t);return this.docs=this.docs.insert(n,{document:t.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(e,n.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const n=this.docs.get(t);return b.resolve(n?n.document.mutableCopy():xe.newInvalidDocument(t))}getEntries(e,t){let n=$e();return t.forEach((s=>{const i=this.docs.get(s);n=n.insert(s,i?i.document.mutableCopy():xe.newInvalidDocument(s))})),b.resolve(n)}getAllEntries(e){let t=$e();return this.docs.forEach(((n,s)=>{t=t.insert(n,s.document)})),b.resolve(t)}getDocumentsMatchingQuery(e,t,n,s){let i,o;Ge(t)?(i=ce.fromString(Na(t)),o=B=>Hu(t,B)):(i=t.path,o=B=>Du(t,B));let a=$e();const c=new J(i.child("__id-9223372036854775808__")),l=this.docs.getIteratorFrom(c);for(;l.hasNext();){const{key:B,value:{document:d}}=l.getNext();if(!i.isPrefixOf(B.path))break;B.path.length>i.length+1||Ch(w_(d),n)<=0||(s.has(d.key)||o(d))&&(a=a.insert(d.key,d.mutableCopy()))}return b.resolve(a)}getAllFromCollectionGroup(e,t,n,s){Y(9500)}u_(e,t){return b.forEach(this.docs,(n=>t(n)))}newChangeBuffer(e){return new LN(this)}getSize(e){return b.resolve(this.size)}}class LN extends ZE{constructor(e){super(),this.qs=e}applyChanges(e){const t=[];return this.changes.forEach(((n,s)=>{s.isValidDocument()?t.push(this.qs.addEntry(e,s)):this.qs.removeEntry(n)})),b.waitFor(t)}getFromCache(e,t){return this.qs.getEntry(e,t)}getAllFromCache(e,t){return this.qs.getEntries(e,t)}}/**
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
 */class xN{constructor(e){this.persistence=e,this.c_=new Zn((t=>ku(t)),Kh),this.lastRemoteSnapshotVersion=te.min(),this.highestTargetId=0,this.l_=0,this.E_=new nd,this.targetCount=0,this.h_=Wn.ys()}forEachTarget(e,t){return this.c_.forEach(((n,s)=>t(s))),b.resolve()}getLastRemoteSnapshotVersion(e){return b.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return b.resolve(this.l_)}allocateTargetId(e){return this.highestTargetId=this.h_.next(),b.resolve(this.highestTargetId)}setTargetsMetadata(e,t,n){return n&&(this.lastRemoteSnapshotVersion=n),t>this.l_&&(this.l_=t),b.resolve()}vs(e){this.c_.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.h_=new Wn(t),this.highestTargetId=t),e.sequenceNumber>this.l_&&(this.l_=e.sequenceNumber)}addTargetData(e,t){return this.vs(t),this.targetCount+=1,b.resolve()}updateTargetData(e,t){return this.vs(t),b.resolve()}removeTargetData(e,t){return this.c_.delete(t.target),this.E_.Xs(t.targetId),this.targetCount-=1,b.resolve()}removeTargets(e,t,n){let s=0;const i=[];return this.c_.forEach(((o,a)=>{a.sequenceNumber<=t&&n.get(a.targetId)===null&&(this.c_.delete(o),i.push(this.removeMatchingKeysForTargetId(e,a.targetId)),s++)})),b.waitFor(i).next((()=>s))}getTargetCount(e){return b.resolve(this.targetCount)}getTargetData(e,t){const n=this.c_.get(t)||null;return b.resolve(n)}addMatchingKeys(e,t,n){return this.E_.Js(t,n),b.resolve()}removeMatchingKeys(e,t,n){this.E_.Zs(t,n);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach((o=>{i.push(s.markPotentiallyOrphaned(e,o))})),b.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.E_.Xs(t),b.resolve()}getMatchingKeysForTargetId(e,t){const n=this.E_.t_(t);return b.resolve(n)}containsKey(e,t){return b.resolve(this.E_.containsKey(t))}}/**
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
 */class rd{constructor(e,t){this.T_={},this.overlays={},this.P_=new Lt(0),this.R_=!1,this.R_=!0,this.I_=new ON,this.referenceDelegate=e(this),this.A_=new xN(this),this.indexManager=new wN,this.remoteDocumentCache=(function(s){return new kN(s)})((n=>this.referenceDelegate.V_(n))),this.serializer=new JE(t),this.d_=new SN(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.R_=!1,Promise.resolve()}get started(){return this.R_}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new NN,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let n=this.T_[e.toKey()];return n||(n=new FN(t,this.referenceDelegate),this.T_[e.toKey()]=n),n}getGlobalsCache(){return this.I_}getTargetCache(){return this.A_}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.d_}runTransaction(e,t,n){U("MemoryPersistence","Starting transaction:",e);const s=new VN(this.P_.next());return this.referenceDelegate.f_(),n(s).next((i=>this.referenceDelegate.m_(s).next((()=>i)))).toPromise().then((i=>(s.raiseOnCommittedEvent(),i)))}p_(e,t){return b.or(Object.values(this.T_).map((n=>()=>n.containsKey(e,t))))}}class VN extends rE{constructor(e){super(),this.currentSequenceNumber=e}}class qu{constructor(e){this.persistence=e,this.g_=new nd,this.y_=null}static w_(e){return new qu(e)}get b_(){if(this.y_)return this.y_;throw Y(60996)}addReference(e,t,n){return this.g_.addReference(n,t),this.b_.delete(n.toString()),b.resolve()}removeReference(e,t,n){return this.g_.removeReference(n,t),this.b_.add(n.toString()),b.resolve()}markPotentiallyOrphaned(e,t){return this.b_.add(t.toString()),b.resolve()}removeTarget(e,t){this.g_.Xs(t.targetId).forEach((s=>this.b_.add(s.toString())));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(e,t.targetId).next((s=>{s.forEach((i=>this.b_.add(i.toString())))})).next((()=>n.removeTargetData(e,t)))}f_(){this.y_=new Set}m_(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return b.forEach(this.b_,(n=>{const s=J.fromPath(n);return this.S_(e,s).next((i=>{i||t.removeEntry(s,te.min())}))})).next((()=>(this.y_=null,t.apply(e))))}updateLimboDocument(e,t){return this.S_(e,t).next((n=>{n?this.b_.delete(t.toString()):this.b_.add(t.toString())}))}V_(e){return 0}S_(e,t){return b.or([()=>b.resolve(this.g_.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.p_(e,t)])}}class tu{constructor(e,t){this.persistence=e,this.v_=new Zn((n=>yt(n.path)),((n,s)=>n.isEqual(s))),this.garbageCollector=aE(this,t)}static w_(e,t){return new tu(e,t)}f_(){}m_(e){return b.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}rr(e){const t=this.xs(e);return this.persistence.getTargetCache().getTargetCount(e).next((n=>t.next((s=>n+s))))}xs(e){let t=0;return this.ir(e,(n=>{t++})).next((()=>t))}ir(e,t){return b.forEach(this.v_,((n,s)=>this.Fs(e,n,s).next((i=>i?b.resolve():t(s)))))}removeTargets(e,t,n){return this.persistence.getTargetCache().removeTargets(e,t,n)}removeOrphanedDocuments(e,t){let n=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.u_(e,(o=>this.Fs(e,o,t).next((a=>{a||(n++,i.removeEntry(o,te.min()))})))).next((()=>i.apply(e))).next((()=>n))}markPotentiallyOrphaned(e,t){return this.v_.set(t,e.currentSequenceNumber),b.resolve()}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,n)}addReference(e,t,n){return this.v_.set(n,e.currentSequenceNumber),b.resolve()}removeReference(e,t,n){return this.v_.set(n,e.currentSequenceNumber),b.resolve()}updateLimboDocument(e,t){return this.v_.set(t,e.currentSequenceNumber),b.resolve()}V_(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=Dc(e.data.value)),t}Fs(e,t,n){return b.or([()=>this.persistence.p_(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.v_.get(t);return b.resolve(s!==void 0&&s>n)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
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
 */class MN{constructor(e){this.serializer=e}Mn(e,t,n,s){const i=new vu("createOrUpgrade",t);n<1&&s>=1&&((function(c){c.createObjectStore(Fa)})(e),(function(c){c.createObjectStore(da,{keyPath:qS}),c.createObjectStore(rn,{keyPath:vp,autoIncrement:!0}).createIndex(cs,Pp,{unique:!0}),c.createObjectStore(Ii)})(e),zp(e),(function(c){c.createObjectStore(es)})(e));let o=b.resolve();return n<3&&s>=3&&(n!==0&&((function(c){c.deleteObjectStore(wi),c.deleteObjectStore(yi),c.deleteObjectStore(hs)})(e),zp(e)),o=o.next((()=>(function(c){const l=c.store(hs),B={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:te.min().toTimestamp(),targetCount:0};return l.put($c,B)})(i)))),n<4&&s>=4&&(n!==0&&(o=o.next((()=>(function(c,l){return l.store(rn).Kn().next((d=>{c.deleteObjectStore(rn),c.createObjectStore(rn,{keyPath:vp,autoIncrement:!0}).createIndex(cs,Pp,{unique:!0});const C=l.store(rn),g=d.map((I=>C.put(I)));return b.waitFor(g)}))})(e,i)))),o=o.next((()=>{(function(c){c.createObjectStore(Di,{keyPath:XS})})(e)}))),n<5&&s>=5&&(o=o.next((()=>this.D_(i)))),n<6&&s>=6&&(o=o.next((()=>((function(c){c.createObjectStore(fa)})(e),this.x_(i))))),n<7&&s>=7&&(o=o.next((()=>this.C_(i)))),n<8&&s>=8&&(o=o.next((()=>this.F_(e,i)))),n<9&&s>=9&&(o=o.next((()=>{(function(c){c.objectStoreNames.contains("remoteDocumentChanges")&&c.deleteObjectStore("remoteDocumentChanges")})(e)}))),n<10&&s>=10&&(o=o.next((()=>this.O_(i)))),n<11&&s>=11&&(o=o.next((()=>{(function(c){c.createObjectStore(Lu,{keyPath:ZS})})(e),(function(c){c.createObjectStore(xu,{keyPath:eN})})(e)}))),n<12&&s>=12&&(o=o.next((()=>{(function(c){const l=c.createObjectStore(Vu,{keyPath:aN});l.createIndex(wB,cN,{unique:!1}),l.createIndex(ME,uN,{unique:!1})})(e)}))),n<13&&s>=13&&(o=o.next((()=>(function(c){const l=c.createObjectStore(Qc,{keyPath:JS});l.createIndex(bc,KS),l.createIndex(kE,zS)})(e))).next((()=>this.M_(e,i))).next((()=>e.deleteObjectStore(es)))),n<14&&s>=14&&(o=o.next((()=>this.N_(e,i)))),n<15&&s>=15&&(o=o.next((()=>(function(c){c.createObjectStore($h,{keyPath:tN,autoIncrement:!0}).createIndex(yB,nN,{unique:!1}),c.createObjectStore(Jo,{keyPath:rN}).createIndex(xE,sN,{unique:!1}),c.createObjectStore(Ko,{keyPath:iN}).createIndex(VE,oN,{unique:!1})})(e)))),n<16&&s>=16&&(o=o.next((()=>{t.objectStore(Jo).clear()})).next((()=>{t.objectStore(Ko).clear()}))),n<17&&s>=17&&(o=o.next((()=>{(function(c){c.createObjectStore(Yh,{keyPath:lN})})(e)}))),n<18&&s>=18&&Dg()&&(o=o.next((()=>{t.objectStore(Jo).clear()})).next((()=>{t.objectStore(Ko).clear()}))),o}x_(e){let t=0;return e.store(es).jn(((n,s)=>{t+=Yc(s)})).next((()=>{const n={byteSize:t};return e.store(fa).put(IB,n)}))}D_(e){const t=e.store(da),n=e.store(rn);return t.Kn().next((s=>b.forEach(s,(i=>{const o=IDBKeyRange.bound([i.userId,Tr],[i.userId,i.lastAcknowledgedBatchId]);return n.Kn(cs,o).next((a=>b.forEach(a,(c=>{q(c.userId===i.userId,18650,"Cannot process batch from unexpected user",{batchId:c.batchId});const l=rs(this.serializer,c);return jE(e,i.userId,l).next((()=>{}))}))))}))))}C_(e){const t=e.store(wi),n=e.store(es);return e.store(hs).get($c).next((s=>{const i=[];return n.jn(((o,a)=>{const c=new ce(o),l=(function(d){return[0,yt(d)]})(c);i.push(t.get(l).next((B=>B?b.resolve():(d=>t.put({targetId:0,path:yt(d),sequenceNumber:s.highestListenSequenceNumber}))(c))))})).next((()=>b.waitFor(i)))}))}F_(e,t){e.createObjectStore(Ca,{keyPath:YS});const n=t.store(Ca),s=new td,i=o=>{if(s.add(o)){const a=o.lastSegment(),c=o.popLast();return n.put({collectionId:a,parent:yt(c)})}};return t.store(es).jn({zn:!0},((o,a)=>{const c=new ce(o);return i(c.popLast())})).next((()=>t.store(Ii).jn({zn:!0},(([o,a,c],l)=>{const B=gn(a);return i(B.popLast())}))))}O_(e){const t=e.store(yi);return t.jn(((n,s)=>{const i=So(this.serializer,s),o=KE(this.serializer,i);return t.put(o)}))}M_(e,t){const n=t.store(es),s=[];return n.jn(((i,o)=>{const a=t.store(Qc),c=(function(d){return d.document?new J(ce.fromString(d.document.name).popFirst(5)):d.noDocument?J.fromSegments(d.noDocument.path):d.unknownDocument?J.fromSegments(d.unknownDocument.path):Y(36783)})(o).path.toArray(),l={prefixPath:c.slice(0,c.length-2),collectionGroup:c[c.length-2],documentId:c[c.length-1],readTime:o.readTime||[0,0],unknownDocument:o.unknownDocument,noDocument:o.noDocument,document:o.document,hasCommittedMutations:!!o.hasCommittedMutations};s.push(a.put(l))})).next((()=>b.waitFor(s)))}N_(e,t){const n=t.store(rn),s=eI(this.serializer),i=new rd(qu.w_,this.serializer.qr);return n.Kn().next((o=>{const a=new Map;return o.forEach((c=>{let l=a.get(c.userId)??ae();rs(this.serializer,c).keys().forEach((B=>l=l.add(B))),a.set(c.userId,l)})),b.forEach(a,((c,l)=>{const B=new Bt(l),d=Uu.Kr(this.serializer,B),C=i.getIndexManager(B),g=Gu.Kr(B,this.serializer,C,i.referenceDelegate);return new tI(s,g,d,C).recalculateAndSaveOverlaysForDocumentKeys(new DB(t,Lt.yn),c).next()}))}))}}function zp(r){r.createObjectStore(wi,{keyPath:QS}).createIndex(Qh,$S,{unique:!0}),r.createObjectStore(yi,{keyPath:"targetId"}).createIndex(LE,WS,{unique:!0}),r.createObjectStore(hs)}const hr="IndexedDbPersistence",Gl=18e5,Ul=5e3,Hl="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.",nI="main";class sd{constructor(e,t,n,s,i,o,a,c,l,B,d=18){if(this.allowTabSynchronization=e,this.persistenceKey=t,this.clientId=n,this.xt=i,this.window=o,this.document=a,this.L_=l,this.B_=B,this.U_=d,this.P_=null,this.R_=!1,this.isPrimary=!1,this.networkEnabled=!0,this.k_=null,this.inForeground=!1,this.q_=null,this.K_=null,this.Q_=Number.NEGATIVE_INFINITY,this.W_=C=>Promise.resolve(),!sd.Je())throw new M(O.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new AN(this,s),this.G_=t+nI,this.serializer=new JE(c),this.z_=new yn(this.G_,this.U_,new MN(this.serializer)),this.I_=new gN,this.A_=new TN(this.referenceDelegate,this.serializer),this.remoteDocumentCache=eI(this.serializer),this.d_=new pN,this.window&&this.window.localStorage?this.j_=this.window.localStorage:(this.j_=null,B===!1&&qe(hr,"LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.H_().then((()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new M(O.FAILED_PRECONDITION,Hl);return this.J_(),this.Y_(),this.Z_(),this.runTransaction("getHighestListenSequenceNumber","readonly",(e=>this.A_.getHighestSequenceNumber(e)))})).then((e=>{this.P_=new Lt(e,this.L_)})).then((()=>{this.R_=!0})).catch((e=>(this.z_&&this.z_.close(),Promise.reject(e))))}X_(e){return this.W_=async t=>{if(this.started)return e(t)},e(this.isPrimary)}setDatabaseDeletedListener(e){this.z_.Ln((async t=>{t.newVersion===null&&await e()}))}setNetworkEnabled(e){this.networkEnabled!==e&&(this.networkEnabled=e,this.xt.enqueueAndForget((async()=>{this.started&&await this.H_()})))}H_(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",(e=>gc(e).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next((()=>{if(this.isPrimary)return this.eo(e).next((t=>{t||(this.isPrimary=!1,this.xt.enqueueRetryable((()=>this.W_(!1))))}))})).next((()=>this.no(e))).next((t=>this.isPrimary&&!t?this.ro(e).next((()=>!1)):!!t&&this.io(e).next((()=>!0)))))).catch((e=>{if(Hr(e))return U(hr,"Failed to extend owner lease: ",e),this.isPrimary;if(!this.allowTabSynchronization)throw e;return U(hr,"Releasing owner lease after error during lease refresh",e),!1})).then((e=>{this.isPrimary!==e&&this.xt.enqueueRetryable((()=>this.W_(e))),this.isPrimary=e}))}eo(e){return Do(e).get(Gs).next((t=>b.resolve(this.so(t))))}_o(e){return gc(e).delete(this.clientId)}async oo(){if(this.isPrimary&&!this.ao(this.Q_,Gl)){this.Q_=Date.now();const e=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",(t=>{const n=ct(t,Di);return n.Kn().next((s=>{const i=this.uo(s,Gl),o=s.filter((a=>i.indexOf(a)===-1));return b.forEach(o,(a=>n.delete(a.clientId))).next((()=>o))}))})).catch((()=>[]));if(this.j_)for(const t of e)this.j_.removeItem(this.co(t.clientId))}}Z_(){this.K_=this.xt.enqueueAfterDelay("client_metadata_refresh",4e3,(()=>this.H_().then((()=>this.oo())).then((()=>this.Z_()))))}so(e){return!!e&&e.ownerId===this.clientId}no(e){return this.B_?b.resolve(!0):Do(e).get(Gs).next((t=>{if(t!==null&&this.ao(t.leaseTimestampMs,Ul)&&!this.lo(t.ownerId)){if(this.so(t)&&this.networkEnabled)return!0;if(!this.so(t)){if(!t.allowTabSynchronization)throw new M(O.FAILED_PRECONDITION,Hl);return!1}}return!(!this.networkEnabled||!this.inForeground)||gc(e).Kn().next((n=>this.uo(n,Ul).find((s=>{if(this.clientId!==s.clientId){const i=!this.networkEnabled&&s.networkEnabled,o=!this.inForeground&&s.inForeground,a=this.networkEnabled===s.networkEnabled;if(i||o&&a)return!0}return!1}))===void 0))})).next((t=>(this.isPrimary!==t&&U(hr,`Client ${t?"is":"is not"} eligible for a primary lease.`),t)))}async shutdown(){this.R_=!1,this.Eo(),this.K_&&(this.K_.cancel(),this.K_=null),this.ho(),this.To(),await this.z_.runTransaction("shutdown","readwrite",[Fa,Di],(e=>{const t=new DB(e,Lt.yn);return this.ro(t).next((()=>this._o(t)))})),this.z_.close(),this.Po()}uo(e,t){return e.filter((n=>this.ao(n.updateTimeMs,t)&&!this.lo(n.clientId)))}Ro(){return this.runTransaction("getActiveClients","readonly",(e=>gc(e).Kn().next((t=>this.uo(t,Gl).map((n=>n.clientId))))))}get started(){return this.R_}getGlobalsCache(){return this.I_}getMutationQueue(e,t){return Gu.Kr(e,this.serializer,t,this.referenceDelegate)}getTargetCache(){return this.A_}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(e){return new DN(e,this.serializer.qr.databaseId)}getDocumentOverlayCache(e){return Uu.Kr(this.serializer,e)}getBundleCache(){return this.d_}runTransaction(e,t,n){U(hr,"Starting transaction:",e);const s=t==="readonly"?"readonly":"readwrite",i=(function(c){return c===18?dN:c===17?qE:c===16?hN:c===15?Xh:c===14?HE:c===13?UE:c===12?BN:c===11?GE:void Y(60245)})(this.U_);let o;return this.z_.runTransaction(e,s,i,(a=>(o=new DB(a,this.P_?this.P_.next():Lt.yn),t==="readwrite-primary"?this.eo(o).next((c=>!!c||this.no(o))).next((c=>{if(!c)throw qe(`Failed to obtain primary lease for action '${e}'.`),this.isPrimary=!1,this.xt.enqueueRetryable((()=>this.W_(!1))),new M(O.FAILED_PRECONDITION,nE);return n(o)})).next((c=>this.io(o).next((()=>c)))):this.Io(o).next((()=>n(o)))))).then((a=>(o.raiseOnCommittedEvent(),a)))}Io(e){return Do(e).get(Gs).next((t=>{if(t!==null&&this.ao(t.leaseTimestampMs,Ul)&&!this.lo(t.ownerId)&&!this.so(t)&&!(this.B_||this.allowTabSynchronization&&t.allowTabSynchronization))throw new M(O.FAILED_PRECONDITION,Hl)}))}io(e){const t={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return Do(e).put(Gs,t)}static Je(){return yn.Je()}ro(e){const t=Do(e);return t.get(Gs).next((n=>this.so(n)?(U(hr,"Releasing primary lease."),t.delete(Gs)):b.resolve()))}ao(e,t){const n=Date.now();return!(e<n-t)&&(!(e>n)||(qe(`Detected an update time that is in the future: ${e} > ${n}`),!1))}J_(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.q_=()=>{this.xt.enqueueAndForget((()=>(this.inForeground=this.document.visibilityState==="visible",this.H_())))},this.document.addEventListener("visibilitychange",this.q_),this.inForeground=this.document.visibilityState==="visible")}ho(){this.q_&&(this.document.removeEventListener("visibilitychange",this.q_),this.q_=null)}Y_(){var e;typeof((e=this.window)==null?void 0:e.addEventListener)=="function"&&(this.k_=()=>{this.Eo();const t=/(?:Version|Mobile)\/1[456]/;wg()&&(navigator.appVersion.match(t)||navigator.userAgent.match(t))&&this.xt.enterRestrictedMode(!0),this.xt.enqueueAndForget((()=>this.shutdown()))},this.window.addEventListener("pagehide",this.k_))}To(){this.k_&&(this.window.removeEventListener("pagehide",this.k_),this.k_=null)}lo(e){var t;try{const n=((t=this.j_)==null?void 0:t.getItem(this.co(e)))!==null;return U(hr,`Client '${e}' ${n?"is":"is not"} zombied in LocalStorage`),n}catch(n){return qe(hr,"Failed to get zombied client id.",n),!1}}Eo(){if(this.j_)try{this.j_.setItem(this.co(this.clientId),String(Date.now()))}catch(e){qe("Failed to set zombie client id.",e)}}Po(){if(this.j_)try{this.j_.removeItem(this.co(this.clientId))}catch{}}co(e){return`firestore_zombie_${this.persistenceKey}_${e}`}}function Do(r){return ct(r,Fa)}function gc(r){return ct(r,Di)}function id(r,e){let t=r.projectId;return r.isDefaultDatabase||(t+="."+r.database),"firestore/"+e+"/"+t+"/"}/**
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
 */class od{constructor(e,t,n,s){this.targetId=e,this.fromCache=t,this.Ao=n,this.Vo=s}static fo(e,t){let n=ae(),s=ae();for(const i of t.docChanges)switch(i.type){case 0:n=n.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new od(e,t.fromCache,n,s)}}/**
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
 */function GN(r,e){return J.comparator(r.key,e.key)}/**
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
 */class UN{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class rI{constructor(){this.mo=!1,this.po=!1,this.yo=100,this.wo=(function(){return wg()?8:sE(rt())>0?6:4})()}initialize(e,t){this.bo=e,this.indexManager=t,this.mo=!0}getDocumentsMatchingQuery(e,t,n,s){const i={result:null};return this.So(e,t).next((o=>{i.result=o})).next((()=>{if(!i.result)return this.vo(e,t,s,n).next((o=>{i.result=o}))})).next((()=>{if(i.result)return;const o=new UN;return this.Do(e,t,o).next((a=>{if(i.result=a,this.po)return this.xo(e,t,o,a.size)}))})).next((()=>i.result))}xo(e,t,n,s){return Ge(t)?b.resolve():n.documentReadCount<this.yo?(Ws()<=Ce.DEBUG&&U("QueryEngine","SDK will not create cache indexes for query:",Mo(t),"since it only creates cache indexes for collection contains","more than or equal to",this.yo,"documents"),b.resolve()):(Ws()<=Ce.DEBUG&&U("QueryEngine","Query:",Mo(t),"scans",n.documentReadCount,"local documents and returns",s,"documents as results."),n.documentReadCount>this.wo*s?(Ws()<=Ce.DEBUG&&U("QueryEngine","The SDK decides to create cache indexes for query:",Mo(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,It(t))):b.resolve())}So(e,t){if(Ge(t))return b.resolve(null);let n=t;if(up(n))return b.resolve(null);let s=It(n);return this.indexManager.getIndexType(e,s).next((i=>i===0?null:(n.limit!==null&&i===1&&(n=jc(n,null,"F"),s=It(n)),this.indexManager.getDocumentsMatchingTarget(e,s).next((o=>{const a=ae(...o);return this.bo.getDocuments(e,a).next((c=>this.indexManager.getMinOffset(e,s).next((l=>{const B=this.Co(n,c);return this.Fo(n,B,a,l.readTime)?this.So(e,jc(n,null,"F")):this.Oo(e,B,n,l)}))))})))))}vo(e,t,n,s){return(Ge(t)?(function(o){for(const a of o.stages){if(a instanceof kr||a instanceof Tp)return!1;if(a instanceof Sa){if(a.condition instanceof IE&&a.condition._expr.name==="exists"&&a.condition._expr.params[0]instanceof Ns&&a.condition._expr.params[0].fieldName===fn)continue;return!1}}return!0})(t):up(t))||s.isEqual(te.min())?b.resolve(null):this.bo.getDocuments(e,n).next((i=>{const o=this.Co(t,i);return this.Fo(t,o,n,s)?b.resolve(null):(Ws()<=Ce.DEBUG&&U("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),Ap(t)),this.Oo(e,o,t,y_(s,pi)).next((a=>a)))}))}Co(e,t){let n,s;return Ge(e)?(n=new De(GN),s=i=>Hu(e,i)):(n=new De(Tu(e)),s=i=>Du(e,i)),t.forEach(((i,o)=>{s(o)&&(n=n.add(o))})),n}Fo(e,t,n,s){if(Ge(e))return(function(a){return a.stages.some((c=>c instanceof kr||c instanceof Tp))})(e);if(e.limit===null)return!1;if(n.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Do(e,t,n){return Ws()<=Ce.DEBUG&&U("QueryEngine","Using full collection scan to execute query:",Ap(t)),this.bo.getDocumentsMatchingQuery(e,t,Kt.min(),n)}Oo(e,t,n,s){return this.bo.getDocumentsMatchingQuery(e,n,s).next((i=>(t.forEach((o=>{i=i.insert(o.key,o)})),i)))}}/**
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
 */const ad="LocalStore",HN=3e8;class qN{constructor(e,t,n,s){this.persistence=e,this.Mo=t,this.serializer=s,this.No=new be(ie),this.Lo=new Zn((i=>ku(i)),Kh),this.Bo=new Map,this.Uo=e.getRemoteDocumentCache(),this.A_=e.getTargetCache(),this.d_=e.getBundleCache(),this.ko(n)}ko(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new tI(this.Uo,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Uo.setIndexManager(this.indexManager),this.Mo.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(t=>e.collect(t,this.No)))}}function sI(r,e,t,n){return new qN(r,e,t,n)}async function iI(r,e){const t=W(r);return await t.persistence.runTransaction("Handle user change","readonly",(n=>{let s;return t.mutationQueue.getAllMutationBatches(n).next((i=>(s=i,t.ko(e),t.mutationQueue.getAllMutationBatches(n)))).next((i=>{const o=[],a=[];let c=ae();for(const l of s){o.push(l.batchId);for(const B of l.mutations)c=c.add(B.key)}for(const l of i){a.push(l.batchId);for(const B of l.mutations)c=c.add(B.key)}return t.localDocuments.getDocuments(n,c).next((l=>({qo:l,removedBatchIds:o,addedBatchIds:a})))}))}))}function jN(r,e){const t=W(r);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",(n=>{const s=e.batch.keys(),i=t.Uo.newChangeBuffer({trackRemovals:!0});return(function(a,c,l,B){const d=l.batch,C=d.keys();let g=b.resolve();return C.forEach((I=>{g=g.next((()=>B.getEntry(c,I))).next((P=>{const F=l.docVersions.get(I);q(F!==null,48541),P.version.compareTo(F)<0&&(d.applyToRemoteDocument(P,l),P.isValidDocument()&&(P.setReadTime(l.commitVersion),B.addEntry(P)))}))})),g.next((()=>a.mutationQueue.removeMutationBatch(c,d)))})(t,n,e,i).next((()=>i.apply(n))).next((()=>t.mutationQueue.performConsistencyCheck(n))).next((()=>t.documentOverlayCache.removeOverlaysForBatchId(n,s,e.batch.batchId))).next((()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(n,(function(a){let c=ae();for(let l=0;l<a.mutationResults.length;++l)a.mutationResults[l].transformResults.length>0&&(c=c.add(a.batch.mutations[l].key));return c})(e)))).next((()=>t.localDocuments.getDocuments(n,s)))}))}function oI(r){const e=W(r);return e.persistence.runTransaction("Get last remote snapshot version","readonly",(t=>e.A_.getLastRemoteSnapshotVersion(t)))}function JN(r,e){const t=W(r),n=e.snapshotVersion;let s=t.No;return t.persistence.runTransaction("Apply remote event","readwrite-primary",(i=>{const o=t.Uo.newChangeBuffer({trackRemovals:!0});s=t.No;const a=[];e.targetChanges.forEach(((B,d)=>{const C=s.get(d);if(!C)return;a.push(t.A_.removeMatchingKeys(i,B.removedDocuments,d).next((()=>t.A_.addMatchingKeys(i,B.addedDocuments,d))));let g=C.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(d)!==null?g=g.withResumeToken(Oe.EMPTY_BYTE_STRING,te.min()).withLastLimboFreeSnapshotVersion(te.min()):B.resumeToken.approximateByteSize()>0&&(g=g.withResumeToken(B.resumeToken,n)),s=s.insert(d,g),(function(P,F,H){return P.resumeToken.approximateByteSize()===0||F.snapshotVersion.toMicroseconds()-P.snapshotVersion.toMicroseconds()>=HN?!0:H.addedDocuments.size+H.modifiedDocuments.size+H.removedDocuments.size>0})(C,g,B)&&a.push(t.A_.updateTargetData(i,g))}));let c=$e(),l=ae();if(e.documentUpdates.forEach((B=>{e.resolvedLimboDocuments.has(B)&&a.push(t.persistence.referenceDelegate.updateLimboDocument(i,B))})),a.push(aI(i,o,e.documentUpdates).next((B=>{c=B.$o,l=B.Ko}))),!n.isEqual(te.min())){const B=t.A_.getLastRemoteSnapshotVersion(i).next((d=>t.A_.setTargetsMetadata(i,i.currentSequenceNumber,n)));a.push(B)}return b.waitFor(a).next((()=>o.apply(i))).next((()=>t.localDocuments.getLocalViewOfDocuments(i,c,l))).next((()=>c))})).then((i=>(t.No=s,i)))}function aI(r,e,t){let n=ae(),s=ae();return t.forEach((i=>n=n.add(i))),e.getEntries(r,n).next((i=>{let o=$e();return t.forEach(((a,c)=>{const l=i.get(a);c.isFoundDocument()!==l.isFoundDocument()&&(s=s.add(a)),c.isNoDocument()&&c.version.isEqual(te.min())?(e.removeEntry(a,c.readTime),o=o.insert(a,c)):!l.isValidDocument()||c.version.compareTo(l.version)>0||c.version.compareTo(l.version)===0&&l.hasPendingWrites?(e.addEntry(c),o=o.insert(a,c)):U(ad,"Ignoring outdated watch update for ",a,". Current version:",l.version," Watch version:",c.version)})),{$o:o,Ko:s}}))}function KN(r,e){const t=W(r);return t.persistence.runTransaction("Get next mutation batch","readonly",(n=>(e===void 0&&(e=Tr),t.mutationQueue.getNextMutationBatchAfterBatchId(n,e))))}function Ti(r,e){const t=W(r);return t.persistence.runTransaction("Allocate target","readwrite",(n=>{let s;return t.A_.getTargetData(n,e).next((i=>i?(s=i,b.resolve(s)):t.A_.allocateTargetId(n).next((o=>(s=new mn(e,o,"TargetPurposeListen",n.currentSequenceNumber),t.A_.addTargetData(n,s).next((()=>s)))))))})).then((n=>{const s=t.No.get(n.targetId);return(s===null||n.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.No=t.No.insert(n.targetId,n),t.Lo.set(e,n.targetId)),n}))}async function Ai(r,e,t){const n=W(r),s=n.No.get(e),i=t?"readwrite":"readwrite-primary";try{t||await n.persistence.runTransaction("Release target",i,(o=>n.persistence.referenceDelegate.removeTarget(o,s)))}catch(o){if(!Hr(o))throw o;U(ad,`Failed to update sequence numbers for target ${e}: ${o}`)}n.No=n.No.remove(e),n.Lo.delete(s.target)}function nu(r,e,t){const n=W(r);let s=te.min(),i=ae();return n.persistence.runTransaction("Execute query","readwrite",(o=>(function(c,l,B){const d=W(c),C=d.Lo.get(B);return C!==void 0?b.resolve(d.No.get(C)):d.A_.getTargetData(l,B)})(n,o,Ge(e)?e:It(e)).next((a=>{if(a)return s=a.lastLimboFreeSnapshotVersion,n.A_.getMatchingKeysForTargetId(o,a.targetId).next((c=>{i=c}))})).next((()=>n.Mo.getDocumentsMatchingQuery(o,e,t?s:te.min(),t?i:ae()))).next((a=>(uI(n,a),{documents:a,Qo:i})))))}function cI(r,e){const t=W(r),n=W(t.A_),s=t.No.get(e);return s?Promise.resolve(s.target??null):t.persistence.runTransaction("Get target data","readonly",(i=>n.ge(i,e).next((o=>(o==null?void 0:o.target)??null))))}function PB(r,e){const t=W(r),n=t.Bo.get(e)||te.min();return t.persistence.runTransaction("Get new document changes","readonly",(s=>t.Uo.getAllFromCollectionGroup(s,e,y_(n,pi),Number.MAX_SAFE_INTEGER))).then((s=>(uI(t,s),s)))}function uI(r,e){e.forEach(((t,n)=>{const s=n.key.getCollectionGroup(),i=r.Bo.get(s)||te.min();n.readTime.compareTo(i)>0&&r.Bo.set(s,n.readTime)}))}async function zN(r,e,t,n){const s=W(r);let i=ae(),o=$e();for(const l of t){const B=e.Wo(l.metadata.name);l.document&&(i=i.add(B));const d=e.Go(l);d.setReadTime(e.zo(l.metadata.readTime)),o=o.insert(B,d)}const a=s.Uo.newChangeBuffer({trackRemovals:!0}),c=await Ti(s,(function(B){return It(qi(ce.fromString(`__bundle__/docs/${B}`)))})(n));return s.persistence.runTransaction("Apply bundle documents","readwrite",(l=>aI(l,a,o).next((B=>(a.apply(l),B))).next((B=>s.A_.removeMatchingKeysForTargetId(l,c.targetId).next((()=>s.A_.addMatchingKeys(l,i,c.targetId))).next((()=>s.localDocuments.getLocalViewOfDocuments(l,B.$o,B.Ko))).next((()=>B.$o))))))}async function WN(r,e,t=ae()){const n=await Ti(r,It(Mu(e.bundledQuery))),s=W(r);return s.persistence.runTransaction("Save named query","readwrite",(i=>{const o=Je(e.readTime);if(n.snapshotVersion.compareTo(o)>=0)return s.d_.saveNamedQuery(i,e);const a=n.withResumeToken(Oe.EMPTY_BYTE_STRING,o);return s.No=s.No.insert(a.targetId,a),s.A_.updateTargetData(i,a).next((()=>s.A_.removeMatchingKeysForTargetId(i,n.targetId))).next((()=>s.A_.addMatchingKeys(i,t,n.targetId))).next((()=>s.d_.saveNamedQuery(i,e)))}))}/**
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
 */class lI{constructor(e,t){this.jo=e,this.byteLength=t}Ho(){return"metadata"in this.jo}}/**
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
 */function Wp(r,e=10240){let t=0;return{async read(){if(t<r.byteLength){const n={value:r.slice(t,t+e),done:!1};return t+=e,n}return{done:!0}},async cancel(){},releaseLock(){},closed:Promise.resolve()}}/**
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
 */class QN{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.Jo=0,this.Yo=null,this.Zo=!0}Xo(){this.Jo===0&&(this.ea("Unknown"),this.Yo=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this.Yo=null,this.ta("Backend didn't respond within 10 seconds."),this.ea("Offline"),Promise.resolve()))))}na(e){this.state==="Online"?this.ea("Unknown"):(this.Jo++,this.Jo>=1&&(this.ra(),this.ta(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ea("Offline")))}set(e){this.ra(),this.Jo=0,e==="Online"&&(this.Zo=!1),this.ea(e)}ea(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ta(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Zo?(qe(t),this.Zo=!1):U("OnlineStateTracker",t)}ra(){this.Yo!==null&&(this.Yo.cancel(),this.Yo=null)}}/**
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
 */const Rn="RemoteStore";class $N{constructor(e,t,n,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=n,this.remoteSyncer={},this.ia=[],this.sa=new Map,this._a=new Map,this.oa=new Map,this.aa=new Wn(1e3),this.ua=new Wn(1001),this.ca=new Set,this.la=[],this.Ea=i,this.Ea.Ke((o=>{n.enqueueAndForget((async()=>{qr(this)&&(U(Rn,"Restarting streams for network reachability change."),await(async function(c){const l=W(c);l.ca.add(4),await zi(l),l.ha.set("Unknown"),l.ca.delete(4),await ka(l)})(this))}))})),this.ha=new QN(n,s)}}async function ka(r){if(qr(r))for(const e of r.la)await e(!0)}async function zi(r){for(const e of r.la)await e(!1)}function bB(r,e){return r._a.get(e)||void 0}function ju(r,e){const t=W(r),n=bB(t,e.targetId);if(n!==void 0&&t.sa.has(n))return;const s=(function(a,c){const l=bB(a,c);l!==void 0&&a.oa.delete(l);const B=(function(C,g){return g%2!=0?C.ua.next():C.aa.next()})(a,c);return a._a.set(c,B),a.oa.set(B,c),B})(t,e.targetId);U(Rn,"remoteStoreListen mapping SDK target ID to remote",e.targetId,s);const i=new mn(e.target,s,e.purpose,e.sequenceNumber,e.snapshotVersion,e.lastLimboFreeSnapshotVersion,e.resumeToken);t.sa.set(s,i),ld(t)?ud(t):Qi(t).Jt()&&cd(t,i)}function Ri(r,e){const t=W(r),n=Qi(t),s=bB(t,e);U(Rn,"remoteStoreUnlisten removing mapping of SDK target ID to remote",e,s),t.sa.delete(s),t._a.delete(e),t.oa.delete(s),n.Jt()&&BI(t,s),t.sa.size===0&&(n.Jt()?n.Xt():qr(t)&&t.ha.set("Unknown"))}function cd(r,e){if(r.Ta.H(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(te.min())>0){const t=r.oa.get(e.targetId);if(t===void 0)return void U(Rn,"SDK target ID not found for remote ID: "+e.targetId);const n=r.remoteSyncer.getRemoteKeysForTarget(t).size;e=e.withExpectedCount(n)}Qi(r).Tn(e)}function BI(r,e){r.Ta.H(e),Qi(r).Pn(e)}function ud(r){r.Ta=new yP({getRemoteKeysForTarget:e=>{const t=r.oa.get(e);return t!==void 0?r.remoteSyncer.getRemoteKeysForTarget(t):ae()},ge:e=>r.sa.get(e)||null,Ae:()=>r.datastore.serializer.databaseId}),Qi(r).start(),r.ha.Xo()}function ld(r){return qr(r)&&!Qi(r).Ht()&&r.sa.size>0}function qr(r){return W(r).ca.size===0}function hI(r){r.Ta=void 0}async function YN(r){r.ha.set("Online")}async function XN(r){r.sa.forEach(((e,t)=>{cd(r,e)}))}async function ZN(r,e){hI(r),ld(r)?(r.ha.na(e),ud(r)):r.ha.set("Unknown")}async function e0(r,e,t){if(r.ha.set("Online"),e instanceof k_&&e.state===2&&e.cause)try{await(async function(s,i){const o=i.cause;for(const a of i.targetIds){if(s.sa.has(a)){const c=s.oa.get(a);c!==void 0&&(await s.remoteSyncer.rejectListen(c,o),s._a.delete(c),s.oa.delete(a)),s.sa.delete(a)}s.Ta.removeTarget(a)}})(r,e)}catch(n){U(Rn,"Failed to remove targets %s: %s ",e.targetIds.join(","),n),await ru(r,n)}else if(e instanceof Ac?r.Ta.se(e):e instanceof F_?r.Ta.Ee(e):r.Ta.ae(e),!t.isEqual(te.min()))try{const n=await oI(r.localStore);t.compareTo(n)>=0&&await(function(i,o){const a=i.Ta.de(o);a.targetChanges.forEach(((l,B)=>{if(l.resumeToken.approximateByteSize()>0){const d=i.sa.get(B);d&&i.sa.set(B,d.withResumeToken(l.resumeToken,o))}})),a.targetMismatches.forEach(((l,B)=>{const d=i.sa.get(l);if(!d)return;i.sa.set(l,d.withResumeToken(Oe.EMPTY_BYTE_STRING,d.snapshotVersion)),BI(i,l);const C=new mn(d.target,l,B,d.sequenceNumber);cd(i,C)}));const c=(function(B,d){const C=new Map;d.targetChanges.forEach(((I,P)=>{const F=B.oa.get(P);F!==void 0&&C.set(F,I)}));let g=new be(ie);return d.targetMismatches.forEach(((I,P)=>{const F=B.oa.get(I);F!==void 0&&(g=g.insert(F,P))})),new ji(d.snapshotVersion,C,g,d.documentUpdates,d.augmentedDocumentUpdates,d.resolvedLimboDocuments)})(i,a);return i.remoteSyncer.applyRemoteEvent(c)})(r,t)}catch(n){U(Rn,"Failed to raise snapshot:",n),await ru(r,n)}}async function ru(r,e,t){if(!Hr(e))throw e;r.ca.add(1),await zi(r),r.ha.set("Offline"),t||(t=()=>oI(r.localStore)),r.asyncQueue.enqueueRetryable((async()=>{U(Rn,"Retrying IndexedDB access"),await t(),r.ca.delete(1),await ka(r)}))}function dI(r,e){return e().catch((t=>ru(r,t,e)))}async function Wi(r){const e=W(r),t=xr(e);let n=e.ia.length>0?e.ia[e.ia.length-1].batchId:Tr;for(;t0(e);)try{const s=await KN(e.localStore,n);if(s===null){e.ia.length===0&&t.Xt();break}n=s.batchId,n0(e,s)}catch(s){await ru(e,s)}fI(e)&&CI(e)}function t0(r){return qr(r)&&r.ia.length<10}function n0(r,e){r.ia.push(e);const t=xr(r);t.Jt()&&t.Rn&&t.In(e.mutations)}function fI(r){return qr(r)&&!xr(r).Ht()&&r.ia.length>0}function CI(r){xr(r).start()}async function r0(r){xr(r).dn()}async function s0(r){const e=xr(r);for(const t of r.ia)e.In(t.mutations)}async function i0(r,e,t){const n=r.ia.shift(),s=Wh.from(n,e,t);await dI(r,(()=>r.remoteSyncer.applySuccessfulWrite(s))),await Wi(r)}async function o0(r,e){e&&xr(r).Rn&&await(async function(n,s){if((function(o){return v_(o)&&o!==O.ABORTED})(s.code)){const i=n.ia.shift();xr(n).Zt(),await dI(n,(()=>n.remoteSyncer.rejectFailedWrite(i.batchId,s))),await Wi(n)}})(r,e),fI(r)&&CI(r)}async function Qp(r,e){const t=W(r);t.asyncQueue.verifyOperationInProgress(),U(Rn,"RemoteStore received new credentials");const n=qr(t);t.ca.add(3),await zi(t),n&&t.ha.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.ca.delete(3),await ka(t)}async function SB(r,e){const t=W(r);e?(t.ca.delete(2),await ka(t)):e||(t.ca.add(2),await zi(t),t.ha.set("Unknown"))}function Qi(r){return r.Pa||(r.Pa=(function(t,n,s){const i=W(t);return i.mn(),new KP(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(r.datastore,r.asyncQueue,{ut:YN.bind(null,r),lt:XN.bind(null,r),ht:ZN.bind(null,r),hn:e0.bind(null,r)}),r.la.push((async e=>{e?(r.Pa.Zt(),ld(r)?ud(r):r.ha.set("Unknown")):(await r.Pa.stop(),hI(r))}))),r.Pa}function xr(r){return r.Ra||(r.Ra=(function(t,n,s){const i=W(t);return i.mn(),new zP(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(r.datastore,r.asyncQueue,{ut:()=>Promise.resolve(),lt:r0.bind(null,r),ht:o0.bind(null,r),An:s0.bind(null,r),Vn:i0.bind(null,r)}),r.la.push((async e=>{e?(r.Ra.Zt(),await Wi(r)):(await r.Ra.stop(),r.ia.length>0&&(U(Rn,`Stopping write stream with ${r.ia.length} pending writes`),r.ia=[]))}))),r.Ra}/**
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
 */class Ju{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ia(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ia(this.observer.error,e):qe("Uncaught Error in snapshot listener:",e.toString()))}Aa(){this.muted=!0}Ia(e,t){setTimeout((()=>{this.muted||e(t)}),0)}}/**
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
 */class Bd{constructor(e,t,n,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=n,this.op=s,this.removalCallback=i,this.deferred=new dt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((o=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,n,s,i){const o=Date.now()+n,a=new Bd(e,t,o,s,i);return a.start(n),a}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new M(O.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function $i(r,e){if(qe("AsyncQueue",`${e}: ${r}`),Hr(r))return new M(O.UNAVAILABLE,`${e}: ${r}`);throw r}/**
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
 */class a0{constructor(e,t){this.Va=e,this.serializer=t,this.metadata=new dt,this.buffer=new Uint8Array,this.da=(function(){return new TextDecoder("utf-8")})(),this.fa().then((n=>{n&&n.Ho()?this.metadata.resolve(n.jo.metadata):this.metadata.reject(new Error(`The first element of the bundle is not a metadata, it is
             ${JSON.stringify(n==null?void 0:n.jo)}`))}),(n=>this.metadata.reject(n)))}close(){return this.Va.cancel()}async getMetadata(){return this.metadata.promise}async ma(){return await this.getMetadata(),this.fa()}async fa(){const e=await this.pa();if(e===null)return null;const t=this.da.decode(e),n=Number(t);isNaN(n)&&this.ga(`length string (${t}) is not valid number`);const s=await this.ya(n);return new lI(JSON.parse(s),e.length+n)}wa(){return this.buffer.findIndex((e=>e===123))}async pa(){for(;this.wa()<0&&!await this.ba(););if(this.buffer.length===0)return null;const e=this.wa();e<0&&this.ga("Reached the end of bundle when a length string is expected.");const t=this.buffer.slice(0,e);return this.buffer=this.buffer.slice(e),t}async ya(e){for(;this.buffer.length<e;)await this.ba()&&this.ga("Reached the end of bundle when more is expected.");const t=this.da.decode(this.buffer.slice(0,e));return this.buffer=this.buffer.slice(e),t}ga(e){throw this.Va.cancel(),new Error(`Invalid bundle format: ${e}`)}async ba(){const e=await this.Va.read();if(!e.done){const t=new Uint8Array(this.buffer.length+e.value.length);t.set(this.buffer),t.set(e.value,this.buffer.length),this.buffer=t}return e.done}}/**
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
 */class c0{constructor(e,t){this.bundleData=e,this.serializer=t,this.cursor=0,this.elements=[];let n=this.ma();if(!n||!n.Ho())throw new Error(`The first element of the bundle is not a metadata object, it is
         ${JSON.stringify(n==null?void 0:n.jo)}`);this.metadata=n;do n=this.ma(),n!==null&&this.elements.push(n);while(n!==null)}getMetadata(){return this.metadata}Sa(){return this.elements}ma(){if(this.cursor===this.bundleData.length)return null;const e=this.pa(),t=this.ya(e);return new lI(JSON.parse(t),e)}ya(e){if(this.cursor+e>this.bundleData.length)throw new M(O.INTERNAL,"Reached the end of bundle when more is expected.");return this.bundleData.slice(this.cursor,this.cursor+=e)}pa(){const e=this.cursor;let t=this.cursor;for(;t<this.bundleData.length;){if(this.bundleData[t]==="{"){if(t===e)throw new Error("First character is a bracket and not a number");return this.cursor=t,Number(this.bundleData.slice(e,t))}t++}throw new Error("Reached the end of bundle when more is expected.")}}const zo="IndexBackfiller";class u0{constructor(e,t){this.asyncQueue=e,this.va=t,this.task=null}start(){this.Da(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}Da(e){U(zo,`Scheduled in ${e}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",e,(async()=>{this.task=null;try{const t=await this.va.xa();U(zo,`Documents written: ${t}`)}catch(t){Hr(t)?U(zo,"Ignoring IndexedDB error during index backfill: ",t):await Ur(t)}await this.Da(6e4)}))}}class l0{constructor(e,t){this.localStore=e,this.persistence=t}async xa(e=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",(t=>this.Ca(t,e)))}Ca(e,t){const n=new Set;let s=t,i=!0;return b.doWhile((()=>i===!0&&s>0),(()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(e).next((o=>{if(o!==null&&!n.has(o))return U(zo,`Processing collection: ${o}`),this.Fa(e,o,s).next((a=>{s-=a,n.add(o)}));i=!1})))).next((()=>t-s))}Fa(e,t,n){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(e,t).next((s=>this.localStore.localDocuments.getNextDocuments(e,t,s,n).next((i=>{const o=i.changes;return this.localStore.indexManager.updateIndexEntries(e,o).next((()=>this.Oa(s,i))).next((a=>(U(zo,`Updating offset: ${a}`),this.localStore.indexManager.updateCollectionGroup(e,t,a)))).next((()=>o.size))}))))}Oa(e,t){let n=e;return t.changes.forEach(((s,i)=>{const o=w_(i);Ch(o,n)>0&&(n=o)})),new Kt(n.readTime,n.documentKey,Math.max(t.batchId,e.largestBatchId))}}/**
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
 */const pI="firestore_clients";function $p(r,e){return`${pI}_${r}_${e}`}const gI="firestore_mutations";function Yp(r,e,t){let n=`${gI}_${r}_${t}`;return e.isAuthenticated()&&(n+=`_${e.uid}`),n}const mI="firestore_targets";function ql(r,e){return`${mI}_${r}_${e}`}/**
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
 */const dn="SharedClientState";class su{constructor(e,t,n,s){this.user=e,this.batchId=t,this.state=n,this.error=s}static Ma(e,t,n){const s=JSON.parse(n);let i,o=typeof s=="object"&&["pending","acknowledged","rejected"].indexOf(s.state)!==-1&&(s.error===void 0||typeof s.error=="object");return o&&s.error&&(o=typeof s.error.message=="string"&&typeof s.error.code=="string",o&&(i=new M(s.error.code,s.error.message))),o?new su(e,t,s.state,i):(qe(dn,`Failed to parse mutation state for ID '${t}': ${n}`),null)}Na(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class Wo{constructor(e,t,n){this.targetId=e,this.state=t,this.error=n}static Ma(e,t){const n=JSON.parse(t);let s,i=typeof n=="object"&&["not-current","current","rejected"].indexOf(n.state)!==-1&&(n.error===void 0||typeof n.error=="object");return i&&n.error&&(i=typeof n.error.message=="string"&&typeof n.error.code=="string",i&&(s=new M(n.error.code,n.error.message))),i?new Wo(e,n.state,s):(qe(dn,`Failed to parse target state for ID '${e}': ${t}`),null)}Na(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class iu{constructor(e,t){this.clientId=e,this.activeTargetIds=t}static Ma(e,t){const n=JSON.parse(t);let s=typeof n=="object"&&n.activeTargetIds instanceof Array,i=_h();for(let o=0;s&&o<n.activeTargetIds.length;++o)s=s_(n.activeTargetIds[o]),i=i.add(n.activeTargetIds[o]);return s?new iu(e,i):(qe(dn,`Failed to parse client data for instance '${e}': ${t}`),null)}}class hd{constructor(e,t){this.clientId=e,this.onlineState=t}static Ma(e){const t=JSON.parse(e);return typeof t=="object"&&["Unknown","Online","Offline"].indexOf(t.onlineState)!==-1&&typeof t.clientId=="string"?new hd(t.clientId,t.onlineState):(qe(dn,`Failed to parse online state: ${e}`),null)}}class NB{constructor(){this.activeTargetIds=_h()}La(e){this.activeTargetIds=this.activeTargetIds.add(e)}Ba(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Na(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class jl{constructor(e,t,n,s,i){this.window=e,this.xt=t,this.persistenceKey=n,this.Ua=s,this.syncEngine=null,this.onlineStateHandler=null,this.sequenceNumberHandler=null,this.ka=this.qa.bind(this),this.$a=new be(ie),this.started=!1,this.Ka=[];const o=n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");this.storage=this.window.localStorage,this.currentUser=i,this.Qa=$p(this.persistenceKey,this.Ua),this.Wa=(function(c){return`firestore_sequence_number_${c}`})(this.persistenceKey),this.$a=this.$a.insert(this.Ua,new NB),this.Ga=new RegExp(`^${pI}_${o}_([^_]*)$`),this.za=new RegExp(`^${gI}_${o}_(\\d+)(?:_(.*))?$`),this.ja=new RegExp(`^${mI}_${o}_(\\d+)$`),this.Ha=(function(c){return`firestore_online_state_${c}`})(this.persistenceKey),this.Ja=(function(c){return`firestore_bundle_loaded_v2_${c}`})(this.persistenceKey),this.window.addEventListener("storage",this.ka)}static Je(e){return!(!e||!e.localStorage)}async start(){const e=await this.syncEngine.Ro();for(const n of e){if(n===this.Ua)continue;const s=this.getItem($p(this.persistenceKey,n));if(s){const i=iu.Ma(n,s);i&&(this.$a=this.$a.insert(i.clientId,i))}}this.Ya();const t=this.storage.getItem(this.Ha);if(t){const n=this.Za(t);n&&this.Xa(n)}for(const n of this.Ka)this.qa(n);this.Ka=[],this.window.addEventListener("pagehide",(()=>this.shutdown())),this.started=!0}writeSequenceNumber(e){this.setItem(this.Wa,JSON.stringify(e))}getAllActiveQueryTargets(){return this.eu(this.$a)}isActiveQueryTarget(e){let t=!1;return this.$a.forEach(((n,s)=>{s.activeTargetIds.has(e)&&(t=!0)})),t}addPendingMutation(e){this.tu(e,"pending")}updateMutationState(e,t,n){this.tu(e,t,n),this.nu(e)}addLocalQueryTarget(e,t=!0){let n="not-current";if(this.isActiveQueryTarget(e)){const s=this.storage.getItem(ql(this.persistenceKey,e));if(s){const i=Wo.Ma(e,s);i&&(n=i.state)}}return t&&this.ru.La(e),this.Ya(),n}removeLocalQueryTarget(e){this.ru.Ba(e),this.Ya()}isLocalQueryTarget(e){return this.ru.activeTargetIds.has(e)}clearQueryState(e){this.removeItem(ql(this.persistenceKey,e))}updateQueryState(e,t,n){this.iu(e,t,n)}handleUserChange(e,t,n){t.forEach((s=>{this.nu(s)})),this.currentUser=e,n.forEach((s=>{this.addPendingMutation(s)}))}setOnlineState(e){this.su(e)}notifyBundleLoaded(e){this._u(e)}shutdown(){this.started&&(this.window.removeEventListener("storage",this.ka),this.removeItem(this.Qa),this.started=!1)}getItem(e){const t=this.storage.getItem(e);return U(dn,"READ",e,t),t}setItem(e,t){U(dn,"SET",e,t),this.storage.setItem(e,t)}removeItem(e){U(dn,"REMOVE",e),this.storage.removeItem(e)}qa(e){const t=e;if(t.storageArea===this.storage){if(U(dn,"EVENT",t.key,t.newValue),t.key===this.Qa)return void qe("Received WebStorage notification for local change. Another client might have garbage-collected our state");this.xt.enqueueRetryable((async()=>{if(this.started){if(t.key!==null){if(this.Ga.test(t.key)){if(t.newValue==null){const n=this.ou(t.key);return this.au(n,null)}{const n=this.uu(t.key,t.newValue);if(n)return this.au(n.clientId,n)}}else if(this.za.test(t.key)){if(t.newValue!==null){const n=this.cu(t.key,t.newValue);if(n)return this.lu(n)}}else if(this.ja.test(t.key)){if(t.newValue!==null){const n=this.Eu(t.key,t.newValue);if(n)return this.hu(n)}}else if(t.key===this.Ha){if(t.newValue!==null){const n=this.Za(t.newValue);if(n)return this.Xa(n)}}else if(t.key===this.Wa){const n=(function(i){let o=Lt.yn;if(i!=null)try{const a=JSON.parse(i);q(typeof a=="number",30636,{Tu:i}),o=a}catch(a){qe(dn,"Failed to read sequence number from WebStorage",a)}return o})(t.newValue);n!==Lt.yn&&this.sequenceNumberHandler(n)}else if(t.key===this.Ja){const n=this.Pu(t.newValue);await Promise.all(n.map((s=>this.syncEngine.Ru(s))))}}}else this.Ka.push(t)}))}}get ru(){return this.$a.get(this.Ua)}Ya(){this.setItem(this.Qa,this.ru.Na())}tu(e,t,n){const s=new su(this.currentUser,e,t,n),i=Yp(this.persistenceKey,this.currentUser,e);this.setItem(i,s.Na())}nu(e){const t=Yp(this.persistenceKey,this.currentUser,e);this.removeItem(t)}su(e){const t={clientId:this.Ua,onlineState:e};this.storage.setItem(this.Ha,JSON.stringify(t))}iu(e,t,n){const s=ql(this.persistenceKey,e),i=new Wo(e,t,n);this.setItem(s,i.Na())}_u(e){const t=JSON.stringify(Array.from(e));this.setItem(this.Ja,t)}ou(e){const t=this.Ga.exec(e);return t?t[1]:null}uu(e,t){const n=this.ou(e);return iu.Ma(n,t)}cu(e,t){const n=this.za.exec(e),s=Number(n[1]),i=n[2]!==void 0?n[2]:null;return su.Ma(new Bt(i),s,t)}Eu(e,t){const n=this.ja.exec(e),s=Number(n[1]);return Wo.Ma(s,t)}Za(e){return hd.Ma(e)}Pu(e){return JSON.parse(e)}async lu(e){if(e.user.uid===this.currentUser.uid)return this.syncEngine.Iu(e.batchId,e.state,e.error);U(dn,`Ignoring mutation for non-active user ${e.user.uid}`)}hu(e){return this.syncEngine.Au(e.targetId,e.state,e.error)}au(e,t){const n=t?this.$a.insert(e,t):this.$a.remove(e),s=this.eu(this.$a),i=this.eu(n),o=[],a=[];return i.forEach((c=>{s.has(c)||o.push(c)})),s.forEach((c=>{i.has(c)||a.push(c)})),this.syncEngine.Vu(o,a).then((()=>{this.$a=n}))}Xa(e){this.$a.get(e.clientId)&&this.onlineStateHandler(e.onlineState)}eu(e){let t=_h();return e.forEach(((n,s)=>{t=t.unionWith(s.activeTargetIds)})),t}}class _I{constructor(){this.du=new NB,this.fu={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,n){}addLocalQueryTarget(e,t=!0){return t&&this.du.La(e),this.fu[e]||"not-current"}updateQueryState(e,t,n){this.fu[e]=t}removeLocalQueryTarget(e){this.du.Ba(e)}isLocalQueryTarget(e){return this.du.activeTargetIds.has(e)}clearQueryState(e){delete this.fu[e]}getAllActiveQueryTargets(){return this.du.activeTargetIds}isActiveQueryTarget(e){return this.du.activeTargetIds.has(e)}start(){return this.du=new NB,Promise.resolve()}handleUserChange(e,t,n){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */function EI(){return typeof window<"u"?window:null}function Nc(){return typeof document<"u"?document:null}/**
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
 */class Rr{static emptySet(e){return new Rr(e.comparator)}constructor(e){this.comparator=e?(t,n)=>e(t,n)||J.comparator(t.key,n.key):(t,n)=>J.comparator(t.key,n.key),this.keyedMap=ts(),this.sortedSet=new be(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal(((t,n)=>(e(t),!1)))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Rr)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),n=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=n.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach((t=>{e.push(t.toString())})),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const n=new Rr;return n.comparator=this.comparator,n.keyedMap=e,n.sortedSet=t,n}}/**
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
 */class Xp{constructor(){this.mu=new be(J.comparator)}track(e){const t=e.doc.key,n=this.mu.get(t);n?e.type!==0&&n.type===3?this.mu=this.mu.insert(t,e):e.type===3&&n.type!==1?this.mu=this.mu.insert(t,{type:n.type,doc:e.doc}):e.type===2&&n.type===2?this.mu=this.mu.insert(t,{type:2,doc:e.doc}):e.type===2&&n.type===0?this.mu=this.mu.insert(t,{type:0,doc:e.doc}):e.type===1&&n.type===0?this.mu=this.mu.remove(t):e.type===1&&n.type===2?this.mu=this.mu.insert(t,{type:1,doc:n.doc}):e.type===0&&n.type===1?this.mu=this.mu.insert(t,{type:2,doc:e.doc}):Y(63341,{ye:e,pu:n}):this.mu=this.mu.insert(t,e)}gu(){const e=[];return this.mu.inorderTraversal(((t,n)=>{e.push(n)})),e}}class ws{constructor(e,t,n,s,i,o,a,c,l){this.query=e,this.docs=t,this.oldDocs=n,this.docChanges=s,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=a,this.excludesMetadataChanges=c,this.hasCachedResults=l}static fromInitialDocuments(e,t,n,s,i){const o=[];return t.forEach((a=>{o.push({type:0,doc:a})})),new ws(e,t,Rr.emptySet(t),o,n,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Fu(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,n=e.docChanges;if(t.length!==n.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==n[s].type||!t[s].doc.isEqual(n[s].doc))return!1;return!0}}/**
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
 */class B0{constructor(){this.yu=void 0,this.wu=[]}bu(){return this.wu.some((e=>e.Su()))}}class h0{constructor(){this.queries=Zp(),this.onlineState="Unknown",this.vu=new Set}terminate(){(function(t,n){const s=W(t),i=s.queries;s.queries=Zp(),i.forEach(((o,a)=>{for(const c of a.wu)c.onError(n)}))})(this,new M(O.ABORTED,"Firestore shutting down"))}}function Zp(){return new Zn((r=>OE(r)),Fu)}async function dd(r,e){const t=W(r);let n=3;const s=e.query;let i=t.queries.get(s);i?!i.bu()&&e.Su()&&(n=2):(i=new B0,n=e.Su()?0:1);try{switch(n){case 0:i.yu=await t.onListen(s,!0);break;case 1:i.yu=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(o){const a=$i(o,`Initialization of query '${Ge(e.query)?Gn(e.query):Mo(e.query)}' failed`);return void e.onError(a)}t.queries.set(s,i),i.wu.push(e),e.Du(t.onlineState),i.yu&&e.xu(i.yu)&&Cd(t)}async function fd(r,e){const t=W(r),n=e.query;let s=3;const i=t.queries.get(n);if(i){const o=i.wu.indexOf(e);o>=0&&(i.wu.splice(o,1),i.wu.length===0?s=e.Su()?0:1:!i.bu()&&e.Su()&&(s=2))}switch(s){case 0:return t.queries.delete(n),t.onUnlisten(n,!0);case 1:return t.queries.delete(n),t.onUnlisten(n,!1);case 2:return t.onLastRemoteStoreUnlisten(n);default:return}}function d0(r,e){const t=W(r);let n=!1;for(const s of e){const i=s.query,o=t.queries.get(i);if(o){for(const a of o.wu)a.xu(s)&&(n=!0);o.yu=s}}n&&Cd(t)}function f0(r,e,t){const n=W(r),s=n.queries.get(e);if(s)for(const i of s.wu)i.onError(t);n.queries.delete(e)}function Cd(r){r.vu.forEach((e=>{e.next()}))}var OB;(function(r){r.Default="default",r.Cache="cache"})(OB||(OB={}));class pd{constructor(e,t,n){this.query=e,this.Cu=t,this.Fu=!1,this.Ou=null,this.onlineState="Unknown",this.options=n||{}}xu(e){if(!this.options.includeMetadataChanges){const n=[];for(const s of e.docChanges)s.type!==3&&n.push(s);e=new ws(e.query,e.docs,e.oldDocs,n,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Fu?this.Mu(e)&&(this.Cu.next(e),t=!0):this.Nu(e,this.onlineState)&&(this.Lu(e),t=!0),this.Ou=e,t}onError(e){this.Cu.error(e)}Du(e){this.onlineState=e;let t=!1;return this.Ou&&!this.Fu&&this.Nu(this.Ou,e)&&(this.Lu(this.Ou),t=!0),t}Nu(e,t){if(!e.fromCache||!this.Su())return!0;const n=t!=="Offline";return(!this.options.waitForSyncWhenOnline||!n)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Mu(e){if(e.docChanges.length>0)return!0;const t=this.Ou&&this.Ou.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}Lu(e){e=ws.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Fu=!0,this.Cu.next(e)}Su(){return this.options.source!==OB.Cache}}/**
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
 */class eg{constructor(e){this.serializer=e}Wo(e){return In(this.serializer,e)}Go(e){return e.metadata.exists?Au(this.serializer,e.document,!1):xe.newNoDocument(this.Wo(e.metadata.name),this.zo(e.metadata.readTime))}zo(e){return Je(e)}}class gd{constructor(e,t){this.Bu=e,this.serializer=t,this.Uu=[],this.ku=[],this.collectionGroups=new Set,this.progress=II(e)}get queries(){return this.Uu}get documents(){return this.ku}qu(e){this.progress.bytesLoaded+=e.byteLength;let t=this.progress.documentsLoaded;if(e.jo.namedQuery)this.Uu.push(e.jo.namedQuery);else if(e.jo.documentMetadata){this.ku.push({metadata:e.jo.documentMetadata}),e.jo.documentMetadata.exists||++t;const n=ce.fromString(e.jo.documentMetadata.name);this.collectionGroups.add(n.get(n.length-2))}else e.jo.document&&(this.ku[this.ku.length-1].document=e.jo.document,++t);return t!==this.progress.documentsLoaded?(this.progress.documentsLoaded=t,{...this.progress}):null}$u(e){const t=new Map,n=new eg(this.serializer);for(const s of e)if(s.metadata.queries){const i=n.Wo(s.metadata.name);for(const o of s.metadata.queries){const a=(t.get(o)||ae()).add(i);t.set(o,a)}}return t}async Ku(e){const t=await zN(e,new eg(this.serializer),this.ku,this.Bu.id),n=this.$u(this.documents);for(const s of this.Uu)await WN(e,s,n.get(s.name));return this.progress.taskState="Success",{progress:this.progress,Qu:this.collectionGroups,Wu:t}}}function II(r){return{taskState:"Running",documentsLoaded:0,bytesLoaded:0,totalDocuments:r.totalDocuments,totalBytes:r.totalBytes}}/**
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
 */class yI{constructor(e){this.key=e}}class wI{constructor(e){this.key=e}}class DI{constructor(e,t){this.query=e,this.Gu=t,this.zu=null,this.hasCachedResults=!1,this.current=!1,this.ju=ae(),this.mutatedKeys=ae(),this.Hu=Ge(e)?eu(e):Tu(e),this.Ju=new Rr(this.Hu)}get Yu(){return this.Gu}Zu(e,t){const n=t?t.Xu:new Xp,s=t?t.Ju:this.Ju;let i=t?t.mutatedKeys:this.mutatedKeys,o=s,a=!1;const[c,l]=this.ec(this.query,s);e.inorderTraversal(((d,C)=>{const g=s.get(d),I=XE(this.query,C)?C:null,P=!!g&&this.mutatedKeys.has(g.key),F=!!I&&(I.hasLocalMutations||this.mutatedKeys.has(I.key)&&I.hasCommittedMutations);let H=!1;g&&I?g.data.isEqual(I.data)?P!==F&&(n.track({type:3,doc:I}),H=!0):this.tc(g,I)||(n.track({type:2,doc:I}),H=!0,(c&&this.Hu(I,c)>0||l&&this.Hu(I,l)<0)&&(a=!0)):!g&&I?(n.track({type:0,doc:I}),H=!0):g&&!I&&(n.track({type:1,doc:g}),H=!0,(c||l)&&(a=!0)),H&&(I?(o=o.add(I),i=F?i.add(d):i.delete(d)):(o=o.delete(d),i=i.delete(d)))}));const B=this.nc(this.query);if(B)if(Ge(this.query)){const d=[];o.forEach((I=>d.push(I)));const C=YE(this.query,d);let g=new Rr(eu(this.query));for(const I of C)g=g.add(I);o.forEach((I=>{g.has(I.key)||(i=i.delete(I.key),n.track({type:1,doc:I}))})),o=g}else{const d=this.rc(this.query);for(;o.size>B;){const C=d==="F"?o.last():o.first();o=o.delete(C.key),i=i.delete(C.key),n.track({type:1,doc:C})}}return{Ju:o,Xu:n,Fo:a,mutatedKeys:i}}nc(e){var t;return Ge(e)?(t=Ml(e))==null?void 0:t.limit:e.limit||void 0}rc(e){if(Ge(e)){const t=Ml(e);return t&&t.limit<0?"L":"F"}return e.limitType}ec(e,t){var n;if(Ge(e)){const s=(n=Ml(e))==null?void 0:n.limit;return[t.size===s?t.last():null,null]}return[e.limitType==="F"&&t.size===this.nc(this.query)?t.last():null,e.limitType==="L"&&t.size===this.nc(this.query)?t.first():null]}tc(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,n,s){const i=this.Ju;this.Ju=e.Ju,this.mutatedKeys=e.mutatedKeys;const o=e.Xu.gu();o.sort(((B,d)=>(function(g,I){const P=F=>{switch(F){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return Y(20277,{ye:F})}};return P(g)-P(I)})(B.type,d.type)||this.Hu(B.doc,d.doc))),this.sc(n),s=s??!1;const a=t&&!s?this._c():[],c=this.ju.size===0&&this.current&&!s?1:0,l=c!==this.zu;return this.zu=c,o.length!==0||l?{snapshot:new ws(this.query,e.Ju,i,o,e.mutatedKeys,c===0,l,!1,!!n&&n.resumeToken.approximateByteSize()>0),oc:a}:{oc:a}}Du(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ju:this.Ju,Xu:new Xp,mutatedKeys:this.mutatedKeys,Fo:!1},!1)):{oc:[]}}ac(e){return!this.Gu.has(e)&&!!this.Ju.has(e)&&!this.Ju.get(e).hasLocalMutations}sc(e){e&&(e.addedDocuments.forEach((t=>this.Gu=this.Gu.add(t))),e.modifiedDocuments.forEach((t=>{})),e.removedDocuments.forEach((t=>this.Gu=this.Gu.delete(t))),this.current=e.current)}_c(){if(!this.current)return[];const e=this.ju;this.ju=ae(),this.Ju.forEach((n=>{this.ac(n.key)&&(this.ju=this.ju.add(n.key))}));const t=[];return e.forEach((n=>{this.ju.has(n)||t.push(new wI(n))})),this.ju.forEach((n=>{e.has(n)||t.push(new yI(n))})),t}uc(e){this.Gu=e.Qo,this.ju=ae();const t=this.Zu(e.documents);return this.applyChanges(t,!0)}cc(){return ws.fromInitialDocuments(this.query,this.Ju,this.mutatedKeys,this.zu===0,this.hasCachedResults)}}const jr="SyncEngine";class C0{constructor(e,t,n){this.query=e,this.targetId=t,this.view=n}}class p0{constructor(e){this.key=e,this.lc=!1}}class g0{constructor(e,t,n,s,i,o){this.localStore=e,this.remoteStore=t,this.eventManager=n,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.Ec={},this.hc=new Zn((a=>OE(a)),Fu),this.Tc=new Map,this.Pc=new Set,this.Rc=new be(J.comparator),this.Ic=new Map,this.Ac=new nd,this.Vc={},this.dc=new Map,this.fc=Wn.ws(),this.onlineState="Unknown",this.mc=void 0}get isPrimaryClient(){return this.mc===!0}}async function m0(r,e,t=!0){const n=Ku(r);let s;const i=n.hc.get(e);return i?(n.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.cc()):s=await TI(n,e,t,!0),s}async function _0(r,e){const t=Ku(r);await TI(t,e,!0,!1)}async function TI(r,e,t,n){const s=await Ti(r.localStore,Ge(e)?e:It(e)),i=s.targetId,o=r.sharedClientState.addLocalQueryTarget(i,t);let a;return n&&(a=await md(r,e,i,o==="current",s.resumeToken)),r.isPrimaryClient&&t&&ju(r.remoteStore,s),a}async function md(r,e,t,n,s){r.gc=(d,C,g)=>(async function(P,F,H,Z){let ee=F.view.Zu(H);ee.Fo&&(ee=await nu(P.localStore,F.query,!1).then((({documents:D})=>F.view.Zu(D,ee))));const Be=Z&&Z.targetChanges.get(F.targetId),he=Z&&Z.targetMismatches.get(F.targetId)!=null,ue=F.view.applyChanges(ee,P.isPrimaryClient,Be,he);return FB(P,F.targetId,ue.oc),ue.snapshot})(r,d,C,g);const i=await nu(r.localStore,e,!0),o=new DI(e,i.Qo),a=o.Zu(i.documents),c=Aa.createSynthesizedTargetChangeForCurrentChange(t,n&&r.onlineState!=="Offline",s),l=o.applyChanges(a,r.isPrimaryClient,c);FB(r,t,l.oc);const B=new C0(e,t,o);return r.hc.set(e,B),r.Tc.has(t)?r.Tc.get(t).push(e):r.Tc.set(t,[e]),l.snapshot}async function E0(r,e,t){const n=W(r),s=n.hc.get(e),i=n.Tc.get(s.targetId);if(i.length>1)return n.Tc.set(s.targetId,i.filter((o=>!Fu(o,e)))),void n.hc.delete(e);n.isPrimaryClient?(n.sharedClientState.removeLocalQueryTarget(s.targetId),n.sharedClientState.isActiveQueryTarget(s.targetId)||await Ai(n.localStore,s.targetId,!1).then((()=>{n.sharedClientState.clearQueryState(s.targetId),t&&Ri(n.remoteStore,s.targetId),vi(n,s.targetId)})).catch(Ur)):(vi(n,s.targetId),await Ai(n.localStore,s.targetId,!0))}async function I0(r,e){const t=W(r),n=t.hc.get(e),s=t.Tc.get(n.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(n.targetId),Ri(t.remoteStore,n.targetId))}async function y0(r,e,t){const n=yd(r);try{const s=await(function(o,a){const c=W(o),l=ye.now(),B=a.reduce(((g,I)=>g.add(I.key)),ae());let d,C;return c.persistence.runTransaction("Locally write mutations","readwrite",(g=>{let I=$e(),P=ae();return c.Uo.getEntries(g,B).next((F=>{I=F,I.forEach(((H,Z)=>{Z.isValidDocument()||(P=P.add(H))}))})).next((()=>c.localDocuments.getOverlayedDocuments(g,I))).next((F=>{d=F;const H=[];for(const Z of a){const ee=Zv(Z,d.get(Z.key).overlayedDocument);ee!=null&&H.push(new Yn(Z.key,ee,c_(ee.value.mapValue),Ve.exists(!0)))}return c.mutationQueue.addMutationBatch(g,l,H,a)})).next((F=>{C=F;const H=F.applyToLocalDocumentSet(d,P);return c.documentOverlayCache.saveOverlays(g,F.batchId,H)}))})).then((()=>({batchId:C.batchId,changes:S_(d)})))})(n.localStore,e);n.sharedClientState.addPendingMutation(s.batchId),(function(o,a,c){let l=o.Vc[o.currentUser.toKey()];l||(l=new be(ie)),l=l.insert(a,c),o.Vc[o.currentUser.toKey()]=l})(n,s.batchId,t),await er(n,s.changes),await Wi(n.remoteStore)}catch(s){const i=$i(s,"Failed to persist write");t.reject(i)}}async function AI(r,e){const t=W(r);try{const n=await JN(t.localStore,e);e.targetChanges.forEach(((s,i)=>{const o=t.Ic.get(i);o&&(q(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?o.lc=!0:s.modifiedDocuments.size>0?q(o.lc,14607):s.removedDocuments.size>0&&(q(o.lc,42227),o.lc=!1))})),await er(t,n,e)}catch(n){await Ur(n)}}function tg(r,e,t){const n=W(r);if(n.isPrimaryClient&&t===0||!n.isPrimaryClient&&t===1){const s=[];n.hc.forEach(((i,o)=>{const a=o.view.Du(e);a.snapshot&&s.push(a.snapshot)})),(function(o,a){const c=W(o);c.onlineState=a;let l=!1;c.queries.forEach(((B,d)=>{for(const C of d.wu)C.Du(a)&&(l=!0)})),l&&Cd(c)})(n.eventManager,e),s.length&&n.Ec.hn(s),n.onlineState=e,n.isPrimaryClient&&n.sharedClientState.setOnlineState(e)}}async function w0(r,e,t){const n=W(r);n.sharedClientState.updateQueryState(e,"rejected",t);const s=n.Ic.get(e),i=s&&s.key;if(i){let o=new be(J.comparator);o=o.insert(i,xe.newNoDocument(i,te.min()));const a=ae().add(i),c=new ji(te.min(),new Map,new be(ie),o,$e(),a);await AI(n,c),n.Rc=n.Rc.remove(i),n.Ic.delete(e),Id(n)}else await Ai(n.localStore,e,!1).then((()=>vi(n,e,t))).catch(Ur)}async function D0(r,e){const t=W(r),n=e.batch.batchId;try{const s=await jN(t.localStore,e);Ed(t,n,null),_d(t,n),t.sharedClientState.updateMutationState(n,"acknowledged"),await er(t,s)}catch(s){await Ur(s)}}async function T0(r,e,t){const n=W(r);try{const s=await(function(o,a){const c=W(o);return c.persistence.runTransaction("Reject batch","readwrite-primary",(l=>{let B;return c.mutationQueue.lookupMutationBatch(l,a).next((d=>(q(d!==null,37113),B=d.keys(),c.mutationQueue.removeMutationBatch(l,d)))).next((()=>c.mutationQueue.performConsistencyCheck(l))).next((()=>c.documentOverlayCache.removeOverlaysForBatchId(l,B,a))).next((()=>c.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(l,B))).next((()=>c.localDocuments.getDocuments(l,B)))}))})(n.localStore,e);Ed(n,e,t),_d(n,e),n.sharedClientState.updateMutationState(e,"rejected",t),await er(n,s)}catch(s){await Ur(s)}}async function A0(r,e){const t=W(r);qr(t.remoteStore)||U(jr,"The network is disabled. The task returned by 'awaitPendingWrites()' will not complete until the network is enabled.");try{const n=await(function(o){const a=W(o);return a.persistence.runTransaction("Get highest unacknowledged batch id","readonly",(c=>a.mutationQueue.getHighestUnacknowledgedBatchId(c)))})(t.localStore);if(n===Tr)return void e.resolve();const s=t.dc.get(n)||[];s.push(e),t.dc.set(n,s)}catch(n){const s=$i(n,"Initialization of waitForPendingWrites() operation failed");e.reject(s)}}function _d(r,e){(r.dc.get(e)||[]).forEach((t=>{t.resolve()})),r.dc.delete(e)}function Ed(r,e,t){const n=W(r);let s=n.Vc[n.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),n.Vc[n.currentUser.toKey()]=s}}function vi(r,e,t=null){r.sharedClientState.removeLocalQueryTarget(e);for(const n of r.Tc.get(e))r.hc.delete(n),t&&r.Ec.yc(n,t);r.Tc.delete(e),r.isPrimaryClient&&r.Ac.Xs(e).forEach((n=>{r.Ac.containsKey(n)||RI(r,n)}))}function RI(r,e){r.Pc.delete(e.path.canonicalString());const t=r.Rc.get(e);t!==null&&(Ri(r.remoteStore,t),r.Rc=r.Rc.remove(e),r.Ic.delete(t),Id(r))}function FB(r,e,t){for(const n of t)n instanceof yI?(r.Ac.addReference(n.key,e),R0(r,n)):n instanceof wI?(U(jr,"Document no longer in limbo: "+n.key),r.Ac.removeReference(n.key,e),r.Ac.containsKey(n.key)||RI(r,n.key)):Y(19791,{wc:n})}function R0(r,e){const t=e.key,n=t.path.canonicalString();r.Rc.get(t)||r.Pc.has(n)||(U(jr,"New document in limbo: "+t),r.Pc.add(n),Id(r))}function Id(r){for(;r.Pc.size>0&&r.Rc.size<r.maxConcurrentLimboResolutions;){const e=r.Pc.values().next().value;r.Pc.delete(e);const t=new J(ce.fromString(e)),n=r.fc.next();r.Ic.set(n,new p0(t)),r.Rc=r.Rc.insert(t,n),ju(r.remoteStore,new mn(It(qi(t.path)),n,"TargetPurposeLimboResolution",Lt.yn))}}async function er(r,e,t){const n=W(r),s=[],i=[],o=[];n.hc.isEmpty()||(n.hc.forEach(((a,c)=>{o.push(n.gc(c,e,t).then((l=>{var B;if((l||t)&&n.isPrimaryClient){const d=l?!l.fromCache:(B=t==null?void 0:t.targetChanges.get(c.targetId))==null?void 0:B.current;n.sharedClientState.updateQueryState(c.targetId,d?"current":"not-current")}if(l){s.push(l);const d=od.fo(c.targetId,l);i.push(d)}})))})),await Promise.all(o),n.Ec.hn(s),await(async function(c,l){const B=W(c);try{await B.persistence.runTransaction("notifyLocalViewChanges","readwrite",(d=>b.forEach(l,(C=>b.forEach(C.Ao,(g=>B.persistence.referenceDelegate.addReference(d,C.targetId,g))).next((()=>b.forEach(C.Vo,(g=>B.persistence.referenceDelegate.removeReference(d,C.targetId,g)))))))))}catch(d){if(!Hr(d))throw d;U(ad,"Failed to update sequence numbers: "+d)}for(const d of l){const C=d.targetId;if(!d.fromCache){const g=B.No.get(C),I=g.snapshotVersion,P=g.withLastLimboFreeSnapshotVersion(I);B.No=B.No.insert(C,P)}}})(n.localStore,i))}async function v0(r,e){const t=W(r);if(!t.currentUser.isEqual(e)){U(jr,"User change. New user:",e.toKey());const n=await iI(t.localStore,e);t.currentUser=e,(function(i,o){i.dc.forEach((a=>{a.forEach((c=>{c.reject(new M(O.CANCELLED,o))}))})),i.dc.clear()})(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,n.removedBatchIds,n.addedBatchIds),await er(t,n.qo)}}function P0(r,e){const t=W(r),n=t.Ic.get(e);if(n&&n.lc)return ae().add(n.key);{let s=ae();const i=t.Tc.get(e);if(!i)return s;for(const o of i??[]){const a=t.hc.get(o);s=s.unionWith(a.view.Yu)}return s}}async function b0(r,e){const t=W(r),n=await nu(t.localStore,e.query,!0),s=e.view.uc(n);return t.isPrimaryClient&&FB(t,e.targetId,s.oc),s}async function S0(r,e){const t=W(r);return PB(t.localStore,e).then((n=>er(t,n)))}async function N0(r,e,t,n){const s=W(r),i=await(function(a,c){const l=W(a),B=W(l.mutationQueue);return l.persistence.runTransaction("Lookup mutation documents","readonly",(d=>B.Qr(d,c).next((C=>C?l.localDocuments.getDocuments(d,C):b.resolve(null)))))})(s.localStore,e);i!==null?(t==="pending"?await Wi(s.remoteStore):t==="acknowledged"||t==="rejected"?(Ed(s,e,n||null),_d(s,e),(function(a,c){W(W(a).mutationQueue).jr(c)})(s.localStore,e)):Y(6720,"Unknown batchState",{bc:t}),await er(s,i)):U(jr,"Cannot apply mutation batch with id: "+e)}async function O0(r,e){const t=W(r);if(Ku(t),yd(t),e===!0&&t.mc!==!0){const n=t.sharedClientState.getAllActiveQueryTargets(),s=await ng(t,n.toArray());t.mc=!0,await SB(t.remoteStore,!0);for(const i of s)ju(t.remoteStore,i)}else if(e===!1&&t.mc!==!1){const n=[];let s=Promise.resolve();t.Tc.forEach(((i,o)=>{t.sharedClientState.isLocalQueryTarget(o)?n.push(o):s=s.then((()=>(vi(t,o),Ai(t.localStore,o,!0)))),Ri(t.remoteStore,o)})),await s,await ng(t,n),(function(o){const a=W(o);a.Ic.forEach(((c,l)=>{Ri(a.remoteStore,l)})),a.Ac.e_(),a.Ic=new Map,a.Rc=new be(J.comparator)})(t),t.mc=!1,await SB(t.remoteStore,!1)}}async function ng(r,e,t){const n=W(r),s=[],i=[];for(const o of e){let a;const c=n.Tc.get(o);if(c&&c.length!==0){a=await Ti(n.localStore,Ge(c[0])?c[0]:It(c[0]));for(const l of c){const B=n.hc.get(l),d=await b0(n,B);d.snapshot&&i.push(d.snapshot)}}else{const l=await cI(n.localStore,o);a=await Ti(n.localStore,l),await md(n,vI(l),o,!1,a.resumeToken)}s.push(a)}return n.Ec.hn(i),s}function vI(r){return Sn(r)?r:D_(r.path,r.collectionGroup,r.orderBy,r.filters,r.limit,"F",r.startAt,r.endAt)}function F0(r){return(function(t){return W(W(t).persistence).Ro()})(W(r).localStore)}async function k0(r,e,t,n){const s=W(r);if(s.mc)return void U(jr,"Ignoring unexpected query state notification.");const i=s.Tc.get(e);if(i&&i.length>0)switch(t){case"current":case"not-current":{let o;if(Ge(i[0]))switch(Mn(i[0])){case"collection_group":case"collection":o=await PB(s.localStore,AE(i[0]));break;case"documents":o=await(function(l,B){const d=W(l),C=ae(...Kc(B).map((g=>J.fromPath(g))));return d.persistence.runTransaction("Get documents for pipeline","readonly",(g=>d.Uo.getEntries(g,C))).then((g=>g))})(s.localStore,i[0]);break;default:st(""),o=ts()}else o=await PB(s.localStore,(function(l){return l.collectionGroup||(l.path.length%2==1?l.path.lastSegment():l.path.get(l.path.length-2))})(i[0]));const a=ji.createSynthesizedRemoteEventForCurrentChange(e,t==="current",Oe.EMPTY_BYTE_STRING);await er(s,o,a);break}case"rejected":await Ai(s.localStore,e,!0),vi(s,e,n);break;default:Y(64155,t)}}async function L0(r,e,t){const n=Ku(r);if(n.mc){for(const s of e){if(n.Tc.has(s)&&n.sharedClientState.isActiveQueryTarget(s)){U(jr,"Adding an already active target "+s);continue}const i=await cI(n.localStore,s),o=await Ti(n.localStore,i);await md(n,vI(i),o.targetId,!1,o.resumeToken),ju(n.remoteStore,o)}for(const s of t)n.Tc.has(s)&&await Ai(n.localStore,s,!1).then((()=>{Ri(n.remoteStore,s),vi(n,s)})).catch(Ur)}}function Ku(r){const e=W(r);return e.remoteStore.remoteSyncer.applyRemoteEvent=AI.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=P0.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=w0.bind(null,e),e.Ec.hn=d0.bind(null,e.eventManager),e.Ec.yc=f0.bind(null,e.eventManager),e}function yd(r){const e=W(r);return e.remoteStore.remoteSyncer.applySuccessfulWrite=D0.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=T0.bind(null,e),e}function x0(r,e,t){const n=W(r);(async function(i,o,a){try{const c=await o.getMetadata();if(await(function(g,I){const P=W(g),F=Je(I.createTime);return P.persistence.runTransaction("hasNewerBundle","readonly",(H=>P.d_.getBundleMetadata(H,I.id))).then((H=>!!H&&H.createTime.compareTo(F)>=0))})(i.localStore,c))return await o.close(),a._completeWith((function(g){return{taskState:"Success",documentsLoaded:g.totalDocuments,bytesLoaded:g.totalBytes,totalDocuments:g.totalDocuments,totalBytes:g.totalBytes}})(c)),Promise.resolve(new Set);a._updateProgress(II(c));const l=new gd(c,o.serializer);let B=await o.ma();for(;B;){const C=await l.qu(B);C&&a._updateProgress(C),B=await o.ma()}const d=await l.Ku(i.localStore);return await er(i,d.Wu,void 0),await(function(g,I){const P=W(g);return P.persistence.runTransaction("Save bundle","readwrite",(F=>P.d_.saveBundleMetadata(F,I)))})(i.localStore,c),a._completeWith(d.progress),Promise.resolve(d.Qu)}catch(c){return st(jr,`Loading bundle failed with ${c}`),a._failWith(c),Promise.resolve(new Set)}})(n,e,t).then((s=>{n.sharedClientState.notifyBundleLoaded(s)}))}class Pi{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=vs(e.databaseInfo.databaseId),this.sharedClientState=this.Sc(e),this.persistence=this.vc(e),await this.persistence.start(),this.localStore=this.Dc(e),this.gcScheduler=this.xc(e,this.localStore),this.indexBackfillerScheduler=this.Cc(e,this.localStore)}xc(e,t){return null}Cc(e,t){return null}Dc(e){return sI(this.persistence,new rI,e.initialUser,this.serializer)}vc(e){return new rd(qu.w_,this.serializer)}Sc(e){return new _I}async terminate(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Pi.provider={build:()=>new Pi};class wd extends Pi{constructor(e){super(),this.cacheSizeBytes=e}xc(e,t){q(this.persistence.referenceDelegate instanceof tu,46915);const n=this.persistence.referenceDelegate.garbageCollector;return new oE(n,e.asyncQueue,t)}vc(e){const t=this.cacheSizeBytes!==void 0?_t.withCacheSize(this.cacheSizeBytes):_t.DEFAULT;return new rd((n=>tu.w_(n,t)),this.serializer)}}class Dd extends Pi{constructor(e,t,n){super(),this.Fc=e,this.cacheSizeBytes=t,this.forceOwnership=n,this.kind="persistent",this.synchronizeTabs=!1}async initialize(e){await super.initialize(e),await this.Fc.initialize(this,e),await yd(this.Fc.syncEngine),await Wi(this.Fc.remoteStore),await this.persistence.X_((()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve())))}Dc(e){return sI(this.persistence,new rI,e.initialUser,this.serializer)}xc(e,t){const n=this.persistence.referenceDelegate.garbageCollector;return new oE(n,e.asyncQueue,t)}Cc(e,t){const n=new l0(t,this.persistence);return new u0(e.asyncQueue,n)}vc(e){const t=id(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey),n=this.cacheSizeBytes!==void 0?_t.withCacheSize(this.cacheSizeBytes):_t.DEFAULT;return new sd(this.synchronizeTabs,t,e.clientId,n,e.asyncQueue,EI(),Nc(),this.serializer,this.sharedClientState,!!this.forceOwnership)}Sc(e){return new _I}}class PI extends Dd{constructor(e,t){super(e,t,!1),this.Fc=e,this.cacheSizeBytes=t,this.synchronizeTabs=!0}async initialize(e){await super.initialize(e);const t=this.Fc.syncEngine;this.sharedClientState instanceof jl&&(this.sharedClientState.syncEngine={Iu:N0.bind(null,t),Au:k0.bind(null,t),Vu:L0.bind(null,t),Ro:F0.bind(null,t),Ru:S0.bind(null,t)},await this.sharedClientState.start()),await this.persistence.X_((async n=>{await O0(this.Fc.syncEngine,n),this.gcScheduler&&(n&&!this.gcScheduler.started?this.gcScheduler.start():n||this.gcScheduler.stop()),this.indexBackfillerScheduler&&(n&&!this.indexBackfillerScheduler.started?this.indexBackfillerScheduler.start():n||this.indexBackfillerScheduler.stop())}))}Sc(e){const t=EI();if(!jl.Je(t))throw new M(O.UNIMPLEMENTED,"IndexedDB persistence is only available on platforms that support LocalStorage.");const n=id(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey);return new jl(t,e.asyncQueue,n,e.clientId,e.initialUser)}}class Vr{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=n=>tg(this.syncEngine,n,1),this.remoteStore.remoteSyncer.handleCredentialChange=v0.bind(null,this.syncEngine),await SB(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return(function(){return new h0})()}createDatastore(e){const t=vs(e.databaseInfo.databaseId),n=JP(e.databaseInfo);return $P(e.authCredentials,e.appCheckCredentials,n,t)}createRemoteStore(e){return(function(n,s,i,o,a){return new $N(n,s,i,o,a)})(this.localStore,this.datastore,e.asyncQueue,(t=>tg(this.syncEngine,t,0)),(function(){return pp.Je()?new pp:new UP})())}createSyncEngine(e,t){return(function(s,i,o,a,c,l,B){const d=new g0(s,i,o,a,c,l);return B&&(d.mc=!0),d})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await(async function(s){const i=W(s);U(Rn,"RemoteStore shutting down."),i.ca.add(5),await zi(i),i.Ea.shutdown(),i.ha.set("Unknown")})(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()}}Vr.provider={build:()=>new Vr};/**
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
 */let V0=class{constructor(e){this.datastore=e,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(e){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new M(O.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const t=await(async function(s,i){const o=W(s),a={documents:i.map((d=>Ei(o.serializer,d)))},c=await o.st("BatchGetDocuments",o.serializer.databaseId,ce.emptyPath(),a,i.length),l=new Map;c.forEach((d=>{const C=RP(o.serializer,d);l.set(C.key.toString(),C)}));const B=[];return i.forEach((d=>{const C=l.get(d.toString());q(!!C,55234,{key:d}),B.push(C)})),B})(this.datastore,e);return t.forEach((n=>this.recordVersion(n))),t}set(e,t){this.write(t.toMutation(e,this.precondition(e))),this.writtenDocs.add(e.toString())}update(e,t){try{this.write(t.toMutation(e,this.preconditionForUpdate(e)))}catch(n){this.lastTransactionError=n}this.writtenDocs.add(e.toString())}delete(e){this.write(new Hi(e,this.precondition(e))),this.writtenDocs.add(e.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const e=this.readVersions;this.mutations.forEach((t=>{e.delete(t.key.toString())})),e.forEach(((t,n)=>{const s=J.fromPath(n);this.mutations.push(new dh(s,this.precondition(s)))})),await(async function(n,s){const i=W(n),o={writes:s.map((a=>oa(i.serializer,a)))};await i.tt("Commit",i.serializer.databaseId,ce.emptyPath(),o)})(this.datastore,this.mutations),this.committed=!0}recordVersion(e){let t;if(e.isFoundDocument())t=e.version;else{if(!e.isNoDocument())throw Y(50498,{Oc:e.constructor.name});t=te.min()}const n=this.readVersions.get(e.key.toString());if(n){if(!t.isEqual(n))throw new M(O.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(e.key.toString(),t)}precondition(e){const t=this.readVersions.get(e.toString());return!this.writtenDocs.has(e.toString())&&t?t.isEqual(te.min())?Ve.exists(!1):Ve.updateTime(t):Ve.none()}preconditionForUpdate(e){const t=this.readVersions.get(e.toString());if(!this.writtenDocs.has(e.toString())&&t){if(t.isEqual(te.min()))throw new M(O.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return Ve.updateTime(t)}return Ve.exists(!0)}write(e){this.ensureCommitNotCalled(),this.mutations.push(e)}ensureCommitNotCalled(){}};/**
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
 */class M0{constructor(e,t,n,s,i){this.asyncQueue=e,this.datastore=t,this.options=n,this.updateFunction=s,this.deferred=i,this.Mc=n.maxAttempts,this.jt=new wh(this.asyncQueue,"transaction_retry")}Nc(){this.Mc-=1,this.Lc()}Lc(){this.jt.Ut((async()=>{const e=new V0(this.datastore),t=this.Bc(e);t&&t.then((n=>{this.asyncQueue.enqueueAndForget((()=>e.commit().then((()=>{this.deferred.resolve(n)})).catch((s=>{this.Uc(s)}))))})).catch((n=>{this.Uc(n)}))}))}Bc(e){try{const t=this.updateFunction(e);return!Ta(t)&&t.catch&&t.then?t:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(t){return this.deferred.reject(t),null}}Uc(e){this.Mc>0&&this.kc(e)?(this.Mc-=1,this.asyncQueue.enqueueAndForget((()=>(this.Lc(),Promise.resolve())))):this.deferred.reject(e)}kc(e){if((e==null?void 0:e.name)==="FirebaseError"){const t=e.code;return t==="aborted"||t==="failed-precondition"||t==="already-exists"||!v_(t)}return!1}}/**
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
 */const Mr="FirestoreClient";class G0{constructor(e,t,n,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=n,this._databaseInfo=s,this.user=Bt.UNAUTHENTICATED,this.clientId=_u.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(n,(async o=>{U(Mr,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o})),this.appCheckCredentials.start(n,(o=>(U(Mr,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new dt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const n=$i(t,"Failed to shutdown persistence");e.reject(n)}})),e.promise}}async function Jl(r,e){r.asyncQueue.verifyOperationInProgress(),U(Mr,"Initializing OfflineComponentProvider");const t=r.configuration;await e.initialize(t);let n=t.initialUser;r.setCredentialChangeListener((async s=>{n.isEqual(s)||(await iI(e.localStore,s),n=s)})),e.persistence.setDatabaseDeletedListener((()=>r.terminate())),r._offlineComponents=e}async function rg(r,e){r.asyncQueue.verifyOperationInProgress();const t=await Td(r);U(Mr,"Initializing OnlineComponentProvider"),await e.initialize(t,r.configuration),r.setCredentialChangeListener((n=>Qp(e.remoteStore,n))),r.setAppCheckTokenChangeListener(((n,s)=>Qp(e.remoteStore,s))),r._onlineComponents=e}async function Td(r){if(!r._offlineComponents)if(r._uninitializedComponentsProvider){U(Mr,"Using user provided OfflineComponentProvider");try{await Jl(r,r._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!(function(s){return s.name==="FirebaseError"?s.code===O.FAILED_PRECONDITION||s.code===O.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11})(t))throw t;st("Error using user provided cache. Falling back to memory cache: "+t),await Jl(r,new Pi)}}else U(Mr,"Using default OfflineComponentProvider"),await Jl(r,new wd(void 0));return r._offlineComponents}async function zu(r){return r._onlineComponents||(r._uninitializedComponentsProvider?(U(Mr,"Using user provided OnlineComponentProvider"),await rg(r,r._uninitializedComponentsProvider._online)):(U(Mr,"Using default OnlineComponentProvider"),await rg(r,new Vr))),r._onlineComponents}function bI(r){return Td(r).then((e=>e.persistence))}function Yi(r){return Td(r).then((e=>e.localStore))}function SI(r){return zu(r).then((e=>e.remoteStore))}function Ad(r){return zu(r).then((e=>e.syncEngine))}function NI(r){return zu(r).then((e=>e.datastore))}async function bi(r){const e=await zu(r),t=e.eventManager;return t.onListen=m0.bind(null,e.syncEngine),t.onUnlisten=E0.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=_0.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=I0.bind(null,e.syncEngine),t}function U0(r){return r.asyncQueue.enqueue((async()=>{const e=await bI(r),t=await SI(r);return e.setNetworkEnabled(!0),(function(s){const i=W(s);return i.ca.delete(0),ka(i)})(t)}))}function H0(r){return r.asyncQueue.enqueue((async()=>{const e=await bI(r),t=await SI(r);return e.setNetworkEnabled(!1),(async function(s){const i=W(s);i.ca.add(0),await zi(i),i.ha.set("Offline")})(t)}))}function q0(r,e,t,n){const s=new Ju(n),i=new pd(e,s,t);return r.asyncQueue.enqueueAndForget((async()=>dd(await bi(r),i))),()=>{s.Aa(),r.asyncQueue.enqueueAndForget((async()=>fd(await bi(r),i)))}}function j0(r,e){const t=new dt;return r.asyncQueue.enqueueAndForget((async()=>(async function(s,i,o){try{const a=await(function(l,B){const d=W(l);return d.persistence.runTransaction("read document","readonly",(C=>d.localDocuments.getDocument(C,B)))})(s,i);a.isFoundDocument()?o.resolve(a):a.isNoDocument()?o.resolve(null):o.reject(new M(O.UNAVAILABLE,"Failed to get document from cache. (However, this document may exist on the server. Run again without setting 'source' in the GetOptions to attempt to retrieve the document from the server.)"))}catch(a){const c=$i(a,`Failed to get document '${i} from cache`);o.reject(c)}})(await Yi(r),e,t))),t.promise}function OI(r,e,t={}){const n=new dt;return r.asyncQueue.enqueueAndForget((async()=>(function(i,o,a,c,l){const B=new Ju({next:C=>{B.Aa(),o.enqueueAndForget((()=>fd(i,d)));const g=C.docs.has(a);!g&&C.fromCache?l.reject(new M(O.UNAVAILABLE,"Failed to get document because the client is offline.")):g&&C.fromCache&&c&&c.source==="server"?l.reject(new M(O.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):l.resolve(C)},error:C=>l.reject(C)}),d=new pd(qi(a.path),B,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return dd(i,d)})(await bi(r),r.asyncQueue,e,t,n))),n.promise}function J0(r,e){const t=new dt;return r.asyncQueue.enqueueAndForget((async()=>(async function(s,i,o){try{const a=await nu(s,i,!0),c=new DI(i,a.Qo),l=c.Zu(a.documents),B=c.applyChanges(l,!1);o.resolve(B.snapshot)}catch(a){const c=$i(a,`Failed to execute query '${i} against cache`);o.reject(c)}})(await Yi(r),e,t))),t.promise}function FI(r,e,t={}){const n=new dt;return r.asyncQueue.enqueueAndForget((async()=>(function(i,o,a,c,l){const B=new Ju({next:C=>{B.Aa(),o.enqueueAndForget((()=>fd(i,d))),C.fromCache&&c.source==="server"?l.reject(new M(O.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):l.resolve(C)},error:C=>l.reject(C)}),d=new pd(a instanceof qo?US(a):a,B,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return dd(i,d)})(await bi(r),r.asyncQueue,e,t,n))),n.promise}function K0(r,e,t){const n=new dt;return r.asyncQueue.enqueueAndForget((async()=>{try{const s=await NI(r);n.resolve((async function(o,a,c){var P;const l=W(o),{request:B,Se:d,parent:C}=H_(l.serializer,T_(a),c);l.connection.Ye||delete B.parent;const g=(await l.st("RunAggregationQuery",l.serializer.databaseId,C,B,1)).filter((F=>!!F.result));q(g.length===1,64727);const I=(P=g[0].result)==null?void 0:P.aggregateFields;return Object.keys(I).reduce(((F,H)=>(F[d[H]]=I[H],F)),{})})(s,e,t))}catch(s){n.reject(s)}})),n.promise}function z0(r,e){const t=new dt;return r.asyncQueue.enqueueAndForget((async()=>y0(await Ad(r),e,t))),t.promise}function W0(r,e){const t=new Ju(e);return r.asyncQueue.enqueueAndForget((async()=>(function(s,i){W(s).vu.add(i),i.next()})(await bi(r),t))),()=>{t.Aa(),r.asyncQueue.enqueueAndForget((async()=>(function(s,i){W(s).vu.delete(i)})(await bi(r),t)))}}function Q0(r,e,t){const n=new dt;return r.asyncQueue.enqueueAndForget((async()=>{const s=await NI(r);new M0(r.asyncQueue,s,t,e,n).Nc()})),n.promise}function $0(r,e,t,n){const s=(function(o,a){let c;return c=typeof o=="string"?O_().encode(o):o,(function(B,d){return new a0(B,d)})((function(B,d){if(B instanceof Uint8Array)return Wp(B,d);if(B instanceof ArrayBuffer)return Wp(new Uint8Array(B),d);if(B instanceof ReadableStream)return B.getReader();throw new Error("Source of `toByteStreamReader` has to be a ArrayBuffer or ReadableStream")})(c),a)})(t,vs(e));r.asyncQueue.enqueueAndForget((async()=>{x0(await Ad(r),s,n)}))}function Y0(r,e){return r.asyncQueue.enqueue((async()=>(function(n,s){const i=W(n);return i.persistence.runTransaction("Get named query","readonly",(o=>i.d_.getNamedQuery(o,s)))})(await Yi(r),e)))}function kI(r,e){return(function(n,s){return new c0(n,s)})(r,e)}function X0(r,e){return r.asyncQueue.enqueue((async()=>(async function(n,s){const i=W(n),o=i.indexManager,a=[];return i.persistence.runTransaction("Configure indexes","readwrite",(c=>o.getFieldIndexes(c).next((l=>(function(d,C,g,I,P){d=[...d],C=[...C],d.sort(g),C.sort(g);const F=d.length,H=C.length;let Z=0,ee=0;for(;Z<H&&ee<F;){const Be=g(d[ee],C[Z]);Be<0?P(d[ee++]):Be>0?I(C[Z++]):(Z++,ee++)}for(;Z<H;)I(C[Z++]);for(;ee<F;)P(d[ee++])})(l,s,aP,(B=>{a.push(o.addFieldIndex(c,B))}),(B=>{a.push(o.deleteFieldIndex(c,B))})))).next((()=>b.waitFor(a)))))})(await Yi(r),e)))}function Z0(r,e){return r.asyncQueue.enqueue((async()=>(function(n,s){W(n).Mo.po=s})(await Yi(r),e)))}function eO(r){return r.asyncQueue.enqueue((async()=>(function(t){const n=W(t),s=n.indexManager;return n.persistence.runTransaction("Delete All Indexes","readwrite",(i=>s.deleteAllFieldIndexes(i)))})(await Yi(r))))}/**
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
 */let pa=class{constructor(e,t,n,s,i){this._firestore=e,this._userDataWriter=t,this._key=n,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new we(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new tO(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return((e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const t=this._document.data.field(un("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}},tO=class extends pa{data(){return super.data()}};/**
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
 */class Rd{convertValue(e,t="none"){switch(Xe(e)){case 0:return null;case 1:return e.booleanValue;case 2:return Ne(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Kn(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw Y(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const n={};return Gr(e,((s,i)=>{n[s]=this.convertValue(i,t)})),n}convertVectorValue(e){var n,s,i;const t=(i=(s=(n=e.fields)==null?void 0:n[Cs].arrayValue)==null?void 0:s.values)==null?void 0:i.map((o=>Ne(o.doubleValue)));return new bt(t)}convertGeoPoint(e){return new on(Ne(e.latitude),Ne(e.longitude))}convertArray(e,t){return(e.values||[]).map((n=>this.convertValue(n,t)))}convertServerTimestamp(e,t){switch(t){case"previous":const n=Da(e);return n==null?null:this.convertValue(n,t);case"estimate":return this.convertTimestamp(ui(e));default:return null}}convertTimestamp(e){const t=Jn(e);return new ye(t.seconds,t.nanos)}convertDocumentKey(e,t){const n=ce.fromString(e);q(z_(n),9688,{name:e});const s=new br(n.get(1),n.get(3)),i=new J(n.popFirst(5));return s.isEqual(t)||qe(`A document reference to ${i} refers to a different database (${s.projectId}/${s.database}), which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
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
 */function Wu(r,e,t){let n;return n=r?t&&(t.merge||t.mergeFields)?r.toFirestore(e,t):r.toFirestore(e):e,n}class vd extends Rd{constructor(e){super(),this.firestore=e}convertBytes(e){return new Ot(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new we(this.firestore,null,t)}}/**
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
 */const sg="AsyncQueue";class ig{constructor(e=Promise.resolve()){this.qc=[],this.$c=!1,this.Kc=[],this.Qc=null,this.Wc=!1,this.Gc=!1,this.zc=[],this.jt=new wh(this,"async_queue_retry"),this.jc=()=>{const n=Nc();n&&U(sg,"Visibility state changed to "+n.visibilityState),this.jt.qt()},this.Hc=e;const t=Nc();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.jc)}get isShuttingDown(){return this.$c}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Jc(),this.Yc(e)}enterRestrictedMode(e){if(!this.$c){this.$c=!0,this.Gc=e||!1;const t=Nc();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.jc)}}enqueue(e){if(this.Jc(),this.$c)return new Promise((()=>{}));const t=new dt;return this.Yc((()=>this.$c&&this.Gc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.qc.push(e),this.Zc())))}async Zc(){if(this.qc.length!==0){try{await this.qc[0](),this.qc.shift(),this.jt.reset()}catch(e){if(!Hr(e))throw e;U(sg,"Operation failed with retryable error: "+e)}this.qc.length>0&&this.jt.Ut((()=>this.Zc()))}}Yc(e){const t=this.Hc.then((()=>(this.Wc=!0,e().catch((n=>{throw this.Qc=n,this.Wc=!1,qe("INTERNAL UNHANDLED ERROR: ",og(n)),n})).then((n=>(this.Wc=!1,n))))));return this.Hc=t,t}enqueueAfterDelay(e,t,n){this.Jc(),this.zc.indexOf(e)>-1&&(t=0);const s=Bd.createAndSchedule(this,e,t,n,(i=>this.Xc(i)));return this.Kc.push(s),s}Jc(){this.Qc&&Y(47125,{el:og(this.Qc)})}verifyOperationInProgress(){}async tl(){let e;do e=this.Hc,await e;while(e!==this.Hc)}nl(e){for(const t of this.Kc)if(t.timerId===e)return!0;return!1}rl(e){return this.tl().then((()=>{this.Kc.sort(((t,n)=>t.targetTimeMs-n.targetTimeMs));for(const t of this.Kc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.tl()}))}il(e){this.zc.push(e)}Xc(e){const t=this.Kc.indexOf(e);this.Kc.splice(t,1)}}function og(r){let e=r.message||"";return r.stack&&(e=r.stack.includes(r.message)?r.stack:r.message+`
`+r.stack),e}/**
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
 */class LI{constructor(){this._progressObserver={},this._taskCompletionResolver=new dt,this._lastProgress={taskState:"Running",totalBytes:0,totalDocuments:0,bytesLoaded:0,documentsLoaded:0}}onProgress(e,t,n){this._progressObserver={next:e,error:t,complete:n}}catch(e){return this._taskCompletionResolver.promise.catch(e)}then(e,t){return this._taskCompletionResolver.promise.then(e,t)}_completeWith(e){this._updateProgress(e),this._progressObserver.complete&&this._progressObserver.complete(),this._taskCompletionResolver.resolve(e)}_failWith(e){this._lastProgress.taskState="Error",this._progressObserver.next&&this._progressObserver.next(this._lastProgress),this._progressObserver.error&&this._progressObserver.error(e),this._taskCompletionResolver.reject(e)}_updateProgress(e){this._lastProgress=e,this._progressObserver.next&&this._progressObserver.next(e)}}/**
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
 */const nO=-1;class Ae extends Ra{constructor(e,t,n,s){super(e,t,n,s),this.type="firestore",this._queue=new ig,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new ig(e),this._firestoreClient=void 0,await e}}}function rO(r,e,t){t||(t=ra);const n=Ds(r,"firestore");if(n.isInitialized(t)){const s=n.getImmediate({identifier:t}),i=n.getOptions(t);if(cn(i,e))return s;throw new M(O.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(e.cacheSizeBytes!==void 0&&e.localCache!==void 0)throw new M(O.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(e.cacheSizeBytes!==void 0&&e.cacheSizeBytes!==-1&&e.cacheSizeBytes<iE)throw new M(O.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return e.host&&ki(e.host)&&GB(e.host),n.initialize({options:e,instanceIdentifier:t})}function sO(r,e){const t=typeof r=="object"?r:HB(),n=typeof r=="string"?r:e||ra,s=Ds(t,"firestore").getImmediate({identifier:n});if(!s._initialized){const i=qy("firestore");i&&uE(s,...i)}return s}function Me(r){if(r._terminated)throw new M(O.FAILED_PRECONDITION,"The client has already been terminated.");return r._firestoreClient||xI(r),r._firestoreClient}function xI(r){var n,s,i,o;const e=r._freezeSettings(),t=XP(r._databaseId,((n=r._app)==null?void 0:n.options.appId)||"",r._persistenceKey,(s=r._app)==null?void 0:s.options.apiKey,e);r._componentsProvider||(i=e.localCache)!=null&&i._offlineComponentProvider&&((o=e.localCache)!=null&&o._onlineComponentProvider)&&(r._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),r._firestoreClient=new G0(r._authCredentials,r._appCheckCredentials,r._queue,t,r._componentsProvider&&(function(c){const l=c==null?void 0:c._online.build();return{_offline:c==null?void 0:c._offline.build(l),_online:l}})(r._componentsProvider))}function iO(r,e){st("enableIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const t=r._freezeSettings();return VI(r,Vr.provider,{build:n=>new Dd(n,t.cacheSizeBytes,e==null?void 0:e.forceOwnership)}),Promise.resolve()}async function oO(r){st("enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const e=r._freezeSettings();VI(r,Vr.provider,{build:t=>new PI(t,e.cacheSizeBytes)})}function VI(r,e,t){if((r=de(r,Ae))._firestoreClient||r._terminated)throw new M(O.FAILED_PRECONDITION,"Firestore has already been started and persistence can no longer be enabled. You can only enable persistence before calling any other methods on a Firestore object.");if(r._componentsProvider||r._getSettings().localCache)throw new M(O.FAILED_PRECONDITION,"SDK cache is already specified.");r._componentsProvider={_online:e,_offline:t},xI(r)}function aO(r){if(r._initialized&&!r._terminated)throw new M(O.FAILED_PRECONDITION,"Persistence can only be cleared before a Firestore instance is initialized or after it is terminated.");const e=new dt;return r._queue.enqueueAndForgetEvenWhileRestricted((async()=>{try{await(async function(n){if(!yn.Je())return Promise.resolve();const s=n+nI;await yn.delete(s)})(id(r._databaseId,r._persistenceKey)),e.resolve()}catch(t){e.reject(t)}})),e.promise}function cO(r){return(function(t){const n=new dt;return t.asyncQueue.enqueueAndForget((async()=>A0(await Ad(t),n))),n.promise})(Me(r=de(r,Ae)))}function uO(r){return U0(Me(r=de(r,Ae)))}function lO(r){return H0(Me(r=de(r,Ae)))}function BO(r){return sD(r.app,"firestore",r._databaseId.database),r._delete()}function kB(r,e){const t=Me(r=de(r,Ae)),n=new LI;return $0(t,r._databaseId,e,n),n}function MI(r,e){return Y0(Me(r=de(r,Ae)),e).then((t=>t?new it(r,null,t.query):null))}/**
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
 */class Jr extends Rd{constructor(e){super(),this.firestore=e}convertBytes(e){return new Ot(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new we(this.firestore,null,t)}}/**
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
 *//**
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
 */const GI="NOT SUPPORTED";class xn{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class xt extends pa{constructor(e,t,n,s,i,o){super(e,t,n,s,o),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Qo(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const n=this._document.data.field(un("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new M(O.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=xt._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}function hO(r,e,t){if(As(e,xt._jsonSchema)){if(e.bundle===GI)throw new M(O.INVALID_ARGUMENT,"The provided JSON object was created in a client environment, which is not supported.");const n=vs(r._databaseId),s=kI(e.bundle,n),i=s.Sa(),o=new gd(s.getMetadata(),n);for(const B of i)o.qu(B);const a=o.documents;if(a.length!==1)throw new M(O.INVALID_ARGUMENT,`Expected bundle data to contain 1 document, but it contains ${a.length} documents.`);const c=Au(n,a[0].document),l=new J(ce.fromString(e.bundleName));return new xt(r,new vd(r),l,c,new xn(!1,!1),t||null)}}xt._jsonSchemaVersion="firestore/documentSnapshot/1.0",xt._jsonSchema={type:Ye("string",xt._jsonSchemaVersion),bundleSource:Ye("string","DocumentSnapshot"),bundleName:Ye("string"),bundle:Ye("string")};class Qo extends xt{data(e={}){return super.data(e)}}class Vt{constructor(e,t,n,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new xn(s.hasPendingWrites,s.fromCache),this.query=n}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((n=>{e.call(t,new Qo(this._firestore,this._userDataWriter,n.key,n,new xn(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new M(O.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(s,i){if(s._snapshot.oldDocs.isEmpty()){let o=0;return s._snapshot.docChanges.map((a=>{Ge(s._snapshot.query)?eu(s._snapshot.query):Tu(s.query._query);const c=new Qo(s._firestore,s._userDataWriter,a.doc.key,a.doc,new xn(s._snapshot.mutatedKeys.has(a.doc.key),s._snapshot.fromCache),s.query.converter);return a.doc,{type:"added",doc:c,oldIndex:-1,newIndex:o++}}))}{let o=s._snapshot.oldDocs;return s._snapshot.docChanges.filter((a=>i||a.type!==3)).map((a=>{const c=new Qo(s._firestore,s._userDataWriter,a.doc.key,a.doc,new xn(s._snapshot.mutatedKeys.has(a.doc.key),s._snapshot.fromCache),s.query.converter);let l=-1,B=-1;return a.type!==0&&(l=o.indexOf(a.doc.key),o=o.delete(a.doc.key)),a.type!==1&&(o=o.add(a.doc),B=o.indexOf(a.doc.key)),{type:fO(a.type),doc:c,oldIndex:l,newIndex:B}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new M(O.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=Vt._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=_u.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],n=[],s=[];return this.docs.forEach((i=>{i._document!==null&&(t.push(i._document),n.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function dO(r,e,t){if(As(e,Vt._jsonSchema)){if(e.bundle===GI)throw new M(O.INVALID_ARGUMENT,"The provided JSON object was created in a client environment, which is not supported.");const n=vs(r._databaseId),s=kI(e.bundle,n),i=s.Sa(),o=new gd(s.getMetadata(),n);for(const g of i)o.qu(g);if(o.queries.length!==1)throw new M(O.INVALID_ARGUMENT,`Snapshot data expected 1 query but found ${o.queries.length} queries.`);const a=Mu(o.queries[0].bundledQuery),c=Ge(a)?eu(a):Tu(a),l=o.documents;let B=new Rr(c);l.map((g=>{const I=Au(n,g.document);B=B.add(I)}));const d=ws.fromInitialDocuments(a,B,ae(),!1,!1),C=new it(r,t||null,a);return new Vt(r,new vd(r),C,d)}}function fO(r){switch(r){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return Y(61501,{type:r})}}function CO(r,e){return r instanceof xt&&e instanceof xt?r._firestore===e._firestore&&r._key.isEqual(e._key)&&(r._document===null?e._document===null:r._document.isEqual(e._document))&&r._converter===e._converter:r instanceof Vt&&e instanceof Vt&&r._firestore===e._firestore&&Th(r.query,e.query)&&r.metadata.isEqual(e.metadata)&&r._snapshot.isEqual(e._snapshot)}/**
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
 */Vt._jsonSchemaVersion="firestore/querySnapshot/1.0",Vt._jsonSchema={type:Ye("string",Vt._jsonSchemaVersion),bundleSource:Ye("string","QuerySnapshot"),bundleName:Ye("string"),bundle:Ye("string")};/**
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
 */function pO(r){var n;const e=Me(de(r.firestore,Ae)),t=(n=e._onlineComponents)==null?void 0:n.datastore.serializer;return t===void 0?null:Ru(t,It(r._query)).be}function gO(r,e){var i;const t=ah(e,((o,a)=>new zm(a,o.aggregateType,o._internalFieldPath))),n=Me(de(r.firestore,Ae)),s=(i=n._onlineComponents)==null?void 0:i.datastore.serializer;return s===void 0?null:H_(s,T_(r._query),t,!0).request}/**
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
 */class Si{constructor(e="count",t){this._internalFieldPath=t,this.type="AggregateField",this.aggregateType=e}}class UI{constructor(e,t,n){this._userDataWriter=t,this._data=n,this.type="AggregateQuerySnapshot",this.query=e}data(){return this._userDataWriter.convertObjectMap(this._data)}_fieldsProto(){return new tt({mapValue:{fields:this._data}}).clone().value.mapValue.fields}}/**
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
 */function HI(r){if(r.limitType==="L"&&r.explicitOrderBy.length===0)throw new M(O.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class Pd{}class Xi extends Pd{}function mO(r,e,...t){let n=[];e instanceof Pd&&n.push(e),n=n.concat(t),(function(i){const o=i.filter((c=>c instanceof Fs)).length,a=i.filter((c=>c instanceof Zi)).length;if(o>1||o>0&&a>0)throw new M(O.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")})(n);for(const s of n)r=s._apply(r);return r}class Zi extends Xi{constructor(e,t,n){super(),this._field=e,this._op=t,this._value=n,this.type="where"}static _create(e,t,n){return new Zi(e,t,n)}_apply(e){const t=this._parse(e);return jI(e._query,t),new it(e.firestore,e.converter,fB(e._query,t))}_parse(e){const t=bs(e.firestore);return(function(i,o,a,c,l,B,d){let C;if(l.isKeyField()){if(B==="array-contains"||B==="array-contains-any")throw new M(O.INVALID_ARGUMENT,`Invalid Query. You can't perform '${B}' queries on documentId().`);if(B==="in"||B==="not-in"){cg(d,B);const I=[];for(const P of d)I.push(ag(c,i,P));C={arrayValue:{values:I}}}else C=ag(c,i,d)}else B!=="in"&&B!=="not-in"&&B!=="array-contains-any"||cg(d,B),C=fE(a,o,d,B==="in"||B==="not-in");return pe.create(l,B,C)})(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function _O(r,e,t){const n=e,s=un("where",r);return Zi._create(s,n,t)}class Fs extends Pd{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new Fs(e,t)}_parse(e){const t=this._queryConstraints.map((n=>n._parse(e))).filter((n=>n.getFilters().length>0));return t.length===1?t[0]:Te.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:((function(s,i){let o=s;const a=i.getFlattenedFilters();for(const c of a)jI(o,c),o=fB(o,c)})(e._query,t),new it(e.firestore,e.converter,fB(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}function EO(...r){return r.forEach((e=>JI("or",e))),Fs._create("or",r)}function IO(...r){return r.forEach((e=>JI("and",e))),Fs._create("and",r)}class Qu extends Xi{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new Qu(e,t)}_apply(e){const t=(function(s,i,o){if(s.startAt!==null)throw new M(O.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new M(O.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new ia(i,o)})(e._query,this._field,this._direction);return new it(e.firestore,e.converter,BP(e._query,t))}}function yO(r,e="asc"){const t=e,n=un("orderBy",r);return Qu._create(n,t)}class La extends Xi{constructor(e,t,n){super(),this.type=e,this._limit=t,this._limitType=n}static _create(e,t,n){return new La(e,t,n)}_apply(e){return new it(e.firestore,e.converter,jc(e._query,this._limit,this._limitType))}}function wO(r){return Xm("limit",r),La._create("limit",r,"F")}function DO(r){return Xm("limitToLast",r),La._create("limitToLast",r,"L")}class xa extends Xi{constructor(e,t,n){super(),this.type=e,this._docOrFields=t,this._inclusive=n}static _create(e,t,n){return new xa(e,t,n)}_apply(e){const t=qI(e,this.type,this._docOrFields,this._inclusive);return new it(e.firestore,e.converter,hP(e._query,t))}}function TO(...r){return xa._create("startAt",r,!0)}function AO(...r){return xa._create("startAfter",r,!1)}class Va extends Xi{constructor(e,t,n){super(),this.type=e,this._docOrFields=t,this._inclusive=n}static _create(e,t,n){return new Va(e,t,n)}_apply(e){const t=qI(e,this.type,this._docOrFields,this._inclusive);return new it(e.firestore,e.converter,dP(e._query,t))}}function RO(...r){return Va._create("endBefore",r,!1)}function vO(...r){return Va._create("endAt",r,!0)}function qI(r,e,t,n){if(t[0]=oe(t[0]),t[0]instanceof pa)return(function(i,o,a,c,l){if(!c)throw new M(O.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${a}().`);const B=[];for(const d of si(i))if(d.field.isKeyField())B.push(ps(o,c.key));else{const C=c.data.field(d.field);if(wa(C))throw new M(O.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+d.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(C===null){const g=d.field.canonicalString();throw new M(O.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${g}' (used as the orderBy) does not exist.`)}B.push(C)}return new Or(B,l)})(r._query,r.firestore._databaseId,e,t[0]._document,n);{const s=bs(r.firestore);return(function(o,a,c,l,B,d){const C=o.explicitOrderBy;if(B.length>C.length)throw new M(O.INVALID_ARGUMENT,`Too many arguments provided to ${l}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);const g=[];for(let I=0;I<B.length;I++){const P=B[I];if(C[I].field.isKeyField()){if(typeof P!="string")throw new M(O.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${l}(), but got a ${typeof P}`);if(!mh(o)&&P.indexOf("/")!==-1)throw new M(O.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${l}() must be a plain document ID, but '${P}' contains a slash.`);const F=o.path.child(ce.fromString(P));if(!J.isDocumentKey(F))throw new M(O.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${l}() must result in a valid document path, but '${F}' is not because it contains an odd number of segments.`);const H=new J(F);g.push(ps(a,H))}else{const F=fE(c,l,P);g.push(F)}}return new Or(g,d)})(r._query,r.firestore._databaseId,s,e,t,n)}}function ag(r,e,t){if(typeof(t=oe(t))=="string"){if(t==="")throw new M(O.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!mh(e)&&t.indexOf("/")!==-1)throw new M(O.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const n=e.path.child(ce.fromString(t));if(!J.isDocumentKey(n))throw new M(O.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${n}' is not because it has an odd number of segments (${n.length}).`);return ps(r,new J(n))}if(t instanceof we)return ps(r,t._key);throw new M(O.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Eu(t)}.`)}function cg(r,e){if(!Array.isArray(r)||r.length===0)throw new M(O.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function jI(r,e){const t=(function(s,i){for(const o of s)for(const a of o.getFlattenedFilters())if(i.indexOf(a.op)>=0)return a.op;return null})(r.filters,(function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}})(e.op));if(t!==null)throw t===e.op?new M(O.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new M(O.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}function JI(r,e){if(!(e instanceof Zi||e instanceof Fs))throw new M(O.INVALID_ARGUMENT,`Function ${r}() requires AppliableConstraints created with a call to 'where(...)', 'or(...)', or 'and(...)'.`)}function PO(r){return new Si("sum",un("sum",r))}function bO(r){return new Si("avg",un("average",r))}function KI(){return new Si("count")}function SO(r,e){var t,n;return r instanceof Si&&e instanceof Si&&r.aggregateType===e.aggregateType&&((t=r._internalFieldPath)==null?void 0:t.canonicalString())===((n=e._internalFieldPath)==null?void 0:n.canonicalString())}function NO(r,e){return Th(r.query,e.query)&&cn(r.data(),e.data())}/**
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
 */function oi(r){return(function(t,n){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of n)if(i in s&&typeof s[i]=="function")return!0;return!1})(r,["next","error","complete"])}function OO(r){return zI(r,{count:KI()})}function zI(r,e){const t=de(r.firestore,Ae),n=Me(t),s=ah(e,((i,o)=>new zm(o,i.aggregateType,i._internalFieldPath)));return K0(n,r._query,s).then((i=>(function(a,c,l){const B=new Jr(a);return new UI(c,B,l)})(t,r,i)))}class FO{constructor(e){this.kind="memory",this._onlineComponentProvider=Vr.provider,this._offlineComponentProvider=e!=null&&e.garbageCollector?e.garbageCollector._offlineComponentProvider:{build:()=>new wd(void 0)}}toJSON(){return{kind:this.kind}}}class kO{constructor(e){let t;this.kind="persistent",e!=null&&e.tabManager?(e.tabManager._initialize(e),t=e.tabManager):(t=WI(void 0),t._initialize(e)),this._onlineComponentProvider=t._onlineComponentProvider,this._offlineComponentProvider=t._offlineComponentProvider}toJSON(){return{kind:this.kind}}}class LO{constructor(){this.kind="memoryEager",this._offlineComponentProvider=Pi.provider}toJSON(){return{kind:this.kind}}}class xO{constructor(e){this.kind="memoryLru",this._offlineComponentProvider={build:()=>new wd(e)}}toJSON(){return{kind:this.kind}}}function VO(){return new LO}function MO(r){return new xO(r==null?void 0:r.cacheSizeBytes)}function GO(r){return new FO(r)}function UO(r){return new kO(r)}class HO{constructor(e){this.forceOwnership=e,this.kind="persistentSingleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=Vr.provider,this._offlineComponentProvider={build:t=>new Dd(t,e==null?void 0:e.cacheSizeBytes,this.forceOwnership)}}}class qO{constructor(){this.kind="PersistentMultipleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=Vr.provider,this._offlineComponentProvider={build:t=>new PI(t,e==null?void 0:e.cacheSizeBytes)}}}function WI(r){return new HO(r==null?void 0:r.forceOwnership)}function jO(){return new qO}/**
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
 */const JO={maxAttempts:5};/**
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
 */class QI{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=bs(e)}set(e,t,n){this._verifyNotCommitted();const s=Er(e,this._firestore),i=Wu(s.converter,t,n),o=bu(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,n);return this._mutations.push(o.toMutation(s._key,Ve.none())),this}update(e,t,n,...s){this._verifyNotCommitted();const i=Er(e,this._firestore);let o;return o=typeof(t=oe(t))=="string"||t instanceof Ps?Oh(this._dataReader,"WriteBatch.update",i._key,t,n,s):Nh(this._dataReader,"WriteBatch.update",i._key,t),this._mutations.push(o.toMutation(i._key,Ve.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=Er(e,this._firestore);return this._mutations=this._mutations.concat(new Hi(t._key,Ve.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new M(O.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function Er(r,e){if((r=oe(r)).firestore!==e)throw new M(O.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return r}/**
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
 */let KO=class{constructor(e,t){this._firestore=e,this._transaction=t,this._dataReader=bs(e)}get(e){const t=Er(e,this._firestore),n=new vd(this._firestore);return this._transaction.lookup([t._key]).then((s=>{if(!s||s.length!==1)return Y(24041);const i=s[0];if(i.isFoundDocument())return new pa(this._firestore,n,i.key,i,t.converter);if(i.isNoDocument())return new pa(this._firestore,n,t._key,null,t.converter);throw Y(18433,{doc:i})}))}set(e,t,n){const s=Er(e,this._firestore),i=Wu(s.converter,t,n),o=bu(this._dataReader,"Transaction.set",s._key,i,s.converter!==null,n);return this._transaction.set(s._key,o),this}update(e,t,n,...s){const i=Er(e,this._firestore);let o;return o=typeof(t=oe(t))=="string"||t instanceof Ps?Oh(this._dataReader,"Transaction.update",i._key,t,n,s):Nh(this._dataReader,"Transaction.update",i._key,t),this._transaction.update(i._key,o),this}delete(e){const t=Er(e,this._firestore);return this._transaction.delete(t._key),this}};/**
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
 */class $I extends KO{constructor(e,t){super(e,t),this._firestore=e}get(e){const t=Er(e,this._firestore),n=new Jr(this._firestore);return super.get(e).then((s=>new xt(this._firestore,n,t._key,s._document,new xn(!1,!1),t.converter)))}}function zO(r,e,t){r=de(r,Ae);const n={...JO,...t};(function(o){if(o.maxAttempts<1)throw new M(O.INVALID_ARGUMENT,"Max attempts must be at least 1")})(n);const s=Me(r);return Q0(s,(i=>e(new $I(r,i))),n)}/**
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
 */function WO(r){r=de(r,we);const e=de(r.firestore,Ae),t=Me(e);return OI(t,r._key).then((n=>bd(e,r,n)))}function QO(r){r=de(r,we);const e=de(r.firestore,Ae),t=Me(e),n=new Jr(e);return j0(t,r._key).then((s=>new xt(e,n,r._key,s,new xn(s!==null&&s.hasLocalMutations,!0),r.converter)))}function $O(r){r=de(r,we);const e=de(r.firestore,Ae),t=Me(e);return OI(t,r._key,{source:"server"}).then((n=>bd(e,r,n)))}function YO(r){r=de(r,it);const e=de(r.firestore,Ae),t=Me(e),n=new Jr(e);return HI(r._query),FI(t,r._query).then((s=>new Vt(e,n,r,s)))}function XO(r){r=de(r,it);const e=de(r.firestore,Ae),t=Me(e),n=new Jr(e);return J0(t,r._query).then((s=>new Vt(e,n,r,s)))}function ZO(r){r=de(r,it);const e=de(r.firestore,Ae),t=Me(e),n=new Jr(e);return FI(t,r._query,{source:"server"}).then((s=>new Vt(e,n,r,s)))}function eF(r,e,t){r=de(r,we);const n=de(r.firestore,Ae),s=Wu(r.converter,e,t),i=bs(n);return eo(n,[bu(i,"setDoc",r._key,s,r.converter!==null,t).toMutation(r._key,Ve.none())])}function tF(r,e,t,...n){r=de(r,we);const s=de(r.firestore,Ae),i=bs(s);let o;return o=typeof(e=oe(e))=="string"||e instanceof Ps?Oh(i,"updateDoc",r._key,e,t,n):Nh(i,"updateDoc",r._key,e),eo(s,[o.toMutation(r._key,Ve.exists(!0))])}function nF(r){return eo(de(r.firestore,Ae),[new Hi(r._key,Ve.none())])}function rF(r,e){const t=de(r.firestore,Ae),n=lE(r),s=Wu(r.converter,e),i=bs(r.firestore);return eo(t,[bu(i,"addDoc",n._key,s,r.converter!==null,{}).toMutation(n._key,Ve.exists(!1))]).then((()=>n))}function LB(r,...e){var l,B,d;r=oe(r);let t={includeMetadataChanges:!1,source:"default"},n=0;typeof e[n]!="object"||oi(e[n])||(t=e[n++]);const s={includeMetadataChanges:t.includeMetadataChanges,source:t.source};if(oi(e[n])){const C=e[n];e[n]=(l=C.next)==null?void 0:l.bind(C),e[n+1]=(B=C.error)==null?void 0:B.bind(C),e[n+2]=(d=C.complete)==null?void 0:d.bind(C)}let i,o,a;if(r instanceof we)o=de(r.firestore,Ae),a=qi(r._key.path),i={next:C=>{e[n]&&e[n](bd(o,r,C))},error:e[n+1],complete:e[n+2]};else{const C=de(r,it);o=de(C.firestore,Ae),a=C._query;const g=new Jr(o);i={next:I=>{e[n]&&e[n](new Vt(o,g,C,I))},error:e[n+1],complete:e[n+2]},HI(r._query)}const c=Me(o);return q0(c,a,s,i)}function sF(r,e,...t){const n=oe(r),s=(function(c){const l={bundle:"",bundleName:"",bundleSource:""},B=["bundle","bundleName","bundleSource"];for(const d of B){if(!(d in c)){l.error=`snapshotJson missing required field: ${d}`;break}const C=c[d];if(typeof C!="string"){l.error=`snapshotJson field '${d}' must be a string.`;break}if(C.length===0){l.error=`snapshotJson field '${d}' cannot be an empty string.`;break}d==="bundle"?l.bundle=C:d==="bundleName"?l.bundleName=C:d==="bundleSource"&&(l.bundleSource=C)}return l})(e);if(s.error)throw new M(O.INVALID_ARGUMENT,s.error);let i,o=0;if(typeof t[o]!="object"||oi(t[o])||(i=t[o++]),s.bundleSource==="QuerySnapshot"){let a=null;if(typeof t[o]=="object"&&oi(t[o])){const c=t[o++];a={next:c.next,error:c.error,complete:c.complete}}else a={next:t[o++],error:t[o++],complete:t[o++]};return(function(l,B,d,C,g){let I,P=!1;return kB(l,B.bundle).then((()=>MI(l,B.bundleName))).then((H=>{H&&!P&&(g&&H.withConverter(g),I=LB(H,d||{},C))})).catch((H=>(C.error&&C.error(H),()=>{}))),()=>{P||(P=!0,I&&I())}})(n,s,i,a,t[o])}if(s.bundleSource==="DocumentSnapshot"){let a=null;if(typeof t[o]=="object"&&oi(t[o])){const c=t[o++];a={next:c.next,error:c.error,complete:c.complete}}else a={next:t[o++],error:t[o++],complete:t[o++]};return(function(l,B,d,C,g){let I,P=!1;return kB(l,B.bundle).then((()=>{if(!P){const H=new we(l,g||null,J.fromPath(B.bundleName));I=LB(H,d||{},C)}})).catch((H=>(C.error&&C.error(H),()=>{}))),()=>{P||(P=!0,I&&I())}})(n,s,i,a,t[o])}throw new M(O.INVALID_ARGUMENT,`unsupported bundle source: ${s.bundleSource}`)}function iF(r,e){r=de(r,Ae);const t=Me(r),n=oi(e)?e:{next:e};return W0(t,n)}function eo(r,e){const t=Me(r);return z0(t,e)}function bd(r,e,t){const n=t.docs.get(e._key),s=new Jr(r);return new xt(r,s,e._key,n,new xn(t.hasPendingWrites,t.fromCache),e.converter)}function oF(r){return r=de(r,Ae),Me(r),new QI(r,(e=>eo(r,e)))}/**
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
 */function aF(r,e){r=de(r,Ae);const t=Me(r);if(!t._uninitializedComponentsProvider||t._uninitializedComponentsProvider._offline.kind==="memory")return st("Cannot enable indexes when persistence is disabled"),Promise.resolve();const n=(function(i){const o=typeof i=="string"?(function(l){try{return JSON.parse(l)}catch(B){throw new M(O.INVALID_ARGUMENT,"Failed to parse JSON: "+(B==null?void 0:B.message))}})(i):i,a=[];if(Array.isArray(o.indexes))for(const c of o.indexes){const l=ug(c,"collectionGroup"),B=[];if(Array.isArray(c.fields))for(const d of c.fields){const C=ug(d,"fieldPath"),g=kh("setIndexConfiguration",C);d.arrayConfig==="CONTAINS"?B.push(new Bs(g,2)):d.order==="ASCENDING"?B.push(new Bs(g,0)):d.order==="DESCENDING"&&B.push(new Bs(g,1))}a.push(new gi(gi.UNKNOWN_ID,l,B,mi.empty()))}return a})(e);return X0(t,n)}function ug(r,e){if(typeof r[e]!="string")throw new M(O.INVALID_ARGUMENT,"Missing string value for: "+e);return r[e]}/**
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
 */class YI{constructor(e){this._firestore=e,this.type="PersistentCacheIndexManager"}}function cF(r){var s;r=de(r,Ae);const e=lg.get(r);if(e)return e;if(((s=Me(r)._uninitializedComponentsProvider)==null?void 0:s._offline.kind)!=="persistent")return null;const n=new YI(r);return lg.set(r,n),n}function uF(r){XI(r,!0)}function lF(r){XI(r,!1)}function BF(r){const e=Me(r._firestore);eO(e).then((t=>U("deleting all persistent cache indexes succeeded"))).catch((t=>st("deleting all persistent cache indexes failed",t)))}function XI(r,e){const t=Me(r._firestore);Z0(t,e).then((n=>U(`setting persistent cache index auto creation isEnabled=${e} succeeded`))).catch((n=>st(`setting persistent cache index auto creation isEnabled=${e} failed`,n)))}const lg=new WeakMap;/**
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
 */class hF{constructor(){throw new Error("instances of this class should not be created")}static onExistenceFilterMismatch(e){return Sd.instance.onExistenceFilterMismatch(e)}}class Sd{constructor(){this.t=new Map}static get instance(){return mc||(mc=new Sd,EP(mc)),mc}Ie(e){this.t.forEach((t=>t(e)))}onExistenceFilterMismatch(e){const t=Symbol(),n=this.t;return n.set(t,e),()=>n.delete(t)}}let mc=null;const Bg="@firebase/firestore",hg="4.17.1";(function(e,t=!0){Fv(Li),vr(new Un("firestore",((n,{instanceIdentifier:s,options:i})=>{const o=n.getProvider("app").getImmediate(),a=new Ae(new LP(n.getProvider("auth-internal")),new MP(o,n.getProvider("app-check-internal")),jv(o,s),o);return i={useFetchStreams:t,...i},a._setSettings(i),a}),"PUBLIC").setMultipleInstances(!0)),Vn(Bg,hg,e),Vn(Bg,hg,"esm2020")})();const LF=Object.freeze(Object.defineProperty({__proto__:null,AbstractUserDataWriter:Rd,AggregateField:Si,AggregateQuerySnapshot:UI,Bytes:Ot,CACHE_SIZE_UNLIMITED:nO,CollectionReference:an,DocumentReference:we,DocumentSnapshot:xt,FieldPath:Ps,FieldValue:vn,Firestore:Ae,FirestoreError:M,GeoPoint:on,LoadBundleTask:LI,PersistentCacheIndexManager:YI,Query:it,QueryCompositeFilterConstraint:Fs,QueryConstraint:Xi,QueryDocumentSnapshot:Qo,QueryEndAtConstraint:Va,QueryFieldFilterConstraint:Zi,QueryLimitConstraint:La,QueryOrderByConstraint:Qu,QuerySnapshot:Vt,QueryStartAtConstraint:xa,SnapshotMetadata:xn,Timestamp:ye,Transaction:$I,VectorValue:bt,WriteBatch:QI,_AutoId:_u,_ByteString:Oe,_DatabaseId:br,_DocumentKey:J,_EmptyAppCheckTokenProvider:GP,_EmptyAuthCredentialsProvider:X_,_FieldPath:je,_TestingHooks:hF,_cast:de,_debugAssert:Lv,_internalAggregationQueryToProtoRunAggregationQueryRequest:gO,_internalQueryToProtoQueryTarget:pO,_isBase64Available:Uv,_logWarn:st,_validateIsNotUsedTogether:Ym,addDoc:rF,aggregateFieldEqual:SO,aggregateQuerySnapshotEqual:NO,and:IO,arrayRemove:fb,arrayUnion:db,average:bO,clearIndexedDbPersistence:aO,collection:rb,collectionGroup:sb,connectFirestoreEmulator:uE,count:KI,deleteAllPersistentCacheIndexes:BF,deleteDoc:nF,deleteField:Bb,disableNetwork:lO,disablePersistentCacheIndexAutoCreation:lF,doc:lE,documentId:$_,documentSnapshotFromJSON:hO,enableIndexedDbPersistence:iO,enableMultiTabIndexedDbPersistence:oO,enableNetwork:uO,enablePersistentCacheIndexAutoCreation:uF,endAt:vO,endBefore:RO,ensureFirestoreConfigured:Me,executeWrite:eo,getAggregateFromServer:zI,getCountFromServer:OO,getDoc:WO,getDocFromCache:QO,getDocFromServer:$O,getDocs:YO,getDocsFromCache:XO,getDocsFromServer:ZO,getFirestore:sO,getPersistentCacheIndexManager:cF,increment:Cb,initializeFirestore:rO,limit:wO,limitToLast:DO,loadBundle:kB,maximum:gb,memoryEagerGarbageCollector:VO,memoryLocalCache:GO,memoryLruGarbageCollector:MO,minimum:pb,namedQuery:MI,onSnapshot:LB,onSnapshotResume:sF,onSnapshotsInSync:iF,or:EO,orderBy:yO,persistentLocalCache:UO,persistentMultipleTabManager:jO,persistentSingleTabManager:WI,query:mO,queryEqual:Th,querySnapshotFromJSON:dO,refEqual:ib,runTransaction:zO,serverTimestamp:hb,setDoc:eF,setIndexConfiguration:aF,setLogLevel:kv,snapshotEqual:CO,startAfter:AO,startAt:TO,sum:PO,terminate:BO,updateDoc:tF,vector:_E,waitForPendingWrites:cO,where:_O,writeBatch:oF},Symbol.toStringTag,{value:"Module"}));/*! Capacitor: https://capacitorjs.com/ - MIT License */var Ni;(function(r){r.Unimplemented="UNIMPLEMENTED",r.Unavailable="UNAVAILABLE"})(Ni||(Ni={}));class Kl extends Error{constructor(e,t,n){super(e),this.message=e,this.code=t,this.data=n}}const dF=r=>{var e,t;return r!=null&&r.androidBridge?"android":!((t=(e=r==null?void 0:r.webkit)===null||e===void 0?void 0:e.messageHandlers)===null||t===void 0)&&t.bridge?"ios":"web"},fF=r=>{const e=r.CapacitorCustomPlatform||null,t=r.Capacitor||{},n=t.Plugins=t.Plugins||{},s=()=>e!==null?e.name:dF(r),i=()=>s()!=="web",o=d=>{const C=l.get(d);return!!(C!=null&&C.platforms.has(s())||a(d))},a=d=>{var C;return(C=t.PluginHeaders)===null||C===void 0?void 0:C.find(g=>g.name===d)},c=d=>r.console.error(d),l=new Map,B=(d,C={})=>{const g=l.get(d);if(g)return console.warn(`Capacitor plugin "${d}" already registered. Cannot register plugins twice.`),g.proxy;const I=s(),P=a(d);let F;const H=async()=>(!F&&I in C?F=typeof C[I]=="function"?F=await C[I]():F=C[I]:e!==null&&!F&&"web"in C&&(F=typeof C.web=="function"?F=await C.web():F=C.web),F),Z=(m,w)=>{var v,T;if(P){const S=P==null?void 0:P.methods.find(y=>w===y.name);if(S)return S.rtype==="promise"?y=>t.nativePromise(d,w.toString(),y):(y,Ze)=>t.nativeCallback(d,w.toString(),y,Ze);if(m)return(v=m[w])===null||v===void 0?void 0:v.bind(m)}else{if(m)return(T=m[w])===null||T===void 0?void 0:T.bind(m);throw new Kl(`"${d}" plugin is not implemented on ${I}`,Ni.Unimplemented)}},ee=m=>{let w;const v=(...T)=>{const S=H().then(y=>{const Ze=Z(y,m);if(Ze){const Wt=Ze(...T);return w=Wt==null?void 0:Wt.remove,Wt}else throw new Kl(`"${d}.${m}()" is not implemented on ${I}`,Ni.Unimplemented)});return m==="addListener"&&(S.remove=async()=>w()),S};return v.toString=()=>`${m.toString()}() { [capacitor code] }`,Object.defineProperty(v,"name",{value:m,writable:!1,configurable:!1}),v},Be=ee("addListener"),he=ee("removeListener"),ue=(m,w)=>{const v=Be({eventName:m},w),T=async()=>{const y=await v;he({eventName:m,callbackId:y},w)},S=new Promise(y=>v.then(()=>y({remove:T})));return S.remove=async()=>{console.warn("Using addListener() without 'await' is deprecated."),await T()},S},D=new Proxy({},{get(m,w){switch(w){case"$$typeof":return;case"toJSON":return()=>({});case"addListener":return P?ue:Be;case"removeListener":return he;default:return ee(w)}}});return n[d]=D,l.set(d,{name:d,proxy:D,platforms:new Set([...Object.keys(C),...P?[I]:[]])}),D};return t.convertFileSrc||(t.convertFileSrc=d=>d),t.getPlatform=s,t.handleError=c,t.isNativePlatform=i,t.isPluginAvailable=o,t.registerPlugin=B,t.Exception=Kl,t.DEBUG=!!t.DEBUG,t.isLoggingEnabled=!!t.isLoggingEnabled,t},CF=r=>r.Capacitor=fF(r),xB=CF(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),$u=xB.registerPlugin;class Yu{constructor(){this.listeners={},this.retainedEventArguments={},this.windowListeners={}}addListener(e,t){let n=!1;this.listeners[e]||(this.listeners[e]=[],n=!0),this.listeners[e].push(t);const i=this.windowListeners[e];i&&!i.registered&&this.addWindowListener(i),n&&this.sendRetainedArgumentsForEvent(e);const o=async()=>this.removeListener(e,t);return Promise.resolve({remove:o})}async removeAllListeners(){this.listeners={};for(const e in this.windowListeners)this.removeWindowListener(this.windowListeners[e]);this.windowListeners={}}notifyListeners(e,t,n){const s=this.listeners[e];if(!s){if(n){let i=this.retainedEventArguments[e];i||(i=[]),i.push(t),this.retainedEventArguments[e]=i}return}s.forEach(i=>i(t))}hasListeners(e){var t;return!!(!((t=this.listeners[e])===null||t===void 0)&&t.length)}registerWindowListener(e,t){this.windowListeners[t]={registered:!1,windowEventName:e,pluginEventName:t,handler:n=>{this.notifyListeners(t,n)}}}unimplemented(e="not implemented"){return new xB.Exception(e,Ni.Unimplemented)}unavailable(e="not available"){return new xB.Exception(e,Ni.Unavailable)}async removeListener(e,t){const n=this.listeners[e];if(!n)return;const s=n.indexOf(t);this.listeners[e].splice(s,1),this.listeners[e].length||this.removeWindowListener(this.windowListeners[e])}addWindowListener(e){window.addEventListener(e.windowEventName,e.handler),e.registered=!0}removeWindowListener(e){e&&(window.removeEventListener(e.windowEventName,e.handler),e.registered=!1)}sendRetainedArgumentsForEvent(e){const t=this.retainedEventArguments[e];t&&(delete this.retainedEventArguments[e],t.forEach(n=>{this.notifyListeners(e,n)}))}}const dg=r=>encodeURIComponent(r).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),fg=r=>r.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent);class pF extends Yu{async getCookies(){const e=document.cookie,t={};return e.split(";").forEach(n=>{if(n.length<=0)return;let[s,i]=n.replace(/=/,"CAP_COOKIE").split("CAP_COOKIE");s=fg(s).trim(),i=fg(i).trim(),t[s]=i}),t}async setCookie(e){try{const t=dg(e.key),n=dg(e.value),s=e.expires?`; expires=${e.expires.replace("expires=","")}`:"",i=(e.path||"/").replace("path=",""),o=e.url!=null&&e.url.length>0?`domain=${e.url}`:"";document.cookie=`${t}=${n||""}${s}; path=${i}; ${o};`}catch(t){return Promise.reject(t)}}async deleteCookie(e){try{document.cookie=`${e.key}=; Max-Age=0`}catch(t){return Promise.reject(t)}}async clearCookies(){try{const e=document.cookie.split(";")||[];for(const t of e)document.cookie=t.replace(/^ +/,"").replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(e){return Promise.reject(e)}}async clearAllCookies(){try{await this.clearCookies()}catch(e){return Promise.reject(e)}}}$u("CapacitorCookies",{web:()=>new pF});const gF=async r=>new Promise((e,t)=>{const n=new FileReader;n.onload=()=>{const s=n.result;e(s.indexOf(",")>=0?s.split(",")[1]:s)},n.onerror=s=>t(s),n.readAsDataURL(r)}),mF=(r={})=>{const e=Object.keys(r);return Object.keys(r).map(s=>s.toLocaleLowerCase()).reduce((s,i,o)=>(s[i]=r[e[o]],s),{})},_F=(r,e=!0)=>r?Object.entries(r).reduce((n,s)=>{const[i,o]=s;let a,c;return Array.isArray(o)?(c="",o.forEach(l=>{a=e?encodeURIComponent(l):l,c+=`${i}=${a}&`}),c.slice(0,-1)):(a=e?encodeURIComponent(o):o,c=`${i}=${a}`),`${n}&${c}`},"").substr(1):null,EF=(r,e={})=>{const t=Object.assign({method:r.method||"GET",headers:r.headers},e),s=mF(r.headers)["content-type"]||"";if(typeof r.data=="string")t.body=r.data;else if(s.includes("application/x-www-form-urlencoded")){const i=new URLSearchParams;for(const[o,a]of Object.entries(r.data||{}))i.set(o,a);t.body=i.toString()}else if(s.includes("multipart/form-data")||r.data instanceof FormData){const i=new FormData;if(r.data instanceof FormData)r.data.forEach((a,c)=>{i.append(c,a)});else for(const a of Object.keys(r.data))i.append(a,r.data[a]);t.body=i;const o=new Headers(t.headers);o.delete("content-type"),t.headers=o}else(s.includes("application/json")||typeof r.data=="object")&&(t.body=JSON.stringify(r.data));return t};class IF extends Yu{async request(e){const t=EF(e,e.webFetchExtra),n=_F(e.params,e.shouldEncodeUrlParams),s=n?`${e.url}?${n}`:e.url,i=await fetch(s,t),o=i.headers.get("content-type")||"";let{responseType:a="text"}=i.ok?e:{};o.includes("application/json")&&(a="json");let c,l;switch(a){case"arraybuffer":case"blob":l=await i.blob(),c=await gF(l);break;case"json":c=await i.json();break;case"document":case"text":default:c=await i.text()}const B={};return i.headers.forEach((d,C)=>{B[C]=d}),{data:c,headers:B,status:i.status,url:i.url}}async get(e){return this.request(Object.assign(Object.assign({},e),{method:"GET"}))}async post(e){return this.request(Object.assign(Object.assign({},e),{method:"POST"}))}async put(e){return this.request(Object.assign(Object.assign({},e),{method:"PUT"}))}async patch(e){return this.request(Object.assign(Object.assign({},e),{method:"PATCH"}))}async delete(e){return this.request(Object.assign(Object.assign({},e),{method:"DELETE"}))}}$u("CapacitorHttp",{web:()=>new IF});var Cg;(function(r){r.Dark="DARK",r.Light="LIGHT",r.Default="DEFAULT"})(Cg||(Cg={}));var pg;(function(r){r.StatusBar="StatusBar",r.NavigationBar="NavigationBar"})(pg||(pg={}));class yF extends Yu{async setStyle(){this.unavailable("not available for web")}async setAnimation(){this.unavailable("not available for web")}async show(){this.unavailable("not available for web")}async hide(){this.unavailable("not available for web")}}$u("SystemBars",{web:()=>new yF});var Zs;(function(r){r.IndexedDbLocal="INDEXED_DB_LOCAL",r.InMemory="IN_MEMORY",r.BrowserLocal="BROWSER_LOCAL",r.BrowserSession="BROWSER_SESSION"})(Zs||(Zs={}));var Cr;(function(r){r.APPLE="apple.com",r.FACEBOOK="facebook.com",r.GAME_CENTER="gc.apple.com",r.GITHUB="github.com",r.GOOGLE="google.com",r.MICROSOFT="microsoft.com",r.PLAY_GAMES="playgames.google.com",r.TWITTER="twitter.com",r.YAHOO="yahoo.com",r.PASSWORD="password",r.PHONE="phone"})(Cr||(Cr={}));const xF=$u("FirebaseAuthentication",{web:()=>ky(()=>Promise.resolve().then(()=>wF),void 0,import.meta.url).then(r=>new r.FirebaseAuthenticationWeb)});class Ee extends Yu{constructor(){super(),this.lastConfirmationResult=new Map;const e=fe();e.onAuthStateChanged(t=>this.handleAuthStateChange(t)),e.onIdTokenChanged(t=>void this.handleIdTokenChange(t))}async applyActionCode(e){const t=fe();return pA(t,e.oobCode)}async createUserWithEmailAndPassword(e){const t=fe(),n=await gA(t,e.email,e.password);return this.createSignInResult(n,null)}async confirmPasswordReset(e){const t=fe();return CA(t,e.oobCode,e.newPassword)}async confirmVerificationCode(e){const{verificationCode:t,verificationId:n}=e,s=this.lastConfirmationResult.get(n);if(!s)throw new Error(Ee.ERROR_CONFIRMATION_RESULT_MISSING);const i=await s.confirm(t);return this.createSignInResult(i,null)}async deleteUser(){const t=fe().currentUser;if(!t)throw new Error(Ee.ERROR_NO_USER_SIGNED_IN);return MA(t)}async fetchSignInMethodsForEmail(e){const t=fe();return{signInMethods:await wA(t,e.email)}}async getPendingAuthResult(){throw this.unimplemented("Not implemented on web.")}async getCurrentUser(){const e=fe();return{user:this.createUserResult(e.currentUser)}}async getIdToken(e){const t=fe();if(!t.currentUser)throw new Error(Ee.ERROR_NO_USER_SIGNED_IN);return{token:await t.currentUser.getIdToken(e==null?void 0:e.forceRefresh)||""}}async getIdTokenResult(e){const t=fe();if(!t.currentUser)throw new Error(Ee.ERROR_NO_USER_SIGNED_IN);const n=await t.currentUser.getIdTokenResult(e==null?void 0:e.forceRefresh);return Object.assign(Object.assign({},n),{authTime:Date.parse(n.authTime),expirationTime:Date.parse(n.expirationTime),issuedAtTime:Date.parse(n.issuedAtTime)})}async getRedirectResult(){const e=fe(),t=await IR(e),n=t?He.credentialFromResult(t):null;return this.createSignInResult(t,n)}async getTenantId(){return{tenantId:fe().tenantId}}async isSignInWithEmailLink(e){const t=fe();return{isSignInWithEmailLink:EA(t,e.emailLink)}}async linkWithApple(e){const t=new He(Cr.APPLE);this.applySignInOptions(e||{},t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e==null?void 0:e.mode),s=He.credentialFromResult(n);return this.createSignInResult(n,s)}async linkWithEmailAndPassword(e){const t=jn.credential(e.email,e.password),n=await this.linkCurrentUserWithCredential(t);return this.createSignInResult(n,t)}async linkWithEmailLink(e){const t=jn.credentialWithLink(e.email,e.emailLink),n=await this.linkCurrentUserWithCredential(t);return this.createSignInResult(n,t)}async linkWithFacebook(e){const t=new $t;this.applySignInOptions(e||{},t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e==null?void 0:e.mode),s=$t.credentialFromResult(n);return this.createSignInResult(n,s)}async linkWithGameCenter(){throw this.unimplemented("Not implemented on web.")}async linkWithGithub(e){const t=new Xt;this.applySignInOptions(e||{},t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e==null?void 0:e.mode),s=Xt.credentialFromResult(n);return this.createSignInResult(n,s)}async linkWithGoogle(e){const t=new Yt;this.applySignInOptions(e||{},t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e==null?void 0:e.mode),s=Yt.credentialFromResult(n);return this.createSignInResult(n,s)}async linkWithMicrosoft(e){const t=new He(Cr.MICROSOFT);this.applySignInOptions(e||{},t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e==null?void 0:e.mode),s=He.credentialFromResult(n);return this.createSignInResult(n,s)}async linkWithOpenIdConnect(e){const t=new He(e.providerId);this.applySignInOptions(e,t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e.mode),s=He.credentialFromResult(n);return this.createSignInResult(n,s)}async linkWithPhoneNumber(e){const n=fe().currentUser;if(!n)throw new Error(Ee.ERROR_NO_USER_SIGNED_IN);if(!e.phoneNumber)throw new Error(Ee.ERROR_PHONE_NUMBER_MISSING);if(!e.recaptchaVerifier||!(e.recaptchaVerifier instanceof BC))throw new Error(Ee.ERROR_RECAPTCHA_VERIFIER_MISSING);try{const s=await oR(n,e.phoneNumber,e.recaptchaVerifier),{verificationId:i}=s;this.lastConfirmationResult.set(i,s);const o={verificationId:i};this.notifyListeners(Ee.PHONE_CODE_SENT_EVENT,o)}catch(s){const i={message:this.getErrorMessage(s)};this.notifyListeners(Ee.PHONE_VERIFICATION_FAILED_EVENT,i)}}async linkWithPlayGames(){throw this.unimplemented("Not implemented on web.")}async linkWithTwitter(e){const t=new Zt;this.applySignInOptions(e||{},t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e==null?void 0:e.mode),s=Zt.credentialFromResult(n);return this.createSignInResult(n,s)}async linkWithYahoo(e){const t=new He(Cr.YAHOO);this.applySignInOptions(e||{},t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e==null?void 0:e.mode),s=He.credentialFromResult(n);return this.createSignInResult(n,s)}async reload(){const t=fe().currentUser;if(!t)throw new Error(Ee.ERROR_NO_USER_SIGNED_IN);return $g(t)}async revokeAccessToken(e){const t=fe();return VA(t,e.token)}async sendEmailVerification(e){const n=fe().currentUser;if(!n)throw new Error(Ee.ERROR_NO_USER_SIGNED_IN);return DA(n,e==null?void 0:e.actionCodeSettings)}async sendPasswordResetEmail(e){const t=fe();return fA(t,e.email,e.actionCodeSettings)}async sendSignInLinkToEmail(e){const t=fe();return _A(t,e.email,e.actionCodeSettings)}async setLanguageCode(e){const t=fe();t.languageCode=e.languageCode}async setPersistence(e){const t=fe();switch(e.persistence){case Zs.BrowserLocal:await rc(t,Em);break;case Zs.BrowserSession:await rc(t,th);break;case Zs.IndexedDbLocal:await rc(t,Am);break;case Zs.InMemory:await rc(t,tB);break}}async setTenantId(e){const t=fe();t.tenantId=e.tenantId}async signInAnonymously(){const e=fe(),t=await uA(e);return this.createSignInResult(t,null)}async signInWithApple(e){const t=new He(Cr.APPLE);this.applySignInOptions(e||{},t);const n=await this.signInWithPopupOrRedirect(t,e==null?void 0:e.mode),s=He.credentialFromResult(n);return this.createSignInResult(n,s)}async signInWithCustomToken(e){const t=fe(),n=await dA(t,e.token);return this.createSignInResult(n,null)}async signInWithEmailAndPassword(e){const t=fe(),n=await mA(t,e.email,e.password);return this.createSignInResult(n,null)}async signInWithEmailLink(e){const t=fe(),n=await IA(t,e.email,e.emailLink);return this.createSignInResult(n,null)}async signInWithFacebook(e){const t=new $t;this.applySignInOptions(e||{},t);const n=await this.signInWithPopupOrRedirect(t,e==null?void 0:e.mode),s=$t.credentialFromResult(n);return this.createSignInResult(n,s)}async signInWithGithub(e){const t=new Xt;this.applySignInOptions(e||{},t);const n=await this.signInWithPopupOrRedirect(t,e==null?void 0:e.mode),s=Xt.credentialFromResult(n);return this.createSignInResult(n,s)}async signInWithGoogle(e){const t=new Yt;this.applySignInOptions(e||{},t);const n=await this.signInWithPopupOrRedirect(t,e==null?void 0:e.mode),s=Yt.credentialFromResult(n);return this.createSignInResult(n,s)}async signInWithMicrosoft(e){const t=new He(Cr.MICROSOFT);this.applySignInOptions(e||{},t);const n=await this.signInWithPopupOrRedirect(t,e==null?void 0:e.mode),s=He.credentialFromResult(n);return this.createSignInResult(n,s)}async signInWithOpenIdConnect(e){const t=new He(e.providerId);this.applySignInOptions(e,t);const n=await this.signInWithPopupOrRedirect(t,e.mode),s=He.credentialFromResult(n);return this.createSignInResult(n,s)}async signInWithPhoneNumber(e){if(!e.phoneNumber)throw new Error(Ee.ERROR_PHONE_NUMBER_MISSING);if(!e.recaptchaVerifier||!(e.recaptchaVerifier instanceof BC))throw new Error(Ee.ERROR_RECAPTCHA_VERIFIER_MISSING);const t=fe();try{const n=await iR(t,e.phoneNumber,e.recaptchaVerifier),{verificationId:s}=n;this.lastConfirmationResult.set(s,n);const i={verificationId:s};this.notifyListeners(Ee.PHONE_CODE_SENT_EVENT,i)}catch(n){const s={message:this.getErrorMessage(n)};this.notifyListeners(Ee.PHONE_VERIFICATION_FAILED_EVENT,s)}}async signInWithPlayGames(){throw this.unimplemented("Not implemented on web.")}async signInWithGameCenter(){throw this.unimplemented("Not implemented on web.")}async signInWithTwitter(e){const t=new Zt;this.applySignInOptions(e||{},t);const n=await this.signInWithPopupOrRedirect(t,e==null?void 0:e.mode),s=Zt.credentialFromResult(n);return this.createSignInResult(n,s)}async signInWithYahoo(e){const t=new He(Cr.YAHOO);this.applySignInOptions(e||{},t);const n=await this.signInWithPopupOrRedirect(t,e==null?void 0:e.mode),s=He.credentialFromResult(n);return this.createSignInResult(n,s)}async signOut(){await fe().signOut()}async unlink(e){const t=fe();if(!t.currentUser)throw new Error(Ee.ERROR_NO_USER_SIGNED_IN);const n=await lA(t.currentUser,e.providerId);return{user:this.createUserResult(n)}}async updateEmail(e){const n=fe().currentUser;if(!n)throw new Error(Ee.ERROR_NO_USER_SIGNED_IN);return vA(n,e.newEmail)}async updatePassword(e){const n=fe().currentUser;if(!n)throw new Error(Ee.ERROR_NO_USER_SIGNED_IN);return PA(n,e.newPassword)}async updateProfile(e){const n=fe().currentUser;if(!n)throw new Error(Ee.ERROR_NO_USER_SIGNED_IN);return RA(n,{displayName:e.displayName,photoURL:e.photoUrl})}async useAppLanguage(){fe().useDeviceLanguage()}async useEmulator(e){const t=fe(),n=e.port||9099,s=e.scheme||"http";e.host.includes("://")?nB(t,`${e.host}:${n}`):nB(t,`${s}://${e.host}:${n}`)}async verifyBeforeUpdateEmail(e){const n=fe().currentUser;if(!n)throw new Error(Ee.ERROR_NO_USER_SIGNED_IN);return TA(n,e==null?void 0:e.newEmail,e==null?void 0:e.actionCodeSettings)}handleAuthStateChange(e){const n={user:this.createUserResult(e)};this.notifyListeners(Ee.AUTH_STATE_CHANGE_EVENT,n,!0)}async handleIdTokenChange(e){if(!e)return;const n={token:await e.getIdToken(!1)};this.notifyListeners(Ee.ID_TOKEN_CHANGE_EVENT,n,!0)}applySignInOptions(e,t){if(e.customParameters){const n={};e.customParameters.map(s=>{n[s.key]=s.value}),t.setCustomParameters(n)}if(e.scopes)for(const n of e.scopes)t.addScope(n)}signInWithPopupOrRedirect(e,t){const n=fe();return t==="redirect"?gR(n,e):BR(n,e)}linkCurrentUserWithPopupOrRedirect(e,t){const n=fe();if(!n.currentUser)throw new Error(Ee.ERROR_NO_USER_SIGNED_IN);return t==="redirect"?_R(n.currentUser,e):hR(n.currentUser,e)}linkCurrentUserWithCredential(e){const t=fe();if(!t.currentUser)throw new Error(Ee.ERROR_NO_USER_SIGNED_IN);return Cm(t.currentUser,e)}requestAppTrackingTransparencyPermission(){throw this.unimplemented("Not implemented on web.")}checkAppTrackingTransparencyPermission(){throw this.unimplemented("Not implemented on web.")}createSignInResult(e,t){const n=this.createUserResult((e==null?void 0:e.user)||null),s=this.createCredentialResult(t),i=this.createAdditionalUserInfoResult(e);return{user:n,credential:s,additionalUserInfo:i}}createCredentialResult(e){if(!e)return null;const t={providerId:e.providerId};return e instanceof wn&&(t.accessToken=e.accessToken,t.idToken=e.idToken,t.secret=e.secret),t}createUserResult(e){return e?{displayName:e.displayName,email:e.email,emailVerified:e.emailVerified,isAnonymous:e.isAnonymous,metadata:this.createUserMetadataResult(e.metadata),phoneNumber:e.phoneNumber,photoUrl:e.photoURL,providerData:this.createUserProviderDataResult(e.providerData),providerId:e.providerId,tenantId:e.tenantId,uid:e.uid}:null}createUserMetadataResult(e){const t={};return e.creationTime&&(t.creationTime=Date.parse(e.creationTime)),e.lastSignInTime&&(t.lastSignInTime=Date.parse(e.lastSignInTime)),t}createUserProviderDataResult(e){return e.map(t=>({displayName:t.displayName,email:t.email,phoneNumber:t.phoneNumber,photoUrl:t.photoURL,providerId:t.providerId,uid:t.uid}))}createAdditionalUserInfoResult(e){if(!e)return null;const t=kA(e);if(!t)return null;const{isNewUser:n,profile:s,providerId:i,username:o}=t,a={isNewUser:n};return i!==null&&(a.providerId=i),s!==null&&(a.profile=s),o!=null&&(a.username=o),a}getErrorMessage(e){return e instanceof Object&&"message"in e&&typeof e.message=="string"?e.message:JSON.stringify(e)}}Ee.AUTH_STATE_CHANGE_EVENT="authStateChange";Ee.ID_TOKEN_CHANGE_EVENT="idTokenChange";Ee.PHONE_CODE_SENT_EVENT="phoneCodeSent";Ee.PHONE_VERIFICATION_FAILED_EVENT="phoneVerificationFailed";Ee.ERROR_NO_USER_SIGNED_IN="No user is signed in.";Ee.ERROR_PHONE_NUMBER_MISSING="phoneNumber must be provided.";Ee.ERROR_RECAPTCHA_VERIFIER_MISSING="recaptchaVerifier must be provided and must be an instance of RecaptchaVerifier.";Ee.ERROR_CONFIRMATION_RESULT_MISSING="No confirmation result with this verification id was found.";const wF=Object.freeze(Object.defineProperty({__proto__:null,FirebaseAuthenticationWeb:Ee},Symbol.toStringTag,{value:"Module"}));export{LF as A,LB as B,xB as C,oF as D,mO as E,xF as F,Yt as G,_O as H,sb as I,hb as J,tF as K,db as L,Cb as M,wO as N,RF as O,PF as P,EF as Q,Ug as R,ye as T,Yu as W,ky as _,HB as a,AF as b,fe as c,rc as d,Em as e,rO as f,TF as g,sO as h,aD as i,$O as j,lE as k,ZB as l,GO as m,BR as n,vF as o,IR as p,MA as q,$u as r,kv as s,YO as t,rb as u,nF as v,eF as w,WO as x,rF as y,zO as z};
