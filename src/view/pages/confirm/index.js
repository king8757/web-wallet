import React from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Web3 from 'web3';
import { emptyState } from '../../../redux/accountInProgress/action';
import createWallet from '../../../redux/account/action';
import { emptyKeysState } from '../../../redux/keys/actions';
import CancelWalletModal from '../../components/modals/cancel-wallet';
import IncorrectMnemonicsModal from '../../components/modals/incorrect-mnemonics';
import ValidationMethods from '../../../validations/userInputMethods';
import { walletSetup } from '../../../redux/accountManagement';

const validationMethods = new ValidationMethods();
const web3 = new Web3();

class Confirm extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedMnemonicsArray: [],
      mnemonicsArray: [],
      toggleModal: false,
      openIncorrectMnemonicsModal: false,
    };
    this.selectMnemonic = this.selectMnemonic.bind(this);
    this.getMnemonics = this.getMnemonics.bind(this);
    this.getSelectedMnemonics = this.getSelectedMnemonics.bind(this);
    this.createWallet = this.createWallet.bind(this);
    this.cancelWallet = this.cancelWallet.bind(this);
    this.cancelModalToggle = this.cancelModalToggle.bind(this);
    this.toggleIncorrectMnemonicsModal = this.toggleIncorrectMnemonicsModal.bind(this);
  }

  componentWillMount() {
    const mnemonics = this.getMnemonics();
    this.setState({
      mnemonicsArray: mnemonics,
    });
  }

  /**
   * This method will return the mnemonics list
   */
  getMnemonics() {
    const { accountInfo } = this.props;
    const { selectedMnemonicsArray } = this.state;
    const { mnemonic } = accountInfo;
    let mnemonicsList = [];
    const generatedMnemonic = validationMethods.getSplittedArray(mnemonic);
    if (generatedMnemonic && generatedMnemonic.length > 0) {
      for (let i = 0; i < generatedMnemonic.length; i += 1) {
        const selectedIndex = _.findIndex(
          selectedMnemonicsArray,
          mnemonicName => mnemonicName === generatedMnemonic[i]
        );
        mnemonicsList.push(
          <li key={i} className={`${generatedMnemonic[i]}_${i}`}>
            <Button
              color="primary"
              disabled={selectedIndex !== -1}
              onClick={() => this.selectMnemonic(generatedMnemonic[i], i)}
            >
              {generatedMnemonic[i]}
            </Button>
          </li>
        );
      }
    }
    mnemonicsList = _.shuffle(mnemonicsList);

    return mnemonicsList;
  }

  /**
   * This method will return the selected mnemonics
   */
  getSelectedMnemonics() {
    const { selectedMnemonicsArray } = this.state;
    const mnemonicsList = [];
    if (selectedMnemonicsArray && selectedMnemonicsArray.length > 0) {
      for (let i = 0; i < selectedMnemonicsArray.length; i += 1) {
        mnemonicsList.push(
          <li key={i}>
            <Button
              color="primary"
              onClick={() =>
                this.unselectMnemonic(
                  selectedMnemonicsArray[i].name,
                  selectedMnemonicsArray[i].index
                )
              }
            >
              {selectedMnemonicsArray[i].name}
            </Button>
          </li>
        );
      }
    }

    return mnemonicsList;
  }

  /**
   * @param {Name of the mnemonic} name
   * This method will remove the mnemonic from the selected mnemonics
   */
  unselectMnemonic(name, index) {
    const { selectedMnemonicsArray } = this.state;
    const clonedArray = selectedMnemonicsArray.slice();
    const selectedIndex = _.findIndex(
      selectedMnemonicsArray,
      mnemonicName => mnemonicName.index === index
    );
    // eslint-disable-next-line no-undef
    const findSelectedMnemonic = document.getElementsByClassName(`${name}_${index}`);
    const hasSelectedClass = findSelectedMnemonic[0].classList.contains('selected');
    if (hasSelectedClass) {
      findSelectedMnemonic[0].classList.remove('selected');
      clonedArray.splice(selectedIndex, 1);
      this.setState({
        selectedMnemonicsArray: clonedArray,
      });
    }
  }

  /**
   * @param {Name of the mnemonic} name
   * This method will push the selected mnemonic in the selected mnemonic array
   */
  selectMnemonic(name, index) {
    const { selectedMnemonicsArray } = this.state;
    const clonedArray = selectedMnemonicsArray.slice();
    // eslint-disable-next-line no-undef
    const findSelectedMnemonic = document.getElementsByClassName(`${name}_${index}`);
    const hasSelectedClass = findSelectedMnemonic[0].classList.contains('selected');
    if (!hasSelectedClass) {
      findSelectedMnemonic[0].classList.add('selected');
      clonedArray.push({ name, index });
      this.setState({
        selectedMnemonicsArray: clonedArray,
      });
    }
  }

  /**
   * @param {Account Private key} privateKey
   * @param {Account Password} Password
   * This method will return key store value of the account
   */
  // eslint-disable-next-line class-methods-use-this
  saveKeyStore(privateKey, password) {
    const keystore = web3.eth.accounts.encrypt(privateKey, password);
    return { keystore };
  }

  /**
   * This method will cancel the wallet creation process
   */
  cancelWallet() {
    const { accountsList, history, resetState } = this.props;
    if (accountsList.length === 0) {
      history.push('/create-account');
      // This method will reset the state of accountInfo reducer
      resetState();
    } else {
      history.push('/account-management');
      resetState();
    }
  }

  /**
   * This method will create the wallet
   */
  createWallet() {
    const {
      addWallet,
      accountInfo,
      publicAddress,
      history,
      resetState,
      emptyKeysObject,
    } = this.props;
    const { mnemonic, password } = accountInfo;
    const { selectedMnemonicsArray } = this.state;
    let data = {
      ...accountInfo,
      publicAddress,
    };
    data = _.omit(data, ['stepNo']);
    const mnemonicsArray = [];
    if (selectedMnemonicsArray && selectedMnemonicsArray.length > 0) {
      selectedMnemonicsArray.map(a => mnemonicsArray.push(a.name));
    }
    if (
      mnemonicsArray.length > 0 &&
      (mnemonicsArray.join(' ') === mnemonic || mnemonicsArray.join(',') === mnemonic)
    ) {
      data = _.omit(data, ['mnemonic', 'password']);
      const keys = walletSetup(mnemonic);

      const keyStore = this.saveKeyStore(keys.privateKey, password);
      data = { ...data, ...keyStore };
      addWallet(data);
      resetState();
      emptyKeysObject();
      history.push('/account-management');
    } else {
      this.toggleIncorrectMnemonicsModal();
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
    const { mnemonicsArray, toggleModal, openIncorrectMnemonicsModal } = this.state;
    const selectedMnemonics = this.getSelectedMnemonics();
    return (
      <div id="confirm" className="confirm">
        <section className="bg-dark">
          <Container>
            <Row>
              <Col>
                <div id="mnemonic-selector">
                  <h2 className="text-white">
                    Enter your mnemonics in the correct order to create your account below
                  </h2>
                  <Row className="bg-dark-light">
                    <Col>
                      <div className="mnemonic-container">
                        <ul>{selectedMnemonics}</ul>
                      </div>
                      <div className="mnemonic-selector">
                        <ul>{mnemonicsArray}</ul>
                      </div>
                    </Col>
                  </Row>
                  <div className="mnemonic-btn">
                    <Button className="create-wallet" onClick={this.createWallet}>
                      Create Wallet
                    </Button>
                    <Button className="cancel" onClick={this.cancelModalToggle}>
                      Cancel
                    </Button>
                  </div>
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
      </div>
    );
  }
}

const mapStateToProps = state => ({
  accountInfo: state.accountInfo,
  publicAddress: state.accountKeys.publicAddress,
  accountsList: state.accounts.accountsList,
});

const mapDispatchToProps = dispatch => ({
  addWallet: data => dispatch(createWallet(data)),
  emptyKeysObject: () => dispatch(emptyKeysState()),
  resetState: () => dispatch(emptyState()),
});

Confirm.propTypes = {
  accountInfo: PropTypes.oneOfType([PropTypes.object]).isRequired,
  publicAddress: PropTypes.string.isRequired,
  accountsList: PropTypes.oneOfType([PropTypes.array]).isRequired,
  addWallet: PropTypes.func.isRequired,
  emptyKeysObject: PropTypes.func.isRequired,
  resetState: PropTypes.func.isRequired,
  history: PropTypes.oneOfType([PropTypes.object]).isRequired,
};

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  withRouter
)(Confirm);
