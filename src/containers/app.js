import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { connect } from 'react-redux' ;
import { bindActionCreators } from 'redux';
import {prefix as pref} from 'meld-clients-core/lib/library/prefixes';

import Score from 'meld-clients-core/lib/containers/score';
import Modal from 'meld-clients-core/lib/containers/modalUI';
import { fetchGraph } from 'meld-clients-core/lib/actions/index';
import { setMode, clearConstituents, clearElements, popElements } from 'meld-clients-core/lib/actions/modalUI';
import { attachClickHandlerToNotes, attachClickHandlerToAnnotationGlyphs, decorateNotes, generateCursorBoxes, hideCursorBoxes, showCursorBoxes, unselectCursor } from '../actions/deliusActions';
import { postAnnotation} from 'meld-clients-core/lib/actions/index'
import { modes } from '../config/deliusModes';
import { drawSingleThingOnScore, drawRangedThingOnScore, showSet, leftOf, deleteThis, retractThis, toggleNudgeAnnotationGlyphStart, toggleNudgeAnnotationGlyphEnd, replayAnnotations } from '../scribble-on-score.js';

const scale = 36;
const vrvOptions = {
//	noLayout:1,
	breaks: 'none',
	adjustPageHeight:0,
	scale:scale,
	spacingStaff: 24,
	pageHeight: 700*100/scale,
	pageWidth: 10000*100/scale
}

class App extends Component { 
	constructor(props) {
		super(props);
		this.state = { 
			currentMotif: this.props.motif || false,
			modes: modes,
			annotationSets: [1],
			currentAnnotationSet: 1,
			currentCursorAnnotation: "",
			displayCursorBoxes: false,
			annotationsToShow: []
		 };
		// Following bindings required to make 'this' work in the callbacks
		this.handleBaseModeLogic = this.handleBaseModeLogic.bind(this);
		this.postSyncAnnotation = this.postSyncAnnotation.bind(this);
		this.switchSet = this.switchSet.bind(this);
		this.addSet= this.addSet.bind(this);
		this.mintAnnotationId= this.mintAnnotationId.bind(this);
		this.clearCursor= this.clearCursor.bind(this);
	}

	componentDidMount() { 
		if(this.props.graphUri) { 
			const graphUri = this.props.graphUri;
			this.props.fetchGraph(graphUri);
		}
		this.props.attachClickHandlerToNotes(this.scoreComponent)
		// generate boxes for measures (and adorn with cursor click-handler)
		this.props.generateCursorBoxes(this.scoreComponent);
	}

