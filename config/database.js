import mongoose from "mongoose";



const clientOptions = { serverApi: { version: '1', strict: false, deprecationErrors: true } };
export const dbConnection =async function run() {
  
    const uli = process.env.CONNECTION_STRING
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uli, {...clientOptions, autoIndex: true});
    await mongoose.connection.db.admin().command({ ping: 1 });
    await mongoose.connection.syncIndexes();
    console.log("Pinged your deployment. You successfully connected to MongoDB! ✅");
  
}
