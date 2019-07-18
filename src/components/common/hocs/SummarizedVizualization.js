import PropTypes from 'prop-types';
import React from 'react';
import { FormattedHTMLMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import AppButton from '../AppButton';
import messages from '../../../resources/messages';

const localMessage = {
  showDetails: { id: 'summarizedContainer.description.show', defaultMessage: 'learn more' },
  hideDescription: { id: 'summarizedContainer.description.hide', defaultMessage: 'hide details' },
};

function withSummary(titleMessage, introMessage, detailedMessage, wide, useAltButton) {
  return (ChildComponent) => {
    class SummarizedVisualization extends React.Component {
      state = {
        showingDetails: false,
        extraContent: null,
      };

      toggleShowingDetails = (evt) => {
        evt.preventDefault();
        this.setState(prevState => ({ showingDetails: !prevState.showingDetails }));
      }

      handleExtraContent = (extraContent) => {
        this.setState({ extraContent });
      }

      render() {
        const { handleExplore } = this.props;
        const { formatMessage } = this.props.intl;
        let detailsContent;
        let showDetailsButton;
        let detailsExploreContent = null;

        if (handleExplore && typeof handleExplore === 'string') {
          detailsExploreContent = (
            <a href={handleExplore}>
              <AppButton
                label={formatMessage(messages.details)}
              />
            </a>
          );
        } else if (handleExplore && typeof handleExplore === 'function') {
          detailsExploreContent = (
            <AppButton
              label={formatMessage(messages.details)}
              onClick={handleExplore}
            />
          );
          if (useAltButton) {
            detailsExploreContent = <div className="summarized-button">{handleExplore()}</div>; // actionButtonMenu
          }
        }

        if (detailedMessage) { // only toggle extra text if there is any
          if (this.state.showingDetails) {
            if (Array.isArray(detailedMessage)) {
              detailsContent = detailedMessage.map(msgId => <FormattedHTMLMessage key={msgId.id} {...msgId} />);
            } else {
              detailsContent = <FormattedHTMLMessage {...detailedMessage} />;
            }
            detailsContent = (
              <span className="summary-details">
                {detailsContent}
                <p>
                  <a href="#hide" onClick={this.toggleShowingDetails}>
                    <FormattedHTMLMessage {...localMessage.hideDescription} />
                  </a>
                </p>
              </span>
            );
          } else {
            showDetailsButton = (
              <a href="#show" onClick={this.toggleShowingDetails}>
                <FormattedHTMLMessage {...localMessage.showDetails} />
              </a>
            );
          }
        }

        return (
          <div className={`summarized-viz ${wide ? 'wide' : ''}`}>
            <Row>
              <Col lg={wide ? 3 : 4}>
                <div className="summary">
                  { titleMessage && <h2><FormattedHTMLMessage {...titleMessage} /></h2> }
                  { detailsExploreContent }
                  <div className="summary-intro">
                    <FormattedHTMLMessage {...introMessage} />
                    {showDetailsButton}
                  </div>
                  {detailsContent}
                </div>
              </Col>
              {!wide && <Col lg={1} />}
              <Col lg={wide ? 9 : 7}>
                <div className="content">
                  <ChildComponent {...this.props} showingDetails={this.state.showingDetails} handleExtraContent={this.handleExtraContent} />
                </div>
              </Col>
            </Row>
            {this.state.extraContent}
          </div>
        );
      }
    }

    SummarizedVisualization.propTypes = {
      intl: PropTypes.object.isRequired,
      // from child:
      handleExplore: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.string,
      ]),
    };

    return injectIntl(SummarizedVisualization);
  };
}

export default withSummary;
