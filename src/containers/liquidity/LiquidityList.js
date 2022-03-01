import React, { useEffect, useContext } from "react";
import styled from "styled-components/macro";
import { Loader, Button, Header } from "semantic-ui-react";

import CustomButton from "../../shared/CustomButton";
import TokenPair from "./TokenPair";

import { LiquidityContext } from "../../contexts/LiquidityContext";
import { AccountContext } from "../../contexts/AccountContext";
import theme from "../../styles/theme";
import ModalContainer from "../../shared/ModalContainer";
import reduceToken from "../../utils/reduceToken";
import ConnectWalletModal from "../../components/modals/kdaModals/ConnectWalletModal";
import { ModalContext } from "../../contexts/ModalContext";

const Container = styled.div`
  display: flex;
  margin-top: 24px;
  margin-left: auto;
  margin-right: auto;
`;

const TextContainer = styled.div`
  display: flex;
  flex-flow: column;
  align-items: left;
  justify-content: flex-start;
  width: 100%;

  @media (max-width: ${({ theme: { mediaQueries } }) =>
      `${mediaQueries.mobilePixel + 1}px`}) {
    display: table;
  }
`;

const BottomContainer = styled.div`
  display: flex;
  flex-flow: column;
  align-items: left;
  justify-content: flex-start;
  width: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-flow: row;
  justify-content: center;
  margin-right: 2px;
  width: 100%;
  @media (max-width: ${({ theme: { mediaQueries } }) =>
      `${mediaQueries.mobilePixel + 1}px`}) {
    flex-flow: column;
  }
`;

const FormContainer = styled.div`
  display: table;
  flex-flow: column;
  padding: 20px 20px;
  margin-bottom: 15px;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  border: 2px solid #ffffff;
  box-shadow: 0 0 5px #ffffff;
  opacity: 1;
  background: transparent;

  @media (max-width: ${({ theme: { mediaQueries } }) =>
      `${mediaQueries.mobilePixel + 1}px`}) {
    flex-flow: column;
    display: table;
  }
  @media (max-width: ${({ theme: { mediaQueries } }) =>
      `${mediaQueries.mobileSmallPixel}px`}) {
    padding: 0;
  }
`;

const TopContainer = styled.div``;

const LiquidityList = (props) => {
  const modalContext = useContext(ModalContext);
  const liquidity = useContext(LiquidityContext);
  const { account } = useContext(AccountContext);

  useEffect(async () => {
    liquidity.getPairListAccountBalance(account.account);
  }, [account.account]);

  return (
    <Container>
      <ModalContainer
        containerStyle={{
          maxHeight: "80vh",
          maxWidth: 900,
          overflow: "auto",
          border: "none",
          boxShadow: "none",
          background: "none",
        }}
      >
        <TextContainer
          style={{
            marginBottom: 30,
            background: "transparent",
            color: "#FFFFFF",
          }}
        >
          <h1
            style={{
              fontSize: 24,
              textAlign: "left !important",
              fontFamily: theme.fontFamily.bold,
            }}
          >
            Liquidity provider rewards
          </h1>
          <p style={{ fontSize: 16 }}>
            Liquidity providers earn a 0.25% fee back and 0.05% goes to stakers
            on all trades proportional to their share of the pool.
            <br />
            Fees are added to the pool, accrue in real time and can be claimed
            by withdrawing your liquidity.
          </p>
        </TextContainer>
        {account.account !== null ? (
          <BottomContainer>
            <TopContainer>
              <Header
                style={{
                  fontSize: 32,
                  textAlign: "left ",
                  color: "#FFFFFF",
                  fontFamily: theme.fontFamily.bold,
                }}
              >
                Your Liquidity
              </Header>
              <ButtonContainer style={{ marginBottom: "30px" }}>
                <Button.Group fluid>
                  <CustomButton
                    disabled
                    buttonStyle={{
                      marginRight: "15px",
                      borderRadius: "20px",
                      width: "48%",
                    }}
                    onClick={() => props.selectCreatePair()}
                  >
                    Create a pair
                  </CustomButton>
                  <CustomButton
                    buttonStyle={{
                      marginLeft: "-5px",
                      borderRadius: "20px",
                      width: "48%",
                    }}
                    onClick={() => props.selectAddLiquidity()}
                  >
                    Add Liquidity
                  </CustomButton>
                </Button.Group>
              </ButtonContainer>
            </TopContainer>
            {account.account !== null ? (
              liquidity.pairListAccount[0] ? (
                Object.values(liquidity.pairListAccount).map((pair, index) => {
                  return pair && pair.balance ? (
                    <FormContainer key={index}>
                      <TokenPair
                        key={pair.name}
                        pair={pair}
                        selectAddLiquidity={props.selectAddLiquidity}
                        selectRemoveLiquidity={props.selectRemoveLiquidity}
                        setTokenPair={props.setTokenPair}
                      />
                    </FormContainer>
                  ) : (
                    <></>
                  );
                })
              ) : (
                <FormContainer>
                  <Loader active inline="centered" style={{ color: "#FFFFFF" }}>
                    Loading..
                  </Loader>
                </FormContainer>
              )
            ) : (
              <></>
            )}
          </BottomContainer>
        ) : (
          <CustomButton
            hover={true}
            buttonStyle={{
              padding: "10px 16px",
              width: "214px",
              height: "40px",
            }}
            fontSize={14}
            onClick={() =>
              modalContext.openModal({
                title: account?.account ? "wallet connected" : "connect wallet",
                description: account?.account
                  ? `Account ID: ${reduceToken(account.account)}`
                  : "Connect a wallet using one of the methods below",
                content: <ConnectWalletModal />,
              })
            }
          >
            Connect Wallet
          </CustomButton>
        )}
      </ModalContainer>
    </Container>
  );
};

export default LiquidityList;
