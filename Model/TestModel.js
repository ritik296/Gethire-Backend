const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
    optionText: {
        type: String,
        required: true
    }
});

const QuestionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    options: [OptionSchema],
    correctAnswer: {
        type: String,
        required: true
    }
});

const TestSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jobs',
        required: true
    },
    questions: [QuestionSchema],
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const TestModel = mongoose.model('Test', TestSchema);
module.exports = TestModel;
