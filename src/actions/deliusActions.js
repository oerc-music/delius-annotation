import ReactDOM from 'react-dom';

export function attachClickHandlerToNotes(scoreComponent) {  
	// horrible hack -- 
	// we have to dive into the browser DOM to get at the score SVG.
	// When componetDidMount is called, all the react scoreComponents have
	// rendered (i.e. we have the <Score>-div's)...
	// ...but the non-react scoreComponents aren't done yet.
	// Since React doesn't know about our poor notes directly,
	// we have to wait a second for them to appear in the browser DOM.
	const scoreElement = ReactDOM.findDOMNode(scoreComponent);
	return (dispatch) => { 
		setTimeout(() => {	
			const notes = scoreElement.querySelectorAll(".note");
			Array.prototype.map.call(notes, function(n) { 
				n.onclick = function(e) { 
					dispatch({ 
						type: "ELEMENT_CLICKED", 
						payload: {elementType: "note", elementId: n.getAttribute("id")}
					});
			 	};
			});
		}, 3000)
	}
};

export function attachClickHandlerToAnnotationGlyphs(scoreComponent) { 
	return (dispatch) => { 
		const scoreElement = ReactDOM.findDOMNode(scoreComponent);
		const annotationGlyphs = scoreElement.querySelectorAll(".annotation");
		Array.prototype.map.call(annotationGlyphs, function(g) { 
			g.onclick = function(e) { 
				dispatch({ 
					type: "ELEMENT_CLICKED", 
					payload: {elementType: "annotationGlyph", elementId: g.getAttribute("id")}
				});
			};
		});
		return { type: "CLICK_HANDLERS_ATTACHED" }
	}
}

export function decorateNotes(scoreComponent, selectedElements) {
	// (relating to horrible timeout hack above...)
	// this one is called from componentDidUpdate 
	// by this time, the notes have already been rendered
	// so no need for horrible hack here.
	const scoreElement = ReactDOM.findDOMNode(scoreComponent);
	const notes = scoreElement.querySelectorAll(".note");
	Array.prototype.map.call(notes, function(n) { 
		// mark any notes that are selected in the modal UI
		// remove any left-over demarkations of now-deselected notes
		if(selectedElements.includes(n.getAttribute("id"))) {
			n.classList.add("active");
		} else { 
			n.classList.remove("active");
		}
	});
	return {type: "NOTES_DECORATED"};
}
