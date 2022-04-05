import React, { createContext, useContext, useEffect, useState } from 'react';
import Pact from 'pact-lang-api';
import pairTokens from '../constants/pairs.json';
import { toast } from 'react-toastify';

import {
  CHAIN_ID,
  creationTime,
  FEE,
  GAS_PRICE,
  GAS_LIMIT,
  NETWORK,
  NETWORK_TYPE,
} from '../constants/contextConstants';
import { extractDecimal } from '../utils/reduceBalance';
import tokenData from '../constants/cryptoCurrencies';
import { AccountContext } from './AccountContext';
import { NotificationContext, STATUSES } from './NotificationContext';

export const PactContext = createContext();

const savedSlippage = localStorage.getItem('slippage');
const savedTtl = localStorage.getItem('ttl');

export const PactProvider = (props) => {
  const account = useContext(AccountContext);
  const notificationContext = useContext(NotificationContext);

  const [slippage, setSlippage] = useState(
    savedSlippage ? savedSlippage : 0.05
  );
  const [ttl, setTtl] = useState(savedTtl ? savedTtl : 600);
  const [pair, setPair] = useState('');
  const [pairReserve, setPairReserve] = useState('');
  const [precision, setPrecision] = useState(false);
  const [balances, setBalances] = useState(false);
  const [polling, setPolling] = useState(false);
  const [totalSupply, setTotalSupply] = useState('');
  const [ratio, setRatio] = useState(NaN);
  const [pairList, setPairList] = useState(pairTokens);
  const [swapList, setSwapList] = useState({});

  //TO FIX, not working when multiple toasts are there
  const toastId = React.useRef(null);
  // const [toastIds, setToastIds] = useState({})

  useEffect(() => {
    pairReserve
      ? setRatio(pairReserve['token0'] / pairReserve['token1'])
      : setRatio(NaN);
  }, [pairReserve]);

  useEffect(() => {
    fetchPrecision();
  }, [precision]);

  useEffect(() => {
    fetchAllBalances();
  }, [balances, account.account.account, account.sendRes]);

  const pollingNotif = (reqKey) => {
    return (toastId.current = notificationContext.showNotification({
      title: 'Transaction Pending',
      message: reqKey,
      type: STATUSES.INFO,
      hideProgressBar: false,
      closeOnClick: false,
    }));
  };

  const storeSlippage = async (slippage) => {
    await setSlippage(slippage);
    await localStorage.setItem('slippage', slippage);
  };

  const setReqKeysLocalStorage = (key) => {
    const swapReqKeysLS = JSON.parse(localStorage.getItem('swapReqKeys'));
    if (!swapReqKeysLS) {
      //first saving swapReqKeys in localstorage
      localStorage.setItem(`swapReqKeys`, JSON.stringify([key]));
    } else {
      swapReqKeysLS.push(key);
      localStorage.setItem(`swapReqKeys`, JSON.stringify(swapReqKeysLS));
    }
  };

  const getSwapList = async () => {
    setSwapList({});
    if (account.account) {
      var reqKeyList = JSON.parse(localStorage.getItem('swapReqKeys'));
      if (reqKeyList) {
        let tx = await Pact.fetch.poll(
          { requestKeys: Object.values(reqKeyList) },
          NETWORK
        );
        if (Object.keys(tx).length !== 0) {
          const searchSwap = Object.values(tx).some(
            (t) =>
              t?.events[3]?.params[0] === account.account.account ||
              t?.events[3]?.params[1] === account.account.account
          );
          if (searchSwap)
            setSwapList(
              Object.values(tx)?.filter(
                (swapTx) =>
                  swapTx?.events[3]?.params[0] === account.account.account ||
                  swapTx?.events[3]?.params[1] === account.account.account
              )
            );
          else setSwapList('NO_SWAP_FOUND');
        } else {
          setSwapList('NO_SWAP_FOUND');
        }
      } else {
        setSwapList('NO_SWAP_FOUND');
      }
    } else {
      setSwapList('NO_SWAP_FOUND');
    }
  };

  useEffect(() => {
    getSwapList();
  }, [account.sendRes, account.account]);

  const fetchAllBalances = async () => {
    let count = 0;
    let endBracket = '';
    let tokenNames = Object.values(tokenData).reduce((accum, cumul) => {
      count++;
      endBracket += ')';
      let code = `
      (let
        ((${cumul.name}
          (try -1 (${cumul.code}.get-balance "${account.account.account}"))
      ))`;
      accum += code;
      return accum;
    }, '');
    let objFormat = `{${Object.keys(tokenData)
      .map((token) => `"${token}": ${token}`)
      .join(',')}}`;
    tokenNames = tokenNames + objFormat + endBracket;
    try {
      let data = await Pact.fetch.local(
        {
          pactCode: tokenNames,
          meta: Pact.lang.mkMeta(
            '',
            CHAIN_ID,
            GAS_PRICE,
            GAS_LIMIT,
            creationTime(),
            600
          ),
        },
        NETWORK
      );
      if (data.result.status === 'success') {
        Object.keys(tokenData).forEach((token) => {
          tokenData[token].balance =
            extractDecimal(data.result.data[token]) === -1
              ? '0'
              : extractDecimal(data.result.data[token]);
        });
        setBalances(true);
      } else {
        setBalances(false);
      }
    } catch (e) {
      console.log(e);
      setBalances(true);
    }
  };

  const fetchPrecision = async () => {
    let count = 0;
    let endBracket = '';
    let tokenNames = Object.values(tokenData).reduce((accum, cumul) => {
      count++;
      endBracket += ')';
      let code = `
      (let
        ((${cumul.name}
          (try -1 (${cumul.code}.precision))
      ))`;
      accum += code;
      return accum;
    }, '');
    let objFormat = `{${Object.keys(tokenData)
      .map((token) => `"${token}": ${token}`)
      .join(',')}}`;
    tokenNames = tokenNames + objFormat + endBracket;
    try {
      let data = await Pact.fetch.local(
        {
          pactCode: tokenNames,
          meta: Pact.lang.mkMeta(
            '',
            CHAIN_ID,
            GAS_PRICE,
            GAS_LIMIT,
            creationTime(),
            600
          ),
        },
        NETWORK
      );
      if (data.result.status === 'success') {
        Object.keys(tokenData).forEach((token) => {
          tokenData[token].precision = extractDecimal(data.result.data[token]);
        });
        setPrecision(true);
      }
    } catch (e) {
      setPrecision(false);

      console.log(e);
    }
  };

  const getPairList = async () => {
    try {
      const tokenPairList = Object.keys(pairList).reduce((accum, pair) => {
        accum += `[${pair.split(':').join(' ')}] `;
        return accum;
      }, '');
      let data = await Pact.fetch.local(
        {
          pactCode: `
            (namespace 'free)

            (module kswap-read G

              (defcap G ()
                true)

              (defun pair-info (pairList:list)
                (let* (
                  (token0 (at 0 pairList))
                  (token1 (at 1 pairList))
                  (p (kswap.exchange.get-pair token0 token1))
                  (reserveA (kswap.exchange.reserve-for p token0))
                  (reserveB (kswap.exchange.reserve-for p token1))
                  (totalBal (kswap.tokens.total-supply (kswap.exchange.get-pair-key token0 token1)))
                )
                [(kswap.exchange.get-pair-key token0 token1)
                 reserveA
                 reserveB
                 totalBal
               ]
              ))
            )
            (map (kswap-read.pair-info) [${tokenPairList}])
             `,
          meta: Pact.lang.mkMeta(
            '',
            CHAIN_ID,
            GAS_PRICE,
            GAS_LIMIT,
            creationTime(),
            600
          ),
        },
        NETWORK
      );
      if (data.result.status === 'success') {
        let dataList = data.result.data.reduce((accum, data) => {
          accum[data[0]] = {
            supply: data[3],
            reserves: [data[1], data[2]],
          };
          return accum;
        }, {});
        const pairList = Object.values(pairTokens).map((pair) => {
          return {
            ...pair,
            ...dataList[pair.name],
          };
        });
        setPairList(pairList);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const wait = async (timeout) => {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  };

  const listen = async (reqKey) => {
    //check kadena tx status every 10 seconds until we get a response (success or fail)
    var time = 240;
    var pollRes;
    while (time > 0) {
      await wait(5000);
      pollRes = await Pact.fetch.poll({ requestKeys: [reqKey] }, NETWORK);
      if (Object.keys(pollRes).length === 0) {
        console.log('no return poll');
        console.log(pollRes);
        time = time - 5;
      } else {
        console.log(pollRes);
        time = 0;
      }
    }
    account.setSendRes(pollRes);
    console.log(reqKey);
    console.log(pollRes);
    console.log(pollRes[reqKey]);
    console.log(pollRes[reqKey].result);
    if (pollRes[reqKey].result.status === 'success') {
      setReqKeysLocalStorage(reqKey);
      notificationContext.showNotification({
        title: 'Transaction Success!',
        message: 'Check it out in the block explorer',
        type: STATUSES.SUCCESS,
        onClose: async () => {
          await toast.dismiss(toastId);
          /* window.location.reload(); */
        },
        onClick: async () => {
          await toast.dismiss(toastId);
          await window.open(
            `https://explorer.chainweb.com/${NETWORK_TYPE}/txdetail/${reqKey}`,
            '_blank',
            'noopener,noreferrer'
          );
        },
        onOpen: async (value) => {
          await toast.dismiss(toastId.current);
        },
      });
    } else {
      notificationContext.showNotification({
        title: 'Transaction Failure!',
        message: 'Check it out in the block explorer',
        type: STATUSES.ERROR,
        onClose: async () => {
          await toast.dismiss(toastId);
          /* window.location.reload(); */
        },
        onClick: async () => {
          await toast.dismiss(toastId);
          await window.open(
            `https://explorer.chainweb.com/${NETWORK_TYPE}/txdetail/${reqKey}`,
            '_blank',
            'noopener,noreferrer'
          );
        },
        onOpen: async (value) => {
          await toast.dismiss(toastId.current);
        },
      });
    }
  };

  const tokens = async (token0, token1, account) => {
    try {
      let data = await Pact.fetch.local(
        {
          pactCode: `
          (kswap.tokens.get-tokens)
           `,
          meta: Pact.lang.mkMeta(
            '',
            CHAIN_ID,
            GAS_PRICE,
            GAS_LIMIT,
            creationTime(),
            600
          ),
        },
        NETWORK
      );
      if (data.result.status === 'success') {
        return data.result.data;
      } else {
        await setPairReserve(null);
        console.log('Failed');
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getTotalTokenSupply = async (token0, token1) => {
    try {
      let data = await Pact.fetch.local(
        {
          pactCode: `(kswap.tokens.total-supply (kswap.exchange.get-pair-key ${token0} ${token1}))`,
          keyPairs: Pact.crypto.genKeyPair(),
          meta: Pact.lang.mkMeta(
            '',
            CHAIN_ID,
            0.01,
            100000000,
            28800,
            creationTime()
          ),
        },
        NETWORK
      );
      if (data.result.status === 'success') {
        if (data.result.data.decimal) setTotalSupply(data.result.data.decimal);
        else setTotalSupply(data.result.data);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getPair = async (token0, token1) => {
    try {
      let data = await Pact.fetch.local(
        {
          pactCode: `(kswap.exchange.get-pair ${token0} ${token1})`,
          keyPairs: Pact.crypto.genKeyPair(),
          meta: Pact.lang.mkMeta(
            '',
            CHAIN_ID,
            GAS_PRICE,
            GAS_LIMIT,
            creationTime(),
            600
          ),
        },
        NETWORK
      );
      if (data.result.status === 'success') {
        setPair(data.result.data);
        return data.result.data;
      } else {
        return null;
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getPairKey = async (token0, token1) => {
    try {
      let data = await Pact.fetch.local(
        {
          pactCode: `(kswap.exchange.get-pair-key ${token0} ${token1})`,
          meta: Pact.lang.mkMeta(
            account.account.account,
            CHAIN_ID,
            GAS_PRICE,
            GAS_LIMIT,
            creationTime(),
            600
          ),
        },
        NETWORK
      );
      if (data.result.status === 'success') {
        return data.result.data;
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getReserves = async (token0, token1) => {
    try {
      let data = await Pact.fetch.local(
        {
          pactCode: `
          (use kswap.exchange)
          (let*
            (
              (p (get-pair ${token0} ${token1}))
              (reserveA (reserve-for p ${token0}))
              (reserveB (reserve-for p ${token1}))
            )[reserveA reserveB])
           `,
          meta: Pact.lang.mkMeta(
            'account',
            CHAIN_ID,
            GAS_PRICE,
            GAS_LIMIT,
            creationTime(),
            600
          ),
        },
        NETWORK
      );
      if (data.result.status === 'success') {
        await setPairReserve({
          token0: data.result.data[0].decimal
            ? data.result.data[0].decimal
            : data.result.data[0],
          token1: data.result.data[1].decimal
            ? data.result.data[1].decimal
            : data.result.data[1],
        });
      } else {
        await setPairReserve({});
      }
    } catch (e) {
      console.log(e);
    }
  };

  const storeTtl = async (ttl) => {
    await setTtl(slippage);
    await localStorage.setItem('ttl', ttl);
  };

  // UTILS

  const getRatio = (toToken, fromToken) => {
    if (toToken === fromToken) return 1;
    return pairReserve['token1'] / pairReserve['token0'];
  };

  const getRatio1 = (toToken, fromToken) => {
    if (toToken === fromToken) return 1;
    return pairReserve['token0'] / pairReserve['token1'];
  };

  const share = (amount) => {
    return Number(amount) / (Number(pairReserve['token0']) + Number(amount));
  };

  //COMPUTE_OUT
  var computeOut = function (amountIn) {
    let reserveOut = Number(pairReserve['token1']);
    let reserveIn = Number(pairReserve['token0']);
    let numerator = Number(amountIn * (1 - FEE) * reserveOut);
    let denominator = Number(reserveIn + amountIn * (1 - FEE));
    return numerator / denominator;
  };

  //COMPUTE_IN
  var computeIn = function (amountOut) {
    let reserveOut = Number(pairReserve['token1']);
    let reserveIn = Number(pairReserve['token0']);
    let numerator = Number(reserveIn * amountOut);
    let denominator = Number((reserveOut - amountOut) * (1 - FEE));
    // round up the last digit
    return numerator / denominator;
  };

  function computePriceImpact(amountIn, amountOut) {
    const reserveOut = Number(pairReserve['token1']);
    const reserveIn = Number(pairReserve['token0']);
    const midPrice = reserveOut / reserveIn;
    const exactQuote = amountIn * midPrice;
    const slippage = (exactQuote - amountOut) / exactQuote;
    return slippage;
  }

  function priceImpactWithoutFee(priceImpact) {
    return priceImpact - realizedLPFee();
  }

  function realizedLPFee(numHops = 1) {
    return 1 - (1 - FEE) * numHops;
  }

  const contextValues = {
    slippage,
    setSlippage,
    storeSlippage,
    ttl,
    setTtl,
    storeTtl,
    precision,
    setPrecision,
    fetchPrecision,
    balances,
    setBalances,
    fetchAllBalances,
    pairList,
    setPairList,
    getPairList,
    swapList,
    getSwapList,
    totalSupply,
    getTotalTokenSupply,
    listen,
    polling,
    setPolling,
    pollingNotif,
    ratio,
    getRatio,
    getRatio1,
    share,
    pair,
    setPair,
    getPair,
    getPairKey,
    getReserves,
    tokens,
    computePriceImpact,
    priceImpactWithoutFee,
    computeOut,
    computeIn,
  };
  return (
    <PactContext.Provider value={contextValues}>
      {props.children}
    </PactContext.Provider>
  );
};

export const PactConsumer = PactContext.Consumer;
