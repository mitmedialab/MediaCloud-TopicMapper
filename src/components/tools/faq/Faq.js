import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-flexbox-grid/lib';
import FaqItem from './FaqItem';

const localMessages = {
  title: { id: 'faq.title', defaultMessage: 'FAQ' },
  q1: { id: 'faq.q1', defaultMessage: 'What is MediaCloud?' },
  a1: { id: 'faq.a1', defaultMessage: '' },
  q2: { id: 'faq.q2', defaultMessage: 'What type of data does Media Cloud collect?' },
  a2: { id: 'faq.a2', defaultMessage: '' },
  q3: { id: 'faq.q3', defaultMessage: 'What tools exist so that I can explore this data?' },
  a3: { id: 'faq.a3', defaultMessage: '' },
  q4: { id: 'faq.q4', defaultMessage: 'How does Media Cloud get the data?' },
  a4: { id: 'faq.a4', defaultMessage: 'Media Cloud collects most of its content through the RSS feeds of the media sources we follow. That means we only collect content from those sources whose RSS feeds we follow, and only since the moment we started following them.' },
  q5: { id: 'faq.q5', defaultMessage: 'Can I download the content of the stories?' },
  a5: { id: 'faq.a5', defaultMessage: 'We cannot provide the actual news content, but we can give you a complete list of urls so you can check the content yourself.' },
  q6: { id: 'faq.q6', defaultMessage: 'What data can I have access to?' },
  a6: { id: 'faq.a6', defaultMessage: '' },
  q7: { id: 'faq.q7', defaultMessage: 'How do I get data?' },
  a7: { id: 'faq.a7', defaultMessage: 'Our tools are designed so you can visualize all the data we have, but also to allow users to download it and it in other tools. On the top right corner of most of our tools' },
  q8: { id: 'faq.q8', defaultMessage: 'What can I do using the Dashboard tool?' },
  a8: { id: 'faq.a8', defaultMessage: '' },
  q9: { id: 'faq.q9', defaultMessage: 'What do I do with the Topic Mapper tool? ' },
  a9: { id: 'faq.a9', defaultMessage: '' },
  q10: { id: 'faq.q10', defaultMessage: 'Can I run my own topic?' },
  a10: { id: 'faq.a10', defaultMessage: 'Very soon you will be able to create new topics. For now you can explore a series of topics we’ve created for different research projects.' },
  q11: { id: 'faq.q11', defaultMessage: 'How can I get more help?' },
  a11: { id: 'faq.a11', defaultMessage: 'Go to our wonderful [Google] group at [url].' },
};

const NUM_ITEMS = 11;

const Faq = () => {
  const items = [];
  for (let i = 1; i <= NUM_ITEMS; i += 1) {
    items.push((
      <Col lg={6} key={i}>
        <FaqItem question={localMessages[`q${i}`]} answer={localMessages[`a${i}`]} />
      </Col>
    ));
  }
  return (
    <div className="faq">
      <Row>
        <Col lg={12}>
          <h2><FormattedMessage {...localMessages.title} /></h2>
        </Col>
      </Row>
      <Row>
        {items}
      </Row>
    </div>
  );
};

Faq.propTypes = {
  // from composition chain
  intl: React.PropTypes.object.isRequired,
};

export default
  injectIntl(
    Faq
  );
