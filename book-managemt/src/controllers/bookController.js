import bookModel from '../models/bookModel.js'
import userModel from '../models/userModel.js'
import reviewModel from '../models/reviewModel.js'
import uploadFile from '../util/aws.js'

import { dataValidation,isValidTitle, isValidObjectId, isValidText,isValidDate,isTitleAny, isValidName, isValidIsbn } from '../util/bookValidate.js'


// -------------------------------------------createBook---------------------------------------------
const createBook = async (req, res) => {
  try {
    const reqBody = req.body
   
  
    let files= req.files
      if(files && files.length>0){
          //upload to s3 and get the uploaded link
          // res.send the link back to frontend/postman

          let uploadedFileURL= await uploadFile(files[0] )
        
          reqBody.bookCover= uploadedFileURL
         
      }
      else{
          res.status(400).send({ msg: "No file found" })
      }
  
   const { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt } = reqBody



   
//------------------------------body validation-----------------------------------
    if (!dataValidation(reqBody))
      return res.status(400).send({ status: false, message: 'Please fill the data' })

    // if (Object.keys(reqBody).length > 8)
    //   return res.status(400).send({ status: false, message: 'You can\'t add extra field' })

    //------------------------------title validation-----------------------------------
    if (!title)
      return res.status(400).send({ status: false, message: 'title isn\'t present' })

    if (!isTitleAny(title))
      return res.status(400).send({ status: false, message: 'title isn\'t valid' })

      if(isValidTitle(title))
      return res.status(400).send({ status: false, message: 'First Char of title should be in Uppercase' })

    //------------------------------excerpt validation-----------------------------------
    if (!isValidText(excerpt))
      return res.status(400).send({ status: false, message: 'excerpt isn\'t present' })

    if (!excerpt)
      return res.status(400).send({ status: false, message: 'excerpt isn\'t valid' })

    //--------------------------------userId validation------------------------------
    if (!userId)
      return res.status(400).send({ status: false, message: 'userId isn\'t present' })

    if (!isValidObjectId(userId))
      return res.status(400).send({ status: false, message: 'userId isn\'t valid' })

    //---------------------------------ISBN validation------------------------------
    if (!ISBN)
      return res.status(400).send({ status: false, message: 'ISBN isn\'t present' })

    if (!isValidIsbn(ISBN))
      return res.status(400).send({ status: false, message: 'ISBN isn\'t valid' })

    //---------------------------------category validation------------------------------
    if (!category)
      return res.status(400).send({ status: false, message: 'category isn\'t present' })

    if (!isValidName(category))
      return res.status(400).send({ status: false, message: 'category isn\'t valid' })

    //---------------------------------category validation------------------------------
    if (!subcategory)
      return res.status(400).send({ status: false, message: 'subcategory isn\'t present' })

    if (!isValidName(subcategory))
      return res.status(400).send({ status: false, message: 'subcategory isn\'t valid' })

    //--------------------------------- finding user------------------------------
    if (!releasedAt)
      return res.status(400).send({ status: false, message: 'releasedAt isn\'t present' })

    if (!isValidDate(releasedAt))
      return res.status(400).send({ status: false, message: 'Please use \'YYYY-MM-DD\' this format' });
    
    //--------------------------------- comparing user------------------------------

    
    
    // --------------------------------- finding user------------------------------
    const existUser = await userModel.findOne({ _id: userId })
    if (!existUser)
      return res.status(404).send({ status: false, message: 'user doesn\'t exits' })

    //--------------------------------finding book-----------------------------------
    const existBook = await bookModel.find()

    //---------------------------finding duplicate title---------------------------
    for (let i = 0; i < existBook.length; i++) {
      if (existBook[i].title === title)
        return res.status(400).send({ status: false, msg: 'title is Duplicate' })
    }

    
    for (let i = 0; i < existBook.length; i++) {
      if (existBook[i].ISBN === ISBN)
        return res.status(400).send({ status: false, msg: 'ISBN is Duplicate' })
    }

   

    const saveData = await bookModel.create(reqBody)
   res.status(201).send({ status: true, message: 'Book created successfully', data: saveData })
  
  

  }
  catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}
//=====================================================================================================
//GET /books BY-QUERY
//by Richard
 
const getBooksQuery = async (req, res) => {
  try {
    const reqBody = req.query;
    const { userId, category, subcategory } = reqBody
    
    if ((Object.keys(reqBody).length === 0) || (userId || category || subcategory)) {
      
      const books = await bookModel.find({ $and: [{ isDeleted: false }, reqBody] }).select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 });

      if (books.length === 0)
        return res.status(404).send({ status: false, message: `Book is\'nt found.` });

      return res.status(200).send({ status: true, message: 'Books list', data: books });

    } else
      return res.status(400).send({ status: false, message: 'Invalid query.' });

  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

//============================================================================================================================================
//GET /books/:bookId 
//By Richard

