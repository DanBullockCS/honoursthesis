// Mongoose Presentation
let mongoose = require('mongoose');

let Schema = mongoose.Schema;
let presentationSchema = new Schema({
    ownerName: String,
    fileName: {
       type: String,
       unique: true,
       index: true,
    },
    fileContent: String,
 }, {
    collection: 'presentations'
 });

 let Presentation = mongoose.model('presentation', presentationSchema);

 module.exports = Presentation;