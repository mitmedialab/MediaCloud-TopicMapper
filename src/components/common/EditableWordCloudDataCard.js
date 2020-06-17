import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import * as CSV from 'csv-string';
import { downloadText } from 'download.js';
import Link from 'react-router/lib/Link';
import Divider from '@material-ui/core/Divider';
import Subheader from '@material-ui/core/ListSubheader';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DataCard from './DataCard';
import messages from '../../resources/messages';
import OrderedWordCloud from '../vis/OrderedWordCloud';
import WordCloud from '../vis/WordCloud';
import WordSpace from '../vis/WordSpace';
import { DownloadButton, ExploreButton, EditButton } from './IconButton';
import { getBrandDarkColor } from '../../styles/colors';
import { downloadSvg } from '../util/svg';
import ActionMenu from './ActionMenu';
import { WarningNotice } from './Notice';
import { intlIfObject } from '../../lib/stringUtil';

export const VIEW_1K = 1000;
export const VIEW_10K = 10000;

const VIEW_CLOUD = 'VIEW_CLOUD';
const VIEW_ORDERED = 'VIEW_ORDERED';
const VIEW_GOOGLE_W2V = 'VIEW_GOOGLE_W2V';
const VIEW_TOPIC_W2V = 'VIEW_TOPIC_W2V';

const WORD_SPACE_WORD_LIMIT = 50;

const DEFAULT_DOM_ID = 'topic-word-cloud';

const localMessages = {
  editing: { id: 'wordcloud.editable.editingNotice', defaultMessage: 'You are temporarily editing this word cloud. Click words you want to hide, then use the menu to flip back into view mode and export it to SVG.' },
  edited: { id: 'wordcloud.editable.edited', defaultMessage: 'You have temporarily edited this word cloud to remove some of the words. Your changes will be lost when you leave this page.' },
  modeOrdered: { id: 'wordcloud.editable.mode.ordered', defaultMessage: 'View Ordered Layout (default)' },
  modeCloud: { id: 'wordcloud.editable.mode.unordered', defaultMessage: 'View Cloud Layout' },
  modeTopicW2V: { id: 'wordcloud.editable.mode.topicW2V', defaultMessage: 'View Topic Specific Word2Vec 2D Layout' },
  noTopicW2VData: { id: 'wordcloud.editable.mode.topicW2V.noData', defaultMessage: 'We haven\'t built a model for this topic yet.  If you want to see this chart please email us at support@mediacloud.org an ask us to generate a model for this topic.' },
  modeGoogleW2V: { id: 'wordcloud.editable.mode.googleW2V', defaultMessage: 'View GoogleNews Word2Vec 2D Layout' },
  noGoogleW2VData: { id: 'wordcloud.editable.mode.googleW2V.noData', defaultMessage: 'Sorry, but the Google News word2vec data is missing.' },
  invalidView: { id: 'wordcloud.editable.mode.invalid', defaultMessage: 'Sorry, but an invalid view is selected' },
  downloadWordCSV: { id: 'wordcount.editable.download.wordCsv', defaultMessage: 'Download Sampled Word Frequency CSV' },
  downloadBigramCSV: { id: 'wordcount.editable.download.brigramCsv', defaultMessage: 'Download Sampled Bigram Frequency CSV' },
  downloadTrigramCSV: { id: 'wordcount.editable.download.trigramCsv', defaultMessage: 'Download Sampled Trigram Frequency CSV' },
  sampleSize1k: { id: 'wordcloud.editable.samplesize.onek', defaultMessage: 'Sample 1,000 stories (quick, default)' },
  sampleSize10k: { id: 'wordcloud.editable.samplesize.tenk', defaultMessage: 'Sample 10,000 stories (slower, slightly more accurate)' },
  learnMore: { id: 'wordcloud.editable.samplesize.learnMore', defaultMessage: 'Learn More' },
};

