import mongoose from "mongoose";

export const  connectDB = async () =>{
    let connectionString = process.env.MONGO_CONNECTION_STRING;
    await mongoose.connect(connectionString).then(()=>console.log("DB Connected"));
   
}
