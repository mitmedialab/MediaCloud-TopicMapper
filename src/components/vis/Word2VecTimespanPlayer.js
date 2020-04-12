import PropTypes from 'prop-types';
import React from 'react';
import ReactCSSTransitionReplace from 'react-css-transition-replace';
import { Row, Col } from 'react-flexbox-grid/lib';
import { injectIntl } from 'react-intl';
import WordSpace from './WordSpace';
import { PlayButton, PauseButton, NextButton, PreviousButton } from '../common/IconButton';
import { getBrandDarkColor } from '../../styles/colors';
import TimespanDateRange from '../topic/TimespanDateRange';
import TimespanPeriodSelector from '../topic/controlbar/timespans/TimespanPeriodSelector';

const DEFAULT_SLIDESHOW_SPEED = 2000;
const DEFAULT_ENTER_TIMEOUT = 1000;
const DEFAULT_LEAVE_TIMEOUT = 300;
const DEFAULT_WIDTH = 730;
const DEFAULT_HEIGHT = 520;

class Word2VecTimespanPlayer extends React.Component {
  constructor(props) {
    super(props);
    const { initialTimespan } = props;
    const selectedPeriod = initialTimespan.period;
    const initialTimespanId = initialTimespan.timespans_id;

    const currentPeriodList = props.timespanEmbeddings.filter(x => x.timespan.period === selectedPeriod);
    const timespanFilter = element => (element.timespan.timespans_id === initialTimespanId);
    const initialIndex = currentPeriodList.findIndex(timespanFilter);

    const isPlaying = false;

    this.state = { currentTimespanIndex: (initialIndex !== -1) ? initialIndex : 0, currentPeriodList, selectedPeriod, isPlaying };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { timespanEmbeddings, initialTimespan } = this.props;
    // prevent calling set state on unmounted component
    this.pauseSlideShow();
    // Reset timespan to selected timespan of parent component
    const selectedPeriod = nextProps.initialTimespan.period;
    const currentPeriodList = timespanEmbeddings.filter(x => x.timespan.period === selectedPeriod);
    const timespanFilter = element => (element.timespan.timespans_id === initialTimespan.timespans_id);
    const initialIndex = currentPeriodList.findIndex(timespanFilter);
    this.setState(() => ({ selectedPeriod, currentPeriodList, currentTimespanIndex: (initialIndex !== -1) ? initialIndex : 0 }));
  }

  // Slideshow functions
  tick = () => {
    if (this.state.isPlaying && (this.state.currentTimespanIndex < this.state.currentPeriodList.length - 1)) {
      this.setState(prevState => ({ currentTimespanIndex: prevState.currentTimespanIndex + 1 }));
    }
  }

  playSlideShow = (speed) => {
    if (!this.state.isPlaying) {
      this.setState(() => ({ isPlaying: true }));
      this.interval = setInterval(this.tick, speed);
    }
  }

  pauseSlideShow = () => {
    if (this.state.isPlaying) {
      clearInterval(this.interval);
      this.setState(() => ({ isPlaying: false }));
    }
  }

  skipPrevious = () => {
    this.pauseSlideShow();
    if (this.state.currentTimespanIndex > 0) {
      this.setState(prevState => ({ currentTimespanIndex: prevState.currentTimespanIndex - 1 }));
    }
  }

  skipNext = () => {
    this.pauseSlideShow();
    if (this.state.currentTimespanIndex < this.state.currentPeriodList.length - 1) {
      this.setState(prevState => ({ currentTimespanIndex: prevState.currentTimespanIndex + 1 }));
    }
  }

  handlePeriodSelected = (period) => {
    this.pauseSlideShow();
    const currentTimespanIndex = 0;
    const selectedPeriod = period;
    this.setState((prevState, props) => ({ currentPeriodList: props.timespanEmbeddings.filter(x => x.timespan.period === period), currentTimespanIndex, selectedPeriod }));
  };

