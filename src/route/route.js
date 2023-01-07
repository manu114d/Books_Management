const express = require('express');
const router = express.Router();
const { createUser, login } = require('../controller/userController')
const { createBook, getBooks, getBooksById, updateBooks, deleteBookById } = require('../controller/bookController')
const { createReview, updateReview, deleteReview } = require('../controller/reviewController')
const { userValidation, logInValidation, bookValidation, reviewValidation } = require('../middleware/validator')
const { authentication, authorisation } = require('../middleware/commonMiddleware')


const aws= require("aws-sdk")


////////////////////////////////////////////////////////  APIS  /////////////////////////////////////////////////////////////////

router.post("/write-file-aws", async function(req, res){

    try{
        let files= req.files
        if(files && files.length>0){
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL= await uploadFile( files[0] )
            res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
        }
        else{
            res.status(400).send({ msg: "No file found" })
        }
    }
    catch(err){
        res.status(500).send({msg: err})
    }
})

//  User apis  //

router.post("/register", userValidation, createUser)
router.post("/login", logInValidation, login)

//  Book apis  //

router.post("/books", authentication, authorisation, bookValidation, createBook)
router.get("/books", authentication, getBooks)
router.get("/books/:bookId", authentication, getBooksById)
router.put("/books/:bookId", authentication, authorisation, updateBooks)
router.delete("/books/:bookId", authentication, authorisation, deleteBookById)

//  Review apis  //

router.post("/books/:bookId/review", reviewValidation, createReview)
router.put("/books/:bookId/review/:reviewId", updateReview)
router.delete("/books/:bookId/review/:reviewId", deleteReview)

module.exports = router;   