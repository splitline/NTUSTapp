import React from 'react';
import { Button, View, StyleSheet, RefreshControl, ScrollView, AsyncStorage, ActivityIndicator } from 'react-native';
import { Text, Card, ListItem } from 'react-native-elements';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import Snackbar from 'react-native-snackbar';
import cheerio from 'cheerio';
import Login from '../utils/funcLogin';
import isLogin from '../utils/checkLogin'

export default class TimetableScreen extends React.Component {

    constructor() {
        super();
        this.state = {
            login: null,
            stuAccountData: {},
            stuTimetable: {},
            refreshing: false,
        };
    }

    DAYS = {
        "M": 1,
        "T": 2,
        "W": 3,
        "R": 4,
        "F": 5,
        "S": 6,
        "U": 7,
    }

    TIMES = {
        '0': '07:10-08:00',
        '1': '08:10-09:00',
        '2': '09:10-10:00',
        '3': '10:20-11:10',
        '4': '11:20-12:10',
        '5': '12:20-13:10',
        '6': '13:20-14:10',
        '7': '14:20-15:10',
        '8': '15:30-16:20',
        '9': '16:30-17:20',
        '10': '17:30-18:20',
        'A': '18:25-19:15',
        'B': '19:20-20:10',
        'C': '20:10-21:05',
        'D': '21:10-22:00'
    }

    readAccountData() {
        AsyncStorage.multiGet(['@NTUSTapp:StuAccountData', '@NTUSTapp:stuTimetable']).then(response => {
            if (response[0][1] != null && response[0][1] != '') {
                this.setState({ login: true, stuAccountData: JSON.parse(response[0][1]) });
                if (response[1][1] != null) {
                    this.setState({ stuTimetable: JSON.parse(response[1][1]) });
                }
            } else {
                this.setState({ login: false, stuAccountData: {} });
            }
        });
    }

    componentWillMount() {
        this.readAccountData();
    }

