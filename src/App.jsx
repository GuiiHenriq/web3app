import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import abi from './utils/abi.json';

export default function App() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [string, setString] = useState('');
  const [allWaves, setAllWaves] = useState([]);

  const contractAddress = '0xF406f54D027500977bB27D85D4338197b52d9AA7';
  const contractABI = abi.abi;

  const getAllWaves = async () => {
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

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });
        setAllWaves(wavesCleaned);
      } else {
        console.log('Objeto Ethereum não existe!');
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
        console.log('Garanta que possua a Metamask instalada!');
        return;
      } else {
        console.log('Temos o objeto ethereum', ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Encontrada a conta autorizada:', account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log('Nenhuma conta autorizada foi encontrada');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('MetaMask encontrada!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Conectado', accounts[0]);
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
        console.log('Recuperado o número de tchauzinhos...', count.toNumber());

        console.log(string);
        const waveTxn = await wavePortalContract.wave(string);
        console.log('Minerando...', waveTxn.hash);

        await waveTxn.wait();
        console.log('Minerado -- ', waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log('Total de tchauzinhos recuperado...', count.toNumber());
      } else {
        console.log('Objeto Ethereum não encontrado!');
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
        <div className="header">🏄 Hey Guys!</div>

        <div className="bio">I'm Gui and this is my first App on WEB3.</div>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet 🪙
          </button>
        )}

        <input
          type="text"
          className="waveInput"
          placeholder="Send anything..."
          onChange={(event) => setString(event.target.value)}
        />

        <button className="waveButton" onClick={wave}>
        Talk to Me ✍️
        </button>

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
      </div>
    </div>
  );
}
