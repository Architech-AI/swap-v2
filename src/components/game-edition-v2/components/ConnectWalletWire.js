import React, { useContext } from 'react';
import styled from 'styled-components/macro';
import { useLocation } from 'react-router-dom';
import { ROUTE_GAME_START_ANIMATION } from '../../../router/routes';
import { FadeIn } from '../../shared/animations';
import { ConnectWalletIcon, WireConnectionLightIcon, WireConnectionDarkIcon } from '../../../assets';
import { GameEditionContext, SCALED_VALUE } from '../../../contexts/GameEditionContext';
import { useLightModeContext } from '../../../contexts';

const WireConnectionContainer = styled.div`
  margin-top: calc(8 * ${SCALED_VALUE}px);
  width: 100%;
  height: calc(161 * ${SCALED_VALUE}px);
  display: flex;
  justify-content: center;
  position: relative;
  transition: transform 0.5s;
  transform: ${({ showWires }) => (showWires ? 'translateY(700px)' : 'translateY(0)')};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  z-index: 10;
  svg {
    height: 100%;
  }
`;

const ConnectWalletContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(${SCALED_VALUE});
`;

const ConnectWalletWire = ({ onClick }) => {
  const location = useLocation();
  const { themeMode } = useLightModeContext();
  const { showWires, selectedWire } = useContext(GameEditionContext);

  return (
    <WireConnectionContainer
      showWires={showWires}
      onClick={selectedWire || location.pathname === ROUTE_GAME_START_ANIMATION ? null : () => onClick()}
    >
      {location?.pathname !== ROUTE_GAME_START_ANIMATION && !selectedWire && (
        <FadeIn>
          {themeMode === 'light' ? <WireConnectionDarkIcon /> : <WireConnectionLightIcon />}
          <ConnectWalletContainer>
            <ConnectWalletIcon />
          </ConnectWalletContainer>
        </FadeIn>
      )}
    </WireConnectionContainer>
  );
};

export default ConnectWalletWire;
