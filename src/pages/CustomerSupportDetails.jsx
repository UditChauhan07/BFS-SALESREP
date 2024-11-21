import { useSearchParams } from "react-router-dom";
import FullQuearyDetail from "../components/CustomerSupportPage/FullQuearyDetail";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { GetAuthData, getSupportDetails } from "../lib/store";
import Loading from "../components/Loading";
import AppLayout from "../components/AppLayout";

const CustomerSupportDetails = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [deatilsId, setDetailsId] = useState(searchParams.get("id"));
  const [detailsData, setDetailsData] = useState({});
  const [isLoaded, setLoaded] = useState(false);
  const [reset,setRest] = useState(false);
  useEffect(() => {
    GetAuthData()
      .then((user) => {
        let rawData = { key: user.x_access_token, caseId: deatilsId };
        getSupportDetails({ rawData })
          .then((deatils) => {
            console.log({deatils});
            deatils.salesRepName = user.Name;
            deatils.salesRepId = user.Sales_Rep__c;
            setDetailsData(deatils);
            setLoaded(true);
            setRest(false)
          })
          .catch((err) => {
            console.error({ err });
          });
      })
      .catch((error) => {
        console.error({ error });
      });
  }, [deatilsId,reset]);
  if (!deatilsId || deatilsId == "") return navigate("/customer-support");
  if (!isLoaded) return  <AppLayout><Loading height={'80vh'} /></AppLayout>;
  return (
    <AppLayout>
      <FullQuearyDetail data={detailsData} setRest={setRest}/>
    </AppLayout>
  );
};
export default CustomerSupportDetails;
