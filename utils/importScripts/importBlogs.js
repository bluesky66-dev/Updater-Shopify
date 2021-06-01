var axios = require('axios');
require('dotenv').config();

const importBlogs = async (sourceURL,destinationURL,authSource,authDest) => {
    console.log('====DUPLICATING BLOGS====');
    try {
        const blogsSource = await getBlogs(sourceURL, authSource);
        const blogsDest = await getBlogs(destinationURL, authDest);

        const blogData = [blogsSource, blogsDest];
        blogData ? console.log('Blog Data Fetched'): console.log('Error occured, no blogs!');

        const blogIdsDest = await checkPostBlogs(destinationURL, authDest, blogData);
        blogIdsDest ? console.log('Blogs Successfully Posted'): console.log('Error occured, blogs not posted!');
        const articleData = await getArticles(sourceURL,authSource,blogData);

        const importedArticlesCount = await checkArticles(destinationURL,authDest,articleData,blogIdsDest)
        return typeof importedArticlesCount == 'number' ? 'Successfully imported '+ importedArticlesCount +  ' articles': 'Error occured: ' + importedArticlesCount;
    } catch (err) {
        console.log(err)
    }
}
const checkArticles = async (storeURL, auth, articleData, blogIdsDest) => {
//When POSTING articles, make sure the blog_id is set to the correct id, or not it will respond with status 404
    articlesDest = [];
    for (i=0;i<articleData.length;i++) {
        console.log('Importing articles from blog ' + [i+1] + ' of ' + articleData.length)  
            if(articleData[i].articles == ''){
                console.log('No articles to import');
                continue
            }else{
                for(const article of articleData[i].articles){
                    try{
                        article.blog_id = blogIdsDest[i]; // Sets blog_id to Destination Blog IDs
                        var articlePayload = JSON.stringify({
                            "article": article
                        });
                        var config = {
                            method: 'post',
                            url: `https://${storeURL}.myshopify.com/admin/api/2021-01/blogs/${blogIdsDest[i]}/articles.json`,
                            headers: {
                                'Authorization': auth,
                                'Content-Type': 'application/json',
                            },
                            data: articlePayload
                        }
                        const data = await axios(config)
                            .then(response => response.data.article.title)
                            .catch(errors => console.log(JSON.stringify(errors)));
                        sleep(1000); 
                        articlesDest.push(data);
                    }
                    catch{
                        console.log('For loop failed')
                        continue
                    }
                    
                }
            }
    }
    return articlesDest != '' ? articlesDest.length: 'Something went wrong';
}
const getArticles = async (storeURL, auth, blogData) => {
    console.log('===Fetching Articles===');
    blogIdsSource = [];
    blogsSource = blogData[0].blogs;
    articles = [];

    for (const id of blogsSource) {
        blogIdsSource.push(id.id);
    } 
    for (const id of blogIdsSource) {
        var config = {
            method: 'get',
            url: `https://${storeURL}.myshopify.com/admin/api/2021-01/blogs/${id}/articles.json`,
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json',
            },
        }

        const data = await axios(config)
            .then(response => response.data)
            .catch(errors => console.log(JSON.stringify(errors)));
        articles.push(data);
    }
    return articles;
}
// NOTE: Once the return is called, the loop ends. You CAN'T use return in a FOR LOOP!!
const checkPostBlogs = async (storeURL, auth, blogData) => {
    blogsSource = blogData[0].blogs;
    blogsDest = blogData[1].blogs;

    blogTitlesOld = [];
    blogIdsDest = [];
    for (i=0;i<blogsSource.length;i++) {
            if(blogsSource == ''){
                console.log('No blogs to import');
            }else{
                if(blogsDest == ''){
                    const blogIds = await postBlog(storeURL,auth,blogsSource);
                    blogIdsDest.push(blogIds);
                }else{
                    if (blogsSource[i].title != blogsDest[i].title) {
                        const blogIds = await postBlog(storeURL,auth,blogsSource);
                        blogIdsDest.push(blogIds);
                     } else {
                        console.log('Blog already exists!');
                        continue
                     }
                }
            }
            
    }
    return blogIdsDest != '' ? blogIdsDest: 'Blogs already imported'
    

}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const postBlog = async (storeURL,auth,blogsSource) => {
    console.log('===Posting Blogs===');
    var blogPayload = JSON.stringify({
        "blog": blogsSource[i]
    });
    var config = {
        method: 'post',
        url: `https://${storeURL}.myshopify.com/admin/api/2021-01/blogs.json`,
        headers: {
            'Authorization': auth,
            'Content-Type': 'application/json',
        },
        data: blogPayload
    }

    const data = await axios(config)
        .then(response => response.data)
        .catch(errors => console.log(JSON.stringify(errors)));
    sleep(1000);        
    return data.blog.id ? data.blog.id: 'An error occured';
}
const getBlogIds = async (storeURL, auth, blogData) => {
    var blogIdsSource = [];
    var blogIdsDest = [];
    blogsSource = blogData[0].blogs
    blogsDest = blogData[1].blogs
    for (const source of blogsSource) {
        blogIdsSource.push(source.id)
    }
    for (const dest of blogsDest) {
        blogIdsDest.push(dest.id)
    }
    return [blogIdsSource, blogIdsDest];
}
const getBlogs = async (storeURL, auth) => {
    console.log('===Fetching Blogs===');
    var config = {
        method: 'get',
        url: `https://${storeURL}.myshopify.com/admin/api/2021-01/blogs.json`,
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
module.exports = importBlogs;