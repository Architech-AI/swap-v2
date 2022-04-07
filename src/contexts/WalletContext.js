import React, { createContext, useEffect, useState } from "react";
import Pact from "pact-lang-api";
import useLocalStorage from "../hooks/useLocalStorage";

export const WalletContext = createContext(null);



export const WalletProvider = (props) => {
  const [wallet, setWallet, removeWallet] = useLocalStorage('wallet', null);
  const [signing, setSigning, removeSigning] = useLocalStorage('signing', { method: 'none', key: '' });

  const [privKey, setPrivKey] = useLocalStorage('pk', '');
  const keyPair = privKey
    ? Pact.crypto.restoreKeyPairFromSecretKey(privKey)
    : "";

  const [walletError, setWalletError] = useState(null);
  const [isWaitingForWalletAuth, setIsWaitingForWalletAuth] = useState(false);
  const [walletSuccess, setWalletSuccess] = useState(false);

  useEffect(() => {
    const store = async () =>
      localStorage.setItem("signing", JSON.stringify(signing));
    store();
  }, [signing]);

  const storePrivKey = async (pk) => {
    setSigning({ method: "pk", key: pk });
    await setPrivKey(pk);
    await localStorage.setItem("pk", pk);
  };

  const setSigningMethod = async (meth) => {
    await setSigning({ ...signing, method: meth });
  };

  const signingWallet = () => {
    setSigning({ method: "sign", key: "" });
  };

  const setSelectedWallet = (wallet) => {
    setWallet({ id: wallet.id, name: wallet.name });
  };

  const disconnectWallet = () => {
    removeWallet();
    removeSigning();
    window.location.reload();
  };

  const contextValues = {
    wallet,
    setSelectedWallet,
    signing,
    walletError,
    setWalletError,
    keyPair,
    isWaitingForWalletAuth,
    setIsWaitingForWalletAuth,
    walletSuccess,
    setWalletSuccess,
    disconnectWallet,
    storePrivKey,
    setSigningMethod,
    signingWallet,
  };
  return (
    <WalletContext.Provider value={contextValues}>
      {props.children}
    </WalletContext.Provider>
  );
};
