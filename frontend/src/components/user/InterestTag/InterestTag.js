import React from 'react';
import classes from './InterestTag.module.css';

const InterestTag = ({value, checked, onSelect}) => {
  return (
    <div
      className={[classes.InterestTag, checked && classes.checked].join(' ')}
      onClick={() => {
        onSelect({checked: !checked, value});
      }}
    >
      <input
        id={`option_${value}`}
        type="checkbox"
        value={value}
        checked={checked}
        onClick={(e) => {
          e.stopPropagation();
        }}
        onChange={(e) => {
          const {checked, value} = e.target;
          onSelect({checked, value});
        }}
      />
      <label htmlFor={`option_${value}`} onClick={(e) => e.stopPropagation()}>{value}</label>
    </div>
  );
};

export default InterestTag;
