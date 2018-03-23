import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from 'material-ui/MenuItem';
import Link from 'react-router/lib/Link';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import DataCard from './DataCard';
import messages from '../../resources/messages';
import OrderedWordCloud from '../vis/OrderedWordCloud';
import WordCloud from '../vis/WordCloud';
import Word2VecChart from '../vis/Word2VecChart';
import { DownloadButton, ExploreButton, EditButton } from './IconButton';
import { getBrandDarkColor } from '../../styles/colors';
import { downloadSvg } from '../util/svg';
import ActionMenu from './ActionMenu';
import { WarningNotice } from '../common/Notice';

const VIEW_CLOUD = 'VIEW_CLOUD';
const VIEW_ORDERED = 'VIEW_ORDERED';
const VIEW_GOOGLE_W2V = 'VIEW_GOOGLE_W2V';
const VIEW_TOPIC_W2V = 'VIEW_TOPIC_W2V';

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
  downloadWordCSV: { id: 'wordcount.editable.download.wordCsv', defaultMessage: 'Download Word Frequency CSV' },
  downloadBigramCSV: { id: 'wordcount.editable.download.brigramCsv', defaultMessage: 'Download Bigram Frequency CSV' },
  downloadTrigramCSV: { id: 'wordcount.editable.download.trigramCsv', defaultMessage: 'Download Trigram Frequency CSV' },
};

class EditableWordCloudDataCard extends React.Component {

  state = {
    editing: false,   // whether you are editing right now or not
    modifiableWords: null, // all the words, including a boolean display property on each
    displayOnlyWords: null, // only the words that are being displayed
    view: VIEW_ORDERED, // which view to show (see view constants above)
  };

  onEditModeClick = (d, node) => {
    const text = node.nodes()[0];
    if (this.state.modifiableWords) {
      const changeWord = this.state.modifiableWords.filter(w => (w.term === text.textContent));
      changeWord[0].display = !changeWord[0].display;
      this.setState({ modifiableWords: [...this.state.modifiableWords] });  // reset this to trigger a re-render
    }
  };

