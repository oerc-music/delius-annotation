import ReactDOM from 'react-dom';
import { boxesForMeasures } from 'meld-clients-core/src/library/boxesForMeasures';
import { PROCESS_ANNOTATION } from 'meld-clients-core/src/actions/index';

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

export function generateCursorBoxes(scoreComponent, show, showThis) { 
	// horrible hack -- see above
	const scoreElement = ReactDOM.findDOMNode(scoreComponent);
	return (dispatch) => { 
		setTimeout(() => {	
			const verovioSVG = scoreElement.querySelector("svg");
			if(!verovioSVG) return;
			const boxes = boxesForMeasures(verovioSVG, show ? "" : "hidden");
			Array.prototype.map.call(boxes, function(b) {
				if(showThis && b.id===showThis) b.classList.remove("hidden");
				// attach click handlers to boxes
				b.onclick = function(e) { 
					dispatch({
						type: "ELEMENT_CLICKED",
						payload: {
							elementType: "cursor", 
							elementId: b.getAttribute("id")
						}
					})
				}
			});
		}, 3000)
	}
}

export function unselectCursor(scoreComponent) {
	if(scoreComponent) { 
		const box = ReactDOM.findDOMNode(scoreComponent).querySelector(".barBox.selected");
		if(box) { 
			box.classList.remove("selected");
			console.log("Unselected cursor!");
		}
	}
	return { type: "UNSELECT_CURSOR" }
}

export function hideCursorBoxes(scoreComponent, exceptThisOne) { 
	if(scoreComponent) { 
		// hide all the boxes, except the selected one (if specified)
		const query = exceptThisOne ? ".barBox:not(#"+exceptThisOne+")" : ".barBox";
		const boxes = ReactDOM.findDOMNode(scoreComponent).querySelectorAll(query);
		console.log("~Hide: ", boxes);
		if(!boxes.length) return generateCursorBoxes(scoreComponent, false, exceptThisOne);
		Array.prototype.map.call(boxes, function(b) { 
			b.classList.add("hidden");
		});

		if(exceptThisOne) {
			// style the selected box if provided
			let s = ReactDOM.findDOMNode(scoreComponent).querySelector("#" + exceptThisOne)
			s.classList.add("selected");
		}

	}
	return { type: "HIDE_CURSOR_BOXES" }
}

export function showCursorBoxes(scoreComponent) { 
	if(scoreComponent) { 
		const boxes = ReactDOM.findDOMNode(scoreComponent).querySelectorAll(".barBox");
		console.log("CURSOR: SHOW", boxes)
		if(!boxes) generateCursorBoxes(scoreComponent, true)
		Array.prototype.map.call(boxes, function(b) { 
			b.classList.remove("hidden") 
		});
	}
	return { type: "SHOW_CURSOR_BOXES" }
}

export function attachClickHandlerToAnnotationGlyphs(scoreComponent) { 
	return (dispatch) => { 
		const scoreElement = ReactDOM.findDOMNode(scoreComponent);
		const annotationGlyphs = scoreElement.querySelectorAll(".annotation");
		Array.prototype.map.call(annotationGlyphs, function(g) { 
			g.onclick = function(e) { 
				console.log("GLYPH CLICK");
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

export function projectAnnotations(outcomes) { 
	return (dispatch) => { 
		console.log("~~~OUTSIDE MAP ", outcomes[0]["@graph"]);
		outcomes[0]["@graph"].map( (outcome) => {
			// FIXME "targets" and "bodies" here should really be 
			// "fragments" and "payloads" or similar in the core reducer
			// TODO, think through and improve
			console.log("~~~INSIDE MAP ", outcome);
			let outcomeWrapper = {
				targets: outcome["http://www.w3.org/ns/oa#hasTarget"],
				bodies: outcome
			}
			dispatch({
				type: PROCESS_ANNOTATION,
				payload: outcomeWrapper
			})
		})
	}
}
