export function getLovelace(root){
    	root = root && root.shadowRoot;
  		root = root && root.querySelector("hui-root");
  		if (root) {
    		var ll =  root.lovelace
    		ll.current_view = root.___curView;
    		return ll;
  		}
    }