# Shopify Import Script
This script uses the [Shopify Admin API](https://shopify.dev/docs/admin-api) to achieve the following:

1) Get blog articles from a store
2) Post the articles from source to destination store
## Installing
```
$ npm install
```
```
$ npm start
```
## Prerequisites 
This script requires a .env file on the root folder to retreive the API Key and API Secret as shown below:
```
apiKey = 'YOUR API KEY'
apiSecret = 'YOUR API SECRET'
```
See [dotenv](https://www.npmjs.com/package/dotenv) for more info.

## getArticles.js
Using [Axios](https://github.com/axios/axios), this script sends a GET request to the endpoint [https://{storeURL}.myshopify.com/admin/api/2021-01/blogs.json](https://{storeURL}.myshopify.com/admin/api/2021-01/blogs.json) (hardcoded into the URL parameter for now), and console logs the result.

## importArticles.js
After retreving all the articles, importArticles.js can be used to send a POST request to the endpoint [https://{storeURL}.myshopify.com/admin/api/2021-01/blogs/{blogID}/articles.json](https://{storeURL}.myshopify.com/admin/api/2021-01/blogs/{blogID}/articles.json). A successful POST request will respond with 
>status code = 201
and respond with the article sent. 

This is done in a forloop for the length of the articles array.

## Future Improvements
Future developments include intergrating both scripts to eliminate the tedious task of storing the retreived articles in a .json file for subsequent posting. This script can be extended to import pages, products, collections in the same manner, using the [Shopify Admin API](https://shopify.dev/docs/admin-api).