import React from 'react';
import { List, ListItem, Card, Text } from 'react-native-elements'
import { View, Button, AsyncStorage, ScrollView } from 'react-native';
import RefreshView from 'react-native-pull-to-refresh';

export default class ScoreScreen extends React.Component {
  static navigationOptions = {
    drawerLabel: "成績查詢",
  };
  constructor() {
    super();
    this.readAccountData();
    console.log("constructor")
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

  // componentWillMount() {
    
  // }

  componentWillReceiveProps() {
    this.readAccountData()
    console.log("componentWillReceiveProps")
  }

  render() {
    console.log("render")

    const gpList = {
      'A+': 4.3,
      'A': 4,
      'A-': 3.7,
      'B+': 3.3,
      'B': 3.0,
      'B-': 2.7,
      'C+': 2.3,
      'C': 2,
      'C-': 1.7,
      'D': 1,
      'E': 0,
      'X': 0
    }

    var renderContext;

    if (this.state.login) {
      const nowSubjectNum = this.state.stuScore['score'].reduce((a, b) => a + (b['score'] in gpList), 0),
        totalSubjectNum = this.state.stuScore['score'].length,
        nowCredit = this.state.stuScore['score'].reduce((a, b) => a + (parseInt(b['credit']) * (b['score'] in gpList)), 0),
        totalCredit = this.state.stuScore['score'].reduce((a, b) => a + parseInt(b['credit']), 0),
        GPA = this.state.stuScore['score'].reduce((a, b) => a + (parseInt(b['credit']) * ((b['score'] in gpList) && gpList[b['score']])), 0) / nowCredit;
      renderContext = (
        <RefreshView onRefresh={() => this.updateScore()}>
          {this.state.stuScore['score'].length !== 0 ?
            <ScrollView>
              <Card title="Overview" containerStyle={{ marginBottom: 15 }}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', margin: 10 }}>
                  <View>
                    <Text h4 style={{ textAlign: 'center', }}>
                      {nowSubjectNum}/{totalSubjectNum}
                    </Text>
                    <Text>公布進度</Text>
                  </View>
                  <View>
                    <Text h4 style={{ textAlign: 'center' }}>
                      {nowCredit}/{totalCredit}
                    </Text>
                    <Text>目前取得學分</Text>
                  </View>
                  <View>
                    <Text h4 style={{ textAlign: 'center' }}>
                      {GPA.toFixed(2)}
                    </Text>
                    <Text>目前 GPA</Text>
                  </View>
                </View>
              </Card>
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
            :
            (<Card>
              <Text>往下拉一下，讓你的成績載入進來</Text>
            </Card>)
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