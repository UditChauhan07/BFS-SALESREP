import React from 'react'
import LogoHeader from '../components/All Headers/logoHeader/LogoHeader'
import TopNav from '../components/All Headers/topNav/TopNav'
import Header from '../components/All Headers/header/Header'
import HelpSection from '../components/Footer/HelpSection'
import Footer from '../components/Footer/Footer'
import Layout from "../components/Layout/Layout";


const MarketingCalendar = () => {
  return (
    <>

<Layout>
            <div>
                <div className="col-12">
                    <div className="filter-container  ">
                    </div>
                </div>
                <div>
                <div className="row d-flex flex-column justify-content-around align-items-center lg:min-h-[300px] xl:min-h-[400px]">
        <div className="col-4">
            <p className="m-0 fs-2 font-[Montserrat-400] text-[14px] tracking-[2.20px]">Coming Soon...</p>
        </div>
        </div>
                    {/* <OrderStatusFormSection /> */}
                </div>
            </div>
        </Layout>
      </>
   
  )
}

export default MarketingCalendar