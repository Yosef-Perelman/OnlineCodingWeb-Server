const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    title: { type: String, required: true },  // Room name
    initialCode: { type: String, required: true },  // Initial code
    solution: { type: String, required: true }  // Solution code
}, { collection: 'code' });

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;
