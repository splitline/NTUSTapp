import React, { Component } from 'react';
import { View, Text, TextInput } from 'react-native';
import ButtonSubmit from '../components/ButtonSubmit';
import Dimensions from 'Dimensions';

const DEVICE_WIDTH = Dimensions.get('window').width;

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      studentno: "",
      idcard: "",
      birthday: "",
      password: ""
    };
  }
  render() {
    const WIDTH = DEVICE_WIDTH - 150
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 42, paddingBottom: 24 }}>NTUSTapp</Text>
        <TextInput
          style={{ height: 40, width: WIDTH }}
          placeholder="學號"
          onChangeText={(studentno) => this.setState({ studentno: studentno })}
          returnKeyType={"next"}
          onSubmitEditing={() => { this.birthdayTextInput.focus(); }}
        />
        <TextInput
          style={{ height: 40, width: WIDTH }}
          placeholder="生日"
          onChangeText={(birthday) => this.setState({ birthday: birthday })}
          ref={(input) => { this.birthdayTextInput = input; }}
          returnKeyType={"next"}
          onSubmitEditing={() => { this.idcardTextInput.focus(); }}
        />
        <TextInput
          style={{ height: 40, width: WIDTH }}
          placeholder="身分證字號"
          onChangeText={(idcard) => this.setState({ idcard: idcard })}
          secureTextEntry={true}
          ref={(input) => { this.idcardTextInput = input; }}
          returnKeyType={"next"}
          onSubmitEditing={() => { this.passwordTextInput.focus(); }}
        />
        <TextInput
          style={{ height: 40, width: WIDTH }}
          placeholder="密碼"
          onChangeText={(password) => this.setState({ password: password })}
          secureTextEntry={true}
          ref={(input) => { this.passwordTextInput = input; }}
        />
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <ButtonSubmit
            data={
              {
                studentno: this.state.studentno,
                idcard: this.state.idcard,
                birthday: this.state.birthday,
                password: this.state.password
              }
            }
            navigation={this.props.navigation} />
        </View>
      </View>
    );
  }
}