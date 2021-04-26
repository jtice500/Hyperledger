// imports

const express = require('express');

const hbs = require('express-handlebars');

const bodyParser = require('body-parser');



const app = express();

const PORT = 4000





app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());



app.engine('hbs', hbs({ extname: 'hbs'}));

app.set('view engine', 'hbs');



// listen on port 4000

app.listen(PORT, () => {

    console.log(`Server started on port ${PORT}`);

});



// static files

app.use(express.static('public'));



// Set Views



app.get('/', (req, res) => {

    res.render('main', {layout: false});

});



app.post('/invoke', (req, res) => {

    //logger.debug('***************  INVOKING TRANSACTION  *****************');

    res.render('main', {test: req.body.nameField, layout: false});

});