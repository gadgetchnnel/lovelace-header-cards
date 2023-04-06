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
  			root = root && root.querySelector("ha-drawer partial-panel-resolver");
  			root = root && root.shadowRoot || root;
  			root = root && root.querySelector("ha-panel-lovelace");
  		return root;
    }
    
    get header() {
		let header = this.panel;
	 		header = header && header.shadowRoot;
	 		header = header && header.querySelector("hui-root");
	 		header = header && header.shadowRoot;
	 		header = header && header.querySelector("div.header");
	 		
	 		return header;
	}
	
	get toolbar() {
		toolbar = this.header && this.header.querySelector("div.toolbar");
		return toolbar;
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
		card.classList.add("header-card");
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
		badge.classList.add("header-badge");
		badge.hass = this.hass;
		badge.style.setProperty("--ha-label-badge-size", "2em");
		badge.style.setProperty("--ha-label-badge-title-font-size", "0.6em");
		badge.style.setProperty("--ha-label-badge-font-size", "0.9em");
		element.appendChild(badge);
		return badge;
	}
	
	applyHass(){
		if(this.hass && this.toolbar){
			let items = this.toolbar.querySelectorAll("#headerCards div .header-card,.header-badge");
			
			if(items){
				items.forEach(item => {
						item.hass = this.hass;
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
    		let mainTitle = this.toolbar && this.toolbar.querySelector("div[main-title]");
    		let button = this.toolbar && this.toolbar.querySelector("div.action-items");
    		
    		let oldHeaderCards = this.toolbar.querySelector("#headerCards");
    		if(oldHeaderCards) oldHeaderCards.remove();	
    		
    		let justify_content = headerCardsConfig.justify_content || "right";
    		
    		if(cards.length > 0 || badges.length > 0){
    			let outerDiv =  document.createElement("div");
    			outerDiv.id = "headerCards";
    			outerDiv.style.display = "flex";
    			outerDiv.style.visibility = "hidden";
    			outerDiv.style["-ms-flex-direction"] = "row";
    			outerDiv.style["-webkit-flex-direction"] = "row";
    			outerDiv.style["flex-direction"] = "row";
    			
    			outerDiv.style["-ms-flex-align"] = "center";
    			outerDiv.style["-webkit-align-items"] = "center";
    			outerDiv.style["align-items"] = "center";
    			
    			outerDiv.style["justify-content"] = justify_content;
    			
    			outerDiv.style["flex"] = "1";
    			
    			if(badges.length > 0){
    				let div = document.createElement("div");
    				div.style.width = "auto";
    				div.style.minWidth = "max-content";
    				badges.forEach(badgeConfig => {
    					this.addBadge(badgeConfig, div);	
    				});
    				outerDiv.appendChild(div);	
    			}
    			
				if(cards.length > 0){
					//let div = document.createElement("div");
					//div.style.width = "auto";
    				//div.style.minWidth = "max-content";
    				cards.forEach(cardConfig => {
    					let div = document.createElement("div");
						div.style.width = "auto";
    					div.style.minWidth = "max-content";
    					this.addCardWhenDefined(cardConfig, div);
    					outerDiv.appendChild(div);
    				});
    				//outerDiv.appendChild(div);
    			}
    			
    			if(button) {
    					this.toolbar.insertBefore(outerDiv, button);
    			}
    			else{
    				this.toolbar.appendChild(outerDiv);
    			}  
    			
    			if(tabs || mainTitle){
    				if(replaceTabs){
    					(tabs || mainTitle).style.display = "none";
    		   			outerDiv.style.visibility = "visible";
    		   		}
    		   		else{
    		   			setTimeout(function(){
    		   				if(tabs){
    		   					let tabsContent = tabs.shadowRoot && tabs.shadowRoot.querySelector("#tabsContent");
    		   			    		tabsContent.style.setProperty('width', 'auto', 'important');
    		   						let width = tabsContent.offsetWidth;
    		   						console.log("Tabs Width", width);
    		   						tabs.style.width = `${width}px`;
    		   						tabs.style.paddingRight = "10px";
    		   						outerDiv.style.visibility = "visible";
    		   				}
    		   				else{
    		   					mainTitle.style.flex = "0";
    		   					mainTitle.style.paddingRight = "10px";
    		   					mainTitle.style.width = "auto";
    							mainTitle.style.minWidth = "max-content";
    		   					outerDiv.style.display = "flex";
    		   					outerDiv.style.visibility = "visible";
    		   				}
    		   			}, 200);
    		   		}
    			}
    			else{
    				outerDiv.style.visibility = "visible";
    			}
    		}
    	});
	}
}

// Initial Run
Promise.resolve(customElements.whenDefined("hui-view")).then(() => {
  window.HeaderCards = new HeaderCards();
});