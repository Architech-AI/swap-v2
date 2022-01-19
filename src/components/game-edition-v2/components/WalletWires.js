import React, { useContext, useEffect, useState } from 'react';
import styled, { css } from 'styled-components/macro';
import { useAccountContext, useWalletContext } from '../../../contexts';
import { GameEditionContext, WIRE_CONTAINER_WIDTH } from '../../../contexts/GameEditionContext';
import { FadeIn } from '../../shared/animations';
import { HideWiresIcon } from '../../../assets';
import { WALLET } from '../../../constants/wallet';

const WiresContainer = styled.div`
  display: flex;
  align-items: flex-end;
  position: relative;
  width: ${WIRE_CONTAINER_WIDTH}px;
  padding: 0 50px;
  justify-content: space-between;
`;

const HideWiresContainer = styled.div`
  position: absolute;
  z-index: 10;
  left: 50%;
  transform: translate(-50%, 0px);
  cursor: pointer;
`;

const DisconnectButton = styled(HideWiresContainer)`
  background-color: #000000;
  border-radius: 40px;
  padding: 10px 50px;
  transition: transform 0.5s;
  transform: ${({ showWires, selectedWire }) => (!showWires && selectedWire ? 'translate(-50%, 0px)' : 'translate(-50%, 700px)')};

  span {
    color: #ffffff;
    font-size: 13px;
    font-weight: 700;
  }
`;

const ConnectionWireContainer = styled.div`
  display: flex;
  position: relative;
  z-index: 1;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  flex-direction: column;
  align-items: center;
  svg {
    margin-top: 20px;
  }
  span {
    transition: opacity 1s;

    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: 23px;
    letter-spacing: 0em;
    text-align: left;
    color: ${({ theme: { colors } }) => colors.white};

    ${({ selectedWire }) => {
      if (selectedWire) {
        return css`
          opacity: 0;
        `;
      }
    }}
  }

  ${({ isSelected, translateX, $scale }) => {
    if (isSelected) {
      let animation = '';
      if ($scale) {
        animation = `translate(${translateX}px, -236px) scale(1.2)`;
      } else {
        animation = `translate(${translateX}px, -260px)`;
      }
      return css`
        transition: transform 0.5s;
        transform: ${animation};
      `;
    } else {
      return css`
        transition: transform 0.3s;
        :hover {
          transform: scale(1.3);
        }
      `;
    }
  }}
`;

const BlurWire = styled(FadeIn)`
  position: absolute;
  filter: blur(16px);
  z-index: -1;
`;

export const ConnectionWire = ({ scale, wire, containerStyle, onClick }) => {
  const { selectedWire, showWires } = useContext(GameEditionContext);
  const { account } = useAccountContext();

  const [translateX, setTranslateX] = useState(0);
  useEffect(() => {
    if (selectedWire) {
      const wireElement = document.getElementById(selectedWire.id);

      setTranslateX((WIRE_CONTAINER_WIDTH - 50) / 2 - wireElement.offsetLeft - wireElement.offsetWidth / 2 + 20);
    }
  }, [selectedWire]);
  return (
    <ConnectionWireContainer
      id={wire.id}
      style={containerStyle}
      translateX={translateX}
      onClick={onClick}
      isSelected={selectedWire?.id === wire.id}
      selectedWire={selectedWire}
      $scale={scale}
    >
      <span>{wire.name}</span>
      {wire.wireIcon}
      {account?.account && !showWires && <BlurWire>{wire.wireIcon}</BlurWire>}
    </ConnectionWireContainer>
  );
};

const WalletWires = ({ scale }) => {
  const { wallet } = useWalletContext();
  const { showWires, onWireSelect, selectedWire } = useContext(GameEditionContext);
  const { logout } = useAccountContext();

  return (
    <WiresContainer showWires={showWires}>
      {showWires && (
        <HideWiresContainer
          style={{ bottom: 30 }}
          onClick={() => {
            let oldWire = null;
            if (wallet?.id) {
              oldWire = WALLET[wallet.id];
            }
            onWireSelect(oldWire);
          }}
        >
          <HideWiresIcon />
        </HideWiresContainer>
      )}

      <DisconnectButton
        showWires={showWires}
        selectedWire={selectedWire}
        style={{ top: -77 }}
        onClick={() => {
          let oldWire = null;
          if (wallet && selectedWire && wallet?.id !== selectedWire?.id) {
            oldWire = WALLET[wallet.id];
          } else {
            logout();
          }
          onWireSelect(oldWire);
        }}
      >
        <span>Disconnect</span>
      </DisconnectButton>

      {[WALLET.KADDEX_WALLET, WALLET.ZELCORE, WALLET.CHAINWEAVER, WALLET.TORUS].map((wire, i) => (
        <ConnectionWire key={i} scale={scale} wire={wire} onClick={selectedWire ? null : () => onWireSelect(wire)} />
      ))}
    </WiresContainer>
  );
};
export default WalletWires;
