import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, ListItem, Button, Icon } from 'react-native-elements';
import Modal from "react-native-modal";
import { Dropdown } from 'react-native-material-dropdown';
import cheerio from 'cheerio';

export default class EmptyClassroomView extends React.Component {

    constructor() {
        super();
        this.state = {
            building: "",
            classrooms: {},
            nthClass: -1,
            loading: false,

            modalShow: false,
            lookingUpClassroom: ""
        };
    }

    period = [];

    _toggleModal(classroom) {
        this.setState({ modalShow: !this.state.modalShow, lookingUpClassroom: (classroom ? classroom : this.state.lookingUpClassroom) });
    }

    timecodeToTime(str) {
        return str.slice(0, 2) + ":" + str.slice(2, 4);
    }

    fetchEmptyClassroom() {
        this.setState({ loading: true });

        let timeDiff = Math.abs((new Date()).getTime() - (new Date("1/1/2000")).getTime());
        let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) - 1;

        let formData = new FormData();
        formData.append("__EVENTTARGET", "date_cal");
        formData.append("__EVENTARGUMENT", diffDays);
        formData.append("classlist_ddl", this.state.building);
        formData.append("__VIEWSTATE", "dDw1NTk0MzU4NjE7dDw7bDxpPDE+Oz47bDx0PDtsPGk8Mz47aTw0Pjs+O2w8dDxAMDw7Ozs7Ozs7Ozs7Pjs7Pjt0PDtsPGk8NT47PjtsPHQ8QDA8cDxwPGw8U0Q7PjtsPGw8U3lzdGVtLkRhdGVUaW1lLCBtc2NvcmxpYiwgVmVyc2lvbj0xLjAuNTAwMC4wLCBDdWx0dXJlPW5ldXRyYWwsIFB1YmxpY0tleVRva2VuPWI3N2E1YzU2MTkzNGUwODk8MjAxNy0xMi0wNT47Pjs+Pjs+Ozs7Ozs7Ozs7Oz47Oz47Pj47Pj47Pj47Pu5S1476NkYk5hmd81mL76xisA4B");
        formData.append("__VIEWSTATEGENERATOR", "D2C5BC33");

