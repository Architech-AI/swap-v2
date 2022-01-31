/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components/macro';
import { PactContext } from '../../../contexts/PactContext';
import { GameEditionContext } from '../../../contexts/GameEditionContext';
import Input from '../../../components/shared/Input';
import LightModeToggle from '../../../components/shared/LightModeToggle';
import Label from '../../shared/Label';
import GradientContainer from '../../shared/GradientContainer';
import browserDetection from '../../../utils/browserDetection';
import { useOnClickOutside } from '../../../hooks/useOnClickOutside';
import { CogIcon } from '../../../assets';

const PopupContainer = styled(GradientContainer)`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
  border-radius: 10px;
  background: ${({ theme: { backgroundContainer } }) => backgroundContainer};
  position: absolute;

  right: 4px;
  top: 50px;
  &.header-item {
    top: 40px;
  }
  ${({ themeMode }) => {
    if ((browserDetection() === 'BRAVE' || browserDetection() === 'FIREFOX') && themeMode === 'dark') {
      return css`
        background: ${({ theme: { colors } }) => colors.primary};
      `;
    }
  }}
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  background: transparent;
`;

const SlippageTolleranceValue = styled.div`
  border-radius: 16px;
  border: ${({ theme: { colors } }) => `1px solid ${colors.white}`};
  color: ${({ isSelected, theme: { colors } }) => (isSelected ? colors.primary : colors.white)};
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
  height: 35px;
  justify-content: center;
  padding: 0px 8.5px;
  border-radius: 16px;
  border: ${({ theme: { colors } }) => `1px solid ${colors.white}`};
  color: ${({ theme: { colors } }) => colors.white};
  .ui.input > input {
    border: unset;
    padding: 0px;
    text-align: right;
    font-size: 14px;
    margin: 0px;
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

const SlippagePopupContent = ({ className }) => {
  const pact = useContext(PactContext);
  const { gameEditionView } = useContext(GameEditionContext);
  const [showSplippageContent, setShowSlippageContent] = useState(false);

  const ref = useRef();
  useOnClickOutside(ref, () => setShowSlippageContent(false));

  const [slp, setSlp] = useState(pact.slippage * 100);
  const [tl, setTl] = useState(pact.ttl * 60);
  useEffect(() => {
    if (slp) (async () => pact.storeSlippage(slp / 100))();
  }, [slp]);
  useEffect(() => {
    if (tl) (async () => pact.storeTtl(tl / 60))();
  }, [tl]);
  return (
    <div ref={ref} style={{ height: '100%', display: 'flex', position: 'relative' }}>
      <CogIcon onClick={() => setShowSlippageContent((prev) => !prev)} />
      {showSplippageContent && (
        <PopupContainer className={className} style={{ width: 'unset' }}>
          <Container>
            <Label outGameEditionView fontSize={13} fontFamily="bold">
              Transactions Settings
            </Label>
            {!gameEditionView && (
              <Row style={{ marginTop: 16 }}>
                <LightModeToggle />
              </Row>
            )}

            <Label outGameEditionView fontSize={13} labelStyle={{ marginTop: 16 }}>
              Slippage Tolerance
            </Label>

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
                    padding: '0px',
                    margin: 0,
                  }}
                  placeholder={`${slp}`}
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

            <Label fontSize={13} outGameEditionView labelStyle={{ marginTop: 16 }}>
              Transaction deadline
            </Label>
            <Row style={{ marginTop: 8 }}>
              <ContainerInputTypeNumber>
                <Input
                  outGameEditionView
                  noInputBackground
                  containerStyle={{
                    border: 'none',
                    boxShadow: 'none !important',
                    padding: '0px',
                  }}
                  placeholder={`${tl}`}
                  numberOnly
                  value={tl}
                  onChange={(e, { value }) => {
                    if (value >= 0) {
                      setTl(value);
                    }
                  }}
                />
              </ContainerInputTypeNumber>
              <Label fontSize={13} outGameEditionView labelStyle={{ marginLeft: 8 }}>
                minutes
              </Label>
            </Row>
          </Container>
        </PopupContainer>
      )}
    </div>
  );
};

export default SlippagePopupContent;
