import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';

const localMessages = {
  answer: { id: 'faq.answer', defaultMessage: 'show answer' },
};

class FaqItem extends React.Component {

  state = {
    showAnswer: false,
  };

  toggleVisible = (evt) => {
    evt.preventDefault();
    console.log(this.state.showAnswer);
    const visible = !this.state.showAnswer;
    this.setState({ showAnswer: visible });
    console.log(this.state.showAnswer);
  }

  render() {
    const { question, answer } = this.props;
    const { formatMessage } = this.props.intl;
    const answerContent = this.state.showAnswer ? <p className="answer"><FormattedMessage {...answer} /></p> : null;
    return (
      <div className="faq-item">
        <h4 className="question">
          <a href={`#${formatMessage(localMessages.answer)}`} onClick={this.toggleVisible}>
            <FormattedMessage {...question} />
          </a>
        </h4>
        {answerContent}
      </div>
    );
  }

}

FaqItem.propTypes = {
  // from composition chain
  intl: React.PropTypes.object.isRequired,
  // from parent
  question: React.PropTypes.object.isRequired,
  answer: React.PropTypes.object.isRequired,
};

export default
  injectIntl(
    FaqItem
  );