  render() {
    const { timespanEmbeddings, width, height, xProperty, yProperty, enterTimeout,
      leaveTimeout, slideshowSpeed } = this.props;
    const { currentTimespanIndex, currentPeriodList } = this.state;

    const options = {
      width,
      height,
      xProperty,
      yProperty,
      enterTimeout,
      leaveTimeout,
      slideshowSpeed,
    };

    if (width === undefined) {
      options.width = DEFAULT_WIDTH;
    }
    if (height === undefined) {
      options.height = DEFAULT_HEIGHT;
    }
    if (enterTimeout === undefined) {
      options.enterTimeout = DEFAULT_ENTER_TIMEOUT;
    }
    if (leaveTimeout === undefined) {
      options.leaveTimeout = DEFAULT_LEAVE_TIMEOUT;
    }
    if (slideshowSpeed === undefined) {
      options.slideshowSpeed = DEFAULT_SLIDESHOW_SPEED;
    }
    options.xProperty = xProperty || 'x';
    options.yProperty = yProperty || 'y';

    if ((timespanEmbeddings === undefined) || (timespanEmbeddings === null) || (timespanEmbeddings.length === 0)) {
      return (<div />);
    }

    const currentTimespan = currentPeriodList[currentTimespanIndex].timespan;
    const currentWords = currentPeriodList[currentTimespanIndex].words;

    // overall words used for w2vchart scale
    const overallTimespan = timespanEmbeddings.filter(x => x.timespan.period === 'overall')[0];
    const overallWords = overallTimespan.words;

    let avButtons;
    if (this.state.selectedPeriod === 'overall') {
      avButtons = (<div />);
    } else {
      avButtons = (
        <Col lg={12}>
          <PreviousButton onClick={this.skipPrevious} color={getBrandDarkColor()} />
          <PlayButton onClick={() => this.playSlideShow(options.slideshowSpeed)} color={getBrandDarkColor()} />
          <PauseButton onClick={this.pauseSlideShow} color={getBrandDarkColor()} />
          <NextButton onClick={this.skipNext} color={getBrandDarkColor()} />
        </Col>
      );
    }

    return (
      <div className="w2v-timespan-container">
        <Col lg={12} className="timespan-selector">
          <Row start="lg">
            <Col lg={12}>
              <TimespanPeriodSelector selectedPeriod={this.state.selectedPeriod} onPeriodSelected={this.handlePeriodSelected} />
            </Col>
          </Row>
        </Col>
        <ReactCSSTransitionReplace
          transitionName="fade"
          transitionEnterTimeout={options.enterTimeout}
          transitionLeaveTimeout={options.leaveTimeout}
        >
          <div className="w2v-chart-container" key={currentTimespan.timespans_id}>
            <WordSpace
              words={currentWords}
              scaleWords={overallWords}
              domId="w2v-timespan-slide"
              xProperty={options.xProperty}
              yProperty={options.yProperty}
            />
          </div>
        </ReactCSSTransitionReplace>
        <div className="timespan-av">
          <Row center="lg" className="date-display">
            <Col lg={12}>
              <ReactCSSTransitionReplace
                transitionName="fade"
                transitionEnterTimeout={options.enterTimeout}
                transitionLeaveTimeout={options.leaveTimeout}
              >
                <TimespanDateRange key={currentTimespan.timespans_id} timespan={currentTimespan} />
              </ReactCSSTransitionReplace>
            </Col>
          </Row>
          <Row center="lg" className="av-buttons">
            {avButtons}
          </Row>
        </div>
      </div>
    );
  }
}

Word2VecTimespanPlayer.propTypes = {
  // from parent
  width: PropTypes.number,
  height: PropTypes.number,
  xProperty: PropTypes.string,
  yProperty: PropTypes.string,
  enterTimeout: PropTypes.number,
  leaveTimeout: PropTypes.number,
  slideshowSpeed: PropTypes.number,
  initialTimespan: PropTypes.object.isRequired,
  timespanEmbeddings: PropTypes.array.isRequired,
  // from compositional chain
  intl: PropTypes.object.isRequired,
};

export default injectIntl(Word2VecTimespanPlayer);
