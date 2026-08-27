import mongoose from 'mongoose';
import app from './app.js';



async function startServer() {
    try {
        await mongoose.connect('mongodb://localhost:27017/margindashboard');
        console.log('connected to db');

        app.listen(2000, () =>  console.log(`app is listening on port ${2000}`) )

    } catch (error) {
        console.log(error)
    }
}


startServer()
