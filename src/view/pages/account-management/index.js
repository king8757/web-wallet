import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import { Container, Row, Col, Button } from 'reactstrap';
import copy from 'copy-to-clipboard';
import Layout from '../../components/layout';
import Identicons from '../../general/identicons/identicons';

class AccountManagement extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.copyToClipboard = this.copyToClipboard.bind(this);
  }

  getAccountsList() {
    const SELF = this;
    const { accountsList } = SELF.props;
    const accounts = [];
    if (accountsList && accountsList.length > 0) {
      // eslint-disable-next-line no-restricted-syntax
      for (const account of accountsList) {
        if (account) {
          accounts.push(
            <Col md={6} lg={3} className="main-col">
              <div className="accounts-holder">
                <div className="avatar">
                  <span className="avatar-icon">
                    <Identicons id={account.selectedIcon} width={40} key={0} size={3} />
                  </span>
                </div>
                <h2 className="title ">
                  <span>{account.accountName}</span>
                </h2>
                <div className="account-no">
                  <p>
                    <span>
                      <button
                        type="button"
                        className="clipboard-btn"
                        onClick={SELF.copyToClipboard}
                      >
                        <i className="fas fa-clone" />
                      </button>
                    </span>
                    {account.publicAddress}
                  </p>
                </div>
              </div>
            </Col>
          );
        }
      }
    }

    return accounts;
  }

  copyToClipboard() {
    const SELF = this;
    const { accountKeys } = SELF.props;
    const { publicAddress } = accountKeys;
    copy(publicAddress);
  }

  render() {
    console.log(this.props, 'this.props');
    const accountList = this.getAccountsList();
    return (
      <div id="account-management" className="account-management">
        <Layout>
          <section className="page-title">
            <Container>
              <Row>
                <Col>
                  <h2 className="title text-white text-center text-uppercase m-0">
                    <span>Account Management</span>
                  </h2>
                </Col>
              </Row>
            </Container>
          </section>
          <section className="bg-dark" style={{ padding: '0 0 120px' }}>
            <Container className="account-card-container">
              <Row style={{ marginBottom: '90px' }}>
                <Col>
                  <div className="add-wallet">
                    <h2 className="title ">
                      <span>Accounts</span>
                    </h2>
                    <Button>
                      <i className="fas fa-plus" />
                    </Button>
                  </div>
                </Col>
              </Row>
              <Row id="account-card" className="text-center ">
                {accountList}
                {/* <Col md={6} lg={3} className="main-col">
                  <div className="accounts-holder">
                    <div className="avatar">
                      <span className="avatar-icon">
                        <img src={avatar} alt="TestAccount" />
                      </span>
                    </div>
                    <h2 className="title ">
                      <span>TestAccount</span>
                    </h2>
                    <div className="account-no">
                      <p>
                        <span>
                          <i className="fas fa-clone" />
                        </span>
                        gfvgv
                      </p>
                    </div>
                  </div>
                </Col> */}
                {/* <Col md={6} lg={3} className="main-col">
                  <div className="accounts-holder">
                    <div className="avatar">
                      <span className="avatar-icon">
                        <img src={avatar} alt="TestAccount" />
                      </span>
                    </div>
                    <h2 className="title ">
                      <span>TestAccount</span>
                    </h2>
                    <div className="account-no">
                      <p>
                        <span>
                          <i className="fas fa-clone" />
                        </span>
                        123fmjkdfg1262
                      </p>
                    </div>
                  </div>
                </Col>
                <Col md={6} lg={3} className="main-col">
                  <div className="accounts-holder">
                    <div className="avatar">
                      <span className="avatar-icon">
                        <img src={avatar} alt="TestAccount" />
                      </span>
                    </div>
                    <h2 className="title ">
                      <span>TestAccount</span>
                    </h2>
                    <div className="account-no">
                      <p>
                        <span>
                          <i className="fas fa-clone" />
                        </span>
                        123fmjkdfg1262fgnncdbtrgtrgtngjfjhuvfdfgdgfghf
                      </p>
                    </div>
                  </div>
                </Col>
                <Col md={6} lg={3} className="main-col">
                  <div className="accounts-holder">
                    <div className="avatar">
                      <span className="avatar-icon">
                        <img src={avatar} alt="TestAccount" />
                      </span>
                    </div>
                    <h2 className="title ">
                      <span>TestAccount</span>
                    </h2>
                    <div className="account-no">
                      <p>
                        <span>
                          <i className="fas fa-clone" />
                        </span>
                        gfvgv
                      </p>
                    </div>
                  </div>
                </Col>
                <Col md={6} lg={3} className="main-col">
                  <div className="accounts-holder">
                    <div className="avatar">
                      <span className="avatar-icon">
                        <img src={avatar} alt="TestAccount" />
                      </span>
                    </div>
                    <h2 className="title ">
                      <span>TestAccount</span>
                    </h2>
                    <div className="account-no">
                      <p>
                        <span>
                          <i className="fas fa-clone" />
                        </span>
                        gfvgv
                      </p>
                    </div>
                  </div>
                </Col> */}
              </Row>
            </Container>
          </section>
        </Layout>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  accountsList: state.accounts.accountsList,
  accountKeys: state.accountKeys,
});

export default compose(
  connect(mapStateToProps),
  withRouter
)(AccountManagement);