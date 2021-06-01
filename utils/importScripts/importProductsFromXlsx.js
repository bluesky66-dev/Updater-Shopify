var axios = require('axios');
require('dotenv').config();
var XLSX = require('xlsx');
const fs = require('fs');
const Shopify = require('shopify-api-node');

const {
    apiKey_source,
    apiSecret_source,
    apiKey_dest,
    apiSecret_dest,
    destinationURL,
    sourceURL
} = process.env;

const importProducts = async (sourceURL, destinationURL, authSource, authDest) => {
    console.log('====READING PRODUCTS FROM xlsx file====');
    try {
        const productData = await getProducts(destinationURL, authDest);
        productData ? console.log('Product Data Fetched') : console.log('Error occured, no products!');
        // const productTitle = 12;
        const productTitle = await checkProductData(destinationURL, authDest, productData);
        return typeof productTitle == 'number' ? 'Successfully imported ' + productTitle + ' products' : 'Error occured: ' + productTitle;
    } catch (err) {
        console.log(err);
    }
}
// NOTE: Once the return is called, the loop ends. You CAN'T use return in a FOR LOOP!!
const checkProductData = async (storeURL, auth, productData) => {
    const productTitlesDest = [];
    for (let i = 0; i < productData.length; i++) {
        console.log(Object.keys(productData[i]).length)
        if (!productData[i] || Object.keys(productData[i]).length === 0) continue;
        const productTitle = await postProducts(storeURL, auth, productData, i);
        productTitlesDest.push(productTitle);
        // break;
    }
    return productTitlesDest != '' ? productTitlesDest.length : 'Products already imported';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const postProducts = async (storeURL, auth, productsSource, i) => {
    let data = {};

    const shopify = new Shopify({
        shopName: destinationURL,
        apiKey: apiKey_dest,
        password: apiSecret_dest
    });
    // return data ? data : 'An error occured';
    try {
        data = await shopify.product
          .create(productsSource[i]);
    } catch (e) {
        fs.writeFile(`files/payload-${i}.json`, JSON.stringify(productsSource[i]), err => {
            if (err) {
                console.error(err)
                return
            }
            //file written successfully
        })
        console.log(e.message)
    }
    await sleep(100);
    return data ? data : 'An error occured';
}
const getProducts = async (storeURL, auth) => {
    console.log('===Reading Products===');
    var workbook = XLSX.readFile('Products/MAIN_PRODUCTS.xlsx');
    var first_sheet_name = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[first_sheet_name];
    // fs.writeFile('files/test.json', JSON.stringify(worksheet), err => {
    //     if (err) {
    //         console.error(err)
    //         return
    //     }
    //     //file written successfully
    // })
    const products = [];
    let preTitle = '';
    let preCat = '';
    let product = {};
    for (let i = 2; i <= 65; i++) {
        console.log(`===Reading Products === ${i}`);
        if (!worksheet[`D${i}`] && !worksheet[`B${i}`]) continue;
        if (preTitle === worksheet[`D${i}`].v && preCat === worksheet[`B${i}`].v) {
            product = getProductsVariants(worksheet, product, i);

            const productImages = await getProductsImages(worksheet, i);
            product.images = product.images.concat(productImages);
        } else {
            if (Object.keys(product).length > 0) {
                if (product.images.length === 0) delete product.images;
                if (product.metafields.length === 0) delete product.metafields;
                product.options = product.options.filter((option, i) => {
                    return option.values.length > 0;
                })

            }
            products.push(product);

            product = {};
            product.images = [];
            product.options = [
                {
                    "name": "Color",
                    "values": []
                },
                {
                    "name": "Size",
                    "values": []
                },
                {
                    "name": "PRIORITY ON WEBSITE",
                    "values": []
                },
                {
                    "name": "SHIPPING TIME",
                    "values": []
                },
                {
                    "name": "DELIVERY TIME",
                    "values": []
                }
            ];
            product.variants = [];
            product.metafields = [];

            preTitle = worksheet[`D${i}`].v;
            preCat = worksheet[`B${i}`].v;

            product.title = worksheet[`D${i}`].v;
            product.status = 'active';
            product.body_html = worksheet[`O${i}`].v;
            product.vendor = worksheet[`C${i}`].v;
            product.product_type = worksheet[`B${i}`].v;
            product = getProductsVariants(worksheet, product, i);

            const productImages = await getProductsImages(worksheet, i);
            product.images = product.images.concat(productImages);
        }
    }
    if (Object.keys(product).length > 0) {
        if (product.images.length === 0) delete product.images;
        if (product.metafields.length === 0) delete product.metafields;
        product.options = product.options.filter((option, i) => {
            return option.values.length > 0;
        })

    }
    products.push(product);
    fs.writeFile('files/putting-product.json', JSON.stringify(products), err => {
        if (err) {
            console.error(err)
            return
        }
        //file written successfully
    })
    return products
}

const getProductsVariants = (worksheet, product, i) => {
    const option1 = worksheet[`E${i}`] ? worksheet[`E${i}`].v : '';
    const option2 = worksheet[`F${i}`] ? worksheet[`F${i}`].v : '';
    const price = worksheet[`Q${i}`] ? worksheet[`Q${i}`].v : '';
    const sku = worksheet[`G${i}`] ? worksheet[`G${i}`].v : '';
    const barcode = worksheet[`H${i}`] ? worksheet[`H${i}`].v : '';
    const compareAtPrice = worksheet[`P${i}`] ? worksheet[`P${i}`].v : '';

    if (product.options[0].values.indexOf(option1) < 0) {
        if (option1) product.options[0].values.push(option1);
    }
    if (product.options[1].values.indexOf(option2) < 0) {
        if (option2) product.options[1].values.push(option2);
    }

    product.variants.push({
        option1: option1,
        option2: option2,
        price: price,
        sku: sku,
        barcode: barcode,
        compare_at_price: compareAtPrice,
    })
    return product;
}

const getMetaNamespace = (value) => {
    return value.toLowerCase().replace(/[^a-zA-Z ]/g, "").replace(' ', '_')
}

const getProductsImages = async (worksheet, i) => {
    const imageServer = 'https://blueskydev.000webhostapp.com/';
    const images = [];
    const productImages = [];
    const product_type = worksheet[`B${i}`].v;
    if (worksheet[`I${i}`]) images.push(worksheet[`I${i}`].v);
    if (worksheet[`J${i}`]) images.push(worksheet[`J${i}`].v);
    if (worksheet[`K${i}`]) images.push(worksheet[`K${i}`].v);
    if (worksheet[`L${i}`]) images.push(worksheet[`L${i}`].v);
    if (worksheet[`M${i}`]) images.push(worksheet[`M${i}`].v);
    if (worksheet[`N${i}`]) images.push(worksheet[`N${i}`].v);

    for (let k = 0; k < images.length; k++) {
        if (images[k]) {
            try {
                const imagePath1 = `MAIN_PRODUCTS_IMAGES/${product_type}/${images[k]}.jpg`;
                const imagePath2 = `MAIN_PRODUCTS_IMAGES/${product_type}/${images[k]}.png`;
                if (fs.existsSync(`Products/${imagePath1}`)) {
                    // const attachment = fs.readFileSync(imagePath1, {encoding: 'base64'});
                    productImages.push({
                        src: imageServer + imagePath1
                    });
                }
                if (fs.existsSync(`Products/${imagePath2}`)) {
                    // const attachment = fs.readFileSync(imagePath2, {encoding: 'base64'});
                    productImages.push({
                        src: imageServer + imagePath1
                    });
                }
            } catch (e) {

            }
        }
    }

    return productImages;
}

const addslashes = (str) => {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}
module.exports = importProducts;
