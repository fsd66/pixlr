const path = require('path');

const express = require('express');
const expressWs = require('express-ws');
const mongoose = require('mongoose');

const pictureRoute = require('./routes/pictureManipulation.js');

const ews = expressWs(express());
const app = ews.app;

const port = process.env.PORT;
const dbUrl = process.env.DATABASE_URL;

mongoose.connect(dbUrl, { useNewUrlParser: true })
        .then(() => {
            console.log(`Successfully connected to database at ${dbUrl}`);
        }).catch(error => {
            console.error(`Unable to connect to database at ${dbUrl}`);
            console.error(`Error: ${error}`);
        });

app.use('/static', express.static(path.join(__dirname, 'public')));

const pictureRouteUrl = '/picture';
app.use(pictureRouteUrl, pictureRoute(ews.getWss(pictureRouteUrl)));

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pixlr.html'));
});

app.listen(port, () =>  console.log(`Application started!  Listening on port: ${port}`));