class EditableWordCloudDataCard extends React.Component {
  state = {
    editing: false, // whether you are editing right now or not
    modifiableWords: null, // all the words, including a boolean display property on each
    displayOnlyWords: null, // only the words that are being displayed
    view: VIEW_ORDERED, // which view to show (see view constants above)
  };

  onEditModeClick = (d, node) => {
    const text = node.nodes()[0];
    if (this.state.modifiableWords) {
      const changeWord = this.state.modifiableWords.filter(w => (w.term === text.textContent));
      changeWord[0].display = !changeWord[0].display;
      this.setState(prevState => ({ modifiableWords: [...prevState.modifiableWords] })); // reset this to trigger a re-render
    }
  };

  setView = (nextView) => {
    this.setState({ view: nextView });
  }

  goToBlog = () => {
    window.location = '';
  }

  isShowingAllWords = () => (this.state.modifiableWords.length === this.state.displayOnlyWords.length);

  toggleEditing = () => {
    const { words } = this.props;
    // initialize copy of words so we have the display tag set
    if (this.state.modifiableWords == null) {
      const initializeDisplayOfWords = words.map(w => ({ ...w, display: true }));
      const initializeDisplayOnlyWords = words.map(w => ({ ...w, display: true }));
      this.setState({ modifiableWords: initializeDisplayOfWords, displayOnlyWords: initializeDisplayOnlyWords });
    }
    // after initialization if not editing, filter words that say 'don't display'
    if (this.state.modifiableWords != null && this.state.editing) {
      const { modifiableWords } = this.state;
      const displayOnlyWords = modifiableWords.filter(w => w.display === true);
      this.setState({ displayOnlyWords });
    }
    this.setState(prevState => ({ editing: !prevState.editing }));
  };

  downloadCsv = (ngramSize) => {
    const { downloadUrl, onDownload, words } = this.props;
    const sampleSize = this.props.initSampleSize;
    if (onDownload) {
      onDownload(ngramSize, sampleSize, words);
    } else {
      let url = downloadUrl;
      // be smart about tacking on hte ngram size requested automatically here
      if (ngramSize) {
        if (url.indexOf('?') !== -1) {
          url = `${url}&ngramSize=${ngramSize}`;
        } else {
          url = `${url}?ngramSize=${ngramSize}`;
        }
      }
      if (sampleSize) {
        if (url.indexOf('?') !== -1) {
          url = `${url}&sampleSize=${sampleSize}`;
        } else {
          url = `${url}?sampleSize=${sampleSize}`;
        }
      }
      window.location = url;
    }
  };

