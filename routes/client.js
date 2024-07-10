const express = require("express");
const router = express.Router();
const clientClr = require("../controller/clientCtrl");
const checkJwt = require('../middleware/clientAuth')



// router
//     //.get("/", clientClr.home)
//     .post("/login", clientClr.login)
//     .get("/getproducts", clientClr.getProducts)
//     .get("/getlocation", clientClr.getlocation)
//     .get("/uniquecategory", clientClr.findUniqueCategories)
//     .get("/viewproduct", clientClr.productView)

    router
    //.get("/", clientClr.home)
    //.post("/signup", clientClr.postLogin)
    .post("/login",(req,res,next)=>{console.log(';;;',req); next()}, clientClr.login)
    //.post("/verify-otp", clientClr.verifyOtp)
    .get("/getproducts", clientClr.getProducts)
    .get("/getlocation", clientClr.getlocation)
    .get("/uniquecategory", clientClr.findUniqueCategories)
    .get("/viewproduct", clientClr.productView)
    // .get("/categoryproducts", clientClr.findCategoryProduct)
    .get("/addtocart", checkJwt.checkJwt,clientClr.addToCart)
    .get('/increment',checkJwt.checkJwt, clientClr.incrementProductInCart)
    .get('/decrement',checkJwt.checkJwt, clientClr.decrementProductInCart)
    .post('/placeorder',checkJwt.checkJwt, clientClr.placeOrder)
    .get('/cartitems',checkJwt.checkJwt, clientClr.getCartItems)
    .get('/CartItemsCount',checkJwt.checkJwt, clientClr.getCartItemsCount)
    .get('/searchProducts', clientClr.searchProducts)
    .get("/categoryproducts", clientClr.findCategoryProduct)
    .get("/getorder",checkJwt.checkJwt, clientClr.orders)
    .get('/vieworder', clientClr.viewOrder)
    .get('/checkout',checkJwt.checkJwt, clientClr.checkout)
    .post('/varifyotp', clientClr.otpVarification)
    .get('/getdate',checkJwt.checkJwt,clientClr.getDate)
    .get('/cartdetail-checkout',checkJwt.checkJwt,clientClr.getCartDetailcheckout)










module.exports=router;