	componentWillReceiveProps(nextProps) { 
		// this is where we do app-specific logic for the modal UI
		// If more than 2 note elements selected, throw out the two oldest elements
		// leaving the most recent selection as a single selected element
		const theseNotes = this.props.modalUI.elements["note"] || [];
		const nextNotes = nextProps.modalUI.elements["note"] || [];
		const theseGlyphs = this.props.modalUI.elements["annotationGlyph"] || [];
		const nextGlyphs = nextProps.modalUI.elements["annotationGlyph"] || [];
		const thisCursor = this.props.modalUI.elements["cursor"] || [];
		let nextCursor = nextProps.modalUI.elements["cursor"] || [];
		let nextDisplayCursorBoxes = false;

		// CURSOR LOGIC:
		// ********************
		if(nextCursor.length > 1) {
			// only allow up to one cursor to be selected at a time
			this.props.popElements("cursor");
		}

		if(nextProps.modalUI.constituents.has("cursor")) { 
		// show or hide based on "cursor" constituent click
			if(this.state.displayCursorBoxes) {
				this.setState({ displayCursorBoxes: false }, () => {
					// callback: hide cursor boxes once set state is done
					this.props.hideCursorBoxes(this.scoreComponent)
				});
				nextDisplayCursorBoxes = false;
			} else { 
				this.clearCursor(); // new cursor requested, so clear existing
				this.setState({ displayCursorBoxes: true }, () => {
					// callback: show cursor boxes once set state is done
					// and switch to nothing mode
					this.props.showCursorBoxes(this.scoreComponent);
				});
				nextDisplayCursorBoxes = true;
			}
			this.props.clearConstituents();

		} else if(this.state.displayCursorBoxes && nextCursor.length) {
			// cursor position has been selected
			// make corresponding annotation...
			var annotId = this.mintAnnotationId();
			this.setState({ currentCursorAnnotation: annotId });
			this.props.postAnnotation(
				this.props.baseUri + "/sessions/deliusAnnotation",
				"UnknownEtag", 
				//				JSON.stringify({
				{
					"@id": annotId,
					[pref.oa+"hasTarget"]: { 
						"@type": { "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Bag" }, 
						[pref.rdfs+"member"]: { "@id": nextCursor[0].replace("-box","") }
					},
					[pref.oa+"motivatedBy"]: { "@id": "cursor" },
					[pref.meld+"inAnnotationSet"]: this.state.currentAnnotationSet
				}
				//)
			);
			// hide cursor boxes, except the selected one
			console.log("RESET: ", this.props.modalUI, nextProps.modalUI, this.state.displayCursorBoxes);
			this.setState({ displayCursorBoxes: false }, () => {
				this.props.hideCursorBoxes(this.scoreComponent, nextCursor[0]);
			});
			this.props.clearConstituents();
			nextDisplayCursorBoxes = false;
		}
		
		if(thisCursor.length && nextProps.modalUI.constituents.has("important")) { 
			// user has specified the selected cursor position as important
			// make corresponding annotation...
			var annotId = this.mintAnnotationId();
			this.props.postAnnotation(
				this.props.baseUri + "/sessions/deliusAnnotation", 
				"UnknownEtag", 
				//				JSON.stringify({
				{
					"@id": annotId,
					[pref.oa+"hasTarget"]: { "@id": this.state.currentCursorAnnotation },
					[pref.oa+"motivatedBy"]: { "@id": "important" },
					[pref.meld+"inAnnotationSet"]: this.state.currentAnnotationSet
				}//)
			);
			// and clear selections
			this.props.clearConstituents();
			this.props.setMode("nothing");
			this.clearCursor();
			nextCursor = [];
			
		}
 
		// ********************
		// END CURSOR LOGIC

		if(nextNotes.length > 2) { 
			// only allow up to two notes to be selected at a time
			this.props.popElements("note");
			this.props.popElements("note");
		}

		if(nextGlyphs.length > 1) {
			// only allow up to one glyph to be selected at a time
			this.props.popElements("annotationGlyph");
		}
		
		if(theseNotes.length !== nextNotes.length &&
			 nextNotes.length !== 0) { 
			// note selection has changed
			// deselected any annotation glyphs
			// and reset cursor
			this.props.clearElements("annotationGlyph");
			this.clearCursor();
		}
		if(!(theseGlyphs.length) &&
			nextGlyphs.length) {
			// User has clicked on an annotation glyph
			// Switch to delete annotation mode
			this.props.setMode("editAnnotationMode");
			this.props.clearConstituents();
			// ... and unselect any note elements
			this.props.clearElements("note");
			this.clearCursor();
		} else if(nextDisplayCursorBoxes) { 
			// User has decided to place a cursor
			// switch to nothing mode
			this.props.clearElements("note")
			this.props.clearElements("annotationGlyph")
			this.props.setMode("nothing");
		} else if(nextCursor.length) {
			// User has a cursor placed
			// switch to activeCursor mode
			this.props.setMode("activeCursorMode");
		}
		else { 
			// Mode-specific rules go here
			switch(this.props.modalUI.mode) { 
				case "nothing": 
				case "activeCursorMode":
				case "editAnnotationMode":
					if(nextNotes.length) {
						// note selected
						this.props.clearConstituents();
						this.props.setMode("pointBase");
					} else if(nextProps.modalUI.constituents.size) { 
						// user wants to delete or retract annotation glyph
						if(Array.from(nextProps.modalUI.constituents)[0]==="delete"){
							console.log("DELETE: ", this.props.modalUI.elements.annotationGlyph[0]);
							deleteThis(this.props.modalUI.elements.annotationGlyph[0]);
							this.props.postAnnotation(
								// FIXME should really be a patch, not a post
								this.props.baseUri + "/sessions/deliusAnnotation", 
								"UnknownEtag", 
//								JSON.stringify({
									{
									"@id": nextGlyphs[0],
									"meld:state": "meld:Deleted",
									"dct:modified": new Date().toISOString()
								}//)
							);
						} else if(Array.from(nextProps.modalUI.constituents)[0]==="changeMind"){
							console.log("RETRACT: ", this.props.modalUI.elements.annotationGlyph[0]);
							retractThis(this.props.modalUI.elements.annotationGlyph[0]);
							this.props.postAnnotation(
								// FIXME should really be a patch, not a post
								this.props.baseUri + "/sessions/deliusAnnotation", 
								"UnknownEtag", 
								//								JSON.stringify({
								{
									"@id": nextGlyphs[0],
									"meld:state": "meld:Retracted",
									"dct:modified": new Date().toISOString()
								}//)
							);
						} else if(Array.from(nextProps.modalUI.constituents)[0]==="nudgeStart"){
							console.log("NUDGE START: ", this.props.modalUI.elements.annotationGlyph[0]);
							// INSERT NUDGE START CALL HERE
							toggleNudgeAnnotationGlyphStart(this.props.modalUI.elements.annotationGlyph[0]);
							this.props.postAnnotation(
								// FIXME should really be a patch, not a post
								this.props.baseUri + "/sessions/deliusAnnotation", 
								"UnknownEtag", 
//								JSON.stringify({	
								{
									"@id": nextGlyphs[0],
									"meld:state": "meld:NudgeStart",
									"dct:modified": new Date().toISOString()
								}//)
							);
						} else if(Array.from(nextProps.modalUI.constituents)[0]==="nudgeEnd"){
							console.log("NUDGE END: ", this.props.modalUI.elements.annotationGlyph[0]);
							// INSERT NUDGE END CALL HERE
							toggleNudgeAnnotationGlyphEnd(this.props.modalUI.elements.annotationGlyph[0]);
							this.props.postAnnotation(
								// FIXME should really be a patch, not a post
								this.props.baseUri + "/sessions/deliusAnnotation", 
								"UnknownEtag", 
								//								JSON.stringify({
								{
									"@id": nextGlyphs[0],
									"meld:state": "meld:NudgeEnd",
									"dct:modified": new Date().toISOString()
								}//)
							);
						}
						// now reset to nothing mode
						this.props.clearConstituents();
						this.props.clearElements("annotationGlyph");
						this.props.setMode("nothing")
					}
					break;
				case "pointBase":
					if(nextNotes.length === 2) { 
						// need to switch to other base mode 
						this.props.clearConstituents();
						this.props.setMode("rangeBase");
					}
					this.handleBaseModeLogic(nextProps);
					break;
				case "rangeBase": 
					if(nextNotes.length === 1) { 
						// need to switch to other base mode 
						this.props.clearConstituents();
						this.props.setMode("pointBase");
					}
					this.handleBaseModeLogic(nextProps);
					break;
				case "dynamicsMode":
				case "fingeringsMode":
					if(nextProps.modalUI.constituents.size !== 0){
						if(Array.from(nextProps.modalUI.constituents)[0]==="back"){
							this.props.clearConstituents();
							if(theseNotes.length === 1) { 
								this.props.setMode("pointBase");
							} else {
								this.props.setMode("rangeBase"); 
							} 
						} else {
							// if a constituent has been selected,
							// make a point annotation
							var annotId = this.mintAnnotationId();
							var annot = {	
								"@id": annotId,
								[pref.oa+"hasTarget"]: { 
									"@type": { "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Bag" },
									[pref.rdfs+"member"]: { "@id": this.props.modalUI.elements["note"][0] },
									[pref.meld+"startsWith"]: { "@id": this.props.modalUI.elements["note"][0] }
								},
								[pref.oa+"motivatedBy"]: { "@id": Array.from(nextProps.modalUI.constituents)[0] },
								[pref.meld+"inAnnotationSet"]: this.state.currentAnnotationSet
							};
							this.props.postAnnotation(
								this.props.baseUri + "/sessions/deliusAnnotation", 
								"UnknownEtag",
								annot
								//JSON.stringify(annot)
							);
							console.log("Ready to draw?");
//							drawSingleThingOnScore(document.getElementById(theseNotes[0]), Array.from(nextProps.modalUI.constituents)[0], 0, this.state.currentAnnotationSet - 1, annotId);
							// now reset UI
							this.props.clearElements("note");
							this.props.clearConstituents();
							this.props.setMode("nothing");
							this.setState({annotationsToShow: this.state.annotationsToShow.concat(annot)});
						}
					} else if(theseNotes.length !== nextNotes.length) { 
						// if the element selections have changed, reset to base mode (in lieu of back button)
						if(nextNotes.length === 1) { 
							this.props.setMode("pointBase");
						} else if(nextNotes.length === 2){ 
							this.props.setMode("rangeBase");
						}
						this.props.clearConstituents();
					}
							 
					break;
			}
		}
	}

