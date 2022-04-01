import React, { useState, createContext } from "react";
import Pact from "pact-lang-api";
import tokenData from "../constants/cryptoCurrencies";
import { useKaddexWalletContext, useWalletContext, useAccountContext, usePactContext } from '.';
import { reduceBalance } from "../utils/reduceBalance";
import {
  CHAIN_ID,
  creationTime,
  GAS_PRICE,
  NETWORK,
  NETWORKID,
  ENABLE_GAS_STATION,
} from "../constants/contextConstants";

export const SwapContext = createContext();

export const SwapProvider = (props) => {
  const pact = usePactContext();
  const { account, localRes, setLocalRes } = useAccountContext();
  const { isConnected: isXWalletConnected, requestSign: xWalletRequestSign } = useKaddexWalletContext();
  const wallet = useWalletContext();
  const [pairAccount, setPairAccount] = useState("");
  const [cmd, setCmd] = useState(null);

  const mkReq = function (cmd) {
    return {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(cmd),
    };
  };

  const parseRes = async function (raw) {
    const rawRes = await raw;
    const res = await rawRes;
    if (res.ok) {
      const resJSON = await rawRes.json();
      return resJSON;
    } else {
      const resTEXT = await rawRes.text();
      return resTEXT;
    }
  };

  const getPairAccount = async (token0, token1) => {
    try {
      let data = await Pact.fetch.local(
        {
          pactCode: `(at 'account (kswap.exchange.get-pair ${token0} ${token1}))`,
          meta: Pact.lang.mkMeta(
            "",
            CHAIN_ID,
            GAS_PRICE,
            3000,
            creationTime(),
            600
          ),
        },
        NETWORK
      );
      if (data.result.status === "success") {
        setPairAccount(data.result.data);
        return data.result.data;
      }
    } catch (e) {
      console.log(e);
    }
  };

  const swap = async (token0, token1, isSwapIn) => {
    try {
      let pair = await getPairAccount(token0.address, token1.address);

      const inPactCode = `(kswap.exchange.swap-exact-in
          (read-decimal 'token0Amount)
          (read-decimal 'token1AmountWithSlippage)
          [${token0.address} ${token1.address}]
          ${JSON.stringify(account.account)}
          ${JSON.stringify(account.account)}
          (read-keyset 'user-ks)
        )`;
      const outPactCode = `(kswap.exchange.swap-exact-out
          (read-decimal 'token1Amount)
          (read-decimal 'token0AmountWithSlippage)
          [${token0.address} ${token1.address}]
          ${JSON.stringify(account.account)}
          ${JSON.stringify(account.account)}
          (read-keyset 'user-ks)
        )`;
      const cmd = {
        pactCode: isSwapIn ? inPactCode : outPactCode,
        keyPairs: {
          publicKey: account.guard.keys[0],
          secretKey: wallet.privKey,
          clist: [
            {
              name: `${token0.address}.TRANSFER`,
              args: [
                account.account,
                pair,
                isSwapIn
                  ? reduceBalance(
                      token0.amount,
                      tokenData[token0.coin].precision
                    )
                  : reduceBalance(
                      token0.amount * (1 + parseFloat(pact.slippage)),
                      tokenData[token0.coin].precision
                    ),
              ],
            },
          ],
        },
        envData: {
          "user-ks": account.guard,
          token0Amount: reduceBalance(
            token0.amount,
            tokenData[token0.coin].precision
          ),
          token1Amount: reduceBalance(
            token1.amount,
            tokenData[token1.coin].precision
          ),
          token1AmountWithSlippage: reduceBalance(
            token1.amount * (1 - parseFloat(pact.slippage)),
            tokenData[token1.coin].precision
          ),
          token0AmountWithSlippage: reduceBalance(
            token0.amount * (1 + parseFloat(pact.slippage)),
            tokenData[token0.coin].precision
          ),
        },
        //meta: Pact.lang.mkMeta("", "", 0, 0, 0, 0),
        networkId: NETWORKID,
        meta: Pact.lang.mkMeta(
          account.account,
          CHAIN_ID,
          GAS_PRICE,
          3000,
          creationTime(),
          600
        ),
      };
      setCmd(cmd);
      await Pact.fetch.send(cmd, NETWORK);
    } catch (e) {
      console.log(e);
    }
  };

  const swapSend = async () => {
    pact.setPolling(true);
    try {
      let data;
      if (cmd.pactCode) {
        data = await Pact.fetch.send(cmd, NETWORK);
      } else {
        data = await Pact.wallet.sendSigned(cmd, NETWORK);
      }
      pact.pollingNotif(data.requestKeys[0]);
      await pact.listen(data.requestKeys[0]);
      pact.setPolling(false);
    } catch (e) {
      pact.setPolling(false);
      console.log(e);
    }
  };

  const swapLocal = async (token0, token1, isSwapIn) => {
    try {
      let privKey = wallet.signing.key;
      if (privKey.length !== 64) {
        return -1;
      }
      let pair = await getPairAccount(token0.address, token1.address);
      const inPactCode = `(kswap.exchange.swap-exact-in
          (read-decimal 'token0Amount)
          (read-decimal 'token1AmountWithSlippage)
          [${token0.address} ${token1.address}]
          ${JSON.stringify(account.account)}
          ${JSON.stringify(account.account)}
          (read-keyset 'user-ks)
        )`;
      const outPactCode = `(kswap.exchange.swap-exact-out
          (read-decimal 'token1Amount)
          (read-decimal 'token0AmountWithSlippage)
          [${token0.address} ${token1.address}]
          ${JSON.stringify(account.account)}
          ${JSON.stringify(account.account)}
          (read-keyset 'user-ks)
        )`;
      const cmd = {
        pactCode: isSwapIn ? inPactCode : outPactCode,
        keyPairs: {
          publicKey: account.guard.keys[0],
          secretKey: privKey,
          clist: [
            ...(ENABLE_GAS_STATION
              ? [
                  {
                    name: "kswap.gas-station.GAS_PAYER",
                    args: ["free-gas", { int: 1 }, 1.0],
                  },
                ]
              : [Pact.lang.mkCap("gas", "pay gas", "coin.GAS").cap]),
            {
              name: `${token0.address}.TRANSFER`,
              args: [
                account.account,
                pair,
                isSwapIn
                  ? reduceBalance(
                      token0.amount,
                      tokenData[token0.coin].precision
                    )
                  : reduceBalance(
                      token0.amount * (1 + parseFloat(pact.slippage)),
                      tokenData[token0.coin].precision
                    ),
              ],
            },
          ],
        },
        envData: {
          "user-ks": account.guard,
          token0Amount: reduceBalance(
            token0.amount,
            tokenData[token0.coin].precision
          ),
          token1Amount: reduceBalance(
            token1.amount,
            tokenData[token1.coin].precision
          ),
          token1AmountWithSlippage: reduceBalance(
            token1.amount * (1 - parseFloat(pact.slippage)),
            tokenData[token1.coin].precision
          ),
          token0AmountWithSlippage: reduceBalance(
            token0.amount * (1 + parseFloat(pact.slippage)),
            tokenData[token0.coin].precision
          ),
        },
        networkId: NETWORKID,
        meta: Pact.lang.mkMeta(
          ENABLE_GAS_STATION ? "kswap-free-gas" : account.account,
          CHAIN_ID,
          GAS_PRICE,
          3000,
          creationTime(),
          600
        ),
      };
      setCmd(cmd);
      let data = await Pact.fetch.local(cmd, NETWORK);
      setLocalRes(data);
      return data;
    } catch (e) {
      console.log('swap Local: ',e);
      setLocalRes({});
      return -1;
    }
  };

  const swapWallet = async (token0, token1, isSwapIn) => {
    try {
      const inPactCode = `(kswap.exchange.swap-exact-in
          (read-decimal 'token0Amount)
          (read-decimal 'token1AmountWithSlippage)
          [${token0.address} ${token1.address}]
          ${JSON.stringify(account.account)}
          ${JSON.stringify(account.account)}
          (read-keyset 'user-ks)
        )`;
      const outPactCode = `(kswap.exchange.swap-exact-out
          (read-decimal 'token1Amount)
          (read-decimal 'token0AmountWithSlippage)
          [${token0.address} ${token1.address}]
          ${JSON.stringify(account.account)}
          ${JSON.stringify(account.account)}
          (read-keyset 'user-ks)
        )`;
      const signCmd = {
        pactCode: isSwapIn ? inPactCode : outPactCode,
        caps: [
          ...(ENABLE_GAS_STATION
            ? [
                Pact.lang.mkCap(
                  "Gas Station",
                  "free gas",
                  "kswap.gas-station.GAS_PAYER",
                  ["free-gas", { int: 1 }, 1.0]
                ),
              ]
            : []),
          Pact.lang.mkCap(
            "transfer capability",
            "trasnsfer token in",
            `${token0.address}.TRANSFER`,
            [
              account.account,
              pact.pair.account,
              isSwapIn
                ? reduceBalance(token0.amount, tokenData[token0.coin].precision)
                : reduceBalance(
                    token0.amount * (1 + parseFloat(pact.slippage)),
                    tokenData[token0.coin].precision
                  ),
            ]
          ),
          ...(!ENABLE_GAS_STATION
            ? [Pact.lang.mkCap("gas", "pay gas", "coin.GAS")]
            : []),
        ],
        sender: ENABLE_GAS_STATION ? "kswap-free-gas" : account.account,
        gasLimit: 3000,
        gasPrice: GAS_PRICE,
        chainId: CHAIN_ID,
        ttl: 600,
        envData: {
          "user-ks": account.guard,
          token0Amount: reduceBalance(
            token0.amount,
            tokenData[token0.coin].precision
          ),
          token1Amount: reduceBalance(
            token1.amount,
            tokenData[token1.coin].precision
          ),
          token0AmountWithSlippage: reduceBalance(
            token0.amount * (1 + parseFloat(pact.slippage)),
            tokenData[token0.coin].precision
          ),
          token1AmountWithSlippage: reduceBalance(
            token1.amount * (1 - parseFloat(pact.slippage)),
            tokenData[token1.coin].precision
          ),
        },
        signingPubKey: account.guard.keys[0],
        networkId: NETWORKID,
      };
      //alert to sign tx
      /* walletLoading(); */
      wallet.setIsWaitingForWalletAuth(true);
      let command = null;
      if (isXWalletConnected) {
        const res = await xWalletRequestSign(signCmd);
        command = res.signedCmd;
      } else {
        command = await Pact.wallet.sign(signCmd);
      }
      console.log("cmd: ", command);
      //close alert programmatically
      /* swal.close(); */
      wallet.setIsWaitingForWalletAuth(false);
      wallet.setWalletSuccess(true);
      //set signedtx
      setCmd(command);
      let data = await fetch(`${NETWORK}/api/v1/local`, mkReq(command));
      data = await parseRes(data);
      setLocalRes(data);
      return data;
    } catch (e) {
      //wallet error alert
      /* setLocalRes({}); */
      if (e.message.includes("Failed to fetch"))
        wallet.setWalletError({
          error: true,
          title: "No Wallet",
          content: "Please make sure you open and login to your wallet.",
        });
      //walletError();
      else
        wallet.setWalletError({
          error: true,
          title: "Wallet Signing Failure",
          content:
            "You cancelled the transaction or did not sign it correctly. Please make sure you sign with the keys of the account linked in Kadenaswap.",
        }); //walletSigError();
      console.log(e);
    }
  };
  return (
    <SwapContext.Provider
      value={{
        swap,
        pairAccount,
        getPairAccount,
        swapSend,
        swapLocal,
        swapWallet,
        tokenData,
        localRes,
        cmd,
        setCmd,
        mkReq,
        parseRes,
      }}
    >
      {props.children}
    </SwapContext.Provider>
  );
};

export const SwapConsumer = SwapContext.Consumer;
