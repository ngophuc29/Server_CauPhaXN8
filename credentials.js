var credentials ={

	credentials: {
		client_id: 'QArSSWwAysk7fOe2iescDEqVXQB0zTt4EZu4arG3Ts0TbYI6',
		client_secret: 'J8yXfAznakGW117GzxWtR6RqN72RS5jv0E9cDWa2kIi1qE5QGfdTH1p7rqlb6HGy',
		grant_type: 'client_credentials',
		scope: 'viewables:read',

	},
	
	//Autodesk Forge base url
	BaseUrl: 'https://developer.api.autodesk.com',
	Version: 'v1'
} ;

credentials.Authentication = credentials.BaseUrl + '/authentication/' + credentials.Version + '/authenticate'


module.exports = credentials;