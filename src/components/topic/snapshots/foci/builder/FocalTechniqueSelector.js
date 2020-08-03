import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { reduxForm, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid/lib';
import KeywordSearchIcon from '../../../../common/icons/KeywordSearchIcon';
import FocalTechniqueDescription from './FocalTechniqueDescription';
import { FOCAL_TECHNIQUE_BOOLEAN_QUERY, FOCAL_TECHNIQUE_RETWEET_PARTISANSHIP_2016, FOCAL_TECHNIQUE_TWEET_PARTISANSHIP_2020, FOCAL_TECHNIQUE_TOP_COUNTRIES, FOCAL_TECHNIQUE_NYT_THEME, FOCAL_TECHNIQUE_MEDIA_TYPE }
  from '../../../../../lib/focalTechniques';

const localMessages = {
  about: { id: 'focus.techniquePicker.about',
    defaultMessage: 'You can build a Subtopic using a variety of Techniques; pick the one that best matches your awareness of the content and goals. You can\'t change this later.' },
  searchByKeywordName: { id: 'focus.technique.keyword.name', defaultMessage: 'Search' },
  searchByKeywordDescription: { id: 'focus.technique.keyword.description',
    defaultMessage: 'When you know a lot about the coverage, or have some hypotheses to test, you can define a Subtopic by specifying a boolean query.' },
  partisanshipName2016: { id: 'focus.technique.partisanship.2016.name', defaultMessage: 'US Audience Partisanship 2016' },
  partisanshipDescription2016: { id: 'focus.technique.partisanship.2016.description',
    defaultMessage: 'TBD!!! When you want to slice your topic by U.S. audience partisanship, as determined by each media source\'s ratio of twitter shares by liberal vs. conservative tweeters.' },
  partisanshipName2020: { id: 'focus.technique.partisanship.2020.name', defaultMessage: 'US Audience Partisanship 2020' },
  partisanshipDescription2020: { id: 'focus.technique.partisanship.2020.description',
    defaultMessage: 'TBD!!! When you want to slice your topic by U.S. audience partisanship, as determined by each media source\'s ratio of twitter shares by liberal vs. conservative tweeters.' },
  mediaTypeName: { id: 'focus.technique.mediaType.name', defaultMessage: 'Media Type' },
  mediaTypeDescription: { id: 'focus.technique.mediaType.description', defaultMessage: 'When you want to compare coverage of your topic by different types of media sources (broadcast, online, etc).' },
  topCountriesName: { id: 'focus.technique.topCountries.name', defaultMessage: 'Top Countries' },
  topCountriesDescription: { id: 'focus.technique.topCountries.description', defaultMessage: 'When you want to compare coverage of different countries within your Topic.' },
  themeName: { id: 'focus.technique.theme.name', defaultMessage: 'Top Themes' },
  themeDescription: { id: 'focus.technique.theme.description', defaultMessage: 'When you want to compare coverage of different themes within your Topic, as labelled by our theme detector.' },
  referenceName: { id: 'focus.technique.reference.name', defaultMessage: 'Upload Representative Articles' },
  referenceDescription: { id: 'focus.technique.reference.description',
    defaultMessage: 'When you have a list of stories that you think define a Subtopic, you can upload that list and we\'ll use it to identify similar articles within this Subtopic.' },
  automagicName: { id: 'focus.technique.automagic.name', defaultMessage: 'Auto-Magic' },
  automagicDescription: { id: 'focus.technique.automagic.description',
    defaultMessage: 'When you aren\'t sure what is going on, we can use an algorithm to detect communities of sub-conversations within the Topic for you, creating a Subtopic for each.' },
};

const formSelector = formValueSelector('snapshotFocus');

class FocalTechniqueSelector extends React.Component {
  handleSelection = (focalTechniqueName) => {
    const { change } = this.props;
    change('focalTechnique', focalTechniqueName);
  }

  render() {
    const { currentFocalTechnique } = this.props;
    return (
      <div className="focal-technique-selector">
        <Row>
          <Col lg={3}>
            <FocalTechniqueDescription
              onClick={() => this.handleSelection(FOCAL_TECHNIQUE_BOOLEAN_QUERY)}
              selected={currentFocalTechnique === FOCAL_TECHNIQUE_BOOLEAN_QUERY}
              id="technique-boolean-query"
              icon={KeywordSearchIcon}
              nameMsg={localMessages.searchByKeywordName}
              descriptionMsg={localMessages.searchByKeywordDescription}
            />
          </Col>
          <Col lg={3}>
            <FocalTechniqueDescription
              onClick={() => this.handleSelection(FOCAL_TECHNIQUE_TWEET_PARTISANSHIP_2020)}
              selected={currentFocalTechnique === FOCAL_TECHNIQUE_TWEET_PARTISANSHIP_2020}
              id="partisanship-2020"
              icon={KeywordSearchIcon}
              nameMsg={localMessages.partisanshipName2020}
              descriptionMsg={localMessages.partisanshipDescription2020}
            />
          </Col>
          <Col lg={3}>
            <FocalTechniqueDescription
              onClick={() => this.handleSelection(FOCAL_TECHNIQUE_RETWEET_PARTISANSHIP_2016)}
              selected={currentFocalTechnique === FOCAL_TECHNIQUE_RETWEET_PARTISANSHIP_2016}
              id="partisanship-2016"
              icon={KeywordSearchIcon}
              nameMsg={localMessages.partisanshipName2016}
              descriptionMsg={localMessages.partisanshipDescription2016}
            />
          </Col>
          <Col lg={3}>
            <p className="light"><i><FormattedMessage {...localMessages.about} /></i></p>
          </Col>
        </Row>
        <Row>
          <Col lg={3}>
            <FocalTechniqueDescription
              onClick={() => this.handleSelection(FOCAL_TECHNIQUE_TOP_COUNTRIES)}
              selected={currentFocalTechnique === FOCAL_TECHNIQUE_TOP_COUNTRIES}
              id="technique-top-countries"
              icon={KeywordSearchIcon}
              nameMsg={localMessages.topCountriesName}
              descriptionMsg={localMessages.topCountriesDescription}
            />
          </Col>
          <Col lg={3}>
            <FocalTechniqueDescription
              onClick={() => this.handleSelection(FOCAL_TECHNIQUE_NYT_THEME)}
              selected={currentFocalTechnique === FOCAL_TECHNIQUE_NYT_THEME}
              id="technique-nyt-themes"
              icon={KeywordSearchIcon}
              nameMsg={localMessages.themeName}
              descriptionMsg={localMessages.themeDescription}
            />
          </Col>
          <Col lg={3}>
            <FocalTechniqueDescription
              onClick={() => this.handleSelection(FOCAL_TECHNIQUE_MEDIA_TYPE)}
              selected={currentFocalTechnique === FOCAL_TECHNIQUE_MEDIA_TYPE}
              id="technique-media-type"
              icon={KeywordSearchIcon}
              nameMsg={localMessages.mediaTypeName}
              descriptionMsg={localMessages.mediaTypeDescription}
            />
          </Col>
          {
          /*
          <Col lg={2} md={2} sm={3} xs={6}>
            <FocalTechniqueDescription
              onClick={() => this.handleSelection(FOCAL_TECHNIQUE_REFERENCE_SET)}
              selected={currentFocalTechnique === FOCAL_TECHNIQUE_REFERENCE_SET}
              id="technique-reference-set-upload"
              image={assetUrl('/static/img/focal-technique-reference-2x.png')}
              nameMsg={localMessages.referenceName}
              descriptionMsg={localMessages.referenceDescription}
              disabled
              comingSoon
            />
          </Col>
          <Col lg={2} md={2} sm={3} xs={6}>
            <FocalTechniqueDescription
              onClick={() => this.handleSelection(FOCAL_TECHNIQUE_AUTO_MAGIC)}
              selected={currentFocalTechnique === FOCAL_TECHNIQUE_AUTO_MAGIC}
              id="technique-autoMagic-community-detection"
              image={assetUrl('/static/img/focal-technique-automagic-2x.png')}
              nameMsg={localMessages.automagicName}
              descriptionMsg={localMessages.automagicDescription}
              disabled
              comingSoon
            />
          </Col>
          */ }
        </Row>
      </div>
    );
  }
}

FocalTechniqueSelector.propTypes = {
  // from parent
  // from componsition chain
  intl: PropTypes.object.isRequired,
  change: PropTypes.func.isRequired,
  // from state
  currentFocalTechnique: PropTypes.string,
};

const mapStateToProps = state => ({
  // pull the focal set id out of the form so we know when to show the focal set create sub form
  currentFocalTechnique: formSelector(state, 'focalTechnique'),
});

function validate() {
  const errors = {};
  return errors;
}

const reduxFormConfig = {
  form: 'snapshotFocus', // make sure this matches the sub-components and other wizard steps
  destroyOnUnmount: false, // so the wizard works
  validate,
};


export default
injectIntl(
  reduxForm(reduxFormConfig)(
    connect(mapStateToProps)(
      FocalTechniqueSelector
    )
  )
);