  buildActionMenu = (uniqueDomId) => {
    const { includeTopicWord2Vec, hideGoogleWord2Vec, actionMenuHeaderText, actionsAsLinksUnderneath, svgDownloadPrefix, onViewSampleSizeClick, initSampleSize, extraActionMenu } = this.props;
    const { formatMessage } = this.props.intl;
    let wcChoice = <FormattedMessage {...messages.editWordCloud} />;
    if (this.state.editing) {
      wcChoice = <FormattedMessage {...messages.viewWordCloud} />;
    }
    const actionMenuSubHeaderContent = actionMenuHeaderText ? <Subheader>{actionMenuHeaderText}</Subheader> : null;
    const sampleSizeOptions = [
      <MenuItem
        className="action-icon-menu-item"
        disabled={initSampleSize === VIEW_1K}
        onClick={() => onViewSampleSizeClick(VIEW_1K)}
      >
        <FormattedMessage {...localMessages.sampleSize1k} />
      </MenuItem>,
      <MenuItem
        className="action-icon-menu-item"
        disabled={initSampleSize === VIEW_10K}
        onClick={() => onViewSampleSizeClick(VIEW_10K)}
      >
        <FormattedMessage {...localMessages.sampleSize10k} />
      </MenuItem>,
      <Divider />,
      <MenuItem
        className="action-icon-menu-item"
        onClick={this.goToBlog}
      >
        <FormattedMessage {...localMessages.learnMore} />
      </MenuItem>,
    ];
    const viewOptions = [
      <MenuItem
        className="action-icon-menu-item"
        disabled={this.state.editing || this.state.view === VIEW_ORDERED}
        onClick={() => this.setView(VIEW_ORDERED)}
      >
        <FormattedMessage {...localMessages.modeOrdered} />
      </MenuItem>,
      <MenuItem
        className="action-icon-menu-item"
        disabled={this.state.editing || this.state.view === VIEW_CLOUD}
        onClick={() => this.setView(VIEW_CLOUD)}
      >
        <FormattedMessage {...localMessages.modeCloud} />
      </MenuItem>,
      includeTopicWord2Vec ? (
        <MenuItem
          className="action-icon-menu-item"
          disabled={this.state.editing || this.state.view === VIEW_TOPIC_W2V}
          onClick={() => this.setView(VIEW_TOPIC_W2V)}
        >
          {formatMessage(localMessages.modeTopicW2V)}
        </MenuItem>
      ) : null,
      hideGoogleWord2Vec !== true ? (
        <MenuItem
          className="action-icon-menu-item"
          disabled={this.state.editing || this.state.view === VIEW_GOOGLE_W2V}
          onClick={() => this.setView(VIEW_GOOGLE_W2V)}
        >
          <FormattedMessage {...localMessages.modeGoogleW2V} />
        </MenuItem>
      ) : null,
      <Divider />,
      <MenuItem
        className="action-icon-menu-item"
        disabled={this.state.view !== VIEW_ORDERED} // can only edit in ordered mode
        onClick={this.toggleEditing}
      >
        <ListItemText>{wcChoice}</ListItemText>
        {(this.state.view === VIEW_ORDERED) ? <ListItemIcon><EditButton /></ListItemIcon> : ''}
      </MenuItem>,
    ];
    const downloadOptions = [
      <MenuItem
        className="action-icon-menu-item"
        disabled={this.state.editing} // can't download until done editing
        onClick={() => this.downloadCsv(1)}
      >
        <ListItemText><FormattedMessage {...localMessages.downloadWordCSV} /></ListItemText>
        <ListItemIcon>
          <DownloadButton />
        </ListItemIcon>
      </MenuItem>,
      <MenuItem
        className="action-icon-menu-item"
        disabled={this.state.editing} // can't download until done editing
        onClick={() => this.downloadCsv(2)}
      >
        <ListItemText><FormattedMessage {...localMessages.downloadBigramCSV} /></ListItemText>
        <ListItemIcon>
          <DownloadButton />
        </ListItemIcon>
      </MenuItem>,
      <MenuItem
        className="action-icon-menu-item"
        disabled={this.state.editing} // can't download until done editing
        onClick={() => this.downloadCsv(3)}
      >
        <FormattedMessage {...localMessages.downloadTrigramCSV} />
      </MenuItem>,
      <MenuItem
        className="action-icon-menu-item"
        disabled={this.state.editing} // can't download until done editing
        onClick={() => {
          let domIdOrElement;
          if (this.state.ordered) { // tricky to get the correct element to serialize
            domIdOrElement = uniqueDomId;
          } else {
            const svgChild = document.getElementById(uniqueDomId);
            domIdOrElement = svgChild.firstChild;
          }
          const filename = svgDownloadPrefix || 'word-cloud';
          downloadSvg(filename, domIdOrElement);
        }}
      >
        <ListItemText><FormattedMessage {...messages.downloadSVG} /></ListItemText>
        <ListItemIcon>
          <DownloadButton />
        </ListItemIcon>
      </MenuItem>,
    ];
    // now build the menu options as appropriate
    let actionMenuContent;
    if (actionsAsLinksUnderneath) {
      actionMenuContent = (
        <div className="action-menu-set">
          {extraActionMenu}
          <ActionMenu actionTextMsg={messages.viewSampleOptions}>
            {actionMenuSubHeaderContent}
            {sampleSizeOptions}
          </ActionMenu>
          <ActionMenu actionTextMsg={messages.viewOptions}>
            {actionMenuSubHeaderContent}
            {viewOptions}
          </ActionMenu>
          <ActionMenu actionTextMsg={messages.downloadOptions}>
            {actionMenuSubHeaderContent}
            {downloadOptions}
          </ActionMenu>
        </div>
      );
    } else {
      actionMenuContent = (
        <ActionMenu>
          {actionMenuSubHeaderContent}
          {viewOptions}
          <Divider />
          {downloadOptions}
          <Divider />
          {sampleSizeOptions}
        </ActionMenu>
      );
    }
    return actionMenuContent;
  }

