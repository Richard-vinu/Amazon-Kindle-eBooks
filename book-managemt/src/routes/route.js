import express from 'express'
const router = express.Router()

import { createUser, userLogin } from '../controllers/userController.js'
import {createBook, getBooksQuery, getBookById, updateBookById, deleteBookById } from '../controllers/bookController.js'
import { addReview, updateReview, deleteReview } from '../controllers/reviewController.js'
import{authentication,authorization} from '../middleware/auth.js'

// User API
router.post('/register', createUser)
router.post('/login', userLogin)

//Book API

router.post('/books', createBook)
router.get('/books',authentication,getBooksQuery)
router.get('/books/:bookId',authentication, getBookById)
router.put("/books/:bookId",authentication,authorization, updateBookById)
router.delete('/books/:bookId', authentication,authorization,deleteBookById)

// Review API
router.post('/books/:bookId/review', addReview)
router.put("/books/:bookId/review/:reviewId", updateReview)
router.delete("/books/:bookId/review/:reviewId", deleteReview)

export default router
