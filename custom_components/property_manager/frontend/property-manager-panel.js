function t(t,e,s,i){var a,o=arguments.length,r=o<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,s,i);else for(var n=t.length-1;n>=0;n--)(a=t[n])&&(r=(o<3?a(r):o>3?a(e,s,r):a(e,s))||r);return o>3&&r&&Object.defineProperty(e,s,r),r}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=globalThis,s=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),a=new WeakMap;let o=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(s&&void 0===t){const s=void 0!==e&&1===e.length;s&&(t=a.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&a.set(e,t))}return t}toString(){return this.cssText}};const r=(t,...e)=>{const s=1===t.length?t[0]:e.reduce((e,s,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[i+1],t[0]);return new o(s,t,i)},n=s?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return(t=>new o("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,y=globalThis,g=y.trustedTypes,m=g?g.emptyScript:"",_=y.reactiveElementPolyfillSupport,f=(t,e)=>t,v={toAttribute(t,e){switch(e){case Boolean:t=t?m:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch(t){s=null}}return s}},b=(t,e)=>!l(t,e),$={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:b};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),y.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=$){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);void 0!==i&&d(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:a}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:i,set(e){const o=i?.call(this);a?.call(this,e),this.requestUpdate(t,o,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??$}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const t=this.properties,e=[...h(t),...p(t)];for(const s of e)this.createProperty(s,t[s])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,s]of e)this.elementProperties.set(t,s)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const s=this._$Eu(t,e);void 0!==s&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const t of s)e.unshift(n(t))}else void 0!==t&&e.push(n(t));return e}static _$Eu(t,e){const s=e.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,i)=>{if(s)t.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const s of i){const i=document.createElement("style"),a=e.litNonce;void 0!==a&&i.setAttribute("nonce",a),i.textContent=s.cssText,t.appendChild(i)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(void 0!==i&&!0===s.reflect){const a=(void 0!==s.converter?.toAttribute?s.converter:v).toAttribute(e,s.type);this._$Em=t,null==a?this.removeAttribute(i):this.setAttribute(i,a),this._$Em=null}}_$AK(t,e){const s=this.constructor,i=s._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=s.getPropertyOptions(i),a="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:v;this._$Em=i;const o=a.fromAttribute(e,t.type);this[i]=o??this._$Ej?.get(i)??o,this._$Em=null}}requestUpdate(t,e,s,i=!1,a){if(void 0!==t){const o=this.constructor;if(!1===i&&(a=this[t]),s??=o.getPropertyOptions(t),!((s.hasChanged??b)(a,e)||s.useDefault&&s.reflect&&a===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,s))))return;this.C(t,e,s)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:a},o){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),!0!==a||void 0!==o)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),!0===i&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,s]of t){const{wrapped:t}=s,i=this[e];!0!==t||this._$AL.has(e)||void 0===i||this.C(e,void 0,s,i)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[f("elementProperties")]=new Map,x[f("finalized")]=new Map,_?.({ReactiveElement:x}),(y.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const A=globalThis,w=t=>t,E=A.trustedTypes,S=E?E.createPolicy("lit-html",{createHTML:t=>t}):void 0,C="$lit$",k=`lit$${Math.random().toFixed(9).slice(2)}$`,P="?"+k,T=`<${P}>`,M=document,z=()=>M.createComment(""),O=t=>null===t||"object"!=typeof t&&"function"!=typeof t,D=Array.isArray,U="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,N=/-->/g,j=/>/g,H=RegExp(`>|${U}(?:([^\\s"'>=/]+)(${U}*=${U}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),B=/'/g,F=/"/g,I=/^(?:script|style|textarea|title)$/i,W=(t=>(e,...s)=>({_$litType$:t,strings:e,values:s}))(1),q=Symbol.for("lit-noChange"),V=Symbol.for("lit-nothing"),G=new WeakMap,Z=M.createTreeWalker(M,129);function J(t,e){if(!D(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(e):e}const K=(t,e)=>{const s=t.length-1,i=[];let a,o=2===e?"<svg>":3===e?"<math>":"",r=R;for(let e=0;e<s;e++){const s=t[e];let n,l,d=-1,c=0;for(;c<s.length&&(r.lastIndex=c,l=r.exec(s),null!==l);)c=r.lastIndex,r===R?"!--"===l[1]?r=N:void 0!==l[1]?r=j:void 0!==l[2]?(I.test(l[2])&&(a=RegExp("</"+l[2],"g")),r=H):void 0!==l[3]&&(r=H):r===H?">"===l[0]?(r=a??R,d=-1):void 0===l[1]?d=-2:(d=r.lastIndex-l[2].length,n=l[1],r=void 0===l[3]?H:'"'===l[3]?F:B):r===F||r===B?r=H:r===N||r===j?r=R:(r=H,a=void 0);const h=r===H&&t[e+1].startsWith("/>")?" ":"";o+=r===R?s+T:d>=0?(i.push(n),s.slice(0,d)+C+s.slice(d)+k+h):s+k+(-2===d?e:h)}return[J(t,o+(t[s]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),i]};class Q{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let a=0,o=0;const r=t.length-1,n=this.parts,[l,d]=K(t,e);if(this.el=Q.createElement(l,s),Z.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(i=Z.nextNode())&&n.length<r;){if(1===i.nodeType){if(i.hasAttributes())for(const t of i.getAttributeNames())if(t.endsWith(C)){const e=d[o++],s=i.getAttribute(t).split(k),r=/([.?@])?(.*)/.exec(e);n.push({type:1,index:a,name:r[2],strings:s,ctor:"."===r[1]?st:"?"===r[1]?it:"@"===r[1]?at:et}),i.removeAttribute(t)}else t.startsWith(k)&&(n.push({type:6,index:a}),i.removeAttribute(t));if(I.test(i.tagName)){const t=i.textContent.split(k),e=t.length-1;if(e>0){i.textContent=E?E.emptyScript:"";for(let s=0;s<e;s++)i.append(t[s],z()),Z.nextNode(),n.push({type:2,index:++a});i.append(t[e],z())}}}else if(8===i.nodeType)if(i.data===P)n.push({type:2,index:a});else{let t=-1;for(;-1!==(t=i.data.indexOf(k,t+1));)n.push({type:7,index:a}),t+=k.length-1}a++}}static createElement(t,e){const s=M.createElement("template");return s.innerHTML=t,s}}function X(t,e,s=t,i){if(e===q)return e;let a=void 0!==i?s._$Co?.[i]:s._$Cl;const o=O(e)?void 0:e._$litDirective$;return a?.constructor!==o&&(a?._$AO?.(!1),void 0===o?a=void 0:(a=new o(t),a._$AT(t,s,i)),void 0!==i?(s._$Co??=[])[i]=a:s._$Cl=a),void 0!==a&&(e=X(t,a._$AS(t,e.values),a,i)),e}class Y{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??M).importNode(e,!0);Z.currentNode=i;let a=Z.nextNode(),o=0,r=0,n=s[0];for(;void 0!==n;){if(o===n.index){let e;2===n.type?e=new tt(a,a.nextSibling,this,t):1===n.type?e=new n.ctor(a,n.name,n.strings,this,t):6===n.type&&(e=new ot(a,this,t)),this._$AV.push(e),n=s[++r]}o!==n?.index&&(a=Z.nextNode(),o++)}return Z.currentNode=M,i}p(t){let e=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class tt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=V,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=X(this,t,e),O(t)?t===V||null==t||""===t?(this._$AH!==V&&this._$AR(),this._$AH=V):t!==this._$AH&&t!==q&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>D(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==V&&O(this._$AH)?this._$AA.nextSibling.data=t:this.T(M.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,i="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=Q.createElement(J(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{const t=new Y(i,this),s=t.u(this.options);t.p(e),this.T(s),this._$AH=t}}_$AC(t){let e=G.get(t.strings);return void 0===e&&G.set(t.strings,e=new Q(t)),e}k(t){D(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const a of t)i===e.length?e.push(s=new tt(this.O(z()),this.O(z()),this,this.options)):s=e[i],s._$AI(a),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=w(t).nextSibling;w(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,a){this.type=1,this._$AH=V,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=a,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=V}_$AI(t,e=this,s,i){const a=this.strings;let o=!1;if(void 0===a)t=X(this,t,e,0),o=!O(t)||t!==this._$AH&&t!==q,o&&(this._$AH=t);else{const i=t;let r,n;for(t=a[0],r=0;r<a.length-1;r++)n=X(this,i[s+r],e,r),n===q&&(n=this._$AH[r]),o||=!O(n)||n!==this._$AH[r],n===V?t=V:t!==V&&(t+=(n??"")+a[r+1]),this._$AH[r]=n}o&&!i&&this.j(t)}j(t){t===V?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class st extends et{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===V?void 0:t}}let it=class extends et{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==V)}};class at extends et{constructor(t,e,s,i,a){super(t,e,s,i,a),this.type=5}_$AI(t,e=this){if((t=X(this,t,e,0)??V)===q)return;const s=this._$AH,i=t===V&&s!==V||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,a=t!==V&&(s===V||i);i&&this.element.removeEventListener(this.name,this,s),a&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class ot{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){X(this,t)}}const rt=A.litHtmlPolyfillSupport;rt?.(Q,tt),(A.litHtmlVersions??=[]).push("3.3.2");const nt=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class lt extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,s)=>{const i=s?.renderBefore??e;let a=i._$litPart$;if(void 0===a){const t=s?.renderBefore??null;i._$litPart$=a=new tt(e.insertBefore(z(),t),t,void 0,s??{})}return a._$AI(t),a})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return q}}lt._$litElement$=!0,lt.finalized=!0,nt.litElementHydrateSupport?.({LitElement:lt});const dt=nt.litElementPolyfillSupport;dt?.({LitElement:lt}),(nt.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct=t=>(e,s)=>{void 0!==s?s.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},ht={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:b},pt=(t=ht,e,s)=>{const{kind:i,metadata:a}=s;let o=globalThis.litPropertyMetadata.get(a);if(void 0===o&&globalThis.litPropertyMetadata.set(a,o=new Map),"setter"===i&&((t=Object.create(t)).wrapped=!0),o.set(s.name,t),"accessor"===i){const{name:i}=s;return{set(s){const a=e.get.call(this);e.set.call(this,s),this.requestUpdate(i,a,t,!0,s)},init(e){return void 0!==e&&this.C(i,void 0,t,e),e}}}if("setter"===i){const{name:i}=s;return function(s){const a=this[i];e.call(this,s),this.requestUpdate(i,a,t,!0,s)}}throw Error("Unsupported decorator location: "+i)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ut(t){return(e,s)=>"object"==typeof s?pt(t,e,s):((t,e,s)=>{const i=e.hasOwnProperty(s);return e.constructor.createProperty(s,t),i?Object.getOwnPropertyDescriptor(e,s):void 0})(t,e,s)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function yt(t){return ut({...t,state:!0,attribute:!1})}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function gt(t,e){return(e,s,i)=>((t,e,s)=>(s.configurable=!0,s.enumerable=!0,Reflect.decorate&&"object"!=typeof e&&Object.defineProperty(t,e,s),s))(e,s,{get(){return(e=>e.renderRoot?.querySelector(t)??null)(this)}})}const mt={structures:"#78909C",landscaping:"#66BB6A",water:"#42A5F5",utilities:"#FFA726",pest_control:"#FDD835",paths_access:"#A1887F",lighting:"#FFB300",recreation:"#AB47BC",vehicles:"#78909C",septic:"#8D6E63",well_water:"#0288D1",hvac_mini_split:"#26A69A",hvac_ac:"#5C6BC0",custom:"#9E9E9E"},_t={lawn:{fill:"#81C784",stroke:"#66BB6A"},garden:{fill:"#A5D6A7",stroke:"#4CAF50"},deck:{fill:"#B0BEC5",stroke:"#78909C"},water:{fill:"#64B5F6",stroke:"#42A5F5"},path:{fill:"#D7CCC8",stroke:"#A1887F"},driveway:{fill:"#BDBDBD",stroke:"#9E9E9E"},fence:{fill:"#8D6E63",stroke:"#6D4C41"},pest:{fill:"#FFF176",stroke:"#FDD835"},recreation:{fill:"#CE93D8",stroke:"#AB47BC"}},ft=r`
  :host {
    display: block;
    height: 100%;
    font-family: var(--primary-font-family, Roboto, sans-serif);
    --pm-primary: #4caf50;
    --pm-secondary: #2196f3;
    --pm-bg: var(--primary-background-color, #fafafa);
    --pm-surface: var(--card-background-color, #ffffff);
    --pm-text: var(--primary-text-color, #212121);
    --pm-text-secondary: var(--secondary-text-color, #757575);
    --pm-divider: var(--divider-color, #e0e0e0);
  }

  .panel-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--pm-bg);
  }

  .toolbar {
    display: flex;
    align-items: center;
    padding: 0 16px;
    height: 56px;
    background: var(--pm-surface);
    border-bottom: 1px solid var(--pm-divider);
    gap: 8px;
  }

  .toolbar h1 {
    font-size: 20px;
    font-weight: 400;
    margin: 0;
    flex: 1;
    color: var(--pm-text);
  }

  .map-container {
    flex: 1;
    position: relative;
  }

  .toolbar-button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    border: 1px solid var(--pm-divider);
    border-radius: 4px;
    background: var(--pm-surface);
    color: var(--pm-text);
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
  }

  .toolbar-button:hover {
    background: var(--pm-divider);
  }

  .toolbar-button.active {
    background: var(--pm-primary);
    color: white;
    border-color: var(--pm-primary);
  }

  .detail-panel {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 360px;
    max-width: 100vw;
    background: var(--pm-surface);
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    overflow-y: auto;
    padding: 16px;
  }

  .detail-panel h2 {
    margin: 0 0 8px;
    font-size: 18px;
    color: var(--pm-text);
  }

  .detail-panel .category-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    color: white;
    margin-bottom: 12px;
  }

  .detail-panel .field {
    margin-bottom: 8px;
  }

  .detail-panel .field label {
    display: block;
    font-size: 12px;
    color: var(--pm-text-secondary);
    margin-bottom: 2px;
  }
`;function vt(t,e,s){const{fill:i,stroke:a}=function(t){const e=(t.type||"").toLowerCase();if(_t[e])return _t[e];const s=mt[t.category]??"#9E9E9E";return{fill:s,stroke:s}}(e),o=a;switch(e.geometry.type){case"Point":{const i=e.geometry.coordinates,[a,r]=s(i[0],i[1]);t.beginPath(),t.arc(a,r,8,0,2*Math.PI),t.fillStyle=o,t.fill(),t.strokeStyle="#fff",t.lineWidth=2,t.stroke(),t.fillStyle="#333",t.font="11px sans-serif",t.textAlign="center",t.fillText(e.name,a,r-14);break}case"LineString":{const i=e.geometry.coordinates;if(i.length<2)return;t.beginPath();const[a,r]=s(i[0][0],i[0][1]);t.moveTo(a,r);for(let e=1;e<i.length;e++){const[a,o]=s(i[e][0],i[e][1]);t.lineTo(a,o)}t.strokeStyle=o,t.lineWidth=3,t.stroke();break}case"Polygon":{const o=e.geometry.coordinates[0];if(!o||o.length<3)return;t.beginPath();const[r,n]=s(o[0][0],o[0][1]);t.moveTo(r,n);for(let e=1;e<o.length;e++){const[i,a]=s(o[e][0],o[e][1]);t.lineTo(i,a)}t.closePath(),t.fillStyle=$t(i,.4),t.fill(),t.strokeStyle=a,t.lineWidth=2,t.stroke();break}}}function bt(t,e,s){if("Polygon"!==e.geometry.type)return;const i=e.geometry.coordinates[0];if(!i||i.length<3)return;const a=e.color||mt[e.category]||"#9E9E9E";t.beginPath();const[o,r]=s(i[0][0],i[0][1]);t.moveTo(o,r);for(let e=1;e<i.length;e++){const[a,o]=s(i[e][0],i[e][1]);t.lineTo(a,o)}t.closePath(),t.fillStyle=$t(a,.15),t.fill(),t.strokeStyle=a,t.lineWidth=1,t.setLineDash([4,4]),t.stroke(),t.setLineDash([]);const n=i.reduce((t,e)=>t+e[0],0)/i.length,l=i.reduce((t,e)=>t+e[1],0)/i.length,[d,c]=s(n,l);t.fillStyle="#555",t.font="12px sans-serif",t.textAlign="center",t.fillText(e.name,d,c)}function $t(t,e){return`rgba(${parseInt(t.slice(1,3),16)},${parseInt(t.slice(3,5),16)},${parseInt(t.slice(5,7),16)},${e})`}function xt(t){if(document.querySelector(`link[href="${t}"]`))return;const e=document.createElement("link");e.rel="stylesheet",e.href=t,document.head.appendChild(e)}function At(t){return document.querySelector(`script[src="${t}"]`)?Promise.resolve():new Promise((e,s)=>{const i=document.createElement("script");i.src=t,i.onload=()=>e(),i.onerror=()=>s(new Error(`Failed to load ${t}`)),document.head.appendChild(i)})}let wt=class extends lt{constructor(){super(...arguments),this.data=null,this.categories={},this.viewMode="satellite",this._map=null,this._tileLayer=null,this._assetLayers=new Map,this._zoneLayers=new Map,this._boundaryLayer=null,this._drawControl=null,this._drawnItems=null,this._leafletReady=!1}createRenderRoot(){return this}async firstUpdated(t){super.firstUpdated(t),await this._loadLeaflet()}updated(t){super.updated(t),t.has("data")&&this._map&&this._renderData(),t.has("viewMode")&&this._map&&this._updateViewMode()}async _loadLeaflet(){try{xt("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"),xt("https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css"),await At("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"),await At("https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js"),this._leafletReady=!0,this._initMap()}catch(t){console.error("Failed to load Leaflet:",t)}}_initMap(){if("undefined"==typeof L)return void console.error("Leaflet not available after loading scripts.");const t=this._mapEl;if(!t)return;this._map=L.map(t,{center:[47.6062,-122.3321],zoom:18,zoomControl:!0}),this._tileLayer=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"&copy; OpenStreetMap contributors",maxZoom:22}),this._tileLayer.addTo(this._map),this._drawnItems=L.featureGroup().addTo(this._map),L.Control?.Draw&&(this._drawControl=new L.Control.Draw({edit:{featureGroup:this._drawnItems},draw:{polygon:!0,polyline:!0,marker:!0,circle:!1,rectangle:!1,circlemarker:!1}}),this._map.addControl(this._drawControl),this._map.on("draw:created",t=>{const e=t.layer;this._drawnItems.addLayer(e),this._handleDrawCreated(t.layerType,e)})),this._map.on("moveend",()=>this._renderSchematicOverlay()),this._map.on("zoomend",()=>this._renderSchematicOverlay()),this._renderData()}_handleDrawCreated(t,e){let s;if("marker"===t){const t=e.getLatLng();s={type:"Point",coordinates:[t.lat,t.lng]}}else if("polyline"===t){s={type:"LineString",coordinates:e.getLatLngs().map(t=>[t.lat,t.lng])}}else if("polygon"===t){s={type:"Polygon",coordinates:[e.getLatLngs()[0].map(t=>[t.lat,t.lng])]}}s&&this.dispatchEvent(new CustomEvent("asset-created",{detail:{geometry:s},bubbles:!0,composed:!0}))}_renderData(){if(!this._map||!this.data)return;this._assetLayers.forEach(t=>this._map.removeLayer(t)),this._zoneLayers.forEach(t=>this._map.removeLayer(t)),this._assetLayers.clear(),this._zoneLayers.clear(),this._boundaryLayer&&(this._map.removeLayer(this._boundaryLayer),this._boundaryLayer=null);const t=this.data.property.boundary;t.length>0&&(this._boundaryLayer=L.polygon(t,{color:"#333",weight:3,fillColor:"#333",fillOpacity:.05,dashArray:"10, 5"}).addTo(this._map),this._map.fitBounds(this._boundaryLayer.getBounds(),{padding:[20,20]}));for(const t of this.data.zones)this._renderZone(t);for(const t of this.data.assets)this._renderAsset(t);this._renderSchematicOverlay()}_renderAsset(t){if(!this._map)return;const e=mt[t.category]??"#9E9E9E";let s;switch(t.geometry.type){case"Point":{const i=t.geometry.coordinates;s=L.circleMarker(i,{radius:8,fillColor:e,fillOpacity:.8,color:"#fff",weight:2});break}case"LineString":{const i=t.geometry.coordinates;s=L.polyline(i,{color:e,weight:3,opacity:.8});break}case"Polygon":{const i=t.geometry.coordinates[0];s=L.polygon(i,{fillColor:e,fillOpacity:.3,color:e,weight:2});break}default:return}s.bindTooltip(t.name,{direction:"top",offset:[0,-10]}),s.on("click",()=>{this.dispatchEvent(new CustomEvent("asset-select",{detail:t,bubbles:!0,composed:!0}))}),s.addTo(this._map),this._assetLayers.set(t.id,s)}_renderZone(t){if(!this._map||"Polygon"!==t.geometry.type)return;const e=t.geometry.coordinates[0],s=t.color||mt[t.category]||"#9E9E9E",i=L.polygon(e,{fillColor:s,fillOpacity:.15,color:s,weight:1,dashArray:"4, 4"});i.bindTooltip(t.name,{direction:"center"}),i.addTo(this._map),this._zoneLayers.set(t.id,i)}_updateViewMode(){this._map&&("satellite"===this.viewMode?(this._tileLayer&&!this._map.hasLayer(this._tileLayer)&&this._tileLayer.addTo(this._map),this._assetLayers.forEach(t=>{this._map.hasLayer(t)||t.addTo(this._map)}),this._zoneLayers.forEach(t=>{this._map.hasLayer(t)||t.addTo(this._map)}),this._boundaryLayer&&!this._map.hasLayer(this._boundaryLayer)&&this._boundaryLayer.addTo(this._map),this._canvasEl&&(this._canvasEl.style.display="none")):(this._tileLayer&&this._map.hasLayer(this._tileLayer)&&this._map.removeLayer(this._tileLayer),this._assetLayers.forEach(t=>{this._map.hasLayer(t)&&this._map.removeLayer(t)}),this._zoneLayers.forEach(t=>{this._map.hasLayer(t)&&this._map.removeLayer(t)}),this._boundaryLayer&&this._map.hasLayer(this._boundaryLayer)&&this._map.removeLayer(this._boundaryLayer),this._canvasEl&&(this._canvasEl.style.display="block"),this._renderSchematicOverlay()))}_renderSchematicOverlay(){if("schematic"!==this.viewMode||!this._map||!this.data)return;const t=this._canvasEl;if(!t)return;const e=this._map.getSize();t.style.display="block";const s=this._map;!function(t,e){const{canvas:s,width:i,height:a,latLngToPixel:o}=e;s.width=i,s.height=a;const r=s.getContext("2d");if(!r)return;r.fillStyle="#f5f5f0",r.fillRect(0,0,i,a);const n=t.property.boundary;if(n.length>0){r.beginPath();const[t,e]=o(n[0][0],n[0][1]);r.moveTo(t,e);for(let t=1;t<n.length;t++){const[e,s]=o(n[t][0],n[t][1]);r.lineTo(e,s)}r.closePath(),r.strokeStyle="#333",r.lineWidth=3,r.setLineDash([10,5]),r.stroke(),r.setLineDash([]),r.fillStyle="rgba(200, 230, 200, 0.2)",r.fill()}for(const e of t.zones)bt(r,e,o);for(const e of t.assets)vt(r,e,o);!function(t,e,s){const i=100,a=e-i-20,o=s-30;t.fillStyle="#333",t.fillRect(a,o,i,4),t.fillRect(a,o-4,2,12),t.fillRect(a+i-2,o-4,2,12),t.font="11px sans-serif",t.textAlign="center",t.fillText("scale",a+i/2,o-8)}(r,i,a),function(t){const e=30,s=40,i=20;t.beginPath(),t.moveTo(e,s-i),t.lineTo(e-i/3,s+i/3),t.lineTo(e,s+i/6),t.lineTo(e+i/3,s+i/3),t.closePath(),t.fillStyle="#333",t.fill(),t.font="bold 12px sans-serif",t.textAlign="center",t.fillText("N",e,s-i-6)}(r)}(this.data,{canvas:t,width:e.x,height:e.y,latLngToPixel:(t,e)=>{const i=s.latLngToContainerPoint([t,e]);return[i.x,i.y]}})}disconnectedCallback(){super.disconnectedCallback(),this._map&&(this._map.remove(),this._map=null)}render(){return this._leafletReady?W`
      <style>
        #map {
          width: 100%;
          height: 100%;
          position: relative;
        }
        #schematic-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 400;
          display: none;
        }
      </style>
      <div id="map">
        <canvas id="schematic-canvas"></canvas>
      </div>
    `:W`
        <style>
          .map-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            color: #757575;
            font-size: 16px;
          }
        </style>
        <div class="map-loading">Loading map...</div>
      `}};t([ut({attribute:!1})],wt.prototype,"hass",void 0),t([ut({attribute:!1})],wt.prototype,"data",void 0),t([ut({attribute:!1})],wt.prototype,"categories",void 0),t([ut({type:String})],wt.prototype,"viewMode",void 0),t([gt("#map")],wt.prototype,"_mapEl",void 0),t([gt("#schematic-canvas")],wt.prototype,"_canvasEl",void 0),t([yt()],wt.prototype,"_leafletReady",void 0),wt=t([ct("pm-map-engine")],wt);let Et=class extends lt{constructor(){super(...arguments),this.categories={},this._editing=!1,this._editName="",this._editType="",this._editCategory="",this._editStatus=""}_close(){this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0}))}async _markChecked(){const t=(new Date).toISOString().split("T")[0];try{await this.hass.callApi("POST",`property_manager/assets/${this.asset.id}/maintenance`,{date:t,action:"Checked",notes:""}),this.dispatchEvent(new CustomEvent("asset-updated",{detail:{id:this.asset.id},bubbles:!0,composed:!0}))}catch(t){console.error("Failed to log maintenance:",t)}}_startEdit(){this._editing=!0,this._editName=this.asset.name,this._editType=this.asset.type,this._editCategory=this.asset.category,this._editStatus=this.asset.status}_cancelEdit(){this._editing=!1}async _saveEdit(){try{await this.hass.callApi("PUT",`property_manager/assets/${this.asset.id}`,{name:this._editName,type:this._editType,category:this._editCategory,status:this._editStatus}),this._editing=!1,this.dispatchEvent(new CustomEvent("asset-updated",{detail:{id:this.asset.id},bubbles:!0,composed:!0}))}catch(t){console.error("Failed to update asset:",t)}}async _deleteAsset(){if(confirm(`Delete "${this.asset.name}"?`))try{await this.hass.callApi("DELETE",`property_manager/assets/${this.asset.id}`),this.dispatchEvent(new CustomEvent("asset-deleted",{detail:{id:this.asset.id},bubbles:!0,composed:!0}))}catch(t){console.error("Failed to delete asset:",t)}}_getCategoryColor(){return mt[this.asset.category]??"#9E9E9E"}_getCategoryName(){return this.categories[this.asset.category]?.name??this.asset.category}_getEntityState(t){const e=this.hass?.states?.[t];return e?.state??"unavailable"}_renderEditForm(){const t=Object.keys(this.categories);return W`
      <div class="body edit-form">
        <label>Name</label>
        <input
          .value=${this._editName}
          @input=${t=>this._editName=t.target.value}
        />

        <label>Type</label>
        <input
          .value=${this._editType}
          @input=${t=>this._editType=t.target.value}
        />

        <label>Category</label>
        <select
          .value=${this._editCategory}
          @change=${t=>this._editCategory=t.target.value}
        >
          ${t.map(t=>W`<option value=${t} ?selected=${t===this._editCategory}>
                ${this.categories[t]?.name??t}
              </option>`)}
        </select>

        <label>Status</label>
        <select
          .value=${this._editStatus}
          @change=${t=>this._editStatus=t.target.value}
        >
          ${["active","inactive","needs_attention","overdue"].map(t=>W`<option value=${t} ?selected=${t===this._editStatus}>
                ${t.replace(/_/g," ")}
              </option>`)}
        </select>
      </div>

      <div class="actions">
        <button class="primary" @click=${this._saveEdit}>Save</button>
        <button @click=${this._cancelEdit}>Cancel</button>
      </div>
    `}render(){const t=this.asset;return W`
      <div class="header">
        <h2>${t.name}</h2>
        <button class="close-btn" @click=${this._close}>&times;</button>
      </div>

      ${this._editing?this._renderEditForm():W`
            <div class="body">
              <span
                class="category-badge"
                style="background: ${this._getCategoryColor()}"
              >
                ${this._getCategoryName()}
              </span>
              <span class="status-badge status-${t.status}">
                ${t.status.replace(/_/g," ")}
              </span>

              ${t.type?W`<div
                    style="margin-top: 8px; font-size: 14px; color: var(--pm-text-secondary)"
                  >
                    Type: ${t.type}
                  </div>`:V}

              <!-- Linked Entities -->
              ${t.linked_entities.length>0?W`
                    <div class="section">
                      <h3>Linked Entities</h3>
                      ${t.linked_entities.map(t=>W`
                          <div class="entity-link">
                            <span>${t}</span>
                            <span class="entity-state"
                              >${this._getEntityState(t)}</span
                            >
                          </div>
                        `)}
                    </div>
                  `:V}

              <!-- Metadata -->
              ${Object.keys(t.metadata).length>0?W`
                    <div class="section">
                      <h3>Details</h3>
                      <table class="metadata-table">
                        ${Object.entries(t.metadata).map(([t,e])=>W`
                            <tr>
                              <td>${t.replace(/_/g," ")}</td>
                              <td>${String(e)}</td>
                            </tr>
                          `)}
                      </table>
                    </div>
                  `:V}

              <!-- Schedules -->
              ${t.schedules.length>0?W`
                    <div class="section">
                      <h3>Maintenance Schedule</h3>
                      ${t.schedules.map(t=>W`
                          <div class="schedule-item">
                            <span>${t.action}</span>
                            <span class="schedule-due"
                              >${t.next_due?`Due: ${t.next_due}`:t.frequency}</span
                            >
                          </div>
                        `)}
                    </div>
                  `:V}

              <!-- Photos -->
              <div class="section">
                <h3>Photos (${t.photos.length})</h3>
                ${0===t.photos.length?W`<p
                      style="font-size: 14px; color: var(--pm-text-secondary)"
                    >
                      No photos yet.
                    </p>`:V}
              </div>

              <!-- Maintenance Log -->
              ${t.maintenance_log.length>0?W`
                    <div class="section">
                      <h3>Maintenance Log</h3>
                      ${t.maintenance_log.map(t=>W`
                          <div style="font-size: 13px; padding: 4px 0">
                            <strong>${t.date}</strong> — ${t.action}
                            ${t.notes?W`<br /><em>${t.notes}</em>`:V}
                          </div>
                        `)}
                    </div>
                  `:V}
            </div>

            <div class="actions">
              <button class="primary" @click=${this._markChecked}>
                Mark Checked
              </button>
              <button @click=${this._startEdit}>Edit</button>
              <button class="danger" @click=${this._deleteAsset}>Delete</button>
            </div>
          `}
    `}};Et.styles=[ft,r`
      :host {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 360px;
        max-width: 100vw;
        background: var(--pm-surface);
        box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-bottom: 1px solid var(--pm-divider);
      }

      .header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: var(--pm-text-secondary);
        padding: 4px 8px;
      }

      .body {
        padding: 16px;
        flex: 1;
      }

      .category-badge {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 12px;
        color: white;
        margin-bottom: 12px;
      }

      .status-badge {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 12px;
        margin-left: 8px;
      }

      .status-active {
        background: #c8e6c9;
        color: #2e7d32;
      }

      .status-inactive {
        background: #e0e0e0;
        color: #616161;
      }

      .status-needs_attention {
        background: #fff9c4;
        color: #f57f17;
      }

      .status-overdue {
        background: #ffcdd2;
        color: #c62828;
      }

      .section {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--pm-divider);
      }

      .section h3 {
        font-size: 14px;
        font-weight: 500;
        color: var(--pm-text-secondary);
        margin: 0 0 8px;
      }

      .entity-link {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        background: var(--pm-bg);
        border-radius: 4px;
        margin-bottom: 4px;
        font-size: 14px;
      }

      .entity-state {
        margin-left: auto;
        font-weight: 500;
      }

      .schedule-item {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        font-size: 14px;
      }

      .schedule-due {
        color: var(--pm-text-secondary);
        font-size: 12px;
      }

      .metadata-table {
        width: 100%;
        font-size: 13px;
      }

      .metadata-table td {
        padding: 4px 0;
      }

      .metadata-table td:first-child {
        color: var(--pm-text-secondary);
        width: 40%;
      }

      .actions {
        display: flex;
        gap: 8px;
        padding: 16px;
        border-top: 1px solid var(--pm-divider);
      }

      .actions button {
        flex: 1;
        padding: 8px;
        border: 1px solid var(--pm-divider);
        border-radius: 4px;
        background: var(--pm-surface);
        cursor: pointer;
        font-size: 13px;
      }

      .actions button.danger {
        color: #c62828;
        border-color: #ef9a9a;
      }

      .actions button.primary {
        background: var(--pm-primary);
        color: white;
        border-color: var(--pm-primary);
      }

      .edit-form label {
        display: block;
        font-size: 12px;
        color: var(--pm-text-secondary);
        margin: 8px 0 4px;
      }

      .edit-form input,
      .edit-form select {
        width: 100%;
        padding: 6px 8px;
        border: 1px solid var(--pm-divider);
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;
      }
    `],t([ut({attribute:!1})],Et.prototype,"hass",void 0),t([ut({attribute:!1})],Et.prototype,"asset",void 0),t([ut({attribute:!1})],Et.prototype,"categories",void 0),t([yt()],Et.prototype,"_editing",void 0),t([yt()],Et.prototype,"_editName",void 0),t([yt()],Et.prototype,"_editType",void 0),t([yt()],Et.prototype,"_editCategory",void 0),t([yt()],Et.prototype,"_editStatus",void 0),Et=t([ct("pm-asset-detail")],Et);let St=class extends lt{constructor(){super(...arguments),this._config={type:"custom:property-manager-card"},this._data=null}setConfig(t){this._config=t}async connectedCallback(){super.connectedCallback(),await this._loadData()}async _loadData(){try{this._data=await this.hass.callApi("GET","property_manager/data")}catch{}}_getAttentionAssets(){return this._data?this._data.assets.filter(t=>"needs_attention"===t.status||"overdue"===t.status):[]}_openMap(){window.location.href="/property-manager"}render(){const t=this._config.title??"Property Manager",e=this._data?.assets.length??0,s=this._data?.zones.length??0,i=this._getAttentionAssets();return W`
      <ha-card>
        <div class="header">
          <h2>${t}</h2>
        </div>

        ${i.length>0?W`
              <div class="stat attention">
                <span class="icon">&#9888;</span>
                <span>${i.length} item(s) need attention</span>
              </div>
            `:W`
              <div class="stat">
                <span class="icon">&#10003;</span>
                <span>All clear — no items need attention</span>
              </div>
            `}

        <div class="footer">
          <span>${e} assets &middot; ${s} zones</span>
          <a class="open-link" @click=${this._openMap}>Open Map &rarr;</a>
        </div>
      </ha-card>
    `}static getStubConfig(){return{type:"custom:property-manager-card"}}getCardSize(){return 3}};St.styles=r`
    :host {
      display: block;
    }

    ha-card {
      padding: 16px;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .header h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-size: 14px;
    }

    .stat .icon {
      font-size: 18px;
    }

    .attention {
      color: #f57f17;
    }

    .footer {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--divider-color, #e0e0e0);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: var(--secondary-text-color, #757575);
    }

    .open-link {
      color: var(--primary-color, #03a9f4);
      text-decoration: none;
      font-weight: 500;
      cursor: pointer;
    }
  `,t([ut({attribute:!1})],St.prototype,"hass",void 0),t([yt()],St.prototype,"_config",void 0),t([yt()],St.prototype,"_data",void 0),St=t([ct("property-manager-card")],St),window.customCards=window.customCards||[],window.customCards.push({type:"property-manager-card",name:"Property Manager",description:"Summary card for Property Manager — shows assets and attention items."});let Ct=class extends lt{constructor(){super(...arguments),this.narrow=!1,this._data=null,this._categories={},this._selectedAsset=null,this._loading=!0,this._viewMode="satellite"}async firstUpdated(t){super.firstUpdated(t),await this._loadData()}async _loadData(){try{this._loading=!0;const[t,e]=await Promise.all([this.hass.callApi("GET","property_manager/data"),this.hass.callApi("GET","property_manager/categories")]);this._data=t,this._categories=e}catch(t){console.error("Failed to load property data:",t)}finally{this._loading=!1}}_handleAssetSelect(t){this._selectedAsset=t.detail}_handleCloseDetail(){this._selectedAsset=null}_handleViewToggle(t){this._viewMode=t}async _handleAssetCreated(t){await this._loadData()}async _handleAssetUpdated(t){await this._loadData(),this._selectedAsset&&this._data&&(this._selectedAsset=this._data.assets.find(t=>t.id===this._selectedAsset.id)??null)}async _handleAssetDeleted(t){this._selectedAsset=null,await this._loadData()}render(){if(this._loading)return W`<div class="panel-container">
        <div class="loading">Loading Property Manager...</div>
      </div>`;const t=this._data?.assets.length??0,e=this._data?.zones.length??0;return W`
      <div class="panel-container">
        <div class="toolbar">
          <h1>Property Manager</h1>
          <span class="asset-count"
            >${t} assets · ${e} zones</span
          >
          <div class="view-toggle">
            <button
              class=${"satellite"===this._viewMode?"active":""}
              @click=${()=>this._handleViewToggle("satellite")}
            >
              Satellite
            </button>
            <button
              class=${"schematic"===this._viewMode?"active":""}
              @click=${()=>this._handleViewToggle("schematic")}
            >
              Schematic
            </button>
          </div>
        </div>
        <div class="map-container">
          <pm-map-engine
            .hass=${this.hass}
            .data=${this._data}
            .categories=${this._categories}
            .viewMode=${this._viewMode}
            @asset-select=${this._handleAssetSelect}
            @asset-created=${this._handleAssetCreated}
          ></pm-map-engine>
          ${this._selectedAsset?W`<pm-asset-detail
                .hass=${this.hass}
                .asset=${this._selectedAsset}
                .categories=${this._categories}
                @close=${this._handleCloseDetail}
                @asset-updated=${this._handleAssetUpdated}
                @asset-deleted=${this._handleAssetDeleted}
              ></pm-asset-detail>`:null}
        </div>
      </div>
    `}};Ct.styles=[ft,r`
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        font-size: 18px;
        color: var(--pm-text-secondary);
      }

      .view-toggle {
        display: flex;
        border: 1px solid var(--pm-divider);
        border-radius: 4px;
        overflow: hidden;
      }

      .view-toggle button {
        padding: 6px 12px;
        border: none;
        background: var(--pm-surface);
        color: var(--pm-text);
        cursor: pointer;
        font-size: 13px;
      }

      .view-toggle button.active {
        background: var(--pm-primary);
        color: white;
      }

      .asset-count {
        font-size: 13px;
        color: var(--pm-text-secondary);
        padding: 0 8px;
      }
    `],t([ut({attribute:!1})],Ct.prototype,"hass",void 0),t([ut({type:Boolean})],Ct.prototype,"narrow",void 0),t([yt()],Ct.prototype,"_data",void 0),t([yt()],Ct.prototype,"_categories",void 0),t([yt()],Ct.prototype,"_selectedAsset",void 0),t([yt()],Ct.prototype,"_loading",void 0),t([yt()],Ct.prototype,"_viewMode",void 0),Ct=t([ct("property-manager-panel")],Ct);export{Ct as PropertyManagerPanel};
