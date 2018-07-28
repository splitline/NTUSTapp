import React, { Component } from 'react';
import { DrawerItems } from 'react-navigation';
import { Text, ScrollView, View, AsyncStorage, TouchableNativeFeedback } from 'react-native';
import { Divider } from 'react-native-elements'


class DrawerComponent extends Component {
    state = {
        StuData: {
            StuName: '',
            StuInfo: ''
        },
        login: false
    }

    readAccountData = () => {
        AsyncStorage.getItem('@NTUSTapp:StuData')
            .then(data => {
                if (data != null)
                    this.setState({ StuData: JSON.parse(data), login: true });
            });
    }

    componentWillMount = this.readAccountData();

    render() {

        const itemGroup = {
            stuSystem: ['Score', 'PastScore', 'Timetable'],
            tools: ['EmptyClassroom', 'CourseTracker'],
            other: ['About']
        }

        let StuData = this.state.StuData, login = this.state.login;

        if (this.props.navigation.state.params) {
            StuData = this.props.navigation.state.params.StuData;
            login = true;
        }

        return (
            <View>
                <ScrollView>
                    <View style={{
                        flex: 1,
                        justifyContent: 'flex-end',
                        backgroundColor: '#2089dc',
                        height: 150,
                        padding: 15
                    }}
                    >
                        {login ? (
                            <View>
                                <Text style={{ color: '#fff', fontSize: 16 }}>{StuData.StuName}</Text>
                                <Text style={{ color: '#fff', fontSize: 14 }}>{StuData.StuInfo}</Text>
                            </View>
                        ) :
                            (
                                <View>
                                    <Text style={{ color: '#fff', fontSize: 16 }}>你還沒登入 (ˊ・ω・ˋ)</Text>
                                </View>
                            )
                        }
                    </View>

                    <View>
                        <DrawerItems {...{
                            ...this.props,
                            items: this.props.items.filter(item => itemGroup.stuSystem.includes(item.key)),
                        }} />
                    </View>

                    <Divider style={{marginVertical:3}} />

                    <View>
                        <DrawerItems {...{
                            ...this.props,
                            items: this.props.items.filter(item => itemGroup.tools.includes(item.key)),
                        }} />
                    </View>
                    <Divider />

                    <View>
                        <DrawerItems {...{
                            ...this.props,
                            items: this.props.items.filter(item => itemGroup.other.includes(item.key)),
                        }} />
                    </View>
                </ScrollView>
            </View>
        );
    }
}

export default DrawerComponent;