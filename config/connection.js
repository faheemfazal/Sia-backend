const mongoose = require("mongoose");
const mongourl =process.env.MONGO_URL
console.log(mongourl,';;');
mongoose
    .connect(mongourl)
    .then(() => {
        console.log("db connected ");
    })
    .catch((err) => {
        console.log(err, "ggggggg");
    });





