const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://holidayexplanation:qYUBEuHF8zoLIv5W@cluster0-xzsha.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true 
})