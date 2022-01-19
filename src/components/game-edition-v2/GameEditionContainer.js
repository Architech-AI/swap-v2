import React, { useContext, useEffect } from 'react';
import styled, { css } from 'styled-components/macro';
import { GameEditionContext } from '../../contexts/GameEditionContext';
import { useAccountContext, useKaddexWalletContext, useNotificationContext, useWalletContext } from '../../contexts';
import { STATUSES } from '../../contexts/NotificationContext';
import useWindowSize from '../../hooks/useWindowSize';
import WalletWires from './components/WalletWires';
import ConnectWalletWire from './components/ConnectWalletWire';
import GameEditionModalsContainer from './GameEditionModalsContainer';
import gameboyDesktop from '../../assets/images/game-edition/gameboy-desktop.png';
import gameboyMobile from '../../assets/images/game-edition/gameboy-mobile.png';
import { KaddexLogo } from '../../assets';
import theme from '../../styles/theme';
import { WALLET } from '../../constants/wallet';
import ConnectWalletZelcoreModal from '../modals/kdaModals/ConnectWalletZelcoreModal';
import ConnectWalletTorusModal from '../modals/kdaModals/ConnectWalletTorusModal';
import ConnectWalletChainweaverModal from '../modals/kdaModals/ConnectWalletChainweaverModal';
import { FadeIn } from '../shared/animations';
import GameEditionButtons from './components/PressedButton';
import { useLocation } from 'react-router-dom';
import { ROUTE_GAME_EDITION_MENU, ROUTE_GAME_START_ANIMATION } from '../../router/routes';

const DesktopMainContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: ${({ theme: { header } }) => `calc(100% - ${header.height}px)`};
  align-items: center;
  transition: transform 0.5s;
  transform: ${({ showWires, selectedWire, showTokens, $scale }) => {
    if (showTokens) {
      return $scale ? 'translate(-600px, 532px)' : 'translate(-600px, 560px)';
    }
    if (showWires && !selectedWire && !showTokens) {
      return $scale ? 'translateY(532px)' : 'translateY(0px)';
    } else {
      return $scale ? 'translateY(442px)' : 'translateY(442px)';
    }
  }};
  opacity: ${({ showTokens }) => (showTokens ? 0.5 : 1)};
`;

const MobileMainContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  height: ${({ theme: { header } }) => `calc(100% - ${header.height}px)`};
  align-items: center;
  overflow: hidden;
`;

const GameboyDesktopContainer = styled.div`
  transition: all 0.5s;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  ${({ $scale }) => {
    if ($scale) {
      return css`
        height: 691px;
        width: 1190px;
      `;
    }
    return css`
      height: 540px;
      width: 930px;
    `;
  }}
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;
  z-index: 2;
  .kaddex-logo {
    margin-top: 20px;
    margin-left: 24px;
    svg {
      height: 14.5px;
    }
  }
  opacity: ${({ showWires, showTokens }) => (showWires || showTokens ? 0.5 : 1)};
`;
const GameboyMobileContainer = styled.div`
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  height: 540px;
  width: 930px;
  display: flex;
  align-items: center;
  flex-direction: column;
  transition: all 1s ease-in-out;
  transition-delay: 1s;
  .kaddex-logo {
    margin-top: 8px;
    svg {
      height: 6px;
    }
    margin-left: 24px;
    margin-top: 8px;
    svg {
      height: 6px;
    }
  }
`;

const DisplayContent = styled.div`
  transition: all 0.5s;
  ${({ $scale }) => {
    if ($scale) {
      return css`
        width: 574px;
        height: 421px;
        margin-top: 118px;
      `;
    }
    return css`
      width: 446px;
      height: 329px;
      margin-top: 90px;
    `;
  }}

  margin-left: 14px;
  background: rgba(0, 0, 0, 0.02);
  box-shadow: inset 0px 0px 20px rgba(0, 0, 0, 0.75);
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 19px;
  & > *:first-child {
    border-radius: 19px;
  }

  @media (max-width: ${({ theme: { mediaQueries } }) => `${mediaQueries.desktopPixel - 1}px`}) {
    width: 253px;
    height: 310px;
    margin-left: 5px;
    margin-top: 53px;
    border-radius: 6px;
    & > *:first-child {
      border-radius: 6px;
    }
  }
`;

const SearchTokenList = styled(FadeIn)`
  height: fit-content;
  color: #ffff;
`;

const B = styled.div`
  /* background: green; */
  transition: all 0.5s;
  /* height: auto; */

  ${({ $scale }) => {
    if ($scale) {
      return css`
        transform: translateY(532px);
      `;
    }
    return css`
      transform: translateY(442px);
    `;
  }}
`;

