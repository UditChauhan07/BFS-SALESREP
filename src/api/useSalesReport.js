import axios from "axios";

const useSalesReport = () => {
  return {
    salesReportData: async ({yearFor}) => {
      let salesRepId = JSON.parse(localStorage.getItem("Api Data")).data.Sales_Rep__c;
      let reportUrl = "https://dev.beautyfashionsales.com/9kJs2I6Bn/i0IT68Q8&0";
      if(salesRepId=="00530000005AdvsAAC"){
        reportUrl = "https://dev.beautyfashionsales.com/report/4i1cKeDt9"
      }
      const response = await axios.post(
        reportUrl,
        {
          salesRepId: salesRepId,
          yearFor:yearFor
        }
      );
      // const response = await axios.post("https://dev.beautyfashionsales.com/report/4i1cKeDt9");
      if(salesRepId=="00530000005AdvsAAC"){
        response.data.ownerPermission = true;
      }
      return response;
    },
  };
};

export default useSalesReport;
