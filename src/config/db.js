// const mysql = require("mysql2");

// const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// module.exports = db.promise();

// const mongoose=require("mongoose");
// require("dotenv").config();

// exports.connectDb=()=>{
//     mongoose.connect(process.env.MONGODB_URL,{
//         useNewUrlParser:true,
//         useUnifiedTopology:true,
//     })
//     .then(()=>{
//         console.log("DB Connected Successfully");
//     })
//     .catch((error)=>{
//         console.log("DB Connection Failed");
//         console.log(error);
//     });
// }

// const mongoose = require("mongoose");

// exports.connectDb = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URL);
//     console.log("DB Connected Successfully");
//   } catch (error) {
//     console.log("DB Connection Failed");
//     console.log(error);
//     process.exit(1);
//   }
// };

const mongoose = require("mongoose");
console.log("MONGODB_URL =", process.env.MONGODB_URL);
exports.connectDb = async () => {
  try {
    console.log("ENV CHECK:", process.env.MONGODB_URL); // 👈 DEBUG
console.log("MONGO:", process.env.MONGODB_URL);
    await mongoose.connect(process.env.MONGODB_URL);

    console.log("DB Connected Successfully");
  } catch (error) {
    console.log("DB Connection Failed");
    console.log(error);
    process.exit(1);
  }
};