import React, { Component } from 'react';
import { View, Text, Slider, ScrollView, AsyncStorage } from 'react-native';
import { Card, Button, ListItem } from 'react-native-elements';
import { TextField } from 'react-native-material-textfield';
import Snackbar from 'react-native-snackbar';
import cheerio from 'cheerio'

export default class CourseTrackerScreen extends Component {

    constructor(props) {
        super(props);

        let now = new Date();
        // ~ 5
        if (now.getMonth() <= 4) this.semester = `${now.getFullYear() - 1912}2`;
        // ~ 11
        else if (now.getMonth() <= 10) this.semester = `${now.getFullYear() - 1911}1`;
        // ~ 12
        else this.semester = `${now.getFullYear() - 1911}2`;

        this.state = {
            trackingCourses: {},
            courseInput: "",
            selectType: 0,
            addLoading: false,
            lookupLoading: false,
            edit: false
        };
    }

    componentWillMount = () => {
        AsyncStorage
            .getItem('@NTUSTapp:trackingCourses')
            .then(trackingCourses => {
                if (trackingCourses != null)
                    this.setState({ trackingCourses: JSON.parse(trackingCourses) })
            })

    }

    fetchCurrentPeople = () => {
        this.setState({ lookupLoading: true });
        fetch(('http://140.118.31.215/querycourse/ChCourseQuery/QueryCondition.aspx'))
            .then(r => r.text())
            .then(r => {
                let $ = cheerio.load(r);
                let formData = new FormData();
                let fdata = {
                    "__VIEWSTATE": $('input[name="__VIEWSTATE"]').val(),
                    "__VIEWSTATEGENERATOR": $('input[name="__VIEWSTATEGENERATOR"]').val(),
                    "__EVENTVALIDATION": $('input[name="__EVENTVALIDATION"]').val(),
                    "semester_list": $('#semester_list').val(),
                    "__EVENTARGUMENT": "",
                    "__LASTFOCUS": "",
                    "__EVENTTARGET": "",
                    "Acb0101": "on",
                    "BCH0101": "on",
                    "Ctb0101": "AAA",
                    "Ctb0201": "",
                    "Ctb0301": "",
                    "QuerySend": "送出查詢"
                }
                Object.keys(fdata).forEach((key) => {
                    formData.append(key, fdata[key]);
                })
                return fetch(('http://140.118.31.215/querycourse/ChCourseQuery/QueryCondition.aspx'), {
                    method: 'POST', mode: 'cors',
                    credentials: "include", body: formData
                })
            })
            .then(async () => {
                let fetchArr = Object.keys(this.state.trackingCourses).map(
                    code => fetch(`http://140.118.31.215/querycourse/ChCourseQuery/DetailCourse.aspx?chooseCourseNo=${code}`, { mode: 'cors', credentials: "include" }).then((r) => r.text())
                );
                var data = await Promise.all(fetchArr);
                data.forEach((html, i) => {
                    let $ = cheerio.load(html, { decodeEntities: false });
                    // console.log('[HTML]', $('#dlHead_ctl01_DetailHeader').html())
                    let peopleData = {
                        school: $('#dlHead_ctl01_DetailHeader > tr:nth-child(12) > td:nth-child(2)').text().trim(),
                        triNTU: $('#dlHead_ctl01_DetailHeader > tr:nth-child(13) > td:nth-child(2)').text().trim(),
                        total: $('#dlHead_ctl01_DetailHeader > tr:nth-child(14) > td:nth-child(2)').text().trim(),
                        regularSelectMax: $('#dlHead_ctl01_DetailHeader > tr:nth-child(15) > td:nth-child(2)').text().trim(),
                        additionalSelectMax: $('#dlHead_ctl01_DetailHeader > tr:nth-child(16) > td:nth-child(2)').text().trim(),
                    }

                    let { trackingCourses } = this.state;
                    trackingCourses[Object.keys(this.state.trackingCourses)[i]].data = peopleData;
                    this.setState({ trackingCourses });
                    console.log(Object.keys(this.state.trackingCourses)[i], peopleData)
                });

                this.setState({ lookupLoading: false });
            })
    }

