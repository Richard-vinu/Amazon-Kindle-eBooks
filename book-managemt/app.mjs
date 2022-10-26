import express from 'express'
import mongoose from 'mongoose'
import route from './src/routes/route.js'
import multer from 'multer'


const app = express()
const PORT = 3000
const URI = 'mongodb+srv://richardwork:2YLjcp0favzUASR9@cluster3.bli4t.mongodb.net/evaluation'

app.use(express.json())
app.use(multer().any())

mongoose.connect(URI, {
    useNewUrlParser: true
})
    .then(() => console.log('MongoDB is connected'))
    .catch(err => console.log(err.message))

app.use('/', route)

app.use((req, res) => res.status(400).send({ status: false, message: 'Invalid URL Please Check' }))
app.listen(PORT, () => console.log(`Express app is running on port ${PORT}`))
