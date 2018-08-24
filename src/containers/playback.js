import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { connect } from 'react-redux' ;
import { bindActionCreators } from 'redux';
import MediaPlayer from 'meld-clients-core/src/components/mediaPlayer'

import Score from 'meld-clients-core/src/containers/score';
import Modal from 'meld-clients-core/src/containers/modalUI';
import { traverse, setTraversalObjectives, checkTraversalObjectives } from 'meld-clients-core/src/actions/index';
import { setMode, clearConstituents, clearElements, popElements } from 'meld-clients-core/src/actions/modalUI';
import { attachClickHandlerToNotes, attachClickHandlerToAnnotationGlyphs, decorateNotes, generateCursorBoxes, hideCursorBoxes, showCursorBoxes, unselectCursor } from '../actions/deliusActions';
import { postAnnotation} from 'meld-clients-core/src/actions/index'
import { modes } from '../../config/deliusModes';
import { drawSingleThingOnScore, drawRangedThingOnScore, showSet, leftOf, deleteThis, retractThis, toggleNudgeAnnotationGlyphStart, toggleNudgeAnnotationGlyphEnd } from '../scribble-on-score.js';

class Playback extends Component { 
	constructor(props) {
		super(props);
		this.state = { 
			currentMotif: this.props.motif || false,
			currentCursorAnnotation: "",
			displayCursorBoxes: false
		 };
		// Following bindings required to make 'this' work in the callbacks
		this.clearCursor= this.clearCursor.bind(this);
	}

	componentWillMount() { 
		this.props.setTraversalObjectives([
			{
				"http://www.w3.org/ns/oa#annotatedAt": ""
			}

		]);
	}
	componentDidMount() { 
		console.log("PROPS: ", this.props);
		if(this.props.route.graphUri) { 
			const graphUri = this.props.route.graphUri;
			console.log("GRAPH: ", graphUri);
			this.props.traverse(graphUri);
		}
		// generate boxes for measures (and adorn with cursor click-handler)
		this.props.generateCursorBoxes(this.scoreComponent);
	}
	
	componentDidUpdate(prevProps, prevState) {
		console.log("Did update!", prevProps, this.props);
		if("graph" in prevProps) { 
			// check our traversal objectives if the graph has updated
			if(prevProps.graph.graph.length !== this.props.graph.graph.length) { 
				this.props.checkTraversalObjectives(this.props.graph.graph, this.props.graph.objectives);
			}
		}
	}

	clearCursor() {
		this.props.clearElements("cursor"); 
		this.props.hideCursorBoxes(this.scoreComponent);
		this.setState({ currentCursorAnnotation: "" });
		// visually reset the cursor selection
		this.props.unselectCursor(this.scoreComponent);
	}

	render() { 
		if(this.props.graph) { 
			console.log("YAY:", this.props.graph);
		}
		return (
			<div> 
					<link rel="stylesheet" href="style/modalUI.css" type="text/css" />
					<MediaPlayer uri="/DELIUS_EVENT.mp3" />;
					<Score uri="/Late Swallows-dolet-musescore-II.mei" options={{pageWidth:19000}} ref={(score) => {this.scoreComponent = score}} />
			</div>
		)
	}
}

function mapStateToProps({ graph, score, modalUI }) {
	return { graph, score, modalUI }
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
		traverse,
		setTraversalObjectives,
		checkTraversalObjectives,
		unselectCursor
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Playback);
