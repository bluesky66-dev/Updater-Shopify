var axios = require('axios');
const encodeKeys = require('./encodeKeys');
require('dotenv').config();
var destinationURL = 'z21-store-cloner'
var productIds = [];
const {
    apiKey_source,
    apiSecret_source,
    apiKey_dest,
    apiSecret_dest
} = process.env;

var authDest = encodeKeys(apiKey_dest, apiSecret_dest);
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function getproducts(){
    var config = {
        method: 'get',
        url: `https://${destinationURL}.myshopify.com/admin/api/2021-01/products.json?limit=250`,
        headers: {
            'Authorization': authDest,
            'Content-Type': 'application/json',
        },
    }
    axios(config)
        .then(async function (response) {
            for(i=0;i<response.data.products.length;i++){
                productIds.push(response.data.products[i].id);
            }
            for(i=0;i<productIds.length;i++){
                console.log('===Deleting ' + [i + 1] + ' of ' + productIds.length + ' products===');
                deleteproducts();
                await sleep(1000);
            }
        })
        .catch(function (errors) {
            console.log(JSON.stringify(errors));
        });
}    
async function deleteproducts(){
    
    var config = {
        method: 'delete',
        url: `https://${destinationURL}.myshopify.com/admin/api/2021-01/products/${productIds[i]}.json`,
        headers: {
            'Authorization': authDest,
            'Content-Type': 'application/json',
        }
    }
     await axios(config)
        .then(response => response.data)
        .catch(errors => console.log(JSON.stringify(errors)));
    }
getproducts()