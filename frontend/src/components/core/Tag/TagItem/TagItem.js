import React from 'react';
import classes from './TagItem.module.css';

const TagItem = ({children, onRemove}) => {
  return (
    <span
      className={[
        'badge',
        'badge-pill',
        'badge-primary',
        classes.tag,
        !onRemove ? classes.readonly : null,
      ].join(' ')}
      onClick={e => {
        if (onRemove) {
          onRemove(e);
        }
      }}
    >
      {children}
      {onRemove && <i className={classes['remove-icon']} />}
    </span>
  );
};

export default TagItem;
