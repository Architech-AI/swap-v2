import React, { useState, useEffect, useContext } from "react";
/* import "./App.css"; */
import TorusSdk from "@toruslabs/torus-direct-web-sdk";
import Pact from "pact-lang-api";
import { useHistory } from "react-router-dom";
import styled from "styled-components/macro";
import { Loader } from "semantic-ui-react";
import { AccountContext } from "../../../contexts/AccountContext";
import { WalletContext } from "../../../contexts/WalletContext";
import CustomButton from "../../../shared/CustomButton";
import { ModalContext } from "../../../contexts/ModalContext";
import { WALLET } from "../../../constants/wallet";

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

const Text = styled.span`
  font-size: 13px;
  font-family: ${({ theme: { fontFamily } }) => fontFamily.regular};
`;

const GOOGLE = "google";

const verifierMap = {
  [GOOGLE]: {
    name: "Google",
    typeOfLogin: "google",
    verifier: process.env.REACT_APP_TORUS_VERIFIER,
    clientId: process.env.REACT_APP_TORUS_GOOGLE_CLIENT_ID,
  },
};

/* const createAPIHost = (network, CHAIN_ID) => `https://${network}.testnet.chainweb.com/chainweb/0.0/testnet02/chain/${CHAIN_ID}/pact` */

function Login({ onClose, onBack }) {
  const modalContext = useContext(ModalContext);
  const account = useContext(AccountContext);
  const wallet = useContext(WalletContext);
  const [selectedVerifier, setSelectedVerifier] = useState(GOOGLE);
  const [torusdirectsdk, setTorusdirectsdk] = useState(null);
  const [loginHint, setLoginHint] = useState("");
  const [consoleText, setConsoleText] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [userName, setUserName] = useState("");
  const [dataRetrieved, setDataRetrieved] = useState(false);
  const [loginClicked, setLoginClicked] = useState(false);
  const history = useHistory();
  const [accountBalance, setAccountBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const torusdirectsdk = new TorusSdk({
          baseUrl: `${window.location.origin}/serviceworker`,
          enableLogging: true,
          redirectToOpener: true,
          network: process.env.REACT_APP_TORUS_NETWORK, // details for test net
        });

        await torusdirectsdk.init({ skipSw: true });

        setTorusdirectsdk(torusdirectsdk);
      } catch (error) {
        console.error(error, "mounted caught");
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
        clientId,
      });
      setConsoleText(
        typeof loginDetails === "object"
          ? JSON.stringify(loginDetails)
          : loginDetails
      );

      setUserName(loginDetails?.userInfo?.name);

      const keyPair = Pact.crypto.restoreKeyPairFromSecretKey(
        loginDetails.privateKey
      );

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
    } catch (error) {
      console.error(error, "login caught");
      setLoginClicked(false);
      setLoading(false);
    }
  };

  return (
    <>
      <Text>
        Please press 'Connect with Torus' in order to access your wallet with
        Torus.
      </Text>
      <Text>
        When submitting a transaction, you will sign it through Torus.
      </Text>
      <ButtonContainer>
        <CustomButton disabled={loading} onClick={login}>
          Connect with Torus
        </CustomButton>
      </ButtonContainer>
      <ButtonContainer style={{ marginTop: "10px" }}>
        <CustomButton
          disabled={loading}
          border="none"
          boxShadow="none"
          background="transparent"
          onClick={() => {
            modalContext.onBackModal();
          }}
        >
          Cancel
        </CustomButton>
      </ButtonContainer>
      {loading && (
        <LoaderContainer>
          <Loader
            active
            inline="centered"
            style={{ color: "#e0e0e0" }}
          ></Loader>
        </LoaderContainer>
      )}
    </>
  );
}

export default Login;
