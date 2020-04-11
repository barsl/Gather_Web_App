import React, {useState, useRef, useCallback} from 'react';
import classes from './Search.module.css';

const Search = ({
  data,
  placeholder,
  onSelect,
  emptyMessage,
  fillOnSelect,
  onChange,
}) => {
  const [dropdownToggled, setDropdownToggled] = useState(false);
  const [value, setValue] = useState('');
  const componentRef = useRef(null);

  const hideDropdown = useCallback(() => {
    setDropdownToggled(false);
  }, []);

  const selectItemHandler = useCallback(
    item => {
      if (onSelect) onSelect(item);
      if (onChange) onChange(item);
      if (fillOnSelect) setValue(item);
      hideDropdown();
    },
    [hideDropdown, onSelect, onChange, fillOnSelect],
  );

  const showDropdown = useCallback(() => {
    setDropdownToggled(true);
  }, []);

  const menuItems = data.filter(entry =>
    entry.toLowerCase().startsWith(value.toLowerCase()),
  );

  return (
    <div
      ref={componentRef}
      className="dropdown"
      onKeyDown={e => {
        const dropdownMenu = componentRef.current.lastChild;
        const searchField = componentRef.current.firstChild;
        const key = e.key;

        if (key === 'Escape') {
          searchField.focus();
          hideDropdown();
        } else if (key === 'ArrowDown' || key === 'ArrowUp') {
          e.preventDefault();
          if (dropdownToggled) {
            let focusedElement;
            dropdownMenu.childNodes.forEach(n => {
              if (document.activeElement === n) {
                focusedElement = n;
                return;
              }
            });
            if (focusedElement) {
              if (key === 'ArrowUp') {
                focusedElement.previousSibling
                  ? focusedElement.previousSibling.focus()
                  : searchField.focus();
              } else if (key === 'ArrowDown' && focusedElement.nextSibling) {
                focusedElement.nextSibling.focus();
              }
            } else {
              if (key === 'ArrowDown') {
                dropdownMenu.childNodes[0].focus();
              }
            }
          }
        }
      }}
      onBlur={({relatedTarget}) => {
        if (!componentRef.current.contains(relatedTarget)) {
          hideDropdown();
        }
      }}
    >
      <input
        className="form-control"
        type="text"
        placeholder={placeholder}
        value={value}
        onFocus={() => {
          if (value.length > 0) {
            showDropdown();
          }
        }}
        onChange={({target}) => {
          if (onChange) onChange(target.value);
          setValue(target.value);
          if (!dropdownToggled && target.value.length > 0) {
            showDropdown();
          } else if (dropdownToggled && target.value.length === 0) {
            hideDropdown();
          }
        }}
        onClick={() => {
          if (!dropdownToggled && value.length > 0) {
            showDropdown();
          }
        }}
      />
      <div
        className={['dropdown-menu', dropdownToggled ? 'show' : null].join(' ')}
      >
        {menuItems.length > 0 ? (
          menuItems.map(entry => (
            <div
              key={`${entry}_tag`}
              className={[classes['search-item'], 'dropdown-item'].join(' ')}
              onClick={() => selectItemHandler(entry)}
              onKeyDown={({key}) => {
                if (key === 'Enter') {
                  selectItemHandler(entry);
                }
              }}
              tabIndex="0"
            >
              {entry}
            </div>
          ))
        ) : (
          <div className="dropdown-item-text font-italic text-muted">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
