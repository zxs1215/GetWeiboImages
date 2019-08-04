const urls = {
    loginPage: 'https://passport.weibo.cn/signin/login?entry=mweibo&res=wel&wm=3349&r=https%3A%2F%2Fm.weibo.cn%2F',
    photo: 'http://photo.weibo.com/' + process.argv[2] + '/talbum/index#!/mode/3/page/'
};

const fs = require('fs');
const puppeteer = require('puppeteer');
// 把下面改成你自己的用户名密码
const acct = `*******@***.com`;
const pass = `*********`;

function wait(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
}
async function main() {

    const browser = await puppeteer.launch({
        headless: false
    });

    var page = await browser.newPage();
    await page.setViewport({ width: 800, height: 600 })
    await page.goto(urls.loginPage);

    await page.waitForSelector('#loginName');
    await page.waitForSelector('#loginPassword');
    await page.waitForSelector('#loginAction');
    await wait(1000);

    // 填入账密并提交
    await page.type('#loginName', acct);
    await page.type('#loginPassword', pass);
    await page.click('#loginAction');

    await wait(1000);
    
    await page.goto(urls.photo+1);
    await page.waitForSelector("[class='photoList clearfix'] img");
    await page.waitForSelector('ul .M_txtb');
    //相册照片总数
    var count = await page.evaluate(() => document.querySelector('.m_piclist ul li [title="微博配图"]').parentNode.parentNode.nextSibling.nextSibling.innerText);
    count = count.replace(/[^0-9]/ig, "");
    console.log(count);
    var all = [];
    var reget = 0;
    for(i = 0;i<count;i+=32) {
        var pindex = (i/32+1);
        await page.goto(urls.photo+pindex);
        try {
            await page.waitForSelector("[class='photoList clearfix'] img",{timeout : 5000});
        } catch (error) {
            console.log('page' + pindex + ' error reopen this page');
            i -= 32;
            await page.close();
            page = await browser.newPage();
            reget ++;
            if(reget>=10)
                break;
            continue;
        }
        reget = 0;
        console.log('page ' + pindex + ' get over')
        var imgs = await page.evaluate(() => Array.from(document.querySelectorAll("[class='photoList clearfix'] img"), e => e.src));
        all = all.concat(imgs);
        await page.close();
        page = await browser.newPage();
        await page.setViewport({ width: 800, height: 600 })
    }
    console.log('get all pages start download images');
    all = all.map(x => x.replace('square', 'large'));
    var file = fs.createWriteStream('urls.txt');
    file.on('error', function(err) { /* error handling */ });
    all.forEach(x => file.write(x + '\n'));
    file.end();
    const { exec } = require('child_process');
    exec('DownloadFiles urls.txt '+process.argv[2],async function (error, stdout, stderr){
       
        console.log(stdout);
        console.log('download over');
        await browser.close();
    });


    function getCookieOnLogin() {
        return new Promise((resolve, reject) => {
            page.on('response', async response => {
                if (response.url().startsWith('https://captcha.weibo.com/api/pattern/verify')) {
                    const text = await response.text();
                    if (!text.includes('"100000"')) {
                        return reject(new Error('验证失败'))
                    }
                }
                if (response.url() === 'https://passport.weibo.cn/sso/login') {
                    const cookieStr = response.headers()['set-cookie']
                        .split('\n')
                        .map(c => c.substring(0, c.indexOf(';')))
                        .join(';');
                    resolve(cookieStr);
                }
            });
        });
    }

    try {
        return await getCookieOnLogin();
    } catch (e) {
        throw e;
    } finally {
        await browser.close();
    }

}

~async function () {
    const cookieStr = await main();
    console.log('cookie', cookieStr);
}();