import cheerio from 'cheerio'

export default function isLogin() {
    return fetch("https://stu255.ntust.edu.tw/ntust_stu/stu_menu.aspx", {
        method: 'GET',
        mode: 'cors',
        credentials: "include",
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0',
        },
    })
        .then((resp) => resp.text())
        .then((html) => {
            if (html.includes("操作逾時!!!")) {
                return {
                    status: false
                };
            }
            else {
                let $ = cheerio.load(html);
                return {
                    status: true,
                    __VIEWSTATE: $('input[name="__VIEWSTATE"]').val()
                }
            }
        });

}