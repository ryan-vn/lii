import React, { useState, useEffect } from "react";
import "./Select.scss";

const Select = ({
  value,
  data,
  placeholder,
  onChange,
  className = "",
  prefix = "",
  search = false,
}) => {
  const [showDropDown, setShowDropDown] = useState(false);

  const [searchText, setSearchText] = useState(
    value || value === 0 ? data.find((item) => item.value === value).key : ""
  );

  useEffect(() => {
    const _handler = (e) => {
      // console.log(e.target.className);
      setShowDropDown(false);
    };

    document.body.addEventListener("click", _handler);

    return () => {
      document.body.removeEventListener("click", _handler);
    };
  }, []);

  const handleItemClick = (value, key) => (e) => {
    // e.stopPropagation();
    onChange && onChange(value);
    setShowDropDown(false);
    setSearchText(key);
  };

  return (
    <div className={`comp-select ${className}`}>
      <div
        className="select-title"
        onClick={(e) => {
          e.stopPropagation();
          setShowDropDown(true);
        }}
      >
        {/* {prefix ? <p className="prefix">{prefix}</p> : null} */}

        {/* <p>
                {value || (value === 0) ? data.find(item => item.value === value).key : placeholder}

                // searchText
                // value || (value === 0) ? data.find(item => item.value === value).key : ''
            </p> */}
        <input
          readOnly={!search}
          className="select-input"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);

            if (data.find((item) => item.key !== e.target.value)) {
              onChange(null);
            }
          }}
          placeholder={placeholder}
        />
        <div className="select-arrow-down"></div>
      </div>
      {/* <p className="select-gap"></p> */}
      {showDropDown ? (
        <ul className="select-list">
          {data
            .filter((_it) => {
              if (!search) {
                return true;
              }

              let _searchStr = (searchText || "").trim();

              if (_searchStr) {
                return _it.key.indexOf(_searchStr) > -1;
              }

              return true;
            })
            .map((item) => (
              <li
                key={item.value}
                className="select-list-item"
                onClick={handleItemClick(item.value, item.key)}
              >
                {item.key}
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  );
};

export default Select;
