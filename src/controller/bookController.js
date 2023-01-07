const BookModel = require('../model/booksModel')
const ReviewModel = require('../model/reviewModel')
const ObjectId = require('mongoose').Types.ObjectId
const { uploadFile } = require("../aws/awsConfig");


/////////////////////////////////////////////////// Create Book /////////////////////////////////////////////////////////////

const createBook = async function (req, res) {
    try {
        let files = req.files;
        let data = req.body
        let uploadedFileURL;

        if(files && files.length>0){
            uploadedFileURL= await uploadFile( files[0] )
        }
        else{
           return res.status(400).send({ msg: "No file found" })
        }
        data.bookCover = uploadedFileURL
        let savedData = await BookModel.create(data)
        return res.status(201).send({ status: true, msg: savedData })
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}

////////////////////////////////////////////// getBooks By Filter ///////////////////////////////////////////////////////////

const getBooks = async function (req, res) {
    try {
        let queries = req.query;
        let allBooks = await BookModel.find({ $and: [queries, { isDeleted: false }] }).select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 });
        if (allBooks.length == 0) return res.status(404).send({ status: false, msg: "No book found" });;
        return res.status(200).send({ status: true, data: allBooks });
    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}

///////////////////////////////////////////////////// grtBooks by Id //////////////////////////////////////////////////////

const getBooksById = async function (req, res) {
    try {
        let bookId = req.params.bookId

        if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, msg: "Invalid bookId" })

        let bookDetails = await BookModel.findById(bookId)
        if (!bookDetails || bookDetails.isDeleted === true) {
            return res.status(404).send({ status: false, msg: "Book does not exist" })
        }

        let reviewDetails = await ReviewModel.find({ bookId: bookDetails._id, isDeleted: false });

        let bookDetails_withReview = { bookDetails, reviewsData: reviewDetails }
        return res.status(200).send({ status: true, data: bookDetails_withReview });
    } catch (error) {
        return res.status(500).send({ msg: error.message });
    }
}

////////////////////////////////////////////////////// Update Books ///////////////////////////////////////////////////////

const isValidTitle = function (body) {
    const nameRegex = /^[a-zA-Z_ ]*$/;
    return nameRegex.test(body)
}

const isValidISBN = function (body) {
    const nameRegex = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/;
    return nameRegex.test(body)
}

const isValidDate = function (body) {
    const dateRegex = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
    return dateRegex.test(body)
}

const updateBooks = async function (req, res) {
    try {
        let bookId = req.params.bookId

        let details = req.body
        if (Object.keys(details).length == 0) return res.status(400).send({ status: false, msg: "Please provide details" })

        if (details.title) {
            let bookTitle = await BookModel.findOne({ title: details.title })
            if (bookTitle) return res.status(400).send({ status: false, msg: "Title is already used" })
            if (!isValidTitle(details.title)) return res.status(404).send({ status: false, msg: "Invalid title" })
        }

        if (details.releasedAt) {
            if (!isValidDate(details.releasedAt)) return res.status(400).send({ status: false, msg: "Please update releasedAt in 'YYYY-MM-DD' format" })
        }

        if (details.ISBN) {
            let bookISBN = await BookModel.findOne({ ISBN: details.ISBN })
            if (bookISBN) return res.status(400).send({ status: false, msg: "ISBN is already used" })
            if (!isValidISBN(details.ISBN)) return res.status(400).send({ status: false, msg: "ISBN must have 10 or 13 numbers" })
        }

        let updatedBook = await BookModel.findOneAndUpdate(
            { _id: bookId },
            { $set: { title: details.title, excerpt: details.excerpt, releasedAt: details.releasedAt, ISBN: details.ISBN } }, { new: true }
        )

        return res.status(200).send({ status: false, msg: updatedBook })
    } catch (error) {
        return res.status(500).send({ msg: error.message });
    }
}

////////////////////////////////////////////// Delete Books /////////////////////////////////////////////////////////////


const deleteBookById = async (req, res) => {
    try {
        let bookId = req.params.bookId

        let deletedBook = await BookModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })
        return res.status(200).send({ status: true, msg: "Book is deleted successfully" })
    } catch (error) {
        return res.status(500).send({ msg: error.message });
    }
}

module.exports = { createBook, getBooks, getBooksById, updateBooks, deleteBookById }