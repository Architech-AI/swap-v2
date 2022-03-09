import React from 'react';
import styled from 'styled-components/macro';
import RightHeaderItems from './RightHeaderItems';
import PopupContentList from './PopupContentList';
import HeaderItem from '../../../components/shared/HeaderItem';
import { HamburgerIcon, KaddexLetterLogo } from '../../../assets';
import menuItems from '../../menuItems';
import { useHistory } from 'react-router';
import { ROUTE_SWAP } from '../../../router/routes';

const Container = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: start;
  min-height: ${({ theme: { header } }) => `${header.mobileHeight}px`};
  width: 100%;
  padding: ${({ theme: { layout } }) => `0 ${layout.mobilePadding}px`};

  padding-top: 16px;
`;
const RowContainer = styled.div`
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const LeftContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 25px;
  & > *:not(:last-child) {
    margin-right: 24px;
  }

  @media (max-width: ${({ theme: { mediaQueries } }) => `${mediaQueries.mobileSmallPixel}px`}) {
    margin-right: 10px;
    & > *:not(:last-child) {
      margin-right: 10px;
    }
  }
`;

const RightContainer = styled.div`
  display: flex;
`;

const MobileHeader = ({ className }) => {
  const history = useHistory();

  return (
    <Container className={className}>
      <RowContainer>
        <LeftContainer>
          <HeaderItem headerItemStyle={{ marginTop: '4px', zIndex: 5 }}>
            <PopupContentList withoutAccountInfo items={menuItems} icon={<HamburgerIcon />} className="hamburger" />
          </HeaderItem>
          <KaddexLetterLogo onClick={() => history.push(ROUTE_SWAP)} />
        </LeftContainer>

        {/* <GameEditionModeButton /> */}
        <RightContainer>
          <RightHeaderItems />
        </RightContainer>
      </RowContainer>
      <span className="mainnet-chain-2 mobile-only">Mainnet Chain 2</span>
    </Container>
  );
};

export default MobileHeader;