    addCourse = () => {
        this.setState({ courseInput: '' });
        let { trackingCourses, courseInput } = this.state;
        courseInput = courseInput.trim();
        if (courseInput in trackingCourses) {
            Snackbar.show({ 'title': '它已經在追蹤列表裡了' })
            return;
        }
        this.setState({ addLoading: true });
        fetch(`http://info.ntust.edu.tw/faith/edua/app/qry_linkoutline.aspx?semester=${this.semester}&courseno=${courseInput}`)
            .then(r => r.text())
            .then(html => {
                this.setState({ addLoading: false });
                if (!html.includes('無此課程授課資料')) {
                    trackingCourses[courseInput] = {
                        name: '',
                        data: {}
                    }
                    $ = cheerio.load(html);
                    trackingCourses[courseInput].name = $("#lbl_coursename").text() + "・" + $("#lbl_teacher").text()
                    trackingCourses[courseInput].data = {
                        school: "?", // 本校選課人數
                        triNTU: "?", // 聯盟兩校選課人數
                        total: "?",  // 選課總人數
                        regularSelectMax: "?",       // 本校正式選課人數上限
                        additionalSelectMax: "?",    // 本校加退選課人數上限
                    }
                    this.setState({ trackingCourses })
                    AsyncStorage.setItem(
                        '@NTUSTapp:trackingCourses',
                        JSON.stringify(trackingCourses)
                    );
                } else {
                    Snackbar.show({
                        title: "課程代碼可能錯了",
                        duration: Snackbar.LENGTH_LONG,
                        action: {
                            title: '好QQ', color: 'green',
                        },
                    })
                }
            });
    }

    render() {
        return (
            <ScrollView>
                <Card containerStyle={{ elevation: 3 }} title="選課人數追蹤">
                    <TextField
                        label="輸入要添加的課程代碼"
                        value={this.state.courseInput}
                        onChangeText={(courseInput) => this.setState({ courseInput })}
                    />
                    <Button
                        title={"新增課程"}
                        disabled={this.state.courseInput.trim().length != 9}
                        buttonStyle={{ height: 40 }}
                        onPress={this.addCourse}
                        loading={this.state.addLoading}
                    />
                    <Button
                        title="查詢即時選課人數"
                        loading={this.state.lookupLoading}
                        buttonStyle={{ height: 40, marginVertical: 10 }}
                        onPress={this.fetchCurrentPeople}
                    />

                    <View style={{
                        flex: 1, alignItems: "center", flexDirection: 'row', justifyContent: 'center',
                    }}>
                        <Text>正式選課</Text>
                        <Slider
                            value={this.state.selectType}
                            onValueChange={(value) => this.setState({ selectType: value })}
                            style={{ width: 75 }}
                            step={1} />
                        <Text>加退選</Text>
                    </View>
                </Card>

                <View marginVertical={10}>
                    <Button
                        title={this.state.edit ? "完成" : "編輯"}
                        icon={{ name: this.state.edit ? 'done' : 'edit', size: 16 }}
                        onPress={() => this.setState({ edit: !this.state.edit })}
                        buttonStyle={{ alignSelf: 'flex-end', width: 'auto', margin: 8 }}
                        titleStyle={{ color: '#333' }}
                        clear
                    />
                    {
                        Object.keys(this.state.trackingCourses)
                            .map((course) =>
                                <ListItem
                                    key={course}
                                    title={course}
                                    subtitle={this.state.trackingCourses[course].name}
                                    rightElement={
                                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                                            <Text>
                                                {this.state.trackingCourses[course].data.school} / {this.state.trackingCourses[course].data[this.state.selectType ? 'additionalSelectMax' : 'regularSelectMax']}
                                            </Text>
                                            {this.state.edit &&
                                                <Button
                                                    title="刪除"
                                                    buttonStyle={{ marginLeft: 10, backgroundColor: "#FF5555", }}
                                                    onPress={() => {
                                                        let trackingCourses = this.state.trackingCourses;
                                                        delete trackingCourses[course];
                                                        this.setState({ trackingCourses });
                                                        AsyncStorage.setItem(
                                                            '@NTUSTapp:trackingCourses',
                                                            JSON.stringify(trackingCourses)
                                                        );
                                                    }}
                                                />}
                                        </View>
                                    }
                                />
                            )
                    }
                </View>
            </ScrollView>
        );
    }
}