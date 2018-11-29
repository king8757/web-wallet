import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Route, Switch, withRouter } from 'react-router-dom';
import { Container, Row, Col, Button } from 'reactstrap';
import _ from 'lodash';
import AccountProcess from '../../components/account-process';
import Layout from '../../components/layout';
import { createAccount, incrementStepNo } from '../../../redux/accountInProgress/action';
import ValidationMethods from '../../../validations/userInputMethods';
import CreateAccountSection from '../create-account/create-account-section';
import EnterMnemonics from '../enter-mnemonics';

const validationMethods = new ValidationMethods();

class RestoreAccount extends React.PureComponent {
  constructor(props) {
    super(props);
    const initialInfo = this.getInitialAccountInfo();
    this.state = {
      accountName: initialInfo.accountName,
      password: initialInfo.password,
      reEnteredPassword: initialInfo.reEnteredPassword,
      passwordHint: initialInfo.passwordHint,
      date: new Date().getTime(),
      animateRefreshIcon: false,
      identiconsId: '',
      selectedIcon: initialInfo.selectedIcon,
      error: false,
      containNumber: false,
      containCapitalLetter: false,
      hasLengthGreaterThanEight: false,
      nextButtonFunction: '',
      backButtonFunction: '',
      revealSecret: false,
      confirmationPhrase: '',
    };
    this.createNewAccount = this.createNewAccount.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
    this.getRadioIconData = this.getRadioIconData.bind(this);
    this.goToNextScreen = this.goToNextScreen.bind(this);
    this.goToPreviousScreen = this.goToPreviousScreen.bind(this);
    this.goToRestoreAccountScreen = this.goToRestoreAccountScreen.bind(this);
    this.revealSecret = this.revealSecret.bind(this);
  }

  componentWillMount() {
    const { password } = this.state;
    this.isValidPassword('password', password);
    this.setStepNoWithRouting();
  }

  /**
   * @param {Name of the key} key
   * @param {Value of the key} value
   * This method will update the value of the given key
   */
  onUpdate(key, value) {
    const SELF = this;
    this.setState(
      {
        [key]: value,
      },
      () => {
        SELF.disableNextButton();
      }
    );
    if (key === 'password' || key === 'reEnteredPassword') {
      this.isValidPassword(key, value);
    }
  }

  /**
   * This method will set the stepNo according to the current route
   */
  setStepNoWithRouting() {
    const { location, goToNextStep } = this.props;
    const { pathname } = location;
    let stepNo = 1;
    if (pathname === '/confirm') {
      stepNo = 3;
    } else if (pathname === '/account-information') {
      stepNo = 2;
    }
    goToNextStep({ stepNo });
  }

  /**
   * This method will set the funciton calls on back and
   * next button according to the current route
   */
  setFunctionCalls() {
    const { location } = this.props;
    const { pathname } = location;
    let nextButtonFunction = this.createNewAccount;
    let backButtonFunction = () => true;
    if (pathname === '/confirm') {
      nextButtonFunction = backButtonFunction;
      backButtonFunction = this.goToRestoreAccountScreen;
    }

    return {
      nextButtonFunction,
      backButtonFunction,
    };
  }

  /**
   * This method will refresh all the Icons
   */
  onRefresh = () => {
    const newDate = new Date().getTime();
    this.setState({ date: newDate });
  };

  /**
   * This method will return the initial account information
   */
  getInitialAccountInfo() {
    const SELF = this;
    const { accountName, password, passwordHint, selectedIcon } = SELF.props;
    return { accountName, password, passwordHint, selectedIcon };
  }

  /**
   * @param {Selected Icon ID} identiconsId
   * This method will set the icon Id
   */
  getRadioIconData(identiconsId) {
    const SELF = this;
    this.setState(
      {
        identiconsId,
      },
      () => {
        SELF.disableNextButton();
      }
    );
  }

  /**
   * This method will unblur the blurred part which hides the mnemonics
   */
  revealSecret() {
    this.setState({
      revealSecret: true,
    });
  }

  /**
   * This method will move to the Confirm screen and set the step no
   */
  goToNextScreen() {
    const SELF = this;
    const { goToNextStep, history } = SELF.props;
    goToNextStep({ stepNo: 3 });
    history.push('/confirm');
  }

  /**
   * This method will move to the Account information screen and set the step no
   */
  goToRestoreAccountScreen() {
    const SELF = this;
    const { goToNextStep, history } = SELF.props;
    goToNextStep({ stepNo: 2 });
    this.setState({
      revealSecret: false,
      confirmationPhrase: '',
    });
    history.push('/restore-account');
  }

  /**
   * This method will move to the previous create account screen and set the step no
   */
  goToPreviousScreen() {
    const SELF = this;
    const { goToNextStep, history } = SELF.props;
    goToNextStep({ stepNo: 1 });
    history.push('/create-account');
  }

  /**
   * This method will create the new account and set the state in the reducers
   */
  createNewAccount() {
    const SELF = this;
    const { createNewAccount, goToNextStep } = SELF.props;
    const { accountName, password, reEnteredPassword, passwordHint, identiconsId } = this.state;
    const data = {
      accountName,
      password,
      passwordHint,
      reEnteredPassword,
      selectedIcon: identiconsId,
    };
    createNewAccount(data);
    goToNextStep({ stepNo: 2 });
    this.setState({
      revealSecret: false,
      confirmationPhrase: '',
    });
    SELF.props.history.push('/confirm');
  }