    async updateTimetable() {
        this.setState({ refreshing: true });
        const logined = await isLogin();
        let fetchTimetable;
        if (logined.status) {
            let formData = new FormData();
            let fdata = {
                __EVENTTARGET: '',
                __EVENTARGUMENT: '',
                __VIEWSTATE: logined.__VIEWSTATE,
                __VIEWSTATEGENERATOR: '772D720D',
                Button19: "登入系統"
            }
            Object.keys(fdata).forEach((key) => {
                formData.append(key, fdata[key]);
            })
            fetchTimetable = fetch('https://stu255.ntust.edu.tw/ntust_stu/stu_menu.aspx', {
                method: 'POST',
                mode: 'cors',
                credentials: "include",
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0',
                },
                body: formData
            });
        }
        else {
            Snackbar.show({
                title: '登入逾時了，重新登入個',
                duration: Snackbar.LENGTH_LONG,
            });
            fetchTimetable = Login(
                this.state.stuAccountData,
                (__VIEWSTATE) => {

                    let formData = new FormData();
                    let fdata = {
                        __EVENTTARGET: '',
                        __EVENTARGUMENT: '',
                        __VIEWSTATE: __VIEWSTATE,
                        __VIEWSTATEGENERATOR: '772D720D',
                        Button19: "登入系統"
                    }
                    Object.keys(fdata).forEach((key) => {
                        formData.append(key, fdata[key]);
                    })
                    return fetch('https://stu255.ntust.edu.tw/ntust_stu/stu_menu.aspx', {
                        method: 'POST',
                        mode: 'cors',
                        credentials: "include",
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0',
                        },
                        body: formData
                    });
                },
                // Failed
            )
        }
        fetchTimetable
            .then((result) => result.text())
            .then(async (html) => {
                let $ = cheerio.load(html);
                let stuTimetable = {}
                let fetchArr = [];

                $("#Table7").find('tr').each((i, elem) => {
                    let td = $(elem).find('td')[2].firstChild.firstChild;
                    let courseLink = $(td).attr('href');
                    // fetch outline link
                    fetchArr.push(fetch(courseLink).then((r) => r.text()));
                });

                var data = await Promise.all(fetchArr);

                data.forEach((html) => {
                    let $ = cheerio.load(html);
                    let periods = [];
                    let classTime = $("#lbl_timenode").text();

                    classTime.split("   ").forEach((val) => {

                        let regex = new RegExp(/(\w\w)\((\S+)?\)/);
                        let result = regex.exec(val);

                        if (result)
                            periods.push({
                                day_code: result[1],
                                location: result[2],
                                day: this.DAYS[result[1][0]],
                                time: result[1] ? this.TIMES[result[1].slice(1)] : null
                            });

                    })

                    stuTimetable[$("#lbl_courseno").text()] = {
                        "course_id": $("#lbl_courseno").text(),
                        "name": $("#lbl_coursename").text(),
                        "lecturer": $("#lbl_teacher").text(),
                        "classroom": $("#lbl_timenode").text(),
                        "periods": periods
                    };
                });


                this.setState({ stuTimetable: stuTimetable, refreshing: false });
                AsyncStorage.setItem(
                    '@NTUSTapp:stuTimetable',
                    JSON.stringify(stuTimetable)
                );

            });
    }

    render() {
        const classTime = [].concat(...(Object.keys(this.state.stuTimetable).map(
            (l, i) => {
                return this.state.stuTimetable[l]['periods'].map(
                    (p) => {
                        p['course_id'] = this.state.stuTimetable[l]['course_id'];
                        p['name'] = this.state.stuTimetable[l]['name'];
                        p['lecturer'] = this.state.stuTimetable[l]['lecturer'];
                        return p;
                    }
                );
            }))
        ).sort((x, y) => {
            let a = x['day_code'], b = y['day_code'];
            const dayCode = ["M", "T", "W", "R", "F", "S", "U"];
            const timeCode = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'A', 'B', 'C', 'D'];
            return (dayCode.indexOf(a[0]) * 10 + timeCode.indexOf(a[1])) - (dayCode.indexOf(b[0]) * 10 + timeCode.indexOf(b[1]));
        });

        const week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        let renderContext;
        if (this.state.login === true)
            renderContext = (
                <ScrollableTabView
                    renderTabBar={() => <DefaultTabBar backgroundColor='rgb(255, 255, 255)' />}
                    initialPage={(new Date).getDay() == 0 ? 6 : (new Date).getDay() - 1}
                >
                    {
                        [1, 2, 3, 4, 5, 6, 7].map((l, i) =>
                            (
                                <ScrollView
                                    tabLabel={week[l - 1]}
                                    key={i}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={this.state.refreshing}
                                            onRefresh={() => this.updateTimetable()}
                                        />}>
                                    {
                                        classTime.filter((c) => c['day'] === l).length === 0 ?
                                            (
                                                <Card>
                                                    {classTime.length == 0 ?
                                                        <Text>往下拉一下，讓你的課表載入進來</Text>
                                                        : <Text>今天沒課 _(:з」∠)_</Text>
                                                    }
                                                </Card>
                                            ) :
                                            (
                                                classTime
                                                    .filter((c) => c['day'] === l)
                                                    .map((l, i) => (
                                                        <ListItem
                                                            key={i}
                                                            title={l.name}
                                                            subtitle={(l.location != null ? l.location : "未定") + "・" + l.time + "・" + l.lecturer}
                                                        />
                                                    ))
                                            )
                                    }

                                </ScrollView>
                            )
                        )
                    }
                </ScrollableTabView>
            );
        else if (this.state.login === false)
            renderContext = (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text>還沒登入 Q_Q</Text>
                    <Button
                        onPress={() => this.props.navigation.navigate('Login')}
                        title="登入"
                    />
                </View>
            )
        else
            renderContext = (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ActivityIndicator size="large" />
                </View>
            )

        return renderContext;
    }



}
const styles = StyleSheet.create({
    icon: {
        width: 300,
        height: 300,
        alignSelf: 'center',
    },
});