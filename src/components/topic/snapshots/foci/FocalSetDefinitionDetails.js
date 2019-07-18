import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import { DeleteButton, AddButton } from '../../../common/IconButton';
import FocusDefinition from './FocusDefinition';
import { filtersAsUrlParams } from '../../../util/location';

const localMessages = {
  focalSetAdd: { id: 'focalSets.delete', defaultMessage: 'Add another Subtopic to this Set' },
  focalSetDelete: { id: 'focalSets.delete', defaultMessage: 'Delete this entire Set' },
  summary: { id: 'focalSets.summary', defaultMessage: 'This has {count} {technique} subtopics.' },
};

class FocalSetDefinitionDetails extends React.Component {
  handleDelete = (event) => {
    const { focalSetDefinition, onDelete } = this.props;
    event.preventDefault();
    if ((onDelete !== undefined) && (onDelete !== null)) {
      onDelete(focalSetDefinition);
    }
  }

  render() {
    const { focalSetDefinition, onFocusDefinitionDelete, topicId, filters } = this.props;
    const { formatMessage } = this.props.intl;
    return (
      <div className="focal-set-definition-summary">
        <Row>
          <Col lg={9}>
            <h3>{focalSetDefinition.name }</h3>
            <p>
              {focalSetDefinition.description}
              <br />
              <small>
                <FormattedMessage
                  {...localMessages.summary}
                  values={{ count: focalSetDefinition.focus_definitions.length, technique: focalSetDefinition.focal_technique }}
                />
              </small>
            </p>
          </Col>
          <Col lg={3} md={3} sm={4} xs={12}>
            <div className="controls">
              <AddButton
                tooltip={formatMessage(localMessages.focalSetAdd)}
                linkTo={`/topics/${topicId}/snapshot/foci/create?focalSetDefId=${focalSetDefinition.focal_set_definitions_id}&focalTechnique=${focalSetDefinition.focal_technique}&${filtersAsUrlParams(filters)}`}
              />
              <FormattedMessage {...localMessages.focalSetAdd} />
              <br />
              <DeleteButton
                onClick={this.handleDelete}
                tooltip={formatMessage(localMessages.focalSetDelete)}
              />
              <FormattedMessage {...localMessages.focalSetDelete} />
            </div>
          </Col>
        </Row>
        {focalSetDefinition.focus_definitions.map(focusDef => (
          <Row key={`fs-${focusDef.focus_definitions_id}`}>
            <Col lg={12}>
              <FocusDefinition
                focalSetDefinitionName={focalSetDefinition.name}
                focalSetDefinitionDesc={focalSetDefinition.description}
                topicId={topicId}
                focusDefinition={focusDef}
                onDelete={onFocusDefinitionDelete}
                filters={filters}
              />
            </Col>
          </Row>
        ))}
      </div>
    );
  }
}

FocalSetDefinitionDetails.propTypes = {
  // from composition chain
  intl: PropTypes.object.isRequired,
  // from parent
  focalSetDefinition: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
  onFocusDefinitionDelete: PropTypes.func.isRequired,
  topicId: PropTypes.number.isRequired,
  filters: PropTypes.object.isRequired,
};

export default
injectIntl(
  FocalSetDefinitionDetails
);