  setView = (nextView) => {
    this.setState({ view: nextView });
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
      const displayOnlyWords = this.state.modifiableWords.filter(w => w.display === true);
      this.setState({ displayOnlyWords });
    }
    this.setState({ editing: !this.state.editing });
  };

  downloadCsv = (ngramSize) => {
    const { downloadUrl, onDownload } = this.props;
    if (onDownload) {
      onDownload(ngramSize);
    } else {
      let url = downloadUrl;
      // be smart about tacking on hte ngram size requested automatically here
      if (ngramSize) {
        if (url.indexOf('?') !== -1) {
          url = `${url}&ngram_size=${ngramSize}`;
        } else {
          url = `${url}?ngram_size=${ngramSize}`;
        }
      }
      window.location = url;
    }
  };

  buildActionMenu = (uniqueDomId) => {
    const { includeTopicWord2Vec, hideGoogleWord2Vec, actionMenuHeaderText, actionsAsLinksUnderneath, svgDownloadPrefix } = this.props;
    const { formatMessage } = this.props.intl;
    let topicWord2VecMenuItem;
    if (includeTopicWord2Vec === true) {
      topicWord2VecMenuItem = (
        <MenuItem
          className="action-icon-menu-item"
          primaryText={formatMessage(localMessages.modeTopicW2V)}
          disabled={this.state.editing || this.state.view === VIEW_TOPIC_W2V}
          onTouchTap={() => this.setView(VIEW_TOPIC_W2V)}
        />
      );
    }
    let googleWord2VecMenuItem;
    if (hideGoogleWord2Vec !== true) {
      googleWord2VecMenuItem = (
        <MenuItem
          className="action-icon-menu-item"
          primaryText={formatMessage(localMessages.modeGoogleW2V)}
          disabled={this.state.editing || this.state.view === VIEW_GOOGLE_W2V}
          onTouchTap={() => this.setView(VIEW_GOOGLE_W2V)}
        />
      );
    }
    const actionMenuSubHeaderContent = actionMenuHeaderText ? <Subheader>{actionMenuHeaderText}</Subheader> : null;
    const viewOptions = (
      <span>
        <MenuItem
          className="action-icon-menu-item"
          primaryText={formatMessage(localMessages.modeOrdered)}
          disabled={this.state.editing || this.state.view === VIEW_ORDERED}
          onTouchTap={() => this.setView(VIEW_ORDERED)}
        />
        <MenuItem
          className="action-icon-menu-item"
          primaryText={formatMessage(localMessages.modeCloud)}
          disabled={this.state.editing || this.state.view === VIEW_CLOUD}
          onTouchTap={() => this.setView(VIEW_CLOUD)}
        />
        {topicWord2VecMenuItem}
        {googleWord2VecMenuItem}
        <Divider />
        <MenuItem
          className="action-icon-menu-item"
          primaryText={formatMessage(this.state.editing ? messages.viewWordCloud : messages.editWordCloud)}
          rightIcon={(this.state.view === VIEW_ORDERED) ? <EditButton /> : undefined}
          disabled={this.state.view !== VIEW_ORDERED} // can only edit in ordered mode
          onTouchTap={this.toggleEditing}
        />
      </span>
    );
    const downloadOptions = (
      <span>
        <MenuItem
          className="action-icon-menu-item"
          primaryText={formatMessage(localMessages.downloadWordCSV)}
          rightIcon={<DownloadButton />}
          disabled={this.state.editing} // can't download until done editing
          onTouchTap={() => this.downloadCsv(1)}
        />
        <MenuItem
          className="action-icon-menu-item"
          primaryText={formatMessage(localMessages.downloadBigramCSV)}
          rightIcon={<DownloadButton />}
          disabled={this.state.editing} // can't download until done editing
          onTouchTap={() => this.downloadCsv(2)}
        />
        <MenuItem
          className="action-icon-menu-item"
          primaryText={formatMessage(localMessages.downloadTrigramCSV)}
          rightIcon={<DownloadButton />}
          disabled={this.state.editing} // can't download until done editing
          onTouchTap={() => this.downloadCsv(3)}
        />
        <MenuItem
          className="action-icon-menu-item"
          primaryText={formatMessage(messages.downloadSVG)}
          rightIcon={<DownloadButton />}
          disabled={this.state.editing} // can't download until done editing
          onTouchTap={() => {
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
        />
      </span>
    );
    // now build the menu options as appropriate
    let actionMenuContent;
    if (actionsAsLinksUnderneath) {
      actionMenuContent = (
        <div className="action-menu-set">
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
        </ActionMenu>
      );
    }
    return actionMenuContent;
  }

  buildHeaderContent = () => {
    const { title, explore, helpButton, subtitleContent } = this.props;
    let titleContent = title;
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
      subHeaderContent, textAndLinkColor, border } = this.props;
    let className = 'editable-word-cloud-datacard';
    let editingClickHandler = onViewModeClick; // default from parent container
    const textColor = textAndLinkColor || getBrandDarkColor();
    let wordsArray = words.map(w => ({ ...w, display: true }));
    let editingWarning;
    const uniqueDomId = `${domId}-${(this.state.ordered ? 'ordered' : 'unordered')}`; // add mode to it so ordered or not works
    if (this.state.editing && this.state.modifiableWords) {
      editingClickHandler = this.onEditModeClick;
      className += ' editing';
      wordsArray = this.state.modifiableWords;
      editingWarning = (<WarningNotice><FormattedHTMLMessage {...localMessages.editing} /></WarningNotice>);
    } else if (!this.state.editing && this.state.displayOnlyWords) {
      editingClickHandler = onViewModeClick;
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
            textColor={textColor}
            linkColor={textColor}
            width={width}
            height={height}
            maxFontSize={maxFontSize}
            minFontSize={minFontSize}
            onWordClick={editingClickHandler}
            domId={uniqueDomId}
          />
        );
        break;
      case VIEW_CLOUD:
        cloudContent = (
          <WordCloud
            words={wordsArray}
            textColor={textColor}
            linkColor={textColor}
            width={width}
            height={height}
            maxFontSize={maxFontSize}
            minFontSize={minFontSize}
            onWordClick={editingClickHandler}
            domId={uniqueDomId}
          />
        );
        break;
      case VIEW_GOOGLE_W2V:
        cloudContent = (
          <Word2VecChart
            words={wordsArray.slice(0, 100)}  // can't draw too many as it gets unreadable
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
          <Word2VecChart
            words={wordsArray.slice(0, 100)}  // can't draw too many as it gets unreadable
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
  textAndLinkColor: PropTypes.string,     // render the words in this color (instead of the brand dark color)
  title: PropTypes.string,     // rendered as an H2 inside the DataCard
  words: PropTypes.array.isRequired,
  downloadUrl: PropTypes.string,          // used as the base for downloads, ngram_size appended for bigram/trigram download
  onDownload: PropTypes.func,             // if you want to handle the download request yourself, pass in a function (overrides downloadUrl)
  svgDownloadPrefix: PropTypes.string,    // for naming the SVG download file
  explore: PropTypes.object,              // show an exlore button and link it to this URL
  helpButton: PropTypes.node,             // pass in a helpButton to render to the right of the H2 title
  subtitleContent: PropTypes.object,      // shows up to the right of the H2 title
  subHeaderContent: PropTypes.object,     // shows up under the H2 title, above the word cloud
  actionMenuHeaderText: PropTypes.string, // text to put as a subheader in the action menu popup
  includeTopicWord2Vec: PropTypes.bool,   // show an option to draw a word2vec map basde on w2v_x / w2v_y from topic-specific model
  hideGoogleWord2Vec: PropTypes.bool,        // show an option to draw a word2vec map basde on w2v_x / w2v_y from GoogleNews model
  onViewModeClick: PropTypes.func.isRequired, // word click in View versus Edit Mode
  actionsAsLinksUnderneath: PropTypes.bool, // show the actions as links under the viz (ie. in a SummarizedVisualization card)
  domId: PropTypes.string.isRequired,     // unique dom id needed to support CSV downloading
  // from compositional chain
  intl: PropTypes.object.isRequired,
};


export default
  injectIntl(
    connect(null)(
      EditableWordCloudDataCard
    )
  );
