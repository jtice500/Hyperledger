// imports
const express = require('express');
var invoke = require('./Chaincode/createTrans.js');
import submitTransaction from createTrans.js

const app = express();
const PORT = 4000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// listen on port 4000
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

// static files
app.use(express.static('public'));

// Set Views

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.post('/invoke-transaction', (req,res) => {
    logger.debug('***************  INVOKING TRANSACTION  *****************');
    submitTransaction(req.body.nameField, req.body.energyField);
    
});