	clearCursor() {
		this.props.clearElements("cursor"); 
		this.props.hideCursorBoxes(this.scoreComponent);
		// if we were tracking a previous cursor annotation, 
		// send the cursorCleared annotation and stop tracking 
		if(this.state.currentCursorAnnotation) {
			var annotId = this.mintAnnotationId();
			this.props.postAnnotation(
				this.props.baseUri + "/sessions/deliusAnnotation", 
				"UnknownEtag", 
				//				JSON.stringify({
				{
					"@id": annotId,
					[pref.oa+"hasTarget"]: { "@id": this.state.currentCursorAnnotation },
					[pref.oa+"motivatedBy"]: { "@id": "cursorCleared" },
					[pref.meld+"inAnnotationSet"]: this.state.currentAnnotationSet
				}//)
			);
			this.setState({ currentCursorAnnotation: "" });
		}
		// visually reset the cursor selection
		this.props.unselectCursor(this.scoreComponent);
	}

	handleBaseModeLogic(nextProps) {
		const theseNotes = this.props.modalUI.elements["note"] || [];
		const nextNotes = nextProps.modalUI.elements["note"] || [];
		if(nextProps.modalUI.constituents.has("upbow") ||
			 nextProps.modalUI.constituents.has("downbow") 
			) { 
			// user wants to make a point annotation
			var annotId = this.mintAnnotationId();
				this.props.postAnnotation(
					this.props.baseUri + "/sessions/deliusAnnotation", 
					"UnknownEtag", 
					//					JSON.stringify({
					{
						"@id": annotId,
						[pref.oa+"hasTarget"]: { 
							"@type": { "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Bag" }, 
							[pref.rdfs+"member"]: { "@id": theseNotes[0] },
							[pref.meld+"startsWith"]: { "@id": theseNotes[0] }
						},
						[pref.oa+"motivatedBy"]: { "@id": Array.from(nextProps.modalUI.constituents)[0] },
						[pref.meld+"inAnnotationSet"]: this.state.currentAnnotationSet
					}//)
				);
			drawSingleThingOnScore(document.getElementById(theseNotes[0]), Array.from(nextProps.modalUI.constituents)[0], 0, this.state.currentAnnotationSet - 1, annotId);
				// now reset UI
				this.props.clearConstituents();
				this.props.clearElements("note");
				this.props.setMode("nothing");
		} else if(nextProps.modalUI.constituents.has("finger2")) { 
			// user wants to switch to fingerings mode
			this.props.setMode("fingeringsMode");
			this.props.clearConstituents();
		} else if(nextProps.modalUI.constituents.has("mf")) {
			// user wants to switch to dynamics mode
			this.props.setMode("dynamicsMode");
			this.props.clearConstituents();
		} else if(nextProps.modalUI.constituents.has("phrase") ||
							nextProps.modalUI.constituents.has("cresc") ||
							nextProps.modalUI.constituents.has("dim")) { 
				if(theseNotes.length === 1) {
					// user wants to make a point annotation
					var annotId = this.mintAnnotationId();
					this.props.postAnnotation(
						this.props.baseUri + "/sessions/deliusAnnotation", 
						"UnknownEtag", 
						//						JSON.stringify({
						{
							"@id": annotId,
							[pref.oa+"hasTarget"]: { 
								"@type": { "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Bag" },
								[pref.rdfs+"member"]: { "@id": theseNotes[0] },
								[pref.meld+"startsWith"]: { "@id": theseNotes[0] },
								[pref.meld+"endsAfter"]: { "@id": theseNotes[0] }
							},
							[pref.oa+"motivatedBy"]: { "@id": Array.from(nextProps.modalUI.constituents)[0] },
							[pref.meld+"inAnnotationSet"]: this.state.currentAnnotationSet
						}//
					);
					drawSingleThingOnScore(document.getElementById(theseNotes[0]), Array.from(nextProps.modalUI.constituents)[0], 0, this.state.currentAnnotationSet - 1, annotId);
					// now reset UI
					this.props.clearConstituents();
					this.props.clearElements("note");
					this.props.setMode("nothing");
				} else if(theseNotes.length === 2) { 
					// user wants to make a range annotation
					var annotId = this.mintAnnotationId();
					var leftFirst = leftOf(theseNotes[0], theseNotes[1]);
					var note1 = leftFirst ? theseNotes[0] : theseNotes[1];
					var note2 = leftFirst ? theseNotes[1] : theseNotes[0];
					var annot = {
						"@id": annotId,
						[pref.oa+"hasTarget"]: {
							"@type": {"@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Bag"},
							"rdfs:member": [
								{ "@id": note1 },
								{ "@id": note2 } ],
							[pref.meld+"startsWith"]: { "@id": note1 },
							[pref.meld+"endsWith"]: { "@id": note2 }
						},
						[pref.oa+"motivatedBy"]: { "@id": Array.from(nextProps.modalUI.constituents)[0] },
						[pref.meld+"inAnnotationSet"]: this.state.currentAnnotationSet
					}
					this.props.postAnnotation(
						this.props.baseUri + "/sessions/deliusAnnotation", 
						"UnknownEtag",
						annot
						//JSON.stringify(annot)
					);
					drawRangedThingOnScore(document.getElementById(theseNotes[0]),
																 false, 
																 document.getElementById(theseNotes[1]),
																 false, 
																 Array.from(nextProps.modalUI.constituents)[0],
																 this.state.currentAnnotationSet - 1, annotId);
					// now reset UI
					this.props.clearConstituents();
					this.props.clearElements("note");
					this.props.setMode("nothing");
					this.setState({annotationsToShow: this.state.annotationsToShow.concat(annot)});
				}
		}

	}

