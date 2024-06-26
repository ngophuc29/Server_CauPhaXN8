var credentials ={

	credentials: {
		client_id: 'dqrEtryUxaLnXKzdZCjGGO3kFrDtAOqnrwtDcq2zGQpuRAn5',
		client_secret: '3J2A1LsuAQY4Kf5yGAtRFgwrfTpVgus8jrfwdAyXLMC89ejRkQHLrsBRQV59ZcEs',
		grant_type: 'client_credentials',
		scope: 'viewables:read',

	},
	
	//Autodesk Forge base url
	BaseUrl: 'https://developer.api.autodesk.com',
	Version: 'v1'
} ;

credentials.Authentication = credentials.BaseUrl + '/authentication/' + credentials.Version + '/authenticate'


module.exports = credentials;