var Jg=Object.defineProperty;var jg=(r,e,t)=>e in r?Jg(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var G=(r,e,t)=>jg(r,typeof e!="symbol"?e+"":e,t);const qg="modulepreload",Kg=function(r,e){return new URL(r,e).href},Nl={},Wg=function(e,t,n){let s=Promise.resolve();if(t&&t.length>0){let o=function(h){return Promise.all(h.map(d=>Promise.resolve(d).then(p=>({status:"fulfilled",value:p}),p=>({status:"rejected",reason:p}))))};const B=document.getElementsByTagName("link"),c=document.querySelector("meta[property=csp-nonce]"),u=(c==null?void 0:c.nonce)||(c==null?void 0:c.getAttribute("nonce"));s=o(t.map(h=>{if(h=Kg(h,n),h in Nl)return;Nl[h]=!0;const d=h.endsWith(".css"),p=d?'[rel="stylesheet"]':"";if(!!n)for(let k=B.length-1;k>=0;k--){const M=B[k];if(M.href===h&&(!d||M.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${h}"]${p}`))return;const R=document.createElement("link");if(R.rel=d?"stylesheet":qg,d||(R.as="script"),R.crossOrigin="",R.href=h,u&&R.setAttribute("nonce",u),document.head.appendChild(R),d)return new Promise((k,M)=>{R.addEventListener("load",k),R.addEventListener("error",()=>M(new Error(`Unable to preload CSS for ${h}`)))})}))}function i(o){const B=new Event("vite:preloadError",{cancelable:!0});if(B.payload=o,window.dispatchEvent(B),!B.defaultPrevented)throw o}return s.then(o=>{for(const B of o||[])B.status==="rejected"&&i(B.reason);return e().catch(i)})},zg=()=>{};var Ll={};/**
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
 */const Kf=function(r){const e=[];let t=0;for(let n=0;n<r.length;n++){let s=r.charCodeAt(n);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&n+1<r.length&&(r.charCodeAt(n+1)&64512)===56320?(s=65536+((s&1023)<<10)+(r.charCodeAt(++n)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},Qg=function(r){const e=[];let t=0,n=0;for(;t<r.length;){const s=r[t++];if(s<128)e[n++]=String.fromCharCode(s);else if(s>191&&s<224){const i=r[t++];e[n++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=r[t++],o=r[t++],B=r[t++],c=((s&7)<<18|(i&63)<<12|(o&63)<<6|B&63)-65536;e[n++]=String.fromCharCode(55296+(c>>10)),e[n++]=String.fromCharCode(56320+(c&1023))}else{const i=r[t++],o=r[t++];e[n++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},fc={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(r,e){if(!Array.isArray(r))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let s=0;s<r.length;s+=3){const i=r[s],o=s+1<r.length,B=o?r[s+1]:0,c=s+2<r.length,u=c?r[s+2]:0,h=i>>2,d=(i&3)<<4|B>>4;let p=(B&15)<<2|u>>6,I=u&63;c||(I=64,o||(p=64)),n.push(t[h],t[d],t[p],t[I])}return n.join("")},encodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(r):this.encodeByteArray(Kf(r),e)},decodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(r):Qg(this.decodeStringToByteArray(r,e))},decodeStringToByteArray(r,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let s=0;s<r.length;){const i=t[r.charAt(s++)],B=s<r.length?t[r.charAt(s)]:0;++s;const u=s<r.length?t[r.charAt(s)]:64;++s;const d=s<r.length?t[r.charAt(s)]:64;if(++s,i==null||B==null||u==null||d==null)throw new $g;const p=i<<2|B>>4;if(n.push(p),u!==64){const I=B<<4&240|u>>2;if(n.push(I),d!==64){const R=u<<6&192|d;n.push(R)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let r=0;r<this.ENCODED_VALS.length;r++)this.byteToCharMap_[r]=this.ENCODED_VALS.charAt(r),this.charToByteMap_[this.byteToCharMap_[r]]=r,this.byteToCharMapWebSafe_[r]=this.ENCODED_VALS_WEBSAFE.charAt(r),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[r]]=r,r>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(r)]=r,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(r)]=r)}}};class $g extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Yg=function(r){const e=Kf(r);return fc.encodeByteArray(e,!0)},ko=function(r){return Yg(r).replace(/\./g,"")},Wf=function(r){try{return fc.decodeString(r,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function zf(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const Xg=()=>zf().__FIREBASE_DEFAULTS__,Zg=()=>{if(typeof process>"u"||typeof Ll>"u")return;const r=Ll.__FIREBASE_DEFAULTS__;if(r)return JSON.parse(r)},em=()=>{if(typeof document>"u")return;let r;try{r=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=r&&Wf(r[1]);return e&&JSON.parse(e)},ia=()=>{try{return zg()||Xg()||Zg()||em()}catch(r){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${r}`);return}},Qf=r=>{var e,t;return(t=(e=ia())==null?void 0:e.emulatorHosts)==null?void 0:t[r]},tm=r=>{const e=Qf(r);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const n=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),n]:[e.substring(0,t),n]},$f=()=>{var r;return(r=ia())==null?void 0:r.config},Yf=r=>{var e;return(e=ia())==null?void 0:e[`_${r}`]};/**
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
 */class $r{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,n)=>{t?this.reject(t):this.resolve(n),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,n))}}}/**
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
 */function nm(r,e){if(r.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},n=e||"demo-project",s=r.iat||0,i=r.sub||r.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${n}`,aud:n,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}},...r};return[ko(JSON.stringify(t)),ko(JSON.stringify(o)),""].join(".")}/**
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
 */function at(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function rm(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(at())}function sm(){var e;const r=(e=ia())==null?void 0:e.forceEnvironment;if(r==="node")return!0;if(r==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function im(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function om(){const r=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof r=="object"&&r.id!==void 0}function am(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Bm(){const r=at();return r.indexOf("MSIE ")>=0||r.indexOf("Trident/")>=0}function cm(){return!sm()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function dc(){try{return typeof indexedDB=="object"}catch{return!1}}function um(){return new Promise((r,e)=>{try{let t=!0;const n="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(n);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(n),r(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)==null?void 0:i.message)||"")}}catch(t){e(t)}})}/**
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
 */const lm="FirebaseError";class yn extends Error{constructor(e,t,n){super(t),this.code=e,this.customData=n,this.name=lm,Object.setPrototypeOf(this,yn.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,os.prototype.create)}}class os{constructor(e,t,n){this.service=e,this.serviceName=t,this.errors=n}create(e,...t){const n=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?hm(i,n):"Error",B=`${this.serviceName}: ${o} (${s}).`;return new yn(s,B,n)}}function hm(r,e){try{let t=0,n="";for(;t<r.length;){const s=r.indexOf("{$",t);if(s===-1){n+=r.substring(t);break}const i=r.indexOf("}",s+2);if(i===-1){n+=r.substring(t);break}const o=r.substring(s+2,i),B=e[o];n+=r.substring(t,s)+(B!=null?String(B):`<${o}?>`),t=i+1}return n}catch{return r}}function fm(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}function pn(r,e){if(r===e)return!0;const t=Object.keys(r),n=Object.keys(e);for(const s of t){if(!n.includes(s))return!1;const i=r[s],o=e[s];if(Fl(i)&&Fl(o)){if(!pn(i,o))return!1}else if(i!==o)return!1}for(const s of n)if(!t.includes(s))return!1;return!0}function Fl(r){return r!==null&&typeof r=="object"}/**
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
 */function as(r){const e=[];for(const[t,n]of Object.entries(r))Array.isArray(n)?n.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(n));return e.length?"&"+e.join("&"):""}function Js(r){const e={};return r.replace(/^\?/,"").split("&").forEach(n=>{if(n){const[s,i]=n.split("=");e[decodeURIComponent(s)]=decodeURIComponent(i)}}),e}function js(r){const e=r.indexOf("?");if(!e)return"";const t=r.indexOf("#",e);return r.substring(e,t>0?t:void 0)}function dm(r,e){const t=new Cm(r,e);return t.subscribe.bind(t)}class Cm{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(n=>{this.error(n)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,n){let s;if(e===void 0&&t===void 0&&n===void 0)throw new Error("Missing Observer.");pm(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:n},s.next===void 0&&(s.next=CB),s.error===void 0&&(s.error=CB),s.complete===void 0&&(s.complete=CB);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(n){typeof console<"u"&&console.error&&console.error(n)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function pm(r,e){if(typeof r!="object"||r===null)return!1;for(const t of e)if(t in r&&typeof r[t]=="function")return!0;return!1}function CB(){}/**
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
 */const gm=1e3,mm=2,Em=14400*1e3,_m=.5;function Dm(r,e=gm,t=mm){const n=e*Math.pow(t,r),s=Math.round(_m*n*(Math.random()-.5)*2);return Math.min(Em,n+s)}/**
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
 */function se(r){return r&&r._delegate?r._delegate:r}/**
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
 */function Bs(r){try{return(r.startsWith("http://")||r.startsWith("https://")?new URL(r).hostname:r).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Cc(r){return(await fetch(r,{credentials:"include"})).ok}class gn{constructor(e,t,n){this.name=e,this.instanceFactory=t,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const fr="[DEFAULT]";/**
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
 */class Im{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const n=new $r;if(this.instancesDeferred.set(t,n),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&n.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),n=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(s){if(n)return null;throw s}else{if(n)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(ym(e))try{this.getOrInitializeService({instanceIdentifier:fr})}catch{}for(const[t,n]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});n.resolve(i)}catch{}}}}clearInstance(e=fr){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=fr){return this.instances.has(e)}getOptions(e=fr){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:n,options:t});for(const[i,o]of this.instancesDeferred.entries()){const B=this.normalizeInstanceIdentifier(i);n===B&&o.resolve(s)}return s}onInit(e,t){const n=this.normalizeInstanceIdentifier(t),s=this.onInitCallbacks.get(n)??new Set;s.add(e),this.onInitCallbacks.set(n,s);const i=this.instances.get(n);return i&&e(i,n),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const n=this.onInitCallbacks.get(t);if(n)for(const s of n)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:wm(e),options:t}),this.instances.set(e,n),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch{}return n||null}normalizeInstanceIdentifier(e=fr){return this.component?this.component.multipleInstances?e:fr:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function wm(r){return r===fr?void 0:r}function ym(r){return r.instantiationMode==="EAGER"}/**
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
 */class Tm{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Im(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var ce;(function(r){r[r.DEBUG=0]="DEBUG",r[r.VERBOSE=1]="VERBOSE",r[r.INFO=2]="INFO",r[r.WARN=3]="WARN",r[r.ERROR=4]="ERROR",r[r.SILENT=5]="SILENT"})(ce||(ce={}));const Am={debug:ce.DEBUG,verbose:ce.VERBOSE,info:ce.INFO,warn:ce.WARN,error:ce.ERROR,silent:ce.SILENT},Rm=ce.INFO,vm={[ce.DEBUG]:"log",[ce.VERBOSE]:"log",[ce.INFO]:"info",[ce.WARN]:"warn",[ce.ERROR]:"error"},Pm=(r,e,...t)=>{if(e<r.logLevel)return;const n=new Date().toISOString(),s=vm[e];if(s)console[s](`[${n}]  ${r.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class oa{constructor(e){this.name=e,this._logLevel=Rm,this._logHandler=Pm,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in ce))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Am[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,ce.DEBUG,...e),this._logHandler(this,ce.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,ce.VERBOSE,...e),this._logHandler(this,ce.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,ce.INFO,...e),this._logHandler(this,ce.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,ce.WARN,...e),this._logHandler(this,ce.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,ce.ERROR,...e),this._logHandler(this,ce.ERROR,...e)}}const Sm=(r,e)=>e.some(t=>r instanceof t);let kl,Vl;function Om(){return kl||(kl=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function bm(){return Vl||(Vl=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Xf=new WeakMap,VB=new WeakMap,Zf=new WeakMap,pB=new WeakMap,pc=new WeakMap;function Nm(r){const e=new Promise((t,n)=>{const s=()=>{r.removeEventListener("success",i),r.removeEventListener("error",o)},i=()=>{t(Un(r.result)),s()},o=()=>{n(r.error),s()};r.addEventListener("success",i),r.addEventListener("error",o)});return e.then(t=>{t instanceof IDBCursor&&Xf.set(t,r)}).catch(()=>{}),pc.set(e,r),e}function Lm(r){if(VB.has(r))return;const e=new Promise((t,n)=>{const s=()=>{r.removeEventListener("complete",i),r.removeEventListener("error",o),r.removeEventListener("abort",o)},i=()=>{t(),s()},o=()=>{n(r.error||new DOMException("AbortError","AbortError")),s()};r.addEventListener("complete",i),r.addEventListener("error",o),r.addEventListener("abort",o)});VB.set(r,e)}let xB={get(r,e,t){if(r instanceof IDBTransaction){if(e==="done")return VB.get(r);if(e==="objectStoreNames")return r.objectStoreNames||Zf.get(r);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return Un(r[e])},set(r,e,t){return r[e]=t,!0},has(r,e){return r instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in r}};function Fm(r){xB=r(xB)}function km(r){return r===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const n=r.call(gB(this),e,...t);return Zf.set(n,e.sort?e.sort():[e]),Un(n)}:bm().includes(r)?function(...e){return r.apply(gB(this),e),Un(Xf.get(this))}:function(...e){return Un(r.apply(gB(this),e))}}function Vm(r){return typeof r=="function"?km(r):(r instanceof IDBTransaction&&Lm(r),Sm(r,Om())?new Proxy(r,xB):r)}function Un(r){if(r instanceof IDBRequest)return Nm(r);if(pB.has(r))return pB.get(r);const e=Vm(r);return e!==r&&(pB.set(r,e),pc.set(e,r)),e}const gB=r=>pc.get(r);function xm(r,e,{blocked:t,upgrade:n,blocking:s,terminated:i}={}){const o=indexedDB.open(r,e),B=Un(o);return n&&o.addEventListener("upgradeneeded",c=>{n(Un(o.result),c.oldVersion,c.newVersion,Un(o.transaction),c)}),t&&o.addEventListener("blocked",c=>t(c.oldVersion,c.newVersion,c)),B.then(c=>{i&&c.addEventListener("close",()=>i()),s&&c.addEventListener("versionchange",u=>s(u.oldVersion,u.newVersion,u))}).catch(()=>{}),B}const Mm=["get","getKey","getAll","getAllKeys","count"],Gm=["put","add","delete","clear"],mB=new Map;function xl(r,e){if(!(r instanceof IDBDatabase&&!(e in r)&&typeof e=="string"))return;if(mB.get(e))return mB.get(e);const t=e.replace(/FromIndex$/,""),n=e!==t,s=Gm.includes(t);if(!(t in(n?IDBIndex:IDBObjectStore).prototype)||!(s||Mm.includes(t)))return;const i=async function(o,...B){const c=this.transaction(o,s?"readwrite":"readonly");let u=c.store;return n&&(u=u.index(B.shift())),(await Promise.all([u[t](...B),s&&c.done]))[0]};return mB.set(e,i),i}Fm(r=>({...r,get:(e,t,n)=>xl(e,t)||r.get(e,t,n),has:(e,t)=>!!xl(e,t)||r.has(e,t)}));/**
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
 */class Um{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(Hm(t)){const n=t.getImmediate();return`${n.library}/${n.version}`}else return null}).filter(t=>t).join(" ")}}function Hm(r){const e=r.getComponent();return(e==null?void 0:e.type)==="VERSION"}const MB="@firebase/app",Ml="0.16.1";/**
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
 */const mn=new oa("@firebase/app"),Jm="@firebase/app-compat",jm="@firebase/analytics-compat",qm="@firebase/analytics",Km="@firebase/app-check-compat",Wm="@firebase/app-check",zm="@firebase/auth",Qm="@firebase/auth-compat",$m="@firebase/database",Ym="@firebase/data-connect",Xm="@firebase/database-compat",Zm="@firebase/functions",eE="@firebase/functions-compat",tE="@firebase/installations",nE="@firebase/installations-compat",rE="@firebase/messaging",sE="@firebase/messaging-compat",iE="@firebase/performance",oE="@firebase/performance-compat",aE="@firebase/remote-config",BE="@firebase/remote-config-compat",cE="@firebase/storage",uE="@firebase/storage-compat",lE="@firebase/firestore",hE="@firebase/ai",fE="@firebase/firestore-compat",dE="firebase",CE="12.18.0";/**
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
 */const GB="[DEFAULT]",pE={[MB]:"fire-core",[Jm]:"fire-core-compat",[qm]:"fire-analytics",[jm]:"fire-analytics-compat",[Wm]:"fire-app-check",[Km]:"fire-app-check-compat",[zm]:"fire-auth",[Qm]:"fire-auth-compat",[$m]:"fire-rtdb",[Ym]:"fire-data-connect",[Xm]:"fire-rtdb-compat",[Zm]:"fire-fn",[eE]:"fire-fn-compat",[tE]:"fire-iid",[nE]:"fire-iid-compat",[rE]:"fire-fcm",[sE]:"fire-fcm-compat",[iE]:"fire-perf",[oE]:"fire-perf-compat",[aE]:"fire-rc",[BE]:"fire-rc-compat",[cE]:"fire-gcs",[uE]:"fire-gcs-compat",[lE]:"fire-fst",[fE]:"fire-fst-compat",[hE]:"fire-vertex","fire-js":"fire-js",[dE]:"fire-js-all"};/**
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
 */const Bi=new Map,gE=new Map,UB=new Map;function Gl(r,e){try{r.container.addComponent(e)}catch(t){mn.debug(`Component ${e.name} failed to register with FirebaseApp ${r.name}`,t)}}function zn(r){const e=r.name;if(UB.has(e))return mn.debug(`There were multiple attempts to register component ${e}.`),!1;UB.set(e,r);for(const t of Bi.values())Gl(t,r);for(const t of gE.values())Gl(t,r);return!0}function cs(r,e){const t=r.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),r.container.getProvider(e)}function ke(r){return r==null?!1:r.settings!==void 0}/**
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
 */const mE={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different {$mismatchedParam}. Existing: '{$oldValue}'. New: '{$newValue}'.","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Bn=new os("app","Firebase",mE);/**
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
 */class EE{constructor(e,t,n){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new gn("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Bn.create("app-deleted",{appName:this._name})}}/**
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
 */const us=CE;function _E(r,e={}){let t=r;typeof e!="object"&&(e={name:e});const n={name:GB,automaticDataCollectionEnabled:!0,...e},s=n.name;if(typeof s!="string"||!s)throw Bn.create("bad-app-name",{appName:String(s)});if(t||(t=$f()),!t)throw Bn.create("no-options");const i=Bi.get(s);if(i)if(pn(t,i.options)){if(pn(n,i.config))return i;throw Bn.create("duplicate-app",{appName:s,mismatchedParam:"config",oldValue:JSON.stringify(i.config),newValue:JSON.stringify(n)})}else throw Bn.create("duplicate-app",{appName:s,mismatchedParam:"options",oldValue:JSON.stringify(i.options),newValue:JSON.stringify(t)});const o=new Tm(s);for(const c of UB.values())o.addComponent(c);const B=new EE(t,n,o);return Bi.set(s,B),B}function gc(r=GB){const e=Bi.get(r);if(!e&&r===GB&&$f())return _E();if(!e)throw Bn.create("no-app",{appName:r});return e}function nP(){return Array.from(Bi.values())}function dn(r,e,t){let n=pE[r]??r;t&&(n+=`-${t}`);const s=n.match(/\s|\//),i=e.match(/\s|\//);if(s||i){const o=[`Unable to register library "${n}" with version "${e}":`];s&&o.push(`library name "${n}" contains illegal characters (whitespace or "/")`),s&&i&&o.push("and"),i&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),mn.warn(o.join(" "));return}zn(new gn(`${n}-version`,()=>({library:n,version:e}),"VERSION"))}/**
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
 */const DE="firebase-heartbeat-database",IE=1,ci="firebase-heartbeat-store";let EB=null;function ed(){return EB||(EB=xm(DE,IE,{upgrade:(r,e)=>{switch(e){case 0:try{r.createObjectStore(ci)}catch(t){console.warn(t)}}}}).catch(r=>{throw Bn.create("idb-open",{originalErrorMessage:r.message})})),EB}async function wE(r){try{const t=(await ed()).transaction(ci),n=await t.objectStore(ci).get(td(r));return await t.done,n}catch(e){if(e instanceof yn)mn.warn(e.message);else{const t=Bn.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});mn.warn(t.message)}}}async function Ul(r,e){try{const n=(await ed()).transaction(ci,"readwrite");await n.objectStore(ci).put(e,td(r)),await n.done}catch(t){if(t instanceof yn)mn.warn(t.message);else{const n=Bn.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});mn.warn(n.message)}}}function td(r){return`${r.name}!${r.options.appId}`}/**
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
 */const yE=1024,TE=30;class AE{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new vE(t),this._heartbeatsCachePromise=this._storage.read().then(n=>(this._heartbeatsCache=n,n))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=Hl();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats.length>TE){const o=PE(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(n){mn.warn(n)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Hl(),{heartbeatsToSend:n,unsentEntries:s}=RE(this._heartbeatsCache.heartbeats),i=ko(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return mn.warn(t),""}}}function Hl(){return new Date().toISOString().substring(0,10)}function RE(r,e=yE){const t=[];let n=r.slice();for(const s of r){const i=t.find(o=>o.agent===s.agent);if(i){if(i.dates.push(s.date),Jl(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),Jl(t)>e){t.pop();break}n=n.slice(1)}return{heartbeatsToSend:t,unsentEntries:n}}class vE{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return dc()?um().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await wE(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return Ul(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return Ul(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:[...n.heartbeats,...e.heartbeats]})}else return}}function Jl(r){return ko(JSON.stringify({version:2,heartbeats:r})).length}function PE(r){if(r.length===0)return-1;let e=0,t=r[0].date;for(let n=1;n<r.length;n++)r[n].date<t&&(t=r[n].date,e=n);return e}/**
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
 */function SE(r){zn(new gn("platform-logger",e=>new Um(e),"PRIVATE")),zn(new gn("heartbeat",e=>new AE(e),"PRIVATE")),dn(MB,Ml,r),dn(MB,Ml,"esm2020"),dn("fire-js","")}/**
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
 */SE("");var OE="firebase",bE="12.18.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */dn(OE,bE,"app");/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const HB=new Map,nd={activated:!1,tokenObservers:[]},NE={initialized:!1,enabled:!1};function Ke(r){return HB.get(r)||{...nd}}function LE(r,e){return HB.set(r,e),HB.get(r)}function aa(){return NE}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rd="https://content-firebaseappcheck.googleapis.com/v1",FE="exchangeRecaptchaV3Token",kE="exchangeDebugToken",jl={RETRIAL_MIN_WAIT:30*1e3,RETRIAL_MAX_WAIT:960*1e3},VE=1440*60*1e3;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xE{constructor(e,t,n,s,i){if(this.operation=e,this.retryPolicy=t,this.getWaitDuration=n,this.lowerBound=s,this.upperBound=i,this.pending=null,this.nextErrorWaitInterval=s,s>i)throw new Error("Proactive refresh lower bound greater than upper bound!")}start(){this.nextErrorWaitInterval=this.lowerBound,this.process(!0).catch(()=>{})}stop(){this.pending&&(this.pending.reject("cancelled"),this.pending=null)}isRunning(){return!!this.pending}async process(e){this.stop();try{this.pending=new $r,this.pending.promise.catch(t=>{}),await ME(this.getNextRun(e)),this.pending.resolve(),await this.pending.promise,this.pending=new $r,this.pending.promise.catch(t=>{}),await this.operation(),this.pending.resolve(),await this.pending.promise,this.process(!0).catch(()=>{})}catch(t){this.retryPolicy(t)?this.process(!1).catch(()=>{}):this.stop()}}getNextRun(e){if(e)return this.nextErrorWaitInterval=this.lowerBound,this.getWaitDuration();{const t=this.nextErrorWaitInterval;return this.nextErrorWaitInterval*=2,this.nextErrorWaitInterval>this.upperBound&&(this.nextErrorWaitInterval=this.upperBound),t}}}function ME(r){return new Promise(e=>{setTimeout(e,r)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const GE={"already-initialized":"You have already called initializeAppCheck() for FirebaseApp {$appName} with different options. To avoid this error, call initializeAppCheck() with the same options as when it was originally called. This will return the already initialized instance.","use-before-activation":"App Check is being used before initializeAppCheck() is called for FirebaseApp {$appName}. Call initializeAppCheck() before instantiating other Firebase services.","fetch-network-error":"Fetch failed to connect to a network. Check Internet connection. Original error: {$originalErrorMessage}.","fetch-parse-error":"Fetch client could not parse response. Original error: {$originalErrorMessage}.","fetch-status-error":"Fetch server returned an HTTP error status. HTTP status: {$httpStatus}.","storage-open":"Error thrown when opening storage. Original error: {$originalErrorMessage}.","storage-get":"Error thrown when reading from storage. Original error: {$originalErrorMessage}.","storage-set":"Error thrown when writing to storage. Original error: {$originalErrorMessage}.","recaptcha-error":"ReCAPTCHA error.","initial-throttle":"{$httpStatus} error. Attempts allowed again after {$time}",throttled:"Requests throttled due to previous {$httpStatus} error. Attempts allowed again after {$time}"},mt=new os("appCheck","AppCheck",GE);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ql(r=!1){var e;return r?(e=self.grecaptcha)==null?void 0:e.enterprise:self.grecaptcha}function mc(r){if(!Ke(r).activated)throw mt.create("use-before-activation",{appName:r.name})}function sd(r){const e=Math.round(r/1e3),t=Math.floor(e/(3600*24)),n=Math.floor((e-t*3600*24)/3600),s=Math.floor((e-t*3600*24-n*3600)/60),i=e-t*3600*24-n*3600-s*60;let o="";return t&&(o+=co(t)+"d:"),n&&(o+=co(n)+"h:"),o+=co(s)+"m:"+co(i)+"s",o}function co(r){return r===0?"00":r>=10?r.toString():"0"+r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ec({url:r,body:e},t){const n={"Content-Type":"application/json"},s=t.getImmediate({optional:!0});if(s){const d=await s.getHeartbeatsHeader();d&&(n["X-Firebase-Client"]=d)}const i={method:"POST",body:JSON.stringify(e),headers:n};let o;try{o=await fetch(r,i)}catch(d){throw mt.create("fetch-network-error",{originalErrorMessage:d==null?void 0:d.message})}if(o.status!==200)throw mt.create("fetch-status-error",{httpStatus:o.status});let B;try{B=await o.json()}catch(d){throw mt.create("fetch-parse-error",{originalErrorMessage:d==null?void 0:d.message})}const c=B.ttl.match(/^([\d.]+)(s)$/);if(!c||!c[2]||isNaN(Number(c[1])))throw mt.create("fetch-parse-error",{originalErrorMessage:`ttl field (timeToLive) is not in standard Protobuf Duration format: ${B.ttl}`});const u=Number(c[1])*1e3,h=Date.now();return{token:B.token,expireTimeMillis:h+u,issuedAtTimeMillis:h}}function UE(r,e){const{projectId:t,appId:n,apiKey:s}=r.options;return{url:`${rd}/projects/${t}/apps/${n}:${FE}?key=${s}`,body:{recaptcha_v3_token:e}}}function id(r,e){const{projectId:t,appId:n,apiKey:s}=r.options;return{url:`${rd}/projects/${t}/apps/${n}:${kE}?key=${s}`,body:{debug_token:e}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const HE="firebase-app-check-database",JE=1,ui="firebase-app-check-store",od="debug-token";let uo=null;function ad(){return uo||(uo=new Promise((r,e)=>{try{const t=indexedDB.open(HE,JE);t.onsuccess=n=>{r(n.target.result)},t.onerror=n=>{var s;e(mt.create("storage-open",{originalErrorMessage:(s=n.target.error)==null?void 0:s.message}))},t.onupgradeneeded=n=>{const s=n.target.result;switch(n.oldVersion){case 0:s.createObjectStore(ui,{keyPath:"compositeKey"})}}}catch(t){e(mt.create("storage-open",{originalErrorMessage:t==null?void 0:t.message}))}}),uo)}function jE(r){return cd(ud(r))}function qE(r,e){return Bd(ud(r),e)}function KE(r){return Bd(od,r)}function WE(){return cd(od)}async function Bd(r,e){const n=(await ad()).transaction(ui,"readwrite"),i=n.objectStore(ui).put({compositeKey:r,value:e});return new Promise((o,B)=>{i.onsuccess=c=>{o()},n.onerror=c=>{var u;B(mt.create("storage-set",{originalErrorMessage:(u=c.target.error)==null?void 0:u.message}))}})}async function cd(r){const t=(await ad()).transaction(ui,"readonly"),s=t.objectStore(ui).get(r);return new Promise((i,o)=>{s.onsuccess=B=>{const c=B.target.result;i(c?c.value:void 0)},t.onerror=B=>{var c;o(mt.create("storage-get",{originalErrorMessage:(c=B.target.error)==null?void 0:c.message}))}})}function ud(r){return`${r.options.appId}-${r.name}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xn=new oa("@firebase/app-check");/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function zE(r){if(dc()){let e;try{e=await jE(r)}catch(t){xn.warn(`Failed to read token from IndexedDB. Error: ${t}`)}return e}}function _B(r,e){return dc()?qE(r,e).catch(t=>{xn.warn(`Failed to write token to IndexedDB. Error: ${t}`)}):Promise.resolve()}async function QE(r){let e;try{e=await WE()}catch{}if(e)return e;{const t=crypto.randomUUID();let n=`To use this token for app debugging, register it with your project.

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
`,console.log(n),KE(t).catch(o=>xn.warn(`Failed to persist debug token to IndexedDB. Error: ${o}`)),t}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _c(){return aa().enabled}async function Dc(){const r=aa();if(r.enabled&&r.token)return r.token.promise;throw Error(`
            Can't get debug token in production mode.
        `)}function $E(r){const e=zf(),t=aa();if(t.initialized=!0,typeof e.FIREBASE_APPCHECK_DEBUG_TOKEN!="string"&&e.FIREBASE_APPCHECK_DEBUG_TOKEN!==!0)return;t.enabled=!0;const n=new $r;t.token=n,typeof e.FIREBASE_APPCHECK_DEBUG_TOKEN=="string"?n.resolve(e.FIREBASE_APPCHECK_DEBUG_TOKEN):n.resolve(QE(r))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const YE={error:"UNKNOWN_ERROR"};function XE(r){return fc.encodeString(JSON.stringify(r),!1)}async function JB(r,e=!1,t=!1){const n=r.app;mc(n);const s=Ke(n);let i=s.token,o;if(i&&!Hr(i)&&(s.token=void 0,i=void 0),!i){const u=await s.cachedTokenPromise;u&&(Hr(u)?i=u:await _B(n,void 0))}if(!e&&i&&Hr(i))return{token:i.token};let B=!1;if(_c())try{const u=await Dc();s.exchangeTokenPromise||(s.exchangeTokenPromise=Ec(id(n,u),r.heartbeatServiceProvider).finally(()=>{s.exchangeTokenPromise=void 0}),B=!0);const h=await s.exchangeTokenPromise;return await _B(n,h),s.token=h,{token:h.token}}catch(u){return u.code==="appCheck/throttled"||u.code==="appCheck/initial-throttle"?xn.warn(u.message):t&&xn.error(u),DB(u)}try{s.exchangeTokenPromise||(s.exchangeTokenPromise=s.provider.getToken().finally(()=>{s.exchangeTokenPromise=void 0}),B=!0),i=await Ke(n).exchangeTokenPromise}catch(u){u.code==="appCheck/throttled"||u.code==="appCheck/initial-throttle"?xn.warn(u.message):t&&xn.error(u),o=u}let c;return i?o?Hr(i)?c={token:i.token,internalError:o}:c=DB(o):(c={token:i.token},s.token=i,await _B(n,i)):c=DB(o),B&&fd(n,c),c}async function ZE(r){const e=r.app;mc(e);const{provider:t}=Ke(e);if(_c()){const n=await Dc(),s=id(e,n);s.body.limited_use=!0;const{token:i}=await Ec(s,r.heartbeatServiceProvider);return{token:i}}else{const{token:n}=await t.getToken(!0);return{token:n}}}function ld(r,e,t,n){const{app:s}=r,i=Ke(s),o={next:t,error:n,type:e};if(i.tokenObservers=[...i.tokenObservers,o],i.token&&Hr(i.token)){const B=i.token;Promise.resolve().then(()=>{t({token:B.token}),Kl(r)}).catch(()=>{})}i.cachedTokenPromise.then(()=>Kl(r))}function hd(r,e){const t=Ke(r),n=t.tokenObservers.filter(s=>s.next!==e);n.length===0&&t.tokenRefresher&&t.tokenRefresher.isRunning()&&t.tokenRefresher.stop(),t.tokenObservers=n}function Kl(r){const{app:e}=r,t=Ke(e);let n=t.tokenRefresher;n||(n=e_(r),t.tokenRefresher=n),!n.isRunning()&&t.isTokenAutoRefreshEnabled&&n.start()}function e_(r){const{app:e}=r;return new xE(async()=>{const t=Ke(e);let n;if(t.token?n=await JB(r,!0):n=await JB(r),n.error)throw n.error;if(n.internalError)throw n.internalError},()=>!0,()=>{const t=Ke(e);if(t.token){let n=t.token.issuedAtTimeMillis+(t.token.expireTimeMillis-t.token.issuedAtTimeMillis)*.5+3e5;const s=t.token.expireTimeMillis-300*1e3;return n=Math.min(n,s),Math.max(0,n-Date.now())}else return 0},jl.RETRIAL_MIN_WAIT,jl.RETRIAL_MAX_WAIT)}function fd(r,e){const t=Ke(r).tokenObservers;for(const n of t)try{n.type==="EXTERNAL"&&e.error!=null?n.error(e.error):n.next(e)}catch{}}function Hr(r){return r.expireTimeMillis-Date.now()>0}function DB(r){return{token:XE(YE),error:r}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class t_{constructor(e,t){this.app=e,this.heartbeatServiceProvider=t}_delete(){const{tokenObservers:e}=Ke(this.app);for(const t of e)hd(this.app,t.next);return Promise.resolve()}}function n_(r,e){return new t_(r,e)}function r_(r){return{getToken:e=>JB(r,e),getLimitedUseToken:()=>ZE(r),addTokenListener:e=>ld(r,"INTERNAL",e),removeTokenListener:e=>hd(r.app,e)}}const s_="@firebase/app-check",i_="0.13.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const o_="https://www.google.com/recaptcha/api.js";function a_(r,e){const t=new $r,n=Ke(r);n.reCAPTCHAState={initialized:t};const s=B_(r),i=ql(!1);return i?Wl(r,e,i,s,t):l_(()=>{const o=ql(!1);if(!o)throw new Error("no recaptcha");Wl(r,e,o,s,t)}),t.promise}function Wl(r,e,t,n,s){t.ready(()=>{u_(r,e,t,n),s.resolve(t)})}function B_(r){const e=`fire_app_check_${r.name}`,t=document.createElement("div");return t.id=e,t.style.display="none",document.body.appendChild(t),e}async function c_(r){mc(r);const t=await Ke(r).reCAPTCHAState.initialized.promise;return new Promise((n,s)=>{const i=Ke(r).reCAPTCHAState;t.ready(()=>{n(t.execute(i.widgetId,{action:"fire_app_check"}))})})}function u_(r,e,t,n){const s=t.render(n,{sitekey:e,size:"invisible",callback:()=>{Ke(r).reCAPTCHAState.succeeded=!0},"error-callback":()=>{Ke(r).reCAPTCHAState.succeeded=!1}}),i=Ke(r);i.reCAPTCHAState={...i.reCAPTCHAState,widgetId:s}}function l_(r){const e=document.createElement("script");e.src=o_,e.onload=r,document.head.appendChild(e)}/**
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
 */class dd{constructor(e){this._siteKey=e,this._throttleData=null}async getToken(e=!1){var s,i,o;f_(this._throttleData);const t=await c_(this._app).catch(B=>{throw mt.create("recaptcha-error")});if(!((s=Ke(this._app).reCAPTCHAState)!=null&&s.succeeded))throw mt.create("recaptcha-error");let n;try{const B=UE(this._app,t);e&&(B.body.limited_use=!0),n=await Ec(B,this._heartbeatServiceProvider)}catch(B){throw(i=B.code)!=null&&i.includes("fetch-status-error")?(this._throttleData=h_(Number((o=B.customData)==null?void 0:o.httpStatus),this._throttleData),mt.create("initial-throttle",{time:sd(this._throttleData.allowRequestsAfter-Date.now()),httpStatus:this._throttleData.httpStatus})):B}return this._throttleData=null,n}initialize(e){this._app=e,this._heartbeatServiceProvider=cs(e,"heartbeat"),a_(e,this._siteKey).catch(()=>{})}isEqual(e){return e instanceof dd?this._siteKey===e._siteKey:!1}}function h_(r,e){if(r===404||r===403)return{backoffCount:1,allowRequestsAfter:Date.now()+VE,httpStatus:r};{const t=e?e.backoffCount:0,n=Dm(t,1e3,2);return{backoffCount:t+1,allowRequestsAfter:Date.now()+n,httpStatus:r}}}function f_(r){if(r&&Date.now()-r.allowRequestsAfter<=0)throw mt.create("throttled",{time:sd(r.allowRequestsAfter-Date.now()),httpStatus:r.httpStatus})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rP(r=gc(),e){var s;r=se(r);const t=cs(r,"app-check");if(aa().initialized||$E(r),_c()&&Dc().then(i=>{console.log(`Firebase App Check debug token: ${i}`)}),t.isInitialized()){const i=t.getImmediate(),o=t.getOptions();if(o&&!!o.isTokenAutoRefreshEnabled==!!e.isTokenAutoRefreshEnabled&&((s=o.provider)!=null&&s.isEqual(e.provider)))return i;throw mt.create("already-initialized",{appName:r.name})}const n=t.initialize({options:e});return d_(r,e.provider,e.isTokenAutoRefreshEnabled),Ke(r).isTokenAutoRefreshEnabled&&ld(n,"INTERNAL",()=>{}),n}function d_(r,e,t=!1){const n=LE(r,{...nd});n.activated=!0,n.provider=e,n.cachedTokenPromise=zE(r).then(s=>(s&&Hr(s)&&(n.token=s,fd(r,{token:s.token})),s)),n.isTokenAutoRefreshEnabled=t&&r.automaticDataCollectionEnabled,!r.automaticDataCollectionEnabled&&t&&xn.warn("`isTokenAutoRefreshEnabled` is true but `automaticDataCollectionEnabled` was set to false during `initializeApp()`. This blocks automatic token refresh."),n.provider.initialize(r)}/**
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
 */const C_="app-check",zl="app-check-internal";function p_(){zn(new gn(C_,r=>{const e=r.getProvider("app").getImmediate(),t=r.getProvider("heartbeat");return n_(e,t)},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((r,e,t)=>{r.getProvider(zl).initialize()})),zn(new gn(zl,r=>{const e=r.getProvider("app-check").getImmediate();return r_(e)},"PUBLIC").setInstantiationMode("EXPLICIT")),dn(s_,i_)}p_();function Cd(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const g_=Cd,pd=new os("auth","Firebase",Cd());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vo=new oa("@firebase/auth");function gd(r,...e){Vo.logLevel<=ce.WARN&&Vo.warn(`Auth (${us}): ${r}`,...e)}function To(r,...e){Vo.logLevel<=ce.ERROR&&Vo.error(`Auth (${us}): ${r}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mt(r,...e){throw wc(r,...e)}function ft(r,...e){return wc(r,...e)}function Ic(r,e,t){const n={...g_(),[e]:t};return new os("auth","Firebase",n).create(e,{appName:r.name})}function dt(r){return Ic(r,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Si(r,e,t){const n=t;if(!(e instanceof n))throw n.name!==e.constructor.name&&Mt(r,"argument-error"),Ic(r,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function wc(r,...e){if(typeof r!="string"){const t=e[0],n=[...e.slice(1)];return n[0]&&(n[0].appName=r.name),r._errorFactory.create(t,...n)}return pd.create(r,...e)}function q(r,e,...t){if(!r)throw wc(e,...t)}function cn(r){const e="INTERNAL ASSERTION FAILED: "+r;throw To(e),new Error(e)}function En(r,e){r||cn(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function li(){var r;return typeof self<"u"&&((r=self.location)==null?void 0:r.href)||""}function yc(){return Ql()==="http:"||Ql()==="https:"}function Ql(){var r;return typeof self<"u"&&((r=self.location)==null?void 0:r.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function m_(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(yc()||om()||"connection"in navigator)?navigator.onLine:!0}function E_(){if(typeof navigator>"u")return null;const r=navigator;return r.languages&&r.languages[0]||r.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oi{constructor(e,t){this.shortDelay=e,this.longDelay=t,En(t>e,"Short delay should be less than long delay!"),this.isMobile=rm()||am()}get(){return m_()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tc(r,e){En(r.emulator,"Emulator should always be set here");const{url:t}=r.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class md{static initialize(e,t,n){this.fetchImpl=e,t&&(this.headersImpl=t),n&&(this.responseImpl=n)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;cn("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;cn("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;cn("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const __={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const D_=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],I_=new Oi(3e4,6e4);function We(r,e){return r.tenantId&&!e.tenantId?{...e,tenantId:r.tenantId}:e}async function ze(r,e,t,n,s={}){return Ed(r,s,async()=>{let i={},o={};n&&(e==="GET"?o=n:i={body:JSON.stringify(n)});const B=as({...o,key:r.config.apiKey}).slice(1),c=await r._getAdditionalHeaders();c["Content-Type"]="application/json",r.languageCode&&(c["X-Firebase-Locale"]=r.languageCode);const u={method:e,headers:c,...i};return im()||(u.referrerPolicy="strict-origin-when-cross-origin"),r.emulatorConfig&&Bs(r.emulatorConfig.host)&&(u.credentials="include"),md.fetch()(await _d(r,r.config.apiHost,t,B),u)})}async function Ed(r,e,t){r._canInitEmulator=!1;const n={...__,...e};try{const s=new y_(r),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw qs(r,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const B=i.ok?o.errorMessage:o.error.message,[c,u]=B.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw qs(r,"credential-already-in-use",o);if(c==="EMAIL_EXISTS")throw qs(r,"email-already-in-use",o);if(c==="USER_DISABLED")throw qs(r,"user-disabled",o);const h=n[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(u)throw Ic(r,h,u);Mt(r,h)}}catch(s){if(s instanceof yn)throw s;Mt(r,"network-request-failed",{message:String(s)})}}async function Tn(r,e,t,n,s={}){const i=await ze(r,e,t,n,s);return"mfaPendingCredential"in i&&Mt(r,"multi-factor-auth-required",{_serverResponse:i}),i}async function _d(r,e,t,n){const s=`${e}${t}?${n}`,i=r,o=i.config.emulator?Tc(r.config,s):`${r.config.apiScheme}://${s}`;return D_.includes(t)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(o).toString():o}function w_(r){switch(r){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class y_{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,n)=>{this.timer=setTimeout(()=>n(ft(this.auth,"network-request-failed")),I_.get())})}}function qs(r,e,t){const n={appName:r.name};t.email&&(n.email=t.email),t.phoneNumber&&(n.phoneNumber=t.phoneNumber);const s=ft(r,e,n);return s.customData._tokenResponse=t,s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $l(r){return r!==void 0&&r.getResponse!==void 0}function Yl(r){return r!==void 0&&r.enterprise!==void 0}class Dd{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return w_(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function T_(r){return(await ze(r,"GET","/v1/recaptchaParams")).recaptchaSiteKey||""}async function Id(r,e){return ze(r,"GET","/v2/recaptchaConfig",We(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function A_(r,e){return ze(r,"POST","/v1/accounts:delete",e)}async function R_(r,e){return ze(r,"POST","/v1/accounts:update",e)}async function xo(r,e){return ze(r,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qs(r){if(r)try{const e=new Date(Number(r));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function v_(r,e=!1){const t=se(r),n=await t.getIdToken(e),s=Ba(n);q(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:s,token:n,authTime:Qs(IB(s.auth_time)),issuedAtTime:Qs(IB(s.iat)),expirationTime:Qs(IB(s.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function IB(r){return Number(r)*1e3}function Ba(r){const[e,t,n]=r.split(".");if(e===void 0||t===void 0||n===void 0)return To("JWT malformed, contained fewer than 3 sections"),null;try{const s=Wf(t);return s?JSON.parse(s):(To("Failed to decode base64 JWT payload"),null)}catch(s){return To("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function Xl(r){const e=Ba(r);return q(e,"internal-error"),q(typeof e.exp<"u","internal-error"),q(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ir(r,e,t=!1){if(t)return e;try{return await e}catch(n){throw n instanceof yn&&P_(n)&&r.auth.currentUser===r&&await r.auth.signOut(),n}}function P_({code:r}){return r==="auth/user-disabled"||r==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class S_{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const n=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,n)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jB{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Qs(this.lastLoginAt),this.creationTime=Qs(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function hi(r){var d;const e=r.auth,t=await r.getIdToken(),n=await Ir(r,xo(e,{idToken:t}));q(n==null?void 0:n.users.length,e,"internal-error");const s=n.users[0];r._notifyReloadListener(s);const i=(d=s.providerUserInfo)!=null&&d.length?yd(s.providerUserInfo):[],o=O_(r.providerData,i),B=r.isAnonymous,c=!(r.email&&s.passwordHash)&&!(o!=null&&o.length),u=B?c:!1,h={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:o,metadata:new jB(s.createdAt,s.lastLoginAt),isAnonymous:u};Object.assign(r,h)}async function wd(r){const e=se(r);await hi(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function O_(r,e){return[...r.filter(n=>!e.some(s=>s.providerId===n.providerId)),...e]}function yd(r){return r.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function b_(r,e){const t=await Ed(r,{},async()=>{const n=as({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=r.config,o=await _d(r,s,"/v1/token",`key=${i}`),B=await r._getAdditionalHeaders();B["Content-Type"]="application/x-www-form-urlencoded";const c={method:"POST",headers:B,body:n};return r.emulatorConfig&&Bs(r.emulatorConfig.host)&&(c.credentials="include"),md.fetch()(o,c)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function N_(r,e){return ze(r,"POST","/v2/accounts:revokeToken",We(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qr{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){q(e.idToken,"internal-error"),q(typeof e.idToken<"u","internal-error"),q(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Xl(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){q(e.length!==0,"internal-error");const t=Xl(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(q(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:n,refreshToken:s,expiresIn:i}=await b_(e,t);this.updateTokensAndExpiration(n,s,Number(i))}updateTokensAndExpiration(e,t,n){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+n*1e3}static fromJSON(e,t){const{refreshToken:n,accessToken:s,expirationTime:i}=t,o=new qr;return n&&(q(typeof n=="string","internal-error",{appName:e}),o.refreshToken=n),s&&(q(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),i&&(q(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new qr,this.toJSON())}_performRefresh(){return cn("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bn(r,e){q(typeof r=="string"||typeof r>"u","internal-error",{appName:e})}class Ht{constructor({uid:e,auth:t,stsTokenManager:n,...s}){this.providerId="firebase",this.proactiveRefresh=new S_(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=n,this.accessToken=n.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new jB(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await Ir(this,this.stsTokenManager.getToken(this.auth,e));return q(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return v_(this,e)}reload(){return wd(this)}_assign(e){this!==e&&(q(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Ht({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){q(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let n=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),n=!0),t&&await hi(this),await this.auth._persistUserIfCurrent(this),n&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(ke(this.auth.app))return Promise.reject(dt(this.auth));const e=await this.getIdToken();return await Ir(this,A_(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const n=t.displayName??void 0,s=t.email??void 0,i=t.phoneNumber??void 0,o=t.photoURL??void 0,B=t.tenantId??void 0,c=t._redirectEventId??void 0,u=t.createdAt??void 0,h=t.lastLoginAt??void 0,{uid:d,emailVerified:p,isAnonymous:I,providerData:R,stsTokenManager:k}=t;q(d&&k,e,"internal-error");const M=qr.fromJSON(this.name,k);q(typeof d=="string",e,"internal-error"),bn(n,e.name),bn(s,e.name),q(typeof p=="boolean",e,"internal-error"),q(typeof I=="boolean",e,"internal-error"),bn(i,e.name),bn(o,e.name),bn(B,e.name),bn(c,e.name),bn(u,e.name),bn(h,e.name);const z=new Ht({uid:d,auth:e,email:s,emailVerified:p,displayName:n,isAnonymous:I,photoURL:o,phoneNumber:i,tenantId:B,stsTokenManager:M,createdAt:u,lastLoginAt:h});return R&&Array.isArray(R)&&(z.providerData=R.map(re=>({...re}))),c&&(z._redirectEventId=c),z}static async _fromIdTokenResponse(e,t,n=!1){const s=new qr;s.updateFromServerResponse(t);const i=new Ht({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:n});return await hi(i),i}static async _fromGetAccountInfoResponse(e,t,n){const s=t.users[0];q(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?yd(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),B=new qr;B.updateFromIdToken(n);const c=new Ht({uid:s.localId,auth:e,stsTokenManager:B,isAnonymous:o}),u={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new jB(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(c,u),c}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zl=new Map;function un(r){En(r instanceof Function,"Expected a class definition");let e=Zl.get(r);return e?(En(e instanceof r,"Instance stored in cache mismatched with class"),e):(e=new r,Zl.set(r,e),e)}/**
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
 */class Td{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Td.type="NONE";const qB=Td;/**
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
 */function Ao(r,e,t){return`firebase:${r}:${e}:${t}`}class Kr{constructor(e,t,n){this.persistence=e,this.auth=t,this.userKey=n;const{config:s,name:i}=this.auth;this.fullUserKey=Ao(this.userKey,s.apiKey,i),this.fullPersistenceKey=Ao("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await xo(this.auth,{idToken:e}).catch(()=>{});return t?Ht._fromGetAccountInfoResponse(this.auth,t,e):null}return Ht._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,n="authUser"){if(!t.length)return new Kr(un(qB),e,n);const s=(await Promise.all(t.map(async u=>{if(await u._isAvailable())return u}))).filter(u=>u);let i=s[0]||un(qB);const o=Ao(n,e.config.apiKey,e.name);let B=null;for(const u of t)try{const h=await u._get(o);if(h){let d;if(typeof h=="string"){const p=await xo(e,{idToken:h}).catch(()=>{});if(!p)break;d=await Ht._fromGetAccountInfoResponse(e,p,h)}else d=Ht._fromJSON(e,h);u!==i&&(B=d),i=u;break}}catch{}const c=s.filter(u=>u._shouldAllowMigration);return!i._shouldAllowMigration||!c.length?new Kr(i,e,n):(i=c[0],B&&await i._set(o,B.toJSON()),await Promise.all(t.map(async u=>{if(u!==i)try{await u._remove(o)}catch{}})),new Kr(i,e,n))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eh(r){const e=r.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Pd(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Ad(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Od(e))return"Blackberry";if(bd(e))return"Webos";if(Rd(e))return"Safari";if((e.includes("chrome/")||vd(e))&&!e.includes("edge/"))return"Chrome";if(Sd(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,n=r.match(t);if((n==null?void 0:n.length)===2)return n[1]}return"Other"}function Ad(r=at()){return/firefox\//i.test(r)}function Rd(r=at()){const e=r.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function vd(r=at()){return/crios\//i.test(r)}function Pd(r=at()){return/iemobile/i.test(r)}function Sd(r=at()){return/android/i.test(r)}function Od(r=at()){return/blackberry/i.test(r)}function bd(r=at()){return/webos/i.test(r)}function Ac(r=at()){return/iphone|ipad|ipod/i.test(r)||/macintosh/i.test(r)&&/mobile/i.test(r)}function L_(r=at()){var e;return Ac(r)&&!!((e=window.navigator)!=null&&e.standalone)}function F_(){return Bm()&&document.documentMode===10}function Nd(r=at()){return Ac(r)||Sd(r)||bd(r)||Od(r)||/windows phone/i.test(r)||Pd(r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ld(r,e=[]){let t;switch(r){case"Browser":t=eh(at());break;case"Worker":t=`${eh(at())}-${r}`;break;default:t=r}const n=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${us}/${n}`}/**
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
 */class k_{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const n=i=>new Promise((o,B)=>{try{const c=e(i);o(c)}catch(c){B(c)}});n.onAbort=t,this.queue.push(n);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const n of this.queue)await n(e),n.onAbort&&t.push(n.onAbort)}catch(n){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:n==null?void 0:n.message})}}}/**
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
 */async function V_(r,e={}){return ze(r,"GET","/v2/passwordPolicy",We(r,e))}/**
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
 */const x_=6;class M_{constructor(e){var n;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??x_,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((n=e.allowedNonAlphanumericCharacters)==null?void 0:n.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const n=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;n&&(t.meetsMinPasswordLength=e.length>=n),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let n;for(let s=0;s<e.length;s++)n=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,n>="a"&&n<="z",n>="A"&&n<="Z",n>="0"&&n<="9",this.allowedNonAlphanumericCharacters.includes(n))}updatePasswordCharacterOptionsStatuses(e,t,n,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=n)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class G_{constructor(e,t,n,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=n,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new th(this),this.idTokenSubscription=new th(this),this.beforeStateQueue=new k_(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=pd,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=un(t)),this._initializationPromise=this.queue(async()=>{var n,s,i;if(!this._deleted&&(this.persistenceManager=await Kr.create(this,e),(n=this._resolvePersistenceManagerAvailable)==null||n.call(this),!this._deleted)){if((s=this._popupRedirectResolver)!=null&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((i=this.currentUser)==null?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await xo(this,{idToken:e}),n=await Ht._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(n)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var i;if(ke(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(B=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(B,B))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let n=t,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(i=this.redirectUser)==null?void 0:i._redirectEventId,B=n==null?void 0:n._redirectEventId,c=await this.tryRedirectSignIn(e);(!o||o===B)&&(c!=null&&c.user)&&(n=c.user,s=!0)}if(!n)return this.directlySetCurrentUser(null);if(!n._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(n)}catch(o){n=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return n?this.reloadAndSetCurrentUserOrClear(n):this.directlySetCurrentUser(null)}return q(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===n._redirectEventId?this.directlySetCurrentUser(n):this.reloadAndSetCurrentUserOrClear(n)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await hi(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=E_()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(ke(this.app))return Promise.reject(dt(this));const t=e?se(e):null;return t&&q(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&q(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return ke(this.app)?Promise.reject(dt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return ke(this.app)?Promise.reject(dt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(un(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await V_(this),t=new M_(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new os("auth","Firebase",e())}onAuthStateChanged(e,t,n){return this.registerStateListener(this.authStateSubscription,e,t,n)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,n){return this.registerStateListener(this.idTokenSubscription,e,t,n)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const n=this.onAuthStateChanged(()=>{n(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),n={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(n.tenantId=this.tenantId),await N_(this,n)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const n=await this.getOrInitRedirectPersistenceManager(t);return e===null?n.removeCurrentUser():n.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&un(e)||this._popupRedirectResolver;q(t,this,"argument-error"),this.redirectPersistenceManager=await Kr.create(this,[un(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,n;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((n=this.redirectUser)==null?void 0:n._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,n,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let o=!1;const B=this._isInitialized?Promise.resolve():this._initializationPromise;if(q(B,this,"internal-error"),B.then(()=>{o||i(this.currentUser)}),typeof t=="function"){const c=e.addObserver(t,n,s);return()=>{o=!0,c()}}else{const c=e.addObserver(t);return()=>{o=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return q(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Ld(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var s;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((s=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:s.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const n=await this._getAppCheckToken();return n&&(e["X-Firebase-AppCheck"]=n),e}async _getAppCheckToken(){var t;if(ke(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&gd(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function et(r){return se(r)}class th{constructor(e){this.auth=e,this.observer=null,this.addObserver=dm(t=>this.observer=t)}get next(){return q(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let bi={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function U_(r){bi=r}function Rc(r){return bi.loadJS(r)}function H_(){return bi.recaptchaV2Script}function J_(){return bi.recaptchaEnterpriseScript}function j_(){return bi.gapiScript}function Fd(r){return`__${r}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const q_=500,K_=6e4,lo=1e12;class W_{constructor(e){this.auth=e,this.counter=lo,this._widgets=new Map}render(e,t){const n=this.counter;return this._widgets.set(n,new $_(e,this.auth.name,t||{})),this.counter++,n}reset(e){var n;const t=e||lo;(n=this._widgets.get(t))==null||n.delete(),this._widgets.delete(t)}getResponse(e){var n;const t=e||lo;return((n=this._widgets.get(t))==null?void 0:n.getResponse())||""}async execute(e){var n;const t=e||lo;return(n=this._widgets.get(t))==null||n.execute(),""}}class z_{constructor(){this.enterprise=new Q_}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class Q_{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class $_{constructor(e,t,n){this.params=n,this.timerId=null,this.deleted=!1,this.responseToken=null,this.clickHandler=()=>{this.execute()};const s=typeof e=="string"?document.getElementById(e):e;q(s,"argument-error",{appName:t}),this.container=s,this.isVisible=this.params.size!=="invisible",this.isVisible?this.execute():this.container.addEventListener("click",this.clickHandler)}getResponse(){return this.checkIfDeleted(),this.responseToken}delete(){this.checkIfDeleted(),this.deleted=!0,this.timerId&&(clearTimeout(this.timerId),this.timerId=null),this.container.removeEventListener("click",this.clickHandler)}execute(){this.checkIfDeleted(),!this.timerId&&(this.timerId=window.setTimeout(()=>{this.responseToken=Y_(50);const{callback:e,"expired-callback":t}=this.params;if(e)try{e(this.responseToken)}catch{}this.timerId=window.setTimeout(()=>{if(this.timerId=null,this.responseToken=null,t)try{t()}catch{}this.isVisible&&this.execute()},K_)},q_))}checkIfDeleted(){if(this.deleted)throw new Error("reCAPTCHA mock was already deleted!")}}function Y_(r){const e=[],t="1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";for(let n=0;n<r;n++)e.push(t.charAt(Math.floor(Math.random()*t.length)));return e.join("")}/**
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
 */const X_="recaptcha-enterprise",$s="NO_RECAPTCHA",nh="onFirebaseAuthREInstanceReady";class on{constructor(e){this.type=X_,this.auth=et(e)}async verify(e="verify",t=!1){async function n(i){if(!t){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(o,B)=>{Id(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(c=>{if(c.recaptchaKey===void 0)B(new Error("recaptcha Enterprise site key undefined"));else{const u=new Dd(c);return i.tenantId==null?i._agentRecaptchaConfig=u:i._tenantRecaptchaConfigs[i.tenantId]=u,o(u.siteKey)}}).catch(c=>{B(c)})})}function s(i,o,B){const c=window.grecaptcha;Yl(c)?c.enterprise.ready(()=>{c.enterprise.execute(i,{action:e}).then(u=>{o(u)}).catch(()=>{o($s)})}):B(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new z_().execute("siteKey",{action:"verify"}):new Promise((i,o)=>{n(this.auth).then(async B=>{if(!t&&Yl(window.grecaptcha)&&on.scriptInjectionDeferred)await on.scriptInjectionDeferred.promise,s(B,i,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let c=J_();c.length!==0&&(c+=B+`&onload=${nh}`),on.scriptInjectionDeferred=new $r,window[nh]=()=>{var u;(u=on.scriptInjectionDeferred)==null||u.resolve()},Rc(c).then(()=>{var u;return(u=on.scriptInjectionDeferred)==null?void 0:u.promise}).then(()=>{s(B,i,o)}).catch(u=>{o(u)})}}).catch(B=>{o(B)})})}}on.scriptInjectionDeferred=null;async function Gs(r,e,t,n=!1,s=!1){const i=new on(r);let o;if(s)o=$s;else try{o=await i.verify(t)}catch{o=await i.verify(t,!0)}const B={...e};if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in B){const c=B.phoneEnrollmentInfo.phoneNumber,u=B.phoneEnrollmentInfo.recaptchaToken;Object.assign(B,{phoneEnrollmentInfo:{phoneNumber:c,recaptchaToken:u,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in B){const c=B.phoneSignInInfo.recaptchaToken;Object.assign(B,{phoneSignInInfo:{recaptchaToken:c,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return B}return n?Object.assign(B,{captchaResp:o}):Object.assign(B,{captchaResponse:o}),Object.assign(B,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(B,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),B}async function Hn(r,e,t,n,s){var i,o;if(s==="EMAIL_PASSWORD_PROVIDER")if((i=r._getRecaptchaConfig())!=null&&i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const B=await Gs(r,e,t,t==="getOobCode");return n(r,B)}else return n(r,e).catch(async B=>{if(B.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const c=await Gs(r,e,t,t==="getOobCode");return n(r,c)}else return Promise.reject(B)});else if(s==="PHONE_PROVIDER")if((o=r._getRecaptchaConfig())!=null&&o.isProviderEnabled("PHONE_PROVIDER")){const B=await Gs(r,e,t);return n(r,B).catch(async c=>{var u;if(((u=r._getRecaptchaConfig())==null?void 0:u.getProviderEnforcementState("PHONE_PROVIDER"))==="AUDIT"&&(c.code==="auth/missing-recaptcha-token"||c.code==="auth/invalid-app-credential")){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${t} flow.`);const h=await Gs(r,e,t,!1,!0);return n(r,h)}return Promise.reject(c)})}else{const B=await Gs(r,e,t,!1,!0);return n(r,B)}else return Promise.reject(s+" provider is not supported.")}async function Z_(r){const e=et(r),t=await Id(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),n=new Dd(t);e.tenantId==null?e._agentRecaptchaConfig=n:e._tenantRecaptchaConfigs[e.tenantId]=n,n.isAnyProviderEnabled()&&new on(e).verify()}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eD(r,e){const t=cs(r,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(pn(i,e??{}))return s;Mt(s,"already-initialized")}return t.initialize({options:e})}function tD(r,e){const t=(e==null?void 0:e.persistence)||[],n=(Array.isArray(t)?t:[t]).map(un);e!=null&&e.errorMap&&r._updateErrorMap(e.errorMap),r._initializeWithPersistence(n,e==null?void 0:e.popupRedirectResolver)}function KB(r,e,t){const n=et(r);q(/^https?:\/\//.test(e),n,"invalid-emulator-scheme");const s=!1,i=kd(e),{host:o,port:B}=nD(e),c=B===null?"":`:${B}`,u={url:`${i}//${o}${c}/`},h=Object.freeze({host:o,port:B,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!n._canInitEmulator){q(n.config.emulator&&n.emulatorConfig,n,"emulator-config-failed"),q(pn(u,n.config.emulator)&&pn(h,n.emulatorConfig),n,"emulator-config-failed");return}n.config.emulator=u,n.emulatorConfig=h,n.settings.appVerificationDisabledForTesting=!0,Bs(o)?Cc(`${i}//${o}${c}`):rD()}function kd(r){const e=r.indexOf(":");return e<0?"":r.substr(0,e+1)}function nD(r){const e=kd(r),t=/(\/\/)?([^?#/]+)/.exec(r.substr(e.length));if(!t)return{host:"",port:null};const n=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(n);if(s){const i=s[1];return{host:i,port:rh(n.substr(i.length+1))}}else{const[i,o]=n.split(":");return{host:i,port:rh(o)}}}function rh(r){if(!r)return null;const e=Number(r);return isNaN(e)?null:e}function rD(){function r(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",r):r())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ca{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return cn("not implemented")}_getIdTokenResponse(e){return cn("not implemented")}_linkToIdToken(e,t){return cn("not implemented")}_getReauthenticationResolver(e){return cn("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function sD(r,e){return ze(r,"POST","/v1/accounts:resetPassword",We(r,e))}async function iD(r,e){return ze(r,"POST","/v1/accounts:update",e)}async function oD(r,e){return ze(r,"POST","/v1/accounts:signUp",e)}async function aD(r,e){return ze(r,"POST","/v1/accounts:update",We(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function BD(r,e){return Tn(r,"POST","/v1/accounts:signInWithPassword",We(r,e))}async function ua(r,e){return ze(r,"POST","/v1/accounts:sendOobCode",We(r,e))}async function cD(r,e){return ua(r,e)}async function uD(r,e){return ua(r,e)}async function lD(r,e){return ua(r,e)}async function hD(r,e){return ua(r,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fD(r,e){return Tn(r,"POST","/v1/accounts:signInWithEmailLink",We(r,e))}async function dD(r,e){return Tn(r,"POST","/v1/accounts:signInWithEmailLink",We(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fi extends ca{constructor(e,t,n,s=null){super("password",n),this._email=e,this._password=t,this._tenantId=s}static _fromEmailAndPassword(e,t){return new fi(e,t,"password")}static _fromEmailAndCode(e,t,n=null){return new fi(e,t,"emailLink",n)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Hn(e,t,"signInWithPassword",BD,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return fD(e,{email:this._email,oobCode:this._password});default:Mt(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const n={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Hn(e,n,"signUpPassword",oD,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return dD(e,{idToken:t,email:this._email,oobCode:this._password});default:Mt(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Wr(r,e){return Tn(r,"POST","/v1/accounts:signInWithIdp",We(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const CD="http://localhost";class en extends ca{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new en(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):Mt("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:n,signInMethod:s,...i}=t;if(!n||!s)return null;const o=new en(n,s);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return Wr(e,t)}_linkToIdToken(e,t){const n=this.buildRequest();return n.idToken=t,Wr(e,n)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Wr(e,t)}buildRequest(){const e={requestUri:CD,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=as(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function sh(r,e){return ze(r,"POST","/v1/accounts:sendVerificationCode",We(r,e))}async function pD(r,e){return Tn(r,"POST","/v1/accounts:signInWithPhoneNumber",We(r,e))}async function gD(r,e){const t=await Tn(r,"POST","/v1/accounts:signInWithPhoneNumber",We(r,e));if(t.temporaryProof)throw qs(r,"account-exists-with-different-credential",t);return t}const mD={USER_NOT_FOUND:"user-not-found"};async function ED(r,e){const t={...e,operation:"REAUTH"};return Tn(r,"POST","/v1/accounts:signInWithPhoneNumber",We(r,t),mD)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ys extends ca{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,t){return new Ys({verificationId:e,verificationCode:t})}static _fromTokenResponse(e,t){return new Ys({phoneNumber:e,temporaryProof:t})}_getIdTokenResponse(e){return pD(e,this._makeVerificationRequest())}_linkToIdToken(e,t){return gD(e,{idToken:t,...this._makeVerificationRequest()})}_getReauthenticationResolver(e){return ED(e,this._makeVerificationRequest())}_makeVerificationRequest(){const{temporaryProof:e,phoneNumber:t,verificationId:n,verificationCode:s}=this.params;return e&&t?{temporaryProof:e,phoneNumber:t}:{sessionInfo:n,code:s}}toJSON(){const e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));const{verificationId:t,verificationCode:n,phoneNumber:s,temporaryProof:i}=e;return!n&&!t&&!s&&!i?null:new Ys({verificationId:t,verificationCode:n,phoneNumber:s,temporaryProof:i})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _D(r){switch(r){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function DD(r){const e=Js(js(r)).link,t=e?Js(js(e)).deep_link_id:null,n=Js(js(r)).deep_link_id;return(n?Js(js(n)).link:null)||n||t||e||r}class la{constructor(e){const t=Js(js(e)),n=t.apiKey??null,s=t.oobCode??null,i=_D(t.mode??null);q(n&&s&&i,"argument-error"),this.apiKey=n,this.operation=i,this.code=s,this.continueUrl=t.continueUrl??null,this.languageCode=t.lang??null,this.tenantId=t.tenantId??null}static parseLink(e){const t=DD(e);try{return new la(t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _n{constructor(){this.providerId=_n.PROVIDER_ID}static credential(e,t){return fi._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const n=la.parseLink(t);return q(n,"argument-error"),fi._fromEmailAndCode(e,n.code,n.tenantId)}}_n.PROVIDER_ID="password";_n.EMAIL_PASSWORD_SIGN_IN_METHOD="password";_n.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ar{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class ls extends Ar{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}class be extends ls{static credentialFromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;return q("providerId"in t&&"signInMethod"in t,"argument-error"),en._fromParams(t)}credential(e){return this._credential({...e,nonce:e.rawNonce})}_credential(e){return q(e.idToken||e.accessToken,"argument-error"),en._fromParams({...e,providerId:this.providerId,signInMethod:this.providerId})}static credentialFromResult(e){return be.oauthCredentialFromTaggedObject(e)}static credentialFromError(e){return be.oauthCredentialFromTaggedObject(e.customData||{})}static oauthCredentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:n,oauthTokenSecret:s,pendingToken:i,nonce:o,providerId:B}=e;if(!n&&!s&&!t&&!i||!B)return null;try{return new be(B)._credential({idToken:t,accessToken:n,nonce:o,pendingToken:i})}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ft extends ls{constructor(){super("facebook.com")}static credential(e){return en._fromParams({providerId:Ft.PROVIDER_ID,signInMethod:Ft.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Ft.credentialFromTaggedObject(e)}static credentialFromError(e){return Ft.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Ft.credential(e.oauthAccessToken)}catch{return null}}}Ft.FACEBOOK_SIGN_IN_METHOD="facebook.com";Ft.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kt extends ls{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return en._fromParams({providerId:kt.PROVIDER_ID,signInMethod:kt.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return kt.credentialFromTaggedObject(e)}static credentialFromError(e){return kt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:n}=e;if(!t&&!n)return null;try{return kt.credential(t,n)}catch{return null}}}kt.GOOGLE_SIGN_IN_METHOD="google.com";kt.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vt extends ls{constructor(){super("github.com")}static credential(e){return en._fromParams({providerId:Vt.PROVIDER_ID,signInMethod:Vt.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Vt.credentialFromTaggedObject(e)}static credentialFromError(e){return Vt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Vt.credential(e.oauthAccessToken)}catch{return null}}}Vt.GITHUB_SIGN_IN_METHOD="github.com";Vt.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xt extends ls{constructor(){super("twitter.com")}static credential(e,t){return en._fromParams({providerId:xt.PROVIDER_ID,signInMethod:xt.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return xt.credentialFromTaggedObject(e)}static credentialFromError(e){return xt.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:n}=e;if(!t||!n)return null;try{return xt.credential(t,n)}catch{return null}}}xt.TWITTER_SIGN_IN_METHOD="twitter.com";xt.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Vd(r,e){return Tn(r,"POST","/v1/accounts:signUp",We(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tn{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,n,s=!1){const i=await Ht._fromIdTokenResponse(e,n,s),o=ih(n);return new tn({user:i,providerId:o,_tokenResponse:n,operationType:t})}static async _forOperation(e,t,n){await e._updateTokensIfNecessary(n,!0);const s=ih(n);return new tn({user:e,providerId:s,_tokenResponse:n,operationType:t})}}function ih(r){return r.providerId?r.providerId:"phoneNumber"in r?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ID(r){var s;if(ke(r.app))return Promise.reject(dt(r));const e=et(r);if(await e._initializationPromise,(s=e.currentUser)!=null&&s.isAnonymous)return new tn({user:e.currentUser,providerId:null,operationType:"signIn"});const t=await Vd(e,{returnSecureToken:!0}),n=await tn._fromIdTokenResponse(e,"signIn",t,!0);return await e._updateCurrentUser(n.user),n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mo extends yn{constructor(e,t,n,s){super(t.code,t.message),this.operationType=n,this.user=s,Object.setPrototypeOf(this,Mo.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:n}}static _fromErrorAndOperation(e,t,n,s){return new Mo(e,t,n,s)}}function xd(r,e,t,n){return(e==="reauthenticate"?t._getReauthenticationResolver(r):t._getIdTokenResponse(r)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?Mo._fromErrorAndOperation(r,i,e,n):i})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Md(r){return new Set(r.map(({providerId:e})=>e).filter(e=>!!e))}/**
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
 */async function wD(r,e){const t=se(r);await ha(!0,t,e);const{providerUserInfo:n}=await R_(t.auth,{idToken:await t.getIdToken(),deleteProvider:[e]}),s=Md(n||[]);return t.providerData=t.providerData.filter(i=>s.has(i.providerId)),s.has("phone")||(t.phoneNumber=null),await t.auth._persistUserIfCurrent(t),t}async function Gd(r,e,t=!1){const n=await Ir(r,e._linkToIdToken(r.auth,await r.getIdToken()),t);return tn._forOperation(r,"link",n)}async function ha(r,e,t){await hi(e);const n=Md(e.providerData),s=r===!1?"provider-already-linked":"no-such-provider";q(n.has(t)===r,e.auth,s)}/**
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
 */async function yD(r,e,t=!1){const{auth:n}=r;if(ke(n.app))return Promise.reject(dt(n));const s="reauthenticate";try{const i=await Ir(r,xd(n,s,e,r),t);q(i.idToken,n,"internal-error");const o=Ba(i.idToken);q(o,n,"internal-error");const{sub:B}=o;return q(r.uid===B,n,"user-mismatch"),tn._forOperation(r,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&Mt(n,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ud(r,e,t=!1){if(ke(r.app))return Promise.reject(dt(r));const n="signIn",s=await xd(r,n,e),i=await tn._fromIdTokenResponse(r,n,s);return t||await r._updateCurrentUser(i.user),i}async function vc(r,e){return Ud(et(r),e)}async function Hd(r,e){const t=se(r);return await ha(!1,t,e.providerId),Gd(t,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function TD(r,e){return Tn(r,"POST","/v1/accounts:signInWithCustomToken",We(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function AD(r,e){if(ke(r.app))return Promise.reject(dt(r));const t=et(r),n=await TD(t,{token:e,returnSecureToken:!0}),s=await tn._fromIdTokenResponse(t,"signIn",n);return await t._updateCurrentUser(s.user),s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fa(r,e,t){var n;q(((n=t.url)==null?void 0:n.length)>0,r,"invalid-continue-uri"),q(typeof t.dynamicLinkDomain>"u"||t.dynamicLinkDomain.length>0,r,"invalid-dynamic-link-domain"),q(typeof t.linkDomain>"u"||t.linkDomain.length>0,r,"invalid-hosting-link-domain"),e.continueUrl=t.url,e.dynamicLinkDomain=t.dynamicLinkDomain,e.linkDomain=t.linkDomain,e.canHandleCodeInApp=t.handleCodeInApp,t.iOS&&(q(t.iOS.bundleId.length>0,r,"missing-ios-bundle-id"),e.iOSBundleId=t.iOS.bundleId),t.android&&(q(t.android.packageName.length>0,r,"missing-android-pkg-name"),e.androidInstallApp=t.android.installApp,e.androidMinimumVersionCode=t.android.minimumVersion,e.androidPackageName=t.android.packageName)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Pc(r){const e=et(r);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function RD(r,e,t){const n=et(r),s={requestType:"PASSWORD_RESET",email:e,clientType:"CLIENT_TYPE_WEB"};t&&fa(n,s,t),await Hn(n,s,"getOobCode",uD,"EMAIL_PASSWORD_PROVIDER")}async function vD(r,e,t){await sD(se(r),{oobCode:e,newPassword:t}).catch(async n=>{throw n.code==="auth/password-does-not-meet-requirements"&&Pc(r),n})}async function PD(r,e){await aD(se(r),{oobCode:e})}async function SD(r,e,t){if(ke(r.app))return Promise.reject(dt(r));const n=et(r),o=await Hn(n,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",Vd,"EMAIL_PASSWORD_PROVIDER").catch(c=>{throw c.code==="auth/password-does-not-meet-requirements"&&Pc(r),c}),B=await tn._fromIdTokenResponse(n,"signIn",o);return await n._updateCurrentUser(B.user),B}function OD(r,e,t){return ke(r.app)?Promise.reject(dt(r)):vc(se(r),_n.credential(e,t)).catch(async n=>{throw n.code==="auth/password-does-not-meet-requirements"&&Pc(r),n})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function bD(r,e,t){const n=et(r),s={requestType:"EMAIL_SIGNIN",email:e,clientType:"CLIENT_TYPE_WEB"};function i(o,B){q(B.handleCodeInApp,n,"argument-error"),B&&fa(n,o,B)}i(s,t),await Hn(n,s,"getOobCode",lD,"EMAIL_PASSWORD_PROVIDER")}function ND(r,e){const t=la.parseLink(e);return(t==null?void 0:t.operation)==="EMAIL_SIGNIN"}async function LD(r,e,t){if(ke(r.app))return Promise.reject(dt(r));const n=se(r),s=_n.credentialWithLink(e,t||li());return q(s._tenantId===(n.tenantId||null),n,"tenant-id-mismatch"),vc(n,s)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function FD(r,e){return ze(r,"POST","/v1/accounts:createAuthUri",We(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function kD(r,e){const t=yc()?li():"http://localhost",n={identifier:e,continueUri:t},{signinMethods:s}=await FD(se(r),n);return s||[]}async function VD(r,e){const t=se(r),s={requestType:"VERIFY_EMAIL",idToken:await r.getIdToken()};e&&fa(t.auth,s,e);const{email:i}=await cD(t.auth,s);i!==r.email&&await r.reload()}async function xD(r,e,t){const n=se(r),i={requestType:"VERIFY_AND_CHANGE_EMAIL",idToken:await r.getIdToken(),newEmail:e};t&&fa(n.auth,i,t);const{email:o}=await hD(n.auth,i);o!==r.email&&await r.reload()}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function MD(r,e){return ze(r,"POST","/v1/accounts:update",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function GD(r,{displayName:e,photoURL:t}){if(e===void 0&&t===void 0)return;const n=se(r),i={idToken:await n.getIdToken(),displayName:e,photoUrl:t,returnSecureToken:!0},o=await Ir(n,MD(n.auth,i));n.displayName=o.displayName||null,n.photoURL=o.photoUrl||null;const B=n.providerData.find(({providerId:c})=>c==="password");B&&(B.displayName=n.displayName,B.photoURL=n.photoURL),await n._updateTokensIfNecessary(o)}function UD(r,e){const t=se(r);return ke(t.auth.app)?Promise.reject(dt(t.auth)):Jd(t,e,null)}function HD(r,e){return Jd(se(r),null,e)}async function Jd(r,e,t){const{auth:n}=r,i={idToken:await r.getIdToken(),returnSecureToken:!0};e&&(i.email=e),t&&(i.password=t);const o=await Ir(r,iD(n,i));await r._updateTokensIfNecessary(o,!0)}/**
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
 */function JD(r){var s,i;if(!r)return null;const{providerId:e}=r,t=r.rawUserInfo?JSON.parse(r.rawUserInfo):{},n=r.isNewUser||r.kind==="identitytoolkit#SignupNewUserResponse";if(!e&&(r!=null&&r.idToken)){const o=(i=(s=Ba(r.idToken))==null?void 0:s.firebase)==null?void 0:i.sign_in_provider;if(o){const B=o!=="anonymous"&&o!=="custom"?o:null;return new zr(n,B)}}if(!e)return null;switch(e){case"facebook.com":return new jD(n,t);case"github.com":return new qD(n,t);case"google.com":return new KD(n,t);case"twitter.com":return new WD(n,t,r.screenName||null);case"custom":case"anonymous":return new zr(n,null);default:return new zr(n,e,t)}}class zr{constructor(e,t,n={}){this.isNewUser=e,this.providerId=t,this.profile=n}}class jd extends zr{constructor(e,t,n,s){super(e,t,n),this.username=s}}class jD extends zr{constructor(e,t){super(e,"facebook.com",t)}}class qD extends jd{constructor(e,t){super(e,"github.com",t,typeof(t==null?void 0:t.login)=="string"?t==null?void 0:t.login:null)}}class KD extends zr{constructor(e,t){super(e,"google.com",t)}}class WD extends jd{constructor(e,t,n){super(e,"twitter.com",t,n)}}function zD(r){const{user:e,_tokenResponse:t}=r;return e.isAnonymous&&!t?{providerId:null,isNewUser:!1,profile:null}:JD(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ho(r,e){return se(r).setPersistence(e)}function QD(r,e,t,n){return se(r).onIdTokenChanged(e,t,n)}function $D(r,e,t){return se(r).beforeAuthStateChanged(e,t)}function sP(r,e,t,n){return se(r).onAuthStateChanged(e,t,n)}function iP(r){return se(r).signOut()}function YD(r,e){return et(r).revokeAccessToken(e)}async function XD(r){return se(r).delete()}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oh(r,e){return ze(r,"POST","/v2/accounts/mfaEnrollment:start",We(r,e))}const Go="__sak";/**
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
 */class qd{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Go,"1"),this.storage.removeItem(Go),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ZD=1e3,eI=10;class Kd extends qd{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Nd(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const n=this.storage.getItem(t),s=this.localCache[t];n!==s&&e(t,s,n)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,B,c)=>{this.notifyListeners(o,c)});return}const n=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const o=this.storage.getItem(n);!t&&this.localCache[n]===o||this.notifyListeners(n,o)},i=this.storage.getItem(n);F_()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,eI):s()}notifyListeners(e,t){this.localCache[e]=t;const n=this.listeners[e];if(n)for(const s of Array.from(n))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,n)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:n}),!0)})},ZD)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}Kd.type="LOCAL";const Wd=Kd;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zd extends qd{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}zd.type="SESSION";const Sc=zd;/**
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
 */function tI(r){return Promise.all(r.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
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
 */class da{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const n=new da(e);return this.receivers.push(n),n}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:n,eventType:s,data:i}=t.data,o=this.handlersMap[s];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:n,eventType:s});const B=Array.from(o).map(async u=>u(t.origin,i)),c=await tI(B);t.ports[0].postMessage({status:"done",eventId:n,eventType:s,response:c})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}da.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ca(r="",e=10){let t="";for(let n=0;n<e;n++)t+=Math.floor(Math.random()*10);return r+t}/**
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
 */class nI{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,n=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,o;return new Promise((B,c)=>{const u=Ca("",20);s.port1.start();const h=setTimeout(()=>{c(new Error("unsupported_event"))},n);o={messageChannel:s,onMessage(d){const p=d;if(p.data.eventId===u)switch(p.data.status){case"ack":clearTimeout(h),i=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),B(p.data.response);break;default:clearTimeout(h),clearTimeout(i),c(new Error("invalid_response"));break}}},this.handlers.add(o),s.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:u,data:t},[s.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Le(){return window}function rI(r){Le().location.href=r}/**
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
 */function Oc(){return typeof Le().WorkerGlobalScope<"u"&&typeof Le().importScripts=="function"}async function sI(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function iI(){var r;return((r=navigator==null?void 0:navigator.serviceWorker)==null?void 0:r.controller)||null}function oI(){return Oc()?self:null}/**
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
 */const Qd="firebaseLocalStorageDb",aI=1,Uo="firebaseLocalStorage",$d="fbase_key";class Ni{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function pa(r,e){return r.transaction([Uo],e?"readwrite":"readonly").objectStore(Uo)}function BI(){const r=indexedDB.deleteDatabase(Qd);return new Ni(r).toPromise()}function Yd(){const r=indexedDB.open(Qd,aI);return new Promise((e,t)=>{r.addEventListener("error",()=>{t(r.error)}),r.addEventListener("upgradeneeded",()=>{const n=r.result;try{n.createObjectStore(Uo,{keyPath:$d})}catch(s){t(s)}}),r.addEventListener("success",async()=>{const n=r.result;n.objectStoreNames.contains(Uo)?e(n):(n.close(),await BI(),e(await Yd()))})})}async function ah(r,e,t){const n=pa(r,!0).put({[$d]:e,value:t});return new Ni(n).toPromise()}async function cI(r,e){const t=pa(r,!1).get(e),n=await new Ni(t).toPromise();return n===void 0?null:n.value}function Bh(r,e){const t=pa(r,!0).delete(e);return new Ni(t).toPromise()}const uI=800,lI=3;class Xd{registerLifecycleListeners(){typeof window<"u"&&typeof window.addEventListener=="function"&&(window.addEventListener("pagehide",this.onPageHide),window.addEventListener("pageshow",this.onPageShow))}unregisterLifecycleListeners(){typeof window<"u"&&typeof window.removeEventListener=="function"&&(window.removeEventListener("pagehide",this.onPageHide),window.removeEventListener("pageshow",this.onPageShow))}constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.isClosing=!1,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this.onPageHide=()=>{this.isClosing=!0,this.stopPolling(),this.dbPromise&&(this.dbPromise.then(e=>e.close()).catch(()=>{}),this.dbPromise=null)},this.onPageShow=()=>{this.isClosing&&(this.isClosing=!1,Object.keys(this.listeners).length>0&&this.startPolling())},this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){if(this.isClosing)throw new Error("Database is closing");return this.dbPromise?this.dbPromise:(this.dbPromise=Yd(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let t=0;for(;;)try{const n=await this._openDb();return await e(n)}catch(n){if(this.isClosing||t++>lI)throw n;this.dbPromise&&((await this.dbPromise).close(),this.dbPromise=null)}}async initializeServiceWorkerMessaging(){return Oc()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=da._getInstance(oI()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,n;if(this.activeServiceWorker=await sI(),!this.activeServiceWorker)return;this.sender=new nI(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(n=e[0])!=null&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||iI()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await ah(e,Go,"1"),await Bh(e,Go)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(n=>ah(n,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(n=>cI(n,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Bh(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){if(this.isClosing)return[];try{const e=await this._withRetries(s=>{const i=pa(s,!1).getAll();return new Ni(i).toPromise()});if(this.isClosing)return[];if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],n=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)n.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!n.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}catch(e){return this.isClosing||gd(`Firebase Auth cross-tab polling failed with error: ${e}`),[]}}notifyListeners(e,t){this.localCache[e]=t;const n=this.listeners[e];if(n)for(const s of Array.from(n))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),uI)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.startPolling(),this.registerLifecycleListeners()),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.stopPolling(),this.unregisterLifecycleListeners())}}Xd.type="LOCAL";const Zd=Xd;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ch(r,e){return ze(r,"POST","/v2/accounts/mfaSignIn:start",We(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wB=Fd("rcb"),hI=new Oi(3e4,6e4);class fI{constructor(){var e;this.hostLanguage="",this.counter=0,this.librarySeparatelyLoaded=!!((e=Le().grecaptcha)!=null&&e.render)}load(e,t=""){return q(dI(t),e,"argument-error"),this.shouldResolveImmediately(t)&&$l(Le().grecaptcha)?Promise.resolve(Le().grecaptcha):new Promise((n,s)=>{const i=Le().setTimeout(()=>{s(ft(e,"network-request-failed"))},hI.get());Le()[wB]=()=>{Le().clearTimeout(i),delete Le()[wB];const B=Le().grecaptcha;if(!B||!$l(B)){s(ft(e,"internal-error"));return}const c=B.render;B.render=(u,h)=>{const d=c(u,h);return this.counter++,d},this.hostLanguage=t,n(B)};const o=`${H_()}?${as({onload:wB,render:"explicit",hl:t})}`;Rc(o).catch(()=>{clearTimeout(i),s(ft(e,"internal-error"))})})}clearedOneInstance(){this.counter--}shouldResolveImmediately(e){var t;return!!((t=Le().grecaptcha)!=null&&t.render)&&(e===this.hostLanguage||this.counter>0||this.librarySeparatelyLoaded)}}function dI(r){return r.length<=6&&/^\s*[a-zA-Z0-9\-]*\s*$/.test(r)}class CI{async load(e){return new W_(e)}clearedOneInstance(){}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xs="recaptcha",pI={theme:"light",type:"image"};class uh{constructor(e,t,n={...pI}){this.parameters=n,this.type=Xs,this.destroyed=!1,this.widgetId=null,this.tokenChangeListeners=new Set,this.renderPromise=null,this.recaptcha=null,this.auth=et(e),this.isInvisible=this.parameters.size==="invisible",q(typeof document<"u",this.auth,"operation-not-supported-in-this-environment");const s=typeof t=="string"?document.getElementById(t):t;q(s,this.auth,"argument-error"),this.container=s,this.parameters.callback=this.makeTokenCallback(this.parameters.callback),this._recaptchaLoader=this.auth.settings.appVerificationDisabledForTesting?new CI:new fI,this.validateStartingState()}async verify(){this.assertNotDestroyed();const e=await this.render(),t=this.getAssertedRecaptcha(),n=t.getResponse(e);return n||new Promise(s=>{const i=o=>{o&&(this.tokenChangeListeners.delete(i),s(o))};this.tokenChangeListeners.add(i),this.isInvisible&&t.execute(e)})}render(){try{this.assertNotDestroyed()}catch(e){return Promise.reject(e)}return this.renderPromise?this.renderPromise:(this.renderPromise=this.makeRenderPromise().catch(e=>{throw this.renderPromise=null,e}),this.renderPromise)}_reset(){this.assertNotDestroyed(),this.widgetId!==null&&this.getAssertedRecaptcha().reset(this.widgetId)}clear(){this.assertNotDestroyed(),this.destroyed=!0,this._recaptchaLoader.clearedOneInstance(),this.isInvisible||this.container.childNodes.forEach(e=>{this.container.removeChild(e)})}validateStartingState(){q(!this.parameters.sitekey,this.auth,"argument-error"),q(this.isInvisible||!this.container.hasChildNodes(),this.auth,"argument-error"),q(typeof document<"u",this.auth,"operation-not-supported-in-this-environment")}makeTokenCallback(e){return t=>{if(this.tokenChangeListeners.forEach(n=>n(t)),typeof e=="function")e(t);else if(typeof e=="string"){const n=Le()[e];typeof n=="function"&&n(t)}}}assertNotDestroyed(){q(!this.destroyed,this.auth,"internal-error")}async makeRenderPromise(){if(await this.init(),!this.widgetId){let e=this.container;if(!this.isInvisible){const t=document.createElement("div");e.appendChild(t),e=t}this.widgetId=this.getAssertedRecaptcha().render(e,this.parameters)}return this.widgetId}async init(){q(yc()&&!Oc(),this.auth,"internal-error"),await gI(),this.recaptcha=await this._recaptchaLoader.load(this.auth,this.auth.languageCode||void 0);const e=await T_(this.auth);q(e,this.auth,"internal-error"),this.parameters.sitekey=e}getAssertedRecaptcha(){return q(this.recaptcha,this.auth,"internal-error"),this.recaptcha}}function gI(){let r=null;return new Promise(e=>{if(document.readyState==="complete"){e();return}r=()=>e(),window.addEventListener("load",r)}).catch(e=>{throw r&&window.removeEventListener("load",r),e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eC{constructor(e,t){this.verificationId=e,this.onConfirmation=t}confirm(e){const t=Ys._fromVerification(this.verificationId,e);return this.onConfirmation(t)}}async function mI(r,e,t){if(ke(r.app))return Promise.reject(dt(r));const n=et(r),s=await tC(n,e,se(t));return new eC(s,i=>vc(n,i))}async function EI(r,e,t){const n=se(r);await ha(!1,n,"phone");const s=await tC(n.auth,e,se(t));return new eC(s,i=>Hd(n,i))}async function tC(r,e,t){var n;if(!r._getRecaptchaConfig())try{await Z_(r)}catch{console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.")}try{let s;if(typeof e=="string"?s={phoneNumber:e}:s=e,"session"in s){const i=s.session;if("phoneNumber"in s){q(i.type==="enroll",r,"internal-error");const o={idToken:i.credential,phoneEnrollmentInfo:{phoneNumber:s.phoneNumber,clientType:"CLIENT_TYPE_WEB"}};return(await Hn(r,o,"mfaSmsEnrollment",async(h,d)=>{if(d.phoneEnrollmentInfo.captchaResponse===$s){q((t==null?void 0:t.type)===Xs,h,"argument-error");const p=await yB(h,d,t);return oh(h,p)}return oh(h,d)},"PHONE_PROVIDER").catch(h=>Promise.reject(h))).phoneSessionInfo.sessionInfo}else{q(i.type==="signin",r,"internal-error");const o=((n=s.multiFactorHint)==null?void 0:n.uid)||s.multiFactorUid;q(o,r,"missing-multi-factor-info");const B={mfaPendingCredential:i.credential,mfaEnrollmentId:o,phoneSignInInfo:{clientType:"CLIENT_TYPE_WEB"}};return(await Hn(r,B,"mfaSmsSignIn",async(d,p)=>{if(p.phoneSignInInfo.captchaResponse===$s){q((t==null?void 0:t.type)===Xs,d,"argument-error");const I=await yB(d,p,t);return ch(d,I)}return ch(d,p)},"PHONE_PROVIDER").catch(d=>Promise.reject(d))).phoneResponseInfo.sessionInfo}}else{const i={phoneNumber:s.phoneNumber,clientType:"CLIENT_TYPE_WEB"};return(await Hn(r,i,"sendVerificationCode",async(u,h)=>{if(h.captchaResponse===$s){q((t==null?void 0:t.type)===Xs,u,"argument-error");const d=await yB(u,h,t);return sh(u,d)}return sh(u,h)},"PHONE_PROVIDER").catch(u=>Promise.reject(u))).sessionInfo}}finally{t==null||t._reset()}}async function yB(r,e,t){q(t.type===Xs,r,"argument-error");const n=await t.verify();q(typeof n=="string",r,"argument-error");const s={...e};if("phoneEnrollmentInfo"in s){const i=s.phoneEnrollmentInfo.phoneNumber,o=s.phoneEnrollmentInfo.captchaResponse,B=s.phoneEnrollmentInfo.clientType,c=s.phoneEnrollmentInfo.recaptchaVersion;return Object.assign(s,{phoneEnrollmentInfo:{phoneNumber:i,recaptchaToken:n,captchaResponse:o,clientType:B,recaptchaVersion:c}}),s}else if("phoneSignInInfo"in s){const i=s.phoneSignInInfo.captchaResponse,o=s.phoneSignInInfo.clientType,B=s.phoneSignInInfo.recaptchaVersion;return Object.assign(s,{phoneSignInInfo:{recaptchaToken:n,captchaResponse:i,clientType:o,recaptchaVersion:B}}),s}else return Object.assign(s,{recaptchaToken:n}),s}/**
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
 */function hs(r,e){return e?un(e):(q(r._popupRedirectResolver,r,"argument-error"),r._popupRedirectResolver)}/**
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
 */class bc extends ca{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Wr(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Wr(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Wr(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function _I(r){return Ud(r.auth,new bc(r),r.bypassAuthState)}function DI(r){const{auth:e,user:t}=r;return q(t,e,"internal-error"),yD(t,new bc(r),r.bypassAuthState)}async function II(r){const{auth:e,user:t}=r;return q(t,e,"internal-error"),Gd(t,new bc(r),r.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nC{constructor(e,t,n,s,i=!1){this.auth=e,this.resolver=n,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(n){this.reject(n)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:n,postBody:s,tenantId:i,error:o,type:B}=e;if(o){this.reject(o);return}const c={auth:this.auth,requestUri:t,sessionId:n,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(B)(c))}catch(u){this.reject(u)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return _I;case"linkViaPopup":case"linkViaRedirect":return II;case"reauthViaPopup":case"reauthViaRedirect":return DI;default:Mt(this.auth,"internal-error")}}resolve(e){En(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){En(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wI=new Oi(2e3,1e4);async function yI(r,e,t){if(ke(r.app))return Promise.reject(ft(r,"operation-not-supported-in-this-environment"));const n=et(r);Si(r,e,Ar);const s=hs(n,t);return new ln(n,"signInViaPopup",e,s).executeNotNull()}async function oP(r,e,t){const n=se(r);if(ke(n.auth.app))return Promise.reject(ft(n.auth,"operation-not-supported-in-this-environment"));Si(n.auth,e,Ar);const s=hs(n.auth,t);return new ln(n.auth,"reauthViaPopup",e,s,n).executeNotNull()}async function TI(r,e,t){const n=se(r);Si(n.auth,e,Ar);const s=hs(n.auth,t);return new ln(n.auth,"linkViaPopup",e,s,n).executeNotNull()}class ln extends nC{constructor(e,t,n,s,i){super(e,t,s,i),this.provider=n,this.authWindow=null,this.pollId=null,ln.currentPopupAction&&ln.currentPopupAction.cancel(),ln.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return q(e,this.auth,"internal-error"),e}async onExecution(){En(this.filter.length===1,"Popup operations only handle one event");const e=Ca();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(ft(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(ft(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,ln.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,n;if((n=(t=this.authWindow)==null?void 0:t.window)!=null&&n.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(ft(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,wI.get())};e()}}ln.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const AI="pendingRedirect",Ro=new Map;class RI extends nC{constructor(e,t,n=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,n),this.eventId=null}async execute(){let e=Ro.get(this.auth._key());if(!e){try{const n=await vI(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(n)}catch(t){e=()=>Promise.reject(t)}Ro.set(this.auth._key(),e)}return this.bypassAuthState||Ro.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function vI(r,e){const t=iC(e),n=sC(r);if(!await n._isAvailable())return!1;const s=await n._get(t)==="true";return await n._remove(t),s}async function rC(r,e){return sC(r)._set(iC(e),"true")}function PI(r,e){Ro.set(r._key(),e)}function sC(r){return un(r._redirectPersistence)}function iC(r){return Ao(AI,r.config.apiKey,r.name)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function SI(r,e,t){return OI(r,e,t)}async function OI(r,e,t){if(ke(r.app))return Promise.reject(dt(r));const n=et(r);Si(r,e,Ar),await n._initializationPromise;const s=hs(n,t);return await rC(s,n),s._openRedirect(n,e,"signInViaRedirect")}function bI(r,e,t){return NI(r,e,t)}async function NI(r,e,t){const n=se(r);Si(n.auth,e,Ar),await n.auth._initializationPromise;const s=hs(n.auth,t);await ha(!1,n,e.providerId),await rC(s,n.auth);const i=await FI(n);return s._openRedirect(n.auth,e,"linkViaRedirect",i)}async function LI(r,e){return await et(r)._initializationPromise,oC(r,e,!1)}async function oC(r,e,t=!1){if(ke(r.app))return Promise.reject(dt(r));const n=et(r),s=hs(n,e),o=await new RI(n,s,t).execute();return o&&!t&&(delete o.user._redirectEventId,await n._persistUserIfCurrent(o.user),await n._setRedirectUser(null,e)),o}async function FI(r){const e=Ca(`${r.uid}:::`);return r._redirectEventId=e,await r.auth._setRedirectUser(r),await r.auth._persistUserIfCurrent(r),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kI=600*1e3;class VI{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(n=>{this.isEventForConsumer(e,n)&&(t=!0,this.sendToConsumer(e,n),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!xI(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var n;if(e.error&&!aC(e)){const s=((n=e.error.code)==null?void 0:n.split("auth/")[1])||"internal-error";t.onError(ft(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const n=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&n}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=kI&&this.cachedEventUids.clear(),this.cachedEventUids.has(lh(e))}saveEventToCache(e){this.cachedEventUids.add(lh(e)),this.lastProcessedEventTime=Date.now()}}function lh(r){return[r.type,r.eventId,r.sessionId,r.tenantId].filter(e=>e).join("-")}function aC({type:r,error:e}){return r==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function xI(r){switch(r.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return aC(r);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function MI(r,e={}){return ze(r,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const GI=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,UI=/^https?/;async function HI(r){if(r.config.emulator)return;const{authorizedDomains:e}=await MI(r);for(const t of e)try{if(JI(t))return}catch{}Mt(r,"unauthorized-domain")}function JI(r){const e=li(),{protocol:t,hostname:n}=new URL(e);if(r.startsWith("chrome-extension://")){const o=new URL(r);return o.hostname===""&&n===""?t==="chrome-extension:"&&r.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===n}if(!UI.test(t))return!1;if(GI.test(r))return n===r;const s=r.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(n)}/**
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
 */const jI=new Oi(3e4,6e4);function hh(){const r=Le().___jsl;if(r!=null&&r.H){for(const e of Object.keys(r.H))if(r.H[e].r=r.H[e].r||[],r.H[e].L=r.H[e].L||[],r.H[e].r=[...r.H[e].L],r.CP)for(let t=0;t<r.CP.length;t++)r.CP[t]=null}}function qI(r){return new Promise((e,t)=>{var s,i,o;function n(){hh(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{hh(),t(ft(r,"network-request-failed"))},timeout:jI.get()})}if((i=(s=Le().gapi)==null?void 0:s.iframes)!=null&&i.Iframe)e(gapi.iframes.getContext());else if((o=Le().gapi)!=null&&o.load)n();else{const B=Fd("iframefcb");return Le()[B]=()=>{gapi.load?n():t(ft(r,"network-request-failed"))},Rc(`${j_()}?onload=${B}`).catch(c=>t(c))}}).catch(e=>{throw vo=null,e})}let vo=null;function KI(r){return vo=vo||qI(r),vo}/**
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
 */const WI=new Oi(5e3,15e3),zI="__/auth/iframe",QI="emulator/auth/iframe",$I={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},YI=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function XI(r){const e=r.config;q(e.authDomain,r,"auth-domain-config-required");const t=e.emulator?Tc(e,QI):`https://${r.config.authDomain}/${zI}`,n={apiKey:e.apiKey,appName:r.name,v:us},s=YI.get(r.config.apiHost);s&&(n.eid=s);const i=r._getFrameworks();return i.length&&(n.fw=i.join(",")),`${t}?${as(n).slice(1)}`}async function ZI(r){const e=await KI(r),t=Le().gapi;return q(t,r,"internal-error"),e.open({where:document.body,url:XI(r),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:$I,dontclear:!0},n=>new Promise(async(s,i)=>{await n.restyle({setHideOnLeave:!1});const o=ft(r,"network-request-failed"),B=Le().setTimeout(()=>{i(o)},WI.get());function c(){Le().clearTimeout(B),s(n)}n.ping(c).then(c,()=>{i(o)})}))}/**
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
 */const ew={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},tw=500,nw=600,rw="_blank",sw="http://localhost";class fh{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function iw(r,e,t,n=tw,s=nw){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-n)/2,0).toString();let B="";const c={...ew,width:n.toString(),height:s.toString(),top:i,left:o},u=at().toLowerCase();t&&(B=vd(u)?rw:t),Ad(u)&&(e=e||sw,c.scrollbars="yes");const h=Object.entries(c).reduce((p,[I,R])=>`${p}${I}=${R},`,"");if(L_(u)&&B!=="_self")return ow(e||"",B),new fh(null);const d=window.open(e||"",B,h);q(d,r,"popup-blocked");try{d.focus()}catch{}return new fh(d)}function ow(r,e){const t=document.createElement("a");t.href=r,t.target=e;const n=document.createEvent("MouseEvent");n.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(n)}/**
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
 */const aw="__/auth/handler",Bw="emulator/auth/handler",cw=encodeURIComponent("fac");async function dh(r,e,t,n,s,i){q(r.config.authDomain,r,"auth-domain-config-required"),q(r.config.apiKey,r,"invalid-api-key");const o={apiKey:r.config.apiKey,appName:r.name,authType:t,redirectUrl:n,v:us,eventId:s};if(e instanceof Ar){e.setDefaultLanguage(r.languageCode),o.providerId=e.providerId||"",fm(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[h,d]of Object.entries({}))o[h]=d}if(e instanceof ls){const h=e.getScopes().filter(d=>d!=="");h.length>0&&(o.scopes=h.join(","))}r.tenantId&&(o.tid=r.tenantId);const B=o;for(const h of Object.keys(B))B[h]===void 0&&delete B[h];const c=await r._getAppCheckToken(),u=c?`#${cw}=${encodeURIComponent(c)}`:"";return`${uw(r)}?${as(B).slice(1)}${u}`}function uw({config:r}){return r.emulator?Tc(r,Bw):`https://${r.authDomain}/${aw}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const TB="webStorageSupport";class lw{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Sc,this._completeRedirectFn=oC,this._overrideRedirectResult=PI}async _openPopup(e,t,n,s){var o;En((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const i=await dh(e,t,n,li(),s);return iw(e,i,Ca())}async _openRedirect(e,t,n,s){await this._originValidation(e);const i=await dh(e,t,n,li(),s);return rI(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(En(i,"If manager is not set, promise should be"),i)}const n=this.initAndGetManager(e);return this.eventManagers[t]={promise:n},n.catch(()=>{delete this.eventManagers[t]}),n}async initAndGetManager(e){const t=await ZI(e),n=new VI(e);return t.register("authEvent",s=>(q(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:n.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:n},this.iframes[e._key()]=t,n}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(TB,{type:TB},s=>{var o;const i=(o=s==null?void 0:s[0])==null?void 0:o[TB];i!==void 0&&t(!!i),Mt(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=HI(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Nd()||Rd()||Ac()}}const hw=lw;var Ch="@firebase/auth",ph="1.13.5";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fw{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(n=>{e((n==null?void 0:n.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){q(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dw(r){switch(r){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Cw(r){zn(new gn("auth",(e,{options:t})=>{const n=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:B}=n.options;q(o&&!o.includes(":"),"invalid-api-key",{appName:n.name});const c={apiKey:o,authDomain:B,clientPlatform:r,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Ld(r)},u=new G_(n,s,i,c);return tD(u,t),u},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,n)=>{e.getProvider("auth-internal").initialize()})),zn(new gn("auth-internal",e=>{const t=et(e.getProvider("auth").getImmediate());return(n=>new fw(n))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),dn(Ch,ph,dw(r)),dn(Ch,ph,"esm2020")}/**
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
 */const pw=300,gw=Yf("authIdTokenMaxAge")||pw;let gh=null;const mw=r=>async e=>{const t=e&&await e.getIdTokenResult(),n=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(n&&n>gw)return;const s=t==null?void 0:t.token;gh!==s&&(gh=s,await fetch(r,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function ae(r=gc()){const e=cs(r,"auth");if(e.isInitialized())return e.getImmediate();const t=eD(r,{popupRedirectResolver:hw,persistence:[Zd,Wd,Sc]}),n=Yf("authTokenSyncURL");if(n&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(n,location.origin);if(location.origin===i.origin){const o=mw(i.toString());$D(t,o,()=>o(t.currentUser)),QD(t,B=>o(B))}}const s=Qf("auth");return s&&KB(t,`http://${s}`),t}function Ew(){var r;return((r=document.getElementsByTagName("head"))==null?void 0:r[0])??document}U_({loadJS(r){return new Promise((e,t)=>{const n=document.createElement("script");n.setAttribute("src",r),n.onload=e,n.onerror=s=>{const i=ft("internal-error");i.customData=s,t(i)},n.type="text/javascript",n.charset="UTF-8",Ew().appendChild(n)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Cw("Browser");var mh=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Jn,BC;(function(){var r;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(v,E){function D(){}D.prototype=E.prototype,v.F=E.prototype,v.prototype=new D,v.prototype.constructor=v,v.D=function(A,w,P){for(var _=Array(arguments.length-2),Je=2;Je<arguments.length;Je++)_[Je-2]=arguments[Je];return E.prototype[w].apply(A,_)}}function t(){this.blockSize=-1}function n(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(n,t),n.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(v,E,D){D||(D=0);const A=Array(16);if(typeof E=="string")for(var w=0;w<16;++w)A[w]=E.charCodeAt(D++)|E.charCodeAt(D++)<<8|E.charCodeAt(D++)<<16|E.charCodeAt(D++)<<24;else for(w=0;w<16;++w)A[w]=E[D++]|E[D++]<<8|E[D++]<<16|E[D++]<<24;E=v.g[0],D=v.g[1],w=v.g[2];let P=v.g[3],_;_=E+(P^D&(w^P))+A[0]+3614090360&4294967295,E=D+(_<<7&4294967295|_>>>25),_=P+(w^E&(D^w))+A[1]+3905402710&4294967295,P=E+(_<<12&4294967295|_>>>20),_=w+(D^P&(E^D))+A[2]+606105819&4294967295,w=P+(_<<17&4294967295|_>>>15),_=D+(E^w&(P^E))+A[3]+3250441966&4294967295,D=w+(_<<22&4294967295|_>>>10),_=E+(P^D&(w^P))+A[4]+4118548399&4294967295,E=D+(_<<7&4294967295|_>>>25),_=P+(w^E&(D^w))+A[5]+1200080426&4294967295,P=E+(_<<12&4294967295|_>>>20),_=w+(D^P&(E^D))+A[6]+2821735955&4294967295,w=P+(_<<17&4294967295|_>>>15),_=D+(E^w&(P^E))+A[7]+4249261313&4294967295,D=w+(_<<22&4294967295|_>>>10),_=E+(P^D&(w^P))+A[8]+1770035416&4294967295,E=D+(_<<7&4294967295|_>>>25),_=P+(w^E&(D^w))+A[9]+2336552879&4294967295,P=E+(_<<12&4294967295|_>>>20),_=w+(D^P&(E^D))+A[10]+4294925233&4294967295,w=P+(_<<17&4294967295|_>>>15),_=D+(E^w&(P^E))+A[11]+2304563134&4294967295,D=w+(_<<22&4294967295|_>>>10),_=E+(P^D&(w^P))+A[12]+1804603682&4294967295,E=D+(_<<7&4294967295|_>>>25),_=P+(w^E&(D^w))+A[13]+4254626195&4294967295,P=E+(_<<12&4294967295|_>>>20),_=w+(D^P&(E^D))+A[14]+2792965006&4294967295,w=P+(_<<17&4294967295|_>>>15),_=D+(E^w&(P^E))+A[15]+1236535329&4294967295,D=w+(_<<22&4294967295|_>>>10),_=E+(w^P&(D^w))+A[1]+4129170786&4294967295,E=D+(_<<5&4294967295|_>>>27),_=P+(D^w&(E^D))+A[6]+3225465664&4294967295,P=E+(_<<9&4294967295|_>>>23),_=w+(E^D&(P^E))+A[11]+643717713&4294967295,w=P+(_<<14&4294967295|_>>>18),_=D+(P^E&(w^P))+A[0]+3921069994&4294967295,D=w+(_<<20&4294967295|_>>>12),_=E+(w^P&(D^w))+A[5]+3593408605&4294967295,E=D+(_<<5&4294967295|_>>>27),_=P+(D^w&(E^D))+A[10]+38016083&4294967295,P=E+(_<<9&4294967295|_>>>23),_=w+(E^D&(P^E))+A[15]+3634488961&4294967295,w=P+(_<<14&4294967295|_>>>18),_=D+(P^E&(w^P))+A[4]+3889429448&4294967295,D=w+(_<<20&4294967295|_>>>12),_=E+(w^P&(D^w))+A[9]+568446438&4294967295,E=D+(_<<5&4294967295|_>>>27),_=P+(D^w&(E^D))+A[14]+3275163606&4294967295,P=E+(_<<9&4294967295|_>>>23),_=w+(E^D&(P^E))+A[3]+4107603335&4294967295,w=P+(_<<14&4294967295|_>>>18),_=D+(P^E&(w^P))+A[8]+1163531501&4294967295,D=w+(_<<20&4294967295|_>>>12),_=E+(w^P&(D^w))+A[13]+2850285829&4294967295,E=D+(_<<5&4294967295|_>>>27),_=P+(D^w&(E^D))+A[2]+4243563512&4294967295,P=E+(_<<9&4294967295|_>>>23),_=w+(E^D&(P^E))+A[7]+1735328473&4294967295,w=P+(_<<14&4294967295|_>>>18),_=D+(P^E&(w^P))+A[12]+2368359562&4294967295,D=w+(_<<20&4294967295|_>>>12),_=E+(D^w^P)+A[5]+4294588738&4294967295,E=D+(_<<4&4294967295|_>>>28),_=P+(E^D^w)+A[8]+2272392833&4294967295,P=E+(_<<11&4294967295|_>>>21),_=w+(P^E^D)+A[11]+1839030562&4294967295,w=P+(_<<16&4294967295|_>>>16),_=D+(w^P^E)+A[14]+4259657740&4294967295,D=w+(_<<23&4294967295|_>>>9),_=E+(D^w^P)+A[1]+2763975236&4294967295,E=D+(_<<4&4294967295|_>>>28),_=P+(E^D^w)+A[4]+1272893353&4294967295,P=E+(_<<11&4294967295|_>>>21),_=w+(P^E^D)+A[7]+4139469664&4294967295,w=P+(_<<16&4294967295|_>>>16),_=D+(w^P^E)+A[10]+3200236656&4294967295,D=w+(_<<23&4294967295|_>>>9),_=E+(D^w^P)+A[13]+681279174&4294967295,E=D+(_<<4&4294967295|_>>>28),_=P+(E^D^w)+A[0]+3936430074&4294967295,P=E+(_<<11&4294967295|_>>>21),_=w+(P^E^D)+A[3]+3572445317&4294967295,w=P+(_<<16&4294967295|_>>>16),_=D+(w^P^E)+A[6]+76029189&4294967295,D=w+(_<<23&4294967295|_>>>9),_=E+(D^w^P)+A[9]+3654602809&4294967295,E=D+(_<<4&4294967295|_>>>28),_=P+(E^D^w)+A[12]+3873151461&4294967295,P=E+(_<<11&4294967295|_>>>21),_=w+(P^E^D)+A[15]+530742520&4294967295,w=P+(_<<16&4294967295|_>>>16),_=D+(w^P^E)+A[2]+3299628645&4294967295,D=w+(_<<23&4294967295|_>>>9),_=E+(w^(D|~P))+A[0]+4096336452&4294967295,E=D+(_<<6&4294967295|_>>>26),_=P+(D^(E|~w))+A[7]+1126891415&4294967295,P=E+(_<<10&4294967295|_>>>22),_=w+(E^(P|~D))+A[14]+2878612391&4294967295,w=P+(_<<15&4294967295|_>>>17),_=D+(P^(w|~E))+A[5]+4237533241&4294967295,D=w+(_<<21&4294967295|_>>>11),_=E+(w^(D|~P))+A[12]+1700485571&4294967295,E=D+(_<<6&4294967295|_>>>26),_=P+(D^(E|~w))+A[3]+2399980690&4294967295,P=E+(_<<10&4294967295|_>>>22),_=w+(E^(P|~D))+A[10]+4293915773&4294967295,w=P+(_<<15&4294967295|_>>>17),_=D+(P^(w|~E))+A[1]+2240044497&4294967295,D=w+(_<<21&4294967295|_>>>11),_=E+(w^(D|~P))+A[8]+1873313359&4294967295,E=D+(_<<6&4294967295|_>>>26),_=P+(D^(E|~w))+A[15]+4264355552&4294967295,P=E+(_<<10&4294967295|_>>>22),_=w+(E^(P|~D))+A[6]+2734768916&4294967295,w=P+(_<<15&4294967295|_>>>17),_=D+(P^(w|~E))+A[13]+1309151649&4294967295,D=w+(_<<21&4294967295|_>>>11),_=E+(w^(D|~P))+A[4]+4149444226&4294967295,E=D+(_<<6&4294967295|_>>>26),_=P+(D^(E|~w))+A[11]+3174756917&4294967295,P=E+(_<<10&4294967295|_>>>22),_=w+(E^(P|~D))+A[2]+718787259&4294967295,w=P+(_<<15&4294967295|_>>>17),_=D+(P^(w|~E))+A[9]+3951481745&4294967295,v.g[0]=v.g[0]+E&4294967295,v.g[1]=v.g[1]+(w+(_<<21&4294967295|_>>>11))&4294967295,v.g[2]=v.g[2]+w&4294967295,v.g[3]=v.g[3]+P&4294967295}n.prototype.v=function(v,E){E===void 0&&(E=v.length);const D=E-this.blockSize,A=this.C;let w=this.h,P=0;for(;P<E;){if(w==0)for(;P<=D;)s(this,v,P),P+=this.blockSize;if(typeof v=="string"){for(;P<E;)if(A[w++]=v.charCodeAt(P++),w==this.blockSize){s(this,A),w=0;break}}else for(;P<E;)if(A[w++]=v[P++],w==this.blockSize){s(this,A),w=0;break}}this.h=w,this.o+=E},n.prototype.A=function(){var v=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);v[0]=128;for(var E=1;E<v.length-8;++E)v[E]=0;E=this.o*8;for(var D=v.length-8;D<v.length;++D)v[D]=E&255,E/=256;for(this.v(v),v=Array(16),E=0,D=0;D<4;++D)for(let A=0;A<32;A+=8)v[E++]=this.g[D]>>>A&255;return v};function i(v,E){var D=B;return Object.prototype.hasOwnProperty.call(D,v)?D[v]:D[v]=E(v)}function o(v,E){this.h=E;const D=[];let A=!0;for(let w=v.length-1;w>=0;w--){const P=v[w]|0;A&&P==E||(D[w]=P,A=!1)}this.g=D}var B={};function c(v){return-128<=v&&v<128?i(v,function(E){return new o([E|0],E<0?-1:0)}):new o([v|0],v<0?-1:0)}function u(v){if(isNaN(v)||!isFinite(v))return d;if(v<0)return M(u(-v));const E=[];let D=1;for(let A=0;v>=D;A++)E[A]=v/D|0,D*=4294967296;return new o(E,0)}function h(v,E){if(v.length==0)throw Error("number format error: empty string");if(E=E||10,E<2||36<E)throw Error("radix out of range: "+E);if(v.charAt(0)=="-")return M(h(v.substring(1),E));if(v.indexOf("-")>=0)throw Error('number format error: interior "-" character');const D=u(Math.pow(E,8));let A=d;for(let P=0;P<v.length;P+=8){var w=Math.min(8,v.length-P);const _=parseInt(v.substring(P,P+w),E);w<8?(w=u(Math.pow(E,w)),A=A.j(w).add(u(_))):(A=A.j(D),A=A.add(u(_)))}return A}var d=c(0),p=c(1),I=c(16777216);r=o.prototype,r.m=function(){if(k(this))return-M(this).m();let v=0,E=1;for(let D=0;D<this.g.length;D++){const A=this.i(D);v+=(A>=0?A:4294967296+A)*E,E*=4294967296}return v},r.toString=function(v){if(v=v||10,v<2||36<v)throw Error("radix out of range: "+v);if(R(this))return"0";if(k(this))return"-"+M(this).toString(v);const E=u(Math.pow(v,6));var D=this;let A="";for(;;){const w=Se(D,E).g;D=z(D,w.j(E));let P=((D.g.length>0?D.g[0]:D.h)>>>0).toString(v);if(D=w,R(D))return P+A;for(;P.length<6;)P="0"+P;A=P+A}},r.i=function(v){return v<0?0:v<this.g.length?this.g[v]:this.h};function R(v){if(v.h!=0)return!1;for(let E=0;E<v.g.length;E++)if(v.g[E]!=0)return!1;return!0}function k(v){return v.h==-1}r.l=function(v){return v=z(this,v),k(v)?-1:R(v)?0:1};function M(v){const E=v.g.length,D=[];for(let A=0;A<E;A++)D[A]=~v.g[A];return new o(D,~v.h).add(p)}r.abs=function(){return k(this)?M(this):this},r.add=function(v){const E=Math.max(this.g.length,v.g.length),D=[];let A=0;for(let w=0;w<=E;w++){let P=A+(this.i(w)&65535)+(v.i(w)&65535),_=(P>>>16)+(this.i(w)>>>16)+(v.i(w)>>>16);A=_>>>16,P&=65535,_&=65535,D[w]=_<<16|P}return new o(D,D[D.length-1]&-2147483648?-1:0)};function z(v,E){return v.add(M(E))}r.j=function(v){if(R(this)||R(v))return d;if(k(this))return k(v)?M(this).j(M(v)):M(M(this).j(v));if(k(v))return M(this.j(M(v)));if(this.l(I)<0&&v.l(I)<0)return u(this.m()*v.m());const E=this.g.length+v.g.length,D=[];for(var A=0;A<2*E;A++)D[A]=0;for(A=0;A<this.g.length;A++)for(let w=0;w<v.g.length;w++){const P=this.i(A)>>>16,_=this.i(A)&65535,Je=v.i(w)>>>16,Nt=v.i(w)&65535;D[2*A+2*w]+=_*Nt,re(D,2*A+2*w),D[2*A+2*w+1]+=P*Nt,re(D,2*A+2*w+1),D[2*A+2*w+1]+=_*Je,re(D,2*A+2*w+1),D[2*A+2*w+2]+=P*Je,re(D,2*A+2*w+2)}for(v=0;v<E;v++)D[v]=D[2*v+1]<<16|D[2*v];for(v=E;v<2*E;v++)D[v]=0;return new o(D,0)};function re(v,E){for(;(v[E]&65535)!=v[E];)v[E+1]+=v[E]>>>16,v[E]&=65535,E++}function pe(v,E){this.g=v,this.h=E}function Se(v,E){if(R(E))throw Error("division by zero");if(R(v))return new pe(d,d);if(k(v))return E=Se(M(v),E),new pe(M(E.g),M(E.h));if(k(E))return E=Se(v,M(E)),new pe(M(E.g),E.h);if(v.g.length>30){if(k(v)||k(E))throw Error("slowDivide_ only works with positive integers.");for(var D=p,A=E;A.l(v)<=0;)D=Oe(D),A=Oe(A);var w=Ae(D,1),P=Ae(A,1);for(A=Ae(A,2),D=Ae(D,2);!R(A);){var _=P.add(A);_.l(v)<=0&&(w=w.add(D),P=_),A=Ae(A,1),D=Ae(D,1)}return E=z(v,w.j(E)),new pe(w,E)}for(w=d;v.l(E)>=0;){for(D=Math.max(1,Math.floor(v.m()/E.m())),A=Math.ceil(Math.log(D)/Math.LN2),A=A<=48?1:Math.pow(2,A-48),P=u(D),_=P.j(E);k(_)||_.l(v)>0;)D-=A,P=u(D),_=P.j(E);R(P)&&(P=p),w=w.add(P),v=z(v,_)}return new pe(w,v)}r.B=function(v){return Se(this,v).h},r.and=function(v){const E=Math.max(this.g.length,v.g.length),D=[];for(let A=0;A<E;A++)D[A]=this.i(A)&v.i(A);return new o(D,this.h&v.h)},r.or=function(v){const E=Math.max(this.g.length,v.g.length),D=[];for(let A=0;A<E;A++)D[A]=this.i(A)|v.i(A);return new o(D,this.h|v.h)},r.xor=function(v){const E=Math.max(this.g.length,v.g.length),D=[];for(let A=0;A<E;A++)D[A]=this.i(A)^v.i(A);return new o(D,this.h^v.h)};function Oe(v){const E=v.g.length+1,D=[];for(let A=0;A<E;A++)D[A]=v.i(A)<<1|v.i(A-1)>>>31;return new o(D,v.h)}function Ae(v,E){const D=E>>5;E%=32;const A=v.g.length-D,w=[];for(let P=0;P<A;P++)w[P]=E>0?v.i(P+D)>>>E|v.i(P+D+1)<<32-E:v.i(P+D);return new o(w,v.h)}n.prototype.digest=n.prototype.A,n.prototype.reset=n.prototype.u,n.prototype.update=n.prototype.v,BC=n,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.B,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=u,o.fromString=h,Jn=o}).apply(typeof mh<"u"?mh:typeof self<"u"?self:typeof window<"u"?window:{});var fo=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var cC,Ks,uC,Po,WB,lC,hC,fC;(function(){var r,e=Object.defineProperty;function t(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof fo=="object"&&fo];for(var l=0;l<a.length;++l){var f=a[l];if(f&&f.Math==Math)return f}throw Error("Cannot find global object")}var n=t(this);function s(a,l){if(l)e:{var f=n;a=a.split(".");for(var C=0;C<a.length-1;C++){var S=a[C];if(!(S in f))break e;f=f[S]}a=a[a.length-1],C=f[a],l=l(C),l!=C&&l!=null&&e(f,a,{configurable:!0,writable:!0,value:l})}}s("Symbol.dispose",function(a){return a||Symbol("Symbol.dispose")}),s("Array.prototype.values",function(a){return a||function(){return this[Symbol.iterator]()}}),s("Object.entries",function(a){return a||function(l){var f=[],C;for(C in l)Object.prototype.hasOwnProperty.call(l,C)&&f.push([C,l[C]]);return f}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var i=i||{},o=this||self;function B(a){var l=typeof a;return l=="object"&&a!=null||l=="function"}function c(a,l,f){return a.call.apply(a.bind,arguments)}function u(a,l,f){return u=c,u.apply(null,arguments)}function h(a,l){var f=Array.prototype.slice.call(arguments,1);return function(){var C=f.slice();return C.push.apply(C,arguments),a.apply(this,C)}}function d(a,l){function f(){}f.prototype=l.prototype,a.Z=l.prototype,a.prototype=new f,a.prototype.constructor=a,a.Ob=function(C,S,O){for(var j=Array(arguments.length-2),ie=2;ie<arguments.length;ie++)j[ie-2]=arguments[ie];return l.prototype[S].apply(C,j)}}var p=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?a=>a&&AsyncContext.Snapshot.wrap(a):a=>a;function I(a){const l=a.length;if(l>0){const f=Array(l);for(let C=0;C<l;C++)f[C]=a[C];return f}return[]}function R(a,l){for(let C=1;C<arguments.length;C++){const S=arguments[C];var f=typeof S;if(f=f!="object"?f:S?Array.isArray(S)?"array":f:"null",f=="array"||f=="object"&&typeof S.length=="number"){f=a.length||0;const O=S.length||0;a.length=f+O;for(let j=0;j<O;j++)a[f+j]=S[j]}else a.push(S)}}class k{constructor(l,f){this.i=l,this.j=f,this.h=0,this.g=null}get(){let l;return this.h>0?(this.h--,l=this.g,this.g=l.next,l.next=null):l=this.i(),l}}function M(a){o.setTimeout(()=>{throw a},0)}function z(){var a=v;let l=null;return a.g&&(l=a.g,a.g=a.g.next,a.g||(a.h=null),l.next=null),l}class re{constructor(){this.h=this.g=null}add(l,f){const C=pe.get();C.set(l,f),this.h?this.h.next=C:this.g=C,this.h=C}}var pe=new k(()=>new Se,a=>a.reset());class Se{constructor(){this.next=this.g=this.h=null}set(l,f){this.h=l,this.g=f,this.next=null}reset(){this.next=this.g=this.h=null}}let Oe,Ae=!1,v=new re,E=()=>{const a=Promise.resolve(void 0);Oe=()=>{a.then(D)}};function D(){for(var a;a=z();){try{a.h.call(a.g)}catch(f){M(f)}var l=pe;l.j(a),l.h<100&&(l.h++,a.next=l.g,l.g=a)}Ae=!1}function A(){this.u=this.u,this.C=this.C}A.prototype.u=!1,A.prototype.dispose=function(){this.u||(this.u=!0,this.N())},A.prototype[Symbol.dispose]=function(){this.dispose()},A.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function w(a,l){this.type=a,this.g=this.target=l,this.defaultPrevented=!1}w.prototype.h=function(){this.defaultPrevented=!0};var P=(function(){if(!o.addEventListener||!Object.defineProperty)return!1;var a=!1,l=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const f=()=>{};o.addEventListener("test",f,l),o.removeEventListener("test",f,l)}catch{}return a})();function _(a){return/^[\s\xa0]*$/.test(a)}function Je(a,l){w.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a&&this.init(a,l)}d(Je,w),Je.prototype.init=function(a,l){const f=this.type=a.type,C=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement,this.g=l,l=a.relatedTarget,l||(f=="mouseover"?l=a.fromElement:f=="mouseout"&&(l=a.toElement)),this.relatedTarget=l,C?(this.clientX=C.clientX!==void 0?C.clientX:C.pageX,this.clientY=C.clientY!==void 0?C.clientY:C.pageY,this.screenX=C.screenX||0,this.screenY=C.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=a.pointerType,this.state=a.state,this.i=a,a.defaultPrevented&&Je.Z.h.call(this)},Je.prototype.h=function(){Je.Z.h.call(this);const a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var Nt="closure_listenable_"+(Math.random()*1e6|0),lg=0;function hg(a,l,f,C,S){this.listener=a,this.proxy=null,this.src=l,this.type=f,this.capture=!!C,this.ha=S,this.key=++lg,this.da=this.fa=!1}function zi(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function Qi(a,l,f){for(const C in a)l.call(f,a[C],C,a)}function fg(a,l){for(const f in a)l.call(void 0,a[f],f,a)}function bu(a){const l={};for(const f in a)l[f]=a[f];return l}const Nu="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Lu(a,l){let f,C;for(let S=1;S<arguments.length;S++){C=arguments[S];for(f in C)a[f]=C[f];for(let O=0;O<Nu.length;O++)f=Nu[O],Object.prototype.hasOwnProperty.call(C,f)&&(a[f]=C[f])}}function $i(a){this.src=a,this.g={},this.h=0}$i.prototype.add=function(a,l,f,C,S){const O=a.toString();a=this.g[O],a||(a=this.g[O]=[],this.h++);const j=Ka(a,l,C,S);return j>-1?(l=a[j],f||(l.fa=!1)):(l=new hg(l,this.src,O,!!C,S),l.fa=f,a.push(l)),l};function qa(a,l){const f=l.type;if(f in a.g){var C=a.g[f],S=Array.prototype.indexOf.call(C,l,void 0),O;(O=S>=0)&&Array.prototype.splice.call(C,S,1),O&&(zi(l),a.g[f].length==0&&(delete a.g[f],a.h--))}}function Ka(a,l,f,C){for(let S=0;S<a.length;++S){const O=a[S];if(!O.da&&O.listener==l&&O.capture==!!f&&O.ha==C)return S}return-1}var Wa="closure_lm_"+(Math.random()*1e6|0),za={};function Fu(a,l,f,C,S){if(Array.isArray(l)){for(let O=0;O<l.length;O++)Fu(a,l[O],f,C,S);return null}return f=xu(f),a&&a[Nt]?a.J(l,f,B(C)?!!C.capture:!1,S):dg(a,l,f,!1,C,S)}function dg(a,l,f,C,S,O){if(!l)throw Error("Invalid event type");const j=B(S)?!!S.capture:!!S;let ie=$a(a);if(ie||(a[Wa]=ie=new $i(a)),f=ie.add(l,f,C,j,O),f.proxy)return f;if(C=Cg(),f.proxy=C,C.src=a,C.listener=f,a.addEventListener)P||(S=j),S===void 0&&(S=!1),a.addEventListener(l.toString(),C,S);else if(a.attachEvent)a.attachEvent(Vu(l.toString()),C);else if(a.addListener&&a.removeListener)a.addListener(C);else throw Error("addEventListener and attachEvent are unavailable.");return f}function Cg(){function a(f){return l.call(a.src,a.listener,f)}const l=pg;return a}function ku(a,l,f,C,S){if(Array.isArray(l))for(var O=0;O<l.length;O++)ku(a,l[O],f,C,S);else C=B(C)?!!C.capture:!!C,f=xu(f),a&&a[Nt]?(a=a.i,O=String(l).toString(),O in a.g&&(l=a.g[O],f=Ka(l,f,C,S),f>-1&&(zi(l[f]),Array.prototype.splice.call(l,f,1),l.length==0&&(delete a.g[O],a.h--)))):a&&(a=$a(a))&&(l=a.g[l.toString()],a=-1,l&&(a=Ka(l,f,C,S)),(f=a>-1?l[a]:null)&&Qa(f))}function Qa(a){if(typeof a!="number"&&a&&!a.da){var l=a.src;if(l&&l[Nt])qa(l.i,a);else{var f=a.type,C=a.proxy;l.removeEventListener?l.removeEventListener(f,C,a.capture):l.detachEvent?l.detachEvent(Vu(f),C):l.addListener&&l.removeListener&&l.removeListener(C),(f=$a(l))?(qa(f,a),f.h==0&&(f.src=null,l[Wa]=null)):zi(a)}}}function Vu(a){return a in za?za[a]:za[a]="on"+a}function pg(a,l){if(a.da)a=!0;else{l=new Je(l,this);const f=a.listener,C=a.ha||a.src;a.fa&&Qa(a),a=f.call(C,l)}return a}function $a(a){return a=a[Wa],a instanceof $i?a:null}var Ya="__closure_events_fn_"+(Math.random()*1e9>>>0);function xu(a){return typeof a=="function"?a:(a[Ya]||(a[Ya]=function(l){return a.handleEvent(l)}),a[Ya])}function rt(){A.call(this),this.i=new $i(this),this.M=this,this.G=null}d(rt,A),rt.prototype[Nt]=!0,rt.prototype.removeEventListener=function(a,l,f,C){ku(this,a,l,f,C)};function ct(a,l){var f,C=a.G;if(C)for(f=[];C;C=C.G)f.push(C);if(a=a.M,C=l.type||l,typeof l=="string")l=new w(l,a);else if(l instanceof w)l.target=l.target||a;else{var S=l;l=new w(C,a),Lu(l,S)}S=!0;let O,j;if(f)for(j=f.length-1;j>=0;j--)O=l.g=f[j],S=Yi(O,C,!0,l)&&S;if(O=l.g=a,S=Yi(O,C,!0,l)&&S,S=Yi(O,C,!1,l)&&S,f)for(j=0;j<f.length;j++)O=l.g=f[j],S=Yi(O,C,!1,l)&&S}rt.prototype.N=function(){if(rt.Z.N.call(this),this.i){var a=this.i;for(const l in a.g){const f=a.g[l];for(let C=0;C<f.length;C++)zi(f[C]);delete a.g[l],a.h--}}this.G=null},rt.prototype.J=function(a,l,f,C){return this.i.add(String(a),l,!1,f,C)},rt.prototype.K=function(a,l,f,C){return this.i.add(String(a),l,!0,f,C)};function Yi(a,l,f,C){if(l=a.i.g[String(l)],!l)return!0;l=l.concat();let S=!0;for(let O=0;O<l.length;++O){const j=l[O];if(j&&!j.da&&j.capture==f){const ie=j.listener,je=j.ha||j.src;j.fa&&qa(a.i,j),S=ie.call(je,C)!==!1&&S}}return S&&!C.defaultPrevented}function gg(a,l){if(typeof a!="function")if(a&&typeof a.handleEvent=="function")a=u(a.handleEvent,a);else throw Error("Invalid listener argument");return Number(l)>2147483647?-1:o.setTimeout(a,l||0)}function Mu(a){a.g=gg(()=>{a.g=null,a.i&&(a.i=!1,Mu(a))},a.l);const l=a.h;a.h=null,a.m.apply(null,l)}class mg extends A{constructor(l,f){super(),this.m=l,this.l=f,this.h=null,this.i=!1,this.g=null}j(l){this.h=arguments,this.g?this.i=!0:Mu(this)}N(){super.N(),this.g&&(o.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function ys(a){A.call(this),this.h=a,this.g={}}d(ys,A);var Gu=[];function Uu(a){Qi(a.g,function(l,f){this.g.hasOwnProperty(f)&&Qa(l)},a),a.g={}}ys.prototype.N=function(){ys.Z.N.call(this),Uu(this)},ys.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Xa=o.JSON.stringify,Eg=o.JSON.parse,_g=class{stringify(a){return o.JSON.stringify(a,void 0)}parse(a){return o.JSON.parse(a,void 0)}};function Hu(){}function Ju(){}var Ts={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function Za(){w.call(this,"d")}d(Za,w);function eB(){w.call(this,"c")}d(eB,w);var Br={},ju=null;function Xi(){return ju=ju||new rt}Br.Ia="serverreachability";function qu(a){w.call(this,Br.Ia,a)}d(qu,w);function As(a){const l=Xi();ct(l,new qu(l))}Br.STAT_EVENT="statevent";function Ku(a,l){w.call(this,Br.STAT_EVENT,a),this.stat=l}d(Ku,w);function ut(a){const l=Xi();ct(l,new Ku(l,a))}Br.Ja="timingevent";function Wu(a,l){w.call(this,Br.Ja,a),this.size=l}d(Wu,w);function Rs(a,l){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return o.setTimeout(function(){a()},l)}function vs(){this.g=!0}vs.prototype.ua=function(){this.g=!1};function Dg(a,l,f,C,S,O){a.info(function(){if(a.g)if(O){var j="",ie=O.split("&");for(let ge=0;ge<ie.length;ge++){var je=ie[ge].split("=");if(je.length>1){const Qe=je[0];je=je[1];const Kt=Qe.split("_");j=Kt.length>=2&&Kt[1]=="type"?j+(Qe+"="+je+"&"):j+(Qe+"=redacted&")}}}else j=null;else j=O;return"XMLHTTP REQ ("+C+") [attempt "+S+"]: "+l+`
`+f+`
`+j})}function Ig(a,l,f,C,S,O,j){a.info(function(){return"XMLHTTP RESP ("+C+") [ attempt "+S+"]: "+l+`
`+f+`
`+O+" "+j})}function Or(a,l,f,C){a.info(function(){return"XMLHTTP TEXT ("+l+"): "+yg(a,f)+(C?" "+C:"")})}function wg(a,l){a.info(function(){return"TIMEOUT: "+l})}vs.prototype.info=function(){};function yg(a,l){if(!a.g)return l;if(!l)return null;try{const O=JSON.parse(l);if(O){for(a=0;a<O.length;a++)if(Array.isArray(O[a])){var f=O[a];if(!(f.length<2)){var C=f[1];if(Array.isArray(C)&&!(C.length<1)){var S=C[0];if(S!="noop"&&S!="stop"&&S!="close")for(let j=1;j<C.length;j++)C[j]=""}}}}return Xa(O)}catch{return l}}var Zi={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},zu={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},Qu;function tB(){}d(tB,Hu),tB.prototype.g=function(){return new XMLHttpRequest},Qu=new tB;function Ps(a){return encodeURIComponent(String(a))}function Tg(a){var l=1;a=a.split(":");const f=[];for(;l>0&&a.length;)f.push(a.shift()),l--;return a.length&&f.push(a.join(":")),f}function An(a,l,f,C){this.j=a,this.i=l,this.l=f,this.S=C||1,this.V=new ys(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new $u}function $u(){this.i=null,this.g="",this.h=!1}var Yu={},nB={};function rB(a,l,f){a.M=1,a.A=to(qt(l)),a.u=f,a.R=!0,Xu(a,null)}function Xu(a,l){a.F=Date.now(),eo(a),a.B=qt(a.A);var f=a.B,C=a.S;Array.isArray(C)||(C=[String(C)]),ll(f.i,"t",C),a.C=0,f=a.j.L,a.h=new $u,a.g=Pl(a.j,f?l:null,!a.u),a.P>0&&(a.O=new mg(u(a.Y,a,a.g),a.P)),l=a.V,f=a.g,C=a.ba;var S="readystatechange";Array.isArray(S)||(S&&(Gu[0]=S.toString()),S=Gu);for(let O=0;O<S.length;O++){const j=Fu(f,S[O],C||l.handleEvent,!1,l.h||l);if(!j)break;l.g[j.key]=j}l=a.J?bu(a.J):{},a.u?(a.v||(a.v="POST"),l["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.B,a.v,a.u,l)):(a.v="GET",a.g.ea(a.B,a.v,null,l)),As(),Dg(a.i,a.v,a.B,a.l,a.S,a.u)}An.prototype.ba=function(a){a=a.target;const l=this.O;l&&Pn(a)==3?l.j():this.Y(a)},An.prototype.Y=function(a){try{if(a==this.g)e:{const ie=Pn(this.g),je=this.g.ya(),ge=this.g.ca();if(!(ie<3)&&(ie!=3||this.g&&(this.h.h||this.g.la()||ml(this.g)))){this.K||ie!=4||je==7||(je==8||ge<=0?As(3):As(2)),sB(this);var l=this.g.ca();this.X=l;var f=Ag(this);if(this.o=l==200,Ig(this.i,this.v,this.B,this.l,this.S,ie,l),this.o){if(this.U&&!this.L){t:{if(this.g){var C,S=this.g;if((C=S.g?S.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!_(C)){var O=C;break t}}O=null}if(a=O)Or(this.i,this.l,a,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,iB(this,a);else{this.o=!1,this.m=3,ut(12),cr(this),Ss(this);break e}}if(this.R){a=!0;let Qe;for(;!this.K&&this.C<f.length;)if(Qe=Rg(this,f),Qe==nB){ie==4&&(this.m=4,ut(14),a=!1),Or(this.i,this.l,null,"[Incomplete Response]");break}else if(Qe==Yu){this.m=4,ut(15),Or(this.i,this.l,f,"[Invalid Chunk]"),a=!1;break}else Or(this.i,this.l,Qe,null),iB(this,Qe);if(Zu(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),ie!=4||f.length!=0||this.h.h||(this.m=1,ut(16),a=!1),this.o=this.o&&a,!a)Or(this.i,this.l,f,"[Invalid Chunked Response]"),cr(this),Ss(this);else if(f.length>0&&!this.W){this.W=!0;var j=this.j;j.g==this&&j.aa&&!j.P&&(j.j.info("Great, no buffering proxy detected. Bytes received: "+f.length),fB(j),j.P=!0,ut(11))}}else Or(this.i,this.l,f,null),iB(this,f);ie==4&&cr(this),this.o&&!this.K&&(ie==4?Tl(this.j,this):(this.o=!1,eo(this)))}else Ug(this.g),l==400&&f.indexOf("Unknown SID")>0?(this.m=3,ut(12)):(this.m=0,ut(13)),cr(this),Ss(this)}}}catch{}finally{}};function Ag(a){if(!Zu(a))return a.g.la();const l=ml(a.g);if(l==="")return"";let f="";const C=l.length,S=Pn(a.g)==4;if(!a.h.i){if(typeof TextDecoder>"u")return cr(a),Ss(a),"";a.h.i=new o.TextDecoder}for(let O=0;O<C;O++)a.h.h=!0,f+=a.h.i.decode(l[O],{stream:!(S&&O==C-1)});return l.length=0,a.h.g+=f,a.C=0,a.h.g}function Zu(a){return a.g?a.v=="GET"&&a.M!=2&&a.j.Aa:!1}function Rg(a,l){var f=a.C,C=l.indexOf(`
`,f);return C==-1?nB:(f=Number(l.substring(f,C)),isNaN(f)?Yu:(C+=1,C+f>l.length?nB:(l=l.slice(C,C+f),a.C=C+f,l)))}An.prototype.cancel=function(){this.K=!0,cr(this)};function eo(a){a.T=Date.now()+a.H,el(a,a.H)}function el(a,l){if(a.D!=null)throw Error("WatchDog timer not null");a.D=Rs(u(a.aa,a),l)}function sB(a){a.D&&(o.clearTimeout(a.D),a.D=null)}An.prototype.aa=function(){this.D=null;const a=Date.now();a-this.T>=0?(wg(this.i,this.B),this.M!=2&&(As(),ut(17)),cr(this),this.m=2,Ss(this)):el(this,this.T-a)};function Ss(a){a.j.I==0||a.K||Tl(a.j,a)}function cr(a){sB(a);var l=a.O;l&&typeof l.dispose=="function"&&l.dispose(),a.O=null,Uu(a.V),a.g&&(l=a.g,a.g=null,l.abort(),l.dispose())}function iB(a,l){try{var f=a.j;if(f.I!=0&&(f.g==a||oB(f.h,a))){if(!a.L&&oB(f.h,a)&&f.I==3){try{var C=f.Ba.g.parse(l)}catch{C=null}if(Array.isArray(C)&&C.length==3){var S=C;if(S[0]==0){e:if(!f.v){if(f.g)if(f.g.F+3e3<a.F)oo(f),so(f);else break e;hB(f),ut(18)}}else f.xa=S[1],0<f.xa-f.K&&S[2]<37500&&f.F&&f.A==0&&!f.C&&(f.C=Rs(u(f.Va,f),6e3));rl(f.h)<=1&&f.ta&&(f.ta=void 0)}else lr(f,11)}else if((a.L||f.g==a)&&oo(f),!_(l))for(S=f.Ba.g.parse(l),l=0;l<S.length;l++){let ge=S[l];const Qe=ge[0];if(!(Qe<=f.K))if(f.K=Qe,ge=ge[1],f.I==2)if(ge[0]=="c"){f.M=ge[1],f.ba=ge[2];const Kt=ge[3];Kt!=null&&(f.ka=Kt,f.j.info("VER="+f.ka));const hr=ge[4];hr!=null&&(f.za=hr,f.j.info("SVER="+f.za));const Sn=ge[5];Sn!=null&&typeof Sn=="number"&&Sn>0&&(C=1.5*Sn,f.O=C,f.j.info("backChannelRequestTimeoutMs_="+C)),C=f;const On=a.g;if(On){const Bo=On.g?On.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Bo){var O=C.h;O.g||Bo.indexOf("spdy")==-1&&Bo.indexOf("quic")==-1&&Bo.indexOf("h2")==-1||(O.j=O.l,O.g=new Set,O.h&&(aB(O,O.h),O.h=null))}if(C.G){const dB=On.g?On.g.getResponseHeader("X-HTTP-Session-Id"):null;dB&&(C.wa=dB,De(C.J,C.G,dB))}}f.I=3,f.l&&f.l.ra(),f.aa&&(f.T=Date.now()-a.F,f.j.info("Handshake RTT: "+f.T+"ms")),C=f;var j=a;if(C.na=vl(C,C.L?C.ba:null,C.W),j.L){sl(C.h,j);var ie=j,je=C.O;je&&(ie.H=je),ie.D&&(sB(ie),eo(ie)),C.g=j}else wl(C);f.i.length>0&&io(f)}else ge[0]!="stop"&&ge[0]!="close"||lr(f,7);else f.I==3&&(ge[0]=="stop"||ge[0]=="close"?ge[0]=="stop"?lr(f,7):lB(f):ge[0]!="noop"&&f.l&&f.l.qa(ge),f.A=0)}}As(4)}catch{}}var vg=class{constructor(a,l){this.g=a,this.map=l}};function tl(a){this.l=a||10,o.PerformanceNavigationTiming?(a=o.performance.getEntriesByType("navigation"),a=a.length>0&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(o.chrome&&o.chrome.loadTimes&&o.chrome.loadTimes()&&o.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function nl(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function rl(a){return a.h?1:a.g?a.g.size:0}function oB(a,l){return a.h?a.h==l:a.g?a.g.has(l):!1}function aB(a,l){a.g?a.g.add(l):a.h=l}function sl(a,l){a.h&&a.h==l?a.h=null:a.g&&a.g.has(l)&&a.g.delete(l)}tl.prototype.cancel=function(){if(this.i=il(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function il(a){if(a.h!=null)return a.i.concat(a.h.G);if(a.g!=null&&a.g.size!==0){let l=a.i;for(const f of a.g.values())l=l.concat(f.G);return l}return I(a.i)}var ol=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Pg(a,l){if(a){a=a.split("&");for(let f=0;f<a.length;f++){const C=a[f].indexOf("=");let S,O=null;C>=0?(S=a[f].substring(0,C),O=a[f].substring(C+1)):S=a[f],l(S,O?decodeURIComponent(O.replace(/\+/g," ")):"")}}}function Rn(a){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let l;a instanceof Rn?(this.l=a.l,Os(this,a.j),this.o=a.o,this.g=a.g,bs(this,a.u),this.h=a.h,BB(this,hl(a.i)),this.m=a.m):a&&(l=String(a).match(ol))?(this.l=!1,Os(this,l[1]||"",!0),this.o=Ns(l[2]||""),this.g=Ns(l[3]||"",!0),bs(this,l[4]),this.h=Ns(l[5]||"",!0),BB(this,l[6]||"",!0),this.m=Ns(l[7]||"")):(this.l=!1,this.i=new Fs(null,this.l))}Rn.prototype.toString=function(){const a=[];var l=this.j;l&&a.push(Ls(l,al,!0),":");var f=this.g;return(f||l=="file")&&(a.push("//"),(l=this.o)&&a.push(Ls(l,al,!0),"@"),a.push(Ps(f).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),f=this.u,f!=null&&a.push(":",String(f))),(f=this.h)&&(this.g&&f.charAt(0)!="/"&&a.push("/"),a.push(Ls(f,f.charAt(0)=="/"?bg:Og,!0))),(f=this.i.toString())&&a.push("?",f),(f=this.m)&&a.push("#",Ls(f,Lg)),a.join("")},Rn.prototype.resolve=function(a){const l=qt(this);let f=!!a.j;f?Os(l,a.j):f=!!a.o,f?l.o=a.o:f=!!a.g,f?l.g=a.g:f=a.u!=null;var C=a.h;if(f)bs(l,a.u);else if(f=!!a.h){if(C.charAt(0)!="/")if(this.g&&!this.h)C="/"+C;else{var S=l.h.lastIndexOf("/");S!=-1&&(C=l.h.slice(0,S+1)+C)}if(S=C,S==".."||S==".")C="";else if(S.indexOf("./")!=-1||S.indexOf("/.")!=-1){C=S.lastIndexOf("/",0)==0,S=S.split("/");const O=[];for(let j=0;j<S.length;){const ie=S[j++];ie=="."?C&&j==S.length&&O.push(""):ie==".."?((O.length>1||O.length==1&&O[0]!="")&&O.pop(),C&&j==S.length&&O.push("")):(O.push(ie),C=!0)}C=O.join("/")}else C=S}return f?l.h=C:f=a.i.toString()!=="",f?BB(l,hl(a.i)):f=!!a.m,f&&(l.m=a.m),l};function qt(a){return new Rn(a)}function Os(a,l,f){a.j=f?Ns(l,!0):l,a.j&&(a.j=a.j.replace(/:$/,""))}function bs(a,l){if(l){if(l=Number(l),isNaN(l)||l<0)throw Error("Bad port number "+l);a.u=l}else a.u=null}function BB(a,l,f){l instanceof Fs?(a.i=l,Fg(a.i,a.l)):(f||(l=Ls(l,Ng)),a.i=new Fs(l,a.l))}function De(a,l,f){a.i.set(l,f)}function to(a){return De(a,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),a}function Ns(a,l){return a?l?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function Ls(a,l,f){return typeof a=="string"?(a=encodeURI(a).replace(l,Sg),f&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function Sg(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var al=/[#\/\?@]/g,Og=/[#\?:]/g,bg=/[#\?]/g,Ng=/[#\?@]/g,Lg=/#/g;function Fs(a,l){this.h=this.g=null,this.i=a||null,this.j=!!l}function ur(a){a.g||(a.g=new Map,a.h=0,a.i&&Pg(a.i,function(l,f){a.add(decodeURIComponent(l.replace(/\+/g," ")),f)}))}r=Fs.prototype,r.add=function(a,l){ur(this),this.i=null,a=br(this,a);let f=this.g.get(a);return f||this.g.set(a,f=[]),f.push(l),this.h+=1,this};function Bl(a,l){ur(a),l=br(a,l),a.g.has(l)&&(a.i=null,a.h-=a.g.get(l).length,a.g.delete(l))}function cl(a,l){return ur(a),l=br(a,l),a.g.has(l)}r.forEach=function(a,l){ur(this),this.g.forEach(function(f,C){f.forEach(function(S){a.call(l,S,C,this)},this)},this)};function ul(a,l){ur(a);let f=[];if(typeof l=="string")cl(a,l)&&(f=f.concat(a.g.get(br(a,l))));else for(a=Array.from(a.g.values()),l=0;l<a.length;l++)f=f.concat(a[l]);return f}r.set=function(a,l){return ur(this),this.i=null,a=br(this,a),cl(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[l]),this.h+=1,this},r.get=function(a,l){return a?(a=ul(this,a),a.length>0?String(a[0]):l):l};function ll(a,l,f){Bl(a,l),f.length>0&&(a.i=null,a.g.set(br(a,l),I(f)),a.h+=f.length)}r.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],l=Array.from(this.g.keys());for(let C=0;C<l.length;C++){var f=l[C];const S=Ps(f);f=ul(this,f);for(let O=0;O<f.length;O++){let j=S;f[O]!==""&&(j+="="+Ps(f[O])),a.push(j)}}return this.i=a.join("&")};function hl(a){const l=new Fs;return l.i=a.i,a.g&&(l.g=new Map(a.g),l.h=a.h),l}function br(a,l){return l=String(l),a.j&&(l=l.toLowerCase()),l}function Fg(a,l){l&&!a.j&&(ur(a),a.i=null,a.g.forEach(function(f,C){const S=C.toLowerCase();C!=S&&(Bl(this,C),ll(this,S,f))},a)),a.j=l}function kg(a,l){const f=new vs;if(o.Image){const C=new Image;C.onload=h(vn,f,"TestLoadImage: loaded",!0,l,C),C.onerror=h(vn,f,"TestLoadImage: error",!1,l,C),C.onabort=h(vn,f,"TestLoadImage: abort",!1,l,C),C.ontimeout=h(vn,f,"TestLoadImage: timeout",!1,l,C),o.setTimeout(function(){C.ontimeout&&C.ontimeout()},1e4),C.src=a}else l(!1)}function Vg(a,l){const f=new vs,C=new AbortController,S=setTimeout(()=>{C.abort(),vn(f,"TestPingServer: timeout",!1,l)},1e4);fetch(a,{signal:C.signal}).then(O=>{clearTimeout(S),O.ok?vn(f,"TestPingServer: ok",!0,l):vn(f,"TestPingServer: server error",!1,l)}).catch(()=>{clearTimeout(S),vn(f,"TestPingServer: error",!1,l)})}function vn(a,l,f,C,S){try{S&&(S.onload=null,S.onerror=null,S.onabort=null,S.ontimeout=null),C(f)}catch{}}function xg(){this.g=new _g}function cB(a){this.i=a.Sb||null,this.h=a.ab||!1}d(cB,Hu),cB.prototype.g=function(){return new no(this.i,this.h)};function no(a,l){rt.call(this),this.H=a,this.o=l,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}d(no,rt),r=no.prototype,r.open=function(a,l){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=a,this.D=l,this.readyState=1,Vs(this)},r.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const l={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};a&&(l.body=a),(this.H||o).fetch(new Request(this.D,l)).then(this.Pa.bind(this),this.ga.bind(this))},r.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,ks(this)),this.readyState=0},r.Pa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,Vs(this)),this.g&&(this.readyState=3,Vs(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof o.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;fl(this)}else a.text().then(this.Oa.bind(this),this.ga.bind(this))};function fl(a){a.j.read().then(a.Ma.bind(a)).catch(a.ga.bind(a))}r.Ma=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var l=a.value?a.value:new Uint8Array(0);(l=this.B.decode(l,{stream:!a.done}))&&(this.response=this.responseText+=l)}a.done?ks(this):Vs(this),this.readyState==3&&fl(this)}},r.Oa=function(a){this.g&&(this.response=this.responseText=a,ks(this))},r.Na=function(a){this.g&&(this.response=a,ks(this))},r.ga=function(){this.g&&ks(this)};function ks(a){a.readyState=4,a.l=null,a.j=null,a.B=null,Vs(a)}r.setRequestHeader=function(a,l){this.A.append(a,l)},r.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},r.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],l=this.h.entries();for(var f=l.next();!f.done;)f=f.value,a.push(f[0]+": "+f[1]),f=l.next();return a.join(`\r
`)};function Vs(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(no.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function dl(a){let l="";return Qi(a,function(f,C){l+=C,l+=":",l+=f,l+=`\r
`}),l}function uB(a,l,f){e:{for(C in f){var C=!1;break e}C=!0}C||(f=dl(f),typeof a=="string"?f!=null&&Ps(f):De(a,l,f))}function Pe(a){rt.call(this),this.headers=new Map,this.L=a||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}d(Pe,rt);var Mg=/^https?$/i,Gg=["POST","PUT"];r=Pe.prototype,r.Fa=function(a){this.H=a},r.ea=function(a,l,f,C){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);l=l?l.toUpperCase():"GET",this.D=a,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():Qu.g(),this.g.onreadystatechange=p(u(this.Ca,this));try{this.B=!0,this.g.open(l,String(a),!0),this.B=!1}catch(O){Cl(this,O);return}if(a=f||"",f=new Map(this.headers),C)if(Object.getPrototypeOf(C)===Object.prototype)for(var S in C)f.set(S,C[S]);else if(typeof C.keys=="function"&&typeof C.get=="function")for(const O of C.keys())f.set(O,C.get(O));else throw Error("Unknown input type for opt_headers: "+String(C));C=Array.from(f.keys()).find(O=>O.toLowerCase()=="content-type"),S=o.FormData&&a instanceof o.FormData,!(Array.prototype.indexOf.call(Gg,l,void 0)>=0)||C||S||f.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[O,j]of f)this.g.setRequestHeader(O,j);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(a),this.v=!1}catch(O){Cl(this,O)}};function Cl(a,l){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=l,a.o=5,pl(a),ro(a)}function pl(a){a.A||(a.A=!0,ct(a,"complete"),ct(a,"error"))}r.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=a||7,ct(this,"complete"),ct(this,"abort"),ro(this))},r.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),ro(this,!0)),Pe.Z.N.call(this)},r.Ca=function(){this.u||(this.B||this.v||this.j?gl(this):this.Xa())},r.Xa=function(){gl(this)};function gl(a){if(a.h&&typeof i<"u"){if(a.v&&Pn(a)==4)setTimeout(a.Ca.bind(a),0);else if(ct(a,"readystatechange"),Pn(a)==4){a.h=!1;try{const O=a.ca();e:switch(O){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var l=!0;break e;default:l=!1}var f;if(!(f=l)){var C;if(C=O===0){let j=String(a.D).match(ol)[1]||null;!j&&o.self&&o.self.location&&(j=o.self.location.protocol.slice(0,-1)),C=!Mg.test(j?j.toLowerCase():"")}f=C}if(f)ct(a,"complete"),ct(a,"success");else{a.o=6;try{var S=Pn(a)>2?a.g.statusText:""}catch{S=""}a.l=S+" ["+a.ca()+"]",pl(a)}}finally{ro(a)}}}}function ro(a,l){if(a.g){a.m&&(clearTimeout(a.m),a.m=null);const f=a.g;a.g=null,l||ct(a,"ready");try{f.onreadystatechange=null}catch{}}}r.isActive=function(){return!!this.g};function Pn(a){return a.g?a.g.readyState:0}r.ca=function(){try{return Pn(this)>2?this.g.status:-1}catch{return-1}},r.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},r.La=function(a){if(this.g){var l=this.g.responseText;return a&&l.indexOf(a)==0&&(l=l.substring(a.length)),Eg(l)}};function ml(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.F){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function Ug(a){const l={};a=(a.g&&Pn(a)>=2&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let C=0;C<a.length;C++){if(_(a[C]))continue;var f=Tg(a[C]);const S=f[0];if(f=f[1],typeof f!="string")continue;f=f.trim();const O=l[S]||[];l[S]=O,O.push(f)}fg(l,function(C){return C.join(", ")})}r.ya=function(){return this.o},r.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function xs(a,l,f){return f&&f.internalChannelParams&&f.internalChannelParams[a]||l}function El(a){this.za=0,this.i=[],this.j=new vs,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=xs("failFast",!1,a),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=xs("baseRetryDelayMs",5e3,a),this.Za=xs("retryDelaySeedMs",1e4,a),this.Ta=xs("forwardChannelMaxRetries",2,a),this.va=xs("forwardChannelRequestTimeoutMs",2e4,a),this.ma=a&&a.xmlHttpFactory||void 0,this.Ua=a&&a.Rb||void 0,this.Aa=a&&a.useFetchStreams||!1,this.O=void 0,this.L=a&&a.supportsCrossDomainXhr||!1,this.M="",this.h=new tl(a&&a.concurrentRequestLimit),this.Ba=new xg,this.S=a&&a.fastHandshake||!1,this.R=a&&a.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=a&&a.Pb||!1,a&&a.ua&&this.j.ua(),a&&a.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&a&&a.detectBufferingProxy||!1,this.ia=void 0,a&&a.longPollingTimeout&&a.longPollingTimeout>0&&(this.ia=a.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}r=El.prototype,r.ka=8,r.I=1,r.connect=function(a,l,f,C){ut(0),this.W=a,this.H=l||{},f&&C!==void 0&&(this.H.OSID=f,this.H.OAID=C),this.F=this.X,this.J=vl(this,null,this.W),io(this)};function lB(a){if(_l(a),a.I==3){var l=a.V++,f=qt(a.J);if(De(f,"SID",a.M),De(f,"RID",l),De(f,"TYPE","terminate"),Ms(a,f),l=new An(a,a.j,l),l.M=2,l.A=to(qt(f)),f=!1,o.navigator&&o.navigator.sendBeacon)try{f=o.navigator.sendBeacon(l.A.toString(),"")}catch{}!f&&o.Image&&(new Image().src=l.A,f=!0),f||(l.g=Pl(l.j,null),l.g.ea(l.A)),l.F=Date.now(),eo(l)}Rl(a)}function so(a){a.g&&(fB(a),a.g.cancel(),a.g=null)}function _l(a){so(a),a.v&&(o.clearTimeout(a.v),a.v=null),oo(a),a.h.cancel(),a.m&&(typeof a.m=="number"&&o.clearTimeout(a.m),a.m=null)}function io(a){if(!nl(a.h)&&!a.m){a.m=!0;var l=a.Ea;Oe||E(),Ae||(Oe(),Ae=!0),v.add(l,a),a.D=0}}function Hg(a,l){return rl(a.h)>=a.h.j-(a.m?1:0)?!1:a.m?(a.i=l.G.concat(a.i),!0):a.I==1||a.I==2||a.D>=(a.Sa?0:a.Ta)?!1:(a.m=Rs(u(a.Ea,a,l),Al(a,a.D)),a.D++,!0)}r.Ea=function(a){if(this.m)if(this.m=null,this.I==1){if(!a){this.V=Math.floor(Math.random()*1e5),a=this.V++;const S=new An(this,this.j,a);let O=this.o;if(this.U&&(O?(O=bu(O),Lu(O,this.U)):O=this.U),this.u!==null||this.R||(S.J=O,O=null),this.S)e:{for(var l=0,f=0;f<this.i.length;f++){t:{var C=this.i[f];if("__data__"in C.map&&(C=C.map.__data__,typeof C=="string")){C=C.length;break t}C=void 0}if(C===void 0)break;if(l+=C,l>4096){l=f;break e}if(l===4096||f===this.i.length-1){l=f+1;break e}}l=1e3}else l=1e3;l=Il(this,S,l),f=qt(this.J),De(f,"RID",a),De(f,"CVER",22),this.G&&De(f,"X-HTTP-Session-Id",this.G),Ms(this,f),O&&(this.R?l="headers="+Ps(dl(O))+"&"+l:this.u&&uB(f,this.u,O)),aB(this.h,S),this.Ra&&De(f,"TYPE","init"),this.S?(De(f,"$req",l),De(f,"SID","null"),S.U=!0,rB(S,f,null)):rB(S,f,l),this.I=2}}else this.I==3&&(a?Dl(this,a):this.i.length==0||nl(this.h)||Dl(this))};function Dl(a,l){var f;l?f=l.l:f=a.V++;const C=qt(a.J);De(C,"SID",a.M),De(C,"RID",f),De(C,"AID",a.K),Ms(a,C),a.u&&a.o&&uB(C,a.u,a.o),f=new An(a,a.j,f,a.D+1),a.u===null&&(f.J=a.o),l&&(a.i=l.G.concat(a.i)),l=Il(a,f,1e3),f.H=Math.round(a.va*.5)+Math.round(a.va*.5*Math.random()),aB(a.h,f),rB(f,C,l)}function Ms(a,l){a.H&&Qi(a.H,function(f,C){De(l,C,f)}),a.l&&Qi({},function(f,C){De(l,C,f)})}function Il(a,l,f){f=Math.min(a.i.length,f);const C=a.l?u(a.l.Ka,a.l,a):null;e:{var S=a.i;let ie=-1;for(;;){const je=["count="+f];ie==-1?f>0?(ie=S[0].g,je.push("ofs="+ie)):ie=0:je.push("ofs="+ie);let ge=!0;for(let Qe=0;Qe<f;Qe++){var O=S[Qe].g;const Kt=S[Qe].map;if(O-=ie,O<0)ie=Math.max(0,S[Qe].g-100),ge=!1;else try{O="req"+O+"_"||"";try{var j=Kt instanceof Map?Kt:Object.entries(Kt);for(const[hr,Sn]of j){let On=Sn;B(Sn)&&(On=Xa(Sn)),je.push(O+hr+"="+encodeURIComponent(On))}}catch(hr){throw je.push(O+"type="+encodeURIComponent("_badmap")),hr}}catch{C&&C(Kt)}}if(ge){j=je.join("&");break e}}j=void 0}return a=a.i.splice(0,f),l.G=a,j}function wl(a){if(!a.g&&!a.v){a.Y=1;var l=a.Da;Oe||E(),Ae||(Oe(),Ae=!0),v.add(l,a),a.A=0}}function hB(a){return a.g||a.v||a.A>=3?!1:(a.Y++,a.v=Rs(u(a.Da,a),Al(a,a.A)),a.A++,!0)}r.Da=function(){if(this.v=null,yl(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var a=4*this.T;this.j.info("BP detection timer enabled: "+a),this.B=Rs(u(this.Wa,this),a)}},r.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,ut(10),so(this),yl(this))};function fB(a){a.B!=null&&(o.clearTimeout(a.B),a.B=null)}function yl(a){a.g=new An(a,a.j,"rpc",a.Y),a.u===null&&(a.g.J=a.o),a.g.P=0;var l=qt(a.na);De(l,"RID","rpc"),De(l,"SID",a.M),De(l,"AID",a.K),De(l,"CI",a.F?"0":"1"),!a.F&&a.ia&&De(l,"TO",a.ia),De(l,"TYPE","xmlhttp"),Ms(a,l),a.u&&a.o&&uB(l,a.u,a.o),a.O&&(a.g.H=a.O);var f=a.g;a=a.ba,f.M=1,f.A=to(qt(l)),f.u=null,f.R=!0,Xu(f,a)}r.Va=function(){this.C!=null&&(this.C=null,so(this),hB(this),ut(19))};function oo(a){a.C!=null&&(o.clearTimeout(a.C),a.C=null)}function Tl(a,l){var f=null;if(a.g==l){oo(a),fB(a),a.g=null;var C=2}else if(oB(a.h,l))f=l.G,sl(a.h,l),C=1;else return;if(a.I!=0){if(l.o)if(C==1){f=l.u?l.u.length:0,l=Date.now()-l.F;var S=a.D;C=Xi(),ct(C,new Wu(C,f)),io(a)}else wl(a);else if(S=l.m,S==3||S==0&&l.X>0||!(C==1&&Hg(a,l)||C==2&&hB(a)))switch(f&&f.length>0&&(l=a.h,l.i=l.i.concat(f)),S){case 1:lr(a,5);break;case 4:lr(a,10);break;case 3:lr(a,6);break;default:lr(a,2)}}}function Al(a,l){let f=a.Qa+Math.floor(Math.random()*a.Za);return a.isActive()||(f*=2),f*l}function lr(a,l){if(a.j.info("Error code "+l),l==2){var f=u(a.bb,a),C=a.Ua;const S=!C;C=new Rn(C||"//www.google.com/images/cleardot.gif"),o.location&&o.location.protocol=="http"||Os(C,"https"),to(C),S?kg(C.toString(),f):Vg(C.toString(),f)}else ut(2);a.I=0,a.l&&a.l.pa(l),Rl(a),_l(a)}r.bb=function(a){a?(this.j.info("Successfully pinged google.com"),ut(2)):(this.j.info("Failed to ping google.com"),ut(1))};function Rl(a){if(a.I=0,a.ja=[],a.l){const l=il(a.h);(l.length!=0||a.i.length!=0)&&(R(a.ja,l),R(a.ja,a.i),a.h.i.length=0,I(a.i),a.i.length=0),a.l.oa()}}function vl(a,l,f){var C=f instanceof Rn?qt(f):new Rn(f);if(C.g!="")l&&(C.g=l+"."+C.g),bs(C,C.u);else{var S=o.location;C=S.protocol,l=l?l+"."+S.hostname:S.hostname,S=+S.port;const O=new Rn(null);C&&Os(O,C),l&&(O.g=l),S&&bs(O,S),f&&(O.h=f),C=O}return f=a.G,l=a.wa,f&&l&&De(C,f,l),De(C,"VER",a.ka),Ms(a,C),C}function Pl(a,l,f){if(l&&!a.L)throw Error("Can't create secondary domain capable XhrIo object.");return l=a.Aa&&!a.ma?new Pe(new cB({ab:f})):new Pe(a.ma),l.Fa(a.L),l}r.isActive=function(){return!!this.l&&this.l.isActive(this)};function Sl(){}r=Sl.prototype,r.ra=function(){},r.qa=function(){},r.pa=function(){},r.oa=function(){},r.isActive=function(){return!0},r.Ka=function(){};function ao(){}ao.prototype.g=function(a,l){return new yt(a,l)};function yt(a,l){rt.call(this),this.g=new El(l),this.l=a,this.h=l&&l.messageUrlParams||null,a=l&&l.messageHeaders||null,l&&l.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=l&&l.initMessageHeaders||null,l&&l.messageContentType&&(a?a["X-WebChannel-Content-Type"]=l.messageContentType:a={"X-WebChannel-Content-Type":l.messageContentType}),l&&l.sa&&(a?a["X-WebChannel-Client-Profile"]=l.sa:a={"X-WebChannel-Client-Profile":l.sa}),this.g.U=a,(a=l&&l.Qb)&&!_(a)&&(this.g.u=a),this.A=l&&l.supportsCrossDomainXhr||!1,this.v=l&&l.sendRawJson||!1,(l=l&&l.httpSessionIdParam)&&!_(l)&&(this.g.G=l,a=this.h,a!==null&&l in a&&(a=this.h,l in a&&delete a[l])),this.j=new Nr(this)}d(yt,rt),yt.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},yt.prototype.close=function(){lB(this.g)},yt.prototype.o=function(a){var l=this.g;if(typeof a=="string"){var f={};f.__data__=a,a=f}else this.v&&(f={},f.__data__=Xa(a),a=f);l.i.push(new vg(l.Ya++,a)),l.I==3&&io(l)},yt.prototype.N=function(){this.g.l=null,delete this.j,lB(this.g),delete this.g,yt.Z.N.call(this)};function Ol(a){Za.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var l=a.__sm__;if(l){e:{for(const f in l){a=f;break e}a=void 0}(this.i=a)&&(a=this.i,l=l!==null&&a in l?l[a]:void 0),this.data=l}else this.data=a}d(Ol,Za);function bl(){eB.call(this),this.status=1}d(bl,eB);function Nr(a){this.g=a}d(Nr,Sl),Nr.prototype.ra=function(){ct(this.g,"a")},Nr.prototype.qa=function(a){ct(this.g,new Ol(a))},Nr.prototype.pa=function(a){ct(this.g,new bl)},Nr.prototype.oa=function(){ct(this.g,"b")},ao.prototype.createWebChannel=ao.prototype.g,yt.prototype.send=yt.prototype.o,yt.prototype.open=yt.prototype.m,yt.prototype.close=yt.prototype.close,fC=function(){return new ao},hC=function(){return Xi()},lC=Br,WB={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Zi.NO_ERROR=0,Zi.TIMEOUT=8,Zi.HTTP_ERROR=6,Po=Zi,zu.COMPLETE="complete",uC=zu,Ju.EventType=Ts,Ts.OPEN="a",Ts.CLOSE="b",Ts.ERROR="c",Ts.MESSAGE="d",rt.prototype.listen=rt.prototype.J,Ks=Ju,Pe.prototype.listenOnce=Pe.prototype.K,Pe.prototype.getLastError=Pe.prototype.Ha,Pe.prototype.getLastErrorCode=Pe.prototype.ya,Pe.prototype.getStatus=Pe.prototype.ca,Pe.prototype.getResponseJson=Pe.prototype.La,Pe.prototype.getResponseText=Pe.prototype.la,Pe.prototype.send=Pe.prototype.ea,Pe.prototype.setWithCredentials=Pe.prototype.Fa,cC=Pe}).apply(typeof fo<"u"?fo:typeof self<"u"?self:typeof window<"u"?window:{});/*!
* re2js
* RE2JS is the JavaScript port of RE2, a regular expression engine that provides linear time matching
*
* @version v2.8.6
* @author Oleksii Vasyliev
* @homepage https://github.com/le0pard/re2js#readme
* @repository github:le0pard/re2js
* @license MIT
*/var me,x=(me=class{},G(me,"FOLD_CASE",1),G(me,"LITERAL",2),G(me,"CLASS_NL",4),G(me,"DOT_NL",8),G(me,"ONE_LINE",16),G(me,"NON_GREEDY",32),G(me,"PERL_X",64),G(me,"UNICODE_GROUPS",128),G(me,"WAS_DOLLAR",256),G(me,"LOOKBEHIND",512),G(me,"MATCH_NL",me.CLASS_NL|me.DOT_NL),G(me,"PERL",me.CLASS_NL|me.ONE_LINE|me.PERL_X|me.UNICODE_GROUPS),G(me,"POSIX",0),G(me,"UNANCHORED",0),G(me,"ANCHOR_START",1),G(me,"ANCHOR_BOTH",2),me);const Lr={CASE_INSENSITIVE:1,DOTALL:2,MULTILINE:4,DISABLE_UNICODE_GROUPS:8,LONGEST_MATCH:16,LOOKBEHINDS:512},di=128,zB=new Int32Array(di),QB=new Int32Array(di),Co=65535;for(let r=0;r<di;r++)r>=97&&r<=122?zB[r]=r-32:zB[r]=r,r>=65&&r<=90?QB[r]=r+32:QB[r]=r;var kB,b=(kB=class{static toUpperCase(r){if(r<di)return zB[r];const e=String.fromCodePoint(r).toUpperCase(),t=e.codePointAt(0)>Co?2:1;if(e.length>t)return r;const n=String.fromCodePoint(e.codePointAt(0)).toLowerCase(),s=n.codePointAt(0)>Co?2:1;return n.length>s||n.codePointAt(0)!==r?r:e.codePointAt(0)}static toLowerCase(r){if(r<di)return QB[r];const e=String.fromCodePoint(r).toLowerCase(),t=e.codePointAt(0)>Co?2:1;if(e.length>t)return r;const n=String.fromCodePoint(e.codePointAt(0)).toUpperCase(),s=n.codePointAt(0)>Co?2:1;return n.length>s||n.codePointAt(0)!==r?r:e.codePointAt(0)}},G(kB,"CODES",new Map([["\x07",7],["\b",8],["	",9],[`
`,10],["\v",11],["\f",12],["\r",13],[" ",32],['"',34],["$",36],["&",38],["'",39],["(",40],[")",41],["*",42],["+",43],["-",45],[".",46],["0",48],["1",49],["2",50],["3",51],["4",52],["5",53],["6",54],["7",55],["8",56],["9",57],[":",58],["<",60],[">",62],["?",63],["A",65],["B",66],["C",67],["F",70],["P",80],["Q",81],["U",85],["Z",90],["[",91],["\\",92],["]",93],["^",94],["_",95],["`",96],["a",97],["b",98],["f",102],["i",105],["m",109],["n",110],["r",114],["s",115],["t",116],["v",118],["x",120],["z",122],["{",123],["|",124],["}",125]])),kB),g=class{constructor(r,e=!1){this.data=r,this.isStride1=e,this.SIZE=e?2:3}getLo(r){return this.data[r*this.SIZE]}getHi(r){return this.data[r*this.SIZE+1]}getStride(r){return this.isStride1?1:this.data[r*this.SIZE+2]}get length(){return this.data.length/this.SIZE}};const dC=new Uint8Array(256);for(let r=0,e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-";r<64;r++)dC[e.charCodeAt(r)]=r;const CC=r=>{const e=[];let t=0,n=0;for(let s=0;s<r.length;s++){let i=dC[r.charCodeAt(s)];t|=(i&31)<<n,(i&32)===0?(e.push(t),t=0,n=0):n+=5}return e},m=(r,e)=>{const t=CC(r),n=e?t.length/2:t.length/3,s=new Uint32Array(n*3);let i=0,o=0;for(let B=0;B<n;B++)i+=t[o++],s[B*3]=i,i+=t[o++],s[B*3+1]=i,s[B*3+2]=e?1:t[o++];return s},_w=r=>{const e=CC(r),t=new Map;let n=0;for(let s=0;s<e.length;s+=2){n+=e[s];const i=e[s+1],o=i>>>1^-(i&1);t.set(n,n+o)}return t};var po=class{constructor(r){this.initializer=r,this.cache=new Map}has(r){return r in this.initializer}get(r){if(this.cache.has(r))return this.cache.get(r);const e=this.initializer[r],t=e?e():null;return this.cache.set(r,t),t}},Ln,pt=(Ln=class{static get CASE_ORBIT(){return this._CASE_ORBIT||(this._CASE_ORBIT=_w("rCgCIgCY+rQI4QiCuuBLgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCCgCBgCBgCBgCBgCBgCBgCB+7OB-BB-BB-BB-BB-BBskQB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BC-BB-BB-BB-BB-BB-BB-BByHBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBDCBBBCBBBCBBCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBxHBCBBBCBBBCBBB3SBmMBkNBCBBBCBBB8MBCBBB6MB6MBCBBC+EB0MB2MBCBBB6MB+MBiGBmNBiNBCBBBmKBikzCBmNBqNBkIBsNBCBBBCBBBCBBB0NBCBBB0NDCBBB0NBCBBByNByNBCBBBCBBB2NBCBBDCBBCwDFCBCBDBCBCBDBCBCBDBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBB9EBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCCBCBDBCBBBhGBvDBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBjICCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBH2iVBCBBBlKBwiVB+jVB+jVBCBBBlMBqEBuEBCBBBCBBBCBBBCBBBCBBB+hVB4hVB8hVBjNB7MC5MB5MCzMC1MB+0yCE5MB20yCC9MBu2yCBwyyCBo0yCChNBlNBo0yCBu-UBi0yCDlNC6-UBpNDrNIu+UDzNCm0yCBzNE0yyCBzNBpEBxNBxNBtEG1NLqxyCBkxyCnFoFrBCBBBCBBDCBBEkIBkIBkICoHHsCCqCBqCBqCCgEC+DB+DBmkOBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCC+BBgCBgCBgCBgCBgCBgCBgCBgCBrCBpCBpCBpCBmjOB-BB8BB-BB-BBgEB-BB-BByBBqgOBsDB-BBtwBB-BB-BB-BBsBBgDBCB-BB-BB-BBeB-BB-BB61OB-BB-BB-DB9DB9DBQB7DBmCE9CBrDBPBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBrFB-EBOBnHB3FB-FCCBBBNBCBBCjIBjIBjIBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgFBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB8kMB-BB6kMB-BB-BB-BB-BB-BB-BB-BB-BB-BBokMB-BB-BBkkMBkkMB-BB-BB-BB-BB-BB-BB-BB4jMB-BB-BB-BB-BB-BB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EB-EBCBBBCBoiMBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBJCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBeBCBBBCBBBCBBBCBBBCBBBCBBBCBBBdBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBCgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDL-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-C64CgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOBgmOCgmOGgmODg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FBg8FDg8FBg8FBg8FhVg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBg9rCBQBQBQBQBQBQDPBPBPBPBPBPjkC7mMB5mMBnmMBjmMBCBlmMB3lMBpiMBk8kCBCBBG-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FB-7FD-7FB-7FB-7F6FoglCEsuHRwjlCyDCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCB0DBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBG1DD97OCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQDPBPBPBPBPBPDQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQDPBPBPBPBPBPEQCQCQCQCPCPCPCPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPB0EB0EBsFBsFBsFBsFBoGBoGBgIBgIBgHBgHB8HB8HDQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQBQBQBQBQBQBQBPBPBPBPBPBPBPBPBQBQCSFPBPBzEBzEBRCxnOFSFrFBrFBrFBrFBREQBQClkOFPBPBnGBnGFQBQCljOCODPBPB-GB-GBNHSF-HB-HB7HB7HBRqJ53OE9tQBrmQH4Bc3BSgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBgBBfBfBfBfBfBfBfBfBfBfBfBfBfBfBfBfECBByZ0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BB0BBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzBBzB34BgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDBgDB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CB-CBCBBBt-UBruHBt+UB1iVBviVBCBBBCBBBCBBB3hVB5-UB9hVB7hVCCBBCCBBI9jVB9jVBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBICBBBCBBECBBN-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOB-lOC-lOG-lOzoeCBBBCBBBCBBBCBBBCBBBCBl8kCBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBTCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBnECBBBCBBBCBBBCBBBCBBBCBBBCBBDCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBKCBBBCBBBnglCBCBBBCBBBCBBBCBBBCBBECBBBvyyCDCBBBCBBBgDCCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBn0yCB90yCB10yCBh0yCBn0yCCjxyCBzyyCBpxyCBg6BBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBB-CBl0yCBvjlCBCBBBCBBBt2yCBCBBBCBBBCBBBCBBBCBBBCBBBCBBBCBBBhkzCZCBB9a-5Bd-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCB-8rCm6TCBB7gBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCH-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BmlBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvChDwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCBwCFvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvCBvC1DuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCCuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCBuCCuCBuCBuCBuCBuCBuCBuCCuCBuCCtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCCtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCBtCCtCBtCBtCBtCBtCBtCBtCCtCBtCk2BgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEBgEO-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-DB-D+CgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCL-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-B74CgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BhrVgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCBgCB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BB-BhB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BB2BD1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BB1BtxekCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBkCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjCBjC")),this._CASE_ORBIT}static get Print(){return this._Print||(this._Print=new g(m("hB9CBjBLBCpWBDFBFGBCCCBSBCsMBClBBDxBBDCBC2BBJaBFFBSVBC-FBCvBBD6BBDkDBP6BBDwBBDOBCbBDCCBJBGfBIqCBCgFBCHBDBBDVBCGBCEEBCBDIBDBBDDBJFFBCCBDBDYBDCBCFBFBBDVBCGBCBBCBBCBBDCCBDBFBBDCBEIIBCBCIIBPBLCBCIBCCBCVBCGBCBBCEBDJBCCBCCBDQQBCBDLBIGBCCBCHBDBBDVBCGBCBBCEBDIBDBBDCBICBFBBCEBDRBLBBCFBECBCDBEBBCCCBEEBEEBBBELBFEBECBCDBDHHPUBGMBCCBCWBCPBDIBCCBCDBIBBCCBCBBDDBDJBIVBCCBCWBCJBCEBDIBCCBCDBIBBGCBCDBDJBCCBNMBCCBCyBBCCBCFBFPBDZBCCBCRBEXBCIBCDDBFBEFFBEBCCCBGBHJBDCBN5BBFcBmBBBCCCBDBCXBCCCBVBDEBCCCBFBCJBDDBhBnCBCjBBFmBBCjBBCOBCMBmBlGBCGGD4LBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBDfBEZBH1CBDFBD-TBCbBE4CBIVBKXBKTBNMBCCBCBBN9CBDJBHJBHNBCKBH4CBIqBBGlCBLeBCLBFLBFEEBoBBDEBMrBBFZBHKBE9BBDgCBCcBDKBHJBHNBDtBBDLBVsCBClFBJ7BBEOBE9BBGqBBDKBJqBBG1QBDFBDlBBDFBDHBCGCBdBD0BBCOBCNBDFBCSBDCBCIBSXBJuBBSBBDaBCMBEhBBPgBBQrEBF5UBXKBWz4BBD9LBGsBBCGGD3BBIBBPXBKGBCGBCGBCGBCGBCGBCGBCGBC9DBjBZBC4CBN1GBbPBC+BBC1CBDmDBGqBBC9CBC1CBKvBBCszcBE2BBK7KBV3FBJ8GBV7BBEJBH3BBJlCBJLBHzDBMdBEtCBCKBFgBBC2BBKNBDJBDmDBZbBLFBDFBDFBKGBCGBC7BBF9DBDJBHj9KBNWBFwBBloItLBDpDBnBGBNEBGZBCEBCCCBCCBCCBoUBhBpBBHyBBCSBCDBFEBCmEBF9FBEFBDFBDFBDCBEGBCGBOBBDLBCZBCSBCBBCOBDNBjB6DBGCBFsBBE3CBCMBEwBwBBsBBjEcBEwBBQbBFjBBKdBGqBBGdBCkBBFNBrB9EBDJBHjBBFjBBFnBBJzBBMLBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBCnCBJIBxBSBCBBGgBBEaBGaBnB3BBFTBDxBBCBBGHBCCBCcBDCBFJBIIBI-BBhBmBBFLBK1BBEcBDaBGZBIDBNGBxCoCB4ByBBOyBBItBBJJBHlBBEcBJBBxGeBCpBBCCBDBBRFBJIBiBtBBJpBBXZBnBbBVWBKtCBFjBBK9BBCEBOYBIJBH0BBCRBJmBBK-CBCTBMRBCuBB-BGBCCCBCBCOBCKBH6BBGJBHDBCHBDBBDVBCGBCBBCEBCJBDBBDCBDHHGGBDGBEEBMJBCDDClBBCJBCDDCDBCJBCBBJBBe7CBCEBfnCBJJBnF1BBDlBBjBkCBMJBHMBU5BBHJBHTBdaBDOBFWB6F7BBlDyCBNHBDDDBGBCBBCdBCBBDLBKJBnCHBDtBBDKBcnCBJyCBOoCBIJB3CHB5ChBBPJBHIBCsBBCNBLcBEfBDVBCNBqCGBCBBCrBBECCBCCBHBJJBHFBCBBCkBBCBBCFBIJBHrBBFJB3HYBIQBCoBBEcB2CQQBwBBO6cBnDuDBCEBMjGBtyCiDBOvhBBRVBL68DBGmSB61G5BBn2B4RBIeBCJBFwCBCJBHdBDFBLlCBLJBCGBCUBGSBxN5BBnG6CBGYBDYBtBqCBF4BBIQBhCEBMGBK1mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBDDBh7D8HBEzNBHWBQQBQtBBDWBKzDB9B1HBLmBBDpCBJvDBWlCB7DTBNTBN2CBKYBoE0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBD9VBQEBCOBxiBeBHFB2GGBCQBDGBCBBCEBG9BBiBxDxDBrBBENBDJBFBBhKeBS5BBGxOxOBoBB3GqBBFhGhGBdBCVBJBBhHGBCDBCBBCOBCkGBDPBqBrCBFJBFBByYjCBtC8BBjGDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBBvIrBBFjDBNOBDOBCOBCkBBLtFB5BcBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBCmDBmgB-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIBnkzVvHB",!1))),this._Print}static get Upper(){return this.CATEGORIES.get("Lu")}},G(Ln,"_CASE_ORBIT",null),G(Ln,"_Print",null),G(Ln,"CATEGORIES",new po({C:()=>new g(m("AfBgDgBBOrWrWBHHBCBICCVuMuMnBBBzBBBE4B4BBGBcDBHQBXhGhGxBBB8BBBmDNB8BBByBBBQddBCCMEBhBGBsCiFiFJBBDBBXIICCBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBPMMBEB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKMMBDBbEByBPBDBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBjoIBvLBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCB-FCBHBBHBBHBBECBIIIBLBDBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIB-BGGBLBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMBxhBPBXJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBF-6DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBrCHBxDUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIlkzVBxHvw-FB",!1)),Cc:()=>new g(m("AfgDgB",!0)),Cf:()=>new g(m("tFzqBzqBBEBXhGhGyBhMhMBxCxCs5D9-B9-BBDBbEByBEBCJBw03B6H6HBBBimEQQj7IPBhjiBDBwmFHBn0rYffB+CB",!1)),Cn:()=>new g(m("4bBBHDBICCVuMuMnBBBzBBBE4B4BBGBcDBHKBvI9B9BBmDmDBMB8BBByBBBQddBCCMEBjBEBuHJJBDDBXXICCBBBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBbFB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKmDmDNBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBDBvzIBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCC-FCBHBBHBBHBBECBIIIBIBGBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIBlCJBCBBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMB3iBJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBJ76DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBjGUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIm8yVBCdBhD-DBxHvw-BB---BBB---BBB",!1)),Co:()=>new g(m("gg4B-nGh4hc9--BD9--B",!0)),Cs:()=>new g(m("gg2B--B",!0)),L:()=>new g(m("hCZBHZBwBLLFGGBVBCeBCpOBFLBPEBICCiEEBCBBDDBCHHCCBCCCBSBCyCBCqEBJlFBClBBDHHBnBBoCaBFDBuBqBBkBBBCiDBCQQBIIBLLBBBDRRCdBe4CBMZZBfBKBBFGGBUBFKKEYYBXBIKBGXBCGBRpBB7B1BBETTIJBQPBFHBDBBDVBCGBCEEBCBERROBBCCBPBBLJJBEBFBBDVBCGBCBBCBBCBBgBDBCUUBBBRIBCCBCVBCGBCBBCEBETTQBBYMMBGBDBBDVBCGBCBBCEBEffBCCBBBQSSCFBECBCDBEBBCCCBEEBEEBBBELBX1B1BBGBCCBCWBCPBEbbBBBCBBDBBfFFBGBCCBCWBCJBCEBEffBBBCBBQBBSIBCCBCoBBDRRGCBJCBZFBGRBEXBCIBCDDBFB7BvBBCBBNGB7BBBCCCBDBCXBCCCBIBCBBKDDBDBCWWBCBhBgCgCBGBCjBBcEB0DqBBVRRBEBFDBEEEBIIBBBFMBNSSBkBBCGGDqBBCsKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPBR1CBDFBErTBDQBCZBGqCBHHBIRBOSBPRBPMBCCBQzBBkBFFkC4CBIEBDhBBCGGBkCBLeByBdBDEBMrBBFZB3BWBK0BBzC+C+CBtBBSHB3BdBOBBLrBBbjBBqBCBLjBBDKBGqBBDCBqBDBCFBCBBEGGB+FBhC1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGB1DOORMBmDFFDJBCEEBDBHGCBCBCKBDDBGEBF1B1BB8zC8zCBjHBHDBEBBNlBBCGGD3BBIRRBVBKGBCGBCGBCGBCGBCGBCGBCGBxC2O2OBrBrBBDBGBBF1CBHCBC5CBCDBGqBBC9CBSfBxBPBhQ-tGBhCs0VBkCtBBDsIBEPBLBBVuBBReBDlCByBIBDmDBDxCBVQBCCBCDBCWBezBBPxBB-BFBECCBMMBaBLWBacBIuBBdRRBDBCJBLEBCoBBYCBCHBVWBEEEBwBBCEEBDDBDBDCCZCBDKBICBNFBDFBDFBKGBCGBCqBBCNBHyDBej9KBNWBFwBBloItLBDpDBnBGBNEBGCCBIBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBlBZBHZBM4CBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmMcBEwBBwBfBOTBCHBHlBBLdBDjBBFHBxB9EBTjBBFjBBFnBBJzBBNKBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCQQBCBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4ByBBOyBBOjBBnBbBKWB7HpBBHBBRFB5BcBLJJBUBrBRBvBUBcWBN0BB6BBBDOOBrBBhBYBbjBBeDDJiBBENNBuBBPDBWCCkBRBCYBUBBgCGBCCCBCBCOBCJBIuBBnBHBDBBDVBCGBCBBCEBETTNEBfJBCDDClBBCaaCtBtBBzBBTDBVCBfvBBVBBC5F5FBtBBqBDBlBvBBV8B8BBpBBOoCoCBZBmBGB6FrBB1D-BBgBHBDDDBGBCBBCXBQCC-CHBDmBBRCCdLLBmBBIWWMtBBUTTBnCBoGgBBgBIBCkBBSyByBBcBxDGBCBBClBBWaaBEBCBBCfBPYYBqBBlISBQCCBLBChBB9DwCwCB4cBnHjGBtyCgDBQvhBBSFBa68DBGmSB61GdBj3B4RBIeBSuCBSdBTvBBRDBgBUBGSBxNsBB0G-BBhBYBDYBtBqCBGjCjCBLBhCBBCPPBNNB0mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBn7F0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BeBHFBmI9BBzEsBBLGBRiKiKBcBTrBBlPbBlHdBDwGwGBdBCCBCBBCGBDEBKBBhHGBCDBCBBCOBCkGB8BjCBI1lB1lBBCBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQBlqE-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),LC:()=>new g(m("hCZBHZB7BLLBVBCeBCiGBCDBFvGBDZBhGDBDBBECBCHHCCBCCCBSBCyCBCqEBJlFBClBBKoBB44ClBBCGGDqBBDCBhV1CBDFBjkCKBGqBBDCBhCrBBgCMBChBBmD1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGBmIFFDJBCEEBDBHGCBCBCFBFDDBCBGEBF1B1BB8zC8zCB6DBDmDBHDBEBBNlBBCGGzoetBBTbBnEtCBCWBEDBCsCBZBBE2Z2ZBpBBGIBIvCBh6TGBNEBqgBZBHZBmlBvCBhDjBBFjBB1DKBCOBCGBCBBCKBCOBCGBCBBk2ByBBOyBB+CVBLVB74C-BBhrV-BBhBYBDYBtpZ0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BJBCTBHFB2uCjCB",!1)),Ll:()=>new g(m("hDZB7BqBqBBWBCHBC2BCBQCBuBCDECBBBDCCDEEBFFDEEBBBDDDCCCDCCBCCDEECDDBDDBBBHGDCOCBSCBDDCEEC4BCBFBDDDBCCFICBjCBDZBiGCCEEEBBBTccBhBBCBBECBCWCBDBCGDB0B0BBuBBCgBCK0BCDMCBgDCxBoBBo6CqBBDCB5XFBjkCIBC2D2DBqBBgCMBChBBnD0ECBHBCgDCBHBJFBLHBJHBJFBLHBJHBJNBDHBJHBJHBJEBCBBHEEBBBCBBJDBDBBJHBLCBCBBzIEEBEEcKFDBBJDBF2B2Bs1CvBBCEEBGCFCCBCCBEBGiDCBIICFFNlBBCGG0oesBCUaCoEMCBBBC+BCBGBCCCDICFCCDCCBBBCSCGGGCMCFCCDOCbEE2ZqBBGIBIvCBh6TGBNEBqhBZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBnqZZBbGBCRBbZBbDBCCCBFBCKBbZBbZBbZBbZBbZBbZBbZBbZBbbBdYBCFBbYBCFBbYBCFBbYBCFBbYBCFBC15B15BBIBCTBHFB4vChBB",!1)),Lm:()=>new g(m("wVRBFLBPEBICCmEGG-OnHnHlFBBuIBBFgBgBKEEhFoFoF1mBgEgE2R72B72BsDkTkTxOFBvF+BBOjBjBBjBByVOORMBg-CBByHgGgG2OsBsBBDBGiDiDB+C+CBBB34bjnBjnBBEBvIzDzDdBB6DIBxCYYpDDBEBB2OXXqEtDtDWBBoDDBKngVngVuBBBh-BFBCpBBCIB0sBhBhB2K04D04DnrTDB9PCBpBBBnRMBhCBBCPPB9-P9-PBCBCGBCBByhM9BBqGGBud0Q0QsSAB",!1)),Lo:()=>new g(m("qFQQhIFFBCBxGBB7ZaBFDBuBfBCJBkBBBCiDBCZZBLLBBBDRRCdBe4CBMZZBfBWVBrBYBIKBGXBCGBRoBB8B1BBETTIJBROBFHBDBBDVBCGBCEEBCBERROBBCCBPBBLJJBEBFBBDVBCGBCBBCBBCBBgBDBCUUBBBRIBCCBCVBCGBCBBCEBETTQBBYMMBGBDBBDVBCGBCBBCEBEffBCCBBBQSSCFBECBCDBEBBCCCBEEBEEBBBELBX1B1BBGBCCBCWBCPBEbbBBBCBBDBBfFFBGBCCBCWBCJBCEBEffBBBCBBQBBSIBCCBCoBBDRRGCBJCBZFBGRBEXBCIBCDDBFB7BvBBCBBNFB8BBBCCCBDBCXBCCCBIBCBBKDDBDBYDBhBgCgCBGBCjBBcEB0DqBBVRRBEBFDBEEEBIIBBBFMBNyDyDBnKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPByDrTBDQBCZBGqCBHHBIRBOSBPRBPMBCCBQzBBpBkCkCBhBBC0BBIEBDhBBCGGBkCBLeByBdBDEBMrBBFZB3BWBK0BBxFuBBSHB3BdBOBBLrBBbjBBqBCBLdByDDBCFBCBBE7hB7hBBCB4-C3BBZWBKGBCGBCGBCGBCGBCGBCGBCGBoR2B2BF1CBJCCB4CBFGGBpBBC9CBSfBxBPBhQ-tGBhC0wUBC2jBBkCnBBJrIBFPBLBBjCyByBBkCBqFoDoDEGBCCBCDBCWBezBBPxBB-BFBECCBMMBaBLWBacBIuBBuBEBDIBLEBCoBBYCBCHBVPBCFBEEEBwBBCEEBDDBDBDCCZBBEKBIPPBEBDFBDFBKGBCGByEiBBej9KBNWBFwBBloItLBDpDBkCCCBIBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBqDJBCsBBDeBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmMcBEwBBwBfBOTBCHBHlBBLdBDjBBFHBhEtCBjDnBBJzBB9CzBBN2JBKVBLHB5EFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCQQBCBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4FjBBnBDBCxJxJBoBBHBBRCBCBB5BcBLJJBUBrBRBvBUBcWBN0BB6BBBDOOBrBBhBYBbjBBeDDJiBBENNBuBBPDBWCCkBRBCYBUBBgCGBCCCBCBCOBCJBIuBBnBHBDBBDVBCGBCBBCEBETTNEBfJBCDDClBBCaaCtBtBBzBBTDBVCBfvBBVBBC5F5FBtBBqBDBlBvBBV8B8BBpBBOoCoCBZBmBGB6FrBB0GHBDDDBGBCBBCXBQCC-CHBDmBBRCCdLLBmBBIWWMtBBUTTBnCBoGgBBgBIBCkBBSyByBBcBxDGBCBBClBBWaaBEBCBBCfBPYYBnBBCBBlISBQCCBLBChBB9DwCwCB4cBnHjGBtyCgDBQvhBBSFBa68DBGmSB61GdBj3B4RBIeBSuCBSdBTvBB0BUBGSB0NnBB2MqCBGwFwFB0mHBqBfBiDyDBuwIiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBxzI2P2PBrBBiBiKiKBcBTrBBlPaBmHdBDwGwGBdBCCBCBBCGBDEBKiHiHBFBCDBCBBCOBCkGB8pBDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQBlqE-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),Lt:()=>new g(m("lOGDnB2sH2sHBGBJHBJHBNQQwBAB",!1)),Lu:()=>new g(m("hCZBmDWBCGBiB2BCDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIJDCMCDQCDDDCCBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBDDBBBEWCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBpCDBNDBNDBNEBMDBnIFFECBDCBDEEBDBHGCBCBDDBLBBG+B+B9zCvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoqZZBbZBbZBbCCBGDBDDBCBCHBbZBbBBCDBDHBCGBcBBCDBCEBCEEBFBcZBbZBbZBbZBbZBbZBfYBiBYBiBYBiBYBiBYBiB2pE2pEBgBB",!1)),M:()=>new g(m("gYvDB0IGBoIsBBCCCBCCBCCpCKBxBUBRmDmDBFBDFBDBBCDBkBffBZB8CKB7BIBKZZBCBCIBCCBCEBsBCB8BIBrBXBCgBB3BCBCRBCGBLBBeCB5BCCBFBDBBDCBKLLBbbDCB5BCCBDBFBBDCBEffBEEMCB5BCCBGBCCBCCBVBBXFBCCB5BCCBFBDBBDCBICBLBBf8B8BBDBECBCDBKpBpBBDB4BCCBFBCCBCDBIBBMBBeCB5BCCBFBCCBCDBIBBMBBQNNBCB4BBBCGBCCBCDBKLLBeeBBBnCFFBEBCCCBGBTBB+BDDBFBNHBjDDDBHBMGBqCBBcECFBByBTBCBBGKBCjBBKlDlDBSBYDBFCBCCBDGBEDBOLBCLLBCBgWCBzdDBdCBeBBfBBhCfBKuBuBBBBC2D2DBjBjB3DLBFLB8GEB6BJBCcBDxBxBBsBBDLBVEBwBQBnBIBNCBfMB5BNBxBTB5ECBCUBFHHDCBnG-BBxWgBB--CCBuEhDhDBeBrRFBqDBB1udDBCJBhBBBxCBBxIEEFYYBDBF0C0CBzBzBBQBbRBOnBnBBGBaMBtBDBwBNBlBkCkCBMBNJJBuBuBBBBzBCCBBBDBBGBBCqBqBBDBGBBtHHBCBBx5TiXiXBOBRPBuejHjH2EEBn0BCBCBBGDBpBCBFmFmFB+R+RBCBiCEB+JBBuCFBnCKByBDB7DCB2BOBqBDDBLLBCBuBKBI+B+BBBBlBNBRBBtBNNBBBxBNBJDBCBB9CLBHDD+ELBWDB4BBBCGBDBBDCBKLLBDDBFBEEBkCIBCDDCDBCEBCPPBzCzCBQBYyCyCBSBsHGBDIBcBBzCQBrDMBmDOBhIOB2HFBCBBDDBCCCBuEuEBFBDGBEddBIBpBGBCDBJKKBJBvBPBnGHBoGHBCHBzCVBCNB7DFBECCBCCBFBCjCjCBDBCBBCEB8KDBKBBCxBxBBFBEEBYmnFmnFHOBpmLRBhuCEB8BGB5gBCCB1BBIDByCMMBslTslTBizEizEBsBBDWB-QEBEFBJHBDGBfDB1ECB89B2BBFxBBJPPXEBCOBxqBGBCQBDGBCBBCEBlDhFhFBFB4L+B+BBCB9PDB-HBB0HDDIBBG7O7OBFBuDGB29lYvHB",!1)),Mc:()=>new g(m("joC4B4BDCBJDBCBBzBBB7BCBHBBDBBLsBsB7BCBjC7B7BBBBJCCB2B2BB7B7BCHHBDDBLLnDBBCBBECBCCBLqBqBBBB+BDB+BBB7BCCBDBDBBCBBKBBdPPB7B7BBBBGCBCCBLrBrBBsCsCBBBHHBTBBrKBBgCsFsFBFFHDDBaaBLLBBBDGBWBBDFBDLLBBB5zBffiEIIBGBCBB7KDBDCBFBBCFBhHBB7BCCKCCBJJBEByExBxBGCCBDBCBB+BffFBBD9B9BDCBCEEBxBxBBGBJBBsFWW35EBB0-dBBD5C5CBzBzBBOBvEBBwBxBxBBFFBDDBBBvDBBDBBZuBuBCuDuDDBBGuHuHBCCBCCBCC0gZCCgEuBuBBBBFBB0DZZB8B8BxBCBKBBO+C+CBBBEBBCrFrFBBBgBBB7BBBCDBDBBDCBKLLB1C1CBBBIDDCDBCBBCmDmDBBBJBBErDrDBBBHCCBCBDuHuHBBBHDBDyDyDBBBJBBCuDuDCBBHoDoDCBBFmImIBBBK4H4HBEBCBBFDDCvEvEBBBJDBF1C1CeBB-BqGqGECCoGPPrDIID2G2GBDBFBBC-K-KBNNxBBBJBBCpvQpvQBBBlxD2BBpDBB0rYBBHFB",!1)),Me:()=>new g(m("okBBB1xF-wB-wBBCBCCBsshBCB",!1)),Mn:()=>new g(m("gYvDB0IEBqIsBBCCCBCCBCCpCKBxBUBRmDmDBFBDFBDBBCDBkBffBZB8CKB7BIBKZZBCBCIBCCBCEBsBCB8BIBrBXBCfB4BCCFHBFEEBFBLBBe7B7BFDBJVVBbbDBB6BFFBFFBDDBBBEffBEEMBB6BFFBDBCBBFVVBXXBEBC7B7BDCCBCBJIIBMMBff+BNNzBEE4BCCBBBGCBCDBIBBMBBe7B7BDHHGBBVBBdBB6BBBFDBJVVBeepCIIBBBC7C7CDGBNHBjDDDBHBMGBqCBBcEC4BNBCEBCBBGKBCjBBKnDnDBCBCFBCBBDBBaBBFCBRDBODDBHHQgWgWBBBzdCBeBBfBBfBBhCBBCGBJDDBJBKuBuBBBBC2D2DBjBjB3DCBFBBKHHBBB8GBBD7B7BCGBCCCDHBHJBDxBxBBMBCeBDLBVDBxBCCBDBCGGpBIBNBBhBDBDBBCCB5BCCBEECCB7BHBDBB5ECBCMBCGBFHHEBBnG-BBxWMBFEEBKB--CCBuEhDhDBeBrRDBsDBB1udFFBIBhBBBxCBBxIEEFaaBGG4EBBbRBOnBnBBGBaKBvBCBxBDDBCBDBBoBkCkCBEBDBBDBBNJJwB0B0BCCBDBBGBBCrBrBBJJvHDDFx5Tx5TiXPBRPBuejHjH2EEBn0BCBCBBGDBpBCBFmFmFB+R+RBCBiCEB+JBBuCFBnCKByBDB8D3B3BBNBqBDDBLLBBByBDBDBBI+B+BBBBlBEBCHB-BNNB1B1BBHBLDBDgDgDBBBDCCBHHD+E+EEHBWBB6BBBEmBmBBFBEEBnCFBOECPBB2CHBDCBCYY1CFBCFFBCCBvHvHBCBHBBCBBcBB2CHBDCCBrDrDCDDBEBCmDmDCDDBCBCEBkIIBCBBhIBBCFFxEDBDBBFhBhBBIBpBFBDDBJKKBEBDCBvBMBCBBnGCCBBBCqGqGBFBCFBCzCzCBUBDGBCBBCBB7DFBECCBCCBFBCpCpCBEEC8K8KBMMB1B1BBDBGCCYmnFmnFHOBpmLLBECBhuCEB8BGB5gBgCgCBCByC5lT5lTBizEizEBsBBDWBhRCBSHBDGBfDB1ECB89B2BBFxBBJPPXEBCOBxqBGBCQBDGBCBBCEBlDhFhFBFB4L+B+BBCB9PDB-HBB0HDDIBBG7O7OBFBuDGB29lYvHB",!1)),N:()=>new g(m("wBJB5DBBGDDBBBitBJBnEJBnGJB9MJB3DJBFFBtDJB3DJB3DJBDFBvDMB0DJBJGBoDJBpDGBISBuDJBhDJB3DJBnCTBtIJBnCJBwWTBybCBwHJBHJBXJBtJJBhEKBmFJBHJB3FJB3CJBnEJBHJB3gBEEBEBHJBnGyBBDEB3W7BBvCVB3TdBqrBqYqYaIBPCB4KDBrEJBfHBCOBhBJBoBOBh7cJB9FJBhKFB7EJBnBJBnGJBXJB3CJB3MJB34UJBuPsBBN4BBSBB2KaBlBDBeJJnEEBrGJBvdHBaGBoBIBsCEBXFBhFBBDPBDtBBhCIB1BBBfCBsCEBpDHBZHBqBGBrKFBxBJBHJB3IeB-EJBrBDBxDGBnEdBhEJB9BJBxEJBITB8HJB3KJB3DJB3LJBnDJBHTBtCLBlNSB+CJB3UJB3CcBkHJBnCJB3BJBnLJBnDUBshBuDBimPJBnpCJB3CJBnEJBCGBvQJBnIWB+KCB6nXJBnuBTBNTBtDYB2iBxBBhqCJBnNJB3PJB4HJBtWIBhEJB4Y6BBCCBCDBtCsBBCOBjeMBk3CJB",!1)),Nd:()=>new g(m("wBJnxBJnEJnGJ9MJ3DJ3DJ3DJ3DJ3DJ3DJ3DJ3DJ3DJhDJ3DJnCJ3IJnCJn6BJnBJtJJhEJnFJHJ3FJ3CJnEJHJnuiBJnVJnBJnGJXJ3CJ3MJ34UJnsBJnkCJHJ9YJhEJ9BJxEJ3IJ3KJ3DJ3LJnDJHTtCJnNJnDJ3UJ3CJ3HJnCJ3BJnLJ3uQJnpCJ3CJnEJ3QJ37XJ12CxBhqCJnNJ3PJ4HJ2aJ30EJ",!0)),Nl:()=>new g(m("u3FCBwzCiBBDDB-zDaaBHBPCBs1dJBxyW0BBtOJJnEEBrhIuDBm8SCB",!1)),No:()=>new g(m("yFBBGDDBBB2pCFB5LFB5DCBmEGB6GGBSIByNJB2hBTB0jBJBhP20B20BEFBHJBnGPBqB3W3WB6BBvCVB3TdBqrB1kB1kBBCBrEJBfHBCOBhBJBoBOBxrdFBymWsBBiCDBSBB2KaBlBDB1pBHBaGBoBIBsCEBXFBhFBBDPBDtBBhCIB1BBBfCBsCEBpDHBZHBqBGBrKFBhLeB-EJBrBDBxDGBnETB8LTBmqBBBvNIBobSB0aUBn8SGB-YWBqhZTBNTBtDYBvqFIBid6BBCCBCDBtCsBBCOBjeMB",!1)),P:()=>new g(m("hBCBCFBCDBLBBEBBbCBCccCkBkBGEELBBEEE-VJJzOFBqBBB0BCCDDDtBBBVBBCBBOCCBBBrCDBnDsBsBBMBqHCB3BOBgBmImIBLLtE5D5D6DnMnMNwLwL7CLLBpFpFBNBCmBmBBCBoCrCrCBDBFBBwDFBsFlTlTBHB4EuTuTtBBBvCCBoCBB+ECBCCBmBKB6JBB5GBBhEGBCFBhFBBLGBdCB9DDB8BEB-BBBhCHBM9Z9ZBWBJTBCMBCLBfBBPBB6TDBeBB+hBNBwCBBgBJB0MVBgCDBhBBB8XDBCBBxDwEwEBtBBCfBDLBkNCBFJBDLBRNNjD7C7CjgdBBuICBkDLL0DFB9LDB3CBBpBCBCyByBBwBwBiDMBRBB9DDB-DBBRBB6HzqUzqUBxGxGBIBXiBBCNBCFFCBB2ECBCFBCDBLBBEBBbCBCccCCCBFB7MCB9UxBxB-MoXoXoGgBgBxIIBnBxDxDBFBjCGB6CDByO-J-JjBlElEBDBtBDB+FGBuDBBCDB-DDBxBBBwCDBFOOCCB5CFBsDrJrJBCCBzDzDBDBLBBCpDpD7HWBqDCBdMBtCjEjEBBB9HpIpIBBB8E9C9CBGB0CCBCEB+CJB4GgDgDBDBrBBBmUBBrCMBwFxjBxjBBDB97CBB8zOBBmEiCiCBDBJpRpRBBBoJDBoK9lT9lTovHEB07C-a-aBAB",!1)),Pc:()=>new g(m("-Cg-Hg-HBUU-u3BBBZCBwHAB",!1)),Pd:()=>new g(m("tB9qB9qB0BiyDiyDmgBqgCqgCBEBiwDDDgBBBFdd-NUUwDxszBxszBBmBmBLqFqFhzD-J-J",!1)),Pe:()=>new g(m("pB0B0BgB+1D+1DC-6B-6BqtC4B4BQ7T7TCff-hBMCxChBhBCGC1MUChCCCiBmhBmhBCECtBGCtNICEGCDBB-ozB6G6GeOCESSCCCrF0B0BgBGD",!1)),Pf:()=>new g(m("7F+6H+6HEddpuDCCFDDQEE",!1)),Pi:()=>new g(m("rFt7Ht7HDBBDaapuDCCFDDQEE",!1)),Po:()=>new g(m("hBCBCCBDECBLLBEEBcclCGGPBBI-V-VJzOzOBEBqB3B3BDDDtBBBVBBCBBOCCBBBrCDBnDsBsBBMBqHCB3BOBgBmImIBLLtE5D5D6DnMnMNwLwL7CLLBpFpFBNBCxDxDrCEBFBBwDFBsFlTlTBHBmY9D9DBBBoCBB+ECBCCBmBFBCDB6JBB5GBBhEGBCFBhFBBLGBdCB9DDB8BEB-BBBhCHBMjajaBJJBGBJIBDDBDCBEKBCCCBIB7kDDBCBBxDwEwEBFFBBBDDDBHBCBBCDDBLLBDBCJBDDBCCCBLBDCBtNCB6B+F+FjgdBBuICBkDLL0DFB9LDB3CBBpBCBCyByBBwBwBiDMBRBB9DDB-DBBRBB6HlxUlxUBFBDXXVBBDDBECBCDBICBHCCB2E2EBBBCCBDECBLLBEEBcclBDDB7M7MBBB9UxBxB-MoXoXoGgBgBxIIBnBxDxDBFBjCGB6CDB0ZlElEBDBtBDB+FGBuDBBCDB-DDBxBBBwCDBFOOCCB5CFBsDrJrJBCCBzDzDBDBLBBCpDpD7HWBqDCBdMBtCjEjEBBB9HpIpIBBB8E9C9CBGB0CCBCEB+CJB4GgDgDBDBrBBBmUBBrCMBwFxjBxjBBDB97CBB8zOBBmEiCiCBDBJpRpRBBBoJDBoK9lT9lTovHEB07C-a-aBAB",!1)),Ps:()=>new g(m("oBzBzBgB-1D-1DC-6B-6B-rCEEnB4B4BQ7T7TCff-hBMCxChBhBCGC1MUChCCCiBmhBmhBCECaTTCECtNICEGCDipzBipzB4GeeCMCESSCCCrFzBzBgBEEDAB",!1)),S:()=>new g(m("kBHHRCBgBCCcCCkBEBCBBDCCBCBDEEfgBgBrODBNNBGGBCCCBPB2DPPBxDxDsErIrIBBB3DCBDDDBvGvGLUUB4H4HIBBpEqLqLBHHB2H2H-DjEjEBGBlEwGwGqBmGmGiGCBQCCBBBDFBVECmEHBCFBCBBGDBmGBBxXJB0WuLuLlL+E+EBgBBiLJBKIBhiBCCBBBMCBOCBOCBOBBmCOOoBCBOCBUhBB-BBBCDBCBBLCCBBBGFBCECFMMBFFBDBGDBC7B7BBFFB2LBFcBD+HBXKByCtCBXnTBtBwBBDeBLyMBX+BBFfBD1LBDpEBmHFBmLBBvBZBC4CBN1GBbPBFOOBNNWBBHBB8CBB0HBBFJBhBlBBKRRBdBMdBJQQBeBLmBBQ-JBhuG-BBx0V2BB6RWBKBBoDBB+EDBLDB+RCBiHPPB+9T+9TpEgBBuLPBhCBB3BHBtBDBjDCCBBBD7E7EHRRBBBgBCCcCCiEGBCGBOBB6JIB6BQBDCBCMBEwBwBBrBB7zBBBwSmWmWBiKiKBGBnjC2kC2kCBbBr6SDBG3qU3qUk7DvHBLCBEzNBHWBQQBgDzDB9B1HBLmBBD7BBGCBXBBIdBF8BBWhCBE7F7FB1CBrbaagBaagBaagBaagBaa9B-PB4BDBzBHBCNBCBBp2BwNwNttCEE+DiOiOBvIvIBqBBFjDBNOBDOBCOBCkBBYgFB5BcBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBC7CBLAB",!1)),Sc:()=>new g(m("kB+D+DBCBqnB8D8DzPBBzPBBI2H2HoImSmS8sClmClmCBgBB37hBkuVkuVtD7E7E8GBBEBB3-HDB-4wBxtCxtC",!1)),Sk:()=>new g(m("+CCCoCHHFEEqQDBNNBGGBCCCBPB2DPPBjoBjoB15FCCBBBMCBOCBOCBOBB9kEBBkzdWBKBBoDBBxePPBniUniUBPB8bCCjF4g9B4g9BBDB",!1)),Sm:()=>new g(m("rBRRBBB+BCCuBFFmBgBgB-XwQwQBBB8xGOOoBCBOCBsEoBoBBDBHlClCBDBGBBFGDIgBgBBDDCgBgBBqIBhBBB7CffBXBpBFB2OKK3BHBwDxKxKBDBDeBLPBhIiEBX+BBFfBDhIBxBUBDFB9+zB5Z5ZCCBlFRRBBB+BCCkEHHBCBitDBBhrwBx+Bx+BagBgBagBgBagBgBagBgBat5Ft5FB-uC-uCBHB",!1)),So:()=>new g(m("mFDDFCCyerIrIBgEgEBvGvGLUUB4H4HkQ2L2LjEFBClElEwGqBqBoMCBQCCBBBDFBVECmEHBCFBCBBGDBmGBBxXJB0WzWzW+EhBBiLJBKIBksBBBCDBCBBLCCBHHBEBCECFMMBPPCBBC7B7BBKKBDBDDBCBBCBBCGBCeBDBBCCCBdBtIHBFTBDGBDwCBCdBanBBHnCBXKByCtCBX2FBCIBC1BBJuDBC3HBtBrBBhC-HBhQvBBWBBHmBBDpEBmHFBmLBBvBZBC4CBN1GBbPBFOOBNNWBBHBBxKBBFJBhBlBBKRRBdBMdBJQQBeBLmBBQ-JBhuG-BBx0V2BBibDBLBBC+R+RBBBqqUPBuLPBhCBB3BHBuBCBlPEEFBBOBB6JIB6BQBDCBCMBEwBwBBrBB7zBBBwSpgBpgBBGBnjC2kC2kCBGBFQBr6SDBG3qU3qUk7DvHBLCBEzNBHWBQPBhDzDB9B1HBLmBBD7BBGCBXBBIdBF8BBWhCBE7F7FB1CBqlB-PB4BDBzBHBCNBCBBp2B96C96CiEyWyWBqBBFjDBNOBDOBCOBCkBBYgFB5BcBOrBBFIBIBBPFB7E6HBG4WBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBB-B3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBC7CBLAB",!1)),Z:()=>new g(m("gBgEgEgvFgsCgsCBJBeBBGwBwBh9DAB",!1)),Zl:()=>new g(m("ohIA",!0)),Zp:()=>new g(m("phIA",!0)),Zs:()=>new g(m("gBgEgEgvFgsCgsCBJBlBwBwBh9DAB",!1)),ASCII_Hex_Digit:()=>new g(m("wBJIFbF",!0)),Alphabetic:()=>new g(m("hCZBHZBwBLLFGGBVBCeBCpOBFLBPEBICC3CeeBQBCBBDDBCHHCCBCCCBSBCyCBCqEBJlFBClBBDHHBnBBoBNBCCCBCCBCCJaBFDBeKBG3BBCGBPlDBCHBFHBFCBLCBDRRBuBBOkDBZgBBKBBFGGBWBDSBUYBIKBGXBCGBIJJBoBBLLBEGBHrCBCPBCCBFOBOSBCHBDBBDVBCGBCEEBCBEHBDBBDBBCJJFBBCEBNBBLFFBBBCFBFBBDVBCGBCBBCBBCBBFEBFBBDBBFIIBCBCSSBEBMCBCIBCCBCVBCGBCBBCEBEIBCCBCBBEQQBCBWDBFCBCHBDBBDVBCGBCBBCEBEHBDBBDBBKBBFBBCEBORRBCCBEBECBCDBEBBCCCBEEBEEBBBELBFEBECBCCBEHHpBMBCCBCWBCPBEHBCCBCCBJBBCCBCBBDDBdDBCHBCCBCWBCJBCEBEHBCCBCCBJBBGCBCDBOCBNMBCCBCoBBDHBCCBCCBCGGBCBIEBXFBCCBCRBEXBCIBCDDBFBJFBCCCBGBTBBO5BBGGBH0B0BBECBDBCXBCCCBRBCCBDEBCHHPDBhBgCgCBGBCjBBFSBFPBCjBBkC2BBCDDBDBR-BBLDBDlBBCGGDqBBCsKBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBmBPBR1CBDFBErTBDQBCZBGqCBEKBITBMUBNTBNMBCCBCBBNzBBDSBPFFkC4CBIqBBGlCBLeBCLBFIBYdBDEBMrBBFZB3BbBF+BBDTBzBYYBMMBBByBzBBCOBCHB0BpBBDDBLrBBCKBP2BBXCBLjBBDKBGqBBDCBqBDBCFBCBBEGGB+FBUhBBM1IBDFBDlBBDFBDHBCGCBdBD0BBCGBCEEBBBCGBEDBDFBFMBGCBCGB1DOORMBmDFFDJBCEEBDBHGCBCBCKBDDBGEBFSSBnBBuZzBB34BkHBHDBEBBNlBBCGGD3BBIRRBVBKGBCGBCGBCGBCGBCGBCGBCGBCfBwB2O2OBBBaIBIEBDEBF1CBHCBC5CBCDBGqBBC9CBSfBxBPBhQ-tGBhCs0VBkCtBBDsIBEPBLBBVuBBGHBEwDBoBIBDmDBDxCBVUBCgBBZzBBNjCBCtBtBBEBECCBBBLgBBGiBBOcBEyBBCLBQRRBOBLEBC2BBKNBTWBEkCBCCCZCBDPBDDBMFBDFBDFBKGBCGBCqBBCNBH6DBWj9KBNWBFwBBloItLBDpDBnBGBNEBGLBCMBCEBCCCBCCBCCBqDBiBqLBT-BBD1BBpBLB1DEBCmEBlBZBHZBM4CBEFBDFBDFBDCBkBLBCZBCSBCBBCOBDNBjB6DBmC0BBsIcBEwBBwBfBOdBGqBBGdBDjBBFHBCEBrB9EBTjBBFjBBFnBBJzBBNKBCOBCGBCBBCKBCOBCGBCBBEzBBN2JBKVBLHBZFBCpBBCIBmCFBDCCBqBBCBBEDDBVBLWBKeBiCSBCBBLVBLZBHZBnB3BBHBBhCDBCBBGHBCCBCcBrBcBEcBkBHBCbBc1BBLVBLSBORBvDoCB4ByBBOyBBOnBBjBbBEGGBVB7HpBBCBBEBBRFBzBCBEcBLJJBUBrBRBvBUBcWBKlCBsBEBL4BBKOOBXBYyBBSDBJiBBEKKB+BBCDBKBBLCCkBRBChBBDHHBCB-BGBCCCBCBCOBCJBI4BBYDBCHBDBBDVBCGBCBBCEBEHBDBBDBBEHHGGBdJBCDDClBBCJBCDDCDBCBBECCtBhCBCCBCDBVCBfhCBDBBC5F5FB0BBDGBaFBjB+BBCEE8B1BBDoCoCBZBDNBWGB6F4BBoD-BBgBHBDDDBGBCBBCdBCBBDBBDDB+CHBDtBBDFBCCCBccBxBBDJBSnCBGTTBnCBoDHB5CgBBgBIBCsBBCGBCyByBBcBDVBCNBqCGBCBBCrBBECCBCCBBBCDDBZZBEBCBBCkBBCBBCDBCYYBqBBlIWBKQBCoBBECBwDwCwCB4cBnDuDBSjGBtyCgDBQvhBBSFBa68DBGmSB61GuBBy2B4RBIeBSuCBSdBTvBBRDBgBUBGSBxNsBB0G-BBhBYBDYBtBqCBF4BBIQBhCBBCNNBFBK1mHBqBfBiDyDB+vIDBCGBCBBCiJBQeeBBBDPPBCBJrMBloCqDBGMBEIBIJBFi7Fi7FBzCBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDYBCYBCeBCYBCeBCYBCeBCYBCeBCYBCHB15BeBHFB2GGBCQBDGBCBBCEBG9BBiBxDxDBrBBLGBRiKiKBcBTrBBlPbBlHdBDwGwGBdBCVBJBBhHGBCDBCBBCOBCkGB8BjCBEEE1lBDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1TZBHZBHZB3zD-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),Dash:()=>new g(m("tB9qB9qB0BiyDiyDmgBqgCqgCBEB+BoBoBQnMnMlgDDDgBBBFdd-NUUwDxszBxszBBmBmBLqFqFhzD-J-J",!1)),Emoji:()=>new g(m("jBHHGJBwDFFu8HNN5GXX7CFBQBBwLBBNnFnFaKBFCBoGoHoHBLLK7B7BBCBCEBKGDBDDFDDCBBDIEBJJBBBGCCGLBMBBDCCBCCTDDBTTBEBCCCBEEBGGDBBFBBMBBGBBDGGBECBVVBGGBEBCDBDFFDDDBEBCDDCCCHEEHLLBQQDFFCFFBBBCMMBxBxBBBBKeP1LBBwOCBUBB0BFF7mBNN6SCCrrvDrGrGhFBBNBBPDDBIBsCZBCBBYVVDIBWBBvFhBBDvDBDBBCCBDyCBDCBCmIBC+BBMFBCXBIBBDHBNDDBCBDFFBOOBDDJBBKGGBBBNCBJCBDCCFHHEHHB0CBxBlCBGHBDDBEJBECCBEEDJBkHLBF8I8IBtBBCJBC4FBxDMBEKBE4BBCFFBOBDLBFJB",!1)),Emoji_Component:()=>new g(m("jBHHGJB0+H2G2Gsp3B3+8B3+8BBYB8PEBxtBDBtzhY-CB",!1)),Emoji_Modifier:()=>new g(m("7-8DE",!0)),Emoji_Modifier_Base:()=>new g(m("9wJ8G8GRDB4jzD9B9BBBBDDDBBB2DBBDKBWSBEFFBBBCCBICCZqGqGBFFWFFBvFvFBBBEEB0CRRBBBKMMgSDDJHBHKKBIBDCB5B+B+BBCCBCCSCBCMBmHCBrBIB",!1)),Emoji_Presentation:()=>new g(m("64IBBuGDBEDDqQBBWBBzBLBsBUUOJJBSSBGGBJJGWWIBBCFFDIIFBBdkBkBCFFBBBC+B+BBBBZPP8aBB0BFFvlxDrGrG-FDDBIBsCZBCZZVDDBDBCCBWBBvFgBBNIBClCBCVBNqBBFEBNQBEEEBlCBCCCB5FBD+BBODBCXBTbbBOO3C0CBxBlCBHEEBBBDDBEDBMBBIIBkHLBF8I8IBtBBCJBC4FBxDMBEKBE4BBCFFBOBDLBFJB",!1)),Extended_Pictographic:()=>new g(m("pFFFu8HNN5GXX7CFBQBBwLBBNnFnFaKBFCBoGoHoHBLLK7B7BBCBCEBKGDBDDFDDCBBDIEBJJBBBGCCGLBMBBDCCBCCTDDBTTBEBCCCBEEBGGDBBFBBMBBGBBDGGBECBVVBGGBEBCDBDFFDDDBEBCDDCCCHEEHLLBQQDFFCFFBBBCMMBxBxBBBBKeP1LBBwOCBUBB0BFF7mBNN6SCCrrvDoBoBBCBlDLBQBBQPPBmBmBBIBxDBBNBBPDDBIBU3BBcOBLVVDIBCDBKWBH7FBDvDBDBBCCBDyCBDCBCDBG9HBC+BBMFBCXBIBBDHBNDDBCBDFFBOOBDDJBBKGGBBBNCBJCBDCCFHHEHHB0CBxBlCBGHBDQBECCBEBDMB7GlBBNDB5BHBLFBpBHBfBBNDBDNBKmBBNuBBCJBC4FB5CHBPxEBhI9fB",!1)),Hex_Digit:()=>new g(m("wBJIFbFq1-BJIFbF",!0)),Lowercase:()=>new g(m("hDZBwBLLFlBlBBWBCHBC2BCBQCBuBCDECBBBDCCDEEBFFDEEBBBDDDCCCDCCBCCDEECDDBDDBBBHGDCOCBSCBDDCEEC4BCBFBDDDBCCFICBjCBDiBBIBBfEBhDsBsBCEEDDBTccBhBBCBBECBCWCBDBCGDB0B0BBuBBCgBCK0BCDMCBgDCxBoBBo6CqBBCDB5XFBjkCIBC2D2DB+FBiC0ECBHBCgDCBHBJFBLHBJHBJFBLHBJHBJNBDHBJHBJHBJEBCBBHEEBBBCBBJDBDBBJHBLCBCBB6DOORMBuDEEBEEcKFDBBJDBFiBiBBOBFsasaBYBn6BvBBCEEBGCFCCBCCBGBEiDCBIICFFNlBBCGG0oesBCUaCBBBmEMCBBBC8BCBIBCCCDICFCCDCCBBBCSCGGGCMCFCCDOCWDBCCCBBB2ZqBBCNBHvCBh6TGBNEBqhBZBumBnBBpEjBB8EKBCOBCGBCBBkODDBBBCpBBCIBmoByBB+DVB75CfBhsVfB8BYBnqZZBbGBCRBbZBbDBCCCBFBCKBbZBbZBbZBbZBbZBbZBbZBbZBbbBdYBCFBbYBCFBbYBCFBbYBCFBbYBCFBC15B15BBIBCTBHFBmI9BB1lChBB",!1)),Math:()=>new g(m("rBRRBBBgBeeCuBuBFmBmBgB5W5WBBBDbbBDDBBBwQCBuwGccBBBMEEOPPBCBWEBMEBiCMBFEEBFFBDBTFFDJBCDDBEBHEEBDDBCCBBBCFBENBClClCBWBCFBCBBFBBFfBCHHBPPBqIBJDBVBB7CffBZBCZZMGB+NBBNJBFFBFBBDBBEEBPCCDFBMHBGBB6BCCeDBKCBxK-BBhI-PBxBUBDFB9+zB4Z4ZBEBCjFjFRCBeCCeCCkEHHBCBitDBBhrwBwoBwoBBzCBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBDxBBhwFDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBB-uCIB",!1)),Quotation_Mark:()=>new g(m("iBFFkEQQ96HHBaBBowDqOqOBCBOCBixzBDB+FFF7CBB",!1)),Terminal_Punctuation:()=>new g(m("hBLLCMMBEE-ZJJiQ6B6BpCPPCCB1FsBsBBJBCsHsHB3B3BBEBCHBgBmImIB1nB1nBBtFtFFFB4JBB2YHBmY9D9DBBBoCBB+ECBEoBoBBCBDBB7JBBjLDBjFBBLBBCCBeCB8FEB-BBBldYYBKKBBBwlDCBzJOOFLLCBBEBBtNBB8ndBBuICBkHEB-LBB3CBBgD4E4EBBB0ECBgERRB6H6HnxUDDB6B6BBBBCDBqFLLCMMBEEiCDD7hBxBxBnkBoGoG3JBB5EFBlCFB6CDB5dEBtBDB+FGBxDDBgECBiEBBHRRB5C5CBDBtDrJrJB2D2DBBBNBBnLDBEOBqDBB6HCBmQCC8HBB4CBBFBB-MCBuBmUmUBrCrCBspBspBBDB6vRBBmEiCiCBBBLqRqRBoJoJBnwTnwTovHDB",!1)),Uppercase:()=>new g(m("hCZBmDWBCGBiB2BCDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIJDCMCDQCDDDCCBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBDDBBBEWCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBpCDBNDBNDBNEBMDBnIFFECBDCBDEEBDBHGCBCBDDBLBBGbbBOBUzZzZBYBx5BvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoqZZBbZBbZBbCCBGDBDDBCBCHBbZBbBBCDBDHBCGBcBBCDBCEBCEEBFBcZBbZBbZBbZBbZBbZBfYBiBYBiBYBiBYBiBYBiB2pE2pEBgBBvgCZBHZBHZB",!1)),White_Space:()=>new g(m("JEBTlDlDbgvFgvFgsCKBeBBGwBwBh9DAB",!1))})),G(Ln,"SCRIPTS",new po({Adlam:()=>new g(m("go6DrCFJFB",!0)),Ahom:()=>new g(m("g4lCaDOFW",!0)),Anatolian_Hieroglyphs:()=>new g(m("ggxCmS",!0)),Arabic:()=>new g(m("gwBEBCFBCNBCCBCfBCJBMZBCrDBChBBxCvBBxHhBBGqCBCcBxy8BtPBDvEBhBPBxDEBCmEBk7DeBkCFBJIBiBFBh43BDBCaBCBBCDDCJBCDBCCCHFFCECBBBCBBCDDCICBCCDDBCGBCDBCDBCCCBIBCQBGCBCEBCQB1BBB",!1)),Armenian:()=>new g(m("xpBlBDxBDCks9BE",!0)),Avestan:()=>new g(m("g4iC1BEG",!0)),Balinese:()=>new g(m("g4GsCCxB",!0)),Bamum:()=>new g(m("g1pB3CpowB4R",!0)),Bassa_Vah:()=>new g(m("w26CdDF",!0)),Batak:()=>new g(m("g+GzBJD",!0)),Bengali:()=>new g(m("gsCDBCHBDBBDVBCGBCEEBCBDIBDBBDDBJFFBCCBDBDYB",!1)),Beria_Erfe:()=>new g(m("g17CYDY",!0)),Bhaiksuki:()=>new g(m("ggnCICsBCNLc",!0)),Bopomofo:()=>new g(m("qXB6wLqBxDf",!0)),Brahmi:()=>new g(m("ggkCtCFjBKA",!0)),Braille:()=>new g(m("ggK-H",!0)),Buginese:()=>new g(m("gwGbDB",!0)),Buhid:()=>new g(m("g6FT",!0)),Canadian_Aboriginal:()=>new g(m("ggF-TxRlC7tgCP",!0)),Carian:()=>new g(m("g1gCwB",!0)),Caucasian_Albanian:()=>new g(m("wphCzBMA",!0)),Chakma:()=>new g(m("gokC0BCR",!0)),Cham:()=>new g(m("gwqB2BKNDJDD",!0)),Cherokee:()=>new g(m("g9E1CDFz7lBvC",!0)),Chorasmian:()=>new g(m("w9jCb",!0)),Common:()=>new g(m("AgCBbFBbuBBCOBCEBYgBgBiOmBBGEBDTB1DKKHCC+THHPEEhB9E9ElQiEiEB6mB6mB2MDBjJwvBwvBBBBoCBBsGBBCumBumBOIIBCBCFBCCBDmYmYBKBD2CBCKBEKBCOBShBB-BlBBCCBDFBCaBCQBqBCBF5UBXKBW-cBhIzTBDpEBhQ9CBzMUBCCCBXBQHBFDB8CBBE7C7CB0E0EBOBhBlBBKxBxBB+BBgBwCBwB5C5CBmFBhuG-BBhoWhBBnDCBmFJB1HhFhFsMPPBzuUzuUBxGxGBIBXiBBCSBCDB0ECCBeBbFBbKBLuBuBBhChCBFBCGBLEBjICBFsBBEIBxCMB0BsBBlHaBltuBDB96D8HBEzNBHWBQQBgDzDB9B1HBLmBBD9BBEQBJBBIdBF8BB2GTBNTBN2CBKYBoE0CBCmCBCBBDDDBDDBCBCLBCCCBFBCgCBCDBDHBCGBCbBCDBCEBCEEBFBCzKBDjJBDxBByjFjCBtC8BBjWrBBFjDBNOBDOBCOBCkBBLtFB5BZBCBBOrBBFIBIBBPFB7E4eBEQBEMBE5GBHLBFQQBKBF3BBJJBHnBBJdBDLBFBBPIBoB3KBJNBDMBEKBE4BBCFFBOBDLBFJBIyEBCmDBnghYffB+CB",!1)),Coptic:()=>new g(m("ifNxkKzDGG",!0)),Cuneiform:()=>new g(m("ggoC5cnDuDCEMjG",!0)),Cypriot:()=>new g(m("ggiCFBDCCBqBBCBBEDD",!1)),Cypro_Minoan:()=>new g(m("w8rCiD",!0)),Cyrillic:()=>new g(m("ggBkEBDoFBx6FKBhFtCtCojEfBhie-CBv8VBBhw4B9BBiBAB",!1)),Deseret:()=>new g(m("gghCvC",!0)),Devanagari:()=>new g(m("goCwCFODZh7nBfhwcJ",!0)),Dives_Akuru:()=>new g(m("gomCGBDDDBGBCBBCdBCBBDLBKJB",!1)),Dogra:()=>new g(m("ggmC7B",!0)),Duployan:()=>new g(m("ggvDqDGMEIIJDD",!0)),Egyptian_Hieroglyphs:()=>new g(m("ggsC1iBL68D",!0)),Elbasan:()=>new g(m("gohCnB",!0)),Elymaic:()=>new g(m("g-jCW",!0)),Ethiopic:()=>new g(m("gwEoCBCDBDGBCCCBCBDoBBCDBDgBBCDBDGBCCCBCBDOBC4BBCDBDiCBDfBEZBnvGWBKGBCGBCGBCGBCGBCGBCGBCGBjpfFBDFBDFBKGBCGBylvCGBCDBCBBCOB",!1)),Garay:()=>new g(m("gqjClBEcJB",!0)),Georgian:()=>new g(m("glElBBCGGDqBBCDBx8CqBBDCBhiElBBCGG",!1)),Glagolitic:()=>new g(m("ggL-Ch9sDGCQDGCBCE",!0)),Gothic:()=>new g(m("w5gCa",!0)),Grantha:()=>new g(m("g4kCDBCHBDBBDVBCGBCBBCEBDIBDBBDCBDHHGGBDGBEEB",!1)),Greek:()=>new g(m("wbDBCCBDDBCFFCCCBBBCCCBSBC+BBPPBnpGEBzBEBFEB1ChKhKBUBDFBDlBBDFBDHBCGCBdBD0BBCOBCNBDFBCSBDCBCIBoJ-xiB-xiB7uVuCBSgj0Bgj0BBkCB",!1)),Gujarati:()=>new g(m("h0CCBCIBCCBCVBCGBCBBCEBDJBCCBCCBDQQBCBDLBIGB",!1)),Gunjala_Gondi:()=>new g(m("grnCFCBCkBCBCFIJ",!0)),Gurmukhi:()=>new g(m("hwCCBCFBFBBDVBCGBCBBCBBCBBDCCBDBFBBDCBEIIBCBCIIBPB",!1)),Gurung_Khema:()=>new g(m("go4C5B",!0)),Han:()=>new g(m("g0LZBC4CBN1GBwBCCaIBPDBle-tGBhC-vUBhoWtLBDpDBpodBBNGBqgkB-2pBBhB9oEBDt0FBDwpHBQtTBjtC9QBjvBq6EBGppIB",!1)),Hangul:()=>new g(m("goE-HvxHBiI9CyDeiCei3dckUj9KNWFwBl9JeEFDFDFDC",!0)),Hanifi_Rohingya:()=>new g(m("gojCnBJJ",!0)),Hanunoo:()=>new g(m("g5FU",!0)),Hatran:()=>new g(m("gniCSCBGE",!0)),Hebrew:()=>new g(m("xsB2BBJaBFFBpp9BZBCEBCCCBCCBCCBIB",!1)),Hiragana:()=>new g(m("hiM1CBHCBi7-C+IBTeeBBBulQAB",!1)),Imperial_Aramaic:()=>new g(m("giiCVCI",!0)),Inherited:()=>new g(m("gYvDB2IBBlOKBbhXhXBCB8qEtBBDLBlPCBCMBCGBFHHEBBnG-BBtQBBjGgBB65DDBsDBBmrzBPBRNBwejHjH7iEl+uBl+uBBsBBDWBhRCBSHBDGBfDBz6rYvHB",!1)),Inscriptional_Pahlavi:()=>new g(m("g7iCSGH",!0)),Inscriptional_Parthian:()=>new g(m("g6iCVDH",!0)),Javanese:()=>new g(m("gsqBtCDJFB",!0)),Kaithi:()=>new g(m("gkkCiCLA",!0)),Kannada:()=>new g(m("gkDMCCCWCJCEDICCCDIBGCCDDJCC",!0)),Katakana:()=>new g(m("hlM5CBDCBxHPBxGuBBC3CBvgzBJBCsBBzisBDBCGBCBBCgJgJBBBzBPPBCB",!1)),Kawi:()=>new g(m("g4nCQCoBEc",!0)),Kayah_Li:()=>new g(m("goqBtBCA",!0)),Kharoshthi:()=>new g(m("gwiCDCBGHCCCcDCFJII",!0)),Khitan_Small_Script:()=>new g(m("k-7C84G84GB0OBqBAB",!1)),Khmer:()=>new g(m("g8F9CDJHJnPf",!0)),Khojki:()=>new g(m("gwkCRCuB",!0)),Khudawadi:()=>new g(m("w1kC6BGJ",!0)),Kirat_Rai:()=>new g(m("gq7C5B",!0)),Lao:()=>new g(m("h0DBBCCCBDBCXBCCCBVBDEBCCCBFBCJBDDB",!1)),Latin:()=>new g(m("hCZBHZBwBQQGWBCeBCgOBoBEB8wGlBBHwBBGDBGMBClCBiC-HByLOORMBuEBBHccSoBB42CfBj1elDBExCBVOBxZqBBCIBCDB38TGB7gBZBHZBmhCFBCpBBCIBm61BeBHFB",!1)),Lepcha:()=>new g(m("ggH3BEOEC",!0)),Limbu:()=>new g(m("goGeBCLBFLBFEEBKB",!1)),Linear_A:()=>new g(m("gwhC2JKVLH",!0)),Linear_B:()=>new g(m("gggCLCZCSCBCODNjB6D",!0)),Lisu:()=>new g(m("wmpBvBx1eA",!0)),Lycian:()=>new g(m("g0gCc",!0)),Lydian:()=>new g(m("gpiCZGA",!0)),Mahajani:()=>new g(m("wqkCmB",!0)),Makasar:()=>new g(m("g3nCY",!0)),Malayalam:()=>new g(m("goDMCCCyBCCCFFPDZ",!0)),Mandaic:()=>new g(m("giCbDA",!0)),Manichaean:()=>new g(m("g2iCmBFL",!0)),Marchen:()=>new g(m("wjnCfDVCN",!0)),Masaram_Gondi:()=>new g(m("gonCGBCBBCrBBECCBCCBHBJJB",!1)),Medefaidrin:()=>new g(m("gy7C6C",!0)),Meetei_Mayek:()=>new g(m("g3qBWqGtBDJ",!0)),Mende_Kikakui:()=>new g(m("gg6DkGDP",!0)),Meroitic_Cursive:()=>new g(m("gtiCXFTDtB",!0)),Meroitic_Hieroglyphs:()=>new g(m("gsiCf",!0)),Miao:()=>new g(m("g47CqCF4BIQ",!0)),Modi:()=>new g(m("gwlCkCMJ",!0)),Mongolian:()=>new g(m("ggGBBDCCBSBH4CBIqBB2t-BMB",!1)),Mro:()=>new g(m("gy6CeCJFB",!0)),Multani:()=>new g(m("g0kCGBCCCBCBCOBCKB",!1)),Myanmar:()=>new g(m("ggE-EhqmBeiDfxibT",!0)),Nabataean:()=>new g(m("gkiCeJI",!0)),Nag_Mundari:()=>new g(m("wm5DpB",!0)),Nandinagari:()=>new g(m("gtmCHDtBDK",!0)),New_Tai_Lue:()=>new g(m("gsGrBFZHKEB",!0)),Newa:()=>new g(m("gglC7CCE",!0)),Nko:()=>new g(m("g+B6BDC",!0)),Nushu:()=>new g(m("h-7CvsQvsQBqMB",!1)),Nyiakeng_Puachue_Hmong:()=>new g(m("go4DsBENDJFB",!0)),Ogham:()=>new g(m("g0Fc",!0)),Ol_Chiki:()=>new g(m("wiHvB",!0)),Ol_Onal:()=>new g(m("wu5DqBFA",!0)),Old_Hungarian:()=>new g(m("gkjCyBOyBIF",!0)),Old_Italic:()=>new g(m("g4gCjBKC",!0)),Old_North_Arabian:()=>new g(m("g0iCf",!0)),Old_Permic:()=>new g(m("w6gCqB",!0)),Old_Persian:()=>new g(m("g9gCjBFN",!0)),Old_Sogdian:()=>new g(m("g4jCnB",!0)),Old_South_Arabian:()=>new g(m("gziCf",!0)),Old_Turkic:()=>new g(m("ggjCoC",!0)),Old_Uyghur:()=>new g(m("w7jCZ",!0)),Oriya:()=>new g(m("h4CCCHDBDVCGCBCEDIDBDCICFBCEDR",!0)),Osage:()=>new g(m("wlhCjBFjB",!0)),Osmanya:()=>new g(m("gkhCdDJ",!0)),Pahawh_Hmong:()=>new g(m("g46ClCLJCGCUGS",!0)),Palmyrene:()=>new g(m("gjiCf",!0)),Pau_Cin_Hau:()=>new g(m("g2mC4B",!0)),Phags_Pa:()=>new g(m("giqB3B",!0)),Phoenician:()=>new g(m("goiCbEA",!0)),Psalter_Pahlavi:()=>new g(m("g8iCRIDNG",!0)),Rejang:()=>new g(m("wpqBjBMA",!0)),Runic:()=>new g(m("g1FqCEK",!0)),Samaritan:()=>new g(m("ggCtBDO",!0)),Saurashtra:()=>new g(m("gkqBlCJL",!0)),Sharada:()=>new g(m("gskC-ChsCH",!0)),Shavian:()=>new g(m("wihCvB",!0)),Siddham:()=>new g(m("gslC1BDlB",!0)),Sidetic:()=>new g(m("gqiCZ",!0)),SignWriting:()=>new g(m("gg2DrUQECO",!0)),Sinhala:()=>new g(m("hsDCBCRBEXBCIBCDDBFBEFFBEBCCCBGBHJBDCBt-gCTB",!1)),Sogdian:()=>new g(m("w5jCpB",!0)),Sora_Sompeng:()=>new g(m("wmkCYIJ",!0)),Soyombo:()=>new g(m("wymCyC",!0)),Sundanese:()=>new g(m("g8G-BhIH",!0)),Sunuwar:()=>new g(m("g+mChBPJ",!0)),Syloti_Nagri:()=>new g(m("ggqBsB",!0)),Syriac:()=>new g(m("g4BNC7BDCxIK",!0)),Tagalog:()=>new g(m("g4FVKA",!0)),Tagbanwa:()=>new g(m("g7FMCCCB",!0)),Tai_Le:()=>new g(m("wqGdDE",!0)),Tai_Tham:()=>new g(m("gxG+BCcDKHJHN",!0)),Tai_Viet:()=>new g(m("g0qBiCZE",!0)),Tai_Yo:()=>new g(m("g25DeCVJB",!0)),Takri:()=>new g(m("g0lC5BHJ",!0)),Tamil:()=>new g(m("i8CBBCFBECBCDBEBBCCCBEEBEEBBBELBFEBECBCDBDHHPUBm+kCxBBOAB",!1)),Tangsa:()=>new g(m("wz6CuCCJ",!0)),Tangut:()=>new g(m("g-7CgBgBB+3GBhQeBiDyDB",!1)),Telugu:()=>new g(m("ggDMCCCWCPDICCCDIBCCCBDDDJII",!0)),Thaana:()=>new g(m("g8BxB",!0)),Thai:()=>new g(m("hwD5BGb",!0)),Tibetan:()=>new g(m("g4DnCCjBFmBCjBCOCGFB",!0)),Tifinagh:()=>new g(m("wpL3BIBPA",!0)),Tirhuta:()=>new g(m("gklCnCJJ",!0)),Todhri:()=>new g(m("guhCzB",!0)),Tolong_Siki:()=>new g(m("wtnCrBFJ",!0)),Toto:()=>new g(m("w04De",!0)),Tulu_Tigalari:()=>new g(m("g8kCJBCDDClBBCJBCDDCDBCJBCBBJBB",!1)),Ugaritic:()=>new g(m("g8gCdCA",!0)),Unknown:()=>new g(m("4bBBHDBICCVuMuMnBBBzBBBE4B4BBGBcDBHKBvI9B9BBmDmDBMB8BBByBBBQddBCCMEBjBEBuHJJBDDBXXICCBBBFBBKBBDBBFHBCDBDGGBaaBEEHDBDBBXIIDGDBCCGDBDBBECBCGBFCCBFBSJBEKKEXXIDDGBBLIEBCCBNBFBBNGBIEEJBBDBBXIIDGGBKKBDDBEEBFBEDBDGGBTTBIBDHHBBBEFFBBBDCCDCBDCBECBNDBGCBEFFBCCBEBCNBWEBOEEYRRBKKEFFBFBDEEDBBFBBLGBXEEYLLGBBKEEFGBDEBEFFBLLELBOEE0BEEHDBRBBbEETCBZKKCBBICBCDBHCCJFBLBBELB7BDBekBBDCCGZZCYYBGGCIILBBFfBpClBlBBCBoBlBlBQOOBjBBnGCCBDBCBB6LFFBIICFFBqBqBFBBiBFFBIICFFBQQ6BFFBkCkCBhBhBBBBbFB3CBBHBB+UCB6CGBXIBZIBVLBOEEDLB-CBBLFBLFBbFB6CGBsBEBnCJBgBNNBCBNDBCCBrBBBGKBtBDBbFBMCB-BBBiCeeBMMBEBLFBPBBvBBBNTBuCnFnFBGB9BCBQCB-BEBsBBBMHBsBEB3QBBHBBnBBBHBBJGCgBBB2BQQPBBHUUBEEKmDmDNBBcOOBBBjBNBiBOBtEDB7UVBMUB14BBB-LEBuBCCBDBCBB5BGBDNBZIBI4BI-DhBBb6C6CBKB3GZBxC3C3CBoDoDBDBsB-C-C3CIBxBuzcuzcBBB4BIB9KTB5FHB+GTB9BCBLFB5BHBnCHBNFB1DKBfCBvCMMBCBiB4B4BBHBPBBLBBoDXBdJBHBBHBBHIBIII9BDB-DBBLFBl9KLBYDByBjoIBvLBBrDlBBILBGEBbGGCGDrUfBrBFB0BUUFDBGoEoEBCC-FCBHBBHBBHBBECBIIIBIBGBBNbbUDDQBBPhBB8DEBEDBuBCB5COOBBBCuBBvBhEBeCByBOBdDBlBIBfEBsBEBfmBmBBCBPpBB-EBBLFBlBDBlBDBpBHB1BKBNQQIDDMQQIDDBBB1BLB4JIBXJBJXBHrBrBKkCBHBBCtBtBDCBCBBYpCpCBGBKvBBUDDBDBiBCBcEBclBB5BDBVBBzBDDBDBJEEeBBEDBLGBKGBhCfBoBDBNIB3BCBeBBcEBbGBFLBIvCBqC2BB0BMB0BGBvBHBLFBnBCBeHBDvGBgBrBrBEBBDPBHHBKgBBvBHBrBVBblBBdTBYIBvCDBlBIBlCJBCBBaGBLFB2BTTBGBoBIBhDVVBJBTwBwBB8BBICCFQQMFB8BEBLFBFJJBDDBXXIDDGLLBDDBEEBCCBEBCEBIBBICBGKBLCCBCCnBLLCBBCFFLDDBGBDcB9CGGBcBpCHBLlFB3BBBnBhBBmCKBLFBOSB7BFBLFBVbBcBBQDBY4FB9BjDB0CLBJBBCBBJDDfDDBNNBHBLlCBJBBvBBBMaBpCHB0CMBqCGBL1CBJ3CBjBNBLFBKuBuBPJBeCBhBBBXPPBnCBIDDtBCBCDDKHBLFBHDDmBDDHGBLFBtBDBL1HBaGBSqBqBBBBe0CBCOBzBMB8clDBwDGGBJBlGryCBkDMB3iBJB88DEBoS41GB7Bl2BB6RGBgBLLBCByCLLBEBfBBHJBnCJBLIIWEBUvNB7BlGB8CEBaBBarBBsCDB6BGBS-BBGKBIIB3mHoBBhBgDB0D8vIBFIIDkJkJBNBCcBEBBCNBFHBtMjoCBsDEBOCBKGBLBBJ76DB+HCB1NFBYOBSOBvBBBYIB1D7BB3HJBoBBBjGUBnC5DBVLBVLB4CIBamEB2CoCoCDBBCBBDBBFNNCIIiCFFBJJIddFGGCCBI1K1KBlJlJB-V-VBNBGQQBuiBBgBFBH0GBISSBIIDGGBDB-BgBBCvDBuBCBPBBLDBD-JBgBQB7BEBCvOBrB1GBsBDBC-FBgBXXBGBD-GBIFFDQQmGBBRoBBtCDBLDBDwYBlCrCB+BhGBFccDCCBCCLFFCCCBEBCDBCECEDDCBBCICDCCBFFIKFCLLSEBEGGSzBBDtIBtBDBlDLBQBBQQQmBJBvF3BBeMBtBDBKGBDNBH5EB6eCBSCBOCB7GFBNDBCOBNDB5BHBLFBpBHBfBBNDBDNBKmBB5KHBPBBOCBMCB6BCCBCBRBBNDBLGB0EoDoDBjgBBh3pBfB-oEBBv0FBBypHOBvThtCB-QhvBBs6EEBrpIm8yVBCdBhD-DBxHvw-FB",!1)),Vai:()=>new g(m("gopBrJ",!0)),Vithkuqi:()=>new g(m("wrhCKCOCGCBCKCOCGCB",!0)),Wancho:()=>new g(m("g24D5BGA",!0)),Warang_Citi:()=>new g(m("glmCyCNA",!0)),Yezidi:()=>new g(m("g0jCpBCCDB",!0)),Yi:()=>new g(m("ggoBskBE2B",!0)),Zanabazar_Square:()=>new g(m("gwmCnC",!0))})),G(Ln,"FOLD_CATEGORIES",new po({L:()=>new g(m("laA",!0)),LC:()=>new g(m("laA",!0)),Ll:()=>new g(m("hCZBmDWBCGBiBuBCEECDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIBBCBBCBBCOCDQCDBBCCCBBBC4BCIBBCBBDCCBCBCGC3HrBrBCEEJHHCCBCCCBCCBPBCIBkBJJCUCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBZHBJHBJHBJEBMEBMDBNEBMEBqJEEBHHxC9zC9zCBuBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoyehBB",!1)),Lt:()=>new g(m("kOCCBCCBCClBCCtsHHBJHBJHBMQQwBAB",!1)),Lu:()=>new g(m("hDZB7BqBqBBWBCHBCuBCEECDOCDsBCDECBBBDCCDEEGDDECBDDDCCCDFFDEECDDECCGBBCBBCBBCOCBSCDBBCEECkBCEQCJDDBCCFICBEBCBBCCCBEEBCCBCBCEBDCCBDDIDDCBBEFBGLLBnFnFsBCCEEEBBBvBDBCdBCBBECBCWCBDBCGD1BvBBCgBCK0BCDMCBgDCyBlBBq6CqBBDCB5XFBjkCIBCvHvHERRzD0ECGGGC8CCBHBJFBLHBJHBJFBMGCJHBJNBzBBBNSSBPPBEEpL2B2Bs1CvBBCEEBGCHDDLiDCJCCFNNBkBBCGG0oesBCUaCoEMCE8BCLCCDICFFFCBBDSCMOCFCCDOCb9a9advCBi8UZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBvyehBB",!1)),M:()=>new g(m("5cgBgBlgHAB",!1)),Mn:()=>new g(m("5cgBgBlgHAB",!1)),Emoji:()=>new g(m("8mJA",!0)),Extended_Pictographic:()=>new g(m("8mJA",!0)),Lowercase:()=>new g(m("hCZBmDWBCGBiBuBCEECDOCDuBCBECEBBCCCBCCBBBDDBCBBCCBEBBCBBCECBCCDCCBCCBBBCCCBEEIBBCBBCBBCOCDQCDBBCCCBBBC4BCIBBCBBDCCBCBCGCiJCCEJJHCCBBBCCCBCCBPBCIBkBJJCUCGDDCBBDyBBxBgBCK2BCBMCD+CCDlBBq6ClBBCGGzW1CB0kCHHBpBBDCBhK0ECKgDCKHBJFBLHBJHBJFBMGCJHBZHBJHBJHBJEBMEBMDBNEBMEBqJEEBHHuBPBUzZzZBYBx5BvBBxBCCBBBDGCBCBCDDJCBCgDCJCCFuqeuqeCqBCUaCoEMCE8BCLECBICFCCDCCEUCBDBCEBCOCBCBCCCBQCZs5Vs5VBYBmmBnBBpEjBB9EKBCOBCGBCBBr3ByBB+EVB75CfBhsVfBhCYBoyehBB",!1)),Math:()=>new g(m("ycGDCHHFMMDDDCHHFAB",!1)),Uppercase:()=>new g(m("hDZB7BqBqBBWBCHBCuBCEECDOCDsBCDECBBBDCCDEEGDDECBDDDCCCDFFDEECDDECCGBBCBBCBBCOCBSCDBBCEECkBCEQCJDDBCCFICBEBCBBCCCBEEBCCBCBCEBDCCBDDIDDCBBEFBGLLBnFnFsBCCEEEBBBvBDBCdBCBBECBCWCBDBCGD1BvBBCgBCK0BCDMCBgDCyBlBBq6CqBBDCB5XFBjkCIBCvHvHERRzD0ECGGGC8CCBHBJFBLHBJHBJFBMGCJHBJNBzBBBNSSBPPBEEpLiBiBBOBFsasaBYBn6BvBBCEEBGCHDDLiDCJCCFNNBkBBCGG0oesBCUaCoEMCE8BCLCCDICFFFCBBDSCMOCFCCDOCb9a9advCBi8UZBumBnBBpEjBB8EKBCOBCGBCBBk4ByBB+DVB75CfBhsVfB8BYBvyehBB",!1))})),G(Ln,"FOLD_SCRIPT",new po({Common:()=>new g(m("8cgBgB",!1)),Greek:()=>new g(m("1FwUwU",!1)),Inherited:()=>new g(m("5cgBgBlgHAB",!1))})),Ln),Ee,W=(Ee=class{static is32(e,t){let n=0,s=e.length;for(;n<s;){const i=n+Math.floor((s-n)/2),o=e.getLo(i),B=e.getHi(i);if(o<=t&&t<=B){const c=e.getStride(i);return(t-o)%c===0}t<o?s=i:n=i+1}return!1}static is(e,t){if(t<=Ee.MAX_LATIN1){for(let n=0;n<e.length;n++){if(t>e.getHi(n))continue;const s=e.getLo(n);if(t<s)return!1;const i=e.getStride(n);return(t-s)%i===0}return!1}return e.length>0&&t>=e.getLo(0)&&Ee.is32(e,t)}static isUpper(e){if(e<=Ee.MAX_LATIN1){const t=String.fromCodePoint(e);return t.toUpperCase()===t&&t.toLowerCase()!==t}return Ee.is(pt.Upper,e)}static isPrint(e){return e<=Ee.MAX_LATIN1?e>=32&&e<Ee.MAX_ASCII||e>=161&&e!==173:Ee.is(pt.Print,e)}static simpleFold(e){if(pt.CASE_ORBIT.has(e))return pt.CASE_ORBIT.get(e);const t=b.toLowerCase(e);return t!==e?t:b.toUpperCase(e)}static equalsIgnoreCase(e,t){if(e===t)return!0;if(e<0||t<0)return!1;if(e<=Ee.MAX_ASCII&&t<=Ee.MAX_ASCII)return 65<=e&&e<=90&&(e|=32),65<=t&&t<=90&&(t|=32),e===t;for(let n=Ee.simpleFold(e);n!==e;n=Ee.simpleFold(n))if(n===t)return!0;return!1}},G(Ee,"MAX_RUNE",1114111),G(Ee,"MAX_ASCII",127),G(Ee,"MAX_LATIN1",255),G(Ee,"MAX_BMP",65535),G(Ee,"MIN_FOLD",65),G(Ee,"MAX_FOLD",125251),G(Ee,"MIN_HIGH_SURROGATE",55296),G(Ee,"MAX_HIGH_SURROGATE",56319),G(Ee,"MIN_LOW_SURROGATE",56320),G(Ee,"MAX_LOW_SURROGATE",57343),G(Ee,"MIN_SUPPLEMENTARY_CODE_POINT",65536),Ee);const Nc=256,pC=new Uint8Array(Nc);for(let r=0;r<Nc;r++)pC[r]=97<=r&&r<=122||65<=r&&r<=90||48<=r&&r<=57||r===95?1:0;let AB=null,RB=null;var we,$=(we=class{static emptyInts(){return[]}static isByteArray(e){return Array.isArray(e)||e instanceof Uint8Array}static isalnum(e){return b.CODES.get("0")<=e&&e<=b.CODES.get("9")||b.CODES.get("a")<=e&&e<=b.CODES.get("z")||b.CODES.get("A")<=e&&e<=b.CODES.get("Z")}static unhex(e){return b.CODES.get("0")<=e&&e<=b.CODES.get("9")?e-b.CODES.get("0"):b.CODES.get("a")<=e&&e<=b.CODES.get("f")?e-b.CODES.get("a")+10:b.CODES.get("A")<=e&&e<=b.CODES.get("F")?e-b.CODES.get("A")+10:-1}static escapeRune(e){let t="";if(W.isPrint(e))we.METACHARACTERS.indexOf(String.fromCodePoint(e))>=0&&(t+="\\"),t+=String.fromCodePoint(e);else switch(e){case b.CODES.get('"'):t+='\\"';break;case b.CODES.get("\\"):t+="\\\\";break;case b.CODES.get("	"):t+="\\t";break;case b.CODES.get(`
`):t+="\\n";break;case b.CODES.get("\r"):t+="\\r";break;case b.CODES.get("\b"):t+="\\b";break;case b.CODES.get("\f"):t+="\\f";break;default:{let n=e.toString(16);e<256?(t+="\\x",n.length===1&&(t+="0"),t+=n):t+=`\\x{${n}}`;break}}return t}static stringToRunes(e){const t=String(e),n=[];let s=0;for(;s<t.length;){const i=t.codePointAt(s);n.push(i),s+=i>W.MAX_BMP?2:1}return n}static runeToString(e){return String.fromCodePoint(e)}static isWordRune(e){return e<Nc?pC[e]===1:!1}static emptyOpContext(e,t){let n=0;return e<0&&(n|=we.EMPTY_BEGIN_TEXT|we.EMPTY_BEGIN_LINE),e===10&&(n|=we.EMPTY_BEGIN_LINE),t<0&&(n|=we.EMPTY_END_TEXT|we.EMPTY_END_LINE),t===10&&(n|=we.EMPTY_END_LINE),we.isWordRune(e)!==we.isWordRune(t)?n|=we.EMPTY_WORD_BOUNDARY:n|=we.EMPTY_NO_WORD_BOUNDARY,n}static quoteMeta(e){return e.split("").map(t=>we.METACHARACTERS.indexOf(t)>=0?`\\${t}`:t).join("")}static charCount(e){return e>W.MAX_BMP?2:1}static toArray(e){const t=e.length,n=new Array(t);for(let s=0;s<t;s++)n[s]=e[s];return n}static stringToUtf8ByteArray(e){if(globalThis.TextEncoder)return AB||(AB=new TextEncoder),AB.encode(e);{let t=[],n=0;for(let s=0;s<e.length;s++){let i=e.charCodeAt(s);i<128?t[n++]=i:i<2048?(t[n++]=i>>6|192,t[n++]=i&63|128):(i&64512)===W.MIN_HIGH_SURROGATE&&s+1<e.length&&(e.charCodeAt(s+1)&64512)===W.MIN_LOW_SURROGATE?(i=W.MIN_SUPPLEMENTARY_CODE_POINT+((i&1023)<<10)+(e.charCodeAt(++s)&1023),t[n++]=i>>18|240,t[n++]=i>>12&63|128,t[n++]=i>>6&63|128,t[n++]=i&63|128):(t[n++]=i>>12|224,t[n++]=i>>6&63|128,t[n++]=i&63|128)}return t}}static utf8ByteArrayToString(e){if(globalThis.TextDecoder){RB||(RB=new TextDecoder("utf-8"));const t=e instanceof Uint8Array?e:new Uint8Array(e);return RB.decode(t)}else{let t=[],n=0,s=0;for(;n<e.length;){let i=e[n++];if(i<128)t[s++]=String.fromCharCode(i);else if(i>191&&i<224){let o=e[n++];t[s++]=String.fromCharCode((i&31)<<6|o&63)}else if(i>239&&i<365){let o=e[n++],B=e[n++],c=e[n++],u=((i&7)<<18|(o&63)<<12|(B&63)<<6|c&63)-W.MIN_SUPPLEMENTARY_CODE_POINT;t[s++]=String.fromCharCode(W.MIN_HIGH_SURROGATE+(u>>10)),t[s++]=String.fromCharCode(W.MIN_LOW_SURROGATE+(u&1023))}else{let o=e[n++],B=e[n++];t[s++]=String.fromCharCode((i&15)<<12|(o&63)<<6|B&63)}}return t.join("")}}},G(we,"METACHARACTERS","\\.+*?()|[]{}^$"),G(we,"EMPTY_BEGIN_LINE",1),G(we,"EMPTY_END_LINE",2),G(we,"EMPTY_BEGIN_TEXT",4),G(we,"EMPTY_END_TEXT",8),G(we,"EMPTY_WORD_BOUNDARY",16),G(we,"EMPTY_NO_WORD_BOUNDARY",32),G(we,"EMPTY_ALL",-1),we);const gC=(r=[],e=0)=>{const t=Object.create(null);for(let n=0;n<r.length;n++){const s=r[n],i=e+n;t[s]=i,t[i]=s}return Object.freeze(t)};var Gn,wr=(Gn=class{getEncoding(){throw Error("not implemented")}asCharSequence(){throw Error("not implemented")}asBytes(){throw Error("not implemented")}length(){throw Error("not implemented")}isUTF8Encoding(){return this.getEncoding()===Gn.Encoding.UTF_8}isUTF16Encoding(){return this.getEncoding()===Gn.Encoding.UTF_16}},G(Gn,"Encoding",gC(["UTF_16","UTF_8"])),Gn),Eh=class extends wr{constructor(r=null){super(),this.bytes=r}getEncoding(){return wr.Encoding.UTF_8}asCharSequence(){return $.utf8ByteArrayToString(this.bytes)}asBytes(){return this.bytes}length(){return this.bytes.length}},Dw=class extends wr{constructor(r=null){super(),this.charSequence=r}getEncoding(){return wr.Encoding.UTF_16}asCharSequence(){return this.charSequence}asBytes(){return $.stringToUtf8ByteArray(this.charSequence.toString())}length(){return this.charSequence.length}},pr=class{static utf16(r){return new Dw(r)}static utf8(r){return $.isByteArray(r)?new Eh(r):new Eh($.stringToUtf8ByteArray(r))}},ht=class{static EOF(){return-8}constructor(){this.end=0}canCheckPrefix(){return!0}endPos(){return this.end}hasString(){return!1}hasAnyString(){return!1}prefixLength(){return 0}},Iw=class extends ht{constructor(r,e=0,t=r.length){super(),this.bytes=r,this.start=e,this.end=t}hasString(r,e){const t=r.bytes;if(t.length===0)return!0;const n=this.indexOf(this.bytes,t,this.start+e);return n!==-1&&n<=this.end-t.length}hasAnyString(r,e){return r.ac8?r.ac8.searchUTF8(this.bytes,this.start+e,this.end):!1}step(r){if(r+=this.start,r>=this.end)return ht.EOF();const e=this.bytes[r]&255;if(e<128)return e<<3|1;if(e>=194&&e<=223&&r+1<this.end){const t=this.bytes[r+1]&255;return(t&192)!==128?e<<3|1:((e&31)<<6|t&63)<<3|2}else if(e>=224&&e<=239&&r+2<this.end){const t=this.bytes[r+1]&255;if((t&192)!==128)return e<<3|1;const n=this.bytes[r+2]&255;return(n&192)!==128?e<<3|1:((e&15)<<12|(t&63)<<6|n&63)<<3|3}else if(e>=240&&e<=244&&r+3<this.end){const t=this.bytes[r+1]&255;if((t&192)!==128)return e<<3|1;const n=this.bytes[r+2]&255;if((n&192)!==128)return e<<3|1;const s=this.bytes[r+3]&255;return(s&192)!==128?e<<3|1:((e&7)<<18|(t&63)<<12|(n&63)<<6|s&63)<<3|4}else return e<<3|1}index(r,e){e+=this.start;const t=this.indexOf(this.bytes,r.prefixUTF8,e);return t<0?t:t-e}context(r){r+=this.start;let e=-1;if(r>this.start&&r<=this.end){let n=r-1;if(e=this.bytes[n--],e>=128){let s=r-4;for(s<this.start&&(s=this.start);n>=s&&(this.bytes[n]&192)===128;)n--;n<this.start&&(n=this.start),e=this.step(n-this.start)>>3}}const t=r<this.end?this.step(r-this.start)>>3:-1;return $.emptyOpContext(e,t)}indexOf(r,e,t=0){let n=e.length;if(n===0)return t<=this.end?t:-1;const s=e[0];let i=this.end-n;const o=typeof r.indexOf=="function";let B=t;for(;B<=i;){if(o){if(B=r.indexOf(s,B),B===-1||B>i)return-1}else{for(;B<=i&&r[B]!==s;)B++;if(B>i)return-1}let c=!0;for(let u=1;u<n;u++)if(r[B+u]!==e[u]){c=!1;break}if(c)return B;B++}return-1}prefixLength(r){return r.prefixUTF8.length}},ww=class extends ht{constructor(r,e=0,t=r.length){super(),this.charSequence=r,this.start=e,this.end=t}hasString(r,e){const t=this.charSequence.indexOf(r.str,this.start+e);return t!==-1&&t<=this.end-r.str.length}hasAnyString(r,e){return r.ac16?r.ac16.searchUTF16(this.charSequence,this.start+e,this.end):!1}step(r){if(r+=this.start,r>=this.end)return ht.EOF();const e=this.charSequence.charCodeAt(r);if(e<W.MIN_HIGH_SURROGATE||e>W.MAX_HIGH_SURROGATE||r+1>=this.end)return e<<3|1;const t=this.charSequence.charCodeAt(r+1);return t>=W.MIN_LOW_SURROGATE&&t<=W.MAX_LOW_SURROGATE?(e-W.MIN_HIGH_SURROGATE)*1024+(t-W.MIN_LOW_SURROGATE)+W.MIN_SUPPLEMENTARY_CODE_POINT<<3|2:e<<3|1}index(r,e){e+=this.start;const t=this.charSequence.indexOf(r.prefix,e);return t<0||t>this.end-r.prefix.length?-1:t-e}context(r){r+=this.start;const e=r>this.start&&r<=this.end?this.charSequence.charCodeAt(r-1):-1,t=r<this.end?this.charSequence.charCodeAt(r):-1;return $.emptyOpContext(e,t)}prefixLength(r){return r.prefix.length}},Ie=class{static fromUTF8(r,e=0,t=r.length){return new Iw(r,e,t)}static fromUTF16(r,e=0,t=r.length){return new ww(r,e,t)}},Li=class extends Error{constructor(r){super(r),this.name="RE2JSException"}},_e=class extends Li{constructor(r,e=null){let t=`error parsing regexp: ${r}`;e&&(t+=`: \`${e}\``),super(t),this.name="RE2JSSyntaxException",this.message=t,this.error=r,this.input=e}getDescription(){return this.error}getPattern(){return this.input}},yw=class extends Li{constructor(r){super(r),this.name="RE2JSCompileException"}},Ct=class extends Li{constructor(r){super(r),this.name="RE2JSGroupException"}},Tw=class extends Li{constructor(r){super(r),this.name="RE2JSFlagsException"}},Zs=class extends Li{constructor(r){super(r),this.name="RE2JSInternalException"}},mr,_h=(mr=class{static quoteReplacement(e,t=!1){return t?e.indexOf("\\")<0&&e.indexOf("$")<0?e:e.split("").map(n=>{const s=n.codePointAt(0);return s===b.CODES.get("\\")||s===b.CODES.get("$")?`\\${n}`:n}).join(""):e.indexOf("$")<0?e:e.split("").map(n=>n.codePointAt(0)===b.CODES.get("$")?"$$":n).join("")}constructor(e,t){if(e===null)throw new Error("pattern is null");this.patternInput=e;const n=this.patternInput.re2();this.patternGroupCount=n.numberOfCapturingGroups(),this.groups=[],this.namedGroups=n.namedGroups,this.numberOfInstructions=n.numberOfInstructions(),t instanceof wr?this.resetMatcherInput(t):$.isByteArray(t)?this.resetMatcherInput(pr.utf8(t)):this.resetMatcherInput(pr.utf16(t))}pattern(){return this.patternInput}reset(){return this.matcherInputLength=this.matcherInput.length(),this.appendPos=0,this.hasMatch=!1,this.hasGroups=!1,this.anchorFlag=0,this}resetMatcherInput(e){if(e===null)throw new Error("input is null");return e instanceof wr||($.isByteArray(e)?e=pr.utf8(e):e=pr.utf16(e)),this.matcherInput=e,this.reset(),this}start(e=0){if(typeof e=="string"){const t=this.namedGroups[e];if(!Number.isFinite(t))throw new Ct(`group '${e}' not found`);e=t}return this.loadGroup(e),this.groups[2*e]}end(e=0){if(typeof e=="string"){const t=this.namedGroups[e];if(!Number.isFinite(t))throw new Ct(`group '${e}' not found`);e=t}return this.loadGroup(e),this.groups[2*e+1]}programSize(){return this.numberOfInstructions}group(e=0){if(typeof e=="string"){const s=this.namedGroups[e];if(!Number.isFinite(s))throw new Ct(`group '${e}' not found`);e=s}const t=this.start(e),n=this.end(e);return t<0&&n<0?null:this.substring(t,n)}getNamedGroups(){if(!this.hasMatch)throw new Ct("perhaps no match attempted");const e=Object.create(null);for(const t of Object.keys(this.namedGroups))e[t]=this.group(t);return e}groupCount(){return this.patternGroupCount}loadGroup(e){if(e<0||e>this.patternGroupCount)throw new Ct(`Group index out of bounds: ${e}`);if(!this.hasMatch)throw new Ct("perhaps no match attempted");if(e===0||this.hasGroups)return;const t=this.matcherInputLength,n=this.patternInput.re2().matchMachineInput(this.matcherInput,this.groups[0],t,this.anchorFlag,1+this.patternGroupCount);if(!n[0])throw new Ct("inconsistency in matching group data");this.groups=n[1],this.hasGroups=!0}matches(){return this.genMatch(0,x.ANCHOR_BOTH)}lookingAt(){return this.genMatch(0,x.ANCHOR_START)}find(e=null){if(e!==null){if(e<0||e>this.matcherInputLength)throw new Ct(`start index out of bounds: ${e}`);return this.reset(),this.genMatch(e,0)}if(e=0,this.hasMatch&&(e=this.groups[1],this.groups[0]===this.groups[1])){const t=(this.matcherInput.isUTF16Encoding()?Ie.fromUTF16(this.matcherInput.asCharSequence(),0,this.matcherInputLength):Ie.fromUTF8(this.matcherInput.asBytes(),0,this.matcherInputLength)).step(e);t<0?e++:e+=t&7}return this.genMatch(e,x.UNANCHORED)}genMatch(e,t){const n=this.patternInput.re2().matchMachineInput(this.matcherInput,e,this.matcherInputLength,t,1);return n[0]?(this.groups=n[1],this.hasMatch=!0,this.hasGroups=this.patternGroupCount===0,this.anchorFlag=t,!0):(this.hasMatch=!1,!1)}substring(e,t){return this.matcherInput.isUTF8Encoding()?$.utf8ByteArrayToString(this.matcherInput.asBytes().slice(e,t)):this.matcherInput.asCharSequence().substring(e,t).toString()}inputLength(){return this.matcherInputLength}appendReplacement(e,t=!1){let n="";const s=this.start(),i=this.end();return this.appendPos<s&&(n+=this.substring(this.appendPos,s)),this.appendPos=i,n+=t?this.appendReplacementInternalJava(e):this.appendReplacementInternalJs(e),n}appendReplacementInternalJava(e){let t="",n=0;const s=e.length;let i=0;for(;i<s;){const o=e.codePointAt(i);if(o===b.CODES.get("\\")){if(n<i&&(t+=e.substring(n,i)),i++,i>=s)throw new Ct("character to be escaped is missing");n=i,i++;continue}if(o===b.CODES.get("$")){if(n<i&&(t+=e.substring(n,i)),i+1>=s)throw new Ct("Illegal group reference: group index is missing");const B=e.codePointAt(i+1);if(b.CODES.get("0")<=B&&B<=b.CODES.get("9")){let c=B-b.CODES.get("0"),u=i+2;for(;u<s;u++){const d=e.codePointAt(u);if(d<b.CODES.get("0")||d>b.CODES.get("9")||c*10+d-b.CODES.get("0")>this.patternGroupCount)break;c=c*10+d-b.CODES.get("0")}if(c>this.patternGroupCount)throw new Ct(`n > number of groups: ${c}`);const h=this.group(c);h!==null&&(t+=h),i=u,n=i}else if(B===b.CODES.get("{")){let c=i+2;for(;c<s&&e.codePointAt(c)!==b.CODES.get("}");)c++;if(c>=s)throw new Ct("named capture group is missing trailing '}'");const u=e.substring(i+2,c),h=this.group(u);h!==null&&(t+=h),i=c+1,n=i}else throw new Ct("Illegal group reference");continue}i++}return n<s&&(t+=e.substring(n,s)),t}appendReplacementInternalJs(e){let t="",n=0;const s=e.length;for(let i=0;i<s-1;i++)if(e.codePointAt(i)===b.CODES.get("$")){let o=e.codePointAt(i+1);if(b.CODES.get("$")===o){n<i&&(t+=e.substring(n,i)),t+="$",i++,n=i+1;continue}else if(b.CODES.get("&")===o){n<i&&(t+=e.substring(n,i));const B=this.group(0);B!==null?t+=B:t+="$&",i++,n=i+1;continue}else if(b.CODES.get("`")===o){n<i&&(t+=e.substring(n,i)),t+=this.substring(0,this.start(0)),i++,n=i+1;continue}else if(b.CODES.get("'")===o){n<i&&(t+=e.substring(n,i)),t+=this.substring(this.end(0),this.matcherInputLength),i++,n=i+1;continue}else if(b.CODES.get("1")<=o&&o<=b.CODES.get("9")){let B=o-b.CODES.get("0");for(n<i&&(t+=e.substring(n,i)),i+=2;i<s&&(o=e.codePointAt(i),!(o<b.CODES.get("0")||o>b.CODES.get("9")||B*10+o-b.CODES.get("0")>this.patternGroupCount));i++)B=B*10+o-b.CODES.get("0");if(B>this.patternGroupCount){t+=`$${B}`,n=i,i--;continue}const c=this.group(B);c!==null&&(t+=c),n=i,i--;continue}else if(o===b.CODES.get("<")){n<i&&(t+=e.substring(n,i)),i++;let B=i+1;for(;B<e.length&&e.codePointAt(B)!==b.CODES.get(">")&&e.codePointAt(B)!==b.CODES.get(" ");)B++;if(B===e.length||e.codePointAt(B)!==b.CODES.get(">")){t+=e.substring(i-1,B+1),n=B+1,i=B;continue}const c=e.substring(i+1,B);if(Object.prototype.hasOwnProperty.call(this.namedGroups,c)){const u=this.group(c);u!==null&&(t+=u)}else t+=`$<${c}>`;n=B+1,i=B;continue}}return n<s&&(t+=e.substring(n,s)),t}appendTail(){return this.substring(this.appendPos,this.matcherInputLength)}replaceAll(e,t=!1){return this.replace(e,!0,t)}replaceFirst(e,t=!1){return this.replace(e,!1,t)}replace(e,t=!0,n=!1){let s="";this.reset();const i=typeof e=="function",o=Object.keys(this.namedGroups).length>0;let B=null;if(i){if(this.groupCount()>=mr.MAX_REPLACER_ARGS)throw new Ct("Too many capture groups to safely invoke replacer function");B=this.matcherInput.isUTF8Encoding()?this.matcherInput.asBytes():this.matcherInput.asCharSequence()}for(;this.find()&&(s+=i?this.appendReplacementFunc(e,o,B):this.appendReplacement(e,n),!!t););return s+=this.appendTail(),s}appendReplacementFunc(e,t,n){let s="";const i=this.start(),o=this.end();this.appendPos<i&&(s+=this.substring(this.appendPos,i)),this.appendPos=o;const B=this.buildReplacerArgs(i,t,n);return s+=String(e(...B)),s}buildReplacerArgs(e,t,n){const s=[this.group(0)],i=this.groupCount();for(let o=1;o<=i;o++){const B=this.start(o);B<0?s.push(void 0):s.push(this.substring(B,this.end(o)))}if(s.push(e),s.push(n),t){const o=this.getNamedGroups();for(const B in o)o[B]===null&&(o[B]=void 0);s.push(o)}return s}},G(mr,"MAX_REPLACER_ARGS",65535),mr),ue,N=(ue=class{static isRuneOp(e){return ue.RUNE<=e&&e<=ue.RUNE_ANY_NOT_NL}static escapeRunes(e){let t='"';for(let n of e)t+=$.escapeRune(n);return t+='"',t}constructor(e){this.op=e,this.out=0,this.arg=0,this.runes=[],this.next=null}matchRune(e){if(this.runes.length===1){const o=this.runes[0];return(this.arg&x.FOLD_CASE)!==0?W.equalsIgnoreCase(o,e):e===o}const t=this.runes.length;if(t===0)return!1;if(t===2||t===4||t===6||t===8){for(let o=0;o<t;o+=2){if(e<this.runes[o])return!1;if(e<=this.runes[o+1])return!0}return!1}let n=0,s=t>>1;for(;s>1;){const o=s>>1;n+=this.runes[n+o<<1]<=e?o:0,s-=o}n+=this.runes[n<<1]<=e?1:0;const i=n-1;return i>=0&&e<=this.runes[i<<1|1]}matchRunePos(e){if(this.runes.length===1){const o=this.runes[0];return(this.arg&x.FOLD_CASE)!==0?W.equalsIgnoreCase(o,e)?0:-1:e===o?0:-1}const t=this.runes.length;if(t===0)return-1;if(t===2||t===4||t===6||t===8){for(let o=0;o<t;o+=2){if(e<this.runes[o])return-1;if(e<=this.runes[o+1])return Math.floor(o/2)}return-1}let n=0,s=t>>1;for(;s>1;){const o=s>>1;n+=this.runes[n+o<<1]<=e?o:0,s-=o}n+=this.runes[n<<1]<=e?1:0;const i=n-1;return i>=0&&e<=this.runes[i<<1|1]?i:-1}toString(){switch(this.op){case ue.ALT:return`alt -> ${this.out}, ${this.arg}`;case ue.ALT_MATCH:return`altmatch -> ${this.out}, ${this.arg}`;case ue.CAPTURE:return`cap ${this.arg} -> ${this.out}`;case ue.EMPTY_WIDTH:return`empty ${this.arg} -> ${this.out}`;case ue.MATCH:return`match${this.arg!==0?` ${this.arg}`:""}`;case ue.FAIL:return"fail";case ue.NOP:return`nop -> ${this.out}`;case ue.LB_WRITE:return`lbwrite ${this.arg} -> ${this.out}`;case ue.LB_CHECK:return`lbcheck ${this.arg} -> ${this.out}`;case ue.RUNE:return this.runes===null?"rune <null>":["rune ",ue.escapeRunes(this.runes),(this.arg&x.FOLD_CASE)!==0?"/i":""," -> ",this.out].join("");case ue.RUNE1:return`rune1 ${ue.escapeRunes(this.runes)} -> ${this.out}`;case ue.RUNE_ANY:return`any -> ${this.out}`;case ue.RUNE_ANY_NOT_NL:return`anynotnl -> ${this.out}`;default:throw new Error("unhandled case in Inst.toString")}}},G(ue,"ALT",1),G(ue,"ALT_MATCH",2),G(ue,"CAPTURE",3),G(ue,"EMPTY_WIDTH",4),G(ue,"FAIL",5),G(ue,"MATCH",6),G(ue,"NOP",7),G(ue,"RUNE",8),G(ue,"RUNE1",9),G(ue,"RUNE_ANY",10),G(ue,"RUNE_ANY_NOT_NL",11),G(ue,"LB_WRITE",12),G(ue,"LB_CHECK",13),ue),Dh=class{constructor(r){this.sparse=new Int32Array(r),this.densePcs=new Int32Array(r),this.denseCaps=null,this.size=0,this.ncap=0}init(r){this.ncap=r;const e=this.densePcs.length*r;(!this.denseCaps||this.denseCaps.length<e)&&(this.denseCaps=new Int32Array(e))}contains(r){const e=this.sparse[r];return e<this.size&&this.densePcs[e]===r}isEmpty(){return this.size===0}add(r){const e=this.size++;return this.sparse[r]=e,this.densePcs[e]=r,e}clear(){this.size=0}toString(){let r="{";for(let e=0;e<this.size;e++)e!==0&&(r+=", "),r+=this.densePcs[e];return r+="}",r}},Aw=class $B{static fromRE2(e){const t=new $B;return t.prog=e.prog,t.re2=e,t.q0=new Dh(t.prog.numInst()),t.q1=new Dh(t.prog.numInst()),t.matched=!1,t.matchcap=new Int32Array(t.prog.numCap<2?2:t.prog.numCap),t.ncap=0,t}static fromMachine(e){return $B.fromRE2(e.re2)}constructor(){this.prog=null,this.re2=null,this.q0=null,this.q1=null,this.matched=!1,this.matchcap=null,this.ncap=0,this.lbTable=null}init(e){this.ncap=e,e>this.matchcap.length?this.matchcap=new Int32Array(e).fill(-1):this.matchcap.fill(-1),this.q0.init(e),this.q1.init(e),this.prog.numLb>0&&((!this.lbTable||this.lbTable.length<this.prog.numLb+1)&&(this.lbTable=new Int32Array(this.prog.numLb+1)),this.lbTable.fill(-1))}submatches(){return this.ncap===0?$.emptyInts():$.toArray(this.matchcap.subarray(0,this.ncap))}match(e,t,n){const s=this.re2.cond;if(s===$.EMPTY_ALL||(n===x.ANCHOR_START||n===x.ANCHOR_BOTH)&&t!==0)return!1;this.matched=!1,this.matchcap.fill(-1);let i=this.prog.numLb>0?0:t,o=t,B=this.q0,c=this.q1,u=e.step(i),h=u>>3,d=u&7,p=-1,I=0;u!==ht.EOF()&&(u=e.step(i+d),p=u>>3,I=u&7);let R;for(i===0?R=$.emptyOpContext(-1,h):R=e.context(i);;){if(B.isEmpty()){if((s&$.EMPTY_BEGIN_TEXT)!==0&&i!==0||(n===x.ANCHOR_START||n===x.ANCHOR_BOTH)&&i!==0||this.matched)break;if(this.prog.numLb===0&&this.re2.prefix.length!==0&&p!==this.re2.prefixRune&&e.canCheckPrefix()){const z=e.index(this.re2,i);if(z<0)break;i+=z,u=e.step(i),h=u>>3,d=u&7,u=e.step(i+d),p=u>>3,I=u&7,R=e.context(i)}}if(i===0&&this.prog.numLb>0)for(let z=0;z<this.prog.lbStarts.length;z++)this.add(B,this.prog.lbStarts[z],i,this.matchcap,0,R);!this.matched&&(i===0||n===x.UNANCHORED)&&i>=o&&(this.ncap>0&&(this.matchcap[0]=i),this.add(B,this.prog.start,i,this.matchcap,0,R));const k=i+d;if(R=e.context(k),this.step(B,c,i,k,h,R,n,i===e.endPos()),d===0||this.ncap===0&&this.matched)break;i+=d,h=p,d=I,h!==-1&&(u=e.step(i+d),p=u>>3,I=u&7);const M=B;B=c,c=M}return c.clear(),this.matched}matchSet(e,t,n){const s=this.re2.cond;if(s===$.EMPTY_ALL)return[];if((n===x.ANCHOR_START||n===x.ANCHOR_BOTH)&&t!==0)return[];let i=this.prog.numLb>0?0:t,o=t,B=this.q0,c=this.q1,u=e.step(i),h=u>>3,d=u&7,p=-1,I=0;u!==ht.EOF()&&(u=e.step(i+d),p=u>>3,I=u&7);let R=i===0?$.emptyOpContext(-1,h):e.context(i);const k=new Set;for(;!(B.isEmpty()&&((s&$.EMPTY_BEGIN_TEXT)!==0&&i!==0||(n===x.ANCHOR_START||n===x.ANCHOR_BOTH)&&i!==0));){if(i===0&&this.prog.numLb>0)for(let re=0;re<this.prog.lbStarts.length;re++)this.add(B,this.prog.lbStarts[re],i,this.matchcap,0,R);(i===0||n===x.UNANCHORED)&&i>=o&&this.add(B,this.prog.start,i,this.matchcap,0,R);const M=i+d;R=e.context(M);for(let re=0;re<B.size;re++){const pe=B.densePcs[re],Se=this.prog.inst[pe],Oe=re*this.ncap;let Ae=!1;switch(Se.op){case N.MATCH:if(n===x.ANCHOR_BOTH&&i!==e.endPos())break;k.add(Se.arg);break;case N.RUNE:Ae=Se.matchRune(h);break;case N.RUNE1:Ae=h===Se.runes[0];break;case N.RUNE_ANY:Ae=!0;break;case N.RUNE_ANY_NOT_NL:Ae=h!==10;break;default:continue}Ae&&this.add(c,Se.out,M,B.denseCaps,Oe,R)}if(B.clear(),d===0)break;i+=d,h=p,d=I,h!==-1&&(u=e.step(i+d),p=u>>3,I=u&7);const z=B;B=c,c=z}return c.clear(),Array.from(k).sort((M,z)=>M-z)}step(e,t,n,s,i,o,B,c){const u=this.re2.longest;for(let h=0;h<e.size;h++){const d=e.densePcs[h],p=h*this.ncap;if(u&&this.matched&&this.ncap>0&&this.matchcap[0]<e.denseCaps[p])continue;const I=this.prog.inst[d];let R=!1;switch(I.op){case N.MATCH:if(B===x.ANCHOR_BOTH&&!c)break;if(this.ncap>0&&(!u||!this.matched||this.matchcap[1]<n)){e.denseCaps[p+1]=n;for(let k=0;k<this.ncap;k++)this.matchcap[k]=e.denseCaps[p+k]}u||(e.size=0),this.matched=!0;break;case N.RUNE:R=I.matchRune(i);break;case N.RUNE1:R=i===I.runes[0];break;case N.RUNE_ANY:R=!0;break;case N.RUNE_ANY_NOT_NL:R=i!==10;break;default:continue}R&&this.add(t,I.out,s,e.denseCaps,p,o)}e.clear()}add(e,t,n,s,i,o){for(;;){if(t===0||e.contains(t))return;const B=e.add(t),c=this.prog.inst[t];switch(c.op){case N.FAIL:return;case N.ALT:case N.ALT_MATCH:this.add(e,c.out,n,s,i,o),t=c.arg;continue;case N.EMPTY_WIDTH:if((c.arg&~o)===0){t=c.out;continue}return;case N.NOP:t=c.out;continue;case N.CAPTURE:if(c.arg<this.ncap){const u=s[i+c.arg];s[i+c.arg]=n,this.add(e,c.out,n,s,i,o),s[i+c.arg]=u;return}else{t=c.out;continue}case N.LB_WRITE:this.lbTable[Math.abs(c.arg)]=n,t=c.out;continue;case N.LB_CHECK:if(c.arg>0){if(this.lbTable[c.arg]===n){t=c.out;continue}}else if(this.lbTable[-c.arg]!==n){t=c.out;continue}return;case N.MATCH:case N.RUNE:case N.RUNE1:case N.RUNE_ANY:case N.RUNE_ANY_NOT_NL:if(this.ncap>0){const u=B*this.ncap;for(let h=0;h<this.ncap;h++)e.denseCaps[u+h]=s[i+h]}return;default:throw new Zs("unhandled")}}}};const Ih=r=>{let e=-2128831035;for(let t=0;t<r.length;t++)e^=r[t],e=Math.imul(e,16777619);return e},Rw=(r,e)=>{if(r.length!==e.length)return!1;for(let t=0;t<r.length;t++)if(r[t]!==e[t])return!1;return!0};var vw=class{constructor(r,e,t=[]){this.nfaStates=r,this.isMatch=e,this.matchIDs=t,this.nextLatin1=new Array(W.MAX_LATIN1+1).fill(null),this.nextLatin1Anchored=new Array(W.MAX_LATIN1+1).fill(null),this.transKeys=[],this.transVals=[],this.lastSeen=0}},an,Pw=(an=class{constructor(e,t=8388608){this.prog=e,this.stateCache=new Map,this.stateCount=0,this.startState=null,this.stateLimit=Math.max(1,Math.floor(t/an.STATE_MEMORY_ESTIMATE)),this.cacheClears=0,this.failed=!1,this.clock=0}computeClosure(e){const t=new Set,n=[...e];let s=!1;const i=[];for(;n.length>0;){const B=n.pop();if(t.has(B))continue;t.add(B);const c=this.prog.getInst(B);switch(c.op){case N.MATCH:s=!0,i.includes(c.arg)||i.push(c.arg);break;case N.ALT:case N.ALT_MATCH:n.push(c.out),n.push(c.arg);break;case N.NOP:case N.CAPTURE:n.push(c.out);break;case N.EMPTY_WIDTH:case N.LB_WRITE:case N.LB_CHECK:return null}}const o=Int32Array.from(t).sort();return i.sort((B,c)=>B-c),{pcs:o,isMatch:s,matchIDs:i}}getState(e){const t=this.computeClosure(e);if(!t)return null;const n=t.pcs,s=Ih(n);let i=this.stateCache.get(s);if(i)for(let B=0;B<i.length;B++){const c=i[B];if(Rw(c.nfaStates,n))return c.lastSeen=++this.clock,c}else i=[],this.stateCache.set(s,i);if(this.failed)return null;if(this.stateCount>=this.stateLimit){if(this.cacheClears++,this.cacheClears>=an.MAX_CACHE_CLEARS)return this.failed=!0,this.stateCache.clear(),this.stateCount=0,this.startState=null,null;this.evictCache(),i=this.stateCache.get(s),i||(i=[],this.stateCache.set(s,i))}const o=new vw(n,t.isMatch,t.matchIDs);return o.lastSeen=++this.clock,i.push(o),this.stateCount++,o}evictCache(){const e=[];for(const o of this.stateCache.values())for(let B=0;B<o.length;B++)e.push(o[B]);e.sort((o,B)=>o.lastSeen-B.lastSeen);const t=Math.max(1,Math.floor(this.stateLimit/2)),n=e.length-t,s=e.slice(n),i=new Set(s);this.stateCache.clear(),this.stateCount=0;for(let o=0;o<s.length;o++){const B=s[o];B.nextLatin1.fill(null),B.nextLatin1Anchored.fill(null),B.transKeys.length=0,B.transVals.length=0;const c=Ih(B.nfaStates);let u=this.stateCache.get(c);u||(u=[],this.stateCache.set(c,u)),u.push(B),this.stateCount++}this.startState&&!i.has(this.startState)&&(this.startState=null)}step(e,t,n){if(t<=W.MAX_LATIN1)if(n===x.UNANCHORED){const o=e.nextLatin1[t];if(o!==null)return o}else{const o=e.nextLatin1Anchored[t];if(o!==null)return o}else{const o=t+(n===x.UNANCHORED?0:W.MAX_RUNE+1),B=e.transKeys,c=B.length;for(let u=0;u<c;u++)if(B[u]===o)return e.transVals[u]}const s=[];for(let o=0;o<e.nfaStates.length;o++){const B=e.nfaStates[o],c=this.prog.getInst(B);N.isRuneOp(c.op)&&c.matchRune(t)&&s.push(c.out)}n===x.UNANCHORED&&s.push(this.prog.start);const i=this.getState(s);if(t<=W.MAX_LATIN1)n===x.UNANCHORED?e.nextLatin1[t]=i:e.nextLatin1Anchored[t]=i;else{const o=t+(n===x.UNANCHORED?0:W.MAX_RUNE+1);e.transKeys.push(o),e.transVals.push(i)}return i}match(e,t,n){if((n===x.ANCHOR_START||n===x.ANCHOR_BOTH)&&t!==0)return!1;if(!this.startState&&(this.startState=this.getState([this.prog.start]),!this.startState))return null;let s=e.endPos(),i=this.startState;if(i.isMatch)if(n===x.ANCHOR_BOTH){if(t===s)return!0}else return!0;let o=t;for(;o<s;){const B=e.step(o),c=B>>3,u=B&7;if(u===0)break;if(i=n===x.UNANCHORED&&c<=W.MAX_LATIN1&&i.nextLatin1[c]||this.step(i,c,n),i===null)return null;if(i.lastSeen=++this.clock,i.isMatch)if(n===x.ANCHOR_BOTH){if(o+u===s)return!0}else return!0;if(i.nfaStates.length===0&&n!==x.UNANCHORED)return!1;o+=u}return!1}matchSet(e,t,n){if((n===x.ANCHOR_START||n===x.ANCHOR_BOTH)&&t!==0)return[];if(!this.startState&&(this.startState=this.getState([this.prog.start]),!this.startState))return null;let s=e.endPos(),i=this.startState;const o=new Set,B=(u,h)=>{u.isMatch&&(n===x.ANCHOR_BOTH?h===s&&u.matchIDs.forEach(d=>o.add(d)):u.matchIDs.forEach(d=>o.add(d)))};B(i,t);let c=t;for(;c<s;){const u=e.step(c),h=u>>3,d=u&7;if(d===0)break;if(i=n===x.UNANCHORED&&h<=W.MAX_LATIN1&&i.nextLatin1[h]||this.step(i,h,n),i===null)return null;if(i.lastSeen=++this.clock,c+=d,B(i,c),i.nfaStates.length===0&&n!==x.UNANCHORED)break}return Array.from(o).sort((u,h)=>u-h)}},G(an,"MAX_CACHE_CLEARS",5),G(an,"STATE_MEMORY_ESTIMATE",838),an);const Sw=32,Ow=500,vB=256,bw=256*1024;var Nw=class{constructor(){this.end=0,this.cap=new Int32Array(0),this.matchcap=new Int32Array(0),this.ncap=0,this.jobPc=new Int32Array(vB),this.jobArg=new Uint8Array(vB),this.jobPos=new Int32Array(vB),this.jobLen=0,this.visited=new Uint32Array(0)}reset(r,e,t){this.end=e,this.jobLen=0,this.ncap=t;const n=r.numInst()*(e+1)+Sw-1>>>5;this.visited.length<n?this.visited=new Uint32Array(n):this.visited.fill(0,0,n),this.cap.length<t?this.cap=new Int32Array(t).fill(-1):this.cap.fill(-1,0,t),this.matchcap.length<t?this.matchcap=new Int32Array(t).fill(-1):this.matchcap.fill(-1,0,t)}shouldVisit(r,e){const t=r*(this.end+1)+e,n=t>>>5,s=1<<(t&31);return(this.visited[n]&s)!==0?!1:(this.visited[n]|=s,!0)}push(r,e,t,n){if(r.prog.getInst(e).op!==N.FAIL&&(n||this.shouldVisit(e,t))){if(this.jobLen>=this.jobPc.length){const s=this.jobPc.length*2,i=new Int32Array(s);i.set(this.jobPc),this.jobPc=i;const o=new Uint8Array(s);o.set(this.jobArg),this.jobArg=o;const B=new Int32Array(s);B.set(this.jobPos),this.jobPos=B}this.jobPc[this.jobLen]=e,this.jobArg[this.jobLen]=n?1:0,this.jobPos[this.jobLen]=t,this.jobLen++}}tryBacktrack(r,e,t,n,s){const i=r.longest;for(this.push(r,t,n,!1);this.jobLen>0;){this.jobLen--;let o=this.jobPc[this.jobLen],B=this.jobArg[this.jobLen]===1,c=this.jobPos[this.jobLen],u=!0;for(;!(!u&&!this.shouldVisit(o,c));){u=!1;const h=r.prog.getInst(o);switch(h.op){case N.FAIL:throw new Zs("unexpected InstFail");case N.ALT:if(B){B=!1,o=h.arg;continue}else{this.push(r,o,c,!0),o=h.out;continue}case N.ALT_MATCH:{const d=r.prog.getInst(h.out);if(N.isRuneOp(d.op)){this.push(r,h.arg,c,!1),o=h.arg,c=this.end;continue}this.push(r,h.out,this.end,!1),o=h.out;continue}case N.RUNE:{const d=e.step(c);if(d===ht.EOF()||!h.matchRune(d>>3))break;c+=d&7,o=h.out;continue}case N.RUNE1:{const d=e.step(c);if(d===ht.EOF()||d>>3!==h.runes[0])break;c+=d&7,o=h.out;continue}case N.RUNE_ANY_NOT_NL:{const d=e.step(c);if(d===ht.EOF()||d>>3===10)break;c+=d&7,o=h.out;continue}case N.RUNE_ANY:{const d=e.step(c);if(d===ht.EOF())break;c+=d&7,o=h.out;continue}case N.CAPTURE:if(B){this.cap[h.arg]=c;break}else{h.arg<this.ncap&&(this.push(r,o,this.cap[h.arg],!0),this.cap[h.arg]=c),o=h.out;continue}case N.EMPTY_WIDTH:{const d=e.context(c);if((h.arg&~d)!==0)break;o=h.out;continue}case N.NOP:o=h.out;continue;case N.MATCH:{if(s===x.ANCHOR_BOTH&&c!==this.end)break;if(this.ncap===0)return!0;this.ncap>1&&(this.cap[1]=c);const d=this.matchcap[1];if((d===-1||i&&c>0&&c>d)&&this.matchcap.set(this.cap),!i||c===this.end)return!0;break}case N.LB_WRITE:case N.LB_CHECK:throw new Zs("Backtracker cannot evaluate Lookbehind instructions");default:throw new Zs("bad inst")}break}}return i&&this.matchcap.length>1&&this.matchcap[1]>=0}};const go=[];var mo=class mC{static shouldBacktrack(e){return e.numInst()<=Ow}static maxBitStateLen(e){return mC.shouldBacktrack(e)?Math.floor(bw/e.numInst()):0}static execute(e,t,n,s,i){const o=e.cond;if(o===$.EMPTY_ALL||(s===x.ANCHOR_START||s===x.ANCHOR_BOTH)&&n!==0||(o&$.EMPTY_BEGIN_TEXT)!==0&&n!==0)return null;const B=go.length>0?go.pop():new Nw,c=t.endPos();B.reset(e.prog,c,i);let u=!1;if((o&$.EMPTY_BEGIN_TEXT)!==0||s===x.ANCHOR_START||s===x.ANCHOR_BOTH)B.ncap>0&&(B.cap[0]=n),B.tryBacktrack(e,t,e.prog.start,n,s)&&(u=!0);else{let d=-1;for(;n<=c&&d!==0;n+=d){if(e.prefix.length>0){const I=t.index(e,n);if(I<0)break;n+=I}if(B.ncap>0&&(B.cap[0]=n),B.tryBacktrack(e,t,e.prog.start,n,s)){u=!0;break}const p=t.step(n);d=p===ht.EOF()?0:p&7}}if(!u)return go.push(B),null;const h=i===0?[]:$.toArray(B.matchcap.subarray(0,i));return go.push(B),h}},wh=class{constructor(r){this.sparse=new Uint32Array(r),this.dense=new Uint32Array(r),this.size=0,this.nextIndex=0}empty(){return this.nextIndex>=this.size}next(){return this.dense[this.nextIndex++]}clear(){this.size=0,this.nextIndex=0}contains(r){return r<this.sparse.length&&this.sparse[r]<this.size&&this.dense[this.sparse[r]]===r}insert(r){this.contains(r)||this.insertNew(r)}insertNew(r){r>=this.sparse.length||(this.sparse[r]=this.size,this.dense[this.size]=r,this.size++)}};const Lw=(r,e,t,n)=>{const s=r.length,i=e.length;let o=0,B=0;const c=[],u=[];let h=!0,d=-1;const p=I=>{const R=I?r:e,k=I?o:B,M=I?t:n;return d>0&&R[k]<=c[d]?!1:(c.push(R[k],R[k+1]),I?o+=2:B+=2,d+=2,u.push(M),!0)};for(;o<s||B<i;)if(B>=i?h=p(!0):o>=s||e[B]<r[o]?h=p(!1):h=p(!0),!h)return null;return{merged:c,next:u}};var Fw=class{constructor(r){this.start=r.start,this.numCap=r.numCap,this.inst=new Array(r.inst.length);for(let e=0;e<r.inst.length;e++){const t=r.inst[e],n=new N(t.op);n.out=t.out,n.arg=t.arg,n.runes=t.runes?t.runes.slice():[],n.next=null,this.inst[e]=n}}};const kw=r=>{const e=new Fw(r);for(let t=0;t<e.inst.length;t++){const n=e.inst[t];if(n.op!==N.ALT&&n.op!==N.ALT_MATCH)continue;let s="out",i="arg",o=e.inst[n[i]];if(o.op!==N.ALT&&o.op!==N.ALT_MATCH&&(s="arg",i="out",o=e.inst[n[i]],o.op!==N.ALT&&o.op!==N.ALT_MATCH))continue;const B=e.inst[n[s]];if(B.op===N.ALT||B.op===N.ALT_MATCH)continue;let c="out",u="arg",h=!1;o.out===t?h=!0:o.arg===t&&(h=!0,c="arg",u="out"),h&&(o[c]=n[s]),n[s]===o[c]&&(n[i]=o[u])}return e},Vw=r=>{if(r.inst.length>=1e3)return null;const e=new wh(r.inst.length),t=new wh(r.inst.length),n=new Array(r.inst.length),s=new Array(r.inst.length).fill(!1),i=o=>{let B=!0;const c=r.inst[o];if(t.contains(o))return!0;switch(t.insert(o),c.op){case N.ALT:case N.ALT_MATCH:{B=i(c.out)&&i(c.arg);let u=s[c.out],h=s[c.arg];if(u&&h)return!1;if(h){const R=c.out;c.out=c.arg,c.arg=R;const k=u;u=h,h=k}u&&(s[o]=!0,c.op=N.ALT_MATCH);const d=n[c.out]||[],p=n[c.arg]||[],I=Lw(d,p,c.out,c.arg);if(!I)return!1;n[o]=I.merged,c.next=new Uint32Array(I.next);break}case N.CAPTURE:case N.EMPTY_WIDTH:case N.NOP:B=i(c.out),s[o]=s[c.out],n[o]=n[c.out]?n[c.out].slice():[],c.next=new Uint32Array(Math.floor(n[o].length/2)+1).fill(c.out);break;case N.MATCH:case N.FAIL:s[o]=c.op===N.MATCH;break;case N.RUNE:{if(s[o]=!1,c.next&&c.next.length>0)break;if(e.insert(c.out),!c.runes||c.runes.length===0){n[o]=[],c.next=new Uint32Array([c.out]);break}let u=[];if(c.runes.length===1&&(c.arg&x.FOLD_CASE)!==0){const h=c.runes[0];u.push(h,h);for(let d=W.simpleFold(h);d!==h;d=W.simpleFold(d))u.push(d,d);u.sort((d,p)=>d-p)}else for(let h=0;h<c.runes.length;h++)u.push(c.runes[h]);n[o]=u,c.next=new Uint32Array(Math.floor(u.length/2)+1).fill(c.out),c.op=N.RUNE;break}case N.RUNE1:{if(s[o]=!1,c.next&&c.next.length>0)break;e.insert(c.out);let u=[];if((c.arg&x.FOLD_CASE)!==0){const h=c.runes[0];u.push(h,h);for(let d=W.simpleFold(h);d!==h;d=W.simpleFold(d))u.push(d,d);u.sort((d,p)=>d-p)}else u.push(c.runes[0],c.runes[0]);n[o]=u,c.next=new Uint32Array(Math.floor(u.length/2)+1).fill(c.out),c.op=N.RUNE;break}case N.RUNE_ANY:if(s[o]=!1,c.next&&c.next.length>0)break;e.insert(c.out),n[o]=[0,W.MAX_RUNE],c.next=new Uint32Array([c.out]);break;case N.RUNE_ANY_NOT_NL:if(s[o]=!1,c.next&&c.next.length>0)break;e.insert(c.out),n[o]=[0,9,11,W.MAX_RUNE],c.next=new Uint32Array(Math.floor(n[o].length/2)+1).fill(c.out);break}return B};for(e.clear(),e.insert(r.start);!e.empty();)if(t.clear(),!i(e.next()))return null;for(let o=0;o<r.inst.length;o++)n[o]&&(r.inst[o].runes=n[o]);return r},xw=(r,e)=>{for(let t=0;t<e.inst.length;t++){const n=e.inst[t];switch(n.op){case N.ALT:case N.ALT_MATCH:case N.RUNE:break;case N.CAPTURE:case N.EMPTY_WIDTH:case N.NOP:case N.MATCH:case N.FAIL:r.inst[t].next=null;break;case N.RUNE1:case N.RUNE_ANY:case N.RUNE_ANY_NOT_NL:r.inst[t].next=null,r.inst[t].op=n.op,r.inst[t].runes=n.runes?n.runes.slice():[];break}}};var yh=class EC{static compile(e){if(e.start===0||e.numLb>0)return null;const t=e.inst[e.start];if(t.op!==N.EMPTY_WIDTH||(t.arg&$.EMPTY_BEGIN_TEXT)===0)return null;let n=!1;for(let i=0;i<e.inst.length;i++)if(e.inst[i].op===N.ALT||e.inst[i].op===N.ALT_MATCH){n=!0;break}for(let i=0;i<e.inst.length;i++){const o=e.inst[i],B=e.inst[o.out].op;switch(o.op){case N.ALT:case N.ALT_MATCH:if(B===N.MATCH||e.inst[o.arg].op===N.MATCH)return null;break;case N.EMPTY_WIDTH:if(B===N.MATCH){if((o.arg&$.EMPTY_END_TEXT)===$.EMPTY_END_TEXT)continue;return null}break;default:if(B===N.MATCH&&n)return null;break}}let s=kw(e);return s=Vw(s),s!==null&&xw(s,e),s}static next(e,t){const n=e.matchRunePos(t);return n>=0?e.next[n]:e.op===N.ALT_MATCH?e.out:0}static execute(e,t,n,s,i){const o=e.onepass;if(!o)return null;const B=new Int32Array(i).fill(-1);let c=!1,u=t.step(n),h=u>>3,d=u&7,p=ht.EOF(),I=-1,R=0;u!==ht.EOF()&&(p=t.step(n+d),p!==ht.EOF()&&(I=p>>3,R=p&7));let k=n===0?$.emptyOpContext(-1,h):t.context(n),M=o.start,z;for(;;){switch(z=o.inst[M],M=z.out,z.op){case N.MATCH:return s===x.ANCHOR_BOTH&&n!==t.endPos()?null:(c=!0,B.length>0&&(B[0]=0,B[1]=n),i===0?[]:$.toArray(B));case N.RUNE:if(!z.matchRune(h))return null;break;case N.RUNE1:if(h!==z.runes[0])return null;break;case N.RUNE_ANY:break;case N.RUNE_ANY_NOT_NL:if(h===10)return null;break;case N.ALT:case N.ALT_MATCH:M=EC.next(z,h);continue;case N.FAIL:return null;case N.NOP:continue;case N.EMPTY_WIDTH:if((z.arg&~k)!==0)return null;continue;case N.CAPTURE:z.arg<B.length&&(B[z.arg]=n);continue;default:throw new Zs("bad inst")}if(d===0)break;k=$.emptyOpContext(h,I),n+=d,h=I,d=R,h!==-1&&(p=t.step(n+d),p!==ht.EOF()?(I=p>>3,R=p&7):(I=-1,R=0))}return c?i===0?[]:$.toArray(B):null}},Z,T=(Z=class{static isPseudoOp(e){return e>=Z.Op.LEFT_PAREN}static emptySubs(){return[]}static quoteIfHyphen(e){return e===b.CODES.get("-")?"\\":""}static fromRegexp(e){const t=new Z(e.op);return t.flags=e.flags,t.subs=e.subs,t.runes=e.runes,t.cap=e.cap,t.min=e.min,t.max=e.max,t.name=e.name,t.namedGroups=e.namedGroups,t.lb=e.lb,t}constructor(e){this.op=e,this.flags=0,this.subs=Z.emptySubs(),this.runes=[],this.min=0,this.max=0,this.cap=0,this.name=null,this.namedGroups=Object.create(null),this.lb=0}reinit(){this.flags=0,this.subs=Z.emptySubs(),this.runes=[],this.cap=0,this.min=0,this.max=0,this.name=null,this.namedGroups=Object.create(null),this.lb=0}toString(){return this.appendTo()}appendTo(){let e="";switch(this.op){case Z.Op.NO_MATCH:e+="[^\\x00-\\x{10FFFF}]";break;case Z.Op.EMPTY_MATCH:e+="(?:)";break;case Z.Op.STAR:case Z.Op.PLUS:case Z.Op.QUEST:case Z.Op.REPEAT:{const t=this.subs[0];switch(t.op>Z.Op.CAPTURE||t.op===Z.Op.LITERAL&&t.runes.length>1?e+=`(?:${t.appendTo()})`:e+=t.appendTo(),this.op){case Z.Op.STAR:e+="*";break;case Z.Op.PLUS:e+="+";break;case Z.Op.QUEST:e+="?";break;case Z.Op.REPEAT:e+=`{${this.min}`,this.min!==this.max&&(e+=",",this.max>=0&&(e+=this.max)),e+="}";break}(this.flags&x.NON_GREEDY)!==0&&(e+="?");break}case Z.Op.CONCAT:for(let t of this.subs)t.op===Z.Op.ALTERNATE?e+=`(?:${t.appendTo()})`:e+=t.appendTo();break;case Z.Op.ALTERNATE:{let t="";for(let n of this.subs)e+=t,t="|",e+=n.appendTo();break}case Z.Op.LITERAL:(this.flags&x.FOLD_CASE)!==0&&(e+="(?i:");for(let t of this.runes)e+=$.escapeRune(t);(this.flags&x.FOLD_CASE)!==0&&(e+=")");break;case Z.Op.ANY_CHAR_NOT_NL:e+="(?-s:.)";break;case Z.Op.ANY_CHAR:e+="(?s:.)";break;case Z.Op.PLB:e+=`(?<=${this.subs[0].appendTo()})`;break;case Z.Op.NLB:e+=`(?<!${this.subs[0].appendTo()})`;break;case Z.Op.CAPTURE:this.name===null||this.name.length===0?e+="(":e+=`(?P<${this.name}>`,this.subs[0].op!==Z.Op.EMPTY_MATCH&&(e+=this.subs[0].appendTo()),e+=")";break;case Z.Op.BEGIN_TEXT:e+="\\A";break;case Z.Op.END_TEXT:(this.flags&x.WAS_DOLLAR)!==0?e+="(?-m:$)":e+="\\z";break;case Z.Op.BEGIN_LINE:e+="^";break;case Z.Op.END_LINE:e+="$";break;case Z.Op.WORD_BOUNDARY:e+="\\b";break;case Z.Op.NO_WORD_BOUNDARY:e+="\\B";break;case Z.Op.CHAR_CLASS:if(this.runes.length%2!==0){e+="[invalid char class]";break}if(e+="[",this.runes.length===0)e+="^\\x00-\\x{10FFFF}";else if(this.runes[0]===0&&this.runes[this.runes.length-1]===W.MAX_RUNE){e+="^";for(let t=1;t<this.runes.length-1;t+=2){const n=this.runes[t]+1,s=this.runes[t+1]-1;e+=Z.quoteIfHyphen(n),e+=$.escapeRune(n),n!==s&&(e+="-",e+=Z.quoteIfHyphen(s),e+=$.escapeRune(s))}}else for(let t=0;t<this.runes.length;t+=2){const n=this.runes[t],s=this.runes[t+1];e+=Z.quoteIfHyphen(n),e+=$.escapeRune(n),n!==s&&(e+="-",e+=Z.quoteIfHyphen(s),e+=$.escapeRune(s))}e+="]";break;default:e+=this.op;break}return e}maxCap(){let e=0;if(this.op===Z.Op.CAPTURE&&(e=this.cap),this.subs!==null)for(let t of this.subs){const n=t.maxCap();e<n&&(e=n)}return e}equals(e){if(!(e!==null&&e instanceof Z)||this.op!==e.op)return!1;switch(this.op){case Z.Op.END_TEXT:if((this.flags&x.WAS_DOLLAR)!==(e.flags&x.WAS_DOLLAR))return!1;break;case Z.Op.LITERAL:case Z.Op.CHAR_CLASS:if(this.runes===null&&e.runes===null)break;if(this.runes===null||e.runes===null||this.runes.length!==e.runes.length)return!1;for(let t=0;t<this.runes.length;t++)if(this.runes[t]!==e.runes[t])return!1;break;case Z.Op.ALTERNATE:case Z.Op.CONCAT:if(this.subs.length!==e.subs.length)return!1;for(let t=0;t<this.subs.length;++t)if(!this.subs[t].equals(e.subs[t]))return!1;break;case Z.Op.STAR:case Z.Op.PLUS:case Z.Op.QUEST:if((this.flags&x.NON_GREEDY)!==(e.flags&x.NON_GREEDY)||!this.subs[0].equals(e.subs[0]))return!1;break;case Z.Op.REPEAT:if((this.flags&x.NON_GREEDY)!==(e.flags&x.NON_GREEDY)||this.min!==e.min||this.max!==e.max||!this.subs[0].equals(e.subs[0]))return!1;break;case Z.Op.CAPTURE:if(this.cap!==e.cap||(this.name===null?e.name!==null:this.name!==e.name)||!this.subs[0].equals(e.subs[0]))return!1;break;case Z.Op.PLB:case Z.Op.NLB:if(this.lb!==e.lb||!this.subs[0].equals(e.subs[0]))return!1;break}return!0}},G(Z,"Op",gC(["NO_MATCH","EMPTY_MATCH","LITERAL","CHAR_CLASS","ANY_CHAR_NOT_NL","ANY_CHAR","BEGIN_LINE","END_LINE","BEGIN_TEXT","END_TEXT","WORD_BOUNDARY","NO_WORD_BOUNDARY","CAPTURE","STAR","PLUS","QUEST","REPEAT","CONCAT","ALTERNATE","PLB","NLB","LEFT_PAREN","VERTICAL_BAR"])),Z),Th=class{constructor(r){this.next=[Object.create(null)],this.fail=[0],this.match=[!1];for(const t of r){let n=0;for(let s=0;s<t.length;s++){const i=t[s];i in this.next[n]||(this.next.push(Object.create(null)),this.fail.push(0),this.match.push(!1),this.next[n][i]=this.next.length-1),n=this.next[n][i]}this.match[n]=!0}const e=[];for(const t in this.next[0])if(Object.prototype.hasOwnProperty.call(this.next[0],t)){const n=this.next[0][t];this.fail[n]=0,e.push(n)}for(;e.length>0;){const t=e.shift();for(const n in this.next[t])if(Object.prototype.hasOwnProperty.call(this.next[t],n)){const s=this.next[t][n];let i=this.fail[t];for(;i!==0&&!(n in this.next[i]);)i=this.fail[i];n in this.next[i]?this.fail[s]=this.next[i][n]:this.fail[s]=0,this.match[s]=this.match[s]||this.match[this.fail[s]],e.push(s)}}}searchUTF16(r,e,t){let n=0;for(let s=e;s<t;s++){const i=r.charCodeAt(s);for(;n!==0&&!(i in this.next[n]);)n=this.fail[n];if(i in this.next[n]&&(n=this.next[n][i]),this.match[n])return!0}return!1}searchUTF8(r,e,t){let n=0;for(let s=e;s<t;s++){const i=r[s];for(;n!==0&&!(i in this.next[n]);)n=this.fail[n];if(i in this.next[n]&&(n=this.next[n][i]),this.match[n])return!0}return!1}},$t,de=($t=class{constructor(e){this.type=e,this.subs=[],this.str="",this.bytes=null,this.ac16=null,this.ac8=null}eval(e,t){switch(this.type){case $t.Type.NONE:return!0;case $t.Type.EXACT:return e.hasString(this,t);case $t.Type.AND:for(let n=0;n<this.subs.length;n++)if(!this.subs[n].eval(e,t))return!1;return!0;case $t.Type.OR:if(this.ac16&&this.ac8)return e.hasAnyString(this,t);for(let n=0;n<this.subs.length;n++)if(this.subs[n].eval(e,t))return!0;return!1;default:return!0}}},G($t,"Type",{NONE:0,EXACT:1,AND:2,OR:3}),$t),Mw=class sn{static build(e){const t=sn.fromRegexp(e);return sn.simplify(t)}static fromRegexp(e){if(!e)return new de(de.Type.NONE);switch(e.op){case T.Op.PLB:case T.Op.NLB:case T.Op.NO_MATCH:case T.Op.EMPTY_MATCH:case T.Op.BEGIN_LINE:case T.Op.END_LINE:case T.Op.BEGIN_TEXT:case T.Op.END_TEXT:case T.Op.WORD_BOUNDARY:case T.Op.NO_WORD_BOUNDARY:case T.Op.CHAR_CLASS:case T.Op.ANY_CHAR_NOT_NL:case T.Op.ANY_CHAR:return new de(de.Type.NONE);case T.Op.LITERAL:{if(e.runes.length===0||(e.flags&x.FOLD_CASE)!==0)return new de(de.Type.NONE);const t=new de(de.Type.EXACT);let n="";for(let s=0;s<e.runes.length;s++)n+=String.fromCodePoint(e.runes[s]);return t.str=n,t.bytes=$.stringToUtf8ByteArray(t.str),t}case T.Op.CAPTURE:case T.Op.PLUS:return sn.fromRegexp(e.subs[0]);case T.Op.REPEAT:return e.min>=1?sn.fromRegexp(e.subs[0]):new de(de.Type.NONE);case T.Op.CONCAT:{const t=new de(de.Type.AND);for(const n of e.subs)t.subs.push(sn.fromRegexp(n));return t}case T.Op.ALTERNATE:{const t=new de(de.Type.OR);for(const n of e.subs)t.subs.push(sn.fromRegexp(n));return t}default:return new de(de.Type.NONE)}}static simplify(e){if(e.type===de.Type.EXACT||e.type===de.Type.NONE)return e;if(e.type===de.Type.AND){const t=[];for(const n of e.subs){const s=sn.simplify(n);if(s.type!==de.Type.NONE)if(s.type===de.Type.AND)for(let i=0;i<s.subs.length;i++)t.push(s.subs[i]);else t.push(s)}return t.length===0?new de(de.Type.NONE):t.length===1?t[0]:(e.subs=t,e)}if(e.type===de.Type.OR){const t=[];for(const o of e.subs){const B=sn.simplify(o);if(B.type===de.Type.NONE)return new de(de.Type.NONE);if(B.type===de.Type.OR)for(let c=0;c<B.subs.length;c++)t.push(B.subs[c]);else t.push(B)}if(t.length===0)return new de(de.Type.NONE);if(t.length===1)return t[0];const n=new Set,s=[];for(const o of t)o.type===de.Type.EXACT?n.has(o.str)||(n.add(o.str),s.push(o)):s.push(o);e.subs=s;let i=!0;for(const o of s)if(o.type!==de.Type.EXACT){i=!1;break}return i&&s.length>1&&(e.ac16=new Th(s.map(o=>{const B=[];for(let c=0;c<o.str.length;c++)B.push(o.str.charCodeAt(c));return B})),e.ac8=new Th(s.map(o=>o.bytes))),e}return e}},Lt=class{constructor(r=0,e=0){this.head=r,this.tail=e}},Gw=class{constructor(){this.inst=[],this.start=0,this.numCap=2,this.lbStarts=[],this.numLb=0}getInst(r){return this.inst[r]}numInst(){return this.inst.length}addInst(r){this.inst.push(new N(r))}skipNop(r){let e=this.inst[r];for(;e.op===N.NOP||e.op===N.CAPTURE;)e=this.inst[r],r=e.out;return e}prefix(){let r="",e=this.skipNop(this.start);if(!N.isRuneOp(e.op)||e.runes.length!==1)return[e.op===N.MATCH,r];for(;N.isRuneOp(e.op)&&e.runes.length===1&&(e.arg&x.FOLD_CASE)===0;)r+=String.fromCodePoint(e.runes[0]),e=this.skipNop(e.out);return[e.op===N.MATCH,r]}startCond(){let r=0,e=this.start;e:for(;;){const t=this.inst[e];switch(t.op){case N.EMPTY_WIDTH:r|=t.arg;break;case N.FAIL:return-1;case N.CAPTURE:case N.NOP:break;default:break e}e=t.out}return r}patch(r,e){let t=r.head;for(;t!==0;){const n=this.inst[t>>1];(t&1)===0?(t=n.out,n.out=e):(t=n.arg,n.arg=e)}}append(r,e){if(r.head===0)return e;if(e.head===0)return r;const t=this.inst[r.tail>>1];return(r.tail&1)===0?t.out=e.head:t.arg=e.head,new Lt(r.head,e.tail)}toString(){let r="";for(let e=0;e<this.inst.length;e++){const t=r.length;r+=e,e===this.start&&(r+="*"),r+="        ".substring(r.length-t),r+=this.inst[e],r+=`
`}return r}},Eo=class{constructor(r=0,e=new Lt,t=!1){this.i=r,this.out=e,this.nullable=t}},Uw=class Fr{static ANY_RUNE_NOT_NL(){return[0,b.CODES.get(`
`)-1,b.CODES.get(`
`)+1,W.MAX_RUNE]}static ANY_RUNE(){return[0,W.MAX_RUNE]}static compileRegexp(e){const t=new Fr,n=t.compile(e);return t.prog.patch(n.out,t.newInst(N.MATCH).i),t.prog.start=n.i,t.prog}static compileSet(e){const t=new Fr;if(e.length===0)return t.prog.start=t.newInst(N.FAIL).i,t.prog;let n=[];for(let i=0;i<e.length;i++){const o=t.compile(e[i]),B=t.newInst(N.MATCH);t.prog.getInst(B.i).arg=i,t.prog.patch(o.out,B.i),n.push(o.i)}let s=n[0];for(let i=1;i<n.length;i++){const o=t.newInst(N.ALT),B=t.prog.getInst(o.i);B.out=s,B.arg=n[i],s=o.i}return t.prog.start=s,t.prog}constructor(){this.prog=new Gw,this.newInst(N.FAIL)}newInst(e){return this.prog.addInst(e),new Eo(this.prog.numInst()-1,new Lt,!0)}nop(){const e=this.newInst(N.NOP);return e.out=new Lt(e.i<<1,e.i<<1),e}fail(){return new Eo}cap(e){const t=this.newInst(N.CAPTURE);return t.out=new Lt(t.i<<1,t.i<<1),this.prog.getInst(t.i).arg=e,this.prog.numCap<e+1&&(this.prog.numCap=e+1),t}cat(e,t){return e.i===0||t.i===0?this.fail():(this.prog.patch(e.out,t.i),new Eo(e.i,t.out,e.nullable&&t.nullable))}alt(e,t){if(e.i===0)return t;if(t.i===0)return e;const n=this.newInst(N.ALT),s=this.prog.getInst(n.i);return s.out=e.i,s.arg=t.i,n.out=this.prog.append(e.out,t.out),n.nullable=e.nullable||t.nullable,n}loop(e,t){const n=this.newInst(N.ALT),s=this.prog.getInst(n.i);return t?(s.arg=e.i,n.out=new Lt(n.i<<1,n.i<<1)):(s.out=e.i,n.out=new Lt(n.i<<1|1,n.i<<1|1)),this.prog.patch(e.out,n.i),n}quest(e,t){const n=this.newInst(N.ALT),s=this.prog.getInst(n.i);return t?(s.arg=e.i,n.out=new Lt(n.i<<1,n.i<<1)):(s.out=e.i,n.out=new Lt(n.i<<1|1,n.i<<1|1)),n.out=this.prog.append(n.out,e.out),n}star(e,t){return e.nullable?this.quest(this.plus(e,t),t):this.loop(e,t)}plus(e,t){return new Eo(e.i,this.loop(e,t).out,e.nullable)}empty(e){const t=this.newInst(N.EMPTY_WIDTH);return this.prog.getInst(t.i).arg=e,t.out=new Lt(t.i<<1,t.i<<1),t}rune(e,t){const n=this.newInst(N.RUNE);n.nullable=!1;const s=this.prog.getInst(n.i);return s.runes=e,t&=x.FOLD_CASE,(e.length!==1||W.simpleFold(e[0])===e[0])&&(t&=-2),s.arg=t,n.out=new Lt(n.i<<1,n.i<<1),(t&x.FOLD_CASE)===0&&e.length===1||e.length===2&&e[0]===e[1]?s.op=N.RUNE1:e.length===2&&e[0]===0&&e[1]===W.MAX_RUNE?s.op=N.RUNE_ANY:e.length===4&&e[0]===0&&e[1]===b.CODES.get(`
`)-1&&e[2]===b.CODES.get(`
`)+1&&e[3]===W.MAX_RUNE&&(s.op=N.RUNE_ANY_NOT_NL),n}lookBehind(e,t){const n=this.newInst(N.LB_WRITE);this.prog.getInst(n.i).arg=t;const s=this.rune(Fr.ANY_RUNE(),0),i=this.star(s,!0),o=this.cat(i,e);this.prog.patch(o.out,n.i);const B=this.newInst(N.LB_CHECK);return this.prog.getInst(B.i).arg=t,this.prog.lbStarts.push(o.i),Math.abs(t)>this.prog.numLb&&(this.prog.numLb=Math.abs(t)),B.out=new Lt(B.i<<1,B.i<<1),B}compile(e){switch(e.op){case T.Op.NO_MATCH:return this.fail();case T.Op.EMPTY_MATCH:return this.nop();case T.Op.LITERAL:if(e.runes.length===0)return this.nop();{let t=null;for(let n of e.runes){const s=this.rune([n],e.flags);t=t===null?s:this.cat(t,s)}return t}case T.Op.CHAR_CLASS:return this.rune(e.runes,e.flags);case T.Op.ANY_CHAR_NOT_NL:return this.rune(Fr.ANY_RUNE_NOT_NL(),0);case T.Op.ANY_CHAR:return this.rune(Fr.ANY_RUNE(),0);case T.Op.BEGIN_LINE:return this.empty($.EMPTY_BEGIN_LINE);case T.Op.END_LINE:return this.empty($.EMPTY_END_LINE);case T.Op.BEGIN_TEXT:return this.empty($.EMPTY_BEGIN_TEXT);case T.Op.END_TEXT:return this.empty($.EMPTY_END_TEXT);case T.Op.WORD_BOUNDARY:return this.empty($.EMPTY_WORD_BOUNDARY);case T.Op.NO_WORD_BOUNDARY:return this.empty($.EMPTY_NO_WORD_BOUNDARY);case T.Op.PLB:case T.Op.NLB:return this.lookBehind(this.compile(e.subs[0]),e.lb);case T.Op.CAPTURE:{const t=this.cap(e.cap<<1),n=this.compile(e.subs[0]),s=this.cap(e.cap<<1|1);return this.cat(this.cat(t,n),s)}case T.Op.STAR:return this.star(this.compile(e.subs[0]),(e.flags&x.NON_GREEDY)!==0);case T.Op.PLUS:return this.plus(this.compile(e.subs[0]),(e.flags&x.NON_GREEDY)!==0);case T.Op.QUEST:return this.quest(this.compile(e.subs[0]),(e.flags&x.NON_GREEDY)!==0);case T.Op.CONCAT:if(e.subs.length===0)return this.nop();{let t=null;for(let n of e.subs){const s=this.compile(n);t=t===null?s:this.cat(t,s)}return t}case T.Op.ALTERNATE:if(e.subs.length===0)return this.nop();{let t=null;for(let n of e.subs){const s=this.compile(n);t=t===null?s:this.alt(t,s)}return t}default:throw new yw("regexp: unhandled case in compile")}}},Hw=class Tt{static simplify(e){if(e===null)return null;switch(e.op){case T.Op.PLB:case T.Op.NLB:case T.Op.CAPTURE:{const t=Tt.simplify(e.subs[0]);if(t!==e.subs[0]){const n=T.fromRegexp(e);return n.runes=[],n.subs=[t],n}return e}case T.Op.CONCAT:case T.Op.ALTERNATE:{const t=[];let n=!1;for(let s=0;s<e.subs.length;s++){const i=e.subs[s],o=Tt.simplify(i);if(o!==i&&(n=!0),e.op===T.Op.CONCAT){if(o.op===T.Op.NO_MATCH)return new T(T.Op.NO_MATCH);if(o.op===T.Op.EMPTY_MATCH){n=!0;continue}if(o.op===T.Op.CONCAT){n=!0;for(let B=0;B<o.subs.length;B++)t.push(o.subs[B]);continue}}else if(e.op===T.Op.ALTERNATE){if(o.op===T.Op.NO_MATCH){n=!0;continue}if(o.op===T.Op.ALTERNATE){n=!0;for(let B=0;B<o.subs.length;B++)t.push(o.subs[B]);continue}}t.push(o)}if(n){if(t.length===0)return new T(e.op===T.Op.CONCAT?T.Op.EMPTY_MATCH:T.Op.NO_MATCH);if(t.length===1)return t[0];const s=T.fromRegexp(e);return s.runes=[],s.subs=t,s}return e}case T.Op.CHAR_CLASS:return e.runes===null?e:e.runes.length===0?new T(T.Op.NO_MATCH):e.runes.length===2&&e.runes[0]===0&&e.runes[1]===W.MAX_RUNE?new T(T.Op.ANY_CHAR):e.runes.length===4&&e.runes[0]===0&&e.runes[1]===b.CODES.get(`
`)-1&&e.runes[2]===b.CODES.get(`
`)+1&&e.runes[3]===W.MAX_RUNE?new T(T.Op.ANY_CHAR_NOT_NL):e;case T.Op.STAR:case T.Op.PLUS:case T.Op.QUEST:{const t=Tt.simplify(e.subs[0]);return Tt.simplify1(e.op,e.flags,t,e)}case T.Op.REPEAT:{if(e.min===0&&e.max===0)return new T(T.Op.EMPTY_MATCH);const t=Tt.simplify(e.subs[0]);if(e.max===-1){if(e.min===0)return Tt.simplify1(T.Op.STAR,e.flags,t,null);if(e.min===1)return Tt.simplify1(T.Op.PLUS,e.flags,t,null);const s=new T(T.Op.CONCAT),i=[];for(let o=0;o<e.min-1;o++)i.push(t);return i.push(Tt.simplify1(T.Op.PLUS,e.flags,t,null)),s.subs=i.slice(0),Tt.simplify(s)}if(e.min===1&&e.max===1)return t;let n=null;if(e.min>0){n=[];for(let s=0;s<e.min;s++)n.push(t)}if(e.max>e.min){let s=Tt.simplify1(T.Op.QUEST,e.flags,t,null);for(let i=e.min+1;i<e.max;i++){const o=new T(T.Op.CONCAT);o.subs=[t,s],s=Tt.simplify1(T.Op.QUEST,e.flags,o,null)}if(n===null)return s;n.push(s)}if(n!==null){const s=new T(T.Op.CONCAT);return s.subs=n.slice(0),Tt.simplify(s)}return new T(T.Op.NO_MATCH)}}return e}static simplify1(e,t,n,s){if(n.op===T.Op.EMPTY_MATCH)return n;if(n.op===T.Op.NO_MATCH)return e===T.Op.PLUS?n:new T(T.Op.EMPTY_MATCH);if(e===n.op&&(t&x.NON_GREEDY)===(n.flags&x.NON_GREEDY))return n;if(s!==null&&s.op===e&&(s.flags&x.NON_GREEDY)===(t&x.NON_GREEDY)&&n===s.subs[0])return s;const i=new T(e);return i.flags=t,i.subs=[n],i}},he=class{constructor(r,e){this.sign=r,this.cls=e}};const Ah=[48,57],Rh=[9,10,12,13,32,32],vh=[48,57,65,90,95,95,97,122],Ph=new Map([["\\d",new he(1,Ah)],["\\D",new he(-1,Ah)],["\\s",new he(1,Rh)],["\\S",new he(-1,Rh)],["\\w",new he(1,vh)],["\\W",new he(-1,vh)]]),Sh=[48,57,65,90,97,122],Oh=[65,90,97,122],bh=[0,127],Nh=[9,9,32,32],Lh=[0,31,127,127],Fh=[48,57],kh=[33,126],Vh=[97,122],xh=[32,126],Mh=[33,47,58,64,91,96,123,126],Gh=[9,13,32,32],Uh=[65,90],Hh=[48,57,65,90,95,95,97,122],Jh=[48,57,65,70,97,102],jh=new Map([["[:alnum:]",new he(1,Sh)],["[:^alnum:]",new he(-1,Sh)],["[:alpha:]",new he(1,Oh)],["[:^alpha:]",new he(-1,Oh)],["[:ascii:]",new he(1,bh)],["[:^ascii:]",new he(-1,bh)],["[:blank:]",new he(1,Nh)],["[:^blank:]",new he(-1,Nh)],["[:cntrl:]",new he(1,Lh)],["[:^cntrl:]",new he(-1,Lh)],["[:digit:]",new he(1,Fh)],["[:^digit:]",new he(-1,Fh)],["[:graph:]",new he(1,kh)],["[:^graph:]",new he(-1,kh)],["[:lower:]",new he(1,Vh)],["[:^lower:]",new he(-1,Vh)],["[:print:]",new he(1,xh)],["[:^print:]",new he(-1,xh)],["[:punct:]",new he(1,Mh)],["[:^punct:]",new he(-1,Mh)],["[:space:]",new he(1,Gh)],["[:^space:]",new he(-1,Gh)],["[:upper:]",new he(1,Uh)],["[:^upper:]",new he(-1,Uh)],["[:word:]",new he(1,Hh)],["[:^word:]",new he(-1,Hh)],["[:xdigit:]",new he(1,Jh)],["[:^xdigit:]",new he(-1,Jh)]]);var Nn=class Fn{static charClassToString(e,t){let n="[";for(let s=0;s<t;s+=2){s>0&&(n+=" ");const i=e[s],o=e[s+1];i===o?n+=`0x${i.toString(16)}`:n+=`0x${i.toString(16)}-0x${o.toString(16)}`}return n+="]",n}static cmp(e,t,n,s){const i=e[t]-n;return i!==0?i:s-e[t+1]}static qsortIntPair(e,t,n){const s=((t+n)/2|0)&-2,i=e[s],o=e[s+1];let B=t,c=n;for(;B<=c;){for(;B<n&&Fn.cmp(e,B,i,o)<0;)B+=2;for(;c>t&&Fn.cmp(e,c,i,o)>0;)c-=2;if(B<=c){if(B!==c){let u=e[B];e[B]=e[c],e[c]=u,u=e[B+1],e[B+1]=e[c+1],e[c+1]=u}B+=2,c-=2}}t<c&&Fn.qsortIntPair(e,t,c),B<n&&Fn.qsortIntPair(e,B,n)}constructor(e=$.emptyInts()){this.r=e,this.len=e.length}toArray(){return this.len===this.r.length?this.r:this.r.slice(0,this.len)}cleanClass(){if(this.len<4)return this;Fn.qsortIntPair(this.r,0,this.len-2);let e=2;for(let t=2;t<this.len;t+=2){const n=this.r[t],s=this.r[t+1];if(n<=this.r[e-1]+1){s>this.r[e-1]&&(this.r[e-1]=s);continue}this.r[e]=n,this.r[e+1]=s,e+=2}return this.len=e,this}appendLiteral(e,t){return(t&x.FOLD_CASE)!==0?this.appendFoldedRange(e,e):this.appendRange(e,e)}appendRange(e,t){if(this.len>0){for(let n=2;n<=4;n+=2)if(this.len>=n){const s=this.r[this.len-n],i=this.r[this.len-n+1];if(e<=i+1&&s<=t+1)return e<s&&(this.r[this.len-n]=e),t>i&&(this.r[this.len-n+1]=t),this}}return this.r[this.len++]=e,this.r[this.len++]=t,this}appendFoldedRange(e,t){if(e<=W.MIN_FOLD&&t>=W.MAX_FOLD)return this.appendRange(e,t);if(t<W.MIN_FOLD||e>W.MAX_FOLD)return this.appendRange(e,t);e<W.MIN_FOLD&&(this.appendRange(e,W.MIN_FOLD-1),e=W.MIN_FOLD),t>W.MAX_FOLD&&(this.appendRange(W.MAX_FOLD+1,t),t=W.MAX_FOLD);for(let n=e;n<=t;n++){this.appendRange(n,n);for(let s=W.simpleFold(n);s!==n;s=W.simpleFold(s))this.appendRange(s,s)}return this}appendClass(e){for(let t=0;t<e.length;t+=2)this.appendRange(e[t],e[t+1]);return this}appendFoldedClass(e){for(let t=0;t<e.length;t+=2)this.appendFoldedRange(e[t],e[t+1]);return this}appendNegatedClass(e){let t=0;for(let n=0;n<e.length;n+=2){const s=e[n],i=e[n+1];t<=s-1&&this.appendRange(t,s-1),t=i+1}return t<=W.MAX_RUNE&&this.appendRange(t,W.MAX_RUNE),this}appendTable(e){for(let t=0;t<e.length;++t){const n=e.getLo(t),s=e.getHi(t),i=e.getStride(t);if(i===1){this.appendRange(n,s);continue}for(let o=n;o<=s;o+=i)this.appendRange(o,o)}return this}appendNegatedTable(e){let t=0;for(let n=0;n<e.length;++n){const s=e.getLo(n),i=e.getHi(n),o=e.getStride(n);if(o===1){t<=s-1&&this.appendRange(t,s-1),t=i+1;continue}for(let B=s;B<=i;B+=o)t<=B-1&&this.appendRange(t,B-1),t=B+1}return t<=W.MAX_RUNE&&this.appendRange(t,W.MAX_RUNE),this}appendTableWithSign(e,t){return t<0?this.appendNegatedTable(e):this.appendTable(e)}negateClass(){let e=0,t=0;for(let n=0;n<this.len;n+=2){const s=this.r[n],i=this.r[n+1];e<=s-1&&(this.r[t]=e,this.r[t+1]=s-1,t+=2),e=i+1}return this.len=t,e<=W.MAX_RUNE&&(this.r[this.len++]=e,this.r[this.len++]=W.MAX_RUNE),this}appendClassWithSign(e,t){return t<0?this.appendNegatedClass(e):this.appendClass(e)}appendGroup(e,t){let n=e.cls;return t&&(n=new Fn().appendFoldedClass(n).cleanClass().toArray()),this.appendClassWithSign(n,e.sign)}toString(){return Fn.charClassToString(this.r,this.len)}},Jw=class{constructor(r){this.str=r,this.position=0}pos(){return this.position}rewindTo(r){this.position=r}more(){return this.position<this.str.length}peek(){return this.str.codePointAt(this.position)}skip(r){this.position+=r}skipString(r){this.position+=r.length}pop(){const r=this.str.codePointAt(this.position);return this.position+=$.charCount(r),r}lookingAt(r){return this.str.startsWith(r,this.position)}rest(){return this.str.substring(this.position)}from(r){return this.str.substring(r,this.position)}toString(){return this.rest()}},U,jw=(U=class{static unicodeTable(e){return e==="Any"?{tab:U.ANY_TABLE,fold:U.ANY_TABLE,sign:1}:e==="Ascii"?{tab:U.ASCII_TABLE,fold:U.ASCII_FOLD_TABLE,sign:1}:e==="Assigned"?{tab:pt.CATEGORIES.get("Cn"),fold:pt.CATEGORIES.get("Cn"),sign:-1}:e==="Lc"?{tab:pt.CATEGORIES.get("LC"),fold:pt.FOLD_CATEGORIES.get("LC"),sign:1}:pt.CATEGORIES.has(e)?{tab:pt.CATEGORIES.get(e),fold:pt.FOLD_CATEGORIES.get(e),sign:1}:pt.SCRIPTS.has(e)?{tab:pt.SCRIPTS.get(e),fold:pt.FOLD_SCRIPT.get(e),sign:1}:null}static minFoldRune(e){if(e<W.MIN_FOLD||e>W.MAX_FOLD)return e;let t=e;const n=e;for(e=W.simpleFold(e);e!==n;e=W.simpleFold(e))t>e&&(t=e);return t}static leadingRegexp(e){if(e.op===T.Op.EMPTY_MATCH)return null;if(e.op===T.Op.CONCAT&&e.subs.length>0){const t=e.subs[0];return t.op===T.Op.EMPTY_MATCH?null:t}return e}static literalRegexp(e,t){const n=new T(T.Op.LITERAL);return n.flags=t,n.runes=$.stringToRunes(e),n}static parse(e,t){return new U(e,t).parseInternal()}static parseRepeat(e){const t=e.pos();if(!e.more()||!e.lookingAt("{"))return-1;e.skip(1);const n=U.parseInt(e);if(n===-1||!e.more())return-1;let s;if(!e.lookingAt(","))s=n;else{if(e.skip(1),!e.more())return-1;if(e.lookingAt("}"))s=-1;else if((s=U.parseInt(e))===-1)return-1}if(!e.more()||!e.lookingAt("}"))return-1;if(e.skip(1),n<0||n>1e3||s===-2||s>1e3||s>=0&&n>s)throw new _e(U.ERR_INVALID_REPEAT_SIZE,e.from(t));return n<<16|s&W.MAX_BMP}static isValidCaptureName(e){if(e.length===0)return!1;for(let t=0;t<e.length;t++){const n=e.codePointAt(t);if(n!==b.CODES.get("_")&&!$.isalnum(n))return!1}return!0}static parseInt(e){const t=e.pos();for(;e.more()&&e.peek()>=b.CODES.get("0")&&e.peek()<=b.CODES.get("9");)e.skip(1);const n=e.from(t);return n.length===0||n.length>1&&n.codePointAt(0)===b.CODES.get("0")?-1:n.length>8?-2:parseInt(n,10)}static isCharClass(e){return e.op===T.Op.LITERAL&&e.runes.length===1||e.op===T.Op.CHAR_CLASS||e.op===T.Op.ANY_CHAR_NOT_NL||e.op===T.Op.ANY_CHAR}static matchRune(e,t){switch(e.op){case T.Op.LITERAL:return e.runes.length===1&&e.runes[0]===t;case T.Op.CHAR_CLASS:for(let n=0;n<e.runes.length;n+=2)if(e.runes[n]<=t&&t<=e.runes[n+1])return!0;return!1;case T.Op.ANY_CHAR_NOT_NL:return t!==b.CODES.get(`
`);case T.Op.ANY_CHAR:return!0}return!1}static mergeCharClass(e,t){switch(e.op){case T.Op.ANY_CHAR:break;case T.Op.ANY_CHAR_NOT_NL:U.matchRune(t,b.CODES.get(`
`))&&(e.op=T.Op.ANY_CHAR);break;case T.Op.CHAR_CLASS:t.op===T.Op.LITERAL?e.runes=new Nn(e.runes).appendLiteral(t.runes[0],t.flags).toArray():e.runes=new Nn(e.runes).appendClass(t.runes).toArray();break;case T.Op.LITERAL:if(t.runes[0]===e.runes[0]&&t.flags===e.flags)break;e.op=T.Op.CHAR_CLASS,e.runes=new Nn().appendLiteral(e.runes[0],e.flags).appendLiteral(t.runes[0],t.flags).toArray();break}}static parseEscape(e){const t=e.pos();if(e.skip(1),!e.more())throw new _e(U.ERR_TRAILING_BACKSLASH);let n=e.pop();e:switch(n){case b.CODES.get("1"):case b.CODES.get("2"):case b.CODES.get("3"):case b.CODES.get("4"):case b.CODES.get("5"):case b.CODES.get("6"):case b.CODES.get("7"):if(!e.more()||e.peek()<b.CODES.get("0")||e.peek()>b.CODES.get("7"))break;case b.CODES.get("0"):{let s=n-b.CODES.get("0");for(let i=1;i<3&&!(!e.more()||e.peek()<b.CODES.get("0")||e.peek()>b.CODES.get("7"));i++)s=s*8+e.peek()-b.CODES.get("0"),e.skip(1);return s}case b.CODES.get("x"):{if(!e.more())break;if(n=e.pop(),n===b.CODES.get("{")){let o=0,B=0;for(;;){if(!e.more())break e;if(n=e.pop(),n===b.CODES.get("}"))break;const c=$.unhex(n);if(c<0||(B=B*16+c,B>W.MAX_RUNE))break e;o++}if(o===0)break e;return B}const s=$.unhex(n);if(!e.more())break;n=e.pop();const i=$.unhex(n);if(s<0||i<0)break;return s*16+i}case b.CODES.get("a"):return b.CODES.get("\x07");case b.CODES.get("f"):return b.CODES.get("\f");case b.CODES.get("n"):return b.CODES.get(`
`);case b.CODES.get("r"):return b.CODES.get("\r");case b.CODES.get("t"):return b.CODES.get("	");case b.CODES.get("v"):return b.CODES.get("\v");default:if(n<=W.MAX_ASCII&&!$.isalnum(n))return n;break}throw new _e(U.ERR_INVALID_ESCAPE,e.from(t))}static parseClassChar(e,t){if(!e.more())throw new _e(U.ERR_MISSING_BRACKET,e.from(t));return e.lookingAt("\\")?U.parseEscape(e):e.pop()}static concatRunes(e,t){for(let n=0;n<t.length;n++)e.push(t[n]);return e}static hasCapture(e){if(e===null)return!1;if(e.op===T.Op.CAPTURE)return!0;if(e.subs){for(let t of e.subs)if(U.hasCapture(t))return!0}return!1}constructor(e,t=0){this.wholeRegexp=e,this.flags=t,this.numCap=0,this.namedGroups=Object.create(null),this.stack=[],this.free=null,this.numRegexp=0,this.numRunes=0,this.repeats=0,this.height=null,this.size=null,this.nlb=0}newRegexp(e){let t=this.free;return t!==null&&t.subs!==null&&t.subs.length>0?(this.free=t.subs[0],t.reinit(),t.op=e):(t=new T(e),this.numRegexp+=1),t}reuse(e){this.height!==null&&this.height.has(e)&&this.height.delete(e),e.subs!==null&&e.subs.length>0&&(e.subs[0]=this.free),this.free=e}checkLimits(e){if(this.numRunes>U.MAX_RUNES)throw new _e(U.ERR_LARGE);this.checkSize(e),this.checkHeight(e)}checkSize(e){if(this.size===null){if(this.repeats===0&&(this.repeats=1),e.op===T.Op.REPEAT){let t=e.max;t===-1&&(t=e.min),t<=0&&(t=1),t>Math.floor(U.MAX_SIZE/this.repeats)?this.repeats=U.MAX_SIZE:this.repeats*=t}if(this.numRegexp<Math.floor(U.MAX_SIZE/this.repeats))return;this.size=new Map;for(let t of this.stack)this.checkSize(t)}if(this.calcSize(e,!0)>U.MAX_SIZE)throw new _e(U.ERR_LARGE)}calcSize(e,t=!1){if(!t&&this.size!==null&&this.size.has(e))return this.size.get(e);let n=0;switch(e.op){case T.Op.LITERAL:n=e.runes.length;break;case T.Op.PLB:case T.Op.NLB:case T.Op.CAPTURE:case T.Op.STAR:n=2+this.calcSize(e.subs[0]);break;case T.Op.PLUS:case T.Op.QUEST:n=1+this.calcSize(e.subs[0]);break;case T.Op.CONCAT:for(let s of e.subs)n=n+this.calcSize(s);break;case T.Op.ALTERNATE:for(let s of e.subs)n=n+this.calcSize(s);e.subs.length>1&&(n=n+e.subs.length-1);break;case T.Op.REPEAT:{let s=this.calcSize(e.subs[0]);if(e.max===-1){e.min===0?n=2+s:n=1+e.min*s;break}n=e.max*s+(e.max-e.min);break}}return n=Math.max(1,n),this.size===null&&(this.size=new Map),this.size.set(e,n),n}checkHeight(e){if(!(this.numRegexp<U.MAX_HEIGHT)){if(this.height===null){this.height=new Map;for(let t of this.stack)this.checkHeight(t)}if(this.calcHeight(e,!0)>U.MAX_HEIGHT)throw new _e(U.ERR_NESTING_DEPTH)}}calcHeight(e,t=!1){if(!t&&this.height!==null&&this.height.has(e))return this.height.get(e);let n=1;for(let s of e.subs){const i=this.calcHeight(s);n<1+i&&(n=1+i)}return this.height===null&&(this.height=new Map),this.height.set(e,n),n}pop(){return this.stack.pop()}popToPseudo(){const e=this.stack.length;let t=e;for(;t>0&&!T.isPseudoOp(this.stack[t-1].op);)t--;const n=this.stack.slice(t,e);return this.stack=this.stack.slice(0,t),n}push(e){if(this.numRunes+=e.runes.length,e.op===T.Op.CHAR_CLASS&&e.runes.length===2&&e.runes[0]===e.runes[1]){if(this.maybeConcat(e.runes[0],this.flags&-2))return null;e.op=T.Op.LITERAL,e.runes=[e.runes[0]],e.flags=this.flags&-2}else if(e.op===T.Op.CHAR_CLASS&&e.runes.length===4&&e.runes[0]===e.runes[1]&&e.runes[2]===e.runes[3]&&W.simpleFold(e.runes[0])===e.runes[2]&&W.simpleFold(e.runes[2])===e.runes[0]||e.op===T.Op.CHAR_CLASS&&e.runes.length===2&&e.runes[0]+1===e.runes[1]&&W.simpleFold(e.runes[0])===e.runes[1]&&W.simpleFold(e.runes[1])===e.runes[0]){if(this.maybeConcat(e.runes[0],this.flags|x.FOLD_CASE))return null;e.op=T.Op.LITERAL,e.runes=[e.runes[0]],e.flags=this.flags|x.FOLD_CASE}else this.maybeConcat(-1,0);return this.stack.push(e),this.checkLimits(e),e}maybeConcat(e,t){const n=this.stack.length;if(n<2)return!1;const s=this.stack[n-1],i=this.stack[n-2];return s.op!==T.Op.LITERAL||i.op!==T.Op.LITERAL||(s.flags&x.FOLD_CASE)!==(i.flags&x.FOLD_CASE)?!1:(i.runes=U.concatRunes(i.runes,s.runes),e>=0?(s.runes=[e],s.flags=t,!0):(this.pop(),this.reuse(s),!1))}newLiteral(e,t){const n=this.newRegexp(T.Op.LITERAL);return n.flags=t,(t&x.FOLD_CASE)!==0&&(e=U.minFoldRune(e)),n.runes=[e],n}literal(e){this.push(this.newLiteral(e,this.flags))}op(e){const t=this.newRegexp(e);return t.flags=this.flags,this.push(t)}repeat(e,t,n,s,i,o){let B=this.flags;if((B&x.PERL_X)!==0&&(i.more()&&i.lookingAt("?")&&(i.skip(1),B^=x.NON_GREEDY),o!==-1))throw new _e(U.ERR_INVALID_REPEAT_OP,i.from(o));const c=this.stack.length;if(c===0)throw new _e(U.ERR_MISSING_REPEAT_ARGUMENT,i.from(s));const u=this.stack[c-1];if(T.isPseudoOp(u.op))throw new _e(U.ERR_MISSING_REPEAT_ARGUMENT,i.from(s));const h=this.newRegexp(e);if(h.min=t,h.max=n,h.flags=B,h.subs=[u],this.stack[c-1]=h,this.checkLimits(h),e===T.Op.REPEAT&&(t>=2||n>=2)&&!this.repeatIsValid(h,1e3))throw new _e(U.ERR_INVALID_REPEAT_SIZE,i.from(s))}repeatIsValid(e,t){if(e.op===T.Op.REPEAT){let n=e.max;if(n===0)return!0;if(n<0&&(n=e.min),n>t)return!1;n>0&&(t=Math.trunc(t/n))}for(let n of e.subs)if(!this.repeatIsValid(n,t))return!1;return!0}concat(){this.maybeConcat(-1,0);const e=this.popToPseudo();return e.length===0?this.push(this.newRegexp(T.Op.EMPTY_MATCH)):this.push(this.collapse(e,T.Op.CONCAT))}alternate(){const e=this.popToPseudo();return e.length>0&&this.cleanAlt(e[e.length-1]),e.length===0?this.push(this.newRegexp(T.Op.NO_MATCH)):this.push(this.collapse(e,T.Op.ALTERNATE))}cleanAlt(e){e.op===T.Op.CHAR_CLASS&&(e.runes=new Nn(e.runes).cleanClass().toArray(),e.runes.length===2&&e.runes[0]===0&&e.runes[1]===W.MAX_RUNE?(e.runes=[],e.op=T.Op.ANY_CHAR):e.runes.length===4&&e.runes[0]===0&&e.runes[1]===b.CODES.get(`
`)-1&&e.runes[2]===b.CODES.get(`
`)+1&&e.runes[3]===W.MAX_RUNE&&(e.runes=[],e.op=T.Op.ANY_CHAR_NOT_NL))}collapse(e,t){if(e.length===1)return e[0];let n=0;for(let B of e)n+=B.op===t?B.subs.length:1;let s=new Array(n).fill(null),i=0;for(let B of e)if(B.op===t){for(let c=0;c<B.subs.length;c++)s[i++]=B.subs[c];this.reuse(B)}else s[i++]=B;let o=this.newRegexp(t);if(o.subs=s,t===T.Op.ALTERNATE&&(o.subs=this.factor(o.subs),o.subs.length===1)){const B=o;o=o.subs[0],this.reuse(B)}return o}factor(e){if(e.length<2)return e;let t=0,n=e.length,s=0,i=null,o=0,B=0,c=0;for(let h=0;h<=n;h++){let d=null,p=0,I=0;if(h<n){let R=e[t+h];if(R.op===T.Op.CONCAT&&R.subs.length>0&&(R=R.subs[0]),R.op===T.Op.LITERAL&&(d=R.runes,p=R.runes.length,I=R.flags&x.FOLD_CASE),I===B){let k=0;for(;k<o&&k<p&&i[k]===d[k];)k++;if(k>0){o=k;continue}}}if(h!==c)if(h===c+1)e[s++]=e[t+c];else{const R=this.newRegexp(T.Op.LITERAL);R.flags=B,R.runes=i.slice(0,o);for(let z=c;z<h;z++)e[t+z]=this.removeLeadingString(e[t+z],o),this.checkLimits(e[t+z]);const k=this.collapse(e.slice(t+c,t+h),T.Op.ALTERNATE),M=this.newRegexp(T.Op.CONCAT);M.subs=[R,k],e[s++]=M}c=h,i=d,o=p,B=I}n=s,t=0,c=0,s=0;let u=null;for(let h=0;h<=n;h++){let d=null;if(!(h<n&&(d=U.leadingRegexp(e[t+h]),u!==null&&u.equals(d)&&(U.isCharClass(u)||u.op===T.Op.REPEAT&&u.min===u.max&&U.isCharClass(u.subs[0]))))){if(h!==c)if(h===c+1)e[s++]=e[t+c];else{const p=u;for(let k=c;k<h;k++){const M=k!==c;e[t+k]=this.removeLeadingRegexp(e[t+k],M),this.checkLimits(e[t+k])}const I=this.collapse(e.slice(t+c,t+h),T.Op.ALTERNATE),R=this.newRegexp(T.Op.CONCAT);R.subs=[p,I],e[s++]=R}c=h,u=d}}n=s,t=0,c=0,s=0;for(let h=0;h<=n;h++)if(!(h<n&&U.isCharClass(e[t+h]))){if(h!==c)if(h===c+1)e[s++]=e[t+c];else{let d=c;for(let I=c+1;I<h;I++){const R=e[t+d],k=e[t+I];(R.op<k.op||R.op===k.op&&(R.runes!==null?R.runes.length:0)<(k.runes!==null?k.runes.length:0))&&(d=I)}const p=e[t+c];e[t+c]=e[t+d],e[t+d]=p;for(let I=c+1;I<h;I++)U.mergeCharClass(e[t+c],e[t+I]),this.reuse(e[t+I]);this.cleanAlt(e[t+c]),e[s++]=e[t+c]}h<n&&(e[s++]=e[t+h]),c=h+1}n=s,t=0,c=0,s=0;for(let h=0;h<n;++h)h+1<n&&e[t+h].op===T.Op.EMPTY_MATCH&&e[t+h+1].op===T.Op.EMPTY_MATCH||(e[s++]=e[t+h]);return n=s,t=0,e.slice(t,n)}removeLeadingString(e,t){if(e.op===T.Op.CONCAT&&e.subs.length>0){const n=this.removeLeadingString(e.subs[0],t);if(e.subs[0]=n,n.op===T.Op.EMPTY_MATCH)switch(this.reuse(n),e.subs.length){case 0:case 1:e.op=T.Op.EMPTY_MATCH,e.subs=T.emptySubs();break;case 2:{const s=e;e=e.subs[1],this.reuse(s);break}default:e.subs=e.subs.slice(1,e.subs.length);break}return e}return e.op===T.Op.LITERAL&&(e.runes=e.runes.slice(t,e.runes.length),e.runes.length===0&&(e.op=T.Op.EMPTY_MATCH)),e}removeLeadingRegexp(e,t){if(e.op===T.Op.CONCAT&&e.subs.length>0){switch(t&&this.reuse(e.subs[0]),e.subs=e.subs.slice(1,e.subs.length),e.subs.length){case 0:e.op=T.Op.EMPTY_MATCH,e.subs=T.emptySubs();break;case 1:{const n=e;e=e.subs[0],this.reuse(n);break}}return e}return t&&this.reuse(e),this.newRegexp(T.Op.EMPTY_MATCH)}parseInternal(){if((this.flags&x.LITERAL)!==0)return U.literalRegexp(this.wholeRegexp,this.flags);let e=-1,t=-1,n=-1;const s=new Jw(this.wholeRegexp);for(;s.more();){let i=-1;e:switch(s.peek()){case b.CODES.get("("):if((this.flags&x.LOOKBEHIND)!==0){if(s.lookingAt("(?<=")){this.parsePosLookBehind(),s.skip(4);break}if(s.lookingAt("(?<!")){this.parseNegLookBehind(),s.skip(4);break}}if((this.flags&x.PERL_X)!==0&&s.lookingAt("(?")){this.parsePerlFlags(s);break}this.op(T.Op.LEFT_PAREN).cap=++this.numCap,s.skip(1);break;case b.CODES.get("|"):this.parseVerticalBar(),s.skip(1);break;case b.CODES.get(")"):this.parseRightParen(),s.skip(1);break;case b.CODES.get("^"):(this.flags&x.ONE_LINE)!==0?this.op(T.Op.BEGIN_TEXT):this.op(T.Op.BEGIN_LINE),s.skip(1);break;case b.CODES.get("$"):(this.flags&x.ONE_LINE)!==0?this.op(T.Op.END_TEXT).flags|=x.WAS_DOLLAR:this.op(T.Op.END_LINE),s.skip(1);break;case b.CODES.get("."):(this.flags&x.DOT_NL)!==0?this.op(T.Op.ANY_CHAR):this.op(T.Op.ANY_CHAR_NOT_NL),s.skip(1);break;case b.CODES.get("["):this.parseClass(s);break;case b.CODES.get("*"):case b.CODES.get("+"):case b.CODES.get("?"):{i=s.pos();let o=null;switch(s.pop()){case b.CODES.get("*"):o=T.Op.STAR;break;case b.CODES.get("+"):o=T.Op.PLUS;break;case b.CODES.get("?"):o=T.Op.QUEST;break}this.repeat(o,t,n,i,s,e);break}case b.CODES.get("{"):{i=s.pos();const o=U.parseRepeat(s);if(o<0){s.rewindTo(i),this.literal(s.pop());break}t=o>>16,n=(o&W.MAX_BMP)<<16>>16,this.repeat(T.Op.REPEAT,t,n,i,s,e);break}case b.CODES.get("\\"):{const o=s.pos();if(s.skip(1),(this.flags&x.PERL_X)!==0&&s.more())switch(s.pop()){case b.CODES.get("A"):this.op(T.Op.BEGIN_TEXT);break e;case b.CODES.get("b"):this.op(T.Op.WORD_BOUNDARY);break e;case b.CODES.get("B"):this.op(T.Op.NO_WORD_BOUNDARY);break e;case b.CODES.get("C"):throw new _e(U.ERR_INVALID_ESCAPE,"\\C");case b.CODES.get("Q"):{let u=s.rest();const h=u.indexOf("\\E");h>=0?(u=u.substring(0,h),s.skipString(u),s.skipString("\\E")):s.skipString(u);let d=0;for(;d<u.length;){const p=u.codePointAt(d);this.literal(p),d+=$.charCount(p)}break e}case b.CODES.get("z"):this.op(T.Op.END_TEXT);break e;default:s.rewindTo(o);break}else s.rewindTo(o);const B=this.newRegexp(T.Op.CHAR_CLASS);if(B.flags=this.flags,s.lookingAt("\\p")||s.lookingAt("\\P")){const u=new Nn;if(this.parseUnicodeClass(s,u)){B.runes=u.toArray(),this.push(B);break e}}const c=new Nn;if(this.parsePerlClassEscape(s,c)){B.runes=c.toArray(),this.push(B);break e}s.rewindTo(o),this.reuse(B),this.literal(U.parseEscape(s));break}default:this.literal(s.pop());break}e=i}if(this.concat(),this.swapVerticalBar()&&this.pop(),this.alternate(),this.stack.length!==1)throw new _e(U.ERR_MISSING_PAREN,this.wholeRegexp);return this.stack[0].namedGroups=this.namedGroups,this.stack[0]}parsePerlFlags(e){const t=e.pos(),n=e.rest();if(n.startsWith("(?P<")||n.startsWith("(?<")){const B=n.charAt(2)==="P"?4:3,c=n.indexOf(">");if(c<0)throw new _e(U.ERR_INVALID_NAMED_CAPTURE,n);const u=n.substring(B,c);if(e.skipString(u),e.skip(B+1),!U.isValidCaptureName(u))throw new _e(U.ERR_INVALID_NAMED_CAPTURE,n.substring(0,c+1));const h=this.op(T.Op.LEFT_PAREN);if(h.cap=++this.numCap,this.namedGroups[u])throw new _e(U.ERR_DUPLICATE_NAMED_CAPTURE,u);this.namedGroups[u]=this.numCap,h.name=u;return}e.skip(2);let s=this.flags,i=1,o=!1;e:for(;e.more();){const B=e.pop();switch(B){case b.CODES.get("i"):s|=x.FOLD_CASE,o=!0;break;case b.CODES.get("m"):s&=-17,o=!0;break;case b.CODES.get("s"):s|=x.DOT_NL,o=!0;break;case b.CODES.get("U"):s|=x.NON_GREEDY,o=!0;break;case b.CODES.get("-"):if(i<0)break e;i=-1,s=~s,o=!1;break;case b.CODES.get(":"):case b.CODES.get(")"):if(i<0){if(!o)break e;s=~s}B===b.CODES.get(":")&&this.op(T.Op.LEFT_PAREN),this.flags=s;return;default:break e}}throw new _e(U.ERR_INVALID_PERL_OP,e.from(t))}parsePosLookBehind(){const e=this.newRegexp(T.Op.LEFT_PAREN);return e.flags=this.flags,e.lb=++this.nlb,this.push(e)}parseNegLookBehind(){const e=this.newRegexp(T.Op.LEFT_PAREN);return e.flags=this.flags,e.lb=-++this.nlb,this.push(e)}parseVerticalBar(){this.concat(),this.swapVerticalBar()||this.op(T.Op.VERTICAL_BAR)}swapVerticalBar(){const e=this.stack.length;if(e>=3&&this.stack[e-2].op===T.Op.VERTICAL_BAR&&U.isCharClass(this.stack[e-1])&&U.isCharClass(this.stack[e-3])){let t=this.stack[e-1],n=this.stack[e-3];if(t.op>n.op){const s=n;n=t,t=s,this.stack[e-3]=n}return U.mergeCharClass(n,t),this.reuse(t),this.pop(),!0}if(e>=2){const t=this.stack[e-1],n=this.stack[e-2];if(n.op===T.Op.VERTICAL_BAR)return e>=3&&this.cleanAlt(this.stack[e-3]),this.stack[e-2]=t,this.stack[e-1]=n,!0}return!1}parseRightParen(){if(this.concat(),this.swapVerticalBar()&&this.pop(),this.alternate(),this.stack.length<2)throw new _e(U.ERR_UNEXPECTED_PAREN,this.wholeRegexp);const e=this.pop(),t=this.pop();if(t.op!==T.Op.LEFT_PAREN)throw new _e(U.ERR_UNEXPECTED_PAREN,this.wholeRegexp);if(this.flags=t.flags,t.lb!==0){if(U.hasCapture(e))throw new _e(U.ERR_INVALID_CAPTURE_IN_LOOKBEHIND,this.wholeRegexp);t.lb>0?t.op=T.Op.PLB:t.op=T.Op.NLB,t.subs=[e],this.push(t);return}t.cap===0?this.push(e):(t.op=T.Op.CAPTURE,t.subs=[e],this.push(t))}parsePerlClassEscape(e,t){const n=e.pos();if((this.flags&x.PERL_X)===0||!e.more()||e.pop()!==b.CODES.get("\\")||!e.more())return!1;e.pop();const s=e.from(n),i=Ph.has(s)?Ph.get(s):null;return i===null?!1:(t.appendGroup(i,(this.flags&x.FOLD_CASE)!==0),!0)}parseNamedClass(e,t){const n=e.rest(),s=n.indexOf(":]");if(s<0)return!1;const i=n.substring(0,s+2);e.skipString(i);const o=jh.has(i)?jh.get(i):null;if(o===null)throw new _e(U.ERR_INVALID_CHAR_RANGE,i);return t.appendGroup(o,(this.flags&x.FOLD_CASE)!==0),!0}parseUnicodeClass(e,t){const n=e.pos();if((this.flags&x.UNICODE_GROUPS)===0||!e.lookingAt("\\p")&&!e.lookingAt("\\P"))return!1;e.skip(1);let s=1,i=e.pop();if(i===b.CODES.get("P")&&(s=-1),!e.more())throw e.rewindTo(n),new _e(U.ERR_INVALID_CHAR_RANGE,e.rest());i=e.pop();let o;if(i!==b.CODES.get("{"))o=$.runeToString(i);else{const h=e.rest(),d=h.indexOf("}");if(d<0)throw e.rewindTo(n),new _e(U.ERR_INVALID_CHAR_RANGE,e.rest());o=h.substring(0,d),e.skipString(o),e.skip(1)}o.length!==0&&o.codePointAt(0)===b.CODES.get("^")&&(s=0-s,o=o.substring(1));const B=U.unicodeTable(o);if(B===null)throw new _e(U.ERR_INVALID_CHAR_RANGE,e.from(n));B.sign<0&&(s=0-s);const c=B.tab,u=B.fold;if((this.flags&x.FOLD_CASE)===0||u===null)t.appendTableWithSign(c,s);else{const h=new Nn().appendTable(c).appendTable(u).cleanClass().toArray();t.appendClassWithSign(h,s)}return!0}parseClass(e){const t=e.pos();e.skip(1);const n=this.newRegexp(T.Op.CHAR_CLASS);n.flags=this.flags;const s=new Nn;let i=1;e.more()&&e.lookingAt("^")&&(i=-1,e.skip(1),(this.flags&x.CLASS_NL)===0&&s.appendRange(b.CODES.get(`
`),b.CODES.get(`
`)));let o=!0;for(;!e.more()||e.peek()!==b.CODES.get("]")||o;){if(e.more()&&e.lookingAt("-")&&(this.flags&x.PERL_X)===0&&!o){const h=e.rest();if(h==="-"||!h.startsWith("-]"))throw e.rewindTo(t),new _e(U.ERR_INVALID_CHAR_RANGE,e.rest())}o=!1;const B=e.pos();if(e.lookingAt("[:")){if(this.parseNamedClass(e,s))continue;e.rewindTo(B)}if(this.parseUnicodeClass(e,s)||this.parsePerlClassEscape(e,s))continue;e.rewindTo(B);const c=U.parseClassChar(e,t);let u=c;if(e.more()&&e.lookingAt("-")){if(e.skip(1),e.more()&&e.lookingAt("]"))e.skip(-1);else if(u=U.parseClassChar(e,t),u<c)throw new _e(U.ERR_INVALID_CHAR_RANGE,e.from(B))}(this.flags&x.FOLD_CASE)===0?s.appendRange(c,u):s.appendFoldedRange(c,u)}e.skip(1),s.cleanClass(),i<0&&s.negateClass(),n.runes=s.toArray(),this.push(n)}},G(U,"ERR_INTERNAL_ERROR","regexp/syntax: internal error"),G(U,"ERR_INVALID_CHAR_RANGE","invalid character class range"),G(U,"ERR_INVALID_ESCAPE","invalid escape sequence"),G(U,"ERR_INVALID_NAMED_CAPTURE","invalid named capture"),G(U,"ERR_INVALID_PERL_OP","invalid or unsupported Perl syntax"),G(U,"ERR_INVALID_REPEAT_OP","invalid nested repetition operator"),G(U,"ERR_INVALID_REPEAT_SIZE","invalid repeat count"),G(U,"ERR_MISSING_BRACKET","missing closing ]"),G(U,"ERR_MISSING_PAREN","missing closing )"),G(U,"ERR_MISSING_REPEAT_ARGUMENT","missing argument to repetition operator"),G(U,"ERR_TRAILING_BACKSLASH","trailing backslash at end of expression"),G(U,"ERR_DUPLICATE_NAMED_CAPTURE","duplicate capture group name"),G(U,"ERR_UNEXPECTED_PAREN","unexpected )"),G(U,"ERR_NESTING_DEPTH","expression nests too deeply"),G(U,"ERR_LARGE","expression too large"),G(U,"ERR_INVALID_CAPTURE_IN_LOOKBEHIND","invalid capture in lookbehind"),G(U,"MAX_HEIGHT",1e3),G(U,"MAX_SIZE",3355443),G(U,"MAX_RUNES",33554432),G(U,"ANY_TABLE",new g(new Uint32Array([0,W.MAX_RUNE,1]))),G(U,"ASCII_TABLE",new g(new Uint32Array([0,127,1]))),G(U,"ASCII_FOLD_TABLE",new g(new Uint32Array([0,127,1,383,383,1,8490,8490,1]))),U),qw=class dr{static initTest(e){const t=dr.compile(e),n=new dr(t.expr,t.prog,t.numSubexp,t.longest);return n.cond=t.cond,n.prefix=t.prefix,n.prefixUTF8=t.prefixUTF8,n.prefixComplete=t.prefixComplete,n.prefixRune=t.prefixRune,n.prefilter=t.prefilter,n}static compile(e){return dr.compileImpl(e,x.PERL,!1)}static compilePOSIX(e){return dr.compileImpl(e,x.POSIX,!0)}static compileImpl(e,t,n){let s=jw.parse(e,t);const i=s.maxCap();s=Hw.simplify(s);const o=Mw.build(s),B=Uw.compileRegexp(s),c=new dr(e,B,i,n);c.prefilter=o.type===de.Type.NONE?null:o;const[u,h]=B.prefix();return c.prefixComplete=u,c.prefix=h,c.prefixUTF8=$.stringToUtf8ByteArray(c.prefix),c.prefix.length>0&&(c.prefixRune=c.prefix.codePointAt(0)),c.namedGroups=s.namedGroups,c}static match(e,t){return dr.compile(e).match(t)}constructor(e,t,n=0,s=0){this.expr=e,this.prog=t,this.numSubexp=n,this.longest=s,this.cond=t.startCond(),this.prefix=null,this.prefixUTF8=null,this.prefixComplete=!1,this.prefixRune=0,this.machinePool=[],this.dfa=new Pw(this.prog),this.onepass=yh.compile(this.prog),this.prefilter=null}matchPrefixComplete(e,t,n,s){if((n===x.ANCHOR_START||n===x.ANCHOR_BOTH)&&t!==0)return null;let i=-1,o=-1;const B=e.prefixLength(this);if(n===x.UNANCHORED){const c=e.index(this,t);if(c<0)return null;i=t+c,o=i+B}else if(n===x.ANCHOR_BOTH){if(e.endPos()!==B||e.index(this,0)!==0)return null;i=0,o=B}else if(n===x.ANCHOR_START){if(e.index(this,0)!==0)return null;i=0,o=B}if(i<0)return null;if(s>0){const c=new Int32Array(s).fill(-1);return c[0]=i,c[1]=o,Array.from(c)}return[]}executeEngine(e,t,n,s){if(this.prefixComplete&&(s===0||this.numSubexp===0))return this.matchPrefixComplete(e,t,n,s);if(this.prefilter!==null&&n===x.UNANCHORED&&!this.prefilter.eval(e,t))return null;if(this.onepass!==null)return yh.execute(this,e,t,n,s);if(s>0)return this.prog.numLb===0&&e.endPos()<=mo.maxBitStateLen(this.prog)?mo.execute(this,e,t,n,s):this.doExecuteNFA(e,t,n,s);if(this.prog.numLb===0){const i=this.dfa.match(e,t,n);if(i!==null)return i?[]:null;if(e.endPos()<=mo.maxBitStateLen(this.prog))return mo.execute(this,e,t,n,s)}return this.doExecuteNFA(e,t,n,s)}numberOfCapturingGroups(){return this.numSubexp}numberOfInstructions(){return this.prog.numInst()}get(){return this.machinePool.length>0?this.machinePool.pop():null}reset(){this.machinePool.length=0}put(e){this.machinePool.push(e)}toString(){return this.expr}doExecuteNFA(e,t,n,s){let i=this.get();i||(i=Aw.fromRE2(this)),i.init(s);const o=i.match(e,t,n)?i.submatches():null;return this.put(i),o}match(e){return this.executeEngine(Ie.fromUTF16(e),0,x.UNANCHORED,0)!==null}matchWithGroup(e,t,n,s,i){return e instanceof wr||($.isByteArray(e)?e=pr.utf8(e):e=pr.utf16(e)),this.matchMachineInput(e,t,n,s,i)}matchMachineInput(e,t,n,s,i){if(t>n)return[!1,null];const o=e.isUTF16Encoding()?Ie.fromUTF16(e.asCharSequence(),0,n):Ie.fromUTF8(e.asBytes(),0,n),B=this.executeEngine(o,t,s,2*i);return B===null?[!1,null]:[!0,B]}matchUTF8(e){return this.executeEngine(Ie.fromUTF8(e),0,x.UNANCHORED,0)!==null}replaceAll(e,t){return this.replaceAllFunc(e,()=>t,2*e.length+1)}replaceFirst(e,t){return this.replaceAllFunc(e,()=>t,1)}replaceAllFunc(e,t,n){let s=0,i=0,o="";const B=Ie.fromUTF16(e);let c=0;for(;i<=e.length;){const u=this.executeEngine(B,i,x.UNANCHORED,2);if(u===null||u.length===0)break;o+=e.substring(s,u[0]),(u[1]>s||u[0]===0)&&(o+=t(e.substring(u[0],u[1])),c++),s=u[1];const h=B.step(i)&7;if(i+h>u[1]?i+=h:i+1>u[1]?i++:i=u[1],c>=n)break}return o+=e.substring(s),o}pad(e){if(e===null)return null;let t=(1+this.numSubexp)*2;if(e.length<t){let n=new Array(t).fill(-1);for(let s=0;s<e.length;s++)n[s]=e[s];e=n}return e}allMatches(e,t,n=s=>s){let s=[];const i=e.endPos();t<0&&(t=i+1);let o=0,B=0,c=-1;for(;B<t&&o<=i;){const u=this.executeEngine(e,o,x.UNANCHORED,this.prog.numCap);if(u===null||u.length===0)break;let h=!0;if(u[1]===o){u[0]===c&&(h=!1);const d=e.step(o);d<0?o=i+1:o+=d&7}else o=u[1];c=u[1],h&&(s.push(n(this.pad(u))),B++)}return s}findUTF8(e){const t=this.executeEngine(Ie.fromUTF8(e),0,x.UNANCHORED,2);return t===null?null:e.slice(t[0],t[1])}findUTF8Index(e){const t=this.executeEngine(Ie.fromUTF8(e),0,x.UNANCHORED,2);return t===null?null:t.slice(0,2)}find(e){const t=this.executeEngine(Ie.fromUTF16(e),0,x.UNANCHORED,2);return t===null?"":e.substring(t[0],t[1])}findIndex(e){return this.executeEngine(Ie.fromUTF16(e),0,x.UNANCHORED,2)}findUTF8Submatch(e){const t=this.executeEngine(Ie.fromUTF8(e),0,x.UNANCHORED,this.prog.numCap);if(t===null)return null;const n=new Array(1+this.numSubexp).fill(null);for(let s=0;s<n.length;s++)2*s<t.length&&t[2*s]>=0&&(n[s]=e.slice(t[2*s],t[2*s+1]));return n}findUTF8SubmatchIndex(e){return this.pad(this.executeEngine(Ie.fromUTF8(e),0,x.UNANCHORED,this.prog.numCap))}findSubmatch(e){const t=this.executeEngine(Ie.fromUTF16(e),0,x.UNANCHORED,this.prog.numCap);if(t===null)return null;const n=new Array(1+this.numSubexp).fill(null);for(let s=0;s<n.length;s++)2*s<t.length&&t[2*s]>=0&&(n[s]=e.substring(t[2*s],t[2*s+1]));return n}findSubmatchIndex(e){return this.pad(this.executeEngine(Ie.fromUTF16(e),0,x.UNANCHORED,this.prog.numCap))}findAllUTF8(e,t){const n=this.allMatches(Ie.fromUTF8(e),t,s=>e.slice(s[0],s[1]));return n.length===0?null:n}findAllUTF8Index(e,t){const n=this.allMatches(Ie.fromUTF8(e),t,s=>s.slice(0,2));return n.length===0?null:n}findAll(e,t){const n=this.allMatches(Ie.fromUTF16(e),t,s=>e.substring(s[0],s[1]));return n.length===0?null:n}findAllIndex(e,t){const n=this.allMatches(Ie.fromUTF16(e),t,s=>s.slice(0,2));return n.length===0?null:n}findAllUTF8Submatch(e,t){const n=this.allMatches(Ie.fromUTF8(e),t,s=>{let i=new Array(s.length/2|0).fill(null);for(let o=0;o<i.length;o++)s[2*o]>=0&&(i[o]=e.slice(s[2*o],s[2*o+1]));return i});return n.length===0?null:n}findAllUTF8SubmatchIndex(e,t){const n=this.allMatches(Ie.fromUTF8(e),t);return n.length===0?null:n}findAllSubmatch(e,t){const n=this.allMatches(Ie.fromUTF16(e),t,s=>{let i=new Array(s.length/2|0).fill(null);for(let o=0;o<i.length;o++)s[2*o]>=0&&(i[o]=e.substring(s[2*o],s[2*o+1]));return i});return n.length===0?null:n}findAllSubmatchIndex(e,t){const n=this.allMatches(Ie.fromUTF16(e),t);return n.length===0?null:n}},Kw=class kr{static isHexadecimal(e){return"0"<=e&&e<="9"||"A"<=e&&e<="F"||"a"<=e&&e<="f"}static translate(e){let t="";if(e instanceof RegExp&&(e.ignoreCase&&(t+="i"),e.multiline&&(t+="m"),e.dotAll&&(t+="s"),e=e.source),typeof e!="string")return e;let n="",s=!1,i=e.length;i===0&&(n="(?:)",s=!0);let o=!1,B=0;for(;B<i;){let u=e[B];if(u==="\\"){if(B+1<i)switch(u=e[B+1],u){case"\\":n+="\\\\",B+=2;continue;case"c":if(B+2<i){let p=e[B+2].charCodeAt(0);if(p>=65&&p<=90||p>=97&&p<=122){let I=p%32;n+="\\x",n+=(I>>4).toString(16).toUpperCase(),n+=(I&15).toString(16).toUpperCase(),B+=3,s=!0;continue}}n+="c",B+=2,s=!0;continue;case"u":if(B+2<i){if(e[B+2]==="{"){let p=B+3,I=!1,R=!1;for(;p<i;){const k=e[p];if(k==="}"){R=!0;break}if(!kr.isHexadecimal(k))break;I=!0,p++}if(R&&I){n+="\\x",B+=2,s=!0;continue}}else if(B+5<i){let p=!0;for(let I=0;I<4;I++)if(!kr.isHexadecimal(e[B+2+I])){p=!1;break}if(p){n+="\\x{"+e.substring(B+2,B+6)+"}",B+=6,s=!0;continue}}}n+="u",B+=2,s=!0;continue;case"x":{let p=!1;if(B+2<i&&e[B+2]==="{"){let I=B+3,R=!1,k=!1;for(;I<i;){const M=e[I];if(M==="}"){k=!0;break}if(!kr.isHexadecimal(M))break;R=!0,I++}k&&R&&(p=!0)}else B+3<i&&kr.isHexadecimal(e[B+2])&&kr.isHexadecimal(e[B+3])&&(p=!0);p?(n+="\\x",B+=2):(n+="x",B+=2,s=!0);continue}case"n":case"r":case"t":case"a":case"f":case"v":case"d":case"D":case"s":case"S":case"w":case"W":case"b":case"B":case"p":case"P":case"A":case"z":case"Q":case"E":case"0":case"1":case"2":case"3":case"4":case"5":case"6":case"7":n+="\\"+u,B+=2;continue;default:{let p=e.codePointAt(B+1);if(p>=48&&p<=57||p>=65&&p<=90||p>=97&&p<=122){let I=$.charCount(p);n+=e.substring(B+1,B+1+I),B+=I+1,s=!0}else{n+="\\";let I=$.charCount(p);n+=e.substring(B+1,B+1+I),B+=I+1}continue}}}else if(u==="/"){n+="\\/",B+=1,s=!0;continue}else if(u==="[")o=!0;else if(u==="]")o=!1;else if(!o&&u==="("&&B+2<i&&e[B+1]==="?"&&e[B+2]==="<"&&B+3<i&&!"=!>)".includes(e[B+3])){n+="(?P<",B+=3,s=!0;continue}let h=e.codePointAt(B),d=$.charCount(h);n+=e.substring(B,B+d),B+=d}const c=s?n:e;return t.length>0?`(?${t})${c}`:c}},Fe,Lc=(Fe=class{static quote(e){return $.quoteMeta(e)}static quoteReplacement(e,t=!1){return _h.quoteReplacement(e,t)}static translateRegExp(e){return Kw.translate(e)}static compile(e,t=0){let n=e;if((t&Fe.CASE_INSENSITIVE)!==0&&(n=`(?i)${n}`),(t&Fe.DOTALL)!==0&&(n=`(?s)${n}`),(t&Fe.MULTILINE)!==0&&(n=`(?m)${n}`),(t&-544)!==0)throw new Tw("Flags should only be a combination of MULTILINE, DOTALL, CASE_INSENSITIVE, DISABLE_UNICODE_GROUPS, LONGEST_MATCH, LOOKBEHINDS");let s=x.PERL;(t&Fe.DISABLE_UNICODE_GROUPS)!==0&&(s&=-129),(t&Fe.LOOKBEHINDS)!==0&&(s|=x.LOOKBEHIND);const i=new Fe(e,t);return i.re2Input=qw.compileImpl(n,s,(t&Fe.LONGEST_MATCH)!==0),i}static matches(e,t){return Fe.compile(e).testExact(t)}static initTest(e,t,n){if(e==null)throw new Error("pattern is null");if(n==null)throw new Error("re2 is null");const s=new Fe(e,t);return s.re2Input=n,s}constructor(e,t){this.patternInput=e,this.flagsInput=t,this.re2Input=null}reset(){this.re2Input.reset()}flags(){return this.flagsInput}pattern(){return this.patternInput}re2(){return this.re2Input}matches(e){return this.testExact(e)}matcher(e){return $.isByteArray(e)&&(e=pr.utf8(e)),new _h(this,e)}test(e){return $.isByteArray(e)?this.re2Input.matchUTF8(e):this.re2Input.match(e)}testExact(e){const t=$.isByteArray(e)?Ie.fromUTF8(e):Ie.fromUTF16(e);return this.re2Input.executeEngine(t,0,x.ANCHOR_BOTH,0)!==null}exec(e){const t=this.matcher(e);if(!t.find())return null;const n=[t.group(0)];for(let i=1;i<=t.groupCount();i++){const o=t.group(i);n.push(o===null?void 0:o)}n.index=t.start(0),n.input=e;const s=this.namedGroups();if(Object.keys(s).length>0){const i=t.getNamedGroups();for(const o in i)i[o]===null&&(i[o]=void 0);n.groups=i}else n.groups=void 0;return n}split(e,t=0){const n=this.matcher(e),s=[];let i=0,o=0;for(;n.find();){if(o===0&&n.end()===0){o=n.end();continue}if(t>0&&s.length===t-1)break;if(o===n.start()){if(t===0){i+=1,o=n.end();continue}}else for(;i>0;)s.push(""),i-=1;s.push(n.substring(o,n.start())),o=n.end()}if(t===0&&o!==n.inputLength()){for(;i>0;)s.push(""),i-=1;s.push(n.substring(o,n.inputLength()))}return(t!==0||s.length===0&&!(o===n.inputLength()&&o>0))&&s.push(n.substring(o,n.inputLength())),s}*matchAll(e){const t=this.matcher(e);for(;t.find();){const n=[t.group(0)];for(let i=1;i<=t.groupCount();i++){const o=t.group(i);n.push(o===null?void 0:o)}n.index=t.start(0),n.input=e;const s=this.namedGroups();if(Object.keys(s).length>0){const i=t.getNamedGroups();for(const o in i)i[o]===null&&(i[o]=void 0);n.groups=i}else n.groups=void 0;yield n}}toString(){return this.patternInput}programSize(){return this.re2Input.numberOfInstructions()}groupCount(){return this.re2Input.numberOfCapturingGroups()}namedGroups(){return this.re2Input.namedGroups}equals(e){return this===e?!0:e===null||this.constructor!==e.constructor?!1:this.flagsInput===e.flagsInput&&this.patternInput===e.patternInput}},G(Fe,"CASE_INSENSITIVE",Lr.CASE_INSENSITIVE),G(Fe,"DOTALL",Lr.DOTALL),G(Fe,"MULTILINE",Lr.MULTILINE),G(Fe,"DISABLE_UNICODE_GROUPS",Lr.DISABLE_UNICODE_GROUPS),G(Fe,"LONGEST_MATCH",Lr.LONGEST_MATCH),G(Fe,"LOOKBEHINDS",Lr.LOOKBEHINDS),Fe);/**
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
 */let fs="12.18.0";function Ww(r){fs=r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */const Qn=new oa("@firebase/firestore");function Vr(){return Qn.logLevel}function aP(r){Qn.setLogLevel(r)}function K(r,...e){if(Qn.logLevel<=ce.DEBUG){const t=e.map(Fc);Qn.debug(`Firestore (${fs}): ${r}`,...t)}}function Dn(r,...e){if(Qn.logLevel<=ce.ERROR){const t=e.map(Fc);Qn.error(`Firestore (${fs}): ${r}`,...t)}}function Jt(r,...e){if(Qn.logLevel<=ce.WARN){const t=e.map(Fc);Qn.warn(`Firestore (${fs}): ${r}`,...t)}}function Fc(r){if(typeof r=="string")return r;try{return(function(t){return JSON.stringify(t)})(r)}catch{return r}}/**
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
 */function Y(r,e,t){let n="Unexpected state";typeof e=="string"?n=e:t=e,_C(r,n,t)}function _C(r,e,t){let n=`FIRESTORE (${fs}) INTERNAL ASSERTION FAILED: ${e} (ID: ${r.toString(16)})`;if(t!==void 0)try{n+=" CONTEXT: "+JSON.stringify(t)}catch{n+=" CONTEXT: "+t}throw Dn(n),new Error(n)}function Q(r,e,t,n){let s="Unexpected state";typeof t=="string"?s=t:n=t,r||_C(e,s,n)}function ne(r,e){return r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zw(r){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(r);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let n=0;n<r;n++)t[n]=Math.floor(256*Math.random());return t}/**
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
 */class kc{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let n="";for(;n.length<20;){const s=zw(40);for(let i=0;i<s.length;++i)n.length<20&&s[i]<t&&(n+=e.charAt(s[i]%62))}return n}}function Be(r,e){return r<e?-1:r>e?1:0}function YB(r,e){const t=Math.min(r.length,e.length);for(let n=0;n<t;n++){const s=r.charAt(n),i=e.charAt(n);if(s!==i)return PB(s)===PB(i)?Be(s,i):PB(s)?1:-1}return Be(r.length,e.length)}const Qw=55296,$w=57343;function PB(r){const e=r.charCodeAt(0);return e>=Qw&&e<=$w}function Yr(r,e,t){return r.length===e.length&&r.every(((n,s)=>t(n,e[s])))}/**
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
 */class Re{constructor(e,t){this.comparator=e,this.root=t||tt.EMPTY}insert(e,t){return new Re(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,tt.BLACK,null,null))}remove(e){return new Re(this.comparator,this.root.remove(e,this.comparator).copy(null,null,tt.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const n=this.comparator(e,t.key);if(n===0)return t.value;n<0?t=t.left:n>0&&(t=t.right)}return null}indexOf(e){let t=0,n=this.root;for(;!n.isEmpty();){const s=this.comparator(e,n.key);if(s===0)return t+n.left.size;s<0?n=n.left:(t+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal(((t,n)=>(e(t,n),!1)))}toString(){const e=[];return this.inorderTraversal(((t,n)=>(e.push(`${t}:${n}`),!1))),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new _o(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new _o(this.root,e,this.comparator,!1)}getReverseIterator(){return new _o(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new _o(this.root,e,this.comparator,!0)}}class _o{constructor(e,t,n,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?n(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class tt{constructor(e,t,n,s,i){this.key=e,this.value=t,this.color=n??tt.RED,this.left=s??tt.EMPTY,this.right=i??tt.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,n,s,i){return new tt(e??this.key,t??this.value,n??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,n){let s=this;const i=n(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,n),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,n)),s.fixUp()}removeMin(){if(this.left.isEmpty())return tt.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let n,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return tt.EMPTY;n=s.right.min(),s=s.copy(n.key,n.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,tt.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,tt.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw Y(43730,{key:this.key,value:this.value});if(this.right.isRed())throw Y(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw Y(27949);return e+(this.isRed()?0:1)}}tt.EMPTY=null,tt.RED=!0,tt.BLACK=!1;tt.EMPTY=new class{constructor(){this.size=0}get key(){throw Y(57766)}get value(){throw Y(16141)}get color(){throw Y(16727)}get left(){throw Y(29726)}get right(){throw Y(36894)}copy(e,t,n,s,i){return this}insert(e,t,n){return new tt(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class Ge{constructor(e){this.comparator=e,this.data=new Re(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal(((t,n)=>(e(t),!1)))}forEachInRange(e,t){const n=this.data.getIteratorFrom(e[0]);for(;n.hasNext();){const s=n.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let n;for(n=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();n.hasNext();)if(!e(n.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new qh(this.data.getIterator())}getIteratorFrom(e){return new qh(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach((n=>{t=t.add(n)})),t}isEqual(e){if(!(e instanceof Ge)||this.size!==e.size)return!1;const t=this.data.getIterator(),n=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=n.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach((t=>{e.push(t)})),e}toString(){const e=[];return this.forEach((t=>e.push(t))),"SortedSet("+e.toString()+")"}copy(e){const t=new Ge(this.comparator);return t.data=e,t}}class qh{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
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
 */const F={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class H extends yn{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */const zt="__name__";class Wt{constructor(e,t,n){t===void 0?t=0:t>e.length&&Y(637,{offset:t,range:e.length}),n===void 0?n=e.length-t:n>e.length-t&&Y(1746,{length:n,range:e.length-t}),this.segments=e,this.offset=t,this.len=n}get length(){return this.len}isEqual(e){return Wt.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Wt?e.forEach((n=>{t.push(n)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,n=this.limit();t<n;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const n=Math.min(e.length,t.length);for(let s=0;s<n;s++){const i=Wt.compareSegments(e.get(s),t.get(s));if(i!==0)return i}return Be(e.length,t.length)}static compareSegments(e,t){const n=Wt.isNumericId(e),s=Wt.isNumericId(t);return n&&!s?-1:!n&&s?1:n&&s?Wt.extractNumericId(e).compare(Wt.extractNumericId(t)):YB(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Jn.fromString(e.substring(4,e.length-2))}}class Ce extends Wt{construct(e,t,n){return new Ce(e,t,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toStringWithLeadingSlash(){return`/${this.canonicalString()}`}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const n of e){if(n.indexOf("//")>=0)throw new H(F.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);t.push(...n.split("/").filter((s=>s.length>0)))}return new Ce(t)}static emptyPath(){return new Ce([])}}const Yw=/^[_a-zA-Z][_a-zA-Z0-9]*$/;let St=class xr extends Wt{construct(e,t,n){return new xr(e,t,n)}static isValidIdentifier(e){return Yw.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),xr.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===zt}static keyField(){return new xr([zt])}static fromServerFormat(e){const t=[];let n="",s=0;const i=()=>{if(n.length===0)throw new H(F.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(n),n=""};let o=!1;for(;s<e.length;){const B=e[s];if(B==="\\"){if(s+1===e.length)throw new H(F.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const c=e[s+1];if(c!=="\\"&&c!=="."&&c!=="`")throw new H(F.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);n+=c,s+=2}else B==="`"?(o=!o,s++):B!=="."||o?(n+=B,s++):(i(),s++)}if(i(),o)throw new H(F.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new xr(t)}static emptyPath(){return new xr([])}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vt{constructor(e){this.fields=e,e.sort(St.comparator)}static empty(){return new vt([])}unionWith(e){let t=new Ge(St.comparator);for(const n of this.fields)t=t.add(n);for(const n of e)t=t.add(n);return new vt(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Yr(this.fields,e.fields,((t,n)=>t.isEqual(n)))}}/**
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
 */function Ho(r){let e=0;for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e++;return e}function ir(r,e){for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e(t,r[t])}function Xw(r,e){const t=[];for(const n in r)Object.prototype.hasOwnProperty.call(r,n)&&t.push(e(r[n],n,r));return t}function DC(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}/**
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
 */class X{constructor(e){this.path=e}static fromPath(e){return new X(Ce.fromString(e))}static fromName(e){return new X(Ce.fromString(e).popFirst(5))}static empty(){return new X(Ce.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&Ce.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return Ce.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new X(new Ce(e.slice()))}}/**
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
 */function IC(r,e,t){if(!t)throw new H(F.INVALID_ARGUMENT,`Function ${r}() cannot be called with an empty ${e}.`)}function Zw(r,e,t,n){if(e===!0&&n===!0)throw new H(F.INVALID_ARGUMENT,`${r} and ${t} cannot be used together.`)}function Kh(r){if(!X.isDocumentKey(r))throw new H(F.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${r} has ${r.length}.`)}function Wh(r){if(X.isDocumentKey(r))throw new H(F.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${r} has ${r.length}.`)}function Fi(r){return typeof r=="object"&&r!==null&&(Object.getPrototypeOf(r)===Object.prototype||Object.getPrototypeOf(r)===null)}function ga(r){if(r===void 0)return"undefined";if(r===null)return"null";if(typeof r=="string")return r.length>20&&(r=`${r.substring(0,20)}...`),JSON.stringify(r);if(typeof r=="number"||typeof r=="boolean")return""+r;if(typeof r=="object"){if(r instanceof Array)return"an array";{const e=(function(n){return n.constructor?n.constructor.name:null})(r);return e?`a custom ${e} object`:"an object"}}return typeof r=="function"?"a function":Y(12329,{type:typeof r})}function Ze(r,e){if("_delegate"in r&&(r=r._delegate),!(r instanceof e)){if(e.name===r.constructor.name)throw new H(F.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=ga(r);throw new H(F.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return r}function ey(r,e){if(e<=0)throw new H(F.INVALID_ARGUMENT,`Function ${r}() requires a positive number, but it was: ${e}.`)}/**
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
 */function Me(r,e){const t={typeString:r};return e&&(t.value=e),t}function ki(r,e){if(!Fi(r))throw new H(F.INVALID_ARGUMENT,"JSON must be an object");let t;for(const n in e)if(e[n]){const s=e[n].typeString,i="value"in e[n]?{value:e[n].value}:void 0;if(!(n in r)){t=`JSON missing required field: '${n}'`;break}const o=r[n];if(s&&typeof o!==s){t=`JSON field '${n}' must be a ${s}.`;break}if(i!==void 0&&o!==i.value){t=`Expected '${n}' field to equal '${i.value}'`;break}}if(t)throw new H(F.INVALID_ARGUMENT,t);return!0}/**
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
 */const zh=-62135596800,Qh=1e6;class ye{static now(){return ye.fromMillis(Date.now())}static fromDate(e){return ye.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),n=Math.floor((e-1e3*t)*Qh);return new ye(t,n)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new H(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new H(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<zh)throw new H(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new H(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Qh}_compareTo(e){return this.seconds===e.seconds?Be(this.nanoseconds,e.nanoseconds):Be(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:ye._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(ki(e,ye._jsonSchema))return new ye(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-zh;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}ye._jsonSchemaVersion="firestore/timestamp/1.0",ye._jsonSchema={type:Me("string",ye._jsonSchemaVersion),seconds:Me("number"),nanoseconds:Me("number")};/**
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
 */class wC extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ue{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new wC("Invalid base64 string: "+i):i}})(e);return new Ue(t)}static fromUint8Array(e){const t=(function(s){let i="";for(let o=0;o<s.length;++o)i+=String.fromCharCode(s[o]);return i})(e);return new Ue(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const n=new Uint8Array(t.length);for(let s=0;s<t.length;s++)n[s]=t.charCodeAt(s);return n})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Be(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Ue.EMPTY_BYTE_STRING=new Ue("");const ty=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function $n(r){if(Q(!!r,39018),typeof r=="string"){let e=0;const t=ty.exec(r);if(Q(!!t,46558,{timestamp:r}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const n=new Date(r);return{seconds:Math.floor(n.getTime()/1e3),nanos:e}}return{seconds:ve(r.seconds),nanos:ve(r.nanos)}}function ve(r){return typeof r=="number"?r:typeof r=="string"?Number(r):0}function Yn(r){return typeof r=="string"?Ue.fromBase64String(r):Ue.fromUint8Array(r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yC="server_timestamp",TC="__type__",AC="__previous_value__",RC="__local_write_time__";function ma(r){var t,n;return((n=(((t=r==null?void 0:r.mapValue)==null?void 0:t.fields)||{})[TC])==null?void 0:n.stringValue)===yC}function Vi(r){const e=r.mapValue.fields[AC];return ma(e)?Vi(e):e}function Xr(r){const e=$n(r.mapValue.fields[RC].timestampValue);return new ye(e.seconds,e.nanos)}/**
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
 */class ny{constructor(e,t,n,s,i,o,B,c,u,h,d,p,I){this.databaseId=e,this.appId=t,this.persistenceKey=n,this.host=s,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=B,this.longPollingOptions=c,this.useFetchStreams=u,this.isUsingEmulator=h,this.apiKey=d,this._customHeaders=p,this.grpcFlowControlWindow=I}}const Ci="(default)";class pi{constructor(e,t){this.projectId=e,this.database=t||Ci}static empty(){return new pi("","")}get isDefaultDatabase(){return this.database===Ci}isEqual(e){return e instanceof pi&&e.projectId===this.projectId&&e.database===this.database}}function ry(r,e){if(!Object.prototype.hasOwnProperty.apply(r.options,["projectId"]))throw new H(F.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new pi(r.options.projectId,e)}/**
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
 */const Vc=-1;function xi(r){return r==null}function gi(r){return r===0&&1/r==-1/0}function sy(r){return typeof r=="number"&&Number.isInteger(r)&&!gi(r)&&r<=Number.MAX_SAFE_INTEGER&&r>=Number.MIN_SAFE_INTEGER}function iy(r){return typeof r=="string"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vC="__type__",oy="__max__",Do={mapValue:{}},PC="__vector__",mi="value",Zr={nullValue:"NULL_VALUE"},Dt={booleanValue:!0},Xe={booleanValue:!1};function He(r){return"nullValue"in r?0:"booleanValue"in r?1:"integerValue"in r||"doubleValue"in r?2:"timestampValue"in r?3:"stringValue"in r?5:"bytesValue"in r?6:"referenceValue"in r?7:"geoPointValue"in r?8:"arrayValue"in r?9:"mapValue"in r?ma(r)?4:ay(r)?9007199254740991:Jo(r)?10:11:Y(28295,{value:r})}function Gt(r,e,t){if(r===e)return!0;const n=He(r);if(n!==He(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return r.booleanValue===e.booleanValue;case 4:return Xr(r).isEqual(Xr(e));case 3:return(function(i,o){if(typeof i.timestampValue=="string"&&typeof o.timestampValue=="string"&&i.timestampValue.length===o.timestampValue.length)return i.timestampValue===o.timestampValue;const B=$n(i.timestampValue),c=$n(o.timestampValue);return B.seconds===c.seconds&&B.nanos===c.nanos})(r,e);case 5:return r.stringValue===e.stringValue;case 6:return(function(i,o){return Yn(i.bytesValue).isEqual(Yn(o.bytesValue))})(r,e);case 7:return r.referenceValue===e.referenceValue;case 8:return(function(i,o){return ve(i.geoPointValue.latitude)===ve(o.geoPointValue.latitude)&&ve(i.geoPointValue.longitude)===ve(o.geoPointValue.longitude)})(r,e);case 2:return(function(i,o,B){if("integerValue"in i&&"integerValue"in o)return ve(i.integerValue)===ve(o.integerValue);let c,u;if("doubleValue"in i&&"doubleValue"in o)c=ve(i.doubleValue),u=ve(o.doubleValue);else{if(!(B!=null&&B.t))return!1;c=ve(i.integerValue??i.doubleValue),u=ve(o.integerValue??o.doubleValue)}return c===u?!!(B!=null&&B.i)||gi(c)===gi(u):!!(B===void 0||B.o)&&isNaN(c)&&isNaN(u)})(r,e,t);case 9:return Yr(r.arrayValue.values||[],e.arrayValue.values||[],((s,i)=>Gt(s,i,t)));case 10:case 11:return(function(i,o,B){const c=i.mapValue.fields||{},u=o.mapValue.fields||{};if(Ho(c)!==Ho(u))return!1;for(const h in c)if(c.hasOwnProperty(h)&&(u[h]===void 0||!Gt(c[h],u[h],B)))return!1;return!0})(r,e,t);default:return Y(52216,{left:r})}}function Ei(r,e){return(r.values||[]).find((t=>Gt(t,e)))!==void 0}function It(r,e){if(r===e)return 0;const t=He(r),n=He(e);if(t!==n)return Be(t,n);switch(t){case 0:case 9007199254740991:return 0;case 1:return Be(r.booleanValue,e.booleanValue);case 2:return(function(i,o){const B=ve(i.integerValue||i.doubleValue),c=ve(o.integerValue||o.doubleValue);return B<c?-1:B>c?1:B===c?0:isNaN(B)?isNaN(c)?0:-1:1})(r,e);case 3:return $h(r.timestampValue,e.timestampValue);case 4:return $h(Xr(r),Xr(e));case 5:return YB(r.stringValue,e.stringValue);case 6:return(function(i,o){const B=Yn(i),c=Yn(o);return B.compareTo(c)})(r.bytesValue,e.bytesValue);case 7:return(function(i,o){const B=i.split("/"),c=o.split("/");for(let u=0;u<B.length&&u<c.length;u++){const h=Be(B[u],c[u]);if(h!==0)return h}return Be(B.length,c.length)})(r.referenceValue,e.referenceValue);case 8:return(function(i,o){const B=Be(ve(i.latitude),ve(o.latitude));return B!==0?B:Be(ve(i.longitude),ve(o.longitude))})(r.geoPointValue,e.geoPointValue);case 9:return Yh(r.arrayValue,e.arrayValue);case 10:return(function(i,o){var p,I,R,k;const B=i.fields||{},c=o.fields||{},u=(p=B[mi])==null?void 0:p.arrayValue,h=(I=c[mi])==null?void 0:I.arrayValue,d=Be(((R=u==null?void 0:u.values)==null?void 0:R.length)||0,((k=h==null?void 0:h.values)==null?void 0:k.length)||0);return d!==0?d:Yh(u,h)})(r.mapValue,e.mapValue);case 11:return(function(i,o){if(i===Do.mapValue&&o===Do.mapValue)return 0;if(i===Do.mapValue)return 1;if(o===Do.mapValue)return-1;const B=i.fields||{},c=Object.keys(B),u=o.fields||{},h=Object.keys(u);c.sort(),h.sort();for(let d=0;d<c.length&&d<h.length;++d){const p=YB(c[d],h[d]);if(p!==0)return p;const I=It(B[c[d]],u[h[d]]);if(I!==0)return I}return Be(c.length,h.length)})(r.mapValue,e.mapValue);default:throw Y(23264,{u:t})}}function $h(r,e){if(typeof r=="string"&&typeof e=="string"&&r.length===e.length)return Be(r,e);const t=$n(r),n=$n(e),s=Be(t.seconds,n.seconds);return s!==0?s:Be(t.nanos,n.nanos)}function Yh(r,e){const t=r.values||[],n=e.values||[];for(let s=0;s<t.length&&s<n.length;++s){const i=It(t[s],n[s]);if(i!==void 0&&i!==0)return i}return Be(t.length,n.length)}function es(r){return XB(r)}function XB(r){return"nullValue"in r?"null":"booleanValue"in r?""+r.booleanValue:"integerValue"in r?""+r.integerValue:"doubleValue"in r?""+r.doubleValue:"timestampValue"in r?(function(t){const n=$n(t);return`time(${n.seconds},${n.nanos})`})(r.timestampValue):"stringValue"in r?r.stringValue:"bytesValue"in r?(function(t){return Yn(t).toBase64()})(r.bytesValue):"referenceValue"in r?(function(t){return X.fromName(t).toString()})(r.referenceValue):"geoPointValue"in r?(function(t){return`geo(${t.latitude},${t.longitude})`})(r.geoPointValue):"arrayValue"in r?(function(t){let n="[",s=!0;for(const i of t.values||[])s?s=!1:n+=",",n+=XB(i);return n+"]"})(r.arrayValue):"mapValue"in r?(function(t){const n=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const o of n)i?i=!1:s+=",",s+=`${o}:${XB(t.fields[o])}`;return s+"}"})(r.mapValue):Y(61005,{value:r})}function So(r){switch(He(r)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=Vi(r);return e?16+So(e):16;case 5:return 2*r.stringValue.length;case 6:return Yn(r.bytesValue).approximateByteSize();case 7:return r.referenceValue.length;case 9:return(function(n){return(n.values||[]).reduce(((s,i)=>s+So(i)),0)})(r.arrayValue);case 10:case 11:return(function(n){let s=0;return ir(n.fields,((i,o)=>{s+=i.length+So(o)})),s})(r.mapValue);default:throw Y(13486,{value:r})}}function Xh(r,e){return{referenceValue:`projects/${r.projectId}/databases/${r.database}/documents/${e.path.canonicalString()}`}}function Qt(r){return!!r&&"integerValue"in r}function gr(r){return!!r&&"doubleValue"in r}function Xn(r){return Qt(r)||gr(r)}function ts(r){return!!r&&"arrayValue"in r}function Pt(r){return!!r&&"nullValue"in r}function wt(r){return!!r&&"doubleValue"in r&&isNaN(Number(r.doubleValue))}function Er(r){return!!r&&"mapValue"in r}function Jo(r){var t,n;return((n=(((t=r==null?void 0:r.mapValue)==null?void 0:t.fields)||{})[vC])==null?void 0:n.stringValue)===PC}function ZB(r){var e,t;return(t=(((e=r==null?void 0:r.mapValue)==null?void 0:e.fields)||{})[mi])==null?void 0:t.arrayValue}function ei(r){if(r.geoPointValue)return{geoPointValue:{...r.geoPointValue}};if(r.timestampValue&&typeof r.timestampValue=="object")return{timestampValue:{...r.timestampValue}};if(r.mapValue){const e={mapValue:{fields:{}}};return ir(r.mapValue.fields,((t,n)=>e.mapValue.fields[t]=ei(n))),e}if(r.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(r.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=ei(r.arrayValue.values[t]);return e}return{...r}}function ay(r){return(((r.mapValue||{}).fields||{}).__type__||{}).stringValue===oy}/**
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
 */class ot{constructor(e){this.value=e}static empty(){return new ot({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let n=0;n<e.length-1;++n)if(t=(t.mapValue.fields||{})[e.get(n)],!Er(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=ei(t)}setAll(e){let t=St.emptyPath(),n={},s=[];e.forEach(((o,B)=>{if(!t.isImmediateParentOf(B)){const c=this.getFieldsMap(t);this.applyChanges(c,n,s),n={},s=[],t=B.popLast()}o?n[B.lastSegment()]=ei(o):s.push(B.lastSegment())}));const i=this.getFieldsMap(t);this.applyChanges(i,n,s)}delete(e){const t=this.field(e.popLast());Er(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Gt(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let n=0;n<e.length;++n){let s=t.mapValue.fields[e.get(n)];Er(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(n)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,n){ir(t,((s,i)=>e[s]=i));for(const s of n)delete e[s]}clone(){return new ot(ei(this.value))}}function SC(r){const e=[];return ir(r.fields,((t,n)=>{const s=new St([t]);if(Er(n)){const i=SC(n.mapValue).fields;if(i.length===0)e.push(s);else for(const o of i)e.push(s.child(o))}else e.push(s)})),new vt(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ea(r,e){if(r.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:gi(e)?"-0":e}}function xc(r){return{integerValue:""+r}}function _a(r,e,t){return sy(e)?xc(e):Ea(r,e)}/**
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
 */class Da{constructor(){this._=void 0}}function By(r,e,t){return r instanceof _i?(function(s,i){const o={fields:{[TC]:{stringValue:yC},[RC]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&ma(i)&&(i=Vi(i)),i&&(o.fields[AC]=i),{mapValue:o}})(t,e):r instanceof ns?bC(r,e):r instanceof Di?NC(r,e):r instanceof rs?(function(s,i){const o=OC(s,i),B=Ko(o)+Ko(s.l);return Qt(o)&&Qt(s.l)?xc(B):Ea(s.serializer,B)})(r,e):r instanceof jo?(function(s,i){return Zh(s,i,Math.min)})(r,e):r instanceof qo?(function(s,i){return Zh(s,i,Math.max)})(r,e):void 0}function cy(r,e,t){return r instanceof ns?bC(r,e):r instanceof Di?NC(r,e):t}function OC(r,e){return r instanceof rs?Xn(e)?e:{integerValue:0}:null}class _i extends Da{}class ns extends Da{constructor(e){super(),this.elements=e}}function bC(r,e){const t=LC(e);for(const n of r.elements)t.some((s=>Gt(s,n)))||t.push(n);return{arrayValue:{values:t}}}class Di extends Da{constructor(e){super(),this.elements=e}}function NC(r,e){let t=LC(e);for(const n of r.elements)t=t.filter((s=>!Gt(s,n)));return{arrayValue:{values:t}}}class Mc extends Da{constructor(e,t){super(),this.serializer=e,this.l=t}}class rs extends Mc{}class jo extends Mc{}class qo extends Mc{}function Zh(r,e,t){if(!Xn(e))return r.l;const n=t(Ko(e),Ko(r.l));return Qt(e)&&Qt(r.l)?xc(n):Ea(r.serializer,n)}function Ko(r){return ve(r.integerValue||r.doubleValue)}function LC(r){return ts(r)&&r.arrayValue.values?r.arrayValue.values.slice():[]}/**
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
 */class Gc{constructor(e,t){this.field=e,this.transform=t}}function uy(r,e){return r.field.isEqual(e.field)&&(function(n,s){return n instanceof ns&&s instanceof ns||n instanceof Di&&s instanceof Di?Yr(n.elements,s.elements,Gt):n instanceof rs&&s instanceof rs||n instanceof jo&&s instanceof jo||n instanceof qo&&s instanceof qo?Gt(n.l,s.l):n instanceof _i&&s instanceof _i})(r.transform,e.transform)}class ly{constructor(e,t){this.version=e,this.transformResults=t}}class Ve{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Ve}static exists(e){return new Ve(void 0,e)}static updateTime(e){return new Ve(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Oo(r,e){return r.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(r.updateTime):r.exists===void 0||r.exists===e.isFoundDocument()}class Ia{}function FC(r,e){if(!r.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return r.isNoDocument()?new Gi(r.key,Ve.none()):new Mi(r.key,r.data,Ve.none());{const t=r.data,n=ot.empty();let s=new Ge(St.comparator);for(let i of e.fields)if(!s.has(i)){let o=t.field(i);o===null&&i.length>1&&(i=i.popLast(),o=t.field(i)),o===null?n.delete(i):n.set(i,o),s=s.add(i)}return new or(r.key,n,new vt(s.toArray()),Ve.none())}}function hy(r,e,t){r instanceof Mi?(function(s,i,o){const B=s.value.clone(),c=tf(s.fieldTransforms,i,o.transformResults);B.setAll(c),i.convertToFoundDocument(o.version,B).setHasCommittedMutations()})(r,e,t):r instanceof or?(function(s,i,o){if(!Oo(s.precondition,i))return void i.convertToUnknownDocument(o.version);const B=tf(s.fieldTransforms,i,o.transformResults),c=i.data;c.setAll(kC(s)),c.setAll(B),i.convertToFoundDocument(o.version,c).setHasCommittedMutations()})(r,e,t):(function(s,i,o){i.convertToNoDocument(o.version).setHasCommittedMutations()})(0,e,t)}function ti(r,e,t,n){return r instanceof Mi?(function(i,o,B,c){if(!Oo(i.precondition,o))return B;const u=i.value.clone(),h=nf(i.fieldTransforms,c,o);return u.setAll(h),o.convertToFoundDocument(o.version,u).setHasLocalMutations(),null})(r,e,t,n):r instanceof or?(function(i,o,B,c){if(!Oo(i.precondition,o))return B;const u=nf(i.fieldTransforms,c,o),h=o.data;return h.setAll(kC(i)),h.setAll(u),o.convertToFoundDocument(o.version,h).setHasLocalMutations(),B===null?null:B.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map((d=>d.field)))})(r,e,t,n):(function(i,o,B){return Oo(i.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):B})(r,e,t)}function fy(r,e){let t=null;for(const n of r.fieldTransforms){const s=e.data.field(n.field),i=OC(n.transform,s||null);i!=null&&(t===null&&(t=ot.empty()),t.set(n.field,i))}return t||null}function ef(r,e){return r.type===e.type&&!!r.key.isEqual(e.key)&&!!r.precondition.isEqual(e.precondition)&&!!(function(n,s){return n===void 0&&s===void 0||!(!n||!s)&&Yr(n,s,((i,o)=>uy(i,o)))})(r.fieldTransforms,e.fieldTransforms)&&(r.type===0?r.value.isEqual(e.value):r.type!==1||r.data.isEqual(e.data)&&r.fieldMask.isEqual(e.fieldMask))}class Mi extends Ia{constructor(e,t,n,s=[]){super(),this.key=e,this.value=t,this.precondition=n,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class or extends Ia{constructor(e,t,n,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=n,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function kC(r){const e=new Map;return r.fieldMask.fields.forEach((t=>{if(!t.isEmpty()){const n=r.data.field(t);e.set(t,n)}})),e}function tf(r,e,t){const n=new Map;Q(r.length===t.length,32656,{h:t.length,T:r.length});for(let s=0;s<t.length;s++){const i=r[s],o=i.transform,B=e.data.field(i.field);n.set(i.field,cy(o,B,t[s]))}return n}function nf(r,e,t){const n=new Map;for(const s of r){const i=s.transform,o=t.data.field(s.field);n.set(s.field,By(i,o,e))}return n}class Gi extends Ia{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class VC extends Ia{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */class Wo{constructor(e,t){this.position=e,this.inclusive=t}}function rf(r,e,t){let n=0;for(let s=0;s<r.position.length;s++){const i=e[s],o=r.position[s];if(i.field.isKeyField()?n=X.comparator(X.fromName(o.referenceValue),t.key):n=It(o,t.data.field(i.field)),i.dir==="desc"&&(n*=-1),n!==0)break}return n}function sf(r,e){if(r===null)return e===null;if(e===null||r.inclusive!==e.inclusive||r.position.length!==e.position.length)return!1;for(let t=0;t<r.position.length;t++)if(!Gt(r.position[t],e.position[t]))return!1;return!0}/**
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
 */class xC{}class xe extends xC{constructor(e,t,n){super(),this.field=e,this.op=t,this.value=n}static create(e,t,n){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,n):new Cy(e,t,n):t==="array-contains"?new my(e,n):t==="in"?new Ey(e,n):t==="not-in"?new _y(e,n):t==="array-contains-any"?new Dy(e,n):new xe(e,t,n)}static createKeyFieldInFilter(e,t,n){return t==="in"?new py(e,n):new gy(e,n)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(It(t,this.value)):t!==null&&He(this.value)===He(t)&&this.matchesComparison(It(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return Y(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class jt extends xC{constructor(e,t){super(),this.filters=e,this.op=t,this.P=null}static create(e,t){return new jt(e,t)}matches(e){return MC(this)?this.filters.find((t=>!t.matches(e)))===void 0:this.filters.find((t=>t.matches(e)))!==void 0}getFlattenedFilters(){return this.P!==null||(this.P=this.filters.reduce(((e,t)=>e.concat(t.getFlattenedFilters())),[])),this.P}getFilters(){return Object.assign([],this.filters)}}function MC(r){return r.op==="and"}function GC(r){return dy(r)&&MC(r)}function dy(r){for(const e of r.filters)if(e instanceof jt)return!1;return!0}function ec(r){if(r instanceof xe)return r.field.canonicalString()+r.op.toString()+es(r.value);if(GC(r))return r.filters.map((e=>ec(e))).join(",");{const e=r.filters.map((t=>ec(t))).join(",");return`${r.op}(${e})`}}function UC(r,e){return r instanceof xe?(function(n,s){return s instanceof xe&&n.op===s.op&&n.field.isEqual(s.field)&&Gt(n.value,s.value)})(r,e):r instanceof jt?(function(n,s){return s instanceof jt&&n.op===s.op&&n.filters.length===s.filters.length?n.filters.reduce(((i,o,B)=>i&&UC(o,s.filters[B])),!0):!1})(r,e):void Y(19439)}function HC(r){return r instanceof xe?(function(t){return`${t.field.canonicalString()} ${t.op} ${es(t.value)}`})(r):r instanceof jt?(function(t){return t.op.toString()+" {"+t.getFilters().map(HC).join(" ,")+"}"})(r):"Filter"}class Cy extends xe{constructor(e,t,n){super(e,t,n),this.key=X.fromName(n.referenceValue)}matches(e){const t=X.comparator(e.key,this.key);return this.matchesComparison(t)}}class py extends xe{constructor(e,t){super(e,"in",t),this.keys=JC("in",t)}matches(e){return this.keys.some((t=>t.isEqual(e.key)))}}class gy extends xe{constructor(e,t){super(e,"not-in",t),this.keys=JC("not-in",t)}matches(e){return!this.keys.some((t=>t.isEqual(e.key)))}}function JC(r,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map((n=>X.fromName(n.referenceValue)))}class my extends xe{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return ts(t)&&Ei(t.arrayValue,this.value)}}class Ey extends xe{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Ei(this.value.arrayValue,t)}}class _y extends xe{constructor(e,t){super(e,"not-in",t)}matches(e){if(Ei(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!Ei(this.value.arrayValue,t)}}class Dy extends xe{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!ts(t)||!t.arrayValue.values)&&t.arrayValue.values.some((n=>Ei(this.value.arrayValue,n)))}}/**
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
 */class zo{constructor(e,t="asc"){this.field=e,this.dir=t}}function Iy(r,e){return r.dir===e.dir&&r.field.isEqual(e.field)}/**
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
 */class Ye{constructor(e,t,n,s,i,o,B){this.key=e,this.documentType=t,this.version=n,this.readTime=s,this.createTime=i,this.data=o,this.documentState=B}static newInvalidDocument(e){return new Ye(e,0,te.min(),te.min(),te.min(),ot.empty(),0)}static newFoundDocument(e,t,n,s){return new Ye(e,1,t,te.min(),n,s,0)}static newNoDocument(e,t){return new Ye(e,2,t,te.min(),te.min(),ot.empty(),0)}static newUnknownDocument(e,t){return new Ye(e,3,t,te.min(),te.min(),ot.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(te.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=ot.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=ot.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=te.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Ye&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Ye(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */const Ii=-1;function wy(r,e){const t=r.toTimestamp().seconds,n=r.toTimestamp().nanoseconds+1,s=te.fromTimestamp(n===1e9?new ye(t+1,0):new ye(t,n));return new Zn(s,X.empty(),e)}function yy(r){return new Zn(r.readTime,r.key,Ii)}class Zn{constructor(e,t,n){this.readTime=e,this.documentKey=t,this.largestBatchId=n}static min(){return new Zn(te.min(),X.empty(),Ii)}static max(){return new Zn(te.max(),X.empty(),Ii)}}function Ty(r,e){let t=r.readTime.compareTo(e.readTime);return t!==0?t:(t=X.comparator(r.documentKey,e.documentKey),t!==0?t:Be(r.largestBatchId,e.largestBatchId))}/**
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
 */class Ay{constructor(e,t=null,n=[],s=[],i=null,o=null,B=null){this.path=e,this.collectionGroup=t,this.orderBy=n,this.filters=s,this.limit=i,this.startAt=o,this.endAt=B,this.R=null}}function of(r,e=null,t=[],n=[],s=null,i=null,o=null){return new Ay(r,e,t,n,s,i,o)}function jC(r){const e=ne(r);if(e.R===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map((n=>ec(n))).join(","),t+="|ob:",t+=e.orderBy.map((n=>(function(i){return i.field.canonicalString()+i.dir})(n))).join(","),xi(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map((n=>es(n))).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map((n=>es(n))).join(",")),e.R=t}return e.R}function qC(r,e){if(r.limit!==e.limit||r.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<r.orderBy.length;t++)if(!Iy(r.orderBy[t],e.orderBy[t]))return!1;if(r.filters.length!==e.filters.length)return!1;for(let t=0;t<r.filters.length;t++)if(!UC(r.filters[t],e.filters[t]))return!1;return r.collectionGroup===e.collectionGroup&&!!r.path.isEqual(e.path)&&!!sf(r.startAt,e.startAt)&&sf(r.endAt,e.endAt)}function Cr(r){return!!r.isCorePipeline}function KC(r){return!!r.path&&X.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}/**
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
 */class Ui{constructor(e,t=null,n=[],s=[],i=null,o="F",B=null,c=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=n,this.filters=s,this.limit=i,this.limitType=o,this.startAt=B,this.endAt=c,this.I=null,this.A=null,this.V=null,this.startAt,this.endAt}}function Ry(r,e,t,n,s,i,o,B){return new Ui(r,e,t,n,s,i,o,B)}function wa(r){return new Ui(r)}function af(r){return r.filters.length===0&&r.limit===null&&r.startAt==null&&r.endAt==null&&(r.explicitOrderBy.length===0||r.explicitOrderBy.length===1&&r.explicitOrderBy[0].field.isKeyField())}function vy(r){return X.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}function WC(r){return r.collectionGroup!==null}function ni(r){const e=ne(r);if(e.I===null){e.I=[];const t=new Set;for(const i of e.explicitOrderBy)e.I.push(i),t.add(i.field.canonicalString());const n=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let B=new Ge(St.comparator);return o.filters.forEach((c=>{c.getFlattenedFilters().forEach((u=>{u.isInequality()&&(B=B.add(u.field))}))})),B})(e).forEach((i=>{t.has(i.canonicalString())||i.isKeyField()||e.I.push(new zo(i,n))})),t.has(St.keyField().canonicalString())||e.I.push(new zo(St.keyField(),n))}return e.I}function Yt(r){const e=ne(r);return e.A||(e.A=Py(e,ni(r))),e.A}function Py(r,e){if(r.limitType==="F")return of(r.path,r.collectionGroup,e,r.filters,r.limit,r.startAt,r.endAt);{e=e.map((s=>{const i=s.dir==="desc"?"asc":"desc";return new zo(s.field,i)}));const t=r.endAt?new Wo(r.endAt.position,r.endAt.inclusive):null,n=r.startAt?new Wo(r.startAt.position,r.startAt.inclusive):null;return of(r.path,r.collectionGroup,e,r.filters,r.limit,t,n)}}function tc(r,e){const t=r.filters.concat([e]);return new Ui(r.path,r.collectionGroup,r.explicitOrderBy.slice(),t,r.limit,r.limitType,r.startAt,r.endAt)}function Qo(r,e,t){return new Ui(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),e,t,r.startAt,r.endAt)}function Sy(r,e){return qC(Yt(r),Yt(e))&&r.limitType===e.limitType}function ri(r){return`Query(target=${(function(t){let n=t.path.canonicalString();return t.collectionGroup!==null&&(n+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(n+=`, filters: [${t.filters.map((s=>HC(s))).join(", ")}]`),xi(t.limit)||(n+=", limit: "+t.limit),t.orderBy.length>0&&(n+=`, orderBy: [${t.orderBy.map((s=>(function(o){return`${o.field.canonicalString()} (${o.dir})`})(s))).join(", ")}]`),t.startAt&&(n+=", startAt: ",n+=t.startAt.inclusive?"b:":"a:",n+=t.startAt.position.map((s=>es(s))).join(",")),t.endAt&&(n+=", endAt: ",n+=t.endAt.inclusive?"a:":"b:",n+=t.endAt.position.map((s=>es(s))).join(",")),`Target(${n})`})(Yt(r))}; limitType=${r.limitType})`}function ya(r,e){return e.isFoundDocument()&&(function(n,s){const i=s.key.path;return n.collectionGroup!==null?s.key.hasCollectionId(n.collectionGroup)&&n.path.isPrefixOf(i):X.isDocumentKey(n.path)?n.path.isEqual(i):n.path.isImmediateParentOf(i)})(r,e)&&(function(n,s){for(const i of ni(n))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0})(r,e)&&(function(n,s){for(const i of n.filters)if(!i.matches(s))return!1;return!0})(r,e)&&(function(n,s){return!(n.startAt&&!(function(o,B,c){const u=rf(o,B,c);return o.inclusive?u<=0:u<0})(n.startAt,ni(n),s)||n.endAt&&!(function(o,B,c){const u=rf(o,B,c);return o.inclusive?u>=0:u>0})(n.endAt,ni(n),s))})(r,e)}function Uc(r){return(e,t)=>{let n=!1;for(const s of ni(r)){const i=Oy(s,e,t);if(i!==0)return i;n=n||s.field.isKeyField()}return 0}}function Oy(r,e,t){const n=r.field.isKeyField()?X.comparator(e.key,t.key):(function(i,o,B){const c=o.data.field(i),u=B.data.field(i);return c!==null&&u!==null?It(c,u):Y(42886)})(r.field,e,t);switch(r.dir){case"asc":return n;case"desc":return-1*n;default:return Y(19790,{direction:r.dir})}}/**
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
 */class by{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
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
 */var Ne,le;function zC(r){switch(r){case F.OK:return Y(64938);case F.CANCELLED:case F.UNKNOWN:case F.DEADLINE_EXCEEDED:case F.RESOURCE_EXHAUSTED:case F.INTERNAL:case F.UNAVAILABLE:case F.UNAUTHENTICATED:return!1;case F.INVALID_ARGUMENT:case F.NOT_FOUND:case F.ALREADY_EXISTS:case F.PERMISSION_DENIED:case F.FAILED_PRECONDITION:case F.ABORTED:case F.OUT_OF_RANGE:case F.UNIMPLEMENTED:case F.DATA_LOSS:return!0;default:return Y(15467,{code:r})}}function QC(r){if(r===void 0)return Dn("GRPC error has no .code"),F.UNKNOWN;switch(r){case Ne.OK:return F.OK;case Ne.CANCELLED:return F.CANCELLED;case Ne.UNKNOWN:return F.UNKNOWN;case Ne.DEADLINE_EXCEEDED:return F.DEADLINE_EXCEEDED;case Ne.RESOURCE_EXHAUSTED:return F.RESOURCE_EXHAUSTED;case Ne.INTERNAL:return F.INTERNAL;case Ne.UNAVAILABLE:return F.UNAVAILABLE;case Ne.UNAUTHENTICATED:return F.UNAUTHENTICATED;case Ne.INVALID_ARGUMENT:return F.INVALID_ARGUMENT;case Ne.NOT_FOUND:return F.NOT_FOUND;case Ne.ALREADY_EXISTS:return F.ALREADY_EXISTS;case Ne.PERMISSION_DENIED:return F.PERMISSION_DENIED;case Ne.FAILED_PRECONDITION:return F.FAILED_PRECONDITION;case Ne.ABORTED:return F.ABORTED;case Ne.OUT_OF_RANGE:return F.OUT_OF_RANGE;case Ne.UNIMPLEMENTED:return F.UNIMPLEMENTED;case Ne.DATA_LOSS:return F.DATA_LOSS;default:return Y(39323,{code:r})}}(le=Ne||(Ne={}))[le.OK=0]="OK",le[le.CANCELLED=1]="CANCELLED",le[le.UNKNOWN=2]="UNKNOWN",le[le.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",le[le.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",le[le.NOT_FOUND=5]="NOT_FOUND",le[le.ALREADY_EXISTS=6]="ALREADY_EXISTS",le[le.PERMISSION_DENIED=7]="PERMISSION_DENIED",le[le.UNAUTHENTICATED=16]="UNAUTHENTICATED",le[le.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",le[le.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",le[le.ABORTED=10]="ABORTED",le[le.OUT_OF_RANGE=11]="OUT_OF_RANGE",le[le.UNIMPLEMENTED=12]="UNIMPLEMENTED",le[le.INTERNAL=13]="INTERNAL",le[le.UNAVAILABLE=14]="UNAVAILABLE",le[le.DATA_LOSS=15]="DATA_LOSS";/**
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
 */class Rr{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n!==void 0){for(const[s,i]of n)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const n=this.mapKeyFn(e),s=this.inner[n];if(s===void 0)return this.inner[n]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),n=this.inner[t];if(n===void 0)return!1;for(let s=0;s<n.length;s++)if(this.equalsFn(n[s][0],e))return n.length===1?delete this.inner[t]:n.splice(s,1),this.innerSize--,!0;return!1}forEach(e){ir(this.inner,((t,n)=>{for(const[s,i]of n)e(s,i)}))}isEmpty(){return DC(this.inner)}size(){return this.innerSize}}/**
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
 */const Ny=new Re(X.comparator);function Et(){return Ny}const $C=new Re(X.comparator);function Mr(...r){let e=$C;for(const t of r)e=e.insert(t.key,t);return e}function YC(r){let e=$C;return r.forEach(((t,n)=>e=e.insert(t,n.overlayedDocument))),e}function Vn(){return si()}function XC(){return si()}function si(){return new Rr((r=>r.toString()),((r,e)=>r.isEqual(e)))}const Ly=new Re(X.comparator),Fy=new Ge(X.comparator);function oe(...r){let e=Fy;for(const t of r)e=e.add(t);return e}const ky=new Ge(Be);function Vy(){return ky}/**
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
 */function xy(){return new TextEncoder}/**
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
 */const My=new Jn([4294967295,4294967295],0);function Bf(r){const e=xy().encode(r),t=new BC;return t.update(e),new Uint8Array(t.digest())}function cf(r){const e=new DataView(r.buffer),t=e.getUint32(0,!0),n=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new Jn([t,n],0),new Jn([s,i],0)]}class Hc{constructor(e,t,n){if(this.bitmap=e,this.padding=t,this.hashCount=n,t<0||t>=8)throw new Ws(`Invalid padding: ${t}`);if(n<0)throw new Ws(`Invalid hash count: ${n}`);if(e.length>0&&this.hashCount===0)throw new Ws(`Invalid hash count: ${n}`);if(e.length===0&&t!==0)throw new Ws(`Invalid padding when bitmap length is 0: ${t}`);this.m=8*e.length-t,this.p=Jn.fromNumber(this.m)}S(e,t,n){let s=e.add(t.multiply(Jn.fromNumber(n)));return s.compare(My)===1&&(s=new Jn([s.getBits(0),s.getBits(1)],0)),s.modulo(this.p).toNumber()}v(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.m===0)return!1;const t=Bf(e),[n,s]=cf(t);for(let i=0;i<this.hashCount;i++){const o=this.S(n,s,i);if(!this.v(o))return!1}return!0}static create(e,t,n){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),o=new Hc(i,s,t);return n.forEach((B=>o.insert(B))),o}insert(e){if(this.m===0)return;const t=Bf(e),[n,s]=cf(t);for(let i=0;i<this.hashCount;i++){const o=this.S(n,s,i);this.D(o)}}D(e){const t=Math.floor(e/8),n=e%8;this.bitmap[t]|=1<<n}}class Ws extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
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
 */class Hi{constructor(e,t,n,s,i,o){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=n,this.documentUpdates=s,this.augmentedDocumentUpdates=i,this.resolvedLimboDocuments=o}static createSynthesizedRemoteEventForCurrentChange(e,t,n){const s=new Map;return s.set(e,Ji.createSynthesizedTargetChangeForCurrentChange(e,t,n)),new Hi(te.min(),s,new Re(Be),Et(),Et(),oe())}}class Ji{constructor(e,t,n,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=n,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,n){return new Ji(n,t,oe(),oe(),oe())}}/**
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
 */class bo{constructor(e,t,n,s){this.C=e,this.removedTargetIds=t,this.key=n,this.F=s}}class ZC{constructor(e,t){this.targetId=e,this.O=t}}class ep{constructor(e,t,n=Ue.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=n,this.cause=s}}class uf{constructor(e){this.targetId=e,this.M=0,this.N=lf(),this.L=Ue.EMPTY_BYTE_STRING,this.B=!1,this.U=!0}get current(){return this.B}get resumeToken(){return this.L}get k(){return this.M!==0}get q(){return this.U}$(e){e.approximateByteSize()>0&&(this.U=!0,this.L=e)}K(){let e=oe(),t=oe(),n=oe();return this.N.forEach(((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:n=n.add(s);break;default:Y(38017,{changeType:i})}})),new Ji(this.L,this.B,e,t,n)}W(){this.U=!1,this.N=lf()}G(e,t){this.U=!0,this.N=this.N.insert(e,t)}j(e){this.U=!0,this.N=this.N.remove(e)}H(){this.M+=1}J(){this.M-=1,Q(this.M>=0,3241,{M:this.M,targetId:this.targetId})}Y(){this.U=!0,this.B=!0}}const Us="WatchChangeAggregator";class Gy{constructor(e){this.Z=e,this.X=new Map,this.ee=Et(),this.te=Io(),this.ne=Et(),this.re=Io(),this.ie=new Re(Be)}se(e){for(const t of e.C)e.F&&e.F.isFoundDocument()?this._e(t,e.F):this.oe(t,e.key,e.F);for(const t of e.removedTargetIds)this.oe(t,e.key,e.F)}ae(e){this.forEachTarget(e,(t=>{const n=this.X.get(t);if(n)switch(e.state){case 0:this.ue(t)&&n.$(e.resumeToken);break;case 1:n.J(),n.k||n.W(),n.$(e.resumeToken);break;case 2:n.J(),n.k||this.removeTarget(t);break;case 3:this.ue(t)&&(n.Y(),n.$(e.resumeToken));break;case 4:this.ue(t)&&(this.ce(t),n.$(e.resumeToken));break;default:Y(56790,{state:e.state})}else K(Us,`handleTargetChange received targetChange for untracked target ID (${t}) with state (${e.state})`)}))}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.X.forEach(((n,s)=>{this.ue(s)&&t(s)}))}le(e){var t;return Cr(e)?e.getPipelineSourceType()==="documents"&&((t=e.getPipelineDocuments())==null?void 0:t.length)===1:KC(e)}Ee(e){const t=e.targetId,n=e.O.count,s=this.he(t);if(s){const i=s.target;if(this.le(i))if(n===0){const o=new X(Cr(i)?Ce.fromString(i.getPipelineDocuments()[0]):i.path);this.oe(t,o,Ye.newNoDocument(o,te.min()))}else Q(n===1,20013,"Single document existence filter with count: "+n);else{const o=this.Te(t);if(o!==n){const B=this.Pe(e),c=B?this.Re(B,e,o):1;if(c!==0){this.ce(t);const u=c===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.ie=this.ie.insert(t,u)}}}}}Pe(e){const t=e.O.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:n="",padding:s=0},hashCount:i=0}=t;let o,B;try{o=Yn(n).toUint8Array()}catch(c){if(c instanceof wC)return Jt("Decoding the base64 bloom filter in existence filter failed ("+c.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw c}try{B=new Hc(o,s,i)}catch(c){return Jt(c instanceof Ws?"BloomFilter error: ":"Applying bloom filter failed: ",c),null}return B.m===0?null:B}Re(e,t,n){return t.O.count===n-this.Ve(e,t.targetId)?0:2}Ve(e,t){const n=this.Z.getRemoteKeysForTarget(t);let s=0;return n.forEach((i=>{const o=this.Z.Ae(),B=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;e.mightContain(B)||(this.oe(t,i,null),s++)})),s}de(e){const t=new Map;this.X.forEach(((i,o)=>{const B=this.he(o);if(B){if(i.current&&this.le(B.target)){const c=Cr(B.target)?Ce.fromString(B.target.getPipelineDocuments()[0]):B.target.path,u=new X(c);this.fe(u).has(o)||this.me(o,u)||this.oe(o,u,Ye.newNoDocument(u,e))}i.q&&(t.set(o,i.K()),i.W())}}));let n=oe();this.re.forEach(((i,o)=>{let B=!0;o.forEachWhile((c=>{const u=this.he(c);return!u||u.purpose==="TargetPurposeLimboResolution"||(B=!1,!1)})),B&&(n=n.add(i))})),this.ee.forEach(((i,o)=>o.setReadTime(e))),this.ne.forEach(((i,o)=>o.setReadTime(e)));const s=new Hi(e,t,this.ie,this.ee,this.ne,n);return this.ee=Et(),this.te=Io(),this.ne=Et(),this.re=Io(),this.ie=new Re(Be),s}_e(e,t){const n=this.X.get(e);if(!n||!this.ue(e))return void K(Us,`addDocumentToTarget received document for unknown inactive target (${e})`);const s=this.me(e,t.key)?2:0;n.G(t.key,s),Cr(this.he(e).target)&&this.he(e).target.getPipelineFlavor()!=="exact"?this.ne=this.ne.insert(t.key,t):this.ee=this.ee.insert(t.key,t),this.te=this.te.insert(t.key,this.fe(t.key).add(e)),this.re=this.re.insert(t.key,this.pe(t.key).add(e))}oe(e,t,n){const s=this.X.get(e);s&&this.ue(e)?(this.me(e,t)?s.G(t,1):s.j(t),this.re=this.re.insert(t,this.pe(t).delete(e)),this.re=this.re.insert(t,this.pe(t).add(e)),n&&(Cr(this.he(e).target)&&this.he(e).target.getPipelineFlavor()!=="exact"?this.ne=this.ne.insert(t,n):this.ee=this.ee.insert(t,n))):K(Us,`removeDocumentFromTarget received document for unknown or inactive target (${e})`)}removeTarget(e){this.X.delete(e)}Te(e){const t=this.X.get(e);if(!t)return 0;const n=t.K();return this.Z.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}H(e){let t=this.X.get(e);t||(K(Us,`recordPendingTargetRequest set up tracking for target ID ${e}`),t=new uf(e),this.X.set(e,t)),t.H()}pe(e){let t=this.re.get(e);return t||(t=new Ge(Be),this.re=this.re.insert(e,t)),t}fe(e){let t=this.te.get(e);return t||(t=new Ge(Be),this.te=this.te.insert(e,t)),t}ue(e){const t=this.he(e)!==null;return t||K(Us,"Detected inactive target",e),t}he(e){const t=this.X.get(e);return t===void 0||t.k?null:this.Z.ge(e)}ce(e){this.X.set(e,new uf(e)),this.Z.getRemoteKeysForTarget(e).forEach((t=>{this.oe(e,t,null)}))}me(e,t){return this.Z.getRemoteKeysForTarget(e).has(t)}}function Io(){return new Re(X.comparator)}function lf(){return new Re(X.comparator)}const Uy={asc:"ASCENDING",desc:"DESCENDING"},Hy={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},Jy={and:"AND",or:"OR"};class jy{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function nc(r,e){return r.useProto3Json||xi(e)?e:{value:e}}function $o(r,e){return r.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Jc(r){const e=$n(r);return new ye(e.seconds,e.nanos)}function tp(r,e){return r.useProto3Json?e.toBase64():e.toUint8Array()}function No(r,e){return $o(r,e.toTimestamp())}function Ot(r){return Q(!!r,49232),te.fromTimestamp(Jc(r))}function jc(r,e){return rc(r,e).canonicalString()}function rc(r,e){const t=(function(s){return new Ce(["projects",s.projectId,"databases",s.database])})(r).child("documents");return e===void 0?t:t.child(e)}function np(r){const e=Ce.fromString(r);return Q(Bp(e),10190,{key:e.toString()}),e}function wi(r,e){return jc(r.databaseId,e.path)}function ii(r,e){const t=np(e);if(t.get(1)!==r.databaseId.projectId)throw new H(F.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+r.databaseId.projectId);if(t.get(3)!==r.databaseId.database)throw new H(F.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+r.databaseId.database);return new X(sp(t))}function rp(r,e){return jc(r.databaseId,e)}function qy(r){const e=np(r);return e.length===4?Ce.emptyPath():sp(e)}function sc(r){return new Ce(["projects",r.databaseId.projectId,"databases",r.databaseId.database]).canonicalString()}function sp(r){return Q(r.length>4&&r.get(4)==="documents",29091,{key:r.toString()}),r.popFirst(5)}function hf(r,e,t){return{name:wi(r,e),fields:t.value.mapValue.fields}}function Ky(r,e){return"found"in e?(function(n,s){Q(!!s.found,43571),s.found.name,s.found.updateTime;const i=ii(n,s.found.name),o=Ot(s.found.updateTime),B=s.found.createTime?Ot(s.found.createTime):te.min(),c=new ot({mapValue:{fields:s.found.fields}});return Ye.newFoundDocument(i,o,B,c)})(r,e):"missing"in e?(function(n,s){Q(!!s.missing,3894),Q(!!s.readTime,22933);const i=ii(n,s.missing),o=Ot(s.readTime);return Ye.newNoDocument(i,o)})(r,e):Y(7234,{result:e})}function Wy(r,e){let t;if("targetChange"in e){e.targetChange;const n=(function(u){return u==="NO_CHANGE"?0:u==="ADD"?1:u==="REMOVE"?2:u==="CURRENT"?3:u==="RESET"?4:Y(39313,{state:u})})(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=(function(u,h){return u.useProto3Json?(Q(h===void 0||typeof h=="string",58123),Ue.fromBase64String(h||"")):(Q(h===void 0||h instanceof Buffer||h instanceof Uint8Array,16193),Ue.fromUint8Array(h||new Uint8Array))})(r,e.targetChange.resumeToken),o=e.targetChange.cause,B=o&&(function(u){const h=u.code===void 0?F.UNKNOWN:QC(u.code);return new H(h,u.message||"")})(o);t=new ep(n,s,i,B||null)}else if("documentChange"in e){e.documentChange;const n=e.documentChange;n.document,n.document.name,n.document.updateTime;const s=ii(r,n.document.name),i=Ot(n.document.updateTime),o=n.document.createTime?Ot(n.document.createTime):te.min(),B=new ot({mapValue:{fields:n.document.fields}}),c=Ye.newFoundDocument(s,i,o,B),u=n.targetIds||[],h=n.removedTargetIds||[];t=new bo(u,h,c.key,c)}else if("documentDelete"in e){e.documentDelete;const n=e.documentDelete;n.document;const s=ii(r,n.document),i=n.readTime?Ot(n.readTime):te.min(),o=Ye.newNoDocument(s,i),B=n.removedTargetIds||[];t=new bo([],B,o.key,o)}else if("documentRemove"in e){e.documentRemove;const n=e.documentRemove;n.document;const s=ii(r,n.document),i=n.removedTargetIds||[];t=new bo([],i,s,null)}else{if(!("filter"in e))return Y(11601,{ye:e});{e.filter;const n=e.filter;n.targetId;const{count:s=0,unchangedNames:i}=n,o=new by(s,i),B=n.targetId;t=new ZC(B,o)}}return t}function ip(r,e){let t;if(e instanceof Mi)t={update:hf(r,e.key,e.value)};else if(e instanceof Gi)t={delete:wi(r,e.key)};else if(e instanceof or)t={update:hf(r,e.key,e.data),updateMask:rT(e.fieldMask)};else{if(!(e instanceof VC))return Y(16599,{we:e.type});t={verify:wi(r,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map((n=>(function(i,o){const B=o.transform;if(B instanceof _i)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(B instanceof ns)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:B.elements}};if(B instanceof Di)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:B.elements}};if(B instanceof rs)return{fieldPath:o.field.canonicalString(),increment:B.l};if(B instanceof jo)return{fieldPath:o.field.canonicalString(),minimum:B.l};if(B instanceof qo)return{fieldPath:o.field.canonicalString(),maximum:B.l};throw Y(20930,{transform:o.transform})})(0,n)))),e.precondition.isNone||(t.currentDocument=(function(s,i){return i.updateTime!==void 0?{updateTime:No(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:Y(27497)})(r,e.precondition)),t}function zy(r,e){return r&&r.length>0?(Q(e!==void 0,14353),r.map((t=>(function(s,i){let o=s.updateTime?Ot(s.updateTime):Ot(i);return o.isEqual(te.min())&&(o=Ot(i)),new ly(o,s.transformResults||[])})(t,e)))):[]}function Qy(r,e){return{documents:[rp(r,e.path)]}}function $y(r,e){const t={structuredQuery:{}},n=e.path;let s;e.collectionGroup!==null?(s=n,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=n.popLast(),t.structuredQuery.from=[{collectionId:n.lastSegment()}]),t.parent=rp(r,s);const i=(function(u){if(u.length!==0)return ap(jt.create(u,"and"))})(e.filters);i&&(t.structuredQuery.where=i);const o=(function(u){if(u.length!==0)return u.map((h=>(function(p){return{field:Gr(p.field),direction:eT(p.dir)}})(h)))})(e.orderBy);o&&(t.structuredQuery.orderBy=o);const B=nc(r,e.limit);return B!==null&&(t.structuredQuery.limit=B),e.startAt&&(t.structuredQuery.startAt=(function(u){return{before:u.inclusive,values:u.position}})(e.startAt)),e.endAt&&(t.structuredQuery.endAt=(function(u){return{before:!u.inclusive,values:u.position}})(e.endAt)),{be:t,parent:s}}function Yy(r){let e=qy(r.parent);const t=r.structuredQuery,n=t.from?t.from.length:0;let s=null;if(n>0){Q(n===1,65062);const h=t.from[0];h.allDescendants?s=h.collectionId:e=e.child(h.collectionId)}let i=[];t.where&&(i=(function(d){const p=op(d);return p instanceof jt&&GC(p)?p.getFilters():[p]})(t.where));let o=[];t.orderBy&&(o=(function(d){return d.map((p=>(function(R){return new zo(Ur(R.field),(function(M){switch(M){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(R.direction))})(p)))})(t.orderBy));let B=null;t.limit&&(B=(function(d){let p;return p=typeof d=="object"?d.value:d,xi(p)?null:p})(t.limit));let c=null;t.startAt&&(c=(function(d){const p=!!d.before,I=d.values||[];return new Wo(I,p)})(t.startAt));let u=null;return t.endAt&&(u=(function(d){const p=!d.before,I=d.values||[];return new Wo(I,p)})(t.endAt)),Ry(e,s,o,i,B,"F",c,u)}function Xy(r,e){const t=(function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return Y(28987,{purpose:s})}})(e.purpose);return t==null?null:{"goog-listen-tags":t}}function Zy(r,e){return{structuredPipeline:{pipeline:{stages:e.stages.map((t=>t._toProto(r)))}}}}function op(r){return r.unaryFilter!==void 0?(function(t){switch(t.unaryFilter.op){case"IS_NAN":const n=Ur(t.unaryFilter.field);return xe.create(n,"==",{doubleValue:NaN});case"IS_NULL":const s=Ur(t.unaryFilter.field);return xe.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Ur(t.unaryFilter.field);return xe.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=Ur(t.unaryFilter.field);return xe.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return Y(61313);default:return Y(60726)}})(r):r.fieldFilter!==void 0?(function(t){return xe.create(Ur(t.fieldFilter.field),(function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return Y(58110);default:return Y(50506)}})(t.fieldFilter.op),t.fieldFilter.value)})(r):r.compositeFilter!==void 0?(function(t){return jt.create(t.compositeFilter.filters.map((n=>op(n))),(function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return Y(1026)}})(t.compositeFilter.op))})(r):Y(30097,{filter:r})}function eT(r){return Uy[r]}function tT(r){return Hy[r]}function nT(r){return Jy[r]}function Gr(r){return{fieldPath:r.canonicalString()}}function Ur(r){return St.fromServerFormat(r.fieldPath)}function ap(r){return r instanceof xe?(function(t){if(t.op==="=="){if(wt(t.value))return{unaryFilter:{field:Gr(t.field),op:"IS_NAN"}};if(Pt(t.value))return{unaryFilter:{field:Gr(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(wt(t.value))return{unaryFilter:{field:Gr(t.field),op:"IS_NOT_NAN"}};if(Pt(t.value))return{unaryFilter:{field:Gr(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Gr(t.field),op:tT(t.op),value:t.value}}})(r):r instanceof jt?(function(t){const n=t.getFilters().map((s=>ap(s)));return n.length===1?n[0]:{compositeFilter:{op:nT(t.op),filters:n}}})(r):Y(54877,{filter:r})}function rT(r){const e=[];return r.fields.forEach((t=>e.push(t.canonicalString()))),{fieldPaths:e}}function Bp(r){return r.length>=4&&r.get(0)==="projects"&&r.get(2)==="databases"}function cp(r){return!!r&&typeof r._toProto=="function"&&r._protoValueType==="ProtoValue"}function yi(r,e){const t={fields:{}};return e.forEach(((n,s)=>{if(typeof s!="string")throw new Error(`Cannot encode map with non-string key: ${s}`);t.fields[s]=n._toProto(r)})),{mapValue:t}}function up(r){return{stringValue:r}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ta(r){return new jy(r,!0)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rt{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Rt(Ue.fromBase64String(e))}catch(t){throw new H(F.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Rt(Ue.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:Rt._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(ki(e,Rt._jsonSchema))return Rt.fromBase64String(e.bytes)}}Rt._jsonSchemaVersion="firestore/bytes/1.0",Rt._jsonSchema={type:Me("string",Rt._jsonSchemaVersion),bytes:Me("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ds{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new H(F.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new St(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}function sT(){return new ds(zt)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cs{constructor(e){this._methodName=e}}/**
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
 */class Xt{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new H(F.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new H(F.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return Be(this._lat,e._lat)||Be(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Xt._jsonSchemaVersion}}static fromJSON(e){if(ki(e,Xt._jsonSchema))return new Xt(e.latitude,e.longitude)}}Xt._jsonSchemaVersion="firestore/geoPoint/1.0",Xt._jsonSchema={type:Me("string",Xt._jsonSchemaVersion),latitude:Me("number"),longitude:Me("number")};/**
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
 */class it{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}it.UNAUTHENTICATED=new it(null),it.GOOGLE_CREDENTIALS=new it("google-credentials-uid"),it.FIRST_PARTY=new it("first-party-uid"),it.MOCK_USER=new it("mock-user");/**
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
 */class Zt{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
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
 */class lp{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class iT{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(it.UNAUTHENTICATED)))}shutdown(){}}class oT{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class aT{constructor(e){this.ve=e,this.currentUser=it.UNAUTHENTICATED,this.De=0,this.forceRefresh=!1,this.auth=null}start(e,t){Q(this.xe===void 0,42304);let n=this.De;const s=c=>this.De!==n?(n=this.De,t(c)):Promise.resolve();let i=new Zt;this.xe=()=>{this.De++,this.currentUser=this.Ce(),i.resolve(),i=new Zt,e.enqueueRetryable((()=>s(this.currentUser)))};const o=()=>{const c=i;e.enqueueRetryable((async()=>{await c.promise,await s(this.currentUser)}))},B=c=>{K("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=c,this.xe&&(this.auth.addAuthTokenListener(this.xe),o())};this.ve.onInit((c=>B(c))),setTimeout((()=>{if(!this.auth){const c=this.ve.getImmediate({optional:!0});c?B(c):(K("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Zt)}}),0),o()}getToken(){const e=this.De,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((n=>this.De!==e?(K("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):n?(Q(typeof n.accessToken=="string",31837,{Fe:n}),new lp(n.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.xe&&this.auth.removeAuthTokenListener(this.xe),this.xe=void 0}Ce(){const e=this.auth&&this.auth.getUid();return Q(e===null||typeof e=="string",2055,{Oe:e}),new it(e)}}class BT{constructor(e,t,n){this.Me=e,this.Ne=t,this.Le=n,this.type="FirstParty",this.user=it.FIRST_PARTY,this.Be=new Map}Ue(){return this.Le?this.Le():null}get headers(){this.Be.set("X-Goog-AuthUser",this.Me);const e=this.Ue();return e&&this.Be.set("Authorization",e),this.Ne&&this.Be.set("X-Goog-Iam-Authorization-Token",this.Ne),this.Be}}class cT{constructor(e,t,n){this.Me=e,this.Ne=t,this.Le=n}getToken(){return Promise.resolve(new BT(this.Me,this.Ne,this.Le))}start(e,t){e.enqueueRetryable((()=>t(it.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class ff{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class uT{constructor(e,t){this.ke=t,this.forceRefresh=!1,this.appCheck=null,this.qe=null,this.$e=null,ke(e)&&e.settings.appCheckToken&&(this.$e=e.settings.appCheckToken)}start(e,t){Q(this.xe===void 0,3512);const n=i=>{i.error!=null&&K("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.qe;return this.qe=i.token,K("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(i.token):Promise.resolve()};this.xe=i=>{e.enqueueRetryable((()=>n(i)))};const s=i=>{K("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.xe&&this.appCheck.addTokenListener(this.xe)};this.ke.onInit((i=>s(i))),setTimeout((()=>{if(!this.appCheck){const i=this.ke.getImmediate({optional:!0});i?s(i):K("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.$e)return Promise.resolve(new ff(this.$e));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(Q(typeof t.token=="string",44558,{tokenResult:t}),this.qe=t.token,new ff(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.xe&&this.appCheck.removeTokenListener(this.xe),this.xe=void 0}}function hp(r){const e={};return r.timeoutSeconds!==void 0&&(e.timeoutSeconds=r.timeoutSeconds),e}/**
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
 */class lT{Ke(e){}shutdown(){}}/**
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
 */const df="ConnectivityMonitor";class Cf{constructor(){this.Qe=()=>this.We(),this.Ge=()=>this.ze(),this.je=[],this.He()}Ke(e){this.je.push(e)}shutdown(){window.removeEventListener("online",this.Qe),window.removeEventListener("offline",this.Ge)}He(){window.addEventListener("online",this.Qe),window.addEventListener("offline",this.Ge)}We(){K(df,"Network connectivity changed: AVAILABLE");for(const e of this.je)e(0)}ze(){K(df,"Network connectivity changed: UNAVAILABLE");for(const e of this.je)e(1)}static Je(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let wo=null;function ic(){return wo===null?wo=(function(){return 268435456+Math.round(2147483648*Math.random())})():wo++,"0x"+wo.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const SB="RestConnection",hT={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class fT{get Ye(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",n=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Ze=t+"://"+e.host,this.Xe=`projects/${n}/databases/${s}`,this.et=this.databaseId.database===Ci?`project_id=${n}`:`project_id=${n}&database_id=${s}`}tt(e,t,n,s,i){const o=ic(),B=this.nt(e,t.toUriEncodedString());K(SB,`Sending RPC '${e}' ${o}:`,B,n);const c={"google-cloud-resource-prefix":this.Xe,"x-goog-request-params":this.et};this.rt(c,s,i);const{host:u}=new URL(B),h=Bs(u);return this.it(e,B,c,n,h).then((d=>(K(SB,`Received RPC '${e}' ${o}: `,d),d)),(d=>{throw Jt(SB,`RPC '${e}' ${o} failed with error: `,d,"url: ",B,"request:",n),d}))}st(e,t,n,s,i,o){return this.tt(e,t,n,s,i)}rt(e,t,n){if(e["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+fs})(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach(((s,i)=>e[i]=s)),n&&n.headers.forEach(((s,i)=>e[i]=s)),this.databaseInfo._customHeaders)for(const s of Object.keys(this.databaseInfo._customHeaders))e[s]=this.databaseInfo._customHeaders[s]}nt(e,t){const n=hT[e];let s=`${this.Ze}/v1/${t}:${n}`;return this.databaseInfo.apiKey&&(s=`${s}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),s}terminate(){}}/**
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
 */class dT{constructor(e){this._t=e._t,this.ot=e.ot}ut(e){this.ct=e}lt(e){this.Et=e}ht(e){this.Tt=e}onMessage(e){this.Pt=e}close(){this.ot()}send(e){this._t(e)}Rt(){this.ct()}It(){this.Et()}At(e){this.Tt(e)}Vt(e){this.Pt(e)}}/**
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
 */const st="WebChannelConnection",Hs=(r,e,t)=>{r.listen(e,(n=>{try{t(n)}catch(s){setTimeout((()=>{throw s}),0)}}))};class Qr extends fT{constructor(e){super(e),this.dt=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static ft(){if(!Qr.gt){const e=hC();Hs(e,lC.STAT_EVENT,(t=>{t.stat===WB.PROXY?K(st,"STAT_EVENT: detected buffering proxy"):t.stat===WB.NOPROXY&&K(st,"STAT_EVENT: detected no buffering proxy")})),Qr.gt=!0}}it(e,t,n,s,i){const o=ic();return new Promise(((B,c)=>{const u=new cC;u.setWithCredentials(!0),u.listenOnce(uC.COMPLETE,(()=>{try{switch(u.getLastErrorCode()){case Po.NO_ERROR:const d=u.getResponseJson();K(st,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(d)),B(d);break;case Po.TIMEOUT:K(st,`RPC '${e}' ${o} timed out`),c(new H(F.DEADLINE_EXCEEDED,"Request time out"));break;case Po.HTTP_ERROR:const p=u.getStatus();if(K(st,`RPC '${e}' ${o} failed with status:`,p,"response text:",u.getResponseText()),p>0){let I=u.getResponseJson();Array.isArray(I)&&(I=I[0]);const R=I==null?void 0:I.error;if(R&&R.status&&R.message){const k=(function(z){const re=z.toLowerCase().replace(/_/g,"-");return Object.values(F).indexOf(re)>=0?re:F.UNKNOWN})(R.status);c(new H(k,R.message))}else c(new H(F.UNKNOWN,"Server responded with status "+u.getStatus()))}else c(new H(F.UNAVAILABLE,"Connection failed."));break;default:Y(9055,{yt:e,streamId:o,wt:u.getLastErrorCode(),bt:u.getLastError()})}}finally{K(st,`RPC '${e}' ${o} completed.`)}}));const h=JSON.stringify(s);K(st,`RPC '${e}' ${o} sending request:`,s),u.send(t,"POST",h,n,15)}))}St(e,t,n){const s=ic(),i=[this.Ze,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=this.createWebChannelTransport(),B={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},c=this.longPollingOptions.timeoutSeconds;c!==void 0&&(B.longPollingTimeout=Math.round(1e3*c)),this.useFetchStreams&&(B.useFetchStreams=!0),this.rt(B.initMessageHeaders,t,n),B.encodeInitMessageHeaders=!0;const u=i.join("");K(st,`Creating RPC '${e}' stream ${s}: ${u}`,B);const h=o.createWebChannel(u,B);this.vt(h);let d=!1,p=!1;const I=new dT({_t:R=>{p?K(st,`Not sending because RPC '${e}' stream ${s} is closed:`,R):(d||(K(st,`Opening RPC '${e}' stream ${s} transport.`),h.open(),d=!0),K(st,`RPC '${e}' stream ${s} sending:`,R),h.send(R))},ot:()=>h.close()});return Hs(h,Ks.EventType.OPEN,(()=>{p||(K(st,`RPC '${e}' stream ${s} transport opened.`),I.Rt())})),Hs(h,Ks.EventType.CLOSE,(()=>{p||(p=!0,K(st,`RPC '${e}' stream ${s} transport closed`),I.At(),this.Dt(h))})),Hs(h,Ks.EventType.ERROR,(R=>{p||(p=!0,Jt(st,`RPC '${e}' stream ${s} transport errored. Name:`,R.name,"Message:",R.message),I.At(new H(F.UNAVAILABLE,"The operation could not be completed")))})),Hs(h,Ks.EventType.MESSAGE,(R=>{var k;if(!p){const M=R.data[0];Q(!!M,16349);const z=M,re=(z==null?void 0:z.error)||((k=z[0])==null?void 0:k.error);if(re){K(st,`RPC '${e}' stream ${s} received error:`,re);const pe=re.status;let Se=(function(v){const E=Ne[v];if(E!==void 0)return QC(E)})(pe),Oe=re.message;pe==="NOT_FOUND"&&Oe.includes("database")&&Oe.includes("does not exist")&&Oe.includes(this.databaseId.database)&&Jt(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),Se===void 0&&(Se=F.INTERNAL,Oe="Unknown error status: "+pe+" with message "+re.message),p=!0,I.At(new H(Se,Oe)),h.close()}else K(st,`RPC '${e}' stream ${s} received:`,M),I.Vt(M)}})),Qr.ft(),setTimeout((()=>{I.It()}),0),I}terminate(){this.dt.forEach((e=>e.close())),this.dt=[]}vt(e){this.dt.push(e)}Dt(e){this.dt=this.dt.filter((t=>t===e))}rt(e,t,n){super.rt(e,t,n),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return fC()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function CT(r){return new Qr(r)}Qr.gt=!1;class qc{constructor(e,t,n=1e3,s=1.5,i=6e4){this.xt=e,this.timerId=t,this.Ct=n,this.Ft=s,this.Ot=i,this.Mt=0,this.Nt=null,this.Lt=Date.now(),this.reset()}reset(){this.Mt=0}Bt(){this.Mt=this.Ot}Ut(e){this.cancel();const t=Math.floor(this.Mt+this.kt()),n=Math.max(0,Date.now()-this.Lt),s=Math.max(0,t-n);s>0&&K("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Mt} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`),this.Nt=this.xt.enqueueAfterDelay(this.timerId,s,(()=>(this.Lt=Date.now(),e()))),this.Mt*=this.Ft,this.Mt<this.Ct&&(this.Mt=this.Ct),this.Mt>this.Ot&&(this.Mt=this.Ot)}qt(){this.Nt!==null&&(this.Nt.skipDelay(),this.Nt=null)}cancel(){this.Nt!==null&&(this.Nt.cancel(),this.Nt=null)}kt(){return(Math.random()-.5)*this.Mt}}/**
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
 */const pf="PersistentStream";class fp{constructor(e,t,n,s,i,o,B,c){this.xt=e,this.$t=n,this.Kt=s,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=B,this.listener=c,this.state=0,this.Qt=0,this.Wt=null,this.Gt=null,this.stream=null,this.zt=0,this.jt=new qc(e,t)}Ht(){return this.state===1||this.state===5||this.Jt()}Jt(){return this.state===2||this.state===3}start(){this.zt=0,this.state!==4?this.auth():this.Yt()}async stop(){this.Ht()&&await this.close(0)}Zt(){this.state=0,this.jt.reset()}Xt(){this.Jt()&&this.Wt===null&&(this.Wt=this.xt.enqueueAfterDelay(this.$t,6e4,(()=>this.en())))}tn(e){this.nn(),this.stream.send(e)}async en(){if(this.Jt())return this.close(0)}nn(){this.Wt&&(this.Wt.cancel(),this.Wt=null)}rn(){this.Gt&&(this.Gt.cancel(),this.Gt=null)}async close(e,t){this.nn(),this.rn(),this.jt.cancel(),this.Qt++,e!==4?this.jt.reset():t&&t.code===F.RESOURCE_EXHAUSTED?(Dn(t.toString()),Dn("Using maximum backoff delay to prevent overloading the backend."),this.jt.Bt()):t&&t.code===F.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.sn(),this.stream.close(),this.stream=null),this.state=e,await this.listener.ht(t)}sn(){}auth(){this.state=1;const e=this._n(this.Qt),t=this.Qt;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([n,s])=>{this.Qt===t&&this.an(n,s)}),(n=>{e((()=>{const s=new H(F.UNKNOWN,"Fetching auth token failed: "+n.message);return this.un(s)}))}))}an(e,t){const n=this._n(this.Qt);this.stream=this.cn(e,t),this.stream.ut((()=>{n((()=>this.listener.ut()))})),this.stream.lt((()=>{n((()=>(this.state=2,this.Gt=this.xt.enqueueAfterDelay(this.Kt,1e4,(()=>(this.Jt()&&(this.state=3),Promise.resolve()))),this.listener.lt())))})),this.stream.ht((s=>{n((()=>this.un(s)))})),this.stream.onMessage((s=>{n((()=>++this.zt==1?this.En(s):this.onNext(s)))}))}Yt(){this.state=5,this.jt.Ut((async()=>{this.state=0,this.start()}))}un(e){return K(pf,`close with error: ${e}`),this.stream=null,this.close(4,e)}_n(e){return t=>{this.xt.enqueueAndForget((()=>this.Qt===e?t():(K(pf,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class pT extends fp{constructor(e,t,n,s,i,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,n,s,o),this.serializer=i}cn(e,t){return this.connection.St("Listen",e,t)}En(e){return this.onNext(e)}onNext(e){this.jt.reset();const t=Wy(this.serializer,e),n=(function(i){if(!("targetChange"in i))return te.min();const o=i.targetChange;return o.targetIds&&o.targetIds.length?te.min():o.readTime?Ot(o.readTime):te.min()})(e);return this.listener.hn(t,n)}Tn(e){const t={};t.database=sc(this.serializer),t.addTarget=(function(i,o){let B;const c=o.target;if(B=Cr(c)?{pipelineQuery:Zy(i,c)}:KC(c)?{documents:Qy(i,c)}:{query:$y(i,c).be},B.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){B.resumeToken=tp(i,o.resumeToken);const u=nc(i,o.expectedCount);u!==null&&(B.expectedCount=u)}else if(o.snapshotVersion.compareTo(te.min())>0){B.readTime=$o(i,o.snapshotVersion.toTimestamp());const u=nc(i,o.expectedCount);u!==null&&(B.expectedCount=u)}return B})(this.serializer,e);const n=Xy(this.serializer,e);n&&(t.labels=n),this.tn(t)}Pn(e){const t={};t.database=sc(this.serializer),t.removeTarget=e,this.tn(t)}}class gT extends fp{constructor(e,t,n,s,i,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,n,s,o),this.serializer=i}get Rn(){return this.zt>0}start(){this.lastStreamToken=void 0,super.start()}sn(){this.Rn&&this.In([])}cn(e,t){return this.connection.St("Write",e,t)}En(e){return Q(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,Q(!e.writeResults||e.writeResults.length===0,55816),this.listener.An()}onNext(e){Q(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.jt.reset();const t=zy(e.writeResults,e.commitTime),n=Ot(e.commitTime);return this.listener.Vn(n,t)}dn(){const e={};e.database=sc(this.serializer),this.tn(e)}In(e){const t={streamToken:this.lastStreamToken,writes:e.map((n=>ip(this.serializer,n)))};this.tn(t)}}/**
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
 */class mT{}class ET extends mT{constructor(e,t,n,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=n,this.serializer=s,this.fn=!1}mn(){if(this.fn)throw new H(F.FAILED_PRECONDITION,"The client has already been terminated.")}tt(e,t,n,s){return this.mn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([i,o])=>this.connection.tt(e,rc(t,n),s,i,o))).catch((i=>{throw i.name==="FirebaseError"?(i.code===F.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new H(F.UNKNOWN,i.toString())}))}st(e,t,n,s,i){return this.mn(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([o,B])=>this.connection.st(e,rc(t,n),s,o,B,i))).catch((o=>{throw o.name==="FirebaseError"?(o.code===F.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new H(F.UNKNOWN,o.toString())}))}terminate(){this.fn=!0,this.connection.terminate()}}function _T(r,e,t,n){return new ET(r,e,t,n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const DT="ComponentProvider",gf=new Map;function IT(r,e,t,n,s){return new ny(r,e,t,s.host,s.ssl,s.experimentalForceLongPolling,s.experimentalAutoDetectLongPolling,hp(s.experimentalLongPollingOptions),s.useFetchStreams,s.isUsingEmulator,n,s._customHeaders,s.grpcFlowControlWindow)}/**
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
 */const mf={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},dp=41943040;class gt{static withCacheSize(e){return new gt(e,gt.DEFAULT_COLLECTION_PERCENTILE,gt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,n){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=n}}gt.DEFAULT_COLLECTION_PERCENTILE=10,gt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,gt.DEFAULT=new gt(dp,gt.DEFAULT_COLLECTION_PERCENTILE,gt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),gt.DISABLED=new gt(-1,0,0);/**
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
 */class Aa{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=n=>this.pn(n),this.gn=n=>t.writeSequenceNumber(n))}pn(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.gn&&this.gn(e),e}}Aa.yn=-1;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wT="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class yT{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((e=>e()))}}/**
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
 */async function ps(r){if(r.code!==F.FAILED_PRECONDITION||r.message!==wT)throw r;K("LocalStore","Unexpectedly lost primary lease")}/**
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
 */class V{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e((t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)}),(t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)}))}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&Y(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new V(((n,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(n,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(n,s)}}))}toPromise(){return new Promise(((e,t)=>{this.next(e,t)}))}wrapUserFunction(e){try{const t=e();return t instanceof V?t:V.resolve(t)}catch(t){return V.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction((()=>e(t))):V.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction((()=>e(t))):V.reject(t)}static resolve(e){return new V(((t,n)=>{t(e)}))}static reject(e){return new V(((t,n)=>{n(e)}))}static waitFor(e){return new V(((t,n)=>{let s=0,i=0,o=!1;e.forEach((B=>{++s,B.next((()=>{++i,o&&i===s&&t()}),(c=>n(c)))})),o=!0,i===s&&t()}))}static or(e){let t=V.resolve(!1);for(const n of e)t=t.next((s=>s?V.resolve(s):n()));return t}static forEach(e,t){const n=[];return e.forEach(((s,i)=>{n.push(t.call(this,s,i))})),this.waitFor(n)}static mapArray(e,t){return new V(((n,s)=>{const i=e.length,o=new Array(i);let B=0;for(let c=0;c<i;c++){const u=c;t(e[u]).next((h=>{o[u]=h,++B,B===i&&n(o)}),(h=>s(h)))}}))}static doWhile(e,t){return new V(((n,s)=>{const i=()=>{e()===!0?t().next((()=>{i()}),s):n()};i()}))}}function TT(r){const e=r.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function gs(r){return r.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ef="LruGarbageCollector",Cp=1048576;function _f([r,e],[t,n]){const s=Be(r,t);return s===0?Be(e,n):s}class AT{constructor(e){this.Jn=e,this.buffer=new Ge(_f),this.Yn=0}Zn(){return++this.Yn}Xn(e){const t=[e,this.Zn()];if(this.buffer.size<this.Jn)this.buffer=this.buffer.add(t);else{const n=this.buffer.last();_f(t,n)<0&&(this.buffer=this.buffer.delete(n).add(t))}}get maxValue(){return this.buffer.last()[0]}}class RT{constructor(e,t,n){this.garbageCollector=e,this.asyncQueue=t,this.localStore=n,this.er=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.tr(6e4)}stop(){this.er&&(this.er.cancel(),this.er=null)}get started(){return this.er!==null}tr(e){K(Ef,`Garbage collection scheduled in ${e}ms`),this.er=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,(async()=>{this.er=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){gs(t)?K(Ef,"Ignoring IndexedDB error during garbage collection: ",t):await ps(t)}await this.tr(3e5)}))}}class vT{constructor(e,t){this.nr=e,this.params=t}calculateTargetCount(e,t){return this.nr.rr(e).next((n=>Math.floor(t/100*n)))}nthSequenceNumber(e,t){if(t===0)return V.resolve(Aa.yn);const n=new AT(t);return this.nr.forEachTarget(e,(s=>n.Xn(s.sequenceNumber))).next((()=>this.nr.ir(e,(s=>n.Xn(s))))).next((()=>n.maxValue))}removeTargets(e,t,n){return this.nr.removeTargets(e,t,n)}removeOrphanedDocuments(e,t){return this.nr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(K("LruGarbageCollector","Garbage collection skipped; disabled"),V.resolve(mf)):this.getCacheSize(e).next((n=>n<this.params.cacheSizeCollectionThreshold?(K("LruGarbageCollector",`Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),mf):this.sr(e,t)))}getCacheSize(e){return this.nr.getCacheSize(e)}sr(e,t){let n,s,i,o,B,c,u;const h=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next((d=>(d>this.params.maximumSequenceNumbersToCollect?(K("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${d}`),s=this.params.maximumSequenceNumbersToCollect):s=d,o=Date.now(),this.nthSequenceNumber(e,s)))).next((d=>(n=d,B=Date.now(),this.removeTargets(e,n,t)))).next((d=>(i=d,c=Date.now(),this.removeOrphanedDocuments(e,n)))).next((d=>(u=Date.now(),Vr()<=ce.DEBUG&&K("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-h}ms
	Determined least recently used ${s} in `+(B-o)+`ms
	Removed ${i} targets in `+(c-B)+`ms
	Removed ${d} documents in `+(u-c)+`ms
Total Duration: ${u-h}ms`),V.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:d}))))}}function PT(r,e){return new vT(r,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pp="firestore.googleapis.com",Df=!0;class If{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new H(F.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=pp,this.ssl=Df}else this.host=e.host,this.ssl=e.ssl??Df;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e._customHeaders&&(this._customHeaders={...e._customHeaders}),e.cacheSizeBytes===void 0)this.cacheSizeBytes=dp;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<Cp)throw new H(F.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}if(Zw("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=hp(e.experimentalLongPollingOptions??{}),(function(n){if(n.timeoutSeconds!==void 0){if(isNaN(n.timeoutSeconds))throw new H(F.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (must not be NaN)`);if(n.timeoutSeconds<5)throw new H(F.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (minimum allowed value is 5)`);if(n.timeoutSeconds>30)throw new H(F.INVALID_ARGUMENT,`invalid long polling timeout: ${n.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams,e.grpcFlowControlWindow!==void 0){if(typeof e.grpcFlowControlWindow!="number"||e.grpcFlowControlWindow<=0||e.grpcFlowControlWindow>2147483647||!Number.isInteger(e.grpcFlowControlWindow))throw new H(F.INVALID_ARGUMENT,"grpcFlowControlWindow must be a positive integer and cannot exceed 2147483647");this.grpcFlowControlWindow=e.grpcFlowControlWindow}}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(n,s){return n.timeoutSeconds===s.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams&&this.grpcFlowControlWindow===e.grpcFlowControlWindow&&(function(n,s){if(n===s)return!0;if(!n||!s)return!1;const i=Object.keys(n),o=Object.keys(s);if(i.length!==o.length)return!1;for(const B of i)if(n[B]!==s[B])return!1;return!0})(this._customHeaders,e._customHeaders)}}let Ra=class{constructor(e,t,n,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=n,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new If({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new H(F.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new H(F.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new If(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(n){if(!n)return new iT;switch(n.type){case"firstParty":return new cT(n.sessionIndex||"0",n.iamToken||null,n.authTokenFactory||null);case"provider":return n.client;default:throw new H(F.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const n=gf.get(t);n&&(K(DT,"Removing Datastore"),gf.delete(t),n.terminate())})(this),Promise.resolve()}};function ST(r,e,t,n={}){var u;r=Ze(r,Ra);const s=Bs(e),i=r._getSettings(),o={...i,emulatorOptions:r._getEmulatorOptions()},B=`${e}:${t}`;s&&Cc(`https://${B}`),i.host!==pp&&i.host!==B&&Jt("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const c={...i,host:B,ssl:s,emulatorOptions:n};if(!pn(c,o)&&(r._setSettings(c),n.mockUserToken)){let h,d;if(typeof n.mockUserToken=="string")h=n.mockUserToken,d=it.MOCK_USER;else{h=nm(n.mockUserToken,(u=r._app)==null?void 0:u.options.projectId);const p=n.mockUserToken.sub||n.mockUserToken.user_id;if(!p)throw new H(F.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");d=new it(p)}r._authCredentials=new oT(new lp(h,d))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ar{constructor(e,t,n){this.converter=t,this._query=n,this.type="query",this.firestore=e}withConverter(e){return new ar(this.firestore,e,this._query)}}class Te{constructor(e,t,n){this.converter=t,this._key=n,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new jn(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Te(this.firestore,e,this._key)}toJSON(){return{type:Te._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,n){if(ki(t,Te._jsonSchema))return new Te(e,n||null,new X(Ce.fromString(t.referencePath)))}}Te._jsonSchemaVersion="firestore/documentReference/1.0",Te._jsonSchema={type:Me("string",Te._jsonSchemaVersion),referencePath:Me("string")};class jn extends ar{constructor(e,t,n){super(e,t,wa(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Te(this.firestore,null,new X(e))}withConverter(e){return new jn(this.firestore,e,this._path)}}function uP(r,e,...t){if(r=se(r),IC("collection","path",e),r instanceof Ra){const n=Ce.fromString(e,...t);return Wh(n),new jn(r,null,n)}{if(!(r instanceof Te||r instanceof jn))throw new H(F.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(Ce.fromString(e,...t));return Wh(n),new jn(r.firestore,null,n)}}function OT(r,e,...t){if(r=se(r),arguments.length===1&&(e=kc.newId()),IC("doc","path",e),r instanceof Ra){const n=Ce.fromString(e,...t);return Kh(n),new Te(r,null,new X(n))}{if(!(r instanceof Te||r instanceof jn))throw new H(F.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const n=r._path.child(Ce.fromString(e,...t));return Kh(n),new Te(r.firestore,r instanceof jn?r.converter:null,new X(n))}}/**
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
 */class _t{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(n,s){if(n.length!==s.length)return!1;for(let i=0;i<n.length;++i)if(n[i]!==s[i])return!1;return!0})(this._values,e._values)}toJSON(){return{type:_t._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(ki(e,_t._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((t=>typeof t=="number")))return new _t(e.vectorValues);throw new H(F.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}_t._jsonSchemaVersion="firestore/vectorValue/1.0",_t._jsonSchema={type:Me("string",_t._jsonSchemaVersion),vectorValues:Me("object")};/**
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
 */const bT=/^__.*__$/;class NT{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return this.fieldMask!==null?new or(e,this.data,this.fieldMask,t,this.fieldTransforms):new Mi(e,this.data,t,this.fieldTransforms)}}class gp{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return new or(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function mp(r){switch(r){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw Y(40011,{dataSource:r})}}class va{constructor(e,t,n,s,i,o){this.settings=e,this.databaseId=t,this.serializer=n,this.ignoreUndefinedProperties=s,i===void 0&&this.validatePath(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new va({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){var s;const t=(s=this.path)==null?void 0:s.child(e),n=this.contextWith({path:t,arrayElement:!1});return n.validatePathSegment(e),n}childContextForFieldPath(e){var s;const t=(s=this.path)==null?void 0:s.child(e),n=this.contextWith({path:t,arrayElement:!1});return n.validatePath(),n}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return Yo(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find((t=>e.isPrefixOf(t)))!==void 0||this.fieldTransforms.find((t=>e.isPrefixOf(t.field)))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(mp(this.dataSource)&&bT.test(e))throw this.createError('Document fields cannot begin and end with "__"')}}class LT{constructor(e,t,n){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=n||Ta(e)}createContext(e,t,n,s=!1){return new va({dataSource:e,methodName:t,targetDoc:n,path:St.emptyPath(),arrayElement:!1,hasConverter:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function ms(r){const e=r._freezeSettings(),t=Ta(r._databaseId);return new LT(r._databaseId,!!e.ignoreUndefinedProperties,t)}function Pa(r,e,t,n,s,i={}){const o=r.createContext(i.merge||i.mergeFields?2:0,e,t,s);Yc("Data must be an object, but it was:",o,n);const B=Ep(n,o);let c,u;if(i.merge)c=new vt(o.fieldMask),u=o.fieldTransforms;else if(i.mergeFields){const h=[];for(const d of i.mergeFields){const p=yr(e,d,t);if(!o.contains(p))throw new H(F.INVALID_ARGUMENT,`Field '${p}' is specified in your field mask but missing from your input data.`);Ip(h,p)||h.push(p)}c=new vt(h),u=o.fieldTransforms.filter((d=>c.covers(d.field)))}else c=null,u=o.fieldTransforms;return new NT(new ot(B),c,u)}class Sa extends Cs{_toFieldTransform(e){if(e.dataSource!==2)throw e.dataSource===1?e.createError(`${this._methodName}() can only appear at the top level of your update data`):e.createError(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Sa}}function FT(r,e,t){return new va({dataSource:3,targetDoc:e.settings.targetDoc,methodName:r._methodName,arrayElement:t},e.databaseId,e.serializer,e.ignoreUndefinedProperties)}class Kc extends Cs{_toFieldTransform(e){return new Gc(e.path,new _i)}isEqual(e){return e instanceof Kc}}class Wc extends Cs{constructor(e,t){super(e),this._r=t}_toFieldTransform(e){const t=FT(this,e,!0),n=this._r.map((i=>In(i,t))),s=new ns(n);return new Gc(e.path,s)}isEqual(e){return e instanceof Wc&&pn(this._r,e._r)}}class zc extends Cs{constructor(e,t){super(e),this.ar=t}_toFieldTransform(e){const t=new rs(e.serializer,_a(e.serializer,this.ar));return new Gc(e.path,t)}isEqual(e){return e instanceof zc&&(this.ar===e.ar||Number.isNaN(this.ar)&&Number.isNaN(e.ar))}}function Qc(r,e,t,n){const s=r.createContext(1,e,t);Yc("Data must be an object, but it was:",s,n);const i=[],o=ot.empty();ir(n,((c,u)=>{const h=Dp(e,c,t);u=se(u);const d=s.childContextForFieldPath(h);if(u instanceof Sa)i.push(h);else{const p=In(u,d);p!=null&&(i.push(h),o.set(h,p))}}));const B=new vt(i);return new gp(o,B,s.fieldTransforms)}function $c(r,e,t,n,s,i){const o=r.createContext(1,e,t),B=[yr(e,n,t)],c=[s];if(i.length%2!=0)throw new H(F.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let p=0;p<i.length;p+=2)B.push(yr(e,i[p])),c.push(i[p+1]);const u=[],h=ot.empty();for(let p=B.length-1;p>=0;--p)if(!Ip(u,B[p])){const I=B[p];let R=c[p];R=se(R);const k=o.childContextForFieldPath(I);if(R instanceof Sa)u.push(I);else{const M=In(R,k);M!=null&&(u.push(I),h.set(I,M))}}const d=new vt(u);return new gp(h,d,o.fieldTransforms)}function kT(r,e,t,n=!1){return In(t,r.createContext(n?4:3,e))}function In(r,e,t){if(_p(r=se(r)))return Yc("Unsupported field value:",e,r),Ep(r,e);if(r instanceof Cs)return(function(s,i){if(!mp(i.dataSource))throw i.createError(`${s._methodName}() can only be used with update() and set()`);if(!i.path)throw i.createError(`${s._methodName}() is not currently supported inside arrays`);const o=s._toFieldTransform(i);o&&i.fieldTransforms.push(o)})(r,e),null;if(r===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),r instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return(function(s,i){const o=[];let B=0;for(const c of s){let u=In(c,i.childContextForArray(B));u==null&&(u={nullValue:"NULL_VALUE"}),o.push(u),B++}return{arrayValue:{values:o}}})(r,e)}return(function(s,i,o){if((s=se(s))===null)return{nullValue:"NULL_VALUE"};if(typeof s=="number")return _a(i.serializer,s);if(typeof s=="boolean")return{booleanValue:s};if(typeof s=="string")return{stringValue:s};if(s instanceof Date){const B=ye.fromDate(s);return{timestampValue:$o(i.serializer,B)}}if(s instanceof ye){const B=new ye(s.seconds,1e3*Math.floor(s.nanoseconds/1e3));return{timestampValue:$o(i.serializer,B)}}if(s instanceof Xt)return{geoPointValue:{latitude:s.latitude,longitude:s.longitude}};if(s instanceof Rt)return{bytesValue:tp(i.serializer,s._byteString)};if(s instanceof Te){const B=i.databaseId,c=s.firestore._databaseId;if(!c.isEqual(B))throw i.createError(`Document reference is for database ${c.projectId}/${c.database} but should be for database ${B.projectId}/${B.database}`);return{referenceValue:jc(s.firestore._databaseId||i.databaseId,s._key.path)}}if(s instanceof _t)return(function(c,u){const h=c instanceof _t?c.toArray():c;return{mapValue:{fields:{[vC]:{stringValue:PC},[mi]:{arrayValue:{values:h.map((p=>{if(typeof p!="number")throw u.createError("VectorValues must only contain numeric values.");return Ea(u.serializer,p)}))}}}}}})(s,i);if(cp(s))return s._toProto(i.serializer);throw i.createError(`Unsupported field value: ${ga(s)}`)})(r,e)}function Ep(r,e){const t={};return DC(r)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):ir(r,((n,s)=>{const i=In(s,e.childContextForField(n));i!=null&&(t[n]=i)})),{mapValue:{fields:t}}}function _p(r){return!(typeof r!="object"||r===null||r instanceof Array||r instanceof Date||r instanceof ye||r instanceof Xt||r instanceof Rt||r instanceof Te||r instanceof Cs||r instanceof _t||cp(r))}function Yc(r,e,t){if(!_p(t)||!Fi(t)){const n=ga(t);throw n==="an object"?e.createError(r+" a custom object"):e.createError(r+" "+n)}}function yr(r,e,t){if((e=se(e))instanceof ds)return e._internalPath;if(typeof e=="string")return Dp(r,e);throw Yo("Field path arguments must be of type string or ",r,!1,void 0,t)}const VT=new RegExp("[~\\*/\\[\\]]");function Dp(r,e,t){if(e.search(VT)>=0)throw Yo(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,r,!1,void 0,t);try{return new ds(...e.split("."))._internalPath}catch{throw Yo(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,r,!1,void 0,t)}}function Yo(r,e,t,n,s){const i=n&&!n.isEmpty(),o=s!==void 0;let B=`Function ${e}() called with invalid data`;t&&(B+=" (via `toFirestore()`)"),B+=". ";let c="";return(i||o)&&(c+=" (found",i&&(c+=` in field ${n}`),o&&(c+=` in document ${s}`),c+=")"),new H(F.INVALID_ARGUMENT,B+r+c)}function Ip(r,e){return r.some((t=>t.isEqual(e)))}function wp(r){return typeof r._readUserData=="function"}/**
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
 */class Bt{constructor(e){this.optionDefinitions=e}_getKnownOptions(e,t){const n=ot.empty();for(const s in this.optionDefinitions)if(this.optionDefinitions.hasOwnProperty(s)){const i=this.optionDefinitions[s];if(s in e){const o=e[s];let B;i.nestedOptions&&Fi(o)?B={mapValue:{fields:new Bt(i.nestedOptions).getOptionsProto(t,o)}}:o&&(B=In(o,t)??void 0),B&&n.set(St.fromServerFormat(i.serverName),B)}}return n}getOptionsProto(e,t,n){const s=this._getKnownOptions(t,e);if(n){const i=new Map(Xw(n,((o,B)=>[St.fromServerFormat(B),o!==void 0?In(o,e):null])));s.setAll(i)}return s.value.mapValue.fields??{}}}/**
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
 */function xT(r){return typeof r=="object"&&r!==null&&!!("nullValue"in r&&(r.nullValue===null||r.nullValue==="NULL_VALUE")||"booleanValue"in r&&(r.booleanValue===null||typeof r.booleanValue=="boolean")||"integerValue"in r&&(r.integerValue===null||typeof r.integerValue=="number"||typeof r.integerValue=="string")||"doubleValue"in r&&(r.doubleValue===null||typeof r.doubleValue=="number")||"timestampValue"in r&&(r.timestampValue===null||(function(t){return typeof t=="object"&&t!==null&&"seconds"in t&&(t.seconds===null||typeof t.seconds=="number"||typeof t.seconds=="string")&&"nanos"in t&&(t.nanos===null||typeof t.nanos=="number")})(r.timestampValue))||"stringValue"in r&&(r.stringValue===null||typeof r.stringValue=="string")||"bytesValue"in r&&(r.bytesValue===null||r.bytesValue instanceof Uint8Array)||"referenceValue"in r&&(r.referenceValue===null||typeof r.referenceValue=="string")||"geoPointValue"in r&&(r.geoPointValue===null||(function(t){return typeof t=="object"&&t!==null&&"latitude"in t&&(t.latitude===null||typeof t.latitude=="number")&&"longitude"in t&&(t.longitude===null||typeof t.longitude=="number")})(r.geoPointValue))||"arrayValue"in r&&(r.arrayValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("values"in t)||t.values!==null&&!Array.isArray(t.values))})(r.arrayValue))||"mapValue"in r&&(r.mapValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("fields"in t)||t.fields!==null&&!Fi(t.fields))})(r.mapValue))||"fieldReferenceValue"in r&&(r.fieldReferenceValue===null||typeof r.fieldReferenceValue=="string")||"functionValue"in r&&(r.functionValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("name"in t)||t.name!==null&&typeof t.name!="string"||!("args"in t)||t.args!==null&&!Array.isArray(t.args))})(r.functionValue))||"pipelineValue"in r&&(r.pipelineValue===null||(function(t){return typeof t=="object"&&t!==null&&!(!("stages"in t)||t.stages!==null&&!Array.isArray(t.stages))})(r.pipelineValue)))}function lP(){return new Kc("serverTimestamp")}function hP(...r){return new Wc("arrayUnion",r)}function fP(r){return new zc("increment",r)}function MT(r){return new _t(r)}/**
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
 */function J(r){let e;return r instanceof vr?r:(e=Fi(r)?jT(r):r instanceof Array?qT(r):yp(r,void 0),e)}function OB(r){if(r instanceof vr)return r;if(r instanceof _t)return Ti(r);if(Array.isArray(r))return Ti(MT(r));throw new Error("Unsupported value: "+typeof r)}function Xc(r){return iy(r)?Lo(r):J(r)}class vr{constructor(){this._protoValueType="ProtoValue"}add(e){return new L("add",[this,J(e)],"add")}asBoolean(){if(this instanceof er)return this;if(this instanceof _s)return new Ap(this);if(this instanceof Es)return new JT(this);if(this instanceof L)return new Tp(this);throw new H("invalid-argument",`Conversion of type ${typeof this} to BooleanExpression not supported.`)}subtract(e){return new L("subtract",[this,J(e)],"subtract")}multiply(e){return new L("multiply",[this,J(e)],"multiply")}divide(e){return new L("divide",[this,J(e)],"divide")}mod(e){return new L("mod",[this,J(e)],"mod")}equal(e){return new L("equal",[this,J(e)],"equal").asBoolean()}notEqual(e){return new L("not_equal",[this,J(e)],"notEqual").asBoolean()}lessThan(e){return new L("less_than",[this,J(e)],"lessThan").asBoolean()}lessThanOrEqual(e){return new L("less_than_or_equal",[this,J(e)],"lessThanOrEqual").asBoolean()}greaterThan(e){return new L("greater_than",[this,J(e)],"greaterThan").asBoolean()}greaterThanOrEqual(e){return new L("greater_than_or_equal",[this,J(e)],"greaterThanOrEqual").asBoolean()}arrayConcat(e,...t){const n=[e,...t].map((s=>J(s)));return new L("array_concat",[this,...n],"arrayConcat")}arrayContains(e){return new L("array_contains",[this,J(e)],"arrayContains").asBoolean()}arrayContainsAll(e){const t=Array.isArray(e)?new zs(e.map(J),"arrayContainsAll"):e;return new L("array_contains_all",[this,t],"arrayContainsAll").asBoolean()}arrayContainsAny(e){const t=Array.isArray(e)?new zs(e.map(J),"arrayContainsAny"):e;return new L("array_contains_any",[this,t],"arrayContainsAny").asBoolean()}arrayReverse(){return new L("array_reverse",[this])}arrayLength(){return new L("array_length",[this],"arrayLength")}equalAny(e){const t=Array.isArray(e)?new zs(e.map(J),"equalAny"):e;return new L("equal_any",[this,t],"equalAny").asBoolean()}notEqualAny(e){const t=Array.isArray(e)?new zs(e.map(J),"notEqualAny"):e;return new L("not_equal_any",[this,t],"notEqualAny").asBoolean()}exists(){return new L("exists",[this],"exists").asBoolean()}charLength(){return new L("char_length",[this],"charLength")}like(e){return new L("like",[this,J(e)],"like").asBoolean()}regexContains(e){return new L("regex_contains",[this,J(e)],"regexContains").asBoolean()}regexFind(e){return new L("regex_find",[this,J(e)],"regexFind")}regexFindAll(e){return new L("regex_find_all",[this,J(e)],"regexFindAll")}regexMatch(e){return new L("regex_match",[this,J(e)],"regexMatch").asBoolean()}stringContains(e){return new L("string_contains",[this,J(e)],"stringContains").asBoolean()}startsWith(e){return new L("starts_with",[this,J(e)],"startsWith").asBoolean()}endsWith(e){return new L("ends_with",[this,J(e)],"endsWith").asBoolean()}toLower(){return new L("to_lower",[this],"toLower")}toUpper(){return new L("to_upper",[this],"toUpper")}trim(e){const t=[this];return e&&t.push(J(e)),new L("trim",t,"trim")}ltrim(e){const t=[this];return e&&t.push(J(e)),new L("ltrim",t,"ltrim")}rtrim(e){const t=[this];return e&&t.push(J(e)),new L("rtrim",t,"rtrim")}type(){return new L("type",[this])}isType(e){return new L("is_type",[this,Ti(e)],"isType").asBoolean()}stringConcat(e,...t){const n=[e,...t].map(J);return new L("string_concat",[this,...n],"stringConcat")}stringIndexOf(e){return new L("string_index_of",[this,J(e)],"stringIndexOf")}stringRepeat(e){return new L("string_repeat",[this,J(e)],"stringRepeat")}stringReplaceAll(e,t){return new L("string_replace_all",[this,J(e),J(t)],"stringReplaceAll")}stringReplaceOne(e,t){return new L("string_replace_one",[this,J(e),J(t)],"stringReplaceOne")}concat(e,...t){const n=[e,...t].map(J);return new L("concat",[this,...n],"concat")}reverse(){return new L("reverse",[this],"reverse")}arrayFilter(e,t){return new L("array_filter",[this,J(e),t],"arrayFilter")}arrayTransform(e,t){return new L("array_transform",[this,J(e),t],"arrayTransform")}arrayTransformWithIndex(e,t,n){return new L("array_transform",[this,J(e),J(t),n],"arrayTransformWithIndex")}arraySlice(e,t){const n=[this,J(e)];return t!==void 0&&n.push(J(t)),new L("array_slice",n,"arraySlice")}arrayFirst(){return new L("array_first",[this],"arrayFirst")}arrayFirstN(e){return new L("array_first_n",[this,J(e)],"arrayFirstN")}arrayLast(){return new L("array_last",[this],"arrayLast")}arrayLastN(e){return new L("array_last_n",[this,J(e)],"arrayLastN")}arrayMaximum(){return new L("maximum",[this],"arrayMaximum")}arrayMaximumN(e){return new L("maximum_n",[this,J(e)],"arrayMaximumN")}arrayMinimum(){return new L("minimum",[this],"arrayMinimum")}arrayMinimumN(e){return new L("minimum_n",[this,J(e)],"arrayMinimumN")}arrayIndexOf(e){return new L("array_index_of",[this,J(e),J("first")],"arrayIndexOf")}arrayLastIndexOf(e){return new L("array_index_of",[this,J(e),J("last")],"arrayLastIndexOf")}arrayIndexOfAll(e){return new L("array_index_of_all",[this,J(e)],"arrayIndexOfAll")}byteLength(){return new L("byte_length",[this],"byteLength")}ceil(){return new L("ceil",[this])}floor(){return new L("floor",[this])}abs(){return new L("abs",[this])}exp(){return new L("exp",[this])}mapGet(e){return new L("map_get",[this,Ti(e)],"mapGet")}mapSet(e,t,...n){const s=[this,J(e),J(t),...n.map(J)];return new L("map_set",s,"mapSet")}mapKeys(){return new L("map_keys",[this],"mapKeys")}mapValues(){return new L("map_values",[this],"mapValues")}mapEntries(){return new L("map_entries",[this],"mapEntries")}getField(e){return new L("get_field",[this,J(e)],"get_field")}count(){return At._create("count",[this],"count")}sum(){return At._create("sum",[this],"sum")}average(){return At._create("average",[this],"average")}minimum(){return At._create("minimum",[this],"minimum")}maximum(){return At._create("maximum",[this],"maximum")}first(){return At._create("first",[this],"first")}last(){return At._create("last",[this],"last")}arrayAgg(){return At._create("array_agg",[this],"arrayAgg")}arrayAggDistinct(){return At._create("array_agg_distinct",[this],"arrayAggDistinct")}countDistinct(){return At._create("count_distinct",[this],"countDistinct")}logicalMaximum(e,...t){const n=[e,...t];return new L("maximum",[this,...n.map(J)],"logicalMaximum")}logicalMinimum(e,...t){const n=[e,...t];return new L("minimum",[this,...n.map(J)],"minimum")}vectorLength(){return new L("vector_length",[this],"vectorLength")}cosineDistance(e){return new L("cosine_distance",[this,OB(e)],"cosineDistance")}dotProduct(e){return new L("dot_product",[this,OB(e)],"dotProduct")}euclideanDistance(e){return new L("euclidean_distance",[this,OB(e)],"euclideanDistance")}unixMicrosToTimestamp(){return new L("unix_micros_to_timestamp",[this],"unixMicrosToTimestamp")}timestampToUnixMicros(){return new L("timestamp_to_unix_micros",[this],"timestampToUnixMicros")}unixMillisToTimestamp(){return new L("unix_millis_to_timestamp",[this],"unixMillisToTimestamp")}timestampToUnixMillis(){return new L("timestamp_to_unix_millis",[this],"timestampToUnixMillis")}unixSecondsToTimestamp(){return new L("unix_seconds_to_timestamp",[this],"unixSecondsToTimestamp")}timestampToUnixSeconds(){return new L("timestamp_to_unix_seconds",[this],"timestampToUnixSeconds")}timestampAdd(e,t){return new L("timestamp_add",[this,J(e),J(t)],"timestampAdd")}timestampSubtract(e,t){return new L("timestamp_subtract",[this,J(e),J(t)],"timestampSubtract")}timestampDiff(e,t){return new L("timestamp_diff",[this,Xc(e),J(t)],"timestampDiff")}timestampExtract(e,t){const n=[this,J(e)];return t&&n.push(J(t)),new L("timestamp_extract",n,"timestampExtract")}documentId(){return new L("document_id",[this],"documentId")}parent(){return new L("parent",[this],"parent")}substring(e,t){const n=J(e);return new L("substring",t===void 0?[this,n]:[this,n,J(t)],"substring")}arrayGet(e){return new L("array_get",[this,J(e)],"arrayGet")}isError(){return new L("is_error",[this],"isError").asBoolean()}ifError(e){const t=new L("if_error",[this,J(e)],"ifError");return e instanceof er?t.asBoolean():t}isAbsent(){return new L("is_absent",[this],"isAbsent").asBoolean()}mapRemove(e){return new L("map_remove",[this,J(e)],"mapRemove")}mapMerge(e,...t){const n=J(e),s=t.map(J);return new L("map_merge",[this,n,...s],"mapMerge")}pow(e){return new L("pow",[this,J(e)])}trunc(e){return e===void 0?new L("trunc",[this]):new L("trunc",[this,J(e)],"trunc")}round(e){return e===void 0?new L("round",[this]):new L("round",[this,J(e)],"round")}collectionId(){return new L("collection_id",[this])}length(){return new L("length",[this])}ln(){return new L("ln",[this])}sqrt(){return new L("sqrt",[this])}stringReverse(){return new L("string_reverse",[this])}ifAbsent(e){return new L("if_absent",[this,J(e)],"ifAbsent")}ifNull(e){return new L("if_null",[this,J(e)],"ifNull")}coalesce(e,...t){return new L("coalesce",[this,J(e),...t.map(J)],"coalesce")}join(e){return new L("join",[this,J(e)],"join")}log10(){return new L("log10",[this])}arraySum(){return new L("sum",[this])}split(e){return new L("split",[this,J(e)])}timestampTruncate(e,t){const n=[this,J(e)];return t&&n.push(J(t)),new L("timestamp_trunc",n)}ascending(){return KT(this)}descending(){return WT(this)}as(e){return new UT(this,e,"as")}}class At{constructor(e,t){this.name=e,this.params=t,this.exprType="AggregateFunction",this._protoValueType="ProtoValue"}static _create(e,t,n){const s=new At(e,t);return s._methodName=n,s}as(e){return new GT(this,e,"as")}_toProto(e){return{functionValue:{name:this.name,args:this.params.map((t=>t._toProto(e)))}}}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e)))}}class GT{constructor(e,t,n){this.aggregate=e,this.alias=t,this._methodName=n}_readUserData(e){this.aggregate._readUserData(e)}}class UT{constructor(e,t,n){this.expr=e,this.alias=t,this._methodName=n,this.exprType="AliasedExpression",this.selectable=!0}_readUserData(e){this.expr._readUserData(e)}}class zs extends vr{constructor(e,t){super(),this.ur=e,this._methodName=t,this.expressionType="ListOfExpressions"}_toProto(e){return{arrayValue:{values:this.ur.map((t=>t._toProto(e)))}}}_readUserData(e){this.ur.forEach((t=>t._readUserData(e)))}}class Es extends vr{constructor(e,t){super(),this.fieldPath=e,this._methodName=t,this.expressionType="Field",this.selectable=!0}get _fieldPath(){return this.fieldPath}get fieldName(){return this.fieldPath.canonicalString()}get alias(){return this.fieldName}get expr(){return this}geoDistance(e){return new L("geo_distance",[this,J(e)],"geoDistance")}_toProto(e){return{fieldReferenceValue:this.fieldPath.canonicalString()}}_readUserData(e){}}function Lo(r){return HT(r,"field")}function HT(r,e){return new Es(typeof r=="string"?zt===r?sT()._internalPath:yr("field",r):r._internalPath,e)}class _s extends vr{constructor(e,t){super(),this.value=e,this._methodName=t,this.expressionType="Constant"}static _fromProto(e){const t=new _s(e,void 0);return t._protoValue=e,t}_toProto(e){return Q(this._protoValue!==void 0,237),this._protoValue}_getValue(){return this._protoValue}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,xT(this._protoValue)||(this._protoValue=In(this.value,e))}}function Ti(r,e){return yp(r,"constant")}function yp(r,e){const t=new _s(r,e);return typeof r=="boolean"?new Ap(t):t}class L extends vr{constructor(e,t,n,s){super(),this.name=e,this.params=t,this.expressionType="Function",this._optionsProto=void 0,n!==void 0&&(this._methodName=n),s!==void 0&&(this._options=s)}get _optionsUtil(){return new Bt({})}_toProto(e){const t={functionValue:{name:this.name,args:this.params.map((n=>n._toProto(e)))}};return this._optionsProto&&(t.functionValue.options=this._optionsProto),t}_readUserData(e){e=this._methodName?e.contextWith({methodName:this._methodName}):e,this.params.forEach((t=>t._readUserData(e))),this._options&&(this._optionsProto=this._optionsUtil.getOptionsProto(e,this._options))}}class er extends vr{get _methodName(){return this._expr._methodName}countIf(){return At._create("count_if",[this],"countIf")}not(){return new L("not",[this],"not").asBoolean()}conditional(e,t){return new L("conditional",[this,e,t],"conditional")}ifError(e){const t=J(e),n=new L("if_error",[this,t],"ifError");return t instanceof er?n.asBoolean():n}_toProto(e){return this._expr._toProto(e)}_readUserData(e){this._expr._readUserData(e)}}class Tp extends er{constructor(e){super(),this._expr=e,this.expressionType="Function"}}class Ap extends er{constructor(e){super(),this._expr=e,this.expressionType="Constant"}_getValue(){return this._expr._getValue()}}class JT extends er{constructor(e){super(),this._expr=e,this.expressionType="Field"}}function jT(r,e){const t=[];for(const n in r)if(Object.prototype.hasOwnProperty.call(r,n)){const s=r[n];t.push(Ti(n)),t.push(J(s))}return new L("map",t,"map")}function qT(r){return(function(t,n){return new L("array",t.map((s=>J(s))),n)})(r,"array")}function KT(r){return new Rp(Xc(r),"ascending","ascending")}function WT(r){return new Rp(Xc(r),"descending","descending")}class Rp{constructor(e,t,n){this.expr=e,this.direction=t,this._methodName=n,this._protoValueType="ProtoValue"}_toProto(e){return{mapValue:{fields:{direction:up(this.direction),expression:this.expr._toProto(e)}}}}_readUserData(e){this.expr._readUserData(e)}}/**
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
 */class bt{constructor(e){this.optionsProto=void 0,{rawOptions:this.rawOptions,...this.knownOptions}=e}_readUserData(e){this.optionsProto=this._optionsUtil.getOptionsProto(e,this.knownOptions,this.rawOptions)}_toProto(e){return{name:this._name,options:this.optionsProto}}}class vp extends bt{get _name(){return"add_fields"}get _optionsUtil(){return new Bt({})}constructor(e,t){super(t),this.fields=e}_toProto(e){return{...super._toProto(e),args:[yi(e,this.fields)]}}_readUserData(e){super._readUserData(e),tr(this.fields,e)}}class Pp extends bt{get _name(){return"aggregate"}get _optionsUtil(){return new Bt({})}constructor(e,t,n){super(n),this.groups=e,this.accumulators=t}_toProto(e){return{...super._toProto(e),args:[yi(e,this.accumulators),yi(e,this.groups)]}}_readUserData(e){super._readUserData(e),tr(this.groups,e),tr(this.accumulators,e)}}class Sp extends bt{get _name(){return"distinct"}get _optionsUtil(){return new Bt({})}constructor(e,t){super(t),this.groups=e}_toProto(e){return{...super._toProto(e),args:[yi(e,this.groups)]}}_readUserData(e){super._readUserData(e),tr(this.groups,e)}}class Oa extends bt{get _name(){return"collection"}get _optionsUtil(){return new Bt({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.Er=e.startsWith("/")?e:"/"+e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:this.Er}]}}_readUserData(e){super._readUserData(e)}}class ba extends bt{get _name(){return"collection_group"}get _optionsUtil(){return new Bt({forceIndex:{serverName:"force_index"}})}constructor(e,t){super(t),this.collectionId=e}_toProto(e){return{...super._toProto(e),args:[{referenceValue:""},{stringValue:this.collectionId}]}}_readUserData(e){super._readUserData(e)}}class Zc extends bt{get _name(){return"database"}get _optionsUtil(){return new Bt({})}_toProto(e){return{...super._toProto(e)}}_readUserData(e){super._readUserData(e)}}class eu extends bt{get _name(){return"documents"}get _optionsUtil(){return new Bt({})}constructor(e,t){if(super(t),!e||e.length===0)throw new H(F.INVALID_ARGUMENT,"Empty document paths are not allowed in DocumentsSource");const n=e.map((i=>i.startsWith("/")?i:"/"+i)),s=new Set(n);if(s.size!==n.length)throw new H(F.INVALID_ARGUMENT,"Duplicate document paths are not allowed in DocumentsSource");this.hr=n,this.Tr=s}_toProto(e){return{...super._toProto(e),args:this.hr.map((t=>({referenceValue:t})))}}_readUserData(e){super._readUserData(e)}}class Na extends bt{get _name(){return"where"}get _optionsUtil(){return new Bt({})}constructor(e,t){super(t),this.condition=e}_toProto(e){return{...super._toProto(e),args:[this.condition._toProto(e)]}}_readUserData(e){super._readUserData(e),tr(this.condition,e)}}class Tr extends bt{get _name(){return"limit"}get _optionsUtil(){return new Bt({})}constructor(e,t){Q(!isNaN(e)&&e!==1/0&&e!==-1/0,34860),super(t),this.limit=e}_toProto(e){return{...super._toProto(e),args:[_a(e,this.limit)]}}}class wf extends bt{get _name(){return"offset"}get _optionsUtil(){return new Bt({})}constructor(e,t){super(t),this.offset=e}_toProto(e){return{...super._toProto(e),args:[_a(e,this.offset)]}}}class zT extends bt{get _name(){return"select"}get _optionsUtil(){return new Bt({})}constructor(e,t){super(t),this.selections=e}_toProto(e){return{...super._toProto(e),args:[yi(e,this.selections)]}}_readUserData(e){super._readUserData(e),tr(this.selections,e)}}class hn extends bt{get _name(){return"sort"}get _optionsUtil(){return new Bt({})}constructor(e,t){super(t),this.orderings=e}_toProto(e){return{...super._toProto(e),args:this.orderings.map((t=>t._toProto(e)))}}_readUserData(e){super._readUserData(e),tr(this.orderings,e)}}class tu extends bt{get _name(){return"replace_with"}get _optionsUtil(){return new Bt({})}constructor(e,t){super(t),this.map=e}_toProto(e){return{...super._toProto(e),args:[this.map._toProto(e),up(tu.Pr)]}}_readUserData(e){super._readUserData(e),tr(this.map,e)}}tu.Pr="full_replace";function tr(r,e){return wp(r)?r._readUserData(e):Array.isArray(r)?r.forEach((t=>t._readUserData(e))):r instanceof Map?r.forEach((t=>t._readUserData(e))):Object.values(r).forEach((t=>t._readUserData(e))),r}/**
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
 */class oi{constructor(e,t,n,s){this._db=e,this.userDataReader=t,this._userDataWriter=n,this.stages=s}Ar(e,t){const n=this.userDataReader.createContext(3,e);return wp(t)?t._readUserData(n):Array.isArray(t)?t.forEach((s=>s._readUserData(n))):t.forEach((s=>s._readUserData(n))),t}where(e){const t=this.stages.map((n=>n));return this.Ar("where",e),t.push(new Na(e,{})),new oi(this._db,this.userDataReader,this._userDataWriter,t)}limit(e){const t=this.stages.map((n=>n));return t.push(new Tr(e,{})),new oi(this._db,this.userDataReader,this._userDataWriter,t)}sort(e,...t){const n=this.stages.map((s=>s));return"orderings"in e?n.push(new hn(this.Ar("sort",e.orderings),{})):n.push(new hn(this.Ar("sort",[e,...t]),{})),new oi(this._db,this.userDataReader,this._userDataWriter,n)}Vr(e){return{pipeline:{stages:this.stages.map((t=>t._toProto(e)))}}}}// Copyright 2024 Google LLC* @license
class lt{constructor(e,t,n){this.serializer=e,this.stages=t,this.listenOptions=n,this.isCorePipeline=!0}getPipelineCollection(){return La(this)}getPipelineCollectionGroup(){return nu(this)}getPipelineCollectionId(){return QT(this)}getPipelineDocuments(){return oc(this)}getPipelineFlavor(){return(function(t){let n="exact";return t.stages.forEach(((s,i)=>{s._name!==Sp.name&&s._name!==Pp.name||(n="keyless"),s._name===zT.name&&n==="exact"&&(n="augmented"),s._name===vp.name&&i<t.stages.length-1&&n==="exact"&&(n="augmented")})),n})(this)}getPipelineSourceType(){return qn(this)}}function qn(r){const e=r.stages[0];return e instanceof Oa||e instanceof ba||e instanceof Zc||e instanceof eu?e._name:"unknown"}function La(r){if(qn(r)==="collection")return r.stages[0].Er}function nu(r){if(qn(r)==="collection_group")return r.stages[0].collectionId}function QT(r){switch(qn(r)){case"collection":return Ce.fromString(La(r)).lastSegment();case"collection_group":return nu(r);default:return}}function oc(r){if(qn(r)==="documents")return r.stages[0].hr}class y{constructor(e,t){this.type=e,this.value=t}static dr(){return new y("ERROR",void 0)}static mr(){return new y("UNSET",void 0)}static pr(){return new y("NULL",Zr)}static newValue(e){return Pt(e)?new y("NULL",Zr):(function(n){return!!n&&"booleanValue"in n})(e)?new y("BOOLEAN",e):Qt(e)?new y("INT",e):gr(e)?new y("DOUBLE",e):(function(n){return!!n&&"timestampValue"in n&&!!n.timestampValue})(e)?new y("TIMESTAMP",e):(function(n){return!!n&&"stringValue"in n})(e)?new y("STRING",e):(function(n){return!!n&&"bytesValue"in n})(e)?new y("BYTES",e):e.referenceValue?new y("REFERENCE",e):e.geoPointValue?new y("GEO_POINT",e):ts(e)?new y("ARRAY",e):Jo(e)?new y("VECTOR",e):Er(e)?new y("MAP",e):new y("ERROR",void 0)}gr(){return this.type==="ERROR"||this.type==="UNSET"}yr(){return this.type==="NULL"}}function ai(r){if(!r.gr())return r.value}function Op(r){return r instanceof er?r._expr:r}function ee(r){if((r=Op(r))instanceof Es)return new $T(r);if(r instanceof _s)return new YT(r);if(r instanceof zs)return new XT(r);if(r instanceof L){if(r.name==="add")return new tA(r);if(r.name==="subtract")return new nA(r);if(r.name==="multiply")return new rA(r);if(r.name==="divide")return new sA(r);if(r.name==="mod")return new iA(r);if(r.name==="and")return new oA(r);if(r.name==="equal")return new mA(r);if(r.name==="not_equal")return new EA(r);if(r.name==="less_than")return new _A(r);if(r.name==="less_than_or_equal")return new DA(r);if(r.name==="greater_than")return new IA(r);if(r.name==="greater_than_or_equal")return new wA(r);if(r.name==="array_concat")return new yA(r);if(r.name==="array_reverse")return new TA(r);if(r.name==="array_contains")return new AA(r);if(r.name==="array_contains_all")return new RA(r);if(r.name==="array_contains_any")return new vA(r);if(r.name==="array_length")return new PA(r);if(r.name==="array_element")return new SA(r);if(r.name==="equal_any")return new bp(r);if(r.name==="not_equal_any")return new BA(r);if(r.name==="is_nan")return new cA(r);if(r.name==="is_not_nan")return new uA(r);if(r.name==="is_null")return new lA(r);if(r.name==="is_not_null")return new hA(r);if(r.name==="is_error")return new fA(r);if(r.name==="exists")return new dA(r);if(r.name==="not")return new Fa(r);if(r.name==="or")return new aA(r);if(r.name==="xor")return new ru(r);if(r.name==="conditional")return new CA(r);if(r.name==="maximum")return new pA(r);if(r.name==="minimum")return new gA(r);if(r.name==="reverse")return new OA(r);if(r.name==="replace_first")return new bA(r);if(r.name==="replace_all")return new NA(r);if(r.name==="char_length")return new LA(r);if(r.name==="byte_length")return new FA(r);if(r.name==="like")return new kA(r);if(r.name==="regex_contains")return new VA(r);if(r.name==="regex_match")return new xA(r);if(r.name==="string_contains")return new MA(r);if(r.name==="starts_with")return new GA(r);if(r.name==="ends_with")return new UA(r);if(r.name==="to_lower")return new HA(r);if(r.name==="to_upper")return new JA(r);if(r.name==="trim")return new jA(r);if(r.name==="string_concat")return new qA(r);if(r.name==="map_get")return new KA(r);if(r.name==="cosine_distance")return new WA(r);if(r.name==="dot_product")return new zA(r);if(r.name==="euclidean_distance")return new QA(r);if(r.name==="vector_length")return new $A(r);if(r.name==="unix_micros_to_timestamp")return new tR(r);if(r.name==="timestamp_to_unix_micros")return new sR(r);if(r.name==="unix_millis_to_timestamp")return new nR(r);if(r.name==="timestamp_to_unix_millis")return new iR(r);if(r.name==="unix_seconds_to_timestamp")return new rR(r);if(r.name==="timestamp_to_unix_seconds")return new oR(r);if(r.name==="timestamp_add")return new aR(r);if(r.name==="timestamp_subtract")return new BR(r)}throw new Error(`Unknown Expr : ${r}`)}class $T{constructor(e){this.expr=e}evaluate(e,t){if(this.expr.fieldName===zt)return y.newValue({referenceValue:wi(e.serializer,t.key)});if(this.expr.fieldName==="__update_time__")return y.newValue({timestampValue:No(e.serializer,t.version)});if(this.expr.fieldName==="__create_time__")return y.newValue({timestampValue:No(e.serializer,t.createTime)});const n=t.data.field(this.expr._fieldPath);return n?ma(n)?y.newValue((function(i,o){if(i.serverTimestampBehavior==="estimate")return{timestampValue:No(i.serializer,te.fromTimestamp(Xr(o)))};if(i.serverTimestampBehavior==="previous"){const B=Vi(o);if(B)return B}return{nullValue:"NULL_VALUE"}})(e,n)):y.newValue(n):y.mr()}}class YT{constructor(e){this.expr=e}evaluate(e,t){return y.newValue(this.expr._getValue())}}class XT{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.ur.map((s=>ee(s).evaluate(e,t)));return n.some((s=>s.gr()))?y.dr():y.newValue({arrayValue:{values:n.map((s=>s.value))}})}}function nt(r){return gr(r)?Number(r.doubleValue):Number(r.integerValue)}function nn(r){return BigInt(r.integerValue)}const ZT=BigInt("0x7fffffffffffffff"),eA=-BigInt("0x8000000000000000");class ji{constructor(e){this.expr=e}evaluate(e,t){Q(this.expr.params.length>=2,24778);const n=ee(this.expr.params[0]).evaluate(e,t),s=ee(this.expr.params[1]).evaluate(e,t);let i=this.wr(n,s);for(const o of this.expr.params.slice(2)){const B=ee(o).evaluate(e,t);i=this.wr(i,B)}return i}wr(e,t){if(e.gr()||t.gr())return y.dr();if(e.yr()||t.yr())return y.pr();const n=e.value,s=t.value;if(!gr(n)&&!Qt(n)||!gr(s)&&!Qt(s))return y.dr();if(gr(n)||gr(s)){const i=this.br(n,s);return i?y.newValue(i):y.dr()}if(Qt(n)&&Qt(s)){const i=this.Sr(n,s);return i===void 0?y.dr():typeof i=="number"?y.newValue({doubleValue:i}):i<eA||i>ZT?y.dr():y.newValue({integerValue:`${i}`})}return y.dr()}}function wn(r,e){return He(r)!==He(e)?"TYPE_MISMATCH":wt(r)||wt(e)?"NOT_EQ":Pt(r)&&Pt(e)?"EQ":Pt(r)||Pt(e)?"NULL":ts(r)&&ts(e)?(function(n,s){var o,B,c;if(((o=n.values)==null?void 0:o.length)!==((B=s.values)==null?void 0:B.length))return"NOT_EQ";let i=!1;for(let u=0;u<(((c=n.values)==null?void 0:c.length)??0);u++){const h=n.values[u],d=s.values[u];switch(wn(h,d)){case"EQ":break;case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":i=!0;break;default:Y(44609,{vr:h,Dr:d})}}return i?"NULL":"EQ"})(r.arrayValue,e.arrayValue):Jo(r)&&Jo(e)||Er(r)&&Er(e)?(function(n,s){const i=n.fields||{},o=s.fields||{};if(Ho(i)!==Ho(o))return"NOT_EQ";let B=!1;for(const c in i)if(i.hasOwnProperty(c)){if(o[c]===void 0)return"NOT_EQ";switch(wn(i[c],o[c])){case"NOT_EQ":case"TYPE_MISMATCH":return"NOT_EQ";case"NULL":B=!0}}return B?"NULL":"EQ"})(r.mapValue,e.mapValue):(function(n,s){return Gt(n,s,{o:!1,t:!0,i:!0})})(r,e)?"EQ":"NOT_EQ"}class tA extends ji{Sr(e,t){return nn(e)+nn(t)}br(e,t){return{doubleValue:nt(e)+nt(t)}}}class nA extends ji{constructor(e){super(e),this.expr=e}Sr(e,t){return nn(e)-nn(t)}br(e,t){return{doubleValue:nt(e)-nt(t)}}}class rA extends ji{constructor(e){super(e),this.expr=e}Sr(e,t){return nn(e)*nn(t)}br(e,t){return{doubleValue:nt(e)*nt(t)}}}class sA extends ji{constructor(e){super(e),this.expr=e}Sr(e,t){const n=nn(t);if(n!==BigInt(0))return nn(e)/n}br(e,t){const n=nt(t);return n===0?{doubleValue:gi(n)?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY}:{doubleValue:nt(e)/n}}}class iA extends ji{constructor(e){super(e),this.expr=e}Sr(e,t){const n=nn(t);if(n!==BigInt(0))return nn(e)%n}br(e,t){const n=nt(t);if(n!==0)return{doubleValue:nt(e)%n}}}class oA{constructor(e){this.expr=e}evaluate(e,t){var i;let n=!1,s=!1;for(const o of this.expr.params){const B=ee(o).evaluate(e,t);switch(B.type){case"BOOLEAN":if(!((i=B.value)!=null&&i.booleanValue))return y.newValue(Xe);break;case"NULL":s=!0;break;default:n=!0}}return n?y.dr():s?y.pr():y.newValue(Dt)}}class Fa{constructor(e){this.expr=e}evaluate(e,t){var s;Q(this.expr.params.length===1,9634);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"BOOLEAN":return y.newValue({booleanValue:!((s=n.value)!=null&&s.booleanValue)});case"NULL":return y.pr();default:return y.dr()}}}class aA{constructor(e){this.expr=e}evaluate(e,t){var i;let n=!1,s=!1;for(const o of this.expr.params){const B=ee(o).evaluate(e,t);switch(B.type){case"BOOLEAN":if((i=B.value)!=null&&i.booleanValue)return y.newValue(Dt);break;case"NULL":s=!0;break;default:n=!0}}return n?y.dr():s?y.pr():y.newValue(Xe)}}class ru{constructor(e){this.expr=e}evaluate(e,t){var i;let n=!1,s=!1;for(const o of this.expr.params){const B=ee(o).evaluate(e,t);switch(B.type){case"BOOLEAN":n=ru.xor(n,!!((i=B.value)!=null&&i.booleanValue));break;case"NULL":s=!0;break;default:return y.dr()}}return s?y.pr():y.newValue({booleanValue:n})}static xor(e,t){return(e||t)&&!(e&&t)}}class bp{constructor(e){this.expr=e}evaluate(e,t){var o,B;Q(this.expr.params.length===2,55094);let n=!1;const s=ee(this.expr.params[0]).evaluate(e,t);switch(s.type){case"NULL":n=!0;break;case"ERROR":case"UNSET":return y.dr()}const i=ee(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":n=!0;break;default:return y.dr()}if(n)return y.pr();for(const c of((B=(o=i.value)==null?void 0:o.arrayValue)==null?void 0:B.values)??[])switch(Pt(s.value)&&Pt(c)?"EQ":wn(s.value,c)){case"EQ":return y.newValue(Dt);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":n=!0;break;default:Y(44608,{value:s.value,candidate:c})}return n?y.pr():y.newValue(Xe)}}class BA{constructor(e){this.expr=e}evaluate(e,t){return new Fa(new L("not",[new L("equal_any",this.expr.params)])).evaluate(e,t)}}class cA{constructor(e){this.expr=e}evaluate(e,t){Q(this.expr.params.length===1,23322);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"INT":return y.newValue(Xe);case"DOUBLE":return y.newValue({booleanValue:isNaN(nt(n.value))});case"NULL":return y.pr();default:return y.dr()}}}class uA{constructor(e){this.expr=e}evaluate(e,t){return Q(this.expr.params.length===1,50406),new Fa(new L("not",[new L("is_nan",this.expr.params)])).evaluate(e,t)}}class lA{constructor(e){this.expr=e}evaluate(e,t){switch(Q(this.expr.params.length===1,23123),ee(this.expr.params[0]).evaluate(e,t).type){case"NULL":return y.newValue(Dt);case"UNSET":case"ERROR":return y.dr();default:return y.newValue(Xe)}}}class hA{constructor(e){this.expr=e}evaluate(e,t){return Q(this.expr.params.length===1,23167),new Fa(new L("not",[new L("is_null",this.expr.params)])).evaluate(e,t)}}class fA{constructor(e){this.expr=e}evaluate(e,t){return Q(this.expr.params.length===1,5228),ee(this.expr.params[0]).evaluate(e,t).type==="ERROR"?y.newValue(Dt):y.newValue(Xe)}}class dA{constructor(e){this.expr=e}evaluate(e,t){switch(Q(this.expr.params.length===1,6877),ee(this.expr.params[0]).evaluate(e,t).type){case"ERROR":return y.dr();case"UNSET":return y.newValue(Xe);default:return y.newValue(Dt)}}}class CA{constructor(e){this.expr=e}evaluate(e,t){var s;Q(this.expr.params.length===3,11706);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"BOOLEAN":return(s=n.value)!=null&&s.booleanValue?ee(this.expr.params[1]).evaluate(e,t):ee(this.expr.params[2]).evaluate(e,t);case"NULL":return ee(this.expr.params[2]).evaluate(e,t);default:return y.dr()}}}class pA{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map((i=>ee(i).evaluate(e,t)));let s;for(const i of n)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||It(i.value,s.value)>0?i:s}return s===void 0?y.pr():s}}class gA{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map((i=>ee(i).evaluate(e,t)));let s;for(const i of n)switch(i.type){case"ERROR":case"UNSET":case"NULL":continue;default:s=s===void 0||It(i.value,s.value)<0?i:s}return s===void 0?y.pr():s}}class Ds{constructor(e){this.expr=e}evaluate(e,t){Q(this.expr.params.length===2,31033,`${this.expr.name}() function should have exactly 2 params`);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"ERROR":case"UNSET":return y.dr()}const s=ee(this.expr.params[1]).evaluate(e,t);switch(s.type){case"ERROR":case"UNSET":return y.dr()}return this.Cr(n,s)}}class mA extends Ds{constructor(e){super(e),this.expr=e}Cr(e,t){if(e.yr()&&t.yr())return y.newValue(Dt);if(e.yr()||t.yr()||wt(e.value)||wt(t.value)||He(e.value)!==He(t.value))return y.newValue(Xe);switch(wn(e.value,t.value)){case"EQ":return y.newValue(Dt);case"NOT_EQ":return y.newValue(Xe);case"NULL":return y.pr();default:Y(44615,{left:e,right:t})}}}class EA extends Ds{constructor(e){super(e),this.expr=e}Cr(e,t){switch(wn(e.value,t.value)){case"EQ":return y.newValue(Xe);case"NOT_EQ":case"TYPE_MISMATCH":return y.newValue(Dt);case"NULL":return y.pr();default:Y(44614,{left:e,right:t})}}}class _A extends Ds{constructor(e){super(e),this.expr=e}Cr(e,t){return He(e.value)!==He(t.value)||wt(e.value)||wt(t.value)?y.newValue(Xe):y.newValue({booleanValue:It(e.value,t.value)<0})}}class DA extends Ds{constructor(e){super(e),this.expr=e}Cr(e,t){return He(e.value)!==He(t.value)||wt(e.value)||wt(t.value)?y.newValue(Xe):wn(e.value,t.value)==="EQ"?y.newValue(Dt):y.newValue({booleanValue:It(e.value,t.value)<0})}}class IA extends Ds{constructor(e){super(e),this.expr=e}Cr(e,t){return He(e.value)!==He(t.value)||wt(e.value)||wt(t.value)?y.newValue(Xe):y.newValue({booleanValue:It(e.value,t.value)>0})}}class wA extends Ds{constructor(e){super(e),this.expr=e}Cr(e,t){return He(e.value)!==He(t.value)||wt(e.value)||wt(t.value)?y.newValue(Xe):wn(e.value,t.value)==="EQ"?y.newValue(Dt):y.newValue({booleanValue:It(e.value,t.value)>0})}}class yA{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class TA{constructor(e){this.expr=e}evaluate(e,t){var s;Q(this.expr.params.length===1,216);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return y.pr();case"ARRAY":{const i=((s=n.value.arrayValue)==null?void 0:s.values)??[];return y.newValue({arrayValue:{values:[...i].reverse()}})}default:return y.dr()}}}class AA{constructor(e){this.expr=e}evaluate(e,t){return Q(this.expr.params.length===2,52884),new bp(new L("eq_any",[this.expr.params[1],this.expr.params[0]])).evaluate(e,t)}}class RA{constructor(e){this.expr=e}evaluate(e,t){var c,u,h,d;Q(this.expr.params.length===2,1392);let n=!1;const s=ee(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":n=!0;break;default:return y.dr()}const i=ee(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":n=!0;break;default:return y.dr()}if(n)return y.pr();const o=((u=(c=i.value)==null?void 0:c.arrayValue)==null?void 0:u.values)??[],B=((d=(h=s.value)==null?void 0:h.arrayValue)==null?void 0:d.values)??[];for(const p of o){let I=!1;n=!1;for(const R of B){switch(Pt(p)&&Pt(R)?"EQ":wn(p,R)){case"EQ":I=!0;break;case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":n=!0;break;default:Y(44613,{value:R,search:p})}if(I)break}if(!I)return y.newValue(Xe)}return y.newValue(Dt)}}class vA{constructor(e){this.expr=e}evaluate(e,t){var c,u,h,d;Q(this.expr.params.length===2,2680);let n=!1;const s=ee(this.expr.params[0]).evaluate(e,t);switch(s.type){case"ARRAY":break;case"NULL":n=!0;break;default:return y.dr()}const i=ee(this.expr.params[1]).evaluate(e,t);switch(i.type){case"ARRAY":break;case"NULL":n=!0;break;default:return y.dr()}if(n)return y.pr();const o=((u=(c=i.value)==null?void 0:c.arrayValue)==null?void 0:u.values)??[],B=((d=(h=s.value)==null?void 0:h.arrayValue)==null?void 0:d.values)??[];for(const p of B)for(const I of o)switch(Pt(p)&&Pt(I)?"EQ":wn(p,I)){case"EQ":return y.newValue(Dt);case"NOT_EQ":case"TYPE_MISMATCH":break;case"NULL":n=!0;break;default:Y(60403,{value:p,search:I})}return n?y.pr():y.newValue(Xe)}}class PA{constructor(e){this.expr=e}evaluate(e,t){var s,i,o;Q(this.expr.params.length===1,38605);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return y.pr();case"ARRAY":return y.newValue({integerValue:`${((o=(i=(s=n.value)==null?void 0:s.arrayValue)==null?void 0:i.values)==null?void 0:o.length)??0}`});default:return y.dr()}}}class SA{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class OA{constructor(e){this.expr=e}evaluate(e,t){var s,i;Q(this.expr.params.length===1,1508);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return y.pr();case"BYTES":{const o=(s=n.value)==null?void 0:s.bytesValue;if(typeof o=="string"){const B=Ue.fromBase64String(o).toUint8Array();return B.reverse(),y.newValue({bytesValue:Ue.fromUint8Array(B).toBase64()})}return y.newValue({bytesValue:new Uint8Array(o).reverse()})}case"STRING":{const o=(i=n.value)==null?void 0:i.stringValue,B=new Intl.__PRIVATE_Segmenter(void 0,{granularity:"grapheme"}).segment(o),c=Array.from(B,(u=>u.segment)).reverse();return y.newValue({stringValue:c.join("")})}default:return y.dr()}}}class bA{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class NA{constructor(e){this.expr=e}evaluate(e,t){throw new Error("Unimplemented")}}class LA{constructor(e){this.expr=e}evaluate(e,t){Q(this.expr.params.length===1,19400);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"NULL":return y.pr();case"STRING":{const s=(function(o){let B=0;for(let c=0;c<o.length;c++){const u=o.codePointAt(c);if(u===void 0)return;if(u<=65535)if(u>=55296&&u<=57343)if(u<=56319){const h=o.codePointAt(c+1);h!==void 0&&h>=56320&&h<=57343?(B+=1,c++):B+=1}else B+=1;else B+=1;else{if(!(u<=1114111))return;B+=1,c++}}return B})(n.value.stringValue);return s===void 0?y.dr():y.newValue({integerValue:s})}default:return y.dr()}}}class FA{constructor(e){this.expr=e}evaluate(e,t){var s,i;Q(this.expr.params.length===1,8486);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"BYTES":{const o=(s=n.value)==null?void 0:s.bytesValue;return typeof o=="string"?y.newValue({integerValue:Ue.fromBase64String(o).toUint8Array().length}):y.newValue({integerValue:new Uint8Array(o).length})}case"STRING":{const o=(function(c){let u=0;for(let h=0;h<c.length;h++){const d=c.codePointAt(h);if(d===void 0)return;if(d>=55296&&d<=57343){if(!(d<=56319))return;{const p=c.codePointAt(h+1);if(p===void 0||!(p>=56320&&p<=57343))return;u+=4,h++}}else if(d<=127)u+=1;else if(d<=2047)u+=2;else if(d<=65535)u+=3;else{if(!(d<=1114111))return;u+=4,h++}}return u})((i=n.value)==null?void 0:i.stringValue);return o===void 0?y.dr():y.newValue({integerValue:o})}case"NULL":return y.pr();default:return y.dr()}}}class Is{constructor(e){this.expr=e}evaluate(e,t){var o,B;Q(this.expr.params.length===2,39773,`${this.expr.name}() function should have exactly two parameters`);let n=!1;const s=ee(this.expr.params[0]).evaluate(e,t);switch(s.type){case"STRING":break;case"NULL":n=!0;break;default:return y.dr()}const i=ee(this.expr.params[1]).evaluate(e,t);switch(i.type){case"STRING":break;case"NULL":n=!0;break;default:return y.dr()}return n?y.pr():this.Fr((o=s.value)==null?void 0:o.stringValue,(B=i.value)==null?void 0:B.stringValue)}}class kA extends Is{Fr(e,t){try{const n=(function(o){let B="";for(let c=0;c<o.length;c++){const u=o.charAt(c);switch(u){case"_":B+=".";break;case"%":B+=".*";break;case"\\":case".":case"*":case"?":case"+":case"^":case"$":case"|":case"(":case")":case"[":case"]":case"{":case"}":B+="\\"+u;break;default:B+=u}}return"^"+B+"$"})(t),s=Lc.compile(n);return y.newValue({booleanValue:s.matches(e)})}catch(n){return Jt(`Invalid LIKE pattern converted to regex: ${t}, returning error. Error: ${n}`),y.dr()}}}class VA extends Is{Fr(e,t){try{const n=Lc.compile(t);return y.newValue({booleanValue:n.test(e)})}catch{return Jt(`Invalid regex pattern found in regex_contains: ${t}, returning error`),y.dr()}}}class xA extends Is{Fr(e,t){try{return y.newValue({booleanValue:Lc.compile(t).matches(e)})}catch{return Jt(`Invalid regex pattern found in regex_match: ${t}, returning error`),y.dr()}}}class MA extends Is{Fr(e,t){return y.newValue({booleanValue:e.includes(t)})}}class GA extends Is{Fr(e,t){return y.newValue({booleanValue:e.startsWith(t)})}}class UA extends Is{Fr(e,t){return y.newValue({booleanValue:e.endsWith(t)})}}class HA{constructor(e){this.expr=e}evaluate(e,t){var s,i;Q(this.expr.params.length===1,29079);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":return y.newValue({stringValue:(i=(s=n.value)==null?void 0:s.stringValue)==null?void 0:i.toLowerCase()});case"NULL":return y.pr();default:return y.dr()}}}class JA{constructor(e){this.expr=e}evaluate(e,t){var s,i;Q(this.expr.params.length===1,60487);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":return y.newValue({stringValue:(i=(s=n.value)==null?void 0:s.stringValue)==null?void 0:i.toUpperCase()});case"NULL":return y.pr();default:return y.dr()}}}class jA{constructor(e){this.expr=e}evaluate(e,t){var s,i;Q(this.expr.params.length===1,28544);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"STRING":return y.newValue({stringValue:(i=(s=n.value)==null?void 0:s.stringValue)==null?void 0:i.trim()});case"NULL":return y.pr();default:return y.dr()}}}class qA{constructor(e){this.expr=e}evaluate(e,t){const n=this.expr.params.map((o=>ee(o).evaluate(e,t)));let s="",i=!1;for(const o of n)switch(o.type){case"STRING":s+=o.value.stringValue;break;case"NULL":i=!0;break;default:return y.dr()}return i?y.pr():y.newValue({stringValue:s})}}class KA{constructor(e){this.expr=e}evaluate(e,t){var o,B,c,u;Q(this.expr.params.length===2,4483);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"UNSET":return y.mr();case"MAP":break;default:return y.dr()}const s=ee(this.expr.params[1]).evaluate(e,t);if(s.type!=="STRING")return y.dr();const i=(u=(B=(o=n.value)==null?void 0:o.mapValue)==null?void 0:B.fields)==null?void 0:u[(c=s.value)==null?void 0:c.stringValue];return i===void 0?y.mr():y.newValue(i)}}class su{constructor(e){this.expr=e}evaluate(e,t){var u,h;Q(this.expr.params.length===2,25231,`${this.expr.name}() function should have exactly 2 params`);let n=!1;const s=ee(this.expr.params[0]).evaluate(e,t);switch(s.type){case"VECTOR":break;case"NULL":n=!0;break;default:return y.dr()}const i=ee(this.expr.params[1]).evaluate(e,t);switch(i.type){case"VECTOR":break;case"NULL":n=!0;break;default:return y.dr()}if(n)return y.pr();const o=ZB(s.value),B=ZB(i.value);if(o===void 0||B===void 0||((u=o.values)==null?void 0:u.length)!==((h=B.values)==null?void 0:h.length))return y.dr();const c=this.Or(o,B);return c===void 0||isNaN(c)?y.dr():y.newValue({doubleValue:c})}}class WA extends su{Or(e,t){const n=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(n.length===0)return;let i=0,o=0,B=0;for(let u=0;u<n.length;u++){if(!Xn(n[u])||!Xn(s[u]))return;const h=nt(n[u]),d=nt(s[u]);i+=h*d,o+=h*h,B+=d*d}const c=Math.sqrt(o)*Math.sqrt(B);if(c!==0)return 1-Math.max(-1,Math.min(1,i/c))}}class zA extends su{Or(e,t){const n=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(n.length===0)return 0;let i=0;for(let o=0;o<n.length;o++){if(!Xn(n[o])||!Xn(s[o]))return;i+=nt(n[o])*nt(s[o])}return i}}class QA extends su{Or(e,t){const n=(e==null?void 0:e.values)??[],s=(t==null?void 0:t.values)??[];if(n.length===0)return 0;let i=0;for(let o=0;o<n.length;o++){if(!Xn(n[o])||!Xn(s[o]))return;const B=nt(n[o]),c=nt(s[o]);i+=Math.pow(B-c,2)}return Math.sqrt(i)}}class $A{constructor(e){this.expr=e}evaluate(e,t){var s;Q(this.expr.params.length===1,39044);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"VECTOR":{const i=ZB(n.value);return y.newValue({integerValue:((s=i==null?void 0:i.values)==null?void 0:s.length)??0})}case"NULL":return y.pr();default:return y.dr()}}}const Ai=BigInt(-62135596800),Ri=BigInt(253402300799),Xo=BigInt(1e3),Kn=BigInt(1e6),YA=Ai*Xo,XA=Ri*Xo+BigInt(999),ZA=Ai*Kn,eR=Ri*Kn+BigInt(999999);function iu(r){return r>=ZA&&r<=eR}function Np(r){return r>=Ai&&r<=Ri}function vi(r,e){const t=BigInt(r);return!(t<Ai||t>Ri)&&!(e<0||e>=1e9)&&(t!==Ai||e===0)&&!(t===Ri&&e>999999999)}function Lp(r,e){return e<0?{seconds:r-1,nanos:e+1e9}:{seconds:r,nanos:e}}function ou(r){return BigInt(r.seconds)*Kn+BigInt(Math.trunc(r.nanoseconds/1e3))}class au{constructor(e){this.expr=e}evaluate(e,t){Q(this.expr.params.length===1,49262,`${this.expr.name}() function should have exactly one parameter`);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"INT":return this.toTimestamp(BigInt(n.value.integerValue));case"NULL":return y.pr();default:return y.dr()}}}class tR extends au{toTimestamp(e){if(!iu(e))return y.dr();let t=Number(e/Kn),n=Number(e%Kn*BigInt(1e3));const s=Lp(t,n);return t=s.seconds,n=s.nanos,vi(t,n)?y.newValue({timestampValue:{seconds:t,nanos:n}}):y.dr()}}class nR extends au{toTimestamp(e){if(!(function(o){return o>=YA&&o<=XA})(e))return y.dr();let t=Number(e/Xo),n=Number(e%Xo*BigInt(1e6));const s=Lp(t,n);return t=s.seconds,n=s.nanos,vi(t,n)?y.newValue({timestampValue:{seconds:t,nanos:n}}):y.dr()}}class rR extends au{toTimestamp(e){if(!Np(e))return y.dr();const t=Number(e);return y.newValue({timestampValue:{seconds:t,nanos:0}})}}class Bu{constructor(e){this.expr=e}evaluate(e,t){Q(this.expr.params.length===1,1265,`${this.expr.name}() function should have exactly one parameter`);const n=ee(this.expr.params[0]).evaluate(e,t);switch(n.type){case"TIMESTAMP":break;case"NULL":return y.pr();default:return y.dr()}const s=Jc(n.value.timestampValue);return vi(s.seconds,s.nanoseconds)?this.Mr(s):y.dr()}}class sR extends Bu{Mr(e){const t=ou(e);return iu(t)?y.newValue({integerValue:`${t.toString()}`}):y.dr()}}class iR extends Bu{Mr(e){const t=ou(e),n=t/BigInt(1e3),s=t%BigInt(1e3);return n>BigInt(0)||s===BigInt(0)?y.newValue({integerValue:n.toString()}):y.newValue({integerValue:(n-BigInt(1)).toString()})}}class oR extends Bu{Mr(e){const t=BigInt(e.seconds);return Np(t)?y.newValue({integerValue:t.toString()}):y.dr()}}class Fp{constructor(e){this.expr=e}evaluate(e,t){Q(this.expr.params.length===3,2775,`${this.expr.name}() function should have exactly 3 parameters`);let n=!1;const s=ee(this.expr.params[0]).evaluate(e,t);switch(s.type){case"TIMESTAMP":break;case"NULL":n=!0;break;default:return y.dr()}const i=ee(this.expr.params[1]).evaluate(e,t);let o;switch(i.type){case"STRING":if(o=(function(re){switch(re){case"microsecond":return"microsecond";case"millisecond":return"millisecond";case"second":return"second";case"minute":return"minute";case"hour":return"hour";case"day":return"day";default:return}})(i.value.stringValue),o===void 0)return y.dr();break;case"NULL":n=!0;break;default:return y.dr()}const B=ee(this.expr.params[2]).evaluate(e,t);switch(B.type){case"INT":break;case"NULL":n=!0;break;default:return y.dr()}if(n)return y.pr();const c=BigInt(B.value.integerValue);let u;try{switch(o){case"microsecond":u=c;break;case"millisecond":u=c*BigInt(1e3);break;case"second":u=c*BigInt(1e6);break;case"minute":u=c*BigInt(6e7);break;case"hour":u=c*BigInt(36e8);break;case"day":u=c*BigInt(864e8);break;default:return y.dr()}if(o!=="microsecond"&&c!==BigInt(0)&&u/c!==BigInt(this.Nr(o)))return y.dr()}catch(z){return Jt(`Error during timestamp arithmetic: ${z}`),y.dr()}const h=Jc(s.value.timestampValue);if(!vi(h.seconds,h.nanoseconds))return y.dr();const d=ou(h),p=this.Lr(d,u);if(!iu(p))return y.dr();const I=Number(p/Kn),R=p%Kn,k=Number((R<0?R+Kn:R)*BigInt(1e3)),M=R<0?I-1:I;return vi(M,k)?y.newValue({timestampValue:{seconds:M,nanos:k}}):y.dr()}Nr(e){switch(e){case"millisecond":return 1e3;case"second":return 1e6;case"minute":return 6e7;case"hour":return 36e8;case"day":return 864e8;default:return 1}}}class aR extends Fp{Lr(e,t){return e+t}}class BR extends Fp{Lr(e,t){return e-t}}function Pi(r){if((r=Op(r))instanceof Es)return`fld(${r.fieldName})`;if(r instanceof _s)return`cst(${(function(t){return t===null?"null":typeof t=="number"?t.toString():typeof t=="string"?`"${t}"`:t instanceof Te?`ref(${t.path})`:t instanceof _t?`vec(${JSON.stringify(t)})`:JSON.stringify(t)})(r.value)})`;if(r instanceof L)return`fn(${r.name},[${r.params.map(Pi).join(",")}])`;if(r.expressionType==="ListOfExpressions")return`list([${r.ur.map(Pi).join(",")}])`;throw new Error(`Unrecognized expr ${JSON.stringify(r,null,2)}`)}function cR(r){if(r instanceof vp)return`${r._name}(${yo(r.fields)})`;if(r instanceof Pp){let e=`${r._name}(${yo(r.accumulators)})`;return r.groups.size>0&&(e+=`grouping(${yo(r.groups)})`),e}if(r instanceof Sp)return`${r._name}(${yo(r.groups)})`;if(r instanceof Oa)return`${r._name}(${r.Er})`;if(r instanceof ba)return`${r._name}(${r.collectionId})`;if(r instanceof Zc)return`${r._name}()`;if(r instanceof eu)return`${r._name}(${r.hr.sort()})`;if(r instanceof Na)return`${r._name}(${Pi(r.condition)})`;if(r instanceof Tr)return`${r._name}(${r.limit})`;if(r instanceof hn)return`${r._name}(${(function(t){return t.map((n=>`${Pi(n.expr)}${n.direction}`)).join(",")})(r.orderings)})`;throw new Error(`Unrecognized stage ${r._name}`)}function yo(r){return`${Array.from(r.entries()).sort().map((([e,t])=>`${e}=${Pi(t)}`)).join(",")}`}function Cn(r){return r.stages.map((e=>cR(e))).join("|")}function kp(r,e){return Cn(r)===Cn(e)}function qe(r){return r instanceof lt}function yf(r){return qe(r)?Cn(r):ri(r)}function Vp(r){return qe(r)?Cn(r):(function(t){return`${jC(Yt(t))}|lt:${t.limitType}`})(r)}function ka(r,e){return r instanceof lt&&e instanceof lt?kp(r,e):!(r instanceof lt&&!(e instanceof lt)||!(r instanceof lt)&&e instanceof lt)&&Sy(r,e)}function xp(r){return Cr(r)?Cn(r):jC(r)}function Mp(r,e){return r instanceof lt&&e instanceof lt?kp(r,e):!(r instanceof lt&&!(e instanceof lt)||!(r instanceof lt)&&e instanceof lt)&&qC(r,e)}function uR(r,e){const t=(function(s){let i=!1;const o=[];for(const B of s)if(B instanceof hn)if(i=!0,B.orderings.some((c=>c.expr instanceof Es&&c.expr.fieldName===zt)))o.push(B);else{const c=B.orderings.map((u=>u));c.push(Lo(zt).ascending()),o.push(new hn(c,{}))}else B instanceof Tr&&(i||(o.push(new hn([Lo(zt).ascending()],{})),i=!0)),o.push(B);return i||o.push(new hn([Lo(zt).ascending()],{})),o})(r.stages);if(r.userDataReader){const n=r.userDataReader.createContext(3,"toCorePipeline");t.forEach((s=>s._readUserData(n)))}return new lt(r.userDataReader.serializer,t,e)}/**
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
 */class lR{constructor(e,t,n,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=n,this.mutations=s}applyToRemoteDocument(e,t){const n=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&hy(i,e,n[s])}}applyToLocalView(e,t){for(const n of this.baseMutations)n.key.isEqual(e.key)&&(t=ti(n,e,t,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(e.key)&&(t=ti(n,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const n=XC();return this.mutations.forEach((s=>{const i=e.get(s.key),o=i.overlayedDocument;let B=this.applyToLocalView(o,i.mutatedFields);B=t.has(s.key)?null:B;const c=FC(o,B);c!==null&&n.set(s.key,c),o.isValidDocument()||o.convertToNoDocument(te.min())})),n}keys(){return this.mutations.reduce(((e,t)=>e.add(t.key)),oe())}isEqual(e){return this.batchId===e.batchId&&Yr(this.mutations,e.mutations,((t,n)=>ef(t,n)))&&Yr(this.baseMutations,e.baseMutations,((t,n)=>ef(t,n)))}}class cu{constructor(e,t,n,s){this.batch=e,this.commitVersion=t,this.mutationResults=n,this.docVersions=s}static from(e,t,n){Q(e.mutations.length===n.length,58842,{Br:e.mutations.length,Ur:n.length});let s=(function(){return Ly})();const i=e.mutations;for(let o=0;o<i.length;o++)s=s.insert(i[o].key,n[o].version);return new cu(e,t,n,s)}}/**
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
 */const Gp="";function hR(r){let e="";for(let t=0;t<r.length;t++)e.length>0&&(e=Tf(e)),e=fR(r.get(t),e);return Tf(e)}function fR(r,e){let t=e;const n=r.length;for(let s=0;s<n;s++){const i=r.charAt(s);switch(i){case"\0":t+="";break;case Gp:t+="";break;default:t+=i}}return t}function Tf(r){return r+Gp+""}/**
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
 */class dR{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
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
 */class fn{constructor(e,t,n,s,i=te.min(),o=te.min(),B=Ue.EMPTY_BYTE_STRING,c=null){this.target=e,this.targetId=t,this.purpose=n,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=B,this.expectedCount=c}withSequenceNumber(e){return new fn(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new fn(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new fn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new fn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
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
 */class CR{constructor(e){this.qr=e}}function pR(r){const e=Yy({parent:r.parent,structuredQuery:r.structuredQuery});return r.limitType==="LAST"?Qo(e,e.limit,"L"):e}/**
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
 */class gR{constructor(){this.Yi=new mR}addToCollectionParentIndex(e,t){return this.Yi.add(t),V.resolve()}getCollectionParents(e,t){return V.resolve(this.Yi.getEntries(t))}addFieldIndex(e,t){return V.resolve()}deleteFieldIndex(e,t){return V.resolve()}deleteAllFieldIndexes(e){return V.resolve()}createTargetIndexes(e,t){return V.resolve()}getDocumentsMatchingTarget(e,t){return V.resolve(null)}getIndexType(e,t){return V.resolve(0)}getFieldIndexes(e,t){return V.resolve([])}getNextCollectionGroupToUpdate(e){return V.resolve(null)}getMinOffset(e,t){return V.resolve(Zn.min())}getMinOffsetFromCollectionGroup(e,t){return V.resolve(Zn.min())}updateCollectionGroup(e,t,n){return V.resolve()}updateIndexEntries(e,t){return V.resolve()}}class mR{constructor(){this.index={}}add(e){const t=e.lastSegment(),n=e.popLast(),s=this.index[t]||new Ge(Ce.comparator),i=!s.has(n);return this.index[t]=s.add(n),i}has(e){const t=e.lastSegment(),n=e.popLast(),s=this.index[t];return s&&s.has(n)}getEntries(e){return(this.index[e]||new Ge(Ce.comparator)).toArray()}}/**
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
 */class nr{constructor(e){this.gs=e}next(){return this.gs+=2,this.gs}static ys(){return new nr(0)}static ws(){return new nr(-1)}}// Copyright 2024 Google LLC* @license
function Up(r,e){var n;let t=e;for(const s of r.stages)t=_R({serializer:r.serializer,serverTimestampBehavior:(n=r.listenOptions)==null?void 0:n.serverTimestampBehavior},s,t);return t}function Va(r,e){return Up(r,[e]).length>0}function ER(r,e){return qe(r)?Va(r,e):ya(r,e)}function _R(r,e,t){if(e instanceof Oa)return(function(s,i,o){return o.filter((B=>B.isFoundDocument()&&`/${B.key.getCollectionPath().canonicalString()}`===i.Er))})(0,e,t);if(e instanceof Na)return(function(s,i,o){return o.filter((B=>{const c=ai(ee(i.condition).evaluate(s,B));return c!==void 0&&Gt(c,Dt)}))})(r,e,t);if(e instanceof ba)return(function(s,i,o){return o.filter((B=>B.isFoundDocument()&&B.key.getCollectionPath().lastSegment()===i.collectionId))})(0,e,t);if(e instanceof Zc)return(function(s,i,o){return o.filter((B=>B.isFoundDocument()))})(0,0,t);if(e instanceof eu)return(function(s,i,o){return o.filter((B=>B.isFoundDocument()&&i.Tr.has(B.key.path.toStringWithLeadingSlash())))})(0,e,t);if(e instanceof Tr)return(function(s,i,o){return o.slice(0,i.limit)})(0,e,t);if(e instanceof hn)return(function(s,i,o){const B=i.orderings.map((c=>({Os:ee(c.expr),direction:c.direction})));return[...o].sort(((c,u)=>{for(const{Os:h,direction:d}of B){const p=ai(h.evaluate(s,c)),I=ai(h.evaluate(s,u)),R=It(p??Zr,I??Zr);if(R!==0)return d==="ascending"?R:-R}return 0}))})(r,e,t);throw new Error(`Unknown stage: ${e._name}`)}function ac(r){const e=(function(n){for(let s=n.stages.length-1;s>=0;s--){const i=n.stages[s];if(i instanceof hn)return i.orderings}throw new Error("Pipeline must contain at least one Sort stage")})(r);return(t,n)=>{for(const s of e){const i=ai(ee(s.expr).evaluate({serializer:r.serializer},t)),o=ai(ee(s.expr).evaluate({serializer:r.serializer},n)),B=It(i||Zr,o||Zr);if(B!==0)return s.direction==="ascending"?B:-B}return 0}}function bB(r){for(let e=r.stages.length-1;e>=0;e--){const t=r.stages[e];if(t instanceof Tr)return{limit:t.limit}}}/**
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
 */class DR{constructor(){this.changes=new Rr((e=>e.toString()),((e,t)=>e.isEqual(t))),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Ye.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const n=this.changes.get(t);return n!==void 0?V.resolve(n):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
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
 */class IR{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
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
 */class wR{constructor(e,t,n,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=n,this.indexManager=s}getDocument(e,t){let n=null;return this.documentOverlayCache.getOverlay(e,t).next((s=>(n=s,this.remoteDocumentCache.getEntry(e,t)))).next((s=>(n!==null&&ti(n.mutation,s,vt.empty(),ye.now()),s)))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next((n=>this.getLocalViewOfDocuments(e,n,oe()).next((()=>n))))}getLocalViewOfDocuments(e,t,n=oe()){const s=Vn();return this.populateOverlays(e,s,t).next((()=>this.computeViews(e,t,s,n).next((i=>{let o=Mr();return i.forEach(((B,c)=>{o=o.insert(B,c.overlayedDocument)})),o}))))}getOverlayedDocuments(e,t){const n=Vn();return this.populateOverlays(e,n,t).next((()=>this.computeViews(e,t,n,oe())))}populateOverlays(e,t,n){const s=[];return n.forEach((i=>{t.has(i)||s.push(i)})),this.documentOverlayCache.getOverlays(e,s).next((i=>{i.forEach(((o,B)=>{t.set(o,B)}))}))}computeViews(e,t,n,s){let i=Et();const o=si(),B=(function(){return si()})();return t.forEach(((c,u)=>{const h=n.get(u.key);s.has(u.key)&&(h===void 0||h.mutation instanceof or)?i=i.insert(u.key,u):h!==void 0?(o.set(u.key,h.mutation.getFieldMask()),ti(h.mutation,u,h.mutation.getFieldMask(),ye.now())):o.set(u.key,vt.empty())})),this.recalculateAndSaveOverlays(e,i).next((c=>(c.forEach(((u,h)=>o.set(u,h))),t.forEach(((u,h)=>B.set(u,new IR(h,o.get(u)??null)))),B)))}recalculateAndSaveOverlays(e,t){const n=si();let s=new Re(((o,B)=>o-B)),i=oe();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next((o=>{for(const B of o)B.keys().forEach((c=>{const u=t.get(c);if(u===null)return;let h=n.get(c)||vt.empty();h=B.applyToLocalView(u,h),n.set(c,h);const d=(s.get(B.batchId)||oe()).add(c);s=s.insert(B.batchId,d)}))})).next((()=>{const o=[],B=s.getReverseIterator();for(;B.hasNext();){const c=B.getNext(),u=c.key,h=c.value,d=XC();h.forEach((p=>{if(!i.has(p)){const I=FC(t.get(p),n.get(p));I!==null&&d.set(p,I),i=i.add(p)}})),o.push(this.documentOverlayCache.saveOverlays(e,u,d))}return V.waitFor(o)})).next((()=>n))}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next((n=>this.recalculateAndSaveOverlays(e,n)))}getDocumentsMatchingQuery(e,t,n,s){return qe(t)?this.getDocumentsMatchingPipeline(e,t,n,s):vy(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):WC(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,n,s):this.getDocumentsMatchingCollectionQuery(e,t,n,s)}getNextDocuments(e,t,n,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,n,s).next((i=>{const o=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,n.largestBatchId,s-i.size):V.resolve(Vn());let B=Ii,c=i;return o.next((u=>V.forEach(u,((h,d)=>(B<d.largestBatchId&&(B=d.largestBatchId),i.get(h)?V.resolve():this.remoteDocumentCache.getEntry(e,h).next((p=>{c=c.insert(h,p)}))))).next((()=>this.populateOverlays(e,u,i))).next((()=>this.computeViews(e,c,u,oe()))).next((h=>({batchId:B,changes:YC(h)})))))}))}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new X(t)).next((n=>{let s=Mr();return n.isFoundDocument()&&(s=s.insert(n.key,n)),s}))}getDocumentsMatchingCollectionGroupQuery(e,t,n,s){const i=t.collectionGroup;let o=Mr();return this.indexManager.getCollectionParents(e,i).next((B=>V.forEach(B,(c=>{const u=(function(d,p){return new Ui(p,null,d.explicitOrderBy.slice(),d.filters.slice(),d.limit,d.limitType,d.startAt,d.endAt)})(t,c.child(i));return this.getDocumentsMatchingCollectionQuery(e,u,n,s).next((h=>{h.forEach(((d,p)=>{o=o.insert(d,p)}))}))})).next((()=>o))))}getDocumentsMatchingCollectionQuery(e,t,n,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,n.largestBatchId).next((o=>(i=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,i,s)))).next((o=>this.retrieveMatchingLocalDocuments(i,o,(B=>ya(t,B)))))}getDocumentsMatchingPipeline(e,t,n,s){if(qn(t)==="collection_group"){const i=nu(t);let o=Mr();return this.indexManager.getCollectionParents(e,i).next((B=>V.forEach(B,(c=>{const u=(function(d,p){const I=d.stages.map((R=>R instanceof ba?new Oa(p.canonicalString(),{}):R));return new lt(d.serializer,I)})(t,c.child(i));return this.getDocumentsMatchingPipeline(e,u,n,s).next((h=>{h.forEach(((d,p)=>{o=o.insert(d,p)}))}))})).next((()=>o))))}{let i;return this.getOverlaysForPipeline(e,t,n.largestBatchId).next((o=>{switch(i=o,qn(t)){case"collection":return this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,i,s);case"documents":let B=oe();for(const c of oc(t))B=B.add(X.fromPath(c));return this.remoteDocumentCache.getEntries(e,B);case"database":return this.remoteDocumentCache.getAllEntries(e);default:throw new H("invalid-argument",`Invalid pipeline source to execute offline: ${Cn(t)}`)}})).next((o=>this.retrieveMatchingLocalDocuments(i,o,(B=>Va(t,B)))))}}retrieveMatchingLocalDocuments(e,t,n){e.forEach(((i,o)=>{const B=o.getKey();t.get(B)===null&&(t=t.insert(B,Ye.newInvalidDocument(B)))}));let s=Mr();return t.forEach(((i,o)=>{const B=e.get(i);B!==void 0&&ti(B.mutation,o,vt.empty(),ye.now()),n(o)&&(s=s.insert(i,o))})),s}getOverlaysForPipeline(e,t,n){switch(qn(t)){case"collection":return this.documentOverlayCache.getOverlaysForCollection(e,Ce.fromString(La(t)),n);case"collection_group":throw new H("invalid-argument",`Unexpected collection group pipeline: ${Cn(t)}`);case"documents":return this.documentOverlayCache.getOverlays(e,oc(t).map((s=>X.fromPath(s))));case"database":return this.documentOverlayCache.getAllOverlays(e,n);default:throw new H("invalid-argument",`Failed to get overlays for pipeline: ${Cn(t)}`)}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yR{constructor(e){this.serializer=e,this.Ks=new Map,this.Qs=new Map}getBundleMetadata(e,t){return V.resolve(this.Ks.get(t))}saveBundleMetadata(e,t){return this.Ks.set(t.id,(function(s){return{id:s.id,version:s.version,createTime:Ot(s.createTime)}})(t)),V.resolve()}getNamedQuery(e,t){return V.resolve(this.Qs.get(t))}saveNamedQuery(e,t){return this.Qs.set(t.name,(function(s){return{name:s.name,query:pR(s.bundledQuery),readTime:Ot(s.readTime)}})(t)),V.resolve()}}/**
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
 */class TR{constructor(){this.overlays=new Re(X.comparator),this.Ws=new Map}getOverlay(e,t){return V.resolve(this.overlays.get(t))}getOverlays(e,t){const n=Vn();return V.forEach(t,(s=>this.getOverlay(e,s).next((i=>{i!==null&&n.set(s,i)})))).next((()=>n))}getAllOverlays(e,t){const n=Vn();return this.overlays.forEach(((s,i)=>{i.largestBatchId>t&&n.set(s,i)})),V.resolve(n)}saveOverlays(e,t,n){return n.forEach(((s,i)=>{this.Yr(e,t,i)})),V.resolve()}removeOverlaysForBatchId(e,t,n){const s=this.Ws.get(n);return s!==void 0&&(s.forEach((i=>this.overlays=this.overlays.remove(i))),this.Ws.delete(n)),V.resolve()}getOverlaysForCollection(e,t,n){const s=Vn(),i=t.length+1,o=new X(t.child("")),B=this.overlays.getIteratorFrom(o);for(;B.hasNext();){const c=B.getNext().value,u=c.getKey();if(!t.isPrefixOf(u.path))break;u.path.length===i&&c.largestBatchId>n&&s.set(c.getKey(),c)}return V.resolve(s)}getOverlaysForCollectionGroup(e,t,n,s){let i=new Re(((u,h)=>u-h));const o=this.overlays.getIterator();for(;o.hasNext();){const u=o.getNext().value;if(u.getKey().getCollectionGroup()===t&&u.largestBatchId>n){let h=i.get(u.largestBatchId);h===null&&(h=Vn(),i=i.insert(u.largestBatchId,h)),h.set(u.getKey(),u)}}const B=Vn(),c=i.getIterator();for(;c.hasNext()&&(c.getNext().value.forEach(((u,h)=>B.set(u,h))),!(B.size()>=s)););return V.resolve(B)}Yr(e,t,n){const s=this.overlays.get(n.key);if(s!==null){const o=this.Ws.get(s.largestBatchId).delete(n.key);this.Ws.set(s.largestBatchId,o)}this.overlays=this.overlays.insert(n.key,new dR(t,n));let i=this.Ws.get(t);i===void 0&&(i=oe(),this.Ws.set(t,i)),this.Ws.set(t,i.add(n.key))}}/**
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
 */class AR{constructor(){this.sessionToken=Ue.EMPTY_BYTE_STRING}getSessionToken(e){return V.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,V.resolve()}}/**
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
 */class uu{constructor(){this.Gs=new Ge($e.zs),this.js=new Ge($e.Hs)}isEmpty(){return this.Gs.isEmpty()}addReference(e,t){const n=new $e(e,t);this.Gs=this.Gs.add(n),this.js=this.js.add(n)}Js(e,t){e.forEach((n=>this.addReference(n,t)))}removeReference(e,t){this.Ys(new $e(e,t))}Zs(e,t){e.forEach((n=>this.removeReference(n,t)))}Xs(e){const t=new X(new Ce([])),n=new $e(t,e),s=new $e(t,e+1),i=[];return this.js.forEachInRange([n,s],(o=>{this.Ys(o),i.push(o.key)})),i}e_(){this.Gs.forEach((e=>this.Ys(e)))}Ys(e){this.Gs=this.Gs.delete(e),this.js=this.js.delete(e)}t_(e){const t=new X(new Ce([])),n=new $e(t,e),s=new $e(t,e+1);let i=oe();return this.js.forEachInRange([n,s],(o=>{i=i.add(o.key)})),i}containsKey(e){const t=new $e(e,0),n=this.Gs.firstAfterOrEqual(t);return n!==null&&e.isEqual(n.key)}}class $e{constructor(e,t){this.key=e,this.n_=t}static zs(e,t){return X.comparator(e.key,t.key)||Be(e.n_,t.n_)}static Hs(e,t){return Be(e.n_,t.n_)||X.comparator(e.key,t.key)}}/**
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
 */class RR{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Wr=1,this.r_=new Ge($e.zs)}checkEmpty(e){return V.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,n,s){const i=this.Wr;this.Wr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new lR(i,t,n,s);this.mutationQueue.push(o);for(const B of s)this.r_=this.r_.add(new $e(B.key,i)),this.indexManager.addToCollectionParentIndex(e,B.key.path.popLast());return V.resolve(o)}lookupMutationBatch(e,t){return V.resolve(this.i_(t))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,s=this.s_(n),i=s<0?0:s;return V.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return V.resolve(this.mutationQueue.length===0?Vc:this.Wr-1)}getAllMutationBatches(e){return V.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const n=new $e(t,0),s=new $e(t,Number.POSITIVE_INFINITY),i=[];return this.r_.forEachInRange([n,s],(o=>{const B=this.i_(o.n_);i.push(B)})),V.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new Ge(Be);return t.forEach((s=>{const i=new $e(s,0),o=new $e(s,Number.POSITIVE_INFINITY);this.r_.forEachInRange([i,o],(B=>{n=n.add(B.n_)}))})),V.resolve(this.__(n))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,s=n.length+1;let i=n;X.isDocumentKey(i)||(i=i.child(""));const o=new $e(new X(i),0);let B=new Ge(Be);return this.r_.forEachWhile((c=>{const u=c.key.path;return!!n.isPrefixOf(u)&&(u.length===s&&(B=B.add(c.n_)),!0)}),o),V.resolve(this.__(B))}__(e){const t=[];return e.forEach((n=>{const s=this.i_(n);s!==null&&t.push(s)})),t}removeMutationBatch(e,t){Q(this.o_(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let n=this.r_;return V.forEach(t.mutations,(s=>{const i=new $e(s.key,t.batchId);return n=n.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)})).next((()=>{this.r_=n}))}jr(e){}containsKey(e,t){const n=new $e(t,0),s=this.r_.firstAfterOrEqual(n);return V.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,V.resolve()}o_(e,t){return this.s_(e)}s_(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}i_(e){const t=this.s_(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
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
 */class vR{constructor(e){this.a_=e,this.docs=(function(){return new Re(X.comparator)})(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const n=t.key,s=this.docs.get(n),i=s?s.size:0,o=this.a_(t);return this.docs=this.docs.insert(n,{document:t.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(e,n.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const n=this.docs.get(t);return V.resolve(n?n.document.mutableCopy():Ye.newInvalidDocument(t))}getEntries(e,t){let n=Et();return t.forEach((s=>{const i=this.docs.get(s);n=n.insert(s,i?i.document.mutableCopy():Ye.newInvalidDocument(s))})),V.resolve(n)}getAllEntries(e){let t=Et();return this.docs.forEach(((n,s)=>{t=t.insert(n,s.document)})),V.resolve(t)}getDocumentsMatchingQuery(e,t,n,s){let i,o;qe(t)?(i=Ce.fromString(La(t)),o=h=>Va(t,h)):(i=t.path,o=h=>ya(t,h));let B=Et();const c=new X(i.child("__id-9223372036854775808__")),u=this.docs.getIteratorFrom(c);for(;u.hasNext();){const{key:h,value:{document:d}}=u.getNext();if(!i.isPrefixOf(h.path))break;h.path.length>i.length+1||Ty(yy(d),n)<=0||(s.has(d.key)||o(d))&&(B=B.insert(d.key,d.mutableCopy()))}return V.resolve(B)}getAllFromCollectionGroup(e,t,n,s){Y(9500)}u_(e,t){return V.forEach(this.docs,(n=>t(n)))}newChangeBuffer(e){return new PR(this)}getSize(e){return V.resolve(this.size)}}class PR extends DR{constructor(e){super(),this.qs=e}applyChanges(e){const t=[];return this.changes.forEach(((n,s)=>{s.isValidDocument()?t.push(this.qs.addEntry(e,s)):this.qs.removeEntry(n)})),V.waitFor(t)}getFromCache(e,t){return this.qs.getEntry(e,t)}getAllFromCache(e,t){return this.qs.getEntries(e,t)}}/**
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
 */class SR{constructor(e){this.persistence=e,this.c_=new Rr((t=>xp(t)),Mp),this.lastRemoteSnapshotVersion=te.min(),this.highestTargetId=0,this.l_=0,this.E_=new uu,this.targetCount=0,this.h_=nr.ys()}forEachTarget(e,t){return this.c_.forEach(((n,s)=>t(s))),V.resolve()}getLastRemoteSnapshotVersion(e){return V.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return V.resolve(this.l_)}allocateTargetId(e){return this.highestTargetId=this.h_.next(),V.resolve(this.highestTargetId)}setTargetsMetadata(e,t,n){return n&&(this.lastRemoteSnapshotVersion=n),t>this.l_&&(this.l_=t),V.resolve()}vs(e){this.c_.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.h_=new nr(t),this.highestTargetId=t),e.sequenceNumber>this.l_&&(this.l_=e.sequenceNumber)}addTargetData(e,t){return this.vs(t),this.targetCount+=1,V.resolve()}updateTargetData(e,t){return this.vs(t),V.resolve()}removeTargetData(e,t){return this.c_.delete(t.target),this.E_.Xs(t.targetId),this.targetCount-=1,V.resolve()}removeTargets(e,t,n){let s=0;const i=[];return this.c_.forEach(((o,B)=>{B.sequenceNumber<=t&&n.get(B.targetId)===null&&(this.c_.delete(o),i.push(this.removeMatchingKeysForTargetId(e,B.targetId)),s++)})),V.waitFor(i).next((()=>s))}getTargetCount(e){return V.resolve(this.targetCount)}getTargetData(e,t){const n=this.c_.get(t)||null;return V.resolve(n)}addMatchingKeys(e,t,n){return this.E_.Js(t,n),V.resolve()}removeMatchingKeys(e,t,n){this.E_.Zs(t,n);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach((o=>{i.push(s.markPotentiallyOrphaned(e,o))})),V.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.E_.Xs(t),V.resolve()}getMatchingKeysForTargetId(e,t){const n=this.E_.t_(t);return V.resolve(n)}containsKey(e,t){return V.resolve(this.E_.containsKey(t))}}/**
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
 */class Hp{constructor(e,t){this.T_={},this.overlays={},this.P_=new Aa(0),this.R_=!1,this.R_=!0,this.I_=new AR,this.referenceDelegate=e(this),this.A_=new SR(this),this.indexManager=new gR,this.remoteDocumentCache=(function(s){return new vR(s)})((n=>this.referenceDelegate.V_(n))),this.serializer=new CR(t),this.d_=new yR(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.R_=!1,Promise.resolve()}get started(){return this.R_}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new TR,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let n=this.T_[e.toKey()];return n||(n=new RR(t,this.referenceDelegate),this.T_[e.toKey()]=n),n}getGlobalsCache(){return this.I_}getTargetCache(){return this.A_}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.d_}runTransaction(e,t,n){K("MemoryPersistence","Starting transaction:",e);const s=new OR(this.P_.next());return this.referenceDelegate.f_(),n(s).next((i=>this.referenceDelegate.m_(s).next((()=>i)))).toPromise().then((i=>(s.raiseOnCommittedEvent(),i)))}p_(e,t){return V.or(Object.values(this.T_).map((n=>()=>n.containsKey(e,t))))}}class OR extends yT{constructor(e){super(),this.currentSequenceNumber=e}}class lu{constructor(e){this.persistence=e,this.g_=new uu,this.y_=null}static w_(e){return new lu(e)}get b_(){if(this.y_)return this.y_;throw Y(60996)}addReference(e,t,n){return this.g_.addReference(n,t),this.b_.delete(n.toString()),V.resolve()}removeReference(e,t,n){return this.g_.removeReference(n,t),this.b_.add(n.toString()),V.resolve()}markPotentiallyOrphaned(e,t){return this.b_.add(t.toString()),V.resolve()}removeTarget(e,t){this.g_.Xs(t.targetId).forEach((s=>this.b_.add(s.toString())));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(e,t.targetId).next((s=>{s.forEach((i=>this.b_.add(i.toString())))})).next((()=>n.removeTargetData(e,t)))}f_(){this.y_=new Set}m_(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return V.forEach(this.b_,(n=>{const s=X.fromPath(n);return this.S_(e,s).next((i=>{i||t.removeEntry(s,te.min())}))})).next((()=>(this.y_=null,t.apply(e))))}updateLimboDocument(e,t){return this.S_(e,t).next((n=>{n?this.b_.delete(t.toString()):this.b_.add(t.toString())}))}V_(e){return 0}S_(e,t){return V.or([()=>V.resolve(this.g_.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.p_(e,t)])}}class Zo{constructor(e,t){this.persistence=e,this.v_=new Rr((n=>hR(n.path)),((n,s)=>n.isEqual(s))),this.garbageCollector=PT(this,t)}static w_(e,t){return new Zo(e,t)}f_(){}m_(e){return V.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}rr(e){const t=this.xs(e);return this.persistence.getTargetCache().getTargetCount(e).next((n=>t.next((s=>n+s))))}xs(e){let t=0;return this.ir(e,(n=>{t++})).next((()=>t))}ir(e,t){return V.forEach(this.v_,((n,s)=>this.Fs(e,n,s).next((i=>i?V.resolve():t(s)))))}removeTargets(e,t,n){return this.persistence.getTargetCache().removeTargets(e,t,n)}removeOrphanedDocuments(e,t){let n=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.u_(e,(o=>this.Fs(e,o,t).next((B=>{B||(n++,i.removeEntry(o,te.min()))})))).next((()=>i.apply(e))).next((()=>n))}markPotentiallyOrphaned(e,t){return this.v_.set(t,e.currentSequenceNumber),V.resolve()}removeTarget(e,t){const n=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,n)}addReference(e,t,n){return this.v_.set(n,e.currentSequenceNumber),V.resolve()}removeReference(e,t,n){return this.v_.set(n,e.currentSequenceNumber),V.resolve()}updateLimboDocument(e,t){return this.v_.set(t,e.currentSequenceNumber),V.resolve()}V_(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=So(e.data.value)),t}Fs(e,t,n){return V.or([()=>this.persistence.p_(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.v_.get(t);return V.resolve(s!==void 0&&s>n)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
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
 */class hu{constructor(e,t,n,s){this.targetId=e,this.fromCache=t,this.Ao=n,this.Vo=s}static fo(e,t){let n=oe(),s=oe();for(const i of t.docChanges)switch(i.type){case 0:n=n.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new hu(e,t.fromCache,n,s)}}/**
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
 */function bR(r,e){return X.comparator(r.key,e.key)}/**
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
 */class NR{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class LR{constructor(){this.mo=!1,this.po=!1,this.yo=100,this.wo=(function(){return cm()?8:TT(at())>0?6:4})()}initialize(e,t){this.bo=e,this.indexManager=t,this.mo=!0}getDocumentsMatchingQuery(e,t,n,s){const i={result:null};return this.So(e,t).next((o=>{i.result=o})).next((()=>{if(!i.result)return this.vo(e,t,s,n).next((o=>{i.result=o}))})).next((()=>{if(i.result)return;const o=new NR;return this.Do(e,t,o).next((B=>{if(i.result=B,this.po)return this.xo(e,t,o,B.size)}))})).next((()=>i.result))}xo(e,t,n,s){return qe(t)?V.resolve():n.documentReadCount<this.yo?(Vr()<=ce.DEBUG&&K("QueryEngine","SDK will not create cache indexes for query:",ri(t),"since it only creates cache indexes for collection contains","more than or equal to",this.yo,"documents"),V.resolve()):(Vr()<=ce.DEBUG&&K("QueryEngine","Query:",ri(t),"scans",n.documentReadCount,"local documents and returns",s,"documents as results."),n.documentReadCount>this.wo*s?(Vr()<=ce.DEBUG&&K("QueryEngine","The SDK decides to create cache indexes for query:",ri(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Yt(t))):V.resolve())}So(e,t){if(qe(t))return V.resolve(null);let n=t;if(af(n))return V.resolve(null);let s=Yt(n);return this.indexManager.getIndexType(e,s).next((i=>i===0?null:(n.limit!==null&&i===1&&(n=Qo(n,null,"F"),s=Yt(n)),this.indexManager.getDocumentsMatchingTarget(e,s).next((o=>{const B=oe(...o);return this.bo.getDocuments(e,B).next((c=>this.indexManager.getMinOffset(e,s).next((u=>{const h=this.Co(n,c);return this.Fo(n,h,B,u.readTime)?this.So(e,Qo(n,null,"F")):this.Oo(e,h,n,u)}))))})))))}vo(e,t,n,s){return(qe(t)?(function(o){for(const B of o.stages){if(B instanceof Tr||B instanceof wf)return!1;if(B instanceof Na){if(B.condition instanceof Tp&&B.condition._expr.name==="exists"&&B.condition._expr.params[0]instanceof Es&&B.condition._expr.params[0].fieldName===zt)continue;return!1}}return!0})(t):af(t))||s.isEqual(te.min())?V.resolve(null):this.bo.getDocuments(e,n).next((i=>{const o=this.Co(t,i);return this.Fo(t,o,n,s)?V.resolve(null):(Vr()<=ce.DEBUG&&K("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),yf(t)),this.Oo(e,o,t,wy(s,Ii)).next((B=>B)))}))}Co(e,t){let n,s;return qe(e)?(n=new Ge(bR),s=i=>Va(e,i)):(n=new Ge(Uc(e)),s=i=>ya(e,i)),t.forEach(((i,o)=>{s(o)&&(n=n.add(o))})),n}Fo(e,t,n,s){if(qe(e))return(function(B){return B.stages.some((c=>c instanceof Tr||c instanceof wf))})(e);if(e.limit===null)return!1;if(n.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Do(e,t,n){return Vr()<=ce.DEBUG&&K("QueryEngine","Using full collection scan to execute query:",yf(t)),this.bo.getDocumentsMatchingQuery(e,t,Zn.min(),n)}Oo(e,t,n,s){return this.bo.getDocumentsMatchingQuery(e,n,s).next((i=>(t.forEach((o=>{i=i.insert(o.key,o)})),i)))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fu="LocalStore",FR=3e8;class kR{constructor(e,t,n,s){this.persistence=e,this.Mo=t,this.serializer=s,this.No=new Re(Be),this.Lo=new Rr((i=>xp(i)),Mp),this.Bo=new Map,this.Uo=e.getRemoteDocumentCache(),this.A_=e.getTargetCache(),this.d_=e.getBundleCache(),this.ko(n)}ko(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new wR(this.Uo,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Uo.setIndexManager(this.indexManager),this.Mo.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(t=>e.collect(t,this.No)))}}function VR(r,e,t,n){return new kR(r,e,t,n)}async function Jp(r,e){const t=ne(r);return await t.persistence.runTransaction("Handle user change","readonly",(n=>{let s;return t.mutationQueue.getAllMutationBatches(n).next((i=>(s=i,t.ko(e),t.mutationQueue.getAllMutationBatches(n)))).next((i=>{const o=[],B=[];let c=oe();for(const u of s){o.push(u.batchId);for(const h of u.mutations)c=c.add(h.key)}for(const u of i){B.push(u.batchId);for(const h of u.mutations)c=c.add(h.key)}return t.localDocuments.getDocuments(n,c).next((u=>({qo:u,removedBatchIds:o,addedBatchIds:B})))}))}))}function xR(r,e){const t=ne(r);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",(n=>{const s=e.batch.keys(),i=t.Uo.newChangeBuffer({trackRemovals:!0});return(function(B,c,u,h){const d=u.batch,p=d.keys();let I=V.resolve();return p.forEach((R=>{I=I.next((()=>h.getEntry(c,R))).next((k=>{const M=u.docVersions.get(R);Q(M!==null,48541),k.version.compareTo(M)<0&&(d.applyToRemoteDocument(k,u),k.isValidDocument()&&(k.setReadTime(u.commitVersion),h.addEntry(k)))}))})),I.next((()=>B.mutationQueue.removeMutationBatch(c,d)))})(t,n,e,i).next((()=>i.apply(n))).next((()=>t.mutationQueue.performConsistencyCheck(n))).next((()=>t.documentOverlayCache.removeOverlaysForBatchId(n,s,e.batch.batchId))).next((()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(n,(function(B){let c=oe();for(let u=0;u<B.mutationResults.length;++u)B.mutationResults[u].transformResults.length>0&&(c=c.add(B.batch.mutations[u].key));return c})(e)))).next((()=>t.localDocuments.getDocuments(n,s)))}))}function jp(r){const e=ne(r);return e.persistence.runTransaction("Get last remote snapshot version","readonly",(t=>e.A_.getLastRemoteSnapshotVersion(t)))}function MR(r,e){const t=ne(r),n=e.snapshotVersion;let s=t.No;return t.persistence.runTransaction("Apply remote event","readwrite-primary",(i=>{const o=t.Uo.newChangeBuffer({trackRemovals:!0});s=t.No;const B=[];e.targetChanges.forEach(((h,d)=>{const p=s.get(d);if(!p)return;B.push(t.A_.removeMatchingKeys(i,h.removedDocuments,d).next((()=>t.A_.addMatchingKeys(i,h.addedDocuments,d))));let I=p.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(d)!==null?I=I.withResumeToken(Ue.EMPTY_BYTE_STRING,te.min()).withLastLimboFreeSnapshotVersion(te.min()):h.resumeToken.approximateByteSize()>0&&(I=I.withResumeToken(h.resumeToken,n)),s=s.insert(d,I),(function(k,M,z){return k.resumeToken.approximateByteSize()===0||M.snapshotVersion.toMicroseconds()-k.snapshotVersion.toMicroseconds()>=FR?!0:z.addedDocuments.size+z.modifiedDocuments.size+z.removedDocuments.size>0})(p,I,h)&&B.push(t.A_.updateTargetData(i,I))}));let c=Et(),u=oe();if(e.documentUpdates.forEach((h=>{e.resolvedLimboDocuments.has(h)&&B.push(t.persistence.referenceDelegate.updateLimboDocument(i,h))})),B.push(GR(i,o,e.documentUpdates).next((h=>{c=h.$o,u=h.Ko}))),!n.isEqual(te.min())){const h=t.A_.getLastRemoteSnapshotVersion(i).next((d=>t.A_.setTargetsMetadata(i,i.currentSequenceNumber,n)));B.push(h)}return V.waitFor(B).next((()=>o.apply(i))).next((()=>t.localDocuments.getLocalViewOfDocuments(i,c,u))).next((()=>c))})).then((i=>(t.No=s,i)))}function GR(r,e,t){let n=oe(),s=oe();return t.forEach((i=>n=n.add(i))),e.getEntries(r,n).next((i=>{let o=Et();return t.forEach(((B,c)=>{const u=i.get(B);c.isFoundDocument()!==u.isFoundDocument()&&(s=s.add(B)),c.isNoDocument()&&c.version.isEqual(te.min())?(e.removeEntry(B,c.readTime),o=o.insert(B,c)):!u.isValidDocument()||c.version.compareTo(u.version)>0||c.version.compareTo(u.version)===0&&u.hasPendingWrites?(e.addEntry(c),o=o.insert(B,c)):K(fu,"Ignoring outdated watch update for ",B,". Current version:",u.version," Watch version:",c.version)})),{$o:o,Ko:s}}))}function UR(r,e){const t=ne(r);return t.persistence.runTransaction("Get next mutation batch","readonly",(n=>(e===void 0&&(e=Vc),t.mutationQueue.getNextMutationBatchAfterBatchId(n,e))))}function HR(r,e){const t=ne(r);return t.persistence.runTransaction("Allocate target","readwrite",(n=>{let s;return t.A_.getTargetData(n,e).next((i=>i?(s=i,V.resolve(s)):t.A_.allocateTargetId(n).next((o=>(s=new fn(e,o,"TargetPurposeListen",n.currentSequenceNumber),t.A_.addTargetData(n,s).next((()=>s)))))))})).then((n=>{const s=t.No.get(n.targetId);return(s===null||n.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.No=t.No.insert(n.targetId,n),t.Lo.set(e,n.targetId)),n}))}async function Bc(r,e,t){const n=ne(r),s=n.No.get(e),i=t?"readwrite":"readwrite-primary";try{t||await n.persistence.runTransaction("Release target",i,(o=>n.persistence.referenceDelegate.removeTarget(o,s)))}catch(o){if(!gs(o))throw o;K(fu,`Failed to update sequence numbers for target ${e}: ${o}`)}n.No=n.No.remove(e),n.Lo.delete(s.target)}function Af(r,e,t){const n=ne(r);let s=te.min(),i=oe();return n.persistence.runTransaction("Execute query","readwrite",(o=>(function(c,u,h){const d=ne(c),p=d.Lo.get(h);return p!==void 0?V.resolve(d.No.get(p)):d.A_.getTargetData(u,h)})(n,o,qe(e)?e:Yt(e)).next((B=>{if(B)return s=B.lastLimboFreeSnapshotVersion,n.A_.getMatchingKeysForTargetId(o,B.targetId).next((c=>{i=c}))})).next((()=>n.Mo.getDocumentsMatchingQuery(o,e,t?s:te.min(),t?i:oe()))).next((B=>(JR(n,B),{documents:B,Qo:i})))))}function JR(r,e){e.forEach(((t,n)=>{const s=n.key.getCollectionGroup(),i=r.Bo.get(s)||te.min();n.readTime.compareTo(i)>0&&r.Bo.set(s,n.readTime)}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jR{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.Jo=0,this.Yo=null,this.Zo=!0}Xo(){this.Jo===0&&(this.ea("Unknown"),this.Yo=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this.Yo=null,this.ta("Backend didn't respond within 10 seconds."),this.ea("Offline"),Promise.resolve()))))}na(e){this.state==="Online"?this.ea("Unknown"):(this.Jo++,this.Jo>=1&&(this.ra(),this.ta(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ea("Offline")))}set(e){this.ra(),this.Jo=0,e==="Online"&&(this.Zo=!1),this.ea(e)}ea(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ta(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.Zo?(Dn(t),this.Zo=!1):K("OnlineStateTracker",t)}ra(){this.Yo!==null&&(this.Yo.cancel(),this.Yo=null)}}/**
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
 */const rn="RemoteStore";class qR{constructor(e,t,n,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=n,this.remoteSyncer={},this.ia=[],this.sa=new Map,this._a=new Map,this.oa=new Map,this.aa=new nr(1e3),this.ua=new nr(1001),this.ca=new Set,this.la=[],this.Ea=i,this.Ea.Ke((o=>{n.enqueueAndForget((async()=>{Pr(this)&&(K(rn,"Restarting streams for network reachability change."),await(async function(c){const u=ne(c);u.ca.add(4),await qi(u),u.ha.set("Unknown"),u.ca.delete(4),await xa(u)})(this))}))})),this.ha=new jR(n,s)}}async function xa(r){if(Pr(r))for(const e of r.la)await e(!0)}async function qi(r){for(const e of r.la)await e(!1)}function cc(r,e){return r._a.get(e)||void 0}function qp(r,e){const t=ne(r),n=cc(t,e.targetId);if(n!==void 0&&t.sa.has(n))return;const s=(function(B,c){const u=cc(B,c);u!==void 0&&B.oa.delete(u);const h=(function(p,I){return I%2!=0?p.ua.next():p.aa.next()})(B,c);return B._a.set(c,h),B.oa.set(h,c),h})(t,e.targetId);K(rn,"remoteStoreListen mapping SDK target ID to remote",e.targetId,s);const i=new fn(e.target,s,e.purpose,e.sequenceNumber,e.snapshotVersion,e.lastLimboFreeSnapshotVersion,e.resumeToken);t.sa.set(s,i),gu(t)?pu(t):ws(t).Jt()&&Cu(t,i)}function du(r,e){const t=ne(r),n=ws(t),s=cc(t,e);K(rn,"remoteStoreUnlisten removing mapping of SDK target ID to remote",e,s),t.sa.delete(s),t._a.delete(e),t.oa.delete(s),n.Jt()&&Kp(t,s),t.sa.size===0&&(n.Jt()?n.Xt():Pr(t)&&t.ha.set("Unknown"))}function Cu(r,e){if(r.Ta.H(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(te.min())>0){const t=r.oa.get(e.targetId);if(t===void 0)return void K(rn,"SDK target ID not found for remote ID: "+e.targetId);const n=r.remoteSyncer.getRemoteKeysForTarget(t).size;e=e.withExpectedCount(n)}ws(r).Tn(e)}function Kp(r,e){r.Ta.H(e),ws(r).Pn(e)}function pu(r){r.Ta=new Gy({getRemoteKeysForTarget:e=>{const t=r.oa.get(e);return t!==void 0?r.remoteSyncer.getRemoteKeysForTarget(t):oe()},ge:e=>r.sa.get(e)||null,Ae:()=>r.datastore.serializer.databaseId}),ws(r).start(),r.ha.Xo()}function gu(r){return Pr(r)&&!ws(r).Ht()&&r.sa.size>0}function Pr(r){return ne(r).ca.size===0}function Wp(r){r.Ta=void 0}async function KR(r){r.ha.set("Online")}async function WR(r){r.sa.forEach(((e,t)=>{Cu(r,e)}))}async function zR(r,e){Wp(r),gu(r)?(r.ha.na(e),pu(r)):r.ha.set("Unknown")}async function QR(r,e,t){if(r.ha.set("Online"),e instanceof ep&&e.state===2&&e.cause)try{await(async function(s,i){const o=i.cause;for(const B of i.targetIds){if(s.sa.has(B)){const c=s.oa.get(B);c!==void 0&&(await s.remoteSyncer.rejectListen(c,o),s._a.delete(c),s.oa.delete(B)),s.sa.delete(B)}s.Ta.removeTarget(B)}})(r,e)}catch(n){K(rn,"Failed to remove targets %s: %s ",e.targetIds.join(","),n),await ea(r,n)}else if(e instanceof bo?r.Ta.se(e):e instanceof ZC?r.Ta.Ee(e):r.Ta.ae(e),!t.isEqual(te.min()))try{const n=await jp(r.localStore);t.compareTo(n)>=0&&await(function(i,o){const B=i.Ta.de(o);B.targetChanges.forEach(((u,h)=>{if(u.resumeToken.approximateByteSize()>0){const d=i.sa.get(h);d&&i.sa.set(h,d.withResumeToken(u.resumeToken,o))}})),B.targetMismatches.forEach(((u,h)=>{const d=i.sa.get(u);if(!d)return;i.sa.set(u,d.withResumeToken(Ue.EMPTY_BYTE_STRING,d.snapshotVersion)),Kp(i,u);const p=new fn(d.target,u,h,d.sequenceNumber);Cu(i,p)}));const c=(function(h,d){const p=new Map;d.targetChanges.forEach(((R,k)=>{const M=h.oa.get(k);M!==void 0&&p.set(M,R)}));let I=new Re(Be);return d.targetMismatches.forEach(((R,k)=>{const M=h.oa.get(R);M!==void 0&&(I=I.insert(M,k))})),new Hi(d.snapshotVersion,p,I,d.documentUpdates,d.augmentedDocumentUpdates,d.resolvedLimboDocuments)})(i,B);return i.remoteSyncer.applyRemoteEvent(c)})(r,t)}catch(n){K(rn,"Failed to raise snapshot:",n),await ea(r,n)}}async function ea(r,e,t){if(!gs(e))throw e;r.ca.add(1),await qi(r),r.ha.set("Offline"),t||(t=()=>jp(r.localStore)),r.asyncQueue.enqueueRetryable((async()=>{K(rn,"Retrying IndexedDB access"),await t(),r.ca.delete(1),await xa(r)}))}function zp(r,e){return e().catch((t=>ea(r,t,e)))}async function Ma(r){const e=ne(r),t=rr(e);let n=e.ia.length>0?e.ia[e.ia.length-1].batchId:Vc;for(;$R(e);)try{const s=await UR(e.localStore,n);if(s===null){e.ia.length===0&&t.Xt();break}n=s.batchId,YR(e,s)}catch(s){await ea(e,s)}Qp(e)&&$p(e)}function $R(r){return Pr(r)&&r.ia.length<10}function YR(r,e){r.ia.push(e);const t=rr(r);t.Jt()&&t.Rn&&t.In(e.mutations)}function Qp(r){return Pr(r)&&!rr(r).Ht()&&r.ia.length>0}function $p(r){rr(r).start()}async function XR(r){rr(r).dn()}async function ZR(r){const e=rr(r);for(const t of r.ia)e.In(t.mutations)}async function ev(r,e,t){const n=r.ia.shift(),s=cu.from(n,e,t);await zp(r,(()=>r.remoteSyncer.applySuccessfulWrite(s))),await Ma(r)}async function tv(r,e){e&&rr(r).Rn&&await(async function(n,s){if((function(o){return zC(o)&&o!==F.ABORTED})(s.code)){const i=n.ia.shift();rr(n).Zt(),await zp(n,(()=>n.remoteSyncer.rejectFailedWrite(i.batchId,s))),await Ma(n)}})(r,e),Qp(r)&&$p(r)}async function Rf(r,e){const t=ne(r);t.asyncQueue.verifyOperationInProgress(),K(rn,"RemoteStore received new credentials");const n=Pr(t);t.ca.add(3),await qi(t),n&&t.ha.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.ca.delete(3),await xa(t)}async function nv(r,e){const t=ne(r);e?(t.ca.delete(2),await xa(t)):e||(t.ca.add(2),await qi(t),t.ha.set("Unknown"))}function ws(r){return r.Pa||(r.Pa=(function(t,n,s){const i=ne(t);return i.mn(),new pT(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(r.datastore,r.asyncQueue,{ut:KR.bind(null,r),lt:WR.bind(null,r),ht:zR.bind(null,r),hn:QR.bind(null,r)}),r.la.push((async e=>{e?(r.Pa.Zt(),gu(r)?pu(r):r.ha.set("Unknown")):(await r.Pa.stop(),Wp(r))}))),r.Pa}function rr(r){return r.Ra||(r.Ra=(function(t,n,s){const i=ne(t);return i.mn(),new gT(n,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)})(r.datastore,r.asyncQueue,{ut:()=>Promise.resolve(),lt:XR.bind(null,r),ht:tv.bind(null,r),An:ZR.bind(null,r),Vn:ev.bind(null,r)}),r.la.push((async e=>{e?(r.Ra.Zt(),await Ma(r)):(await r.Ra.stop(),r.ia.length>0&&(K(rn,`Stopping write stream with ${r.ia.length} pending writes`),r.ia=[]))}))),r.Ra}/**
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
 */class mu{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ia(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ia(this.observer.error,e):Dn("Uncaught Error in snapshot listener:",e.toString()))}Aa(){this.muted=!0}Ia(e,t){setTimeout((()=>{this.muted||e(t)}),0)}}/**
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
 */class Eu{constructor(e,t,n,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=n,this.op=s,this.removalCallback=i,this.deferred=new Zt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((o=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,n,s,i){const o=Date.now()+n,B=new Eu(e,t,o,s,i);return B.start(n),B}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new H(F.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function _u(r,e){if(Dn("AsyncQueue",`${e}: ${r}`),gs(r))return new H(F.UNAVAILABLE,`${e}: ${r}`);throw r}class vf{constructor(){this.activeTargetIds=Vy()}La(e){this.activeTargetIds=this.activeTargetIds.add(e)}Ba(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Na(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class rv{constructor(){this.du=new vf,this.fu={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,n){}addLocalQueryTarget(e,t=!0){return t&&this.du.La(e),this.fu[e]||"not-current"}updateQueryState(e,t,n){this.fu[e]=t}removeLocalQueryTarget(e){this.du.Ba(e)}isLocalQueryTarget(e){return this.du.activeTargetIds.has(e)}clearQueryState(e){delete this.fu[e]}getAllActiveQueryTargets(){return this.du.activeTargetIds}isActiveQueryTarget(e){return this.du.activeTargetIds.has(e)}start(){return this.du=new vf,Promise.resolve()}handleUserChange(e,t,n){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}function NB(){return typeof document<"u"?document:null}/**
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
 */class _r{static emptySet(e){return new _r(e.comparator)}constructor(e){this.comparator=e?(t,n)=>e(t,n)||X.comparator(t.key,n.key):(t,n)=>X.comparator(t.key,n.key),this.keyedMap=Mr(),this.sortedSet=new Re(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal(((t,n)=>(e(t),!1)))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof _r)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),n=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=n.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach((t=>{e.push(t.toString())})),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const n=new _r;return n.comparator=this.comparator,n.keyedMap=e,n.sortedSet=t,n}}/**
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
 */class Pf{constructor(){this.mu=new Re(X.comparator)}track(e){const t=e.doc.key,n=this.mu.get(t);n?e.type!==0&&n.type===3?this.mu=this.mu.insert(t,e):e.type===3&&n.type!==1?this.mu=this.mu.insert(t,{type:n.type,doc:e.doc}):e.type===2&&n.type===2?this.mu=this.mu.insert(t,{type:2,doc:e.doc}):e.type===2&&n.type===0?this.mu=this.mu.insert(t,{type:0,doc:e.doc}):e.type===1&&n.type===0?this.mu=this.mu.remove(t):e.type===1&&n.type===2?this.mu=this.mu.insert(t,{type:1,doc:n.doc}):e.type===0&&n.type===1?this.mu=this.mu.insert(t,{type:2,doc:e.doc}):Y(63341,{ye:e,pu:n}):this.mu=this.mu.insert(t,e)}gu(){const e=[];return this.mu.inorderTraversal(((t,n)=>{e.push(n)})),e}}class ss{constructor(e,t,n,s,i,o,B,c,u){this.query=e,this.docs=t,this.oldDocs=n,this.docChanges=s,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=B,this.excludesMetadataChanges=c,this.hasCachedResults=u}static fromInitialDocuments(e,t,n,s,i){const o=[];return t.forEach((B=>{o.push({type:0,doc:B})})),new ss(e,t,_r.emptySet(t),o,n,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&ka(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,n=e.docChanges;if(t.length!==n.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==n[s].type||!t[s].doc.isEqual(n[s].doc))return!1;return!0}}/**
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
 */class sv{constructor(){this.yu=void 0,this.wu=[]}bu(){return this.wu.some((e=>e.Su()))}}class iv{constructor(){this.queries=Sf(),this.onlineState="Unknown",this.vu=new Set}terminate(){(function(t,n){const s=ne(t),i=s.queries;s.queries=Sf(),i.forEach(((o,B)=>{for(const c of B.wu)c.onError(n)}))})(this,new H(F.ABORTED,"Firestore shutting down"))}}function Sf(){return new Rr((r=>Vp(r)),ka)}async function Du(r,e){const t=ne(r);let n=3;const s=e.query;let i=t.queries.get(s);i?!i.bu()&&e.Su()&&(n=2):(i=new sv,n=e.Su()?0:1);try{switch(n){case 0:i.yu=await t.onListen(s,!0);break;case 1:i.yu=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(o){const B=_u(o,`Initialization of query '${qe(e.query)?Cn(e.query):ri(e.query)}' failed`);return void e.onError(B)}t.queries.set(s,i),i.wu.push(e),e.Du(t.onlineState),i.yu&&e.xu(i.yu)&&wu(t)}async function Iu(r,e){const t=ne(r),n=e.query;let s=3;const i=t.queries.get(n);if(i){const o=i.wu.indexOf(e);o>=0&&(i.wu.splice(o,1),i.wu.length===0?s=e.Su()?0:1:!i.bu()&&e.Su()&&(s=2))}switch(s){case 0:return t.queries.delete(n),t.onUnlisten(n,!0);case 1:return t.queries.delete(n),t.onUnlisten(n,!1);case 2:return t.onLastRemoteStoreUnlisten(n);default:return}}function ov(r,e){const t=ne(r);let n=!1;for(const s of e){const i=s.query,o=t.queries.get(i);if(o){for(const B of o.wu)B.xu(s)&&(n=!0);o.yu=s}}n&&wu(t)}function av(r,e,t){const n=ne(r),s=n.queries.get(e);if(s)for(const i of s.wu)i.onError(t);n.queries.delete(e)}function wu(r){r.vu.forEach((e=>{e.next()}))}var uc;(function(r){r.Default="default",r.Cache="cache"})(uc||(uc={}));class yu{constructor(e,t,n){this.query=e,this.Cu=t,this.Fu=!1,this.Ou=null,this.onlineState="Unknown",this.options=n||{}}xu(e){if(!this.options.includeMetadataChanges){const n=[];for(const s of e.docChanges)s.type!==3&&n.push(s);e=new ss(e.query,e.docs,e.oldDocs,n,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Fu?this.Mu(e)&&(this.Cu.next(e),t=!0):this.Nu(e,this.onlineState)&&(this.Lu(e),t=!0),this.Ou=e,t}onError(e){this.Cu.error(e)}Du(e){this.onlineState=e;let t=!1;return this.Ou&&!this.Fu&&this.Nu(this.Ou,e)&&(this.Lu(this.Ou),t=!0),t}Nu(e,t){if(!e.fromCache||!this.Su())return!0;const n=t!=="Offline";return(!this.options.waitForSyncWhenOnline||!n)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Mu(e){if(e.docChanges.length>0)return!0;const t=this.Ou&&this.Ou.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}Lu(e){e=ss.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Fu=!0,this.Cu.next(e)}Su(){return this.options.source!==uc.Cache}}/**
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
 */class Yp{constructor(e){this.key=e}}class Xp{constructor(e){this.key=e}}class Bv{constructor(e,t){this.query=e,this.Gu=t,this.zu=null,this.hasCachedResults=!1,this.current=!1,this.ju=oe(),this.mutatedKeys=oe(),this.Hu=qe(e)?ac(e):Uc(e),this.Ju=new _r(this.Hu)}get Yu(){return this.Gu}Zu(e,t){const n=t?t.Xu:new Pf,s=t?t.Ju:this.Ju;let i=t?t.mutatedKeys:this.mutatedKeys,o=s,B=!1;const[c,u]=this.ec(this.query,s);e.inorderTraversal(((d,p)=>{const I=s.get(d),R=ER(this.query,p)?p:null,k=!!I&&this.mutatedKeys.has(I.key),M=!!R&&(R.hasLocalMutations||this.mutatedKeys.has(R.key)&&R.hasCommittedMutations);let z=!1;I&&R?I.data.isEqual(R.data)?k!==M&&(n.track({type:3,doc:R}),z=!0):this.tc(I,R)||(n.track({type:2,doc:R}),z=!0,(c&&this.Hu(R,c)>0||u&&this.Hu(R,u)<0)&&(B=!0)):!I&&R?(n.track({type:0,doc:R}),z=!0):I&&!R&&(n.track({type:1,doc:I}),z=!0,(c||u)&&(B=!0)),z&&(R?(o=o.add(R),i=M?i.add(d):i.delete(d)):(o=o.delete(d),i=i.delete(d)))}));const h=this.nc(this.query);if(h)if(qe(this.query)){const d=[];o.forEach((R=>d.push(R)));const p=Up(this.query,d);let I=new _r(ac(this.query));for(const R of p)I=I.add(R);o.forEach((R=>{I.has(R.key)||(i=i.delete(R.key),n.track({type:1,doc:R}))})),o=I}else{const d=this.rc(this.query);for(;o.size>h;){const p=d==="F"?o.last():o.first();o=o.delete(p.key),i=i.delete(p.key),n.track({type:1,doc:p})}}return{Ju:o,Xu:n,Fo:B,mutatedKeys:i}}nc(e){var t;return qe(e)?(t=bB(e))==null?void 0:t.limit:e.limit||void 0}rc(e){if(qe(e)){const t=bB(e);return t&&t.limit<0?"L":"F"}return e.limitType}ec(e,t){var n;if(qe(e)){const s=(n=bB(e))==null?void 0:n.limit;return[t.size===s?t.last():null,null]}return[e.limitType==="F"&&t.size===this.nc(this.query)?t.last():null,e.limitType==="L"&&t.size===this.nc(this.query)?t.first():null]}tc(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,n,s){const i=this.Ju;this.Ju=e.Ju,this.mutatedKeys=e.mutatedKeys;const o=e.Xu.gu();o.sort(((h,d)=>(function(I,R){const k=M=>{switch(M){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return Y(20277,{ye:M})}};return k(I)-k(R)})(h.type,d.type)||this.Hu(h.doc,d.doc))),this.sc(n),s=s??!1;const B=t&&!s?this._c():[],c=this.ju.size===0&&this.current&&!s?1:0,u=c!==this.zu;return this.zu=c,o.length!==0||u?{snapshot:new ss(this.query,e.Ju,i,o,e.mutatedKeys,c===0,u,!1,!!n&&n.resumeToken.approximateByteSize()>0),oc:B}:{oc:B}}Du(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ju:this.Ju,Xu:new Pf,mutatedKeys:this.mutatedKeys,Fo:!1},!1)):{oc:[]}}ac(e){return!this.Gu.has(e)&&!!this.Ju.has(e)&&!this.Ju.get(e).hasLocalMutations}sc(e){e&&(e.addedDocuments.forEach((t=>this.Gu=this.Gu.add(t))),e.modifiedDocuments.forEach((t=>{})),e.removedDocuments.forEach((t=>this.Gu=this.Gu.delete(t))),this.current=e.current)}_c(){if(!this.current)return[];const e=this.ju;this.ju=oe(),this.Ju.forEach((n=>{this.ac(n.key)&&(this.ju=this.ju.add(n.key))}));const t=[];return e.forEach((n=>{this.ju.has(n)||t.push(new Xp(n))})),this.ju.forEach((n=>{e.has(n)||t.push(new Yp(n))})),t}uc(e){this.Gu=e.Qo,this.ju=oe();const t=this.Zu(e.documents);return this.applyChanges(t,!0)}cc(){return ss.fromInitialDocuments(this.query,this.Ju,this.mutatedKeys,this.zu===0,this.hasCachedResults)}}const Tu="SyncEngine";class cv{constructor(e,t,n){this.query=e,this.targetId=t,this.view=n}}class uv{constructor(e){this.key=e,this.lc=!1}}class lv{constructor(e,t,n,s,i,o){this.localStore=e,this.remoteStore=t,this.eventManager=n,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.Ec={},this.hc=new Rr((B=>Vp(B)),ka),this.Tc=new Map,this.Pc=new Set,this.Rc=new Re(X.comparator),this.Ic=new Map,this.Ac=new uu,this.Vc={},this.dc=new Map,this.fc=nr.ws(),this.onlineState="Unknown",this.mc=void 0}get isPrimaryClient(){return this.mc===!0}}async function hv(r,e,t=!0){const n=sg(r);let s;const i=n.hc.get(e);return i?(n.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.cc()):s=await Zp(n,e,t,!0),s}async function fv(r,e){const t=sg(r);await Zp(t,e,!0,!1)}async function Zp(r,e,t,n){const s=await HR(r.localStore,qe(e)?e:Yt(e)),i=s.targetId,o=r.sharedClientState.addLocalQueryTarget(i,t);let B;return n&&(B=await dv(r,e,i,o==="current",s.resumeToken)),r.isPrimaryClient&&t&&qp(r.remoteStore,s),B}async function dv(r,e,t,n,s){r.gc=(d,p,I)=>(async function(k,M,z,re){let pe=M.view.Zu(z);pe.Fo&&(pe=await Af(k.localStore,M.query,!1).then((({documents:v})=>M.view.Zu(v,pe))));const Se=re&&re.targetChanges.get(M.targetId),Oe=re&&re.targetMismatches.get(M.targetId)!=null,Ae=M.view.applyChanges(pe,k.isPrimaryClient,Se,Oe);return bf(k,M.targetId,Ae.oc),Ae.snapshot})(r,d,p,I);const i=await Af(r.localStore,e,!0),o=new Bv(e,i.Qo),B=o.Zu(i.documents),c=Ji.createSynthesizedTargetChangeForCurrentChange(t,n&&r.onlineState!=="Offline",s),u=o.applyChanges(B,r.isPrimaryClient,c);bf(r,t,u.oc);const h=new cv(e,t,o);return r.hc.set(e,h),r.Tc.has(t)?r.Tc.get(t).push(e):r.Tc.set(t,[e]),u.snapshot}async function Cv(r,e,t){const n=ne(r),s=n.hc.get(e),i=n.Tc.get(s.targetId);if(i.length>1)return n.Tc.set(s.targetId,i.filter((o=>!ka(o,e)))),void n.hc.delete(e);n.isPrimaryClient?(n.sharedClientState.removeLocalQueryTarget(s.targetId),n.sharedClientState.isActiveQueryTarget(s.targetId)||await Bc(n.localStore,s.targetId,!1).then((()=>{n.sharedClientState.clearQueryState(s.targetId),t&&du(n.remoteStore,s.targetId),lc(n,s.targetId)})).catch(ps)):(lc(n,s.targetId),await Bc(n.localStore,s.targetId,!0))}async function pv(r,e){const t=ne(r),n=t.hc.get(e),s=t.Tc.get(n.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(n.targetId),du(t.remoteStore,n.targetId))}async function gv(r,e,t){const n=yv(r);try{const s=await(function(o,B){const c=ne(o),u=ye.now(),h=B.reduce(((I,R)=>I.add(R.key)),oe());let d,p;return c.persistence.runTransaction("Locally write mutations","readwrite",(I=>{let R=Et(),k=oe();return c.Uo.getEntries(I,h).next((M=>{R=M,R.forEach(((z,re)=>{re.isValidDocument()||(k=k.add(z))}))})).next((()=>c.localDocuments.getOverlayedDocuments(I,R))).next((M=>{d=M;const z=[];for(const re of B){const pe=fy(re,d.get(re.key).overlayedDocument);pe!=null&&z.push(new or(re.key,pe,SC(pe.value.mapValue),Ve.exists(!0)))}return c.mutationQueue.addMutationBatch(I,u,z,B)})).next((M=>{p=M;const z=M.applyToLocalDocumentSet(d,k);return c.documentOverlayCache.saveOverlays(I,M.batchId,z)}))})).then((()=>({batchId:p.batchId,changes:YC(d)})))})(n.localStore,e);n.sharedClientState.addPendingMutation(s.batchId),(function(o,B,c){let u=o.Vc[o.currentUser.toKey()];u||(u=new Re(Be)),u=u.insert(B,c),o.Vc[o.currentUser.toKey()]=u})(n,s.batchId,t),await Ki(n,s.changes),await Ma(n.remoteStore)}catch(s){const i=_u(s,"Failed to persist write");t.reject(i)}}async function eg(r,e){const t=ne(r);try{const n=await MR(t.localStore,e);e.targetChanges.forEach(((s,i)=>{const o=t.Ic.get(i);o&&(Q(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?o.lc=!0:s.modifiedDocuments.size>0?Q(o.lc,14607):s.removedDocuments.size>0&&(Q(o.lc,42227),o.lc=!1))})),await Ki(t,n,e)}catch(n){await ps(n)}}function Of(r,e,t){const n=ne(r);if(n.isPrimaryClient&&t===0||!n.isPrimaryClient&&t===1){const s=[];n.hc.forEach(((i,o)=>{const B=o.view.Du(e);B.snapshot&&s.push(B.snapshot)})),(function(o,B){const c=ne(o);c.onlineState=B;let u=!1;c.queries.forEach(((h,d)=>{for(const p of d.wu)p.Du(B)&&(u=!0)})),u&&wu(c)})(n.eventManager,e),s.length&&n.Ec.hn(s),n.onlineState=e,n.isPrimaryClient&&n.sharedClientState.setOnlineState(e)}}async function mv(r,e,t){const n=ne(r);n.sharedClientState.updateQueryState(e,"rejected",t);const s=n.Ic.get(e),i=s&&s.key;if(i){let o=new Re(X.comparator);o=o.insert(i,Ye.newNoDocument(i,te.min()));const B=oe().add(i),c=new Hi(te.min(),new Map,new Re(Be),o,Et(),B);await eg(n,c),n.Rc=n.Rc.remove(i),n.Ic.delete(e),Au(n)}else await Bc(n.localStore,e,!1).then((()=>lc(n,e,t))).catch(ps)}async function Ev(r,e){const t=ne(r),n=e.batch.batchId;try{const s=await xR(t.localStore,e);ng(t,n,null),tg(t,n),t.sharedClientState.updateMutationState(n,"acknowledged"),await Ki(t,s)}catch(s){await ps(s)}}async function _v(r,e,t){const n=ne(r);try{const s=await(function(o,B){const c=ne(o);return c.persistence.runTransaction("Reject batch","readwrite-primary",(u=>{let h;return c.mutationQueue.lookupMutationBatch(u,B).next((d=>(Q(d!==null,37113),h=d.keys(),c.mutationQueue.removeMutationBatch(u,d)))).next((()=>c.mutationQueue.performConsistencyCheck(u))).next((()=>c.documentOverlayCache.removeOverlaysForBatchId(u,h,B))).next((()=>c.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(u,h))).next((()=>c.localDocuments.getDocuments(u,h)))}))})(n.localStore,e);ng(n,e,t),tg(n,e),n.sharedClientState.updateMutationState(e,"rejected",t),await Ki(n,s)}catch(s){await ps(s)}}function tg(r,e){(r.dc.get(e)||[]).forEach((t=>{t.resolve()})),r.dc.delete(e)}function ng(r,e,t){const n=ne(r);let s=n.Vc[n.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),n.Vc[n.currentUser.toKey()]=s}}function lc(r,e,t=null){r.sharedClientState.removeLocalQueryTarget(e);for(const n of r.Tc.get(e))r.hc.delete(n),t&&r.Ec.yc(n,t);r.Tc.delete(e),r.isPrimaryClient&&r.Ac.Xs(e).forEach((n=>{r.Ac.containsKey(n)||rg(r,n)}))}function rg(r,e){r.Pc.delete(e.path.canonicalString());const t=r.Rc.get(e);t!==null&&(du(r.remoteStore,t),r.Rc=r.Rc.remove(e),r.Ic.delete(t),Au(r))}function bf(r,e,t){for(const n of t)n instanceof Yp?(r.Ac.addReference(n.key,e),Dv(r,n)):n instanceof Xp?(K(Tu,"Document no longer in limbo: "+n.key),r.Ac.removeReference(n.key,e),r.Ac.containsKey(n.key)||rg(r,n.key)):Y(19791,{wc:n})}function Dv(r,e){const t=e.key,n=t.path.canonicalString();r.Rc.get(t)||r.Pc.has(n)||(K(Tu,"New document in limbo: "+t),r.Pc.add(n),Au(r))}function Au(r){for(;r.Pc.size>0&&r.Rc.size<r.maxConcurrentLimboResolutions;){const e=r.Pc.values().next().value;r.Pc.delete(e);const t=new X(Ce.fromString(e)),n=r.fc.next();r.Ic.set(n,new uv(t)),r.Rc=r.Rc.insert(t,n),qp(r.remoteStore,new fn(Yt(wa(t.path)),n,"TargetPurposeLimboResolution",Aa.yn))}}async function Ki(r,e,t){const n=ne(r),s=[],i=[],o=[];n.hc.isEmpty()||(n.hc.forEach(((B,c)=>{o.push(n.gc(c,e,t).then((u=>{var h;if((u||t)&&n.isPrimaryClient){const d=u?!u.fromCache:(h=t==null?void 0:t.targetChanges.get(c.targetId))==null?void 0:h.current;n.sharedClientState.updateQueryState(c.targetId,d?"current":"not-current")}if(u){s.push(u);const d=hu.fo(c.targetId,u);i.push(d)}})))})),await Promise.all(o),n.Ec.hn(s),await(async function(c,u){const h=ne(c);try{await h.persistence.runTransaction("notifyLocalViewChanges","readwrite",(d=>V.forEach(u,(p=>V.forEach(p.Ao,(I=>h.persistence.referenceDelegate.addReference(d,p.targetId,I))).next((()=>V.forEach(p.Vo,(I=>h.persistence.referenceDelegate.removeReference(d,p.targetId,I)))))))))}catch(d){if(!gs(d))throw d;K(fu,"Failed to update sequence numbers: "+d)}for(const d of u){const p=d.targetId;if(!d.fromCache){const I=h.No.get(p),R=I.snapshotVersion,k=I.withLastLimboFreeSnapshotVersion(R);h.No=h.No.insert(p,k)}}})(n.localStore,i))}async function Iv(r,e){const t=ne(r);if(!t.currentUser.isEqual(e)){K(Tu,"User change. New user:",e.toKey());const n=await Jp(t.localStore,e);t.currentUser=e,(function(i,o){i.dc.forEach((B=>{B.forEach((c=>{c.reject(new H(F.CANCELLED,o))}))})),i.dc.clear()})(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,n.removedBatchIds,n.addedBatchIds),await Ki(t,n.qo)}}function wv(r,e){const t=ne(r),n=t.Ic.get(e);if(n&&n.lc)return oe().add(n.key);{let s=oe();const i=t.Tc.get(e);if(!i)return s;for(const o of i??[]){const B=t.hc.get(o);s=s.unionWith(B.view.Yu)}return s}}function sg(r){const e=ne(r);return e.remoteStore.remoteSyncer.applyRemoteEvent=eg.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=wv.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=mv.bind(null,e),e.Ec.hn=ov.bind(null,e.eventManager),e.Ec.yc=av.bind(null,e.eventManager),e}function yv(r){const e=ne(r);return e.remoteStore.remoteSyncer.applySuccessfulWrite=Ev.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=_v.bind(null,e),e}class ta{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Ta(e.databaseInfo.databaseId),this.sharedClientState=this.Sc(e),this.persistence=this.vc(e),await this.persistence.start(),this.localStore=this.Dc(e),this.gcScheduler=this.xc(e,this.localStore),this.indexBackfillerScheduler=this.Cc(e,this.localStore)}xc(e,t){return null}Cc(e,t){return null}Dc(e){return VR(this.persistence,new LR,e.initialUser,this.serializer)}vc(e){return new Hp(lu.w_,this.serializer)}Sc(e){return new rv}async terminate(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}ta.provider={build:()=>new ta};class ig extends ta{constructor(e){super(),this.cacheSizeBytes=e}xc(e,t){Q(this.persistence.referenceDelegate instanceof Zo,46915);const n=this.persistence.referenceDelegate.garbageCollector;return new RT(n,e.asyncQueue,t)}vc(e){const t=this.cacheSizeBytes!==void 0?gt.withCacheSize(this.cacheSizeBytes):gt.DEFAULT;return new Hp((n=>Zo.w_(n,t)),this.serializer)}}class na{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=n=>Of(this.syncEngine,n,1),this.remoteStore.remoteSyncer.handleCredentialChange=Iv.bind(null,this.syncEngine),await nv(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return(function(){return new iv})()}createDatastore(e){const t=Ta(e.databaseInfo.databaseId),n=CT(e.databaseInfo);return _T(e.authCredentials,e.appCheckCredentials,n,t)}createRemoteStore(e){return(function(n,s,i,o,B){return new qR(n,s,i,o,B)})(this.localStore,this.datastore,e.asyncQueue,(t=>Of(this.syncEngine,t,0)),(function(){return Cf.Je()?new Cf:new lT})())}createSyncEngine(e,t){return(function(s,i,o,B,c,u,h){const d=new lv(s,i,o,B,c,u);return h&&(d.mc=!0),d})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await(async function(s){const i=ne(s);K(rn,"RemoteStore shutting down."),i.ca.add(5),await qi(i),i.Ea.shutdown(),i.ha.set("Unknown")})(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()}}na.provider={build:()=>new na};/**
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
 */let Tv=class{constructor(e){this.datastore=e,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(e){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new H(F.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const t=await(async function(s,i){const o=ne(s),B={documents:i.map((d=>wi(o.serializer,d)))},c=await o.st("BatchGetDocuments",o.serializer.databaseId,Ce.emptyPath(),B,i.length),u=new Map;c.forEach((d=>{const p=Ky(o.serializer,d);u.set(p.key.toString(),p)}));const h=[];return i.forEach((d=>{const p=u.get(d.toString());Q(!!p,55234,{key:d}),h.push(p)})),h})(this.datastore,e);return t.forEach((n=>this.recordVersion(n))),t}set(e,t){this.write(t.toMutation(e,this.precondition(e))),this.writtenDocs.add(e.toString())}update(e,t){try{this.write(t.toMutation(e,this.preconditionForUpdate(e)))}catch(n){this.lastTransactionError=n}this.writtenDocs.add(e.toString())}delete(e){this.write(new Gi(e,this.precondition(e))),this.writtenDocs.add(e.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const e=this.readVersions;this.mutations.forEach((t=>{e.delete(t.key.toString())})),e.forEach(((t,n)=>{const s=X.fromPath(n);this.mutations.push(new VC(s,this.precondition(s)))})),await(async function(n,s){const i=ne(n),o={writes:s.map((B=>ip(i.serializer,B)))};await i.tt("Commit",i.serializer.databaseId,Ce.emptyPath(),o)})(this.datastore,this.mutations),this.committed=!0}recordVersion(e){let t;if(e.isFoundDocument())t=e.version;else{if(!e.isNoDocument())throw Y(50498,{Oc:e.constructor.name});t=te.min()}const n=this.readVersions.get(e.key.toString());if(n){if(!t.isEqual(n))throw new H(F.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(e.key.toString(),t)}precondition(e){const t=this.readVersions.get(e.toString());return!this.writtenDocs.has(e.toString())&&t?t.isEqual(te.min())?Ve.exists(!1):Ve.updateTime(t):Ve.none()}preconditionForUpdate(e){const t=this.readVersions.get(e.toString());if(!this.writtenDocs.has(e.toString())&&t){if(t.isEqual(te.min()))throw new H(F.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return Ve.updateTime(t)}return Ve.exists(!0)}write(e){this.ensureCommitNotCalled(),this.mutations.push(e)}ensureCommitNotCalled(){}};/**
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
 */class Av{constructor(e,t,n,s,i){this.asyncQueue=e,this.datastore=t,this.options=n,this.updateFunction=s,this.deferred=i,this.Mc=n.maxAttempts,this.jt=new qc(this.asyncQueue,"transaction_retry")}Nc(){this.Mc-=1,this.Lc()}Lc(){this.jt.Ut((async()=>{const e=new Tv(this.datastore),t=this.Bc(e);t&&t.then((n=>{this.asyncQueue.enqueueAndForget((()=>e.commit().then((()=>{this.deferred.resolve(n)})).catch((s=>{this.Uc(s)}))))})).catch((n=>{this.Uc(n)}))}))}Bc(e){try{const t=this.updateFunction(e);return!xi(t)&&t.catch&&t.then?t:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(t){return this.deferred.reject(t),null}}Uc(e){this.Mc>0&&this.kc(e)?(this.Mc-=1,this.asyncQueue.enqueueAndForget((()=>(this.Lc(),Promise.resolve())))):this.deferred.reject(e)}kc(e){if((e==null?void 0:e.name)==="FirebaseError"){const t=e.code;return t==="aborted"||t==="failed-precondition"||t==="already-exists"||!zC(t)}return!1}}/**
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
 */const sr="FirestoreClient";class Rv{constructor(e,t,n,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=n,this._databaseInfo=s,this.user=it.UNAUTHENTICATED,this.clientId=kc.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(n,(async o=>{K(sr,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o})),this.appCheckCredentials.start(n,(o=>(K(sr,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Zt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const n=_u(t,"Failed to shutdown persistence");e.reject(n)}})),e.promise}}async function LB(r,e){r.asyncQueue.verifyOperationInProgress(),K(sr,"Initializing OfflineComponentProvider");const t=r.configuration;await e.initialize(t);let n=t.initialUser;r.setCredentialChangeListener((async s=>{n.isEqual(s)||(await Jp(e.localStore,s),n=s)})),e.persistence.setDatabaseDeletedListener((()=>r.terminate())),r._offlineComponents=e}async function Nf(r,e){r.asyncQueue.verifyOperationInProgress();const t=await vv(r);K(sr,"Initializing OnlineComponentProvider"),await e.initialize(t,r.configuration),r.setCredentialChangeListener((n=>Rf(e.remoteStore,n))),r.setAppCheckTokenChangeListener(((n,s)=>Rf(e.remoteStore,s))),r._onlineComponents=e}async function vv(r){if(!r._offlineComponents)if(r._uninitializedComponentsProvider){K(sr,"Using user provided OfflineComponentProvider");try{await LB(r,r._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!(function(s){return s.name==="FirebaseError"?s.code===F.FAILED_PRECONDITION||s.code===F.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11})(t))throw t;Jt("Error using user provided cache. Falling back to memory cache: "+t),await LB(r,new ta)}}else K(sr,"Using default OfflineComponentProvider"),await LB(r,new ig(void 0));return r._offlineComponents}async function Ru(r){return r._onlineComponents||(r._uninitializedComponentsProvider?(K(sr,"Using user provided OnlineComponentProvider"),await Nf(r,r._uninitializedComponentsProvider._online)):(K(sr,"Using default OnlineComponentProvider"),await Nf(r,new na))),r._onlineComponents}function Pv(r){return Ru(r).then((e=>e.syncEngine))}function Sv(r){return Ru(r).then((e=>e.datastore))}async function ra(r){const e=await Ru(r),t=e.eventManager;return t.onListen=hv.bind(null,e.syncEngine),t.onUnlisten=Cv.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=fv.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=pv.bind(null,e.syncEngine),t}function Ov(r,e,t,n){const s=new mu(n),i=new yu(e,s,t);return r.asyncQueue.enqueueAndForget((async()=>Du(await ra(r),i))),()=>{s.Aa(),r.asyncQueue.enqueueAndForget((async()=>Iu(await ra(r),i)))}}function og(r,e,t={}){const n=new Zt;return r.asyncQueue.enqueueAndForget((async()=>(function(i,o,B,c,u){const h=new mu({next:p=>{h.Aa(),o.enqueueAndForget((()=>Iu(i,d)));const I=p.docs.has(B);!I&&p.fromCache?u.reject(new H(F.UNAVAILABLE,"Failed to get document because the client is offline.")):I&&p.fromCache&&c&&c.source==="server"?u.reject(new H(F.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):u.resolve(p)},error:p=>u.reject(p)}),d=new yu(wa(B.path),h,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return Du(i,d)})(await ra(r),r.asyncQueue,e,t,n))),n.promise}function bv(r,e,t={}){const n=new Zt;return r.asyncQueue.enqueueAndForget((async()=>(function(i,o,B,c,u){const h=new mu({next:p=>{h.Aa(),o.enqueueAndForget((()=>Iu(i,d))),p.fromCache&&c.source==="server"?u.reject(new H(F.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):u.resolve(p)},error:p=>u.reject(p)}),d=new yu(B instanceof oi?uR(B):B,h,{includeMetadataChanges:!0,waitForSyncWhenOnline:!0});return Du(i,d)})(await ra(r),r.asyncQueue,e,t,n))),n.promise}function Nv(r,e){const t=new Zt;return r.asyncQueue.enqueueAndForget((async()=>gv(await Pv(r),e,t))),t.promise}function Lv(r,e,t){const n=new Zt;return r.asyncQueue.enqueueAndForget((async()=>{const s=await Sv(r);new Av(r.asyncQueue,s,t,e,n).Nc()})),n.promise}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let sa=class{constructor(e,t,n,s,i){this._firestore=e,this._userDataWriter=t,this._key=n,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new Te(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new Fv(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return((e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const t=this._document.data.field(yr("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}},Fv=class extends sa{data(){return super.data()}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ag{convertValue(e,t="none"){switch(He(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ve(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Yn(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw Y(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const n={};return ir(e,((s,i)=>{n[s]=this.convertValue(i,t)})),n}convertVectorValue(e){var n,s,i;const t=(i=(s=(n=e.fields)==null?void 0:n[mi].arrayValue)==null?void 0:s.values)==null?void 0:i.map((o=>ve(o.doubleValue)));return new _t(t)}convertGeoPoint(e){return new Xt(ve(e.latitude),ve(e.longitude))}convertArray(e,t){return(e.values||[]).map((n=>this.convertValue(n,t)))}convertServerTimestamp(e,t){switch(t){case"previous":const n=Vi(e);return n==null?null:this.convertValue(n,t);case"estimate":return this.convertTimestamp(Xr(e));default:return null}}convertTimestamp(e){const t=$n(e);return new ye(t.seconds,t.nanos)}convertDocumentKey(e,t){const n=Ce.fromString(e);Q(Bp(n),9688,{name:e});const s=new pi(n.get(1),n.get(3)),i=new X(n.popFirst(5));return s.isEqual(t)||Dn(`A document reference to ${i} refers to a different database (${s.projectId}/${s.database}), which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ga(r,e,t){let n;return n=r?t&&(t.merge||t.mergeFields)?r.toFirestore(e,t):r.toFirestore(e):e,n}class kv extends ag{constructor(e){super(),this.firestore=e}convertBytes(e){return new Rt(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Te(this.firestore,null,t)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lf="AsyncQueue";class Ff{constructor(e=Promise.resolve()){this.qc=[],this.$c=!1,this.Kc=[],this.Qc=null,this.Wc=!1,this.Gc=!1,this.zc=[],this.jt=new qc(this,"async_queue_retry"),this.jc=()=>{const n=NB();n&&K(Lf,"Visibility state changed to "+n.visibilityState),this.jt.qt()},this.Hc=e;const t=NB();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.jc)}get isShuttingDown(){return this.$c}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Jc(),this.Yc(e)}enterRestrictedMode(e){if(!this.$c){this.$c=!0,this.Gc=e||!1;const t=NB();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.jc)}}enqueue(e){if(this.Jc(),this.$c)return new Promise((()=>{}));const t=new Zt;return this.Yc((()=>this.$c&&this.Gc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.qc.push(e),this.Zc())))}async Zc(){if(this.qc.length!==0){try{await this.qc[0](),this.qc.shift(),this.jt.reset()}catch(e){if(!gs(e))throw e;K(Lf,"Operation failed with retryable error: "+e)}this.qc.length>0&&this.jt.Ut((()=>this.Zc()))}}Yc(e){const t=this.Hc.then((()=>(this.Wc=!0,e().catch((n=>{throw this.Qc=n,this.Wc=!1,Dn("INTERNAL UNHANDLED ERROR: ",kf(n)),n})).then((n=>(this.Wc=!1,n))))));return this.Hc=t,t}enqueueAfterDelay(e,t,n){this.Jc(),this.zc.indexOf(e)>-1&&(t=0);const s=Eu.createAndSchedule(this,e,t,n,(i=>this.Xc(i)));return this.Kc.push(s),s}Jc(){this.Qc&&Y(47125,{el:kf(this.Qc)})}verifyOperationInProgress(){}async tl(){let e;do e=this.Hc,await e;while(e!==this.Hc)}nl(e){for(const t of this.Kc)if(t.timerId===e)return!0;return!1}rl(e){return this.tl().then((()=>{this.Kc.sort(((t,n)=>t.targetTimeMs-n.targetTimeMs));for(const t of this.Kc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.tl()}))}il(e){this.zc.push(e)}Xc(e){const t=this.Kc.indexOf(e);this.Kc.splice(t,1)}}function kf(r){let e=r.message||"";return r.stack&&(e=r.stack.includes(r.message)?r.stack:r.message+`
`+r.stack),e}class Ut extends Ra{constructor(e,t,n,s){super(e,t,n,s),this.type="firestore",this._queue=new Ff,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Ff(e),this._firestoreClient=void 0,await e}}}function gP(r,e,t){t||(t=Ci);const n=cs(r,"firestore");if(n.isInitialized(t)){const s=n.getImmediate({identifier:t}),i=n.getOptions(t);if(pn(i,e))return s;throw new H(F.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(e.cacheSizeBytes!==void 0&&e.localCache!==void 0)throw new H(F.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(e.cacheSizeBytes!==void 0&&e.cacheSizeBytes!==-1&&e.cacheSizeBytes<Cp)throw new H(F.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return e.host&&Bs(e.host)&&Cc(e.host),n.initialize({options:e,instanceIdentifier:t})}function mP(r,e){const t=typeof r=="object"?r:gc(),n=typeof r=="string"?r:Ci,s=cs(t,"firestore").getImmediate({identifier:n});if(!s._initialized){const i=tm("firestore");i&&ST(s,...i)}return s}function Sr(r){if(r._terminated)throw new H(F.FAILED_PRECONDITION,"The client has already been terminated.");return r._firestoreClient||Vv(r),r._firestoreClient}function Vv(r){var n,s,i,o;const e=r._freezeSettings(),t=IT(r._databaseId,((n=r._app)==null?void 0:n.options.appId)||"",r._persistenceKey,(s=r._app)==null?void 0:s.options.apiKey,e);r._componentsProvider||(i=e.localCache)!=null&&i._offlineComponentProvider&&((o=e.localCache)!=null&&o._onlineComponentProvider)&&(r._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),r._firestoreClient=new Rv(r._authCredentials,r._appCheckCredentials,r._queue,t,r._componentsProvider&&(function(c){const u=c==null?void 0:c._online.build();return{_offline:c==null?void 0:c._offline.build(u),_online:u}})(r._componentsProvider))}/**
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
 */class Ua extends ag{constructor(e){super(),this.firestore=e}convertBytes(e){return new Rt(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Te(this.firestore,null,t)}}class Jr{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Wn extends sa{constructor(e,t,n,s,i,o){super(e,t,n,s,o),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Fo(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const n=this._document.data.field(yr("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new H(F.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=Wn._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}Wn._jsonSchemaVersion="firestore/documentSnapshot/1.0",Wn._jsonSchema={type:Me("string",Wn._jsonSchemaVersion),bundleSource:Me("string","DocumentSnapshot"),bundleName:Me("string"),bundle:Me("string")};class Fo extends Wn{data(e={}){return super.data(e)}}class Dr{constructor(e,t,n,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new Jr(s.hasPendingWrites,s.fromCache),this.query=n}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((n=>{e.call(t,new Fo(this._firestore,this._userDataWriter,n.key,n,new Jr(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new H(F.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(s,i){if(s._snapshot.oldDocs.isEmpty()){let o=0;return s._snapshot.docChanges.map((B=>{qe(s._snapshot.query)?ac(s._snapshot.query):Uc(s.query._query);const c=new Fo(s._firestore,s._userDataWriter,B.doc.key,B.doc,new Jr(s._snapshot.mutatedKeys.has(B.doc.key),s._snapshot.fromCache),s.query.converter);return B.doc,{type:"added",doc:c,oldIndex:-1,newIndex:o++}}))}{let o=s._snapshot.oldDocs;return s._snapshot.docChanges.filter((B=>i||B.type!==3)).map((B=>{const c=new Fo(s._firestore,s._userDataWriter,B.doc.key,B.doc,new Jr(s._snapshot.mutatedKeys.has(B.doc.key),s._snapshot.fromCache),s.query.converter);let u=-1,h=-1;return B.type!==0&&(u=o.indexOf(B.doc.key),o=o.delete(B.doc.key)),B.type!==1&&(o=o.add(B.doc),h=o.indexOf(B.doc.key)),{type:xv(B.type),doc:c,oldIndex:u,newIndex:h}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new H(F.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=Dr._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=kc.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],n=[],s=[];return this.docs.forEach((i=>{i._document!==null&&(t.push(i._document),n.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),s.push(i.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function xv(r){switch(r){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return Y(61501,{type:r})}}/**
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
 */Dr._jsonSchemaVersion="firestore/querySnapshot/1.0",Dr._jsonSchema={type:Me("string",Dr._jsonSchemaVersion),bundleSource:Me("string","QuerySnapshot"),bundleName:Me("string"),bundle:Me("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bg(r){if(r.limitType==="L"&&r.explicitOrderBy.length===0)throw new H(F.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class vu{}class cg extends vu{}function EP(r,e,...t){let n=[];e instanceof vu&&n.push(e),n=n.concat(t),(function(i){const o=i.filter((c=>c instanceof Pu)).length,B=i.filter((c=>c instanceof Ha)).length;if(o>1||o>0&&B>0)throw new H(F.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")})(n);for(const s of n)r=s._apply(r);return r}class Ha extends cg{constructor(e,t,n){super(),this._field=e,this._op=t,this._value=n,this.type="where"}static _create(e,t,n){return new Ha(e,t,n)}_apply(e){const t=this._parse(e);return ug(e._query,t),new ar(e.firestore,e.converter,tc(e._query,t))}_parse(e){const t=ms(e.firestore);return(function(i,o,B,c,u,h,d){let p;if(u.isKeyField()){if(h==="array-contains"||h==="array-contains-any")throw new H(F.INVALID_ARGUMENT,`Invalid Query. You can't perform '${h}' queries on documentId().`);if(h==="in"||h==="not-in"){xf(d,h);const R=[];for(const k of d)R.push(Vf(c,i,k));p={arrayValue:{values:R}}}else p=Vf(c,i,d)}else h!=="in"&&h!=="not-in"&&h!=="array-contains-any"||xf(d,h),p=kT(B,o,d,h==="in"||h==="not-in");return xe.create(u,h,p)})(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function _P(r,e,t){const n=e,s=yr("where",r);return Ha._create(s,n,t)}class Pu extends vu{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new Pu(e,t)}_parse(e){const t=this._queryConstraints.map((n=>n._parse(e))).filter((n=>n.getFilters().length>0));return t.length===1?t[0]:jt.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:((function(s,i){let o=s;const B=i.getFlattenedFilters();for(const c of B)ug(o,c),o=tc(o,c)})(e._query,t),new ar(e.firestore,e.converter,tc(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class Su extends cg{constructor(e,t,n){super(),this.type=e,this._limit=t,this._limitType=n}static _create(e,t,n){return new Su(e,t,n)}_apply(e){return new ar(e.firestore,e.converter,Qo(e._query,this._limit,this._limitType))}}function DP(r){return ey("limit",r),Su._create("limit",r,"F")}function Vf(r,e,t){if(typeof(t=se(t))=="string"){if(t==="")throw new H(F.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!WC(e)&&t.indexOf("/")!==-1)throw new H(F.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const n=e.path.child(Ce.fromString(t));if(!X.isDocumentKey(n))throw new H(F.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${n}' is not because it has an odd number of segments (${n.length}).`);return Xh(r,new X(n))}if(t instanceof Te)return Xh(r,t._key);throw new H(F.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${ga(t)}.`)}function xf(r,e){if(!Array.isArray(r)||r.length===0)throw new H(F.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function ug(r,e){const t=(function(s,i){for(const o of s)for(const B of o.getFlattenedFilters())if(i.indexOf(B.op)>=0)return B.op;return null})(r.filters,(function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}})(e.op));if(t!==null)throw t===e.op?new H(F.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new H(F.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}/**
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
 */function Mf(r){return(function(t,n){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of n)if(i in s&&typeof s[i]=="function")return!0;return!1})(r,["next","error","complete"])}class Mv{constructor(e){this.kind="memory",this._onlineComponentProvider=na.provider,this._offlineComponentProvider=e!=null&&e.garbageCollector?e.garbageCollector._offlineComponentProvider:{build:()=>new ig(void 0)}}toJSON(){return{kind:this.kind}}}function IP(r){return new Mv(r)}/**
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
 */const Gv={maxAttempts:5};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uv{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=ms(e)}set(e,t,n){this._verifyNotCommitted();const s=Mn(e,this._firestore),i=Ga(s.converter,t,n),o=Pa(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,n);return this._mutations.push(o.toMutation(s._key,Ve.none())),this}update(e,t,n,...s){this._verifyNotCommitted();const i=Mn(e,this._firestore);let o;return o=typeof(t=se(t))=="string"||t instanceof ds?$c(this._dataReader,"WriteBatch.update",i._key,t,n,s):Qc(this._dataReader,"WriteBatch.update",i._key,t),this._mutations.push(o.toMutation(i._key,Ve.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=Mn(e,this._firestore);return this._mutations=this._mutations.concat(new Gi(t._key,Ve.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new H(F.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function Mn(r,e){if((r=se(r)).firestore!==e)throw new H(F.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Hv=class{constructor(e,t){this._firestore=e,this._transaction=t,this._dataReader=ms(e)}get(e){const t=Mn(e,this._firestore),n=new kv(this._firestore);return this._transaction.lookup([t._key]).then((s=>{if(!s||s.length!==1)return Y(24041);const i=s[0];if(i.isFoundDocument())return new sa(this._firestore,n,i.key,i,t.converter);if(i.isNoDocument())return new sa(this._firestore,n,t._key,null,t.converter);throw Y(18433,{doc:i})}))}set(e,t,n){const s=Mn(e,this._firestore),i=Ga(s.converter,t,n),o=Pa(this._dataReader,"Transaction.set",s._key,i,s.converter!==null,n);return this._transaction.set(s._key,o),this}update(e,t,n,...s){const i=Mn(e,this._firestore);let o;return o=typeof(t=se(t))=="string"||t instanceof ds?$c(this._dataReader,"Transaction.update",i._key,t,n,s):Qc(this._dataReader,"Transaction.update",i._key,t),this._transaction.update(i._key,o),this}delete(e){const t=Mn(e,this._firestore);return this._transaction.delete(t._key),this}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jv extends Hv{constructor(e,t){super(e,t),this._firestore=e}get(e){const t=Mn(e,this._firestore),n=new Ua(this._firestore);return super.get(e).then((s=>new Wn(this._firestore,n,t._key,s._document,new Jr(!1,!1),t.converter)))}}function yP(r,e,t){r=Ze(r,Ut);const n={...Gv,...t};(function(o){if(o.maxAttempts<1)throw new H(F.INVALID_ARGUMENT,"Max attempts must be at least 1")})(n);const s=Sr(r);return Lv(s,(i=>e(new Jv(r,i))),n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function TP(r){r=Ze(r,Te);const e=Ze(r.firestore,Ut),t=Sr(e);return og(t,r._key).then((n=>Ou(e,r,n)))}function AP(r){r=Ze(r,Te);const e=Ze(r.firestore,Ut),t=Sr(e);return og(t,r._key,{source:"server"}).then((n=>Ou(e,r,n)))}function RP(r){r=Ze(r,ar);const e=Ze(r.firestore,Ut),t=Sr(e),n=new Ua(e);return Bg(r._query),bv(t,r._query).then((s=>new Dr(e,n,r,s)))}function vP(r,e,t){r=Ze(r,Te);const n=Ze(r.firestore,Ut),s=Ga(r.converter,e,t),i=ms(n);return Wi(n,[Pa(i,"setDoc",r._key,s,r.converter!==null,t).toMutation(r._key,Ve.none())])}function PP(r,e,t,...n){r=Ze(r,Te);const s=Ze(r.firestore,Ut),i=ms(s);let o;return o=typeof(e=se(e))=="string"||e instanceof ds?$c(i,"updateDoc",r._key,e,t,n):Qc(i,"updateDoc",r._key,e),Wi(s,[o.toMutation(r._key,Ve.exists(!0))])}function SP(r){return Wi(Ze(r.firestore,Ut),[new Gi(r._key,Ve.none())])}function OP(r,e){const t=Ze(r.firestore,Ut),n=OT(r),s=Ga(r.converter,e),i=ms(r.firestore);return Wi(t,[Pa(i,"addDoc",n._key,s,r.converter!==null,{}).toMutation(n._key,Ve.exists(!1))]).then((()=>n))}function bP(r,...e){var u,h,d;r=se(r);let t={includeMetadataChanges:!1,source:"default"},n=0;typeof e[n]!="object"||Mf(e[n])||(t=e[n++]);const s={includeMetadataChanges:t.includeMetadataChanges,source:t.source};if(Mf(e[n])){const p=e[n];e[n]=(u=p.next)==null?void 0:u.bind(p),e[n+1]=(h=p.error)==null?void 0:h.bind(p),e[n+2]=(d=p.complete)==null?void 0:d.bind(p)}let i,o,B;if(r instanceof Te)o=Ze(r.firestore,Ut),B=wa(r._key.path),i={next:p=>{e[n]&&e[n](Ou(o,r,p))},error:e[n+1],complete:e[n+2]};else{const p=Ze(r,ar);o=Ze(p.firestore,Ut),B=p._query;const I=new Ua(o);i={next:R=>{e[n]&&e[n](new Dr(o,I,p,R))},error:e[n+1],complete:e[n+2]},Bg(r._query)}const c=Sr(o);return Ov(c,B,s,i)}function Wi(r,e){const t=Sr(r);return Nv(t,e)}function Ou(r,e,t){const n=t.docs.get(e._key),s=new Ua(r);return new Wn(r,s,e._key,n,new Jr(t.hasPendingWrites,t.fromCache),e.converter)}function NP(r){return r=Ze(r,Ut),Sr(r),new Uv(r,(e=>Wi(r,e)))}const Gf="@firebase/firestore",Uf="4.17.1";(function(e,t=!0){Ww(us),zn(new gn("firestore",((n,{instanceIdentifier:s,options:i})=>{const o=n.getProvider("app").getImmediate(),B=new Ut(new aT(n.getProvider("auth-internal")),new uT(o,n.getProvider("app-check-internal")),ry(o,s),o);return i={useFetchStreams:t,...i},B._setSettings(i),B}),"PUBLIC").setMultipleInstances(!0)),dn(Gf,Uf,e),dn(Gf,Uf,"esm2020")})();/*! Capacitor: https://capacitorjs.com/ - MIT License */var is;(function(r){r.Unimplemented="UNIMPLEMENTED",r.Unavailable="UNAVAILABLE"})(is||(is={}));class FB extends Error{constructor(e,t,n){super(e),this.message=e,this.code=t,this.data=n}}const jv=r=>{var e,t;return r!=null&&r.androidBridge?"android":!((t=(e=r==null?void 0:r.webkit)===null||e===void 0?void 0:e.messageHandlers)===null||t===void 0)&&t.bridge?"ios":"web"},qv=r=>{const e=r.CapacitorCustomPlatform||null,t=r.Capacitor||{},n=t.Plugins=t.Plugins||{},s=()=>e!==null?e.name:jv(r),i=()=>s()!=="web",o=d=>{const p=u.get(d);return!!(p!=null&&p.platforms.has(s())||B(d))},B=d=>{var p;return(p=t.PluginHeaders)===null||p===void 0?void 0:p.find(I=>I.name===d)},c=d=>r.console.error(d),u=new Map,h=(d,p={})=>{const I=u.get(d);if(I)return console.warn(`Capacitor plugin "${d}" already registered. Cannot register plugins twice.`),I.proxy;const R=s(),k=B(d);let M;const z=async()=>(!M&&R in p?M=typeof p[R]=="function"?M=await p[R]():M=p[R]:e!==null&&!M&&"web"in p&&(M=typeof p.web=="function"?M=await p.web():M=p.web),M),re=(E,D)=>{var A,w;if(k){const P=k==null?void 0:k.methods.find(_=>D===_.name);if(P)return P.rtype==="promise"?_=>t.nativePromise(d,D.toString(),_):(_,Je)=>t.nativeCallback(d,D.toString(),_,Je);if(E)return(A=E[D])===null||A===void 0?void 0:A.bind(E)}else{if(E)return(w=E[D])===null||w===void 0?void 0:w.bind(E);throw new FB(`"${d}" plugin is not implemented on ${R}`,is.Unimplemented)}},pe=E=>{let D;const A=(...w)=>{const P=z().then(_=>{const Je=re(_,E);if(Je){const Nt=Je(...w);return D=Nt==null?void 0:Nt.remove,Nt}else throw new FB(`"${d}.${E}()" is not implemented on ${R}`,is.Unimplemented)});return E==="addListener"&&(P.remove=async()=>D()),P};return A.toString=()=>`${E.toString()}() { [capacitor code] }`,Object.defineProperty(A,"name",{value:E,writable:!1,configurable:!1}),A},Se=pe("addListener"),Oe=pe("removeListener"),Ae=(E,D)=>{const A=Se({eventName:E},D),w=async()=>{const _=await A;Oe({eventName:E,callbackId:_},D)},P=new Promise(_=>A.then(()=>_({remove:w})));return P.remove=async()=>{console.warn("Using addListener() without 'await' is deprecated."),await w()},P},v=new Proxy({},{get(E,D){switch(D){case"$$typeof":return;case"toJSON":return()=>({});case"addListener":return k?Ae:Se;case"removeListener":return Oe;default:return pe(D)}}});return n[d]=v,u.set(d,{name:d,proxy:v,platforms:new Set([...Object.keys(p),...k?[R]:[]])}),v};return t.convertFileSrc||(t.convertFileSrc=d=>d),t.getPlatform=s,t.handleError=c,t.isNativePlatform=i,t.isPluginAvailable=o,t.registerPlugin=h,t.Exception=FB,t.DEBUG=!!t.DEBUG,t.isLoggingEnabled=!!t.isLoggingEnabled,t},Kv=r=>r.Capacitor=qv(r),hc=Kv(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),Ja=hc.registerPlugin;class ja{constructor(){this.listeners={},this.retainedEventArguments={},this.windowListeners={}}addListener(e,t){let n=!1;this.listeners[e]||(this.listeners[e]=[],n=!0),this.listeners[e].push(t);const i=this.windowListeners[e];i&&!i.registered&&this.addWindowListener(i),n&&this.sendRetainedArgumentsForEvent(e);const o=async()=>this.removeListener(e,t);return Promise.resolve({remove:o})}async removeAllListeners(){this.listeners={};for(const e in this.windowListeners)this.removeWindowListener(this.windowListeners[e]);this.windowListeners={}}notifyListeners(e,t,n){const s=this.listeners[e];if(!s){if(n){let i=this.retainedEventArguments[e];i||(i=[]),i.push(t),this.retainedEventArguments[e]=i}return}s.forEach(i=>i(t))}hasListeners(e){var t;return!!(!((t=this.listeners[e])===null||t===void 0)&&t.length)}registerWindowListener(e,t){this.windowListeners[t]={registered:!1,windowEventName:e,pluginEventName:t,handler:n=>{this.notifyListeners(t,n)}}}unimplemented(e="not implemented"){return new hc.Exception(e,is.Unimplemented)}unavailable(e="not available"){return new hc.Exception(e,is.Unavailable)}async removeListener(e,t){const n=this.listeners[e];if(!n)return;const s=n.indexOf(t);this.listeners[e].splice(s,1),this.listeners[e].length||this.removeWindowListener(this.windowListeners[e])}addWindowListener(e){window.addEventListener(e.windowEventName,e.handler),e.registered=!0}removeWindowListener(e){e&&(window.removeEventListener(e.windowEventName,e.handler),e.registered=!1)}sendRetainedArgumentsForEvent(e){const t=this.retainedEventArguments[e];t&&(delete this.retainedEventArguments[e],t.forEach(n=>{this.notifyListeners(e,n)}))}}const Hf=r=>encodeURIComponent(r).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),Jf=r=>r.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent);class Wv extends ja{async getCookies(){const e=document.cookie,t={};return e.split(";").forEach(n=>{if(n.length<=0)return;let[s,i]=n.replace(/=/,"CAP_COOKIE").split("CAP_COOKIE");s=Jf(s).trim(),i=Jf(i).trim(),t[s]=i}),t}async setCookie(e){try{const t=Hf(e.key),n=Hf(e.value),s=e.expires?`; expires=${e.expires.replace("expires=","")}`:"",i=(e.path||"/").replace("path=",""),o=e.url!=null&&e.url.length>0?`domain=${e.url}`:"";document.cookie=`${t}=${n||""}${s}; path=${i}; ${o};`}catch(t){return Promise.reject(t)}}async deleteCookie(e){try{document.cookie=`${e.key}=; Max-Age=0`}catch(t){return Promise.reject(t)}}async clearCookies(){try{const e=document.cookie.split(";")||[];for(const t of e)document.cookie=t.replace(/^ +/,"").replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(e){return Promise.reject(e)}}async clearAllCookies(){try{await this.clearCookies()}catch(e){return Promise.reject(e)}}}Ja("CapacitorCookies",{web:()=>new Wv});const zv=async r=>new Promise((e,t)=>{const n=new FileReader;n.onload=()=>{const s=n.result;e(s.indexOf(",")>=0?s.split(",")[1]:s)},n.onerror=s=>t(s),n.readAsDataURL(r)}),Qv=(r={})=>{const e=Object.keys(r);return Object.keys(r).map(s=>s.toLocaleLowerCase()).reduce((s,i,o)=>(s[i]=r[e[o]],s),{})},$v=(r,e=!0)=>r?Object.entries(r).reduce((n,s)=>{const[i,o]=s;let B,c;return Array.isArray(o)?(c="",o.forEach(u=>{B=e?encodeURIComponent(u):u,c+=`${i}=${B}&`}),c.slice(0,-1)):(B=e?encodeURIComponent(o):o,c=`${i}=${B}`),`${n}&${c}`},"").substr(1):null,Yv=(r,e={})=>{const t=Object.assign({method:r.method||"GET",headers:r.headers},e),s=Qv(r.headers)["content-type"]||"";if(typeof r.data=="string")t.body=r.data;else if(s.includes("application/x-www-form-urlencoded")){const i=new URLSearchParams;for(const[o,B]of Object.entries(r.data||{}))i.set(o,B);t.body=i.toString()}else if(s.includes("multipart/form-data")||r.data instanceof FormData){const i=new FormData;if(r.data instanceof FormData)r.data.forEach((B,c)=>{i.append(c,B)});else for(const B of Object.keys(r.data))i.append(B,r.data[B]);t.body=i;const o=new Headers(t.headers);o.delete("content-type"),t.headers=o}else(s.includes("application/json")||typeof r.data=="object")&&(t.body=JSON.stringify(r.data));return t};class Xv extends ja{async request(e){const t=Yv(e,e.webFetchExtra),n=$v(e.params,e.shouldEncodeUrlParams),s=n?`${e.url}?${n}`:e.url,i=await fetch(s,t),o=i.headers.get("content-type")||"";let{responseType:B="text"}=i.ok?e:{};o.includes("application/json")&&(B="json");let c,u;switch(B){case"arraybuffer":case"blob":u=await i.blob(),c=await zv(u);break;case"json":c=await i.json();break;case"document":case"text":default:c=await i.text()}const h={};return i.headers.forEach((d,p)=>{h[p]=d}),{data:c,headers:h,status:i.status,url:i.url}}async get(e){return this.request(Object.assign(Object.assign({},e),{method:"GET"}))}async post(e){return this.request(Object.assign(Object.assign({},e),{method:"POST"}))}async put(e){return this.request(Object.assign(Object.assign({},e),{method:"PUT"}))}async patch(e){return this.request(Object.assign(Object.assign({},e),{method:"PATCH"}))}async delete(e){return this.request(Object.assign(Object.assign({},e),{method:"DELETE"}))}}Ja("CapacitorHttp",{web:()=>new Xv});var jf;(function(r){r.Dark="DARK",r.Light="LIGHT",r.Default="DEFAULT"})(jf||(jf={}));var qf;(function(r){r.StatusBar="StatusBar",r.NavigationBar="NavigationBar"})(qf||(qf={}));class Zv extends ja{async setStyle(){this.unavailable("not available for web")}async setAnimation(){this.unavailable("not available for web")}async show(){this.unavailable("not available for web")}async hide(){this.unavailable("not available for web")}}Ja("SystemBars",{web:()=>new Zv});var jr;(function(r){r.IndexedDbLocal="INDEXED_DB_LOCAL",r.InMemory="IN_MEMORY",r.BrowserLocal="BROWSER_LOCAL",r.BrowserSession="BROWSER_SESSION"})(jr||(jr={}));var kn;(function(r){r.APPLE="apple.com",r.FACEBOOK="facebook.com",r.GAME_CENTER="gc.apple.com",r.GITHUB="github.com",r.GOOGLE="google.com",r.MICROSOFT="microsoft.com",r.PLAY_GAMES="playgames.google.com",r.TWITTER="twitter.com",r.YAHOO="yahoo.com",r.PASSWORD="password",r.PHONE="phone"})(kn||(kn={}));const LP=Ja("FirebaseAuthentication",{web:()=>Wg(()=>Promise.resolve().then(()=>eP),void 0,import.meta.url).then(r=>new r.FirebaseAuthenticationWeb)});class fe extends ja{constructor(){super(),this.lastConfirmationResult=new Map;const e=ae();e.onAuthStateChanged(t=>this.handleAuthStateChange(t)),e.onIdTokenChanged(t=>void this.handleIdTokenChange(t))}async applyActionCode(e){const t=ae();return PD(t,e.oobCode)}async createUserWithEmailAndPassword(e){const t=ae(),n=await SD(t,e.email,e.password);return this.createSignInResult(n,null)}async confirmPasswordReset(e){const t=ae();return vD(t,e.oobCode,e.newPassword)}async confirmVerificationCode(e){const{verificationCode:t,verificationId:n}=e,s=this.lastConfirmationResult.get(n);if(!s)throw new Error(fe.ERROR_CONFIRMATION_RESULT_MISSING);const i=await s.confirm(t);return this.createSignInResult(i,null)}async deleteUser(){const t=ae().currentUser;if(!t)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);return XD(t)}async fetchSignInMethodsForEmail(e){const t=ae();return{signInMethods:await kD(t,e.email)}}async getPendingAuthResult(){throw this.unimplemented("Not implemented on web.")}async getCurrentUser(){const e=ae();return{user:this.createUserResult(e.currentUser)}}async getIdToken(e){const t=ae();if(!t.currentUser)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);return{token:await t.currentUser.getIdToken(e==null?void 0:e.forceRefresh)||""}}async getIdTokenResult(e){const t=ae();if(!t.currentUser)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);const n=await t.currentUser.getIdTokenResult(e==null?void 0:e.forceRefresh);return Object.assign(Object.assign({},n),{authTime:Date.parse(n.authTime),expirationTime:Date.parse(n.expirationTime),issuedAtTime:Date.parse(n.issuedAtTime)})}async getRedirectResult(){const e=ae(),t=await LI(e),n=t?be.credentialFromResult(t):null;return this.createSignInResult(t,n)}async getTenantId(){return{tenantId:ae().tenantId}}async isSignInWithEmailLink(e){const t=ae();return{isSignInWithEmailLink:ND(t,e.emailLink)}}async linkWithApple(e){const t=new be(kn.APPLE);this.applySignInOptions(e||{},t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e==null?void 0:e.mode),s=be.credentialFromResult(n);return this.createSignInResult(n,s)}async linkWithEmailAndPassword(e){const t=_n.credential(e.email,e.password),n=await this.linkCurrentUserWithCredential(t);return this.createSignInResult(n,t)}async linkWithEmailLink(e){const t=_n.credentialWithLink(e.email,e.emailLink),n=await this.linkCurrentUserWithCredential(t);return this.createSignInResult(n,t)}async linkWithFacebook(e){const t=new Ft;this.applySignInOptions(e||{},t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e==null?void 0:e.mode),s=Ft.credentialFromResult(n);return this.createSignInResult(n,s)}async linkWithGameCenter(){throw this.unimplemented("Not implemented on web.")}async linkWithGithub(e){const t=new Vt;this.applySignInOptions(e||{},t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e==null?void 0:e.mode),s=Vt.credentialFromResult(n);return this.createSignInResult(n,s)}async linkWithGoogle(e){const t=new kt;this.applySignInOptions(e||{},t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e==null?void 0:e.mode),s=kt.credentialFromResult(n);return this.createSignInResult(n,s)}async linkWithMicrosoft(e){const t=new be(kn.MICROSOFT);this.applySignInOptions(e||{},t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e==null?void 0:e.mode),s=be.credentialFromResult(n);return this.createSignInResult(n,s)}async linkWithOpenIdConnect(e){const t=new be(e.providerId);this.applySignInOptions(e,t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e.mode),s=be.credentialFromResult(n);return this.createSignInResult(n,s)}async linkWithPhoneNumber(e){const n=ae().currentUser;if(!n)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);if(!e.phoneNumber)throw new Error(fe.ERROR_PHONE_NUMBER_MISSING);if(!e.recaptchaVerifier||!(e.recaptchaVerifier instanceof uh))throw new Error(fe.ERROR_RECAPTCHA_VERIFIER_MISSING);try{const s=await EI(n,e.phoneNumber,e.recaptchaVerifier),{verificationId:i}=s;this.lastConfirmationResult.set(i,s);const o={verificationId:i};this.notifyListeners(fe.PHONE_CODE_SENT_EVENT,o)}catch(s){const i={message:this.getErrorMessage(s)};this.notifyListeners(fe.PHONE_VERIFICATION_FAILED_EVENT,i)}}async linkWithPlayGames(){throw this.unimplemented("Not implemented on web.")}async linkWithTwitter(e){const t=new xt;this.applySignInOptions(e||{},t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e==null?void 0:e.mode),s=xt.credentialFromResult(n);return this.createSignInResult(n,s)}async linkWithYahoo(e){const t=new be(kn.YAHOO);this.applySignInOptions(e||{},t);const n=await this.linkCurrentUserWithPopupOrRedirect(t,e==null?void 0:e.mode),s=be.credentialFromResult(n);return this.createSignInResult(n,s)}async reload(){const t=ae().currentUser;if(!t)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);return wd(t)}async revokeAccessToken(e){const t=ae();return YD(t,e.token)}async sendEmailVerification(e){const n=ae().currentUser;if(!n)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);return VD(n,e==null?void 0:e.actionCodeSettings)}async sendPasswordResetEmail(e){const t=ae();return RD(t,e.email,e.actionCodeSettings)}async sendSignInLinkToEmail(e){const t=ae();return bD(t,e.email,e.actionCodeSettings)}async setLanguageCode(e){const t=ae();t.languageCode=e.languageCode}async setPersistence(e){const t=ae();switch(e.persistence){case jr.BrowserLocal:await ho(t,Wd);break;case jr.BrowserSession:await ho(t,Sc);break;case jr.IndexedDbLocal:await ho(t,Zd);break;case jr.InMemory:await ho(t,qB);break}}async setTenantId(e){const t=ae();t.tenantId=e.tenantId}async signInAnonymously(){const e=ae(),t=await ID(e);return this.createSignInResult(t,null)}async signInWithApple(e){const t=new be(kn.APPLE);this.applySignInOptions(e||{},t);const n=await this.signInWithPopupOrRedirect(t,e==null?void 0:e.mode),s=be.credentialFromResult(n);return this.createSignInResult(n,s)}async signInWithCustomToken(e){const t=ae(),n=await AD(t,e.token);return this.createSignInResult(n,null)}async signInWithEmailAndPassword(e){const t=ae(),n=await OD(t,e.email,e.password);return this.createSignInResult(n,null)}async signInWithEmailLink(e){const t=ae(),n=await LD(t,e.email,e.emailLink);return this.createSignInResult(n,null)}async signInWithFacebook(e){const t=new Ft;this.applySignInOptions(e||{},t);const n=await this.signInWithPopupOrRedirect(t,e==null?void 0:e.mode),s=Ft.credentialFromResult(n);return this.createSignInResult(n,s)}async signInWithGithub(e){const t=new Vt;this.applySignInOptions(e||{},t);const n=await this.signInWithPopupOrRedirect(t,e==null?void 0:e.mode),s=Vt.credentialFromResult(n);return this.createSignInResult(n,s)}async signInWithGoogle(e){const t=new kt;this.applySignInOptions(e||{},t);const n=await this.signInWithPopupOrRedirect(t,e==null?void 0:e.mode),s=kt.credentialFromResult(n);return this.createSignInResult(n,s)}async signInWithMicrosoft(e){const t=new be(kn.MICROSOFT);this.applySignInOptions(e||{},t);const n=await this.signInWithPopupOrRedirect(t,e==null?void 0:e.mode),s=be.credentialFromResult(n);return this.createSignInResult(n,s)}async signInWithOpenIdConnect(e){const t=new be(e.providerId);this.applySignInOptions(e,t);const n=await this.signInWithPopupOrRedirect(t,e.mode),s=be.credentialFromResult(n);return this.createSignInResult(n,s)}async signInWithPhoneNumber(e){if(!e.phoneNumber)throw new Error(fe.ERROR_PHONE_NUMBER_MISSING);if(!e.recaptchaVerifier||!(e.recaptchaVerifier instanceof uh))throw new Error(fe.ERROR_RECAPTCHA_VERIFIER_MISSING);const t=ae();try{const n=await mI(t,e.phoneNumber,e.recaptchaVerifier),{verificationId:s}=n;this.lastConfirmationResult.set(s,n);const i={verificationId:s};this.notifyListeners(fe.PHONE_CODE_SENT_EVENT,i)}catch(n){const s={message:this.getErrorMessage(n)};this.notifyListeners(fe.PHONE_VERIFICATION_FAILED_EVENT,s)}}async signInWithPlayGames(){throw this.unimplemented("Not implemented on web.")}async signInWithGameCenter(){throw this.unimplemented("Not implemented on web.")}async signInWithTwitter(e){const t=new xt;this.applySignInOptions(e||{},t);const n=await this.signInWithPopupOrRedirect(t,e==null?void 0:e.mode),s=xt.credentialFromResult(n);return this.createSignInResult(n,s)}async signInWithYahoo(e){const t=new be(kn.YAHOO);this.applySignInOptions(e||{},t);const n=await this.signInWithPopupOrRedirect(t,e==null?void 0:e.mode),s=be.credentialFromResult(n);return this.createSignInResult(n,s)}async signOut(){await ae().signOut()}async unlink(e){const t=ae();if(!t.currentUser)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);const n=await wD(t.currentUser,e.providerId);return{user:this.createUserResult(n)}}async updateEmail(e){const n=ae().currentUser;if(!n)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);return UD(n,e.newEmail)}async updatePassword(e){const n=ae().currentUser;if(!n)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);return HD(n,e.newPassword)}async updateProfile(e){const n=ae().currentUser;if(!n)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);return GD(n,{displayName:e.displayName,photoURL:e.photoUrl})}async useAppLanguage(){ae().useDeviceLanguage()}async useEmulator(e){const t=ae(),n=e.port||9099,s=e.scheme||"http";e.host.includes("://")?KB(t,`${e.host}:${n}`):KB(t,`${s}://${e.host}:${n}`)}async verifyBeforeUpdateEmail(e){const n=ae().currentUser;if(!n)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);return xD(n,e==null?void 0:e.newEmail,e==null?void 0:e.actionCodeSettings)}handleAuthStateChange(e){const n={user:this.createUserResult(e)};this.notifyListeners(fe.AUTH_STATE_CHANGE_EVENT,n,!0)}async handleIdTokenChange(e){if(!e)return;const n={token:await e.getIdToken(!1)};this.notifyListeners(fe.ID_TOKEN_CHANGE_EVENT,n,!0)}applySignInOptions(e,t){if(e.customParameters){const n={};e.customParameters.map(s=>{n[s.key]=s.value}),t.setCustomParameters(n)}if(e.scopes)for(const n of e.scopes)t.addScope(n)}signInWithPopupOrRedirect(e,t){const n=ae();return t==="redirect"?SI(n,e):yI(n,e)}linkCurrentUserWithPopupOrRedirect(e,t){const n=ae();if(!n.currentUser)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);return t==="redirect"?bI(n.currentUser,e):TI(n.currentUser,e)}linkCurrentUserWithCredential(e){const t=ae();if(!t.currentUser)throw new Error(fe.ERROR_NO_USER_SIGNED_IN);return Hd(t.currentUser,e)}requestAppTrackingTransparencyPermission(){throw this.unimplemented("Not implemented on web.")}checkAppTrackingTransparencyPermission(){throw this.unimplemented("Not implemented on web.")}createSignInResult(e,t){const n=this.createUserResult((e==null?void 0:e.user)||null),s=this.createCredentialResult(t),i=this.createAdditionalUserInfoResult(e);return{user:n,credential:s,additionalUserInfo:i}}createCredentialResult(e){if(!e)return null;const t={providerId:e.providerId};return e instanceof en&&(t.accessToken=e.accessToken,t.idToken=e.idToken,t.secret=e.secret),t}createUserResult(e){return e?{displayName:e.displayName,email:e.email,emailVerified:e.emailVerified,isAnonymous:e.isAnonymous,metadata:this.createUserMetadataResult(e.metadata),phoneNumber:e.phoneNumber,photoUrl:e.photoURL,providerData:this.createUserProviderDataResult(e.providerData),providerId:e.providerId,tenantId:e.tenantId,uid:e.uid}:null}createUserMetadataResult(e){const t={};return e.creationTime&&(t.creationTime=Date.parse(e.creationTime)),e.lastSignInTime&&(t.lastSignInTime=Date.parse(e.lastSignInTime)),t}createUserProviderDataResult(e){return e.map(t=>({displayName:t.displayName,email:t.email,phoneNumber:t.phoneNumber,photoUrl:t.photoURL,providerId:t.providerId,uid:t.uid}))}createAdditionalUserInfoResult(e){if(!e)return null;const t=zD(e);if(!t)return null;const{isNewUser:n,profile:s,providerId:i,username:o}=t,B={isNewUser:n};return i!==null&&(B.providerId=i),s!==null&&(B.profile=s),o!=null&&(B.username=o),B}getErrorMessage(e){return e instanceof Object&&"message"in e&&typeof e.message=="string"?e.message:JSON.stringify(e)}}fe.AUTH_STATE_CHANGE_EVENT="authStateChange";fe.ID_TOKEN_CHANGE_EVENT="idTokenChange";fe.PHONE_CODE_SENT_EVENT="phoneCodeSent";fe.PHONE_VERIFICATION_FAILED_EVENT="phoneVerificationFailed";fe.ERROR_NO_USER_SIGNED_IN="No user is signed in.";fe.ERROR_PHONE_NUMBER_MISSING="phoneNumber must be provided.";fe.ERROR_RECAPTCHA_VERIFIER_MISSING="recaptchaVerifier must be provided and must be an instance of RecaptchaVerifier.";fe.ERROR_CONFIRMATION_RESULT_MISSING="No confirmation result with this verification id was found.";const eP=Object.freeze(Object.defineProperty({__proto__:null,FirebaseAuthenticationWeb:fe},Symbol.toStringTag,{value:"Module"}));export{bP as A,EP as B,hc as C,_P as D,OP as E,LP as F,kt as G,lP as H,PP as I,hP as J,fP as K,DP as L,sP as M,oP as N,Yv as O,dd as R,ye as T,ja as W,Wg as _,gc as a,rP as b,ae as c,ho as d,Wd as e,gP as f,nP as g,mP as h,_E as i,AP as j,OT as k,vc as l,IP as m,yI as n,iP as o,LI as p,XD as q,Ja as r,aP as s,yP as t,TP as u,vP as v,SP as w,RP as x,uP as y,NP as z};
