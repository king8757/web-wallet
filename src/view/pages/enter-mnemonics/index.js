import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Web3 from 'web3';
import { withRouter } from 'react-router-dom';
import { Container, Row, Col, FormGroup, Label, Input, Button } from 'reactstrap';
import { emptyState } from '../../../redux/accountInProgress/action';
import createWallet from '../../../redux/account/action';
import CancelWalletModal from '../../components/modals/cancel-wallet';
import IncorrectMnemonicsModal from '../../components/modals/incorrect-mnemonics';
import ValidationMethods from '../../../validations/userInputMethods';
import { walletSetup } from '../../../redux/accountManagement';

const web3 = new Web3();

const validationMethods = new ValidationMethods();

class EnterMnemonics extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      enteredMnemonic: '',
      toggleModal: false,
      openIncorrectMnemonicsModal: false,
    };
    this.onUpdate = this.onUpdate.bind(this);
    this.createWallet = this.createWallet.bind(this);
    this.cancelWallet = this.cancelWallet.bind(this);
    this.cancelModalToggle = this.cancelModalToggle.bind(this);
    this.toggleIncorrectMnemonicsModal = this.toggleIncorrectMnemonicsModal.bind(this);
    this.checkMnemonicIsCorrect = this.checkMnemonicIsCorrect.bind(this);
  }

  /**
   * @param {Name of the key} key
   * @param {Value of the key} value
   * This method will update the value of the given key
   */
  onUpdate(key, value) {
    this.setState({
      [key]: value,
    });
  }

  /**
   * @param {Private Key} privateKey
   * @param {Account password} password
   * This method will return the key store value of the particular account
   */
  // eslint-disable-next-line class-methods-use-this
  getKeyStore(privateKey, password) {
    const keystore = web3.eth.accounts.encrypt(privateKey, password);
    return { keystore };
  }

  /**
   * This method will check that the manually entered mnemonic phrase is correct
   */
  checkMnemonicIsCorrect() {
    let { enteredMnemonic } = this.state;
    enteredMnemonic = enteredMnemonic.trim();
    const mnemonicsArray = enteredMnemonic.split(' ');
    const isValidSeedNames = this.isValidSeedNames(mnemonicsArray);
    const isAnyFalseName = _.includes(isValidSeedNames, false);
    if (mnemonicsArray.length === 12 && !isAnyFalseName) {
      return true;
    }
    return false;
  }

  /**
   * @param {Mnemonic Phrase} seed
   * This method will check all the names are valid in the mnemonic phrase
   */
  // eslint-disable-next-line class-methods-use-this
  isValidSeedNames(seed) {
    if (seed && seed.length > 0) {
      return seed.map(name => validationMethods.noSpecialChars(name));
    }

    return false;
  }

  /**
   * This method will create the wallet
   */
  createWallet() {
    const { enteredMnemonic } = this.state;
    const { accountName, identiconsId, removeAccount, history, addWallet, password } = this.props;
    let data = {
      accountName,
      selectedIcon: identiconsId,
    };
    const isMnemonicCorrect = this.checkMnemonicIsCorrect();
    if (isMnemonicCorrect) {
      const keys = walletSetup(enteredMnemonic);
      const keyStore = this.getKeyStore(keys.privateKey, password);
      data = { ...keys, ...data, ...keyStore };
      data = _.omit(data, ['privateKey', 'mnemonic']);
      addWallet(data);
      removeAccount();
      history.push('/account-management');
    } else {
      this.toggleIncorrectMnemonicsModal();
    }
  }

  /**
   * This method will cancel the wallet creation process
   */
  cancelWallet() {
    const { accountsList, history, removeAccount } = this.props;
    if (accountsList.length === 0) {
      history.push('/create-account');
      // This method will reset the state of accountInfo reducer
      removeAccount();
    } else {
      history.push('/account-management');
      removeAccount();
    }
  }

  /**
   * This method will toggle the cancel wallet modal
   */
  cancelModalToggle() {
    const { toggleModal } = this.state;
    this.setState({
      toggleModal: !toggleModal,
    });
  }

  /**
   * This method will toggle the Incorrect Mnemonics modal
   */
  toggleIncorrectMnemonicsModal() {
    const { openIncorrectMnemonicsModal } = this.state;
    this.setState({
      openIncorrectMnemonicsModal: !openIncorrectMnemonicsModal,
    });
  }

  render() {
    const { toggleModal, openIncorrectMnemonicsModal, enteredMnemonic } = this.state;
    return (
      <section className="bg-dark">
        <Container>
          <Row>
            <Col>
              <div className="restore-confirm">
                <div className="wallet-bar">
                  <h2 className="title">
                    <span>Restore Wallet</span>
                  </h2>
                </div>
                <div className="vault-container bg-dark-light">
                  <FormGroup>
                    <Label for="wallet-seed">Wallet Seed</Label>
                    <Input
                      type="textarea"
                      name="wallet-seed"
                      id="wallet-seed"
                      placeholder="Separate each word with a single space"
                      onChange={e => this.onUpdate('enteredMnemonic', e.currentTarget.value)}
                      value={enteredMnemonic}
                    />
                  </FormGroup>
                  <div className="text-center">
                    <p className="text-white">
                      Enter your secret twelve word phrase here to restore your vault.
                    </p>
                    <p className="text-danger">Separate each word with a single space</p>
                  </div>
                </div>
              </div>
              <div className="mnemonic-btn">
                <Button className="create-wallet" onClick={this.createWallet}>
                  Create Wallet
                </Button>
                <Button className="cancel" onClick={this.cancelModalToggle}>
                  Cancel
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
        <CancelWalletModal
          toggleModal={toggleModal}
          cancelModalToggle={this.cancelModalToggle}
          cancelWallet={this.cancelWallet}
        />
        <IncorrectMnemonicsModal
          openIncorrectMnemonicsModal={openIncorrectMnemonicsModal}
          toggleIncorrectMnemonicsModal={this.toggleIncorrectMnemonicsModal}
        />
      </section>
    );
  }
}

const mapStateToProps = state => ({
  accountName: state.accountInfo.accountName,
  password: state.accountInfo.password,
  accountsList: state.accounts.accountsList,
});

const mapDispatchToProps = dispatch => ({
  removeAccount: () => dispatch(emptyState()),
  addWallet: data => dispatch(createWallet(data)),
});

EnterMnemonics.propTypes = {
  accountName: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  accountsList: PropTypes.oneOfType([PropTypes.array]).isRequired,
  identiconsId: PropTypes.string.isRequired,
  history: PropTypes.oneOfType([PropTypes.object]).isRequired,
  removeAccount: PropTypes.func.isRequired,
  addWallet: PropTypes.func.isRequired,
};

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  withRouter
)(EnterMnemonics);
