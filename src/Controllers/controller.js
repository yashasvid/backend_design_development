import mongoose from 'mongoose';
import {UserSchema} from '../models/User';
import {UserSessionSchema} from '../models/UserSession';
const bcrypt = require('bcrypt');
import https from 'https';

var encodeUrl = require('encodeurl');
const User = mongoose.model('User', UserSchema);
const UserSession = mongoose.model('UserSession', UserSessionSchema);


export const register = (req,res)=>{
	const {body} = req;
		const {	
				firstName,
				lastName,
				password,
				category,
				genre
			  } = body; 
		let {email} = body;
		
		//add checks to see if these fields arent empty
		if(!firstName){
			return res.status(400).send({success:false,message:'First Name cannot be empty'});
		}
		if(!lastName){
			return res.status(400).send({success:false,message:'Last Name cannot be empty'});
		}
		if(!password){
			return res.status(400).send({success:false,message:'Password cannot be empty'});
		}
		if(!category){
			return res.status(400).send({success:false,message:'category cannot be empty'});
		}
		if(!genre){
			return res.status(400).send({success:false,message:'genre cannot be empty'});
		}
		if(!email){
			return res.status(400).send({success:false,message:'email cannot be empty'});
		}
		
		email = email.toLowerCase();
		
		//Check if there is an existing user with this email 
		User.find(	
					{
						email:email
					},
					( err, previousUser ) => {
						//error occurred in the find() call
						if(err){
							return res.status(500).send({
								success:false,
								message:'Server Error'
							});
						}
						//User with the same email exists
						if(previousUser.length > 0){
							//console.log(previousUser.length);
							return res.status(409).send({
								success:false,
								message:'User with this email already exists. Try another email or login.'
							});
						}
						
						//Create new user
						const newUser = new User();
						newUser.email = email;
						newUser.firstName = firstName;
						newUser.lastName = lastName;
						newUser.category = category;
						newUser.genre = genre;
						//Store hashed password in the database
						newUser.password = newUser.generateHash(password);
						
						newUser.save((err,user)=>{	
							//error occurred in the save() call
							if(err){
								return res.status(500).send({
									success:false,
									message:'Server Error'
								});
							}
							return res.status(200).send({
								success:true,
								message:'Signed up'
							});
						});
		});	
}


export const login = (req,res) => {
	
	const {body} = req;
		const { password } = body; 
		let {email} = body;
		
		if(!email){
			return res.status(400).send({success:false,message:'email cannot be empty'});
		}
		if(!password){
			return res.status(400).send({success:false,message:'Password cannot be empty'});
		}
		
		//console.log(email);
		email = email.toLowerCase();
		
		//Find user that has email =  email sent in the request
		User.find(
					{
						email:email
					},
					( err, users ) => {
						if(err){
							return res.status(500).send({
								success:false,
								message:'Server Error'
							});
						}
						//no user exists with the email in the request
						if(users.length!=1){
							return res.status(401).send({
								success:false,
								message:'Invalid'
							});
						}
						//user exists with same email as that in the request
						//check if passwords match
						const user = users[0];
						if(!user.validPassword(password)){
							return res.status(401).send({
								success:false,
								message:'Invalid password'
							});
						}
						
						//passwords match. create a session for this user
						const userSession = new UserSession();
						userSession.userId = user._id;
						userSession.save((err,doc)=>{
							if(err){
								//console.log(err);
								return res.status(500).send({
									success:false,
									message:'Server Error'
								});
							}
							return res.status(200).send({
								success:true,
								message:'Valid SignIn',
								token:doc._id
							});	
						});
				
});
}


export const getEvents = (req,res) =>{
	
		const { body } = req;
		const { token } = body;
		
		//check if user requesting events is logged in
		UserSession.find(
				{
					_id:token
				},
				( err, sessions ) => {
					if(err){
						return res.status(500).send({
							success:false,
							message:'Server Error'
						});
					}
					if(sessions.length===0){
						//console.log(sessions.length);
						return res.status(401).send({
							success:false,
							message:'Please login to get events near you.'
						});
					}
					else{
						const userId = sessions[0].userId;
						//fetch logged in user's preferences
						User.find(
						{
							_id:userId
						}, 
						( err, user ) => {
								if(err){
									return res.status(500).send({
										success:false,
										message:'Server Error'
									});
								}
								if(user.length===0){
									return res.status(401).send({
										success:false,
										message:'Invalid Request'
									});
								}
								else{
									
									const category = user[0].category;
									const genre = user[0].genre;	
									const options = {
										host:'yv1x0ke9cl.execute-api.us-east-1.amazonaws.com',
										path:'/prod/events?classificationName='+encodeURIComponent(category)+'&genreId='+encodeURIComponent(genre),
										auth:'stitapplicant:zvaaDsZHLNLFdUVZ_3cQKns'	
									};	
									
									//external api call to get events based on category and genre 
									const re = https.get(options,(response)=>{
										response.setEncoding('utf8');
										response.on('data', (chunk) => {
											//store data?
											console.log(`BODY: ${chunk}`);
										});
										response.on('end', () => {
											console.log('No more data in response.');
											return res.status(200).send({success:true,message:'Events received'});
										});
									});	
								}
						});
					}
}); 
	
	
}


export const setPreferences = (req,res) =>{
	
	const { body } = req;
		const { token } = body;
		const { category } = body;
		const { genre } = body;
		
		if(!category){
			return res.status(400).send({success:false,message:'category cannot be empty'});
		}
		if(!genre){
			return res.status(400).send({success:false,message:'genre cannot be empty'});
		}
		
		//check if user requesting to change preferences is logged in
		UserSession.find(
			{
				_id:token
			}, 
			( err, sessions ) => {
					if(err){
						return res.status(500).send({
							success:false,
							message:'Server Error'
						});
					}
					if(sessions.length === 0){
						console.log(sessions.length);
						return res.status(401).send({
							success:false,
							message:'Please login to set preferences.'
						});
					}
					else{
				
						const userId = sessions[0].userId;	
						User.update( 
						{
							_id:userId
						}, 
						{ 
							$set: { 
									category: category, 
									genre:genre 
								  }	
						},
						( err, result ) => {
							if(err){
								return res.status(500).send({
									success:false,
									message:'Server Error'
								});
							}
							return res.status(200).send({
									success:true,
									message:'Your preferences have been updated.'
							});	
						});
					}
		});	
	
	
	
	
	
}