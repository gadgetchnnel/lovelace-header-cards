!function(e){var t={};function a(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,a),o.l=!0,o.exports}a.m=e,a.c=t,a.d=function(e,t,r){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(a.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)a.d(r,o,function(t){return e[t]}.bind(null,o));return r},a.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="",a(a.s=0)}([function(e,t,a){"use strict";function r(e){if(e=(e=e&&e.shadowRoot)&&e.querySelector("hui-root")){var t=e.lovelace;return t.current_view=e.___curView,t}}a.r(t);class o{constructor(){var e,t;this.addCardsToHeader(r(this.panel)),this.entityWatch(),e=this.main,t=e=>{window.HeaderCards.addCardsToHeader(r(e))},new MutationObserver((function(e){e.forEach(({addedNodes:e})=>{for(let a of e)"ha-panel-lovelace"==a.localName&&setTimeout(()=>{t(a)},100)})})).observe(e.shadowRoot.querySelector("partial-panel-resolver"),{childList:!0}),this.setupToolbarObserver(),function(e,t){new MutationObserver((function(e){e.forEach(({addedNodes:e})=>{for(let a of e)"hui-root"==a.localName&&setTimeout(()=>{t()},100)})})).observe(e.shadowRoot,{childList:!0})}(this.panel,()=>{this.setupToolbarObserver()})}setupToolbarObserver(){var e,t;e=this.header,t=()=>{window.HeaderCards.addCardsToHeader(r(this.panel))},new MutationObserver((function(e){e.forEach(({addedNodes:e})=>{for(let a of e)"app-toolbar"==a.localName&&"edit-mode"!=a.className&&setTimeout(()=>{t()},100)})})).observe(e,{childList:!0})}get main(){let e=document.querySelector("home-assistant");return e=e&&e.shadowRoot,e=e&&e.querySelector("home-assistant-main"),e}get panel(){let e=this.main&&this.main.shadowRoot;return e=e&&e.querySelector("app-drawer-layout partial-panel-resolver"),e=e&&e.shadowRoot||e,e=e&&e.querySelector("ha-panel-lovelace"),e}get header(){let e=this.main&&this.main.shadowRoot;return e=e&&e.querySelector("ha-panel-lovelace"),e=e&&e.shadowRoot,e=e&&e.querySelector("hui-root"),e=e&&e.shadowRoot,e=e&&e.querySelector("app-header"),e}get toolbar(){return this.header&&this.header.querySelector("app-toolbar")}get hass(){return this.main&&this.main.hass}insertAfter(e,t){t.parentNode.insertBefore(e,t.nextSibling)}async entityWatch(){(await window.hassConnection).conn.subscribeMessage(e=>this.entityWatchCallback(e),{type:"subscribe_events",event_type:"state_changed"})}entityWatchCallback(e){"state_changed"!=e.event_type||e.data.old_state&&e.data.new_state.state==e.data.old_state.state||this.applyHass()}addCard(e,t){e.type;let a=this.createCardElement(e);a.style.display="inline-block",a.hass=this.hass,t.appendChild(a)}addCardWhenDefined(e,t){let a=e.type;a.startsWith("custom:")?(a=a.substr("custom:".length),customElements.whenDefined(a).then(()=>{this.addCard(e,t)})):this.addCard(e,t)}addBadge(e,t){let a=this.createBadgeElement(e);return a.hass=this.hass,a.style.setProperty("--ha-label-badge-size","2em"),a.style.setProperty("--ha-label-badge-title-font-size","0.6em"),a.style.setProperty("--ha-label-badge-font-size","0.9em"),t.appendChild(a),a}applyHass(){if(this.hass&&this.toolbar){let e=this.toolbar.querySelector("#headerCards"),t=this.toolbar.querySelector("#headerBadges");if(e){[...e.children].forEach(e=>{e.hass=this.hass})}if(t){[...t.children].forEach(e=>{e.hass=this.hass})}}}addCardsToHeader(e){window.loadCardHelpers().then(({createCardElement:t,createBadgeElement:a})=>{this.createCardElement=t,this.createBadgeElement=a;let r=e&&e.config;r=e.config||{};let o=r.header_cards||{},s=o.cards||[],n=this.toolbar&&this.toolbar.querySelector("ha-tabs"),i=this.toolbar.querySelector("#headerCards");i&&i.remove();let d=this.toolbar.querySelector("#headerBadges");if(d&&d.remove(),s&&s.length){let e=document.createElement("div");e.id="headerCards",e.style.width="auto",e.style.minWidth="max-content",e.style.fontFamily="var(--paper-font-body1_-_font-family)",e.style["-webkit-font-smoothing"]="var(--paper-font-body1_-_-webkit-font-smoothing)",e.style.fontSize="var(--paper-font-body1_-_font-size)",e.style.fontWeight="var(--paper-font-body1_-_font-weight)",e.style.lineHeight="var(--paper-font-body1_-_line-height)",s.forEach(t=>{this.addCardWhenDefined(t,e)}),this.insertAfter(e,n)}let l=o.badges||[];if(l&&l.length){let e=document.createElement("div");e.id="headerBadges",e.style.width="auto",e.style.minWidth="max-content",l.forEach(t=>{this.addBadge(t,e)}),this.insertAfter(e,n)}})}}Promise.resolve(customElements.whenDefined("hui-view")).then(()=>{window.HeaderCards=new o})}]);