import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, {useCallback, useEffect, useState} from "react";

import {ethers} from 'ethers';

import myEpicNft from './utils/MyEpicNFT.json';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const checkIfWalletIsConnected = useCallback(async () => {
    const {ethereum} = window;

    if(ethereum) {
      console.log('We have the ethereum object!', ethereum);
    } else {
      console.log('Please get Metamask!');
    }

    const accounts = await ethereum.request({method: 'eth_accounts'});

    if (accounts.length) {
      const account = accounts[0];
      console.log('Found an authorized account: ', account);
    } else {
      console.log('No authorized account found')
    }
  });

  const connectWallet = useCallback(async () => {
    const {ethereum} = window;
    if (!ethereum) {
      console.log('Get ethereum!')
      return;
    };

    const accounts = await ethereum.request({method: 'eth_requestAccounts'});

    console.log('Connected');
    setCurrentAccount(accounts[0])
  }, [setCurrentAccount])

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const createContract = useCallback(async () => {
    const CONTRACT_ADDRESS = '0xC3A1b00750F3ca50660eB575f4699Aae857771A0';
    const {ethereum} = window;
    try {
      if (!ethereum) {
        console.log('Get ethereum!')
        return;
      };

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicNft.abi,
        signer
      );

      setContract(connectedContract);

      connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
        console.log(from, tokenId.toNumber())
        alert(`Hey there! We've minted your NFT. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: <https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}>`);
      });
    } catch (err) {
      console.error(err);
    }
  }, [setContract]);

  useEffect(() => {
    if (!contract) {
      createContract();
    } else {
      return () => contract.off("NewEpicNFTMinted")
    }
  }, [setContract, contract]);

  const askContractToMintNFT = useCallback(async () => {
    if (!contract) return;
    const CONTRACT_ADDRESS = '0xe510dd37220b22B13A13c1366fDAD403Be5A2378';
    const {ethereum} = window;
    try {
      if (!ethereum) {
        console.log('Get ethereum!')
        return;
      };

      console.log('Going to pop wallet now to pay gas...');
      let txn = await contract.makeAnEpicNFT();

      console.log("Mining...please wait.")
      await txn.wait();

      console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${txn.hash}`);
    } catch (err) {
      console.error(err);
    }
  }, [contract])

  // Render Methods
  const renderNotConnectedContainer = () => (
    !currentAccount ? (
      <button onClick={connectWallet} className="cta-button connect-wallet-button">
        Connect to Wallet
      </button>
    ) : (
      <button onClick={askContractToMintNFT} className="cta-button connect-wallet-button">
        Mint NFT
      </button>
    )
  );

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {renderNotConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
