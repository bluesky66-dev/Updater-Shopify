var axios = require('axios');
require('dotenv').config();


function importBlogs(sourceURL,destinationURL,authSource,authDest){
    var config = {
        method: 'get',
        url: `https://${sourceURL}.myshopify.com/admin/api/2021-01/blogs.json`,
        headers: {
            'Authorization': authSource,
            'Content-Type': 'application/json',
        },
    }
    axios(config)
        .then(function (response) {
          postData(response.data,destinationURL,authDest);
        })
        .catch(function (errors) {
            console.log(JSON.stringify(errors));
        });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function postData(myBlogs,destinationURL,authDest) {
        for (i = 0; i < 1; i++) {

            var data = JSON.stringify({
                "blog": myBlogs.blogs[i]
            });
            var config = {
                method: 'post',
                url: `https://${destinationURL}.myshopify.com/admin/api/2021-01/blogs.json`,
                headers: {
                    'Authorization': authDest,
                    'Content-Type': 'application/json',
                },
                data: data
            }
            
            axios(config)
                .then(function (response) {
                    if(response.status == 201){
                        console.log("Imported Successfully!")
                        console.log(response.data);
                    };
                })
                .catch(function (errors) {
                    console.log(JSON.stringify(errors));
                });
            sleep(1000);
            
        };
}
module.exports = importBlogs;
