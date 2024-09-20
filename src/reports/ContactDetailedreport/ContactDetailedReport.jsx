import React, { useEffect, useState , useMemo } from 'react';
import axios from 'axios';
import AppLayout from '../../components/AppLayout';
import Styles from "./index.module.css";
import { FilterItem } from '../../components/FilterItem';
import { GetAuthData, originAPi, DestoryAuth } from '../../lib/store';
import Loading from '../../components/Loading';
import styles from "../../components/newness report table/table.module.css";
import * as XLSX from 'xlsx';
import { CloseButton } from "../../lib/svg";
import { MdOutlineDownload } from "react-icons/md";
import { getPermissions } from "../../lib/permission";
import FilterSearch from '../../components/FilterSearch';
import PermissionDenied from '../../components/PermissionDeniedPopUp/PermissionDenied';
import { useNavigate } from 'react-router-dom';
function ContactDetailedReport() {
    const navigate = useNavigate();
    const [accountManufacturerRecords, setAccountManufacturerRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [filters, setFilters] = useState({
        accountFilter: '',
        saleRepFilter: '',
        manufacturerFilter: '',
        accountStatusFilter: 'All',

    });
    const [accounts, setAccounts] = useState([]);
    const [salesReps, setSalesReps] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state
    const [hasPermission, setHasPermission] = useState(null); // State to store permission status
    const [permissions, setPermissions] = useState(null);
    // Debounce filter changes
    const [debouncedFilters, setDebouncedFilters] = useState(filters);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [filters]);

    const fetchAccountDetails = async () => {
        setLoading(true); // Show loader
        try {
            const data = await GetAuthData();
            if (!data) {
                console.log("No data found, destroying auth");
                DestoryAuth();
                return;
            }
    
            const accessToken = data.access_token;
            console.log("Access Token:", accessToken);
    
            // Fetch account manufacturer records
            const apiUrl = `${originAPi}/skahHqskfz/NbvBPAyVSQ`;
            const res = await axios.post(apiUrl, { accessToken });
    
            console.log("API Response:", res.data);
    
            if (res.data && res.data.accountManufacturerRecords) {
                const records = res.data.accountManufacturerRecords;
    
                // Flatten the contact records with the main account manufacturer records
                const expandedRecords = records.flatMap((record) => {
                    const contacts = record.contacts || [];
                    return contacts.length
                        ? contacts.map((contact) => ({
                            ...record,
                            contact // Embed each contact into the record
                        }))
                        : [{ ...record, contact: null }]; // Handle case where there are no contacts
                });
    
                setAccountManufacturerRecords(expandedRecords);
                setFilteredRecords(expandedRecords);
    
                // Extract accounts, sales reps, and manufacturers for filter dropdowns
                const accountList = expandedRecords.map((record) => ({
                    label: record.AccountId__r?.Name,
                    value: record.AccountId__r?.Name,
                }));
    
                const saleRepList = expandedRecords.map((record) => ({
                    label: record.Sales_Rep__r?.Name,
                    value: record.Sales_Rep__r?.Name,
                }));
    
                const manufacturerList = expandedRecords.map((record) => ({
                    label: record.ManufacturerName__c,
                    value: record.ManufacturerName__c,
                }));
    
                // Remove duplicates using Map
                setAccounts([...new Map(accountList.map(account => [account.value, account])).values()]);
                setSalesReps([...new Map(saleRepList.map(rep => [rep.value, rep])).values()]);
                setManufacturers([...new Map(manufacturerList.map(manufacturer => [manufacturer.value, manufacturer])).values()]);
            }
        } catch (error) {
            console.error("Error fetching account details:", error);
        } finally {
            setLoading(false); // Hide loader
        }
    };
    useEffect(() => {
        fetchAccountDetails();
    }, []);
    
    
    // Filter records by account name, sales rep, and manufacturer
    useEffect(() => {
        const newFilteredRecords = accountManufacturerRecords.filter((record) => {
            const accountMatch = debouncedFilters.accountFilter
                ? record.AccountId__r?.Name?.toLowerCase().includes(debouncedFilters.accountFilter.toLowerCase())
                : true;
            const saleRepMatch = debouncedFilters.saleRepFilter
                ? record.Sales_Rep__r?.Name?.toLowerCase().includes(debouncedFilters.saleRepFilter.toLowerCase())
                : true;
            const manufacturerMatch = debouncedFilters.manufacturerFilter
                ? record.ManufacturerName__c?.toLowerCase().includes(debouncedFilters.manufacturerFilter.toLowerCase())
                : true;
            return accountMatch && saleRepMatch && manufacturerMatch;
        });

        setFilteredRecords(newFilteredRecords);
    }, [debouncedFilters, accountManufacturerRecords]);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    const handleClearFilters = async () => {
        // Reset filters
        setFilters({
            accountFilter: '',
            saleRepFilter: '',
            manufacturerFilter: '',
            accountStatusFilter: 'All',
        });
        setLoading(true); // Show loader
    
        // Refetch data
        await fetchAccountDetails();
    };

    const handleSearch = () => {
        // Trigger any additional search logic if needed
    };

    const handleExportToExcel = () => {
        // Prepare data for export
        const exportData = filteredRecords.map(record => ({
            'Account Name': record.AccountId__r?.Name || '',
            'First Name': record.contact?.FirstName || 'N/A',
            'Last Name': record.contact?.LastName || 'N/A',
            'Sales Rep': record.Sales_Rep__r?.Name || 'N/A',
            'Manufacturer': record.ManufacturerName__c || 'N/A',
            'Email': record.contact?.Email || 'N/A',
            'Phone': record.contact?.Phone || 'N/A',
            'Account Number': record.Account_Number__c || 'N/A',
            'Margin': record.Margin__c || 'N/A',
            'Payment Type': record.Payment_Type__c || 'N/A',
            'Store Street': record.AccountId__r?.Store_Street__c || 'N/A',
            'Store City': record.AccountId__r?.Store_City__c || 'N/A',
            'Store State': record.AccountId__r?.Store_State__c || 'N/A',
            'Store Zip': record.AccountId__r?.Store_Zip__c || 'N/A',
            'Store Country': record.AccountId__r?.Store_Country__c || 'N/A',
            'Shipping Street': record.AccountId__r?.ShippingStreet || 'N/A',
            'Shipping City': record.AccountId__r?.ShippingCity || 'N/A',
            'Shipping State': record.AccountId__r?.ShippingState || 'n/A',
            'Shipping Zip': record.AccountId__r?.ShippingPostalCode || 'N/A',
            'Shipping Country': record.AccountId__r?.ShippingCountry || 'N/A',
            'Billing Street': record.AccountId__r?.BillingStreet || 'N/A',
            'Billing City': record.AccountId__r?.BillingCity || 'N/A',
            'Billing State': record.AccountId__r?.BillingState || 'N/A',
            'Billing Zip': record.AccountId__r?.BillingPostalCode || 'N/A',
            'Billing Country': record.AccountId__r?.BillingCountry || 'N/A',
        }));

        // Create a new workbook and add the data
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Contacts');

        // Export the workbook
        XLSX.writeFile(wb, 'ContactDetailedReport.xlsx');
    };
    useEffect(() => {
        const newFilteredRecords = accountManufacturerRecords.filter((record) => {
            const accountMatch = debouncedFilters.accountFilter
                ? record.AccountId__r?.Name?.toLowerCase().includes(debouncedFilters.accountFilter.toLowerCase())
                : true;
            const saleRepMatch = debouncedFilters.saleRepFilter
                ? record.Sales_Rep__r?.Name?.toLowerCase().includes(debouncedFilters.saleRepFilter.toLowerCase())
                : true;
            const manufacturerMatch = debouncedFilters.manufacturerFilter
                ? record.ManufacturerName__c?.toLowerCase().includes(debouncedFilters.manufacturerFilter.toLowerCase())
                : true;
    
            // Filter by account status
            const accountStatusMatch = debouncedFilters.accountStatusFilter === 'All'  // If "All" is selected, no filter
                ? true
                : record.AccountId__r?.Active_Closed__c === debouncedFilters.accountStatusFilter;
    
            return accountMatch && saleRepMatch && manufacturerMatch && accountStatusMatch;
        });
    
        setFilteredRecords(newFilteredRecords);
    }, [debouncedFilters, accountManufacturerRecords]);
    
    useEffect(() => {
        async function fetchPermissions() {
          try {
            const user = await GetAuthData(); // Fetch user data
            const userPermissions = await getPermissions(); // Fetch permissions
            setPermissions(userPermissions); // Set permissions in state
            if (userPermissions?.modules?.reports?.contactDetailedReport.view === false) {
                PermissionDenied()
                navigate('/dashboard')
            }
          } catch (err) {
            console.error("Error fetching permissions", err);
          }
        }
    
        fetchPermissions(); // Fetch permissions on mount
      }, []);
    
      // Memoize permissions to avoid unnecessary re-calculations
      const memoizedPermissions = useMemo(() => permissions, [permissions]);
    

    return (
        <AppLayout
            filterNodes={
                <>
                {memoizedPermissions?.modules?.godLevel  ? <> 
                
                    <FilterItem
                        minWidth="200px"
                        label="Sales Rep"                       
                        value={filters.saleRepFilter}
                        name = 'Sales Rep'
                        options={salesReps}
                        onChange={(value) => handleFilterChange('saleRepFilter', value)}
                        onFocus={() => setFilters(prev => ({ ...prev, accountFilter: '', manufacturerFilter: '' }))}
                    />
                </> : null }
                    {/* <FilterItem
                        minWidth="200px"
                        label="Account Name"
                        value={filters.accountFilter}
                        name='Account Name'
                        options={accounts}
                        onChange={(value) => handleFilterChange('accountFilter', value)}
                        onFocus={() => setFilters(prev => ({ ...prev, saleRepFilter: '', manufacturerFilter: '' }))} 
                    /> */}
                    
                   
                    <FilterItem
                        minWidth="200px"
                        label="Manufacturer"
                        name = "Manufacturer"
                        value={filters.manufacturerFilter}
                        options={manufacturers}
                        onChange={(value) => handleFilterChange('manufacturerFilter', value)}
                        onFocus={() => setFilters(prev => ({ ...prev, accountFilter: '', saleRepFilter: '' }))}
                    />

<FilterItem
    minWidth="200px"
    label="Account Status"
    name="Account Status"
    value={filters.accountStatusFilter}  // This defaults to 'All'
    options={[
        { label: 'All Accounts', value: 'All' }, 
        { label: 'Active Accounts', value: 'Active Account' }, 
        { label: 'Closed Accounts', value: 'Closed Account' }
    ]}
    onChange={(value) => handleFilterChange('accountStatusFilter', value)}
/>

<FilterSearch
  onChange={(e) => handleFilterChange('accountFilter', e.target.value)}
  value={filters.accountFilter}
  placeholder={"Search by account"}
  minWidth={"167px"}
/>



                    <div>
                    <button className="border px-2 py-1 leading-tight d-grid" onClick={handleClearFilters}>
              <CloseButton crossFill={'#fff'} height={20} width={20} />
              <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>clear</small>
            </button>
                   
                </div>
                    
                     <button className="border px-2 py-1 leading-tight d-grid" onClick={handleExportToExcel}>
            <MdOutlineDownload size={16} className="m-auto" />
            <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>export</small>
          </button>
            
                </>
            }
        >

<div className={Styles.inorderflex}>
        <div>
          <h2>
            Contact Detailed Report
          </h2>
        </div>
        <div></div>
      </div>
           
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
                    <Loading />
                </div>
            ) : (
                <div className={`d-flex p-3 ${Styles.tableBoundary} mb-5`}>
                    <div style={{ maxHeight: "73vh", minHeight: "40vh", overflow: "auto", width: "100%" }}>
                        <table id="salesReportTable" className="table table-responsive" style={{ minHeight: "300px" }}>
                        <thead >
    <tr>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Account Name</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Manufacturer</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>First Name</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Last Name</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Sales Rep</th>
        
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Email</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Phone</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Account Number</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Margin</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Payment Type</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Store Street</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Store City</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Store State</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Store Zip</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Store Country</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Shipping Street</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Shipping City</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Shipping State</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Shipping Zip</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Shipping Country</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Billing Street</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Billing City</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Billing State/Province</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Billing Zip/Postal Code</th>
        <th className={`${styles.th} ${styles.stickyFirstColumnHeading} `} style={{ minWidth: "200px" }}>Billing Country</th>
    </tr>
</thead>

<tbody>
  {filteredRecords.length > 0 ? (
    filteredRecords.map((record, index) => (
      <tr key={index}>
        <td className={`${Styles.td} ${Styles.stickyFirstColumn}`}>{record.AccountId__r?.Name}</td>
        <td className={`${Styles.td} ${Styles.stickyFirstColumn}`}>{record.ManufacturerName__c}</td>
        <td>{record.contact?.FirstName || 'N/A'}</td>
        <td>{record.contact?.LastName || 'N/A'}</td>
        <td>{record.Sales_Rep__r?.Name || 'N/A'}</td>
        <td>{record.contact?.Email || 'N/A'}</td>
        <td>{record.contact?.Phone || 'N/A'}</td>
        <td>{record.Account_Number__c || 'N/A'}</td>
        <td>{record.Margin__c || 'N/A'}</td>
        <td>{record.Payment_Type__c || 'N/A'}</td>
        <td>{record.AccountId__r?.Store_Street__c || 'N/A'}</td>
        <td>{record.AccountId__r?.Store_City__c || 'N/A'}</td>
        <td>{record.AccountId__r?.Store_State__c || 'N/A'}</td>
        <td>{record.AccountId__r?.Store_Zip__c || 'N/A'}</td>
        <td>{record.AccountId__r?.Store_Country__c || 'N/A'}  </td>
        <td className={`${Styles.td}`}>{record.AccountId__r?.ShippingStreet || 'N/A'}</td>
        <td className={`${Styles.td}`}>{record.AccountId__r?.ShippingCity || 'N/A'}</td>
        <td className={`${Styles.td}`}>{record.AccountId__r?.ShippingState || 'N/A'}</td>
        <td className={`${Styles.td}`}>{record.AccountId__r?.ShippingPostalCode || 'N/A'}</td>
        <td className={`${Styles.td}`}>{record.AccountId__r?.ShippingCountry || 'N/A'}</td>
        <td className={`${Styles.td}`}>{record.AccountId__r?.BillingStreet || 'N/A'}</td>
        <td className={`${Styles.td}`}>{record.AccountId__r?.BillingCity || 'N/A'}</td>
        <td className={`${Styles.td}`}>{record.AccountId__r?.BillingState || 'N/A'}</td>
        <td className={`${Styles.td}`}>{record.AccountId__r?.BillingPostalCode || 'N/A'}</td>
        <td className={`${Styles.td}`}>{record.AccountId__r?.BillingCountry || 'N/A'}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="24" >
        {/* Adjust the colSpan value based on the number of columns in your table */}
        <div className={`${styles.NodataText} w-full`}>
          <p>No data found</p>
        </div>
      </td>
    </tr>
  )}
</tbody>

                        </table>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

export default ContactDetailedReport;
