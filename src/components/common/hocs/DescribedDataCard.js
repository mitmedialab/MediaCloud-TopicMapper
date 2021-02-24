import PropTypes from 'prop-types';
import React from 'react';
import { FormattedHTMLMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import { Box } from '@material-ui/core';

const localMessage = {
  showDescription: { id: 'describedDataCard.description.show', defaultMessage: ' Learn more' },
  hideDescription: { id: 'describedDataCard.description.hide', defaultMessage: ' Hide details' },
};

/**
 * Use this with the JS Composition pattern to make a DataCard that has help on the side.
 */
function withDescription(introMessage, descriptionMessage, showingPropName) {
  return (ChildComponent) => {
    class DescribedDataCard extends React.Component {
      state = {
        showDescription: false,
      };

      toggleVisible = (evt) => {
        evt.preventDefault();
        this.setState(prevState => ({ showDescription: !prevState.showDescription }));
      }

      render() {
        let descriptionContent;
        let toggleButton;
        if (descriptionMessage) { // only toggle extra text if there is any
          if (this.state.showDescription) {
            toggleButton = (
              <a href="#hide" onClick={this.toggleVisible}>
                <FormattedHTMLMessage {...localMessage.hideDescription} />
              </a>
            );
            if (Array.isArray(descriptionMessage)) {
              descriptionContent = descriptionMessage.map(msgId => <FormattedHTMLMessage key={msgId.id} {...msgId} />);
            } else {
              descriptionContent = <FormattedHTMLMessage {...descriptionMessage} />;
            }
          } else {
            toggleButton = (
              <a href="#show" onClick={this.toggleVisible}>
                <FormattedHTMLMessage {...localMessage.showDescription} />
              </a>
            );
          }
        }
        // optional support for only showing the whole DataCard if the specified property is true
        const visible = (showingPropName === undefined) || (showingPropName && (this.props[showingPropName] !== false));
        if (visible) {
          return (
            <Box pt={3}>
              <Row className="described-data-card">
                <Col lg={8}>
                  <ChildComponent {...this.props} showingDetails={this.state.showDescription} />
                </Col>
                <Col lg={4}>
                  <div className="helpful-content">
                    <p>
                      <FormattedHTMLMessage {...introMessage} />
                      {toggleButton}.
                    </p>
                    {descriptionContent}
                  </div>
                </Col>
              </Row>
            </Box>
          );
        }
        return '';
      }
    }

    DescribedDataCard.propTypes = {
      intl: PropTypes.object.isRequired,
    };

    return injectIntl(DescribedDataCard);
  };
}

export default withDescription;
