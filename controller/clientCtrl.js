const productsCls = require("../model/productModel");
const hubLocationCls = require("../model/pickUpHub");
const clientCls = require("../model/clientModel");
const categoryCls = require("../model/categoryModel");
const cartCls = require("../model/cartModel");
const OrderCls = require("../model/orderModel");
const ShopDetail = require("../model/openOrClose");

const { nodeMailer } = require("../utilities/nodeMailer");
const { verifyotp, sendotp } = require("../utilities/twilio"); // Import your Twilio functions
const moment = require('moment');


const jwt = require("jsonwebtoken");

var reqOtp;

const login = async (req, res) => {
  try {
    console.log(req,'oo');
    const { inputValue, mailOrPhone } = req.body;
    console.log(req.body, inputValue, mailOrPhone,';;');
    let userExist;
    if (mailOrPhone == "email") {
      userExist = await clientCls.findOne({ email: inputValue });
    } else {
      userExist = await clientCls.findOne({ phoneNumber: inputValue });
    }
    if(userExist ||req.body.name){
      if (mailOrPhone == "email") {
        const otp = nodeMailer(inputValue);
        // req.otp = otp
        reqOtp = otp;
        // console.log(req.otp,'ppp');
        return res.status(200).json({ success: true, message: "Success" });
      } else {
        const data = await sendotp(inputValue);
        res
          .status(200)
          .json({
            success: true,
            message: "user is exist",
            
          });
      }

    }else{
      res.status(202).json({success:false,message:"user Name is not available"})

    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const otpVarification = async (req, res) => {
  const { inputValue, otp, mailOrPhone,name } = req.body;

  if (mailOrPhone == "email") {
    if (reqOtp == otp) {
      let userExist = await clientCls.findOne({ email:inputValue  })
      if (!userExist) {
        userExist = clientCls({
            phoneNumber: "",
            email: inputValue,
            name:name

          });
          userExist.save();
      }
      // const token = jwt.sign({ user_id: userExist._id }, "faheem", {
      //   expiresIn: 7862400, // 3 months in seconds
      // });      
      const user_id = userExist._id;

      // Set expiry for one day (24 hours)
      const token = jwt.sign({ user_id }, "faheem", {
        expiresIn: '1d', // 1 day
      });
      
      res
        .status(200)
        .json({ success: true, message: "OTP verified", token: token,name:userExist.name });
    } else {
      res.status(202).json({ success: false });
    }
  } else {
    const verification = await verifyotp(inputValue, otp);
    if (verification.status === "approved") {
        let userExist = await clientCls.findOne({ phoneNumber: inputValue })
        if (userExist== null) {
          userExist = clientCls({
            phoneNumber: inputValue,
           
            });

            userExist.save();

        }

      const token = jwt.sign({ user_id: userExist._id }, "faheem", {
        expiresIn: "1h",
      });

      res
        .status(200).json({ success: true, message: "OTP verified", token: token,name:'' });
    } else {
      res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  }
};

const getProducts = async (req, res) => {
  try {
    const product = await productsCls.find({ isDelete: false }).lean();
    if (!product || product.length === 0) {
      return res.status(404).send({ message: "Products not found" });
    }
    return res.status(200).json({ products: product, message: "Success" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

const getlocation = async (req, res) => {
  try {
    const location = await hubLocationCls.find({}).lean();
    if (!location) {
      return res.status(404).send({ message: "Product not found" });
    }
    return res.status(200).json({ location: location, message: "Success" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

const findUniqueCategories = async (req, res) => {
  try {
    const categories = await categoryCls.find({}).lean();

    if (!categories || categories.length === 0) {
      return res
        .status(404)
        .send({ success: false, message: "Categories not found" });
    }

    return res
      .status(200)
      .json({
        success: true,
        message: "Categories retrieved successfully",
        categories,
      });
  } catch (error) {
    return res
      .status(500)
      .send({
        success: false,
        message: "Something went wrong",
        error: error.message,
      });
  }
};

const productView = async (req, res) => {
  try {
    const productId = req.query.id;
    const singleProduct = await productsCls.findOne({ _id: productId });

    if (!singleProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res
      .status(200)
      .json({ message: "Success", singleProduct: singleProduct });
  } catch (error) {
    console.error("Error deleting product:", error); // Log the error for debugging purposes
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { userId, productId, unitType, unit } = req.query;

    if (!userId || !productId || !unitType || !unit) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const find_product = await productsCls.findById(productId);
    if (!find_product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const find_cart = await cartCls.findOne({ owner: req.id });

    let product_quntity_chck = 0;

    if (find_cart) {
      const findCat_total_quntity = find_cart.item.filter(
        (element) => element.product == productId
      );
      findCat_total_quntity.forEach((element) => {
        let q = element.quantity;
        if (element.unitType === "G") {
          const weightInGrams = parseInt(element.quantity);
          const weightInKg = weightInGrams / 1000;
          q = weightInKg;
        }
        product_quntity_chck += q;
      });
    }

    const add_to_cart = async (data) => {
      const product_data = {
        product: data.product,
        price: data.price,
        quantity: data.quantity,
        unitType: data.unitType,
        unit: data.unit,
        total: data.total,
      };

      if (!find_cart) {
        const create_cart = new cartCls({
          owner: req.id,
          item: [product_data],
        });
        await create_cart.save();
        return create_cart;
      } else {
        // Find if the same product with the same unit type exists in the cart
        const existingProduct = find_cart.item.find(
          (element) =>
            element.product == product_data.product &&
            element.unitType === product_data.unitType &&
            element.unit === product_data.unit
        );

        if (existingProduct) {
          // Update the existing product's quantity and total
          existingProduct.quantity += product_data.quantity;
          existingProduct.total += product_data.total;
          await find_cart.save();
          return find_cart;
        } else {
          // Add a new product entry to the cart
          const update = await cartCls.findByIdAndUpdate(
            find_cart._id,
            { $push: { item: product_data } },
            { new: true }
          );
          return update;
        }
      }
    };
    const gramsToKilograms = (grams) => {
      return grams / 1000;
    };

    const unitInt = parseInt(unit);
    let totalQuantity;
    if (unitType === "G") {
      totalQuantity = gramsToKilograms(unitInt) + product_quntity_chck;
    } else {
      totalQuantity = unitInt + product_quntity_chck;
    }

    if (unitType === "KG") {
      if (find_product.quantity >= totalQuantity) {
        const total = unitInt * parseInt(find_product.price);
        const product_data = {
          product: productId,
          price: parseInt(find_product.price),
          quantity: unitInt,
          unitType: unitType,
          unit: unitInt,
          total: total,
        };
        await add_to_cart(product_data);
      } else {
        return res.status(202).json({ message: "Quantity not available" });
      }
    } else if (unitType === "G") {
      const convert_to_gram = find_product.quantity;
      const pricePerKg = parseInt(find_product.price);
      const pricePerGram = pricePerKg / 1000;
      const totalPrice = pricePerGram * unitInt;
      if (convert_to_gram >= totalQuantity) {
        const product_data = {
          product: productId,
          price: totalPrice,
          quantity: unitInt,
          unitType: unitType,
          unit: unitInt,
          total: totalPrice,
        };
        await add_to_cart(product_data);
      } else {
        return res.status(202).json({ message: "Quantity not available" });
      }
    } else if (unitType === "PACK" || unitType === "PIECE") {
      if (find_product.quantity >= totalQuantity) {
        const total = unitInt * parseInt(find_product.price);
        const product_data = {
          product: productId,
          price: parseInt(find_product.price),
          quantity: unitInt,
          unitType: unitType,
          unit: unitInt,
          total: total,
        };
        await add_to_cart(product_data);
      } else {
        return res.status(202).json({ message: "Quantity not available" });
      }
    } else {
      return res.status(400).json({ message: "Invalid unit type" });
    }

    return res
      .status(200)
      .json({ message: "Product added to cart successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

const incrementProductInCart = async (req, res) => {
  try {
    const { userId, productId, unitType, unit } = req.query;
    console.log(userId, productId, unitType, unit,'oo',req.query);

    if (!userId || !productId || !unitType || !unit) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const find_cart = await cartCls.findOne({ owner: req.id });
    if (!find_cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const gramsToKilograms = (grams) => {
      return grams / 1000;
    };

    let product_quntity_chck = 0;

    if (find_cart) {
      const findCat_total_quntity = find_cart.item.filter(
        (element) => element.product == productId
      );
      findCat_total_quntity.forEach((element) => {
        let q = element.quantity;
        if (element.unitType === "G") {
          const weightInGrams = parseInt(element.quantity);
          const weightInKg = weightInGrams / 1000;
          q = weightInKg;
        }
        product_quntity_chck += q;
      });
    }

    const existingProduct = find_cart.item.find(
      (element) =>
        element.product == productId &&
        element.unitType === unitType &&
        element.unit == unit
    );
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    const find_product = await productsCls.findById(productId);
    if (!find_product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let totalQuantity = existingProduct.quantity + parseInt(unit);
    if (unitType === "G") {
      totalQuantity = gramsToKilograms(unit) + product_quntity_chck;
    }

    if (find_product.quantity >= totalQuantity) {
      existingProduct.quantity += parseInt(unit);
      if (unitType === "G") {
        const pricePerKg = parseInt(find_product.price);
        const pricePerGram = pricePerKg / 1000;
        existingProduct.total += pricePerGram * parseInt(unit);
      } else {
        existingProduct.total += existingProduct.price * parseInt(unit);
      }

      await find_cart.save();
      return res
        .status(200)
        .json({ message: "Product quantity incremented successfully",existingProduct });
    } else {
      return res.status(202).json({ message: "Quantity not available" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// const decrementProductInCart = async (req, res) => {
//     try {
//         const { userId, productId, unitType, unit } = req.query;

//         if (!userId || !productId || !unitType || !unit) {
//             return res.status(400).json({ message: 'Missing required parameters' });
//         }

//         const find_cart = await cartCls.findOne({ owner: userId });
//         if (!find_cart) {
//             return res.status(404).json({ message: 'Cart not found' });
//         }

//         const gramsToKilograms = (grams) => {
//             return grams / 1000;
//         }

//         let product_quntity_chck = 0;

//         if (find_cart) {
//             const findCat_total_quntity = find_cart.item.filter(element => element.product == productId);
//             findCat_total_quntity.forEach(element => {
//                 let q = element.quantity;
//                 if (element.unitType === 'G') {
//                     const weightInGrams = parseInt(element.quantity);
//                     const weightInKg = weightInGrams / 1000;
//                     q = weightInKg;
//                 }
//                 product_quntity_chck += q;
//             });
//         }

//         const existingProduct = find_cart.item.find(element => element.product == productId && element.unitType === unitType && element.unit == unit);
//         if (!existingProduct) {
//             return res.status(404).json({ message: 'Product not found in cart' });
//         }

//         const find_product = await productsCls.findById(productId);
//         if (!find_product) {
//             return res.status(404).json({ message: 'Product not found' });
//         }

//         let totalQuantity = existingProduct.quantity - parseInt(unit);
//         if (unitType === 'G') {
//             totalQuantity = gramsToKilograms(existingProduct.quantity - parseInt(unit)) + product_quntity_chck - gramsToKilograms(parseInt(unit));
//         }
//         console.log(totalQuantity, 'this is total quantity......')

//         if (totalQuantity > 0) {
//             existingProduct.quantity -= parseInt(unit);
//             if (unitType === 'G') {
//                 const pricePerKg = parseInt(find_product.price);
//                 const pricePerGram = pricePerKg / 1000;
//                 existingProduct.total -= pricePerGram * parseInt(unit);
//             } else {
//                 existingProduct.total -= existingProduct.price * parseInt(unit);
//             }

//             await find_cart.save();
//             return res.status(200).json({ message: 'Product quantity decremented successfully' });
//         } else if (totalQuantity === 0) {
//             find_cart.item = find_cart.item.filter(element => element.product !== productId || element.unitType !== unitType || element.unit !== unit);
//             await find_cart.save();
//             return res.status(200).json({ message: 'Product removed from cart' });
//         } else {
//             return res.status(400).json({ message: 'Quantity cannot be less than zero' });
//         }
//     } catch (error) {
//         return res.status(500).json({ message: 'Something went wrong', error: error.message });
//     }
// };

const decrementProductInCart = async (req, res) => {
  try {
    const { userId, productId, unitType, unit } = req.query;

    if (!userId || !productId || !unitType || !unit) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const find_cart = await cartCls.findOne({ owner: req.id });
    if (!find_cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const gramsToKilograms = (grams) => grams / 1000;

    let product_quntity_chck = 0;

    if (find_cart) {
      const findCat_total_quntity = find_cart.item.filter(
        (element) => element.product == productId
      );
      findCat_total_quntity.forEach((element) => {
        let q = element.quantity;
        if (element.unitType === "G") {
          const weightInGrams = parseInt(element.quantity);
          const weightInKg = weightInGrams / 1000;
          q = weightInKg;
        }
        product_quntity_chck += q;
      });
    }

    const existingProduct = find_cart.item.find(
      (element) =>
        element.product == productId &&
        element.unitType === unitType &&
        element.unit == unit
    );
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    const find_product = await productsCls.findById(productId);
    if (!find_product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let totalQuantity = existingProduct.quantity - parseInt(unit);
    if (unitType === "G") {
      totalQuantity =
        gramsToKilograms(existingProduct.quantity) -
        gramsToKilograms(parseInt(unit)) +
        product_quntity_chck -
        gramsToKilograms(parseInt(unit));
    }

    if (totalQuantity > 0) {
      existingProduct.quantity -= parseInt(unit);
      if (unitType === "G") {
        const pricePerKg = parseInt(find_product.price);
        const pricePerGram = pricePerKg / 1000;
        existingProduct.total -= pricePerGram * parseInt(unit);
      } else {
        existingProduct.total -= existingProduct.price * parseInt(unit);
      }

      await find_cart.save();
      return res
        .status(200)
        .json({ message: "Product quantity decremented successfully",existingProduct });
    } else if (totalQuantity === 0) {
      find_cart.item = find_cart.item.filter(
        (element) =>
          !(
            element.product == productId &&
            element.unitType === unitType &&
            element.unit == unit
          )
      );
      await find_cart.save();
      return res.status(202).json({ message: "Product removed from cart" });
    } else {
      return res
        .status(400)
        .json({ message: "Quantity cannot be less than zero" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// const placeOrder = async (req, res) => {
//     try {
//         const { userId } = req.query;

//         if (!userId) {
//             return res.status(400).json({ message: 'Missing required parameters' });
//         }

//         const find_cart = await cartCls.findOne({ owner: userId });
//         if (!find_cart || find_cart.item.length === 0) {
//             return res.status(404).json({ message: 'Cart is empty' });
//         }

//         const gramsToKilograms = (grams) => {
//             return grams / 1000;
//         }

//         let totalAmount = 0;
//         const orderItems = [];

//         for (const cartItem of find_cart.item) {
//             const find_product = await productsCls.findById(cartItem.product);
//             if (!find_product) {
//                 return res.status(404).json({ message: `Product not found: ${cartItem.product}` });
//             }

//             let totalQuantity = cartItem.quantity;
//             if (cartItem.unitType === 'G') {
//                 totalQuantity = gramsToKilograms(cartItem.quantity);
//             }

//             if (find_product.quantity < totalQuantity) {
//                 return res.status(400).json({ message: `Quantity not available for product: ${find_product.name}` });
//             }

//             find_product.quantity -= totalQuantity;
//             await find_product.save();

//             totalAmount += cartItem.total;

//             orderItems.push({
//                 product: cartItem.product,
//                 quantity: cartItem.quantity,
//                 unitType: cartItem.unitType,
//                 unit: cartItem.unit,
//                 price: cartItem.price,
//                 total: cartItem.total
//             });
//         }

//         const newOrder = new OrderCls({
//             userId: userId,
//             items: orderItems,
//             totalAmount: totalAmount
//         });

//         await newOrder.save();

//         // Clear the cart after placing the order
//         find_cart.item = [];
//         await find_cart.save();

//         return res.status(200).json({ message: 'Order placed successfully', order: newOrder });
//     } catch (error) {
//         return res.status(500).json({ message: 'Something went wrong', error: error.message });
//     }
// };

const placeOrder = async (req, res) => {
  try {
    const { userId, name, secondPhoneNumber, paymentMethod,screenshot,transactionId,coins } = req.body;
    console.log(req.body,'oooohh',req.id);
    if (!userId) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const find_cart = await cartCls.findOne({ owner: req.id });
    console.log(find_cart);

    if (!find_cart || find_cart.item.length === 0) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    if (paymentMethod === "cash on delivery") {
      const client = await clientCls.findOne({ _id: req.id });
      
      if (client.paymentProblem == 2) {
        return res
          .status(200)
          .json({ message: "You cannot use cash On delivery" });
      } else {
        
        const updatedClient = await clientCls
          .findByIdAndUpdate(
            req.id,
            { name: name, secondPhoneNumber: secondPhoneNumber },
            { new: true, runValidators: true }
          )
          .catch((err) => {
            return res.status(404).json({ message: "User doesnt exist" });
          });
      }
    }else{
      
        const updatedClient = await clientCls
        .findByIdAndUpdate(
          req.id,
          { name: name, secondPhoneNumber: secondPhoneNumber},
          { new: true, runValidators: true }
        )

        console.log(updatedClient,'updatedClient');

    }
console.log(('hkhkhkjhkh'))
    const gramsToKilograms = (grams) => {
      return grams / 1000;
    };

    let totalAmount = 0;
    const orderItems = [];

    // console.log(gramsToKilograms,'gramsToKilograms');

    for (const cartItem of find_cart.item) {
      const find_product = await productsCls.findById(cartItem.product);
      if (!find_product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${cartItem.product}` });
      }

      let totalQuantity = cartItem.quantity;
      if (cartItem.unitType === "G") {
        totalQuantity = gramsToKilograms(cartItem.quantity);
      }

      if (find_product.quantity < totalQuantity) {
        return res
          .status(400)
          .json({
            message: `Quantity not available for product: ${find_product.name}`,
          });
      }
      console.log('herereeeeeeeeeeeeeeeeeeeeeeeeee')

      find_product.quantity -= totalQuantity;
      await find_product.save();

      console.log(find_product,'find_product');

      totalAmount += cartItem.total;

      orderItems.push({
        product: cartItem.product,
        quantity: cartItem.quantity,
        unitType: cartItem.unitType,
        unit: cartItem.unit,
        price: cartItem.price.toFixed(2),
        total: cartItem.total.toFixed(2),
      });
    }

    const newOrder = new OrderCls({
      userId: req.id,
      items: orderItems,
      totalAmount: totalAmount.toFixed(2),
      paymentMethod: paymentMethod,
      paymentImg:screenshot,
      transationId:transactionId ,
      gold:coins?.Gold,
      platinum: coins?.Platinum,
      silver:coins?.Silver
    });

    console.log(newOrder,'newOrder');

    await newOrder.save();

    // Clear the cart after placing the order
    find_cart.item = [];
    await find_cart.save().then(async () => {
      await clientCls.findByIdAndUpdate(
          req.id,
          {
              $inc: {
                  gold: coins.Gold, // Increment gold by 1
                  platinum: coins.Platinum, // Increment platinum by 1
                  silver: coins.Silver // Increment silver by 1
              }
          }
      );
  });

    return res
      .status(200)
      .json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.log(error.message,'khjkhkh',error)
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

const checkout = async (req, res) => {

  const shopOpenORclossed = await ShopDetail.findOne({name:'admin'})
  if(!shopOpenORclossed.openorclose){
   return res .status(201)
    .json({ message: "Shop is Closed" });
  }

  const find_cart = await cartCls
      .findOne({ owner: req.id })
      .populate(
          "item.product",
          "productName productImageUrl price quantity unit unitType isDelete"
      );
      console.log(find_cart,'find_cart');
      const isDeleteCart = find_cart.item.filter((product)=>{console.log(product,'product.'); return product.product.isDelete== true})
    if(isDeleteCart.length!=0){
     return res
     .status(200)
      .json({ message: "deleted Items", cart: isDeleteCart });
}else{

    return res
    .status(202)
     .json({ message: "successfully" });


}
}

const getCartItems = async (req, res) => {
  try {
    console.log('ljkhkhkjj')
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const find_cart = await cartCls
      .findOne({ owner: req.id })
      .populate(
        "item.product",
        "productName productImageUrl price quantity unit unitType isDelete"
      );
      console.log(find_cart,'cartItems')
     
    if (!find_cart) {
      return res.status(404).json({ message: "Cart not found" });
    }



    const cartItems = find_cart.item.map((cartItem) => {
   
      return {
        product: {
          id: cartItem.product._id,
          name: cartItem.product.productName,
          price: cartItem.product.price,
          image: cartItem.product.productImageUrl,
        },
        quantity: cartItem.quantity,
        unitType: cartItem.unitType,
        unit: cartItem.unit,
        total: cartItem.total,
      };
     
    
     
     
    });
    console.log(cartItems,'cartItems');

    return res.status(200).json({ cartItems: cartItems });
  } catch (error) {
    console.log(error,'heeeeeeeeeeeeeeee',error.message)
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

const getCartItemsCount = async (req, res) => {
  try {
    // console.log('ooaa',req.id,userId);
    // const { userId } = req.query;

    if (!req.id) {
      return res.status(202).json({ message: "Missing required parameters" });
    }

    const find_cart = await cartCls.findOne({ owner: req.id });
    if (!find_cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const itemCount = find_cart.item.reduce((accumulator, cartItem) => {
      return accumulator + 1;
    }, 0);

    return res.status(200).json({ itemCount: itemCount });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { searchString } = req.query;

    if (!searchString) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Create a regex for case-insensitive search
    const searchRegex = new RegExp(searchString, "i");

    // Build the search query to match any of the fields and isDelete: false
    const query = {
      isDelete: false,
      $or: [
        { productName: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
        { subCategory: { $regex: searchRegex } },
      ],
    };

    // Perform the search
    const products = await productsCls.find(
      query,
      "productName quantity unit productImageUrl category subCategory"
    );

    return res.status(200).json({ products });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};


const findCategoryProduct = async (req, res) => {
  try {
      const { categoryName, subCategory } = req.query;

      // Build the query object conditionally
      let query = { category: categoryName,isDelete:false };
      if (subCategory) {
          query.subCategory = subCategory;
      }

      // Find the products based on the query
      const products = await productsCls.find(query).lean();

      if (!products || products.length === 0) {
          return res.status(201).send({ message: 'Category products not found' });
      } else {
          return res.status(200).json({ success: true, message: "Categories retrieved successfully", products });
      }
  } catch (error) {
      return res.status(500).send({ success: false, message: "Something went wrong", error: error.message });
  }
};

const orders = async (req, res) => {
  try {
    console.log("oo");
    console.log(req.query, "jjgjgjjgjhhgjfjgjg");

    // Find orders by userId and sort them by createdAt in descending order
    const order = await OrderCls.find({ userId: req.id }).sort({ createdAt: -1 });
    
    // Find the user's coins
    const coins = await clientCls.findOne({ _id: req.id });

    console.log(order, "oooooooooooooooooo");
    res.status(200).json({ order, coins });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving orders", error });
  }
};


const viewOrder = async (req, res) => {
  try {
    const orders = await OrderCls.find({ _id: req.query.orderId })
      .populate("userId", "name phoneNumber secondPhoneNumber")
      .populate("items.product")
      .exec();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving orders", error });
  }
};

const getDate = async (req, res) => {
  try {
      const client = await clientCls.findById(req.id);
      
      if (!client) {
          return res.status(404).json({ message: 'Client not found' });
      }
      let oneMonthLater;
     if( client.coinDate){
       oneMonthLater = moment(client.coinDate).add(1, 'months').format('MMMM D, YYYY');
      // Send response with formatted date
     }
   
      return res.status(200).json({ date:oneMonthLater,client });
  } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' });
  }
};





const getCartDetailcheckout = async (req, res) => {
  try {
    const shopOpenORclossed = await ShopDetail.findOne({name:'admin'})
    if(!shopOpenORclossed.openorclose){
     return res .status(201)
      .json({ message: "Shop is Closed" });
    }
    const find_cart = await cartCls
      .findOne({ owner: req.id })
      .populate(
        "item.product",
        "productName productImageUrl price quantity unit unitType isDelete  coin coinType discription coin100g coinType100g coin250g coinType250g coin500g coinType500g coin1kg coinType1kg"
      );

    if (!find_cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Filter out items where product is marked as deleted (isDelete: true)
    const updatedItems = find_cart.item.filter(item => !item.product.isDelete);

    // Update the cart with the filtered items
    find_cart.item = updatedItems;

    // Save the updated cart
    await find_cart.save();

    console.log(find_cart, 'Updated Cart'); // Logging the updated cart for verification
    if(find_cart.item.length !=0){
      return res.status(200).json({ cartItems: updatedItems });

    }else{
      return res.status(202).json({ message:'This product has removed' });

    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};



const cancelOrder = async (req, res) => {
  const { orderId } = req.query;

  try {
      // Find the order by ID and update its status to "Cancelled"
      const order = await OrderCls.findByIdAndUpdate(
          orderId,
          { status: 'Cancelled' },
          { new: true }
      )
      console.log(order);
      if (!order) {
          return res.status(404).json({ message: 'Order not found' });
      }
      const user = await clientCls.findByIdAndUpdate(
          req.id, 
          { 
              $inc: { 
                  gold: -order.gold,
                  platinum: -order.platinum,
                  silver: -order.silver 
              } 
          }, 
          { new: true }
      );
      // Loop through each item in the order and update the product quantities
      for (const item of order.items) {
          const product = await productsCls.findById(item.product);
          console.log(product)

          if (!product) {
              return res.status(404).json({ message: `Product not found for ID: ${item.product}` });
          }
          const gramsToKilograms = (grams) => {
              return grams / 1000;
          }

          if (item.unitType === 'G') {
              product.quantity += gramsToKilograms(item.quantity);
          } else {
              product.quantity += item.quantity;
          }

          await product.save();
      }

      res.status(200).json(order);
  } catch (error) {
      res.status(500).json({ message: 'Error cancelling order', error });
  }
}

module.exports = {
  getProducts,
  getlocation,
  findUniqueCategories,
  productView,
  login,
  addToCart,
  placeOrder,
  incrementProductInCart,
  decrementProductInCart,
  getCartItems,
  getCartItemsCount,
  searchProducts,
  findCategoryProduct,
  orders,
  viewOrder,
  otpVarification,
  getDate,
  checkout,
  getCartDetailcheckout,
  cancelOrder
};
