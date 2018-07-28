import React, { Component } from 'react';
import { View, Text, Linking, ScrollView, Image, Share, TouchableOpacity } from 'react-native';
import { Card, Divider, ListItem } from 'react-native-elements'; 1
import icon from '../images/icon.png';

export default class AboutScreen extends Component {

    constructor(props) {
        super(props);
        this.state = { count: 0 };
    }

    render() {
        return (
            <ScrollView>
                <Card containerStyle={{ elevation: 3 }}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        {
                            this.state.count < 10 ?
                                <TouchableOpacity onPress={() => this.setState({ count: this.state.count + 1 })}>
                                    <Image source={icon} style={{ height: 72, width: 72 }} />
                                </TouchableOpacity>
                                :
                                <Text style={{fontSize: 56}}>喵</Text>
                        }
                        <View margin={8}>
                            <Text style={{ fontSize: 24, color: '#222' }}>NTUSTapp</Text>
                            <Text>一個屬於台科人的 App</Text>
                        </View>
                    </View>

                    <ListItem
                        leftIcon={{ name: 'code' }}
                        title="程式原始碼"
                        subtitle="給個星星或是貢獻一下"
                        onPress={() => Linking.openURL('https://github.com/splitline/NTUSTapp')}
                    />

                    <ListItem
                        leftIcon={{ name: 'star' }}
                        title="在 Google Play 評分"
                        subtitle="在 Google Play 給個評分或回饋吧"
                        onPress={() => Linking.openURL("market://details?id=com.splitline.ntustapp")}
                    />

                    <ListItem
                        leftIcon={{ name: 'share' }}
                        title="分享這個 App"
                        subtitle="(其實沒人會用這個功能吧)"
                        onPress={() => {
                            Share.share({ message: 'NTUSTapp: https://play.google.com/store/apps/details?id=com.splitline.ntustapp', url: 'https://play.google.com/store/apps/details?id=com.splitline.ntustapp' })
                        }}
                    />
                    <Divider />
                    <ListItem
                        leftIcon={{ name: 'telegram', type: 'font-awesome' }}
                        title="NTUSTapp Telegram 群組"
                        subtitle="不知道能幹嘛，總之進來玩(ˊ・ω・ˋ)"
                        onPress={() => {
                            Linking.openURL('https://t.me/joinchat/BosVPRLU0la-a_u5tpwJ7g')
                        }}
                    />
                </Card>
                <Text></Text>
            </ScrollView>
        );
    }
}