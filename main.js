require('dotenv').config();
var encodeKeys = require('./encodeKeys');
var importBlogs = require('./importBlogs');

// Retreives API keys from .env file
const {
    apiKey_source,
    apiSecret_source,
    apiKey_dest,
    apiSecret_dest
} = process.env;

//Enter Source and Destination Store URLs (EDIT ME)
var sourceURL = "z21-store-cloner"
var destinationURL = "getha-thailand"


async function main(){
    // Encodes the API keys in base64 to be used as Auth headers
    var authSource = encodeKeys(apiKey_source, apiSecret_source);
    var authDest = encodeKeys(apiKey_dest, apiSecret_dest);

    //Tries to import the blogs, catches errors
    try {
        await importBlogs(sourceURL, destinationURL,authSource,authDest );

    } catch (err) {
        console.log(err);
    }
}
main()
