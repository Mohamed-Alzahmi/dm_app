//use express
const express = require('express');
const router = express.Router();
const authToken = require("../util/authenticateToken"); //used for login token
const {spawn} = require('child_process');
const { nextTick } = require('process');

const {PythonShell} = require('python-shell');

router.get('/', authToken, (req, res) => {
let options = {
    pythonPath: 'C:/ProgramData/Anaconda3/envs/RQ3/python.exe',
    mode: 'text',
    pythonOptions: ['-u'], // get print results in real-time
    args: ['C:/Users/61416/Desktop/Tesseract-OCR/tesseract.exe', './uploads/test1.jpg']
    
} 

PythonShell.run('./util/t1_2022_ocr_final.py', options, function (err, results) {
    if (err) throw err;
    // results is an array consisting of messages collected during execution
    console.log('results: %j', results);
    res.send(results);
    
});
})

//export router
module.exports = router;