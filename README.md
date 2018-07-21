![](https://raw.githubusercontent.com/splitline/NTUSTapp/master/banner.png)

# NTUSTapp

> 一個屬於台科人的 App

<p>
    <a href="https://play.google.com/store/apps/details?id=com.splitline.ntustapp">
        <img src="https://rawgit.com/splitline/NTUSTapp/master/play-store.svg" width="300">
    </a>
</p>

## 開發工具
React Native ~~with Expo~~
- 於 v1.0.0 脫離 Expo 框架，直接採用 native code

## Features
### Timetable
- 個人課表
- 課程資訊 (In progress)
- 離線瀏覽

### Score
- 學期成績
- GPA即時試算
- 修課歷史紀錄

### Other
- 搜尋空教室

## Release Notes

### v1.1.0
- (優化) 殺死一些蟲蟲
- (新增) 空教室查詢：點擊各個教室項目可查看整日狀態
- (新增) 歷年成績：列出各學期 GPA 、排名

### v1.0.0
- (優化) 所有網路請求完全不透過 API，直接連至學校系統
- (優化) APP 大小減少 7 成以上
- (優化) Icon 變潮惹（？
- (新增) 學期分數頁面可切換 GPA 4.0 / 4.3 制

### v0.2.0
- (酷炫) 學校試圖阻止學生使用 app 登入
- (新增) 個人課表
- (新增) 搜尋空教室

### v0.1.0beta2
- (修正) 移除不必要/多餘的權限要求。

### v0.1.0beta [初版]
- (新增) 學期成績
- (新增) GPA即時試算（依照公布進度）
- (新增) 修課歷史紀錄

## 開發細節
**[v1.0.0 開始不支援 iOS]**
### 從原始碼直接執行
```
git clone https://github.com/splitline/NTUSTapp.git
cd NTUSTapp
npm install
*確認你的 Android 模擬器已經啟動*
react-native run-android
```
### 原始碼主要架構

#### /Screen/*.js
分別為各個頁面的 js。

- LoginScreen.js             登入畫面
- ScoreScreen.js             當前學期成績
- PastScoreScreen.js         過去成績紀錄
- EmptyClassroomScreen.js    空教室查詢
- TimetableScreen.js         課表


#### /NativeModule/*.js
一些由 Java 撰寫的原生 module。

- VcodeOcr.js    黑魔法。
    - 使用方式：
    ```javascript
    import ocr from './NativeModule/VcodeOcr';
    ocr.recognize(imagePath)
        .then((code)=>{
            console.log("Result:", code);
        })
    ```

#### /utils/*.js
一些小工具（雜項）。
- ButtonSubmit.js 使用於 登入畫面 的登入按鈕
- funcLogin.js 用於登入學生資訊系統的 function
    ```javascript
    login(
        data,           // Account Data Object:
                        // { studentno: "", idcard: "", birthday: "", password: "" }
        successFunc,    // function successFunc($:cheerio selector of stu_menu, __VIEWSTATE of stu_menu:string)
        FailedFunc      // function failFunc(errorMsg:string)
    )
    ```
    