  // eslint-disable-next-line class-methods-use-this
  /**
   * @param {Key name} key
   * @param {Value} value
   * This method check whether password is correct or not
   * and both the passwords are same
   */
  isValidPassword(key, value) {
    const { password } = this.state;
    const isValid = validationMethods.isPasswordCorrect(key, value);
    const isFalse = _.includes(isValid, false);
    if (key === 'password' && isFalse) {
      this.setState(isValid);
    }
    if (key === 'reEnteredPassword' && value !== '' && password !== value) {
      this.setState({
        error: true,
      });
    } else {
      isValid.error = false;
      this.setState(isValid);
    }
  }

  /**
   * This method will check the status of the next button on the step one
   */
  disableNextButtonOnStepOne() {
    const {
      accountName,
      password,
      reEnteredPassword,
      passwordHint,
      identiconsId,
      selectedIcon,
      containNumber,
      containCapitalLetter,
      hasLengthGreaterThanEight,
      error,
    } = this.state;
    const data = {
      accountName,
      password,
      reEnteredPassword,
      passwordHint,
      identiconsId,
      containNumber,
      containCapitalLetter,
      hasLengthGreaterThanEight,
    };
    if (selectedIcon) {
      data.identiconsId = selectedIcon;
    }
    const isAnyFieldEmpty = _.includes(data, '');
    const isAnyFieldUndefined = _.includes(data, undefined);
    const isPasswordIncorrect = _.includes(data, false);
    if (isAnyFieldEmpty || isPasswordIncorrect || isAnyFieldUndefined || error) {
      return true;
    }

    return false;
  }

  /**
   * This method will check the status of the next button on the step two
   */
  disableNextButtonOnStepTwo() {
    const { revealSecret, confirmationPhrase } = this.state;
    const data = {
      revealSecret,
      confirmationPhrase,
    };
    const isAnyFieldEmpty = _.includes(data, '');
    const isAnyFieldUndefined = _.includes(data, undefined);
    const isPasswordIncorrect = _.includes(data, false);
    if (!isAnyFieldEmpty && !isPasswordIncorrect && !isAnyFieldUndefined) {
      return false;
    }
    return true;
  }

  /**
   * This method will return the status of the next button
   */
  disableNextButton() {
    const SELF = this;
    const { stepNo } = SELF.props;
    if (stepNo === 1) {
      return this.disableNextButtonOnStepOne();
    }
    if (stepNo === 2) {
      return this.disableNextButtonOnStepTwo();
    }
    if (stepNo === 3) {
      return true;
    }

    return false;
  }

  render() {
    const SELF = this;
    const { stepNo, location } = SELF.props;
    const { revealSecret, confirmationPhrase } = this.state;
    const { pathname } = location;
    const functionToCall = this.setFunctionCalls();
    const isDisable = this.disableNextButton();
    const data = {
      onUpdate: this.onUpdate,
      revealSecretFunc: this.revealSecret,
      revealSecret,
      confirmationPhrase,
    };
    return (
      <div id="account-information" className="account-information">
        <Layout>
          <AccountProcess stepNo={stepNo} isRestoringAccount />
          <Header
            {...this.state}
            onUpdate={this.onUpdate}
            getRadioIconData={this.getRadioIconData}
            onRefresh={this.onRefresh}
            data={data}
          />
          <section style={{ padding: '40px 0' }}>
            <Container>
              <Row className="back-next-btn">
                <Col className="text-right">
                  <Button
                    className={pathname === '/create-account' ? 'light' : ''}
                    onClick={functionToCall.backButtonFunction}
                  >
                    <i className="fas fa-chevron-left" /> Back
                  </Button>
                </Col>
                <Col>
                  <Button
                    className={
                      isDisable || isDisable === undefined || pathname === '/confirm' ? 'light' : ''
                    }
                    onClick={
                      isDisable || isDisable === undefined
                        ? () => true
                        : functionToCall.nextButtonFunction
                    }
                  >
                    Next <i className="fas fa-chevron-right" />
                  </Button>
                </Col>
              </Row>
            </Container>
          </section>
        </Layout>
      </div>
    );
  }
}

const Header = props => (
  <Switch>
    <Route path="/restore-account" render={() => <CreateAccountSection {...props} />} />
    <Route path="/confirm" component={EnterMnemonics} />
  </Switch>
);

const mapStateToProps = state => ({
  accountName: state.accountInfo.accountName,
  password: state.accountInfo.password,
  passwordHint: state.accountInfo.passwordHint,
  selectedIcon: state.accountInfo.selectedIcon,
  stepNo: state.accountInfo.stepNo,
});

const mapDispatchToProps = dispatch => ({
  createNewAccount: data => {
    dispatch(() => createAccount(data));
  },
  goToNextStep: data => {
    dispatch(() => incrementStepNo(data));
  },
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  withRouter
)(RestoreAccount);