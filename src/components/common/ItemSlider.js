import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import Slider from 'react-slick';
import PreviousIcon from '@material-ui/icons/NavigateBefore';
import NextIcon from '@material-ui/icons/NavigateNext';

const ItemSlider = (props) => {
  const { slides, settings } = props;
  const settingsExt = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    ...settings,
  };

  // use this if you have a prepped set of JSX tags to send over
  const nextButton = <NextIcon />;
  const previousButton = <PreviousIcon />;
  return (
    <Slider
      {...settingsExt}
      nextArrow={nextButton}
      prevArrow={previousButton}
      style={{
        width: '100%',
        height: 100,
        margin: 10,
        padding: 10,
      }}
    >
      { slides }
    </Slider>
  );
};

ItemSlider.propTypes = {
  // from parent
  title: PropTypes.string.isRequired,
  intro: PropTypes.string,
  slides: PropTypes.array.isRequired,
  helpButton: PropTypes.node,
  settings: PropTypes.object,
  // from dispatch
  handleClick: PropTypes.func,
  // from compositional chain
  intl: PropTypes.object.isRequired,
};

export default
injectIntl(
  ItemSlider
);
