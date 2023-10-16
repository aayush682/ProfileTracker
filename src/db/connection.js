const mongoose = require('mongoose');

const mongoDBconnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected...');
    } catch (error) {
        console.error(error.message);
    }
}

mongoDBconnection();