const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if(cluster.isMaster){
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
    
} else {
    const express = require('express');
    const logger = require('morgan');
    const bodyParser = require('body-parser');
    const path = require('path');
    const methodOverride = require('method-override');
    const mongoose = require('mongoose');
    const helmet = require('helmet')

    mongoose.connect('mongodb://localhost/test', { useMongoClient: true });
    mongoose.Promise = global.Promise;

    var Cat = mongoose.model('Cat', { name: String });

    var kitty = new Cat({ name: 'Zildjian' });
    kitty.save(function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('meow');
    }
    });

    const app = express();

    app.use(bodyParser.urlencoded({
    extended: true
    }))

    app.use(bodyParser.json())
    app.use(methodOverride())
    app.use(helmet())

    app.use(express.static(path.join(__dirname, 'public')));

    app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
    })
    app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
    })

    app.get('/', (req, res) => {
        res.send('Hello World');
    });

    app.listen(3000, () => {
        console.log('Listening on port 3000');
    });
}
