const BookModel = require('../model/booksModel')
const ReviewModel = require('../model/reviewModel')
const ObjectId = require('mongoose').Types.ObjectId

/////////////////////////////////////////////////// Create Review ////////////////////////////////////////////////////////

const createReview = async function (req, res) {
    try {
        let data = req.body
        let reviewDetails = await ReviewModel.create(data)

        let reviewId = reviewDetails._id

        let bookId = req.params.bookId
        let updatingReview = await BookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: +1 } }, { new: true })

        let bookDetail_withReview = await ReviewModel.findOne({ _id: reviewId }).populate('bookId')

        return res.status(201).send({ status: true, msg: bookDetail_withReview })
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}

//////////////////////////////////////////////////// Update Review ///////////////////////////////////////////////////////

const isValidRating = function (body) {
    const ratingRegex = /^([1-5]|1[5])$/;
    return ratingRegex.test(body)
}

const isValidName = function (body) {
    const nameRegex = /^[a-zA-Z_ ]*$/;
    return nameRegex.test(body)
}

const updateReview = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, msg: "Invalid bookId" })
        if (!ObjectId.isValid(reviewId)) return res.status(400).send({ status: false, msg: "Invalid reviewId" })

        let findBook = await BookModel.findById(bookId)
        if (!findBook) return res.status(400).send({ status: false, msg: "Book does not exist" })
        if (findBook.isDeleted == true) return res.status(404).send({ status: false, msg: "Book is already deleted" })

        let findReview = await ReviewModel.findById(reviewId)
        if (!findReview) return res.status(400).send({ status: false, msg: "Review does not exist" })
        if (findReview.isDeleted == true) return res.status(404).send({ status: false, msg: "Review is already deleted" })
        if (bookId != findReview.bookId) return res.status(400).send({ status: false, msg: "bookId & reviewId are not from same book" })

        let details = req.body
        let { review, rating, reviewedBy, ...rest } = { ...details }
        if (Object.keys(rest) != 0) return res.status(400).send({ status: false, msg: "You can update only review, rating & reviewedBy" })
        if (Object.keys(details).length == 0) return res.status(400).send({ status: false, msg: "Please provide details" })

        if (details.reviewedBy) {
            if (!isValidName(details.reviewedBy)) return res.status(400).send({ status: false, msg: "Inavlid reviewer's name" })
        }

        if (details.rating) {
            if (!isValidRating(details.rating)) return res.status(404).send({ status: false, msg: "Please give ratings between 1 to 5 only" })
        }

        let updating_ReviewDetail = await ReviewModel.findOneAndUpdate(
            { _id: reviewId },
            { $set: { review: details.review, rating: details.rating, reviewedBy: details.reviewedBy } }, { new: true })

        let reviewDetail_withBook = await ReviewModel.findOne({ _id: reviewId }).populate('bookId')
        return res.status(200).send({ status: false, msg: reviewDetail_withBook })
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}

/////////////////////////////////////////////////// Delete Review ////////////////////////////////////////////////////////

let deleteReview = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, msg: "Invalid bookId" })
        if (!ObjectId.isValid(reviewId)) return res.status(400).send({ status: false, msg: "Invalid reviewId" })

        let findBook = await BookModel.findById(bookId)
        if (!findBook) return res.status(400).send({ status: false, msg: "Book does not exist" })
        if (findBook.isDeleted == true) return res.status(404).send({ status: false, msg: "Book is already deleted" })

        let findReview = await ReviewModel.findById(reviewId)
        if (!findReview) return res.status(400).send({ status: false, msg: "Review does not exist" })
        if (findReview.isDeleted == true) return res.status(404).send({ status: false, msg: "Review is already deleted" })
        if (bookId != findReview.bookId) return res.status(400).send({ status: false, msg: "Please give bookId and reviewId of same book" })

        let updatingReview = await BookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } }, { new: true })
        let deletedReview = await ReviewModel.findOneAndUpdate({ _id: reviewId }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })

        return res.status(200).send({ status: true, msg: "Review deleted successfully" })
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}

module.exports = { createReview, updateReview, deleteReview }