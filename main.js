require('dotenv').config();
var encodeKeys = require('./encodeKeys');
var importBlogs = require('./importBlogs');
var importPages = require('./importPages');
var importProducts = require('./importProducts');

// Retreives API keys from .env file
const {
    apiKey_source,
    apiSecret_source,
    apiKey_dest,
    apiSecret_dest
} = process.env;

//Enter Source and Destination Store URLs (EDIT ME)
var sourceURL = "getha-th-test"
var destinationURL = "z21-store-cloner"


async function main(){
    // Encodes the API keys in base64 to be used as Auth headers
    var authSource = encodeKeys(apiKey_source, apiSecret_source);
    var authDest = encodeKeys(apiKey_dest, apiSecret_dest);

    //Tries to import the blogs, catches errors
    try {
        //const blogs = await importBlogs(sourceURL,destinationURL,authSource,authDest);
        //const pages = await importPages(sourceURL,destinationURL,authSource,authDest);
        const products = await importProducts(sourceURL,destinationURL,authSource,authDest);
        return [products];
    } catch (err) {
        console.log(err);
    }
}
main().then(console.log)
