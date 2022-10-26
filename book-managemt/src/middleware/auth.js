import jwt from 'jsonwebtoken';
import bookModel from '../models/bookModel.js';
import { isValidObjectId } from '../util/bookValidate.js'

//--------------------------------------authentication--------------------------------------
const authentication = async (req, res, next) => {
    try {
        const token = req.headers["x-api-key"];


        
        if (!token)
            return res.status(400).send({ status: false, message: 'Token must be present' })

        const decodedToken = jwt.verify(token, 'group56')

        if (!decodedToken)
            return res.status(401).send({ status: false, message: 'Authentication Failed!!!' })

        req.user = decodedToken

        next()
    }
    catch (err) {
        if(err.message == "invalid token") return res.status(400).send({status: false, message: "Token is invalid"})
        if(err.message == "invalid signature") return res.status(400).send({status: false, message: " Invalid signature in the Token"})
        res.status(500).send({ status: false, error: err.message })
    }
}

//---------------------------------------authorization---------------------------------------
const authorization = async (req, res, next) => {
    try {
        const bookId = req.params.bookId
        

        if (!isValidObjectId(bookId))
            return res.status(400).send({ status: false, message: `This ${bookId} bookId is Invalid` });
            
            let bookData = await bookModel.findById(req.params.bookId);
            if (!bookData) return res.status(404).send({ status: false, message: "Error! Please check book id and try again" });
            
        


        const token = req.headers["x-api-key"];

        if (!token)
            return res.status(400).send({ status: false, message: 'Token must be present' })

        const decodedToken = jwt.verify(token, 'group56')
    
        
        if (!decodedToken)
            return res.status(400).send({ status: false, message: 'Provide your own token' })
        
        const book = await bookModel.findById(bookId)

        
        if (decodedToken.userId != book.userId)
            return res.status(403).send({ status: false, message: 'You are not authorized' })

        next()
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })

    }
}

export { authentication, authorization }

