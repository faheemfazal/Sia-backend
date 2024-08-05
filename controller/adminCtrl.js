const bcrypt = require("bcrypt");
const productsCls = require("../model/productModel");
const hubLocationCls = require("../model/pickUpHub");
const categoryCls = require("../model/categoryModel");
const orderCls = require("../model/orderModel");
const { ObjectId } = require('mongodb');
const OrderCls = require("../model/orderModel");
const clientCls = require("../model/clientModel");
const    jwt  =require('jsonwebtoken');
const Cart = require("../model/cartModel");
const Banner = require("../model/bannerModel");

const ShopDetail = require("../model/openOrClose");



const adminLog = async (req, res) => {
    try {
        const { email, password } = req.body;
console.log(process.env.adminEmail,'oo',req.body,process.env.adminEmail,process.env.adminPassword);
        // Find the admin user by email
        if (email == process.env.adminEmail && password == process.env.adminPassword) {
            const adminToken = jwt.sign({ email }, "admin", {
                expiresIn: '1d', // 1 day
              });
              console.log(adminToken);
            return res.status(200).json({ message: "Success" ,adminToken: adminToken});
        } else {
            return res.status(202).json({ message: "Access denied" });
        }


    } catch (error) {
        console.error(error);
        return res.status(500).render("admin/adminError", { admin: true });
    }
}

