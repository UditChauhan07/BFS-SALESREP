import Styles from "./Styles.module.css";
import { DeleteIcon } from "../../lib/svg";
import QuantitySelector from "../BrandDetails/Accordion/QuantitySelector";
import Slider from "../../utilities/Slider";

import { Link } from "react-router-dom";
import { useState } from "react";
import { DateConvert } from "../../lib/store";
const ProductDetailCard = ({ product, orders, onPriceChangeHander = null, onQuantityChange = null, isAddtoCart, AccountId, toRedirect }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  if (!product) {
    return null;
  }
  let listPrice = Number(product?.data?.usdRetail__c?.replace("$", "").replace(",", ""));
  let salesPrice = 0;
  let discount = product?.discount?.margin;
  let inputPrice = Object.values(orders)?.find(
    (order) =>
      order.product.Id === product?.data?.Id && order.manufacturer.name === product?.data?.ManufacturerName__c && order.account.id === AccountId
  )?.product?.salesPrice;
  if (product?.data?.Category__c === "TESTER") {
    discount = product?.discount?.testerMargin;
    salesPrice = (+listPrice - (product?.discount?.testerMargin / 100) * +listPrice).toFixed(2);
  } else if (product?.data?.Category__c === "Samples") {
    discount = product?.discount?.sample;
    salesPrice = (+listPrice - (product?.discount?.sample / 100) * +listPrice).toFixed(2);
  } else {
    salesPrice = (+listPrice - (product?.discount?.margin / 100) * +listPrice).toFixed(2);
  }
  let fakeProductSlider = [
    {
      src: "\\assets\\images\\dummy.png",
    },
  ];
  return (
    <div className="container mt-4 product-card-element">
      <div className="d-flex">
        <div className={`${Styles.productimage} col-4`} style={{ flex: '40% 1' }}>
          {product?.data?.imgSrc?.length > 0 ? <Slider data={product?.data?.imgSrc} /> : <Slider data={fakeProductSlider} />}
        </div>
        <div className="col-8 ml-4 product-card-element-holder" style={{ flex: '60% 1' }}>
          <p style={{ textAlign: "start" }}>
            <b>BY</b>, <Link to={'/Brand/' + product.data.ManufacturerId__c} className={Styles.brandHolder}><b>{product?.data?.ManufacturerName__c}</b></Link>
          </p>
          <h2 className={Styles.nameHolder}>
            {product?.data?.Name}
          </h2>
          {product?.discount ? (
            <p className={Styles.priceHolder}>
              ${salesPrice}&nbsp;<span className={Styles.crossed}>{product?.data?.usdRetail__c}</span>
            </p>
          ) : (
            <p className={Styles.priceHolder}>
              <b>{product?.data?.usdRetail__c}</b>
            </p>
          )}
          {product?.data?.Description && (
            <p className={Styles.descHolder}>
              {product.data.Description.length > 750 ? (
                isDescriptionExpanded ? (
                  product.data.Description
                ) : (
                  product.data.Description.substring(0, 750) + "..."
                )
              ) : (
                product.data.Description
              )}
              {product.data.Description.length > 750 && (
                <button style={{ textDecoration: 'underline' }} onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                  {isDescriptionExpanded ? 'Learn Less' : 'Learn More'}
                </button>
              )}
            </p>
          )}
          {isAddtoCart && product?.discount ? (
            <>
              <>
                {orders[product?.data?.Id] ? (
                  <div className="d-flex flex-column">
                    <p style={{ textAlign: "start" }}>
                      $
                      <input
                        type="number"
                        className={Styles.priceInputHolder}
                        value={inputPrice}
                        placeholder={Number(inputPrice).toFixed(2)}
                        onChange={(e) => {
                          onPriceChangeHander(
                            product?.data,
                            e.target.value < 10 ? e.target.value.replace("0", "").slice(0, 4) : e.target.value.slice(0, 4) || 0
                          );
                        }}
                        id="limit_input"
                        minLength={0}
                        maxLength={4}
                        name="limit_input"
                      />
                    </p>
                    <div className="d-flex gap-1">
                      <QuantitySelector
                        min={product?.data?.Min_Order_QTY__c || 0}
                        value={orders[product?.data?.Id]?.quantity}
                        onChange={(quantity) => {
                          onQuantityChange(product?.data, quantity, inputPrice || parseFloat(salesPrice), discount);
                        }}
                      />

                      <button className="ml-4" onClick={() => onQuantityChange(product?.data, 0, inputPrice || parseFloat(salesPrice), discount)}>
                        <DeleteIcon fill="red" />
                      </button>
                    </div>

                    <p className="mt-3" style={{ textAlign: "start" }}>
                      Total: <b>{inputPrice * orders[product?.data?.Id]?.quantity}</b>
                    </p>
                  </div>
                ) : (
                  <button
                    className={Styles.button}
                    onClick={() =>
                      onQuantityChange(product?.data, product?.data?.Min_Order_QTY__c || 1, inputPrice || parseFloat(salesPrice), discount)
                    }
                  >
                    Add to cart
                  </button>
                )}
              </>
            </>
          ) : (
            <div className="d-flex align-items-center gap-4 h-[5rem] ">
              {toRedirect && <Link to={toRedirect} className={Styles.button}>
                Add to cart
              </Link>}
            </div>
          )}
          {/* {product?.data?.Description && <p style={{ textAlign: 'start', color: "#898989" }}>{product?.data?.Description}</p>} */}
          <hr style={{ borderTop: "3px dashed #000", fontSize: "20px", color: "black" }}></hr>
          {product?.data?.ProductCode && <p className={Styles.descHolder}>
            Product Code: <span >{product?.data?.ProductCode}</span>
          </p>}
          {product?.data?.ProductUPC__c && <p className={Styles.descHolder}>
            Product UPC: <span >{product?.data?.ProductUPC__c}</span>
          </p>}
          {product?.data?.Min_Order_QTY__c &&
            <p className={Styles.descHolder}>
              Min Order QTY: <span >{product?.data?.Min_Order_QTY__c}</span>
            </p>}
          {product?.data?.Category__c && (
            <p className={Styles.descHolder}>
              Category: <span >{product?.data?.Category__c}</span>
            </p>
          )}
          {product.data?.Collection__c && (
            <p className={Styles.descHolder}>
              Collection: <span >{product.data?.Collection__c}</span>
            </p>
          )}
        </div>
      </div>
      <hr></hr>
      {product.data?.Full_Product_Description__c && product.data?.Full_Product_Description__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span >Full Product Description:</span> {product.data?.Full_Product_Description__c}
        </p>
      )}
      {product.data?.Desired_Result__c && product.data?.Desired_Result__c != "N/A" && (
        <div
          className={Styles.descHolder}
          dangerouslySetInnerHTML={{ __html: `<span>Desired Result:</span> ${product.data?.Desired_Result__c}` }}
        />
      )}
      {product.data?.Key_Ingredients__c && product.data?.Key_Ingredients__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span>Key Ingredients:</span> {product.data?.Key_Ingredients__c}
        </p>
      )}
      {product.data?.Full_Ingredients_List__c && product.data?.Full_Ingredients_List__c != "N/A" && (
        <p className={Styles.descHolder}>
          {" "}
          <span >Ingredients List:</span> {product.data?.Full_Ingredients_List__c}
        </p>
      )}
      {product.data?.Size_Volume_Weight__c && product.data?.Size_Volume_Weight__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span >Size (Volume/Weight):</span> {product.data?.Size_Volume_Weight__c}
        </p>
      )}
      {product.data?.Skin_Tone__c && product.data?.Skin_Tone__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span >Skin Tone:</span> {product.data?.Skin_Tone__c}
        </p>
      )}
      {product.data?.Skin_Type__c && product.data?.Skin_Type__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span >Skin Type:</span> {product.data?.Skin_Type__c}
        </p>
      )}
      {product.data?.Travel_or_Full_Size__c && product.data?.Travel_or_Full_Size__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span>Product Size:</span> {product.data?.Travel_or_Full_Size__c}
        </p>
      )}
      {product?.data?.Newness_Alias__c && product.data?.Newness_Alias__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span>Product Newness Name:</span> {product?.data?.Newness_Alias__c}
        </p>
      )}
      {product?.data?.Newness_Start_Date__c && product.data?.Newness_Start_Date__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span>Product Newness Start Date:</span> {product?.data?.Newness_Start_Date__c}
        </p>
      )}
      {product?.data?.Newness_Report_End_Date__c && product.data?.Newness_Report_End_Date__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span>Product Newness End Date:</span> {product?.data?.Newness_Report_End_Date__c}
        </p>
      )}
      {product?.data?.Season__c && product.data?.Season__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span>Season:</span> {product?.data?.Season__c},
        </p>
      )}
      {product?.data?.CreatedDate && product.data?.CreatedDate != "N/A" && (
        <p className={Styles.descHolder}>
          <span>Create Date:</span> {new Date(product?.data?.CreatedDate).toDateString()}
        </p>
      )}
      {product?.data?.Launch_Date__c && product.data?.Launch_Date__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span >Launch Date:</span> {DateConvert(product?.data?.Launch_Date__c)}
        </p>
      )}
      {product?.data?.Ship_Date__c && product.data?.Ship_Date__c != "N/A" && (
        <p className={Styles.descHolder}>
          <span>Ship Date:</span> {DateConvert(product?.data?.Ship_Date__c)}
        </p>
      )}
      {/* <p style={{ textAlign: 'start' }}>Product Edit Date: {new Date(product?.data?.LastModifiedDate).toDateString()},</p> */}
      {(product.data?.Point_of_difference_1__c || product.data?.Point_of_difference_2__c || product.data?.Point_of_difference_3__c) && (
        <p className={Styles.descHolder}>
          <span>Point of difference:</span>
          <ol>
            {product.data?.Point_of_difference_1__c && <li><span>#1:</span> {product.data?.Point_of_difference_1__c}</li>}
            {product.data?.Point_of_difference_2__c && <li><span>#2:</span> {product.data?.Point_of_difference_2__c}</li>}
            {product.data?.Point_of_difference_3__c && <li><span>#3:</span> {product.data?.Point_of_difference_3__c}</li>}
          </ol>
        </p>
      )}
      {product.data?.Usage_and_Application_Tips__c && (
        <p className={Styles.descHolder}>
          <span>Usage and Application Tips:</span>
          {product.data?.Usage_and_Application_Tips__c}
          {product.data?.Use_it_with_Option_1__c || product.data?.Use_it_with_Option_2__c || product.data?.Use_it_with_Option_3__c ?
            <>
              <br />
              <br />
              <span>Use it with</span>
              <ol>
                {product.data?.Use_it_with_Option_1__c && <li><span>#1:</span> {product.data?.Use_it_with_Option_1__c}</li>}
                {product.data?.Use_it_with_Option_2__c && <li><span>#2:</span> {product.data?.Use_it_with_Option_2__c}</li>}
                {product.data?.Use_it_with_Option_3__c && <li><span>#3:</span> {product.data?.Use_it_with_Option_3__c}</li>}
              </ol>
            </>
            : <>{" "}</>}
        </p>
      )}
    </div>
  );
};
export default ProductDetailCard;
