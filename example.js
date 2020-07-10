const urls = {
    loginPage: 'https://passport.weibo.cn/signin/login?entry=mweibo&res=wel&wm=3349&r=https%3A%2F%2Fm.weibo.cn%2F',
    photo: 'https://weibo.cn/album/albummblog/?rl=11&fuid=' + process.argv[2] + '&page='
};

const fs = require('fs');
const puppeteer = require('puppeteer');
// 把下面改成你自己的用户名密码
const acct = `*******@***.com`;
const pass = `********`;

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
    await page.waitForSelector("#pagelist");
    //相册照片总页数
    var str = await page.evaluate(() => document.querySelector('#pagelist').textContent);
    var count = parseInt(str.substr(str.indexOf('/')+1));
    console.log(count);
    var all = [];
    var reget = 0;
    for(i = 1;i<count;i++) {
        await page.goto(urls.photo+i);i
        try {
            await page.waitForSelector("#pagelist",{timeout : 5000});
        } catch (error) {
            console.log('page' + i + ' error reopen this page');
            i--;
            await page.close();
            page = await browser.newPage();
            reget ++;
            if(reget>=10)
                break;
            continue;
        }
        reget = 0;
        console.log('page ' + i + ' get over')
        var imgs = await page.evaluate(() => Array.from(document.querySelectorAll("img.c"), e => e.src));
        all = all.concat(imgs);
        await page.close();
        page = await browser.newPage();
        await page.setViewport({ width: 800, height: 600 })
    }
    console.log('get all pages start download images');
    all = all.map(x => x.replace('wap180', 'large'));
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
