import React, { useState, useEffect, useContext } from 'react';
/* import "./App.css"; */
import TorusSdk from '@toruslabs/torus-direct-web-sdk';
import Pact from 'pact-lang-api';
import styled from 'styled-components/macro';
import { Loader } from 'semantic-ui-react';
import { AccountContext } from '../../../contexts/AccountContext';
import { WalletContext } from '../../../contexts/WalletContext';
import CustomButton from '../../../shared/CustomButton';
import { ModalContext } from '../../../contexts/ModalContext';
import { GameEditionContext } from '../../../contexts/GameEditionContext';
import { WALLET } from '../../../constants/wallet';
import { theme } from '../../../styles/theme';
import { LightModeContext } from '../../../contexts/LightModeContext';

const ButtonContainer = styled.div`
  display: flex;
  flex-flow: column;
  gap: 24px;
  margin-top: 30px;
`;

const LoaderContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-top: 15px;
`;

const TopText = styled.span`
  font-size: 13px;
  font-family: ${({ theme: { fontFamily }, gameEditionView }) => (gameEditionView ? fontFamily.pressStartRegular : fontFamily.regular)};
  text-align: left;
`;

const BottomText = styled.span`
  font-size: 13px;
  font-family: ${({ theme: { fontFamily }, gameEditionView }) => (gameEditionView ? fontFamily.pressStartRegular : fontFamily.regular)};
  text-align: left;
`;

const GOOGLE = 'google';

const verifierMap = {
  [GOOGLE]: {
    name: 'Google',
    typeOfLogin: 'google',
    verifier: process.env.REACT_APP_TORUS_VERIFIER,
    clientId: process.env.REACT_APP_TORUS_GOOGLE_CLIENT_ID
  }
};

console.log('🚀 ~ file: ConnectWalletTorusModal.js ~ line 61 ~  process.env.REACT_APP_TORUS_VERIFIER', process.env.REACT_APP_TORUS_VERIFIER);

/* const createAPIHost = (network, chainId) => `https://${network}.testnet.chainweb.com/chainweb/0.0/testnet02/chain/${chainId}/pact` */

function Login({ onClose, onBack }) {
  const modalContext = useContext(ModalContext);
  const account = useContext(AccountContext);
  const wallet = useContext(WalletContext);
  const { themeMode } = useContext(LightModeContext);

  const { gameEditionView, closeModal } = useContext(GameEditionContext);
  const [selectedVerifier] = useState(GOOGLE);
  const [torusdirectsdk, setTorusdirectsdk] = useState(null);
  const [, setConsoleText] = useState('');
  const [, setPublicKey] = useState('');
  const [, setPrivateKey] = useState('');
  const [, setUserName] = useState('');
  const [, setDataRetrieved] = useState(false);
  const [, setLoginClicked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const torusdirectsdk = new TorusSdk({
          baseUrl: `${window.location.origin}/serviceworker`,
          enableLogging: true,
          redirectToOpener: true,
          network: process.env.REACT_APP_TORUS_NETWORK // details for test net
        });

        await torusdirectsdk.init({ skipSw: true });

        setTorusdirectsdk(torusdirectsdk);
      } catch (error) {
        console.error(error, 'mounted caught');
      }
    };
    init();
  }, []);

  const login = async (e) => {
    e.preventDefault();
    setLoginClicked(true);
    setLoading(true);
    /* const selectedVerifier = selectedVerifier;
    const { selectedVerifier, torusdirectsdk } = state; */

    try {
      const { typeOfLogin, clientId, verifier } = verifierMap[selectedVerifier];
      const loginDetails = await torusdirectsdk.triggerLogin({
        typeOfLogin,
        verifier,
        clientId
      });
      setConsoleText(typeof loginDetails === 'object' ? JSON.stringify(loginDetails) : loginDetails);

      setUserName(loginDetails?.userInfo?.name);

      const keyPair = Pact.crypto.restoreKeyPairFromSecretKey(loginDetails.privateKey);

      setPublicKey(keyPair.publicKey);
      setPrivateKey(keyPair.secretKey);

      await account.setVerifiedAccount(keyPair.publicKey);

      await wallet.storePrivKey(keyPair.secretKey);
      await wallet.setSelectedWallet(WALLET.TORUS);

      // const balance = await getBalance("coin", keyPair.publicKey);
      // setAccountBalance(balance[0]);
      setDataRetrieved(true);
      setLoading(false);
      onClose();
      closeModal();
    } catch (error) {
      console.error(error, 'login caught');
      setLoginClicked(false);
      setLoading(false);
    }
  };

  return (
    <>
      <TopText gameEditionView={gameEditionView}>Please press 'Connect with Torus' in order to access your wallet with Torus.</TopText>
      <BottomText gameEditionView={gameEditionView}>When submitting a transaction, you will sign it through Torus.</BottomText>
      <ButtonContainer gameEditionView={gameEditionView}>
        <CustomButton disabled={loading} onClick={login}>
          Connect with Torus
        </CustomButton>
      </ButtonContainer>
      {!gameEditionView && (
        <ButtonContainer style={{ marginTop: '10px' }}>
          <CustomButton
            disabled={loading}
            border="none"
            color={theme(themeMode).colors.white}
            background="transparent"
            onClick={() => {
              modalContext.onBackModal();
            }}
          >
            Cancel
          </CustomButton>
        </ButtonContainer>
      )}
      {loading && (
        <LoaderContainer gameEditionView={gameEditionView}>
          <Loader active inline="centered" style={{ color: '#e0e0e0' }}></Loader>
        </LoaderContainer>
      )}
    </>
  );
}

export default Login;
