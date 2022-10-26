import validate from 'validator'
import bookModel from '../models/bookModel.js'
import reviewModel from '../models/reviewModel.js'
import { isValidRevDate } from '../util/reviewValidate.js'
import { dataValidation, isValidObjectId, isValidName, isValidRating, isValidDate,isValidReviews} from '../util/bookValidate.js'

//POST /books/:bookId/review
//By Richard

const addReview = async (req, res) => {
    try {
        let id = req.params.bookId

        let datas = req.body

        let { bookId,reviewedBy, reviewedAt, rating, review } = datas

        if (!validate.isMongoId(id))
            return res.status(400).send({ status: false, message: `This BookId '${id}' given in param is Invalid` })

        if(!validate.isMongoId(bookId))
            return res.status(400).send({ status: false, message: `This BookId '${bookId}' in the body is Invalid` })
        
            let findBook = await bookModel.findById(id)

        if (!findBook)
            return res.status(404).send({ status: false, message: `Book Not Found` })

        if (findBook.isDeleted == true)
            return res.status(404).send({ status: false, message: `The book '${findBook.title}' has been Deleted ` })

        // if(!reviewedBy)
         if (reviewedBy == '')
            return res.status(400).send({ status: false, message: `The Reviewer's name is Required` })

        if (!reviewedAt)
            return res.status(400).send({ status: false, message: `The reviewedAt Field is Required` })

        if (!isValidRevDate(reviewedAt))
            return res.status(400).send({ status: false, message: `Your date ${reviewedAt} doest follow this date 'YYYY-MM-DD formate'` })

        if (rating == 0 || rating == " ")
             return res.status(400).send({ status: false, message: `The Rating Field cant be 0  or Empty` })

        if (!rating)
            return res.status(400).send({ status: false, message: `The Rating Field is Required` })

        if (isValidRating(rating))
            return res.status(400).send({ status: false, message: `The review rating should be 1 to 5` })

            if (!review)
            return res.status(400).send({ status: false, message: `The review Field is Required` })

        datas.bookId = id
        let result = await reviewModel.create(datas)
        await bookModel.findOneAndUpdate({ _id: id }, { $inc: { reviews: 1 } }, { new: true })

        let finalOp = await reviewModel.findOne({ _id: result._id }).select({ isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        finalOp.reviewedAt = new Date()

        res.status(201).send({ status: true, message: `New Review added Sucessfully to the Book📕 '${findBook.title}' written by `, data: finalOp })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


//============================================================================================================================
//----------------------------------------updateReview----------------------------------------------
// SHAYAN BISWAS
const updateReview = async (req, res) => {
    try {
        const reqBody = req.body
        const bookId = req.params.bookId
        const reviewId = req.params.reviewId
        const { reviewedBy, rating, review } = reqBody

        //---------------------------------body validation------------------------------
        if (!dataValidation(reqBody))
            return res.status(400).send({ status: false, message: 'Please fill the data' })

        //---------------------------------bookId validation------------------------------
        if (!bookId)
            return res.status(400).send({ status: false, message: 'bookId isn\'t present' })

        if (!isValidObjectId(bookId))
            return res.status(400).send({ status: false, message: `This '${bookId}' bookId isn\'t valid`  })

        //---------------------------------reviewId validation------------------------------
        if (!reviewId)
            return res.status(400).send({ status: false, message: 'reviewId isn\'t present' })

        if (!isValidObjectId(reviewId))
            return res.status(400).send({ status: false, message: `This '${reviewId}' reviewId isn\'t valid`  })
        
        //---------------------------------Creating Object------------------------------
        const filter = {}

        if (reviewedBy) {
            if (!isValidName(reviewedBy))
                return res.status(400).send({ status: false, message: `This '${reviewedBy}' isn\'t valid user` })
            filter['reviewedBy'] = reviewedBy
        }

        if (rating) {
            if (!(rating >= 1 && rating <= 5))
                return res.status(400).send({ status: false, message: 'lease rate between 1 to 5' })
            filter['rating'] = rating
        }

        if (review) {
            if (!isValidReviews(review))
                return res.status(400).send({ status: false, message: `This '${review}' isn\'t valid review` })
            filter['review'] = review
        }

        //---------------------------------reviewId validation------------------------------
        const exitsBook = await bookModel.findById(bookId)

        if (!exitsBook)
            return res.status(404).send({ status: false, message: `No book found by this bookId ${bookId}` })

        if (exitsBook.isDeleted === true)
            return res.status(404).send({ status: false, message: `The book title '${exitsBook.title}' already deleted` })

        //---------------------------------reviewId validation------------------------------

        const exitsReview = await reviewModel.findById(reviewId)

        if (!exitsReview)
            return res.status(404).send({ status: false, message: `No review found by this ${reviewId} reviewId` })

        if (exitsReview.isDeleted === true)
            return res.status(404).send({ status: false, message: `The review '${exitsReview._id}' already deleted` })

        //---------------------------------reviewId validation------------------------------
        await reviewModel.findOneAndUpdate({ _id: reviewId }, { $set: filter }, { new: true })

        const reviewsData = await reviewModel.findOne({ _id: reviewId }).select({ bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })

        //---------------------------------destructuring------------------------------
        const { _id, title, excerpt, userId, category, subcategory, isDeleted, reviews, deletedAt, releaseAt, createdAt, updatedAt } = exitsBook

        //---------------------------------according to question------------------------------
        const data = { _id, title, excerpt, userId, category, subcategory, isDeleted, reviews, deletedAt, releaseAt, createdAt, updatedAt, reviewsData }

        res.status(200).send({ status: true, message: "Success", data: data })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}


//<============================================== deleted review =========================>
// by Aj
const deleteReview = async (req, res) => {
    try {
        const bookId = req.params.bookId
        const reviewId = req.params.reviewId

        if (!isValidObjectId(bookId))
            return res.status(400).send({
                status: false,
                message: "Enter Valid Book Id."
            })

        if (!isValidObjectId(reviewId))
            return res.status(400).send({
                status: false,
                message: "Enter Valid Review Id."
            })

        let book = await bookModel.findOne({
            _id: bookId,
            isDeleted: false
        })

        if (!book)
            return res.status(404).send({
                status: true,
                message: "Book Does Not Found !!!"
            })

        let reviews = book.reviews

        book = book._id.toString()

        let review = await reviewModel.findOneAndUpdate({
            _id: reviewId,
            bookId: bookId,
            isDeleted: false
        }, {
            $set: {
                isDeleted: true
            }
        })

        if (!review) return res.status(404).send({
            status: true,
            message: "Review Does Not Found !!!"
        })

        await bookModel.findOneAndUpdate({
            _id: bookId
        }, {
            reviews: reviews - 1
        })

        res.status(200).send({
            status: true,
            message: "Review Deleted !!!"
        })

    } catch (err) {
        res.status(500).send({
            status: false,
            message: err.message
        });
    }
}


export { addReview, updateReview, deleteReview }
