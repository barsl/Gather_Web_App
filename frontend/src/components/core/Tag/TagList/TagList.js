import React from 'react';
import classes from './TagList.module.css';
import TagItem from '../TagItem/TagItem';

const TagList = ({tags, onTagRemove}) => {
  return (
    <div className={classes['tags-selected']}>
      {tags.map(tag => (
        <TagItem
          key={`selected_tag_${tag}`}
          onRemove={onTagRemove ? () => onTagRemove(tag) : null}
        >
          {tag}
        </TagItem>
      ))}
    </div>
  );
};

export default TagList;