	componentDidUpdate(nextProps) { 
		// update note classes (ensure only selected ones are highlighted)
		this.props.decorateNotes(this.scoreComponent, this.props.modalUI.elements["note"] || []);
		// attach click handlers to any annotation glyphs
		this.props.attachClickHandlerToNotes(this.scoreComponent)
		this.props.attachClickHandlerToAnnotationGlyphs(this.scoreComponent);
		if(!document.getElementsByClassName("barBox").length && this.state.displayCursorBoxes) {
		 	this.props.generateCursorBoxes(this.scoreComponent, this.state.displayCursorBoxes);
		} else if (!document.getElementsByClassName("barBox").length && this.props.modalUI.mode==="activeCursorMode"){
			this.props.generateCursorBoxes(this.scoreComponent, false, this.props.modalUI.elements.cursor);
		}
		console.log("after update: ", this.state.displayCursorBoxes);
	}

	postSyncAnnotation() { 
		this.props.postAnnotation(
			this.props.baseUri + "/sessions/deliusAnnotation", 
			"UnknownEtag", 
			//			JSON.stringify({
			{
				[pref.oa+"hasTarget"]: { "@id":
														this.props.baseUri + "/sessions/deliusAnnotation"
													},
				[pref.oa+"motivatedBy"]: { "@id": "motivation:Sync" }
			}//)
		);
	}


