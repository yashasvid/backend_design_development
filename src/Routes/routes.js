import {register, login, getEvents, setPreferences} from '../Controllers/controller';
const routes = (app) => {
	
	/*
	parameters expected : firstname, lastname, email, password, category, genre
	possible responses : User with email already exists, Sign up successful, Server Error, Empty fields not allowed.
	*/
	app.route('/register')
	.post(register)
		
	/*
	parameters expected : email, password
	possible responses : Log in successful, Invalid password, Invalid request, Server Error, Empty fields not allowed.
	*/
	app.route('/login')
	.post(login)
	
	/*
	parameters expected : token
	possible responses : Log in before requesting events, Events Received, Invalid request, Server Error
	*/
	app.route('/getEvents')
	.get(getEvents)

	/*
	parameters expected : token, category, genre
	possible responses : Log in before requesting events, Preferences are updated, Invalid request, Server Error
	*/	
	app.route('/setPreferences')
	.put(setPreferences)
		
}

export default routes;