import React, { useEffect, useState } from 'react';
import './MultiSelectSearch.css';
import { UserIcon } from '../../lib/svg';
import ToggleSwitch from '../ToggleButton';

const MultiSelectSearch = ({ options, selectedValues, onChange, loading = null, manufacturers = [] }) => {

    const [searchTerm, setSearchTerm] = useState('');
    const [showSelected, setShowSelected] = useState(false);
    const [brand, setBrand] = useState();
    // Handle selecting or deselecting an item
    const handleSelect = (item) => {
        const isSelected = selectedValues.some(selected => selected.Id === item.Id);
        const newSelectedValues = isSelected
            ? selectedValues.filter(selected => selected.Id !== item.Id) // Deselect item
            : [...selectedValues, item]; // Select item

        onChange?.(newSelectedValues); // Notify parent component of selection change
    };

    // Filter options based on search term
    const [filteredOptions, setFilteredOptions] = useState();
    useEffect(() => {
        console.log('searchTerm:', searchTerm);
        console.log('brand:', brand);
        console.log('options:', options);
    
        const results = options.filter(option => {
            const brandMatch = brand ? option?.BrandIds?.includes(brand) : true;
            console.log({option,brandMatch});
            
            const lowerSearchTerm = searchTerm.toLowerCase();
            const nameMatch = option?.Name?.toLowerCase().includes(lowerSearchTerm);
            const titleMatch = option?.Title?.toLowerCase().includes(lowerSearchTerm);
            const accountNameMatch = option?.Account?.Name?.toLowerCase().includes(lowerSearchTerm);
    
            return brandMatch && (nameMatch || titleMatch || accountNameMatch);
        });
    
        console.log('filtered results:', results);
        setFilteredOptions(results); 
    }, [searchTerm, brand, options]);
console.log({filteredOptions,searchTerm,brand});


    const AutoSelectChangeHandler = () => {
        onChange?.([...selectedValues, ...filteredOptions]);
    }
    const resetSelectChangeHandler = () => {
        onChange?.([]);
    }
    const brandSelectionHandler = (event) => {
        const { target } = event;
        if (target.value != 0) {
            setBrand(target.value);
        } else {
            setBrand();
        }
    }
    return (
        <div className="multi-select-container">
            <header>
                {/* <h1>User Search</h1> */}
                <ul className="select-user-list justify-content-between align-items-center">
                    <div className='d-flex flex-column align-items-center justify-content-start'>

                        <b className='d-flex justify-content-start align-items-center w-[100%]'><input type='checkbox' value={1} onChange={() => setShowSelected(!showSelected)} style={{ width: '15px', height: '15px', margin: 0 }} />&nbsp;Selected Users:&nbsp;</b>
                        <div className='d-flex justify-content-start'>
                            {selectedValues?.length ? selectedValues.length < 3 ? selectedValues.map((user, index) => (
                                <li key={user.Id}>{user.Name}{index != (selectedValues.length - 1) ? "," : ""}</li>
                            )) : selectedValues.length + " Users selected" : "No Users selected"}
                        </div>
                    </div>
                    <div className='d-flex flex-column align-items-center justify-content-end cursor-pointer'>
                        <span className='text-end w-[100%]'><span onClick={AutoSelectChangeHandler}>Select All</span>&nbsp;|&nbsp;<span onClick={resetSelectChangeHandler}>Reset</span></span>
                        {manufacturers?.length ? <select className={"brandSearch form-control"} onChange={brandSelectionHandler}>
                            <option value={0} selected>All Brand</option>
                            {manufacturers.map((brand) => (
                                <option value={brand.Id}>{brand.Name}</option>
                            ))}
                        </select> : null}
                    </div>
                </ul>
                <input
                    type="text"
                    placeholder="Search for a user..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </header>
            <div className="user-list">
                {loading ? loading :
                    filteredOptions?.length ?
                        filteredOptions.map((option) => (
                            <div
                                key={option.Id}
                                className={`user-item ${selectedValues.some(selected => selected.Id === option.Id) ? 'selected' : showSelected ? 'd-none' : ''}`}
                                onClick={() => handleSelect(option)}
                            >
                                <div className="user-avatar"><UserIcon width={25} height={25} /></div>
                                <div className="user-info">
                                    <span className="user-name">{option.Name}</span>
                                    <span className="user-email">{option.Email}</span>
                                    {option?.Title ? <span className="user-etc"><b className="text-['Arial']">Title:&nbsp;</b>{option?.Title}</span> : null}
                                    {option?.Phone ? <span className="user-etc"><b>Phone:&nbsp;</b>{option?.Phone}</span> : null}
                                    {option?.Account?.Name ? <span className="user-etc"><b>Store:&nbsp;</b>{option?.Account?.Name}</span> : null}
                                </div>
                            </div>
                        )) : "No record found."}
            </div>
        </div>
    );
};

export default MultiSelectSearch;
