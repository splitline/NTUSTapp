import cheerio from 'cheerio';
import fetchBlob from 'rn-fetch-blob';
import ocr from '../NativeModule/VcodeOcr';

export default async function login(
  data,           // Object
  successFunc,    // function successFunc(__VIEWSTATE, $)
  FailedFunc      // function failFunc(errMsg)
) {
  let retryFlag = true, loginSuccess = false, errMsg = "", __VIEWSTATE = "", $;
  
  // try to login until not vcode error
  while (retryFlag) {
    // fetch & OCR Vcode
    let code = await fetchBlob
      .config({
        fileCache: true,
        appendExt: 'png'
      })
      .fetch('GET', 'https://stu255.ntust.edu.tw/ntust_stu/VCode.aspx', {
        mode: 'cors',
        credentials: "include"
      })
      .then((res) => {
        res.session('Vcode');
        console.log('Vcode saved to ', res.path());
        return ocr.recognize(res.path());
      });
    fetchBlob.session('Vcode').dispose();
    console.log('OCR Result: ', code);

    // not a valid OCR result
    if (code.length != 6) continue;

    // compose formdata 
    let formData = new FormData();
    let fdata = {
      '__EVENTTARGET': '',
      '__EVENTARGUMENT': '',
      '__VIEWSTATE': 'dDwtNjU0OTg5MDY5O3Q8O2w8aTwxPjs+O2w8dDw7bDxpPDU5PjtpPDYxPjtpPDYzPjtpPDkzPjtpPDk1PjtpPDk3PjtpPDk5Pjs+O2w8dDxwPHA8bDxUZXh0O0ZvcmVDb2xvcjtfIVNCO0JhY2tDb2xvcjs+O2w86YG46Kqy5pyf6ZaT77yM57O757Wx5Y+v6IO95pyD5Zug5LiK57ea5Lq65pW46YGO5aSa77yM5Y+N5oeJ5pmC6ZaT5pyD6K6K5oWi77yM6KuL5ZCE5L2N5ZCM5a245Y+v5Lul5aSa6Kmm5bm+5qyh5oiW56iN5b6M5YaN55m75YWl57O757Wx77yM6YCy6KGM6YG46Kqy44CCOzI8V2hpdGU+O2k8MTI+OzI8UmVkPjs+Pjs+Ozs+O3Q8cDxwPGw8VGV4dDtGb3JlQ29sb3I7XyFTQjtCYWNrQ29sb3I7PjtsPOebruWJjemBuOiqsuS6uuaVuOi2hemBjuWKoOmAgOmBuOS6uuaVuOmZkOWItuWOn+WboOKGkuWOn+WboDE657O75LiK5oiW6Kqy5YuZ57WE6Kit5a6a77yb5Y6f5ZugMjroiIrnlJ/mlrzmraPlvI/pgbjoqrLkurrmlbjkuI3oqK3pmZDmmYLpgbjkuIrjgII7MjxXaGl0ZT47aTwxMj47MjxCbHVlPjs+Pjs+Ozs+O3Q8cDxwPGw8VGV4dDs+O2w8W+mBuOiqsuS5i+WCmeiou+iLpeaciemZpO+8uOmkmO+8ueeahOiqquaYju+8jOS/guaMh+WtuOiZn+W+jOWFqeeivOmZpO+8uOmkmO+8ueOAgl07Pj47Pjs7Pjt0PHA8cDxsPFRleHQ7PjtsPOOAgOeAj+imveWZqOOAgO+8mk5ldHNjYXBl44CANS4wOz4+Oz47Oz47dDxwPHA8bDxUZXh0Oz47bDzjgIBJUOOAgOOAgOOAgO+8mjIyMy4xMzkuOS4zMygyMjMtMTM5LTktMzMuZW1vbWUtaXAuaGluZXQubmV0KTs+Pjs+Ozs+O3Q8cDxwPGw8VGV4dDs+O2w844CA55m75YWl5pmC6ZaT77yaMjAxOC83LzUg5LiK5Y2IIDEwOjM1OjI3Oz4+Oz47Oz47dDxwPHA8bDxUZXh0Oz47bDzjgIDmk43kvZzlubPlj7DvvJpVbmtub3duOz4+Oz47Oz47Pj47Pj47PiVqjpj6K0cnTyRrcYdypr4CG380',
      '__VIEWSTATEGENERATOR': '7D63B901',
      'studentno': data['studentno'],
      'idcard': data['idcard'].slice(-4),
      'DropMonth': data['birthday'].slice(2, 4),
      'DropDay': data['birthday'].slice(4, 6),
      'password': data['password'],
      'code_box': code,
      'Button1': "登入系統"
    }
    Object.keys(fdata).forEach((key) => {
      formData.append(key, fdata[key]);
    })

    // Try to login
    await fetch('https://stu255.ntust.edu.tw/ntust_stu/stu.aspx', {
      method: 'POST',
      mode: 'cors',
      credentials: "include",
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0',
      },
      body: formData
    })
      .then((resp) => resp.text())
      .then((html) => {
        $ = cheerio.load(html);
        errMsg = $('#disp_error').text();
        if (!$('#disp_error').html()) { // Login Success
          retryFlag = false;
          loginSuccess = true;
        } else if (errMsg.includes('驗證碼')) { // Vcode Error
          console.log("Vcode Error", errMsg);
          retryFlag = true;
          loginSuccess = true;
          __VIEWSTATE = $('input[name="__VIEWSTATE"]').val();
        } else {  // User error
          console.log("normal Error", errMsg);
          retryFlag = false;
          loginSuccess = false;
        }
      });
  }

  if (loginSuccess)
    return successFunc(__VIEWSTATE, $);
  else
    FailedFunc(errMsg);
}