  buildHeaderContent = () => {
    const { title, explore, helpButton, subtitleContent, intl } = this.props;
    let titleContent = intlIfObject(intl.formatMessage, title);
    if (explore) {
      titleContent = (
        <Link to={explore}>
          {title}
        </Link>
      );
    }
    let headerContent;
    if (title) {
      headerContent = (
        <h2>
          {titleContent}
          {helpButton}
          {subtitleContent}
        </h2>
      );
    }
    return headerContent;
  }

  render() {
    const { words, explore, onViewModeClick, width, height, maxFontSize, minFontSize, domId, actionsAsLinksUnderneath,
      subHeaderContent, textAndLinkColor, textColor, linkColor, border, selectedTerm, showTooltips } = this.props;
    let className = 'editable-word-cloud-datacard';
    let wordClickHandler = onViewModeClick;
    const tColor = textAndLinkColor || textColor || getBrandDarkColor();
    const lColor = textAndLinkColor || linkColor || getBrandDarkColor();
    let wordsArray = words.map(w => ({ ...w, display: true }));
    let editingWarning;
    const uniqueDomId = `${domId || DEFAULT_DOM_ID}-${(this.state.ordered ? 'ordered' : 'unordered')}`; // add mode to it so ordered or not works
    if (this.state.editing && this.state.modifiableWords) {
      wordClickHandler = this.onEditModeClick;
      className += ' editing';
      wordsArray = this.state.modifiableWords;
      editingWarning = (<WarningNotice><FormattedHTMLMessage {...localMessages.editing} /></WarningNotice>);
    } else if (!this.state.editing && this.state.displayOnlyWords) {
      wordClickHandler = onViewModeClick;
      wordsArray = this.state.displayOnlyWords;
      if (!this.isShowingAllWords()) {
        editingWarning = (<WarningNotice><FormattedHTMLMessage {...localMessages.edited} /></WarningNotice>);
      }
    }

    const headerContent = this.buildHeaderContent();

    // set up rendered cloud as appropriate
    let cloudContent;
    switch (this.state.view) {
      case VIEW_ORDERED:
        cloudContent = (
          <OrderedWordCloud
            words={wordsArray}
            textColor={tColor}
            linkColor={lColor}
            width={width}
            height={height}
            maxFontSize={maxFontSize}
            minFontSize={minFontSize}
            onWordClick={wordClickHandler}
            domId={uniqueDomId}
            selectedTerm={selectedTerm}
            showTooltips={showTooltips}
          />
        );
        break;
      case VIEW_CLOUD:
        cloudContent = (
          <WordCloud
            words={wordsArray}
            textColor={tColor}
            linkColor={lColor}
            width={width}
            height={height}
            maxFontSize={maxFontSize}
            minFontSize={minFontSize}
            onWordClick={wordClickHandler}
            domId={uniqueDomId}
            showTooltips={showTooltips}
          />
        );
        break;
      case VIEW_GOOGLE_W2V:
        cloudContent = (
          <WordSpace
            words={wordsArray.slice(0, WORD_SPACE_WORD_LIMIT)} // can't draw too many as it gets unreadable
            domId={uniqueDomId}
            width={width}
            height={height}
            xProperty="google_w2v_x"
            yProperty="google_w2v_y"
            noDataMsg={localMessages.noGoogleW2VData}
          />
        );
        break;
      case VIEW_TOPIC_W2V:
        cloudContent = (
          <WordSpace
            words={wordsArray.slice(0, WORD_SPACE_WORD_LIMIT)} // can't draw too many as it gets unreadable
            domId={uniqueDomId}
            width={width}
            height={height}
            xProperty="w2v_x"
            yProperty="w2v_y"
            noDataMsg={localMessages.noTopicW2VData}
          />
        );
        break;
      default:
        cloudContent = (<FormattedMessage {...localMessages.invalidView} />);
        break;
    }

    const exploreButton = explore ? (<ExploreButton linkTo={explore} />) : null;

    const actionMenu = this.buildActionMenu(uniqueDomId);

    return (
      <DataCard className={className} border={(border === true) || (border === undefined)}>
        <div className="actions">
          {exploreButton}
          {!actionsAsLinksUnderneath && actionMenu}
        </div>

        {headerContent}
        {subHeaderContent}
        {editingWarning}
        {cloudContent}
        {actionsAsLinksUnderneath && actionMenu}
      </DataCard>
    );
  }
}

