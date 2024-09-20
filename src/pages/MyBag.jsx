import React , {useState , useEffect} from "react";
import AppLayout from "../components/AppLayout";
import MyBagFinal from "../components/MyBagFinal";
import { GetAuthData } from "../lib/store";
import { getPermissions } from "../lib/permission";
import { useNavigate } from "react-router-dom";

const MyBag = () => {
  const [selectedSalesRepId, setSelectedSalesRepId] = useState();
  const [userData, setUserData] = useState({});
  const [hasPermission, setHasPermission] = useState(null);
  const navigate = useNavigate()
      // Fetch user data and permissions
      useEffect(() => {
        const fetchData = async () => {
          try {
            const user = await GetAuthData();
            setUserData(user);
    
            if (!selectedSalesRepId) {
              setSelectedSalesRepId(user.Sales_Rep__c);
            }
    
            const userPermissions = await getPermissions();
            setHasPermission(userPermissions?.modules?.order?.create);
    
            // If no permission, redirect to dashboard
            if (userPermissions?.modules?.order?.create === false) {
              navigate("/dashboard");
            }
            
          } catch (error) {
            console.log({ error });
          }
        };
        
        fetchData();
      }, [navigate, selectedSalesRepId]);
    
      // Check permission and handle redirection
      useEffect(() => {
        if (hasPermission === false) {
          navigate("/dashboard");  // Redirect if no permission
        }
      }, [hasPermission, navigate]);
    
  return (
    <AppLayout>
      <MyBagFinal />
    </AppLayout>
  );
};

export default MyBag;