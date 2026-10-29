var eg=Object.defineProperty;var tg=(r,e,t)=>e in r?eg(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var G=(r,e,t)=>tg(r,typeof e!="symbol"?e+"":e,t);const ng="modulepreload",rg=function(r,e){return new URL(r,e).href},al={},sg=function(e,t,n){let s=Promise.resolve();if(t&&t.length>0){let o=function(h){return Promise.all(h.map(C=>Promise.resolve(C).then(p=>({status:"fulfilled",value:p}),p=>({status:"rejected",reason:p}))))};const B=document.getElementsByTagName("link"),c=document.querySelector("meta[property=csp-nonce]"),u=(c==null?void 0:c.nonce)||(c==null?void 0:c.getAttribute("nonce"));s=o(t.map(h=>{if(h=rg(h,n),h in al)return;al[h]=!0;const C=h.endsWith(".css"),p=C?'[rel="stylesheet"]':"";if(!!n)for(let k=B.length-1;k>=0;k--){const M=B[k];if(M.href===h&&(!C||M.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${h}"]${p}`))return;const R=document.createElement("link");if(R.rel=C?"stylesheet":ng,C||(R.as="script"),R.crossOrigin="",R.href=h,u&&R.setAttribute("nonce",u),document.head.appendChild(R),C)return new Promise((k,M)=>{R.addEventListener("load",k),R.addEventListener("error",()=>M(new Error(`Unable to preload CSS for ${h}`)))})}))}function i(o){const B=new Event("vite:preloadError",{cancelable:!0});if(B.payload=o,window.dispatchEvent(B),!B.defaultPrevented)throw o}return s.then(o=>{for(const B of o||[])B.status==="rejected"&&i(B.reason);return e().catch(i)})},ig=()=>{};var Bl={};/**
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
 */const df=function(r){const e=[];let t=0;for(let n=0;n<r.length;n++){let s=r.charCodeAt(n);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&n+1<r.length&&(r.charCodeAt(n+1)&64512)===56320?(s=65536+((s&1023)<<10)+(r.charCodeAt(++n)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},og=function(r){const e=[];let t=0,n=0;for(;t<r.length;){const s=r[t++];if(s<128)e[n++]=String.fromCharCode(s);else if(s>191&&s<224){const i=r[t++];e[n++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=r[t++],o=r[t++],B=r[t++],c=((s&7)<<18|(i&63)<<12|(o&63)<<6|B&63)-65536;e[n++]=String.fromCharCode(55296+(c>>10)),e[n++]=String.fromCharCode(56320+(c&1023))}else{const i=r[t++],o=r[t++];e[n++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},pf={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(r,e){if(!Array.isArray(r))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let s=0;s<r.length;s+=3){const i=r[s],o=s+1<r.length,B=o?r[s+1]:0,c=s+2<r.length,u=c?r[s+2]:0,h=i>>2,C=(i&3)<<4|B>>4;let p=(B&15)<<2|u>>6,I=u&63;c||(I=64,o||(p=64)),n.push(t[h],t[C],t[p],t[I])}return n.join("")},encodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(r):this.encodeByteArray(df(r),e)},decodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(r):og(this.decodeStringToByteArray(r,e))},decodeStringToByteArray(r,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let s=0;s<r.length;){const i=t[r.charAt(s++)],B=s<r.length?t[r.charAt(s)]:0;++s;const u=s<r.length?t[r.charAt(s)]:64;++s;const C=s<r.length?t[r.charAt(s)]:64;if(++s,i==null||B==null||u==null||C==null)throw new ag;const p=i<<2|B>>4;if(n.push(p),u!==64){const I=B<<4&240|u>>2;if(n.push(I),C!==64){const R=u<<6&192|C;n.push(R)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let r=0;r<this.ENCODED_VALS.length;r++)this.byteToCharMap_[r]=this.ENCODED_VALS.charAt(r),this.charToByteMap_[this.byteToCharMap_[r]]=r,this.byteToCharMapWebSafe_[r]=this.ENCODED_VALS_WEBSAFE.charAt(r),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[r]]=r,r>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(r)]=r,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(r)]=r)}}};class ag extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Bg=function(r){const e=df(r);return pf.encodeByteArray(e,!0)},Do=function(r){return Bg(r).replace(/\./g,"")},gf=function(r){try{return pf.decodeString(r,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function cg(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const ug=()=>cg().__FIREBASE_DEFAULTS__,lg=()=>{if(typeof process>"u"||typeof Bl>"u")return;const r=Bl.__FIREBASE_DEFAULTS__;if(r)return JSON.parse(r)},hg=()=>{if(typeof document>"u")return;let r;try{r=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=r&&gf(r[1]);return e&&JSON.parse(e)},Jo=()=>{try{return ig()||ug()||lg()||hg()}catch(r){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${r}`);return}},mf=r=>{var e,t;return(t=(e=Jo())==null?void 0:e.emulatorHosts)==null?void 0:t[r]},fg=r=>{const e=mf(r);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const n=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),n]:[e.substring(0,t),n]},Ef=()=>{var r;return(r=Jo())==null?void 0:r.config},_f=r=>{var e;return(e=Jo())==null?void 0:e[`_${r}`]};/**
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
 */class Df{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,n)=>{t?this.reject(t):this.resolve(n),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,n))}}}/**
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
 */function Cg(r,e){if(r.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},n=e||"demo-project",s=r.iat||0,i=r.sub||r.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${n}`,aud:n,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}},...r};return[Do(JSON.stringify(t)),Do(JSON.stringify(o)),""].join(".")}/**
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
 */function it(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function dg(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(it())}function pg(){var e;const r=(e=Jo())==null?void 0:e.forceEnvironment;if(r==="node")return!0;if(r==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function gg(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function mg(){const r=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof r=="object"&&r.id!==void 0}function Eg(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function _g(){const r=it();return r.indexOf("MSIE ")>=0||r.indexOf("Trident/")>=0}function Dg(){return!pg()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Ig(){try{return typeof indexedDB=="object"}catch{return!1}}function wg(){return new Promise((r,e)=>{try{let t=!0;const n="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(n);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(n),r(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)==null?void 0:i.message)||"")}}catch(t){e(t)}})}/**
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
 */const yg="FirebaseError";class gn extends Error{constructor(e,t,n){super(t),this.code=e,this.customData=n,this.name=yg,Object.setPrototypeOf(this,gn.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,mi.prototype.create)}}class mi{constructor(e,t,n){this.service=e,this.serviceName=t,this.errors=n}create(e,...t){const n=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?Tg(i,n):"Error",B=`${this.serviceName}: ${o} (${s}).`;return new gn(s,B,n)}}function Tg(r,e){try{let t=0,n="";for(;t<r.length;){const s=r.indexOf("{$",t);if(s===-1){n+=r.substring(t);break}const i=r.indexOf("}",s+2);if(i===-1){n+=r.substring(t);break}const o=r.substring(s+2,i),B=e[o];n+=r.substring(t,s)+(B!=null?String(B):`<${o}?>`),t=i+1}return n}catch{return r}}function Ag(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}function Un(r,e){if(r===e)return!0;const t=Object.keys(r),n=Object.keys(e);for(const s of t){if(!n.includes(s))return!1;const i=r[s],o=e[s];if(cl(i)&&cl(o)){if(!Un(i,o))return!1}else if(i!==o)return!1}for(const s of n)if(!t.includes(s))return!1;return!0}function cl(r){return r!==null&&typeof r=="object"}/**
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
 */function $r(r){const e=[];for(const[t,n]of Object.entries(r))Array.isArray(n)?n.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(n));return e.length?"&"+e.join("&"):""}function Ps(r){const e={};return r.replace(/^\?/,"").split("&").forEach(n=>{if(n){const[s,i]=n.split("=");e[decodeURIComponent(s)]=decodeURIComponent(i)}}),e}function Ss(r){const e=r.indexOf("?");if(!e)return"";const t=r.indexOf("#",e);return r.substring(e,t>0?t:void 0)}function Rg(r,e){const t=new vg(r,e);return t.subscribe.bind(t)}class vg{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(n=>{this.error(n)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,n){let s;if(e===void 0&&t===void 0&&n===void 0)throw new Error("Missing Observer.");Pg(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:n},s.next===void 0&&(s.next=Za),s.error===void 0&&(s.error=Za),s.complete===void 0&&(s.complete=Za);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(n){typeof console<"u"&&console.error&&console.error(n)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Pg(r,e){if(typeof r!="object"||r===null)return!1;for(const t of e)if(t in r&&typeof r[t]=="function")return!0;return!1}function Za(){}/**
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
 */function Yr(r){try{return(r.startsWith("http://")||r.startsWith("https://")?new URL(r).hostname:r).endsWith(".cloudworkstations.dev")}catch{return!1}}async function zB(r){return(await fetch(r,{credentials:"include"})).ok}class dr{constructor(e,t,n){this.name=e,this.instanceFactory=t,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const or="[DEFAULT]";/**
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
 */class Sg{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const n=new Df;if(this.instancesDeferred.set(t,n),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&n.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),n=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(s){if(n)return null;throw s}else{if(n)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Ng(e))try{this.getOrInitializeService({instanceIdentifier:or})}catch{}for(const[t,n]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});n.resolve(i)}catch{}}}}clearInstance(e=or){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=or){return this.instances.has(e)}getOptions(e=or){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:n,options:t});for(const[i,o]of this.instancesDeferred.entries()){const B=this.normalizeInstanceIdentifier(i);n===B&&o.resolve(s)}return s}onInit(e,t){const n=this.normalizeInstanceIdentifier(t),s=this.onInitCallbacks.get(n)??new Set;s.add(e),this.onInitCallbacks.set(n,s);const i=this.instances.get(n);return i&&e(i,n),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const n=this.onInitCallbacks.get(t);if(n)for(const s of n)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:Og(e),options:t}),this.instances.set(e,n),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch{}return n||null}normalizeInstanceIdentifier(e=or){return this.component?this.component.multipleInstances?e:or:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Og(r){return r===or?void 0:r}function Ng(r){return r.instantiationMode==="EAGER"}/**
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
 */class bg{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Sg(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var ce;(function(r){r[r.DEBUG=0]="DEBUG",r[r.VERBOSE=1]="VERBOSE",r[r.INFO=2]="INFO",r[r.WARN=3]="WARN",r[r.ERROR=4]="ERROR",r[r.SILENT=5]="SILENT"})(ce||(ce={}));const Lg={debug:ce.DEBUG,verbose:ce.VERBOSE,info:ce.INFO,warn:ce.WARN,error:ce.ERROR,silent:ce.SILENT},Fg=ce.INFO,kg={[ce.DEBUG]:"log",[ce.VERBOSE]:"log",[ce.INFO]:"info",[ce.WARN]:"warn",[ce.ERROR]:"error"},Vg=(r,e,...t)=>{if(e<r.logLevel)return;const n=new Date().toISOString(),s=kg[e];if(s)console[s](`[${n}]  ${r.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class QB{constructor(e){this.name=e,this._logLevel=Fg,this._logHandler=Vg,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in ce))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Lg[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,ce.DEBUG,...e),this._logHandler(this,ce.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,ce.VERBOSE,...e),this._logHandler(this,ce.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,ce.INFO,...e),this._logHandler(this,ce.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,ce.WARN,...e),this._logHandler(this,ce.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,ce.ERROR,...e),this._logHandler(this,ce.ERROR,...e)}}const xg=(r,e)=>e.some(t=>r instanceof t);let ul,ll;function Mg(){return ul||(ul=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Gg(){return ll||(ll=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const If=new WeakMap,EB=new WeakMap,wf=new WeakMap,eB=new WeakMap,$B=new WeakMap;function Ug(r){const e=new Promise((t,n)=>{const s=()=>{r.removeEventListener("success",i),r.removeEventListener("error",o)},i=()=>{t(bn(r.result)),s()},o=()=>{n(r.error),s()};r.addEventListener("success",i),r.addEventListener("error",o)});return e.then(t=>{t instanceof IDBCursor&&If.set(t,r)}).catch(()=>{}),$B.set(e,r),e}function Hg(r){if(EB.has(r))return;const e=new Promise((t,n)=>{const s=()=>{r.removeEventListener("complete",i),r.removeEventListener("error",o),r.removeEventListener("abort",o)},i=()=>{t(),s()},o=()=>{n(r.error||new DOMException("AbortError","AbortError")),s()};r.addEventListener("complete",i),r.addEventListener("error",o),r.addEventListener("abort",o)});EB.set(r,e)}let _B={get(r,e,t){if(r instanceof IDBTransaction){if(e==="done")return EB.get(r);if(e==="objectStoreNames")return r.objectStoreNames||wf.get(r);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return bn(r[e])},set(r,e,t){return r[e]=t,!0},has(r,e){return r instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in r}};function Jg(r){_B=r(_B)}function jg(r){return r===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const n=r.call(tB(this),e,...t);return wf.set(n,e.sort?e.sort():[e]),bn(n)}:Gg().includes(r)?function(...e){return r.apply(tB(this),e),bn(If.get(this))}:function(...e){return bn(r.apply(tB(this),e))}}function qg(r){return typeof r=="function"?jg(r):(r instanceof IDBTransaction&&Hg(r),xg(r,Mg())?new Proxy(r,_B):r)}function bn(r){if(r instanceof IDBRequest)return Ug(r);if(eB.has(r))return eB.get(r);const e=qg(r);return e!==r&&(eB.set(r,e),$B.set(e,r)),e}const tB=r=>$B.get(r);function Kg(r,e,{blocked:t,upgrade:n,blocking:s,terminated:i}={}){const o=indexedDB.open(r,e),B=bn(o);return n&&o.addEventListener("upgradeneeded",c=>{n(bn(o.result),c.oldVersion,c.newVersion,bn(o.transaction),c)}),t&&o.addEventListener("blocked",c=>t(c.oldVersion,c.newVersion,c)),B.then(c=>{i&&c.addEventListener("close",()=>i()),s&&c.addEventListener("versionchange",u=>s(u.oldVersion,u.newVersion,u))}).catch(()=>{}),B}const Wg=["get","getKey","getAll","getAllKeys","count"],zg=["put","add","delete","clear"],nB=new Map;function hl(r,e){if(!(r instanceof IDBDatabase&&!(e in r)&&typeof e=="string"))return;if(nB.get(e))return nB.get(e);const t=e.replace(/FromIndex$/,""),n=e!==t,s=zg.includes(t);if(!(t in(n?IDBIndex:IDBObjectStore).prototype)||!(s||Wg.includes(t)))return;const i=async function(o,...B){const c=this.transaction(o,s?"readwrite":"readonly");let u=c.store;return n&&(u=u.index(B.shift())),(await Promise.all([u[t](...B),s&&c.done]))[0]};return nB.set(e,i),i}Jg(r=>({...r,get:(e,t,n)=>hl(e,t)||r.get(e,t,n),has:(e,t)=>!!hl(e,t)||r.has(e,t)}));/**
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
 */class Qg{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if($g(t)){const n=t.getImmediate();return`${n.library}/${n.version}`}else return null}).filter(t=>t).join(" ")}}function $g(r){const e=r.getComponent();return(e==null?void 0:e.type)==="VERSION"}const DB="@firebase/app",fl="0.16.1";/**
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
 */const hn=new QB("@firebase/app"),Yg="@firebase/app-compat",Xg="@firebase/analytics-compat",Zg="@firebase/analytics",em="@firebase/app-check-compat",tm="@firebase/app-check",nm="@firebase/auth",rm="@firebase/auth-compat",sm="@firebase/database",im="@firebase/data-connect",om="@firebase/database-compat",am="@firebase/functions",Bm="@firebase/functions-compat",cm="@firebase/installations",um="@firebase/installations-compat",lm="@firebase/messaging",hm="@firebase/messaging-compat",fm="@firebase/performance",Cm="@firebase/performance-compat",dm="@firebase/remote-config",pm="@firebase/remote-config-compat",gm="@firebase/storage",mm="@firebase/storage-compat",Em="@firebase/firestore",_m="@firebase/ai",Dm="@firebase/firestore-compat",Im="firebase",wm="12.18.0";/**
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
 */const IB="[DEFAULT]",ym={[DB]:"fire-core",[Yg]:"fire-core-compat",[Zg]:"fire-analytics",[Xg]:"fire-analytics-compat",[tm]:"fire-app-check",[em]:"fire-app-check-compat",[nm]:"fire-auth",[rm]:"fire-auth-compat",[sm]:"fire-rtdb",[im]:"fire-data-connect",[om]:"fire-rtdb-compat",[am]:"fire-fn",[Bm]:"fire-fn-compat",[cm]:"fire-iid",[um]:"fire-iid-compat",[lm]:"fire-fcm",[hm]:"fire-fcm-compat",[fm]:"fire-perf",[Cm]:"fire-perf-compat",[dm]:"fire-rc",[pm]:"fire-rc-compat",[gm]:"fire-gcs",[mm]:"fire-gcs-compat",[Em]:"fire-fst",[Dm]:"fire-fst-compat",[_m]:"fire-vertex","fire-js":"fire-js",[Im]:"fire-js-all"};/**
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
 */const Qs=new Map,Tm=new Map,wB=new Map;function Cl(r,e){try{r.container.addComponent(e)}catch(t){hn.debug(`Component ${e.name} failed to register with FirebaseApp ${r.name}`,t)}}function Hr(r){const e=r.name;if(wB.has(e))return hn.debug(`There were multiple attempts to register component ${e}.`),!1;wB.set(e,r);for(const t of Qs.values())Cl(t,r);for(const t of Tm.values())Cl(t,r);return!0}function jo(r,e){const t=r.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),r.container.getProvider(e)}function Je(r){return r==null?!1:r.settings!==void 0}/**
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
 */const Am={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},on=new mi("app","Firebase",Am);/**
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
 */class Rm{constructor(e,t,n){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new dr("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw on.create("app-deleted",{appName:this._name})}}/**
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
 */const Xr=wm;function vm(r,e={}){let t=r;typeof e!="object"&&(e={name:e});const n={name:IB,automaticDataCollectionEnabled:!0,...e},s=n.name;if(typeof s!="string"||!s)throw on.create("bad-app-name",{appName:String(s)});if(t||(t=Ef()),!t)throw on.create("no-options");const i=Qs.get(s);if(i)if(Un(t,i.options)){if(Un(n,i.config))return i;throw on.create("duplicate-app",{appName:s,mismatchedParam:"config",oldValue:JSON.stringify(i.config),newValue:JSON.stringify(n)})}else throw on.create("duplicate-app",{appName:s,mismatchedParam:"options",oldValue:JSON.stringify(i.options),newValue:JSON.stringify(t)});const o=new bg(s);for(const c of wB.values())o.addComponent(c);const B=new Rm(t,n,o);return Qs.set(s,B),B}function yf(r=IB){const e=Qs.get(r);if(!e&&r===IB&&Ef())return vm();if(!e)throw on.create("no-app",{appName:r});return e}function RR(){return Array.from(Qs.values())}function Ln(r,e,t){let n=ym[r]??r;t&&(n+=`-${t}`);const s=n.match(/\s|\//),i=e.match(/\s|\//);if(s||i){const o=[`Unable to register library "${n}" with version "${e}":`];s&&o.push(`library name "${n}" contains illegal characters (whitespace or "/")`),s&&i&&o.push("and"),i&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),hn.warn(o.join(" "));return}Hr(new dr(`${n}-version`,()=>({library:n,version:e}),"VERSION"))}/**
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
 */const Pm="firebase-heartbeat-database",Sm=1,$s="firebase-heartbeat-store";let rB=null;function Tf(){return rB||(rB=Kg(Pm,Sm,{upgrade:(r,e)=>{switch(e){case 0:try{r.createObjectStore($s)}catch(t){console.warn(t)}}}}).catch(r=>{throw on.create("idb-open",{originalErrorMessage:r.message})})),rB}async function Om(r){try{const t=(await Tf()).transaction($s),n=await t.objectStore($s).get(Af(r));return await t.done,n}catch(e){if(e instanceof gn)hn.warn(e.message);else{const t=on.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});hn.warn(t.message)}}}async function dl(r,e){try{const n=(await Tf()).transaction($s,"readwrite");await n.objectStore($s).put(e,Af(r)),await n.done}catch(t){if(t instanceof gn)hn.warn(t.message);else{const n=on.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});hn.warn(n.message)}}}function Af(r){return`${r.name}!${r.options.appId}`}/**
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
 */const Nm=1024,bm=30;class Lm{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new km(t),this._heartbeatsCachePromise=this._storage.read().then(n=>(this._heartbeatsCache=n,n))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=pl();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats.length>bm){const o=Vm(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(n){hn.warn(n)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=pl(),{heartbeatsToSend:n,unsentEntries:s}=Fm(this._heartbeatsCache.heartbeats),i=Do(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return hn.warn(t),""}}}function pl(){return new Date().toISOString().substring(0,10)}function Fm(r,e=Nm){const t=[];let n=r.slice();for(const s of r){const i=t.find(o=>o.agent===s.agent);if(i){if(i.dates.push(s.date),gl(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),gl(t)>e){t.pop();break}n=n.slice(1)}return{heartbeatsToSend:t,unsentEntries:n}}class km{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Ig()?wg().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Om(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return dl(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return dl(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:[...n.heartbeats,...e.heartbeats]})}else return}}function gl(r){return Do(JSON.stringify({version:2,heartbeats:r})).length}function Vm(r){if(r.length===0)return-1;let e=0,t=r[0].date;for(let n=1;n<r.length;n++)r[n].date<t&&(t=r[n].date,e=n);return e}/**
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
 */function xm(r){Hr(new dr("platform-logger",e=>new Qg(e),"PRIVATE")),Hr(new dr("heartbeat",e=>new Lm(e),"PRIVATE")),Ln(DB,fl,r),Ln(DB,fl,"esm2020"),Ln("fire-js","")}/**
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
 */xm("");var Mm="firebase",Gm="12.18.0";/**
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
 */Ln(Mm,Gm,"app");function Rf(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Um=Rf,vf=new mi("auth","Firebase",Rf());/**
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
 */const Io=new QB("@firebase/auth");function Pf(r,...e){Io.logLevel<=ce.WARN&&Io.warn(`Auth (${Xr}): ${r}`,...e)}function co(r,...e){Io.logLevel<=ce.ERROR&&Io.error(`Auth (${Xr}): ${r}`,...e)}/**
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
 */function Vt(r,...e){throw XB(r,...e)}function gt(r,...e){return XB(r,...e)}function YB(r,e,t){const n={...Um(),[e]:t};return new mi("auth","Firebase",n).create(e,{appName:r.name})}function lt(r){return YB(r,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function qo(r,e,t){const n=t;if(!(e instanceof n))throw n.name!==e.constructor.name&&Vt(r,"argument-error"),YB(r,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function XB(r,...e){if(typeof r!="string"){const t=e[0],n=[...e.slice(1)];return n[0]&&(n[0].appName=r.name),r._errorFactory.create(t,...n)}return vf.create(r,...e)}function q(r,e,...t){if(!r)throw XB(e,...t)}function an(r){const e="INTERNAL ASSERTION FAILED: "+r;throw co(e),new Error(e)}function fn(r,e){r||an(e)}/**
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
 */function Ys(){var r;return typeof self<"u"&&((r=self.location)==null?void 0:r.href)||""}function ZB(){return ml()==="http:"||ml()==="https:"}function ml(){var r;return typeof self<"u"&&((r=self.location)==null?void 0:r.protocol)||null}/**
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
 */function Hm(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(ZB()||mg()||"connection"in navigator)?navigator.onLine:!0}function Jm(){if(typeof navigator>"u")return null;const r=navigator;return r.languages&&r.languages[0]||r.language||null}/**
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
 */class Ei{constructor(e,t){this.shortDelay=e,this.longDelay=t,fn(t>e,"Short delay should be less than long delay!"),this.isMobile=dg()||Eg()}get(){return Hm()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function ec(r,e){fn(r.emulator,"Emulator should always be set here");const{url:t}=r.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
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
 */class Sf{static initialize(e,t,n){this.fetchImpl=e,t&&(this.headersImpl=t),n&&(this.responseImpl=n)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;an("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;an("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;an("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const jm={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const qm=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],Km=new Ei(3e4,6e4);function qe(r,e){return r.tenantId&&!e.tenantId?{...e,tenantId:r.tenantId}:e}async function Ke(r,e,t,n,s={}){return Of(r,s,async()=>{let i={},o={};n&&(e==="GET"?o=n:i={body:JSON.stringify(n)});const B=$r({...o,key:r.config.apiKey}).slice(1),c=await r._getAdditionalHeaders();c["Content-Type"]="application/json",r.languageCode&&(c["X-Firebase-Locale"]=r.languageCode);const u={method:e,headers:c,...i};return gg()||(u.referrerPolicy="strict-origin-when-cross-origin"),r.emulatorConfig&&Yr(r.emulatorConfig.host)&&(u.credentials="include"),Sf.fetch()(await Nf(r,r.config.apiHost,t,B),u)})}async function Of(r,e,t){r._canInitEmulator=!1;const n={...jm,...e};try{const s=new zm(r),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw Os(r,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const B=i.ok?o.errorMessage:o.error.message,[c,u]=B.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw Os(r,"credential-already-in-use",o);if(c==="EMAIL_EXISTS")throw Os(r,"email-already-in-use",o);if(c==="USER_DISABLED")throw Os(r,"user-disabled",o);const h=n[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(u)throw YB(r,h,u);Vt(r,h)}}catch(s){if(s instanceof gn)throw s;Vt(r,"network-request-failed",{message:String(s)})}}async function mn(r,e,t,n,s={}){const i=await Ke(r,e,t,n,s);return"mfaPendingCredential"in i&&Vt(r,"multi-factor-auth-required",{_serverResponse:i}),i}async function Nf(r,e,t,n){const s=`${e}${t}?${n}`,i=r,o=i.config.emulator?ec(r.config,s):`${r.config.apiScheme}://${s}`;return qm.includes(t)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(o).toString():o}function Wm(r){switch(r){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class zm{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,n)=>{this.timer=setTimeout(()=>n(gt(this.auth,"network-request-failed")),Km.get())})}}function Os(r,e,t){const n={appName:r.name};t.email&&(n.email=t.email),t.phoneNumber&&(n.phoneNumber=t.phoneNumber);const s=gt(r,e,n);return s.customData._tokenResponse=t,s}/**
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
 */function El(r){return r!==void 0&&r.getResponse!==void 0}function _l(r){return r!==void 0&&r.enterprise!==void 0}class bf{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return Wm(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}/**
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
 */async function Qm(r){return(await Ke(r,"GET","/v1/recaptchaParams")).recaptchaSiteKey||""}async function Lf(r,e){return Ke(r,"GET","/v2/recaptchaConfig",qe(r,e))}/**
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
 */async function $m(r,e){return Ke(r,"POST","/v1/accounts:delete",e)}async function Ym(r,e){return Ke(r,"POST","/v1/accounts:update",e)}async function wo(r,e){return Ke(r,"POST","/v1/accounts:lookup",e)}/**
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
 */function ks(r){if(r)try{const e=new Date(Number(r));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Xm(r,e=!1){const t=oe(r),n=await t.getIdToken(e),s=Ko(n);q(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:s,token:n,authTime:ks(sB(s.auth_time)),issuedAtTime:ks(sB(s.iat)),expirationTime:ks(sB(s.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function sB(r){return Number(r)*1e3}function Ko(r){const[e,t,n]=r.split(".");if(e===void 0||t===void 0||n===void 0)return co("JWT malformed, contained fewer than 3 sections"),null;try{const s=gf(t);return s?JSON.parse(s):(co("Failed to decode base64 JWT payload"),null)}catch(s){return co("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function Dl(r){const e=Ko(r);return q(e,"internal-error"),q(typeof e.exp<"u","internal-error"),q(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function pr(r,e,t=!1){if(t)return e;try{return await e}catch(n){throw n instanceof gn&&Zm(n)&&r.auth.currentUser===r&&await r.auth.signOut(),n}}function Zm({code:r}){return r==="auth/user-disabled"||r==="auth/user-token-expired"}/**
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
 */class eE{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const n=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,n)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class yB{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=ks(this.lastLoginAt),this.creationTime=ks(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function Xs(r){var C;const e=r.auth,t=await r.getIdToken(),n=await pr(r,wo(e,{idToken:t}));q(n==null?void 0:n.users.length,e,"internal-error");const s=n.users[0];r._notifyReloadListener(s);const i=(C=s.providerUserInfo)!=null&&C.length?kf(s.providerUserInfo):[],o=tE(r.providerData,i),B=r.isAnonymous,c=!(r.email&&s.passwordHash)&&!(o!=null&&o.length),u=B?c:!1,h={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:o,metadata:new yB(s.createdAt,s.lastLoginAt),isAnonymous:u};Object.assign(r,h)}async function Ff(r){const e=oe(r);await Xs(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function tE(r,e){return[...r.filter(n=>!e.some(s=>s.providerId===n.providerId)),...e]}function kf(r){return r.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
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
 */async function nE(r,e){const t=await Of(r,{},async()=>{const n=$r({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=r.config,o=await Nf(r,s,"/v1/token",`key=${i}`),B=await r._getAdditionalHeaders();B["Content-Type"]="application/x-www-form-urlencoded";const c={method:"POST",headers:B,body:n};return r.emulatorConfig&&Yr(r.emulatorConfig.host)&&(c.credentials="include"),Sf.fetch()(o,c)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function rE(r,e){return Ke(r,"POST","/v2/accounts:revokeToken",qe(r,e))}/**
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
 */class Vr{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){q(e.idToken,"internal-error"),q(typeof e.idToken<"u","internal-error"),q(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Dl(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){q(e.length!==0,"internal-error");const t=Dl(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(q(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:n,refreshToken:s,expiresIn:i}=await nE(e,t);this.updateTokensAndExpiration(n,s,Number(i))}updateTokensAndExpiration(e,t,n){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+n*1e3}static fromJSON(e,t){const{refreshToken:n,accessToken:s,expirationTime:i}=t,o=new Vr;return n&&(q(typeof n=="string","internal-error",{appName:e}),o.refreshToken=n),s&&(q(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),i&&(q(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Vr,this.toJSON())}_performRefresh(){return an("not implemented")}}/**
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
 */function Tn(r,e){q(typeof r=="string"||typeof r>"u","internal-error",{appName:e})}class Mt{constructor({uid:e,auth:t,stsTokenManager:n,...s}){this.providerId="firebase",this.proactiveRefresh=new eE(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=n,this.accessToken=n.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new yB(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await pr(this,this.stsTokenManager.getToken(this.auth,e));return q(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return Xm(this,e)}reload(){return Ff(this)}_assign(e){this!==e&&(q(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Mt({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){q(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let n=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),n=!0),t&&await Xs(this),await this.auth._persistUserIfCurrent(this),n&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Je(this.auth.app))return Promise.reject(lt(this.auth));const e=await this.getIdToken();return await pr(this,$m(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const n=t.displayName??void 0,s=t.email??void 0,i=t.phoneNumber??void 0,o=t.photoURL??void 0,B=t.tenantId??void 0,c=t._redirectEventId??void 0,u=t.createdAt??void 0,h=t.lastLoginAt??void 0,{uid:C,emailVerified:p,isAnonymous:I,providerData:R,stsTokenManager:k}=t;q(C&&k,e,"internal-error");const M=Vr.fromJSON(this.name,k);q(typeof C=="string",e,"internal-error"),Tn(n,e.name),Tn(s,e.name),q(typeof p=="boolean",e,"internal-error"),q(typeof I=="boolean",e,"internal-error"),Tn(i,e.name),Tn(o,e.name),Tn(B,e.name),Tn(c,e.name),Tn(u,e.name),Tn(h,e.name);const z=new Mt({uid:C,auth:e,email:s,emailVerified:p,displayName:n,isAnonymous:I,photoURL:o,phoneNumber:i,tenantId:B,stsTokenManager:M,createdAt:u,lastLoginAt:h});return R&&Array.isArray(R)&&(z.providerData=R.map(re=>({...re}))),c&&(z._redirectEventId=c),z}static async _fromIdTokenResponse(e,t,n=!1){const s=new Vr;s.updateFromServerResponse(t);const i=new Mt({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:n});return await Xs(i),i}static async _fromGetAccountInfoResponse(e,t,n){const s=t.users[0];q(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?kf(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),B=new Vr;B.updateFromIdToken(n);const c=new Mt({uid:s.localId,auth:e,stsTokenManager:B,isAnonymous:o}),u={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new yB(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(c,u),c}}/**
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
 */const Il=new Map;function Bn(r){fn(r instanceof Function,"Expected a class definition");let e=Il.get(r);return e?(fn(e instanceof r,"Instance stored in cache mismatched with class"),e):(e=new r,Il.set(r,e),e)}/**
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
 */class Vf{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Vf.type="NONE";const TB=Vf;/**
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
 */function uo(r,e,t){return`firebase:${r}:${e}:${t}`}class xr{constructor(e,t,n){this.persistence=e,this.auth=t,this.userKey=n;const{config:s,name:i}=this.auth;this.fullUserKey=uo(this.userKey,s.apiKey,i),this.fullPersistenceKey=uo("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await wo(this.auth,{idToken:e}).catch(()=>{});return t?Mt._fromGetAccountInfoResponse(this.auth,t,e):null}return Mt._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,n="authUser"){if(!t.length)return new xr(Bn(TB),e,n);const s=(await Promise.all(t.map(async u=>{if(await u._isAvailable())return u}))).filter(u=>u);let i=s[0]||Bn(TB);const o=uo(n,e.config.apiKey,e.name);let B=null;for(const u of t)try{const h=await u._get(o);if(h){let C;if(typeof h=="string"){const p=await wo(e,{idToken:h}).catch(()=>{});if(!p)break;C=await Mt._fromGetAccountInfoResponse(e,p,h)}else C=Mt._fromJSON(e,h);u!==i&&(B=C),i=u;break}}catch{}const c=s.filter(u=>u._shouldAllowMigration);return!i._shouldAllowMigration||!c.length?new xr(i,e,n):(i=c[0],B&&await i._set(o,B.toJSON()),await Promise.all(t.map(async u=>{if(u!==i)try{await u._remove(o)}catch{}})),new xr(i,e,n))}}/**
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
 */function wl(r){const e=r.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Uf(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(xf(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Jf(e))return"Blackberry";if(jf(e))return"Webos";if(Mf(e))return"Safari";if((e.includes("chrome/")||Gf(e))&&!e.includes("edge/"))return"Chrome";if(Hf(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,n=r.match(t);if((n==null?void 0:n.length)===2)return n[1]}return"Other"}function xf(r=it()){return/firefox\//i.test(r)}function Mf(r=it()){const e=r.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Gf(r=it()){return/crios\//i.test(r)}function Uf(r=it()){return/iemobile/i.test(r)}function Hf(r=it()){return/android/i.test(r)}function Jf(r=it()){return/blackberry/i.test(r)}function jf(r=it()){return/webos/i.test(r)}function tc(r=it()){return/iphone|ipad|ipod/i.test(r)||/macintosh/i.test(r)&&/mobile/i.test(r)}function sE(r=it()){var e;return tc(r)&&!!((e=window.navigator)!=null&&e.standalone)}function iE(){return _g()&&document.documentMode===10}function qf(r=it()){return tc(r)||Hf(r)||jf(r)||Jf(r)||/windows phone/i.test(r)||Uf(r)}/**
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
 */function Kf(r,e=[]){let t;switch(r){case"Browser":t=wl(it());break;case"Worker":t=`${wl(it())}-${r}`;break;default:t=r}const n=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${Xr}/${n}`}/**
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
 */class oE{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const n=i=>new Promise((o,B)=>{try{const c=e(i);o(c)}catch(c){B(c)}});n.onAbort=t,this.queue.push(n);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const n of this.queue)await n(e),n.onAbort&&t.push(n.onAbort)}catch(n){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:n==null?void 0:n.message})}}}/**
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
 */async function aE(r,e={}){return Ke(r,"GET","/v2/passwordPolicy",qe(r,e))}/**
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
 */const BE=6;class cE{constructor(e){var n;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??BE,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((n=e.allowedNonAlphanumericCharacters)==null?void 0:n.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const n=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;n&&(t.meetsMinPasswordLength=e.length>=n),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let n;for(let s=0;s<e.length;s++)n=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,n>="a"&&n<="z",n>="A"&&n<="Z",n>="0"&&n<="9",this.allowedNonAlphanumericCharacters.includes(n))}updatePasswordCharacterOptionsStatuses(e,t,n,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=n)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
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
 */class uE{constructor(e,t,n,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=n,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new yl(this),this.idTokenSubscription=new yl(this),this.beforeStateQueue=new oE(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=vf,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=Bn(t)),this._initializationPromise=this.queue(async()=>{var n,s,i;if(!this._deleted&&(this.persistenceManager=await xr.create(this,e),(n=this._resolvePersistenceManagerAvailable)==null||n.call(this),!this._deleted)){if((s=this._popupRedirectResolver)!=null&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((i=this.currentUser)==null?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await wo(this,{idToken:e}),n=await Mt._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(n)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var i;if(Je(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(B=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(B,B))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let n=t,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(i=this.redirectUser)==null?void 0:i._redirectEventId,B=n==null?void 0:n._redirectEventId,c=await this.tryRedirectSignIn(e);(!o||o===B)&&(c!=null&&c.user)&&(n=c.user,s=!0)}if(!n)return this.directlySetCurrentUser(null);if(!n._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(n)}catch(o){n=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return n?this.reloadAndSetCurrentUserOrClear(n):this.directlySetCurrentUser(null)}return q(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===n._redirectEventId?this.directlySetCurrentUser(n):this.reloadAndSetCurrentUserOrClear(n)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await Xs(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Jm()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Je(this.app))return Promise.reject(lt(this));const t=e?oe(e):null;return t&&q(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&q(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Je(this.app)?Promise.reject(lt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Je(this.app)?Promise.reject(lt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Bn(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await aE(this),t=new cE(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new mi("auth","Firebase",e())}onAuthStateChanged(e,t,n){return this.registerStateListener(this.authStateSubscription,e,t,n)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,n){return this.registerStateListener(this.idTokenSubscription,e,t,n)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const n=this.onAuthStateChanged(()=>{n(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),n={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(n.tenantId=this.tenantId),await rE(this,n)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const n=await this.getOrInitRedirectPersistenceManager(t);return e===null?n.removeCurrentUser():n.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&Bn(e)||this._popupRedirectResolver;q(t,this,"argument-error"),this.redirectPersistenceManager=await xr.create(this,[Bn(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,n;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((n=this.redirectUser)==null?void 0:n._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,n,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let o=!1;const B=this._isInitialized?Promise.resolve():this._initializationPromise;if(q(B,this,"internal-error"),B.then(()=>{o||i(this.currentUser)}),typeof t=="function"){const c=e.addObserver(t,n,s);return()=>{o=!0,c()}}else{const c=e.addObserver(t);return()=>{o=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return q(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Kf(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var s;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((s=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:s.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const n=await this._getAppCheckToken();return n&&(e["X-Firebase-AppCheck"]=n),e}async _getAppCheckToken(){var t;if(Je(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&Pf(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function Ye(r){return oe(r)}class yl{constructor(e){this.auth=e,this.observer=null,this.addObserver=Rg(t=>this.observer=t)}get next(){return q(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let _i={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function lE(r){_i=r}function nc(r){return _i.loadJS(r)}function hE(){return _i.recaptchaV2Script}function fE(){return _i.recaptchaEnterpriseScript}function CE(){return _i.gapiScript}function Wf(r){return`__${r}${Math.floor(Math.random()*1e6)}`}/**
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
 */const dE=500,pE=6e4,$i=1e12;class gE{constructor(e){this.auth=e,this.counter=$i,this._widgets=new Map}render(e,t){const n=this.counter;return this._widgets.set(n,new _E(e,this.auth.name,t||{})),this.counter++,n}reset(e){var n;const t=e||$i;(n=this._widgets.get(t))==null||n.delete(),this._widgets.delete(t)}getResponse(e){var n;const t=e||$i;return((n=this._widgets.get(t))==null?void 0:n.getResponse())||""}async execute(e){var n;const t=e||$i;return(n=this._widgets.get(t))==null||n.execute(),""}}class mE{constructor(){this.enterprise=new EE}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class EE{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class _E{constructor(e,t,n){this.params=n,this.timerId=null,this.deleted=!1,this.responseToken=null,this.clickHandler=()=>{this.execute()};const s=typeof e=="string"?document.getElementById(e):e;q(s,"argument-error",{appName:t}),this.container=s,this.isVisible=this.params.size!=="invisible",this.isVisible?this.execute():this.container.addEventListener("click",this.clickHandler)}getResponse(){return this.checkIfDeleted(),this.responseToken}delete(){this.checkIfDeleted(),this.deleted=!0,this.timerId&&(clearTimeout(this.timerId),this.timerId=null),this.container.removeEventListener("click",this.clickHandler)}execute(){this.checkIfDeleted(),!this.timerId&&(this.timerId=window.setTimeout(()=>{this.responseToken=DE(50);const{callback:e,"expired-callback":t}=this.params;if(e)try{e(this.responseToken)}catch{}this.timerId=window.setTimeout(()=>{if(this.timerId=null,this.responseToken=null,t)try{t()}catch{}this.isVisible&&this.execute()},pE)},dE))}checkIfDeleted(){if(this.deleted)throw new Error("reCAPTCHA mock was already deleted!")}}function DE(r){const e=[],t="1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";for(let n=0;n<r;n++)e.push(t.charAt(Math.floor(Math.random()*t.length)));return e.join("")}/**
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
 */const IE="recaptcha-enterprise",Vs="NO_RECAPTCHA",Tl="onFirebaseAuthREInstanceReady";class rn{constructor(e){this.type=IE,this.auth=Ye(e)}async verify(e="verify",t=!1){async function n(i){if(!t){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(o,B)=>{Lf(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(c=>{if(c.recaptchaKey===void 0)B(new Error("recaptcha Enterprise site key undefined"));else{const u=new bf(c);return i.tenantId==null?i._agentRecaptchaConfig=u:i._tenantRecaptchaConfigs[i.tenantId]=u,o(u.siteKey)}}).catch(c=>{B(c)})})}function s(i,o,B){const c=window.grecaptcha;_l(c)?c.enterprise.ready(()=>{c.enterprise.execute(i,{action:e}).then(u=>{o(u)}).catch(()=>{o(Vs)})}):B(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new mE().execute("siteKey",{action:"verify"}):new Promise((i,o)=>{n(this.auth).then(async B=>{if(!t&&_l(window.grecaptcha)&&rn.scriptInjectionDeferred)await rn.scriptInjectionDeferred.promise,s(B,i,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let c=fE();c.length!==0&&(c+=B+`&onload=${Tl}`),rn.scriptInjectionDeferred=new Df,window[Tl]=()=>{var u;(u=rn.scriptInjectionDeferred)==null||u.resolve()},nc(c).then(()=>{var u;return(u=rn.scriptInjectionDeferred)==null?void 0:u.promise}).then(()=>{s(B,i,o)}).catch(u=>{o(u)})}}).catch(B=>{o(B)})})}}rn.scriptInjectionDeferred=null;async function As(r,e,t,n=!1,s=!1){const i=new rn(r);let o;if(s)o=Vs;else try{o=await i.verify(t)}catch{o=await i.verify(t,!0)}const B={...e};if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in B){const c=B.phoneEnrollmentInfo.phoneNumber,u=B.phoneEnrollmentInfo.recaptchaToken;Object.assign(B,{phoneEnrollmentInfo:{phoneNumber:c,recaptchaToken:u,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in B){const c=B.phoneSignInInfo.recaptchaToken;Object.assign(B,{phoneSignInInfo:{recaptchaToken:c,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return B}return n?Object.assign(B,{captchaResp:o}):Object.assign(B,{captchaResponse:o}),Object.assign(B,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(B,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),B}async function Fn(r,e,t,n,s){var i,o;if(s==="EMAIL_PASSWORD_PROVIDER")if((i=r._getRecaptchaConfig())!=null&&i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const B=await As(r,e,t,t==="getOobCode");return n(r,B)}else return n(r,e).catch(async B=>{if(B.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const c=await As(r,e,t,t==="getOobCode");return n(r,c)}else return Promise.reject(B)});else if(s==="PHONE_PROVIDER")if((o=r._getRecaptchaConfig())!=null&&o.isProviderEnabled("PHONE_PROVIDER")){const B=await As(r,e,t);return n(r,B).catch(async c=>{var u;if(((u=r._getRecaptchaConfig())==null?void 0:u.getProviderEnforcementState("PHONE_PROVIDER"))==="AUDIT"&&(c.code==="auth/missing-recaptcha-token"||c.code==="auth/invalid-app-credential")){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${t} flow.`);const h=await As(r,e,t,!1,!0);return n(r,h)}return Promise.reject(c)})}else{const B=await As(r,e,t,!1,!0);return n(r,B)}else return Promise.reject(s+" provider is not supported.")}async function wE(r){const e=Ye(r),t=await Lf(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),n=new bf(t);e.tenantId==null?e._agentRecaptchaConfig=n:e._tenantRecaptchaConfigs[e.tenantId]=n,n.isAnyProviderEnabled()&&new rn(e).verify()}/**
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
 */function yE(r,e){const t=jo(r,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(Un(i,e??{}))return s;Vt(s,"already-initialized")}return t.initialize({options:e})}function TE(r,e){const t=(e==null?void 0:e.persistence)||[],n=(Array.isArray(t)?t:[t]).map(Bn);e!=null&&e.errorMap&&r._updateErrorMap(e.errorMap),r._initializeWithPersistence(n,e==null?void 0:e.popupRedirectResolver)}function AB(r,e,t){const n=Ye(r);q(/^https?:\/\//.test(e),n,"invalid-emulator-scheme");const s=!1,i=zf(e),{host:o,port:B}=AE(e),c=B===null?"":`:${B}`,u={url:`${i}//${o}${c}/`},h=Object.freeze({host:o,port:B,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!n._canInitEmulator){q(n.config.emulator&&n.emulatorConfig,n,"emulator-config-failed"),q(Un(u,n.config.emulator)&&Un(h,n.emulatorConfig),n,"emulator-config-failed");return}n.config.emulator=u,n.emulatorConfig=h,n.settings.appVerificationDisabledForTesting=!0,Yr(o)?zB(`${i}//${o}${c}`):RE()}function zf(r){const e=r.indexOf(":");return e<0?"":r.substr(0,e+1)}function AE(r){const e=zf(r),t=/(\/\/)?([^?#/]+)/.exec(r.substr(e.length));if(!t)return{host:"",port:null};const n=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(n);if(s){const i=s[1];return{host:i,port:Al(n.substr(i.length+1))}}else{const[i,o]=n.split(":");return{host:i,port:Al(o)}}}function Al(r){if(!r)return null;const e=Number(r);return isNaN(e)?null:e}function RE(){function r(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",r):r())}/**
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
 */class Wo{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return an("not implemented")}_getIdTokenResponse(e){return an("not implemented")}_linkToIdToken(e,t){return an("not implemented")}_getReauthenticationResolver(e){return an("not implemented")}}/**
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
 */async function vE(r,e){return Ke(r,"POST","/v1/accounts:resetPassword",qe(r,e))}async function PE(r,e){return Ke(r,"POST","/v1/accounts:update",e)}async function SE(r,e){return Ke(r,"POST","/v1/accounts:signUp",e)}async function OE(r,e){return Ke(r,"POST","/v1/accounts:update",qe(r,e))}/**
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
 */async function NE(r,e){return mn(r,"POST","/v1/accounts:signInWithPassword",qe(r,e))}async function zo(r,e){return Ke(r,"POST","/v1/accounts:sendOobCode",qe(r,e))}async function bE(r,e){return zo(r,e)}async function LE(r,e){return zo(r,e)}async function FE(r,e){return zo(r,e)}async function kE(r,e){return zo(r,e)}/**
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
 */async function VE(r,e){return mn(r,"POST","/v1/accounts:signInWithEmailLink",qe(r,e))}async function xE(r,e){return mn(r,"POST","/v1/accounts:signInWithEmailLink",qe(r,e))}/**
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
 */class Zs extends Wo{constructor(e,t,n,s=null){super("password",n),this._email=e,this._password=t,this._tenantId=s}static _fromEmailAndPassword(e,t){return new Zs(e,t,"password")}static _fromEmailAndCode(e,t,n=null){return new Zs(e,t,"emailLink",n)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Fn(e,t,"signInWithPassword",NE,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return VE(e,{email:this._email,oobCode:this._password});default:Vt(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const n={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Fn(e,n,"signUpPassword",SE,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return xE(e,{idToken:t,email:this._email,oobCode:this._password});default:Vt(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
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
 */async function Mr(r,e){return mn(r,"POST","/v1/accounts:signInWithIdp",qe(r,e))}/**
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
 */const ME="http://localhost";class Yt extends Wo{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Yt(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):Vt("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:n,signInMethod:s,...i}=t;if(!n||!s)return null;const o=new Yt(n,s);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return Mr(e,t)}_linkToIdToken(e,t){const n=this.buildRequest();return n.idToken=t,Mr(e,n)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Mr(e,t)}buildRequest(){const e={requestUri:ME,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=$r(t)}return e}}/**
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
 */async function Rl(r,e){return Ke(r,"POST","/v1/accounts:sendVerificationCode",qe(r,e))}async function GE(r,e){return mn(r,"POST","/v1/accounts:signInWithPhoneNumber",qe(r,e))}async function UE(r,e){const t=await mn(r,"POST","/v1/accounts:signInWithPhoneNumber",qe(r,e));if(t.temporaryProof)throw Os(r,"account-exists-with-different-credential",t);return t}const HE={USER_NOT_FOUND:"user-not-found"};async function JE(r,e){const t={...e,operation:"REAUTH"};return mn(r,"POST","/v1/accounts:signInWithPhoneNumber",qe(r,t),HE)}/**
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
 */class xs extends Wo{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,t){return new xs({verificationId:e,verificationCode:t})}static _fromTokenResponse(e,t){return new xs({phoneNumber:e,temporaryProof:t})}_getIdTokenResponse(e){return GE(e,this._makeVerificationRequest())}_linkToIdToken(e,t){return UE(e,{idToken:t,...this._makeVerificationRequest()})}_getReauthenticationResolver(e){return JE(e,this._makeVerificationRequest())}_makeVerificationRequest(){const{temporaryProof:e,phoneNumber:t,verificationId:n,verificationCode:s}=this.params;return e&&t?{temporaryProof:e,phoneNumber:t}:{sessionInfo:n,code:s}}toJSON(){const e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));const{verificationId:t,verificationCode:n,phoneNumber:s,temporaryProof:i}=e;return!n&&!t&&!s&&!i?null:new xs({verificationId:t,verificationCode:n,phoneNumber:s,temporaryProof:i})}}/**
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
 */function jE(r){switch(r){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function qE(r){const e=Ps(Ss(r)).link,t=e?Ps(Ss(e)).deep_link_id:null,n=Ps(Ss(r)).deep_link_id;return(n?Ps(Ss(n)).link:null)||n||t||e||r}class Qo{constructor(e){const t=Ps(Ss(e)),n=t.apiKey??null,s=t.oobCode??null,i=jE(t.mode??null);q(n&&s&&i,"argument-error"),this.apiKey=n,this.operation=i,this.code=s,this.continueUrl=t.continueUrl??null,this.languageCode=t.lang??null,this.tenantId=t.tenantId??null}static parseLink(e){const t=qE(e);try{return new Qo(t)}catch{return null}}}/**
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
 */class Cn{constructor(){this.providerId=Cn.PROVIDER_ID}static credential(e,t){return Zs._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const n=Qo.parseLink(t);return q(n,"argument-error"),Zs._fromEmailAndCode(e,n.code,n.tenantId)}}Cn.PROVIDER_ID="password";Cn.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Cn.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
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
 */class Zr{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class es extends Zr{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}class Ne extends es{static credentialFromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;return q("providerId"in t&&"signInMethod"in t,"argument-error"),Yt._fromParams(t)}credential(e){return this._credential({...e,nonce:e.rawNonce})}_credential(e){return q(e.idToken||e.accessToken,"argument-error"),Yt._fromParams({...e,providerId:this.providerId,signInMethod:this.providerId})}static credentialFromResult(e){return Ne.oauthCredentialFromTaggedObject(e)}static credentialFromError(e){return Ne.oauthCredentialFromTaggedObject(e.customData||{})}static oauthCredentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:n,oauthTokenSecret:s,pendingToken:i,nonce:o,providerId:B}=e;if(!n&&!s&&!t&&!i||!B)return null;try{return new Ne(B)._credential({idToken:t,accessToken:n,nonce:o,pendingToken:i})}catch{return null}}}/**
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
 */class bt extends es{constructor(){super("facebook.com")}static credential(e){return Yt._fromParams({providerId:bt.PROVIDER_ID,signInMethod:bt.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return bt.credentialFromTaggedObject(e)}static credentialFromError(e){return bt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return bt.credential(e.oauthAccessToken)}catch{return null}}}bt.FACEBOOK_SIGN_IN_METHOD="facebook.com";bt.PROVIDER_ID="facebook.com";/**
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
 */class Lt extends es{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Yt._fromParams({providerId:Lt.PROVIDER_ID,signInMethod:Lt.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return Lt.credentialFromTaggedObject(e)}static credentialFromError(e){return Lt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:n}=e;if(!t&&!n)return null;try{return Lt.credential(t,n)}catch{return null}}}Lt.GOOGLE_SIGN_IN_METHOD="google.com";Lt.PROVIDER_ID="google.com";/**
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
 */class Ft extends es{constructor(){super("github.com")}static credential(e){return Yt._fromParams({providerId:Ft.PROVIDER_ID,signInMethod:Ft.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Ft.credentialFromTaggedObject(e)}static credentialFromError(e){return Ft.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Ft.credential(e.oauthAccessToken)}catch{return null}}}Ft.GITHUB_SIGN_IN_METHOD="github.com";Ft.PROVIDER_ID="github.com";/**
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
 */class kt extends es{constructor(){super("twitter.com")}static credential(e,t){return Yt._fromParams({providerId:kt.PROVIDER_ID,signInMethod:kt.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return kt.credentialFromTaggedObject(e)}static credentialFromError(e){return kt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:n}=e;if(!t||!n)return null;try{return kt.credential(t,n)}catch{return null}}}kt.TWITTER_SIGN_IN_METHOD="twitter.com";kt.PROVIDER_ID="twitter.com";/**
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
 */async function Qf(r,e){return mn(r,"POST","/v1/accounts:signUp",qe(r,e))}/**
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
 */class Xt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,n,s=!1){const i=await Mt._fromIdTokenResponse(e,n,s),o=vl(n);return new Xt({user:i,providerId:o,_tokenResponse:n,operationType:t})}static async _forOperation(e,t,n){await e._updateTokensIfNecessary(n,!0);const s=vl(n);return new Xt({user:e,providerId:s,_tokenResponse:n,operationType:t})}}function vl(r){return r.providerId?r.providerId:"phoneNumber"in r?"phone":null}/**
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
 */async function KE(r){var s;if(Je(r.app))return Promise.reject(lt(r));const e=Ye(r);if(await e._initializationPromise,(s=e.currentUser)!=null&&s.isAnonymous)return new Xt({user:e.currentUser,providerId:null,operationType:"signIn"});const t=await Qf(e,{returnSecureToken:!0}),n=await Xt._fromIdTokenResponse(e,"signIn",t,!0);return await e._updateCurrentUser(n.user),n}/**
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
 */class yo extends gn{constructor(e,t,n,s){super(t.code,t.message),this.operationType=n,this.user=s,Object.setPrototypeOf(this,yo.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:n}}static _fromErrorAndOperation(e,t,n,s){return new yo(e,t,n,s)}}function $f(r,e,t,n){return(e==="reauthenticate"?t._getReauthenticationResolver(r):t._getIdTokenResponse(r)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?yo._fromErrorAndOperation(r,i,e,n):i})}/**
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
 */function Yf(r){return new Set(r.map(({providerId:e})=>e).filter(e=>!!e))}/**
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
 */async function WE(r,e){const t=oe(r);await $o(!0,t,e);const{providerUserInfo:n}=await Ym(t.auth,{idToken:await t.getIdToken(),deleteProvider:[e]}),s=Yf(n||[]);return t.providerData=t.providerData.filter(i=>s.has(i.providerId)),s.has("phone")||(t.phoneNumber=null),await t.auth._persistUserIfCurrent(t),t}async function Xf(r,e,t=!1){const n=await pr(r,e._linkToIdToken(r.auth,await r.getIdToken()),t);return Xt._forOperation(r,"link",n)}async function $o(r,e,t){await Xs(e);const n=Yf(e.providerData),s=r===!1?"provider-already-linked":"no-such-provider";q(n.has(t)===r,e.auth,s)}/**
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
 */async function zE(r,e,t=!1){const{auth:n}=r;if(Je(n.app))return Promise.reject(lt(n));const s="reauthenticate";try{const i=await pr(r,$f(n,s,e,r),t);q(i.idToken,n,"internal-error");const o=Ko(i.idToken);q(o,n,"internal-error");const{sub:B}=o;return q(r.uid===B,n,"user-mismatch"),Xt._forOperation(r,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&Vt(n,"user-mismatch"),i}}/**
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
 */async function Zf(r,e,t=!1){if(Je(r.app))return Promise.reject(lt(r));const n="signIn",s=await $f(r,n,e),i=await Xt._fromIdTokenResponse(r,n,s);return t||await r._updateCurrentUser(i.user),i}async function rc(r,e){return Zf(Ye(r),e)}async function eC(r,e){const t=oe(r);return await $o(!1,t,e.providerId),Xf(t,e)}/**
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
 */async function QE(r,e){return mn(r,"POST","/v1/accounts:signInWithCustomToken",qe(r,e))}/**
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
 */async function $E(r,e){if(Je(r.app))return Promise.reject(lt(r));const t=Ye(r),n=await QE(t,{token:e,returnSecureToken:!0}),s=await Xt._fromIdTokenResponse(t,"signIn",n);return await t._updateCurrentUser(s.user),s}/**
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
 */function Yo(r,e,t){var n;q(((n=t.url)==null?void 0:n.length)>0,r,"invalid-continue-uri"),q(typeof t.dynamicLinkDomain>"u"||t.dynamicLinkDomain.length>0,r,"invalid-dynamic-link-domain"),q(typeof t.linkDomain>"u"||t.linkDomain.length>0,r,"invalid-hosting-link-domain"),e.continueUrl=t.url,e.dynamicLinkDomain=t.dynamicLinkDomain,e.linkDomain=t.linkDomain,e.canHandleCodeInApp=t.handleCodeInApp,t.iOS&&(q(t.iOS.bundleId.length>0,r,"missing-ios-bundle-id"),e.iOSBundleId=t.iOS.bundleId),t.android&&(q(t.android.packageName.length>0,r,"missing-android-pkg-name"),e.androidInstallApp=t.android.installApp,e.androidMinimumVersionCode=t.android.minimumVersion,e.androidPackageName=t.android.packageName)}/**
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
 */async function sc(r){const e=Ye(r);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function YE(r,e,t){const n=Ye(r),s={requestType:"PASSWORD_RESET",email:e,clientType:"CLIENT_TYPE_WEB"};t&&Yo(n,s,t),await Fn(n,s,"getOobCode",LE,"EMAIL_PASSWORD_PROVIDER")}async function XE(r,e,t){await vE(oe(r),{oobCode:e,newPassword:t}).catch(async n=>{throw n.code==="auth/password-does-not-meet-requirements"&&sc(r),n})}async function ZE(r,e){await OE(oe(r),{oobCode:e})}async function e_(r,e,t){if(Je(r.app))return Promise.reject(lt(r));const n=Ye(r),o=await Fn(n,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",Qf,"EMAIL_PASSWORD_PROVIDER").catch(c=>{throw c.code==="auth/password-does-not-meet-requirements"&&sc(r),c}),B=await Xt._fromIdTokenResponse(n,"signIn",o);return await n._updateCurrentUser(B.user),B}function t_(r,e,t){return Je(r.app)?Promise.reject(lt(r)):rc(oe(r),Cn.credential(e,t)).catch(async n=>{throw n.code==="auth/password-does-not-meet-requirements"&&sc(r),n})}/**
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
 */async function n_(r,e,t){const n=Ye(r),s={requestType:"EMAIL_SIGNIN",email:e,clientType:"CLIENT_TYPE_WEB"};function i(o,B){q(B.handleCodeInApp,n,"argument-error"),B&&Yo(n,o,B)}i(s,t),await Fn(n,s,"getOobCode",FE,"EMAIL_PASSWORD_PROVIDER")}function r_(r,e){const t=Qo.parseLink(e);return(t==null?void 0:t.operation)==="EMAIL_SIGNIN"}async function s_(r,e,t){if(Je(r.app))return Promise.reject(lt(r));const n=oe(r),s=Cn.credentialWithLink(e,t||Ys());return q(s._tenantId===(n.tenantId||null),n,"tenant-id-mismatch"),rc(n,s)}/**
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
 */async function i_(r,e){return Ke(r,"POST","/v1/accounts:createAuthUri",qe(r,e))}/**
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
 */async function o_(r,e){const t=ZB()?Ys():"http://localhost",n={identifier:e,continueUri:t},{signinMethods:s}=await i_(oe(r),n);return s||[]}async function a_(r,e){const t=oe(r),s={requestType:"VERIFY_EMAIL",idToken:await r.getIdToken()};e&&Yo(t.auth,s,e);const{email:i}=await bE(t.auth,s);i!==r.email&&await r.reload()}async function B_(r,e,t){const n=oe(r),i={requestType:"VERIFY_AND_CHANGE_EMAIL",idToken:await r.getIdToken(),newEmail:e};t&&Yo(n.auth,i,t);const{email:o}=await kE(n.auth,i);o!==r.email&&await r.reload()}/**
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
 */async function c_(r,e){return Ke(r,"POST","/v1/accounts:update",e)}/**
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
 */async function u_(r,{displayName:e,photoURL:t}){if(e===void 0&&t===void 0)return;const n=oe(r),i={idToken:await n.getIdToken(),displayName:e,photoUrl:t,returnSecureToken:!0},o=await pr(n,c_(n.auth,i));n.displayName=o.displayName||null,n.photoURL=o.photoUrl||null;const B=n.providerData.find(({providerId:c})=>c==="password");B&&(B.displayName=n.displayName,B.photoURL=n.photoURL),await n._updateTokensIfNecessary(o)}function l_(r,e){const t=oe(r);return Je(t.auth.app)?Promise.reject(lt(t.auth)):tC(t,e,null)}function h_(r,e){return tC(oe(r),null,e)}async function tC(r,e,t){const{auth:n}=r,i={idToken:await r.getIdToken(),returnSecureToken:!0};e&&(i.email=e),t&&(i.password=t);const o=await pr(r,PE(n,i));await r._updateTokensIfNecessary(o,!0)}/**
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
 */function f_(r){var s,i;if(!r)return null;const{providerId:e}=r,t=r.rawUserInfo?JSON.parse(r.rawUserInfo):{},n=r.isNewUser||r.kind==="identitytoolkit#SignupNewUserResponse";if(!e&&(r!=null&&r.idToken)){const o=(i=(s=Ko(r.idToken))==null?void 0:s.firebase)==null?void 0:i.sign_in_provider;if(o){const B=o!=="anonymous"&&o!=="custom"?o:null;return new Gr(n,B)}}if(!e)return null;switch(e){case"facebook.com":return new C_(n,t);case"github.com":return new d_(n,t);case"google.com":return new p_(n,t);case"twitter.com":return new g_(n,t,r.screenName||null);case"custom":case"anonymous":return new Gr(n,null);default:return new Gr(n,e,t)}}class Gr{constructor(e,t,n={}){this.isNewUser=e,this.providerId=t,this.profile=n}}class nC extends Gr{constructor(e,t,n,s){super(e,t,n),this.username=s}}class C_ extends Gr{constructor(e,t){super(e,"facebook.com",t)}}class d_ extends nC{constructor(e,t){super(e,"github.com",t,typeof(t==null?void 0:t.login)=="string"?t==null?void 0:t.login:null)}}class p_ extends Gr{constructor(e,t){super(e,"google.com",t)}}class g_ extends nC{constructor(e,t,n){super(e,"twitter.com",t,n)}}function m_(r){const{user:e,_tokenResponse:t}=r;return e.isAnonymous&&!t?{providerId:null,isNewUser:!1,profile:null}:f_(t)}/**
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
 */function Yi(r,e){return oe(r).setPersistence(e)}function E_(r,e,t,n){return oe(r).onIdTokenChanged(e,t,n)}function __(r,e,t){return oe(r).beforeAuthStateChanged(e,t)}function vR(r,e,t,n){return oe(r).onAuthStateChanged(e,t,n)}function PR(r){return oe(r).signOut()}function D_(r,e){return Ye(r).revokeAccessToken(e)}async function I_(r){return oe(r).delete()}/**
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
 */function Pl(r,e){return Ke(r,"POST","/v2/accounts/mfaEnrollment:start",qe(r,e))}const To="__sak";/**
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
 */class rC{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(To,"1"),this.storage.removeItem(To),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const w_=1e3,y_=10;class sC extends rC{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=qf(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const n=this.storage.getItem(t),s=this.localCache[t];n!==s&&e(t,s,n)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,B,c)=>{this.notifyListeners(o,c)});return}const n=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const o=this.storage.getItem(n);!t&&this.localCache[n]===o||this.notifyListeners(n,o)},i=this.storage.getItem(n);iE()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,y_):s()}notifyListeners(e,t){this.localCache[e]=t;const n=this.listeners[e];if(n)for(const s of Array.from(n))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,n)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:n}),!0)})},w_)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}sC.type="LOCAL";const iC=sC;/**
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
 */class oC extends rC{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}oC.type="SESSION";const ic=oC;/**
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
 */function T_(r){return Promise.all(r.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
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
 */class Xo{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const n=new Xo(e);return this.receivers.push(n),n}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:n,eventType:s,data:i}=t.data,o=this.handlersMap[s];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:n,eventType:s});const B=Array.from(o).map(async u=>u(t.origin,i)),c=await T_(B);t.ports[0].postMessage({status:"done",eventId:n,eventType:s,response:c})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Xo.receivers=[];/**
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
 */function Zo(r="",e=10){let t="";for(let n=0;n<e;n++)t+=Math.floor(Math.random()*10);return r+t}/**
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
 */class A_{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,n=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,o;return new Promise((B,c)=>{const u=Zo("",20);s.port1.start();const h=setTimeout(()=>{c(new Error("unsupported_event"))},n);o={messageChannel:s,onMessage(C){const p=C;if(p.data.eventId===u)switch(p.data.status){case"ack":clearTimeout(h),i=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),B(p.data.response);break;default:clearTimeout(h),clearTimeout(i),c(new Error("invalid_response"));break}}},this.handlers.add(o),s.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:u,data:t},[s.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
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
 */function Le(){return window}function R_(r){Le().location.href=r}/**
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
 */function oc(){return typeof Le().WorkerGlobalScope<"u"&&typeof Le().importScripts=="function"}async function v_(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function P_(){var r;return((r=navigator==null?void 0:navigator.serviceWorker)==null?void 0:r.controller)||null}function S_(){return oc()?self:null}/**
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
 */const aC="firebaseLocalStorageDb",O_=1,Ao="firebaseLocalStorage",BC="fbase_key";class Di{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function ea(r,e){return r.transaction([Ao],e?"readwrite":"readonly").objectStore(Ao)}function N_(){const r=indexedDB.deleteDatabase(aC);return new Di(r).toPromise()}function cC(){const r=indexedDB.open(aC,O_);return new Promise((e,t)=>{r.addEventListener("error",()=>{t(r.error)}),r.addEventListener("upgradeneeded",()=>{const n=r.result;try{n.createObjectStore(Ao,{keyPath:BC})}catch(s){t(s)}}),r.addEventListener("success",async()=>{const n=r.result;n.objectStoreNames.contains(Ao)?e(n):(n.close(),await N_(),e(await cC()))})})}async function Sl(r,e,t){const n=ea(r,!0).put({[BC]:e,value:t});return new Di(n).toPromise()}async function b_(r,e){const t=ea(r,!1).get(e),n=await new Di(t).toPromise();return n===void 0?null:n.value}function Ol(r,e){const t=ea(r,!0).delete(e);return new Di(t).toPromise()}const L_=800,F_=3;class uC{registerLifecycleListeners(){typeof window<"u"&&typeof window.addEventListener=="function"&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow))}unregisterLifecycleListeners(){typeof window<"u"&&typeof window.removeEventListener=="function"&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow))}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isClosing=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isClosing=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isClosing&&(this.isClosing=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){if(this.isClosing)throw new Error("Database is closing");return this.dbPromise?this.dbPromise:(this.dbPromise=cC(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let t=0;for(;;)try{const n=await this._openDb();return await e(n)}catch(n){if(this.isClosing||t++>F_)throw n;this.dbPromise&&((await this.dbPromise).close(),this.dbPromise=null)}}async initializeServiceWorkerMessaging(){return oc()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Xo._getInstance(S_()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,n;if(this.activeServiceWorker=await v_(),!this.activeServiceWorker)return;this.sender=new A_(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(n=e[0])!=null&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||P_()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await Sl(e,To,"1"),await Ol(e,To)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(n=>Sl(n,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(n=>b_(n,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Ol(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){if(this.isClosing)return[];try{const e=await this._withRetries(s=>{const i=ea(s,!1).getAll();return new Di(i).toPromise()});if(this.isClosing)return[];if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],n=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)n.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!n.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}catch(e){return this.isClosing||Pf(`Firebase Auth cross-tab polling failed with error: ${e}`),[]}}notifyListeners(e,t){this.localCache[e]=t;const n=this.listeners[e];if(n)for(const s of Array.from(n))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),L_)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.stopPolling(),this.unregisterLifecycleListeners())}}uC.type="LOCAL";const lC=uC;/**
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
 */function Nl(r,e){return Ke(r,"POST","/v2/accounts/mfaSignIn:start",qe(r,e))}/**
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
 */const iB=Wf("rcb"),k_=new Ei(3e4,6e4);class V_{constructor(){var e;this.hostLanguage="",this.counter=0,this.librarySeparatelyLoaded=!!((e=Le().grecaptcha)!=null&&e.render)}load(e,t=""){return q(x_(t),e,"argument-error"),this.shouldResolveImmediately(t)&&El(Le().grecaptcha)?Promise.resolve(Le().grecaptcha):new Promise((n,s)=>{const i=Le().setTimeout(()=>{s(gt(e,"network-request-failed"))},k_.get());Le()[iB]=()=>{Le().clearTimeout(i),delete Le()[iB];const B=Le().grecaptcha;if(!B||!El(B)){s(gt(e,"internal-error"));return}const c=B.render;B.render=(u,h)=>{const C=c(u,h);return this.counter++,C},this.hostLanguage=t,n(B)};const o=`${hE()}?${$r({onload:iB,render:"explicit",hl:t})}`;nc(o).catch(()=>{clearTimeout(i),s(gt(e,"internal-error"))})})}clearedOneInstance(){this.counter--}shouldResolveImmediately(e){var t;return!!((t=Le().grecaptcha)!=null&&t.render)&&(e===this.hostLanguage||this.counter>0||this.librarySeparatelyLoaded)}}function x_(r){return r.length<=6&&/^\s*[a-zA-Z0-9\-]*\s*$/.test(r)}class M_{async load(e){return new gE(e)}clearedOneInstance(){}}/**
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
 */const Ms="recaptcha",G_={theme:"light",type:"image"};class bl{constructor(e,t,n={...G_}){this.parameters=n,this.type=Ms,this.destroyed=!1,this.widgetId=null,this.tokenChangeListeners=new Set,this.renderPromise=null,this.recaptcha=null,this.auth=Ye(e),this.isInvisible=this.parameters.size==="invisible",q(typeof document<"u",this.auth,"operation-not-supported-in-this-environment");const s=typeof t=="string"?document.getElementById(t):t;q(s,this.auth,"argument-error"),this.container=s,this.parameters.callback=this.makeTokenCallback(this.parameters.callback),this._recaptchaLoader=this.auth.settings.appVerificationDisabledForTesting?new M_:new V_,this.validateStartingState()}async verify(){this.assertNotDestroyed();const e=await this.render(),t=this.getAssertedRecaptcha(),n=t.getResponse(e);return n||new Promise(s=>{const i=o=>{o&&(this.tokenChangeListeners.delete(i),s(o))};this.tokenChangeListeners.add(i),this.isInvisible&&t.execute(e)})}render(){try{this.assertNotDestroyed()}catch(e){return Promise.reject(e)}return this.renderPromise?this.renderPromise:(this.renderPromise=this.makeRenderPromise().catch(e=>{throw this.renderPromise=null,e}),this.renderPromise)}_reset(){this.assertNotDestroyed(),this.widgetId!==null&&this.getAssertedRecaptcha().reset(this.widgetId)}clear(){this.assertNotDestroyed(),this.destroyed=!0,this._recaptchaLoader.clearedOneInstance(),this.isInvisible||this.container.childNodes.forEach(e=>{this.container.removeChild(e)})}validateStartingState(){q(!this.parameters.sitekey,this.auth,"argument-error"),q(this.isInvisible||!this.container.hasChildNodes(),this.auth,"argument-error"),q(typeof document<"u",this.auth,"operation-not-supported-in-this-environment")}makeTokenCallback(e){return t=>{if(this.tokenChangeListeners.forEach(n=>n(t)),typeof e=="function")e(t);else if(typeof e=="string"){const n=Le()[e];typeof n=="function"&&n(t)}}}assertNotDestroyed(){q(!this.destroyed,this.auth,"internal-error")}async makeRenderPromise(){if(await this.init(),!this.widgetId){let e=this.container;if(!this.isInvisible){const t=document.createElement("div");e.appendChild(t),e=t}this.widgetId=this.getAssertedRecaptcha().render(e,this.parameters)}return this.widgetId}async init(){q(ZB()&&!oc(),this.auth,"internal-error"),await U_(),this.recaptcha=await this._recaptchaLoader.load(this.auth,this.auth.languageCode||void 0);const e=await Qm(this.auth);q(e,this.auth,"internal-error"),this.parameters.sitekey=e}getAssertedRecaptcha(){return q(this.recaptcha,this.auth,"internal-error"),this.recaptcha}}function U_(){let r=null;return new Promise(e=>{if(document.readyState==="complete"){e();return}r=()=>e(),window.addEventListener("load",r)}).catch(e=>{throw r&&window.removeEventListener("load",r),e})}/**
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
 */class hC{constructor(e,t){this.verificationId=e,this.onConfirmation=t}confirm(e){const t=xs._fromVerification(this.verificationId,e);return this.onConfirmation(t)}}async function H_(r,e,t){if(Je(r.app))return Promise.reject(lt(r));const n=Ye(r),s=await fC(n,e,oe(t));return new hC(s,i=>rc(n,i))}async function J_(r,e,t){const n=oe(r);await $o(!1,n,"phone");const s=await fC(n.auth,e,oe(t));return new hC(s,i=>eC(n,i))}async function fC(r,e,t){var n;if(!r._getRecaptchaConfig())try{await wE(r)}catch{console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.")}try{let s;if(typeof e=="string"?s={phoneNumber:e}:s=e,"session"in s){const i=s.session;if("phoneNumber"in s){q(i.type==="enroll",r,"internal-error");const o={idToken:i.credential,phoneEnrollmentInfo:{phoneNumber:s.phoneNumber,clientType:"CLIENT_TYPE_WEB"}};return(await Fn(r,o,"mfaSmsEnrollment",async(h,C)=>{if(C.phoneEnrollmentInfo.captchaResponse===Vs){q((t==null?void 0:t.type)===Ms,h,"argument-error");const p=await oB(h,C,t);return Pl(h,p)}return Pl(h,C)},"PHONE_PROVIDER").catch(h=>Promise.reject(h))).phoneSessionInfo.sessionInfo}else{q(i.type==="signin",r,"internal-error");const o=((n=s.multiFactorHint)==null?void 0:n.uid)||s.multiFactorUid;q(o,r,"missing-multi-factor-info");const B={mfaPendingCredential:i.credential,mfaEnrollmentId:o,phoneSignInInfo:{clientType:"CLIENT_TYPE_WEB"}};return(await Fn(r,B,"mfaSmsSignIn",async(C,p)=>{if(p.phoneSignInInfo.captchaResponse===Vs){q((t==null?void 0:t.type)===Ms,C,"argument-error");const I=await oB(C,p,t);return Nl(C,I)}return Nl(C,p)},"PHONE_PROVIDER").catch(C=>Promise.reject(C))).phoneResponseInfo.sessionInfo}}else{const i={phoneNumber:s.phoneNumber,clientType:"CLIENT_TYPE_WEB"};return(await Fn(r,i,"sendVerificationCode",async(u,h)=>{if(h.captchaResponse===Vs){q((t==null?void 0:t.type)===Ms,u,"argument-error");const C=await oB(u,h,t);return Rl(u,C)}return Rl(u,h)},"PHONE_PROVIDER").catch(u=>Promise.reject(u))).sessionInfo}}finally{t==null||t._reset()}}async function oB(r,e,t){q(t.type===Ms,r,"argument-error");const n=await t.verify();q(typeof n=="string",r,"argument-error");const s={...e};if("phoneEnrollmentInfo"in s){const i=s.phoneEnrollmentInfo.phoneNumber,o=s.phoneEnrollmentInfo.captchaResponse,B=s.phoneEnrollmentInfo.clientType,c=s.phoneEnrollmentInfo.recaptchaVersion;return Object.assign(s,{phoneEnrollmentInfo:{phoneNumber:i,recaptchaToken:n,captchaResponse:o,clientType:B,recaptchaVersion:c}}),s}else if("phoneSignInInfo"in s){const i=s.phoneSignInInfo.captchaResponse,o=s.phoneSignInInfo.clientType,B=s.phoneSignInInfo.recaptchaVersion;return Object.assign(s,{phoneSignInInfo:{recaptchaToken:n,captchaResponse:i,clientType:o,recaptchaVersion:B}}),s}else return Object.assign(s,{recaptchaToken:n}),s}/**
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
 */function Ii(r,e){return e?Bn(e):(q(r._popupRedirectResolver,r,"argument-error"),r._popupRedirectResolver)}/**
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
 */class ac extends Wo{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Mr(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Mr(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Mr(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function j_(r){return Zf(r.auth,new ac(r),r.bypassAuthState)}function q_(r){const{auth:e,user:t}=r;return q(t,e,"internal-error"),zE(t,new ac(r),r.bypassAuthState)}async function K_(r){const{auth:e,user:t}=r;return q(t,e,"internal-error"),Xf(t,new ac(r),r.bypassAuthState)}/**
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
 */class CC{constructor(e,t,n,s,i=!1){this.auth=e,this.resolver=n,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(n){this.reject(n)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:n,postBody:s,tenantId:i,error:o,type:B}=e;if(o){this.reject(o);return}const c={auth:this.auth,requestUri:t,sessionId:n,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(B)(c))}catch(u){this.reject(u)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return j_;case"linkViaPopup":case"linkViaRedirect":return K_;case"reauthViaPopup":case"reauthViaRedirect":return q_;default:Vt(this.auth,"internal-error")}}resolve(e){fn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){fn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const W_=new Ei(2e3,1e4);async function z_(r,e,t){if(Je(r.app))return Promise.reject(gt(r,"operation-not-supported-in-this-environment"));const n=Ye(r);qo(r,e,Zr);const s=Ii(n,t);return new On(n,"signInViaPopup",e,s).executeNotNull()}async function Q_(r,e,t){const n=oe(r);qo(n.auth,e,Zr);const s=Ii(n.auth,t);return new On(n.auth,"linkViaPopup",e,s,n).executeNotNull()}class On extends CC{constructor(e,t,n,s,i){super(e,t,s,i),this.provider=n,this.authWindow=null,this.pollId=null,On.currentPopupAction&&On.currentPopupAction.cancel(),On.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return q(e,this.auth,"internal-error"),e}async onExecution(){fn(this.filter.length===1,"Popup operations only handle one event");const e=Zo();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(gt(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(gt(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,On.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,n;if((n=(t=this.authWindow)==null?void 0:t.window)!=null&&n.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(gt(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,W_.get())};e()}}On.currentPopupAction=null;/**
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
 */const $_="pendingRedirect",lo=new Map;class Y_ extends CC{constructor(e,t,n=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,n),this.eventId=null}async execute(){let e=lo.get(this.auth._key());if(!e){try{const n=await X_(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(n)}catch(t){e=()=>Promise.reject(t)}lo.set(this.auth._key(),e)}return this.bypassAuthState||lo.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function X_(r,e){const t=gC(e),n=pC(r);if(!await n._isAvailable())return!1;const s=await n._get(t)==="true";return await n._remove(t),s}async function dC(r,e){return pC(r)._set(gC(e),"true")}function Z_(r,e){lo.set(r._key(),e)}function pC(r){return Bn(r._redirectPersistence)}function gC(r){return uo($_,r.config.apiKey,r.name)}/**
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
 */function eD(r,e,t){return tD(r,e,t)}async function tD(r,e,t){if(Je(r.app))return Promise.reject(lt(r));const n=Ye(r);qo(r,e,Zr),await n._initializationPromise;const s=Ii(n,t);return await dC(s,n),s._openRedirect(n,e,"signInViaRedirect")}function nD(r,e,t){return rD(r,e,t)}async function rD(r,e,t){const n=oe(r);qo(n.auth,e,Zr),await n.auth._initializationPromise;const s=Ii(n.auth,t);await $o(!1,n,e.providerId),await dC(s,n.auth);const i=await iD(n);return s._openRedirect(n.auth,e,"linkViaRedirect",i)}async function sD(r,e){return await Ye(r)._initializationPromise,mC(r,e,!1)}async function mC(r,e,t=!1){if(Je(r.app))return Promise.reject(lt(r));const n=Ye(r),s=Ii(n,e),o=await new Y_(n,s,t).execute();return o&&!t&&(delete o.user._redirectEventId,await n._persistUserIfCurrent(o.user),await n._setRedirectUser(null,e)),o}async function iD(r){const e=Zo(`${r.uid}:::`);return r._redirectEventId=e,await r.auth._setRedirectUser(r),await r.auth._persistUserIfCurrent(r),e}/**
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
 */const oD=600*1e3;class aD{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(n=>{this.isEventForConsumer(e,n)&&(t=!0,this.sendToConsumer(e,n),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!BD(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var n;if(e.error&&!EC(e)){const s=((n=e.error.code)==null?void 0:n.split("auth/")[1])||"internal-error";t.onError(gt(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const n=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&n}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=oD&&this.cachedEventUids.clear(),this.cachedEventUids.has(Ll(e))}saveEventToCache(e){this.cachedEventUids.add(Ll(e)),this.lastProcessedEventTime=Date.now()}}function Ll(r){return[r.type,r.eventId,r.sessionId,r.tenantId].filter(e=>e).join("-")}function EC({type:r,error:e}){return r==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function BD(r){switch(r.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return EC(r);default:return!1}}/**
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
 */async function cD(r,e={}){return Ke(r,"GET","/v1/projects",e)}/**
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
 */const uD=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,lD=/^https?/;async function hD(r){if(r.config.emulator)return;const{authorizedDomains:e}=await cD(r);for(const t of e)try{if(fD(t))return}catch{}Vt(r,"unauthorized-domain")}function fD(r){const e=Ys(),{protocol:t,hostname:n}=new URL(e);if(r.startsWith("chrome-extension://")){const o=new URL(r);return o.hostname===""&&n===""?t==="chrome-extension:"&&r.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===n}if(!lD.test(t))return!1;if(uD.test(r))return n===r;const s=r.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(n)}/**
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
 */const CD=new Ei(3e4,6e4);function Fl(){const r=Le().___jsl;if(r!=null&&r.H){for(const e of Object.keys(r.H))if(r.H[e].r=r.H[e].r||[],r.H[e].L=r.H[e].L||[],r.H[e].r=[...r.H[e].L],r.CP)for(let t=0;t<r.CP.length;t++)r.CP[t]=null}}function dD(r){return new Promise((e,t)=>{var s,i,o;function n(){Fl(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Fl(),t(gt(r,"network-request-failed"))},timeout:CD.get()})}if((i=(s=Le().gapi)==null?void 0:s.iframes)!=null&&i.Iframe)e(gapi.iframes.getContext());else if((o=Le().gapi)!=null&&o.load)n();else{const B=Wf("iframefcb");return Le()[B]=()=>{gapi.load?n():t(gt(r,"network-request-failed"))},nc(`${CE()}?onload=${B}`).catch(c=>t(c))}}).catch(e=>{throw ho=null,e})}let ho=null;function pD(r){return ho=ho||dD(r),ho}/**
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
 */const gD=new Ei(5e3,15e3),mD="__/auth/iframe",ED="emulator/auth/iframe",_D={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},DD=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function ID(r){const e=r.config;q(e.authDomain,r,"auth-domain-config-required");const t=e.emulator?ec(e,ED):`https://${r.config.authDomain}/${mD}`,n={apiKey:e.apiKey,appName:r.name,v:Xr},s=DD.get(r.config.apiHost);s&&(n.eid=s);const i=r._getFrameworks();return i.length&&(n.fw=i.join(",")),`${t}?${$r(n).slice(1)}`}async function wD(r){const e=await pD(r),t=Le().gapi;return q(t,r,"internal-error"),e.open({where:document.body,url:ID(r),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:_D,dontclear:!0},n=>new Promise(async(s,i)=>{await n.restyle({setHideOnLeave:!1});const o=gt(r,"network-request-failed"),B=Le().setTimeout(()=>{i(o)},gD.get());function c(){Le().clearTimeout(B),s(n)}n.ping(c).then(c,()=>{i(o)})}))}/**
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
 */const yD={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},TD=500,AD=600,RD="_blank",vD="http://localhost";class kl{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function PD(r,e,t,n=TD,s=AD){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-n)/2,0).toString();let B="";const c={...yD,width:n.toString(),height:s.toString(),top:i,left:o},u=it().toLowerCase();t&&(B=Gf(u)?RD:t),xf(u)&&(e=e||vD,c.scrollbars="yes");const h=Object.entries(c).reduce((p,[I,R])=>`${p}${I}=${R},`,"");if(sE(u)&&B!=="_self")return SD(e||"",B),new kl(null);const C=window.open(e||"",B,h);q(C,r,"popup-blocked");try{C.focus()}catch{}return new kl(C)}function SD(r,e){const t=document.createElement("a");t.href=r,t.target=e;const n=document.createEvent("MouseEvent");n.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(n)}/**
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
 */const OD="__/auth/handler",ND="emulator/auth/handler",bD=encodeURIComponent("fac");async function Vl(r,e,t,n,s,i){q(r.config.authDomain,r,"auth-domain-config-required"),q(r.config.apiKey,r,"invalid-api-key");const o={apiKey:r.config.apiKey,appName:r.name,authType:t,redirectUrl:n,v:Xr,eventId:s};if(e instanceof Zr){e.setDefaultLanguage(r.languageCode),o.providerId=e.providerId||"",Ag(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[h,C]of Object.entries({}))o[h]=C}if(e instanceof es){const h=e.getScopes().filter(C=>C!=="");h.length>0&&(o.scopes=h.join(","))}r.tenantId&&(o.tid=r.tenantId);const B=o;for(const h of Object.keys(B))B[h]===void 0&&delete B[h];const c=await r._getAppCheckToken(),u=c?`#${bD}=${encodeURIComponent(c)}`:"";return`${LD(r)}?${$r(B).slice(1)}${u}`}function LD({config:r}){return r.emulator?ec(r,ND):`https://${r.authDomain}/${OD}`}/**
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
 */const aB="webStorageSupport";class FD{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=ic,this._completeRedirectFn=mC,this._overrideRedirectResult=Z_}async _openPopup(e,t,n,s){var o;fn((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const i=await Vl(e,t,n,Ys(),s);return PD(e,i,Zo())}async _openRedirect(e,t,n,s){await this._originValidation(e);const i=await Vl(e,t,n,Ys(),s);return R_(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(fn(i,"If manager is not set, promise should be"),i)}const n=this.initAndGetManager(e);return this.eventManagers[t]={promise:n},n.catch(()=>{delete this.eventManagers[t]}),n}async initAndGetManager(e){const t=await wD(e),n=new aD(e);return t.register("authEvent",s=>(q(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:n.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:n},this.iframes[e._key()]=t,n}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(aB,{type:aB},s=>{var o;const i=(o=s==null?void 0:s[0])==null?void 0:o[aB];i!==void 0&&t(!!i),Vt(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=hD(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return qf()||Mf()||tc()}}const kD=FD;var xl="@firebase/auth",Ml="1.13.5";/**
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
 */class VD{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(n=>{e((n==null?void 0:n.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){q(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function xD(r){switch(r){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function MD(r){Hr(new dr("auth",(e,{options:t})=>{const n=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:B}=n.options;q(o&&!o.includes(":"),"invalid-api-key",{appName:n.name});const c={apiKey:o,authDomain:B,clientPlatform:r,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Kf(r)},u=new uE(n,s,i,c);return TE(u,t),u},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,n)=>{e.getProvider("auth-internal").initialize()})),Hr(new dr("auth-internal",e=>{const t=Ye(e.getProvider("auth").getImmediate());return(n=>new VD(n))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Ln(xl,Ml,xD(r)),Ln(xl,Ml,"esm2020")}/**
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
 */const GD=300,UD=_f("authIdTokenMaxAge")||GD;let Gl=null;const HD=r=>async e=>{const t=e&&await e.getIdTokenResult(),n=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(n&&n>UD)return;const s=t==null?void 0:t.token;Gl!==s&&(Gl=s,await fetch(r,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function ae(r=yf()){const e=jo(r,"auth");if(e.isInitialized())return e.getImmediate();const t=yE(r,{popupRedirectResolver:kD,persistence:[lC,iC,ic]}),n=_f("authTokenSyncURL");if(n&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(n,location.origin);if(location.origin===i.origin){const o=HD(i.toString());__(t,o,()=>o(t.currentUser)),E_(t,B=>o(B))}}const s=mf("auth");return s&&AB(t,`http://${s}`),t}function JD(){var r;return((r=document.getElementsByTagName("head"))==null?void 0:r[0])??document}lE({loadJS(r){return new Promise((e,t)=>{const n=document.createElement("script");n.setAttribute("src",r),n.onload=e,n.onerror=s=>{const i=gt("internal-error");i.customData=s,t(i)},n.type="text/javascript",n.charset="UTF-8",JD().appendChild(n)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});MD("Browser");var Ul=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var kn,_C;(function(){var r;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(v,E){function D(){}D.prototype=E.prototype,v.F=E.prototype,v.prototype=new D,v.prototype.constructor=v,v.D=function(A,w,P){for(var _=Array(arguments.length-2),Ue=2;Ue<arguments.length;Ue++)_[Ue-2]=arguments[Ue];return E.prototype[w].apply(A,_)}}function t(){this.blockSize=-1}function n(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(n,t),n.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(v,E,D){D||(D=0);const A=Array(16);if(typeof E=="string")for(var w=0;w<16;++w)A[w]=E.charCodeAt(D++)|E.charCodeAt(D++)<<8|E.charCodeAt(D++)<<16|E.charCodeAt(D++)<<24;else for(w=0;w<16;++w)A[w]=E[D++]|E[D++]<<8|E[D++]<<16|E[D++]<<24;E=v.g[0],D=v.g[1],w=v.g[2];let P=v.g[3],_;_=E+(P^D&(w^P))+A[0]+3614090360&4294967295,E=D+(_<<7&4294967295|_>>>25),_=P+(w^E&(D^w))+A[1]+3905402710&4294967295,P=E+(_<<12&4294967295|_>>>20),_=w+(D^P&(E^D))+A[2]+606105819&4294967295,w=P+(_<<17&4294967295|_>>>15),_=D+(E^w&(P^E))+A[3]+3250441966&4294967295,D=w+(_<<22&4294967295|_>>>10),_=E+(P^D&(w^P))+A[4]+4118548399&4294967295,E=D+(_<<7&4294967295|_>>>25),_=P+(w^E&(D^w))+A[5]+1200080426&4294967295,P=E+(_<<12&4294967295|_>>>20),_=w+(D^P&(E^D))+A[6]+2821735955&4294967295,w=P+(_<<17&4294967295|_>>>15),_=D+(E^w&(P^E))+A[7]+4249261313&4294967295,D=w+(_<<22&4294967295|_>>>10),_=E+(P^D&(w^P))+A[8]+1770035416&4294967295,E=D+(_<<7&4294967295|_>>>25),_=P+(w^E&(D^w))+A[9]+2336552879&4294967295,P=E+(_<<12&4294967295|_>>>20),_=w+(D^P&(E^D))+A[10]+4294925233&4294967295,w=P+(_<<17&4294967295|_>>>15),_=D+(E^w&(P^E))+A[11]+2304563134&4294967295,D=w+(_<<22&4294967295|_>>>10),_=E+(P^D&(w^P))+A[12]+1804603682&4294967295,E=D+(_<<7&4294967295|_>>>25),_=P+(w^E&(D^w))+A[13]+4254626195&4294967295,P=E+(_<<12&4294967295|_>>>20),_=w+(D^P&(E^D))+A[14]+2792965006&4294967295,w=P+(_<<17&4294967295|_>>>15),_=D+(E^w&(P^E))+A[15]+1236535329&4294967295,D=w+(_<<22&4294967295|_>>>10),_=E+(w^P&(D^w))+A[1]+4129170786&4294967295,E=D+(_<<5&4294967295|_>>>27),_=P+(D^w&(E^D))+A[6]+3225465664&4294967295,P=E+(_<<9&4294967295|_>>>23),_=w+(E^D&(P^E))+A[11]+643717713&4294967295,w=P+(_<<14&4294967295|_>>>18),_=D+(P^E&(w^P))+A[0]+3921069994&4294967295,D=w+(_<<20&4294967295|_>>>12),_=E+(w^P&(D^w))+A[5]+3593408605&4294967295,E=D+(_<<5&4294967295|_>>>27),_=P+(D^w&(E^D))+A[10]+38016083&4294967295,P=E+(_<<9&4294967295|_>>>23),_=w+(E^D&(P^E))+A[15]+3634488961&4294967295,w=P+(_<<14&4294967295|_>>>18),_=D+(P^E&(w^P))+A[4]+3889429448&4294967295,D=w+(_<<20&4294967295|_>>>12),_=E+(w^P&(D^w))+A[9]+568446438&4294967295,E=D+(_<<5&4294967295|_>>>27),_=P+(D^w&(E^D))+A[14]+3275163606&4294967295,P=E+(_<<9&4294967295|_>>>23),_=w+(E^D&(P^E))+A[3]+4107603335&4294967295,w=P+(_<<14&4294967295|_>>>18),_=D+(P^E&(w^P))+A[8]+1163531501&4294967295,D=w+(_<<20&4294967295|_>>>12),_=E+(w^P&(D^w))+A[13]+2850285829&4294967295,E=D+(_<<5&4294967295|_>>>27),_=P+(D^w&(E^D))+A[2]+4243563512&4294967295,P=E+(_<<9&4294967295|_>>>23),_=w+(E^D&(P^E))+A[7]+1735328473&4294967295,w=P+(_<<14&4294967295|_>>>18),_=D+(P^E&(w^P))+A[12]+2368359562&4294967295,D=w+(_<<20&4294967295|_>>>12),_=E+(D^w^P)+A[5]+4294588738&4294967295,E=D+(_<<4&4294967295|_>>>28),_=P+(E^D^w)+A[8]+2272392833&4294967295,P=E+(_<<11&4294967295|_>>>21),_=w+(P^E^D)+A[11]+1839030562&4294967295,w=P+(_<<16&4294967295|_>>>16),_=D+(w^P^E)+A[14]+4259657740&4294967295,D=w+(_<<23&4294967295|_>>>9),_=E+(D^w^P)+A[1]+2763975236&4294967295,E=D+(_<<4&4294967295|_>>>28),_=P+(E^D^w)+A[4]+1272893353&4294967295,P=E+(_<<11&4294967295|_>>>21),_=w+(P^E^D)+A[7]+4139469664&4294967295,w=P+(_<<16&4294967295|_>>>16),_=D+(w^P^E)+A[10]+3200236656&4294967295,D=w+(_<<23&4294967295|_>>>9),_=E+(D^w^P)+A[13]+681279174&4294967295,E=D+(_<<4&4294967295|_>>>28),_=P+(E^D^w)+A[0]+3936430074&4294967295,P=E+(_<<11&4294967295|_>>>21),_=w+(P^E^D)+A[3]+3572445317&4294967295,w=P+(_<<16&4294967295|_>>>16),_=D+(w^P^E)+A[6]+76029189&4294967295,D=w+(_<<23&4294967295|_>>>9),_=E+(D^w^P)+A[9]+3654602809&4294967295,E=D+(_<<4&4294967295|_>>>28),_=P+(E^D^w)+A[12]+3873151461&4294967295,P=E+(_<<11&4294967295|_>>>21),_=w+(P^E^D)+A[15]+530742520&4294967295,w=P+(_<<16&4294967295|_>>>16),_=D+(w^P^E)+A[2]+3299628645&4294967295,D=w+(_<<23&4294967295|_>>>9),_=E+(w^(D|~P))+A[0]+4096336452&4294967295,E=D+(_<<6&4294967295|_>>>26),_=P+(D^(E|~w))+A[7]+1126891415&4294967295,P=E+(_<<10&4294967295|_>>>22),_=w+(E^(P|~D))+A[14]+2878612391&4294967295,w=P+(_<<15&4294967295|_>>>17),_=D+(P^(w|~E))+A[5]+4237533241&4294967295,D=w+(_<<21&4294967295|_>>>11),_=E+(w^(D|~P))+A[12]+1700485571&4294967295,E=D+(_<<6&4294967295|_>>>26),_=P+(D^(E|~w))+A[3]+2399980690&4294967295,P=E+(_<<10&4294967295|_>>>22),_=w+(E^(P|~D))+A[10]+4293915773&4294967295,w=P+(_<<15&4294967295|_>>>17),_=D+(P^(w|~E))+A[1]+2240044497&4294967295,D=w+(_<<21&4294967295|_>>>11),_=E+(w^(D|~P))+A[8]+1873313359&4294967295,E=D+(_<<6&4294967295|_>>>26),_=P+(D^(E|~w))+A[15]+4264355552&4294967295,P=E+(_<<10&4294967295|_>>>22),_=w+(E^(P|~D))+A[6]+2734768916&4294967295,w=P+(_<<15&4294967295|_>>>17),_=D+(P^(w|~E))+A[13]+1309151649&4294967295,D=w+(_<<21&4294967295|_>>>11),_=E+(w^(D|~P))+A[4]+4149444226&4294967295,E=D+(_<<6&4294967295|_>>>26),_=P+(D^(E|~w))+A[11]+3174756917&4294967295,P=E+(_<<10&4294967295|_>>>22),_=w+(E^(P|~D))+A[2]+718787259&4294967295,w=P+(_<<15&4294967295|_>>>17),_=D+(P^(w|~E))+A[9]+3951481745&4294967295,v.g[0]=v.g[0]+E&4294967295,v.g[1]=v.g[1]+(w+(_<<21&4294967295|_>>>11))&4294967295,v.g[2]=v.g[2]+w&4294967295,v.g[3]=v.g[3]+P&4294967295}n.prototype.v=function(v,E){E===void 0&&(E=v.length);const D=E-this.blockSize,A=this.C;let w=this.h,P=0;for(;P<E;){if(w==0)for(;P<=D;)s(this,v,P),P+=this.blockSize;if(typeof v=="string"){for(;P<E;)if(A[w++]=v.charCodeAt(P++),w==this.blockSize){s(this,A),w=0;break}}else for(;P<E;)if(A[w++]=v[P++],w==this.blockSize){s(this,A),w=0;break}}this.h=w,this.o+=E},n.prototype.A=function(){var v=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);v[0]=128;for(var E=1;E<v.length-8;++E)v[E]=0;E=this.o*8;for(var D=v.length-8;D<v.length;++D)v[D]=E&255,E/=256;for(this.v(v),v=Array(16),E=0,D=0;D<4;++D)for(let A=0;A<32;A+=8)v[E++]=this.g[D]>>>A&255;return v};function i(v,E){var D=B;return Object.prototype.hasOwnProperty.call(D,v)?D[v]:D[v]=E(v)}function o(v,E){this.h=E;const D=[];let A=!0;for(let w=v.length-1;w>=0;w--){const P=v[w]|0;A&&P==E||(D[w]=P,A=!1)}this.g=D}var B={};function c(v){return-128<=v&&v<128?i(v,function(E){return new o([E|0],E<0?-1:0)}):new o([v|0],v<0?-1:0)}function u(v){if(isNaN(v)||!isFinite(v))return C;if(v<0)return M(u(-v));const E=[];let D=1;for(let A=0;v>=D;A++)E[A]=v/D|0,D*=4294967296;return new o(E,0)}function h(v,E){if(v.length==0)throw Error("number format error: empty string");if(E=E||10,E<2||36<E)throw Error("radix out of range: "+E);if(v.charAt(0)=="-")return M(h(v.substring(1),E));if(v.indexOf("-")>=0)throw Error('number format error: interior "-" character');const D=u(Math.pow(E,8));let A=C;for(let P=0;P<v.length;P+=8){var w=Math.min(8,v.length-P);const _=parseInt(v.substring(P,P+w),E);w<8?(w=u(Math.pow(E,w)),A=A.j(w).add(u(_))):(A=A.j(D),A=A.add(u(_)))}return A}var C=c(0),p=c(1),I=c(16777216);r=o.prototype,r.m=function(){if(k(this))return-M(this).m();let v=0,E=1;for(let D=0;D<this.g.length;D++){const A=this.i(D);v+=(A>=0?A:4294967296+A)*E,E*=4294967296}return v},r.toString=function(v){if(v=v||10,v<2||36<v)throw Error("radix out of range: "+v);if(R(this))return"0";if(k(this))return"-"+M(this).toString(v);const E=u(Math.pow(v,6));var D=this;let A="";for(;;){const w=Se(D,E).g;D=z(D,w.j(E));let P=((D.g.length>0?D.g[0]:D.h)>>>0).toString(v);if(D=w,R(D))return P+A;for(;P.length<6;)P="0"+P;A=P+A}},r.i=function(v){return v<0?0:v<this.g.length?this.g[v]:this.h};function R(v){if(v.h!=0)return!1;for(let E=0;E<v.g.length;E++)if(v.g[E]!=0)return!1;return!0}function k(v){return v.h==-1}r.l=function(v){return v=z(this,v),k(v)?-1:R(v)?0:1};function M(v){const E=v.g.length,D=[];for(let A=0;A<E;A++)D[A]=~v.g[A];return new o(D,~v.h).add(p)}r.abs=function(){return k(this)?M(this):this},r.add=function(v){const E=Math.max(this.g.length,v.g.length),D=[];let A=0;for(let w=0;w<=E;w++){let P=A+(this.i(w)&65535)+(v.i(w)&65535),_=(P>>>16)+(this.i(w)>>>16)+(v.i(w)>>>16);A=_>>>16,P&=65535,_&=65535,D[w]=_<<16|P}return new o(D,D[D.length-1]&-2147483648?-1:0)};function z(v,E){return v.add(M(E))}r.j=function(v){if(R(this)||R(v))return C;if(k(this))return k(v)?M(this).j(M(v)):M(M(this).j(v));if(k(v))return M(this.j(M(v)));if(this.l(I)<0&&v.l(I)<0)return u(this.m()*v.m());const E=this.g.length+v.g.length,D=[];for(var A=0;A<2*E;A++)D[A]=0;for(A=0;A<this.g.length;A++)for(let w=0;w<v.g.length;w++){const P=this.i(A)>>>16,_=this.i(A)&65535,Ue=v.i(w)>>>16,Ot=v.i(w)&65535;D[2*A+2*w]+=_*Ot,re(D,2*A+2*w),D[2*A+2*w+1]+=P*Ot,re(D,2*A+2*w+1),D[2*A+2*w+1]+=_*Ue,re(D,2*A+2*w+1),D[2*A+2*w+2]+=P*Ue,re(D,2*A+2*w+2)}for(v=0;v<E;v++)D[v]=D[2*v+1]<<16|D[2*v];for(v=E;v<2*E;v++)D[v]=0;return new o(D,0)};function re(v,E){for(;(v[E]&65535)!=v[E];)v[E+1]+=v[E]>>>16,v[E]&=65535,E++}function pe(v,E){this.g=v,this.h=E}function Se(v,E){if(R(E))throw Error("division by zero");if(R(v))return new pe(C,C);if(k(v))return E=Se(M(v),E),new pe(M(E.g),M(E.h));if(k(E))return E=Se(v,M(E)),new pe(M(E.g),E.h);if(v.g.length>30){if(k(v)||k(E))throw Error("slowDivide_ only works with positive integers.");for(var D=p,A=E;A.l(v)<=0;)D=Oe(D),A=Oe(A);var w=Te(D,1),P=Te(A,1);for(A=Te(A,2),D=Te(D,2);!R(A);){var _=P.add(A);_.l(v)<=0&&(w=w.add(D),P=_),A=Te(A,1),D=Te(D,1)}return E=z(v,w.j(E)),new pe(w,E)}for(w=C;v.l(E)>=0;){for(D=Math.max(1,Math.floor(v.m()/E.m())),A=Math.ceil(Math.log(D)/Math.LN2),A=A<=48?1:Math.pow(2,A-48),P=u(D),_=P.j(E);k(_)||_.l(v)>0;)D-=A,P=u(D),_=P.j(E);R(P)&&(P=p),w=w.add(P),v=z(v,_)}return new pe(w,v)}r.B=function(v){return Se(this,v).h},r.and=function(v){const E=Math.max(this.g.length,v.g.length),D=[];for(let A=0;A<E;A++)D[A]=this.i(A)&v.i(A);return new o(D,this.h&v.h)},r.or=function(v){const E=Math.max(this.g.length,v.g.length),D=[];for(let A=0;A<E;A++)D[A]=this.i(A)|v.i(A);return new o(D,this.h|v.h)},r.xor=function(v){const E=Math.max(this.g.length,v.g.length),D=[];for(let A=0;A<E;A++)D[A]=this.i(A)^v.i(A);return new o(D,this.h^v.h)};function Oe(v){const E=v.g.length+1,D=[];for(let A=0;A<E;A++)D[A]=v.i(A)<<1|v.i(A-1)>>>31;return new o(D,v.h)}function Te(v,E){const D=E>>5;E%=32;const A=v.g.length-D,w=[];for(let P=0;P<A;P++)w[P]=E>0?v.i(P+D)>>>E|v.i(P+D+1)<<32-E:v.i(P+D);return new o(w,v.h)}n.prototype.digest=n.prototype.A,n.prototype.reset=n.prototype.u,n.prototype.update=n.prototype.v,_C=n,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.B,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=u,o.fromString=h,kn=o}).apply(typeof Ul<"u"?Ul:typeof self<"u"?self:typeof window<"u"?window:{});var Xi=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var DC,Ns,IC,fo,RB,wC,yC,TC;(function(){var r,e=Object.defineProperty;function t(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof Xi=="object"&&Xi];for(var l=0;l<a.length;++l){var f=a[l];if(f&&f.Math==Math)return f}throw Error("Cannot find global object")}var n=t(this);function s(a,l){if(l)e:{var f=n;a=a.split(".");for(var d=0;d<a.length-1;d++){var S=a[d];if(!(S in f))break e;f=f[S]}a=a[a.length-1],d=f[a],l=l(d),l!=d&&l!=null&&e(f,a,{configurable:!0,writable:!0,value:l})}}s("Symbol.dispose",function(a){return a||Symbol("Symbol.dispose")}),s("Array.prototype.values",function(a){return a||function(){return this[Symbol.iterator]()}}),s("Object.entries",function(a){return a||function(l){var f=[],d;for(d in l)Object.prototype.hasOwnProperty.call(l,d)&&f.push([d,l[d]]);return f}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var i=i||{},o=this||self;function B(a){var l=typeof a;return l=="object"&&a!=null||l=="function"}function c(a,l,f){return a.call.apply(a.bind,arguments)}function u(a,l,f){return u=c,u.apply(null,arguments)}function h(a,l){var f=Array.prototype.slice.call(arguments,1);return function(){var d=f.slice();return d.push.apply(d,arguments),a.apply(this,d)}}function C(a,l){function f(){}f.prototype=l.prototype,a.Z=l.prototype,a.prototype=new f,a.prototype.constructor=a,a.Ob=function(d,S,O){for(var j=Array(arguments.length-2),se=2;se<arguments.length;se++)j[se-2]=arguments[se];return l.prototype[S].apply(d,j)}}var p=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?a=>a&&AsyncContext.Snapshot.wrap(a):a=>a;function I(a){const l=a.length;if(l>0){const f=Array(l);for(let d=0;d<l;d++)f[d]=a[d];return f}return[]}function R(a,l){for(let d=1;d<arguments.length;d++){const S=arguments[d];var f=typeof S;if(f=f!="object"?f:S?Array.isArray(S)?"array":f:"null",f=="array"||f=="object"&&typeof S.length=="number"){f=a.length||0;const O=S.length||0;a.length=f+O;for(let j=0;j<O;j++)a[f+j]=S[j]}else a.push(S)}}class k{constructor(l,f){this.i=l,this.j=f,this.h=0,this.g=null}get(){let l;return this.h>0?(this.h--,l=this.g,this.g=l.next,l.next=null):l=this.i(),l}}function M(a){o.setTimeout(()=>{throw a},0)}function z(){var a=v;let l=null;return a.g&&(l=a.g,a.g=a.g.next,a.g||(a.h=null),l.next=null),l}class re{constructor(){this.h=this.g=null}add(l,f){const d=pe.get();d.set(l,f),this.h?this.h.next=d:this.g=d,this.h=d}}var pe=new k(()=>new Se,a=>a.reset());class Se{constructor(){this.next=this.g=this.h=null}set(l,f){this.h=l,this.g=f,this.next=null}reset(){this.next=this.g=this.h=null}}let Oe,Te=!1,v=new re,E=()=>{const a=Promise.resolve(void 0);Oe=()=>{a.then(D)}};function D(){for(var a;a=z();){try{a.h.call(a.g)}catch(f){M(f)}var l=pe;l.j(a),l.h<100&&(l.h++,a.next=l.g,l.g=a)}Te=!1}function A(){this.u=this.u,this.C=this.C}A.prototype.u=!1,A.prototype.dispose=function(){this.u||(this.u=!0,this.N())},A.prototype[Symbol.dispose]=function(){this.dispose()},A.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function w(a,l){this.type=a,this.g=this.target=l,this.defaultPrevented=!1}w.prototype.h=function(){this.defaultPrevented=!0};var P=(function(){if(!o.addEventListener||!Object.defineProperty)return!1;var a=!1,l=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const f=()=>{};o.addEventListener("test",f,l),o.removeEventListener("test",f,l)}catch{}return a})();function _(a){return/^[\s\xa0]*$/.test(a)}function Ue(a,l){w.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a&&this.init(a,l)}C(Ue,w),Ue.prototype.init=function(a,l){const f=this.type=a.type,d=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement,this.g=l,l=a.relatedTarget,l||(f=="mouseover"?l=a.fromElement:f=="mouseout"&&(l=a.toElement)),this.relatedTarget=l,d?(this.clientX=d.clientX!==void 0?d.clientX:d.pageX,this.clientY=d.clientY!==void 0?d.clientY:d.pageY,this.screenX=d.screenX||0,this.screenY=d.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=a.pointerType,this.state=a.state,this.i=a,a.defaultPrevented&&Ue.Z.h.call(this)},Ue.prototype.h=function(){Ue.Z.h.call(this);const a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var Ot="closure_listenable_"+(Math.random()*1e6|0),Ip=0;function wp(a,l,f,d,S){this.listener=a,this.proxy=null,this.src=l,this.type=f,this.capture=!!d,this.ha=S,this.key=++Ip,this.da=this.fa=!1}function Fi(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function ki(a,l,f){for(const d in a)l.call(f,a[d],d,a)}function yp(a,l){for(const f in a)l.call(void 0,a[f],f,a)}function ou(a){const l={};for(const f in a)l[f]=a[f];return l}const au="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Bu(a,l){let f,d;for(let S=1;S<arguments.length;S++){d=arguments[S];for(f in d)a[f]=d[f];for(let O=0;O<au.length;O++)f=au[O],Object.prototype.hasOwnProperty.call(d,f)&&(a[f]=d[f])}}function Vi(a){this.src=a,this.g={},this.h=0}Vi.prototype.add=function(a,l,f,d,S){const O=a.toString();a=this.g[O],a||(a=this.g[O]=[],this.h++);const j=Sa(a,l,d,S);return j>-1?(l=a[j],f||(l.fa=!1)):(l=new wp(l,this.src,O,!!d,S),l.fa=f,a.push(l)),l};function Pa(a,l){const f=l.type;if(f in a.g){var d=a.g[f],S=Array.prototype.indexOf.call(d,l,void 0),O;(O=S>=0)&&Array.prototype.splice.call(d,S,1),O&&(Fi(l),a.g[f].length==0&&(delete a.g[f],a.h--))}}function Sa(a,l,f,d){for(let S=0;S<a.length;++S){const O=a[S];if(!O.da&&O.listener==l&&O.capture==!!f&&O.ha==d)return S}return-1}var Oa="closure_lm_"+(Math.random()*1e6|0),Na={};function cu(a,l,f,d,S){if(Array.isArray(l)){for(let O=0;O<l.length;O++)cu(a,l[O],f,d,S);return null}return f=hu(f),a&&a[Ot]?a.J(l,f,B(d)?!!d.capture:!1,S):Tp(a,l,f,!1,d,S)}function Tp(a,l,f,d,S,O){if(!l)throw Error("Invalid event type");const j=B(S)?!!S.capture:!!S;let se=La(a);if(se||(a[Oa]=se=new Vi(a)),f=se.add(l,f,d,j,O),f.proxy)return f;if(d=Ap(),f.proxy=d,d.src=a,d.listener=f,a.addEventListener)P||(S=j),S===void 0&&(S=!1),a.addEventListener(l.toString(),d,S);else if(a.attachEvent)a.attachEvent(lu(l.toString()),d);else if(a.addListener&&a.removeListener)a.addListener(d);else throw Error("addEventListener and attachEvent are unavailable.");return f}function Ap(){function a(f){return l.call(a.src,a.listener,f)}const l=Rp;return a}function uu(a,l,f,d,S){if(Array.isArray(l))for(var O=0;O<l.length;O++)uu(a,l[O],f,d,S);else d=B(d)?!!d.capture:!!d,f=hu(f),a&&a[Ot]?(a=a.i,O=String(l).toString(),O in a.g&&(l=a.g[O],f=Sa(l,f,d,S),f>-1&&(Fi(l[f]),Array.prototype.splice.call(l,f,1),l.length==0&&(delete a.g[O],a.h--)))):a&&(a=La(a))&&(l=a.g[l.toString()],a=-1,l&&(a=Sa(l,f,d,S)),(f=a>-1?l[a]:null)&&ba(f))}function ba(a){if(typeof a!="number"&&a&&!a.da){var l=a.src;if(l&&l[Ot])Pa(l.i,a);else{var f=a.type,d=a.proxy;l.removeEventListener?l.removeEventListener(f,d,a.capture):l.detachEvent?l.detachEvent(lu(f),d):l.addListener&&l.removeListener&&l.removeListener(d),(f=La(l))?(Pa(f,a),f.h==0&&(f.src=null,l[Oa]=null)):Fi(a)}}}function lu(a){return a in Na?Na[a]:Na[a]="on"+a}function Rp(a,l){if(a.da)a=!0;else{l=new Ue(l,this);const f=a.listener,d=a.ha||a.src;a.fa&&ba(a),a=f.call(d,l)}return a}function La(a){return a=a[Oa],a instanceof Vi?a:null}var Fa="__closure_events_fn_"+(Math.random()*1e9>>>0);function hu(a){return typeof a=="function"?a:(a[Fa]||(a[Fa]=function(l){return a.handleEvent(l)}),a[Fa])}function et(){A.call(this),this.i=new Vi(this),this.M=this,this.G=null}C(et,A),et.prototype[Ot]=!0,et.prototype.removeEventListener=function(a,l,f,d){uu(this,a,l,f,d)};function at(a,l){var f,d=a.G;if(d)for(f=[];d;d=d.G)f.push(d);if(a=a.M,d=l.type||l,typeof l=="string")l=new w(l,a);else if(l instanceof w)l.target=l.target||a;else{var S=l;l=new w(d,a),Bu(l,S)}S=!0;let O,j;if(f)for(j=f.length-1;j>=0;j--)O=l.g=f[j],S=xi(O,d,!0,l)&&S;if(O=l.g=a,S=xi(O,d,!0,l)&&S,S=xi(O,d,!1,l)&&S,f)for(j=0;j<f.length;j++)O=l.g=f[j],S=xi(O,d,!1,l)&&S}et.prototype.N=function(){if(et.Z.N.call(this),this.i){var a=this.i;for(const l in a.g){const f=a.g[l];for(let d=0;d<f.length;d++)Fi(f[d]);delete a.g[l],a.h--}}this.G=null},et.prototype.J=function(a,l,f,d){return this.i.add(String(a),l,!1,f,d)},et.prototype.K=function(a,l,f,d){return this.i.add(String(a),l,!0,f,d)};function xi(a,l,f,d){if(l=a.i.g[String(l)],!l)return!0;l=l.concat();let S=!0;for(let O=0;O<l.length;++O){const j=l[O];if(j&&!j.da&&j.capture==f){const se=j.listener,He=j.ha||j.src;j.fa&&Pa(a.i,j),S=se.call(He,d)!==!1&&S}}return S&&!d.defaultPrevented}function vp(a,l){if(typeof a!="function")if(a&&typeof a.handleEvent=="function")a=u(a.handleEvent,a);else throw Error("Invalid listener argument");return Number(l)>2147483647?-1:o.setTimeout(a,l||0)}function fu(a){a.g=vp(()=>{a.g=null,a.i&&(a.i=!1,fu(a))},a.l);const l=a.h;a.h=null,a.m.apply(null,l)}class Pp extends A{constructor(l,f){super(),this.m=l,this.l=f,this.h=null,this.i=!1,this.g=null}j(l){this.h=arguments,this.g?this.i=!0:fu(this)}N(){super.N(),this.g&&(o.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function us(a){A.call(this),this.h=a,this.g={}}C(us,A);var Cu=[];function du(a){ki(a.g,function(l,f){this.g.hasOwnProperty(f)&&ba(l)},a),a.g={}}us.prototype.N=function(){us.Z.N.call(this),du(this)},us.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var ka=o.JSON.stringify,Sp=o.JSON.parse,Op=class{stringify(a){return o.JSON.stringify(a,void 0)}parse(a){return o.JSON.parse(a,void 0)}};function pu(){}function gu(){}var ls={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function Va(){w.call(this,"d")}C(Va,w);function xa(){w.call(this,"c")}C(xa,w);var tr={},mu=null;function Mi(){return mu=mu||new et}tr.Ia="serverreachability";function Eu(a){w.call(this,tr.Ia,a)}C(Eu,w);function hs(a){const l=Mi();at(l,new Eu(l))}tr.STAT_EVENT="statevent";function _u(a,l){w.call(this,tr.STAT_EVENT,a),this.stat=l}C(_u,w);function Bt(a){const l=Mi();at(l,new _u(l,a))}tr.Ja="timingevent";function Du(a,l){w.call(this,tr.Ja,a),this.size=l}C(Du,w);function fs(a,l){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return o.setTimeout(function(){a()},l)}function Cs(){this.g=!0}Cs.prototype.ua=function(){this.g=!1};function Np(a,l,f,d,S,O){a.info(function(){if(a.g)if(O){var j="",se=O.split("&");for(let ge=0;ge<se.length;ge++){var He=se[ge].split("=");if(He.length>1){const We=He[0];He=He[1];const Jt=We.split("_");j=Jt.length>=2&&Jt[1]=="type"?j+(We+"="+He+"&"):j+(We+"=redacted&")}}}else j=null;else j=O;return"XMLHTTP REQ ("+d+") [attempt "+S+"]: "+l+`
`+f+`
`+j})}function bp(a,l,f,d,S,O,j){a.info(function(){return"XMLHTTP RESP ("+d+") [ attempt "+S+"]: "+l+`
`+f+`
`+O+" "+j})}function yr(a,l,f,d){a.info(function(){return"XMLHTTP TEXT ("+l+"): "+Fp(a,f)+(d?" "+d:"")})}function Lp(a,l){a.info(function(){return"TIMEOUT: "+l})}Cs.prototype.info=function(){};function Fp(a,l){if(!a.g)return l;if(!l)return null;try{const O=JSON.parse(l);if(O){for(a=0;a<O.length;a++)if(Array.isArray(O[a])){var f=O[a];if(!(f.length<2)){var d=f[1];if(Array.isArray(d)&&!(d.length<1)){var S=d[0];if(S!="noop"&&S!="stop"&&S!="close")for(let j=1;j<d.length;j++)d[j]=""}}}}return ka(O)}catch{return l}}var Gi={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},Iu={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},wu;function Ma(){}C(Ma,pu),Ma.prototype.g=function(){return new XMLHttpRequest},wu=new Ma;function ds(a){return encodeURIComponent(String(a))}function kp(a){var l=1;a=a.split(":");const f=[];for(;l>0&&a.length;)f.push(a.shift()),l--;return a.length&&f.push(a.join(":")),f}function En(a,l,f,d){this.j=a,this.i=l,this.l=f,this.S=d||1,this.V=new us(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new yu}function yu(){this.i=null,this.g="",this.h=!1}var Tu={},Ga={};function Ua(a,l,f){a.M=1,a.A=Hi(Ht(l)),a.u=f,a.R=!0,Au(a,null)}function Au(a,l){a.F=Date.now(),Ui(a),a.B=Ht(a.A);var f=a.B,d=a.S;Array.isArray(d)||(d=[String(d)]),Mu(f.i,"t",d),a.C=0,f=a.j.L,a.h=new yu,a.g=rl(a.j,f?l:null,!a.u),a.P>0&&(a.O=new Pp(u(a.Y,a,a.g),a.P)),l=a.V,f=a.g,d=a.ba;var S="readystatechange";Array.isArray(S)||(S&&(Cu[0]=S.toString()),S=Cu);for(let O=0;O<S.length;O++){const j=cu(f,S[O],d||l.handleEvent,!1,l.h||l);if(!j)break;l.g[j.key]=j}l=a.J?ou(a.J):{},a.u?(a.v||(a.v="POST"),l["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.B,a.v,a.u,l)):(a.v="GET",a.g.ea(a.B,a.v,null,l)),hs(),Np(a.i,a.v,a.B,a.l,a.S,a.u)}En.prototype.ba=function(a){a=a.target;const l=this.O;l&&In(a)==3?l.j():this.Y(a)},En.prototype.Y=function(a){try{if(a==this.g)e:{const se=In(this.g),He=this.g.ya(),ge=this.g.ca();if(!(se<3)&&(se!=3||this.g&&(this.h.h||this.g.la()||Ku(this.g)))){this.K||se!=4||He==7||(He==8||ge<=0?hs(3):hs(2)),Ha(this);var l=this.g.ca();this.X=l;var f=Vp(this);if(this.o=l==200,bp(this.i,this.v,this.B,this.l,this.S,se,l),this.o){if(this.U&&!this.L){t:{if(this.g){var d,S=this.g;if((d=S.g?S.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!_(d)){var O=d;break t}}O=null}if(a=O)yr(this.i,this.l,a,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Ja(this,a);else{this.o=!1,this.m=3,Bt(12),nr(this),ps(this);break e}}if(this.R){a=!0;let We;for(;!this.K&&this.C<f.length;)if(We=xp(this,f),We==Ga){se==4&&(this.m=4,Bt(14),a=!1),yr(this.i,this.l,null,"[Incomplete Response]");break}else if(We==Tu){this.m=4,Bt(15),yr(this.i,this.l,f,"[Invalid Chunk]"),a=!1;break}else yr(this.i,this.l,We,null),Ja(this,We);if(Ru(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),se!=4||f.length!=0||this.h.h||(this.m=1,Bt(16),a=!1),this.o=this.o&&a,!a)yr(this.i,this.l,f,"[Invalid Chunked Response]"),nr(this),ps(this);else if(f.length>0&&!this.W){this.W=!0;var j=this.j;j.g==this&&j.aa&&!j.P&&(j.j.info("Great, no buffering proxy detected. Bytes received: "+f.length),Ya(j),j.P=!0,Bt(11))}}else yr(this.i,this.l,f,null),Ja(this,f);se==4&&nr(this),this.o&&!this.K&&(se==4?Zu(this.j,this):(this.o=!1,Ui(this)))}else Xp(this.g),l==400&&f.indexOf("Unknown SID")>0?(this.m=3,Bt(12)):(this.m=0,Bt(13)),nr(this),ps(this)}}}catch{}finally{}};function Vp(a){if(!Ru(a))return a.g.la();const l=Ku(a.g);if(l==="")return"";let f="";const d=l.length,S=In(a.g)==4;if(!a.h.i){if(typeof TextDecoder>"u")return nr(a),ps(a),"";a.h.i=new o.TextDecoder}for(let O=0;O<d;O++)a.h.h=!0,f+=a.h.i.decode(l[O],{stream:!(S&&O==d-1)});return l.length=0,a.h.g+=f,a.C=0,a.h.g}function Ru(a){return a.g?a.v=="GET"&&a.M!=2&&a.j.Aa:!1}function xp(a,l){var f=a.C,d=l.indexOf(`
`,f);return d==-1?Ga:(f=Number(l.substring(f,d)),isNaN(f)?Tu:(d+=1,d+f>l.length?Ga:(l=l.slice(d,d+f),a.C=d+f,l)))}En.prototype.cancel=function(){this.K=!0,nr(this)};function Ui(a){a.T=Date.now()+a.H,vu(a,a.H)}function vu(a,l){if(a.D!=null)throw Error("WatchDog timer not null");a.D=fs(u(a.aa,a),l)}function Ha(a){a.D&&(o.clearTimeout(a.D),a.D=null)}En.prototype.aa=function(){this.D=null;const a=Date.now();a-this.T>=0?(Lp(this.i,this.B),this.M!=2&&(hs(),Bt(17)),nr(this),this.m=2,ps(this)):vu(this,this.T-a)};function ps(a){a.j.I==0||a.K||Zu(a.j,a)}function nr(a){Ha(a);var l=a.O;l&&typeof l.dispose=="function"&&l.dispose(),a.O=null,du(a.V),a.g&&(l=a.g,a.g=null,l.abort(),l.dispose())}function Ja(a,l){try{var f=a.j;if(f.I!=0&&(f.g==a||ja(f.h,a))){if(!a.L&&ja(f.h,a)&&f.I==3){try{var d=f.Ba.g.parse(l)}catch{d=null}if(Array.isArray(d)&&d.length==3){var S=d;if(S[0]==0){e:if(!f.v){if(f.g)if(f.g.F+3e3<a.F)Wi(f),qi(f);else break e;$a(f),Bt(18)}}else f.xa=S[1],0<f.xa-f.K&&S[2]<37500&&f.F&&f.A==0&&!f.C&&(f.C=fs(u(f.Va,f),6e3));Ou(f.h)<=1&&f.ta&&(f.ta=void 0)}else sr(f,11)}else if((a.L||f.g==a)&&Wi(f),!_(l))for(S=f.Ba.g.parse(l),l=0;l<S.length;l++){let ge=S[l];const We=ge[0];if(!(We<=f.K))if(f.K=We,ge=ge[1],f.I==2)if(ge[0]=="c"){f.M=ge[1],f.ba=ge[2];const Jt=ge[3];Jt!=null&&(f.ka=Jt,f.j.info("VER="+f.ka));const ir=ge[4];ir!=null&&(f.za=ir,f.j.info("SVER="+f.za));const wn=ge[5];wn!=null&&typeof wn=="number"&&wn>0&&(d=1.5*wn,f.O=d,f.j.info("backChannelRequestTimeoutMs_="+d)),d=f;const yn=a.g;if(yn){const Qi=yn.g?yn.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Qi){var O=d.h;O.g||Qi.indexOf("spdy")==-1&&Qi.indexOf("quic")==-1&&Qi.indexOf("h2")==-1||(O.j=O.l,O.g=new Set,O.h&&(qa(O,O.h),O.h=null))}if(d.G){const Xa=yn.g?yn.g.getResponseHeader("X-HTTP-Session-Id"):null;Xa&&(d.wa=Xa,De(d.J,d.G,Xa))}}f.I=3,f.l&&f.l.ra(),f.aa&&(f.T=Date.now()-a.F,f.j.info("Handshake RTT: "+f.T+"ms")),d=f;var j=a;if(d.na=nl(d,d.L?d.ba:null,d.W),j.L){Nu(d.h,j);var se=j,He=d.O;He&&(se.H=He),se.D&&(Ha(se),Ui(se)),d.g=j}else Yu(d);f.i.length>0&&Ki(f)}else ge[0]!="stop"&&ge[0]!="close"||sr(f,7);else f.I==3&&(ge[0]=="stop"||ge[0]=="close"?ge[0]=="stop"?sr(f,7):Qa(f):ge[0]!="noop"&&f.l&&f.l.qa(ge),f.A=0)}}hs(4)}catch{}}var Mp=class{constructor(a,l){this.g=a,this.map=l}};function Pu(a){this.l=a||10,o.PerformanceNavigationTiming?(a=o.performance.getEntriesByType("navigation"),a=a.length>0&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(o.chrome&&o.chrome.loadTimes&&o.chrome.loadTimes()&&o.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Su(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function Ou(a){return a.h?1:a.g?a.g.size:0}function ja(a,l){return a.h?a.h==l:a.g?a.g.has(l):!1}function qa(a,l){a.g?a.g.add(l):a.h=l}function Nu(a,l){a.h&&a.h==l?a.h=null:a.g&&a.g.has(l)&&a.g.delete(l)}Pu.prototype.cancel=function(){if(this.i=bu(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function bu(a){if(a.h!=null)return a.i.concat(a.h.G);if(a.g!=null&&a.g.size!==0){let l=a.i;for(const f of a.g.values())l=l.concat(f.G);return l}return I(a.i)}var Lu=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Gp(a,l){if(a){a=a.split("&");for(let f=0;f<a.length;f++){const d=a[f].indexOf("=");let S,O=null;d>=0?(S=a[f].substring(0,d),O=a[f].substring(d+1)):S=a[f],l(S,O?decodeURIComponent(O.replace(/\+/g," ")):"")}}}function _n(a){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let l;a instanceof _n?(this.l=a.l,gs(this,a.j),this.o=a.o,this.g=a.g,ms(this,a.u),this.h=a.h,Ka(this,Gu(a.i)),this.m=a.m):a&&(l=String(a).match(Lu))?(this.l=!1,gs(this,l[1]||"",!0),this.o=Es(l[2]||""),this.g=Es(l[3]||"",!0),ms(this,l[4]),this.h=Es(l[5]||"",!0),Ka(this,l[6]||"",!0),this.m=Es(l[7]||"")):(this.l=!1,this.i=new Ds(null,this.l))}_n.prototype.toString=function(){const a=[];var l=this.j;l&&a.push(_s(l,Fu,!0),":");var f=this.g;return(f||l=="file")&&(a.push("//"),(l=this.o)&&a.push(_s(l,Fu,!0),"@"),a.push(ds(f).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),f=this.u,f!=null&&a.push(":",String(f))),(f=this.h)&&(this.g&&f.charAt(0)!="/"&&a.push("/"),a.push(_s(f,f.charAt(0)=="/"?Jp:Hp,!0))),(f=this.i.toString())&&a.push("?",f),(f=this.m)&&a.push("#",_s(f,qp)),a.join("")},_n.prototype.resolve=function(a){const l=Ht(this);let f=!!a.j;f?gs(l,a.j):f=!!a.o,f?l.o=a.o:f=!!a.g,f?l.g=a.g:f=a.u!=null;var d=a.h;if(f)ms(l,a.u);else if(f=!!a.h){if(d.charAt(0)!="/")if(this.g&&!this.h)d="/"+d;else{var S=l.h.lastIndexOf("/");S!=-1&&(d=l.h.slice(0,S+1)+d)}if(S=d,S==".."||S==".")d="";else if(S.indexOf("./")!=-1||S.indexOf("/.")!=-1){d=S.lastIndexOf("/",0)==0,S=S.split("/");const O=[];for(let j=0;j<S.length;){const se=S[j++];se=="."?d&&j==S.length&&O.push(""):se==".."?((O.length>1||O.length==1&&O[0]!="")&&O.pop(),d&&j==S.length&&O.push("")):(O.push(se),d=!0)}d=O.join("/")}else d=S}return f?l.h=d:f=a.i.toString()!=="",f?Ka(l,Gu(a.i)):f=!!a.m,f&&(l.m=a.m),l};function Ht(a){return new _n(a)}function gs(a,l,f){a.j=f?Es(l,!0):l,a.j&&(a.j=a.j.replace(/:$/,""))}function ms(a,l){if(l){if(l=Number(l),isNaN(l)||l<0)throw Error("Bad port number "+l);a.u=l}else a.u=null}function Ka(a,l,f){l instanceof Ds?(a.i=l,Kp(a.i,a.l)):(f||(l=_s(l,jp)),a.i=new Ds(l,a.l))}function De(a,l,f){a.i.set(l,f)}function Hi(a){return De(a,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),a}function Es(a,l){return a?l?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function _s(a,l,f){return typeof a=="string"?(a=encodeURI(a).replace(l,Up),f&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function Up(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var Fu=/[#\/\?@]/g,Hp=/[#\?:]/g,Jp=/[#\?]/g,jp=/[#\?@]/g,qp=/#/g;function Ds(a,l){this.h=this.g=null,this.i=a||null,this.j=!!l}function rr(a){a.g||(a.g=new Map,a.h=0,a.i&&Gp(a.i,function(l,f){a.add(decodeURIComponent(l.replace(/\+/g," ")),f)}))}r=Ds.prototype,r.add=function(a,l){rr(this),this.i=null,a=Tr(this,a);let f=this.g.get(a);return f||this.g.set(a,f=[]),f.push(l),this.h+=1,this};function ku(a,l){rr(a),l=Tr(a,l),a.g.has(l)&&(a.i=null,a.h-=a.g.get(l).length,a.g.delete(l))}function Vu(a,l){return rr(a),l=Tr(a,l),a.g.has(l)}r.forEach=function(a,l){rr(this),this.g.forEach(function(f,d){f.forEach(function(S){a.call(l,S,d,this)},this)},this)};function xu(a,l){rr(a);let f=[];if(typeof l=="string")Vu(a,l)&&(f=f.concat(a.g.get(Tr(a,l))));else for(a=Array.from(a.g.values()),l=0;l<a.length;l++)f=f.concat(a[l]);return f}r.set=function(a,l){return rr(this),this.i=null,a=Tr(this,a),Vu(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[l]),this.h+=1,this},r.get=function(a,l){return a?(a=xu(this,a),a.length>0?String(a[0]):l):l};function Mu(a,l,f){ku(a,l),f.length>0&&(a.i=null,a.g.set(Tr(a,l),I(f)),a.h+=f.length)}r.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],l=Array.from(this.g.keys());for(let d=0;d<l.length;d++){var f=l[d];const S=ds(f);f=xu(this,f);for(let O=0;O<f.length;O++){let j=S;f[O]!==""&&(j+="="+ds(f[O])),a.push(j)}}return this.i=a.join("&")};function Gu(a){const l=new Ds;return l.i=a.i,a.g&&(l.g=new Map(a.g),l.h=a.h),l}function Tr(a,l){return l=String(l),a.j&&(l=l.toLowerCase()),l}function Kp(a,l){l&&!a.j&&(rr(a),a.i=null,a.g.forEach(function(f,d){const S=d.toLowerCase();d!=S&&(ku(this,d),Mu(this,S,f))},a)),a.j=l}function Wp(a,l){const f=new Cs;if(o.Image){const d=new Image;d.onload=h(Dn,f,"TestLoadImage: loaded",!0,l,d),d.onerror=h(Dn,f,"TestLoadImage: error",!1,l,d),d.onabort=h(Dn,f,"TestLoadImage: abort",!1,l,d),d.ontimeout=h(Dn,f,"TestLoadImage: timeout",!1,l,d),o.setTimeout(function(){d.ontimeout&&d.ontimeout()},1e4),d.src=a}else l(!1)}function zp(a,l){const f=new Cs,d=new AbortController,S=setTimeout(()=>{d.abort(),Dn(f,"TestPingServer: timeout",!1,l)},1e4);fetch(a,{signal:d.signal}).then(O=>{clearTimeout(S),O.ok?Dn(f,"TestPingServer: ok",!0,l):Dn(f,"TestPingServer: server error",!1,l)}).catch(()=>{clearTimeout(S),Dn(f,"TestPingServer: error",!1,l)})}function Dn(a,l,f,d,S){try{S&&(S.onload=null,S.onerror=null,S.onabort=null,S.ontimeout=null),d(f)}catch{}}function Qp(){this.g=new Op}function Wa(a){this.i=a.Sb||null,this.h=a.ab||!1}C(Wa,pu),Wa.prototype.g=function(){return new Ji(this.i,this.h)};function Ji(a,l){et.call(this),this.H=a,this.o=l,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}C(Ji,et),r=Ji.prototype,r.open=function(a,l){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=a,this.D=l,this.readyState=1,ws(this)},r.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const l={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};a&&(l.body=a),(this.H||o).fetch(new Request(this.D,l)).then(this.Pa.bind(this),this.ga.bind(this))},r.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,Is(this)),this.readyState=0},r.Pa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,ws(this)),this.g&&(this.readyState=3,ws(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof o.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Uu(this)}else a.text().then(this.Oa.bind(this),this.ga.bind(this))};function Uu(a){a.j.read().then(a.Ma.bind(a)).catch(a.ga.bind(a))}r.Ma=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var l=a.value?a.value:new Uint8Array(0);(l=this.B.decode(l,{stream:!a.done}))&&(this.response=this.responseText+=l)}a.done?Is(this):ws(this),this.readyState==3&&Uu(this)}},r.Oa=function(a){this.g&&(this.response=this.responseText=a,Is(this))},r.Na=function(a){this.g&&(this.response=a,Is(this))},r.ga=function(){this.g&&Is(this)};function Is(a){a.readyState=4,a.l=null,a.j=null,a.B=null,ws(a)}r.setRequestHeader=function(a,l){this.A.append(a,l)},r.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},r.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],l=this.h.entries();for(var f=l.next();!f.done;)f=f.value,a.push(f[0]+": "+f[1]),f=l.next();return a.join(`\r
`)};function ws(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(Ji.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function Hu(a){let l="";return ki(a,function(f,d){l+=d,l+=":",l+=f,l+=`\r
`}),l}function za(a,l,f){e:{for(d in f){var d=!1;break e}d=!0}d||(f=Hu(f),typeof a=="string"?f!=null&&ds(f):De(a,l,f))}function Pe(a){et.call(this),this.headers=new Map,this.L=a||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}C(Pe,et);var $p=/^https?$/i,Yp=["POST","PUT"];r=Pe.prototype,r.Fa=function(a){this.H=a},r.ea=function(a,l,f,d){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);l=l?l.toUpperCase():"GET",this.D=a,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():wu.g(),this.g.onreadystatechange=p(u(this.Ca,this));try{this.B=!0,this.g.open(l,String(a),!0),this.B=!1}catch(O){Ju(this,O);return}if(a=f||"",f=new Map(this.headers),d)if(Object.getPrototypeOf(d)===Object.prototype)for(var S in d)f.set(S,d[S]);else if(typeof d.keys=="function"&&typeof d.get=="function")for(const O of d.keys())f.set(O,d.get(O));else throw Error("Unknown input type for opt_headers: "+String(d));d=Array.from(f.keys()).find(O=>O.toLowerCase()=="content-type"),S=o.FormData&&a instanceof o.FormData,!(Array.prototype.indexOf.call(Yp,l,void 0)>=0)||d||S||f.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[O,j]of f)this.g.setRequestHeader(O,j);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(a),this.v=!1}catch(O){Ju(this,O)}};function Ju(a,l){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=l,a.o=5,ju(a),ji(a)}function ju(a){a.A||(a.A=!0,at(a,"complete"),at(a,"error"))}r.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=a||7,at(this,"complete"),at(this,"abort"),ji(this))},r.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),ji(this,!0)),Pe.Z.N.call(this)},r.Ca=function(){this.u||(this.B||this.v||this.j?qu(this):this.Xa())},r.Xa=function(){qu(this)};function qu(a){if(a.h&&typeof i<"u"){if(a.v&&In(a)==4)setTimeout(a.Ca.bind(a),0);else if(at(a,"readystatechange"),In(a)==4){a.h=!1;try{const O=a.ca();e:switch(O){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var l=!0;break e;default:l=!1}var f;if(!(f=l)){var d;if(d=O===0){let j=String(a.D).match(Lu)[1]||null;!j&&o.self&&o.self.location&&(j=o.self.location.protocol.slice(0,-1)),d=!$p.test(j?j.toLowerCase():"")}f=d}if(f)at(a,"complete"),at(a,"success");else{a.o=6;try{var S=In(a)>2?a.g.statusText:""}catch{S=""}a.l=S+" ["+a.ca()+"]",ju(a)}}finally{ji(a)}}}}function ji(a,l){if(a.g){a.m&&(clearTimeout(a.m),a.m=null);const f=a.g;a.g=null,l||at(a,"ready");try{f.onreadystatechange=null}catch{}}}r.isActive=function(){return!!this.g};function In(a){return a.g?a.g.readyState:0}r.ca=function(){try{return In(this)>2?this.g.status:-1}catch{return-1}},r.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},r.La=function(a){if(this.g){var l=this.g.responseText;return a&&l.indexOf(a)==0&&(l=l.substring(a.length)),Sp(l)}};function Ku(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.F){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function Xp(a){const l={};a=(a.g&&In(a)>=2&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let d=0;d<a.length;d++){if(_(a[d]))continue;var f=kp(a[d]);const S=f[0];if(f=f[1],typeof f!="string")continue;f=f.trim();const O=l[S]||[];l[S]=O,O.push(f)}yp(l,function(d){return d.join(", ")})}r.ya=function(){return this.o},r.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function ys(a,l,f){return f&&f.internalChannelParams&&f.internalChannelParams[a]||l}function Wu(a){this.za=0,this.i=[],this.j=new Cs,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=ys("failFast",!1,a),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=ys("baseRetryDelayMs",5e3,a),this.Za=ys("retryDelaySeedMs",1e4,a),this.Ta=ys("forwardChannelMaxRetries",2,a),this.va=ys("forwardChannelRequestTimeoutMs",2e4,a),this.ma=a&&a.xmlHttpFactory||void 0,this.Ua=a&&a.Rb||void 0,this.Aa=a&&a.useFetchStreams||!1,this.O=void 0,this.L=a&&a.supportsCrossDomainXhr||!1,this.M="",this.h=new Pu(a&&a.concurrentRequestLimit),this.Ba=new Qp,this.S=a&&a.fastHandshake||!1,this.R=a&&a.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=a&&a.Pb||!1,a&&a.ua&&this.j.ua(),a&&a.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&a&&a.detectBufferingProxy||!1,this.ia=void 0,a&&a.longPollingTimeout&&a.longPollingTimeout>0&&(this.ia=a.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}r=Wu.prototype,r.ka=8,r.I=1,r.connect=function(a,l,f,d){Bt(0),this.W=a,this.H=l||{},f&&d!==void 0&&(this.H.OSID=f,this.H.OAID=d),this.F=this.X,this.J=nl(this,null,this.W),Ki(this)};function Qa(a){if(zu(a),a.I==3){var l=a.V++,f=Ht(a.J);if(De(f,"SID",a.M),De(f,"RID",l),De(f,"TYPE","terminate"),Ts(a,f),l=new En(a,a.j,l),l.M=2,l.A=Hi(Ht(f)),f=!1,o.navigator&&o.navigator.sendBeacon)try{f=o.navigator.sendBeacon(l.A.toString(),"")}catch{}!f&&o.Image&&(new Image().src=l.A,f=!0),f||(l.g=rl(l.j,null),l.g.ea(l.A)),l.F=Date.now(),Ui(l)}tl(a)}function qi(a){a.g&&(Ya(a),a.g.cancel(),a.g=null)}function zu(a){qi(a),a.v&&(o.clearTimeout(a.v),a.v=null),Wi(a),a.h.cancel(),a.m&&(typeof a.m=="number"&&o.clearTimeout(a.m),a.m=null)}function Ki(a){if(!Su(a.h)&&!a.m){a.m=!0;var l=a.Ea;Oe||E(),Te||(Oe(),Te=!0),v.add(l,a),a.D=0}}function Zp(a,l){return Ou(a.h)>=a.h.j-(a.m?1:0)?!1:a.m?(a.i=l.G.concat(a.i),!0):a.I==1||a.I==2||a.D>=(a.Sa?0:a.Ta)?!1:(a.m=fs(u(a.Ea,a,l),el(a,a.D)),a.D++,!0)}r.Ea=function(a){if(this.m)if(this.m=null,this.I==1){if(!a){this.V=Math.floor(Math.random()*1e5),a=this.V++;const S=new En(this,this.j,a);let O=this.o;if(this.U&&(O?(O=ou(O),Bu(O,this.U)):O=this.U),this.u!==null||this.R||(S.J=O,O=null),this.S)e:{for(var l=0,f=0;f<this.i.length;f++){t:{var d=this.i[f];if("__data__"in d.map&&(d=d.map.__data__,typeof d=="string")){d=d.length;break t}d=void 0}if(d===void 0)break;if(l+=d,l>4096){l=f;break e}if(l===4096||f===this.i.length-1){l=f+1;break e}}l=1e3}else l=1e3;l=$u(this,S,l),f=Ht(this.J),De(f,"RID",a),De(f,"CVER",22),this.G&&De(f,"X-HTTP-Session-Id",this.G),Ts(this,f),O&&(this.R?l="headers="+ds(Hu(O))+"&"+l:this.u&&za(f,this.u,O)),qa(this.h,S),this.Ra&&De(f,"TYPE","init"),this.S?(De(f,"$req",l),De(f,"SID","null"),S.U=!0,Ua(S,f,null)):Ua(S,f,l),this.I=2}}else this.I==3&&(a?Qu(this,a):this.i.length==0||Su(this.h)||Qu(this))};function Qu(a,l){var f;l?f=l.l:f=a.V++;const d=Ht(a.J);De(d,"SID",a.M),De(d,"RID",f),De(d,"AID",a.K),Ts(a,d),a.u&&a.o&&za(d,a.u,a.o),f=new En(a,a.j,f,a.D+1),a.u===null&&(f.J=a.o),l&&(a.i=l.G.concat(a.i)),l=$u(a,f,1e3),f.H=Math.round(a.va*.5)+Math.round(a.va*.5*Math.random()),qa(a.h,f),Ua(f,d,l)}function Ts(a,l){a.H&&ki(a.H,function(f,d){De(l,d,f)}),a.l&&ki({},function(f,d){De(l,d,f)})}function $u(a,l,f){f=Math.min(a.i.length,f);const d=a.l?u(a.l.Ka,a.l,a):null;e:{var S=a.i;let se=-1;for(;;){const He=["count="+f];se==-1?f>0?(se=S[0].g,He.push("ofs="+se)):se=0:He.push("ofs="+se);let ge=!0;for(let We=0;We<f;We++){var O=S[We].g;const Jt=S[We].map;if(O-=se,O<0)se=Math.max(0,S[We].g-100),ge=!1;else try{O="req"+O+"_"||"";try{var j=Jt instanceof Map?Jt:Object.entries(Jt);for(const[ir,wn]of j){let yn=wn;B(wn)&&(yn=ka(wn)),He.push(O+ir+"="+encodeURIComponent(yn))}}catch(ir){throw He.push(O+"type="+encodeURIComponent("_badmap")),ir}}catch{d&&d(Jt)}}if(ge){j=He.join("&");break e}}j=void 0}return a=a.i.splice(0,f),l.G=a,j}function Yu(a){if(!a.g&&!a.v){a.Y=1;var l=a.Da;Oe||E(),Te||(Oe(),Te=!0),v.add(l,a),a.A=0}}function $a(a){return a.g||a.v||a.A>=3?!1:(a.Y++,a.v=fs(u(a.Da,a),el(a,a.A)),a.A++,!0)}r.Da=function(){if(this.v=null,Xu(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var a=4*this.T;this.j.info("BP detection timer enabled: "+a),this.B=fs(u(this.Wa,this),a)}},r.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,Bt(10),qi(this),Xu(this))};function Ya(a){a.B!=null&&(o.clearTimeout(a.B),a.B=null)}function Xu(a){a.g=new En(a,a.j,"rpc",a.Y),a.u===null&&(a.g.J=a.o),a.g.P=0;var l=Ht(a.na);De(l,"RID","rpc"),De(l,"SID",a.M),De(l,"AID",a.K),De(l,"CI",a.F?"0":"1"),!a.F&&a.ia&&De(l,"TO",a.ia),De(l,"TYPE","xmlhttp"),Ts(a,l),a.u&&a.o&&za(l,a.u,a.o),a.O&&(a.g.H=a.O);var f=a.g;a=a.ba,f.M=1,f.A=Hi(Ht(l)),f.u=null,f.R=!0,Au(f,a)}r.Va=function(){this.C!=null&&(this.C=null,qi(this),$a(this),Bt(19))};function Wi(a){a.C!=null&&(o.clearTimeout(a.C),a.C=null)}function Zu(a,l){var f=null;if(a.g==l){Wi(a),Ya(a),a.g=null;var d=2}else if(ja(a.h,l))f=l.G,Nu(a.h,l),d=1;else return;if(a.I!=0){if(l.o)if(d==1){f=l.u?l.u.length:0,l=Date.now()-l.F;var S=a.D;d=Mi(),at(d,new Du(d,f)),Ki(a)}else Yu(a);else if(S=l.m,S==3||S==0&&l.X>0||!(d==1&&Zp(a,l)||d==2&&$a(a)))switch(f&&f.length>0&&(l=a.h,l.i=l.i.concat(f)),S){case 1:sr(a,5);break;case 4:sr(a,10);break;case 3:sr(a,6);break;default:sr(a,2)}}}function el(a,l){let f=a.Qa+Math.floor(Math.random()*a.Za);return a.isActive()||(f*=2),f*l}function sr(a,l){if(a.j.info("Error code "+l),l==2){var f=u(a.bb,a),d=a.Ua;const S=!d;d=new _n(d||"//www.google.com/images/cleardot.gif"),o.location&&o.location.protocol=="http"||gs(d,"https"),Hi(d),S?Wp(d.toString(),f):zp(d.toString(),f)}else Bt(2);a.I=0,a.l&&a.l.pa(l),tl(a),zu(a)}r.bb=function(a){a?(this.j.info("Successfully pinged google.com"),Bt(2)):(this.j.info("Failed to ping google.com"),Bt(1))};function tl(a){if(a.I=0,a.ja=[],a.l){const l=bu(a.h);(l.length!=0||a.i.length!=0)&&(R(a.ja,l),R(a.ja,a.i),a.h.i.length=0,I(a.i),a.i.length=0),a.l.oa()}}function nl(a,l,f){var d=f instanceof _n?Ht(f):new _n(f);if(d.g!="")l&&(d.g=l+"."+d.g),ms(d,d.u);else{var S=o.location;d=S.protocol,l=l?l+"."+S.hostname:S.hostname,S=+S.port;const O=new _n(null);d&&gs(O,d),l&&(O.g=l),S&&ms(O,S),f&&(O.h=f),d=O}return f=a.G,l=a.wa,f&&l&&De(d,f,l),De(d,"VER",a.ka),Ts(a,d),d}function rl(a,l,f){if(l&&!a.L)throw Error("Can't create secondary domain capable XhrIo object.");return l=a.Aa&&!a.ma?new Pe(new Wa({ab:f})):new Pe(a.ma),l.Fa(a.L),l}r.isActive=function(){return!!this.l&&this.l.isActive(this)};function sl(){}r=sl.prototype,r.ra=function(){},r.qa=function(){},r.pa=function(){},r.oa=function(){},r.isActive=function(){return!0},r.Ka=function(){};function zi(){}zi.prototype.g=function(a,l){return new It(a,l)};function It(a,l){et.call(this),this.g=new Wu(l),this.l=a,this.h=l&&l.messageUrlParams||null,a=l&&l.messageHeaders||null,l&&l.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=l&&l.initMessageHeaders||null,l&&l.messageContentType&&(a?a["X-WebChannel-Content-Type"]=l.messageContentType:a={"X-WebChannel-Content-Type":l.messageContentType}),l&&l.sa&&(a?a["X-WebChannel-Client-Profile"]=l.sa:a={"X-WebChannel-Client-Profile":l.sa}),this.g.U=a,(a=l&&l.Qb)&&!_(a)&&(this.g.u=a),this.A=l&&l.supportsCrossDomainXhr||!1,this.v=l&&l.sendRawJson||!1,(l=l&&l.httpSessionIdParam)&&!_(l)&&(this.g.G=l,a=this.h,a!==null&&l in a&&(a=this.h,l in a&&delete a[l])),this.j=new Ar(this)}C(It,et),It.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},It.prototype.close=function(){Qa(this.g)},It.prototype.o=function(a){var l=this.g;if(typeof a=="string"){var f={};f.__data__=a,a=f}else this.v&&(f={},f.__data__=ka(a),a=f);l.i.push(new Mp(l.Ya++,a)),l.I==3&&Ki(l)},It.prototype.N=function(){this.g.l=null,delete this.j,Qa(this.g),delete this.g,It.Z.N.call(this)};function il(a){Va.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var l=a.__sm__;if(l){e:{for(const f in l){a=f;break e}a=void 0}(this.i=a)&&(a=this.i,l=l!==null&&a in l?l[a]:void 0),this.data=l}else this.data=a}C(il,Va);function ol(){xa.call(this),this.status=1}C(ol,xa);function Ar(a){this.g=a}C(Ar,sl),Ar.prototype.ra=function(){at(this.g,"a")},Ar.prototype.qa=function(a){at(this.g,new il(a))},Ar.prototype.pa=function(a){at(this.g,new ol)},Ar.prototype.oa=function(){at(this.g,"b")},zi.prototype.createWebChannel=zi.prototype.g,It.prototype.send=It.prototype.o,It.prototype.open=It.prototype.m,It.prototype.close=It.prototype.close,TC=function(){return new zi},yC=function(){return Mi()},wC=tr,RB={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Gi.NO_ERROR=0,Gi.TIMEOUT=8,Gi.HTTP_ERROR=6,fo=Gi,Iu.COMPLETE="complete",IC=Iu,gu.EventType=ls,ls.OPEN="a",ls.CLOSE="b",ls.ERROR="c",ls.MESSAGE="d",et.prototype.listen=et.prototype.J,Ns=gu,Pe.prototype.listenOnce=Pe.prototype.K,Pe.prototype.getLastError=Pe.prototype.Ha,Pe.prototype.getLastErrorCode=Pe.prototype.ya,Pe.prototype.getStatus=Pe.prototype.ca,Pe.prototype.getResponseJson=Pe.prototype.La,Pe.prototype.getResponseText=Pe.prototype.la,Pe.prototype.send=Pe.prototype.ea,Pe.prototype.setWithCredentials=Pe.prototype.Fa,DC=Pe}).apply(typeof Xi<"u"?Xi:typeof self<"u"?self:typeof window<"u"?window:{});/*!
* re2js
* RE2JS is the JavaScript port of RE2, a regular expression engine that provides linear time matching
*
* @version v2.8.6
* @author Oleksii Vasyliev
* @homepage https://github.com/le0pard/re2js#readme
* @repository github:le0pard/re2js
* @license MIT
*/var me,x=(me=class{},G(me,"FOLD_CASE",1),G(me,"LITERAL",2),G(me,"CLASS_NL",4),G(me,"DOT_NL",8),G(me,"ONE_LINE",16),G(me,"NON_GREEDY",32),G(me,"PERL_X",64),G(me,"UNICODE_GROUPS",128),G(me,"WAS_DOLLAR",256),G(me,"LOOKBEHIND",512),G(me,"MATCH_NL",me.CLASS_NL|me.DOT_NL),G(me,"PERL",me.CLASS_NL|me.ONE_LINE|me.PERL_X|me.UNICODE_GROUPS),G(me,"POSIX",0),G(me,"UNANCHORED",0),G(me,"ANCHOR_START",1),G(me,"ANCHOR_BOTH",2),me);const Rr={CASE_INSENSITIVE:1,DOTALL:2,MULTILINE:4,DISABLE_UNICODE_GROUPS:8,LONGEST_MATCH:16,LOOKBEHINDS:512},ei=128,vB=new Int32Array(ei),PB=new Int32Array(ei),Zi=65535;for(let r=0;r<ei;r++)r>=97&&r<=122?vB[r]=r-32:vB[r]=r,r>=65&&r<=90?PB[r]=r+32:PB[r]=r;var mB,N=(mB=class{static toUpperCase(r){if(r<ei)return vB[r];const e=String.fromCodePoint(r).toUpperCase(),t=e.codePointAt(0)>Zi?2:1;if(e.length>t)return r;const n=String.fromCodePoint(e.codePointAt(0)).toLowerCase(),s=n.codePointAt(0)>Zi?2:1;return n.length>s||n.codePointAt(0)!==r?r:e.codePointAt(0)}static toLowerCase(r){if(r<ei)return PB[r];const e=String.fromCodePoint(r).toLowerCase(),t=e.codePointAt(0)>Zi?2:1;if(e.length>t)return r;const n=String.fromCodePoint(e.codePointAt(0)).toUpperCase(),s=n.codePointAt(0)>Zi?2:1;return n.length>s||n.codePointAt(0)!==r?r:e.codePointAt(0)}},G(mB,"CODES",new Map([["\x07",7],["\b",8],["	",9],[`
`,10],["\v",11],["\f",12],["\r",13],[" ",32],['"',34],["$",36],["&",38],["'",39],["(",40],[")",41],["*",42],["+",43],["-",45],[".",46],["0",48],["1",49],["2",50],["3",51],["4",52],["5",53],["6",54],["7",55],["8",56],["9",57],[":",58],["<",60],[">",62],["?",63],["A",65],["B",66],["C",67],["F",70],["P",80],["Q",81],["U",85],["Z",90],["[",91],["\\",92],["]",93],["^",94],["_",95],["`",96],["a",97],["b",98],["f",102],["i",105],["m",109],["n",110],["r",114],["s",115],["t",116],["v",118],["x",120],["z",122],["{",123],["|",124],["}",125]])),mB),g=class{constructor(r,e=!1){this.data=r,this.isStride1=e,this.SIZE=e?2:3}getLo(r){return this.data[r*this.SIZE]}getHi(r){return this.data[r*this.SIZE+1]}getStride(r){return this.isStride1?1:this.data[r*this.SIZE+2]}get length(){return this.data.length/this.SIZE}};const AC=new Uint8Array(256);for(let r=0,e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-";r<64;r++)AC[e.charCodeAt(r)]=r;const RC=r=>{const e=[];let t=0,n=0;for(let s=0;s<r.length;s++){let i=AC[r.charCodeAt(s)];t|=(i&31)<<n,(i&32)===0?(e.push(t),t=0,n=0):n+=5}return e},m=(r,e)=>{const t=RC(r),n=e?t.length/2:t.length/3,s=new Uint32Array(n*3);let i=0,o=0;for(let B=0;B<n;B++)i+=t[o++],s[B*3]=i,i+=t[o++],s[B*3+1]=i,s[B*3+2]=e?1:t[o++];return s},jD=r=>{const e=RC(r),t=new Map;let n=0;for(let s=0;s<e.length;s+=2){n+=e[s];const i=e[s+1],o=i>>>1^-(i&1);t.set(n,n+o)}return t};var eo=class{constructor(r){this.initializer=r,this.cache=new Map}has(r){return r in this.initializer}get(r){if(this.cache.has(r))return this.cache.get(r);const e=this.initializer[r],t=e?e():null;return this.cache.set(r,t),t}},Rn,Ct=(Rn=class{static get CASE_ORBIT(){return this._CASE_ORBIT||(this._CASE_ORBIT=jD("rCgCIgCY+rQI4QiCuuBLgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCCgCBgCBgCBgCBgCBgCBgCB+7OB-BB-BB-BB-BB-BBskQB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BC-BB-BB-BB-BB-BB-BB-BByHBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBDCBBBCBBBCBBCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBxHBCBBBCBBBCBBB3SBmMBkNBCBBBCBBB8MBCBBB6MB6MBCBBC+EB0MB2MBCBBB6MB+MBiGBmNBiNBCBBBmKBikzCBmNBqNBkIBsNBCBBBCBBBCBBB0NBCBBB0NDCBBB0NBCBBByNByNBCBBBCBBB2NBCBBDCBBCwDFCBCBDBCBCBDBCBCBDBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBB9EBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCCBCBDBCBBBhGBvDBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBjICCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBH2iVBCBBBlKBwiVB+jVB+jVBCBBBlMBqEBuEBCBBBCBBBCBBBCBBBCBBB+hVB4hVB8hVBjNB7MC5MB5MCzMC1MB+0yCE5MB20yCC9MBu2yCBwyyCBo0yCChNBlNBo0yCBu-UBi0yCDlNC6-UBpNDrNIu+UDzNCm0yCBzNE0yyCBzNBpEBxNBxNBtEG1NLqxyCBkxyCnFoFrBCBBBCBBDCBBEkIBkIBkICoHHsCCqCBqCBqCCgEC+DB+DBmkOBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCC+BBgCBgCBgCBgCBgCBgCBgCBgCBrCBpCBpCBpCBmjOB-BB8BB-BB-BBgEB-BB-BByBBqgOBsDB-BBtwBB-BB-BB-BBsBBgDBCB-BB-BB-BBeB-BB-BB61OB-BB-BB-DB9DB9DBQB7DBmCE9CBrDBPBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBrFB-EBOBnHB3FB-FCCBBBNBCBBCjIBjIBjIBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB8kMB-BB6kMB-BB-BB-BB-BB-BB-BB-BB-BB-BBokMB-BB-BBkkMBkkMB-BB-BB-BB-BB-BB-BB-BB4jMB-BB-BB-BB-BB-BB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EBCBBBCBoiMBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBJCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBeBCBBBCBBBCBBBCBBBCBBBCBBBCBBBdBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDL-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-C64CgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOCgmOGgmODg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FDg8FBg8FBg8FhVg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBQBQBQBQBQBQDPBPBPBPBPBPjkC7mMB5mMBnmMBjmMBCBlmMB3lMBpiMBk8kCBCBBG-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FD-7FB-7FB-7F6FoglCEsuHRwjlCyDCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCB0DBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBG1DD97OCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQDPBPBPBPBPBPDQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQDPBPBPBPBPBPEQCQCQCQCPCPCPCPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPB0EB0EBsFBsFBsFBsFBoGBoGBgIBgIBgHBgHB8HB8HDQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQCSFPBPBzEBzEBRCxnOFSFrFBrFBrFBrFBREQBQClkOFPBPBnGBnGFQBQCljOCODPBPB-GB-GBNHSF-HB-HB7HB7HBRqJ53OE9tQBrmQH4Bc3BSgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBfBfBfBfBfBfBfBfBfBfBfBfBfBfBfBfECBByZ0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzB34BgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CBCBBBt-UBruHBt+UB1iVBviVBCBBBCBBBCBBB3hVB5-UB9hVB7hVCCBBCCBBI9jVB9jVBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBICBBBCBBECBBN-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOC-lOG-lOzoeCBBBCBBBCBBBCBBBCBBBCBl8kCBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBTCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBnECBBBCBBBCBBBCBBBCBBBCBBBCBBDCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBKCBBBCBBBnglCBCBBBCBBBCBBBCBBBCBBECBBBvyyCDCBBBCBBBgDCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBn0yCB90yCB10yCBh0yCBn0yCCjxyCBzyyCBpxyCBg6BBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBB-CBl0yCBvjlCBCBBBCBBBt2yCBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBhkzCZCBB9a-5Bd-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCm6TCBB7gBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCH-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BmlBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvChDwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCFvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvC1DuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCCuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCCuCBuCBuCBuCBuCBuCBuCCuCBuCCtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCCtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCCtCBtCBtCBtCBtCBtCBtCCtCBtCk2BgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEO-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-D+CgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCL-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-B74CgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BhrVgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BhB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BD1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BtxekCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjC")),this._CASE_ORBIT}static get Print(){return this._Print||(this._Print=new g(m("hB9CBjBLBCpWBDFBFGBCCCBSBCsMBClBBDxBBDCBC2BBJaBFFBSVBC-FBCvBBD6BBDkDBP6BBDwBBDOBCbBDCCBJBGfBIqCBCgFBCHBDBBDVBCGBCEEBCBDIBDBBDDBJFFBCCBDBDYBDCBCFBFBBDVBCGBCBBCBBCBBDCCBDBFBBDCBEIIBCBCIIBPBLCBCIBCCBCVBCGBCBBCEBDJBCCBCCBDQQBCBDLBIGBCCBCHBDBBDVBCGBCBBCEBDIBDBBDCBICBFBBCEBDRBLBBCFBECBCDBEBBCCCBEEBEEBBBELBFEBECBCDBDHHPUBGMBCCBCWBCPBDIBCCBCDBIBBCCBCBBDDBDJBIVBCCBCWBCJBCEBDIBCCBCDBIBBGCBCDBDJBCCBNMBCCBCyBBCCBCFBFPBDZBCCBCRBEXBCIBCDDBFBEFFBEBCCCBGBHJBDCBN5BBFcBmBBBCCCBDBCXBCCCBVBDEBCCCBFBCJBDDBhBnCBCjBBFmBBCjBBCOBCMBmBlGBCGGD4LBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBDfBEZBH1CBDFBD-TBCbBE4CBIVBKXBKTBNMBCCBCBBN9CBDJBHJBHNBCKBH4CBIqBBGlCBLeBCLBFLBFEEBoBBDEBMrBBFZBHKBE9BBDgCBCcBDKBHJBHNBDtBBDLBVsCBClFBJ7BBEOBE9BBGqBBDKBJqBBG1QBDFBDlBBDFBDHBCGCBdBD0BBCOBCNBDFBCSBDCBCIBSXBJuBBSBBDaBCMBEhBBPgBBQrEBF5UBXKBWz4BBD9LBGsBBCGGD3BBIBBPXBKGBCGBCGBCGBCGBCGBCGBCGBC9DBjBZBC4CBN1GBbPBC+BBC1CBDmDBGqBBC9CBC1CBKvBBCszcBE2BBK7KBV3FBJ8GBV7BBEJBH3BBJlCBJLBHzDBMdBEtCBCKBFgBBC2BBKNBDJBDmDBZbBLFBDFBDFBKGBCGBC7BBF9DBDJBHj9KBNWBFwBBloItLBDpDBnBGBNEBGZBCEBCCCBCCBCCBoUBhBpBBHyBBCSBCDBFEBCmEBF9FBEFBDFBDFBDCBEGBCGBOBBDLBCZBCSBCBBCOBDNBjB6DBGCBFsBBE3CBCMBEwBwBBsBBjEcBEwBBQbBFjBBKdBGqBBGdBCkBBFNBrB9EBDJBHjBBFjBBFnBBJzBBMLBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBCnCBJIBxBSBCBBGgBBEaBGaBnB3BBFTBDxBBCBBGHBCCBCcBDCBFJBIIBI-BBhBmBBFLBK1BBEcBDaBGZBIDBNGBxCoCB4ByBBOyBBItBBJJBHlBBEcBJBBxGeBCpBBCCBDBBRFBJIBiBtBBJpBBXZBnBbBVWBKtCBFjBBK9BBCEBOYBIJBH0BBCRBJmBBK-CBCTBMRBCuBB-BGBCCCBCBCOBCKBH6BBGJBHDBCHBDBBDVBCGBCBBCEBCJBDBBDCBDHHGGBDGBEEBMJBCDDClBBCJBCDDCDBCJBCBBJBBe7CBCEBfnCBJJBnF1BBDlBBjBkCBMJBHMBU5BBHJBHTBdaBDOBFWB6F7BBlDyCBNHBDDDBGBCBBCdBCBBDLBKJBnCHBDtBBDKBcnCBJyCBOoCBIJB3CHB5ChBBPJBHIBCsBBCNBLcBEfBDVBCNBqCGBCBBCrBBECCBCCBHBJJBHFBCBBCkBBCBBCFBIJBHrBBFJB3HYBIQBCoBBEcB2CQQBwBBO6cBnDuDBCEBMjGBtyCiDBOvhBBRVBL68DBGmSB61G5BBn2B4RBIeBCJBFwCBCJBHdBDFBLlCBLJBCGBCUBGSBxN5BBnG6CBGYBDYBtBqCBF4BBIQBhCEBMGBK1mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBDDBh7D8HBEzNBHWBQQBQtBBDWBKzDB9B1HBLmBBDpCBJvDBWlCB7DTBNTBN2CBKYBoE0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBD9VBQEBCOBxiBeBHFB2GGBCQBDGBCBBCEBG9BBiBxDxDBrBBENBDJBFBBhKeBS5BBGxOxOBoBB3GqBBFhGhGBdBCVBJBBhHGBCDBCBBCOBCkGBDPBqBrCBFJBFBByYjCBtC8BBjGDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBBvIrBBFjDBNOBDOBCOBCkBBLtFB5BcBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBCmDBmgB-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIBnkzVvHB",!1))),this._Print}static get Upper(){return this.CATEGORIES.get("Lu")}},G(Rn,"_CASE_ORBIT",null),G(Rn,"_Print",null),G(Rn,"CATEGORIES",new eo({C:()=>new g(m("AfBgDgBBOrWrWBHHBCBICCVuMuMnBBBzBBBE4B4BBGBcDBHQBXhGhGxBBB8BBBmDNB8BBByBBBQddBCCMEBhBGBsCiFiFJBBDBBXIICCBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBPMMBEB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKMMBDBbEByBPBDBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBjoIBvLBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCB-FCBHBBHBBHBBECBIIIBLBDBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIB-BGGBLBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMBxhBPBXJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBF-6DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBrCHBxDUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIlkzVBxHvw-FB",!1)),Cc:()=>new g(m("AfgDgB",!0)),Cf:()=>new g(m("tFzqBzqBBEBXhGhGyBhMhMBxCxCs5D9-B9-BBDBbEByBEBCJBw03B6H6HBBBimEQQj7IPBhjiBDBwmFHBn0rYffB+CB",!1)),Cn:()=>new g(m("4bBBHDBICCVuMuMnBBBzBBBE4B4BBGBcDBHKBvI9B9BBmDmDBMB8BBByBBBQddBCCMEBjBEBuHJJBDDBXXICCBBBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBbFB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKmDmDNBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBDBvzIBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCC-FCBHBBHBBHBBECBIIIBIBGBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIBlCJBCBBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMB3iBJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBJ76DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBjGUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIm8yVBCdBhD-DBxHvw-BB---BBB---BBB",!1)),Co:()=>new g(m("gg4B-nGh4hc9--BD9--B",!0)),Cs:()=>new g(m("gg2B--B",!0)),L:()=>new g(m("hCZBHZBwBLLFGGBVBCeBCpOBFLBPEBICCiEEBCBBDDBCHHCCBCCCBSBCyCBCqEBJlFBClBBDHHBnBBoCaBFDBuBqBBkBBBCiDBCQQBIIBLLBBBDRRCdBe4CBMZZBfBKBBFGGBUBFKKEYYBXBIKBGXBCGBRpBB7B1BBETTIJBQPBFHBDBBDVBCGBCEEBCBERROBBCCBPBBLJJBEBFBBDVBCGBCBBCBBCBBgBDBCUUBBBRIBCCBCVBCGBCBBCEBETTQBBYMMBGBDBBDVBCGBCBBCEBEffBCCBBBQSSCFBECBCDBEBBCCCBEEBEEBBBELBX1B1BBGBCCBCWBCPBEbbBBBCBBDBBfFFBGBCCBCWBCJBCEBEffBBBCBBQBBSIBCCBCoBBDRRGCBJCBZFBGRBEXBCIBCDDBFB7BvBBCBBNGB7BBBCCCBDBCXBCCCBIBCBBKDDBDBCWWBCBhBgCgCBGBCjBBcEB0DqBBVRRBEBFDBEEEBIIBBBFMBNSSBkBBCGGDqBBCsKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPBR1CBDFBErTBDQBCZBGqCBHHBIRBOSBPRBPMBCCBQzBBkBFFkC4CBIEBDhBBCGGBkCBLeByBdBDEBMrBBFZB3BWBK0BBzC+C+CBtBBSHB3BdBOBBLrBBbjBBqBCBLjBBDKBGqBBDCBqBDBCFBCBBEGGB+FBhC1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGB1DOORMBmDFFDJBCEEBDBHGCBCBCKBDDBGEBF1B1BB8zC8zCBjHBHDBEBBNlBBCGGD3BBIRRBVBKGBCGBCGBCGBCGBCGBCGBCGBxC2O2OBrBrBBDBGBBF1CBHCBC5CBCDBGqBBC9CBSfBxBPBhQ-tGBhCs0VBkCtBBDsIBEPBLBBVuBBReBDlCByBIBDmDBDxCBVQBCCBCDBCWBezBBPxBB-BFBECCBMMBaBLWBacBIuBBdRRBDBCJBLEBCoBBYCBCHBVWBEEEBwBBCEEBDDBDBDCCZCBDKBICBNFBDFBDFBKGBCGBCqBBCNBHyDBej9KBNWBFwBBloItLBDpDBnBGBNEBGCCBIBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBlBZBHZBM4CBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmMcBEwBBwBfBOTBCHBHlBBLdBDjBBFHBxB9EBTjBBFjBBFnBBJzBBNKBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCQQBCBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4ByBBOyBBOjBBnBbBKWB7HpBBHBBRFB5BcBLJJBUBrBRBvBUBcWBN0BB6BBBDOOBrBBhBYBbjBBeDDJiBBENNBuBBPDBWCCkBRBCYBUBBgCGBCCCBCBCOBCJBIuBBnBHBDBBDVBCGBCBBCEBETTNEBfJBCDDClBBCaaCtBtBBzBBTDBVCBfvBBVBBC5F5FBtBBqBDBlBvBBV8B8BBpBBOoCoCBZBmBGB6FrBB1D-BBgBHBDDDBGBCBBCXBQCC-CHBDmBBRCCdLLBmBBIWWMtBBUTTBnCBoGgBBgBIBCkBBSyByBBcBxDGBCBBClBBWaaBEBCBBCfBPYYBqBBlISBQCCBLBChBB9DwCwCB4cBnHjGBtyCgDBQvhBBSFBa68DBGmSB61GdBj3B4RBIeBSuCBSdBTvBBRDBgBUBGSBxNsBB0G-BBhBYBDYBtBqCBGjCjCBLBhCBBCPPBNNB0mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBn7F0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BeBHFBmI9BBzEsBBLGBRiKiKBcBTrBBlPbBlHdBDwGwGBdBCCBCBBCGBDEBKBBhHGBCDBCBBCOBCkGB8BjCBI1lB1lBBCBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQBlqE-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),LC:()=>new g(m("hCZBHZB7BLLBVBCeBCiGBCDBFvGBDZBhGDBDBBECBCHHCCBCCCBSBCyCBCqEBJlFBClBBKoBB44ClBBCGGDqBBDCBhV1CBDFBjkCKBGqBBDCBhCrBBgCMBChBBmD1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGBmIFFDJBCEEBDBHGCBCBCFBFDDBCBGEBF1B1BB8zC8zCB6DBDmDBHDBEBBNlBBCGGzoetBBTbBnEtCBCWBEDBCsCBZBBE2Z2ZBpBBGIBIvCBh6TGBNEBqgBZBHZBmlBvCBhDjBBFjBB1DKBCOBCGBCBBCKBCOBCGBCBBk2ByBBOyBB+CVBLVB74C-BBhrV-BBhBYBDYBtpZ0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BJBCTBHFB2uCjCB",!1)),Ll:()=>new g(m("hDZB7BqBqBBWBCHBC2BCBQCBuBCDECBBBDCCDEEBFFDEEBBBDDDCCCDCCBCCDEECDDBDDBBBHGDCOCBSCBDDCEEC4BCBFBDDDBCCFICBjCBDZBiGCCEEEBBBTccBhBBCBBECBCWCBDBCGDB0B0BBuBBCgBCK0BCDMCBgDCxBoBBo6CqBBDCB5XFBjkCIBC2D2DBqBBgCMBChBBnD0ECBHBCgDCBHBJFBLHBJHBJFBLHBJHBJNBDHBJHBJHBJEBCBBHEEBBBCBBJDBDBBJHBLCBCBBzIEEBEEcKFDBBJDBF2B2Bs1CvBBCEEBGCFCCBCCBEBGiDCBIICFFNlBBCGG0oesBCUaCoEMCBBBC+BCBGBCCCDICFCCDCCBBBCSCGGGCMCFCCDOCbEE2ZqBBGIBIvCBh6TGBNEBqhBZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBnqZZBbGBCRBbZBbDBCCCBFBCKBbZBbZBbZBbZBbZBbZBbZBbZBbbBdYBCFBbYBCFBbYBCFBbYBCFBbYBCFBC15B15BBIBCTBHFB4vChBB",!1)),Lm:()=>new g(m("wVRBFLBPEBICCmEGG-OnHnHlFBBuIBBFgBgBKEEhFoFoF1mBgEgE2R72B72BsDkTkTxOFBvF+BBOjBjBBjBByVOORMBg-CBByHgGgG2OsBsBBDBGiDiDB+C+CBBB34bjnBjnBBEBvIzDzDdBB6DIBxCYYpDDBEBB2OXXqEtDtDWBBoDDBKngVngVuBBBh-BFBCpBBCIB0sBhBhB2K04D04DnrTDB9PCBpBBBnRMBhCBBCPPB9-P9-PBCBCGBCBByhM9BBqGGBud0Q0QsSAB",!1)),Lo:()=>new g(m("qFQQhIFFBCBxGBB7ZaBFDBuBfBCJBkBBBCiDBCZZBLLBBBDRRCdBe4CBMZZBfBWVBrBYBIKBGXBCGBRoBB8B1BBETTIJBROBFHBDBBDVBCGBCEEBCBERROBBCCBPBBLJJBEBFBBDVBCGBCBBCBBCBBgBDBCUUBBBRIBCCBCVBCGBCBBCEBETTQBBYMMBGBDBBDVBCGBCBBCEBEffBCCBBBQSSCFBECBCDBEBBCCCBEEBEEBBBELBX1B1BBGBCCBCWBCPBEbbBBBCBBDBBfFFBGBCCBCWBCJBCEBEffBBBCBBQBBSIBCCBCoBBDRRGCBJCBZFBGRBEXBCIBCDDBFB7BvBBCBBNFB8BBBCCCBDBCXBCCCBIBCBBKDDBDBYDBhBgCgCBGBCjBBcEB0DqBBVRRBEBFDBEEEBIIBBBFMBNyDyDBnKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPByDrTBDQBCZBGqCBHHBIRBOSBPRBPMBCCBQzBBpBkCkCBhBBC0BBIEBDhBBCGGBkCBLeByBdBDEBMrBBFZB3BWBK0BBxFuBBSHB3BdBOBBLrBBbjBBqBCBLdByDDBCFBCBBE7hB7hBBCB4-C3BBZWBKGBCGBCGBCGBCGBCGBCGBCGBoR2B2BF1CBJCCB4CBFGGBpBBC9CBSfBxBPBhQ-tGBhC0wUBC2jBBkCnBBJrIBFPBLBBjCyByBBkCBqFoDoDEGBCCBCDBCWBezBBPxBB-BFBECCBMMBaBLWBacBIuBBuBEBDIBLEBCoBBYCBCHBVPBCFBEEEBwBBCEEBDDBDBDCCZBBEKBIPPBEBDFBDFBKGBCGByEiBBej9KBNWBFwBBloItLBDpDBkCCCBIBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBqDJBCsBBDeBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmMcBEwBBwBfBOTBCHBHlBBLdBDjBBFHBhEtCBjDnBBJzBB9CzBBN2JBKVBLHB5EFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCQQBCBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4FjBBnBDBCxJxJBoBBHBBRCBCBB5BcBLJJBUBrBRBvBUBcWBN0BB6BBBDOOBrBBhBYBbjBBeDDJiBBENNBuBBPDBWCCkBRBCYBUBBgCGBCCCBCBCOBCJBIuBBnBHBDBBDVBCGBCBBCEBETTNEBfJBCDDClBBCaaCtBtBBzBBTDBVCBfvBBVBBC5F5FBtBBqBDBlBvBBV8B8BBpBBOoCoCBZBmBGB6FrBB0GHBDDDBGBCBBCXBQCC-CHBDmBBRCCdLLBmBBIWWMtBBUTTBnCBoGgBBgBIBCkBBSyByBBcBxDGBCBBClBBWaaBEBCBBCfBPYYBnBBCBBlISBQCCBLBChBB9DwCwCB4cBnHjGBtyCgDBQvhBBSFBa68DBGmSB61GdBj3B4RBIeBSuCBSdBTvBB0BUBGSB0NnBB2MqCBGwFwFB0mHBqBfBiDyDBuwIiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBxzI2P2PBrBBiBiKiKBcBTrBBlPaBmHdBDwGwGBdBCCBCBBCGBDEBKiHiHBFBCDBCBBCOBCkGB8pBDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQBlqE-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),Lt:()=>new g(m("lOGDnB2sH2sHBGBJHBJHBNQQwBAB",!1)),Lu:()=>new g(m("hCZBmDWBCGBiB2BCDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIJDCMCDQCDDDCCBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBDDBBBEWCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBpCDBNDBNDBNEBMDBnIFFECBDCBDEEBDBHGCBCBDDBLBBG+B+B9zCvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoqZZBbZBbZBbCCBGDBDDBCBCHBbZBbBBCDBDHBCGBcBBCDBCEBCEEBFBcZBbZBbZBbZBbZBbZBfYBiBYBiBYBiBYBiBYBiB2pE2pEBgBB",!1)),M:()=>new g(m("gYvDB0IGBoIsBBCCCBCCBCCpCKBxBUBRmDmDBFBDFBDBBCDBkBffBZB8CKB7BIBKZZBCBCIBCCBCEBsBCB8BIBrBXBCgBB3BCBCRBCGBLBBeCB5BCCBFBDBBDCBKLLBbbDCB5BCCBDBFBBDCBEffBEEMCB5BCCBGBCCBCCBVBBXFBCCB5BCCBFBDBBDCBICBLBBf8B8BBDBECBCDBKpBpBBDB4BCCBFBCCBCDBIBBMBBeCB5BCCBFBCCBCDBIBBMBBQNNBCB4BBBCGBCCBCDBKLLBeeBBBnCFFBEBCCCBGBTBB+BDDBFBNHBjDDDBHBMGBqCBBcECFBByBTBCBBGKBCjBBKlDlDBSBYDBFCBCCBDGBEDBOLBCLLBCBgWCBzdDBdCBeBBfBBhCfBKuBuBBBBC2D2DBjBjB3DLBFLB8GEB6BJBCcBDxBxBBsBBDLBVEBwBQBnBIBNCBfMB5BNBxBTB5ECBCUBFHHDCBnG-BBxWgBB--CCBuEhDhDBeBrRFBqDBB1udDBCJBhBBBxCBBxIEEFYYBDBF0C0CBzBzBBQBbRBOnBnBBGBaMBtBDBwBNBlBkCkCBMBNJJBuBuBBBBzBCCBBBDBBGBBCqBqBBDBGBBtHHBCBBx5TiXiXBOBRPBuejHjH2EEBn0BCBCBBGDBpBCBFmFmFB+R+RBCBiCEB+JBBuCFBnCKByBDB7DCB2BOBqBDDBLLBCBuBKBI+B+BBBBlBNBRBBtBNNBBBxBNBJDBCBB9CLBHDD+ELBWDB4BBBCGBDBBDCBKLLBDDBFBEEBkCIBCDDCDBCEBCPPBzCzCBQBYyCyCBSBsHGBDIBcBBzCQBrDMBmDOBhIOB2HFBCBBDDBCCCBuEuEBFBDGBEddBIBpBGBCDBJKKBJBvBPBnGHBoGHBCHBzCVBCNB7DFBECCBCCBFBCjCjCBDBCBBCEB8KDBKBBCxBxBBFBEEBYmnFmnFHOBpmLRBhuCEB8BGB5gBCCB1BBIDByCMMBslTslTBizEizEBsBBDWB-QEBEFBJHBDGBfDB1ECB89B2BBFxBBJPPXEBCOBxqBGBCQBDGBCBBCEBlDhFhFBFB4L+B+BBCB9PDB-HBB0HDDIBBG7O7OBFBuDGB29lYvHB",!1)),Mc:()=>new g(m("joC4B4BDCBJDBCBBzBBB7BCBHBBDBBLsBsB7BCBjC7B7BBBBJCCB2B2BB7B7BCHHBDDBLLnDBBCBBECBCCBLqBqBBBB+BDB+BBB7BCCBDBDBBCBBKBBdPPB7B7BBBBGCBCCBLrBrBBsCsCBBBHHBTBBrKBBgCsFsFBFFHDDBaaBLLBBBDGBWBBDFBDLLBBB5zBffiEIIBGBCBB7KDBDCBFBBCFBhHBB7BCCKCCBJJBEByExBxBGCCBDBCBB+BffFBBD9B9BDCBCEEBxBxBBGBJBBsFWW35EBB0-dBBD5C5CBzBzBBOBvEBBwBxBxBBFFBDDBBBvDBBDBBZuBuBCuDuDDBBGuHuHBCCBCCBCC0gZCCgEuBuBBBBFBB0DZZB8B8BxBCBKBBO+C+CBBBEBBCrFrFBBBgBBB7BBBCDBDBBDCBKLLB1C1CBBBIDDCDBCBBCmDmDBBBJBBErDrDBBBHCCBCBDuHuHBBBHDBDyDyDBBBJBBCuDuDCBBHoDoDCBBFmImIBBBK4H4HBEBCBBFDDCvEvEBBBJDBF1C1CeBB-BqGqGECCoGPPrDIID2G2GBDBFBBC-K-KBNNxBBBJBBCpvQpvQBBBlxD2BBpDBB0rYBBHFB",!1)),Me:()=>new g(m("okBBB1xF-wB-wBBCBCCBsshBCB",!1)),Mn:()=>new g(m("gYvDB0IEBqIsBBCCCBCCBCCpCKBxBUBRmDmDBFBDFBDBBCDBkBffBZB8CKB7BIBKZZBCBCIBCCBCEBsBCB8BIBrBXBCfB4BCCFHBFEEBFBLBBe7B7BFDBJVVBbbDBB6BFFBFFBDDBBBEffBEEMBB6BFFBDBCBBFVVBXXBEBC7B7BDCCBCBJIIBMMBff+BNNzBEE4BCCBBBGCBCDBIBBMBBe7B7BDHHGBBVBBdBB6BBBFDBJVVBeepCIIBBBC7C7CDGBNHBjDDDBHBMGBqCBBcEC4BNBCEBCBBGKBCjBBKnDnDBCBCFBCBBDBBaBBFCBRDBODDBHHQgWgWBBBzdCBeBBfBBfBBhCBBCGBJDDBJBKuBuBBBBC2D2DBjBjB3DCBFBBKHHBBB8GBBD7B7BCGBCCCDHBHJBDxBxBBMBCeBDLBVDBxBCCBDBCGGpBIBNBBhBDBDBBCCB5BCCBEECCB7BHBDBB5ECBCMBCGBFHHEBBnG-BBxWMBFEEBKB--CCBuEhDhDBeBrRDBsDBB1udFFBIBhBBBxCBBxIEEFaaBGG4EBBbRBOnBnBBGBaKBvBCBxBDDBCBDBBoBkCkCBEBDBBDBBNJJwB0B0BCCBDBBGBBCrBrBBJJvHDDFx5Tx5TiXPBRPBuejHjH2EEBn0BCBCBBGDBpBCBFmFmFB+R+RBCBiCEB+JBBuCFBnCKByBDB8D3B3BBNBqBDDBLLBBByBDBDBBI+B+BBBBlBEBCHB-BNNB1B1BBHBLDBDgDgDBBBDCCBHHD+E+EEHBWBB6BBBEmBmBBFBEEBnCFBOECPBB2CHBDCBCYY1CFBCFFBCCBvHvHBCBHBBCBBcBB2CHBDCCBrDrDCDDBEBCmDmDCDDBCBCEBkIIBCBBhIBBCFFxEDBDBBFhBhBBIBpBFBDDBJKKBEBDCBvBMBCBBnGCCBBBCqGqGBFBCFBCzCzCBUBDGBCBBCBB7DFBECCBCCBFBCpCpCBEEC8K8KBMMB1B1BBDBGCCYmnFmnFHOBpmLLBECBhuCEB8BGB5gBgCgCBCByC5lT5lTBizEizEBsBBDWBhRCBSHBDGBfDB1ECB89B2BBFxBBJPPXEBCOBxqBGBCQBDGBCBBCEBlDhFhFBFB4L+B+BBCB9PDB-HBB0HDDIBBG7O7OBFBuDGB29lYvHB",!1)),N:()=>new g(m("wBJB5DBBGDDBBBitBJBnEJBnGJB9MJB3DJBFFBtDJB3DJB3DJBDFBvDMB0DJBJGBoDJBpDGBISBuDJBhDJB3DJBnCTBtIJBnCJBwWTBybCBwHJBHJBXJBtJJBhEKBmFJBHJB3FJB3CJBnEJBHJB3gBEEBEBHJBnGyBBDEB3W7BBvCVB3TdBqrBqYqYaIBPCB4KDBrEJBfHBCOBhBJBoBOBh7cJB9FJBhKFB7EJBnBJBnGJBXJB3CJB3MJB34UJBuPsBBN4BBSBB2KaBlBDBeJJnEEBrGJBvdHBaGBoBIBsCEBXFBhFBBDPBDtBBhCIB1BBBfCBsCEBpDHBZHBqBGBrKFBxBJBHJB3IeB-EJBrBDBxDGBnEdBhEJB9BJBxEJBITB8HJB3KJB3DJB3LJBnDJBHTBtCLBlNSB+CJB3UJB3CcBkHJBnCJB3BJBnLJBnDUBshBuDBimPJBnpCJB3CJBnEJBCGBvQJBnIWB+KCB6nXJBnuBTBNTBtDYB2iBxBBhqCJBnNJB3PJB4HJBtWIBhEJB4Y6BBCCBCDBtCsBBCOBjeMBk3CJB",!1)),Nd:()=>new g(m("wBJnxBJnEJnGJ9MJ3DJ3DJ3DJ3DJ3DJ3DJ3DJ3DJ3DJhDJ3DJnCJ3IJnCJn6BJnBJtJJhEJnFJHJ3FJ3CJnEJHJnuiBJnVJnBJnGJXJ3CJ3MJ34UJnsBJnkCJHJ9YJhEJ9BJxEJ3IJ3KJ3DJ3LJnDJHTtCJnNJnDJ3UJ3CJ3HJnCJ3BJnLJ3uQJnpCJ3CJnEJ3QJ37XJ12CxBhqCJnNJ3PJ4HJ2aJ30EJ",!0)),Nl:()=>new g(m("u3FCBwzCiBBDDB-zDaaBHBPCBs1dJBxyW0BBtOJJnEEBrhIuDBm8SCB",!1)),No:()=>new g(m("yFBBGDDBBB2pCFB5LFB5DCBmEGB6GGBSIByNJB2hBTB0jBJBhP20B20BEFBHJBnGPBqB3W3WB6BBvCVB3TdBqrB1kB1kBBCBrEJBfHBCOBhBJBoBOBxrdFBymWsBBiCDBSBB2KaBlBDB1pBHBaGBoBIBsCEBXFBhFBBDPBDtBBhCIB1BBBfCBsCEBpDHBZHBqBGBrKFBhLeB-EJBrBDBxDGBnETB8LTBmqBBBvNIBobSB0aUBn8SGB-YWBqhZTBNTBtDYBvqFIBid6BBCCBCDBtCsBBCOBjeMB",!1)),P:()=>new g(m("hBCBCFBCDBLBBEBBbCBCccCkBkBGEELBBEEE-VJJzOFBqBBB0BCCDDDtBBBVBBCBBOCCBBBrCDBnDsBsBBMBqHCB3BOBgBmImIBLLtE5D5D6DnMnMNwLwL7CLLBpFpFBNBCmBmBBCBoCrCrCBDBFBBwDFBsFlTlTBHB4EuTuTtBBBvCCBoCBB+ECBCCBmBKB6JBB5GBBhEGBCFBhFBBLGBdCB9DDB8BEB-BBBhCHBM9Z9ZBWBJTBCMBCLBfBBPBB6TDBeBB+hBNBwCBBgBJB0MVBgCDBhBBB8XDBCBBxDwEwEBtBBCfBDLBkNCBFJBDLBRNNjD7C7CjgdBBuICBkDLL0DFB9LDB3CBBpBCBCyByBBwBwBiDMBRBB9DDB-DBBRBB6HzqUzqUBxGxGBIBXiBBCNBCFFCBB2ECBCFBCDBLBBEBBbCBCccCCCBFB7MCB9UxBxB-MoXoXoGgBgBxIIBnBxDxDBFBjCGB6CDByO-J-JjBlElEBDBtBDB+FGBuDBBCDB-DDBxBBBwCDBFOOCCB5CFBsDrJrJBCCBzDzDBDBLBBCpDpD7HWBqDCBdMBtCjEjEBBB9HpIpIBBB8E9C9CBGB0CCBCEB+CJB4GgDgDBDBrBBBmUBBrCMBwFxjBxjBBDB97CBB8zOBBmEiCiCBDBJpRpRBBBoJDBoK9lT9lTovHEB07C-a-aBAB",!1)),Pc:()=>new g(m("-Cg-Hg-HBUU-u3BBBZCBwHAB",!1)),Pd:()=>new g(m("tB9qB9qB0BiyDiyDmgBqgCqgCBEBiwDDDgBBBFdd-NUUwDxszBxszBBmBmBLqFqFhzD-J-J",!1)),Pe:()=>new g(m("pB0B0BgB+1D+1DC-6B-6BqtC4B4BQ7T7TCff-hBMCxChBhBCGC1MUChCCCiBmhBmhBCECtBGCtNICEGCDBB-ozB6G6GeOCESSCCCrF0B0BgBGD",!1)),Pf:()=>new g(m("7F+6H+6HEddpuDCCFDDQEE",!1)),Pi:()=>new g(m("rFt7Ht7HDBBDaapuDCCFDDQEE",!1)),Po:()=>new g(m("hBCBCCBDECBLLBEEBcclCGGPBBI-V-VJzOzOBEBqB3B3BDDDtBBBVBBCBBOCCBBBrCDBnDsBsBBMBqHCB3BOBgBmImIBLLtE5D5D6DnMnMNwLwL7CLLBpFpFBNBCxDxDrCEBFBBwDFBsFlTlTBHBmY9D9DBBBoCBB+ECBCCBmBFBCDB6JBB5GBBhEGBCFBhFBBLGBdCB9DDB8BEB-BBBhCHBMjajaBJJBGBJIBDDBDCBEKBCCCBIB7kDDBCBBxDwEwEBFFBBBDDDBHBCBBCDDBLLBDBCJBDDBCCCBLBDCBtNCB6B+F+FjgdBBuICBkDLL0DFB9LDB3CBBpBCBCyByBBwBwBiDMBRBB9DDB-DBBRBB6HlxUlxUBFBDXXVBBDDBECBCDBICBHCCB2E2EBBBCCBDECBLLBEEBcclBDDB7M7MBBB9UxBxB-MoXoXoGgBgBxIIBnBxDxDBFBjCGB6CDB0ZlElEBDBtBDB+FGBuDBBCDB-DDBxBBBwCDBFOOCCB5CFBsDrJrJBCCBzDzDBDBLBBCpDpD7HWBqDCBdMBtCjEjEBBB9HpIpIBBB8E9C9CBGB0CCBCEB+CJB4GgDgDBDBrBBBmUBBrCMBwFxjBxjBBDB97CBB8zOBBmEiCiCBDBJpRpRBBBoJDBoK9lT9lTovHEB07C-a-aBAB",!1)),Ps:()=>new g(m("oBzBzBgB-1D-1DC-6B-6B-rCEEnB4B4BQ7T7TCff-hBMCxChBhBCGC1MUChCCCiBmhBmhBCECaTTCECtNICEGCDipzBipzB4GeeCMCESSCCCrFzBzBgBEEDAB",!1)),S:()=>new g(m("kBHHRCBgBCCcCCkBEBCBBDCCBCBDEEfgBgBrODBNNBGGBCCCBPB2DPPBxDxDsErIrIBBB3DCBDDDBvGvGLUUB4H4HIBBpEqLqLBHHB2H2H-DjEjEBGBlEwGwGqBmGmGiGCBQCCBBBDFBVECmEHBCFBCBBGDBmGBBxXJB0WuLuLlL+E+EBgBBiLJBKIBhiBCCBBBMCBOCBOCBOBBmCOOoBCBOCBUhBB-BBBCDBCBBLCCBBBGFBCECFMMBFFBDBGDBC7B7BBFFB2LBFcBD+HBXKByCtCBXnTBtBwBBDeBLyMBX+BBFfBD1LBDpEBmHFBmLBBvBZBC4CBN1GBbPBFOOBNNWBBHBB8CBB0HBBFJBhBlBBKRRBdBMdBJQQBeBLmBBQ-JBhuG-BBx0V2BB6RWBKBBoDBB+EDBLDB+RCBiHPPB+9T+9TpEgBBuLPBhCBB3BHBtBDBjDCCBBBD7E7EHRRBBBgBCCcCCiEGBCGBOBB6JIB6BQBDCBCMBEwBwBBrBB7zBBBwSmWmWBiKiKBGBnjC2kC2kCBbBr6SDBG3qU3qUk7DvHBLCBEzNBHWBQQBgDzDB9B1HBLmBBD7BBGCBXBBIdBF8BBWhCBE7F7FB1CBrbaagBaagBaagBaagBaa9B-PB4BDBzBHBCNBCBBp2BwNwNttCEE+DiOiOBvIvIBqBBFjDBNOBDOBCOBCkBBYgFB5BcBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBC7CBLAB",!1)),Sc:()=>new g(m("kB+D+DBCBqnB8D8DzPBBzPBBI2H2HoImSmS8sClmClmCBgBB37hBkuVkuVtD7E7E8GBBEBB3-HDB-4wBxtCxtC",!1)),Sk:()=>new g(m("+CCCoCHHFEEqQDBNNBGGBCCCBPB2DPPBjoBjoB15FCCBBBMCBOCBOCBOBB9kEBBkzdWBKBBoDBBxePPBniUniUBPB8bCCjF4g9B4g9BBDB",!1)),Sm:()=>new g(m("rBRRBBB+BCCuBFFmBgBgB-XwQwQBBB8xGOOoBCBOCBsEoBoBBDBHlClCBDBGBBFGDIgBgBBDDCgBgBBqIBhBBB7CffBXBpBFB2OKK3BHBwDxKxKBDBDeBLPBhIiEBX+BBFfBDhIBxBUBDFB9+zB5Z5ZCCBlFRRBBB+BCCkEHHBCBitDBBhrwBx+Bx+BagBgBagBgBagBgBagBgBat5Ft5FB-uC-uCBHB",!1)),So:()=>new g(m("mFDDFCCyerIrIBgEgEBvGvGLUUB4H4HkQ2L2LjEFBClElEwGqBqBoMCBQCCBBBDFBVECmEHBCFBCBBGDBmGBBxXJB0WzWzW+EhBBiLJBKIBksBBBCDBCBBLCCBHHBEBCECFMMBPPCBBC7B7BBKKBDBDDBCBBCBBCGBCeBDBBCCCBdBtIHBFTBDGBDwCBCdBanBBHnCBXKByCtCBX2FBCIBC1BBJuDBC3HBtBrBBhC-HBhQvBBWBBHmBBDpEBmHFBmLBBvBZBC4CBN1GBbPBFOOBNNWBBHBBxKBBFJBhBlBBKRRBdBMdBJQQBeBLmBBQ-JBhuG-BBx0V2BBibDBLBBC+R+RBBBqqUPBuLPBhCBB3BHBuBCBlPEEFBBOBB6JIB6BQBDCBCMBEwBwBBrBB7zBBBwSpgBpgBBGBnjC2kC2kCBGBFQBr6SDBG3qU3qUk7DvHBLCBEzNBHWBQPBhDzDB9B1HBLmBBD7BBGCBXBBIdBF8BBWhCBE7F7FB1CBqlB-PB4BDBzBHBCNBCBBp2B96C96CiEyWyWBqBBFjDBNOBDOBCOBCkBBYgFB5BcBOrBBFIBIBBPFB7E6HBG4WBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBB-B3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBC7CBLAB",!1)),Z:()=>new g(m("gBgEgEgvFgsCgsCBJBeBBGwBwBh9DAB",!1)),Zl:()=>new g(m("ohIA",!0)),Zp:()=>new g(m("phIA",!0)),Zs:()=>new g(m("gBgEgEgvFgsCgsCBJBlBwBwBh9DAB",!1)),ASCII_Hex_Digit:()=>new g(m("wBJIFbF",!0)),Alphabetic:()=>new g(m("hCZBHZBwBLLFGGBVBCeBCpOBFLBPEBICC3CeeBQBCBBDDBCHHCCBCCCBSBCyCBCqEBJlFBClBBDHHBnBBoBNBCCCBCCBCCJaBFDBeKBG3BBCGBPlDBCHBFHBFCBLCBDRRBuBBOkDBZgBBKBBFGGBWBDSBUYBIKBGXBCGBIJJBoBBLLBEGBHrCBCPBCCBFOBOSBCHBDBBDVBCGBCEEBCBEHBDBBDBBCJJFBBCEBNBBLFFBBBCFBFBBDVBCGBCBBCBBCBBFEBFBBDBBFIIBCBCSSBEBMCBCIBCCBCVBCGBCBBCEBEIBCCBCBBEQQBCBWDBFCBCHBDBBDVBCGBCBBCEBEHBDBBDBBKBBFBBCEBORRBCCBEBECBCDBEBBCCCBEEBEEBBBELBFEBECBCCBEHHpBMBCCBCWBCPBEHBCCBCCBJBBCCBCBBDDBdDBCHBCCBCWBCJBCEBEHBCCBCCBJBBGCBCDBOCBNMBCCBCoBBDHBCCBCCBCGGBCBIEBXFBCCBCRBEXBCIBCDDBFBJFBCCCBGBTBBO5BBGGBH0B0BBECBDBCXBCCCBRBCCBDEBCHHPDBhBgCgCBGBCjBBFSBFPBCjBBkC2BBCDDBDBR-BBLDBDlBBCGGDqBBCsKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPBR1CBDFBErTBDQBCZBGqCBEKBITBMUBNTBNMBCCBCBBNzBBDSBPFFkC4CBIqBBGlCBLeBCLBFIBYdBDEBMrBBFZB3BbBF+BBDTBzBYYBMMBBByBzBBCOBCHB0BpBBDDBLrBBCKBP2BBXCBLjBBDKBGqBBDCBqBDBCFBCBBEGGB+FBUhBBM1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGB1DOORMBmDFFDJBCEEBDBHGCBCBCKBDDBGEBFSSBnBBuZzBB34BkHBHDBEBBNlBBCGGD3BBIRRBVBKGBCGBCGBCGBCGBCGBCGBCGBCfBwB2O2OBBBaIBIEBDEBF1CBHCBC5CBCDBGqBBC9CBSfBxBPBhQ-tGBhCs0VBkCtBBDsIBEPBLBBVuBBGHBEwDBoBIBDmDBDxCBVUBCgBBZzBBNjCBCtBtBBEBECCBBBLgBBGiBBOcBEyBBCLBQRRBOBLEBC2BBKNBTWBEkCBCCCZCBDPBDDBMFBDFBDFBKGBCGBCqBBCNBH6DBWj9KBNWBFwBBloItLBDpDBnBGBNEBGLBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBlBZBHZBM4CBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmC0BBsIcBEwBBwBfBOdBGqBBGdBDjBBFHBCEBrB9EBTjBBFjBBFnBBJzBBNKBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCDBCBBGHBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4ByBBOyBBOnBBjBbBEGGBVB7HpBBCBBEBBRFBzBCBEcBLJJBUBrBRBvBUBcWBKlCBsBEBL4BBKOOBXBYyBBSDBJiBBEKKB+BBCDBKBBLCCkBRBChBBDHHBCB-BGBCCCBCBCOBCJBI4BBYDBCHBDBBDVBCGBCBBCEBEHBDBBDBBEHHGGBdJBCDDClBBCJBCDDCDBCBBECCtBhCBCCBCDBVCBfhCBDBBC5F5FB0BBDGBaFBjB+BBCEE8B1BBDoCoCBZBDNBWGB6F4BBoD-BBgBHBDDDBGBCBBCdBCBBDBBDDB+CHBDtBBDFBCCCBccBxBBDJBSnCBGTTBnCBoDHB5CgBBgBIBCsBBCGBCyByBBcBDVBCNBqCGBCBBCrBBECCBCCBBBCDDBZZBEBCBBCkBBCBBCDBCYYBqBBlIWBKQBCoBBECBwDwCwCB4cBnDuDBSjGBtyCgDBQvhBBSFBa68DBGmSB61GuBBy2B4RBIeBSuCBSdBTvBBRDBgBUBGSBxNsBB0G-BBhBYBDYBtBqCBF4BBIQBhCBBCNNBFBK1mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBFi7Fi7FBzCBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BeBHFB2GGBCQBDGBCBBCEBG9BBiBxDxDBrBBLGBRiKiKBcBTrBBlPbBlHdBDwGwGBdBCVBJBBhHGBCDBCBBCOBCkGB8BjCBEEE1lBDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1TZBHZBHZB3zD-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),Dash:()=>new g(m("tB9qB9qB0BiyDiyDmgBqgCqgCBEB+BoBoBQnMnMlgDDDgBBBFdd-NUUwDxszBxszBBmBmBLqFqFhzD-J-J",!1)),Emoji:()=>new g(m("jBHHGJBwDFFu8HNN5GXX7CFBQBBwLBBNnFnFaKBFCBoGoHoHBLLK7B7BBCBCEBKGDBDDFDDCBBDIEBJJBBBGCCGLBMBBDCCBCCTDDBTTBEBCCCBEEBGGDBBFBBMBBGBBDGGBECBVVBGGBEBCDBDFFDDDBEBCDDCCCHEEHLLBQQDFFCFFBBBCMMBxBxBBBBKeP1LBBwOCBUBB0BFF7mBNN6SCCrrvDrGrGhFBBNBBPDDBIBsCZBCBBYVVDIBWBBvFhBBDvDBDBBCCBDyCBDCBCmIBC+BBMFBCXBIBBDHBNDDBCBDFFBOOBDDJBBKGGBBBNCBJCBDCCFHHEHHB0CBxBlCBGHBDDBEJBECCBEEDJBkHLBF8I8IBtBBCJBC4FBxDMBEKBE4BBCFFBOBDLBFJB",!1)),Emoji_Component:()=>new g(m("jBHHGJB0+H2G2Gsp3B3+8B3+8BBYB8PEBxtBDBtzhY-CB",!1)),Emoji_Modifier:()=>new g(m("7-8DE",!0)),Emoji_Modifier_Base:()=>new g(m("9wJ8G8GRDB4jzD9B9BBBBDDDBBB2DBBDKBWSBEFFBBBCCBICCZqGqGBFFWFFBvFvFBBBEEB0CRRBBBKMMgSDDJHBHKKBIBDCB5B+B+BBCCBCCSCBCMBmHCBrBIB",!1)),Emoji_Presentation:()=>new g(m("64IBBuGDBEDDqQBBWBBzBLBsBUUOJJBSSBGGBJJGWWIBBCFFDIIFBBdkBkBCFFBBBC+B+BBBBZPP8aBB0BFFvlxDrGrG-FDDBIBsCZBCZZVDDBDBCCBWBBvFgBBNIBClCBCVBNqBBFEBNQBEEEBlCBCCCB5FBD+BBODBCXBTbbBOO3C0CBxBlCBHEEBBBDDBEDBMBBIIBkHLBF8I8IBtBBCJBC4FBxDMBEKBE4BBCFFBOBDLBFJB",!1)),Extended_Pictographic:()=>new g(m("pFFFu8HNN5GXX7CFBQBBwLBBNnFnFaKBFCBoGoHoHBLLK7B7BBCBCEBKGDBDDFDDCBBDIEBJJBBBGCCGLBMBBDCCBCCTDDBTTBEBCCCBEEBGGDBBFBBMBBGBBDGGBECBVVBGGBEBCDBDFFDDDBEBCDDCCCHEEHLLBQQDFFCFFBBBCMMBxBxBBBBKeP1LBBwOCBUBB0BFF7mBNN6SCCrrvDoBoBBCBlDLBQBBQPPBmBmBBIBxDBBNBBPDDBIBU3BBcOBLVVDIBCDBKWBH7FBDvDBDBBCCBDyCBDCBCDBG9HBC+BBMFBCXBIBBDHBNDDBCBDFFBOOBDDJBBKGGBBBNCBJCBDCCFHHEHHB0CBxBlCBGHBDQBECCBEBDMB7GlBBNDB5BHBLFBpBHBfBBNDBDNBKmBBNuBBCJBC4FB5CHBPxEBhI9fB",!1)),Hex_Digit:()=>new g(m("wBJIFbFq1-BJIFbF",!0)),Lowercase:()=>new g(m("hDZBwBLLFlBlBBWBCHBC2BCBQCBuBCDECBBBDCCDEEBFFDEEBBBDDDCCCDCCBCCDEECDDBDDBBBHGDCOCBSCBDDCEEC4BCBFBDDDBCCFICBjCBDiBBIBBfEBhDsBsBCEEDDBTccBhBBCBBECBCWCBDBCGDB0B0BBuBBCgBCK0BCDMCBgDCxBoBBo6CqBBCDB5XFBjkCIBC2D2DB+FBiC0ECBHBCgDCBHBJFBLHBJHBJFBLHBJHBJNBDHBJHBJHBJEBCBBHEEBBBCBBJDBDBBJHBLCBCBB6DOORMBuDEEBEEcKFDBBJDBFiBiBBOBFsasaBYBn6BvBBCEEBGCFCCBCCBGBEiDCBIICFFNlBBCGG0oesBCUaCBBBmEMCBBBC8BCBIBCCCDICFCCDCCBBBCSCGGGCMCFCCDOCWDBCCCBBB2ZqBBCNBHvCBh6TGBNEBqhBZBumBnBBpEjBB8EKBCOBCGBCBBkODDBBBCpBBCIBmoByBB+DVB75CfBhsVfB8BYBnqZZBbGBCRBbZBbDBCCCBFBCKBbZBbZBbZBbZBbZBbZBbZBbZBbbBdYBCFBbYBCFBbYBCFBbYBCFBbYBCFBC15B15BBIBCTBHFBmI9BB1lChBB",!1)),Math:()=>new g(m("rBRRBBBgBeeCuBuBFmBmBgB5W5WBBBDbbBDDBBBwQCBuwGccBBBMEEOPPBCBWEBMEBiCMBFEEBFFBDBTFFDJBCDDBEBHEEBDDBCCBBBCFBENBClClCBWBCFBCBBFBBFfBCHHBPPBqIBJDBVBB7CffBZBCZZMGB+NBBNJBFFBFBBDBBEEBPCCDFBMHBGBB6BCCeDBKCBxK-BBhI-PBxBUBDFB9+zB4Z4ZBEBCjFjFRCBeCCeCCkEHHBCBitDBBhrwBwoBwoBBzCBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBDxBBhwFDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBB-uCIB",!1)),Quotation_Mark:()=>new g(m("iBFFkEQQ96HHBaBBowDqOqOBCBOCBixzBDB+FFF7CBB",!1)),Terminal_Punctuation:()=>new g(m("hBLLCMMBEE-ZJJiQ6B6BpCPPCCB1FsBsBBJBCsHsHB3B3BBEBCHBgBmImIB1nB1nBBtFtFFFB4JBB2YHBmY9D9DBBBoCBB+ECBEoBoBBCBDBB7JBBjLDBjFBBLBBCCBeCB8FEB-BBBldYYBKKBBBwlDCBzJOOFLLCBBEBBtNBB8ndBBuICBkHEB-LBB3CBBgD4E4EBBB0ECBgERRB6H6HnxUDDB6B6BBBBCDBqFLLCMMBEEiCDD7hBxBxBnkBoGoG3JBB5EFBlCFB6CDB5dEBtBDB+FGBxDDBgECBiEBBHRRB5C5CBDBtDrJrJB2D2DBBBNBBnLDBEOBqDBB6HCBmQCC8HBB4CBBFBB-MCBuBmUmUBrCrCBspBspBBDB6vRBBmEiCiCBBBLqRqRBoJoJBnwTnwTovHDB",!1)),Uppercase:()=>new g(m("hCZBmDWBCGBiB2BCDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIJDCMCDQCDDDCCBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBDDBBBEWCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBpCDBNDBNDBNEBMDBnIFFECBDCBDEEBDBHGCBCBDDBLBBGbbBOBUzZzZBYBx5BvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoqZZBbZBbZBbCCBGDBDDBCBCHBbZBbBBCDBDHBCGBcBBCDBCEBCEEBFBcZBbZBbZBbZBbZBbZBfYBiBYBiBYBiBYBiBYBiB2pE2pEBgBBvgCZBHZBHZB",!1)),White_Space:()=>new g(m("JEBTlDlDbgvFgvFgsCKBeBBGwBwBh9DAB",!1))})),G(Rn,"SCRIPTS",new eo({Adlam:()=>new g(m("go6DrCFJFB",!0)),Ahom:()=>new g(m("g4lCaDOFW",!0)),Anatolian_Hieroglyphs:()=>new g(m("ggxCmS",!0)),Arabic:()=>new g(m("gwBEBCFBCNBCCBCfBCJBMZBCrDBChBBxCvBBxHhBBGqCBCcBxy8BtPBDvEBhBPBxDEBCmEBk7DeBkCFBJIBiBFBh43BDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBB",!1)),Armenian:()=>new g(m("xpBlBDxBDCks9BE",!0)),Avestan:()=>new g(m("g4iC1BEG",!0)),Balinese:()=>new g(m("g4GsCCxB",!0)),Bamum:()=>new g(m("g1pB3CpowB4R",!0)),Bassa_Vah:()=>new g(m("w26CdDF",!0)),Batak:()=>new g(m("g+GzBJD",!0)),Bengali:()=>new g(m("gsCDBCHBDBBDVBCGBCEEBCBDIBDBBDDBJFFBCCBDBDYB",!1)),Beria_Erfe:()=>new g(m("g17CYDY",!0)),Bhaiksuki:()=>new g(m("ggnCICsBCNLc",!0)),Bopomofo:()=>new g(m("qXB6wLqBxDf",!0)),Brahmi:()=>new g(m("ggkCtCFjBKA",!0)),Braille:()=>new g(m("ggK-H",!0)),Buginese:()=>new g(m("gwGbDB",!0)),Buhid:()=>new g(m("g6FT",!0)),Canadian_Aboriginal:()=>new g(m("ggF-TxRlC7tgCP",!0)),Carian:()=>new g(m("g1gCwB",!0)),Caucasian_Albanian:()=>new g(m("wphCzBMA",!0)),Chakma:()=>new g(m("gokC0BCR",!0)),Cham:()=>new g(m("gwqB2BKNDJDD",!0)),Cherokee:()=>new g(m("g9E1CDFz7lBvC",!0)),Chorasmian:()=>new g(m("w9jCb",!0)),Common:()=>new g(m("AgCBbFBbuBBCOBCEBYgBgBiOmBBGEBDTB1DKKHCC+THHPEEhB9E9ElQiEiEB6mB6mB2MDBjJwvBwvBBBBoCBBsGBBCumBumBOIIBCBCFBCCBDmYmYBKBD2CBCKBEKBCOBShBB-BlBBCCBDFBCaBCQBqBCBF5UBXKBW-cBhIzTBDpEBhQ9CBzMUBCCCBXBQHBFDB8CBBE7C7CB0E0EBOBhBlBBKxBxBB+BBgBwCBwB5C5CBmFBhuG-BBhoWhBBnDCBmFJB1HhFhFsMPPBzuUzuUBxGxGBIBXiBBCSBCDB0ECCBeBbFBbKBLuBuBBhChCBFBCGBLEBjICBFsBBEIBxCMB0BsBBlHaBltuBDB96D8HBEzNBHWBQQBgDzDB9B1HBLmBBD9BBEQBJBBIdBF8BB2GTBNTBN2CBKYBoE0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBDxBByjFjCBtC8BBjWrBBFjDBNOBDOBCOBCkBBLtFB5BZBCBBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBCmDBnghYffB+CB",!1)),Coptic:()=>new g(m("ifNxkKzDGG",!0)),Cuneiform:()=>new g(m("ggoC5cnDuDCEMjG",!0)),Cypriot:()=>new g(m("ggiCFBDCCBqBBCBBEDD",!1)),Cypro_Minoan:()=>new g(m("w8rCiD",!0)),Cyrillic:()=>new g(m("ggBkEBDoFBx6FKBhFtCtCojEfBhie-CBv8VBBhw4B9BBiBAB",!1)),Deseret:()=>new g(m("gghCvC",!0)),Devanagari:()=>new g(m("goCwCFODZh7nBfhwcJ",!0)),Dives_Akuru:()=>new g(m("gomCGBDDDBGBCBBCdBCBBDLBKJB",!1)),Dogra:()=>new g(m("ggmC7B",!0)),Duployan:()=>new g(m("ggvDqDGMEIIJDD",!0)),Egyptian_Hieroglyphs:()=>new g(m("ggsC1iBL68D",!0)),Elbasan:()=>new g(m("gohCnB",!0)),Elymaic:()=>new g(m("g-jCW",!0)),Ethiopic:()=>new g(m("gwEoCBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBDfBEZBnvGWBKGBCGBCGBCGBCGBCGBCGBCGBjpfFBDFBDFBKGBCGBylvCGBCDBCBBCOB",!1)),Garay:()=>new g(m("gqjClBEcJB",!0)),Georgian:()=>new g(m("glElBBCGGDqBBCDBx8CqBBDCBhiElBBCGG",!1)),Glagolitic:()=>new g(m("ggL-Ch9sDGCQDGCBCE",!0)),Gothic:()=>new g(m("w5gCa",!0)),Grantha:()=>new g(m("g4kCDBCHBDBBDVBCGBCBBCEBDIBDBBDCBDHHGGBDGBEEB",!1)),Greek:()=>new g(m("wbDBCCBDDBCFFCCCBBBCCCBSBC+BBPPBnpGEBzBEBFEB1ChKhKBUBDFBDlBBDFBDHBCGCBdBD0BBCOBCNBDFBCSBDCBCIBoJ-xiB-xiB7uVuCBSgj0Bgj0BBkCB",!1)),Gujarati:()=>new g(m("h0CCBCIBCCBCVBCGBCBBCEBDJBCCBCCBDQQBCBDLBIGB",!1)),Gunjala_Gondi:()=>new g(m("grnCFCBCkBCBCFIJ",!0)),Gurmukhi:()=>new g(m("hwCCBCFBFBBDVBCGBCBBCBBCBBDCCBDBFBBDCBEIIBCBCIIBPB",!1)),Gurung_Khema:()=>new g(m("go4C5B",!0)),Han:()=>new g(m("g0LZBC4CBN1GBwBCCaIBPDBle-tGBhC-vUBhoWtLBDpDBpodBBNGBqgkB-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),Hangul:()=>new g(m("goE-HvxHBiI9CyDeiCei3dckUj9KNWFwBl9JeEFDFDFDC",!0)),Hanifi_Rohingya:()=>new g(m("gojCnBJJ",!0)),Hanunoo:()=>new g(m("g5FU",!0)),Hatran:()=>new g(m("gniCSCBGE",!0)),Hebrew:()=>new g(m("xsB2BBJaBFFBpp9BZBCEBCCCBCCBCCBIB",!1)),Hiragana:()=>new g(m("hiM1CBHCBi7-C+IBTeeBBBulQAB",!1)),Imperial_Aramaic:()=>new g(m("giiCVCI",!0)),Inherited:()=>new g(m("gYvDB2IBBlOKBbhXhXBCB8qEtBBDLBlPCBCMBCGBFHHEBBnG-BBtQBBjGgBB65DDBsDBBmrzBPBRNBwejHjH7iEl+uBl+uBBsBBDWBhRCBSHBDGBfDBz6rYvHB",!1)),Inscriptional_Pahlavi:()=>new g(m("g7iCSGH",!0)),Inscriptional_Parthian:()=>new g(m("g6iCVDH",!0)),Javanese:()=>new g(m("gsqBtCDJFB",!0)),Kaithi:()=>new g(m("gkkCiCLA",!0)),Kannada:()=>new g(m("gkDMCCCWCJCEDICCCDIBGCCDDJCC",!0)),Katakana:()=>new g(m("hlM5CBDCBxHPBxGuBBC3CBvgzBJBCsBBzisBDBCGBCBBCgJgJBBBzBPPBCB",!1)),Kawi:()=>new g(m("g4nCQCoBEc",!0)),Kayah_Li:()=>new g(m("goqBtBCA",!0)),Kharoshthi:()=>new g(m("gwiCDCBGHCCCcDCFJII",!0)),Khitan_Small_Script:()=>new g(m("k-7C84G84GB0OBqBAB",!1)),Khmer:()=>new g(m("g8F9CDJHJnPf",!0)),Khojki:()=>new g(m("gwkCRCuB",!0)),Khudawadi:()=>new g(m("w1kC6BGJ",!0)),Kirat_Rai:()=>new g(m("gq7C5B",!0)),Lao:()=>new g(m("h0DBBCCCBDBCXBCCCBVBDEBCCCBFBCJBDDB",!1)),Latin:()=>new g(m("hCZBHZBwBQQGWBCeBCgOBoBEB8wGlBBHwBBGDBGMBClCBiC-HByLOORMBuEBBHccSoBB42CfBj1elDBExCBVOBxZqBBCIBCDB38TGB7gBZBHZBmhCFBCpBBCIBm61BeBHFB",!1)),Lepcha:()=>new g(m("ggH3BEOEC",!0)),Limbu:()=>new g(m("goGeBCLBFLBFEEBKB",!1)),Linear_A:()=>new g(m("gwhC2JKVLH",!0)),Linear_B:()=>new g(m("gggCLCZCSCBCODNjB6D",!0)),Lisu:()=>new g(m("wmpBvBx1eA",!0)),Lycian:()=>new g(m("g0gCc",!0)),Lydian:()=>new g(m("gpiCZGA",!0)),Mahajani:()=>new g(m("wqkCmB",!0)),Makasar:()=>new g(m("g3nCY",!0)),Malayalam:()=>new g(m("goDMCCCyBCCCFFPDZ",!0)),Mandaic:()=>new g(m("giCbDA",!0)),Manichaean:()=>new g(m("g2iCmBFL",!0)),Marchen:()=>new g(m("wjnCfDVCN",!0)),Masaram_Gondi:()=>new g(m("gonCGBCBBCrBBECCBCCBHBJJB",!1)),Medefaidrin:()=>new g(m("gy7C6C",!0)),Meetei_Mayek:()=>new g(m("g3qBWqGtBDJ",!0)),Mende_Kikakui:()=>new g(m("gg6DkGDP",!0)),Meroitic_Cursive:()=>new g(m("gtiCXFTDtB",!0)),Meroitic_Hieroglyphs:()=>new g(m("gsiCf",!0)),Miao:()=>new g(m("g47CqCF4BIQ",!0)),Modi:()=>new g(m("gwlCkCMJ",!0)),Mongolian:()=>new g(m("ggGBBDCCBSBH4CBIqBB2t-BMB",!1)),Mro:()=>new g(m("gy6CeCJFB",!0)),Multani:()=>new g(m("g0kCGBCCCBCBCOBCKB",!1)),Myanmar:()=>new g(m("ggE-EhqmBeiDfxibT",!0)),Nabataean:()=>new g(m("gkiCeJI",!0)),Nag_Mundari:()=>new g(m("wm5DpB",!0)),Nandinagari:()=>new g(m("gtmCHDtBDK",!0)),New_Tai_Lue:()=>new g(m("gsGrBFZHKEB",!0)),Newa:()=>new g(m("gglC7CCE",!0)),Nko:()=>new g(m("g+B6BDC",!0)),Nushu:()=>new g(m("h-7CvsQvsQBqMB",!1)),Nyiakeng_Puachue_Hmong:()=>new g(m("go4DsBENDJFB",!0)),Ogham:()=>new g(m("g0Fc",!0)),Ol_Chiki:()=>new g(m("wiHvB",!0)),Ol_Onal:()=>new g(m("wu5DqBFA",!0)),Old_Hungarian:()=>new g(m("gkjCyBOyBIF",!0)),Old_Italic:()=>new g(m("g4gCjBKC",!0)),Old_North_Arabian:()=>new g(m("g0iCf",!0)),Old_Permic:()=>new g(m("w6gCqB",!0)),Old_Persian:()=>new g(m("g9gCjBFN",!0)),Old_Sogdian:()=>new g(m("g4jCnB",!0)),Old_South_Arabian:()=>new g(m("gziCf",!0)),Old_Turkic:()=>new g(m("ggjCoC",!0)),Old_Uyghur:()=>new g(m("w7jCZ",!0)),Oriya:()=>new g(m("h4CCCHDBDVCGCBCEDIDBDCICFBCEDR",!0)),Osage:()=>new g(m("wlhCjBFjB",!0)),Osmanya:()=>new g(m("gkhCdDJ",!0)),Pahawh_Hmong:()=>new g(m("g46ClCLJCGCUGS",!0)),Palmyrene:()=>new g(m("gjiCf",!0)),Pau_Cin_Hau:()=>new g(m("g2mC4B",!0)),Phags_Pa:()=>new g(m("giqB3B",!0)),Phoenician:()=>new g(m("goiCbEA",!0)),Psalter_Pahlavi:()=>new g(m("g8iCRIDNG",!0)),Rejang:()=>new g(m("wpqBjBMA",!0)),Runic:()=>new g(m("g1FqCEK",!0)),Samaritan:()=>new g(m("ggCtBDO",!0)),Saurashtra:()=>new g(m("gkqBlCJL",!0)),Sharada:()=>new g(m("gskC-ChsCH",!0)),Shavian:()=>new g(m("wihCvB",!0)),Siddham:()=>new g(m("gslC1BDlB",!0)),Sidetic:()=>new g(m("gqiCZ",!0)),SignWriting:()=>new g(m("gg2DrUQECO",!0)),Sinhala:()=>new g(m("hsDCBCRBEXBCIBCDDBFBEFFBEBCCCBGBHJBDCBt-gCTB",!1)),Sogdian:()=>new g(m("w5jCpB",!0)),Sora_Sompeng:()=>new g(m("wmkCYIJ",!0)),Soyombo:()=>new g(m("wymCyC",!0)),Sundanese:()=>new g(m("g8G-BhIH",!0)),Sunuwar:()=>new g(m("g+mChBPJ",!0)),Syloti_Nagri:()=>new g(m("ggqBsB",!0)),Syriac:()=>new g(m("g4BNC7BDCxIK",!0)),Tagalog:()=>new g(m("g4FVKA",!0)),Tagbanwa:()=>new g(m("g7FMCCCB",!0)),Tai_Le:()=>new g(m("wqGdDE",!0)),Tai_Tham:()=>new g(m("gxG+BCcDKHJHN",!0)),Tai_Viet:()=>new g(m("g0qBiCZE",!0)),Tai_Yo:()=>new g(m("g25DeCVJB",!0)),Takri:()=>new g(m("g0lC5BHJ",!0)),Tamil:()=>new g(m("i8CBBCFBECBCDBEBBCCCBEEBEEBBBELBFEBECBCDBDHHPUBm+kCxBBOAB",!1)),Tangsa:()=>new g(m("wz6CuCCJ",!0)),Tangut:()=>new g(m("g-7CgBgBB+3GBhQeBiDyDB",!1)),Telugu:()=>new g(m("ggDMCCCWCPDICCCDIBCCCBDDDJII",!0)),Thaana:()=>new g(m("g8BxB",!0)),Thai:()=>new g(m("hwD5BGb",!0)),Tibetan:()=>new g(m("g4DnCCjBFmBCjBCOCGFB",!0)),Tifinagh:()=>new g(m("wpL3BIBPA",!0)),Tirhuta:()=>new g(m("gklCnCJJ",!0)),Todhri:()=>new g(m("guhCzB",!0)),Tolong_Siki:()=>new g(m("wtnCrBFJ",!0)),Toto:()=>new g(m("w04De",!0)),Tulu_Tigalari:()=>new g(m("g8kCJBCDDClBBCJBCDDCDBCJBCBBJBB",!1)),Ugaritic:()=>new g(m("g8gCdCA",!0)),Unknown:()=>new g(m("4bBBHDBICCVuMuMnBBBzBBBE4B4BBGBcDBHKBvI9B9BBmDmDBMB8BBByBBBQddBCCMEBjBEBuHJJBDDBXXICCBBBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBbFB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKmDmDNBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBjoIBvLBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCC-FCBHBBHBBHBBECBIIIBIBGBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIBlCJBCBBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMB3iBJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBJ76DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBjGUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIm8yVBCdBhD-DBxHvw-FB",!1)),Vai:()=>new g(m("gopBrJ",!0)),Vithkuqi:()=>new g(m("wrhCKCOCGCBCKCOCGCB",!0)),Wancho:()=>new g(m("g24D5BGA",!0)),Warang_Citi:()=>new g(m("glmCyCNA",!0)),Yezidi:()=>new g(m("g0jCpBCCDB",!0)),Yi:()=>new g(m("ggoBskBE2B",!0)),Zanabazar_Square:()=>new g(m("gwmCnC",!0))})),G(Rn,"FOLD_CATEGORIES",new eo({L:()=>new g(m("laA",!0)),LC:()=>new g(m("laA",!0)),Ll:()=>new g(m("hCZBmDWBCGBiBuBCEECDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIBBCBBCBBCOCDQCDBBCCCBBBC4BCIBBCBBDCCBCBCGC3HrBrBCEEJHHCCBCCCBCCBPBCIBkBJJCUCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBZHBJHBJHBJEBMEBMDBNEBMEBqJEEBHHxC9zC9zCBuBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoyehBB",!1)),Lt:()=>new g(m("kOCCBCCBCClBCCtsHHBJHBJHBMQQwBAB",!1)),Lu:()=>new g(m("hDZB7BqBqBBWBCHBCuBCEECDOCDsBCDECBBBDCCDEEGDDECBDDDCCCDFFDEECDDECCGBBCBBCBBCOCBSCDBBCEECkBCEQCJDDBCCFICBEBCBBCCCBEEBCCBCBCEBDCCBDDIDDCBBEFBGLLBnFnFsBCCEEEBBBvBDBCdBCBBECBCWCBDBCGD1BvBBCgBCK0BCDMCBgDCyBlBBq6CqBBDCB5XFBjkCIBCvHvHERRzD0ECGGGC8CCBHBJFBLHBJHBJFBMGCJHBJNBzBBBNSSBPPBEEpL2B2Bs1CvBBCEEBGCHDDLiDCJCCFNNBkBBCGG0oesBCUaCoEMCE8BCLCCDICFFFCBBDSCMOCFCCDOCb9a9advCBi8UZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBvyehBB",!1)),M:()=>new g(m("5cgBgBlgHAB",!1)),Mn:()=>new g(m("5cgBgBlgHAB",!1)),Emoji:()=>new g(m("8mJA",!0)),Extended_Pictographic:()=>new g(m("8mJA",!0)),Lowercase:()=>new g(m("hCZBmDWBCGBiBuBCEECDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIBBCBBCBBCOCDQCDBBCCCBBBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBJJCUCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBZHBJHBJHBJEBMEBMDBNEBMEBqJEEBHHuBPBUzZzZBYBx5BvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoyehBB",!1)),Math:()=>new g(m("ycGDCHHFMMDDDCHHFAB",!1)),Uppercase:()=>new g(m("hDZB7BqBqBBWBCHBCuBCEECDOCDsBCDECBBBDCCDEEGDDECBDDDCCCDFFDEECDDECCGBBCBBCBBCOCBSCDBBCEECkBCEQCJDDBCCFICBEBCBBCCCBEEBCCBCBCEBDCCBDDIDDCBBEFBGLLBnFnFsBCCEEEBBBvBDBCdBCBBECBCWCBDBCGD1BvBBCgBCK0BCDMCBgDCyBlBBq6CqBBDCB5XFBjkCIBCvHvHERRzD0ECGGGC8CCBHBJFBLHBJHBJFBMGCJHBJNBzBBBNSSBPPBEEpLiBiBBOBFsasaBYBn6BvBBCEEBGCHDDLiDCJCCFNNBkBBCGG0oesBCUaCoEMCE8BCLCCDICFFFCBBDSCMOCFCCDOCb9a9advCBi8UZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBvyehBB",!1))})),G(Rn,"FOLD_SCRIPT",new eo({Common:()=>new g(m("8cgBgB",!1)),Greek:()=>new g(m("1FwUwU",!1)),Inherited:()=>new g(m("5cgBgBlgHAB",!1))})),Rn),Ee,W=(Ee=class{static is32(e,t){let n=0,s=e.length;for(;n<s;){const i=n+Math.floor((s-n)/2),o=e.getLo(i),B=e.getHi(i);if(o<=t&&t<=B){const c=e.getStride(i);return(t-o)%c===0}t<o?s=i:n=i+1}return!1}static is(e,t){if(t<=Ee.MAX_LATIN1){for(let n=0;n<e.length;n++){if(t>e.getHi(n))continue;const s=e.getLo(n);if(t<s)return!1;const i=e.getStride(n);return(t-s)%i===0}return!1}return e.length>0&&t>=e.getLo(0)&&Ee.is32(e,t)}static isUpper(e){if(e<=Ee.MAX_LATIN1){const t=String.fromCodePoint(e);return t.toUpperCase()===t&&t.toLowerCase()!==t}return Ee.is(Ct.Upper,e)}static isPrint(e){return e<=Ee.MAX_LATIN1?e>=32&&e<Ee.MAX_ASCII||e>=161&&e!==173:Ee.is(Ct.Print,e)}static simpleFold(e){if(Ct.CASE_ORBIT.has(e))return Ct.CASE_ORBIT.get(e);const t=N.toLowerCase(e);return t!==e?t:N.toUpperCase(e)}static equalsIgnoreCase(e,t){if(e===t)return!0;if(e<0||t<0)return!1;if(e<=Ee.MAX_ASCII&&t<=Ee.MAX_ASCII)return 65<=e&&e<=90&&(e|=32),65<=t&&t<=90&&(t|=32),e===t;for(let n=Ee.simpleFold(e);n!==e;n=Ee.simpleFold(n))if(n===t)return!0;return!1}},G(Ee,"MAX_RUNE",1114111),G(Ee,"MAX_ASCII",127),G(Ee,"MAX_LATIN1",255),G(Ee,"MAX_BMP",65535),G(Ee,"MIN_FOLD",65),G(Ee,"MAX_FOLD",125251),G(Ee,"MIN_HIGH_SURROGATE",55296),G(Ee,"MAX_HIGH_SURROGATE",56319),G(Ee,"MIN_LOW_SURROGATE",56320),G(Ee,"MAX_LOW_SURROGATE",57343),G(Ee,"MIN_SUPPLEMENTARY_CODE_POINT",65536),Ee);const Bc=256,vC=new Uint8Array(Bc);for(let r=0;r<Bc;r++)vC[r]=97<=r&&r<=122||65<=r&&r<=90||48<=r&&r<=57||r===95?1:0;let BB=null,cB=null;var we,$=(we=class{static emptyInts(){return[]}static isByteArray(e){return Array.isArray(e)||e instanceof Uint8Array}static isalnum(e){return N.CODES.get("0")<=e&&e<=N.CODES.get("9")||N.CODES.get("a")<=e&&e<=N.CODES.get("z")||N.CODES.get("A")<=e&&e<=N.CODES.get("Z")}static unhex(e){return N.CODES.get("0")<=e&&e<=N.CODES.get("9")?e-N.CODES.get("0"):N.CODES.get("a")<=e&&e<=N.CODES.get("f")?e-N.CODES.get("a")+10:N.CODES.get("A")<=e&&e<=N.CODES.get("F")?e-N.CODES.get("A")+10:-1}static escapeRune(e){let t="";if(W.isPrint(e))we.METACHARACTERS.indexOf(String.fromCodePoint(e))>=0&&(t+="\\"),t+=String.fromCodePoint(e);else switch(e){case N.CODES.get('"'):t+='\\"';break;case N.CODES.get("\\"):t+="\\\\";break;case N.CODES.get("	"):t+="\\t";break;case N.CODES.get(`
`):t+="\\n";break;case N.CODES.get("\r"):t+="\\r";break;case N.CODES.get("\b"):t+="\\b";break;case N.CODES.get("\f"):t+="\\f";break;default:{let n=e.toString(16);e<256?(t+="\\x",n.length===1&&(t+="0"),t+=n):t+=`\\x{${n}}`;break}}return t}static stringToRunes(e){const t=String(e),n=[];let s=0;for(;s<t.length;){const i=t.codePointAt(s);n.push(i),s+=i>W.MAX_BMP?2:1}return n}static runeToString(e){return String.fromCodePoint(e)}static isWordRune(e){return e<Bc?vC[e]===1:!1}static emptyOpContext(e,t){let n=0;return e<0&&(n|=we.EMPTY_BEGIN_TEXT|we.EMPTY_BEGIN_LINE),e===10&&(n|=we.EMPTY_BEGIN_LINE),t<0&&(n|=we.EMPTY_END_TEXT|we.EMPTY_END_LINE),t===10&&(n|=we.EMPTY_END_LINE),we.isWordRune(e)!==we.isWordRune(t)?n|=we.EMPTY_WORD_BOUNDARY:n|=we.EMPTY_NO_WORD_BOUNDARY,n}static quoteMeta(e){return e.split("").map(t=>we.METACHARACTERS.indexOf(t)>=0?`\\${t}`:t).join("")}static charCount(e){return e>W.MAX_BMP?2:1}static toArray(e){const t=e.length,n=new Array(t);for(let s=0;s<t;s++)n[s]=e[s];return n}static stringToUtf8ByteArray(e){if(globalThis.TextEncoder)return BB||(BB=new TextEncoder),BB.encode(e);{let t=[],n=0;for(let s=0;s<e.length;s++){let i=e.charCodeAt(s);i<128?t[n++]=i:i<2048?(t[n++]=i>>6|192,t[n++]=i&63|128):(i&64512)===W.MIN_HIGH_SURROGATE&&s+1<e.length&&(e.charCodeAt(s+1)&64512)===W.MIN_LOW_SURROGATE?(i=W.MIN_SUPPLEMENTARY_CODE_POINT+((i&1023)<<10)+(e.charCodeAt(++s)&1023),t[n++]=i>>18|240,t[n++]=i>>12&63|128,t[n++]=i>>6&63|128,t[n++]=i&63|128):(t[n++]=i>>12|224,t[n++]=i>>6&63|128,t[n++]=i&63|128)}return t}}static utf8ByteArrayToString(e){if(globalThis.TextDecoder){cB||(cB=new TextDecoder("utf-8"));const t=e instanceof Uint8Array?e:new Uint8Array(e);return cB.decode(t)}else{let t=[],n=0,s=0;for(;n<e.length;){let i=e[n++];if(i<128)t[s++]=String.fromCharCode(i);else if(i>191&&i<224){let o=e[n++];t[s++]=String.fromCharCode((i&31)<<6|o&63)}else if(i>239&&i<365){let o=e[n++],B=e[n++],c=e[n++],u=((i&7)<<18|(o&63)<<12|(B&63)<<6|c&63)-W.MIN_SUPPLEMENTARY_CODE_POINT;t[s++]=String.fromCharCode(W.MIN_HIGH_SURROGATE+(u>>10)),t[s++]=String.fromCharCode(W.MIN_LOW_SURROGATE+(u&1023))}else{let o=e[n++],B=e[n++];t[s++]=String.fromCharCode((i&15)<<12|(o&63)<<6|B&63)}}return t.join("")}}},G(we,"METACHARACTERS","\\.+*?()|[]{}^$"),G(we,"EMPTY_BEGIN_LINE",1),G(we,"EMPTY_END_LINE",2),G(we,"EMPTY_BEGIN_TEXT",4),G(we,"EMPTY_END_TEXT",8),G(we,"EMPTY_WORD_BOUNDARY",16),G(we,"EMPTY_NO_WORD_BOUNDARY",32),G(we,"EMPTY_ALL",-1),we);const PC=(r=[],e=0)=>{const t=Object.create(null);for(let n=0;n<r.length;n++){const s=r[n],i=e+n;t[s]=i,t[i]=s}return Object.freeze(t)};var Nn,gr=(Nn=class{getEncoding(){throw Error("not implemented")}asCharSequence(){throw Error("not implemented")}asBytes(){throw Error("not implemented")}length(){throw Error("not implemented")}isUTF8Encoding(){return this.getEncoding()===Nn.Encoding.UTF_8}isUTF16Encoding(){return this.getEncoding()===Nn.Encoding.UTF_16}},G(Nn,"Encoding",PC(["UTF_16","UTF_8"])),Nn),Hl=class extends gr{constructor(r=null){super(),this.bytes=r}getEncoding(){return gr.Encoding.UTF_8}asCharSequence(){return $.utf8ByteArrayToString(this.bytes)}asBytes(){return this.bytes}length(){return this.bytes.length}},qD=class extends gr{constructor(r=null){super(),this.charSequence=r}getEncoding(){return gr.Encoding.UTF_16}asCharSequence(){return this.charSequence}asBytes(){return $.stringToUtf8ByteArray(this.charSequence.toString())}length(){return this.charSequence.length}},cr=class{static utf16(r){return new qD(r)}static utf8(r){return $.isByteArray(r)?new Hl(r):new Hl($.stringToUtf8ByteArray(r))}},ut=class{static EOF(){return-8}constructor(){this.end=0}canCheckPrefix(){return!0}endPos(){return this.end}hasString(){return!1}hasAnyString(){return!1}prefixLength(){return 0}},KD=class extends ut{constructor(r,e=0,t=r.length){super(),this.bytes=r,this.start=e,this.end=t}hasString(r,e){const t=r.bytes;if(t.length===0)return!0;const n=this.indexOf(this.bytes,t,this.start+e);return n!==-1&&n<=this.end-t.length}hasAnyString(r,e){return r.ac8?r.ac8.searchUTF8(this.bytes,this.start+e,this.end):!1}step(r){if(r+=this.start,r>=this.end)return ut.EOF();const e=this.bytes[r]&255;if(e<128)return e<<3|1;if(e>=194&&e<=223&&r+1<this.end){const t=this.bytes[r+1]&255;return(t&192)!==128?e<<3|1:((e&31)<<6|t&63)<<3|2}else if(e>=224&&e<=239&&r+2<this.end){const t=this.bytes[r+1]&255;if((t&192)!==128)return e<<3|1;const n=this.bytes[r+2]&255;return(n&192)!==128?e<<3|1:((e&15)<<12|(t&63)<<6|n&63)<<3|3}else if(e>=240&&e<=244&&r+3<this.end){const t=this.bytes[r+1]&255;if((t&192)!==128)return e<<3|1;const n=this.bytes[r+2]&255;if((n&192)!==128)return e<<3|1;const s=this.bytes[r+3]&255;return(s&192)!==128?e<<3|1:((e&7)<<18|(t&63)<<12|(n&63)<<6|s&63)<<3|4}else return e<<3|1}index(r,e){e+=this.start;const t=this.indexOf(this.bytes,r.prefixUTF8,e);return t<0?t:t-e}context(r){r+=this.start;let e=-1;if(r>this.start&&r<=this.end){let n=r-1;if(e=this.bytes[n--],e>=128){let s=r-4;for(s<this.start&&(s=this.start);n>=s&&(this.bytes[n]&192)===128;)n--;n<this.start&&(n=this.start),e=this.step(n-this.start)>>3}}const t=r<this.end?this.step(r-this.start)>>3:-1;return $.emptyOpContext(e,t)}indexOf(r,e,t=0){let n=e.length;if(n===0)return t<=this.end?t:-1;const s=e[0];let i=this.end-n;const o=typeof r.indexOf=="function";let B=t;for(;B<=i;){if(o){if(B=r.indexOf(s,B),B===-1||B>i)return-1}else{for(;B<=i&&r[B]!==s;)B++;if(B>i)return-1}let c=!0;for(let u=1;u<n;u++)if(r[B+u]!==e[u]){c=!1;break}if(c)return B;B++}return-1}prefixLength(r){return r.prefixUTF8.length}},WD=class extends ut{constructor(r,e=0,t=r.length){super(),this.charSequence=r,this.start=e,this.end=t}hasString(r,e){const t=this.charSequence.indexOf(r.str,this.start+e);return t!==-1&&t<=this.end-r.str.length}hasAnyString(r,e){return r.ac16?r.ac16.searchUTF16(this.charSequence,this.start+e,this.end):!1}step(r){if(r+=this.start,r>=this.end)return ut.EOF();const e=this.charSequence.charCodeAt(r);if(e<W.MIN_HIGH_SURROGATE||e>W.MAX_HIGH_SURROGATE||r+1>=this.end)return e<<3|1;const t=this.charSequence.charCodeAt(r+1);return t>=W.MIN_LOW_SURROGATE&&t<=W.MAX_LOW_SURROGATE?(e-W.MIN_HIGH_SURROGATE)*1024+(t-W.MIN_LOW_SURROGATE)+W.MIN_SUPPLEMENTARY_CODE_POINT<<3|2:e<<3|1}index(r,e){e+=this.start;const t=this.charSequence.indexOf(r.prefix,e);return t<0||t>this.end-r.prefix.length?-1:t-e}context(r){r+=this.start;const e=r>this.start&&r<=this.end?this.charSequence.charCodeAt(r-1):-1,t=r<this.end?this.charSequence.charCodeAt(r):-1;return $.emptyOpContext(e,t)}prefixLength(r){return r.prefix.length}},Ie=class{static fromUTF8(r,e=0,t=r.length){return new KD(r,e,t)}static fromUTF16(r,e=0,t=r.length){return new WD(r,e,t)}},wi=class extends Error{constructor(r){super(r),this.name="RE2JSException"}},_e=class extends wi{constructor(r,e=null){let t=`error parsing regexp: ${r}`;e&&(t+=`: \`${e}\``),super(t),this.name="RE2JSSyntaxException",this.message=t,this.error=r,this.input=e}getDescription(){return this.error}getPattern(){return this.input}},zD=class extends wi{constructor(r){super(r),this.name="RE2JSCompileException"}},ft=class extends wi{constructor(r){super(r),this.name="RE2JSGroupException"}},QD=class extends wi{constructor(r){super(r),this.name="RE2JSFlagsException"}},Gs=class extends wi{constructor(r){super(r),this.name="RE2JSInternalException"}},lr,Jl=(lr=class{static quoteReplacement(e,t=!1){return t?e.indexOf("\\")<0&&e.indexOf("$")<0?e:e.split("").map(n=>{const s=n.codePointAt(0);return s===N.CODES.get("\\")||s===N.CODES.get("$")?`\\${n}`:n}).join(""):e.indexOf("$")<0?e:e.split("").map(n=>n.codePointAt(0)===N.CODES.get("$")?"$$":n).join("")}constructor(e,t){if(e===null)throw new Error("pattern is null");this.patternInput=e;const n=this.patternInput.re2();this.patternGroupCount=n.numberOfCapturingGroups(),this.groups=[],this.namedGroups=n.namedGroups,this.numberOfInstructions=n.numberOfInstructions(),t instanceof gr?this.resetMatcherInput(t):$.isByteArray(t)?this.resetMatcherInput(cr.utf8(t)):this.resetMatcherInput(cr.utf16(t))}pattern(){return this.patternInput}reset(){return this.matcherInputLength=this.matcherInput.length(),this.appendPos=0,this.hasMatch=!1,this.hasGroups=!1,this.anchorFlag=0,this}resetMatcherInput(e){if(e===null)throw new Error("input is null");return e instanceof gr||($.isByteArray(e)?e=cr.utf8(e):e=cr.utf16(e)),this.matcherInput=e,this.reset(),this}start(e=0){if(typeof e=="string"){const t=this.namedGroups[e];if(!Number.isFinite(t))throw new ft(`group '${e}' not found`);e=t}return this.loadGroup(e),this.groups[2*e]}end(e=0){if(typeof e=="string"){const t=this.namedGroups[e];if(!Number.isFinite(t))throw new ft(`group '${e}' not found`);e=t}return this.loadGroup(e),this.groups[2*e+1]}programSize(){return this.numberOfInstructions}group(e=0){if(typeof e=="string"){const s=this.namedGroups[e];if(!Number.isFinite(s))throw new ft(`group '${e}' not found`);e=s}const t=this.start(e),n=this.end(e);return t<0&&n<0?null:this.substring(t,n)}getNamedGroups(){if(!this.hasMatch)throw new ft("perhaps no match attempted");const e=Object.create(null);for(const t of Object.keys(this.namedGroups))e[t]=this.group(t);return e}groupCount(){return this.patternGroupCount}loadGroup(e){if(e<0||e>this.patternGroupCount)throw new ft(`Group index out of bounds: ${e}`);if(!this.hasMatch)throw new ft("perhaps no match attempted");if(e===0||this.hasGroups)return;const t=this.matcherInputLength,n=this.patternInput.re2().matchMachineInput(this.matcherInput,this.groups[0],t,this.anchorFlag,1+this.patternGroupCount);if(!n[0])throw new ft("inconsistency in matching group data");this.groups=n[1],this.hasGroups=!0}matches(){return this.genMatch(0,x.ANCHOR_BOTH)}lookingAt(){return this.genMatch(0,x.ANCHOR_START)}find(e=null){if(e!==null){if(e<0||e>this.matcherInputLength)throw new ft(`start index out of bounds: ${e}`);return this.reset(),this.genMatch(e,0)}if(e=0,this.hasMatch&&(e=this.groups[1],this.groups[0]===this.groups[1])){const t=(this.matcherInput.isUTF16Encoding()?Ie.fromUTF16(this.matcherInput.asCharSequence(),0,this.matcherInputLength):Ie.fromUTF8(this.matcherInput.asBytes(),0,this.matcherInputLength)).step(e);t<0?e++:e+=t&7}return this.genMatch(e,x.UNANCHORED)}genMatch(e,t){const n=this.patternInput.re2().matchMachineInput(this.matcherInput,e,this.matcherInputLength,t,1);return n[0]?(this.groups=n[1],this.hasMatch=!0,this.hasGroups=this.patternGroupCount===0,this.anchorFlag=t,!0):(this.hasMatch=!1,!1)}substring(e,t){return this.matcherInput.isUTF8Encoding()?$.utf8ByteArrayToString(this.matcherInput.asBytes().slice(e,t)):this.matcherInput.asCharSequence().substring(e,t).toString()}inputLength(){return this.matcherInputLength}appendReplacement(e,t=!1){let n="";const s=this.start(),i=this.end();return this.appendPos<s&&(n+=this.substring(this.appendPos,s)),this.appendPos=i,n+=t?this.appendReplacementInternalJava(e):this.appendReplacementInternalJs(e),n}appendReplacementInternalJava(e){let t="",n=0;const s=e.length;let i=0;for(;i<s;){const o=e.codePointAt(i);if(o===N.CODES.get("\\")){if(n<i&&(t+=e.substring(n,i)),i++,i>=s)throw new ft("character to be escaped is missing");n=i,i++;continue}if(o===N.CODES.get("$")){if(n<i&&(t+=e.substring(n,i)),i+1>=s)throw new ft("Illegal group reference: group index is missing");const B=e.codePointAt(i+1);if(N.CODES.get("0")<=B&&B<=N.CODES.get("9")){let c=B-N.CODES.get("0"),u=i+2;for(;u<s;u++){const C=e.codePointAt(u);if(C<N.CODES.get("0")||C>N.CODES.get("9")||c*10+C-N.CODES.get("0")>this.patternGroupCount)break;c=c*10+C-N.CODES.get("0")}if(c>this.patternGroupCount)throw new ft(`n > number of groups: ${c}`);const h=this.group(c);h!==null&&(t+=h),i=u,n=i}else if(B===N.CODES.get("{")){let c=i+2;for(;c<s&&e.codePointAt(c)!==N.CODES.get("}");)c++;if(c>=s)throw new ft("named capture group is missing trailing '}'");const u=e.substring(i+2,c),h=this.group(u);h!==null&&(t+=h),i=c+1,n=i}else throw new ft("Illegal group reference");continue}i++}return n<s&&(t+=e.substring(n,s)),t}appendReplacementInternalJs(e){let t="",n=0;const s=e.length;for(let i=0;i<s-1;i++)if(e.codePointAt(i)===N.CODES.get("$")){let o=e.codePointAt(i+1);if(N.CODES.get("$")===o){n<i&&(t+=e.substring(n,i)),t+="$",i++,n=i+1;continue}else if(N.CODES.get("&")===o){n<i&&(t+=e.substring(n,i));const B=this.group(0);B!==null?t+=B:t+="$&",i++,n=i+1;continue}else if(N.CODES.get("`")===o){n<i&&(t+=e.substring(n,i)),t+=this.substring(0,this.start(0)),i++,n=i+1;continue}else if(N.CODES.get("'")===o){n<i&&(t+=e.substring(n,i)),t+=this.substring(this.end(0),this.matcherInputLength),i++,n=i+1;continue}else if(N.CODES.get("1")<=o&&o<=N.CODES.get("9")){let B=o-N.CODES.get("0");for(n<i&&(t+=e.substring(n,i)),i+=2;i<s&&(o=e.codePointAt(i),!(o<N.CODES.get("0")||o>N.CODES.get("9")||B*10+o-N.CODES.get("0")>this.patternGroupCount));i++)B=B*10+o-N.CODES.get("0");if(B>this.patternGroupCount){t+=`$${B}`,n=i,i--;continue}const c=this.group(B);c!==null&&(t+=c),n=i,i--;continue}else if(o===N.CODES.get("<")){n<i&&(t+=e.substring(n,i)),i++;let B=i+1;for(;B<e.length&&e.codePointAt(B)!==N.CODES.get(">")&&e.codePointAt(B)!==N.CODES.get(" ");)B++;if(B===e.length||e.codePointAt(B)!==N.CODES.get(">")){t+=e.substring(i-1,B+1),n=B+1,i=B;continue}const c=e.substring(i+1,B);if(Object.prototype.hasOwnProperty.call(this.namedGroups,c)){const u=this.group(c);u!==null&&(t+=u)}else t+=`$<${c}>`;n=B+1,i=B;continue}}return n<s&&(t+=e.substring(n,s)),t}appendTail(){return this.substring(this.appendPos,this.matcherInputLength)}replaceAll(e,t=!1){return this.replace(e,!0,t)}replaceFirst(e,t=!1){return this.replace(e,!1,t)}replace(e,t=!0,n=!1){let s="";this.reset();const i=typeof e=="function",o=Object.keys(this.namedGroups).length>0;let B=null;if(i){if(this.groupCount()>=lr.MAX_REPLACER_ARGS)throw new ft("Too many capture groups to safely invoke replacer function");B=this.matcherInput.isUTF8Encoding()?this.matcherInput.asBytes():this.matcherInput.asCharSequence()}for(;this.find()&&(s+=i?this.appendReplacementFunc(e,o,B):this.appendReplacement(e,n),!!t););return s+=this.appendTail(),s}appendReplacementFunc(e,t,n){let s="";const i=this.start(),o=this.end();this.appendPos<i&&(s+=this.substring(this.appendPos,i)),this.appendPos=o;const B=this.buildReplacerArgs(i,t,n);return s+=String(e(...B)),s}buildReplacerArgs(e,t,n){const s=[this.group(0)],i=this.groupCount();for(let o=1;o<=i;o++){const B=this.start(o);B<0?s.push(void 0):s.push(this.substring(B,this.end(o)))}if(s.push(e),s.push(n),t){const o=this.getNamedGroups();for(const B in o)o[B]===null&&(o[B]=void 0);s.push(o)}return s}},G(lr,"MAX_REPLACER_ARGS",65535),lr),ue,b=(ue=class{static isRuneOp(e){return ue.RUNE<=e&&e<=ue.RUNE_ANY_NOT_NL}static escapeRunes(e){let t='"';for(let n of e)t+=$.escapeRune(n);return t+='"',t}constructor(e){this.op=e,this.out=0,this.arg=0,this.runes=[],this.next=null}matchRune(e){if(this.runes.length===1){const o=this.runes[0];return(this.arg&x.FOLD_CASE)!==0?W.equalsIgnoreCase(o,e):e===o}const t=this.runes.length;if(t===0)return!1;if(t===2||t===4||t===6||t===8){for(let o=0;o<t;o+=2){if(e<this.runes[o])return!1;if(e<=this.runes[o+1])return!0}return!1}let n=0,s=t>>1;for(;s>1;){const o=s>>1;n+=this.runes[n+o<<1]<=e?o:0,s-=o}n+=this.runes[n<<1]<=e?1:0;const i=n-1;return i>=0&&e<=this.runes[i<<1|1]}matchRunePos(e){if(this.runes.length===1){const o=this.runes[0];return(this.arg&x.FOLD_CASE)!==0?W.equalsIgnoreCase(o,e)?0:-1:e===o?0:-1}const t=this.runes.length;if(t===0)return-1;if(t===2||t===4||t===6||t===8){for(let o=0;o<t;o+=2){if(e<this.runes[o])return-1;if(e<=this.runes[o+1])return Math.floor(o/2)}return-1}let n=0,s=t>>1;for(;s>1;){const o=s>>1;n+=this.runes[n+o<<1]<=e?o:0,s-=o}n+=this.runes[n<<1]<=e?1:0;const i=n-1;return i>=0&&e<=this.runes[i<<1|1]?i:-1}toString(){switch(this.op){case ue.ALT:return`alt -> ${this.out}, ${this.arg}`;case ue.ALT_MATCH:return`altmatch -> ${this.out}, ${this.arg}`;case ue.CAPTURE:return`cap ${this.arg} -> ${this.out}`;case ue.EMPTY_WIDTH:return`empty ${this.arg} -> ${this.out}`;case ue.MATCH:return`match${this.arg!==0?` ${this.arg}`:""}`;case ue.FAIL:return"fail";case ue.NOP:return`nop -> ${this.out}`;case ue.LB_WRITE:return`lbwrite ${this.arg} -> ${this.out}`;case ue.LB_CHECK:return`lbcheck ${this.arg} -> ${this.out}`;case ue.RUNE:return this.runes===null?"rune <null>":["rune ",ue.escapeRunes(this.runes),(this.arg&x.FOLD_CASE)!==0?"/i":""," -> ",this.out].join("");case ue.RUNE1:return`rune1 ${ue.escapeRunes(this.runes)} -> ${this.out}`;case ue.RUNE_ANY:return`any -> ${this.out}`;case ue.RUNE_ANY_NOT_NL:return`anynotnl -> ${this.out}`;default:throw new Error("unhandled case in Inst.toString")}}},G(ue,"ALT",1),G(ue,"ALT_MATCH",2),G(ue,"CAPTURE",3),G(ue,"EMPTY_WIDTH",4),G(ue,"FAIL",5),G(ue,"MATCH",6),G(ue,"NOP",7),G(ue,"RUNE",8),G(ue,"RUNE1",9),G(ue,"RUNE_ANY",10),G(ue,"RUNE_ANY_NOT_NL",11),G(ue,"LB_WRITE",12),G(ue,"LB_CHECK",13),ue),jl=class{constructor(r){this.sparse=new Int32Array(r),this.densePcs=new Int32Array(r),this.denseCaps=null,this.size=0,this.ncap=0}init(r){this.ncap=r;const e=this.densePcs.length*r;(!this.denseCaps||this.denseCaps.length<e)&&(this.denseCaps=new Int32Array(e))}contains(r){const e=this.sparse[r];return e<this.size&&this.densePcs[e]===r}isEmpty(){return this.size===0}add(r){const e=this.size++;return this.sparse[r]=e,this.densePcs[e]=r,e}clear(){this.size=0}toString(){let r="{";for(let e=0;e<this.size;e++)e!==0&&(r+=", "),r+=this.densePcs[e];return r+="}",r}},$D=class SB{static fromRE2(e){const t=new SB;return t.prog=e.prog,t.re2=e,t.q0=new jl(t.prog.numInst()),t.q1=new jl(t.prog.numInst()),t.matched=!1,t.matchcap=new Int32Array(t.prog.numCap<2?2:t.prog.numCap),t.ncap=0,t}static fromMachine(e){return SB.fromRE2(e.re2)}constructor(){this.prog=null,this.re2=null,this.q0=null,this.q1=null,this.matched=!1,this.matchcap=null,this.ncap=0,this.lbTable=null}init(e){this.ncap=e,e>this.matchcap.length?this.matchcap=new Int32Array(e).fill(-1):this.matchcap.fill(-1),this.q0.init(e),this.q1.init(e),this.prog.numLb>0&&((!this.lbTable||this.lbTable.length<this.prog.numLb+1)&&(this.lbTable=new Int32Array(this.prog.numLb+1)),this.lbTable.fill(-1))}submatches(){return this.ncap===0?$.emptyInts():$.toArray(this.matchcap.subarray(0,this.ncap))}match(e,t,n){const s=this.re2.cond;if(s===$.EMPTY_ALL||(n===x.ANCHOR_START||n===x.ANCHOR_BOTH)&&t!==0)return!1;this.matched=!1,this.matchcap.fill(-1);let i=this.prog.numLb>0?0:t,o=t,B=this.q0,c=this.q1,u=e.step(i),h=u>>3,C=u&7,p=-1,I=0;u!==ut.EOF()&&(u=e.step(i+C),p=u>>3,I=u&7);let R;for(i===0?R=$.emptyOpContext(-1,h):R=e.context(i);;){if(B.isEmpty()){if((s&$.EMPTY_BEGIN_TEXT)!==0&&i!==0||(n===x.ANCHOR_START||n===x.ANCHOR_BOTH)&&i!==0||this.matched)break;if(this.prog.numLb===0&&this.re2.prefix.length!==0&&p!==this.re2.prefixRune&&e.canCheckPrefix()){const z=e.index(this.re2,i);if(z<0)break;i+=z,u=e.step(i),h=u>>3,C=u&7,u=e.step(i+C),p=u>>3,I=u&7,R=e.context(i)}}if(i===0&&this.prog.numLb>0)for(let z=0;z<this.prog.lbStarts.length;z++)this.add(B,this.prog.lbStarts[z],i,this.matchcap,0,R);!this.matched&&(i===0||n===x.UNANCHORED)&&i>=o&&(this.ncap>0&&(this.matchcap[0]=i),this.add(B,this.prog.start,i,this.matchcap,0,R));const k=i+C;if(R=e.context(k),this.step(B,c,i,k,h,R,n,i===e.endPos()),C===0||this.ncap===0&&this.matched)break;i+=C,h=p,C=I,h!==-1&&(u=e.step(i+C),p=u>>3,I=u&7);const M=B;B=c,c=M}return c.clear(),this.matched}matchSet(e,t,n){const s=this.re2.cond;if(s===$.EMPTY_ALL)return[];if((n===x.ANCHOR_START||n===x.ANCHOR_BOTH)&&t!==0)return[];let i=this.prog.numLb>0?0:t,o=t,B=this.q0,c=this.q1,u=e.step(i),h=u>>3,C=u&7,p=-1,I=0;u!==ut.EOF()&&(u=e.step(i+C),p=u>>3,I=u&7);let R=i===0?$.emptyOpContext(-1,h):e.context(i);const k=new Set;for(;!(B.isEmpty()&&((s&$.EMPTY_BEGIN_TEXT)!==0&&i!==0||(n===x.ANCHOR_START||n===x.ANCHOR_BOTH)&&i!==0));){if(i===0&&this.prog.numLb>0)for(let re=0;re<this.prog.lbStarts.length;re++)this.add(B,this.prog.lbStarts[re],i,this.matchcap,0,R);(i===0||n===x.UNANCHORED)&&i>=o&&this.add(B,this.prog.start,i,this.matchcap,0,R);const M=i+C;R=e.context(M);for(let re=0;re<B.size;re++){const pe=B.densePcs[re],Se=this.prog.inst[pe],Oe=re*this.ncap;let Te=!1;switch(Se.op){case b.MATCH:if(n===x.ANCHOR_BOTH&&i!==e.endPos())break;k.add(Se.arg);break;case b.RUNE:Te=Se.matchRune(h);break;case b.RUNE1:Te=h===Se.runes[0];break;case b.RUNE_ANY:Te=!0;break;case b.RUNE_ANY_NOT_NL:Te=h!==10;break;default:continue}Te&&this.add(c,Se.out,M,B.denseCaps,Oe,R)}if(B.clear(),C===0)break;i+=C,h=p,C=I,h!==-1&&(u=e.step(i+C),p=u>>3,I=u&7);const z=B;B=c,c=z}return c.clear(),Array.from(k).sort((M,z)=>M-z)}step(e,t,n,s,i,o,B,c){const u=this.re2.longest;for(let h=0;h<e.size;h++){const C=e.densePcs[h],p=h*this.ncap;if(u&&this.matched&&this.ncap>0&&this.matchcap[0]<e.denseCaps[p])continue;const I=this.prog.inst[C];let R=!1;switch(I.op){case b.MATCH:if(B===x.ANCHOR_BOTH&&!c)break;if(this.ncap>0&&(!u||!this.matched||this.matchcap[1]<n)){e.denseCaps[p+1]=n;for(let k=0;k<this.ncap;k++)this.matchcap[k]=e.denseCaps[p+k]}u||(e.size=0),this.matched=!0;break;case b.RUNE:R=I.matchRune(i);break;case b.RUNE1:R=i===I.runes[0];break;case b.RUNE_ANY:R=!0;break;case b.RUNE_ANY_NOT_NL:R=i!==10;break;default:continue}R&&this.add(t,I.out,s,e.denseCaps,p,o)}e.clear()}add(e,t,n,s,i,o){for(;;){if(t===0||e.contains(t))return;const B=e.add(t),c=this.prog.inst[t];switch(c.op){case b.FAIL:return;case b.ALT:case b.ALT_MATCH:this.add(e,c.out,n,s,i,o),t=c.arg;continue;case b.EMPTY_WIDTH:if((c.arg&~o)===0){t=c.out;continue}return;case b.NOP:t=c.out;continue;case b.CAPTURE:if(c.arg<this.ncap){const u=s[i+c.arg];s[i+c.arg]=n,this.add(e,c.out,n,s,i,o),s[i+c.arg]=u;return}else{t=c.out;continue}case b.LB_WRITE:this.lbTable[Math.abs(c.arg)]=n,t=c.out;continue;case b.LB_CHECK:if(c.arg>0){if(this.lbTable[c.arg]===n){t=c.out;continue}}else if(this.lbTable[-c.arg]!==n){t=c.out;continue}return;case b.MATCH:case b.RUNE:case b.RUNE1:case b.RUNE_ANY:case b.RUNE_ANY_NOT_NL:if(this.ncap>0){const u=B*this.ncap;for(let h=0;h<this.ncap;h++)e.denseCaps[u+h]=s[i+h]}return;default:throw new Gs("unhandled")}}}};const ql=r=>{let e=-2128831035;for(let t=0;t<r.length;t++)e^=r[t],e=Math.imul(e,16777619);return e},YD=(r,e)=>{if(r.length!==e.length)return!1;for(let t=0;t<r.length;t++)if(r[t]!==e[t])return!1;return!0};var XD=class{constructor(r,e,t=[]){this.nfaStates=r,this.isMatch=e,this.matchIDs=t,this.nextLatin1=new Array(W.MAX_LATIN1+1).fill(null),this.nextLatin1Anchored=new Array(W.MAX_LATIN1+1).fill(null),this.transKeys=[],this.transVals=[],this.lastSeen=0}},sn,ZD=(sn=class{constructor(e,t=8388608){this.prog=e,this.stateCache=new Map,this.stateCount=0,this.startState=null,this.stateLimit=Math.max(1,Math.floor(t/sn.STATE_MEMORY_ESTIMATE)),this.cacheClears=0,this.failed=!1,this.clock=0}computeClosure(e){const t=new Set,n=[...e];let s=!1;const i=[];for(;n.length>0;){const B=n.pop();if(t.has(B))continue;t.add(B);const c=this.prog.getInst(B);switch(c.op){case b.MATCH:s=!0,i.includes(c.arg)||i.push(c.arg);break;case b.ALT:case b.ALT_MATCH:n.push(c.out),n.push(c.arg);break;case b.NOP:case b.CAPTURE:n.push(c.out);break;case b.EMPTY_WIDTH:case b.LB_WRITE:case b.LB_CHECK:return null}}const o=Int32Array.from(t).sort();return i.sort((B,c)=>B-c),{pcs:o,isMatch:s,matchIDs:i}}getState(e){const t=this.computeClosure(e);if(!t)return null;const n=t.pcs,s=ql(n);let i=this.stateCache.get(s);if(i)for(let B=0;B<i.length;B++){const c=i[B];if(YD(c.nfaStates,n))return c.lastSeen=++this.clock,c}else i=[],this.stateCache.set(s,i);if(this.failed)return null;if(this.stateCount>=this.stateLimit){if(this.cacheClears++,this.cacheClears>=sn.MAX_CACHE_CLEARS)return this.failed=!0,this.stateCache.clear(),this.stateCount=0,this.startState=null,null;this.evictCache(),i=this.stateCache.get(s),i||(i=[],this.stateCache.set(s,i))}const o=new XD(n,t.isMatch,t.matchIDs);return o.lastSeen=++this.clock,i.push(o),this.stateCount++,o}evictCache(){const e=[];for(const o of this.stateCache.values())for(let B=0;B<o.length;B++)e.push(o[B]);e.sort((o,B)=>o.lastSeen-B.lastSeen);const t=Math.max(1,Math.floor(this.stateLimit/2)),n=e.length-t,s=e.slice(n),i=new Set(s);this.stateCache.clear(),this.stateCount=0;for(let o=0;o<s.length;o++){const B=s[o];B.nextLatin1.fill(null),B.nextLatin1Anchored.fill(null),B.transKeys.length=0,B.transVals.length=0;const c=ql(B.nfaStates);let u=this.stateCache.get(c);u||(u=[],this.stateCache.set(c,u)),u.push(B),this.stateCount++}this.startState&&!i.has(this.startState)&&(this.startState=null)}step(e,t,n){if(t<=W.MAX_LATIN1)if(n===x.UNANCHORED){const o=e.nextLatin1[t];if(o!==null)return o}else{const o=e.nextLatin1Anchored[t];if(o!==null)return o}else{const o=t+(n===x.UNANCHORED?0:W.MAX_RUNE+1),B=e.transKeys,c=B.length;for(let u=0;u<c;u++)if(B[u]===o)return e.transVals[u]}const s=[];for(let o=0;o<e.nfaStates.length;o++){const B=e.nfaStates[o],c=this.prog.getInst(B);b.isRuneOp(c.op)&&c.matchRune(t)&&s.push(c.out)}n===x.UNANCHORED&&s.push(this.prog.start);const i=this.getState(s);if(t<=W.MAX_LATIN1)n===x.UNANCHORED?e.nextLatin1[t]=i:e.nextLatin1Anchored[t]=i;else{const o=t+(n===x.UNANCHORED?0:W.MAX_RUNE+1);e.transKeys.push(o),e.transVals.push(i)}return i}match(e,t,n){if((n===x.ANCHOR_START||n===x.ANCHOR_BOTH)&&t!==0)return!1;if(!this.startState&&(this.startState=this.getState([this.prog.start]),!this.startState))return null;let s=e.endPos(),i=this.startState;if(i.isMatch)if(n===x.ANCHOR_BOTH){if(t===s)return!0}else return!0;let o=t;for(;o<s;){const B=e.step(o),c=B>>3,u=B&7;if(u===0)break;if(i=n===x.UNANCHORED&&c<=W.MAX_LATIN1&&i.nextLatin1[c]||this.step(i,c,n),i===null)return null;if(i.lastSeen=++this.clock,i.isMatch)if(n===x.ANCHOR_BOTH){if(o+u===s)return!0}else return!0;if(i.nfaStates.length===0&&n!==x.UNANCHORED)return!1;o+=u}return!1}matchSet(e,t,n){if((n===x.ANCHOR_START||n===x.ANCHOR_BOTH)&&t!==0)return[];if(!this.startState&&(this.startState=this.getState([this.prog.start]),!this.startState))return null;let s=e.endPos(),i=this.startState;const o=new Set,B=(u,h)=>{u.isMatch&&(n===x.ANCHOR_BOTH?h===s&&u.matchIDs.forEach(C=>o.add(C)):u.matchIDs.forEach(C=>o.add(C)))};B(i,t);let c=t;for(;c<s;){const u=e.step(c),h=u>>3,C=u&7;if(C===0)break;if(i=n===x.UNANCHORED&&h<=W.MAX_LATIN1&&i.nextLatin1[h]||this.step(i,h,n),i===null)return null;if(i.lastSeen=++this.clock,c+=C,B(i,c),i.nfaStates.length===0&&n!==x.UNANCHORED)break}return Array.from(o).sort((u,h)=>u-h)}},G(sn,"MAX_CACHE_CLEARS",5),G(sn,"STATE_MEMORY_ESTIMATE",838),sn);const eI=32,tI=500,uB=256,nI=256*1024;var rI=class{constructor(){this.end=0,this.cap=new Int32Array(0),this.matchcap=new Int32Array(0),this.ncap=0,this.jobPc=new Int32Array(uB),this.jobArg=new Uint8Array(uB),this.jobPos=new Int32Array(uB),this.jobLen=0,this.visited=new Uint32Array(0)}reset(r,e,t){this.end=e,this.jobLen=0,this.ncap=t;const n=r.numInst()*(e+1)+eI-1>>>5;this.visited.length<n?this.visited=new Uint32Array(n):this.visited.fill(0,0,n),this.cap.length<t?this.cap=new Int32Array(t).fill(-1):this.cap.fill(-1,0,t),this.matchcap.length<t?this.matchcap=new Int32Array(t).fill(-1):this.matchcap.fill(-1,0,t)}shouldVisit(r,e){const t=r*(this.end+1)+e,n=t>>>5,s=1<<(t&31);return(this.visited[n]&s)!==0?!1:(this.visited[n]|=s,!0)}push(r,e,t,n){if(r.prog.getInst(e).op!==b.FAIL&&(n||this.shouldVisit(e,t))){if(this.jobLen>=this.jobPc.length){const s=this.jobPc.length*2,i=new Int32Array(s);i.set(this.jobPc),this.jobPc=i;const o=new Uint8Array(s);o.set(this.jobArg),this.jobArg=o;const B=new Int32Array(s);B.set(this.jobPos),this.jobPos=B}this.jobPc[this.jobLen]=e,this.jobArg[this.jobLen]=n?1:0,this.jobPos[this.jobLen]=t,this.jobLen++}}tryBacktrack(r,e,t,n,s){const i=r.longest;for(this.push(r,t,n,!1);this.jobLen>0;){this.jobLen--;let o=this.jobPc[this.jobLen],B=this.jobArg[this.jobLen]===1,c=this.jobPos[this.jobLen],u=!0;for(;!(!u&&!this.shouldVisit(o,c));){u=!1;const h=r.prog.getInst(o);switch(h.op){case b.FAIL:throw new Gs("unexpected InstFail");case b.ALT:if(B){B=!1,o=h.arg;continue}else{this.push(r,o,c,!0),o=h.out;continue}case b.ALT_MATCH:{const C=r.prog.getInst(h.out);if(b.isRuneOp(C.op)){this.push(r,h.arg,c,!1),o=h.arg,c=this.end;continue}this.push(r,h.out,this.end,!1),o=h.out;continue}case b.RUNE:{const C=e.step(c);if(C===ut.EOF()||!h.matchRune(C>>3))break;c+=C&7,o=h.out;continue}case b.RUNE1:{const C=e.step(c);if(C===ut.EOF()||C>>3!==h.runes[0])break;c+=C&7,o=h.out;continue}case b.RUNE_ANY_NOT_NL:{const C=e.step(c);if(C===ut.EOF()||C>>3===10)break;c+=C&7,o=h.out;continue}case b.RUNE_ANY:{const C=e.step(c);if(C===ut.EOF())break;c+=C&7,o=h.out;continue}case b.CAPTURE:if(B){this.cap[h.arg]=c;break}else{h.arg<this.ncap&&(this.push(r,o,this.cap[h.arg],!0),this.cap[h.arg]=c),o=h.out;continue}case b.EMPTY_WIDTH:{const C=e.context(c);if((h.arg&~C)!==0)break;o=h.out;continue}case b.NOP:o=h.out;continue;case b.MATCH:{if(s===x.ANCHOR_BOTH&&c!==this.end)break;if(this.ncap===0)return!0;this.ncap>1&&(this.cap[1]=c);const C=this.matchcap[1];if((C===-1||i&&c>0&&c>C)&&this.matchcap.set(this.cap),!i||c===this.end)return!0;break}case b.LB_WRITE:case b.LB_CHECK:throw new Gs("Backtracker cannot evaluate Lookbehind instructions");default:throw new Gs("bad inst")}break}}return i&&this.matchcap.length>1&&this.matchcap[1]>=0}};const to=[];var no=class SC{static shouldBacktrack(e){return e.numInst()<=tI}static maxBitStateLen(e){return SC.shouldBacktrack(e)?Math.floor(nI/e.numInst()):0}static execute(e,t,n,s,i){const o=e.cond;if(o===$.EMPTY_ALL||(s===x.ANCHOR_START||s===x.ANCHOR_BOTH)&&n!==0||(o&$.EMPTY_BEGIN_TEXT)!==0&&n!==0)return null;const B=to.length>0?to.pop():new rI,c=t.endPos();B.reset(e.prog,c,i);let u=!1;if((o&$.EMPTY_BEGIN_TEXT)!==0||s===x.ANCHOR_START||s===x.ANCHOR_BOTH)B.ncap>0&&(B.cap[0]=n),B.tryBacktrack(e,t,e.prog.start,n,s)&&(u=!0);else{let C=-1;for(;n<=c&&C!==0;n+=C){if(e.prefix.length>0){const I=t.index(e,n);if(I<0)break;n+=I}if(B.ncap>0&&(B.cap[0]=n),B.tryBacktrack(e,t,e.prog.start,n,s)){u=!0;break}const p=t.step(n);C=p===ut.EOF()?0:p&7}}if(!u)return to.push(B),null;const h=i===0?[]:$.toArray(B.matchcap.subarray(0,i));return to.push(B),h}},Kl=class{constructor(r){this.sparse=new Uint32Array(r),this.dense=new Uint32Array(r),this.size=0,this.nextIndex=0}empty(){return this.nextIndex>=this.size}next(){return this.dense[this.nextIndex++]}clear(){this.size=0,this.nextIndex=0}contains(r){return r<this.sparse.length&&this.sparse[r]<this.size&&this.dense[this.sparse[r]]===r}insert(r){this.contains(r)||this.insertNew(r)}insertNew(r){r>=this.sparse.length||(this.sparse[r]=this.size,this.dense[this.size]=r,this.size++)}};const sI=(r,e,t,n)=>{const s=r.length,i=e.length;let o=0,B=0;const c=[],u=[];let h=!0,C=-1;const p=I=>{const R=I?r:e,k=I?o:B,M=I?t:n;return C>0&&R[k]<=c[C]?!1:(c.push(R[k],R[k+1]),I?o+=2:B+=2,C+=2,u.push(M),!0)};for(;o<s||B<i;)if(B>=i?h=p(!0):o>=s||e[B]<r[o]?h=p(!1):h=p(!0),!h)return null;return{merged:c,next:u}};var iI=class{constructor(r){this.start=r.start,this.numCap=r.numCap,this.inst=new Array(r.inst.length);for(let e=0;e<r.inst.length;e++){const t=r.inst[e],n=new b(t.op);n.out=t.out,n.arg=t.arg,n.runes=t.runes?t.runes.slice():[],n.next=null,this.inst[e]=n}}};const oI=r=>{const e=new iI(r);for(let t=0;t<e.inst.length;t++){const n=e.inst[t];if(n.op!==b.ALT&&n.op!==b.ALT_MATCH)continue;let s="out",i="arg",o=e.inst[n[i]];if(o.op!==b.ALT&&o.op!==b.ALT_MATCH&&(s="arg",i="out",o=e.inst[n[i]],o.op!==b.ALT&&o.op!==b.ALT_MATCH))continue;const B=e.inst[n[s]];if(B.op===b.ALT||B.op===b.ALT_MATCH)continue;let c="out",u="arg",h=!1;o.out===t?h=!0:o.arg===t&&(h=!0,c="arg",u="out"),h&&(o[c]=n[s]),n[s]===o[c]&&(n[i]=o[u])}return e},aI=r=>{if(r.inst.length>=1e3)return null;const e=new Kl(r.inst.length),t=new Kl(r.inst.length),n=new Array(r.inst.length),s=new Array(r.inst.length).fill(!1),i=o=>{let B=!0;const c=r.inst[o];if(t.contains(o))return!0;switch(t.insert(o),c.op){case b.ALT:case b.ALT_MATCH:{B=i(c.out)&&i(c.arg);let u=s[c.out],h=s[c.arg];if(u&&h)return!1;if(h){const R=c.out;c.out=c.arg,c.arg=R;const k=u;u=h,h=k}u&&(s[o]=!0,c.op=b.ALT_MATCH);const C=n[c.out]||[],p=n[c.arg]||[],I=sI(C,p,c.out,c.arg);if(!I)return!1;n[o]=I.merged,c.next=new Uint32Array(I.next);break}case b.CAPTURE:case b.EMPTY_WIDTH:case b.NOP:B=i(c.out),s[o]=s[c.out],n[o]=n[c.out]?n[c.out].slice():[],c.next=new Uint32Array(Math.floor(n[o].length/2)+1).fill(c.out);break;case b.MATCH:case b.FAIL:s[o]=c.op===b.MATCH;break;case b.RUNE:{if(s[o]=!1,c.next&&c.next.length>0)break;if(e.insert(c.out),!c.runes||c.runes.length===0){n[o]=[],c.next=new Uint32Array([c.out]);break}let u=[];if(c.runes.length===1&&(c.arg&x.FOLD_CASE)!==0){const h=c.runes[0];u.push(h,h);for(let C=W.simpleFold(h);C!==h;C=W.simpleFold(C))u.push(C,C);u.sort((C,p)=>C-p)}else for(let h=0;h<c.runes.length;h++)u.push(c.runes[h]);n[o]=u,c.next=new Uint32Array(Math.floor(u.length/2)+1).fill(c.out),c.op=b.RUNE;break}case b.RUNE1:{if(s[o]=!1,c.next&&c.next.length>0)break;e.insert(c.out);let u=[];if((c.arg&x.FOLD_CASE)!==0){const h=c.runes[0];u.push(h,h);for(let C=W.simpleFold(h);C!==h;C=W.simpleFold(C))u.push(C,C);u.sort((C,p)=>C-p)}else u.push(c.runes[0],c.runes[0]);n[o]=u,c.next=new Uint32Array(Math.floor(u.length/2)+1).fill(c.out),c.op=b.RUNE;break}case b.RUNE_ANY:if(s[o]=!1,c.next&&c.next.length>0)break;e.insert(c.out),n[o]=[0,W.MAX_RUNE],c.next=new Uint32Array([c.out]);break;case b.RUNE_ANY_NOT_NL:if(s[o]=!1,c.next&&c.next.length>0)break;e.insert(c.out),n[o]=[0,9,11,W.MAX_RUNE],c.next=new Uint32Array(Math.floor(n[o].length/2)+1).fill(c.out);break}return B};for(e.clear(),e.insert(r.start);!e.empty();)if(t.clear(),!i(e.next()))return null;for(let o=0;o<r.inst.length;o++)n[o]&&(r.inst[o].runes=n[o]);return r},BI=(r,e)=>{for(let t=0;t<e.inst.length;t++){const n=e.inst[t];switch(n.op){case b.ALT:case b.ALT_MATCH:case b.RUNE:break;case b.CAPTURE:case b.EMPTY_WIDTH:case b.NOP:case b.MATCH:case b.FAIL:r.inst[t].next=null;break;case b.RUNE1:case b.RUNE_ANY:case b.RUNE_ANY_NOT_NL:r.inst[t].next=null,r.inst[t].op=n.op,r.inst[t].runes=n.runes?n.runes.slice():[];break}}};var Wl=class OC{static compile(e){if(e.start===0||e.numLb>0)return null;const t=e.inst[e.start];if(t.op!==b.EMPTY_WIDTH||(t.arg&$.EMPTY_BEGIN_TEXT)===0)return null;let n=!1;for(let i=0;i<e.inst.length;i++)if(e.inst[i].op===b.ALT||e.inst[i].op===b.ALT_MATCH){n=!0;break}for(let i=0;i<e.inst.length;i++){const o=e.inst[i],B=e.inst[o.out].op;switch(o.op){case b.ALT:case b.ALT_MATCH:if(B===b.MATCH||e.inst[o.arg].op===b.MATCH)return null;break;case b.EMPTY_WIDTH:if(B===b.MATCH){if((o.arg&$.EMPTY_END_TEXT)===$.EMPTY_END_TEXT)continue;return null}break;default:if(B===b.MATCH&&n)return null;break}}let s=oI(e);return s=aI(s),s!==null&&BI(s,e),s}static next(e,t){const n=e.matchRunePos(t);return n>=0?e.next[n]:e.op===b.ALT_MATCH?e.out:0}static execute(e,t,n,s,i){const o=e.onepass;if(!o)return null;const B=new Int32Array(i).fill(-1);let c=!1,u=t.step(n),h=u>>3,C=u&7,p=ut.EOF(),I=-1,R=0;u!==ut.EOF()&&(p=t.step(n+C),p!==ut.EOF()&&(I=p>>3,R=p&7));let k=n===0?$.emptyOpContext(-1,h):t.context(n),M=o.start,z;for(;;){switch(z=o.inst[M],M=z.out,z.op){case b.MATCH:return s===x.ANCHOR_BOTH&&n!==t.endPos()?null:(c=!0,B.length>0&&(B[0]=0,B[1]=n),i===0?[]:$.toArray(B));case b.RUNE:if(!z.matchRune(h))return null;break;case b.RUNE1:if(h!==z.runes[0])return null;break;case b.RUNE_ANY:break;case b.RUNE_ANY_NOT_NL:if(h===10)return null;break;case b.ALT:case b.ALT_MATCH:M=OC.next(z,h);continue;case b.FAIL:return null;case b.NOP:continue;case b.EMPTY_WIDTH:if((z.arg&~k)!==0)return null;continue;case b.CAPTURE:z.arg<B.length&&(B[z.arg]=n);continue;default:throw new Gs("bad inst")}if(C===0)break;k=$.emptyOpContext(h,I),n+=C,h=I,C=R,h!==-1&&(p=t.step(n+C),p!==ut.EOF()?(I=p>>3,R=p&7):(I=-1,R=0))}return c?i===0?[]:$.toArray(B):null}},Z,T=(Z=class{static isPseudoOp(e){return e>=Z.Op.LEFT_PAREN}static emptySubs(){return[]}static quoteIfHyphen(e){return e===N.CODES.get("-")?"\\":""}static fromRegexp(e){const t=new Z(e.op);return t.flags=e.flags,t.subs=e.subs,t.runes=e.runes,t.cap=e.cap,t.min=e.min,t.max=e.max,t.name=e.name,t.namedGroups=e.namedGroups,t.lb=e.lb,t}constructor(e){this.op=e,this.flags=0,this.subs=Z.emptySubs(),this.runes=[],this.min=0,this.max=0,this.cap=0,this.name=null,this.namedGroups=Object.create(null),this.lb=0}reinit(){this.flags=0,this.subs=Z.emptySubs(),this.runes=[],this.cap=0,this.min=0,this.max=0,this.name=null,this.namedGroups=Object.create(null),this.lb=0}toString(){return this.appendTo()}appendTo(){let e="";switch(this.op){case Z.Op.NO_MATCH:e+="[^\\x00-\\x{10FFFF}]";break;case Z.Op.EMPTY_MATCH:e+="(?:)";break;case Z.Op.STAR:case Z.Op.PLUS:case Z.Op.QUEST:case Z.Op.REPEAT:{const t=this.subs[0];switch(t.op>Z.Op.CAPTURE||t.op===Z.Op.LITERAL&&t.runes.length>1?e+=`(?:${t.appendTo()})`:e+=t.appendTo(),this.op){case Z.Op.STAR:e+="*";break;case Z.Op.PLUS:e+="+";break;case Z.Op.QUEST:e+="?";break;case Z.Op.REPEAT:e+=`{${this.min}`,this.min!==this.max&&(e+=",",this.max>=0&&(e+=this.max)),e+="}";break}(this.flags&x.NON_GREEDY)!==0&&(e+="?");break}case Z.Op.CONCAT:for(let t of this.subs)t.op===Z.Op.ALTERNATE?e+=`(?:${t.appendTo()})`:e+=t.appendTo();break;case Z.Op.ALTERNATE:{let t="";for(let n of this.subs)e+=t,t="|",e+=n.appendTo();break}case Z.Op.LITERAL:(this.flags&x.FOLD_CASE)!==0&&(e+="(?i:");for(let t of this.runes)e+=$.escapeRune(t);(this.flags&x.FOLD_CASE)!==0&&(e+=")");break;case Z.Op.ANY_CHAR_NOT_NL:e+="(?-s:.)";break;case Z.Op.ANY_CHAR:e+="(?s:.)";break;case Z.Op.PLB:e+=`(?<=${this.subs[0].appendTo()})`;break;case Z.Op.NLB:e+=`(?<!${this.subs[0].appendTo()})`;break;case Z.Op.CAPTURE:this.name===null||this.name.length===0?e+="(":e+=`(?P<${this.name}>`,this.subs[0].op!==Z.Op.EMPTY_MATCH&&(e+=this.subs[0].appendTo()),e+=")";break;case Z.Op.BEGIN_TEXT:e+="\\A";break;case Z.Op.END_TEXT:(this.flags&x.WAS_DOLLAR)!==0?e+="(?-m:$)":e+="\\z";break;case Z.Op.BEGIN_LINE:e+="^";break;case Z.Op.END_LINE:e+="$";break;case Z.Op.WORD_BOUNDARY:e+="\\b";break;case Z.Op.NO_WORD_BOUNDARY:e+="\\B";break;case Z.Op.CHAR_CLASS:if(this.runes.length%2!==0){e+="[invalid char class]";break}if(e+="[",this.runes.length===0)e+="^\\x00-\\x{10FFFF}";else if(this.runes[0]===0&&this.runes[this.runes.length-1]===W.MAX_RUNE){e+="^";for(let t=1;t<this.runes.length-1;t+=2){const n=this.runes[t]+1,s=this.runes[t+1]-1;e+=Z.quoteIfHyphen(n),e+=$.escapeRune(n),n!==s&&(e+="-",e+=Z.quoteIfHyphen(s),e+=$.escapeRune(s))}}else for(let t=0;t<this.runes.length;t+=2){const n=this.runes[t],s=this.runes[t+1];e+=Z.quoteIfHyphen(n),e+=$.escapeRune(n),n!==s&&(e+="-",e+=Z.quoteIfHyphen(s),e+=$.escapeRune(s))}e+="]";break;default:e+=this.op;break}return e}maxCap(){let e=0;if(this.op===Z.Op.CAPTURE&&(e=this.cap),this.subs!==null)for(let t of this.subs){const n=t.maxCap();e<n&&(e=n)}return e}equals(e){if(!(e!==null&&e instanceof Z)||this.op!==e.op)return!1;switch(this.op){case Z.Op.END_TEXT:if((this.flags&x.WAS_DOLLAR)!==(e.flags&x.WAS_DOLLAR))return!1;break;case Z.Op.LITERAL:case Z.Op.CHAR_CLASS:if(this.runes===null&&e.runes===null)break;if(this.runes===null||e.runes===null||this.runes.length!==e.runes.length)return!1;for(let t=0;t<this.runes.length;t++)if(this.runes[t]!==e.runes[t])return!1;break;case Z.Op.ALTERNATE:case Z.Op.CONCAT:if(this.subs.length!==e.subs.length)return!1;for(let t=0;t<this.subs.length;++t)if(!this.subs[t].equals(e.subs[t]))return!1;break;case Z.Op.STAR:case Z.Op.PLUS:case Z.Op.QUEST:if((this.flags&x.NON_GREEDY)!==(e.flags&x.NON_GREEDY)||!this.subs[0].equals(e.subs[0]))return!1;break;case Z.Op.REPEAT:if((this.flags&x.NON_GREEDY)!==(e.flags&x.NON_GREEDY)||this.min!==e.min||this.max!==e.max||!this.subs[0].equals(e.subs[0]))return!1;break;case Z.Op.CAPTURE:if(this.cap!==e.cap||(this.name===null?e.name!==null:this.name!==e.name)||!this.subs[0].equals(e.subs[0]))return!1;break;case Z.Op.PLB:case Z.Op.NLB:if(this.lb!==e.lb||!this.subs[0].equals(e.subs[0]))return!1;break}return!0}},G(Z,"Op",PC(["NO_MATCH","EMPTY_MATCH","LITERAL","CHAR_CLASS","ANY_CHAR_NOT_NL","ANY_CHAR","BEGIN_LINE","END_LINE","BEGIN_TEXT","END_TEXT","WORD_BOUNDARY","NO_WORD_BOUNDARY","CAPTURE","STAR","PLUS","QUEST","REPEAT","CONCAT","ALTERNATE","PLB","NLB","LEFT_PAREN","VERTICAL_BAR"])),Z),zl=class{constructor(r){this.next=[Object.create(null)],this.fail=[0],this.match=[!1];for(const t of r){let n=0;for(let s=0;s<t.length;s++){const i=t[s];i in this.next[n]||(this.next.push(Object.create(null)),this.fail.push(0),this.match.push(!1),this.next[n][i]=this.next.length-1),n=this.next[n][i]}this.match[n]=!0}const e=[];for(const t in this.next[0])if(Object.prototype.hasOwnProperty.call(this.next[0],t)){const n=this.next[0][t];this.fail[n]=0,e.push(n)}for(;e.length>0;){const t=e.shift();for(const n in this.next[t])if(Object.prototype.hasOwnProperty.call(this.next[t],n)){const s=this.next[t][n];let i=this.fail[t];for(;i!==0&&!(n in this.next[i]);)i=this.fail[i];n in this.next[i]?this.fail[s]=this.next[i][n]:this.fail[s]=0,this.match[s]=this.match[s]||this.match[this.fail[s]],e.push(s)}}}searchUTF16(r,e,t){let n=0;for(let s=e;s<t;s++){const i=r.charCodeAt(s);for(;n!==0&&!(i in this.next[n]);)n=this.fail[n];if(i in this.next[n]&&(n=this.next[n][i]),this.match[n])return!0}return!1}searchUTF8(r,e,t){let n=0;for(let s=e;s<t;s++){const i=r[s];for(;n!==0&&!(i in this.next[n]);)n=this.fail[n];if(i in this.next[n]&&(n=this.next[n][i]),this.match[n])return!0}return!1}},Wt,Ce=(Wt=class{constructor(e){this.type=e,this.subs=[],this.str="",this.bytes=null,this.ac16=null,this.ac8=null}eval(e,t){switch(this.type){case Wt.Type.NONE:return!0;case Wt.Type.EXACT:return e.hasString(this,t);case Wt.Type.AND:for(let n=0;n<this.subs.length;n++)if(!this.subs[n].eval(e,t))return!1;return!0;case Wt.Type.OR:if(this.ac16&&this.ac8)return e.hasAnyString(this,t);for(let n=0;n<this.subs.length;n++)if(this.subs[n].eval(e,t))return!0;return!1;default:return!0}}},G(Wt,"Type",{NONE:0,EXACT:1,AND:2,OR:3}),Wt),cI=class nn{static build(e){const t=nn.fromRegexp(e);return nn.simplify(t)}static fromRegexp(e){if(!e)return new Ce(Ce.Type.NONE);switch(e.op){case T.Op.PLB:case T.Op.NLB:case T.Op.NO_MATCH:case T.Op.EMPTY_MATCH:case T.Op.BEGIN_LINE:case T.Op.END_LINE:case T.Op.BEGIN_TEXT:case T.Op.END_TEXT:case T.Op.WORD_BOUNDARY:case T.Op.NO_WORD_BOUNDARY:case T.Op.CHAR_CLASS:case T.Op.ANY_CHAR_NOT_NL:case T.Op.ANY_CHAR:return new Ce(Ce.Type.NONE);case T.Op.LITERAL:{if(e.runes.length===0||(e.flags&x.FOLD_CASE)!==0)return new Ce(Ce.Type.NONE);const t=new Ce(Ce.Type.EXACT);let n="";for(let s=0;s<e.runes.length;s++)n+=String.fromCodePoint(e.runes[s]);return t.str=n,t.bytes=$.stringToUtf8ByteArray(t.str),t}case T.Op.CAPTURE:case T.Op.PLUS:return nn.fromRegexp(e.subs[0]);case T.Op.REPEAT:return e.min>=1?nn.fromRegexp(e.subs[0]):new Ce(Ce.Type.NONE);case T.Op.CONCAT:{const t=new Ce(Ce.Type.AND);for(const n of e.subs)t.subs.push(nn.fromRegexp(n));return t}case T.Op.ALTERNATE:{const t=new Ce(Ce.Type.OR);for(const n of e.subs)t.subs.push(nn.fromRegexp(n));return t}default:return new Ce(Ce.Type.NONE)}}static simplify(e){if(e.type===Ce.Type.EXACT||e.type===Ce.Type.NONE)return e;if(e.type===Ce.Type.AND){const t=[];for(const n of e.subs){const s=nn.simplify(n);if(s.type!==Ce.Type.NONE)if(s.type===Ce.Type.AND)for(let i=0;i<s.subs.length;i++)t.push(s.subs[i]);else t.push(s)}return t.length===0?new Ce(Ce.Type.NONE):t.length===1?t[0]:(e.subs=t,e)}if(e.type===Ce.Type.OR){const t=[];for(const o of e.subs){const B=nn.simplify(o);if(B.type===Ce.Type.NONE)return new Ce(Ce.Type.NONE);if(B.type===Ce.Type.OR)for(let c=0;c<B.subs.length;c++)t.push(B.subs[c]);else t.push(B)}if(t.length===0)return new Ce(Ce.Type.NONE);if(t.length===1)return t[0];const n=new Set,s=[];for(const o of t)o.type===Ce.Type.EXACT?n.has(o.str)||(n.add(o.str),s.push(o)):s.push(o);e.subs=s;let i=!0;for(const o of s)if(o.type!==Ce.Type.EXACT){i=!1;break}return i&&s.length>1&&(e.ac16=new zl(s.map(o=>{const B=[];for(let c=0;c<o.str.length;c++)B.push(o.str.charCodeAt(c));return B})),e.ac8=new zl(s.map(o=>o.bytes))),e}return e}},Nt=class{constructor(r=0,e=0){this.head=r,this.tail=e}},uI=class{constructor(){this.inst=[],this.start=0,this.numCap=2,this.lbStarts=[],this.numLb=0}getInst(r){return this.inst[r]}numInst(){return this.inst.length}addInst(r){this.inst.push(new b(r))}skipNop(r){let e=this.inst[r];for(;e.op===b.NOP||e.op===b.CAPTURE;)e=this.inst[r],r=e.out;return e}prefix(){let r="",e=this.skipNop(this.start);if(!b.isRuneOp(e.op)||e.runes.length!==1)return[e.op===b.MATCH,r];for(;b.isRuneOp(e.op)&&e.runes.length===1&&(e.arg&x.FOLD_CASE)===0;)r+=String.fromCodePoint(e.runes[0]),e=this.skipNop(e.out);return[e.op===b.MATCH,r]}startCond(){let r=0,e=this.start;e:for(;;){const t=this.inst[e];switch(t.op){case b.EMPTY_WIDTH:r|=t.arg;break;case b.FAIL:return-1;case b.CAPTURE:case b.NOP:break;default:break e}e=t.out}return r}patch(r,e){let t=r.head;for(;t!==0;){const n=this.inst[t>>1];(t&1)===0?(t=n.out,n.out=e):(t=n.arg,n.arg=e)}}append(r,e){if(r.head===0)return e;if(e.head===0)return r;const t=this.inst[r.tail>>1];return(r.tail&1)===0?t.out=e.head:t.arg=e.head,new Nt(r.head,e.tail)}toString(){let r="";for(let e=0;e<this.inst.length;e++){const t=r.length;r+=e,e===this.start&&(r+="*"),r+="        ".substring(r.length-t),r+=this.inst[e],r+=`
`}return r}},ro=class{constructor(r=0,e=new Nt,t=!1){this.i=r,this.out=e,this.nullable=t}},lI=class vr{static ANY_RUNE_NOT_NL(){return[0,N.CODES.get(`
`)-1,N.CODES.get(`
`)+1,W.MAX_RUNE]}static ANY_RUNE(){return[0,W.MAX_RUNE]}static compileRegexp(e){const t=new vr,n=t.compile(e);return t.prog.patch(n.out,t.newInst(b.MATCH).i),t.prog.start=n.i,t.prog}static compileSet(e){const t=new vr;if(e.length===0)return t.prog.start=t.newInst(b.FAIL).i,t.prog;let n=[];for(let i=0;i<e.length;i++){const o=t.compile(e[i]),B=t.newInst(b.MATCH);t.prog.getInst(B.i).arg=i,t.prog.patch(o.out,B.i),n.push(o.i)}let s=n[0];for(let i=1;i<n.length;i++){const o=t.newInst(b.ALT),B=t.prog.getInst(o.i);B.out=s,B.arg=n[i],s=o.i}return t.prog.start=s,t.prog}constructor(){this.prog=new uI,this.newInst(b.FAIL)}newInst(e){return this.prog.addInst(e),new ro(this.prog.numInst()-1,new Nt,!0)}nop(){const e=this.newInst(b.NOP);return e.out=new Nt(e.i<<1,e.i<<1),e}fail(){return new ro}cap(e){const t=this.newInst(b.CAPTURE);return t.out=new Nt(t.i<<1,t.i<<1),this.prog.getInst(t.i).arg=e,this.prog.numCap<e+1&&(this.prog.numCap=e+1),t}cat(e,t){return e.i===0||t.i===0?this.fail():(this.prog.patch(e.out,t.i),new ro(e.i,t.out,e.nullable&&t.nullable))}alt(e,t){if(e.i===0)return t;if(t.i===0)return e;const n=this.newInst(b.ALT),s=this.prog.getInst(n.i);return s.out=e.i,s.arg=t.i,n.out=this.prog.append(e.out,t.out),n.nullable=e.nullable||t.nullable,n}loop(e,t){const n=this.newInst(b.ALT),s=this.prog.getInst(n.i);return t?(s.arg=e.i,n.out=new Nt(n.i<<1,n.i<<1)):(s.out=e.i,n.out=new Nt(n.i<<1|1,n.i<<1|1)),this.prog.patch(e.out,n.i),n}quest(e,t){const n=this.newInst(b.ALT),s=this.prog.getInst(n.i);return t?(s.arg=e.i,n.out=new Nt(n.i<<1,n.i<<1)):(s.out=e.i,n.out=new Nt(n.i<<1|1,n.i<<1|1)),n.out=this.prog.append(n.out,e.out),n}star(e,t){return e.nullable?this.quest(this.plus(e,t),t):this.loop(e,t)}plus(e,t){return new ro(e.i,this.loop(e,t).out,e.nullable)}empty(e){const t=this.newInst(b.EMPTY_WIDTH);return this.prog.getInst(t.i).arg=e,t.out=new Nt(t.i<<1,t.i<<1),t}rune(e,t){const n=this.newInst(b.RUNE);n.nullable=!1;const s=this.prog.getInst(n.i);return s.runes=e,t&=x.FOLD_CASE,(e.length!==1||W.simpleFold(e[0])===e[0])&&(t&=-2),s.arg=t,n.out=new Nt(n.i<<1,n.i<<1),(t&x.FOLD_CASE)===0&&e.length===1||e.length===2&&e[0]===e[1]?s.op=b.RUNE1:e.length===2&&e[0]===0&&e[1]===W.MAX_RUNE?s.op=b.RUNE_ANY:e.length===4&&e[0]===0&&e[1]===N.CODES.get(`
`)-1&&e[2]===N.CODES.get(`
`)+1&&e[3]===W.MAX_RUNE&&(s.op=b.RUNE_ANY_NOT_NL),n}lookBehind(e,t){const n=this.newInst(b.LB_WRITE);this.prog.getInst(n.i).arg=t;const s=this.rune(vr.ANY_RUNE(),0),i=this.star(s,!0),o=this.cat(i,e);this.prog.patch(o.out,n.i);const B=this.newInst(b.LB_CHECK);return this.prog.getInst(B.i).arg=t,this.prog.lbStarts.push(o.i),Math.abs(t)>this.prog.numLb&&(this.prog.numLb=Math.abs(t)),B.out=new Nt(B.i<<1,B.i<<1),B}compile(e){switch(e.op){case T.Op.NO_MATCH:return this.fail();case T.Op.EMPTY_MATCH:return this.nop();case T.Op.LITERAL:if(e.runes.length===0)return this.nop();{let t=null;for(let n of e.runes){const s=this.rune([n],e.flags);t=t===null?s:this.cat(t,s)}return t}case T.Op.CHAR_CLASS:return this.rune(e.runes,e.flags);case T.Op.ANY_CHAR_NOT_NL:return this.rune(vr.ANY_RUNE_NOT_NL(),0);case T.Op.ANY_CHAR:return this.rune(vr.ANY_RUNE(),0);case T.Op.BEGIN_LINE:return this.empty($.EMPTY_BEGIN_LINE);case T.Op.END_LINE:return this.empty($.EMPTY_END_LINE);case T.Op.BEGIN_TEXT:return this.empty($.EMPTY_BEGIN_TEXT);case T.Op.END_TEXT:return this.empty($.EMPTY_END_TEXT);case T.Op.WORD_BOUNDARY:return this.empty($.EMPTY_WORD_BOUNDARY);case T.Op.NO_WORD_BOUNDARY:return this.empty($.EMPTY_NO_WORD_BOUNDARY);case T.Op.PLB:case T.Op.NLB:return this.lookBehind(this.compile(e.subs[0]),e.lb);case T.Op.CAPTURE:{const t=this.cap(e.cap<<1),n=this.compile(e.subs[0]),s=this.cap(e.cap<<1|1);return this.cat(this.cat(t,n),s)}case T.Op.STAR:return this.star(this.compile(e.subs[0]),(e.flags&x.NON_GREEDY)!==0);case T.Op.PLUS:return this.plus(this.compile(e.subs[0]),(e.flags&x.NON_GREEDY)!==0);case T.Op.QUEST:return this.quest(this.compile(e.subs[0]),(e.flags&x.NON_GREEDY)!==0);case T.Op.CONCAT:if(e.subs.length===0)return this.nop();{let t=null;for(let n of e.subs){const s=this.compile(n);t=t===null?s:this.cat(t,s)}return t}case T.Op.ALTERNATE:if(e.subs.length===0)return this.nop();{let t=null;for(let n of e.subs){const s=this.compile(n);t=t===null?s:this.alt(t,s)}return t}default:throw new zD("regexp: unhandled case in compile")}}},hI=class wt{static simplify(e){if(e===null)return null;switch(e.op){case T.Op.PLB:case T.Op.NLB:case T.Op.CAPTURE:{const t=wt.simplify(e.subs[0]);if(t!==e.subs[0]){const n=T.fromRegexp(e);return n.runes=[],n.subs=[t],n}return e}case T.Op.CONCAT:case T.Op.ALTERNATE:{const t=[];let n=!1;for(let s=0;s<e.subs.length;s++){const i=e.subs[s],o=wt.simplify(i);if(o!==i&&(n=!0),e.op===T.Op.CONCAT){if(o.op===T.Op.NO_MATCH)return new T(T.Op.NO_MATCH);if(o.op===T.Op.EMPTY_MATCH){n=!0;continue}if(o.op===T.Op.CONCAT){n=!0;for(let B=0;B<o.subs.length;B++)t.push(o.subs[B]);continue}}else if(e.op===T.Op.ALTERNATE){if(o.op===T.Op.NO_MATCH){n=!0;continue}if(o.op===T.Op.ALTERNATE){n=!0;for(let B=0;B<o.subs.length;B++)t.push(o.subs[B]);continue}}t.push(o)}if(n){if(t.length===0)return new T(e.op===T.Op.CONCAT?T.Op.EMPTY_MATCH:T.Op.NO_MATCH);if(t.length===1)return t[0];const s=T.fromRegexp(e);return s.runes=[],s.subs=t,s}return e}case T.Op.CHAR_CLASS:return e.runes===null?e:e.runes.length===0?new T(T.Op.NO_MATCH):e.runes.length===2&&e.runes[0]===0&&e.runes[1]===W.MAX_RUNE?new T(T.Op.ANY_CHAR):e.runes.length===4&&e.runes[0]===0&&e.runes[1]===N.CODES.get(`
`)-1&&e.runes[2]===N.CODES.get(`
`)+1&&e.runes[3]===W.MAX_RUNE?new T(T.Op.ANY_CHAR_NOT_NL):e;case T.Op.STAR:case T.Op.PLUS:case T.Op.QUEST:{const t=wt.simplify(e.subs[0]);return wt.simplify1(e.op,e.flags,t,e)}case T.Op.REPEAT:{if(e.min===0&&e.max===0)return new T(T.Op.EMPTY_MATCH);const t=wt.simplify(e.subs[0]);if(e.max===-1){if(e.min===0)return wt.simplify1(T.Op.STAR,e.flags,t,null);if(e.min===1)return wt.simplify1(T.Op.PLUS,e.flags,t,null);const s=new T(T.Op.CONCAT),i=[];for(let o=0;o<e.min-1;o++)i.push(t);return i.push(wt.simplify1(T.Op.PLUS,e.flags,t,null)),s.subs=i.slice(0),wt.simplify(s)}if(e.min===1&&e.max===1)return t;let n=null;if(e.min>0){n=[];for(let s=0;s<e.min;s++)n.push(t)}if(e.max>e.min){let s=wt.simplify1(T.Op.QUEST,e.flags,t,null);for(let i=e.min+1;i<e.max;i++){const o=new T(T.Op.CONCAT);o.subs=[t,s],s=wt.simplify1(T.Op.QUEST,e.flags,o,null)}if(n===null)return s;n.push(s)}if(n!==null){const s=new T(T.Op.CONCAT);return s.subs=n.slice(0),wt.simplify(s)}return new T(T.Op.NO_MATCH)}}return e}static simplify1(e,t,n,s){if(n.op===T.Op.EMPTY_MATCH)return n;if(n.op===T.Op.NO_MATCH)return e===T.Op.PLUS?n:new T(T.Op.EMPTY_MATCH);if(e===n.op&&(t&x.NON_GREEDY)===(n.flags&x.NON_GREEDY))return n;if(s!==null&&s.op===e&&(s.flags&x.NON_GREEDY)===(t&x.NON_GREEDY)&&n===s.subs[0])return s;const i=new T(e);return i.flags=t,i.subs=[n],i}},he=class{constructor(r,e){this.sign=r,this.cls=e}};const Ql=[48,57],$l=[9,10,12,13,32,32],Yl=[48,57,65,90,95,95,97,122],Xl=new Map([["\\d",new he(1,Ql)],["\\D",new he(-1,Ql)],["\\s",new he(1,$l)],["\\S",new he(-1,$l)],["\\w",new he(1,Yl)],["\\W",new he(-1,Yl)]]),Zl=[48,57,65,90,97,122],eh=[65,90,97,122],th=[0,127],nh=[9,9,32,32],rh=[0,31,127,127],sh=[48,57],ih=[33,126],oh=[97,122],ah=[32,126],Bh=[33,47,58,64,91,96,123,126],ch=[9,13,32,32],uh=[65,90],lh=[48,57,65,90,95,95,97,122],hh=[48,57,65,70,97,102],fh=new Map([["[:alnum:]",new he(1,Zl)],["[:^alnum:]",new he(-1,Zl)],["[:alpha:]",new he(1,eh)],["[:^alpha:]",new he(-1,eh)],["[:ascii:]",new he(1,th)],["[:^ascii:]",new he(-1,th)],["[:blank:]",new he(1,nh)],["[:^blank:]",new he(-1,nh)],["[:cntrl:]",new he(1,rh)],["[:^cntrl:]",new he(-1,rh)],["[:digit:]",new he(1,sh)],["[:^digit:]",new he(-1,sh)],["[:graph:]",new he(1,ih)],["[:^graph:]",new he(-1,ih)],["[:lower:]",new he(1,oh)],["[:^lower:]",new he(-1,oh)],["[:print:]",new he(1,ah)],["[:^print:]",new he(-1,ah)],["[:punct:]",new he(1,Bh)],["[:^punct:]",new he(-1,Bh)],["[:space:]",new he(1,ch)],["[:^space:]",new he(-1,ch)],["[:upper:]",new he(1,uh)],["[:^upper:]",new he(-1,uh)],["[:word:]",new he(1,lh)],["[:^word:]",new he(-1,lh)],["[:xdigit:]",new he(1,hh)],["[:^xdigit:]",new he(-1,hh)]]);var An=class vn{static charClassToString(e,t){let n="[";for(let s=0;s<t;s+=2){s>0&&(n+=" ");const i=e[s],o=e[s+1];i===o?n+=`0x${i.toString(16)}`:n+=`0x${i.toString(16)}-0x${o.toString(16)}`}return n+="]",n}static cmp(e,t,n,s){const i=e[t]-n;return i!==0?i:s-e[t+1]}static qsortIntPair(e,t,n){const s=((t+n)/2|0)&-2,i=e[s],o=e[s+1];let B=t,c=n;for(;B<=c;){for(;B<n&&vn.cmp(e,B,i,o)<0;)B+=2;for(;c>t&&vn.cmp(e,c,i,o)>0;)c-=2;if(B<=c){if(B!==c){let u=e[B];e[B]=e[c],e[c]=u,u=e[B+1],e[B+1]=e[c+1],e[c+1]=u}B+=2,c-=2}}t<c&&vn.qsortIntPair(e,t,c),B<n&&vn.qsortIntPair(e,B,n)}constructor(e=$.emptyInts()){this.r=e,this.len=e.length}toArray(){return this.len===this.r.length?this.r:this.r.slice(0,this.len)}cleanClass(){if(this.len<4)return this;vn.qsortIntPair(this.r,0,this.len-2);let e=2;for(let t=2;t<this.len;t+=2){const n=this.r[t],s=this.r[t+1];if(n<=this.r[e-1]+1){s>this.r[e-1]&&(this.r[e-1]=s);continue}this.r[e]=n,this.r[e+1]=s,e+=2}return this.len=e,this}appendLiteral(e,t){return(t&x.FOLD_CASE)!==0?this.appendFoldedRange(e,e):this.appendRange(e,e)}appendRange(e,t){if(this.len>0){for(let n=2;n<=4;n+=2)if(this.len>=n){const s=this.r[this.len-n],i=this.r[this.len-n+1];if(e<=i+1&&s<=t+1)return e<s&&(this.r[this.len-n]=e),t>i&&(this.r[this.len-n+1]=t),this}}return this.r[this.len++]=e,this.r[this.len++]=t,this}appendFoldedRange(e,t){if(e<=W.MIN_FOLD&&t>=W.MAX_FOLD)return this.appendRange(e,t);if(t<W.MIN_FOLD||e>W.MAX_FOLD)return this.appendRange(e,t);e<W.MIN_FOLD&&(this.appendRange(e,W.MIN_FOLD-1),e=W.MIN_FOLD),t>W.MAX_FOLD&&(this.appendRange(W.MAX_FOLD+1,t),t=W.MAX_FOLD);for(let n=e;n<=t;n++){this.appendRange(n,n);for(let s=W.simpleFold(n);s!==n;s=W.simpleFold(s))this.appendRange(s,s)}return this}appendClass(e){for(let t=0;t<e.length;t+=2)this.appendRange(e[t],e[t+1]);return this}appendFoldedClass(e){for(let t=0;t<e.length;t+=2)this.appendFoldedRange(e[t],e[t+1]);return this}appendNegatedClass(e){let t=0;for(let n=0;n<e.length;n+=2){const s=e[n],i=e[n+1];t<=s-1&&this.appendRange(t,s-1),t=i+1}return t<=W.MAX_RUNE&&this.appendRange(t,W.MAX_RUNE),this}appendTable(e){for(let t=0;t<e.length;++t){const n=e.getLo(t),s=e.getHi(t),i=e.getStride(t);if(i===1){this.appendRange(n,s);continue}for(let o=n;o<=s;o+=i)this.appendRange(o,o)}return this}appendNegatedTable(e){let t=0;for(let n=0;n<e.length;++n){const s=e.getLo(n),i=e.getHi(n),o=e.getStride(n);if(o===1){t<=s-1&&this.appendRange(t,s-1),t=i+1;continue}for(let B=s;B<=i;B+=o)t<=B-1&&this.appendRange(t,B-1),t=B+1}return t<=W.MAX_RUNE&&this.appendRange(t,W.MAX_RUNE),this}appendTableWithSign(e,t){return t<0?this.appendNegatedTable(e):this.appendTable(e)}negateClass(){let e=0,t=0;for(let n=0;n<this.len;n+=2){const s=this.r[n],i=this.r[n+1];e<=s-1&&(this.r[t]=e,this.r[t+1]=s-1,t+=2),e=i+1}return this.len=t,e<=W.MAX_RUNE&&(this.r[this.len++]=e,this.r[this.len++]=W.MAX_RUNE),this}appendClassWithSign(e,t){return t<0?this.appendNegatedClass(e):this.appendClass(e)}appendGroup(e,t){let n=e.cls;return t&&(n=new vn().appendFoldedClass(n).cleanClass().toArray()),this.appendClassWithSign(n,e.sign)}toString(){return vn.charClassToString(this.r,this.len)}},fI=class{constructor(r){this.str=r,this.position=0}pos(){return this.position}rewindTo(r){this.position=r}more(){return this.position<this.str.length}peek(){return this.str.codePointAt(this.position)}skip(r){this.position+=r}skipString(r){this.position+=r.length}pop(){const r=this.str.codePointAt(this.position);return this.position+=$.charCount(r),r}lookingAt(r){return this.str.startsWith(r,this.position)}rest(){return this.str.substring(this.position)}from(r){return this.str.substring(r,this.position)}toString(){return this.rest()}},U,CI=(U=class{static unicodeTable(e){return e==="Any"?{tab:U.ANY_TABLE,fold:U.ANY_TABLE,sign:1}:e==="Ascii"?{tab:U.ASCII_TABLE,fold:U.ASCII_FOLD_TABLE,sign:1}:e==="Assigned"?{tab:Ct.CATEGORIES.get("Cn"),fold:Ct.CATEGORIES.get("Cn"),sign:-1}:e==="Lc"?{tab:Ct.CATEGORIES.get("LC"),fold:Ct.FOLD_CATEGORIES.get("LC"),sign:1}:Ct.CATEGORIES.has(e)?{tab:Ct.CATEGORIES.get(e),fold:Ct.FOLD_CATEGORIES.get(e),sign:1}:Ct.SCRIPTS.has(e)?{tab:Ct.SCRIPTS.get(e),fold:Ct.FOLD_SCRIPT.get(e),sign:1}:null}static minFoldRune(e){if(e<W.MIN_FOLD||e>W.MAX_FOLD)return e;let t=e;const n=e;for(e=W.simpleFold(e);e!==n;e=W.simpleFold(e))t>e&&(t=e);return t}static leadingRegexp(e){if(e.op===T.Op.EMPTY_MATCH)return null;if(e.op===T.Op.CONCAT&&e.subs.length>0){const t=e.subs[0];return t.op===T.Op.EMPTY_MATCH?null:t}return e}static literalRegexp(e,t){const n=new T(T.Op.LITERAL);return n.flags=t,n.runes=$.stringToRunes(e),n}static parse(e,t){return new U(e,t).parseInternal()}static parseRepeat(e){const t=e.pos();if(!e.more()||!e.lookingAt("{"))return-1;e.skip(1);const n=U.parseInt(e);if(n===-1||!e.more())return-1;let s;if(!e.lookingAt(","))s=n;else{if(e.skip(1),!e.more())return-1;if(e.lookingAt("}"))s=-1;else if((s=U.parseInt(e))===-1)return-1}if(!e.more()||!e.lookingAt("}"))return-1;if(e.skip(1),n<0||n>1e3||s===-2||s>1e3||s>=0&&n>s)throw new _e(U.ERR_INVALID_REPEAT_SIZE,e.from(t));return n<<16|s&W.MAX_BMP}static isValidCaptureName(e){if(e.length===0)return!1;for(let t=0;t<e.length;t++){const n=e.codePointAt(t);if(n!==N.CODES.get("_")&&!$.isalnum(n))return!1}return!0}static parseInt(e){const t=e.pos();for(;e.more()&&e.peek()>=N.CODES.get("0")&&e.peek()<=N.CODES.get("9");)e.skip(1);const n=e.from(t);return n.length===0||n.length>1&&n.codePointAt(0)===N.CODES.get("0")?-1:n.length>8?-2:parseInt(n,10)}static isCharClass(e){return e.op===T.Op.LITERAL&&e.runes.length===1||e.op===T.Op.CHAR_CLASS||e.op===T.Op.ANY_CHAR_NOT_NL||e.op===T.Op.ANY_CHAR}static matchRune(e,t){switch(e.op){case T.Op.LITERAL:return e.runes.length===1&&e.runes[0]===t;case T.Op.CHAR_CLASS:for(let n=0;n<e.runes.length;n+=2)if(e.runes[n]<=t&&t<=e.runes[n+1])return!0;return!1;case T.Op.ANY_CHAR_NOT_NL:return t!==N.CODES.get(`
`);case T.Op.ANY_CHAR:return!0}return!1}static mergeCharClass(e,t){switch(e.op){case T.Op.ANY_CHAR:break;case T.Op.ANY_CHAR_NOT_NL:U.matchRune(t,N.CODES.get(`
`))&&(e.op=T.Op.ANY_CHAR);break;case T.Op.CHAR_CLASS:t.op===T.Op.LITERAL?e.runes=new An(e.runes).appendLiteral(t.runes[0],t.flags).toArray():e.runes=new An(e.runes).appendClass(t.runes).toArray();break;case T.Op.LITERAL:if(t.runes[0]===e.runes[0]&&t.flags===e.flags)break;e.op=T.Op.CHAR_CLASS,e.runes=new An().appendLiteral(e.runes[0],e.flags).appendLiteral(t.runes[0],t.flags).toArray();break}}static parseEscape(e){const t=e.pos();if(e.skip(1),!e.more())throw new _e(U.ERR_TRAILING_BACKSLASH);let n=e.pop();e:switch(n){case N.CODES.get("1"):case N.CODES.get("2"):case N.CODES.get("3"):case N.CODES.get("4"):case N.CODES.get("5"):case N.CODES.get("6"):case N.CODES.get("7"):if(!e.more()||e.peek()<N.CODES.get("0")||e.peek()>N.CODES.get("7"))break;case N.CODES.get("0"):{let s=n-N.CODES.get("0");for(let i=1;i<3&&!(!e.more()||e.peek()<N.CODES.get("0")||e.peek()>N.CODES.get("7"));i++)s=s*8+e.peek()-N.CODES.get("0"),e.skip(1);return s}case N.CODES.get("x"):{if(!e.more())break;if(n=e.pop(),n===N.CODES.get("{")){let o=0,B=0;for(;;){if(!e.more())break e;if(n=e.pop(),n===N.CODES.get("}"))break;const c=$.unhex(n);if(c<0||(B=B*16+c,B>W.MAX_RUNE))break e;o++}if(o===0)break e;return B}const s=$.unhex(n);if(!e.more())break;n=e.pop();const i=$.unhex(n);if(s<0||i<0)break;return s*16+i}case N.CODES.get("a"):return N.CODES.get("\x07");case N.CODES.get("f"):return N.CODES.get("\f");case N.CODES.get("n"):return N.CODES.get(`
`);case N.CODES.get("r"):return N.CODES.get("\r");case N.CODES.get("t"):return N.CODES.get("	");case N.CODES.get("v"):return N.CODES.get("\v");default:if(n<=W.MAX_ASCII&&!$.isalnum(n))return n;break}throw new _e(U.ERR_INVALID_ESCAPE,e.from(t))}static parseClassChar(e,t){if(!e.more())throw new _e(U.ERR_MISSING_BRACKET,e.from(t));return e.lookingAt("\\")?U.parseEscape(e):e.pop()}static concatRunes(e,t){for(let n=0;n<t.length;n++)e.push(t[n]);return e}static hasCapture(e){if(e===null)return!1;if(e.op===T.Op.CAPTURE)return!0;if(e.subs){for(let t of e.subs)if(U.hasCapture(t))return!0}return!1}constructor(e,t=0){this.wholeRegexp=e,this.flags=t,this.numCap=0,this.namedGroups=Object.create(null),this.stack=[],this.free=null,this.numRegexp=0,this.numRunes=0,this.repeats=0,this.height=null,this.size=null,this.nlb=0}newRegexp(e){let t=this.free;return t!==null&&t.subs!==null&&t.subs.length>0?(this.free=t.subs[0],t.reinit(),t.op=e):(t=new T(e),this.numRegexp+=1),t}reuse(e){this.height!==null&&this.height.has(e)&&this.height.delete(e),e.subs!==null&&e.subs.length>0&&(e.subs[0]=this.free),this.free=e}checkLimits(e){if(this.numRunes>U.MAX_RUNES)throw new _e(U.ERR_LARGE);this.checkSize(e),this.checkHeight(e)}checkSize(e){if(this.size===null){if(this.repeats===0&&(this.repeats=1),e.op===T.Op.REPEAT){let t=e.max;t===-1&&(t=e.min),t<=0&&(t=1),t>Math.floor(U.MAX_SIZE/this.repeats)?this.repeats=U.MAX_SIZE:this.repeats*=t}if(this.numRegexp<Math.floor(U.MAX_SIZE/this.repeats))return;this.size=new Map;for(let t of this.stack)this.checkSize(t)}if(this.calcSize(e,!0)>U.MAX_SIZE)throw new _e(U.ERR_LARGE)}calcSize(e,t=!1){if(!t&&this.size!==null&&this.size.has(e))return this.size.get(e);let n=0;switch(e.op){case T.Op.LITERAL:n=e.runes.length;break;case T.Op.PLB:case T.Op.NLB:case T.Op.CAPTURE:case T.Op.STAR:n=2+this.calcSize(e.subs[0]);break;case T.Op.PLUS:case T.Op.QUEST:n=1+this.calcSize(e.subs[0]);break;case T.Op.CONCAT:for(let s of e.subs)n=n+this.calcSize(s);break;case T.Op.ALTERNATE:for(let s of e.subs)n=n+this.calcSize(s);e.subs.length>1&&(n=n+e.subs.length-1);break;case T.Op.REPEAT:{let s=this.calcSize(e.subs[0]);if(e.max===-1){e.min===0?n=2+s:n=1+e.min*s;break}n=e.max*s+(e.max-e.min);break}}return n=Math.max(1,n),this.size===null&&(this.size=new Map),this.size.set(e,n),n}checkHeight(e){if(!(this.numRegexp<U.MAX_HEIGHT)){if(this.height===null){this.height=new Map;for(let t of this.stack)this.checkHeight(t)}if(this.calcHeight(e,!0)>U.MAX_HEIGHT)throw new _e(U.ERR_NESTING_DEPTH)}}calcHeight(e,t=!1){if(!t&&this.height!==null&&this.height.has(e))return this.height.get(e);let n=1;for(let s of e.subs){const i=this.calcHeight(s);n<1+i&&(n=1+i)}return this.height===null&&(this.height=new Map),this.height.set(e,n),n}pop(){return this.stack.pop()}popToPseudo(){const e=this.stack.length;let t=e;for(;t>0&&!T.isPseudoOp(this.stack[t-1].op);)t--;const n=this.stack.slice(t,e);return this.stack=this.stack.slice(0,t),n}push(e){if(this.numRunes+=e.runes.length,e.op===T.Op.CHAR_CLASS&&e.runes.length===2&&e.runes[0]===e.runes[1]){if(this.maybeConcat(e.runes[0],this.flags&-2))return null;e.op=T.Op.LITERAL,e.runes=[e.runes[0]],e.flags=this.flags&-2}else if(e.op===T.Op.CHAR_CLASS&&e.runes.length===4&&e.runes[0]===e.runes[1]&&e.runes[2]===e.runes[3]&&W.simpleFold(e.runes[0])===e.runes[2]&&W.simpleFold(e.runes[2])===e.runes[0]||e.op===T.Op.CHAR_CLASS&&e.runes.length===2&&e.runes[0]+1===e.runes[1]&&W.simpleFold(e.runes[0])===e.runes[1]&&W.simpleFold(e.runes[1])===e.runes[0]){if(this.maybeConcat(e.runes[0],this.flags|x.FOLD_CASE))return null;e.op=T.Op.LITERAL,e.runes=[e.runes[0]],e.flags=this.flags|x.FOLD_CASE}else this.maybeConcat(-1,0);return this.stack.push(e),this.checkLimits(e),e}maybeConcat(e,t){const n=this.stack.length;if(n<2)return!1;const s=this.stack[n-1],i=this.stack[n-2];return s.op!==T.Op.LITERAL||i.op!==T.Op.LITERAL||(s.flags&x.FOLD_CASE)!==(i.flags&x.FOLD_CASE)?!1:(i.runes=U.concatRunes(i.runes,s.runes),e>=0?(s.runes=[e],s.flags=t,!0):(this.pop(),this.reuse(s),!1))}newLiteral(e,t){const n=this.newRegexp(T.Op.LITERAL);return n.flags=t,(t&x.FOLD_CASE)!==0&&(e=U.minFoldRune(e)),n.runes=[e],n}literal(e){this.push(this.newLiteral(e,this.flags))}op(e){const t=this.newRegexp(e);return t.flags=this.flags,this.push(t)}repeat(e,t,n,s,i,o){let B=this.flags;if((B&x.PERL_X)!==0&&(i.more()&&i.lookingAt("?")&&(i.skip(1),B^=x.NON_GREEDY),o!==-1))throw new _e(U.ERR_INVALID_REPEAT_OP,i.from(o));const c=this.stack.length;if(c===0)throw new _e(U.ERR_MISSING_REPEAT_ARGUMENT,i.from(s));const u=this.stack[c-1];if(T.isPseudoOp(u.op))throw new _e(U.ERR_MISSING_REPEAT_ARGUMENT,i.from(s));const h=this.newRegexp(e);if(h.min=t,h.max=n,h.flags=B,h.subs=[u],this.stack[c-1]=h,this.checkLimits(h),e===T.Op.REPEAT&&(t>=2||n>=2)&&!this.repeatIsValid(h,1e3))throw new _e(U.ERR_INVALID_REPEAT_SIZE,i.from(s))}repeatIsValid(e,t){if(e.op===T.Op.REPEAT){let n=e.max;if(n===0)return!0;if(n<0&&(n=e.min),n>t)return!1;n>0&&(t=Math.trunc(t/n))}for(let n of e.subs)if(!this.repeatIsValid(n,t))return!1;return!0}concat(){this.maybeConcat(-1,0);const e=this.popToPseudo();return e.length===0?this.push(this.newRegexp(T.Op.EMPTY_MATCH)):this.push(this.collapse(e,T.Op.CONCAT))}alternate(){const e=this.popToPseudo();return e.length>0&&this.cleanAlt(e[e.length-1]),e.length===0?this.push(this.newRegexp(T.Op.NO_MATCH)):this.push(this.collapse(e,T.Op.ALTERNATE))}cleanAlt(e){e.op===T.Op.CHAR_CLASS&&(e.runes=new An(e.runes).cleanClass().toArray(),e.runes.length===2&&e.runes[0]===0&&e.runes[1]===W.MAX_RUNE?(e.runes=[],e.op=T.Op.ANY_CHAR):e.runes.length===4&&e.runes[0]===0&&e.runes[1]===N.CODES.get(`
`)-1&&e.runes[2]===N.CODES.get(`
`)+1&&e.runes[3]===W.MAX_RUNE&&(e.runes=[],e.op=T.Op.ANY_CHAR_NOT_NL))}collapse(e,t){if(e.length===1)return e[0];let n=0;for(let B of e)n+=B.op===t?B.subs.length:1;let s=new Array(n).fill(null),i=0;for(let B of e)if(B.op===t){for(let c=0;c<B.subs.length;c++)s[i++]=B.subs[c];this.reuse(B)}else s[i++]=B;let o=this.newRegexp(t);if(o.subs=s,t===T.Op.ALTERNATE&&(o.subs=this.factor(o.subs),o.subs.length===1)){const B=o;o=o.subs[0],this.reuse(B)}return o}factor(e){if(e.length<2)return e;let t=0,n=e.length,s=0,i=null,o=0,B=0,c=0;for(let h=0;h<=n;h++){let C=null,p=0,I=0;if(h<n){let R=e[t+h];if(R.op===T.Op.CONCAT&&R.subs.length>0&&(R=R.subs[0]),R.op===T.Op.LITERAL&&(C=R.runes,p=R.runes.length,I=R.flags&x.FOLD_CASE),I===B){let k=0;for(;k<o&&k<p&&i[k]===C[k];)k++;if(k>0){o=k;continue}}}if(h!==c)if(h===c+1)e[s++]=e[t+c];else{const R=this.newRegexp(T.Op.LITERAL);R.flags=B,R.runes=i.slice(0,o);for(let z=c;z<h;z++)e[t+z]=this.removeLeadingString(e[t+z],o),this.checkLimits(e[t+z]);const k=this.collapse(e.slice(t+c,t+h),T.Op.ALTERNATE),M=this.newRegexp(T.Op.CONCAT);M.subs=[R,k],e[s++]=M}c=h,i=C,o=p,B=I}n=s,t=0,c=0,s=0;let u=null;for(let h=0;h<=n;h++){let C=null;if(!(h<n&&(C=U.leadingRegexp(e[t+h]),u!==null&&u.equals(C)&&(U.isCharClass(u)||u.op===T.Op.REPEAT&&u.min===u.max&&U.isCharClass(u.subs[0]))))){if(h!==c)if(h===c+1)e[s++]=e[t+c];else{const p=u;for(let k=c;k<h;k++){const M=k!==c;e[t+k]=this.removeLeadingRegexp(e[t+k],M),this.checkLimits(e[t+k])}const I=this.collapse(e.slice(t+c,t+h),T.Op.ALTERNATE),R=this.newRegexp(T.Op.CONCAT);R.subs=[p,I],e[s++]=R}c=h,u=C}}n=s,t=0,c=0,s=0;for(let h=0;h<=n;h++)if(!(h<n&&U.isCharClass(e[t+h]))){if(h!==c)if(h===c+1)e[s++]=e[t+c];else{let C=c;for(let I=c+1;I<h;I++){const R=e[t+C],k=e[t+I];(R.op<k.op||R.op===k.op&&(R.runes!==null?R.runes.length:0)<(k.runes!==null?k.runes.length:0))&&(C=I)}const p=e[t+c];e[t+c]=e[t+C],e[t+C]=p;for(let I=c+1;I<h;I++)U.mergeCharClass(e[t+c],e[t+I]),this.reuse(e[t+I]);this.cleanAlt(e[t+c]),e[s++]=e[t+c]}h<n&&(e[s++]=e[t+h]),c=h+1}n=s,t=0,c=0,s=0;for(let h=0;h<n;++h)h+1<n&&e[t+h].op===T.Op.EMPTY_MATCH&&e[t+h+1].op===T.Op.EMPTY_MATCH||(e[s++]=e[t+h]);return n=s,t=0,e.slice(t,n)}removeLeadingString(e,t){if(e.op===T.Op.CONCAT&&e.subs.length>0){const n=this.removeLeadingString(e.subs[0],t);if(e.subs[0]=n,n.op===T.Op.EMPTY_MATCH)switch(this.reuse(n),e.subs.length){case 0:case 1:e.op=T.Op.EMPTY_MATCH,e.subs=T.emptySubs();break;case 2:{const s=e;e=e.subs[1],this.reuse(s);break}default:e.subs=e.subs.slice(1,e.subs.length);break}return e}return e.op===T.Op.LITERAL&&(e.runes=e.runes.slice(t,e.runes.length),e.runes.length===0&&(e.op=T.Op.EMPTY_MATCH)),e}removeLeadingRegexp(e,t){if(e.op===T.Op.CONCAT&&e.subs.length>0){switch(t&&this.reuse(e.subs[0]),e.subs=e.subs.slice(1,e.subs.length),e.subs.length){case 0:e.op=T.Op.EMPTY_MATCH,e.subs=T.emptySubs();break;case 1:{const n=e;e=e.subs[0],this.reuse(n);break}}return e}return t&&this.reuse(e),this.newRegexp(T.Op.EMPTY_MATCH)}parseInternal(){if((this.flags&x.LITERAL)!==0)return U.literalRegexp(this.wholeRegexp,this.flags);let e=-1,t=-1,n=-1;const s=new fI(this.wholeRegexp);for(;s.more();){let i=-1;e:switch(s.peek()){case N.CODES.get("("):if((this.flags&x.LOOKBEHIND)!==0){if(s.lookingAt("(?<=")){this.parsePosLookBehind(),s.skip(4);break}if(s.lookingAt("(?<!")){this.parseNegLookBehind(),s.skip(4);break}}if((this.flags&x.PERL_X)!==0&&s.lookingAt("(?")){this.parsePerlFlags(s);break}this.op(T.Op.LEFT_PAREN).cap=++this.numCap,s.skip(1);break;case N.CODES.get("|"):this.parseVerticalBar(),s.skip(1);break;case N.CODES.get(")"):this.parseRightParen(),s.skip(1);break;case N.CODES.get("^"):(this.flags&x.ONE_LINE)!==0?this.op(T.Op.BEGIN_TEXT):this.op(T.Op.BEGIN_LINE),s.skip(1);break;case N.CODES.get("$"):(this.flags&x.ONE_LINE)!==0?this.op(T.Op.END_TEXT).flags|=x.WAS_DOLLAR:this.op(T.Op.END_LINE),s.skip(1);break;case N.CODES.get("."):(this.flags&x.DOT_NL)!==0?this.op(T.Op.ANY_CHAR):this.op(T.Op.ANY_CHAR_NOT_NL),s.skip(1);break;case N.CODES.get("["):this.parseClass(s);break;case N.CODES.get("*"):case N.CODES.get("+"):case N.CODES.get("?"):{i=s.pos();let o=null;switch(s.pop()){case N.CODES.get("*"):o=T.Op.STAR;break;case N.CODES.get("+"):o=T.Op.PLUS;break;case N.CODES.get("?"):o=T.Op.QUEST;break}this.repeat(o,t,n,i,s,e);break}case N.CODES.get("{"):{i=s.pos();const o=U.parseRepeat(s);if(o<0){s.rewindTo(i),this.literal(s.pop());break}t=o>>16,n=(o&W.MAX_BMP)<<16>>16,this.repeat(T.Op.REPEAT,t,n,i,s,e);break}case N.CODES.get("\\"):{const o=s.pos();if(s.skip(1),(this.flags&x.PERL_X)!==0&&s.more())switch(s.pop()){case N.CODES.get("A"):this.op(T.Op.BEGIN_TEXT);break e;case N.CODES.get("b"):this.op(T.Op.WORD_BOUNDARY);break e;case N.CODES.get("B"):this.op(T.Op.NO_WORD_BOUNDARY);break e;case N.CODES.get("C"):throw new _e(U.ERR_INVALID_ESCAPE,"\\C");case N.CODES.get("Q"):{let u=s.rest();const h=u.indexOf("\\E");h>=0?(u=u.substring(0,h),s.skipString(u),s.skipString("\\E")):s.skipString(u);let C=0;for(;C<u.length;){const p=u.codePointAt(C);this.literal(p),C+=$.charCount(p)}break e}case N.CODES.get("z"):this.op(T.Op.END_TEXT);break e;default:s.rewindTo(o);break}else s.rewindTo(o);const B=this.newRegexp(T.Op.CHAR_CLASS);if(B.flags=this.flags,s.lookingAt("\\p")||s.lookingAt("\\P")){const u=new An;if(this.parseUnicodeClass(s,u)){B.runes=u.toArray(),this.push(B);break e}}const c=new An;if(this.parsePerlClassEscape(s,c)){B.runes=c.toArray(),this.push(B);break e}s.rewindTo(o),this.reuse(B),this.literal(U.parseEscape(s));break}default:this.literal(s.pop());break}e=i}if(this.concat(),this.swapVerticalBar()&&this.pop(),this.alternate(),this.stack.length!==1)throw new _e(U.ERR_MISSING_PAREN,this.wholeRegexp);return this.stack[0].namedGroups=this.namedGroups,this.stack[0]}parsePerlFlags(e){const t=e.pos(),n=e.rest();if(n.startsWith("(?P<")||n.startsWith("(?<")){const B=n.charAt(2)==="P"?4:3,c=n.indexOf(">");if(c<0)throw new _e(U.ERR_INVALID_NAMED_CAPTURE,n);const u=n.substring(B,c);if(e.skipString(u),e.skip(B+1),!U.isValidCaptureName(u))throw new _e(U.ERR_INVALID_NAMED_CAPTURE,n.substring(0,c+1));const h=this.op(T.Op.LEFT_PAREN);if(h.cap=++this.numCap,this.namedGroups[u])throw new _e(U.ERR_DUPLICATE_NAMED_CAPTURE,u);this.namedGroups[u]=this.numCap,h.name=u;return}e.skip(2);let s=this.flags,i=1,o=!1;e:for(;e.more();){const B=e.pop();switch(B){case N.CODES.get("i"):s|=x.FOLD_CASE,o=!0;break;case N.CODES.get("m"):s&=-17,o=!0;break;case N.CODES.get("s"):s|=x.DOT_NL,o=!0;break;case N.CODES.get("U"):s|=x.NON_GREEDY,o=!0;break;case N.CODES.get("-"):if(i<0)break e;i=-1,s=~s,o=!1;break;case N.CODES.get(":"):case N.CODES.get(")"):if(i<0){if(!o)break e;s=~s}B===N.CODES.get(":")&&this.op(T.Op.LEFT_PAREN),this.flags=s;return;default:break e}}throw new _e(U.ERR_INVALID_PERL_OP,e.from(t))}parsePosLookBehind(){const e=this.newRegexp(T.Op.LEFT_PAREN);return e.flags=this.flags,e.lb=++this.nlb,this.push(e)}parseNegLookBehind(){const e=this.newRegexp(T.Op.LEFT_PAREN);return e.flags=this.flags,e.lb=-++this.nlb,this.push(e)}parseVerticalBar(){this.concat(),this.swapVerticalBar()||this.op(T.Op.VERTICAL_BAR)}swapVerticalBar(){const e=this.stack.length;if(e>=3&&this.stack[e-2].op===T.Op.VERTICAL_BAR&&U.isCharClass(this.stack[e-1])&&U.isCharClass(this.stack[e-3])){let t=this.stack[e-1],n=this.stack[e-3];if(t.op>n.op){const s=n;n=t,t=s,this.stack[e-3]=n}return U.mergeCharClass(n,t),this.reuse(t),this.pop(),!0}if(e>=2){const t=this.stack[e-1],n=this.stack[e-2];if(n.op===T.Op.VERTICAL_BAR)return e>=3&&this.cleanAlt(this.stack[e-3]),this.stack[e-2]=t,this.stack[e-1]=n,!0}return!1}parseRightParen(){if(this.concat(),this.swapVerticalBar()&&this.pop(),this.alternate(),this.stack.length<2)throw new _e(U.ERR_UNEXPECTED_PAREN,this.wholeRegexp);const e=this.pop(),t=this.pop();if(t.op!==T.Op.LEFT_PAREN)throw new _e(U.ERR_UNEXPECTED_PAREN,this.wholeRegexp);if(this.flags=t.flags,t.lb!==0){if(U.hasCapture(e))throw new _e(U.ERR_INVALID_CAPTURE_IN_LOOKBEHIND,this.wholeRegexp);t.lb>0?t.op=T.Op.PLB:t.op=T.Op.NLB,t.subs=[e],this.push(t);return}t.cap===0?this.push(e):(t.op=T.Op.CAPTURE,t.subs=[e],this.push(t))}parsePerlClassEscape(e,t){const n=e.pos();if((this.flags&x.PERL_X)===0||!e.more()||e.pop()!==N.CODES.get("\\")||!e.more())return!1;e.pop();const s=e.from(n),i=Xl.has(s)?Xl.get(s):null;return i===null?!1:(t.appendGroup(i,(this.flags&x.FOLD_CASE)!==0),!0)}parseNamedClass(e,t){const n=e.rest(),s=n.indexOf(":]");if(s<0)return!1;const i=n.substring(0,s+2);e.skipString(i);const o=fh.has(i)?fh.get(i):null;if(o===null)throw new _e(U.ERR_INVALID_CHAR_RANGE,i);return t.appendGroup(o,(this.flags&x.FOLD_CASE)!==0),!0}parseUnicodeClass(e,t){const n=e.pos();if((this.flags&x.UNICODE_GROUPS)===0||!e.lookingAt("\\p")&&!e.lookingAt("\\P"))return!1;e.skip(1);let s=1,i=e.pop();if(i===N.CODES.get("P")&&(s=-1),!e.more())throw e.rewindTo(n),new _e(U.ERR_INVALID_CHAR_RANGE,e.rest());i=e.pop();let o;if(i!==N.CODES.get("{"))o=$.runeToString(i);else{const h=e.rest(),C=h.indexOf("}");if(C<0)throw e.rewindTo(n),new _e(U.ERR_INVALID_CHAR_RANGE,e.rest());o=h.substring(0,C),e.skipString(o),e.skip(1)}o.length!==0&&o.codePointAt(0)===N.CODES.get("^")&&(s=0-s,o=o.substring(1));const B=U.unicodeTable(o);if(B===null)throw new _e(U.ERR_INVALID_CHAR_RANGE,e.from(n));B.sign<0&&(s=0-s);const c=B.tab,u=B.fold;if((this.flags&x.FOLD_CASE)===0||u===null)t.appendTableWithSign(c,s);else{const h=new An().appendTable(c).appendTable(u).cleanClass().toArray();t.appendClassWithSign(h,s)}return!0}parseClass(e){const t=e.pos();e.skip(1);const n=this.newRegexp(T.Op.CHAR_CLASS);n.flags=this.flags;const s=new An;let i=1;e.more()&&e.lookingAt("^")&&(i=-1,e.skip(1),(this.flags&x.CLASS_NL)===0&&s.appendRange(N.CODES.get(`
`),N.CODES.get(`
`)));let o=!0;for(;!e.more()||e.peek()!==N.CODES.get("]")||o;){if(e.more()&&e.lookingAt("-")&&(this.flags&x.PERL_X)===0&&!o){const h=e.rest();if(h==="-"||!h.startsWith("-]"))throw e.rewindTo(t),new _e(U.ERR_INVALID_CHAR_RANGE,e.rest())}o=!1;const B=e.pos();if(e.lookingAt("[:")){if(this.parseNamedClass(e,s))continue;e.rewindTo(B)}if(this.parseUnicodeClass(e,s)||this.parsePerlClassEscape(e,s))continue;e.rewindTo(B);const c=U.parseClassChar(e,t);let u=c;if(e.more()&&e.lookingAt("-")){if(e.skip(1),e.more()&&e.lookingAt("]"))e.skip(-1);else if(u=U.parseClassChar(e,t),u<c)throw new _e(U.ERR_INVALID_CHAR_RANGE,e.from(B))}(this.flags&x.FOLD_CASE)===0?s.appendRange(c,u):s.appendFoldedRange(c,u)}e.skip(1),s.cleanClass(),i<0&&s.negateClass(),n.runes=s.toArray(),this.push(n)}},G(U,"ERR_INTERNAL_ERROR","regexp/syntax: internal error"),G(U,"ERR_INVALID_CHAR_RANGE","invalid character class range"),G(U,"ERR_INVALID_ESCAPE","invalid escape sequence"),G(U,"ERR_INVALID_NAMED_CAPTURE","invalid named capture"),G(U,"ERR_INVALID_PERL_OP","invalid or unsupported Perl syntax"),G(U,"ERR_INVALID_REPEAT_OP","invalid nested repetition operator"),G(U,"ERR_INVALID_REPEAT_SIZE","invalid repeat count"),G(U,"ERR_MISSING_BRACKET","missing closing ]"),G(U,"ERR_MISSING_PAREN","missing closing )"),G(U,"ERR_MISSING_REPEAT_ARGUMENT","missing argument to repetition operator"),G(U,"ERR_TRAILING_BACKSLASH","trailing backslash at end of expression"),G(U,"ERR_DUPLICATE_NAMED_CAPTURE","duplicate capture group name"),G(U,"ERR_UNEXPECTED_PAREN","unexpected )"),G(U,"ERR_NESTING_DEPTH","expression nests too deeply"),G(U,"ERR_LARGE","expression too large"),G(U,"ERR_INVALID_CAPTURE_IN_LOOKBEHIND","invalid capture in lookbehind"),G(U,"MAX_HEIGHT",1e3),G(U,"MAX_SIZE",3355443),G(U,"MAX_RUNES",33554432),G(U,"ANY_TABLE",new g(new Uint32Array([0,W.MAX_RUNE,1]))),G(U,"ASCII_TABLE",new g(new Uint32Array([0,127,1]))),G(U,"ASCII_FOLD_TABLE",new g(new Uint32Array([0,127,1,383,383,1,8490,8490,1]))),U),dI=class ar{static initTest(e){const t=ar.compile(e),n=new ar(t.expr,t.prog,t.numSubexp,t.longest);return n.cond=t.cond,n.prefix=t.prefix,n.prefixUTF8=t.prefixUTF8,n.prefixComplete=t.prefixComplete,n.prefixRune=t.prefixRune,n.prefilter=t.prefilter,n}static compile(e){return ar.compileImpl(e,x.PERL,!1)}static compilePOSIX(e){return ar.compileImpl(e,x.POSIX,!0)}static compileImpl(e,t,n){let s=CI.parse(e,t);const i=s.maxCap();s=hI.simplify(s);const o=cI.build(s),B=lI.compileRegexp(s),c=new ar(e,B,i,n);c.prefilter=o.type===Ce.Type.NONE?null:o;const[u,h]=B.prefix();return c.prefixComplete=u,c.prefix=h,c.prefixUTF8=$.stringToUtf8ByteArray(c.prefix),c.prefix.length>0&&(c.prefixRune=c.prefix.codePointAt(0)),c.namedGroups=s.namedGroups,c}static match(e,t){return ar.compile(e).match(t)}constructor(e,t,n=0,s=0){this.expr=e,this.prog=t,this.numSubexp=n,this.longest=s,this.cond=t.startCond(),this.prefix=null,this.prefixUTF8=null,this.prefixComplete=!1,this.prefixRune=0,this.machinePool=[],this.dfa=new ZD(this.prog),this.onepass=Wl.compile(this.prog),this.prefilter=null}matchPrefixComplete(e,t,n,s){if((n===x.ANCHOR_START||n===x.ANCHOR_BOTH)&&t!==0)return null;let i=-1,o=-1;const B=e.prefixLength(this);if(n===x.UNANCHORED){const c=e.index(this,t);if(c<0)return null;i=t+c,o=i+B}else if(n===x.ANCHOR_BOTH){if(e.endPos()!==B||e.index(this,0)!==0)return null;i=0,o=B}else if(n===x.ANCHOR_START){if(e.index(this,0)!==0)return null;i=0,o=B}if(i<0)return null;if(s>0){const c=new Int32Array(s).fill(-1);return c[0]=i,c[1]=o,Array.from(c)}return[]}executeEngine(e,t,n,s){if(this.prefixComplete&&(s===0||this.numSubexp===0))return this.matchPrefixComplete(e,t,n,s);if(this.prefilter!==null&&n===x.UNANCHORED&&!this.prefilter.eval(e,t))return null;if(this.onepass!==null)return Wl.execute(this,e,t,n,s);if(s>0)return this.prog.numLb===0&&e.endPos()<=no.maxBitStateLen(this.prog)?no.execute(this,e,t,n,s):this.doExecuteNFA(e,t,n,s);if(this.prog.numLb===0){const i=this.dfa.match(e,t,n);if(i!==null)return i?[]:null;if(e.endPos()<=no.maxBitStateLen(this.prog))return no.execute(this,e,t,n,s)}return this.doExecuteNFA(e,t,n,s)}numberOfCapturingGroups(){return this.numSubexp}numberOfInstructions(){return this.prog.numInst()}get(){return this.machinePool.length>0?this.machinePool.pop():null}reset(){this.machinePool.length=0}put(e){this.machinePool.push(e)}toString(){return this.expr}doExecuteNFA(e,t,n,s){let i=this.get();i||(i=$D.fromRE2(this)),i.init(s);const o=i.match(e,t,n)?i.submatches():null;return this.put(i),o}match(e){return this.executeEngine(Ie.fromUTF16(e),0,x.UNANCHORED,0)!==null}matchWithGroup(e,t,n,s,i){return e instanceof gr||($.isByteArray(e)?e=cr.utf8(e):e=cr.utf16(e)),this.matchMachineInput(e,t,n,s,i)}matchMachineInput(e,t,n,s,i){if(t>n)return[!1,null];const o=e.isUTF16Encoding()?Ie.fromUTF16(e.asCharSequence(),0,n):Ie.fromUTF8(e.asBytes(),0,n),B=this.executeEngine(o,t,s,2*i);return B===null?[!1,null]:[!0,B]}matchUTF8(e){return this.executeEngine(Ie.fromUTF8(e),0,x.UNANCHORED,0)!==null}replaceAll(e,t){return this.replaceAllFunc(e,()=>t,2*e.length+1)}replaceFirst(e,t){return this.replaceAllFunc(e,()=>t,1)}replaceAllFunc(e,t,n){let s=0,i=0,o="";const B=Ie.fromUTF16(e);let c=0;for(;i<=e.length;){const u=this.executeEngine(B,i,x.UNANCHORED,2);if(u===null||u.length===0)break;o+=e.substring(s,u[0]),(u[1]>s||u[0]===0)&&(o+=t(e.substring(u[0],u[1])),c++),s=u[1];const h=B.step(i)&7;if(i+h>u[1]?i+=h:i+1>u[1]?i++:i=u[1],c>=n)break}return o+=e.substring(s),o}pad(e){if(e===null)return null;let t=(1+this.numSubexp)*2;if(e.length<t){let n=new Array(t).fill(-1);for(let s=0;s<e.length;s++)n[s]=e[s];e=n}return e}allMatches(e,t,n=s=>s){let s=[];const i=e.endPos();t<0&&(t=i+1);let o=0,B=0,c=-1;for(;B<t&&o<=i;){const u=this.executeEngine(e,o,x.UNANCHORED,this.prog.numCap);if(u===null||u.length===0)break;let h=!0;if(u[1]===o){u[0]===c&&(h=!1);const C=e.step(o);C<0?o=i+1:o+=C&7}else o=u[1];c=u[1],h&&(s.push(n(this.pad(u))),B++)}return s}findUTF8(e){const t=this.executeEngine(Ie.fromUTF8(e),0,x.UNANCHORED,2);return t===null?null:e.slice(t[0],t[1])}findUTF8Index(e){const t=this.executeEngine(Ie.fromUTF8(e),0,x.UNANCHORED,2);return t===null?null:t.slice(0,2)}find(e){const t=this.executeEngine(Ie.fromUTF16(e),0,x.UNANCHORED,2);return t===null?"":e.substring(t[0],t[1])}findIndex(e){return this.executeEngine(Ie.fromUTF16(e),0,x.UNANCHORED,2)}findUTF8Submatch(e){const t=this.executeEngine(Ie.fromUTF8(e),0,x.UNANCHORED,this.prog.numCap);if(t===null)return null;const n=new Array(1+this.numSubexp).fill(null);for(let s=0;s<n.length;s++)2*s<t.length&&t[2*s]>=0&&(n[s]=e.slice(t[2*s],t[2*s+1]));return n}findUTF8SubmatchIndex(e){return this.pad(this.executeEngine(Ie.fromUTF8(e),0,x.UNANCHORED,this.prog.numCap))}findSubmatch(e){const t=this.executeEngine(Ie.fromUTF16(e),0,x.UNANCHORED,this.prog.numCap);if(t===null)return null;const n=new Array(1+this.numSubexp).fill(null);for(let s=0;s<n.length;s++)2*s<t.length&&t[2*s]>=0&&(n[s]=e.substring(t[2*s],t[2*s+1]));return n}findSubmatchIndex(e){return this.pad(this.executeEngine(Ie.fromUTF16(e),0,x.UNANCHORED,this.prog.numCap))}findAllUTF8(e,t){const n=this.allMatches(Ie.fromUTF8(e),t,s=>e.slice(s[0],s[1]));return n.length===0?null:n}findAllUTF8Index(e,t){const n=this.allMatches(Ie.fromUTF8(e),t,s=>s.slice(0,2));return n.length===0?null:n}findAll(e,t){const n=this.allMatches(Ie.fromUTF16(e),t,s=>e.substring(s[0],s[1]));return n.length===0?null:n}findAllIndex(e,t){const n=this.allMatches(Ie.fromUTF16(e),t,s=>s.slice(0,2));return n.length===0?null:n}findAllUTF8Submatch(e,t){const n=this.allMatches(Ie.fromUTF8(e),t,s=>{let i=new Array(s.length/2|0).fill(null);for(let o=0;o<i.length;o++)s[2*o]>=0&&(i[o]=e.slice(s[2*o],s[2*o+1]));return i});return n.length===0?null:n}findAllUTF8SubmatchIndex(e,t){const n=this.allMatches(Ie.fromUTF8(e),t);return n.length===0?null:n}findAllSubmatch(e,t){const n=this.allMatches(Ie.fromUTF16(e),t,s=>{let i=new Array(s.length/2|0).fill(null);for(let o=0;o<i.length;o++)s[2*o]>=0&&(i[o]=e.substring(s[2*o],s[2*o+1]));return i});return n.length===0?null:n}findAllSubmatchIndex(e,t){const n=this.allMatches(Ie.fromUTF16(e),t);return n.length===0?null:n}},pI=class Pr{static isHexadecimal(e){return"0"<=e&&e<="9"||"A"<=e&&e<="F"||"a"<=e&&e<="f"}static translate(e){let t="";if(e instanceof RegExp&&(e.ignoreCase&&(t+="i"),e.multiline&&(t+="m"),e.dotAll&&(t+="s"),e=e.source),typeof e!="string")return e;let n="",s=!1,i=e.length;i===0&&(n="(?:)",s=!0);let o=!1,B=0;for(;B<i;){let u=e[B];if(u==="\\"){if(B+1<i)switch(u=e[B+1],u){case"\\":n+="\\\\",B+=2;continue;case"c":if(B+2<i){let p=e[B+2].charCodeAt(0);if(p>=65&&p<=90||p>=97&&p<=122){let I=p%32;n+="\\x",n+=(I>>4).toString(16).toUpperCase(),n+=(I&15).toString(16).toUpperCase(),B+=3,s=!0;continue}}n+="c",B+=2,s=!0;continue;case"u":if(B+2<i){if(e[B+2]==="{"){let p=B+3,I=!1,R=!1;for(;p<i;){const k=e[p];if(k==="}"){R=!0;break}if(!Pr.isHexadecimal(k))break;I=!0,p++}if(R&&I){n+="\\x",B+=2,s=!0;continue}}else if(B+5<i){let p=!0;for(let I=0;I<4;I++)if(!Pr.isHexadecimal(e[B+2+I])){p=!1;break}if(p){n+="\\x{"+e.substring(B+2,B+6)+"}",B+=6,s=!0;continue}}}n+="u",B+=2,s=!0;continue;case"x":{let p=!1;if(B+2<i&&e[B+2]==="{"){let I=B+3,R=!1,k=!1;for(;I<i;){const M=e[I];if(M==="}"){k=!0;break}if(!Pr.isHexadecimal(M))break;R=!0,I++}k&&R&&(p=!0)}else B+3<i&&Pr.isHexadecimal(e[B+2])&&Pr.isHexadecimal(e[B+3])&&(p=!0);p?(n+="\\x",B+=2):(n+="x",B+=2,s=!0);continue}case"n":case"r":case"t":case"a":case"f":case"v":case"d":case"D":case"s":case"S":case"w":case"W":case"b":case"B":case"p":case"P":case"A":case"z":case"Q":case"E":case"0":case"1":case"2":case"3":case"4":case"5":case"6":case"7":n+="\\"+u,B+=2;continue;default:{let p=e.codePointAt(B+1);if(p>=48&&p<=57||p>=65&&p<=90||p>=97&&p<=122){let I=$.charCount(p);n+=e.substring(B+1,B+1+I),B+=I+1,s=!0}else{n+="\\";let I=$.charCount(p);n+=e.substring(B+1,B+1+I),B+=I+1}continue}}}else if(u==="/"){n+="\\/",B+=1,s=!0;continue}else if(u==="[")o=!0;else if(u==="]")o=!1;else if(!o&&u==="("&&B+2<i&&e[B+1]==="?"&&e[B+2]==="<"&&B+3<i&&!"=!>)".includes(e[B+3])){n+="(?P<",B+=3,s=!0;continue}let h=e.codePointAt(B),C=$.charCount(h);n+=e.substring(B,B+C),B+=C}const c=s?n:e;return t.length>0?`(?${t})${c}`:c}},Fe,cc=(Fe=class{static quote(e){return $.quoteMeta(e)}static quoteReplacement(e,t=!1){return Jl.quoteReplacement(e,t)}static translateRegExp(e){return pI.translate(e)}static compile(e,t=0){let n=e;if((t&Fe.CASE_INSENSITIVE)!==0&&(n=`(?i)${n}`),(t&Fe.DOTALL)!==0&&(n=`(?s)${n}`),(t&Fe.MULTILINE)!==0&&(n=`(?m)${n}`),(t&-544)!==0)throw new QD("Flags should only be a combination of MULTILINE, DOTALL, CASE_INSENSITIVE, DISABLE_UNICODE_GROUPS, LONGEST_MATCH, LOOKBEHINDS");let s=x.PERL;(t&Fe.DISABLE_UNICODE_GROUPS)!==0&&(s&=-129),(t&Fe.LOOKBEHINDS)!==0&&(s|=x.LOOKBEHIND);const i=new Fe(e,t);return i.re2Input=dI.compileImpl(n,s,(t&Fe.LONGEST_MATCH)!==0),i}static matches(e,t){return Fe.compile(e).testExact(t)}static initTest(e,t,n){if(e==null)throw new Error("pattern is null");if(n==null)throw new Error("re2 is null");const s=new Fe(e,t);return s.re2Input=n,s}constructor(e,t){this.patternInput=e,this.flagsInput=t,this.re2Input=null}reset(){this.re2Input.reset()}flags(){return this.flagsInput}pattern(){return this.patternInput}re2(){return this.re2Input}matches(e){return this.testExact(e)}matcher(e){return $.isByteArray(e)&&(e=cr.utf8(e)),new Jl(this,e)}test(e){return $.isByteArray(e)?this.re2Input.matchUTF8(e):this.re2Input.match(e)}testExact(e){const t=$.isByteArray(e)?Ie.fromUTF8(e):Ie.fromUTF16(e);return this.re2Input.executeEngine(t,0,x.ANCHOR_BOTH,0)!==null}exec(e){const t=this.matcher(e);if(!t.find())return null;const n=[t.group(0)];for(let i=1;i<=t.groupCount();i++){const o=t.group(i);n.push(o===null?void 0:o)}n.index=t.start(0),n.input=e;const s=this.namedGroups();if(Object.keys(s).length>0){const i=t.getNamedGroups();for(const o in i)i[o]===null&&(i[o]=void 0);n.groups=i}else n.groups=void 0;return n}split(e,t=0){const n=this.matcher(e),s=[];let i=0,o=0;for(;n.find();){if(o===0&&n.end()===0){o=n.end();continue}if(t>0&&s.length===t-1)break;if(o===n.start()){if(t===0){i+=1,o=n.end();continue}}else for(;i>0;)s.push(""),i-=1;s.push(n.substring(o,n.start())),o=n.end()}if(t===0&&o!==n.inputLength()){for(;i>0;)s.push(""),i-=1;s.push(n.substring(o,n.inputLength()))}return(t!==0||s.length===0&&!(o===n.inputLength()&&o>0))&&s.push(n.substring(o,n.inputLength())),s}*matchAll(e){const t=this.matcher(e);for(;t.find();){const n=[t.group(0)];for(let i=1;i<=t.groupCount();i++){const o=t.group(i);n.push(o===null?void 0:o)}n.index=t.start(0),n.input=e;const s=this.namedGroups();if(Object.keys(s).length>0){const i=t.getNamedGroups();for(const o in i)i[o]===null&&(i[o]=void 0);n.groups=i}else n.groups=void 0;yield n}}toString(){return this.patternInput}programSize(){return this.re2Input.numberOfInstructions()}groupCount(){return this.re2Input.numberOfCapturingGroups()}namedGroups(){return this.re2Input.namedGroups}equals(e){return this===e?!0:e===null||this.constructor!==e.constructor?!1:this.flagsInput===e.flagsInput&&this.patternInput===e.patternInput}},G(Fe,"CASE_INSENSITIVE",Rr.CASE_INSENSITIVE),G(Fe,"DOTALL",Rr.DOTALL),G(Fe,"MULTILINE",Rr.MULTILINE),G(Fe,"DISABLE_UNICODE_GROUPS",Rr.DISABLE_UNICODE_GROUPS),G(Fe,"LONGEST_MATCH",Rr.LONGEST_MATCH),G(Fe,"LOOKBEHINDS",Rr.LOOKBEHINDS),Fe);/**
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
 */let ts="12.18.0";function gI(r){ts=r}/**
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
 */const Hn=new QB("@firebase/firestore");function Sr(){return Hn.logLevel}function SR(r){Hn.setLogLevel(r)}function K(r,...e){if(Hn.logLevel<=ce.DEBUG){const t=e.map(uc);Hn.debug(`Firestore (${ts}): ${r}`,...t)}}function dn(r,...e){if(Hn.logLevel<=ce.ERROR){const t=e.map(uc);Hn.error(`Firestore (${ts}): ${r}`,...t)}}function Gt(r,...e){if(Hn.logLevel<=ce.WARN){const t=e.map(uc);Hn.warn(`Firestore (${ts}): ${r}`,...t)}}function uc(r){if(typeof r=="string")return r;try{return(function(t){return JSON.stringify(t)})(r)}catch{return r}}/**
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
 */function Y(r,e,t){let n="Unexpected state";typeof e=="string"?n=e:t=e,NC(r,n,t)}function NC(r,e,t){let n=`FIRESTORE (${ts}) INTERNAL ASSERTION FAILED: ${e} (ID: ${r.toString(16)})`;if(t!==void 0)try{n+=" CONTEXT: "+JSON.stringify(t)}catch{n+=" CONTEXT: "+t}throw dn(n),new Error(n)}function Q(r,e,t,n){let s="Unexpected state";typeof t=="string"?s=t:n=t,r||NC(e,s,n)}function ne(r,e){return r}/**
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
 */function mI(r){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(r);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let n=0;n<r;n++)t[n]=Math.floor(256*Math.random());return t}/**
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
 */class lc{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let n="";for(;n.length<20;){const s=mI(40);for(let i=0;i<s.length;++i)n.length<20&&s[i]<t&&(n+=e.charAt(s[i]%62))}return n}}function Be(r,e){return r<e?-1:r>e?1:0}function OB(r,e){const t=Math.min(r.length,e.length);for(let n=0;n<t;n++){const s=r.charAt(n),i=e.charAt(n);if(s!==i)return lB(s)===lB(i)?Be(s,i):lB(s)?1:-1}return Be(r.length,e.length)}const EI=55296,_I=57343;function lB(r){const e=r.charCodeAt(0);return e>=EI&&e<=_I}function Jr(r,e,t){return r.length===e.length&&r.every(((n,s)=>t(n,e[s])))}/**
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
 */class Re{constructor(e,t){this.comparator=e,this.root=t||Xe.EMPTY}insert(e,t){return new Re(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Xe.BLACK,null,null))}remove(e){return new Re(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Xe.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const n=this.comparator(e,t.key);if(n===0)return t.value;n<0?t=t.left:n>0&&(t=t.right)}return null}indexOf(e){let t=0,n=this.root;for(;!n.isEmpty();){const s=this.comparator(e,n.key);if(s===0)return t+n.left.size;s<0?n=n.left:(t+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal(((t,n)=>(e(t,n),!1)))}toString(){const e=[];return this.inorderTraversal(((t,n)=>(e.push(`${t}:${n}`),!1))),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new so(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new so(this.root,e,this.comparator,!1)}getReverseIterator(){return new so(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new so(this.root,e,this.comparator,!0)}}class so{constructor(e,t,n,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?n(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Xe{constructor(e,t,n,s,i){this.key=e,this.value=t,this.color=n??Xe.RED,this.left=s??Xe.EMPTY,this.right=i??Xe.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,n,s,i){return new Xe(e??this.key,t??this.value,n??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,n){let s=this;const i=n(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,n),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,n)),s.fixUp()}removeMin(){if(this.left.isEmpty())return Xe.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let n,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return Xe.EMPTY;n=s.right.min(),s=s.copy(n.key,n.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Xe.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Xe.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw Y(43730,{key:this.key,value:this.value});if(this.right.isRed())throw Y(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw Y(27949);return e+(this.isRed()?0:1)}}Xe.EMPTY=null,Xe.RED=!0,Xe.BLACK=!1;Xe.EMPTY=new class{constructor(){this.size=0}get key(){throw Y(57766)}get value(){throw Y(16141)}get color(){throw Y(16727)}get left(){throw Y(29726)}get right(){throw Y(36894)}copy(e,t,n,s,i){return this}insert(e,t,n){return new Xe(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class xe{constructor(e){this.comparator=e,this.data=new Re(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal(((t,n)=>(e(t),!1)))}forEachInRange(e,t){const n=this.data.getIteratorFrom(e[0]);for(;n.hasNext();){const s=n.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let n;for(n=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();n.hasNext();)if(!e(n.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Ch(this.data.getIterator())}getIteratorFrom(e){return new Ch(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach((n=>{t=t.add(n)})),t}isEqual(e){if(!(e instanceof xe)||this.size!==e.size)return!1;const t=this.data.getIterator(),n=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=n.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach((t=>{e.push(t)})),e}toString(){const e=[];return this.forEach((t=>e.push(t))),"SortedSet("+e.toString()+")"}copy(e){const t=new xe(this.comparator);return t.data=e,t}}class Ch{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
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
 */const F={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class J extends gn{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */const qt="__name__";class jt{constructor(e,t,n){t===void 0?t=0:t>e.length&&Y(637,{offset:t,range:e.length}),n===void 0?n=e.length-t:n>e.length-t&&Y(1746,{length:n,range:e.length-t}),this.segments=e,this.offset=t,this.len=n}get length(){return this.len}isEqual(e){return jt.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof jt?e.forEach((n=>{t.push(n)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,n=this.limit();t<n;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const n=Math.min(e.length,t.length);for(let s=0;s<n;s++){const i=jt.compareSegments(e.get(s),t.get(s));if(i!==0)return i}return Be(e.length,t.length)}static compareSegments(e,t){const n=jt.isNumericId(e),s=jt.isNumericId(t);return n&&!s?-1:!n&&s?1:n&&s?jt.extractNumericId(e).compare(jt.extractNumericId(t)):OB(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return kn.fromString(e.substring(4,e.length-2))}}class de extends jt{construct(e,t,n){return new de(e,t,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const n of e){if(n.indexOf("//")>=0)throw new J(F.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);t.push(...n.split("/").filter((s=>s.length>0)))}return new de(t)}static emptyPath(){return new de([])}}const DI=/^[_a-zA-Z][_a-zA-Z0-9]*$/;let vt=class Or extends jt{construct(e,t,n){return new Or(e,t,n)}static isValidIdentifier(e){return DI.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Or.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===qt}static keyField(){return new Or([qt])}static fromServerFormat(e){const t=[];let n="",s=0;const i=()=>{if(n.length===0)throw new J(F.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(n),n=""};let o=!1;for(;s<e.length;){const B=e[s];if(B==="\\"){if(s+1===e.length)throw new J(F.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const c=e[s+1];if(c!=="\\"&&c!=="."&&c!=="`")throw new J(F.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);n+=c,s+=2}else B==="`"?(o=!o,s++):B!=="."||o?(n+=B,s++):(i(),s++)}if(i(),o)throw new J(F.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Or(t)}static emptyPath(){return new Or([])}};/**
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
 */class At{constructor(e){this.fields=e,e.sort(vt.comparator)}static empty(){return new At([])}unionWith(e){let t=new xe(vt.comparator);for(const n of this.fields)t=t.add(n);for(const n of e)t=t.add(n);return new At(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Jr(this.fields,e.fields,((t,n)=>t.isEqual(n)))}}/**
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
 */function Ro(r){let e=0;for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e++;return e}function Zn(r,e){for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e(t,r[t])}function II(r,e){const t=[];for(const n in r)Object.prototype.hasOwnProperty.call(r,n)&&t.push(e(r[n],n,r));return t}function bC(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}/**
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
 */class X{constructor(e){this.path=e}static fromPath(e){return new X(de.fromString(e))}static fromName(e){return new X(de.fromString(e).popFirst(5))}static empty(){return new X(de.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&de.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return de.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new X(new de(e.slice()))}}/**
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
 */function LC(r,e,t){if(!t)throw new J(F.INVALID_ARGUMENT,`Function ${r}() cannot be called with an empty ${e}.`)}function wI(r,e,t,n){if(e===!0&&n===!0)throw new J(F.INVALID_ARGUMENT,`${r} and ${t} cannot be used together.`)}function dh(r){if(!X.isDocumentKey(r))throw new J(F.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${r} has ${r.length}.`)}function ph(r){if(X.isDocumentKey(r))throw new J(F.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${r} has ${r.length}.`)}function yi(r){return typeof r=="object"&&r!==null&&(Object.getPrototypeOf(r)===Object.prototype||Object.getPrototypeOf(r)===null)}function ta(r){if(r===void 0)return"undefined";if(r===null)return"null";if(typeof r=="string")return r.length>20&&(r=`${r.substring(0,20)}...`),JSON.stringify(r);if(typeof r=="number"||typeof r=="boolean")return""+r;if(typeof r=="object"){if(r instanceof Array)return"an array";{const e=(function(n){return n.constructor?n.constructor.name:null})(r);return e?`a custom ${e} object`:"an object"}}return typeof r=="function"?"a function":Y(12329,{type:typeof r})}function ht(r,e){if("_delegate"in r&&(r=r._delegate),!(r instanceof e)){if(e.name===r.constructor.name)throw new J(F.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=ta(r);throw new J(F.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return r}/**
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
 */function Ve(r,e){const t={typeString:r};return e&&(t.value=e),t}function Ti(r,e){if(!yi(r))throw new J(F.INVALID_ARGUMENT,"JSON must be an object");let t;for(const n in e)if(e[n]){const s=e[n].typeString,i="value"in e[n]?{value:e[n].value}:void 0;if(!(n in r)){t=`JSON missing required field: '${n}'`;break}const o=r[n];if(s&&typeof o!==s){t=`JSON field '${n}' must be a ${s}.`;break}if(i!==void 0&&o!==i.value){t=`Expected '${n}' field to equal '${i.value}'`;break}}if(t)throw new J(F.INVALID_ARGUMENT,t);return!0}/**
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
 */const gh=-62135596800,mh=1e6;class ye{static now(){return ye.fromMillis(Date.now())}static fromDate(e){return ye.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),n=Math.floor((e-1e3*t)*mh);return new ye(t,n)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new J(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new J(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<gh)throw new J(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new J(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/mh}_compareTo(e){return this.seconds===e.seconds?Be(this.nanoseconds,e.nanoseconds):Be(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:ye._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(Ti(e,ye._jsonSchema))return new ye(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-gh;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}ye._jsonSchemaVersion="firestore/timestamp/1.0",ye._jsonSchema={type:Ve("string",ye._jsonSchemaVersion),seconds:Ve("number"),nanoseconds:Ve("number")};/**
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
 */class FC extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */class Me{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new FC("Invalid base64 string: "+i):i}})(e);return new Me(t)}static fromUint8Array(e){const t=(function(s){let i="";for(let o=0;o<s.length;++o)i+=String.fromCharCode(s[o]);return i})(e);return new Me(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const n=new Uint8Array(t.length);for(let s=0;s<t.length;s++)n[s]=t.charCodeAt(s);return n})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Be(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Me.EMPTY_BYTE_STRING=new Me("");const yI=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Jn(r){if(Q(!!r,39018),typeof r=="string"){let e=0;const t=yI.exec(r);if(Q(!!t,46558,{timestamp:r}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const n=new Date(r);return{seconds:Math.floor(n.getTime()/1e3),nanos:e}}return{seconds:ve(r.seconds),nanos:ve(r.nanos)}}function ve(r){return typeof r=="number"?r:typeof r=="string"?Number(r):0}function jn(r){return typeof r=="string"?Me.fromBase64String(r):Me.fromUint8Array(r)}/**
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
 */const kC="server_timestamp",VC="__type__",xC="__previous_value__",MC="__local_write_time__";function na(r){var t,n;return((n=(((t=r==null?void 0:r.mapValue)==null?void 0:t.fields)||{})[VC])==null?void 0:n.stringValue)===kC}function Ai(r){const e=r.mapValue.fields[xC];return na(e)?Ai(e):e}function jr(r){const e=Jn(r.mapValue.fields[MC].timestampValue);return new ye(e.seconds,e.nanos)}/**
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
 */class TI{constructor(e,t,n,s,i,o,B,c,u,h,C,p,I){this.databaseId=e,this.appId=t,this.persistenceKey=n,this.host=s,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=B,this.longPollingOptions=c,this.useFetchStreams=u,this.isUsingEmulator=h,this.apiKey=C,this._customHeaders=p,this.grpcFlowControlWindow=I}}const ti="(default)";class ni{constructor(e,t){this.projectId=e,this.database=t||ti}static empty(){return new ni("","")}get isDefaultDatabase(){return this.database===ti}isEqual(e){return e instanceof ni&&e.projectId===this.projectId&&e.database===this.database}}function AI(r,e){if(!Object.prototype.hasOwnProperty.apply(r.options,["projectId"]))throw new J(F.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new ni(r.options.projectId,e)}/**
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
 */const hc=-1;function Ri(r){return r==null}function ri(r){return r===0&&1/r==-1/0}function RI(r){return typeof r=="number"&&Number.isInteger(r)&&!ri(r)&&r<=Number.MAX_SAFE_INTEGER&&r>=Number.MIN_SAFE_INTEGER}function vI(r){return typeof r=="string"}/**
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
 */const GC="__type__",PI="__max__",io={mapValue:{}},UC="__vector__",si="value",qr={nullValue:"NULL_VALUE"},Et={booleanValue:!0},$e={booleanValue:!1};function Ge(r){return"nullValue"in r?0:"booleanValue"in r?1:"integerValue"in r||"doubleValue"in r?2:"timestampValue"in r?3:"stringValue"in r?5:"bytesValue"in r?6:"referenceValue"in r?7:"geoPointValue"in r?8:"arrayValue"in r?9:"mapValue"in r?na(r)?4:SI(r)?9007199254740991:vo(r)?10:11:Y(28295,{value:r})}function xt(r,e,t){if(r===e)return!0;const n=Ge(r);if(n!==Ge(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return r.booleanValue===e.booleanValue;case 4:return jr(r).isEqual(jr(e));case 3:return(function(i,o){if(typeof i.timestampValue=="string"&&typeof o.timestampValue=="string"&&i.timestampValue.length===o.timestampValue.length)return i.timestampValue===o.timestampValue;const B=Jn(i.timestampValue),c=Jn(o.timestampValue);return B.seconds===c.seconds&&B.nanos===c.nanos})(r,e);case 5:return r.stringValue===e.stringValue;case 6:return(function(i,o){return jn(i.bytesValue).isEqual(jn(o.bytesValue))})(r,e);case 7:return r.referenceValue===e.referenceValue;case 8:return(function(i,o){return ve(i.geoPointValue.latitude)===ve(o.geoPointValue.latitude)&&ve(i.geoPointValue.longitude)===ve(o.geoPointValue.longitude)})(r,e);case 2:return(function(i,o,B){if("integerValue"in i&&"integerValue"in o)return ve(i.integerValue)===ve(o.integerValue);let c,u;if("doubleValue"in i&&"doubleValue"in o)c=ve(i.doubleValue),u=ve(o.doubleValue);else{if(!(B!=null&&B.t))return!1;c=ve(i.integerValue??i.doubleValue),u=ve(o.integerValue??o.doubleValue)}return c===u?!!(B!=null&&B.i)||ri(c)===ri(u):!!(B===void 0||B.o)&&isNaN(c)&&isNaN(u)})(r,e,t);case 9:return Jr(r.arrayValue.values||[],e.arrayValue.values||[],((s,i)=>xt(s,i,t)));case 10:case 11:return(function(i,o,B){const c=i.mapValue.fields||{},u=o.mapValue.fields||{};if(Ro(c)!==Ro(u))return!1;for(const h in c)if(c.hasOwnProperty(h)&&(u[h]===void 0||!xt(c[h],u[h],B)))return!1;return!0})(r,e,t);default:return Y(52216,{left:r})}}function ii(r,e){return(r.values||[]).find((t=>xt(t,e)))!==void 0}function _t(r,e){if(r===e)return 0;const t=Ge(r),n=Ge(e);if(t!==n)return Be(t,n);switch(t){case 0:case 9007199254740991:return 0;case 1:return Be(r.booleanValue,e.booleanValue);case 2:return(function(i,o){const B=ve(i.integerValue||i.doubleValue),c=ve(o.integerValue||o.doubleValue);return B<c?-1:B>c?1:B===c?0:isNaN(B)?isNaN(c)?0:-1:1})(r,e);case 3:return Eh(r.timestampValue,e.timestampValue);case 4:return Eh(jr(r),jr(e));case 5:return OB(r.stringValue,e.stringValue);case 6:return(function(i,o){const B=jn(i),c=jn(o);return B.compareTo(c)})(r.bytesValue,e.bytesValue);case 7:return(function(i,o){const B=i.split("/"),c=o.split("/");for(let u=0;u<B.length&&u<c.length;u++){const h=Be(B[u],c[u]);if(h!==0)return h}return Be(B.length,c.length)})(r.referenceValue,e.referenceValue);case 8:return(function(i,o){const B=Be(ve(i.latitude),ve(o.latitude));return B!==0?B:Be(ve(i.longitude),ve(o.longitude))})(r.geoPointValue,e.geoPointValue);case 9:return _h(r.arrayValue,e.arrayValue);case 10:return(function(i,o){var p,I,R,k;const B=i.fields||{},c=o.fields||{},u=(p=B[si])==null?void 0:p.arrayValue,h=(I=c[si])==null?void 0:I.arrayValue,C=Be(((R=u==null?void 0:u.values)==null?void 0:R.length)||0,((k=h==null?void 0:h.values)==null?void 0:k.length)||0);return C!==0?C:_h(u,h)})(r.mapValue,e.mapValue);case 11:return(function(i,o){if(i===io.mapValue&&o===io.mapValue)return 0;if(i===io.mapValue)return 1;if(o===io.mapValue)return-1;const B=i.fields||{},c=Object.keys(B),u=o.fields||{},h=Object.keys(u);c.sort(),h.sort();for(let C=0;C<c.length&&C<h.length;++C){const p=OB(c[C],h[C]);if(p!==0)return p;const I=_t(B[c[C]],u[h[C]]);if(I!==0)return I}return Be(c.length,h.length)})(r.mapValue,e.mapValue);default:throw Y(23264,{u:t})}}function Eh(r,e){if(typeof r=="string"&&typeof e=="string"&&r.length===e.length)return Be(r,e);const t=Jn(r),n=Jn(e),s=Be(t.seconds,n.seconds);return s!==0?s:Be(t.nanos,n.nanos)}function _h(r,e){const t=r.values||[],n=e.values||[];for(let s=0;s<t.length&&s<n.length;++s){const i=_t(t[s],n[s]);if(i!==void 0&&i!==0)return i}return Be(t.length,n.length)}function Kr(r){return NB(r)}function NB(r){return"nullValue"in r?"null":"booleanValue"in r?""+r.booleanValue:"integerValue"in r?""+r.integerValue:"doubleValue"in r?""+r.doubleValue:"timestampValue"in r?(function(t){const n=Jn(t);return`time(${n.seconds},${n.nanos})`})(r.timestampValue):"stringValue"in r?r.stringValue:"bytesValue"in r?(function(t){return jn(t).toBase64()})(r.bytesValue):"referenceValue"in r?(function(t){return X.fromName(t).toString()})(r.referenceValue):"geoPointValue"in r?(function(t){return`geo(${t.latitude},${t.longitude})`})(r.geoPointValue):"arrayValue"in r?(function(t){let n="[",s=!0;for(const i of t.values||[])s?s=!1:n+=",",n+=NB(i);return n+"]"})(r.arrayValue):"mapValue"in r?(function(t){const n=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const o of n)i?i=!1:s+=",",s+=`${o}:${NB(t.fields[o])}`;return s+"}"})(r.mapValue):Y(61005,{value:r})}function Co(r){switch(Ge(r)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=Ai(r);return e?16+Co(e):16;case 5:return 2*r.stringValue.length;case 6:return jn(r.bytesValue).approximateByteSize();case 7:return r.referenceValue.length;case 9:return(function(n){return(n.values||[]).reduce(((s,i)=>s+Co(i)),0)})(r.arrayValue);case 10:case 11:return(function(n){let s=0;return Zn(n.fields,((i,o)=>{s+=i.length+Co(o)})),s})(r.mapValue);default:throw Y(13486,{value:r})}}function Dh(r,e){return{referenceValue:`projects/${r.projectId}/databases/${r.database}/documents/${e.path.canonicalString()}`}}function Kt(r){return!!r&&"integerValue"in r}function ur(r){return!!r&&"doubleValue"in r}function qn(r){return Kt(r)||ur(r)}function Wr(r){return!!r&&"arrayValue"in r}function Rt(r){return!!r&&"nullValue"in r}function Dt(r){return!!r&&"doubleValue"in r&&isNaN(Number(r.doubleValue))}function hr(r){return!!r&&"mapValue"in r}function vo(r){var t,n;return((n=(((t=r==null?void 0:r.mapValue)==null?void 0:t.fields)||{})[GC])==null?void 0:n.stringValue)===UC}function bB(r){var e,t;return(t=(((e=r==null?void 0:r.mapValue)==null?void 0:e.fields)||{})[si])==null?void 0:t.arrayValue}function Us(r){if(r.geoPointValue)return{geoPointValue:{...r.geoPointValue}};if(r.timestampValue&&typeof r.timestampValue=="object")return{timestampValue:{...r.timestampValue}};if(r.mapValue){const e={mapValue:{fields:{}}};return Zn(r.mapValue.fields,((t,n)=>e.mapValue.fields[t]=Us(n))),e}if(r.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(r.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Us(r.arrayValue.values[t]);return e}return{...r}}function SI(r){return(((r.mapValue||{}).fields||{}).__type__||{}).stringValue===PI}/**
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
 */class rt{constructor(e){this.value=e}static empty(){return new rt({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let n=0;n<e.length-1;++n)if(t=(t.mapValue.fields||{})[e.get(n)],!hr(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Us(t)}setAll(e){let t=vt.emptyPath(),n={},s=[];e.forEach(((o,B)=>{if(!t.isImmediateParentOf(B)){const c=this.getFieldsMap(t);this.applyChanges(c,n,s),n={},s=[],t=B.popLast()}o?n[B.lastSegment()]=Us(o):s.push(B.lastSegment())}));const i=this.getFieldsMap(t);this.applyChanges(i,n,s)}delete(e){const t=this.field(e.popLast());hr(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return xt(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let n=0;n<e.length;++n){let s=t.mapValue.fields[e.get(n)];hr(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(n)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,n){Zn(t,((s,i)=>e[s]=i));for(const s of n)delete e[s]}clone(){return new rt(Us(this.value))}}function HC(r){const e=[];return Zn(r.fields,((t,n)=>{const s=new vt([t]);if(hr(n)){const i=HC(n.mapValue).fields;if(i.length===0)e.push(s);else for(const o of i)e.push(s.child(o))}else e.push(s)})),new At(e)}/**
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
 */function ra(r,e){if(r.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:ri(e)?"-0":e}}function fc(r){return{integerValue:""+r}}function Cc(r,e,t){return RI(e)?fc(e):ra(r,e)}/**
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
 */class sa{constructor(){this._=void 0}}function OI(r,e,t){return r instanceof oi?(function(s,i){const o={fields:{[VC]:{stringValue:kC},[MC]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&na(i)&&(i=Ai(i)),i&&(o.fields[xC]=i),{mapValue:o}})(t,e):r instanceof ai?jC(r,e):r instanceof Bi?qC(r,e):r instanceof ci?(function(s,i){const o=JC(s,i),B=Oo(o)+Oo(s.l);return Kt(o)&&Kt(s.l)?fc(B):ra(s.serializer,B)})(r,e):r instanceof Po?(function(s,i){return Ih(s,i,Math.min)})(r,e):r instanceof So?(function(s,i){return Ih(s,i,Math.max)})(r,e):void 0}function NI(r,e,t){return r instanceof ai?jC(r,e):r instanceof Bi?qC(r,e):t}function JC(r,e){return r instanceof ci?qn(e)?e:{integerValue:0}:null}class oi extends sa{}class ai extends sa{constructor(e){super(),this.elements=e}}function jC(r,e){const t=KC(e);for(const n of r.elements)t.some((s=>xt(s,n)))||t.push(n);return{arrayValue:{values:t}}}class Bi extends sa{constructor(e){super(),this.elements=e}}function qC(r,e){let t=KC(e);for(const n of r.elements)t=t.filter((s=>!xt(s,n)));return{arrayValue:{values:t}}}class dc extends sa{constructor(e,t){super(),this.serializer=e,this.l=t}}class ci extends dc{}class Po extends dc{}class So extends dc{}function Ih(r,e,t){if(!qn(e))return r.l;const n=t(Oo(e),Oo(r.l));return Kt(e)&&Kt(r.l)?fc(n):ra(r.serializer,n)}function Oo(r){return ve(r.integerValue||r.doubleValue)}function KC(r){return Wr(r)&&r.arrayValue.values?r.arrayValue.values.slice():[]}/**
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
 */class bI{constructor(e,t){this.field=e,this.transform=t}}function LI(r,e){return r.field.isEqual(e.field)&&(function(n,s){return n instanceof ai&&s instanceof ai||n instanceof Bi&&s instanceof Bi?Jr(n.elements,s.elements,xt):n instanceof ci&&s instanceof ci||n instanceof Po&&s instanceof Po||n instanceof So&&s instanceof So?xt(n.l,s.l):n instanceof oi&&s instanceof oi})(r.transform,e.transform)}class FI{constructor(e,t){this.version=e,this.transformResults=t}}class st{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new st}static exists(e){return new st(void 0,e)}static updateTime(e){return new st(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function po(r,e){return r.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(r.updateTime):r.exists===void 0||r.exists===e.isFoundDocument()}class ia{}function WC(r,e){if(!r.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return r.isNoDocument()?new oa(r.key,st.none()):new vi(r.key,r.data,st.none());{const t=r.data,n=rt.empty();let s=new xe(vt.comparator);for(let i of e.fields)if(!s.has(i)){let o=t.field(i);o===null&&i.length>1&&(i=i.popLast(),o=t.field(i)),o===null?n.delete(i):n.set(i,o),s=s.add(i)}return new er(r.key,n,new At(s.toArray()),st.none())}}function kI(r,e,t){r instanceof vi?(function(s,i,o){const B=s.value.clone(),c=yh(s.fieldTransforms,i,o.transformResults);B.setAll(c),i.convertToFoundDocument(o.version,B).setHasCommittedMutations()})(r,e,t):r instanceof er?(function(s,i,o){if(!po(s.precondition,i))return void i.convertToUnknownDocument(o.version);const B=yh(s.fieldTransforms,i,o.transformResults),c=i.data;c.setAll(zC(s)),c.setAll(B),i.convertToFoundDocument(o.version,c).setHasCommittedMutations()})(r,e,t):(function(s,i,o){i.convertToNoDocument(o.version).setHasCommittedMutations()})(0,e,t)}function Hs(r,e,t,n){return r instanceof vi?(function(i,o,B,c){if(!po(i.precondition,o))return B;const u=i.value.clone(),h=Th(i.fieldTransforms,c,o);return u.setAll(h),o.convertToFoundDocument(o.version,u).setHasLocalMutations(),null})(r,e,t,n):r instanceof er?(function(i,o,B,c){if(!po(i.precondition,o))return B;const u=Th(i.fieldTransforms,c,o),h=o.data;return h.setAll(zC(i)),h.setAll(u),o.convertToFoundDocument(o.version,h).setHasLocalMutations(),B===null?null:B.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map((C=>C.field)))})(r,e,t,n):(function(i,o,B){return po(i.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):B})(r,e,t)}function VI(r,e){let t=null;for(const n of r.fieldTransforms){const s=e.data.field(n.field),i=JC(n.transform,s||null);i!=null&&(t===null&&(t=rt.empty()),t.set(n.field,i))}return t||null}function wh(r,e){return r.type===e.type&&!!r.key.isEqual(e.key)&&!!r.precondition.isEqual(e.precondition)&&!!(function(n,s){return n===void 0&&s===void 0||!(!n||!s)&&Jr(n,s,((i,o)=>LI(i,o)))})(r.fieldTransforms,e.fieldTransforms)&&(r.type===0?r.value.isEqual(e.value):r.type!==1||r.data.isEqual(e.data)&&r.fieldMask.isEqual(e.fieldMask))}class vi extends ia{constructor(e,t,n,s=[]){super(),this.key=e,this.value=t,this.precondition=n,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class er extends ia{constructor(e,t,n,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=n,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function zC(r){const e=new Map;return r.fieldMask.fields.forEach((t=>{if(!t.isEmpty()){const n=r.data.field(t);e.set(t,n)}})),e}function yh(r,e,t){const n=new Map;Q(r.length===t.length,32656,{h:t.length,T:r.length});for(let s=0;s<t.length;s++){const i=r[s],o=i.transform,B=e.data.field(i.field);n.set(i.field,NI(o,B,t[s]))}return n}function Th(r,e,t){const n=new Map;for(const s of r){const i=s.transform,o=t.data.field(s.field);n.set(s.field,OI(i,o,e))}return n}class oa extends ia{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class QC extends ia{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */class No{constructor(e,t){this.position=e,this.inclusive=t}}function Ah(r,e,t){let n=0;for(let s=0;s<r.position.length;s++){const i=e[s],o=r.position[s];if(i.field.isKeyField()?n=X.comparator(X.fromName(o.referenceValue),t.key):n=_t(o,t.data.field(i.field)),i.dir==="desc"&&(n*=-1),n!==0)break}return n}function Rh(r,e){if(r===null)return e===null;if(e===null||r.inclusive!==e.inclusive||r.position.length!==e.position.length)return!1;for(let t=0;t<r.position.length;t++)if(!xt(r.position[t],e.position[t]))return!1;return!0}/**
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
 */class $C{}class ke extends $C{constructor(e,t,n){super(),this.field=e,this.op=t,this.value=n}static create(e,t,n){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,n):new MI(e,t,n):t==="array-contains"?new HI(e,n):t==="in"?new JI(e,n):t==="not-in"?new jI(e,n):t==="array-contains-any"?new qI(e,n):new ke(e,t,n)}static createKeyFieldInFilter(e,t,n){return t==="in"?new GI(e,n):new UI(e,n)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(_t(t,this.value)):t!==null&&Ge(this.value)===Ge(t)&&this.matchesComparison(_t(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return Y(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Ut extends $C{constructor(e,t){super(),this.filters=e,this.op=t,this.P=null}static create(e,t){return new Ut(e,t)}matches(e){return YC(this)?this.filters.find((t=>!t.matches(e)))===void 0:this.filters.find((t=>t.matches(e)))!==void 0}getFlattenedFilters(){return this.P!==null||(this.P=this.filters.reduce(((e,t)=>e.concat(t.getFlattenedFilters())),[])),this.P}getFilters(){return Object.assign([],this.filters)}}function YC(r){return r.op==="and"}function XC(r){return xI(r)&&YC(r)}function xI(r){for(const e of r.filters)if(e instanceof Ut)return!1;return!0}function LB(r){if(r instanceof ke)return r.field.canonicalString()+r.op.toString()+Kr(r.value);if(XC(r))return r.filters.map((e=>LB(e))).join(",");{const e=r.filters.map((t=>LB(t))).join(",");return`${r.op}(${e})`}}function ZC(r,e){return r instanceof ke?(function(n,s){return s instanceof ke&&n.op===s.op&&n.field.isEqual(s.field)&&xt(n.value,s.value)})(r,e):r instanceof Ut?(function(n,s){return s instanceof Ut&&n.op===s.op&&n.filters.length===s.filters.length?n.filters.reduce(((i,o,B)=>i&&ZC(o,s.filters[B])),!0):!1})(r,e):void Y(19439)}function ed(r){return r instanceof ke?(function(t){return`${t.field.canonicalString()} ${t.op} ${Kr(t.value)}`})(r):r instanceof Ut?(function(t){return t.op.toString()+" {"+t.getFilters().map(ed).join(" ,")+"}"})(r):"Filter"}class MI extends ke{constructor(e,t,n){super(e,t,n),this.key=X.fromName(n.referenceValue)}matches(e){const t=X.comparator(e.key,this.key);return this.matchesComparison(t)}}class GI extends ke{constructor(e,t){super(e,"in",t),this.keys=td("in",t)}matches(e){return this.keys.some((t=>t.isEqual(e.key)))}}class UI extends ke{constructor(e,t){super(e,"not-in",t),this.keys=td("not-in",t)}matches(e){return!this.keys.some((t=>t.isEqual(e.key)))}}function td(r,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map((n=>X.fromName(n.referenceValue)))}class HI extends ke{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Wr(t)&&ii(t.arrayValue,this.value)}}class JI extends ke{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&ii(this.value.arrayValue,t)}}class jI extends ke{constructor(e,t){super(e,"not-in",t)}matches(e){if(ii(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!ii(this.value.arrayValue,t)}}class qI extends ke{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Wr(t)||!t.arrayValue.values)&&t.arrayValue.values.some((n=>ii(this.value.arrayValue,n)))}}/**
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
 */class bo{constructor(e,t="asc"){this.field=e,this.dir=t}}function KI(r,e){return r.dir===e.dir&&r.field.isEqual(e.field)}/**
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
 */class Qe{constructor(e,t,n,s,i,o,B){this.key=e,this.documentType=t,this.version=n,this.readTime=s,this.createTime=i,this.data=o,this.documentState=B}static newInvalidDocument(e){return new Qe(e,0,te.min(),te.min(),te.min(),rt.empty(),0)}static newFoundDocument(e,t,n,s){return new Qe(e,1,t,te.min(),n,s,0)}static newNoDocument(e,t){return new Qe(e,2,t,te.min(),te.min(),rt.empty(),0)}static newUnknownDocument(e,t){return new Qe(e,3,t,te.min(),te.min(),rt.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(te.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=rt.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=rt.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=te.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Qe&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Qe(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */const ui=-1;function WI(r,e){const t=r.toTimestamp().seconds,n=r.toTimestamp().nanoseconds+1,s=te.fromTimestamp(n===1e9?new ye(t+1,0):new ye(t,n));return new Kn(s,X.empty(),e)}function zI(r){return new Kn(r.readTime,r.key,ui)}class Kn{constructor(e,t,n){this.readTime=e,this.documentKey=t,this.largestBatchId=n}static min(){return new Kn(te.min(),X.empty(),ui)}static max(){return new Kn(te.max(),X.empty(),ui)}}function QI(r,e){let t=r.readTime.compareTo(e.readTime);return t!==0?t:(t=X.comparator(r.documentKey,e.documentKey),t!==0?t:Be(r.largestBatchId,e.largestBatchId))}/**
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
 */class $I{constructor(e,t=null,n=[],s=[],i=null,o=null,B=null){this.path=e,this.collectionGroup=t,this.orderBy=n,this.filters=s,this.limit=i,this.startAt=o,this.endAt=B,this.R=null}}function vh(r,e=null,t=[],n=[],s=null,i=null,o=null){return new $I(r,e,t,n,s,i,o)}function nd(r){const e=ne(r);if(e.R===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map((n=>LB(n))).join(","),t+="|ob:",t+=e.orderBy.map((n=>(function(i){return i.field.canonicalString()+i.dir})(n))).join(","),Ri(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map((n=>Kr(n))).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map((n=>Kr(n))).join(",")),e.R=t}return e.R}function rd(r,e){if(r.limit!==e.limit||r.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<r.orderBy.length;t++)if(!KI(r.orderBy[t],e.orderBy[t]))return!1;if(r.filters.length!==e.filters.length)return!1;for(let t=0;t<r.filters.length;t++)if(!ZC(r.filters[t],e.filters[t]))return!1;return r.collectionGroup===e.collectionGroup&&!!r.path.isEqual(e.path)&&!!Rh(r.startAt,e.startAt)&&Rh(r.endAt,e.endAt)}function Br(r){return!!r.isCorePipeline}function sd(r){return!!r.path&&X.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}/**
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
 */class Pi{constructor(e,t=null,n=[],s=[],i=null,o="F",B=null,c=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=n,this.filters=s,this.limit=i,this.limitType=o,this.startAt=B,this.endAt=c,this.I=null,this.A=null,this.V=null,this.startAt,this.endAt}}function YI(r,e,t,n,s,i,o,B){return new Pi(r,e,t,n,s,i,o,B)}function aa(r){return new Pi(r)}function Ph(r){return r.filters.length===0&&r.limit===null&&r.startAt==null&&r.endAt==null&&(r.explicitOrderBy.length===0||r.explicitOrderBy.length===1&&r.explicitOrderBy[0].field.isKeyField())}function XI(r){return X.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}function id(r){return r.collectionGroup!==null}function Js(r){const e=ne(r);if(e.I===null){e.I=[];const t=new Set;for(const i of e.explicitOrderBy)e.I.push(i),t.add(i.field.canonicalString());const n=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let B=new xe(vt.comparator);return o.filters.forEach((c=>{c.getFlattenedFilters().forEach((u=>{u.isInequality()&&(B=B.add(u.field))}))})),B})(e).forEach((i=>{t.has(i.canonicalString())||i.isKeyField()||e.I.push(new bo(i,n))})),t.has(vt.keyField().canonicalString())||e.I.push(new bo(vt.keyField(),n))}return e.I}function zt(r){const e=ne(r);return e.A||(e.A=ZI(e,Js(r))),e.A}function ZI(r,e){if(r.limitType==="F")return vh(r.path,r.collectionGroup,e,r.filters,r.limit,r.startAt,r.endAt);{e=e.map((s=>{const i=s.dir==="desc"?"asc":"desc";return new bo(s.field,i)}));const t=r.endAt?new No(r.endAt.position,r.endAt.inclusive):null,n=r.startAt?new No(r.startAt.position,r.startAt.inclusive):null;return vh(r.path,r.collectionGroup,e,r.filters,r.limit,t,n)}}function FB(r,e){const t=r.filters.concat([e]);return new Pi(r.path,r.collectionGroup,r.explicitOrderBy.slice(),t,r.limit,r.limitType,r.startAt,r.endAt)}function kB(r,e,t){return new Pi(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),e,t,r.startAt,r.endAt)}function ew(r,e){return rd(zt(r),zt(e))&&r.limitType===e.limitType}function js(r){return`Query(target=${(function(t){let n=t.path.canonicalString();return t.collectionGroup!==null&&(n+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(n+=`, filters: [${t.filters.map((s=>ed(s))).join(", ")}]`),Ri(t.limit)||(n+=", limit: "+t.limit),t.orderBy.length>0&&(n+=`, orderBy: [${t.orderBy.map((s=>(function(o){return`${o.field.canonicalString()} (${o.dir})`})(s))).join(", ")}]`),t.startAt&&(n+=", startAt: ",n+=t.startAt.inclusive?"b:":"a:",n+=t.startAt.position.map((s=>Kr(s))).join(",")),t.endAt&&(n+=", endAt: ",n+=t.endAt.inclusive?"a:":"b:",n+=t.endAt.position.map((s=>Kr(s))).join(",")),`Target(${n})`})(zt(r))}; limitType=${r.limitType})`}function Ba(r,e){return e.isFoundDocument()&&(function(n,s){const i=s.key.path;return n.collectionGroup!==null?s.key.hasCollectionId(n.collectionGroup)&&n.path.isPrefixOf(i):X.isDocumentKey(n.path)?n.path.isEqual(i):n.path.isImmediateParentOf(i)})(r,e)&&(function(n,s){for(const i of Js(n))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0})(r,e)&&(function(n,s){for(const i of n.filters)if(!i.matches(s))return!1;return!0})(r,e)&&(function(n,s){return!(n.startAt&&!(function(o,B,c){const u=Ah(o,B,c);return o.inclusive?u<=0:u<0})(n.startAt,Js(n),s)||n.endAt&&!(function(o,B,c){const u=Ah(o,B,c);return o.inclusive?u>=0:u>0})(n.endAt,Js(n),s))})(r,e)}function pc(r){return(e,t)=>{let n=!1;for(const s of Js(r)){const i=tw(s,e,t);if(i!==0)return i;n=n||s.field.isKeyField()}return 0}}function tw(r,e,t){const n=r.field.isKeyField()?X.comparator(e.key,t.key):(function(i,o,B){const c=o.data.field(i),u=B.data.field(i);return c!==null&&u!==null?_t(c,u):Y(42886)})(r.field,e,t);switch(r.dir){case"asc":return n;case"desc":return-1*n;default:return Y(19790,{direction:r.dir})}}/**
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
 */class nw{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
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
 */var be,le;function od(r){switch(r){case F.OK:return Y(64938);case F.CANCELLED:case F.UNKNOWN:case F.DEADLINE_EXCEEDED:case F.RESOURCE_EXHAUSTED:case F.INTERNAL:case F.UNAVAILABLE:case F.UNAUTHENTICATED:return!1;case F.INVALID_ARGUMENT:case F.NOT_FOUND:case F.ALREADY_EXISTS:case F.PERMISSION_DENIED:case F.FAILED_PRECONDITION:case F.ABORTED:case F.OUT_OF_RANGE:case F.UNIMPLEMENTED:case F.DATA_LOSS:return!0;default:return Y(15467,{code:r})}}function ad(r){if(r===void 0)return dn("GRPC error has no .code"),F.UNKNOWN;switch(r){case be.OK:return F.OK;case be.CANCELLED:return F.CANCELLED;case be.UNKNOWN:return F.UNKNOWN;case be.DEADLINE_EXCEEDED:return F.DEADLINE_EXCEEDED;case be.RESOURCE_EXHAUSTED:return F.RESOURCE_EXHAUSTED;case be.INTERNAL:return F.INTERNAL;case be.UNAVAILABLE:return F.UNAVAILABLE;case be.UNAUTHENTICATED:return F.UNAUTHENTICATED;case be.INVALID_ARGUMENT:return F.INVALID_ARGUMENT;case be.NOT_FOUND:return F.NOT_FOUND;case be.ALREADY_EXISTS:return F.ALREADY_EXISTS;case be.PERMISSION_DENIED:return F.PERMISSION_DENIED;case be.FAILED_PRECONDITION:return F.FAILED_PRECONDITION;case be.ABORTED:return F.ABORTED;case be.OUT_OF_RANGE:return F.OUT_OF_RANGE;case be.UNIMPLEMENTED:return F.UNIMPLEMENTED;case be.DATA_LOSS:return F.DATA_LOSS;default:return Y(39323,{code:r})}}(le=be||(be={}))[le.OK=0]="OK",le[le.CANCELLED=1]="CANCELLED",le[le.UNKNOWN=2]="UNKNOWN",le[le.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",le[le.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",le[le.NOT_FOUND=5]="NOT_FOUND",le[le.ALREADY_EXISTS=6]="ALREADY_EXISTS",le[le.PERMISSION_DENIED=7]="PERMISSION_DENIED",le[le.UNAUTHENTICATED=16]="UNAUTHENTICATED",le[le.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",le[le.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",le[le.ABORTED=10]="ABORTED",le[le.OUT_OF_RANGE=11]="OUT_OF_RANGE",le[le.UNIMPLEMENTED=12]="UNIMPLEMENTED",le[le.INTERNAL=13]="INTERNAL",le[le.UNAVAILABLE=14]="UNAVAILABLE",le[le.DATA_LOSS=15]="DATA_LOSS";/**
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
 */class _r{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n!==void 0){for(const[s,i]of n)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const n=this.mapKeyFn(e),s=this.inner[n];if(s===void 0)return this.inner[n]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n===void 0)return!1;for(let s=0;s<n.length;s++)if(this.equalsFn(n[s][0],e))return n.length===1?delete this.inner[t]:n.splice(s,1),this.innerSize--,!0;return!1}forEach(e){Zn(this.inner,((t,n)=>{for(const[s,i]of n)e(s,i)}))}isEmpty(){return bC(this.inner)}size(){return this.innerSize}}/**
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
 */const rw=new Re(X.comparator);function pt(){return rw}const Bd=new Re(X.comparator);function Nr(...r){let e=Bd;for(const t of r)e=e.insert(t.key,t);return e}function cd(r){let e=Bd;return r.forEach(((t,n)=>e=e.insert(t,n.overlayedDocument))),e}function Sn(){return qs()}function ud(){return qs()}function qs(){return new _r((r=>r.toString()),((r,e)=>r.isEqual(e)))}const sw=new Re(X.comparator),iw=new xe(X.comparator);function ie(...r){let e=iw;for(const t of r)e=e.add(t);return e}const ow=new xe(Be);function aw(){return ow}/**
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
 */function Bw(){return new TextEncoder}/**
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
 */const cw=new kn([4294967295,4294967295],0);function Sh(r){const e=Bw().encode(r),t=new _C;return t.update(e),new Uint8Array(t.digest())}function Oh(r){const e=new DataView(r.buffer),t=e.getUint32(0,!0),n=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new kn([t,n],0),new kn([s,i],0)]}class gc{constructor(e,t,n){if(this.bitmap=e,this.padding=t,this.hashCount=n,t<0||t>=8)throw new bs(`Invalid padding: ${t}`);if(n<0)throw new bs(`Invalid hash count: ${n}`);if(e.length>0&&this.hashCount===0)throw new bs(`Invalid hash count: ${n}`);if(e.length===0&&t!==0)throw new bs(`Invalid padding when bitmap length is 0: ${t}`);this.m=8*e.length-t,this.p=kn.fromNumber(this.m)}S(e,t,n){let s=e.add(t.multiply(kn.fromNumber(n)));return s.compare(cw)===1&&(s=new kn([s.getBits(0),s.getBits(1)],0)),s.modulo(this.p).toNumber()}v(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.m===0)return!1;const t=Sh(e),[n,s]=Oh(t);for(let i=0;i<this.hashCount;i++){const o=this.S(n,s,i);if(!this.v(o))return!1}return!0}static create(e,t,n){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),o=new gc(i,s,t);return n.forEach((B=>o.insert(B))),o}insert(e){if(this.m===0)return;const t=Sh(e),[n,s]=Oh(t);for(let i=0;i<this.hashCount;i++){const o=this.S(n,s,i);this.D(o)}}D(e){const t=Math.floor(e/8),n=e%8;this.bitmap[t]|=1<<n}}class bs extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
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
 */class Si{constructor(e,t,n,s,i,o){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=n,this.documentUpdates=s,this.augmentedDocumentUpdates=i,this.resolvedLimboDocuments=o}static createSynthesizedRemoteEventForCurrentChange(e,t,n){const s=new Map;return s.set(e,Oi.createSynthesizedTargetChangeForCurrentChange(e,t,n)),new Si(te.min(),s,new Re(Be),pt(),pt(),ie())}}class Oi{constructor(e,t,n,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=n,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,n){return new Oi(n,t,ie(),ie(),ie())}}/**
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
 */class go{constructor(e,t,n,s){this.C=e,this.removedTargetIds=t,this.key=n,this.F=s}}class ld{constructor(e,t){this.targetId=e,this.O=t}}class hd{constructor(e,t,n=Me.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=n,this.cause=s}}class Nh{constructor(e){this.targetId=e,this.M=0,this.N=bh(),this.L=Me.EMPTY_BYTE_STRING,this.B=!1,this.U=!0}get current(){return this.B}get resumeToken(){return this.L}get k(){return this.M!==0}get q(){return this.U}$(e){e.approximateByteSize()>0&&(this.U=!0,this.L=e)}K(){let e=ie(),t=ie(),n=ie();return this.N.forEach(((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:n=n.add(s);break;default:Y(38017,{changeType:i})}})),new Oi(this.L,this.B,e,t,n)}W(){this.U=!1,this.N=bh()}G(e,t){this.U=!0,this.N=this.N.insert(e,t)}j(e){this.U=!0,this.N=this.N.remove(e)}H(){this.M+=1}J(){this.M-=1,Q(this.M>=0,3241,{M:this.M,targetId:this.targetId})}Y(){this.U=!0,this.B=!0}}const Rs="WatchChangeAggregator";class uw{constructor(e){this.Z=e,this.X=new Map,this.ee=pt(),this.te=oo(),this.ne=pt(),this.re=oo(),this.ie=new Re(Be)}se(e){for(const t of e.C)e.F&&e.F.isFoundDocument()?this._e(t,e.F):this.oe(t,e.key,e.F);for(const t of e.removedTargetIds)this.oe(t,e.key,e.F)}ae(e){this.forEachTarget(e,(t=>{const n=this.X.get(t);if(n)switch(e.state){case 0:this.ue(t)&&n.$(e.resumeToken);break;case 1:n.J(),n.k||n.W(),n.$(e.resumeToken);break;case 2:n.J(),n.k||this.removeTarget(t);break;case 3:this.ue(t)&&(n.Y(),n.$(e.resumeToken));break;case 4:this.ue(t)&&(this.ce(t),n.$(e.resumeToken));break;default:Y(56790,{state:e.state})}else K(Rs,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)}))}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.X.forEach(((n,s)=>{this.ue(s)&&t(s)}))}le(e){var t;return Br(e)?e.getPipelineSourceType()==="documents"&&((t=e.getPipelineDocuments())==null?void 0:t.length)===1:sd(e)}Ee(e){const t=e.targetId,n=e.O.count,s=this.he(t);if(s){const i=s.target;if(this.le(i))if(n===0){const o=new X(Br(i)?de.fromString(i.getPipelineDocuments()[0]):i.path);this.oe(t,o,Qe.newNoDocument(o,te.min()))}else Q(n===1,20013,"Single document existence filter with count: "+n);else{const o=this.Te(t);if(o!==n){const B=this.Pe(e),c=B?this.Re(B,e,o):1;if(c!==0){this.ce(t);const u=c===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.ie=this.ie.insert(t,u)}}}}}Pe(e){const t=e.O.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:n="",padding:s=0},hashCount:i=0}=t;let o,B;try{o=jn(n).toUint8Array()}catch(c){if(c instanceof FC)return Gt("Decoding the base64 bloom filter in existence filter failed ("+c.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw c}try{B=new gc(o,s,i)}catch(c){return Gt(c instanceof bs?"BloomFilter error: ":"Applying bloom filter failed: ",c),null}return B.m===0?null:B}Re(e,t,n){return t.O.count===n-this.Ve(e,t.targetId)?0:2}Ve(e,t){const n=this.Z.getRemoteKeysForTarget(t);let s=0;return n.forEach((i=>{const o=this.Z.Ae(),B=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;e.mightContain(B)||(this.oe(t,i,null),s++)})),s}de(e){const t=new Map;this.X.forEach(((i,o)=>{const B=this.he(o);if(B){if(i.current&&this.le(B.target)){const c=Br(B.target)?de.fromString(B.target.getPipelineDocuments()[0]):B.target.path,u=new X(c);this.fe(u).has(o)||this.me(o,u)||this.oe(o,u,Qe.newNoDocument(u,e))}i.q&&(t.set(o,i.K()),i.W())}}));let n=ie();this.re.forEach(((i,o)=>{let B=!0;o.forEachWhile((c=>{const u=this.he(c);return!u||u.purpose==="TargetPurposeLimboResolution"||(B=!1,!1)})),B&&(n=n.add(i))})),this.ee.forEach(((i,o)=>o.setReadTime(e))),this.ne.forEach(((i,o)=>o.setReadTime(e)));const s=new Si(e,t,this.ie,this.ee,this.ne,n);return this.ee=pt(),this.te=oo(),this.ne=pt(),this.re=oo(),this.ie=new Re(Be),s}_e(e,t){const n=this.X.get(e);if(!n||!this.ue(e))return void K(Rs,`addDocumentToTarget received document for unknown inactive target (${e})`);const s=this.me(e,t.key)?2:0;n.G(t.key,s),Br(this.he(e).target)&&this.he(e).target.getPipelineFlavor()!=="exact"?this.ne=this.ne.insert(t.key,t):this.ee=this.ee.insert(t.key,t),this.te=this.te.insert(t.key,this.fe(t.key).add(e)),this.re=this.re.insert(t.key,this.pe(t.key).add(e))}oe(e,t,n){const s=this.X.get(e);s&&this.ue(e)?(this.me(e,t)?s.G(t,1):s.j(t),this.re=this.re.insert(t,this.pe(t).delete(e)),this.re=this.re.insert(t,this.pe(t).add(e)),n&&(Br(this.he(e).target)&&this.he(e).target.getPipelineFlavor()!=="exact"?this.ne=this.ne.insert(t,n):this.ee=this.ee.insert(t,n))):K(Rs,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.X.delete(e)}Te(e){const t=this.X.get(e);if(!t)return 0;const n=t.K();return this.Z.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}H(e){let t=this.X.get(e);t||(K(Rs,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new Nh(e),this.X.set(e,t)),t.H()}pe(e){let t=this.re.get(e);return t||(t=new xe(Be),this.re=this.re.insert(e,t)),t}fe(e){let t=this.te.get(e);return t||(t=new xe(Be),this.te=this.te.insert(e,t)),t}ue(e){const t=this.he(e)!==null;return t||K(Rs,"Detected inactive target",e),t}he(e){const t=this.X.get(e);return t===void 0||t.k?null:this.Z.ge(e)}ce(e){this.X.set(e,new Nh(e)),this.Z.getRemoteKeysForTarget(e).forEach((t=>{this.oe(e,t,null)}))}me(e,t){return this.Z.getRemoteKeysForTarget(e).has(t)}}function oo(){return new Re(X.comparator)}function bh(){return new Re(X.comparator)}const lw={asc:"ASCENDING",desc:"DESCENDING"},hw={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},fw={and:"AND",or:"OR"};class Cw{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function VB(r,e){return r.useProto3Json||Ri(e)?e:{value:e}}function Lo(r,e){return r.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function mc(r){const e=Jn(r);return new ye(e.seconds,e.nanos)}function fd(r,e){return r.useProto3Json?e.toBase64():e.toUint8Array()}function mo(r,e){return Lo(r,e.toTimestamp())}function Pt(r){return Q(!!r,49232),te.fromTimestamp(mc(r))}function Ec(r,e){return xB(r,e).canonicalString()}function xB(r,e){const t=(function(s){return new de(["projects",s.projectId,"databases",s.database])})(r).child("documents");return e===void 0?t:t.child(e)}function Cd(r){const e=de.fromString(r);return Q(_d(e),10190,{key:e.toString()}),e}function li(r,e){return Ec(r.databaseId,e.path)}function Ks(r,e){const t=Cd(e);if(t.get(1)!==r.databaseId.projectId)throw new J(F.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+r.databaseId.projectId);if(t.get(3)!==r.databaseId.database)throw new J(F.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+r.databaseId.database);return new X(pd(t))}function dd(r,e){return Ec(r.databaseId,e)}function dw(r){const e=Cd(r);return e.length===4?de.emptyPath():pd(e)}function MB(r){return new de(["projects",r.databaseId.projectId,"databases",r.databaseId.database]).canonicalString()}function pd(r){return Q(r.length>4&&r.get(4)==="documents",29091,{key:r.toString()}),r.popFirst(5)}function Lh(r,e,t){return{name:li(r,e),fields:t.value.mapValue.fields}}function pw(r,e){return"found"in e?(function(n,s){Q(!!s.found,43571),s.found.name,s.found.updateTime;const i=Ks(n,s.found.name),o=Pt(s.found.updateTime),B=s.found.createTime?Pt(s.found.createTime):te.min(),c=new rt({mapValue:{fields:s.found.fields}});return Qe.newFoundDocument(i,o,B,c)})(r,e):"missing"in e?(function(n,s){Q(!!s.missing,3894),Q(!!s.readTime,22933);const i=Ks(n,s.missing),o=Pt(s.readTime);return Qe.newNoDocument(i,o)})(r,e):Y(7234,{result:e})}function gw(r,e){let t;if("targetChange"in e){e.targetChange;const n=(function(u){return u==="NO_CHANGE"?0:u==="ADD"?1:u==="REMOVE"?2:u==="CURRENT"?3:u==="RESET"?4:Y(39313,{state:u})})(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=(function(u,h){return u.useProto3Json?(Q(h===void 0||typeof h=="string",58123),Me.fromBase64String(h||"")):(Q(h===void 0||h instanceof Buffer||h instanceof Uint8Array,16193),Me.fromUint8Array(h||new Uint8Array))})(r,e.targetChange.resumeToken),o=e.targetChange.cause,B=o&&(function(u){const h=u.code===void 0?F.UNKNOWN:ad(u.code);return new J(h,u.message||"")})(o);t=new hd(n,s,i,B||null)}else if("documentChange"in e){e.documentChange;const n=e.documentChange;n.document,n.document.name,n.document.updateTime;const s=Ks(r,n.document.name),i=Pt(n.document.updateTime),o=n.document.createTime?Pt(n.document.createTime):te.min(),B=new rt({mapValue:{fields:n.document.fields}}),c=Qe.newFoundDocument(s,i,o,B),u=n.targetIds||[],h=n.removedTargetIds||[];t=new go(u,h,c.key,c)}else if("documentDelete"in e){e.documentDelete;const n=e.documentDelete;n.document;const s=Ks(r,n.document),i=n.readTime?Pt(n.readTime):te.min(),o=Qe.newNoDocument(s,i),B=n.removedTargetIds||[];t=new go([],B,o.key,o)}else if("documentRemove"in e){e.documentRemove;const n=e.documentRemove;n.document;const s=Ks(r,n.document),i=n.removedTargetIds||[];t=new go([],i,s,null)}else{if(!("filter"in e))return Y(11601,{ye:e});{e.filter;const n=e.filter;n.targetId;const{count:s=0,unchangedNames:i}=n,o=new nw(s,i),B=n.targetId;t=new ld(B,o)}}return t}function gd(r,e){let t;if(e instanceof vi)t={update:Lh(r,e.key,e.value)};else if(e instanceof oa)t={delete:li(r,e.key)};else if(e instanceof er)t={update:Lh(r,e.key,e.data),updateMask:Rw(e.fieldMask)};else{if(!(e instanceof QC))return Y(16599,{we:e.type});t={verify:li(r,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map((n=>(function(i,o){const B=o.transform;if(B instanceof oi)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(B instanceof ai)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:B.elements}};if(B instanceof Bi)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:B.elements}};if(B instanceof ci)return{fieldPath:o.field.canonicalString(),increment:B.l};if(B instanceof Po)return{fieldPath:o.field.canonicalString(),minimum:B.l};if(B instanceof So)return{fieldPath:o.field.canonicalString(),maximum:B.l};throw Y(20930,{transform:o.transform})})(0,n)))),e.precondition.isNone||(t.currentDocument=(function(s,i){return i.updateTime!==void 0?{updateTime:mo(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:Y(27497)})(r,e.precondition)),t}function mw(r,e){return r&&r.length>0?(Q(e!==void 0,14353),r.map((t=>(function(s,i){let o=s.updateTime?Pt(s.updateTime):Pt(i);return o.isEqual(te.min())&&(o=Pt(i)),new FI(o,s.transformResults||[])})(t,e)))):[]}function Ew(r,e){return{documents:[dd(r,e.path)]}}function _w(r,e){const t={structuredQuery:{}},n=e.path;let s;e.collectionGroup!==null?(s=n,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=n.popLast(),t.structuredQuery.from=[{collectionId:n.lastSegment()}]),t.parent=dd(r,s);const i=(function(u){if(u.length!==0)return Ed(Ut.create(u,"and"))})(e.filters);i&&(t.structuredQuery.where=i);const o=(function(u){if(u.length!==0)return u.map((h=>(function(p){return{field:br(p.field),direction:yw(p.dir)}})(h)))})(e.orderBy);o&&(t.structuredQuery.orderBy=o);const B=VB(r,e.limit);return B!==null&&(t.structuredQuery.limit=B),e.startAt&&(t.structuredQuery.startAt=(function(u){return{before:u.inclusive,values:u.position}})(e.startAt)),e.endAt&&(t.structuredQuery.endAt=(function(u){return{before:!u.inclusive,values:u.position}})(e.endAt)),{be:t,parent:s}}function Dw(r){let e=dw(r.parent);const t=r.structuredQuery,n=t.from?t.from.length:0;let s=null;if(n>0){Q(n===1,65062);const h=t.from[0];h.allDescendants?s=h.collectionId:e=e.child(h.collectionId)}let i=[];t.where&&(i=(function(C){const p=md(C);return p instanceof Ut&&XC(p)?p.getFilters():[p]})(t.where));let o=[];t.orderBy&&(o=(function(C){return C.map((p=>(function(R){return new bo(Lr(R.field),(function(M){switch(M){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(R.direction))})(p)))})(t.orderBy));let B=null;t.limit&&(B=(function(C){let p;return p=typeof C=="object"?C.value:C,Ri(p)?null:p})(t.limit));let c=null;t.startAt&&(c=(function(C){const p=!!C.before,I=C.values||[];return new No(I,p)})(t.startAt));let u=null;return t.endAt&&(u=(function(C){const p=!C.before,I=C.values||[];return new No(I,p)})(t.endAt)),YI(e,s,o,i,B,"F",c,u)}function Iw(r,e){const t=(function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return Y(28987,{purpose:s})}})(e.purpose);return t==null?null:{"goog-listen-tags":t}}function ww(r,e){return{structuredPipeline:{pipeline:{stages:e.stages.map((t=>t._toProto(r)))}}}}function md(r){return r.unaryFilter!==void 0?(function(t){switch(t.unaryFilter.op){case"IS_NAN":const n=Lr(t.unaryFilter.field);return ke.create(n,"==",{doubleValue:NaN});case"IS_NULL":const s=Lr(t.unaryFilter.field);return ke.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Lr(t.unaryFilter.field);return ke.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=Lr(t.unaryFilter.field);return ke.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return Y(61313);default:return Y(60726)}})(r):r.fieldFilter!==void 0?(function(t){return ke.create(Lr(t.fieldFilter.field),(function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return Y(58110);default:return Y(50506)}})(t.fieldFilter.op),t.fieldFilter.value)})(r):r.compositeFilter!==void 0?(function(t){return Ut.create(t.compositeFilter.filters.map((n=>md(n))),(function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return Y(1026)}})(t.compositeFilter.op))})(r):Y(30097,{filter:r})}function yw(r){return lw[r]}function Tw(r){return hw[r]}function Aw(r){return fw[r]}function br(r){return{fieldPath:r.canonicalString()}}function Lr(r){return vt.fromServerFormat(r.fieldPath)}function Ed(r){return r instanceof ke?(function(t){if(t.op==="=="){if(Dt(t.value))return{unaryFilter:{field:br(t.field),op:"IS_NAN"}};if(Rt(t.value))return{unaryFilter:{field:br(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(Dt(t.value))return{unaryFilter:{field:br(t.field),op:"IS_NOT_NAN"}};if(Rt(t.value))return{unaryFilter:{field:br(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:br(t.field),op:Tw(t.op),value:t.value}}})(r):r instanceof Ut?(function(t){const n=t.getFilters().map((s=>Ed(s)));return n.length===1?n[0]:{compositeFilter:{op:Aw(t.op),filters:n}}})(r):Y(54877,{filter:r})}function Rw(r){const e=[];return r.fields.forEach((t=>e.push(t.canonicalString()))),{fieldPaths:e}}function _d(r){return r.length>=4&&r.get(0)==="projects"&&r.get(2)==="databases"}function Dd(r){return!!r&&typeof r._toProto=="function"&&r._protoValueType==="ProtoValue"}function hi(r,e){const t={fields:{}};return e.forEach(((n,s)=>{if(typeof s!="string")throw new Error(`Cannot encode map with non-string key: ${s}`);t.fields[s]=n._toProto(r)})),{mapValue:t}}function Id(r){return{stringValue:r}}/**
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
 */function ca(r){return new Cw(r,!0)}/**
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
 */class Tt{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Tt(Me.fromBase64String(e))}catch(t){throw new J(F.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Tt(Me.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:Tt._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(Ti(e,Tt._jsonSchema))return Tt.fromBase64String(e.bytes)}}Tt._jsonSchemaVersion="firestore/bytes/1.0",Tt._jsonSchema={type:Ve("string",Tt._jsonSchemaVersion),bytes:Ve("string")};/**
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
 */class ua{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new J(F.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new vt(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}function vw(){return new ua(qt)}/**
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
 */class la{constructor(e){this._methodName=e}}/**
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
 */class Qt{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new J(F.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new J(F.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return Be(this._lat,e._lat)||Be(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Qt._jsonSchemaVersion}}static fromJSON(e){if(Ti(e,Qt._jsonSchema))return new Qt(e.latitude,e.longitude)}}Qt._jsonSchemaVersion="firestore/geoPoint/1.0",Qt._jsonSchema={type:Ve("string",Qt._jsonSchemaVersion),latitude:Ve("number"),longitude:Ve("number")};/**
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
 */class nt{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}nt.UNAUTHENTICATED=new nt(null),nt.GOOGLE_CREDENTIALS=new nt("google-credentials-uid"),nt.FIRST_PARTY=new nt("first-party-uid"),nt.MOCK_USER=new nt("mock-user");/**
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
 */class $t{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
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
 */class wd{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class Pw{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(nt.UNAUTHENTICATED)))}shutdown(){}}class Sw{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class Ow{constructor(e){this.ve=e,this.currentUser=nt.UNAUTHENTICATED,this.De=0,this.forceRefresh=!1,this.auth=null}start(e,t){Q(this.xe===void 0,42304);let n=this.De;const s=c=>this.De!==n?(n=this.De,t(c)):Promise.resolve();let i=new $t;this.xe=()=>{this.De++,this.currentUser=this.Ce(),i.resolve(),i=new $t,e.enqueueRetryable((()=>s(this.currentUser)))};const o=()=>{const c=i;e.enqueueRetryable((async()=>{await c.promise,await s(this.currentUser)}))},B=c=>{K("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=c,this.xe&&(this.auth.addAuthTokenListener(this.xe),o())};this.ve.onInit((c=>B(c))),setTimeout((()=>{if(!this.auth){const c=this.ve.getImmediate({optional:!0});c?B(c):(K("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new $t)}}),0),o()}getToken(){const e=this.De,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((n=>this.De!==e?(K("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):n?(Q(typeof n.accessToken=="string",31837,{Fe:n}),new wd(n.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.xe&&this.auth.removeAuthTokenListener(this.xe),this.xe=void 0}Ce(){const e=this.auth&&this.auth.getUid();return Q(e===null||typeof e=="string",2055,{Oe:e}),new nt(e)}}class Nw{constructor(e,t,n){this.Me=e,this.Ne=t,this.Le=n,this.type="FirstParty",this.user=nt.FIRST_PARTY,this.Be=new Map}Ue(){return this.Le?this.Le():null}get headers(){this.Be.set("X-Goog-AuthUser",this.Me);const e=this.Ue();return e&&this.Be.set("Authorization",e),this.Ne&&this.Be.set("X-Goog-Iam-Authorization-Token",this.Ne),this.Be}}class bw{constructor(e,t,n){this.Me=e,this.Ne=t,this.Le=n}getToken(){return Promise.resolve(new Nw(this.Me,this.Ne,this.Le))}start(e,t){e.enqueueRetryable((()=>t(nt.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class Fh{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Lw{constructor(e,t){this.ke=t,this.forceRefresh=!1,this.appCheck=null,this.qe=null,this.$e=null,Je(e)&&e.settings.appCheckToken&&(this.$e=e.settings.appCheckToken)}start(e,t){Q(this.xe===void 0,3512);const n=i=>{i.error!=null&&K("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.qe;return this.qe=i.token,K("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(i.token):Promise.resolve()};this.xe=i=>{e.enqueueRetryable((()=>n(i)))};const s=i=>{K("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.xe&&this.appCheck.addTokenListener(this.xe)};this.ke.onInit((i=>s(i))),setTimeout((()=>{if(!this.appCheck){const i=this.ke.getImmediate({optional:!0});i?s(i):K("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.$e)return Promise.resolve(new Fh(this.$e));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(Q(typeof t.token=="string",44558,{tokenResult:t}),this.qe=t.token,new Fh(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.xe&&this.appCheck.removeTokenListener(this.xe),this.xe=void 0}}function yd(r){const e={};return r.timeoutSeconds!==void 0&&(e.timeoutSeconds=r.timeoutSeconds),e}/**
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
 */class Fw{Ke(e){}shutdown(){}}/**
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
 */const kh="ConnectivityMonitor";class Vh{constructor(){this.Qe=()=>this.We(),this.Ge=()=>this.ze(),this.je=[],this.He()}Ke(e){this.je.push(e)}shutdown(){window.removeEventListener("online",this.Qe),window.removeEventListener("offline",this.Ge)}He(){window.addEventListener("online",this.Qe),window.addEventListener("offline",this.Ge)}We(){K(kh,"Network connectivity changed: AVAILABLE");for(const e of this.je)e(0)}ze(){K(kh,"Network connectivity changed: UNAVAILABLE");for(const e of this.je)e(1)}static Je(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let ao=null;function GB(){return ao===null?ao=(function(){return 268435456+Math.round(2147483648*Math.random())})():ao++,"0x"+ao.toString(16)}/**
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
 */const hB="RestConnection",kw={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class Vw{get Ye(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",n=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Ze=t+"://"+e.host,this.Xe=`projects/${n}/databases/${s}`,this.et=this.databaseId.database===ti?`project_id=${n}`:`project_id=${n}&database_id=${s}`}tt(e,t,n,s,i){const o=GB(),B=this.nt(e,t.toUriEncodedString());K(hB,`Sending RPC '${e}' ${o}:`,B,n);const c={"google-cloud-resource-prefix":this.Xe,"x-goog-request-params":this.et};this.rt(c,s,i);const{host:u}=new URL(B),h=Yr(u);return this.it(e,B,c,n,h).then((C=>(K(hB,`Received RPC '${e}' ${o}: `,C),C)),(C=>{throw Gt(hB,`RPC '${e}' ${o} failed with error: `,C,"url: ",B,"request:",n),C}))}st(e,t,n,s,i,o){return this.tt(e,t,n,s,i)}rt(e,t,n){if(e["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+ts})(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach(((s,i)=>e[i]=s)),n&&n.headers.forEach(((s,i)=>e[i]=s)),this.databaseInfo._customHeaders)for(const s of Object.keys(this.databaseInfo._customHeaders))e[s]=this.databaseInfo._customHeaders[s]}nt(e,t){const n=kw[e];let s=`${this.Ze}/v1/${t}:${n}`;return this.databaseInfo.apiKey&&(s=`${s}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),s}terminate(){}}/**
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
 */class xw{constructor(e){this._t=e._t,this.ot=e.ot}ut(e){this.ct=e}lt(e){this.Et=e}ht(e){this.Tt=e}onMessage(e){this.Pt=e}close(){this.ot()}send(e){this._t(e)}Rt(){this.ct()}It(){this.Et()}At(e){this.Tt(e)}Vt(e){this.Pt(e)}}/**
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
 */const tt="WebChannelConnection",vs=(r,e,t)=>{r.listen(e,(n=>{try{t(n)}catch(s){setTimeout((()=>{throw s}),0)}}))};class Ur extends Vw{constructor(e){super(e),this.dt=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static ft(){if(!Ur.gt){const e=yC();vs(e,wC.STAT_EVENT,(t=>{t.stat===RB.PROXY?K(tt,"STAT_EVENT: detected buffering proxy"):t.stat===RB.NOPROXY&&K(tt,"STAT_EVENT: detected no buffering proxy")})),Ur.gt=!0}}it(e,t,n,s,i){const o=GB();return new Promise(((B,c)=>{const u=new DC;u.setWithCredentials(!0),u.listenOnce(IC.COMPLETE,(()=>{try{switch(u.getLastErrorCode()){case fo.NO_ERROR:const C=u.getResponseJson();K(tt,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(C)),B(C);break;case fo.TIMEOUT:K(tt,`RPC '${e}' ${o} timed out`),c(new J(F.DEADLINE_EXCEEDED,"Request time out"));break;case fo.HTTP_ERROR:const p=u.getStatus();if(K(tt,`RPC '${e}' ${o} failed with status:`,p,"response text:",u.getResponseText()),p>0){let I=u.getResponseJson();Array.isArray(I)&&(I=I[0]);const R=I==null?void 0:I.error;if(R&&R.status&&R.message){const k=(function(z){const re=z.toLowerCase().replace(/_/g,"-");return Object.values(F).indexOf(re)>=0?re:F.UNKNOWN})(R.status);c(new J(k,R.message))}else c(new J(F.UNKNOWN,"Server responded with status "+u.getStatus()))}else c(new J(F.UNAVAILABLE,"Connection failed."));break;default:Y(9055,{yt:e,streamId:o,wt:u.getLastErrorCode(),bt:u.getLastError()})}}finally{K(tt,`RPC '${e}' ${o} completed.`)}}));const h=JSON.stringify(s);K(tt,`RPC '${e}' ${o} sending request:`,s),u.send(t,"POST",h,n,15)}))}St(e,t,n){const s=GB(),i=[this.Ze,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=this.createWebChannelTransport(),B={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},c=this.longPollingOptions.timeoutSeconds;c!==void 0&&(B.longPollingTimeout=Math.round(1e3*c)),this.useFetchStreams&&(B.useFetchStreams=!0),this.rt(B.initMessageHeaders,t,n),B.encodeInitMessageHeaders=!0;const u=i.join("");K(tt,`Creating RPC '${e}' stream ${s}: ${u}`,B);const h=o.createWebChannel(u,B);this.vt(h);let C=!1,p=!1;const I=new xw({_t:R=>{p?K(tt,`Not sending because RPC '${e}' stream ${s} is closed:`,R):(C||(K(tt,`Opening RPC '${e}' stream ${s} transport.`),h.open(),C=!0),K(tt,`RPC '${e}' stream ${s} sending:`,R),h.send(R))},ot:()=>h.close()});return vs(h,Ns.EventType.OPEN,(()=>{p||(K(tt,`RPC '${e}' stream ${s} transport opened.`),I.Rt())})),vs(h,Ns.EventType.CLOSE,(()=>{p||(p=!0,K(tt,`RPC '${e}' stream ${s} transport closed`),I.At(),this.Dt(h))})),vs(h,Ns.EventType.ERROR,(R=>{p||(p=!0,Gt(tt,`RPC '${e}' stream ${s} transport errored. Name:`,R.name,"Message:",R.message),I.At(new J(F.UNAVAILABLE,"The operation could not be completed")))})),vs(h,Ns.EventType.MESSAGE,(R=>{var k;if(!p){const M=R.data[0];Q(!!M,16349);const z=M,re=(z==null?void 0:z.error)||((k=z[0])==null?void 0:k.error);if(re){K(tt,`RPC '${e}' stream ${s} received error:`,re);const pe=re.status;let Se=(function(v){const E=be[v];if(E!==void 0)return ad(E)})(pe),Oe=re.message;pe==="NOT_FOUND"&&Oe.includes("database")&&Oe.includes("does not exist")&&Oe.includes(this.databaseId.database)&&Gt(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),Se===void 0&&(Se=F.INTERNAL,Oe="Unknown error status: "+pe+" with message "+re.message),p=!0,I.At(new J(Se,Oe)),h.close()}else K(tt,`RPC '${e}' stream ${s} received:`,M),I.Vt(M)}})),Ur.ft(),setTimeout((()=>{I.It()}),0),I}terminate(){this.dt.forEach((e=>e.close())),this.dt=[]}vt(e){this.dt.push(e)}Dt(e){this.dt=this.dt.filter((t=>t===e))}rt(e,t,n){super.rt(e,t,n),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return TC()}}/**
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
 */function Mw(r){return new Ur(r)}Ur.gt=!1;class _c{constructor(e,t,n=1e3,s=1.5,i=6e4){this.xt=e,this.timerId=t,this.Ct=n,this.Ft=s,this.Ot=i,this.Mt=0,this.Nt=null,this.Lt=Date.now(),this.reset()}reset(){this.Mt=0}Bt(){this.Mt=this.Ot}Ut(e){this.cancel();const t=Math.floor(this.Mt+this.kt()),n=Math.max(0,Date.now()-this.Lt),s=Math.max(0,t-n);s>0&&K("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Mt} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`),this.Nt=this.xt.enqueueAfterDelay(this.timerId,s,(()=>(this.Lt=Date.now(),e()))),this.Mt*=this.Ft,this.Mt<this.Ct&&(this.Mt=this.Ct),this.Mt>this.Ot&&(this.Mt=this.Ot)}qt(){this.Nt!==null&&(this.Nt.skipDelay(),this.Nt=null)}cancel(){this.Nt!==null&&(this.Nt.cancel(),this.Nt=null)}kt(){return(Math.random()-.5)*this.Mt}}/**
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
 */const xh="PersistentStream";class Td{constructor(e,t,n,s,i,o,B,c){this.xt=e,this.$t=n,this.Kt=s,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=B,this.listener=c,this.state=0,this.Qt=0,this.Wt=null,this.Gt=null,this.stream=null,this.zt=0,this.jt=new _c(e,t)}Ht(){return this.state===1||this.state===5||this.Jt()}Jt(){return this.state===2||this.state===3}start(){this.zt=0,this.state!==4?this.auth():this.Yt()}async stop(){this.Ht()&&await this.close(0)}Zt(){this.state=0,this.jt.reset()}Xt(){this.Jt()&&this.Wt===null&&(this.Wt=this.xt.enqueueAfterDelay(this.$t,6e4,(()=>this.en())))}tn(e){this.nn(),this.stream.send(e)}async en(){if(this.Jt())return this.close(0)}nn(){this.Wt&&(this.Wt.cancel(),this.Wt=null)}rn(){this.Gt&&(this.Gt.cancel(),this.Gt=null)}async close(e,t){this.nn(),this.rn(),this.jt.cancel(),this.Qt++,e!==4?this.jt.reset():t&&t.code===F.RESOURCE_EXHAUSTED?(dn(t.toString()),dn("Using maximum backoff delay to prevent overloading the backend."),this.jt.Bt()):t&&t.code===F.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.sn(),this.stream.close(),this.stream=null),this.state=e,await this.listener.ht(t)}sn(){}auth(){this.state=1;const e=this._n(this.Qt),t=this.Qt;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([n,s])=>{this.Qt===t&&this.an(n,s)}),(n=>{e((()=>{const s=new J(F.UNKNOWN,"Fetching auth token failed: "+n.message);return this.un(s)}))}))}an(e,t){const n=this._n(this.Qt);this.stream=this.cn(e,t),this.stream.ut((()=>{n((()=>this.listener.ut()))})),this.stream.lt((()=>{n((()=>(this.state=2,this.Gt=this.xt.enqueueAfterDelay(this.Kt,1e4,(()=>(this.Jt()&&(this.state=3),Promise.resolve()))),this.listener.lt())))})),this.stream.ht((s=>{n((()=>this.un(s)))})),this.stream.onMessage((s=>{n((()=>++this.zt==1?this.En(s):this.onNext(s)))}))}Yt(){this.state=5,this.jt.Ut((async()=>{this.state=0,this.start()}))}un(e){return K(xh,`close with error: ${e}`),this.stream=null,this.close(4,e)}_n(e){return t=>{this.xt.enqueueAndForget((()=>this.Qt===e?t():(K(xh,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class Gw extends Td{constructor(e,t,n,s,i,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,n,s,o),this.serializer=i}cn(e,t){return this.connection.St("Listen",e,t)}En(e){return this.onNext(e)}onNext(e){this.jt.reset();const t=gw(this.serializer,e),n=(function(i){if(!("targetChange"in i))return te.min();const o=i.targetChange;return o.targetIds&&o.targetIds.length?te.min():o.readTime?Pt(o.readTime):te.min()})(e);return this.listener.hn(t,n)}Tn(e){const t={};t.database=MB(this.serializer),t.addTarget=(function(i,o){let B;const c=o.target;if(B=Br(c)?{pipelineQuery:ww(i,c)}:sd(c)?{documents:Ew(i,c)}:{query:_w(i,c).be},B.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){B.resumeToken=fd(i,o.resumeToken);const u=VB(i,o.expectedCount);u!==null&&(B.expectedCount=u)}else if(o.snapshotVersion.compareTo(te.min())>0){B.readTime=Lo(i,o.snapshotVersion.toTimestamp());const u=VB(i,o.expectedCount);u!==null&&(B.expectedCount=u)}return B})(this.serializer,e);const n=Iw(this.serializer,e);n&&(t.labels=n),this.tn(t)}Pn(e){const t={};t.database=MB(this.serializer),t.removeTarget=e,this.tn(t)}}class Uw extends Td{constructor(e,t,n,s,i,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,n,s,o),this.serializer=i}get Rn(){return this.zt>0}start(){this.lastStreamToken=void 0,super.start()}sn(){this.Rn&&this.In([])}cn(e,t){return this.connection.St("Write",e,t)}En(e){return Q(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,Q(!e.writeResults||e.writeResults.length===0,55816),this.listener.An()}onNext(e){Q(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.jt.reset();const t=mw(e.writeResults,e.commitTime),n=Pt(e.commitTime);return this.listener.Vn(n,t)}dn(){const e={};e.database=MB(this.serializer),this.tn(e)}In(e){const t={streamToken:this.lastStreamToken,writes:e.map((n=>gd(this.serializer,n)))};this.tn(t)}}/**
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
 */class Hw{}class Jw extends Hw{constructor(e,t,n,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=n,this.serializer=s,this.fn=!1}mn(){if(this.fn)throw new J(F.FAILED_PRECONDITION,"The client has already been terminated.")}tt(e,t,n,s){return this.mn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([i,o])=>this.connection.tt(e,xB(t,n),s,i,o))).catch((i=>{throw i.name==="FirebaseError"?(i.code===F.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new J(F.UNKNOWN,i.toString())}))}st(e,t,n,s,i){return this.mn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([o,B])=>this.connection.st(e,xB(t,n),s,o,B,i))).catch((o=>{throw o.name==="FirebaseError"?(o.code===F.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new J(F.UNKNOWN,o.toString())}))}terminate(){this.fn=!0,this.connection.terminate()}}function jw(r,e,t,n){return new Jw(r,e,t,n)}/**
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
 */const qw="ComponentProvider",Mh=new Map;function Kw(r,e,t,n,s){return new TI(r,e,t,s.host,s.ssl,s.experimentalForceLongPolling,s.experimentalAutoDetectLongPolling,yd(s.experimentalLongPollingOptions),s.useFetchStreams,s.isUsingEmulator,n,s._customHeaders,s.grpcFlowControlWindow)}/**
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
 */const Gh={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},Ad=41943040;class dt{static withCacheSize(e){return new dt(e,dt.DEFAULT_COLLECTION_PERCENTILE,dt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,n){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=n}}dt.DEFAULT_COLLECTION_PERCENTILE=10,dt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,dt.DEFAULT=new dt(Ad,dt.DEFAULT_COLLECTION_PERCENTILE,dt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),dt.DISABLED=new dt(-1,0,0);/**
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
 */class ha{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=n=>this.pn(n),this.gn=n=>t.writeSequenceNumber(n))}pn(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.gn&&this.gn(e),e}}ha.yn=-1;/**
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
 */const Ww="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class zw{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((e=>e()))}}/**
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
 */async function ns(r){if(r.code!==F.FAILED_PRECONDITION||r.message!==Ww)throw r;K("LocalStore","Unexpectedly lost primary lease")}/**
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
 */class V{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e((t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)}),(t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)}))}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&Y(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new V(((n,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(n,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(n,s)}}))}toPromise(){return new Promise(((e,t)=>{this.next(e,t)}))}wrapUserFunction(e){try{const t=e();return t instanceof V?t:V.resolve(t)}catch(t){return V.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction((()=>e(t))):V.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction((()=>e(t))):V.reject(t)}static resolve(e){return new V(((t,n)=>{t(e)}))}static reject(e){return new V(((t,n)=>{n(e)}))}static waitFor(e){return new V(((t,n)=>{let s=0,i=0,o=!1;e.forEach((B=>{++s,B.next((()=>{++i,o&&i===s&&t()}),(c=>n(c)))})),o=!0,i===s&&t()}))}static or(e){let t=V.resolve(!1);for(const n of e)t=t.next((s=>s?V.resolve(s):n()));return t}static forEach(e,t){const n=[];return e.forEach(((s,i)=>{n.push(t.call(this,s,i))})),this.waitFor(n)}static mapArray(e,t){return new V(((n,s)=>{const i=e.length,o=new Array(i);let B=0;for(let c=0;c<i;c++){const u=c;t(e[u]).next((h=>{o[u]=h,++B,B===i&&n(o)}),(h=>s(h)))}}))}static doWhile(e,t){return new V(((n,s)=>{const i=()=>{e()===!0?t().next((()=>{i()}),s):n()};i()}))}}function Qw(r){const e=r.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function rs(r){return r.name==="IndexedDbTransactionError"}/**
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
 */const Uh="LruGarbageCollector",Rd=1048576;function Hh([r,e],[t,n]){const s=Be(r,t);return s===0?Be(e,n):s}class $w{constructor(e){this.Jn=e,this.buffer=new xe(Hh),this.Yn=0}Zn(){return++this.Yn}Xn(e){const t=[e,this.Zn()];if(this.buffer.size<this.Jn)this.buffer=this.buffer.add(t);else{const n=this.buffer.last();Hh(t,n)<0&&(this.buffer=this.buffer.delete(n).add(t))}}get maxValue(){return this.buffer.last()[0]}}class Yw{constructor(e,t,n){this.garbageCollector=e,this.asyncQueue=t,this.localStore=n,this.er=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.tr(6e4)}stop(){this.er&&(this.er.cancel(),this.er=null)}get started(){return this.er!==null}tr(e){K(Uh,`Garbage collection scheduled in ${e}ms`),this.er=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,(async()=>{this.er=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){rs(t)?K(Uh,"Ignoring IndexedDB error during garbage collection: ",t):await ns(t)}await this.tr(3e5)}))}}class Xw{constructor(e,t){this.nr=e,this.params=t}calculateTargetCount(e,t){return this.nr.rr(e).next((n=>Math.floor(t/100*n)))}nthSequenceNumber(e,t){if(t===0)return V.resolve(ha.yn);const n=new $w(t);return this.nr.forEachTarget(e,(s=>n.Xn(s.sequenceNumber))).next((()=>this.nr.ir(e,(s=>n.Xn(s))))).next((()=>n.maxValue))}removeTargets(e,t,n){return this.nr.removeTargets(e,t,n)}removeOrphanedDocuments(e,t){return this.nr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(K("LruGarbageCollector","Garbage collection skipped; disabled"),V.resolve(Gh)):this.getCacheSize(e).next((n=>n<this.params.cacheSizeCollectionThreshold?(K("LruGarbageCollector",`Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Gh):this.sr(e,t)))}getCacheSize(e){return this.nr.getCacheSize(e)}sr(e,t){let n,s,i,o,B,c,u;const h=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next((C=>(C>this.params.maximumSequenceNumbersToCollect?(K("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${C}`),s=this.params.maximumSequenceNumbersToCollect):s=C,o=Date.now(),this.nthSequenceNumber(e,s)))).next((C=>(n=C,B=Date.now(),this.removeTargets(e,n,t)))).next((C=>(i=C,c=Date.now(),this.removeOrphanedDocuments(e,n)))).next((C=>(u=Date.now(),Sr()<=ce.DEBUG&&K("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-h}ms
	Determined least recently used ${s} in `+(B-o)+`ms
	Removed ${i} targets in `+(c-B)+`ms
	Removed ${C} documents in `+(u-c)+`ms
Total Duration: ${u-h}ms`),V.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:C}))))}}function Zw(r,e){return new Xw(r,e)}/**
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
 */const vd="firestore.googleapis.com",Jh=!0;class jh{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new J(F.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=vd,this.ssl=Jh}else this.host=e.host,this.ssl=e.ssl??Jh;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e._customHeaders&&(this._customHeaders={...e._customHeaders}),e.cacheSizeBytes===void 0)this.cacheSizeBytes=Ad;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<Rd)throw new J(F.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}if(wI("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=yd(e.experimentalLongPollingOptions??{}),(function(n){if(n.timeoutSeconds!==void 0){if(isNaN(n.timeoutSeconds))throw new J(F.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (must not be NaN)`);if(n.timeoutSeconds<5)throw new J(F.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (minimum allowed value is 5)`);if(n.timeoutSeconds>30)throw new J(F.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams,e.grpcFlowControlWindow!==void 0){if(typeof e.grpcFlowControlWindow!="number"||e.grpcFlowControlWindow<=0||e.grpcFlowControlWindow>2147483647||!Number.isInteger(e.grpcFlowControlWindow))throw new J(F.INVALID_ARGUMENT,"grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");this.grpcFlowControlWindow=e.grpcFlowControlWindow}}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(n,s){return n.timeoutSeconds===s.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams&&this.grpcFlowControlWindow===e.grpcFlowControlWindow&&(function(n,s){if(n===s)return!0;if(!n||!s)return!1;const i=Object.keys(n),o=Object.keys(s);if(i.length!==o.length)return!1;for(const B of i)if(n[B]!==s[B])return!1;return!0})(this._customHeaders,e._customHeaders)}}let fa=class{constructor(e,t,n,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=n,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new jh({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new J(F.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new J(F.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new jh(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(n){if(!n)return new Pw;switch(n.type){case"firstParty":return new bw(n.sessionIndex||"0",n.iamToken||null,n.authTokenFactory||null);case"provider":return n.client;default:throw new J(F.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const n=Mh.get(t);n&&(K(qw,"Removing Datastore"),Mh.delete(t),n.terminate())})(this),Promise.resolve()}};function ey(r,e,t,n={}){var u;r=ht(r,fa);const s=Yr(e),i=r._getSettings(),o={...i,emulatorOptions:r._getEmulatorOptions()},B=`${e}:${t}`;s&&zB(`https://${B}`),i.host!==vd&&i.host!==B&&Gt("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const c={...i,host:B,ssl:s,emulatorOptions:n};if(!Un(c,o)&&(r._setSettings(c),n.mockUserToken)){let h,C;if(typeof n.mockUserToken=="string")h=n.mockUserToken,C=nt.MOCK_USER;else{h=Cg(n.mockUserToken,(u=r._app)==null?void 0:u.options.projectId);const p=n.mockUserToken.sub||n.mockUserToken.user_id;if(!p)throw new J(F.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");C=new nt(p)}r._authCredentials=new Sw(new wd(h,C))}}/**
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
 */class Dr{constructor(e,t,n){this.converter=t,this._query=n,this.type="query",this.firestore=e}withConverter(e){return new Dr(this.firestore,e,this._query)}}class Ae{constructor(e,t,n){this.converter=t,this._key=n,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Vn(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Ae(this.firestore,e,this._key)}toJSON(){return{type:Ae._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,n){if(Ti(t,Ae._jsonSchema))return new Ae(e,n||null,new X(de.fromString(t.referencePath)))}}Ae._jsonSchemaVersion="firestore/documentReference/1.0",Ae._jsonSchema={type:Ve("string",Ae._jsonSchemaVersion),referencePath:Ve("string")};class Vn extends Dr{constructor(e,t,n){super(e,t,aa(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Ae(this.firestore,null,new X(e))}withConverter(e){return new Vn(this.firestore,e,this._path)}}function bR(r,e,...t){if(r=oe(r),LC("collection","path",e),r instanceof fa){const n=de.fromString(e,...t);return ph(n),new Vn(r,null,n)}{if(!(r instanceof Ae||r instanceof Vn))throw new J(F.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(de.fromString(e,...t));return ph(n),new Vn(r.firestore,null,n)}}function ty(r,e,...t){if(r=oe(r),arguments.length===1&&(e=lc.newId()),LC("doc","path",e),r instanceof fa){const n=de.fromString(e,...t);return dh(n),new Ae(r,null,new X(n))}{if(!(r instanceof Ae||r instanceof Vn))throw new J(F.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(de.fromString(e,...t));return dh(n),new Ae(r.firestore,r instanceof Vn?r.converter:null,new X(n))}}/**
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
 */class mt{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(n,s){if(n.length!==s.length)return!1;for(let i=0;i<n.length;++i)if(n[i]!==s[i])return!1;return!0})(this._values,e._values)}toJSON(){return{type:mt._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(Ti(e,mt._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((t=>typeof t=="number")))return new mt(e.vectorValues);throw new J(F.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}mt._jsonSchemaVersion="firestore/vectorValue/1.0",mt._jsonSchema={type:Ve("string",mt._jsonSchemaVersion),vectorValues:Ve("object")};/**
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
 */const ny=/^__.*__$/;class ry{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return this.fieldMask!==null?new er(e,this.data,this.fieldMask,t,this.fieldTransforms):new vi(e,this.data,t,this.fieldTransforms)}}class Pd{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return new er(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function Sd(r){switch(r){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw Y(40011,{dataSource:r})}}class Dc{constructor(e,t,n,s,i,o){this.settings=e,this.databaseId=t,this.serializer=n,this.ignoreUndefinedProperties=s,i===void 0&&this.validatePath(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new Dc({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){var s;const t=(s=this.path)==null?void 0:s.child(e),n=this.contextWith({path:t,arrayElement:!1});return n.validatePathSegment(e),n}childContextForFieldPath(e){var s;const t=(s=this.path)==null?void 0:s.child(e),n=this.contextWith({path:t,arrayElement:!1});return n.validatePath(),n}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return Fo(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find((t=>e.isPrefixOf(t)))!==void 0||this.fieldTransforms.find((t=>e.isPrefixOf(t.field)))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(Sd(this.dataSource)&&ny.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class sy{constructor(e,t,n){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=n||ca(e)}createContext(e,t,n,s=!1){return new Dc({dataSource:e,methodName:t,targetDoc:n,path:vt.emptyPath(),arrayElement:!1,hasConverter:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Ca(r){const e=r._freezeSettings(),t=ca(r._databaseId);return new sy(r._databaseId,!!e.ignoreUndefinedProperties,t)}function Ic(r,e,t,n,s,i={}){const o=r.createContext(i.merge||i.mergeFields?2:0,e,t,s);yc("Data must be an object, but it was:",o,n);const B=Od(n,o);let c,u;if(i.merge)c=new At(o.fieldMask),u=o.fieldTransforms;else if(i.mergeFields){const h=[];for(const C of i.mergeFields){const p=mr(e,C,t);if(!o.contains(p))throw new J(F.INVALID_ARGUMENT,`Field '${p}' is specified in your field mask but missing from your input data.`);Ld(h,p)||h.push(p)}c=new At(h),u=o.fieldTransforms.filter((C=>c.covers(C.field)))}else c=null,u=o.fieldTransforms;return new ry(new rt(B),c,u)}class da extends la{_toFieldTransform(e){if(e.dataSource!==2)throw e.dataSource===1?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof da}}class wc extends la{_toFieldTransform(e){return new bI(e.path,new oi)}isEqual(e){return e instanceof wc}}function iy(r,e,t,n){const s=r.createContext(1,e,t);yc("Data must be an object, but it was:",s,n);const i=[],o=rt.empty();Zn(n,((c,u)=>{const h=bd(e,c,t);u=oe(u);const C=s.childContextForFieldPath(h);if(u instanceof da)i.push(h);else{const p=Wn(u,C);p!=null&&(i.push(h),o.set(h,p))}}));const B=new At(i);return new Pd(o,B,s.fieldTransforms)}function oy(r,e,t,n,s,i){const o=r.createContext(1,e,t),B=[mr(e,n,t)],c=[s];if(i.length%2!=0)throw new J(F.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let p=0;p<i.length;p+=2)B.push(mr(e,i[p])),c.push(i[p+1]);const u=[],h=rt.empty();for(let p=B.length-1;p>=0;--p)if(!Ld(u,B[p])){const I=B[p];let R=c[p];R=oe(R);const k=o.childContextForFieldPath(I);if(R instanceof da)u.push(I);else{const M=Wn(R,k);M!=null&&(u.push(I),h.set(I,M))}}const C=new At(u);return new Pd(h,C,o.fieldTransforms)}function ay(r,e,t,n=!1){return Wn(t,r.createContext(n?4:3,e))}function Wn(r,e,t){if(Nd(r=oe(r)))return yc("Unsupported field value:",e,r),Od(r,e);if(r instanceof la)return(function(s,i){if(!Sd(i.dataSource))throw i.createError(`${s._methodName}() can only be used with update() and set()`);if(!i.path)throw i.createError(`${s._methodName}() is not currently supported inside arrays`);const o=s._toFieldTransform(i);o&&i.fieldTransforms.push(o)})(r,e),null;if(r===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),r instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return(function(s,i){const o=[];let B=0;for(const c of s){let u=Wn(c,i.childContextForArray(B));u==null&&(u={nullValue:"NULL_VALUE"}),o.push(u),B++}return{arrayValue:{values:o}}})(r,e)}return(function(s,i,o){if((s=oe(s))===null)return{nullValue:"NULL_VALUE"};if(typeof s=="number")return Cc(i.serializer,s);if(typeof s=="boolean")return{booleanValue:s};if(typeof s=="string")return{stringValue:s};if(s instanceof Date){const B=ye.fromDate(s);return{timestampValue:Lo(i.serializer,B)}}if(s instanceof ye){const B=new ye(s.seconds,1e3*Math.floor(s.nanoseconds/1e3));return{timestampValue:Lo(i.serializer,B)}}if(s instanceof Qt)return{geoPointValue:{latitude:s.latitude,longitude:s.longitude}};if(s instanceof Tt)return{bytesValue:fd(i.serializer,s._byteString)};if(s instanceof Ae){const B=i.databaseId,c=s.firestore._databaseId;if(!c.isEqual(B))throw i.createError(`Document reference is for database ${c.projectId}/${c.database} but should be for database ${B.projectId}/${B.database}`);return{referenceValue:Ec(s.firestore._databaseId||i.databaseId,s._key.path)}}if(s instanceof mt)return(function(c,u){const h=c instanceof mt?c.toArray():c;return{mapValue:{fields:{[GC]:{stringValue:UC},[si]:{arrayValue:{values:h.map((p=>{if(typeof p!="number")throw u.createError("VectorValues must only contain numeric values.");return ra(u.serializer,p)}))}}}}}})(s,i);if(Dd(s))return s._toProto(i.serializer);throw i.createError(`Unsupported field value: ${ta(s)}`)})(r,e)}function Od(r,e){const t={};return bC(r)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Zn(r,((n,s)=>{const i=Wn(s,e.childContextForField(n));i!=null&&(t[n]=i)})),{mapValue:{fields:t}}}function Nd(r){return!(typeof r!="object"||r===null||r instanceof Array||r instanceof Date||r instanceof ye||r instanceof Qt||r instanceof Tt||r instanceof Ae||r instanceof la||r instanceof mt||Dd(r))}function yc(r,e,t){if(!Nd(t)||!yi(t)){const n=ta(t);throw n==="an object"?e.createError(r+" a custom object"):e.createError(r+" "+n)}}function mr(r,e,t){if((e=oe(e))instanceof ua)return e._internalPath;if(typeof e=="string")return bd(r,e);throw Fo("Field path arguments must be of type string or ",r,!1,void 0,t)}const By=new RegExp("[~\\*/\\[\\]]");function bd(r,e,t){if(e.search(By)>=0)throw Fo(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,r,!1,void 0,t);try{return new ua(...e.split("."))._internalPath}catch{throw Fo(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,r,!1,void 0,t)}}function Fo(r,e,t,n,s){const i=n&&!n.isEmpty(),o=s!==void 0;let B=`Function ${e}() called with invalid data`;t&&(B+=" (via `toFirestore()`)"),B+=". ";let c="";return(i||o)&&(c+=" (found",i&&(c+=` in field ${n}`),o&&(c+=` in document ${s}`),c+=")"),new J(F.INVALID_ARGUMENT,B+r+c)}function Ld(r,e){return r.some((t=>t.isEqual(e)))}function Fd(r){return typeof r._readUserData=="function"}/**
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
 */class ot{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){const n=rt.empty();for(const s in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(s)){const i=this.optionDefinitions[s];if(s in e){const o=e[s];let B;i.nestedOptions&&yi(o)?B={mapValue:{fields:new ot(i.nestedOptions).getOptionsProto(t,o)}}:o&&(B=Wn(o,t)??void 0),B&&n.set(vt.fromServerFormat(i.serverName),B)}}return n}getOptionsProto(e,t,n){const s=this._getKnownOptions(t,e);if(n){const i=new Map(II(n,((o,B)=>[vt.fromServerFormat(B),o!==void 0?Wn(o,e):null])));s.setAll(i)}return s.value.mapValue.fields??{}}}/**
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
 */function cy(r){return typeof r=="object"&&r!==null&&!!("nullValue"in r&&(r.nullValue===null||r.nullValue==="NULL_VALUE")||"booleanValue"in r&&(r.booleanValue===null||typeof r.booleanValue=="boolean")||"integerValue"in r&&(r.integerValue===null||typeof r.integerValue=="number"||typeof r.integerValue=="string")||"doubleValue"in r&&(r.doubleValue===null||typeof r.doubleValue=="number")||"timestampValue"in r&&(r.timestampValue===null||(function(t){return typeof t=="object"&&t!==null&&"seconds"in t&&(t.seconds===null||typeof t.seconds=="number"||typeof t.seconds=="string")&&"nanos"in t&&(t.nanos===null||typeof t.nanos=="number")})(r.timestampValue))||"stringValue"in r&&(r.stringValue===null||typeof r.stringValue=="string")||"bytesValue"in r&&(r.bytesValue===null||r.bytesValue instanceof Uint8Array)||"referenceValue"in r&&(r.referenceValue===null||typeof r.referenceValue=="string")||"geoPointValue"in r&&(r.geoPointValue===null||(function(t){return typeof t=="object"&&t!==null&&"latitude"in t&&(t.latitude===null||typeof t.latitude=="number")&&"longitude"in t&&(t.longitude===null||typeof t.longitude=="number")})(r.geoPointValue))||"arrayValue"in r&&(r.arrayValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("values"in t)||t.values!==null&&!Array.isArray(t.values))})(r.arrayValue))||"mapValue"in r&&(r.mapValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("fields"in t)||t.fields!==null&&!yi(t.fields))})(r.mapValue))||"fieldReferenceValue"in r&&(r.fieldReferenceValue===null||typeof r.fieldReferenceValue=="string")||"functionValue"in r&&(r.functionValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("name"in t)||t.name!==null&&typeof t.name!="string"||!("args"in t)||t.args!==null&&!Array.isArray(t.args))})(r.functionValue))||"pipelineValue"in r&&(r.pipelineValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("stages"in t)||t.stages!==null&&!Array.isArray(t.stages))})(r.pipelineValue)))}function LR(){return new wc("serverTimestamp")}function uy(r){return new mt(r)}/**
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
 */function H(r){let e;return r instanceof Ir?r:(e=yi(r)?dy(r):r instanceof Array?py(r):kd(r,void 0),e)}function fB(r){if(r instanceof Ir)return r;if(r instanceof mt)return fi(r);if(Array.isArray(r))return fi(uy(r));throw new Error("Unsupported value: "+typeof r)}function Tc(r){return vI(r)?Eo(r):H(r)}class Ir{constructor(){this._protoValueType="ProtoValue"}add(e){return new L("add",[this,H(e)],"add")}asBoolean(){if(this instanceof zn)return this;if(this instanceof is)return new xd(this);if(this instanceof ss)return new Cy(this);if(this instanceof L)return new Vd(this);throw new J("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new L("subtract",[this,H(e)],"subtract")}multiply(e){return new L("multiply",[this,H(e)],"multiply")}divide(e){return new L("divide",[this,H(e)],"divide")}mod(e){return new L("mod",[this,H(e)],"mod")}equal(e){return new L("equal",[this,H(e)],"equal").asBoolean()}notEqual(e){return new L("not_equal",[this,H(e)],"notEqual").asBoolean()}lessThan(e){return new L("less_than",[this,H(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new L("less_than_or_equal",[this,H(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new L("greater_than",[this,H(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new L("greater_than_or_equal",[this,H(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){const n=[e,...t].map((s=>H(s)));return new L("array_concat",[this,...n],"arrayConcat")}arrayContains(e){return new L("array_contains",[this,H(e)],"arrayContains").asBoolean()}arrayContainsAll(e){const t=Array.isArray(e)?new Ls(e.map(H),"arrayContainsAll"):e;return new L("array_contains_all",[this,t],"arrayContainsAll").asBoolean()}arrayContainsAny(e){const t=Array.isArray(e)?new Ls(e.map(H),"arrayContainsAny"):e;return new L("array_contains_any",[this,t],"arrayContainsAny").asBoolean()}arrayReverse(){return new L("array_reverse",[this])}arrayLength(){return new L("array_length",[this],"arrayLength")}equalAny(e){const t=Array.isArray(e)?new Ls(e.map(H),"equalAny"):e;return new L("equal_any",[this,t],"equalAny").asBoolean()}notEqualAny(e){const t=Array.isArray(e)?new Ls(e.map(H),"notEqualAny"):e;return new L("not_equal_any",[this,t],"notEqualAny").asBoolean()}exists(){return new L("exists",[this],"exists").asBoolean()}charLength(){return new L("char_length",[this],"charLength")}like(e){return new L("like",[this,H(e)],"like").asBoolean()}regexContains(e){return new L("regex_contains",[this,H(e)],"regexContains").asBoolean()}regexFind(e){return new L("regex_find",[this,H(e)],"regexFind")}regexFindAll(e){return new L("regex_find_all",[this,H(e)],"regexFindAll")}regexMatch(e){return new L("regex_match",[this,H(e)],"regexMatch").asBoolean()}stringContains(e){return new L("string_contains",[this,H(e)],"stringContains").asBoolean()}startsWith(e){return new L("starts_with",[this,H(e)],"startsWith").asBoolean()}endsWith(e){return new L("ends_with",[this,H(e)],"endsWith").asBoolean()}toLower(){return new L("to_lower",[this],"toLower")}toUpper(){return new L("to_upper",[this],"toUpper")}trim(e){const t=[this];return e&&t.push(H(e)),new L("trim",t,"trim")}ltrim(e){const t=[this];return e&&t.push(H(e)),new L("ltrim",t,"ltrim")}rtrim(e){const t=[this];return e&&t.push(H(e)),new L("rtrim",t,"rtrim")}type(){return new L("type",[this])}isType(e){return new L("is_type",[this,fi(e)],"isType").asBoolean()}stringConcat(e,...t){const n=[e,...t].map(H);return new L("string_concat",[this,...n],"stringConcat")}stringIndexOf(e){return new L("string_index_of",[this,H(e)],"stringIndexOf")}stringRepeat(e){return new L("string_repeat",[this,H(e)],"stringRepeat")}stringReplaceAll(e,t){return new L("string_replace_all",[this,H(e),H(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new L("string_replace_one",[this,H(e),H(t)],"stringReplaceOne")}concat(e,...t){const n=[e,...t].map(H);return new L("concat",[this,...n],"concat")}reverse(){return new L("reverse",[this],"reverse")}arrayFilter(e,t){return new L("array_filter",[this,H(e),t],"arrayFilter")}arrayTransform(e,t){return new L("array_transform",[this,H(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,n){return new L("array_transform",[this,H(e),H(t),n],"arrayTransformWithIndex")}arraySlice(e,t){const n=[this,H(e)];return t!==void 0&&n.push(H(t)),new L("array_slice",n,"arraySlice")}arrayFirst(){return new L("array_first",[this],"arrayFirst")}arrayFirstN(e){return new L("array_first_n",[this,H(e)],"arrayFirstN")}arrayLast(){return new L("array_last",[this],"arrayLast")}arrayLastN(e){return new L("array_last_n",[this,H(e)],"arrayLastN")}arrayMaximum(){return new L("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new L("maximum_n",[this,H(e)],"arrayMaximumN")}arrayMinimum(){return new L("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new L("minimum_n",[this,H(e)],"arrayMinimumN")}arrayIndexOf(e){return new L("array_index_of",[this,H(e),H("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new L("array_index_of",[this,H(e),H("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new L("array_index_of_all",[this,H(e)],"arrayIndexOfAll")}byteLength(){return new L("byte_length",[this],"byteLength")}ceil(){return new L("ceil",[this])}floor(){return new L("floor",[this])}abs(){return new L("abs",[this])}exp(){return new L("exp",[this])}mapGet(e){return new L("map_get",[this,fi(e)],"mapGet")}mapSet(e,t,...n){const s=[this,H(e),H(t),...n.map(H)];return new L("map_set",s,"mapSet")}mapKeys(){return new L("map_keys",[this],"mapKeys")}mapValues(){return new L("map_values",[this],"mapValues")}mapEntries(){return new L("map_entries",[this],"mapEntries")}getField(e){return new L("get_field",[this,H(e)],"get_field")}count(){return yt._create("count",[this],"count")}sum(){return yt._create("sum",[this],"sum")}average(){return yt._create("average",[this],"average")}minimum(){return yt._create("minimum",[this],"minimum")}maximum(){return yt._create("maximum",[this],"maximum")}first(){return yt._create("first",[this],"first")}last(){return yt._create("last",[this],"last")}arrayAgg(){return yt._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return yt._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return yt._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){const n=[e,...t];return new L("maximum",[this,...n.map(H)],"logicalMaximum")}logicalMinimum(e,...t){const n=[e,...t];return new L("minimum",[this,...n.map(H)],"minimum")}vectorLength(){return new L("vector_length",[this],"vectorLength")}cosineDistance(e){return new L("cosine_distance",[this,fB(e)],"cosineDistance")}dotProduct(e){return new L("dot_product",[this,fB(e)],"dotProduct")}euclideanDistance(e){return new L("euclidean_distance",[this,fB(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new L("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new L("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new L("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new L("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new L("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new L("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new L("timestamp_add",[this,H(e),H(t)],"timestampAdd")}timestampSubtract(e,t){return new L("timestamp_subtract",[this,H(e),H(t)],"timestampSubtract")}timestampDiff(e,t){return new L("timestamp_diff",[this,Tc(e),H(t)],"timestampDiff")}timestampExtract(e,t){const n=[this,H(e)];return t&&n.push(H(t)),new L("timestamp_extract",n,"timestampExtract")}documentId(){return new L("document_id",[this],"documentId")}parent(){return new L("parent",[this],"parent")}substring(e,t){const n=H(e);return new L("substring",t===void 0?[this,n]:[this,n,H(t)],"substring")}arrayGet(e){return new L("array_get",[this,H(e)],"arrayGet")}isError(){return new L("is_error",[this],"isError").asBoolean()}ifError(e){const t=new L("if_error",[this,H(e)],"ifError");return e instanceof zn?t.asBoolean():t}isAbsent(){return new L("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new L("map_remove",[this,H(e)],"mapRemove")}mapMerge(e,...t){const n=H(e),s=t.map(H);return new L("map_merge",[this,n,...s],"mapMerge")}pow(e){return new L("pow",[this,H(e)])}trunc(e){return e===void 0?new L("trunc",[this]):new L("trunc",[this,H(e)],"trunc")}round(e){return e===void 0?new L("round",[this]):new L("round",[this,H(e)],"round")}collectionId(){return new L("collection_id",[this])}length(){return new L("length",[this])}ln(){return new L("ln",[this])}sqrt(){return new L("sqrt",[this])}stringReverse(){return new L("string_reverse",[this])}ifAbsent(e){return new L("if_absent",[this,H(e)],"ifAbsent")}ifNull(e){return new L("if_null",[this,H(e)],"ifNull")}coalesce(e,...t){return new L("coalesce",[this,H(e),...t.map(H)],"coalesce")}join(e){return new L("join",[this,H(e)],"join")}log10(){return new L("log10",[this])}arraySum(){return new L("sum",[this])}split(e){return new L("split",[this,H(e)])}timestampTruncate(e,t){const n=[this,H(e)];return t&&n.push(H(t)),new L("timestamp_trunc",n)}ascending(){return gy(this)}descending(){return my(this)}as(e){return new hy(this,e,"as")}}class yt{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,n){const s=new yt(e,t);return s._methodName=n,s}as(e){return new ly(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map((t=>t._toProto(e)))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e)))}}class ly{constructor(e,t,n){this.aggregate=e,this.alias=t,this._methodName=n}_readUserData(e){this.aggregate._readUserData(e)}}class hy{constructor(e,t,n){this.expr=e,this.alias=t,this._methodName=n,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class Ls extends Ir{constructor(e,t){super(),this.ur=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.ur.map((t=>t._toProto(e)))}}}_readUserData(e){this.ur.forEach((t=>t._readUserData(e)))}}class ss extends Ir{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new L("geo_distance",[this,H(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}function Eo(r){return fy(r,"field")}function fy(r,e){return new ss(typeof r=="string"?qt===r?vw()._internalPath:mr("field",r):r._internalPath,e)}class is extends Ir{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){const t=new is(e,void 0);return t._protoValue=e,t}_toProto(e){return Q(this._protoValue!==void 0,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,cy(this._protoValue)||(this._protoValue=Wn(this.value,e))}}function fi(r,e){return kd(r,"constant")}function kd(r,e){const t=new is(r,e);return typeof r=="boolean"?new xd(t):t}class L extends Ir{constructor(e,t,n,s){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,n!==void 0&&(this._methodName=n),s!==void 0&&(this._options=s)}get _optionsUtil(){return new ot({})}_toProto(e){const t={functionValue:{name:this.name,args:this.params.map((n=>n._toProto(e)))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e))),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class zn extends Ir{get _methodName(){return this._expr._methodName}countIf(){return yt._create("count_if",[this],"countIf")}not(){return new L("not",[this],"not").asBoolean()}conditional(e,t){return new L("conditional",[this,e,t],"conditional")}ifError(e){const t=H(e),n=new L("if_error",[this,t],"ifError");return t instanceof zn?n.asBoolean():n}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class Vd extends zn{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class xd extends zn{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class Cy extends zn{constructor(e){super(),this._expr=e,this.expressionType="Field"}}function dy(r,e){const t=[];for(const n in r)if(Object.prototype.hasOwnProperty.call(r,n)){const s=r[n];t.push(fi(n)),t.push(H(s))}return new L("map",t,"map")}function py(r){return(function(t,n){return new L("array",t.map((s=>H(s))),n)})(r,"array")}function gy(r){return new Md(Tc(r),"ascending","ascending")}function my(r){return new Md(Tc(r),"descending","descending")}class Md{constructor(e,t,n){this.expr=e,this.direction=t,this._methodName=n,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:Id(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}/**
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
 */class St{constructor(e){this.optionsProto=void 0,{rawOptions:this.rawOptions,...this.knownOptions}=e}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class Gd extends St{get _name(){return"add_fields"}get _optionsUtil(){return new ot({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return{...super._toProto(e),args:[hi(e,this.fields)]}}_readUserData(e){super._readUserData(e),Qn(this.fields,e)}}class Ud extends St{get _name(){return"aggregate"}get _optionsUtil(){return new ot({})}constructor(e,t,n){super(n),this.groups=e,this.accumulators=t}_toProto(e){return{...super._toProto(e),args:[hi(e,this.accumulators),hi(e,this.groups)]}}_readUserData(e){super._readUserData(e),Qn(this.groups,e),Qn(this.accumulators,e)}}class Hd extends St{get _name(){return"distinct"}get _optionsUtil(){return new ot({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return{...super._toProto(e),args:[hi(e,this.groups)]}}_readUserData(e){super._readUserData(e),Qn(this.groups,e)}}class pa extends St{get _name(){return"collection"}get _optionsUtil(){return new ot({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.Er=e.startsWith("/")?e:"/"+e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:this.Er}]}}_readUserData(e){super._readUserData(e)}}class ga extends St{get _name(){return"collection_group"}get _optionsUtil(){return new ot({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:""},{stringValue:this.collectionId}]}}_readUserData(e){super._readUserData(e)}}class Ac extends St{get _name(){return"database"}get _optionsUtil(){return new ot({})}_toProto(e){return{...super._toProto(e)}}_readUserData(e){super._readUserData(e)}}class Rc extends St{get _name(){return"documents"}get _optionsUtil(){return new ot({})}constructor(e,t){if(super(t),!e||e.length===0)throw new J(F.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");const n=e.map((i=>i.startsWith("/")?i:"/"+i)),s=new Set(n);if(s.size!==n.length)throw new J(F.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.hr=n,this.Tr=s}_toProto(e){return{...super._toProto(e),args:this.hr.map((t=>({referenceValue:t})))}}_readUserData(e){super._readUserData(e)}}class ma extends St{get _name(){return"where"}get _optionsUtil(){return new ot({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return{...super._toProto(e),args:[this.condition._toProto(e)]}}_readUserData(e){super._readUserData(e),Qn(this.condition,e)}}class Er extends St{get _name(){return"limit"}get _optionsUtil(){return new ot({})}constructor(e,t){Q(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return{...super._toProto(e),args:[Cc(e,this.limit)]}}}class qh extends St{get _name(){return"offset"}get _optionsUtil(){return new ot({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return{...super._toProto(e),args:[Cc(e,this.offset)]}}}class Ey extends St{get _name(){return"select"}get _optionsUtil(){return new ot({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return{...super._toProto(e),args:[hi(e,this.selections)]}}_readUserData(e){super._readUserData(e),Qn(this.selections,e)}}class cn extends St{get _name(){return"sort"}get _optionsUtil(){return new ot({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return{...super._toProto(e),args:this.orderings.map((t=>t._toProto(e)))}}_readUserData(e){super._readUserData(e),Qn(this.orderings,e)}}class vc extends St{get _name(){return"replace_with"}get _optionsUtil(){return new ot({})}constructor(e,t){super(t),this.map=e}_toProto(e){return{...super._toProto(e),args:[this.map._toProto(e),Id(vc.Pr)]}}_readUserData(e){super._readUserData(e),Qn(this.map,e)}}vc.Pr="full_replace";function Qn(r,e){return Fd(r)?r._readUserData(e):Array.isArray(r)?r.forEach((t=>t._readUserData(e))):r instanceof Map?r.forEach((t=>t._readUserData(e))):Object.values(r).forEach((t=>t._readUserData(e))),r}/**
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
 */class Ws{constructor(e,t,n,s){this._db=e,this.userDataReader=t,this._userDataWriter=n,this.stages=s}Ar(e,t){const n=this.userDataReader.createContext(3,e);return Fd(t)?t._readUserData(n):Array.isArray(t)?t.forEach((s=>s._readUserData(n))):t.forEach((s=>s._readUserData(n))),t}where(e){const t=this.stages.map((n=>n));return this.Ar("where",e),t.push(new ma(e,{})),new Ws(this._db,this.userDataReader,this._userDataWriter,t)}limit(e){const t=this.stages.map((n=>n));return t.push(new Er(e,{})),new Ws(this._db,this.userDataReader,this._userDataWriter,t)}sort(e,...t){const n=this.stages.map((s=>s));return"orderings"in e?n.push(new cn(this.Ar("sort",e.orderings),{})):n.push(new cn(this.Ar("sort",[e,...t]),{})),new Ws(this._db,this.userDataReader,this._userDataWriter,n)}Vr(e){return{pipeline:{stages:this.stages.map((t=>t._toProto(e)))}}}}// Copyright 2024 Google LLC* @license
class ct{constructor(e,t,n){this.serializer=e,this.stages=t,this.listenOptions=n,this.isCorePipeline=!0}getPipelineCollection(){return Ea(this)}getPipelineCollectionGroup(){return Pc(this)}getPipelineCollectionId(){return _y(this)}getPipelineDocuments(){return UB(this)}getPipelineFlavor(){return(function(t){let n="exact";return t.stages.forEach(((s,i)=>{s._name!==Hd.name&&s._name!==Ud.name||(n="keyless"),s._name===Ey.name&&n==="exact"&&(n="augmented"),s._name===Gd.name&&i<t.stages.length-1&&n==="exact"&&(n="augmented")})),n})(this)}getPipelineSourceType(){return xn(this)}}function xn(r){const e=r.stages[0];return e instanceof pa||e instanceof ga||e instanceof Ac||e instanceof Rc?e._name:"unknown"}function Ea(r){if(xn(r)==="collection")return r.stages[0].Er}function Pc(r){if(xn(r)==="collection_group")return r.stages[0].collectionId}function _y(r){switch(xn(r)){case"collection":return de.fromString(Ea(r)).lastSegment();case"collection_group":return Pc(r);default:return}}function UB(r){if(xn(r)==="documents")return r.stages[0].hr}class y{constructor(e,t){this.type=e,this.value=t}static dr(){return new y("ERROR",void 0)}static mr(){return new y("UNSET",void 0)}static pr(){return new y("NULL",qr)}static newValue(e){return Rt(e)?new y("NULL",qr):(function(n){return!!n&&"booleanValue"in n})(e)?new y("BOOLEAN",e):Kt(e)?new y("INT",e):ur(e)?new y("DOUBLE",e):(function(n){return!!n&&"timestampValue"in n&&!!n.timestampValue})(e)?new y("TIMESTAMP",e):(function(n){return!!n&&"stringValue"in n})(e)?new y("STRING",e):(function(n){return!!n&&"bytesValue"in n})(e)?new y("BYTES",e):e.referenceValue?new y("REFERENCE",e):e.geoPointValue?new y("GEO_POINT",e):Wr(e)?new y("ARRAY",e):vo(e)?new y("VECTOR",e):hr(e)?new y("MAP",e):new y("ERROR",void 0)}gr(){return this.type==="ERROR"||this.type==="UNSET"}yr(){return this.type==="NULL"}}function zs(r){if(!r.gr())return r.value}function Jd(r){return r instanceof zn?r._expr:r}function ee(r){if((r=Jd(r))instanceof ss)return new Dy(r);if(r instanceof is)return new Iy(r);if(r instanceof Ls)return new wy(r);if(r instanceof L){if(r.name==="add")return new Ay(r);if(r.name==="subtract")return new Ry(r);if(r.name==="multiply")return new vy(r);if(r.name==="divide")return new Py(r);if(r.name==="mod")return new Sy(r);if(r.name==="and")return new Oy(r);if(r.name==="equal")return new Jy(r);if(r.name==="not_equal")return new jy(r);if(r.name==="less_than")return new qy(r);if(r.name==="less_than_or_equal")return new Ky(r);if(r.name==="greater_than")return new Wy(r);if(r.name==="greater_than_or_equal")return new zy(r);if(r.name==="array_concat")return new Qy(r);if(r.name==="array_reverse")return new $y(r);if(r.name==="array_contains")return new Yy(r);if(r.name==="array_contains_all")return new Xy(r);if(r.name==="array_contains_any")return new Zy(r);if(r.name==="array_length")return new eT(r);if(r.name==="array_element")return new tT(r);if(r.name==="equal_any")return new jd(r);if(r.name==="not_equal_any")return new by(r);if(r.name==="is_nan")return new Ly(r);if(r.name==="is_not_nan")return new Fy(r);if(r.name==="is_null")return new ky(r);if(r.name==="is_not_null")return new Vy(r);if(r.name==="is_error")return new xy(r);if(r.name==="exists")return new My(r);if(r.name==="not")return new _a(r);if(r.name==="or")return new Ny(r);if(r.name==="xor")return new Sc(r);if(r.name==="conditional")return new Gy(r);if(r.name==="maximum")return new Uy(r);if(r.name==="minimum")return new Hy(r);if(r.name==="reverse")return new nT(r);if(r.name==="replace_first")return new rT(r);if(r.name==="replace_all")return new sT(r);if(r.name==="char_length")return new iT(r);if(r.name==="byte_length")return new oT(r);if(r.name==="like")return new aT(r);if(r.name==="regex_contains")return new BT(r);if(r.name==="regex_match")return new cT(r);if(r.name==="string_contains")return new uT(r);if(r.name==="starts_with")return new lT(r);if(r.name==="ends_with")return new hT(r);if(r.name==="to_lower")return new fT(r);if(r.name==="to_upper")return new CT(r);if(r.name==="trim")return new dT(r);if(r.name==="string_concat")return new pT(r);if(r.name==="map_get")return new gT(r);if(r.name==="cosine_distance")return new mT(r);if(r.name==="dot_product")return new ET(r);if(r.name==="euclidean_distance")return new _T(r);if(r.name==="vector_length")return new DT(r);if(r.name==="unix_micros_to_timestamp")return new AT(r);if(r.name==="timestamp_to_unix_micros")return new PT(r);if(r.name==="unix_millis_to_timestamp")return new RT(r);if(r.name==="timestamp_to_unix_millis")return new ST(r);if(r.name==="unix_seconds_to_timestamp")return new vT(r);if(r.name==="timestamp_to_unix_seconds")return new OT(r);if(r.name==="timestamp_add")return new NT(r);if(r.name==="timestamp_subtract")return new bT(r)}throw new Error(`Unknown Expr : ${r}`)}class Dy{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===qt)return y.newValue({referenceValue:li(e.serializer,t.key)});if(this.expr.fieldName==="__update_time__")return y.newValue({timestampValue:mo(e.serializer,t.version)});if(this.expr.fieldName==="__create_time__")return y.newValue({timestampValue:mo(e.serializer,t.createTime)});const n=t.data.field(this.expr._fieldPath);return n?na(n)?y.newValue((function(i,o){if(i.serverTimestampBehavior==="estimate")return{timestampValue:mo(i.serializer,te.fromTimestamp(jr(o)))};if(i.serverTimestampBehavior==="previous"){const B=Ai(o);if(B)return B}return{nullValue:"NULL_VALUE"}})(e,n)):y.newValue(n):y.mr()}}class Iy{constructor(e){this.expr=e}evaluate(e,t){return y.newValue(this.expr._getValue())}}class wy{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.ur.map((s=>ee(s).evaluate(e,t)));return n.some((s=>s.gr()))?y.dr():y.newValue({arrayValue:{values:n.map((s=>s.value))}})}}function Ze(r){return ur(r)?Number(r.doubleValue):Number(r.integerValue)}function Zt(r){return BigInt(r.integerValue)}const yy=BigInt("0x7fffffffffffffff"),Ty=-BigInt("0x8000000000000000");class Ni{constructor(e){this.expr=e}evaluate(e,t){Q(this.expr.params.length>=2,24778);const n=ee(this.expr.params[0]).evaluate(e,t),s=ee(this.expr.params[1]).evaluate(e,t);let i=this.wr(n,s);for(const o of this.expr.params.slice(2)){const B=ee(o).evaluate(e,t);i=this.wr(i,B)}return i}wr(e,t){if(e.gr()||t.gr())return y.dr();if(e.yr()||t.yr())return y.pr();const n=e.value,s=t.value;if(!ur(n)&&!Kt(n)||!ur(s)&&!Kt(s))return y.dr();if(ur(n)||ur(s)){const i=this.br(n,s);return i?y.newValue(i):y.dr()}if(Kt(n)&&Kt(s)){const i=this.Sr(n,s);return i===void 0?y.dr():typeof i=="number"?y.newValue({doubleValue:i}):i<Ty||i>yy?y.dr():y.newValue({integerValue:`${i}`})}return y.dr()}}function pn(r,e){return Ge(r)!==Ge(e)?"TYPE_MISMATCH":Dt(r)||Dt(e)?"NOT_EQ":Rt(r)&&Rt(e)?"EQ":Rt(r)||Rt(e)?"NULL":Wr(r)&&Wr(e)?(function(n,s){var o,B,c;if(((o=n.values)==null?void 0:o.length)!==((B=s.values)==null?void 0:B.length))return"NOT_EQ";let i=!1;for(let u=0;u<(((c=n.values)==null?void 0:c.length)??0);u++){const h=n.values[u],C=s.values[u];switch(pn(h,C)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":i=!0;break;default:Y(44609,{vr:h,Dr:C})}}return i?"NULL":"EQ"})(r.arrayValue,e.arrayValue):vo(r)&&vo(e)||hr(r)&&hr(e)?(function(n,s){const i=n.fields||{},o=s.fields||{};if(Ro(i)!==Ro(o))return"NOT_EQ";let B=!1;for(const c in i)if(i.hasOwnProperty(c)){if(o[c]===void 0)return"NOT_EQ";switch(pn(i[c],o[c])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":B=!0}}return B?"NULL":"EQ"})(r.mapValue,e.mapValue):(function(n,s){return xt(n,s,{o:!1,t:!0,i:!0})})(r,e)?"EQ":"NOT_EQ"}class Ay extends Ni{Sr(e,t){return Zt(e)+Zt(t)}br(e,t){return{doubleValue:Ze(e)+Ze(t)}}}class Ry extends Ni{constructor(e){super(e),this.expr=e}Sr(e,t){return Zt(e)-Zt(t)}br(e,t){return{doubleValue:Ze(e)-Ze(t)}}}class vy extends Ni{constructor(e){super(e),this.expr=e}Sr(e,t){return Zt(e)*Zt(t)}br(e,t){return{doubleValue:Ze(e)*Ze(t)}}}class Py extends Ni{constructor(e){super(e),this.expr=e}Sr(e,t){const n=Zt(t);if(n!==BigInt(0))return Zt(e)/n}br(e,t){const n=Ze(t);return n===0?{doubleValue:ri(n)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:Ze(e)/n}}}class Sy extends Ni{constructor(e){super(e),this.expr=e}Sr(e,t){const n=Zt(t);if(n!==BigInt(0))return Zt(e)%n}br(e,t){const n=Ze(t);if(n!==0)return{doubleValue:Ze(e)%n}}}class Oy{constructor(e){this.expr=e}evaluate(e,t){var i;let n=!1,s=!1;for(const o of this.expr.params){const B=ee(o).evaluate(e,t);switch(B.type){case"BOOLEAN":if(!((i=B.value)!=null&&i.booleanValue))return y.newValue($e);break;case"NULL":s=!0;break;default:n=!0}}return n?y.dr():s?y.pr():y.newValue(Et)}}class _a{constructor(e){this.expr=e}evaluate(e,t){var s;Q(this.expr.params.length===1,9634);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"BOOLEAN":return y.newValue({booleanValue:!((s=n.value)!=null&&s.booleanValue)});case"NULL":return y.pr();default:return y.dr()}}}class Ny{constructor(e){this.expr=e}evaluate(e,t){var i;let n=!1,s=!1;for(const o of this.expr.params){const B=ee(o).evaluate(e,t);switch(B.type){case"BOOLEAN":if((i=B.value)!=null&&i.booleanValue)return y.newValue(Et);break;case"NULL":s=!0;break;default:n=!0}}return n?y.dr():s?y.pr():y.newValue($e)}}class Sc{constructor(e){this.expr=e}evaluate(e,t){var i;let n=!1,s=!1;for(const o of this.expr.params){const B=ee(o).evaluate(e,t);switch(B.type){case"BOOLEAN":n=Sc.xor(n,!!((i=B.value)!=null&&i.booleanValue));break;case"NULL":s=!0;break;default:return y.dr()}}return s?y.pr():y.newValue({booleanValue:n})}static xor(e,t){return(e||t)&&!(e&&t)}}class jd{constructor(e){this.expr=e}evaluate(e,t){var o,B;Q(this.expr.params.length===2,55094);let n=!1;const s=ee(this.expr.params[0]).evaluate(e,t);switch(s.type){case"NULL":n=!0;break;case"ERROR":case"UNSET":return y.dr()}const i=ee(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":n=!0;break;default:return y.dr()}if(n)return y.pr();for(const c of((B=(o=i.value)==null?void 0:o.arrayValue)==null?void 0:B.values)??[])switch(Rt(s.value)&&Rt(c)?"EQ":pn(s.value,c)){case"EQ":return y.newValue(Et);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":n=!0;break;default:Y(44608,{value:s.value,candidate:c})}return n?y.pr():y.newValue($e)}}class by{constructor(e){this.expr=e}evaluate(e,t){return new _a(new L("not",[new L("equal_any",this.expr.params)])).evaluate(e,t)}}class Ly{constructor(e){this.expr=e}evaluate(e,t){Q(this.expr.params.length===1,23322);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"INT":return y.newValue($e);case"DOUBLE":return y.newValue({booleanValue:isNaN(Ze(n.value))});case"NULL":return y.pr();default:return y.dr()}}}class Fy{constructor(e){this.expr=e}evaluate(e,t){return Q(this.expr.params.length===1,50406),new _a(new L("not",[new L("is_nan",this.expr.params)])).evaluate(e,t)}}class ky{constructor(e){this.expr=e}evaluate(e,t){switch(Q(this.expr.params.length===1,23123),ee(this.expr.params[0]).evaluate(e,t).type){case"NULL":return y.newValue(Et);case"UNSET":case"ERROR":return y.dr();default:return y.newValue($e)}}}class Vy{constructor(e){this.expr=e}evaluate(e,t){return Q(this.expr.params.length===1,23167),new _a(new L("not",[new L("is_null",this.expr.params)])).evaluate(e,t)}}class xy{constructor(e){this.expr=e}evaluate(e,t){return Q(this.expr.params.length===1,5228),ee(this.expr.params[0]).evaluate(e,t).type==="ERROR"?y.newValue(Et):y.newValue($e)}}class My{constructor(e){this.expr=e}evaluate(e,t){switch(Q(this.expr.params.length===1,6877),ee(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return y.dr();case"UNSET":return y.newValue($e);default:return y.newValue(Et)}}}class Gy{constructor(e){this.expr=e}evaluate(e,t){var s;Q(this.expr.params.length===3,11706);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"BOOLEAN":return(s=n.value)!=null&&s.booleanValue?ee(this.expr.params[1]).evaluate(e,t):ee(this.expr.params[2]).evaluate(e,t);case"NULL":return ee(this.expr.params[2]).evaluate(e,t);default:return y.dr()}}}class Uy{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map((i=>ee(i).evaluate(e,t)));let s;for(const i of n)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||_t(i.value,s.value)>0?i:s}return s===void 0?y.pr():s}}class Hy{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map((i=>ee(i).evaluate(e,t)));let s;for(const i of n)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||_t(i.value,s.value)<0?i:s}return s===void 0?y.pr():s}}class os{constructor(e){this.expr=e}evaluate(e,t){Q(this.expr.params.length===2,31033,`${this.expr.name}() function should have exactly 2 params`);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"ERROR":case"UNSET":return y.dr()}const s=ee(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ERROR":case"UNSET":return y.dr()}return this.Cr(n,s)}}class Jy extends os{constructor(e){super(e),this.expr=e}Cr(e,t){if(e.yr()&&t.yr())return y.newValue(Et);if(e.yr()||t.yr()||Dt(e.value)||Dt(t.value)||Ge(e.value)!==Ge(t.value))return y.newValue($e);switch(pn(e.value,t.value)){case"EQ":return y.newValue(Et);case"NOT_EQ":return y.newValue($e);case"NULL":return y.pr();default:Y(44615,{left:e,right:t})}}}class jy extends os{constructor(e){super(e),this.expr=e}Cr(e,t){switch(pn(e.value,t.value)){case"EQ":return y.newValue($e);case"NOT_EQ":case"TYPE_MISMATCH":return y.newValue(Et);case"NULL":return y.pr();default:Y(44614,{left:e,right:t})}}}class qy extends os{constructor(e){super(e),this.expr=e}Cr(e,t){return Ge(e.value)!==Ge(t.value)||Dt(e.value)||Dt(t.value)?y.newValue($e):y.newValue({booleanValue:_t(e.value,t.value)<0})}}class Ky extends os{constructor(e){super(e),this.expr=e}Cr(e,t){return Ge(e.value)!==Ge(t.value)||Dt(e.value)||Dt(t.value)?y.newValue($e):pn(e.value,t.value)==="EQ"?y.newValue(Et):y.newValue({booleanValue:_t(e.value,t.value)<0})}}class Wy extends os{constructor(e){super(e),this.expr=e}Cr(e,t){return Ge(e.value)!==Ge(t.value)||Dt(e.value)||Dt(t.value)?y.newValue($e):y.newValue({booleanValue:_t(e.value,t.value)>0})}}class zy extends os{constructor(e){super(e),this.expr=e}Cr(e,t){return Ge(e.value)!==Ge(t.value)||Dt(e.value)||Dt(t.value)?y.newValue($e):pn(e.value,t.value)==="EQ"?y.newValue(Et):y.newValue({booleanValue:_t(e.value,t.value)>0})}}class Qy{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class $y{constructor(e){this.expr=e}evaluate(e,t){var s;Q(this.expr.params.length===1,216);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return y.pr();case"ARRAY":{const i=((s=n.value.arrayValue)==null?void 0:s.values)??[];return y.newValue({arrayValue:{values:[...i].reverse()}})}default:return y.dr()}}}class Yy{constructor(e){this.expr=e}evaluate(e,t){return Q(this.expr.params.length===2,52884),new jd(new L("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class Xy{constructor(e){this.expr=e}evaluate(e,t){var c,u,h,C;Q(this.expr.params.length===2,1392);let n=!1;const s=ee(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":n=!0;break;default:return y.dr()}const i=ee(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":n=!0;break;default:return y.dr()}if(n)return y.pr();const o=((u=(c=i.value)==null?void 0:c.arrayValue)==null?void 0:u.values)??[],B=((C=(h=s.value)==null?void 0:h.arrayValue)==null?void 0:C.values)??[];for(const p of o){let I=!1;n=!1;for(const R of B){switch(Rt(p)&&Rt(R)?"EQ":pn(p,R)){case"EQ":I=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":n=!0;break;default:Y(44613,{value:R,search:p})}if(I)break}if(!I)return y.newValue($e)}return y.newValue(Et)}}class Zy{constructor(e){this.expr=e}evaluate(e,t){var c,u,h,C;Q(this.expr.params.length===2,2680);let n=!1;const s=ee(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":n=!0;break;default:return y.dr()}const i=ee(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":n=!0;break;default:return y.dr()}if(n)return y.pr();const o=((u=(c=i.value)==null?void 0:c.arrayValue)==null?void 0:u.values)??[],B=((C=(h=s.value)==null?void 0:h.arrayValue)==null?void 0:C.values)??[];for(const p of B)for(const I of o)switch(Rt(p)&&Rt(I)?"EQ":pn(p,I)){case"EQ":return y.newValue(Et);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":n=!0;break;default:Y(60403,{value:p,search:I})}return n?y.pr():y.newValue($e)}}class eT{constructor(e){this.expr=e}evaluate(e,t){var s,i,o;Q(this.expr.params.length===1,38605);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return y.pr();case"ARRAY":return y.newValue({integerValue:`${((o=(i=(s=n.value)==null?void 0:s.arrayValue)==null?void 0:i.values)==null?void 0:o.length)??0}`});default:return y.dr()}}}class tT{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class nT{constructor(e){this.expr=e}evaluate(e,t){var s,i;Q(this.expr.params.length===1,1508);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return y.pr();case"BYTES":{const o=(s=n.value)==null?void 0:s.bytesValue;if(typeof o=="string"){const B=Me.fromBase64String(o).toUint8Array();return B.reverse(),y.newValue({bytesValue:Me.fromUint8Array(B).toBase64()})}return y.newValue({bytesValue:new Uint8Array(o).reverse()})}case"STRING":{const o=(i=n.value)==null?void 0:i.stringValue,B=new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(o),c=Array.from(B,(u=>u.segment)).reverse();return y.newValue({stringValue:c.join("")})}default:return y.dr()}}}class rT{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class sT{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class iT{constructor(e){this.expr=e}evaluate(e,t){Q(this.expr.params.length===1,19400);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return y.pr();case"STRING":{const s=(function(o){let B=0;for(let c=0;c<o.length;c++){const u=o.codePointAt(c);if(u===void 0)return;if(u<=65535)if(u>=55296&&u<=57343)if(u<=56319){const h=o.codePointAt(c+1);h!==void 0&&h>=56320&&h<=57343?(B+=1,c++):B+=1}else B+=1;else B+=1;else{if(!(u<=1114111))return;B+=1,c++}}return B})(n.value.stringValue);return s===void 0?y.dr():y.newValue({integerValue:s})}default:return y.dr()}}}class oT{constructor(e){this.expr=e}evaluate(e,t){var s,i;Q(this.expr.params.length===1,8486);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"BYTES":{const o=(s=n.value)==null?void 0:s.bytesValue;return typeof o=="string"?y.newValue({integerValue:Me.fromBase64String(o).toUint8Array().length}):y.newValue({integerValue:new Uint8Array(o).length})}case"STRING":{const o=(function(c){let u=0;for(let h=0;h<c.length;h++){const C=c.codePointAt(h);if(C===void 0)return;if(C>=55296&&C<=57343){if(!(C<=56319))return;{const p=c.codePointAt(h+1);if(p===void 0||!(p>=56320&&p<=57343))return;u+=4,h++}}else if(C<=127)u+=1;else if(C<=2047)u+=2;else if(C<=65535)u+=3;else{if(!(C<=1114111))return;u+=4,h++}}return u})((i=n.value)==null?void 0:i.stringValue);return o===void 0?y.dr():y.newValue({integerValue:o})}case"NULL":return y.pr();default:return y.dr()}}}class as{constructor(e){this.expr=e}evaluate(e,t){var o,B;Q(this.expr.params.length===2,39773,`${this.expr.name}() function should have exactly two parameters`);let n=!1;const s=ee(this.expr.params[0]).evaluate(e,t);switch(s.type){case"STRING":break;case"NULL":n=!0;break;default:return y.dr()}const i=ee(this.expr.params[1]).evaluate(e,t);switch(i.type){case"STRING":break;case"NULL":n=!0;break;default:return y.dr()}return n?y.pr():this.Fr((o=s.value)==null?void 0:o.stringValue,(B=i.value)==null?void 0:B.stringValue)}}class aT extends as{Fr(e,t){try{const n=(function(o){let B="";for(let c=0;c<o.length;c++){const u=o.charAt(c);switch(u){case"_":B+=".";break;case"%":B+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":B+="\\"+u;break;default:B+=u}}return"^"+B+"$"})(t),s=cc.compile(n);return y.newValue({booleanValue:s.matches(e)})}catch(n){return Gt(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${n}`),y.dr()}}}class BT extends as{Fr(e,t){try{const n=cc.compile(t);return y.newValue({booleanValue:n.test(e)})}catch{return Gt(`Invalid regex pattern found in regex_contains: ${t}, returning error`),y.dr()}}}class cT extends as{Fr(e,t){try{return y.newValue({booleanValue:cc.compile(t).matches(e)})}catch{return Gt(`Invalid regex pattern found in regex_match: ${t}, returning error`),y.dr()}}}class uT extends as{Fr(e,t){return y.newValue({booleanValue:e.includes(t)})}}class lT extends as{Fr(e,t){return y.newValue({booleanValue:e.startsWith(t)})}}class hT extends as{Fr(e,t){return y.newValue({booleanValue:e.endsWith(t)})}}class fT{constructor(e){this.expr=e}evaluate(e,t){var s,i;Q(this.expr.params.length===1,29079);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":return y.newValue({stringValue:(i=(s=n.value)==null?void 0:s.stringValue)==null?void 0:i.toLowerCase()});case"NULL":return y.pr();default:return y.dr()}}}class CT{constructor(e){this.expr=e}evaluate(e,t){var s,i;Q(this.expr.params.length===1,60487);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":return y.newValue({stringValue:(i=(s=n.value)==null?void 0:s.stringValue)==null?void 0:i.toUpperCase()});case"NULL":return y.pr();default:return y.dr()}}}class dT{constructor(e){this.expr=e}evaluate(e,t){var s,i;Q(this.expr.params.length===1,28544);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":return y.newValue({stringValue:(i=(s=n.value)==null?void 0:s.stringValue)==null?void 0:i.trim()});case"NULL":return y.pr();default:return y.dr()}}}class pT{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map((o=>ee(o).evaluate(e,t)));let s="",i=!1;for(const o of n)switch(o.type){case"STRING":s+=o.value.stringValue;break;case"NULL":i=!0;break;default:return y.dr()}return i?y.pr():y.newValue({stringValue:s})}}class gT{constructor(e){this.expr=e}evaluate(e,t){var o,B,c,u;Q(this.expr.params.length===2,4483);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"UNSET":return y.mr();case"MAP":break;default:return y.dr()}const s=ee(this.expr.params[1]).evaluate(e,t);if(s.type!=="STRING")return y.dr();const i=(u=(B=(o=n.value)==null?void 0:o.mapValue)==null?void 0:B.fields)==null?void 0:u[(c=s.value)==null?void 0:c.stringValue];return i===void 0?y.mr():y.newValue(i)}}class Oc{constructor(e){this.expr=e}evaluate(e,t){var u,h;Q(this.expr.params.length===2,25231,`${this.expr.name}() function should have exactly 2 params`);let n=!1;const s=ee(this.expr.params[0]).evaluate(e,t);switch(s.type){case"VECTOR":break;case"NULL":n=!0;break;default:return y.dr()}const i=ee(this.expr.params[1]).evaluate(e,t);switch(i.type){case"VECTOR":break;case"NULL":n=!0;break;default:return y.dr()}if(n)return y.pr();const o=bB(s.value),B=bB(i.value);if(o===void 0||B===void 0||((u=o.values)==null?void 0:u.length)!==((h=B.values)==null?void 0:h.length))return y.dr();const c=this.Or(o,B);return c===void 0||isNaN(c)?y.dr():y.newValue({doubleValue:c})}}class mT extends Oc{Or(e,t){const n=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(n.length===0)return;let i=0,o=0,B=0;for(let u=0;u<n.length;u++){if(!qn(n[u])||!qn(s[u]))return;const h=Ze(n[u]),C=Ze(s[u]);i+=h*C,o+=h*h,B+=C*C}const c=Math.sqrt(o)*Math.sqrt(B);if(c!==0)return 1-Math.max(-1,Math.min(1,i/c))}}class ET extends Oc{Or(e,t){const n=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(n.length===0)return 0;let i=0;for(let o=0;o<n.length;o++){if(!qn(n[o])||!qn(s[o]))return;i+=Ze(n[o])*Ze(s[o])}return i}}class _T extends Oc{Or(e,t){const n=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(n.length===0)return 0;let i=0;for(let o=0;o<n.length;o++){if(!qn(n[o])||!qn(s[o]))return;const B=Ze(n[o]),c=Ze(s[o]);i+=Math.pow(B-c,2)}return Math.sqrt(i)}}class DT{constructor(e){this.expr=e}evaluate(e,t){var s;Q(this.expr.params.length===1,39044);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"VECTOR":{const i=bB(n.value);return y.newValue({integerValue:((s=i==null?void 0:i.values)==null?void 0:s.length)??0})}case"NULL":return y.pr();default:return y.dr()}}}const Ci=BigInt(-62135596800),di=BigInt(253402300799),ko=BigInt(1e3),Mn=BigInt(1e6),IT=Ci*ko,wT=di*ko+BigInt(999),yT=Ci*Mn,TT=di*Mn+BigInt(999999);function Nc(r){return r>=yT&&r<=TT}function qd(r){return r>=Ci&&r<=di}function pi(r,e){const t=BigInt(r);return!(t<Ci||t>di)&&!(e<0||e>=1e9)&&(t!==Ci||e===0)&&!(t===di&&e>999999999)}function Kd(r,e){return e<0?{seconds:r-1,nanos:e+1e9}:{seconds:r,nanos:e}}function bc(r){return BigInt(r.seconds)*Mn+BigInt(Math.trunc(r.nanoseconds/1e3))}class Lc{constructor(e){this.expr=e}evaluate(e,t){Q(this.expr.params.length===1,49262,`${this.expr.name}() function should have exactly one parameter`);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"INT":return this.toTimestamp(BigInt(n.value.integerValue));case"NULL":return y.pr();default:return y.dr()}}}class AT extends Lc{toTimestamp(e){if(!Nc(e))return y.dr();let t=Number(e/Mn),n=Number(e%Mn*BigInt(1e3));const s=Kd(t,n);return t=s.seconds,n=s.nanos,pi(t,n)?y.newValue({timestampValue:{seconds:t,nanos:n}}):y.dr()}}class RT extends Lc{toTimestamp(e){if(!(function(o){return o>=IT&&o<=wT})(e))return y.dr();let t=Number(e/ko),n=Number(e%ko*BigInt(1e6));const s=Kd(t,n);return t=s.seconds,n=s.nanos,pi(t,n)?y.newValue({timestampValue:{seconds:t,nanos:n}}):y.dr()}}class vT extends Lc{toTimestamp(e){if(!qd(e))return y.dr();const t=Number(e);return y.newValue({timestampValue:{seconds:t,nanos:0}})}}class Fc{constructor(e){this.expr=e}evaluate(e,t){Q(this.expr.params.length===1,1265,`${this.expr.name}() function should have exactly one parameter`);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"TIMESTAMP":break;case"NULL":return y.pr();default:return y.dr()}const s=mc(n.value.timestampValue);return pi(s.seconds,s.nanoseconds)?this.Mr(s):y.dr()}}class PT extends Fc{Mr(e){const t=bc(e);return Nc(t)?y.newValue({integerValue:`${t.toString()}`}):y.dr()}}class ST extends Fc{Mr(e){const t=bc(e),n=t/BigInt(1e3),s=t%BigInt(1e3);return n>BigInt(0)||s===BigInt(0)?y.newValue({integerValue:n.toString()}):y.newValue({integerValue:(n-BigInt(1)).toString()})}}class OT extends Fc{Mr(e){const t=BigInt(e.seconds);return qd(t)?y.newValue({integerValue:t.toString()}):y.dr()}}class Wd{constructor(e){this.expr=e}evaluate(e,t){Q(this.expr.params.length===3,2775,`${this.expr.name}() function should have exactly 3 parameters`);let n=!1;const s=ee(this.expr.params[0]).evaluate(e,t);switch(s.type){case"TIMESTAMP":break;case"NULL":n=!0;break;default:return y.dr()}const i=ee(this.expr.params[1]).evaluate(e,t);let o;switch(i.type){case"STRING":if(o=(function(re){switch(re){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}})(i.value.stringValue),o===void 0)return y.dr();break;case"NULL":n=!0;break;default:return y.dr()}const B=ee(this.expr.params[2]).evaluate(e,t);switch(B.type){case"INT":break;case"NULL":n=!0;break;default:return y.dr()}if(n)return y.pr();const c=BigInt(B.value.integerValue);let u;try{switch(o){case"microsecond":u=c;break;case"millisecond":u=c*BigInt(1e3);break;case"second":u=c*BigInt(1e6);break;case"minute":u=c*BigInt(6e7);break;case"hour":u=c*BigInt(36e8);break;case"day":u=c*BigInt(864e8);break;default:return y.dr()}if(o!=="microsecond"&&c!==BigInt(0)&&u/c!==BigInt(this.Nr(o)))return y.dr()}catch(z){return Gt(`Error during timestamp arithmetic: ${z}`),y.dr()}const h=mc(s.value.timestampValue);if(!pi(h.seconds,h.nanoseconds))return y.dr();const C=bc(h),p=this.Lr(C,u);if(!Nc(p))return y.dr();const I=Number(p/Mn),R=p%Mn,k=Number((R<0?R+Mn:R)*BigInt(1e3)),M=R<0?I-1:I;return pi(M,k)?y.newValue({timestampValue:{seconds:M,nanos:k}}):y.dr()}Nr(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class NT extends Wd{Lr(e,t){return e+t}}class bT extends Wd{Lr(e,t){return e-t}}function gi(r){if((r=Jd(r))instanceof ss)return`fld(${r.fieldName})`;if(r instanceof is)return`cst(${(function(t){return t===null?"null":typeof t=="number"?t.toString():typeof t=="string"?`"${t}"`:t instanceof Ae?`ref(${t.path})`:t instanceof mt?`vec(${JSON.stringify(t)})`:JSON.stringify(t)})(r.value)})`;if(r instanceof L)return`fn(${r.name},[${r.params.map(gi).join(",")}])`;if(r.expressionType==="ListOfExpressions")return`list([${r.ur.map(gi).join(",")}])`;throw new Error(`Unrecognized expr ${JSON.stringify(r,null,2)}`)}function LT(r){if(r instanceof Gd)return`${r._name}(${Bo(r.fields)})`;if(r instanceof Ud){let e=`${r._name}(${Bo(r.accumulators)})`;return r.groups.size>0&&(e+=`grouping(${Bo(r.groups)})`),e}if(r instanceof Hd)return`${r._name}(${Bo(r.groups)})`;if(r instanceof pa)return`${r._name}(${r.Er})`;if(r instanceof ga)return`${r._name}(${r.collectionId})`;if(r instanceof Ac)return`${r._name}()`;if(r instanceof Rc)return`${r._name}(${r.hr.sort()})`;if(r instanceof ma)return`${r._name}(${gi(r.condition)})`;if(r instanceof Er)return`${r._name}(${r.limit})`;if(r instanceof cn)return`${r._name}(${(function(t){return t.map((n=>`${gi(n.expr)}${n.direction}`)).join(",")})(r.orderings)})`;throw new Error(`Unrecognized stage ${r._name}`)}function Bo(r){return`${Array.from(r.entries()).sort().map((([e,t])=>`${e}=${gi(t)}`)).join(",")}`}function ln(r){return r.stages.map((e=>LT(e))).join("|")}function zd(r,e){return ln(r)===ln(e)}function je(r){return r instanceof ct}function Kh(r){return je(r)?ln(r):js(r)}function Qd(r){return je(r)?ln(r):(function(t){return`${nd(zt(t))}|lt:${t.limitType}`})(r)}function Da(r,e){return r instanceof ct&&e instanceof ct?zd(r,e):!(r instanceof ct&&!(e instanceof ct)||!(r instanceof ct)&&e instanceof ct)&&ew(r,e)}function $d(r){return Br(r)?ln(r):nd(r)}function Yd(r,e){return r instanceof ct&&e instanceof ct?zd(r,e):!(r instanceof ct&&!(e instanceof ct)||!(r instanceof ct)&&e instanceof ct)&&rd(r,e)}function FT(r,e){const t=(function(s){let i=!1;const o=[];for(const B of s)if(B instanceof cn)if(i=!0,B.orderings.some((c=>c.expr instanceof ss&&c.expr.fieldName===qt)))o.push(B);else{const c=B.orderings.map((u=>u));c.push(Eo(qt).ascending()),o.push(new cn(c,{}))}else B instanceof Er&&(i||(o.push(new cn([Eo(qt).ascending()],{})),i=!0)),o.push(B);return i||o.push(new cn([Eo(qt).ascending()],{})),o})(r.stages);if(r.userDataReader){const n=r.userDataReader.createContext(3,"toCorePipeline");t.forEach((s=>s._readUserData(n)))}return new ct(r.userDataReader.serializer,t,e)}/**
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
 */class kT{constructor(e,t,n,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=n,this.mutations=s}applyToRemoteDocument(e,t){const n=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&kI(i,e,n[s])}}applyToLocalView(e,t){for(const n of this.baseMutations)n.key.isEqual(e.key)&&(t=Hs(n,e,t,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(e.key)&&(t=Hs(n,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const n=ud();return this.mutations.forEach((s=>{const i=e.get(s.key),o=i.overlayedDocument;let B=this.applyToLocalView(o,i.mutatedFields);B=t.has(s.key)?null:B;const c=WC(o,B);c!==null&&n.set(s.key,c),o.isValidDocument()||o.convertToNoDocument(te.min())})),n}keys(){return this.mutations.reduce(((e,t)=>e.add(t.key)),ie())}isEqual(e){return this.batchId===e.batchId&&Jr(this.mutations,e.mutations,((t,n)=>wh(t,n)))&&Jr(this.baseMutations,e.baseMutations,((t,n)=>wh(t,n)))}}class kc{constructor(e,t,n,s){this.batch=e,this.commitVersion=t,this.mutationResults=n,this.docVersions=s}static from(e,t,n){Q(e.mutations.length===n.length,58842,{Br:e.mutations.length,Ur:n.length});let s=(function(){return sw})();const i=e.mutations;for(let o=0;o<i.length;o++)s=s.insert(i[o].key,n[o].version);return new kc(e,t,n,s)}}/**
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
 */const Xd="";function VT(r){let e="";for(let t=0;t<r.length;t++)e.length>0&&(e=Wh(e)),e=xT(r.get(t),e);return Wh(e)}function xT(r,e){let t=e;const n=r.length;for(let s=0;s<n;s++){const i=r.charAt(s);switch(i){case"\0":t+="";break;case Xd:t+="";break;default:t+=i}}return t}function Wh(r){return r+Xd+""}/**
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
 */class MT{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
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
 */class un{constructor(e,t,n,s,i=te.min(),o=te.min(),B=Me.EMPTY_BYTE_STRING,c=null){this.target=e,this.targetId=t,this.purpose=n,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=B,this.expectedCount=c}withSequenceNumber(e){return new un(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new un(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new un(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new un(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
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
 */class GT{constructor(e){this.qr=e}}function UT(r){const e=Dw({parent:r.parent,structuredQuery:r.structuredQuery});return r.limitType==="LAST"?kB(e,e.limit,"L"):e}/**
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
 */class HT{constructor(){this.Yi=new JT}addToCollectionParentIndex(e,t){return this.Yi.add(t),V.resolve()}getCollectionParents(e,t){return V.resolve(this.Yi.getEntries(t))}addFieldIndex(e,t){return V.resolve()}deleteFieldIndex(e,t){return V.resolve()}deleteAllFieldIndexes(e){return V.resolve()}createTargetIndexes(e,t){return V.resolve()}getDocumentsMatchingTarget(e,t){return V.resolve(null)}getIndexType(e,t){return V.resolve(0)}getFieldIndexes(e,t){return V.resolve([])}getNextCollectionGroupToUpdate(e){return V.resolve(null)}getMinOffset(e,t){return V.resolve(Kn.min())}getMinOffsetFromCollectionGroup(e,t){return V.resolve(Kn.min())}updateCollectionGroup(e,t,n){return V.resolve()}updateIndexEntries(e,t){return V.resolve()}}class JT{constructor(){this.index={}}add(e){const t=e.lastSegment(),n=e.popLast(),s=this.index[t]||new xe(de.comparator),i=!s.has(n);return this.index[t]=s.add(n),i}has(e){const t=e.lastSegment(),n=e.popLast(),s=this.index[t];return s&&s.has(n)}getEntries(e){return(this.index[e]||new xe(de.comparator)).toArray()}}/**
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
 */class $n{constructor(e){this.gs=e}next(){return this.gs+=2,this.gs}static ys(){return new $n(0)}static ws(){return new $n(-1)}}// Copyright 2024 Google LLC* @license
function Zd(r,e){var n;let t=e;for(const s of r.stages)t=qT({serializer:r.serializer,serverTimestampBehavior:(n=r.listenOptions)==null?void 0:n.serverTimestampBehavior},s,t);return t}function Ia(r,e){return Zd(r,[e]).length>0}function jT(r,e){return je(r)?Ia(r,e):Ba(r,e)}function qT(r,e,t){if(e instanceof pa)return(function(s,i,o){return o.filter((B=>B.isFoundDocument()&&`/${B.key.getCollectionPath().canonicalString()}`===i.Er))})(0,e,t);if(e instanceof ma)return(function(s,i,o){return o.filter((B=>{const c=zs(ee(i.condition).evaluate(s,B));return c!==void 0&&xt(c,Et)}))})(r,e,t);if(e instanceof ga)return(function(s,i,o){return o.filter((B=>B.isFoundDocument()&&B.key.getCollectionPath().lastSegment()===i.collectionId))})(0,e,t);if(e instanceof Ac)return(function(s,i,o){return o.filter((B=>B.isFoundDocument()))})(0,0,t);if(e instanceof Rc)return(function(s,i,o){return o.filter((B=>B.isFoundDocument()&&i.Tr.has(B.key.path.toStringWithLeadingSlash())))})(0,e,t);if(e instanceof Er)return(function(s,i,o){return o.slice(0,i.limit)})(0,e,t);if(e instanceof cn)return(function(s,i,o){const B=i.orderings.map((c=>({Os:ee(c.expr),direction:c.direction})));return[...o].sort(((c,u)=>{for(const{Os:h,direction:C}of B){const p=zs(h.evaluate(s,c)),I=zs(h.evaluate(s,u)),R=_t(p??qr,I??qr);if(R!==0)return C==="ascending"?R:-R}return 0}))})(r,e,t);throw new Error(`Unknown stage: ${e._name}`)}function HB(r){const e=(function(n){for(let s=n.stages.length-1;s>=0;s--){const i=n.stages[s];if(i instanceof cn)return i.orderings}throw new Error("Pipeline must contain at least one Sort stage")})(r);return(t,n)=>{for(const s of e){const i=zs(ee(s.expr).evaluate({serializer:r.serializer},t)),o=zs(ee(s.expr).evaluate({serializer:r.serializer},n)),B=_t(i||qr,o||qr);if(B!==0)return s.direction==="ascending"?B:-B}return 0}}function CB(r){for(let e=r.stages.length-1;e>=0;e--){const t=r.stages[e];if(t instanceof Er)return{limit:t.limit}}}/**
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
 */class KT{constructor(){this.changes=new _r((e=>e.toString()),((e,t)=>e.isEqual(t))),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Qe.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const n=this.changes.get(t);return n!==void 0?V.resolve(n):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
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
 */class WT{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
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
 */class zT{constructor(e,t,n,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=n,this.indexManager=s}getDocument(e,t){let n=null;return this.documentOverlayCache.getOverlay(e,t).next((s=>(n=s,this.remoteDocumentCache.getEntry(e,t)))).next((s=>(n!==null&&Hs(n.mutation,s,At.empty(),ye.now()),s)))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next((n=>this.getLocalViewOfDocuments(e,n,ie()).next((()=>n))))}getLocalViewOfDocuments(e,t,n=ie()){const s=Sn();return this.populateOverlays(e,s,t).next((()=>this.computeViews(e,t,s,n).next((i=>{let o=Nr();return i.forEach(((B,c)=>{o=o.insert(B,c.overlayedDocument)})),o}))))}getOverlayedDocuments(e,t){const n=Sn();return this.populateOverlays(e,n,t).next((()=>this.computeViews(e,t,n,ie())))}populateOverlays(e,t,n){const s=[];return n.forEach((i=>{t.has(i)||s.push(i)})),this.documentOverlayCache.getOverlays(e,s).next((i=>{i.forEach(((o,B)=>{t.set(o,B)}))}))}computeViews(e,t,n,s){let i=pt();const o=qs(),B=(function(){return qs()})();return t.forEach(((c,u)=>{const h=n.get(u.key);s.has(u.key)&&(h===void 0||h.mutation instanceof er)?i=i.insert(u.key,u):h!==void 0?(o.set(u.key,h.mutation.getFieldMask()),Hs(h.mutation,u,h.mutation.getFieldMask(),ye.now())):o.set(u.key,At.empty())})),this.recalculateAndSaveOverlays(e,i).next((c=>(c.forEach(((u,h)=>o.set(u,h))),t.forEach(((u,h)=>B.set(u,new WT(h,o.get(u)??null)))),B)))}recalculateAndSaveOverlays(e,t){const n=qs();let s=new Re(((o,B)=>o-B)),i=ie();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next((o=>{for(const B of o)B.keys().forEach((c=>{const u=t.get(c);if(u===null)return;let h=n.get(c)||At.empty();h=B.applyToLocalView(u,h),n.set(c,h);const C=(s.get(B.batchId)||ie()).add(c);s=s.insert(B.batchId,C)}))})).next((()=>{const o=[],B=s.getReverseIterator();for(;B.hasNext();){const c=B.getNext(),u=c.key,h=c.value,C=ud();h.forEach((p=>{if(!i.has(p)){const I=WC(t.get(p),n.get(p));I!==null&&C.set(p,I),i=i.add(p)}})),o.push(this.documentOverlayCache.saveOverlays(e,u,C))}return V.waitFor(o)})).next((()=>n))}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next((n=>this.recalculateAndSaveOverlays(e,n)))}getDocumentsMatchingQuery(e,t,n,s){return je(t)?this.getDocumentsMatchingPipeline(e,t,n,s):XI(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):id(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,n,s):this.getDocumentsMatchingCollectionQuery(e,t,n,s)}getNextDocuments(e,t,n,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,n,s).next((i=>{const o=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,n.largestBatchId,s-i.size):V.resolve(Sn());let B=ui,c=i;return o.next((u=>V.forEach(u,((h,C)=>(B<C.largestBatchId&&(B=C.largestBatchId),i.get(h)?V.resolve():this.remoteDocumentCache.getEntry(e,h).next((p=>{c=c.insert(h,p)}))))).next((()=>this.populateOverlays(e,u,i))).next((()=>this.computeViews(e,c,u,ie()))).next((h=>({batchId:B,changes:cd(h)})))))}))}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new X(t)).next((n=>{let s=Nr();return n.isFoundDocument()&&(s=s.insert(n.key,n)),s}))}getDocumentsMatchingCollectionGroupQuery(e,t,n,s){const i=t.collectionGroup;let o=Nr();return this.indexManager.getCollectionParents(e,i).next((B=>V.forEach(B,(c=>{const u=(function(C,p){return new Pi(p,null,C.explicitOrderBy.slice(),C.filters.slice(),C.limit,C.limitType,C.startAt,C.endAt)})(t,c.child(i));return this.getDocumentsMatchingCollectionQuery(e,u,n,s).next((h=>{h.forEach(((C,p)=>{o=o.insert(C,p)}))}))})).next((()=>o))))}getDocumentsMatchingCollectionQuery(e,t,n,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,n.largestBatchId).next((o=>(i=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,i,s)))).next((o=>this.retrieveMatchingLocalDocuments(i,o,(B=>Ba(t,B)))))}getDocumentsMatchingPipeline(e,t,n,s){if(xn(t)==="collection_group"){const i=Pc(t);let o=Nr();return this.indexManager.getCollectionParents(e,i).next((B=>V.forEach(B,(c=>{const u=(function(C,p){const I=C.stages.map((R=>R instanceof ga?new pa(p.canonicalString(),{}):R));return new ct(C.serializer,I)})(t,c.child(i));return this.getDocumentsMatchingPipeline(e,u,n,s).next((h=>{h.forEach(((C,p)=>{o=o.insert(C,p)}))}))})).next((()=>o))))}{let i;return this.getOverlaysForPipeline(e,t,n.largestBatchId).next((o=>{switch(i=o,xn(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,i,s);case"documents":let B=ie();for(const c of UB(t))B=B.add(X.fromPath(c));return this.remoteDocumentCache.getEntries(e,B);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new J("invalid-argument",`Invalid pipeline source to execute offline: ${ln(t)}`)}})).next((o=>this.retrieveMatchingLocalDocuments(i,o,(B=>Ia(t,B)))))}}retrieveMatchingLocalDocuments(e,t,n){e.forEach(((i,o)=>{const B=o.getKey();t.get(B)===null&&(t=t.insert(B,Qe.newInvalidDocument(B)))}));let s=Nr();return t.forEach(((i,o)=>{const B=e.get(i);B!==void 0&&Hs(B.mutation,o,At.empty(),ye.now()),n(o)&&(s=s.insert(i,o))})),s}getOverlaysForPipeline(e,t,n){switch(xn(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,de.fromString(Ea(t)),n);case"collection_group":throw new J("invalid-argument",`Unexpected collection group pipeline: ${ln(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,UB(t).map((s=>X.fromPath(s))));case"database":return this.documentOverlayCache.getAllOverlays(e,n);default:throw new J("invalid-argument",`Failed to get overlays for pipeline: ${ln(t)}`)}}}/**
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
 */class QT{constructor(e){this.serializer=e,this.Ks=new Map,this.Qs=new Map}getBundleMetadata(e,t){return V.resolve(this.Ks.get(t))}saveBundleMetadata(e,t){return this.Ks.set(t.id,(function(s){return{id:s.id,version:s.version,createTime:Pt(s.createTime)}})(t)),V.resolve()}getNamedQuery(e,t){return V.resolve(this.Qs.get(t))}saveNamedQuery(e,t){return this.Qs.set(t.name,(function(s){return{name:s.name,query:UT(s.bundledQuery),readTime:Pt(s.readTime)}})(t)),V.resolve()}}/**
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
 */class $T{constructor(){this.overlays=new Re(X.comparator),this.Ws=new Map}getOverlay(e,t){return V.resolve(this.overlays.get(t))}getOverlays(e,t){const n=Sn();return V.forEach(t,(s=>this.getOverlay(e,s).next((i=>{i!==null&&n.set(s,i)})))).next((()=>n))}getAllOverlays(e,t){const n=Sn();return this.overlays.forEach(((s,i)=>{i.largestBatchId>t&&n.set(s,i)})),V.resolve(n)}saveOverlays(e,t,n){return n.forEach(((s,i)=>{this.Yr(e,t,i)})),V.resolve()}removeOverlaysForBatchId(e,t,n){const s=this.Ws.get(n);return s!==void 0&&(s.forEach((i=>this.overlays=this.overlays.remove(i))),this.Ws.delete(n)),V.resolve()}getOverlaysForCollection(e,t,n){const s=Sn(),i=t.length+1,o=new X(t.child("")),B=this.overlays.getIteratorFrom(o);for(;B.hasNext();){const c=B.getNext().value,u=c.getKey();if(!t.isPrefixOf(u.path))break;u.path.length===i&&c.largestBatchId>n&&s.set(c.getKey(),c)}return V.resolve(s)}getOverlaysForCollectionGroup(e,t,n,s){let i=new Re(((u,h)=>u-h));const o=this.overlays.getIterator();for(;o.hasNext();){const u=o.getNext().value;if(u.getKey().getCollectionGroup()===t&&u.largestBatchId>n){let h=i.get(u.largestBatchId);h===null&&(h=Sn(),i=i.insert(u.largestBatchId,h)),h.set(u.getKey(),u)}}const B=Sn(),c=i.getIterator();for(;c.hasNext()&&(c.getNext().value.forEach(((u,h)=>B.set(u,h))),!(B.size()>=s)););return V.resolve(B)}Yr(e,t,n){const s=this.overlays.get(n.key);if(s!==null){const o=this.Ws.get(s.largestBatchId).delete(n.key);this.Ws.set(s.largestBatchId,o)}this.overlays=this.overlays.insert(n.key,new MT(t,n));let i=this.Ws.get(t);i===void 0&&(i=ie(),this.Ws.set(t,i)),this.Ws.set(t,i.add(n.key))}}/**
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
 */class YT{constructor(){this.sessionToken=Me.EMPTY_BYTE_STRING}getSessionToken(e){return V.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,V.resolve()}}/**
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
 */class Vc{constructor(){this.Gs=new xe(ze.zs),this.js=new xe(ze.Hs)}isEmpty(){return this.Gs.isEmpty()}addReference(e,t){const n=new ze(e,t);this.Gs=this.Gs.add(n),this.js=this.js.add(n)}Js(e,t){e.forEach((n=>this.addReference(n,t)))}removeReference(e,t){this.Ys(new ze(e,t))}Zs(e,t){e.forEach((n=>this.removeReference(n,t)))}Xs(e){const t=new X(new de([])),n=new ze(t,e),s=new ze(t,e+1),i=[];return this.js.forEachInRange([n,s],(o=>{this.Ys(o),i.push(o.key)})),i}e_(){this.Gs.forEach((e=>this.Ys(e)))}Ys(e){this.Gs=this.Gs.delete(e),this.js=this.js.delete(e)}t_(e){const t=new X(new de([])),n=new ze(t,e),s=new ze(t,e+1);let i=ie();return this.js.forEachInRange([n,s],(o=>{i=i.add(o.key)})),i}containsKey(e){const t=new ze(e,0),n=this.Gs.firstAfterOrEqual(t);return n!==null&&e.isEqual(n.key)}}class ze{constructor(e,t){this.key=e,this.n_=t}static zs(e,t){return X.comparator(e.key,t.key)||Be(e.n_,t.n_)}static Hs(e,t){return Be(e.n_,t.n_)||X.comparator(e.key,t.key)}}/**
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
 */class XT{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Wr=1,this.r_=new xe(ze.zs)}checkEmpty(e){return V.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,n,s){const i=this.Wr;this.Wr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new kT(i,t,n,s);this.mutationQueue.push(o);for(const B of s)this.r_=this.r_.add(new ze(B.key,i)),this.indexManager.addToCollectionParentIndex(e,B.key.path.popLast());return V.resolve(o)}lookupMutationBatch(e,t){return V.resolve(this.i_(t))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,s=this.s_(n),i=s<0?0:s;return V.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return V.resolve(this.mutationQueue.length===0?hc:this.Wr-1)}getAllMutationBatches(e){return V.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const n=new ze(t,0),s=new ze(t,Number.POSITIVE_INFINITY),i=[];return this.r_.forEachInRange([n,s],(o=>{const B=this.i_(o.n_);i.push(B)})),V.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new xe(Be);return t.forEach((s=>{const i=new ze(s,0),o=new ze(s,Number.POSITIVE_INFINITY);this.r_.forEachInRange([i,o],(B=>{n=n.add(B.n_)}))})),V.resolve(this.__(n))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,s=n.length+1;let i=n;X.isDocumentKey(i)||(i=i.child(""));const o=new ze(new X(i),0);let B=new xe(Be);return this.r_.forEachWhile((c=>{const u=c.key.path;return!!n.isPrefixOf(u)&&(u.length===s&&(B=B.add(c.n_)),!0)}),o),V.resolve(this.__(B))}__(e){const t=[];return e.forEach((n=>{const s=this.i_(n);s!==null&&t.push(s)})),t}removeMutationBatch(e,t){Q(this.o_(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let n=this.r_;return V.forEach(t.mutations,(s=>{const i=new ze(s.key,t.batchId);return n=n.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)})).next((()=>{this.r_=n}))}jr(e){}containsKey(e,t){const n=new ze(t,0),s=this.r_.firstAfterOrEqual(n);return V.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,V.resolve()}o_(e,t){return this.s_(e)}s_(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}i_(e){const t=this.s_(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
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
 */class ZT{constructor(e){this.a_=e,this.docs=(function(){return new Re(X.comparator)})(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const n=t.key,s=this.docs.get(n),i=s?s.size:0,o=this.a_(t);return this.docs=this.docs.insert(n,{document:t.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(e,n.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const n=this.docs.get(t);return V.resolve(n?n.document.mutableCopy():Qe.newInvalidDocument(t))}getEntries(e,t){let n=pt();return t.forEach((s=>{const i=this.docs.get(s);n=n.insert(s,i?i.document.mutableCopy():Qe.newInvalidDocument(s))})),V.resolve(n)}getAllEntries(e){let t=pt();return this.docs.forEach(((n,s)=>{t=t.insert(n,s.document)})),V.resolve(t)}getDocumentsMatchingQuery(e,t,n,s){let i,o;je(t)?(i=de.fromString(Ea(t)),o=h=>Ia(t,h)):(i=t.path,o=h=>Ba(t,h));let B=pt();const c=new X(i.child("__id-9223372036854775808__")),u=this.docs.getIteratorFrom(c);for(;u.hasNext();){const{key:h,value:{document:C}}=u.getNext();if(!i.isPrefixOf(h.path))break;h.path.length>i.length+1||QI(zI(C),n)<=0||(s.has(C.key)||o(C))&&(B=B.insert(C.key,C.mutableCopy()))}return V.resolve(B)}getAllFromCollectionGroup(e,t,n,s){Y(9500)}u_(e,t){return V.forEach(this.docs,(n=>t(n)))}newChangeBuffer(e){return new eA(this)}getSize(e){return V.resolve(this.size)}}class eA extends KT{constructor(e){super(),this.qs=e}applyChanges(e){const t=[];return this.changes.forEach(((n,s)=>{s.isValidDocument()?t.push(this.qs.addEntry(e,s)):this.qs.removeEntry(n)})),V.waitFor(t)}getFromCache(e,t){return this.qs.getEntry(e,t)}getAllFromCache(e,t){return this.qs.getEntries(e,t)}}/**
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
 */class tA{constructor(e){this.persistence=e,this.c_=new _r((t=>$d(t)),Yd),this.lastRemoteSnapshotVersion=te.min(),this.highestTargetId=0,this.l_=0,this.E_=new Vc,this.targetCount=0,this.h_=$n.ys()}forEachTarget(e,t){return this.c_.forEach(((n,s)=>t(s))),V.resolve()}getLastRemoteSnapshotVersion(e){return V.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return V.resolve(this.l_)}allocateTargetId(e){return this.highestTargetId=this.h_.next(),V.resolve(this.highestTargetId)}setTargetsMetadata(e,t,n){return n&&(this.lastRemoteSnapshotVersion=n),t>this.l_&&(this.l_=t),V.resolve()}vs(e){this.c_.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.h_=new $n(t),this.highestTargetId=t),e.sequenceNumber>this.l_&&(this.l_=e.sequenceNumber)}addTargetData(e,t){return this.vs(t),this.targetCount+=1,V.resolve()}updateTargetData(e,t){return this.vs(t),V.resolve()}removeTargetData(e,t){return this.c_.delete(t.target),this.E_.Xs(t.targetId),this.targetCount-=1,V.resolve()}removeTargets(e,t,n){let s=0;const i=[];return this.c_.forEach(((o,B)=>{B.sequenceNumber<=t&&n.get(B.targetId)===null&&(this.c_.delete(o),i.push(this.removeMatchingKeysForTargetId(e,B.targetId)),s++)})),V.waitFor(i).next((()=>s))}getTargetCount(e){return V.resolve(this.targetCount)}getTargetData(e,t){const n=this.c_.get(t)||null;return V.resolve(n)}addMatchingKeys(e,t,n){return this.E_.Js(t,n),V.resolve()}removeMatchingKeys(e,t,n){this.E_.Zs(t,n);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach((o=>{i.push(s.markPotentiallyOrphaned(e,o))})),V.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.E_.Xs(t),V.resolve()}getMatchingKeysForTargetId(e,t){const n=this.E_.t_(t);return V.resolve(n)}containsKey(e,t){return V.resolve(this.E_.containsKey(t))}}/**
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
 */class ep{constructor(e,t){this.T_={},this.overlays={},this.P_=new ha(0),this.R_=!1,this.R_=!0,this.I_=new YT,this.referenceDelegate=e(this),this.A_=new tA(this),this.indexManager=new HT,this.remoteDocumentCache=(function(s){return new ZT(s)})((n=>this.referenceDelegate.V_(n))),this.serializer=new GT(t),this.d_=new QT(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.R_=!1,Promise.resolve()}get started(){return this.R_}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new $T,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let n=this.T_[e.toKey()];return n||(n=new XT(t,this.referenceDelegate),this.T_[e.toKey()]=n),n}getGlobalsCache(){return this.I_}getTargetCache(){return this.A_}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.d_}runTransaction(e,t,n){K("MemoryPersistence","Starting transaction:",e);const s=new nA(this.P_.next());return this.referenceDelegate.f_(),n(s).next((i=>this.referenceDelegate.m_(s).next((()=>i)))).toPromise().then((i=>(s.raiseOnCommittedEvent(),i)))}p_(e,t){return V.or(Object.values(this.T_).map((n=>()=>n.containsKey(e,t))))}}class nA extends zw{constructor(e){super(),this.currentSequenceNumber=e}}class xc{constructor(e){this.persistence=e,this.g_=new Vc,this.y_=null}static w_(e){return new xc(e)}get b_(){if(this.y_)return this.y_;throw Y(60996)}addReference(e,t,n){return this.g_.addReference(n,t),this.b_.delete(n.toString()),V.resolve()}removeReference(e,t,n){return this.g_.removeReference(n,t),this.b_.add(n.toString()),V.resolve()}markPotentiallyOrphaned(e,t){return this.b_.add(t.toString()),V.resolve()}removeTarget(e,t){this.g_.Xs(t.targetId).forEach((s=>this.b_.add(s.toString())));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(e,t.targetId).next((s=>{s.forEach((i=>this.b_.add(i.toString())))})).next((()=>n.removeTargetData(e,t)))}f_(){this.y_=new Set}m_(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return V.forEach(this.b_,(n=>{const s=X.fromPath(n);return this.S_(e,s).next((i=>{i||t.removeEntry(s,te.min())}))})).next((()=>(this.y_=null,t.apply(e))))}updateLimboDocument(e,t){return this.S_(e,t).next((n=>{n?this.b_.delete(t.toString()):this.b_.add(t.toString())}))}V_(e){return 0}S_(e,t){return V.or([()=>V.resolve(this.g_.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.p_(e,t)])}}class Vo{constructor(e,t){this.persistence=e,this.v_=new _r((n=>VT(n.path)),((n,s)=>n.isEqual(s))),this.garbageCollector=Zw(this,t)}static w_(e,t){return new Vo(e,t)}f_(){}m_(e){return V.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}rr(e){const t=this.xs(e);return this.persistence.getTargetCache().getTargetCount(e).next((n=>t.next((s=>n+s))))}xs(e){let t=0;return this.ir(e,(n=>{t++})).next((()=>t))}ir(e,t){return V.forEach(this.v_,((n,s)=>this.Fs(e,n,s).next((i=>i?V.resolve():t(s)))))}removeTargets(e,t,n){return this.persistence.getTargetCache().removeTargets(e,t,n)}removeOrphanedDocuments(e,t){let n=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.u_(e,(o=>this.Fs(e,o,t).next((B=>{B||(n++,i.removeEntry(o,te.min()))})))).next((()=>i.apply(e))).next((()=>n))}markPotentiallyOrphaned(e,t){return this.v_.set(t,e.currentSequenceNumber),V.resolve()}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,n)}addReference(e,t,n){return this.v_.set(n,e.currentSequenceNumber),V.resolve()}removeReference(e,t,n){return this.v_.set(n,e.currentSequenceNumber),V.resolve()}updateLimboDocument(e,t){return this.v_.set(t,e.currentSequenceNumber),V.resolve()}V_(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=Co(e.data.value)),t}Fs(e,t,n){return V.or([()=>this.persistence.p_(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.v_.get(t);return V.resolve(s!==void 0&&s>n)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
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
 */class Mc{constructor(e,t,n,s){this.targetId=e,this.fromCache=t,this.Ao=n,this.Vo=s}static fo(e,t){let n=ie(),s=ie();for(const i of t.docChanges)switch(i.type){case 0:n=n.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new Mc(e,t.fromCache,n,s)}}/**
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
 */function rA(r,e){return X.comparator(r.key,e.key)}/**
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
 */class sA{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class iA{constructor(){this.mo=!1,this.po=!1,this.yo=100,this.wo=(function(){return Dg()?8:Qw(it())>0?6:4})()}initialize(e,t){this.bo=e,this.indexManager=t,this.mo=!0}getDocumentsMatchingQuery(e,t,n,s){const i={result:null};return this.So(e,t).next((o=>{i.result=o})).next((()=>{if(!i.result)return this.vo(e,t,s,n).next((o=>{i.result=o}))})).next((()=>{if(i.result)return;const o=new sA;return this.Do(e,t,o).next((B=>{if(i.result=B,this.po)return this.xo(e,t,o,B.size)}))})).next((()=>i.result))}xo(e,t,n,s){return je(t)?V.resolve():n.documentReadCount<this.yo?(Sr()<=ce.DEBUG&&K("QueryEngine","SDK will not create cache indexes for query:",js(t),"since it only creates cache indexes for collection contains","more than or equal to",this.yo,"documents"),V.resolve()):(Sr()<=ce.DEBUG&&K("QueryEngine","Query:",js(t),"scans",n.documentReadCount,"local documents and returns",s,"documents as results."),n.documentReadCount>this.wo*s?(Sr()<=ce.DEBUG&&K("QueryEngine","The SDK decides to create cache indexes for query:",js(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,zt(t))):V.resolve())}So(e,t){if(je(t))return V.resolve(null);let n=t;if(Ph(n))return V.resolve(null);let s=zt(n);return this.indexManager.getIndexType(e,s).next((i=>i===0?null:(n.limit!==null&&i===1&&(n=kB(n,null,"F"),s=zt(n)),this.indexManager.getDocumentsMatchingTarget(e,s).next((o=>{const B=ie(...o);return this.bo.getDocuments(e,B).next((c=>this.indexManager.getMinOffset(e,s).next((u=>{const h=this.Co(n,c);return this.Fo(n,h,B,u.readTime)?this.So(e,kB(n,null,"F")):this.Oo(e,h,n,u)}))))})))))}vo(e,t,n,s){return(je(t)?(function(o){for(const B of o.stages){if(B instanceof Er||B instanceof qh)return!1;if(B instanceof ma){if(B.condition instanceof Vd&&B.condition._expr.name==="exists"&&B.condition._expr.params[0]instanceof ss&&B.condition._expr.params[0].fieldName===qt)continue;return!1}}return!0})(t):Ph(t))||s.isEqual(te.min())?V.resolve(null):this.bo.getDocuments(e,n).next((i=>{const o=this.Co(t,i);return this.Fo(t,o,n,s)?V.resolve(null):(Sr()<=ce.DEBUG&&K("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),Kh(t)),this.Oo(e,o,t,WI(s,ui)).next((B=>B)))}))}Co(e,t){let n,s;return je(e)?(n=new xe(rA),s=i=>Ia(e,i)):(n=new xe(pc(e)),s=i=>Ba(e,i)),t.forEach(((i,o)=>{s(o)&&(n=n.add(o))})),n}Fo(e,t,n,s){if(je(e))return(function(B){return B.stages.some((c=>c instanceof Er||c instanceof qh))})(e);if(e.limit===null)return!1;if(n.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Do(e,t,n){return Sr()<=ce.DEBUG&&K("QueryEngine","Using full collection scan to execute query:",Kh(t)),this.bo.getDocumentsMatchingQuery(e,t,Kn.min(),n)}Oo(e,t,n,s){return this.bo.getDocumentsMatchingQuery(e,n,s).next((i=>(t.forEach((o=>{i=i.insert(o.key,o)})),i)))}}/**
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
 */const Gc="LocalStore",oA=3e8;class aA{constructor(e,t,n,s){this.persistence=e,this.Mo=t,this.serializer=s,this.No=new Re(Be),this.Lo=new _r((i=>$d(i)),Yd),this.Bo=new Map,this.Uo=e.getRemoteDocumentCache(),this.A_=e.getTargetCache(),this.d_=e.getBundleCache(),this.ko(n)}ko(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new zT(this.Uo,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Uo.setIndexManager(this.indexManager),this.Mo.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(t=>e.collect(t,this.No)))}}function BA(r,e,t,n){return new aA(r,e,t,n)}async function tp(r,e){const t=ne(r);return await t.persistence.runTransaction("Handle user change","readonly",(n=>{let s;return t.mutationQueue.getAllMutationBatches(n).next((i=>(s=i,t.ko(e),t.mutationQueue.getAllMutationBatches(n)))).next((i=>{const o=[],B=[];let c=ie();for(const u of s){o.push(u.batchId);for(const h of u.mutations)c=c.add(h.key)}for(const u of i){B.push(u.batchId);for(const h of u.mutations)c=c.add(h.key)}return t.localDocuments.getDocuments(n,c).next((u=>({qo:u,removedBatchIds:o,addedBatchIds:B})))}))}))}function cA(r,e){const t=ne(r);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",(n=>{const s=e.batch.keys(),i=t.Uo.newChangeBuffer({trackRemovals:!0});return(function(B,c,u,h){const C=u.batch,p=C.keys();let I=V.resolve();return p.forEach((R=>{I=I.next((()=>h.getEntry(c,R))).next((k=>{const M=u.docVersions.get(R);Q(M!==null,48541),k.version.compareTo(M)<0&&(C.applyToRemoteDocument(k,u),k.isValidDocument()&&(k.setReadTime(u.commitVersion),h.addEntry(k)))}))})),I.next((()=>B.mutationQueue.removeMutationBatch(c,C)))})(t,n,e,i).next((()=>i.apply(n))).next((()=>t.mutationQueue.performConsistencyCheck(n))).next((()=>t.documentOverlayCache.removeOverlaysForBatchId(n,s,e.batch.batchId))).next((()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(n,(function(B){let c=ie();for(let u=0;u<B.mutationResults.length;++u)B.mutationResults[u].transformResults.length>0&&(c=c.add(B.batch.mutations[u].key));return c})(e)))).next((()=>t.localDocuments.getDocuments(n,s)))}))}function np(r){const e=ne(r);return e.persistence.runTransaction("Get last remote snapshot version","readonly",(t=>e.A_.getLastRemoteSnapshotVersion(t)))}function uA(r,e){const t=ne(r),n=e.snapshotVersion;let s=t.No;return t.persistence.runTransaction("Apply remote event","readwrite-primary",(i=>{const o=t.Uo.newChangeBuffer({trackRemovals:!0});s=t.No;const B=[];e.targetChanges.forEach(((h,C)=>{const p=s.get(C);if(!p)return;B.push(t.A_.removeMatchingKeys(i,h.removedDocuments,C).next((()=>t.A_.addMatchingKeys(i,h.addedDocuments,C))));let I=p.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(C)!==null?I=I.withResumeToken(Me.EMPTY_BYTE_STRING,te.min()).withLastLimboFreeSnapshotVersion(te.min()):h.resumeToken.approximateByteSize()>0&&(I=I.withResumeToken(h.resumeToken,n)),s=s.insert(C,I),(function(k,M,z){return k.resumeToken.approximateByteSize()===0||M.snapshotVersion.toMicroseconds()-k.snapshotVersion.toMicroseconds()>=oA?!0:z.addedDocuments.size+z.modifiedDocuments.size+z.removedDocuments.size>0})(p,I,h)&&B.push(t.A_.updateTargetData(i,I))}));let c=pt(),u=ie();if(e.documentUpdates.forEach((h=>{e.resolvedLimboDocuments.has(h)&&B.push(t.persistence.referenceDelegate.updateLimboDocument(i,h))})),B.push(lA(i,o,e.documentUpdates).next((h=>{c=h.$o,u=h.Ko}))),!n.isEqual(te.min())){const h=t.A_.getLastRemoteSnapshotVersion(i).next((C=>t.A_.setTargetsMetadata(i,i.currentSequenceNumber,n)));B.push(h)}return V.waitFor(B).next((()=>o.apply(i))).next((()=>t.localDocuments.getLocalViewOfDocuments(i,c,u))).next((()=>c))})).then((i=>(t.No=s,i)))}function lA(r,e,t){let n=ie(),s=ie();return t.forEach((i=>n=n.add(i))),e.getEntries(r,n).next((i=>{let o=pt();return t.forEach(((B,c)=>{const u=i.get(B);c.isFoundDocument()!==u.isFoundDocument()&&(s=s.add(B)),c.isNoDocument()&&c.version.isEqual(te.min())?(e.removeEntry(B,c.readTime),o=o.insert(B,c)):!u.isValidDocument()||c.version.compareTo(u.version)>0||c.version.compareTo(u.version)===0&&u.hasPendingWrites?(e.addEntry(c),o=o.insert(B,c)):K(Gc,"Ignoring outdated watch update for ",B,". Current version:",u.version," Watch version:",c.version)})),{$o:o,Ko:s}}))}function hA(r,e){const t=ne(r);return t.persistence.runTransaction("Get next mutation batch","readonly",(n=>(e===void 0&&(e=hc),t.mutationQueue.getNextMutationBatchAfterBatchId(n,e))))}function fA(r,e){const t=ne(r);return t.persistence.runTransaction("Allocate target","readwrite",(n=>{let s;return t.A_.getTargetData(n,e).next((i=>i?(s=i,V.resolve(s)):t.A_.allocateTargetId(n).next((o=>(s=new un(e,o,"TargetPurposeListen",n.currentSequenceNumber),t.A_.addTargetData(n,s).next((()=>s)))))))})).then((n=>{const s=t.No.get(n.targetId);return(s===null||n.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.No=t.No.insert(n.targetId,n),t.Lo.set(e,n.targetId)),n}))}async function JB(r,e,t){const n=ne(r),s=n.No.get(e),i=t?"readwrite":"readwrite-primary";try{t||await n.persistence.runTransaction("Release target",i,(o=>n.persistence.referenceDelegate.removeTarget(o,s)))}catch(o){if(!rs(o))throw o;K(Gc,`Failed to update sequence numbers for target ${e}: ${o}`)}n.No=n.No.remove(e),n.Lo.delete(s.target)}function zh(r,e,t){const n=ne(r);let s=te.min(),i=ie();return n.persistence.runTransaction("Execute query","readwrite",(o=>(function(c,u,h){const C=ne(c),p=C.Lo.get(h);return p!==void 0?V.resolve(C.No.get(p)):C.A_.getTargetData(u,h)})(n,o,je(e)?e:zt(e)).next((B=>{if(B)return s=B.lastLimboFreeSnapshotVersion,n.A_.getMatchingKeysForTargetId(o,B.targetId).next((c=>{i=c}))})).next((()=>n.Mo.getDocumentsMatchingQuery(o,e,t?s:te.min(),t?i:ie()))).next((B=>(CA(n,B),{documents:B,Qo:i})))))}function CA(r,e){e.forEach(((t,n)=>{const s=n.key.getCollectionGroup(),i=r.Bo.get(s)||te.min();n.readTime.compareTo(i)>0&&r.Bo.set(s,n.readTime)}))}/**
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
 */class dA{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.Jo=0,this.Yo=null,this.Zo=!0}Xo(){this.Jo===0&&(this.ea("Unknown"),this.Yo=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this.Yo=null,this.ta("Backend didn't respond within 10 seconds."),this.ea("Offline"),Promise.resolve()))))}na(e){this.state==="Online"?this.ea("Unknown"):(this.Jo++,this.Jo>=1&&(this.ra(),this.ta(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ea("Offline")))}set(e){this.ra(),this.Jo=0,e==="Online"&&(this.Zo=!1),this.ea(e)}ea(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ta(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Zo?(dn(t),this.Zo=!1):K("OnlineStateTracker",t)}ra(){this.Yo!==null&&(this.Yo.cancel(),this.Yo=null)}}/**
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
 */const en="RemoteStore";class pA{constructor(e,t,n,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=n,this.remoteSyncer={},this.ia=[],this.sa=new Map,this._a=new Map,this.oa=new Map,this.aa=new $n(1e3),this.ua=new $n(1001),this.ca=new Set,this.la=[],this.Ea=i,this.Ea.Ke((o=>{n.enqueueAndForget((async()=>{wr(this)&&(K(en,"Restarting streams for network reachability change."),await(async function(c){const u=ne(c);u.ca.add(4),await bi(u),u.ha.set("Unknown"),u.ca.delete(4),await wa(u)})(this))}))})),this.ha=new dA(n,s)}}async function wa(r){if(wr(r))for(const e of r.la)await e(!0)}async function bi(r){for(const e of r.la)await e(!1)}function jB(r,e){return r._a.get(e)||void 0}function rp(r,e){const t=ne(r),n=jB(t,e.targetId);if(n!==void 0&&t.sa.has(n))return;const s=(function(B,c){const u=jB(B,c);u!==void 0&&B.oa.delete(u);const h=(function(p,I){return I%2!=0?p.ua.next():p.aa.next()})(B,c);return B._a.set(c,h),B.oa.set(h,c),h})(t,e.targetId);K(en,"remoteStoreListen mapping SDK target ID to remote",e.targetId,s);const i=new un(e.target,s,e.purpose,e.sequenceNumber,e.snapshotVersion,e.lastLimboFreeSnapshotVersion,e.resumeToken);t.sa.set(s,i),jc(t)?Jc(t):Bs(t).Jt()&&Hc(t,i)}function Uc(r,e){const t=ne(r),n=Bs(t),s=jB(t,e);K(en,"remoteStoreUnlisten removing mapping of SDK target ID to remote",e,s),t.sa.delete(s),t._a.delete(e),t.oa.delete(s),n.Jt()&&sp(t,s),t.sa.size===0&&(n.Jt()?n.Xt():wr(t)&&t.ha.set("Unknown"))}function Hc(r,e){if(r.Ta.H(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(te.min())>0){const t=r.oa.get(e.targetId);if(t===void 0)return void K(en,"SDK target ID not found for remote ID: "+e.targetId);const n=r.remoteSyncer.getRemoteKeysForTarget(t).size;e=e.withExpectedCount(n)}Bs(r).Tn(e)}function sp(r,e){r.Ta.H(e),Bs(r).Pn(e)}function Jc(r){r.Ta=new uw({getRemoteKeysForTarget:e=>{const t=r.oa.get(e);return t!==void 0?r.remoteSyncer.getRemoteKeysForTarget(t):ie()},ge:e=>r.sa.get(e)||null,Ae:()=>r.datastore.serializer.databaseId}),Bs(r).start(),r.ha.Xo()}function jc(r){return wr(r)&&!Bs(r).Ht()&&r.sa.size>0}function wr(r){return ne(r).ca.size===0}function ip(r){r.Ta=void 0}async function gA(r){r.ha.set("Online")}async function mA(r){r.sa.forEach(((e,t)=>{Hc(r,e)}))}async function EA(r,e){ip(r),jc(r)?(r.ha.na(e),Jc(r)):r.ha.set("Unknown")}async function _A(r,e,t){if(r.ha.set("Online"),e instanceof hd&&e.state===2&&e.cause)try{await(async function(s,i){const o=i.cause;for(const B of i.targetIds){if(s.sa.has(B)){const c=s.oa.get(B);c!==void 0&&(await s.remoteSyncer.rejectListen(c,o),s._a.delete(c),s.oa.delete(B)),s.sa.delete(B)}s.Ta.removeTarget(B)}})(r,e)}catch(n){K(en,"Failed to remove targets %s: %s ",e.targetIds.join(","),n),await xo(r,n)}else if(e instanceof go?r.Ta.se(e):e instanceof ld?r.Ta.Ee(e):r.Ta.ae(e),!t.isEqual(te.min()))try{const n=await np(r.localStore);t.compareTo(n)>=0&&await(function(i,o){const B=i.Ta.de(o);B.targetChanges.forEach(((u,h)=>{if(u.resumeToken.approximateByteSize()>0){const C=i.sa.get(h);C&&i.sa.set(h,C.withResumeToken(u.resumeToken,o))}})),B.targetMismatches.forEach(((u,h)=>{const C=i.sa.get(u);if(!C)return;i.sa.set(u,C.withResumeToken(Me.EMPTY_BYTE_STRING,C.snapshotVersion)),sp(i,u);const p=new un(C.target,u,h,C.sequenceNumber);Hc(i,p)}));const c=(function(h,C){const p=new Map;C.targetChanges.forEach(((R,k)=>{const M=h.oa.get(k);M!==void 0&&p.set(M,R)}));let I=new Re(Be);return C.targetMismatches.forEach(((R,k)=>{const M=h.oa.get(R);M!==void 0&&(I=I.insert(M,k))})),new Si(C.snapshotVersion,p,I,C.documentUpdates,C.augmentedDocumentUpdates,C.resolvedLimboDocuments)})(i,B);return i.remoteSyncer.applyRemoteEvent(c)})(r,t)}catch(n){K(en,"Failed to raise snapshot:",n),await xo(r,n)}}async function xo(r,e,t){if(!rs(e))throw e;r.ca.add(1),await bi(r),r.ha.set("Offline"),t||(t=()=>np(r.localStore)),r.asyncQueue.enqueueRetryable((async()=>{K(en,"Retrying IndexedDB access"),await t(),r.ca.delete(1),await wa(r)}))}function op(r,e){return e().catch((t=>xo(r,t,e)))}async function ya(r){const e=ne(r),t=Yn(e);let n=e.ia.length>0?e.ia[e.ia.length-1].batchId:hc;for(;DA(e);)try{const s=await hA(e.localStore,n);if(s===null){e.ia.length===0&&t.Xt();break}n=s.batchId,IA(e,s)}catch(s){await xo(e,s)}ap(e)&&Bp(e)}function DA(r){return wr(r)&&r.ia.length<10}function IA(r,e){r.ia.push(e);const t=Yn(r);t.Jt()&&t.Rn&&t.In(e.mutations)}function ap(r){return wr(r)&&!Yn(r).Ht()&&r.ia.length>0}function Bp(r){Yn(r).start()}async function wA(r){Yn(r).dn()}async function yA(r){const e=Yn(r);for(const t of r.ia)e.In(t.mutations)}async function TA(r,e,t){const n=r.ia.shift(),s=kc.from(n,e,t);await op(r,(()=>r.remoteSyncer.applySuccessfulWrite(s))),await ya(r)}async function AA(r,e){e&&Yn(r).Rn&&await(async function(n,s){if((function(o){return od(o)&&o!==F.ABORTED})(s.code)){const i=n.ia.shift();Yn(n).Zt(),await op(n,(()=>n.remoteSyncer.rejectFailedWrite(i.batchId,s))),await ya(n)}})(r,e),ap(r)&&Bp(r)}async function Qh(r,e){const t=ne(r);t.asyncQueue.verifyOperationInProgress(),K(en,"RemoteStore received new credentials");const n=wr(t);t.ca.add(3),await bi(t),n&&t.ha.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.ca.delete(3),await wa(t)}async function RA(r,e){const t=ne(r);e?(t.ca.delete(2),await wa(t)):e||(t.ca.add(2),await bi(t),t.ha.set("Unknown"))}function Bs(r){return r.Pa||(r.Pa=(function(t,n,s){const i=ne(t);return i.mn(),new Gw(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(r.datastore,r.asyncQueue,{ut:gA.bind(null,r),lt:mA.bind(null,r),ht:EA.bind(null,r),hn:_A.bind(null,r)}),r.la.push((async e=>{e?(r.Pa.Zt(),jc(r)?Jc(r):r.ha.set("Unknown")):(await r.Pa.stop(),ip(r))}))),r.Pa}function Yn(r){return r.Ra||(r.Ra=(function(t,n,s){const i=ne(t);return i.mn(),new Uw(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(r.datastore,r.asyncQueue,{ut:()=>Promise.resolve(),lt:wA.bind(null,r),ht:AA.bind(null,r),An:yA.bind(null,r),Vn:TA.bind(null,r)}),r.la.push((async e=>{e?(r.Ra.Zt(),await ya(r)):(await r.Ra.stop(),r.ia.length>0&&(K(en,`Stopping write stream with ${r.ia.length} pending writes`),r.ia=[]))}))),r.Ra}/**
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
 */class qc{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ia(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ia(this.observer.error,e):dn("Uncaught Error in snapshot listener:",e.toString()))}Aa(){this.muted=!0}Ia(e,t){setTimeout((()=>{this.muted||e(t)}),0)}}/**
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
 */class Kc{constructor(e,t,n,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=n,this.op=s,this.removalCallback=i,this.deferred=new $t,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((o=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,n,s,i){const o=Date.now()+n,B=new Kc(e,t,o,s,i);return B.start(n),B}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new J(F.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Wc(r,e){if(dn("AsyncQueue",`${e}: ${r}`),rs(r))return new J(F.UNAVAILABLE,`${e}: ${r}`);throw r}class $h{constructor(){this.activeTargetIds=aw()}La(e){this.activeTargetIds=this.activeTargetIds.add(e)}Ba(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Na(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class vA{constructor(){this.du=new $h,this.fu={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,n){}addLocalQueryTarget(e,t=!0){return t&&this.du.La(e),this.fu[e]||"not-current"}updateQueryState(e,t,n){this.fu[e]=t}removeLocalQueryTarget(e){this.du.Ba(e)}isLocalQueryTarget(e){return this.du.activeTargetIds.has(e)}clearQueryState(e){delete this.fu[e]}getAllActiveQueryTargets(){return this.du.activeTargetIds}isActiveQueryTarget(e){return this.du.activeTargetIds.has(e)}start(){return this.du=new $h,Promise.resolve()}handleUserChange(e,t,n){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}function dB(){return typeof document<"u"?document:null}/**
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
 */class fr{static emptySet(e){return new fr(e.comparator)}constructor(e){this.comparator=e?(t,n)=>e(t,n)||X.comparator(t.key,n.key):(t,n)=>X.comparator(t.key,n.key),this.keyedMap=Nr(),this.sortedSet=new Re(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal(((t,n)=>(e(t),!1)))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof fr)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),n=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=n.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach((t=>{e.push(t.toString())})),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const n=new fr;return n.comparator=this.comparator,n.keyedMap=e,n.sortedSet=t,n}}/**
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
 */class Yh{constructor(){this.mu=new Re(X.comparator)}track(e){const t=e.doc.key,n=this.mu.get(t);n?e.type!==0&&n.type===3?this.mu=this.mu.insert(t,e):e.type===3&&n.type!==1?this.mu=this.mu.insert(t,{type:n.type,doc:e.doc}):e.type===2&&n.type===2?this.mu=this.mu.insert(t,{type:2,doc:e.doc}):e.type===2&&n.type===0?this.mu=this.mu.insert(t,{type:0,doc:e.doc}):e.type===1&&n.type===0?this.mu=this.mu.remove(t):e.type===1&&n.type===2?this.mu=this.mu.insert(t,{type:1,doc:n.doc}):e.type===0&&n.type===1?this.mu=this.mu.insert(t,{type:2,doc:e.doc}):Y(63341,{ye:e,pu:n}):this.mu=this.mu.insert(t,e)}gu(){const e=[];return this.mu.inorderTraversal(((t,n)=>{e.push(n)})),e}}class zr{constructor(e,t,n,s,i,o,B,c,u){this.query=e,this.docs=t,this.oldDocs=n,this.docChanges=s,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=B,this.excludesMetadataChanges=c,this.hasCachedResults=u}static fromInitialDocuments(e,t,n,s,i){const o=[];return t.forEach((B=>{o.push({type:0,doc:B})})),new zr(e,t,fr.emptySet(t),o,n,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Da(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,n=e.docChanges;if(t.length!==n.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==n[s].type||!t[s].doc.isEqual(n[s].doc))return!1;return!0}}/**
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
 */class PA{constructor(){this.yu=void 0,this.wu=[]}bu(){return this.wu.some((e=>e.Su()))}}class SA{constructor(){this.queries=Xh(),this.onlineState="Unknown",this.vu=new Set}terminate(){(function(t,n){const s=ne(t),i=s.queries;s.queries=Xh(),i.forEach(((o,B)=>{for(const c of B.wu)c.onError(n)}))})(this,new J(F.ABORTED,"Firestore shutting down"))}}function Xh(){return new _r((r=>Qd(r)),Da)}async function zc(r,e){const t=ne(r);let n=3;const s=e.query;let i=t.queries.get(s);i?!i.bu()&&e.Su()&&(n=2):(i=new PA,n=e.Su()?0:1);try{switch(n){case 0:i.yu=await t.onListen(s,!0);break;case 1:i.yu=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(o){const B=Wc(o,`Initialization of query '${je(e.query)?ln(e.query):js(e.query)}' failed`);return void e.onError(B)}t.queries.set(s,i),i.wu.push(e),e.Du(t.onlineState),i.yu&&e.xu(i.yu)&&$c(t)}async function Qc(r,e){const t=ne(r),n=e.query;let s=3;const i=t.queries.get(n);if(i){const o=i.wu.indexOf(e);o>=0&&(i.wu.splice(o,1),i.wu.length===0?s=e.Su()?0:1:!i.bu()&&e.Su()&&(s=2))}switch(s){case 0:return t.queries.delete(n),t.onUnlisten(n,!0);case 1:return t.queries.delete(n),t.onUnlisten(n,!1);case 2:return t.onLastRemoteStoreUnlisten(n);default:return}}function OA(r,e){const t=ne(r);let n=!1;for(const s of e){const i=s.query,o=t.queries.get(i);if(o){for(const B of o.wu)B.xu(s)&&(n=!0);o.yu=s}}n&&$c(t)}function NA(r,e,t){const n=ne(r),s=n.queries.get(e);if(s)for(const i of s.wu)i.onError(t);n.queries.delete(e)}function $c(r){r.vu.forEach((e=>{e.next()}))}var qB;(function(r){r.Default="default",r.Cache="cache"})(qB||(qB={}));class Yc{constructor(e,t,n){this.query=e,this.Cu=t,this.Fu=!1,this.Ou=null,this.onlineState="Unknown",this.options=n||{}}xu(e){if(!this.options.includeMetadataChanges){const n=[];for(const s of e.docChanges)s.type!==3&&n.push(s);e=new zr(e.query,e.docs,e.oldDocs,n,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Fu?this.Mu(e)&&(this.Cu.next(e),t=!0):this.Nu(e,this.onlineState)&&(this.Lu(e),t=!0),this.Ou=e,t}onError(e){this.Cu.error(e)}Du(e){this.onlineState=e;let t=!1;return this.Ou&&!this.Fu&&this.Nu(this.Ou,e)&&(this.Lu(this.Ou),t=!0),t}Nu(e,t){if(!e.fromCache||!this.Su())return!0;const n=t!=="Offline";return(!this.options.waitForSyncWhenOnline||!n)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Mu(e){if(e.docChanges.length>0)return!0;const t=this.Ou&&this.Ou.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}Lu(e){e=zr.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Fu=!0,this.Cu.next(e)}Su(){return this.options.source!==qB.Cache}}/**
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
 */class cp{constructor(e){this.key=e}}class up{constructor(e){this.key=e}}class bA{constructor(e,t){this.query=e,this.Gu=t,this.zu=null,this.hasCachedResults=!1,this.current=!1,this.ju=ie(),this.mutatedKeys=ie(),this.Hu=je(e)?HB(e):pc(e),this.Ju=new fr(this.Hu)}get Yu(){return this.Gu}Zu(e,t){const n=t?t.Xu:new Yh,s=t?t.Ju:this.Ju;let i=t?t.mutatedKeys:this.mutatedKeys,o=s,B=!1;const[c,u]=this.ec(this.query,s);e.inorderTraversal(((C,p)=>{const I=s.get(C),R=jT(this.query,p)?p:null,k=!!I&&this.mutatedKeys.has(I.key),M=!!R&&(R.hasLocalMutations||this.mutatedKeys.has(R.key)&&R.hasCommittedMutations);let z=!1;I&&R?I.data.isEqual(R.data)?k!==M&&(n.track({type:3,doc:R}),z=!0):this.tc(I,R)||(n.track({type:2,doc:R}),z=!0,(c&&this.Hu(R,c)>0||u&&this.Hu(R,u)<0)&&(B=!0)):!I&&R?(n.track({type:0,doc:R}),z=!0):I&&!R&&(n.track({type:1,doc:I}),z=!0,(c||u)&&(B=!0)),z&&(R?(o=o.add(R),i=M?i.add(C):i.delete(C)):(o=o.delete(C),i=i.delete(C)))}));const h=this.nc(this.query);if(h)if(je(this.query)){const C=[];o.forEach((R=>C.push(R)));const p=Zd(this.query,C);let I=new fr(HB(this.query));for(const R of p)I=I.add(R);o.forEach((R=>{I.has(R.key)||(i=i.delete(R.key),n.track({type:1,doc:R}))})),o=I}else{const C=this.rc(this.query);for(;o.size>h;){const p=C==="F"?o.last():o.first();o=o.delete(p.key),i=i.delete(p.key),n.track({type:1,doc:p})}}return{Ju:o,Xu:n,Fo:B,mutatedKeys:i}}nc(e){var t;return je(e)?(t=CB(e))==null?void 0:t.limit:e.limit||void 0}rc(e){if(je(e)){const t=CB(e);return t&&t.limit<0?"L":"F"}return e.limitType}ec(e,t){var n;if(je(e)){const s=(n=CB(e))==null?void 0:n.limit;return[t.size===s?t.last():null,null]}return[e.limitType==="F"&&t.size===this.nc(this.query)?t.last():null,e.limitType==="L"&&t.size===this.nc(this.query)?t.first():null]}tc(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,n,s){const i=this.Ju;this.Ju=e.Ju,this.mutatedKeys=e.mutatedKeys;const o=e.Xu.gu();o.sort(((h,C)=>(function(I,R){const k=M=>{switch(M){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return Y(20277,{ye:M})}};return k(I)-k(R)})(h.type,C.type)||this.Hu(h.doc,C.doc))),this.sc(n),s=s??!1;const B=t&&!s?this._c():[],c=this.ju.size===0&&this.current&&!s?1:0,u=c!==this.zu;return this.zu=c,o.length!==0||u?{snapshot:new zr(this.query,e.Ju,i,o,e.mutatedKeys,c===0,u,!1,!!n&&n.resumeToken.approximateByteSize()>0),oc:B}:{oc:B}}Du(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ju:this.Ju,Xu:new Yh,mutatedKeys:this.mutatedKeys,Fo:!1},!1)):{oc:[]}}ac(e){return!this.Gu.has(e)&&!!this.Ju.has(e)&&!this.Ju.get(e).hasLocalMutations}sc(e){e&&(e.addedDocuments.forEach((t=>this.Gu=this.Gu.add(t))),e.modifiedDocuments.forEach((t=>{})),e.removedDocuments.forEach((t=>this.Gu=this.Gu.delete(t))),this.current=e.current)}_c(){if(!this.current)return[];const e=this.ju;this.ju=ie(),this.Ju.forEach((n=>{this.ac(n.key)&&(this.ju=this.ju.add(n.key))}));const t=[];return e.forEach((n=>{this.ju.has(n)||t.push(new up(n))})),this.ju.forEach((n=>{e.has(n)||t.push(new cp(n))})),t}uc(e){this.Gu=e.Qo,this.ju=ie();const t=this.Zu(e.documents);return this.applyChanges(t,!0)}cc(){return zr.fromInitialDocuments(this.query,this.Ju,this.mutatedKeys,this.zu===0,this.hasCachedResults)}}const Xc="SyncEngine";class LA{constructor(e,t,n){this.query=e,this.targetId=t,this.view=n}}class FA{constructor(e){this.key=e,this.lc=!1}}class kA{constructor(e,t,n,s,i,o){this.localStore=e,this.remoteStore=t,this.eventManager=n,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.Ec={},this.hc=new _r((B=>Qd(B)),Da),this.Tc=new Map,this.Pc=new Set,this.Rc=new Re(X.comparator),this.Ic=new Map,this.Ac=new Vc,this.Vc={},this.dc=new Map,this.fc=$n.ws(),this.onlineState="Unknown",this.mc=void 0}get isPrimaryClient(){return this.mc===!0}}async function VA(r,e,t=!0){const n=pp(r);let s;const i=n.hc.get(e);return i?(n.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.cc()):s=await lp(n,e,t,!0),s}async function xA(r,e){const t=pp(r);await lp(t,e,!0,!1)}async function lp(r,e,t,n){const s=await fA(r.localStore,je(e)?e:zt(e)),i=s.targetId,o=r.sharedClientState.addLocalQueryTarget(i,t);let B;return n&&(B=await MA(r,e,i,o==="current",s.resumeToken)),r.isPrimaryClient&&t&&rp(r.remoteStore,s),B}async function MA(r,e,t,n,s){r.gc=(C,p,I)=>(async function(k,M,z,re){let pe=M.view.Zu(z);pe.Fo&&(pe=await zh(k.localStore,M.query,!1).then((({documents:v})=>M.view.Zu(v,pe))));const Se=re&&re.targetChanges.get(M.targetId),Oe=re&&re.targetMismatches.get(M.targetId)!=null,Te=M.view.applyChanges(pe,k.isPrimaryClient,Se,Oe);return ef(k,M.targetId,Te.oc),Te.snapshot})(r,C,p,I);const i=await zh(r.localStore,e,!0),o=new bA(e,i.Qo),B=o.Zu(i.documents),c=Oi.createSynthesizedTargetChangeForCurrentChange(t,n&&r.onlineState!=="Offline",s),u=o.applyChanges(B,r.isPrimaryClient,c);ef(r,t,u.oc);const h=new LA(e,t,o);return r.hc.set(e,h),r.Tc.has(t)?r.Tc.get(t).push(e):r.Tc.set(t,[e]),u.snapshot}async function GA(r,e,t){const n=ne(r),s=n.hc.get(e),i=n.Tc.get(s.targetId);if(i.length>1)return n.Tc.set(s.targetId,i.filter((o=>!Da(o,e)))),void n.hc.delete(e);n.isPrimaryClient?(n.sharedClientState.removeLocalQueryTarget(s.targetId),n.sharedClientState.isActiveQueryTarget(s.targetId)||await JB(n.localStore,s.targetId,!1).then((()=>{n.sharedClientState.clearQueryState(s.targetId),t&&Uc(n.remoteStore,s.targetId),KB(n,s.targetId)})).catch(ns)):(KB(n,s.targetId),await JB(n.localStore,s.targetId,!0))}async function UA(r,e){const t=ne(r),n=t.hc.get(e),s=t.Tc.get(n.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(n.targetId),Uc(t.remoteStore,n.targetId))}async function HA(r,e,t){const n=QA(r);try{const s=await(function(o,B){const c=ne(o),u=ye.now(),h=B.reduce(((I,R)=>I.add(R.key)),ie());let C,p;return c.persistence.runTransaction("Locally write mutations","readwrite",(I=>{let R=pt(),k=ie();return c.Uo.getEntries(I,h).next((M=>{R=M,R.forEach(((z,re)=>{re.isValidDocument()||(k=k.add(z))}))})).next((()=>c.localDocuments.getOverlayedDocuments(I,R))).next((M=>{C=M;const z=[];for(const re of B){const pe=VI(re,C.get(re.key).overlayedDocument);pe!=null&&z.push(new er(re.key,pe,HC(pe.value.mapValue),st.exists(!0)))}return c.mutationQueue.addMutationBatch(I,u,z,B)})).next((M=>{p=M;const z=M.applyToLocalDocumentSet(C,k);return c.documentOverlayCache.saveOverlays(I,M.batchId,z)}))})).then((()=>({batchId:p.batchId,changes:cd(C)})))})(n.localStore,e);n.sharedClientState.addPendingMutation(s.batchId),(function(o,B,c){let u=o.Vc[o.currentUser.toKey()];u||(u=new Re(Be)),u=u.insert(B,c),o.Vc[o.currentUser.toKey()]=u})(n,s.batchId,t),await Li(n,s.changes),await ya(n.remoteStore)}catch(s){const i=Wc(s,"Failed to persist write");t.reject(i)}}async function hp(r,e){const t=ne(r);try{const n=await uA(t.localStore,e);e.targetChanges.forEach(((s,i)=>{const o=t.Ic.get(i);o&&(Q(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?o.lc=!0:s.modifiedDocuments.size>0?Q(o.lc,14607):s.removedDocuments.size>0&&(Q(o.lc,42227),o.lc=!1))})),await Li(t,n,e)}catch(n){await ns(n)}}function Zh(r,e,t){const n=ne(r);if(n.isPrimaryClient&&t===0||!n.isPrimaryClient&&t===1){const s=[];n.hc.forEach(((i,o)=>{const B=o.view.Du(e);B.snapshot&&s.push(B.snapshot)})),(function(o,B){const c=ne(o);c.onlineState=B;let u=!1;c.queries.forEach(((h,C)=>{for(const p of C.wu)p.Du(B)&&(u=!0)})),u&&$c(c)})(n.eventManager,e),s.length&&n.Ec.hn(s),n.onlineState=e,n.isPrimaryClient&&n.sharedClientState.setOnlineState(e)}}async function JA(r,e,t){const n=ne(r);n.sharedClientState.updateQueryState(e,"rejected",t);const s=n.Ic.get(e),i=s&&s.key;if(i){let o=new Re(X.comparator);o=o.insert(i,Qe.newNoDocument(i,te.min()));const B=ie().add(i),c=new Si(te.min(),new Map,new Re(Be),o,pt(),B);await hp(n,c),n.Rc=n.Rc.remove(i),n.Ic.delete(e),Zc(n)}else await JB(n.localStore,e,!1).then((()=>KB(n,e,t))).catch(ns)}async function jA(r,e){const t=ne(r),n=e.batch.batchId;try{const s=await cA(t.localStore,e);Cp(t,n,null),fp(t,n),t.sharedClientState.updateMutationState(n,"acknowledged"),await Li(t,s)}catch(s){await ns(s)}}async function qA(r,e,t){const n=ne(r);try{const s=await(function(o,B){const c=ne(o);return c.persistence.runTransaction("Reject batch","readwrite-primary",(u=>{let h;return c.mutationQueue.lookupMutationBatch(u,B).next((C=>(Q(C!==null,37113),h=C.keys(),c.mutationQueue.removeMutationBatch(u,C)))).next((()=>c.mutationQueue.performConsistencyCheck(u))).next((()=>c.documentOverlayCache.removeOverlaysForBatchId(u,h,B))).next((()=>c.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(u,h))).next((()=>c.localDocuments.getDocuments(u,h)))}))})(n.localStore,e);Cp(n,e,t),fp(n,e),n.sharedClientState.updateMutationState(e,"rejected",t),await Li(n,s)}catch(s){await ns(s)}}function fp(r,e){(r.dc.get(e)||[]).forEach((t=>{t.resolve()})),r.dc.delete(e)}function Cp(r,e,t){const n=ne(r);let s=n.Vc[n.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),n.Vc[n.currentUser.toKey()]=s}}function KB(r,e,t=null){r.sharedClientState.removeLocalQueryTarget(e);for(const n of r.Tc.get(e))r.hc.delete(n),t&&r.Ec.yc(n,t);r.Tc.delete(e),r.isPrimaryClient&&r.Ac.Xs(e).forEach((n=>{r.Ac.containsKey(n)||dp(r,n)}))}function dp(r,e){r.Pc.delete(e.path.canonicalString());const t=r.Rc.get(e);t!==null&&(Uc(r.remoteStore,t),r.Rc=r.Rc.remove(e),r.Ic.delete(t),Zc(r))}function ef(r,e,t){for(const n of t)n instanceof cp?(r.Ac.addReference(n.key,e),KA(r,n)):n instanceof up?(K(Xc,"Document no longer in limbo: "+n.key),r.Ac.removeReference(n.key,e),r.Ac.containsKey(n.key)||dp(r,n.key)):Y(19791,{wc:n})}function KA(r,e){const t=e.key,n=t.path.canonicalString();r.Rc.get(t)||r.Pc.has(n)||(K(Xc,"New document in limbo: "+t),r.Pc.add(n),Zc(r))}function Zc(r){for(;r.Pc.size>0&&r.Rc.size<r.maxConcurrentLimboResolutions;){const e=r.Pc.values().next().value;r.Pc.delete(e);const t=new X(de.fromString(e)),n=r.fc.next();r.Ic.set(n,new FA(t)),r.Rc=r.Rc.insert(t,n),rp(r.remoteStore,new un(zt(aa(t.path)),n,"TargetPurposeLimboResolution",ha.yn))}}async function Li(r,e,t){const n=ne(r),s=[],i=[],o=[];n.hc.isEmpty()||(n.hc.forEach(((B,c)=>{o.push(n.gc(c,e,t).then((u=>{var h;if((u||t)&&n.isPrimaryClient){const C=u?!u.fromCache:(h=t==null?void 0:t.targetChanges.get(c.targetId))==null?void 0:h.current;n.sharedClientState.updateQueryState(c.targetId,C?"current":"not-current")}if(u){s.push(u);const C=Mc.fo(c.targetId,u);i.push(C)}})))})),await Promise.all(o),n.Ec.hn(s),await(async function(c,u){const h=ne(c);try{await h.persistence.runTransaction("notifyLocalViewChanges","readwrite",(C=>V.forEach(u,(p=>V.forEach(p.Ao,(I=>h.persistence.referenceDelegate.addReference(C,p.targetId,I))).next((()=>V.forEach(p.Vo,(I=>h.persistence.referenceDelegate.removeReference(C,p.targetId,I)))))))))}catch(C){if(!rs(C))throw C;K(Gc,"Failed to update sequence numbers: "+C)}for(const C of u){const p=C.targetId;if(!C.fromCache){const I=h.No.get(p),R=I.snapshotVersion,k=I.withLastLimboFreeSnapshotVersion(R);h.No=h.No.insert(p,k)}}})(n.localStore,i))}async function WA(r,e){const t=ne(r);if(!t.currentUser.isEqual(e)){K(Xc,"User change. New user:",e.toKey());const n=await tp(t.localStore,e);t.currentUser=e,(function(i,o){i.dc.forEach((B=>{B.forEach((c=>{c.reject(new J(F.CANCELLED,o))}))})),i.dc.clear()})(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,n.removedBatchIds,n.addedBatchIds),await Li(t,n.qo)}}function zA(r,e){const t=ne(r),n=t.Ic.get(e);if(n&&n.lc)return ie().add(n.key);{let s=ie();const i=t.Tc.get(e);if(!i)return s;for(const o of i??[]){const B=t.hc.get(o);s=s.unionWith(B.view.Yu)}return s}}function pp(r){const e=ne(r);return e.remoteStore.remoteSyncer.applyRemoteEvent=hp.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=zA.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=JA.bind(null,e),e.Ec.hn=OA.bind(null,e.eventManager),e.Ec.yc=NA.bind(null,e.eventManager),e}function QA(r){const e=ne(r);return e.remoteStore.remoteSyncer.applySuccessfulWrite=jA.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=qA.bind(null,e),e}class Mo{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=ca(e.databaseInfo.databaseId),this.sharedClientState=this.Sc(e),this.persistence=this.vc(e),await this.persistence.start(),this.localStore=this.Dc(e),this.gcScheduler=this.xc(e,this.localStore),this.indexBackfillerScheduler=this.Cc(e,this.localStore)}xc(e,t){return null}Cc(e,t){return null}Dc(e){return BA(this.persistence,new iA,e.initialUser,this.serializer)}vc(e){return new ep(xc.w_,this.serializer)}Sc(e){return new vA}async terminate(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Mo.provider={build:()=>new Mo};class gp extends Mo{constructor(e){super(),this.cacheSizeBytes=e}xc(e,t){Q(this.persistence.referenceDelegate instanceof Vo,46915);const n=this.persistence.referenceDelegate.garbageCollector;return new Yw(n,e.asyncQueue,t)}vc(e){const t=this.cacheSizeBytes!==void 0?dt.withCacheSize(this.cacheSizeBytes):dt.DEFAULT;return new ep((n=>Vo.w_(n,t)),this.serializer)}}class Go{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=n=>Zh(this.syncEngine,n,1),this.remoteStore.remoteSyncer.handleCredentialChange=WA.bind(null,this.syncEngine),await RA(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return(function(){return new SA})()}createDatastore(e){const t=ca(e.databaseInfo.databaseId),n=Mw(e.databaseInfo);return jw(e.authCredentials,e.appCheckCredentials,n,t)}createRemoteStore(e){return(function(n,s,i,o,B){return new pA(n,s,i,o,B)})(this.localStore,this.datastore,e.asyncQueue,(t=>Zh(this.syncEngine,t,0)),(function(){return Vh.Je()?new Vh:new Fw})())}createSyncEngine(e,t){return(function(s,i,o,B,c,u,h){const C=new kA(s,i,o,B,c,u);return h&&(C.mc=!0),C})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await(async function(s){const i=ne(s);K(en,"RemoteStore shutting down."),i.ca.add(5),await bi(i),i.Ea.shutdown(),i.ha.set("Unknown")})(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()}}Go.provider={build:()=>new Go};/**
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
 */let $A=class{constructor(e){this.datastore=e,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(e){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new J(F.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const t=await(async function(s,i){const o=ne(s),B={documents:i.map((C=>li(o.serializer,C)))},c=await o.st("BatchGetDocuments",o.serializer.databaseId,de.emptyPath(),B,i.length),u=new Map;c.forEach((C=>{const p=pw(o.serializer,C);u.set(p.key.toString(),p)}));const h=[];return i.forEach((C=>{const p=u.get(C.toString());Q(!!p,55234,{key:C}),h.push(p)})),h})(this.datastore,e);return t.forEach((n=>this.recordVersion(n))),t}set(e,t){this.write(t.toMutation(e,this.precondition(e))),this.writtenDocs.add(e.toString())}update(e,t){try{this.write(t.toMutation(e,this.preconditionForUpdate(e)))}catch(n){this.lastTransactionError=n}this.writtenDocs.add(e.toString())}delete(e){this.write(new oa(e,this.precondition(e))),this.writtenDocs.add(e.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const e=this.readVersions;this.mutations.forEach((t=>{e.delete(t.key.toString())})),e.forEach(((t,n)=>{const s=X.fromPath(n);this.mutations.push(new QC(s,this.precondition(s)))})),await(async function(n,s){const i=ne(n),o={writes:s.map((B=>gd(i.serializer,B)))};await i.tt("Commit",i.serializer.databaseId,de.emptyPath(),o)})(this.datastore,this.mutations),this.committed=!0}recordVersion(e){let t;if(e.isFoundDocument())t=e.version;else{if(!e.isNoDocument())throw Y(50498,{Oc:e.constructor.name});t=te.min()}const n=this.readVersions.get(e.key.toString());if(n){if(!t.isEqual(n))throw new J(F.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(e.key.toString(),t)}precondition(e){const t=this.readVersions.get(e.toString());return!this.writtenDocs.has(e.toString())&&t?t.isEqual(te.min())?st.exists(!1):st.updateTime(t):st.none()}preconditionForUpdate(e){const t=this.readVersions.get(e.toString());if(!this.writtenDocs.has(e.toString())&&t){if(t.isEqual(te.min()))throw new J(F.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return st.updateTime(t)}return st.exists(!0)}write(e){this.ensureCommitNotCalled(),this.mutations.push(e)}ensureCommitNotCalled(){}};/**
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
 */class YA{constructor(e,t,n,s,i){this.asyncQueue=e,this.datastore=t,this.options=n,this.updateFunction=s,this.deferred=i,this.Mc=n.maxAttempts,this.jt=new _c(this.asyncQueue,"transaction_retry")}Nc(){this.Mc-=1,this.Lc()}Lc(){this.jt.Ut((async()=>{const e=new $A(this.datastore),t=this.Bc(e);t&&t.then((n=>{this.asyncQueue.enqueueAndForget((()=>e.commit().then((()=>{this.deferred.resolve(n)})).catch((s=>{this.Uc(s)}))))})).catch((n=>{this.Uc(n)}))}))}Bc(e){try{const t=this.updateFunction(e);return!Ri(t)&&t.catch&&t.then?t:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(t){return this.deferred.reject(t),null}}Uc(e){this.Mc>0&&this.kc(e)?(this.Mc-=1,this.asyncQueue.enqueueAndForget((()=>(this.Lc(),Promise.resolve())))):this.deferred.reject(e)}kc(e){if((e==null?void 0:e.name)==="FirebaseError"){const t=e.code;return t==="aborted"||t==="failed-precondition"||t==="already-exists"||!od(t)}return!1}}/**
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
 */const Xn="FirestoreClient";class XA{constructor(e,t,n,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=n,this._databaseInfo=s,this.user=nt.UNAUTHENTICATED,this.clientId=lc.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(n,(async o=>{K(Xn,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o})),this.appCheckCredentials.start(n,(o=>(K(Xn,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new $t;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const n=Wc(t,"Failed to shutdown persistence");e.reject(n)}})),e.promise}}async function pB(r,e){r.asyncQueue.verifyOperationInProgress(),K(Xn,"Initializing OfflineComponentProvider");const t=r.configuration;await e.initialize(t);let n=t.initialUser;r.setCredentialChangeListener((async s=>{n.isEqual(s)||(await tp(e.localStore,s),n=s)})),e.persistence.setDatabaseDeletedListener((()=>r.terminate())),r._offlineComponents=e}async function tf(r,e){r.asyncQueue.verifyOperationInProgress();const t=await ZA(r);K(Xn,"Initializing OnlineComponentProvider"),await e.initialize(t,r.configuration),r.setCredentialChangeListener((n=>Qh(e.remoteStore,n))),r.setAppCheckTokenChangeListener(((n,s)=>Qh(e.remoteStore,s))),r._onlineComponents=e}async function ZA(r){if(!r._offlineComponents)if(r._uninitializedComponentsProvider){K(Xn,"Using user provided OfflineComponentProvider");try{await pB(r,r._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!(function(s){return s.name==="FirebaseError"?s.code===F.FAILED_PRECONDITION||s.code===F.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11})(t))throw t;Gt("Error using user provided cache. Falling back to memory cache: "+t),await pB(r,new Mo)}}else K(Xn,"Using default OfflineComponentProvider"),await pB(r,new gp(void 0));return r._offlineComponents}async function eu(r){return r._onlineComponents||(r._uninitializedComponentsProvider?(K(Xn,"Using user provided OnlineComponentProvider"),await tf(r,r._uninitializedComponentsProvider._online)):(K(Xn,"Using default OnlineComponentProvider"),await tf(r,new Go))),r._onlineComponents}function eR(r){return eu(r).then((e=>e.syncEngine))}function tR(r){return eu(r).then((e=>e.datastore))}async function Uo(r){const e=await eu(r),t=e.eventManager;return t.onListen=VA.bind(null,e.syncEngine),t.onUnlisten=GA.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=xA.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=UA.bind(null,e.syncEngine),t}function nR(r,e,t,n){const s=new qc(n),i=new Yc(e,s,t);return r.asyncQueue.enqueueAndForget((async()=>zc(await Uo(r),i))),()=>{s.Aa(),r.asyncQueue.enqueueAndForget((async()=>Qc(await Uo(r),i)))}}function mp(r,e,t={}){const n=new $t;return r.asyncQueue.enqueueAndForget((async()=>(function(i,o,B,c,u){const h=new qc({next:p=>{h.Aa(),o.enqueueAndForget((()=>Qc(i,C)));const I=p.docs.has(B);!I&&p.fromCache?u.reject(new J(F.UNAVAILABLE,"Failed to get document because the client is offline.")):I&&p.fromCache&&c&&c.source==="server"?u.reject(new J(F.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):u.resolve(p)},error:p=>u.reject(p)}),C=new Yc(aa(B.path),h,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return zc(i,C)})(await Uo(r),r.asyncQueue,e,t,n))),n.promise}function rR(r,e,t={}){const n=new $t;return r.asyncQueue.enqueueAndForget((async()=>(function(i,o,B,c,u){const h=new qc({next:p=>{h.Aa(),o.enqueueAndForget((()=>Qc(i,C))),p.fromCache&&c.source==="server"?u.reject(new J(F.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):u.resolve(p)},error:p=>u.reject(p)}),C=new Yc(B instanceof Ws?FT(B):B,h,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return zc(i,C)})(await Uo(r),r.asyncQueue,e,t,n))),n.promise}function sR(r,e){const t=new $t;return r.asyncQueue.enqueueAndForget((async()=>HA(await eR(r),e,t))),t.promise}function iR(r,e,t){const n=new $t;return r.asyncQueue.enqueueAndForget((async()=>{const s=await tR(r);new YA(r.asyncQueue,s,t,e,n).Nc()})),n.promise}/**
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
 */let Ho=class{constructor(e,t,n,s,i){this._firestore=e,this._userDataWriter=t,this._key=n,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new Ae(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new oR(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return((e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const t=this._document.data.field(mr("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}},oR=class extends Ho{data(){return super.data()}};/**
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
 */class Ep{convertValue(e,t="none"){switch(Ge(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ve(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(jn(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw Y(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const n={};return Zn(e,((s,i)=>{n[s]=this.convertValue(i,t)})),n}convertVectorValue(e){var n,s,i;const t=(i=(s=(n=e.fields)==null?void 0:n[si].arrayValue)==null?void 0:s.values)==null?void 0:i.map((o=>ve(o.doubleValue)));return new mt(t)}convertGeoPoint(e){return new Qt(ve(e.latitude),ve(e.longitude))}convertArray(e,t){return(e.values||[]).map((n=>this.convertValue(n,t)))}convertServerTimestamp(e,t){switch(t){case"previous":const n=Ai(e);return n==null?null:this.convertValue(n,t);case"estimate":return this.convertTimestamp(jr(e));default:return null}}convertTimestamp(e){const t=Jn(e);return new ye(t.seconds,t.nanos)}convertDocumentKey(e,t){const n=de.fromString(e);Q(_d(n),9688,{name:e});const s=new ni(n.get(1),n.get(3)),i=new X(n.popFirst(5));return s.isEqual(t)||dn(`A document reference to ${i} refers to a different database (${s.projectId}/${s.database}), which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
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
 */function tu(r,e,t){let n;return n=r?t&&(t.merge||t.mergeFields)?r.toFirestore(e,t):r.toFirestore(e):e,n}class aR extends Ep{constructor(e){super(),this.firestore=e}convertBytes(e){return new Tt(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Ae(this.firestore,null,t)}}/**
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
 */const nf="AsyncQueue";class rf{constructor(e=Promise.resolve()){this.qc=[],this.$c=!1,this.Kc=[],this.Qc=null,this.Wc=!1,this.Gc=!1,this.zc=[],this.jt=new _c(this,"async_queue_retry"),this.jc=()=>{const n=dB();n&&K(nf,"Visibility state changed to "+n.visibilityState),this.jt.qt()},this.Hc=e;const t=dB();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.jc)}get isShuttingDown(){return this.$c}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Jc(),this.Yc(e)}enterRestrictedMode(e){if(!this.$c){this.$c=!0,this.Gc=e||!1;const t=dB();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.jc)}}enqueue(e){if(this.Jc(),this.$c)return new Promise((()=>{}));const t=new $t;return this.Yc((()=>this.$c&&this.Gc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.qc.push(e),this.Zc())))}async Zc(){if(this.qc.length!==0){try{await this.qc[0](),this.qc.shift(),this.jt.reset()}catch(e){if(!rs(e))throw e;K(nf,"Operation failed with retryable error: "+e)}this.qc.length>0&&this.jt.Ut((()=>this.Zc()))}}Yc(e){const t=this.Hc.then((()=>(this.Wc=!0,e().catch((n=>{throw this.Qc=n,this.Wc=!1,dn("INTERNAL UNHANDLED ERROR: ",sf(n)),n})).then((n=>(this.Wc=!1,n))))));return this.Hc=t,t}enqueueAfterDelay(e,t,n){this.Jc(),this.zc.indexOf(e)>-1&&(t=0);const s=Kc.createAndSchedule(this,e,t,n,(i=>this.Xc(i)));return this.Kc.push(s),s}Jc(){this.Qc&&Y(47125,{el:sf(this.Qc)})}verifyOperationInProgress(){}async tl(){let e;do e=this.Hc,await e;while(e!==this.Hc)}nl(e){for(const t of this.Kc)if(t.timerId===e)return!0;return!1}rl(e){return this.tl().then((()=>{this.Kc.sort(((t,n)=>t.targetTimeMs-n.targetTimeMs));for(const t of this.Kc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.tl()}))}il(e){this.zc.push(e)}Xc(e){const t=this.Kc.indexOf(e);this.Kc.splice(t,1)}}function sf(r){let e=r.message||"";return r.stack&&(e=r.stack.includes(r.message)?r.stack:r.message+`
`+r.stack),e}class tn extends fa{constructor(e,t,n,s){super(e,t,n,s),this.type="firestore",this._queue=new rf,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new rf(e),this._firestoreClient=void 0,await e}}}function xR(r,e,t){t||(t=ti);const n=jo(r,"firestore");if(n.isInitialized(t)){const s=n.getImmediate({identifier:t}),i=n.getOptions(t);if(Un(i,e))return s;throw new J(F.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(e.cacheSizeBytes!==void 0&&e.localCache!==void 0)throw new J(F.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(e.cacheSizeBytes!==void 0&&e.cacheSizeBytes!==-1&&e.cacheSizeBytes<Rd)throw new J(F.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return e.host&&Yr(e.host)&&zB(e.host),n.initialize({options:e,instanceIdentifier:t})}function MR(r,e){const t=typeof r=="object"?r:yf(),n=typeof r=="string"?r:ti,s=jo(t,"firestore").getImmediate({identifier:n});if(!s._initialized){const i=fg("firestore");i&&ey(s,...i)}return s}function cs(r){if(r._terminated)throw new J(F.FAILED_PRECONDITION,"The client has already been terminated.");return r._firestoreClient||BR(r),r._firestoreClient}function BR(r){var n,s,i,o;const e=r._freezeSettings(),t=Kw(r._databaseId,((n=r._app)==null?void 0:n.options.appId)||"",r._persistenceKey,(s=r._app)==null?void 0:s.options.apiKey,e);r._componentsProvider||(i=e.localCache)!=null&&i._offlineComponentProvider&&((o=e.localCache)!=null&&o._onlineComponentProvider)&&(r._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),r._firestoreClient=new XA(r._authCredentials,r._appCheckCredentials,r._queue,t,r._componentsProvider&&(function(c){const u=c==null?void 0:c._online.build();return{_offline:c==null?void 0:c._offline.build(u),_online:u}})(r._componentsProvider))}/**
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
 */class Ta extends Ep{constructor(e){super(),this.firestore=e}convertBytes(e){return new Tt(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Ae(this.firestore,null,t)}}class Fr{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Gn extends Ho{constructor(e,t,n,s,i,o){super(e,t,n,s,o),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new _o(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const n=this._document.data.field(mr("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new J(F.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=Gn._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}Gn._jsonSchemaVersion="firestore/documentSnapshot/1.0",Gn._jsonSchema={type:Ve("string",Gn._jsonSchemaVersion),bundleSource:Ve("string","DocumentSnapshot"),bundleName:Ve("string"),bundle:Ve("string")};class _o extends Gn{data(e={}){return super.data(e)}}class Cr{constructor(e,t,n,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new Fr(s.hasPendingWrites,s.fromCache),this.query=n}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((n=>{e.call(t,new _o(this._firestore,this._userDataWriter,n.key,n,new Fr(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new J(F.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(s,i){if(s._snapshot.oldDocs.isEmpty()){let o=0;return s._snapshot.docChanges.map((B=>{je(s._snapshot.query)?HB(s._snapshot.query):pc(s.query._query);const c=new _o(s._firestore,s._userDataWriter,B.doc.key,B.doc,new Fr(s._snapshot.mutatedKeys.has(B.doc.key),s._snapshot.fromCache),s.query.converter);return B.doc,{type:"added",doc:c,oldIndex:-1,newIndex:o++}}))}{let o=s._snapshot.oldDocs;return s._snapshot.docChanges.filter((B=>i||B.type!==3)).map((B=>{const c=new _o(s._firestore,s._userDataWriter,B.doc.key,B.doc,new Fr(s._snapshot.mutatedKeys.has(B.doc.key),s._snapshot.fromCache),s.query.converter);let u=-1,h=-1;return B.type!==0&&(u=o.indexOf(B.doc.key),o=o.delete(B.doc.key)),B.type!==1&&(o=o.add(B.doc),h=o.indexOf(B.doc.key)),{type:cR(B.type),doc:c,oldIndex:u,newIndex:h}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new J(F.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=Cr._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=lc.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],n=[],s=[];return this.docs.forEach((i=>{i._document!==null&&(t.push(i._document),n.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function cR(r){switch(r){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return Y(61501,{type:r})}}/**
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
 */Cr._jsonSchemaVersion="firestore/querySnapshot/1.0",Cr._jsonSchema={type:Ve("string",Cr._jsonSchemaVersion),bundleSource:Ve("string","QuerySnapshot"),bundleName:Ve("string"),bundle:Ve("string")};/**
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
 */function _p(r){if(r.limitType==="L"&&r.explicitOrderBy.length===0)throw new J(F.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class nu{}class uR extends nu{}function GR(r,e,...t){let n=[];e instanceof nu&&n.push(e),n=n.concat(t),(function(i){const o=i.filter((c=>c instanceof ru)).length,B=i.filter((c=>c instanceof Aa)).length;if(o>1||o>0&&B>0)throw new J(F.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")})(n);for(const s of n)r=s._apply(r);return r}class Aa extends uR{constructor(e,t,n){super(),this._field=e,this._op=t,this._value=n,this.type="where"}static _create(e,t,n){return new Aa(e,t,n)}_apply(e){const t=this._parse(e);return Dp(e._query,t),new Dr(e.firestore,e.converter,FB(e._query,t))}_parse(e){const t=Ca(e.firestore);return(function(i,o,B,c,u,h,C){let p;if(u.isKeyField()){if(h==="array-contains"||h==="array-contains-any")throw new J(F.INVALID_ARGUMENT,`Invalid Query. You can't perform '${h}' queries on documentId().`);if(h==="in"||h==="not-in"){af(C,h);const R=[];for(const k of C)R.push(of(c,i,k));p={arrayValue:{values:R}}}else p=of(c,i,C)}else h!=="in"&&h!=="not-in"&&h!=="array-contains-any"||af(C,h),p=ay(B,o,C,h==="in"||h==="not-in");return ke.create(u,h,p)})(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function UR(r,e,t){const n=e,s=mr("where",r);return Aa._create(s,n,t)}class ru extends nu{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new ru(e,t)}_parse(e){const t=this._queryConstraints.map((n=>n._parse(e))).filter((n=>n.getFilters().length>0));return t.length===1?t[0]:Ut.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:((function(s,i){let o=s;const B=i.getFlattenedFilters();for(const c of B)Dp(o,c),o=FB(o,c)})(e._query,t),new Dr(e.firestore,e.converter,FB(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}function of(r,e,t){if(typeof(t=oe(t))=="string"){if(t==="")throw new J(F.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!id(e)&&t.indexOf("/")!==-1)throw new J(F.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const n=e.path.child(de.fromString(t));if(!X.isDocumentKey(n))throw new J(F.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${n}' is not because it has an odd number of segments (${n.length}).`);return Dh(r,new X(n))}if(t instanceof Ae)return Dh(r,t._key);throw new J(F.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${ta(t)}.`)}function af(r,e){if(!Array.isArray(r)||r.length===0)throw new J(F.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function Dp(r,e){const t=(function(s,i){for(const o of s)for(const B of o.getFlattenedFilters())if(i.indexOf(B.op)>=0)return B.op;return null})(r.filters,(function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}})(e.op));if(t!==null)throw t===e.op?new J(F.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new J(F.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}/**
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
 */function Bf(r){return(function(t,n){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of n)if(i in s&&typeof s[i]=="function")return!0;return!1})(r,["next","error","complete"])}class lR{constructor(e){this.kind="memory",this._onlineComponentProvider=Go.provider,this._offlineComponentProvider=e!=null&&e.garbageCollector?e.garbageCollector._offlineComponentProvider:{build:()=>new gp(void 0)}}toJSON(){return{kind:this.kind}}}function HR(r){return new lR(r)}/**
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
 */const hR={maxAttempts:5};function Fs(r,e){if((r=oe(r)).firestore!==e)throw new J(F.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return r}/**
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
 */let fR=class{constructor(e,t){this._firestore=e,this._transaction=t,this._dataReader=Ca(e)}get(e){const t=Fs(e,this._firestore),n=new aR(this._firestore);return this._transaction.lookup([t._key]).then((s=>{if(!s||s.length!==1)return Y(24041);const i=s[0];if(i.isFoundDocument())return new Ho(this._firestore,n,i.key,i,t.converter);if(i.isNoDocument())return new Ho(this._firestore,n,t._key,null,t.converter);throw Y(18433,{doc:i})}))}set(e,t,n){const s=Fs(e,this._firestore),i=tu(s.converter,t,n),o=Ic(this._dataReader,"Transaction.set",s._key,i,s.converter!==null,n);return this._transaction.set(s._key,o),this}update(e,t,n,...s){const i=Fs(e,this._firestore);let o;return o=typeof(t=oe(t))=="string"||t instanceof ua?oy(this._dataReader,"Transaction.update",i._key,t,n,s):iy(this._dataReader,"Transaction.update",i._key,t),this._transaction.update(i._key,o),this}delete(e){const t=Fs(e,this._firestore);return this._transaction.delete(t._key),this}};/**
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
 */class CR extends fR{constructor(e,t){super(e,t),this._firestore=e}get(e){const t=Fs(e,this._firestore),n=new Ta(this._firestore);return super.get(e).then((s=>new Gn(this._firestore,n,t._key,s._document,new Fr(!1,!1),t.converter)))}}function jR(r,e,t){r=ht(r,tn);const n={...hR,...t};(function(o){if(o.maxAttempts<1)throw new J(F.INVALID_ARGUMENT,"Max attempts must be at least 1")})(n);const s=cs(r);return iR(s,(i=>e(new CR(r,i))),n)}/**
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
 */function qR(r){r=ht(r,Ae);const e=ht(r.firestore,tn),t=cs(e);return mp(t,r._key).then((n=>iu(e,r,n)))}function KR(r){r=ht(r,Ae);const e=ht(r.firestore,tn),t=cs(e);return mp(t,r._key,{source:"server"}).then((n=>iu(e,r,n)))}function WR(r){r=ht(r,Dr);const e=ht(r.firestore,tn),t=cs(e),n=new Ta(e);return _p(r._query),rR(t,r._query).then((s=>new Cr(e,n,r,s)))}function zR(r,e,t){r=ht(r,Ae);const n=ht(r.firestore,tn),s=tu(r.converter,e,t),i=Ca(n);return su(n,[Ic(i,"setDoc",r._key,s,r.converter!==null,t).toMutation(r._key,st.none())])}function QR(r){return su(ht(r.firestore,tn),[new oa(r._key,st.none())])}function $R(r,e){const t=ht(r.firestore,tn),n=ty(r),s=tu(r.converter,e),i=Ca(r.firestore);return su(t,[Ic(i,"addDoc",n._key,s,r.converter!==null,{}).toMutation(n._key,st.exists(!1))]).then((()=>n))}function YR(r,...e){var u,h,C;r=oe(r);let t={includeMetadataChanges:!1,source:"default"},n=0;typeof e[n]!="object"||Bf(e[n])||(t=e[n++]);const s={includeMetadataChanges:t.includeMetadataChanges,source:t.source};if(Bf(e[n])){const p=e[n];e[n]=(u=p.next)==null?void 0:u.bind(p),e[n+1]=(h=p.error)==null?void 0:h.bind(p),e[n+2]=(C=p.complete)==null?void 0:C.bind(p)}let i,o,B;if(r instanceof Ae)o=ht(r.firestore,tn),B=aa(r._key.path),i={next:p=>{e[n]&&e[n](iu(o,r,p))},error:e[n+1],complete:e[n+2]};else{const p=ht(r,Dr);o=ht(p.firestore,tn),B=p._query;const I=new Ta(o);i={next:R=>{e[n]&&e[n](new Cr(o,I,p,R))},error:e[n+1],complete:e[n+2]},_p(r._query)}const c=cs(o);return nR(c,B,s,i)}function su(r,e){const t=cs(r);return sR(t,e)}function iu(r,e,t){const n=t.docs.get(e._key),s=new Ta(r);return new Gn(r,s,e._key,n,new Fr(t.hasPendingWrites,t.fromCache),e.converter)}const cf="@firebase/firestore",uf="4.17.1";(function(e,t=!0){gI(Xr),Hr(new dr("firestore",((n,{instanceIdentifier:s,options:i})=>{const o=n.getProvider("app").getImmediate(),B=new tn(new Ow(n.getProvider("auth-internal")),new Lw(o,n.getProvider("app-check-internal")),AI(o,s),o);return i={useFetchStreams:t,...i},B._setSettings(i),B}),"PUBLIC").setMultipleInstances(!0)),Ln(cf,uf,e),Ln(cf,uf,"esm2020")})();/*! Capacitor: https://capacitorjs.com/ - MIT License */var Qr;(function(r){r.Unimplemented="UNIMPLEMENTED",r.Unavailable="UNAVAILABLE"})(Qr||(Qr={}));class gB extends Error{constructor(e,t,n){super(e),this.message=e,this.code=t,this.data=n}}const dR=r=>{var e,t;return r!=null&&r.androidBridge?"android":!((t=(e=r==null?void 0:r.webkit)===null||e===void 0?void 0:e.messageHandlers)===null||t===void 0)&&t.bridge?"ios":"web"},pR=r=>{const e=r.CapacitorCustomPlatform||null,t=r.Capacitor||{},n=t.Plugins=t.Plugins||{},s=()=>e!==null?e.name:dR(r),i=()=>s()!=="web",o=C=>{const p=u.get(C);return!!(p!=null&&p.platforms.has(s())||B(C))},B=C=>{var p;return(p=t.PluginHeaders)===null||p===void 0?void 0:p.find(I=>I.name===C)},c=C=>r.console.error(C),u=new Map,h=(C,p={})=>{const I=u.get(C);if(I)return console.warn(`Capacitor plugin "${C}" already registered. Cannot register plugins twice.`),I.proxy;const R=s(),k=B(C);let M;const z=async()=>(!M&&R in p?M=typeof p[R]=="function"?M=await p[R]():M=p[R]:e!==null&&!M&&"web"in p&&(M=typeof p.web=="function"?M=await p.web():M=p.web),M),re=(E,D)=>{var A,w;if(k){const P=k==null?void 0:k.methods.find(_=>D===_.name);if(P)return P.rtype==="promise"?_=>t.nativePromise(C,D.toString(),_):(_,Ue)=>t.nativeCallback(C,D.toString(),_,Ue);if(E)return(A=E[D])===null||A===void 0?void 0:A.bind(E)}else{if(E)return(w=E[D])===null||w===void 0?void 0:w.bind(E);throw new gB(`"${C}" plugin is not implemented on ${R}`,Qr.Unimplemented)}},pe=E=>{let D;const A=(...w)=>{const P=z().then(_=>{const Ue=re(_,E);if(Ue){const Ot=Ue(...w);return D=Ot==null?void 0:Ot.remove,Ot}else throw new gB(`"${C}.${E}()" is not implemented on ${R}`,Qr.Unimplemented)});return E==="addListener"&&(P.remove=async()=>D()),P};return A.toString=()=>`${E.toString()}() { [capacitor code] }`,Object.defineProperty(A,"name",{value:E,writable:!1,configurable:!1}),A},Se=pe("addListener"),Oe=pe("removeListener"),Te=(E,D)=>{const A=Se({eventName:E},D),w=async()=>{const _=await A;Oe({eventName:E,callbackId:_},D)},P=new Promise(_=>A.then(()=>_({remove:w})));return P.remove=async()=>{console.warn("Using addListener() without 'await' is deprecated."),await w()},P},v=new Proxy({},{get(E,D){switch(D){case"$$typeof":return;case"toJSON":return()=>({});case"addListener":return k?Te:Se;case"removeListener":return Oe;default:return pe(D)}}});return n[C]=v,u.set(C,{name:C,proxy:v,platforms:new Set([...Object.keys(p),...k?[R]:[]])}),v};return t.convertFileSrc||(t.convertFileSrc=C=>C),t.getPlatform=s,t.handleError=c,t.isNativePlatform=i,t.isPluginAvailable=o,t.registerPlugin=h,t.Exception=gB,t.DEBUG=!!t.DEBUG,t.isLoggingEnabled=!!t.isLoggingEnabled,t},gR=r=>r.Capacitor=pR(r),WB=gR(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),Ra=WB.registerPlugin;class va{constructor(){this.listeners={},this.retainedEventArguments={},this.windowListeners={}}addListener(e,t){let n=!1;this.listeners[e]||(this.listeners[e]=[],n=!0),this.listeners[e].push(t);const i=this.windowListeners[e];i&&!i.registered&&this.addWindowListener(i),n&&this.sendRetainedArgumentsForEvent(e);const o=async()=>this.removeListener(e,t);return Promise.resolve({remove:o})}async removeAllListeners(){this.listeners={};for(const e in this.windowListeners)this.removeWindowListener(this.windowListeners[e]);this.windowListeners={}}notifyListeners(e,t,n){const s=this.listeners[e];if(!s){if(n){let i=this.retainedEventArguments[e];i||(i=[]),i.push(t),this.retainedEventArguments[e]=i}return}s.forEach(i=>i(t))}hasListeners(e){var t;return!!(!((t=this.listeners[e])===null||t===void 0)&&t.length)}registerWindowListener(e,t){this.windowListeners[t]={registered:!1,windowEventName:e,pluginEventName:t,handler:n=>{this.notifyListeners(t,n)}}}unimplemented(e="not implemented"){return new WB.Exception(e,Qr.Unimplemented)}unavailable(e="not available"){return new WB.Exception(e,Qr.Unavailable)}async removeListener(e,t){const n=this.listeners[e];if(!n)return;const s=n.indexOf(t);this.listeners[e].splice(s,1),this.listeners[e].length||this.removeWindowListener(this.windowListeners[e])}addWindowListener(e){window.addEventListener(e.windowEventName,e.handler),e.registered=!0}removeWindowListener(e){e&&(window.removeEventListener(e.windowEventName,e.handler),e.registered=!1)}sendRetainedArgumentsForEvent(e){const t=this.retainedEventArguments[e];t&&(delete this.retainedEventArguments[e],t.forEach(n=>{this.notifyListeners(e,n)}))}}const lf=r=>encodeURIComponent(r).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),hf=r=>r.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent);class mR extends va{async getCookies(){const e=document.cookie,t={};return e.split(";").forEach(n=>{if(n.length<=0)return;let[s,i]=n.replace(/=/,"CAP_COOKIE").split("CAP_COOKIE");s=hf(s).trim(),i=hf(i).trim(),t[s]=i}),t}async setCookie(e){try{const t=lf(e.key),n=lf(e.value),s=e.expires?`; expires=${e.expires.replace("expires=","")}`:"",i=(e.path||"/").replace("path=",""),o=e.url!=null&&e.url.length>0?`domain=${e.url}`:"";document.cookie=`${t}=${n||""}${s}; path=${i}; ${o};`}catch(t){return Promise.reject(t)}}async deleteCookie(e){try{document.cookie=`${e.key}=; Max-Age=0`}catch(t){return Promise.reject(t)}}async clearCookies(){try{const e=document.cookie.split(";")||[];for(const t of e)document.cookie=t.replace(/^ +/,"").replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(e){return Promise.reject(e)}}async clearAllCookies(){try{await this.clearCookies()}catch(e){return Promise.reject(e)}}}Ra("CapacitorCookies",{web:()=>new mR});const ER=async r=>new Promise((e,t)=>{const n=new FileReader;n.onload=()=>{const s=n.result;e(s.indexOf(",")>=0?s.split(",")[1]:s)},n.onerror=s=>t(s),n.readAsDataURL(r)}),_R=(r={})=>{const e=Object.keys(r);return Object.keys(r).map(s=>s.toLocaleLowerCase()).reduce((s,i,o)=>(s[i]=r[e[o]],s),{})},DR=(r,e=!0)=>r?Object.entries(r).reduce((n,s)=>{const[i,o]=s;let B,c;return Array.isArray(o)?(c="",o.forEach(u=>{B=e?encodeURIComponent(u):u,c+=`${i}=${B}&`}),c.slice(0,-1)):(B=e?encodeURIComponent(o):o,c=`${i}=${B}`),`${n}&${c}`},"").substr(1):null,IR=(r,e={})=>{const t=Object.assign({method:r.method||"GET",headers:r.headers},e),s=_R(r.headers)["content-type"]||"";if(typeof r.data=="string")t.body=r.data;else if(s.includes("application/x-www-form-urlencoded")){const i=new URLSearchParams;for(const[o,B]of Object.entries(r.data||{}))i.set(o,B);t.body=i.toString()}else if(s.includes("multipart/form-data")||r.data instanceof FormData){const i=new FormData;if(r.data instanceof FormData)r.data.forEach((B,c)=>{i.append(c,B)});else for(const B of Object.keys(r.data))i.append(B,r.data[B]);t.body=i;const o=new Headers(t.headers);o.delete("content-type"),t.headers=o}else(s.includes("application/json")||typeof r.data=="object")&&(t.body=JSON.stringify(r.data));return t};class wR extends va{async request(e){const t=IR(e,e.webFetchExtra),n=DR(e.params,e.shouldEncodeUrlParams),s=n?`${e.url}?${n}`:e.url,i=await fetch(s,t),o=i.headers.get("content-type")||"";let{responseType:B="text"}=i.ok?e:{};o.includes("application/json")&&(B="json");let c,u;switch(B){case"arraybuffer":case"blob":u=await i.blob(),c=await ER(u);break;case"json":c=await i.json();break;case"document":case"text":default:c=await i.text()}const h={};return i.headers.forEach((C,p)=>{h[p]=C}),{data:c,headers:h,status:i.status,url:i.url}}async get(e){return this.request(Object.assign(Object.assign({},e),{method:"GET"}))}async post(e){return this.request(Object.assign(Object.assign({},e),{method:"POST"}))}async put(e){return this.request(Object.assign(Object.assign({},e),{method:"PUT"}))}async patch(e){return this.request(Object.assign(Object.assign({},e),{method:"PATCH"}))}async delete(e){return this.request(Object.assign(Object.assign({},e),{method:"DELETE"}))}}Ra("CapacitorHttp",{web:()=>new wR});var ff;(function(r){r.Dark="DARK",r.Light="LIGHT",r.Default="DEFAULT"})(ff||(ff={}));var Cf;(function(r){r.StatusBar="StatusBar",r.NavigationBar="NavigationBar"})(Cf||(Cf={}));class yR extends va{async setStyle(){this.unavailable("not available for web")}async setAnimation(){this.unavailable("not available for web")}async show(){this.unavailable("not available for web")}async hide(){this.unavailable("not available for web")}}Ra("SystemBars",{web:()=>new yR});var kr;(function(r){r.IndexedDbLocal="INDEXED_DB_LOCAL",r.InMemory="IN_MEMORY",r.BrowserLocal="BROWSER_LOCAL",r.BrowserSession="BROWSER_SESSION"})(kr||(kr={}));var Pn;(function(r){r.APPLE="apple.com",r.FACEBOOK="facebook.com",r.GAME_CENTER="gc.apple.com",r.GITHUB="github.com",r.GOOGLE="google.com",r.MICROSOFT="microsoft.com",r.PLAY_GAMES="playgames.google.com",r.TWITTER="twitter.com",r.YAHOO="yahoo.com",r.PASSWORD="password",r.PHONE="phone"})(Pn||(Pn={}));const XR=Ra("FirebaseAuthentication",{web:()=>sg(()=>Promise.resolve().then(()=>TR),void 0,import.meta.url).then(r=>new r.FirebaseAuthenticationWeb)});class fe extends va{constructor(){super(),this.lastConfirmationResult=new Map;const e=ae();e.onAuthStateChanged(t=>this.handleAuthStateChange(t)),e.onIdTokenChanged(t=>void this.handleIdTokenChange(t))}async applyActionCode(e){const t=ae();return ZE(t,e.oobCode)}async createUserWithEmailAndPassword(e){const t=ae(),n=await e_(t,e.email,e.password);return this.createSignInResult(n,null)}async confirmPasswordReset(e){const t=ae();return XE(t,e.oobCode,e.newPassword)}async confirmVerificationCode(e){const{verificationCode:t,verificationId:n}=e,s=this.lastConfirmationResult.get(n);if(!s)throw new Error(fe.ERROR_CONFIRMATION_RESULT_MISSING);const i=await s.confirm(t);return this.createSignInResult(i,null)}async deleteUser(){const t=ae().currentUser;if(!t)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);return I_(t)}async fetchSignInMethodsForEmail(e){const t=ae();return{signInMethods:await o_(t,e.email)}}async getPendingAuthResult(){throw this.unimplemented("Not implemented on web.")}async getCurrentUser(){const e=ae();return{user:this.createUserResult(e.currentUser)}}async getIdToken(e){const t=ae();if(!t.currentUser)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);return{token:await t.currentUser.getIdToken(e==null?void 0:e.forceRefresh)||""}}async getIdTokenResult(e){const t=ae();if(!t.currentUser)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);const n=await t.currentUser.getIdTokenResult(e==null?void 0:e.forceRefresh);return Object.assign(Object.assign({},n),{authTime:Date.parse(n.authTime),expirationTime:Date.parse(n.expirationTime),issuedAtTime:Date.parse(n.issuedAtTime)})}async getRedirectResult(){const e=ae(),t=await sD(e),n=t?Ne.credentialFromResult(t):null;return this.createSignInResult(t,n)}async getTenantId(){return{tenantId:ae().tenantId}}async isSignInWithEmailLink(e){const t=ae();return{isSignInWithEmailLink:r_(t,e.emailLink)}}async linkWithApple(e){const t=new Ne(Pn.APPLE);this.applySignInOptions(e||{},t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e==null?void 0:e.mode),s=Ne.credentialFromResult(n);return this.createSignInResult(n,s)}async linkWithEmailAndPassword(e){const t=Cn.credential(e.email,e.password),n=await this.linkCurrentUserWithCredential(t);return this.createSignInResult(n,t)}async linkWithEmailLink(e){const t=Cn.credentialWithLink(e.email,e.emailLink),n=await this.linkCurrentUserWithCredential(t);return this.createSignInResult(n,t)}async linkWithFacebook(e){const t=new bt;this.applySignInOptions(e||{},t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e==null?void 0:e.mode),s=bt.credentialFromResult(n);return this.createSignInResult(n,s)}async linkWithGameCenter(){throw this.unimplemented("Not implemented on web.")}async linkWithGithub(e){const t=new Ft;this.applySignInOptions(e||{},t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e==null?void 0:e.mode),s=Ft.credentialFromResult(n);return this.createSignInResult(n,s)}async linkWithGoogle(e){const t=new Lt;this.applySignInOptions(e||{},t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e==null?void 0:e.mode),s=Lt.credentialFromResult(n);return this.createSignInResult(n,s)}async linkWithMicrosoft(e){const t=new Ne(Pn.MICROSOFT);this.applySignInOptions(e||{},t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e==null?void 0:e.mode),s=Ne.credentialFromResult(n);return this.createSignInResult(n,s)}async linkWithOpenIdConnect(e){const t=new Ne(e.providerId);this.applySignInOptions(e,t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e.mode),s=Ne.credentialFromResult(n);return this.createSignInResult(n,s)}async linkWithPhoneNumber(e){const n=ae().currentUser;if(!n)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);if(!e.phoneNumber)throw new Error(fe.ERROR_PHONE_NUMBER_MISSING);if(!e.recaptchaVerifier||!(e.recaptchaVerifier instanceof bl))throw new Error(fe.ERROR_RECAPTCHA_VERIFIER_MISSING);try{const s=await J_(n,e.phoneNumber,e.recaptchaVerifier),{verificationId:i}=s;this.lastConfirmationResult.set(i,s);const o={verificationId:i};this.notifyListeners(fe.PHONE_CODE_SENT_EVENT,o)}catch(s){const i={message:this.getErrorMessage(s)};this.notifyListeners(fe.PHONE_VERIFICATION_FAILED_EVENT,i)}}async linkWithPlayGames(){throw this.unimplemented("Not implemented on web.")}async linkWithTwitter(e){const t=new kt;this.applySignInOptions(e||{},t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e==null?void 0:e.mode),s=kt.credentialFromResult(n);return this.createSignInResult(n,s)}async linkWithYahoo(e){const t=new Ne(Pn.YAHOO);this.applySignInOptions(e||{},t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e==null?void 0:e.mode),s=Ne.credentialFromResult(n);return this.createSignInResult(n,s)}async reload(){const t=ae().currentUser;if(!t)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);return Ff(t)}async revokeAccessToken(e){const t=ae();return D_(t,e.token)}async sendEmailVerification(e){const n=ae().currentUser;if(!n)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);return a_(n,e==null?void 0:e.actionCodeSettings)}async sendPasswordResetEmail(e){const t=ae();return YE(t,e.email,e.actionCodeSettings)}async sendSignInLinkToEmail(e){const t=ae();return n_(t,e.email,e.actionCodeSettings)}async setLanguageCode(e){const t=ae();t.languageCode=e.languageCode}async setPersistence(e){const t=ae();switch(e.persistence){case kr.BrowserLocal:await Yi(t,iC);break;case kr.BrowserSession:await Yi(t,ic);break;case kr.IndexedDbLocal:await Yi(t,lC);break;case kr.InMemory:await Yi(t,TB);break}}async setTenantId(e){const t=ae();t.tenantId=e.tenantId}async signInAnonymously(){const e=ae(),t=await KE(e);return this.createSignInResult(t,null)}async signInWithApple(e){const t=new Ne(Pn.APPLE);this.applySignInOptions(e||{},t);const n=await this.signInWithPopupOrRedirect(t,e==null?void 0:e.mode),s=Ne.credentialFromResult(n);return this.createSignInResult(n,s)}async signInWithCustomToken(e){const t=ae(),n=await $E(t,e.token);return this.createSignInResult(n,null)}async signInWithEmailAndPassword(e){const t=ae(),n=await t_(t,e.email,e.password);return this.createSignInResult(n,null)}async signInWithEmailLink(e){const t=ae(),n=await s_(t,e.email,e.emailLink);return this.createSignInResult(n,null)}async signInWithFacebook(e){const t=new bt;this.applySignInOptions(e||{},t);const n=await this.signInWithPopupOrRedirect(t,e==null?void 0:e.mode),s=bt.credentialFromResult(n);return this.createSignInResult(n,s)}async signInWithGithub(e){const t=new Ft;this.applySignInOptions(e||{},t);const n=await this.signInWithPopupOrRedirect(t,e==null?void 0:e.mode),s=Ft.credentialFromResult(n);return this.createSignInResult(n,s)}async signInWithGoogle(e){const t=new Lt;this.applySignInOptions(e||{},t);const n=await this.signInWithPopupOrRedirect(t,e==null?void 0:e.mode),s=Lt.credentialFromResult(n);return this.createSignInResult(n,s)}async signInWithMicrosoft(e){const t=new Ne(Pn.MICROSOFT);this.applySignInOptions(e||{},t);const n=await this.signInWithPopupOrRedirect(t,e==null?void 0:e.mode),s=Ne.credentialFromResult(n);return this.createSignInResult(n,s)}async signInWithOpenIdConnect(e){const t=new Ne(e.providerId);this.applySignInOptions(e,t);const n=await this.signInWithPopupOrRedirect(t,e.mode),s=Ne.credentialFromResult(n);return this.createSignInResult(n,s)}async signInWithPhoneNumber(e){if(!e.phoneNumber)throw new Error(fe.ERROR_PHONE_NUMBER_MISSING);if(!e.recaptchaVerifier||!(e.recaptchaVerifier instanceof bl))throw new Error(fe.ERROR_RECAPTCHA_VERIFIER_MISSING);const t=ae();try{const n=await H_(t,e.phoneNumber,e.recaptchaVerifier),{verificationId:s}=n;this.lastConfirmationResult.set(s,n);const i={verificationId:s};this.notifyListeners(fe.PHONE_CODE_SENT_EVENT,i)}catch(n){const s={message:this.getErrorMessage(n)};this.notifyListeners(fe.PHONE_VERIFICATION_FAILED_EVENT,s)}}async signInWithPlayGames(){throw this.unimplemented("Not implemented on web.")}async signInWithGameCenter(){throw this.unimplemented("Not implemented on web.")}async signInWithTwitter(e){const t=new kt;this.applySignInOptions(e||{},t);const n=await this.signInWithPopupOrRedirect(t,e==null?void 0:e.mode),s=kt.credentialFromResult(n);return this.createSignInResult(n,s)}async signInWithYahoo(e){const t=new Ne(Pn.YAHOO);this.applySignInOptions(e||{},t);const n=await this.signInWithPopupOrRedirect(t,e==null?void 0:e.mode),s=Ne.credentialFromResult(n);return this.createSignInResult(n,s)}async signOut(){await ae().signOut()}async unlink(e){const t=ae();if(!t.currentUser)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);const n=await WE(t.currentUser,e.providerId);return{user:this.createUserResult(n)}}async updateEmail(e){const n=ae().currentUser;if(!n)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);return l_(n,e.newEmail)}async updatePassword(e){const n=ae().currentUser;if(!n)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);return h_(n,e.newPassword)}async updateProfile(e){const n=ae().currentUser;if(!n)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);return u_(n,{displayName:e.displayName,photoURL:e.photoUrl})}async useAppLanguage(){ae().useDeviceLanguage()}async useEmulator(e){const t=ae(),n=e.port||9099,s=e.scheme||"http";e.host.includes("://")?AB(t,`${e.host}:${n}`):AB(t,`${s}://${e.host}:${n}`)}async verifyBeforeUpdateEmail(e){const n=ae().currentUser;if(!n)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);return B_(n,e==null?void 0:e.newEmail,e==null?void 0:e.actionCodeSettings)}handleAuthStateChange(e){const n={user:this.createUserResult(e)};this.notifyListeners(fe.AUTH_STATE_CHANGE_EVENT,n,!0)}async handleIdTokenChange(e){if(!e)return;const n={token:await e.getIdToken(!1)};this.notifyListeners(fe.ID_TOKEN_CHANGE_EVENT,n,!0)}applySignInOptions(e,t){if(e.customParameters){const n={};e.customParameters.map(s=>{n[s.key]=s.value}),t.setCustomParameters(n)}if(e.scopes)for(const n of e.scopes)t.addScope(n)}signInWithPopupOrRedirect(e,t){const n=ae();return t==="redirect"?eD(n,e):z_(n,e)}linkCurrentUserWithPopupOrRedirect(e,t){const n=ae();if(!n.currentUser)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);return t==="redirect"?nD(n.currentUser,e):Q_(n.currentUser,e)}linkCurrentUserWithCredential(e){const t=ae();if(!t.currentUser)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);return eC(t.currentUser,e)}requestAppTrackingTransparencyPermission(){throw this.unimplemented("Not implemented on web.")}checkAppTrackingTransparencyPermission(){throw this.unimplemented("Not implemented on web.")}createSignInResult(e,t){const n=this.createUserResult((e==null?void 0:e.user)||null),s=this.createCredentialResult(t),i=this.createAdditionalUserInfoResult(e);return{user:n,credential:s,additionalUserInfo:i}}createCredentialResult(e){if(!e)return null;const t={providerId:e.providerId};return e instanceof Yt&&(t.accessToken=e.accessToken,t.idToken=e.idToken,t.secret=e.secret),t}createUserResult(e){return e?{displayName:e.displayName,email:e.email,emailVerified:e.emailVerified,isAnonymous:e.isAnonymous,metadata:this.createUserMetadataResult(e.metadata),phoneNumber:e.phoneNumber,photoUrl:e.photoURL,providerData:this.createUserProviderDataResult(e.providerData),providerId:e.providerId,tenantId:e.tenantId,uid:e.uid}:null}createUserMetadataResult(e){const t={};return e.creationTime&&(t.creationTime=Date.parse(e.creationTime)),e.lastSignInTime&&(t.lastSignInTime=Date.parse(e.lastSignInTime)),t}createUserProviderDataResult(e){return e.map(t=>({displayName:t.displayName,email:t.email,phoneNumber:t.phoneNumber,photoUrl:t.photoURL,providerId:t.providerId,uid:t.uid}))}createAdditionalUserInfoResult(e){if(!e)return null;const t=m_(e);if(!t)return null;const{isNewUser:n,profile:s,providerId:i,username:o}=t,B={isNewUser:n};return i!==null&&(B.providerId=i),s!==null&&(B.profile=s),o!=null&&(B.username=o),B}getErrorMessage(e){return e instanceof Object&&"message"in e&&typeof e.message=="string"?e.message:JSON.stringify(e)}}fe.AUTH_STATE_CHANGE_EVENT="authStateChange";fe.ID_TOKEN_CHANGE_EVENT="idTokenChange";fe.PHONE_CODE_SENT_EVENT="phoneCodeSent";fe.PHONE_VERIFICATION_FAILED_EVENT="phoneVerificationFailed";fe.ERROR_NO_USER_SIGNED_IN="No user is signed in.";fe.ERROR_PHONE_NUMBER_MISSING="phoneNumber must be provided.";fe.ERROR_RECAPTCHA_VERIFIER_MISSING="recaptchaVerifier must be provided and must be an instance of RecaptchaVerifier.";fe.ERROR_CONFIRMATION_RESULT_MISSING="No confirmation result with this verification id was found.";const TR=Object.freeze(Object.defineProperty({__proto__:null,FirebaseAuthenticationWeb:fe},Symbol.toStringTag,{value:"Module"}));export{UR as A,LR as B,WB as C,vR as D,XR as F,Lt as G,ye as T,va as W,sg as _,yf as a,ae as b,Yi as c,iC as d,xR as e,MR as f,RR as g,KR as h,vm as i,ty as j,sD as k,rc as l,HR as m,z_ as n,PR as o,qR as p,zR as q,YR as r,SR as s,bR as t,WR as u,$R as v,jR as w,Ra as x,QR as y,GR as z};
