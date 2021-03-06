/* eslint-disable no-console */
import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Button, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import warningImg from '../../../../images/warning.svg';
import { transferFantom } from '../../../../redux/accountManagement/index';
import addressImage from '../../../../images/addressDisable.svg';
import coinImage from '../../../../images/coin.svg';
import { getFantomBalance } from '../../../../redux/getBalance/action';
import fantomLogo from '../../../../images/logo/small-logo-white.svg';
import Loader from '../../loader/index';

/**
 * ConfirmFunds: This component is meant for rendering modal for Check send.
 */
class ConfirmFunds extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coin: 'FTM',
      errorMessage: '',
      loading: false,
    };
  }

  /**
   * transferMoney() :  This function is meant for sending funds to some wallet account.
   * @param {*} from : Address of account from which to transfer.
   * @param {*} to : Address of account to whom to transfer.
   * @param {*} value : Amount to be transfered.
   * @param {*} memo : : Message text for transaction.
   * @param {*} privateKey : Private key of account from which to transfer.
   *
   * If the transfer done successfully then , modal is closed and wallet balance and transaction details is updated.
   */
  transferMoney(from, to, value, memo, privateKey) {
    const { transferMoney, openTransferForm, getBalance } = this.props;
    transferFantom(from, to, value, memo, privateKey, transferMoney, getBalance)
      .then(data => {
        if (data.hash && data.hash !== '') {
          console.log(`Transfer successful with transaction hash: ${data.hash}`);
          this.setState({
            loading: false,
          });

          setTimeout(() => {
            if (openTransferForm) {
              openTransferForm();
            }
          }, 1000);

          return;
        }
        console.log(`Transfer successful.`);
      })
      .catch(err => {
        const message = err.message || 'Invalid error. Please check the data and try again.';
        console.log(`Transfer error message: `, message);
        this.setState({ errorMessage: message });
      });
  }

  /**
   * confirmSendFunds() :  A function for transfering funds on click on continue.
   */
  confirmSendFunds() {
    const { publicKey, address, amount, memo, privateKey } = this.props;
    this.setState({
      loading: true,
    });
    this.transferMoney(publicKey, address, amount, memo, privateKey);
  }

  /**
   * This method will return the loader component
   */
  renderLoader() {
    const { loading } = this.state;
    if (loading) {
      return (
        <div className="loader-holder loader-center-align">
          <Loader sizeUnit="px" size={25} color="#549aec" loading={loading} />
        </div>
      );
    }
    return null;
  }

  render() {
    const {
      address,
      amount,
      memo,
      handleGoBack,
      refreshWalletDetail,
      publicKey,
      isRefreshing,
    } = this.props;

    let rotate = '';
    if (isRefreshing) {
      rotate = 'rotate';
    }
    const { errorMessage, coin } = this.state;
    return (
      <React.Fragment>
        <div id="transaction-form">
          <div>
            <h2 className="text-white text-center text-uppercase heading">
              <span>CONFIRM</span>
            </h2>
            <div className="add-wallet">
              <h2 className="title">
                <span>Send Funds - Confirm</span>
              </h2>
              <Button className="btn" onClick={() => refreshWalletDetail(publicKey)}>
                <i className={`fas fa-sync-alt ${rotate}`} />
              </Button>
            </div>

            <div className="form">
              <FormGroup>
                <Label for="to-address">Coin</Label>
                <div className="success-check success">
                  {' '}
                  <Input
                    type="text"
                    id="to-address"
                    placeholder="Coin"
                    style={{
                      backgroundImage: `url(${coinImage})`,
                    }}
                    value={coin}
                    readOnly
                  />
                </div>
              </FormGroup>
              <Row className="change">
                <Col>
                  <FormGroup>
                    <Label for="Amount">Address to send</Label>
                    <div className="input-holder">
                      <Input
                        type="text"
                        id="to-address"
                        placeholder="Address"
                        style={{
                          backgroundImage: `url(${addressImage})`,
                        }}
                        value={address}
                        readOnly
                      />
                    </div>
                  </FormGroup>
                </Col>
              </Row>

              <FormGroup>
                <Label for="to-address">Price</Label>
                <div className="success-check success">
                  {' '}
                  <Input
                    type="text"
                    id="to-address"
                    placeholder="Amount"
                    style={{
                      backgroundImage: `url(${fantomLogo})`,
                    }}
                    value={amount}
                    readOnly
                  />
                </div>
              </FormGroup>

              <Label for="OptionalMessage">Memo</Label>
              <FormGroup className="mb-1">
                <Input
                  type="textarea"
                  name="text"
                  id="exampleText"
                  placeholder="Text..."
                  value={memo}
                  readOnly
                />
              </FormGroup>
              <br />
              <div className="warning-msg mt-3">
                <img src={warningImg} alt="warning" />
                <h2>Attention</h2>
                <p>Please make sure the above information is correct.</p>
              </div>
              {this.renderLoader()}
              <center>
                <div>
                  <Button
                    color="primary"
                    className="text-uppercase bordered "
                    style={{ marginTop: '18px' }}
                    onClick={() => this.confirmSendFunds()}
                  >
                    Continue
                  </Button>
                </div>
                <div>
                  <Button
                    color="primary"
                    className="text-uppercase bordered "
                    style={{ marginTop: '18px' }}
                    onClick={handleGoBack}
                  >
                    Back
                  </Button>
                </div>
              </center>
              {errorMessage !== '' && <p style={{ color: 'red' }}>Funds transfer unsuccessful!</p>}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getBalance: data => dispatch(getFantomBalance(data)),
});

export default compose(
  connect(
    null,
    mapDispatchToProps
  )
)(ConfirmFunds);
