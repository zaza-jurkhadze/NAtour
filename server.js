const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    process.exit(1);
});

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



const port = 3000;


app.listen(port, () => {
    console.log(`app running on port ${port}`);
}); 

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

