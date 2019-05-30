import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export const UserSessionSchema = new Schema({
	
	userId:{
		type:String,
		default:''
	},
	timestamp:{
		type:Date,
		default:Date.now()	
	}	
});

module.exports = mongoose.model('UserSession',UserSessionSchema);
