import mongoose from 'mongoose';
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	
	firstName:{
		type:String, 
		required:'Enter first name'	
	},
	lastName:{
		type:String,
		required:'Enter last name'	
	},
	email:{
		type:String,
		required:'Enter email'
	},	
	category:{
		type:String,
		required:'Enter category'
	},
	genre:{
		type:String,
		required:'Enter genre'
	},
	password:{
		type:String,
		required:'Enter password'
	}	
});

UserSchema.methods.generateHash = function(password){
return bcrypt.hashSync(password,bcrypt.genSaltSync(8),null);
};

UserSchema.methods.validPassword = function(password){
return bcrypt.compareSync(password,this.password);
};

module.exports = mongoose.model('User',UserSchema);