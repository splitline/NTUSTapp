import React from 'react';
import { List, ListItem } from 'react-native-elements'
import { View, Text, Button, AsyncStorage, ScrollView } from 'react-native';
import RefreshView from 'react-native-pull-to-refresh';

export default class ScoreScreen extends React.Component {
  static navigationOptions = {
    drawerLabel: "成績查詢",
  };
  constructor() {
    super();
    this.state = {
      login: false,
      stuAccountData: {},
      stuScore: { score: [], rank_list: [], score_history: [] }
    };
  }

  readAccountData() {
    AsyncStorage.multiGet(['@NTUSTapp:StuAccountData', '@NTUSTapp:stuScore']).then(response => {
      if (response[0][1] != null && response[0][1] != '') {
        this.setState({ login: true, stuAccountData: JSON.parse(response[0][1]) });
        if (response[1][1] != null) {
          this.setState({ stuScore: JSON.parse(response[1][1]) });
        }
      } else {
        this.setState({ login: false, stuAccountData: {} });
      }
    });
  }

  updateScore() {
    return fetch('https://ntuster.herokuapp.com/api/score/', {
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
        console.log('Request failed', error)
      })
      .then((res) => {
        this.setState({ stuScore: res })
        AsyncStorage.setItem(
          '@NTUSTapp:stuScore',
          JSON.stringify(res)
        );
      });
  }

  componentWillMount() {
    this.readAccountData()
  }

  render() {
    const { navigation } = this.props;

    var success = navigation.getParam('success', false);
    if (success) {
      this.readAccountData();
    }

    var renderContext;

    if (this.state.login) {
      renderContext = (
        <RefreshView onRefresh={() => this.updateScore()}>
          {this.state.stuScore['score'].length !== 0 ?
          <ScrollView>
            {
              this.state.stuScore['score'].map((l, i) => (
                <ListItem
                  key={i}
                  title={l.name}
                  subtitle={l.id + "・" + l.credit + " 學分"}
                  badge={{ value: l.score }}
                />
              ))
            }
          </ScrollView>
          :<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>往下拉一下，讓你的成績載入進來</Text>
          </View>
          }
        </RefreshView>
      )
    } else {
      renderContext = (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>還沒登入 QQ</Text>
          <Button
            onPress={() => this.props.navigation.navigate('Login')}
            title="登入"
          />
        </View>
      )
    }

    return (
      renderContext
    );
  }
}