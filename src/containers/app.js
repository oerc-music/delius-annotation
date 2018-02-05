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

class App extends Component { 
	constructor(props) {
		super(props);
		this.state = { 
			currentMotif: this.props.motif || false,
			modes: modes
		 };
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
		// If more than 2 note elements selected, throw out the oldest element
		// 		(only makes sense to have up to 2 selected for Delius annotation)
		if(nextProps.modalUI.elements.length > 2) { 
			this.props.popElements();
		}
		
		// If more than 2 note elements selected, throw out the oldest element
		// 		(only makes sense to have up to 2 selected for Delius annotation)
		if(nextProps.modalUI.elements.length > 2) { 
			this.props.popElements();
		}

		// Mode-specific rules go here
		switch(this.props.modalUI.mode) { 
			case "baseMode": 
				// in base mode, only one constituent selection valid at a time, used to switch to that constituent's mode
				if(nextProps.modalUI.constituents.has("dynamics")) { 
					// user wants to annotate dynamics 
					this.props.clearConstituents();
					this.props.setMode("dynamicsMode");
				}
				break;
			case "dynamicsMode":
				// in dynamics mode, we should only allow ONE selection at a time, and ONLY if at least one note is selected
				if(nextProps.modalUI.constituents.size !== 0) {
					if(this.props.modalUI.elements.length > 0) {
						// dynamics are point annotations
						// so annotate the latest-selected element (if more than 1)
						console.log("ANNOTATE WITH DYNAMICS: " +  Array.from(nextProps.modalUI.constituents)[0], this.props.modalUI.elements[0]);
						this.props.postAnnotation(
							"http://127.0.0.1:5000/sessions/deliusAnnotation", 
							"ARFARFARF", 
							JSON.stringify({	
								"oa:hasTarget": { "@id": this.props.modalUI.elements[0] },
								"oa:motivatedBy": { "@id": Array.from(nextProps.modalUI.constituents)[0] }
							})
						);
						// and, having actioned this, clear element selections
						this.props.clearElements();
					} else { 
						console.log("Constituent selection without note element selection -- IGNORING");
					}
					// having taken any appropriate actions, clear constituents
					this.props.clearConstituents();
				}
		}
	}

	componentDidUpdate(nextProps) { 
		// update note classes (ensure only selected ones are highlighted)
		this.props.decorateNotes(this.scoreComponent, this.props.modalUI.elements);
		console.log("modalUI constituents", Array.from(this.props.modalUI.constituents)); 
		console.log("modalUI elements", this.props.modalUI.elements); 
	}

	render() { 
		return (
			<div> 
					<link rel="stylesheet" href="style/modalUI.css" type="text/css" />
					<Modal modes={this.state.modes} orientation="wide"/> 
					<Score uri="/Late Swallows-dolet-musescore-II.mei" ref={(score) => {this.scoreComponent = score}} />
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
