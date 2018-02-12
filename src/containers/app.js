import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { connect } from 'react-redux' ;
import { bindActionCreators } from 'redux';

import Score from 'meld-client/src/containers/score';
import Modal from 'meld-client/src/containers/modalUI';
import { fetchGraph } from '../../../meld-client/src/actions/index';
import { setMode, clearConstituents, clearElements, popElements } from '../../../meld-client/src/actions/modalUI';
import { attachClickHandlerToNotes, attachClickHandlerToAnnotationGlyphs, decorateNotes } from '../actions/deliusActions';
import { postAnnotation} from '../../../meld-client/src/actions/index'
import { modes } from '../../config/deliusModes';
import { drawSingleThingOnScore, drawRangedThingOnScore, showSet } from '../scribble-on-score.js';

class App extends Component { 
	constructor(props) {
		super(props);
		this.state = { 
			currentMotif: this.props.motif || false,
			modes: modes,
			annotationSets: [1],
			currentAnnotationSet: 1
		 };
		// Following bindings required to make 'this' work in the callbacks
    this.handleBaseModeLogic = this.handleBaseModeLogic.bind(this);
    this.postSyncAnnotation = this.postSyncAnnotation.bind(this);
    this.switchSet = this.switchSet.bind(this);
    this.addSet= this.addSet.bind(this);
    this.mintAnnotationId= this.mintAnnotationId.bind(this);
	}
	componentDidMount() { 
		if(this.props.graphUri) { 
			const graphUri = this.props.graphUri;
			this.props.fetchGraph(graphUri);
		}
		this.props.attachClickHandlerToNotes(this.scoreComponent)
	}
	componentWillReceiveProps(nextProps) { 
		// this is where we do app-specific logic for the modal UI
		// If more than 2 note elements selected, throw out the two oldest elements
		// leaving the most recent selection as a single selected element
		const theseNotes = this.props.modalUI.elements["note"] || [];
		const nextNotes = nextProps.modalUI.elements["note"] || [];
		if(nextNotes.length > 2) { 
			this.props.popElements();
			this.props.popElements();
		}


		// Mode-specific rules go here
		switch(this.props.modalUI.mode) { 
			case "nothing": 
				if(nextNotes.length) {
					this.props.setMode("pointBase");
				} 				
				break;
			case "pointBase":
				if(nextNotes.length === 2) { 
					// need to switch to other base mode 
					this.props.setMode("rangeBase");
				}
				this.handleBaseModeLogic(nextProps);
				break;
			case "rangeBase": 
				if(nextNotes.length === 1) { 
					// need to switch to other base mode 
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
						}else {
							// if a constituent has been selected,
							// make a point annotation
							var annotId = this.mintAnnotationId();
							this.props.postAnnotation(
								"http://127.0.0.1:5000/sessions/deliusAnnotation", 
								"UnknownEtag", 
								JSON.stringify({	
									"@id": annotId,
									"oa:hasTarget": { "@id": this.props.modalUI.elements[0] },
									"oa:motivatedBy": { "@id": Array.from(nextProps.modalUI.constituents)[0] }
								})
							);
							drawSingleThingOnScore(document.getElementById(theseNotes[0]), Array.from(nextProps.modalUI.constituents)[0], 0, this.state.currentAnnotationSet - 1, annotId);
							// now reset UI
							this.props.clearConstituents();
							this.props.clearElements("note");
							this.props.setMode("nothing");
						}
					} else if(theseNotes.length !== nextNotes.length) { 
						// if the element selections have changed, reset to base mode (in lieu of back button)
						if(nextNotes.length === 1) { 
							this.props.setMode("pointBase");
						} else { 
							this.props.setMode("rangeBase");
						}
						this.props.clearConstituents();
					}
							 
					break;
		}
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
					"http://127.0.0.1:5000/sessions/deliusAnnotation", 
					"UnknownEtag", 
					JSON.stringify({	
						"@id": annotId,
						"oa:hasTarget": { "@id": theseNotes[0] },
						"oa:motivatedBy": { "@id": Array.from(nextProps.modalUI.constituents)[0] }
					})
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
						"http://127.0.0.1:5000/sessions/deliusAnnotation", 
						"UnknownEtag", 
						JSON.stringify({	
							"@id": annotId,
							"oa:hasTarget": { "@id": theseNotes[0] },
							"oa:motivatedBy": { "@id": Array.from(nextProps.modalUI.constituents)[0] }
						})
					);
					drawSingleThingOnScore(document.getElementById(theseNotes[0]), Array.from(nextProps.modalUI.constituents)[0], 0, this.state.currentAnnotationSet - 1, annotId);
					// now reset UI
					this.props.clearConstituents();
					this.props.clearElements("note");
					this.props.setMode("nothing");
				} else if(theseNotes.length === 2) { 
					// user wants to make a range annotation
					var annotId = this.mintAnnotationId();
					this.props.postAnnotation(
						"http://127.0.0.1:5000/sessions/deliusAnnotation", 
						"UnknownEtag", 
						JSON.stringify({	
							"@id": annotId,
							"oa:hasTarget": [ 
								{ "@id": theseNotes[0] },
								{ "@id": theseNotes[1] }
							],
							"oa:motivatedBy": { "@id": Array.from(nextProps.modalUI.constituents)[0] }
						})
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
				}
		}

	}

	componentDidUpdate(nextProps) { 
		// update note classes (ensure only selected ones are highlighted)
		this.props.decorateNotes(this.scoreComponent, this.props.modalUI.elements["note"] || []);
		// attach click handlers to any annotation glyphs
		this.props.attachClickHandlerToAnnotationGlyphs(this.scoreComponent);
	}

	postSyncAnnotation() { 
		this.props.postAnnotation(
			"http://127.0.0.1:5000/sessions/deliusAnnotation", 
			"UnknownEtag", 
			JSON.stringify({	
				"oa:hasTarget": { "@id": "http://127.0.0.1:5000/sessions/deliusAnnotation" },
				"oa:motivatedBy": { "@id": "motivation:Sync" }
			})
		);
	}


	mintAnnotationId() { 
		return "http://127.0.0.1:5000/annotations/delius" + new Date().toISOString() 
	}

	switchSet(setNum) { 
		// switch to a given set
		this.setState({currentAnnotationSet: setNum});
		showSet(setNum - 1); // showSet in scribble-on-score is 0-based
	}
	

	addSet() { 
		// add the new set, and switch to it (by setting currentAnnotationSet)
		const newAnnotationSets = this.state.annotationSets.concat([this.state.annotationSets.length+1])
		this.setState({
			annotationSets: newAnnotationSets,
			currentAnnotationSet: newAnnotationSets.length
		});
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
					<Score uri="/Late Swallows-dolet-musescore-II.mei" ref={(score) => {this.scoreComponent = score}} />
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
		postAnnotation,
		popElements,
		setMode 
	}, dispatch);
}

export default connect(mapStateToProps,mapDispatchToProps)(App);
