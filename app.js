const express = require('express');

const WPAPI = require('wpapi');

let wp = new WPAPI({endpoint: 'https://lignogroup.hu/wp-json'});
let apiPromise = WPAPI.discover('https://lignogroup.hu');
let app = express();
const port = process.env.PORT || 3002;


app.get('/', async (req, res) => {
    apiPromise.then((site) => {
        site.ceg().perPage(100).then(async (companies) => {
            let companiesData = [];

            companies.forEach((company) => {
                let companyData = {
                    title: company.title.rendered,
                    link: company.link,
                    categories: company.categories,
                    materials: company.anyaghasznalat,
                    activities: company.tevekenyseg,
                    content: company.content.rendered,
                    logo: company.featured_media
                }

                companiesData.push(companyData);

            });

            await site.categories().perPage(50).then((categories) => {
                companiesData.forEach((company) => {

                    let companyCategoriesArray = [];

                    company.categories.forEach((companyCategory) => {
                        let found = categories.find(element => element.id === companyCategory);

                        if (found) companyCategoriesArray.push(found.name);
                    });

                    company.categories = companyCategoriesArray;

                });

            });


            await site.anyaghasznalat().perPage(50).then((materials) => {
                companiesData.forEach((company) => {

                    let companyMaterialsArray = [];

                    company.materials.forEach((companyMaterial) => {
                        let found = materials.find(element => element.id === companyMaterial);

                        if (found) companyMaterialsArray.push(found.name);
                    });

                    company.materials = companyMaterialsArray;
                });
            }).catch((err) => {
                console.log(err);
            });

            await site.tevekenyseg().perPage(50).then((activities) => {
                companiesData.forEach((company) => {

                    let companyActivitiesArray = [];

                    company.activities.forEach((companyActivities) => {
                        let found = activities.find(element => element.id === companyActivities);
                        //console.log(found);
                        if (found) companyActivitiesArray.push(found.name);
                    });

                    company.activities = companyActivitiesArray;
                });
            }).catch((err) => {
                console.log(err);
            });


            /*await wp.media().id(companiesData[0].logo).then((data) => {
                console.log(data.source_url);
                companiesData[0].logo = data.source_url
            }).catch((err) => {
                console.log(err);
            });*/

            for await (let company of companiesData) {
                 await wp.media().id(company.logo).then( async (data) => {
                    console.log(data.source_url);
                    company.logo = data.source_url
                }).catch((err) => {
                    console.log(err);
                });
            }

            /*companiesData.forEach((company) => {
                console.log(company.logo);
                wp.media().id(company.logo).then((data) => {
                    company.logo = data.source_url
                }).catch((err) => {
                    console.log(err);
                });
            })*/


            return res.send(companiesData);

            //console.log(companies);


        });


    });
});


app.listen(port, () => {
    console.log(`Listening on ${port}`);
});