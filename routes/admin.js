const express = require("express");
const router = express.Router();
const adminClr = require("../controller/adminCtrl");
const checkJwt = require('../middleware/adminAuth')



router
    .post("/adminlogin", adminClr.adminLog)
    .post("/addproduct",checkJwt.checkJwt, adminClr.addProduct)//changes
    .post("/editproduct",checkJwt.checkJwt, adminClr.productEdit)
    .post("/hublocation",checkJwt.checkJwt, adminClr.postHubLocation)
    .post("/addcategory", checkJwt.checkJwt,adminClr.postAdminAddCategory)
    .get("/deleteproduct",checkJwt.checkJwt, adminClr.delProduct)
    .get("/getproducts",checkJwt.checkJwt, adminClr.getproducts)
    .get("/editproduct",checkJwt.checkJwt, adminClr.editProduct)
    .get("/getcategory",checkJwt.checkJwt, adminClr.getCategory)
    .get("/orders", checkJwt.checkJwt,adminClr.orders)
    .get('/vieworder',checkJwt.checkJwt, adminClr.viewOrder)
    .get('/orderCancel',checkJwt.checkJwt, adminClr.orderCancel)
    .get('/userlist', checkJwt.checkJwt,adminClr.allUsers)
    .get('/orderstatus', checkJwt.checkJwt,adminClr.changeOrderStatus)
    .get('/blockuser', checkJwt.checkJwt,adminClr.block)
    .get('/unblockuser',checkJwt.checkJwt, adminClr.unblock)
    .get('/revenue_user',checkJwt.checkJwt,adminClr.revenueUser)
    .get('/salesreport',checkJwt.checkJwt,adminClr.salesReport)
    .get('/clearcoin',checkJwt.checkJwt,adminClr.clearCoin)
    .get('/setdate',checkJwt.checkJwt,adminClr.setDate)
    .get('/openorclose',checkJwt.checkJwt,adminClr.openorclose)
    .get('/postopenorclose',checkJwt.checkJwt,adminClr.postOpenorclose)



module.exports = router;