import { useEffect, useMemo, useState } from "react";
import { GetAuthData, getProductDetails, getRetailerList } from "../lib/store";
import Loading from "../components/Loading";
import { useBag } from "../context/BagContext";
import ModalPage from "../components/Modal UI";
import ProductDetailCard from "../components/ProductDetailCard";
import { CloseButton } from "../lib/svg";
import Select from 'react-select';
import { getPermissions } from "../lib/permission";

const ProductDetails = ({ productId, setProductDetailId, isAddtoCart = true, AccountId = null, ManufacturerId = null, toRedirect = "/my-retailers" }) => {
    const { orders, setOrders, setOrderQuantity, addOrder, setOrderProductPrice } = useBag();
    const [product, setProduct] = useState({ isLoaded: false, data: [], discount: {} });
    const [replaceCartModalOpen, setReplaceCartModalOpen] = useState(false);
    const [replaceCartProduct, setReplaceCartProduct] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [accountList, setAccountList] = useState({ isLoaded: false, data: [] });
    const [accountId, setAccountId] = useState({ label: null, value: AccountId });
    const [storeSel, setStoreSet] = useState(false)
    const [autoSelectCheck, setAutoSelectCheck] = useState(false)
    const [createOrder,setCreateOrder] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userPermissions = await getPermissions()
                setCreateOrder(userPermissions?.modules?.order?.create)
            } catch (error) {
                console.log("Permission Error", error)
            }
        }
        fetchData()
    }, [])

    const formattedPrice = useMemo(() => {
        const prices = product?.data?.price; // Assume price is in product.data.price
        if (Array.isArray(prices)) {
          return prices.join(" or ");
        }
        return prices || "Price not available";
      }, [product]);
    useEffect(() => {
        if (productId) {
            setIsModalOpen(true)
            GetAuthData().then((user) => {
                setProduct({ isLoaded: false, data: [], discount: {} })
                if ((!accountId?.value && !orders[productId])) {
                    getRetailerList({ key: user.x_access_token, userId: user?.Sales_Rep__c, manufacturerid: ManufacturerId }).then((accountRes) => {
                        setAccountList({ data: accountRes.data, isLoaded: true })
                        if (accountRes.data.length == 1) {
                            setAccountId({ label: accountRes.data[0].Name, value: accountRes.data[0].Id })
                        }
                        let rawData = { productId: productId, key: user.x_access_token, salesRepId: user?.Sales_Rep__c, accountId: accountId?.value }
                        getProductDetails({ rawData }).then((productRes) => {
                            setProduct({ isLoaded: true, data: productRes.data, discount: productRes.discount })
                        }).catch((proErr) => {
                            console.log({ proErr });
                        })
                    }).catch((accountErr) => {
                        console.log({ accountErr });

                    })
                } else {
                    let actId = accountId?.value
                    if (orders[productId] && !actId) {
                        actId = orders[productId]?.account?.id;
                        setAccountId({ label: orders[productId]?.account?.name, value: orders[productId]?.account?.id })
                    }
                    let rawData = { productId: productId, key: user.x_access_token, salesRepId: user?.Sales_Rep__c, accountId: actId }
                    getProductDetails({ rawData }).then((productRes) => {
                        setProduct({ isLoaded: true, data: productRes.data, discount: productRes.discount })
                    }).catch((proErr) => {
                        console.log({ proErr });
                    })
                }
            }).catch((err) => {
                console.log({ err });
            })
        }
        console.log({ productId, accountId });

    }, [productId, accountId])

    useEffect(() => {
        if (accountId.value) {
            accountList.data.map((account) => {
                if (accountId.value == account.Id) {

                    //write code here
                    localStorage.setItem("Account", account.Name);
                    localStorage.setItem("AccountId__c", account.Id);
                    localStorage.setItem("address", JSON.stringify(account.ShippingAddress));

                    if (account.data.length) {
                        account.data.map((brand) => {
                            if (brand.ManufacturerId__c == product.data.ManufacturerId__c) {
                                console.log({ brand });

                                localStorage.setItem("shippingMethod", JSON.stringify({ number: brand.Shipping_Account_Number__c, method: brand.Shipping_Method__c }))
                            }
                        })
                    }
                    localStorage.setItem("manufacturer", product.data.ManufacturerName__c);
                    localStorage.setItem("ManufacturerId__c", product.data.ManufacturerId__c);

                }
            })
        }

    }, [accountId, accountList, product])



    if (!productId) return null;


    const orderSetting = (element, quantity) => {
        setReplaceCartModalOpen(false);
        addOrder(element, quantity, product.discount);
    };
    const onQuantityChange = (element, quantity, salesPrice = null, discount = null) => {
        element.salesPrice = salesPrice;
        if (Object.values(orders).length) {
            if (
                Object.values(orders)[0]?.manufacturer?.id === ManufacturerId &&
                Object.values(orders)[0].account.id === (AccountId || accountId.value) &&
                Object.values(orders)[0].productType === (element.Category__c === "PREORDER" ? "pre-order" : "wholesale")
            ) {
                orderSetting(element, quantity);
                setReplaceCartModalOpen(false);
            } else {
                setReplaceCartModalOpen(true);
                setReplaceCartProduct({ product: element, quantity });
            }
        } else {
            orderSetting(element, quantity);
        }
    };
    const onPriceChangeHander = (element, price = '0') => {
        if (price == '') price = 0;
        setOrderProductPrice(element, price)
    }
    const replaceCart = () => {
        localStorage.removeItem("orders");
        setReplaceCartModalOpen(false);
        setOrderQuantity(0);
        setOrders({});
        addOrder(replaceCartProduct.product, replaceCartProduct.quantity, product.discount);
    };
    let styles = {
        btn: { color: '#fff', fontFamily: 'Montserrat-600', fontSize: '14px', fontStyle: 'normal', fontWeight: 600, lineHeight: 'normal', letterSpacing: '1.4px', backgroundColor: '#000', width: '100px', height: '30px', cursor: 'pointer' }
    }
    let orderofThisProduct = orders[product?.data?.Id];
    if (orderofThisProduct?.manufacturer?.name == product?.data?.ManufacturerName__c && orderofThisProduct?.account?.name == localStorage.getItem("Account")) {
    }

    const ModalCloseHandler = () => {
        setIsModalOpen(false); setProductDetailId(); setAccountId({ label: null, value: null }); setAccountList({ isLoaded: false, data: [] }); setAutoSelectCheck(false);
    }


    return (
        <>
            {isModalOpen && <ModalPage
                open
                content={
                    <div className="d-flex flex-column gap-3" style={{ width: '75vw' }}>
                        <div style={{
                            position: 'sticky',
                            top: '-20px',
                            background: '#fff',
                            zIndex: 1,
                            padding: '15px 0 0 0'
                        }}>
                            <div className="d-flex align-items-center justify-content-between" style={{ minWidth: '75vw' }}>
                                <h1 className="font-[Montserrat-500] text-[22px] tracking-[2.20px] m-0 p-0">Product Details</h1>
                                <button type="button" onClick={() => { setIsModalOpen(false); setProductDetailId(null) }}>
                                    <CloseButton />
                                </button>
                            </div>
                            <hr />
                        </div>
                        {storeSel &&
                            <ModalPage
                                open={storeSel || false}
                                content={
                                    <div className="d-flex flex-column gap-3">
                                        <h2>{accountList.data.length ? "Select Store to see Details" : "Alert!"}</h2>
                                        <p>
                                            {accountList.data.length ?
                                                <Select
                                                    value={accountId}
                                                    onChange={(value) => { setAccountId(value); setStoreSet(false);  setOrders({});  addOrder(product.data, product?.data?.Min_Order_QTY__c, product.discount);}}
                                                    options={accountList.data.map((value) => {
                                                        return { value: value.Id, label: value.Name };
                                                    })}
                                                /> : <>
                                                    <p>
                                                        You can't but this brand Product
                                                        <br />
                                                        Contact to SalesForce Admin.
                                                    </p>
                                                    <div className="d-flex justify-content-around ">
                                                        <button style={styles.btn} onClick={() => setStoreSet(false)}>
                                                            OK
                                                        </button>
                                                    </div>
                                                </>}
                                        </p>
                                    </div>
                                }
                                onClose={() => {
                                    setStoreSet(false)
                                }}
                            />}
                        {replaceCartModalOpen ? (
                            <ModalPage
                                open
                                content={
                                    <div className="d-flex flex-column gap-3">
                                        <h2>Warning</h2>
                                        <p>
                                            Adding this item will replace <br></br> your current cart
                                        </p>
                                        <div className="d-flex justify-content-around ">
                                            <button style={styles.btn} onClick={replaceCart}>
                                                OK
                                            </button>
                                            <button style={styles.btn} onClick={() => setReplaceCartModalOpen(false)}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                }
                                onClose={() => {
                                    setReplaceCartModalOpen(false);
                                }}
                            />
                        ) : null}
                        {!product?.isLoaded ? <Loading /> :
                            <ProductDetailCard product={product} orders={orders} onQuantityChange={onQuantityChange} onPriceChangeHander={onPriceChangeHander} isAddtoCart={accountId.value ? true : false} AccountId={AccountId} toRedirect={toRedirect} setStoreSet={setStoreSet} accountId={accountId} accounts={accountList.isLoaded ? accountList.data.length : 'load'} autoSelectCheck={autoSelectCheck} createOrder={createOrder}/>}
                        {/* */}
                    </div>
                }
                onClose={ModalCloseHandler}
            />}
        </>
    );
};
export default ProductDetails;