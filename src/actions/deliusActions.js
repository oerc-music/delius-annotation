import ReactDOM from 'react-dom';

export function decorateNotes(component) {  
	// horrible hack -- 
	// we have to dive into the browser DOM to get at the score SVG.
	// When componetDidMount is called, all the react components have
	// rendered (i.e. we have the <Score>-div's)...
	// ...but the non-react components aren't done yet.
	// Since React doesn't know about our poor notes directly,
	// we have to wait a second for them to appear in the browser DOM.
	const element = ReactDOM.findDOMNode(component);
	return (dispatch) => { 
		setTimeout(() => {	
			let notes = element.querySelectorAll(".note");
			Array.prototype.map.call(notes, function(n) { 
				n.onclick = function(e) { 
					dispatch({ 
						type: "ELEMENT_CLICKED", 
						payload: n.getAttribute("id")
					})
			 	}
			});
			return { type: "NOTES_DECORATED" }
		}, 1000)
	}
}