        fetch('http://stuinfo.ntust.edu.tw/classroom_user/classroom_usecondition.aspx', {
            method: 'POST',
            body: formData
        })
            .then(response => response.text())
            .catch(error => console.error('Error:', error))
            .then((response) => {
                let $ = cheerio.load(response);
                let classrooms = {};
                $('tr[nowrap=nowrap]').each((i, elem) => {
                    let nowClassroom;
                    $(elem).find('td[nowrap=nowrap]').each((i, elem) => {
                        if (i === 0) {
                            nowClassroom = $(elem).text().trim();
                            classrooms[nowClassroom] = [];
                        }
                        else
                            classrooms[nowClassroom].push($(elem).text().trim());
                    });
                });

                this.setState({ classrooms: classrooms, loading: false });
            });
    }

    componentWillMount() {
        this.period[1] = ['0810', '0900'];
        this.period[2] = ['0910', '1000'];
        this.period[3] = ['1020', '1110'];
        this.period[4] = ['1120', '1210'];
        this.period[5] = ['1220', '1310'];
        this.period[6] = ['1320', '1410'];
        this.period[7] = ['1420', '1510'];
        this.period[8] = ['1530', '1620'];
        this.period[9] = ['1630', '1720'];
        this.period[10] = ['1730', '1820'];
        this.period[11] = ['1825', '1915'];
        this.period[12] = ['1920', '2010'];
        this.period[13] = ['2015', '2105'];
        this.period[14] = ['2110', '2200'];
        let nowTime = new Date();
        let timecode = nowTime.getHours().toString().concat(
            nowTime.getMinutes().toString() < 10 ?
                '0' + nowTime.getMinutes().toString() :
                nowTime.getMinutes().toString()
        );
        let nthClass = 1;
        for (let i = 1; i <= 14; i++) {
            if (parseInt(timecode) >= parseInt(this.period[i][0]) && parseInt(timecode) <= parseInt(this.period[i][1])) {
                nthClass = i;
                break;
            } else if (i + 1 <= 14 && parseInt(timecode) >= parseInt(this.period[i][1]) && parseInt(timecode) <= parseInt(this.period[i + 1][0])) {
                nthClass = i + 1;
                break;
            }
        }
        this.setState({ nthClass: nthClass });
    }

    render() {
        const data = [{
            label: '研揚大樓', value: 'TR'
        }, {
            label: '國際大樓', value: 'IB'
        }, {
            label: '第四教學大樓', value: 'T4'
        }, {
            label: '第三教學大樓', value: 'T3'
        }, {
            label: '工程一館', value: 'E1'
        }, {
            label: '工程二館', value: 'E2'
        }, {
            label: '電資館', value: 'EE'
        }, {
            label: '管理大樓', value: 'MA'
        }];

        return (
            <ScrollView>
                <Modal
                    isVisible={this.state.modalShow}
                    onBackButtonPress={() => this._toggleModal()}
                >
                    <ScrollView style={{
                        backgroundColor: "white",
                        padding: 4,
                        borderRadius: 4,
                        borderColor: "rgba(0, 0, 0, 0.1)"
                    }}>
                        <Card title={`${this.state.lookingUpClassroom} 整天的狀態`} containerStyle={{ margin: 0 }}>
                            {this.state.lookingUpClassroom in this.state.classrooms
                                &&
                                this.state.classrooms[this.state.lookingUpClassroom]
                                    .map((courseName, i) => (
                                        <View style={{
                                            flex: 1,
                                            flexDirection: 'row',
                                            backgroundColor: (courseName == "" ? "#f1f5ed" : "#ffffff")
                                        }} key={i}>
                                            <View style={{ margin: 10 }}>
                                                <Text style={{
                                                    fontSize: 16,
                                                    color: (courseName == "" ? "#8BB96E" : "#5a5a5a")
                                                }}>
                                                    {`${this.timecodeToTime(this.period[i + 1][0])} ~ ${this.timecodeToTime(this.period[i + 1][1])}`}
                                                </Text>
                                            </View>
                                            <View style={{ flex: 1, flexDirection: 'row', margin: 10 }}>
                                                {courseName == "" && <Icon name="check" color="#8BB96E" containerStyle={{ marginRight: 8 }} />}
                                                <Text style={{
                                                    fontSize: 16,
                                                    color: (courseName == "" ? "#8BB96E" : "#5a5a5a")
                                                }}>
                                                    {courseName == "" ? "空教室" : courseName}
                                                </Text>
                                            </View>
                                        </View>
                                    ))
                            }
                        </Card>
                    </ScrollView>
                    <View style={{ marginTop: 10 }}>
                        <Button onPress={() => this._toggleModal()} title="好的" />
                    </View>
                </Modal>
                <Card title="空教室查詢" >
                    <Dropdown
                        label='哪棟樓'
                        data={data}
                        onChangeText={(building) => {
                            this.setState({ building: building });
                            this.fetchEmptyClassroom();
                        }}
                    />
                    <Dropdown
                        label='第幾堂課'
                        value={this.state.nthClass}
                        data={
                            Array.apply(null, { length: 14 })
                                .map(Number.call, Number)
                                .map((i) => {
                                    let startTime = this.timecodeToTime(this.period[i + 1][0]),
                                        endTime = this.timecodeToTime(this.period[i + 1][1]);
                                    return {
                                        'label': `第 ${(i + 1 <= 10 ? i + 1 : String.fromCharCode(65 + i - 10))} 堂課 (${startTime}~${endTime})`,
                                        'value': i + 1
                                    }
                                })
                        }
                        onChangeText={(nthClass) => {
                            this.setState({ nthClass: nthClass });
                        }}
                    />
                </Card >
                <Card title="空的教室">
                    {this.state.loading &&
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <ActivityIndicator size="large" />
                        </View>
                    }
                    {
                        Object.keys(this.state.classrooms)
                            .filter((i) => { return this.state.classrooms[i][this.state.nthClass - 1] === "" })
                            .map((l, i) => (
                                <ListItem
                                    key={i}
                                    title={l}
                                    leftIcon={{ name: "location-on" }}
                                    onPress={() => this._toggleModal(l)}
                                    checkmark
                                />
                            ))
                    }
                </Card>
                <Card title="有在用的教室" containerStyle={{ marginBottom: 15 }}>
                    {this.state.loading &&
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <ActivityIndicator size="large" />
                        </View>
                    }
                    {
                        Object.keys(this.state.classrooms)
                            .filter((i) => { return this.state.classrooms[i][this.state.nthClass - 1] !== "" })
                            .map((l, i) => (
                                <ListItem
                                    key={i}
                                    title={l}
                                    subtitle={this.state.classrooms[l][this.state.nthClass - 1]}
                                    leftIcon={{ name: "location-on" }}
                                    onPress={() => this._toggleModal(l)}
                                />
                            ))
                    }
                </Card>
            </ScrollView>
        )
    }
}