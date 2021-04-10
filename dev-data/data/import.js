
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const tour = require('./../../models/tourModel');
const { argv } = require('process');
dotenv.config({path: './config.env'});
let DB = process.env.DB_LINK.replace('<password>', process.env.DB_PASSWORD);
DB = DB.replace('<username>',process.env.DB_USERNAME);
console.log(DB);
mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(con => console.log('DB connection succesfull!'));

//read json file

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));
// import data into DB
const importData = async () => {
    try {
        await tour.create(tours);
        console.log('data succesfully loaded');
        process.exit();
    } catch (error) {
        console.log(error);
    }
}
 //delete all data from collection
const deleteData = async () => {
    try {
        await tour.deleteMany();
        console.log('data succesfully deleted');
        process.exit();
    } catch (error) {
        console.log(error);
    }
}
 if (process.argv[2] === "--import") {
    importData();
}else if(process.argv[2] === '--delete'){
    deleteData();
} 
console.log(process.argv);
 
