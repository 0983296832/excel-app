/*
 * @description    
 * @since         Monday, 7 29th 2024, 21:19:47 pm
 * @author        Bình Lê <binhlv@getflycrm.com>
 * @copyright     Copyright (c) 2024, Getfly VN TECH.,JSC, Inc.
 * -----
 * Change Log: <press Ctrl + alt + c write changelog>
 */


import mongoose from "mongoose";
// console.log(mongoose)

const connectDB = async () => {
    const dbConnectString = "mongodb+srv://admin:<password>@my-cluster.6oldpt8.mongodb.net/"
    try {
        // mongodb connection string
        await mongoose.connect(dbConnectString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB connected `);
    } catch (err) {
        console.log(err);
        // dbConnectString.exit(1);
    }
};

export default connectDB;
