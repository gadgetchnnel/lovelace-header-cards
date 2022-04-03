import { dashboardObserver, toolbarObserver, panelObserver } from './observers.js';
import { getLovelace } from './helpers.js';
import tippy from 'tippy.js';
import tippyStyle from 'tippy.js/dist/tippy.css';
import tippyAnimationStyle from 'tippy.js/animations/scale-extreme.css';
import tippyThemeStyle from './tippy-theme.css';

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
 	
 	tippyStyles() {
    	let styles = `
    		${tippyStyle}
    		${tippyAnimationStyle}
    		${tippyThemeStyle}
    	`;
    	return styles;
  	}
 	
 	addCardsHandler(){
 		let lovelace = this.panel && getLovelace(this.panel);
 		if(lovelace){
    		window.HeaderCards.addCardsToHeader(lovelace);
    	}
    	else{
    		setTimeout(this.addCardsHandler, 100);
    	}
 	}
 	
 	setupToolbarObserver(){
 		this.toolbarObserver = toolbarObserver(this.header, this.addCardsHandler.bind(this));
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
		card.classList.add("header-card");
		card.style.display = "inline-block";
		card.hass = this.hass;
		card.style["flex"] = "1";
		let tooltipCardConfig = cardConfig.header_card_options && 
		    cardConfig.header_card_options.tooltip_card;
		
		let div = document.createElement("div");
			div.style.display = "inline-block";
			div.style.width = "auto";
    		div.style.minWidth = "max-content";
    		div.style["flex-shrink"] = "1";
    		div.style.cursor = "pointer";
    		div.style.padding = "0px";
    	
		if(tooltipCardConfig){
			let tooltipCard = this.createCardElement(tooltipCardConfig);
			tooltipCard.classList.add("header-tooltip-card");
			tooltipCard.style.setProperty("width","2000px", "important");
			tooltipCard.hass = this.hass;
			let that = this;
			tippy(div, {
  					content: tooltipCard,
	 				arrow: true,
  					animation: 'scale-extreme',
  					placement: 'auto',
  					theme: 'homeassistant',
  					appendTo: div,
  					trigger: 'click',
  					hideOnClick: true,
  					maxWidth: 'none',
  					onShown(instance) {
  						let thisCard = instance.reference.querySelector(".header-tooltip-card");
  						if(thisCard) thisCard.hass = that.hass;
  						let haCard = thisCard && thisCard.shadowRoot;
 			        		haCard = haCard && haCard.querySelector("ha-card");
 						if(haCard) haCard.style.setProperty("box-shadow", "none", "important");	
    				},
    				popperOptions: {
    					modifiers: [
      						{
        						name: 'flip',
        						options: {
          							fallbackPlacements: ['bottom', 'right'],
        						},
      						},
      						{
        						name: 'preventOverflow',
        						options: {
          							altAxis: true,
          							tether: false,
        						},
      						},
    					],
  					},
  					allowHTML: true
				});
				
    			div.appendChild(card);
				element.appendChild(div);
				element.style["pointer-events"] = "auto";
				div.style["pointer-events"] = "auto";
				card.style["pointer-events"] = "none";
		}
		else{    
			element.appendChild(card);
		}
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
			let items = this.toolbar.querySelectorAll("#headerCards div .header-card,.header-tooltip-card,.header-badge");
			
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
    		let button = this.toolbar && this.toolbar.querySelector("ha-icon-button, ha-button-menu");
    		
    		let oldHeaderCards = this.toolbar.querySelector("#headerCards");
    		if(oldHeaderCards) oldHeaderCards.remove();	
    		
    		let justify_content = headerCardsConfig.justify_content || "right";
    		
    		if(cards.length > 0 || badges.length > 0){
    			let outerDiv =  document.createElement("div");
    			//console.log("Styles", this.tippyStyles());
    			
    			let style = document.createElement("style");
    			style.appendChild(document.createTextNode(this.tippyStyles()));
    			outerDiv.appendChild(style);
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
    			
    			outerDiv.style["flex"] = "1 1 90%";
    			
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
					let divs = [];
					let div = null;
    				cards.forEach(cardConfig => {
    					let groupWithPrevious = cardConfig.header_card_options && 
		    				cardConfig.header_card_options.group_with_previous === true;
		    			
		    			if(!groupWithPrevious){
		    				div = document.createElement("div");
		    				div.style.width = "auto";
    						div.style.minWidth = "max-content";
    						div.style["flex-shrink"] = "1";
		    				divs.push(div);
		    			}
    					
    					this.addCardWhenDefined(cardConfig, div);
    					//outerDiv.appendChild(div);
    				});
    				
    				divs.forEach(thisDiv => {
    					outerDiv.appendChild(thisDiv);
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
    		   						tabs.style.width = "auto";
    		   						tabs.style.minWidth = `${width}px`;
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