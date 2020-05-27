import PropTypes from 'prop-types';
import React from 'react';
import { FormattedHTMLMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import HelpDialog from '../HelpDialog';

/**
 * Use this with the JS Composition pattern to make a Container that has a help button.
 * Clicking that button brings up a dialog with the title and text from the message key
 * that you specify.
 * `contentHTMLTextMsg` can be a intl message  or an array of intl message s.
 */
function withHelp(contentTitleMsg, contentHTMLTextMsg, showHelpSidebar) {
  return (ChildComponent) => {
    class HelpfulContainer extends React.Component {
      state = {
        titleMsg: contentTitleMsg,
        contentMsg: contentHTMLTextMsg,
        customContent: undefined,
      };

      setTitleMsg = (titleMsg) => {
        this.setState({ titleMsg });
      };

      setContentMsg = (contentMsg) => {
        this.setState({ contentMsg });
      };

      showCustomContent = (customContent) => {
        this.setState({ customContent });
      };

      render() {
        const { formatMessage } = this.props.intl;
        let content;
        if (this.state.customContent !== undefined) {
          content = this.state.customContent;
        } else if (this.state.contentMsg) {
          if (Array.isArray(this.state.contentMsg)) {
            content = this.state.contentMsg.map(msg => (msg ? <FormattedHTMLMessage key={msg.id} {...msg} /> : ''));
          } else {
            content = <FormattedHTMLMessage {...this.state.contentMsg} />;
          }
        }
        const dialogTitle = this.state.titleMsg ? formatMessage(this.state.titleMsg) : '';
        const helpButton = content ? (
          <HelpDialog title={dialogTitle}>
            {content}
          </HelpDialog>
        ) : null;

        let displayContent;
        if (showHelpSidebar) {
          displayContent = (
            <Row>
              <Col lg={8}>
                <ChildComponent {...this.props} helpButton={helpButton} helpContent={content} />
              </Col>
              <Col lg={4}>
                <div className="helpful-content">
                  {content}
                </div>
              </Col>
            </Row>
          );
        } else {
          displayContent = (
            <ChildComponent
              {...this.props}
              helpButton={helpButton}
              helpContent={content}
              setHelpTitleMsg={this.setTitleMsg}
              setHelpContentMsg={this.setContentMsg}
              setCustomContent={this.showCustomContent}
            />
          );
        }
        return (
          <span className="helpful">
            {displayContent}
          </span>
        );
      }
    }

    HelpfulContainer.propTypes = {
      intl: PropTypes.object.isRequired,
    };

    return injectIntl(HelpfulContainer);
  };
}

export default withHelp;
