import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import abi from './utils/abi.json';

export default function App() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [string, setString] = useState('');
  const [allWaves, setAllWaves] = useState([]);

  const contractAddress = '0xf995a021775EB6f69fB4f7DAE7f0e7DD04555f91';
  const contractABI = abi.abi;

  const getAllWaves = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer,
        );
        const waves = await wavePortalContract.getAllWaves();

        const wavesCleaned = waves.map((wave) => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log('Non-existent Ethereum object!');
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log('NewWave', from, timestamp, message);
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer,
      );
      wavePortalContract.on('NewWave', onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off('NewWave', onNewWave);
      }
    };
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('You do not have MetaMask installed');
        return;
      } else {
        console.log('Ethereum object found', ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Authorized account found:', account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log('Authorized account not found!');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Use a crypto wallet\nhttps://metamask.io/');
        window.open('https://metamask.io/', '_blank');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer,
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log(
          'Retrieved the number of messages sent...',
          count.toNumber(),
        );

        const waveTxn = await wavePortalContract.wave(string, {
          gasLimit: 300000,
        });
        console.log('Loading...', waveTxn.hash);

        await waveTxn.wait();
        console.log('Success -- ', waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log('Total messages received...', count.toNumber());
      } else {
        console.log('Ethereum object not found!');
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">🔥 Send Message 🔥</div>

        <div className="bio">Send us a message with Ethereum and you could be the lucky one to win Ethereum.</div>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet 🪙
          </button>
        )}

        {currentAccount && (
          <div className="input">
            <textarea
              name="input"
              rows="4"
              cols="50"
              maxLength="60"
              className="waveInput"
              placeholder="Send anything..."
              onChange={(event) => setString(event.target.value)}
            />

            <button className="waveButton" onClick={wave}>
            Send Message ✍️
            </button>
          </div>
        )}

        <div className="card">
          {allWaves.map((wave, index) => {
            return (
              <div key={index} className="cardMessage">
                <p>Message:</p>
                <div className="cardMessageText">{wave.message}</div>
                <div className="cardMessageAddress">{wave.address}</div>
                <div className="cardMessageDate">
                  {wave.timestamp.toString()}
                </div>
              </div>
            );
          })}
        </div>

        <footer className="footer">
          <p>
            <a
              href="https://github.com/GuiiHenriq/web3app#readme"
              target="_blank"
            >
              HOW TO USE
            </a>{' '}
            ⚠️
          </p>
        </footer>
      </div>
    </div>
  );
}
