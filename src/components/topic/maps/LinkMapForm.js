import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Sigma, RelativeSize, LoadGEXF, ForceAtlas2, RandomizeNodePositions } from 'react-sigma';
import { Row, Col } from 'react-flexbox-grid/lib';
import MenuItem from '@material-ui/core/MenuItem';
import AppButton from '../../common/AppButton';
import withIntlForm from '../../common/hocs/IntlForm';
import { generateParamStr } from '../../../lib/apiUtil';

export const NEW_FOCAL_SET_PLACEHOLDER_ID = -1;

const localMessages = {
  describeLinkMap: { id: 'linkmap.describe.about', defaultMessage: 'Link Map' },
  describeFocalSet: { id: 'linkmap.describe', defaultMessage: ' link map' },
  colorBy: { id: 'linkmap.colorby', defaultMessage: 'Color By' },
  partisanCode: { id: 'linkmap.colorby.partisan', defaultMessage: 'Partisan Code' },
  partisanRetweet: { id: 'linkmap.colorby.partisanRetweet', defaultMessage: 'Partisan Retweet' },
  mediaType: { id: 'linkmap.colorby.media', defaultMessage: 'Media Type' },
  media: { id: 'linkmap.media', defaultMessage: 'Numbe of Top Media to Include' },
  weightEdges: { id: 'linkmap.weightEdges', defaultMessage: 'Weight Edges' },
  outlinks: { id: 'linkmap.outlinks', defaultMessage: 'Outlinks per Media to Include' },
  outlinksHint: { id: 'linkmap.outlinks.hint', defaultMessage: 'how many?' },
  errorNameYourFocus: { id: 'linkmap.error.noName', defaultMessage: 'You need to name your Focus.' },
};

const formSelector = formValueSelector('linkMap');

const LinkMapForm = (props) => {
  const { renderTextField, renderSelect, renderCheckbox, topicId, showMap, filters, fieldParams, downloadLabel, viewLabel, initialValues, submitting, handleSubmit, onGetMapData, onViewMapData } = props;
  const { formatMessage } = props.intl;

  let sigmaElement = null;

  if (showMap) {
    const params = generateParamStr({ ...filters });
    const fParams = generateParamStr({ ...fieldParams });
    const url = `/api/topics/${topicId}/map-files/fetchCustomMap?${params}&${fParams}`;
    sigmaElement = (
      <div className="link-map-sigma">
        <Sigma
          renderer="webgl"
          style={{ width: '1200px', height: '600px' }}
          settings={{ drawEdges: true, nodeColor: '#222222', defaultNodeColor: '#000', defaultLabelColor: '#222', defaultEdgeColor: '#eeeeee', edgeColor: '#eeeeee', scalingMode: 'outside' }}
        >
          <LoadGEXF path={url}>
            <RandomizeNodePositions>
              <ForceAtlas2 scalingRatio={5000} barnesHutOptimize barnesHutTheta={0.6} iterationsPerRender={3} />
              <RelativeSize initialSize={8} />
            </RandomizeNodePositions>
          </LoadGEXF>
        </Sigma>
      </div>
    );
  }
  // if they pick "make a new focal set" then let them enter name and description
  return (
    <form className="app-form link-map-form" name="linkMapForm" onSubmit={handleSubmit(onGetMapData.bind(this))}>
      <Row>
        <Col lg={3} xs={12}>
          <Field
            name="color_field"
            values={initialValues.color_field}
            component={renderSelect}
            label={formatMessage(localMessages.colorBy)}
          >
            <MenuItem
              key={0}
              value={'partisan_code'}
            >
              <FormattedMessage {...localMessages.partisanCode} />
            </MenuItem>
            <MenuItem
              key={1}
              value={'media_type'}
            >
              <FormattedMessage {...localMessages.mediaType} />
            </MenuItem>
            <MenuItem
              key={2}
              value={'partisan_retweet'}
            >
              <FormattedMessage {...localMessages.partisanRetweet} />
            </MenuItem>
          </Field>
        </Col>
        <Col lg={3} xs={12}>
          <Field
            values={initialValues.media}
            name="num_media"
            component={renderTextField}
            label={formatMessage(localMessages.media)}
          />
        </Col>
        <Col lg={3} xs={12} className="checkbox-top-align">
          <Field
            style={{ marginTop: 30 }}
            name="include_weights"
            initialValues={initialValues.include_weights}
            component={renderCheckbox}
            label={formatMessage(localMessages.weightEdges)}
          />
        </Col>
        <Col lg={3} xs={12}>
          <Field
            name="num_links_per_medium"
            component={renderTextField}
            label={formatMessage(localMessages.outlinks)}
          />
        </Col>
      </Row>
      <Row>
        <Col lg={6} xs={12} />
        <Col lg={3} xs={12}>
          <AppButton
            name="primary"
            style={{ marginTop: 30 }}
            type="submit"
            label={downloadLabel}
            disabled={submitting}
            color="primary"
          />
        </Col>
        <Col lg={3} xs={12}>
          <AppButton
            name="secondary"
            style={{ marginTop: 30 }}
            type="button"
            label={viewLabel}
            disabled={submitting}
            onClick={onViewMapData}
            color="primary"
          />
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          {sigmaElement}
        </Col>
      </Row>
    </form>
  );
};

LinkMapForm.propTypes = {
  // from parent
  topicId: PropTypes.number,
  initialValues: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  // form composition
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  renderCheckbox: PropTypes.func.isRequired,
  renderSelect: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  onGetMapData: PropTypes.func.isRequired,
  onViewMapData: PropTypes.func.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  downloadLabel: PropTypes.string,
  viewLabel: PropTypes.string,
  showMap: PropTypes.bool.isRequired,
  fieldParams: PropTypes.object,
};

const mapStateToProps = state => ({
  fieldParams: formSelector(state, 'color_field', 'num_media', 'include_weights', 'num_links_per_medium', 'viewMap'),
});

function validate() {
  const errors = {};
  return errors;
}

const reduxFormConfig = {
  form: 'linkMap', // make sure this matches the sub-components and other wizard steps
  validate,
};

export default
  injectIntl(
    withIntlForm(
      reduxForm(reduxFormConfig)(
        connect(mapStateToProps)(
          LinkMapForm
        )
      )
    )
  );
