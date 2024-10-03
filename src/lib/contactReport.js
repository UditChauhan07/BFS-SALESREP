// // api.js
// import axios from 'axios';
// import { GetAuthData , DestoryAuth } from './store'; // Import any necessary functions
// import { originAPi } from './store';

// export const fetchAccountDetails = async (
//   setLoading,
//   setAccountManufacturerRecords,
//   setFilteredRecords,
//   setAccounts,
//   setSalesReps,
//   setManufacturers
// ) => {
//   setLoading(true);
//   try {
//     const data = await GetAuthData();
//     if (!data) {
//       console.log("No data found, destroying auth");
//       DestoryAuth();
//       return;
//     }
//     const accessToken = data.access_token;
//     const apiUrl = `${originAPi}/skahHqskfz/NbvBPAyVSQ`;
//     const res = await axios.post(apiUrl, { accessToken });
//     if (res.data) {
//       const records = res.data.records;

//       // Flatten records for easier access
//       const expandedRecords = records.flatMap(record => {
//         const contacts = record.contacts || [];
//         return contacts.length
//           ? contacts.map(contact => ({
//               ...record,
//               contact 
//             }))
//           : [{ ...record, contact: null }];
//       });

//       setAccountManufacturerRecords(expandedRecords);
//       setFilteredRecords(expandedRecords);

//     //   // Prepare unique dropdown options
//       const accountList = Array.from(new Set(expandedRecords.map(record => record.accountDetails?.Name)))
//         .map(name => ({
//           label: name,
//           value: name,
//         }));

//       const salesRepList = Array.from(new Set(expandedRecords.map(record => record.manufacturers?.[0]?.salesRep)))
//         .map(name => ({
//           label: name,
//           value: name,
//         })).filter(item => item.label); // Filter out any null or undefined values

//       const manufacturerList = Array.from(new Set(expandedRecords.map(record => record.manufacturers?.[0]?.manufacturerName)))
//         .map(name => ({
//           label: name,
//           value: name,
//         })).filter(item => item.label); // Filter out any null or undefined values

//       setAccounts(accountList);
//       setSalesReps(salesRepList);
//       setManufacturers(manufacturerList);
//     }
//   } catch (error) {
//     console.error("Error fetching account details:", error);
//   } finally {
//     setLoading(false);
//   }
// };


// api.js
import axios from 'axios';
import { GetAuthData , DestoryAuth } from './store'; // Import any necessary functions
import { originAPi } from './store';

export const fetchAccountDetails = async (
  setLoading,
  setAccountManufacturerRecords,
  setFilteredRecords,
  setAccounts,
  setSalesReps,
  setManufacturers
) => {
  setLoading(true);
  try {
    const data = await GetAuthData();
    if (!data) {
      console.log("No data found, destroying auth");
      DestoryAuth();
      return;
    }
    const accessToken = data.access_token;
    const apiUrl = `${originAPi}/skahHqskfz/NbvBPAyVSQ`;
    const res = await axios.post(apiUrl, { accessToken });
    console.log("API Response:", res.data);
    if (res.data) {
      const records = res.data.records;

      // Flatten records for easier access
      const expandedRecords = records.flatMap(record => {
        const contacts = record.contact || [];
        return contacts.length
          ? contacts.map(contact => ({
              ...record,
              contact 
            }))
          : [{ ...record, contact: null }];
      });

      // Filter out inactive accounts before setting records
      const activeRecords = expandedRecords.filter(record => record.accountDetails?.Active_Closed__c); 
      console.log("active records"  , activeRecords)

      setAccountManufacturerRecords(activeRecords);
      setFilteredRecords(activeRecords);

      // Prepare unique dropdown options
      const accountList = Array.from(new Set(activeRecords.map(record => record.accountDetails?.Name)))
        .map(name => ({
          label: name,
          value: name,
        }));

      const salesRepList = Array.from(new Set(activeRecords.map(record => record.manufacturers?.salesRep)))
        .map(name => ({
          label: name,
          value: name,
        })).filter(item => item.label); // Filter out any null or undefined values

      const manufacturerList = Array.from(new Set(activeRecords.map(record => record.manufacturers?.manufacturerName)))
        .map(name => ({
          label: name,
          value: name,
        })).filter(item => item.label); // Filter out any null or undefined values

      setAccounts(accountList);
      setSalesReps(salesRepList);
      setManufacturers(manufacturerList);
    }
  } catch (error) {
    console.error("Error fetching account details:", error);
  } finally {
    setLoading(false);
  }
};