const Box = styled.div`
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  transition: all 0.5s;
  ${({ $scale }) => {
    if ($scale) {
      return css`
        height: 691px;
        width: 1190px;
      `;
    }
    return css`
      height: 540px;
      width: 930px;
    `;
  }}
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;
  z-index: 2;
  .kaddex-logo {
    margin-top: 20px;
    margin-left: 24px;
    svg {
      height: 14.5px;
    }
  }
  opacity: ${({ showWires, showTokens }) => (showWires || showTokens ? 0.5 : 1)};
`;
const GameEditionContainer = ({ children }) => {
  const location = useLocation();
  const [width] = useWindowSize();
  const { showNotification } = useNotificationContext();
  const { initializeKaddexWallet, isInstalled } = useKaddexWalletContext();
  const { wallet, signingWallet, setSelectedWallet } = useWalletContext();

  const { showWires, setShowWires, selectedWire, openModal, modalState, closeModal, onWireSelect, showTokens, setShowTokens, setButtons } =
    useContext(GameEditionContext);
  const { account } = useAccountContext();

  // const switchAppSection = (direction) => {
  //   let cur = history.location.pathname;
  //   if (direction === 'left') {
  //     let prevPage = menuItems.findIndex((path) => path.route === cur) - 1;
  //     if (prevPage < 0) history.push(menuItems[menuItems.length - 1].route);
  //     else return history.push(menuItems[prevPage].route);
  //   }
  //   if (direction === 'right') {
  //     let nextPage = menuItems.findIndex((path) => path.route === cur) + 1;
  //     if (nextPage > menuItems.length - 1) history.push(menuItems[0]?.route);
  //     else return history.push(menuItems[nextPage].route);
  //   }
  // };

  const onConnectionSuccess = async (wallet) => {
    await signingWallet();
    await setSelectedWallet(wallet);
    closeModal();
    showNotification({
      title: `${wallet.name}  was successfully connected`,
      type: 'game-edition',
      icon: wallet.notificationLogo,
      closeButton: false,
      titleStyle: { fontSize: 13 },
      autoClose: 3000,
    });
  };

  const onCloseModal = () => {
    closeModal();
    if (!account.account) {
      onWireSelect(null);
    }
  };

  const getWalletModal = (walletName) => {
    switch (walletName) {
      default:
        return <div />;
      case WALLET.ZELCORE.name:
        return openModal({
          title: WALLET.ZELCORE.name.toUpperCase(),
          onClose: () => {
            onCloseModal();
          },
          content: <ConnectWalletZelcoreModal onConnectionSuccess={async () => await onConnectionSuccess(WALLET.ZELCORE)} />,
        });

      case WALLET.TORUS.name:
        return openModal({
          title: WALLET.TORUS.name.toUpperCase(),
          onClose: () => {
            onCloseModal();
          },
          content: <ConnectWalletTorusModal onConnectionSuccess={async () => await onConnectionSuccess(WALLET.TORUS)} />,
        });

      case WALLET.CHAINWEAVER.name:
        return openModal({
          title: WALLET.CHAINWEAVER.name.toUpperCase(),
          onClose: () => {
            onCloseModal();
          },
          content: <ConnectWalletChainweaverModal onConnectionSuccess={async () => await onConnectionSuccess(WALLET.CHAINWEAVER)} />,
        });

      case WALLET.KADDEX_WALLET.name:
        if (!isInstalled) {
          showNotification({
            title: 'Wallet not found',
            message: `Please install ${WALLET.KADDEX_WALLET.name}`,
            type: STATUSES.WARNING,
          });
        } else {
          initializeKaddexWallet(async () => await onConnectionSuccess(WALLET.KADDEX_WALLET));
          closeModal();
        }
        break;
    }
  };

  useEffect(() => {
    if ((selectedWire && !account.account) || (selectedWire && selectedWire?.id !== wallet?.id)) {
      getWalletModal(selectedWire.name);
    } else {
      closeModal();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWire, account.account]);

  const scale =
    location.pathname !== ROUTE_GAME_EDITION_MENU && location.pathname !== ROUTE_GAME_START_ANIMATION && !showWires && account?.account
      ? true
      : false;

  return width < theme.mediaQueries.desktopPixel ? (
    <MobileMainContainer>
      <GameboyMobileContainer style={{ backgroundImage: `url(${gameboyMobile})` }}>
        <DisplayContent>{children}</DisplayContent>
        <div className="kaddex-logo">
          <KaddexLogo />
        </div>
      </GameboyMobileContainer>
    </MobileMainContainer>
  ) : (
    <DesktopMainContainer
      showWires={showWires}
      selectedWire={selectedWire}
      showTokens={showTokens}
      $scale={scale}
      style={{ justifyContent: 'flex-end' }}
    >
      <div style={{ display: 'flex' }}>
        <GameboyDesktopContainer $scale={scale} showWires={showWires} style={{ backgroundImage: `url(${gameboyDesktop})` }}>
          <GameEditionButtons scale={scale} />
          <DisplayContent $scale={scale}>
            {children}
            {modalState.open && (
              <GameEditionModalsContainer
                hideOnClose={modalState.hideOnClose}
                title={modalState.title}
                description={modalState.description}
                content={modalState.content}
                onClose={modalState.onClose}
              />
            )}
          </DisplayContent>
          <div className="kaddex-logo">
            <KaddexLogo />
          </div>
        </GameboyDesktopContainer>
        {showTokens && (
          <SearchTokenList>
            tokens list<button onClick={() => setShowTokens(false)}>X</button>
          </SearchTokenList>
        )}
      </div>
      <ConnectWalletWire onClick={() => setShowWires(true)} />
      <WalletWires scale={scale} />
    </DesktopMainContainer>
  );
};

export default GameEditionContainer;
