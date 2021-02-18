'use strict';
var encodeKeys = require('./utils/authScripts/encodeKeys');
const fs = require('fs');
var axios = require('axios');
require('dotenv').config();
const {
    apiKey_source,
    apiSecret_source,
    apiKey_dest,
    apiSecret_dest,
    destinationURL,
    sourceURL
} = process.env;

let rawdata = fs.readFileSync('./asp.json');
let file = JSON.parse(rawdata);
const postProducts = async () => {
        for (const variant of file.product.variants) {
            delete variant.image_id;    
        }
    var payload = JSON.stringify({
        "product": file.product
    });

    var config = {
        method: 'post',
        url: `https://z21-store-cloner.myshopify.com/admin/api/2020-10/products.json`,
        headers: {
            'Authorization': encodeKeys(apiKey_dest,apiSecret_dest),
            'Content-Type': 'application/json',
            'Accept':'application/json'
        },
        data: payload
    }
    
 
    const data = await axios(config)
        .then(response => response.data)
        .catch(errors => console.log(JSON.stringify(errors)));
    return data ? data : 'An error occured';
}
postProducts().then(console.log)