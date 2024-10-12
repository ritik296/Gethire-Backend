const mongoose = require('mongoose');



const BookmarkSchema = new mongoose.Schema({
    StudentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    bookmarkedJobs: [{
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Jobs',
            required: true
        }
    }]
})


const BookmarkModel = mongoose.model('Bookmark', BookmarkSchema);
module.exports = BookmarkModel;