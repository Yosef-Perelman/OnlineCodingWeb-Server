const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    initialCode: { type: String, required: true },
    solution: { type: String, required: true }
}, { collection: 'code' });

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;
