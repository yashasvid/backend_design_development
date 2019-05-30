import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;

import routes from './src/Routes/routes';

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/stitdb',{
	useMongoClint:true
});

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

routes(app);

app.get('/',(req,res) =>
	
	res.send(`node and express server are running on port ${PORT}`)
	
);

app.listen(PORT, () =>
	
	console.log(`your server is running on port ${PORT}`)
	
);
