export function dashboardObserver(main, callback){
	return new MutationObserver(function(mutations) {
    	mutations.forEach(({ addedNodes }) => {
      		for (let node of addedNodes) {
      			if (node.localName == "ha-panel-lovelace") {
      				setTimeout(() => {
      					callback(node);
      				}, 100);				
      			}
      		}
    	});
  	}).observe(main.shadowRoot.querySelector("partial-panel-resolver"), {
      		childList: true,
    	});
}

export function toolbarObserver(header, callback){
 	return new MutationObserver(function(mutations) {
    	mutations.forEach(({ addedNodes }) => {
      		for (let node of addedNodes) {
      			if(node.localName == "app-toolbar" && node.className != "edit-mode"){
      				setTimeout(() => {
      					callback();
      				}, 100);
      			}
      		}
    	});
  	}).observe(header, {
      		childList: true,
    	});
 }
 
 export function panelObserver(panel, callback){
 	return new MutationObserver(function(mutations) {
    	mutations.forEach(({ addedNodes }) => {
      		for (let node of addedNodes) {
      			if(node.localName == "hui-root"){
      				setTimeout(() => {
      					callback();
      				}, 100);
      			}
      		}
    	});
  	}).observe(panel.shadowRoot, {
      		childList: true,
    	});
 }