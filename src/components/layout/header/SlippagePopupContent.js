import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { PactContext } from '../../../contexts/PactContext';
import Input from '../../../shared/Input';
import ThemeToggle from '../../../styles/lightmode/ThemeToggle';
import { LightModeContext } from '../../../contexts/LightModeContext';
import { theme } from '../../../styles/theme';
import { GameEditionContext } from '../../../contexts/GameEditionContext';
import LightModeToggle from '../../../shared/LightModeToggle';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 16px;
  background: transparent;
`;

const BoldLabel = styled.span`
  font-size: 13px;
  font-family: ${({ theme: { fontFamily } }) => fontFamily.bold} !important;
  text-transform: capitalize;
`;

const RegularLabel = styled.span`
  font-size: 13px;
  font-family: ${({ theme: { fontFamily } }) => fontFamily.regular};
  text-transform: capitalize;
  color: ${({ theme: { colors } }) => colors.white};
`;

const SlippageTolleranceValue = styled.div`
  border-radius: 16px;
  border: ${({ theme: { colors } }) => `1px solid ${colors.white}`};
  /* box-shadow: ${({ isSelected, theme: { colors } }) => (isSelected ? `0 0 5px ${colors.white};` : 'none')}; */
  color: ${({ isSelected, theme: { colors } }) => (isSelected ? colors.primary : colors.white)};
  /* text-shadow: ${({ isSelected, theme: { colors } }) => (isSelected ? `0 0 5px ${colors.white};` : 'none')}; */
  font-family: ${({ isSelected, theme: { fontFamily } }) => (isSelected ? fontFamily.bold : fontFamily.regular)};
  font-size: 14px;
  padding: 6.5px 8.5px;
  min-width: 48px;
  display: flex;
  justify-content: center;
  background-color: ${({ isSelected, theme: { colors } }) => isSelected && colors.white};
  cursor: pointer;
`;

const ContainerInputTypeNumber = styled.div`
  display: flex;
  align-items: center;
  padding: 6.5px 8.5px;
  border-radius: 16px;
  border: ${({ theme: { colors } }) => `1px solid ${colors.white}`};
  color: ${({ theme: { colors } }) => colors.white};
  .ui.input > input {
    border: unset;
    padding: 0px;
    text-align: right;
    font-size: 14px;
  }
  .ui.fluid.input > input {
    width: 80px !important;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;

  .restrictedInput {
    @media (max-width: ${({ theme: { mediaQueries } }) => `${mediaQueries.mobilePixel + 1}px`}) {
      .ui.fluid.input > input {
        width: 30px !important;
      }
    }
  }
`;

const SlippagePopupContent = () => {
  const pact = useContext(PactContext);
  const { gameEditionView } = useContext(GameEditionContext);
  const { themeMode, themeToggler } = useContext(LightModeContext);
  const [slp, setSlp] = useState(pact.slippage * 100);
  const [tl, setTl] = useState(pact.ttl * 60);
  useEffect(() => {
    if (slp) (async () => pact.storeSlippage(slp / 100))();
  }, [slp]);
  useEffect(() => {
    if (tl) (async () => pact.storeTtl(tl / 60))();
  }, [tl]);
  return (
    <Container>
      <BoldLabel style={{ color: theme(themeMode).colors.white }}>Transactions Settings</BoldLabel>
      {!gameEditionView && (
        <Row style={{ marginTop: 16 }}>
          <LightModeToggle />
          {/* <RegularLabel style={{ marginRight: 8 }}>Light Mode</RegularLabel>

          <ThemeToggle theme={themeMode} onClick={() => themeToggler()} /> */}
        </Row>
      )}

      <RegularLabel style={{ marginTop: 16 }}>Slippage Tolerance</RegularLabel>

      <Row style={{ marginTop: 8 }}>
        <SlippageTolleranceValue isSelected={slp === 0.1} onClick={() => setSlp(0.1)}>
          0.1%
        </SlippageTolleranceValue>
        <SlippageTolleranceValue isSelected={slp === 0.5} style={{ marginLeft: 4, marginRight: 4 }} onClick={() => setSlp(0.5)}>
          0.5%
        </SlippageTolleranceValue>
        <SlippageTolleranceValue isSelected={slp === 1} style={{ marginRight: 8 }} onClick={() => setSlp(1)}>
          1%
        </SlippageTolleranceValue>

        <ContainerInputTypeNumber className="restrictedInput">
          <Input
            noInputBackground
            outGameEditionView
            containerStyle={{
              border: 'none ',
              boxShadow: 'none !important',
              padding: '0px'
            }}
            placeholder={slp}
            numberOnly
            value={slp}
            onChange={(e, { value }) => {
              if (value >= 0 && value <= 100) {
                setSlp(value);
              }
            }}
          />
          %
        </ContainerInputTypeNumber>
      </Row>

      <RegularLabel style={{ marginTop: 16 }}>Transaction deadline</RegularLabel>
      <Row style={{ marginTop: 8 }}>
        <ContainerInputTypeNumber>
          <Input
            noInputBackground
            outGameEditionView
            containerStyle={{
              border: 'none',
              boxShadow: 'none !important',
              padding: '0px'
            }}
            placeholder={tl}
            numberOnly
            value={tl}
            onChange={(e, { value }) => {
              if (value >= 0) {
                setTl(value);
              }
            }}
          />
        </ContainerInputTypeNumber>
        <RegularLabel style={{ color: theme(themeMode).colors.white, marginLeft: 8 }}>minutes</RegularLabel>
      </Row>
    </Container>
  );
};

export default SlippagePopupContent;
