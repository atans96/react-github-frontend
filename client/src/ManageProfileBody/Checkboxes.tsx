import React from 'react';

interface CheckboxesProps {
  checkedItems: any;
  handleCheckboxClick: any;
}

const Checkboxes: React.FC<CheckboxesProps> = ({ handleCheckboxClick, checkedItems }) => {
  return (
    <div className="checkboxes">
      <label htmlFor="Description+Title" style={{ marginRight: '5px' }}>
        <input
          type="checkbox"
          id="Description+Title"
          name={'descriptionTitle'}
          checked={checkedItems.descriptionTitle}
          onChange={handleCheckboxClick}
          style={{ marginRight: '5px' }}
        />
        <span>Description+Title</span>
      </label>
      <label htmlFor="Readme" style={{ marginRight: '5px' }}>
        <input
          type="checkbox"
          style={{ marginRight: '5px' }}
          id="Readme"
          name={'readme'}
          checked={checkedItems.readme}
          onChange={handleCheckboxClick}
        />
        <span>Readme</span>
      </label>
    </div>
  );
};

export default Checkboxes;
