var axios = require('axios');
require('dotenv').config();

const importProducts = async (sourceURL, destinationURL, authSource, authDest) => {
    console.log('====DUPLICATING PRODUCTS====');
    try {
        const productSource = await getProducts(sourceURL, authSource);
        const productDest = await getProducts(destinationURL, authDest);
        const productData = [productSource, productDest];

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
            if (productsDest == '') {
                console.log('===Posting ' + [i + 1] + ' of ' + productsSource.length + ' products===');
                const productTitle = await postProducts(storeURL, auth, productsSource);
                productTitlesDest.push(productTitle);
            } else {
                if (productsSource[i].handle != productsDest[i].handle) {
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
    sleep(1000);
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
        .catch(errors => console.log(JSON.stringify(errors)));
    return products
}
module.exports = importProducts;