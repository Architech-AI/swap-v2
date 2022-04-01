import { useContext } from 'react';
import { KaddexWalletContext } from './KaddexWalletContext';
import { PactContext } from './PactContext';
import { SwapContext } from './SwapContext';
import { AccountContext } from './AccountContext';
import { ModalContext } from './ModalContext';
import { WalletContext } from './WalletContext';
import { NotificationContext } from './NotificationContext';
import { LiquidityContext } from './LiquidityContext';

export function useKaddexWalletContext() {
  return useContext(KaddexWalletContext);
}
export function useSwapContext() {
  return useContext(SwapContext);
}
export function useAccountContext() {
  return useContext(AccountContext);
}
export function useModalContext() {
  return useContext(ModalContext);
}
export function useWalletContext() {
  return useContext(WalletContext);
}
export function useNotificationContext() {
  return useContext(NotificationContext);
}
export function usePactContext() {
  return useContext(PactContext);
}
export function useLiquidityContext() {
  return useContext(LiquidityContext);
}
