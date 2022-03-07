import { dashboardObserver, toolbarObserver, panelObserver } from './observers.js';
import { getLovelace } from './helpers.js';

const CUSTOM_TYPE_PREFIX = "custom:";

class HeaderCards {
	constructor(){
		this.addCardsToHeader(getLovelace(this.panel));
		this.entityWatch();
		
    	dashboardObserver(this.main, (node) => {
    		window.HeaderCards.addCardsToHeader(getLovelace(node));
    		
    		if(this.toolbar && !this.toolbarObserver){
    			this.setupToolbarObserver();
    		}
    		
    		if(this.panel && !this.panelObserver){
    			this.setupPanelObserver();
    		}
    	});
    	
    	if(this.header){
    		this.setupToolbarObserver();
    	}
    	
    	if(this.panel){
    		this.setupPanelObserver();
    	}
 	}
 	
 	setupToolbarObserver(){
 		this.toolbarObserver = toolbarObserver(this.header, () => {
    		window.HeaderCards.addCardsToHeader(getLovelace(this.panel));
    	});
 	}
 	
 	setupPanelObserver(){
 		this.panelObserver = panelObserver(this.panel, () => { this.setupToolbarObserver(); });
 	}
 	
 	get main(){
    	let main = document.querySelector("home-assistant");
			main = main && main.shadowRoot;
			main = main && main.querySelector("home-assistant-main");
			
		return main;
    }
    
    get panel(){
    	let root = this.main && this.main.shadowRoot;
  			root = root && root.querySelector("app-drawer-layout partial-panel-resolver");
  			root = root && root.shadowRoot || root;
  			root = root && root.querySelector("ha-panel-lovelace");
  		return root;
    }
    
    get header() {
		let header = this.main && this.main.shadowRoot;
	 		header = header && header.querySelector("ha-panel-lovelace");
	 		header = header && header.shadowRoot;
	 		header = header && header.querySelector("hui-root");
	 		header = header && header.shadowRoot;
	 		header = header && header.querySelector("app-header");
	 		
	 		return header;
	}
	
	get toolbar() {
		return this.header && this.header.querySelector("app-toolbar");
	}
	
    get hass(){
    	return this.main && this.main.hass;
    }
    
    insertAfter(newNode, existingNode) {
    	existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
	}
	
    // Run on entity change.
  	async entityWatch() {
    	(await window.hassConnection).conn.subscribeMessage((e) => this.entityWatchCallback(e), {
      	type: "subscribe_events",
      	event_type: "state_changed",
    	});
  	}

  	entityWatchCallback(event) {
    	if (event.event_type == "state_changed")
    	{ 
    		let old_state = event.data.old_state && event.data.old_state.state;
    		let new_state = event.data.new_state && event.data.new_state.state;
        	if(new_state != old_state)
        	{
      			this.applyHass();
      		}
    	}
  	}
  
	addCard(cardConfig, element) {
		let tag = cardConfig.type;
		let card = this.createCardElement(cardConfig);
			card.style.display = "inline-block";
			card.hass = this.hass;
			element.appendChild(card);
	}
	
	addCardWhenDefined(cardConfig, element) {
		let tag = cardConfig.type;
		if(tag.startsWith(CUSTOM_TYPE_PREFIX)){
    		tag = tag.substr(CUSTOM_TYPE_PREFIX.length);
    		customElements.whenDefined(tag).then(() => {
				this.addCard(cardConfig, element);
			});
    	}
  		else{
    		this.addCard(cardConfig, element);
    	}
	}
	
	addBadge(badgeConfig, element) {
		let badge = this.createBadgeElement(badgeConfig);
		badge.hass = this.hass;
		badge.style.setProperty("--ha-label-badge-size", "2em");
		badge.style.setProperty("--ha-label-badge-title-font-size", "0.6em");
		badge.style.setProperty("--ha-label-badge-font-size", "0.9em");
		element.appendChild(badge);
		return badge;
	}
	
	applyHass(){
		if(this.hass && this.toolbar){
			let cards = this.toolbar.querySelector("#headerCards");
			let badges = this.toolbar.querySelector("#headerBadges");
			if(cards){
					let children = [...cards.children];
					children.forEach((card) => {
					card.hass = this.hass;
				});
			}
			
			if(badges){
					let children = [...badges.children];
					children.forEach((badge) => {
					badge.hass = this.hass;
				});
			}
		}
	}
	
	addCardsToHeader(lovelace){
		window.loadCardHelpers().then(({ createCardElement, createBadgeElement }) => {
    		this.createCardElement = createCardElement;
    		this.createBadgeElement = createBadgeElement;
    		let config = lovelace && lovelace.config;
    		    config = lovelace.config || {};
    		
    		let headerCardsConfig = config.header_cards || {};
    		
    		let cards = headerCardsConfig.cards || [];
    		let badges = headerCardsConfig.badges || [];
    		
    		let replaceTabs = (headerCardsConfig && headerCardsConfig.replace_tabs) || false;
    		
    		let tabs = this.toolbar && this.toolbar.querySelector("ha-tabs");
    		let button = this.toolbar && this.toolbar.querySelector("ha-icon-button, ha-button-menu");
    		
    		let oldCards = this.toolbar.querySelector("#headerCards");
    		if(oldCards) oldCards.remove();	
    		
    		let oldBadges = this.toolbar.querySelector("#headerBadges");
    		if(oldBadges) oldBadges.remove();
    		
    		if(cards.length > 0 || badges.length > 0){
    			let outerDiv =  document.createElement("div");
    			outerDiv.style.display = "flex";
    			outerDiv.style["-ms-flex-direction"] = "row";
    			outerDiv.style["-webkit-flex-direction"] = "row";
    			outerDiv.style["flex-direction"] = "row";
    			outerDiv.style["-ms-flex-align"] = "center";
    			outerDiv.style["-webkit-align-items"] = "center";
    			outerDiv.style["align-items"] = "center";
    			
    			if(badges.length > 0){
    				let div = document.createElement("div");
    				div.id = "headerBadges";
    				div.style.width = "auto";
    				div.style.minWidth = "max-content";
    				badges.forEach(badgeConfig => {
    					this.addBadge(badgeConfig, div);	
    				});
    				
    				outerDiv.appendChild(div); 			
    			}
    			
				if(cards.length > 0){
    				let div = document.createElement("div");
    				div.id = "headerCards";
    				div.style.width = "auto";
    				div.style.minWidth = "max-content";
    				div.style.fontFamily = "var(--paper-font-body1_-_font-family)"
    				div.style["-webkit-font-smoothing"] = "var(--paper-font-body1_-_-webkit-font-smoothing)";
    				div.style.fontSize = "var(--paper-font-body1_-_font-size)";
    				div.style.fontWeight =  "var(--paper-font-body1_-_font-weight)";
    				div.style.lineHeight = "var(--paper-font-body1_-_line-height)";
    				
    				cards.forEach(cardConfig => {
    					this.addCardWhenDefined(cardConfig, div);	
    				});
    				
    				outerDiv.appendChild(div);
    			}
    			
    			if(button) {
    					this.toolbar.insertBefore(outerDiv, button);
    			}
    			else{
    				this.toolbar.appendChild(outerDiv);
    			}  
    			
    			if(tabs && replaceTabs){
    		   		tabs.style.display = "none";
    		   	}
    		}
    	});
	}
}

// Initial Run
Promise.resolve(customElements.whenDefined("hui-view")).then(() => {
  window.HeaderCards = new HeaderCards();
});