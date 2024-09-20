import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GetAuthData } from "../../../lib/store";
import { getPermissions } from "../../../lib/permission";
import PermissionDenied from "../../PermissionDeniedPopUp/PermissionDenied";
import styles from "../topNav/index.module.css";
import { SearchIcon } from "../../../lib/svg";
import { useBag } from "../../../context/BagContext";
const LogoHeader = () => {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState(null);
  const { orderQuantity } = useBag();
  useEffect(() => {
    async function fetchPermissions() {
      try {
        const user = await GetAuthData(); // Fetch user data
        const userPermissions = await getPermissions(); // Fetch permissions
        setPermissions(userPermissions); // Set permissions in state
      } catch (err) {
        console.error("Error fetching permissions", err);
      }
    }

    fetchPermissions(); // Fetch permissions on mount
  }, []);

  // Memoize permissions to avoid unnecessary re-calculations
  const memoizedPermissions = useMemo(() => permissions, [permissions]);

  // Handle restricted access
  const handleRestrictedAccess = () => {
    PermissionDenied();
  };

  return (
    <div className={styles.laptopModeSticky}>
      <div className={`${styles.laptopMode}`}>
        {/* My Retailers */}
        <div className={`${styles.lapSetting} d-none-print`}>
          <p className={`m-0  ${styles.language}`}>
            {memoizedPermissions?.modules?.order?.create ? (
              <Link to="/my-retailers" className="linkStyle">
                My Retailers
              </Link>
            ) : (
              <span
                onClick={handleRestrictedAccess}
                className="linkStyle"
                style={{ cursor: "not-allowed", color: "grey" }}
              >
                My Retailers
              </span>
            )}
          </p>

          {/* New Arrivals */}
          <p className={`m-0   ${styles.language}`}>
            {memoizedPermissions?.modules?.newArrivals?.view ? (
              <Link to="/new-arrivals" className="linkStyle">
                New Arrivals
              </Link>
            ) : (
              <span
                onClick={handleRestrictedAccess}
                className="linkStyle"
                style={{ cursor: "not-allowed", color: "grey" }}
              >
                New Arrivals
              </span>
            )}
          </p>

          {/* Brands */}
          <p className={`m-0   ${styles.language}`}>
            {memoizedPermissions?.modules?.brands?.view ? (
              <Link to="/brand" className="linkStyle">
                Brands
              </Link>
            ) : (
              <span
                onClick={handleRestrictedAccess}
                className="linkStyle"
                style={{ cursor: "not-allowed", color: "grey" }}
              >
                Brands
              </span>
            )}
          </p>
        </div>

        {/* Logo */}
        <div className={styles.lapSetting}>
          <Link to="/dashboard" className={`linkStyle`}>
            <img src={"/assets/images/BFSG_logo.svg"} alt="logo" />
          </Link>
        </div>

        {/* Dashboard & My Bag */}
        <div className={`${styles.lapSetting} d-none-print`}>
          {/* Dashboard */}
          <p className={`m-0 w-[100px]  ${styles.language} flex`}>
            <a href="#search" data-rr-ui-event-key="#search" className=" pr-0 nav-link active"><div className="search-container"><input className="search expandright" id="searchright" type="search" name="" placeholder="Search..." /><label className="button searchbutton" for="searchright"><span className="searchCode">Search...</span> <span className="mglass">
              <SearchIcon />
            </span> </label></div></a>
            {/* <img src={"/assets/images/searchIcon.svg"} alt="img" /> */}
          </p>
          <p className={`m-0  ${styles.language}`}>
            {/* {memoizedPermissions?.modules?.dashboard?.view ? ( */}
              <Link to="/dashboard" className="linkStyle">
                Dashboard
              </Link>
            {/* ) : (
              <span
                onClick={handleRestrictedAccess}
                className="linkStyle"
                style={{ cursor: "not-allowed", color: "grey" }}
              >
                Dashboard
              </span>
            )} */}
          </p>

          {/* My Bag */}

          {memoizedPermissions?.modules?.order?.create ? <>
            <p className={`m-0  ${styles.language}`}>
              {orderQuantity ? <Link to="/my-bag" className={`linkStyle`}> My Bag ({orderQuantity})
              </Link> : "My Bag(0)"}
            </p>
          </> :
            <p className={`m-0  ${styles.language}`} style={{ cursor: "not-allowed", color: "grey" }} onClick={handleRestrictedAccess}>

              {orderQuantity ? <span className={`linkStyle`} > My Bag ({orderQuantity})
              </span> : "My Bag(0)"}
            </p>
          }


        </div>
      </div>
    </div>
  );
};

export default LogoHeader;