EditableWordCloudDataCard.propTypes = {
  // from parent
  width: PropTypes.number,
  height: PropTypes.number,
  maxFontSize: PropTypes.number,
  minFontSize: PropTypes.number,
  border: PropTypes.bool,
  textAndLinkColor: PropTypes.string, // render the words in this color (instead of the brand dark color)
  textColor: PropTypes.string,
  linkColor: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), // rendered as an H2 inside the DataCard
  words: PropTypes.array.isRequired,
  selectedTerm: PropTypes.string,
  downloadUrl: PropTypes.string, // used as the base for downloads, ngramSize appended for bigram/trigram download
  onDownload: PropTypes.func, // if you want to handle the download request yourself, pass in a function (overrides downloadUrl)
  svgDownloadPrefix: PropTypes.string, // for naming the SVG download file
  explore: PropTypes.oneOfType([PropTypes.object, PropTypes.string]), // show an exlore button and link it to this URL
  helpButton: PropTypes.node, // pass in a helpButton to render to the right of the H2 title
  subtitleContent: PropTypes.object, // shows up to the right of the H2 title
  extraActionMenu: PropTypes.node, // shows up to the left of all the other action menus on the bottom of the datacard
  subHeaderContent: PropTypes.object, // shows up under the H2 title, above the word cloud
  actionMenuHeaderText: PropTypes.string, // text to put as a subheader in the action menu popup
  includeTopicWord2Vec: PropTypes.bool, // show an option to draw a word2vec map basde on w2v_x / w2v_y from topic-specific model
  hideGoogleWord2Vec: PropTypes.bool, // show an option to draw a word2vec map basde on w2v_x / w2v_y from GoogleNews model
  onViewModeClick: PropTypes.func.isRequired,
  showTooltips: PropTypes.bool,
  onViewSampleSizeClick: PropTypes.func,
  initSampleSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  actionsAsLinksUnderneath: PropTypes.bool, // show the actions as links under the viz (ie. in a SummarizedVisualization card)
  domId: PropTypes.string, // unique dom id needed to support CSV downloading
  // from compositional chain
  intl: PropTypes.object.isRequired,
};


export default
injectIntl(
  connect(null)(
    EditableWordCloudDataCard
  )
);

export const downloadData = (filename, data, sampleSize) => {
  const headers = ['count', 'term', 'stem', 'sample-size'];
  const dataAsRows = data.map(item => [item.count, item.term, item.stem, sampleSize || '']);
  const csvStr = CSV.stringify([headers, ...dataAsRows]);
  downloadText(filename, csvStr);
};
