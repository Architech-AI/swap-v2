import React, { useContext } from 'react';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from './styles/globalStyle';
import Router from './router/router';
import NotificationRender from './components/notification/NotificationRender';
import { theme } from './styles/theme';
import { AccountProvider } from './contexts/AccountContext';
import { WalletProvider } from './contexts/WalletContext';
import { PactProvider } from './contexts/PactContext';
import ModalRender from './components/modals/ModalRender';
import RightModalRender from './components/right-modal-notification/RightModalRender';
import { SwapProvider } from './contexts/SwapContext';
import { LiquidityProvider } from './contexts/LiquidityContext';
import { GameEditionProvider } from './contexts/GameEditionContext';
import { LightModeContext, LightModeProvider, useLightMode } from './contexts/LightModeContext';
import { KadenaWalletProvider } from './contexts/KadenaWalletContext';

function App() {
  const { themeMode } = useContext(LightModeContext);

  return (
    <ThemeProvider theme={theme(themeMode)}>
      <GlobalStyle />
      <GameEditionProvider>
        <NotificationRender>
          <AccountProvider>
            <WalletProvider>
              <PactProvider>
                <KadenaWalletProvider>
                  <SwapProvider>
                    <LiquidityProvider>
                      <RightModalRender>
                        <ModalRender>
                          <Router />
                        </ModalRender>
                      </RightModalRender>
                    </LiquidityProvider>
                  </SwapProvider>
                </KadenaWalletProvider>
              </PactProvider>
            </WalletProvider>
          </AccountProvider>
        </NotificationRender>
      </GameEditionProvider>
    </ThemeProvider>
  );
}

export default App;
