var axios = require('axios');
const encodeKeys = require('../authScripts/encodeKeys');
require('dotenv').config();

const {
    apiKey_source,
    apiSecret_source,
    apiKey_dest,
    apiSecret_dest,
    sourceURL,
    destinationURL,
} = process.env;

var authDest = encodeKeys(apiKey_dest, apiSecret_dest);
const main = async (resourceArray) => {
    for (const i of resourceArray) {
        const resourceIds = await getResources(i);
        const result = await deleteResources(i, resourceIds);
        console.log(result);
    }
    return 'Successfully deleted all ' + resourceArray;
}
const getResources = async (resource) => {
    console.log('===Getting ' + resource + '===')
    var resourceIds = [];
    var config = {
        method: 'get',
        url: `https://${destinationURL}.myshopify.com/admin/api/2021-01/${resource}.json?limit=250`,
        headers: {
            'Authorization': authDest,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }
    await axios(config)
        .then(response => {
            if (resource == 'products') {
                for (i = 0; i < response.data.products.length; i++) {
                    resourceIds.push(response.data.products[i].id);
                }
            } else if (resource == 'blogs') {
                for (i = 0; i < response.data.blogs.length; i++) {
                    resourceIds.push(response.data.blogs[i].id);
                }
            } else if (resource == 'pages') {
                for (i = 0; i < response.data.pages.length; i++) {
                    resourceIds.push(response.data.pages[i].id);
                }
            } else {
                return 'Invalid resource!';
            }
        })
        .catch(errors => console.log(JSON.stringify(errors)));
    return resourceIds

}
const deleteResources = async (resource, resourceIds) => {
    console.log('===Deleting ' + resource + '===')
    result = [];
    for (i = 0; i < resourceIds.length; i++) {
        var config = {
            method: 'delete',
            url: `https://${destinationURL}.myshopify.com/admin/api/2021-01/${resource}/${resourceIds[i]}.json`,
            headers: {
                'Authorization': authDest,
                'Content-Type': 'application/json',
            }
        }
        await axios(config)
            .then((response) => console.log(response.data))
            .catch((errors) => console.log(JSON.stringify(errors)))
    }
    return '===Deleted ' + resource + '==='
}
main(['pages','blogs','products']).then(console.log);