var axios = require('axios');
require('dotenv').config();
// If the page uses GEMPAGES, the theme MUST be imported first before the page can be imported.
// Otherwise, the page template won't exist at the time of import. 

const importPages = async (sourceURL, destinationURL, authSource, authDest) => {
    console.log('====DUPLICATING PAGES====');
    try {
        const pagesSource = await getPages(sourceURL, authSource);
        const pagesDest = await getPages(destinationURL, authDest);

        const pageData = [pagesSource, pagesDest];
        pageData ? console.log('Page Data Fetched') : console.log('Error occured, no pages!');

        const pageTitles = await checkPostPages(destinationURL, authDest, pageData);
        return typeof pageTitles == 'number' ? 'Successfully imported ' + pageTitles + ' pages' : 'Error occured: ' + pageTitles;
    } catch (err) {
        console.log(err)
    }
}
// NOTE: Once the return is called, the loop ends. You CAN'T use return in a FOR LOOP!!
const checkPostPages = async (storeURL, auth, pageData) => {
    pagesSource = pageData[0].pages;
    pagesDest = pageData[1].pages;

    pageTitlesDest = [];
    if (pagesSource == '') {
        return 'No pages to import';
    } else {
        for (i = 0; i < pagesSource.length; i++) {
            if (pagesDest == '') {
                console.log('===Posting '+ [i+1] + ' of ' + pagesSource.length +' Pages===');
                const pageTitle = await postPages(storeURL, auth, pagesSource);
                pageTitlesDest.push(pageTitle);
            } else {
                //Could be extended to continue from the last imported page, saving time.
                return 'Destination store must be empty!'
            }
        }
    }
    return pageTitlesDest != '' ? pageTitlesDest.length : 'Pages already imported'
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const postPages = async (storeURL, auth, pagesSource) => {
    var payload = JSON.stringify({
        "page": pagesSource[i]
    });
    var config = {
        method: 'post',
        url: `https://${storeURL}.myshopify.com/admin/api/2021-01/pages.json`,
        headers: {
            'Authorization': auth,
            'Content-Type': 'application/json',
        },
        data: payload
    }

    const data = await axios(config)
        .then(response => response.data)
        .catch(errors => console.log(JSON.stringify(errors)));
    await sleep(500);
    return data ? data : 'An error occured';
}
const getPages = async (storeURL, auth) => {
    console.log('===Fetching Pages===');
    var config = {
        method: 'get',
        url: `https://${storeURL}.myshopify.com/admin/api/2021-01/pages.json`,
        headers: {
            'Authorization': auth,
            'Content-Type': 'application/json',
        },
    }
    const data = await axios(config)
        .then(response => response.data)
        .catch(errors => console.log(JSON.stringify(errors)));
    return data;
}
module.exports = importPages;