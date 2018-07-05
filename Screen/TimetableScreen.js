import React from 'react';
import { StyleSheet, RefreshControl, ScrollView, ActivityIndicator, AsyncStorage, Button } from 'react-native';
import { Text, Card, ListItem } from 'react-native-elements';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import RefreshView from 'react-native-pull-to-refresh';

export default class TimetableScreen extends React.Component {

    constructor() {
        super();
        this.state = {
            login: null,
            stuAccountData: {},
            stuTimetable: {},
            refreshing: false,
        };
        this.readAccountData();
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
        this.readAccountData()
    }

    updateTimetable() {
        // console.log (this.state.stuAccountData);
        this.setState({ refreshing: true })
        return fetch('http://ntuster.herokuapp.com/api/schedule/', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.state.stuAccountData),
        })
            .then((response) => {
                return response.json();
            })
            .catch((error) => {
                console.log(error)
            })
            .then((res) => {
                this.setState({ stuTimetable: res, refreshing: false })
                AsyncStorage.setItem(
                    '@NTUSTapp:stuTimetable',
                    JSON.stringify(res)
                );
            });
    }

    render() {


        const classTime = [].concat(...(Object.keys(this.state.stuTimetable).map(
            (l, i) => {
                return this.state.stuTimetable[l]['periods'].map(
                    (p) => {
                        p['course_id'] = this.state.stuTimetable[l]['course_id']
                        p['name'] = this.state.stuTimetable[l]['name']
                        p['lecturer'] = this.state.stuTimetable[l]['lecturer']
                        return p
                    }
                )
            }))
        ).sort((x, y) => {
            a = x['day_code']
            b = y['day_code']
            dayCode = ["M", "T", "W", "R", "F", "S", "U"]
            timeCode = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'A', 'B', 'C', 'D']
            return (dayCode.indexOf(a[0]) * 10 + timeCode.indexOf(a[1])) - (dayCode.indexOf(b[0]) * 10 + timeCode.indexOf(b[1]))
        });

        const week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

        return (
            // <RefreshView onRefresh={() => this.updateTimetable()}>
            <ScrollableTabView
                renderTabBar={() => <DefaultTabBar backgroundColor='rgb(255, 255, 255)' />}
                initialPage={(new Date).getDay() - 1}
            >
                {
                    [1, 2, 3, 4, 5, 6, 7]
                        .map((l, i) =>
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
                                                    <Text>今天沒課 _(:з」∠)_</Text>
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
            // </RefreshView>
        )
    }



}
const styles = StyleSheet.create({
    icon: {
        width: 300,
        height: 300,
        alignSelf: 'center',
    },
});