import React, { useState } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';
import { useHistory } from 'react-router';
import {ROUTE_GAME_EDITION_MENU, ROUTE_SWAP } from '../../router/routes';
import { GameEditionWrapper } from './GameEditionWrapper';


const MainContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  margin-top: 5%;
`

const ContentContainer = styled.div`

    width: 100%;
    height:100%;
    border-radius: 24px;
    background: rgb(254,251,102);
    background: linear-gradient(180deg, rgba(254,251,102,1) 35%, rgba(255,54,208,1) 100%);
    display: flex;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    font-weight: 500;
    font-size: larger;
`




const GameEditionContainer = ({children}) => {

  const history = useHistory()
    // const [message, setmessage] = useState("I'm swap Button");

    // d3.select("#start_button").style("cursor","pointer").on("click",()=>setmessage("I'm swap Button"))
    // d3.select("#select_button").style("cursor","pointer").on("click",()=>setmessage("I'm Menu Button"))
    // d3.select("#left_button").style("cursor","pointer").on("click",()=>setmessage("I'm Left Button"))
    // d3.select("#right_button").style("cursor","pointer").on("click",()=>setmessage("I'm Right Button"))
    // d3.select("#power_button").style("cursor","pointer").on("click",()=>setmessage("I'm Power Button"))
    // d3.select("#a_button").style("cursor","pointer").on("click",()=>setmessage("I'm A Button"))
    // d3.select("#b_button").style("cursor","pointer").on("click",()=>setmessage("I'm B Button"))




    return (
        <MainContainer>
            <GameEditionWrapper selectLabel="MENU" selectOnClick={()=>history.push(ROUTE_GAME_EDITION_MENU)} startLabel="SWAP" startOnClick={()=>history.push(ROUTE_SWAP)}  >
            <ContentContainer >
                {children}
            </ContentContainer>
            </GameEditionWrapper>


        </MainContainer>
    );
};

export default GameEditionContainer;