const getBookById = async (req, res) => {
  try {

    let bookID = req.params.bookId

    if (!isValidObjectId(bookID)) return res.status(400).send({ status: false, message: `This bookId ${bookID} is Invalid` });

    let bookId = await bookModel.findById(bookID)

    if (!bookId) return res.status(404).send({ status: false, message: `No Book Found By This BookId ${bookID}` })

    if (bookId.$isDeleted == true)
      return res.status(404).send({ status: false, message: `The Book Title '${bookId.title}' has been Deleted` })

    let findBook = await bookModel.findById(bookID).select({ __v: 0, ISBN: 0 })
    let review = await reviewModel.find({ bookId: bookID }).select({ isDelete: 0, createdAt: 0, updatedAt: 0, isDeleted: 0, __v: 0 })

    findBook._doc.reviewsData = review

    let value = `This book got ${findBook.reviews}👁‍🗨 reviews`

    res.status(200).send({ status: true, message: 'Books List', reviews: value, data: findBook })

  }
  catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}



//=======================put api ========================================================>
//
const updateBookById = async (req, res) => {
  try {
    const bookId = req.params.bookId;
   
    if (!isValidObjectId(bookId)) {
      return res.status(400).send({
        status: false,
        message: `Book Id ${bookId} in params is Invalid`
      });
    }
    
    const book = await bookModel.findOne({
      _id: bookId,
      isDeleted: false,
    });

    if (!book)
      return res.status(404).send({
        status: false,
        message: "Book not found",
      });

    const reqBody = req.body;
    if (Object.keys(reqBody).length === 0)
      return res
        .status(400)
        .send({ status: false, message: "Please Provide Details for Update" });

    let  { title, excerpt, releasedAt, ISBN } = reqBody;

    const bookObject = {};

    
      if (title) {
        if (title.length === 0 || !title)
          return res
            .status(400)
            .send({
              status: false,
              message: "Please Enter title"
            });
        
      
     title = title.trim().split(" ").filter(word=>word).join(" ");
     bookObject.title = title
    
      }
    const isTitleExist = await bookModel.findOne({ title: title });

    if (isTitleExist)
      return res
        .status(409)
        .send({ status: false, message: "Title  already exists" });
      
    

   if (excerpt) {
     excerpt = excerpt.trim().split(" ").filter(word => word).join(" ");
     if (excerpt.length == 0)
       return res
         .status(400)
         .send({
           status: false,
           message: "Please Enter excerpt"
         });
        bookObject.excerpt=excerpt
   };
   
     
   
     if (ISBN) {
      
         if (ISBN.length == 0)
           return res
             .status(400)
             .send({
               status: false,
               message: "Please Enter ISBN"
               });
                if (!isValidIsbn(ISBN.trim()))
                  return res
                    .status(400)
                    .send({
                      status: false,
                      message: "ISBN isn't valid"
                    });
                     bookObject.ISBN = ISBN.trim();
             
     }
    const isIsbnExist = await bookModel.findOne({ ISBN: ISBN });

    if (isIsbnExist)
      return res
        .status(409)
        .send({ status: false, message: "ISBN already exists" });

    
    if (releasedAt){

        releasedAt = releasedAt.trim();
        if (!isValidDate(releasedAt))
        return res.status(400).send({ status: false, message: 'Please use \'YYYY-MM-DD\' this format' });
          if (releasedAt.length==0)
            return res
              .status(400)

              .send({ status: false, message: "Enter Date in YYYY-MM-DD format!!!" });


      bookObject.releasedAt=releasedAt
    }

    const updatedBookDetail = await bookModel.findOneAndUpdate(
      { _id: book._id },
      bookObject,
      { returnDocument: "after" }
    );

    return res
      .status(200)
      .send({ status: true, message: "Success", data: updatedBookDetail });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};


//---------------------------------------------DeleteBook------------------------------------------------------------------------------------------
//SHAYAN BISWAS
const deleteBookById = async (req, res) => {
  try {
    const bookId = req.params.bookId;

    if (!bookId)
      return res.status(400).send({ status: false, message: 'Please enter bookId' });

    if (!isValidObjectId(bookId))
      return res.status(400).send({ status: false, message: `Book Id ${bookId} in params is Invalid` })

    //-------------------finding Book by id through params----------------------
    const book = await bookModel.findOne({ _id: bookId });

    if (!book)
      return res.status(404).send({ status: false, message: "Book not found" });

    if (book.isDeleted === true)
      return res.status(400).send({ status: false, message: `This '${bookId}' book is already deleted.` })

    //--------------------------------deleting Book by id-------------------------------------
    const deletedBook = await bookModel.findByIdAndUpdate({ _id: bookId }, { $set: { isDeleted: true } }, { new: true })

    res.status(200).send({ status: true, message: 'Book has been deleted' })

  }
  catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }
}


export { createBook, getBooksQuery, getBookById, updateBookById, deleteBookById }