const addProduct = async (req, res) => {
    try {
        const { productName, category, subCategory, price, quantity, availableHub, productImageUrl, unit, itemBehaviour,brand,coin,coinType,description ,coinType100g,coin100g,coinType1kg,coin1kg,coinType500g,coin500g,coinType250g,coin250g,} = req.body;
        console.log('Request body:', req.body,coin,coinType);
        console.log(productName, category, subCategory, price, quantity, availableHub, productImageUrl, unit, itemBehaviour,brand);

        // Check for existing product with the same product name
        const existingProduct = await productsCls.findOne({ productName: productName});
        if (existingProduct) {
            console.log('kjhkjhkhkhkjhkhkh')

            return res.status(202).json({ message: "Product already existed" });
        }
        // else{
              // Create a new product instance
              const newProduct = new productsCls({
                productName: productName.trim(),
                category: category.trim(),
                subCategory: subCategory ? subCategory.trim() : '',
                price: price.trim(), // Assuming price needs trimming
                quantity: quantity.trim(), // Assuming quantity needs trimming
                availableHub,
                productImageUrl,
                unit,
                brand: brand ? brand.trim() : '', // Assuming brand needs trimming
                itemBehaviour,
                coin: coin ? coin.trim() : '',
                coinType: coinType ? coinType.trim() : '',
                description: description ? description.trim() : '', // Corrected 'description' spelling
                coin100g: coin100g ? coin100g.trim() : '',
                coinType100g: coinType100g ? coinType100g.trim() : '',
                coin250g: coin250g ? coin250g.trim() : '',
                coinType250g: coinType250g ? coinType250g.trim() : '',
                coin500g: coin500g ? coin500g.trim() : '',
                coinType500g: coinType500g ? coinType500g.trim() : '',
                coin1kg: coin1kg ? coin1kg.trim() : '',
                coinType1kg: coinType1kg ? coinType1kg.trim() : '',
            });
            
        console.log('After creating product instance');
        console.log(newProduct,'pppp');
        // Save the new product
        await newProduct.save().then(() => {
            console.log('Product saved successfully');
            return res.status(200).json({ message: "Success" });
        });

        console.log('After saving product');

        // } 

    } catch (error) {
        console.error("Error adding product:", error);
        if (error.code === 11000) { // Handle duplicate key error
            return res.status(400).json({ message: "Duplicate key error. A product with the same subCategory already exists." });
        }
        return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};


const getproducts = async (req, res) => {
    try {
        const products = await productsCls.find({isDelete: false}).lean();
        return res.status(200).json({ products: products, message: "Success" });
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

const delProduct = async (req, res) => {
    try {
        const productId = req.query.id
        console.log(productId)
        const updatedProduct = await productsCls.findByIdAndUpdate(
            productId,
            { $set: { isDelete: true } },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({ message: "Success", product: updatedProduct });
    } catch (error) {
        console.error("Error deleting product:", error);  // Log the error for debugging purposes
        return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};
// const delProduct = async (req, res) => {
//     try {
//         const productId = req.query.id;
//         console.log(productId);

//         const carts = await Cart.find({});
//         if (carts) {
//             console.log(carts, 'khkhkhhhhhhhhhhhhhhhhhh');

//             for (const cart of carts) {
//                 let itemsRemoved = false;

//                 // Filter out items with the matching productId
//                 cart.item = cart.item.filter(item => {
//                     if (item.product.toString() === productId) {
//                         cart.cartTotal -= item.total;
//                         itemsRemoved = true;
//                         return false;
//                     }
//                     return true;
//                 });

//                 if (itemsRemoved) {
//                     await cart.save();
//                 }
//             }
//         }

//         const updatedProduct = await productsCls.findByIdAndDelete(productId);

//         if (!updatedProduct) {
//             return res.status(404).json({ message: "Product not found" });
//         }

//         return res.status(200).json({ message: "Success", product: updatedProduct });
//     } catch (error) {
//         console.error("Error deleting product:", error); // Log the error for debugging purposes
//         return res.status(500).json({ message: "Something went wrong", error: error.message });
//     }
// };




const productEdit = async (req, res) => {
    try {
        // Prepare the update object
        console.log(';;;;;;;');
        const {coin,coinType,description ,coinType100g,coin100g,coinType1kg,coin1kg,coinType500g,coin500g,coinType250g,coin250g,} = req.body;

        console.log((req.query,'llll',req.body));
        const updateData = {
            $set: {
                productName: req.body.productName,
                category: req.body.category,
                price: req.body.price,
                quantity: req.body.quantity,               
                productImageUrl: req.body.productImageUrl,
                unit: req.body.unit,
                itemBehaviour: req.body.itemBehaviour,
                subCategory: req.body.subCategory ? req.body.subCategory : '',
                brand :req.body.brand?req.body.brand:"",
                coin:coin?coin:'',
                coinType:coinType?coinType:'',
                discription:description?description:'',
                coin100g: coin100g?coin100g:'',
                coinType100g:coinType100g?coinType100g:'' ,
                coin250g:coin250g?coin250g:'' ,
                coinType250g:coinType250g?coinType250g:'' ,
                coin500g:coin500g?coin500g:'' ,
                coinType500g:coinType500g?coinType500g:'' ,
                coin1kg:coin1kg?coin1kg:'' ,
                coinType1kg:coinType1kg?coinType1kg:'' ,
                discription:req.body.description?req.body.description:''
            }
        };

        // Find the product by ID and update
        const updatedProduct = await productsCls.findByIdAndUpdate(
            req.query.id, // Mongoose can handle the conversion internally
            updateData,
            { new: true, runValidators: true }
        );

        // Check if the product was found and updated
        if (!updatedProduct) {
            return res.status(404).send({ message: 'Product not found' });
        }

        // Respond with the updated product
        res.status(200).send(updatedProduct);

    } catch (error) {
        // Handle any errors
        console.error('Error updating product:', error);
        res.status(500).send({ message: 'Error updating product', error: error.message });
    }

}

const editProduct = async (req, res) => {
    try {
        const product = await productsCls.findOne({ _id: req.query.id })
        if (product) {
            res.status(200).json({ success: true, message: "success", product })
        } else {
            return res.status(404).send({ message: 'Product not found' });
        }

    } catch (error) {
        res.status(500).send({ message: 'Error updating product', error: error.message });

    }
}


const postAdminAddCategory = async (req, res) => {
    try {
        let { categoryName, subCategory } = req.body;

        const caegoryExist = await categoryCls.findOne({ categoryName: categoryName.trim() });
        if (caegoryExist) {
            if (!subCategory) {
                res.status(202).json({ success: true, message: "category exists" });
            } else {
                // Ensure subCategory is an array
                const result = await categoryCls.updateOne(
                    { _id: caegoryExist._id },
                    { $addToSet: { subCategory: subCategory.toUpperCase().trim() } }
                );
                res.status(200).json({ success: true, message: "Subcategories added1111" });
            }
        } else {
            // If category does not exist, create a new category with subcategories
            if (!subCategory) {
                const categoryDetails = new categoryCls({
                    categoryName: categoryName.toUpperCase().trim(),
                });

                await categoryDetails.save();
                res.status(200).json({ success: true, message: "Category created" });
            } else {

                const categoryDetails = new categoryCls({
                    categoryName: categoryName.trim(),
                    subCategory: subCategory.toUpperCase().trim(),
                });

                await categoryDetails.save();
                res.status(200).json({ success: true, message: "Category created5555" });
            }

        }

    } catch (error) {
        return res.status(500).json({ message: "Something went wrong", error: error.message });

    }
}

const getCategory = async (req, res) => {
    try {
        const categories = await categoryCls.find({}).lean();

        if (!categories || categories.length === 0) {
            return res.status(404).send({ success: false, message: 'Categories not found' });
        }

        return res.status(200).json({ success: true, message: "Categories retrieved successfully", categories });
    } catch (error) {
        return res.status(500).send({ success: false, message: "Something went wrong", error: error.message });
    }
};



const orders = async (req, res) => {
    try {
      console.log('oo');
      console.log(req.query, 'jjgjgjjgjhhgjfjgjg');
      
      // Find and sort orders by createdAt in descending order
      const orders = await OrderCls.find()
        .populate('userId', 'name phoneNumber secondPhoneNumber email')
        .populate('items.product')
        .sort({ createdAt: -1 })  // Sort by createdAt in descending order
        .exec();
      
      console.log(orders, 'oooooooooooooooooo');
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving orders', error });
    }
  };
  





const postHubLocation = async (req, res) => {
    try {
        const { image, longitude, latitude, hubName } = req.body;

        const hubLocation = new hubLocationCls({
            image,
            longitude,
            latitude,
            hubName,
        });

        await hubLocation.save().then(() => {
            return res.status(200).json({ message: "Success" });

        })

    } catch (error) {
        console.error("Error adding product:", error);  // Log the error for debugging purposes
        return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};


const viewOrder = async (req, res) => {
    try {
        const orders = await OrderCls.find({ _id: req.query.orderId }).populate('userId', 'name secondPhoneNumber phoneNumber').populate('items.product').exec();
                res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving orders', error });
    }
}


const orderCancel = async (req, res) => {
    const { orderId } = req.query;

    try {
        // Find the order by ID and update its status to "Cancelled"
        const order = await OrderCls.findByIdAndUpdate(
            orderId,
            { status: 'Cancelled' },
            { new: true }
        )
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const user = await clientCls.findByIdAndUpdate(
            req.query.userId, 
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

const allUsers =async (req, res) => {
    try {
        const clients = await clientCls.find();
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching clients', error });
    }
}

const changeOrderStatus = async (req, res) => {
    const { orderId, orderStatus } = req.query;

    try {
        // Find the order by ID and update its status to "Confirmed"
        const order = await OrderCls.findByIdAndUpdate(
            orderId,
            { status: orderStatus },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error confirming order', error });
    }
}



// Route to block a user
const block= async (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).send('User ID is required');
    }
    try {
     const user = await clientCls.findByIdAndUpdate(userId, { block: true }, { new: true });
     if (user) {
            res.status(200).send(`User with ID ${userId} is now unblocked.`);
        } else {
            res.status(404).send(`User with ID ${userId} not found.`);
        }
    } catch (error) {
        res.status(500).send(`Error unblocking user with ID ${userId}: ${error.message}`);
    }
 }



// Route to unblock
const unblock= async (req, res) => {
   const userId = req.query.userId;
   if (!userId) {
       return res.status(400).send('User ID is required');
   }
   try {
    const user = await clientCls.findByIdAndUpdate(userId, { block: false }, { new: true });
    if (user) {
           res.status(200).send(`User with ID ${userId} is now unblocked.`);
       } else {
           res.status(404).send(`User with ID ${userId} not found.`);
       }
   } catch (error) {
       res.status(500).send(`Error unblocking user with ID ${userId}: ${error.message}`);
   }
}


const revenueUser = async (req, res) => {
    try {
        const order = await orderCls.find({})
        const count = await clientCls.countDocuments({});
        const result = await orderCls.aggregate([
            { $match: { status: 'Completed' } },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalAmount" }
                }
            }
        ]);
        console.log(order)

        const totalAmount = result.length > 0 ? result[0].totalAmount : 0;
        res.status(200).json({ totalAmount,count,order });
    } catch (err) {
        console.error("Error fetching total completed orders amount:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
const salesReport = async (req, res) => {
    try {
        const order = await orderCls.find({status:'Completed'})
        const result = await orderCls.aggregate([
            { $match: { status: 'Completed' } },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalAmount" }
                }
            }
        ])
        const totalAmount = result.length > 0 ? result[0].totalAmount : 0;       
        res.status(200).json({ totalAmount,order });
    } catch (err) {
        console.error("Error fetching total completed orders amount:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
}


const clearCoin = async (req, res) => {
    try {
        const coinType = req.query.coin;
        if (!coinType) {
            return res.status(400).json({ message: "Coin type is required" });
        }

        const user = await clientCls.findByIdAndUpdate(req.query.userId, { $set: { [coinType]: 0 } }, { new: true });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: `Successfully cleared ${coinType} coins`, user });
    } catch (error) {
        console.error("Error clearing coins:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const setDate = async(req,res)=>{
    try {
        console.log(req.query,'opopopopop');
    const date = req.query.date
    if(!date){
        return res.status(400).json({ message: "Date is required" });
    }else{
        const user = await clientCls.findByIdAndUpdate(req.query.userId, { $set: { coinDate: date } }, { new: true });
   if(!user){
    return res.status(400).json({ message: "user cannot find " });
   }else{
    res.status(200).json({ message: `success` });
   }
    }      
    } catch (error) {
        console.error("Error clearing coins:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }

}

const openorclose=async(req,res)=>{
    try {
        console.log('df2hg12dfhg12d');
        const shopOpenORclossed = await ShopDetail.findOne({name:'admin'})
        res.status(200).json({ message: `success`,openORclosed:shopOpenORclossed.openorclose });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
        
    }
}
    
const postOpenorclose = async (req, res) => {
    try {
      console.log('df2hg12dfmmmmhg12d', req.body);
  
      const result = await ShopDetail.findOneAndUpdate(
        { name: 'admin' }, // Filter criteria
        { $set: { openorclose: !req.body.isONorOFF } }, // Update data
        { upsert: true, new: true } // Create a new document if no document matches the filter and return the updated document
      );
      console.log(result, 'result');
      res.status(200).json({ message: 'success', openORclosed: result.openorclose });
    } catch (error) {
      console.error('Error updating shop status:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
const postBanner = async (req, res) => {
    
  try {
    const { bannerImage } = req.body;

    console.log( req.body,'oooooo');

    // Check if bannerImage is provided
    if (!bannerImage) {
      return res.status(400).json({ message: 'Banner image is required' });
    }

    // Create a new banner
    const newBanner = new Banner({ bannerImage });
    await newBanner.save();

    console.log(newBanner,'newBanner');

    // Send a success response
    return res.status(200).json({ message: 'Banner created successfully', banner: newBanner });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while creating the banner' });
  }

            
    
}

const getBanners = async (req, res) => {

try {
    const banners = await Banner.find(); // Retrieve all banners from the database

    if (banners.length === 0) {
      return res.status(204).json({ message: 'No banners found' });
    }

    // Send success response with the banners
    return res.status(200).json({ banner: banners });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching the banners' });
  }

}

const deleteBanner = async (req, res) => {
    const { id } = req.query;

    try {
      const deletedBanner = await Banner.findByIdAndDelete(id);
  
      if (!deletedBanner) {
        return res.status(204).json({ message: 'Banner not found' });
      }
  
      // Send success response
      return res.status(200).json({ message: 'Banner deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred while deleting the banner' });
    }
    
    }


module.exports = {
    adminLog,
    addProduct,
    getproducts,
    delProduct,
    productEdit,
    editProduct,
    postHubLocation,
    postAdminAddCategory,
    getCategory,
    orders,
    viewOrder,
    orderCancel,
    allUsers,
    changeOrderStatus,
    block,
    unblock,
    revenueUser,
    salesReport,
clearCoin,
setDate,
openorclose,
postOpenorclose,
postBanner,
getBanners,
deleteBanner

}