	mintAnnotationId() {
		return this.props.baseUri + "/annotations/delius" + new Date().toISOString() 
	}

	switchSet(setNum) { 
		// switch to a given set
		this.setState({currentAnnotationSet: setNum});
		this.props.clearElements("note");
		this.props.clearElements("annotationGlyph");
		this.props.setMode("nothing");
		showSet(setNum - 1); // showSet in scribble-on-score is 0-based
	}
	

	addSet() { 
		// add the new set, and switch to it (by setting currentAnnotationSet)
		const newAnnotationSets = this.state.annotationSets.concat([this.state.annotationSets.length+1])
		this.setState({
			annotationSets: newAnnotationSets,
			currentAnnotationSet: newAnnotationSets.length
		});
		this.props.clearElements("note");
		this.props.clearElements("annotationGlyph");
		this.props.setMode("nothing");
		showSet(newAnnotationSets.length - 1); // showSet in scribble-on-score is 0-based
	}


	render() { 
		const annotationSetButtons = this.state.annotationSets.map(
			(setNum) => {
				if(setNum === this.state.currentAnnotationSet){
					return <button id={"set"+setNum} key={"set"+setNum} className="setButton" disabled>{setNum}</button>;
				} else { 
					return <button id={"set"+setNum} key={"set"+setNum} className="setButton" onClick={() => this.switchSet(setNum)}>{setNum}</button>;

				}
			});
		return (
			<div> 
					<link rel="stylesheet" href="style/modalUI.css" type="text/css" />
					<Modal modes={this.state.modes} orientation="wide"/> 
				<Score uri="/Late Swallows-dolet-musescore-II.mei" ref={(score) => {this.scoreComponent = score}} options={vrvOptions} scoreAnnotations={this.state.annotationsToShow} drawAnnotation={replayAnnotations} />
					<button id="sync" onClick={this.postSyncAnnotation}>Sync!</button>
					<div className="setButtonsContainer">
						{ annotationSetButtons }
						<button className="setButton" onClick={this.addSet}>+</button>
					</div>
			</div>
		)
	}
}

function mapStateToProps({ modalUI }) {
	return { modalUI }
}

function mapDispatchToProps(dispatch) { 
	return bindActionCreators({ 
		attachClickHandlerToNotes,
		attachClickHandlerToAnnotationGlyphs,
		clearConstituents, 
		clearElements,
		decorateNotes,
		generateCursorBoxes,
		hideCursorBoxes,
		postAnnotation,
		popElements,
		setMode,
		showCursorBoxes,
		unselectCursor
	}, dispatch);
}

export default connect(mapStateToProps,mapDispatchToProps)(App);
