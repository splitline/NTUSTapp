import React from 'react';
import { ListItem, Card, Text } from 'react-native-elements';
import { Slider, View, Button, AsyncStorage, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import cheerio from 'cheerio';
import Login from '../utils/funcLogin';
import isLogin from '../utils/checkLogin'

export default class ScoreScreen extends React.Component {

  constructor() {
    super();
    this.state = {
      refreshing: false,
      login: null,
      stuAccountData: {},
      stuScore: { score: [], rank_list: [], score_history: {} },
      gpaType: 1
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

  async updateScore() {
    this.setState({ refreshing: true });
    const logined = await isLogin();
    let fetchScore;
    if (logined.status) {
      console.log("Logined!!")
      fetchScore = fetch('https://stu255.ntust.edu.tw/ntust_stu/Query_Score.aspx', {
        method: 'GET',
        mode: 'cors',
        credentials: "include",
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0',
        }
      });
    }
    else {
      console.log("not login Q_Q");
      fetchScore = Login(
        this.state.stuAccountData,
        (__VIEWSTATE) => {
          return fetch('https://stu255.ntust.edu.tw/ntust_stu/Query_Score.aspx', {
            method: 'GET',
            mode: 'cors',
            credentials: "include",
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0',
            }
          });
        },
        // Failed
        () => { console.log("Failed Q_Q"); }
      )
    }

    return fetchScore
      .then((result) => result.text())
      .then((html) => {
        let $ = cheerio.load(html);

        let stuScore = {
          score: [],
          rank_list: [],
          score_history: {}
        };

        // current score
        $('table#Datagrid4 tr').each((i, elem) => {
          let tr = $(elem).find('td').toArray();
          if (i)  // if not header row
            stuScore.score.push({
              id: $(tr[1]).text().trim(),
              name: $(tr[2]).text().trim(),
              credit: $(tr[3]).text().trim(),
              score: $(tr[4]).text().trim(),
              note: $(tr[5]).text().trim(),
              type: $(tr[6]).text().trim()
            })
        });

        // past score
        $('table#DataGrid1 tr').each((i, elem) => {
          let tr = $(elem).find('td').toArray();
          if (i) {  // if not header row
            if (!($(tr[1]).text().trim() in stuScore.score_history))
              stuScore.score_history[$(tr[1]).text().trim()] = [] // init new semester
            stuScore.score_history[$(tr[1]).text().trim()].push({
              id: $(tr[2]).text().trim(),
              name: $(tr[3]).text().trim(),
              credit: $(tr[4]).text().trim(),
              score: $(tr[5]).text().trim(),
              note: $(tr[6]).text().trim(),
              type: $(tr[7]).text().trim()
            })
          }
        });
        this.setState({ stuScore: stuScore, refreshing: false });
        AsyncStorage.setItem(
          '@NTUSTapp:stuScore',
          JSON.stringify(stuScore)
        );
      });
  }

  componentWillMount() {
    this.readAccountData();
  }

  componentWillReceiveProps() {
    this.readAccountData();
  }

  render() {
    const gpList = {
      'A+': this.state.gpaType == 1 ? (4.3) : (4),
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

    if (this.state.login === true) {
      const nowSubjectNum = this.state.stuScore['score'].reduce((a, b) => a + (b['score'] in gpList), 0),
        totalSubjectNum = this.state.stuScore['score'].length,
        nowCredit = this.state.stuScore['score'].reduce((a, b) => a + (parseInt(b['credit']) * (b['score'] in gpList)), 0),
        nowPassedCredit = this.state.stuScore['score'].reduce((a, b) => a + (parseInt(b['credit']) * (b['score'] in gpList && gpList[b['score']] >= 1.7)), 0),
        totalCredit = this.state.stuScore['score'].reduce((a, b) => a + parseInt(b['credit']), 0),
        GPA = this.state.stuScore['score'].reduce((a, b) => a + (parseInt(b['credit']) * ((b['score'] in gpList) && gpList[b['score']])), 0) / nowCredit;
      renderContext = (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => this.updateScore()}
            />}>
          {this.state.stuScore['score'].length !== 0 ?  // is score exist?
            <View>
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
                      {nowPassedCredit}/{totalCredit}
                    </Text>
                    <Text>成功取得學分</Text>
                  </View>
                  <View>
                    <Text h4 style={{ textAlign: 'center' }}>
                      {GPA.toFixed(2)}
                    </Text>
                    <Text>目前 GPA</Text>
                  </View>
                </View>
                <View style={{
                  flex: 1, alignItems: "center", flexDirection: 'row', justifyContent: 'center',
                }}>
                  <Text>4.0 制</Text>
                  <Slider
                    value={this.state.gpaType}
                    onValueChange={(value) => this.setState({ gpaType: value })}
                    style={{ width: 75 }}
                    step={1} />
                  <Text>4.3 制</Text>
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
            </View>
            : // score not exist.
            (<Card>
              <Text>往下拉一下，讓你的成績載入進來</Text>
            </Card>)
          }
        </ScrollView>
      )
    } else if (this.state.login === false) {
      renderContext = (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>還沒登入 Q_Q</Text>
          <Button
            onPress={() => this.props.navigation.navigate('Login')}
            title="登入"
          />
        </View>
      )
    } else {  // checking login status
      renderContext = (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      )
    }

    return (renderContext);
  }
}