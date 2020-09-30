import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { connect } from 'react-redux' ;
import { bindActionCreators } from 'redux';
import { Media, Player, controls, utils } from 'react-media-player'

import Score from 'meld-clients-core/lib/containers/score';
import Modal from 'meld-clients-core/lib/containers/modalUI';
import { traverse, setTraversalObjectives, checkTraversalObjectives } from 'meld-clients-core/lib/actions/index';
import { setMode, clearConstituents, clearElements, popElements } from 'meld-clients-core/lib/actions/modalUI';
import { attachClickHandlerToNotes, attachClickHandlerToAnnotationGlyphs, decorateNotes, generateCursorBoxes, hideCursorBoxes, projectAnnotations, showCursorBoxes, unselectCursor } from '../actions/deliusActions';
import { registerClock, tickTimedResource } from 'meld-clients-core/lib/actions/index'
import { modes } from '../config/deliusModes';
import { drawSingleThingOnScore, drawRangedThingOnScore, showSet, leftOf, deleteThis, retractThis, toggleNudgeAnnotationGlyphStart, toggleNudgeAnnotationGlyphEnd, replayAnnotations } from '../scribble-on-score.js';
const { PlayPause, CurrentTime, Progress, SeekBar, Duration, MuteUnmute, Volume, Fullscreen } = controls
const { formatTime } = utils

// const clockProvider = "http://127.0.0.1:8080/DELIUS_EVENT.mp3"
const clockProvider = "http://127.0.0.1:8082/DELIUS_EVENT_SMALL_SHORT.mp4"

class Playback extends Component { 
	constructor(props) {
		super(props);
		this.state = { 
			currentMotif: this.props.motif || false,
			currentCursorAnnotation: "",
			displayCursorBoxes: false,
			lastMediaTick: 0,
			describe: {
				finger2: "fingering (2)",
				finger3: "fingering (3)",
				cresc: "crescendo",
				dim: "diminuendo",
				mf: "mezzoforte",
				mp: "mezzopiano"
			}
		 };
		// Following bindings required to make 'this' work in the callbacks
		this.tick = this.tick.bind(this);
		this.clearCursor= this.clearCursor.bind(this);
	}

	componentWillMount() { 
		this.props.setTraversalObjectives([
			{
				"@type": "http://www.w3.org/ns/oa#Annotation"
			}
		]);
		this.props.registerClock(clockProvider);
	}
	componentDidMount() { 
		console.log("PROPS: ", this.props);
		if(this.props.graphUri) { 
			const graphUri = this.props.graphUri;
			console.log("GRAPH: ", graphUri);
			// TODO exclude MEI / mp3 files from traversal
			this.props.traverse(graphUri, {numHops:0});
		}
		// generate boxes for measures (and adorn with cursor click-handler)
		this.props.generateCursorBoxes(this.scoreComponent);
		console.log('mounted');
	}
	
	componentDidUpdate(prevProps, prevState) {
		console.log('updating');
		if("graph" in prevProps) { 
			// check our traversal objectives if the graph has updated
			if(prevProps.graph.graph.length !== this.props.graph.graph.length) { 
				this.props.checkTraversalObjectives(this.props.graph.graph, this.props.graph.objectives);
			}
			if(prevProps.graph.outcomesHash !== this.props.graph.outcomesHash) { 
				// outcomes have changed, need to update our projections!
				this.props.projectAnnotations(this.props.graph.outcomes);
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

	tick(id,t) {
		if(Math.floor(t.currentTime) > this.state.lastMediaTick || // if we've progressed across the next second boundary, 
			 t.currentTime < this.state.lastMediaTick) { // OR if we've gone back in time (user did a seek)...
			this.setState({ lastMediaTick: Math.floor(t.currentTime) }); // keep track of this time tick)
			// dispatch a "TICK" action 
			// any time-sensitive component subscribes to it, 
			// triggering time-anchored annotations triggered as appropriate
			this.props.tickTimedResource(id, Math.floor(t.currentTime));
		}
	}

	render() {
		var annotationsToShow = false;
		if("mediaResources" in this.props.timesync &&
			clockProvider in this.props.timesync.mediaResources) { 
			let cT = this.props.timesync.mediaResources[clockProvider]["currentTime"];
			// if a delay is desired between time and action, modify cT here
			const syncs = this.props.timesync.mediaResources[clockProvider]["times"];
			const times = Object.keys(syncs).map((t) => Number(t)); // ensure number, not string
			var annotationDescription = false;
			let timesToShow =[]
			if(times.length) { 
				timesToShow = times.filter( (t) => { return t <= cT });
			}
			annotationsToShow = timesToShow.map( (toShow) => { 
				return syncs[toShow];
			});
			var lastTime = timesToShow.length ? Math.max(...timesToShow) : -10;
			if(cT - lastTime <5){
				var lastAnnotation = syncs[lastTime];
				var motivation = lastAnnotation["http://www.w3.org/ns/oa#motivatedBy"]["@id"];
				var annotationDescription = this.state.describe[motivation.substring(motivation.lastIndexOf('/')+1)];
			} else {
				console.log(cT, lastTime);
			}
			console.log("Please draw these annotations: ", annotationsToShow, "T", timesToShow, "S", syncs, annotationDescription);
		}
		return (
				<div>
				<link rel="stylesheet" href="style/playback.css" type="text/css" />
				<div className="topbar">
				<a id="oulogo" href="https://www.ox.ac.uk"><img height="115px" width="115px" src="/style/university_of_oxford.png"/></a>
				<h3>String quartet workshop</h3>
				</div>
			<div className="playbackapp"> 
				<link rel="stylesheet" href="style/modalUI.css" type="text/css" />
				{annotationDescription &&
				 <div className="annotationDescription">{annotationDescription}</div>}
					<Media>
						<div className="media qvid">
							<div className="media-player">
								<Player src={ clockProvider } onTimeUpdate={ (t) => {this.tick(clockProvider, t)} } />
							</div>
							<div className="media-controls">
								<PlayPause/>
								<CurrentTime/>
								<SeekBar/>
								<Duration/>
							</div>
						</div>
					</Media>
				<Score className="underVideo" uri="/Late Swallows-dolet-musescore-II.mei" options={{pageWidth:19000, spacingStaff:24, breaks:'none', scale: 36}} scoreAnnotations={annotationsToShow} drawAnnotation={replayAnnotations} ref={(score) => {this.scoreComponent = score}} />
			</div>
				<div className="foot" />
				</div>
		)
	}
}

function mapStateToProps({ graph, score, timesync }) {
	return { graph, score, timesync }
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
		popElements,
		projectAnnotations,
		registerClock,
		setMode,
		showCursorBoxes,
		tickTimedResource,
		traverse,
		setTraversalObjectives,
		checkTraversalObjectives,
		unselectCursor
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Playback);
