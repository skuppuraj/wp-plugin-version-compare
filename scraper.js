const axios = require('axios');
const cheerio = require('cheerio');
const shell = require('shelljs');

const args = require('minimist')(process.argv.slice(2)); 

if (!args.url) {
    console.log("Invalid url");
    process.exit();
}


// Function to scrape the website
async function scrapeWebsite(url, pluginSlug, cookie) {
  try {
    console.log(url);
    console.log(pluginSlug);
    console.log(cookie);
    
    // Fetch the website's HTML
    const { data } = await axios.get(url, {
      "headers": {
        "cookie": `aws-waf-token=${cookie}`,
      }});
    // Load the HTML into cheerio
    const $ = cheerio.load(data);

    // Example: Scrape all <h1> tags
    let title = $('.container h1').text();
    console.log(title);
    title = title.replace('–', '-');
    let fixedVersion = '';
    if ($('.patched-yes').length > 0) {
        fixedVersion = $('th:contains("Patched Version")').next().find('ul li').text()
    }
    let affectedVersion = '';
    affectedVersion = $('th:contains("Affected Version")').next().find('ul li').text();

    affectedVersion = affectedVersion.replace('>', '')
    affectedVersion = affectedVersion.replace('<=', '')
    affectedVersion = affectedVersion.replace('=', '')
    affectedVersion = affectedVersion.trim()

    console.log(affectedVersion);
    
    
    let publishedDate = $('th:contains("Publicly Published")').next().text();
    let date = new Date(publishedDate);

    let formattedDate = date.getFullYear() + '-' + 
                        String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(date.getDate()).padStart(2, '0');
    
    let score = $('.cvss-score-chart span').text();
    let description = $('h3:contains("Description")').next().text();
    description = description.replace('–', '-');
    console.log(score);
    if (!pluginSlug) {
      pluginSlug = ''
    }
    if (affectedVersion && pluginSlug == '') {
      let pluginURL = new URL(url);
      if (pluginURL.pathname) {
       
        parts = pluginURL.pathname.split('/');
        slug = parts[4];
        if (slug) {
          let args = []
          args[0] = slug;
          args[1] = affectedVersion;
          console.log(slug);
          
          let result = shell.exec(`node slug.js ${slug} ${affectedVersion}`, { silent: true });
          if (result.code === 0 && !result.stderr.includes('Error')) {
            pluginSlug = result.stdout.trim();
            console.log('found slug '+pluginSlug);
            if (!pluginSlug) {
              console.log("Not able to find slug -1");
              process.exit();
            }
          } else {
            console.error('Error executing command:', result.stderr);
            if (fixedVersion !='') {
                let result = shell.exec(`node slug.js ${slug} ${fixedVersion}`, { silent: true });
                if (result.code === 0 && !result.stderr.includes('Error')) {
                  pluginSlug = result.stdout.trim();
                  console.log('found slug '+pluginSlug);
                  if (!pluginSlug) {
                    console.log("Not able to find slug 0");
                    process.exit();
                  }
                } else {
                  console.error('Error executing command:', result.stderr);
                  console.log("Not able to find slug 1");
                  process.exit();
                }
            }else if(slug){
                let result = shell.exec(`node slug.js ${slug}`, { silent: true });
                if (result.code === 0 && !result.stderr.includes('Error')) {
                  pluginSlug = result.stdout.trim();
                  console.log('found slug '+pluginSlug);
                  if (!pluginSlug) {
                    console.log("Not able to find slug 2");
                    process.exit();
                  }
                } else {
                  console.error('Error executing command:', result.stderr);
                  console.log("Not able to find slug 3");
                  process.exit();
                }
            }else{
              console.log("Not able to find slug 4");
              process.exit();
            }
          }
          
        }
        
      }
    }


    if (title && affectedVersion && formattedDate && score) {
      const formData = new FormData();
      formData.append('rule_id', '');
      formData.append('desc', title);
      formData.append('type', 'plugin');
      formData.append('slug', pluginSlug);
      formData.append('version', affectedVersion);
      formData.append('fixed_in', fixedVersion);
      formData.append('published_at', formattedDate);
      formData.append('rating', score);
      formData.append('rule_version', '1.0.0');
      formData.append('hook', 'init');
      formData.append('rule_condition', 'post0');
      formData.append('block', false);
      formData.append('log', false);
      formData.append('is_logged_in', false);
      formData.append('status', 'draft');

      
      formData.append('rule', '');
      formData.append('rule_decoded', '');
      formData.append('post', '');
      formData.append('get', '');
      formData.append('header', '');
      formData.append('file', '');
      formData.append('raw', '');
      formData.append('url', '');
      formData.append('cookie', '');
      formData.append('shortcode_rules', '');
      formData.append('allowed_role', '');
      formData.append('allowed_cap', '');
      formData.append('do_sanitize', '');
      formData.append('do_full_sanitize', '');
      formData.append('do_full_sanitize_decoded', '');
      formData.append('wp_post_restrictions', '');
      formData.append('wp_user_restrictions', '');
      formData.append('wp_logout', '');
      formData.append('deactivate_plugin', '');
      formData.append('remove_action', '');
      formData.append('remove_filter', '');
      formData.append('notify_user', '');
      formData.append('run', '');
      formData.append('notes', url);
      formData.append('tests', '');
      formData.append('tests_decode', '');
      formData.append('expl', description);
      // formData.append('nonce_check[nonce]', '');
      // formData.append('nonce_check[key]', '');
      // formData.append('nonce_check[is_dfwp]', '');
      
      const dataObject = formDataToObject(formData);
      dataObject['nonce_check'] = {
        nonce:'',
        key:'',
        is_dfwp:'',
      }
      console.log(dataObject);
      axios.post('https://cron.defendwp.org/add-new-rule', dataObject)
      .then(response => {
        console.log('Success:', response.data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
      
      // formData[rule_id]: 
      // desc: test
      // type: plugin
      // slug: test/test.php
      // version: 3.6.0
      // fixed_in: 3.6.1
      // rating: 8.0
      // published_at: 2024-10-24
      // rule: 
      // rule_decoded: 
      // rule_version: 1.0.0
      // hook: init
      // post: 
      // get: 
      // header: 
      // file: 
      // raw: 
      // url: 
      // cookie: 
      // rule_condition: post0
      // shortcode_rules: 
      // allowed_role: 
      // allowed_cap: 
      // do_sanitize: 
      // do_full_sanitize: 
      // do_full_sanitize_decoded: 
      // wp_post_restrictions: 
      // wp_user_restrictions: 
      // wp_logout: 
      // deactivate_plugin: 
      // remove_action: 
      // remove_filter: 
      // block: false
      // log: false
      // is_logged_in: false
      // nonce_check[nonce]: 
      // nonce_check[key]: 
      // nonce_check[is_dfwp]: 
      // notify_user: 
      // run: 
      // notes: 
      // tests: 
      // tests_decode
    }
    

  } catch (error) {
    console.error('Error occurred while scraping:', error.message);
  }
}

function formDataToObject(formData) {
  const obj = {};
  formData.forEach((value, key) => {
      obj[key] = value;
  });
  return obj;
}

// Run the scraper
scrapeWebsite(args.url, args.slug, args.cookie);
