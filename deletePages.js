var axios = require('axios');
const encodeKeys = require('./encodeKeys');
require('dotenv').config();
var destinationURL = 'z21-store-cloner'
var pageIds = [];
const {
    apiKey_source,
    apiSecret_source,
    apiKey_dest,
    apiSecret_dest
} = process.env;

var authDest = encodeKeys(apiKey_dest, apiSecret_dest);

function getPages(){
    var config = {
        method: 'get',
        url: `https://${destinationURL}.myshopify.com/admin/api/2021-01/pages.json`,
        headers: {
            'Authorization': authDest,
            'Content-Type': 'application/json',
        },
    }
    axios(config)
        .then(async function (response) {
            for(i=0;i<response.data.pages.length;i++){
                pageIds.push(response.data.pages[i].id);
            }
            deletePages();
        })
        .catch(function (errors) {
            console.log(JSON.stringify(errors));
        });
}    
function deletePages(){
    for(i=0;i<pageIds.length;i++){
        var config = {
            method: 'delete',
            url: `https://${destinationURL}.myshopify.com/admin/api/2021-01/pages/${pageIds[i]}.json`,
            headers: {
                'Authorization': authDest,
                'Content-Type': 'application/json',
            },
        }
        axios(config)
            .then(function (response) {
              console.log(response.data);
            })
            .catch(function (errors) {
                console.log(JSON.stringify(errors));
            });
    }
}
getPages()