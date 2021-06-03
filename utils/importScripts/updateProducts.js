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

const EXCEL_FILE = 'FOOTWEAR_COLLECTION';
const SHEET_INDEX = 0;
const SHEET_LENGTH = 589;
const IMAGE_FOLDER = 'FOOTWEAR CASUAL IMAGES';

// Dev Store
const COLLECTION_ID = 269322911909;

// Live Store
// const COLLECTION_ID = 268744753323;

const updateProducts = async (sourceURL, destinationURL, authSource, authDest) => {
    console.log('====READING PRODUCTS FROM xlsx file====');
    try {
        const productSource = await getProductsFromUrl(sourceURL, authSource);
        const productDest = await getProductsFromExcel(destinationURL, authDest);
        if (productSource.products.length !== productDest.length) {
            console.log('Error occured, no matched products!');
            return 'Error occured, no matched products!'
        }
        console.log('Product Data Fetched ' + productDest.length)
        fs.writeFile(`files/productSource.json`, JSON.stringify(productSource), err => {
        })
        fs.writeFile(`files/productDest.json`, JSON.stringify(productDest), err => {
        })

        const productData = [productSource, productDest];
        // const productTitle = 12;
        const productTitle = await checkProductData(destinationURL, authDest, productData);
        return typeof productTitle == 'number' ? 'Successfully imported ' + productTitle + ' products' : 'Error occured: ' + productTitle;
    } catch (err) {
        console.log(err);
    }
}
// NOTE: Once the return is called, the loop ends. You CAN'T use return in a FOR LOOP!!
const checkProductData = async (storeURL, auth, productData) => {
    const productsSource = productData[0].products;
    const productsDest = productData[1];
    const productTitlesDest = [];
    for (let i = 0; i < productsSource.length; i++) {
        if (!productsSource[i] || Object.keys(productsSource[i]).length === 0) continue;
        const { id, title, product_type, variants, images} = productsSource[i];
        console.log(`=== Updating product === ${i} === ${id}`)

        const dProducts = productsDest.filter((item) => {
            return title === item.title
              && product_type === item.product_type
              && variants.length === item.variants.length;
        });
        if (dProducts.length < 1) {
            // fs.writeFile(`files/dProducts-${id}.json`, JSON.stringify(dProducts), err => {
            // })
            // fs.writeFile(`files/sProducts-${id}.json`, JSON.stringify(productsSource[i]), err => {
            // })
            // break;
            console.log(`***** ERROR ERROR ERROR ERROR ERROR ERROR ERROR ***** Not Found Products`)
            continue;
        }

        const product = { id, variants: [] };
        for (let j = 0; j < variants.length; j++){
            const { id: variantId, option1, option2 } = variants[j];
            const dVariant = dProducts[0].variants.filter((item) => {
                return option1 === item.option1 && option2 === `${item.option2}`
            })
            if (dVariant.length < 1) continue;

            const sImage = images.filter((item) => {
                const { image } = dVariant[0];
                return item.src.indexOf(image) !== -1
            })

            if (sImage.length > 0) {
                product.variants.push({
                    id: variantId,
                    image_id: sImage[0].id,
                });
            }
        }

        if (product.variants.length !== variants.length) {
            // fs.writeFile(`files/dProducts-${id}.json`, JSON.stringify(dProducts), err => {
            // })
            // fs.writeFile(`files/sProducts-${id}.json`, JSON.stringify(productsSource[i]), err => {
            // })
            // console.log(`***** ERROR ERROR ERROR ERROR ERROR ***** ${product.variants.length} ***** ${variants.length}` )
            // break;
            console.log(`***** ERROR ERROR ERROR ERROR ERROR ***** ${variants.length} ***** ${product.variants.length}` )
            continue;
        }

        // const productTitle = await putProduct(storeURL, auth, product);
        // productTitlesDest.push(productTitle);
        // break;
    }
    return productTitlesDest !== '' ? productTitlesDest.length : 'Products already imported';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const getProductsFromUrl = async (storeURL, auth) => {
    console.log('===Fetching Products===');
    var config = {
        method: 'get',
        url: `https://${storeURL}.myshopify.com/admin/api/2021-01/products.json?limit=250&fields=id,title,product_type,images,variants&collection_id=${COLLECTION_ID}`,
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

const putProduct = async (storeURL, auth, product) => {
    let payload = JSON.stringify({
        "product": product
    });


    let config = {
        method: 'put',
        url: `https://${storeURL}.myshopify.com/admin/api/2021-01/products/${product.id}.json`,
        headers: {
            'Authorization': auth,
            'Content-Type': 'application/json',
        },
        data: payload
    }

    const data = await axios(config)
      .then(response => response.data)
      .catch(errors => console.log(JSON.stringify(errors)));
    await sleep(200);
    return data ? data : 'An error occured';
}

const getProductsFromExcel = async (storeURL, auth) => {
    console.log('===Reading Products===');
    var workbook = XLSX.readFile(`Products/${EXCEL_FILE}.xlsx`);
    var first_sheet_name = workbook.SheetNames[SHEET_INDEX];
    var worksheet = workbook.Sheets[first_sheet_name];
    const products = [];
    let preTitle = '';
    let preCat = '';
    let preHtmlBody = '';
    let product = {};
    for (let i = 2; i <= SHEET_LENGTH; i++) {
        console.log(`===Reading Products === ${i}`);
        const category = worksheet[`A${i}`]?.v.trim();
        const title = worksheet[`L${i}`]?.v;
        const htmlBody = worksheet[`M${i}`]?.v;

        if (!title && !category) continue;

        if (preTitle === title && preCat === category && preHtmlBody === htmlBody) {
            product = getProductsVariants(worksheet, product, i);
        } else {
            if (Object.keys(product).length > 0) {
                products.push(product);
            }
            product = {};
            product.variants = [];

            preTitle = title;
            preCat = category;
            preHtmlBody = htmlBody;

            product.title = title;
            product.status = 'active';
            product.body_html = htmlBody;
            const categories = category.split('-');
            product.product_type = categories[0].trim();

            product = getProductsVariants(worksheet, product, i);
        }
    }
    products.push(product);
    return products
}

const getProductsVariants = (worksheet, product, i) => {
    const option1 = worksheet[`C${i}`] ? worksheet[`C${i}`].v : null;
    const option2 = worksheet[`B${i}`] ? worksheet[`B${i}`].v : null;

    const media = worksheet[`E${i}`]?.v;

    let image = media;
    try {
        const imagePath1 = `${IMAGE_FOLDER}/${media}.jpg`;
        const imagePath2 = `${IMAGE_FOLDER}/${media}.png`;

        if (fs.existsSync(`Products/${imagePath1}`)) {
            image = `${media}.jpg`;
        }
        if (fs.existsSync(`Products/${imagePath2}`)) {
            // const attachment = fs.readFileSync(imagePath2, {encoding: 'base64'});
            image = `${media}.png`;
        }
    } catch (e) {
    }
    product.variants.push({
        option1: option1,
        option2: option2,
        image: image,
    })
    return product;
}

module.exports = updateProducts;
