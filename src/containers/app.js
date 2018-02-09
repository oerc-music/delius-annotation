import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { connect } from 'react-redux' ;
import { bindActionCreators } from 'redux';

import Score from 'meld-client/src/containers/score';
import Modal from 'meld-client/src/containers/modalUI';
import { fetchGraph } from '../../../meld-client/src/actions/index';
import { setMode, clearConstituents, clearElements, popElements } from '../../../meld-client/src/actions/modalUI';
import { attachClickHandlerToNotes, decorateNotes } from '../actions/deliusActions';
import { postAnnotation} from '../../../meld-client/src/actions/index'
import { modes } from '../../config/deliusModes';
import { drawSingleThingOnScore, drawRangedThingOnScore } from '../scribble-on-score.js';

class App extends Component { 
	constructor(props) {
		super(props);
		this.state = { 
			currentMotif: this.props.motif || false,
			modes: modes
		 };
		// Following binding required to make 'this' work in the callback
    this.handleBaseModeLogic = this.handleBaseModeLogic.bind(this);
    this.postSyncAnnotation = this.postSyncAnnotation.bind(this);
	}
	componentDidMount() { 
		if(this.props.graphUri) { 
			const graphUri = this.props.graphUri;
			this.props.fetchGraph(graphUri);
		}
		this.props.attachClickHandlerToNotes(this.scoreComponent, this.props.modalUI.elements)
	}
	componentWillReceiveProps(nextProps) { 
		// this is where we do app-specific logic for the modal UI
		// If more than 2 note elements selected, throw out the two oldest elements
		// leaving the most recent selection as a single selected element
		if(nextProps.modalUI.elements.length > 2) { 
			this.props.popElements();
			this.props.popElements();
		}


		// Mode-specific rules go here
		switch(this.props.modalUI.mode) { 
			case "nothing": 
				if(nextProps.modalUI.elements.length) {
					this.props.setMode("pointBase");
				} 				
				break;
			case "pointBase":
				if(nextProps.modalUI.elements.length === 2) { 
					// need to switch to other base mode 
					this.props.setMode("rangeBase");
				}
				this.handleBaseModeLogic(nextProps);
				break;
			case "rangeBase": 
				if(nextProps.modalUI.elements.length === 1) { 
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
							if(this.props.modalUI.elements.length === 1) { 
								this.props.setMode("pointBase");
							} else {
								this.props.setMode("rangeBase"); 
							} 
						}else {
							// if a constituent has been selected,
							// make a point annotation 
							this.props.postAnnotation(
								"http://127.0.0.1:5000/sessions/deliusAnnotation", 
								"UnknownEtag", 
								JSON.stringify({	
									"oa:hasTarget": { "@id": this.props.modalUI.elements[0] },
									"oa:motivatedBy": { "@id": Array.from(nextProps.modalUI.constituents)[0] }
								})
							);
							drawSingleThingOnScore(document.getElementById(this.props.modalUI.elements[0]), Array.from(nextProps.modalUI.constituents)[0], 0);
							// now reset UI
							this.props.clearConstituents();
							this.props.clearElements();
							this.props.setMode("nothing");
						}
					} else if(this.props.modalUI.elements.length !== nextProps.modalUI.elements.length) { 
						// if the element selections have changed, reset to base mode (in lieu of back button)
						if(nextProps.modalUI.elements.length === 1) { 
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
		if(nextProps.modalUI.constituents.has("upbow") ||
			 nextProps.modalUI.constituents.has("downbow") 
			) { 
				// user wants to make a point annotation
				this.props.postAnnotation(
					"http://127.0.0.1:5000/sessions/deliusAnnotation", 
					"UnknownEtag", 
					JSON.stringify({	
						"oa:hasTarget": { "@id": this.props.modalUI.elements[0] },
						"oa:motivatedBy": { "@id": Array.from(nextProps.modalUI.constituents)[0] }
					})
				);
				drawSingleThingOnScore(document.getElementById(this.props.modalUI.elements[0]), Array.from(nextProps.modalUI.constituents)[0], 0);
				// now reset UI
				this.props.clearConstituents();
				this.props.clearElements();
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
				if(this.props.modalUI.elements.length === 1) {
				// user wants to make a point annotation
					this.props.postAnnotation(
						"http://127.0.0.1:5000/sessions/deliusAnnotation", 
						"UnknownEtag", 
						JSON.stringify({	
							"oa:hasTarget": { "@id": this.props.modalUI.elements[0] },
							"oa:motivatedBy": { "@id": Array.from(nextProps.modalUI.constituents)[0] }
						})
					);
					drawSingleThingOnScore(document.getElementById(this.props.modalUI.elements[0]), Array.from(nextProps.modalUI.constituents)[0], 0);
					// now reset UI
					this.props.clearConstituents();
					this.props.clearElements();
					this.props.setMode("nothing");
				} else if(this.props.modalUI.elements.length === 2) { 
					// user wants to make a range annotation
					this.props.postAnnotation(
						"http://127.0.0.1:5000/sessions/deliusAnnotation", 
						"UnknownEtag", 
						JSON.stringify({	
							"oa:hasTarget": [ 
								{ "@id": this.props.modalUI.elements[0] },
								{ "@id": this.props.modalUI.elements[1] }
							],
							"oa:motivatedBy": { "@id": Array.from(nextProps.modalUI.constituents)[0] }
						})
					);
					drawRangedThingOnScore(document.getElementById(this.props.modalUI.elements[0]),
																 false, 
																 document.getElementById(this.props.modalUI.elements[1]),
																 false, 
																 Array.from(nextProps.modalUI.constituents)[0]);
					// now reset UI
					this.props.clearConstituents();
					this.props.clearElements();
					this.props.setMode("nothing");
				}
		}

	}

	componentDidUpdate(nextProps) { 
		// update note classes (ensure only selected ones are highlighted)
		this.props.decorateNotes(this.scoreComponent, this.props.modalUI.elements);
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


	render() { 
		return (
			<div> 
					<link rel="stylesheet" href="style/modalUI.css" type="text/css" />
					<Modal modes={this.state.modes} orientation="wide"/> 
					<Score uri="/Late Swallows-dolet-musescore-II.mei" ref={(score) => {this.scoreComponent = score}} />
					<button id="sync" onClick={this.postSyncAnnotation}>Sync!</button>
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
		clearConstituents, 
		clearElements,
		decorateNotes,
		postAnnotation,
		popElements,
		setMode 
	}, dispatch);
}

export default connect(mapStateToProps,mapDispatchToProps)(App);
