var axios = require('axios');
require('dotenv').config();
const fs = require('fs');
// Variants with an image_id will return an error 422 because the image_ids are generated by the server.
// My fix (poor fix) is to eliminate image_ids altogether and post the products as normal. Images will remain, but
// variants wont have specific images attached to them. Eg. If I click on variant C, Image for variant A still shown.
// Alternatively, forums suggests a double saving method where products are posted without image_ids, variant ids are
// saved and later, once images are uploaded, they re-attach the new image_ids to the products.


const importProducts = async (sourceURL, destinationURL, authSource, authDest) => {
    console.log('====DUPLICATING PRODUCTS====');
    try {
        const productSource = await getProducts(sourceURL, authSource);
        const productDest = await getProducts(destinationURL, authDest);
        const productData = [productSource, productDest];
        //
        productData ? console.log('Product Data Fetched') : console.log('Error occured, no products!');
        const productTitle = await checkProductData(destinationURL, authDest, productData);
        return typeof productTitle == 'number' ? 'Successfully imported ' + productTitle + ' products' : 'Error occured: ' + productTitle;
    } catch (err) {
        console.log(err);
    }
}
// NOTE: Once the return is called, the loop ends. You CAN'T use return in a FOR LOOP!!
const checkProductData = async (storeURL, auth, productData) => {
    productsSource = productData[0].products;
    productsDest = productData[1].products;

    productTitlesDest = [];
    if (productsSource == '') {
        return 'No products to import';
    } else {
        for (i = 0; i < productsSource.length; i++) {
            console.log('===Posting ' + [i + 1] + ' of ' + productsSource.length + ' products===');
            if (productsDest == '') {
                const productTitle = await postProducts(storeURL, auth, productsSource);
                productTitlesDest.push(productTitle);
            } else {
                if (productsSource?.[i].handle != productsDest?.[i].handle) {
                    const productTitle = await postProducts(storeURL, auth, productsSource);
                    productTitlesDest.push(productTitle);
                } else {
                    console.log('Product already exists!');
                    continue
                }
            }
        }
    }
    return productTitlesDest != '' ? productTitlesDest.length : 'Products already imported';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const postProducts = async (storeURL, auth, productsSource) => {
    for (const variant of productsSource[i].variants) {
        delete variant.image_id;
    }

    var payload = JSON.stringify({
        "product": productsSource[i]
    });


    var config = {
        method: 'post',
        url: `https://${storeURL}.myshopify.com/admin/api/2021-01/products.json`,
        headers: {
            'Authorization': auth,
            'Content-Type': 'application/json',
        },
        data: payload
    }

    const data = await axios(config)
        .then(response => response.data)
        .catch(errors => console.log(JSON.stringify(errors)));
    await sleep(100);
    return data ? data : 'An error occured';
}
const getProducts = async (storeURL, auth) => {
    console.log('===Fetching Products===');
    var config = {
        method: 'get',
        url: `https://${storeURL}.myshopify.com/admin/api/2021-01/products.json?limit=250`,
        headers: {
            'Authorization': auth,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }
    const products = await axios(config)
        .then(response => response.data)
        .catch(errors => errors);
    return products
}
module.exports = importProducts;
